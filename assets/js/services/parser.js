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
    // Tìm vị trí dòng đầu tiên bắt đầu một phương án (A. hoặc *A. hoặc **A.** hoặc [A] hoặc A) )
    let firstOptionLineIdx = -1;
    const optionStartPattern = /^\s*(?:\*\s*)?(?:\*{0,2})\[?([A-Ea-e])\]?[\.\)\:\*]\s+/;

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
        const content = trimmedLine.replace(optionStartPattern, "").trim();
        const hasAsteriskPrefix = trimmedLine.startsWith("*") || trimmedLine.startsWith("**");

        currentOption = {
          letter,
          content,
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
  }
};
