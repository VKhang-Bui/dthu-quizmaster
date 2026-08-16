/**
 * STORAGE SERVICE
 * Quản lý toàn bộ việc lưu trữ dữ liệu vào LocalStorage của trình duyệt.
 */
const StorageService = {
  KEYS: {
    SUBJECTS: "dthu_quiz_subjects_v1",
    HISTORY: "dthu_quiz_history_v1",
    MISTAKES: "dthu_quiz_mistakes_v1",
    SUPPRESSED_WARNINGS: "dthu_quiz_suppressed_warnings_v1"
  },

  // ── 1. Quản lý Môn học (Subjects) ──────────────────────────
  getSubjects() {
    try {
      const data = localStorage.getItem(this.KEYS.SUBJECTS);
      if (!data) {
        this.saveSubjects(DEFAULT_SUBJECTS);
        return DEFAULT_SUBJECTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading subjects from localStorage", e);
      return DEFAULT_SUBJECTS;
    }
  },

  saveSubjects(subjects) {
    localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  getSubjectById(subjectId) {
    const subjects = this.getSubjects();
    return subjects.find(s => s.id === subjectId) || null;
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
  },

  addQuestionToSubject(subjectId, questionData) {
    const subjects = this.getSubjects();
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return false;

    if (!sub.questions) sub.questions = [];
    sub.questions.push(questionData);
    this.saveSubjects(subjects);
    return true;
  },

  // ── 2. Quản lý Lịch sử Thi (History) ───────────────────────
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
  },

  getLatestScoreForSubject(subjectId) {
    const history = this.getHistory();
    const match = history.find(h => h.subjectId === subjectId);
    return match ? match : null;
  },

  // ── 3. Ngân hàng Câu Sai (Mistake Vault) ────────────────────
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

  // ── 4. Tùy chọn Ẩn Cảnh Báo Lần Sau (Suppressed Warnings) ────
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
