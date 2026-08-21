/**
 * SHINORA QUIZMASTER - QUESTION BANK MANAGER VIEW (v4.2.1)
 * Trang Quản trị Ngân hàng Câu hỏi Độc lập:
 * - Hỗ trợ cả Môn học chính thức & Đề thi Draft chờ duyệt (isDraft: true).
 * - Cụm Chọn Chương / Chuyển Chương / Thêm Chương hợp nhất siêu tinh gọn.
 * - Chế độ 1: Thẻ câu hỏi trực quan (Cards, In-place Edit, CRUD).
 * - Chế độ 2: Xử lý hàng loạt (Bulk Move, Renumber ID, Bulk Delete).
 * - Chế độ 3: Sửa Text thô siêu tốc (Raw Batch Text Editor dạng Parser).
 */

Object.assign(App, {
  // State quản trị ngân hàng câu hỏi
  qbSubjectId: null,
  qbDraftId: null,
  qbIsDraft: false,
  qbSelectedChapter: "all",
  qbSearchKeyword: "",
  qbMode: "cards", // 'cards' | 'bulk' | 'raw'
  qbSelectedQuestionIds: [],
  qbPage: 0,
  QB_PAGE_SIZE: 50,
  qbShowAllExplanations: false,
  qbExpandedExplanations: {},
  pendingBulkMoveKeys: null,

  getQbActiveSubject(subjectId) {
    const targetId = subjectId || this.qbDraftId || this.qbSubjectId;
    if (this.qbIsDraft) {
      return StorageService.getDraftById(targetId) || StorageService.getSubjectById(targetId);
    }
    return StorageService.getSubjectById(targetId) || StorageService.getDraftById(targetId);
  },

  saveQbActiveSubject(sub) {
    if (this.qbIsDraft) {
      StorageService.saveDraftSubject(sub);
    } else {
      StorageService.saveSubject(sub);
    }
  },

  renderQuestionBankView(container, data = {}) {
    let draftId = data.draftId || (data.isDraft ? (data.subjectId || this.qbSubjectId) : null);
    let isDraft = Boolean(draftId || (typeof data === "object" && data.isDraft) || (this.qbIsDraft && !data.subjectId));

    let sub = null;
    if (isDraft) {
      sub = StorageService.getDraftById(draftId || this.qbDraftId || data.subjectId || this.qbSubjectId);
      if (!sub) {
        sub = StorageService.getSubjectById(data.subjectId || this.qbSubjectId);
        if (sub) isDraft = false;
      }
    } else {
      sub = StorageService.getSubjectById(data.subjectId || this.qbSubjectId || this.selectedSubjectDetailId);
      if (!sub) {
        sub = StorageService.getDraftById(data.subjectId || this.qbSubjectId);
        if (sub) isDraft = true;
      }
    }

    if (!sub) {
      const targetDraftId = draftId || (isDraft ? (data.subjectId || this.qbDraftId || this.qbSubjectId) : null);
      if (isDraft && targetDraftId && typeof CloudflareClient !== "undefined") {
        container.innerHTML = `
          <div class="view-question-bank" style="text-align: center; padding: 80px 20px;">
            <div class="spinner" style="margin: 0 auto 16px auto; width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Đang tải ngân hàng câu hỏi từ Cloudflare D1...</h3>
            <p style="font-size: 13px; color: var(--text-secondary);">Hệ thống đang tải danh sách câu hỏi đề thi cộng đồng</p>
          </div>
        `;
        CloudflareClient.getDraftById(targetDraftId).then(remoteDraft => {
          if (remoteDraft) {
            StorageService.saveDraftSubject(remoteDraft);
            this.renderQuestionBankView(container, data);
          } else {
            this.showToast("⚠️ Không tìm thấy thông tin đề thi cộng đồng!", "warning");
            this.navigateTo("manage");
          }
        }).catch(e => {
          this.showToast("⚠️ Lỗi kết nối tải ngân hàng câu hỏi đề thi cộng đồng!", "danger");
          this.navigateTo("manage");
        });
        return;
      }

      this.showToast("⚠️ Không tìm thấy thông tin môn học hoặc đề thi!", "warning");
      this.navigateTo("manage");
      return;
    }

    this.qbSubjectId = sub.id;
    this.qbDraftId = isDraft ? sub.id : null;
    this.qbIsDraft = isDraft;

    const isLogged = StorageService.isLoggedIn();

    // Chặn máy khách truy cập môn học bị khóa
    if (!isDraft && !isLogged && sub.isGuestAllowed === false) {
      container.innerHTML = `
        <div class="view-question-bank" style="padding: 48px 20px; max-width: 600px; margin: 40px auto; text-align: center; background: var(--surface); border: 1.5px dashed #cbd5e1; border-radius: var(--radius-md); box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fef2f2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            ${Icons.get('lock', 26)}
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">Ngân Hàng Câu Hỏi Dành Cho Sinh Viên DThu</h2>
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
            Ngân hàng câu hỏi của môn <strong>"${sub.name}"</strong> hiện đang được thiết lập giới hạn cho sinh viên và giảng viên Trường Đại học Đồng Tháp. Vui lòng đăng nhập tài khoản để vào xem và ôn tập.
          </p>
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn" onclick="App.navigateTo('home')">← Về Trang Chủ</button>
            <button class="btn btn-primary" onclick="App.openLoginModal()" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
              ${Icons.get('shieldCheck', 14)} <span>Đăng Nhập Tài Khoản</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    if (data.chapterId) {
      this.qbSelectedChapter = data.chapterId;
    }

    const allQuestions = sub.questions || [];
    const chapters = sub.chapters || [];
    const profile = StorageService.getUserProfile();
    const canEdit = isLogged && (profile.role === "admin" || profile.role === "editor" || (profile.permissions && profile.permissions.canEditSubjects));

    // Lọc theo Chương
    let filtered = (this.qbSelectedChapter === "all")
      ? allQuestions
      : allQuestions.filter(q => q.chapterId === this.qbSelectedChapter);

    // Lọc theo từ khóa tìm kiếm
    const kw = (this.qbSearchKeyword || "").toLowerCase().trim();
    if (kw) {
      filtered = filtered.filter(q => {
        const qText = (q.question || "").toLowerCase();
        const optText = (q.options || []).map(o => (o.text || "").toLowerCase()).join(" ");
        const noteText = (q.options || []).map(o => (o.note || "").toLowerCase()).join(" ");
        return qText.includes(kw) || optText.includes(kw) || noteText.includes(kw);
      });
    }

    // Phân trang
    const totalPages = Math.ceil(filtered.length / this.QB_PAGE_SIZE) || 1;
    const curPage = Math.min(Math.max(this.qbPage || 0, 0), totalPages - 1);
    const pagedQuestions = filtered.slice(curPage * this.QB_PAGE_SIZE, (curPage + 1) * this.QB_PAGE_SIZE);

    container.innerHTML = `
      <div class="view-question-bank" style="padding: 24px 20px; max-width: 1150px; margin: 0 auto; width: 100%;">
        
        <!-- Top Navigation Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
            <button class="btn btn-sm" onclick="App.navigateTo('subject-detail', { ${isDraft ? `draftId: '${sub.id}', isDraft: true` : `subjectId: '${sub.id}'`} })" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('chevronLeft', 13)} <span>${isDraft ? 'Chi Tiết Đề' : 'Tổng quan Môn'}</span>
            </button>
            <span>/</span>
            <span style="font-weight: 800; color: var(--text-primary); display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('fileText', 14)} <span>Ngân Hàng Câu Hỏi [${sub.code || sub.id}]</span>
              ${isDraft ? `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; font-size:11px;">DRAFT CHỜ DUYỆT</span>` : ''}
            </span>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${isDraft ? `
              <button class="btn btn-sm btn-primary" onclick="App.approveDraft('${sub.id}')" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
                ${Icons.get('checkCircle', 13)} <span>Duyệt Đề</span>
              </button>
              <button class="btn btn-sm btn-danger" onclick="App.rejectDraftConfirm('${sub.id}')" style="display:inline-flex; align-items:center; gap:5px;">
                ${Icons.get('trash', 13)} <span>Từ Chối</span>
              </button>
            ` : `
              <button class="btn btn-sm btn-primary" onclick="App.openQuizConfigModal('${sub.id}')" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
                ${Icons.get('zap', 13)} <span>Làm Bài Thi</span>
              </button>
              <button class="btn btn-sm" onclick="App.navigateTo('parser', { subjectId: '${sub.id}' })" style="display:inline-flex; align-items:center; gap:5px;">
                ${Icons.get('upload', 13)} <span>Nhập Đề</span>
              </button>
            `}
          </div>
        </div>

        <!-- Header Info Card & Mode Tabs -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 22px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="badge" style="background:#e0e7ff; color:#4338ca; font-weight:800; font-family:var(--font-mono);">${sub.code || sub.id}</span>
                <span class="badge badge-blue">${sub.department || 'ĐH Đồng Tháp'}</span>
                ${isDraft ? `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">Gửi bởi: ${sub.author || 'Sinh viên'}</span>` : ''}
              </div>
              <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0;">
                ${sub.name} — Ngân Hàng ${allQuestions.length} Câu Hỏi
              </h2>
            </div>

            <!-- Mode Switcher Tabs (3 Chế độ) -->
            <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: var(--radius-sm); gap: 4px;">
              <button 
                type="button" 
                onclick="App.switchQbMode('cards')" 
                class="btn btn-sm ${this.qbMode === 'cards' ? 'btn-primary' : ''}" 
                style="${this.qbMode === 'cards' ? 'font-weight:700;' : 'background:transparent; border:none; color:var(--text-secondary);'} display:inline-flex; align-items:center; gap:5px;">
                ${Icons.get('bookOpen', 13)} <span>Thẻ Câu Hỏi</span>
              </button>
              <button 
                type="button" 
                onclick="App.switchQbMode('bulk')" 
                class="btn btn-sm ${this.qbMode === 'bulk' ? 'btn-primary' : ''}" 
                style="${this.qbMode === 'bulk' ? 'font-weight:700;' : 'background:transparent; border:none; color:var(--text-secondary);'} display:inline-flex; align-items:center; gap:5px;">
                ${Icons.get('checkCircle', 13)} <span>Xử Lý Hàng Loạt</span>
              </button>
              <button 
                type="button" 
                onclick="App.switchQbMode('raw')" 
                class="btn btn-sm ${this.qbMode === 'raw' ? 'btn-primary' : ''}" 
                style="${this.qbMode === 'raw' ? 'font-weight:700;' : 'background:transparent; border:none; color:var(--text-secondary);'} display:inline-flex; align-items:center; gap:5px;">
                ${Icons.get('edit', 13)} <span>Sửa Text Thô</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Filter & Search Toolbar (Cụm Chọn & Quản Lý Chương Hợp Nhất) -->
        ${this.qbMode !== 'raw' ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            
            <!-- CỤM CHỌN CHƯƠNG / THÊM CHƯƠNG / GIẢI THÍCH (ALL-IN-ONE) -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <label style="font-size: 13px; font-weight: 700; color: var(--text-secondary); white-space: nowrap;">Chương:</label>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <select 
                    id="qbChapterFilterSelect"
                    class="form-control" 
                    style="height: 36px; font-size: 13px; font-weight: 600; min-width: 200px; max-width: 300px;" 
                    onchange="App.handleQbChapterChange(this.value)">
                    <option value="all" ${this.qbSelectedChapter === 'all' ? 'selected' : ''}>Tất cả chương (${allQuestions.length} câu)</option>
                    ${chapters.map(c => {
                      const cnt = allQuestions.filter(q => q.chapterId === c.id).length;
                      return `<option value="${c.id}" ${this.qbSelectedChapter === c.id ? 'selected' : ''}>${c.name} (${cnt})</option>`;
                    }).join('')}
                    ${canEdit ? `<option value="__ADD_NEW__">➕ Thêm chương mới...</option>` : ''}
                  </select>

                  ${canEdit ? `
                    <button 
                      type="button" 
                      class="btn btn-sm" 
                      onclick="App.openChapterManagerModal('${sub.id}')" 
                      title="Cấu hình & Quản lý chương" 
                      style="height: 36px; padding: 0 9px; display:inline-flex; align-items:center; justify-content:center;">
                      ${Icons.get('settings', 13)}
                    </button>
                  ` : ''}
                </div>
              </div>

              ${this.qbMode === 'cards' ? `
                <button 
                  type="button" 
                  onclick="App.toggleQbAllExplanations()" 
                  class="btn btn-sm" 
                  style="display:inline-flex; align-items:center; gap:5px; height: 36px; font-weight: 600; ${this.qbShowAllExplanations ? 'background: #eff6ff; color: #1d4ed8; border: 1.5px solid #bfdbfe;' : 'background: #fff; border: 1px solid var(--border);'}">
                  ${Icons.get('helpCircle', 13)} <span>${this.qbShowAllExplanations ? 'Ẩn giải thích' : 'Hiện giải thích'}</span>
                </button>
              ` : ''}
            </div>

            <!-- Ô tìm kiếm trong câu hỏi -->
            <div style="position: relative; min-width: 250px; max-width: 340px; flex: 1;">
              <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); display: flex;">
                ${Icons.get('search', 14)}
              </span>
              <input 
                id="qbSearchInput"
                type="text" 
                class="form-control" 
                style="padding-left: 32px; padding-right: 28px; height: 36px; font-size: 13px;" 
                placeholder="Tìm câu hỏi, đáp án..." 
                value="${this.qbSearchKeyword || ''}" 
                oninput="App.handleQbSearch(this.value)">
              <button 
                id="qbSearchClearBtn"
                onclick="App.clearQbSearch()" 
                style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-tertiary); display: ${this.qbSearchKeyword ? 'block' : 'none'};">
                ✕
              </button>
            </div>
          </div>
        ` : ''}

        <!-- MAIN BODY THEO TỪNG CHẾ ĐỘ -->
        <div id="qbMainContent">
          ${this.qbMode === 'cards' ? this.renderQbCardsMode(sub, pagedQuestions, filtered.length, curPage, totalPages, canEdit) : ''}
          ${this.qbMode === 'bulk' ? this.renderQbBulkMode(sub, filtered, canEdit) : ''}
          ${this.qbMode === 'raw' ? this.renderQbRawMode(sub, filtered, canEdit) : ''}
        </div>

      </div>
    `;
  },

  handleQbChapterChange(val) {
    if (val === "__ADD_NEW__") {
      const select = document.getElementById("qbChapterFilterSelect");
      if (select) select.value = this.qbSelectedChapter || "all";
      this.openQuickAddChapterModal();
      return;
    }
    this.setQbChapterFilter(val);
  },

  openQuickAddChapterModal() {
    const sub = this.getQbActiveSubject();
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const nextNum = (sub.chapters || []).length + 1;
    const defaultName = `Chương ${nextNum}: `;

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('plus', 16)} <span>Thêm Chương Mới</span></span>`;

    body.innerHTML = `
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label" style="font-weight: 700; font-size: 13px;">Tên chương mới:</label>
        <input type="text" id="quickAddChapterNameInput" class="form-control" value="${defaultName}" placeholder="Nhập tên chương..." style="font-size: 13.5px; height: 38px;">
      </div>
      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 12.5px;">
        <input type="checkbox" id="quickAddChapterGuestCheck" checked style="width: 16px; height: 16px; cursor: pointer;">
        <span>Mở cho máy khách ôn tập</span>
      </label>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveQuickAddChapter()" style="display:inline-flex; align-items:center; gap:4px; font-weight:700;">
        ${Icons.get('plus', 13)} <span>Tạo Chương</span>
      </button>
    `;

    modal.classList.add("active");
    setTimeout(() => {
      const inp = document.getElementById("quickAddChapterNameInput");
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    }, 100);
  },

  saveQuickAddChapter() {
    const name = document.getElementById("quickAddChapterNameInput")?.value.trim();
    const isGuest = document.getElementById("quickAddChapterGuestCheck")?.checked;
    if (!name) {
      this.showToast("⚠️ Vui lòng nhập tên chương!", "warning");
      return;
    }

    const sub = this.getQbActiveSubject();
    if (!sub) return;
    if (!sub.chapters) sub.chapters = [];

    const nextId = "c" + (sub.chapters.length + 1) + "_" + Date.now().toString(36);
    const newChap = {
      id: nextId,
      name: name,
      isGuestAllowed: Boolean(isGuest)
    };

    sub.chapters.push(newChap);

    // Nếu đang có các câu hỏi chờ chuyển vào chương mới tạo từ Bulk Mode
    if (this.pendingBulkMoveKeys && this.pendingBulkMoveKeys.length > 0) {
      let movedCount = 0;
      sub.questions.forEach((q, idx) => {
        const qKey = q.id || `q_${idx}`;
        if (this.pendingBulkMoveKeys.includes(qKey)) {
          q.chapterId = nextId;
          movedCount++;
        }
      });
      this.pendingBulkMoveKeys = null;
      this.saveQbActiveSubject(sub);
      this.closeModal();
      this.showToast(`✅ Đã tạo chương và chuyển ${movedCount} câu vào!`, "success", 2500);
    } else {
      this.saveQbActiveSubject(sub);
      this.closeModal();
      this.showToast(`✅ Đã thêm "${name}"!`, "success", 2000);
    }

    // Tự động chuyển bộ lọc sang chương vừa tạo
    this.qbSelectedChapter = nextId;
    this.qbPage = 0;
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  switchQbMode(mode) {
    this.qbMode = mode;
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  setQbChapterFilter(chapterId) {
    this.qbSelectedChapter = chapterId;
    this.qbPage = 0;
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  handleQbSearch(kw) {
    this.qbSearchKeyword = kw;
    this.qbPage = 0;

    const mainContent = document.getElementById("qbMainContent");
    const sub = this.getQbActiveSubject();
    if (mainContent && sub) {
      const allQuestions = sub.questions || [];
      const isLogged = StorageService.isLoggedIn();
      const profile = StorageService.getUserProfile();
      const canEdit = isLogged && (profile.role === "admin" || profile.role === "editor" || (profile.permissions && profile.permissions.canEditSubjects));

      // Lọc theo Chương
      let filtered = (this.qbSelectedChapter === "all")
        ? allQuestions
        : allQuestions.filter(q => q.chapterId === this.qbSelectedChapter);

      // Lọc theo từ khóa
      const cleanKw = (kw || "").toLowerCase().trim();
      if (cleanKw) {
        filtered = filtered.filter(q => {
          const qText = (q.question || "").toLowerCase();
          const optText = (q.options || []).map(o => (o.text || "").toLowerCase()).join(" ");
          const noteText = (q.options || []).map(o => (o.note || "").toLowerCase()).join(" ");
          return qText.includes(cleanKw) || optText.includes(cleanKw) || noteText.includes(cleanKw);
        });
      }

      const totalPages = Math.ceil(filtered.length / this.QB_PAGE_SIZE) || 1;
      const curPage = Math.min(Math.max(this.qbPage || 0, 0), totalPages - 1);
      const pagedQuestions = filtered.slice(curPage * this.QB_PAGE_SIZE, (curPage + 1) * this.QB_PAGE_SIZE);

      if (this.qbMode === 'cards') {
        mainContent.innerHTML = this.renderQbCardsMode(sub, pagedQuestions, filtered.length, curPage, totalPages, canEdit);
      } else if (this.qbMode === 'bulk') {
        mainContent.innerHTML = this.renderQbBulkMode(sub, filtered, canEdit);
      } else if (this.qbMode === 'raw') {
        mainContent.innerHTML = this.renderQbRawMode(sub, filtered, canEdit);
      }

      // Cập nhật nút xóa nhanh
      const clearBtn = document.getElementById("qbSearchClearBtn");
      if (clearBtn) clearBtn.style.display = cleanKw ? "block" : "none";
    } else {
      this.renderQuestionBankView(document.getElementById("mainContent"), {
        subjectId: this.qbSubjectId,
        draftId: this.qbDraftId,
        isDraft: this.qbIsDraft
      });
    }
  },

  clearQbSearch() {
    this.qbSearchKeyword = "";
    const input = document.getElementById("qbSearchInput");
    if (input) {
      input.value = "";
      input.focus();
    }
    this.handleQbSearch("");
  },

  setQbPage(p) {
    this.qbPage = p;
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  toggleQbAllExplanations() {
    this.qbShowAllExplanations = !this.qbShowAllExplanations;
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  toggleQbSingleExplanation(qKey) {
    if (!this.qbExpandedExplanations) this.qbExpandedExplanations = {};
    this.qbExpandedExplanations[qKey] = !this.qbExpandedExplanations[qKey];
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  // ── CHẾ ĐỘ 1: THẺ CÂU HỎI TRỰC QUAN (CARDS MODE) ──
  renderQbCardsMode(sub, questions, totalFiltered, curPage, totalPages, canEdit) {
    if (questions.length === 0) {
      return `
        <div style="text-align: center; padding: 48px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
          <div style="color: var(--text-tertiary); margin-bottom: 10px; display: flex; justify-content: center;">${Icons.get('fileText', 40)}</div>
          <h3>Không tìm thấy câu hỏi nào!</h3>
          <p style="color: var(--text-secondary); margin-top: 6px;">Hãy thử đổi từ khóa tìm kiếm hoặc chọn chương khác.</p>
        </div>
      `;
    }

    const startIndex = curPage * this.QB_PAGE_SIZE;

    return `
      <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
        ${questions.map((q, idx) => {
          const globalNum = startIndex + idx + 1;
          const qKey = q.id || `q_${startIndex + idx}`;
          const chapterObj = (sub.chapters || []).find(c => c.id === q.chapterId);
          const chapterName = chapterObj ? chapterObj.name : "Chưa gán chương";

          // Tính toán bố cục hiển thị đáp án thông minh theo độ dài
          const options = q.options || [];
          const maxOptLen = options.reduce((max, o) => Math.max(max, (o.text || "").length), 0);
          const totalOptLen = options.reduce((sum, o) => sum + (o.text || "").length, 0);

          let gridClass = "qb-opts-grid-1"; // Mặc định: Mỗi đáp án 1 dòng trọn vẹn
          if (maxOptLen <= 30 && totalOptLen <= 100 && options.length <= 4) {
            gridClass = "qb-opts-grid-4";
          } else if (maxOptLen <= 80 && totalOptLen <= 260) {
            gridClass = "qb-opts-grid-2";
          } else {
            gridClass = "qb-opts-grid-1";
          }

          const hasAnyExpl = Boolean((q.explanation && q.explanation.trim()) || (q.options || []).some(o => o.note && o.note.trim()));
          const isExplOpen = this.qbShowAllExplanations || Boolean(this.qbExpandedExplanations && this.qbExpandedExplanations[qKey]);

          return `
            <div class="qb-question-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.02);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 10px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="badge" style="background: var(--brand-primary); color: #fff; font-weight: 800; font-size: 12px; padding: 3px 8px;">
                    Câu ${globalNum}
                  </span>
                  <span class="badge" style="background: #f1f5f9; color: #475569; font-size: 11.5px; border: 1px solid #e2e8f0;">
                    ${chapterName}
                  </span>
                  ${q.id ? `<span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-tertiary);">${q.id}</span>` : ''}
                </div>

                <div style="display: flex; gap: 6px; align-items: center;">
                  ${hasAnyExpl ? `
                    <button 
                      type="button" 
                      class="btn btn-sm" 
                      onclick="App.toggleQbSingleExplanation('${qKey}')" 
                      style="display:inline-flex; align-items:center; gap:4px; font-size: 12px; ${isExplOpen ? 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-weight: 700;' : ''}">
                      ${Icons.get('helpCircle', 12)} <span>${isExplOpen ? 'Ẩn giải thích' : 'Xem giải thích'}</span>
                    </button>
                  ` : ''}

                  ${canEdit ? `
                    <button class="btn btn-sm" onclick="App.openEditSingleQuestionModal('${sub.id}', '${q.id || idx}')" style="display:inline-flex; align-items:center; gap:4px; font-size: 12px;">
                      ${Icons.get('edit', 12)} <span>Sửa</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="App.deleteSingleQuestionConfirm('${sub.id}', '${q.id || idx}')" style="padding: 4px 8px; display:inline-flex; align-items:center;" title="Xóa câu này">
                      ${Icons.get('trash', 12)}
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- Nội dung câu hỏi -->
              <div style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); line-height: 1.5; margin-bottom: 12px;">
                ${q.question}
              </div>

              <!-- Danh sách phương án -->
              <div class="${gridClass}" style="margin-bottom: 10px;">
                ${(q.options || []).map((opt, optIdx) => {
                  const letter = ['A', 'B', 'C', 'D', 'E'][optIdx] || (optIdx + 1);
                  const isCorrect = opt.isCorrect || (q.answerIndex === optIdx);

                  return `
                    <div style="padding: 8px 12px; border-radius: var(--radius-sm); border: ${isCorrect ? '1.5px solid #86efac' : '1px solid var(--border)'}; background: ${isCorrect ? '#f0fdf4' : '#fafafa'}; display: flex; align-items: flex-start; gap: 8px;">
                      <span style="font-weight: 800; font-size: 13px; color: ${isCorrect ? '#16a34a' : 'var(--text-secondary)'}; white-space: nowrap; line-height: 1.4;">
                        ${isCorrect ? '✓ ' : ''}${letter}.
                      </span>
                      <div style="flex: 1; font-size: 13px; color: ${isCorrect ? '#15803d' : 'var(--text-primary)'}; font-weight: ${isCorrect ? '700' : '400'}; line-height: 1.4;">
                        ${opt.text}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Khung giải thích chi tiết & Ghi chú -->
              ${(isExplOpen && hasAnyExpl) ? `
                <div class="qb-explanation-box" style="margin-top: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-left: 3px solid var(--brand-primary); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 12.5px; color: var(--text-primary);">
                  <div style="font-weight: 700; color: var(--brand-primary); margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
                    ${Icons.get('helpCircle', 13)} <span>Giải thích & Ghi chú câu hỏi:</span>
                  </div>
                  ${q.explanation ? `<div style="margin-bottom: 6px; line-height: 1.5;"><strong>Giải thích chung:</strong> ${q.explanation}</div>` : ''}
                  ${(q.options || []).filter(o => o.note && o.note.trim()).map(o => {
                    const oIdx = (q.options || []).indexOf(o);
                    const lettr = ['A', 'B', 'C', 'D', 'E'][oIdx] || (oIdx + 1);
                    const isCorr = o.isCorrect || (q.answerIndex === oIdx);
                    return `
                      <div style="margin-top: 4px; display: flex; gap: 6px; align-items: flex-start; line-height: 1.4;">
                        <span style="font-weight: 700; color: ${isCorr ? '#15803d' : 'var(--text-secondary)'}; white-space: nowrap;">[${lettr}] ${o.text}:</span>
                        <span style="color: ${isCorr ? '#166534' : 'var(--text-secondary)'};">${o.note}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : ''}

            </div>
          `;
        }).join('')}
      </div>

      <!-- Thanh Phân Trang (Pagination) -->
      ${totalPages > 1 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 20px; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 13px; color: var(--text-secondary);">
            Hiển thị <strong>${startIndex + 1} - ${Math.min(startIndex + this.QB_PAGE_SIZE, totalFiltered)}</strong> trên tổng số <strong>${totalFiltered}</strong> câu hỏi
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sm" onclick="App.setQbPage(${curPage - 1})" ${curPage === 0 ? 'disabled' : ''}>← Trước</button>
            <span style="display: flex; align-items: center; padding: 0 10px; font-weight: 700; font-size: 13px;">Trang ${curPage + 1} / ${totalPages}</span>
            <button class="btn btn-sm" onclick="App.setQbPage(${curPage + 1})" ${curPage >= totalPages - 1 ? 'disabled' : ''}>Sau →</button>
          </div>
        </div>
      ` : ''}
    `;
  },

  // ── CHẾ ĐỘ 2: XỬ LÝ HÀNG LOẠT (BULK ACTIONS MODE) ──
  renderQbBulkMode(sub, questions, canEdit) {
    const chapters = sub.chapters || [];
    return `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 20px; margin-bottom: 20px;">
        
        <!-- Toolbar Thao tác hàng loạt (Gọn gàng) -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; font-weight: 700;">
              <input type="checkbox" id="qbSelectAllCheckbox" onchange="App.toggleQbSelectAll(this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
              <span>Chọn tất cả (${questions.length} câu)</span>
            </label>
            <span id="qbSelectedCountBadge" class="badge" style="background:#e0e7ff; color:#4338ca; font-weight:700; font-size:12px;">Đã chọn: 0 câu</span>
          </div>

          ${canEdit ? `
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <!-- Di chuyển vào chương -->
              <select id="qbBulkMoveChapterSelect" class="form-control" style="height: 34px; font-size: 12.5px; min-width: 150px;">
                <option value="">-- Chuyển sang --</option>
                ${chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                <option value="__NEW__">➕ Chương mới...</option>
              </select>
              <button class="btn btn-sm btn-primary" onclick="App.executeQbBulkMoveChapter('${sub.id}')" style="display:inline-flex; align-items:center; gap:4px; font-weight:600;">
                ${Icons.get('folder', 12)} <span>Chuyển</span>
              </button>

              <!-- Đánh số lại ID -->
              <button class="btn btn-sm" onclick="App.executeQbRenumber('${sub.id}')" style="display:inline-flex; align-items:center; gap:4px;" title="Chuẩn hóa lại ID theo mã môn">
                ${Icons.get('refresh', 12)} <span>Đánh số ID</span>
              </button>

              <!-- Xóa các câu đã chọn -->
              <button class="btn btn-sm btn-danger" onclick="App.executeQbBulkDelete('${sub.id}')" style="display:inline-flex; align-items:center; gap:4px;">
                ${Icons.get('trash', 12)} <span>Xóa chọn</span>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Bảng danh sách câu hỏi rút gọn -->
        <div style="max-height: 520px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
            <thead style="background: #f8fafc; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 2;">
              <tr>
                <th style="padding: 10px 12px; width: 40px; text-align: center;">#</th>
                <th style="padding: 10px 12px; width: 100px;">Mã Câu</th>
                <th style="padding: 10px 12px;">Nội Dung Câu Hỏi</th>
                <th style="padding: 10px 12px; width: 160px;">Chương</th>
                <th style="padding: 10px 12px; width: 90px; text-align: center;">Đáp Án</th>
                <th style="padding: 10px 12px; width: 80px; text-align: right;">Sửa</th>
              </tr>
            </thead>
            <tbody>
              ${questions.map((q, idx) => {
                const qKey = q.id || `q_${idx}`;
                const chapterObj = chapters.find(c => c.id === q.chapterId);
                const lettr = ['A', 'B', 'C', 'D', 'E'][q.answerIndex || 0] || 'A';

                return `
                  <tr style="border-bottom: 1px solid #f1f5f9;" class="qb-bulk-row">
                    <td style="padding: 10px 12px; text-align: center;">
                      <input type="checkbox" class="qb-item-checkbox" value="${qKey}" onchange="App.onQbItemCheckChange()" style="cursor: pointer;">
                    </td>
                    <td style="padding: 10px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary);">
                      ${q.id || `Q-${idx + 1}`}
                    </td>
                    <td style="padding: 10px 12px; font-weight: 600; color: var(--text-primary);">
                      <div style="max-width: 460px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${q.question.replace(/"/g, '&quot;')}">
                        ${q.question}
                      </div>
                    </td>
                    <td style="padding: 10px 12px; font-size: 12px; color: var(--text-secondary);">
                      ${chapterObj ? chapterObj.name : 'Chưa gán'}
                    </td>
                    <td style="padding: 10px 12px; text-align: center;">
                      <span class="badge" style="background:#f0fdf4; color:#15803d; font-weight:800; border:1px solid #bbf7d0;">✓ ${lettr}</span>
                    </td>
                    <td style="padding: 10px 12px; text-align: right;">
                      ${canEdit ? `
                        <button class="btn btn-sm" onclick="App.openEditSingleQuestionModal('${sub.id}', '${qKey}')" style="padding: 2px 6px;" title="Sửa câu này">
                          ${Icons.get('edit', 12)}
                        </button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

      </div>
    `;
  },

  toggleQbSelectAll(checked) {
    const checkboxes = document.querySelectorAll(".qb-item-checkbox");
    checkboxes.forEach(cb => cb.checked = checked);
    this.onQbItemCheckChange();
  },

  onQbItemCheckChange() {
    const checkboxes = document.querySelectorAll(".qb-item-checkbox:checked");
    const count = checkboxes.length;
    const badge = document.getElementById("qbSelectedCountBadge");
    if (badge) {
      badge.textContent = `Đã chọn: ${count} câu`;
    }
  },

  executeQbBulkMoveChapter(subjectId) {
    const moveSelect = document.getElementById("qbBulkMoveChapterSelect");
    const targetChapterId = moveSelect?.value;
    if (!targetChapterId) {
      this.showToast("⚠️ Vui lòng chọn chương đích!", "warning");
      return;
    }

    const checkboxes = document.querySelectorAll(".qb-item-checkbox:checked");
    if (checkboxes.length === 0) {
      this.showToast("⚠️ Vui lòng chọn ít nhất 1 câu hỏi!", "warning");
      return;
    }

    const selectedKeys = Array.from(checkboxes).map(cb => cb.value);
    const sub = this.getQbActiveSubject(subjectId);
    if (!sub) return;

    if (targetChapterId === "__NEW__") {
      this.pendingBulkMoveKeys = selectedKeys;
      this.openQuickAddChapterModal();
      return;
    }

    let movedCount = 0;
    sub.questions.forEach((q, idx) => {
      const qKey = q.id || `q_${idx}`;
      if (selectedKeys.includes(qKey)) {
        q.chapterId = targetChapterId;
        movedCount++;
      }
    });

    this.saveQbActiveSubject(sub);
    this.showToast(`✅ Đã chuyển ${movedCount} câu sang chương mới!`, "success", 2500);
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  executeQbRenumber(subjectId) {
    const sub = this.getQbActiveSubject(subjectId);
    if (!sub || !sub.questions) return;

    sub.questions.forEach((q, idx) => {
      q.id = `${sub.code || 'Q'}-${String(idx + 1).padStart(3, '0')}`;
    });

    this.saveQbActiveSubject(sub);
    this.showToast("✅ Đã chuẩn hóa và đánh số lại toàn bộ ID câu hỏi!", "success", 2500);
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  executeQbBulkDelete(subjectId) {
    const checkboxes = document.querySelectorAll(".qb-item-checkbox:checked");
    if (checkboxes.length === 0) {
      this.showToast("⚠️ Vui lòng chọn ít nhất 1 câu hỏi để xóa!", "warning");
      return;
    }

    const selectedKeys = Array.from(checkboxes).map(cb => cb.value);
    this.showConfirmDialog({
      title: "Xác nhận xóa hàng loạt",
      message: `Bạn có chắc chắn muốn xóa ${selectedKeys.length} câu hỏi đã chọn không? Thao tác này không thể hoàn tác.`,
      icon: "🗑️",
      confirmText: `Xóa ${selectedKeys.length} câu`,
      isDanger: true,
      onConfirm: () => {
        const sub = this.getQbActiveSubject(subjectId);
        if (!sub) return;

        sub.questions = sub.questions.filter((q, idx) => {
          const qKey = q.id || `q_${idx}`;
          return !selectedKeys.includes(qKey);
        });

        this.saveQbActiveSubject(sub);
        this.showToast(`✅ Đã xóa ${selectedKeys.length} câu hỏi thành công!`, "success", 2500);
        this.renderQuestionBankView(document.getElementById("mainContent"), {
          subjectId: this.qbSubjectId,
          draftId: this.qbDraftId,
          isDraft: this.qbIsDraft
        });
      }
    });
  },

  // ── CHẾ ĐỘ 3: SỬA TEXT THÔ (RAW BATCH TEXT EDITOR) ──
  renderQbRawMode(sub, questions, canEdit) {
    if (!canEdit) {
      return `<div style="padding: 30px; text-align:center; color:var(--text-secondary);">Cần quyền Biên tập viên / Quản trị viên để chỉnh sửa Text thô.</div>`;
    }

    // Chuyển danh sách câu hỏi thành định dạng Text chuẩn Smart Parser
    const rawLines = [];
    questions.forEach((q, idx) => {
      rawLines.push(`Câu ${idx + 1}: ${q.question}`);
      (q.options || []).forEach((opt, optIdx) => {
        const letter = ['A', 'B', 'C', 'D', 'E'][optIdx] || 'A';
        const isCorrect = opt.isCorrect || (q.answerIndex === optIdx);
        const prefix = isCorrect ? `*${letter}.` : `${letter}.`;
        const notePart = opt.note ? ` | Note: ${opt.note}` : '';
        rawLines.push(`${prefix} ${opt.text}${notePart}`);
      });
      if (q.explanation) {
        rawLines.push(`Giải thích: ${q.explanation}`);
      }
      rawLines.push(""); // Dòng trống ngăn cách
    });

    const rawTextContent = rawLines.join("\n");

    return `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0;">
              📝 Trình Sửa Text Thô Siêu Tốc (Smart Batch Text Editor)
            </h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin: 2px 0 0 0;">
              Dán, chỉnh sửa hàng loạt bằng bàn phím theo cú pháp chuẩn (*A. là đáp án đúng).
            </p>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm" onclick="App.copyRawQbText()" style="display:inline-flex; align-items:center; gap:4px;">
              ${Icons.get('copy', 12)} <span>Sao chép Text</span>
            </button>
            <button class="btn btn-sm btn-primary" onclick="App.saveRawQbText('${sub.id}')" style="display:inline-flex; align-items:center; gap:4px; font-weight:700;">
              ${Icons.get('save', 13)} <span>Lưu & Cập Nhật Lại Ngân Hàng</span>
            </button>
          </div>
        </div>

        <textarea 
          id="qbRawTextarea" 
          class="form-control" 
          style="width: 100%; min-height: 480px; font-family: var(--font-mono); font-size: 13px; line-height: 1.6; padding: 14px; background: #fafafa; border: 1px solid #cbd5e1; border-radius: var(--radius-sm);"
          placeholder="Dán hoặc soạn câu hỏi ở đây...">${rawTextContent}</textarea>
      </div>
    `;
  },

  copyRawQbText() {
    const el = document.getElementById("qbRawTextarea");
    if (!el) return;
    navigator.clipboard.writeText(el.value).then(() => {
      this.showToast("📋 Đã sao chép toàn bộ văn bản đề thi vào Clipboard!", "success", 2000);
    });
  },

  saveRawQbText(subjectId) {
    const el = document.getElementById("qbRawTextarea");
    if (!el) return;
    const text = el.value.trim();
    if (!text) {
      this.showToast("⚠️ Nội dung văn bản không được để trống!", "warning");
      return;
    }

    if (typeof ParserEngine === "undefined") {
      this.showToast("❌ Không tìm thấy bộ bóc tách đề thi ParserEngine!", "danger");
      return;
    }

    try {
      const parsed = ParserEngine.parse(text);
      if (!parsed || !parsed.questions || parsed.questions.length === 0) {
        this.showToast("⚠️ Không thể bóc tách câu hỏi nào từ văn bản. Vui lòng kiểm tra lại định dạng!", "warning", 4000);
        return;
      }

      const sub = this.getQbActiveSubject(subjectId);
      if (!sub) return;

      const targetChapterId = (this.qbSelectedChapter && this.qbSelectedChapter !== "all")
        ? this.qbSelectedChapter
        : (sub.chapters?.[0]?.id || "c1");

      // Gán chapterId và format lại câu hỏi
      parsed.questions.forEach((q, idx) => {
        q.chapterId = q.chapterId || targetChapterId;
        q.id = `${sub.code || 'Q'}-${String(idx + 1).padStart(3, '0')}`;
      });

      if (this.qbSelectedChapter && this.qbSelectedChapter !== "all") {
        // Chỉ thay thế câu hỏi của chương đang chọn
        const remainingQuestions = sub.questions.filter(q => q.chapterId !== this.qbSelectedChapter);
        sub.questions = [...remainingQuestions, ...parsed.questions];
      } else {
        // Thay thế toàn bộ
        sub.questions = parsed.questions;
      }

      this.saveQbActiveSubject(sub);
      this.showToast(`🎉 Đã cập nhật thành công ${parsed.questions.length} câu hỏi vào ngân hàng!`, "success", 3000);
      this.qbMode = "cards";
      this.renderQuestionBankView(document.getElementById("mainContent"), {
        subjectId: this.qbSubjectId,
        draftId: this.qbDraftId,
        isDraft: this.qbIsDraft
      });
    } catch (err) {
      this.showToast("❌ Lỗi biên dịch đề thi: " + err.message, "danger", 4000);
    }
  },

  // ── MODAL QUẢN LÝ CẤU TRÚC CHƯƠNG (CHAPTER MANAGER MODAL) ──
  openChapterManagerModal(subjectId) {
    const sub = this.getQbActiveSubject(subjectId);
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('folder', 16)} <span>Quản Lý Cấu Trúc Chương — ${sub.code || sub.name}</span></span>`;

    const renderRows = () => {
      const chapters = sub.chapters || [];
      return chapters.map((c, idx) => {
        const qCount = (sub.questions || []).filter(q => q.chapterId === c.id).length;
        const isGuestAllowed = c.isGuestAllowed !== false;

        return `
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px;">
              <span style="font-weight: 800; font-size: 13px; color: var(--text-tertiary); width: 24px;">${idx + 1}.</span>
              <input 
                type="text" 
                class="form-control" 
                id="chapter_name_${c.id}" 
                value="${c.name.replace(/"/g, '&quot;')}" 
                style="height: 32px; font-size: 13px; font-weight: 600; flex: 1;">
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="badge" style="background:#f1f5f9; color:#475569; font-weight:700;">${qCount} câu hỏi</span>

              <!-- Cờ phân quyền mở/khóa cho Khách -->
              <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; color: var(--text-primary);" title="Cho phép máy khách trải nghiệm chương này">
                <input 
                  type="checkbox" 
                  id="chapter_guest_${c.id}" 
                  ${isGuestAllowed ? 'checked' : ''} 
                  style="width: 15px; height: 15px; cursor: pointer;">
                <span>Mở cho Khách</span>
              </label>

              <button 
                type="button" 
                onclick="App.deleteChapterFromSubject('${sub.id}', '${c.id}')" 
                class="btn btn-sm btn-danger" 
                style="padding: 3px 7px;" 
                title="Xóa chương này">
                ${Icons.get('trash', 12)}
              </button>
            </div>
          </div>
        `;
      }).join('');
    };

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0;">
          Chỉnh sửa tên chương, số lượng chương và quyền mở cho khách trải nghiệm.
        </p>

        <div id="chaptersManagerList" style="max-height: 280px; overflow-y: auto;">
          ${renderRows()}
        </div>

        <div style="display: flex; gap: 8px; margin-top: 6px;">
          <input type="text" id="newChapterNameInput" class="form-control" placeholder="Nhập tên chương mới..." style="height: 34px; font-size: 13px; flex: 1;">
          <button type="button" onclick="App.addChapterToSubject('${sub.id}')" class="btn btn-sm btn-primary" style="display:inline-flex; align-items:center; gap:4px;">
            ${Icons.get('plus', 12)} <span>Thêm Chương</span>
          </button>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-primary" onclick="App.saveChaptersManager('${sub.id}')">Lưu Thay Đổi</button>
    `;

    modal.classList.add("active");
  },

  addChapterToSubject(subjectId) {
    const nameInp = document.getElementById("newChapterNameInput");
    const name = nameInp?.value.trim();
    if (!name) {
      this.showToast("⚠️ Vui lòng nhập tên chương mới!", "warning");
      return;
    }

    const sub = this.getQbActiveSubject(subjectId);
    if (!sub) return;
    if (!sub.chapters) sub.chapters = [];

    const nextId = "c" + (sub.chapters.length + 1) + "_" + Date.now().toString(36);
    sub.chapters.push({
      id: nextId,
      name: name,
      isGuestAllowed: false
    });

    this.saveQbActiveSubject(sub);
    this.openChapterManagerModal(subjectId);
    this.showToast(`✅ Đã thêm "${name}"!`, "success", 2000);
  },

  deleteChapterFromSubject(subjectId, chapterId) {
    const sub = this.getQbActiveSubject(subjectId);
    if (!sub) return;

    if (sub.chapters.length <= 1) {
      this.showToast("⚠️ Cần giữ lại ít nhất 1 chương!", "warning");
      return;
    }

    const qCount = (sub.questions || []).filter(q => q.chapterId === chapterId).length;
    const confirmMsg = qCount > 0
      ? `Chương này đang chứa ${qCount} câu hỏi. Khi xóa, các câu hỏi sẽ được tự động chuyển về Chương 1. Bạn có chắc muốn xóa?`
      : "Bạn có chắc muốn xóa chương này?";

    this.showConfirmDialog({
      title: "Xác nhận xóa chương",
      message: confirmMsg,
      icon: "⚠️",
      confirmText: "Xóa chương",
      isDanger: true,
      onConfirm: () => {
        const fallbackChapterId = sub.chapters.find(c => c.id !== chapterId)?.id || "c1";
        // Chuyển câu hỏi sang chương khác
        (sub.questions || []).forEach(q => {
          if (q.chapterId === chapterId) q.chapterId = fallbackChapterId;
        });

        sub.chapters = sub.chapters.filter(c => c.id !== chapterId);
        this.saveQbActiveSubject(sub);
        this.openChapterManagerModal(subjectId);
        this.showToast("✅ Đã xóa chương thành công!", "success", 2000);
      }
    });
  },

  saveChaptersManager(subjectId) {
    const sub = this.getQbActiveSubject(subjectId);
    if (!sub || !sub.chapters) return;

    sub.chapters.forEach(c => {
      const nameEl = document.getElementById(`chapter_name_${c.id}`);
      const guestEl = document.getElementById(`chapter_guest_${c.id}`);
      if (nameEl) c.name = nameEl.value.trim() || c.name;
      if (guestEl) c.isGuestAllowed = guestEl.checked;
    });

    this.saveQbActiveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã lưu cấu trúc chương!", "success", 2500);
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  openEditSingleQuestionModal(subjectId, questionKey) {
    const sub = this.getQbActiveSubject(subjectId);
    if (!sub || !sub.questions) return;

    const qIdx = sub.questions.findIndex((q, idx) => (q.id === questionKey) || (String(idx) === String(questionKey)));
    if (qIdx === -1) {
      this.showToast("⚠️ Không tìm thấy câu hỏi!", "warning");
      return;
    }

    const q = sub.questions[qIdx];
    const chapters = sub.chapters || [];
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('edit', 16)} <span>Chỉnh Sửa Câu Hỏi #${qIdx + 1}</span></span>`;

    const optionsHtml = (q.options || []).map((opt, optIdx) => {
      const letter = ['A', 'B', 'C', 'D', 'E'][optIdx] || (optIdx + 1);
      const isCorrect = opt.isCorrect || (q.answerIndex === optIdx);
      return `
        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: ${isCorrect ? '#15803d' : 'var(--text-primary)'};">Phương án ${letter}</strong>
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12.5px; font-weight: 700; color: #16a34a;">
              <input type="radio" name="editQuestionCorrectRadio" value="${optIdx}" ${isCorrect ? 'checked' : ''} style="cursor: pointer;">
              <span>Đáp án đúng</span>
            </label>
          </div>
          <input type="text" class="form-control edit-opt-text" data-index="${optIdx}" value="${(opt.text || '').replace(/"/g, '&quot;')}" style="font-size: 13px; height: 34px; margin-bottom: 6px;" placeholder="Nội dung phương án ${letter}...">
          <input type="text" class="form-control edit-opt-note" data-index="${optIdx}" value="${(opt.note || '').replace(/"/g, '&quot;')}" style="font-size: 12px; height: 30px; background: #fff;" placeholder="Ghi chú / Giải thích tại sao đúng hoặc sai (tùy chọn)...">
        </div>
      `;
    }).join('');

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 12.5px; font-weight: 700;">Chương kiến thức:</label>
          <select id="editQuestionChapterSelect" class="form-control" style="height: 34px; font-size: 13px;">
            ${chapters.map(c => `<option value="${c.id}" ${c.id === q.chapterId ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 12.5px; font-weight: 700;">Nội dung câu hỏi (*):</label>
          <textarea id="editQuestionText" class="form-control" rows="3" style="font-size: 13.5px; font-weight: 600;" placeholder="Nhập nội dung câu hỏi...">${q.question || ''}</textarea>
        </div>

        <div>
          <label class="form-label" style="font-size: 12.5px; font-weight: 700; margin-bottom: 6px; display: block;">Các phương án trả lời:</label>
          ${optionsHtml}
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 12px;">Giải thích chung cho cả câu (tùy chọn):</label>
          <input type="text" id="editQuestionExplanation" class="form-control" value="${(q.explanation || '').replace(/"/g, '&quot;')}" style="height: 32px; font-size: 12.5px;" placeholder="Ví dụ: Căn cứ giáo trình trang 120...">
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedSingleQuestion('${sub.id}', ${qIdx})">Lưu Thay Đổi</button>
    `;

    modal.classList.add("active");
  },

  saveEditedSingleQuestion(subjectId, qIdx) {
    const sub = this.getQbActiveSubject(subjectId);
    if (!sub || !sub.questions || !sub.questions[qIdx]) return;

    const qText = document.getElementById("editQuestionText")?.value.trim();
    const chapterId = document.getElementById("editQuestionChapterSelect")?.value;
    const explanation = document.getElementById("editQuestionExplanation")?.value.trim();
    const correctRadio = document.querySelector('input[name="editQuestionCorrectRadio"]:checked');
    const correctIdx = correctRadio ? parseInt(correctRadio.value, 10) : 0;

    if (!qText) {
      this.showToast("⚠️ Nội dung câu hỏi không được để trống!", "warning");
      return;
    }

    const optTexts = document.querySelectorAll(".edit-opt-text");
    const optNotes = document.querySelectorAll(".edit-opt-note");
    const updatedOptions = [];

    optTexts.forEach((inp, idx) => {
      const text = inp.value.trim() || `Phương án ${idx + 1}`;
      const note = optNotes[idx] ? optNotes[idx].value.trim() : "";
      updatedOptions.push({
        text: text,
        isCorrect: (idx === correctIdx),
        note: note
      });
    });

    sub.questions[qIdx].question = qText;
    sub.questions[qIdx].chapterId = chapterId;
    sub.questions[qIdx].explanation = explanation;
    sub.questions[qIdx].options = updatedOptions;
    sub.questions[qIdx].answerIndex = correctIdx;

    this.saveQbActiveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã cập nhật câu hỏi thành công!", "success", 2500);
    this.renderQuestionBankView(document.getElementById("mainContent"), {
      subjectId: this.qbSubjectId,
      draftId: this.qbDraftId,
      isDraft: this.qbIsDraft
    });
  },

  deleteSingleQuestionConfirm(subjectId, questionKey) {
    this.showConfirmDialog({
      title: "Xác nhận xóa câu hỏi",
      message: "Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng đề không?",
      icon: "🗑️",
      confirmText: "Xóa câu này",
      isDanger: true,
      onConfirm: () => {
        const sub = this.getQbActiveSubject(subjectId);
        if (!sub || !sub.questions) return;

        sub.questions = sub.questions.filter((q, idx) => (q.id !== questionKey) && (String(idx) !== String(questionKey)));
        this.saveQbActiveSubject(sub);
        this.showToast("✅ Đã xóa câu hỏi!", "success", 2000);
        this.renderQuestionBankView(document.getElementById("mainContent"), {
          subjectId: this.qbSubjectId,
          draftId: this.qbDraftId,
          isDraft: this.qbIsDraft
        });
      }
    });
  }
});
