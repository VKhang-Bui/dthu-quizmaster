/**
 * ABOUT VIEW MODULE — Trang Giới Thiệu Dự Án
 * Shinora QuizMaster v3.1.4
 * Tác giả: Shina Sanora
 *
 * Trình bày câu chuyện, sứ mệnh, công nghệ và tác giả đằng sau
 * nền tảng luyện thi trắc nghiệm thông minh dành cho sinh viên Đại học & Cao đẳng.
 */

Object.assign(App, {
  renderAboutView(container) {
    container.innerHTML = `
      <div class="view-about" style="max-width: 880px; margin: 0 auto; padding: 0 16px 64px;">

        <!-- ═══════════════════════════════════════════════════════════
             SECTION 1 — HERO BANNER
        ═══════════════════════════════════════════════════════════ -->
        <section class="about-hero" style="
          text-align: center;
          padding: 48px 24px 40px;
          margin-bottom: 40px;
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle, var(--surface)) 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg, 16px);
          position: relative;
          overflow: hidden;
        ">
          <!-- Decorative subtle dot pattern -->
          <div style="
            position: absolute; inset: 0; opacity: 0.03;
            background-image: radial-gradient(circle, var(--text-primary) 1px, transparent 1px);
            background-size: 20px 20px;
            pointer-events: none;
          "></div>

          <div style="position: relative; z-index: 1;">
            <div style="display: inline-flex; align-items: center; justify-content: center; color: var(--brand-primary); margin-bottom: 16px;">
              ${Icons.get('logo', 56)}
            </div>
            <h1 style="
              font-size: clamp(26px, 5vw, 36px);
              font-weight: 800;
              color: var(--text-primary);
              margin: 0 0 6px;
              letter-spacing: -0.5px;
              line-height: 1.2;
            ">Shinora QuizMaster</h1>

            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 8px 0 20px; flex-wrap: wrap; justify-content: center;">
              <span class="badge badge-blue" style="font-size: 12px; font-weight: 700;">v4.2.2-fix</span>
              <span class="badge badge-green" style="font-size: 12px; font-weight: 700;">Pure Cloudflare D1 Edition</span>
              <span class="badge" style="font-size: 12px; font-weight: 700; background: var(--surface-subtle, var(--surface)); border: 1px solid var(--border);">Học tập độc lập</span>
            </div>

            <p style="
              font-size: clamp(14px, 2.5vw, 16px);
              color: var(--text-secondary);
              max-width: 600px;
              margin: 0 auto 28px;
              line-height: 1.7;
            ">
              Nền tảng tự học, luyện thi trắc nghiệm thông minh và chia sẻ tri thức
              <strong style="color: var(--text-primary);">phi thương mại</strong> dành cho sinh viên
              <strong style="color: var(--text-primary);">Đại học &amp; Cao đẳng</strong>.
            </p>

            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="App.navigateTo('home')" style="display: inline-flex; align-items: center; gap: 7px; padding: 12px 22px; font-weight: 700; font-size: 13.5px;">
                ${Icons.get('zap', 15)} <span>Bắt Đầu Ôn Thi Ngay</span> ${Icons.get('arrowRight', 14)}
              </button>
              <button class="btn" onclick="App.navigateTo('guide')" style="display: inline-flex; align-items: center; gap: 7px; padding: 12px 22px; font-weight: 700; font-size: 13.5px;">
                ${Icons.get('book', 15)} <span>Xem Hướng Dẫn</span>
              </button>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             SECTION 2 — CÂU CHUYỆN RA ĐỜI (OUR STORY TIMELINE)
        ═══════════════════════════════════════════════════════════ -->
        <section style="margin-bottom: 48px;">
          <h2 style="
            font-size: 20px; font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 8px;
            display: flex; align-items: center; gap: 8px;
          ">${Icons.get('bookOpen', 20)} Câu Chuyện Ra Đời</h2>
          <p style="font-size: 13.5px; color: var(--text-tertiary); margin: 0 0 24px; line-height: 1.6;">
            Hành trình từ ý tưởng nhỏ đến nền tảng học tập toàn diện cho cộng đồng sinh viên.
          </p>

          <div class="about-timeline" style="
            position: relative;
            padding-left: 32px;
            display: flex;
            flex-direction: column;
            gap: 0;
          ">
            <!-- Timeline vertical line -->
            <div style="
              position: absolute;
              left: 11px; top: 8px; bottom: 8px;
              width: 2px;
              background: var(--border);
              border-radius: 2px;
            "></div>

            ${this._aboutTimelineItem(
              Icons.get('sparkles', 14),
              'Ý Tưởng Khởi Nguồn',
              'Tài liệu ôn thi đại cương (Triết học, Pháp luật, Toán, Tiếng Anh...) bị <strong>phân mảnh</strong> khắp nơi. Sinh viên thiếu công cụ thi thử bấm giờ nghiêm túc và không gian tập trung hiệu quả.',
              'var(--brand-primary)'
            )}

            ${this._aboutTimelineItem(
              Icons.get('database', 14),
              'Xây Dựng Nền Tảng',
              'Thiết kế hệ thống <strong>SPA offline-first</strong>, ngân hàng câu hỏi chuẩn hóa với giải thích chi tiết từng đáp án A/B/C/D, đồng bộ đám mây Supabase và giao diện responsive.',
              '#10b981'
            )}

            ${this._aboutTimelineItem(
              Icons.get('users', 14),
              'Mở Rộng Cộng Đồng',
              'Cho phép sinh viên <strong>tự đóng góp đề thi</strong> qua công cụ Parser thông minh, hệ thống phê duyệt bởi biên tập viên, và ngân hàng đề cộng đồng (Draft Hub).',
              '#f59e0b'
            )}

            ${this._aboutTimelineItem(
              Icons.get('crown', 14),
              'Hệ Sinh Thái Toàn Diện & Lõi Parser FSM (v3.1.4)',
              'Tích hợp <strong>Dynamic Island</strong> phát nhạc YouTube 24/7, <strong>Study Dock</strong> đa năng, <strong>Zen Focus Room</strong>, bảng xếp hạng và <strong>Bộ lõi Parser Engine v3.1.4</strong> bóc tách đề thi siêu tốc chuẩn xác.',
              '#8b5cf6'
            )}
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             SECTION 3 — 6 TRỤ CỘT CÔNG NGHỆ ĐỘT PHÁ
        ═══════════════════════════════════════════════════════════ -->
        <section style="margin-bottom: 48px;">
          <h2 style="
            font-size: 20px; font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 8px;
            display: flex; align-items: center; gap: 8px;
          ">${Icons.get('target', 20)} Tính Năng Nổi Bật</h2>
          <p style="font-size: 13.5px; color: var(--text-tertiary); margin: 0 0 24px; line-height: 1.6;">
            6 trụ cột công nghệ tạo nên trải nghiệm học tập khác biệt hoàn toàn.
          </p>

          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 14px;
          ">
            ${this._aboutFeatureCard(
              Icons.get('shieldCheck', 22),
              'Khảo Thí Thông Minh 3 Chế Độ',
              'Ôn tập có giải thích tức thì, thi thử bấm giờ nghiêm túc như phòng thi thật, và xem lại toàn bộ bài làm chi tiết.',
              '#10b981'
            )}

            ${this._aboutFeatureCard(
              Icons.get('island', 22),
              'Đảo Động Dynamic Island',
              'YouTube Study Hub phát nhạc sóng não 24/7, Lo-fi, Classical ngay trên thanh đảo động biến hình thông minh.',
              'var(--brand-primary)'
            )}

            ${this._aboutFeatureCard(
              Icons.get('timer', 22),
              'Study Dock & Zen Focus Room',
              'Pomodoro 4 chu kỳ cà chua, máy tính bấm phím vật lý, 6 âm thanh phím cơ và không gian Zen toàn màn hình.',
              '#ef4444'
            )}

            ${this._aboutFeatureCard(
              Icons.get('bookOpen', 22),
              'Thư Viện Tài Liệu Số',
              'Cây thư mục phân loại theo chương/môn, đọc offline hoàn toàn, tìm kiếm nhanh và tải xuống file .txt gốc.',
              '#f59e0b'
            )}

            ${this._aboutFeatureCard(
              Icons.get('trophy', 22),
              'Bảng Xếp Hạng & Gamification',
              'Mùa giải xếp hạng, huy hiệu thành tích, điểm danh streak liên tục và thi đua giữa sinh viên toàn trường.',
              '#8b5cf6'
            )}

            ${this._aboutFeatureCard(
              Icons.get('database', 22),
              'Supabase Cloud & Offline PWA',
              'Đồng bộ dữ liệu đám mây thời gian thực, hoạt động 100% offline sau lần tải đầu tiên và bảo mật end-to-end.',
              '#06b6d4'
            )}
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             SECTION 4 — CÔNG NGHỆ SỬ DỤNG (TECH STACK)
        ═══════════════════════════════════════════════════════════ -->
        <section style="margin-bottom: 48px;">
          <h2 style="
            font-size: 20px; font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 8px;
            display: flex; align-items: center; gap: 8px;
          ">${Icons.get('tools', 20)} Công Nghệ Sử Dụng</h2>
          <p style="font-size: 13.5px; color: var(--text-tertiary); margin: 0 0 20px; line-height: 1.6;">
            Xây dựng hoàn toàn bằng công nghệ web hiện đại, không framework nặng, tối ưu tốc độ tải trang.
          </p>

          <div style="
            display: flex; flex-wrap: wrap; gap: 8px;
            padding: 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md, 12px);
          ">
            ${this._aboutTechBadge('HTML5', '#e34f26')}
            ${this._aboutTechBadge('CSS3', '#1572b6')}
            ${this._aboutTechBadge('Vanilla JavaScript (ES6+)', '#f7df1e', '#000')}
            ${this._aboutTechBadge('Cloudflare D1 (Serverless SQL)', '#f38020')}
            ${this._aboutTechBadge('Cloudflare Workers (Edge API)', '#faad3f', '#000')}
            ${this._aboutTechBadge('Google Apps Script (Gmail OTP)', '#0f9d58')}
            ${this._aboutTechBadge('Web Audio API (Spatial FX)', '#8b5cf6')}
            ${this._aboutTechBadge('YouTube IFrame API', '#ff0000')}
            ${this._aboutTechBadge('WebCrypto API (SHA-256)', '#0284c7')}
            ${this._aboutTechBadge('PWA (Service Worker)', '#5a0fc8')}
            ${this._aboutTechBadge('Google Fonts (Inter)', '#4285f4')}
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             SECTION 5 — TÁC GIẢ & NHÀ PHÁT TRIỂN
        ═══════════════════════════════════════════════════════════ -->
        <section style="margin-bottom: 48px;">
          <h2 style="
            font-size: 20px; font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 8px;
            display: flex; align-items: center; gap: 8px;
          ">${Icons.get('user', 20)} Tác Giả & Nhà Phát Triển</h2>
          <p style="font-size: 13.5px; color: var(--text-tertiary); margin: 0 0 24px; line-height: 1.6;">
            Dự án được phát triển bởi một sinh viên, vì cộng đồng sinh viên.
          </p>

          <div style="
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg, 16px);
            padding: 28px 24px;
            display: flex;
            gap: 24px;
            align-items: flex-start;
            flex-wrap: wrap;
          ">
            <!-- Avatar placeholder -->
            <div style="
              width: 80px; height: 80px;
              border-radius: 50%;
              background: linear-gradient(135deg, var(--brand-primary), #8b5cf6);
              display: flex; align-items: center; justify-content: center;
              flex-shrink: 0;
              color: #fff;
              font-size: 32px;
              font-weight: 800;
              letter-spacing: -1px;
              box-shadow: 0 4px 16px rgba(2, 132, 199, 0.3);
            ">S</div>

            <div style="flex: 1; min-width: 220px;">
              <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 2px;">
                Shina Sanora
              </h3>
              <div style="font-size: 13px; color: var(--brand-primary); font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                ${Icons.get('sparkles', 13)} Lead Developer &amp; System Architect
              </div>

              <div style="
                display: flex; flex-direction: column; gap: 8px;
                font-size: 13.5px; color: var(--text-secondary); line-height: 1.6;
              ">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${Icons.get('home', 14)}
                  <span>Đơn vị: <strong>Shinora Academic &amp; Technology Studio</strong></span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${Icons.get('target', 14)}
                  <span>Nghiên cứu &amp; phát triển các giải pháp phần mềm tự học thông minh</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${Icons.get('contact', 14)}
                  <a href="javascript:void(0)" onclick="App.openContactModal()" style="color: var(--brand-primary); font-weight: 600;">Hỗ trợ &amp; Góp ý qua Form Ticket trực tuyến</a>
                </div>
              </div>

              <!-- Social Links -->
              <div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
                <a href="https://github.com/VKhang-Bui/dthu-quizmaster" target="_blank" rel="noopener noreferrer"
                   class="btn btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700;">
                  ${Icons.get('star', 13)} GitHub
                </a>
                <a href="https://www.linkedin.com/in/khang-trang-179557425/" target="_blank" rel="noopener noreferrer"
                   class="btn btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700;">
                  ${Icons.get('user', 13)} LinkedIn
                </a>
                <a href="https://www.youtube.com/@Shina18475" target="_blank" rel="noopener noreferrer"
                   class="btn btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700;">
                  ${Icons.get('volume2', 13)} YouTube
                </a>
              </div>
            </div>
          </div>

          <!-- Cam kết -->
          <div style="
            margin-top: 14px;
            padding: 16px 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md, 12px);
            display: flex;
            gap: 12px;
            align-items: flex-start;
          ">
            <div style="flex-shrink: 0; color: #10b981; margin-top: 2px;">
              ${Icons.get('shieldCheck', 18)}
            </div>
            <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
              <strong style="color: var(--text-primary);">Cam kết của tác giả:</strong>
              Shinora QuizMaster cam kết <strong>miễn phí vĩnh viễn</strong>, không quảng cáo, không thu thập dữ liệu cá nhân trái phép,
              mã nguồn mở trên GitHub và tôn trọng bản quyền học thuật của mọi tài liệu được chia sẻ.
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             SECTION 6 — ĐÓNG GÓP & CỘNG ĐỒNG
        ═══════════════════════════════════════════════════════════ -->
        <section style="margin-bottom: 16px;">
          <h2 style="
            font-size: 20px; font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 8px;
            display: flex; align-items: center; gap: 8px;
          ">${Icons.get('users', 20)} Đóng Góp & Cộng Đồng</h2>
          <p style="font-size: 13.5px; color: var(--text-tertiary); margin: 0 0 24px; line-height: 1.6;">
            Shinora QuizMaster lớn mạnh nhờ sự đóng góp của chính các bạn sinh viên.
          </p>

          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 14px;
            margin-bottom: 24px;
          ">
            ${this._aboutContributeCard(
              Icons.get('upload', 20),
              'Đóng Góp Đề Thi',
              'Sử dụng công cụ Parser để bóc tách và tải lên đề thi trắc nghiệm từ file Word, PDF hoặc nhập tay trực tiếp.',
              "App.navigateTo('parser')",
              'Mở Parser'
            )}

            ${this._aboutContributeCard(
              Icons.get('contact', 20),
              'Báo Lỗi & Góp Ý',
              'Phát hiện lỗi sai đáp án, lỗi giao diện hay có ý tưởng tính năng mới? Gửi ngay qua form Liên Hệ.',
              'App.openContactModal()',
              'Gửi Góp Ý'
            )}

            ${this._aboutContributeCard(
              Icons.get('star', 20),
              'Star ⭐ Trên GitHub',
              'Ủng hộ dự án bằng cách bấm Star trên GitHub giúp nhiều sinh viên khác biết đến QuizMaster hơn.',
              "window.open('https://github.com/VKhang-Bui/dthu-quizmaster', '_blank')",
              'Xem GitHub'
            )}
          </div>

          <!-- Final CTA -->
          <div style="
            text-align: center;
            padding: 32px 24px;
            background: linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle, var(--surface)) 100%);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg, 16px);
          ">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              Sẵn sàng bắt đầu học chưa? 🚀
            </div>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin: 0 0 20px; line-height: 1.6;">
              Chọn môn học, thiết lập bài thi và chinh phục điểm số ngay hôm nay.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="App.navigateTo('home')" style="display: inline-flex; align-items: center; gap: 7px; padding: 12px 24px; font-weight: 700; font-size: 14px;">
                ${Icons.get('zap', 15)} <span>Vào Trang Chủ Ôn Thi</span> ${Icons.get('arrowRight', 14)}
              </button>
              <button class="btn" onclick="App.navigateTo('terms')" style="display: inline-flex; align-items: center; gap: 7px; padding: 12px 24px; font-weight: 700; font-size: 14px;">
                ${Icons.get('terms', 15)} <span>Điều Khoản Dịch Vụ</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    `;
  },

  // ── HELPER: Timeline Item ──────────────────────────────────────────
  _aboutTimelineItem(iconHtml, title, description, dotColor) {
    return `
      <div style="
        position: relative;
        padding: 0 0 28px 0;
      ">
        <!-- Dot -->
        <div style="
          position: absolute;
          left: -27px; top: 4px;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: ${dotColor};
          border: 3px solid var(--surface);
          box-shadow: 0 0 0 2px ${dotColor}33;
          z-index: 1;
        "></div>
        <div style="
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md, 12px);
          padding: 16px 18px;
          transition: var(--transition-fast, 0.15s ease);
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="color: ${dotColor}; display: flex; align-items: center;">${iconHtml}</span>
            <strong style="font-size: 14px; color: var(--text-primary);">${title}</strong>
          </div>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin: 0; line-height: 1.65;">
            ${description}
          </p>
        </div>
      </div>
    `;
  },

  // ── HELPER: Feature Card ───────────────────────────────────────────
  _aboutFeatureCard(iconHtml, title, description, accentColor) {
    return `
      <div style="
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md, 12px);
        padding: 22px 20px;
        transition: var(--transition-fast, 0.15s ease);
        cursor: default;
      " onmouseenter="this.style.borderColor='${accentColor}44'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px ${accentColor}12'"
         onmouseleave="this.style.borderColor=''; this.style.transform=''; this.style.boxShadow=''">
        <div style="
          width: 42px; height: 42px;
          border-radius: var(--radius-sm, 8px);
          background: ${accentColor}12;
          display: flex; align-items: center; justify-content: center;
          color: ${accentColor};
          margin-bottom: 14px;
        ">${iconHtml}</div>
        <h3 style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;">${title}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.6;">${description}</p>
      </div>
    `;
  },

  // ── HELPER: Tech Badge ─────────────────────────────────────────────
  _aboutTechBadge(name, bgColor, textColor) {
    textColor = textColor || '#fff';
    return `
      <span style="
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12.5px;
        font-weight: 700;
        background: ${bgColor};
        color: ${textColor};
        letter-spacing: 0.2px;
        white-space: nowrap;
      ">${name}</span>
    `;
  },

  // ── HELPER: Contribute Card ────────────────────────────────────────
  _aboutContributeCard(iconHtml, title, description, onclickAction, buttonLabel) {
    return `
      <div style="
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md, 12px);
        padding: 22px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      ">
        <div style="color: var(--brand-primary); display: flex; align-items: center;">${iconHtml}</div>
        <div>
          <h3 style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;">${title}</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.6;">${description}</p>
        </div>
        <button class="btn btn-sm" onclick="${onclickAction}" style="
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          margin-top: auto;
          font-weight: 700;
        ">${buttonLabel} ${Icons.get('arrowRight', 12)}</button>
      </div>
    `;
  }
});
