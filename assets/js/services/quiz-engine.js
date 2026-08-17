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
      questionCount = "all", // 'all', 10, 20, 40, 50
      shuffleQuestions = true,
      shuffleOptions = false
    } = options;

    let pool = [...(subject.questions || [])];

    // Lọc theo chương nếu chọn
    if (chapterId !== "all") {
      pool = pool.filter(q => q.chapterId === chapterId);
    }

    // Trộn ngẫu nhiên câu hỏi
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

    // Tính thời gian thi nếu là chế độ exam (Ví dụ: 1 phút / câu)
    const timeLimitMinutes = mode === "exam" ? Math.max(5, Math.ceil(pool.length * 1.0)) : 0;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      mode,
      chapterId,
      timeLimitMinutes,
      timeRemainingSeconds: timeLimitMinutes * 60,
      totalQuestions: pool.length,
      questions: pool,
      answers: {}, // { [questionId]: selectedOptionIndex }
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
