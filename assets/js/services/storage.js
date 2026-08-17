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
    EMAIL_OTPS: "dthu_quiz_email_otps_v2"
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
      targetSub = existingSubjects.find(s => s.code === draft.code);
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

    this.addExp(50, `Phê duyệt đóng góp vào môn: ${finalSubject.name}`);
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
      role: "admin", // 'admin' | 'editor' | 'student'
      avatar: "👨‍🎓",
      pinCode: "123456",
      permissions: {
        canApproveDrafts: true,
        canEditSubjects: true,
        canManageMaterials: true,
        canManageUsers: true
      },
      totalExp: 1000,
      streakDays: 14,
      quizzesCompleted: 35,
      status: "active", // 'active' | 'pending_approval' | 'suspended'
      createdAt: "2026-01-01T08:00:00.000Z"
    }
  ],

  getAllUsers() {
    try {
      const data = localStorage.getItem(this.KEYS.USERS_LIST);
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) {
          // Lọc bỏ triệt để các tài khoản đã bị từ chối / xóa (status === 'rejected')
          const validList = list.filter(u => u && u.status !== "rejected");
          // Tự động đồng bộ hồ sơ Admin USR-01 nếu phát hiện thông tin cũ
          const adminIdx = validList.findIndex(u => u.id === "USR-01" || u.role === "admin");
          if (adminIdx !== -1 && validList[adminIdx].studentId !== "0024418475") {
            validList[adminIdx] = Object.assign({}, validList[adminIdx], this.DEFAULT_USERS[0]);
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

  addExp(points, reason = "") {
    if (!this.isLoggedIn()) return 0; // Khách không tích lũy EXP
    const profile = this.getUserProfile();
    profile.totalExp = (profile.totalExp || 0) + points;
    this.saveUserProfile(profile);

    // Đồng bộ EXP lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.updateUser(profile.id, { totalExp: profile.totalExp }).catch(() => {});
    }

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

    const profile = this.getUserProfile();
    if (profile && profile.role !== "guest") {
      profile.quizzesCompleted = (profile.quizzesCompleted || 0) + 1;
      this.saveUserProfile(profile);
      if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
        SupabaseClient.updateUser(profile.id, { quizzesCompleted: profile.quizzesCompleted }).catch(() => {});
      }
    }

    // Thưởng EXP cho bài thi
    if (attempt.score10 >= 8.0) {
      this.addExp(20, "Hoàn thành xuất sắc bài thi (+20 EXP)");
    } else if (attempt.score10 >= 5.0) {
      this.addExp(10, "Hoàn thành bài thi đạt yêu cầu (+10 EXP)");
    } else {
      this.addExp(5, "Chăm chỉ làm bài ôn tập (+5 EXP)");
    }

    // Đồng bộ lên Supabase Cloud
    if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
      SupabaseClient.saveQuizHistory(attempt).catch(e => console.warn("Supabase saveQuizHistory error:", e));
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
