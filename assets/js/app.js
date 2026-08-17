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
      this.navigateTo("home");
      this.bindGlobalEvents();

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
    const isLogged = StorageService.isLoggedIn();
    const profile = StorageService.getUserProfile();

    let roleBadge = `<span class="user-role-badge" style="font-size: 10px; padding: 1px 6px; background:#f1f5f9; color:#64748b;">Khách</span>`;
    if (isLogged) {
      if (profile.role === "admin") roleBadge = `<span class="user-role-badge admin" style="font-size: 10px; padding: 1px 6px;">👑 Admin</span>`;
      else if (profile.role === "editor") roleBadge = `<span class="user-role-badge editor" style="font-size: 10px; padding: 1px 6px; background:#eff6ff; color:#1e40af;">🛡️ Editor</span>`;
      else roleBadge = `<span class="user-role-badge student" style="font-size: 10px; padding: 1px 6px;">👨‍🎓 SV</span>`;
    }

    headerEl.innerHTML = `
      <div class="header-brand" onclick="App.navigateTo('home')">
        <div class="brand-icon">📚</div>
        <div class="brand-title-group">
          <h1>DThu QuizMaster</h1>
          <div class="brand-author">Bùi Văn Khang · CNSH DThu</div>
        </div>
      </div>

      <nav class="app-nav">
        <button class="nav-link ${this.currentView === 'home' ? 'active' : ''}" id="navHome" onclick="App.navigateTo('home')">🏠 Trang chủ</button>
        <button class="nav-link ${this.currentView === 'guide' ? 'active' : ''}" id="navGuide" onclick="App.navigateTo('guide')">💡 Hướng dẫn</button>
      </nav>

      <!-- Khối Người Dùng (Bấm vào để mở Thanh trượt bên phải) -->
      <div class="header-user-widget" onclick="App.openUserDrawer('main')" title="${isLogged ? 'Xem menu cá nhân & tiện ích' : 'Nhấp để đăng nhập'}">
        <div style="font-size: 20px;">${isLogged ? (profile.avatar || '👨‍🎓') : '👤'}</div>
        <div style="display: flex; flex-direction: column; text-align: left;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-primary); line-height: 1.2;">
            ${isLogged ? profile.fullName : 'Khách (Chưa đăng nhập)'}
          </span>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
            ${isLogged ? `<span class="user-exp-chip" style="font-size: 11.5px;">⚡ ${profile.totalExp} EXP</span>` : ''}
            ${roleBadge}
          </div>
        </div>
        <div style="font-size: 12px; color: var(--text-tertiary); margin-left: 2px;">▸</div>
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
    const mistakes = StorageService.getMistakes();
    const drafts = StorageService.getDraftSubjects();
    const history = StorageService.getHistory();
    const settings = StorageService.getAppSettings();

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
                  <div style="display: flex; gap: 10px; margin-top: 8px; font-size: 12px;">
                    <span style="color: #b45309; font-weight: 800;">⚡ ${profile.totalExp} EXP</span>
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
                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('leaderboard');">
                    <span class="drawer-icon">🏆</span>
                    <span class="drawer-label">Bảng Xếp Hạng</span>
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

                  <button class="drawer-nav-btn" onclick="App.closeUserDrawer(); App.navigateTo('mistakes');">
                    <span class="drawer-icon">🎯</span>
                    <span class="drawer-label">Ngân Hàng Câu Sai</span>
                    ${mistakes.length > 0 ? `<span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:700;">${mistakes.length}</span>` : `<span class="drawer-arrow">➔</span>`}
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

        bodyHtml = `
          <div class="drawer-slide-content">
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
                <button class="btn btn-sm" style="color: var(--danger); text-align: left;" onclick="App.clearMistakesData()">
                  🗑️ Xóa danh sách câu làm sai (${mistakes.length} câu)
                </button>
                <button class="btn btn-sm" style="color: var(--danger); text-align: left;" onclick="App.clearHistoryData()">
                  🗑️ Xóa lịch sử làm bài thi (${history.length} bài)
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

  // Router Điều hướng màn hình
  navigateTo(view, data = {}) {
    this.currentView = view;
    this.updateActiveNav(view);

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
      case "leaderboard":
        this.renderLeaderboardView(mainContainer);
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

        <!-- Khối Giới Thiệu Tác Giả & Trung Tâm Liên Hệ Hỗ Trợ 24/7 -->
        <section class="home-creator-section">
          <div class="creator-card-container">
            <div class="creator-header">
              <span class="creator-pill-tag">👨‍💻 Tác Giả & Ban Phát Triển</span>
              <h3 class="creator-title">Đội Ngũ Xây Dựng & Hỗ Trợ Học Tập DThu</h3>
              <p class="creator-subtitle">Hệ thống DThu QuizMaster được xây dựng và phát triển phi lợi nhuận nhằm hỗ trợ cộng đồng sinh viên Trường Đại học Đồng Tháp ôn thi trắc nghiệm hiệu quả.</p>
            </div>

            <div class="creator-content-grid">
              <!-- Thẻ Tác Giả -->
              <div class="creator-profile-card">
                <div>
                  <div class="creator-profile-header">
                    <div class="creator-avatar">👨‍🎓</div>
                    <div class="creator-info">
                      <div class="creator-name-row">
                        <h4>Bùi Văn Khang</h4>
                        <span class="creator-verified-badge">✓ Trưởng Ban Phát Triển</span>
                      </div>
                      <div class="creator-role-text">Sinh viên Lớp: <strong>ĐHCNSH24A</strong> · MSSV: <strong>0024418475</strong></div>
                      <div class="creator-dept-text">🏛️ Khoa Kỹ thuật - Công nghệ · Trường Đại học Đồng Tháp</div>
                    </div>
                  </div>

                  <p class="creator-bio">
                    "Mong muốn mang lại một công cụ ôn thi trắc nghiệm trực quan, bám sát ngân hàng đề cương giúp các bạn sinh viên DThu dễ dàng củng cố kiến thức và đạt kết quả cao nhất trong các kỳ thi học phần."
                  </p>
                </div>

                <div class="creator-social-pills">
                  <a href="https://www.youtube.com/@Shina18475" target="_blank" rel="noopener noreferrer" class="social-pill yt">
                    <span>▶️ YouTube @Shina18475</span>
                  </a>
                  <a href="https://www.youtube.com/@Shina_VN" target="_blank" rel="noopener noreferrer" class="social-pill yt">
                    <span>▶️ YouTube @Shina_VN</span>
                  </a>
                  <a href="https://www.linkedin.com/in/khang-trang-179557425/" target="_blank" rel="noopener noreferrer" class="social-pill in">
                    <span>💼 LinkedIn: Khang Trang</span>
                  </a>
                  <a href="https://github.com/VKhang-Bui/dthu-quizmaster" target="_blank" rel="noopener noreferrer" class="social-pill gh">
                    <span>⭐ GitHub Repository</span>
                  </a>
                </div>
              </div>

              <!-- Thẻ Kênh Liên Hệ CSKH 24/7 -->
              <div class="creator-contact-card">
                <div>
                  <h4 class="contact-card-title">📞 Kênh Liên Hệ & Tiếp Nhận Góp Ý</h4>
                  <p class="contact-card-desc">Gặp sự cố đăng nhập, quên mã PIN, phát hiện lỗi câu hỏi hoặc muốn đóng góp đề thi mới? Hãy liên hệ ngay:</p>

                  <div class="contact-methods-list">
                    <div class="contact-item">
                      <div class="contact-item-icon">📧</div>
                      <div class="contact-item-detail">
                        <div class="contact-item-label">Hộp Thư Tiếp Nhận:</div>
                        <a href="mailto:vkhg.bui@gmail.com" class="contact-link">vkhg.bui@gmail.com</a>
                        <span class="contact-divider">·</span>
                        <a href="mailto:giaosukhang621@gmail.com" class="contact-link">giaosukhang621@gmail.com</a>
                      </div>
                    </div>

                    <div class="contact-item">
                      <div class="contact-item-icon">📱</div>
                      <div class="contact-item-detail">
                        <div class="contact-item-label">Hotline & Zalo Kỹ Thuật (24/7):</div>
                        <a href="tel:0354616301" class="contact-link-highlight">0354 616 301</a>
                        <span class="contact-tag">Hỗ trợ nhanh</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button class="btn btn-primary btn-contact-action" onclick="App.openContactModal()">
                  <span>📩 Soạn Lời Nhắn / Gửi Góp Ý</span>
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
    `;

    // Cập nhật danh sách chương theo môn được chọn
    this.onParserSubjectChange();
  },

  saveParsedQuestionsToDraft() {
    if (!this.currentParsedQuestions || this.currentParsedQuestions.length === 0) {
      this.showToast("⚠️ Chưa có câu hỏi nào để lưu!", "warning");
      return;
    }

    const subId = document.getElementById("parserSubjectSelect")?.value;
    const sub = StorageService.getSubjectById(subId);
    const profile = StorageService.getUserProfile();

    const draftData = {
      code: sub ? sub.code : "GEN101",
      name: sub ? sub.name : "Bộ đề mới",
      department: sub ? sub.department : profile.department,
      author: profile.fullName + ` (MSSV: ${profile.studentId || 'DThu'})`,
      authorEmail: profile.email || "",
      description: `Bộ đề gồm ${this.currentParsedQuestions.length} câu hỏi, nhập qua Parser ngày ${new Date().toLocaleDateString('vi-VN')}.`,
      icon: sub ? (sub.icon || "📝") : "📝",
      questions: this.currentParsedQuestions
    };

    StorageService.addDraftSubject(draftData);
    StorageService.addExp(30, "Nhập bộ đề mới vào hệ thống (+30 EXP)");

    this.showToast(`🎉 Đã lưu ${this.currentParsedQuestions.length} câu hỏi vào danh sách Chờ Phê Duyệt!`, "success", 4000);
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
  // 4. MODAL CẤU HÌNH THI / ÔN TẬP
  // ═════════════════════════════════════════════════════════════════════════
  openQuizConfigModal(subjectId) {
    const subject = StorageService.getSubjectById(subjectId);
    if (!subject) return;
    this.activeSubject = subject;

    const isLogged = StorageService.isLoggedIn();
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `Làm bài: ${subject.name}`;

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">1. Chọn chế độ làm bài:</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${isLogged ? `
            <label style="border: 1.5px solid var(--border); padding: 14px; border-radius: var(--radius-sm); cursor: pointer; display: flex; gap: 10px; align-items: flex-start;">
              <input type="radio" name="quizMode" value="practice" checked style="margin-top: 4px;">
              <div>
                <strong style="display: block; font-size: 14px;">🟢 Chế độ Ôn tập</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Hiện đáp án & giải thích ngay sau mỗi câu chọn</span>
              </div>
            </label>
          ` : `
            <label style="border: 1.5px solid var(--border); padding: 14px; border-radius: var(--radius-sm); opacity: 0.6; cursor: not-allowed; display: flex; gap: 10px; align-items: flex-start; background: var(--surface-subtle);" title="Chế độ ôn tập yêu cầu đăng nhập">
              <input type="radio" name="quizMode" value="practice" disabled style="margin-top: 4px;">
              <div>
                <strong style="display: block; font-size: 14px; color: var(--text-secondary);">🟢 Chế độ Ôn tập <span class="badge" style="background:#fee2e2; color:#b91c1c; font-size:10px;">🔒 Cần đăng nhập</span></strong>
                <span style="font-size: 12px; color: var(--text-tertiary);">Đăng nhập để xem đáp án & giải thích ngay</span>
              </div>
            </label>
          `}
          <label style="border: 1.5px solid var(--border); padding: 14px; border-radius: var(--radius-sm); cursor: pointer; display: flex; gap: 10px; align-items: flex-start;">
            <input type="radio" name="quizMode" value="exam" ${!isLogged ? 'checked' : ''} style="margin-top: 4px;">
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
      this.showToast("⚠️ Không có câu hỏi nào trong phạm vi lựa chọn!", "warning");
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

          ${wrongDetails.length > 0 ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 14px 18px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <div style="text-align: left;">
                <strong style="color: #991b1b; font-size: 14px;">🎯 Bạn có ${wrongDetails.length} câu làm sai cần củng cố kiến thức:</strong>
                <div style="font-size: 12.5px; color: #b91c1c; margin-top: 2px;">Các câu hỏi này đã được tự động lưu vào Ngân hàng câu sai.</div>
              </div>
              <button class="btn btn-danger btn-sm" onclick="App.practiceCurrentMistakes()">
                🎯 Luyện lại ${wrongDetails.length} câu sai ngay ➔
              </button>
            </div>
          ` : ''}

          <div style="margin-top: 24px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.openQuizConfigModal('${result.subjectId}')">🔄 Thi lại môn này</button>
            <button class="btn" onclick="App.openUserDrawer()">👤 Menu Cá nhân & BXH</button>
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

  practiceCurrentMistakes() {
    if (!this.latestResultDetails || !this.latestResultDetails.details) return;
    const wrongQuestions = this.latestResultDetails.details
      .filter(d => !d.isCorrect && d.userAnswer !== undefined)
      .map(d => d.question);

    if (wrongQuestions.length === 0) {
      this.showToast("Không có câu làm sai nào trong bài thi này!", "info");
      return;
    }

    const sub = this.latestResultDetails.subject || {
      id: this.latestResultDetails.result.subjectId,
      name: this.latestResultDetails.result.subjectName
    };

    this.activeSubject = sub;
    this.activeSession = {
      subjectId: sub.id,
      subjectName: sub.name,
      mode: "practice",
      chapterId: "mistakes",
      timeLimitMinutes: 0,
      timeRemainingSeconds: 0,
      totalQuestions: wrongQuestions.length,
      questions: wrongQuestions,
      answers: {},
      startedAt: new Date().toISOString(),
      isSubmitted: false
    };

    this.currentPage = 0;
    this.navigateTo("quiz");
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
    if (!StorageService.isLoggedIn()) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="font-size: 52px; margin-bottom: 14px;">🎯</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Ngân Hàng Câu Sai (Mistake Vault)</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Vui lòng đăng nhập tài khoản sinh viên DThu để hệ thống tự động lưu vết và luyện tập lại các câu hỏi từng làm sai trong quá trình thi.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 22px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()">🔑 Đăng Nhập Ngay ➔</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
          </div>
        </div>
      `;
      return;
    }

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
  // 7. LEADERBOARD VIEW (BẢNG XẾP HẠNG)
  // ═════════════════════════════════════════════════════════════════════════
  renderLeaderboardView(container) {
    const leaderboard = StorageService.getLeaderboardData();
    const top1 = leaderboard[0];
    const top2 = leaderboard[1];
    const top3 = leaderboard[2];

    container.innerHTML = `
      <div class="view-leaderboard">
        <div style="margin-bottom: 28px; text-align: center;">
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary);">🏆 Bảng Xếp Hạng Sinh Viên DThu</h2>
          <p style="color: var(--text-secondary); margin-top: 4px;">Tuyên dương những sinh viên có thành tích học tập và điểm tích lũy (EXP) cao nhất toàn trường.</p>
        </div>

        <!-- Podium Top 3 -->
        <div class="podium-container">
          <!-- Rank 2 -->
          <div class="podium-card podium-rank-2">
            <div style="font-size: 13px; font-weight: 800; color: #64748b; margin-bottom: 6px;">🥈 HẠNG 2</div>
            <div class="podium-avatar">${top2 ? '👨‍🎓' : '👤'}</div>
            <div class="podium-name">${top2 ? top2.name : 'Đang cập nhật'}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">${top2 ? top2.department : ''}</div>
            <div class="podium-exp">⚡ ${top2 ? top2.exp : 0} EXP</div>
          </div>

          <!-- Rank 1 (Thủ khoa) -->
          <div class="podium-card podium-rank-1">
            <div style="font-size: 13px; font-weight: 800; color: #d97706; margin-bottom: 6px;">👑 THỦ KHOA (HẠNG 1)</div>
            <div class="podium-avatar">${top1 ? '🥇' : '👤'}</div>
            <div class="podium-name" style="font-size: 18px;">${top1 ? top1.name : 'Đang cập nhật'}</div>
            <div style="font-size: 12.5px; color: var(--text-secondary);">${top1 ? top1.department : ''}</div>
            <div class="podium-exp" style="font-size: 16px;">⚡ ${top1 ? top1.exp : 0} EXP</div>
          </div>

          <!-- Rank 3 -->
          <div class="podium-card podium-rank-3">
            <div style="font-size: 13px; font-weight: 800; color: #c2410c; margin-bottom: 6px;">🥉 HẠNG 3</div>
            <div class="podium-avatar">${top3 ? '👨‍🎓' : '👤'}</div>
            <div class="podium-name">${top3 ? top3.name : 'Đang cập nhật'}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">${top3 ? top3.department : ''}</div>
            <div class="podium-exp">⚡ ${top3 ? top3.exp : 0} EXP</div>
          </div>
        </div>

        <!-- Leaderboard Table -->
        <div class="leaderboard-table-card">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th style="width: 70px; text-align: center;">Hạng</th>
                <th>Sinh viên</th>
                <th>Khoa / Ngành</th>
                <th style="text-align: center;">Số bài thi</th>
                <th style="text-align: right;">Điểm EXP</th>
                <th style="width: 140px; text-align: center;">Huy hiệu</th>
              </tr>
            </thead>
            <tbody>
              ${leaderboard.map(item => `
                <tr class="${item.isCurrentUser ? 'current-user-row' : ''}">
                  <td style="text-align: center; font-weight: 800;">
                    ${item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : item.rank}
                  </td>
                  <td>
                    <strong>${item.name}</strong>
                  </td>
                  <td style="color: var(--text-secondary); font-size: 13px;">${item.department}</td>
                  <td style="text-align: center;">${item.quizzes}</td>
                  <td style="text-align: right; font-weight: 800; color: #b45309;">⚡ ${item.exp}</td>
                  <td style="text-align: center;">
                    <span class="badge badge-blue">${item.badge}</span>
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

    StorageService.addExp(20, "Đóng góp tài liệu học tập mới (+20 EXP)");
    this.closeModal();
    this.showToast(`🎉 Đã lưu tài liệu "${title}" thành công! (+20 EXP)`, "success", 3500);
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
      this.showToast(`🎉 Đã duyệt bộ đề "${res.name}" sang Ngân hàng Chính thức! (+50 EXP)`, "success", 4500);
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
              Quản lý danh sách sinh viên, phê duyệt hồ sơ đăng ký mới, cấp quyền biên tập viên và xử lý yêu cầu CSKH.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn" style="border-color: #10b981; color: #047857; font-weight: 700;" onclick="App.refreshUsersFromCloud()">🔄 Làm Mới Cloud</button>
            <button class="btn" style="border-color: #0284c7; color: #0284c7;" onclick="App.openAppsScriptConfigModal()">⚙️ Cấu Hình Google Apps Script</button>
            <button class="btn btn-primary" onclick="App.openCreateUserModal()">➕ Thêm Thành Viên</button>
            <button class="btn" onclick="App.openAccountSwitcherModal()">🔄 Đổi Tài Khoản</button>
          </div>
        </div>

        <!-- 4 Thẻ Thống Kê -->
        <div class="users-stat-grid">
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

        <!-- Admin Tab Bar -->
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
        </div>

        <!-- Nội dung theo Tab được chọn -->
        ${this.adminUserTab === 'active' ? `
          <!-- Thanh Tìm kiếm & Bộ lọc cho Active Users -->
          <div class="search-filter-bar" style="margin: 0;">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input type="text" id="userSearchInput" class="form-control" placeholder="Tìm theo tên, MSSV, email..." oninput="App.onSearchUsers()">
            </div>
            <select id="userRoleFilter" class="form-control" style="width: auto; min-width: 170px;" onchange="App.onSearchUsers()">
              <option value="all">Tất cả vai trò</option>
              <option value="admin">👑 Quản trị viên (Admin)</option>
              <option value="editor">🛡️ Ban Biên Tập (Editor)</option>
              <option value="student">👨‍🎓 Sinh viên</option>
            </select>
            <select id="userDeptFilter" class="form-control" style="width: auto; min-width: 200px;" onchange="App.onSearchUsers()">
              <option value="all">Tất cả khoa / ngành</option>
              ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
          </div>

          <!-- Bảng Danh Sách Thành Viên Hoạt Động -->
          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
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
                ${this.renderUsersTableRows(activeUsers)}
              </tbody>
            </table>
          </div>
        ` : this.adminUserTab === 'pending' ? `
          <!-- Bảng Danh Sách Chờ Phê Duyệt -->
          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
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
        ` : `
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
        `}
      </div>
    `;
  },

  switchAdminUserTab(tab) {
    this.adminUserTab = tab;
    this.renderUsersManagementView(document.getElementById("mainContent"));
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
          <td colspan="6" style="text-align: center; padding: 56px 20px; color: var(--text-secondary);">
            <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
            <strong style="font-size: 16px; color: var(--text-primary); display: block;">Không có hồ sơ đăng ký nào đang chờ duyệt!</strong>
            <span style="font-size: 13px;">Mọi sinh viên đăng ký mới đã được xử lý xong.</span>
          </td>
        </tr>
      `;
    }

    return pendingUsers.map(u => `
      <tr>
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
    `).join('');
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
          <td colspan="7" style="text-align: center; padding: 48px; color: var(--text-tertiary);">
            Không tìm thấy thành viên nào phù hợp.
          </td>
        </tr>
      `;
    }

    const currentProfile = StorageService.getUserProfile();

    return users.map(u => {
      const isCurrent = currentProfile && currentProfile.id === u.id;
      const perms = u.permissions || {};

      let roleBadge = `<span class="role-badge-student">👨‍🎓 Sinh Viên</span>`;
      if (u.role === "admin") {
        roleBadge = `<span class="role-badge-admin">👑 Admin</span>`;
      } else if (u.role === "editor") {
        roleBadge = `<span class="role-badge-editor">🛡️ Ban Biên Tập</span>`;
      }

      return `
        <tr>
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
            <div style="font-weight: 800; color: #b45309;">⚡ ${u.totalExp || 0} EXP</div>
            <div style="font-size: 11.5px; color: var(--text-tertiary);">${u.quizzesCompleted || 0} bài thi</div>
          </td>
          <td>
            <span class="${u.status === 'suspended' ? 'status-badge-suspended' : 'status-badge-active'}">
              ${u.status === 'suspended' ? '🚫 Đã khóa' : '✓ Hoạt động'}
            </span>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px;">
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

  onSearchUsers() {
    const query = document.getElementById("userSearchInput")?.value.toLowerCase().trim() || "";
    const role = document.getElementById("userRoleFilter")?.value || "all";
    const dept = document.getElementById("userDeptFilter")?.value || "all";

    const all = StorageService.getActiveUsers();
    const filtered = all.filter(u => {
      const matchQuery = (u.fullName && u.fullName.toLowerCase().includes(query)) || 
                         (u.studentId && u.studentId.toLowerCase().includes(query)) ||
                         (u.email && u.email.toLowerCase().includes(query));
      const matchRole = role === "all" || u.role === role;
      const matchDept = dept === "all" || u.department === dept;
      return matchQuery && matchRole && matchDept;
    });

    const tbody = document.getElementById("usersTableBody");
    if (tbody) tbody.innerHTML = this.renderUsersTableRows(filtered);
  },

  // Modal Tạo Thành Viên Mới
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
            <input type="password" id="newUsrPin" class="form-control" value="123456" maxlength="6">
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

    modal.classList.add("active");
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
            <input type="text" id="editUsrPin" class="form-control" value="${user.pinCode || '123456'}" maxlength="6">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Khoa / Chuyên ngành:</label>
            <input type="text" id="editUsrDept" class="form-control" value="${user.department || ''}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Vai trò (*):</label>
            <select id="editUsrRole" class="form-control">
              <option value="student" ${user.role === 'student' ? 'selected' : ''}>👨‍🎓 Sinh Viên</option>
              <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>🛡️ Ban Biên Tập (Editor)</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Quản Trị Viên (Admin)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Điểm EXP tích lũy:</label>
            <input type="number" id="editUsrExp" class="form-control" value="${user.totalExp || 0}">
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

    modal.classList.add("active");
  },

  saveEditedUser(userId) {
    const name = document.getElementById("editUsrName")?.value.trim();
    const id = document.getElementById("editUsrId")?.value.trim();
    const email = document.getElementById("editUsrEmail")?.value.trim();
    const pin = document.getElementById("editUsrPin")?.value.trim();
    const dept = document.getElementById("editUsrDept")?.value.trim();
    const role = document.getElementById("editUsrRole")?.value || "student";
    const exp = parseInt(document.getElementById("editUsrExp")?.value, 10) || 0;

    if (!name) {
      this.showToast("⚠️ Họ và tên không được để trống!", "warning");
      return;
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
      permissions: {
        canApproveDrafts: document.getElementById("editPermApproveDrafts")?.checked || false,
        canEditSubjects: document.getElementById("editPermEditSubjects")?.checked || false,
        canManageMaterials: document.getElementById("editPermManageMaterials")?.checked || false,
        canManageUsers: document.getElementById("editPermManageUsers")?.checked || false
      }
    });

    this.closeModal();
    this.renderHeader();
    this.showToast("✅ Đã cập nhật quyền hạn và thông tin người dùng thành công!", "success", 3000);
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  toggleUserStatusAction(userId) {
    const updated = StorageService.toggleUserStatus(userId);
    if (updated) {
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

  closeModal() {
    document.getElementById("globalModal")?.classList.remove("active");
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
  }
};

// Khởi chạy ứng dụng an toàn cho mọi trình duyệt
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => App.init());
} else {
  App.init();
}
