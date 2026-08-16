/**
 * DTHU QUIZMASTER - MAIN CONTROLLER & APPLICATION ROUTER
 * Tác giả: Bùi Văn Khang - CNSH DThu
 */

const App = {
  // Application State
  currentView: "home", // 'home', 'quiz', 'result', 'mistakes', 'manage', 'parser', 'subject-detail', 'guide'
  activeSubject: null,
  activeSession: null,
  latestResultDetails: null,
  currentParsedQuestions: [],
  selectedSubjectDetailId: null,
  timerInterval: null,
  letters: ['A', 'B', 'C', 'D', 'E'],
  QUESTIONS_PER_PAGE: 10,
  currentPage: 0,

  // Khởi động ứng dụng
  init() {
    this.renderHeader();
    this.navigateTo("home");
    this.bindGlobalEvents();
  },

  // Global Header (Tinh gọn thanh menu trên)
  renderHeader() {
    const headerEl = document.getElementById("appHeader");
    if (!headerEl) return;

    headerEl.innerHTML = `
      <div class="header-brand" onclick="App.navigateTo('home')">
        <div class="brand-icon">📚</div>
        <div class="brand-title-group">
          <h1>DThu QuizMaster</h1>
          <div class="brand-author">Bùi Văn Khang · CNSH DThu</div>
        </div>
      </div>

      <nav class="app-nav">
        <button class="nav-link" id="navHome" onclick="App.navigateTo('home')">🏠 Trang chủ</button>
        <button class="nav-link" id="navParser" onclick="App.navigateTo('parser')">📝 Nhập đề (Parser)</button>
        <button class="nav-link" id="navMistakes" onclick="App.navigateTo('mistakes')">🎯 Câu làm sai</button>
        <button class="nav-link" id="navManage" onclick="App.navigateTo('manage')">⚙️ Quản lý đề</button>
      </nav>
    `;
  },

  updateActiveNav(view) {
    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.remove("active"));
    if (view === "home") document.getElementById("navHome")?.classList.add("active");
    if (view === "parser") document.getElementById("navParser")?.classList.add("active");
    if (view === "mistakes") document.getElementById("navMistakes")?.classList.add("active");
    if (view === "manage" || view === "subject-detail") document.getElementById("navManage")?.classList.add("active");
  },

  // ═════════════════════════════════════════════════════════════════════════
  // HỆ THỐNG HỘP THOẠI CẢNH BÁO TÙY CHỌN ẨN LẦN SAU (SMART CONFIRM DIALOG)
  // ═════════════════════════════════════════════════════════════════════════
  showConfirmDialog(config = {}) {
    const {
      title = "Xác nhận hành động",
      message = "Bạn có chắc chắn muốn thực hiện hành động này?",
      icon = "⚠️",
      confirmText = "Xác nhận",
      cancelText = "Hủy bỏ",
      isDanger = false,
      warningKey = null,
      onConfirm = () => {},
      onCancel = () => {}
    } = config;

    // Nếu người dùng đã chọn "Không hiển thị lại cảnh báo này" trước đó -> Thực thi ngay lập tức
    if (warningKey && StorageService.isWarningSuppressed(warningKey)) {
      onConfirm();
      return;
    }

    const modal = document.getElementById("globalModal");
    const titleEl = document.getElementById("modalTitle");
    const bodyEl = document.getElementById("modalBody");
    const footerEl = document.getElementById("modalFooter");

    titleEl.textContent = title;

    bodyEl.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: flex-start;">
        <div style="font-size: 32px; line-height: 1;">${icon}</div>
        <div style="flex: 1;">
          <div style="font-size: 14.5px; color: var(--text-primary); line-height: 1.55; margin-bottom: 16px;">
            ${message}
          </div>

          ${warningKey ? `
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); cursor: pointer; user-select: none; padding: 6px 0; border-top: 1px dashed var(--border);">
              <input type="checkbox" id="chkSuppressWarning" style="cursor: pointer; width: 16px; height: 16px;">
              <span>Không hiển thị lại cảnh báo này trong tương lai</span>
            </label>
          ` : ''}
        </div>
      </div>
    `;

    footerEl.innerHTML = `
      <button class="btn" id="btnCancelDialog">${cancelText}</button>
      <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="btnConfirmDialog">${confirmText}</button>
    `;

    document.getElementById("btnCancelDialog").onclick = () => {
      App.closeModal();
      onCancel();
    };

    document.getElementById("btnConfirmDialog").onclick = () => {
      const chk = document.getElementById("chkSuppressWarning");
      if (chk && chk.checked && warningKey) {
        StorageService.suppressWarning(warningKey);
      }
      App.closeModal();
      onConfirm();
    };

    modal.classList.add("active");
  },

  // Router Điều hướng màn hình
  navigateTo(view, data = {}) {
    this.currentView = view;
    this.updateActiveNav(view);

    // Hủy timer nếu rời khỏi phòng thi
    if (this.timerInterval && view !== "quiz") {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const mainContainer = document.getElementById("mainContent");
    mainContainer.innerHTML = "";

    window.scrollTo({ top: 0, behavior: "smooth" });

    switch (view) {
      case "home":
        this.renderHomeView(mainContainer);
        break;
      case "quiz":
        this.renderQuizView(mainContainer);
        break;
      case "result":
        this.renderResultView(mainContainer);
        break;
      case "mistakes":
        this.renderMistakesView(mainContainer);
        break;
      case "manage":
        this.renderManageView(mainContainer);
        break;
      case "parser":
        this.renderParserView(mainContainer, data.subjectId);
        break;
      case "subject-detail":
        this.renderSubjectDetailView(mainContainer, data.subjectId || this.selectedSubjectDetailId);
        break;
      case "guide":
        this.renderGuideView(mainContainer);
        break;
      case "syntax-guide":
        this.renderSyntaxGuideView(mainContainer, data);
        break;
      default:
        this.renderHomeView(mainContainer);
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 1. HOME VIEW (TRANG CHỦ MÔN HỌC - TINH GỌN)
  // ═════════════════════════════════════════════════════════════════════════
  renderHomeView(container) {
    const subjects = StorageService.getSubjects();

    container.innerHTML = `
      <div class="view-home">
        <!-- Hero Section Tinh Gọn -->
        <div class="home-hero">
          <div class="home-hero-text">
            <h2>Nền tảng Ôn tập & Thi thử Trắc nghiệm Đại học</h2>
            <p>Hệ thống tự học, ngân hàng đề cương, thi thử tính giờ và lưu trữ tiến độ học tập cho sinh viên Trường Đại học Đồng Tháp.</p>
          </div>
          <div class="home-hero-actions">
            <button class="btn btn-primary" onclick="App.openCreateSubjectModal()">
              ➕ Thêm môn mới
            </button>
            <button class="btn" onclick="App.triggerImportFile()">
              📥 Nhập file JSON
            </button>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="search-filter-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="searchInput" class="form-control" placeholder="Tìm kiếm môn học theo tên, mã môn (vd: POL102, BIO201...)" oninput="App.onSearchSubjects()">
          </div>
          <select id="deptFilter" class="form-control" style="width: auto; min-width: 200px;" onchange="App.onSearchSubjects()">
            <option value="all">Tất cả khoa / ngành</option>
            ${this.getUniqueDepts(subjects).map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>

        <!-- Subjects Grid -->
        <div class="subjects-grid" id="subjectsGrid">
          ${this.renderSubjectCards(subjects)}
        </div>
      </div>
    `;
  },

  getUniqueDepts(subjects) {
    return [...new Set(subjects.map(s => s.department || "Khác"))];
  },

  renderSubjectCards(subjects) {
    if (subjects.length === 0) {
      return `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-tertiary);">Không tìm thấy môn học nào phù hợp.</div>`;
    }

    return subjects.map(sub => {
      const qCount = sub.questions ? sub.questions.length : 0;
      const cCount = sub.chapters ? sub.chapters.length : 0;
      const latest = StorageService.getLatestScoreForSubject(sub.id);

      return `
        <div class="subject-card">
          <div class="subject-card-top">
            <span class="subject-code-badge">${sub.code || sub.id}</span>
            <span class="badge badge-gray">${cCount} chương</span>
          </div>
          <h3>${sub.name}</h3>
          <div class="subject-card-dept">🏛️ ${sub.department || 'Đại học Đồng Tháp'}</div>

          <div class="subject-meta-stats">
            <span>Tổng câu: <strong>${qCount}</strong></span>
            <span>Tác giả: <strong>${sub.author ? sub.author.split('-')[0] : 'Admin'}</strong></span>
          </div>

          <div class="subject-card-footer">
            <div class="last-score-text">
              ${latest ? `Lần thi gần nhất: <strong>${latest.score10}/10</strong>` : `Chưa làm bài thi nào`}
            </div>
            <button class="btn btn-primary btn-sm" onclick="App.openQuizConfigModal('${sub.id}')">
              Vào Ôn Thi ➔
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  onSearchSubjects() {
    const query = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
    const dept = document.getElementById("deptFilter")?.value || "all";

    const all = StorageService.getSubjects();
    const filtered = all.filter(s => {
      const matchQuery = s.name.toLowerCase().includes(query) || (s.code && s.code.toLowerCase().includes(query));
      const matchDept = dept === "all" || s.department === dept;
      return matchQuery && matchDept;
    });

    const grid = document.getElementById("subjectsGrid");
    if (grid) grid.innerHTML = this.renderSubjectCards(filtered);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 2. SUBJECT DETAIL & EDIT VIEW (CHI TIẾT & CHỈNH SỬA MÔN HỌC)
  // ═════════════════════════════════════════════════════════════════════════
  renderSubjectDetailView(container, subjectId) {
    this.selectedSubjectDetailId = subjectId;
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) {
      this.navigateTo("manage");
      return;
    }

    const qCount = sub.questions ? sub.questions.length : 0;
    const chapters = sub.chapters || [];
    const latestScore = StorageService.getLatestScoreForSubject(sub.id);

    container.innerHTML = `
      <div class="view-subject-detail">
        <!-- Back navigation -->
        <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <button class="btn btn-sm" onclick="App.navigateTo('manage')">← Quay lại danh sách môn</button>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="App.openQuizConfigModal('${sub.id}')">🚀 Vào Ôn Thi</button>
            <button class="btn btn-sm" onclick="App.navigateTo('parser', { subjectId: '${sub.id}' })">📝 Nhập thêm câu (Parser)</button>
            <button class="btn btn-sm" onclick="ImportExportService.exportSubject('${sub.id}')">📥 Xuất file JSON</button>
          </div>
        </div>

        <!-- Header Info Card -->
        <div class="detail-header-card">
          <div class="detail-header-top">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <span class="subject-code-badge" style="font-size: 14px; padding: 4px 12px;">${sub.code || sub.id}</span>
                <span class="badge badge-blue">${sub.department || 'Đại học Đồng Tháp'}</span>
              </div>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">${sub.name}</h2>
              <p style="font-size: 13.5px; color: var(--text-secondary);">
                ${sub.description || 'Chưa có mô tả chi tiết cho môn học này.'}
              </p>
            </div>
            <button class="btn btn-sm" onclick="App.openEditSubjectModal('${sub.id}')">
              ✏️ Chỉnh sửa thông tin
            </button>
          </div>

          <!-- Stats Bar -->
          <div class="detail-stats-bar">
            <div class="detail-stat-box">
              <div class="num">${qCount}</div>
              <div class="lbl">Tổng số câu hỏi</div>
            </div>
            <div class="detail-stat-box">
              <div class="num">${chapters.length}</div>
              <div class="lbl">Số lượng chương</div>
            </div>
            <div class="detail-stat-box">
              <div class="num" style="font-size: 14px; font-weight: 700; padding-top: 4px;">${sub.author || 'Chưa cập nhật'}</div>
              <div class="lbl">Người biên soạn / Đóng góp</div>
            </div>
            <div class="detail-stat-box">
              <div class="num" style="color: var(--success);">${latestScore ? `${latestScore.score10}/10` : 'Chưa thi'}</div>
              <div class="lbl">Điểm thi gần nhất</div>
            </div>
          </div>
        </div>

        <!-- 2 Columns: Chapters & Questions List -->
        <div class="detail-sections-grid">
          <!-- Column 1: Chapters Management -->
          <div class="detail-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 16px; font-weight: 700;">📂 Danh sách Chương (${chapters.length})</h3>
              <button class="btn btn-sm" onclick="App.openAddChapterModal('${sub.id}')">➕ Thêm chương</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${chapters.length === 0 ? `<p style="font-size: 13px; color: var(--text-tertiary);">Chưa có chương nào.</p>` : ''}
              ${chapters.map(c => {
                const countInCh = (sub.questions || []).filter(q => q.chapterId === c.id).length;
                return `
                  <div class="chapter-item-row">
                    <div>
                      <strong>${c.name}</strong>
                      <div style="font-size: 11.5px; color: var(--text-secondary);">${countInCh} câu hỏi</div>
                    </div>
                    <button class="btn btn-sm btn-danger" style="padding: 3px 8px; font-size: 11px;" onclick="App.deleteChapter('${sub.id}', '${c.id}')">Xóa</button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Column 2: Questions Management -->
          <div class="detail-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
              <h3 style="font-size: 16px; font-weight: 700;">📋 Ngân hàng câu hỏi (${qCount})</h3>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-primary" onclick="App.navigateTo('parser', { subjectId: '${sub.id}' })">⚡ Nhập nhanh</button>
              </div>
            </div>

            <div style="max-height: 520px; overflow-y: auto; padding-right: 4px;">
              ${qCount === 0 ? `
                <div style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                  Môn học này chưa có câu hỏi nào.<br>
                  <button class="btn btn-sm btn-primary" style="margin-top: 12px;" onclick="App.navigateTo('parser', { subjectId: '${sub.id}' })">Nhập câu hỏi ngay ➔</button>
                </div>
              ` : (sub.questions || []).map((q, qIdx) => `
                <div class="q-manage-item">
                  <div class="q-manage-header">
                    <span class="badge badge-gray">Câu ${qIdx + 1} (${q.id || `Q${qIdx + 1}`})</span>
                    <button class="btn btn-sm btn-danger" style="padding: 2px 6px; font-size: 11px;" onclick="App.deleteQuestionFromSubject('${sub.id}', '${q.id}')">Xóa câu</button>
                  </div>
                  <div style="font-size: 13.5px; font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">${SmartParserService.formatRichText(q.question)}</div>
                  <div style="font-size: 12.5px; color: var(--success-text); background: var(--success-bg); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--success-border);">
                    ✓ Đáp án chuẩn (${this.letters[q.answerIndex]}): ${SmartParserService.formatRichText(q.options[q.answerIndex] ? q.options[q.answerIndex].text : '')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Modal Chỉnh sửa thông tin môn học
  openEditSubjectModal(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `Chỉnh sửa môn: ${sub.name}`;

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên môn học (*):</label>
        <input type="text" id="editSubName" class="form-control" value="${sub.name}">
      </div>
      <div class="form-group">
        <label class="form-label">Mã môn học (*):</label>
        <input type="text" id="editSubCode" class="form-control" value="${sub.code || sub.id}">
      </div>
      <div class="form-group">
        <label class="form-label">Khoa / Ngành:</label>
        <input type="text" id="editSubDept" class="form-control" value="${sub.department || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Người biên soạn / Sinh viên đóng góp:</label>
        <input type="text" id="editSubAuthor" class="form-control" value="${sub.author || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả môn học:</label>
        <textarea id="editSubDesc" class="form-control" rows="3">${sub.description || ''}</textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedSubject('${sub.id}')">Lưu thay đổi</button>
    `;

    modal.classList.add("active");
  },

  saveEditedSubject(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const name = document.getElementById("editSubName")?.value.trim();
    const code = document.getElementById("editSubCode")?.value.trim().toUpperCase();
    const dept = document.getElementById("editSubDept")?.value.trim();
    const author = document.getElementById("editSubAuthor")?.value.trim();
    const desc = document.getElementById("editSubDesc")?.value.trim();

    if (!name || !code) {
      alert("Vui lòng nhập đầy đủ Tên môn học và Mã môn học!");
      return;
    }

    sub.name = name;
    sub.code = code;
    sub.department = dept;
    sub.author = author;
    sub.description = desc;

    StorageService.saveSubject(sub);
    this.closeModal();
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  // Modal Thêm chương mới
  openAddChapterModal(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const nextIndex = (sub.chapters || []).length + 1;
    const name = prompt("Nhập tên chương mới:", `Chương ${nextIndex}: `);
    if (name && name.trim()) {
      if (!sub.chapters) sub.chapters = [];
      sub.chapters.push({
        id: `c${nextIndex}`,
        name: name.trim()
      });
      StorageService.saveSubject(sub);
      this.navigateTo("subject-detail", { subjectId: sub.id });
    }
  },

  deleteChapter(subjectId, chapterId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa chương",
      message: "Bạn có chắc chắn muốn xóa chương này không? Các câu hỏi thuộc chương này vẫn sẽ được giữ lại.",
      icon: "🗑️",
      confirmText: "Xóa chương",
      isDanger: true,
      warningKey: "delete_chapter",
      onConfirm: () => {
        const sub = StorageService.getSubjectById(subjectId);
        if (sub) {
          sub.chapters = (sub.chapters || []).filter(c => c.id !== chapterId);
          StorageService.saveSubject(sub);
          this.navigateTo("subject-detail", { subjectId: sub.id });
        }
      }
    });
  },

  deleteQuestionFromSubject(subjectId, questionId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa câu hỏi",
      message: "Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng đề không?",
      icon: "🗑️",
      confirmText: "Xóa câu hỏi",
      isDanger: true,
      warningKey: "delete_question",
      onConfirm: () => {
        const sub = StorageService.getSubjectById(subjectId);
        if (sub) {
          sub.questions = (sub.questions || []).filter(q => q.id !== questionId);
          StorageService.saveSubject(sub);
          this.navigateTo("subject-detail", { subjectId: sub.id });
        }
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 3. SMART TEXT PARSER VIEW (NHẬP ĐỀ TỰ ĐỘNG)
  // ═════════════════════════════════════════════════════════════════════════
  renderParserView(container, preselectedSubjectId) {
    const subjects = StorageService.getSubjects();
    const defaultSubId = preselectedSubjectId || (subjects[0] ? subjects[0].id : "");

    container.innerHTML = `
      <div class="view-parser">
        <!-- Left Panel: Raw Input Area -->
        <div class="parser-panel">
          <div class="parser-panel-header">
            <h3>📝 1. Nhập văn bản câu hỏi thô</h3>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-sm btn-primary" onclick="App.navigateTo('syntax-guide', { from: 'parser', subjectId: '${defaultSubId}' })">💡 Cú pháp ký tự ➔</button>
              <button class="btn btn-sm" onclick="App.loadParserSampleText()">Dán đề mẫu</button>
              <button class="btn btn-sm" onclick="App.clearParserInput()">Xóa trắng</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Chọn môn học cần nạp (*):</label>
              <select id="parserSubjectSelect" class="form-control" onchange="App.onParserSubjectChange()">
                ${subjects.map(s => `<option value="${s.id}" ${s.id === defaultSubId ? 'selected' : ''}>${s.name} (${s.code || s.id})</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Gán vào chương:</label>
              <select id="parserChapterSelect" class="form-control">
                <option value="c1">Chương 1</option>
              </select>
            </div>
          </div>

          <textarea id="rawTextarea" class="parser-textarea" placeholder="Dán văn bản câu hỏi từ Word, PDF hoặc ChatGPT vào đây...

Hỗ trợ mọi định dạng phổ biến:
1. Kiểu chuẩn:
Câu 1: Nội dung câu hỏi ở đây?
A. Lựa chọn A
B. Lựa chọn B
C. Lựa chọn C
D. Lựa chọn D
Đáp án: A
Giải thích: Lý do vì sao đáp án A đúng...

2. Hoặc kiểu có giải thích từng câu:
Câu 2: Theo nghĩa rộng, **CNXHKH** được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Giải thích A
* B. Hệ tư tưởng của riêng giai cấp tư sản > Sai: Giải thích B
* C. Một nhánh nhỏ độc lập > Sai: Giải thích C
* D. Chỉ bao gồm bộ phận KTCT > Sai: Giải thích D" oninput="App.onParserInput()"></textarea>

          <div style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <span>💡 <strong>Mẹo:</strong> Hỗ trợ in đậm <code>**text**</code>, in nghiêng <code>*text*</code>, công thức <code>\`code\`</code> và mọi ký tự đặc biệt.</span>
            <a href="javascript:void(0)" onclick="App.navigateTo('syntax-guide', { from: 'parser', subjectId: '${defaultSubId}' })" style="font-weight: 700; color: var(--brand-primary); text-decoration: underline;">Cú pháp ký tự ➔</a>
          </div>

          <button class="btn btn-primary" onclick="App.onParserInput(true)">
            🚀 Bóc tách & Phân tích lại
          </button>
        </div>

        <!-- Right Panel: Live Parsed Preview & Actions -->
        <div class="parser-panel">
          <div class="parser-panel-header">
            <h3>👁️ 2. Xem trước kết quả bóc tách</h3>
            <span class="badge badge-green" id="parserCounterBadge">0 câu hỏi hợp lệ</span>
          </div>

          <div class="parser-preview-list" id="parserPreviewList">
            <div style="text-align: center; padding: 48px 20px; color: var(--text-tertiary);">
              Vui lòng dán văn bản câu hỏi ở khung bên trái hoặc bấm <strong>"Dán đề mẫu"</strong> để xem kết quả phân tích tự động.
            </div>
          </div>

          <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-success" id="btnSaveToSubject" onclick="App.saveParsedQuestionsToSubject()" disabled>
              💾 Lưu vào Môn học
            </button>
            <button class="btn" id="btnDownloadJson" onclick="App.downloadParsedAsJson()" disabled>
              📥 Tải file JSON
            </button>
            <button class="btn" id="btnCopyJson" onclick="App.copyParsedJsonToClipboard()" disabled>
              📋 Sao chép JSON
            </button>
            <button class="btn btn-primary" id="btnContribute" onclick="App.openContributeModal()" disabled>
              📤 Gửi đóng góp đề thi ➔
            </button>
          </div>
        </div>
      </div>
    `;

    // Cập nhật danh sách chương theo môn được chọn
    this.onParserSubjectChange();
  },

  openContributeModal(subjectId) {
    const subId = subjectId || document.getElementById("parserSubjectSelect")?.value;
    const sub = StorageService.getSubjectById(subId);
    const subName = sub ? sub.name : "Môn học mới";
    const subCode = sub ? (sub.code || sub.id) : "POL102";

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "📤 Hướng Dẫn Đóng Góp Bộ Đề Thi";

    body.innerHTML = `
      <div style="font-size: 13.5px; line-height: 1.6; color: var(--text-primary);">
        <p style="margin-bottom: 14px;">
          Cảm ơn bạn đã đóng góp ngân hàng câu hỏi để cùng xây dựng thư viện đề thi mở cho sinh viên <strong>Trường Đại học Đồng Tháp</strong>!
        </p>

        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 16px;">
          <h4 style="font-size: 14px; margin-bottom: 8px; color: var(--brand-text);">🚀 2 Bước gửi đề cực kỳ đơn giản:</h4>
          
          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <div style="width: 24px; height: 24px; min-width: 24px; border-radius: 50%; background: var(--brand-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">1</div>
            <div>
              <strong>Tải file JSON đề thi về máy:</strong><br>
              <button class="btn btn-sm" style="margin-top: 6px;" onclick="App.downloadParsedAsJson()">📥 Tải file JSON (.json) về máy</button>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <div style="width: 24px; height: 24px; min-width: 24px; border-radius: 50%; background: var(--brand-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">2</div>
            <div>
              <strong>Gửi duyệt đề thi:</strong><br>
              <p style="font-size: 13px; margin-top: 4px; color: var(--text-secondary);">
                Tạo một phiếu đóng góp trên GitHub để Admin (<strong>Bùi Văn Khang</strong>) kiểm tra và tích hợp đề của bạn vào hệ thống:
              </p>
              <a href="https://github.com/VKhang-Bui/dthu-quizmaster/issues/new/choose" target="_blank" class="btn btn-sm btn-primary" style="margin-top: 6px; display: inline-flex; align-items: center; gap: 6px;">
                🔗 Mở trang Đóng góp trên GitHub ➔
              </a>
            </div>
          </div>
        </div>

        <p style="font-size: 12.5px; color: var(--text-secondary);">
          💡 Hoặc bạn cũng có thể gửi trực tiếp file JSON qua Email: <code>vkhang.bui.dthu@gmail.com</code> kèm thông tin môn học.
        </p>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
    `;

    modal.classList.add("active");
  },

  onParserSubjectChange() {
    const subId = document.getElementById("parserSubjectSelect")?.value;
    const sub = StorageService.getSubjectById(subId);
    const chapterSelect = document.getElementById("parserChapterSelect");
    if (!sub || !chapterSelect) return;

    if (sub.chapters && sub.chapters.length > 0) {
      chapterSelect.innerHTML = sub.chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } else {
      chapterSelect.innerHTML = `<option value="c1">Chương 1</option>`;
    }
  },

  onParserInput(isManual = false) {
    const raw = document.getElementById("rawTextarea")?.value || "";
    const chapterId = document.getElementById("parserChapterSelect")?.value || "c1";

    const { questions, errors, totalParsed } = SmartParserService.parseRawText(raw, chapterId);
    this.currentParsedQuestions = questions;

    const badge = document.getElementById("parserCounterBadge");
    const previewList = document.getElementById("parserPreviewList");
    const btnSave = document.getElementById("btnSaveToSubject");
    const btnDownload = document.getElementById("btnDownloadJson");
    const btnCopy = document.getElementById("btnCopyJson");
    const btnContribute = document.getElementById("btnContribute");

    if (badge) badge.textContent = `${totalParsed} câu hỏi hợp lệ`;

    if (totalParsed === 0) {
      if (previewList) {
        previewList.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; color: var(--text-tertiary);">
            Chưa nhận diện được câu hỏi nào. Vui lòng kiểm tra lại định dạng câu hỏi (Ví dụ: <code>Câu 1: ... A. ... B. ... Đáp án: A</code>).
          </div>
        `;
      }
      if (btnSave) btnSave.disabled = true;
      if (btnDownload) btnDownload.disabled = true;
      if (btnCopy) btnCopy.disabled = true;
      if (btnContribute) btnContribute.disabled = true;
      return;
    }

    if (btnSave) btnSave.disabled = false;
    if (btnDownload) btnDownload.disabled = false;
    if (btnCopy) btnCopy.disabled = false;
    if (btnContribute) btnContribute.disabled = false;

    if (previewList) {
      previewList.innerHTML = questions.map((q, idx) => `
        <div class="preview-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="badge badge-gray">Câu ${idx + 1}</span>
            <span style="font-size: 11.5px; font-weight: 700; color: var(--success);">Đáp án đúng: ${this.letters[q.answerIndex]}</span>
          </div>
          <div class="preview-card-title">${SmartParserService.formatRichText(q.question)}</div>
          <div>
            ${q.options.map((opt, oi) => `
              <div class="preview-opt-item ${oi === q.answerIndex ? 'is-correct' : ''}">
                <strong>${this.letters[oi]}.</strong> ${SmartParserService.formatRichText(opt.text)}
                ${opt.note ? `<div style="font-size: 11.5px; opacity: 0.85; margin-left: 14px; margin-top: 2px;">↳ <em>${SmartParserService.formatRichText(opt.note)}</em></div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  },

  loadParserSampleText() {
    const sample = `Câu 1: Theo nghĩa rộng, **Chủ nghĩa xã hội khoa học** (CNXHKH) được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Theo nghĩa rộng, CNXHKH chính là toàn bộ chủ nghĩa Mác - Lênin (Triết học, KTCT và CNXHKH).
* B. Hệ tư tưởng của riêng giai cấp "tư sản" > Sai: CNXHKH là hệ tư tưởng của giai cấp công nhân.
* C. Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác > Sai: CNXHKH là bộ phận cốt lõi của chủ nghĩa Mác - Lênin.
* D. Chỉ bao gồm bộ phận Kinh tế chính trị Mác - Lênin > Sai: Đây chỉ là một bộ phận hợp thành.

Câu 2: Công thức nào sau đây biểu thị đúng điều kiện cân bằng trong điều kiện kinh tế: \`P * Q = M * V\` và so sánh \`a < b & c > d\`?
A. Điều kiện kinh tế số 1 với $100% tỷ lệ #thành_công
* B. Phương trình \`P * Q = M * V\` và biểu thức so sánh (a < b & c > d) > Đúng: Hỗ trợ 100% ký tự toán học, code và dấu đặc biệt!
C. Ký hiệu @author: Bùi Văn Khang (CNSH - DThu) & nhóm nghiên cứu #CNXHKH
D. Biểu thức 'chuỗi ký tự đặc biệt': "100% chính xác?" / [Ghi chú]

Câu 3: Hai phát kiến vĩ đại của *C. Mác* và *Ph. Ăng-ghen* tạo tiền đề để luận chứng sự ra đời của CNXHKH là gì?
A. Chủ nghĩa duy vật biện chứng và Học thuyết giá trị thặng dư
B. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư
C. Phép biện chứng duy vật và Học thuyết đấu tranh giai cấp
D. Học thuyết nhà nước và Học thuyết cách mạng vô sản
Đáp án: B
Giải thích: Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư là hai phát kiến vĩ đại làm cơ sở chuyển CNXH từ không tưởng thành khoa học.`;

    const textarea = document.getElementById("rawTextarea");
    if (textarea) {
      textarea.value = sample;
      this.onParserInput(true);
    }
  },

  clearParserInput() {
    const textarea = document.getElementById("rawTextarea");
    if (textarea) {
      textarea.value = "";
      this.onParserInput();
    }
  },

  saveParsedQuestionsToSubject() {
    const subId = document.getElementById("parserSubjectSelect")?.value;
    const sub = StorageService.getSubjectById(subId);
    if (!sub || this.currentParsedQuestions.length === 0) return;

    if (!sub.questions) sub.questions = [];
    sub.questions.push(...this.currentParsedQuestions);

    StorageService.saveSubject(sub);
    alert(`🎉 Thành công! Đã thêm ${this.currentParsedQuestions.length} câu hỏi mới vào môn "${sub.name}".`);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  downloadParsedAsJson() {
    if (this.currentParsedQuestions.length === 0) return;

    const subId = document.getElementById("parserSubjectSelect")?.value || "custom";
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.currentParsedQuestions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ngan-hang-cau-hoi-${subId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  copyParsedJsonToClipboard() {
    if (this.currentParsedQuestions.length === 0) return;
    const jsonStr = JSON.stringify(this.currentParsedQuestions, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      alert("📋 Đã sao chép toàn bộ mã JSON câu hỏi vào Clipboard!");
    }).catch(err => {
      alert("Không thể sao chép: " + err);
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 4. MODAL CẤU HÌNH THI / ÔN TẬP
  // ═════════════════════════════════════════════════════════════════════════
  openQuizConfigModal(subjectId) {
    const subject = StorageService.getSubjectById(subjectId);
    if (!subject) return;
    this.activeSubject = subject;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `Ôn tập: ${subject.name}`;

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">1. Chọn chế độ làm bài:</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <label style="border: 1.5px solid var(--border); padding: 14px; border-radius: var(--radius-sm); cursor: pointer; display: flex; gap: 10px; align-items: flex-start;">
            <input type="radio" name="quizMode" value="practice" checked style="margin-top: 4px;">
            <div>
              <strong style="display: block; font-size: 14px;">🟢 Chế độ Ôn tập</strong>
              <span style="font-size: 12px; color: var(--text-secondary);">Hiện đáp án & giải thích ngay sau mỗi câu chọn</span>
            </div>
          </label>
          <label style="border: 1.5px solid var(--border); padding: 14px; border-radius: var(--radius-sm); cursor: pointer; display: flex; gap: 10px; align-items: flex-start;">
            <input type="radio" name="quizMode" value="exam" style="margin-top: 4px;">
            <div>
              <strong style="display: block; font-size: 14px;">⏱️ Chế độ Thi thử</strong>
              <span style="font-size: 12px; color: var(--text-secondary);">Có đồng hồ đếm ngược, nộp bài mới biết điểm</span>
            </div>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">2. Số lượng câu hỏi:</label>
        <select id="configQuestionCount" class="form-control">
          <option value="all">Toàn bộ ngân hàng câu hỏi (${subject.questions ? subject.questions.length : 0} câu)</option>
          <option value="10">10 câu hỏi ngẫu nhiên</option>
          <option value="20">20 câu hỏi ngẫu nhiên</option>
          <option value="40">40 câu hỏi ngẫu nhiên</option>
          <option value="50">50 câu hỏi ngẫu nhiên</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">3. Phạm vi ôn tập:</label>
        <select id="configChapter" class="form-control">
          <option value="all">Tất cả các chương</option>
          ${(subject.chapters || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-primary" onclick="App.startQuizSession()">Bắt đầu làm bài 🚀</button>
    `;

    modal.classList.add("active");
  },

  startQuizSession() {
    const mode = document.querySelector('input[name="quizMode"]:checked')?.value || "practice";
    const questionCount = document.getElementById("configQuestionCount")?.value || "all";
    const chapterId = document.getElementById("configChapter")?.value || "all";

    const session = QuizEngine.createQuizSession(this.activeSubject, {
      mode,
      questionCount,
      chapterId,
      shuffleQuestions: true
    });

    if (session.questions.length === 0) {
      alert("Không có câu hỏi nào trong phạm vi này!");
      return;
    }

    session.flags = {}; // Quản lý danh sách câu đã đặt cờ 🚩
    this.activeSession = session;
    this.currentPage = 0;
    this.closeModal();
    this.navigateTo("quiz");

    // Khởi động đồng hồ nếu thi thử
    if (mode === "exam") {
      this.startExamTimer();
    }
  },

  startExamTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (!this.activeSession) return;
      this.activeSession.timeRemainingSeconds--;

      const digits = document.getElementById("timerDigits");
      if (digits) {
        const m = Math.floor(this.activeSession.timeRemainingSeconds / 60);
        const s = this.activeSession.timeRemainingSeconds % 60;
        digits.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }

      if (this.activeSession.timeRemainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        alert("⏰ Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài của bạn.");
        this.submitQuiz(true);
      }
    }, 1000);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 5. QUIZ & EXAM VIEW (PHÒNG LÀM BÀI)
  // ═════════════════════════════════════════════════════════════════════════
  renderQuizView(container) {
    const session = this.activeSession;
    if (!session) {
      this.navigateTo("home");
      return;
    }

    if (!session.flags) session.flags = {};
    const isExam = session.mode === "exam";
    const savedWidth = localStorage.getItem("dthu_quiz_sidebar_width") || "320";

    container.innerHTML = `
      <div class="view-quiz" id="viewQuizContainer">
        <!-- Sidebar Navigation Grid -->
        <aside class="quiz-sidebar" id="quizSidebar" style="width: ${savedWidth}px; min-width: ${savedWidth}px;">
          <button class="btn btn-sm" onclick="App.confirmExitQuiz()">← Rời phòng làm bài</button>

          ${isExam ? `
            <div class="quiz-timer-box">
              <span class="timer-label">⏳ Thời gian còn lại:</span>
              <span class="timer-digits" id="timerDigits">--:--</span>
            </div>
          ` : ''}

          <div class="sidebar-title">Danh sách câu hỏi (${session.questions.length} câu)</div>
          <div class="sidebar-page-indicator" id="sidebarPageIndicator"></div>
          <div id="sidebarFlagSummary" style="display: none;"></div>
          <div class="q-grid" id="quizGridNav"></div>

          <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
            <button class="btn btn-primary" style="width: 100%;" onclick="App.submitQuiz()">
              ${isExam ? '📝 Nộp bài thi' : '🏁 Kết thúc ôn tập'}
            </button>
          </div>
        </aside>

        <!-- Draggable Resizer Handle -->
        <div class="quiz-resizer" id="quizResizer" title="Kéo chuột để điều chỉnh độ rộng 2 bên"></div>

        <!-- Main Content Question Area -->
        <main class="quiz-main" id="quizMainContent">
          <!-- Top Bar with Navigation -->
          <div class="quiz-top-bar">
            <div class="quiz-top-left">
              <h2>${session.subjectName} (${session.subjectCode || session.subjectId})</h2>
              <p>Chế độ: <strong>${isExam ? 'Thi thử tính giờ' : 'Ôn tập có giải thích'}</strong> · Tổng số câu: ${session.questions.length}</p>
            </div>
            <div id="quizPaginationControls"></div>
          </div>

          <!-- Questions of current page -->
          <div id="quizQuestionsContainer"></div>

          <!-- Bottom Pagination Controls -->
          <div id="quizBottomPaginationControls"></div>
        </main>
      </div>
    `;

    this.renderQuizQuestions();
    this.renderQuizSidebarGrid();
    this.initQuizResizer();
  },

  // Khởi tạo tính năng kéo thả điều chỉnh kích thước 2 bên
  initQuizResizer() {
    const resizer = document.getElementById("quizResizer");
    const sidebar = document.getElementById("quizSidebar");
    const container = document.getElementById("viewQuizContainer");

    if (!resizer || !sidebar || !container) return;

    let isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      resizer.classList.add("is-dragging");
      document.body.classList.add("is-resizing-quiz");
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();
      const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
      let newWidth = clientX - containerRect.left;

      // Giới hạn kích thước tối thiểu và tối đa (220px <= width <= 580px hoặc 50% màn hình)
      const minWidth = 220;
      const maxWidth = Math.min(580, containerRect.width * 0.55);

      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;

      sidebar.style.width = `${newWidth}px`;
      sidebar.style.minWidth = `${newWidth}px`;
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        resizer.classList.remove("is-dragging");
        document.body.classList.remove("is-resizing-quiz");

        // Lưu kích thước người dùng vừa chỉnh vào localStorage
        const currentWidth = parseInt(sidebar.style.width, 10);
        if (currentWidth) {
          localStorage.setItem("dthu_quiz_sidebar_width", currentWidth.toString());
        }
      }
    };

    resizer.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    // Hỗ trợ cả màn hình cảm ứng
    resizer.addEventListener("touchstart", onMouseDown, { passive: false });
    document.addEventListener("touchmove", onMouseMove, { passive: false });
    document.addEventListener("touchend", onMouseUp);
  },

  // Lấy danh sách câu hỏi theo bộ lọc (Tất cả hoặc Chỉ câu đã đặt cờ)
  getFilteredQuestions() {
    if (!this.activeSession) return [];
    if (this.quizFilterMode === "flagged") {
      const flags = this.activeSession.flags || {};
      return this.activeSession.questions.filter(q => flags[q.id]);
    }
    return this.activeSession.questions;
  },

  // Bật/tắt chế độ lọc chỉ xem câu đã đặt cờ 🚩
  toggleFlagFilter(forceMode) {
    if (forceMode !== undefined) {
      this.quizFilterMode = forceMode;
    } else {
      this.quizFilterMode = (this.quizFilterMode === "flagged") ? "all" : "flagged";
    }
    this.currentPage = 0;
    this.renderQuizQuestions();
    this.renderQuizSidebarGrid();
  },

  // Bật/tắt trạng thái Đánh cờ (Flag) cho câu hỏi
  toggleQuestionFlag(questionId) {
    if (!this.activeSession) return;
    if (!this.activeSession.flags) this.activeSession.flags = {};

    const isFlagged = !this.activeSession.flags[questionId];
    this.activeSession.flags[questionId] = isFlagged;

    const remainingFlagged = Object.values(this.activeSession.flags).filter(Boolean).length;

    // Nếu đang ở chế độ lọc mà gỡ cờ thì re-render lại danh sách
    if (this.quizFilterMode === "flagged") {
      if (remainingFlagged === 0) {
        this.quizFilterMode = "all";
      }
      this.renderQuizQuestions();
      this.renderQuizSidebarGrid();
      return;
    }

    // 1. Cập nhật nút Đặt cờ trên Card câu hỏi
    const btn = document.getElementById(`btnFlag-${questionId}`);
    const card = document.getElementById(`qcard-${questionId}`);
    if (btn) {
      btn.className = `btn-flag ${isFlagged ? 'is-flagged' : ''}`;
      btn.innerHTML = `<span>${isFlagged ? '🚩 Đã đặt cờ' : '🏳️ Đặt cờ'}</span>`;
    }
    if (card) {
      if (isFlagged) card.classList.add("is-flagged");
      else card.classList.remove("is-flagged");
    }

    // 2. Cập nhật ô số câu hỏi ở Sidebar
    const cell = document.getElementById(`qcell-${questionId}`);
    if (cell) {
      if (isFlagged) cell.classList.add("flagged");
      else cell.classList.remove("flagged");
    }

    // 3. Cập nhật thanh tóm tắt số cờ ở Sidebar
    this.updateSidebarFlagSummary();
  },

  updateSidebarFlagSummary() {
    const summary = document.getElementById("sidebarFlagSummary");
    if (!summary || !this.activeSession) return;

    const flags = this.activeSession.flags || {};
    const flaggedCount = Object.values(flags).filter(Boolean).length;

    if (flaggedCount > 0) {
      summary.style.display = "flex";
      summary.className = `sidebar-flag-summary ${this.quizFilterMode === 'flagged' ? 'is-filtering' : ''}`;
      if (this.quizFilterMode === "flagged") {
        summary.innerHTML = `
          <span>🚩 Đang lọc: <strong>${flaggedCount} câu</strong></span>
          <button class="btn btn-sm btn-primary" style="padding: 2px 8px; font-size: 11px; height: auto;" onclick="App.toggleFlagFilter('all')">✕ Hiện tất cả</button>
        `;
      } else {
        summary.innerHTML = `
          <span>🚩 Đã đặt cờ: <strong>${flaggedCount} câu</strong></span>
          <button class="btn btn-sm btn-primary" style="padding: 2px 8px; font-size: 11px; height: auto;" onclick="App.toggleFlagFilter('flagged')">🔍 Chỉ xem cờ (${flaggedCount}) ➔</button>
        `;
      }
    } else {
      summary.style.display = "none";
      summary.innerHTML = "";
    }
  },

  renderQuizSidebarGrid() {
    const grid = document.getElementById("quizGridNav");
    if (!grid || !this.activeSession) return;
    grid.innerHTML = "";

    const displayedList = this.getFilteredQuestions();
    const isFiltering = this.quizFilterMode === "flagged";
    const totalDisplayed = displayedList.length;
    const totalPages = Math.max(1, Math.ceil(totalDisplayed / this.QUESTIONS_PER_PAGE));
    const startIdx = this.currentPage * this.QUESTIONS_PER_PAGE;
    const endIdx = Math.min(startIdx + this.QUESTIONS_PER_PAGE, totalDisplayed);

    // Cập nhật thẻ chỉ báo trang đang xem ở cột bên trái
    const indicator = document.getElementById("sidebarPageIndicator");
    if (indicator) {
      if (isFiltering) {
        indicator.innerHTML = `
          <span>🚩 Đang lọc: ${totalDisplayed} câu có cờ</span>
          <span>Trang ${this.currentPage + 1}/${totalPages}</span>
        `;
      } else {
        indicator.innerHTML = `
          <span>📌 Đang xem: Câu ${startIdx + 1} – ${endIdx}</span>
          <span>Trang ${this.currentPage + 1}/${totalPages}</span>
        `;
      }
    }

    this.updateSidebarFlagSummary();

    const currentVisibleIds = new Set(displayedList.slice(startIdx, endIdx).map(q => q.id));

    this.activeSession.questions.forEach((q, idx) => {
      const cell = document.createElement("div");
      cell.className = "q-cell";
      cell.textContent = idx + 1;
      cell.id = `qcell-${q.id}`;

      // Đánh dấu phát sáng / viền nổi bật nếu câu này thuộc trang đang xem
      if (currentVisibleIds.has(q.id)) {
        cell.classList.add("in-current-page");
      }

      // Đánh dấu cắm cờ 🚩
      if (this.activeSession.flags && this.activeSession.flags[q.id]) {
        cell.classList.add("flagged");
      } else if (isFiltering) {
        cell.classList.add("filtered-out");
      }

      const userAns = this.activeSession.answers[q.id];
      if (userAns !== undefined) {
        if (this.activeSession.mode === "practice") {
          const isCorrect = userAns === q.answerIndex;
          cell.classList.add(isCorrect ? "correct" : "wrong");
        } else {
          cell.classList.add("answered");
        }
      }

      cell.onclick = () => {
        if (isFiltering) {
          const isThisFlagged = this.activeSession.flags && this.activeSession.flags[q.id];
          if (!isThisFlagged) {
            // Tự động thoát lọc để nhảy tới câu chưa cắm cờ
            this.quizFilterMode = "all";
            const targetPage = Math.floor(idx / this.QUESTIONS_PER_PAGE);
            this.currentPage = targetPage;
            this.renderQuizQuestions();
          } else {
            const filterIdx = displayedList.findIndex(x => x.id === q.id);
            if (filterIdx >= 0) {
              const targetPage = Math.floor(filterIdx / this.QUESTIONS_PER_PAGE);
              if (targetPage !== this.currentPage) {
                this.currentPage = targetPage;
                this.renderQuizQuestions();
              }
            }
          }
        } else {
          const targetPage = Math.floor(idx / this.QUESTIONS_PER_PAGE);
          if (targetPage !== this.currentPage) {
            this.currentPage = targetPage;
            this.renderQuizQuestions();
          }
        }

        setTimeout(() => {
          const el = document.getElementById(`qcard-${q.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      };

      grid.appendChild(cell);
    });
  },

  renderQuizQuestions() {
    const container = document.getElementById("quizQuestionsContainer");
    if (!container || !this.activeSession) return;
    container.innerHTML = "";

    const displayedList = this.getFilteredQuestions();
    const isFiltering = this.quizFilterMode === "flagged";
    const totalDisplayed = displayedList.length;

    // Thanh thông báo khi đang ở chế độ lọc câu có cờ
    if (isFiltering) {
      const banner = document.createElement("div");
      banner.className = "quiz-filter-banner";
      banner.innerHTML = `
        <span>🔍 Đang ở chế độ lọc: <strong>Chỉ hiển thị ${totalDisplayed} câu hỏi đã đặt cờ 🚩</strong></span>
        <button class="btn btn-sm btn-primary" onclick="App.toggleFlagFilter('all')">✕ Thoát lọc (Xem tất cả ${this.activeSession.questions.length} câu)</button>
      `;
      container.appendChild(banner);
    }

    if (totalDisplayed === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.style.cssText = "text-align: center; padding: 48px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);";
      emptyBox.innerHTML = `
        <div style="font-size: 36px; margin-bottom: 8px;">🚩</div>
        <h3>Không có câu hỏi nào đang được đặt cờ</h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">Bạn có thể bấm "Đặt cờ" ở các câu hỏi chưa chắc chắn để xem lại tại đây.</p>
        <button class="btn btn-sm btn-primary" style="margin-top: 14px;" onclick="App.toggleFlagFilter('all')">Xem tất cả ${this.activeSession.questions.length} câu hỏi ➔</button>
      `;
      container.appendChild(emptyBox);
      this.renderQuizPagination();
      this.renderQuizSidebarGrid();
      return;
    }

    const start = this.currentPage * this.QUESTIONS_PER_PAGE;
    const end = Math.min(start + this.QUESTIONS_PER_PAGE, totalDisplayed);

    for (let i = start; i < end; i++) {
      const q = displayedList[i];
      container.appendChild(this.createQuizQuestionElement(q, i, displayedList.length));
    }

    this.renderQuizPagination();
    this.renderQuizSidebarGrid();
  },

  createQuizQuestionElement(q, index, totalDisplayedCount) {
    const card = document.createElement("div");
    const isFlagged = Boolean(this.activeSession.flags && this.activeSession.flags[q.id]);
    card.className = `question-card ${isFlagged ? 'is-flagged' : ''}`;
    card.id = `qcard-${q.id}`;

    const originalIdx = this.activeSession.questions.findIndex(x => x.id === q.id);
    const userAns = this.activeSession.answers[q.id];
    const isAnswered = userAns !== undefined;
    const isPractice = this.activeSession.mode === "practice";

    let optionsHtml = `<div class="options-list">`;
    q.options.forEach((opt, oi) => {
      let optClass = "option-btn";
      let stateNote = "";

      if (isAnswered) {
        if (isPractice) {
          optClass += " disabled";
          if (oi === q.answerIndex) {
            optClass += " state-correct";
            stateNote = `<strong>✓ Đúng:</strong> ${SmartParserService.formatRichText(opt.note || 'Đáp án chính xác.')}`;
          } else if (oi === userAns) {
            optClass += " state-wrong";
            stateNote = `<strong>✗ Sai:</strong> ${SmartParserService.formatRichText(opt.note || 'Đáp án chưa chính xác.')}`;
          } else {
            optClass += " show-all";
            stateNote = `<strong>Ghi chú:</strong> ${SmartParserService.formatRichText(opt.note || '')}`;
          }
        } else {
          // Exam mode
          if (oi === userAns) optClass += " selected-exam";
        }
      }

      optionsHtml += `
        <div class="${optClass}" onclick="App.selectQuizOption('${q.id}', ${oi})">
          <div class="option-header-row">
            <div class="opt-letter">${this.letters[oi]}</div>
            <div class="opt-text">${SmartParserService.formatRichText(opt.text)}</div>
          </div>
          ${(isPractice && isAnswered && opt.note) ? `<div class="opt-explanation">${stateNote}</div>` : ''}
        </div>
      `;
    });
    optionsHtml += `</div>`;

    card.innerHTML = `
      <div class="question-card-header">
        <span class="badge badge-gray">Câu ${originalIdx + 1} (${q.id || `Q${originalIdx + 1}`})</span>
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn-flag ${isFlagged ? 'is-flagged' : ''}" onclick="App.toggleQuestionFlag('${q.id}')" id="btnFlag-${q.id}" title="Đánh dấu / Đặt cờ câu này để xem lại sau">
            <span>${isFlagged ? '🚩 Đã đặt cờ' : '🏳️ Đặt cờ'}</span>
          </button>
          <span style="font-size: 12.5px; font-weight: 700; color: var(--text-tertiary);">
            Câu ${originalIdx + 1} / ${this.activeSession.questions.length} ${this.quizFilterMode === 'flagged' ? `(Cờ ${index + 1}/${totalDisplayedCount})` : ''}
          </span>
        </div>
      </div>
      <div class="question-card-title">${SmartParserService.formatRichText(q.question)}</div>
      ${optionsHtml}
    `;

    return card;
  },

  selectQuizOption(questionId, optionIndex) {
    if (!this.activeSession) return;
    if (this.activeSession.mode === "practice" && this.activeSession.answers[questionId] !== undefined) {
      return; // Khóa trong chế độ ôn tập
    }

    this.activeSession.answers[questionId] = optionIndex;
    this.renderQuizQuestions();
  },

  renderQuizPagination() {
    const topCtrl = document.getElementById("quizPaginationControls");
    const bottomCtrl = document.getElementById("quizBottomPaginationControls");
    if (!this.activeSession) return;

    const displayedList = this.getFilteredQuestions();
    const totalQuestions = displayedList.length;
    const totalPages = Math.ceil(totalQuestions / this.QUESTIONS_PER_PAGE);

    if (totalPages <= 1) {
      if (topCtrl) topCtrl.innerHTML = "";
      if (bottomCtrl) bottomCtrl.innerHTML = "";
      return;
    }

    const start = this.currentPage * this.QUESTIONS_PER_PAGE;
    const end = Math.min(start + this.QUESTIONS_PER_PAGE, totalQuestions);

    // 1. Phân trang ở đầu trang (Gọn gàng)
    if (topCtrl) {
      topCtrl.innerHTML = `
        <div style="display: flex; gap: 6px; align-items: center;">
          <button class="btn btn-sm" ${this.currentPage === 0 ? 'disabled' : ''} onclick="App.changeQuizPage(${this.currentPage - 1})">← Trước</button>
          <span style="font-size: 13px; padding: 6px 10px; font-weight: 600; color: var(--text-primary);">Trang ${this.currentPage + 1}/${totalPages}</span>
          <button class="btn btn-sm" ${this.currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="App.changeQuizPage(${this.currentPage + 1})">Sau →</button>
        </div>
      `;
    }

    // 2. Phân trang ở cuối trang (Đầy đủ)
    if (bottomCtrl) {
      const prevStart = Math.max(1, start - this.QUESTIONS_PER_PAGE + 1);
      const prevEnd = start;
      const nextStart = end + 1;
      const nextEnd = Math.min(end + this.QUESTIONS_PER_PAGE, totalQuestions);

      bottomCtrl.innerHTML = `
        <button class="btn" ${this.currentPage === 0 ? 'disabled' : ''} onclick="App.changeQuizPage(${this.currentPage - 1})">
          ← Quay lại Trang trước ${this.currentPage > 0 ? `(Câu ${prevStart} – ${prevEnd})` : ''}
        </button>

        <div style="font-size: 13.5px; color: var(--text-secondary); text-align: center;">
          <strong>Trang ${this.currentPage + 1} / ${totalPages}</strong> · Hiển thị câu ${start + 1} – ${end}
        </div>

        ${this.currentPage < totalPages - 1 ? `
          <button class="btn btn-primary" onclick="App.changeQuizPage(${this.currentPage + 1})">
            Sang Trang tiếp theo (Câu ${nextStart} – ${nextEnd}) →
          </button>
        ` : `
          <button class="btn btn-success" onclick="App.submitQuiz()">
            🏁 Hoàn thành & Nộp bài thi ➔
          </button>
        `}
      `;
    }
  },

  changeQuizPage(p) {
    this.currentPage = p;
    this.renderQuizQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  confirmExitQuiz() {
    this.showConfirmDialog({
      title: "Rời khỏi phòng làm bài",
      message: "Bạn có chắc chắn muốn rời khỏi phòng làm bài không? Toàn bộ tiến trình làm bài hiện tại sẽ không được lưu.",
      icon: "🚪",
      confirmText: "Rời phòng",
      cancelText: "Tiếp tục làm",
      isDanger: true,
      warningKey: "exit_quiz",
      onConfirm: () => {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.navigateTo("home");
      }
    });
  },

  submitQuiz(isAuto = false) {
    if (!this.activeSession) return;

    const answeredCount = Object.keys(this.activeSession.answers).length;
    const total = this.activeSession.questions.length;
    const flags = this.activeSession.flags || {};
    const flaggedCount = Object.values(flags).filter(Boolean).length;

    const doSubmit = () => {
      if (this.timerInterval) clearInterval(this.timerInterval);
      const { result, details } = QuizEngine.gradeQuiz(this.activeSession);
      this.latestResultDetails = { result, details, subject: this.activeSubject };
      this.navigateTo("result");
    };

    if (isAuto) {
      doSubmit();
      return;
    }

    if (this.activeSession.mode === "exam") {
      let warningMessage = "";
      if (answeredCount < total) {
        warningMessage = `Bạn mới hoàn thành <strong>${answeredCount}/${total}</strong> câu hỏi`;
        if (flaggedCount > 0) {
          warningMessage += ` và đang có <strong>${flaggedCount} câu đã đặt cờ 🚩</strong> cần xem lại.`;
        } else {
          warningMessage += `.`;
        }
        warningMessage += `<br>Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?`;
      } else if (flaggedCount > 0) {
        warningMessage = `Bạn đang có <strong>${flaggedCount} câu hỏi đã đặt cờ 🚩</strong> cần xem lại.<br>Bạn có chắc chắn muốn hoàn thành và nộp bài thi không?`;
      }

      if (warningMessage) {
        this.showConfirmDialog({
          title: "Xác nhận nộp bài thi",
          message: warningMessage,
          icon: "📝",
          confirmText: "Nộp bài ngay",
          cancelText: "Xem lại bài",
          warningKey: "submit_early",
          onConfirm: doSubmit
        });
        return;
      }
    }

    doSubmit();
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 6. RESULT VIEW (MÀN HÌNH TỔNG KẾT ĐIỂM)
  // ═════════════════════════════════════════════════════════════════════════
  renderResultView(container) {
    if (!this.latestResultDetails) {
      this.navigateTo("home");
      return;
    }

    const { result, details } = this.latestResultDetails;

    container.innerHTML = `
      <div class="view-result">
        <div class="result-card-banner">
          <span class="badge badge-blue">${result.subjectName} · Chế độ: ${result.mode === 'exam' ? 'Thi thử' : 'Ôn tập'}</span>
          <div class="result-score-large">${result.score10} <span style="font-size: 20px; font-weight: 600; color: var(--text-tertiary);">/ 10</span></div>
          <h3 style="font-size: 18px; margin-bottom: 4px;">${result.gradeTitle}</h3>
          <p>Tỷ lệ trả lời chính xác: <strong>${result.percentage}%</strong></p>

          <div class="result-grid-stats">
            <div class="result-stat-item">
              <div class="val" style="color: var(--success);">${result.correctCount}</div>
              <div class="lbl">Số câu đúng</div>
            </div>
            <div class="result-stat-item">
              <div class="val" style="color: var(--danger);">${result.wrongCount}</div>
              <div class="lbl">Số câu sai</div>
            </div>
            <div class="result-stat-item">
              <div class="val" style="color: var(--text-tertiary);">${result.unattemptedCount}</div>
              <div class="lbl">Chưa làm</div>
            </div>
            <div class="result-stat-item">
              <div class="val">${result.totalQuestions}</div>
              <div class="lbl">Tổng số câu</div>
            </div>
          </div>

          <div style="margin-top: 28px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.openQuizConfigModal('${result.subjectId}')">🔄 Thi lại môn này</button>
            <button class="btn" onclick="App.navigateTo('mistakes')">🎯 Xem danh sách câu sai</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về trang chủ</button>
          </div>
        </div>

        <h3 style="margin-bottom: 16px; font-size: 17px;">Xem lại chi tiết bài làm:</h3>
        <div id="reviewDetailsList">
          ${details.map(d => this.renderReviewItem(d)).join('')}
        </div>
      </div>
    `;
  },

  renderReviewItem(d) {
    const q = d.question;
    const isCorrect = d.isCorrect;

    return `
      <div class="question-card" style="border-left: 4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'};">
        <div class="question-card-header">
          <span class="badge ${isCorrect ? 'badge-green' : 'badge-red'}">${isCorrect ? '✓ Trả lời Đúng' : '✗ Trả lời Sai'}</span>
          <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Câu ${d.index + 1}</span>
        </div>
        <div class="question-card-title">${SmartParserService.formatRichText(q.question)}</div>
        <div class="options-list">
          ${q.options.map((opt, oi) => {
            let optClass = "option-btn disabled";
            if (oi === q.answerIndex) optClass += " state-correct";
            else if (oi === d.userAnswer) optClass += " state-wrong";
            else optClass += " show-all";

            return `
              <div class="${optClass}">
                <div class="option-header-row">
                  <div class="opt-letter">${this.letters[oi]}</div>
                  <div class="opt-text">${SmartParserService.formatRichText(opt.text)}</div>
                </div>
                ${opt.note ? `<div class="opt-explanation">${oi === q.answerIndex ? '<strong>✓ Đúng:</strong> ' : ''}${SmartParserService.formatRichText(opt.note)}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 7. MISTAKES VAULT (NGÂN HÀNG CÂU SAI ĐỂ ÔN LẠI)
  // ═════════════════════════════════════════════════════════════════════════
  renderMistakesView(container) {
    const mistakes = StorageService.getMistakes();

    container.innerHTML = `
      <div style="padding: 32px 28px; max-width: 900px; margin: 0 auto; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Ngân Hàng Câu Sai (Mistake Vault)</h2>
            <p>Tự động ghi nhận những câu bạn từng làm sai trong các lần thi để giúp bạn ôn lại đúng trọng tâm.</p>
          </div>
          ${mistakes.length > 0 ? `
            <button class="btn btn-danger btn-sm" onclick="App.clearAllMistakes()">Xóa lịch sử sai</button>
          ` : ''}
        </div>

        ${mistakes.length === 0 ? `
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 48px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">🎉</div>
            <h3>Tuyệt vời! Bạn không có câu hỏi làm sai nào.</h3>
            <p style="margin-top: 6px;">Hãy vào làm bài thi thử để kiểm tra trình độ của bạn nhé.</p>
            <button class="btn btn-primary" style="margin-top: 16px;" onclick="App.navigateTo('home')">Vào thi ngay</button>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${mistakes.map(m => `
              <div class="question-card" style="border-left: 4px solid var(--danger);">
                <div class="question-card-header">
                  <span class="badge badge-red">Đã làm sai ${m.wrongCount || 1} lần</span>
                  <button class="btn btn-sm" onclick="App.removeSingleMistake('${m.subjectId}', '${m.question.id}')">Đã nhớ (Xóa khỏi danh sách)</button>
                </div>
                <div class="question-card-title">${SmartParserService.formatRichText(m.question.question)}</div>
                <div style="background: var(--success-bg); border: 1px solid var(--success-border); padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; color: var(--success-text);">
                  <strong>Đáp án chuẩn (${this.letters[m.question.answerIndex]}):</strong> ${SmartParserService.formatRichText(m.question.options[m.question.answerIndex].text)}
                  <div style="margin-top: 4px; font-size: 12.5px; opacity: 0.9;">${SmartParserService.formatRichText(m.question.options[m.question.answerIndex].note || '')}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  clearAllMistakes() {
    this.showConfirmDialog({
      title: "Xác nhận xóa danh sách câu sai",
      message: "Bạn có chắc chắn muốn xóa toàn bộ lịch sử câu hỏi làm sai không?",
      icon: "🗑️",
      confirmText: "Xóa toàn bộ",
      isDanger: true,
      warningKey: "clear_mistakes",
      onConfirm: () => {
        localStorage.removeItem(StorageService.KEYS.MISTAKES);
        this.renderMistakesView(document.getElementById("mainContent"));
      }
    });
  },

  removeSingleMistake(subId, qId) {
    StorageService.removeMistake(subId, qId);
    this.renderMistakesView(document.getElementById("mainContent"));
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 8. MANAGE VIEW (QUẢN LÝ MÔN HỌC & ĐỀ THI)
  // ═════════════════════════════════════════════════════════════════════════
  renderManageView(container) {
    const subjects = StorageService.getSubjects();

    container.innerHTML = `
      <div style="padding: 32px 28px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Quản Lý Đề Cương & Môn Học</h2>
            <p>Nhấp vào bất kỳ môn học nào để xem chi tiết, quản lý danh sách chương và chỉnh sửa thông tin.</p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.navigateTo('parser')">📝 Nhập đề (Parser)</button>
            <button class="btn" onclick="App.openCreateSubjectModal()">➕ Thêm môn học</button>
            <button class="btn" onclick="ImportExportService.exportAll()">💾 Sao lưu tất cả (.json)</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${subjects.map(sub => `
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; cursor: pointer; transition: var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-hover)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.borderColor='var(--border)'; this.style.transform='none';" onclick="App.navigateTo('subject-detail', { subjectId: '${sub.id}' })">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span class="badge badge-gray">${sub.code || sub.id}</span>
                  <span class="badge badge-blue">${sub.department || 'ĐH Đồng Tháp'}</span>
                </div>
                <h3 style="font-size: 16.5px; margin-bottom: 2px; color: var(--text-primary);">${sub.name}</h3>
                <div style="font-size: 12.5px; color: var(--text-tertiary);">
                  ${sub.questions ? sub.questions.length : 0} câu hỏi · ${sub.chapters ? sub.chapters.length : 0} chương · Người đóng góp: <strong>${sub.author || 'Chưa cập nhật'}</strong>
                </div>
              </div>
              <div style="display: flex; gap: 8px;" onclick="event.stopPropagation()">
                <button class="btn btn-sm btn-primary" onclick="App.navigateTo('subject-detail', { subjectId: '${sub.id}' })">⚙️ Chi tiết & Quản lý</button>
                <button class="btn btn-sm" onclick="ImportExportService.exportSubject('${sub.id}')">📥 Xuất JSON</button>
                <button class="btn btn-danger btn-sm" onclick="App.deleteSubjectConfirm('${sub.id}')">Xóa</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  deleteSubjectConfirm(subjectId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa môn học",
      message: "Bạn có chắc chắn muốn xóa môn học này không? Toàn bộ ngân hàng câu hỏi của môn này sẽ bị xóa khỏi máy.",
      icon: "🗑️",
      confirmText: "Xóa vĩnh viễn",
      isDanger: true,
      warningKey: "delete_subject",
      onConfirm: () => {
        StorageService.deleteSubject(subjectId);
        this.renderManageView(document.getElementById("mainContent"));
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 9. GUIDE VIEW (HƯỚNG DẪN SỬ DỤNG CHI TIẾT)
  // ═════════════════════════════════════════════════════════════════════════
  renderGuideView(container) {
    container.innerHTML = `
      <div class="view-guide">
        <!-- Hero Header -->
        <div class="guide-hero">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span class="badge badge-blue" style="font-size: 13px;">DThu QuizMaster</span>
            <span class="badge badge-gray">Phiên bản 1.0</span>
          </div>
          <h2 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
            Hướng Dẫn Sử Dụng
          </h2>
          <p style="font-size: 14.5px; color: var(--text-secondary);">
            Hướng dẫn đầy đủ về cách tạo đề, thi thử, phân tích câu hỏi tự động và cách chia sẻ ngân hàng đề thi cho bạn bè.
          </p>
        </div>

        <!-- Section 1: Quy trình sử dụng -->
        <div class="guide-section">
          <h3>🚀 1. Các chế độ học tập & thi trắc nghiệm</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">1</div>
            <div>
              <strong>Chế độ Ôn tập (Luyện tập có giải thích tức thì):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Phù hợp khi bạn mới bắt đầu học lý thuyết. Bấm chọn vào bất kỳ đáp án nào, hệ thống sẽ <strong>hiển thị ngay màu xanh (Đúng) / đỏ (Sai)</strong> cùng lời giải thích chi tiết cho từng phương án A, B, C, D để bạn ghi nhớ kiến thức.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">2</div>
            <div>
              <strong>Chế độ Thi thử (Đếm ngược thời gian như thi thật):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Phù hợp khi bạn chuẩn bị thi kết thúc học phần. Hệ thống sẽ kích hoạt <strong>đồng hồ đếm ngược</strong> (1 phút/câu), ẩn toàn bộ đáp án. Chỉ khi bạn bấm <strong>"Nộp bài thi"</strong> hoặc hết giờ thì hệ thống mới chấm điểm hệ 10, xếp loại và cho phép xem lại toàn bộ bài làm.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">3</div>
            <div>
              <strong>Ngân hàng câu làm sai (Mistake Vault):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Mỗi khi bạn làm sai một câu trong lúc thi thử, hệ thống sẽ <strong>tự động lưu câu đó vào mục "🎯 Câu làm sai"</strong>. Trước ngày thi thật, bạn chỉ cần vào đây để luyện lại đúng các câu mình hay nhầm lẫn.
              </p>
            </div>
          </div>
        </div>

        <!-- Section 2: Hướng dẫn Soạn đề (Smart Parser) -->
        <div class="guide-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <h3 style="margin: 0;">📝 2. Định dạng văn bản cho "Nhập đề (Parser)"</h3>
            <button class="btn btn-sm btn-primary" onclick="App.navigateTo('syntax-guide', { from: 'guide' })">
              💡 Cú pháp ký tự ➔
            </button>
          </div>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
            Trình nhập đề thông minh hỗ trợ chuyển đổi trực tiếp văn bản từ Word, PDF hoặc ChatGPT thành ngân hàng câu hỏi trên web. Bạn có thể soạn theo 1 trong các định dạng sau:
          </p>

          <!-- Format 1 -->
          <div style="margin-bottom: 18px;">
            <strong style="color: var(--brand-text);">🔹 Mẫu 1: Dạng chuẩn (Có "Đáp án:" và "Giải thích:" ở cuối câu)</strong>
            <div class="guide-code-box">Câu 1: Hai phát kiến vĩ đại của C. Mác và Ph. Ăng-ghen là gì?
A. Chủ nghĩa duy vật biện chứng và Học thuyết giá trị thặng dư
B. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư
C. Phép biện chứng duy vật và Học thuyết đấu tranh giai cấp
D. Học thuyết nhà nước và Học thuyết cách mạng vô sản
Đáp án: B
Giải thích: Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư là hai phát kiến vĩ đại...</div>
          </div>

          <!-- Format 2 -->
          <div style="margin-bottom: 18px;">
            <strong style="color: var(--brand-text);">🔹 Mẫu 2: Dạng ChatGPT / Markdown (Có giải thích chi tiết cho từng phương án)</strong>
            <div class="guide-code-box">Câu 2: Theo nghĩa rộng, **CNXHKH** được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Bao gồm Triết học, KTCT và CNXHKH.
* B. Hệ tư tưởng của riêng giai cấp tư sản > Sai: Là của giai cấp công nhân.
* C. Một nhánh nhỏ độc lập > Sai: Là bộ phận cốt lõi.
* D. Chỉ bao gồm bộ phận KTCT > Sai: Chỉ là 1 bộ phận hợp thành.</div>
          </div>

          <!-- Format 3 -->
          <div style="margin-bottom: 18px;">
            <strong style="color: var(--brand-text);">🔹 Mẫu 3: Dạng đánh dấu hoa thị trước đáp án đúng (*A.)</strong>
            <div class="guide-code-box">Câu 3: Đâu là chức năng cơ bản của gia đình?
A. Chức năng kinh tế
*B. Chức năng tái sản xuất ra con người
C. Chức năng giáo dục
D. Chức năng tâm lý</div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="App.copySampleTemplate()">📋 Mẫu đề cơ bản</button>
            <button class="btn btn-sm" onclick="App.navigateTo('syntax-guide', { from: 'guide' })">📖 Tra cứu cú pháp ➔</button>
            <button class="btn btn-sm" onclick="App.navigateTo('parser')">Đến Nhập đề ➔</button>
          </div>
        </div>

        <!-- Section 3: Xuất nhập file & Triển khai Online -->
        <div class="guide-section">
          <h3>🌐 3. Chia sẻ đề thi & Đưa web lên mạng (GitHub Pages)</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">A</div>
            <div>
              <strong>Cách chia sẻ đề thi cho bạn bè trong lớp:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Vào <strong>"⚙️ Quản lý đề"</strong> ➔ Bấm <strong>"📥 Xuất JSON"</strong> tại môn học bạn muốn chia sẻ. Gửi file <code>.json</code> đó cho bạn bè. Người nhận chỉ cần vào trang chủ bấm <strong>"📥 Nhập file JSON"</strong> là có thể làm bài ngay lập tức!
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">B</div>
            <div>
              <strong>Cách đưa web online miễn phí bằng GitHub Pages:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                1. Tạo 1 repository trên <a href="https://github.com" target="_blank">github.com</a> (chế độ Public).<br>
                2. Tải toàn bộ các thư mục và file của dự án lên.<br>
                3. Vào mục <strong>Settings</strong> ➔ <strong>Pages</strong> ➔ Chọn nhánh <strong>main</strong> ➔ Bấm <strong>Save</strong>.<br>
                4. Nhận ngay link web dạng: <code>https://&lt;username&gt;.github.io/dthu-quizmaster/</code> để học trên điện thoại mọi lúc mọi nơi!
              </p>
            </div>
          </div>
        </div>

        <!-- Section 4: Quản lý cài đặt & Reset cảnh báo -->
        <div class="guide-section">
          <h3>⚙️ 4. Tùy chọn hệ thống & Khôi phục cảnh báo</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 14px;">
            Nếu trước đây bạn đã tích chọn <em>"Không hiển thị lại cảnh báo này trong tương lai"</em> và bây giờ muốn bật lại các hộp thoại xác nhận khi xóa hoặc rời phòng thi:
          </p>
          <button class="btn btn-sm" onclick="App.resetSuppressedWarningsAction()">
            🔄 Khôi phục lại toàn bộ hộp thoại cảnh báo
          </button>
        </div>

      </div>
    `;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 10. SYNTAX & MARKDOWN CHEATSHEET VIEW (CẨM NANG KÝ TỰ ĐẶC BIỆT)
  // ═════════════════════════════════════════════════════════════════════════
  renderSyntaxGuideView(container, data = {}) {
    const fromView = data.from || "parser";
    const subjectId = data.subjectId;

    container.innerHTML = `
      <div class="view-guide">
        <!-- Back Button & Header -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <button class="btn btn-sm" onclick="App.navigateTo('${fromView}', { subjectId: '${subjectId || ''}' })">
            ← Quay lại ${fromView === 'guide' ? 'Hướng dẫn' : 'Nhập đề'}
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary" onclick="App.copyAdvancedSyntaxTemplate()">📋 Chép mẫu nâng cao</button>
            <button class="btn btn-sm" onclick="App.navigateTo('parser', { subjectId: '${subjectId || ''}' })">🚀 Đến Nhập đề</button>
          </div>
        </div>

        <div class="guide-hero">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span class="badge badge-blue" style="font-size: 13px;">Cú pháp & Ký tự</span>
            <span class="badge badge-green">Hỗ trợ 100%</span>
          </div>
          <h2 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
            Cú Pháp & Ký Tự Đặc Biệt
          </h2>
          <p style="font-size: 14.5px; color: var(--text-secondary);">
            Hệ thống Smart Parser tự động nhận diện và hiển thị đẹp mắt tất cả các định dạng in đậm, in nghiêng, khối code, công thức toán học, ký hiệu hóa học, so sánh logic và trích dẫn.
          </p>
        </div>

        <!-- 1. Bảng Tra cứu Cú pháp Markdown -->
        <div class="guide-section">
          <h3>✨ 1. Định dạng chữ (Markdown)</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 12px;">
            Bạn có thể dùng các ký hiệu sau ở cả <strong>Nội dung câu hỏi</strong>, <strong>Lựa chọn A/B/C/D</strong> và <strong>Lời giải thích</strong>:
          </p>

          <table class="syntax-table">
            <thead>
              <tr>
                <th style="width: 28%;">Bạn nhập vào (Cú pháp)</th>
                <th style="width: 32%;">Kết quả hiển thị</th>
                <th>Ý nghĩa & Ứng dụng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="syntax-code">**Chủ nghĩa Mác**</span></td>
                <td><strong>Chủ nghĩa Mác</strong></td>
                <td>In đậm từ khóa quan trọng, thuật ngữ cốt lõi</td>
              </tr>
              <tr>
                <td><span class="syntax-code">*kinh tế chính trị*</span></td>
                <td><em>kinh tế chính trị</em></td>
                <td>In nghiêng tên tác phẩm, tên tiếng Latin, khái niệm</td>
              </tr>
              <tr>
                <td><span class="syntax-code">\`P * Q = M * V\`</span></td>
                <td><code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace;">P * Q = M * V</code></td>
                <td>Khối mã lệnh, công thức toán học, biểu thức kinh tế</td>
              </tr>
              <tr>
                <td><span class="syntax-code">\`H2O + CO2\`</span></td>
                <td><code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace;">H2O + CO2</code></td>
                <td>Công thức hóa học, gen, protein trong Sinh học</td>
              </tr>
              <tr>
                <td><span class="syntax-code">&gt; Đúng: Lời giải...</span></td>
                <td><span class="badge badge-green">✓ Đúng: Lời giải...</span></td>
                <td>Khai báo giải thích chi tiết cho từng phương án</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. Bảng Tra cứu Toán học & Ký tự đặc biệt -->
        <div class="guide-section">
          <h3>🔢 2. Toán học & Ký tự đặc biệt</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 12px;">
            Tất cả các ký tự bên dưới được bảo toàn nguyên vẹn, không bị lỗi nuốt ký tự hay lỗi HTML:
          </p>

          <table class="syntax-table">
            <thead>
              <tr>
                <th style="width: 28%;">Ký hiệu & Biểu thức</th>
                <th style="width: 32%;">Kết quả hiển thị</th>
                <th>Ghi chú & Khả năng xử lý</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="syntax-code">a &lt; b &amp; c &gt; d</span></td>
                <td>a &lt; b &amp; c &gt; d</td>
                <td>So sánh toán học và logic (không bị lỗi thẻ HTML)</td>
              </tr>
              <tr>
                <td><span class="syntax-code">x &gt;= y, a != b</span></td>
                <td>x &gt;= y, a != b</td>
                <td>Toán tử lớn hơn hoặc bằng, khác nhau</td>
              </tr>
              <tr>
                <td><span class="syntax-code">$100, 100%, 37°C</span></td>
                <td>$100, 100%, 37°C</td>
                <td>Ký hiệu tiền tệ, phần trăm, nhiệt độ</td>
              </tr>
              <tr>
                <td><span class="syntax-code">"Tư bản", 'Giá trị'</span></td>
                <td>"Tư bản", 'Giá trị'</td>
                <td>Dấu ngoặc kép, ngoặc đơn trích dẫn nguyên văn</td>
              </tr>
              <tr>
                <td><span class="syntax-code">@author, #CNXHKH</span></td>
                <td>@author, #CNXHKH</td>
                <td>Ký hiệu tag, hashtag và tác giả</td>
              </tr>
              <tr>
                <td><span class="syntax-code">C. Mác, V.I. Lênin</span></td>
                <td>C. Mác, V.I. Lênin</td>
                <td>Tên riêng có dấu chấm (không bị nhầm là lựa chọn C.)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. Bộ câu hỏi mẫu hoàn chỉnh -->
        <div class="guide-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0;">📋 3. Bộ câu hỏi mẫu nâng cao</h3>
            <button class="btn btn-sm btn-primary" onclick="App.copyAdvancedSyntaxTemplate()">📋 Sao chép bộ này</button>
          </div>
          <div class="guide-code-box">Câu 1: Theo nghĩa rộng, **Chủ nghĩa xã hội khoa học** (CNXHKH) được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Bao gồm Triết học, KTCT và CNXHKH.
* B. Hệ tư tưởng của riêng giai cấp "tư sản" > Sai: Là của giai cấp công nhân.
* C. Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác > Sai: Là bộ phận cốt lõi.
* D. Chỉ bao gồm bộ phận KTCT > Sai: Chỉ là 1 bộ phận hợp thành.

Câu 2: Cho biểu thức kinh tế \`P * Q = M * V\` và điều kiện \`a < b & c > d\`. Nhận định nào sau đây là chuẩn xác?
A. Giá trị tỷ lệ $100% với hashtag #kinh_te
* B. Biểu thức \`P * Q = M * V\` thỏa mãn điều kiện (a < b & c > d) > Đúng: Hệ thống hỗ trợ 100% công thức code & so sánh!
C. Ký hiệu @author: Bùi Văn Khang (Sinh viên CNSH - ĐH Đồng Tháp)
D. Trích dẫn nguyên văn: "Quy luật giá trị thặng dư là quy luật tuyệt đối"

Câu 3: Hai phát kiến vĩ đại của *C. Mác* và *Ph. Ăng-ghen* tạo tiền đề lý luận cho sự ra đời của CNXHKH là gì?
A. Chủ nghĩa duy vật biện chứng và Học thuyết giá trị thặng dư
B. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư
C. Phép biện chứng duy vật và Học thuyết đấu tranh giai cấp
D. Học thuyết nhà nước và Học thuyết cách mạng vô sản
Đáp án: B
Giải thích: Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư là hai phát kiến vĩ đại của C. Mác và Ph. Ăng-ghen.</div>

          <div style="margin-top: 18px; display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn btn-primary" onclick="App.navigateTo('parser', { subjectId: '${subjectId || ''}' })">
              🚀 Đến Nhập đề ngay ➔
            </button>
          </div>
        </div>

      </div>
    `;
  },

  copyAdvancedSyntaxTemplate() {
    const sample = `Câu 1: Theo nghĩa rộng, **Chủ nghĩa xã hội khoa học** (CNXHKH) được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Bao gồm Triết học, KTCT và CNXHKH.
* B. Hệ tư tưởng của riêng giai cấp "tư sản" > Sai: Là của giai cấp công nhân.
* C. Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác > Sai: Là bộ phận cốt lõi.
* D. Chỉ bao gồm bộ phận KTCT > Sai: Chỉ là 1 bộ phận hợp thành.

Câu 2: Cho biểu thức kinh tế \`P * Q = M * V\` và điều kiện \`a < b & c > d\`. Nhận định nào sau đây là chuẩn xác?
A. Giá trị tỷ lệ $100% với hashtag #kinh_te
* B. Biểu thức \`P * Q = M * V\` thỏa mãn điều kiện (a < b & c > d) > Đúng: Hệ thống hỗ trợ 100% công thức code & so sánh!
C. Ký hiệu @author: Bùi Văn Khang (Sinh viên CNSH - ĐH Đồng Tháp)
D. Trích dẫn nguyên văn: "Quy luật giá trị thặng dư là quy luật tuyệt đối"

Câu 3: Hai phát kiến vĩ đại của *C. Mác* và *Ph. Ăng-ghen* tạo tiền đề lý luận cho sự ra đời của CNXHKH là gì?
A. Chủ nghĩa duy vật biện chứng và Học thuyết giá trị thặng dư
B. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư
C. Phép biện chứng duy vật và Học thuyết đấu tranh giai cấp
D. Học thuyết nhà nước và Học thuyết cách mạng vô sản
Đáp án: B
Giải thích: Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư là hai phát kiến vĩ đại của C. Mác và Ph. Ăng-ghen.`;

    navigator.clipboard.writeText(sample).then(() => {
      alert("📋 Đã sao chép bộ câu hỏi mẫu nâng cao vào Clipboard! Bạn có thể vào trang Nhập đề bấm Ctrl+V để dán thử nghiệm.");
    });
  },

  copySampleTemplate() {
    const sample = `Câu 1: Nội dung câu hỏi số 1 ở đây?
A. Phương án A
B. Phương án B
C. Phương án C
D. Phương án D
Đáp án: A
Giải thích: Lời giải thích chi tiết tại sao A đúng...

Câu 2: Nội dung câu hỏi số 2 ở đây?
* A. Lựa chọn A > Đúng: Giải thích A
* B. Lựa chọn B > Sai: Giải thích B
* C. Lựa chọn C > Sai: Giải thích C
* D. Lựa chọn D > Sai: Giải thích D`;

    navigator.clipboard.writeText(sample).then(() => {
      alert("📋 Đã sao chép mẫu cấu trúc đề thi vào Clipboard! Bạn có thể dán vào Word hoặc gửi cho ChatGPT để soạn câu hỏi.");
    });
  },

  resetSuppressedWarningsAction() {
    StorageService.resetSuppressedWarnings();
    alert("✅ Đã khôi phục lại toàn bộ hộp thoại cảnh báo thành công!");
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MODALS (TẠO MÔN HỌC MỚI)
  // ═════════════════════════════════════════════════════════════════════════
  openCreateSubjectModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "Thêm Môn Học Mới";

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên môn học (*):</label>
        <input type="text" id="newSubName" class="form-control" placeholder="Ví dụ: Tư tưởng Hồ Chí Minh, Di truyền học...">
      </div>
      <div class="form-group">
        <label class="form-label">Mã môn học (*):</label>
        <input type="text" id="newSubCode" class="form-control" placeholder="Ví dụ: POL103, BIO301...">
      </div>
      <div class="form-group">
        <label class="form-label">Khoa / Ngành:</label>
        <input type="text" id="newSubDept" class="form-control" placeholder="Ví dụ: Khoa Nông nghiệp - Sinh học">
      </div>
      <div class="form-group">
        <label class="form-label">Người biên soạn / Sinh viên đóng góp:</label>
        <input type="text" id="newSubAuthor" class="form-control" placeholder="Bùi Văn Khang - CNSH DThu">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả môn học:</label>
        <textarea id="newSubDesc" class="form-control" rows="2" placeholder="Ghi chú thêm về đề cương môn học..."></textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveNewSubject()">Lưu môn học</button>
    `;

    modal.classList.add("active");
  },

  saveNewSubject() {
    const name = document.getElementById("newSubName")?.value.trim();
    const code = document.getElementById("newSubCode")?.value.trim().toUpperCase();
    const dept = document.getElementById("newSubDept")?.value.trim() || "Đại học Đồng Tháp";
    const author = document.getElementById("newSubAuthor")?.value.trim() || "Sinh viên DThu";
    const desc = document.getElementById("newSubDesc")?.value.trim() || "";

    if (!name || !code) {
      alert("Vui lòng nhập đầy đủ Tên môn học và Mã môn học!");
      return;
    }

    const newSub = {
      id: "SUB_" + Date.now(),
      code,
      name,
      department: dept,
      author,
      description: desc,
      chapters: [
        { id: "c1", name: "Chương 1: Mở đầu" }
      ],
      questions: []
    };

    StorageService.saveSubject(newSub);
    this.closeModal();
    this.navigateTo("subject-detail", { subjectId: newSub.id });
  },

  triggerImportFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        ImportExportService.importFromFile(file, (success, msg) => {
          alert(msg);
          if (success) App.navigateTo("home");
        });
      }
    };
    input.click();
  },

  closeModal() {
    document.getElementById("globalModal")?.classList.remove("active");
  },

  bindGlobalEvents() {
    // Đóng modal khi bấm vào nền xám
    document.getElementById("globalModal")?.addEventListener("click", (e) => {
      if (e.target.id === "globalModal") this.closeModal();
    });
  }
};

// Khởi chạy ứng dụng khi DOM tải xong
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
