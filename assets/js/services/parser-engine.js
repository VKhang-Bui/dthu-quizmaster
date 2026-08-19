/**
 * ============================================================================
 * SHINORA QUIZMASTER - PARSER ENGINE CORE (v3.1.4)
 * Lõi Thuật Toán Bóc Tách & Tiền Xử Lý Câu Hỏi Độc Lập (Zero DOM Dependencies)
 * ----------------------------------------------------------------------------
 * Tác giả: Shina Sanora (Shinora Academic & Technology Studio)
 * Mô hình: 4-Stage Deterministic FSM Pipeline (Finite State Machine Architecture)
 * ============================================================================
 */

var ParserEngine = {
  LETTERS: ["A", "B", "C", "D", "E", "F"],

  /**
   * Chuyển đổi chữ cái A-F sang chỉ số 0-5
   */
  letterToIndex(l) {
    if (!l) return -1;
    const c = l.toString().trim().toUpperCase();
    if (c === "Đ" || c === "D") return 3;
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 70) return code - 65;
    return -1;
  },

  /**
   * Chuyển đổi chỉ số 0-5 sang chữ cái A-F
   */
  indexToLetter(idx) {
    if (idx >= 0 && idx < this.LETTERS.length) {
      return this.LETTERS[idx];
    }
    return "A";
  },

  /**
   * ==========================================================================
   * TẦNG 1: LỌC NHIỄU & CHUẨN HÓA VĂN BẢN (Sanitization)
   * ==========================================================================
   */
  cleanInlineBrokenText(str) {
    if (!str || typeof str !== "string") return "";
    let text = str;

    // 1. Nối dấu câu lơ lửng trên dòng mới: "UUA\n." hoặc "UUA\n\n." -> "UUA."
    text = text.replace(/([^\n\s])\s*\n+\s*([.,;:?!])/g, "$1$2");

    // 2. Nối ký tự đơn lẻ lơ lửng không phải phương án mới (không có dấu . hoặc ) hoặc : theo sau)
    // Ví dụ: "cat merge.fast\n\na" hoặc "cat merge.fast\na" -> "cat merge.fasta"
    // "RN\n\nA" -> "RNA", "DN\n\nA" -> "DNA", "FAST\n\nA" -> "FASTA"
    text = text.replace(/(\b[a-zA-Z0-9_\.\-]+[a-zA-Z0-9])\s*\n+\s*([a-zA-Z])(?!\s*[\.\)\:\*\_])\s*(?:\n|$)/g, "$1$2\n");

    // 3. Nối các từ bị gãy dấu cách do gộp dòng trước đó
    text = text.replace(/\b([a-zA-Z0-9_\-]+\.fast|fast|RN|DN|mRN|tRN|rRN|FAST)\s+(A|a)\b/gi, "$1$2");

    // 4. Xóa các dấu xuống dòng còn lại và thay bằng khoảng trắng thông thường
    text = text
      .replace(/\r?\n+/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\s+([.,;:?!])/g, "$1")
      .replace(/^[\-–—\.\•\+\*]\s*/, "")
      .trim();

    return text;
  },

  /**
   * Chuẩn hóa văn bản tài liệu tổng thể (Toàn bộ tài liệu Word, PDF, Text)
   */
  normalizeDocumentText(rawText) {
    if (!rawText || typeof rawText !== "string") return "";
    let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 1.1. Chuẩn hóa khoảng trắng vô hình và ký tự điều khiển ẩn
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");

    // 1.2. Xóa toàn bộ watermark, header/footer lặp lại
    text = text.replace(/CẤM\s+VẬN\s+HÀNH\s+RA\s+NGOÀI[^\n]*/gi, "");
    text = text.replace(/Bộ\s+Đề\s+Ôn\s+Tập\s+Thi\s+Cuối\s+Kỳ[^\n]*/gi, "");
    text = text.replace(/(?:Trang|Page)\s+\d+(?:\s*\/\s*\d+)?/gi, "");

    // 1.3. Tự động xuống dòng trước tiêu đề câu hỏi mới nếu bị dính chùm vào cuối dòng trước
    text = text.replace(/([^\n])\s+((?:(?:\*{0,2}(?:câu|bài|question)\s*\d+[\s\.:\*\-\]]+|\b\d+\s*[\.)]\s+|\[(?:câu\s*)?\d+\])))/gi, "$1\n\n$2");

    // 1.4. Nối các dấu câu lơ lửng trên dòng mới vào từ phía trước: "UUA\n\n." -> "UUA."
    text = text.replace(/([^\n\s])\s*\n+\s*([.,;:?!])/g, "$1$2");

    // 1.5. Nối các ký tự đơn lẻ lơ lửng trên dòng mới (orphan single letters):
    // "cat merge.fast\n\na" -> "cat merge.fasta", "ls -l protein.fast\na" -> "ls -l protein.fasta"
    text = text.replace(/(\b[a-zA-Z0-9_\.\-]+[a-zA-Z0-9])\s*\n+\s*([a-zA-Z])(?!\s*[\.\)\:\*\_])\s*(?:\n+|$)/g, "$1$2\n\n");

    // 1.6. Nối các từ bị ngắt gãy dấu cách do gộp dòng
    text = text.replace(/\b([a-zA-Z0-9_\-]+\.fast|fast|RN|DN|mRN|tRN|rRN|FAST)\s+(A|a)\b/gi, "$1$2");

    return text;
  },

  /**
   * ==========================================================================
   * TẦNG 2: PHÂN TÁCH KHỐI CÂU HỎI (Block Tokenization)
   * ==========================================================================
   */
  tokenizeQuestions(text) {
    if (!text || !text.trim()) return [];
    
    // Tách theo tiêu đề câu hỏi không phân biệt hoa thường ("câu 1:", "CÂU 1:", "Bài 1:", "[Câu 1]")
    // Chỉ tách khi bắt đầu bằng Câu/Bài/Question hoặc "[Câu N]" hoặc số thứ tự đầu dòng có chữ theo sau
    const blockSplitter = /(?=(?:^|\n)\s*(?:(?:câu|bài|question)\s*\d+[\s\.:\*\-\]]+|\[(?:câu\s*)?\d+\]|(?:\d{1,4}\s*[\.:\)]\s+(?=[A-ZÀ-ỸÁ-Ỵa-zà-ỹá-ỵ]))))/i;
    const splits = text.split(blockSplitter);
    
    return splits
      .map(b => b.trim())
      .filter(b => {
        if (!b) return false;
        // Loại bỏ các khối bảng đáp án tổng hợp không phải câu hỏi
        if (/^(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+TRẮC\s+NGHIỆM|ANSWER\s+KEY|HƯỚNG\s+DẪN\s+CHẤM)/i.test(b)) {
          return false;
        }
        return true;
      });
  },

  /**
   * Bóc tách bảng đáp án tổng hợp ở cuối tài liệu nếu có (Ví dụ: "1.A 2.B 3.C 4.D...")
   */
  extractGlobalAnswerKey(text) {
    const keyMap = {};
    if (!text) return keyMap;

    const answerTableRegex = /(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+TRẮC\s+NGHIỆM|ANSWER\s+KEY|HƯỚNG\s+DẪN\s+CHẤM)([\s\S]+)$/i;
    const match = text.match(answerTableRegex);
    if (!match) return keyMap;

    const tableContent = match[1];
    const itemRegex = /(?:câu|bài)?\s*(\d+)[\s\.\:\-\]]*\s*([A-EĐđ])/gi;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(tableContent)) !== null) {
      const qNum = parseInt(itemMatch[1], 10);
      const ansLetter = itemMatch[2].toUpperCase();
      if (!isNaN(qNum)) {
        keyMap[qNum] = ansLetter;
      }
    }

    return keyMap;
  },

  /**
   * ==========================================================================
   * TẦNG 3 & 4: MÁY TRẠNG THÁI (FSM) & BÓC TÁCH TỪNG KHỐI CÂU HỎI
   * ==========================================================================
   */
  parseSingleBlock(block, index, chapterId, globalAnswers) {
    if (!block || !block.trim()) return { success: false, error: "Khối rỗng" };

    // Tách mọi phương án dính chùm (kể cả sau ký tự //, =, ;, :, số, chữ, ngoặc, v.v.)
    const blockCleaned = block.replace(/([^\s])\s*(?=[B-EĐđ][\.\)\:\*\_]\s*)/g, "$1\n");
    const rawLines = blockCleaned.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length === 0) return { success: false, error: "Khối không có nội dung" };
    
    // Pattern bắt đầu phương án chuẩn: Bắt buộc có dấu phân cách (. ) : - _)
    const optPrefixRegex = /^\s*(?:\*\s*|<u>|<ins>|\[x\]\s*|\(x\)\s*|\[Đúng\]\s*)?(?:\*{0,2}|_{0,2}|<u>|<ins>)?\[?([A-Ea-eĐđ])\]?(?:<\/u>|<\/ins>)?[\.\)\:\*\_]+(?:<\/u>|<\/ins>)?\s*/i;

    let questionParts = [];
    let optParts = { 0: [], 1: [], 2: [], 3: [], 4: [] }; // 0=A, 1=B, 2=C, 3=D, 4=E

    // Trạng thái FSM: 0 = Question, 1 = OptA, 2 = OptB, 3 = OptC, 4 = OptD, 5 = OptE
    let state = 0;
    let explicitAnswerIdx = -1;
    let globalExplanation = "";

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // 1. Kiểm tra đáp án cuối bài (VD: "Đáp án: A", "Key: B")
      const ansMatch = line.match(/^\s*(?:>|\/{2}|\*|_)*\s*(?:đáp án|đ\/a|key|answer|đáp án đúng)\s*[\.:\*\-]\s*\*{0,2}([A-Ea-eĐđ])\*{0,2}/i);
      if (ansMatch) {
        explicitAnswerIdx = this.letterToIndex(ansMatch[1]);
        continue;
      }

      // 2. Kiểm tra giải thích chung ở cuối (VD: "Giải thích: ...", "Lời giải: ...")
      const explMatch = line.match(/^\s*(?:>|\/{2}|\*|_)*\s*(?:giải thích|lời giải|hướng dẫn giải)\s*[\.:\*\-]\s*(.+)/i);
      if (explMatch) {
        globalExplanation = this.cleanInlineBrokenText(explMatch[1]);
        continue;
      }

      // 3. Kiểm tra chuyển trạng thái theo máy trạng thái tuần tự FSM
      const optMatch = line.match(optPrefixRegex);

      if (optMatch) {
        const letter = optMatch[1].toUpperCase();
        const letterIdx = (letter === 'Đ' || letter === 'D') ? 3 : (letter.charCodeAt(0) - 65); // A=0, B=1, C=2, D=3, E=4

        // Cho phép chuyển trạng thái tiến lên (kể cả khi một phương án bị thiếu hoặc nhảy cóc như A -> C)
        if (
          (state === 0 && letterIdx >= 0) ||
          (state > 0 && letterIdx > (state - 1))
        ) {
          state = letterIdx + 1; // 1 = OptA, 2 = OptB, 3 = OptC, 4 = OptD, 5 = OptE
          const contentAfterPrefix = line.replace(optPrefixRegex, "").trim();
          if (contentAfterPrefix) {
            optParts[letterIdx].push(contentAfterPrefix);
          }
          continue;
        }
      }

      // Nếu không chuyển trạng thái -> Nối vào nội dung của trạng thái hiện tại
      if (state === 0) {
        questionParts.push(line);
      } else {
        optParts[state - 1].push(line);
      }
    }

    // Bỏ qua khối tiêu đề rác
    if (state === 0 && questionParts.length > 0) {
      return { success: false, error: "Khối tiêu đề, không phải câu hỏi trắc nghiệm" };
    }

    // Xử lý tiêu đề câu hỏi (Trải phẳng và loại bỏ tiêu đề "Câu \d+:")
    let rawQuestionTitle = questionParts.join(" ")
      .replace(/^\s*(?:\*{0,2}(?:câu|bài|question)?\s*\[?(?:\d+|[A-Za-z]\d+)\]?\s*[\.:\*\-\]]*)/i, "")
      .replace(/\s+([.,;:?!])/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    if (!rawQuestionTitle) rawQuestionTitle = `Câu hỏi số ${index}`;

    // Xử lý từng phương án theo danh sách FSM
    const letters = ["A", "B", "C", "D"];
    if (optParts[4].length > 0) letters.push("E");

    const options = [];
    const markedIndices = [];

    letters.forEach((l, oi) => {
      let rawContent = optParts[oi].join(" ");
      let isCorrect = false;
      let note = "";

      // Dò tìm cờ '> Đúng' / '> Sai' ở bất kỳ vị trí nào
      const dungMatch = rawContent.match(/>\s*(đúng|đ|true|chính xác|sai|s|false|chưa đúng)\b(?:\s*:\s*([^>]*))?/i);
      if (dungMatch) {
        const status = dungMatch[1].toLowerCase();
        isCorrect = ["đúng", "đ", "true", "chính xác"].includes(status);
        note = (dungMatch[2] || "").trim();
        // XÓA SẠCH cụm > Đúng lẫn trong chuỗi
        rawContent = rawContent.replace(dungMatch[0], " ").trim();
        if (isCorrect && !note) note = "Đáp án chính xác.";
      }

      // Trải phẳng khoảng trắng và làm sạch
      rawContent = rawContent
        .replace(/\s+([.,;:?!])/g, "$1")
        .replace(/\s+/g, " ")
        .replace(/^[\-–—\.\•\+\*]\s*/, "")
        .trim();

      if (isCorrect) markedIndices.push(oi);

      options.push({
        text: rawContent,
        isCorrect,
        note
      });
    });

    // 7. Tầng 4: Kiểm tra tính hợp lệ của đáp án (Validation & Conflict Detection)
    // Ưu tiên 1: Bảng đáp án tổng hợp (globalAnswers)
    const qNumMatch = block.match(/(?:câu|bài|question)?\s*\[?(\d+)\]?/i);
    const qNum = qNumMatch ? parseInt(qNumMatch[1], 10) : index;
    if (globalAnswers && globalAnswers[qNum]) {
      const gAnsIdx = this.letterToIndex(globalAnswers[qNum]);
      if (gAnsIdx >= 0 && gAnsIdx < options.length) {
        explicitAnswerIdx = gAnsIdx;
      }
    }

    let warning = null;
    if (explicitAnswerIdx >= 0 && explicitAnswerIdx < options.length) {
      finalAnswerIdx = explicitAnswerIdx;
      options.forEach((opt, idx) => { opt.isCorrect = (idx === finalAnswerIdx); });
    } else {
      if (markedIndices.length === 0) {
        finalAnswerIdx = -1;
        options.forEach(opt => { opt.isCorrect = false; });
        warning = {
          type: "missing_answer",
          message: "Câu hỏi chưa có đáp án đúng! Vui lòng thêm '> Đúng' hoặc '*' ở đầu phương án đúng."
        };
      } else if (markedIndices.length === 1) {
        finalAnswerIdx = markedIndices[0];
      } else {
        finalAnswerIdx = -1;
        options.forEach(opt => { opt.isCorrect = false; });
        const lettersList = markedIndices.map(i => this.LETTERS[i] || (i + 1)).join(", ");
        warning = {
          type: "multiple_answers",
          message: `Xung đột: Phát hiện ${markedIndices.length} đáp án đúng (${lettersList})! Vui lòng chỉ giữ lại 1 đáp án đúng duy nhất.`
        };
      }
    }

    if (globalExplanation && finalAnswerIdx >= 0 && options[finalAnswerIdx] && !options[finalAnswerIdx].note) {
      options[finalAnswerIdx].note = globalExplanation;
    }

    return {
      success: true,
      data: {
        id: `Q-${Date.now().toString().slice(-4)}${index}`,
        chapterId: chapterId || "c1",
        question: rawQuestionTitle,
        options,
        answerIndex: finalAnswerIdx,
        warning,
        type: "single"
      }
    };
  },

  /**
   * ==========================================================================
   * TỔNG HỢP PIPELINE: PARSE RAW TEXT -> QUESTIONS ARRAY
   * ==========================================================================
   */
  parse(rawText, chapterId) {
    const normalized = this.normalizeDocumentText(rawText);
    const globalAnswers = this.extractGlobalAnswerKey(rawText);
    const blocks = this.tokenizeQuestions(normalized);

    const questions = [];
    const warnings = [];
    const errors = [];

    blocks.forEach((block, idx) => {
      const res = this.parseSingleBlock(block, idx + 1, chapterId, globalAnswers);
      if (res.success && res.data) {
        questions.push(res.data);
        if (res.data.warning) {
          warnings.push(`Câu ${idx + 1}: ${res.data.warning.message}`);
        }
      } else if (res.error) {
        errors.push(res.error);
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
   * Chuẩn hóa văn bản tài liệu có định dạng câu hỏi tuần tự:
   * Tự động nối các dòng, đánh số lại tuần tự Câu 1, Câu 2... và gắn '> Đúng'
   */
  formatExtractedDocumentText(rawText) {
    if (!rawText || !rawText.trim()) return "";
    const parsed = this.parse(rawText, "c1");
    if (!parsed || parsed.questions.length === 0) return rawText;

    const formattedBlocks = parsed.questions.map((q, idx) => {
      const qNum = idx + 1;
      const optLines = q.options.map((opt, optIdx) => {
        const letter = this.indexToLetter(optIdx);
        let line = `${letter}. ${opt.text}`;
        if (opt.isCorrect && !line.includes(">")) {
          line += " > Đúng";
        }
        return line;
      });

      return `Câu ${qNum}: ${q.question}\n${optLines.join("\n")}`;
    });

    return formattedBlocks.join("\n\n");
  },

  /**
   * Định dạng công thức toán/hóa học, Markdown, HTML rich-text
   */
  formatRichText(text) {
    if (!text) return "";
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // In đậm **text** hoặc __text__
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/__(.*?)__/g, "<strong>$1</strong>");

    // In nghiêng *text* hoặc _text_
    formatted = formatted.replace(/\*([^\*]+)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/_([^_]+)_/g, "<em>$1</em>");

    // Gạch chân <u>text</u>
    formatted = formatted.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, "<u>$1</u>");

    // Inline Code `text`
    formatted = formatted.replace(/`([^`]+)`/g, "<code style=\"background: var(--bg-tertiary, #e2e8f0); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: var(--brand-primary, #2563eb);\">$1</code>");

    // Công thức hóa học / số mũ / chỉ số dưới
    formatted = this.formatFormula(formatted);

    return formatted;
  },

  /**
   * Tự động nhận diện công thức hóa học, sinh học, toán học
   */
  formatFormula(text) {
    if (!text) return "";
    // Chỉ số dưới hóa học (H2O, CO2, C6H12O6, SO4, NO3, PO4, ATP, DNA, RNA)
    let res = text.replace(/\b([A-Z][a-z]?)([2-9]|1[0-9]|2[0-9])\b/g, "$1<sub>$2</sub>");
    // Chỉ số trên / số mũ (x^2, 10^-3, 2^n)
    res = res.replace(/\^([0-9a-zA-Z\-\+]+)/g, "<sup>$1</sup>");
    return res;
  }
};

// Gắn toàn cục cho trình duyệt và môi trường Node/GJS
if (typeof window !== "undefined") {
  window.ParserEngine = ParserEngine;
}
if (typeof globalThis !== "undefined") {
  globalThis.ParserEngine = ParserEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = ParserEngine;
}
