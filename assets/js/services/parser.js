/**
 * SMART QUIZ PARSER SERVICE (v3.1.4)
 * Tự động phân tích văn bản thô (Word, PDF, Excel, Text, Markdown) thành cấu trúc JSON chuẩn.
 * Tích hợp ủy quyền trực tiếp sang lõi ParserEngine độc lập.
 */
var SmartParserService = {
  /**
   * Lấy instance của ParserEngine độc lập
   */
  get engine() {
    if (typeof ParserEngine !== "undefined") return ParserEngine;
    if (typeof window !== "undefined" && window.ParserEngine) return window.ParserEngine;
    if (typeof globalThis !== "undefined" && globalThis.ParserEngine) return globalThis.ParserEngine;
    return null;
  },

  /**
   * Chuyển đổi chuỗi có ký tự đặc biệt và markdown thành HTML an toàn để hiển thị
   */
  formatRichText(str) {
    if (this.engine && typeof this.engine.formatRichText === "function") {
      return this.engine.formatRichText(str);
    }
    return str || "";
  },

  /**
   * Tự động nhận diện công thức toán học, hóa học
   */
  formatFormula(str) {
    if (this.engine && typeof this.engine.formatFormula === "function") {
      return this.engine.formatFormula(str);
    }
    return str || "";
  },

  /**
   * Chuyển đổi ký tự chữ cái (A, B, C, D, Đ, E) sang chỉ số mảng (0, 1, 2, 3, 4)
   */
  letterToIndex(letter) {
    if (this.engine && typeof this.engine.letterToIndex === "function") {
      return this.engine.letterToIndex(letter);
    }
    return -1;
  },

  /**
   * Chuyển đổi chỉ số mảng sang chữ cái (A, B, C, D, E)
   */
  indexToLetter(idx) {
    if (this.engine && typeof this.engine.indexToLetter === "function") {
      return this.engine.indexToLetter(idx);
    }
    return "A";
  },

  /**
   * Nối các dòng ngắt gãy bên trong một chuỗi văn bản
   */
  cleanInlineBrokenText(str) {
    if (this.engine && typeof this.engine.cleanInlineBrokenText === "function") {
      return this.engine.cleanInlineBrokenText(str);
    }
    return str || "";
  },

  /**
   * Trích xuất bảng đáp án tổng hợp (Answer Key) nếu có trong tài liệu
   */
  extractGlobalAnswerKey(text) {
    if (this.engine && typeof this.engine.extractGlobalAnswerKey === "function") {
      return this.engine.extractGlobalAnswerKey(text);
    }
    return {};
  },

  /**
   * Phân tích văn bản thô thành mảng câu hỏi
   */
  parseRawText(rawText, defaultChapterId = "c1") {
    if (this.engine && typeof this.engine.parse === "function") {
      return this.engine.parse(rawText, defaultChapterId);
    }
    return { questions: [], warnings: [], errors: ["Không tìm thấy ParserEngine"], totalParsed: 0 };
  },

  /**
   * Phân tích một khối câu hỏi đơn lẻ
   */
  parseSingleQuestionBlock(block, index, chapterId) {
    if (this.engine && typeof this.engine.parseSingleBlock === "function") {
      return this.engine.parseSingleBlock(block, index, chapterId);
    }
    return { success: false, error: "Không tìm thấy ParserEngine" };
  },

  /**
   * Chuẩn hóa văn bản tài liệu trích xuất từ PDF/Word trước khi đưa vào Textarea
   */
  formatExtractedDocumentText(rawText) {
    if (this.engine && typeof this.engine.formatExtractedDocumentText === "function") {
      return this.engine.formatExtractedDocumentText(rawText);
    }
    return rawText || "";
  },

  // ── TRÍCH XUẤT VĂN BẢN TỪ TỆP TIN (.TXT, .DOCX, .PDF, .MD, .JSON, .CSV) ──
  async extractTextFromFile(file) {
    if (!file) throw new Error("Vui lòng chọn tệp tin!");
    const ext = file.name.split('.').pop().toLowerCase();
    let rawText = "";

    // 1. Tệp văn bản thuần (.txt, .md, .csv, .json, .text)
    if (['txt', 'md', 'csv', 'json', 'text'].includes(ext)) {
      rawText = await this.readPlainTextFile(file);
    }
    // 2. Tệp Word (.docx)
    else if (ext === 'docx') {
      rawText = await this.extractTextFromDocx(file);
    }
    // 3. Tệp PDF (.pdf) - Ủy quyền sang mô-đun chuyên biệt PdfExtractor (pdf-extractor.js)
    else if (ext === 'pdf') {
      let extractor = (typeof PdfExtractor !== "undefined" && typeof PdfExtractor.extractText === "function") 
        ? PdfExtractor 
        : ((typeof window !== "undefined" && window.PdfExtractor && typeof window.PdfExtractor.extractText === "function") ? window.PdfExtractor : null);

      if (!extractor && typeof document !== "undefined") {
        try {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "assets/js/services/pdf-extractor.js?v=" + Date.now();
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Không thể tải assets/js/services/pdf-extractor.js"));
            document.head.appendChild(script);
          });
          if (typeof window !== "undefined" && window.PdfExtractor) {
            extractor = window.PdfExtractor;
          } else if (typeof PdfExtractor !== "undefined") {
            extractor = PdfExtractor;
          }
        } catch (loadErr) {
          console.warn("Dynamic load pdf-extractor.js failed:", loadErr);
        }
      }

      if (extractor && typeof extractor.extractText === "function") {
        rawText = await extractor.extractText(file);
      } else {
        throw new Error("Mô-đun trích xuất PDF (PdfExtractor) chưa được tải. Vui lòng tải lại trang (Ctrl + F5)!");
      }
    } else {
      rawText = await this.readPlainTextFile(file);
    }

    // Trả về văn bản thô nguyên bản trích xuất từ tệp tin
    return rawText;
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

  /**
   * Nhận diện phạm vi dải màu Đỏ - Đỏ Cam - Đỏ Rượu - Hồng Đỏ (Red Spectrum) trong MS Word:
   * Sử dụng giải thuật phân tích kênh màu RGB để bao quát 100% các tông màu mắt thường nhìn thấy là Đỏ
   */
  isRedOrWarmAnswerColor(colorVal) {
    if (!colorVal) return false;
    const v = colorVal.toLowerCase().trim().replace(/^#/, "");

    // 1. Tên màu trực tiếp
    if (["red", "darkred", "crimson", "firebrick", "indianred", "tomato", "orangered"].includes(v)) {
      return true;
    }

    // 2. Chuyển đổi mã Hex RGB
    let hex = v;
    if (hex.length === 3) {
      hex = hex.split("").map(c => c + c).join("");
    }
    if (hex.length !== 6) return false;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false;

    // 3. Quy tắc nhận diện dải màu Đỏ - Đỏ Cam - Đỏ Rượu:
    // - Sắc đỏ (R) phải đủ nổi bật (>= 120), loại bỏ chữ màu đen hoặc xám thông thường
    // - Sắc đỏ (R) phải áp đảo sắc xanh lá (G) và xanh dương (B) ít nhất 30%
    if (r >= 120 && r > g * 1.3 && r > b * 1.3) {
      return true;
    }
    // Hồng đỏ / Rose / Magenta (R cao, G thấp)
    if (r >= 150 && r > g * 1.5) {
      return true;
    }

    return false;
  },

  parseDocxXmlToText(xmlStr) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlStr, "application/xml");
      const paragraphs = doc.getElementsByTagName("w:p");
      const lines = [];

      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const runs = p.getElementsByTagName("w:r");

        let currentLine = "";
        let currentMarked = false;

        for (let j = 0; j < runs.length; j++) {
          const r = runs[j];
          const rPr = r.getElementsByTagName("w:rPr")[0];
          let isUnderlined = false;
          let isRed = false;
          let isHighlighted = false;

          if (rPr) {
            // 1. Kiểm tra thẻ gạch chân <w:u>
            const u = rPr.getElementsByTagName("w:u")[0];
            if (u) {
              const uVal = u.getAttribute("w:val");
              if (!uVal || (uVal !== "none" && uVal !== "0")) {
                isUnderlined = true;
              }
            }

            // 2. Kiểm tra thẻ màu chữ ĐỎ / ĐỎ CAM / ĐỎ RƯỢU theo dải màu RGB
            const color = rPr.getElementsByTagName("w:color")[0];
            if (color) {
              const colorVal = color.getAttribute("w:val");
              if (this.isRedOrWarmAnswerColor(colorVal)) {
                isRed = true;
              }
            }

            // 3. Kiểm tra thẻ highlight màu <w:highlight>
            const highlight = rPr.getElementsByTagName("w:highlight")[0];
            if (highlight) {
              const hVal = (highlight.getAttribute("w:val") || "").toLowerCase().trim();
              if (hVal && ["yellow", "red", "green", "cyan", "magenta"].includes(hVal)) {
                isHighlighted = true;
              }
            }
          }

          const textNodes = r.getElementsByTagName("w:t");
          let runText = "";
          for (let k = 0; k < textNodes.length; k++) {
            runText += textNodes[k].textContent;
          }

          // Chỉ xem xét định dạng nếu đoạn text có ký tự thực sự (loại bỏ hoàn toàn khoảng trắng, tab, xuống dòng rác)
          const hasChars = runText.trim().length > 0;
          const isRunCorrect = hasChars && (isUnderlined || isRed || isHighlighted);

          // Kiểm tra nếu run bắt đầu bằng 1 phương án B, C, D, Đ mới
          if (/^\s*\[?([B-EĐđ])\]?[\.\)\:]\s+/.test(runText)) {
            if (currentLine.trim()) {
              const trimmed = currentLine.trim();
              const isOpt = /^\s*\[?([A-Ea-eĐđ])\]?[\.\)\:\*\_]/.test(trimmed);
              if (isOpt && currentMarked) {
                lines.push(`${trimmed} > Đúng`);
              } else {
                lines.push(trimmed);
              }
            }
            currentLine = runText;
            currentMarked = isRunCorrect;
          } else {
            // Kiểm tra ranh giới phương án bên trong runText
            const parts = runText.split(/((?:[\t\s]{2,}|\s+)(?=[B-EĐđ][\.\)\:]\s+))/);
            for (let pIdx = 0; pIdx < parts.length; pIdx++) {
              const part = parts[pIdx];
              if (!part) continue;
              if (/^(?:[\t\s]{2,}|\s+)(?=[B-EĐđ][\.\)\:]\s+)/.test(part)) {
                if (currentLine.trim()) {
                  const trimmed = currentLine.trim();
                  const isOpt = /^\s*\[?([A-Ea-eĐđ])\]?[\.\)\:\*\_]/.test(trimmed);
                  if (isOpt && currentMarked) {
                    lines.push(`${trimmed} > Đúng`);
                  } else {
                    lines.push(trimmed);
                  }
                }
                currentLine = part.replace(/^[\t\s]+/, "");
                currentMarked = isRunCorrect;
              } else {
                currentLine += part;
                if (isRunCorrect) {
                  currentMarked = true;
                }
              }
            }
          }
        }

        if (currentLine.trim()) {
          const trimmed = currentLine.trim();
          const isOpt = /^\s*\[?([A-Ea-eĐđ])\]?[\.\)\:\*\_]/.test(trimmed);
          if (isOpt && currentMarked) {
            lines.push(`${trimmed} > Đúng`);
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

  /**
   * Chuyển đổi mảng đối tượng câu hỏi thành chuỗi văn bản thô (Word/Text style)
   * Định dạng chuẩn:
   * Câu 1: Nội dung câu hỏi...
   * A. Phương án 1
   * B. Phương án 2 > Đúng
   * C. Phương án 3
   * D. Phương án 4
   * Giải thích: Ghi chú giải thích nếu có
   */
  questionsToRawText(questions) {
    if (!questions || !Array.isArray(questions) || questions.length === 0) return "";
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    return questions.map((q, idx) => {
      let lines = [];
      const qNum = idx + 1;
      const qText = (q.question || "").trim();
      lines.push(`Câu ${qNum}: ${qText}`);

      const options = q.options || [];
      const answerIndex = (typeof q.answerIndex === "number") ? q.answerIndex : 0;
      let noteFound = "";

      options.forEach((opt, oi) => {
        const letter = letters[oi] || "A";
        let optText = "";
        let optNote = "";
        let isCorrect = false;

        if (typeof opt === "string") {
          optText = opt.trim();
          isCorrect = (oi === answerIndex);
        } else if (opt && typeof opt === "object") {
          optText = (opt.text || "").trim();
          optNote = (opt.note || "").trim();
          isCorrect = (oi === answerIndex || opt.isCorrect === true);
          if (optNote && (oi === answerIndex || !noteFound)) {
            noteFound = optNote;
          }
        }

        // Khử dấu > đúng thừa nếu đã có sẵn trong text
        optText = optText.replace(/\s*>\s*(?:đúng|dung|chính xác|chinh xac)/gi, "").trim();

        if (isCorrect) {
          lines.push(`${letter}. ${optText} > Đúng`);
        } else {
          lines.push(`${letter}. ${optText}`);
        }
      });

      if (noteFound) {
        lines.push(`Giải thích: ${noteFound}`);
      } else if (q.explanation) {
        lines.push(`Giải thích: ${q.explanation.trim()}`);
      }

      return lines.join("\n");
    }).join("\n\n");
  }
};

// Gắn toàn cục cho trình duyệt
if (typeof window !== "undefined") {
  window.SmartParserService = SmartParserService;
}
if (typeof globalThis !== "undefined") {
  globalThis.SmartParserService = SmartParserService;
}
