/**
 * QUIZ ENGINE SERVICE
 * Xử lý logic trộn đề (Fisher-Yates Shuffle), tính điểm, tạo bài thi, đếm thời gian
 */
const QuizEngine = {
  // Trộn mảng ngẫu nhiên (Fisher-Yates Shuffle)
  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // Tạo bộ câu hỏi cho một phiên làm bài
  createQuizSession(subject, options = {}) {
    const {
      mode = "practice", // 'practice' (ôn tập) hoặc 'exam' (thi thử)
      chapterId = "all", // 'all' hoặc 'c1', 'c2'...
      chapterIds = null, // mảng các chapterId được chọn
      questionCount = "all", // 'all', 10, 20, 30, 40, 50, 100 hoặc số cụ thể
      shuffleQuestions = true,
      shuffleOptions = false,
      customTimeMinutes = null,
      instantFeedback = true, // Hiện đáp án ngay trong ôn tập
      autoExpandNotes = true, // Tự mở giải thích
      repeatMistakes = false, // Lặp lại câu sai đến khi đúng
      warnTime = true,
      autoSubmitOnTimeout = true
    } = options;

    let pool = [...(subject.questions || [])];

    // Lọc theo chương hoặc danh sách các chương được chọn
    if (Array.isArray(chapterIds) && chapterIds.length > 0 && !chapterIds.includes("all")) {
      pool = pool.filter(q => chapterIds.includes(q.chapterId));
    } else if (chapterId && chapterId !== "all") {
      pool = pool.filter(q => q.chapterId === chapterId);
    }

    // Trộn ngẫu nhiên câu hỏi nếu bật
    if (shuffleQuestions) {
      pool = this.shuffleArray(pool);
    }

    // Cắt theo số lượng câu yêu cầu
    if (questionCount !== "all") {
      const count = parseInt(questionCount, 10);
      if (!isNaN(count) && count > 0) {
        pool = pool.slice(0, Math.min(count, pool.length));
      }
    }

    // Trộn ngẫu nhiên các phương án A-B-C-D nếu bật
    if (shuffleOptions) {
      pool = pool.map(q => {
        if (!q.options || q.options.length <= 1) return q;
        const indexedOpts = q.options.map((opt, oi) => ({ ...opt, origIdx: oi }));
        const shuffledOpts = this.shuffleArray(indexedOpts);
        const newAnswerIndex = shuffledOpts.findIndex(opt => opt.origIdx === q.answerIndex);
        return {
          ...q,
          options: shuffledOpts,
          answerIndex: newAnswerIndex >= 0 ? newAnswerIndex : q.answerIndex
        };
      });
    }

    // Tính thời gian thi nếu là chế độ exam (Ví dụ: 1 phút / câu hoặc số phút người dùng tùy chọn)
    let timeLimitMinutes = 0;
    if (mode === "exam") {
      if (customTimeMinutes && parseInt(customTimeMinutes, 10) > 0) {
        timeLimitMinutes = parseInt(customTimeMinutes, 10);
      } else {
        timeLimitMinutes = Math.max(5, Math.ceil(pool.length * 1.0));
      }
    }

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      mode,
      chapterId: Array.isArray(chapterIds) ? chapterIds.join(',') : chapterId,
      timeLimitMinutes,
      timeRemainingSeconds: timeLimitMinutes * 60,
      totalQuestions: pool.length,
      questions: pool,
      answers: {}, // { [questionId]: selectedOptionIndex }
      flags: {},
      instantFeedback: (mode === "practice") ? Boolean(instantFeedback) : false,
      autoExpandNotes: Boolean(autoExpandNotes),
      repeatMistakes: (mode === "practice") ? Boolean(repeatMistakes) : false,
      warnTime: Boolean(warnTime),
      autoSubmitOnTimeout: Boolean(autoSubmitOnTimeout),
      shuffleQuestions: Boolean(shuffleQuestions),
      shuffleOptions: Boolean(shuffleOptions),
      startedAt: new Date().toISOString(),
      isSubmitted: false
    };
  },

  // Chấm điểm bài thi
  gradeQuiz(session) {
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    const details = [];

    session.questions.forEach((q, idx) => {
      const userAns = session.answers[q.id];
      const isAttempted = userAns !== undefined;
      const isCorrect = isAttempted && userAns === q.answerIndex;

      if (!isAttempted) {
        unattemptedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      details.push({
        index: idx,
        question: q,
        userAnswer: userAns,
        isCorrect
      });
    });

    const total = session.questions.length;
    const score10 = total > 0 ? Number(((correctCount / total) * 10).toFixed(2)) : 0;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const startTime = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
    const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    let gradeTitle = "Cần cố gắng thêm";
    if (score10 >= 9.0) gradeTitle = "Xuất sắc 🎉";
    else if (score10 >= 8.0) gradeTitle = "Giỏi ⭐";
    else if (score10 >= 6.5) gradeTitle = "Khá 👍";
    else if (score10 >= 5.0) gradeTitle = "Đạt Yêu Cầu ✓";

    const result = {
      id: "ATTEMPT-" + Date.now(),
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      mode: session.mode,
      score10,
      percentage,
      correctCount,
      wrongCount,
      unattemptedCount,
      totalQuestions: total,
      timeTakenSeconds,
      gradeTitle,
      isPassed: (score10 >= 5.0),
      completedAt: new Date().toISOString(),
      details: details
    };

    // Lưu vào lịch sử (Chỉ lưu khi thi thử)
    StorageService.saveAttempt(result);

    return { result, details };
  }
};
