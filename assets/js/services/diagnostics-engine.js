/**
 * ============================================================================
 * STRICT QUIZ DIAGNOSTICS & VALIDATOR ENGINE (Độc Lập & Chuyên Sâu)
 * ----------------------------------------------------------------------------
 * Phân loại mức độ nghiêm trọng theo 2 cấp độ rõ ràng:
 * 1. UNACCEPTABLE (🔴 Không chấp nhận được): Lỗi cấu trúc nghiêm trọng, không thể chấm điểm hoặc xuất đề.
 * 2. ACCEPTABLE   (🟡 Chấp nhận được): Cảnh báo nhẹ, hệ thống vẫn nạp và chạy được nhưng khuyến nghị sửa.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QuizDiagnostics = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {

  const SEVERITY = {
    UNACCEPTABLE: "unacceptable", // 🔴 Không chấp nhận được
    ACCEPTABLE: "acceptable"      // 🟡 Chấp nhận được
  };

  const QuizDiagnostics = {
    version: "1.0.0-diagnostics-engine",
    SEVERITY: SEVERITY,

    /**
     * Kiểm định toàn bộ danh sách câu hỏi trong đề
     * @param {Array} questions - Mảng các câu hỏi đã bóc tách
     * @param {Object} meta - Metadata bổ sung (subjectCode, options)
     * @returns {Object} Báo cáo kiểm định tổng hợp
     */
    analyzeQuiz(questions = [], meta = {}) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return {
          total: 0,
          perfectCount: 0,
          acceptableCount: 0,
          unacceptableCount: 0,
          isPublishReady: false,
          summary: "Chưa có dữ liệu câu hỏi để kiểm định.",
          issues: []
        };
      }

      const issues = [];
      const seenFingerprints = new Map();
      let unacceptableCount = 0;
      let acceptableCount = 0;
      let perfectCount = 0;

      questions.forEach((q, idx) => {
        q.num = idx + 1;
        const qIssues = this.analyzeSingleQuestion(q, idx + 1, questions, seenFingerprints);
        
        q.diagnosticsIssues = qIssues;
        q.hasUnacceptable = qIssues.some(issue => issue.severity === SEVERITY.UNACCEPTABLE);
        q.hasAcceptable = qIssues.some(issue => issue.severity === SEVERITY.ACCEPTABLE);
        q.isPerfect = !q.hasUnacceptable && !q.hasAcceptable;

        qIssues.forEach(issue => {
          issues.push(issue);
        });

        if (q.hasUnacceptable) {
          unacceptableCount++;
        } else if (q.hasAcceptable) {
          acceptableCount++;
        } else {
          perfectCount++;
        }
      });

      return {
        total: questions.length,
        perfectCount: perfectCount,
        acceptableCount: acceptableCount,
        unacceptableCount: unacceptableCount,
        isPublishReady: unacceptableCount === 0,
        summary: unacceptableCount === 0 
          ? `Đề thi hợp lệ (${perfectCount} câu hoàn hảo, ${acceptableCount} câu có lưu ý nhẹ). Sẵn sàng xuất đề!`
          : `Phát hiện ${unacceptableCount} câu hỏi có lỗi nghiêm trọng (Không chấp nhận được). Cần khắc phục trước khi xuất đề.`,
        issues: issues
      };
    },

    /**
     * Kiểm định chi tiết 1 câu hỏi đơn lẻ
     * @param {Object} q - Đối tượng câu hỏi
     * @param {number} fallbackNum - Số thứ tự câu
     * @param {Array} allQuestions - Toàn bộ danh sách câu để so sánh đối chiếu
     * @param {Map} seenFingerprints - Bản đồ theo dõi trùng lặp
     * @returns {Array} Danh sách các vấn đề phát hiện được
     */
    analyzeSingleQuestion(q, fallbackNum, allQuestions = [], seenFingerprints = new Map()) {
      const issues = [];
      const qNum = q.num || fallbackNum;
      const qId = q.id || `Q_${qNum}`;

      // ======================================================================
      // NHÓM 1: 🔴 LỖI KHÔNG CHẤP NHẬN ĐƯỢC (UNACCEPTABLE)
      // ======================================================================

      // 1.1. Câu hỏi rỗng
      if (!q.question || !q.question.trim()) {
        issues.push({
          questionNum: qNum,
          id: qId,
          severity: SEVERITY.UNACCEPTABLE,
          code: "ERR_EMPTY_QUESTION",
          title: "Nội dung câu hỏi bị trống",
          message: "Câu hỏi không có nội dung văn bản để hiển thị.",
          suggestion: "Vui lòng nhập nội dung câu hỏi sau 'câu: [số]'."
        });
      }

      // 1.2. Số lượng phương án < 2
      if (!q.options || q.options.length < 2) {
        issues.push({
          questionNum: qNum,
          id: qId,
          severity: SEVERITY.UNACCEPTABLE,
          code: "ERR_TOO_FEW_OPTIONS",
          title: "Thiếu phương án lựa chọn",
          message: `Câu hỏi chỉ có ${q.options ? q.options.length : 0} phương án (Yêu cầu tối thiểu từ 2 phương án trở lên).`,
          suggestion: "Bổ sung thêm phương án A, B để hoàn thành câu hỏi."
        });
      }

      // 1.3. Không có phương án nào gắn thẻ >đúng
      const correctOpts = (q.options || []).filter(o => o.isCorrect);
      if (q.options && q.options.length >= 2 && correctOpts.length === 0) {
        issues.push({
          questionNum: qNum,
          id: qId,
          severity: SEVERITY.UNACCEPTABLE,
          code: "ERR_NO_CORRECT_ANSWER",
          title: "Thiếu đáp án đúng",
          message: "Chưa có bất kỳ phương án nào được gắn thẻ '>đúng'. Hệ thống không thể chấm điểm.",
          suggestion: "Gắn thẻ '>đúng' hoặc '>đúng:[giải thích]' vào 1 phương án chính xác."
        });
      }

      // 1.4. Có nhiều hơn 1 đáp án đúng (trong câu trắc nghiệm 1 đáp án)
      if (correctOpts.length > 1) {
        const correctLetters = correctOpts.map(o => o.key).join(", ");
        issues.push({
          questionNum: qNum,
          id: qId,
          severity: SEVERITY.UNACCEPTABLE,
          code: "ERR_MULTIPLE_CORRECT_ANSWERS",
          title: "Xung đột nhiều đáp án đúng",
          message: `Phát hiện ${correctOpts.length} đáp án cùng đánh dấu '>đúng' (${correctLetters}).`,
          suggestion: "Chỉ giữ lại 1 đáp án đúng duy nhất (xóa thẻ '>đúng' ở các phương án còn lại)."
        });
      }

      // 1.5. Trùng lặp nội dung 100% với một câu hỏi khác trong cùng đề
      if (seenFingerprints.has(qId)) {
        const previousNum = seenFingerprints.get(qId);
        issues.push({
          questionNum: qNum,
          id: qId,
          severity: SEVERITY.UNACCEPTABLE,
          code: "ERR_DUPLICATE_QUESTION",
          title: "Trùng lặp nội dung câu hỏi",
          message: `Nội dung câu hỏi và các phương án giống hệt Câu #${previousNum} (Trùng Smart ID: ${qId}).`,
          suggestion: "Xóa câu trùng lặp này hoặc thay đổi nội dung câu hỏi."
        });
      } else {
        seenFingerprints.set(qId, qNum);
      }

      // ======================================================================
      // NHÓM 2: 🟡 CẢNH BÁO CHẤP NHẬN ĐƯỢC (ACCEPTABLE)
      // ======================================================================

      // 2.1. Cuối câu hỏi thiếu dấu '?'
      if (q.question && !q.question.trim().endsWith("?")) {
        issues.push({
          questionNum: qNum,
          id: qId,
          severity: SEVERITY.ACCEPTABLE,
          code: "WARN_MISSING_QUESTION_MARK",
          title: "Thiếu dấu '?' ở cuối câu",
          message: "Câu hỏi chưa kết thúc bằng dấu chấm hỏi '?' theo quy chuẩn khảo thí.",
          suggestion: "Thêm dấu '?' vào cuối câu hỏi để định dạng đồng bộ."
        });
      }

      // 2.2. Kiểm tra phương án trùng lặp trong cùng câu
      if (q.options && Array.isArray(q.options)) {

        // 2.3. Hai phương án trong cùng 1 câu có nội dung giống hệt nhau
        const optTexts = q.options.map(o => (o.text || "").trim().toLowerCase());
        const duplicates = optTexts.filter((item, index) => optTexts.indexOf(item) !== index && item.length > 0);
        if (duplicates.length > 0) {
          issues.push({
            questionNum: qNum,
            id: qId,
            severity: SEVERITY.ACCEPTABLE,
            code: "WARN_DUPLICATE_OPTION_TEXT",
            title: "Trùng lặp nội dung phương án",
            message: "Phát hiện 2 phương án lựa chọn có nội dung hoàn toàn giống nhau.",
            suggestion: "Đổi nội dung của một trong hai phương án để tránh nhầm lẫn."
          });
        }
      }

      // 2.4. Câu hỏi quá ngắn (< 3 từ)
      if (q.question) {
        const words = q.question.trim().split(/\s+/).filter(Boolean);
        if (words.length > 0 && words.length < 3) {
          issues.push({
            questionNum: qNum,
            id: qId,
            severity: SEVERITY.ACCEPTABLE,
            code: "WARN_SHORT_QUESTION",
            title: "Nội dung câu hỏi quá ngắn",
            message: `Câu hỏi chỉ có ${words.length} từ, có thể chưa diễn đạt đủ ngữ cảnh.`,
            suggestion: "Kiểm tra lại xem câu hỏi có bị mất chữ khi sao chép không."
          });
        }
      }

      return issues;
    }
  };

  return QuizDiagnostics;
}));
