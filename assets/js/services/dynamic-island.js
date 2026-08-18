/**
 * SHINORA DYNAMIC ISLAND (ĐẢO ĐỘNG THÔNG MINH TRÊN WEB)
 * Tác giả: Shina Sanora
 * 
 * Tính năng chính:
 * 1. 🏝️ 4 Trạng thái biến hình (Stealth Notch -> Compact Pill -> Expanded Bar -> Full Widget Popover)
 * 2. 🥷 Stealth Notch (Vạch Ẩn Tối Thượng): Tự động co lên đỉnh màn hình thành vạch 4px sau 10s-30s
 * 3. 🎨 Vector SVG Design System: 100% icon SVG sắc nét, đồng bộ phong cách, không dùng emoji thô
 * 4. ✂️ Split Mode: Tự động chia 2 nửa khi có 2 hoạt động ngầm (Nhạc Lofi + Pomodoro đếm giờ)
 * 5. 🎵 YouTube IFrame API ngầm (1x1px): Nghe nhạc học tập, Seekbar tua bài, Hẹn giờ tắt, Tốc độ phát
 * 6. 🍅 Live Activity: Đồng bộ thời gian thực Pomodoro & Đồng hồ đếm ngược phòng thi
 * 7. 🔥 Gamification: Flash combo streak đúng liên tiếp & Cảnh báo rời phòng thi
 * 8. 📱 Thumb-Zone trên Mobile: Tự động lật xuống mép dưới cho dễ chạm
 * 9. 🛡️ Circuit Breaker chống lặp lỗi phát nhạc vô tận & Bộ tùy biến màu sắc, kích thước, thời gian ẩn
 */

