/**
 * SMART QUIZ PARSER SERVICE
 * Tự động phân tích văn bản thô (Word, PDF, ChatGPT, Markdown) thành cấu trúc JSON chuẩn.
 * Hỗ trợ 100% các ký tự đặc biệt, công thức toán học, ký hiệu hóa học, markdown (*, **, `, @, #, $, %, ^, &, *, (), [], {}, :, ", ', <, >, ?, /, \...).
 */
const SmartParserService = {
  /**
   * Chuyển đổi chuỗi có ký tự đặc biệt và markdown thành HTML an toàn để hiển thị
   */
  formatRichText(str) {
    if (!str) return "";
    let s = String(str);

    // 1. Mã hóa an toàn các thẻ HTML để tránh lỗi vỡ DOM hoặc XSS
    let escaped = s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // 2. Chuyển đổi Markdown Bold: **text** hoặc __text__
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // 3. Chuyển đổi Markdown Italic: *text* hoặc _text_ (chỉ khi không phải dấu hoa thị đơn lẻ)
    escaped = escaped.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
    escaped = escaped.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g, '$1<em>$2</em>$3');

    // 4. Chuyển đổi Markdown Inline Code: `code`
    escaped = escaped.replace(/`([^`\n]+)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');

    // 5. Chuyển đổi xuống dòng
    escaped = escaped.replace(/\n/g, '<br>');

    return escaped;
  },

  /**
   * Phân tích văn bản thô thành mảng câu hỏi
   * @param {string} rawText - Văn bản thô do người dùng dán vào
   * @param {string} defaultChapterId - Mã chương mặc định
   * @returns {Object} { questions: Array, errors: Array, totalParsed: number }
   */
  parseRawText(rawText, defaultChapterId = "c1") {
    if (!rawText || !rawText.trim()) {
      return { questions: [], errors: [], totalParsed: 0 };
    }

    // Chuẩn hóa xuống dòng
    const text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const questions = [];
    const errors = [];

    // Tách các câu hỏi dựa trên tiêu đề mở đầu câu:
    // Hỗ trợ: "Câu 1:", "**Câu 1:**", "*Câu 1*", "Bài 1:", "[Câu 1]", "1.", "1/ ", "1) "
    const questionSplits = text.split(/(?=(?:(?:\n|\A)\s*(?:\*{0,2}(?:Câu|Bài|Question)\s*\d+[\s\.:\*\-\]]+|\b\d+\s*[\.)]\s+|\[(?:Câu\s*)?\d+\])))/i);

    let currentChapter = defaultChapterId;

    questionSplits.forEach((block, blockIdx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      // Kiểm tra nếu khối chứa tiêu đề chương (VD: "Chương 1:", "Chương 2 -")
      const chapterMatch = trimmedBlock.match(/(?:Chương|Chapter)\s*(\d+)/i);
      if (chapterMatch) {
        currentChapter = `c${chapterMatch[1]}`;
      }

      // Xử lý khối câu hỏi
      const parsedQ = this.parseSingleQuestionBlock(trimmedBlock, blockIdx + 1, currentChapter);
      if (parsedQ.success) {
        questions.push(parsedQ.data);
      } else if (parsedQ.error) {
        // Chỉ ghi nhận lỗi nếu khối thực sự là một câu hỏi
        if (/(?:câu|bài|\b[A-E]\s*[\.\)])/i.test(trimmedBlock)) {
          errors.push(`Vị trí ${blockIdx + 1}: ${parsedQ.error}`);
        }
      }
    });

    return {
      questions,
      errors,
      totalParsed: questions.length
    };
  },

  /**
   * Phân tích một khối câu hỏi đơn lẻ
   */
  parseSingleQuestionBlock(block, index, chapterId) {
    const rawLines = block.split("\n");
    if (rawLines.length === 0) return { success: false };

    let questionTitle = "";
    let options = [];
    let answerIndex = -1;
    let globalExplanation = "";

    // 1. Tách dòng câu hỏi và các dòng lựa chọn
    // Tìm vị trí dòng đầu tiên bắt đầu một phương án (A. hoặc *A. hoặc <u>A.</u> hoặc [x] A. hoặc [A] hoặc A) )
    let firstOptionLineIdx = -1;
    const optionStartPattern = /^\s*(?:\*\s*|<u>|<ins>|\[x\]\s*|\(x\)\s*|\[Đúng\]\s*)?(?:\*{0,2}|_{0,2}|<u>|<ins>)?\[?([A-Ea-e])\]?(?:<\/u>|<\/ins>)?[\.\)\:\*\_]*(?:<\/u>|<\/ins>)?\s+/i;

    for (let i = 0; i < rawLines.length; i++) {
      if (optionStartPattern.test(rawLines[i])) {
        firstOptionLineIdx = i;
        break;
      }
    }

    if (firstOptionLineIdx === -1) {
      return { success: false, error: "Không tìm thấy các lựa chọn A, B, C, D." };
    }

    // Tất cả các dòng trước firstOptionLineIdx là nội dung câu hỏi (hỗ trợ câu hỏi nhiều dòng, thơ, công thức)
    const questionLines = rawLines.slice(0, firstOptionLineIdx);
    let rawQuestionText = questionLines.join("\n").trim();

    // Làm sạch tiền tố câu hỏi (như "Câu 1:", "**Câu 1:**", "1.") nhưng giữ nguyên nội dung và ký tự đặc biệt bên trong
    rawQuestionText = rawQuestionText.replace(/^\s*\*{0,2}(?:Câu|Bài|Question)?\s*\[?(?:\d+|[A-Za-z]\d+)\]?\s*[\.:\*\-\]]*\s*/i, "");
    questionTitle = rawQuestionText.trim();

    if (!questionTitle) {
      questionTitle = `Câu hỏi số ${index}`;
    }

    // 2. Tìm đáp án cuối bài nếu có (VD: "Đáp án: A", "> Đáp án: B", "Key: C", "Đ/A: D", "**Đáp án:** A")
    const answerMatch = block.match(/(?:(?:\n|\A)\s*(?:>|\/{2}|\*|_)*\s*(?:Đáp án|Đ\/A|Key|Answer|ĐA)\s*[\.:\*\-]?\s*\*{0,2}([A-Ea-e])\*{0,2})/i);
    if (answerMatch) {
      const letter = answerMatch[1].toUpperCase();
      answerIndex = letter.charCodeAt(0) - 65; // A -> 0, B -> 1, C -> 2, D -> 3, E -> 4
    }

    // 3. Tìm giải thích chung nếu có (VD: "Giải thích: ...", "> **Giải thích:** ...", "Lời giải: ...")
    const explMatch = block.match(/(?:(?:\n|\A)\s*(?:>|\/{2}|\*|_)*\s*(?:Giải thích|Lời giải|Note|HD|Hướng dẫn giải)\s*[\.:\*\-]?\s*([\s\S]+?))(?=(?:\n\s*(?:>|\*{0,2})?(?:Câu|Bài|\d+[\.)])|$))/i);
    if (explMatch) {
      globalExplanation = explMatch[1].trim();
    }

    // 4. Tách các lựa chọn A, B, C, D, E
    const optionLines = rawLines.slice(firstOptionLineIdx);
    const rawOptions = [];
    let currentOption = null;

    optionLines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Bỏ qua dòng Đáp án / Giải thích ở cuối
      if (/^(?:>|\/{2}|\*|_)*\s*(?:Đáp án|Đ\/A|Key|Answer|Giải thích|Lời giải|HD)/i.test(trimmedLine)) {
        return;
      }

      const optMatch = trimmedLine.match(optionStartPattern);
      if (optMatch) {
        if (currentOption) {
          rawOptions.push(currentOption);
        }
        const letter = optMatch[1].toUpperCase();
        // Lấy nội dung sau ký tự đánh dấu A., B., C...
        let content = trimmedLine.replace(optionStartPattern, "").trim();
        const hasAsteriskPrefix = /^\s*(?:\*|\[x\]|\(x\)|\[Đúng\]|<u>|<ins>|_)/i.test(trimmedLine) ||
                                 /<u>\s*([A-Ea-e])\s*<\/u>/i.test(trimmedLine) ||
                                 /<\/(?:u|ins)>/.test(trimmedLine) ||
                                 /<font\s+color=['"]?red['"]?/i.test(trimmedLine) ||
                                 /color:\s*red/i.test(trimmedLine);

        currentOption = {
          letter,
          content,
          rawLine: trimmedLine,
          hasAsteriskPrefix
        };
      } else if (currentOption) {
        // Dòng tiếp theo thuộc cùng 1 option (nhiều dòng)
        currentOption.content += "\n" + trimmedLine;
      }
    });

    if (currentOption) {
      rawOptions.push(currentOption);
    }

    if (rawOptions.length < 2) {
      return { success: false, error: "Không tìm thấy đủ ít nhất 2 phương án lựa chọn." };
    }

    // 5. Phân tích chi tiết từng option (Text, isCorrect, Note)
    rawOptions.forEach((ro, oi) => {
      let text = ro.content;
      let isCorrect = ro.hasAsteriskPrefix || false;
      let note = "";

      // Kiểm tra hậu tố đánh dấu đúng: [Đúng], (Đúng), (Đáp án đúng), hoặc dấu * ở cuối
      if (/(?:\[Đúng\]|\(Đúng\)|\(Đáp án đúng\)|\*)$/i.test(text)) {
        isCorrect = true;
        text = text.replace(/(?:\[Đúng\]|\(Đúng\)|\(Đáp án đúng\)|\*)$/i, "").trim();
      }

      // Làm sạch thẻ HTML gạch chân còn sót lại ở nội dung
      text = text.replace(/<\/?(?:u|ins|font|span)[^>]*>/gi, "").trim();

      // Kiểm tra cú pháp inline:
      // "A. Nội dung > Đúng: Giải thích" hoặc "A. Nội dung > **Đúng**: Giải thích"
      // "A. Nội dung > Sai: Giải thích" hoặc "A. Nội dung // Sai: Giải thích"
      const inlineCorrectMatch = text.match(/(?:>|\/{2}|\/\/|\(|\b)\s*\*{0,2}(Đúng|True|Chính xác|Correct)\*{0,2}\s*[\.:\-]?\s*([\s\S]*)/i);
      const inlineWrongMatch = text.match(/(?:>|\/{2}|\/\/|\(|\b)\s*\*{0,2}(Sai|False|Chưa đúng|Incorrect)\*{0,2}\s*[\.:\-]?\s*([\s\S]*)/i);

      if (inlineCorrectMatch) {
        isCorrect = true;
        text = text.slice(0, inlineCorrectMatch.index).trim();
        // Bỏ ký tự phân cách ở cuối text như '>', '//'
        text = text.replace(/(?:>|\/{2}|\/\/|\()$/, "").trim();
        note = inlineCorrectMatch[2] ? inlineCorrectMatch[2].replace(/\)$/, "").trim() : "Đáp án chính xác.";
      } else if (inlineWrongMatch) {
        isCorrect = false;
        text = text.slice(0, inlineWrongMatch.index).trim();
        text = text.replace(/(?:>|\/{2}|\/\/|\()$/, "").trim();
        note = inlineWrongMatch[2] ? inlineWrongMatch[2].replace(/\)$/, "").trim() : "Đáp án chưa chính xác.";
      }

      // Làm sạch ký tự phân cách thừa đầu dòng
      text = text.replace(/^[\-–—\.]\s*/, "").trim();

      options.push({
        text,
        isCorrect,
        note
      });
    });

    // 6. Xác định đáp án đúng cuối cùng
    if (answerIndex >= 0 && answerIndex < options.length) {
      options.forEach((opt, idx) => {
        opt.isCorrect = (idx === answerIndex);
      });
    } else {
      const foundIdx = options.findIndex(o => o.isCorrect);
      if (foundIdx >= 0) {
        answerIndex = foundIdx;
      } else {
        // Mặc định A nếu đề không đánh dấu
        answerIndex = 0;
        options[0].isCorrect = true;
      }
    }

    // Nếu có giải thích chung mà đáp án đúng chưa có note thì gán vào
    if (globalExplanation && options[answerIndex] && !options[answerIndex].note) {
      options[answerIndex].note = globalExplanation;
    }

    const questionObj = {
      id: `Q-${Date.now().toString().slice(-4)}${index}`,
      chapterId: chapterId || "c1",
      question: questionTitle,
      options,
      answerIndex
    };

    return { success: true, data: questionObj };
  },

  // ── TRÍCH XUẤT VĂN BẢN TỪ TỆP TIN (.TXT, .DOCX, .PDF, .MD, .JSON, .CSV) ──
  async extractTextFromFile(file) {
    if (!file) throw new Error("Vui lòng chọn tệp tin!");
    const ext = file.name.split('.').pop().toLowerCase();

    // 1. Tệp văn bản thuần (.txt, .md, .csv, .json, .text)
    if (['txt', 'md', 'csv', 'json', 'text'].includes(ext)) {
      return await this.readPlainTextFile(file);
    }

    // 2. Tệp Word (.docx)
    if (ext === 'docx') {
      return await this.extractTextFromDocx(file);
    }

    // 3. Tệp PDF (.pdf text)
    if (ext === 'pdf') {
      return await this.extractTextFromPdf(file);
    }

    // Mặc định thử đọc văn bản thuần
    return await this.readPlainTextFile(file);
  },

  readPlainTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || "");
      reader.onerror = (err) => reject(new Error("Lỗi khi đọc tệp văn bản: " + err));
      reader.readAsText(file, "UTF-8");
    });
  },

  async extractTextFromDocx(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          const uint8 = new Uint8Array(buffer);
          const xmlText = await this.unzipDocxDocumentXml(uint8);
          if (!xmlText) {
            throw new Error("Không tìm thấy nội dung văn bản (word/document.xml) trong tệp DOCX!");
          }
          const text = this.parseDocxXmlToText(xmlText);
          resolve(text);
        } catch (err) {
          reject(new Error("Không thể trích xuất file Word DOCX: " + err.message));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  async unzipDocxDocumentXml(data) {
    let pos = 0;
    const len = data.length;

    while (pos < len - 4) {
      if (data[pos] === 0x50 && data[pos + 1] === 0x4B && data[pos + 2] === 0x03 && data[pos + 3] === 0x04) {
        const method = data[pos + 8] | (data[pos + 9] << 8);
        const cSize = data[pos + 18] | (data[pos + 19] << 8) | (data[pos + 20] << 16) | (data[pos + 21] << 24);
        const fnLen = data[pos + 26] | (data[pos + 27] << 8);
        const exLen = data[pos + 28] | (data[pos + 29] << 8);

        const fnBytes = data.subarray(pos + 30, pos + 30 + fnLen);
        const fn = new TextDecoder('utf-8').decode(fnBytes);
        const dataStart = pos + 30 + fnLen + exLen;

        if (fn === "word/document.xml") {
          const compressed = data.subarray(dataStart, dataStart + (cSize >>> 0));
          if (method === 0) {
            return new TextDecoder('utf-8').decode(compressed);
          } else if (method === 8) {
            if (typeof DecompressionStream !== "undefined") {
              try {
                const ds = new DecompressionStream('deflate-raw');
                const writer = ds.writable.getWriter();
                writer.write(compressed);
                writer.close();
                const response = new Response(ds.readable);
                const arrayBuf = await response.arrayBuffer();
                return new TextDecoder('utf-8').decode(arrayBuf);
              } catch (e1) {
                try {
                  const ds2 = new DecompressionStream('deflate');
                  const writer2 = ds2.writable.getWriter();
                  writer2.write(compressed);
                  writer2.close();
                  const response2 = new Response(ds2.readable);
                  const arrayBuf2 = await response2.arrayBuffer();
                  return new TextDecoder('utf-8').decode(arrayBuf2);
                } catch (e2) {
                  console.warn("Decompress error:", e2);
                }
              }
            }
          }
        }
        pos = dataStart + (cSize >>> 0);
      } else {
        pos += 1;
      }
    }
    return null;
  },

  parseDocxXmlToText(xmlStr) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlStr, "application/xml");
      const paragraphs = doc.getElementsByTagName("w:p");
      const lines = [];

      const RED_COLORS = [
        "ff0000", "red", "c00000", "ed1c24", "e00000", "f00", "d32f2f", "b71c1c", "cc0000", "e11d48", "dc2626"
      ];

      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const runs = p.getElementsByTagName("w:r");
        let lineText = "";
        let isOptionMarkedCorrect = false;

        for (let j = 0; j < runs.length; j++) {
          const r = runs[j];
          const rPr = r.getElementsByTagName("w:rPr")[0];
          let isUnderlined = false;
          let isRed = false;
          let isHighlighted = false;

          if (rPr) {
            // Kiểm tra thẻ gạch chân <w:u>
            const u = rPr.getElementsByTagName("w:u")[0];
            if (u) {
              const uVal = u.getAttribute("w:val");
              if (!uVal || uVal !== "none") {
                isUnderlined = true;
              }
            }

            // Kiểm tra thẻ màu chữ <w:color>
            const color = rPr.getElementsByTagName("w:color")[0];
            if (color) {
              const colorVal = (color.getAttribute("w:val") || "").toLowerCase().trim();
              if (RED_COLORS.some(rc => colorVal.includes(rc))) {
                isRed = true;
              }
            }

            // Kiểm tra thẻ highlight <w:highlight>
            const highlight = rPr.getElementsByTagName("w:highlight")[0];
            if (highlight) {
              const hVal = (highlight.getAttribute("w:val") || "").toLowerCase().trim();
              if (["red", "yellow", "green", "cyan", "magenta"].includes(hVal)) {
                isHighlighted = true;
              }
            }
          }

          const textNodes = r.getElementsByTagName("w:t");
          let runText = "";
          for (let k = 0; k < textNodes.length; k++) {
            runText += textNodes[k].textContent;
          }

          // Nếu run chứa ký tự hoặc text được gạch chân / tô đỏ / highlight
          if (runText && (isUnderlined || isRed || isHighlighted)) {
            isOptionMarkedCorrect = true;
          }

          lineText += runText;
        }

        const trimmed = lineText.trim();
        if (trimmed) {
          // Nếu dòng là phương án A, B, C, D và được gạch chân hoặc tô đỏ
          const isOptionLine = /^\s*(?:\*\s*)?(?:\*{0,2})\[?([A-Ea-e])\]?[\.\)\:\*]/.test(trimmed);
          if (isOptionLine && isOptionMarkedCorrect && !trimmed.startsWith("*")) {
            lines.push(`* ${trimmed}`);
          } else {
            lines.push(trimmed);
          }
        }
      }
      return lines.join("\n");
    } catch (e) {
      return xmlStr
        .replace(/<\/w:p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/\n\s*\n/g, "\n")
        .trim();
    }
  },

  async extractTextFromPdf(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          const uint8 = new Uint8Array(buffer);
          const rawStr = new TextDecoder('utf-8', { fatal: false }).decode(uint8);

          let extractedLines = [];

          // Trích xuất các luồng stream text Tj / TJ
          const tjMatches = rawStr.match(/\(([^)]+)\)\s*Tj/g) || [];
          tjMatches.forEach(m => {
            const text = m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').replace(/\\([()\\])/g, '$1');
            if (text.trim()) extractedLines.push(text.trim());
          });

          const arrayTjMatches = rawStr.match(/\[([^\]]+)\]\s*TJ/g) || [];
          arrayTjMatches.forEach(m => {
            const inner = m.replace(/^\[/, '').replace(/\]\s*TJ$/, '');
            const strParts = inner.match(/\(([^)]*)\)/g) || [];
            const fullLine = strParts.map(s => s.replace(/^\(/, '').replace(/\)$/, '').replace(/\\([()\\])/g, '$1')).join('');
            if (fullLine.trim()) extractedLines.push(fullLine.trim());
          });

          if (extractedLines.length > 0) {
            resolve(extractedLines.join("\n"));
            return;
          }

          // Fallback: Tìm các câu hỏi dạng text
          const textChunks = rawStr.match(/(?:Câu|Bài|Question|\b[A-D]\s*[\.\)])[^\r\n]{5,150}/g);
          if (textChunks && textChunks.length > 0) {
            resolve(textChunks.join("\n"));
            return;
          }

          resolve("⚠️ Không thể trích xuất văn bản từ tệp PDF này (có thể là tệp PDF dạng ảnh scan). Vui lòng chuyển sang định dạng Word (.docx) hoặc sao chép văn bản (.txt) để phân tích tốt nhất.");
        } catch (err) {
          reject(new Error("Lỗi khi đọc tệp PDF: " + err.message));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
};
