/**
 * ============================================================================
 * SOURCE SYNC MODULE (Đồng Bộ & Ánh Xạ Tọa Độ 2 Chiều Editor <-> Preview)
 * ----------------------------------------------------------------------------
 * 1. Đo lường tọa độ Pixel thực tế (DOM Mirroring Method)
 * 2. Cuộn thông minh thích ứng (Adaptive Smart Scrolling - Chống Lag khi Text dài)
 * 3. Kích hoạt dạ quang khi ĐÃ DỪNG CUỘN (Scroll-End Settlement)
 * 4. Tự động liên kết với cấu hình Cài Đặt (Settings)
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SourceSync = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {

  const SourceSync = {
    version: "2.5.0-adaptive-scroll",

    /**
     * Cấu hình mặc định
     */
    config: {
      scrollMode: "adaptive",      // "adaptive" | "smooth" | "instant"
      triggerMoment: "afterScroll", // "afterScroll" | "immediate"
      highlightDuration: 1.8        // Giây (0 = tắt dạ quang)
    },

    /**
     * Cập nhật cấu hình
     */
    setConfig(newConfig = {}) {
      this.config = { ...this.config, ...newConfig };
    },

    /**
     * Đo lường tọa độ pixel thực tế của vị trí ký tự trong Textarea
     * Sử dụng kỹ thuật DOM Mirroring (Chuẩn xác 100% kể cả khi chữ bị ngắt dòng word-wrap)
     */
    getCaretPixelOffset(textarea, position) {
      let mirror = document.getElementById("textarea-mirror-measure");
      if (!mirror) {
        mirror = document.createElement("div");
        mirror.id = "textarea-mirror-measure";
        mirror.setAttribute("aria-hidden", "true");
        document.body.appendChild(mirror);
      }

      const style = window.getComputedStyle(textarea);

      mirror.style.position = "absolute";
      mirror.style.top = "-99999px";
      mirror.style.left = "-99999px";
      mirror.style.visibility = "hidden";
      mirror.style.whiteSpace = "pre-wrap";
      mirror.style.wordWrap = "break-word";
      mirror.style.overflowWrap = "break-word";
      mirror.style.fontFamily = style.fontFamily;
      mirror.style.fontSize = style.fontSize;
      mirror.style.fontWeight = style.fontWeight;
      mirror.style.lineHeight = style.lineHeight;
      mirror.style.letterSpacing = style.letterSpacing;
      mirror.style.paddingLeft = style.paddingLeft;
      mirror.style.paddingRight = style.paddingRight;
      mirror.style.paddingTop = style.paddingTop;
      mirror.style.paddingBottom = style.paddingBottom;
      mirror.style.border = style.border;
      mirror.style.boxSizing = style.boxSizing;
      mirror.style.width = `${textarea.clientWidth}px`;

      const textBefore = textarea.value.substring(0, position);
      mirror.textContent = textBefore;

      const span = document.createElement("span");
      span.textContent = textarea.value.substring(position, position + 1) || "c";
      mirror.appendChild(span);

      const pixelTop = span.offsetTop;
      const pixelHeight = span.offsetHeight || 22;

      return {
        top: pixelTop,
        height: pixelHeight
      };
    },

    /**
     * Nhảy đến và định vị chính xác câu hỏi trong ô Textarea (Hỗ trợ Adaptive Scroll & Scroll-End)
     * @param {HTMLTextAreaElement} textarea 
     * @param {Object} item - Câu hỏi chứa tọa độ { startChar, endChar, num, rawLabel, id }
     */
    jumpToEditor(textarea, item) {
      if (!textarea || !item) return;

      textarea.focus();

      const start = typeof item.startChar === "number" ? item.startChar : 0;

      // 1. Đặt con trỏ chuột tại đầu câu hỏi (Không bôi đen)
      textarea.setSelectionRange(start, start);

      // 2. Lấy tọa độ pixel tuyệt đối của ký tự đầu câu
      const { top: exactPixelTop, height: lineHeight } = this.getCaretPixelOffset(textarea, start);
      const targetScrollTop = Math.max(0, exactPixelTop - 30);

      // 3. Tính toán khoảng cách cuộn (Delta Y) để chọn chế độ cuộn thích ứng chống lag
      const currentScrollTop = textarea.scrollTop;
      const distance = Math.abs(targetScrollTop - currentScrollTop);

      let behavior = "smooth";
      if (this.config.scrollMode === "instant") {
        behavior = "auto";
      } else if (this.config.scrollMode === "adaptive") {
        // Nếu khoảng cách xa (> 600px) thì nhảy tức thì để chống lag GPU/CPU và không phải chờ đợi
        behavior = distance > 600 ? "auto" : "smooth";
      }

      // 4. Kích hoạt cuộn
      textarea.scrollTo({
        top: targetScrollTop,
        behavior: behavior
      });

      // 5. Nếu tắt dạ quang (highlightDuration === 0) thì kết thúc
      if (this.config.highlightDuration <= 0) return;

      // 6. Xử lý thời điểm kích hoạt Dạ quang
      if (this.config.triggerMoment === "immediate" || behavior === "auto" || distance < 20) {
        // Sáng ngay lập tức
        this.attachLineHighlightMarker(textarea, exactPixelTop, lineHeight);
      } else {
        // Chờ cuộn dừng hẳn mới bắt đầu sáng (Scroll Settlement Trigger)
        this.triggerAfterScrollSettlement(textarea, exactPixelTop, lineHeight);
      }
    },

    /**
     * Chờ màn hình cuộn dừng hẳn rồi mới kích hoạt dải dạ quang (100% không bị tắt sớm)
     */
    triggerAfterScrollSettlement(textarea, exactPixelTop, lineHeight) {
      let isSettled = false;
      let scrollTimer = null;

      const triggerNow = () => {
        if (isSettled) return;
        isSettled = true;
        textarea.removeEventListener("scroll", onScroll);
        this.attachLineHighlightMarker(textarea, exactPixelTop, lineHeight);
      };

      const onScroll = () => {
        clearTimeout(scrollTimer);
        // Khi dừng cuộn trong 70ms -> Xem như đã đáp xuống đích
        scrollTimer = setTimeout(triggerNow, 70);
      };

      textarea.addEventListener("scroll", onScroll, { passive: true });

      // Fallback an toàn sau tối đa 600ms
      setTimeout(triggerNow, 600);
    },

    /**
     * Đặt dải dạ quang chìm ở LỚP NỀN DƯỚI (Background Underlay) và tự động bám theo tọa độ cuộn
     */
    attachLineHighlightMarker(textarea, exactPixelTop, lineHeight) {
      const wrap = textarea.closest(".lab-textarea-wrap");
      if (!wrap) return;

      let underlay = wrap.querySelector(".editor-line-underlay");
      if (!underlay) {
        underlay = document.createElement("div");
        underlay.className = "editor-line-underlay";
        wrap.insertBefore(underlay, wrap.firstChild);
      }

      underlay.style.height = `${lineHeight + 4}px`;
      underlay.style.animationDuration = `${this.config.highlightDuration}s`;

      const updateMarkerPos = () => {
        const relativeTop = exactPixelTop - textarea.scrollTop;
        underlay.style.top = `${relativeTop}px`;
      };

      updateMarkerPos();

      // Bật animation chớp sáng chìm
      underlay.classList.remove("active");
      void underlay.offsetWidth; // Force reflow
      underlay.classList.add("active");

      // Đồng bộ vị trí trong lúc cuộn
      const scrollSyncHandler = () => {
        updateMarkerPos();
      };

      textarea.addEventListener("scroll", scrollSyncHandler, { passive: true });

      clearTimeout(this._markerTimer);
      this._markerTimer = setTimeout(() => {
        underlay.classList.remove("active");
        textarea.removeEventListener("scroll", scrollSyncHandler);
      }, this.config.highlightDuration * 1000 + 100);
    },

    /**
     * Tìm câu hỏi tương ứng với vị trí con trỏ chuột trong Textarea
     */
    findQuestionAtCursor(cursorPos, questions = []) {
      if (!Array.isArray(questions) || typeof cursorPos !== "number") return null;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (typeof q.startChar === "number" && typeof q.endChar === "number") {
          if (cursorPos >= q.startChar && cursorPos <= q.endChar) {
            return { question: q, index: i };
          }
        }
      }

      if (questions.length > 0 && cursorPos >= questions[questions.length - 1].startChar) {
        return { question: questions[questions.length - 1], index: questions.length - 1 };
      }

      return null;
    },

    /**
     * Bật hiệu ứng sáng viền (Glow Pulse) cho thẻ câu hỏi bên Xem trước
     */
    highlightPreviewCard(questionId) {
      const card = document.querySelector(`[data-question-id="${questionId}"]`);
      if (!card) return;

      document.querySelectorAll(".q-card.highlight-pulse").forEach(el => {
        el.classList.remove("highlight-pulse");
      });

      card.classList.add("highlight-pulse");
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });

      setTimeout(() => {
        card.classList.remove("highlight-pulse");
      }, 1500);
    }
  };

  return SourceSync;
}));
