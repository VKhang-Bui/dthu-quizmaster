/**
 * SHINORA FLOATING STUDY DOCK (TRUNG TÂM TIỆN ÍCH HỌC TẬP NỔI ĐA NĂNG)
 * Phiên bản: v3.1.4
 * Kiến trúc giao diện: Cửa sổ kép Master-Detail (Cửa sổ gốc menu bên trái + Cửa sổ con trượt mở sang bên phải)
 */

const StudyDockView = {
  isOpen: false,
  activeDetailId: "pomodoro", // 'pomodoro' | 'calculator' | 'notes' | 'sounds' | 'keysound' | 'experience' | 'fortune' | 'cheatsheet'
  isDetailOpen: true, // Mặc định mở cửa sổ con song song trên Desktop
  isZenMode: false,
  isZenFocusRoomOpen: false,
  isWarmFilter: false,
  warmIntensity: 0.25,
  isOledMode: false,
  isReadingComfort: false,
  isCandleMode: false,
  isDndMode: false,
  isIdle: false,
  idleTimer: null,
  countdownInterval: null,

  // Trạng thái Pomodoro
  pomodoro: {
    mode: "work", // 'work' | 'shortBreak' | 'longBreak'
    preset: "classic", // 'quick' | 'classic' | 'deep' | 'ultradian'
    durations: { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
    timeLeft: 25 * 60,
    isRunning: false,
    timerId: null,
    currentRound: 1, // 1 -> 4
    maxRounds: 4,
    autoLoop: true, // Tự động lặp liên hoàn 4 hiệp
    smartMusicSync: true, // Tự động bật/tắt nhạc khi học/nghỉ
    currentGoal: "", // Mục tiêu hiệp học
    distractionCount: 0, // Số lần phân tâm
    todayFocusedSeconds: 0, // Tổng giây tập trung hôm nay
    totalSessionsCompleted: 0,
    activeTipIndex: 0
  },

  microBreakTips: [
    { title: "👁️ Quy tắc 20-20-20 bảo vệ mắt", desc: "Hãy phóng tầm mắt nhìn một vật ở xa khoảng 6 mét trong vòng 20 giây để thư giãn cơ mắt." },
    { title: "🧘 Bài tập thả lỏng cổ & vai gáy", desc: "Xoay nhẹ đầu theo vòng tròn từ trái qua phải 5 lần, sau đó nghiêng đầu sang hai bên để giãn cơ." },
    { title: "💧 Nạp năng lượng với một ngụm nước", desc: "Đứng dậy, uống một ly nước mát và hít thở sâu 3 nhịp để tăng tuần hoàn máu lên não bộ." },
    { title: "🫁 Kỹ thuật hít thở sâu 4-7-8", desc: "Hít vào bằng mũi trong 4 giây, giữ hơi thở 7 giây, thở chậm ra bằng miệng trong 8 giây." }
  ],

  // Trạng thái Máy tính
  calc: {
    display: "0",
    prevValue: null,
    operator: null,
    waitingForOperand: false
  },

  // Bộ ngân hàng 20 Quẻ may mắn & Mẹo thi sinh viên DTHU
  fortunesList: [
    { text: "🌟 Vận đỏ bao la! Câu nào phân vân hôm nay hãy tin vào linh tính đáp án C.", tag: "May Mắn 99%" },
    { text: "🔥 Chăm chỉ hôm nay, ngày mai đỡ tốn tiền học lại. Cố lên nhé bạn ơi!", tag: "Động Lực" },
    { text: "🎯 Hôm nay thần thi cử phù hộ: Tỉ lệ làm đúng trúng tủ tăng vọt 30%!", tag: "Trúng Tủ" },
    { text: "☕ Đã học 45 phút chưa? Hãy uống một ngụm nước và vươn vai thư giãn mắt nhé.", tag: "Sức Khỏe" },
    { text: "📚 Kiến thức không tự sinh ra và mất đi, nó chỉ chuyển từ đề thi vào điểm A+!", tag: "Chân Lý" },
    { text: "🧠 Bình tĩnh đọc kỹ từng chữ đề bài, bẫy nằm ở mấy từ 'NGOẠI TRỪ' và 'KHÔNG ĐÚNG'.", tag: "Mẹo Thi" },
    { text: "🌈 Bạn đang tiến gần hơn tới tấm bằng cử nhân xuất sắc ĐH Đồng Tháp rồi đấy!", tag: "Tự Hào DTHU" },
    { text: "💡 Mỗi câu sai hôm nay là một câu đúng tuyệt đối trong phòng thi ngày mai.", tag: "Tư Duy" },
    { text: "🍀 Gió đưa cành trúc la đà, người chăm luyện quiz chắc là điểm cao!", tag: "Thơ Vui" },
    { text: "💪 Làm hết sức, thi hết mình, không phân tâm, vinh quang đang chờ phía trước!", tag: "Quyết Thắng" },
    { text: "📖 Học một biết mười, cày đề không lười, điểm mười trong tay!", tag: "Thần Tài" },
    { text: "🛡️ Tự tin vào những gì bạn đã ôn luyện. Tâm thế vững vàng là 50% chiến thắng.", tag: "Bản Lĩnh" },
    { text: "✨ Hôm nay trực giác của bạn cực kỳ nhạy bén, hãy tin vào bản thân!", tag: "Trực Giác" },
    { text: "💎 Áp lực tạo nên kim cương, những đêm thức ôn đề sẽ đổi lấy nụ cười ngày nhận bảng điểm!", tag: "Kiên Trì" }
  ],

  init() {
    if (typeof StorageService !== "undefined" && !StorageService.isLoggedIn()) {
      const existingTrigger = document.getElementById("studyDockFloatingTrigger");
      const existingContainer = document.getElementById("studyDockContainer");
      if (existingTrigger) existingTrigger.style.display = "none";
      if (existingContainer) existingContainer.style.display = "none";
      return;
    }
    this.renderContainer();
    this.bindEvents();
    this.initDraggableDock();
    this.restoreSavedStates();
    this.initDistractionWatcher();
    this.initKeyboardWatcher();
    this.resetIdleTimer();
    this.startMidnightCountdownWatcher();
  },

  initKeyboardWatcher() {
    window.addEventListener("keydown", (e) => {
      // Escape để thoát Zen Focus Room nếu đang mở
      if (e.key === "Escape" && this.isZenFocusRoomOpen) {
        this.closeZenFocusRoom();
        return;
      }

      // Hỗ trợ gõ trực tiếp bàn phím vật lý khi đang mở tab Máy Tính Bỏ Túi
      if (this.isOpen && this.activeDetailId === "calculator") {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
          return;
        }

        if (e.key >= "0" && e.key <= "9") {
          e.preventDefault();
          this.handleCalcNum(e.key);
        } else if (e.key === "." || e.key === ",") {
          e.preventDefault();
          this.handleCalcNum(".");
        } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
          e.preventDefault();
          this.handleCalcOp(e.key);
        } else if (e.key === "Enter" || e.key === "=") {
          e.preventDefault();
          this.handleCalcEquals();
        } else if (e.key === "Backspace") {
          e.preventDefault();
          this.handleCalcAction("delete");
        } else if (e.key === "Escape" || e.key.toLowerCase() === "c") {
          e.preventDefault();
          this.handleCalcAction("clear");
        }
      }
    });
  },

  initDistractionWatcher() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.pomodoro.isRunning && this.pomodoro.mode === "work") {
        this.pomodoro.distractionCount++;
        const badge = document.getElementById("pomoDistractionBadge");
        if (badge) {
          badge.style.display = "inline-flex";
          badge.innerHTML = `🛡️ Phân tâm: <strong>${this.pomodoro.distractionCount}</strong> lần`;
        }
      }
    });
  },

  restoreSavedStates() {
    try {
      const savedCount = localStorage.getItem("dthu_dock_pomodoro_count");
      if (savedCount) {
        this.pomodoro.totalSessionsCompleted = parseInt(savedCount, 10) || 0;
      }
      const savedTodaySecs = localStorage.getItem("dthu_dock_pomodoro_today_secs");
      if (savedTodaySecs) {
        this.pomodoro.todayFocusedSeconds = parseInt(savedTodaySecs, 10) || 0;
      }
      const savedAutoLoop = localStorage.getItem("dthu_dock_pomodoro_autoloop");
      if (savedAutoLoop !== null) {
        this.pomodoro.autoLoop = (savedAutoLoop === "true");
      }
      const savedMusicSync = localStorage.getItem("dthu_dock_pomodoro_musicsync");
      if (savedMusicSync !== null) {
        this.pomodoro.smartMusicSync = (savedMusicSync === "true");
      }
      const savedPreset = localStorage.getItem("dthu_dock_pomodoro_preset");
      if (savedPreset) {
        this.setPomodoroPreset(savedPreset, false);
      }
      const savedWarm = localStorage.getItem("dthu_dock_warm_filter");
      if (savedWarm === "true") {
        this.toggleWarmFilter(true);
      }
    } catch (e) {}
  },

  getVietnamTodayStr() {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      return formatter.format(new Date());
    } catch (e) {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
  },

  getTimeUntilVietnamMidnight() {
    try {
      const now = new Date();
      const vnTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
      const vnNow = new Date(vnTimeString);
      const vnMidnight = new Date(vnNow);
      vnMidnight.setHours(24, 0, 0, 0);

      const diffSecs = Math.floor(Math.max(0, vnMidnight - vnNow) / 1000);
      const hours = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;

      return {
        formatted: `${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`,
        short: `${hours} giờ ${mins} phút`,
        totalSecs: diffSecs
      };
    } catch (e) {
      return { formatted: "00h 00m 00s", short: "sắp mở", totalSecs: 0 };
    }
  },

  startMidnightCountdownWatcher() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      const cdEl = document.getElementById("fortuneCountdownText");
      if (cdEl) {
        const cd = this.getTimeUntilVietnamMidnight();
        cdEl.innerText = cd.formatted;
      }
    }, 1000);
  },

  isUserAllowed() {
    return Boolean(typeof StorageService !== "undefined" && typeof StorageService.isLoggedIn === "function" && StorageService.isLoggedIn());
  },

  renderContainer() {
    let container = document.getElementById("studyDockContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "studyDockContainer";
      container.className = "study-dock-container";
      document.body.appendChild(container);
    }

    if (!document.getElementById("studyWarmFilterOverlay")) {
      const warmOverlay = document.createElement("div");
      warmOverlay.id = "studyWarmFilterOverlay";
      warmOverlay.className = "study-warm-filter-overlay";
      document.body.appendChild(warmOverlay);
    }

    const isAllowed = this.isUserAllowed();

    container.innerHTML = `
      <!-- Nút Nổi Viên Thuốc Đa Năng -->
      <div class="floating-dock-pill" id="floatingGuideBtn" role="button" aria-label="Trung tâm tiện ích học tập" title="💡 Nhấp để mở Tiện ích · Nhấn giữ để kéo thả" style="${isAllowed ? 'display:flex;' : 'display:none;'}">
        <span class="dock-pill-icon" id="dockPillIcon" style="display:flex; align-items:center;">${Icons.get('sparkles', 18)}</span>
        <span class="dock-pill-label" id="dockPillLabel">Tiện ích</span>
        <span class="dock-pill-badge" id="dockPillBadge" style="display: none;"></span>
        <span class="dock-pill-handle" title="Kéo thả vị trí">⠿</span>
      </div>

      <!-- Backdrop đóng dock khi click ra ngoài -->
      <div class="dock-backdrop" id="dockBackdrop" onclick="StudyDockView.close()"></div>

      <!-- CỬA SỔ KÉP SPLIT-PANE WINDOW (GỐC + CON) -->
      <div class="dock-split-window ${this.isDetailOpen ? 'has-detail' : ''}" id="dockModal">
        
        <!-- 1. CỬA SỔ GỐC (MASTER PANE - DANH SÁCH TOÀN BỘ TIỆN ÍCH) -->
        <div class="dock-master-pane" id="dockMasterPane">
          <div class="dock-header">
            <div class="dock-header-title">
              <span class="dock-logo-icon" style="display:flex; align-items:center; color:var(--brand-primary);">${Icons.get('sparkles', 20)}</span>
              <div>
                <h4>Tiện Ích Học Tập</h4>
                <p>Danh mục công cụ ôn thi</p>
              </div>
            </div>
            <button class="dock-close-btn" onclick="StudyDockView.close()" title="Đóng" style="display:flex; align-items:center; justify-content:center;">${Icons.get('close', 14)}</button>
          </div>

          <!-- Danh sách các mục tiện ích -->
          <div class="dock-master-list" id="dockMasterList">
            ${this.renderMasterListItems()}
          </div>
        </div>

        <!-- 2. CỬA SỔ CON MỞ SANG PHẢI (DETAIL PANE - GIAO DIỆN CHỨC NĂNG) -->
        <div class="dock-detail-pane ${this.isDetailOpen ? 'active' : ''}" id="dockDetailPane">
          <div class="dock-detail-header">
            <button class="dock-detail-back-btn" onclick="StudyDockView.closeDetailPane()" title="Quay lại danh mục" style="display:inline-flex; align-items:center; gap:4px;">
              ${Icons.get('chevronLeft', 13)} <span>Danh mục</span>
            </button>
            <h4 id="dockDetailTitle">${this.getDetailTitle(this.activeDetailId)}</h4>
            <button class="dock-detail-close-btn" onclick="StudyDockView.closeDetailPane()" title="Thu nhỏ" style="display:flex; align-items:center; justify-content:center;">${Icons.get('close', 14)}</button>
          </div>

          <div class="dock-detail-body" id="dockDetailBody">
            ${this.renderDetailContent(this.activeDetailId)}
          </div>
        </div>

      </div>
    `;
  },

  renderMasterListItems() {
    const p = this.pomodoro;
    const isRain = AudioFXService.isRainPlaying;
    const isKey = AudioFXService.isKeySoundEnabled;

    const items = [
      {
        id: "pomodoro",
        icon: Icons.get('timer', 20),
        iconClass: "icon-red",
        title: "Thời Gian Pomodoro",
        desc: p.isRunning ? `Đang chạy: ${this.formatTime(p.timeLeft)}` : `${p.totalSessionsCompleted} hiệp đã hoàn thành`,
        badge: p.isRunning ? "Đang chạy" : null,
        badgeClass: p.isRunning ? "badge-running" : ""
      },
      {
        id: "calculator",
        icon: Icons.get('calculator', 20),
        iconClass: "icon-blue",
        title: "Máy Tính Bỏ Túi",
        desc: "Tính toán số liệu, điểm số, căn bậc hai"
      },
      {
        id: "notes",
        icon: Icons.get('fileText', 20),
        iconClass: "icon-amber",
        title: "Sổ Nháp Nhanh",
        desc: "Ghi chú công thức, từ khóa (Tự lưu máy)"
      },
      {
        id: "sounds",
        icon: Icons.get('volume2', 20),
        iconClass: "icon-purple",
        title: "Âm Thanh Môi Trường",
        desc: isRain ? "Mưa rào (Đang phát)" : "Mưa rào · Sóng biển · Gió rừng · Tích tắc",
        badge: (isRain || AudioFXService.isOceanPlaying || AudioFXService.isWindPlaying || AudioFXService.isTickingPlaying) ? "Đang phát" : null,
        badgeClass: "badge-active"
      },
      {
        id: "keysound",
        icon: Icons.get('keyboard', 20),
        iconClass: "icon-green",
        title: "Âm Thanh Chạm & Phím",
        desc: isKey ? `Đang bật (${AudioFXService.keySoundProfile === 'thock' ? 'Cream Thock' : 'Blue Clicky'})` : "Mô phỏng tiếng gõ phím cơ đã tai",
        badge: isKey ? "Bật" : null,
        badgeClass: "badge-active"
      },
      {
        id: "experience",
        icon: Icons.get('sun', 20),
        iconClass: "icon-amber",
        title: "Trải Nghiệm & Đèn Đêm",
        desc: "Chế độ Zen Focus & Lọc ánh sáng ấm dịu mắt"
      },
      {
        id: "fortune",
        icon: Icons.get('star', 20),
        iconClass: "icon-purple",
        title: "Quẻ May Mắn Hôm Nay",
        desc: "1 lần / ngày (Reset 00:00 Giờ Việt Nam)"
      },
      {
        id: "cheatsheet",
        icon: Icons.get('keyboard', 20),
        iconClass: "icon-blue",
        title: "Bảng Tra Phím Tắt",
        desc: "Phím tắt phòng thi & Cú pháp soạn đề"
      },
      {
        id: "guide",
        icon: Icons.get('helpCircle', 20),
        iconClass: "icon-amber",
        title: "Cẩm Nang Hướng Dẫn",
        desc: "Xem tài liệu hướng dẫn sử dụng web toàn tập",
        isLink: true
      }
    ];

    return items.map(item => `
      <div class="dock-master-item ${this.activeDetailId === item.id && this.isDetailOpen ? 'active' : ''}" 
           onclick="StudyDockView.selectMasterItem('${item.id}')">
        <div class="dock-item-icon ${item.iconClass}" style="display:flex; align-items:center; justify-content:center;">${item.icon}</div>
        <div class="dock-item-info">
          <h5>${item.title}</h5>
          <p>${item.desc}</p>
        </div>
        ${item.badge ? `<span class="dock-item-badge ${item.badgeClass}">${item.badge}</span>` : ''}
        <span class="dock-item-arrow" style="display:flex; align-items:center;">${Icons.get('chevronRight', 12)}</span>
      </div>
    `).join("");
  },

  selectMasterItem(id) {
    if (id === "guide") {
      this.close();
      App.navigateTo("guide");
      return;
    }

    this.activeDetailId = id;
    this.isDetailOpen = true;

    const modal = document.getElementById("dockModal");
    const detailPane = document.getElementById("dockDetailPane");
    const titleEl = document.getElementById("dockDetailTitle");
    const bodyEl = document.getElementById("dockDetailBody");

    if (modal) modal.classList.add("has-detail");
    if (detailPane) detailPane.classList.add("active");
    if (titleEl) titleEl.innerText = this.getDetailTitle(id);
    if (bodyEl) bodyEl.innerHTML = this.renderDetailContent(id);

    // Cập nhật highlight ở master list
    this.refreshMasterList();
  },

  closeDetailPane() {
    this.isDetailOpen = false;
    const modal = document.getElementById("dockModal");
    const detailPane = document.getElementById("dockDetailPane");
    if (modal) modal.classList.remove("has-detail");
    if (detailPane) detailPane.classList.remove("active");
    this.refreshMasterList();
  },

  getDetailTitle(id) {
    switch (id) {
      case "pomodoro": return "⏱️ Đồng Hồ Pomodoro";
      case "calculator": return "🧮 Máy Tính Bỏ Túi";
      case "notes": return "📝 Sổ Nháp Nhanh";
      case "sounds": return "🎧 Âm Thanh Môi Trường (0MB)";
      case "keysound": return "⌨️ Âm Thanh Chạm & Phím Cơ";
      case "experience": return "👁️ Trải Nghiệm & Đèn Đêm";
      case "fortune": return "🥠 Quẻ May Mắn Hôm Nay";
      case "cheatsheet": return "⌨️ Bảng Tra Phím Tắt";
      default: return "✨ Tiện Ích Chi Tiết";
    }
  },

  renderDetailContent(id) {
    switch (id) {
      case "pomodoro": return this.renderPomodoroDetail();
      case "calculator": return this.renderCalculatorDetail();
      case "notes": return this.renderNotesDetail();
      case "sounds": return this.renderSoundsDetail();
      case "keysound": return this.renderKeySoundDetail();
      case "experience": return this.renderExperienceDetail();
      case "fortune": return this.renderFortuneDetail();
      case "cheatsheet": return this.renderCheatsheetDetail();
      default: return `<p>Chọn một tiện ích bên trái để bắt đầu.</p>`;
    }
  },

  // ── DETAIL 1: POMODORO ─────────────────────────────────────
  renderPomodoroDetail() {
    const p = this.pomodoro;
    const progressPercent = Math.max(0, Math.min(100, ((p.durations[p.mode] - p.timeLeft) / p.durations[p.mode]) * 100));
    const tip = this.microBreakTips[p.activeTipIndex % this.microBreakTips.length];
    const todayHours = Math.floor(p.todayFocusedSeconds / 3600);
    const todayMins = Math.floor((p.todayFocusedSeconds % 3600) / 60);

    return `
      <div class="detail-box">
        <!-- 1. Thanh Tiến Trình 4 Quả Cà Chua Chu Kỳ -->
        <div class="pomo-cycles-header">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--text-primary);">Chu kỳ Pomodoro</span>
            <span style="font-size: 11px; color: #ef4444; font-weight: 800;">(Hiệp ${p.currentRound}/4)</span>
          </div>
          <div class="pomo-tomatoes-row">
            ${[1, 2, 3, 4].map(round => `
              <div class="pomo-tomato-dot ${p.currentRound === round ? 'active' : ''} ${p.currentRound > round ? 'completed' : ''}" title="Hiệp ${round}/4">
                🍅
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. Bộ Cài Đặt Thời Gian Linh Hoạt (Presets) -->
        <div class="pomo-preset-chips">
          <button type="button" class="pomo-preset-chip ${p.preset === 'quick' ? 'active' : ''}" onclick="StudyDockView.setPomodoroPreset('quick')">⚡ Ôn Nhanh (15p/3p)</button>
          <button type="button" class="pomo-preset-chip ${p.preset === 'classic' ? 'active' : ''}" onclick="StudyDockView.setPomodoroPreset('classic')">🍅 Chuẩn (25p/5p)</button>
          <button type="button" class="pomo-preset-chip ${p.preset === 'deep' ? 'active' : ''}" onclick="StudyDockView.setPomodoroPreset('deep')">📚 Tiết Học (45p/10p)</button>
          <button type="button" class="pomo-preset-chip ${p.preset === 'ultradian' ? 'active' : ''}" onclick="StudyDockView.setPomodoroPreset('ultradian')">🧠 Nghiên Cứu (90p/20p)</button>
        </div>

        <!-- 3. Gắn Mục Tiêu Hiệp Học (Task Goal) -->
        <div class="pomo-goal-box">
          <span class="pomo-goal-icon">🎯</span>
          <input type="text" 
                 class="pomo-goal-input" 
                 placeholder="Gắn mục tiêu hiệp này (VD: Giải 15 câu Triết)..." 
                 value="${this.escapeHtml ? this.escapeHtml(p.currentGoal) : p.currentGoal}" 
                 onchange="StudyDockView.setPomodoroGoal(this.value)">
        </div>

        <!-- 4. Chuyển Chế Độ (Học / Nghỉ ngắn / Nghỉ dài) -->
        <div class="pomo-mode-selector">
          <button type="button" class="pomo-mode-btn ${p.mode === 'work' ? 'active' : ''}" onclick="StudyDockView.setPomodoroMode('work')">📚 Học (${Math.round(p.durations.work / 60)}p)</button>
          <button type="button" class="pomo-mode-btn ${p.mode === 'shortBreak' ? 'active' : ''}" onclick="StudyDockView.setPomodoroMode('shortBreak')">☕ Nghỉ ngắn (${Math.round(p.durations.shortBreak / 60)}p)</button>
          <button type="button" class="pomo-mode-btn ${p.mode === 'longBreak' ? 'active' : ''}" onclick="StudyDockView.setPomodoroMode('longBreak')">🌴 Nghỉ dài (${Math.round(p.durations.longBreak / 60)}p)</button>
        </div>

        <!-- 5. Thẻ Hiển Thị Thời Gian & Tiến Trình -->
        <div class="pomo-display-card">
          <div class="pomo-time-display" id="pomoTimeDisplay">${this.formatTime(p.timeLeft)}</div>
          <div class="pomo-progress-track">
            <div class="pomo-progress-bar" id="pomoProgressBar" style="width: ${progressPercent}%;"></div>
          </div>
          <p class="pomo-sub-label">
            ${p.mode === 'work' 
              ? (p.currentGoal ? `🎯 Đang tập trung: <strong>${this.escapeHtml ? this.escapeHtml(p.currentGoal) : p.currentGoal}</strong>` : '🎯 Hiệp học tập trung cao độ') 
              : (p.mode === 'shortBreak' ? '☕ Thư giãn mắt & uống nước 5 phút' : '🌴 Nghỉ dài phục hồi năng lượng')}
          </p>
          <span class="pomo-distraction-badge" id="pomoDistractionBadge" style="${p.distractionCount > 0 ? 'display:inline-flex;' : 'display:none;'}">
            🛡️ Phân tâm: <strong>${p.distractionCount}</strong> lần
          </span>
        </div>

        <!-- 6. Hướng Dẫn Thư Giãn Mắt & Thể Chất Khi Nghỉ -->
        ${p.mode !== 'work' ? `
          <div class="pomo-microbreak-card">
            <h6>${tip.title}</h6>
            <p>${tip.desc}</p>
          </div>
        ` : ''}

        <!-- 7. Cụm Nút Điều Khiển -->
        <div class="pomo-actions">
          ${p.isRunning ? `
            <button type="button" class="pomo-action-btn btn-pause" onclick="StudyDockView.pausePomodoro()">⏸️ Tạm dừng</button>
          ` : `
            <button type="button" class="pomo-action-btn btn-start" onclick="StudyDockView.startPomodoro()">▶️ Bắt đầu hiệp</button>
          `}
          <button type="button" class="pomo-action-btn btn-skip" onclick="StudyDockView.skipPomodoro()" title="Bỏ qua chuyển sang hiệp kế">⏭️ Bỏ qua</button>
          <button type="button" class="pomo-action-btn btn-reset" onclick="StudyDockView.resetPomodoro()" title="Đặt lại đồng hồ">🔄 Đặt lại</button>
        </div>

        <!-- Nút Mở Không Gian Zen Focus Toàn Màn Hình -->
        <button type="button" class="btn btn-block" style="margin-top: 10px; background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 9px 12px; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s ease;" onclick="StudyDockView.openZenFocusRoom()">
          <span>🧘</span> <span>Mở Không Gian Tập Trung Toàn Màn Hình</span>
        </button>

        <!-- 8. Các Tùy Chọn Thông Minh (Tự động lặp & Đồng bộ nhạc) -->
        <div class="pomo-toggles-list">
          <div class="pomo-toggle-row">
            <div>
              <strong>Tự động lặp liên hoàn 4 hiệp</strong>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: var(--text-muted);">Tự chuyển giữa các hiệp Học và Nghỉ</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${p.autoLoop ? 'checked' : ''} onchange="StudyDockView.togglePomodoroAutoLoop(this.checked)">
              <span class="slider"></span>
            </label>
          </div>

          <div class="pomo-toggle-row">
            <div>
              <strong>Tự động đồng bộ âm nhạc Dynamic Island</strong>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: var(--text-muted);">Tự bật nhạc khi học, tạm dừng khi nghỉ</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${p.smartMusicSync ? 'checked' : ''} onchange="StudyDockView.togglePomodoroMusicSync(this.checked)">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- 9. Thống Kê Trong Ngày & Bạn Cùng Học Trực Tuyến -->
        <div class="detail-footer-note" style="display: flex; flex-direction: column; gap: 4px; text-align: center; margin-top: 10px;">
          <div>🟢 <strong>18 sinh viên</strong> đang cùng trong hiệp tập trung</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">
            📊 Đã tập trung hôm nay: <strong>${todayHours}h ${todayMins}m</strong> · <strong>${p.totalSessionsCompleted} hiệp</strong>
          </div>
        </div>
      </div>
    `;
  },

  // ── DETAIL 2: MÁY TÍNH MINI ──────────────────────────────
  renderCalculatorDetail() {
    return `
      <div class="detail-box">
        <div class="dock-calculator">
          <div class="calc-screen" id="calcScreen">${this.calc.display}</div>
          <div class="calc-keypad">
            <button class="calc-btn btn-action" onclick="StudyDockView.handleCalcAction('clear')">C</button>
            <button class="calc-btn btn-action" onclick="StudyDockView.handleCalcAction('delete')">⌫</button>
            <button class="calc-btn btn-action" onclick="StudyDockView.handleCalcAction('sqrt')">√</button>
            <button class="calc-btn btn-op" onclick="StudyDockView.handleCalcOp('/')">÷</button>

            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('7')">7</button>
            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('8')">8</button>
            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('9')">9</button>
            <button class="calc-btn btn-op" onclick="StudyDockView.handleCalcOp('*')">×</button>

            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('4')">4</button>
            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('5')">5</button>
            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('6')">6</button>
            <button class="calc-btn btn-op" onclick="StudyDockView.handleCalcOp('-')">−</button>

            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('1')">1</button>
            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('2')">2</button>
            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('3')">3</button>
            <button class="calc-btn btn-op" onclick="StudyDockView.handleCalcOp('+')">+</button>

            <button class="calc-btn btn-action" onclick="StudyDockView.handleCalcAction('plusminus')">±</button>
            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('0')">0</button>
            <button class="calc-btn" onclick="StudyDockView.handleCalcNum('.')">.</button>
            <button class="calc-btn btn-equals" onclick="StudyDockView.handleCalcEquals()">=</button>
          </div>
        </div>
        <p class="calc-hint-text">💡 Hỗ trợ tính số liệu đề thi, tính điểm trung bình và các phép tính nhanh.</p>
      </div>
    `;
  },

  // ── DETAIL 3: SỔ NHÁP ─────────────────────────────────────
  renderNotesDetail() {
    const savedNotes = localStorage.getItem("dthu_dock_scratchpad") || "";
    const words = savedNotes.trim() ? savedNotes.trim().split(/\s+/).length : 0;
    const chars = savedNotes.length;

    return `
      <div class="detail-box">
        <div class="scratchpad-header-bar">
          <div class="scratchpad-stats-badge">
            <span id="scratchWords">${words} từ</span> · <span id="scratchChars">${chars} ký tự</span>
          </div>
          <div class="scratchpad-buttons">
            <button class="scratch-btn" onclick="StudyDockView.copyScratchpad()">📋 Sao chép</button>
            <button class="scratch-btn btn-danger" onclick="StudyDockView.clearScratchpad()">🗑️ Xóa hết</button>
          </div>
        </div>

        <textarea 
          id="dockScratchpadText" 
          class="scratchpad-textarea-large" 
          placeholder="Ghi nhanh công thức, từ khóa cần nhớ tại đây... (Tự động lưu 100% vào máy)"
          oninput="StudyDockView.handleScratchpadInput(this.value)"
        >${this.escapeHtml(savedNotes)}</textarea>

        <p class="scratchpad-hint-text">💡 Dữ liệu tự động lưu tức thì vào LocalStorage. Thoải mái F5 hoặc đổi thiết bị duyệt web.</p>
      </div>
    `;
  },

  // ── DETAIL 4: ÂM THANH MÔI TRƯỜNG ─────────────────────────
  renderSoundsDetail() {
    const isRain = AudioFXService.isRainPlaying;
    const isOcean = AudioFXService.isOceanPlaying;
    const isWind = AudioFXService.isWindPlaying;
    const isTick = AudioFXService.isTickingPlaying;

    return `
      <div class="detail-box">
        <div class="soundscape-grid">
          <!-- Mưa Rào -->
          <div class="sound-card ${isRain ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">🌧️</span>
              <div class="sound-info">
                <strong>Mưa Rào Ngoài Hiên</strong>
                <p>Pink noise dịu mát êm dịu</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${isRain ? 'checked' : ''} onchange="StudyDockView.toggleRain(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
            ${isRain ? `
              <div class="sound-vol-row">
                <span>Âm lượng:</span>
                <input type="range" min="0" max="1" step="0.05" value="${AudioFXService.rainVolume}" oninput="StudyDockView.setRainVolume(this.value)">
                <span>${Math.round(AudioFXService.rainVolume * 100)}%</span>
              </div>
            ` : ''}
          </div>

          <!-- Sóng Biển -->
          <div class="sound-card ${isOcean ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">🌊</span>
              <div class="sound-info">
                <strong>Sóng Biển Dạt Dào</strong>
                <p>Nhịp sóng 8 giây thư thái đầu óc</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${isOcean ? 'checked' : ''} onchange="StudyDockView.toggleOcean(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
            ${isOcean ? `
              <div class="sound-vol-row">
                <span>Âm lượng:</span>
                <input type="range" min="0" max="1" step="0.05" value="${AudioFXService.oceanVolume}" oninput="StudyDockView.setOceanVolume(this.value)">
                <span>${Math.round(AudioFXService.oceanVolume * 100)}%</span>
              </div>
            ` : ''}
          </div>

          <!-- Gió Rừng -->
          <div class="sound-card ${isWind ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">🌲</span>
              <div class="sound-info">
                <strong>Gió Rừng Xào Xạc</strong>
                <p>Làn gió thanh tịnh trong lành</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${isWind ? 'checked' : ''} onchange="StudyDockView.toggleWind(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
            ${isWind ? `
              <div class="sound-vol-row">
                <span>Âm lượng:</span>
                <input type="range" min="0" max="1" step="0.05" value="${AudioFXService.windVolume}" oninput="StudyDockView.setWindVolume(this.value)">
                <span>${Math.round(AudioFXService.windVolume * 100)}%</span>
              </div>
            ` : ''}
          </div>

          <!-- Tích Tắc Pomodoro -->
          <div class="sound-card ${isTick ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">⏱️</span>
              <div class="sound-info">
                <strong>Tích Tắc Đồng Hồ Cơ</strong>
                <p>Nhịp đếm giây kích thích tập trung</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${isTick ? 'checked' : ''} onchange="StudyDockView.toggleTicking(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <p class="sound-footer-hint">✨ Âm thanh toán học thuần túy 0MB — 100% Offline, không tốn dung lượng máy chủ.</p>
      </div>
    `;
  },

  // ── DETAIL 5: ÂM PHÍM CƠ & CHẠM ───────────────────────────
  renderKeySoundDetail() {
    const isKey = AudioFXService.isKeySoundEnabled;
    const keyProfile = AudioFXService.keySoundProfile;

    return `
      <div class="detail-box">
        <div class="sound-card ${isKey ? 'playing' : ''}">
          <div class="sound-card-top">
            <span class="sound-icon">⌨️</span>
            <div class="sound-info">
              <strong>Kích Hoạt Âm Phím Cơ & Chạm</strong>
              <p>Phát âm thanh khi click chọn đáp án hoặc bấm phím</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${isKey ? 'checked' : ''} onchange="StudyDockView.toggleKeySound(this.checked)">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <h5 class="section-sub-title">Chọn loại Switch & Âm thanh bàn phím:</h5>
        <div class="key-sound-grid">
          <div class="key-switch-card ${keyProfile === 'clicky' ? 'active' : ''}" onclick="StudyDockView.setKeySoundProfile('clicky')">
            <strong>🔵 Blue Switch</strong>
            <span>Clicky đanh giòn, nảy đanh thép khi chọn đáp án</span>
          </div>

          <div class="key-switch-card ${keyProfile === 'linear' ? 'active' : ''}" onclick="StudyDockView.setKeySoundProfile('linear')">
            <strong>🔴 Red Switch</strong>
            <span>Linear êm ái, mượt mà, gõ siêu nhẹ nhàng</span>
          </div>

          <div class="key-switch-card ${keyProfile === 'thock' ? 'active' : ''}" onclick="StudyDockView.setKeySoundProfile('thock')">
            <strong>🟤 Cream Switch</strong>
            <span>Thock trầm ấm, sang trọng, không ồn ban đêm</span>
          </div>

          <div class="key-switch-card ${keyProfile === 'typewriter' ? 'active' : ''}" onclick="StudyDockView.setKeySoundProfile('typewriter')">
            <strong>⌨️ Máy Đánh Chữ</strong>
            <span>Âm cơ học cổ điển phong cách vintage typewriter</span>
          </div>

          <div class="key-switch-card ${keyProfile === 'waterDrop' ? 'active' : ''}" onclick="StudyDockView.setKeySoundProfile('waterDrop')">
            <strong>💧 Giọt Nước</strong>
            <span>Trong trẻo, thiền định thư thái đầu óc</span>
          </div>

          <div class="key-switch-card ${keyProfile === 'woodblock' ? 'active' : ''}" onclick="StudyDockView.setKeySoundProfile('woodblock')">
            <strong>🪵 Gõ Mõ Zen</strong>
            <span>Thanh tịnh tĩnh lặng chuẩn phòng thiền</span>
          </div>
        </div>
      </div>
    `;
  },

  // ── DETAIL 6: TRẢI NGHIỆM & ĐÈN ĐÊM ───────────────────────
  renderExperienceDetail() {
    return `
      <div class="detail-box">
        <div class="view-toggles-list">
          <!-- 1. Lọc ánh sáng vàng Amber Warm -->
          <div class="sound-card ${this.isWarmFilter ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">🌙</span>
              <div class="sound-info">
                <strong>Lọc Ánh Sáng Đêm (Amber Warm)</strong>
                <p>Lớp phủ màu ấm bảo vệ mắt khi ôn bài lúc 1-2h sáng</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${this.isWarmFilter ? 'checked' : ''} onchange="StudyDockView.toggleWarmFilter(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
            ${this.isWarmFilter ? `
              <div class="sound-vol-row">
                <span>Độ ấm:</span>
                <input type="range" min="0.1" max="0.5" step="0.05" value="${this.warmIntensity}" oninput="StudyDockView.setWarmIntensity(this.value)">
                <span>${Math.round(this.warmIntensity * 200)}%</span>
              </div>
            ` : ''}
          </div>

          <!-- 2. Chế độ đen tuyệt đối OLED -->
          <div class="sound-card ${this.isOledMode ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">🔲</span>
              <div class="sound-info">
                <strong>Chế Độ Đen Tuyệt Đối OLED</strong>
                <p>Nền đen sâu 100% tiết kiệm pin và dịu mắt tối đa</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${this.isOledMode ? 'checked' : ''} onchange="StudyDockView.toggleOledMode(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- 3. Giãn dòng & Cỡ chữ đọc sách -->
          <div class="sound-card ${this.isReadingComfort ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">📖</span>
              <div class="sound-info">
                <strong>Cỡ Chữ & Giãn Dòng Thoải Mái</strong>
                <p>Tăng kích thước và độ giãn dòng đọc tài liệu, đề thi</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${this.isReadingComfort ? 'checked' : ''} onchange="StudyDockView.toggleReadingComfort(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- 4. Đèn nến lung linh -->
          <div class="sound-card ${this.isCandleMode ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">🕯️</span>
              <div class="sound-info">
                <strong>Ánh Nến Lung Linh (Candle Glow)</strong>
                <p>Hiệu ứng ánh nến vàng nhẹ nhàng góc màn hình</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${this.isCandleMode ? 'checked' : ''} onchange="StudyDockView.toggleCandleMode(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- 5. Tĩnh lặng tuyệt đối DND -->
          <div class="sound-card ${this.isDndMode ? 'playing' : ''}">
            <div class="sound-card-top">
              <span class="sound-icon">🔇</span>
              <div class="sound-info">
                <strong>Yên Tĩnh Tuyệt Đối (Do Not Disturb)</strong>
                <p>Tắt toàn bộ thông báo popup khi đang tập trung</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${this.isDndMode ? 'checked' : ''} onchange="StudyDockView.toggleDndMode(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ── DETAIL 7: QUẺ MAY MẮN ────────────────────────────────
  renderFortuneDetail() {
    const todayStr = this.getVietnamTodayStr();
    let savedFortuneData = null;

    try {
      const stored = localStorage.getItem("dthu_dock_daily_fortune_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.date === todayStr) {
          savedFortuneData = parsed.fortune;
        }
      }
    } catch (e) {}

    const countdown = this.getTimeUntilVietnamMidnight();

    return `
      <div class="detail-box">
        <div class="fortune-interactive-box">
          ${savedFortuneData ? `
            <div class="fortune-result-card">
              <div class="fortune-badge-row">
                <span class="fortune-tag">${savedFortuneData.tag}</span>
                <span class="fortune-date">Hôm nay: ${todayStr}</span>
              </div>
              <div class="fortune-text">${savedFortuneData.text}</div>
              <div class="fortune-lock-notice">
                ⏳ <strong>Quẻ mới sẽ mở sau:</strong> <span id="fortuneCountdownText" class="countdown-highlight">${countdown.formatted}</span>
              </div>
            </div>
          ` : `
            <div class="cookie-draw-button" onclick="StudyDockView.drawDailyFortune()">
              <span class="cookie-big-emoji">🥠</span>
              <h5>Chạm để bẻ khóa Quẻ May Mắn Hôm Nay!</h5>
              <p>Mỗi ngày 1 quẻ may mắn & thông điệp vũ trụ dành riêng cho bạn</p>
              <button class="draw-action-btn">✨ Bốc Quẻ Ngay</button>
            </div>
          `}
        </div>
        <p class="fortune-sub-hint">📅 Hệ thống tự động mở khóa quẻ mới vào đúng 00:00:00 Giờ Việt Nam (GMT+7).</p>
      </div>
    `;
  },

  // ── DETAIL 8: PHÍM TẮT & CÚ PHÁP ───────────────────────────
  renderCheatsheetDetail() {
    return `
      <div class="detail-box">
        <h5 class="cheatsheet-heading">⌨️ Phím Tắt Trong Phòng Thi</h5>
        <div class="cheatsheet-table">
          <div class="cheat-row"><span class="cheat-key">1 · 2 · 3 · 4</span><span class="cheat-desc">Chọn đáp án A, B, C, D</span></div>
          <div class="cheat-row"><span class="cheat-key">Space / Phím cách</span><span class="cheat-desc">Chốt nộp đáp án câu hiện tại</span></div>
          <div class="cheat-row"><span class="cheat-key">Enter / Mũi tên phải</span><span class="cheat-desc">Chuyển sang câu tiếp theo</span></div>
          <div class="cheat-row"><span class="cheat-key">F / Cờ</span><span class="cheat-desc">Đánh dấu cờ câu hỏi phân vân</span></div>
        </div>

        <h5 class="cheatsheet-heading" style="margin-top: 16px;">📝 Cú Pháp Soạn Đề Nhanh</h5>
        <div class="cheatsheet-table">
          <div class="cheat-row"><span class="cheat-key">[A] hoặc A.</span><span class="cheat-desc">Đáp án đúng</span></div>
          <div class="cheat-row"><span class="cheat-key">--- hoặc ===</span><span class="cheat-desc">Dấu phân cách giữa các câu</span></div>
          <div class="cheat-row"><span class="cheat-key">Giải thích: ...</span><span class="cheat-desc">Lời giải chi tiết</span></div>
        </div>
      </div>
    `;
  },

  // ── ĐIỀU HƯỚNG & QUẢN LÝ MODAL ─────────────────────────────
  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  },

  open() {
    if (!this.isUserAllowed()) {
      if (typeof App !== "undefined" && typeof App.showToast === "function") {
        App.showToast("🔒 Trung tâm Tiện ích học tập và Dynamic Island chỉ dành cho thành viên đã đăng nhập!", "info", 3500);
      }
      return;
    }

    this.isOpen = true;
    const modal = document.getElementById("dockModal");
    const backdrop = document.getElementById("dockBackdrop");
    if (modal) modal.classList.add("active");
    if (backdrop) backdrop.classList.add("active");

    // Khóa cuộn trang nền
    document.body.classList.add("dock-modal-open");

    // Đánh thức AudioContext
    AudioFXService.getAudioContext();

    this.refreshMasterList();
    this.selectMasterItem(this.activeDetailId);
  },

  close() {
    this.isOpen = false;
    const modal = document.getElementById("dockModal");
    const backdrop = document.getElementById("dockBackdrop");
    if (modal) modal.classList.remove("active");
    if (backdrop) backdrop.classList.remove("active");

    // Mở lại cuộn trang nền
    document.body.classList.remove("dock-modal-open");
  },

  refreshMasterList() {
    const listEl = document.getElementById("dockMasterList");
    if (listEl) {
      listEl.innerHTML = this.renderMasterListItems();
    }
  },

  refreshDetailPane() {
    const bodyEl = document.getElementById("dockDetailBody");
    if (bodyEl) {
      bodyEl.innerHTML = this.renderDetailContent(this.activeDetailId);
    }
  },

  // ── 🧮 LOGIC MÁY TÍNH MINI ──────────────────────────────
  handleCalcNum(num) {
    AudioFXService.playKeyClick();
    if (this.calc.waitingForOperand) {
      this.calc.display = num === "." ? "0." : num;
      this.calc.waitingForOperand = false;
    } else {
      if (num === "." && this.calc.display.includes(".")) return;
      this.calc.display = this.calc.display === "0" && num !== "." ? num : this.calc.display + num;
    }
    this.updateCalcScreen();
  },

  handleCalcOp(nextOp) {
    AudioFXService.playKeyClick();
    const inputValue = parseFloat(this.calc.display);

    if (this.calc.operator && this.calc.waitingForOperand) {
      this.calc.operator = nextOp;
      return;
    }

    if (this.calc.prevValue == null && !isNaN(inputValue)) {
      this.calc.prevValue = inputValue;
    } else if (this.calc.operator) {
      const result = this.calculate(this.calc.prevValue, inputValue, this.calc.operator);
      this.calc.display = `${parseFloat(result.toFixed(8))}`;
      this.calc.prevValue = result;
      this.updateCalcScreen();
    }

    this.calc.waitingForOperand = true;
    this.calc.operator = nextOp;
  },

  handleCalcEquals() {
    AudioFXService.playKeyClick();
    const inputValue = parseFloat(this.calc.display);
    if (this.calc.operator && !this.calc.waitingForOperand) {
      const result = this.calculate(this.calc.prevValue, inputValue, this.calc.operator);
      this.calc.display = `${parseFloat(result.toFixed(8))}`;
      this.calc.prevValue = null;
      this.calc.operator = null;
      this.calc.waitingForOperand = true;
      this.updateCalcScreen();
    }
  },

  handleCalcAction(action) {
    AudioFXService.playKeyClick();
    if (action === "clear") {
      this.calc.display = "0";
      this.calc.prevValue = null;
      this.calc.operator = null;
      this.calc.waitingForOperand = false;
    } else if (action === "delete") {
      if (this.calc.display.length > 1) {
        this.calc.display = this.calc.display.slice(0, -1);
      } else {
        this.calc.display = "0";
      }
    } else if (action === "sqrt") {
      const val = parseFloat(this.calc.display);
      if (val >= 0) {
        this.calc.display = `${parseFloat(Math.sqrt(val).toFixed(8))}`;
        this.calc.waitingForOperand = true;
      }
    } else if (action === "plusminus") {
      const val = parseFloat(this.calc.display);
      this.calc.display = `${val * -1}`;
    }
    this.updateCalcScreen();
  },

  calculate(first, second, op) {
    if (op === "+") return first + second;
    if (op === "-") return first - second;
    if (op === "*") return first * second;
    if (op === "/") return second !== 0 ? first / second : 0;
    return second;
  },

  updateCalcScreen() {
    const screen = document.getElementById("calcScreen");
    if (screen) screen.innerText = this.calc.display;
  },

  // ── ⏱️ LOGIC POMODORO TIMER ──────────────────────────────
  setPomodoroPreset(presetKey, updateDisplay = true) {
    this.pomodoro.preset = presetKey;
    try {
      localStorage.setItem("dthu_dock_pomodoro_preset", presetKey);
    } catch (e) {}

    switch (presetKey) {
      case "quick": // 15p học / 3p nghỉ
        this.pomodoro.durations = { work: 15 * 60, shortBreak: 3 * 60, longBreak: 10 * 60 };
        break;
      case "deep": // 45p học / 10p nghỉ
        this.pomodoro.durations = { work: 45 * 60, shortBreak: 10 * 60, longBreak: 20 * 60 };
        break;
      case "ultradian": // 90p học / 20p nghỉ
        this.pomodoro.durations = { work: 90 * 60, shortBreak: 20 * 60, longBreak: 30 * 60 };
        break;
      case "classic":
      default: // 25p học / 5p nghỉ
        this.pomodoro.durations = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
        break;
    }

    if (!this.pomodoro.isRunning) {
      this.pomodoro.timeLeft = this.pomodoro.durations[this.pomodoro.mode];
    }

    if (updateDisplay) {
      this.refreshDetailPane();
      this.updatePillBadge();
    }
  },

  setPomodoroGoal(goalText) {
    this.pomodoro.currentGoal = (goalText || "").trim();
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.updateActivity === "function" && this.pomodoro.isRunning) {
      DynamicIsland.updateActivity("pomodoro", {
        title: this.pomodoro.currentGoal || `Hiệp ${this.pomodoro.currentRound}/4`,
        subtitle: this.formatTime(this.pomodoro.timeLeft)
      });
    }
  },

  togglePomodoroAutoLoop(checked) {
    this.pomodoro.autoLoop = Boolean(checked);
    try {
      localStorage.setItem("dthu_dock_pomodoro_autoloop", this.pomodoro.autoLoop.toString());
    } catch (e) {}
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(this.pomodoro.autoLoop ? "Đã bật: Tự động chuyển hiệp liên hoàn 4 vòng!" : "Đã tắt tự động lặp.", "info");
    }
  },

  togglePomodoroMusicSync(checked) {
    this.pomodoro.smartMusicSync = Boolean(checked);
    try {
      localStorage.setItem("dthu_dock_pomodoro_musicsync", this.pomodoro.smartMusicSync.toString());
    } catch (e) {}
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(this.pomodoro.smartMusicSync ? "Đã bật: Tự động phát nhạc khi học & dừng khi nghỉ!" : "Đã tắt đồng bộ âm nhạc.", "info");
    }
  },

  setPomodoroMode(mode) {
    if (this.pomodoro.isRunning) this.pausePomodoro();
    this.pomodoro.mode = mode;
    this.pomodoro.timeLeft = this.pomodoro.durations[mode];
    this.refreshDetailPane();
    this.refreshMasterList();
    this.updatePillBadge();
    if (this.isZenFocusRoomOpen) this.renderZenFocusRoom();
  },

  startPomodoro() {
    if (this.pomodoro.isRunning) return;
    this.pomodoro.isRunning = true;
    AudioFXService.playKeyClick();

    // Tự động bật nhạc sóng não / Lo-Fi trên Dynamic Island nếu đang ở hiệp Học
    if (this.pomodoro.mode === "work" && this.pomodoro.smartMusicSync) {
      if (typeof DynamicIsland !== "undefined" && DynamicIsland.currentTrack && !DynamicIsland.currentTrack.isPlaying) {
        DynamicIsland.togglePlayPause();
      }
    }

    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.pushActivity === "function") {
      DynamicIsland.pushActivity({
        id: "pomodoro",
        type: "pomodoro",
        priority: 2,
        icon: "🍅",
        title: this.pomodoro.currentGoal || `Hiệp ${this.pomodoro.currentRound}/4`,
        subtitle: this.formatTime(this.pomodoro.timeLeft)
      });
    }

    this.pomodoro.timerId = setInterval(() => {
      if (this.pomodoro.timeLeft > 0) {
        this.pomodoro.timeLeft--;
        this.updatePillBadge();

        if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.updateActivity === "function") {
          DynamicIsland.updateActivity("pomodoro", {
            title: this.pomodoro.currentGoal || `Hiệp ${this.pomodoro.currentRound}/4`,
            subtitle: this.formatTime(this.pomodoro.timeLeft)
          });
        }

        const timeEl = document.getElementById("pomoTimeDisplay");
        const barEl = document.getElementById("pomoProgressBar");
        if (timeEl) timeEl.innerText = this.formatTime(this.pomodoro.timeLeft);
        if (barEl) {
          const p = this.pomodoro;
          const pct = Math.max(0, Math.min(100, ((p.durations[p.mode] - p.timeLeft) / p.durations[p.mode]) * 100));
          barEl.style.width = `${pct}%`;
        }

        // Cập nhật giao diện đồng hồ khổng lồ trong Zen Focus Room
        const zenTimeEl = document.getElementById("zenRoomTimeDisplay");
        const zenBarEl = document.getElementById("zenRoomProgressBar");
        if (zenTimeEl) zenTimeEl.innerText = this.formatTime(this.pomodoro.timeLeft);
        if (zenBarEl) {
          const p = this.pomodoro;
          const pct = Math.max(0, Math.min(100, ((p.durations[p.mode] - p.timeLeft) / p.durations[p.mode]) * 100));
          zenBarEl.style.width = `${pct}%`;
        }
      } else {
        this.finishPomodoro();
      }
    }, 1000);

    this.updatePillBadge();
    this.refreshDetailPane();
    this.refreshMasterList();
    if (this.isZenFocusRoomOpen) this.renderZenFocusRoom();
  },

  pausePomodoro() {
    this.pomodoro.isRunning = false;
    if (this.pomodoro.timerId) {
      clearInterval(this.pomodoro.timerId);
      this.pomodoro.timerId = null;
    }
    AudioFXService.playKeyClick();

    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.removeActivity === "function") {
      DynamicIsland.removeActivity("pomodoro");
    }

    this.updatePillBadge();
    this.refreshDetailPane();
    this.refreshMasterList();
    if (this.isZenFocusRoomOpen) this.renderZenFocusRoom();
  },

  skipPomodoro() {
    this.pausePomodoro();
    if (this.pomodoro.mode === "work") {
      if (this.pomodoro.currentRound < this.pomodoro.maxRounds) {
        this.setPomodoroMode("shortBreak");
      } else {
        this.setPomodoroMode("longBreak");
      }
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast("Đã chuyển sang hiệp nghỉ ngơi.", "info");
      }
    } else {
      if (this.pomodoro.mode === "shortBreak") {
        this.pomodoro.currentRound++;
      } else {
        this.pomodoro.currentRound = 1;
      }
      this.setPomodoroMode("work");
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast(`Bắt đầu Hiệp học số ${this.pomodoro.currentRound}/4!`, "info");
      }
    }
    if (this.isZenFocusRoomOpen) this.renderZenFocusRoom();
  },

  resetPomodoro() {
    this.pausePomodoro();
    this.pomodoro.timeLeft = this.pomodoro.durations[this.pomodoro.mode];
    this.pomodoro.distractionCount = 0;
    this.updatePillBadge();
    this.refreshDetailPane();
    this.refreshMasterList();
    if (this.isZenFocusRoomOpen) this.renderZenFocusRoom();
  },

  finishPomodoro() {
    this.pausePomodoro();
    AudioFXService.playBell();

    const isWorkSession = (this.pomodoro.mode === "work");

    // Flash thông báo nổi bật trên Dynamic Island
    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.flashActivity === "function") {
      DynamicIsland.flashActivity({
        id: "pomodoro-done-" + Date.now(),
        type: "combo",
        priority: 4,
        icon: "🔔",
        title: isWorkSession ? `Hoàn thành hiệp ${this.pomodoro.currentRound}/4!` : "Hết giờ giải lao!",
        subtitle: isWorkSession ? "Hãy thư giãn mắt & uống nước nhé" : "Bắt đầu hiệp học tập trung mới"
      }, 5000);
    }

    if (isWorkSession) {
      // Cộng dồn thời gian tập trung
      this.pomodoro.totalSessionsCompleted++;
      this.pomodoro.todayFocusedSeconds += this.pomodoro.durations.work;
      this.pomodoro.activeTipIndex = (this.pomodoro.activeTipIndex + 1) % this.microBreakTips.length;

      try {
        localStorage.setItem("dthu_dock_pomodoro_count", this.pomodoro.totalSessionsCompleted.toString());
        localStorage.setItem("dthu_dock_pomodoro_today_secs", this.pomodoro.todayFocusedSeconds.toString());
      } catch (e) {}

      // Tạm dừng nhạc nếu bật Smart Music Sync để sinh viên nghỉ ngơi
      if (this.pomodoro.smartMusicSync && typeof DynamicIsland !== "undefined" && DynamicIsland.currentTrack && DynamicIsland.currentTrack.isPlaying) {
        DynamicIsland.togglePlayPause();
      }

      if (this.pomodoro.currentRound < this.pomodoro.maxRounds) {
        if (typeof UIHelpers !== "undefined") {
          UIHelpers.showToast(`🎉 Xuất sắc! Hoàn thành hiệp ${this.pomodoro.currentRound}/4. Hãy nghỉ ngắn ${Math.round(this.pomodoro.durations.shortBreak / 60)} phút nhé!`, "success", 6000);
        }
        this.setPomodoroMode("shortBreak");
      } else {
        if (typeof UIHelpers !== "undefined") {
          UIHelpers.showToast(`🏆 Tuyệt vời! Bạn đã hoàn thành trọn vẹn 4 hiệp Pomodoro liên tiếp. Hãy tận hưởng ${Math.round(this.pomodoro.durations.longBreak / 60)} phút nghỉ dài nhé!`, "success", 8000);
        }
        this.pomodoro.currentRound = 1;
        this.setPomodoroMode("longBreak");
      }
    } else {
      // Hết giờ nghỉ
      if (this.pomodoro.mode === "shortBreak") {
        this.pomodoro.currentRound++;
      } else {
        this.pomodoro.currentRound = 1;
      }

      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast(`🔔 Hết giờ giải lao! Bắt đầu Hiệp học ${this.pomodoro.currentRound}/4 tập trung mới nhé!`, "info", 5000);
      }
      this.setPomodoroMode("work");
    }

    // Tự Động Chạy Tiếp Nếu Bật Auto-Loop
    if (this.pomodoro.autoLoop) {
      setTimeout(() => {
        if (!StudyDockView.pomodoro.isRunning) {
          StudyDockView.startPomodoro();
        }
      }, 1500);
    }
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },

  updatePillBadge() {
    const badge = document.getElementById("dockPillBadge");
    const label = document.getElementById("dockPillLabel");
    if (!badge || !label) return;

    if (this.pomodoro.isRunning) {
      badge.style.display = "inline-flex";
      badge.innerText = this.formatTime(this.pomodoro.timeLeft);
      badge.className = "dock-pill-badge badge-pulse";
      label.style.display = "none";
    } else {
      badge.style.display = "none";
      label.style.display = "inline";
    }
  },

  // ── 📝 LOGIC SỔ NHÁP SCRATCHPAD ─────────────────────────
  handleScratchpadInput(val) {
    try {
      localStorage.setItem("dthu_dock_scratchpad", val);
    } catch (e) {}

    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    const chars = val.length;

    const wEl = document.getElementById("scratchWords");
    const cEl = document.getElementById("scratchChars");
    if (wEl) wEl.innerText = `${words} từ`;
    if (cEl) cEl.innerText = `${chars} ký tự`;
  },

  copyScratchpad() {
    const textEl = document.getElementById("dockScratchpadText");
    if (!textEl || !textEl.value) {
      if (typeof UIHelpers !== "undefined") UIHelpers.showToast("Sổ nháp đang trống!", "warning");
      return;
    }
    navigator.clipboard.writeText(textEl.value).then(() => {
      AudioFXService.playSuccess();
      if (typeof UIHelpers !== "undefined") UIHelpers.showToast("Đã sao chép nội dung sổ nháp vào Clipboard!", "success");
    }).catch(() => {});
  },

  clearScratchpad() {
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showConfirmModal(
        "Xác nhận xóa nháp",
        "Bạn có chắc chắn muốn xóa toàn bộ nội dung trong sổ nháp nhanh không?",
        () => {
          localStorage.removeItem("dthu_dock_scratchpad");
          const textEl = document.getElementById("dockScratchpadText");
          if (textEl) textEl.value = "";
          StudyDockView.handleScratchpadInput("");
          UIHelpers.showToast("Đã dọn sạch sổ nháp!", "info");
        }
      );
    } else {
      localStorage.removeItem("dthu_dock_scratchpad");
      this.refreshDetailPane();
    }
  },

  // ── 🎧 LOGIC ÂM THANH ĐA CẢNH 0MB ───────────────────────
  toggleRain(checked) {
    AudioFXService.toggleRain(checked);
    this.refreshDetailPane();
    this.refreshMasterList();
  },

  setRainVolume(val) {
    AudioFXService.setRainVolume(parseFloat(val));
    this.refreshDetailPane();
  },

  toggleOcean(checked) {
    AudioFXService.toggleOcean(checked);
    this.refreshDetailPane();
    this.refreshMasterList();
  },

  setOceanVolume(val) {
    AudioFXService.setOceanVolume(parseFloat(val));
    this.refreshDetailPane();
  },

  toggleWind(checked) {
    AudioFXService.toggleWind(checked);
    this.refreshDetailPane();
    this.refreshMasterList();
  },

  setWindVolume(val) {
    AudioFXService.setWindVolume(parseFloat(val));
    this.refreshDetailPane();
  },

  toggleTicking(checked) {
    AudioFXService.toggleTicking(checked);
    this.refreshDetailPane();
    this.refreshMasterList();
  },

  toggleKeySound(checked) {
    AudioFXService.isKeySoundEnabled = checked;
    AudioFXService.saveSettings();
    if (checked) AudioFXService.playKeyClick();
    this.refreshDetailPane();
    this.refreshMasterList();
  },

  setKeySoundProfile(profile) {
    AudioFXService.keySoundProfile = profile;
    AudioFXService.saveSettings();
    AudioFXService.playKeyClick();
    this.refreshDetailPane();
    this.refreshMasterList();
  },

  // ── 🧘 LOGIC KHÔNG GIAN TẬP TRUNG TOÀN MÀN HÌNH (ZEN FOCUS ROOM) ─
  openZenFocusRoom() {
    this.isZenFocusRoomOpen = true;
    this.close(); // Đóng modal study dock để nhường toàn bộ màn hình cho không gian Zen

    let overlay = document.getElementById("zenFocusRoomOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zenFocusRoomOverlay";
      document.body.appendChild(overlay);
    }
    overlay.style.display = "flex";
    document.body.classList.add("zen-focus-room-active");
    this.renderZenFocusRoom();

    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast("🧘 Đã vào Không Gian Tập Trung Toàn Màn Hình (Bấm Esc để thoát)", "info");
    }
  },

  closeZenFocusRoom() {
    this.isZenFocusRoomOpen = false;
    const overlay = document.getElementById("zenFocusRoomOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
    document.body.classList.remove("zen-focus-room-active");
  },

  renderZenFocusRoom() {
    const overlay = document.getElementById("zenFocusRoomOverlay");
    if (!overlay) return;

    const p = this.pomodoro;
    const progressPercent = Math.max(0, Math.min(100, ((p.durations[p.mode] - p.timeLeft) / p.durations[p.mode]) * 100));

    overlay.innerHTML = `
      <!-- Nút Thoát Góc Phải -->
      <button type="button" class="zen-exit-top-btn" onclick="StudyDockView.closeZenFocusRoom()" title="Thoát chế độ tập trung (Esc)">
        <span>✕</span> <span>Thoát Chế Độ Tập Trung (Esc)</span>
      </button>

      <!-- Nội Dung Trung Tâm: Đồng Hồ Siêu Lớn -->
      <div class="zen-room-content">
        <div class="zen-room-mode-badge">
          ${p.mode === 'work' ? `🍅 HIỆP HỌC ${p.currentRound}/4 (${Math.round(p.durations.work / 60)} PHÚT)` : (p.mode === 'shortBreak' ? '☕ NGHỈ NGẮN 5 PHÚT' : '🌴 NGHỈ DÀI PHỤC HỒI')}
        </div>

        ${p.currentGoal ? `
          <div class="zen-room-goal-pill">🎯 Mục tiêu: ${this.escapeHtml ? this.escapeHtml(p.currentGoal) : p.currentGoal}</div>
        ` : ''}

        <!-- Đồng Hồ To Chà Bá Ở Giữa -->
        <div class="zen-room-time-huge" id="zenRoomTimeDisplay">${this.formatTime(p.timeLeft)}</div>

        <!-- Thanh Tiến Trình -->
        <div class="zen-room-progress-track">
          <div class="zen-room-progress-bar" id="zenRoomProgressBar" style="width: ${progressPercent}%;"></div>
        </div>

        <!-- 4 Quả Cà Chua Tiến Trình -->
        <div class="zen-room-tomatoes" id="zenRoomTomatoes">
          ${[1, 2, 3, 4].map(round => `
            <div class="zen-room-tomato-dot ${p.currentRound === round ? 'active' : ''} ${p.currentRound > round ? 'completed' : ''}">
              🍅
            </div>
          `).join('')}
        </div>

        <!-- Các Nút Điều Khiển Tập Trung -->
        <div class="zen-room-actions">
          ${p.isRunning ? `
            <button type="button" class="zen-action-btn btn-pause" onclick="StudyDockView.pausePomodoro(); StudyDockView.renderZenFocusRoom();">
              <span>⏸️</span> <span>Tạm Dừng</span>
            </button>
          ` : `
            <button type="button" class="zen-action-btn btn-play" onclick="StudyDockView.startPomodoro(); StudyDockView.renderZenFocusRoom();">
              <span>▶️</span> <span>Bắt Đầu Hiệp</span>
            </button>
          `}
          <button type="button" class="zen-action-btn btn-secondary" onclick="StudyDockView.skipPomodoro(); StudyDockView.renderZenFocusRoom();" title="Bỏ qua hiệp">
            <span>⏭️</span> <span>Bỏ Qua</span>
          </button>
          <button type="button" class="zen-action-btn btn-secondary" onclick="StudyDockView.resetPomodoro(); StudyDockView.renderZenFocusRoom();" title="Đặt lại hiệp">
            <span>🔄</span> <span>Đặt Lại</span>
          </button>
        </div>
      </div>

      <div class="zen-desk-clock-hint">
        💡 Đặt thiết bị trên bàn học như một chiếc Đồng hồ Pomodoro để bàn tối giản
      </div>
    `;
  },

  // ── 👁️ LOGIC TRẢI NGHIỆM HỌC TẬP & ĐÈN ĐÊM ──────────────
  toggleWarmFilter(checked) {
    this.isWarmFilter = checked;
    const overlay = document.getElementById("studyWarmFilterOverlay");
    if (overlay) {
      overlay.classList.toggle("active", this.isWarmFilter);
      overlay.style.backgroundColor = `rgba(245, 158, 11, ${this.warmIntensity})`;
    }
    try {
      localStorage.setItem("dthu_dock_warm_filter", this.isWarmFilter.toString());
    } catch (e) {}
    this.refreshDetailPane();
  },

  setWarmIntensity(val) {
    this.warmIntensity = parseFloat(val) || 0.25;
    const overlay = document.getElementById("studyWarmFilterOverlay");
    if (overlay && this.isWarmFilter) {
      overlay.style.backgroundColor = `rgba(245, 158, 11, ${this.warmIntensity})`;
    }
    this.refreshDetailPane();
  },

  toggleOledMode(checked) {
    this.isOledMode = checked;
    document.body.classList.toggle("oled-pure-black-mode", this.isOledMode);
    try {
      localStorage.setItem("dthu_dock_oled_mode", this.isOledMode.toString());
    } catch (e) {}
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(this.isOledMode ? "🔲 Đã bật Chế Độ Đen Tuyệt Đối OLED 100%" : "Đã tắt Chế Độ OLED", "info");
    }
    this.refreshDetailPane();
  },

  toggleReadingComfort(checked) {
    this.isReadingComfort = checked;
    document.body.classList.toggle("reading-comfort-mode", this.isReadingComfort);
    try {
      localStorage.setItem("dthu_dock_reading_comfort", this.isReadingComfort.toString());
    } catch (e) {}
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(this.isReadingComfort ? "📖 Đã bật Giãn Dòng & Cỡ Chữ Đọc Sách Thoải Mái" : "Đã về cỡ chữ chuẩn", "info");
    }
    this.refreshDetailPane();
  },

  toggleCandleMode(checked) {
    this.isCandleMode = checked;
    document.body.classList.toggle("candle-ambient-glow", this.isCandleMode);
    try {
      localStorage.setItem("dthu_dock_candle_mode", this.isCandleMode.toString());
    } catch (e) {}
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(this.isCandleMode ? "🕯️ Đã thắp Ánh Nến Lung Linh góc màn hình" : "Đã tắt ánh nến", "info");
    }
    this.refreshDetailPane();
  },

  toggleDndMode(checked) {
    this.isDndMode = checked;
    try {
      localStorage.setItem("dthu_dock_dnd_mode", this.isDndMode.toString());
    } catch (e) {}
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(this.isDndMode ? "🔇 Đã bật Chế Độ Yên Tĩnh Tuyệt Đối (DND)" : "Đã tắt chế độ yên tĩnh", "info");
    }
    this.refreshDetailPane();
  },

  // ── 🥠 LOGIC BỐC QUẺ 1 LẦN/NGÀY CHUẨN GMT+7 ──────────────
  drawDailyFortune() {
    const todayStr = this.getVietnamTodayStr();

    try {
      const stored = localStorage.getItem("dthu_dock_daily_fortune_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.date === todayStr) {
          if (typeof UIHelpers !== "undefined") {
            UIHelpers.showToast("Bạn đã bốc quẻ ngày hôm nay rồi! Hãy chờ 00:00 để mở quẻ mới nhé!", "warning");
          }
          return;
        }
      }
    } catch (e) {}

    AudioFXService.playSuccess();
    const randomIndex = Math.floor(Math.random() * this.fortunesList.length);
    const fortune = this.fortunesList[randomIndex];

    try {
      localStorage.setItem("dthu_dock_daily_fortune_v2", JSON.stringify({
        date: todayStr,
        fortune: fortune
      }));
    } catch (e) {}

    this.refreshDetailPane();
    this.refreshMasterList();
  },

  // ── 🧲 KÉO THẢ HÚT CẠNH & TỰ MỜ KHI NGHỈ ─────────────────
  initDraggableDock() {
    const btn = document.getElementById("floatingGuideBtn");
    if (!btn) return;

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
      const minTop = 64;
      const maxTop = Math.max(minTop, window.innerHeight - btnH - 24);

      let clampedLeft = Math.max(minLeft, Math.min(left, maxLeft));
      let clampedTop = Math.max(minTop, Math.min(top, maxTop));

      if (animate) {
        btn.style.transition = "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.25s ease, opacity 0.3s ease, transform 0.3s ease";
      } else {
        btn.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      }

      btn.style.left = `${clampedLeft}px`;
      btn.style.top = `${clampedTop}px`;
      btn.style.right = "auto";
      btn.style.bottom = "auto";

      return { left: clampedLeft, top: clampedTop };
    };

    const initPos = () => {
      const isAllowed = StudyDockView.isUserAllowed();
      btn.style.display = isAllowed ? "flex" : "none";
      if (!isAllowed) return;

      const btnW = btn.offsetWidth || 120;
      const btnH = btn.offsetHeight || 40;
      if (savedPos && typeof savedPos.left === "number" && typeof savedPos.top === "number") {
        clampAndSetPosition(savedPos.left, savedPos.top, false);
      } else {
        const defaultLeft = window.innerWidth - btnW - 20;
        const defaultTop = window.innerHeight - btnH - 30;
        clampAndSetPosition(defaultLeft, defaultTop, false);
      }
    };
    setTimeout(initPos, 60);

    let isPointerDown = false;
    let isDragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    const onPointerStart = (clientX, clientY) => {
      if (!StudyDockView.isUserAllowed()) return;
      StudyDockView.resetIdleTimer();
      const rect = btn.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      startLeft = rect.left;
      startTop = rect.top;
      isPointerDown = true;
      isDragging = false;
    };

    const onPointerMove = (clientX, clientY, e) => {
      if (!isPointerDown) return;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (!isDragging && Math.hypot(dx, dy) > 6) {
        isDragging = true;
        btn.classList.add("is-dragging");
        btn.classList.remove("dock-is-idle");
      }

      if (isDragging) {
        if (e && e.cancelable) e.preventDefault();
        const btnRect = btn.getBoundingClientRect();
        const minLeft = 10;
        const maxLeft = Math.max(minLeft, window.innerWidth - btnRect.width - 10);
        const minTop = 60;
        const maxTop = Math.max(minTop, window.innerHeight - btnRect.height - 18);

        const currentLeft = Math.max(minLeft, Math.min(startLeft + dx, maxLeft));
        const currentTop = Math.max(minTop, Math.min(startTop + dy, maxTop));

        btn.style.left = `${currentLeft}px`;
        btn.style.top = `${currentTop}px`;
      }
    };

    const onPointerEnd = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      btn.classList.remove("is-dragging");

      if (!isDragging) {
        if (!StudyDockView.isUserAllowed()) {
          if (typeof App !== "undefined" && typeof App.showToast === "function") {
            App.showToast("🔒 Trung tâm Tiện ích học tập và Dynamic Island chỉ dành cho thành viên đã đăng nhập!", "info", 3500);
          }
          return;
        }
        StudyDockView.toggle();
        return;
      }

      const rect = btn.getBoundingClientRect();
      const btnW = rect.width || 120;
      const btnH = rect.height || 40;
      const centerX = rect.left + btnW / 2;

      let targetLeft = 16;
      if (centerX >= window.innerWidth / 2) {
        targetLeft = window.innerWidth - btnW - 16;
      }

      const minTop = 64;
      const maxTop = Math.max(minTop, window.innerHeight - btnH - 24);
      const targetTop = Math.max(minTop, Math.min(rect.top, maxTop));

      const finalPos = clampAndSetPosition(targetLeft, targetTop, true);
      try {
        localStorage.setItem("dthu_guide_btn_pos", JSON.stringify(finalPos));
      } catch (e) {}

      StudyDockView.resetIdleTimer();
    };

    btn.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      onPointerStart(e.clientX, e.clientY);
      const onMove = (ev) => onPointerMove(ev.clientX, ev.clientY, ev);
      const onUp = () => {
        onPointerEnd();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });

    btn.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      onPointerStart(t.clientX, t.clientY);
    }, { passive: true });

    btn.addEventListener("touchmove", (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      onPointerMove(t.clientX, t.clientY, e);
    }, { passive: false });

    btn.addEventListener("touchend", onPointerEnd);
    btn.addEventListener("touchcancel", onPointerEnd);
  },

  resetIdleTimer() {
    const btn = document.getElementById("floatingGuideBtn");
    if (btn) btn.classList.remove("dock-is-idle");

    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (!this.isOpen && btn && !btn.classList.contains("is-dragging")) {
        btn.classList.add("dock-is-idle");
      }
    }, 3500);
  },

  bindEvents() {
    const btn = document.getElementById("floatingGuideBtn");
    if (btn) {
      btn.addEventListener("mouseenter", () => btn.classList.remove("dock-is-idle"));
      btn.addEventListener("mouseleave", () => this.resetIdleTimer());
    }

    const modal = document.getElementById("dockModal");
    if (modal) {
      modal.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
      modal.addEventListener("touchmove", (e) => e.stopPropagation(), { passive: true });
    }

    document.addEventListener("click", (e) => {
      const target = e.target.closest("button, .option-btn, .option-item, .nav-btn, .card, .btn");
      if (target && AudioFXService.isKeySoundEnabled) {
        AudioFXService.playKeyClick();
      }
      this.resetIdleTimer();
    }, { passive: true });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  },

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
};

window.StudyDockView = StudyDockView;
