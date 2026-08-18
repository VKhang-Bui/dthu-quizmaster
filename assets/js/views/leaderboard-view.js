/**
 * LEADERBOARD VIEW MODULE
 * Bảng xếp hạng công khai, Quản trị mùa giải (Seasons), Huy hiệu & Danh hiệu.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
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
              ${Icons.get('crown', 14)} <span>Trang Quản Trị BXH & Mùa Giải</span> ${Icons.get('arrowRight', 12)}
            </button>
          </div>
        ` : ''}

        <!-- Header & Season Pill -->
        <div style="margin-bottom: 22px; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; background: #e0f2fe; color: #0369a1; border-radius: 20px; font-size: 12.5px; font-weight: 700; margin-bottom: 8px;">
            <span>${Icons.get('clock', 13)}</span> <span>Mùa giải: <strong>${settings.seasonName || 'Học Kỳ 1 (2026 - 2027)'}</strong></span>
          </div>
          <h2 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0; display:flex; align-items:center; justify-content:center; gap:8px;">
            <span style="color:#d97706;">${Icons.get('trophy', 26)}</span>
            <span>Bảng Xếp Hạng Sinh Viên DThu</span>
          </h2>
          <p style="color: var(--text-secondary); margin-top: 6px; font-size: 13.5px; max-width: 680px; margin-left: auto; margin-right: auto;">
            Tôn vinh sinh viên có thành tích rèn luyện thi thử xuất sắc và đóng góp xây dựng ngân hàng tài liệu học tập toàn diện cho trường Đại học Đồng Tháp.
          </p>

          <!-- Bộ Chọn Phạm Vi: Mùa Giải Hiện Tại vs Tổng Các Mùa (All-Time) -->
          <div style="display: inline-flex; background: var(--surface-subtle); padding: 4px; border-radius: 24px; border: 1px solid var(--border); margin-top: 10px; gap: 4px;">
            <button class="btn btn-sm ${isSeason ? 'btn-primary' : ''}" style="border-radius: 20px; font-size: 12.5px; font-weight: 700; padding: 5px 14px; display:inline-flex; align-items:center; gap:5px;" onclick="App.leaderboardScope = 'season'; App.renderLeaderboardView(document.getElementById('mainContent'));">
              ${Icons.get('clock', 13)} <span>Điểm Mùa Này (${settings.seasonName || 'Mùa Hiện Tại'})</span>
            </button>
            <button class="btn btn-sm ${!isSeason ? 'btn-primary' : ''}" style="border-radius: 20px; font-size: 12.5px; font-weight: 700; padding: 5px 14px; display:inline-flex; align-items:center; gap:5px;" onclick="App.leaderboardScope = 'all_time'; App.renderLeaderboardView(document.getElementById('mainContent'));">
              ${Icons.get('crown', 13)} <span>Điểm Tổng Các Mùa (All-Time)</span>
            </button>
          </div>
        </div>

        <!-- 📊 Ruy-băng Thống Kê Tổng Quan Toàn Trường -->
        <div class="leaderboard-stats-ribbon">
          <div class="leaderboard-stat-item">
            <div class="leaderboard-stat-icon" style="color: var(--brand-primary); display:flex; align-items:center; justify-content:center;">${Icons.get('student', 24)}</div>
            <div>
              <div class="leaderboard-stat-num">${stats.totalStudents}</div>
              <div class="leaderboard-stat-label">Sinh viên tranh tài</div>
            </div>
          </div>
          <div class="leaderboard-stat-item">
            <div class="leaderboard-stat-icon" style="color: #b45309; display:flex; align-items:center; justify-content:center;">${Icons.get('zap', 24)}</div>
            <div>
              <div class="leaderboard-stat-num" style="color: #b45309;">${stats.totalExp.toLocaleString()}</div>
              <div class="leaderboard-stat-label">Tổng EXP (${isSeason ? 'Mùa này' : 'All-Time'})</div>
            </div>
          </div>
          <div class="leaderboard-stat-item">
            <div class="leaderboard-stat-icon" style="color: #15803d; display:flex; align-items:center; justify-content:center;">${Icons.get('star', 24)}</div>
            <div>
              <div class="leaderboard-stat-num" style="color: #15803d;">${stats.totalCp.toLocaleString()}</div>
              <div class="leaderboard-stat-label">Tổng CP (${isSeason ? 'Mùa này' : 'All-Time'})</div>
            </div>
          </div>
          <div class="leaderboard-stat-item">
            <div class="leaderboard-stat-icon" style="color: #0284c7; display:flex; align-items:center; justify-content:center;">${Icons.get('fileText', 24)}</div>
            <div>
              <div class="leaderboard-stat-num" style="color: #0284c7;">${stats.totalQuestions.toLocaleString()}</div>
              <div class="leaderboard-stat-label">Câu hỏi ngân hàng</div>
            </div>
          </div>
        </div>

        <!-- Tab Selector: EXP Học Tập vs CP Cống Hiến -->
        <div class="hub-tabs" style="max-width: 520px; margin: 0 auto 24px auto;">
          <button class="hub-tab-btn ${activeTab === 'exp' ? 'active' : ''}" onclick="App.leaderboardTab = 'exp'; App.renderLeaderboardView(document.getElementById('mainContent'));" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">
            ${Icons.get('zap', 14)} <span>Top Học Tập (EXP)</span>
          </button>
          <button class="hub-tab-btn ${activeTab === 'cp' ? 'active' : ''}" onclick="App.leaderboardTab = 'cp'; App.renderLeaderboardView(document.getElementById('mainContent'));" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">
            ${Icons.get('star', 14)} <span>Top Cống Hiến (CP)</span>
          </button>
        </div>

        <!-- 🔍 Thanh Tìm Kiếm, Lọc Khoa & Nút "Vị Trí Của Tôi" -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 24px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 10px; flex: 1; min-width: 280px; flex-wrap: wrap;">
            <div class="search-input-wrapper" style="flex: 1; min-width: 180px;">
              <span class="search-icon" style="display:flex; align-items:center;">${Icons.get('search', 15)}</span>
              <input type="text" id="leaderboardSearchInput" class="form-control" placeholder="Tìm theo tên, MSSV..." value="${this.leaderboardSearch}" oninput="App.onSearchLeaderboard(this.value)">
            </div>
            <select id="leaderboardDeptFilter" class="form-control" style="width: auto; min-width: 200px;" onchange="App.onFilterLeaderboardDept(this.value)">
              <option value="all" ${this.leaderboardDept === 'all' ? 'selected' : ''}>Tất cả Khoa / Viện</option>
              ${departments.map(d => `<option value="${d}" ${this.leaderboardDept === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>

          <button class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;" onclick="App.jumpToMyRank()">
            ${Icons.get('target', 14)} <span>Vị trí của tôi</span>
          </button>
        </div>

        <!-- 🏆 Podium Top 3 Chuẩn Thi Đấu -->
        ${leaderboard.length > 0 && !this.leaderboardSearch ? `
          <div class="podium-container">
            <!-- Rank 2 -->
            <div class="podium-card podium-rank-2">
              <div style="font-size: 13px; font-weight: 800; color: #64748b; margin-bottom: 6px;">
                ${settings.top2Title || 'Hạng 2 (Top 2)'}
              </div>
              <div class="podium-avatar" style="display:flex; align-items:center; justify-content:center; color:#64748b;">${Icons.get('shieldCheck', 32)}</div>
              <div class="podium-name">${top2 ? top2.name : 'Đang cập nhật'}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${top2 ? top2.department : ''}</div>
              ${top2 && top2.customBadge ? `<div style="margin-top: 4px;"><span class="custom-badge-pill">${top2.customBadge}</span></div>` : ''}
              <div class="podium-exp" style="${isCp ? 'background:#fef3c7; color:#b45309;' : ''}">
                ${isCp ? `CP: ${top2 ? top2.cp : 0}` : `EXP: ${top2 ? top2.exp : 0}`}
              </div>
            </div>

            <!-- Rank 1 (Top 1) -->
            <div class="podium-card podium-rank-1">
              <div style="font-size: 13px; font-weight: 800; color: #d97706; margin-bottom: 6px;">
                ${settings.top1Title || 'Hạng 1 (Quán Quân)'}
              </div>
              <div class="podium-avatar" style="display:flex; align-items:center; justify-content:center; color:#d97706;">${Icons.get('crown', 36)}</div>
              <div class="podium-name" style="font-size: 18px;">${top1 ? top1.name : 'Đang cập nhật'}</div>
              <div style="font-size: 12.5px; color: var(--text-secondary);">${top1 ? top1.department : ''}</div>
              ${top1 && top1.customBadge ? `<div style="margin-top: 4px;"><span class="custom-badge-pill">${top1.customBadge}</span></div>` : ''}
              <div class="podium-exp" style="font-size: 16px; ${isCp ? 'background:#fef3c7; color:#b45309;' : ''}">
                ${isCp ? `CP: ${top1 ? top1.cp : 0}` : `EXP: ${top1 ? top1.exp : 0}`}
              </div>
            </div>

            <!-- Rank 3 -->
            <div class="podium-card podium-rank-3">
              <div style="font-size: 13px; font-weight: 800; color: #c2410c; margin-bottom: 6px;">
                ${settings.top3Title || 'Hạng 3 (Top 3)'}
              </div>
              <div class="podium-avatar" style="display:flex; align-items:center; justify-content:center; color:#c2410c;">${Icons.get('shieldCheck', 32)}</div>
              <div class="podium-name">${top3 ? top3.name : 'Đang cập nhật'}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${top3 ? top3.department : ''}</div>
              ${top3 && top3.customBadge ? `<div style="margin-top: 4px;"><span class="custom-badge-pill">${top3.customBadge}</span></div>` : ''}
              <div class="podium-exp" style="${isCp ? 'background:#fef3c7; color:#b45309;' : ''}">
                ${isCp ? `CP: ${top3 ? top3.cp : 0}` : `EXP: ${top3 ? top3.exp : 0}`}
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
                    <div style="color: var(--text-tertiary); margin-bottom: 8px; display:flex; justify-content:center;">${Icons.get('search', 36)}</div>
                    <strong>Không tìm thấy sinh viên nào phù hợp với bộ lọc!</strong>
                  </td>
                </tr>
              ` : leaderboard.map(item => `
                <tr id="${item.isCurrentUser ? 'leaderboard-my-row' : 'leaderboard-row-' + item.id}" class="${item.isCurrentUser ? 'current-user-row' : ''}">
                  <td style="text-align: center; font-weight: 800;">
                    ${item.rank === 1 ? `<span style="color:#d97706; display:inline-flex; align-items:center; gap:2px;">${Icons.get('crown', 14)} 1</span>` : item.rank === 2 ? `<span style="color:#64748b; display:inline-flex; align-items:center; gap:2px;">${Icons.get('shieldCheck', 14)} 2</span>` : item.rank === 3 ? `<span style="color:#c2410c; display:inline-flex; align-items:center; gap:2px;">${Icons.get('shieldCheck', 14)} 3</span>` : item.rank}
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
                    ${isCp ? `+${(item.cp || 0).toLocaleString()} CP` : `+${(item.exp || 0).toLocaleString()} EXP`}
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

  renderLeaderboardAdminView(container, data = {}) {
    const isLogged = StorageService.isLoggedIn();
    const profile = StorageService.getUserProfile();
    const isAdmin = isLogged && (profile.role === "admin" || StorageService.hasPermission("canManageUsers"));

    if (!isAdmin) {
      container.innerHTML = `
        <div style="max-width: 600px; margin: 60px auto; text-align: center; padding: 32px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
          <div style="color: #dc2626; margin-bottom: 16px; display:flex; justify-content:center;">${Icons.get('lock', 48)}</div>
          <h3 style="font-size: 20px; font-weight: 800; color: #b91c1c;">Khu Vực Hạn Chế Truy Cập</h3>
          <p style="color: var(--text-secondary); margin: 8px 0 20px 0; font-size: 14px;">
            Trang Quản Trị Bảng Xếp Hạng & Mùa Giải chỉ dành riêng cho Quản Trị Viên (Admin) và Ban Điều Hành hệ thống.
          </p>
          <button class="btn btn-primary" onclick="App.navigateTo('leaderboard')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('trophy', 14)} <span>Quay Lại Bảng Xếp Hạng</span></button>
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
              <span>${Icons.get('crown', 14)}</span> <span>TRUNG TÂM QUẢN TRỊ ADMIN TOÀN DIỆN</span>
            </div>
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0;">Quản Trị Bảng Xếp Hạng & Vòng Đời Mùa Giải</h2>
            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Toàn quyền tạo mùa, sửa thể lệ, reset điểm, đóng băng, phân quyền, kiểm toán và quản trị thành viên.</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm" onclick="App.navigateTo('leaderboard')" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('trophy', 13)} <span>Xem BXH Công Khai</span> ${Icons.get('arrowRight', 11)}
            </button>
          </div>
        </div>

        <!-- 3 Tab Chức Năng Quản Trị Chuyên Sâu Tinh Gọn -->
        <div class="hub-tabs" style="margin-bottom: 24px; flex-wrap: wrap;">
          <button class="hub-tab-btn ${this.adminLeaderboardTab === 'seasons' ? 'active' : ''}" onclick="App.switchAdminLeaderboardTab('seasons')" style="display:inline-flex; align-items:center; gap:6px;">
            ${Icons.get('trophy', 14)} <span>Quản Lý Mùa Giải</span> (${seasons.length})
          </button>
          <button class="hub-tab-btn ${this.adminLeaderboardTab === 'members' ? 'active' : ''}" onclick="App.switchAdminLeaderboardTab('members')" style="display:inline-flex; align-items:center; gap:6px;">
            ${Icons.get('users', 14)} <span>Quản Trị Thành Viên</span> (${allUsers.length})
          </button>
          <button class="hub-tab-btn ${this.adminLeaderboardTab === 'audit_logs' ? 'active' : ''}" onclick="App.switchAdminLeaderboardTab('audit_logs')" style="display:inline-flex; align-items:center; gap:6px;">
            ${Icons.get('fileText', 14)} <span>Nhật Ký Kiểm Toán</span> (${auditLogs.length})
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
                    <span>Cho phép sinh viên xem BXH công khai</span>
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

                <button class="btn btn-sm btn-primary" onclick="App.saveAdminLeaderboardDisplaySettingsAction()" style="display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('download', 13)} <span>Lưu Thiết Lập Hiển Thị</span>
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
                  ${Icons.get('plus', 13)} <span>Tạo Mùa Giải Mới</span>
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
    a.download = `Shinora_QuizMaster_MuaGiai_${(season.code || season.id)}.csv`;
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
      this.showToast("🔒 Vui lòng đăng nhập tài khoản để xem vị trí của bạn trên Bảng Xếp Hạng!", "warning", 3500);
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
      "✍️ Cây Bút Vàng Shinora",
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
    const fileName = `BangXepHang_Shinora_${activeTab.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast(`📥 Đã tải xuống báo cáo "${fileName}" thành công!`, "success", 3500);
  }
});
