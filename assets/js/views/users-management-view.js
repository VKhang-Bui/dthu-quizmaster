/**
 * USERS MANAGEMENT VIEW MODULE
 * Bảng điều khiển quản trị thành viên, Thao tác hàng loạt (Bulk Actions).
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
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
    if (!this.selectedUserIds) this.selectedUserIds = new Set();
    if (typeof this.userSearchQuery === "undefined") this.userSearchQuery = "";
    if (typeof this.userRoleFilter === "undefined") this.userRoleFilter = "all";
    if (typeof this.userDeptFilter === "undefined") this.userDeptFilter = "all";
    if (typeof this.auditLogActionFilter === "undefined") this.auditLogActionFilter = "all";

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
    const auditLogs = StorageService.getAuditLogs();

    const filteredActiveUsers = this.getFilteredActiveUsers();

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
              Quản lý danh sách sinh viên, phê duyệt hồ sơ đăng ký mới, cấp quyền biên tập viên và kiểm toán hệ thống.
            </p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <button class="btn" style="border-color: #6366f1; color: #4338ca; font-weight: 700;" onclick="App.exportUsersCSV()" title="Xuất danh sách thành viên ra file CSV / Excel">
              📥 Xuất CSV
            </button>
            <button class="btn" style="border-color: #10b981; color: #047857; font-weight: 700;" onclick="App.refreshUsersFromCloud()">🔄 Làm Mới Cloud</button>
            <button class="btn" style="border-color: #0284c7; color: #0284c7;" onclick="App.openAppsScriptConfigModal()">⚙️ Google Apps Script</button>
            <button class="btn btn-primary" onclick="App.openCreateUserModal()">➕ Thêm Thành Viên</button>
            <button class="btn" onclick="App.openAccountSwitcherModal()">🔄 Đổi Tài Khoản</button>
          </div>
        </div>

        <!-- 4 Thẻ Thống Kê Tổng Quan -->
        <div class="users-stat-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
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

        <!-- Admin Tab Bar (4 Tabs) -->
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
          <button class="admin-tab-btn ${this.adminUserTab === 'audit_logs' ? 'active' : ''}" onclick="App.switchAdminUserTab('audit_logs')">
            📋 Nhật Ký Hoạt Động <span class="badge" style="background:#f1f5f9; color:#475569; font-size:11px;">${auditLogs.length}</span>
          </button>
        </div>

        <!-- Nội dung theo Tab được chọn -->
        ${this.adminUserTab === 'active' ? `
          <!-- Thanh Tìm kiếm & Bộ lọc cho Active Users (Binding bền vững) -->
          <div class="search-filter-bar" style="margin: 0 0 12px 0;">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input type="text" id="userSearchInput" class="form-control" placeholder="Tìm theo tên, MSSV, email..." value="${this.userSearchQuery || ''}" oninput="App.onSearchUsers()">
            </div>
            <select id="userRoleFilter" class="form-control" style="width: auto; min-width: 170px;" onchange="App.onSearchUsers()">
              <option value="all" ${this.userRoleFilter === 'all' ? 'selected' : ''}>Tất cả vai trò</option>
              <option value="admin" ${this.userRoleFilter === 'admin' ? 'selected' : ''}>👑 Quản trị viên (Admin)</option>
              <option value="editor" ${this.userRoleFilter === 'editor' ? 'selected' : ''}>🛡️ Ban Biên Tập (Editor)</option>
              <option value="student" ${this.userRoleFilter === 'student' ? 'selected' : ''}>👨‍🎓 Sinh viên</option>
            </select>
            <select id="userDeptFilter" class="form-control" style="width: auto; min-width: 200px;" onchange="App.onSearchUsers()">
              <option value="all" ${this.userDeptFilter === 'all' ? 'selected' : ''}>Tất cả khoa / ngành</option>
              ${depts.map(d => `<option value="${d}" ${this.userDeptFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
            ${(this.userSearchQuery || this.userRoleFilter !== 'all' || this.userDeptFilter !== 'all') ? `
              <button class="btn btn-sm" onclick="App.clearUserFilters()" title="Xóa toàn bộ bộ lọc">
                🔄 Xóa lọc
              </button>
            ` : ''}
          </div>

          <!-- Thanh Thao Tác Hàng Loạt Tối Giản Cho Active Users -->
          ${this.selectedUserIds && this.selectedUserIds.size > 0 ? `
            <div id="usersBulkToolbar" style="background: #f8fafc; border: 1.5px solid #0284c7; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #0369a1;">
                <span>☑️ Đã chọn: <strong>${this.selectedUserIds.size}</strong> thành viên</span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm" style="background:#fef3c7; color:#b45309; border-color:#fde68a; font-weight:700;" onclick="App.openBulkAdjustPointsModal('users')">
                  ⚡ Sửa Điểm Hàng Loạt
                </button>
                <button class="btn btn-sm" style="background:#fdf4ff; color:#86198f; border-color:#f0abfc; font-weight:700;" onclick="App.openBulkAwardBadgeModal('users')">
                  🎖️ Trao Huy Hiệu
                </button>
                <button class="btn btn-sm" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5; font-weight:700;" onclick="App.bulkToggleUserStatusAction('suspended')">
                  🔒 Tạm Khóa (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm" style="background:#dcfce7; color:#15803d; border-color:#86efac; font-weight:700;" onclick="App.bulkToggleUserStatusAction('active')">
                  🔓 Mở Khóa (${this.selectedUserIds.size})
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

          <!-- Bảng Danh Sách Thành Viên Hoạt Động -->
          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center;">
                    <input type="checkbox" id="selectAllActiveUsers" ${filteredActiveUsers.length > 0 && filteredActiveUsers.every(u => this.selectedUserIds && this.selectedUserIds.has(u.id)) ? 'checked' : ''} onchange="App.toggleSelectAllUsers(this.checked, 'active')" title="Chọn / Bỏ chọn tất cả (theo bộ lọc hiện tại)">
                  </th>
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
                ${this.renderUsersTableRows(filteredActiveUsers)}
              </tbody>
            </table>
          </div>
        ` : this.adminUserTab === 'pending' ? `
          <!-- Thanh Thao Tác Hàng Loạt Tối Giản Cho Hồ Sơ Chờ Phê Duyệt -->
          ${this.selectedUserIds && this.selectedUserIds.size > 0 ? `
            <div id="pendingBulkToolbar" style="background: #fefce8; border: 1.5px solid #eab308; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="font-size: 13px; font-weight: 700; color: #854d0e;">
                <span>☑️ Đã chọn: <strong>${this.selectedUserIds.size}</strong> hồ sơ chờ duyệt</span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="App.bulkApprovePendingUsersAction()">
                  ✅ Phê Duyệt Tất Cả (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm btn-danger" onclick="App.bulkRejectPendingUsersAction()">
                  ❌ Từ Chối Tất Cả (${this.selectedUserIds.size})
                </button>
                <button class="btn btn-sm" onclick="App.clearUserSelections()">
                  ❌ Bỏ Chọn
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Bảng Danh Sách Chờ Phê Duyệt -->
          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center;">
                    <input type="checkbox" id="selectAllPendingUsers" ${pendingUsers.length > 0 && pendingUsers.every(u => this.selectedUserIds && this.selectedUserIds.has(u.id)) ? 'checked' : ''} onchange="App.toggleSelectAllUsers(this.checked, 'pending')" title="Chọn / Bỏ chọn tất cả">
                  </th>
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
        ` : this.adminUserTab === 'resets' ? `
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
        ` : `
          <!-- Tab Nhật Ký Kiểm Toán & Hoạt Động Hệ Thống -->
          <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-weight: 700; font-size: 13px; color: var(--text-secondary);">Lọc theo hành động:</span>
              <select id="userAuditFilter" class="form-control" style="width: auto; min-width: 180px;" onchange="App.onUserAuditFilterChange(this.value)">
                <option value="all" ${this.auditLogActionFilter === 'all' ? 'selected' : ''}>Tất cả hành động (${auditLogs.length})</option>
                <option value="EDIT_USER" ${this.auditLogActionFilter === 'EDIT_USER' ? 'selected' : ''}>Sửa thông tin & phân quyền</option>
                <option value="CREATE_USER" ${this.auditLogActionFilter === 'CREATE_USER' ? 'selected' : ''}>Thêm thành viên</option>
                <option value="TOGGLE_USER_STATUS" ${this.auditLogActionFilter === 'TOGGLE_USER_STATUS' ? 'selected' : ''}>Khóa/Mở tài khoản</option>
                <option value="BULK_STATUS_CHANGE" ${this.auditLogActionFilter === 'BULK_STATUS_CHANGE' ? 'selected' : ''}>Thao tác hàng loạt</option>
                <option value="ADJUST_POINTS" ${this.auditLogActionFilter === 'ADJUST_POINTS' ? 'selected' : ''}>Điều chỉnh điểm EXP/CP</option>
                <option value="AWARD_BADGE" ${this.auditLogActionFilter === 'AWARD_BADGE' ? 'selected' : ''}>Trao danh hiệu / huy hiệu</option>
              </select>
            </div>
            <div>
              <button class="btn btn-sm btn-danger" onclick="App.clearAuditLogsConfirm()">
                🗑️ Xóa Lịch Sử Nhật Ký
              </button>
            </div>
          </div>

          <div class="users-table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th style="width: 160px;">Thời Gian</th>
                  <th style="width: 140px;">Người Thực Hiện</th>
                  <th style="width: 160px;">Hành Động</th>
                  <th>Đối Tượng</th>
                  <th>Chi Tiết</th>
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

  switchAdminUserTab(tab) {
    this.adminUserTab = tab;
    if (this.selectedUserIds) this.selectedUserIds.clear();
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  clearUserFilters() {
    this.userSearchQuery = "";
    this.userRoleFilter = "all";
    this.userDeptFilter = "all";
    if (this.selectedUserIds) this.selectedUserIds.clear();
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  getFilteredActiveUsers() {
    const all = StorageService.getActiveUsers();
    const query = (this.userSearchQuery || "").toLowerCase().trim();
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
    csvContent += "MSSV,Họ và Tên,Email,Khoa/Ngành,Vai Trò,EXP Tổng,CP Cống Hiến,Trạng Thái,Ngày Tham Gia\n";

    users.forEach(u => {
      const row = [
        `"${(u.studentId || '').replace(/"/g, '""')}"`,
        `"${(u.fullName || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.department || 'ĐH Đồng Tháp').replace(/"/g, '""')}"`,
        `"${u.role === 'admin' ? 'Quản trị viên' : u.role === 'editor' ? 'Ban Biên Tập' : 'Sinh Viên'}"`,
        u.totalExp || 0,
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

  onUserAuditFilterChange(filter) {
    this.auditLogActionFilter = filter;
    this.renderUsersManagementView(document.getElementById("mainContent"));
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
      <tr>
        <td style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">
          ${new Date(log.timestamp).toLocaleString('vi-VN')}
        </td>
        <td>
          <strong style="color: var(--text-primary); font-size: 13px;">${log.adminName || 'Quản trị viên'}</strong>
        </td>
        <td>
          <span class="badge" style="background:#f1f5f9; color:#0f172a; font-weight:800; font-size:11px;">${log.action}</span>
        </td>
        <td>
          <strong style="color: var(--text-primary); font-size: 13px;">${log.target || 'Hệ thống'}</strong>
        </td>
        <td style="font-size: 13px; color: var(--text-secondary);">
          ${log.details || 'Không có chi tiết'}
        </td>
      </tr>
    `).join('');
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
        <tr style="${isSelected ? 'background:#fefce8;' : ''}">
          <td style="text-align: center; width: 36px;">
            <input type="checkbox" class="pending-user-checkbox" value="${u.id}" ${isSelected ? 'checked' : ''} onchange="App.toggleUserSelection('${u.id}', this.checked)">
          </td>
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
      `;
    }).join('');
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
    await StorageService.approveUserRegistration(userId, current.fullName || "Admin Shina");
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
          <td colspan="8" style="text-align: center; padding: 48px; color: var(--text-tertiary);">
            Không tìm thấy thành viên nào phù hợp.
          </td>
        </tr>
      `;
    }

    const currentProfile = StorageService.getUserProfile();

    return users.map(u => {
      const isCurrent = currentProfile && currentProfile.id === u.id;
      const isSelected = this.selectedUserIds && this.selectedUserIds.has(u.id);
      const perms = u.permissions || {};

      let roleBadge = `<span class="role-badge-student">👨‍🎓 Sinh Viên</span>`;
      if (u.role === "admin") {
        roleBadge = `<span class="role-badge-admin">👑 Admin</span>`;
      } else if (u.role === "editor") {
        roleBadge = `<span class="role-badge-editor">🛡️ Ban Biên Tập</span>`;
      }

      return `
        <tr style="${isSelected ? 'background:#f0f9ff;' : ''}">
          <td style="text-align: center; width: 36px;">
            <input type="checkbox" class="active-user-checkbox" value="${u.id}" ${isSelected ? 'checked' : ''} onchange="App.toggleUserSelection('${u.id}', this.checked)">
          </td>
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
            <div style="font-weight: 800; color: #b45309; font-size: 13px;">⚡ ${u.totalExp || 0} EXP</div>
            <div style="font-weight: 800; color: #15803d; font-size: 12px; margin-top: 1px;">🌟 ${u.contributionPoints || 0} CP</div>
            <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">${u.quizzesCompleted || 0} bài thi</div>
          </td>
          <td>
            <span class="${u.status === 'suspended' ? 'status-badge-suspended' : 'status-badge-active'}">
              ${u.status === 'suspended' ? '🚫 Đã khóa' : '✓ Hoạt động'}
            </span>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end;">
              <button class="btn btn-sm" style="background:#fef3c7; color:#b45309; border-color:#fde68a; font-weight:700;" title="Điều chỉnh điểm EXP / CP" onclick="App.openAdminAdjustPointsModal('${u.id}')">
                ⚡ Điểm
              </button>
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
              <strong>⚡ EXP Mùa Này:</strong> ${seasonExpVal.toLocaleString()} (Tổng: ${(user.totalExp || 0).toLocaleString()})
            </div>
            <div style="background:#f0fdf4; padding:6px 10px; border-radius:4px; border:1px solid #bbf7d0; color:#15803d;">
              <strong>🌟 CP Mùa Này:</strong> ${seasonCpVal.toLocaleString()} (Tổng: ${(user.contributionPoints || 0).toLocaleString()})
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
            <option value="both">🌐 Cả Điểm Mùa Này & Điểm Tổng All-Time (Khuyến nghị)</option>
            <option value="season">🗓️ Chỉ Điểm Mùa Này</option>
            <option value="all_time">👑 Chỉ Điểm Tổng All-Time</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do điều chỉnh (Bắt buộc để gửi thông báo minh bạch) (*):</label>
          <textarea id="adjustPointReason" class="form-control" style="min-height: 75px;" placeholder="Nhập lý do cụ thể (VD: Thưởng thành tích xuất sắc, hoặc Hiệu chỉnh kiểm toán điểm)..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveAdminAdjustPoints('${user.id}')">💾 Xác Nhận & Gửi Thông Báo</button>
    `;

    this.openModal();
  },

  saveAdminAdjustPoints(userId) {
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
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.adminAdjustUserPoints(userId, type, amount, scope, reasonVal, adminName);
      this.closeModal();
      this.showToast(`✅ Đã điều chỉnh ${amount > 0 ? '+' : ''}${amount} ${type} cho sinh viên thành công!`, "success", 4000);
      
      const main = document.getElementById("mainContent");
      if (document.querySelector(".view-admin-leaderboard")) {
        this.renderLeaderboardAdminView(main);
      } else {
        this.renderUsersManagementView(main);
      }
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  openResetUserPointsModal(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const seasonExpVal = typeof user.seasonExp === "number" ? user.seasonExp : (user.totalExp || 0);
    const seasonCpVal = typeof user.seasonCp === "number" ? user.seasonCp : (user.contributionPoints || 0);

    title.textContent = `🔄 Đặt Lại (Reset) Điểm: ${user.fullName}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #991b1b;">
          <div>👤 Sinh viên: <strong>${user.fullName}</strong> (MSSV: <code>${user.studentId}</code> · Lớp: <code>${user.className || 'N/A'}</code>)</div>
          <div style="display: flex; gap: 16px; margin-top: 6px; font-weight: 700;">
            <span>⚡ EXP Mùa: ${seasonExpVal} (Tổng: ${user.totalExp || 0})</span>
            <span>🌟 CP Mùa: ${seasonCpVal} (Tổng: ${user.contributionPoints || 0})</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Loại Điểm Muốn Reset (*):</label>
            <select id="resetUserPointType" class="form-control" style="font-weight: 600;">
              <option value="all">💥 Reset Toàn Bộ (Cả EXP và CP)</option>
              <option value="exp">⚡ Chỉ Reset Điểm EXP Học Tập</option>
              <option value="cp">🌟 Chỉ Reset Điểm CP Cống Hiến</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Phạm Vi Reset (*):</label>
            <select id="resetUserPointScope" class="form-control" style="font-weight: 600;">
              <option value="season">🗓️ Chỉ Reset Điểm Mùa Này</option>
              <option value="both">🌐 Reset Cả Mùa Này & Điểm Tổng All-Time</option>
              <option value="all_time">👑 Chỉ Reset Điểm Tổng All-Time</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do đặt lại điểm (Bắt buộc để gửi thông báo giải trình) (*):</label>
          <textarea id="resetUserPointReason" class="form-control" style="min-height: 75px;" placeholder="Nhập lý do cụ thể (VD: Thành viên có nguyện vọng reset điểm để thi lại từ đầu, hoặc Xử lý vi phạm)..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.saveResetUserPointsAction('${user.id}')">🔄 Xác Nhận Đặt Lại Điểm</button>
    `;

    this.openModal();
  },

  saveResetUserPointsAction(userId) {
    const resetType = document.getElementById("resetUserPointType")?.value || "all";
    const scope = document.getElementById("resetUserPointScope")?.value || "season";
    const reasonVal = document.getElementById("resetUserPointReason")?.value.trim();

    if (!reasonVal) {
      this.showToast("⚠️ Vui lòng nhập lý do đặt lại điểm để gửi thông báo giải trình cho sinh viên!", "warning");
      return;
    }

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.resetUserPoints(userId, resetType, scope, reasonVal, adminName);
      this.closeModal();
      this.showToast("✅ Đã đặt lại điểm của thành viên về 0 và gửi thông báo thành công!", "success", 4000);

      const main = document.getElementById("mainContent");
      if (document.querySelector(".view-admin-leaderboard")) {
        this.renderLeaderboardAdminView(main);
      } else {
        this.renderUsersManagementView(main);
      }
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  openKickUserModal(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `👢 Loại (Kick) Thành Viên: ${user.fullName}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #991b1b;">
          <div>⚠️ Bạn đang thao tác loại thành viên <strong>${user.fullName}</strong> (MSSV: <code>${user.studentId}</code> · Lớp: <code>${user.className || 'N/A'}</code>) khỏi nhóm học tập.</div>
          <div style="margin-top: 6px; font-size: 12px;">Tài khoản này sẽ bị chuyển sang trạng thái <strong>Đã bị Kick</strong>, bị ẩn khỏi Bảng Xếp Hạng và tạm ngưng thi thử.</div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do loại khỏi nhóm (Bắt buộc để gửi thông báo chính thức) (*):</label>
          <textarea id="kickUserReason" class="form-control" style="min-height: 80px;" placeholder="Nhập lý do cụ thể (VD: Vi phạm quy chế thi cử, spam đề thi, hoặc không còn thuộc danh sách lớp)..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.confirmKickUserAction('${user.id}')">👢 Xác Nhận Kick Khỏi Nhóm</button>
    `;

    this.openModal();
  },

  confirmKickUserAction(userId) {
    const reasonVal = document.getElementById("kickUserReason")?.value.trim();
    if (!reasonVal) {
      this.showToast("⚠️ Vui lòng nhập lý do kick để gửi thông báo chính thức!", "warning");
      return;
    }

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    try {
      StorageService.kickUserFromGroup(userId, reasonVal, adminName);
      this.closeModal();
      this.showToast("✅ Đã loại thành viên khỏi nhóm và gửi thông báo kỷ luật thành công!", "success", 4000);
      this.renderLeaderboardAdminView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ " + e.message, "danger", 3500);
    }
  },

  confirmReinstateUserAction(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    if (confirm(`Bạn có chắc chắn muốn KHÔI PHỤC thành viên "${user.fullName}" (MSSV: ${user.studentId}) trở lại nhóm học tập và mở lại trên Bảng Xếp Hạng không?`)) {
      try {
        StorageService.reinstateUserToGroup(userId, adminName);
        this.showToast(`🎉 Đã khôi phục thành viên "${user.fullName}" vào nhóm thành công!`, "success", 3500);
        this.renderLeaderboardAdminView(document.getElementById("mainContent"));
      } catch (e) {
        this.showToast("❌ " + e.message, "danger", 3500);
      }
    }
  },

  toggleSelectAllUsers(checked, tab = 'active') {
    if (!this.selectedUserIds) this.selectedUserIds = new Set();
    const list = tab === 'active' ? this.getFilteredActiveUsers() : StorageService.getPendingUsers();
    if (checked) {
      list.forEach(u => this.selectedUserIds.add(u.id));
    } else {
      list.forEach(u => this.selectedUserIds.delete(u.id));
    }
    const container = document.getElementById("mainContent");
    if (container) this.renderUsersManagementView(container);
  },

  toggleUserSelection(userId, checked) {
    if (!this.selectedUserIds) this.selectedUserIds = new Set();
    if (checked) {
      this.selectedUserIds.add(userId);
    } else {
      this.selectedUserIds.delete(userId);
    }
    const container = document.getElementById("mainContent");
    if (container) this.renderUsersManagementView(container);
  },

  clearUserSelections() {
    if (this.selectedUserIds) this.selectedUserIds.clear();
    const container = document.getElementById("mainContent");
    if (container) this.renderUsersManagementView(container);
  },

  toggleSelectAllAdminMembers(checked) {
    if (!this.selectedAdminMemberIds) this.selectedAdminMemberIds = new Set();
    const allUsers = StorageService.getAllUsers();
    if (checked) {
      allUsers.forEach(u => this.selectedAdminMemberIds.add(u.id));
    } else {
      this.selectedAdminMemberIds.clear();
    }
    const container = document.getElementById("mainContent");
    if (container) this.renderLeaderboardAdminView(container);
  },

  toggleAdminMemberSelection(userId, checked) {
    if (!this.selectedAdminMemberIds) this.selectedAdminMemberIds = new Set();
    if (checked) {
      this.selectedAdminMemberIds.add(userId);
    } else {
      this.selectedAdminMemberIds.delete(userId);
    }
    const container = document.getElementById("mainContent");
    if (container) this.renderLeaderboardAdminView(container);
  },

  clearAdminMemberSelections() {
    if (this.selectedAdminMemberIds) this.selectedAdminMemberIds.clear();
    const container = document.getElementById("mainContent");
    if (container) this.renderLeaderboardAdminView(container);
  },

  async bulkApprovePendingUsersAction() {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 hồ sơ!", "warning");
      return;
    }
    const ids = Array.from(this.selectedUserIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Admin";

    this.showToast(`⏳ Đang phê duyệt ${ids.length} hồ sơ...`, "info", 2000);
    for (const id of ids) {
      await StorageService.approveUserRegistration(id, adminName);
    }
    StorageService.addAuditLog("BULK_APPROVE_USERS", `${ids.length} hồ sơ`, `Phê duyệt kích hoạt hàng loạt ${ids.length} tài khoản sinh viên`, adminName);
    this.selectedUserIds.clear();
    this.showToast(`🎉 Đã phê duyệt kích hoạt thành công ${ids.length} tài khoản sinh viên!`, "success", 4000);
    this.renderHeader();
    await this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  async bulkRejectPendingUsersAction() {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 hồ sơ!", "warning");
      return;
    }
    const ids = Array.from(this.selectedUserIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Admin";

    this.showConfirmDialog({
      title: "Xác nhận từ chối hàng loạt",
      message: `Bạn có chắc chắn muốn TỪ CHỐI <strong>${ids.length}</strong> hồ sơ đăng ký đã chọn không?`,
      icon: "⚠️",
      confirmText: `Từ chối ${ids.length} hồ sơ`,
      isDanger: true,
      onConfirm: async () => {
        for (const id of ids) {
          await StorageService.rejectUserRegistration(id);
        }
        StorageService.addAuditLog("BULK_REJECT_USERS", `${ids.length} hồ sơ`, `Từ chối hàng loạt ${ids.length} hồ sơ đăng ký`, adminName);
        this.selectedUserIds.clear();
        this.showToast(`Đã từ chối ${ids.length} hồ sơ đăng ký!`, "info", 3000);
        this.renderHeader();
        await this.renderUsersManagementView(document.getElementById("mainContent"));
      }
    });
  },

  bulkToggleUserStatusAction(targetStatus) {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const currentProfile = StorageService.getUserProfile();
    const ids = Array.from(this.selectedUserIds).filter(id => id !== currentProfile.id);
    if (ids.length === 0) {
      this.showToast("⚠️ Không thể thay đổi trạng thái của chính tài khoản bạn đang đăng nhập!", "warning");
      return;
    }

    const actionText = targetStatus === 'suspended' ? 'TẠM KHÓA' : 'MỞ KHÓA';
    this.showConfirmDialog({
      title: `Xác nhận ${actionText} hàng loạt`,
      message: `Bạn có chắc chắn muốn <strong>${actionText} ${ids.length} tài khoản</strong> đã chọn không?`,
      icon: targetStatus === 'suspended' ? "🔒" : "🔓",
      confirmText: `${actionText} ${ids.length} tài khoản`,
      isDanger: targetStatus === 'suspended',
      onConfirm: () => {
        const adminName = currentProfile.fullName || "Quản trị viên";
        const users = StorageService.getAllUsers();
        let count = 0;
        users.forEach(u => {
          if (ids.includes(u.id)) {
            u.status = targetStatus;
            count++;
          }
        });
        StorageService.saveAllUsers(users);
        StorageService.addAuditLog("BULK_STATUS_CHANGE", `${count} tài khoản`, `${actionText} tài khoản hàng loạt`, adminName);
        this.selectedUserIds.clear();
        this.showToast(`✅ Đã ${targetStatus === 'suspended' ? 'tạm khóa' : 'mở khóa'} thành công ${count} tài khoản!`, "success", 3000);
        this.renderUsersManagementView(document.getElementById("mainContent"));
      }
    });
  },

  bulkDeleteUsersConfirm() {
    if (!this.selectedUserIds || this.selectedUserIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const currentProfile = StorageService.getUserProfile();
    const ids = Array.from(this.selectedUserIds).filter(id => id !== currentProfile.id);
    if (ids.length === 0) {
      this.showToast("⚠️ Không thể xóa tài khoản bạn đang đăng nhập!", "warning");
      return;
    }

    this.showConfirmDialog({
      title: "Xác nhận xóa hàng loạt thành viên",
      message: `Bạn có chắc chắn muốn XÓA VĨNH VIỄN <strong>${ids.length}</strong> tài khoản đã chọn khỏi hệ thống không? Dữ liệu không thể khôi phục!`,
      icon: "🗑️",
      confirmText: `Xóa ${ids.length} tài khoản`,
      isDanger: true,
      onConfirm: async () => {
        const adminName = currentProfile.fullName || "Quản trị viên";
        await StorageService.deleteUsers(ids);
        StorageService.addAuditLog("BULK_DELETE_USERS", `${ids.length} tài khoản`, `Xóa vĩnh viễn hàng loạt ${ids.length} tài khoản khỏi hệ thống`, adminName);
        this.selectedUserIds.clear();
        this.showToast(`🗑️ Đã xóa ${ids.length} tài khoản thành công!`, "info", 3500);
        this.renderUsersManagementView(document.getElementById("mainContent"));
      }
    });
  },

  openBulkKickModal() {
    if (!this.selectedAdminMemberIds || this.selectedAdminMemberIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const count = this.selectedAdminMemberIds.size;
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `👢 Loại (Kick) Hàng Loạt: ${count} Thành Viên`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #991b1b;">
          <strong>⚠️ Chú ý:</strong> Bạn đang chuẩn bị Kick <strong>${count} thành viên</strong> đã chọn ra khỏi nhóm thi đua. Họ sẽ bị ẩn khỏi Bảng Xếp Hạng công khai.
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do loại (Kick) hàng loạt (*):</label>
          <textarea id="bulkKickReason" class="form-control" style="min-height: 80px;" placeholder="Nhập lý do chung (VD: Vi phạm nội quy, Đã tốt nghiệp, Hoạt động không hợp lệ)..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.confirmBulkKickAction()">👢 Xác Nhận Kick ${count} Thành Viên</button>
    `;

    this.openModal();
  },

  confirmBulkKickAction() {
    const reason = document.getElementById("bulkKickReason")?.value.trim();
    if (!reason) {
      this.showToast("⚠️ Vui lòng nhập lý do kick để ghi nhận kiểm toán và gửi thông báo!", "warning");
      return;
    }
    const ids = Array.from(this.selectedAdminMemberIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.kickUserFromGroup(id, reason, adminName);
      } catch (e) {}
    });

    this.clearAdminMemberSelections();
    this.closeModal();
    this.showToast(`👢 Đã kick thành công ${ids.length} thành viên khỏi nhóm!`, "info", 4000);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  bulkReinstateUsersAction() {
    if (!this.selectedAdminMemberIds || this.selectedAdminMemberIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const ids = Array.from(this.selectedAdminMemberIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.reinstateUserToGroup(id, adminName);
      } catch (e) {}
    });

    this.clearAdminMemberSelections();
    this.showToast(`♻️ Đã khôi phục thành công ${ids.length} thành viên vào nhóm!`, "success", 4000);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  openBulkResetPointsModal() {
    if (!this.selectedAdminMemberIds || this.selectedAdminMemberIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const count = this.selectedAdminMemberIds.size;
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `🔄 Đặt Lại Điểm Hàng Loạt: ${count} Thành Viên`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #92400e;">
          Bạn đang chọn đặt lại điểm số về 0 cho <strong>${count} thành viên</strong>.
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Loại Điểm (*):</label>
            <select id="bulkResetType" class="form-control" style="font-weight: 600;">
              <option value="all">💥 Cả Điểm EXP và CP</option>
              <option value="exp">⚡ Chỉ Điểm EXP</option>
              <option value="cp">🌟 Chỉ Điểm CP</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Phạm Vi (*):</label>
            <select id="bulkResetScope" class="form-control" style="font-weight: 600;">
              <option value="season" selected>🗓️ Chỉ Điểm Mùa Này (Bảo lưu All-Time)</option>
              <option value="both">🌐 Cả Mùa Này & Điểm Tổng All-Time</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do giải trình (*):</label>
          <textarea id="bulkResetReason" class="form-control" style="min-height: 70px;" placeholder="Nhập lý do đặt lại điểm cho danh sách sinh viên..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-danger" onclick="App.confirmBulkResetPointsAction()">🔄 Xác Nhận Reset ${count} Thành Viên</button>
    `;

    this.openModal();
  },

  confirmBulkResetPointsAction() {
    const type = document.getElementById("bulkResetType")?.value || "all";
    const scope = document.getElementById("bulkResetScope")?.value || "season";
    const reason = document.getElementById("bulkResetReason")?.value.trim();

    if (!reason) {
      this.showToast("⚠️ Vui lòng nhập lý do đặt lại điểm để gửi thông báo minh bạch!", "warning");
      return;
    }

    const ids = Array.from(this.selectedAdminMemberIds);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.resetUserPoints(id, type, scope, reason, adminName);
      } catch (e) {}
    });

    this.clearAdminMemberSelections();
    this.closeModal();
    this.showToast(`✅ Đã đặt lại điểm của ${ids.length} thành viên thành công!`, "success", 4000);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  bulkToggleHideLeaderboardAction() {
    if (!this.selectedAdminMemberIds || this.selectedAdminMemberIds.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const ids = Array.from(this.selectedAdminMemberIds);
    const settings = StorageService.getLeaderboardSettings();
    let hiddenIds = settings.hiddenUserIds || [];

    // Nếu tất cả đã ẩn -> mở hiện tất cả. Ngược lại -> ẩn tất cả.
    const allHidden = ids.every(id => hiddenIds.includes(id));
    if (allHidden) {
      hiddenIds = hiddenIds.filter(id => !ids.includes(id));
    } else {
      ids.forEach(id => {
        if (!hiddenIds.includes(id)) hiddenIds.push(id);
      });
    }

    settings.hiddenUserIds = hiddenIds;
    StorageService.saveLeaderboardSettings(settings);
    this.showToast(`👁️ Đã ${allHidden ? 'mở hiện' : 'ẩn'} ${ids.length} thành viên trên BXH công khai!`, "success", 3000);
    this.renderLeaderboardAdminView(document.getElementById("mainContent"));
  },

  openBulkAdjustPointsModal(source = 'users') {
    const idSet = (source === 'leaderboard') ? this.selectedAdminMemberIds : this.selectedUserIds;
    if (!idSet || idSet.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const count = idSet.size;
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `⚡/🌟 Điều Chỉnh Điểm Chung: ${count} Thành Viên`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #166534;">
          Bạn đang áp dụng cộng / trừ điểm hàng loạt cho <strong>${count} thành viên</strong> đã chọn.
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Loại Điểm (*):</label>
            <select id="bulkAdjustPointType" class="form-control" style="font-weight: 600;">
              <option value="EXP">⚡ Điểm EXP Học Tập</option>
              <option value="CP">🌟 Điểm Cống Hiến (CP)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 700;">Số điểm (+ Cộng / - Trừ) (*):</label>
            <input type="number" id="bulkAdjustPointAmount" class="form-control" placeholder="VD: 100 hoặc -50" style="font-weight: 700;">
          </div>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Phạm Vi Áp Dụng (*):</label>
          <select id="bulkAdjustPointScope" class="form-control" style="font-weight: 600;">
            <option value="both">🌐 Cả Điểm Mùa Này & Điểm Tổng All-Time</option>
            <option value="season">🗓️ Chỉ Điểm Mùa Này</option>
            <option value="all_time">👑 Chỉ Điểm Tổng All-Time</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Lý do điều chỉnh (*):</label>
          <textarea id="bulkAdjustPointReason" class="form-control" style="min-height: 70px;" placeholder="Nhập lý do gửi thông báo chung cho các thành viên..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.confirmBulkAdjustPointsAction('${source}')">💾 Áp Dụng Cho ${count} Thành Viên</button>
    `;

    this.openModal();
  },

  confirmBulkAdjustPointsAction(source = 'users') {
    const type = document.getElementById("bulkAdjustPointType")?.value || "EXP";
    const scope = document.getElementById("bulkAdjustPointScope")?.value || "both";
    const amountVal = document.getElementById("bulkAdjustPointAmount")?.value.trim();
    const reasonVal = document.getElementById("bulkAdjustPointReason")?.value.trim();

    const amount = parseInt(amountVal, 10);
    if (isNaN(amount) || amount === 0) {
      this.showToast("⚠️ Vui lòng nhập số điểm điều chỉnh hợp lệ (khác 0)!", "warning");
      return;
    }
    if (!reasonVal) {
      this.showToast("⚠️ Vui lòng nhập lý do điều chỉnh để gửi thông báo!", "warning");
      return;
    }

    const idSet = (source === 'leaderboard') ? this.selectedAdminMemberIds : this.selectedUserIds;
    const ids = Array.from(idSet || []);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.adminAdjustUserPoints(id, type, amount, scope, reasonVal, adminName);
      } catch (e) {}
    });

    this.closeModal();
    this.showToast(`✅ Đã điều chỉnh ${amount > 0 ? '+' : ''}${amount} ${type} cho ${ids.length} thành viên thành công!`, "success", 4000);

    const main = document.getElementById("mainContent");
    if (source === 'leaderboard') {
      this.clearAdminMemberSelections();
      this.renderLeaderboardAdminView(main);
    } else {
      this.clearUserSelections();
      this.renderUsersManagementView(main);
    }
  },

  openBulkAwardBadgeModal(source = 'users') {
    const idSet = (source === 'leaderboard') ? this.selectedAdminMemberIds : this.selectedUserIds;
    if (!idSet || idSet.size === 0) {
      this.showToast("⚠️ Vui lòng tích chọn ít nhất 1 thành viên!", "warning");
      return;
    }
    const count = idSet.size;
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `🎖️ Trao Huy Hiệu Hàng Loạt: ${count} Thành Viên`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fdf4ff; border: 1px solid #f0abfc; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #86198f;">
          Trao danh hiệu / huy hiệu đặc biệt hiển thị trên Bảng Vàng và hồ sơ cho <strong>${count} thành viên</strong>.
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-weight: 700;">Gợi ý huy hiệu nhanh:</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
            <button class="btn btn-sm" type="button" onclick="document.getElementById('bulkBadgeInput').value = '🎖️ Kiện Tướng Trắc Nghiệm'">🎖️ Kiện Tướng Trắc Nghiệm</button>
            <button class="btn btn-sm" type="button" onclick="document.getElementById('bulkBadgeInput').value = '🌟 Đại Sứ Học Thuật DTHU'">🌟 Đại Sứ Học Thuật</button>
            <button class="btn btn-sm" type="button" onclick="document.getElementById('bulkBadgeInput').value = '🚀 Thủ Khoa Ôn Luyện'">🚀 Thủ Khoa Ôn Luyện</button>
            <button class="btn btn-sm" type="button" onclick="document.getElementById('bulkBadgeInput').value = '💎 Cống Hiến Vàng'">💎 Cống Hiến Vàng</button>
          </div>
          <input type="text" id="bulkBadgeInput" class="form-control" placeholder="Nhập text huy hiệu (hoặc để trống để gỡ bỏ huy hiệu)..." style="font-weight: 700;">
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.confirmBulkAwardBadgeAction('${source}')">🎖️ Xác Nhận Trao Cho ${count} Thành Viên</button>
    `;

    this.openModal();
  },

  confirmBulkAwardBadgeAction(source = 'users') {
    const badgeText = document.getElementById("bulkBadgeInput")?.value.trim();
    const idSet = (source === 'leaderboard') ? this.selectedAdminMemberIds : this.selectedUserIds;
    const ids = Array.from(idSet || []);
    const adminProfile = StorageService.getUserProfile();
    const adminName = adminProfile.fullName || "Quản trị viên";

    ids.forEach(id => {
      try {
        StorageService.setCustomUserBadge(id, badgeText, adminName);
      } catch (e) {}
    });

    this.closeModal();
    this.showToast(`🎖️ Đã ${badgeText ? `trao huy hiệu "${badgeText}"` : 'gỡ bỏ huy hiệu'} cho ${ids.length} thành viên thành công!`, "success", 4000);

    const main = document.getElementById("mainContent");
    if (source === 'leaderboard') {
      this.clearAdminMemberSelections();
      this.renderLeaderboardAdminView(main);
    } else {
      this.clearUserSelections();
      this.renderUsersManagementView(main);
    }
  }
});
