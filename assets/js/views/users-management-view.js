/**
 * USERS MANAGEMENT VIEW MODULE (v4.2.0-beta.a1f8c3)
 * Bảng điều khiển quản trị thành viên, Phân quyền, Điểm số, và Trạng thái Live Presence.
 * Thiết kế Modern Admin Console tinh gọn, đẳng cấp, chuẩn Event-Driven (0 Polling).
 */

Object.assign(App, {
  async renderUsersManagementView(container) {
    const profile = StorageService.getUserProfile();
    const canManage = profile.role === "admin" || StorageService.hasPermission("canManageUsers");

    if (!canManage) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 600px; margin: 0 auto;">
          <div style="color: var(--text-tertiary); margin-bottom: 12px; display:flex; justify-content:center;">${Icons.get('shield', 52)}</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Khu vực dành riêng cho Quản Trị Viên (Admin)</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Bạn hiện đang đăng nhập với vai trò <strong>${profile.role === 'editor' ? 'Ban Biên Tập (Editor)' : 'Sinh Viên (Student)'}</strong> và không có quyền truy cập vào bảng điều khiển quản lý người dùng.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('key', 14)} <span>Đổi sang tài khoản Admin</span></button>
            <button class="btn" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('home', 14)} <span>Về Trang chủ</span></button>
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

    // Tự động kéo dữ liệu mới nhất từ Cloudflare D1 khi mở trang
    if (typeof StorageService !== "undefined" && typeof StorageService.syncWithCloud === "function") {
      await StorageService.syncWithCloud();
    }

    const allUsers = StorageService.getAllUsers();
    const activeUsers = StorageService.getActiveUsers();
    const pendingUsers = StorageService.getPendingUsers();
    const resetRequests = StorageService.getResetRequests();
    const auditLogs = StorageService.getAuditLogs();

    const filteredActiveUsers = this.getFilteredActiveUsers();

    const admins = allUsers.filter(u => u.role === "admin" && u.status === "active");
    const editors = allUsers.filter(u => u.role === "editor" && u.status === "active");
    const depts = [...new Set(allUsers.map(u => u.department || "Khoa Kỹ thuật - Công nghệ"))];

    container.innerHTML = `
      <div class="view-users-management" style="max-width: 1280px; margin: 0 auto; padding: 24px 16px;">
        <!-- 1. Header & Quick Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0; display:flex; align-items:center; gap:8px;">
                ${Icons.get('users', 22)} <span>Quản Trị Người Dùng & Phân Quyền</span>
              </h2>
              <span class="badge" style="background:#e0f2fe; color:#0284c7; font-weight:800; font-size:11px;">v4.2.0</span>
            </div>
            <p style="color: var(--text-secondary); margin: 4px 0 0 0; font-size: 13.5px;">
              Quản lý danh sách sinh viên, cấp quyền biên tập viên, kiểm toán hoạt động và hỗ trợ tài khoản.
            </p>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <button class="btn" style="border-color: #6366f1; color: #4338ca; font-weight: 700; font-size:13px; display:inline-flex; align-items:center; gap:5px;" onclick="App.exportUsersCSV()" title="Xuất danh sách thành viên ra file CSV / Excel">
              ${Icons.get('download', 14)} <span>Xuất CSV</span>
            </button>
            <button class="btn" style="border-color: #10b981; color: #047857; font-weight: 700; font-size:13px; display:inline-flex; align-items:center; gap:5px;" onclick="App.refreshUsersFromCloud()">
              ${Icons.get('refresh', 14)} <span>Làm Mới Cloud</span>
            </button>
            <button class="btn" style="border-color: #0284c7; color: #0284c7; font-size:13px; display:inline-flex; align-items:center; gap:5px;" onclick="App.openAppsScriptConfigModal()">
              ${Icons.get('settings', 14)} <span>Apps Script</span>
            </button>
            <button class="btn btn-primary" onclick="App.openCreateUserModal()" style="font-size:13px; font-weight:700; display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('plus', 14)} <span>Thêm Thành Viên</span>
            </button>
            <button class="btn" onclick="App.openAccountSwitcherModal()" style="font-size:13px; display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('user', 14)} <span>Đổi Tài Khoản</span>
            </button>
          </div>
        </div>

        <!-- 2. Khối 4 Thẻ Mini Metric Badges -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <!-- Thẻ 1: Hoạt động -->
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${Icons.get('users', 20)}
            </div>
            <div>
              <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); line-height: 1;">${activeUsers.length}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; font-weight: 600;">Thành viên hoạt động</div>
            </div>
          </div>

          <!-- Thẻ 2: Chờ duyệt -->
          <div style="background: ${pendingUsers.length > 0 ? '#fffbeb' : 'var(--surface)'}; border: 1px solid ${pendingUsers.length > 0 ? '#fde68a' : 'var(--border)'}; border-radius: var(--radius-sm); padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: ${pendingUsers.length > 0 ? '#fef3c7' : 'var(--surface-subtle)'}; color: #b45309; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${Icons.get('clock', 20)}
            </div>
            <div>
              <div style="font-size: 22px; font-weight: 800; color: #b45309; line-height: 1;">${pendingUsers.length}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; font-weight: 600;">Hồ sơ chờ phê duyệt</div>
            </div>
          </div>

          <!-- Thẻ 3: Quản trị & Biên tập -->
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: #fdf4ff; color: #86198f; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${Icons.get('crown', 20)}
            </div>
            <div>
              <div style="font-size: 22px; font-weight: 800; color: #86198f; line-height: 1;">${admins.length + editors.length}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; font-weight: 600;">Admin (${admins.length}) · Editor (${editors.length})</div>
            </div>
          </div>

          <!-- Thẻ 4: CSKH / Quên PIN -->
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: #fee2e2; color: #b91c1c; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${Icons.get('helpCircle', 20)}
            </div>
            <div>
              <div style="font-size: 22px; font-weight: 800; color: #b91c1c; line-height: 1;">${resetRequests.filter(r => r.status === 'pending').length}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; font-weight: 600;">Yêu cầu CSKH / Quên PIN</div>
            </div>
          </div>
        </div>

        <!-- 3. Segmented Hub Bar (4 Tabs Gọn Gàng) -->
        <div class="admin-tab-bar" style="margin-bottom: 16px; display: flex; gap: 8px; border-bottom: 2px solid var(--border); padding-bottom: 8px; flex-wrap: wrap;">
          <button class="admin-tab-btn ${this.adminUserTab === 'active' ? 'active' : ''}" onclick="App.switchAdminUserTab('active')" style="display:inline-flex; align-items:center; gap:6px; font-size:13.5px; font-weight:700;">
            ${Icons.get('users', 15)} <span>Thành Viên Hoạt Động</span> <span class="badge" style="background:#e2e8f0; color:#334155; font-size:11px;">${activeUsers.length}</span>
          </button>
          <button class="admin-tab-btn ${this.adminUserTab === 'pending' ? 'active' : ''}" onclick="App.switchAdminUserTab('pending')" style="display:inline-flex; align-items:center; gap:6px; font-size:13.5px; font-weight:700;">
            ${Icons.get('clock', 15)} <span>Chờ Phê Duyệt</span> ${pendingUsers.length > 0 ? `<span class="badge-pending">${pendingUsers.length} mới</span>` : `<span class="badge" style="background:#e2e8f0; color:#334155; font-size:11px;">0</span>`}
          </button>
          <button class="admin-tab-btn ${this.adminUserTab === 'resets' ? 'active' : ''}" onclick="App.switchAdminUserTab('resets')" style="display:inline-flex; align-items:center; gap:6px; font-size:13.5px; font-weight:700;">
            ${Icons.get('helpCircle', 15)} <span>Hỗ Trợ & Quên PIN</span> <span class="badge" style="background:#fee2e2; color:#b91c1c; font-size:11px;">${resetRequests.length}</span>
          </button>
          <button class="admin-tab-btn ${this.adminUserTab === 'audit_logs' ? 'active' : ''}" onclick="App.switchAdminUserTab('audit_logs')" style="display:inline-flex; align-items:center; gap:6px; font-size:13.5px; font-weight:700;">
            ${Icons.get('fileText', 15)} <span>Nhật Ký Hoạt Động</span> <span class="badge" style="background:#f1f5f9; color:#475569; font-size:11px;">${auditLogs.length}</span>
          </button>
        </div>

        <!-- 4. Nội dung theo Tab được chọn -->
        ${this.adminUserTab === 'active' ? `
          <!-- Thanh Tìm Kiếm & Bộ Lọc -->
          <div class="search-filter-bar" style="margin: 0 0 14px 0; display:flex; gap:10px; flex-wrap:wrap;">
            <div class="search-input-wrapper" style="flex:1; min-width:240px;">
              <span class="search-icon" style="display:flex; align-items:center;">${Icons.get('search', 15)}</span>
              <input type="text" id="userSearchInput" class="form-control" placeholder="Tìm theo Họ tên, MSSV, Email..." value="${this.userSearchQuery || ''}" oninput="App.onSearchUsers()">
            </div>
            <select id="userRoleFilter" class="form-control" style="width: auto; min-width: 170px;" onchange="App.onSearchUsers()">
              <option value="all" ${this.userRoleFilter === 'all' ? 'selected' : ''}>Tất cả vai trò</option>
              <option value="admin" ${this.userRoleFilter === 'admin' ? 'selected' : ''}>Quản trị viên (Admin)</option>
              <option value="editor" ${this.userRoleFilter === 'editor' ? 'selected' : ''}>Ban Biên Tập (Editor)</option>
              <option value="student" ${this.userRoleFilter === 'student' ? 'selected' : ''}>Sinh viên</option>
            </select>
            <select id="userDeptFilter" class="form-control" style="width: auto; min-width: 210px;" onchange="App.onSearchUsers()">
              <option value="all" ${this.userDeptFilter === 'all' ? 'selected' : ''}>Tất cả khoa / ngành</option>
              ${depts.map(d => `<option value="${d}" ${this.userDeptFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
            ${(this.userSearchQuery || this.userRoleFilter !== 'all' || this.userDeptFilter !== 'all') ? `
              <button class="btn btn-sm" onclick="App.clearUserFilters()" title="Xóa toàn bộ bộ lọc">
                🔄 Xóa lọc
              </button>
            ` : ''}
          </div>

          <!-- Thanh Thao Tác Hàng Loạt -->
          ${this.selectedUserIds && this.selectedUserIds.size > 0 ? `
            <div id="usersBulkToolbar" style="background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #0369a1;">
                <span>☑️ Đã chọn: <strong>${this.selectedUserIds.size}</strong> thành viên</span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm" style="background:#fef3c7; color:#b45309; border-color:#fde68a; font-weight:700;" onclick="App.openBulkAdjustPointsModal('users')">
                  ⚡ Sửa Điểm (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5; font-weight:700;" onclick="App.bulkToggleUserStatusAction('suspended')">
                  🔒 Khóa (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm" style="background:#dcfce7; color:#15803d; border-color:#86efac; font-weight:700;" onclick="App.bulkToggleUserStatusAction('active')">
                  🔓 Mở (${this.selectedUserIds.size})
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

          <!-- Bảng Danh Sách Thành Viên (Modern Admin Console Table) -->
          <div class="users-table-container" style="border: 1px solid var(--border); border-radius: var(--radius-md); overflow-x: auto; background: var(--surface);">
            <table class="users-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
              <thead>
                <tr style="background: var(--surface-subtle); border-bottom: 2px solid var(--border); color: var(--text-secondary); font-size: 12.5px; text-transform: uppercase;">
                  <th style="width: 36px; text-align: center; padding: 12px 8px;">
                    <input type="checkbox" id="selectAllActiveUsers" ${filteredActiveUsers.length > 0 && filteredActiveUsers.every(u => this.selectedUserIds && this.selectedUserIds.has(u.id)) ? 'checked' : ''} onchange="App.toggleSelectAllUsers(this.checked, 'active')" title="Chọn tất cả">
                  </th>
                  <th style="padding: 12px 14px;">Thành Viên & Avatar</th>
                  <th style="padding: 12px 12px;">Trạng Thái Live</th>
                  <th style="padding: 12px 12px;">Khoa / Lớp</th>
                  <th style="padding: 12px 12px;">Vai Trò & Quyền Hạn</th>
                  <th style="padding: 12px 12px;">Điểm Thưởng (Mùa / Tổng)</th>
                  <th style="text-align: right; padding: 12px 14px;">Thao Tác</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                ${this.renderUsersTableRows(filteredActiveUsers)}
              </tbody>
            </table>
          </div>
        ` : this.adminUserTab === 'pending' ? `
          <!-- Tab Hồ Sơ Chờ Phê Duyệt -->
          <div class="users-table-container" style="border: 1px solid var(--border); border-radius: var(--radius-md); overflow-x: auto; background: var(--surface);">
            <table class="users-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
              <thead>
                <tr style="background: var(--surface-subtle); border-bottom: 2px solid var(--border); color: var(--text-secondary); font-size: 12.5px; text-transform: uppercase;">
                  <th style="width: 36px; text-align: center; padding: 12px 8px;">
                    <input type="checkbox" id="selectAllPendingUsers" ${pendingUsers.length > 0 && pendingUsers.every(u => this.selectedUserIds && this.selectedUserIds.has(u.id)) ? 'checked' : ''} onchange="App.toggleSelectAllUsers(this.checked, 'pending')" title="Chọn tất cả">
                  </th>
                  <th style="padding: 12px 14px;">Hồ Sơ Sinh Viên</th>
                  <th style="padding: 12px 12px;">Khoa / Ngành</th>
                  <th style="padding: 12px 12px;">Email Đăng Ký</th>
                  <th style="padding: 12px 12px;">Thời Điểm Nộp</th>
                  <th style="padding: 12px 12px;">Trạng Thái</th>
                  <th style="text-align: right; padding: 12px 14px;">Xử Lý</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderPendingUsersTableRows(pendingUsers)}
              </tbody>
            </table>
          </div>
        ` : this.adminUserTab === 'resets' ? `
          <!-- Tab Yêu Cầu Hỗ Trợ / Quên PIN -->
          <div class="users-table-container" style="border: 1px solid var(--border); border-radius: var(--radius-md); overflow-x: auto; background: var(--surface);">
            <table class="users-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
              <thead>
                <tr style="background: var(--surface-subtle); border-bottom: 2px solid var(--border); color: var(--text-secondary); font-size: 12.5px; text-transform: uppercase;">
                  <th style="padding: 12px 14px;">Sinh Viên / Mã Ticket</th>
                  <th style="padding: 12px 12px;">Liên Hệ</th>
                  <th style="padding: 12px 12px;">Vấn Đề / Nội Dung</th>
                  <th style="padding: 12px 12px;">Thời Điểm</th>
                  <th style="padding: 12px 12px;">Trạng Thái</th>
                  <th style="text-align: right; padding: 12px 14px;">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderResetRequestsTableRows(resetRequests)}
              </tbody>
            </table>
          </div>
        ` : `
          <!-- Tab Nhật Ký Kiểm Toán Hệ Thống -->
          <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 13px; font-weight: 700; color: var(--text-secondary);">Lọc theo hành động:</span>
            <button class="btn btn-sm ${this.auditLogActionFilter === 'all' ? 'btn-primary' : ''}" onclick="App.onUserAuditFilterChange('all')">Tất cả (${auditLogs.length})</button>
            <button class="btn btn-sm ${this.auditLogActionFilter === 'EDIT_USER' ? 'btn-primary' : ''}" onclick="App.onUserAuditFilterChange('EDIT_USER')">Sửa Người Dùng</button>
            <button class="btn btn-sm ${this.auditLogActionFilter === 'ADJUST_POINTS' ? 'btn-primary' : ''}" onclick="App.onUserAuditFilterChange('ADJUST_POINTS')">Điều Chỉnh Điểm</button>
            <button class="btn btn-sm ${this.auditLogActionFilter === 'APPROVE' ? 'btn-primary' : ''}" onclick="App.onUserAuditFilterChange('APPROVE')">Phê Duyệt</button>
          </div>

          <div class="users-table-container" style="border: 1px solid var(--border); border-radius: var(--radius-md); overflow-x: auto; background: var(--surface);">
            <table class="users-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
              <thead>
                <tr style="background: var(--surface-subtle); border-bottom: 2px solid var(--border); color: var(--text-secondary); font-size: 12.5px; text-transform: uppercase;">
                  <th style="padding: 12px 14px;">Thời Gian</th>
                  <th style="padding: 12px 12px;">Người Thực Hiện</th>
                  <th style="padding: 12px 12px;">Hành Động</th>
                  <th style="padding: 12px 12px;">Đối Tượng</th>
                  <th style="padding: 12px 14px;">Chi Tiết & Lý Do</th>
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

  renderUsersTableRows(users) {
    if (!users || users.length === 0) {
      return `
        <tr>
          <td colspan="7" style="text-align: center; padding: 48px; color: var(--text-tertiary);">
            Không tìm thấy thành viên nào phù hợp với bộ lọc.
          </td>
        </tr>
      `;
    }

    const currentProfile = StorageService.getUserProfile();

    return users.map(u => {
      const isCurrent = currentProfile && currentProfile.id === u.id;
      const isSelected = this.selectedUserIds && this.selectedUserIds.has(u.id);
      const perms = u.permissions || {};

      let roleBadge = `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:12px;">👨‍🎓 Sinh Viên</span>`;
      if (u.role === "admin") {
        roleBadge = `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; font-size:12px;">👑 Admin</span>`;
      } else if (u.role === "editor") {
        roleBadge = `<span class="badge" style="background:#fdf4ff; color:#86198f; font-weight:800; font-size:12px;">🛡️ Biên Tập</span>`;
      }

      // Trạng thái hoạt động Live Presence
      const pStatus = (u.presenceStatus || "offline").toLowerCase();
      let presenceBadge = `<span style="display:inline-flex; align-items:center; gap:5px; font-size:12px; color:var(--text-tertiary);"><span style="width:8px; height:8px; border-radius:50%; background:#94a3b8; display:inline-block;"></span> <span>Ngoại tuyến</span></span>`;
      if (pStatus === "online") {
        presenceBadge = `
          <div>
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:12.5px; font-weight:700; color:#16a34a;">
              <span style="width:8px; height:8px; border-radius:50%; background:#16a34a; display:inline-block; box-shadow:0 0 6px #16a34a;"></span>
              <span>Online</span>
            </span>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${u.presenceContext || 'Trang chủ'}</div>
          </div>
        `;
      } else if (pStatus === "afk") {
        presenceBadge = `
          <div>
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:12.5px; font-weight:700; color:#d97706;">
              <span style="width:8px; height:8px; border-radius:50%; background:#f59e0b; display:inline-block;"></span>
              <span>Đang chờ (AFK)</span>
            </span>
          </div>
        `;
      }

      const seasonExp = typeof u.seasonExp === "number" ? u.seasonExp : (u.totalExp || 0);
      const totalExp = u.totalExp || 0;
      const seasonCp = typeof u.seasonCp === "number" ? u.seasonCp : (u.contributionPoints || 0);
      const totalCp = u.contributionPoints || 0;

      return `
        <tr style="border-bottom: 1px solid var(--border); ${isSelected ? 'background:#f0f9ff;' : ''}">
          <!-- Checkbox -->
          <td style="text-align: center; width: 36px; padding: 12px 8px;">
            <input type="checkbox" class="active-user-checkbox" value="${u.id}" ${isSelected ? 'checked' : ''} onchange="App.toggleUserSelection('${u.id}', this.checked)">
          </td>

          <!-- Thành viên & Avatar (Clickable Avatar) -->
          <td style="padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div onclick="App.openAvatarPickerModal('${u.id}')" style="cursor:pointer; position:relative; flex-shrink:0;" title="Nhấp để đổi Avatar cho ${u.fullName}">
                ${Icons.renderAvatar(u.avatar || 'avatar-student', 40, u.role)}
                <div style="position: absolute; bottom: -2px; right: -2px; background: var(--surface); border: 1px solid var(--border); border-radius: 50%; padding: 2px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.15);">
                  ${Icons.get('sparkles', 9, '', 'var(--brand-primary)')}
                </div>
              </div>
              <div style="min-width: 0;">
                <div style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                  <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${u.fullName}</span>
                  ${isCurrent ? '<span class="badge" style="background:#dbeafe; color:#1e40af; font-size:10px; font-weight:800;">Bạn</span>' : ''}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                  MSSV: <strong><code>${u.studentId || 'N/A'}</code></strong> ${u.className ? `· <code>${u.className}</code>` : ''}
                </div>
                <div style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px;">
                  📧 <code>${u.email || (u.studentId ? u.studentId + '@dthu.edu.vn' : '')}</code>
                </div>
              </div>
            </div>
          </td>

          <!-- Trạng Thái Live -->
          <td style="padding: 12px 12px;">
            ${presenceBadge}
          </td>

          <!-- Khoa / Ngành -->
          <td style="padding: 12px 12px; color: var(--text-secondary); font-size: 12.5px;">
            <div>${u.department || 'ĐH Đồng Tháp'}</div>
          </td>

          <!-- Vai Trò & Quyền Hạn -->
          <td style="padding: 12px 12px;">
            <div style="margin-bottom: 4px;">${roleBadge}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 3px; max-width: 180px;">
              ${perms.canApproveDrafts ? '<span class="badge" style="background:#dcfce7; color:#166534; font-size:10px;">Duyệt đề</span>' : ''}
              ${perms.canEditSubjects ? '<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:10px;">Sửa môn</span>' : ''}
              ${perms.canManageMaterials ? '<span class="badge" style="background:#fef3c7; color:#92400e; font-size:10px;">Tài liệu</span>' : ''}
              ${perms.canManageUsers ? '<span class="badge" style="background:#fee2e2; color:#991b1b; font-size:10px;">QL User</span>' : ''}
            </div>
          </td>

          <!-- Điểm Thưởng (2 Tầng Sạch Đẹp) -->
          <td style="padding: 12px 12px;">
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <span class="badge" style="background:#fef3c7; color:#b45309; font-weight:800; font-size:12px; display:inline-flex; align-items:center; gap:4px; width:fit-content;" title="Tổng EXP tích lũy: ${totalExp.toLocaleString()}">
                ⚡ ${seasonExp.toLocaleString()} EXP (Mùa)
              </span>
              <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:800; font-size:11.5px; display:inline-flex; align-items:center; gap:4px; width:fit-content;" title="Tổng CP tích lũy: ${totalCp.toLocaleString()}">
                🌟 ${seasonCp.toLocaleString()} CP (Mùa)
              </span>
            </div>
            <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 3px;">
              Tổng: ${totalExp.toLocaleString()} EXP · ${u.quizzesCompleted || 0} bài
            </div>
          </td>

          <!-- Cột Thao Tác (Tinh Gọn) -->
          <td style="text-align: right; padding: 12px 14px;">
            <div style="display: inline-flex; align-items: center; gap: 6px; justify-content: flex-end;">
              <button class="btn btn-sm" style="font-weight:700; padding: 5px 10px;" title="Chỉnh sửa hồ sơ, phân quyền & gửi thông báo" onclick="App.openEditUserModal('${u.id}')">
                ✏️ Sửa
              </button>
              <button class="btn btn-sm" style="background:#fef3c7; color:#b45309; border-color:#fde68a; font-weight:700; padding: 5px 10px;" title="Điều chỉnh điểm EXP / CP" onclick="App.openAdminAdjustPointsModal('${u.id}')">
                ⚡ Điểm
              </button>
              ${!isCurrent ? `
                <button class="btn btn-sm" style="padding: 5px 8px;" title="${u.status === 'suspended' ? 'Mở khóa tài khoản' : 'Tạm khóa tài khoản'}" onclick="App.toggleUserStatusAction('${u.id}')">
                  ${u.status === 'suspended' ? '🔓' : '🔒'}
                </button>
                <button class="btn btn-sm btn-primary" style="padding: 5px 8px;" title="Đăng nhập tài khoản này" onclick="App.switchAccountTo('${u.id}')">
                  🔄
                </button>
                <button class="btn btn-sm btn-danger" style="padding: 5px 8px;" title="Xóa tài khoản" onclick="App.deleteUserConfirm('${u.id}')">
                  🗑️
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
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
        <tr style="border-bottom: 1px solid var(--border); ${isSelected ? 'background:#fefce8;' : ''}">
          <td style="text-align: center; width: 36px; padding: 12px 8px;">
            <input type="checkbox" class="pending-user-checkbox" value="${u.id}" ${isSelected ? 'checked' : ''} onchange="App.toggleUserSelection('${u.id}', this.checked)">
          </td>
          <td style="padding: 12px 14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="flex-shrink:0;">${Icons.renderAvatar(u.avatar || 'avatar-student', 38, u.role || 'student')}</div>
              <div>
                <div style="font-weight: 700; color: var(--text-primary);">${u.fullName}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">MSSV: <strong>${u.studentId}</strong> ${u.className ? `· ${u.className}` : ''}</div>
                ${u.appealLetter ? `
                  <button type="button" class="btn btn-xs" style="background:#fffbeb; color:#b45309; border:1px solid #fde047; font-weight:700; padding:2px 8px; border-radius:4px; font-size:11px; margin-top:4px; display:inline-flex; align-items:center; gap:4px; cursor:pointer;" onclick="App.viewUserAppealLetter('${u.id}')" title="Nhấp để đọc toàn văn thư giải trình">
                    📜 Xem Thư Nguyện Vọng
                  </button>
                ` : ''}
              </div>
            </div>
          </td>
          <td style="font-size: 13px; color: var(--text-secondary); padding: 12px 12px;">${u.department || 'ĐH Đồng Tháp'}</td>
          <td style="font-size: 13px; color: var(--text-secondary); padding: 12px 12px;"><code>${u.email || (u.studentId + '@dthu.edu.vn')}</code></td>
          <td style="font-size: 12.5px; color: var(--text-tertiary); padding: 12px 12px;">${u.registeredAt ? new Date(u.registeredAt).toLocaleString('vi-VN') : 'Gần đây'}</td>
          <td style="padding: 12px 12px;"><span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700;">⏳ Chờ Duyệt</span></td>
          <td style="text-align: right; padding: 12px 14px;">
            <div style="display: inline-flex; gap: 6px;">
              <button class="btn btn-sm btn-primary" onclick="App.approveUserRegistrationAction('${u.id}')" style="font-weight:700;">
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
            <div style="font-size: 40px; margin-bottom: 8px;">🛡️</div>
            <strong style="font-size: 16px; color: var(--text-primary); display: block;">Không có yêu cầu hỗ trợ nào đang chờ!</strong>
            <span style="font-size: 13px;">Hệ thống đang hoạt động an toàn và ổn định.</span>
          </td>
        </tr>
      `;
    }

    return requests.map(r => `
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 12px 14px;">
          <strong style="color: var(--text-primary); font-size: 13.5px;">${r.fullName || r.userName || 'Sinh viên'}</strong>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">MSSV: <strong><code>${r.studentId || 'N/A'}</code></strong> · <code>${r.ticketId || r.id}</code></div>
        </td>
        <td style="font-size: 13px; color: var(--text-secondary); padding: 12px 12px;">${r.contact || r.phone || r.email || 'Chưa cung cấp'}</td>
        <td style="font-size: 13px; color: var(--text-secondary); max-width: 260px; padding: 12px 12px;">
          <div style="margin-bottom: 4px;"><span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:11px; font-weight:700;">${r.issueType || 'CSKH'}</span></div>
          <strong style="font-size: 12.5px; color: var(--text-primary); display: block;">${r.title || 'Yêu cầu hỗ trợ'}</strong>
          <span style="font-size: 12px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${r.content || r.note || ''}</span>
        </td>
        <td style="font-size: 12px; color: var(--text-tertiary); padding: 12px 12px;">${r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : 'Gần đây'}</td>
        <td style="padding: 12px 12px;">
          <span class="badge" style="background:${r.status === 'resolved' ? '#dcfce7' : '#fee2e2'}; color:${r.status === 'resolved' ? '#15803d' : '#b91c1c'}; font-weight:700;">
            ${r.status === 'resolved' ? '✓ Đã xử lý' : '⏳ Cần xử lý'}
          </span>
        </td>
        <td style="text-align: right; padding: 12px 14px;">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn btn-sm" title="Xem chi tiết" onclick="App.viewSupportTicketDetailModal('${r.id || r.ticketId}')">
              👁️ Xem
            </button>
            ${r.status !== 'resolved' ? `
              <button class="btn btn-sm btn-primary" title="Cấp lại mã PIN mặc định 123456" onclick="App.resolveResetRequestAction('${r.id}')">
                🔄 Cấp PIN
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
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
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="font-size: 12px; color: var(--text-secondary); font-family: monospace; padding: 12px 14px;">
          ${new Date(log.timestamp).toLocaleString('vi-VN')}
        </td>
        <td style="padding: 12px 12px;">
          <strong style="color: var(--text-primary); font-size: 13px;">${log.adminName || 'Quản trị viên'}</strong>
        </td>
        <td style="padding: 12px 12px;">
          <span class="badge" style="background:#f1f5f9; color:#0f172a; font-weight:800; font-size:11px;">${log.action}</span>
        </td>
        <td style="padding: 12px 12px;">
          <strong style="color: var(--text-primary); font-size: 13px;">${log.target || 'Hệ thống'}</strong>
        </td>
        <td style="font-size: 13px; color: var(--text-secondary); padding: 12px 14px;">
          ${log.details || 'Không có chi tiết'}
        </td>
      </tr>
    `).join('');
  },

  // ── FILTER & TAB ACTIONS ──
  switchAdminUserTab(tab) {
    this.adminUserTab = tab;
    this.selectedUserIds = new Set();
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  onSearchUsers() {
    this.userSearchQuery = (document.getElementById("userSearchInput")?.value || "").toLowerCase();
    this.userRoleFilter = document.getElementById("userRoleFilter")?.value || "all";
    this.userDeptFilter = document.getElementById("userDeptFilter")?.value || "all";
    
    const tbody = document.getElementById("usersTableBody");
    if (tbody) {
      tbody.innerHTML = this.renderUsersTableRows(this.getFilteredActiveUsers());
    }
  },

  clearUserFilters() {
    this.userSearchQuery = "";
    this.userRoleFilter = "all";
    this.userDeptFilter = "all";
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  getFilteredActiveUsers() {
    const all = StorageService.getActiveUsers();
    const query = this.userSearchQuery;
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
    csvContent += "MSSV,Họ và Tên,Email,Khoa/Ngành,Vai Trò,EXP Mùa,EXP Tổng,CP Mùa,CP Tổng,Trạng Thái,Ngày Tham Gia\n";

    users.forEach(u => {
      const row = [
        `"${(u.studentId || '').replace(/"/g, '""')}"`,
        `"${(u.fullName || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.department || 'ĐH Đồng Tháp').replace(/"/g, '""')}"`,
        `"${u.role === 'admin' ? 'Quản trị viên' : u.role === 'editor' ? 'Ban Biên Tập' : 'Sinh Viên'}"`,
        u.seasonExp || 0,
        u.totalExp || 0,
        u.seasonCp || 0,
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
    a.download = `Danh_Sach_Thanh_Vien_Shinora_QuizMaster_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(`📥 Đã xuất thành công ${users.length} thành viên ra file CSV!`, "success", 3000);
  },

  async refreshUsersFromCloud() {
    this.showToast("⏳ Đang kéo dữ liệu mới nhất từ Cloudflare D1...", "info", 1500);
    if (typeof StorageService !== "undefined" && typeof StorageService.syncWithCloud === "function") {
      await StorageService.syncWithCloud();
    }
    await this.renderUsersManagementView(document.getElementById("mainContent"));
    this.showToast("✅ Đã cập nhật dữ liệu người dùng mới nhất từ Cloud!", "success", 2500);
  },

  onUserAuditFilterChange(filter) {
    this.auditLogActionFilter = filter;
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  // ── SELECTION & BULK ACTIONS ──
  toggleSelectAllUsers(checked, type = "active") {
    if (!this.selectedUserIds) this.selectedUserIds = new Set();
    const list = type === "active" ? this.getFilteredActiveUsers() : StorageService.getPendingUsers();
    if (checked) {
      list.forEach(u => this.selectedUserIds.add(u.id));
    } else {
      list.forEach(u => this.selectedUserIds.delete(u.id));
    }
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  toggleUserSelection(userId, checked) {
    if (!this.selectedUserIds) this.selectedUserIds = new Set();
    if (checked) {
      this.selectedUserIds.add(userId);
    } else {
      this.selectedUserIds.delete(userId);
    }
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  clearUserSelections() {
    this.selectedUserIds = new Set();
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  async bulkToggleUserStatusAction(newStatus) {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) return;
    const count = this.selectedUserIds.size;
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile ? (adminProfile.fullName || "Quản trị viên") : "Quản trị viên";

    for (const id of this.selectedUserIds) {
      await StorageService.updateUser(id, { status: newStatus });
    }

    StorageService.addAuditLog("BULK_STATUS_CHANGE", `${count} thành viên`, `Đổi trạng thái sang ${newStatus === 'suspended' ? 'Đã khóa' : 'Hoạt động'}`, adminName);
    this.selectedUserIds = new Set();
    this.showToast(`✅ Đã chuyển trạng thái ${count} thành viên sang "${newStatus === 'suspended' ? 'Đã khóa' : 'Hoạt động'}"!`, "success", 3500);
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  async bulkDeleteUsersConfirm() {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) return;
    const count = this.selectedUserIds.size;

    if (confirm(`⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${count} thành viên đã chọn không? Hành động này không thể hoàn tác!`)) {
      for (const id of this.selectedUserIds) {
        await StorageService.deleteUser(id);
      }
      this.selectedUserIds = new Set();
      this.showToast(`🗑️ Đã xóa ${count} thành viên thành công!`, "success", 3500);
      this.renderUsersManagementView(document.getElementById("mainContent"));
    }
  },

  // ── SINGLE ACTIONS ──
  async approveUserRegistrationAction(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;
    const current = StorageService.getUserProfile();
    await StorageService.approveUserRegistration(userId, current.fullName || "Admin Shina");
    this.showToast(`🎉 Đã phê duyệt kích hoạt tài khoản cho "${user.fullName}" (${user.studentId})!`, "success", 4000);
    this.renderHeader();
    await this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  async rejectUserRegistrationAction(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;
    const reason = prompt(
      `⚠️ Bạn đang chuẩn bị TỪ CHỐI hồ sơ của sinh viên "${user.fullName}" (MSSV: ${user.studentId}).\n\nNhập lý do từ chối để thông báo cho sinh viên:`,
      "Hồ sơ thông tin không khớp với danh sách sinh viên hoặc chưa hợp lệ."
    );
    if (reason === null) return; // Người dùng bấm Hủy

    const finalReason = reason.trim() || "Hồ sơ thông tin không khớp với danh sách sinh viên hoặc chưa hợp lệ.";
    await StorageService.rejectUserRegistration(userId, finalReason);
    this.showToast(`❌ Đã từ chối hồ sơ của "${user.fullName}" và gửi thông báo lý do!`, "warning", 3500);
    this.renderHeader();
    await this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  resolveResetRequestAction(reqId) {
    const resolved = StorageService.resolveResetRequest(reqId, "123456");
    if (resolved) {
      this.showToast(`✅ Đã cấp lại mã PIN mặc định "123456" cho sinh viên "${resolved.fullName}" (${resolved.studentId})!`, "success", 4500);
      this.renderUsersManagementView(document.getElementById("mainContent"));
    }
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
              <strong>⚡ EXP Mùa:</strong> ${seasonExpVal.toLocaleString()} (Tổng: ${(user.totalExp || 0).toLocaleString()})
            </div>
            <div style="background:#f0fdf4; padding:6px 10px; border-radius:4px; border:1px solid #bbf7d0; color:#15803d;">
              <strong>🌟 CP Mùa:</strong> ${seasonCpVal.toLocaleString()} (Tổng: ${(user.contributionPoints || 0).toLocaleString()})
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
            <option value="both">🌐 Cả Điểm Mùa Này & Điểm Tổng (Khuyến nghị)</option>
            <option value="season">🗓️ Chỉ Điểm Mùa Này</option>
            <option value="all_time">👑 Chỉ Điểm Tổng All-Time</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do điều chỉnh (*):</label>
          <textarea id="adjustPointReason" class="form-control" style="min-height: 75px;" placeholder="Nhập lý do cụ thể để gửi thông báo minh bạch cho sinh viên..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveAdminAdjustPoints('${user.id}')">💾 Xác Nhận & Gửi Thông Báo</button>
    `;

    this.openModal();
  },

  async saveAdminAdjustPoints(userId) {
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
    const adminName = adminProfile ? (adminProfile.fullName || "Quản trị viên") : "Quản trị viên";

    try {
      await StorageService.adminAdjustUserPoints(userId, type, amount, scope, reasonVal, adminName);
      this.closeModal();
      this.showToast(`✅ Đã điều chỉnh ${amount > 0 ? '+' : ''}${amount} ${type} và đồng bộ Cloud thành công!`, "success", 4000);
      this.renderUsersManagementView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  async deleteUserConfirm(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    if (confirm(`⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản của "${user.fullName}" (${user.studentId}) không? Hành động này không thể hoàn tác!`)) {
      try {
        await StorageService.deleteUser(userId);
        this.showToast(`🗑️ Đã xóa người dùng "${user.fullName}" thành công!`, "success", 3500);
        this.renderUsersManagementView(document.getElementById("mainContent"));
      } catch (e) {
        this.showToast("❌ " + e.message, "danger", 3500);
      }
    }
  },

  viewUserAppealLetter(userId) {
    const user = StorageService.getUserById(userId);
    if (!user || !user.appealLetter) {
      this.showToast("⚠️ Không tìm thấy bức thư nguyện vọng của người dùng này!", "warning");
      return;
    }

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");
    if (!modal || !title || !body) return;

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:8px;">📜 <span>Thư Nguyện Vọng Của Sinh Viên</span></span>`;

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="background:#f8fafc; border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 14px; font-size:13px; line-height:1.5;">
          <div>👤 <strong>Sinh viên:</strong> ${user.fullName} (MSSV: <strong>${user.studentId}</strong>)</div>
          <div>🏛️ <strong>Khoa:</strong> ${user.department || 'ĐH Đồng Tháp'} · 📧 <code>${user.email || 'N/A'}</code></div>
          ${user.reRegisteredAt ? `<div style="font-size:12px; color:var(--text-tertiary); margin-top:4px;">🕒 Gửi lại lúc: ${new Date(user.reRegisteredAt).toLocaleString('vi-VN')}</div>` : ''}
        </div>

        <div style="font-size:12.5px; font-weight:700; color:var(--text-primary);">Nội dung bức thư giải trình & nguyện vọng tham gia:</div>
        <div style="background:#fffbeb; border:1.5px solid #fef08a; border-radius:var(--radius-sm); padding:16px; font-size:13.5px; line-height:1.7; color:#78350f; white-space:pre-wrap; max-height:280px; overflow-y:auto; word-break:break-word;">${user.appealLetter}</div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-danger" onclick="App.closeModal(); App.rejectUserRegistrationAction('${user.id}');">❌ Từ Chối</button>
      <button class="btn btn-primary" style="font-weight:700;" onclick="App.closeModal(); App.approveUserRegistrationAction('${user.id}');">✅ Phê Duyệt Ngay</button>
    `;

    this.openModal();
  }
});
