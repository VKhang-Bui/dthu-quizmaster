/**
 * HEADER & USER DRAWER MODULE
 * Render Header động, Drawer đa tầng (Menu chính, Cài đặt, Hồ sơ, Sao lưu...).
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  renderHeader() {
    const headerEl = document.getElementById("appHeader");
    if (!headerEl) return;

    // ── CHẾ ĐỘ TẬP TRUNG LÀM BÀI (ZEN FOCUS EXAM HEADER) ───────────────────
    if (this.currentView === "quiz") {
      const subjectName = this.activeSession ? this.activeSession.subjectName : "Phòng Làm Bài";
      const modeLabel = this.activeSession && this.activeSession.mode === "exam" ? "Thi Thử Tính Giờ" : "Ôn Tập Có Lời Giải";

      headerEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="color: var(--brand-primary);">${Icons.get('lock', 22)}</div>
            <div>
              <div style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); line-height: 1.2;">
                ${subjectName}
              </div>
              <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 1px;">
                Chế độ tập trung (${modeLabel}) · Tránh phân tâm & không thoát nhầm
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-sm btn-danger" onclick="App.confirmExitQuiz()" style="font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.get('logOut', 14)} <span>Rời phòng làm bài</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    const isLogged = StorageService.isLoggedIn();
    const profile = StorageService.getUserProfile();
    const unreadNotifs = isLogged ? StorageService.getUnreadNotificationCount(profile.id) : 0;

    let roleBadge = `<span class="user-role-badge" style="font-size: 10px; padding: 1px 6px; background:#f1f5f9; color:#64748b;">Khách</span>`;
    if (isLogged) {
      if (profile.role === "admin") roleBadge = `<span class="user-role-badge admin" style="font-size: 10px; padding: 1px 6px; display: inline-flex; align-items: center; gap: 3px;">${Icons.get('crown', 11)} Admin</span>`;
      else if (profile.role === "editor") roleBadge = `<span class="user-role-badge editor" style="font-size: 10px; padding: 1px 6px; background:#eff6ff; color:#1e40af; display: inline-flex; align-items: center; gap: 3px;">${Icons.get('shieldCheck', 11)} Editor</span>`;
      else roleBadge = `<span class="user-role-badge student" style="font-size: 10px; padding: 1px 6px; display: inline-flex; align-items: center; gap: 3px;">${Icons.get('student', 11)} SV</span>`;
    }

    headerEl.innerHTML = `
      <div class="header-brand" onclick="App.navigateTo('home')" title="Nhấp để quay về Trang Chủ">
        <div class="brand-icon">${Icons.get('logo', 22, '', '#ffffff')}</div>
        <div class="brand-title-group">
          <h1>Shinora QuizMaster</h1>
          <div class="brand-author">Phát triển bởi Shina Sanora</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        ${isLogged ? `
          <button class="notif-bell-btn" onclick="App.navigateTo('notifications')" title="Trung tâm thông báo & Biến động điểm" style="display: inline-flex; align-items: center; justify-content: center;">
            ${Icons.get('bell', 18)}
            ${unreadNotifs > 0 ? `<span class="notif-badge">${unreadNotifs > 99 ? '99+' : unreadNotifs}</span>` : ''}
          </button>
        ` : ''}

        <!-- Khối Người Dùng (Bấm vào để mở Thanh trượt bên phải) -->
        <div class="header-user-widget" onclick="App.openUserDrawer('main')" title="${isLogged ? 'Xem menu cá nhân & tiện ích' : 'Nhấp để đăng nhập'}">
          <div style="display: flex; align-items: center;">${Icons.renderAvatar(isLogged ? (profile.avatar || 'avatar-student') : 'guest', 28, isLogged ? profile.role : 'guest')}</div>
          <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="font-size: 13px; font-weight: 700; color: var(--text-primary); line-height: 1.2;">
              ${isLogged ? profile.fullName : 'Khách (Chưa đăng nhập)'}
            </span>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
              ${isLogged ? `
                <span class="user-exp-chip" style="font-size: 11px; padding: 1px 6px; display: inline-flex; align-items: center; gap: 3px;" title="Điểm EXP Học Tập Mùa Này">${Icons.get('zap', 11)} ${typeof profile.seasonExp === 'number' ? profile.seasonExp : (profile.totalExp || 0)} EXP</span>
                <span class="user-exp-chip" style="font-size: 11px; padding: 1px 6px; background:#fef3c7; color:#b45309; border-color:#fde68a; display: inline-flex; align-items: center; gap: 3px;" title="Điểm Cống Hiến Dữ Liệu Mùa Này">${Icons.get('star', 11)} ${typeof profile.seasonCp === 'number' ? profile.seasonCp : (profile.contributionPoints || 0)} CP</span>
              ` : ''}
              ${roleBadge}
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text-tertiary); margin-left: 2px; display: flex; align-items: center;">${Icons.get('chevronRight', 12)}</div>
        </div>
      </div>
    `;

    if (typeof this.updateFloatingDocksVisibility === "function") {
      this.updateFloatingDocksVisibility();
    }
  },

  openUserDrawer(level = "main") {
    const drawer = document.getElementById("userDrawer");
    const overlay = document.getElementById("userDrawerOverlay");
    if (!drawer || !overlay) return;

    this.renderDrawerLevel(level);
    drawer.classList.add("active");
    overlay.classList.add("active");
  },

  closeUserDrawer() {
    document.getElementById("userDrawer")?.classList.remove("active");
    document.getElementById("userDrawerOverlay")?.classList.remove("active");
  },

  logoutUser() {
    StorageService.logout();
    this.closeUserDrawer();
    this.closeModal();
    this.renderHeader();
    if (typeof this.updateFloatingDocksVisibility === "function") {
      this.updateFloatingDocksVisibility();
    }
    this.showToast("👋 Đã đăng xuất về chế độ Khách!", "info", 2500);
    this.navigateTo("home", {}, true);
  },

  renderDrawerLevel(level) {
    const drawer = document.getElementById("userDrawer");
    if (!drawer) return;

    const isLogged = StorageService.isLoggedIn();
    const profile = StorageService.getUserProfile();
    const examHistory = StorageService.getUserExamHistory();
    const drafts = StorageService.getDraftSubjects();
    const history = StorageService.getHistory();
    const settings = StorageService.getAppSettings();
    const unreadNotifs = isLogged ? StorageService.getUnreadNotificationCount(profile.id) : 0;

    let headerHtml = "";
    let bodyHtml = "";
    let footerHtml = "";

    switch (level) {
      // ── CẤP 0: MENU CHÍNH CỦA NGƯỜI DÙNG ─────────────────────────────────
      case "main":
        headerHtml = `
          <div class="drawer-header-left">
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('user', 18, '', 'var(--brand-primary)')} <span>Trung Tâm Người Dùng</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        if (!isLogged) {
          // ── GIAO DIỆN KHÁCH: KHÔNG HIỆN GÌ, CHỈ HIỆN 1 KHỐI NÚT ĐĂNG NHẬP Ở CHÍNH GIỮA ──
          bodyHtml = `
            <div class="drawer-slide-content" style="text-align: center; padding: 48px 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <div style="color: var(--text-tertiary); margin-bottom: 14px;">${Icons.get('lock', 52)}</div>
              <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">Chế Độ Khách</h3>
              <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 24px 0; max-width: 290px;">
                Bạn đang duyệt web ở chế độ Khách. Vui lòng đăng nhập tài khoản để mở khóa toàn bộ tính năng: Ôn tập có đáp án & giải thích, Kho tài liệu (.txt), Ngân hàng câu sai, Tích lũy EXP và Đóng góp đề thi.
              </p>
              <button class="btn btn-primary" style="width: 100%; max-width: 290px; padding: 13px; font-size: 14px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 8px;" onclick="App.closeUserDrawer(); App.openAccountSwitcherModal();">
                ${Icons.get('key', 16)} <span>Đăng Nhập / Chọn Tài Khoản</span> ${Icons.get('arrowRight', 14)}
              </button>
            </div>
          `;
          footerHtml = "";
        } else {
          // ── GIAO DIỆN THÀNH VIÊN ĐÃ ĐĂNG NHẬP: HIỆN ĐẦY ĐỦ TIỆN ÍCH & NÚT Ở CUỐI ──
          let roleBadgeText = `<span class="user-role-badge student" style="display: inline-flex; align-items: center; gap: 3px;">${Icons.get('student', 11)} SV</span>`;
          if (profile.role === "admin") roleBadgeText = `<span class="user-role-badge admin" style="display: inline-flex; align-items: center; gap: 3px;">${Icons.get('crown', 11)} Admin</span>`;
          else if (profile.role === "editor") roleBadgeText = `<span class="user-role-badge editor" style="background:#eff6ff; color:#1e40af; display: inline-flex; align-items: center; gap: 3px;">${Icons.get('shieldCheck', 11)} Editor</span>`;

          bodyHtml = `
            <div class="drawer-slide-content">
              <!-- Thẻ Hồ Sơ Sinh Viên -->
              <div class="user-hub-profile-card">
                <div style="display: flex; align-items: center; position: relative; cursor: pointer;" onclick="App.renderDrawerLevel('settings-profile')" title="Nhấp để tùy chỉnh Hồ Sơ & Avatar">
                  ${Icons.renderAvatar(profile.avatar || 'avatar-student', 44, profile.role)}
                  <div style="position: absolute; bottom: -2px; right: -2px; background: var(--surface); border: 1px solid var(--border); border-radius: 50%; padding: 2px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                    ${Icons.get('sparkles', 10, '', 'var(--brand-primary)')}
                  </div>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                    <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${profile.fullName}</h3>
                    ${roleBadgeText}
                  </div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    MSSV: <strong>${profile.studentId || 'Chưa cập nhật'}</strong>
                  </div>
                  <div style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px;">
                    ${Icons.get('contact', 12)} <code>${profile.email || (profile.studentId ? profile.studentId + '@dthu.edu.vn' : '')}</code>
                  </div>
                  <div style="display: flex; gap: 8px; margin-top: 8px; font-size: 12px; flex-wrap: wrap; align-items: center;">
                    <span style="color: #b45309; font-weight: 800; display: inline-flex; align-items: center; gap: 3px;" title="Điểm EXP Mùa Này">${Icons.get('zap', 13)} ${typeof profile.seasonExp === 'number' ? profile.seasonExp : (profile.totalExp || 0)} EXP Mùa</span>
                    <span style="color: #15803d; font-weight: 800; display: inline-flex; align-items: center; gap: 3px;" title="Điểm CP Mùa Này">${Icons.get('star', 13)} ${typeof profile.seasonCp === 'number' ? profile.seasonCp : (profile.contributionPoints || 0)} CP Mùa</span>
                    <span style="color: var(--text-tertiary); font-size: 11px; display: inline-flex; align-items: center; gap: 2px;" title="Điểm tổng tích lũy">(Tổng: ${(profile.totalExp || 0).toLocaleString()} EXP · ${(profile.contributionPoints || 0).toLocaleString()} CP)</span>
                  </div>
                </div>
              </div>

              <!-- Danh Sách Các Khối Tính Năng (1 Dòng) -->
              <div>
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.04em; margin-bottom: 8px;">
                  Tiện ích & Quản lý
                </div>
                <div class="drawer-nav-list">
                  <!-- 1. Giới thiệu dự án (Đưa lên đầu) -->
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('about');">
                    <span class="drawer-icon" style="color:#8b5cf6;">${Icons.get('info', 18)}</span>
                    <span class="drawer-label">Giới Thiệu Dự Án & Tác Giả</span>
                    <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
                  </button>

                  <!-- 2. Trung tâm thông báo -->
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('notifications');">
                    <span class="drawer-icon" style="color:#f59e0b;">${Icons.get('bell', 18)}</span>
                    <span class="drawer-label">Trung Tâm Thông Báo</span>
                    ${unreadNotifs > 0 ? `<span class="badge" style="background:#ef4444; color:#fff; font-weight:800; font-size:11px; padding:2px 7px;">${unreadNotifs} mới</span>` : `<span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>`}
                  </button>

                  <!-- 3. Bảng xếp hạng DThu -->
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('leaderboard');">
                    <span class="drawer-icon" style="color:#eab308;">${Icons.get('trophy', 18)}</span>
                    <span class="drawer-label">Bảng Xếp Hạng DThu</span>
                    <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
                  </button>

                  <!-- 4. Kho tài liệu -->
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('materials');">
                    <span class="drawer-icon" style="color:#3b82f6;">${Icons.get('bookOpen', 18)}</span>
                    <span class="drawer-label">Kho Tài Liệu (.txt)</span>
                    <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
                  </button>

                  <!-- 5. Nhập & Đóng góp đề -->
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('parser');">
                    <span class="drawer-icon" style="color:#10b981;">${Icons.get('upload', 18)}</span>
                    <span class="drawer-label">Nhập & Đóng Góp Đề</span>
                    <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
                  </button>

                  <!-- 6. Lịch sử thi -->
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('history');">
                    <span class="drawer-icon" style="color:#8b5cf6;">${Icons.get('history', 18)}</span>
                    <span class="drawer-label">Lịch Sử Thi & Nhật Ký</span>
                    ${examHistory.length > 0 ? `<span class="badge" style="background:#eff6ff; color:#1d4ed8; font-weight:700;">${examHistory.length}/10</span>` : `<span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>`}
                  </button>

                  <!-- 7. Quản lý bộ đề (Thêm hiệu ứng tím phản quang) -->
                  <button class="drawer-nav-btn" style="border: 1.5px solid rgba(99, 102, 241, 0.4); background: linear-gradient(135deg, rgba(238, 242, 255, 0.5) 0%, rgba(224, 231, 255, 0.3) 100%);" onclick="App.closeUserDrawer(); App.navigateTo('manage');">
                    <span class="drawer-icon" style="color:#6366f1;">${Icons.get('manage', 18)}</span>
                    <span class="drawer-label"><strong>Quản Lý Bộ Đề</strong></span>
                    ${(profile.role === 'admin' || StorageService.hasPermission('canApproveDrafts')) && drafts.length > 0 ? `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; border: 1px solid #fde68a;">${drafts.length} chờ duyệt</span>` : `<span class="badge" style="background:#e0e7ff; color:#4338ca; font-weight:700;">${StorageService.getSubjects().length} môn</span>`}
                  </button>

                  <!-- 8. Quản trị người dùng (Admin/Editor) -->
                  ${(profile.role === 'admin' || StorageService.hasPermission('canManageUsers')) ? `
                    <button class="drawer-nav-btn" style="border: 1.5px solid rgba(59, 130, 246, 0.4); background: #eff6ff; color: #1d4ed8;" onclick="App.closeUserDrawer(); App.navigateTo('users-management');">
                      <span class="drawer-icon" style="color:#3b82f6;">${Icons.get('users', 18)}</span>
                      <span class="drawer-label"><strong>Quản Lý Người Dùng</strong></span>
                      <span class="badge" style="background:#dbeafe; color:#1e40af; font-weight:700;">${StorageService.getActiveUsers().length}</span>
                    </button>
                  ` : ''}

                  <!-- 9. Cài đặt hệ thống -->
                  <button class="drawer-nav-btn" style="background: var(--surface-subtle); border-color: var(--brand-primary);" onclick="App.renderDrawerLevel('settings')">
                    <span class="drawer-icon" style="color:var(--brand-primary);">${Icons.get('settings', 18)}</span>
                    <span class="drawer-label"><strong>Cài Đặt Hệ Thống</strong></span>
                    <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
                  </button>

                  <!-- 10. Liên hệ & Góp ý (Đưa về cuối cùng) -->
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.openContactModal();">
                    <span class="drawer-icon" style="color:#06b6d4;">${Icons.get('contact', 18)}</span>
                    <span class="drawer-label">Liên Hệ & Góp Ý</span>
                    <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
                  </button>
                </div>
              </div>
            </div>
          `;

          footerHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <button class="btn btn-primary btn-sm" style="width: 100%; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="App.closeUserDrawer(); App.openAccountSwitcherModal();">
                ${Icons.get('key', 14)} <span>Đổi Tài Khoản</span> ${Icons.get('arrowRight', 13)}
              </button>
              <button class="btn btn-sm btn-danger" style="width: 100%; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="App.logoutUser()">
                ${Icons.get('logOut', 14)} <span>Đăng Xuất (Về Khách)</span>
              </button>
            </div>
          `;
        }
        break;

      // ── CẤP 1: MENU CÀI ĐẶT TỔNG (SETTINGS MAIN) ───────────────────────────
      case "settings":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('main')" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('chevronLeft', 14)} <span>Quay lại</span>
            </button>
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('settings', 18, '', 'var(--brand-primary)')} <span>Cài Đặt Hệ Thống</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content">
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 6px 0;">
              Tùy chỉnh giao diện, thông báo, hồ sơ cá nhân và quản lý dữ liệu ôn thi:
            </p>

            <div class="drawer-nav-list">
              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-island')">
                <span class="drawer-icon" style="color:#a855f7;">${Icons.get('island', 18)}</span>
                <span class="drawer-label">Đảo Động (Dynamic Island)</span>
                <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-theme')">
                <span class="drawer-icon" style="color:#3b82f6;">${Icons.get('palette', 18)}</span>
                <span class="drawer-label">Giao Diện & Hiển Thị</span>
                <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-alerts')">
                <span class="drawer-icon" style="color:#f59e0b;">${Icons.get('bell', 18)}</span>
                <span class="drawer-label">Thông Báo & Cảnh Báo</span>
                <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-shortcuts')">
                <span class="drawer-icon" style="color:#10b981;">${Icons.get('keyboard', 18)}</span>
                <span class="drawer-label">Quản Lý Phím Tắt Hệ Thống</span>
                <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-profile')">
                <span class="drawer-icon" style="color:#ec4899;">${Icons.get('user', 18)}</span>
                <span class="drawer-label">Thông Tin Cá Nhân & Avatar</span>
                <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-data')">
                <span class="drawer-icon" style="color:#6366f1;">${Icons.get('database', 18)}</span>
                <span class="drawer-label">Sao Lưu & Dữ Liệu</span>
                <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.openAppsScriptConfigModal();">
                <span class="drawer-icon" style="color:#0284c7;">${Icons.get('mail', 18)}</span>
                <span class="drawer-label">Cấu Hình Email Gateway (Google Apps Script)</span>
                <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-about')">
                <span class="drawer-icon" style="color:#06b6d4;">${Icons.get('info', 18)}</span>
                <span class="drawer-label">Thông Tin Ứng Dụng</span>
                <span class="drawer-arrow">${Icons.get('chevronRight', 13)}</span>
              </button>
            </div>
          </div>
        `;
        break;

      // ── CẤP 2: GIAO DIỆN & HIỂN THỊ (THEME / DARK MODE) ───────────────────
      case "settings-theme":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('chevronLeft', 14)} <span>Cài đặt</span>
            </button>
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('palette', 18, '', 'var(--brand-primary)')} <span>Giao Diện & Hiển Thị</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content">
            <!-- 1. Chế độ màu Sáng/Tối -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('sun', 15)} <span>Chế độ hiển thị:</span>
              </label>
              <div class="theme-options-grid">
                <div class="theme-option-card ${settings.theme === 'light' ? 'active' : ''}" onclick="App.setThemeSetting('light')">
                  <div style="color: #f59e0b; margin-bottom: 4px; display: flex; justify-content: center;">${Icons.get('sun', 22)}</div>
                  <div style="font-size: 12.5px;">Sáng</div>
                </div>
                <div class="theme-option-card ${settings.theme === 'dark' ? 'active' : ''}" onclick="App.setThemeSetting('dark')">
                  <div style="color: #818cf8; margin-bottom: 4px; display: flex; justify-content: center;">${Icons.get('moon', 22)}</div>
                  <div style="font-size: 12.5px;">Tối</div>
                </div>
                <div class="theme-option-card ${settings.theme === 'auto' ? 'active' : ''}" onclick="App.setThemeSetting('auto')">
                  <div style="color: #38bdf8; margin-bottom: 4px; display: flex; justify-content: center;">${Icons.get('laptop', 22)}</div>
                  <div style="font-size: 12.5px;">Tự động</div>
                </div>
              </div>
            </div>

            <!-- 2. Màu sắc chủ đạo (Accent Color) -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('palette', 15)} <span>Màu sắc chủ đạo:</span>
              </label>
              <div class="color-dots-row">
                <button class="color-dot-btn ${settings.accentColor === 'blue' || !settings.accentColor ? 'active' : ''}" style="background: #2563eb;" title="Xanh DThu" onclick="App.setAccentSetting('blue')">✓</button>
                <button class="color-dot-btn ${settings.accentColor === 'emerald' ? 'active' : ''}" style="background: #059669;" title="Xanh Sinh Học" onclick="App.setAccentSetting('emerald')">✓</button>
                <button class="color-dot-btn ${settings.accentColor === 'purple' ? 'active' : ''}" style="background: #7c3aed;" title="Tím Hoàng Gia" onclick="App.setAccentSetting('purple')">✓</button>
                <button class="color-dot-btn ${settings.accentColor === 'amber' ? 'active' : ''}" style="background: #d97706;" title="Cam Năng Động" onclick="App.setAccentSetting('amber')">✓</button>
              </div>
            </div>

            <!-- 3. Cỡ chữ câu hỏi -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('fileText', 15)} <span>Cỡ chữ phòng thi & câu hỏi:</span>
              </label>
              <div class="theme-options-grid">
                <div class="theme-option-card ${settings.fontSize === 'normal' || !settings.fontSize ? 'active' : ''}" onclick="App.setFontSizeSetting('normal')">
                  <div style="font-size: 14px; font-weight: 700;">A</div>
                  <div style="font-size: 12px; margin-top: 2px;">Chuẩn (15px)</div>
                </div>
                <div class="theme-option-card ${settings.fontSize === 'large' ? 'active' : ''}" onclick="App.setFontSizeSetting('large')">
                  <div style="font-size: 17px; font-weight: 700;">A</div>
                  <div style="font-size: 12px; margin-top: 2px;">Lớn (16.5px)</div>
                </div>
                <div class="theme-option-card ${settings.fontSize === 'xlarge' ? 'active' : ''}" onclick="App.setFontSizeSetting('xlarge')">
                  <div style="font-size: 20px; font-weight: 700;">A</div>
                  <div style="font-size: 12px; margin-top: 2px;">Rất lớn (18px)</div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      // ── CẤP 2: THÔNG BÁO & CẢNH BÁO ──────────────────────────────────────
      case "settings-alerts":
        const suppressed = StorageService.getSuppressedWarnings();
        const known = StorageService.KNOWN_WARNINGS;

        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('chevronLeft', 14)} <span>Cài đặt</span>
            </button>
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('bell', 18, '', 'var(--brand-primary)')} <span>Thông Báo & Cảnh Báo</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        const isWarnOnLeaveQuiz = (settings.warnOnLeaveQuiz !== false);

        bodyHtml = `
          <div class="drawer-slide-content">
            <!-- Cảnh báo khi rời bài thi dở dang -->
            <div style="background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px;">
              <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin: 0;">
                <div style="padding-right: 10px;">
                  <strong style="font-size: 13.5px; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    ${Icons.get('logOut', 15, '', '#ef4444')} <span>Cảnh báo khi rời bài thi / đóng tab:</span>
                  </strong>
                  <span style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; display: block;">Cảnh báo khi chưa nộp bài mà tải lại trang (F5), đóng tab hoặc thoát</span>
                </div>
                <input type="checkbox" ${isWarnOnLeaveQuiz ? 'checked' : ''} onchange="App.toggleWarnOnLeaveQuiz(this.checked)" style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
              </label>
            </div>

            <!-- Thời gian Toast -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('clock', 15)} <span>Thời gian thông báo nổi (Toast):</span>
              </label>
              <select class="form-control" onchange="App.onToastDurationChange(this.value)">
                <option value="2500" ${settings.toastDuration === 2500 ? 'selected' : ''}>2.5 giây (Nhanh)</option>
                <option value="3500" ${settings.toastDuration === 3500 || !settings.toastDuration ? 'selected' : ''}>3.5 giây (Chuẩn)</option>
                <option value="5000" ${settings.toastDuration === 5000 ? 'selected' : ''}>5.0 giây (Chậm)</option>
              </select>
            </div>

            <!-- Quản lý Cảnh báo đã ẩn -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label class="form-label" style="font-size: 13px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 6px;">
                  ${Icons.get('shield', 15)} <span>Quản lý hộp thoại cảnh báo:</span>
                </label>
                <button class="btn btn-sm" style="font-size: 11px; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;" onclick="App.resetAllWarningsDrawer()">
                  ${Icons.get('refresh', 12)} <span>Bật tất cả</span>
                </button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${Object.keys(known).map(k => {
                  const item = known[k];
                  const isSupp = !!suppressed[k];
                  return `
                    <div style="padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                      <div style="min-width: 0;">
                        <strong style="font-size: 13px; color: var(--text-primary); display: block;">${item.title}</strong>
                        <span style="font-size: 11.5px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                          ${isSupp ? `<span style="color:#f59e0b; display:inline-flex; align-items:center; gap:3px;">${Icons.get('alertTriangle', 12)} Đã chọn ẩn (Tự đồng ý)</span>` : `<span style="color:#10b981; display:inline-flex; align-items:center; gap:3px;">${Icons.get('check', 12)} Đang bật cảnh báo</span>`}
                        </span>
                      </div>
                      <button class="btn btn-sm ${isSupp ? 'btn-primary' : ''}" style="font-size: 11.5px; padding: 3px 8px; flex-shrink: 0;" onclick="App.toggleWarningDrawerKey('${k}')">
                        ${isSupp ? 'Bật lại' : 'Tắt'}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      // ── CẤP 2: THÔNG TIN CÁ NHÂN & AVATAR ────────────────────────────────
      case "settings-profile":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('chevronLeft', 14)} <span>Cài đặt</span>
            </button>
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('user', 18, '', 'var(--brand-primary)')} <span>Hồ Sơ Cá Nhân</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        const currentAvatarId = (Icons.getAvatarById(profile.avatar) || Icons.MEMBER_AVATARS[0]).id;
        const lastUpdateStr = profile.profileUpdatedAt;
        let lastUpdateDate = lastUpdateStr ? new Date(lastUpdateStr) : null;
        let daysSinceUpdate = lastUpdateDate ? ((Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
        const isCooldownActive = (profile.role !== "admin") && (daysSinceUpdate < 14);
        const daysLeft = isCooldownActive ? Math.ceil(14 - daysSinceUpdate) : 0;

        bodyHtml = `
          <div class="drawer-slide-content">
            ${isCooldownActive ? `
              <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 12px; font-size: 12px; color: #b45309; line-height: 1.5;">
                ⏳ <strong>Giới hạn cập nhật:</strong> Bạn đã đổi thông tin vào ngày <strong>${lastUpdateDate.toLocaleDateString('vi-VN')}</strong>. Bạn có thể cập nhật lại sau <strong>${daysLeft} ngày</strong> nữa (Quy định 14 ngày/lần). <em>Bạn vẫn có thể thay đổi Avatar bất cứ lúc nào!</em>
              </div>
            ` : ''}

            <!-- Chọn 12 Avatar SVG Gradient Hiện Đại (Tự do thay đổi) -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span>Chọn Biểu Tượng Thành Viên (*):</span>
                <span style="font-size:11.5px; font-weight:700; color:#15803d; background:#dcfce7; padding:2px 6px; border-radius:10px;">Đổi tự do</span>
              </label>
              <div class="avatar-picker-grid" id="drwAvatarPicker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 210px; overflow-y: auto; padding: 2px;">
                ${(typeof Icons !== "undefined" ? Icons.MEMBER_AVATARS : []).map((av) => `
                  <button type="button" class="avatar-choice-btn ${currentAvatarId === av.id ? 'active' : ''}" onclick="App.selectAvatarDrawer('${av.id}')" title="${av.name}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; border: 1.5px solid ${currentAvatarId === av.id ? 'var(--brand-primary)' : 'var(--border)'}; background: ${currentAvatarId === av.id ? '#eff6ff' : 'var(--surface)'}; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
                    ${Icons.renderAvatar(av.id, 34, profile.role)}
                    <span style="font-size: 11px; font-weight: 700; margin-top: 4px; color: var(--text-primary); text-align: center;">${av.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Họ tên -->
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Họ và tên (*):</label>
              <input type="text" id="drwProfName" class="form-control" value="${profile.fullName || ''}" ${isCooldownActive ? 'disabled' : ''}>
            </div>

            <!-- MSSV & Lớp -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 13px; font-weight: 700;">Mã số sinh viên:</label>
                <input type="text" id="drwProfId" class="form-control" value="${profile.studentId || ''}" ${isCooldownActive ? 'disabled' : ''}>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 13px; font-weight: 700;">Lớp học:</label>
                <input type="text" id="drwProfClass" class="form-control" placeholder="VD: ĐHCNSH24A" value="${profile.className || ''}" ${isCooldownActive ? 'disabled' : ''}>
              </div>
            </div>

            <!-- Khoa / Ngành -->
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Khoa / Chuyên ngành:</label>
              <input type="text" id="drwProfDept" class="form-control" value="${profile.department || ''}" ${isCooldownActive ? 'disabled' : ''}>
            </div>

            <!-- Email & Số điện thoại -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 13px; font-weight: 700;">Email:</label>
                <input type="email" id="drwProfEmail" class="form-control" value="${profile.email || ''}" ${isCooldownActive ? 'disabled' : ''}>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 13px; font-weight: 700;">Số điện thoại:</label>
                <input type="tel" id="drwProfPhone" class="form-control" value="${profile.phone || ''}" ${isCooldownActive ? 'disabled' : ''}>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; margin-top: 6px; padding: 11px; font-size: 13.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="App.saveProfileFromDrawer()" ${isCooldownActive ? 'disabled' : ''}>
              ${Icons.get('check', 16)} <span>Lưu & Đồng Bộ Lên Cloud</span>
            </button>
          </div>
        `;
        break;

      // ── CẤP 2: SAO LƯU & DỮ LIỆU (BACKUP & RESTORE) ──────────────────────
      case "settings-data":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('chevronLeft', 14)} <span>Cài đặt</span>
            </button>
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('database', 18, '', 'var(--brand-primary)')} <span>Sao Lưu & Dữ Liệu</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content">
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
              Xuất hoặc nạp toàn bộ ngân hàng câu hỏi, điểm EXP và dữ liệu ôn thi ra file JSON để đồng bộ giữa các thiết bị:
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button class="btn btn-primary" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="App.downloadFullBackup()">
                ${Icons.get('download', 16)} <span>Tải file sao lưu toàn bộ (.json)</span>
              </button>

              <button class="btn" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="App.triggerRestoreBackupFile()">
                ${Icons.get('upload', 16)} <span>Phục hồi dữ liệu từ file backup</span>
              </button>
            </div>

            <div style="border-top: 1px dashed var(--border); padding-top: 14px; margin-top: 4px;">
              <label class="form-label" style="font-size: 13px; font-weight: 700; color: var(--danger); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('trash', 15)} <span>Dọn dẹp dữ liệu:</span>
              </label>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn btn-sm" style="color: var(--danger); text-align: left; display: inline-flex; align-items: center; gap: 6px;" onclick="App.clearExamHistoryConfirm()">
                  ${Icons.get('trash', 14)} <span>Xóa lịch sử thi (${examHistory.length} bài)</span>
                </button>
              </div>
            </div>
          </div>
        `;
        break;

      // ── CẤP 2: QUẢN LÝ PHÍM TẮT HỆ THỐNG (SHORTCUTS) ───────────────────
      case "settings-shortcuts":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('chevronLeft', 14)} <span>Cài đặt</span>
            </button>
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('keyboard', 18, '', 'var(--brand-primary)')} <span>Phím Tắt Hệ Thống</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        const isShortcutsEnabled = (settings.enableExplorerShortcuts !== false);

        bodyHtml = `
          <div class="drawer-slide-content">
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div>
                  <strong style="font-size: 13.5px; color: var(--text-primary);">Phím tắt Cây Mục Lục</strong>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                    Kích hoạt các phím tắt F2, Del, Ctrl+C/X/V khi thao tác trong cây tài liệu
                  </div>
                </div>
                <label class="toggle-switch" style="flex-shrink: 0;">
                  <input type="checkbox" ${isShortcutsEnabled ? 'checked' : ''} onchange="App.setExplorerShortcutsSetting(this.checked)">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
              ${Icons.get('keyboard', 15)} <span>Bảng Tra Cứu Phím Tắt (Hotkeys)</span>
            </h4>

            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm);">
                <span style="display: inline-flex; align-items: center; gap: 6px;">${Icons.get('edit', 14)} <span>Đổi tên thư mục / file</span></span>
                <span class="badge badge-gray" style="font-family: var(--font-mono); font-weight: 700;">F2</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm);">
                <span style="display: inline-flex; align-items: center; gap: 6px;">${Icons.get('trash', 14)} <span>Xóa thư mục / file</span></span>
                <span class="badge badge-gray" style="font-family: var(--font-mono); font-weight: 700;">Delete</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm);">
                <span style="display: inline-flex; align-items: center; gap: 6px;">${Icons.get('tools', 14)} <span>Cắt (Di chuyển)</span></span>
                <span class="badge badge-gray" style="font-family: var(--font-mono); font-weight: 700;">Ctrl + X</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm);">
                <span style="display: inline-flex; align-items: center; gap: 6px;">${Icons.get('copy', 14)} <span>Sao chép (Copy)</span></span>
                <span class="badge badge-gray" style="font-family: var(--font-mono); font-weight: 700;">Ctrl + C</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm);">
                <span style="display: inline-flex; align-items: center; gap: 6px;">${Icons.get('download', 14)} <span>Dán (Paste)</span></span>
                <span class="badge badge-gray" style="font-family: var(--font-mono); font-weight: 700;">Ctrl + V</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm);">
                <span style="display: inline-flex; align-items: center; gap: 6px;">${Icons.get('close', 14)} <span>Đóng Menu / Popup</span></span>
                <span class="badge badge-gray" style="font-family: var(--font-mono); font-weight: 700;">Esc</span>
              </div>
            </div>

            <p style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 14px; line-height: 1.5;">
              💡 <em>Lưu ý: Các phím tắt trên chỉ kích hoạt khi bạn nhấp chọn thao tác bên trong Cây Mục Lục, hoàn toàn không làm gián đoạn khi bạn bôi đen đọc văn bản hoặc gõ chữ.</em>
            </p>
          </div>
        `;
        break;

      // ── CẤP 2: CÀI ĐẶT ĐẢO ĐỘNG (DYNAMIC ISLAND) ────────────────────────
      case "settings-island":
        const di = (typeof DynamicIsland !== "undefined") ? DynamicIsland.settings : { enabled: true, colorTheme: "purple", scaleSize: "md", autoCollapseDelay: 3500, autoSkipOnError: false, mobilePosition: "bottom", enableOnExam: true };

        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('chevronLeft', 14)} <span>Cài đặt</span>
            </button>
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('island', 18, '', 'var(--brand-primary)')} <span>Cài Đặt Đảo Động</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content">
            <!-- 1. Bật / Tắt hoàn toàn -->
            <div style="background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px;">
              <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin: 0;">
                <div style="padding-right: 10px;">
                  <strong style="font-size: 13.5px; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    ${Icons.get('island', 15, '', 'var(--brand-primary)')} <span>Kích hoạt Dynamic Island:</span>
                  </strong>
                  <span style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; display: block;">Hiển thị thanh đảo động thông minh hỗ trợ phát nhạc, Pomodoro và xem tiến trình thi</span>
                </div>
                <input type="checkbox" ${di.enabled ? 'checked' : ''} onchange="App.toggleDynamicIslandFromDrawer(this.checked)" style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
              </label>
            </div>

            <!-- 2. Màu sắc phong cách -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('palette', 15)} <span>Màu sắc & Ánh sáng nhịp thở:</span>
              </label>
              <select class="form-control" onchange="App.setDynamicIslandColorFromDrawer(this.value)">
                <option value="purple" ${di.colorTheme === 'purple' || !di.colorTheme ? 'selected' : ''}>🟣 Tím Đen Huyền Bí (Mặc định)</option>
                <option value="blue" ${di.colorTheme === 'blue' ? 'selected' : ''}>🔵 Xanh Cyber Neon</option>
                <option value="green" ${di.colorTheme === 'green' ? 'selected' : ''}>🟢 Xanh Lục Bảo (Zen)</option>
                <option value="oled" ${di.colorTheme === 'oled' ? 'selected' : ''}>⚫ Đen Nhám OLED</option>
              </select>
            </div>

            <!-- 3. Kích thước đảo -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('sliders', 15)} <span>Kích thước thanh đảo:</span>
              </label>
              <select class="form-control" onchange="App.setDynamicIslandScaleFromDrawer(this.value)">
                <option value="sm" ${di.scaleSize === 'sm' ? 'selected' : ''}>Nhỏ gọn (90%)</option>
                <option value="md" ${di.scaleSize === 'md' || !di.scaleSize ? 'selected' : ''}>Tiêu chuẩn (100%)</option>
                <option value="lg" ${di.scaleSize === 'lg' ? 'selected' : ''}>Rộng rãi (110%)</option>
              </select>
            </div>

            <!-- 4. Chế độ Stealth Notch (Vạch Ẩn Tối Thượng) -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('shield', 15)} <span>Chế độ Vạch Ẩn Tối Thượng (Stealth Notch):</span>
              </label>
              <select class="form-control" onchange="App.setDynamicIslandStealthFromDrawer(this.value)">
                <option value="10000" ${di.stealthDelay === 10000 ? 'selected' : ''}>Ẩn sau 10 giây</option>
                <option value="20000" ${di.stealthDelay === 20000 ? 'selected' : ''}>Ẩn sau 20 giây</option>
                <option value="30000" ${di.stealthDelay === 30000 || !di.stealthDelay ? 'selected' : ''}>Ẩn sau 30 giây (Khuyên dùng)</option>
                <option value="60000" ${di.stealthDelay === 60000 ? 'selected' : ''}>Ẩn sau 1 phút</option>
                <option value="0" ${di.stealthDelay === 0 ? 'selected' : ''}>Tắt (Luôn giữ dạng viên thuốc)</option>
              </select>
            </div>

            <!-- 5. Thời gian tự thu nhỏ khi Hover -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('clock', 15)} <span>Thời gian tự thu nhỏ sau khi rê chuột:</span>
              </label>
              <select class="form-control" onchange="App.setDynamicIslandDelayFromDrawer(this.value)">
                <option value="1500" ${di.autoCollapseDelay === 1500 ? 'selected' : ''}>1.5 giây (Rất nhanh)</option>
                <option value="2500" ${di.autoCollapseDelay === 2500 ? 'selected' : ''}>2.5 giây (Nhanh)</option>
                <option value="3500" ${di.autoCollapseDelay === 3500 || !di.autoCollapseDelay ? 'selected' : ''}>3.5 giây (Chuẩn)</option>
                <option value="5000" ${di.autoCollapseDelay === 5000 ? 'selected' : ''}>5.0 giây (Chậm)</option>
                <option value="0" ${di.autoCollapseDelay === 0 ? 'selected' : ''}>Không bao giờ tự thu</option>
              </select>
            </div>

            <!-- 6. Tự chuyển bài khi gặp lỗi -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px;">
              <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin: 0;">
                <div style="padding-right: 10px;">
                  <strong style="font-size: 13px; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    ${Icons.get('refresh', 14)} <span>Tự chuyển bài khi gặp lỗi:</span>
                  </strong>
                  <span style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; display: block;">Tự động thử chuyển bài nếu video YouTube bị hạn chế nhúng (có giới hạn chống lặp)</span>
                </div>
                <input type="checkbox" ${di.autoSkipOnError ? 'checked' : ''} onchange="App.setDynamicIslandAutoSkipFromDrawer(this.checked)" style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
              </label>
            </div>

            <!-- 7. Vị trí trên Mobile -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('laptop', 15)} <span>Vị trí trên màn hình điện thoại:</span>
              </label>
              <select class="form-control" onchange="App.setDynamicIslandMobilePosFromDrawer(this.value)">
                <option value="bottom" ${di.mobilePosition === 'bottom' ? 'selected' : ''}>Mép Dưới Cùng (Thuận ngón cái)</option>
                <option value="top" ${di.mobilePosition === 'top' ? 'selected' : ''}>Mép Trên Cùng</option>
              </select>
            </div>

            <!-- 8. Hiển thị khi thi -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px;">
              <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin: 0;">
                <div style="padding-right: 10px;">
                  <strong style="font-size: 13px; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    ${Icons.get('timer', 14)} <span>Hiển thị khi thi trắc nghiệm:</span>
                  </strong>
                  <span style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; display: block;">Hiển thị đồng hồ đếm ngược phòng thi trực tiếp trên thanh đảo</span>
                </div>
                <input type="checkbox" ${di.enableOnExam ? 'checked' : ''} onchange="App.setDynamicIslandExamFromDrawer(this.checked)" style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
              </label>
            </div>
          </div>
        `;
        break;

      // ── CẤP 2: THÔNG TIN ỨNG DỤNG (ABOUT) ─────────────────────────────────
      case "settings-about":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('chevronLeft', 14)} <span>Cài đặt</span>
            </button>
            <h3 style="display: flex; align-items: center; gap: 8px;">${Icons.get('info', 18, '', 'var(--brand-primary)')} <span>Thông Tin Ứng Dụng</span></h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">${Icons.get('close', 16)}</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content" style="text-align: center; padding: 12px 0;">
            <div style="color: var(--brand-primary); margin-bottom: 8px; display: flex; justify-content: center;">${Icons.get('logo', 48)}</div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">Shinora QuizMaster</h3>
            <div style="font-size: 13px; color: var(--brand-text); font-weight: 700; margin-top: 2px;">Phiên bản v4.2.0 (Pure Cloudflare D1 Edition)</div>

            <div style="text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-top: 16px; font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
              <div style="display: flex; align-items: center; gap: 6px;">${Icons.get('book', 14)} <strong>Dự án:</strong> Shinora QuizMaster (Học tập & Nghiên cứu)</div>
              <div style="display: flex; align-items: center; gap: 6px;">${Icons.get('user', 14)} <strong>Tác giả:</strong> Shina Sanora · Lead Developer</div>
              <div style="display: flex; align-items: center; gap: 6px;">${Icons.get('sparkles', 14)} <strong>Đơn vị:</strong> Shinora Academic Studio</div>
              <div style="display: flex; align-items: flex-start; gap: 6px; margin-top: 4px;">
                <span style="flex-shrink: 0; margin-top: 2px;">${Icons.get('target', 14)}</span>
                <span><strong>Mục tiêu:</strong> Nền tảng ôn thi trắc nghiệm mở, lưu trữ tài liệu số và chia sẻ công cụ tự học thông minh cho sinh viên.</span>
              </div>
            </div>

            <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
              <button class="btn btn-sm" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="App.navigateTo('terms'); App.closeUserDrawer();">
                ${Icons.get('terms', 14)} <span>Xem Điều Khoản Dịch Vụ & Quy Chế</span>
              </button>
              <a href="https://github.com/VKhang-Bui/dthu-quizmaster" target="_blank" class="btn btn-sm" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                ${Icons.get('star', 14)} <span>Kho mã nguồn GitHub</span> ${Icons.get('arrowRight', 13)}
              </a>
            </div>
          </div>
        `;
        break;
    }

    const drawerHeader = document.querySelector(".drawer-header");
    const drawerBody = document.getElementById("userDrawerBody");
    const drawerFooter = document.getElementById("userDrawerFooter");

    if (drawerHeader) drawerHeader.innerHTML = headerHtml;
    if (drawerBody) drawerBody.innerHTML = bodyHtml;
    if (drawerFooter) {
      drawerFooter.innerHTML = footerHtml;
      drawerFooter.style.display = footerHtml ? "block" : "none";
    }
  },

  setThemeSetting(theme) {
    StorageService.saveAppSettings({ theme });
    this.applyThemeSettings();
    this.renderDrawerLevel("settings-theme");
    this.showToast(`Đã chuyển sang chế độ: ${theme === 'dark' ? '🌙 Tối' : theme === 'light' ? '☀️ Sáng' : '💻 Tự động'}`, "success", 2000);
  },

  setAccentSetting(color) {
    StorageService.saveAppSettings({ accentColor: color });
    this.applyThemeSettings();
    this.renderDrawerLevel("settings-theme");
    this.showToast("Đã cập nhật màu sắc chủ đạo!", "success", 2000);
  },

  setFontSizeSetting(size) {
    StorageService.saveAppSettings({ fontSize: size });
    this.applyThemeSettings();
    this.renderDrawerLevel("settings-theme");
    this.showToast("Đã cập nhật cỡ chữ câu hỏi!", "success", 2000);
  },

  resetAllWarningsDrawer() {
    StorageService.resetSuppressedWarnings();
    this.showToast("✅ Đã bật lại toàn bộ các cảnh báo gốc!", "success", 2500);
    this.renderDrawerLevel("settings-alerts");
  },

  toggleWarningDrawerKey(key) {
    if (StorageService.isWarningSuppressed(key)) {
      StorageService.unsuppressWarning(key);
      this.showToast(`Đã bật lại: ${StorageService.KNOWN_WARNINGS[key]?.title || key}`, "success", 2000);
    } else {
      StorageService.suppressWarning(key);
      this.showToast(`Đã tắt (ẩn): ${StorageService.KNOWN_WARNINGS[key]?.title || key}`, "info", 2000);
    }
    this.renderDrawerLevel("settings-alerts");
  },

  toggleWarnOnLeaveQuiz(checked) {
    const settings = StorageService.getAppSettings();
    settings.warnOnLeaveQuiz = Boolean(checked);
    StorageService.saveAppSettings(settings);
    this.showToast(checked ? "✓ Đã bật cảnh báo khi rời bài thi dở dang!" : "⚠️ Đã tắt cảnh báo khi rời bài thi.", "info", 2500);
    this.renderDrawerLevel("settings-alerts");
  },

  setExplorerShortcutsSetting(checked) {
    const settings = StorageService.getAppSettings();
    settings.enableExplorerShortcuts = Boolean(checked);
    StorageService.saveAppSettings(settings);
    this.showToast(checked ? "✓ Đã bật phím tắt Cây Mục Lục (F2, Del, Ctrl+C/X/V)!" : "⚠️ Đã tắt phím tắt Cây Mục Lục.", "info", 2500);
    this.renderDrawerLevel("settings-shortcuts");
  },

  async selectAvatarDrawer(avatarId) {
    const profile = StorageService.getUserProfile();
    if (!profile) return;
    profile.avatar = avatarId;
    StorageService.saveUserProfile(profile);
    if (profile.id) {
      await StorageService.updateUser(profile.id, { avatar: avatarId });
    }
    this.renderHeader();
    this.renderDrawerLevel("settings-profile");
  },

  async saveProfileFromDrawer() {
    const name = document.getElementById("drwProfName")?.value.trim();
    const id = document.getElementById("drwProfId")?.value.trim();
    const className = document.getElementById("drwProfClass")?.value.trim() || "";
    const dept = document.getElementById("drwProfDept")?.value.trim() || "";
    const email = document.getElementById("drwProfEmail")?.value.trim() || "";
    const phone = document.getElementById("drwProfPhone")?.value.trim() || "";

    if (!name) {
      this.showToast("⚠️ Họ và tên không được để trống!", "warning");
      return;
    }

    const profile = StorageService.getUserProfile();
    if (!profile) return;

    // Kiểm tra xem có thay đổi thông tin nào ngoài Avatar không
    const isInfoChanged = (
      name !== (profile.fullName || "") ||
      (id && id !== (profile.studentId || "")) ||
      className !== (profile.className || "") ||
      dept !== (profile.department || "") ||
      email !== (profile.email || "") ||
      phone !== (profile.phone || "")
    );

    if (!isInfoChanged) {
      this.showToast("ℹ️ Thông tin cá nhân không có thay đổi nào.", "info", 2000);
      return;
    }

    // Kiểm tra giới hạn 14 ngày (ngoại trừ Admin)
    const lastUpdateStr = profile.profileUpdatedAt;
    let lastUpdateDate = lastUpdateStr ? new Date(lastUpdateStr) : null;
    let daysSinceUpdate = lastUpdateDate ? ((Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const isCooldownActive = (profile.role !== "admin") && (daysSinceUpdate < 14);
    const daysLeft = isCooldownActive ? Math.ceil(14 - daysSinceUpdate) : 0;

    if (isCooldownActive) {
      this.showToast(`⚠️ Bạn chỉ có thể cập nhật lại thông tin sau ${daysLeft} ngày nữa (Quy định 14 ngày/lần)!`, "warning", 4500);
      return;
    }

    // Tự động đóng Drawer để Modal xác thực hiển thị trên cùng rõ ràng, không bị che khuất
    this.closeUserDrawer();

    const updates = {
      fullName: name,
      studentId: id || profile.studentId,
      className: className,
      department: dept || profile.department,
      email: email || profile.email,
      phone: phone || profile.phone,
      avatar: profile.avatar || "avatar-student"
    };

    const targetEmail = profile.email || email;
    if (!targetEmail) {
      this.showToast("⚠️ Tài khoản chưa có email để nhận mã OTP!", "warning");
      return;
    }

    try {
      this.showToast("⏳ Đang tạo và gửi mã OTP về email của bạn...", "info", 2500);
      const otpRes = StorageService.generateEmailOtp(profile.studentId, targetEmail);
      const emailResult = await EmailService.sendOtp(profile.studentId, targetEmail, profile.fullName, otpRes.otp);

      this.openProfileEmailOtpModal(updates, targetEmail, emailResult, otpRes);
    } catch (err) {
      this.showToast("❌ " + (err.message || "Không thể gửi mã OTP"), "danger", 4500);
    }
  },

  openProfileEmailOtpModal(updates, targetEmail, emailResult, otpRes) {
    const profile = StorageService.getUserProfile();
    if (!profile) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "🔐 Xác Thực OTP Cập Nhật Hồ Sơ";

    // Che mờ email bảo mật (Ví dụ: vk***@gmail.com)
    const parts = targetEmail.split("@");
    const maskedUser = parts[0].length > 3 ? (parts[0].substring(0, 2) + "***" + parts[0].slice(-1)) : (parts[0] + "***");
    const maskedEmail = maskedUser + "@" + (parts[1] || "");

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 13px; color: #15803d; line-height: 1.5;">
          ${emailResult && emailResult.isRealEmail 
            ? `📨 Đã gửi mã OTP 6 chữ số đến hộp thư: <strong>${maskedEmail}</strong>. Vui lòng kiểm tra Email (và hòm thư Rác/Spam nếu có).` 
            : `📨 Đã tạo mã OTP cho tài khoản <strong>${profile.fullName}</strong>. (Mã thử nghiệm: <strong style="font-size:15px; color:#b45309;">${otpRes.otp}</strong>)`
          }
        </div>

        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12.5px;">
          <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Thông tin dự kiến cập nhật:</div>
          <div>👤 Họ tên: <strong>${updates.fullName}</strong></div>
          <div>🆔 MSSV: <strong>${updates.studentId}</strong> · Lớp: <strong>${updates.className || 'N/A'}</strong></div>
          <div>📧 Email: <strong>${updates.email || 'N/A'}</strong> · SĐT: <strong>${updates.phone || 'N/A'}</strong></div>
          ${profile.role !== "admin" ? `<div style="color: #b45309; margin-top: 4px; font-weight: 600;">⏳ Sau khi cập nhật, bạn sẽ phải đợi 14 ngày cho lần sửa tiếp theo.</div>` : ''}
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Nhập Mã OTP 6 Chữ Số (*):</label>
          <input type="text" id="profileEmailOtpInput" class="form-control" placeholder="Ví dụ: 849201" maxlength="6" inputmode="numeric" style="font-size: 20px; letter-spacing: 4px; font-weight: 800; text-align: center;" autofocus>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12.5px;">
          <div id="profileOtpTimerText" style="color: #d97706; font-weight: 700;">
            ⏳ Mã hết hạn sau: <span id="profileOtpCountdown">05:00</span>
          </div>
          <button type="button" id="btnResendProfileOtp" class="btn btn-sm" style="font-size: 12px; display: inline-flex; align-items: center; gap: 4px;" disabled onclick="App.resendProfileOtpEmail()">
            ${Icons.get('refresh', 12)} <span>Gửi lại mã (<span id="resendCooldown">30</span>s)</span>
          </button>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal(); App.clearProfileOtpTimer();">Hủy</button>
      <button class="btn btn-primary" id="btnConfirmProfileOtp" onclick="App.confirmProfileOtpVerification()">Xác Nhận & Cập Nhật Hồ Sơ</button>
    `;

    this.pendingProfileUpdates = updates;
    this.pendingProfileTargetEmail = targetEmail;
    this.openModal();

    this.startProfileOtpTimer(300, 30);
  },

  startProfileOtpTimer(totalSeconds = 300, resendCooldown = 30) {
    this.clearProfileOtpTimer();
    let remaining = totalSeconds;
    let resendLeft = resendCooldown;

    const timerElem = document.getElementById("profileOtpCountdown");
    const resendBtn = document.getElementById("btnResendProfileOtp");
    const resendSpan = document.getElementById("resendCooldown");
    const confirmBtn = document.getElementById("btnConfirmProfileOtp");

    this.profileOtpInterval = setInterval(() => {
      remaining--;
      if (resendLeft > 0) {
        resendLeft--;
        if (resendSpan) resendSpan.textContent = resendLeft;
        if (resendLeft === 0 && resendBtn) {
          resendBtn.disabled = false;
          resendBtn.innerHTML = `${Icons.get('refresh', 12)} <span>Gửi lại mã</span>`;
        }
      }

      if (remaining <= 0) {
        this.clearProfileOtpTimer();
        if (timerElem) timerElem.textContent = "00:00 (Hết hạn)";
        if (confirmBtn) confirmBtn.disabled = true;
        this.showToast("⚠️ Mã OTP đã hết hạn. Vui lòng bấm 'Gửi lại mã' để nhận mã mới!", "warning", 3500);
      } else {
        const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
        const secs = (remaining % 60).toString().padStart(2, '0');
        if (timerElem) timerElem.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  },

  clearProfileOtpTimer() {
    if (this.profileOtpInterval) {
      clearInterval(this.profileOtpInterval);
      this.profileOtpInterval = null;
    }
  },

  async resendProfileOtpEmail() {
    const profile = StorageService.getUserProfile();
    const targetEmail = this.pendingProfileTargetEmail || profile?.email;
    if (!profile || !targetEmail) return;

    try {
      this.showToast("⏳ Đang gửi lại mã OTP mới...", "info", 2000);
      const otpRes = StorageService.generateEmailOtp(profile.studentId, targetEmail);
      const emailResult = await EmailService.sendOtp(profile.studentId, targetEmail, profile.fullName, otpRes.otp);

      const confirmBtn = document.getElementById("btnConfirmProfileOtp");
      if (confirmBtn) confirmBtn.disabled = false;

      const otpInput = document.getElementById("profileEmailOtpInput");
      if (otpInput) {
        otpInput.value = "";
        otpInput.focus();
      }

      this.startProfileOtpTimer(300, 30);

      if (emailResult && emailResult.isRealEmail) {
        this.showToast(`🎉 Đã gửi mã OTP mới đến ${targetEmail}!`, "success", 3500);
      } else {
        this.showToast(`📨 [Mô phỏng Email Shinora] Mã OTP mới: ${otpRes.otp}`, "info", 6000);
      }
    } catch (err) {
      this.showToast("❌ " + (err.message || "Lỗi gửi lại OTP"), "danger", 3500);
    }
  },

  async confirmProfileOtpVerification() {
    const otp = document.getElementById("profileEmailOtpInput")?.value.trim();
    if (!otp) {
      this.showToast("⚠️ Vui lòng nhập mã OTP 6 chữ số!", "warning");
      return;
    }

    const profile = StorageService.getUserProfile();
    if (!profile) return;

    // Xác thực mã OTP thông qua StorageService
    const verifyResult = StorageService.verifyEmailOtp(profile.studentId, otp);
    if (!verifyResult.success) {
      this.showToast("❌ " + verifyResult.message, "danger", 4000);
      return;
    }

    const updates = this.pendingProfileUpdates;
    if (!updates) return;

    // Ghi nhận thời gian cập nhật hồ sơ (áp dụng quy định 14 ngày)
    updates.profileUpdatedAt = new Date().toISOString();

    Object.assign(profile, updates);
    StorageService.saveUserProfile(profile);

    if (profile.id) {
      await StorageService.updateUser(profile.id, updates);
    }

    this.clearProfileOtpTimer();
    this.closeModal();
    this.renderHeader();
    this.showToast("🎉 Đã xác thực OTP thành công và cập nhật hồ sơ lên Cloud!", "success", 4000);
  },

  downloadFullBackup() {
    const backup = StorageService.exportFullBackupData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `shinora-quizmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.showToast("📥 Đã tải file sao lưu dữ liệu (.json) thành công!", "success", 3000);
  },

  triggerRestoreBackupFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          StorageService.restoreFullBackupData(json);
          this.applyThemeSettings();
          this.renderHeader();
          this.showToast("🎉 Đã phục hồi dữ liệu thành công!", "success", 3500);
          this.renderDrawerLevel("main");
          this.navigateTo("home");
        } catch (err) {
          this.showToast("❌ File sao lưu không hợp lệ: " + err.message, "danger", 4000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  clearMistakesData() {
    this.showConfirmDialog({
      title: "Xóa toàn bộ câu làm sai",
      message: "Bạn có chắc chắn muốn xóa toàn bộ danh sách câu làm sai không?",
      icon: "🗑️",
      confirmText: "Xóa danh sách",
      isDanger: true,
      onConfirm: () => {
        localStorage.removeItem(StorageService.KEYS.MISTAKES);
        this.showToast("Đã dọn dẹp danh sách câu làm sai!", "success", 2500);
        this.renderDrawerLevel("settings-data");
      }
    });
  },

  clearHistoryData() {
    this.showConfirmDialog({
      title: "Xóa lịch sử làm bài thi",
      message: "Bạn có chắc chắn muốn xóa toàn bộ lịch sử các lần làm bài thi trước đây không?",
      icon: "🗑️",
      confirmText: "Xóa lịch sử",
      isDanger: true,
      onConfirm: () => {
        localStorage.removeItem(StorageService.KEYS.HISTORY);
        this.showToast("Đã xóa toàn bộ lịch sử làm bài thi!", "success", 2500);
        this.renderDrawerLevel("settings-data");
      }
    });
  },

  // ── CÁC PHƯƠNG THỨC ĐIỀU KHIỂN DYNAMIC ISLAND TỪ DRAWER ────────────
  toggleDynamicIslandFromDrawer(checked) {
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.toggleEnabled === "function") {
      DynamicIsland.toggleEnabled(checked);
    }
    this.renderDrawerLevel("settings-island");
  },

  setDynamicIslandColorFromDrawer(color) {
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.setColorTheme === "function") {
      DynamicIsland.setColorTheme(color);
    }
    this.renderDrawerLevel("settings-island");
  },

  setDynamicIslandScaleFromDrawer(scale) {
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.setScaleSize === "function") {
      DynamicIsland.setScaleSize(scale);
    }
    this.renderDrawerLevel("settings-island");
  },

  setDynamicIslandDelayFromDrawer(delay) {
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.setAutoCollapseDelay === "function") {
      DynamicIsland.setAutoCollapseDelay(delay);
    }
    this.renderDrawerLevel("settings-island");
  },

  setDynamicIslandStealthFromDrawer(delay) {
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.setStealthDelay === "function") {
      DynamicIsland.setStealthDelay(delay);
    }
    this.renderDrawerLevel("settings-island");
  },

  setDynamicIslandAutoSkipFromDrawer(checked) {
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.setAutoSkipOnError === "function") {
      DynamicIsland.setAutoSkipOnError(checked);
    }
    this.renderDrawerLevel("settings-island");
  },

  setDynamicIslandMobilePosFromDrawer(pos) {
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.setMobilePosition === "function") {
      DynamicIsland.setMobilePosition(pos);
    }
    this.renderDrawerLevel("settings-island");
  },

  setDynamicIslandExamFromDrawer(checked) {
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.toggleExamMode === "function") {
      DynamicIsland.toggleExamMode(checked);
    }
    this.renderDrawerLevel("settings-island");
  },

  toggleUserRole() {
    this.openAccountSwitcherModal();
  },

  updateActiveNav(view) {
    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.remove("active"));
    if (view === "home") document.getElementById("navHome")?.classList.add("active");
    if (view === "guide") document.getElementById("navGuide")?.classList.add("active");
  }
});
