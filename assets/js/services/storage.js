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
    SETTINGS: "dthu_quiz_app_settings_v2",
    RESET_REQUESTS: "dthu_quiz_reset_requests_v2",
    EMAIL_OTPS: "dthu_quiz_email_otps_v2",
    NOTIFICATIONS: "dthu_quiz_notifications_v2",
    CONTRIBUTION_PROGRESS: "dthu_quiz_contrib_progress_v2",
    LEADERBOARD_SETTINGS: "dthu_quiz_leaderboard_settings_v2",
    LEADERBOARD_ARCHIVES: "dthu_quiz_leaderboard_archives_v2",
    SEASONS_LIST: "dthu_quiz_seasons_list_v2",
    AUDIT_LOGS: "dthu_quiz_audit_logs_v2",
    FOLDERS: "dthu_quiz_folders_v2",
    BOOKMARKS: "dthu_quiz_bookmarks_v2",
    RECENT_DOCS: "dthu_quiz_recent_docs_v2"
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

  getSubjectById(id) {
    const list = this.getSubjects();
    let sub = list.find(s => s.id === id);
    if (sub) return sub;
    const drafts = this.getDraftSubjects();
    return drafts.find(d => d.id === id) || null;
  },

  saveSubject(subject) {
    const subjects = this.getSubjects();
    const idx = subjects.findIndex(s => s.id === subject.id);
    if (idx !== -1) {
      subjects[idx] = subject;
    } else {
      subjects.push(subject);
    }
    this.saveSubjects(subjects);

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.saveSubject(subject).catch(e => console.warn("Supabase saveSubject:", e));
    }
  },

  deleteSubject(id) {
    let subjects = this.getSubjects();
    subjects = subjects.filter(s => s.id !== id);
    this.saveSubjects(subjects);

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.deleteSubject(id).catch(e => console.warn("Supabase deleteSubject:", e));
    }
  },

  // ── 2. Quản lý Bộ Đề Draft do Sinh Viên Đóng Góp ────────────
  getDraftSubjects() {
    try {
      const data = localStorage.getItem(this.KEYS.DRAFTS);
      if (!data) {
        return (typeof DataLoader !== "undefined" && DataLoader.FALLBACK_DRAFTS) ? DataLoader.FALLBACK_DRAFTS : [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading drafts from localStorage", e);
      return [];
    }
  },

  saveDraftSubjects(drafts) {
    localStorage.setItem(this.KEYS.DRAFTS, JSON.stringify(drafts));
  },

  getDraftById(id) {
    const drafts = this.getDraftSubjects();
    return drafts.find(d => d.id === id) || null;
  },

  saveDraftSubject(draft) {
    const drafts = this.getDraftSubjects();
    const idx = drafts.findIndex(d => d.id === draft.id);
    if (idx !== -1) {
      drafts[idx] = draft;
    } else {
      drafts.unshift(draft);
    }
    this.saveDraftSubjects(drafts);

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.updateDraftSubject(draft.id, draft).catch(e => console.warn("Supabase updateDraftSubject error:", e));
    }
    return draft;
  },

  addDraftSubject(draftData) {
    const drafts = this.getDraftSubjects();
    const newDraft = {
      id: "draft-" + Date.now(),
      targetSubjectId: draftData.targetSubjectId || null,
      targetChapterId: draftData.targetChapterId || "c1",
      name: draftData.name || "Bộ đề đóng góp mới",
      code: draftData.code || "CONTRIB-" + Math.floor(100 + Math.random() * 900),
      department: draftData.department || "Khoa Nông nghiệp - Sinh học",
      description: draftData.description || "Bộ đề đóng góp từ sinh viên đang chờ Ban biên tập phê duyệt.",
      icon: draftData.icon || "📝",
      author: draftData.author || "Sinh viên DThu",
      authorEmail: draftData.authorEmail || "",
      submissionDate: new Date().toLocaleDateString("vi-VN"),
      isDraft: true,
      status: "pending",
      chapters: draftData.chapters || [{ id: "c1", name: "Chương 1: Tổng hợp" }],
      questions: draftData.questions || []
    };

    drafts.unshift(newDraft);
    this.saveDraftSubjects(drafts);

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.createDraftSubject(newDraft).catch(e => console.warn("Supabase createDraftSubject error:", e));
    }

    return newDraft;
  },

  approveDraft(draftId) {
    const drafts = this.getDraftSubjects();
    const idx = drafts.findIndex(d => d.id === draftId);
    if (idx === -1) return null;

    const draft = drafts[idx];
    const targetSubId = draft.targetSubjectId || draft.subjectId;
    const existingSubjects = this.getSubjects();

    // 1. Tìm xem môn học đích đã tồn tại trong danh sách môn học chưa
    let targetSub = null;
    if (targetSubId && targetSubId !== "NEW") {
      targetSub = existingSubjects.find(s => s.id === targetSubId);
    }
    if (!targetSub && draft.code) {
      targetSub = existingSubjects.find(s => s.code && s.code.toLowerCase() === draft.code.toLowerCase());
    }
    if (!targetSub && draft.name) {
      targetSub = existingSubjects.find(s => s.name && s.name.toLowerCase() === draft.name.toLowerCase());
    }

    let finalSubject = null;

    if (targetSub) {
      // 🟢 TRƯỜNG HỢP 1: MÔN HỌC ĐÃ TỒN TẠI → GỘP CÂU HỎI VÀO MÔN ĐÓ
      if (!targetSub.questions) targetSub.questions = [];

      const newQuestions = (draft.questions || []).map((q, qIdx) => ({
        id: `q-${Date.now()}-${qIdx}-${Math.floor(Math.random() * 1000)}`,
        chapterId: q.chapterId || draft.targetChapterId || "c1",
        question: q.question,
        options: q.options,
        answerIndex: (typeof q.answerIndex === "number") ? q.answerIndex : 0
      }));

      targetSub.questions.push(...newQuestions);

      // Nếu draft có chapters mới chưa có trong môn học, gộp thêm vào
      if (draft.chapters && Array.isArray(draft.chapters)) {
        if (!targetSub.chapters) targetSub.chapters = [];
        draft.chapters.forEach(dChap => {
          if (!targetSub.chapters.some(c => c.id === dChap.id)) {
            targetSub.chapters.push(dChap);
          }
        });
      }

      this.saveSubject(targetSub);
      finalSubject = targetSub;
    } else {
      // 🟡 TRƯỜNG HỢP 2: MÔN HỌC MỚI HOÀN TOÀN → TẠO THÀNH MÔN MỚI
      const newOfficial = {
        id: (targetSubId && targetSubId !== "NEW") ? targetSubId : ("SUB_" + Date.now()),
        name: draft.name,
        code: draft.code || "GEN101",
        department: draft.department || "Khoa Kỹ thuật - Công nghệ",
        description: draft.description || "Bộ đề thi chính thức.",
        icon: draft.icon || "📚",
        credits: 2,
        durationMinutes: 45,
        passScore: 5.0,
        chapters: (draft.chapters && draft.chapters.length > 0) ? draft.chapters : [
          { id: "c1", name: "Chương 1: Mở đầu & Tổng hợp", questionCount: draft.questions ? draft.questions.length : 0 }
        ],
        questions: (draft.questions || []).map((q, qIdx) => ({
          id: `q-${Date.now()}-${qIdx}`,
          chapterId: q.chapterId || draft.targetChapterId || "c1",
          question: q.question,
          options: q.options,
          answerIndex: (typeof q.answerIndex === "number") ? q.answerIndex : 0
        }))
      };

      this.saveSubject(newOfficial);
      finalSubject = newOfficial;
    }

    // Xóa draft sau khi duyệt
    drafts.splice(idx, 1);
    this.saveDraftSubjects(drafts);

    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.deleteDraftSubject(draftId).catch(e => console.warn("Supabase deleteDraftSubject error:", e));
    }

    const qCount = (draft.questions || []).length;

    // 1. Ghi nhận cống hiến số lượng câu hỏi thực tế cho Tác giả
    let authorUser = null;
    if (draft.authorEmail) authorUser = this.getUserByEmail(draft.authorEmail);
    if (!authorUser && draft.author) {
      authorUser = this.getAllUsers().find(u => draft.author.includes(u.studentId || u.fullName));
    }
    if (authorUser) {
      this.recordQuestionContribution(authorUser.id, qCount, finalSubject.name);
    }

    // 2. Ghi nhận cống hiến kiểm duyệt cho Người duyệt (Reviewer)
    const reviewerProfile = this.getUserProfile();
    if (reviewerProfile && reviewerProfile.id !== "guest") {
      this.recordReviewContribution(reviewerProfile.id, qCount, finalSubject.name);
    }

    return finalSubject;
  },

  rejectDraft(draftId) {
    let drafts = this.getDraftSubjects();
    drafts = drafts.filter(d => d.id !== draftId);
    this.saveDraftSubjects(drafts);

    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.deleteDraftSubject(draftId).catch(e => console.warn("Supabase deleteDraftSubject error:", e));
    }

    return true;
  },

  // ── 3. Quản lý Danh Sách Người Dùng & Phân Quyền (User & Roles) ──
  DEFAULT_USERS: [
    {
      id: "USR-01",
      fullName: "Bùi Văn Khang",
      studentId: "admin",
      className: "ADMIN",
      email: "vkhg.bui@gmail.com",
      phone: "",
      department: "Khoa Kỹ thuật - Công nghệ",
      role: "admin",
      avatar: "👨‍🎓",
      pinCode: "000000",
      permissions: {
        canApproveDrafts: true,
        canEditSubjects: true,
        canManageMaterials: true,
        canManageUsers: true
      },
      seasonExp: 1000,
      totalExp: 1000,
      seasonCp: 150,
      contributionPoints: 150,
      cumulativeQuestions: 150,
      cumulativeChars: 12000,
      cumulativeReviewed: 80,
      streakDays: 14,
      quizzesCompleted: 35,
      status: "active",
      createdAt: "2026-01-01T08:00:00.000Z"
    },
    {
      id: "USR-02",
      fullName: "Nguyễn Thị Mai Lan",
      studentId: "0024418102",
      className: "ĐHSPHOA24A",
      email: "0024418102@dthu.edu.vn",
      phone: "0912345601",
      department: "Khoa Sư phạm KHTN",
      role: "student",
      avatar: "👩‍🎓",
      pinCode: "123456",
      permissions: { canApproveDrafts: false, canEditSubjects: false, canManageMaterials: false, canManageUsers: false },
      seasonExp: 580,
      totalExp: 580,
      seasonCp: 120,
      contributionPoints: 120,
      cumulativeQuestions: 1200,
      cumulativeChars: 45000,
      cumulativeReviewed: 0,
      streakDays: 10,
      quizzesCompleted: 28,
      status: "active",
      createdAt: "2026-01-05T08:00:00.000Z"
    },
    {
      id: "USR-03",
      fullName: "Trần Minh Đức",
      studentId: "0024418205",
      className: "ĐHLLCT24B",
      email: "0024418205@dthu.edu.vn",
      phone: "0912345602",
      department: "Khoa Lý luận Chính trị",
      role: "student",
      avatar: "👨‍🎓",
      pinCode: "123456",
      permissions: { canApproveDrafts: false, canEditSubjects: false, canManageMaterials: false, canManageUsers: false },
      seasonExp: 420,
      totalExp: 420,
      seasonCp: 85,
      contributionPoints: 85,
      cumulativeQuestions: 850,
      cumulativeChars: 25000,
      cumulativeReviewed: 0,
      streakDays: 7,
      quizzesCompleted: 22,
      status: "active",
      createdAt: "2026-01-10T08:00:00.000Z"
    },
    {
      id: "USR-04",
      fullName: "Lê Hoàng Phúc",
      studentId: "0024418318",
      className: "ĐHTOAN24A",
      email: "0024418318@dthu.edu.vn",
      phone: "0912345603",
      department: "Khoa Sư phạm Toán - Tin",
      role: "student",
      avatar: "👨‍💻",
      pinCode: "123456",
      permissions: { canApproveDrafts: false, canEditSubjects: false, canManageMaterials: false, canManageUsers: false },
      seasonExp: 350,
      totalExp: 350,
      seasonCp: 60,
      contributionPoints: 60,
      cumulativeQuestions: 600,
      cumulativeChars: 18000,
      cumulativeReviewed: 0,
      streakDays: 5,
      quizzesCompleted: 18,
      status: "active",
      createdAt: "2026-01-15T08:00:00.000Z"
    },
    {
      id: "USR-05",
      fullName: "Phạm Ngọc Hân",
      studentId: "0024418420",
      className: "ĐHNN24C",
      email: "0024418420@dthu.edu.vn",
      phone: "0912345604",
      department: "Khoa Ngoại ngữ",
      role: "student",
      avatar: "👩‍💼",
      pinCode: "123456",
      permissions: { canApproveDrafts: false, canEditSubjects: false, canManageMaterials: false, canManageUsers: false },
      seasonExp: 290,
      totalExp: 290,
      seasonCp: 45,
      contributionPoints: 45,
      cumulativeQuestions: 450,
      cumulativeChars: 12000,
      cumulativeReviewed: 0,
      streakDays: 4,
      quizzesCompleted: 14,
      status: "active",
      createdAt: "2026-01-20T08:00:00.000Z"
    },
    {
      id: "USR-06",
      fullName: "Đặng Gia Huy",
      studentId: "0024418531",
      className: "ĐHNONG24A",
      email: "0024418531@dthu.edu.vn",
      phone: "0912345605",
      department: "Khoa Nông nghiệp - Sinh học",
      role: "student",
      avatar: "👨‍🌾",
      pinCode: "123456",
      permissions: { canApproveDrafts: false, canEditSubjects: false, canManageMaterials: false, canManageUsers: false },
      seasonExp: 210,
      totalExp: 210,
      seasonCp: 30,
      contributionPoints: 30,
      cumulativeQuestions: 300,
      cumulativeChars: 8000,
      cumulativeReviewed: 0,
      streakDays: 3,
      quizzesCompleted: 11,
      status: "active",
      createdAt: "2026-01-25T08:00:00.000Z"
    }
  ],

  getAllUsers() {
    try {
      const data = localStorage.getItem(this.KEYS.USERS_LIST);
      if (data) {
        let list = JSON.parse(data);
        if (Array.isArray(list)) {
          // Lọc bỏ triệt để các tài khoản đã bị xóa (status === 'rejected')
          let validList = list.filter(u => u && u.status !== "rejected");

          // Tự động chuẩn hóa seasonExp và seasonCp nếu chưa có
          validList.forEach(u => {
            if (typeof u.seasonExp !== "number") u.seasonExp = u.totalExp || 0;
            if (typeof u.seasonCp !== "number") u.seasonCp = u.contributionPoints || 0;
          });

          // Tự động đồng bộ hồ sơ Admin USR-01 nếu phát hiện thông tin cũ
          const adminIdx = validList.findIndex(u => u.id === "USR-01" || u.role === "admin");
          if (adminIdx !== -1 && validList[adminIdx].studentId !== "admin") {
            validList[adminIdx] = Object.assign({}, validList[adminIdx], this.DEFAULT_USERS[0]);
            this.saveAllUsers(validList);
          } else if (adminIdx === -1 && this.DEFAULT_USERS.length > 0) {
            validList.unshift(this.DEFAULT_USERS[0]);
            this.saveAllUsers(validList);
          }

          return validList;
        }
      }
    } catch (e) {}

    this.saveAllUsers(this.DEFAULT_USERS);
    return this.DEFAULT_USERS;
  },

  saveAllUsers(users) {
    const valid = Array.isArray(users) ? users.filter(u => u && u.status !== "rejected") : [];
    localStorage.setItem(this.KEYS.USERS_LIST, JSON.stringify(valid));
  },

  getUserById(id) {
    const list = this.getAllUsers();
    return list.find(u => u.id === id) || null;
  },

  getUserByStudentId(studentId) {
    const list = this.getAllUsers();
    return list.find(u => u.studentId && u.studentId.trim().toLowerCase() === studentId.trim().toLowerCase()) || null;
  },

  getUserByEmail(email) {
    const list = this.getAllUsers();
    return list.find(u => u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase()) || null;
  },

  getUserByStudentIdOrEmail(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const list = this.getAllUsers();
    return list.find(u => 
      (u.studentId && u.studentId.trim().toLowerCase() === clean) || 
      (u.email && u.email.trim().toLowerCase() === clean)
    ) || null;
  },

  async syncWithCloud() {
    if (typeof SupabaseClient === "undefined" || !API_CONFIG.isCloudEnabled()) return false;
    try {
      // 1. Đồng bộ người dùng từ Supabase (loại bỏ rejected) và Hợp nhất thông minh (Smart Merge bảo toàn CP & EXP)
      const cloudUsers = await SupabaseClient.getAllUsers();
      if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
        const existingUsers = this.getAllUsers();
        const mappedUsers = cloudUsers
          .filter(u => u && u.status !== "rejected")
          .map(u => {
            const local = existingUsers.find(ex => ex.id === u.id || (u.student_id && ex.studentId === u.student_id)) || {};
            const cloudCp = typeof u.contribution_points === "number" ? u.contribution_points : 0;
            const localCp = typeof local.contributionPoints === "number" ? local.contributionPoints : 0;
            const finalCp = Math.max(cloudCp, localCp);

            const cloudSeasonCp = typeof u.season_cp === "number" ? u.season_cp : 0;
            const localSeasonCp = typeof local.seasonCp === "number" ? local.seasonCp : 0;
            const finalSeasonCp = Math.max(cloudSeasonCp, localSeasonCp, finalCp);

            const cloudExp = typeof u.total_exp === "number" ? u.total_exp : 0;
            const localExp = typeof local.totalExp === "number" ? local.totalExp : 0;
            const finalExp = Math.max(cloudExp, localExp);

            const cloudSeasonExp = typeof u.season_exp === "number" ? u.season_exp : 0;
            const localSeasonExp = typeof local.seasonExp === "number" ? local.seasonExp : 0;
            const finalSeasonExp = Math.max(cloudSeasonExp, localSeasonExp, finalExp);

            return {
              id: u.id,
              studentId: u.student_id || local.studentId || "",
              className: u.class_name || local.className || "",
              fullName: u.full_name || local.fullName || "",
              email: u.email || local.email || "",
              phone: u.phone || local.phone || "",
              department: u.department || local.department || "Shinora Academy",
              role: u.role || local.role || "student",
              pinCode: u.pin_code || local.pinCode || "123456",
              avatar: u.avatar || local.avatar || "👨‍🎓",
              totalExp: finalExp,
              seasonExp: finalSeasonExp,
              contributionPoints: finalCp,
              seasonCp: finalSeasonCp,
              cumulativeQuestions: Math.max(u.cumulative_questions || 0, local.cumulativeQuestions || 0),
              cumulativeChars: Math.max(u.cumulative_chars || 0, local.cumulativeChars || 0),
              cumulativeReviewed: Math.max(u.cumulative_reviewed || 0, local.cumulativeReviewed || 0),
              streakDays: Math.max(u.streak_days || 1, local.streakDays || 1),
              quizzesCompleted: Math.max(u.quizzes_completed || 0, local.quizzesCompleted || 0),
              status: u.status || local.status || "active",
              permissions: u.permissions || local.permissions || {},
              approvedBy: u.approved_by || local.approvedBy || "",
              approvedAt: u.approved_at || local.approvedAt || null,
              createdAt: u.created_at || local.createdAt || new Date().toISOString()
            };
          });

        // Giữ lại các user local nếu cloud chưa có
        existingUsers.forEach(ex => {
          if (!mappedUsers.some(m => m.id === ex.id || (ex.studentId && m.studentId === ex.studentId))) {
            mappedUsers.push(ex);
          }
        });

        this.saveAllUsers(mappedUsers);

        // Đồng bộ lại hồ sơ đang đăng nhập nếu có cập nhật
        const currentProfile = this.getUserProfile();
        if (currentProfile && currentProfile.id && currentProfile.role !== "guest") {
          const fresh = mappedUsers.find(u => u.id === currentProfile.id || (u.studentId && u.studentId === currentProfile.studentId));
          if (fresh) {
            this.saveUserProfile(fresh);
          }
        }
      }

      // 2. Đồng bộ đề thi đóng góp (Drafts)
      const cloudDrafts = await SupabaseClient.getAllDraftSubjects();
      if (Array.isArray(cloudDrafts)) {
        this.saveDraftSubjects(cloudDrafts);
      }

      // 2b. Đồng bộ môn học chính thức (Official Subjects) từ Cloud
      const cloudSubjects = await SupabaseClient.getAllSubjects();
      if (Array.isArray(cloudSubjects) && cloudSubjects.length > 0) {
        // Cloud có dữ liệu → ghi đè localStorage
        this.saveSubjects(cloudSubjects);
      } else {
        // Cloud rỗng → đẩy dữ liệu local lên cloud (seed lần đầu)
        const localSubjects = this.getSubjects();
        if (localSubjects.length > 0) {
          for (const sub of localSubjects) {
            try {
              await SupabaseClient.saveSubject(sub);
            } catch (e) {
              console.warn("Seed subject to cloud:", e);
            }
          }
        }
      }

      // 3. Đồng bộ phiếu hỗ trợ CSKH
      const cloudTickets = await SupabaseClient.getAllSupportTickets();
      if (Array.isArray(cloudTickets) && cloudTickets.length > 0) {
        const mappedTickets = cloudTickets.map(t => ({
          id: t.id,
          ticketId: t.ticket_id,
          userId: t.user_id,
          fullName: t.full_name,
          studentId: t.student_id,
          contact: t.contact,
          email: t.email,
          phone: t.phone,
          issueType: t.issue_type,
          title: t.title,
          content: t.content,
          status: t.status,
          createdAt: t.created_at
        }));
        this.saveResetRequests(mappedTickets);
      }

      return true;
    } catch (err) {
      console.warn("[Cloud Sync Error]:", err);
      return false;
    }
  },

  createUser(userData) {
    const list = this.getAllUsers();
    const existing = this.getUserByStudentId(userData.studentId);
    if (existing) {
      throw new Error(`Mã số sinh viên ${userData.studentId} đã tồn tại trong hệ thống!`);
    }
    if (userData.email && this.getUserByEmail(userData.email)) {
      throw new Error(`Email ${userData.email} đã được đăng ký cho tài khoản khác!`);
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
      className: userData.className || "",
      email: userData.email || "",
      phone: userData.phone || "",
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

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.createUser(newUser).catch(e => console.warn("Supabase createUser error:", e));
    }

    return newUser;
  },

  async registerUser(userData) {
    const list = this.getAllUsers();
    if (!userData.studentId) throw new Error("Mã số sinh viên không được để trống!");
    if (!userData.fullName) throw new Error("Họ và tên không được để trống!");

    // Kiểm tra trùng lặp trên Supabase Cloud trực tiếp
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      try {
        const cloudExisting = await SupabaseClient.getUserByStudentId(userData.studentId);
        if (cloudExisting && cloudExisting.status !== "rejected") {
          throw new Error(`Mã số sinh viên ${userData.studentId} đã tồn tại trong hệ thống!`);
        }
      } catch (e) {
        if (e.message && e.message.includes("tồn tại")) throw e;
      }
    }

    const existingId = this.getUserByStudentId(userData.studentId);
    if (existingId) {
      throw new Error(`Mã số sinh viên ${userData.studentId} đã tồn tại trong hệ thống!`);
    }

    const newUser = {
      id: "USR-" + Date.now(),
      fullName: userData.fullName.trim(),
      studentId: userData.studentId.trim(),
      className: userData.className ? userData.className.trim() : "",
      email: userData.email ? userData.email.trim().toLowerCase() : `${userData.studentId.trim()}@dthu.edu.vn`,
      phone: userData.phone ? userData.phone.trim() : "",
      department: userData.department ? userData.department.trim() : "Khoa Kỹ thuật - Công nghệ",
      role: "student",
      avatar: userData.avatar || "👨‍🎓",
      pinCode: userData.pinCode || "123456",
      permissions: {
        canApproveDrafts: false,
        canEditSubjects: false,
        canManageMaterials: false,
        canManageUsers: false
      },
      totalExp: 50, // Thưởng 50 EXP chào mừng tân sinh viên
      contributionPoints: 0,
      cumulativeQuestions: 0,
      cumulativeChars: 0,
      cumulativeReviewed: 0,
      streakDays: 1,
      quizzesCompleted: 0,
      status: "pending_approval", // ⏳ Chờ Admin hoặc người quản lý duyệt
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      termsVersion: "2026-08-18",
      registeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    list.push(newUser);
    this.saveAllUsers(list);

    // Bắn dữ liệu lên Supabase Cloud và chờ xác nhận
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      try {
        await SupabaseClient.createUser(newUser);
      } catch (e) {
        console.warn("Supabase createUser error:", e);
      }
    }

    return newUser;
  },

  getPendingUsers() {
    const list = this.getAllUsers();
    return list.filter(u => u.status === "pending_approval");
  },

  getActiveUsers() {
    const list = this.getAllUsers();
    return list.filter(u => u.status !== "pending_approval" && u.status !== "rejected");
  },

  approveUserRegistration(userId, adminName = "Shina (Bùi Văn Khang)") {
    const user = this.getUserById(userId);
    if (!user) return null;
    return this.updateUser(userId, {
      status: "active",
      approvedAt: new Date().toISOString(),
      approvedBy: adminName
    });
  },

  async rejectUserRegistration(userId) {
    return await this.deleteUser(userId);
  },

  // ── 3.1. Quản lý Yêu Cầu Khôi Phục Mã PIN & CSKH ────────────
  getResetRequests() {
    try {
      const data = localStorage.getItem(this.KEYS.RESET_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveResetRequests(requests) {
    localStorage.setItem(this.KEYS.RESET_REQUESTS, JSON.stringify(requests));
  },

  createResetRequest(data) {
    const requests = this.getResetRequests();
    const newReq = {
      id: "REQ-" + Date.now(),
      ticketId: data.ticketId || ("TICKET-" + Math.floor(100000 + Math.random() * 900000)),
      studentId: data.studentId || "",
      fullName: data.fullName || "Học viên",
      contact: data.contact || data.email || data.phone || "",
      email: data.email || "",
      phone: data.phone || "",
      issueType: data.issueType || "Quên mã PIN / Mật khẩu",
      title: data.title || "Yêu cầu cấp lại mã PIN",
      content: data.content || data.note || "Quên mã PIN đăng nhập, yêu cầu cấp lại.",
      note: data.content || data.note || "Quên mã PIN đăng nhập, yêu cầu cấp lại.",
      status: "pending", // 'pending' | 'resolved'
      createdAt: new Date().toISOString()
    };
    requests.unshift(newReq);
    this.saveResetRequests(requests);

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.createSupportTicket(newReq).catch(e => console.warn("Supabase createSupportTicket error:", e));
    }

    return newReq;
  },

  createSupportTicket(data) {
    return this.createResetRequest(data);
  },

  resolveResetRequest(requestId, newPin = "123456") {
    const requests = this.getResetRequests();
    const req = requests.find(r => r.id === requestId || r.ticketId === requestId);
    if (!req) return null;

    req.status = "resolved";
    req.resolvedAt = new Date().toISOString();
    req.resolvedPin = newPin;
    this.saveResetRequests(requests);

    // Cập nhật mã PIN mới cho tài khoản người dùng nếu có MSSV
    if (req.studentId) {
      const user = this.getUserByStudentId(req.studentId);
      if (user) {
        this.updateUser(user.id, { pinCode: newPin });
      }
    }

    // Đồng bộ trạng thái phiếu trên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.updateSupportTicket(req.ticketId, { status: "resolved", resolved_by: "Admin Shina", resolved_at: new Date().toISOString() }).catch(e => console.warn("Supabase updateSupportTicket error:", e));
    }

    return req;
  },

  // ── 3.2. Quản lý Mã OTP Xác Thực Qua Email (Hạn 300 giây) ────────────
  generateEmailOtp(studentId, email) {
    if (!studentId || !email) {
      throw new Error("Vui lòng nhập đầy đủ cả Mã số sinh viên (MSSV) và Email đăng ký!");
    }

    const cleanId = studentId.trim();
    const cleanEmail = email.trim().toLowerCase();

    const user = this.getUserByStudentId(cleanId);
    if (!user) {
      throw new Error(`Không tìm thấy tài khoản sinh viên với MSSV: ${cleanId}`);
    }

    const userEmail = (user.email || `${user.studentId}@dthu.edu.vn`).trim().toLowerCase();
    if (userEmail !== cleanEmail) {
      throw new Error("Địa chỉ Email không trùng khớp với hồ sơ đăng ký của MSSV này!");
    }

    if (user.status === "pending_approval") {
      throw new Error("Tài khoản của bạn đang chờ Admin phê duyệt, chưa thể thực hiện khôi phục mã PIN!");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirySeconds = 300; // 300 giây = 5 phút
    const expiryTimestamp = Date.now() + expirySeconds * 1000;

    const otpData = {
      userId: user.id,
      studentId: user.studentId,
      email: userEmail,
      otp: otpCode,
      expiresAt: expiryTimestamp,
      expirySeconds: expirySeconds
    };

    localStorage.setItem(this.KEYS.EMAIL_OTPS, JSON.stringify(otpData));
    return {
      success: true,
      user,
      otp: otpCode,
      email: userEmail,
      expiresAt: expiryTimestamp,
      expirySeconds: expirySeconds
    };
  },

  verifyEmailOtpAndResetPin(studentId, email, otp, newPin) {
    const cleanId = (studentId || "").trim();
    const user = this.getUserByStudentId(cleanId);
    if (!user) {
      throw new Error("Không tìm thấy tài khoản người dùng!");
    }

    let storedOtp = null;
    try {
      const raw = localStorage.getItem(this.KEYS.EMAIL_OTPS);
      if (raw) storedOtp = JSON.parse(raw);
    } catch (e) {}

    if (!storedOtp || storedOtp.userId !== user.id) {
      throw new Error("Không tìm thấy phiên xác thực OTP. Vui lòng bấm gửi lại mã!");
    }

    if (Date.now() > storedOtp.expiresAt) {
      throw new Error("⏱️ Mã OTP đã hết hạn hiệu lực (quá 300 giây). Vui lòng gửi lại mã mới!");
    }

    if (storedOtp.otp !== otp.trim()) {
      throw new Error("Mã OTP không chính xác! Vui lòng kiểm tra lại trong hòm thư email.");
    }

    if (!newPin || newPin.trim().length < 4) {
      throw new Error("Mã PIN mới phải có ít nhất 4 đến 6 số!");
    }

    this.updateUser(user.id, { pinCode: newPin.trim() });
    localStorage.removeItem(this.KEYS.EMAIL_OTPS);
    return user;
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

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.updateUser(id, updates).catch(e => console.warn("Supabase updateUser error:", e));
    }

    return list[idx];
  },

  async deleteUser(id) {
    const list = this.getAllUsers();
    const active = this.getUserProfile();
    if (active && active.id === id) {
      throw new Error("Không thể xóa tài khoản Quản trị viên bạn đang đăng nhập!");
    }

    const filtered = list.filter(u => u.id !== id);
    this.saveAllUsers(filtered);

    // Đồng bộ xóa triệt để trên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      try {
        await SupabaseClient.updateUser(id, { status: "rejected" });
      } catch (e) {}
      try {
        await SupabaseClient.deleteUser(id);
      } catch (e) {
        console.warn("Supabase deleteUser error:", e);
      }
    }

    return true;
  },

  async deleteUsers(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return true;
    const active = this.getUserProfile();
    const safeIds = ids.filter(id => !active || id !== active.id);
    if (safeIds.length === 0) return false;

    let list = this.getAllUsers();
    list = list.filter(u => !safeIds.includes(u.id));
    this.saveAllUsers(list);

    // Đồng bộ xóa triệt để trên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      for (const id of safeIds) {
        try {
          await SupabaseClient.updateUser(id, { status: "rejected" });
        } catch (e) {}
        try {
          await SupabaseClient.deleteUser(id);
        } catch (e) {
          console.warn("Supabase deleteUser error:", e);
        }
      }
    }

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
        return Boolean(parsed && parsed.id && parsed.role !== "guest" && parsed.status !== "pending_approval");
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
        if (parsed && parsed.role !== "guest" && parsed.status !== "pending_approval") {
          if (typeof parsed.contributionPoints !== "number") parsed.contributionPoints = 0;
          if (typeof parsed.cumulativeQuestions !== "number") parsed.cumulativeQuestions = 0;
          if (typeof parsed.cumulativeChars !== "number") parsed.cumulativeChars = 0;
          if (typeof parsed.cumulativeReviewed !== "number") parsed.cumulativeReviewed = 0;
          return parsed;
        }
      }
    } catch (e) {}

    // Trả về đối tượng Khách (Guest) nếu chưa đăng nhập
    return {
      id: "guest",
      fullName: "Khách (Chưa đăng nhập)",
      studentId: "",
      email: "",
      department: "Shinora Community",
      role: "guest",
      avatar: "👤",
      totalExp: 0,
      contributionPoints: 0,
      cumulativeQuestions: 0,
      cumulativeChars: 0,
      cumulativeReviewed: 0,
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
    if (user.status === "pending_approval") {
      throw new Error("⏳ Tài khoản của bạn đang chờ Quản trị viên (Admin) phê duyệt trước khi có thể đăng nhập. Vui lòng quay lại sau hoặc liên hệ CSKH!");
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

  // ── 3.2. Quản lý Thang Điểm Học Tập (EXP) & Điểm Cống Hiến (CP) ──
  addExp(points, reason = "", source = "study", silent = false) {
    if (!this.isLoggedIn()) return 0; // Khách không tích lũy EXP
    
    // Tự động áp dụng hệ số nhân EXP của mùa giải đang hoạt động (nếu có)
    const activeSeason = this.getActiveSeason ? this.getActiveSeason() : null;
    const multiplier = (activeSeason && typeof activeSeason.expMultiplier === 'number') ? activeSeason.expMultiplier : 1.0;
    const finalPoints = (points > 0 && multiplier !== 1.0) ? Math.round(points * multiplier) : points;

    const profile = this.getUserProfile();
    profile.totalExp = Math.max(0, (profile.totalExp || 0) + finalPoints);
    profile.seasonExp = Math.max(0, (profile.seasonExp || 0) + finalPoints);
    this.saveUserProfile(profile);

    const list = this.getAllUsers();
    const idx = list.findIndex(u => u.id === profile.id);
    if (idx !== -1) {
      list[idx].totalExp = profile.totalExp;
      list[idx].seasonExp = profile.seasonExp;
      this.saveAllUsers(list);
    }

    // Tự động gửi Thông Báo nếu không phải chế độ im lặng
    if (!silent && finalPoints !== 0) {
      const bonusText = multiplier > 1.0 ? ` (Thưởng hệ số x${multiplier})` : '';
      this.addNotification(profile.id, {
        type: finalPoints > 0 ? "exp_reward" : "admin_adjust",
        title: finalPoints > 0 ? `⚡ Nhận được +${finalPoints} EXP Học Tập${bonusText}` : `⚡ Bị khấu trừ ${Math.abs(finalPoints)} EXP`,
        message: reason || "Rèn luyện và tích cực học tập trên hệ thống.",
        pointsDelta: finalPoints,
        pointType: "EXP"
      });
    }

    // Đồng bộ EXP lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.updateUser(profile.id, { totalExp: profile.totalExp }).catch(() => {});
    }

    return profile.seasonExp;
  },

  addContributionPoints(points, reason = "", silent = false) {
    if (!this.isLoggedIn()) return 0;
    const profile = this.getUserProfile();
    profile.contributionPoints = Math.max(0, (profile.contributionPoints || 0) + points);
    profile.seasonCp = Math.max(0, (profile.seasonCp || 0) + points);
    this.saveUserProfile(profile);

    const list = this.getAllUsers();
    const idx = list.findIndex(u => u.id === profile.id);
    if (idx !== -1) {
      list[idx].contributionPoints = profile.contributionPoints;
      list[idx].seasonCp = profile.seasonCp;
      this.saveAllUsers(list);
    }

    if (!silent && points !== 0) {
      this.addNotification(profile.id, {
        type: "cp_reward",
        title: points > 0 ? `🌟 Thưởng +${points} Điểm Cống Hiến (CP)` : `🌟 Khấu trừ ${Math.abs(points)} Điểm Cống Hiến`,
        message: reason || "Đóng góp dữ liệu đề thi & tài liệu học tập cho Shinora QuizMaster.",
        pointsDelta: points,
        pointType: "CP"
      });
    }

    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.updateUser(profile.id, { contributionPoints: profile.contributionPoints }).catch(() => {});
    }

    return profile.seasonCp;
  },

  // ── 3.3. Tích Lũy Sản Lượng Đóng Góp & Cộng Dồn Ngưỡng (Cumulative Volume) ──
  recordQuestionContribution(userId, questionCount, subjectName = "") {
    if (!userId || userId === "guest" || questionCount <= 0) return 0;
    const user = this.getUserById(userId);
    if (!user) return 0;

    const oldTotal = user.cumulativeQuestions || 0;
    const newTotal = oldTotal + questionCount;
    user.cumulativeQuestions = newTotal;

    // Ngưỡng thưởng: Cứ mỗi 50 câu hỏi đạt chuẩn -> Thưởng +5 CP
    const THRESHOLD = 50;
    const POINTS_PER_TIER = 5;
    const oldTier = Math.floor(oldTotal / THRESHOLD);
    const newTier = Math.floor(newTotal / THRESHOLD);
    const tiersGained = newTier - oldTier;

    let pointsAwarded = 0;
    if (tiersGained > 0) {
      pointsAwarded = tiersGained * POINTS_PER_TIER;
      user.contributionPoints = (user.contributionPoints || 0) + pointsAwarded;
      user.seasonCp = (user.seasonCp || 0) + pointsAwarded;
      this.addNotification(user.id, {
        type: "cp_reward",
        title: `🎉 Đạt mốc ${newTier * THRESHOLD} câu hỏi cống hiến (+${pointsAwarded} CP)`,
        message: `Bộ đề môn "${subjectName}" với ${questionCount} câu hỏi đã được Ban biên tập phê duyệt chính thức! (Tổng tích lũy: ${newTotal} câu).`,
        pointsDelta: pointsAwarded,
        pointType: "CP"
      });
    } else {
      this.addNotification(user.id, {
        type: "draft_approved",
        title: `✅ Bộ đề môn "${subjectName}" đã được phê duyệt!`,
        message: `Đã cộng thêm ${questionCount} câu vào tiến độ tích lũy (Hiện có ${newTotal % THRESHOLD}/${THRESHOLD} câu để nhận mốc +5 CP tiếp theo).`,
        pointsDelta: null,
        pointType: null
      });
    }

    this.updateUser(user.id, {
      cumulativeQuestions: user.cumulativeQuestions,
      contributionPoints: user.contributionPoints,
      seasonCp: user.seasonCp
    });

    return pointsAwarded;
  },

  recordMaterialContribution(userId, charCount, materialTitle = "") {
    if (!userId || userId === "guest" || charCount <= 0) return 0;
    const user = this.getUserById(userId);
    if (!user) return 0;

    const oldTotal = user.cumulativeChars || 0;
    const newTotal = oldTotal + charCount;
    user.cumulativeChars = newTotal;

    // Ngưỡng: Cứ mỗi 5.000 ký tự tài liệu đạt chuẩn -> Thưởng +5 CP
    const THRESHOLD = 5000;
    const POINTS_PER_TIER = 5;
    const oldTier = Math.floor(oldTotal / THRESHOLD);
    const newTier = Math.floor(newTotal / THRESHOLD);
    const tiersGained = newTier - oldTier;

    let pointsAwarded = 0;
    if (tiersGained > 0) {
      pointsAwarded = tiersGained * POINTS_PER_TIER;
      user.contributionPoints = (user.contributionPoints || 0) + pointsAwarded;
      user.seasonCp = (user.seasonCp || 0) + pointsAwarded;
      this.addNotification(user.id, {
        type: "cp_reward",
        title: `📚 Đạt mốc ${newTier * THRESHOLD} ký tự tài liệu cống hiến (+${pointsAwarded} CP)`,
        message: `Tài liệu "${materialTitle}" (${charCount.toLocaleString()} ký tự) đã được đăng tải và chia sẻ thành công! (Tổng tích lũy: ${newTotal.toLocaleString()} ký tự).`,
        pointsDelta: pointsAwarded,
        pointType: "CP"
      });
    } else {
      this.addNotification(user.id, {
        type: "system",
        title: `📚 Đã chia sẻ tài liệu "${materialTitle}"!`,
        message: `Đã cộng thêm ${charCount.toLocaleString()} ký tự vào tiến độ tích lũy (Hiện có ${(newTotal % THRESHOLD).toLocaleString()}/${THRESHOLD.toLocaleString()} ký tự để nhận mốc +5 CP tiếp theo).`,
        pointsDelta: null,
        pointType: null
      });
    }

    this.updateUser(user.id, {
      cumulativeChars: user.cumulativeChars,
      contributionPoints: user.contributionPoints,
      seasonCp: user.seasonCp
    });

    return pointsAwarded;
  },

  recordReviewContribution(userId, questionCount, subjectName = "") {
    if (!userId || userId === "guest" || questionCount <= 0) return 0;
    const user = this.getUserById(userId);
    if (!user) return 0;

    const oldTotal = user.cumulativeReviewed || 0;
    const newTotal = oldTotal + questionCount;
    user.cumulativeReviewed = newTotal;

    // Ngưỡng duyệt: Cứ mỗi 50 câu kiểm duyệt -> Thưởng +3 CP
    const THRESHOLD = 50;
    const POINTS_PER_TIER = 3;
    const oldTier = Math.floor(oldTotal / THRESHOLD);
    const newTier = Math.floor(newTotal / THRESHOLD);
    const tiersGained = newTier - oldTier;

    let pointsAwarded = 0;
    if (tiersGained > 0) {
      pointsAwarded = tiersGained * POINTS_PER_TIER;
      user.contributionPoints = (user.contributionPoints || 0) + pointsAwarded;
      user.seasonCp = (user.seasonCp || 0) + pointsAwarded;
      this.addNotification(user.id, {
        type: "cp_reward",
        title: `🛡️ Đạt mốc ${newTier * THRESHOLD} câu hỏi kiểm duyệt (+${pointsAwarded} CP)`,
        message: `Ban biên tập đã hoàn tất kiểm duyệt môn "${subjectName}" (${questionCount} câu)!`,
        pointsDelta: pointsAwarded,
        pointType: "CP"
      });
    }

    this.updateUser(user.id, {
      cumulativeReviewed: user.cumulativeReviewed,
      contributionPoints: user.contributionPoints,
      seasonCp: user.seasonCp
    });

    return pointsAwarded;
  },

  adminAdjustUserPoints(userId, pointType, amount, scope = "both", reason = "", adminName = "Quản trị viên") {
    const user = this.getUserById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng này!");
    if (!amount || amount === 0) throw new Error("Số điểm điều chỉnh phải khác 0!");
    if (!reason || !reason.trim()) throw new Error("Vui lòng nhập lý do điều chỉnh điểm!");

    const cleanReason = reason.trim();
    if (typeof user.seasonExp !== "number") user.seasonExp = user.totalExp || 0;
    if (typeof user.seasonCp !== "number") user.seasonCp = user.contributionPoints || 0;

    let scopeLabel = "Cả Mùa Này & Tổng Các Mùa";
    if (scope === "season") scopeLabel = "Chỉ Điểm Mùa Này";
    else if (scope === "all_time") scopeLabel = "Chỉ Điểm Tổng Các Mùa";

    if (pointType === "EXP") {
      if (scope === "season" || scope === "both") {
        user.seasonExp = Math.max(0, (user.seasonExp || 0) + amount);
      }
      if (scope === "all_time" || scope === "both") {
        user.totalExp = Math.max(0, (user.totalExp || 0) + amount);
      }
    } else {
      if (scope === "season" || scope === "both") {
        user.seasonCp = Math.max(0, (user.seasonCp || 0) + amount);
      }
      if (scope === "all_time" || scope === "both") {
        user.contributionPoints = Math.max(0, (user.contributionPoints || 0) + amount);
      }
    }

    this.updateUser(user.id, {
      seasonExp: user.seasonExp,
      totalExp: user.totalExp,
      seasonCp: user.seasonCp,
      contributionPoints: user.contributionPoints
    });

    // Tạo thông báo gửi cho User
    this.addNotification(user.id, {
      type: "admin_adjust",
      title: amount > 0 ? `🛡️ ${adminName} đã cộng +${amount} ${pointType} (${scopeLabel})` : `🛡️ ${adminName} đã khấu trừ ${Math.abs(amount)} ${pointType} (${scopeLabel})`,
      message: `Lý do: "${cleanReason}" (Phạm vi: ${scopeLabel} · Thực hiện bởi: ${adminName}).`,
      pointsDelta: amount,
      pointType: pointType
    });

    this.addAuditLog("ADJUST_POINTS", user.fullName, `${amount > 0 ? 'Cộng' : 'Khấu trừ'} ${Math.abs(amount)} ${pointType} (${scopeLabel}). Lý do: "${cleanReason}"`, adminName);

    return user;
  },

  resetUserPoints(userId, resetType = "all", scope = "both", reason = "", adminName = "Quản trị viên") {
    const user = this.getUserById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng này!");
    if (!reason || !reason.trim()) throw new Error("Vui lòng nhập lý do đặt lại (reset) điểm!");

    const cleanReason = reason.trim();
    if (typeof user.seasonExp !== "number") user.seasonExp = user.totalExp || 0;
    if (typeof user.seasonCp !== "number") user.seasonCp = user.contributionPoints || 0;

    let resetDesc = "";
    let scopeDesc = (scope === "season") ? "Điểm Mùa Này" : (scope === "all_time") ? "Điểm Tổng Các Mùa" : "Cả Mùa Này & Tổng Các Mùa";

    if (resetType === "exp" || resetType === "all") {
      if (scope === "season" || scope === "both") user.seasonExp = 0;
      if (scope === "all_time" || scope === "both") user.totalExp = 0;
      resetDesc += "Điểm EXP Học Tập ";
    }
    if (resetType === "cp" || resetType === "all") {
      if (scope === "season" || scope === "both") user.seasonCp = 0;
      if (scope === "all_time" || scope === "both") user.contributionPoints = 0;
      resetDesc += (resetDesc ? "& " : "") + "Điểm Cống Hiến (CP) ";
    }

    this.updateUser(user.id, {
      seasonExp: user.seasonExp,
      totalExp: user.totalExp,
      seasonCp: user.seasonCp,
      contributionPoints: user.contributionPoints
    });

    this.addNotification(user.id, {
      type: "admin_adjust",
      title: `🔄 Đặt Lại (Reset) ${resetDesc}Về 0 (${scopeDesc})`,
      message: `Quản trị viên ${adminName} đã đặt lại ${resetDesc}về 0 (Phạm vi: ${scopeDesc}). Lý do: "${cleanReason}".`,
      pointsDelta: 0,
      pointType: resetType.toUpperCase()
    });

    this.addAuditLog("RESET_USER_POINTS", user.fullName, `Đặt lại ${resetDesc}về 0 (${scopeDesc}). Lý do: "${cleanReason}"`, adminName);

    return user;
  },

  kickUserFromGroup(userId, reason = "", adminName = "Quản trị viên") {
    const user = this.getUserById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng này!");
    if (!reason || !reason.trim()) throw new Error("Vui lòng nhập lý do loại (kick) thành viên khỏi nhóm!");

    const cleanReason = reason.trim();
    user.status = "kicked";
    user.kickedReason = cleanReason;
    user.kickedAt = new Date().toISOString();
    user.kickedBy = adminName;

    this.updateUser(user.id, {
      status: "kicked",
      kickedReason: cleanReason,
      kickedAt: user.kickedAt,
      kickedBy: user.kickedBy
    });

    // Tự động ẩn khỏi Bảng Xếp Hạng công khai
    const settings = this.getLeaderboardSettings();
    if (!settings.hiddenUserIds) settings.hiddenUserIds = [];
    if (!settings.hiddenUserIds.includes(userId)) {
      settings.hiddenUserIds.push(userId);
      this.saveLeaderboardSettings(settings);
    }

    this.addNotification(user.id, {
      type: "system",
      title: `⚠️ Tài Khoản Đã Bị Loại Khỏi Nhóm Học Tập`,
      message: `Tài khoản của bạn đã bị ${adminName} tạm ngưng quyền tham gia trong nhóm. Lý do: "${cleanReason}". Vui lòng liên hệ Admin nếu có khiếu nại.`,
      pointsDelta: null,
      pointType: null
    });

    this.addAuditLog("KICK_USER", user.fullName, `Loại (Kick) thành viên khỏi nhóm. Lý do: "${cleanReason}"`, adminName);

    return user;
  },

  reinstateUserToGroup(userId, adminName = "Quản trị viên") {
    const user = this.getUserById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng này!");

    user.status = "active";
    user.kickedReason = null;

    this.updateUser(user.id, {
      status: "active",
      kickedReason: null
    });

    // Mở lại trên Bảng Xếp Hạng
    const settings = this.getLeaderboardSettings();
    if (settings.hiddenUserIds) {
      settings.hiddenUserIds = settings.hiddenUserIds.filter(id => id !== userId);
      this.saveLeaderboardSettings(settings);
    }

    this.addNotification(user.id, {
      type: "system",
      title: `🎉 Tài Khoản Đã Được Khôi Phục Vào Nhóm Học Tập!`,
      message: `Quản trị viên ${adminName} đã phê duyệt kích hoạt lại tài khoản của bạn vào nhóm. Chúc bạn học tập và thi thử hiệu quả!`,
      pointsDelta: null,
      pointType: null
    });

    this.addAuditLog("REINSTATE_USER", user.fullName, `Khôi phục thành viên vào nhóm học tập và mở lại BXH`, adminName);

    return user;
  },

  // ── 3.4. Quản Lý Thông Báo Cá Nhân (Notification Center) ──
  getNotifications(userId) {
    if (!userId || userId === "guest") return [];
    try {
      const data = localStorage.getItem(this.KEYS.NOTIFICATIONS);
      const allNotifs = data ? JSON.parse(data) : {};
      return Array.isArray(allNotifs[userId]) ? allNotifs[userId] : [];
    } catch (e) {
      return [];
    }
  },

  saveNotifications(userId, list) {
    if (!userId || userId === "guest") return;
    try {
      const data = localStorage.getItem(this.KEYS.NOTIFICATIONS);
      const allNotifs = data ? JSON.parse(data) : {};
      allNotifs[userId] = list;
      localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(allNotifs));
    } catch (e) {}
  },

  addNotification(userId, notif) {
    if (!userId || userId === "guest") return null;
    const list = this.getNotifications(userId);
    const newNotif = {
      id: "NTF-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      userId: userId,
      type: notif.type || "system", // 'exp_reward' | 'cp_reward' | 'admin_adjust' | 'draft_approved' | 'system'
      title: notif.title || "Thông báo mới",
      message: notif.message || "",
      pointsDelta: typeof notif.pointsDelta === "number" ? notif.pointsDelta : null,
      pointType: notif.pointType || null, // 'EXP' | 'CP'
      read: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    if (list.length > 50) list.pop();
    this.saveNotifications(userId, list);
    return newNotif;
  },

  markNotificationAsRead(userId, notifId) {
    const list = this.getNotifications(userId);
    const item = list.find(n => n.id === notifId);
    if (item) {
      item.read = true;
      this.saveNotifications(userId, list);
    }
  },

  markAllNotificationsAsRead(userId) {
    const list = this.getNotifications(userId);
    list.forEach(n => { n.read = true; });
    this.saveNotifications(userId, list);
  },

  deleteNotification(userId, notifId) {
    let list = this.getNotifications(userId);
    list = list.filter(n => n.id !== notifId);
    this.saveNotifications(userId, list);
  },

  getUnreadNotificationCount(userId) {
    if (!userId || userId === "guest") return 0;
    const list = this.getNotifications(userId);
    return list.filter(n => !n.read).length;
  },

  switchActiveUser(userId) {
    const user = this.getUserById(userId);
    if (!user) return null;
    this.saveUserProfile(user);
    return user;
  },

  // ── 4. Quản lý Thư Viện Tài Liệu Số (Knowledge Hub & Folders) ────────────
  getFolders() {
    try {
      const data = localStorage.getItem(this.KEYS.FOLDERS);
      if (data) return JSON.parse(data);
      return (typeof DataLoader !== "undefined" && DataLoader.FALLBACK_FOLDERS) ? DataLoader.FALLBACK_FOLDERS : [];
    } catch (e) {
      return [];
    }
  },

  saveFolders(folders) {
    localStorage.setItem(this.KEYS.FOLDERS, JSON.stringify(folders));
  },

  getFolderById(id) {
    return this.getFolders().find(f => f.id === id) || null;
  },

  createFolder(folderData) {
    const folders = this.getFolders();
    const newFolder = {
      id: folderData.id || ("fld-" + Date.now()),
      parentId: folderData.parentId || null,
      name: folderData.name || "Thư mục mới",
      icon: folderData.icon || "📁",
      description: folderData.description || ""
    };
    folders.push(newFolder);
    this.saveFolders(folders);
    return newFolder;
  },

  deleteFolder(folderId) {
    let folders = this.getFolders();
    folders = folders.filter(f => f.id !== folderId && f.parentId !== folderId);
    this.saveFolders(folders);
  },

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

  getBookmarks() {
    try {
      const data = localStorage.getItem(this.KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isBookmarked(id) {
    return this.getBookmarks().includes(id);
  },

  toggleBookmark(id) {
    const list = this.getBookmarks();
    const idx = list.indexOf(id);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.unshift(id);
    }
    localStorage.setItem(this.KEYS.BOOKMARKS, JSON.stringify(list));
    return idx < 0; // return true if newly bookmarked
  },

  recordRecentDoc(id) {
    try {
      let list = this.getRecentDocs();
      list = list.filter(item => item !== id);
      list.unshift(id);
      if (list.length > 15) list = list.slice(0, 15);
      localStorage.setItem(this.KEYS.RECENT_DOCS, JSON.stringify(list));
    } catch (e) {}
  },

  getRecentDocs() {
    try {
      const data = localStorage.getItem(this.KEYS.RECENT_DOCS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // ── 5. Quản lý Lịch sử Thi & Leaderboard (Lưu tối đa 10 lần thi gần nhất / Tự động xóa sau 30 ngày) ──
  MAX_HISTORY_ITEMS: 10,
  HISTORY_TTL_DAYS: 30,

  cleanExpiredHistory(historyList) {
    if (!Array.isArray(historyList)) return [];
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return historyList.filter(item => {
      if (!item) return false;
      const dateStr = item.completedAt || item.timestamp || item.date || item.createdAt;
      if (!dateStr) return true; // Giữ lại nếu không có trường thời gian
      const itemTime = new Date(dateStr).getTime();
      if (isNaN(itemTime)) return true;
      return (now - itemTime) <= THIRTY_DAYS_MS;
    });
  },

  getHistory() {
    try {
      const data = localStorage.getItem(this.KEYS.HISTORY);
      let list = data ? JSON.parse(data) : [];
      // Tự động dọn dẹp các bài thi đã quá 30 ngày
      const cleaned = this.cleanExpiredHistory(list);
      if (cleaned.length !== list.length) {
        localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      return [];
    }
  },

  getUserExamHistory() {
    const profile = this.getUserProfile();
    const currentUserId = profile ? (profile.id || profile.mssv || 'guest') : 'guest';
    const allHistory = this.getHistory();
    // Lọc lịch sử của user này và chỉ lấy chế độ thi thử (exam), tối đa 10 lần gần nhất
    const maxItems = this.MAX_HISTORY_ITEMS || 10;
    return allHistory
      .filter(h => (h.userId === currentUserId || (!h.userId && currentUserId === 'guest')) && h.mode === 'exam')
      .slice(0, maxItems);
  },

  getAttemptById(attemptId) {
    const allHistory = this.getHistory();
    return allHistory.find(h => h.id === attemptId) || null;
  },

  saveAttempt(attempt) {
    if (!attempt || attempt.mode !== "exam") {
      // TUYỆT ĐỐI KHÔNG LƯU LỊCH SỬ KHI ÔN TẬP (chỉ lưu khi thi thử)
      return;
    }

    const profile = this.getUserProfile();
    const currentUserId = profile ? (profile.id || profile.mssv || 'guest') : 'guest';
    attempt.userId = currentUserId;
    if (!attempt.completedAt) {
      attempt.completedAt = new Date().toISOString();
    }

    let allHistory = this.getHistory();
    // Tách lịch sử của user hiện tại và các user khác
    let userAttempts = allHistory.filter(h => (h.userId === currentUserId || (!h.userId && currentUserId === 'guest')) && h.mode === 'exam');
    let otherAttempts = allHistory.filter(h => h.userId && h.userId !== currentUserId);

    // Đưa lần thi mới nhất lên đầu và chỉ giữ đúng tối đa 10 lần gần nhất
    userAttempts.unshift(attempt);
    const maxItems = this.MAX_HISTORY_ITEMS || 10;
    if (userAttempts.length > maxItems) {
      userAttempts = userAttempts.slice(0, maxItems);
    }

    allHistory = [...userAttempts, ...otherAttempts];
    // Dọn dẹp hết hạn trước khi lưu
    allHistory = this.cleanExpiredHistory(allHistory);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(allHistory));

    // Cập nhật số bài thi hoàn thành của tài khoản
    if (profile && profile.role !== "guest") {
      profile.quizzesCompleted = (profile.quizzesCompleted || 0) + 1;
      this.saveUserProfile(profile);
      if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
        SupabaseClient.updateUser(profile.id, { quizzesCompleted: profile.quizzesCompleted }).catch(() => {});
      }
    }

    // Thưởng EXP cho bài thi thử (Tính chặt chẽ & Công bằng theo số câu và điểm số)
    const totalQ = attempt.totalQuestions || 0;
    const score = (typeof attempt.score10 === "number") ? attempt.score10 : 0;
    const subName = attempt.subjectName || "Môn học";

    if (totalQ >= 5) {
      let expGained = 1;
      let expLabel = `Rèn luyện thi thử môn ${subName} (${score}/10)`;

      if (score >= 9.0) {
        expGained = 15;
        expLabel = `Xuất sắc đạt ${score}/10 môn ${subName}`;
      } else if (score >= 8.0) {
        expGained = 10;
        expLabel = `Giỏi đạt ${score}/10 môn ${subName}`;
      } else if (score >= 6.5) {
        expGained = 6;
        expLabel = `Khá đạt ${score}/10 môn ${subName}`;
      } else if (score >= 5.0) {
        expGained = 3;
        expLabel = `Đạt yêu cầu ${score}/10 môn ${subName}`;
      }

      this.addExp(expGained, expLabel, "quiz");
    }

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.saveQuizHistory(attempt).catch(e => console.warn("Supabase saveQuizHistory error:", e));
    }
  },

  deleteExamAttempt(attemptId) {
    let allHistory = this.getHistory();
    allHistory = allHistory.filter(h => h.id !== attemptId);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(allHistory));
  },

  clearUserExamHistory() {
    const profile = this.getUserProfile();
    const currentUserId = profile ? (profile.id || profile.mssv || 'guest') : 'guest';
    let allHistory = this.getHistory();
    allHistory = allHistory.filter(h => h.userId && h.userId !== currentUserId);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(allHistory));
  },

  getLatestScoreForSubject(subjectId) {
    const history = this.getUserExamHistory();
    const match = history.find(h => h.subjectId === subjectId);
    return match ? match : null;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 5.1. QUẢN TRỊ & CẤU HÌNH BẢNG XẾP HẠNG & MÙA GIẢI (SEASONS & LEADERBOARD)
  // ═════════════════════════════════════════════════════════════════════════
  DEFAULT_SEASONS: [
    {
      id: "season-2026-hk1",
      code: "HK1-2026",
      name: "Học Kỳ 1 (2026 - 2027)",
      description: "Mùa thi đua rèn luyện học tập và ôn thi trực tuyến trên Shinora QuizMaster.",
      startDate: "2026-08-01T00:00:00.000Z",
      endDate: "2026-12-31T23:59:59.000Z",
      status: "active", // 'active' | 'upcoming' | 'completed'
      expMultiplier: 1.0,
      top1Title: "🥇 Hạng 1 (Top 1)",
      top2Title: "🥈 Hạng 2 (Top 2)",
      top3Title: "🥉 Hạng 3 (Top 3)",
      createdAt: "2026-08-01T00:00:00.000Z",
      createdBy: "Shina (Bùi Văn Khang)"
    }
  ],

  getSeasons() {
    try {
      const data = localStorage.getItem(this.KEYS.SEASONS_LIST);
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {}
    this.saveSeasons(this.DEFAULT_SEASONS);
    return this.DEFAULT_SEASONS;
  },

  saveSeasons(seasons) {
    localStorage.setItem(this.KEYS.SEASONS_LIST, JSON.stringify(seasons));
  },

  getActiveSeason() {
    const seasons = this.getSeasons();
    return seasons.find(s => s.status === "active") || seasons[0];
  },

  createSeason(data, adminName = "Quản trị viên") {
    const seasons = this.getSeasons();
    const newId = "season-" + Date.now();
    const code = (data.code || "SEASON-" + Date.now().toString().slice(-4)).toUpperCase();

    const newSeason = {
      id: newId,
      code: code,
      name: data.name || "Mùa giải mới",
      description: data.description || "",
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 90 * 86400000).toISOString(),
      status: data.status || "upcoming",
      expMultiplier: parseFloat(data.expMultiplier) || 1.0,
      top1Title: data.top1Title || "🥇 Hạng 1 (Top 1)",
      top2Title: data.top2Title || "🥈 Hạng 2 (Top 2)",
      top3Title: data.top3Title || "🥉 Hạng 3 (Top 3)",
      createdAt: new Date().toISOString(),
      createdBy: adminName
    };

    let freezeLog = "";
    let resetLog = "";

    if (newSeason.status === "active") {
      // 1. Tự động đóng băng kết quả mùa cũ vào Bảng Vàng Archives nếu được chọn (hoặc đóng băng chuẩn)
      if (data.freezeOld !== false) {
        const currentExpBoard = this.getLeaderboardData("exp", { scope: "season", includeHidden: true, statusFilter: "all" });
        const currentCpBoard = this.getLeaderboardData("cp", { scope: "season", includeHidden: true, statusFilter: "all" });
        const archives = this.getLeaderboardArchives();

        seasons.forEach(s => {
          if (s.status === "active") {
            s.status = "completed";
            s.closedAt = new Date().toISOString();
            s.closedBy = adminName;
            s.frozenStandings = {
              topExp: currentExpBoard.slice(0, 50),
              topCp: currentCpBoard.slice(0, 50)
            };

            const archiveItem = {
              id: s.id,
              seasonName: s.name,
              closedAt: s.closedAt,
              closedBy: adminName,
              wasSeasonReset: !!data.resetPoints,
              topExp: currentExpBoard.slice(0, 20),
              topCp: currentCpBoard.slice(0, 20)
            };
            const existingIdx = archives.findIndex(a => a.id === s.id);
            if (existingIdx !== -1) {
              archives[existingIdx] = archiveItem;
            } else {
              archives.unshift(archiveItem);
            }
            freezeLog = ` (Đã chốt Bảng Vàng mùa cũ "${s.name}")`;
          }
        });
        localStorage.setItem(this.KEYS.LEADERBOARD_ARCHIVES, JSON.stringify(archives));
      } else {
        seasons.forEach(s => {
          if (s.status === "active") s.status = "completed";
        });
      }

      // 2. Đặt lại điểm Mùa Này (seasonExp & seasonCp) về 0 nếu được chọn
      if (data.resetPoints !== false) {
        const allUsers = this.getAllUsers();
        allUsers.forEach(u => {
          u.seasonExp = 0;
          u.seasonCp = 0;
        });
        this.saveAllUsers(allUsers);
        const active = this.getUserProfile();
        if (active && active.id) {
          active.seasonExp = 0;
          active.seasonCp = 0;
          this.saveUserProfile(active);
        }
        resetLog = ` (Đã reset điểm Mùa Này về 0 cho ${allUsers.length} thành viên)`;
      }

      const settings = this.getLeaderboardSettings();
      settings.seasonName = newSeason.name;
      settings.seasonStartDate = newSeason.startDate;
      settings.top1Title = newSeason.top1Title;
      settings.top2Title = newSeason.top2Title;
      settings.top3Title = newSeason.top3Title;
      this.saveLeaderboardSettings(settings);
    }

    seasons.unshift(newSeason);
    this.saveSeasons(seasons);

    this.addAuditLog("CREATE_SEASON", newSeason.name, `Tạo mùa giải mới [${newSeason.code}] với trạng thái: ${newSeason.status}${freezeLog}${resetLog}`, adminName);

    if (newSeason.status === "active") {
      const allUsers = this.getAllUsers();
      allUsers.forEach(u => {
        this.addNotification(u.id, {
          type: "system_announcement",
          title: `🏆 Khởi Động Mùa Giải: ${newSeason.name}`,
          message: `Quản trị viên đã chính thức khởi động mùa thi đua "${newSeason.name}". Chúc bạn đạt được nhiều thành tích cao!`,
          pointsDelta: null,
          pointType: null
        });
      });
    }

    return newSeason;
  },

  updateSeason(id, updates, adminName = "Quản trị viên") {
    const seasons = this.getSeasons();
    const idx = seasons.findIndex(s => s.id === id);
    if (idx === -1) throw new Error("Không tìm thấy mùa giải này!");

    const oldName = seasons[idx].name;
    seasons[idx] = Object.assign({}, seasons[idx], updates);
    this.saveSeasons(seasons);

    if (seasons[idx].status === "active") {
      const settings = this.getLeaderboardSettings();
      if (updates.name) settings.seasonName = updates.name;
      if (updates.top1Title) settings.top1Title = updates.top1Title;
      if (updates.top2Title) settings.top2Title = updates.top2Title;
      if (updates.top3Title) settings.top3Title = updates.top3Title;
      this.saveLeaderboardSettings(settings);
    }

    this.addAuditLog("UPDATE_SEASON", seasons[idx].name, `Cập nhật thông số mùa giải "${oldName}"`, adminName);
    return seasons[idx];
  },

  resetActiveSeason(seasonId, reason = "", adminName = "Quản trị viên") {
    const seasons = this.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) throw new Error("Không tìm thấy mùa giải!");
    if (!reason || !reason.trim()) throw new Error("Vui lòng nhập lý do đặt lại mùa giải để gửi thông báo!");

    const allUsers = this.getAllUsers();
    allUsers.forEach(u => {
      u.seasonExp = 0;
      u.seasonCp = 0;
    });
    this.saveAllUsers(allUsers);

    const active = this.getUserProfile();
    if (active && active.id) {
      active.seasonExp = 0;
      active.seasonCp = 0;
      this.saveUserProfile(active);
    }

    this.addAuditLog("RESET_SEASON", season.name, `Đặt lại toàn bộ điểm thi đua Mùa Này về 0. Lý do: "${reason.trim()}"`, adminName);

    allUsers.forEach(u => {
      this.addNotification(u.id, {
        type: "system_announcement",
        title: `🔄 Đặt Lại Điểm Thi Đua Mùa Giải: ${season.name}`,
        message: `Quản trị viên ${adminName} đã đặt lại điểm Mùa Này về 0. Lý do: "${reason.trim()}". (Điểm Tổng All-Time được bảo lưu 100%).`,
        pointsDelta: null,
        pointType: null
      });
    });

    return true;
  },

  freezeAndEndSeason(seasonId, adminName = "Quản trị viên") {
    const seasons = this.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) throw new Error("Không tìm thấy mùa giải!");

    const currentExpBoard = this.getLeaderboardData("exp", { scope: "season", includeHidden: true, statusFilter: "all" });
    const currentCpBoard = this.getLeaderboardData("cp", { scope: "season", includeHidden: true, statusFilter: "all" });

    season.status = "completed";
    season.closedAt = new Date().toISOString();
    season.closedBy = adminName;
    season.frozenStandings = {
      topExp: currentExpBoard.slice(0, 50),
      topCp: currentCpBoard.slice(0, 50)
    };

    this.saveSeasons(seasons);

    const archiveItem = {
      id: season.id,
      seasonName: season.name,
      closedAt: season.closedAt,
      closedBy: adminName,
      wasSeasonReset: true,
      topExp: currentExpBoard.slice(0, 20),
      topCp: currentCpBoard.slice(0, 20)
    };
    const archives = this.getLeaderboardArchives().filter(a => a.id !== season.id);
    archives.unshift(archiveItem);
    localStorage.setItem(this.KEYS.LEADERBOARD_ARCHIVES, JSON.stringify(archives));

    this.addAuditLog("FREEZE_SEASON", season.name, `Đóng băng và kết thúc mùa giải "${season.name}" (Lưu Top 50 EXP & CP)`, adminName);

    const top1Exp = currentExpBoard[0] ? currentExpBoard[0].name : "N/A";
    const top1Cp = currentCpBoard[0] ? currentCpBoard[0].name : "N/A";

    const allUsers = this.getAllUsers();
    allUsers.forEach(u => {
      this.addNotification(u.id, {
        type: "system_announcement",
        title: `🏆 Bế Mạc & Vinh Danh Mùa Giải: ${season.name}`,
        message: `Mùa thi đua "${season.name}" đã chính thức kết thúc và đóng băng bảng vàng! Vinh danh Top 1 EXP: ${top1Exp} & Top 1 CP: ${top1Cp}. Chúc mừng tất cả các bạn!`,
        pointsDelta: null,
        pointType: null
      });
    });

    return season;
  },

  activateSeason(seasonId, adminName = "Quản trị viên", resetPoints = false, freezeOld = true) {
    const seasons = this.getSeasons();
    const target = seasons.find(s => s.id === seasonId);
    if (!target) throw new Error("Không tìm thấy mùa giải!");

    let freezeLog = "";
    let resetLog = "";

    if (freezeOld) {
      const currentExpBoard = this.getLeaderboardData("exp", { scope: "season", includeHidden: true, statusFilter: "all" });
      const currentCpBoard = this.getLeaderboardData("cp", { scope: "season", includeHidden: true, statusFilter: "all" });
      const archives = this.getLeaderboardArchives();

      seasons.forEach(s => {
        if (s.id !== seasonId && s.status === "active") {
          s.status = "completed";
          s.closedAt = new Date().toISOString();
          s.closedBy = adminName;
          s.frozenStandings = {
            topExp: currentExpBoard.slice(0, 50),
            topCp: currentCpBoard.slice(0, 50)
          };

          const archiveItem = {
            id: s.id,
            seasonName: s.name,
            closedAt: s.closedAt,
            closedBy: adminName,
            wasSeasonReset: resetPoints,
            topExp: currentExpBoard.slice(0, 20),
            topCp: currentCpBoard.slice(0, 20)
          };
          const existingIdx = archives.findIndex(a => a.id === s.id);
          if (existingIdx !== -1) {
            archives[existingIdx] = archiveItem;
          } else {
            archives.unshift(archiveItem);
          }
          freezeLog = ` (Đã chốt Bảng Vàng mùa cũ "${s.name}")`;
        }
      });
      localStorage.setItem(this.KEYS.LEADERBOARD_ARCHIVES, JSON.stringify(archives));
    } else {
      seasons.forEach(s => {
        if (s.id !== seasonId && s.status === "active") {
          s.status = "completed";
        }
      });
    }

    target.status = "active";

    if (resetPoints) {
      const allUsers = this.getAllUsers();
      allUsers.forEach(u => {
        u.seasonExp = 0;
        u.seasonCp = 0;
      });
      this.saveAllUsers(allUsers);
      const active = this.getUserProfile();
      if (active && active.id) {
        active.seasonExp = 0;
        active.seasonCp = 0;
        this.saveUserProfile(active);
      }
      resetLog = ` (Đã reset điểm Mùa Này về 0)`;
    }

    this.saveSeasons(seasons);

    const settings = this.getLeaderboardSettings();
    settings.seasonName = target.name;
    settings.seasonStartDate = target.startDate || new Date().toISOString();
    settings.top1Title = target.top1Title || settings.top1Title;
    settings.top2Title = target.top2Title || settings.top2Title;
    settings.top3Title = target.top3Title || settings.top3Title;
    this.saveLeaderboardSettings(settings);

    this.addAuditLog("ACTIVATE_SEASON", target.name, `Kích hoạt mùa giải "${target.name}" làm mùa hiện tại${freezeLog}${resetLog}`, adminName);

    const allUsers = this.getAllUsers();
    allUsers.forEach(u => {
      this.addNotification(u.id, {
        type: "system_announcement",
        title: `🏆 Kích Hoạt Mùa Giải: ${target.name}`,
        message: `Hệ thống đã kích hoạt mùa thi đua "${target.name}". ${resetPoints ? 'Điểm Mùa Này đã được làm mới.' : 'Điểm tích lũy được bảo lưu.'} Chúc bạn học tập và thi thử hiệu quả!`,
        pointsDelta: null,
        pointType: null
      });
    });

    return target;
  },

  reopenSeason(seasonId, adminName = "Quản trị viên") {
    return this.activateSeason(seasonId, adminName, false);
  },

  deleteSeason(seasonId, adminName = "Quản trị viên") {
    const seasons = this.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) throw new Error("Không tìm thấy mùa giải để xóa!");

    const activeCount = seasons.filter(s => s.status === "active").length;
    if (season.status === "active" && seasons.length > 1 && activeCount === 1) {
      throw new Error("Không thể xóa mùa giải đang hoạt động duy nhất! Vui lòng kích hoạt một mùa khác trước khi xóa.");
    }

    const filtered = seasons.filter(s => s.id !== seasonId);
    this.saveSeasons(filtered);

    const archives = this.getLeaderboardArchives().filter(a => a.id !== seasonId);
    localStorage.setItem(this.KEYS.LEADERBOARD_ARCHIVES, JSON.stringify(archives));

    this.addAuditLog("DELETE_SEASON", season.name, `Xóa mùa giải [${season.code}] khỏi hệ thống`, adminName);
    return true;
  },

  // ── 5.2. Nhật Ký Kiểm Toán Quản Trị (Admin Audit Logs) ────────
  getAuditLogs() {
    try {
      const data = localStorage.getItem(this.KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addAuditLog(action, target, details, adminName = "Quản trị viên") {
    const logs = this.getAuditLogs();
    const newLog = {
      id: "audit-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      adminName: adminName || "Quản trị viên",
      action: action,
      target: target || "Hệ thống",
      details: details || ""
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.length = 200;
    localStorage.setItem(this.KEYS.AUDIT_LOGS, JSON.stringify(logs));
    return newLog;
  },

  clearAuditLogs(adminName = "Quản trị viên") {
    localStorage.removeItem(this.KEYS.AUDIT_LOGS);
    this.addAuditLog("CLEAR_LOGS", "Audit Logs", "Xóa toàn bộ lịch sử nhật ký kiểm toán", adminName);
  },

  getLeaderboardSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.LEADERBOARD_SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed.isPublic !== "boolean") parsed.isPublic = true;
        if (!parsed.maxDisplayCount) parsed.maxDisplayCount = "all";
        return parsed;
      }
    } catch (e) {}
    const activeSeason = this.getActiveSeason ? this.getActiveSeason() : null;
    return {
      seasonName: (activeSeason && activeSeason.name) || "Học Kỳ 1 (2026 - 2027)",
      isPublic: true,
      maxDisplayCount: "all",
      expMultiplier: 1.0,
      top1Title: "🥇 Hạng 1 (Top 1)",
      top2Title: "🥈 Hạng 2 (Top 2)",
      top3Title: "🥉 Hạng 3 (Top 3)",
      hiddenUserIds: [],
      customBadges: {},
      seasonStartDate: new Date().toISOString()
    };
  },

  saveLeaderboardSettings(settings) {
    localStorage.setItem(this.KEYS.LEADERBOARD_SETTINGS, JSON.stringify(settings));
  },

  toggleHideUserFromLeaderboard(userId) {
    const settings = this.getLeaderboardSettings();
    if (!settings.hiddenUserIds) settings.hiddenUserIds = [];
    const idx = settings.hiddenUserIds.indexOf(userId);
    let isHidden = false;
    if (idx >= 0) {
      settings.hiddenUserIds.splice(idx, 1);
      isHidden = false;
    } else {
      settings.hiddenUserIds.push(userId);
      isHidden = true;
    }
    this.saveLeaderboardSettings(settings);
    const user = this.getUserById(userId);
    const uName = user ? user.fullName : userId;
    this.addAuditLog("TOGGLE_HIDE_LEADERBOARD", uName, `${isHidden ? 'Ẩn' : 'Cho hiện'} trên Bảng Xếp Hạng công khai`);
    return isHidden;
  },

  setCustomUserBadge(userId, badgeText, adminName = "Quản trị viên") {
    const settings = this.getLeaderboardSettings();
    if (!settings.customBadges) settings.customBadges = {};
    const oldBadge = settings.customBadges[userId] || "(Không có)";
    if (!badgeText || !badgeText.trim()) {
      delete settings.customBadges[userId];
    } else {
      settings.customBadges[userId] = badgeText.trim();
    }
    this.saveLeaderboardSettings(settings);

    const user = this.getUserById(userId);
    const uName = user ? user.fullName : userId;
    this.addAuditLog("AWARD_BADGE", uName, badgeText ? `Trao huy hiệu đặc cách "${badgeText.trim()}"` : `Gỡ huy hiệu đặc cách "${oldBadge}"`, adminName);

    if (badgeText && badgeText.trim()) {
      this.addNotification(userId, {
        type: "system",
        title: `🎖️ Bạn Đã Được Trao Danh Hiệu Đặc Cách: "${badgeText.trim()}"`,
        message: `Quản trị viên ${adminName} đã trao tặng bạn danh hiệu vinh danh "${badgeText.trim()}" hiển thị trên Bảng Xếp Hạng toàn trường!`,
        pointsDelta: null,
        pointType: null
      });
    }
  },

  getLeaderboardArchives() {
    try {
      const data = localStorage.getItem(this.KEYS.LEADERBOARD_ARCHIVES);
      if (data) return JSON.parse(data);
    } catch (e) {}

    const seasons = this.getSeasons ? this.getSeasons().filter(s => s.status === "completed") : [];
    if (seasons.length > 0) {
      const converted = seasons.map(s => ({
        id: s.id,
        seasonName: s.name,
        closedAt: s.closedAt || s.endDate || s.createdAt,
        closedBy: s.closedBy || s.createdBy || "Admin",
        wasSeasonReset: true,
        topExp: (s.frozenStandings && s.frozenStandings.topExp) || [],
        topCp: (s.frozenStandings && s.frozenStandings.topCp) || []
      }));
      return converted;
    }
    return [];
  },

  startNewSeason(seasonName, adminName = "Admin", resetSeasonPoints = true) {
    return this.createSeason({
      name: seasonName,
      status: "active",
      resetPoints: resetSeasonPoints
    }, adminName);
  },

  getLeaderboardStats(scope = "season") {
    const allUsers = this.getAllUsers().filter(u => u.status === "active");
    const subjects = this.getSubjects();
    const materials = this.getMaterials();

    let totalExp = 0;
    let totalCp = 0;
    let totalQuestions = 0;

    allUsers.forEach(u => {
      totalExp += (scope === "all_time" ? (u.totalExp || 0) : (typeof u.seasonExp === "number" ? u.seasonExp : (u.totalExp || 0)));
      totalCp += (scope === "all_time" ? (u.contributionPoints || 0) : (typeof u.seasonCp === "number" ? u.seasonCp : (u.contributionPoints || 0)));
    });

    subjects.forEach(s => {
      if (s.questions) totalQuestions += s.questions.length;
    });

    return {
      totalStudents: allUsers.length,
      totalExp,
      totalCp,
      totalQuestions,
      totalMaterials: materials.length
    };
  },

  getLeaderboardData(type = "exp", options = {}) {
    const profile = this.getUserProfile();
    const settings = this.getLeaderboardSettings();
    const hiddenIds = settings.hiddenUserIds || [];
    const customBadges = settings.customBadges || {};
    const includeHidden = options.includeHidden || false;
    const filterDept = options.department || "all";
    const searchQuery = (options.search || "").toLowerCase().trim();
    const scope = options.scope || "season"; // 'season' | 'all_time'
    const statusFilter = options.statusFilter || "active"; // 'active' | 'kicked' | 'pending_approval' | 'all'

    let allUsers = this.getAllUsers();

    // Lọc theo trạng thái nhóm / tài khoản
    if (statusFilter === "active") {
      allUsers = allUsers.filter(u => u.status === "active");
    } else if (statusFilter === "kicked") {
      allUsers = allUsers.filter(u => u.status === "kicked" || u.status === "suspended");
    } else if (statusFilter === "pending_approval") {
      allUsers = allUsers.filter(u => u.status === "pending_approval");
    }

    if (!includeHidden) {
      allUsers = allUsers.filter(u => !hiddenIds.includes(u.id));
    }

    if (filterDept && filterDept !== "all") {
      allUsers = allUsers.filter(u => u.department === filterDept);
    }

    if (searchQuery) {
      allUsers = allUsers.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(searchQuery)) ||
        (u.studentId && u.studentId.toLowerCase().includes(searchQuery)) ||
        (u.department && u.department.toLowerCase().includes(searchQuery))
      );
    }

    if (type === "cp") {
      // Bảng xếp hạng Điểm Cống Hiến (Contribution Points - CP)
      let list = allUsers.map(u => {
        const cpVal = (scope === "all_time") ? (u.contributionPoints || 0) : (typeof u.seasonCp === "number" ? u.seasonCp : (u.contributionPoints || 0));
        return {
          id: u.id,
          name: (profile.id === u.id) ? `${u.fullName} (Bạn)` : u.fullName,
          rawName: u.fullName,
          studentId: u.studentId || "Chưa cập nhật",
          className: u.className || "Chưa cập nhật",
          email: u.email || "",
          department: u.department || "Shinora Academy",
          status: u.status || "active",
          kickedReason: u.kickedReason || null,
          cp: cpVal,
          seasonCp: typeof u.seasonCp === "number" ? u.seasonCp : (u.contributionPoints || 0),
          contributionPoints: u.contributionPoints || 0,
          seasonExp: typeof u.seasonExp === "number" ? u.seasonExp : (u.totalExp || 0),
          totalExp: u.totalExp || 0,
          questions: u.cumulativeQuestions || 0,
          chars: u.cumulativeChars || 0,
          isHidden: hiddenIds.includes(u.id),
          customBadge: customBadges[u.id] || null,
          isCurrentUser: (profile.id === u.id)
        };
      });

      return list.sort((a, b) => b.cp - a.cp).map((item, index) => {
        let badge = customBadges[item.id] || (index === 0 ? (settings.top1Title || "🥇 Hạng 1") : (index === 1 ? (settings.top2Title || "🥈 Hạng 2") : (index === 2 ? (settings.top3Title || "🥉 Hạng 3") : "🌟 Đóng Góp")));
        return {
          ...item,
          rank: index + 1,
          badge
        };
      });
    }

    // Mặc định: Bảng xếp hạng Điểm Học Tập (EXP)
    let list = allUsers.map(u => {
      const expVal = (scope === "all_time") ? (u.totalExp || 0) : (typeof u.seasonExp === "number" ? u.seasonExp : (u.totalExp || 0));
      return {
        id: u.id,
        name: (profile.id === u.id) ? `${u.fullName} (Bạn)` : u.fullName,
        rawName: u.fullName,
        studentId: u.studentId || "Chưa cập nhật",
        className: u.className || "Chưa cập nhật",
        email: u.email || "",
        department: u.department || "Shinora Academy",
        status: u.status || "active",
        kickedReason: u.kickedReason || null,
        exp: expVal,
        seasonExp: typeof u.seasonExp === "number" ? u.seasonExp : (u.totalExp || 0),
        totalExp: u.totalExp || 0,
        seasonCp: typeof u.seasonCp === "number" ? u.seasonCp : (u.contributionPoints || 0),
        contributionPoints: u.contributionPoints || 0,
        quizzes: u.quizzesCompleted || 0,
        isHidden: hiddenIds.includes(u.id),
        customBadge: customBadges[u.id] || null,
        isCurrentUser: (profile.id === u.id)
      };
    });

    return list.sort((a, b) => b.exp - a.exp).map((item, index) => {
      let badge = customBadges[item.id] || (index === 0 ? (settings.top1Title || "🥇 Hạng 1") : (index === 1 ? (settings.top2Title || "🥈 Hạng 2") : (index === 2 ? (settings.top3Title || "🥉 Hạng 3") : "⭐ Chăm Chỉ")));
      return {
        ...item,
        rank: index + 1,
        badge
      };
    });
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
      autoScrollToError: true,
      warnOnLeaveQuiz: true // Cảnh báo khi đóng tab / rời phòng thi dở dang
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
      app: "Shinora QuizMaster",
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
  },

  // ── 10. THỐNG KÊ LƯU LƯỢNG & TRUY CẬP THỰC TẾ (REAL TRAFFIC ANALYTICS) ──
  recordVisit() {
    try {
      const KEY = "dthu_quiz_traffic_stats_v2";
      let stats = {};
      try {
        stats = JSON.parse(localStorage.getItem(KEY)) || {};
      } catch (e) {
        stats = {};
      }

      // Khởi tạo lượt xem thực tế ban đầu (bắt đầu từ 1 nếu chưa có)
      let totalVisits = typeof stats.totalVisits === "number" ? stats.totalVisits : 1;
      let todayVisits = typeof stats.todayVisits === "number" ? stats.todayVisits : 1;
      const todayStr = new Date().toISOString().split("T")[0];

      if (stats.lastDate !== todayStr) {
        todayVisits = 0;
        stats.lastDate = todayStr;
      }

      // CHỐNG SPAM F5 RELOAD:
      // 1. Kiểm tra sessionStorage (cùng tab duyệt web)
      // 2. Kiểm tra khoảng cách thời gian (chỉ tính 1 lượt xem cho cùng 1 phiên 30 phút)
      const SESSION_KEY = "dthu_quiz_session_active";
      const now = Date.now();
      const lastVisitTime = stats.lastVisitTime || 0;
      const isNewSession = (typeof sessionStorage !== "undefined") && !sessionStorage.getItem(SESSION_KEY);
      const isPastTimeout = (now - lastVisitTime) > (30 * 60 * 1000); // 30 phút

      if (isNewSession || isPastTimeout) {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(SESSION_KEY, now.toString());
        }
        totalVisits += 1;
        todayVisits += 1;
        stats.lastVisitTime = now;
      }

      // Ghi nhận Heartbeat Online của tab/phiên duyệt hiện tại (để đếm chính xác số người/tab online thật)
      const TAB_ID_KEY = "dthu_quiz_tab_id";
      let tabId = (typeof sessionStorage !== "undefined") ? sessionStorage.getItem(TAB_ID_KEY) : null;
      if (!tabId && typeof sessionStorage !== "undefined") {
        tabId = "TAB-" + Math.random().toString(36).substring(2, 9) + "-" + Date.now();
        sessionStorage.setItem(TAB_ID_KEY, tabId);
      }

      this.updateActiveOnlineHeartbeat(tabId);

      stats.totalVisits = totalVisits;
      stats.todayVisits = todayVisits;
      stats.lastDate = todayStr;
      stats.lastUpdated = now;

      localStorage.setItem(KEY, JSON.stringify(stats));
      return this.getTrafficStats();
    } catch (err) {
      console.warn("recordVisit error:", err);
      return this.getTrafficStats();
    }
  },

  updateActiveOnlineHeartbeat(tabId) {
    try {
      const HEARTBEAT_KEY = "dthu_quiz_active_heartbeats";
      let heartbeats = {};
      try {
        heartbeats = JSON.parse(localStorage.getItem(HEARTBEAT_KEY)) || {};
      } catch (e) {
        heartbeats = {};
      }

      const now = Date.now();
      if (tabId) {
        heartbeats[tabId] = now;
      }

      // Lọc bỏ các session/tab không gửi tín hiệu trong 45 giây qua
      const activeWindow = 45 * 1000;
      const cleaned = {};
      for (const [id, time] of Object.entries(heartbeats)) {
        if (now - time < activeWindow) {
          cleaned[id] = time;
        }
      }

      localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(cleaned));
      return Math.max(1, Object.keys(cleaned).length);
    } catch (e) {
      return 1;
    }
  },

  getTrafficStats() {
    try {
      const KEY = "dthu_quiz_traffic_stats_v2";
      let stats = {};
      try {
        stats = JSON.parse(localStorage.getItem(KEY)) || {};
      } catch (e) {
        stats = {};
      }

      const totalVisits = stats.totalVisits || 1;
      const todayVisits = stats.todayVisits || 1;

      // Đếm số người online THỰC TẾ từ danh sách heartbeat còn hoạt động
      const tabId = (typeof sessionStorage !== "undefined") ? sessionStorage.getItem("dthu_quiz_tab_id") : null;
      const realOnlineCount = this.updateActiveOnlineHeartbeat(tabId);

      // Đếm lượt thi thực tế 100% từ lịch sử làm bài
      const history = this.getHistory ? this.getHistory() : [];
      const totalAttempts = history.length;

      // Đếm tổng câu hỏi thực tế từ các môn học
      const subjects = this.getSubjects ? this.getSubjects() : [];
      const totalQuestions = subjects.reduce((sum, s) => sum + (s.questions ? s.questions.length : 0), 0);

      return {
        totalVisits,
        totalVisitsFormatted: Number(totalVisits).toLocaleString("vi-VN"),
        todayVisits,
        todayVisitsFormatted: Number(todayVisits).toLocaleString("vi-VN"),
        onlineNow: realOnlineCount,
        totalAttempts,
        totalAttemptsFormatted: Number(totalAttempts).toLocaleString("vi-VN"),
        totalQuestions,
        totalQuestionsFormatted: Number(totalQuestions).toLocaleString("vi-VN")
      };
    } catch (e) {
      return {
        totalVisits: 1,
        totalVisitsFormatted: "1",
        todayVisits: 1,
        todayVisitsFormatted: "1",
        onlineNow: 1,
        totalAttempts: 0,
        totalAttemptsFormatted: "0",
        totalQuestions: 0,
        totalQuestionsFormatted: "0"
      };
    }
  }
};
