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
    LEADERBOARD_ARCHIVES: "dthu_quiz_leaderboard_archives_v2"
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
      studentId: "0024418475",
      className: "ĐHCNSH24A",
      email: "vkhg.bui@gmail.com",
      phone: "0354616301",
      department: "Khoa Kỹ thuật - Công nghệ",
      role: "admin",
      avatar: "👨‍🎓",
      pinCode: "123456",
      permissions: {
        canApproveDrafts: true,
        canEditSubjects: true,
        canManageMaterials: true,
        canManageUsers: true
      },
      totalExp: 1000,
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
      totalExp: 580,
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
      totalExp: 420,
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
      totalExp: 350,
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
      totalExp: 290,
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
      totalExp: 210,
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
        if (Array.isArray(list) && list.length > 0) {
          // Lọc bỏ triệt để các tài khoản đã bị từ chối / xóa (status === 'rejected')
          let validList = list.filter(u => u && u.status !== "rejected");

          // Tự động đồng bộ hồ sơ Admin USR-01 nếu phát hiện thông tin cũ
          const adminIdx = validList.findIndex(u => u.id === "USR-01" || u.role === "admin");
          if (adminIdx !== -1 && validList[adminIdx].studentId !== "0024418475") {
            validList[adminIdx] = Object.assign({}, validList[adminIdx], this.DEFAULT_USERS[0]);
          }

          // Bổ sung các user mặc định nếu chưa có
          this.DEFAULT_USERS.forEach(defU => {
            if (!validList.some(u => u.id === defU.id || u.studentId === defU.studentId)) {
              validList.push(defU);
            }
          });

          this.saveAllUsers(validList);
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
    if (!studentId) return null;
    const list = this.getAllUsers();
    return list.find(u => u.studentId && u.studentId.trim().toLowerCase() === studentId.trim().toLowerCase()) || null;
  },

  getUserByEmail(email) {
    if (!email) return null;
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
      // 1. Đồng bộ người dùng từ Supabase (loại bỏ rejected)
      const cloudUsers = await SupabaseClient.getAllUsers();
      if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
        const mappedUsers = cloudUsers
          .filter(u => u && u.status !== "rejected")
          .map(u => ({
            id: u.id,
            studentId: u.student_id,
            className: u.class_name || "",
            fullName: u.full_name,
            email: u.email,
            phone: u.phone || "",
            department: u.department || "Khoa Kỹ thuật - Công nghệ",
            role: u.role || "student",
            pinCode: u.pin_code || "123456",
            avatar: u.avatar || "👨‍🎓",
            totalExp: u.total_exp || 0,
            streakDays: u.streak_days || 1,
            quizzesCompleted: u.quizzes_completed || 0,
            status: u.status || "active",
            permissions: u.permissions || {},
            approvedBy: u.approved_by || "",
            approvedAt: u.approved_at || null,
            createdAt: u.created_at
          }));
        this.saveAllUsers(mappedUsers);

        // Đồng bộ lại hồ sơ đang đăng nhập nếu có cập nhật từ Admin
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

  approveUserRegistration(userId, adminName = "Bùi Văn Khang") {
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
      fullName: data.fullName || "Sinh viên",
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
      SupabaseClient.updateSupportTicket(req.ticketId, { status: "resolved", resolved_by: "Admin Bùi Văn Khang", resolved_at: new Date().toISOString() }).catch(e => console.warn("Supabase updateSupportTicket error:", e));
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
      department: "Trường Đại học Đồng Tháp",
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
    const profile = this.getUserProfile();
    profile.totalExp = Math.max(0, (profile.totalExp || 0) + points);
    this.saveUserProfile(profile);

    // Tự động gửi Thông Báo nếu không phải chế độ im lặng
    if (!silent && points !== 0) {
      this.addNotification(profile.id, {
        type: points > 0 ? "exp_reward" : "admin_adjust",
        title: points > 0 ? `⚡ Nhận được +${points} EXP Học Tập` : `⚡ Bị khấu trừ ${Math.abs(points)} EXP`,
        message: reason || "Rèn luyện và tích cực học tập trên hệ thống.",
        pointsDelta: points,
        pointType: "EXP"
      });
    }

    // Đồng bộ EXP lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.updateUser(profile.id, { totalExp: profile.totalExp }).catch(() => {});
    }

    return profile.totalExp;
  },

  addContributionPoints(points, reason = "", silent = false) {
    if (!this.isLoggedIn()) return 0;
    const profile = this.getUserProfile();
    profile.contributionPoints = Math.max(0, (profile.contributionPoints || 0) + points);
    this.saveUserProfile(profile);

    if (!silent && points !== 0) {
      this.addNotification(profile.id, {
        type: "cp_reward",
        title: points > 0 ? `🌟 Thưởng +${points} Điểm Cống Hiến (CP)` : `🌟 Khấu trừ ${Math.abs(points)} Điểm Cống Hiến`,
        message: reason || "Đóng góp dữ liệu đề thi & tài liệu học tập cho trường Đại học Đồng Tháp.",
        pointsDelta: points,
        pointType: "CP"
      });
    }

    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.updateUser(profile.id, { contributionPoints: profile.contributionPoints }).catch(() => {});
    }

    return profile.contributionPoints;
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
      contributionPoints: user.contributionPoints
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
      contributionPoints: user.contributionPoints
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
      contributionPoints: user.contributionPoints
    });

    return pointsAwarded;
  },

  adminAdjustUserPoints(userId, pointType, amount, reason, adminName = "Quản trị viên") {
    const user = this.getUserById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng này!");
    if (!amount || amount === 0) throw new Error("Số điểm điều chỉnh phải khác 0!");
    if (!reason || !reason.trim()) throw new Error("Vui lòng nhập lý do điều chỉnh điểm!");

    const cleanReason = reason.trim();
    if (pointType === "EXP") {
      user.totalExp = Math.max(0, (user.totalExp || 0) + amount);
    } else {
      user.contributionPoints = Math.max(0, (user.contributionPoints || 0) + amount);
    }

    this.updateUser(user.id, {
      totalExp: user.totalExp,
      contributionPoints: user.contributionPoints
    });

    // Tạo thông báo gửi cho User
    this.addNotification(user.id, {
      type: "admin_adjust",
      title: amount > 0 ? `🛡️ ${adminName} đã cộng +${amount} ${pointType}` : `🛡️ ${adminName} đã khấu trừ ${Math.abs(amount)} ${pointType}`,
      message: `Lý do: "${cleanReason}" (Thực hiện bởi: ${adminName}).`,
      pointsDelta: amount,
      pointType: pointType
    });

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

  // ── 5. Quản lý Lịch sử Thi & Leaderboard (Chỉ lưu 3 lần thi thử gần nhất) ──
  getHistory() {
    try {
      const data = localStorage.getItem(this.KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getUserExamHistory() {
    const profile = this.getUserProfile();
    const currentUserId = profile ? (profile.id || profile.mssv || 'guest') : 'guest';
    const allHistory = this.getHistory();
    // Lọc lịch sử của user này và chỉ lấy chế độ thi thử (exam), tối đa 3 lần
    return allHistory
      .filter(h => (h.userId === currentUserId || (!h.userId && currentUserId === 'guest')) && h.mode === 'exam')
      .slice(0, 3);
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

    let allHistory = this.getHistory();
    // Tách lịch sử của user hiện tại và các user khác
    let userAttempts = allHistory.filter(h => (h.userId === currentUserId || (!h.userId && currentUserId === 'guest')) && h.mode === 'exam');
    let otherAttempts = allHistory.filter(h => h.userId && h.userId !== currentUserId);

    // Đưa lần thi mới nhất lên đầu và chỉ giữ đúng 3 lần gần nhất
    userAttempts.unshift(attempt);
    if (userAttempts.length > 3) {
      userAttempts = userAttempts.slice(0, 3);
    }

    allHistory = [...userAttempts, ...otherAttempts];
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
  // 5.1. QUẢN TRỊ & CẤU HÌNH BẢNG XẾP HẠNG (LEADERBOARD MANAGEMENT)
  // ═════════════════════════════════════════════════════════════════════════
  getLeaderboardSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.LEADERBOARD_SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      seasonName: "Học Kỳ 1 (2026 - 2027)",
      isPublic: true,
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
    return isHidden;
  },

  setCustomUserBadge(userId, badgeText) {
    const settings = this.getLeaderboardSettings();
    if (!settings.customBadges) settings.customBadges = {};
    if (!badgeText || !badgeText.trim()) {
      delete settings.customBadges[userId];
    } else {
      settings.customBadges[userId] = badgeText.trim();
    }
    this.saveLeaderboardSettings(settings);
  },

  getLeaderboardArchives() {
    try {
      const data = localStorage.getItem(this.KEYS.LEADERBOARD_ARCHIVES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  startNewSeason(seasonName, adminName = "Admin") {
    const currentSettings = this.getLeaderboardSettings();
    const currentExpBoard = this.getLeaderboardData("exp", { includeHidden: true });
    const currentCpBoard = this.getLeaderboardData("cp", { includeHidden: true });

    const archiveItem = {
      id: "season-" + Date.now(),
      seasonName: currentSettings.seasonName || "Mùa giải cũ",
      closedAt: new Date().toISOString(),
      closedBy: adminName,
      topExp: currentExpBoard.slice(0, 10),
      topCp: currentCpBoard.slice(0, 10)
    };

    const archives = this.getLeaderboardArchives();
    archives.unshift(archiveItem);
    localStorage.setItem(this.KEYS.LEADERBOARD_ARCHIVES, JSON.stringify(archives));

    currentSettings.seasonName = seasonName || `Mùa giải mới (${new Date().toLocaleDateString('vi-VN')})`;
    currentSettings.seasonStartDate = new Date().toISOString();
    this.saveLeaderboardSettings(currentSettings);

    // Gửi thông báo đến toàn bộ người dùng về mùa giải mới
    const allUsers = this.getAllUsers();
    allUsers.forEach(u => {
      this.addNotification(u.id, {
        type: "system_announcement",
        title: "🏆 Khởi Động Mùa Giải Mới: " + currentSettings.seasonName,
        message: `Ban quản trị đã chính thức mở mùa giải xếp hạng mới "${currentSettings.seasonName}". Chúc bạn đạt được nhiều thành tích và điểm tích lũy xuất sắc!`,
        pointsDelta: null,
        pointType: null
      });
    });

    return archiveItem;
  },

  getLeaderboardStats() {
    const allUsers = this.getAllUsers().filter(u => u.status === "active");
    const subjects = this.getSubjects();
    const materials = this.getMaterials();

    let totalExp = 0;
    let totalCp = 0;
    let totalQuestions = 0;

    allUsers.forEach(u => {
      totalExp += (u.totalExp || 0);
      totalCp += (u.contributionPoints || 0);
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

    let allUsers = this.getAllUsers().filter(u => u.status === "active");

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
      let list = allUsers.map(u => ({
        id: u.id,
        name: (profile.id === u.id) ? `${u.fullName} (Bạn)` : u.fullName,
        rawName: u.fullName,
        studentId: u.studentId || "Chưa cập nhật",
        email: u.email || "",
        department: u.department || "ĐH Đồng Tháp",
        cp: u.contributionPoints || 0,
        questions: u.cumulativeQuestions || 0,
        chars: u.cumulativeChars || 0,
        isHidden: hiddenIds.includes(u.id),
        customBadge: customBadges[u.id] || null,
        isCurrentUser: (profile.id === u.id)
      }));

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
    let list = allUsers.map(u => ({
      id: u.id,
      name: (profile.id === u.id) ? `${u.fullName} (Bạn)` : u.fullName,
      rawName: u.fullName,
      studentId: u.studentId || "Chưa cập nhật",
      email: u.email || "",
      department: u.department || "ĐH Đồng Tháp",
      exp: u.totalExp || 0,
      quizzes: u.quizzesCompleted || 0,
      isHidden: hiddenIds.includes(u.id),
      customBadge: customBadges[u.id] || null,
      isCurrentUser: (profile.id === u.id)
    }));

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
