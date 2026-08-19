/**
 * SUPABASE CLIENT SERVICE
 * Tích hợp giao tiếp trực tiếp với Supabase PostgreSQL REST API.
 * Hỗ trợ đồng bộ đa thiết bị (Máy tính, Điện thoại) cho Shinora QuizMaster.
 */
const SupabaseClient = {
  getHeaders() {
    return {
      "Content-Type": "application/json",
      "apikey": API_CONFIG.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
      "Prefer": "return=representation"
    };
  },

  async request(endpoint, options = {}) {
    if (!API_CONFIG.isCloudEnabled()) return null;
    const url = `${API_CONFIG.SUPABASE_URL}/rest/v1/${endpoint}`;
    const defaultOptions = {
      headers: this.getHeaders(),
      mode: "cors",
      cache: "no-store"
    };
    const merged = Object.assign({}, defaultOptions, options);
    if (options.headers) {
      merged.headers = Object.assign({}, defaultOptions.headers, options.headers);
    }

    try {
      const res = await fetch(url, merged);
      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[Supabase Error] ${endpoint}:`, res.status, errText);
        return null;
      }
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
      return true;
    } catch (err) {
      console.warn(`[Supabase Network Error] ${endpoint}:`, err);
      return null;
    }
  },

  // ── 1. USERS & PROFILES ───────────────────────────────────────────
  async getAllUsers() {
    return await this.request("users?select=*&order=created_at.desc");
  },

  async getUserByStudentId(studentId) {
    if (!studentId) return null;
    const list = await this.request(`users?student_id=eq.${encodeURIComponent(studentId.trim())}&select=*`);
    return (list && list.length > 0) ? list[0] : null;
  },

  async getUserByEmail(email) {
    if (!email) return null;
    const list = await this.request(`users?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&select=*`);
    return (list && list.length > 0) ? list[0] : null;
  },

  async createUser(userData) {
    const perms = Object.assign({
      canApproveDrafts: false,
      canEditSubjects: false,
      canManageMaterials: false,
      canManageUsers: false,
      seasonExp: userData.seasonExp || userData.totalExp || 50,
      contributionPoints: userData.contributionPoints || 0,
      seasonCp: userData.seasonCp || 0,
      cumulativeQuestions: userData.cumulativeQuestions || 0,
      cumulativeChars: userData.cumulativeChars || 0,
      cumulativeReviewed: userData.cumulativeReviewed || 0
    }, userData.permissions || {});

    const payload = {
      id: userData.id || ("USR-" + Date.now()),
      student_id: userData.studentId ? userData.studentId.trim() : "",
      class_name: userData.className ? userData.className.trim() : "",
      full_name: userData.fullName ? userData.fullName.trim() : "",
      email: userData.email ? userData.email.trim().toLowerCase() : "",
      phone: userData.phone ? userData.phone.trim() : "",
      department: userData.department || "Khoa Kỹ thuật - Công nghệ",
      role: userData.role || "student",
      pin_code: userData.pinCode || "123456",
      avatar: userData.avatar || "👨‍🎓",
      total_exp: typeof userData.totalExp === "number" ? userData.totalExp : 50,
      streak_days: typeof userData.streakDays === "number" ? userData.streakDays : 1,
      quizzes_completed: typeof userData.quizzesCompleted === "number" ? userData.quizzesCompleted : 0,
      status: userData.status || "pending_approval",
      permissions: perms,
      approved_by: userData.approvedBy || "",
      approved_at: userData.approvedAt || null,
      updated_at: new Date().toISOString()
    };
    return await this.request("users", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateUser(userId, updates) {
    if (!userId) return null;
    const payload = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.className !== undefined) payload.class_name = updates.className;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.pinCode !== undefined) payload.pin_code = updates.pinCode;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.totalExp !== undefined) payload.total_exp = updates.totalExp;
    if (updates.streakDays !== undefined) payload.streak_days = updates.streakDays;
    if (updates.quizzesCompleted !== undefined) payload.quizzes_completed = updates.quizzesCompleted;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.approvedBy !== undefined) payload.approved_by = updates.approvedBy;
    if (updates.approvedAt !== undefined) payload.approved_at = updates.approvedAt;
    payload.updated_at = new Date().toISOString();

    // Đóng gói permissions kèm metrics mở rộng (seasonExp, contributionPoints, seasonCp...)
    if (updates.permissions || updates.seasonExp !== undefined || updates.contributionPoints !== undefined || updates.seasonCp !== undefined || updates.cumulativeQuestions !== undefined) {
      const mergedPerms = Object.assign({}, updates.permissions || {});
      if (updates.seasonExp !== undefined) mergedPerms.seasonExp = updates.seasonExp;
      if (updates.contributionPoints !== undefined) mergedPerms.contributionPoints = updates.contributionPoints;
      if (updates.seasonCp !== undefined) mergedPerms.seasonCp = updates.seasonCp;
      if (updates.cumulativeQuestions !== undefined) mergedPerms.cumulativeQuestions = updates.cumulativeQuestions;
      if (updates.cumulativeChars !== undefined) mergedPerms.cumulativeChars = updates.cumulativeChars;
      if (updates.cumulativeReviewed !== undefined) mergedPerms.cumulativeReviewed = updates.cumulativeReviewed;
      payload.permissions = mergedPerms;
    }

    return await this.request(`users?or=(id.eq.${encodeURIComponent(userId)},student_id.eq.${encodeURIComponent(userId)})`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async deleteUser(userId) {
    if (!userId) return null;
    return await this.request(`users?or=(id.eq.${encodeURIComponent(userId)},student_id.eq.${encodeURIComponent(userId)})`, {
      method: "DELETE"
    });
  },

  // ── 2. SUBJECTS & QUESTIONS ───────────────────────────────────────
  async getAllSubjects() {
    return await this.request("subjects?select=*&is_active=eq.true&order=created_at.asc");
  },

  async saveSubject(subject) {
    const payload = {
      id: subject.id,
      code: subject.code || subject.id,
      name: subject.name,
      department: subject.department || "Shinora Academy",
      author: subject.author || "Ban Biên Tập Shinora",
      description: subject.description || "",
      icon: subject.icon || "📚",
      chapters: subject.chapters || [],
      questions: subject.questions || [],
      is_active: true,
      updated_at: new Date().toISOString()
    };
    return await this.request("subjects", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload)
    });
  },

  // Xóa môn học chính thức khỏi Supabase Cloud
  async deleteSubject(subjectId) {
    return await this.request(`subjects?id=eq.${subjectId}`, {
      method: "DELETE"
    });
  },

  // ── 3. DRAFT SUBJECTS (ĐỀ ĐÓNG GÓP) ──────────────────────────────
  async getAllDraftSubjects() {
    return await this.request("draft_subjects?select=*&order=created_at.desc");
  },

  async createDraftSubject(draft) {
    const payload = {
      id: draft.id || ("DRAFT-" + Date.now()),
      name: draft.name,
      department: draft.department || "Shinora Academy",
      author: draft.author || "Học viên đóng góp",
      student_id: draft.studentId || "",
      email: draft.email || "",
      note: draft.note || "",
      chapters: draft.chapters || [],
      questions: draft.questions || [],
      status: "pending"
    };
    return await this.request("draft_subjects", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateDraftSubject(draftId, updates) {
    const payload = {
      name: updates.name,
      department: updates.department || "Shinora Academy",
      author: updates.author || "Học viên đóng góp",
      chapters: updates.chapters || [],
      questions: updates.questions || [],
      description: updates.description || "",
      icon: updates.icon || "📝"
    };
    return await this.request(`draft_subjects?id=eq.${encodeURIComponent(draftId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async deleteDraftSubject(draftId) {
    return await this.request(`draft_subjects?id=eq.${encodeURIComponent(draftId)}`, {
      method: "DELETE"
    });
  },

  // ── 4. QUIZ HISTORY (LỊCH SỬ THI & BẢNG XẾP HẠNG) ─────────────────
  async getAllQuizHistory(limit = 100) {
    return await this.request(`quiz_history?select=*&order=completed_at.desc&limit=${limit}`);
  },

  async saveQuizHistory(history) {
    const payload = {
      id: history.id || ("HIST-" + Date.now()),
      user_id: history.userId || null,
      student_id: history.studentId || "",
      user_name: history.userName || "Học viên Shinora",
      subject_id: history.subjectId,
      subject_name: history.subjectName || history.subjectId,
      mode: history.mode || "practice",
      chapter_id: history.chapterId || "all",
      score_10: history.score10 || 0,
      percentage: history.percentage || 0,
      correct_count: history.correctCount || 0,
      wrong_count: history.wrongCount || 0,
      total_questions: history.totalQuestions || 0,
      duration_seconds: history.durationSeconds || 0,
      grade_title: history.gradeTitle || "",
      completed_at: history.completedAt || new Date().toISOString()
    };
    return await this.request("quiz_history", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  // ── 5. SUPPORT TICKETS & FEEDBACK ─────────────────────────────────
  async getAllSupportTickets() {
    return await this.request("support_tickets?select=*&order=created_at.desc");
  },

  async createSupportTicket(ticket) {
    const payload = {
      id: "TICKET-" + Date.now(),
      ticket_id: ticket.ticketId || ("TICKET-" + Date.now()),
      user_id: ticket.userId || null,
      full_name: ticket.fullName || "Người dùng Shinora",
      student_id: ticket.studentId || "",
      contact: ticket.contact || "",
      email: ticket.email || "",
      phone: ticket.phone || "",
      issue_type: ticket.issueType || "Yêu cầu hỗ trợ",
      title: ticket.title || "Phiếu hỗ trợ",
      content: ticket.content || "",
      status: "pending"
    };
    return await this.request("support_tickets", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateSupportTicket(ticketId, updates) {
    return await this.request(`support_tickets?ticket_id=eq.${encodeURIComponent(ticketId)}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
  },

  // ── 6. STUDY MATERIALS ────────────────────────────────────────────
  async getAllStudyMaterials() {
    return await this.request("study_materials?select=*&order=created_at.desc");
  },

  async saveStudyMaterial(material) {
    const payload = {
      id: material.id || ("MAT-" + Date.now()),
      subject_id: material.subjectId,
      subject_name: material.subjectName || "",
      chapter_id: material.chapterId || "",
      title: material.title,
      file_type: material.fileType || "txt",
      content_text: material.contentText || "",
      file_url: material.fileUrl || "",
      author_name: material.authorName || "Ban Biên Tập",
      uploader_id: material.uploaderId || null,
      view_count: material.viewCount || 0
    };
    return await this.request("study_materials", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload)
    });
  }
};
