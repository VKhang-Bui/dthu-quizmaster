/**
 * SHINORA FLOATING STUDY DOCK (TRUNG TÂM TIỆN ÍCH HỌC TẬP NỔI ĐA NĂNG)
 * Phiên bản: v3.2.2 Pro
 * Kiến trúc giao diện: Cửa sổ kép Master-Detail (Cửa sổ gốc menu bên trái + Cửa sổ con trượt mở sang bên phải)
 */

const StudyDockView = {
  isOpen: false,
  activeDetailId: "pomodoro", // 'pomodoro' | 'calculator' | 'notes' | 'sounds' | 'keysound' | 'experience' | 'fortune' | 'cheatsheet'
  isDetailOpen: true, // Mặc định mở cửa sổ con song song trên Desktop
  isZenMode: false,
  isWarmFilter: false,
  isIdle: false,
  idleTimer: null,
  countdownInterval: null,

  // Trạng thái Pomodoro
  pomodoro: {
    mode: "work", // 'work' | 'shortBreak' | 'longBreak'
    durations: { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
    timeLeft: 25 * 60,
    isRunning: false,
    timerId: null,
    totalSessionsCompleted: 0
  },

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
    this.renderContainer();
    this.bindEvents();
    this.initDraggableDock();
    this.restoreSavedStates();
    this.resetIdleTimer();
    this.startMidnightCountdownWatcher();
  },

  restoreSavedStates() {
    try {
      const savedCount = localStorage.getItem("dthu_dock_pomodoro_count");
      if (savedCount) {
        this.pomodoro.totalSessionsCompleted = parseInt(savedCount, 10) || 0;
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

    container.innerHTML = `
      <!-- Nút Nổi Viên Thuốc Đa Năng -->
      <div class="floating-dock-pill" id="floatingGuideBtn" role="button" aria-label="Trung tâm tiện ích học tập" title="💡 Nhấp để mở Tiện ích · Nhấn giữ để kéo thả">
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

    return `
      <div class="detail-box">
        <div class="pomo-mode-selector">
          <button class="pomo-mode-btn ${p.mode === 'work' ? 'active' : ''}" onclick="StudyDockView.setPomodoroMode('work')">📚 Học (25p)</button>
          <button class="pomo-mode-btn ${p.mode === 'shortBreak' ? 'active' : ''}" onclick="StudyDockView.setPomodoroMode('shortBreak')">☕ Nghỉ (5p)</button>
          <button class="pomo-mode-btn ${p.mode === 'longBreak' ? 'active' : ''}" onclick="StudyDockView.setPomodoroMode('longBreak')">🌴 Nghỉ (15p)</button>
        </div>

        <div class="pomo-display-card">
          <div class="pomo-time-display" id="pomoTimeDisplay">${this.formatTime(p.timeLeft)}</div>
          <div class="pomo-progress-track">
            <div class="pomo-progress-bar" id="pomoProgressBar" style="width: ${progressPercent}%;"></div>
          </div>
          <p class="pomo-sub-label">${p.mode === 'work' ? '🎯 Hiệp học tập trung cao độ' : '☕ Thư giãn mắt & hít thở sâu'}</p>
        </div>

        <div class="pomo-actions">
          ${p.isRunning ? `
            <button class="pomo-action-btn btn-pause" onclick="StudyDockView.pausePomodoro()">⏸️ Tạm dừng</button>
          ` : `
            <button class="pomo-action-btn btn-start" onclick="StudyDockView.startPomodoro()">▶️ Bắt đầu hiệp học</button>
          `}
          <button class="pomo-action-btn btn-reset" onclick="StudyDockView.resetPomodoro()">🔄 Đặt lại</button>
        </div>

        <div class="detail-footer-note">
          🏆 Đã hoàn thành: <strong>${p.totalSessionsCompleted} hiệp Pomodoro</strong>
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
              <strong>Kích Hoạt Âm Phím Cơ</strong>
              <p>Phát âm thanh khi click chọn đáp án hoặc bấm phím</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${isKey ? 'checked' : ''} onchange="StudyDockView.toggleKeySound(this.checked)">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <h5 class="section-sub-title">Chọn loại Switch bàn phím cơ:</h5>
        <div class="key-sound-options">
          <label class="key-switch-pill ${keyProfile === 'clicky' ? 'active' : ''}">
            <input type="radio" name="keySwitchType" value="clicky" ${keyProfile === 'clicky' ? 'checked' : ''} onchange="StudyDockView.setKeySoundProfile('clicky')">
            <div class="switch-text">
              <strong>🔵 Blue Switch (Clicky Đanh Giòn)</strong>
              <span>Âm thanh đanh, tiếng clicky rõ ràng, đã tai khi bấm đáp án</span>
            </div>
          </label>

          <label class="key-switch-pill ${keyProfile === 'thock' ? 'active' : ''}">
            <input type="radio" name="keySwitchType" value="thock" ${keyProfile === 'thock' ? 'checked' : ''} onchange="StudyDockView.setKeySoundProfile('thock')">
            <div class="switch-text">
              <strong>🟤 Cream Switch (Thock Trầm Ấm)</strong>
              <span>Âm thanh thock đầm ấm, êm dịu, không gây ồn khi cày đêm</span>
            </div>
          </label>
        </div>
      </div>
    `;
  },

  // ── DETAIL 6: TRẢI NGHIỆM & ĐÈN ĐÊM ───────────────────────
  renderExperienceDetail() {
    return `
      <div class="detail-box">
        <div class="view-toggles-list">
          <div class="sound-card">
            <div class="sound-card-top">
              <span class="sound-icon">🧘</span>
              <div class="sound-info">
                <strong>Chế Độ Zen Focus Toàn Màn Hình</strong>
                <p>Ẩn thanh điều hướng và footer, mở rộng trang đọc đề</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${this.isZenMode ? 'checked' : ''} onchange="StudyDockView.toggleZenMode(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="sound-card">
            <div class="sound-card-top">
              <span class="sound-icon">🌙</span>
              <div class="sound-info">
                <strong>Lọc Ánh Sáng Đêm (Amber Warm)</strong>
                <p>Phủ lớp lọc màu ấm bảo vệ mắt khi ôn bài lúc 1-2h sáng</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${this.isWarmFilter ? 'checked' : ''} onchange="StudyDockView.toggleWarmFilter(this.checked)">
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
  setPomodoroMode(mode) {
    if (this.pomodoro.isRunning) this.pausePomodoro();
    this.pomodoro.mode = mode;
    this.pomodoro.timeLeft = this.pomodoro.durations[mode];
    this.refreshDetailPane();
    this.refreshMasterList();
    this.updatePillBadge();
  },

  startPomodoro() {
    if (this.pomodoro.isRunning) return;
    this.pomodoro.isRunning = true;
    AudioFXService.playKeyClick();

    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.pushActivity === "function") {
      DynamicIsland.pushActivity({
        id: "pomodoro",
        type: "pomodoro",
        priority: 2,
        icon: "🍅",
        title: "Pomodoro",
        subtitle: this.formatTime(this.pomodoro.timeLeft)
      });
    }

    this.pomodoro.timerId = setInterval(() => {
      if (this.pomodoro.timeLeft > 0) {
        this.pomodoro.timeLeft--;
        this.updatePillBadge();

        if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.updateActivity === "function") {
          DynamicIsland.updateActivity("pomodoro", {
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
      } else {
        this.finishPomodoro();
      }
    }, 1000);

    this.updatePillBadge();
    this.refreshDetailPane();
    this.refreshMasterList();
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
  },

  resetPomodoro() {
    this.pausePomodoro();
    this.pomodoro.timeLeft = this.pomodoro.durations[this.pomodoro.mode];
    this.updatePillBadge();
    this.refreshDetailPane();
    this.refreshMasterList();
  },

  finishPomodoro() {
    this.pausePomodoro();
    AudioFXService.playBell();

    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.flashActivity === "function") {
      DynamicIsland.flashActivity({
        id: "pomodoro-done-" + Date.now(),
        type: "combo",
        priority: 4,
        icon: "🔔",
        title: "Hoàn thành hiệp Pomodoro!",
        subtitle: this.pomodoro.mode === "work" ? "Hãy thư giãn mắt 5 phút nhé" : "Bắt đầu hiệp học tập trung mới"
      }, 4000);
    }

    if (this.pomodoro.mode === "work") {
      this.pomodoro.totalSessionsCompleted++;
      try {
        localStorage.setItem("dthu_dock_pomodoro_count", this.pomodoro.totalSessionsCompleted.toString());
      } catch (e) {}

      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast("🎉 Xuất sắc! Bạn đã hoàn thành 1 hiệp Pomodoro 25 phút. Hãy nghỉ ngơi 5 phút nhé!", "success", 6000);
      }
      this.setPomodoroMode("shortBreak");
    } else {
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast("🔔 Hết giờ giải lao! Bắt đầu hiệp học tập trung mới nhé!", "info", 5000);
      }
      this.setPomodoroMode("work");
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

  toggleZenMode(checked) {
    this.isZenMode = checked;
    document.body.classList.toggle("zen-focus-active", this.isZenMode);
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(this.isZenMode ? "🧘 Đã bật Chế độ Zen Focus (Ẩn điều hướng)" : "Đã thoát Chế độ Zen Focus", "info");
    }
    this.refreshDetailPane();
  },

  toggleWarmFilter(checked) {
    this.isWarmFilter = checked;
    const overlay = document.getElementById("studyWarmFilterOverlay");
    if (overlay) {
      overlay.classList.toggle("active", this.isWarmFilter);
    }
    try {
      localStorage.setItem("dthu_dock_warm_filter", this.isWarmFilter.toString());
    } catch (e) {}
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
