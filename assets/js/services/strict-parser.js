/**
 * ============================================================================
 * STRICT QUIZ PARSER SERVICE (Chuẩn Hóa Schema V3 + Smart Index ID + Source Map)
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StrictQuizParser = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {

  const StrictQuizParser = {
    version: "3.1.0-source-mapping",

    /**
     * Thuật toán sinh Smart Index ID có mã môn học
     * @param {string} subjectCode - Mã môn (VD: CNXHKH, POL102, BIO101)
     * @param {string} question - Nội dung câu hỏi
     * @param {Array} options - Danh sách các phương án
     * @param {string} correctAnswerKey - Chữ cái đáp án đúng (A, B, C, D)
     * @returns {string} Ví dụ: "CNXHKH-Q4B-1E-8AF92C"
     */
    generateSmartIndexId(subjectCode = "QUIZ", question = "", options = [], correctAnswerKey = "A") {
      const sub = (subjectCode || "QUIZ")
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "")
        .slice(0, 10) || "QUIZ";

      const optCount = Math.max(options.length, 2);
      const ansKey = (correctAnswerKey || (options.find(o => o.isCorrect)?.key) || "A").toUpperCase();
      const structSig = `Q${optCount}${ansKey}`;

      const wordCount = question.trim().split(/\s+/).filter(Boolean).length;
      const lengthHex = Math.min(wordCount, 255).toString(16).toUpperCase().padStart(2, "0");

      const optStr = options.map(o => (typeof o === "string" ? o : o.text || "")).join("|");
      const normalized = (question + "||" + optStr).toLowerCase().replace(/\s+/g, " ").trim();

      let hash = 0x811c9dc5;
      for (let i = 0; i < normalized.length; i++) {
        hash ^= normalized.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      const contentHash = (hash >>> 0).toString(16).toUpperCase().padStart(6, "0").slice(0, 6);

      return `${sub}-${structSig}-${lengthHex}-${contentHash}`;
    },

    /**
     * Giải mã ngược Smart Index ID
     * @param {string} id
     */
    decodeSmartIndexId(id) {
      if (!id || typeof id !== "string") return null;
      const parts = id.split("-");
      if (parts.length !== 4) return null;

      const subjectCode = parts[0];
      const optCount = parseInt(parts[1][1], 10);
      const correctAns = parts[1][2];
      const wordCount = parseInt(parts[2], 16);
      const fingerprint = parts[3];

      return {
        subjectCode: subjectCode,
        optionCount: optCount,
        correctAnswer: correctAns,
        approxWordCount: wordCount,
        fingerprint: fingerprint,
        type: optCount === 2 ? "Đúng/Sai (2 đáp án)" : `Trắc nghiệm (${optCount} đáp án)`
      };
    },

    /**
     * Phân tích chuỗi văn bản thô theo đúng chuẩn kèm tọa độ Source Mapping
     * @param {string} rawText 
     * @param {string} subjectCode - Mã môn học tùy chọn
     * @returns {{ success: boolean, total: number, data: Array, warnings: Array, errors: Array }}
     */
    parse(rawText, subjectCode = "CNXHKH") {
      if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
        return { success: false, total: 0, data: [], warnings: [], errors: ["Văn bản đầu vào trống"] };
      }

      // Chuẩn hóa dòng ngắt
      const normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

      // Bóc tách chính xác từng khối câu hỏi và tọa độ ký tự tuyệt đối (Hỗ trợ chuẩn: 'Câu 1: ...', 'câu 1: ...', 'Câu 1. ...', 'câu: 1 ...')
      const headerPattern = /(?:^|\n)[ \t]*(câu\s*(?::\s*)?(?:\[?\d+\]?)[^\n]*)/gi;
      const blockStarts = [];
      let headerMatch;
      while ((headerMatch = headerPattern.exec(normalized)) !== null) {
        const isLeadingNewline = headerMatch[0].startsWith('\n');
        const start = headerMatch.index + (isLeadingNewline ? 1 : 0);
        blockStarts.push(start);
      }

      const parsedQuestions = [];
      const errors = [];
      const allWarnings = [];
      const seenIds = new Set();

      if (blockStarts.length === 0) {
        // Không tìm thấy tiêu đề "Câu [số]: " nào
        return { success: false, total: 0, data: [], warnings: [], errors: ["Không tìm thấy mẫu 'Câu [số]:' nào trong văn bản"] };
      }

      for (let i = 0; i < blockStarts.length; i++) {
        try {
          const startChar = blockStarts[i];
          const endChar = (i < blockStarts.length - 1) ? blockStarts[i + 1] : normalized.length;
          const block = normalized.substring(startChar, endChar).trim();

          if (!block) continue;

          const item = this.parseSingleBlock(block, i + 1, subjectCode, startChar, endChar);
          if (item) {
            if (seenIds.has(item.id)) {
              item.warnings.push(`Phát hiện câu hỏi bị trùng lặp nội dung (Trùng Smart ID: ${item.id})`);
            }
            seenIds.add(item.id);

            parsedQuestions.push(item);
            if (item.warnings && item.warnings.length > 0) {
              allWarnings.push({ questionNum: item.num, id: item.id, warnings: item.warnings });
            }
          }
        } catch (err) {
          errors.push(`Lỗi tại khối #${i + 1}: ${err.message}`);
        }
      }

      parsedQuestions.forEach((q, idx) => {
        q.num = idx + 1;
      });

      return {
        success: errors.length === 0,
        total: parsedQuestions.length,
        data: parsedQuestions,
        warnings: allWarnings,
        errors: errors
      };
    },

    /**
     * Bóc tách 1 khối câu hỏi duy nhất
     * @param {string} block 
     * @param {number} fallbackIndex 
     * @param {string} subjectCode 
     * @param {number} startChar 
     * @param {number} endChar 
     */
    parseSingleBlock(block, fallbackIndex, subjectCode = "CNXHKH", startChar = 0, endChar = 0) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return null;

      const warnings = [];

      // 1. Phân tích tiêu đề câu: "Câu 1: [nội dung]?" hoặc "câu: 1 [nội dung]?"
      const headerLine = lines[0];
      const headerMatch = headerLine.match(/^câu\s*(?::\s*)?(?:\[?(\d+)\]?)\s*[:\-\.]?\s*(.*)$/i);

      let rawLabel = fallbackIndex;
      let questionContent = "";

      if (headerMatch) {
        rawLabel = parseInt(headerMatch[1], 10);
        questionContent = (headerMatch[2] || "").trim();
      } else {
        questionContent = headerLine.replace(/^câu\s*(?::\s*)?(?:\[?\d+\]?)?\s*[:\-\.]?\s*/i, "").trim();
      }

      // Thu thập các dòng câu hỏi nếu nội dung trải dài
      let lineIdx = 1;
      const optionPrefixRegex = /^[A-FĐ][\.\:\)]/i;

      while (lineIdx < lines.length && !optionPrefixRegex.test(lines[lineIdx])) {
        questionContent += " " + lines[lineIdx];
        lineIdx++;
      }

      questionContent = questionContent.trim();

      if (!questionContent.endsWith("?")) {
        warnings.push("Nội dung câu hỏi chưa kết thúc bằng dấu '?'");
      }

      // 2. Phân tích các dòng phương án (Hỗ trợ linh hoạt: A. Nội dung, B. Nội dung >đúng, C. Nội dung >đúng:Giải thích, D. Nội dung >sai)
      const options = [];
      let correctAnswerKey = null;
      let correctIndex = -1;

      for (; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        const prefixMatch = line.match(/^([A-FĐ])[\.\:\)]\s*(.*)$/i);

        if (prefixMatch) {
          const key = prefixMatch[1].toUpperCase() === "Đ" ? "D" : prefixMatch[1].toUpperCase();
          let rest = prefixMatch[2].trim();
          let isCorrect = false;
          let explanation = "";

          // Tách thẻ đuôi >đúng / >dung / >sai (có hoặc không có dấu hai chấm và giải thích)
          const tagMatch = rest.match(/^(.*?)\s*>\s*(đúng|sai|dung)(?:\s*:\s*(.*))?$/i);
          if (tagMatch) {
            rest = tagMatch[1].trim();
            const status = tagMatch[2].toLowerCase();
            isCorrect = (status === "đúng" || status === "dung");
            explanation = (tagMatch[3] || "").trim();
          }

          const optObj = {
            key: key,
            text: rest,
            isCorrect: isCorrect,
            explanation: explanation
          };

          if (isCorrect) {
            if (correctAnswerKey) {
              warnings.push(`Phát hiện nhiều hơn 1 đáp án đúng (đã có ${correctAnswerKey}, nay thêm ${key})`);
            }
            correctAnswerKey = key;
            correctIndex = options.length;
          }

          options.push(optObj);
        } else if (options.length > 0) {
          const lastOpt = options[options.length - 1];
          if (lastOpt.explanation) {
            lastOpt.explanation += " " + line;
          } else {
            lastOpt.text += " " + line;
          }
        } else {
          warnings.push(`Dòng không đúng định dạng lựa chọn: "${line.slice(0, 40)}..."`);
        }
      }

      if (options.length < 2) {
        warnings.push(`Số lượng phương án ít hơn 2 (hiện có ${options.length})`);
      }

      if (correctIndex === -1) {
        warnings.push("Chưa tìm thấy phương án nào gắn thẻ >đúng");
      }

      const smartId = this.generateSmartIndexId(subjectCode, questionContent, options, correctAnswerKey);

      return {
        id: smartId,
        num: fallbackIndex,        // Số thứ tự tuần tự trong danh sách (1..N)
        rawLabel: rawLabel,        // Số gốc do người soạn gõ (câu: 4)
        rawBlock: block,           // Khối văn bản gốc
        startChar: startChar,      // Ký tự bắt đầu trong Textarea
        endChar: endChar,          // Ký tự kết thúc trong Textarea
        question: questionContent,
        options: options,
        correctAnswer: correctAnswerKey,
        correctIndex: correctIndex >= 0 ? correctIndex : null,
        warnings: warnings
      };
    },

    /**
     * Chuyển đổi dữ liệu đã bóc tách thành chuẩn Schema V3 cố định
     * @param {Array} parsedDataArray
     */
    toSchemaV3(parsedDataArray) {
      if (!Array.isArray(parsedDataArray)) return [];
      return parsedDataArray.map(item => ({
        id: item.id,
        q: item.question,
        opts: item.options.map(o => o.text),
        ans: item.correctAnswer || (item.options.find(o => o.isCorrect)?.key || "A"),
        exp: item.options.map(o => o.explanation || "")
      }));
    },

    /**
     * Xuất ra chuỗi JSON Schema V3
     * @param {Array} parsedDataArray 
     * @param {boolean} pretty 
     */
    toJsonV3(parsedDataArray, pretty = true) {
      const v3 = this.toSchemaV3(parsedDataArray);
      return JSON.stringify(v3, null, pretty ? 2 : 0);
    }
  };

  return StrictQuizParser;
}));