const DynamicIsland = {
  // ── Trạng thái hiển thị ──
  currentState: "compact", // 'stealth' | 'compact' | 'expanded' | 'full' | 'hidden'
  activeTab: "music",      // 'music' | 'activity' | 'presets' | 'settings'
  playerSubView: "main",   // 'main' | 'settings' | 'sleepTimer' | 'speed' | 'volume'
  isHovered: false,
  hoverTimer: null,
  flashTimer: null,
  stealthTimer: null,
  timeUpdaterInterval: null,
  errorRetryCount: 0,

  // ── Hàng đợi hoạt động ngầm (Live Activities Queue) ──
  activities: [], 

  // ── HỆ THỐNG ICON SVG ĐỒNG BỘ CAO CẤP (RAZOR-SHARP VECTOR ICONS) ──
  icons: {
    music: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
    play: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"></rect><rect x="14" y="4" width="4" height="16" rx="1.5"></rect></svg>`,
    skipBack: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>`,
    skipForward: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>`,
    maximize: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>`,
    gear: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    heart: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    heartFilled: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="#ec4899" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    thumbsDown: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>`,
    timer: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    speed: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    volume: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
    volumeLow: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
    chevronLeft: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    chevronRight: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    close: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    check: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    activity: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
    radio: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>`,
    island: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="10" rx="5"></rect><circle cx="8" cy="12" r="1.5" fill="currentColor"></circle></svg>`,
    brain: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z"></path></svg>`,
    coffee: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
    piano: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="6" y1="4" x2="6" y2="12"></line><line x1="10" y1="4" x2="10" y2="12"></line><line x1="14" y1="4" x2="14" y2="12"></line><line x1="18" y1="4" x2="18" y2="12"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>`,
    sparkles: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"></path></svg>`,
    rain: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
    sliders: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>`,
    search: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    video: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="14" height="16" rx="2"></rect><polygon points="23 7 16 12 23 17 23 7"></polygon></svg>`,
    minimize: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"></path><path d="M20 10h-6V4"></path><path d="M14 10l7-7"></path><path d="M3 21l7-7"></path></svg>`
  },

  // ── YouTube Player State ──
  ytPlayer: null,
  isYtApiReady: false,
  isVideoPipOpen: false,
  isPipMinimized: false,
  selectedCategory: "all",
  searchQuery: "",
  isSearchingOnline: false,
  isLoadingMore: false,
  hasMoreOnlineResults: true,
  searchPage: 1,
  onlineSearchResults: [],
  searchDebounceTimer: null,

  currentTrack: {
    id: "WPni755-Krg", // Mặc định: Sóng Não Alpha Tập Trung Sâu
    title: "Sóng Não Alpha — Kích Thích Não Bộ Tập Trung Sâu",
    artist: "Alpha Waves Focus",
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 70,
    playbackRate: 1.0,
    isMuted: false,
    isLiked: false,
    isDisliked: false
  },

  // ── Hẹn Giờ Tắt Nhạc (Sleep Timer) ──
  sleepTimer: {
    minutes: 0,
    timeRemainingSeconds: 0,
    intervalId: null
  },

  // ── Bộ nhớ bài hát yêu thích & Gần đây ──
  likedTracks: {},
  recentTracks: [],

  // Danh mục phân loại thông minh
  categories: [
    { id: "all", name: "Tất Cả" },
    { id: "lofi", name: "☕ Lo-Fi & Chill" },
    { id: "brain", name: "🧠 Sóng Não Sâu" },
    { id: "piano", name: "🎹 Piano Cổ Điển" },
    { id: "nature", name: "🌧️ Mưa & Quán Cafe" },
    { id: "favorites", name: "❤️ Yêu Thích" }
  ],

  // Kho tuyển tập bài học & nhạc gợi ý (100% Stream chuẩn hoạt động 24/7 trên YouTube)
  presets: [
    // ☕ Lo-Fi & Chill
    { id: "jfKfPfyJRdk", title: "Lofi Hip Hop Radio — Beats to Relax & Study", artist: "Lofi Girl", category: "lofi", iconType: "music", tag: "Lofi Girl" },
    { id: "5yx6BWlEVcY", title: "Coffee Shop Chillhop Beats 24/7", artist: "Chillhop Music", category: "lofi", iconType: "coffee", tag: "Chillhop" },
    
    // 🧠 Sóng Não Sâu
    { id: "WPni755-Krg", title: "Sóng Não Alpha — Kích Thích Não Bộ Tập Trung Sâu", artist: "Alpha Waves Focus", category: "brain", iconType: "brain", tag: "Alpha 432Hz" },
    { id: "DWcJFNfaw9c", title: "Super Intelligence Binaural Beats Focus", artist: "Deep Brain Focus", category: "brain", iconType: "sparkles", tag: "Binaural" },

    // 🎹 Piano & Cổ Điển
    { id: "lTRiuFIWV54", title: "Classical Piano for Studying — Mozart & Beethoven", artist: "Halidon Music", category: "piano", iconType: "piano", tag: "Piano Cổ Điển" },
    { id: "4xDzrJKXOOY", title: "Relaxing Piano Music for Stress Relief & Focus", artist: "RelaxCafe Piano", category: "piano", iconType: "piano", tag: "Piano Êm Dịu" },

    // 🌧️ Mưa & Quán Cafe
    { id: "mPZkdNFkNps", title: "Mưa Rào Đêm + Nhạc Jazz Êm Dịu", artist: "Rainy Jazz Cafe", category: "nature", iconType: "rain", tag: "Rain & Jazz" },
    { id: "eX0b3P1kL64", title: "Tiếng Mưa Rơi Trên Cửa Kính + Lofi Chill", artist: "Cozy Rain Ambience", category: "nature", iconType: "rain", tag: "Cozy Rain" }
  ],

  // ── Cài đặt người dùng & Tùy biến sâu ──
  settings: {
    enabled: true,
    mobilePosition: "bottom", // 'bottom' | 'top'
    autoCollapseDelay: 3500,  // 1500 | 2500 | 3500 | 5000 | 0 (0 = không tự thu)
    stealthDelay: 30000,      // 0 (tắt) | 10000 | 20000 | 30000 | 60000 (Mặc định 30s)
    colorTheme: "purple",     // 'purple' | 'blue' | 'green' | 'oled'
    scaleSize: "md",          // 'sm' (90%) | 'md' (100%) | 'lg' (110%)
    autoSkipOnError: false,   // false (an toàn) | true (tự đổi 1 lần)
    enableOnExam: true,       // Hiện ở chế độ thi
    soundFx: true             // Âm thanh click
  },

  init() {
    this.loadSettings();
    this.renderContainer();
    this.bindEvents();
    this.initYouTubeApi();
    this.startTimeUpdater();
    this.restartStealthTimer();

    // Khởi tạo hoạt động mặc định nếu có
    this.updateDisplay();
  },

  loadSettings() {
    try {
      const saved = localStorage.getItem("dthu_dynamic_island_settings");
      if (saved) {
        this.settings = Object.assign(this.settings, JSON.parse(saved));
      }
      const savedTrack = localStorage.getItem("dthu_dynamic_island_last_track");
      if (savedTrack) {
        const parsed = JSON.parse(savedTrack);
        if (parsed && parsed.id) this.currentTrack.id = parsed.id;
      }
      const savedLiked = localStorage.getItem("dthu_dynamic_island_liked");
      if (savedLiked) {
        this.likedTracks = JSON.parse(savedLiked) || {};
      }
    } catch (e) {}

    // Cập nhật trạng thái like bài hiện tại
    if (this.likedTracks[this.currentTrack.id]) {
      this.currentTrack.isLiked = true;
    }
  },

  saveSettings() {
    try {
      localStorage.setItem("dthu_dynamic_island_settings", JSON.stringify(this.settings));
    } catch (e) {}
  },

  saveLikedTracks() {
    try {
      localStorage.setItem("dthu_dynamic_island_liked", JSON.stringify(this.likedTracks));
    } catch (e) {}
  },

  // ── 1. KHỞI TẠO DOM CONTAINER ──────────────────────────────
  renderContainer() {
    let container = document.getElementById("dynamicIslandContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "dynamicIslandContainer";
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <!-- Khung phát YouTube ẩn 1x1px ngầm -->
      <div id="ytHiddenPlayerWrapper" style="position: absolute; width: 1px; height: 1px; left: -9999px; top: -9999px; overflow: hidden; opacity: 0; pointer-events: none;">
        <div id="ytHiddenPlayer"></div>
      </div>

      <!-- CỬA SỔ NỔI VIDEO PICTURE-IN-PICTURE (NẾU BẬT) -->
      <div id="diFloatingVideoPip" style="display: none;">
        <div class="di-pip-bubble-icon" onclick="DynamicIsland.togglePipMinimize()" title="Bung lớn video bài giảng">
          ${this.icons.video(22)}
        </div>
        <div class="di-pip-header" id="diPipHeader">
          <span class="di-pip-title-text" id="diPipTitle">${this.escapeHtml(this.currentTrack.title)}</span>
          <div class="di-pip-actions">
            <button class="di-pip-btn" onclick="DynamicIsland.togglePipMinimize()" title="Thu nhỏ thành bong bóng">
              ${this.icons.minimize(13)}
            </button>
            <button class="di-pip-btn" onclick="DynamicIsland.closeVideoPip()" title="Đóng video nổi">
              ${this.icons.close(13)}
            </button>
          </div>
        </div>
        <div class="di-pip-body" id="diPipBody">
          <iframe id="diPipIframe" class="di-pip-iframe" src="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>

      <!-- Backdrop đóng đảo khi click ra ngoài (chỉ kích hoạt ở trạng thái full) -->
      <div class="dynamic-island-backdrop" id="diBackdrop" onclick="DynamicIsland.collapseToCompact()"></div>

      <!-- ĐẢO ĐỘNG CHÍNH (MORPHING ISLAND) -->
      <div class="dynamic-island ${this.currentState} theme-${this.settings.colorTheme || 'purple'} scale-${this.settings.scaleSize || 'md'} ${this.currentTrack.isPlaying ? 'is-playing' : ''} ${this.isMobile() && this.settings.mobilePosition === 'bottom' ? 'pos-bottom' : 'pos-top'}" 
           id="dynamicIslandPill" 
           style="${this.settings.enabled ? '' : 'display: none !important;'}"
           role="region" 
           aria-label="Đảo Động Thông Minh">
        <div class="di-inner-content" id="diInnerContent"></div>
      </div>
    `;
  },

  // ── 2. QUẢN LÝ HOẠT ĐỘNG NGẦM (ACTIVITIES QUEUE) ───────────
  pushActivity(activity) {
    if (!this.settings.enabled) return;
    const existingIndex = this.activities.findIndex(a => a.id === activity.id);
    activity.updatedAt = Date.now();

    if (existingIndex >= 0) {
      this.activities[existingIndex] = Object.assign(this.activities[existingIndex], activity);
    } else {
      this.activities.push(activity);
    }

    this.activities.sort((a, b) => (b.priority || 1) - (a.priority || 1));
    this.wakeFromStealth();
    this.updateDisplay();
  },

  updateActivity(id, dataUpdates) {
    if (!this.settings.enabled) return;
    const act = this.activities.find(a => a.id === id);
    if (act) {
      act.data = Object.assign(act.data || {}, dataUpdates);
      if (dataUpdates.subtitle !== undefined) act.subtitle = dataUpdates.subtitle;
      act.updatedAt = Date.now();
      this.updateDisplay();
    }
  },

  removeActivity(id) {
    this.activities = this.activities.filter(a => a.id !== id);
    this.updateDisplay();
  },

  flashActivity(activity, durationMs = 3000) {
    if (!this.settings.enabled) return;
    this.pushActivity(activity);
    this.setMorphState("expanded");

    const pill = document.getElementById("dynamicIslandPill");
    if (pill) {
      pill.classList.add("alert-glow");
      if (activity.type === "combo") pill.classList.add("glow-gold");
      else if (activity.type === "alert") pill.classList.add("glow-red");
    }

    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => {
      this.removeActivity(activity.id);
      if (pill) {
        pill.classList.remove("alert-glow", "glow-gold", "glow-red");
      }
      if (this.currentState === "expanded") {
        this.setMorphState("compact");
        this.restartStealthTimer();
      }
    }, durationMs);
  },

  // ── 3. STATE MACHINE & MORPHING CONTROLLER ────────────────
  setMorphState(nextState) {
    if (!this.settings.enabled) return;
    this.currentState = nextState;

    const pill = document.getElementById("dynamicIslandPill");
    const backdrop = document.getElementById("diBackdrop");

    if (!pill) return;

    pill.classList.remove("stealth", "compact", "expanded", "full", "split", "hidden");
    pill.classList.add(nextState);

    // Áp dụng theme và scale
    pill.classList.remove("theme-purple", "theme-blue", "theme-green", "theme-oled");
    pill.classList.add("theme-" + (this.settings.colorTheme || "purple"));

    pill.classList.remove("scale-sm", "scale-md", "scale-lg");
    pill.classList.add("scale-" + (this.settings.scaleSize || "md"));

    if (this.currentTrack.isPlaying) {
      pill.classList.add("is-playing");
    } else {
      pill.classList.remove("is-playing");
    }

    if (backdrop) {
      if (nextState === "full") backdrop.classList.add("active");
      else backdrop.classList.remove("active");
    }

    if (this.isMobile() && this.settings.mobilePosition === "bottom") {
      pill.classList.add("pos-bottom");
      pill.classList.remove("pos-top");
    } else {
      pill.classList.add("pos-top");
      pill.classList.remove("pos-bottom");
    }

    if (this.settings.soundFx && typeof AudioFXService !== "undefined" && AudioFXService.playKeyClick) {
      if (nextState === "full" || nextState === "compact") AudioFXService.playKeyClick();
    }

    this.renderCurrentState();
  },

  expandToFull(tab = "music") {
    this.activeTab = tab;
    this.playerSubView = "main";
    this.clearStealthTimer();
    this.setMorphState("full");
  },

  collapseToCompact() {
    this.playerSubView = "main";
    this.setMorphState("compact");
    this.restartStealthTimer();
  },

  // ── CHẾ ĐỘ STEALTH NOTCH (VẠCH ẨN TỐI THƯỢNG) ────────────
  wakeFromStealth() {
    if (this.currentState === "stealth") {
      this.setMorphState("compact");
    }
    this.restartStealthTimer();
  },

  goToStealth() {
    if (this.currentState === "compact" && !this.isHovered) {
      this.setMorphState("stealth");
    }
  },

  restartStealthTimer() {
    this.clearStealthTimer();
    const delay = this.settings.stealthDelay;
    if (delay > 0 && this.currentState !== "full") {
      this.stealthTimer = setTimeout(() => {
        if (!this.isHovered && this.currentState === "compact") {
          this.goToStealth();
        }
      }, delay);
    }
  },

  clearStealthTimer() {
    if (this.stealthTimer) {
      clearTimeout(this.stealthTimer);
      this.stealthTimer = null;
    }
  },

  updateDisplay() {
    const pill = document.getElementById("dynamicIslandPill");
    if (pill) {
      if (!this.settings.enabled) {
        pill.style.display = "none";
        return;
      } else {
        pill.style.display = "flex";
      }

      pill.classList.remove("theme-purple", "theme-blue", "theme-green", "theme-oled");
      pill.classList.add("theme-" + (this.settings.colorTheme || "purple"));

      pill.classList.remove("scale-sm", "scale-md", "scale-lg");
      pill.classList.add("scale-" + (this.settings.scaleSize || "md"));

      if (this.currentTrack.isPlaying) {
        pill.classList.add("is-playing");
      } else {
        pill.classList.remove("is-playing");
      }
    }
    this.renderCurrentState();
  },

  isMobile() {
    return window.innerWidth <= 768;
  },

  // ── 4. RENDER CÁC TRẠNG THÁI (STEALTH / COMPACT / EXPANDED / FULL) ──
  renderCurrentState() {
    if (!this.settings.enabled) return;
    const contentEl = document.getElementById("diInnerContent");
    if (!contentEl) return;

    if (this.currentState === "stealth") {
      contentEl.innerHTML = this.renderStealthView();
    } else if (this.currentState === "compact") {
      contentEl.innerHTML = this.renderCompactView();
    } else if (this.currentState === "expanded") {
      contentEl.innerHTML = this.renderExpandedView();
    } else if (this.currentState === "full") {
      contentEl.innerHTML = this.renderFullWidgetView();
    }
  },

  // ── 4.0 STEALTH VIEW (Vạch mỏng đỉnh màn hình) ─────────────
  renderStealthView() {
    const isPlaying = this.currentTrack.isPlaying;
    return `
      <div class="di-stealth-notch" onclick="DynamicIsland.wakeFromStealth()" title="Rê chuột hoặc chạm để mở Đảo Động">
        <span class="di-stealth-line ${isPlaying ? 'pulse' : ''}"></span>
      </div>
    `;
  },

  // ── 4.1 COMPACT VIEW (Thu nhỏ) ─────────────────────────────
  renderCompactView() {
    const isPlaying = this.currentTrack.isPlaying;
    const topActivity = this.activities[0];

    // SPLIT MODE: Đang phát nhạc + có 1 Activity (VD: Pomodoro)
    if (isPlaying && topActivity) {
      return `
        <div class="di-compact-split" onclick="DynamicIsland.expandToFull('music')">
          <div class="di-split-left">
            <span class="di-music-dot playing"></span>
            <span class="di-wave-bars active">
              <i></i><i></i><i></i>
            </span>
          </div>
          <div class="di-split-divider"></div>
          <div class="di-split-right">
            <span class="di-act-icon">${this.icons.timer(14)}</span>
            <span class="di-act-text">${topActivity.subtitle || topActivity.title}</span>
          </div>
        </div>
      `;
    }

    // Nếu có 1 Activity nổi bật (Pomodoro hoặc Quiz Timer)
    if (topActivity) {
      return `
        <div class="di-compact-pill" onclick="DynamicIsland.expandToFull('activity')">
          <span class="di-pill-icon">${this.icons.timer(15)}</span>
          <span class="di-pill-title">${topActivity.title}</span>
          ${topActivity.subtitle ? `<span class="di-pill-badge">${topActivity.subtitle}</span>` : ''}
        </div>
      `;
    }

    // Nếu đang phát nhạc: Chỉ hiện gọn biểu tượng phát + sóng nhạc
    if (isPlaying) {
      return `
        <div class="di-compact-pill di-compact-playing-pill" onclick="DynamicIsland.expandToFull('music')">
          <span class="di-live-dot"></span>
          <span class="di-live-label">Đang phát</span>
          <span class="di-wave-bars active">
            <i></i><i></i><i></i>
          </span>
        </div>
      `;
    }

    // Mặc định: Trạng thái sẵn sàng
    return `
      <div class="di-compact-pill" onclick="DynamicIsland.expandToFull('music')">
        <span class="di-island-icon">${this.icons.island(15)}</span>
        <span class="di-pill-title">Shinora Island</span>
        <span class="di-pill-hint">${this.icons.chevronRight(13)}</span>
      </div>
    `;
  },

  // ── 4.2 EXPANDED VIEW (Mở rộng trung bình khi Hover) ───────
  renderExpandedView() {
    const isPlaying = this.currentTrack.isPlaying;
    const topActivity = this.activities[0];

    // Nếu có activity khẩn cấp (Combo / Cảnh báo)
    if (topActivity && (topActivity.priority >= 4)) {
      return `
        <div class="di-expanded-alert" onclick="DynamicIsland.expandToFull('activity')">
          <span class="di-alert-icon">${this.icons.sparkles(18)}</span>
          <div class="di-alert-info">
            <strong>${topActivity.title}</strong>
            <p>${topActivity.subtitle || ''}</p>
          </div>
        </div>
      `;
    }

    // Thanh điều khiển nhạc nhanh với nút inline
    return `
      <div class="di-expanded-bar">
        <div class="di-exp-left" onclick="DynamicIsland.expandToFull('music')">
          <span class="di-exp-thumb">${this.icons.music(14)}</span>
          <div class="di-exp-text">
            <strong class="di-truncate-text">${this.escapeHtml(this.currentTrack.title)}</strong>
          </div>
        </div>

        <div class="di-exp-controls">
          <button class="di-ctrl-btn" onclick="DynamicIsland.playPrevPreset(event)" title="Bài trước">
            ${this.icons.skipBack(14)}
          </button>
          <button class="di-ctrl-btn di-ctrl-btn-play" onclick="DynamicIsland.togglePlayPause(event)" title="${isPlaying ? 'Tạm dừng' : 'Phát'}">
            ${isPlaying ? this.icons.pause(14) : this.icons.play(14)}
          </button>
          <button class="di-ctrl-btn" onclick="DynamicIsland.playNextPreset(event)" title="Bài tiếp">
            ${this.icons.skipForward(14)}
          </button>
          <button class="di-ctrl-btn di-ctrl-btn-expand" onclick="DynamicIsland.expandToFull('music')" title="Mở toàn màn hình">
            ${this.icons.maximize(13)}
          </button>
        </div>
      </div>
    `;
  },

  // ── 4.3 FULL WIDGET VIEW (Bung toàn diện) ─────────────────
  renderFullWidgetView() {
    return `
      <div class="di-full-widget">
        <!-- Header đảo -->
        <div class="di-full-header">
          <div class="di-header-tabs">
            <button class="di-tab-btn ${this.activeTab === 'music' ? 'active' : ''}" onclick="DynamicIsland.switchTab('music')">
              ${this.icons.music(14)} <span>Đang Phát</span>
            </button>
            <button class="di-tab-btn ${this.activeTab === 'presets' ? 'active' : ''}" onclick="DynamicIsland.switchTab('presets')">
              ${this.icons.search(14)} <span>Khám Phá & Tìm Kiếm</span>
            </button>
            <button class="di-tab-btn ${this.activeTab === 'activity' ? 'active' : ''}" onclick="DynamicIsland.switchTab('activity')">
              ${this.icons.timer(14)} <span>Tiến Trình (${this.activities.length})</span>
            </button>
            <button class="di-tab-btn ${this.activeTab === 'settings' ? 'active' : ''}" onclick="DynamicIsland.switchTab('settings')">
              ${this.icons.gear(14)} <span>Tùy Biến</span>
            </button>
          </div>
          <button class="di-close-btn" onclick="DynamicIsland.collapseToCompact()" title="Thu nhỏ">
            ${this.icons.close(14)}
          </button>
        </div>

        <!-- Body tab -->
        <div class="di-full-body">
          ${this.renderActiveTabContent()}
        </div>
      </div>
    `;
  },

  renderActiveTabContent() {
    switch (this.activeTab) {
      case "music": return this.renderMusicTab();
      case "activity": return this.renderActivityTab();
      case "presets": return this.renderPresetsTab();
      case "settings": return this.renderSettingsTab();
      default: return this.renderMusicTab();
    }
  },

  // ── TAB: PHÁT NHẠC VÀ CÁC KHỐI CON (SUB-PANELS) ────────────
  renderMusicTab() {
    switch (this.playerSubView) {
      case "settings": return this.renderPlayerSettingsSubPanel();
      case "sleepTimer": return this.renderSleepTimerSubPanel();
      case "speed": return this.renderPlaybackSpeedSubPanel();
      case "volume": return this.renderVolumeSubPanel();
      case "main":
      default:
        return this.renderPlayerMainPanel();
    }
  },

  // 1. Khối Trình Phát Chính
  renderPlayerMainPanel() {
    const t = this.currentTrack;
    const isPlaying = t.isPlaying;
    const curTimeFormatted = this.formatSeconds(t.currentTime);
    const durTimeFormatted = t.duration > 0 ? this.formatSeconds(t.duration) : "--:--";
    const seekPercent = t.duration > 0 ? Math.floor((t.currentTime / t.duration) * 100) : 0;

    return `
      <div class="di-music-player">
        <!-- Đĩa than / Animation xoay -->
        <div class="di-player-top">
          <div class="di-vinyl-disc ${isPlaying ? 'spinning' : ''}">
            <div class="di-vinyl-center">${this.icons.music(15)}</div>
          </div>
          <div class="di-player-info">
            <h5 class="di-track-name" title="${this.escapeHtml(t.title)}">${this.escapeHtml(t.title)}</h5>
            <p class="di-artist-name">${this.escapeHtml(t.artist)}</p>
            <div class="di-player-badge">
              <span class="badge-dot ${isPlaying ? 'online' : ''}"></span>
              <span>${isPlaying ? 'Đang phát' : 'Tạm dừng'}</span>
              ${this.sleepTimer.minutes > 0 ? `· <span class="di-sleep-badge">${this.icons.timer(12)} Tắt sau ${this.formatSeconds(this.sleepTimer.timeRemainingSeconds)}</span>` : ''}
              ${t.playbackRate !== 1.0 ? `· <span class="di-speed-badge">${this.icons.speed(12)} ${t.playbackRate}x</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Thanh tua bài hát (Seekbar / Scrubber) -->
        <div class="di-seekbar-row">
          <span class="di-time-label" id="diCurrentTime">${curTimeFormatted}</span>
          <input type="range" class="di-seek-slider" id="diSeekSlider" min="0" max="100" value="${seekPercent}" oninput="DynamicIsland.handleSeek(this.value)">
          <span class="di-time-label" id="diDurationTime">${durTimeFormatted}</span>
        </div>

        <!-- Cụm Nút Điều Khiển Chính -->
        <div class="di-player-controls-row">
          <button class="di-ctrl-icon-btn" onclick="DynamicIsland.playPrevPreset()" title="Bài trước">
            ${this.icons.skipBack(16)}
          </button>
          <button class="di-ctrl-main-btn" onclick="DynamicIsland.togglePlayPause()" title="${isPlaying ? 'Tạm dừng' : 'Phát'}">
            ${isPlaying ? `${this.icons.pause(15)} <span>Tạm Dừng</span>` : `${this.icons.play(15)} <span>Phát Nhạc</span>`}
          </button>
          <button class="di-ctrl-icon-btn" onclick="DynamicIsland.playNextPreset()" title="Bài tiếp">
            ${this.icons.skipForward(16)}
          </button>
          <button class="di-ctrl-icon-btn" onclick="DynamicIsland.setPlayerSubView('settings')" title="Cài đặt phát (Hẹn giờ, Tốc độ, Âm lượng)">
            ${this.icons.sliders(16)}
          </button>
        </div>

        <!-- Cụm Nút Thả Cảm Xúc Like & Chuyển Video Nổi PiP -->
        <div class="di-reaction-row">
          <button class="di-reaction-btn ${t.isLiked ? 'active-liked' : ''}" onclick="DynamicIsland.toggleLike()">
            ${t.isLiked ? `${this.icons.heartFilled(14)} <span>Đã thích</span>` : `${this.icons.heart(14)} <span>Yêu thích</span>`}
          </button>
          <button class="di-reaction-btn ${this.isVideoPipOpen ? 'active-liked' : ''}" onclick="DynamicIsland.toggleVideoPip()" title="Mở video nổi để vừa học vừa xem bài giảng/hình vẽ">
            ${this.icons.video(14)} <span>${this.isVideoPipOpen ? 'Đang bật PiP' : 'Xem Video Nổi'}</span>
          </button>
          <button class="di-reaction-btn" onclick="DynamicIsland.switchTab('presets')" title="Tìm bài hát / bài giảng khác">
            ${this.icons.search(14)} <span>Tìm kiếm</span>
          </button>
        </div>

        <!-- Ô dán link YouTube dự phòng (tùy chọn) -->
        <div class="di-custom-url-box">
          <input type="text" id="diCustomYtInput" placeholder="Tìm kiếm hoặc dán link YouTube..." onkeydown="if(event.key==='Enter') DynamicIsland.handleCustomInput()">
          <button onclick="DynamicIsland.handleCustomInput()">Phát Ngay</button>
        </div>
      </div>
    `;
  },

  // 2. Khối Menu Cài Đặt Trình Phát (Sub-panel Settings)
  renderPlayerSettingsSubPanel() {
    const sleepLabel = this.sleepTimer.minutes > 0 ? `Còn ${Math.ceil(this.sleepTimer.timeRemainingSeconds / 60)}p` : "Đang tắt";
    const speedLabel = `${this.currentTrack.playbackRate}x`;
    const volLabel = `${this.currentTrack.volume}%`;

    return `
      <div class="di-sub-panel">
        <div class="di-sub-header">
          <button class="di-sub-back-btn" onclick="DynamicIsland.setPlayerSubView('main')">
            ${this.icons.chevronLeft(14)} <span>Quay lại</span>
          </button>
          <h5>Cài Đặt Trình Phát</h5>
        </div>

        <div class="di-sub-menu-list">
          <div class="di-sub-menu-item" onclick="DynamicIsland.setPlayerSubView('sleepTimer')">
            <div class="di-menu-item-left">
              <span class="di-menu-icon">${this.icons.timer(16)}</span>
              <div>
                <strong>Hẹn Giờ Tắt Nhạc</strong>
                <p>Tự động dừng phát nhạc khi hết giờ</p>
              </div>
            </div>
            <span class="di-menu-val">${sleepLabel} ${this.icons.chevronRight(13)}</span>
          </div>

          <div class="di-sub-menu-item" onclick="DynamicIsland.setPlayerSubView('speed')">
            <div class="di-menu-item-left">
              <span class="di-menu-icon">${this.icons.speed(16)}</span>
              <div>
                <strong>Tốc Độ Phát</strong>
                <p>Điều chỉnh tốc độ âm thanh chuẩn</p>
              </div>
            </div>
            <span class="di-menu-val">${speedLabel} ${this.icons.chevronRight(13)}</span>
          </div>

          <div class="di-sub-menu-item" onclick="DynamicIsland.setPlayerSubView('volume')">
            <div class="di-menu-item-left">
              <span class="di-menu-icon">${this.icons.volume(16)}</span>
              <div>
                <strong>Điều Chỉnh Âm Lượng</strong>
                <p>Kéo âm lượng to / nhỏ nhanh</p>
              </div>
            </div>
            <span class="di-menu-val">${volLabel} ${this.icons.chevronRight(13)}</span>
          </div>
        </div>
      </div>
    `;
  },

  // 3. Khối Hẹn Giờ Tắt Nhạc (Sleep Timer Sub-panel)
  renderSleepTimerSubPanel() {
    const options = [
      { mins: 0, label: "Tắt hẹn giờ (Mặc định)" },
      { mins: 10, label: "10 phút" },
      { mins: 20, label: "20 phút" },
      { mins: 30, label: "30 phút" },
      { mins: 45, label: "45 phút" },
      { mins: 60, label: "60 phút (1 giờ)" },
      { mins: -1, label: "Khi hết video hiện tại" }
    ];

    return `
      <div class="di-sub-panel">
        <div class="di-sub-header">
          <button class="di-sub-back-btn" onclick="DynamicIsland.setPlayerSubView('settings')">
            ${this.icons.chevronLeft(14)} <span>Cài đặt</span>
          </button>
          <h5>Hẹn Giờ Tắt Nhạc</h5>
        </div>

        <div class="di-options-list">
          ${options.map(opt => `
            <div class="di-option-row ${this.sleepTimer.minutes === opt.mins ? 'active' : ''}" onclick="DynamicIsland.setSleepTimer(${opt.mins})">
              <span>${opt.label}</span>
              ${this.sleepTimer.minutes === opt.mins ? `<span class="di-check-icon">${this.icons.check(14)}</span>` : ''}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // 4. Khối Tốc Độ Phát (Playback Speed Sub-panel)
  renderPlaybackSpeedSubPanel() {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

    return `
      <div class="di-sub-panel">
        <div class="di-sub-header">
          <button class="di-sub-back-btn" onclick="DynamicIsland.setPlayerSubView('settings')">
            ${this.icons.chevronLeft(14)} <span>Cài đặt</span>
          </button>
          <h5>Tốc Độ Phát</h5>
        </div>

        <div class="di-options-list">
          ${speeds.map(s => `
            <div class="di-option-row ${this.currentTrack.playbackRate === s ? 'active' : ''}" onclick="DynamicIsland.setPlaybackSpeed(${s})">
              <span>${s === 1.0 ? '1.0x (Chuẩn)' : `${s}x`}</span>
              ${this.currentTrack.playbackRate === s ? `<span class="di-check-icon">${this.icons.check(14)}</span>` : ''}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // 5. Khối Âm Lượng Nhỏ Gọn (Volume Sub-panel)
  renderVolumeSubPanel() {
    const t = this.currentTrack;

    return `
      <div class="di-sub-panel">
        <div class="di-sub-header">
          <button class="di-sub-back-btn" onclick="DynamicIsland.setPlayerSubView('settings')">
            ${this.icons.chevronLeft(14)} <span>Cài đặt</span>
          </button>
          <h5>Âm Lượng</h5>
        </div>

        <div class="di-volume-compact-box">
          <div class="di-vol-slider-row">
            <span class="di-vol-icon">${this.icons.volumeLow(16)}</span>
            <input type="range" class="di-vol-slider" min="0" max="100" value="${t.volume}" oninput="DynamicIsland.setVolume(this.value)">
            <span class="di-vol-icon">${this.icons.volume(16)}</span>
            <span class="di-vol-percent-badge">${t.volume}%</span>
          </div>
        </div>
      </div>
    `;
  },

  setPlayerSubView(view) {
    this.playerSubView = view;
    this.renderCurrentState();
  },

  // ── TAB: TIẾN TRÌNH / ACTIVITIES ──────────────────────────
  renderActivityTab() {
    if (this.activities.length === 0) {
      return `
        <div class="di-empty-box">
          <span class="di-empty-icon">${this.icons.activity(32)}</span>
          <p>Chưa có tác vụ ngầm nào đang chạy.</p>
          <p class="di-sub-hint">Bật Pomodoro trong Tiện Ích hoặc bắt đầu làm bài thi để hiển thị tiến trình tại đây.</p>
        </div>
      `;
    }

    return `
      <div class="di-activities-list">
        ${this.activities.map(act => `
          <div class="di-activity-card">
            <span class="di-act-card-icon">${act.icon || this.icons.timer(16)}</span>
            <div class="di-act-card-info">
              <h6>${this.escapeHtml(act.title)}</h6>
              <p style="color: #c084fc; font-weight: 700;">${this.escapeHtml(act.subtitle || '')}</p>
            </div>
            ${act.type === 'pomodoro' ? `
              <div style="display: flex; gap: 4px; margin-left: auto;">
                <button type="button" class="btn btn-xs" style="padding: 4px 8px; font-size: 11px; background: rgba(255,255,255,0.08); border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); color:#fff; cursor:pointer;" onclick="if(typeof StudyDockView!=='undefined') StudyDockView.pausePomodoro(); event.stopPropagation();" title="Tạm dừng/Tiếp tục">⏸️</button>
                <button type="button" class="btn btn-xs" style="padding: 4px 8px; font-size: 11px; background: rgba(255,255,255,0.08); border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); color:#fff; cursor:pointer;" onclick="if(typeof StudyDockView!=='undefined') StudyDockView.skipPomodoro(); event.stopPropagation();" title="Bỏ qua hiệp">⏭️</button>
              </div>
            ` : (act.priority >= 3 ? '<span class="di-urgent-tag">Ưu tiên</span>' : '')}
          </div>
        `).join("")}
      </div>
    `;
  },

  // ── TAB: KHÁM PHÁ & TÌM KIẾM YOUTUBE (IN-APP SEARCH & CATALOG) ─
  renderPresetsTab() {
    const quickChips = [
      "Lo-Fi Girl", "Sóng Não 432Hz", "Piano Mozart", "Mưa Rào Đêm", "Triết Học", "Toán Cao Cấp C1", "Kinh Tế Chính Trị", "Ghibli Lofi"
    ];

    return `
      <div style="display: flex; flex-direction: column;">
        <!-- Thanh Tìm Kiếm In-App Không Cần URL -->
        <div class="di-search-box">
          <span class="di-search-icon-left">${this.icons.search(16)}</span>
          <input type="text" 
                 class="di-search-input" 
                 id="diPresetSearchInput" 
                 placeholder="Gõ từ khóa tìm video / bài giảng / nhạc YouTube..." 
                 value="${this.escapeHtml(this.searchQuery)}"
                 oninput="DynamicIsland.handlePresetSearchInput(this.value)"
                 onkeydown="if(event.key==='Enter') DynamicIsland.triggerInstantOnlineSearch()">
          <button class="di-search-clear-btn" id="diSearchClearBtn" onclick="DynamicIsland.clearSearchInput()" title="Xóa tìm kiếm" style="${this.searchQuery ? 'display:flex;' : 'display:none;'}">
            ${this.icons.close(14)}
          </button>
        </div>

        <!-- Các Từ Khóa Gợi Ý Nhanh (Chips) -->
        <div class="di-search-chips">
          ${quickChips.map(c => `
            <span class="di-chip" onclick="DynamicIsland.quickSearchChip('${c}')">${c}</span>
          `).join("")}
        </div>

        <!-- Thanh Tab Danh Mục Thể Loại -->
        <div class="di-category-tabs">
          ${this.categories.map(cat => `
            <button type="button" class="di-cat-btn ${this.selectedCategory === cat.id ? 'active' : ''}" onclick="DynamicIsland.setPresetCategory('${cat.id}')">
              ${cat.name}
            </button>
          `).join("")}
        </div>

        <!-- Danh Sách Kết Quả / Danh Sách Bài Tuyển Chọn (Cập nhật độc lập không mất focus) -->
        <div class="di-search-results-list" id="diSearchResultsContainer">
          ${this.renderSearchResultsInner()}
        </div>
      </div>
    `;
  },

  renderSearchResultsInner() {
    const q = (this.searchQuery || "").toLowerCase().trim();

    // 1. Trạng thái đang tìm kiếm Online
    if (this.isSearchingOnline) {
      return `
        <div class="di-empty-box" style="padding: 24px 10px;">
          <div class="spinner" style="width: 24px; height: 24px; border-width: 2.5px; margin-bottom: 8px; border-top-color: #c084fc;"></div>
          <p style="color: #c084fc; font-weight: 700;">Đang tìm kiếm trực tuyến trên YouTube...</p>
          <p class="di-sub-hint">Đang kết nối kho dữ liệu video YouTube không cần URL</p>
        </div>
      `;
    }

    // 2. Nếu có kết quả Online
    if (this.onlineSearchResults && this.onlineSearchResults.length > 0) {
      return `
        <div style="padding: 2px 4px 6px 4px; font-size: 11px; color: #c084fc; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
          <span>🌐 Kết quả tìm kiếm YouTube trực tuyến (${this.onlineSearchResults.length})</span>
          <span style="font-size: 10px; color: #94a3b8; cursor: pointer;" onclick="DynamicIsland.clearSearchInput()">Quay lại kho có sẵn</span>
        </div>
        ${this.onlineSearchResults.map(p => {
          const isActive = (this.currentTrack.id === p.id);
          const thumbUrl = `https://i.ytimg.com/vi/${p.id}/mqdefault.jpg`;

          return `
            <div class="di-search-card ${isActive ? 'active' : ''}" onclick="DynamicIsland.loadPreset('${p.id}', event, true)">
              <img class="di-search-thumb" src="${thumbUrl}" alt="" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'54\\' height=\\'38\\' fill=\\'%231e293b\\'><rect width=\\'100%\\' height=\\'100%\\'/></svg>'">
              <div class="di-search-info">
                <h6 title="${this.escapeHtml(p.title)}">${this.escapeHtml(p.title)}</h6>
                <p>${this.escapeHtml(p.artist)} · <span style="color:#c084fc;">${p.tag}</span></p>
              </div>
              ${isActive && this.currentTrack.isPlaying 
                ? '<span class="di-eq-active" style="color:#c084fc; font-weight:800;">ılılı</span>' 
                : `<span class="di-play-arrow" style="color:#94a3b8;">${this.icons.play(13)}</span>`}
            </div>
          `;
        }).join("")}
        <div style="padding: 10px 0 4px 0; text-align: center;">
          <button type="button" class="di-load-more-btn" onclick="DynamicIsland.loadMoreSearchResults(event)" ${this.isLoadingMore ? 'disabled' : ''}>
            ${this.isLoadingMore 
              ? '<span class="spinner" style="width: 13px; height: 13px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 6px; border-top-color: #c084fc;"></span> Đang tải thêm video...' 
              : `${this.icons.chevronRight(13)} <span>Xem Thêm Video Khác Trên YouTube...</span>`}
          </button>
        </div>
      `;
    }

    // 3. Danh sách lọc từ kho Tuyển Tập Sẵn Có
    let displayList = this.presets;

    if (this.selectedCategory === "favorites") {
      const likedIds = Object.keys(this.likedTracks);
      displayList = this.presets.filter(p => likedIds.includes(p.id));
      if (displayList.length === 0 && Object.keys(this.likedTracks).length > 0) {
        displayList = Object.values(this.likedTracks).map(t => ({
          id: t.id,
          title: t.title,
          artist: t.artist || "Yêu thích",
          category: "favorites",
          iconType: "heartFilled",
          tag: "Yêu thích"
        }));
      }
    } else if (this.selectedCategory && this.selectedCategory !== "all") {
      displayList = displayList.filter(p => p.category === this.selectedCategory);
    }

    if (q) {
      displayList = this.presets.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.artist && p.artist.toLowerCase().includes(q)) ||
        (p.tag && p.tag.toLowerCase().includes(q))
      );
    }

    if (displayList.length === 0) {
      return `
        <div class="di-empty-box" style="padding: 20px 10px;">
          <span class="di-empty-icon">${this.icons.search(28)}</span>
          <p>Không tìm thấy trong kho tuyển tập.</p>
          <button class="btn btn-sm btn-primary" style="margin-top: 10px; font-size: 12px; background: #9333ea; border-color: #9333ea;" onclick="DynamicIsland.triggerInstantOnlineSearch()">
            ${this.icons.search(13)} Tìm kiếm "${this.escapeHtml(this.searchQuery)}" trên YouTube
          </button>
        </div>
      `;
    }

    return displayList.map(p => {
      const isActive = (this.currentTrack.id === p.id);
      const thumbUrl = `https://i.ytimg.com/vi/${p.id}/mqdefault.jpg`;

      return `
        <div class="di-search-card ${isActive ? 'active' : ''}" onclick="DynamicIsland.loadPreset('${p.id}', event)">
          <img class="di-search-thumb" src="${thumbUrl}" alt="" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'54\\' height=\\'38\\' fill=\\'%231e293b\\'><rect width=\\'100%\\' height=\\'100%\\'/></svg>'">
          <div class="di-search-info">
            <h6 title="${this.escapeHtml(p.title)}">${this.escapeHtml(p.title)}</h6>
            <p>${this.escapeHtml(p.artist || p.tag)} · <span style="color:#c084fc;">${p.tag || 'YouTube'}</span></p>
          </div>
          ${isActive && this.currentTrack.isPlaying 
            ? '<span class="di-eq-active" style="color:#c084fc; font-weight:800;">ılılı</span>' 
            : `<span class="di-play-arrow" style="color:#94a3b8;">${this.icons.play(13)}</span>`}
        </div>
      `;
    }).join("");
  },

  // ── TAB: CÀI ĐẶT ĐẢO NÂNG CAO ─────────────────────────────
  renderSettingsTab() {
    const s = this.settings;

    return `
      <div class="di-settings-panel">
        <div class="di-setting-row">
          <div>
            <strong>Kích hoạt Dynamic Island</strong>
            <p>Bật/tắt thanh đảo động trên toàn hệ thống</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="DynamicIsland.toggleEnabled(this.checked)">
            <span class="slider"></span>
          </label>
        </div>

        <div class="di-setting-row">
          <div>
            <strong>Chế độ Vạch Ẩn Tối Thượng (Stealth)</strong>
            <p>Tự co lên đỉnh màn hình thành vạch 4px khi không dùng</p>
          </div>
          <select onchange="DynamicIsland.setStealthDelay(this.value)" class="di-select">
            <option value="10000" ${s.stealthDelay === 10000 ? 'selected' : ''}>Ẩn sau 10 giây</option>
            <option value="20000" ${s.stealthDelay === 20000 ? 'selected' : ''}>Ẩn sau 20 giây</option>
            <option value="30000" ${s.stealthDelay === 30000 || !s.stealthDelay ? 'selected' : ''}>Ẩn sau 30 giây (Chuẩn)</option>
            <option value="60000" ${s.stealthDelay === 60000 ? 'selected' : ''}>Ẩn sau 1 phút</option>
            <option value="0" ${s.stealthDelay === 0 ? 'selected' : ''}>Tắt (Luôn giữ viên thuốc)</option>
          </select>
        </div>

        <div class="di-setting-row">
          <div>
            <strong>Màu sắc phong cách</strong>
            <p>Màu nền và ánh sáng nhịp thở khi phát nhạc</p>
          </div>
          <select onchange="DynamicIsland.setColorTheme(this.value)" class="di-select">
            <option value="purple" ${s.colorTheme === 'purple' || !s.colorTheme ? 'selected' : ''}>Tím Đen Huyền Bí (Mặc định)</option>
            <option value="blue" ${s.colorTheme === 'blue' ? 'selected' : ''}>Xanh Cyber Neon</option>
            <option value="green" ${s.colorTheme === 'green' ? 'selected' : ''}>Xanh Lục Bảo (Zen)</option>
            <option value="oled" ${s.colorTheme === 'oled' ? 'selected' : ''}>Đen Nhám OLED</option>
          </select>
        </div>

        <div class="di-setting-row">
          <div>
            <strong>Kích thước đảo</strong>
            <p>Tỉ lệ hiển thị to / nhỏ của thanh đảo</p>
          </div>
          <select onchange="DynamicIsland.setScaleSize(this.value)" class="di-select">
            <option value="sm" ${s.scaleSize === 'sm' ? 'selected' : ''}>Nhỏ gọn (90%)</option>
            <option value="md" ${s.scaleSize === 'md' || !s.scaleSize ? 'selected' : ''}>Tiêu chuẩn (100%)</option>
            <option value="lg" ${s.scaleSize === 'lg' ? 'selected' : ''}>Rộng rãi (110%)</option>
          </select>
        </div>

        <div class="di-setting-row">
          <div>
            <strong>Thời gian tự thu nhỏ (Hover)</strong>
            <p>Tự co về dạng viên thuốc sau khi rê chuột ra ngoài</p>
          </div>
          <select onchange="DynamicIsland.setAutoCollapseDelay(this.value)" class="di-select">
            <option value="1500" ${s.autoCollapseDelay === 1500 ? 'selected' : ''}>1.5 giây (Rất nhanh)</option>
            <option value="2500" ${s.autoCollapseDelay === 2500 ? 'selected' : ''}>2.5 giây (Nhanh)</option>
            <option value="3500" ${s.autoCollapseDelay === 3500 || !s.autoCollapseDelay ? 'selected' : ''}>3.5 giây (Chuẩn)</option>
            <option value="5000" ${s.autoCollapseDelay === 5000 ? 'selected' : ''}>5.0 giây (Chậm)</option>
            <option value="0" ${s.autoCollapseDelay === 0 ? 'selected' : ''}>Không bao giờ tự thu</option>
          </select>
        </div>

        <div class="di-setting-row">
          <div>
            <strong>Tự chuyển bài khi gặp lỗi</strong>
            <p>Tự động chuyển bài tiếp theo nếu video bị chặn (có bảo vệ chống lặp)</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${s.autoSkipOnError ? 'checked' : ''} onchange="DynamicIsland.setAutoSkipOnError(this.checked)">
            <span class="slider"></span>
          </label>
        </div>

        <div class="di-setting-row">
          <div>
            <strong>Vị trí trên điện thoại</strong>
            <p>Mép dưới (Thuận tay) hoặc Mép trên</p>
          </div>
          <select onchange="DynamicIsland.setMobilePosition(this.value)" class="di-select">
            <option value="bottom" ${s.mobilePosition === 'bottom' ? 'selected' : ''}>Mép Dưới Cùng (Thuận tay)</option>
            <option value="top" ${s.mobilePosition === 'top' ? 'selected' : ''}>Mép Trên Cùng</option>
          </select>
        </div>

        <div class="di-setting-row">
          <div>
            <strong>Hiển thị khi thi trắc nghiệm</strong>
            <p>Theo dõi thời gian thi trực tiếp trên đảo</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${s.enableOnExam ? 'checked' : ''} onchange="DynamicIsland.toggleExamMode(this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.playerSubView = "main";
    this.renderCurrentState();
  },

  // ── 5. YOUTUBE IFRAME PLAYER API INTEGRATION ──────────────
  initYouTubeApi() {
    if (window.YT && window.YT.Player) {
      this.createYtPlayer();
      return;
    }

    if (!document.getElementById("ytApiScript")) {
      const tag = document.createElement("script");
      tag.id = "ytApiScript";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      DynamicIsland.isYtApiReady = true;
      DynamicIsland.createYtPlayer();
    };
  },

  createYtPlayer() {
    try {
      this.ytPlayer = new YT.Player("ytHiddenPlayer", {
        height: "1",
        width: "1",
        videoId: this.currentTrack.id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(this.currentTrack.volume);
            event.target.setPlaybackRate(this.currentTrack.playbackRate);
          },
          onStateChange: (event) => {
            if (event.data === 1) { // PLAYING
              this.currentTrack.isPlaying = true;
              this.errorRetryCount = 0; // Reset lỗi khi đã phát thành công
              try {
                const videoData = this.ytPlayer.getVideoData();
                if (videoData && videoData.title) {
                  this.currentTrack.title = videoData.title;
                  this.currentTrack.artist = videoData.author || "YouTube Music";
                }
              } catch (e) {}
            } else if (event.data === 2 || event.data === 0) { // PAUSED or ENDED
              this.currentTrack.isPlaying = false;
              if (event.data === 0 && this.sleepTimer.minutes === -1) {
                this.setSleepTimer(0);
                if (typeof UIHelpers !== "undefined") {
                  UIHelpers.showToast("Đã hết video, tự động dừng phát nhạc!", "info");
                }
              }
            }
            this.updateDisplay();
          },
          onError: (event) => {
            // 🛡️ CIRCUIT BREAKER: Chống vòng lặp vô tận đổi bài khi gặp lỗi
            console.warn("YouTube Player error:", event.data);
            this.currentTrack.isPlaying = false;
            this.errorRetryCount = (this.errorRetryCount || 0) + 1;

            if (this.settings.autoSkipOnError && this.errorRetryCount <= 2) {
              if (typeof UIHelpers !== "undefined") {
                UIHelpers.showToast("⚠️ Video bị giới hạn, đang thử bài tiếp theo...", "warning", 2000);
              }
              setTimeout(() => {
                DynamicIsland.playNextPreset();
              }, 600);
            } else {
              this.errorRetryCount = 0;
              this.updateDisplay();
              if (typeof UIHelpers !== "undefined") {
                UIHelpers.showToast("⚠️ Không thể phát video này. Hãy chọn bài khác hoặc kiểm tra kết nối mạng.", "warning", 4000);
              }
            }
          }
        }
      });
    } catch (e) {
      console.warn("YouTube Player initialization:", e);
    }
  },

  // ── ĐIỀU KHIỂN THỜI GIAN & SEEKBAR ─────────────────────────
  startTimeUpdater() {
    if (this.timeUpdaterInterval) clearInterval(this.timeUpdaterInterval);
    this.timeUpdaterInterval = setInterval(() => {
      if (this.ytPlayer && this.ytPlayer.getCurrentTime && this.currentTrack.isPlaying) {
        try {
          const cur = this.ytPlayer.getCurrentTime() || 0;
          const dur = this.ytPlayer.getDuration() || 0;
          this.currentTrack.currentTime = cur;
          this.currentTrack.duration = dur;

          const curEl = document.getElementById("diCurrentTime");
          const durEl = document.getElementById("diDurationTime");
          const sliderEl = document.getElementById("diSeekSlider");

          if (curEl) curEl.innerText = this.formatSeconds(cur);
          if (durEl && dur > 0) durEl.innerText = this.formatSeconds(dur);
          if (sliderEl && dur > 0 && !sliderEl.matches(":active")) {
            sliderEl.value = Math.floor((cur / dur) * 100);
          }
        } catch (e) {}
      }
    }, 500);
  },

  handleSeek(percentVal) {
    if (!this.ytPlayer || !this.ytPlayer.seekTo) return;
    const dur = this.currentTrack.duration;
    if (dur > 0) {
      const targetSec = (parseFloat(percentVal) / 100) * dur;
      this.currentTrack.currentTime = targetSec;
      this.ytPlayer.seekTo(targetSec, true);
      const curEl = document.getElementById("diCurrentTime");
      if (curEl) curEl.innerText = this.formatSeconds(targetSec);
    }
  },

  formatSeconds(secs) {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${m.toString().padStart(2, "0")}:${remS.toString().padStart(2, "0")}`;
  },

  // ── HẸN GIỜ TẮT NHẠC (SLEEP TIMER LOGIC) ───────────────────
  setSleepTimer(minutes) {
    if (this.sleepTimer.intervalId) {
      clearInterval(this.sleepTimer.intervalId);
      this.sleepTimer.intervalId = null;
    }

    this.sleepTimer.minutes = minutes;

    if (minutes <= 0) {
      this.sleepTimer.timeRemainingSeconds = 0;
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast("Đã tắt hẹn giờ tắt nhạc!", "info");
      }
      this.setPlayerSubView("main");
      return;
    }

    this.sleepTimer.timeRemainingSeconds = minutes * 60;

    this.sleepTimer.intervalId = setInterval(() => {
      if (this.sleepTimer.timeRemainingSeconds > 0) {
        this.sleepTimer.timeRemainingSeconds--;
      } else {
        clearInterval(this.sleepTimer.intervalId);
        this.sleepTimer.intervalId = null;
        this.sleepTimer.minutes = 0;

        if (this.ytPlayer && this.ytPlayer.pauseVideo) {
          this.ytPlayer.pauseVideo();
        }
        this.currentTrack.isPlaying = false;
        this.updateDisplay();

        if (typeof UIHelpers !== "undefined") {
          UIHelpers.showToast("Đã đến giờ hẹn tắt nhạc, chúc bạn học tập hiệu quả!", "info", 5000);
        }
      }
    }, 1000);

    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(`Đã hẹn giờ tự động tắt nhạc sau ${minutes} phút!`, "success");
    }
    this.setPlayerSubView("main");
  },

  // ── TỐC ĐỘ PHÁT (PLAYBACK SPEED) ──────────────────────────
  setPlaybackSpeed(speed) {
    this.currentTrack.playbackRate = speed;
    if (this.ytPlayer && this.ytPlayer.setPlaybackRate) {
      this.ytPlayer.setPlaybackRate(speed);
    }
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(`Đã đặt tốc độ phát: ${speed}x`, "info");
    }
    this.setPlayerSubView("main");
  },

  // ── CẢM XÚC LIKE / DISLIKE ────────────────────────────────
  toggleLike() {
    this.currentTrack.isLiked = !this.currentTrack.isLiked;
    if (this.currentTrack.isLiked) {
      this.likedTracks[this.currentTrack.id] = {
        id: this.currentTrack.id,
        title: this.currentTrack.title,
        artist: this.currentTrack.artist,
        savedAt: Date.now()
      };
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast("Đã thêm bài hát vào mục Yêu thích!", "success");
      }
    } else {
      delete this.likedTracks[this.currentTrack.id];
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast("Đã bỏ thích bài hát này", "info");
      }
    }
    this.saveLikedTracks();
    this.renderCurrentState();
  },

  toggleDislike() {
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast("Đã bỏ qua, đang chuyển sang bài tiếp theo...", "info");
    }
    this.playNextPreset();
  },

  // ── ĐIỀU KHIỂN PHÁT NHẠC ──────────────────────────────────
  togglePlayPause(e) {
    if (e) e.stopPropagation();
    this.errorRetryCount = 0;

    if (!this.ytPlayer || !this.ytPlayer.playVideo) {
      this.createYtPlayer();
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast("Đang kết nối tới máy chủ âm nhạc...", "info");
      }
      return;
    }

    if (this.currentTrack.isPlaying) {
      this.ytPlayer.pauseVideo();
      this.currentTrack.isPlaying = false;
    } else {
      this.ytPlayer.playVideo();
      this.currentTrack.isPlaying = true;
    }

    this.restartStealthTimer();
    this.updateDisplay();
  },

  loadPreset(videoId, e, isOnlineResult = false) {
    if (e) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    }
    this.errorRetryCount = 0;

    let targetTrack = null;
    if (isOnlineResult && this.onlineSearchResults) {
      targetTrack = this.onlineSearchResults.find(p => p.id === videoId);
    }
    if (!targetTrack) {
      targetTrack = this.presets.find(p => p.id === videoId);
    }

    if (targetTrack) {
      this.currentTrack.id = targetTrack.id;
      this.currentTrack.title = targetTrack.title;
      this.currentTrack.artist = targetTrack.artist || targetTrack.tag || "YouTube";
      this.currentTrack.isLiked = Boolean(this.likedTracks[targetTrack.id]);
    } else {
      this.currentTrack.id = videoId;
      this.currentTrack.title = "Đang tải video YouTube...";
      this.currentTrack.artist = "YouTube";
      this.currentTrack.isLiked = Boolean(this.likedTracks[videoId]);
    }

    try {
      localStorage.setItem("dthu_dynamic_island_last_track", JSON.stringify({ id: videoId }));
    } catch (err) {}

    if (this.ytPlayer && this.ytPlayer.loadVideoById) {
      this.ytPlayer.loadVideoById(videoId);
      this.currentTrack.isPlaying = true;
    } else {
      this.createYtPlayer();
    }

    this.updatePipState();
    this.playerSubView = "main";
    this.restartStealthTimer();
    this.updateDisplay();
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(`Đang phát: ${targetTrack ? targetTrack.title : 'Video YouTube'}`, "success");
    }
  },

  setPresetCategory(catId) {
    this.selectedCategory = catId;
    this.renderCurrentState();
  },

  handlePresetSearchInput(val) {
    this.searchQuery = val;
    const clearBtn = document.getElementById("diSearchClearBtn");
    if (clearBtn) {
      clearBtn.style.display = val ? "flex" : "none";
    }

    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);

    // Cập nhật ngay kết quả lọc cục bộ (không re-render thẻ input để không mất focus)
    this.updateSearchResultsContainer();

    // Kích hoạt tìm kiếm Online sau 400ms gõ phím
    if (val && val.trim().length >= 2) {
      this.searchDebounceTimer = setTimeout(() => {
        DynamicIsland.searchYouTubeOnline(val);
      }, 450);
    } else {
      this.onlineSearchResults = [];
      this.isSearchingOnline = false;
      this.updateSearchResultsContainer();
    }
  },

  triggerInstantOnlineSearch() {
    const input = document.getElementById("diPresetSearchInput");
    const val = (input ? input.value : this.searchQuery) || "";
    if (val.trim()) {
      if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
      this.searchYouTubeOnline(val.trim(), false);
    }
  },

  loadMoreSearchResults(e) {
    if (e) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    }
    if (this.isLoadingMore || !this.searchQuery) return;
    this.searchPage += 1;
    this.searchYouTubeOnline(this.searchQuery, true);
  },

  async searchYouTubeOnline(query, isLoadMore = false) {
    if (!query || !query.trim()) {
      this.onlineSearchResults = [];
      this.isSearchingOnline = false;
      this.isLoadingMore = false;
      this.updateSearchResultsContainer();
      return;
    }

    const cleanQ = query.trim();

    if (isLoadMore) {
      this.isLoadingMore = true;
    } else {
      this.searchPage = 1;
      this.isSearchingOnline = true;
      this.onlineSearchResults = [];
    }
    this.updateSearchResultsContainer();

    const publicEndpoints = [
      `https://invidious.nerdvpn.de/api/v1/search?q=${encodeURIComponent(cleanQ)}&page=${this.searchPage}&type=video`,
      `https://inv.nadeko.net/api/v1/search?q=${encodeURIComponent(cleanQ)}&page=${this.searchPage}&type=video`,
      `https://vid.priv.au/api/v1/search?q=${encodeURIComponent(cleanQ)}&page=${this.searchPage}&type=video`,
      `https://yt.drgnz.club/api/v1/search?q=${encodeURIComponent(cleanQ)}&page=${this.searchPage}&type=video`,
      `https://api.piped.private.coffee/search?q=${encodeURIComponent(cleanQ)}&filter=videos`
    ];

    let foundVideos = [];

    for (const endpoint of publicEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          let items = [];
          if (Array.isArray(data)) {
            items = data;
          } else if (data && Array.isArray(data.items)) {
            items = data.items;
          }

          if (items.length > 0) {
            foundVideos = items
              .filter(item => (item.videoId || item.id || (item.url && item.url.includes('watch?v='))))
              .slice(0, 15)
              .map(item => {
                const vidId = item.videoId || item.id || (item.url ? DynamicIsland.extractYouTubeId(item.url) : null);
                let durFormatted = "";
                if (item.lengthSeconds) {
                  durFormatted = DynamicIsland.formatSeconds(item.lengthSeconds);
                } else if (item.duration) {
                  durFormatted = typeof item.duration === 'string' ? item.duration : DynamicIsland.formatSeconds(item.duration);
                }
                return {
                  id: vidId,
                  title: item.title || "Video YouTube",
                  artist: item.author || item.uploaderName || item.channelTitle || "YouTube",
                  category: "online",
                  iconType: "video",
                  tag: durFormatted || "YouTube Online",
                  isOnlineResult: true
                };
              })
              .filter(v => v.id && v.id.length === 11);

            if (foundVideos.length > 0) break;
          }
        }
      } catch (err) {
        // Thử tiếp endpoint dự phòng
      }
    }

    this.isSearchingOnline = false;
    this.isLoadingMore = false;

    if (isLoadMore) {
      if (foundVideos.length > 0) {
        const existingIds = new Set(this.onlineSearchResults.map(v => v.id));
        const uniqueNew = foundVideos.filter(v => !existingIds.has(v.id));
        this.onlineSearchResults = this.onlineSearchResults.concat(uniqueNew.length > 0 ? uniqueNew : foundVideos);
      } else {
        if (typeof UIHelpers !== "undefined") {
          UIHelpers.showToast("Đã tải hết kết quả tìm kiếm cho từ khóa này!", "info");
        }
      }
    } else {
      this.onlineSearchResults = foundVideos;
    }

    this.updateSearchResultsContainer();
  },

  updateSearchResultsContainer() {
    const container = document.getElementById("diSearchResultsContainer");
    if (container) {
      container.innerHTML = this.renderSearchResultsInner();
    }
  },

  clearSearchInput() {
    this.searchQuery = "";
    this.onlineSearchResults = [];
    this.isSearchingOnline = false;
    const input = document.getElementById("diPresetSearchInput");
    if (input) {
      input.value = "";
      input.focus();
    }
    const clearBtn = document.getElementById("diSearchClearBtn");
    if (clearBtn) clearBtn.style.display = "none";
    this.updateSearchResultsContainer();
  },

  quickSearchChip(keyword) {
    this.searchQuery = keyword;
    const input = document.getElementById("diPresetSearchInput");
    if (input) {
      input.value = keyword;
      input.focus();
    }
    const clearBtn = document.getElementById("diSearchClearBtn");
    if (clearBtn) clearBtn.style.display = "flex";
    this.handlePresetSearchInput(keyword);
  },

  handleCustomInput() {
    this.errorRetryCount = 0;
    const input = document.getElementById("diCustomYtInput");
    if (!input || !input.value.trim()) return;

    const val = input.value.trim();
    const videoId = this.extractYouTubeId(val);

    if (videoId) {
      this.currentTrack.id = videoId;
      this.currentTrack.title = "Đang phát video YouTube...";
      this.currentTrack.artist = "Tùy chỉnh";
      this.currentTrack.isLiked = Boolean(this.likedTracks[videoId]);

      if (this.ytPlayer && this.ytPlayer.loadVideoById) {
        this.ytPlayer.loadVideoById(videoId);
        this.currentTrack.isPlaying = true;
      }

      this.updatePipState();
      this.playerSubView = "main";
      this.restartStealthTimer();
      this.updateDisplay();
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast("Đã phát video YouTube thành công!", "success");
      }
    } else {
      // Nếu không phải URL, tự động tìm kiếm trực tuyến theo từ khóa
      this.searchQuery = val;
      this.activeTab = "presets";
      this.renderCurrentState();
      this.searchYouTubeOnline(val);
      if (typeof UIHelpers !== "undefined") {
        UIHelpers.showToast(`Đang tìm kiếm trên YouTube: "${val}"`, "info");
      }
    }
  },

  loadCustomUrl() {
    this.handleCustomInput();
  },

  // ── FLOATING PICTURE-IN-PICTURE (VIDEO NỔI MINI) ──────────
  toggleVideoPip() {
    this.isVideoPipOpen = !this.isVideoPipOpen;
    this.isPipMinimized = false;
    this.updatePipState();
    this.renderCurrentState();

    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(this.isVideoPipOpen ? "Đã bật Cửa Sổ Video Nổi (PiP)!" : "Đã đóng video nổi.", "info");
    }
  },

  togglePipMinimize() {
    this.isPipMinimized = !this.isPipMinimized;
    const pipEl = document.getElementById("diFloatingVideoPip");
    if (pipEl) {
      if (this.isPipMinimized) {
        pipEl.classList.add("minimized");
      } else {
        pipEl.classList.remove("minimized");
      }
    }
  },

  closeVideoPip() {
    this.isVideoPipOpen = false;
    this.isPipMinimized = false;
    this.updatePipState();
    this.renderCurrentState();
  },

  updatePipState() {
    const pipEl = document.getElementById("diFloatingVideoPip");
    const pipIframe = document.getElementById("diPipIframe");
    const pipTitle = document.getElementById("diPipTitle");

    if (!pipEl) return;

    if (this.isVideoPipOpen && this.currentTrack.id) {
      pipEl.style.display = "block";
      if (pipTitle) pipTitle.innerText = this.currentTrack.title || "Video Bài Giảng";
      if (pipIframe) {
        const targetSrc = `https://www.youtube.com/embed/${this.currentTrack.id}?autoplay=1&enablejsapi=1&playsinline=1`;
        if (pipIframe.src !== targetSrc) {
          pipIframe.src = targetSrc;
        }
      }
    } else {
      pipEl.style.display = "none";
      if (pipIframe) pipIframe.src = "";
    }
  },

  extractYouTubeId(url) {
    if (!url) return null;
    if (url.length === 11) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  },

  setVolume(val) {
    const vol = parseInt(val, 10) || 0;
    this.currentTrack.volume = vol;
    if (this.ytPlayer && this.ytPlayer.setVolume) {
      this.ytPlayer.setVolume(vol);
    }
    const valEl = document.querySelector(".di-vol-percent-badge");
    if (valEl) valEl.innerText = `${vol}%`;
  },

  playNextPreset() {
    const currentIndex = this.presets.findIndex(p => p.id === this.currentTrack.id);
    const nextIndex = (currentIndex + 1) % this.presets.length;
    this.loadPreset(this.presets[nextIndex].id);
  },

  playPrevPreset() {
    const currentIndex = this.presets.findIndex(p => p.id === this.currentTrack.id);
    const prevIndex = (currentIndex - 1 + this.presets.length) % this.presets.length;
    this.loadPreset(this.presets[prevIndex].id);
  },

  // ── 6. CÀI ĐẶT & HOOKS TÙY BIẾN ───────────────────────────
  toggleEnabled(enabled) {
    this.settings.enabled = Boolean(enabled);
    this.saveSettings();

    const pill = document.getElementById("dynamicIslandPill");
    const backdrop = document.getElementById("diBackdrop");

    if (pill) {
      pill.style.display = enabled ? "flex" : "none";
    }
    if (backdrop && !enabled) {
      backdrop.classList.remove("active");
    }

    if (!enabled && this.ytPlayer && this.ytPlayer.pauseVideo) {
      this.ytPlayer.pauseVideo();
      this.currentTrack.isPlaying = false;
    }

    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast(enabled ? "Đã kích hoạt Dynamic Island!" : "Đã tắt hoàn toàn Dynamic Island.", "info");
    }
  },

  setStealthDelay(delayMs) {
    this.settings.stealthDelay = parseInt(delayMs, 10);
    this.saveSettings();
    this.restartStealthTimer();
  },

  setColorTheme(theme) {
    this.settings.colorTheme = theme;
    this.saveSettings();
    this.updateDisplay();
    if (typeof UIHelpers !== "undefined") {
      UIHelpers.showToast("Đã cập nhật màu sắc đảo!", "info");
    }
  },

  setScaleSize(scale) {
    this.settings.scaleSize = scale;
    this.saveSettings();
    this.updateDisplay();
  },

  setAutoCollapseDelay(delayMs) {
    this.settings.autoCollapseDelay = parseInt(delayMs, 10);
    this.saveSettings();
  },

  setAutoSkipOnError(val) {
    this.settings.autoSkipOnError = Boolean(val);
    this.saveSettings();
  },

  setMobilePosition(pos) {
    this.settings.mobilePosition = pos;
    this.saveSettings();
    this.setMorphState(this.currentState);
  },

  toggleExamMode(enabled) {
    this.settings.enableOnExam = Boolean(enabled);
    this.saveSettings();
  },

  // ── 7. BIND GLOBAL EVENTS ──────────────────────────────────
  bindEvents() {
    const pill = document.getElementById("dynamicIslandPill");
    if (!pill) return;

    // Hover trên Desktop
    pill.addEventListener("mouseenter", () => {
      if (!this.settings.enabled) return;
      this.isHovered = true;

      // Đánh thức từ stealth hoặc mở rộng từ compact
      if (this.currentState === "stealth") {
        this.setMorphState("compact");
      } else if (this.currentState === "compact") {
        this.setMorphState("expanded");
      }
    });

    pill.addEventListener("mouseleave", () => {
      if (!this.settings.enabled) return;
      this.isHovered = false;

      if (this.currentState === "expanded") {
        if (this.hoverTimer) clearTimeout(this.hoverTimer);
        const delay = (this.settings.autoCollapseDelay !== undefined && this.settings.autoCollapseDelay !== null) 
          ? this.settings.autoCollapseDelay 
          : 3500;

        if (delay > 0) {
          this.hoverTimer = setTimeout(() => {
            if (!this.isHovered && this.currentState === "expanded") {
              this.setMorphState("compact");
              this.restartStealthTimer();
            }
          }, delay);
        }
      } else if (this.currentState === "compact") {
        this.restartStealthTimer();
      }
    });

    // Phím tắt nhanh: Phím `~` (tilde / backquote) hoặc `Ctrl + Space` để mở/thu đảo
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.currentState === "full") {
        this.collapseToCompact();
      } else if ((e.key === "`" || e.key === "~" || (e.ctrlKey && e.code === "Space")) && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        if (this.currentState === "stealth") {
          this.wakeFromStealth();
        } else if (this.currentState === "compact") {
          this.goToStealth();
        }
      }
    });
  },

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
};

window.DynamicIsland = DynamicIsland;
