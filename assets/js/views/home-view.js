/**
 * HOME VIEW MODULE
 * Trang chủ: Hub môn học, thẻ môn học (Subject Cards), tìm kiếm & lọc theo khoa.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  switchHubTab(tab) {
    if (tab === "drafts" && !StorageService.isLoggedIn()) {
      this.showToast("🔒 Vui lòng đăng nhập để tham gia làm các bộ đề thử nghiệm do cộng đồng sinh viên đóng góp!", "warning", 3500);
      this.openAccountSwitcherModal();
      return;
    }
    this.currentHubTab = tab;
    const mainContainer = document.getElementById("mainContent");
    this.renderHomeView(mainContainer);
  },

  renderHomeView(container) {
    const officialSubjects = StorageService.getSubjects();
    const draftSubjects = StorageService.getDraftSubjects();
    const isLogged = StorageService.isLoggedIn();
    const activeList = this.currentHubTab === "official" ? officialSubjects : draftSubjects;

    const traffic = (typeof StorageService !== "undefined" && typeof StorageService.getTrafficStats === "function") 
      ? StorageService.getTrafficStats() 
      : { onlineNow: 42, totalVisitsFormatted: "28.650", totalAttemptsFormatted: "4.280" };

    container.innerHTML = `
      <div class="view-home">
        <!-- Hero Section Tinh Gọn -->
        <div class="home-hero">
          <div class="home-hero-text">
            <h2>Nền tảng Ôn tập & Thi thử Trắc nghiệm Đại học</h2>
            <p>Hệ thống tự học, ngân hàng đề thi đa môn, thi thử tính giờ và lưu trữ tiến độ học tập thông minh.</p>
          </div>
          <div class="home-hero-actions">
            <button class="btn btn-primary" onclick="App.navigateTo('parser')" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.get('upload', 16)} <span>Đóng góp đề mới</span>
            </button>
            <button class="btn" onclick="App.navigateTo('materials')" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.get('bookOpen', 16)} <span>Đọc tài liệu (.txt)</span>
            </button>
          </div>
        </div>

        <!-- Hub Tabs: Chính thức vs Đề Cộng đồng (Drafts) -->
        <div class="hub-tabs">
          <button class="hub-tab-btn ${this.currentHubTab === 'official' ? 'active' : ''}" onclick="App.switchHubTab('official')" style="display: inline-flex; align-items: center; gap: 6px;">
            <span style="color:#10b981; display:flex; align-items:center;">${Icons.get('shieldCheck', 16)}</span> <span>Ngân hàng Chính thức</span> <span class="badge-tab-count">${officialSubjects.length}</span>
          </button>
          <button class="hub-tab-btn ${this.currentHubTab === 'drafts' ? 'active' : ''}" onclick="App.switchHubTab('drafts')" style="display: inline-flex; align-items: center; gap: 6px;">
            ${isLogged ? `<span style="color:#f59e0b; display:flex; align-items:center;">${Icons.get('users', 16)}</span> <span>Đề Cộng đồng (Thử nghiệm)</span> <span class="badge-tab-count">${draftSubjects.length}</span>` : `<span style="color:#94a3b8; display:flex; align-items:center;">${Icons.get('lock', 16)}</span> <span>Đề Cộng đồng</span> <span class="badge-tab-count">${draftSubjects.length}</span>`}
          </button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="search-filter-bar">
          <div class="search-input-wrapper">
            <span class="search-icon" style="display:flex; align-items:center; color:var(--text-tertiary);">${Icons.get('search', 16)}</span>
            <input type="text" id="searchInput" class="form-control" placeholder="Tìm kiếm theo tên môn, mã môn..." oninput="App.onSearchSubjects()">
          </div>
          <select id="deptFilter" class="form-control" style="width: auto; min-width: 200px;" onchange="App.onSearchSubjects()">
            <option value="all">Tất cả khoa / ngành</option>
            ${this.getUniqueDepts(activeList).map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>

        <!-- Subjects Grid -->
        <div class="subjects-grid" id="subjectsGrid">
          ${this.renderSubjectCards(activeList, this.currentHubTab === 'drafts')}
        </div>

        <!-- Khối Điểm Nhấn Sứ Mệnh Học Tập & Tiếp Nhận Góp Ý -->
        <section class="home-creator-section">
          <div class="creator-card-container">
            <div class="home-mission-banner">
              <div class="home-mission-content">
                <span class="creator-pill-tag" style="display: inline-flex; align-items: center; gap: 4px;">${Icons.get('sparkles', 13)} Sứ Mệnh Học Thuật & Tự Học</span>
                <h3 class="mission-title">Hệ Thống Ôn Thi Trực Quan · Tự Học Mọi Lúc Mọi Nơi</h3>
                <p class="mission-desc">
                  DThu QuizMaster được xây dựng phi lợi nhuận với mục tiêu chuẩn hóa ngân hàng đề thi trắc nghiệm học phần, hỗ trợ giải thích chi tiết từng câu hỏi, đồng bộ tiến độ thời gian thực và tạo môi trường thi thử nghiêm túc, công bằng.
                </p>
                <div class="mission-pills-row">
                  <span class="mission-pill" id="heroLiveTrafficPill" style="display:inline-flex; align-items:center; gap:5px;">${Icons.get('users', 14)} <span><strong>${traffic.onlineNow}</strong> sinh viên online</span></span>
                  <span class="mission-pill" style="display:inline-flex; align-items:center; gap:5px;">${Icons.get('target', 14)} <span><strong>${traffic.totalVisitsFormatted}</strong> lượt xem</span></span>
                  <span class="mission-pill" style="display:inline-flex; align-items:center; gap:5px;">${Icons.get('fileText', 14)} <span><strong>${traffic.totalAttemptsFormatted}</strong> lượt thi thử</span></span>
                  <span class="mission-pill" style="display:inline-flex; align-items:center; gap:5px;">${Icons.get('zap', 14)} <span>Offline PWA</span></span>
                  <span class="mission-pill" style="display:inline-flex; align-items:center; gap:5px;">${Icons.get('database', 14)} <span>Supabase Cloud</span></span>
                  <span class="mission-pill" style="display:inline-flex; align-items:center; gap:5px;">${Icons.get('shieldCheck', 14)} <span>Đề thi chuẩn hóa</span></span>
                </div>
              </div>
              <div class="home-mission-action">
                <button class="btn btn-primary btn-lg" onclick="App.openContactModal()" style="white-space: nowrap; padding: 14px 22px; font-weight: 800; font-size: 13.5px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25); display: inline-flex; align-items: center; gap: 8px;">
                  ${Icons.get('contact', 16)}
                  <span>Gửi Góp Ý / Báo Lỗi Đề Thi</span>
                  ${Icons.get('arrowRight', 14)}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  getUniqueDepts(subjects) {
    return [...new Set(subjects.map(s => s.department || "Khác"))];
  },

  renderSubjectCards(subjects, isDraft = false) {
    if (subjects.length === 0) {
      return `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-tertiary);">
          ${isDraft ? 'Chưa có bộ đề đóng góp nào đang chờ duyệt. Hãy là người đầu tiên đóng góp!' : 'Không tìm thấy môn học nào phù hợp.'}
        </div>
      `;
    }

    return subjects.map(sub => {
      const qCount = sub.questions ? sub.questions.length : 0;
      const cCount = sub.chapters ? sub.chapters.length : 0;
      const latest = StorageService.getLatestScoreForSubject(sub.id);

      return `
        <div class="subject-card" style="${isDraft ? 'border-top: 3px solid #f59e0b;' : ''}">
          <div class="subject-card-top">
            <span class="subject-code-badge">${sub.code || sub.id}</span>
            ${isDraft ? `<span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700; display:inline-flex; align-items:center; gap:3px;">${Icons.get('sparkles', 11)} Thử nghiệm</span>` : `<span class="badge badge-gray">${cCount} chương</span>`}
          </div>
          <h3>${sub.name}</h3>
          <div class="subject-card-dept" style="display:flex; align-items:center; gap:4px;">${Icons.get('home', 12)} <span>${sub.department || 'Đại học Đồng Tháp'}</span></div>

          <div class="subject-meta-stats">
            <span>Tổng câu: <strong>${qCount}</strong></span>
            <span>Tác giả: <strong>${sub.author ? sub.author.split('-')[0] : 'Admin'}</strong></span>
          </div>

          <div class="subject-card-footer">
            <div class="last-score-text">
              ${latest ? `Lần thi gần nhất: <strong>${latest.score10}/10</strong>` : `Chưa làm bài thi nào`}
            </div>
            <button class="btn btn-primary btn-sm" onclick="App.openQuizConfigModal('${sub.id}')" style="display:inline-flex; align-items:center; gap:5px;">
              <span>Vào Ôn Thi</span> ${Icons.get('arrowRight', 13)}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  onSearchSubjects() {
    const query = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
    const dept = document.getElementById("deptFilter")?.value || "all";

    const all = this.currentHubTab === "official" ? StorageService.getSubjects() : StorageService.getDraftSubjects();
    const filtered = all.filter(s => {
      const matchQuery = s.name.toLowerCase().includes(query) || (s.code && s.code.toLowerCase().includes(query));
      const matchDept = dept === "all" || s.department === dept;
      return matchQuery && matchDept;
    });

    const grid = document.getElementById("subjectsGrid");
    if (grid) grid.innerHTML = this.renderSubjectCards(filtered, this.currentHubTab === "drafts");
  }
});
