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
    USERS_LIST: "dthu_quiz_users_list_v2",
    MATERIALS: "dthu_quiz_materials_v2",
    SUPPRESSED_WARNINGS: "dthu_quiz_suppressed_warnings_v2",
    SETTINGS: "dthu_quiz_app_settings_v2"
  },

  // Danh mục tất cả các loại cảnh báo hệ thống hỗ trợ ẩn/bật
  KNOWN_WARNINGS: {
    exit_quiz: {
      id: "exit_quiz",
      title: "Rời khỏi phòng thi dở dang",
      description: "Cảnh báo khi bạn đang làm bài thi mà bấm nút thoát ra ngoài."
    },
    submit_early: {
      id: "submit_early",
      title: "Nộp bài thi sớm",
      description: "Cảnh báo khi nộp bài mà còn câu chưa làm hoặc còn câu đang đặt cờ 🚩."
    },
    delete_subject: {
      id: "delete_subject",
      title: "Xóa môn học / Ngân hàng đề thi",
      description: "Cảnh báo khi thực hiện xóa toàn bộ câu hỏi của một môn học."
    },
    reject_draft: {
      id: "reject_draft",
      title: "Từ chối bộ đề thi đóng góp",
      description: "Cảnh báo trước khi Ban biên tập xóa một đề thi chờ duyệt."
    },
    reset_all_data: {
      id: "reset_all_data",
      title: "Khôi phục dữ liệu gốc",
      description: "Cảnh báo trước khi đặt lại toàn bộ dữ liệu ứng dụng về mặc định."
    }
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

  // ── 3. Quản lý Danh Sách Người Dùng & Phân Quyền (User & Roles) ──
  DEFAULT_USERS: [
    {
      id: "USR-01",
      fullName: "Bùi Văn Khang",
      studentId: "220101001",
      department: "Khoa Nông nghiệp - Sinh học",
      role: "admin", // 'admin' | 'editor' | 'student'
      avatar: "👨‍🎓",
      pinCode: "123456",
      permissions: {
        canApproveDrafts: true,
        canEditSubjects: true,
        canManageMaterials: true,
        canManageUsers: true
      },
      totalExp: 520,
      streakDays: 7,
      quizzesCompleted: 18,
      status: "active", // 'active' | 'suspended'
      createdAt: "2026-01-10T08:00:00.000Z"
    },
    {
      id: "USR-02",
      fullName: "Nguyễn Thị Mai",
      studentId: "220102045",
      department: "Khoa Sư phạm Khoa học Xã hội",
      role: "editor",
      avatar: "👩‍🎓",
      pinCode: "123456",
      permissions: {
        canApproveDrafts: true,
        canEditSubjects: false,
        canManageMaterials: true,
        canManageUsers: false
      },
      totalExp: 380,
      streakDays: 4,
      quizzesCompleted: 12,
      status: "active",
      createdAt: "2026-01-15T09:30:00.000Z"
    },
    {
      id: "USR-03",
      fullName: "Trần Minh Hoàng",
      studentId: "220103112",
      department: "Khoa Kỹ thuật - Công nghệ",
      role: "student",
      avatar: "🧑‍💻",
      pinCode: "123456",
      permissions: {
        canApproveDrafts: false,
        canEditSubjects: false,
        canManageMaterials: false,
        canManageUsers: false
      },
      totalExp: 190,
      streakDays: 2,
      quizzesCompleted: 8,
      status: "active",
      createdAt: "2026-02-01T14:20:00.000Z"
    },
    {
      id: "USR-04",
      fullName: "Lê Văn Nam",
      studentId: "220104089",
      department: "Khoa Kinh tế - Quản trị",
      role: "student",
      avatar: "🦁",
      pinCode: "123456",
      permissions: {
        canApproveDrafts: false,
        canEditSubjects: false,
        canManageMaterials: false,
        canManageUsers: false
      },
      totalExp: 110,
      streakDays: 1,
      quizzesCompleted: 4,
      status: "active",
      createdAt: "2026-02-10T10:00:00.000Z"
    }
  ],

  getAllUsers() {
    try {
      const data = localStorage.getItem(this.KEYS.USERS_LIST);
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {}

    this.saveAllUsers(this.DEFAULT_USERS);
    return this.DEFAULT_USERS;
  },

  saveAllUsers(users) {
    localStorage.setItem(this.KEYS.USERS_LIST, JSON.stringify(users));
  },

  getUserById(id) {
    const list = this.getAllUsers();
    return list.find(u => u.id === id) || null;
  },

  getUserByStudentId(studentId) {
    if (!studentId) return null;
    const list = this.getAllUsers();
    return list.find(u => u.studentId && u.studentId.trim().toLowerCase() === studentId.trim().toLowerCase()) || null;
  },

  createUser(userData) {
    const list = this.getAllUsers();
    const existing = this.getUserByStudentId(userData.studentId);
    if (existing) {
      throw new Error(`Mã số sinh viên ${userData.studentId} đã tồn tại trong hệ thống!`);
    }

    const defaultPerms = {
      canApproveDrafts: userData.role === "admin" || userData.role === "editor",
      canEditSubjects: userData.role === "admin",
      canManageMaterials: userData.role === "admin" || userData.role === "editor",
      canManageUsers: userData.role === "admin"
    };

    const newUser = {
      id: "USR-" + Date.now(),
      fullName: userData.fullName || "Sinh viên DThu",
      studentId: userData.studentId || "",
      department: userData.department || "Đại học Đồng Tháp",
      role: userData.role || "student",
      avatar: userData.avatar || "👨‍🎓",
      pinCode: userData.pinCode || "123456",
      permissions: Object.assign({}, defaultPerms, userData.permissions || {}),
      totalExp: userData.totalExp || 0,
      streakDays: 1,
      quizzesCompleted: 0,
      status: userData.status || "active",
      createdAt: new Date().toISOString()
    };

    list.push(newUser);
    this.saveAllUsers(list);
    return newUser;
  },

  updateUser(id, updates) {
    const list = this.getAllUsers();
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) return null;

    list[idx] = Object.assign({}, list[idx], updates);
    this.saveAllUsers(list);

    // Nếu đang chỉnh sửa chính người dùng đang đăng nhập, cập nhật luôn active user profile
    const active = this.getUserProfile();
    if (active && active.id === id) {
      this.saveUserProfile(list[idx]);
    }

    return list[idx];
  },

  deleteUser(id) {
    const list = this.getAllUsers();
    const active = this.getUserProfile();
    if (active && active.id === id) {
      throw new Error("Không thể xóa tài khoản Quản trị viên bạn đang đăng nhập!");
    }

    const filtered = list.filter(u => u.id !== id);
    this.saveAllUsers(filtered);
    return true;
  },

  toggleUserStatus(id) {
    const user = this.getUserById(id);
    if (!user) return null;
    const newStatus = user.status === "active" ? "suspended" : "active";
    return this.updateUser(id, { status: newStatus });
  },

  isLoggedIn() {
    try {
      const data = localStorage.getItem(this.KEYS.USER_PROFILE);
      if (data) {
        const parsed = JSON.parse(data);
        return Boolean(parsed && parsed.id && parsed.role !== "guest");
      }
    } catch (e) {}
    return false;
  },

  logout() {
    localStorage.removeItem(this.KEYS.USER_PROFILE);
    return true;
  },

  getUserProfile() {
    try {
      const data = localStorage.getItem(this.KEYS.USER_PROFILE);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.role !== "guest") {
          return parsed;
        }
      }
    } catch (e) {}

    // Trả về đối tượng Khách (Guest) nếu chưa đăng nhập
    return {
      id: "guest",
      fullName: "Khách (Chưa đăng nhập)",
      studentId: "",
      department: "Trường Đại học Đồng Tháp",
      role: "guest",
      avatar: "👤",
      totalExp: 0,
      quizzesCompleted: 0,
      permissions: {
        canApproveDrafts: false,
        canEditSubjects: false,
        canManageMaterials: false,
        canManageUsers: false
      }
    };
  },

  saveUserProfile(profile) {
    if (!profile || profile.role === "guest") {
      localStorage.removeItem(this.KEYS.USER_PROFILE);
      return;
    }
    localStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(profile));
    // Cập nhật lại trong danh sách người dùng
    const list = this.getAllUsers();
    const idx = list.findIndex(u => u.id === profile.id || (profile.studentId && u.studentId === profile.studentId));
    if (idx !== -1) {
      list[idx] = Object.assign({}, list[idx], profile);
      this.saveAllUsers(list);
    }
  },

  authenticateUser(studentId, pinCode) {
    const user = this.getUserByStudentId(studentId);
    if (!user) {
      throw new Error("Không tìm thấy tài khoản với Mã số sinh viên này!");
    }
    if (user.status === "suspended") {
      throw new Error("Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Admin!");
    }
    if (user.pinCode && user.pinCode !== pinCode) {
      throw new Error("Mã PIN đăng nhập không chính xác!");
    }

    this.saveUserProfile(user);
    return user;
  },

  hasPermission(permissionName) {
    if (!this.isLoggedIn()) return false;
    const profile = this.getUserProfile();
    if (profile.role === "admin") return true;
    if (profile.permissions && profile.permissions[permissionName] === true) return true;
    return false;
  },

  addExp(points, reason = "") {
    if (!this.isLoggedIn()) return 0; // Khách không tích lũy EXP
    const profile = this.getUserProfile();
    profile.totalExp = (profile.totalExp || 0) + points;
    this.saveUserProfile(profile);
    return profile.totalExp;
  },

  switchActiveUser(userId) {
    const user = this.getUserById(userId);
    if (!user) return null;
    this.saveUserProfile(user);
    return user;
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
    if (!this.isLoggedIn()) return; // Khách không lưu ngân hàng câu sai
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

  unsuppressWarning(warningKey) {
    if (!warningKey) return;
    const map = this.getSuppressedWarnings();
    delete map[warningKey];
    localStorage.setItem(this.KEYS.SUPPRESSED_WARNINGS, JSON.stringify(map));
  },

  resetSuppressedWarnings() {
    localStorage.removeItem(this.KEYS.SUPPRESSED_WARNINGS);
  },

  // ── 8. Cài Đặt Hệ Thống & Tùy Chỉnh (Settings) ──────────────
  getAppSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Cấu hình mặc định
    return {
      theme: "light", // 'light' | 'dark' | 'auto'
      accentColor: "blue", // 'blue' | 'emerald' | 'purple' | 'amber'
      fontSize: "normal", // 'normal' | 'large' | 'xlarge'
      toastDuration: 3500, // 3.5 giây
      soundEnabled: true,
      autoScrollToError: true
    };
  },

  saveAppSettings(settings) {
    const current = this.getAppSettings();
    const updated = Object.assign({}, current, settings);
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // ── 9. Sao Lưu & Phục Hồi Toàn Diện Dữ Liệu (Backup & Restore) ──
  exportFullBackupData() {
    return {
      app: "DThu QuizMaster",
      version: "2.0",
      exportDate: new Date().toISOString(),
      userProfile: this.getUserProfile(),
      subjects: this.getSubjects(),
      drafts: this.getDraftSubjects(),
      materials: this.getMaterials(),
      history: this.getHistory(),
      mistakes: this.getMistakes(),
      settings: this.getAppSettings(),
      suppressedWarnings: this.getSuppressedWarnings()
    };
  },

  restoreFullBackupData(backup) {
    if (!backup || typeof backup !== "object") {
      throw new Error("Dữ liệu file sao lưu không hợp lệ!");
    }

    if (backup.userProfile) this.saveUserProfile(backup.userProfile);
    if (backup.subjects) this.saveSubjects(backup.subjects);
    if (backup.drafts) this.saveDraftSubjects(backup.drafts);
    if (backup.materials) this.saveMaterials(backup.materials);
    if (backup.history) localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(backup.history));
    if (backup.mistakes) localStorage.setItem(this.KEYS.MISTAKES, JSON.stringify(backup.mistakes));
    if (backup.settings) this.saveAppSettings(backup.settings);
    if (backup.suppressedWarnings) localStorage.setItem(this.KEYS.SUPPRESSED_WARNINGS, JSON.stringify(backup.suppressedWarnings));

    return true;
  }
};
