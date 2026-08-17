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
  /**
   * Chuyển đổi ký tự chữ cái (A, B, C, D, Đ, E) sang chỉ số mảng (0, 1, 2, 3, 4)
   */
  letterToIndex(letter) {
    if (!letter) return -1;
    const u = letter.toUpperCase().trim();
    if (u === 'A') return 0;
    if (u === 'B') return 1;
    if (u === 'C') return 2;
    if (u === 'D' || u === 'Đ') return 3;
    if (u === 'E') return 4;
    return u.charCodeAt(0) - 65;
  },

  /**
   * Trích xuất bảng đáp án tổng hợp (Answer Key) nếu có trong tài liệu:
   * Hỗ trợ: "BẢNG ĐÁP ÁN: 1. Đ 2. A 3. D" hoặc "1-D, 2-A" hoặc "1.D 2.A"
   */
  extractGlobalAnswerKey(text) {
    const keyMap = {};
    if (!text) return keyMap;

    // CHỈ kích hoạt khi có tiêu đề BẢNG ĐÁP ÁN / ANSWER KEY rõ ràng
    const keySectionMatch = text.match(/(?:(?:^|\n)\s*(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+TRẮC\s+NGHIỆM|ANSWER\s+KEY|KEY\s+ĐÁP\s+ÁN|HƯỚNG\s+DẪN\s+CHẤM)[\s\:\-]+)([\s\S]+)$/i);
    if (!keySectionMatch) {
      return keyMap; // Không có tiêu đề bảng đáp án thì không tự ý đoán mò!
    }

    const searchScope = keySectionMatch[1];
    const matches = searchScope.matchAll(/(?:Câu\s*)?(\d+)\s*[\.\:\-\/]?\s*([A-Ea-eĐđ])\b/gi);
    for (const m of matches) {
      const num = parseInt(m[1], 10);
      keyMap[num] = m[2].toUpperCase();
    }
    return keyMap;
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
    let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const globalAnswerKey = this.extractGlobalAnswerKey(text);

    // Tách các câu hỏi dựa trên tiêu đề mở đầu câu:
    // Hỗ trợ: "Câu 1:", "**Câu 1:**", "*Câu 1*", "Bài 1:", "[Câu 1]", "1.", "1/ ", "1) "
    const questionSplits = text.split(/(?=(?:(?:\n|\A)\s*(?:\*{0,2}(?:Câu|Bài|Question)\s*\d+[\s\.:\*\-\]]+|\b\d+\s*[\.)]\s+|\[(?:Câu\s*)?\d+\])))/i);

    const questions = [];
    const warnings = [];
    const errors = [];
    let currentChapter = defaultChapterId;

    questionSplits.forEach((block, blockIdx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      // Bỏ qua khối bảng đáp án tổng hợp không phải câu hỏi
      if (/^(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+TRẮC\s+NGHIỆM|ANSWER\s+KEY)/i.test(trimmedBlock)) {
        return;
      }

      // Kiểm tra nếu khối chứa tiêu đề chương (VD: "Chương 1:", "Chương 2 -")
      const chapterMatch = trimmedBlock.match(/(?:Chương|Chapter)\s*(\d+)/i);
      if (chapterMatch) {
        currentChapter = `c${chapterMatch[1]}`;
      }

      // Lấy số thứ tự câu hỏi
      const qNumMatch = trimmedBlock.match(/(?:Câu|Bài|Question)?\s*\[?(\d+)\]?/i);
      const qNum = qNumMatch ? parseInt(qNumMatch[1], 10) : (blockIdx + 1);

      // Tiền xử lý an toàn: Tách các lựa chọn A., B., C., D., Đ. bị dính liền trên 1 dòng
      // CHỈ tách SAU KHI phương án A. bắt đầu (để không bao giờ làm hỏng nội dung câu hỏi có chứa A, B, C, D)
      let processedBlock = trimmedBlock;
      const optAIndex = processedBlock.search(/(?:(?:\n|\A)\s*|[\t\s]{2,}|(?<=[\?\:\.\"\'])\s*)\[?A\]?[\.\)\:\*\_]\s+/i);
      if (optAIndex !== -1) {
        const promptPart = processedBlock.slice(0, optAIndex);
        let optionsPart = processedBlock.slice(optAIndex);

        // Tách các phương án B, C, D, Đ, E dính liền trong phần options
        optionsPart = optionsPart
          .replace(/[\t\s]{2,}(?=[B-EĐđ][\.\)\:\*]\s+)/g, "\n")
          .replace(/([a-zA-Z0-9_\)\>\]\"\'])\s*(?=[B-EĐđ][\.\)\:]\s+)/g, "$1\n")
          .replace(/([a-zA-Z0-9_\)\>\]\"\'])(?=[B-EĐđ]\.\s*)/g, "$1\n");

        processedBlock = promptPart + optionsPart;
      }

      // Xử lý khối câu hỏi
      const parsedQ = this.parseSingleQuestionBlock(processedBlock, blockIdx + 1, currentChapter);
      if (parsedQ.success) {
        // Nếu câu hỏi chưa có đáp án đúng rõ ràng nhưng có trong Bảng Đáp Án tổng hợp
        if (globalAnswerKey[qNum]) {
          const keyIdx = this.letterToIndex(globalAnswerKey[qNum]);
          if (keyIdx >= 0 && keyIdx < parsedQ.data.options.length) {
            parsedQ.data.answerIndex = keyIdx;
            parsedQ.data.options.forEach((opt, oi) => {
              opt.isCorrect = (oi === keyIdx);
            });
            // Xóa cảnh báo missing_answer vì đã tìm thấy trong bảng đáp án tổng hợp
            if (parsedQ.data.warning && parsedQ.data.warning.type === "missing_answer") {
              parsedQ.data.warning = null;
            }
          }
        }

        if (parsedQ.data.warning) {
          warnings.push(`Câu ${blockIdx + 1}: ${parsedQ.data.warning.message}`);
        }
        questions.push(parsedQ.data);
      } else if (parsedQ.error) {
        // Chỉ ghi nhận lỗi nếu khối thực sự là một câu hỏi
        if (/(?:câu|bài|\b[A-EĐđ]\s*[\.\)])/i.test(trimmedBlock)) {
          errors.push(`Vị trí ${blockIdx + 1}: ${parsedQ.error}`);
        }
      }
    });

    return {
      questions,
      warnings,
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
    const optionStartPattern = /^\s*(?:\*\s*|<u>|<ins>|\[x\]\s*|\(x\)\s*|\[Đúng\]\s*)?(?:\*{0,2}|_{0,2}|<u>|<ins>)?\[?([A-Ea-eĐđ])\]?(?:<\/u>|<\/ins>)?[\.\)\:\*\_]*(?:<\/u>|<\/ins>)?\s+/i;

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

    // 2. MẪU 1: Tìm đáp án cuối bài (VD: "Đáp án: A", "đáp án: Đ", "ĐÁP ÁN: A", "Key: C", "Đ/A: D")
    const answerMatch = block.match(/(?:(?:\n|\A)\s*(?:>|\/{2}|\*|_)*\s*(?:đáp án|đ\/a|key|answer|đa|đáp án đúng)\s*[\.:\*\-]?\s*\*{0,2}([A-Ea-eĐđ])\*{0,2})/i);
    if (answerMatch) {
      answerIndex = this.letterToIndex(answerMatch[1]);
    }

    // 3. MẪU 1: Tìm giải thích chung ở cuối (VD: "Giải thích: ...", "giải thích: ...", "GIẢI THÍCH: ...", "Lời giải: ...")
    const explMatch = block.match(/(?:(?:\n|\A)\s*(?:>|\/{2}|\*|_)*\s*(?:giải thích|lời giải|note|hd|hướng dẫn giải)\s*[\.:\*\-]?\s*([\s\S]+?))(?=(?:\n\s*(?:>|\*{0,2})?(?:câu|bài|\d+[\.)])|$))/i);
    if (explMatch) {
      globalExplanation = explMatch[1].trim();
    }

    // 4. Tách các lựa chọn A, B, C, D, E, Đ
    const optionLines = rawLines.slice(firstOptionLineIdx);
    const rawOptions = [];
    let currentOption = null;

    optionLines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Bỏ qua dòng Đáp án / Giải thích ở cuối
      if (/^(?:>|\/{2}|\*|_)*\s*(?:đáp án|đ\/a|key|answer|giải thích|lời giải|hd)/i.test(trimmedLine)) {
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
                                 /<u>\s*([A-Ea-eĐđ])\s*<\/u>/i.test(trimmedLine) ||
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

      // MẪU 2: Kiểm tra cú pháp inline có dấu > (VD: "> đúng: vì tui đẹp trai" hoặc "> đúng" hoặc "> sai: lý do...")
      const inlineMatch = text.match(/>\s*(đúng|sai|true|false|chính xác|chưa đúng)\b(?:\s*:\s*([\s\S]*))?$/i);
      if (inlineMatch) {
        const statusWord = inlineMatch[1].toLowerCase();
        isCorrect = ["đúng", "true", "chính xác"].includes(statusWord);
        note = (inlineMatch[2] || "").trim();
        text = text.slice(0, inlineMatch.index).trim();
        if (isCorrect && !note) {
          note = "Đáp án chính xác.";
        }
      }

      // Kiểm tra hậu tố đánh dấu đúng nếu có: [Đúng], (Đúng), (Đáp án đúng), hoặc dấu * ở cuối
      if (/(?:\[Đúng\]|\(Đúng\)|\(Đáp án đúng\)|\*)$/i.test(text)) {
        isCorrect = true;
        text = text.replace(/(?:\[Đúng\]|\(Đúng\)|\(Đáp án đúng\)|\*)$/i, "").trim();
      }

      // Làm sạch thẻ HTML gạch chân còn sót lại ở nội dung
      text = text.replace(/<\/?(?:u|ins|font|span)[^>]*>/gi, "").trim();
      text = text.replace(/^[\-–—\.]\s*/, "").trim();

      options.push({
        text,
        isCorrect,
        note
      });
    });

    const LETTERS = ["A", "B", "C", "D", "E", "F"];
    const markedIndices = [];
    options.forEach((opt, idx) => {
      if (opt.isCorrect) markedIndices.push(idx);
    });

    let warning = null;

    // 6. Xác định đáp án đúng cuối cùng & Kiểm tra Cảnh báo
    if (answerIndex >= 0 && answerIndex < options.length) {
      // Có đáp án rõ ràng ở cuối bài (Mẫu 1)
      options.forEach((opt, idx) => {
        opt.isCorrect = (idx === answerIndex);
      });
      // Nếu trong bài có phương án đánh dấu khác với đáp án ở cuối
      if (markedIndices.length > 0 && !markedIndices.includes(answerIndex)) {
        warning = {
          type: "multiple_answers",
          message: `Phương án [${LETTERS[markedIndices[0]] || markedIndices[0] + 1}] có đánh dấu nhưng phần cuối ghi "Đáp án: ${LETTERS[answerIndex]}". Hệ thống đã ưu tiên [${LETTERS[answerIndex]}].`
        };
      }
    } else {
      if (markedIndices.length === 0) {
        // CẢNH BÁO 1: Không có đáp án đúng
        answerIndex = 0;
        options[0].isCorrect = true;
        warning = {
          type: "missing_answer",
          message: `Chưa có đáp án đúng (tạm chọn ${LETTERS[0]}). Vui lòng thêm '> Đúng', '*' hoặc 'Đáp án: ${LETTERS[0]}' để hoàn tất.`
        };
      } else if (markedIndices.length === 1) {
        // Chuẩn xác 1 đáp án đúng
        answerIndex = markedIndices[0];
      } else {
        // CẢNH BÁO 2: Phát hiện từ 2 đáp án đúng trở lên
        answerIndex = markedIndices[markedIndices.length - 1]; // Tạm chọn đáp án cuối
        options.forEach((opt, idx) => {
          opt.isCorrect = (idx === answerIndex);
        });
        const lettersList = markedIndices.map(i => LETTERS[i] || (i + 1)).join(", ");
        warning = {
          type: "multiple_answers",
          message: `Phát hiện ${markedIndices.length} đáp án đúng (${lettersList}). Hệ thống đã tạm chọn [${LETTERS[answerIndex]}]. Vui lòng kiểm tra lại!`
        };
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
      answerIndex,
      warning
    };

    return { success: true, data: questionObj };
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
    // 3. Tệp PDF (.pdf text)
    else if (ext === 'pdf') {
      rawText = await this.extractTextFromPdf(file);
    } else {
      rawText = await this.readPlainTextFile(file);
    }

    // Tự động chuẩn hóa văn bản đầu ra cho Textarea (tách dòng ngay ngắn, gắn đuôi > Đúng)
    return this.formatExtractedDocumentText(rawText);
  },

  /**
   * Chuẩn hóa văn bản trích xuất từ tài liệu (Word, PDF, Text) trước khi đưa vào Textarea:
   * - Tự động tách các phương án dính chùm trên cùng 1 hàng thành từng dòng riêng biệt
   * - Gắn hậu tố ' > Đúng' cho phương án đúng (gạch chân / tô đỏ / highlight / in đậm / từ bảng đáp án)
   * - Giữ nguyên vẹn 100% phần đề bài câu hỏi (kể cả có chứa MSA, NASA, node, ABCD...)
   * - Giãn cách các câu hỏi bằng 1 dòng trống (\n\n) để văn bản sạch đẹp, trực quan
   */
  formatExtractedDocumentText(rawText) {
    if (!rawText || !rawText.trim()) return "";
    let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const globalAnswers = this.extractGlobalAnswerKey(text);
    const hasGlobalKey = Object.keys(globalAnswers).length > 0;

    const questionSplits = text.split(/(?=(?:(?:\n|\A)\s*(?:\*{0,2}(?:Câu|Bài|Question)\s*\d+[\s\.:\*\-\]]+|\b\d+\s*[\.)]\s+|\[(?:Câu\s*)?\d+\])))/i);
    const optAPattern = /(?:(?:\n|\A)\s*|[\t\s]{2,}|(?<=[\?\:\.\"\'])\s*)\[?A\]?[\.\)\:\*\_]\s+/i;
    const formattedBlocks = [];

    questionSplits.forEach((block, blockIdx) => {
      let trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      // Bỏ qua khối bảng đáp án tổng hợp không phải câu hỏi
      if (/^(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+TRẮC\s+NGHIỆM|ANSWER\s+KEY|HƯỚNG\s+DẪN\s+CHẤM)/i.test(trimmedBlock)) {
        return;
      }

      const qNumMatch = trimmedBlock.match(/(?:Câu|Bài|Question)?\s*\[?(\d+)\]?/i);
      const qNum = qNumMatch ? parseInt(qNumMatch[1], 10) : (blockIdx + 1);
      const expectedAnsLetter = hasGlobalKey ? globalAnswers[qNum] : null;
      const expectedAnsIdx = expectedAnsLetter ? this.letterToIndex(expectedAnsLetter) : -1;

      const optAMatch = optAPattern.exec(trimmedBlock);
      if (optAMatch) {
        let promptPart = trimmedBlock.slice(0, optAMatch.index).trim();
        let optionsPart = trimmedBlock.slice(optAMatch.index);

        // Tách các phương án A, B, C, D, Đ bị dính chùm trên cùng 1 dòng
        optionsPart = optionsPart
          .replace(/[\t\s]{2,}(?=[A-EĐđ][\.\)\:\*]\s+)/g, "\n")
          .replace(/([a-zA-Z0-9_\)\>\]\"\'])\s*(?=[B-EĐđ][\.\)\:]\s+)/g, "$1\n")
          .replace(/([a-zA-Z0-9_\)\>\]\"\'])(?=[B-EĐđ]\.\s*)/g, "$1\n");

        const optionLines = optionsPart.split("\n").map(l => l.trim()).filter(Boolean);
        const cleanedOptionLines = [];

        for (let optIdx = 0; optIdx < optionLines.length; optIdx++) {
          const line = optionLines[optIdx];
          const hasAsterisk = /^\s*\*+\s*\[?([A-Ea-eĐđ])\]?[\.\)\:\*\_]/.test(line);
          const hasInlineDung = />\s*(đúng|true|chính xác)\b/i.test(line);
          const isKeyMatch = (expectedAnsIdx !== -1 && optIdx === expectedAnsIdx);

          let cleanLine = line.replace(/^\s*\*+\s*/, "");
          if ((hasAsterisk || isKeyMatch) && !hasInlineDung && !cleanLine.includes(">")) {
            cleanLine = `${cleanLine} > Đúng`;
          }
          cleanedOptionLines.push(cleanLine);
        }

        // KHỬ TRÙNG LẶP ĐÁP ÁN TRONG CÙNG 1 CÂU HỎI:
        // Đảm bảo mỗi câu trắc nghiệm chỉ có DUY NHẤT 1 đáp án đúng
        const dungIndices = [];
        cleanedOptionLines.forEach((l, lIdx) => {
          if (/>\s*(?:đúng|true|chính xác)\b/i.test(l)) {
            dungIndices.push(lIdx);
          }
        });

        if (dungIndices.length > 1) {
          // Ưu tiên giữ lại phương án có đánh dấu đáp án đích thực (ở cuối chuỗi quét hoặc phương án thứ 4)
          const keepIdx = dungIndices[dungIndices.length - 1];
          dungIndices.forEach((dIdx) => {
            if (dIdx !== keepIdx) {
              cleanedOptionLines[dIdx] = cleanedOptionLines[dIdx]
                .replace(/\s*>\s*(?:đúng|true|chính xác)\b.*$/i, "")
                .trim();
            }
          });
        }

        formattedBlocks.push(`${promptPart}\n${cleanedOptionLines.join("\n")}`);
      } else {
        formattedBlocks.push(trimmedBlock);
      }
    });

    return formattedBlocks.join("\n\n");
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
