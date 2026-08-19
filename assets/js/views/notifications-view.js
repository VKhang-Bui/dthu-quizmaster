/**
 * NOTIFICATIONS VIEW MODULE
 * Trung tâm thông báo cá nhân & Bản tin cập nhật (Changelog).
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  renderNotificationsView(container, data = {}) {
    const isLogged = StorageService.isLoggedIn();
    if (!isLogged) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="color: var(--text-tertiary); margin-bottom: 14px; display:flex; justify-content:center;">${Icons.get('bell', 54)}</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Trung Tâm Thông Báo</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Vui lòng đăng nhập tài khoản để nhận các thông báo về biến động điểm thưởng EXP, Điểm cống hiến (CP), kết quả duyệt đề thi và thông báo từ Ban quản trị.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('key', 14)} <span>Đăng Nhập Ngay</span></button>
            <button class="btn" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('home', 14)} <span>Về Trang Chủ</span></button>
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
              <span>${Icons.get('bell', 22)}</span>
              <span>Trung Tâm Thông Báo & Cập Nhật</span>
              ${unreadCount > 0 ? `<span class="badge" style="background:#ef4444; color:#fff; font-size:12px; font-weight:800;">${unreadCount} chưa đọc</span>` : ''}
            </h2>
            <p style="color: var(--text-secondary); margin-top: 4px; font-size: 13.5px;">
              Xem lịch sử biến động điểm EXP/CP, thông báo từ Admin và bản tin cập nhật tính năng mới.
            </p>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm" onclick="StorageService.markAllNotificationsAsRead('${profile.id}'); App.renderHeader(); App.renderNotificationsView(document.getElementById('mainContent'));" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('check', 13)} <span>Đánh dấu đã đọc tất cả</span>
            </button>
            <button class="btn btn-sm btn-danger" onclick="App.clearAllNotificationsConfirm('${profile.id}')" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('trash', 13)} <span>Xóa thông báo</span>
            </button>
          </div>
        </div>

        <!-- Tabs: Thông Báo Cá Nhân vs Bản Tin Cập Nhật -->
        <div class="hub-tabs" style="margin-bottom: 24px;">
          <button class="hub-tab-btn ${activeTab === 'personal' ? 'active' : ''}" onclick="App.notifTab = 'personal'; App.renderNotificationsView(document.getElementById('mainContent'));" style="display:inline-flex; align-items:center; gap:6px;">
            ${Icons.get('bell', 14)} <span>Thông Báo Cá Nhân</span> <span class="badge-tab-count">${allNotifs.length}</span>
          </button>
          <button class="hub-tab-btn ${activeTab === 'changelog' ? 'active' : ''}" onclick="App.notifTab = 'changelog'; App.renderNotificationsView(document.getElementById('mainContent'));" style="display:inline-flex; align-items:center; gap:6px;">
            ${Icons.get('sparkles', 14)} <span>Bản Tin Cập Nhật Hệ Thống</span> <span class="badge-tab-count">v3.1.4</span>
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
            <button class="btn btn-sm ${activeFilter === 'points' ? 'btn-primary' : ''}" onclick="App.notifFilter = 'points'; App.renderNotificationsView(document.getElementById('mainContent'));" style="display:inline-flex; align-items:center; gap:4px;">
              ${Icons.get('zap', 12)} <span>Biến động điểm</span> (${allNotifs.filter(n => n.pointsDelta !== null).length})
            </button>
            <button class="btn btn-sm ${activeFilter === 'admin' ? 'btn-primary' : ''}" onclick="App.notifFilter = 'admin'; App.renderNotificationsView(document.getElementById('mainContent'));" style="display:inline-flex; align-items:center; gap:4px;">
              ${Icons.get('shield', 12)} <span>Từ Quản trị viên</span> (${allNotifs.filter(n => n.type === 'admin_adjust').length})
            </button>
          </div>

          <!-- Danh sách thông báo cá nhân -->
          ${filteredNotifs.length === 0 ? `
            <div style="text-align: center; padding: 56px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
              <div style="color: var(--text-tertiary); margin-bottom: 10px; display:flex; justify-content:center;">${Icons.get('bell', 42)}</div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">Không có thông báo nào trong mục này</h3>
              <p style="color: var(--text-secondary); margin-top: 4px; font-size: 13px;">Hãy làm bài thi thử hoặc đóng góp tài liệu để nhận thông báo thưởng điểm nhé!</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${filteredNotifs.map(n => {
                let iconHtml = Icons.get('bell', 18, '', 'var(--brand-primary)');
                let badgeClass = "badge-gray";
                let pointBadge = "";

                if (n.type === "exp_reward") {
                  iconHtml = Icons.get('zap', 18, '', '#b45309');
                  badgeClass = "badge-blue";
                } else if (n.type === "cp_reward") {
                  iconHtml = Icons.get('star', 18, '', '#15803d');
                  badgeClass = "badge-success";
                } else if (n.type === "admin_adjust") {
                  iconHtml = Icons.get('shieldCheck', 18, '', '#7c3aed');
                  badgeClass = "badge-purple";
                } else if (n.type === "draft_approved") {
                  iconHtml = Icons.get('checkCircle', 18, '', '#15803d');
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
                    <div class="notif-card-icon" style="display:flex; align-items:center; justify-content:center;">${iconHtml}</div>
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
                    <button class="btn btn-sm" style="padding: 4px 8px; font-size: 11px; opacity: 0.7; display:flex; align-items:center; justify-content:center;" onclick="event.stopPropagation(); StorageService.deleteNotification('${profile.id}', '${n.id}'); App.renderHeader(); App.renderNotificationsView(document.getElementById('mainContent'));" title="Xóa thông báo này">
                      ${Icons.get('close', 11)}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        ` : `
          <!-- Tab Bản Tin Cập Nhật Hệ Thống (Release Notes & Changelog) -->
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Phiên bản 3.1.4 -->
            <div class="changelog-card" style="border-left: 4px solid #2563eb; background: linear-gradient(135deg, var(--surface) 0%, #eff6ff 100%);">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <span class="changelog-tag" style="background: #2563eb; color: #ffffff; font-weight: 800;">Phiên bản 3.1.4 · Mới nhất</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Đột Phá Bóc Tách Đề Thi: Bộ Lõi Parser Engine 3.1.4 (FSM & Pipeline O(N)), Tự Động Bẻ Khóa Phương Án Dính Hàng & Bảo Toàn Luồng Dữ Liệu RAW</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">19/08/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.75;">
                <li>
                  <strong>🚀 Tái Cấu Trúc Toàn Diện Bộ Lõi Parser Engine v3.1.4 (FSM Pipeline O(N))</strong>:
                  Chuyển đổi hoàn toàn sang mô hình Máy Trạng Thái Tuần Tự (Finite State Machine) 4 bước: <em>1. Sanitization &rarr; 2. Block Tokenization &rarr; 3. State Machine Extractor &rarr; 4. Flag & Format</em>. Bóc tách đề thi siêu tốc với độ phức tạp $O(N)$, bảo toàn 100% từ vựng khoa học, đuôi file (.fasta), công thức và câu lệnh Shell.
                </li>
                <li>
                  <strong>⚡ Tự Động Bẻ Khóa Phương Án Dính Hàng (Inline Options Splitting)</strong>:
                  Tự động nhận diện và tách rời các phương án trắc nghiệm nằm dính chùm trên cùng 1 dòng trong file Word/DOCX (ví dụ: <code>A. efetchB. xtractC. esummaryD. esearch</code>, hoặc các ký tự đặc biệt <code>//B. =C.; D. ></code>).
                </li>
                <li>
                  <strong>📄 Thuần Khiết Hóa Luồng Dữ Liệu RAW & Trao Quyền Chủ Động</strong>:
                  Module <code>pdf-extractor.js</code> và <code>parser.js</code> chỉ trích xuất dữ liệu thô nguyên bản đổ vào Textarea. Hệ thống không tự động can thiệp sửa chuỗi khi tải tệp, trao trọn quyền kiểm soát cho người dùng khi nhấn <em>"Bóc tách &amp; Phân tích lại"</em>.
                </li>
                <li>
                  <strong>🛡️ Triệt Tiêu 100% Điểm Xung Đột Từ Khóa (False-Positives)</strong>:
                  Khắc phục triệt để lỗi nhận nhầm từ vựng trong câu (như cụm <em>"để giải thích dữ liệu"</em>) thành khối lời giải; loại bỏ lỗi chia tách nhầm các chữ số thứ tự giả (như <code>10.</code>, <code>(exit status 0)</code>).
                </li>
                <li>
                  <strong>🎯 Kiểm Thử Thực Tế Hoàn Hảo Trên 2 Bộ Dữ Liệu Chuyên Ngành</strong>:
                  Đã kiểm tra trực tiếp trên tệp PDF 500+ câu và DOCX 100+ câu trắc nghiệm Tin sinh học thực tế, đạt độ chính xác 100% đáp án hợp lệ.
                </li>
                <li>
                  <strong>🎛️ Thanh Kéo Tùy Chỉnh Độ Rộng 2 Khung (Split-Pane Resizer)</strong>:
                  Tích hợp thanh phân cách kéo thả mượt mà giữa Khung Nhập Đề và Khung Xem Trước, hỗ trợ chuột và cảm ứng, có giới hạn kích thước an toàn (tối thiểu 300px), nháy đúp chuột để cân bằng 50/50 và tự động ghi nhớ kích thước tùy chỉnh.
                </li>
              </ul>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border); display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="App.navigateTo('parser')" style="font-weight: 700; background: #2563eb; border-color: #2563eb; display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('fileText', 13)} <span>Thử Nghiệm Parser Engine 3.1.4</span> ➔
                </button>
              </div>
            </div>

            <!-- Bản Vá Bảo Mật & Trang Giới Thiệu -->
            <div class="changelog-card" style="border-left: 4px solid #10b981; background: linear-gradient(135deg, var(--surface) 0%, #ecfdf5 100%);">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <span class="changelog-tag" style="background: #10b981; color: #ffffff; font-weight: 800;">Bảo Mật &amp; Hệ Thống</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Tăng Cường Bảo Mật Đám Mây, Khai Báo SEO Google &amp; Ra Mắt Trang Giới Thiệu Dự Án</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">19/08/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.75;">
                <li>
                  <strong>🔒 Bảo Vệ Dữ Liệu &amp; Khóa Kết Nối Đám Mây (Cloud Security)</strong>:
                  Tái cấu trúc mã hóa khóa kết nối Supabase, làm sạch toàn bộ dữ liệu mẫu định danh, bổ sung quy tắc loại trừ bảo mật và thiết lập hàng rào an toàn cho cơ sở dữ liệu.
                </li>
                <li>
                  <strong>🌟 Chính Thức Ra Mắt Trang Giới Thiệu Dự Án (#about)</strong>:
                  Không gian trình bày trực quan sứ mệnh giáo dục phi thương mại 100%, câu chuyện phát triển, 6 trụ cột công nghệ học tập thông minh và thông tin tác giả Shina Sanora.
                </li>
                <li>
                  <strong>🚀 Chuẩn Hóa SEO &amp; Xác Minh Google Search Console</strong>:
                  Tích hợp tệp sơ đồ trang web (Sitemap XML), chỉ dẫn bot (Robots.txt) và thẻ OpenGraph chuẩn hóa để website hiển thị tối ưu trên Google Tìm Kiếm.
                </li>
              </ul>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border); display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="App.navigateTo('about')" style="font-weight: 700; background: #059669; border-color: #059669; display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('info', 13)} <span>Khám Phá Trang Giới Thiệu</span> ➔
                </button>
              </div>
            </div>

            <!-- Phiên bản 3.1.3 -->
            <div class="changelog-card" style="border-left: 4px solid #a855f7; background: linear-gradient(135deg, var(--surface) 0%, #faf5ff 100%);">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <span class="changelog-tag" style="background: #a855f7; color: #ffffff; font-weight: 800;">Phiên bản 3.1.3</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Đại Tu Toàn Diện: YouTube Study Hub Online, Pomodoro Lặp Liên Hoàn, Zen Focus Room &amp; Tiện Ích Học Đêm</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">19/08/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.75;">
                <li>
                  <strong>🎵 YouTube Study Hub Online Không Cần URL</strong>:
                  Tìm kiếm trực tuyến không giới hạn trên YouTube với cụm API phân tán đa nguồn, phân trang <em>"Xem Thêm Video Khác"</em>, kho nhạc học tập stream 24/7 sạch bóng quảng cáo và khung Video Nổi mini (Picture-in-Picture) vừa xem bài giảng vừa làm quiz.
                </li>
                <li>
                  <strong>🍅 Đồng Hồ Pomodoro Nâng Cấp Toàn Diện</strong>:
                  Chu kỳ tự động lặp liên hoàn 4 hiệp (Auto-Loop), 4 bộ preset thời gian (Ôn Nhanh 15/3, Tiêu Chuẩn 25/5, Tiết Học 45/10, Nghiên Cứu 90/20), Smart Music Sync tự động đồng bộ phát/dừng nhạc theo hiệp, gắn mục tiêu học tập (Task Goal), bộ đếm phân tâm thông minh và hướng dẫn thư giãn mắt 20-20-20.
                </li>
                <li>
                  <strong>🧘 Không Gian Tập Trung Toàn Màn Hình (Zen Focus Room)</strong>:
                  Biến trình duyệt máy tính thành một chiếc đồng hồ Pomodoro để bàn tối giản sang trọng với kích thước số siêu lớn, loại bỏ 100% xao nhãng và thoát cực nhanh với phím <kbd>Esc</kbd>.
                </li>
                <li>
                  <strong>⌨️ Hỗ Trợ Bàn Phím Vật Lý Cho Máy Tính & 6 Âm Sắc Phím Cơ</strong>:
                  Gõ số và dấu phép tính trực tiếp trên bàn phím máy tính không cần chuột. Kho âm thanh phím cơ 0MB mở rộng 6 cấu hình: <em>🔵 Blue Switch, 🔴 Red Switch, 🟤 Cream Switch, ⌨️ Máy Đánh Chữ, 💧 Giọt Nước, 🪵 Gõ Mõ Zen</em>.
                </li>
                <li>
                  <strong>🌙 Bộ Trải Nghiệm Học Đêm Khoa Học</strong>:
                  Bổ sung Lọc ánh sáng vàng Amber Warm với thanh trượt độ ấm, Chế độ đen tuyệt đối OLED 100%, Giãn dòng & cỡ chữ đọc sách thoải mái, Ánh nến lung linh và Yên tĩnh tuyệt đối (DND).
                </li>
              </ul>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border); display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="if(window.DynamicIsland){ DynamicIsland.wakeFromStealth(); DynamicIsland.expandToFull('presets'); }" style="font-weight: 700; background: #9333ea; border-color: #9333ea; display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('radio', 13)} <span>Khám Phá & Tìm Kiếm YouTube</span> ➔
                </button>
                <button class="btn btn-sm" onclick="if(window.StudyDockView){ StudyDockView.open(); StudyDockView.selectMasterItem('pomodoro'); }" style="display:inline-flex; align-items:center; gap:5px;">
                  <span>🍅</span> <span>Mở Pomodoro & Zen Room</span>
                </button>
                <button class="btn btn-sm" onclick="App.navigateTo('guide')" style="display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('helpCircle', 13)} <span>Xem Hướng Dẫn Sử Dụng</span>
                </button>
              </div>
            </div>

            <!-- Phiên bản 3.1.2 -->
            <div class="changelog-card" style="border-left: 4px solid var(--brand-primary); background: var(--surface);">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <span class="changelog-tag" style="background: #2563eb; color: #ffffff; font-weight: 800;">Phiên bản 3.1.2</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Đảo Âm Thanh Học Tập (Dynamic Island), Đại Tu Vector SVG & Thư Viện Tài Liệu Số</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">18/08/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.75;">
                <li>
                  <strong>🏝️ Dynamic Island - Đảo Âm Thanh & Đa Phương Tiện Học Tập</strong>:
                  Tích hợp thanh đa phương tiện thông minh cố định tại đỉnh màn hình với các bài nhạc sóng não tập trung cao độ (Lo-fi Study, Baroque Focus, Deep Binaural Beats, White Noise, Mưa Đêm). Tự động thu gọn thành dải viền gợn sóng tím/đen tinh tế ở mép trên màn hình khi làm bài.
                </li>
                <li>
                  <strong>⚙️ Tùy Biến Toàn Diện Dynamic Island</strong>:
                  Cấu hình công tắc Bật/Tắt triệt để, tùy chỉnh thời gian tự ẩn (10s, 30s, 60s, Vô hiệu hóa), thanh trượt âm lượng mượt mà, tự động phát nhạc và chọn màu viền gợn sóng trong <em>Cài Đặt Hệ Thống</em>.
                </li>
                <li>
                  <strong>✨ Đại Tu Toàn Diện Hệ Thống Vector SVG & 12 Biểu Tượng Thành Viên</strong>:
                  Thay thế 100% emoji thô bằng bộ Vector SVG siêu nét và ra mắt bộ 12 biểu tượng nhận diện thành viên dạng Gradient 3D độc quyền (Sinh viên, Lập trình, Học giả, Thủ khoa, Thiên tài, Nghiên cứu, Mục tiêu, Chiến binh, Thủ lĩnh, Bảo mật, Tập trung, Tốc độ).
                </li>
                <li>
                  <strong>📚 Trình Đọc Học Liệu Số & Cây Thư Mục Đa Cấp (DocMaster)</strong>:
                  Xây dựng không gian đọc chuyên dụng hỗ trợ Markdown phong phú, chế độ bảo vệ mắt <strong>📜 Sepia</strong>, chỉnh cỡ chữ linh hoạt, thẻ học lật mặt <strong>🎴 Flashcards</strong> và tính năng <strong>🚀 Bóc tách 1-click</strong> sang Smart Parser để tạo đề thi.
                </li>
                <li>
                  <strong>🖱️ Menu Chuột Phải Chuẩn VS Code (Right-Click Context Menu)</strong>:
                  Menu chuột phải hiện đại ngay tại con trỏ: <em>Mở/Đóng, Tạo File mới, Tạo Thư mục con, Cắt (Ctrl+X), Sao chép (Ctrl+C), Dán (Ctrl+V), Đổi tên (F2), Xóa (Del)</em>.
                </li>
                <li>
                  <strong>🔒 Giới Hạn Phạm Vi Phím Tắt An Toàn</strong>:
                  Phím tắt <code>F2</code>, <code>Delete</code>, <code>Ctrl+C/X/V</code> được đóng vùng chỉ hoạt động khi bạn đang nhấp chọn trong cây mục lục, không ảnh hưởng khi bạn đang đọc bài, bôi đen văn bản hay gõ phím ở nơi khác.
                </li>
                <li>
                  <strong>⌨️ Quản Lý Cài Đặt Phím Tắt Hệ Thống</strong>:
                  Bổ sung màn hình cấu hình và bảng tra cứu phím tắt trực quan trong mục <em>Cài Đặt Hệ Thống ➔ Quản Lý Phím Tắt</em>.
                </li>
                <li>
                  <strong>📂 Kéo Thả Tự Mở Sau 1 Giây</strong>:
                  Kéo tệp hoặc thư mục rê qua thư mục đang đóng trong 1 giây sẽ tự động mở rộng để bạn thả đúng thư mục con mong muốn.
                </li>
              </ul>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border); display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="App.renderDrawerLevel('settings-island'); App.openUserDrawer();" style="font-weight: 700; display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('volume2', 13)} <span>Cài Đặt Dynamic Island</span> ➔
                </button>
                <button class="btn btn-sm" onclick="App.navigateTo('materials')" style="display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('bookOpen', 13)} <span>Thư Viện Tài Liệu</span>
                </button>
                <button class="btn btn-sm" onclick="App.navigateTo('guide')" style="display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('helpCircle', 13)} <span>Hướng Dẫn Sử Dụng</span>
                </button>
                <button class="btn btn-sm" onclick="App.renderDrawerLevel('settings-shortcuts'); App.openUserDrawer();" style="display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('keyboard', 13)} <span>Cài Đặt Phím Tắt</span>
                </button>
              </div>
            </div>

            <!-- Phiên bản 3.1.1 -->
            <div class="changelog-card" style="border-left: 4px solid #10b981; background: var(--surface);">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <span class="changelog-tag" style="background: #059669; color: #ffffff; font-weight: 800;">Phiên bản 3.1.1</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Nâng Cấp Hệ Thống Nhận Diện PDF Tự Động & Lịch Sử Thi 10 Bài</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">18/08/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.75;">
                <li>
                  <strong>📜 Ban Hành Điều Khoản Dịch Vụ &amp; Thỏa Thuận Sử Dụng (ToS)</strong>:
                  Công bố chính thức văn bản pháp lý 6 Điều khoản độc lập bảo vệ bản quyền tác giả <strong>Shina Sanora</strong>, cam kết bảo mật quyền riêng tư không thương mại hóa dữ liệu và thiết lập cơ chế tiếp nhận gỡ bỏ bản quyền khẩn cấp.
                </li>
                <li>
                  <strong>🚀 Cập nhật Engine PDF.js lõi lên chuẩn 3.11</strong>:
                  Cải thiện hiệu suất bóc tách tài liệu, tự động phân giải cấu trúc PDF/Word tốc độ cao.
                </li>
                <li>
                  <strong>🚀 Nâng Giới Hạn Lưu Trữ Lịch Sử Thi Lên 10 Lần</strong>:
                  Mở rộng dung lượng từ 3 bài lên tối đa <strong>10 bài thi thử gần nhất</strong> cho mỗi tài khoản, tự động luân chuyển bài mới theo cơ chế FIFO.
                </li>
                <li>
                  <strong>⏳ Tính Năng Tự Động Xóa Bài Thi Sau 30 Ngày (TTL 30 Days)</strong>:
                  Hệ thống tự động lọc và xóa sạch các bài thi đã nộp quá 30 ngày để tối ưu hóa hiệu năng bộ nhớ LocalStorage.
                </li>
                <li>
                  <strong>🛡️ Chốt Chặn Pháp Lý Clickwrap & Tự Động Lưu Nháp Form</strong>:
                  Tích hợp Checkbox bắt buộc đồng ý điều khoản khi đăng ký tài khoản mới, hỗ trợ xem tóm tắt điều khoản trực tiếp qua Popup Modal tại chỗ.
                </li>
              </ul>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border); display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="App.navigateTo('terms')" style="font-weight: 700;">
                  📜 Đọc Toàn Văn 6 Điều Khoản Dịch Vụ ➔
                </button>
                <button class="btn btn-sm" onclick="App.navigateTo('history')">
                  📜 Xem Lịch Sử Thi Của Bạn (${StorageService.getUserExamHistory().length}/10)
                </button>
              </div>
            </div>

            <!-- Phiên bản 2.2 -->
            <div class="changelog-card">
              <div class="changelog-card-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="changelog-tag" style="background:#f1f5f9; color:#475569;">Phiên bản 2.2</span>
                  <strong style="font-size: 16.5px; color: var(--text-primary);">Hệ Thống Điểm Cống Hiến Sản Lượng & Trung Tâm Thông Báo</strong>
                </div>
                <span style="font-size: 12.5px; color: var(--text-tertiary);">Tháng 8/2026</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;">
                <li><strong>🌟 Thang Điểm Cống Hiến (CP) Theo Sản Lượng</strong>: Tính điểm công bằng và cộng dồn lũy tiến (cứ 50 câu hỏi trắc nghiệm được duyệt ➔ +5 CP; cứ 5.000 ký tự tài liệu chia sẻ ➔ +5 CP). Chống spam và không buff điểm tràn lan.</li>
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
  }
});
