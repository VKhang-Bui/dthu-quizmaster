/**
 * STORAGE SERVICE
 * Quản lý toàn bộ việc lưu trữ dữ liệu vào LocalStorage của trình duyệt.
 * Hỗ trợ: Môn học chính thức, Đề thi Draft (Cộng đồng), Hồ sơ người dùng & EXP, Tài liệu học tập.
 */
const StorageService = {
  KEYS: {
    SUBJECTS: "dthu_quiz_subjects_v2",
    DRAFTS: "dthu_quiz_drafts_v2",
    HISTORY: "dthu_quiz_history_v2",
    MISTAKES: "dthu_quiz_mistakes_v2",
    USER_PROFILE: "dthu_quiz_user_profile_v2",
    MATERIALS: "dthu_quiz_materials_v2",
    SUPPRESSED_WARNINGS: "dthu_quiz_suppressed_warnings_v2"
  },

  // ── 1. Quản lý Môn học Chính thức (Official Subjects) ──────
  getSubjects() {
    try {
      const data = localStorage.getItem(this.KEYS.SUBJECTS);
      if (!data) {
        return (typeof DataLoader !== "undefined" && DataLoader.FALLBACK_OFFICIAL) ? DataLoader.FALLBACK_OFFICIAL : [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading subjects from localStorage", e);
      return [];
    }
  },

  saveSubjects(subjects) {
    localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  getSubjectById(subjectId) {
    const subjects = this.getSubjects();
    const match = subjects.find(s => s.id === subjectId);
    if (match) return match;

    // Nếu không có trong chính thức, tìm trong danh sách Drafts
    const drafts = this.getDraftSubjects();
    return drafts.find(d => d.id === subjectId) || null;
  },

  saveSubject(subject) {
    const subjects = this.getSubjects();
    const existingIndex = subjects.findIndex(s => s.id === subject.id);
    if (existingIndex >= 0) {
      subjects[existingIndex] = subject;
    } else {
      subjects.push(subject);
    }
    this.saveSubjects(subjects);
    return subject;
  },

  deleteSubject(subjectId) {
    let subjects = this.getSubjects();
    subjects = subjects.filter(s => s.id !== subjectId);
    this.saveSubjects(subjects);

    // Cũng xóa khỏi drafts nếu có
    let drafts = this.getDraftSubjects();
    drafts = drafts.filter(d => d.id !== subjectId);
    this.saveDraftSubjects(drafts);
  },

  addQuestionToSubject(subjectId, questionData) {
    let isDraft = false;
    let subjects = this.getSubjects();
    let sub = subjects.find(s => s.id === subjectId);
    
    if (!sub) {
      subjects = this.getDraftSubjects();
      sub = subjects.find(s => s.id === subjectId);
      isDraft = true;
    }

    if (!sub) return false;
    if (!sub.questions) sub.questions = [];
    sub.questions.push(questionData);

    if (isDraft) {
      this.saveDraftSubjects(subjects);
    } else {
      this.saveSubjects(subjects);
    }
    return true;
  },

  // ── 2. Quản lý Đề thi Draft & Cộng đồng (Community Submissions) ──
  getDraftSubjects() {
    try {
      const data = localStorage.getItem(this.KEYS.DRAFTS);
      if (!data) {
        return (typeof DataLoader !== "undefined" && DataLoader.FALLBACK_DRAFTS) ? DataLoader.FALLBACK_DRAFTS : [];
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  saveDraftSubjects(drafts) {
    localStorage.setItem(this.KEYS.DRAFTS, JSON.stringify(drafts));
  },

  getDraftById(draftId) {
    const drafts = this.getDraftSubjects();
    return drafts.find(d => d.id === draftId) || null;
  },

  addDraftSubmission(submission) {
    const drafts = this.getDraftSubjects();
    const newSubmission = {
      ...submission,
      id: submission.id || ("DRAFT_" + Date.now()),
      status: "draft",
      submissionDate: new Date().toISOString().split("T")[0]
    };
    drafts.unshift(newSubmission);
    this.saveDraftSubjects(drafts);
    return newSubmission;
  },

  // Duyệt một bộ đề Draft thành đề Chính thức
  approveDraft(draftId) {
    const drafts = this.getDraftSubjects();
    const draftIndex = drafts.findIndex(d => d.id === draftId);
    if (draftIndex === -1) return false;

    const [approvedSubject] = drafts.splice(draftIndex, 1);
    approvedSubject.status = "official";
    approvedSubject.approvedAt = new Date().toISOString();

    // Lưu vào môn học chính thức
    this.saveSubject(approvedSubject);
    this.saveDraftSubjects(drafts);

    // Cộng điểm thưởng EXP cho người dùng
    this.addExp(50, "Đóng góp đề thi được duyệt thành công (+50 EXP)");
    return approvedSubject;
  },

  // Từ chối một bộ đề Draft
  rejectDraft(draftId, reason = "") {
    let drafts = this.getDraftSubjects();
    drafts = drafts.filter(d => d.id !== draftId);
    this.saveDraftSubjects(drafts);
    return true;
  },

  // ── 3. Quản lý Hồ sơ Người Dùng & EXP (User Profile) ────────
  getUserProfile() {
    try {
      const data = localStorage.getItem(this.KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {}

    const defaultProfile = {
      id: "DTHU-USR-01",
      fullName: "Bùi Văn Khang",
      studentId: "220101001",
      department: "Khoa Sư phạm Khoa học Tự nhiên",
      role: "admin", // 'student' hoặc 'admin'
      avatar: "👨‍🎓",
      totalExp: 240,
      streakDays: 5,
      createdAt: new Date().toISOString()
    };
    this.saveUserProfile(defaultProfile);
    return defaultProfile;
  },

  saveUserProfile(profile) {
    localStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  addExp(points, reason = "") {
    const profile = this.getUserProfile();
    profile.totalExp = (profile.totalExp || 0) + points;
    this.saveUserProfile(profile);
    return profile.totalExp;
  },

  switchUserRole(newRole) {
    const profile = this.getUserProfile();
    profile.role = newRole;
    this.saveUserProfile(profile);
    return profile;
  },

  // ── 4. Quản lý Tài Liệu Học Tập (.txt & Tóm tắt) ────────────
  getMaterials() {
    try {
      const data = localStorage.getItem(this.KEYS.MATERIALS);
      if (data) return JSON.parse(data);
      return (typeof DataLoader !== "undefined" && DataLoader.FALLBACK_MATERIALS) ? DataLoader.FALLBACK_MATERIALS : [];
    } catch (e) {
      return [];
    }
  },

  saveMaterials(materials) {
    localStorage.setItem(this.KEYS.MATERIALS, JSON.stringify(materials));
  },

  getMaterialById(id) {
    const list = this.getMaterials();
    return list.find(m => m.id === id) || null;
  },

  // ── 5. Quản lý Lịch sử Thi & Leaderboard ─────────────────────
  getHistory() {
    try {
      const data = localStorage.getItem(this.KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveAttempt(attempt) {
    const history = this.getHistory();
    history.unshift(attempt);
    if (history.length > 50) history.pop();
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));

    // Thưởng EXP cho bài thi
    if (attempt.score10 >= 8.0) {
      this.addExp(20, "Hoàn thành xuất sắc bài thi (+20 EXP)");
    } else if (attempt.score10 >= 5.0) {
      this.addExp(10, "Hoàn thành bài thi đạt yêu cầu (+10 EXP)");
    } else {
      this.addExp(5, "Chăm chỉ làm bài ôn tập (+5 EXP)");
    }
  },

  getLatestScoreForSubject(subjectId) {
    const history = this.getHistory();
    const match = history.find(h => h.subjectId === subjectId);
    return match ? match : null;
  },

  getLeaderboardData() {
    const profile = this.getUserProfile();
    // Bảng xếp hạng mô phỏng kết hợp điểm thực tế của người dùng
    return [
      { rank: 1, name: "Nguyễn Thị Mai Lan", department: "Khoa Sư phạm KHTN", exp: 580, quizzes: 28, badge: "🥇 Thủ Khoa" },
      { rank: 2, name: profile.fullName + " (Bạn)", department: profile.department, exp: profile.totalExp, quizzes: this.getHistory().length + 12, badge: "🥈 Á Khoa", isCurrentUser: true },
      { rank: 3, name: "Trần Minh Đức", department: "Khoa Lý luận Chính trị", exp: 210, quizzes: 15, badge: "🥉 Top 3" },
      { rank: 4, name: "Lê Hoàng Phúc", department: "Khoa Sư phạm Toán - Tin", exp: 195, quizzes: 11, badge: "⭐ Chăm chỉ" },
      { rank: 5, name: "Phạm Ngọc Hân", department: "Khoa Ngoại ngữ", exp: 160, quizzes: 9, badge: "⭐ Tích cực" }
    ].sort((a, b) => b.exp - a.exp).map((item, index) => ({ ...item, rank: index + 1 }));
  },

  // ── 6. Ngân hàng Câu Sai (Mistake Vault) ────────────────────
  getMistakes() {
    try {
      const data = localStorage.getItem(this.KEYS.MISTAKES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  recordMistake(subjectId, question, userWrongAnswerIndex) {
    const mistakes = this.getMistakes();
    const existing = mistakes.find(m => m.subjectId === subjectId && m.question.id === question.id);
    if (existing) {
      existing.wrongCount = (existing.wrongCount || 1) + 1;
      existing.lastWrongDate = new Date().toISOString();
      existing.userWrongAnswerIndex = userWrongAnswerIndex;
    } else {
      mistakes.unshift({
        subjectId,
        question,
        userWrongAnswerIndex,
        wrongCount: 1,
        lastWrongDate: new Date().toISOString()
      });
    }
    localStorage.setItem(this.KEYS.MISTAKES, JSON.stringify(mistakes));
  },

  removeMistake(subjectId, questionId) {
    let mistakes = this.getMistakes();
    mistakes = mistakes.filter(m => !(m.subjectId === subjectId && m.question.id === questionId));
    localStorage.setItem(this.KEYS.MISTAKES, JSON.stringify(mistakes));
  },

  // ── 7. Tùy chọn Ẩn Cảnh Báo Lần Sau (Suppressed Warnings) ────
  getSuppressedWarnings() {
    try {
      const data = localStorage.getItem(this.KEYS.SUPPRESSED_WARNINGS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  isWarningSuppressed(warningKey) {
    if (!warningKey) return false;
    const map = this.getSuppressedWarnings();
    return !!map[warningKey];
  },

  suppressWarning(warningKey) {
    if (!warningKey) return;
    const map = this.getSuppressedWarnings();
    map[warningKey] = true;
    localStorage.setItem(this.KEYS.SUPPRESSED_WARNINGS, JSON.stringify(map));
  },

  resetSuppressedWarnings() {
    localStorage.removeItem(this.KEYS.SUPPRESSED_WARNINGS);
  }
};
