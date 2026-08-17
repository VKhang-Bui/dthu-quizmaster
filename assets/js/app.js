/**
 * DTHU QUIZMASTER - MAIN CONTROLLER & APPLICATION ROUTER
 * Tác giả: Bùi Văn Khang - CNSH DThu
 */

const App = {
  // Application State
  currentView: "home",
  currentHubTab: "official",
  adminSubjectTab: "official", // 'official' hoặc 'drafts' cho trang Quản lý Bộ đề
  activeMaterialId: "mat-cnxhkh",
  activeSubject: null,
  activeSession: null,
  latestResultDetails: null,
  currentParsedQuestions: [],
  selectedSubjectDetailId: null,
  subjectDetailTab: "questions", // 'questions' hoặc 'chapters'
  selectedChapterFilter: "all",
  subjectQuestionPage: 0,
  subjectSearchKeyword: "",
  isChapterFilterMenuOpen: false,
  activeReviewDraftId: null,
  draftEditingQuestionIndex: null,
  quizSetupSubjectId: null,
  quizSetupState: null,
  timerInterval: null,
  letters: ['A', 'B', 'C', 'D', 'E'],
  QUESTIONS_PER_PAGE: 10,
  currentPage: 0,

  // Khởi động ứng dụng
  async init() {
    try {
      this.applyThemeSettings();
      if (typeof DataLoader !== "undefined") {
        try {
          await DataLoader.init();
        } catch (e) {
          console.warn("DataLoader init warning:", e);
        }
      }
      this.renderHeader();

      // Đọc URL Hash ban đầu nếu có (Direct link / Bookmark / F5 Reload)
      const initialRoute = this.parseHashRoute();
      const startView = (initialRoute.view && initialRoute.view !== "quiz") ? initialRoute.view : "home";
      const startData = (initialRoute.view && initialRoute.view !== "quiz") ? (initialRoute.data || {}) : {};

      // Cập nhật trạng thái ban đầu vào Browser History
      if (typeof window !== "undefined" && window.history && window.history.replaceState) {
        window.history.replaceState({ view: startView, data: startData }, "", this.buildViewHash(startView, startData));
      }

      this.navigateTo(startView, startData, false);
      this.bindGlobalEvents();
      this.initDraggableGuideButton();

      // Ghi nhận lượt truy cập và khởi động cập nhật lưu lượng trực tuyến
      if (typeof StorageService !== "undefined" && typeof StorageService.recordVisit === "function") {
        StorageService.recordVisit();
        this.updateTrafficStatsUI();
        setInterval(() => {
          const tabId = (typeof sessionStorage !== "undefined") ? sessionStorage.getItem("dthu_quiz_tab_id") : null;
          if (tabId && typeof StorageService.updateActiveOnlineHeartbeat === "function") {
            StorageService.updateActiveOnlineHeartbeat(tabId);
          }
          this.updateTrafficStatsUI();
        }, 15000);
      }

      // Tự động đồng bộ CSDL đám mây Supabase Cloud (chạy nền)
      if (typeof StorageService !== "undefined" && typeof StorageService.syncWithCloud === "function") {
        StorageService.syncWithCloud().then(() => {
          this.renderHeader();
          const main = document.getElementById("mainContent");
          if (this.currentView === "home" && main) {
            this.renderHomeView(main);
          } else if (this.currentView === "manage" && main) {
            this.renderManageView(main);
          }
        }).catch(e => console.warn("Supabase background sync:", e));
      }
    } catch (err) {
      console.error("App init fatal error:", err);
    }
  },

  // ── Cập nhật dữ liệu lưu lượng truy cập trực tuyến ──
  updateTrafficStatsUI() {
    if (typeof StorageService === "undefined" || typeof StorageService.getTrafficStats !== "function") return;
    const traffic = StorageService.getTrafficStats();

    const visitsElem = document.getElementById("trafficVisitsCount");
    if (visitsElem) visitsElem.textContent = traffic.totalVisitsFormatted;

    const onlineElem = document.getElementById("trafficOnlineCount");
    if (onlineElem) onlineElem.textContent = `🟢 ${traffic.onlineNow}`;

    const attemptsElem = document.getElementById("trafficAttemptsCount");
    if (attemptsElem) attemptsElem.textContent = traffic.totalAttemptsFormatted;

    const heroOnline = document.getElementById("heroLiveTrafficPill");
    if (heroOnline) heroOnline.innerHTML = `👥 <strong>${traffic.onlineNow}</strong> sinh viên online`;
  },

  // Áp dụng Theme (Sáng/Tối), Màu chủ đạo & Cỡ chữ từ Cài Đặt
  applyThemeSettings() {
    const settings = StorageService.getAppSettings();
    let isDark = false;
    if (settings.theme === "dark") {
      isDark = true;
    } else if (settings.theme === "auto") {
      isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    document.documentElement.setAttribute("data-accent", settings.accentColor || "blue");

    const fontSizes = {
      normal: "15px",
      large: "16.5px",
      xlarge: "18px"
    };
    document.documentElement.style.setProperty("--quiz-font-size", fontSizes[settings.fontSize] || "15px");
  },

  // Global Header (Tinh gọn tối đa, tập trung vào Trang chủ & Khối Người Dùng)
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
            <div style="font-size: 22px; line-height: 1;">🔒</div>
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
            <button class="btn btn-sm btn-danger" onclick="App.confirmExitQuiz()" style="font-weight: 700; font-size: 12.5px;">
              🚪 Rời phòng làm bài
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
      if (profile.role === "admin") roleBadge = `<span class="user-role-badge admin" style="font-size: 10px; padding: 1px 6px;">👑 Admin</span>`;
      else if (profile.role === "editor") roleBadge = `<span class="user-role-badge editor" style="font-size: 10px; padding: 1px 6px; background:#eff6ff; color:#1e40af;">🛡️ Editor</span>`;
      else roleBadge = `<span class="user-role-badge student" style="font-size: 10px; padding: 1px 6px;">👨‍🎓 SV</span>`;
    }

    headerEl.innerHTML = `
      <div class="header-brand" onclick="App.navigateTo('home')" title="Nhấp để quay về Trang Chủ">
        <div class="brand-icon">📚</div>
        <div class="brand-title-group">
          <h1>DThu QuizMaster</h1>
          <div class="brand-author">Bùi Văn Khang · CNSH DThu</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        ${isLogged ? `
          <button class="notif-bell-btn" onclick="App.navigateTo('notifications')" title="Trung tâm thông báo & Biến động điểm">
            <span style="font-size: 18px;">🔔</span>
            ${unreadNotifs > 0 ? `<span class="notif-badge">${unreadNotifs > 99 ? '99+' : unreadNotifs}</span>` : ''}
          </button>
        ` : ''}

        <!-- Khối Người Dùng (Bấm vào để mở Thanh trượt bên phải) -->
        <div class="header-user-widget" onclick="App.openUserDrawer('main')" title="${isLogged ? 'Xem menu cá nhân & tiện ích' : 'Nhấp để đăng nhập'}">
          <div style="font-size: 20px;">${isLogged ? (profile.avatar || '👨‍🎓') : '👤'}</div>
          <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="font-size: 13px; font-weight: 700; color: var(--text-primary); line-height: 1.2;">
              ${isLogged ? profile.fullName : 'Khách (Chưa đăng nhập)'}
            </span>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
              ${isLogged ? `
                <span class="user-exp-chip" style="font-size: 11px; padding: 1px 6px;" title="Điểm EXP Học Tập">⚡ ${profile.totalExp || 0}</span>
                <span class="user-exp-chip" style="font-size: 11px; padding: 1px 6px; background:#fef3c7; color:#b45309; border-color:#fde68a;" title="Điểm Cống Hiến Dữ Liệu">🌟 ${profile.contributionPoints || 0} CP</span>
              ` : ''}
              ${roleBadge}
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text-tertiary); margin-left: 2px;">▸</div>
        </div>
      </div>
    `;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // HỆ THỐNG THANH TRƯỢT ĐA TẦNG (DRILL-DOWN DRAWER NAVIGATION)
  // ═════════════════════════════════════════════════════════════════════════
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
    this.renderHeader();
    this.showToast("👋 Đã đăng xuất về chế độ Khách!", "info", 2500);
    this.navigateTo("home");
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
            <h3>👤 Trung Tâm Người Dùng</h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">&times;</button>
        `;

        if (!isLogged) {
          // ── GIAO DIỆN KHÁCH: KHÔNG HIỆN GÌ, CHỈ HIỆN 1 KHỐI NÚT ĐĂNG NHẬP Ở CHÍNH GIỮA ──
          bodyHtml = `
            <div class="drawer-slide-content" style="text-align: center; padding: 48px 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <div style="font-size: 56px; margin-bottom: 14px; line-height: 1;">🔒</div>
              <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">Chế Độ Khách</h3>
              <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 24px 0; max-width: 290px;">
                Bạn đang duyệt web ở chế độ Khách. Vui lòng đăng nhập tài khoản sinh viên DThu để mở khóa toàn bộ tính năng: Ôn tập có đáp án & giải thích, Kho tài liệu (.txt), Ngân hàng câu sai, Tích lũy EXP và Đóng góp đề thi.
              </p>
              <button class="btn btn-primary" style="width: 100%; max-width: 290px; padding: 13px; font-size: 14px; font-weight: 700;" onclick="App.closeUserDrawer(); App.openAccountSwitcherModal();">
                🔑 Đăng Nhập / Chọn Tài Khoản ➔
              </button>
            </div>
          `;
          footerHtml = "";
        } else {
          // ── GIAO DIỆN THÀNH VIÊN ĐÃ ĐĂNG NHẬP: HIỆN ĐẦY ĐỦ TIỆN ÍCH & NÚT Ở CUỐI ──
          let roleBadgeText = '<span class="user-role-badge student">👨‍🎓 SV</span>';
          if (profile.role === "admin") roleBadgeText = '<span class="user-role-badge admin">👑 Admin</span>';
          else if (profile.role === "editor") roleBadgeText = '<span class="user-role-badge editor" style="background:#eff6ff; color:#1e40af;">🛡️ Editor</span>';

          bodyHtml = `
            <div class="drawer-slide-content">
              <!-- Thẻ Hồ Sơ Sinh Viên -->
              <div class="user-hub-profile-card">
                <div style="font-size: 38px; line-height: 1;">${profile.avatar || '👨‍🎓'}</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                    <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${profile.fullName}</h3>
                    ${roleBadgeText}
                  </div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    MSSV: <strong>${profile.studentId || 'Chưa cập nhật'}</strong>
                  </div>
                  <div style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    📧 <code>${profile.email || (profile.studentId ? profile.studentId + '@dthu.edu.vn' : '')}</code>
                  </div>
                  <div style="display: flex; gap: 10px; margin-top: 8px; font-size: 12px; flex-wrap: wrap;">
                    <span style="color: #b45309; font-weight: 800;">⚡ ${profile.totalExp || 0} EXP</span>
                    <span style="color: #15803d; font-weight: 800;">🌟 ${profile.contributionPoints || 0} CP</span>
                    <span style="color: #0369a1; font-weight: 700;">📝 ${profile.quizzesCompleted !== undefined ? profile.quizzesCompleted : history.length} bài</span>
                  </div>
                </div>
              </div>

              <!-- Danh Sách Các Khối Tính Năng (1 Dòng) -->
              <div>
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.04em; margin-bottom: 8px;">
                  Tiện ích & Quản lý
                </div>
                <div class="drawer-nav-list">
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('notifications');">
                    <span class="drawer-icon">🔔</span>
                    <span class="drawer-label">Trung Tâm Thông Báo</span>
                    ${unreadNotifs > 0 ? `<span class="badge" style="background:#ef4444; color:#fff; font-weight:800; font-size:11px; padding:2px 7px;">${unreadNotifs} mới</span>` : `<span class="drawer-arrow">➔</span>`}
                  </button>

                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('leaderboard');">
                    <span class="drawer-icon">🏆</span>
                    <span class="drawer-label">Bảng Xếp Hạng DThu</span>
                    <span class="drawer-arrow">➔</span>
                  </button>

                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('materials');">
                    <span class="drawer-icon">📚</span>
                    <span class="drawer-label">Kho Tài Liệu (.txt)</span>
                    <span class="drawer-arrow">➔</span>
                  </button>

                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('parser');">
                    <span class="drawer-icon">📝</span>
                    <span class="drawer-label">Nhập & Đóng Góp Đề</span>
                    <span class="drawer-arrow">➔</span>
                  </button>

                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('history');">
                    <span class="drawer-icon">📜</span>
                    <span class="drawer-label">Lịch Sử Thi & Nhật Ký</span>
                    ${examHistory.length > 0 ? `<span class="badge" style="background:#eff6ff; color:#1d4ed8; font-weight:700;">${examHistory.length}/3</span>` : `<span class="drawer-arrow">➔</span>`}
                  </button>

                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('manage');">
                    <span class="drawer-icon">⚙️</span>
                    <span class="drawer-label">Quản Lý Bộ Đề</span>
                    ${(profile.role === 'admin' || StorageService.hasPermission('canApproveDrafts')) && drafts.length > 0 ? `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">${drafts.length} chờ duyệt</span>` : `<span class="drawer-arrow">➔</span>`}
                  </button>

                  <button class="drawer-nav-btn" style="background: var(--surface-subtle); border-color: var(--brand-primary);" onclick="App.renderDrawerLevel('settings')">
                    <span class="drawer-icon">🛠️</span>
                    <span class="drawer-label"><strong>Cài Đặt Hệ Thống</strong></span>
                    <span class="drawer-arrow">➔</span>
                  </button>

                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.openContactModal();">
                    <span class="drawer-icon">📩</span>
                    <span class="drawer-label">Liên Hệ & Góp Ý</span>
                    <span class="drawer-arrow">➔</span>
                  </button>

                  ${(profile.role === 'admin' || StorageService.hasPermission('canManageUsers')) ? `
                    <button class="drawer-nav-btn" style="border-color: #eab308; background: #fefce8; color: #854d0e;" onclick="App.closeUserDrawer(); App.navigateTo('leaderboard-admin');">
                      <span class="drawer-icon">👑</span>
                      <span class="drawer-label"><strong>Quản Trị BXH & Mùa Giải</strong></span>
                      <span class="drawer-arrow">➔</span>
                    </button>
                    <button class="drawer-nav-btn" style="border-color: #3b82f6; background: #eff6ff; color: #1d4ed8;" onclick="App.closeUserDrawer(); App.navigateTo('users-management');">
                      <span class="drawer-icon">👥</span>
                      <span class="drawer-label"><strong>Quản Lý Người Dùng</strong></span>
                      <span class="badge" style="background:#dbeafe; color:#1e40af; font-weight:700;">${StorageService.getActiveUsers().length}</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;

          footerHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <button class="btn btn-primary btn-sm" style="width: 100%; font-size: 13px;" onclick="App.closeUserDrawer(); App.openAccountSwitcherModal();">
                🔑 Đổi Tài Khoản ➔
              </button>
              <button class="btn btn-sm btn-danger" style="width: 100%; font-size: 12px;" onclick="App.logoutUser()">
                🚪 Đăng Xuất (Về Khách)
              </button>
            </div>
          `;
        }
        break;

      // ── CẤP 1: MENU CÀI ĐẶT TỔNG (SETTINGS MAIN) ───────────────────────────
      case "settings":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('main')">← Quay lại</button>
            <h3>⚙️ Cài Đặt Hệ Thống</h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">&times;</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content">
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 6px 0;">
              Tùy chỉnh giao diện, thông báo, hồ sơ cá nhân và quản lý dữ liệu ôn thi:
            </p>

            <div class="drawer-nav-list">
              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-theme')">
                <span class="drawer-icon">🎨</span>
                <span class="drawer-label">Giao Diện & Hiển Thị</span>
                <span class="drawer-arrow">➔</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-alerts')">
                <span class="drawer-icon">🔔</span>
                <span class="drawer-label">Thông Báo & Cảnh Báo</span>
                <span class="drawer-arrow">➔</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-profile')">
                <span class="drawer-icon">👤</span>
                <span class="drawer-label">Thông Tin Cá Nhân & Avatar</span>
                <span class="drawer-arrow">➔</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-data')">
                <span class="drawer-icon">💾</span>
                <span class="drawer-label">Sao Lưu & Dữ Liệu</span>
                <span class="drawer-arrow">➔</span>
              </button>

              <button class="drawer-nav-btn" onclick="App.renderDrawerLevel('settings-about')">
                <span class="drawer-icon">ℹ️</span>
                <span class="drawer-label">Thông Tin Ứng Dụng</span>
                <span class="drawer-arrow">➔</span>
              </button>
            </div>
          </div>
        `;
        break;

      // ── CẤP 2: GIAO DIỆN & HIỂN THỊ (THEME / DARK MODE) ───────────────────
      case "settings-theme":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')">← Cài đặt</button>
            <h3>🎨 Giao Diện & Hiển Thị</h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">&times;</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content">
            <!-- 1. Chế độ màu Sáng/Tối -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
                🌓 Chế độ hiển thị:
              </label>
              <div class="theme-options-grid">
                <div class="theme-option-card ${settings.theme === 'light' ? 'active' : ''}" onclick="App.setThemeSetting('light')">
                  <div style="font-size: 20px; margin-bottom: 4px;">☀️</div>
                  <div style="font-size: 12.5px;">Sáng</div>
                </div>
                <div class="theme-option-card ${settings.theme === 'dark' ? 'active' : ''}" onclick="App.setThemeSetting('dark')">
                  <div style="font-size: 20px; margin-bottom: 4px;">🌙</div>
                  <div style="font-size: 12.5px;">Tối</div>
                </div>
                <div class="theme-option-card ${settings.theme === 'auto' ? 'active' : ''}" onclick="App.setThemeSetting('auto')">
                  <div style="font-size: 20px; margin-bottom: 4px;">💻</div>
                  <div style="font-size: 12.5px;">Tự động</div>
                </div>
              </div>
            </div>

            <!-- 2. Màu sắc chủ đạo (Accent Color) -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
                🌈 Màu sắc chủ đạo:
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
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
                🔤 Cỡ chữ phòng thi & câu hỏi:
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
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')">← Cài đặt</button>
            <h3>🔔 Thông Báo & Cảnh Báo</h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">&times;</button>
        `;

        const isWarnOnLeaveQuiz = (settings.warnOnLeaveQuiz !== false);

        bodyHtml = `
          <div class="drawer-slide-content">
            <!-- Cảnh báo khi rời bài thi dở dang -->
            <div style="background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px;">
              <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin: 0;">
                <div style="padding-right: 10px;">
                  <strong style="font-size: 13.5px; color: var(--text-primary); display: block; margin-bottom: 2px;">🚪 Cảnh báo khi rời bài thi / đóng tab:</strong>
                  <span style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; display: block;">Cảnh báo khi chưa nộp bài mà tải lại trang (F5), đóng tab hoặc thoát</span>
                </div>
                <input type="checkbox" ${isWarnOnLeaveQuiz ? 'checked' : ''} onchange="App.toggleWarnOnLeaveQuiz(this.checked)" style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
              </label>
            </div>

            <!-- Thời gian Toast -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: block;">
                ⏱️ Thời gian thông báo nổi (Toast):
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
                <label class="form-label" style="font-size: 13px; font-weight: 700; margin: 0;">
                  🛡️ Quản lý hộp thoại cảnh báo:
                </label>
                <button class="btn btn-sm" style="font-size: 11px; padding: 2px 6px;" onclick="App.resetAllWarningsDrawer()">
                  🔄 Bật tất cả
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
                        <span style="font-size: 11.5px; color: var(--text-secondary);">${isSupp ? '⚠️ Đã chọn ẩn (Tự đồng ý)' : '✓ Đang bật cảnh báo'}</span>
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
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')">← Cài đặt</button>
            <h3>👤 Hồ Sơ Cá Nhân</h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">&times;</button>
        `;

        const avatars = ["👨‍🎓", "👩‍🎓", "🧑‍💻", "🧪", "🧬", "🌟", "📚", "🏆", "🎓", "🦁", "🦉", "🚀"];

        bodyHtml = `
          <div class="drawer-slide-content">
            <!-- Chọn Avatar Emoji -->
            <div>
              <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 6px; display: block;">
                Chọn Avatar đại diện:
              </label>
              <div class="avatar-picker-grid">
                ${avatars.map(a => `
                  <button class="avatar-choice-btn ${profile.avatar === a ? 'active' : ''}" onclick="App.selectAvatarDrawer('${a}')">
                    ${a}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Họ tên -->
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Họ và tên:</label>
              <input type="text" id="drwProfName" class="form-control" value="${profile.fullName}">
            </div>

            <!-- MSSV -->
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Mã số sinh viên (MSSV):</label>
              <input type="text" id="drwProfId" class="form-control" value="${profile.studentId || ''}">
            </div>

            <!-- Khoa / Ngành -->
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Khoa / Chuyên ngành:</label>
              <input type="text" id="drwProfDept" class="form-control" value="${profile.department || ''}">
            </div>

            <button class="btn btn-primary" style="width: 100%; margin-top: 4px;" onclick="App.saveProfileFromDrawer()">
              💾 Lưu Thông Tin Cá Nhân
            </button>
          </div>
        `;
        break;

      // ── CẤP 2: SAO LƯU & DỮ LIỆU (BACKUP & RESTORE) ──────────────────────
      case "settings-data":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')">← Cài đặt</button>
            <h3>💾 Sao Lưu & Dữ Liệu</h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">&times;</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content">
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
              Xuất hoặc nạp toàn bộ ngân hàng câu hỏi, điểm EXP và dữ liệu ôn thi ra file JSON để đồng bộ giữa các thiết bị:
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button class="btn btn-primary" style="width: 100%;" onclick="App.downloadFullBackup()">
                📥 Tải file sao lưu toàn bộ (.json)
              </button>

              <button class="btn" style="width: 100%;" onclick="App.triggerRestoreBackupFile()">
                📤 Phục hồi dữ liệu từ file backup
              </button>
            </div>

            <div style="border-top: 1px dashed var(--border); padding-top: 14px; margin-top: 4px;">
              <label class="form-label" style="font-size: 13px; font-weight: 700; color: var(--danger); margin-bottom: 8px; display: block;">
                🧹 Dọn dẹp dữ liệu:
              </label>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn btn-sm" style="color: var(--danger); text-align: left;" onclick="App.clearExamHistoryConfirm()">
                  🗑️ Xóa lịch sử thi (${examHistory.length} bài)
                </button>
              </div>
            </div>
          </div>
        `;
        break;

      // ── CẤP 2: THÔNG TIN ỨNG DỤNG (ABOUT) ─────────────────────────────────
      case "settings-about":
        headerHtml = `
          <div class="drawer-header-left">
            <button class="drawer-back-btn" onclick="App.renderDrawerLevel('settings')">← Cài đặt</button>
            <h3>ℹ️ Thông Tin Ứng Dụng</h3>
          </div>
          <button class="drawer-close" onclick="App.closeUserDrawer()">&times;</button>
        `;

        bodyHtml = `
          <div class="drawer-slide-content" style="text-align: center; padding: 12px 0;">
            <div style="font-size: 48px; margin-bottom: 8px;">🎓</div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">DThu QuizMaster</h3>
            <div style="font-size: 13px; color: var(--brand-text); font-weight: 700; margin-top: 2px;">Phiên bản v2.0 (Open-Core)</div>

            <div style="text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-top: 16px; font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
              <div>🏛️ <strong>Trường:</strong> Đại học Đồng Tháp (DThu)</div>
              <div>👨‍🎓 <strong>Tác giả:</strong> Bùi Văn Khang</div>
              <div>🧬 <strong>Chuyên ngành:</strong> Công nghệ Sinh học</div>
              <div>🚀 <strong>Mục tiêu:</strong> Nền tảng ôn thi trắc nghiệm mở, lưu trữ tài liệu .txt và chia sẻ đề thi miễn phí 100% cho sinh viên.</div>
            </div>

            <div style="margin-top: 16px;">
              <a href="https://github.com/VKhang-Bui/dthu-quizmaster" target="_blank" class="btn btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                🔗 Kho mã nguồn GitHub ➔
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

  // Actions for Drawer Settings:
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

  selectAvatarDrawer(avatar) {
    const profile = StorageService.getUserProfile();
    profile.avatar = avatar;
    StorageService.saveUserProfile(profile);
    this.renderHeader();
    this.renderDrawerLevel("settings-profile");
  },

  saveProfileFromDrawer() {
    const name = document.getElementById("drwProfName")?.value.trim();
    const id = document.getElementById("drwProfId")?.value.trim();
    const dept = document.getElementById("drwProfDept")?.value.trim();

    if (!name) {
      this.showToast("⚠️ Họ và tên không được để trống!", "warning");
      return;
    }

    const profile = StorageService.getUserProfile();
    profile.fullName = name;
    profile.studentId = id;
    profile.department = dept || profile.department;

    StorageService.saveUserProfile(profile);
    this.renderHeader();
    this.showToast("✅ Đã lưu thông tin cá nhân thành công!", "success", 2500);
    this.renderDrawerLevel("main");
  },

  downloadFullBackup() {
    const backup = StorageService.exportFullBackupData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `dthu-quizmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
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

  toggleUserRole() {
    this.openAccountSwitcherModal();
  },

  updateActiveNav(view) {
    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.remove("active"));
    if (view === "home") document.getElementById("navHome")?.classList.add("active");
    if (view === "guide") document.getElementById("navGuide")?.classList.add("active");
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 1. FLOATING TOAST NOTIFICATIONS (TỰ BIẾN MẤT 3S-5S / KHÔNG CHẶN THAO TÁC)
  // ═════════════════════════════════════════════════════════════════════════
  showToast(message, type = "info", duration = null) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const settings = StorageService.getAppSettings();
    const timeout = duration || settings.toastDuration || 3500;

    const icons = {
      success: "✓",
      info: "ℹ️",
      warning: "⚠️",
      danger: "✕"
    };

    const toast = document.createElement("div");
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
      <div class="toast-msg">${message}</div>
      <button class="toast-close" title="Đóng">&times;</button>
      <div class="toast-progress"></div>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    const progressBar = toast.querySelector(".toast-progress");

    // Animation progress bar
    progressBar.style.transition = `transform ${timeout}ms linear`;
    setTimeout(() => {
      progressBar.style.transform = "scaleX(0)";
    }, 10);

    const removeToast = () => {
      toast.classList.add("hide");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    };

    const timer = setTimeout(removeToast, timeout);

    closeBtn.onclick = () => {
      clearTimeout(timer);
      removeToast();
    };

    container.appendChild(toast);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 2. INLINE ALERT BAR (CẢNH BÁO ĐẦU TRANG/FORM NHỎ GỌN)
  // ═════════════════════════════════════════════════════════════════════════
  showInlineAlert(targetContainerId, message, type = "warning") {
    const container = document.getElementById(targetContainerId);
    if (!container) {
      this.showToast(message, type);
      return;
    }

    // Xóa alert cũ nếu có
    const existing = container.querySelector(".inline-alert-bar");
    if (existing) existing.remove();

    const icons = {
      warning: "⚠️",
      danger: "🚫",
      info: "ℹ️",
      success: "✓"
    };

    const alertEl = document.createElement("div");
    alertEl.className = `inline-alert-bar ${type}`;
    alertEl.innerHTML = `
      <span>${icons[type] || '⚠️'}</span>
      <span style="flex: 1;">${message}</span>
      <button style="background:none; border:none; cursor:pointer; font-size:16px; color:inherit; padding:0 4px;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.insertBefore(alertEl, container.firstChild);

    // Tự động cuộn tới nếu cấu hình cho phép
    const settings = StorageService.getAppSettings();
    if (settings.autoScrollToError) {
      alertEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      if (alertEl.parentNode) alertEl.remove();
    }, 4500);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 3. SETTINGS & APP CONFIG (MỞ THANH TRƯỢT CÀI ĐẶT)
  // ═════════════════════════════════════════════════════════════════════════
  openSettingsModal() {
    this.openUserDrawer("settings");
  },

  onToastDurationChange(val) {
    const duration = parseInt(val, 10) || 3500;
    StorageService.saveAppSettings({ toastDuration: duration });
    this.showToast(`Đã lưu thời gian hiển thị thông báo: ${duration / 1000} giây`, "success", 2000);
  },

  toggleWarningKey(key) {
    if (StorageService.isWarningSuppressed(key)) {
      StorageService.unsuppressWarning(key);
      this.showToast(`Đã bật lại cảnh báo: ${StorageService.KNOWN_WARNINGS[key]?.title || key}`, "success");
    } else {
      StorageService.suppressWarning(key);
      this.showToast(`Đã tắt (ẩn) cảnh báo: ${StorageService.KNOWN_WARNINGS[key]?.title || key}`, "info");
    }
    this.renderDrawerLevel("settings-alerts");
  },

  resetAllWarnings() {
    StorageService.resetSuppressedWarnings();
    this.showToast("✅ Đã khôi phục toàn bộ các cảnh báo gốc của hệ thống!", "success");
    this.renderDrawerLevel("settings-alerts");
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 4. HỆ THỐNG HỘP THOẠI CẢNH BÁO TÙY CHỌN ẨN LẦN SAU (SMART CONFIRM DIALOG)
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

  // Tạo chuỗi URL Hash tương ứng với view và dữ liệu
  buildViewHash(view, data = {}) {
    let hash = `#${view}`;
    const params = new URLSearchParams();
    if (data.subjectId) params.set("subjectId", data.subjectId);
    if (data.draftId) params.set("draftId", data.draftId);
    if (data.materialId) params.set("materialId", data.materialId);
    if (data.from) params.set("from", data.from);

    const queryString = params.toString();
    if (queryString) {
      hash += `?${queryString}`;
    }
    return hash;
  },

  // Phân tích URL Hash hiện tại của trình duyệt
  parseHashRoute() {
    if (typeof window === "undefined" || !window.location || !window.location.hash) {
      return { view: "home", data: {} };
    }
    const raw = window.location.hash.slice(1).trim();
    if (!raw) return { view: "home", data: {} };

    const [viewPart, queryPart] = raw.split("?");
    const view = viewPart || "home";
    const data = {};
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      for (const [k, v] of params.entries()) {
        data[k] = v;
      }
    }
    return { view, data };
  },

  // Router Điều hướng màn hình (Hỗ trợ Browser History Back/Forward)
  navigateTo(view, data = {}, pushHistory = true) {
    if (this.currentView && this.currentView !== view) {
      this.previousView = this.currentView;
      this.previousViewData = this.currentViewData || {};
    }
    this.currentView = view;
    this.currentViewData = data;
    this.updateActiveNav(view);
    this.renderHeader();

    // Cập nhật Browser History nếu pushHistory = true
    if (pushHistory && typeof window !== "undefined" && window.history && window.history.pushState) {
      const targetHash = this.buildViewHash(view, data);
      if (window.location.hash !== targetHash) {
        window.history.pushState({ view, data }, "", targetHash);
      }
    }

    // Ẩn nút hướng dẫn nổi khi vào phòng thi (quiz), hiển thị ở các màn hình khác
    const floatingGuideBtn = document.getElementById("floatingGuideBtn");
    if (floatingGuideBtn) {
      floatingGuideBtn.style.display = (view === "quiz") ? "none" : "flex";
    }

    // Hủy timer nếu rời khỏi phòng thi
    if (this.timerInterval && view !== "quiz") {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Hủy registration watcher nếu rời khỏi trang đăng ký
    if (this.regWatcherInterval && view !== "register") {
      clearInterval(this.regWatcherInterval);
      this.regWatcherInterval = null;
    }

    // Hủy admin live poll nếu rời khỏi trang quản trị người dùng
    if (this.adminLivePollInterval && view !== "users-management") {
      clearInterval(this.adminLivePollInterval);
      this.adminLivePollInterval = null;
    }

    const mainContainer = document.getElementById("mainContent");
    mainContainer.innerHTML = "";

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Chỉ hiển thị Footer chân trang khi đang ở Trang Chủ (home), ẩn ở tất cả các trang khác
    const footerElem = document.getElementById("appFooter") || document.querySelector(".app-footer");
    if (footerElem) {
      footerElem.style.display = (view === "home") ? "block" : "none";
    }

    switch (view) {
      case "home":
        this.renderHomeView(mainContainer);
        break;
      case "notifications":
        this.renderNotificationsView(mainContainer, data);
        break;
      case "leaderboard":
        this.renderLeaderboardView(mainContainer);
        break;
      case "leaderboard-admin":
        this.renderLeaderboardAdminView(mainContainer, data);
        break;
      case "materials":
        this.renderMaterialsView(mainContainer, data.materialId || this.activeMaterialId);
        break;
      case "moderation":
        this.renderModerationView(mainContainer);
        break;
      case "users-management":
        this.renderUsersManagementView(mainContainer);
        break;
      case "register":
        this.renderRegisterView(mainContainer);
        break;
      case "quiz-setup":
        this.renderQuizSetupView(mainContainer, data?.subjectId || this.quizSetupSubjectId);
        break;
      case "quiz":
        this.renderQuizView(mainContainer);
        break;
      case "result":
        this.renderResultView(mainContainer);
        break;
      case "history":
      case "mistakes":
        this.renderExamHistoryView(mainContainer);
        break;
      case "manage":
        this.renderManageView(mainContainer);
        break;
      case "draft-review":
        this.renderDraftReviewView(mainContainer, data.draftId || this.activeReviewDraftId);
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

  navigateBackOrHome() {
    if (this.previousView && this.previousView !== this.currentView) {
      this.navigateTo(this.previousView, this.previousViewData || {});
    } else if (typeof window !== "undefined" && window.history && window.history.length > 1) {
      window.history.back();
    } else {
      this.navigateTo("home");
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 1. HOME VIEW (TRANG CHỦ MÔN HỌC - TÍCH HỢP HUB TABS CHÍNH THỨC & DRAFTS)
  // ═════════════════════════════════════════════════════════════════════════
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
            <p>Hệ thống tự học, ngân hàng đề cương, thi thử tính giờ và lưu trữ tiến độ học tập cho sinh viên Trường Đại học Đồng Tháp.</p>
          </div>
          <div class="home-hero-actions">
            <button class="btn btn-primary" onclick="App.navigateTo('parser')">
              📝 Đóng góp đề mới
            </button>
            <button class="btn" onclick="App.navigateTo('materials')">
              📚 Đọc tài liệu (.txt)
            </button>
          </div>
        </div>

        <!-- Hub Tabs: Chính thức vs Đề Cộng đồng (Drafts) -->
        <div class="hub-tabs">
          <button class="hub-tab-btn ${this.currentHubTab === 'official' ? 'active' : ''}" onclick="App.switchHubTab('official')">
            🟢 Ngân hàng Chính thức <span class="badge-tab-count">${officialSubjects.length}</span>
          </button>
          <button class="hub-tab-btn ${this.currentHubTab === 'drafts' ? 'active' : ''}" onclick="App.switchHubTab('drafts')">
            ${isLogged ? `🟡 Đề Cộng đồng (Thử nghiệm) <span class="badge-tab-count">${draftSubjects.length}</span>` : `🔒 Đề Cộng đồng (${draftSubjects.length})`}
          </button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="search-filter-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
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
                <span class="creator-pill-tag">✨ Sứ Mệnh Học Thuật Sinh Viên DThu</span>
                <h3 class="mission-title">Hệ Thống Ôn Thi Trực Quan · Tự Học Mọi Lúc Mọi Nơi</h3>
                <p class="mission-desc">
                  DThu QuizMaster được xây dựng phi lợi nhuận với mục tiêu chuẩn hóa ngân hàng đề thi trắc nghiệm học phần, hỗ trợ giải thích chi tiết từng câu hỏi, đồng bộ tiến độ thời gian thực và tạo môi trường thi thử nghiêm túc, công bằng.
                </p>
                <div class="mission-pills-row">
                  <span class="mission-pill" id="heroLiveTrafficPill">👥 <strong>${traffic.onlineNow}</strong> sinh viên online</span>
                  <span class="mission-pill">👁️ <strong>${traffic.totalVisitsFormatted}</strong> lượt xem</span>
                  <span class="mission-pill">📝 <strong>${traffic.totalAttemptsFormatted}</strong> lượt thi thử</span>
                  <span class="mission-pill">⚡ Offline PWA</span>
                  <span class="mission-pill">☁️ Supabase Cloud</span>
                  <span class="mission-pill">🎯 Đề chuẩn DThu</span>
                </div>
              </div>
              <div class="home-mission-action">
                <button class="btn btn-primary btn-lg" onclick="App.openContactModal()" style="white-space: nowrap; padding: 14px 22px; font-weight: 800; font-size: 13.5px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);">
                  <span>📩 Gửi Góp Ý / Báo Lỗi Đề Thi</span>
                  <span>➔</span>
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
            ${isDraft ? '<span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700;">🧪 Thử nghiệm</span>' : `<span class="badge badge-gray">${cCount} chương</span>`}
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

    const all = this.currentHubTab === "official" ? StorageService.getSubjects() : StorageService.getDraftSubjects();
    const filtered = all.filter(s => {
      const matchQuery = s.name.toLowerCase().includes(query) || (s.code && s.code.toLowerCase().includes(query));
      const matchDept = dept === "all" || s.department === dept;
      return matchQuery && matchDept;
    });

    const grid = document.getElementById("subjectsGrid");
    if (grid) grid.innerHTML = this.renderSubjectCards(filtered, this.currentHubTab === "drafts");
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

    const allQuestions = sub.questions || [];
    const qCount = allQuestions.length;
    const chapters = sub.chapters || [];
    const latestScore = StorageService.getLatestScoreForSubject(sub.id);
    const activeTab = this.subjectDetailTab || "questions";
    const activeFilter = this.selectedChapterFilter || "all";
    const searchKeyword = (this.subjectSearchKeyword || "").toLowerCase().trim();

    // 1. Lọc theo Chương
    let filtered = (activeFilter === "all")
      ? allQuestions
      : allQuestions.filter(q => q.chapterId === activeFilter);

    // 2. Lọc theo Từ khóa tìm kiếm
    if (searchKeyword) {
      filtered = filtered.filter(q => {
        const qText = (q.question || "").toLowerCase();
        const optText = (q.options || []).map(o => (o.text || "").toLowerCase()).join(" ");
        const noteText = (q.options || []).map(o => (o.note || "").toLowerCase()).join(" ");
        return qText.includes(searchKeyword) || optText.includes(searchKeyword) || noteText.includes(searchKeyword);
      });
    }

    // 3. Phân trang (100 câu hỏi / 1 trang)
    const PAGE_SIZE = 100;
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    const currentPage = Math.min(Math.max(this.subjectQuestionPage || 0, 0), totalPages - 1);
    const pageQuestions = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
    const startIndex = filtered.length > 0 ? (currentPage * PAGE_SIZE + 1) : 0;
    const endIndex = Math.min((currentPage + 1) * PAGE_SIZE, filtered.length);

    // Tên chương đang lọc để hiển thị trên nút phễu
    let activeFilterName = "Tất cả chương";
    if (activeFilter !== "all") {
      const cObj = chapters.find(c => c.id === activeFilter);
      activeFilterName = cObj ? cObj.name : "Chương đã chọn";
    }

    container.innerHTML = `
      <div class="view-subject-detail" style="padding: 20px; max-width: 1150px; margin: 0 auto; width: 100%;">
        
        <!-- Back Navigation & Top Actions Bar -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
          <button class="btn btn-sm" onclick="App.navigateTo('manage')">
            ← Quay lại danh sách môn
          </button>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="App.openQuizConfigModal('${sub.id}')">
              🚀 Vào Ôn Thi Ngay
            </button>
            <button class="btn btn-sm" onclick="App.navigateTo('parser', { subjectId: '${sub.id}' })">
              📝 Nhập câu (Parser)
            </button>
            <button class="btn btn-sm" onclick="App.shuffleSubjectQuestions('${sub.id}')">
              🔄 Xáo trộn đề
            </button>
            <button class="btn btn-sm" onclick="ImportExportService.exportSubject('${sub.id}')">
              📥 Xuất JSON
            </button>
          </div>
        </div>

        <!-- Header Info Card -->
        <div class="detail-header-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px 24px; margin-bottom: 20px;">
          <div class="detail-header-top" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="subject-code-badge" style="font-size: 13.5px; font-weight: 700; padding: 4px 12px;">${sub.code || sub.id}</span>
                <span class="badge badge-blue">${sub.department || 'Đại học Đồng Tháp'}</span>
              </div>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                ${sub.name}
              </h2>
              <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5;">
                ${sub.description || 'Chưa có mô tả chi tiết cho môn học này.'}
              </p>
            </div>
            <button class="btn btn-sm" onclick="App.openEditSubjectModal('${sub.id}')">
              ✏️ Chỉnh sửa thông tin môn
            </button>
          </div>

          <!-- Stats Bar -->
          <div class="detail-stats-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border);">
            <div class="detail-stat-box">
              <div class="num" style="font-size: 22px; font-weight: 800; color: var(--brand-primary);">${qCount}</div>
              <div class="lbl" style="font-size: 12px; color: var(--text-tertiary);">Tổng số câu hỏi</div>
            </div>
            <div class="detail-stat-box">
              <div class="num" style="font-size: 22px; font-weight: 800; color: #8b5cf6;">${chapters.length}</div>
              <div class="lbl" style="font-size: 12px; color: var(--text-tertiary);">Số lượng chương</div>
            </div>
            <div class="detail-stat-box">
              <div class="num" style="font-size: 14.5px; font-weight: 700; padding-top: 4px; color: var(--text-primary);">${sub.author || 'Chưa cập nhật'}</div>
              <div class="lbl" style="font-size: 12px; color: var(--text-tertiary);">Người biên soạn</div>
            </div>
            <div class="detail-stat-box">
              <div class="num" style="font-size: 22px; font-weight: 800; color: var(--success);">${latestScore ? `${latestScore.score10}/10` : 'Chưa thi'}</div>
              <div class="lbl" style="font-size: 12px; color: var(--text-tertiary);">Điểm thi gần nhất</div>
            </div>
          </div>
        </div>

        <!-- 2 TAB NAVIGATION TOÀN MÀN HÌNH (FULL WIDTH) -->
        <div style="display: flex; gap: 8px; border-bottom: 2px solid var(--border); margin-bottom: 20px;">
          <button class="btn ${activeTab === 'questions' ? 'btn-primary' : ''}" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0; padding: 10px 20px; font-size: 14.5px; font-weight: 700; border-bottom: none;" onclick="App.switchSubjectDetailTab('questions')">
            📋 Ngân Hàng Câu Hỏi (${qCount})
          </button>
          <button class="btn ${activeTab === 'chapters' ? 'btn-primary' : ''}" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0; padding: 10px 20px; font-size: 14.5px; font-weight: 700; border-bottom: none;" onclick="App.switchSubjectDetailTab('chapters')">
            📂 Quản Lý Cấu Trúc Các Chương (${chapters.length})
          </button>
        </div>

        <!-- TAB CONTENT -->
        ${activeTab === 'questions' ? `
          <!-- TAB 1: NGÂN HÀNG CÂU HỎI (100% CHIỀU RỘNG) -->
          <div id="subjectQuestionsContainer" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px;">
            
            <!-- Thanh Tìm Kiếm + Icon Phễu Lọc + Các Nút Thao Tác -->
            <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 16px;">
              
              <!-- Khối Tìm Kiếm & Icon Phễu Lọc -->
              <div style="display: flex; gap: 8px; align-items: center; flex: 1; min-width: 260px; max-width: 600px;">
                <div style="position: relative; flex: 1;">
                  <input type="text" id="subjectQuestionSearchInput" class="form-control" placeholder="🔍 Tìm kiếm câu hỏi, nội dung đáp án..." value="${this.subjectSearchKeyword || ''}" oninput="App.onSubjectSearchInput(this.value)" style="padding-right: 32px; font-size: 13.5px;">
                  ${this.subjectSearchKeyword ? `
                    <button style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 14px; cursor: pointer; color: var(--text-tertiary);" onclick="App.clearSubjectSearch()">✕</button>
                  ` : ''}
                </div>

                <!-- Icon Cái Phễu Lọc Dropdown -->
                <div style="position: relative;">
                  <button class="btn ${activeFilter !== 'all' ? 'btn-primary' : ''}" style="padding: 8px 12px; display: flex; align-items: center; gap: 6px; font-size: 13.5px;" onclick="App.toggleChapterFilterMenu()" title="Lọc theo chương">
                    <span style="font-size: 15px;">🌪️</span>
                    <span style="font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px;">${activeFilterName}</span>
                    <span style="font-size: 9px; margin-left: 2px;">▼</span>
                  </button>

                  <!-- Popover Dropdown Danh Sách Chương -->
                  ${this.isChapterFilterMenuOpen ? `
                    <div style="position: absolute; top: calc(100% + 6px); left: 0; min-width: 260px; max-width: 320px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: 0 10px 25px rgba(0,0,0,0.18); z-index: 100; padding: 6px; display: flex; flex-direction: column; gap: 2px;">
                      <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); padding: 6px 10px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                        <span>Lọc theo chương</span>
                        <span style="cursor: pointer; font-size: 13px;" onclick="App.toggleChapterFilterMenu()">✕</span>
                      </div>
                      <button class="btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : ''}" style="width: 100%; text-align: left; justify-content: space-between; display: flex; align-items: center; border: none; margin-top: 4px; padding: 8px 10px; font-size: 13px;" onclick="App.selectChapterFilter('all')">
                        <span>📚 Tất cả chương</span>
                        <span class="badge ${activeFilter === 'all' ? 'badge-gray' : ''}">${allQuestions.length}</span>
                      </button>
                      ${chapters.map(c => {
                        const countInCh = allQuestions.filter(q => q.chapterId === c.id).length;
                        const isAct = (activeFilter === c.id);
                        return `
                          <button class="btn btn-sm ${isAct ? 'btn-primary' : ''}" style="width: 100%; text-align: left; justify-content: space-between; display: flex; align-items: center; border: none; padding: 8px 10px; font-size: 13px;" onclick="App.selectChapterFilter('${c.id}')">
                            <span style="max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.name}</span>
                            <span class="badge ${isAct ? 'badge-gray' : ''}">${countInCh}</span>
                          </button>
                        `;
                      }).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Nhóm Nút Thao Tác Câu Hỏi -->
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="App.openAddQuestionModal('${sub.id}', '${activeFilter}')">
                  ➕ Soạn câu hỏi mới
                </button>
                <button class="btn btn-sm" onclick="App.shuffleSubjectQuestions('${sub.id}')" title="Xáo trộn thứ tự các câu hỏi">
                  🔄 Xáo trộn
                </button>
                <button class="btn btn-sm btn-danger" onclick="App.clearAllQuestionsConfirm('${sub.id}')" title="Xóa toàn bộ câu hỏi của môn">
                  🗑️ Xóa tất cả
                </button>
              </div>
            </div>

            <!-- Thanh Trạng Thái & Phân Trang Trên -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; padding: 10px 14px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm);">
              <div style="font-size: 13px; color: var(--text-secondary);">
                Đang hiển thị <strong>${startIndex} - ${endIndex}</strong> trong tổng số <strong>${filtered.length}</strong> câu hỏi
                ${activeFilter !== 'all' ? `(đã lọc theo <em>${activeFilterName}</em>)` : ''}
                ${searchKeyword ? `(tìm kiếm: "<em>${this.subjectSearchKeyword}</em>")` : ''}
              </div>

              <!-- Điều Khiển Phân Trang -->
              ${totalPages > 1 ? `
                <div style="display: flex; gap: 4px; align-items: center;">
                  <button class="btn btn-sm" style="padding: 3px 10px; font-size: 12px;" ${currentPage === 0 ? 'disabled' : ''} onclick="App.changeSubjectQuestionPage(${currentPage - 1})">
                    ◀ Trước
                  </button>
                  <span style="font-size: 12.5px; font-weight: 700; padding: 0 6px;">
                    Trang ${currentPage + 1} / ${totalPages}
                  </span>
                  <button class="btn btn-sm" style="padding: 3px 10px; font-size: 12px;" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="App.changeSubjectQuestionPage(${currentPage + 1})">
                    Sau ▶
                  </button>
                </div>
              ` : ''}
            </div>

            <!-- Danh Sách Câu Hỏi (100 câu/trang) -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${filtered.length === 0 ? `
                <div style="text-align: center; padding: 50px 20px; color: var(--text-tertiary); font-size: 14px;">
                  <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                  Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.<br>
                  <div style="display: flex; gap: 8px; justify-content: center; margin-top: 14px;">
                    ${searchKeyword ? `<button class="btn btn-sm" onclick="App.clearSubjectSearch()">Xóa tìm kiếm</button>` : ''}
                    ${activeFilter !== 'all' ? `<button class="btn btn-sm" onclick="App.selectChapterFilter('all')">Xem tất cả chương</button>` : ''}
                    <button class="btn btn-sm btn-primary" onclick="App.openAddQuestionModal('${sub.id}', '${activeFilter}')">➕ Soạn câu hỏi mới</button>
                  </div>
                </div>
              ` : pageQuestions.map((q, qIdx) => {
                const globalIndex = currentPage * PAGE_SIZE + qIdx + 1;
                const chapObj = chapters.find(c => c.id === q.chapterId);
                const chapName = chapObj ? chapObj.name : (q.chapterId || 'Chương 1');
                return `
                  <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px 18px;">
                    
                    <!-- Header Câu Hỏi -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="badge badge-gray" style="font-weight: 800; font-size: 12.5px;">Câu ${globalIndex}</span>
                        <span class="badge badge-blue" style="font-size: 11.5px;">${chapName}</span>
                        <span class="badge" style="background:#16a34a; color:#ffffff; font-size: 11.5px; font-weight:700; padding: 3px 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(22,163,74,0.2);">
                          ✓ Đáp án đúng: ${App.letters[q.answerIndex] || 'A'}
                        </span>
                      </div>
                      <div style="display: flex; gap: 4px;">
                        <button class="btn btn-sm" style="padding: 3px 10px; font-size: 12px;" onclick="App.openEditQuestionModal('${sub.id}', '${q.id}')" title="Sửa nội dung câu hỏi">
                          ✏️ Sửa
                        </button>
                        <button class="btn btn-sm" style="padding: 3px 10px; font-size: 12px;" onclick="App.openMoveQuestionModal('${sub.id}', '${q.id}')" title="Đổi sang chương khác">
                          🔀 Đổi chương
                        </button>
                        <button class="btn btn-sm btn-danger" style="padding: 3px 8px; font-size: 12px;" onclick="App.deleteQuestionFromSubject('${sub.id}', '${q.id}')" title="Xóa câu này">
                          🗑️
                        </button>
                      </div>
                    </div>

                    <!-- Nội Dung Câu Hỏi -->
                    <div style="font-size: 14.5px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary); line-height: 1.5;">
                      ${SmartParserService.formatRichText(q.question)}
                    </div>

                    <!-- Các Phương Án Lựa Chọn (Mỗi Hàng 1 Lựa Chọn Dọc Xuống Dòng Rõ Ràng) -->
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; width: 100%;">
                      ${(q.options || []).map((opt, optIdx) => {
                        const isAns = (optIdx === q.answerIndex);
                        return `
                          <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; padding: 10px 14px; border-radius: 6px; border: ${isAns ? '1.5px solid #16a34a' : '1px solid #cbd5e1'}; background: ${isAns ? '#dcfce7' : '#ffffff'}; box-shadow: ${isAns ? '0 1px 3px rgba(22, 163, 74, 0.15)' : 'none'}; width: 100%; box-sizing: border-box;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; min-width: 24px; background: ${isAns ? '#16a34a' : '#f1f5f9'}; color: ${isAns ? '#ffffff' : '#475569'}; border: ${isAns ? 'none' : '1px solid #cbd5e1'}; border-radius: 4px; font-weight: 800; font-size: 12.5px; flex-shrink: 0; margin-top: 1px;">
                              ${App.letters[optIdx]}
                            </span>
                            <div style="font-weight: ${isAns ? '700' : '400'}; color: ${isAns ? '#14532d' : '#334155'}; flex: 1; min-width: 0; word-break: break-word; overflow-wrap: break-word; line-height: 1.5;">
                              ${SmartParserService.formatRichText(opt.text || '')}
                            </div>
                            ${isAns ? `
                              <span style="margin-left: 8px; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0;">
                                ✓ Đúng
                              </span>
                            ` : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>

                    <!-- Giải Thích Đáp Án (Nếu Có) -->
                    ${(q.options && q.options[q.answerIndex] && q.options[q.answerIndex].note) ? `
                      <div style="font-size: 13px; color: #14532d; background: #f0fdf4; padding: 10px 14px; border-radius: 6px; border: 1.5px dashed #22c55e; margin-top: 8px;">
                        💡 <strong>Giải thích:</strong> ${SmartParserService.formatRichText(q.options[q.answerIndex].note)}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Điều Khiển Phân Trang Dưới Cùng -->
            ${totalPages > 1 ? `
              <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
                <button class="btn btn-sm" ${currentPage === 0 ? 'disabled' : ''} onclick="App.changeSubjectQuestionPage(${currentPage - 1})">
                  ◀ Trang trước
                </button>
                <div style="display: flex; gap: 4px;">
                  ${Array.from({ length: totalPages }, (_, i) => `
                    <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : ''}" style="min-width: 32px; padding: 4px 8px; font-size: 12px;" onclick="App.changeSubjectQuestionPage(${i})">
                      ${i + 1}
                    </button>
                  `).join('')}
                </div>
                <button class="btn btn-sm" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="App.changeSubjectQuestionPage(${currentPage + 1})">
                  Trang sau ▶
                </button>
              </div>
            ` : ''}

          </div>
        ` : `
          <!-- TAB 2: QUẢN LÝ CẤU TRÚC CÁC CHƯƠNG (100% CHIỀU RỘNG) -->
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">
                  📂 Danh Sách Các Chương (${chapters.length})
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary);">
                  Phân loại câu hỏi theo từng chương giúp sinh viên ôn tập theo chuyên đề hiệu quả.
                </p>
              </div>
              <button class="btn btn-primary" onclick="App.openAddChapterModal('${sub.id}')">
                ➕ Thêm chương mới
              </button>
            </div>

            <!-- Danh Sách Các Chương Dạng Thẻ Rộng Rãi -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${chapters.length === 0 ? `
                <div style="text-align: center; padding: 40px 16px; color: var(--text-tertiary); font-size: 14px;">
                  <div style="font-size: 40px; margin-bottom: 10px;">📂</div>
                  Môn học này chưa có chương nào.<br>
                  Bấm <strong>"➕ Thêm chương mới"</strong> để bắt đầu chia nhóm câu hỏi.
                </div>
              ` : chapters.map(c => {
                const countInCh = allQuestions.filter(q => q.chapterId === c.id).length;
                return `
                  <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                    <div style="flex: 1; min-width: 250px;">
                      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                        <h4 style="font-size: 15.5px; font-weight: 800; color: var(--text-primary); margin: 0;">
                          ${c.name}
                        </h4>
                        <span class="badge badge-blue" style="font-size: 12px;">
                          ${countInCh} câu hỏi
                        </span>
                        <span class="badge badge-gray" style="font-size: 11px;">
                          Mã: ${c.id}
                        </span>
                      </div>
                      ${c.description ? `
                        <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 0 0; line-height: 1.4;">
                          ${c.description}
                        </p>
                      ` : `
                        <p style="font-size: 12.5px; color: var(--text-tertiary); margin: 4px 0 0 0; font-style: italic;">
                          Chưa có mô tả nội dung cho chương này.
                        </p>
                      `}
                    </div>

                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      <button class="btn btn-sm btn-primary" onclick="App.viewChapterQuestions('${sub.id}', '${c.id}')" title="Xem các câu hỏi thuộc chương này">
                        👁️ Xem câu hỏi (${countInCh})
                      </button>
                      <button class="btn btn-sm" onclick="App.openEditChapterModal('${sub.id}', '${c.id}')" title="Sửa tên và mô tả chương">
                        ✏️ Sửa
                      </button>
                      <button class="btn btn-sm btn-danger" onclick="App.deleteChapter('${sub.id}', '${c.id}')" title="Xóa chương này">
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `}

      </div>
    `;
  },

  switchSubjectDetailTab(tab) {
    this.subjectDetailTab = tab;
    this.isChapterFilterMenuOpen = false;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
    }
  },

  toggleChapterFilterMenu() {
    this.isChapterFilterMenuOpen = !this.isChapterFilterMenuOpen;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
    }
  },

  selectChapterFilter(chapId) {
    this.selectedChapterFilter = chapId;
    this.subjectQuestionPage = 0;
    this.isChapterFilterMenuOpen = false;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
    }
  },

  onSubjectSearchInput(value) {
    this.subjectSearchKeyword = (value || "").trim();
    this.subjectQuestionPage = 0;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
      const input = document.getElementById("subjectQuestionSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  },

  clearSubjectSearch() {
    this.subjectSearchKeyword = "";
    this.subjectQuestionPage = 0;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
    }
  },

  changeSubjectQuestionPage(pageIndex) {
    this.subjectQuestionPage = pageIndex;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
      const listEl = document.getElementById("subjectQuestionsContainer");
      if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  viewChapterQuestions(subjectId, chapterId) {
    this.subjectDetailTab = "questions";
    this.selectedChapterFilter = chapterId;
    this.subjectQuestionPage = 0;
    this.isChapterFilterMenuOpen = false;
    this.navigateTo("subject-detail", { subjectId: subjectId });
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
      this.showToast("⚠️ Vui lòng nhập đầy đủ Tên môn học và Mã môn học!", "warning");
      return;
    }

    sub.name = name;
    sub.code = code;
    sub.department = dept;
    sub.author = author;
    sub.description = desc;

    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã cập nhật thông tin môn học!", "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  // Modal Thêm chương mới (Modal chuẩn thay cho prompt)
  openAddChapterModal(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const nextIndex = (sub.chapters || []).length + 1;
    title.textContent = "➕ Thêm Chương Mới";

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên chương (*):</label>
        <input type="text" id="newChapterName" class="form-control" value="Chương ${nextIndex}: " placeholder="Ví dụ: Chương 1: Giới thiệu chung...">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả chương (Tùy chọn):</label>
        <textarea id="newChapterDesc" class="form-control" rows="2" placeholder="Ghi chú thêm về nội dung chương này..."></textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveNewChapter('${sub.id}')">Thêm chương</button>
    `;

    modal.classList.add("active");
  },

  saveNewChapter(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const name = document.getElementById("newChapterName")?.value.trim();
    const desc = document.getElementById("newChapterDesc")?.value.trim() || "";

    if (!name) {
      this.showToast("⚠️ Vui lòng nhập tên chương!", "warning");
      return;
    }

    if (!sub.chapters) sub.chapters = [];
    const nextIndex = sub.chapters.length + 1;
    const newChap = {
      id: `c${nextIndex}`,
      name: name,
      description: desc
    };

    sub.chapters.push(newChap);
    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast(`🎉 Đã thêm "${name}" thành công!`, "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  // Modal Sửa tên & mô tả chương
  openEditChapterModal(subjectId, chapterId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.chapters) return;

    const chap = sub.chapters.find(c => c.id === chapterId);
    if (!chap) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `✏️ Chỉnh Sửa Chương: ${chap.name}`;

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên chương (*):</label>
        <input type="text" id="editChapterName" class="form-control" value="${(chap.name || '').replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả chương:</label>
        <textarea id="editChapterDesc" class="form-control" rows="2">${chap.description || ''}</textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedChapter('${sub.id}', '${chap.id}')">Lưu thay đổi</button>
    `;

    modal.classList.add("active");
  },

  saveEditedChapter(subjectId, chapterId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.chapters) return;

    const chap = sub.chapters.find(c => c.id === chapterId);
    if (!chap) return;

    const name = document.getElementById("editChapterName")?.value.trim();
    const desc = document.getElementById("editChapterDesc")?.value.trim() || "";

    if (!name) {
      this.showToast("⚠️ Vui lòng nhập tên chương!", "warning");
      return;
    }

    chap.name = name;
    chap.description = desc;

    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã cập nhật chương thành công!", "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  deleteChapter(subjectId, chapterId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa chương",
      message: "Bạn có chắc chắn muốn xóa chương này không? Các câu hỏi thuộc chương này vẫn sẽ được giữ lại an toàn trong môn học.",
      icon: "🗑️",
      confirmText: "Xóa chương",
      isDanger: true,
      warningKey: "delete_chapter",
      onConfirm: () => {
        const sub = StorageService.getSubjectById(subjectId);
        if (sub) {
          sub.chapters = (sub.chapters || []).filter(c => c.id !== chapterId);
          if (this.selectedChapterFilter === chapterId) this.selectedChapterFilter = "all";
          StorageService.saveSubject(sub);
          this.navigateTo("subject-detail", { subjectId: sub.id });
        }
      }
    });
  },

  // Modal Soạn Câu Hỏi Mới Trực Tiếp Vào Môn Học
  openAddQuestionModal(subjectId, preselectedChapterId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "➕ Soạn Câu Hỏi Mới";

    const chapters = sub.chapters || [{ id: "c1", name: "Chương 1: Mở đầu" }];
    const defaultChap = (preselectedChapterId && preselectedChapterId !== "all") ? preselectedChapterId : (chapters[0]?.id || "c1");

    body.innerHTML = `
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label" style="font-size: 13px;">Gán vào chương (*):</label>
        <select id="newQChapter" class="form-control">
          ${chapters.map(c => `<option value="${c.id}" ${c.id === defaultChap ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 14px;">
        <label class="form-label" style="font-size: 13px; font-weight: 700;">Nội dung câu hỏi (*):</label>
        <textarea id="newQText" class="form-control" rows="3" placeholder="Nhập câu hỏi..."></textarea>
      </div>

      <div style="margin-bottom: 14px;">
        <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
          Các phương án lựa chọn (Tích chọn nút tròn để chọn đáp án đúng):
        </label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${[0, 1, 2, 3].map(oi => `
            <div style="display: flex; gap: 8px; align-items: center; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 10px;">
              <input type="radio" name="newQAnswer" id="newQAns_${oi}" value="${oi}" ${oi === 0 ? 'checked' : ''} style="transform: scale(1.1); cursor: pointer;">
              <label for="newQAns_${oi}" style="font-weight: 800; cursor: pointer; min-width: 20px;">${App.letters[oi]}.</label>
              <input type="text" id="newQOpt_${oi}" class="form-control" placeholder="Phương án ${App.letters[oi]}..." style="font-size: 13px;">
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-group" style="margin: 0;">
        <label class="form-label" style="font-size: 13px;">Giải thích đáp án (Tùy chọn):</label>
        <input type="text" id="newQNote" class="form-control" placeholder="Ghi chú / Giải thích tại sao đáp án này đúng...">
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveNewQuestionToSubject('${sub.id}')">Lưu câu hỏi</button>
    `;

    modal.classList.add("active");
  },

  saveNewQuestionToSubject(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const qText = document.getElementById("newQText")?.value.trim();
    const chapterId = document.getElementById("newQChapter")?.value || "c1";
    const note = document.getElementById("newQNote")?.value.trim() || "";

    if (!qText) {
      this.showToast("⚠️ Vui lòng nhập nội dung câu hỏi!", "warning");
      return;
    }

    const radios = document.querySelectorAll('input[name="newQAnswer"]');
    let selectedAns = 0;
    radios.forEach(r => {
      if (r.checked) selectedAns = parseInt(r.value, 10);
    });

    const options = [0, 1, 2, 3].map(oi => {
      const optText = document.getElementById(`newQOpt_${oi}`)?.value.trim() || `Phương án ${this.letters[oi]}`;
      return {
        text: optText,
        isCorrect: (oi === selectedAns),
        note: (oi === selectedAns ? note : "")
      };
    });

    if (!sub.questions) sub.questions = [];
    const newQuestion = {
      id: `q-${Date.now()}-${sub.questions.length + 1}`,
      chapterId: chapterId,
      question: qText,
      options: options,
      answerIndex: selectedAns
    };

    sub.questions.push(newQuestion);
    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("🎉 Đã thêm câu hỏi mới thành công!", "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  // Modal Sửa Câu Hỏi Trong Môn Học
  openEditQuestionModal(subjectId, questionId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions) return;

    const q = sub.questions.find(item => item.id === questionId);
    if (!q) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "✏️ Chỉnh Sửa Câu Hỏi";
    const chapters = sub.chapters || [{ id: "c1", name: "Chương 1: Mở đầu" }];

    body.innerHTML = `
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label" style="font-size: 13px;">Chương (*):</label>
        <select id="editQChapter" class="form-control">
          ${chapters.map(c => `<option value="${c.id}" ${c.id === q.chapterId ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 14px;">
        <label class="form-label" style="font-size: 13px; font-weight: 700;">Nội dung câu hỏi (*):</label>
        <textarea id="editQText" class="form-control" rows="3">${q.question || ''}</textarea>
      </div>

      <div style="margin-bottom: 14px;">
        <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
          Các phương án lựa chọn (Tích chọn nút tròn để chọn đáp án đúng):
        </label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${[0, 1, 2, 3].map(oi => {
            const opt = (q.options && q.options[oi]) ? q.options[oi] : { text: '', note: '' };
            const isCorrect = (q.answerIndex === oi);
            return `
              <div style="display: flex; gap: 8px; align-items: center; background: ${isCorrect ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isCorrect ? '#86efac' : 'var(--border)'}; border-radius: var(--radius-sm); padding: 8px 10px;">
                <input type="radio" name="editQAnswer" id="editQAns_${oi}" value="${oi}" ${isCorrect ? 'checked' : ''} style="transform: scale(1.1); cursor: pointer;">
                <label for="editQAns_${oi}" style="font-weight: 800; cursor: pointer; min-width: 20px;">${App.letters[oi]}.</label>
                <input type="text" id="editQOpt_${oi}" class="form-control" value="${(opt.text || '').replace(/"/g, '&quot;')}" style="font-size: 13px;">
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="form-group" style="margin: 0;">
        <label class="form-label" style="font-size: 13px;">Giải thích đáp án:</label>
        <input type="text" id="editQNote" class="form-control" value="${(q.options && q.options[q.answerIndex] && q.options[q.answerIndex].note ? q.options[q.answerIndex].note : '').replace(/"/g, '&quot;')}" placeholder="Ghi chú / Giải thích...">
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedQuestionToSubject('${sub.id}', '${q.id}')">Lưu thay đổi</button>
    `;

    modal.classList.add("active");
  },

  saveEditedQuestionToSubject(subjectId, questionId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions) return;

    const q = sub.questions.find(item => item.id === questionId);
    if (!q) return;

    const qText = document.getElementById("editQText")?.value.trim();
    const chapterId = document.getElementById("editQChapter")?.value || "c1";
    const note = document.getElementById("editQNote")?.value.trim() || "";

    if (!qText) {
      this.showToast("⚠️ Vui lòng nhập nội dung câu hỏi!", "warning");
      return;
    }

    const radios = document.querySelectorAll('input[name="editQAnswer"]');
    let selectedAns = 0;
    radios.forEach(r => {
      if (r.checked) selectedAns = parseInt(r.value, 10);
    });

    const options = [0, 1, 2, 3].map(oi => {
      const optText = document.getElementById(`editQOpt_${oi}`)?.value.trim() || `Phương án ${this.letters[oi]}`;
      return {
        text: optText,
        isCorrect: (oi === selectedAns),
        note: (oi === selectedAns ? note : "")
      };
    });

    q.question = qText;
    q.chapterId = chapterId;
    q.options = options;
    q.answerIndex = selectedAns;

    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã cập nhật câu hỏi thành công!", "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  // Modal Đổi Chương Cho Câu Hỏi
  openMoveQuestionModal(subjectId, questionId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions) return;

    const q = sub.questions.find(item => item.id === questionId);
    if (!q) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "🔀 Chuyển Câu Hỏi Sang Chương Khác";
    const chapters = sub.chapters || [{ id: "c1", name: "Chương 1: Mở đầu" }];

    body.innerHTML = `
      <div style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 12px;">
        Đang chuyển: <strong>${SmartParserService.formatRichText(q.question).slice(0, 80)}...</strong>
      </div>
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Chọn chương đích:</label>
        <select id="moveTargetChapter" class="form-control">
          ${chapters.map(c => `<option value="${c.id}" ${c.id === q.chapterId ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveMoveQuestion('${sub.id}', '${q.id}')">Xác nhận chuyển</button>
    `;

    modal.classList.add("active");
  },

  saveMoveQuestion(subjectId, questionId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions) return;

    const q = sub.questions.find(item => item.id === questionId);
    if (!q) return;

    const targetChap = document.getElementById("moveTargetChapter")?.value;
    if (targetChap) {
      q.chapterId = targetChap;
      StorageService.saveSubject(sub);
      this.closeModal();
      this.showToast("✅ Đã chuyển câu hỏi sang chương mới!", "success", 2500);
      this.navigateTo("subject-detail", { subjectId: sub.id });
    }
  },

  // Xáo trộn thứ tự câu hỏi (Shuffle)
  shuffleSubjectQuestions(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions || sub.questions.length < 2) {
      this.showToast("⚠️ Cần ít nhất 2 câu hỏi để xáo trộn!", "warning");
      return;
    }

    // Fisher-Yates shuffle
    const arr = sub.questions;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    StorageService.saveSubject(sub);
    this.showToast("🎉 Đã xáo trộn ngẫu nhiên thứ tự toàn bộ câu hỏi!", "success", 3000);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  // Xóa toàn bộ câu hỏi của môn
  clearAllQuestionsConfirm(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions || sub.questions.length === 0) {
      this.showToast("⚠️ Môn học này hiện không có câu hỏi nào để xóa!", "info");
      return;
    }

    this.showConfirmDialog({
      title: "Xác nhận xóa toàn bộ câu hỏi",
      message: `Bạn có chắc chắn muốn xóa TOÀN BỘ ${sub.questions.length} câu hỏi của môn "${sub.name}" không? Hành động này sẽ xóa cả trên máy và Cloud.`,
      icon: "⚠️",
      confirmText: "Xóa toàn bộ câu hỏi",
      isDanger: true,
      warningKey: "clear_all_questions",
      onConfirm: () => {
        sub.questions = [];
        StorageService.saveSubject(sub);
        this.showToast("🗑️ Đã xóa toàn bộ câu hỏi của môn học!", "info", 3000);
        this.navigateTo("subject-detail", { subjectId: sub.id });
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
    if (!StorageService.isLoggedIn()) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="font-size: 52px; margin-bottom: 14px;">📝</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Công Cụ Nhập Đề & Đóng Góp Đề Thi</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Vui lòng đăng nhập tài khoản sinh viên DThu để sử dụng công cụ bóc tách câu hỏi thông minh và gửi đóng góp đề thi lên hệ thống (+30 EXP).
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 22px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()">🔑 Đăng Nhập Ngay ➔</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
          </div>
        </div>
      `;
      return;
    }

    const subjects = StorageService.getSubjects();
    const defaultSubId = preselectedSubjectId || (subjects[0] ? subjects[0].id : "");

    container.innerHTML = `
      <div class="view-parser">
        <!-- Top Navigation Header -->
        <div class="parser-top-header">
          <div class="parser-top-left">
            <button class="btn btn-sm btn-back-nav" onclick="App.navigateBackOrHome()" title="Quay lại trang trước">
              ⬅️ Quay Lại
            </button>
            <div class="parser-header-title-box">
              <h2>📝 Công Cụ Nhập & Bóc Tách Đề Thi Tự Động</h2>
              <p>Tải tệp tin (.docx Word, .pdf text, .txt, .md) hoặc Dán văn bản trắc nghiệm để trích xuất đề thi thông minh</p>
            </div>
          </div>
          <div class="parser-top-right">
            <button class="btn btn-sm btn-primary" onclick="App.navigateTo('syntax-guide', { from: 'parser', subjectId: '${defaultSubId}' })">
              💡 Cú pháp ký tự ➔
            </button>
          </div>
        </div>

        <div class="parser-main-layout">
          <!-- Left Panel: Raw Input & File Upload Area -->
          <div class="parser-panel" id="parserDropzone" ondragover="App.handleParserDragOver(event)" ondragleave="App.handleParserDragLeave(event)" ondrop="App.handleParserFileDrop(event)">
            <div class="parser-panel-header">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h3>📝 1. Nhập hoặc Tải Tệp Đề</h3>
                <span id="parserFileLoadedBadge" class="badge badge-blue" style="display: none; font-size: 11px;"></span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <input type="file" id="parserFileInput" accept=".txt,.docx,.pdf,.md,.json,.csv,.text" style="display: none;" onchange="App.handleParserFileUpload(event)">
                <button class="btn btn-sm btn-upload-doc" onclick="document.getElementById('parserFileInput').click()" title="Tải tệp Word (.docx), PDF hoặc TXT">
                  📂 Tải tệp lên
                </button>
                <button class="btn btn-sm" onclick="App.loadParserSampleText()">Dán mẫu</button>
                <button class="btn btn-sm" onclick="App.clearParserInput()">Xóa</button>
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

            <!-- Drag & Drop Hint Dropzone Bar -->
            <div class="parser-drop-hint" onclick="document.getElementById('parserFileInput').click()">
              <span>📎 Kéo thả tệp tin hoặc bấm vào đây để nạp: <strong>.docx (Word)</strong>, <strong>.pdf (Text)</strong>, <strong>.txt</strong>, <strong>.md</strong></span>
            </div>

            <textarea id="rawTextarea" class="parser-textarea" placeholder="Dán văn bản câu hỏi từ Word, PDF, ChatGPT hoặc Kéo thả tệp tin vào đây...

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
                Vui lòng tải tệp hoặc dán văn bản câu hỏi ở khung bên trái để xem kết quả phân tích tự động.
              </div>
            </div>

            <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-primary" id="btnSaveToSubject" onclick="App.saveParsedQuestionsToDraft()" disabled>
                🚀 Lưu Bộ Đề Vào Hệ Thống (Chờ Duyệt) ➔
              </button>
              <button class="btn" id="btnDownloadJson" onclick="App.downloadParsedAsJson()" disabled>
                📥 Tải file JSON
              </button>
              <button class="btn" id="btnCopyJson" onclick="App.copyParsedJsonToClipboard()" disabled>
                📋 Sao chép JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Cập nhật danh sách chương theo môn được chọn
    this.onParserSubjectChange();
  },

  // ── Xử lý Tải Tệp Đề Thi (.docx, .pdf, .txt, .md, .json) vào Parser ──
  async handleParserFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    await this.processParserFile(file);
    event.target.value = "";
  },

  handleParserDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById("parserDropzone");
    if (dropzone) dropzone.classList.add("dragover");
  },

  handleParserDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById("parserDropzone");
    if (dropzone) dropzone.classList.remove("dragover");
  },

  async handleParserFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById("parserDropzone");
    if (dropzone) dropzone.classList.remove("dragover");

    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    await this.processParserFile(file);
  },

  async processParserFile(file) {
    try {
      this.showToast(`⏳ Đang trích xuất nội dung từ tệp "${file.name}"...`, "info", 2500);
      const text = await SmartParserService.extractTextFromFile(file);
      
      const textarea = document.getElementById("rawTextarea");
      if (textarea) {
        textarea.value = text;
      }

      const badge = document.getElementById("parserFileLoadedBadge");
      if (badge) {
        badge.style.display = "inline-flex";
        badge.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      }

      this.onParserInput(true);
      const count = this.currentParsedQuestions ? this.currentParsedQuestions.length : 0;
      if (count > 0) {
        this.showToast(`🎉 Đã trích xuất thành công ${count} câu hỏi từ tệp "${file.name}"!`, "success", 4000);
      } else {
        this.showToast(`ℹ️ Đã nạp nội dung tệp. Vui lòng kiểm tra lại cấu trúc câu hỏi.`, "info", 3500);
      }
    } catch (err) {
      console.error("processParserFile error:", err);
      this.showToast(`❌ Lỗi: ${err.message}`, "danger", 4500);
    }
  },

  saveParsedQuestionsToDraft() {
    if (!this.currentParsedQuestions || this.currentParsedQuestions.length === 0) {
      this.showToast("⚠️ Chưa có câu hỏi nào để lưu!", "warning");
      return;
    }

    const subId = document.getElementById("parserSubjectSelect")?.value;
    const chapterId = document.getElementById("parserChapterSelect")?.value || "c1";
    const sub = StorageService.getSubjectById(subId);
    const profile = StorageService.getUserProfile();

    const mappedQuestions = this.currentParsedQuestions.map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
      chapterId: chapterId
    }));

    const draftData = {
      targetSubjectId: sub ? sub.id : null,
      targetChapterId: chapterId,
      code: sub ? sub.code : "GEN101",
      name: sub ? sub.name : "Bộ đề mới",
      department: sub ? sub.department : profile.department,
      author: profile.fullName + ` (MSSV: ${profile.studentId || 'DThu'})`,
      authorEmail: profile.email || "",
      description: `Bộ đề gồm ${mappedQuestions.length} câu hỏi môn ${sub ? sub.name : ''} (Chương: ${chapterId}), nhập qua Parser ngày ${new Date().toLocaleDateString('vi-VN')}.`,
      icon: sub ? (sub.icon || "📝") : "📝",
      chapters: sub && sub.chapters ? sub.chapters : [{ id: "c1", name: "Chương 1: Mở đầu" }],
      questions: mappedQuestions
    };

    StorageService.addDraftSubject(draftData);

    this.showToast(`🎉 Đã lưu ${mappedQuestions.length} câu hỏi vào danh sách Chờ Phê Duyệt! (Điểm Cống Hiến CP sẽ được trao khi Ban biên tập phê duyệt đề).`, "success", 4500);
    this.renderHeader();

    // Tự động chuyển sang trang Quản Lý Bộ Đề, tab "Chờ duyệt"
    this.adminSubjectTab = "drafts";
    this.navigateTo("manage");
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
    this.showToast(`🎉 Đã thêm ${this.currentParsedQuestions.length} câu hỏi mới vào môn "${sub.name}"!`, "success", 3500);
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
      this.showToast("📋 Đã sao chép toàn bộ mã JSON câu hỏi vào Clipboard!", "success", 3000);
    }).catch(err => {
      this.showToast("Không thể sao chép: " + err, "danger", 3000);
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 4. TRANG THIẾT LẬP BÀI THI & ÔN TẬP TOÀN DIỆN (QUIZ SETUP VIEW)
  // ═════════════════════════════════════════════════════════════════════════
  openQuizConfigModal(subjectId) {
    this.navigateTo("quiz-setup", { subjectId });
  },

  renderQuizSetupView(container, subjectId) {
    const subject = StorageService.getSubjectById(subjectId || this.quizSetupSubjectId);
    if (!subject) {
      this.showToast("⚠️ Không tìm thấy thông tin môn học!", "warning");
      this.navigateTo("home");
      return;
    }

    this.activeSubject = subject;
    this.quizSetupSubjectId = subject.id;
    const isLogged = StorageService.isLoggedIn();

    // Khởi tạo state cấu hình nếu chưa có hoặc khi đổi môn
    if (!this.quizSetupState || this.quizSetupState.subjectId !== subject.id) {
      this.quizSetupState = {
        subjectId: subject.id,
        mode: isLogged ? "practice" : "exam", // 'practice' hoặc 'exam'
        instantFeedback: true, // Hiện đáp án ngay sau mỗi câu
        autoExpandNotes: true, // Mở giải thích chi tiết
        repeatMistakes: false, // Lặp lại câu sai đến khi đúng
        timePreset: "auto", // 'auto', '15', '30', '45', '60', '90', 'custom'
        customTimeMinutes: "",
        warnTime: true,
        autoSubmitOnTimeout: true,
        questionCount: "all", // 'all', '10', '20', '30', '40', '50', '100', 'custom'
        customQuestionCount: "",
        shuffleQuestions: true,
        shuffleOptions: true,
        selectedChapters: ["all"]
      };
    }

    const state = this.quizSetupState;
    const allQuestions = subject.questions || [];
    const chapters = subject.chapters || [];

    // Tính toán số câu hỏi khả dụng theo phạm vi chương đã chọn
    let availableQuestions = allQuestions;
    const isAllChapters = state.selectedChapters.includes("all") || state.selectedChapters.length === 0;
    if (!isAllChapters) {
      availableQuestions = allQuestions.filter(q => state.selectedChapters.includes(q.chapterId));
    }
    const poolCount = availableQuestions.length;

    // Số câu thực tế sẽ làm
    let targetQuestionCount = poolCount;
    if (state.questionCount === "custom") {
      const parsed = parseInt(state.customQuestionCount, 10);
      targetQuestionCount = (!isNaN(parsed) && parsed > 0) ? Math.min(parsed, poolCount) : poolCount;
    } else if (state.questionCount !== "all") {
      const parsed = parseInt(state.questionCount, 10);
      targetQuestionCount = (!isNaN(parsed) && parsed > 0) ? Math.min(parsed, poolCount) : poolCount;
    }

    // Thời gian ước tính
    let timeDisplayText = "Không giới hạn";
    if (state.mode === "exam") {
      if (state.timePreset === "auto") {
        const mins = Math.max(5, Math.ceil(targetQuestionCount * 1.0));
        timeDisplayText = `${mins} phút (${targetQuestionCount} câu × 1p)`;
      } else if (state.timePreset === "custom") {
        const mins = parseInt(state.customTimeMinutes, 10) || 45;
        timeDisplayText = `${mins} phút (Tự đặt)`;
      } else {
        timeDisplayText = `${state.timePreset} phút`;
      }
    }

    container.innerHTML = `
      <div class="view-quiz-setup" style="padding: 24px 20px; max-width: 1100px; margin: 0 auto; width: 100%;">
        
        <!-- Breadcrumb & Top Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
            <button class="btn btn-sm" onclick="App.navigateTo('home')">🏠 Trang chủ</button>
            <span>/</span>
            <button class="btn btn-sm" onclick="App.navigateTo('subject-detail', { subjectId: '${subject.id}' })">📚 ${subject.name}</button>
            <span>/</span>
            <span style="font-weight: 700; color: var(--text-primary);">⚙️ Thiết lập bài làm</span>
          </div>

          <button class="btn btn-sm" onclick="App.navigateTo('home')">
            ← Quay lại danh sách môn
          </button>
        </div>

        <!-- Layout 2 Cột: Bên Trái là Form Cấu Hình, Bên Phải là Sticky Summary -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; align-items: start;">
          
          <!-- CỘT TRÁI: 3 KHU VỰC CẤU HÌNH -->
          <div style="display: flex; flex-direction: column; gap: 22px;">

            <!-- ── KHU VỰC 1: CHẾ ĐỘ LÀM BÀI ─────────────────────────────── -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                <span style="font-size: 18px;">🎯</span>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">
                  1. Chọn Chế Độ Làm Bài
                </h3>
              </div>

              <!-- 2 Cards Chọn Chế Độ -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <!-- Tab Ôn Tập -->
                <div 
                  onclick="App.setQuizSetupMode('practice')" 
                  style="border: 2px solid ${state.mode === 'practice' ? 'var(--brand-primary)' : 'var(--border)'}; background: ${state.mode === 'practice' ? '#f0fdf4' : 'var(--surface)'}; padding: 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease; position: relative;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <strong style="font-size: 15px; color: ${state.mode === 'practice' ? '#15803d' : 'var(--text-primary)'};">
                      🟢 Chế Độ Ôn Tập
                    </strong>
                    <input type="radio" name="setupModeRadio" ${state.mode === 'practice' ? 'checked' : ''} style="cursor: pointer;">
                  </div>
                  <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                    Tự do củng cố kiến thức, học tới đâu xem đáp án & giải thích tới đó, không áp lực thời gian.
                  </p>
                </div>

                <!-- Tab Thi Thử -->
                <div 
                  onclick="App.setQuizSetupMode('exam')" 
                  style="border: 2px solid ${state.mode === 'exam' ? 'var(--brand-primary)' : 'var(--border)'}; background: ${state.mode === 'exam' ? '#eff6ff' : 'var(--surface)'}; padding: 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease; position: relative;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <strong style="font-size: 15px; color: ${state.mode === 'exam' ? '#1d4ed8' : 'var(--text-primary)'};">
                      ⏱️ Chế Độ Thi Thử
                    </strong>
                    <input type="radio" name="setupModeRadio" ${state.mode === 'exam' ? 'checked' : ''} style="cursor: pointer;">
                  </div>
                  <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                    Mô phỏng phòng thi thật có bấm giờ đếm ngược, nộp bài mới biết điểm, lưu Lịch Sử Thi & BXH.
                  </p>
                </div>
              </div>

              <!-- Tiện Ích Riêng Theo Chế Độ Đã Chọn -->
              ${state.mode === 'practice' ? `
                <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                  <div style="font-size: 13px; font-weight: 700; color: #15803d;">
                    ✨ Tiện ích & Tùy chọn chuyên biệt cho Ôn Tập:
                  </div>

                  <!-- Tùy chọn 1: Hiện đáp án ngay -->
                  <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary);">
                    <div>
                      <strong>⚡ Hiện đáp án & Đúng/Sai ngay sau khi chọn:</strong>
                      <div style="font-size: 12px; color: var(--text-secondary);">Chọn câu trả lời là biết ngay kết quả và vị trí đúng/sai</div>
                    </div>
                    <input type="checkbox" ${state.instantFeedback ? 'checked' : ''} onchange="App.setQuizSetupPracticeOption('instantFeedback', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>

                  <!-- Tùy chọn 2: Tự mở giải thích -->
                  <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary);">
                    <div>
                      <strong>💡 Hiển thị kèm giải thích chi tiết:</strong>
                      <div style="font-size: 12px; color: var(--text-secondary);">Tự động hiển thị khung giải thích 💡 bên dưới câu hỏi</div>
                    </div>
                    <input type="checkbox" ${state.autoExpandNotes ? 'checked' : ''} onchange="App.setQuizSetupPracticeOption('autoExpandNotes', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>

                  <!-- Tùy chọn 3: Lặp lại câu sai -->
                  <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary);">
                    <div>
                      <strong>🔄 Chế độ Luyện Tập Lặp Lại (Mastery):</strong>
                      <div style="font-size: 12px; color: var(--text-secondary);">Nếu trả lời sai, câu hỏi sẽ được đưa về cuối đề để bạn làm lại đến khi đúng</div>
                    </div>
                    <input type="checkbox" ${state.repeatMistakes ? 'checked' : ''} onchange="App.setQuizSetupPracticeOption('repeatMistakes', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>

                  <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #16a34a; margin-top: 4px;">
                    <span>⏳</span>
                    <span>Chế độ ôn tập <strong>không giới hạn thời gian</strong> để bạn rèn luyện thoải mái nhất.</span>
                  </div>
                </div>
              ` : `
                <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 14px;">
                  <div style="font-size: 13px; font-weight: 700; color: #1d4ed8;">
                    ⏱️ Tùy chỉnh Thời Gian & Quy Tắc Phòng Thi:
                  </div>

                  <!-- Chọn thời gian làm bài -->
                  <div>
                    <label style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: block;">
                      Thời gian làm bài thi:
                    </label>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                      ${['auto', '15', '30', '45', '60', '90', 'custom'].map(preset => {
                        const isSel = (state.timePreset === preset);
                        let label = `${preset} phút`;
                        if (preset === 'auto') label = `⚡ Tự động (1p/câu)`;
                        else if (preset === 'custom') label = `✏️ Tự nhập phút`;

                        return `
                          <button 
                            type="button"
                            onclick="App.setQuizSetupTimePreset('${preset}')" 
                            class="btn btn-sm ${isSel ? 'btn-primary' : ''}" 
                            style="${isSel ? 'font-weight: 800;' : 'background: #ffffff; border: 1px solid var(--border); color: var(--text-primary);'}">
                            ${label}
                          </button>
                        `;
                      }).join('')}
                    </div>

                    ${state.timePreset === 'custom' ? `
                      <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                        <input 
                          type="number" 
                          min="1" 
                          max="300" 
                          class="form-control" 
                          style="max-width: 150px; font-weight: 700;" 
                          placeholder="Ví dụ: 45" 
                          value="${state.customTimeMinutes}" 
                          oninput="App.setQuizSetupCustomTime(this.value)">
                        <span style="font-size: 13px; color: var(--text-secondary);">phút</span>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Tùy chọn cảnh báo & tự nộp -->
                  <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed var(--border); padding-top: 10px;">
                    <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13px; color: var(--text-primary);">
                      <span>🔔 Nhắc nhở cảnh báo khi còn 5 phút cuối</span>
                      <input type="checkbox" ${state.warnTime ? 'checked' : ''} onchange="App.setQuizSetupExamOption('warnTime', this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
                    </label>

                    <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13px; color: var(--text-primary);">
                      <span>📤 Tự động thu bài & tính điểm khi hết giờ</span>
                      <input type="checkbox" ${state.autoSubmitOnTimeout ? 'checked' : ''} onchange="App.setQuizSetupExamOption('autoSubmitOnTimeout', this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
                    </label>
                  </div>

                  <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #2563eb;">
                    <span>📜</span>
                    <span>Kết quả bài thi thử sẽ được tự động ghi nhận vào <strong>Lịch Sử Thi (3 lần gần nhất)</strong>.</span>
                  </div>
                </div>
              `}

            </div>

            <!-- ── KHU VỰC 2: CẤU HÌNH ĐỀ & TRỘN CÂU HỎI ─────────────────── -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                <span style="font-size: 18px;">⚙️</span>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">
                  2. Cấu Hình Đề & Trộn Câu Hỏi
                </h3>
              </div>

              <!-- Số lượng câu hỏi cần làm -->
              <div style="margin-bottom: 18px;">
                <label style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: block;">
                  Số lượng câu hỏi trong đề:
                </label>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${['all', '10', '20', '30', '40', '50', '100', 'custom'].map(count => {
                    const isSel = (state.questionCount === count);
                    let label = `${count} câu`;
                    if (count === 'all') label = `Toàn bộ (${poolCount} câu)`;
                    else if (count === 'custom') label = `✏️ Tự nhập`;

                    return `
                      <button 
                        type="button"
                        onclick="App.setQuizSetupQuestionCount('${count}')" 
                        class="btn btn-sm ${isSel ? 'btn-primary' : ''}" 
                        style="${isSel ? 'font-weight: 800;' : 'background: #ffffff; border: 1px solid var(--border); color: var(--text-primary);'}">
                        ${label}
                      </button>
                    `;
                  }).join('')}
                </div>

                ${state.questionCount === 'custom' ? `
                  <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                    <input 
                      type="number" 
                      min="1" 
                      max="${poolCount}" 
                      class="form-control" 
                      style="max-width: 150px; font-weight: 700;" 
                      placeholder="Tối đa ${poolCount}" 
                      value="${state.customQuestionCount}" 
                      oninput="App.setQuizSetupCustomQuestionCount(this.value)">
                    <span style="font-size: 13px; color: var(--text-secondary);">câu (trên tổng ${poolCount} câu khả dụng)</span>
                  </div>
                ` : ''}
              </div>

              <!-- Xáo trộn câu hỏi & Xáo trộn đáp án -->
              <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px dashed var(--border); padding-top: 14px;">
                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary); padding: 8px 12px; background: #f8fafc; border-radius: var(--radius-sm);">
                  <div>
                    <strong>🔀 Xáo trộn thứ tự các câu hỏi (Đề ngẫu nhiên):</strong>
                    <div style="font-size: 12px; color: var(--text-secondary);">Các câu hỏi sẽ được đảo vị trí ngẫu nhiên mỗi lần làm</div>
                  </div>
                  <input type="checkbox" ${state.shuffleQuestions ? 'checked' : ''} onchange="App.toggleQuizSetupShuffle('shuffleQuestions')" style="width: 18px; height: 18px; cursor: pointer;">
                </label>

                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary); padding: 8px 12px; background: #f8fafc; border-radius: var(--radius-sm);">
                  <div>
                    <strong>🔤 Xáo trộn thứ tự các đáp án A - B - C - D:</strong>
                    <div style="font-size: 12px; color: var(--text-secondary);">Tránh việc học vẹt vị trí chữ cái, rèn luyện tư duy thực chất</div>
                  </div>
                  <input type="checkbox" ${state.shuffleOptions ? 'checked' : ''} onchange="App.toggleQuizSetupShuffle('shuffleOptions')" style="width: 18px; height: 18px; cursor: pointer;">
                </label>
              </div>

            </div>

            <!-- ── KHU VỰC 3: PHẠM VI CHƯƠNG KIẾN THỨC ───────────────────── -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">📂</span>
                  <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">
                    3. Phạm Vi Chương Kiến Thức
                  </h3>
                </div>

                <button class="btn btn-sm ${isAllChapters ? 'btn-primary' : ''}" onclick="App.toggleQuizSetupAllChapters()">
                  ${isAllChapters ? '✓ Đang chọn Tất Cả' : 'Chọn Tất Cả Các Chương'}
                </button>
              </div>

              <!-- Danh sách các chương với checkbox đa chọn -->
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${chapters.length === 0 ? `
                  <div style="padding: 12px; background: #f8fafc; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary);">
                    Môn học này chưa phân chia chương cụ thể. Toàn bộ ${allQuestions.length} câu hỏi sẽ được sử dụng.
                  </div>
                ` : `
                  ${chapters.map((c, cIdx) => {
                    const cQCount = allQuestions.filter(q => q.chapterId === c.id).length;
                    const isChecked = isAllChapters || state.selectedChapters.includes(c.id);

                    return `
                      <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1.5px solid ${isChecked ? 'var(--brand-primary)' : 'var(--border)'}; background: ${isChecked ? '#f0fdf4' : '#ffffff'}; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <input 
                            type="checkbox" 
                            ${isChecked ? 'checked' : ''} 
                            onchange="App.toggleQuizSetupChapter('${c.id}')" 
                            style="width: 17px; height: 17px; cursor: pointer;">
                          <span style="font-weight: ${isChecked ? '700' : '500'}; color: ${isChecked ? '#14532d' : 'var(--text-primary)'}; font-size: 13.5px;">
                            ${c.name}
                          </span>
                        </div>
                        <span class="badge" style="background: ${isChecked ? '#dcfce7' : '#f1f5f9'}; color: ${isChecked ? '#15803d' : '#64748b'}; font-weight: 700; font-size: 11.5px;">
                          ${cQCount} câu
                        </span>
                      </label>
                    `;
                  }).join('')}
                `}
              </div>
            </div>

          </div>

          <!-- CỘT PHẢI: STICKY SUMMARY CARD & NÚT BẮT ĐẦU -->
          <div style="position: sticky; top: 20px;">
            <div style="background: var(--surface); border: 2px solid var(--brand-primary); border-radius: var(--radius-md); padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
              
              <div style="border-bottom: 1px solid var(--border); padding-bottom: 14px; margin-bottom: 14px;">
                <span class="badge badge-blue" style="font-weight: 800; margin-bottom: 6px; display: inline-block;">
                  ${subject.code || 'DTHU-QUIZ'}
                </span>
                <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; line-height: 1.3;">
                  ${subject.name}
                </h3>
                <div style="font-size: 12.5px; color: var(--text-secondary);">
                  Tổng ngân hàng: <strong>${allQuestions.length} câu hỏi</strong>
                </div>
              </div>

              <!-- Tóm tắt cấu hình -->
              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Chế độ:</span>
                  <strong style="color: ${state.mode === 'practice' ? '#15803d' : '#1d4ed8'};">
                    ${state.mode === 'practice' ? '🟢 Ôn Tập Có Lời Giải' : '⏱️ Thi Thử Tính Giờ'}
                  </strong>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Số câu sẽ làm:</span>
                  <strong style="color: var(--brand-primary); font-size: 14px;">
                    ${targetQuestionCount} câu
                  </strong>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Thời gian thi:</span>
                  <strong>${timeDisplayText}</strong>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Xáo trộn đề:</span>
                  <span>${state.shuffleQuestions ? '✓ Xáo câu' : '✗ Giữ câu'} · ${state.shuffleOptions ? '✓ Xáo đáp án' : '✗ Giữ đáp án'}</span>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Phạm vi:</span>
                  <span>${isAllChapters ? 'Tất cả các chương' : `${state.selectedChapters.length} chương đã chọn`}</span>
                </div>
              </div>

              <!-- Nút Bắt Đầu Lớn -->
              <button 
                class="btn btn-primary" 
                style="width: 100%; padding: 14px; font-size: 15px; font-weight: 800; letter-spacing: 0.02em; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 10px rgba(37,99,235,0.25);" 
                onclick="App.launchQuizFromSetup()">
                🚀 BẮT ĐẦU LÀM BÀI NGAY ➔
              </button>

              <button 
                class="btn" 
                style="width: 100%; margin-top: 10px; font-size: 13px;" 
                onclick="App.navigateTo('home')">
                ← Quay lại danh sách môn
              </button>

            </div>
          </div>

        </div>

      </div>
    `;
  },

  setQuizSetupMode(mode) {
    if (!this.quizSetupState) return;
    this.quizSetupState.mode = mode;
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupPracticeOption(key, checked) {
    if (!this.quizSetupState) return;
    this.quizSetupState[key] = Boolean(checked);
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupExamOption(key, checked) {
    if (!this.quizSetupState) return;
    this.quizSetupState[key] = Boolean(checked);
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupTimePreset(preset) {
    if (!this.quizSetupState) return;
    this.quizSetupState.timePreset = preset;
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupCustomTime(val) {
    if (!this.quizSetupState) return;
    this.quizSetupState.customTimeMinutes = val;
  },

  setQuizSetupQuestionCount(count) {
    if (!this.quizSetupState) return;
    this.quizSetupState.questionCount = count;
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupCustomQuestionCount(val) {
    if (!this.quizSetupState) return;
    this.quizSetupState.customQuestionCount = val;
  },

  toggleQuizSetupShuffle(key) {
    if (!this.quizSetupState) return;
    this.quizSetupState[key] = !this.quizSetupState[key];
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  toggleQuizSetupChapter(chapterId) {
    if (!this.quizSetupState) return;
    let list = this.quizSetupState.selectedChapters.filter(c => c !== "all");
    if (list.includes(chapterId)) {
      list = list.filter(c => c !== chapterId);
    } else {
      list.push(chapterId);
    }
    if (list.length === 0) list = ["all"];
    this.quizSetupState.selectedChapters = list;
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  toggleQuizSetupAllChapters() {
    if (!this.quizSetupState) return;
    this.quizSetupState.selectedChapters = ["all"];
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  launchQuizFromSetup() {
    const subject = StorageService.getSubjectById(this.quizSetupSubjectId);
    if (!subject) {
      this.showToast("⚠️ Không tìm thấy môn học!", "danger");
      return;
    }

    const state = this.quizSetupState || {};
    const questionCount = (state.questionCount === "custom") ? (parseInt(state.customQuestionCount, 10) || "all") : state.questionCount;
    const customTimeMinutes = (state.timePreset === "custom") ? (parseInt(state.customTimeMinutes, 10) || 45) : ((state.timePreset !== "auto") ? parseInt(state.timePreset, 10) : null);

    const session = QuizEngine.createQuizSession(subject, {
      mode: state.mode || "practice",
      chapterIds: state.selectedChapters,
      questionCount: questionCount || "all",
      shuffleQuestions: state.shuffleQuestions !== false,
      shuffleOptions: state.shuffleOptions !== false,
      customTimeMinutes: customTimeMinutes,
      instantFeedback: state.instantFeedback !== false,
      autoExpandNotes: state.autoExpandNotes !== false,
      repeatMistakes: state.repeatMistakes === true,
      warnTime: state.warnTime !== false,
      autoSubmitOnTimeout: state.autoSubmitOnTimeout !== false
    });

    if (session.questions.length === 0) {
      this.showToast("⚠️ Không có câu hỏi nào trong phạm vi lựa chọn!", "warning");
      return;
    }

    this.activeSession = session;
    this.currentPage = 0;
    this.navigateTo("quiz");

    // Khởi động đồng hồ nếu thi thử
    if (session.mode === "exam") {
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
        this.showToast("⏰ Đã hết thời gian làm bài! Hệ thống tự động nộp bài.", "warning", 4500);
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
        if (isPractice && this.activeSession.instantFeedback !== false) {
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
          // Exam mode hoặc Ôn tập không hiện đáp án ngay
          if (oi === userAns) optClass += " selected-exam";
        }
      }

      optionsHtml += `
        <div class="${optClass}" onclick="App.selectQuizOption('${q.id}', ${oi})">
          <div class="option-header-row">
            <div class="opt-letter">${this.letters[oi]}</div>
            <div class="opt-text">${SmartParserService.formatRichText(opt.text)}</div>
          </div>
          ${(isPractice && this.activeSession.instantFeedback !== false && isAnswered && opt.note) ? `<div class="opt-explanation">${stateNote}</div>` : ''}
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
    if (this.activeSession.mode === "practice" && this.activeSession.instantFeedback !== false && this.activeSession.answers[questionId] !== undefined) {
      return; // Khóa trong chế độ ôn tập khi bật hiện đáp án ngay
    }

    this.activeSession.answers[questionId] = optionIndex;
    this.renderQuizQuestions();
    this.renderQuizSidebarGrid();
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
    const wrongDetails = details.filter(d => !d.isCorrect && d.userAnswer !== undefined);

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

          ${result.mode === 'exam' ? `
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 14px 18px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <div style="text-align: left;">
                <strong style="color: #1e40af; font-size: 14px;">📜 Bài thi thử đã được lưu vào Lịch Sử Thi (3 lần gần nhất):</strong>
                <div style="font-size: 12.5px; color: #3b82f6; margin-top: 2px;">Bạn có thể xem lại chi tiết bài làm hoặc so sánh kết quả bất cứ lúc nào.</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.navigateTo('history')">
                📜 Xem Lịch Sử Thi ➔
              </button>
            </div>
          ` : ''}

          <div style="margin-top: 24px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.openQuizConfigModal('${result.subjectId}')">🔄 Thi lại môn này</button>
            ${result.mode === 'exam' ? `<button class="btn" onclick="App.navigateTo('history')">📜 Lịch Sử Thi (${StorageService.getUserExamHistory().length}/3)</button>` : ''}
            <button class="btn" onclick="App.openUserDrawer()">👤 Menu Cá nhân & BXH</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về trang chủ</button>
          </div>
        </div>

        <h3 style="margin-bottom: 16px; font-size: 17px; font-weight: 800;">Xem lại chi tiết bài làm vừa thi:</h3>
        <div id="reviewDetailsList" style="display: flex; flex-direction: column; gap: 14px;">
          ${details.map(d => this.renderReviewItem(d)).join('')}
        </div>
      </div>
    `;
  },

  renderReviewItem(d) {
    const q = d.question;
    const isCorrect = d.isCorrect;
    const hasAnswer = (d.userAnswer !== undefined && d.userAnswer !== null);

    return `
      <div class="question-card" style="border-left: 4px solid ${isCorrect ? '#16a34a' : '#ef4444'}; background: #ffffff; border-radius: var(--radius-sm); border: 1px solid var(--border); border-left-width: 5px; padding: 18px 20px;">
        <div class="question-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="badge" style="background: ${isCorrect ? '#dcfce7' : '#fee2e2'}; color: ${isCorrect ? '#15803d' : '#b91c1c'}; font-weight: 800;">
              ${isCorrect ? '✓ Trả lời Đúng' : (hasAnswer ? '✗ Trả lời Sai' : '⚪ Chưa trả lời')}
            </span>
            <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 700;">Câu ${d.index + 1}</span>
          </div>
          <span class="badge badge-gray" style="font-size: 11.5px;">Đáp án đúng: ${this.letters[q.answerIndex]}</span>
        </div>
        <div class="question-card-title" style="font-size: 14.5px; font-weight: 600; line-height: 1.5; margin-bottom: 12px; color: var(--text-primary);">
          ${SmartParserService.formatRichText(q.question)}
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          ${q.options.map((opt, oi) => {
            const isRightOption = (oi === q.answerIndex);
            const isUserPick = (oi === d.userAnswer);

            let bg = "#ffffff";
            let border = "1px solid #cbd5e1";
            let textCol = "#334155";
            let badgeBg = "#f1f5f9";
            let badgeText = "#475569";
            let tagHtml = "";

            if (isRightOption) {
              bg = "#dcfce7";
              border = "1.5px solid #16a34a";
              textCol = "#14532d";
              badgeBg = "#16a34a";
              badgeText = "#ffffff";
              tagHtml = `<span style="margin-left: 8px; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0;">✓ Đáp án đúng</span>`;
            } else if (isUserPick && !isCorrect) {
              bg = "#fee2e2";
              border = "1.5px solid #ef4444";
              textCol = "#991b1b";
              badgeBg = "#ef4444";
              badgeText = "#ffffff";
              tagHtml = `<span style="margin-left: 8px; background: #ef4444; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0;">✗ Bạn đã chọn</span>`;
            }

            return `
              <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; padding: 10px 14px; border-radius: 6px; border: ${border}; background: ${bg}; width: 100%; box-sizing: border-box;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; min-width: 24px; background: ${badgeBg}; color: ${badgeText}; border-radius: 4px; font-weight: 800; font-size: 12.5px; flex-shrink: 0; margin-top: 1px;">
                  ${this.letters[oi]}
                </span>
                <div style="font-weight: ${(isRightOption || isUserPick) ? '700' : '400'}; color: ${textCol}; flex: 1; min-width: 0; word-break: break-word; overflow-wrap: break-word; line-height: 1.5;">
                  ${SmartParserService.formatRichText(opt.text)}
                </div>
                ${tagHtml}
              </div>
            `;
          }).join('')}
        </div>
        ${(q.options[q.answerIndex] && q.options[q.answerIndex].note) ? `
          <div style="font-size: 13px; color: #14532d; background: #f0fdf4; padding: 10px 14px; border-radius: 6px; border: 1.5px dashed #22c55e; margin-top: 10px;">
            💡 <strong>Giải thích:</strong> ${SmartParserService.formatRichText(q.options[q.answerIndex].note)}
          </div>
        ` : ''}
      </div>
    `;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 7. EXAM HISTORY VIEW (LỊCH SỬ THI & NHẬT KÝ LÀM BÀI - TỐI ĐA 3 LẦN GẦN NHẤT)
  // ═════════════════════════════════════════════════════════════════════════
  renderExamHistoryView(container) {
    if (!StorageService.isLoggedIn()) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="font-size: 52px; margin-bottom: 14px;">📜</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Lịch Sử Thi & Nhật Ký Làm Bài</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Vui lòng đăng nhập tài khoản sinh viên DThu để hệ thống tự động ghi nhận và phân tích tối đa 3 lần thi thử gần nhất của bạn.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 22px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()">🔑 Đăng Nhập Ngay ➔</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
          </div>
        </div>
      `;
      return;
    }

    const examHistory = StorageService.getUserExamHistory();
    const count = examHistory.length;
    const avgScore = count > 0 ? (examHistory.reduce((s, a) => s + (a.score10 || 0), 0) / count).toFixed(1) : "0.0";
    const passCount = examHistory.filter(a => a.isPassed).length;
    const passRate = count > 0 ? Math.round((passCount / count) * 100) : 0;
    const maxScore = count > 0 ? Math.max(...examHistory.map(a => a.score10 || 0)).toFixed(1) : "0.0";

    container.innerHTML = `
      <div class="view-exam-history" style="padding: 24px 20px; max-width: 1050px; margin: 0 auto; width: 100%;">
        
        <!-- Header & Navigation -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge badge-blue" style="font-weight: 700;">📜 Nhật Ký Thi Thử</span>
              <span class="badge badge-gray">${count}/3 bài thi gần nhất</span>
            </div>
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0;">
              Lịch Sử Thi & Bảng Điểm Gần Đây
            </h2>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">
              Hệ thống tự động lưu <strong>3 lần thi thử gần nhất</strong> của bạn để bạn theo dõi tiến bộ và ôn lại bài làm bất kỳ lúc nào.
            </p>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('home')">
              🚀 Vào Thi Thử Mới
            </button>
            ${count > 0 ? `
              <button class="btn btn-danger btn-sm" onclick="App.clearExamHistoryConfirm()">
                🗑️ Xóa Lịch Sử
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Thẻ Thống Kê Tổng Quan (Analytics Summary) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px;">
          
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">
              Lượt thi đã lưu
            </div>
            <div style="font-size: 26px; font-weight: 800; color: var(--brand-primary); margin-top: 4px;">
              ${count} <span style="font-size: 14px; font-weight: 600; color: var(--text-tertiary);">/ 3 lần</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
              Tự động luân chuyển bài mới
            </div>
          </div>

          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">
              Điểm trung bình (GPA)
            </div>
            <div style="font-size: 26px; font-weight: 800; color: #8b5cf6; margin-top: 4px;">
              ${avgScore} <span style="font-size: 14px; font-weight: 600; color: var(--text-tertiary);">/ 10</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
              Dựa trên ${count} lần thi gần nhất
            </div>
          </div>

          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">
              Tỷ lệ đạt yêu cầu
            </div>
            <div style="font-size: 26px; font-weight: 800; color: var(--success); margin-top: 4px;">
              ${passRate}%
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
              ${passCount}/${count} lần đạt điểm $\ge$ 5.0
            </div>
          </div>

          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">
              Điểm số cao nhất
            </div>
            <div style="font-size: 26px; font-weight: 800; color: #b45309; margin-top: 4px;">
              ${maxScore} <span style="font-size: 14px; font-weight: 600; color: var(--text-tertiary);">🏆</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
              Thành tích tốt nhất
            </div>
          </div>

        </div>

        <!-- Danh Sách 3 Lần Thi Thử Gần Nhất -->
        <div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 14px;">
            📋 Danh Sách Bài Thi Gần Nhất
          </h3>

          ${count === 0 ? `
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 56px 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
              <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0;">
                Bạn chưa có lịch sử thi thử nào!
              </h3>
              <p style="font-size: 13.5px; color: var(--text-secondary); margin: 0 0 20px 0; max-width: 450px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                Khi bạn làm bài ở chế độ <strong>"Thi Thử (Exam Mode)"</strong>, hệ thống sẽ tự động ghi nhận kết quả và lưu lại chi tiết từng câu làm tại đây (tối đa 3 lần gần nhất).
              </p>
              <button class="btn btn-primary" onclick="App.navigateTo('home')">
                🚀 Vào Danh Sách Môn Thi Ngay ➔
              </button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${examHistory.map((h, idx) => {
                const dateStr = h.completedAt ? new Date(h.completedAt).toLocaleString('vi-VN') : 'Vừa xong';
                const mins = Math.floor((h.timeTakenSeconds || 0) / 60);
                const secs = (h.timeTakenSeconds || 0) % 60;
                const isLatest = (idx === 0);

                return `
                  <div style="background: var(--surface); border: 1.5px solid ${isLatest ? 'var(--brand-primary)' : 'var(--border)'}; border-radius: var(--radius-md); padding: 20px 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); position: relative;">
                    
                    <!-- Header Thẻ Bài Thi -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                          <span class="badge ${isLatest ? 'badge-blue' : 'badge-gray'}" style="font-weight: 800;">
                            ${isLatest ? '🔥 Lần thi 1 (Mới nhất)' : `Lần thi ${idx + 1}`}
                          </span>
                          <span class="badge badge-gray">⏱️ ${dateStr}</span>
                        </div>
                        <h4 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">
                          ${h.subjectName}
                        </h4>
                      </div>

                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="badge" style="background: ${h.isPassed ? '#dcfce7' : '#fee2e2'}; color: ${h.isPassed ? '#15803d' : '#b91c1c'}; font-size: 13px; font-weight: 800; padding: 6px 14px; border-radius: 20px;">
                          ${h.isPassed ? '🏆 ĐẠT YÊU CẦU' : '⚠️ CHƯA ĐẠT'}
                        </span>
                      </div>
                    </div>

                    <!-- Metrics Grid 4 Cột -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 16px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px;">
                      <div>
                        <div style="font-size: 11.5px; color: var(--text-tertiary); font-weight: 600;">Điểm số</div>
                        <div style="font-size: 20px; font-weight: 800; color: ${h.isPassed ? 'var(--success)' : 'var(--danger)'};">
                          ${h.score10} <span style="font-size: 12px; color: var(--text-tertiary);">/ 10</span>
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 11.5px; color: var(--text-tertiary); font-weight: 600;">Số câu đúng</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--success);">
                          ${h.correctCount} / ${h.totalQuestions} câu (${h.percentage}%)
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 11.5px; color: var(--text-tertiary); font-weight: 600;">Thời gian làm bài</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">
                          ${mins > 0 ? `${mins}p ` : ''}${secs}s
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 11.5px; color: var(--text-tertiary); font-weight: 600;">Câu sai & Chưa làm</div>
                        <div style="font-size: 14px; font-weight: 600; color: var(--danger);">
                          ${h.wrongCount} sai · ${h.unattemptedCount || 0} bỏ qua
                        </div>
                      </div>
                    </div>

                    <!-- Nút Thao Tác Bài Thi -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                      <button class="btn btn-primary btn-sm" onclick="App.openExamAttemptDetailModal('${h.id}')">
                        🔍 Xem Chi Tiết Bài Làm (${h.totalQuestions} câu)
                      </button>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm" onclick="App.openQuizConfigModal('${h.subjectId}')">
                          🔄 Thi Lại Môn Này
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="App.deleteExamAttemptConfirm('${h.id}')" title="Xóa lần thi này">
                          🗑️
                        </button>
                      </div>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>
          `}

        </div>

      </div>
    `;
  },

  // Modal Xem Chi Tiết Từng Câu Của Lần Thi Đã Lưu
  openExamAttemptDetailModal(attemptId) {
    const attempt = StorageService.getAttemptById(attemptId);
    if (!attempt) {
      this.showToast("⚠️ Không tìm thấy dữ liệu chi tiết của bài thi này!", "warning");
      return;
    }

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const dateStr = attempt.completedAt ? new Date(attempt.completedAt).toLocaleString('vi-VN') : '';
    const mins = Math.floor((attempt.timeTakenSeconds || 0) / 60);
    const secs = (attempt.timeTakenSeconds || 0) % 60;
    const details = attempt.details || [];

    title.innerHTML = `🔍 Chi Tiết Bài Thi: ${attempt.subjectName}`;

    body.innerHTML = `
      <div style="max-height: 70vh; overflow-y: auto; padding-right: 4px;">
        
        <!-- Summary Strip -->
        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
              Điểm số: <span style="color: ${attempt.isPassed ? 'var(--success)' : 'var(--danger)'}; font-size: 16px;">${attempt.score10}/10</span> (${attempt.gradeTitle})
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              Thời gian: <strong>${mins}p ${secs}s</strong> · Hoàn thành lúc: ${dateStr}
            </div>
          </div>
          <span class="badge" style="background: ${attempt.isPassed ? '#dcfce7' : '#fee2e2'}; color: ${attempt.isPassed ? '#15803d' : '#b91c1c'}; font-weight: 800; font-size: 12.5px;">
            ${attempt.isPassed ? '🏆 ĐẠT' : '⚠️ CHƯA ĐẠT'}
          </span>
        </div>

        <!-- Questions List -->
        ${details.length === 0 ? `
          <div style="text-align: center; padding: 30px; color: var(--text-tertiary); font-size: 13px;">
            Bài thi này không có bản ghi chi tiết từng câu.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${details.map(d => this.renderReviewItem(d)).join('')}
          </div>
        `}
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-primary" onclick="App.closeModal(); App.openQuizConfigModal('${attempt.subjectId}')">🔄 Thi Lại Môn Này</button>
    `;

    modal.classList.add("active");
  },

  deleteExamAttemptConfirm(attemptId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa lần thi",
      message: "Bạn có chắc chắn muốn xóa bản ghi lần thi này khỏi danh sách lịch sử không?",
      icon: "🗑️",
      confirmText: "Xóa lần thi",
      isDanger: true,
      warningKey: "delete_exam_attempt",
      onConfirm: () => {
        StorageService.deleteExamAttempt(attemptId);
        this.showToast("🗑️ Đã xóa lần thi khỏi lịch sử!", "info", 2500);
        this.renderExamHistoryView(document.getElementById("mainContent"));
      }
    });
  },

  clearExamHistoryConfirm() {
    this.showConfirmDialog({
      title: "Xác nhận xóa toàn bộ lịch sử thi",
      message: "Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử các lần thi thử của tài khoản này không?",
      icon: "⚠️",
      confirmText: "Xóa toàn bộ",
      isDanger: true,
      warningKey: "clear_all_exam_history",
      onConfirm: () => {
        StorageService.clearUserExamHistory();
        this.showToast("🗑️ Đã xóa sạch lịch sử thi!", "info", 2500);
        this.renderExamHistoryView(document.getElementById("mainContent"));
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 7. LEADERBOARD VIEW (BẢNG XẾP HẠNG CÔNG KHAI DÀNH CHO SINH VIÊN)
  // ═════════════════════════════════════════════════════════════════════════
  renderLeaderboardView(container) {
    const isLogged = StorageService.isLoggedIn();
    const profile = StorageService.getUserProfile();
    const isAdmin = isLogged && (profile.role === "admin" || StorageService.hasPermission("canManageUsers"));
    const settings = StorageService.getLeaderboardSettings();

    // Nếu BXH đang ở chế độ Tạm Ẩn và người xem không phải Admin
    if (settings.isPublic === false && !isAdmin) {
      container.innerHTML = `
        <div style="max-width: 650px; margin: 60px auto; text-align: center; padding: 40px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
          <div style="font-size: 54px; margin-bottom: 16px;">⏳</div>
          <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">
            Bảng Xếp Hạng Đang Tạm Đóng Để Tổng Hợp Điểm
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
            Ban Quản Trị đang tiến hành kiểm toán dữ liệu và chốt kết quả thi đua mùa giải <strong>"${settings.seasonName || 'Hiện tại'}"</strong>. Vui lòng quay lại sau ít phút!
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-primary" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
            <button class="btn" onclick="App.navigateTo('quiz')">📝 Tiếp Tục Thi Thử</button>
          </div>
        </div>
      `;
      return;
    }

    if (!this.leaderboardTab) this.leaderboardTab = "exp";
    if (!this.leaderboardScope) this.leaderboardScope = "season"; // 'season' | 'all_time'
    if (!this.leaderboardDept) this.leaderboardDept = "all";
    if (this.leaderboardSearch === undefined) this.leaderboardSearch = "";

    const activeTab = this.leaderboardTab;
    const activeScope = this.leaderboardScope;
    const isCp = (activeTab === "cp");
    const isSeason = (activeScope === "season");
    const stats = StorageService.getLeaderboardStats(activeScope);

    // Lấy danh sách tất cả các khoa ngành duy nhất
    const allUsers = StorageService.getAllUsers();
    const departments = Array.from(new Set(allUsers.map(u => u.department).filter(Boolean)));

    // Lấy dữ liệu bảng xếp hạng công khai (không bao gồm tài khoản bị ẩn)
    let leaderboard = StorageService.getLeaderboardData(activeTab, {
      scope: activeScope,
      department: this.leaderboardDept,
      search: this.leaderboardSearch,
      includeHidden: false
    });

    // Giới hạn hiển thị theo cài đặt nếu không phải đang tìm kiếm
    if (!this.leaderboardSearch && settings.maxDisplayCount && settings.maxDisplayCount !== "all") {
      const maxCount = parseInt(settings.maxDisplayCount, 10);
      if (!isNaN(maxCount) && maxCount > 0) {
        leaderboard = leaderboard.slice(0, maxCount);
      }
    }

    const top1 = leaderboard[0];
    const top2 = leaderboard[1];
    const top3 = leaderboard[2];

    container.innerHTML = `
      <div class="view-leaderboard" style="max-width: 1080px; margin: 0 auto; padding: 24px 16px;">
        <!-- Nút Chuyển Sang Trang Quản Trị (Chỉ hiển thị cho Admin) -->
        ${isAdmin ? `
          <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
            <button class="btn btn-sm" style="background:#fefce8; color:#854d0e; border:1px solid #facc15; font-weight:700; display:inline-flex; align-items:center; gap:6px;" onclick="App.navigateTo('leaderboard-admin')">
              <span>👑</span> <span>Trang Quản Trị BXH & Mùa Giải ➔</span>
            </button>
          </div>
        ` : ''}

        <!-- Header & Season Pill -->
        <div style="margin-bottom: 22px; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; background: #e0f2fe; color: #0369a1; border-radius: 20px; font-size: 12.5px; font-weight: 700; margin-bottom: 8px;">
            <span>🗓️</span> <span>Mùa giải: <strong>${settings.seasonName || 'Học Kỳ 1 (2026 - 2027)'}</strong></span>
          </div>
          <h2 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0;">🏆 Bảng Xếp Hạng Sinh Viên DThu</h2>
          <p style="color: var(--text-secondary); margin-top: 6px; font-size: 13.5px; max-width: 680px; margin-left: auto; margin-right: auto;">
            Tôn vinh sinh viên có thành tích rèn luyện thi thử xuất sắc và đóng góp xây dựng ngân hàng tài liệu học tập toàn diện cho trường Đại học Đồng Tháp.
          </p>

          <!-- Bộ Chọn Phạm Vi: Mùa Giải Hiện Tại vs Tổng Các Mùa (All-Time) -->
          <div style="display: inline-flex; background: var(--surface-subtle); padding: 4px; border-radius: 24px; border: 1px solid var(--border); margin-top: 10px; gap: 4px;">
            <button class="btn btn-sm ${isSeason ? 'btn-primary' : ''}" style="border-radius: 20px; font-size: 12.5px; font-weight: 700; padding: 5px 14px;" onclick="App.leaderboardScope = 'season'; App.renderLeaderboardView(document.getElementById('mainContent'));">
              🗓️ Điểm Mùa Này (${settings.seasonName || 'Mùa Hiện Tại'})
            </button>
            <button class="btn btn-sm ${!isSeason ? 'btn-primary' : ''}" style="border-radius: 20px; font-size: 12.5px; font-weight: 700; padding: 5px 14px;" onclick="App.leaderboardScope = 'all_time'; App.renderLeaderboardView(document.getElementById('mainContent'));">
              👑 Điểm Tổng Các Mùa (All-Time)
            </button>
          </div>
        </div>

        <!-- 📊 Ruy-băng Thống Kê Tổng Quan Toàn Trường -->
        <div class="leaderboard-stats-ribbon">
          <div class="leaderboard-stat-item">
            <div class="leaderboard-stat-icon">👨‍🎓</div>
            <div>
              <div class="leaderboard-stat-num">${stats.totalStudents}</div>
              <div class="leaderboard-stat-label">Sinh viên tranh tài</div>
            </div>
          </div>
          <div class="leaderboard-stat-item">
            <div class="leaderboard-stat-icon" style="color: #b45309;">⚡</div>
            <div>
              <div class="leaderboard-stat-num" style="color: #b45309;">${stats.totalExp.toLocaleString()}</div>
              <div class="leaderboard-stat-label">Tổng EXP (${isSeason ? 'Mùa này' : 'All-Time'})</div>
            </div>
          </div>
          <div class="leaderboard-stat-item">
            <div class="leaderboard-stat-icon" style="color: #15803d;">🌟</div>
            <div>
              <div class="leaderboard-stat-num" style="color: #15803d;">${stats.totalCp.toLocaleString()}</div>
              <div class="leaderboard-stat-label">Tổng CP (${isSeason ? 'Mùa này' : 'All-Time'})</div>
            </div>
          </div>
          <div class="leaderboard-stat-item">
            <div class="leaderboard-stat-icon" style="color: #0284c7;">📝</div>
            <div>
              <div class="leaderboard-stat-num" style="color: #0284c7;">${stats.totalQuestions.toLocaleString()}</div>
              <div class="leaderboard-stat-label">Câu hỏi ngân hàng</div>
            </div>
          </div>
        </div>

        <!-- Tab Selector: EXP Học Tập vs CP Cống Hiến -->
        <div class="hub-tabs" style="max-width: 520px; margin: 0 auto 24px auto;">
          <button class="hub-tab-btn ${activeTab === 'exp' ? 'active' : ''}" onclick="App.leaderboardTab = 'exp'; App.renderLeaderboardView(document.getElementById('mainContent'));">
            ⚡ Top Học Tập (EXP)
          </button>
          <button class="hub-tab-btn ${activeTab === 'cp' ? 'active' : ''}" onclick="App.leaderboardTab = 'cp'; App.renderLeaderboardView(document.getElementById('mainContent'));">
            🌟 Top Cống Hiến (CP)
          </button>
        </div>

        <!-- 🔍 Thanh Tìm Kiếm, Lọc Khoa & Nút "Vị Trí Của Tôi" -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 24px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 10px; flex: 1; min-width: 280px; flex-wrap: wrap;">
            <div class="search-input-wrapper" style="flex: 1; min-width: 180px;">
              <span class="search-icon">🔍</span>
              <input type="text" id="leaderboardSearchInput" class="form-control" placeholder="Tìm theo tên, MSSV..." value="${this.leaderboardSearch}" oninput="App.onSearchLeaderboard(this.value)">
            </div>
            <select id="leaderboardDeptFilter" class="form-control" style="width: auto; min-width: 200px;" onchange="App.onFilterLeaderboardDept(this.value)">
              <option value="all" ${this.leaderboardDept === 'all' ? 'selected' : ''}>🏛️ Tất cả Khoa / Viện</option>
              ${departments.map(d => `<option value="${d}" ${this.leaderboardDept === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>

          <button class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;" onclick="App.jumpToMyRank()">
            <span>📍</span> <span>Vị trí của tôi</span>
          </button>
        </div>

        <!-- 🏆 Podium Top 3 Chuẩn Thi Đấu -->
        ${leaderboard.length > 0 && !this.leaderboardSearch ? `
          <div class="podium-container">
            <!-- Rank 2 -->
            <div class="podium-card podium-rank-2">
              <div style="font-size: 13px; font-weight: 800; color: #64748b; margin-bottom: 6px;">
                ${settings.top2Title || '🥈 Hạng 2 (Top 2)'}
              </div>
              <div class="podium-avatar">${top2 ? (top2.isCurrentUser ? '👨‍🎓' : '🥈') : '👤'}</div>
              <div class="podium-name">${top2 ? top2.name : 'Đang cập nhật'}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${top2 ? top2.department : ''}</div>
              ${top2 && top2.customBadge ? `<div style="margin-top: 4px;"><span class="custom-badge-pill">${top2.customBadge}</span></div>` : ''}
              <div class="podium-exp" style="${isCp ? 'background:#fef3c7; color:#b45309;' : ''}">
                ${isCp ? `🌟 ${top2 ? top2.cp : 0} CP` : `⚡ ${top2 ? top2.exp : 0} EXP`}
              </div>
            </div>

            <!-- Rank 1 (Top 1) -->
            <div class="podium-card podium-rank-1">
              <div style="font-size: 13px; font-weight: 800; color: #d97706; margin-bottom: 6px;">
                ${settings.top1Title || '🥇 Hạng 1 (Top 1)'}
              </div>
              <div class="podium-avatar">${top1 ? '🥇' : '👤'}</div>
              <div class="podium-name" style="font-size: 18px;">${top1 ? top1.name : 'Đang cập nhật'}</div>
              <div style="font-size: 12.5px; color: var(--text-secondary);">${top1 ? top1.department : ''}</div>
              ${top1 && top1.customBadge ? `<div style="margin-top: 4px;"><span class="custom-badge-pill">${top1.customBadge}</span></div>` : ''}
              <div class="podium-exp" style="font-size: 16px; ${isCp ? 'background:#fef3c7; color:#b45309;' : ''}">
                ${isCp ? `🌟 ${top1 ? top1.cp : 0} CP` : `⚡ ${top1 ? top1.exp : 0} EXP`}
              </div>
            </div>

            <!-- Rank 3 -->
            <div class="podium-card podium-rank-3">
              <div style="font-size: 13px; font-weight: 800; color: #c2410c; margin-bottom: 6px;">
                ${settings.top3Title || '🥉 Hạng 3 (Top 3)'}
              </div>
              <div class="podium-avatar">${top3 ? (top3.isCurrentUser ? '👨‍🎓' : '🥉') : '👤'}</div>
              <div class="podium-name">${top3 ? top3.name : 'Đang cập nhật'}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${top3 ? top3.department : ''}</div>
              ${top3 && top3.customBadge ? `<div style="margin-top: 4px;"><span class="custom-badge-pill">${top3.customBadge}</span></div>` : ''}
              <div class="podium-exp" style="${isCp ? 'background:#fef3c7; color:#b45309;' : ''}">
                ${isCp ? `🌟 ${top3 ? top3.cp : 0} CP` : `⚡ ${top3 ? top3.exp : 0} EXP`}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Leaderboard Table -->
        <div class="leaderboard-table-card">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th style="width: 70px; text-align: center;">Hạng</th>
                <th>Sinh viên</th>
                <th>Khoa / Ngành</th>
                <th style="text-align: center;">${isCp ? 'Sản lượng cống hiến' : 'Số bài thi'}</th>
                <th style="text-align: right;">${isCp ? `Điểm CP (${isSeason ? 'Mùa này' : 'All-Time'})` : `Điểm EXP (${isSeason ? 'Mùa này' : 'All-Time'})`}</th>
                <th style="text-align: center;">Danh hiệu / Huy hiệu</th>
              </tr>
            </thead>
            <tbody>
              ${leaderboard.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 48px; color: var(--text-secondary);">
                    <div style="font-size: 36px; margin-bottom: 8px;">🔍</div>
                    <strong>Không tìm thấy sinh viên nào phù hợp với bộ lọc!</strong>
                  </td>
                </tr>
              ` : leaderboard.map(item => `
                <tr id="${item.isCurrentUser ? 'leaderboard-my-row' : 'leaderboard-row-' + item.id}" class="${item.isCurrentUser ? 'current-user-row' : ''}">
                  <td style="text-align: center; font-weight: 800;">
                    ${item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : item.rank}
                  </td>
                  <td>
                    <div>
                      <strong>${item.name}</strong>
                      <div style="font-size: 11.5px; color: var(--text-tertiary);">MSSV: ${item.studentId || 'Chưa cập nhật'} · Lớp: ${item.className || 'Chưa cập nhật'}</div>
                    </div>
                  </td>
                  <td style="color: var(--text-secondary); font-size: 13px;">${item.department}</td>
                  <td style="text-align: center; font-size: 13px;">
                    ${isCp ? `<strong>${(item.questions || 0).toLocaleString()}</strong> câu · <strong>${(item.chars || 0).toLocaleString()}</strong> chữ` : `${item.quizzes || 0} bài`}
                  </td>
                  <td style="text-align: right; font-weight: 800; color: ${isCp ? '#15803d' : '#b45309'};">
                    ${isCp ? `🌟 ${item.cp || 0} CP` : `⚡ ${item.exp || 0} EXP`}
                  </td>
                  <td style="text-align: center;">
                    ${item.customBadge ? `
                      <span class="custom-badge-pill" title="Huy hiệu đặc cách do Ban Quản Trị vinh danh">${item.customBadge}</span>
                    ` : `
                      <span class="badge ${isCp ? 'badge-success' : 'badge-blue'}">${item.badge}</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 7.1. TRANG QUẢN TRỊ BẢNG XẾP HẠNG & MÙA GIẢI RIÊNG BIỆT (ADMIN ONLY)
  // ═════════════════════════════════════════════════════════════════════════
  renderLeaderboardAdminView(container, data = {}) {
    const isLogged = StorageService.isLoggedIn();
    const profile = StorageService.getUserProfile();
    const isAdmin = isLogged && (profile.role === "admin" || StorageService.hasPermission("canManageUsers"));

    if (!isAdmin) {
      container.innerHTML = `
        <div style="max-width: 600px; margin: 60px auto; text-align: center; padding: 32px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
          <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
          <h3 style="font-size: 20px; font-weight: 800; color: #b91c1c;">Khu Vực Hạn Chế Truy Cập</h3>
          <p style="color: var(--text-secondary); margin: 8px 0 20px 0; font-size: 14px;">
            Trang Quản Trị Bảng Xếp Hạng & Mùa Giải chỉ dành riêng cho Quản Trị Viên (Admin) và Ban Điều Hành hệ thống.
          </p>
          <button class="btn btn-primary" onclick="App.navigateTo('leaderboard')">➔ Quay Lại Bảng Xếp Hạng</button>
        </div>
      `;
      return;
    }

    if (!this.adminLeaderboardTab || this.adminLeaderboardTab === "settings" || this.adminLeaderboardTab === "archives" || this.adminLeaderboardTab === "new_season") {
      this.adminLeaderboardTab = "seasons";
    }
    if (!this.adminMemberDept) this.adminMemberDept = "all";
    if (!this.adminMemberStatus) this.adminMemberStatus = "all";
    if (this.adminMemberSearch === undefined) this.adminMemberSearch = "";
    if (this.adminMemberOnlyHidden === undefined) this.adminMemberOnlyHidden = false;

    const seasons = StorageService.getSeasons();
    const settings = StorageService.getLeaderboardSettings();
    const auditLogs = StorageService.getAuditLogs();
    const allUsers = StorageService.getAllUsers();
    const departments = Array.from(new Set(allUsers.map(u => u.department).filter(Boolean)));
    const hiddenIds = settings.hiddenUserIds || [];

    // Lọc danh sách thành viên cho Tab Quản Trị Thành Viên
    let memberList = allUsers;
    if (this.adminMemberStatus === "active") {
      memberList = memberList.filter(u => u.status === "active");
    } else if (this.adminMemberStatus === "kicked") {
      memberList = memberList.filter(u => u.status === "kicked" || u.status === "suspended");
    } else if (this.adminMemberStatus === "pending_approval") {
      memberList = memberList.filter(u => u.status === "pending_approval");
    }

    if (this.adminMemberOnlyHidden) {
      memberList = memberList.filter(u => hiddenIds.includes(u.id));
    }
    if (this.adminMemberDept && this.adminMemberDept !== "all") {
      memberList = memberList.filter(u => u.department === this.adminMemberDept);
    }
    if (this.adminMemberSearch) {
      const q = this.adminMemberSearch.toLowerCase().trim();
      memberList = memberList.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.studentId && u.studentId.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }

    container.innerHTML = `
      <div class="view-admin-leaderboard" style="max-width: 1120px; margin: 0 auto; padding: 24px 16px;">
        <!-- Header & Back Button -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; background: #fef08a; color: #854d0e; border-radius: 12px; font-size: 12px; font-weight: 800; margin-bottom: 6px;">
              <span>👑</span> <span>TRUNG TÂM QUẢN TRỊ ADMIN TOÀN DIỆN</span>
            </div>
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0;">Quản Trị Bảng Xếp Hạng & Vòng Đời Mùa Giải</h2>
            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Toàn quyền tạo mùa, sửa thể lệ, reset điểm, đóng băng, phân quyền, kiểm toán và quản trị thành viên.</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm" onclick="App.navigateTo('leaderboard')">
              👁️ Xem BXH Công Khai ➔
            </button>
          </div>
        </div>

        <!-- 3 Tab Chức Năng Quản Trị Chuyên Sâu Tinh Gọn -->
        <div class="hub-tabs" style="margin-bottom: 24px; flex-wrap: wrap;">
          <button class="hub-tab-btn ${this.adminLeaderboardTab === 'seasons' ? 'active' : ''}" onclick="App.switchAdminLeaderboardTab('seasons')">
            🏆 Quản Lý Mùa Giải (${seasons.length})
          </button>
          <button class="hub-tab-btn ${this.adminLeaderboardTab === 'members' ? 'active' : ''}" onclick="App.switchAdminLeaderboardTab('members')">
            👥 Quản Trị Thành Viên (${allUsers.length})
          </button>
          <button class="hub-tab-btn ${this.adminLeaderboardTab === 'audit_logs' ? 'active' : ''}" onclick="App.switchAdminLeaderboardTab('audit_logs')">
            📋 Nhật Ký Kiểm Toán (${auditLogs.length})
          </button>
        </div>

        <!-- NỘI DUNG CHI TIẾT TỪNG TAB -->
        <div class="admin-tab-content">
          ${this.adminLeaderboardTab === 'seasons' ? `
            <!-- TAB 1: QUẢN LÝ VÒNG ĐỜI MÙA GIẢI & CÀI ĐẶT THỂ LỆ TÍCH HỢP -->
            <div>
              <!-- Thanh Cấu Hình Công Khai & Giới Hạn Hiển Thị BXH Nhanh -->
              <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; color: var(--text-primary); cursor: pointer;">
                    <input type="checkbox" id="adminLeaderboardIsPublicCheckbox" ${settings.isPublic !== false ? 'checked' : ''} style="width: 17px; height: 17px;">
                    <span>🌐 Cho phép sinh viên xem BXH công khai</span>
                  </label>

                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <span style="font-weight: 600; color: var(--text-secondary);">Giới hạn hiển thị:</span>
                    <select id="adminMaxDisplaySelect" class="form-control" style="width: auto; padding: 4px 10px; font-size: 12.5px; font-weight: 600;">
                      <option value="all" ${settings.maxDisplayCount === 'all' ? 'selected' : ''}>Toàn bộ sinh viên</option>
                      <option value="100" ${settings.maxDisplayCount === '100' ? 'selected' : ''}>Top 100 sinh viên</option>
                      <option value="50" ${settings.maxDisplayCount === '50' ? 'selected' : ''}>Top 50 sinh viên</option>
                      <option value="20" ${settings.maxDisplayCount === '20' ? 'selected' : ''}>Top 20 sinh viên</option>
                      <option value="10" ${settings.maxDisplayCount === '10' ? 'selected' : ''}>Top 10 sinh viên</option>
                    </select>
                  </div>
                </div>

                <button class="btn btn-sm btn-primary" onclick="App.saveAdminLeaderboardDisplaySettingsAction()">
                  💾 Lưu Thiết Lập Hiển Thị
                </button>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
                <div>
                  <h3 style="font-size: 17px; font-weight: 800; margin: 0; color: var(--text-primary);">
                    Danh Sách Mùa Giải & Thể Lệ Thi Đua
                  </h3>
                  <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Tích hợp đầy đủ tạo mùa, chỉnh sửa thể lệ, hệ số EXP, podium, đóng băng và xem bảng vàng.</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="App.openCreateSeasonModal()" style="display: inline-flex; align-items: center; gap: 6px;">
                  <span>➕</span> <span>Tạo Mùa Giải Mới</span>
                </button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${seasons.map(s => {
                  const isActive = (s.status === "active");
                  const isUpcoming = (s.status === "upcoming");
                  const isCompleted = (s.status === "completed");
                  const sStartDate = s.startDate ? new Date(s.startDate).toLocaleDateString('vi-VN') : 'N/A';
                  const sEndDate = s.endDate ? new Date(s.endDate).toLocaleDateString('vi-VN') : 'N/A';

                  return `
                    <div class="season-item-card" style="background: var(--surface); border: 1.5px solid ${isActive ? 'var(--brand-primary)' : 'var(--border)'}; border-radius: var(--radius-md); padding: 18px 20px; box-shadow: ${isActive ? '0 4px 14px rgba(2, 132, 199, 0.08)' : 'none'};">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                        <div>
                          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span class="badge" style="background: var(--surface-subtle); color: var(--text-primary); border: 1px solid var(--border); font-weight: 800; font-family: monospace; font-size: 12px;">${s.code || 'MÙA'}</span>
                            <strong style="font-size: 17px; color: var(--text-primary);">${s.name}</strong>
                            ${isActive ? `
                              <span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800; font-size:11.5px;">🟢 Đang Diễn Ra (Active)</span>
                            ` : isUpcoming ? `
                              <span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-weight:800; font-size:11.5px;">🟡 Sắp Diễn Ra (Upcoming)</span>
                            ` : `
                              <span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:700; font-size:11.5px;">🔒 Đã Đóng Băng (Completed)</span>
                            `}
                          </div>
                          ${s.description ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">${s.description}</div>` : ''}
                        </div>

                        <!-- Cụm Nút Thao Tác Cho Mùa Giải -->
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                          ${isActive ? `
                            <button class="btn btn-sm" style="background:#fffbeb; color:#b45309; border:1px solid #fde68a; font-weight:700;" onclick="App.openResetSeasonModal('${s.id}')" title="Đặt lại điểm mùa này về 0 mà không đổi mùa">
                              🔄 Reset Mùa Này
                            </button>
                            <button class="btn btn-sm" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-weight:700;" onclick="App.openFreezeSeasonModal('${s.id}')" title="Đóng băng và kết thúc mùa thi đua này">
                              🔒 Đóng Băng & Kết Thúc
                            </button>
                          ` : isUpcoming ? `
                            <button class="btn btn-sm btn-primary" onclick="App.openActivateSeasonModal('${s.id}')" title="Kích hoạt mùa giải này làm mùa thi đấu chính thức">
                              ▶️ Kích Hoạt Ngay
                            </button>
                          ` : `
                            <button class="btn btn-sm" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-weight:700;" onclick="App.openViewSeasonStandingsModal('${s.id}')" title="Xem kết quả đóng băng của mùa này">
                              🔍 Xem Bảng Vàng
                            </button>
                            <button class="btn btn-sm" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; font-weight:700;" onclick="App.confirmReopenSeasonAction('${s.id}')" title="Mở lại mùa giải này">
                              ♻️ Mở Lại Mùa
                            </button>
                          `}
                          <button class="btn btn-sm" onclick="App.openEditSeasonModal('${s.id}')" title="Chỉnh sửa thông số & thể lệ mùa giải">
                            ✏️ Sửa Thể Lệ
                          </button>
                          <button class="btn btn-sm" style="background:#15803d; color:#fff; font-weight:700;" onclick="App.exportSeasonCSV('${s.id}')" title="Xuất báo cáo bảng điểm CSV">
                            📥 CSV
                          </button>
                          ${!isActive ? `
                            <button class="btn btn-sm" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;" onclick="App.confirmDeleteSeasonAction('${s.id}')" title="Xóa mùa giải khỏi hệ thống">
                              🗑️ Xóa
                            </button>
                          ` : ''}
                        </div>
                      </div>

                      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; background: var(--surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 12.5px; border: 1px solid var(--border);">
                        <div>📅 <strong>Thời gian:</strong> ${sStartDate} ➔ ${sEndDate}</div>
                        <div>⚡ <strong>Hệ số EXP:</strong> <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:800;">${(s.expMultiplier || 1.0).toFixed(1)}x</span></div>
                        <div>🥇 <strong>Podium:</strong> ${s.top1Title || 'Top 1'} · ${s.top2Title || 'Top 2'} · ${s.top3Title || 'Top 3'}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : this.adminLeaderboardTab === 'members' ? `
            <!-- TAB 2: QUẢN TRỊ THÀNH VIÊN, LỌC TRẠNG THÁI NHÓM & THAO TÁC CAO CẤP -->
            <div>
              <!-- Toolbar Lọc Trạng Thái Nhóm, Tìm Kiếm & Xuất CSV -->
              <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 18px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                <div style="display: flex; gap: 10px; flex: 1; min-width: 280px; flex-wrap: wrap; align-items: center;">
                  <div class="search-input-wrapper" style="flex: 1; min-width: 180px;">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="adminMemberSearchInput" class="form-control" placeholder="Tìm theo tên, MSSV, khoa..." value="${this.adminMemberSearch}" oninput="App.onAdminMemberSearch(this.value)">
                  </div>
                  <select class="form-control" style="width: auto; min-width: 180px;" onchange="App.adminMemberDept = this.value; App.renderLeaderboardAdminView(document.getElementById('mainContent'));">
                    <option value="all" ${this.adminMemberDept === 'all' ? 'selected' : ''}>🏛️ Tất cả Khoa / Viện</option>
                    ${departments.map(d => `<option value="${d}" ${this.adminMemberDept === d ? 'selected' : ''}>${d}</option>`).join('')}
                  </select>
                  <select class="form-control" style="width: auto; min-width: 170px;" onchange="App.adminMemberStatus = this.value; App.renderLeaderboardAdminView(document.getElementById('mainContent'));">
                    <option value="all" ${this.adminMemberStatus === 'all' ? 'selected' : ''}>👥 Tất cả Trạng Thái</option>
                    <option value="active" ${this.adminMemberStatus === 'active' ? 'selected' : ''}>🟢 Đang trong nhóm (Active)</option>
                    <option value="kicked" ${this.adminMemberStatus === 'kicked' ? 'selected' : ''}>🔴 Đã bị Kick / Khóa (Kicked)</option>
                    <option value="pending_approval" ${this.adminMemberStatus === 'pending_approval' ? 'selected' : ''}>🟡 Chờ duyệt (Pending)</option>
                  </select>
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-primary); cursor: pointer; background: var(--surface-subtle); padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <input type="checkbox" ${this.adminMemberOnlyHidden ? 'checked' : ''} onchange="App.adminMemberOnlyHidden = this.checked; App.renderLeaderboardAdminView(document.getElementById('mainContent'));">
                    <span>Chỉ hiện tài khoản ẩn BXH (${hiddenIds.length})</span>
                  </label>
                </div>

                <button class="btn btn-sm" style="background:#15803d; color:#ffffff; font-weight:700;" onclick="App.exportLeaderboardCSV()">
                  📥 Xuất Báo Cáo CSV
                </button>
              </div>

              <!-- Thanh Thao Tác Hàng Loạt Tối Giản Cho Thành Viên BXH -->
              ${this.selectedAdminMemberIds && this.selectedAdminMemberIds.size > 0 ? `
                <div id="adminMembersBulkToolbar" style="background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #0369a1;">
                    <span>☑️ Đã chọn: <strong>${this.selectedAdminMemberIds.size}</strong> thành viên</span>
                  </div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button class="btn btn-sm" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5; font-weight:700;" onclick="App.openBulkKickModal()">
                      👢 Kick Hàng Loạt (${this.selectedAdminMemberIds.size})
                    </button>
                    <button class="btn btn-sm" style="background:#dcfce7; color:#15803d; border-color:#86efac; font-weight:700;" onclick="App.bulkReinstateUsersAction()">
                      ♻️ Khôi Phục (${this.selectedAdminMemberIds.size})
                    </button>
                    <button class="btn btn-sm" style="background:#f1f5f9; color:#334155; border-color:#cbd5e1; font-weight:700;" onclick="App.openBulkResetPointsModal()">
                      🔄 Reset Điểm Mùa Này
                    </button>
                    <button class="btn btn-sm" style="background:#fef3c7; color:#b45309; border-color:#fde68a; font-weight:700;" onclick="App.openBulkAdjustPointsModal('leaderboard')">
                      ⚡ Sửa Điểm Chung
                    </button>
                    <button class="btn btn-sm" style="background:#fdf4ff; color:#86198f; border-color:#f0abfc; font-weight:700;" onclick="App.openBulkAwardBadgeModal('leaderboard')">
                      🎖️ Trao Huy Hiệu
                    </button>
                    <button class="btn btn-sm" onclick="App.bulkToggleHideLeaderboardAction()">
                      👁️ Ẩn/Hiện BXH
                    </button>
                    <button class="btn btn-sm" onclick="App.clearAdminMemberSelections()">
                      ❌ Bỏ Chọn
                    </button>
                  </div>
                </div>
              ` : ''}

              <!-- Table Quản Trị Thành Viên Thực Tế -->
              <div class="leaderboard-table-card">
                <table class="leaderboard-table">
                  <thead>
                    <tr>
                      <th style="width: 36px; text-align: center;">
                        <input type="checkbox" id="selectAllMembersHeader" ${memberList.length > 0 && memberList.every(u => this.selectedAdminMemberIds && this.selectedAdminMemberIds.has(u.id)) ? 'checked' : ''} onchange="App.toggleSelectAllAdminMembers(this.checked)" title="Chọn / Bỏ chọn tất cả">
                      </th>
                      <th>Sinh viên & Trạng thái nhóm</th>
                      <th>Khoa / Ngành</th>
                      <th style="text-align: right;">⚡ EXP (Mùa / Tổng)</th>
                      <th style="text-align: right;">🌟 CP (Mùa / Tổng)</th>
                      <th style="text-align: center;">Trạng thái BXH</th>
                      <th style="text-align: center;">Huy hiệu</th>
                      <th style="text-align: right; min-width: 260px;">Thao Tác Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${memberList.length === 0 ? `
                      <tr>
                        <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-secondary);">
                          Không có thành viên nào phù hợp với bộ lọc!
                        </td>
                      </tr>
                    ` : memberList.map(u => {
                      const isHidden = hiddenIds.includes(u.id);
                      const customBadge = (settings.customBadges && settings.customBadges[u.id]) || null;
                      const isKicked = (u.status === "kicked" || u.status === "suspended");
                      const isPending = (u.status === "pending_approval");
                      const seasonExpVal = typeof u.seasonExp === "number" ? u.seasonExp : (u.totalExp || 0);
                      const seasonCpVal = typeof u.seasonCp === "number" ? u.seasonCp : (u.contributionPoints || 0);
                      const isSelected = this.selectedAdminMemberIds && this.selectedAdminMemberIds.has(u.id);

                      return `
                        <tr style="${isSelected ? 'background:#f0f9ff;' : isKicked ? 'background:#fff1f2; opacity:0.85;' : ''}">
                          <td style="text-align: center; width: 36px;">
                            <input type="checkbox" class="admin-member-checkbox" value="${u.id}" ${isSelected ? 'checked' : ''} onchange="App.toggleAdminMemberSelection('${u.id}', this.checked)">
                          </td>
                          <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <div>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                  <strong>${u.fullName}</strong>
                                  ${isKicked ? `<span class="badge" style="background:#fee2e2; color:#b91c1c; font-size:10.5px; font-weight:800;">🔴 Đã bị Kick</span>` : isPending ? `<span class="badge" style="background:#fef3c7; color:#b45309; font-size:10.5px;">🟡 Chờ duyệt</span>` : `<span class="badge" style="background:#dcfce7; color:#15803d; font-size:10.5px;">🟢 Đang trong nhóm</span>`}
                                </div>
                                <div style="font-size: 11.5px; color: var(--text-tertiary);">MSSV: ${u.studentId || 'Chưa cập nhật'} · Lớp: ${u.className || 'Chưa cập nhật'}</div>
                                ${u.kickedReason ? `<div style="font-size: 11px; color: #b91c1c; margin-top: 2px;">⚠️ Lý do kick: <em>"${u.kickedReason}"</em></div>` : ''}
                              </div>
                            </div>
                          </td>
                          <td style="font-size: 13px; color: var(--text-secondary);">${u.department || 'ĐH Đồng Tháp'}</td>
                          <td style="text-align: right; font-weight: 800; color: #b45309;">
                            <div>⚡ ${seasonExpVal.toLocaleString()}</div>
                            <div style="font-size: 11px; color: var(--text-tertiary); font-weight: 500;">Tổng: ${(u.totalExp || 0).toLocaleString()}</div>
                          </td>
                          <td style="text-align: right; font-weight: 800; color: #15803d;">
                            <div>🌟 ${seasonCpVal.toLocaleString()}</div>
                            <div style="font-size: 11px; color: var(--text-tertiary); font-weight: 500;">Tổng: ${(u.contributionPoints || 0).toLocaleString()}</div>
                          </td>
                          <td style="text-align: center;">
                            ${isHidden ? `
                              <span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:700;">🔴 Đã Ẩn</span>
                            ` : `
                              <span class="badge badge-success">🟢 Đang Hiện</span>
                            `}
                          </td>
                          <td style="text-align: center;">
                            ${customBadge ? `<span class="custom-badge-pill">${customBadge}</span>` : '<span style="color:var(--text-tertiary); font-size:12px;">(Mặc định)</span>'}
                          </td>
                          <td style="text-align: right;">
                            <div style="display: inline-flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
                              ${isKicked ? `
                                <button class="btn btn-sm" style="padding: 3px 8px; font-size: 11.5px; background:#dcfce7; color:#15803d; border-color:#86efac; font-weight:700;" onclick="App.confirmReinstateUserAction('${u.id}')" title="Khôi phục thành viên vào nhóm">
                                  ♻️ Khôi Phục
                                </button>
                              ` : `
                                <button class="btn btn-sm" style="padding: 3px 8px; font-size: 11.5px; background:#fee2e2; color:#b91c1c; border-color:#fca5a5;" onclick="App.openKickUserModal('${u.id}')" title="Loại (Kick) thành viên khỏi nhóm">
                                  👢 Kick
                                </button>
                              `}
                              <button class="btn btn-sm" style="padding: 3px 8px; font-size: 11.5px; background:#f1f5f9; color:#334155; border-color:#cbd5e1;" onclick="App.openResetUserPointsModal('${u.id}')" title="Đặt lại điểm số thành viên về 0">
                                🔄 Reset Điểm
                              </button>
                              <button class="btn btn-sm" style="padding: 3px 8px; font-size: 11.5px; background:#fdf4ff; color:#86198f; border-color:#f0abfc;" onclick="App.openAwardBadgeModal('${u.id}')" title="Trao danh hiệu / huy hiệu đặc cách">
                                🎖️ Huy Hiệu
                              </button>
                              <button class="btn btn-sm" style="padding: 3px 8px; font-size: 11.5px; background:#fef3c7; color:#b45309; border-color:#fde68a;" onclick="App.openAdminAdjustPointsModal('${u.id}')" title="Cộng / trừ điểm trực tiếp">
                                ⚡ Điểm
                              </button>
                              <button class="btn btn-sm" style="padding: 3px 8px; font-size: 11.5px;" onclick="App.toggleHideUserFromLeaderboardAdminAction('${u.id}')" title="Ẩn/Hiện trên BXH công khai">
                                ${isHidden ? '👁️ Hiện' : '👁️ Ẩn'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : `
            <!-- TAB 3: NHẬT KÝ KIỂM TOÁN QUẢN TRỊ (ADMIN AUDIT LOGS) -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                <div>
                  <h3 style="font-size: 17px; font-weight: 800; margin: 0; color: var(--text-primary);">
                    📋 Nhật Ký Kiểm Toán Thao Tác Quản Trị
                  </h3>
                  <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Lưu vết minh bạch 100% các hành động tạo mùa, reset điểm, sửa điểm, kick/khôi phục và trao huy hiệu.</div>
                </div>
                ${auditLogs.length > 0 ? `
                  <button class="btn btn-sm" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;" onclick="App.clearAuditLogsConfirm()">
                    🗑️ Xóa Lịch Sử Nhật Ký
                  </button>
                ` : ''}
              </div>

              <div class="leaderboard-table-card">
                <table class="leaderboard-table">
                  <thead>
                    <tr>
                      <th style="width: 170px;">Thời Gian</th>
                      <th style="width: 140px;">Quản Trị Viên</th>
                      <th style="width: 160px;">Hành Động</th>
                      <th style="width: 180px;">Đối Tượng</th>
                      <th>Chi Tiết / Lý Do Giải Trình</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${auditLogs.length === 0 ? `
                      <tr>
                        <td colspan="5" style="text-align: center; padding: 36px; color: var(--text-secondary);">
                          Chưa có nhật ký kiểm toán nào được ghi nhận!
                        </td>
                      </tr>
                    ` : auditLogs.map(log => `
                      <tr>
                        <td style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">
                          ${new Date(log.timestamp).toLocaleString('vi-VN')}
                        </td>
                        <td>
                          <strong>${log.adminName}</strong>
                        </td>
                        <td>
                          <span class="badge" style="background:#f1f5f9; color:#0f172a; font-weight:800; font-size:11px;">${log.action}</span>
                        </td>
                        <td>
                          <strong>${log.target}</strong>
                        </td>
                        <td style="font-size: 13px; color: var(--text-primary);">
                          ${log.details}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  },

  switchAdminLeaderboardTab(tab) {
    this.adminLeaderboardTab = tab;
    const container = document.getElementById("mainContent");
    if (container) {
      this.renderLeaderboardAdminView(container);
    }
  },

  onAdminMemberSearch(val) {
    this.adminMemberSearch = val;
    const container = document.getElementById("mainContent");
    if (container) {
      this.renderLeaderboardAdminView(container);
      const input = document.getElementById("adminMemberSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(val.length, val.length);
      }
    }
  },


  saveAdminLeaderboardDisplaySettingsAction() {
    const isPublic = document.getElementById("adminLeaderboardIsPublicCheckbox")?.checked ?? true;
    const maxDisplay = document.getElementById("adminMaxDisplaySelect")?.value || "all";

    const current = StorageService.getLeaderboardSettings();
    current.isPublic = isPublic;
    current.maxDisplayCount = maxDisplay;

    StorageService.saveLeaderboardSettings(current);
    this.showToast("✅ Đã lưu thiết lập hiển thị Bảng Xếp Hạng thành công!", "success", 2500);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  // ── Modals Quản Lý Vòng Đời Mùa Giải (Season Studio) ────────
  openCreateSeasonModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "🏆 Khởi Tạo Mùa Giải Mới (Season Studio)";

    const defaultStart = new Date().toISOString().slice(0, 10);
    const defaultEnd = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
    const suggestedCode = "HK" + (new Date().getMonth() > 6 ? "1" : "2") + "-" + new Date().getFullYear();

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; max-height: 75vh; overflow-y: auto; padding-right: 4px;">
        
        <!-- Phân khu 1: Biểu tượng & Tên mùa giải -->
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>1️⃣</span> <span>Thông Tin Định Danh & Biểu Tượng Mùa Giải</span>
          </div>

          <div style="margin-bottom: 12px;">
            <label class="form-label" style="font-size: 12px; font-weight: 700; margin-bottom: 6px; display: block;">Chọn Biểu Tượng Mùa Giải:</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="seasonIconPicker">
              ${['🏆', '🔥', '🚀', '⭐', '👑', '🎯', '🎓', '💎'].map((icon, idx) => `
                <button type="button" class="btn btn-sm ${idx === 0 ? 'btn-primary' : ''}" style="font-size: 16px; padding: 6px 12px; border-radius: 8px;" onclick="App.selectSeasonIcon(this, '${icon}')">
                  ${icon}
                </button>
              `).join('')}
              <input type="hidden" id="newSeasonIcon" value="🏆">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700;">Tên Mùa Giải (*):</label>
              <input type="text" id="newSeasonName" class="form-control" placeholder="Ví dụ: Học Kỳ 1 (2026 - 2027)" value="Học Kỳ Mới (${new Date().toLocaleDateString('vi-VN')})">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700;">Mã Mùa Giải (*):</label>
              <input type="text" id="newSeasonCode" class="form-control" placeholder="VD: HK1-2026" value="${suggestedCode}" style="text-transform: uppercase; font-weight: 700;">
            </div>
          </div>
        </div>

        <!-- Phân khu 2: Khung Thời Gian & Hệ Số Điểm -->
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>2️⃣</span> <span>Khung Thời Gian & Cơ Chế Điểm Thưởng</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700;">Ngày Bắt Đầu (*):</label>
              <input type="date" id="newSeasonStartDate" class="form-control" value="${defaultStart}">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700;">Ngày Kết Thúc Dự Kiến (*):</label>
              <input type="date" id="newSeasonEndDate" class="form-control" value="${defaultEnd}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700;">Trạng Thái Khởi Tạo (*):</label>
              <select id="newSeasonStatus" class="form-control" style="font-weight: 600;" onchange="App.onSeasonStatusChange(this.value)">
                <option value="active" selected>🟢 Kích hoạt ngay làm mùa hiện tại (Active)</option>
                <option value="upcoming">🟡 Lên lịch sắp diễn ra (Upcoming)</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700;">Hệ Số EXP Mùa Thi (*):</label>
              <select id="newSeasonMultiplier" class="form-control" style="font-weight: 600;">
                <option value="1.0" selected>1.0x (Tiêu chuẩn)</option>
                <option value="1.25">1.25x (Khích lệ ôn tập)</option>
                <option value="1.5">1.5x (Mùa thi cao điểm)</option>
                <option value="2.0">2.0x (Sự kiện đặc biệt)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Phân khu 3: Danh Xưng Podium Top 3 -->
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>3️⃣</span> <span>Tùy Biến Danh Hiệu Podium Top 3</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 12px;">🥇 Hạng 1:</label>
              <input type="text" id="newSeasonTop1" class="form-control" value="🥇 Hạng 1 (Top 1)">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 12px;">🥈 Hạng 2:</label>
              <input type="text" id="newSeasonTop2" class="form-control" value="🥈 Hạng 2 (Top 2)">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 12px;">🥉 Hạng 3:</label>
              <input type="text" id="newSeasonTop3" class="form-control" value="🥉 Hạng 3 (Top 3)">
            </div>
          </div>
        </div>

        <!-- Phân khu 4: Mô Tả & Thể Lệ -->
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Mô Tả & Thể Lệ Cuộc Thi:</label>
          <textarea id="newSeasonDesc" class="form-control" style="min-height: 60px;" placeholder="Nhập thể lệ, đối tượng tham gia và giải thưởng thi đua..."></textarea>
        </div>

        <!-- Phân khu 5: Tùy Chọn Chiến Lược Điểm & Đóng Băng -->
        <div id="seasonStrategyBox" style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 14px 16px; font-size: 13px; color: #166534;">
          <div style="font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>⚙️</span> <span>Chiến Lược Chuyển Giao Mùa Giải (Khi kích hoạt):</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="newSeasonResetPoints" checked style="width: 17px; height: 17px; margin-top: 2px;">
              <div>
                <strong>Đặt lại Điểm Mùa Này (seasonExp, seasonCp) về 0</strong>
                <div style="font-size: 12px; color: #15803d; margin-top: 2px;">Mở chặng đua mới công bằng cho mọi sinh viên. Bảo lưu 100% Điểm Tổng All-Time.</div>
              </div>
            </label>
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; border-top: 1px dashed #bbf7d0; padding-top: 8px;">
              <input type="checkbox" id="newSeasonFreezeOld" checked style="width: 17px; height: 17px; margin-top: 2px;">
              <div>
                <strong>Tự động đóng băng kết quả mùa cũ vào Bảng Vàng Archives</strong>
                <div style="font-size: 12px; color: #15803d; margin-top: 2px;">Lưu giữ chính xác bảng xếp hạng Top 50 EXP & CP của mùa trước để vinh danh.</div>
              </div>
            </label>
          </div>
        </div>

        <div id="seasonUpcomingNote" style="display: none; background: #fefce8; border: 1px solid #fde047; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #854d0e;">
          <strong>💡 Mùa giải Sắp Diễn Ra (Upcoming):</strong>
          <div style="font-size: 12.5px; margin-top: 4px; line-height: 1.5;">Mùa giải này sẽ được lưu ở trạng thái chờ. Khi đến thời điểm diễn ra, Quản trị viên chỉ cần bấm <strong>"▶️ Kích Hoạt Ngay"</strong> và hệ thống sẽ cung cấp tùy chọn đóng băng & reset điểm lúc đó.</div>
        </div>

        <!-- Phân khu 6: Soạn Thông Báo Phát Động -->
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">📢 Lời Nhắn Gửi Phát Động Toàn Trường (Broadcast):</label>
          <textarea id="newSeasonBroadcastMsg" class="form-control" style="min-height: 55px;" placeholder="Ví dụ: Chào mừng các bạn sinh viên bước vào mùa thi đua mới. Hãy cùng nhau ôn luyện trắc nghiệm thật tốt!"></textarea>
        </div>

      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveCreateSeasonAction()">🚀 Khởi Tạo Mùa Giải Ngay</button>
    `;

    this.openModal();
  },

  onSeasonStatusChange(val) {
    const strategyBox = document.getElementById("seasonStrategyBox");
    const upcomingNote = document.getElementById("seasonUpcomingNote");
    if (strategyBox && upcomingNote) {
      if (val === "active") {
        strategyBox.style.display = "block";
        upcomingNote.style.display = "none";
      } else {
        strategyBox.style.display = "none";
        upcomingNote.style.display = "block";
      }
    }
  },

  selectSeasonIcon(btn, icon) {
    const picker = document.getElementById("seasonIconPicker");
    if (picker) {
      picker.querySelectorAll("button").forEach(b => b.classList.remove("btn-primary"));
    }
    btn.classList.add("btn-primary");
    const hidden = document.getElementById("newSeasonIcon");
    if (hidden) hidden.value = icon;
  },

  saveCreateSeasonAction() {
    const icon = document.getElementById("newSeasonIcon")?.value || "🏆";
    let name = document.getElementById("newSeasonName")?.value.trim();
    const code = document.getElementById("newSeasonCode")?.value.trim();
    const startDate = document.getElementById("newSeasonStartDate")?.value;
    const endDate = document.getElementById("newSeasonEndDate")?.value;
    const status = document.getElementById("newSeasonStatus")?.value || "active";
    const multiplier = parseFloat(document.getElementById("newSeasonMultiplier")?.value) || 1.0;
    const t1 = document.getElementById("newSeasonTop1")?.value.trim();
    const t2 = document.getElementById("newSeasonTop2")?.value.trim();
    const t3 = document.getElementById("newSeasonTop3")?.value.trim();
    const desc = document.getElementById("newSeasonDesc")?.value.trim();
    const resetPoints = document.getElementById("newSeasonResetPoints") ? document.getElementById("newSeasonResetPoints").checked : false;
    const freezeOld = document.getElementById("newSeasonFreezeOld") ? document.getElementById("newSeasonFreezeOld").checked : false;
    const broadcastMsg = document.getElementById("newSeasonBroadcastMsg")?.value.trim();

    if (!name) {
      this.showToast("⚠️ Vui lòng nhập tên mùa giải mới!", "warning");
      return;
    }

    if (icon && !name.startsWith(icon)) {
      name = `${icon} ${name}`;
    }

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      const newSeason = StorageService.createSeason({
        name,
        code,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 90 * 86400000).toISOString(),
        status,
        expMultiplier: multiplier,
        top1Title: t1 || "🥇 Hạng 1 (Top 1)",
        top2Title: t2 || "🥈 Hạng 2 (Top 2)",
        top3Title: t3 || "🥉 Hạng 3 (Top 3)",
        description: desc,
        resetPoints: status === "active" ? resetPoints : false,
        freezeOld: status === "active" ? freezeOld : false
      }, adminName);

      // Nếu có lời nhắn broadcast tùy biến
      if (status === "active" && broadcastMsg) {
        const allUsers = StorageService.getAllUsers();
        allUsers.forEach(u => {
          StorageService.addNotification(u.id, {
            type: "system_announcement",
            title: `📢 Thông Điệp Mùa Giải: ${name}`,
            message: broadcastMsg,
            pointsDelta: null,
            pointType: null
          });
        });
      }

      this.closeModal();

      let extraInfo = "";
      if (status === "active") {
        if (freezeOld) extraInfo += " (Đã chốt bảng vàng mùa cũ)";
        if (resetPoints) extraInfo += " (Đã làm mới điểm mùa này)";
      }

      this.showToast(`🎉 Đã khởi tạo thành công mùa giải "${name}"!${extraInfo}`, "success", 4500);
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  openEditSeasonModal(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `✏️ Chỉnh Sửa Mùa Giải: ${season.name}`;

    const startVal = season.startDate ? new Date(season.startDate).toISOString().slice(0, 10) : '';
    const endVal = season.endDate ? new Date(season.endDate).toISOString().slice(0, 10) : '';

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; max-height: 75vh; overflow-y: auto; padding-right: 4px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Tên Mùa Giải (*):</label>
            <input type="text" id="editSeasonName" class="form-control" value="${season.name}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Mã Mùa (*):</label>
            <input type="text" id="editSeasonCode" class="form-control" value="${season.code || ''}" style="text-transform: uppercase; font-weight: 700;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Ngày Bắt Đầu:</label>
            <input type="date" id="editSeasonStartDate" class="form-control" value="${startVal}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Ngày Kết Thúc Dự Kiến:</label>
            <input type="date" id="editSeasonEndDate" class="form-control" value="${endVal}">
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Hệ Số EXP Mùa Thi (*):</label>
          <select id="editSeasonMultiplier" class="form-control" style="font-weight: 600;">
            <option value="1.0" ${(season.expMultiplier || 1.0) == 1.0 ? 'selected' : ''}>1.0x (Tiêu chuẩn)</option>
            <option value="1.25" ${(season.expMultiplier || 1.0) == 1.25 ? 'selected' : ''}>1.25x (Khích lệ)</option>
            <option value="1.5" ${(season.expMultiplier || 1.0) == 1.5 ? 'selected' : ''}>1.5x (Mùa thi cao điểm)</option>
            <option value="2.0" ${(season.expMultiplier || 1.0) == 2.0 ? 'selected' : ''}>2.0x (Sự kiện đặc biệt)</option>
          </select>
        </div>

        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px;">
          <label class="form-label" style="font-size: 12.5px; font-weight: 700; margin-bottom: 8px; display: block;">Tùy Biến Danh Hiệu Podium Top 3:</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <input type="text" id="editSeasonTop1" class="form-control" value="${season.top1Title || '🥇 Hạng 1 (Top 1)'}">
            <input type="text" id="editSeasonTop2" class="form-control" value="${season.top2Title || '🥈 Hạng 2 (Top 2)'}">
            <input type="text" id="editSeasonTop3" class="form-control" value="${season.top3Title || '🥉 Hạng 3 (Top 3)'}">
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Mô Tả & Thể Lệ Cuộc Thi:</label>
          <textarea id="editSeasonDesc" class="form-control" style="min-height: 70px;">${season.description || ''}</textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditSeasonAction('${season.id}')">💾 Lưu Thay Đổi</button>
    `;

    this.openModal();
  },

  saveEditSeasonAction(seasonId) {
    const name = document.getElementById("editSeasonName")?.value.trim();
    const code = document.getElementById("editSeasonCode")?.value.trim();
    const startDate = document.getElementById("editSeasonStartDate")?.value;
    const endDate = document.getElementById("editSeasonEndDate")?.value;
    const multiplier = parseFloat(document.getElementById("editSeasonMultiplier")?.value) || 1.0;
    const t1 = document.getElementById("editSeasonTop1")?.value.trim();
    const t2 = document.getElementById("editSeasonTop2")?.value.trim();
    const t3 = document.getElementById("editSeasonTop3")?.value.trim();
    const desc = document.getElementById("editSeasonDesc")?.value.trim();

    if (!name) {
      this.showToast("⚠️ Tên mùa giải không được để trống!", "warning");
      return;
    }

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.updateSeason(seasonId, {
        name,
        code,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        expMultiplier: multiplier,
        top1Title: t1 || undefined,
        top2Title: t2 || undefined,
        top3Title: t3 || undefined,
        description: desc
      }, adminName);

      this.closeModal();
      this.showToast("✅ Đã cập nhật thông số mùa giải thành công!", "success", 3000);
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  openResetSeasonModal(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `🔄 Đặt Lại Điểm Mùa: ${season.name}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 14px 16px; font-size: 13px; color: #b45309;">
          <strong>⚠️ Hành động này sẽ:</strong>
          <ul style="margin: 6px 0 0 0; padding-left: 18px; line-height: 1.6;">
            <li>Đặt lại toàn bộ <strong>Điểm Mùa Này (seasonExp & seasonCp)</strong> của tất cả sinh viên về 0.</li>
            <li><strong>Bảo lưu 100%</strong> Điểm Tổng Các Mùa (totalExp & contributionPoints).</li>
            <li>Tự động phát thông báo giải trình minh bạch tới 100% sinh viên.</li>
          </ul>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do đặt lại mùa giải (Bắt buộc) (*):</label>
          <textarea id="resetSeasonReason" class="form-control" style="min-height: 80px;" placeholder="Ví dụ: Hiệu chỉnh điểm do kỳ thi thử kết thúc sớm hoặc Tổ chức chặng đua mới..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.confirmResetSeasonAction('${season.id}')">🔄 Xác Nhận Đặt Lại Điểm Mùa Này</button>
    `;

    this.openModal();
  },

  confirmResetSeasonAction(seasonId) {
    const reason = document.getElementById("resetSeasonReason")?.value.trim();
    if (!reason) {
      this.showToast("⚠️ Vui lòng nhập lý do đặt lại mùa giải để gửi thông báo!", "warning");
      return;
    }

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.resetActiveSeason(seasonId, reason, adminName);
      this.closeModal();
      this.showToast("✅ Đã đặt lại điểm Mùa Này về 0 và gửi thông báo toàn trường thành công!", "success", 4000);
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  openFreezeSeasonModal(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `🔒 Đóng Băng & Bế Mạc: ${season.name}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: var(--radius-sm); padding: 14px 16px; font-size: 13px; color: #991b1b;">
          <strong>🔒 Hành động đóng băng mùa giải:</strong>
          <ul style="margin: 6px 0 0 0; padding-left: 18px; line-height: 1.6;">
            <li>Chốt bảng vàng Top 50 EXP & Top 50 CP vào Kho Lưu Trữ (Archives).</li>
            <li>Chuyển trạng thái mùa giải sang <strong>Đã Đóng Băng (Completed)</strong>.</li>
            <li>Tự động phát thông báo bế mạc và vinh danh Top 1, Top 2, Top 3 tới toàn trường.</li>
          </ul>
        </div>
        <p style="font-size: 13.5px; margin: 0; color: var(--text-primary);">
          Bạn có chắc chắn muốn đóng băng và kết thúc mùa giải <strong>"${season.name}"</strong> ngay bây giờ không?
        </p>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.confirmFreezeSeasonAction('${season.id}')">🔒 Xác Nhận Đóng Băng Mùa Giải</button>
    `;

    this.openModal();
  },

  confirmFreezeSeasonAction(seasonId) {
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.freezeAndEndSeason(seasonId, adminName);
      this.closeModal();
      this.showToast("🎉 Đã đóng băng kết quả mùa giải và phát thông báo vinh danh thành công!", "success", 4500);
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  openActivateSeasonModal(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `▶️ Kích Hoạt Mùa Giải: ${season.name}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13.5px;">
          Bạn đang chuẩn bị kích hoạt <strong>"${season.name}"</strong> làm mùa giải thi đấu chính thức hiện tại của toàn trường.
        </div>

        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 14px 16px; font-size: 13px; color: #166534;">
          <div style="font-weight: 800; margin-bottom: 8px;">⚙️ Tùy Chọn Chuyển Giao Mùa Giải:</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="activateResetPoints" checked style="width: 17px; height: 17px; margin-top: 2px;">
              <div>
                <strong>Đặt lại Điểm Mùa Này (seasonExp, seasonCp) về 0</strong>
                <div style="font-size: 12px; color: #15803d;">Làm mới điểm để mở chặng đua mới (Điểm Tổng All-Time được bảo lưu 100%).</div>
              </div>
            </label>
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; border-top: 1px dashed #bbf7d0; padding-top: 8px;">
              <input type="checkbox" id="activateFreezeOld" checked style="width: 17px; height: 17px; margin-top: 2px;">
              <div>
                <strong>Tự động đóng băng kết quả mùa cũ vào Bảng Vàng</strong>
                <div style="font-size: 12px; color: #15803d;">Chốt dữ liệu Top 50 EXP & CP của mùa trước vào Kho Lưu Trữ.</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.confirmActivateSeasonAction('${season.id}')">▶️ Xác Nhận Kích Hoạt Ngay</button>
    `;

    this.openModal();
  },

  confirmActivateSeasonAction(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;

    const resetPoints = document.getElementById("activateResetPoints") ? document.getElementById("activateResetPoints").checked : true;
    const freezeOld = document.getElementById("activateFreezeOld") ? document.getElementById("activateFreezeOld").checked : true;

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.activateSeason(seasonId, adminName, resetPoints, freezeOld);
      this.closeModal();
      this.showToast(`🎉 Đã kích hoạt mùa giải "${season.name}" làm mùa thi đấu chính thức!`, "success", 4000);
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  confirmReopenSeasonAction(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    if (confirm(`Bạn có chắc chắn muốn MỞ LẠI mùa giải "${season.name}" thành mùa giải đang diễn ra không?`)) {
      try {
        StorageService.reopenSeason(seasonId, adminName);
        this.showToast(`🎉 Đã mở lại mùa giải "${season.name}" thành công!`, "success", 3500);
        this.renderLeaderboardAdminView(document.getElementById("mainContent"));
      } catch (e) {
        this.showToast("❌ " + e.message, "danger", 3500);
      }
    }
  },

  confirmDeleteSeasonAction(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    if (confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA vĩnh viễn mùa giải "${season.name}" khỏi hệ thống không? Hành động này không thể hoàn tác.`)) {
      try {
        StorageService.deleteSeason(seasonId, adminName);
        this.showToast("🗑️ Đã xóa mùa giải khỏi hệ thống!", "info", 3000);
        this.renderLeaderboardAdminView(document.getElementById("mainContent"));
      } catch (e) {
        this.showToast("❌ " + e.message, "danger", 3500);
      }
    }
  },

  openViewSeasonStandingsModal(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season || !season.frozenStandings) {
      this.showToast("⚠️ Mùa giải này chưa có dữ liệu đóng băng!", "warning");
      return;
    }

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `🏆 Bảng Vàng Đóng Băng: ${season.name}`;

    const topExp = season.frozenStandings.topExp || [];
    const topCp = season.frozenStandings.topCp || [];

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="font-size: 13px; color: var(--text-secondary);">
          Kết quả thi đua chính thức khi bế mạc mùa giải ngày <strong>${new Date(season.closedAt || season.createdAt).toLocaleString('vi-VN')}</strong>:
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <!-- Top EXP -->
          <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px;">
            <div style="font-weight: 800; color: #b45309; margin-bottom: 8px; font-size: 13.5px;">⚡ Top 10 Học Tập (EXP):</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${topExp.slice(0, 10).map((u, i) => `
                <div style="display: flex; justify-content: space-between; font-size: 12.5px; border-bottom: 1px dashed var(--border); padding-bottom: 4px;">
                  <span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`} <strong>${u.name || u.rawName}</strong></span>
                  <strong style="color: #b45309;">${u.exp || u.seasonExp || 0} EXP</strong>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Top CP -->
          <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px;">
            <div style="font-weight: 800; color: #15803d; margin-bottom: 8px; font-size: 13.5px;">🌟 Top 10 Cống Hiến (CP):</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${topCp.slice(0, 10).map((u, i) => `
                <div style="display: flex; justify-content: space-between; font-size: 12.5px; border-bottom: 1px dashed var(--border); padding-bottom: 4px;">
                  <span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`} <strong>${u.name || u.rawName}</strong></span>
                  <strong style="color: #15803d;">${u.cp || u.seasonCp || 0} CP</strong>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-primary" onclick="App.exportSeasonCSV('${season.id}')">📥 Tải Báo Cáo CSV</button>
    `;

    this.openModal();
  },

  exportSeasonCSV(seasonId) {
    const seasons = StorageService.getSeasons();
    const season = seasons.find(s => s.id === seasonId);
    if (!season) {
      this.showToast("⚠️ Không tìm thấy dữ liệu mùa giải!", "warning");
      return;
    }

    const expList = (season.frozenStandings && season.frozenStandings.topExp) ? season.frozenStandings.topExp : StorageService.getLeaderboardData("exp", { scope: "season", includeHidden: true, statusFilter: "all" });

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += `BÁO CÁO KẾT QUẢ THI ĐUA MÙA GIẢI: ${season.name.toUpperCase()}\n`;
    csvContent += `Mã mùa: ${season.code || 'N/A'},Thời gian: ${season.startDate || ''} - ${season.endDate || ''},Khởi tạo bởi: ${season.createdBy || 'Admin'}\n\n`;
    csvContent += "Hạng,Họ và Tên,MSSV,Lớp,Khoa / Viện,Điểm EXP Mùa,Điểm CP Mùa,Trạng Thái\n";

    expList.forEach((u, idx) => {
      const name = (u.rawName || u.name || '').replace(/"/g, '""');
      const studentId = u.studentId || '';
      const className = u.className || '';
      const dept = (u.department || '').replace(/"/g, '""');
      const exp = u.exp || u.seasonExp || 0;
      const cp = u.cp || u.seasonCp || 0;
      const status = u.status === 'kicked' ? 'Đã bị kick' : 'Hoạt động';

      csvContent += `${idx + 1},"${name}","${studentId}","${className}","${dept}",${exp},${cp},"${status}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DThu_QuizMaster_MuaGiai_${(season.code || season.id)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast(`📥 Đã tải file báo cáo CSV mùa "${season.name}"!`, "success", 3000);
  },

  clearAuditLogsConfirm() {
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    if (confirm("⚠️ Bạn có chắc chắn muốn xóa toàn bộ lịch sử Nhật Ký Kiểm Toán không?")) {
      StorageService.clearAuditLogs(adminName);
      this.showToast("🗑️ Đã làm sạch lịch sử nhật ký kiểm toán!", "info", 3000);
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    }
  },

  toggleHideUserFromLeaderboardAdminAction(userId) {
    const isHidden = StorageService.toggleHideUserFromLeaderboard(userId);
    this.showToast(isHidden ? "🚫 Đã ẩn thành viên khỏi Bảng Xếp Hạng công khai!" : "✅ Đã cho phép thành viên hiển thị lại trên Bảng Xếp Hạng!", "info", 2500);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  onSearchLeaderboard(keyword) {
    this.leaderboardSearch = keyword;
    this.renderLeaderboardView(document.getElementById("mainContent"));
    const input = document.getElementById("leaderboardSearchInput");
    if (input) {
      input.focus();
      input.setSelectionRange(keyword.length, keyword.length);
    }
  },

  onFilterLeaderboardDept(dept) {
    this.leaderboardDept = dept;
    this.renderLeaderboardView(document.getElementById("mainContent"));
  },

  jumpToMyRank() {
    if (!StorageService.isLoggedIn()) {
      this.showToast("🔒 Vui lòng đăng nhập tài khoản sinh viên DThu để xem vị trí của bạn trên Bảng Xếp Hạng!", "warning", 3500);
      this.openAccountSwitcherModal();
      return;
    }

    const myRow = document.getElementById("leaderboard-my-row");
    if (myRow) {
      myRow.scrollIntoView({ behavior: "smooth", block: "center" });
      myRow.classList.add("leaderboard-row-highlight");
      setTimeout(() => {
        myRow.classList.remove("leaderboard-row-highlight");
      }, 3000);
      this.showToast("📍 Đã cuộn đến vị trí xếp hạng của bạn!", "info", 2000);
    } else {
      this.showToast("⚠️ Tài khoản của bạn hiện không nằm trong bộ lọc khoa/ngành hoặc tìm kiếm này!", "warning", 3500);
    }
  },

  // Modal Trao Huy Hiệu Đặc Cách / Vinh Danh (Admin)
  openAwardBadgeModal(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const settings = StorageService.getLeaderboardSettings();
    const currentBadge = (settings.customBadges && settings.customBadges[userId]) || "";

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `🎖️ Trao Huy Hiệu Vinh Danh: ${user.fullName}`;

    const presetBadges = [
      "🎖️ Sinh Viên 5 Tốt",
      "🚀 Chiến Binh Ôn Thi",
      "⭐ Gương Mặt Tiêu Biểu",
      "🏆 Quán Quân Olympic",
      "✍️ Cây Bút Vàng DThu",
      "🌟 Trưởng Ban Học Tập",
      "🔥 Siêu Sao Trắc Nghiệm",
      "NONE"
    ];

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px;">
          <div>👤 Sinh viên: <strong>${user.fullName}</strong> (MSSV: <code>${user.studentId}</code>)</div>
          <div style="margin-top: 4px; font-size: 12.5px; color: var(--text-secondary);">Khoa: ${user.department || 'ĐH Đồng Tháp'}</div>
          ${currentBadge ? `<div style="margin-top: 6px;">Huy hiệu hiện tại: <span class="custom-badge-pill">${currentBadge}</span></div>` : ''}
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Chọn danh hiệu có sẵn:</label>
          <select id="presetBadgeSelect" class="form-control" onchange="document.getElementById('customBadgeInput').value = (this.value === 'NONE' ? '' : this.value)">
            <option value="">-- Chọn danh hiệu mẫu hoặc tự nhập bên dưới --</option>
            ${presetBadges.map(b => `<option value="${b}" ${currentBadge === b ? 'selected' : ''}>${b === 'NONE' ? '❌ Gỡ huy hiệu (Xóa)' : b}</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Hoặc tự nhập danh hiệu tùy biến:</label>
          <input type="text" id="customBadgeInput" class="form-control" value="${currentBadge}" placeholder="Ví dụ: 🎗️ Đại Sứ Tri Thức 2026">
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveAwardBadgeAction('${user.id}')">💾 Trao Huy Hiệu</button>
    `;

    this.openModal();
  },

  saveAwardBadgeAction(userId) {
    const badgeVal = document.getElementById("customBadgeInput")?.value.trim();
    StorageService.setCustomUserBadge(userId, badgeVal);

    // Gửi thông báo đến sinh viên
    const user = StorageService.getUserById(userId);
    if (badgeVal) {
      StorageService.addNotification(userId, {
        type: "system_announcement",
        title: "🎖️ Chúc Mừng Bạn Đã Được Trao Danh Hiệu Đặc Cách!",
        message: `Ban Quản Trị DThu QuizMaster đã trao tặng bạn danh hiệu vinh danh "${badgeVal}" trên Bảng Xếp Hạng toàn trường. Hãy tiếp tục phát huy nhé!`,
        pointsDelta: null,
        pointType: null
      });
    }

    this.closeModal();
    this.showToast(badgeVal ? `🎉 Đã trao danh hiệu "${badgeVal}" cho ${user ? user.fullName : 'sinh viên'}!` : "✅ Đã gỡ huy hiệu đặc cách!", "success", 3500);
    if (this.currentView === "leaderboard-admin") {
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    } else {
      this.renderLeaderboardView(document.getElementById("mainContent"));
    }
  },

  // Xuất Báo Cáo Xếp Hạng Ra File CSV
  exportLeaderboardCSV() {
    const activeTab = this.leaderboardTab || "exp";
    const data = StorageService.getLeaderboardData(activeTab, {
      department: this.adminMemberDept || this.leaderboardDept,
      search: this.adminMemberSearch || this.leaderboardSearch,
      includeHidden: true
    });

    const isCp = (activeTab === "cp");

    // Tiêu đề cột
    const headers = ["Hang", "HoVaTen", "MSSV", "KhoaNganh", isCp ? "DiemCP" : "DiemEXP", isCp ? "SoCauDongGop" : "SoBaiThi", "DanhHieu", "TrangThaiBXH"];
    
    const rows = data.map(item => [
      item.rank,
      `"${(item.rawName || item.name || '').replace(/"/g, '""')}"`,
      `"${item.studentId || ''}"`,
      `"${(item.department || '').replace(/"/g, '""')}"`,
      isCp ? (item.cp || 0) : (item.exp || 0),
      isCp ? (item.questions || 0) : (item.quizzes || 0),
      `"${(item.customBadge || item.badge || '').replace(/"/g, '""')}"`,
      item.isHidden ? "DaAn" : "HienThi"
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `BangXepHang_DThu_${activeTab.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast(`📥 Đã tải xuống báo cáo "${fileName}" thành công!`, "success", 3500);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 8. STUDY MATERIALS VIEW (KHO TÀI LIỆU .TXT)
  // ═════════════════════════════════════════════════════════════════════════
  renderMaterialsView(container, activeId) {
    if (!StorageService.isLoggedIn()) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="font-size: 52px; margin-bottom: 14px;">📚</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Kho Tài Liệu Học Tập (.txt)</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Vui lòng đăng nhập tài khoản sinh viên DThu để mở khóa toàn bộ kho tài liệu tóm tắt lý thuyết, đề cương ôn thi và tải về máy.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 22px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()">🔑 Đăng Nhập Ngay ➔</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
          </div>
        </div>
      `;
      return;
    }

    const materials = StorageService.getMaterials();
    const active = materials.find(m => m.id === activeId) || materials[0];
    this.activeMaterialId = active ? active.id : null;

    container.innerHTML = `
      <div class="view-materials">
        <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary);">📚 Kho Tài Liệu Học Tập (.txt)</h2>
            <p style="color: var(--text-secondary);">Tóm tắt lý thuyết, đề cương ôn thi và thuật ngữ chuyên ngành Đại học Đồng Tháp.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.openUploadMaterialModal()">
            ➕ Tải lên tài liệu (.txt)
          </button>
        </div>

        <div class="materials-layout">
          <!-- Left: List -->
          <div class="materials-list-panel">
            ${materials.map(m => `
              <div class="material-item-card ${m.id === this.activeMaterialId ? 'active' : ''}" onclick="App.renderMaterialsView(document.getElementById('mainContent'), '${m.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span class="badge badge-gray">${m.fileType ? m.fileType.toUpperCase() : 'TXT'}</span>
                  <span style="font-size: 11px; color: var(--text-tertiary);">${m.subjectId || 'DThu'}</span>
                </div>
                <h4 style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${m.title}</h4>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${m.description || ''}</div>
                <div style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 8px;">Tác giả: ${m.author || 'DThu'}</div>
              </div>
            `).join('')}
          </div>

          <!-- Right: Reader -->
          <div class="material-reader-panel">
            ${active ? `
              <div class="material-reader-toolbar">
                <div>
                  <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${active.title}</h3>
                  <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">Tác giả: <strong>${active.author || 'DThu'}</strong> · Định dạng: <strong>.txt</strong></div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm" onclick="App.copyMaterialText()">📋 Sao chép</button>
                  <button class="btn btn-sm btn-primary" onclick="App.downloadMaterialTxt('${active.id}')">📥 Tải file .txt</button>
                </div>
              </div>

              <div class="material-content-box" id="materialContentBox">${SmartParserService.formatRichText(active.content || '')}</div>
            ` : `
              <div style="text-align: center; padding: 60px 20px; color: var(--text-tertiary);">
                Chưa có tài liệu nào được chọn.
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  copyMaterialText() {
    const materials = StorageService.getMaterials();
    const active = materials.find(m => m.id === this.activeMaterialId);
    if (active && active.content) {
      navigator.clipboard.writeText(active.content).then(() => {
        this.showToast("📋 Đã sao chép nội dung tài liệu vào bộ nhớ tạm!", "success", 2500);
      });
    }
  },

  downloadMaterialTxt(id) {
    const materials = StorageService.getMaterials();
    const active = materials.find(m => m.id === id);
    if (active) {
      const blob = new Blob([active.content || ""], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (active.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')) + ".txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  },

  openUploadMaterialModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "➕ Tải lên tài liệu học tập (.txt)";
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tiêu đề tài liệu (*):</label>
        <input type="text" id="matTitleInput" class="form-control" placeholder="Ví dụ: Tóm tắt 7 chương Kinh tế Chính trị">
      </div>
      <div class="form-group">
        <label class="form-label">Mã môn học liên quan:</label>
        <input type="text" id="matSubjectInput" class="form-control" placeholder="Ví dụ: POL103, BIO202...">
      </div>
      <div class="form-group">
        <label class="form-label">Tác giả / Người biên soạn:</label>
        <input type="text" id="matAuthorInput" class="form-control" value="${StorageService.getUserProfile().fullName}">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả ngắn gọn:</label>
        <input type="text" id="matDescInput" class="form-control" placeholder="Mô tả nội dung trọng tâm tài liệu...">
      </div>
      <div class="form-group">
        <label class="form-label">Nội dung văn bản (*):</label>
        <textarea id="matContentInput" class="form-control" rows="8" placeholder="Dán nội dung tài liệu dạng text vào đây..."></textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveUploadedMaterial()">Lưu tài liệu (+20 EXP)</button>
    `;

    modal.classList.add("active");
  },

  saveUploadedMaterial() {
    const title = document.getElementById("matTitleInput")?.value.trim();
    const subId = document.getElementById("matSubjectInput")?.value.trim() || "DThu";
    const author = document.getElementById("matAuthorInput")?.value.trim() || "Sinh viên DThu";
    const desc = document.getElementById("matDescInput")?.value.trim() || "";
    const content = document.getElementById("matContentInput")?.value.trim();

    if (!title || !content) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ Tiêu đề và Nội dung tài liệu!", "warning");
      return;
    }

    const newMat = {
      id: "mat-" + Date.now(),
      subjectId: subId,
      title,
      fileType: "txt",
      author,
      description: desc,
      content
    };

    const materials = StorageService.getMaterials();
    materials.unshift(newMat);
    StorageService.saveMaterials(materials);

    // Ghi nhận tích lũy ký tự đóng góp tài liệu
    const profile = StorageService.getUserProfile();
    const cpGained = StorageService.recordMaterialContribution(profile.id, content.length, title);

    this.closeModal();
    if (cpGained > 0) {
      this.showToast(`🎉 Đã lưu tài liệu "${title}" và đạt mốc thưởng +${cpGained} CP!`, "success", 4000);
    } else {
      this.showToast(`🎉 Đã lưu tài liệu "${title}" và cộng ${content.length.toLocaleString()} ký tự vào tiến độ tích lũy CP!`, "success", 4000);
    }
    this.renderHeader();
    this.renderMaterialsView(document.getElementById("mainContent"), newMat.id);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 9. MODERATION → Chuyển hướng sang Quản Lý Bộ Đề (Tab Chờ Duyệt)
  // ═════════════════════════════════════════════════════════════════════════
  renderModerationView(container) {
    this.adminSubjectTab = "drafts";
    this.renderManageView(container);
  },
  approveDraft(draftId) {
    const res = StorageService.approveDraft(draftId);
    if (res) {
      this.showToast(`🎉 Đã duyệt bộ đề và gộp vào môn "${res.name}" (${res.code || res.id}) thành công! (Điểm Cống Hiến CP đã được trao theo sản lượng)`, "success", 4500);
      this.renderHeader();
      this.renderManageView(document.getElementById("mainContent"));
    }
  },

  rejectDraftConfirm(draftId) {
    this.showConfirmDialog({
      title: "Xác nhận từ chối đề thi",
      message: "Bạn có chắc chắn muốn từ chối bộ đề này không? Bộ đề sẽ bị xóa khỏi hàng đợi duyệt.",
      icon: "⚠️",
      confirmText: "Từ chối đề",
      isDanger: true,
      onConfirm: () => {
        StorageService.rejectDraft(draftId);
        this.renderHeader();
        this.renderManageView(document.getElementById("mainContent"));
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 9.1. NOTIFICATION CENTER & SYSTEM CHANGELOG (TRUNG TÂM THÔNG BÁO & CẬP NHẬT)
  // ═════════════════════════════════════════════════════════════════════════
  renderNotificationsView(container, data = {}) {
    const isLogged = StorageService.isLoggedIn();
    if (!isLogged) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="font-size: 54px; margin-bottom: 14px;">🔔</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Trung Tâm Thông Báo</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Vui lòng đăng nhập tài khoản sinh viên DThu để nhận các thông báo về biến động điểm thưởng EXP, Điểm cống hiến (CP), kết quả duyệt đề thi và thông báo từ Ban quản trị.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()">🔑 Đăng Nhập Ngay</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
          </div>
        </div>
      `;
      return;
    }

    const profile = StorageService.getUserProfile();
    const activeTab = this.notifTab || "personal";
    const activeFilter = this.notifFilter || "all";
    const allNotifs = StorageService.getNotifications(profile.id);
    const unreadCount = StorageService.getUnreadNotificationCount(profile.id);

    // Lọc thông báo theo tiêu chí
    let filteredNotifs = allNotifs;
    if (activeFilter === "unread") {
      filteredNotifs = allNotifs.filter(n => !n.read);
    } else if (activeFilter === "points") {
      filteredNotifs = allNotifs.filter(n => n.pointsDelta !== null);
    } else if (activeFilter === "admin") {
      filteredNotifs = allNotifs.filter(n => n.type === "admin_adjust");
    }

    container.innerHTML = `
      <div style="padding: 28px 20px; max-width: 950px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <span>🔔</span>
              <span>Trung Tâm Thông Báo & Cập Nhật</span>
              ${unreadCount > 0 ? `<span class="badge" style="background:#ef4444; color:#fff; font-size:12px; font-weight:800;">${unreadCount} chưa đọc</span>` : ''}
            </h2>
            <p style="color: var(--text-secondary); margin-top: 4px; font-size: 13.5px;">
              Xem lịch sử biến động điểm EXP/CP, thông báo từ Admin và bản tin cập nhật tính năng mới.
            </p>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm" onclick="StorageService.markAllNotificationsAsRead('${profile.id}'); App.renderHeader(); App.renderNotificationsView(document.getElementById('mainContent'));">
              ✔️ Đánh dấu đã đọc tất cả
            </button>
            <button class="btn btn-sm btn-danger" onclick="App.clearAllNotificationsConfirm('${profile.id}')">
              🗑️ Xóa thông báo
            </button>
          </div>
        </div>

        <!-- Tabs: Thông Báo Cá Nhân vs Bản Tin Cập Nhật -->
        <div class="hub-tabs" style="margin-bottom: 24px;">
          <button class="hub-tab-btn ${activeTab === 'personal' ? 'active' : ''}" onclick="App.notifTab = 'personal'; App.renderNotificationsView(document.getElementById('mainContent'));">
            🔔 Thông Báo Cá Nhân <span class="badge-tab-count">${allNotifs.length}</span>
          </button>
          <button class="hub-tab-btn ${activeTab === 'changelog' ? 'active' : ''}" onclick="App.notifTab = 'changelog'; App.renderNotificationsView(document.getElementById('mainContent'));">
            📢 Bản Tin Cập Nhật Hệ Thống <span class="badge-tab-count">v2.2</span>
          </button>
        </div>

        ${activeTab === 'personal' ? `
          <!-- Bộ lọc thông báo cá nhân -->
          <div style="display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 13px; font-weight: 700; color: var(--text-secondary);">Lọc theo:</span>
            <button class="btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : ''}" onclick="App.notifFilter = 'all'; App.renderNotificationsView(document.getElementById('mainContent'));">
              Tất cả (${allNotifs.length})
            </button>
            <button class="btn btn-sm ${activeFilter === 'unread' ? 'btn-primary' : ''}" onclick="App.notifFilter = 'unread'; App.renderNotificationsView(document.getElementById('mainContent'));">
              Chưa đọc (${unreadCount})
            </button>
            <button class="btn btn-sm ${activeFilter === 'points' ? 'btn-primary' : ''}" onclick="App.notifFilter = 'points'; App.renderNotificationsView(document.getElementById('mainContent'));">
              ⚡/🌟 Biến động điểm (${allNotifs.filter(n => n.pointsDelta !== null).length})
            </button>
            <button class="btn btn-sm ${activeFilter === 'admin' ? 'btn-primary' : ''}" onclick="App.notifFilter = 'admin'; App.renderNotificationsView(document.getElementById('mainContent'));">
              🛡️ Từ Quản trị viên (${allNotifs.filter(n => n.type === 'admin_adjust').length})
            </button>
          </div>

          <!-- Danh sách thông báo cá nhân -->
          ${filteredNotifs.length === 0 ? `
            <div style="text-align: center; padding: 56px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
              <div style="font-size: 42px; margin-bottom: 10px;">📭</div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">Không có thông báo nào trong mục này</h3>
              <p style="color: var(--text-secondary); margin-top: 4px; font-size: 13px;">Hãy làm bài thi thử hoặc đóng góp tài liệu để nhận thông báo thưởng điểm nhé!</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${filteredNotifs.map(n => {
                let icon = "🔔";
                let badgeClass = "badge-gray";
                let pointBadge = "";

                if (n.type === "exp_reward") {
                  icon = "⚡";
                  badgeClass = "badge-blue";
                } else if (n.type === "cp_reward") {
                  icon = "🌟";
                  badgeClass = "badge-success";
                } else if (n.type === "admin_adjust") {
                  icon = "🛡️";
                  badgeClass = "badge-purple";
                } else if (n.type === "draft_approved") {
                  icon = "🎉";
                  badgeClass = "badge-success";
                }

                if (typeof n.pointsDelta === "number") {
                  const isPos = n.pointsDelta > 0;
                  const color = isPos ? (n.pointType === 'CP' ? '#15803d' : '#b45309') : '#dc2626';
                  const bg = isPos ? (n.pointType === 'CP' ? '#dcfce7' : '#fef3c7') : '#fee2e2';
                  pointBadge = `<span class="badge" style="background:${bg}; color:${color}; font-weight:800; font-size:12px;">${isPos ? '+' : ''}${n.pointsDelta} ${n.pointType || 'EXP'}</span>`;
                }

                const timeAgo = this.formatRelativeTime(n.createdAt);

                return `
                  <div class="notif-card ${!n.read ? 'unread' : ''}" onclick="StorageService.markNotificationAsRead('${profile.id}', '${n.id}'); App.renderHeader(); this.classList.remove('unread');" style="cursor: pointer;">
                    <div class="notif-card-icon">${icon}</div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 4px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <strong style="font-size: 14.5px; color: var(--text-primary);">${n.title}</strong>
                          ${pointBadge}
                          ${!n.read ? '<span style="width:7px; height:7px; background:#16a34a; border-radius:50%; display:inline-block;" title="Chưa đọc"></span>' : ''}
                        </div>
                        <span style="font-size: 12px; color: var(--text-tertiary);">${timeAgo}</span>
                      </div>
                      <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                        ${n.message}
                      </p>
                    </div>
                    <button class="btn btn-sm" style="padding: 4px 8px; font-size: 11px; opacity: 0.7;" onclick="event.stopPropagation(); StorageService.deleteNotification('${profile.id}', '${n.id}'); App.renderHeader(); App.renderNotificationsView(document.getElementById('mainContent'));" title="Xóa thông báo này">
                      ✕
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        ` : `
          <!-- Tab Bản Tin Cập Nhật Hệ Thống (Release Notes & Changelog) -->
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Phiên bản 2.2 -->
            <div class="changelog-card">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="changelog-tag">Phiên bản 2.2 · Mới nhất</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Hệ Thống Điểm Cống Hiến Sản Lượng & Trung Tâm Thông Báo</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">Tháng 8/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
                <li><strong>🌟 Thang Điểm Cống Hiến (CP) Theo Sản Lượng</strong>: Tính điểm công bằng và cộng dồn lũy tiến (cứ 50 câu hỏi trắc nghiệm được duyệt $\rightarrow$ +5 CP; cứ 5.000 ký tự tài liệu chia sẻ $\rightarrow$ +5 CP). Chống spam và không buff điểm tràn lan.</li>
                <li><strong>⚡ Thang Điểm EXP Học Tập Nghiêm Ngặt</strong>: Tính điểm thi thử dựa trên kết quả thực tế, yêu cầu làm từ 5 câu trở lên và thời gian làm bài hợp lý.</li>
                <li><strong>🔔 Trung Tâm Thông Báo & Chuông Header</strong>: Hiển thị minh bạch mọi biến động điểm, đề thi được duyệt và thông báo điều chỉnh từ Quản trị viên.</li>
                <li><strong>🏆 Bảng Xếp Hạng Đa Chiều</strong>: Hỗ trợ chuyển đổi linh hoạt giữa Top 10 Học Tập (EXP) và Top 10 Đại Sứ Cống Hiến (CP).</li>
              </ul>
            </div>

            <!-- Phiên bản 2.1 -->
            <div class="changelog-card">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="changelog-tag" style="background:#f1f5f9; color:#475569;">Phiên bản 2.1</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Header Tinh Gọn & Nút Hướng Dẫn Hút Cạnh Thông Minh</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">Tháng 8/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
                <li><strong>🎯 Tinh Gọn Header</strong>: Loại bỏ các nút điều hướng thừa trên cùng, quay về trang chủ nhanh bằng cách nhấp Logo.</li>
                <li><strong>💡 Nút Hướng Dẫn Kéo Thả Tự Hút Cạnh (Snap-to-Edge Magnetism)</strong>: Kéo di chuyển tự do bằng chuột/cảm ứng, tự động hút sát vào mép màn hình gần nhất và ghi nhớ vị trí trên thiết bị.</li>
                <li><strong>🚪 Chế Độ Tập Trung Làm Bài & Cảnh Báo An Toàn</strong>: Tự động chặn thoát trang dở dang khi đang thi thử.</li>
              </ul>
            </div>

            <!-- Phiên bản 2.0 -->
            <div class="changelog-card">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="changelog-tag" style="background:#f1f5f9; color:#475569;">Phiên bản 2.0</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Trang Cấu Hình Bài Thi Đa Dạng & Router Hash History</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">Tháng 8/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
                <li><strong>📝 Trang Cấu Hình Bài Thi Độc Lập</strong>: Tùy chọn Chế độ Ôn tập (hiện đáp án ngay) vs Thi thử tính giờ, chọn số lượng câu hỏi, xáo trộn câu và xáo đáp án A-B-C-D.</li>
                <li><strong>🔙 Hỗ Trợ Nút Back Trình Duyệt</strong>: Điều hướng mượt mà, lưu lịch sử duyệt trang và hỗ trợ URL hash trực tiếp.</li>
              </ul>
            </div>
          </div>
        `}
      </div>
    `;
  },

  formatRelativeTime(isoString) {
    if (!isoString) return "Vừa xong";
    try {
      const past = new Date(isoString).getTime();
      const diff = Math.floor((Date.now() - past) / 1000);
      if (diff < 60) return "Vừa xong";
      if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
      return new Date(isoString).toLocaleDateString("vi-VN");
    } catch (e) {
      return "Gần đây";
    }
  },

  clearAllNotificationsConfirm(userId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa toàn bộ thông báo",
      message: "Bạn có chắc chắn muốn xóa toàn bộ danh sách thông báo cá nhân không?",
      icon: "🗑️",
      confirmText: "Xóa toàn bộ",
      isDanger: true,
      onConfirm: () => {
        StorageService.saveNotifications(userId, []);
        App.renderHeader();
        App.showToast("🗑️ Đã xóa sạch thông báo!", "info", 2500);
        App.renderNotificationsView(document.getElementById("mainContent"));
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 10. USERS MANAGEMENT DASHBOARD (QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN CHO ADMIN)
  // ═════════════════════════════════════════════════════════════════════════
  async renderUsersManagementView(container) {
    const profile = StorageService.getUserProfile();
    const canManage = profile.role === "admin" || StorageService.hasPermission("canManageUsers");

    if (!canManage) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 600px; margin: 0 auto;">
          <div style="font-size: 54px; margin-bottom: 12px;">🛡️</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Khu vực dành riêng cho Quản Trị Viên (Admin)</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Bạn hiện đang đăng nhập với vai trò <strong>${profile.role === 'editor' ? 'Ban Biên Tập (Editor)' : 'Sinh Viên (Student)'}</strong> và không có quyền truy cập vào bảng điều khiển quản lý người dùng.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()">🔑 Đổi sang tài khoản Admin</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về Trang chủ</button>
          </div>
        </div>
      `;
      return;
    }

    if (!this.adminUserTab) this.adminUserTab = "active";
    if (!this.selectedUserIds) this.selectedUserIds = new Set();
    if (typeof this.userSearchQuery === "undefined") this.userSearchQuery = "";
    if (typeof this.userRoleFilter === "undefined") this.userRoleFilter = "all";
    if (typeof this.userDeptFilter === "undefined") this.userDeptFilter = "all";
    if (typeof this.auditLogActionFilter === "undefined") this.auditLogActionFilter = "all";

    // Tự động kéo dữ liệu mới nhất từ Supabase Cloud
    if (typeof StorageService !== "undefined" && typeof StorageService.syncWithCloud === "function") {
      await StorageService.syncWithCloud();
    }

    // Thiết lập auto-polling mỗi 2.5 giây khi Admin đang ở trang Quản trị người dùng để nhận diện hồ sơ đăng ký mới ngay lập tức
    if (!this.adminLivePollInterval) {
      this.adminLivePollInterval = setInterval(async () => {
        if (App.currentView === "users-management") {
          const prevPending = StorageService.getPendingUsers().length;
          await StorageService.syncWithCloud();
          const newPending = StorageService.getPendingUsers().length;
          if (newPending !== prevPending) {
            App.renderHeader();
            App.renderUsersManagementView(document.getElementById("mainContent"));
            if (newPending > prevPending) {
              App.showToast(`🔔 Có ${newPending - prevPending} yêu cầu đăng ký mới vừa gửi từ sinh viên!`, "info", 4000);
            }
          }
        } else {
          clearInterval(App.adminLivePollInterval);
          App.adminLivePollInterval = null;
        }
      }, 2500);
    }

    const allUsers = StorageService.getAllUsers();
    const activeUsers = StorageService.getActiveUsers();
    const pendingUsers = StorageService.getPendingUsers();
    const resetRequests = StorageService.getResetRequests();
    const auditLogs = StorageService.getAuditLogs();

    const filteredActiveUsers = this.getFilteredActiveUsers();

    const admins = allUsers.filter(u => u.role === "admin" && u.status === "active");
    const editors = allUsers.filter(u => u.role === "editor" && u.status === "active");
    const students = allUsers.filter(u => u.role === "student" && u.status === "active");
    const depts = [...new Set(allUsers.map(u => u.department || "Khác"))];

    container.innerHTML = `
      <div class="view-users-management">
        <!-- Top Header -->
        <div class="users-management-header">
          <div>
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary);">👥 Quản Trị Người Dùng & Phân Quyền</h2>
            <p style="color: var(--text-secondary); margin-top: 4px;">
              Quản lý danh sách sinh viên, phê duyệt hồ sơ đăng ký mới, cấp quyền biên tập viên và kiểm toán hệ thống.
            </p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <button class="btn" style="border-color: #6366f1; color: #4338ca; font-weight: 700;" onclick="App.exportUsersCSV()" title="Xuất danh sách thành viên ra file CSV / Excel">
              📥 Xuất CSV
            </button>
            <button class="btn" style="border-color: #10b981; color: #047857; font-weight: 700;" onclick="App.refreshUsersFromCloud()">🔄 Làm Mới Cloud</button>
            <button class="btn" style="border-color: #0284c7; color: #0284c7;" onclick="App.openAppsScriptConfigModal()">⚙️ Google Apps Script</button>
            <button class="btn btn-primary" onclick="App.openCreateUserModal()">➕ Thêm Thành Viên</button>
            <button class="btn" onclick="App.openAccountSwitcherModal()">🔄 Đổi Tài Khoản</button>
          </div>
        </div>

        <!-- 4 Thẻ Thống Kê Tổng Quan -->
        <div class="users-stat-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
          <div class="user-stat-card">
            <div class="user-stat-icon">👥</div>
            <div>
              <div class="user-stat-num">${activeUsers.length}</div>
              <div class="user-stat-label">Thành viên hoạt động</div>
            </div>
          </div>
          <div class="user-stat-card" style="border-color: ${pendingUsers.length > 0 ? '#fcd34d' : 'var(--border)'}; background: ${pendingUsers.length > 0 ? '#fffbeb' : 'var(--surface)'};">
            <div class="user-stat-icon">⏳</div>
            <div>
              <div class="user-stat-num" style="color: #b45309;">${pendingUsers.length}</div>
              <div class="user-stat-label">Hồ sơ chờ phê duyệt</div>
            </div>
          </div>
          <div class="user-stat-card">
            <div class="user-stat-icon">👑</div>
            <div>
              <div class="user-stat-num" style="color: #b45309;">${admins.length}</div>
              <div class="user-stat-label">Quản trị viên (Admin)</div>
            </div>
          </div>
          <div class="user-stat-card">
            <div class="user-stat-icon">🆘</div>
            <div>
              <div class="user-stat-num" style="color: #e11d48;">${resetRequests.filter(r => r.status === 'pending').length}</div>
              <div class="user-stat-label">Yêu cầu CSKH / Quên PIN</div>
            </div>
          </div>
        </div>

        <!-- Admin Tab Bar (4 Tabs) -->
        <div class="admin-tab-bar">
          <button class="admin-tab-btn ${this.adminUserTab === 'active' ? 'active' : ''}" onclick="App.switchAdminUserTab('active')">
            👥 Thành Viên Hoạt Động <span class="badge" style="background:#e2e8f0; color:#334155; font-size:11px;">${activeUsers.length}</span>
          </button>
          <button class="admin-tab-btn ${this.adminUserTab === 'pending' ? 'active' : ''}" onclick="App.switchAdminUserTab('pending')">
            ⏳ Chờ Phê Duyệt Đăng Ký ${pendingUsers.length > 0 ? `<span class="badge-pending">${pendingUsers.length} mới</span>` : `<span class="badge" style="background:#e2e8f0; color:#334155; font-size:11px;">0</span>`}
          </button>
          <button class="admin-tab-btn ${this.adminUserTab === 'resets' ? 'active' : ''}" onclick="App.switchAdminUserTab('resets')">
            🆘 Hỗ Trợ Quên PIN / CSKH <span class="badge" style="background:#fee2e2; color:#b91c1c; font-size:11px;">${resetRequests.length}</span>
          </button>
          <button class="admin-tab-btn ${this.adminUserTab === 'audit_logs' ? 'active' : ''}" onclick="App.switchAdminUserTab('audit_logs')">
            📋 Nhật Ký Hoạt Động <span class="badge" style="background:#f1f5f9; color:#475569; font-size:11px;">${auditLogs.length}</span>
          </button>
        </div>

        <!-- Nội dung theo Tab được chọn -->
        ${this.adminUserTab === 'active' ? `
          <!-- Thanh Tìm kiếm & Bộ lọc cho Active Users (Binding bền vững) -->
          <div class="search-filter-bar" style="margin: 0 0 12px 0;">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input type="text" id="userSearchInput" class="form-control" placeholder="Tìm theo tên, MSSV, email..." value="${this.userSearchQuery || ''}" oninput="App.onSearchUsers()">
            </div>
            <select id="userRoleFilter" class="form-control" style="width: auto; min-width: 170px;" onchange="App.onSearchUsers()">
              <option value="all" ${this.userRoleFilter === 'all' ? 'selected' : ''}>Tất cả vai trò</option>
              <option value="admin" ${this.userRoleFilter === 'admin' ? 'selected' : ''}>👑 Quản trị viên (Admin)</option>
              <option value="editor" ${this.userRoleFilter === 'editor' ? 'selected' : ''}>🛡️ Ban Biên Tập (Editor)</option>
              <option value="student" ${this.userRoleFilter === 'student' ? 'selected' : ''}>👨‍🎓 Sinh viên</option>
            </select>
            <select id="userDeptFilter" class="form-control" style="width: auto; min-width: 200px;" onchange="App.onSearchUsers()">
              <option value="all" ${this.userDeptFilter === 'all' ? 'selected' : ''}>Tất cả khoa / ngành</option>
              ${depts.map(d => `<option value="${d}" ${this.userDeptFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
            ${(this.userSearchQuery || this.userRoleFilter !== 'all' || this.userDeptFilter !== 'all') ? `
              <button class="btn btn-sm" onclick="App.clearUserFilters()" title="Xóa toàn bộ bộ lọc">
                🔄 Xóa lọc
              </button>
            ` : ''}
          </div>

          <!-- Thanh Thao Tác Hàng Loạt Tối Giản Cho Active Users -->
          ${this.selectedUserIds && this.selectedUserIds.size > 0 ? `
            <div id="usersBulkToolbar" style="background: #f8fafc; border: 1.5px solid #0284c7; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #0369a1;">
                <span>☑️ Đã chọn: <strong>${this.selectedUserIds.size}</strong> thành viên</span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm" style="background:#fef3c7; color:#b45309; border-color:#fde68a; font-weight:700;" onclick="App.openBulkAdjustPointsModal('users')">
                  ⚡ Sửa Điểm Hàng Loạt
                </button>
                <button class="btn btn-sm" style="background:#fdf4ff; color:#86198f; border-color:#f0abfc; font-weight:700;" onclick="App.openBulkAwardBadgeModal('users')">
                  🎖️ Trao Huy Hiệu
                </button>
                <button class="btn btn-sm" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5; font-weight:700;" onclick="App.bulkToggleUserStatusAction('suspended')">
                  🔒 Tạm Khóa (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm" style="background:#dcfce7; color:#15803d; border-color:#86efac; font-weight:700;" onclick="App.bulkToggleUserStatusAction('active')">
                  🔓 Mở Khóa (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm btn-danger" onclick="App.bulkDeleteUsersConfirm()">
                  🗑️ Xóa (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm" onclick="App.clearUserSelections()">
                  ❌ Bỏ Chọn
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Bảng Danh Sách Thành Viên Hoạt Động -->
          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center;">
                    <input type="checkbox" id="selectAllActiveUsers" ${filteredActiveUsers.length > 0 && filteredActiveUsers.every(u => this.selectedUserIds && this.selectedUserIds.has(u.id)) ? 'checked' : ''} onchange="App.toggleSelectAllUsers(this.checked, 'active')" title="Chọn / Bỏ chọn tất cả (theo bộ lọc hiện tại)">
                  </th>
                  <th>Thành Viên</th>
                  <th>Khoa / Ngành</th>
                  <th>Vai Trò</th>
                  <th>Quyền Hạn Cấp Phép</th>
                  <th>Điểm EXP</th>
                  <th>Trạng Thái</th>
                  <th style="text-align: right;">Thao Tác</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                ${this.renderUsersTableRows(filteredActiveUsers)}
              </tbody>
            </table>
          </div>
        ` : this.adminUserTab === 'pending' ? `
          <!-- Thanh Thao Tác Hàng Loạt Tối Giản Cho Hồ Sơ Chờ Phê Duyệt -->
          ${this.selectedUserIds && this.selectedUserIds.size > 0 ? `
            <div id="pendingBulkToolbar" style="background: #fefce8; border: 1.5px solid #eab308; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="font-size: 13px; font-weight: 700; color: #854d0e;">
                <span>☑️ Đã chọn: <strong>${this.selectedUserIds.size}</strong> hồ sơ chờ duyệt</span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="App.bulkApprovePendingUsersAction()">
                  ✅ Phê Duyệt Tất Cả (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm btn-danger" onclick="App.bulkRejectPendingUsersAction()">
                  ❌ Từ Chối Tất Cả (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm" onclick="App.clearUserSelections()">
                  ❌ Bỏ Chọn
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Bảng Danh Sách Chờ Phê Duyệt -->
          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center;">
                    <input type="checkbox" id="selectAllPendingUsers" ${pendingUsers.length > 0 && pendingUsers.every(u => this.selectedUserIds && this.selectedUserIds.has(u.id)) ? 'checked' : ''} onchange="App.toggleSelectAllUsers(this.checked, 'pending')" title="Chọn / Bỏ chọn tất cả">
                  </th>
                  <th>Sinh Viên Đăng Ký</th>
                  <th>Khoa / Chuyên Ngành</th>
                  <th>Email Nhận Thông Báo</th>
                  <th>Ngày Đăng Ký</th>
                  <th>Trạng Thái</th>
                  <th style="text-align: right;">Phê Duyệt / Quyết Định</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderPendingUsersTableRows(pendingUsers)}
              </tbody>
            </table>
          </div>
        ` : this.adminUserTab === 'resets' ? `
          <!-- Bảng Yêu Cầu Khôi Phục Mã PIN / CSKH -->
          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Sinh Viên Gửi Yêu Cầu</th>
                  <th>Thông Tin Liên Hệ</th>
                  <th>Nội Dung Ghi Chú</th>
                  <th>Thời Gian Gửi</th>
                  <th>Trạng Thái</th>
                  <th style="text-align: right;">Xử Lý / Cấp PIN</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderResetRequestsTableRows(resetRequests)}
              </tbody>
            </table>
          </div>
        ` : `
          <!-- Tab Nhật Ký Kiểm Toán & Hoạt Động Hệ Thống -->
          <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-weight: 700; font-size: 13px; color: var(--text-secondary);">Lọc theo hành động:</span>
              <select id="userAuditFilter" class="form-control" style="width: auto; min-width: 180px;" onchange="App.onUserAuditFilterChange(this.value)">
                <option value="all" ${this.auditLogActionFilter === 'all' ? 'selected' : ''}>Tất cả hành động (${auditLogs.length})</option>
                <option value="EDIT_USER" ${this.auditLogActionFilter === 'EDIT_USER' ? 'selected' : ''}>Sửa thông tin & phân quyền</option>
                <option value="CREATE_USER" ${this.auditLogActionFilter === 'CREATE_USER' ? 'selected' : ''}>Thêm thành viên</option>
                <option value="TOGGLE_USER_STATUS" ${this.auditLogActionFilter === 'TOGGLE_USER_STATUS' ? 'selected' : ''}>Khóa/Mở tài khoản</option>
                <option value="BULK_STATUS_CHANGE" ${this.auditLogActionFilter === 'BULK_STATUS_CHANGE' ? 'selected' : ''}>Thao tác hàng loạt</option>
                <option value="ADJUST_POINTS" ${this.auditLogActionFilter === 'ADJUST_POINTS' ? 'selected' : ''}>Điều chỉnh điểm EXP/CP</option>
                <option value="AWARD_BADGE" ${this.auditLogActionFilter === 'AWARD_BADGE' ? 'selected' : ''}>Trao danh hiệu / huy hiệu</option>
              </select>
            </div>
            <div>
              <button class="btn btn-sm btn-danger" onclick="App.clearAuditLogsConfirm()">
                🗑️ Xóa Lịch Sử Nhật Ký
              </button>
            </div>
          </div>

          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th style="width: 160px;">Thời Gian</th>
                  <th style="width: 140px;">Người Thực Hiện</th>
                  <th style="width: 160px;">Hành Động</th>
                  <th>Đối Tượng</th>
                  <th>Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderAuditLogsTableRows(auditLogs)}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  switchAdminUserTab(tab) {
    this.adminUserTab = tab;
    if (this.selectedUserIds) this.selectedUserIds.clear();
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  clearUserFilters() {
    this.userSearchQuery = "";
    this.userRoleFilter = "all";
    this.userDeptFilter = "all";
    if (this.selectedUserIds) this.selectedUserIds.clear();
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  getFilteredActiveUsers() {
    const all = StorageService.getActiveUsers();
    const query = (this.userSearchQuery || "").toLowerCase().trim();
    const role = this.userRoleFilter || "all";
    const dept = this.userDeptFilter || "all";

    return all.filter(u => {
      const matchQuery = !query || 
        (u.fullName && u.fullName.toLowerCase().includes(query)) ||
        (u.studentId && u.studentId.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query));
      const matchRole = role === "all" || u.role === role;
      const matchDept = dept === "all" || u.department === dept;
      return matchQuery && matchRole && matchDept;
    });
  },

  exportUsersCSV() {
    const users = this.getFilteredActiveUsers();
    if (!users || users.length === 0) {
      this.showToast("⚠️ Không có dữ liệu thành viên nào để xuất CSV!", "warning");
      return;
    }

    let csvContent = "\uFEFF"; // UTF-8 BOM cho tiếng Việt
    csvContent += "MSSV,Họ và Tên,Email,Khoa/Ngành,Vai Trò,EXP Tổng,CP Cống Hiến,Trạng Thái,Ngày Tham Gia\n";

    users.forEach(u => {
      const row = [
        `"${(u.studentId || '').replace(/"/g, '""')}"`,
        `"${(u.fullName || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.department || 'ĐH Đồng Tháp').replace(/"/g, '""')}"`,
        `"${u.role === 'admin' ? 'Quản trị viên' : u.role === 'editor' ? 'Ban Biên Tập' : 'Sinh Viên'}"`,
        u.totalExp || 0,
        u.contributionPoints || 0,
        `"${u.status === 'suspended' ? 'Đã khóa' : 'Hoạt động'}"`,
        `"${u.registeredAt || u.createdAt ? new Date(u.registeredAt || u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Danh_Sach_Thanh_Vien_DThu_QuizMaster_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(`📥 Đã xuất thành công ${users.length} thành viên ra file CSV!`, "success", 3000);
  },

  onUserAuditFilterChange(filter) {
    this.auditLogActionFilter = filter;
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  renderAuditLogsTableRows(logs) {
    if (!logs || logs.length === 0) {
      return `
        <tr>
          <td colspan="5" style="text-align: center; padding: 48px 20px; color: var(--text-secondary);">
            <div style="font-size: 36px; margin-bottom: 8px;">📋</div>
            <strong style="font-size: 15px; color: var(--text-primary); display: block;">Chưa có nhật ký hoạt động nào!</strong>
            <span style="font-size: 12.5px;">Mọi hành động quản trị sẽ được ghi nhận minh bạch tại đây.</span>
          </td>
        </tr>
      `;
    }

    const filter = this.auditLogActionFilter || "all";
    const filteredLogs = filter === "all" ? logs : logs.filter(l => l.action && l.action.includes(filter));

    if (filteredLogs.length === 0) {
      return `
        <tr>
          <td colspan="5" style="text-align: center; padding: 36px 20px; color: var(--text-tertiary);">
            Không có nhật ký nào thuộc loại hành động "${filter}".
          </td>
        </tr>
      `;
    }

    return filteredLogs.map(log => `
      <tr>
        <td style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">
          ${new Date(log.timestamp).toLocaleString('vi-VN')}
        </td>
        <td>
          <strong style="color: var(--text-primary); font-size: 13px;">${log.adminName || 'Quản trị viên'}</strong>
        </td>
        <td>
          <span class="badge" style="background:#f1f5f9; color:#0f172a; font-weight:800; font-size:11px;">${log.action}</span>
        </td>
        <td>
          <strong style="color: var(--text-primary); font-size: 13px;">${log.target || 'Hệ thống'}</strong>
        </td>
        <td style="font-size: 13px; color: var(--text-secondary);">
          ${log.details || 'Không có chi tiết'}
        </td>
      </tr>
    `).join('');
  },

  async refreshUsersFromCloud() {
    this.showToast("⏳ Đang kéo dữ liệu mới nhất từ Supabase Cloud...", "info", 1500);
    if (typeof StorageService !== "undefined" && typeof StorageService.syncWithCloud === "function") {
      await StorageService.syncWithCloud();
    }
    await this.renderUsersManagementView(document.getElementById("mainContent"));
    this.showToast("✅ Đã cập nhật dữ liệu người dùng mới nhất từ Cloud!", "success", 2500);
  },

  renderPendingUsersTableRows(pendingUsers) {
    if (!pendingUsers || pendingUsers.length === 0) {
      return `
        <tr>
          <td colspan="7" style="text-align: center; padding: 56px 20px; color: var(--text-secondary);">
            <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
            <strong style="font-size: 16px; color: var(--text-primary); display: block;">Không có hồ sơ đăng ký nào đang chờ duyệt!</strong>
            <span style="font-size: 13px;">Mọi sinh viên đăng ký mới đã được xử lý xong.</span>
          </td>
        </tr>
      `;
    }

    return pendingUsers.map(u => {
      const isSelected = this.selectedUserIds && this.selectedUserIds.has(u.id);

      return `
        <tr style="${isSelected ? 'background:#fefce8;' : ''}">
          <td style="text-align: center; width: 36px;">
            <input type="checkbox" class="pending-user-checkbox" value="${u.id}" ${isSelected ? 'checked' : ''} onchange="App.toggleUserSelection('${u.id}', this.checked)">
          </td>
          <td>
            <div class="user-info-cell">
              <div class="user-avatar-badge">${u.avatar || '👨‍🎓'}</div>
              <div>
                <div style="font-weight: 700; color: var(--text-primary);">${u.fullName}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">MSSV: <strong>${u.studentId}</strong></div>
              </div>
            </div>
          </td>
          <td style="font-size: 13px; color: var(--text-secondary);">${u.department || 'ĐH Đồng Tháp'}</td>
          <td style="font-size: 13px; color: var(--text-secondary);"><code>${u.email || (u.studentId + '@dthu.edu.vn')}</code></td>
          <td style="font-size: 12.5px; color: var(--text-tertiary);">${u.registeredAt ? new Date(u.registeredAt).toLocaleString('vi-VN') : 'Gần đây'}</td>
          <td><span class="status-badge-pending">⏳ Chờ Phê Duyệt</span></td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px;">
              <button class="btn btn-sm btn-primary" onclick="App.approveUserRegistrationAction('${u.id}')">
                ✅ Phê Duyệt
              </button>
              <button class="btn btn-sm btn-danger" onclick="App.rejectUserRegistrationAction('${u.id}')">
                ❌ Từ Chối
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderResetRequestsTableRows(requests) {
    if (!requests || requests.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align: center; padding: 56px 20px; color: var(--text-secondary);">
            <div style="font-size: 40px; margin-bottom: 8px;">✨</div>
            <strong style="font-size: 16px; color: var(--text-primary); display: block;">Không có yêu cầu khôi phục mã PIN nào!</strong>
            <span style="font-size: 13px;">Hàng đợi hỗ trợ CSKH hiện đang trống.</span>
          </td>
        </tr>
      `;
    }

    return requests.map(r => `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${r.fullName}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">MSSV: <strong>${r.studentId || 'Chưa có'}</strong></div>
          <div style="font-size: 11px; color: var(--text-tertiary); font-family: monospace;">${r.ticketId || r.id}</div>
        </td>
        <td style="font-size: 13px; color: var(--text-secondary);">${r.contact || r.phone || r.email || 'Chưa cung cấp'}</td>
        <td style="font-size: 13px; color: var(--text-secondary); max-width: 260px;">
          <div style="margin-bottom: 4px;"><span class="ticket-type-pill">${r.issueType || 'CSKH'}</span></div>
          <strong style="font-size: 12.5px; color: var(--text-primary); display: block;">${r.title || 'Yêu cầu hỗ trợ'}</strong>
          <span style="font-size: 12px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${r.content || r.note || ''}</span>
        </td>
        <td style="font-size: 12px; color: var(--text-tertiary);">${r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : 'Gần đây'}</td>
        <td>
          <span class="${r.status === 'resolved' ? 'status-badge-active' : 'status-badge-pending'}">
            ${r.status === 'resolved' ? '✓ Đã giải quyết' : '⏳ Cần xử lý'}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn btn-sm" title="Xem chi tiết văn bản trình bày" onclick="App.viewSupportTicketDetailModal('${r.id || r.ticketId}')">
              👁️ Xem
            </button>
            ${r.status !== 'resolved' ? `
              <button class="btn btn-sm btn-primary" title="Cấp lại mã PIN mặc định 123456" onclick="App.resolveResetRequestAction('${r.id}')">
                🔄 Cấp PIN (123456)
              </button>
            ` : `
              <span style="font-size: 11.5px; color: var(--text-tertiary); align-self: center;">Đã xử lý</span>
            `}
          </div>
        </td>
      </tr>
    `).join('');
  },

  async approveUserRegistrationAction(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;
    const current = StorageService.getUserProfile();
    await StorageService.approveUserRegistration(userId, current.fullName || "Admin Bùi Văn Khang");
    this.showToast(`🎉 Đã phê duyệt kích hoạt tài khoản cho sinh viên "${user.fullName}" (${user.studentId})!`, "success", 4000);
    this.renderHeader();
    await this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  async rejectUserRegistrationAction(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;
    this.showConfirmDialog({
      title: "Xác nhận từ chối hồ sơ đăng ký",
      message: `Bạn có chắc chắn muốn từ chối hồ sơ của <strong>"${user.fullName}" (MSSV: ${user.studentId})</strong> không?`,
      icon: "⚠️",
      confirmText: "Từ chối hồ sơ",
      isDanger: true,
      onConfirm: async () => {
        await StorageService.rejectUserRegistration(userId);
        this.showToast(`Đã từ chối hồ sơ đăng ký của "${user.fullName}"!`, "info", 3000);
        this.renderHeader();
        await this.renderUsersManagementView(document.getElementById("mainContent"));
      }
    });
  },

  resolveResetRequestAction(reqId) {
    const resolved = StorageService.resolveResetRequest(reqId, "123456");
    if (resolved) {
      this.showToast(`✅ Đã cấp lại mã PIN mặc định "123456" cho sinh viên "${resolved.fullName}" (${resolved.studentId})!`, "success", 4500);
      this.renderUsersManagementView(document.getElementById("mainContent"));
    }
  },

  renderUsersTableRows(users) {
    if (!users || users.length === 0) {
      return `
        <tr>
          <td colspan="8" style="text-align: center; padding: 48px; color: var(--text-tertiary);">
            Không tìm thấy thành viên nào phù hợp.
          </td>
        </tr>
      `;
    }

    const currentProfile = StorageService.getUserProfile();

    return users.map(u => {
      const isCurrent = currentProfile && currentProfile.id === u.id;
      const isSelected = this.selectedUserIds && this.selectedUserIds.has(u.id);
      const perms = u.permissions || {};

      let roleBadge = `<span class="role-badge-student">👨‍🎓 Sinh Viên</span>`;
      if (u.role === "admin") {
        roleBadge = `<span class="role-badge-admin">👑 Admin</span>`;
      } else if (u.role === "editor") {
        roleBadge = `<span class="role-badge-editor">🛡️ Ban Biên Tập</span>`;
      }

      return `
        <tr style="${isSelected ? 'background:#f0f9ff;' : ''}">
          <td style="text-align: center; width: 36px;">
            <input type="checkbox" class="active-user-checkbox" value="${u.id}" ${isSelected ? 'checked' : ''} onchange="App.toggleUserSelection('${u.id}', this.checked)">
          </td>
          <td>
            <div class="user-info-cell">
              <div class="user-avatar-badge">${u.avatar || '👨‍🎓'}</div>
              <div>
                <div style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                  ${u.fullName}
                  ${isCurrent ? '<span class="badge" style="background:#dbeafe; color:#1e40af; font-size:10px;">Bạn</span>' : ''}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                  MSSV: <strong>${u.studentId || 'Chưa cập nhật'}</strong>
                </div>
                <div style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px;">
                  📧 <code>${u.email || (u.studentId ? u.studentId + '@dthu.edu.vn' : 'Chưa cập nhật')}</code>
                </div>
              </div>
            </div>
          </td>
          <td style="color: var(--text-secondary); font-size: 13px;">
            ${u.department || 'ĐH Đồng Tháp'}
          </td>
          <td>${roleBadge}</td>
          <td>
            <div style="display: flex; flex-wrap: wrap; gap: 2px; max-width: 240px;">
              <span class="perm-pill ${perms.canApproveDrafts ? 'active' : ''}" title="Duyệt đề thi đóng góp">${perms.canApproveDrafts ? '✓' : '✗'} Duyệt đề</span>
              <span class="perm-pill ${perms.canEditSubjects ? 'active' : ''}" title="Sửa ngân hàng môn học">${perms.canEditSubjects ? '✓' : '✗'} Sửa môn</span>
              <span class="perm-pill ${perms.canManageMaterials ? 'active' : ''}" title="Quản lý tài liệu .txt">${perms.canManageMaterials ? '✓' : '✗'} Tài liệu</span>
              <span class="perm-pill ${perms.canManageUsers ? 'active' : ''}" title="Quản trị người dùng">${perms.canManageUsers ? '✓' : '✗'} QL User</span>
            </div>
          </td>
          <td>
            <div style="font-weight: 800; color: #b45309; font-size: 13px;">⚡ ${u.totalExp || 0} EXP</div>
            <div style="font-weight: 800; color: #15803d; font-size: 12px; margin-top: 1px;">🌟 ${u.contributionPoints || 0} CP</div>
            <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">${u.quizzesCompleted || 0} bài thi</div>
          </td>
          <td>
            <span class="${u.status === 'suspended' ? 'status-badge-suspended' : 'status-badge-active'}">
              ${u.status === 'suspended' ? '🚫 Đã khóa' : '✓ Hoạt động'}
            </span>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end;">
              <button class="btn btn-sm" style="background:#fef3c7; color:#b45309; border-color:#fde68a; font-weight:700;" title="Điều chỉnh điểm EXP / CP" onclick="App.openAdminAdjustPointsModal('${u.id}')">
                ⚡ Điểm
              </button>
              <button class="btn btn-sm" title="Chỉnh sửa quyền & thông tin" onclick="App.openEditUserModal('${u.id}')">
                ✏️ Sửa
              </button>
              ${!isCurrent ? `
                <button class="btn btn-sm" title="${u.status === 'suspended' ? 'Mở khóa tài khoản' : 'Tạm khóa tài khoản'}" onclick="App.toggleUserStatusAction('${u.id}')">
                  ${u.status === 'suspended' ? '🔓 Mở' : '🔒 Khóa'}
                </button>
                <button class="btn btn-sm btn-primary" title="Đăng nhập tài khoản này" onclick="App.switchAccountTo('${u.id}')">
                  🔄 Chọn
                </button>
                <button class="btn btn-sm btn-danger" title="Xóa tài khoản" onclick="App.deleteUserConfirm('${u.id}')">
                  🗑️
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAdminAdjustPointsModal(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const seasonExpVal = typeof user.seasonExp === "number" ? user.seasonExp : (user.totalExp || 0);
    const seasonCpVal = typeof user.seasonCp === "number" ? user.seasonCp : (user.contributionPoints || 0);

    title.textContent = `⚡/🌟 Điều Chỉnh Điểm: ${user.fullName}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px;">
          <div>👤 Sinh viên: <strong>${user.fullName}</strong> (MSSV: <code>${user.studentId}</code> · Lớp: <code>${user.className || 'N/A'}</code>)</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; font-size: 12.5px;">
            <div style="background:#fffbeb; padding:6px 10px; border-radius:4px; border:1px solid #fde68a; color:#b45309;">
              <strong>⚡ EXP Mùa Này:</strong> ${seasonExpVal.toLocaleString()} (Tổng: ${(user.totalExp || 0).toLocaleString()})
            </div>
            <div style="background:#f0fdf4; padding:6px 10px; border-radius:4px; border:1px solid #bbf7d0; color:#15803d;">
              <strong>🌟 CP Mùa Này:</strong> ${seasonCpVal.toLocaleString()} (Tổng: ${(user.contributionPoints || 0).toLocaleString()})
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Loại Điểm (*):</label>
            <select id="adjustPointType" class="form-control" style="font-weight: 600;">
              <option value="EXP">⚡ Điểm EXP Học Tập</option>
              <option value="CP">🌟 Điểm Cống Hiến (CP)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Số điểm (+ Cộng / - Trừ) (*):</label>
            <input type="number" id="adjustPointAmount" class="form-control" placeholder="VD: 50 hoặc -20" style="font-weight: 700;">
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Phạm Vi Áp Dụng (*):</label>
          <select id="adjustPointScope" class="form-control" style="font-weight: 600;">
            <option value="both">🌐 Cả Điểm Mùa Này & Điểm Tổng All-Time (Khuyến nghị)</option>
            <option value="season">🗓️ Chỉ Điểm Mùa Này</option>
            <option value="all_time">👑 Chỉ Điểm Tổng All-Time</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do điều chỉnh (Bắt buộc để gửi thông báo minh bạch) (*):</label>
          <textarea id="adjustPointReason" class="form-control" style="min-height: 75px;" placeholder="Nhập lý do cụ thể (VD: Thưởng thành tích xuất sắc, hoặc Hiệu chỉnh kiểm toán điểm)..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveAdminAdjustPoints('${user.id}')">💾 Xác Nhận & Gửi Thông Báo</button>
    `;

    this.openModal();
  },

  saveAdminAdjustPoints(userId) {
    const type = document.getElementById("adjustPointType")?.value || "EXP";
    const scope = document.getElementById("adjustPointScope")?.value || "both";
    const amountVal = document.getElementById("adjustPointAmount")?.value.trim();
    const reasonVal = document.getElementById("adjustPointReason")?.value.trim();

    const amount = parseInt(amountVal, 10);
    if (isNaN(amount) || amount === 0) {
      this.showToast("⚠️ Vui lòng nhập số điểm điều chỉnh hợp lệ (khác 0)!", "warning");
      return;
    }

    if (!reasonVal) {
      this.showToast("⚠️ Vui lòng nhập lý do điều chỉnh để gửi thông báo minh bạch cho sinh viên!", "warning");
      return;
    }

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.adminAdjustUserPoints(userId, type, amount, scope, reasonVal, adminName);
      this.closeModal();
      this.showToast(`✅ Đã điều chỉnh ${amount > 0 ? '+' : ''}${amount} ${type} cho sinh viên thành công!`, "success", 4000);
      
      const main = document.getElementById("mainContent");
      if (document.querySelector(".view-admin-leaderboard")) {
        this.renderLeaderboardAdminView(main);
      } else {
        this.renderUsersManagementView(main);
      }
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  openResetUserPointsModal(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const seasonExpVal = typeof user.seasonExp === "number" ? user.seasonExp : (user.totalExp || 0);
    const seasonCpVal = typeof user.seasonCp === "number" ? user.seasonCp : (user.contributionPoints || 0);

    title.textContent = `🔄 Đặt Lại (Reset) Điểm: ${user.fullName}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #991b1b;">
          <div>👤 Sinh viên: <strong>${user.fullName}</strong> (MSSV: <code>${user.studentId}</code> · Lớp: <code>${user.className || 'N/A'}</code>)</div>
          <div style="display: flex; gap: 16px; margin-top: 6px; font-weight: 700;">
            <span>⚡ EXP Mùa: ${seasonExpVal} (Tổng: ${user.totalExp || 0})</span>
            <span>🌟 CP Mùa: ${seasonCpVal} (Tổng: ${user.contributionPoints || 0})</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Loại Điểm Muốn Reset (*):</label>
            <select id="resetUserPointType" class="form-control" style="font-weight: 600;">
              <option value="all">💥 Reset Toàn Bộ (Cả EXP và CP)</option>
              <option value="exp">⚡ Chỉ Reset Điểm EXP Học Tập</option>
              <option value="cp">🌟 Chỉ Reset Điểm CP Cống Hiến</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Phạm Vi Reset (*):</label>
            <select id="resetUserPointScope" class="form-control" style="font-weight: 600;">
              <option value="season">🗓️ Chỉ Reset Điểm Mùa Này</option>
              <option value="both">🌐 Reset Cả Mùa Này & Điểm Tổng All-Time</option>
              <option value="all_time">👑 Chỉ Reset Điểm Tổng All-Time</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do đặt lại điểm (Bắt buộc để gửi thông báo giải trình) (*):</label>
          <textarea id="resetUserPointReason" class="form-control" style="min-height: 75px;" placeholder="Nhập lý do cụ thể (VD: Thành viên có nguyện vọng reset điểm để thi lại từ đầu, hoặc Xử lý vi phạm)..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.saveResetUserPointsAction('${user.id}')">🔄 Xác Nhận Đặt Lại Điểm</button>
    `;

    this.openModal();
  },

  saveResetUserPointsAction(userId) {
    const resetType = document.getElementById("resetUserPointType")?.value || "all";
    const scope = document.getElementById("resetUserPointScope")?.value || "season";
    const reasonVal = document.getElementById("resetUserPointReason")?.value.trim();

    if (!reasonVal) {
      this.showToast("⚠️ Vui lòng nhập lý do đặt lại điểm để gửi thông báo giải trình cho sinh viên!", "warning");
      return;
    }

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.resetUserPoints(userId, resetType, scope, reasonVal, adminName);
      this.closeModal();
      this.showToast("✅ Đã đặt lại điểm của thành viên về 0 và gửi thông báo thành công!", "success", 4000);

      const main = document.getElementById("mainContent");
      if (document.querySelector(".view-admin-leaderboard")) {
        this.renderLeaderboardAdminView(main);
      } else {
        this.renderUsersManagementView(main);
      }
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  openKickUserModal(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `👢 Loại (Kick) Thành Viên: ${user.fullName}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #991b1b;">
          <div>⚠️ Bạn đang thao tác loại thành viên <strong>${user.fullName}</strong> (MSSV: <code>${user.studentId}</code> · Lớp: <code>${user.className || 'N/A'}</code>) khỏi nhóm học tập.</div>
          <div style="margin-top: 6px; font-size: 12px;">Tài khoản này sẽ bị chuyển sang trạng thái <strong>Đã bị Kick</strong>, bị ẩn khỏi Bảng Xếp Hạng và tạm ngưng thi thử.</div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do loại khỏi nhóm (Bắt buộc để gửi thông báo chính thức) (*):</label>
          <textarea id="kickUserReason" class="form-control" style="min-height: 80px;" placeholder="Nhập lý do cụ thể (VD: Vi phạm quy chế thi cử, spam đề thi, hoặc không còn thuộc danh sách lớp)..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.confirmKickUserAction('${user.id}')">👢 Xác Nhận Kick Khỏi Nhóm</button>
    `;

    this.openModal();
  },

  confirmKickUserAction(userId) {
    const reasonVal = document.getElementById("kickUserReason")?.value.trim();
    if (!reasonVal) {
      this.showToast("⚠️ Vui lòng nhập lý do kick để gửi thông báo chính thức!", "warning");
      return;
    }

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.kickUserFromGroup(userId, reasonVal, adminName);
      this.closeModal();
      this.showToast("✅ Đã loại thành viên khỏi nhóm và gửi thông báo kỷ luật thành công!", "success", 4000);
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  confirmReinstateUserAction(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    if (confirm(`Bạn có chắc chắn muốn KHÔI PHỤC thành viên "${user.fullName}" (MSSV: ${user.studentId}) trở lại nhóm học tập và mở lại trên Bảng Xếp Hạng không?`)) {
      try {
        StorageService.reinstateUserToGroup(userId, adminName);
        this.showToast(`🎉 Đã khôi phục thành viên "${user.fullName}" vào nhóm thành công!`, "success", 3500);
        this.renderLeaderboardAdminView(document.getElementById("mainContent"));
      } catch (e) {
        this.showToast("❌ " + e.message, "danger", 3500);
      }
    }
  },

  // ── Multi-Select & Bulk Actions Management (Quản Lý Tích Chọn Nhiều & Thao Tác Hàng Loạt) ──

  // Selection handlers cho Users Management
  toggleSelectAllUsers(checked, tab = 'active') {
    if (!this.selectedUserIds) this.selectedUserIds = new Set();
    const list = tab === 'active' ? this.getFilteredActiveUsers() : StorageService.getPendingUsers();
    if (checked) {
      list.forEach(u => this.selectedUserIds.add(u.id));
    } else {
      list.forEach(u => this.selectedUserIds.delete(u.id));
    }
    const container = document.getElementById("mainContent");
    if (container) this.renderUsersManagementView(container);
  },

  toggleUserSelection(userId, checked) {
    if (!this.selectedUserIds) this.selectedUserIds = new Set();
    if (checked) {
      this.selectedUserIds.add(userId);
    } else {
      this.selectedUserIds.delete(userId);
    }
    const container = document.getElementById("mainContent");
    if (container) this.renderUsersManagementView(container);
  },

  clearUserSelections() {
    if (this.selectedUserIds) this.selectedUserIds.clear();
    const container = document.getElementById("mainContent");
    if (container) this.renderUsersManagementView(container);
  },

  // Selection handlers cho Leaderboard Admin Members Tab
  toggleSelectAllAdminMembers(checked) {
    if (!this.selectedAdminMemberIds) this.selectedAdminMemberIds = new Set();
    const allUsers = StorageService.getAllUsers();
    if (checked) {
      allUsers.forEach(u => this.selectedAdminMemberIds.add(u.id));
    } else {
      this.selectedAdminMemberIds.clear();
    }
    const container = document.getElementById("mainContent");
    if (container) this.renderLeaderboardAdminView(container);
  },

  toggleAdminMemberSelection(userId, checked) {
    if (!this.selectedAdminMemberIds) this.selectedAdminMemberIds = new Set();
    if (checked) {
      this.selectedAdminMemberIds.add(userId);
    } else {
      this.selectedAdminMemberIds.delete(userId);
    }
    const container = document.getElementById("mainContent");
    if (container) this.renderLeaderboardAdminView(container);
  },

  clearAdminMemberSelections() {
    if (this.selectedAdminMemberIds) this.selectedAdminMemberIds.clear();
    const container = document.getElementById("mainContent");
    if (container) this.renderLeaderboardAdminView(container);
  },

  // Thao tác hàng loạt: Phê duyệt hồ sơ đăng ký (Bulk Approve)
  async bulkApprovePendingUsersAction() {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 hồ sơ!", "warning");
      return;
    }
    const ids = Array.from(this.selectedUserIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Admin";

    this.showToast(`⏳ Đang phê duyệt ${ids.length} hồ sơ...`, "info", 2000);
    for (const id of ids) {
      await StorageService.approveUserRegistration(id, adminName);
    }
    StorageService.addAuditLog("BULK_APPROVE_USERS", `${ids.length} hồ sơ`, `Phê duyệt kích hoạt hàng loạt ${ids.length} tài khoản sinh viên`, adminName);
    this.selectedUserIds.clear();
    this.showToast(`🎉 Đã phê duyệt kích hoạt thành công ${ids.length} tài khoản sinh viên!`, "success", 4000);
    this.renderHeader();
    await this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  // Thao tác hàng loạt: Từ chối hồ sơ đăng ký (Bulk Reject)
  async bulkRejectPendingUsersAction() {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 hồ sơ!", "warning");
      return;
    }
    const ids = Array.from(this.selectedUserIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Admin";

    this.showConfirmDialog({
      title: "Xác nhận từ chối hàng loạt",
      message: `Bạn có chắc chắn muốn TỪ CHỐI <strong>${ids.length}</strong> hồ sơ đăng ký đã chọn không?`,
      icon: "⚠️",
      confirmText: `Từ chối ${ids.length} hồ sơ`,
      isDanger: true,
      onConfirm: async () => {
        for (const id of ids) {
          await StorageService.rejectUserRegistration(id);
        }
        StorageService.addAuditLog("BULK_REJECT_USERS", `${ids.length} hồ sơ`, `Từ chối hàng loạt ${ids.length} hồ sơ đăng ký`, adminName);
        this.selectedUserIds.clear();
        this.showToast(`Đã từ chối ${ids.length} hồ sơ đăng ký!`, "info", 3000);
        this.renderHeader();
        await this.renderUsersManagementView(document.getElementById("mainContent"));
      }
    });
  },

  // Thao tác hàng loạt: Khóa / Mở khóa tài khoản (Bulk Toggle Status)
  bulkToggleUserStatusAction(targetStatus) {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const currentProfile = StorageService.getUserProfile();
    const ids = Array.from(this.selectedUserIds).filter(id => id !== currentProfile.id);
    if (ids.length === 0) {
      this.showToast("⚠️ Không thể thay đổi trạng thái của chính tài khoản bạn đang đăng nhập!", "warning");
      return;
    }

    const actionText = targetStatus === 'suspended' ? 'TẠM KHÓA' : 'MỞ KHÓA';
    this.showConfirmDialog({
      title: `Xác nhận ${actionText} hàng loạt`,
      message: `Bạn có chắc chắn muốn <strong>${actionText} ${ids.length} tài khoản</strong> đã chọn không?`,
      icon: targetStatus === 'suspended' ? "🔒" : "🔓",
      confirmText: `${actionText} ${ids.length} tài khoản`,
      isDanger: targetStatus === 'suspended',
      onConfirm: () => {
        const adminName = currentProfile.fullName || "Quản trị viên";
        const users = StorageService.getAllUsers();
        let count = 0;
        users.forEach(u => {
          if (ids.includes(u.id)) {
            u.status = targetStatus;
            count++;
          }
        });
        StorageService.saveAllUsers(users);
        StorageService.addAuditLog("BULK_STATUS_CHANGE", `${count} tài khoản`, `${actionText} tài khoản hàng loạt`, adminName);
        this.selectedUserIds.clear();
        this.showToast(`✅ Đã ${targetStatus === 'suspended' ? 'tạm khóa' : 'mở khóa'} thành công ${count} tài khoản!`, "success", 3000);
        this.renderUsersManagementView(document.getElementById("mainContent"));
      }
    });
  },

  // Thao tác hàng loạt: Xóa tài khoản (Bulk Delete Users)
  bulkDeleteUsersConfirm() {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const currentProfile = StorageService.getUserProfile();
    const ids = Array.from(this.selectedUserIds).filter(id => id !== currentProfile.id);
    if (ids.length === 0) {
      this.showToast("⚠️ Không thể xóa tài khoản bạn đang đăng nhập!", "warning");
      return;
    }

    this.showConfirmDialog({
      title: "Xác nhận xóa hàng loạt thành viên",
      message: `Bạn có chắc chắn muốn XÓA VĨNH VIỄN <strong>${ids.length}</strong> tài khoản đã chọn khỏi hệ thống không? Dữ liệu không thể khôi phục!`,
      icon: "🗑️",
      confirmText: `Xóa ${ids.length} tài khoản`,
      isDanger: true,
      onConfirm: async () => {
        const adminName = currentProfile.fullName || "Quản trị viên";
        await StorageService.deleteUsers(ids);
        StorageService.addAuditLog("BULK_DELETE_USERS", `${ids.length} tài khoản`, `Xóa vĩnh viễn hàng loạt ${ids.length} tài khoản khỏi hệ thống`, adminName);
        this.selectedUserIds.clear();
        this.showToast(`🗑️ Đã xóa ${ids.length} tài khoản thành công!`, "info", 3500);
        this.renderUsersManagementView(document.getElementById("mainContent"));
      }
    });
  },

  // Thao tác hàng loạt: Kick thành viên khỏi nhóm (Bulk Kick)
  openBulkKickModal() {
    if (!this.selectedAdminMemberIds || this.selectedAdminMemberIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const count = this.selectedAdminMemberIds.size;
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `👢 Loại (Kick) Hàng Loạt: ${count} Thành Viên`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #991b1b;">
          <strong>⚠️ Chú ý:</strong> Bạn đang chuẩn bị Kick <strong>${count} thành viên</strong> đã chọn ra khỏi nhóm thi đua. Họ sẽ bị ẩn khỏi Bảng Xếp Hạng công khai.
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do loại (Kick) hàng loạt (*):</label>
          <textarea id="bulkKickReason" class="form-control" style="min-height: 80px;" placeholder="Nhập lý do chung (VD: Vi phạm nội quy, Đã tốt nghiệp, Hoạt động không hợp lệ)..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.confirmBulkKickAction()">👢 Xác Nhận Kick ${count} Thành Viên</button>
    `;

    this.openModal();
  },

  confirmBulkKickAction() {
    const reason = document.getElementById("bulkKickReason")?.value.trim();
    if (!reason) {
      this.showToast("⚠️ Vui lòng nhập lý do kick để ghi nhận kiểm toán và gửi thông báo!", "warning");
      return;
    }
    const ids = Array.from(this.selectedAdminMemberIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.kickUserFromGroup(id, reason, adminName);
      } catch (e) {}
    });

    this.clearAdminMemberSelections();
    this.closeModal();
    this.showToast(`👢 Đã kick thành công ${ids.length} thành viên khỏi nhóm!`, "info", 4000);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  // Thao tác hàng loạt: Khôi phục thành viên (Bulk Reinstate)
  bulkReinstateUsersAction() {
    if (!this.selectedAdminMemberIds || this.selectedAdminMemberIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const ids = Array.from(this.selectedAdminMemberIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.reinstateUserToGroup(id, adminName);
      } catch (e) {}
    });

    this.clearAdminMemberSelections();
    this.showToast(`♻️ Đã khôi phục thành công ${ids.length} thành viên vào nhóm!`, "success", 4000);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  // Thao tác hàng loạt: Reset điểm mùa này (Bulk Reset Points)
  openBulkResetPointsModal() {
    if (!this.selectedAdminMemberIds || this.selectedAdminMemberIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const count = this.selectedAdminMemberIds.size;
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `🔄 Đặt Lại Điểm Hàng Loạt: ${count} Thành Viên`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #92400e;">
          Bạn đang chọn đặt lại điểm số về 0 cho <strong>${count} thành viên</strong>.
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Loại Điểm (*):</label>
            <select id="bulkResetType" class="form-control" style="font-weight: 600;">
              <option value="all">💥 Cả Điểm EXP và CP</option>
              <option value="exp">⚡ Chỉ Điểm EXP</option>
              <option value="cp">🌟 Chỉ Điểm CP</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Phạm Vi (*):</label>
            <select id="bulkResetScope" class="form-control" style="font-weight: 600;">
              <option value="season" selected>🗓️ Chỉ Điểm Mùa Này (Bảo lưu All-Time)</option>
              <option value="both">🌐 Cả Mùa Này & Điểm Tổng All-Time</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do giải trình (*):</label>
          <textarea id="bulkResetReason" class="form-control" style="min-height: 70px;" placeholder="Nhập lý do đặt lại điểm cho danh sách sinh viên..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.confirmBulkResetPointsAction()">🔄 Xác Nhận Reset ${count} Thành Viên</button>
    `;

    this.openModal();
  },

  confirmBulkResetPointsAction() {
    const type = document.getElementById("bulkResetType")?.value || "all";
    const scope = document.getElementById("bulkResetScope")?.value || "season";
    const reason = document.getElementById("bulkResetReason")?.value.trim();

    if (!reason) {
      this.showToast("⚠️ Vui lòng nhập lý do đặt lại điểm để gửi thông báo minh bạch!", "warning");
      return;
    }

    const ids = Array.from(this.selectedAdminMemberIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.resetUserPoints(id, type, scope, reason, adminName);
      } catch (e) {}
    });

    this.clearAdminMemberSelections();
    this.closeModal();
    this.showToast(`✅ Đã đặt lại điểm của ${ids.length} thành viên thành công!`, "success", 4000);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  // Thao tác hàng loạt: Ẩn/Hiện BXH công khai (Bulk Toggle Hide)
  bulkToggleHideLeaderboardAction() {
    if (!this.selectedAdminMemberIds || this.selectedAdminMemberIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const ids = Array.from(this.selectedAdminMemberIds);
    const settings = StorageService.getLeaderboardSettings();
    let hiddenIds = settings.hiddenUserIds || [];

    // Nếu tất cả đã ẩn -> mở hiện tất cả. Ngược lại -> ẩn tất cả.
    const allHidden = ids.every(id => hiddenIds.includes(id));
    if (allHidden) {
      hiddenIds = hiddenIds.filter(id => !ids.includes(id));
    } else {
      ids.forEach(id => {
        if (!hiddenIds.includes(id)) hiddenIds.push(id);
      });
    }

    settings.hiddenUserIds = hiddenIds;
    StorageService.saveLeaderboardSettings(settings);
    this.showToast(`👁️ Đã ${allHidden ? 'mở hiện' : 'ẩn'} ${ids.length} thành viên trên BXH công khai!`, "success", 3000);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  // Universal Bulk Modal: Điều Chỉnh Điểm Hàng Loạt (Bulk Adjust Points)
  openBulkAdjustPointsModal(source = 'users') {
    const idSet = (source === 'leaderboard') ? this.selectedAdminMemberIds : this.selectedUserIds;
    if (!idSet || idSet.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const count = idSet.size;
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `⚡/🌟 Điều Chỉnh Điểm Chung: ${count} Thành Viên`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #166534;">
          Bạn đang áp dụng cộng / trừ điểm hàng loạt cho <strong>${count} thành viên</strong> đã chọn.
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Loại Điểm (*):</label>
            <select id="bulkAdjustPointType" class="form-control" style="font-weight: 600;">
              <option value="EXP">⚡ Điểm EXP Học Tập</option>
              <option value="CP">🌟 Điểm Cống Hiến (CP)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Số điểm (+ Cộng / - Trừ) (*):</label>
            <input type="number" id="bulkAdjustPointAmount" class="form-control" placeholder="VD: 100 hoặc -50" style="font-weight: 700;">
          </div>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Phạm Vi Áp Dụng (*):</label>
          <select id="bulkAdjustPointScope" class="form-control" style="font-weight: 600;">
            <option value="both">🌐 Cả Điểm Mùa Này & Điểm Tổng All-Time</option>
            <option value="season">🗓️ Chỉ Điểm Mùa Này</option>
            <option value="all_time">👑 Chỉ Điểm Tổng All-Time</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do điều chỉnh (*):</label>
          <textarea id="bulkAdjustPointReason" class="form-control" style="min-height: 70px;" placeholder="Nhập lý do gửi thông báo chung cho các thành viên..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.confirmBulkAdjustPointsAction('${source}')">💾 Áp Dụng Cho ${count} Thành Viên</button>
    `;

    this.openModal();
  },

  confirmBulkAdjustPointsAction(source = 'users') {
    const type = document.getElementById("bulkAdjustPointType")?.value || "EXP";
    const scope = document.getElementById("bulkAdjustPointScope")?.value || "both";
    const amountVal = document.getElementById("bulkAdjustPointAmount")?.value.trim();
    const reasonVal = document.getElementById("bulkAdjustPointReason")?.value.trim();

    const amount = parseInt(amountVal, 10);
    if (isNaN(amount) || amount === 0) {
      this.showToast("⚠️ Vui lòng nhập số điểm điều chỉnh hợp lệ (khác 0)!", "warning");
      return;
    }
    if (!reasonVal) {
      this.showToast("⚠️ Vui lòng nhập lý do điều chỉnh để gửi thông báo!", "warning");
      return;
    }

    const idSet = (source === 'leaderboard') ? this.selectedAdminMemberIds : this.selectedUserIds;
    const ids = Array.from(idSet || []);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.adminAdjustUserPoints(id, type, amount, scope, reasonVal, adminName);
      } catch (e) {}
    });

    this.closeModal();
    this.showToast(`✅ Đã điều chỉnh ${amount > 0 ? '+' : ''}${amount} ${type} cho ${ids.length} thành viên thành công!`, "success", 4000);

    const main = document.getElementById("mainContent");
    if (source === 'leaderboard') {
      this.clearAdminMemberSelections();
      this.renderLeaderboardAdminView(main);
    } else {
      this.clearUserSelections();
      this.renderUsersManagementView(main);
    }
  },

  // Universal Bulk Modal: Trao Huy Hiệu Hàng Loạt (Bulk Award Badge)
  openBulkAwardBadgeModal(source = 'users') {
    const idSet = (source === 'leaderboard') ? this.selectedAdminMemberIds : this.selectedUserIds;
    if (!idSet || idSet.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const count = idSet.size;
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `🎖️ Trao Huy Hiệu Hàng Loạt: ${count} Thành Viên`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fdf4ff; border: 1px solid #f0abfc; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #86198f;">
          Trao danh hiệu / huy hiệu đặc biệt hiển thị trên Bảng Vàng và hồ sơ cho <strong>${count} thành viên</strong>.
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Gợi ý huy hiệu nhanh:</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
            <button class="btn btn-sm" type="button" onclick="document.getElementById('bulkBadgeInput').value = '🎖️ Kiện Tướng Trắc Nghiệm'">🎖️ Kiện Tướng Trắc Nghiệm</button>
            <button class="btn btn-sm" type="button" onclick="document.getElementById('bulkBadgeInput').value = '🌟 Đại Sứ Học Thuật DTHU'">🌟 Đại Sứ Học Thuật</button>
            <button class="btn btn-sm" type="button" onclick="document.getElementById('bulkBadgeInput').value = '🚀 Thủ Khoa Ôn Luyện'">🚀 Thủ Khoa Ôn Luyện</button>
            <button class="btn btn-sm" type="button" onclick="document.getElementById('bulkBadgeInput').value = '💎 Cống Hiến Vàng'">💎 Cống Hiến Vàng</button>
          </div>
          <input type="text" id="bulkBadgeInput" class="form-control" placeholder="Nhập text huy hiệu (hoặc để trống để gỡ bỏ huy hiệu)..." style="font-weight: 700;">
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.confirmBulkAwardBadgeAction('${source}')">🎖️ Xác Nhận Trao Cho ${count} Thành Viên</button>
    `;

    this.openModal();
  },

  confirmBulkAwardBadgeAction(source = 'users') {
    const badgeText = document.getElementById("bulkBadgeInput")?.value.trim();
    const idSet = (source === 'leaderboard') ? this.selectedAdminMemberIds : this.selectedUserIds;
    const ids = Array.from(idSet || []);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.setCustomUserBadge(id, badgeText, adminName);
      } catch (e) {}
    });

    this.closeModal();
    this.showToast(`🎖️ Đã ${badgeText ? `trao huy hiệu "${badgeText}"` : 'gỡ bỏ huy hiệu'} cho ${ids.length} thành viên thành công!`, "success", 4000);

    const main = document.getElementById("mainContent");
    if (source === 'leaderboard') {
      this.clearAdminMemberSelections();
      this.renderLeaderboardAdminView(main);
    } else {
      this.clearUserSelections();
      this.renderUsersManagementView(main);
    }
  },

  onSearchUsers() {
    this.userSearchQuery = document.getElementById("userSearchInput")?.value || "";
    this.userRoleFilter = document.getElementById("userRoleFilter")?.value || "all";
    this.userDeptFilter = document.getElementById("userDeptFilter")?.value || "all";

    const filtered = this.getFilteredActiveUsers();
    const tbody = document.getElementById("usersTableBody");
    if (tbody) tbody.innerHTML = this.renderUsersTableRows(filtered);

    const selectAllBox = document.getElementById("selectAllActiveUsers");
    if (selectAllBox) {
      selectAllBox.checked = filtered.length > 0 && filtered.every(u => this.selectedUserIds && this.selectedUserIds.has(u.id));
    }
  },

  // Modal Tạo Thành Viên Mới
  openCreateUserModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "➕ Thêm Thành Viên Mới Vào Hệ Thống";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group" style="margin: 0;">
          <label class="form-label">Họ và tên (*):</label>
          <input type="text" id="newUsrName" class="form-control" placeholder="Ví dụ: Nguyễn Văn An">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã số sinh viên (MSSV) (*):</label>
            <input type="text" id="newUsrId" class="form-control" placeholder="Ví dụ: 220105001">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Email sinh viên / Đăng ký (*):</label>
            <input type="email" id="newUsrEmail" class="form-control" placeholder="Ví dụ: 220105001@dthu.edu.vn">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã PIN Đăng nhập (6 số):</label>
            <div style="position: relative;">
              <input type="password" id="newUsrPin" class="form-control" value="123456" maxlength="6" style="padding-right: 36px;">
              <button type="button" class="btn btn-sm" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); padding: 2px 6px; border: none; background: transparent; cursor: pointer; font-size: 13px;" onclick="const el = document.getElementById('newUsrPin'); el.type = el.type === 'password' ? 'text' : 'password';" title="Hiện/Ẩn PIN">👁️</button>
            </div>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Khoa / Chuyên ngành:</label>
            <input type="text" id="newUsrDept" class="form-control" placeholder="Ví dụ: Khoa Nông nghiệp - Sinh học">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Vai trò chính (*):</label>
            <select id="newUsrRole" class="form-control" onchange="App.onNewUserRoleChange(this.value)">
              <option value="student">👨‍🎓 Sinh Viên</option>
              <option value="editor">🛡️ Ban Biên Tập (Editor)</option>
              <option value="admin">👑 Quản Trị Viên (Admin)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Avatar đại diện:</label>
            <select id="newUsrAvatar" class="form-control">
              <option value="👨‍🎓">👨‍🎓 Nam Sinh Viên</option>
              <option value="👩‍🎓">👩‍🎓 Nữ Sinh Viên</option>
              <option value="🧑‍💻">🧑‍💻 Lập Trình Viên</option>
              <option value="🧪">🧪 Nhà Khoa Học</option>
              <option value="🧬">🧬 Sinh Học</option>
              <option value="🌟">🌟 Tinh Hoa</option>
            </select>
          </div>
        </div>

        <!-- Bộ cấp quyền chi tiết -->
        <div style="border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 4px;">
          <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
            Cấp quyền hạn chi tiết:
          </label>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label class="perm-checkbox-item">
              <input type="checkbox" id="permApproveDrafts">
              <div>
                <strong style="font-size: 13px; display: block;">Duyệt đề thi đóng góp (canApproveDrafts)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép xem xét, chỉnh sửa và phê duyệt các bộ đề cộng đồng.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="permEditSubjects">
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý & Sửa đề gốc (canEditSubjects)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép thêm môn mới, tạo chương và xóa câu hỏi gốc.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="permManageMaterials" checked>
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý tài liệu (.txt) (canManageMaterials)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép tải lên và chỉnh sửa kho tài liệu học tập.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="permManageUsers">
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý người dùng & Phân quyền (canManageUsers)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Toàn quyền thêm/sửa/khóa thành viên và phân quyền.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveNewUser()">Lưu Thành Viên</button>
    `;

    this.openModal();
  },

  onNewUserRoleChange(role) {
    const pApprove = document.getElementById("permApproveDrafts");
    const pEdit = document.getElementById("permEditSubjects");
    const pMat = document.getElementById("permManageMaterials");
    const pUsers = document.getElementById("permManageUsers");

    if (role === "admin") {
      if (pApprove) pApprove.checked = true;
      if (pEdit) pEdit.checked = true;
      if (pMat) pMat.checked = true;
      if (pUsers) pUsers.checked = true;
    } else if (role === "editor") {
      if (pApprove) pApprove.checked = true;
      if (pEdit) pEdit.checked = false;
      if (pMat) pMat.checked = true;
      if (pUsers) pUsers.checked = false;
    } else {
      if (pApprove) pApprove.checked = false;
      if (pEdit) pEdit.checked = false;
      if (pMat) pMat.checked = false;
      if (pUsers) pUsers.checked = false;
    }
  },

  onEditUserRoleChange(role) {
    const pApprove = document.getElementById("editPermApproveDrafts");
    const pEdit = document.getElementById("editPermEditSubjects");
    const pMat = document.getElementById("editPermManageMaterials");
    const pUsers = document.getElementById("editPermManageUsers");

    if (role === "admin") {
      if (pApprove) pApprove.checked = true;
      if (pEdit) pEdit.checked = true;
      if (pMat) pMat.checked = true;
      if (pUsers) pUsers.checked = true;
    } else if (role === "editor") {
      if (pApprove) pApprove.checked = true;
      if (pEdit) pEdit.checked = false;
      if (pMat) pMat.checked = true;
      if (pUsers) pUsers.checked = false;
    } else {
      if (pApprove) pApprove.checked = false;
      if (pEdit) pEdit.checked = false;
      if (pMat) pMat.checked = false;
      if (pUsers) pUsers.checked = false;
    }
  },

  saveNewUser() {
    const name = document.getElementById("newUsrName")?.value.trim();
    const id = document.getElementById("newUsrId")?.value.trim();
    const email = document.getElementById("newUsrEmail")?.value.trim();
    const pin = document.getElementById("newUsrPin")?.value.trim() || "123456";
    const dept = document.getElementById("newUsrDept")?.value.trim() || "Đại học Đồng Tháp";
    const role = document.getElementById("newUsrRole")?.value || "student";
    const avatar = document.getElementById("newUsrAvatar")?.value || "👨‍🎓";

    if (!name || !id) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ Họ tên và Mã số sinh viên (MSSV)!", "warning");
      return;
    }

    try {
      const newUser = StorageService.createUser({
        fullName: name,
        studentId: id,
        email: email || (id ? `${id}@dthu.edu.vn` : ""),
        pinCode: pin,
        department: dept,
        role: role,
        avatar: avatar,
        permissions: {
          canApproveDrafts: document.getElementById("permApproveDrafts")?.checked || false,
          canEditSubjects: document.getElementById("permEditSubjects")?.checked || false,
          canManageMaterials: document.getElementById("permManageMaterials")?.checked || false,
          canManageUsers: document.getElementById("permManageUsers")?.checked || false
        }
      });

      const adminProfile = StorageService.getUserProfile();
      StorageService.addAuditLog("CREATE_USER", name, `Thêm thành viên mới [${id}] (Vai trò: ${role})`, adminProfile.fullName || "Quản trị viên");

      this.closeModal();
      this.showToast(`🎉 Đã thêm thành viên "${name}" (${id}) thành công!`, "success", 3500);
      this.renderUsersManagementView(document.getElementById("mainContent"));
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4000);
    }
  },

  // Modal Chỉnh Sửa & Phân Quyền Thành Viên (Xem / Sửa Thông Tin)
  openEditUserModal(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const perms = user.permissions || {};
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `✏️ Xem & Chỉnh Sửa Thông Tin: ${user.fullName}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Metadata Header Pill -->
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12.5px; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>🆔 ID Hệ thống: <code>${user.id}</code></div>
          <div>📅 Đăng ký: <strong>${user.registeredAt || user.createdAt ? new Date(user.registeredAt || user.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}</strong></div>
          ${user.approvedBy ? `<div>✓ Duyệt bởi: <strong>${user.approvedBy}</strong></div>` : ''}
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Họ và tên (*):</label>
          <input type="text" id="editUsrName" class="form-control" value="${user.fullName}">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã số sinh viên (MSSV) (*):</label>
            <input type="text" id="editUsrId" class="form-control" value="${user.studentId || ''}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Email sinh viên / Đăng ký (*):</label>
            <input type="email" id="editUsrEmail" class="form-control" value="${user.email || (user.studentId ? user.studentId + '@dthu.edu.vn' : '')}" placeholder="Ví dụ: 220101001@dthu.edu.vn">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã PIN Đăng nhập (6 số):</label>
            <div style="position: relative;">
              <input type="password" id="editUsrPin" class="form-control" value="${user.pinCode || '123456'}" maxlength="6" style="padding-right: 36px;">
              <button type="button" class="btn btn-sm" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); padding: 2px 6px; border: none; background: transparent; cursor: pointer; font-size: 13px;" onclick="const el = document.getElementById('editUsrPin'); el.type = el.type === 'password' ? 'text' : 'password';" title="Hiện/Ẩn PIN">👁️</button>
            </div>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Khoa / Chuyên ngành:</label>
            <input type="text" id="editUsrDept" class="form-control" value="${user.department || ''}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Vai trò (*):</label>
            <select id="editUsrRole" class="form-control" onchange="App.onEditUserRoleChange(this.value)">
              <option value="student" ${user.role === 'student' ? 'selected' : ''}>👨‍🎓 Sinh Viên</option>
              <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>🛡️ Ban Biên Tập (Editor)</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Quản Trị Viên (Admin)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Điểm EXP:</label>
            <input type="number" id="editUsrExp" class="form-control" value="${user.totalExp || 0}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Điểm CP:</label>
            <input type="number" id="editUsrCp" class="form-control" value="${user.contributionPoints || 0}">
          </div>
        </div>

        <!-- Bộ cấp quyền chi tiết -->
        <div style="border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 4px;">
          <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
            Cấp quyền hạn chi tiết:
          </label>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label class="perm-checkbox-item">
              <input type="checkbox" id="editPermApproveDrafts" ${perms.canApproveDrafts ? 'checked' : ''}>
              <div>
                <strong style="font-size: 13px; display: block;">Duyệt đề thi đóng góp (canApproveDrafts)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép xem xét, chỉnh sửa và phê duyệt các bộ đề cộng đồng.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="editPermEditSubjects" ${perms.canEditSubjects ? 'checked' : ''}>
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý & Sửa đề gốc (canEditSubjects)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép thêm môn mới, tạo chương và xóa câu hỏi gốc.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="editPermManageMaterials" ${perms.canManageMaterials ? 'checked' : ''}>
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý tài liệu (.txt) (canManageMaterials)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép tải lên và chỉnh sửa kho tài liệu học tập.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="editPermManageUsers" ${perms.canManageUsers ? 'checked' : ''}>
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý người dùng & Phân quyền (canManageUsers)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Toàn quyền thêm/sửa/khóa thành viên và phân quyền.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedUser('${user.id}')">Lưu Thay Đổi</button>
    `;

    this.openModal();
  },

  saveEditedUser(userId) {
    const name = document.getElementById("editUsrName")?.value.trim();
    const id = document.getElementById("editUsrId")?.value.trim();
    const email = document.getElementById("editUsrEmail")?.value.trim();
    const pin = document.getElementById("editUsrPin")?.value.trim();
    const dept = document.getElementById("editUsrDept")?.value.trim();
    const role = document.getElementById("editUsrRole")?.value || "student";
    const exp = parseInt(document.getElementById("editUsrExp")?.value, 10) || 0;
    const cp = parseInt(document.getElementById("editUsrCp")?.value, 10) || 0;

    if (!name) {
      this.showToast("⚠️ Họ và tên không được để trống!", "warning");
      return;
    }

    if (id) {
      const existingStudentIdUser = StorageService.getUserByStudentId(id);
      if (existingStudentIdUser && existingStudentIdUser.id !== userId) {
        this.showToast(`⚠️ MSSV "${id}" đã thuộc về sinh viên "${existingStudentIdUser.fullName}"!`, "warning");
        return;
      }
    }

    if (email) {
      const existingEmailUser = StorageService.getUserByEmail(email);
      if (existingEmailUser && existingEmailUser.id !== userId) {
        this.showToast(`⚠️ Địa chỉ email "${email}" đã được gán cho tài khoản khác!`, "warning");
        return;
      }
    }

    StorageService.updateUser(userId, {
      fullName: name,
      studentId: id,
      email: email ? email.toLowerCase() : "",
      pinCode: pin,
      department: dept,
      role: role,
      totalExp: exp,
      contributionPoints: cp,
      permissions: {
        canApproveDrafts: document.getElementById("editPermApproveDrafts")?.checked || false,
        canEditSubjects: document.getElementById("editPermEditSubjects")?.checked || false,
        canManageMaterials: document.getElementById("editPermManageMaterials")?.checked || false,
        canManageUsers: document.getElementById("editPermManageUsers")?.checked || false
      }
    });

    const adminProfile = StorageService.getUserProfile();
    StorageService.addAuditLog("EDIT_USER", name, `Cập nhật thông tin & phân quyền thành viên [${id || userId}] (Vai trò: ${role})`, adminProfile.fullName || "Quản trị viên");

    this.closeModal();
    this.renderHeader();
    this.showToast("✅ Đã cập nhật quyền hạn và thông tin người dùng thành công!", "success", 3000);
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  toggleUserStatusAction(userId) {
    const updated = StorageService.toggleUserStatus(userId);
    if (updated) {
      const adminProfile = StorageService.getUserProfile();
      StorageService.addAuditLog("TOGGLE_USER_STATUS", updated.fullName, `Chuyển trạng thái sang ${updated.status === 'suspended' ? 'Đã khóa' : 'Hoạt động'}`, adminProfile.fullName || "Quản trị viên");
      this.showToast(`Đã ${updated.status === 'suspended' ? '🔒 khóa' : '🔓 mở khóa'} tài khoản: ${updated.fullName}`, "info", 2500);
      this.renderUsersManagementView(document.getElementById("mainContent"));
    }
  },

  deleteUserConfirm(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    this.showConfirmDialog({
      title: "Xác nhận xóa tài khoản",
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <strong>"${user.fullName}" (MSSV: ${user.studentId})</strong> không?`,
      icon: "🗑️",
      confirmText: "Xóa tài khoản",
      isDanger: true,
      onConfirm: async () => {
        try {
          await StorageService.deleteUser(userId);
          const adminProfile = StorageService.getUserProfile();
          StorageService.addAuditLog("DELETE_USER", user.fullName, `Xóa tài khoản thành viên [${user.studentId || user.id}] khỏi hệ thống`, adminProfile.fullName || "Quản trị viên");
          this.showToast(`Đã xóa tài khoản "${user.fullName}" khỏi hệ thống!`, "success", 3000);
          this.renderHeader();
          await this.renderUsersManagementView(document.getElementById("mainContent"));
        } catch (err) {
          this.showToast("❌ " + err.message, "danger", 3500);
        }
      }
    });
  },

  switchAccountTo(userId) {
    const user = StorageService.switchActiveUser(userId);
    if (user) {
      this.renderHeader();
      this.showToast(`🎉 Đã chuyển sang tài khoản: ${user.fullName} (${user.role.toUpperCase()})`, "success", 3000);
      this.navigateTo("home");
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MODAL ĐĂNG NHẬP & CHUYỂN ĐỔI TÀI KHOẢN (ACCOUNT SWITCHER & LOGIN)
  // ═════════════════════════════════════════════════════════════════════════
  openAccountSwitcherModal() {
    const currentProfile = StorageService.getUserProfile();
    const isLogged = StorageService.isLoggedIn();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "🔑 Đăng Nhập & Xác Thực Tài Khoản";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${isLogged ? `
          <!-- Phần 1: Tài khoản đang kích hoạt trên thiết bị này -->
          <div style="background: var(--brand-light); border: 1.5px solid var(--brand-primary); padding: 12px 16px; border-radius: var(--radius-sm);">
            <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: var(--brand-primary); letter-spacing: 0.04em; margin-bottom: 6px;">
              📱 Tài khoản đang đăng nhập trên thiết bị:
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 26px;">${currentProfile.avatar || '👨‍🎓'}</div>
                <div>
                  <strong style="font-size: 14px; color: var(--text-primary); display: block;">${currentProfile.fullName}</strong>
                  <span style="font-size: 12px; color: var(--text-secondary);">MSSV: <strong>${currentProfile.studentId}</strong> · ${currentProfile.role.toUpperCase()}</span>
                </div>
              </div>
              <button class="btn btn-sm btn-danger" style="font-size: 12px;" onclick="App.logoutUser(); App.closeModal();">
                🚪 Đăng Xuất
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Phần 2: Đăng Nhập Với MSSV & Mã PIN (Đồng bộ Cloud & Phân biệt từng máy) -->
        <div>
          <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
            ${isLogged ? 'Chuyển sang tài khoản khác (Yêu cầu nhập mã PIN):' : 'Nhập thông tin sinh viên để đăng nhập:'}
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; display: block;">Mã số sinh viên (MSSV):</label>
              <input type="text" id="loginStudentId" class="form-control" placeholder="Ví dụ: 0024418475">
            </div>
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; display: block;">Mã PIN bảo mật:</label>
              <input type="password" id="loginPinCode" class="form-control" placeholder="Mã PIN (Mặc định: 123456)">
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%; font-weight: 700; padding: 11px;" onclick="App.loginWithCredentials()">
            🚀 Xác Thực & Đăng Nhập ➔
          </button>
        </div>

        <!-- Phần 3: Điều hướng Đăng ký mới & Quên mã PIN -->
        <div style="border-top: 1px dashed var(--border); padding-top: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <button class="btn" style="padding: 6px 12px; font-size: 13px; font-weight: 700; color: var(--brand-primary); background: var(--brand-light); border-color: var(--brand-primary);" onclick="App.closeModal(); App.navigateTo('register');">
            ➕ Đăng ký tài khoản mới ➔
          </button>
          <button class="btn" style="padding: 6px 12px; font-size: 12.5px; color: var(--text-secondary);" onclick="App.openForgotPasswordModal()">
            ❓ Quên mã PIN?
          </button>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
    `;

    modal.classList.add("active");
  },

  async loginWithCredentials() {
    const mssv = document.getElementById("loginStudentId")?.value.trim();
    const pin = document.getElementById("loginPinCode")?.value.trim();

    if (!mssv) {
      this.showToast("⚠️ Vui lòng nhập Mã số sinh viên (MSSV)!", "warning");
      return;
    }

    this.showToast("⏳ Đang xác thực với CSDL Đám Mây Supabase...", "info", 1500);

    try {
      // 1. Kiểm tra trên Supabase Cloud trước để lấy trạng thái duyệt mới nhất
      if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
        const cloudUser = await SupabaseClient.getUserByStudentId(mssv);
        if (cloudUser) {
          if (cloudUser.status === "pending_approval") {
            throw new Error("Tài khoản của bạn đang trong trạng thái CHỜ ADMIN DUYỆT!");
          }
          if (cloudUser.status === "suspended") {
            throw new Error("Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên!");
          }
          if (cloudUser.pin_code && pin && cloudUser.pin_code !== pin) {
            throw new Error("Mã PIN bảo mật không chính xác!");
          }
          
          const mapped = {
            id: cloudUser.id,
            studentId: cloudUser.student_id,
            className: cloudUser.class_name || "",
            fullName: cloudUser.full_name,
            email: cloudUser.email,
            phone: cloudUser.phone || "",
            department: cloudUser.department || "Khoa Kỹ thuật - Công nghệ",
            role: cloudUser.role || "student",
            pinCode: cloudUser.pin_code || "123456",
            avatar: cloudUser.avatar || "👨‍🎓",
            totalExp: cloudUser.total_exp || 0,
            streakDays: cloudUser.streak_days || 1,
            quizzesCompleted: cloudUser.quizzes_completed || 0,
            status: cloudUser.status || "active",
            permissions: cloudUser.permissions || {},
            approvedBy: cloudUser.approved_by || "",
            approvedAt: cloudUser.approved_at || null,
            createdAt: cloudUser.created_at
          };
          StorageService.updateUser(mapped.id, mapped);
          StorageService.saveUserProfile(mapped);

          this.closeModal();
          this.renderHeader();
          this.showToast(`🎉 Đăng nhập thành công! Chào mừng ${mapped.fullName} (${mapped.role.toUpperCase()})`, "success", 3500);
          this.navigateTo("home");
          return;
        }
      }

      // 2. Xác thực cục bộ (Offline fallback)
      const user = StorageService.authenticateUser(mssv, pin);
      this.closeModal();
      this.renderHeader();
      this.showToast(`🎉 Đăng nhập thành công! Chào mừng ${user.fullName} (${user.role.toUpperCase()})`, "success", 3500);
      this.navigateTo("home");
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4500);
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MODAL KHÔI PHỤC MÃ PIN / QUÊN MẬT KHẨU (MSSV + EMAIL -> OTP 300s & CSKH)
  // ═════════════════════════════════════════════════════════════════════════
  openForgotPasswordModal() {
    this.clearOtpTimer();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "❓ Khôi Phục Mã PIN / Quên Mật Khẩu";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
          Nhập <strong>Mã số sinh viên (MSSV)</strong> và <strong>Địa chỉ Email</strong> đã đăng ký để nhận mã OTP xác thực đặt lại mã PIN:
        </p>

        <!-- Khung Xác Thực OTP Email -->
        <div style="border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 18px; background: var(--surface);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 22px;">📧</span>
            <div>
              <strong style="font-size: 14.5px; color: var(--text-primary); display: block;">Nhận mã OTP qua Email sinh viên</strong>
              <span style="font-size: 12px; color: var(--text-secondary);">Mã xác thực có hiệu lực trong 5 phút (300 giây).</span>
            </div>
          </div>

          <!-- Bước 1: Nhập MSSV & Email -->
          <div id="otpStep1">
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="font-size: 12.5px; margin-bottom: 4px;">Mã số sinh viên (MSSV) (*):</label>
                <input type="text" id="forgotMssvInput" class="form-control" placeholder="Ví dụ: 220101001">
              </div>
              <div>
                <label class="form-label" style="font-size: 12.5px; margin-bottom: 4px;">Địa chỉ Email đã đăng ký (*):</label>
                <input type="email" id="forgotEmailInput" class="form-control" placeholder="Ví dụ: 220101001@dthu.edu.vn hoặc user@gmail.com">
              </div>
            </div>
            <button class="btn btn-primary" style="width: 100%; font-weight: 700; padding: 11px;" onclick="App.sendEmailOtpAction()">
              🚀 Gửi Mã OTP Xác Thực (300s) ➔
            </button>
          </div>

          <!-- Bước 2: Nhập OTP & Đặt PIN mới + Đếm ngược 300s -->
          <div id="otpStep2" style="display: none; padding-top: 10px;">
            <div id="otpCountdownBox" class="otp-countdown-badge">
              <span>⏱️ Mã OTP có hiệu lực trong:</span>
              <span id="otpCountdownTimer" class="otp-timer-num">05:00</span>
            </div>

            <div style="font-size: 12.5px; color: #166534; background: #f0fdf4; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px;" id="otpNoticeBox">
              📨 Mã OTP đã được gửi đến email của bạn!
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Mã OTP (6 số):</label>
                <input type="text" id="otpCodeInput" class="form-control" placeholder="Nhập 6 số OTP" maxlength="6" style="letter-spacing: 2px; font-weight: 700;">
              </div>
              <div>
                <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Mã PIN mới (6 số):</label>
                <input type="password" id="newPinInput" class="form-control" placeholder="Mã PIN mới" maxlength="6">
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button id="btnVerifyOtp" class="btn btn-success" style="flex: 1; font-weight: 700; padding: 11px;" onclick="App.verifyOtpAndResetPinAction()">
                ✓ Xác Nhận & Đặt Mã PIN Mới
              </button>
              <button class="btn btn-sm" style="padding: 0 12px;" title="Gửi lại mã OTP mới" onclick="App.sendEmailOtpAction()">
                🔁 Gửi lại
              </button>
            </div>
          </div>
        </div>

        <!-- Lựa chọn Thử cách khác: Báo cáo sự cố CSKH / Quên email -->
        <div style="border-top: 1px dashed var(--border); padding-top: 12px; text-align: center;">
          <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0 0 8px 0;">
            Không nhớ địa chỉ email đã đăng ký, không nhận được OTP hoặc tài khoản bị khóa?
          </p>
          <button class="btn" style="width: 100%; border-color: #e11d48; color: #be123c; font-weight: 700; padding: 10px;" onclick="App.openSupportTicketModal()">
            🔄 Thử cách khác (Soạn văn bản gửi Admin & CSKH) ➔
          </button>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.clearOtpTimer(); App.openAccountSwitcherModal()">← Quay lại Đăng nhập</button>
      <button class="btn" onclick="App.clearOtpTimer(); App.closeModal()">Đóng</button>
    `;

    modal.classList.add("active");
  },

  async sendEmailOtpAction() {
    const mssv = document.getElementById("forgotMssvInput")?.value.trim();
    const email = document.getElementById("forgotEmailInput")?.value.trim();

    if (!mssv || !email) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ cả MSSV và Email đăng ký!", "warning");
      return;
    }

    try {
      // 1. Tạo mã OTP trong LocalStorage với hạn 300s
      const res = StorageService.generateEmailOtp(mssv, email);

      // 2. Gửi email qua Google Apps Script hoặc Fallback
      this.showToast("⏳ Đang gửi mã OTP đến hộp thư của bạn...", "info", 2000);
      const emailResult = await EmailService.sendOtp(mssv, email, res.user.fullName, res.otp);

      document.getElementById("otpStep1").style.display = "none";
      const step2 = document.getElementById("otpStep2");
      step2.style.display = "block";

      const notice = document.getElementById("otpNoticeBox");
      if (notice) {
        if (emailResult.isRealEmail) {
          notice.innerHTML = `📨 Đã gửi mã OTP thật đến hộp thư: <strong>${email}</strong>. Vui lòng kiểm tra hộp thư đến (và mục Spam nếu có).`;
        } else {
          notice.innerHTML = `📨 Đã tạo mã OTP cho email: <strong>${email}</strong>. (Mã thử nghiệm: <strong style="font-size:15px; color:#b45309;">${res.otp}</strong>)`;
        }
      }

      // 3. Khởi động đồng hồ đếm ngược 300 giây (05:00)
      this.startOtpCountdown(300, mssv, email);

      if (emailResult.isRealEmail) {
        this.showToast(`🎉 Đã gửi mã OTP đến ${email}! Vui lòng kiểm tra hộp thư.`, "success", 4500);
      } else {
        this.showToast(`📨 [Mô phỏng Email DThu] Mã xác thực OTP của bạn là: ${res.otp}`, "info", 7000);
      }
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4500);
    }
  },

  startOtpCountdown(totalSeconds = 300, mssv = "", email = "") {
    this.clearOtpTimer();
    let remaining = totalSeconds;

    const timerElem = document.getElementById("otpCountdownTimer");
    const boxElem = document.getElementById("otpCountdownBox");
    const btnVerify = document.getElementById("btnVerifyOtp");

    if (boxElem) boxElem.classList.remove("expired");
    if (btnVerify) btnVerify.disabled = false;

    const updateDisplay = () => {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      if (timerElem) timerElem.textContent = formatted;
    };

    updateDisplay();

    this.otpTimerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        this.clearOtpTimer();
        if (timerElem) timerElem.textContent = "00:00 (Hết hạn)";
        if (boxElem) {
          boxElem.classList.add("expired");
          boxElem.innerHTML = `⚠️ <span>Mã OTP đã hết hiệu lực! Vui lòng bấm <strong>Gửi lại</strong>.</span>`;
        }
        if (btnVerify) btnVerify.disabled = true;
      } else {
        updateDisplay();
      }
    }, 1000);
  },

  clearOtpTimer() {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
  },

  verifyOtpAndResetPinAction() {
    const mssv = document.getElementById("forgotMssvInput")?.value.trim();
    const email = document.getElementById("forgotEmailInput")?.value.trim();
    const otp = document.getElementById("otpCodeInput")?.value.trim();
    const newPin = document.getElementById("newPinInput")?.value.trim();

    if (!otp || !newPin) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ mã OTP 6 số và mã PIN mới!", "warning");
      return;
    }

    try {
      const user = StorageService.verifyEmailOtpAndResetPin(mssv, email, otp, newPin);
      this.clearOtpTimer();
      this.showToast(`🎉 Đã đặt lại mã PIN cho tài khoản "${user.fullName}" thành công! Vui lòng đăng nhập.`, "success", 4000);
      this.openAccountSwitcherModal();
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4500);
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MODAL SOẠN VĂN BẢN BÁO CÁO SỰ CỐ & CSKH GỬI ĐẾN ADMIN
  // ═════════════════════════════════════════════════════════════════════════
  openSupportTicketModal(prefill = {}) {
    this.clearOtpTimer();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "🆘 Soạn Văn Bản Báo Cáo Sự Cố & CSKH";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 12.5px; color: #9f1239; line-height: 1.5;">
          ℹ️ <strong>Thông báo:</strong> Văn bản của bạn sẽ được gửi trực tiếp đến hộp thư của <strong>Ban Quản Trị & Admin (${EmailService.ADMIN_EMAIL})</strong> để được hỗ trợ xử lý và cấp lại tài khoản nhanh chóng.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Họ và tên sinh viên (*):</label>
            <input type="text" id="supportFullName" class="form-control" placeholder="Ví dụ: Lê Thị Thu Thảo" value="${prefill.fullName || ''}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã số sinh viên (MSSV) (*):</label>
            <input type="text" id="supportStudentId" class="form-control" placeholder="Ví dụ: 220105888" value="${prefill.studentId || ''}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Email / SĐT liên hệ nhận phản hồi (*):</label>
            <input type="text" id="supportContact" class="form-control" placeholder="Email hoặc Số điện thoại / Zalo" value="${prefill.email || prefill.contact || ''}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Phân loại sự cố (*):</label>
            <select id="supportIssueType" class="form-control">
              <option value="Quên địa chỉ Email đăng ký">Quên địa chỉ Email đăng ký</option>
              <option value="Không nhận được mã OTP (300s)">Không nhận được mã OTP (300s)</option>
              <option value="Tài khoản bị tạm khóa / Lỗi đăng nhập">Tài khoản bị tạm khóa / Lỗi đăng nhập</option>
              <option value="Báo lỗi câu hỏi / Đề cương môn học">Báo lỗi câu hỏi / Đề cương môn học</option>
              <option value="Đóng góp ý kiến & Đề xuất tính năng">Đóng góp ý kiến & Đề xuất tính năng</option>
              <option value="Khác">Sự cố khác</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Tiêu đề yêu cầu (*):</label>
          <input type="text" id="supportTitle" class="form-control" placeholder="Ví dụ: Yêu cầu cấp lại mã PIN do mất quyền truy cập email cũ">
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Nội dung văn bản trình bày chi tiết (*):</label>
          <textarea id="supportContent" class="form-control" rows="5" placeholder="Kính gửi Ban Quản Trị & Admin Bùi Văn Khang,&#10;&#10;Em gặp sự cố...&#10;Kính mong Ban Quản Trị hỗ trợ cấp lại mã PIN hoặc mở khóa tài khoản giúp em. Em xin chân thành cảm ơn!" style="resize: vertical; line-height: 1.5; font-size: 13.5px;"></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.openForgotPasswordModal()">← Quay lại Quên mã PIN</button>
      <button class="btn btn-primary" style="background: #e11d48; border-color: #be123c;" onclick="App.submitSupportTicketAction()">
        📤 Gửi Văn Bản Đến Admin & CSKH ➔
      </button>
    `;

    modal.classList.add("active");
  },

  async submitSupportTicketAction() {
    const fullName = document.getElementById("supportFullName")?.value.trim();
    const studentId = document.getElementById("supportStudentId")?.value.trim();
    const contact = document.getElementById("supportContact")?.value.trim();
    const issueType = document.getElementById("supportIssueType")?.value;
    const title = document.getElementById("supportTitle")?.value.trim();
    const content = document.getElementById("supportContent")?.value.trim();

    if (!fullName || !studentId || !contact || !content) {
      this.showToast("⚠️ Vui lòng điền đầy đủ Họ tên, MSSV, Thông tin liên hệ và Nội dung!", "warning");
      return;
    }

    const ticketId = "TICKET-" + Math.floor(100000 + Math.random() * 900000);

    const ticketData = {
      ticketId,
      fullName,
      studentId,
      contact,
      email: contact.includes("@") ? contact : "",
      phone: !contact.includes("@") ? contact : "",
      issueType,
      title: title || `Yêu cầu hỗ trợ: ${issueType}`,
      content
    };

    this.showToast("⏳ Đang gửi văn bản báo cáo đến Admin...", "info", 2000);

    // 1. Gửi qua Google Apps Script về email Admin
    await EmailService.sendSupportTicket(ticketData);

    // 2. Lưu vào hệ thống quản trị
    StorageService.createSupportTicket(ticketData);

    const modal = document.getElementById("globalModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalFooter = document.getElementById("modalFooter");

    modalTitle.textContent = "✅ Đã Gửi Báo Cáo CSKH Thành Công!";

    modalBody.innerHTML = `
      <div style="text-align: center; padding: 20px 10px;">
        <div style="font-size: 52px; margin-bottom: 12px; line-height: 1;">📨</div>
        <h3 style="font-size: 19px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">Văn Bản Của Bạn Đã Được Chuyển Tiếp!</h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 16px 0;">
          Yêu cầu của bạn đã được gửi trực tiếp đến hộp thư của <strong>Admin Bùi Văn Khang (${EmailService.ADMIN_EMAIL})</strong>.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 14px; text-align: left; font-size: 13px; line-height: 1.7; margin-bottom: 20px;">
          <div>🎫 <strong>Mã Phiếu Hỗ Trợ:</strong> <code style="color: #e11d48; font-weight: 700;">${ticketId}</code></div>
          <div>👤 <strong>Người gửi:</strong> ${fullName} (MSSV: ${studentId})</div>
          <div>🏷️ <strong>Loại sự cố:</strong> ${issueType}</div>
          <div>📞 <strong>Kênh phản hồi:</strong> ${contact}</div>
        </div>

        <button class="btn btn-primary" style="width: 100%;" onclick="App.closeModal(); App.navigateTo('home');">
          🏠 Về Trang Chủ
        </button>
      </div>
    `;

    modalFooter.innerHTML = ``;
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MODAL XEM CHI TIẾT VĂN BẢN PHIẾU HỖ TRỢ CSKH (CHO ADMIN)
  // ═════════════════════════════════════════════════════════════════════════
  viewSupportTicketDetailModal(ticketId) {
    const requests = StorageService.getResetRequests();
    const ticket = requests.find(r => r.id === ticketId || r.ticketId === ticketId);
    if (!ticket) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `👁️ Chi Tiết Phiếu CSKH: ${ticket.ticketId || ticket.id}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; font-size: 13px; line-height: 1.8;">
          <div>🎫 <strong>Mã phiếu:</strong> <code style="font-weight:700; color:#e11d48;">${ticket.ticketId || ticket.id}</code></div>
          <div>👤 <strong>Sinh viên:</strong> <strong>${ticket.fullName}</strong> (MSSV: <strong>${ticket.studentId || 'Chưa có'}</strong>)</div>
          <div>📞 <strong>Liên hệ:</strong> <a href="mailto:${ticket.contact || ticket.email}" style="color:var(--brand-primary); font-weight:600;">${ticket.contact || ticket.phone || ticket.email || 'Chưa có'}</a></div>
          <div>🏷️ <strong>Phân loại:</strong> <span class="ticket-type-pill">${ticket.issueType || 'CSKH'}</span></div>
          <div>📅 <strong>Thời gian gửi:</strong> ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('vi-VN') : 'Gần đây'}</div>
          <div>📌 <strong>Trạng thái:</strong> <span class="${ticket.status === 'resolved' ? 'status-badge-active' : 'status-badge-pending'}">${ticket.status === 'resolved' ? '✓ Đã xử lý' : '⏳ Cần xử lý'}</span></div>
        </div>

        <div>
          <strong style="font-size: 14px; color: var(--text-primary); display: block; margin-bottom: 6px;">
            📝 Tiêu đề: ${ticket.title || 'Yêu cầu hỗ trợ'}
          </strong>
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; font-size: 13.5px; line-height: 1.7; color: var(--text-primary); white-space: pre-wrap; max-height: 250px; overflow-y: auto;">
${ticket.content || ticket.note || 'Không có nội dung chi tiết.'}
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      ${ticket.status !== 'resolved' ? `
        <button class="btn btn-primary" onclick="App.resolveResetRequestAction('${ticket.id}'); App.closeModal();">
          🔄 Cấp Lại PIN Mặc Định (123456)
        </button>
      ` : ''}
    `;

    modal.classList.add("active");
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MODAL CẤU HÌNH GOOGLE APPS SCRIPT WEB APP URL (DÀNH CHO ADMIN)
  // ═════════════════════════════════════════════════════════════════════════
  openAppsScriptConfigModal() {
    const currentUrl = EmailService.getAppsScriptUrl();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "⚙️ Cấu Hình Google Apps Script (Gửi Email Thật)";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 13px; color: #0369a1; line-height: 1.5;">
          💡 <strong>Hướng dẫn:</strong> Triển khai mã nguồn trong thư mục <code>google-apps-script/Code.gs</code> lên <a href="https://script.google.com" target="_blank" style="color:#0284c7; font-weight:700; text-decoration:underline;">script.google.com</a>, sau đó sao chép <strong>URL Ứng dụng web</strong> và dán vào ô bên dưới:
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Google Apps Script Web App URL (*):</label>
          <input type="text" id="appsScriptUrlInput" class="form-control" placeholder="https://script.google.com/macros/s/AKfycb.../exec" value="${currentUrl}">
        </div>

        <div id="gasStatusBox" style="font-size: 12.5px; padding: 10px 12px; border-radius: 4px; ${currentUrl ? 'background:#f0fdf4; color:#166534; border:1px solid #bbf7d0;' : 'background:#f8fafc; color:#64748b; border:1px solid #e2e8f0;'}">
          ${currentUrl ? `✓ Đang liên kết: <code>${currentUrl.substring(0, 45)}...</code>` : 'Chưa cấu hình URL (Hệ thống sẽ chạy ở chế độ mô phỏng OTP).'}
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm" style="border-color: #0284c7; color: #0284c7;" onclick="App.testAppsScriptConnection()">
            🧪 Kiểm Tra Kết Nối
          </button>
          <a href="https://script.google.com" target="_blank" class="btn btn-sm">
            🌐 Mở script.google.com ➔
          </a>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveAppsScriptConfig()">Lưu Cấu Hình</button>
    `;

    modal.classList.add("active");
  },

  saveAppsScriptConfig() {
    const url = document.getElementById("appsScriptUrlInput")?.value.trim();
    EmailService.setAppsScriptUrl(url);
    this.showToast(url ? "✅ Đã lưu URL Google Apps Script thành công!" : "ℹ️ Đã xóa URL Google Apps Script.", "success", 3500);
    this.closeModal();
  },

  async testAppsScriptConnection() {
    const url = document.getElementById("appsScriptUrlInput")?.value.trim();
    if (!url) {
      this.showToast("⚠️ Vui lòng nhập URL Google Apps Script trước khi kiểm tra!", "warning");
      return;
    }

    const statusBox = document.getElementById("gasStatusBox");
    if (statusBox) statusBox.innerHTML = "⏳ Đang kết nối tới máy chủ Google Apps Script...";

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (statusBox) {
        statusBox.style.background = "#f0fdf4";
        statusBox.style.color = "#166534";
        statusBox.style.border = "1px solid #bbf7d0";
        statusBox.innerHTML = `🎉 Kết nối thành công! Trạng thái: <strong>${data.status || 'online'}</strong> (Admin: ${data.admin || 'DThu'})`;
      }
      this.showToast("🎉 Kết nối thành công với Google Apps Script!", "success", 3500);
    } catch (err) {
      if (statusBox) {
        statusBox.style.background = "#fef2f2";
        statusBox.style.color = "#991b1b";
        statusBox.style.border = "1px solid #fecdd3";
        statusBox.innerHTML = `❌ Không thể kết nối. Vui lòng kiểm tra lại quyền Web App ("Anyone") và URL!`;
      }
      this.showToast("❌ Không thể kết nối tới Google Apps Script URL này!", "danger", 4000);
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MODAL LIÊN HỆ, GÓP Ý & HỖ TRỢ KỸ THUẬT (GỬI EMAIL ĐẾN ADMIN BÙI VĂN KHANG)
  // ═════════════════════════════════════════════════════════════════════════
  openContactModal(prefill = {}) {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const currentProfile = StorageService.getUserProfile();
    const isUserLoggedIn = StorageService.isLoggedIn();

    title.textContent = "📩 Liên Hệ Ban Quản Trị & Đóng Góp Ý Kiến";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Card Thông Tin Trưởng Ban Phát Triển -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1.5px solid #bae6fd; border-radius: var(--radius-sm); padding: 14px 16px; font-size: 13px; color: #0369a1; line-height: 1.6;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <div style="font-size: 28px;">👨‍💻</div>
            <div>
              <strong style="font-size: 14.5px; color: #0c4a6e;">Bùi Văn Khang</strong> (Trưởng Ban Phát Triển)
              <div style="font-size: 12px; color: #0284c7;">Lớp ĐHCNSH24A · Khoa Kỹ thuật - Công nghệ · ĐH Đồng Tháp</div>
            </div>
          </div>
          <div style="font-size: 12.5px; border-top: 1px dashed #7dd3fc; padding-top: 6px; margin-top: 6px; display: flex; flex-direction: column; gap: 3px;">
            <div>📧 Email CSKH: <strong>vkhg.bui@gmail.com</strong> · <strong>giaosukhang621@gmail.com</strong></div>
            <div>📞 Hotline / Zalo hỗ trợ: <strong>0354 616 301</strong> (Hỗ trợ 24/7)</div>
          </div>
        </div>

        <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.4;">
          Mọi góp ý về ngân hàng câu hỏi, đề xuất tính năng hoặc báo cáo lỗi kỹ thuật sẽ được gửi trực tiếp đến hộp thư của Admin:
        </p>

        <!-- Form Nhập Thông Tin -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Họ và tên của bạn (*):</label>
            <input type="text" id="contactSenderName" class="form-control" placeholder="Họ và tên..." value="${isUserLoggedIn ? currentProfile.fullName : (prefill.fullName || '')}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã số sinh viên (MSSV):</label>
            <input type="text" id="contactSenderMssv" class="form-control" placeholder="Ví dụ: 0024418475" value="${isUserLoggedIn ? (currentProfile.studentId || '') : (prefill.studentId || '')}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Email / SĐT liên hệ (*):</label>
            <input type="text" id="contactSenderInfo" class="form-control" placeholder="Email hoặc SĐT nhận phản hồi..." value="${isUserLoggedIn ? (currentProfile.email || '') : (prefill.contact || '')}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Chủ đề liên hệ (*):</label>
            <select id="contactCategory" class="form-control">
              <option value="Đóng góp ý kiến & Cải tiến tính năng">💡 Đóng góp ý kiến & Tính năng mới</option>
              <option value="Báo lỗi nội dung câu hỏi / Môn học">⚠️ Báo lỗi câu hỏi / Đề cương</option>
              <option value="Đóng góp bộ đề thi mới (.txt)">📚 Đóng góp bộ đề thi mới</option>
              <option value="Hỗ trợ tài khoản & Cấp lại mã PIN">🔑 Hỗ trợ tài khoản & Quên PIN</option>
              <option value="Hợp tác & Khác">🤝 Hợp tác & Khác</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Tiêu đề tin nhắn (*):</label>
          <input type="text" id="contactSubject" class="form-control" placeholder="Ví dụ: Góp ý thêm bộ đếm thời gian hoặc báo lỗi câu hỏi môn Toán C1">
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Nội dung chi tiết (*):</label>
          <textarea id="contactMessage" class="form-control" rows="4" placeholder="Kính gửi Ban Quản Trị DThu QuizMaster & Admin Bùi Văn Khang,&#10;&#10;Em xin phép đóng góp ý kiến..." style="resize: vertical; font-size: 13.5px; line-height: 1.5;"></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-primary" style="font-weight: 700;" onclick="App.submitContactFeedbackAction()">
        🚀 Gửi Lời Nhắn Đến Ban Quản Trị ➔
      </button>
    `;

    modal.classList.add("active");
  },

  async submitContactFeedbackAction() {
    const fullName = document.getElementById("contactSenderName")?.value.trim();
    const studentId = document.getElementById("contactSenderMssv")?.value.trim();
    const contact = document.getElementById("contactSenderInfo")?.value.trim();
    const issueType = document.getElementById("contactCategory")?.value;
    const title = document.getElementById("contactSubject")?.value.trim();
    const content = document.getElementById("contactMessage")?.value.trim();

    if (!fullName || !contact || !content) {
      this.showToast("⚠️ Vui lòng điền đầy đủ Họ tên, Thông tin liên hệ và Nội dung lời nhắn!", "warning");
      return;
    }

    const ticketId = "FEEDBACK-" + Math.floor(100000 + Math.random() * 900000);

    const ticketData = {
      ticketId,
      fullName,
      studentId: studentId || "Khách",
      contact,
      email: contact.includes("@") ? contact : "",
      phone: !contact.includes("@") ? contact : "",
      issueType,
      title: title || `Liên hệ & Góp ý: ${issueType}`,
      content
    };

    this.showToast("⏳ Đang gửi lời nhắn đến Admin Bùi Văn Khang...", "info", 2000);

    // 1. Gửi qua Google Apps Script về email Admin
    await EmailService.sendSupportTicket(ticketData);

    // 2. Lưu vào hệ thống quản trị
    StorageService.createSupportTicket(ticketData);

    this.closeModal();
    this.showToast(`🎉 Cảm ơn bạn! Lời nhắn đã được chuyển tiếp thành công đến hộp thư của Admin (Bùi Văn Khang)!`, "success", 5000);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 11. REGISTER VIEW (ĐĂNG KÝ TÀI KHOẢN SINH VIÊN MỚI - CHỜ ADMIN DUYỆT)
  // ═════════════════════════════════════════════════════════════════════════
  renderRegisterView(container) {
    container.innerHTML = `
      <div class="view-register">
        <div class="auth-card">
          <div class="auth-card-header">
            <div style="font-size: 40px; margin-bottom: 6px;">🎓</div>
            <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0;">Đăng Ký Tài Khoản Học Tập</h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
              Dành cho sinh viên Trường Đại học Đồng Tháp (DThu)
            </p>
          </div>

          <div class="auth-card-body" id="registerFormContainer">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 12.5px; color: #1e40af; line-height: 1.5;">
              ℹ️ <strong>Lưu ý:</strong> Sau khi gửi đăng ký, tài khoản sẽ ở trạng thái <strong>Chờ Phê Duyệt</strong> bởi Quản trị viên (Admin) trước khi có thể đăng nhập.
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label">Họ và tên sinh viên (*):</label>
              <input type="text" id="regFullName" class="form-control" placeholder="Ví dụ: Lê Thị Thu Thảo">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Mã số sinh viên (MSSV) (*):</label>
                <input type="text" id="regStudentId" class="form-control" placeholder="Ví dụ: 220105888">
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Email sinh viên / Cá nhân (*):</label>
                <input type="email" id="regEmail" class="form-control" placeholder="Ví dụ: 220105888@dthu.edu.vn">
              </div>
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label">Khoa / Chuyên ngành:</label>
              <select id="regDept" class="form-control">
                <option value="Khoa Nông nghiệp - Sinh học">Khoa Nông nghiệp - Sinh học</option>
                <option value="Khoa Sư phạm Khoa học Xã hội">Khoa Sư phạm Khoa học Xã hội</option>
                <option value="Khoa Sư phạm Khoa học Tự nhiên">Khoa Sư phạm Khoa học Tự nhiên</option>
                <option value="Khoa Kỹ thuật - Công nghệ">Khoa Kỹ thuật - Công nghệ</option>
                <option value="Khoa Kinh tế - Quản trị">Khoa Kinh tế - Quản trị</option>
                <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
                <option value="Khoa Giáo dục Tiểu học - Mầm non">Khoa Giáo dục Tiểu học - Mầm non</option>
                <option value="Khác">Khoa / Chuyên ngành khác</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Tạo Mã PIN Đăng nhập (6 số) (*):</label>
                <input type="password" id="regPin" class="form-control" placeholder="Mã PIN 6 số" maxlength="6">
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Xác nhận Mã PIN (*):</label>
                <input type="password" id="regPinConfirm" class="form-control" placeholder="Nhập lại mã PIN" maxlength="6">
              </div>
            </div>

            <!-- Avatar Picker -->
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Chọn Avatar đại diện:</label>
              <div class="avatar-picker-grid" id="regAvatarPicker">
                ${['👨‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🧪', '🧬', '🌟', '📚', '🎯', '🦁', '🦉', '🚀'].map((av, idx) => `
                  <button type="button" class="avatar-choice-btn ${idx === 0 ? 'active' : ''}" onclick="App.selectRegAvatar('${av}', this)">
                    ${av}
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="selectedRegAvatar" value="👨‍🎓">
            </div>

            <button class="btn btn-primary" style="padding: 12px; font-size: 14px; font-weight: 700; width: 100%;" onclick="App.submitRegistration()">
              🚀 Gửi Yêu Cầu Đăng Ký Tài Khoản ➔
            </button>

            <div class="auth-footer-links">
              <span>Đã có tài khoản? <a href="javascript:void(0)" onclick="App.openAccountSwitcherModal()" style="color: var(--brand-primary); font-weight: 700;">Đăng nhập ngay</a></span>
              <a href="javascript:void(0)" onclick="App.openForgotPasswordModal()" style="color: var(--text-secondary);">Quên mã PIN?</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectRegAvatar(avatar, btn) {
    document.querySelectorAll("#regAvatarPicker .avatar-choice-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const hidden = document.getElementById("selectedRegAvatar");
    if (hidden) hidden.value = avatar;
  },

  async submitRegistration() {
    const fullName = document.getElementById("regFullName")?.value.trim();
    const studentId = document.getElementById("regStudentId")?.value.trim();
    const email = document.getElementById("regEmail")?.value.trim();
    const dept = document.getElementById("regDept")?.value;
    const pin = document.getElementById("regPin")?.value.trim();
    const pinConfirm = document.getElementById("regPinConfirm")?.value.trim();
    const avatar = document.getElementById("selectedRegAvatar")?.value || "👨‍🎓";

    if (!fullName || !studentId || !pin) {
      this.showToast("⚠️ Vui lòng điền đầy đủ Họ tên, MSSV và Mã PIN!", "warning");
      return;
    }

    if (!email) {
      this.showToast("⚠️ Vui lòng nhập địa chỉ Email của bạn!", "warning");
      return;
    }

    // Kiểm tra cấu trúc & tính hợp lệ của email chạy ẩn phía dưới
    const emailValidation = EmailService.validateEmail(email);
    if (!emailValidation.isValid) {
      this.showToast(`⚠️ ${emailValidation.message}`, "warning", 4500);
      return;
    }

    if (pin.length < 4) {
      this.showToast("⚠️ Mã PIN phải có ít nhất 4 đến 6 số!", "warning");
      return;
    }

    if (pin !== pinConfirm) {
      this.showToast("⚠️ Xác nhận mã PIN không khớp! Vui lòng nhập lại.", "warning");
      return;
    }

    this.showToast("⏳ Đang gửi hồ sơ lên CSDL Đám Mây Supabase...", "info", 1500);

    try {
      const newUser = await StorageService.registerUser({
        fullName,
        studentId,
        email,
        department: dept,
        pinCode: pin,
        avatar
      });

      const formContainer = document.getElementById("registerFormContainer");
      if (formContainer) {
        formContainer.innerHTML = `
          <div style="text-align: center; padding: 24px 10px;">
            <div style="font-size: 56px; margin-bottom: 14px; animation: pulse 1.8s infinite;">⏳</div>
            <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">Đăng Ký Thành Công!</h3>
            <div style="background: #fefce8; border: 1.5px solid #fef08a; border-radius: var(--radius-sm); padding: 16px; margin: 16px 0; text-align: left; font-size: 13px; line-height: 1.6; color: #854d0e;">
              <div>👤 <strong>Họ tên:</strong> ${newUser.fullName}</div>
              <div>🆔 <strong>MSSV:</strong> ${newUser.studentId}</div>
              <div>🏛️ <strong>Khoa:</strong> ${newUser.department}</div>
              <div>📧 <strong>Email:</strong> ${newUser.email}</div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #fde047; font-weight: 700; color: #b45309; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; animation: pulse 1s infinite;"></span>
                <span>Trạng thái: Đang chờ Quản trị viên (Bùi Văn Khang) phê duyệt...</span>
              </div>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
              ⚡ <strong>Tự Động Kết Nối Realtime:</strong> Khi Admin bấm phê duyệt, trang web này sẽ <strong>tự động đăng nhập và đưa bạn vào phòng thi ngay lập tức</strong> mà không cần tải lại trang.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
              <button class="btn" onclick="App.openAccountSwitcherModal()">🔑 Đăng Nhập Tài Khoản Khác</button>
            </div>
          </div>
        `;
      }

      this.showToast(`🎉 Gửi yêu cầu đăng ký cho "${fullName}" thành công!`, "success", 4000);
      
      // Bắt đầu quét thời gian thực trạng thái phê duyệt từ Supabase Cloud
      this.startRegistrationLiveWatcher(newUser.studentId);
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4000);
    }
  },

  startRegistrationLiveWatcher(studentId) {
    if (this.regWatcherInterval) {
      clearInterval(this.regWatcherInterval);
      this.regWatcherInterval = null;
    }

    if (!studentId || typeof SupabaseClient === "undefined" || !API_CONFIG.isCloudEnabled()) return;

    this.regWatcherInterval = setInterval(async () => {
      try {
        const cloudUser = await SupabaseClient.getUserByStudentId(studentId);
        if (!cloudUser) return;

        if (cloudUser.status === "active") {
          clearInterval(this.regWatcherInterval);
          this.regWatcherInterval = null;

          const mapped = {
            id: cloudUser.id,
            studentId: cloudUser.student_id,
            className: cloudUser.class_name || "",
            fullName: cloudUser.full_name,
            email: cloudUser.email,
            phone: cloudUser.phone || "",
            department: cloudUser.department || "Khoa Kỹ thuật - Công nghệ",
            role: cloudUser.role || "student",
            pinCode: cloudUser.pin_code || "123456",
            avatar: cloudUser.avatar || "👨‍🎓",
            totalExp: cloudUser.total_exp || 50,
            streakDays: 1,
            quizzesCompleted: 0,
            status: "active",
            permissions: cloudUser.permissions || {},
            approvedBy: cloudUser.approved_by || "Bùi Văn Khang",
            approvedAt: cloudUser.approved_at,
            createdAt: cloudUser.created_at
          };
          StorageService.updateUser(mapped.id, mapped);
          StorageService.saveUserProfile(mapped);

          const formContainer = document.getElementById("registerFormContainer");
          if (formContainer) {
            formContainer.innerHTML = `
              <div style="text-align: center; padding: 32px 16px;">
                <div style="font-size: 64px; margin-bottom: 12px; animation: bounce 1s infinite;">🎉</div>
                <h3 style="font-size: 22px; font-weight: 800; color: #16a34a; margin-bottom: 8px;">Tài Khoản Đã Được Phê Duyệt!</h3>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
                  Chúc mừng <strong>${mapped.fullName}</strong> (MSSV: <strong>${mapped.studentId}</strong>) đã được Admin duyệt tham gia hệ thống!<br>
                  Đang tự động đăng nhập và đưa bạn vào Trang chủ trong giây lát...
                </p>
                <button class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;" onclick="App.navigateTo('home')">
                  🚀 Vào Trang Chủ Ngay ➔
                </button>
              </div>
            `;
          }

          App.renderHeader();
          App.showToast(`🎉 Chúc mừng ${mapped.fullName}! Tài khoản của bạn đã được Admin phê duyệt!`, "success", 5000);

          setTimeout(() => {
            if (App.currentView === "register") {
              App.navigateTo("home");
            }
          }, 1800);
        } else if (cloudUser.status === "rejected") {
          clearInterval(this.regWatcherInterval);
          this.regWatcherInterval = null;
          const formContainer = document.getElementById("registerFormContainer");
          if (formContainer) {
            formContainer.innerHTML = `
              <div style="text-align: center; padding: 32px 16px;">
                <div style="font-size: 54px; margin-bottom: 12px;">❌</div>
                <h3 style="font-size: 20px; font-weight: 800; color: #dc2626; margin-bottom: 8px;">Hồ Sơ Không Được Phê Duyệt</h3>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
                  Rất tiếc, hồ sơ đăng ký của bạn không được Quản trị viên chấp thuận.
                </p>
                <button class="btn" onclick="App.navigateTo('register')">🔄 Thử Đăng Ký Lại</button>
              </div>
            `;
          }
          App.showToast("❌ Hồ sơ đăng ký của bạn không được Admin chấp thuận.", "danger", 4500);
        }
      } catch (e) {
        console.warn("[Live Watcher Error]:", e);
      }
    }, 2500);
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 12. MANAGE VIEW (QUẢN LÝ MÔN HỌC & ĐỀ THI) — Hợp nhất Chính thức + Chờ duyệt
  // ═════════════════════════════════════════════════════════════════════════
  renderManageView(container) {
    const subjects = StorageService.getSubjects();
    const drafts = StorageService.getDraftSubjects();
    const profile = StorageService.getUserProfile();
    const canApprove = profile.role === "admin" || StorageService.hasPermission("canApproveDrafts");
    const activeTab = this.adminSubjectTab || "official";

    container.innerHTML = `
      <div style="padding: 32px 28px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">⚙️ Quản Lý Bộ Đề</h2>
            <p style="color: var(--text-secondary); margin-top: 4px;">Quản lý toàn bộ ngân hàng đề thi chính thức và duyệt đề đóng góp từ cộng đồng.</p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.navigateTo('parser')">📝 Nhập đề (Parser)</button>
            <button class="btn" onclick="App.openCreateSubjectModal()">➕ Thêm môn học</button>
            <button class="btn" onclick="App.refreshCloudSubjects()">🔄 Làm mới Cloud</button>
            <button class="btn" onclick="ImportExportService.exportAll()">💾 Sao lưu (.json)</button>
          </div>
        </div>

        <div class="hub-tabs" style="margin-bottom: 20px;">
          <button class="hub-tab-btn ${activeTab === 'official' ? 'active' : ''}" onclick="App.switchManageTab('official')">
            📚 Bộ Đề Chính Thức <span class="badge-tab-count">${subjects.length}</span>
          </button>
          ${canApprove ? '<button class="hub-tab-btn ' + (activeTab === 'drafts' ? 'active' : '') + '" onclick="App.switchManageTab(\'drafts\')">⏳ Chờ Phê Duyệt <span class="badge-tab-count">' + drafts.length + '</span></button>' : ''}
        </div>

        <div id="manageTabContent">
          ${activeTab === 'official' ? this.renderManageOfficialTab(subjects) : this.renderManageDraftsTab(drafts)}
        </div>
      </div>
    `;
  },

  switchManageTab(tab) {
    this.adminSubjectTab = tab;
    this.renderManageView(document.getElementById("mainContent"));
  },

  renderManageOfficialTab(subjects) {
    if (subjects.length === 0) {
      return '<div style="text-align: center; padding: 48px; color: var(--text-tertiary); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);"><div style="font-size: 40px; margin-bottom: 10px;">📭</div><h3>Chưa có môn học chính thức nào.</h3><p style="margin-top: 6px;">Bấm "➕ Thêm môn học" hoặc nhập đề qua Parser.</p></div>';
    }
    return '<div style="display: flex; flex-direction: column; gap: 14px;">' +
      subjects.map(sub => '<div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">' +
        '<div style="flex: 1; min-width: 250px;">' +
          '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;"><span class="badge badge-gray">' + (sub.code || sub.id) + '</span><span class="badge badge-blue">' + (sub.department || 'ĐH Đồng Tháp') + '</span></div>' +
          '<h3 style="font-size: 16.5px; margin-bottom: 2px; color: var(--text-primary);">' + sub.name + '</h3>' +
          '<div style="font-size: 12.5px; color: var(--text-tertiary);">' + (sub.questions ? sub.questions.length : 0) + ' câu hỏi · ' + (sub.chapters ? sub.chapters.length : 0) + ' chương · Tác giả: <strong>' + (sub.author || 'Chưa cập nhật') + '</strong></div>' +
        '</div>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
          '<button class="btn btn-sm btn-primary" onclick="App.openQuizConfigModal(\'' + sub.id + '\')">👁️ Ôn Thi</button>' +
          '<button class="btn btn-sm" onclick="App.navigateTo(\'subject-detail\', { subjectId: \'' + sub.id + '\' })">⚙️ Quản lý</button>' +
          '<button class="btn btn-sm" onclick="ImportExportService.exportSubject(\'' + sub.id + '\')">📥 JSON</button>' +
          '<button class="btn btn-danger btn-sm" onclick="App.deleteSubjectConfirm(\'' + sub.id + '\')">🗑️ Xóa</button>' +
        '</div>' +
      '</div>').join('') + '</div>';
  },

  renderManageDraftsTab(drafts) {
    if (drafts.length === 0) {
      return '<div style="text-align: center; padding: 48px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);"><div style="font-size: 40px; margin-bottom: 10px;">🎉</div><h3>Không có đề thi nào đang chờ duyệt!</h3><p style="margin-top: 6px; color: var(--text-secondary);">Mọi đóng góp từ cộng đồng đã được xử lý.</p></div>';
    }
    return '<div class="moderation-list">' +
      drafts.map(d => '<div class="moderation-card">' +
        '<div class="moderation-card-header">' +
          '<div class="moderation-title-group">' +
            '<h3>' + (d.icon || '🧪') + ' ' + d.name + ' <span class="badge" style="background:#fef3c7; color:#b45309;">' + (d.code || d.id) + '</span></h3>' +
            '<div class="moderation-meta">' +
              '<span>🏛️ ' + (d.department || 'ĐH Đồng Tháp') + '</span>' +
              '<span>👤 Người gửi: <strong>' + (d.author || 'Ẩn danh') + '</strong></span>' +
              '<span>📅 Ngày gửi: <strong>' + (d.submissionDate || 'Gần đây') + '</strong></span>' +
              '<span>❓ Số câu hỏi: <strong>' + (d.questions ? d.questions.length : 0) + ' câu</strong></span>' +
            '</div>' +
          '</div>' +
          '<div class="moderation-actions">' +
            '<button class="btn btn-sm" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-weight:700;" onclick="App.navigateTo(\'draft-review\', { draftId: \'' + d.id + '\' })">👁️ Xem & Sửa Đề</button>' +
            '<button class="btn btn-primary" onclick="App.approveDraft(\'' + d.id + '\')">✅ Duyệt Chính Thức</button>' +
            '<button class="btn btn-danger btn-sm" onclick="App.rejectDraftConfirm(\'' + d.id + '\')">❌ Từ chối</button>' +
          '</div>' +
        '</div>' +
        '<div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">' + (d.description || 'Không có mô tả chi tiết.') + '</div>' +
      '</div>').join('') + '</div>';
  },

  async refreshCloudSubjects() {
    this.showToast("🔄 Đang đồng bộ dữ liệu từ Cloud...", "info", 2000);
    try {
      await StorageService.syncWithCloud();
      this.showToast("✅ Đã đồng bộ xong!", "success", 2500);
      this.renderManageView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ Lỗi đồng bộ: " + e.message, "danger", 3000);
    }
  },

  deleteSubjectConfirm(subjectId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa môn học",
      message: "Bạn có chắc chắn muốn xóa môn học này không? Toàn bộ ngân hàng câu hỏi sẽ bị xóa khỏi máy và Cloud.",
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
  // ═════════════════════════════════════════════════════════════════════════
  // 13. DRAFT REVIEW & INLINE EDIT VIEW (XEM LẠI & CHỈNH SỬA ĐỀ CHỜ DUYỆT)
  // ═════════════════════════════════════════════════════════════════════════
  renderDraftReviewView(container, draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) {
      this.showToast("⚠️ Không tìm thấy bộ đề chờ duyệt này!", "warning");
      this.adminSubjectTab = "drafts";
      this.navigateTo("manage");
      return;
    }

    this.activeReviewDraftId = draftId;
    const questions = draft.questions || [];
    const editIdx = this.draftEditingQuestionIndex;
    const allOfficialSubjects = StorageService.getSubjects();

    // 1. Tự động nhận diện môn học đích (Target Subject Auto-Detection)
    let targetSubObj = null;
    if (draft.targetSubjectId && draft.targetSubjectId !== "NEW") {
      targetSubObj = allOfficialSubjects.find(s => s.id === draft.targetSubjectId);
    }
    if (!targetSubObj && draft.subjectId && draft.subjectId !== "NEW") {
      targetSubObj = allOfficialSubjects.find(s => s.id === draft.subjectId);
    }
    if (!targetSubObj && draft.code) {
      targetSubObj = allOfficialSubjects.find(s => s.code && s.code.toLowerCase() === draft.code.toLowerCase());
    }
    if (!targetSubObj && draft.name) {
      targetSubObj = allOfficialSubjects.find(s => s.name && s.name.toLowerCase() === draft.name.toLowerCase());
    }

    // Xác định ID môn học đích đã giải quyết (resolvedTargetSubId)
    const resolvedTargetSubId = targetSubObj ? targetSubObj.id : (draft.targetSubjectId === "NEW" ? "NEW" : (allOfficialSubjects.length > 0 ? allOfficialSubjects[0].id : "NEW"));
    const targetChapterId = draft.targetChapterId || "c1";

    // Danh sách chương của môn học đích
    const targetChapters = (targetSubObj && targetSubObj.chapters && targetSubObj.chapters.length > 0)
      ? targetSubObj.chapters
      : (draft.chapters && draft.chapters.length > 0 ? draft.chapters : [{ id: "c1", name: "Chương 1: Mở đầu & Tổng hợp" }]);

    // Điền sẵn thông tin chuẩn xác từ Môn học đích hoặc Draft
    const displaySubjectName = draft.name || (targetSubObj ? targetSubObj.name : "");
    const displaySubjectCode = draft.code || (targetSubObj ? targetSubObj.code : "POL101");
    const displayDepartment = draft.department || (targetSubObj ? targetSubObj.department : "Khoa Kỹ thuật - Công nghệ");
    const displayAuthor = draft.author || "Sinh viên DThu";
    const displayDesc = draft.description || (targetSubObj ? targetSubObj.description : "");

    container.innerHTML = `
      <div style="padding: 28px 24px; max-width: 1050px; margin: 0 auto; width: 100%;">
        <!-- Sticky Header & Action Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-sm" onclick="App.adminSubjectTab = 'drafts'; App.navigateTo('manage')">
              ← Quay lại Quản lý bộ đề
            </button>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700;">⏳ Bản Chờ Phê Duyệt</span>
                <span class="badge badge-gray">${questions.length} câu hỏi</span>
              </div>
              <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
                👁️ Xem Lại & Chỉnh Sửa: ${draft.name || displaySubjectName}
              </h2>
            </div>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="App.saveDraftFullChanges('${draft.id}')">
              💾 Lưu Thay Đổi
            </button>
            <button class="btn btn-success btn-sm" onclick="App.approveDraftFromReview('${draft.id}')">
              ✅ Phê Duyệt Chính Thức
            </button>
            <button class="btn btn-danger btn-sm" onclick="App.rejectDraftConfirm('${draft.id}')">
              ❌ Từ Chối & Xóa
            </button>
          </div>
        </div>

        <!-- Khối Thông Tin Cơ Bản & Đích Đến (Editable) -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">
              📋 Thông Tin Tổng Quan & Môn Học Đích
            </h3>
            <span style="font-size: 12px; color: var(--text-tertiary);">Chỉnh sửa trực tiếp và bấm "Lưu Thay Đổi"</span>
          </div>

          <!-- Môn học đích khi duyệt -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 16px 18px; margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
              <div style="font-weight: 800; font-size: 14px; color: #166534; display: flex; align-items: center; gap: 6px;">
                <span>🎯</span>
                <span>Đích Đến Khi Phê Duyệt (Gộp vào Môn học chính thức):</span>
              </div>
              ${targetSubObj ? `
                <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700; font-size:12px;">
                  🔗 Đang liên kết: ${targetSubObj.name} (${targetSubObj.code || targetSubObj.id}) · ${targetSubObj.questions ? targetSubObj.questions.length : 0} câu hiện có
                </span>
              ` : `
                <span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700; font-size:12px;">
                  ➕ Sẽ tạo thành một Môn học Mới
                </span>
              `}
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 12.5px; color: #166534; font-weight: 700;">Gán vào môn học (*):</label>
                <select id="reviewDraftTargetSubject" class="form-control" style="font-weight: 600;" onchange="App.onReviewTargetSubjectChange('${draft.id}')">
                  ${allOfficialSubjects.map(s => {
                    const isSelected = (resolvedTargetSubId === s.id);
                    return `<option value="${s.id}" ${isSelected ? 'selected' : ''}>📚 ${s.name} (Mã: ${s.code || s.id})</option>`;
                  }).join('')}
                  <option value="NEW" ${resolvedTargetSubId === 'NEW' ? 'selected' : ''}>➕ Tạo thành môn học mới hoàn toàn</option>
                </select>
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 12.5px; color: #166534; font-weight: 700;">Gán câu hỏi vào chương (*):</label>
                <select id="reviewDraftTargetChapter" class="form-control" style="font-weight: 600;">
                  ${targetChapters.map(c => `<option value="${c.id}" ${targetChapterId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 12px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Tên Môn Học / Bộ Đề (*):</label>
              <input type="text" id="reviewDraftName" class="form-control" value="${displaySubjectName}" placeholder="Nhập tên môn học...">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Mã Học Phần (*):</label>
              <input type="text" id="reviewDraftCode" class="form-control" value="${displaySubjectCode}" placeholder="VD: POL102, BIO201...">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Khoa / Bộ Môn:</label>
              <input type="text" id="reviewDraftDept" class="form-control" value="${displayDepartment}" placeholder="Tên khoa...">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Người Đóng Góp / Tác Giả:</label>
              <input type="text" id="reviewDraftAuthor" class="form-control" value="${displayAuthor}" placeholder="Tên người gửi...">
            </div>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 13px; font-weight: 700;">Mô Tả Bộ Đề:</label>
            <input type="text" id="reviewDraftDesc" class="form-control" value="${displayDesc}" placeholder="Nhập mô tả tóm tắt...">
          </div>
        </div>

        <!-- Khối Danh Sách Câu Hỏi & Inline Edit -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary);">
                📝 Danh Sách Câu Hỏi Trong Đề (${questions.length} câu)
              </h3>
              <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
                Đọc soát từng câu hỏi. Bấm <strong>"✏️ Sửa câu này"</strong> để chỉnh sửa nội dung hoặc đáp án trực tiếp tại chỗ.
              </p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="App.addNewDraftQuestion('${draft.id}')">
              ➕ Thêm câu hỏi mới
            </button>
          </div>

          ${questions.length === 0 ? `
            <div style="text-align: center; padding: 48px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
              <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
              <h3>Bộ đề này chưa có câu hỏi nào!</h3>
              <p style="margin-top: 6px; color: var(--text-secondary);">Bấm nút "➕ Thêm câu hỏi mới" bên trên để bắt đầu soạn câu hỏi.</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${questions.map((q, qIdx) => {
                const isEditing = (editIdx === qIdx);

                if (isEditing) {
                  // FORM CHỈNH SỬA TRỰC TIẾP (INLINE EDITOR)
                  return `
                    <div style="background: #ffffff; border: 2px solid var(--brand-primary); border-radius: var(--radius-md); padding: 20px; box-shadow: 0 4px 12px rgba(59,130,246,0.12);">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span class="badge" style="background:#dbeafe; color:#1e40af; font-weight:700;">✏️ Đang sửa Câu ${qIdx + 1}</span>
                        <div style="display: flex; gap: 8px;">
                          <button class="btn btn-primary btn-sm" onclick="App.saveDraftQuestionEdit('${draft.id}', ${qIdx})">
                            ✔️ Hoàn tất sửa câu này
                          </button>
                          <button class="btn btn-sm" onclick="App.cancelDraftQuestionEdit('${draft.id}')">
                            Hủy
                          </button>
                        </div>
                      </div>

                      <div class="form-group" style="margin-bottom: 14px;">
                        <label class="form-label" style="font-size: 13px; font-weight:700;">Nội dung câu hỏi (*):</label>
                        <textarea id="editDraftQText_${qIdx}" class="form-control" style="min-height: 80px; font-size: 14px;">${q.question || ''}</textarea>
                      </div>

                      <div style="margin-bottom: 14px;">
                        <label class="form-label" style="font-size: 13px; font-weight:700; margin-bottom: 8px; display:block;">
                          Các phương án lựa chọn (Tích chọn nút tròn để đổi đáp án đúng):
                        </label>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                          ${[0, 1, 2, 3].map(oi => {
                            const opt = (q.options && q.options[oi]) ? q.options[oi] : { text: '', note: '' };
                            const isCorrect = (q.answerIndex === oi || (opt.isCorrect && q.answerIndex === undefined));
                            return `
                              <div style="display: flex; gap: 10px; align-items: flex-start; background: ${isCorrect ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isCorrect ? '#86efac' : 'var(--border)'}; border-radius: var(--radius-sm); padding: 10px 12px;">
                                <div style="display: flex; align-items: center; gap: 6px; padding-top: 6px;">
                                  <input type="radio" name="editDraftAnswer_${qIdx}" id="editDraftAns_${qIdx}_${oi}" value="${oi}" ${isCorrect ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                                  <label for="editDraftAns_${qIdx}_${oi}" style="font-weight: 800; font-size: 14px; cursor: pointer; color: ${isCorrect ? '#166534' : 'inherit'};">
                                    ${App.letters[oi]}.
                                  </label>
                                </div>
                                <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                                  <input type="text" id="editDraftOpt_${qIdx}_${oi}" class="form-control" value="${(opt.text || '').replace(/"/g, '&quot;')}" placeholder="Nội dung phương án ${App.letters[oi]}..." style="font-size: 13.5px;">
                                  <input type="text" id="editDraftNote_${qIdx}_${oi}" class="form-control" value="${(opt.note || '').replace(/"/g, '&quot;')}" placeholder="Giải thích cho phương án ${App.letters[oi]} (tùy chọn)..." style="font-size: 12px; color: var(--text-secondary);">
                                </div>
                              </div>
                            `;
                          }).join('')}
                        </div>
                      </div>
                    </div>
                  `;
                }

                // THẺ REVIEW TRỰC QUAN (READ-ONLY VIEW)
                return `
                  <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 20px; transition: var(--transition-fast);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="badge badge-gray" style="font-weight: 700;">Câu ${qIdx + 1}</span>
                        <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700;">
                          Đáp án: ${App.letters[q.answerIndex] || 'A'}
                        </span>
                      </div>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm btn-primary" onclick="App.toggleEditDraftQuestion('${draft.id}', ${qIdx})">
                          ✏️ Sửa câu này
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="App.deleteDraftQuestion('${draft.id}', ${qIdx})">
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>

                    <div style="font-weight: 700; font-size: 14.5px; line-height: 1.5; margin-bottom: 12px; color: var(--text-primary);">
                      ${SmartParserService.formatRichText(q.question)}
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; width: 100%;">
                      ${(q.options || []).map((opt, optIdx) => {
                        const isAns = (optIdx === q.answerIndex);
                        return `
                          <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; padding: 10px 14px; border-radius: 6px; border: ${isAns ? '1.5px solid #16a34a' : '1px solid #cbd5e1'}; background: ${isAns ? '#dcfce7' : '#ffffff'}; box-shadow: ${isAns ? '0 1px 3px rgba(22, 163, 74, 0.15)' : 'none'}; width: 100%; box-sizing: border-box;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; min-width: 24px; background: ${isAns ? '#16a34a' : '#f1f5f9'}; color: ${isAns ? '#ffffff' : '#475569'}; border: ${isAns ? 'none' : '1px solid #cbd5e1'}; border-radius: 4px; font-weight: 800; font-size: 12.5px; flex-shrink: 0; margin-top: 1px;">
                              ${App.letters[optIdx]}
                            </span>
                            <div style="font-weight: ${isAns ? '700' : '400'}; color: ${isAns ? '#14532d' : '#334155'}; flex: 1; min-width: 0; word-break: break-word; overflow-wrap: break-word; line-height: 1.5;">
                              ${SmartParserService.formatRichText(opt.text || '')}
                            </div>
                            ${isAns ? `
                              <span style="margin-left: 8px; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0;">
                                ✓ Đúng
                              </span>
                            ` : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>

                    ${(q.options && q.options[q.answerIndex] && q.options[q.answerIndex].note) ? `
                      <div style="font-size: 13px; color: #14532d; background: #f0fdf4; padding: 10px 14px; border-radius: 6px; border: 1.5px dashed #22c55e; margin-top: 8px;">
                        💡 <strong>Giải thích:</strong> ${SmartParserService.formatRichText(q.options[q.answerIndex].note)}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Bottom Action Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;">
          <button class="btn btn-sm" onclick="App.adminSubjectTab = 'drafts'; App.navigateTo('manage')">
            ← Quay lại Quản lý bộ đề
          </button>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.addNewDraftQuestion('${draft.id}')">
              ➕ Thêm câu hỏi
            </button>
            <button class="btn btn-primary" onclick="App.saveDraftFullChanges('${draft.id}')">
              💾 Lưu Thay Đổi
            </button>
            <button class="btn btn-success" onclick="App.approveDraftFromReview('${draft.id}')">
              ✅ Phê Duyệt Chính Thức Ngay ➔
            </button>
          </div>
        </div>
      </div>
    `;
  },

  onReviewTargetSubjectChange(draftId) {
    const subSelect = document.getElementById("reviewDraftTargetSubject");
    const chapSelect = document.getElementById("reviewDraftTargetChapter");
    const nameInput = document.getElementById("reviewDraftName");
    const codeInput = document.getElementById("reviewDraftCode");
    const deptInput = document.getElementById("reviewDraftDept");
    const descInput = document.getElementById("reviewDraftDesc");
    if (!subSelect || !chapSelect) return;

    const subId = subSelect.value;
    if (subId === "NEW") {
      chapSelect.innerHTML = '<option value="c1">Chương 1: Mở đầu & Tổng hợp</option>';
      if (codeInput && !codeInput.value) codeInput.value = "GEN101";
      if (deptInput && !deptInput.value) deptInput.value = "Khoa Kỹ thuật - Công nghệ";
    } else {
      const sub = StorageService.getSubjectById(subId);
      if (sub) {
        // Tự động điền đầy đủ thông tin Môn học đích có sẵn
        if (nameInput) nameInput.value = sub.name;
        if (codeInput) codeInput.value = sub.code || sub.id;
        if (deptInput) deptInput.value = sub.department || "Khoa Kỹ thuật - Công nghệ";
        if (descInput && !descInput.value) descInput.value = sub.description || "";

        // Nạp đầy đủ các chương thực tế của môn học đích
        if (sub.chapters && sub.chapters.length > 0) {
          chapSelect.innerHTML = sub.chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        } else {
          chapSelect.innerHTML = '<option value="c1">Chương 1: Mở đầu</option>';
        }
      }
    }
  },

  toggleEditDraftQuestion(draftId, qIndex) {
    this.draftEditingQuestionIndex = qIndex;
    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  cancelDraftQuestionEdit(draftId) {
    this.draftEditingQuestionIndex = null;
    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  saveDraftQuestionEdit(draftId, qIndex) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft || !draft.questions || !draft.questions[qIndex]) return;

    const qText = document.getElementById(`editDraftQText_${qIndex}`)?.value.trim() || "";
    if (!qText) {
      this.showToast("⚠️ Vui lòng nhập nội dung câu hỏi!", "warning");
      return;
    }

    const radios = document.querySelectorAll(`input[name="editDraftAnswer_${qIndex}"]`);
    let selectedAns = 0;
    radios.forEach(r => {
      if (r.checked) selectedAns = parseInt(r.value, 10);
    });

    const newOptions = [0, 1, 2, 3].map(oi => {
      const optText = document.getElementById(`editDraftOpt_${qIndex}_${oi}`)?.value.trim() || `Phương án ${this.letters[oi]}`;
      const optNote = document.getElementById(`editDraftNote_${qIndex}_${oi}`)?.value.trim() || "";
      return {
        text: optText,
        isCorrect: (oi === selectedAns),
        note: optNote
      };
    });

    draft.questions[qIndex].question = qText;
    draft.questions[qIndex].options = newOptions;
    draft.questions[qIndex].answerIndex = selectedAns;

    StorageService.saveDraftSubject(draft);
    this.draftEditingQuestionIndex = null;
    this.showToast(`✅ Đã cập nhật Câu ${qIndex + 1}!`, "success", 2500);

    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  deleteDraftQuestion(draftId, qIndex) {
    this.showConfirmDialog({
      title: "Xác nhận xóa câu hỏi",
      message: `Bạn có chắc chắn muốn xóa Câu ${qIndex + 1} khỏi bộ đề này không?`,
      icon: "🗑️",
      confirmText: "Xóa câu này",
      isDanger: true,
      warningKey: "delete_draft_q",
      onConfirm: () => {
        const draft = StorageService.getDraftById(draftId);
        if (!draft || !draft.questions) return;
        draft.questions.splice(qIndex, 1);
        if (this.draftEditingQuestionIndex === qIndex) this.draftEditingQuestionIndex = null;
        StorageService.saveDraftSubject(draft);
        this.showToast("🗑️ Đã xóa câu hỏi khỏi bộ đề!", "info", 2500);
        const main = document.getElementById("mainContent");
        if (main) this.renderDraftReviewView(main, draftId);
      }
    });
  },

  addNewDraftQuestion(draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;
    if (!draft.questions) draft.questions = [];

    const newQ = {
      id: `q-${Date.now()}-${draft.questions.length + 1}`,
      chapterId: draft.targetChapterId || "c1",
      question: "Nội dung câu hỏi mới...",
      options: [
        { text: "Phương án A", isCorrect: true, note: "Giải thích đáp án A (chính xác)." },
        { text: "Phương án B", isCorrect: false, note: "" },
        { text: "Phương án C", isCorrect: false, note: "" },
        { text: "Phương án D", isCorrect: false, note: "" }
      ],
      answerIndex: 0
    };

    draft.questions.push(newQ);
    StorageService.saveDraftSubject(draft);
    this.draftEditingQuestionIndex = draft.questions.length - 1;
    this.showToast("➕ Đã thêm câu hỏi mới vào cuối đề!", "success", 2500);

    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  saveDraftFullChanges(draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;

    const nameVal = document.getElementById("reviewDraftName")?.value.trim();
    const codeVal = document.getElementById("reviewDraftCode")?.value.trim();
    const deptVal = document.getElementById("reviewDraftDept")?.value.trim();
    const authorVal = document.getElementById("reviewDraftAuthor")?.value.trim();
    const descVal = document.getElementById("reviewDraftDesc")?.value.trim();
    const targetSubVal = document.getElementById("reviewDraftTargetSubject")?.value;
    const targetChapVal = document.getElementById("reviewDraftTargetChapter")?.value;

    if (nameVal) draft.name = nameVal;
    if (codeVal) draft.code = codeVal;
    if (deptVal) draft.department = deptVal;
    if (authorVal) draft.author = authorVal;
    if (descVal !== undefined) draft.description = descVal;
    if (targetSubVal) draft.targetSubjectId = targetSubVal;
    if (targetChapVal) {
      draft.targetChapterId = targetChapVal;
      if (draft.questions) {
        draft.questions.forEach(q => {
          if (!q.chapterId) q.chapterId = targetChapVal;
        });
      }
    }

    // Nếu liên kết với môn học có sẵn, bảo đảm mã và tên khớp hoàn toàn
    if (targetSubVal && targetSubVal !== "NEW") {
      const targetSub = StorageService.getSubjectById(targetSubVal);
      if (targetSub) {
        if (!codeVal) draft.code = targetSub.code || targetSub.id;
        if (!nameVal) draft.name = targetSub.name;
        if (!deptVal) draft.department = targetSub.department;
      }
    }

    StorageService.saveDraftSubject(draft);
    this.showToast("💾 Đã lưu toàn bộ thông tin bộ đề vào Cloud & Local thành công!", "success", 3000);
    this.renderHeader();

    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  approveDraftFromReview(draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;

    // Lưu các trường input nếu có thay đổi trước khi duyệt
    const nameVal = document.getElementById("reviewDraftName")?.value.trim();
    const codeVal = document.getElementById("reviewDraftCode")?.value.trim();
    const deptVal = document.getElementById("reviewDraftDept")?.value.trim();
    const authorVal = document.getElementById("reviewDraftAuthor")?.value.trim();
    const descVal = document.getElementById("reviewDraftDesc")?.value.trim();
    const targetSubVal = document.getElementById("reviewDraftTargetSubject")?.value;
    const targetChapVal = document.getElementById("reviewDraftTargetChapter")?.value;

    if (nameVal) draft.name = nameVal;
    if (codeVal) draft.code = codeVal;
    if (deptVal) draft.department = deptVal;
    if (authorVal) draft.author = authorVal;
    if (descVal !== undefined) draft.description = descVal;
    if (targetSubVal) draft.targetSubjectId = targetSubVal;
    if (targetChapVal) {
      draft.targetChapterId = targetChapVal;
      if (draft.questions) {
        draft.questions.forEach(q => {
          if (!q.chapterId) q.chapterId = targetChapVal;
        });
      }
    }

    // Nếu liên kết với môn học có sẵn, bảo đảm mã và tên khớp hoàn toàn
    if (targetSubVal && targetSubVal !== "NEW") {
      const targetSub = StorageService.getSubjectById(targetSubVal);
      if (targetSub) {
        if (!codeVal) draft.code = targetSub.code || targetSub.id;
        if (!nameVal) draft.name = targetSub.name;
        if (!deptVal) draft.department = targetSub.department;
      }
    }

    StorageService.saveDraftSubject(draft);

    const res = StorageService.approveDraft(draftId);
    if (res) {
      this.showToast(`🎉 Đã duyệt bộ đề và gộp vào môn "${res.name}" (${res.code || res.id}) thành công! (+50 EXP)`, "success", 4500);
      this.renderHeader();
      this.adminSubjectTab = "official";
      this.navigateTo("manage");
    }
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
            <span class="badge badge-green">Phiên bản 2.2 (Mới Nhất)</span>
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

        <!-- Section 4: Hệ Thống Điểm Thưởng EXP & CP Sản Lượng -->
        <div class="guide-section">
          <h3>⚡ 4. Hệ Thống Điểm Thưởng: EXP Học Tập & CP Cống Hiến Sản Lượng</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
            DThu QuizMaster áp dụng hệ thống phân định điểm số kép chặt chẽ, minh bạch và tách bạch rõ ràng giữa <strong>Điểm Mùa Này</strong> và <strong>Điểm Tổng Các Mùa (All-Time)</strong>:
          </p>

          <div class="guide-step-item">
            <div class="guide-step-num" style="background:#fef3c7; color:#b45309; border-color:#fde68a;">⚡</div>
            <div>
              <strong>Điểm EXP Học Tập (Luyện Thi Thử):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Áp dụng cho các bài thi thử từ <strong>5 câu trở lên</strong> để đảm bảo tính công bằng (bài dưới 5 câu nhận +1 EXP khuyến khích). Thang điểm thưởng:
              </p>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li>Đạt từ <strong>9.0 - 10.0 điểm</strong>: Thưởng <strong>+15 EXP</strong> (Xuất sắc)</li>
                <li>Đạt từ <strong>8.0 - 8.9 điểm</strong>: Thưởng <strong>+10 EXP</strong> (Giỏi)</li>
                <li>Đạt từ <strong>6.5 - 7.9 điểm</strong>: Thưởng <strong>+6 EXP</strong> (Khá)</li>
                <li>Đạt từ <strong>5.0 - 6.4 điểm</strong>: Thưởng <strong>+3 EXP</strong> (Đạt yêu cầu)</li>
              </ul>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num" style="background:#dcfce7; color:#15803d; border-color:#86efac;">🌟</div>
            <div>
              <strong>Điểm Cống Hiến (Contribution Points - CP) Theo Sản Lượng Thực Tế:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Điểm CP không tính theo số lần bấm gửi đề đơn thuần mà tính lũy kế theo <strong>khối lượng kiến thức thực tế</strong> được Ban Quản Trị phê duyệt, với cơ chế <em>bảo lưu số dư cộng dồn</em>:
              </p>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li><strong>Cứ mỗi 50 câu trắc nghiệm được duyệt</strong>: Thưởng <strong>+5 CP</strong> (Ví dụ: đề 99 câu được cộng +5 CP và giữ lại 49 câu dư để cộng dồn cho đề tiếp theo).</li>
                <li><strong>Cứ mỗi 5.000 ký tự tài liệu học tập được duyệt</strong>: Thưởng <strong>+5 CP</strong> (Cộng dồn ký tự tài liệu).</li>
                <li><strong>Kiểm duyệt & thẩm định 50 câu trắc nghiệm</strong>: Thưởng <strong>+3 CP</strong> dành cho Ban Biên Tập.</li>
              </ul>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num" style="background:#e0f2fe; color:#0369a1; border-color:#7dd3fc;">🗓️</div>
            <div>
              <strong>Điểm Mùa Này vs Điểm Tổng Các Mùa (All-Time):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                - <strong>Điểm Mùa Này (Season Points):</strong> Phản ánh thành tích thi đua trong học kỳ / mùa giải hiện tại. Khi khởi động mùa mới, điểm này có thể được đặt lại về 0 để mở chặng đua mới.<br>
                - <strong>Điểm Tổng Các Mùa (All-Time):</strong> Điểm tích lũy trọn đời không bao giờ bị mất, ghi nhận toàn bộ thâm niên và đóng góp của sinh viên từ ngày đầu tham gia.
              </p>
            </div>
          </div>
        </div>

        <!-- Section 5: Bảng Xếp Hạng & Vị Trí Của Tôi -->
        <div class="guide-section">
          <h3>🏆 5. Tra Cứu Bảng Xếp Hạng & "Vị Trí Của Tôi"</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">A</div>
            <div>
              <strong>Chuyển đổi Top EXP / CP & Phạm vi Mùa này / All-Time:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Tại trang Bảng Xếp Hạng, bạn có thể dễ dàng chuyển đổi qua lại giữa <strong>⚡ Top Học Tập (EXP)</strong> và <strong>🌟 Top Cống Hiến (CP)</strong>, cũng như xem theo <strong>🗓️ Bảng Mùa Này</strong> hoặc <strong>👑 Bảng Tổng Các Mùa (All-Time)</strong>.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">B</div>
            <div>
              <strong>Lọc theo Khoa / Viện & Tìm kiếm:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Sử dụng thanh công cụ lọc để xem vị trí xếp hạng nội bộ trong từng Khoa/Viện (Sư phạm KHTN, Kỹ thuật - Công nghệ, Ngoại ngữ, v.v.) hoặc gõ MSSV để tìm kiếm nhanh bạn cùng lớp.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">C</div>
            <div>
              <strong>Tính năng "📍 Vị trí của tôi":</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Bấm nút <strong>"📍 Vị trí của tôi"</strong> ở góc phải bộ lọc để màn hình tự động cuộn mượt mà và làm nổi bật hàng thông tin tài khoản của bạn trên bảng tổng sắp toàn trường.
              </p>
            </div>
          </div>
        </div>

        <!-- Section 6: Dành Cho Ban Biên Tập & Admin -->
        <div class="guide-section">
          <h3>🛡️ 6. Cẩm Nang Dành Cho Ban Biên Tập & Quản Trị Viên (Admin)</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">1</div>
            <div>
              <strong>Quy trình kiểm duyệt bộ đề cộng đồng:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Khi sinh viên gửi đề đóng góp, Ban Biên Tập vào mục <strong>"⚙️ Quản lý đề" ➔ Tab "Chờ phê duyệt"</strong> để xem trước và hiệu chỉnh. Khi duyệt, hệ thống sẽ tự động gộp các chương câu hỏi vào đúng Môn học đích sẵn có mà không làm phân mảnh hay tạo mã học phần rác.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">2</div>
            <div>
              <strong>Bộ Tính Năng Quản Trị Cao Cấp & Cơ Chế Thông Báo Tự Động 100%:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Tại <strong>"👑 Quản Trị BXH & Mùa Giải"</strong>, Quản trị viên được trang bị bộ công cụ kiểm toán toàn diện (mỗi thao tác đều bắt buộc nhập lý do và tự động gửi thông báo đến người dùng):
              </p>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li><strong>Lọc trạng thái nhóm</strong>: Xem nhanh thành viên <code>Đang trong nhóm</code>, <code>Đã bị Kick</code>, <code>Chờ duyệt</code>.</li>
                <li><strong>👢 Kick / Khôi phục thành viên</strong>: Loại thành viên vi phạm khỏi nhóm (ẩn BXH, tạm ngưng thi) và khôi phục khi giải trình hợp lệ.</li>
                <li><strong>🔄 Reset điểm cá nhân</strong>: Đặt lại điểm EXP hoặc CP về 0 (chọn phạm vi Mùa này hoặc All-Time) kèm lý do giải trình.</li>
                <li><strong>⚡ Điều chỉnh điểm linh hoạt</strong>: Thưởng / phạt điểm trực tiếp với tùy chọn áp dụng cho Mùa này hoặc Toàn thời gian.</li>
                <li><strong>🚀 Khởi động mùa mới</strong>: Tự động đóng băng kết quả mùa cũ vào Kho Lưu Trữ (Archives), tùy chọn reset điểm Mùa này về 0 và phát thông báo chúc mừng toàn trường.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Section 7: Quản lý cài đặt & Reset cảnh báo -->
        <div class="guide-section">
          <h3>⚙️ 7. Tùy chọn hệ thống & Khôi phục cảnh báo</h3>
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
      this.showToast("📋 Đã sao chép bộ câu hỏi mẫu nâng cao vào Clipboard!", "success", 3000);
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
      this.showToast("📋 Đã sao chép mẫu cấu trúc đề thi vào Clipboard!", "success", 3000);
    });
  },

  resetSuppressedWarningsAction() {
    StorageService.resetSuppressedWarnings();
    this.showToast("✅ Đã khôi phục lại toàn bộ hộp thoại cảnh báo thành công!", "success", 3000);
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
      this.showToast("⚠️ Vui lòng nhập đầy đủ Tên môn học và Mã môn học!", "warning");
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
    this.showToast(`🎉 Đã tạo môn học "${name}" thành công!`, "success", 3000);
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
          App.showToast(msg, success ? "success" : "danger", 4000);
          if (success) App.navigateTo("home");
        });
      }
    };
    input.click();
  },

  openModal() {
    const modal = document.getElementById("globalModal");
    if (modal) {
      modal.classList.add("active");
    }
  },

  closeModal() {
    const modal = document.getElementById("globalModal");
    if (modal) {
      modal.classList.remove("active");
    }
  },

  bindGlobalEvents() {
    // Đóng modal khi bấm vào nền xám
    document.getElementById("globalModal")?.addEventListener("click", (e) => {
      if (e.target.id === "globalModal") this.closeModal();
    });

    // Đóng User Drawer khi bấm vào overlay
    document.getElementById("userDrawerOverlay")?.addEventListener("click", () => {
      this.closeUserDrawer();
    });

    // Đóng modal và drawer khi bấm phím ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        this.closeUserDrawer();
      }
    });

    // Xử lý nút Quay lại (Back / Forward) của Trình duyệt và Cử chỉ vuốt trên Điện thoại
    window.addEventListener("popstate", (e) => {
      // 1. NẾU ĐANG LÀM BÀI THI / ÔN TẬP DỞ DANG -> TUYỆT ĐỐI KHÔNG TỰ THOÁT MẤT BÀI
      if (this.currentView === "quiz" && this.activeSession && !this.activeSession.isSubmitted) {
        // Đẩy lại state #quiz để giữ nguyên bài làm
        if (window.history && window.history.pushState) {
          window.history.pushState({ view: "quiz", data: {} }, "", "#quiz");
        }
        // Hiện hộp thoại xác nhận rời phòng
        this.confirmExitQuiz();
        return;
      }

      // 2. Đóng các modal/drawer đang mở nếu có
      this.closeModal();
      this.closeUserDrawer();

      // 3. Điều hướng về trang trước đó
      if (e.state && e.state.view) {
        this.navigateTo(e.state.view, e.state.data || {}, false);
      } else {
        const route = this.parseHashRoute();
        this.navigateTo(route.view, route.data || {}, false);
      }
    });

    // Cảnh báo khi người dùng đóng tab / tải lại trang (F5) lúc đang làm bài thi chưa nộp
    window.addEventListener("beforeunload", (e) => {
      const settings = StorageService.getAppSettings();
      const isWarnOnLeave = (settings.warnOnLeaveQuiz !== false);
      if (isWarnOnLeave && App.currentView === "quiz" && App.activeSession && !App.activeSession.isSubmitted) {
        e.preventDefault();
        e.returnValue = "Bạn có bài thi/ôn tập đang làm dở chưa nộp. Bạn có chắc chắn muốn rời khỏi trang không?";
        return e.returnValue;
      }
    });

    // Tự động đồng bộ Supabase khi chuyển tab / mở lại màn hình điện thoại (Real-time auto sync)
    window.addEventListener("focus", () => {
      if (typeof StorageService !== "undefined" && typeof StorageService.syncWithCloud === "function") {
        StorageService.syncWithCloud().then(() => {
          App.renderHeader();
          if (App.currentView === "users-management") {
            App.renderUsersManagementView(document.getElementById("mainContent"));
          }
        }).catch(() => {});
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        if (typeof StorageService !== "undefined" && typeof StorageService.syncWithCloud === "function") {
          StorageService.syncWithCloud().then(() => {
            App.renderHeader();
            if (App.currentView === "users-management") {
              App.renderUsersManagementView(document.getElementById("mainContent"));
            }
          }).catch(() => {});
        }
      }
    });
  },

  // ═════════════════════════════════════════════════════════════════════════
  // NÚT HƯỚNG DẪN NỔI KÉO THẢ THÔNG MINH & TỰ ĐỘNG HÚT CẠNH (SNAP-TO-EDGE)
  // ═════════════════════════════════════════════════════════════════════════
  initDraggableGuideButton() {
    const btn = document.getElementById("floatingGuideBtn");
    if (!btn) return;

    // Đọc vị trí đã lưu từ LocalStorage nếu có
    let savedPos = null;
    try {
      const stored = localStorage.getItem("dthu_guide_btn_pos");
      if (stored) savedPos = JSON.parse(stored);
    } catch (e) {}

    const clampAndSetPosition = (left, top, animate = false) => {
      const btnRect = btn.getBoundingClientRect();
      const btnW = btnRect.width || 120;
      const btnH = btnRect.height || 40;

      const minLeft = 14;
      const maxLeft = Math.max(minLeft, window.innerWidth - btnW - 14);
      const minTop = 64; // Dưới Header
      const maxTop = Math.max(minTop, window.innerHeight - btnH - 24); // Trên đáy

      let clampedLeft = Math.max(minLeft, Math.min(left, maxLeft));
      let clampedTop = Math.max(minTop, Math.min(top, maxTop));

      if (animate) {
        btn.style.transition = "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.25s ease";
      } else {
        btn.style.transition = "none";
      }

      btn.style.left = `${clampedLeft}px`;
      btn.style.top = `${clampedTop}px`;
      btn.style.right = "auto";
      btn.style.bottom = "auto";

      return { left: clampedLeft, top: clampedTop };
    };

    // Khởi tạo vị trí ban đầu
    const initBtnPos = () => {
      const btnW = btn.offsetWidth || 120;
      const btnH = btn.offsetHeight || 40;
      if (savedPos && typeof savedPos.left === "number" && typeof savedPos.top === "number") {
        clampAndSetPosition(savedPos.left, savedPos.top, false);
      } else {
        // Mặc định: Góc dưới bên phải
        const defaultLeft = window.innerWidth - btnW - 20;
        const defaultTop = window.innerHeight - btnH - 30;
        clampAndSetPosition(defaultLeft, defaultTop, false);
      }
    };

    // Chờ một nhịp nhỏ để DOM render kích thước thật của button
    setTimeout(initBtnPos, 50);

    // Trạng thái kéo thả
    let isPointerDown = false;
    let isDragging = false;
    let startPointerX = 0;
    let startPointerY = 0;
    let startBtnLeft = 0;
    let startBtnTop = 0;

    const onPointerStart = (clientX, clientY) => {
      const rect = btn.getBoundingClientRect();
      startPointerX = clientX;
      startPointerY = clientY;
      startBtnLeft = rect.left;
      startBtnTop = rect.top;
      isPointerDown = true;
      isDragging = false;
    };

    const onPointerMove = (clientX, clientY, e) => {
      if (!isPointerDown) return;

      const dx = clientX - startPointerX;
      const dy = clientY - startPointerY;

      if (!isDragging && Math.hypot(dx, dy) > 6) {
        isDragging = true;
        btn.classList.add("is-dragging");
      }

      if (isDragging) {
        if (e && e.cancelable) e.preventDefault();

        const btnRect = btn.getBoundingClientRect();
        const minLeft = 10;
        const maxLeft = Math.max(minLeft, window.innerWidth - btnRect.width - 10);
        const minTop = 60;
        const maxTop = Math.max(minTop, window.innerHeight - btnRect.height - 18);

        const currentLeft = Math.max(minLeft, Math.min(startBtnLeft + dx, maxLeft));
        const currentTop = Math.max(minTop, Math.min(startBtnTop + dy, maxTop));

        btn.style.left = `${currentLeft}px`;
        btn.style.top = `${currentTop}px`;
        btn.style.right = "auto";
        btn.style.bottom = "auto";
      }
    };

    const onPointerEnd = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      btn.classList.remove("is-dragging");

      if (!isDragging) {
        // Thao tác Click -> Điều hướng đến màn hình Hướng dẫn
        App.navigateTo("guide");
        return;
      }

      // Thao tác Kéo thả xong -> Kích hoạt Hút Sát Cạnh Gần Nhất (Snap-to-Edge Magnetism)
      const rect = btn.getBoundingClientRect();
      const btnW = rect.width || 120;
      const btnH = rect.height || 40;
      const centerX = rect.left + btnW / 2;

      // Khoảng cách tới cạnh trái vs cạnh phải
      let targetLeft = 16;
      if (centerX >= window.innerWidth / 2) {
        targetLeft = window.innerWidth - btnW - 16;
      }

      const minTop = 64;
      const maxTop = Math.max(minTop, window.innerHeight - btnH - 24);
      const targetTop = Math.max(minTop, Math.min(rect.top, maxTop));

      const finalPos = clampAndSetPosition(targetLeft, targetTop, true);

      // Lưu lại vị trí để khi F5 / mở lại web vẫn ở đúng vị trí
      try {
        localStorage.setItem("dthu_guide_btn_pos", JSON.stringify(finalPos));
      } catch (e) {}
    };

    // Sự kiện Chuột (Mouse)
    btn.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return; // Chỉ nhận chuột trái
      onPointerStart(e.clientX, e.clientY);

      const onMouseMove = (moveEv) => onPointerMove(moveEv.clientX, moveEv.clientY, moveEv);
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        onPointerEnd();
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });

    // Sự kiện Cảm Ứng Điện Thoại (Touch)
    btn.addEventListener("touchstart", (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      onPointerStart(t.clientX, t.clientY);
    }, { passive: true });

    btn.addEventListener("touchmove", (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      onPointerMove(t.clientX, t.clientY, e);
    }, { passive: false });

    btn.addEventListener("touchend", () => {
      onPointerEnd();
    }, { passive: true });

    btn.addEventListener("touchcancel", () => {
      onPointerEnd();
    }, { passive: true });

    // Tự động canh chỉnh khi Resize màn hình hoặc xoay ngang/dọc điện thoại
    window.addEventListener("resize", () => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + (rect.width || 120) / 2;
      let targetLeft = 16;
      if (centerX >= window.innerWidth / 2) {
        targetLeft = window.innerWidth - (rect.width || 120) - 16;
      }
      clampAndSetPosition(targetLeft, rect.top, false);
    });
  }
};

// Khởi chạy ứng dụng an toàn cho mọi trình duyệt
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => App.init());
} else {
  App.init();
}
