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

  // ── TRÍCH XUẤT BỘ CÂU HỎI MẪU CỐ ĐỊNH CHO MÁY KHÁCH (DETERMINISTIC GUEST POOL - TỐI ĐA 50 CÂU) ──
  getDeterministicGuestQuestions(subject, requestedCount = 25, selectedChapters = ["all"]) {
    const allQuestions = subject.questions || [];
    const chapters = subject.chapters || [];
    
    // 1. Lọc các chương mở cho khách
    const allowedChapters = chapters.filter(c => c.isGuestAllowed !== false);
    const allowedChapterIds = allowedChapters.map(c => c.id);

    let eligibleQuestions = allQuestions.filter(q => allowedChapterIds.includes(q.chapterId));

    if (Array.isArray(selectedChapters) && selectedChapters.length > 0 && !selectedChapters.includes("all")) {
      eligibleQuestions = eligibleQuestions.filter(q => selectedChapters.includes(q.chapterId));
    }

    if (eligibleQuestions.length === 0) return [];

    // 2. Sắp xếp ổn định (Deterministic Sort) theo ID câu hỏi để 100% không đổi dù F5
    eligibleQuestions.sort((a, b) => {
      const idA = String(a.id || a.question || "");
      const idB = String(b.id || b.question || "");
      return idA.localeCompare(idB);
    });

    // 3. Phân bổ cố định tối đa 50 câu (Deterministic 50-Pool)
    let fixed50Pool = [];
    if (eligibleQuestions.length <= 50) {
      fixed50Pool = [...eligibleQuestions];
    } else {
      const activeChapters = allowedChapters.filter(c => {
        if (Array.isArray(selectedChapters) && selectedChapters.length > 0 && !selectedChapters.includes("all")) {
          return selectedChapters.includes(c.id);
        }
        return true;
      });

      const totalActiveQ = eligibleQuestions.length;
      const targetMax = 50;

      activeChapters.forEach(c => {
        const chapQ = eligibleQuestions.filter(q => q.chapterId === c.id);
        if (chapQ.length > 0) {
          const quota = Math.max(1, Math.round((chapQ.length / totalActiveQ) * targetMax));
          fixed50Pool.push(...chapQ.slice(0, quota));
        }
      });

      if (fixed50Pool.length > 50) {
        fixed50Pool = fixed50Pool.slice(0, 50);
      } else if (fixed50Pool.length < 50) {
        const currentIds = new Set(fixed50Pool.map(q => q.id || q.question));
        for (const q of eligibleQuestions) {
          if (fixed50Pool.length >= 50) break;
          const key = q.id || q.question;
          if (!currentIds.has(key)) {
            fixed50Pool.push(q);
            currentIds.add(key);
          }
        }
      }
    }

    // 4. Lấy theo số lượng khách yêu cầu (25 hoặc 50)
    const targetCount = (Number(requestedCount) === 50) ? 50 : 25;
    return fixed50Pool.slice(0, Math.min(targetCount, fixed50Pool.length));
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

    const isLogged = (typeof StorageService !== "undefined" && typeof StorageService.isLoggedIn === "function") ? StorageService.isLoggedIn() : true;

    // ── XỬ LÝ ĐẶC THÙ CHO MÁY KHÁCH (100% OFFLINE GUARD & DETERMINISTIC POOL) ──
    if (!isLogged) {
      if (typeof StorageService !== "undefined" && typeof StorageService.getGuestQuotaInfo === "function") {
        const quota = StorageService.getGuestQuotaInfo();
        if (quota.isLimitReached || quota.isTampered) {
          return {
            subjectId: subject.id,
            subjectName: subject.name,
            mode: "exam",
            questions: [],
            answers: {},
            score: 0,
            totalQuestions: 0,
            timeSpentSeconds: 0,
            isCompleted: false,
            isLimitReached: true,
            startedAt: new Date().toISOString()
          };
        }
      }

      if (subject.isGuestAllowed === false) {
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          mode: "exam",
          questions: [],
          answers: {},
          score: 0,
          totalQuestions: 0,
          timeSpentSeconds: 0,
          isCompleted: false,
          startedAt: new Date().toISOString()
        };
      }

      // Lấy bộ câu hỏi mẫu CỐ ĐỊNH cho khách (25 hoặc 50 câu)
      const targetCount = (Number(questionCount) === 50) ? 50 : 25;
      let pool = this.getDeterministicGuestQuestions(subject, targetCount, chapterIds || (chapterId ? [chapterId] : ["all"]));

      let timeLimitMinutes = (targetCount === 50) ? 45 : 25;
      if (customTimeMinutes) {
        timeLimitMinutes = (Number(customTimeMinutes) === 45) ? 45 : 25;
      }

      if (shuffleOptions) {
        pool = pool.map(q => {
          if (!q.options || q.options.length <= 1) return q;
          const indexedOpts = q.options.map((opt, oi) => ({ ...opt, origIdx: oi }));
          const shuffledOpts = this.shuffleArray(indexedOpts);
          const newAnswerIndex = shuffledOpts.findIndex(opt => opt.origIdx === q.answerIndex);
          const finalOpts = shuffledOpts.map(({ origIdx, ...rest }) => rest);
          return {
            ...q,
            options: finalOpts,
            answerIndex: newAnswerIndex >= 0 ? newAnswerIndex : q.answerIndex
          };
        });
      }

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        mode: "exam",
        questions: pool,
        answers: {},
        flagged: {},
        score: 0,
        totalQuestions: pool.length,
        timeLimitMinutes: timeLimitMinutes,
        timeRemainingSeconds: timeLimitMinutes * 60,
        timeSpentSeconds: 0,
        isCompleted: false,
        instantFeedback: false,
        autoExpandNotes: false,
        repeatMistakes: false,
        warnTime: true,
        autoSubmitOnTimeout: true,
        startedAt: new Date().toISOString()
      };
    }

    // ── XỬ LÝ CHO SINH VIÊN / GIẢNG VIÊN ĐÃ ĐĂNG NHẬP (FULL QUYỀN) ──
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
        const finalOpts = shuffledOpts.map(({ origIdx, ...rest }) => rest);
        return {
          ...q,
          options: finalOpts,
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
      const isAttempted = typeof userAns === 'number' && userAns >= 0;
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
    if (session.mode === "exam") {
      StorageService.saveAttempt(result);
    }

    return { result, details };
  }
};

window.QuizEngine = QuizEngine;
