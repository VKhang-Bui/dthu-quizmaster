/**
 * SHINORA QUIZMASTER - MAIN CONTROLLER & APPLICATION ROUTER
 * Tác giả: Shina (Bùi Văn Khang)
 *
 * File này chỉ chứa: Application State, Init lifecycle, SPA Router, Modal Helpers, Global Events, Draggable Button.
 * Các View modules được phân tách trong thư mục assets/js/views/ và gán methods vào App qua Object.assign().
 */

/**
 * SHINORA QUIZMASTER - MAIN CONTROLLER & APPLICATION ROUTER
 * Tác giả: Shina (Bùi Văn Khang)
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

  parseHashRoute() {
    if (typeof window === "undefined" || !window.location || !window.location.hash) {
      return { view: "home", data: {} };
    }
    const raw = window.location.hash.slice(1).trim();
    if (!raw) return { view: "home", data: {} };

    const [viewPart, queryPart] = raw.split("?");
    let view = viewPart || "home";
    const data = {};
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      for (const [k, v] of params.entries()) {
        data[k] = v;
      }
    }
    // Hỗ trợ bookmark hoặc hash trực tiếp tới từng điều khoản
    if (view && view.startsWith("dieu-")) {
      data.scrollTo = view;
      view = "terms";
    }
    return { view, data };
  },

  checkRoutePermission(view) {
    const isLogged = StorageService.isLoggedIn();
    const profile = StorageService.getUserProfile();
    const isAdmin = isLogged && (profile.role === "admin" || (profile.permissions && profile.permissions.canManageUsers));
    const isEditor = isLogged && (isAdmin || profile.role === "editor" || (profile.permissions && (profile.permissions.canEditSubjects || profile.permissions.canApproveDrafts)));

    // 1. Nhóm trang Quản Trị Hệ Thống (Chỉ Admin)
    if (["leaderboard-admin", "users-management"].includes(view)) {
      if (!isLogged) return { allowed: false, message: "🔒 Vui lòng đăng nhập tài khoản Quản trị viên!" };
      if (!isAdmin) return { allowed: false, message: "⛔ Bạn không có quyền truy cập trang Quản trị này!" };
    }

    // 2. Nhóm trang Quản Lý & Phê Duyệt Đề (Chỉ Editor & Admin)
    if (["manage", "moderation", "draft-review"].includes(view)) {
      if (!isLogged) return { allowed: false, message: "🔒 Vui lòng đăng nhập để truy cập tính năng Quản lý đề thi!" };
      if (!isEditor) return { allowed: false, message: "⛔ Tài khoản của bạn chưa được cấp quyền Quản lý hoặc Phê duyệt đề thi!" };
    }

    // 3. Nhóm trang Soạn Thảo & Nhập Đề (Parser) (Chỉ Sinh viên đăng nhập / Editor)
    if (view === "parser") {
      if (!isLogged) return { allowed: false, message: "🔒 Vui lòng đăng nhập tài khoản sinh viên để sử dụng công cụ Nhập & Đóng góp đề thi!" };
    }

    // 4. Nhóm trang Dành Riêng Cho Sinh Viên Đã Đăng Nhập
    if (["notifications", "history", "mistakes", "materials", "leaderboard"].includes(view)) {
      if (!isLogged) return { allowed: false, message: "🔒 Vui lòng đăng nhập tài khoản sinh viên để xem nội dung này!" };
    }

    return { allowed: true };
  },

  navigateTo(view, data = {}, pushHistory = true) {
    // 🛡️ BẢO VỆ ROUTE: Kiểm tra quyền truy cập của người dùng
    const perm = this.checkRoutePermission(view);
    if (!perm.allowed) {
      this.showToast(perm.message || "🔒 Yêu cầu đăng nhập!", "warning", 3000);
      if (!StorageService.isLoggedIn()) {
        this.openAccountSwitcherModal();
      }
      view = "home";
      data = {};
    }

    if (this.currentView && this.currentView !== view) {
      this.previousView = this.currentView;
      this.previousViewData = this.currentViewData || {};
    }
    this.activeRouteData = data || {};
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
      case "terms":
        this.renderTermsView(mainContainer);
        if (data && data.scrollTo && typeof this.scrollToTermsSection === "function") {
          setTimeout(() => this.scrollToTermsSection(data.scrollTo), 100);
        }
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

// Đảm bảo App luôn được gắn vào window toàn cục
if (typeof window !== "undefined") {
  window.App = App;
}
