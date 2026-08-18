/**
 * AUTH & USER MANAGEMENT VIEW MODULE
 * Đăng nhập, Chuyển tài khoản, Khôi phục PIN (OTP Email), CSKH, Liên hệ.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  onSearchUsers() {
    this.userSearchQuery = document.getElementById("userSearchInput")?.value || "";
    this.userRoleFilter = document.getElementById("userRoleFilter")?.value || "all";
    this.userDeptFilter = document.getElementById("userDeptFilter")?.value || "all";

    const filtered = this.getFilteredActiveUsers();
    const tbody = document.getElementById("usersTableBody");
    if (tbody) tbody.innerHTML = this.renderUsersTableRows(filtered);

    const selectAllBox = document.getElementById("selectAllActiveUsers");
    if (selectAllBox) {
      selectAllBox.checked = filtered.length > 0 && filtered.every(u => this.selectedUserIds && this.selectedUserIds.has(u.id));
    }
  },

  openCreateUserModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "➕ Thêm Thành Viên Mới Vào Hệ Thống";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group" style="margin: 0;">
          <label class="form-label">Họ và tên (*):</label>
          <input type="text" id="newUsrName" class="form-control" placeholder="Ví dụ: Nguyễn Văn An">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã số sinh viên (MSSV) (*):</label>
            <input type="text" id="newUsrId" class="form-control" placeholder="Ví dụ: 220105001">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Email sinh viên / Đăng ký (*):</label>
            <input type="email" id="newUsrEmail" class="form-control" placeholder="Ví dụ: 220105001@dthu.edu.vn">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã PIN Đăng nhập (6 số):</label>
            <div style="position: relative;">
              <input type="password" id="newUsrPin" class="form-control" value="123456" maxlength="6" style="padding-right: 36px;">
              <button type="button" class="btn btn-sm" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); padding: 2px 6px; border: none; background: transparent; cursor: pointer; font-size: 13px;" onclick="const el = document.getElementById('newUsrPin'); el.type = el.type === 'password' ? 'text' : 'password';" title="Hiện/Ẩn PIN">👁️</button>
            </div>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Khoa / Chuyên ngành:</label>
            <input type="text" id="newUsrDept" class="form-control" placeholder="Ví dụ: Khoa Nông nghiệp - Sinh học">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Vai trò chính (*):</label>
            <select id="newUsrRole" class="form-control" onchange="App.onNewUserRoleChange(this.value)">
              <option value="student">👨‍🎓 Sinh Viên</option>
              <option value="editor">🛡️ Ban Biên Tập (Editor)</option>
              <option value="admin">👑 Quản Trị Viên (Admin)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Avatar đại diện:</label>
            <select id="newUsrAvatar" class="form-control">
              <option value="👨‍🎓">👨‍🎓 Nam Sinh Viên</option>
              <option value="👩‍🎓">👩‍🎓 Nữ Sinh Viên</option>
              <option value="🧑‍💻">🧑‍💻 Lập Trình Viên</option>
              <option value="🧪">🧪 Nhà Khoa Học</option>
              <option value="🧬">🧬 Sinh Học</option>
              <option value="🌟">🌟 Tinh Hoa</option>
            </select>
          </div>
        </div>

        <!-- Bộ cấp quyền chi tiết -->
        <div style="border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 4px;">
          <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
            Cấp quyền hạn chi tiết:
          </label>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label class="perm-checkbox-item">
              <input type="checkbox" id="permApproveDrafts">
              <div>
                <strong style="font-size: 13px; display: block;">Duyệt đề thi đóng góp (canApproveDrafts)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép xem xét, chỉnh sửa và phê duyệt các bộ đề cộng đồng.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="permEditSubjects">
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý & Sửa đề gốc (canEditSubjects)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép thêm môn mới, tạo chương và xóa câu hỏi gốc.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="permManageMaterials" checked>
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý tài liệu (.txt) (canManageMaterials)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép tải lên và chỉnh sửa kho tài liệu học tập.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="permManageUsers">
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý người dùng & Phân quyền (canManageUsers)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Toàn quyền thêm/sửa/khóa thành viên và phân quyền.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveNewUser()">Lưu Thành Viên</button>
    `;

    this.openModal();
  },

  onNewUserRoleChange(role) {
    const pApprove = document.getElementById("permApproveDrafts");
    const pEdit = document.getElementById("permEditSubjects");
    const pMat = document.getElementById("permManageMaterials");
    const pUsers = document.getElementById("permManageUsers");

    if (role === "admin") {
      if (pApprove) pApprove.checked = true;
      if (pEdit) pEdit.checked = true;
      if (pMat) pMat.checked = true;
      if (pUsers) pUsers.checked = true;
    } else if (role === "editor") {
      if (pApprove) pApprove.checked = true;
      if (pEdit) pEdit.checked = false;
      if (pMat) pMat.checked = true;
      if (pUsers) pUsers.checked = false;
    } else {
      if (pApprove) pApprove.checked = false;
      if (pEdit) pEdit.checked = false;
      if (pMat) pMat.checked = false;
      if (pUsers) pUsers.checked = false;
    }
  },

  onEditUserRoleChange(role) {
    const pApprove = document.getElementById("editPermApproveDrafts");
    const pEdit = document.getElementById("editPermEditSubjects");
    const pMat = document.getElementById("editPermManageMaterials");
    const pUsers = document.getElementById("editPermManageUsers");

    if (role === "admin") {
      if (pApprove) pApprove.checked = true;
      if (pEdit) pEdit.checked = true;
      if (pMat) pMat.checked = true;
      if (pUsers) pUsers.checked = true;
    } else if (role === "editor") {
      if (pApprove) pApprove.checked = true;
      if (pEdit) pEdit.checked = false;
      if (pMat) pMat.checked = true;
      if (pUsers) pUsers.checked = false;
    } else {
      if (pApprove) pApprove.checked = false;
      if (pEdit) pEdit.checked = false;
      if (pMat) pMat.checked = false;
      if (pUsers) pUsers.checked = false;
    }
  },

  saveNewUser() {
    const name = document.getElementById("newUsrName")?.value.trim();
    const id = document.getElementById("newUsrId")?.value.trim();
    const email = document.getElementById("newUsrEmail")?.value.trim();
    const pin = document.getElementById("newUsrPin")?.value.trim() || "123456";
    const dept = document.getElementById("newUsrDept")?.value.trim() || "Đại học Đồng Tháp";
    const role = document.getElementById("newUsrRole")?.value || "student";
    const avatar = document.getElementById("newUsrAvatar")?.value || "👨‍🎓";

    if (!name || !id) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ Họ tên và Mã số sinh viên (MSSV)!", "warning");
      return;
    }

    try {
      const newUser = StorageService.createUser({
        fullName: name,
        studentId: id,
        email: email || (id ? `${id}@dthu.edu.vn` : ""),
        pinCode: pin,
        department: dept,
        role: role,
        avatar: avatar,
        permissions: {
          canApproveDrafts: document.getElementById("permApproveDrafts")?.checked || false,
          canEditSubjects: document.getElementById("permEditSubjects")?.checked || false,
          canManageMaterials: document.getElementById("permManageMaterials")?.checked || false,
          canManageUsers: document.getElementById("permManageUsers")?.checked || false
        }
      });

      const adminProfile = StorageService.getUserProfile();
      StorageService.addAuditLog("CREATE_USER", name, `Thêm thành viên mới [${id}] (Vai trò: ${role})`, adminProfile.fullName || "Quản trị viên");

      this.closeModal();
      this.showToast(`🎉 Đã thêm thành viên "${name}" (${id}) thành công!`, "success", 3500);
      this.renderUsersManagementView(document.getElementById("mainContent"));
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4000);
    }
  },

  openEditUserModal(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    const perms = user.permissions || {};
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `✏️ Xem & Chỉnh Sửa Thông Tin: ${user.fullName}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Metadata Header Pill -->
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12.5px; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>🆔 ID Hệ thống: <code>${user.id}</code></div>
          <div>📅 Đăng ký: <strong>${user.registeredAt || user.createdAt ? new Date(user.registeredAt || user.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}</strong></div>
          ${user.approvedBy ? `<div>✓ Duyệt bởi: <strong>${user.approvedBy}</strong></div>` : ''}
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Họ và tên (*):</label>
          <input type="text" id="editUsrName" class="form-control" value="${user.fullName}">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã số sinh viên (MSSV) (*):</label>
            <input type="text" id="editUsrId" class="form-control" value="${user.studentId || ''}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Email sinh viên / Đăng ký (*):</label>
            <input type="email" id="editUsrEmail" class="form-control" value="${user.email || (user.studentId ? user.studentId + '@dthu.edu.vn' : '')}" placeholder="Ví dụ: 220101001@dthu.edu.vn">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã PIN Đăng nhập (6 số):</label>
            <div style="position: relative;">
              <input type="password" id="editUsrPin" class="form-control" value="${user.pinCode || '123456'}" maxlength="6" style="padding-right: 36px;">
              <button type="button" class="btn btn-sm" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); padding: 2px 6px; border: none; background: transparent; cursor: pointer; font-size: 13px;" onclick="const el = document.getElementById('editUsrPin'); el.type = el.type === 'password' ? 'text' : 'password';" title="Hiện/Ẩn PIN">👁️</button>
            </div>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Khoa / Chuyên ngành:</label>
            <input type="text" id="editUsrDept" class="form-control" value="${user.department || ''}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Vai trò (*):</label>
            <select id="editUsrRole" class="form-control" onchange="App.onEditUserRoleChange(this.value)">
              <option value="student" ${user.role === 'student' ? 'selected' : ''}>👨‍🎓 Sinh Viên</option>
              <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>🛡️ Ban Biên Tập (Editor)</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Quản Trị Viên (Admin)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Điểm EXP:</label>
            <input type="number" id="editUsrExp" class="form-control" value="${user.totalExp || 0}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Điểm CP:</label>
            <input type="number" id="editUsrCp" class="form-control" value="${user.contributionPoints || 0}">
          </div>
        </div>

        <!-- Bộ cấp quyền chi tiết -->
        <div style="border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 4px;">
          <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
            Cấp quyền hạn chi tiết:
          </label>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label class="perm-checkbox-item">
              <input type="checkbox" id="editPermApproveDrafts" ${perms.canApproveDrafts ? 'checked' : ''}>
              <div>
                <strong style="font-size: 13px; display: block;">Duyệt đề thi đóng góp (canApproveDrafts)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép xem xét, chỉnh sửa và phê duyệt các bộ đề cộng đồng.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="editPermEditSubjects" ${perms.canEditSubjects ? 'checked' : ''}>
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý & Sửa đề gốc (canEditSubjects)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép thêm môn mới, tạo chương và xóa câu hỏi gốc.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="editPermManageMaterials" ${perms.canManageMaterials ? 'checked' : ''}>
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý tài liệu (.txt) (canManageMaterials)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Cho phép tải lên và chỉnh sửa kho tài liệu học tập.</span>
              </div>
            </label>

            <label class="perm-checkbox-item">
              <input type="checkbox" id="editPermManageUsers" ${perms.canManageUsers ? 'checked' : ''}>
              <div>
                <strong style="font-size: 13px; display: block;">Quản lý người dùng & Phân quyền (canManageUsers)</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">Toàn quyền thêm/sửa/khóa thành viên và phân quyền.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedUser('${user.id}')">Lưu Thay Đổi</button>
    `;

    this.openModal();
  },

  saveEditedUser(userId) {
    const name = document.getElementById("editUsrName")?.value.trim();
    const id = document.getElementById("editUsrId")?.value.trim();
    const email = document.getElementById("editUsrEmail")?.value.trim();
    const pin = document.getElementById("editUsrPin")?.value.trim();
    const dept = document.getElementById("editUsrDept")?.value.trim();
    const role = document.getElementById("editUsrRole")?.value || "student";
    const exp = parseInt(document.getElementById("editUsrExp")?.value, 10) || 0;
    const cp = parseInt(document.getElementById("editUsrCp")?.value, 10) || 0;

    if (!name) {
      this.showToast("⚠️ Họ và tên không được để trống!", "warning");
      return;
    }

    if (id) {
      const existingStudentIdUser = StorageService.getUserByStudentId(id);
      if (existingStudentIdUser && existingStudentIdUser.id !== userId) {
        this.showToast(`⚠️ MSSV "${id}" đã thuộc về sinh viên "${existingStudentIdUser.fullName}"!`, "warning");
        return;
      }
    }

    if (email) {
      const existingEmailUser = StorageService.getUserByEmail(email);
      if (existingEmailUser && existingEmailUser.id !== userId) {
        this.showToast(`⚠️ Địa chỉ email "${email}" đã được gán cho tài khoản khác!`, "warning");
        return;
      }
    }

    StorageService.updateUser(userId, {
      fullName: name,
      studentId: id,
      email: email ? email.toLowerCase() : "",
      pinCode: pin,
      department: dept,
      role: role,
      totalExp: exp,
      contributionPoints: cp,
      permissions: {
        canApproveDrafts: document.getElementById("editPermApproveDrafts")?.checked || false,
        canEditSubjects: document.getElementById("editPermEditSubjects")?.checked || false,
        canManageMaterials: document.getElementById("editPermManageMaterials")?.checked || false,
        canManageUsers: document.getElementById("editPermManageUsers")?.checked || false
      }
    });

    const adminProfile = StorageService.getUserProfile();
    StorageService.addAuditLog("EDIT_USER", name, `Cập nhật thông tin & phân quyền thành viên [${id || userId}] (Vai trò: ${role})`, adminProfile.fullName || "Quản trị viên");

    this.closeModal();
    this.renderHeader();
    this.showToast("✅ Đã cập nhật quyền hạn và thông tin người dùng thành công!", "success", 3000);
    this.renderUsersManagementView(document.getElementById("mainContent"));
  },

  toggleUserStatusAction(userId) {
    const updated = StorageService.toggleUserStatus(userId);
    if (updated) {
      const adminProfile = StorageService.getUserProfile();
      StorageService.addAuditLog("TOGGLE_USER_STATUS", updated.fullName, `Chuyển trạng thái sang ${updated.status === 'suspended' ? 'Đã khóa' : 'Hoạt động'}`, adminProfile.fullName || "Quản trị viên");
      this.showToast(`Đã ${updated.status === 'suspended' ? '🔒 khóa' : '🔓 mở khóa'} tài khoản: ${updated.fullName}`, "info", 2500);
      this.renderUsersManagementView(document.getElementById("mainContent"));
    }
  },

  deleteUserConfirm(userId) {
    const user = StorageService.getUserById(userId);
    if (!user) return;

    this.showConfirmDialog({
      title: "Xác nhận xóa tài khoản",
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <strong>"${user.fullName}" (MSSV: ${user.studentId})</strong> không?`,
      icon: "🗑️",
      confirmText: "Xóa tài khoản",
      isDanger: true,
      onConfirm: async () => {
        try {
          await StorageService.deleteUser(userId);
          const adminProfile = StorageService.getUserProfile();
          StorageService.addAuditLog("DELETE_USER", user.fullName, `Xóa tài khoản thành viên [${user.studentId || user.id}] khỏi hệ thống`, adminProfile.fullName || "Quản trị viên");
          this.showToast(`Đã xóa tài khoản "${user.fullName}" khỏi hệ thống!`, "success", 3000);
          this.renderHeader();
          await this.renderUsersManagementView(document.getElementById("mainContent"));
        } catch (err) {
          this.showToast("❌ " + err.message, "danger", 3500);
        }
      }
    });
  },

  switchAccountTo(userId) {
    const user = StorageService.switchActiveUser(userId);
    if (user) {
      this.renderHeader();
      this.showToast(`🎉 Đã chuyển sang tài khoản: ${user.fullName} (${user.role.toUpperCase()})`, "success", 3000);
      this.navigateTo("home");
    }
  },

  openAccountSwitcherModal() {
    const currentProfile = StorageService.getUserProfile();
    const isLogged = StorageService.isLoggedIn();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:8px;">${Icons.get('key', 18)} <span>Đăng Nhập & Xác Thực Tài Khoản</span></span>`;

    const userAvatarDisplay = Icons.renderAvatar(isLogged ? (currentProfile.avatar || 'avatar-student') : 'guest', 38, isLogged ? currentProfile.role : 'guest');

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${isLogged ? `
          <!-- Phần 1: Tài khoản đang kích hoạt trên thiết bị này -->
          <div style="background: var(--brand-light); border: 1.5px solid var(--brand-primary); padding: 12px 16px; border-radius: var(--radius-sm);">
            <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: var(--brand-primary); letter-spacing: 0.04em; margin-bottom: 6px; display:flex; align-items:center; gap:5px;">
              ${Icons.get('user', 13)} <span>Tài khoản đang đăng nhập trên thiết bị:</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="display: flex; align-items: center;">${userAvatarDisplay}</div>
                <div>
                  <strong style="font-size: 14px; color: var(--text-primary); display: block;">${currentProfile.fullName}</strong>
                  <span style="font-size: 12px; color: var(--text-secondary);">MSSV: <strong>${currentProfile.studentId}</strong> · ${currentProfile.role.toUpperCase()}</span>
                </div>
              </div>
              <button class="btn btn-sm btn-danger" style="font-size: 12px; display:inline-flex; align-items:center; gap:4px;" onclick="App.logoutUser(); App.closeModal();">
                ${Icons.get('logOut', 12)} <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Phần 2: Đăng Nhập Với MSSV & Mã PIN (Đồng bộ Cloud & Phân biệt từng máy) -->
        <div>
          <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
            ${isLogged ? 'Chuyển sang tài khoản khác (Yêu cầu nhập mã PIN):' : 'Nhập thông tin sinh viên để đăng nhập:'}
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; display: block;">Mã số sinh viên (MSSV):</label>
              <input type="text" id="loginStudentId" class="form-control" placeholder="Ví dụ: 0024xxxxxx">
            </div>
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; display: block;">Mã PIN bảo mật:</label>
              <input type="password" id="loginPinCode" class="form-control" placeholder="Ví dụ: 000000">
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%; font-weight: 700; padding: 11px; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="App.loginWithCredentials()">
            ${Icons.get('zap', 14)} <span>Xác Thực & Đăng Nhập</span> ${Icons.get('arrowRight', 12)}
          </button>
        </div>

        <!-- Phần 3: Điều hướng Đăng ký mới & Quên mã PIN -->
        <div style="border-top: 1px dashed var(--border); padding-top: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <button class="btn" style="padding: 6px 12px; font-size: 13px; font-weight: 700; color: var(--brand-primary); background: var(--brand-light); border-color: var(--brand-primary); display:inline-flex; align-items:center; gap:5px;" onclick="App.closeModal(); App.navigateTo('register');">
            ${Icons.get('plus', 13)} <span>Đăng ký tài khoản mới</span> ${Icons.get('arrowRight', 11)}
          </button>
          <button class="btn" style="padding: 6px 12px; font-size: 12.5px; color: var(--text-secondary); display:inline-flex; align-items:center; gap:4px;" onclick="App.openForgotPasswordModal()">
            ${Icons.get('helpCircle', 13)} <span>Quên mã PIN?</span>
          </button>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
    `;

    modal.classList.add("active");
  },

  async loginWithCredentials() {
    const mssv = document.getElementById("loginStudentId")?.value.trim();
    const pin = document.getElementById("loginPinCode")?.value.trim();

    if (!mssv) {
      this.showToast("⚠️ Vui lòng nhập Mã số sinh viên (MSSV)!", "warning");
      return;
    }

    this.showToast("⏳ Đang xác thực với CSDL Đám Mây Supabase...", "info", 1500);

    try {
      // 1. Kiểm tra trên Supabase Cloud trước để lấy trạng thái duyệt mới nhất
      if (typeof SupabaseClient !== "undefined" && API_CONFIG.isCloudEnabled()) {
        const cloudUser = await SupabaseClient.getUserByStudentId(mssv);
        if (cloudUser) {
          if (cloudUser.status === "pending_approval") {
            throw new Error("Tài khoản của bạn đang trong trạng thái CHỜ ADMIN DUYỆT!");
          }
          if (cloudUser.status === "suspended") {
            throw new Error("Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên!");
          }
          if (cloudUser.pin_code && pin && cloudUser.pin_code !== pin) {
            throw new Error("Mã PIN bảo mật không chính xác!");
          }
          
          const localUser = StorageService.getUserByStudentId(cloudUser.student_id) || StorageService.getUserById(cloudUser.id) || {};
          const mapped = {
            id: cloudUser.id,
            studentId: cloudUser.student_id || localUser.studentId || "",
            className: cloudUser.class_name || localUser.className || "",
            fullName: cloudUser.full_name || localUser.fullName || "",
            email: cloudUser.email || localUser.email || "",
            phone: cloudUser.phone || localUser.phone || "",
            department: cloudUser.department || localUser.department || "Khoa Kỹ thuật - Công nghệ",
            role: cloudUser.role || localUser.role || "student",
            pinCode: cloudUser.pin_code || localUser.pinCode || "123456",
            avatar: cloudUser.avatar || localUser.avatar || "👨‍🎓",
            totalExp: Math.max(cloudUser.total_exp || 0, localUser.totalExp || 0),
            seasonExp: Math.max(cloudUser.season_exp || 0, localUser.seasonExp || 0),
            contributionPoints: Math.max(cloudUser.contribution_points || 0, localUser.contributionPoints || 0),
            seasonCp: Math.max(cloudUser.season_cp || 0, localUser.seasonCp || 0),
            cumulativeQuestions: Math.max(cloudUser.cumulative_questions || 0, localUser.cumulativeQuestions || 0),
            cumulativeChars: Math.max(cloudUser.cumulative_chars || 0, localUser.cumulativeChars || 0),
            cumulativeReviewed: Math.max(cloudUser.cumulative_reviewed || 0, localUser.cumulativeReviewed || 0),
            streakDays: Math.max(cloudUser.streak_days || 1, localUser.streakDays || 1),
            quizzesCompleted: Math.max(cloudUser.quizzes_completed || 0, localUser.quizzesCompleted || 0),
            status: cloudUser.status || localUser.status || "active",
            permissions: cloudUser.permissions || localUser.permissions || {},
            approvedBy: cloudUser.approved_by || localUser.approvedBy || "",
            approvedAt: cloudUser.approved_at || localUser.approvedAt || null,
            createdAt: cloudUser.created_at || localUser.createdAt || new Date().toISOString()
          };
          StorageService.updateUser(mapped.id, mapped);
          StorageService.saveUserProfile(mapped);

          this.closeModal();
          this.renderHeader();
          this.showToast(`🎉 Đăng nhập thành công! Chào mừng ${mapped.fullName} (${mapped.role.toUpperCase()})`, "success", 3500);
          this.navigateTo("home");
          return;
        }
      }

      // 2. Xác thực cục bộ (Offline fallback)
      const user = StorageService.authenticateUser(mssv, pin);
      this.closeModal();
      this.renderHeader();
      this.showToast(`🎉 Đăng nhập thành công! Chào mừng ${user.fullName} (${user.role.toUpperCase()})`, "success", 3500);
      this.navigateTo("home");
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4500);
    }
  },

  openForgotPasswordModal() {
    this.clearOtpTimer();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:8px;">${Icons.get('key', 18)} <span>Khôi Phục Mã PIN / Quên Mật Khẩu</span></span>`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
          Nhập <strong>Mã số sinh viên (MSSV)</strong> và <strong>Địa chỉ Email</strong> đã đăng ký để nhận mã OTP xác thực đặt lại mã PIN:
        </p>

        <!-- Khung Xác Thực OTP Email -->
        <div style="border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 18px; background: var(--surface);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <div style="color: var(--brand-primary); display:flex; align-items:center;">${Icons.get('contact', 22)}</div>
            <div>
              <strong style="font-size: 14.5px; color: var(--text-primary); display: block;">Nhận mã OTP qua Email sinh viên</strong>
              <span style="font-size: 12px; color: var(--text-secondary);">Mã xác thực có hiệu lực trong 5 phút (300 giây).</span>
            </div>
          </div>

          <!-- Bước 1: Nhập MSSV & Email -->
          <div id="otpStep1">
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="font-size: 12.5px; margin-bottom: 4px;">Mã số sinh viên (MSSV) (*):</label>
                <input type="text" id="forgotMssvInput" class="form-control" placeholder="Ví dụ: 220101001">
              </div>
              <div>
                <label class="form-label" style="font-size: 12.5px; margin-bottom: 4px;">Địa chỉ Email đã đăng ký (*):</label>
                <input type="email" id="forgotEmailInput" class="form-control" placeholder="Ví dụ: 220101001@dthu.edu.vn hoặc user@gmail.com">
              </div>
            </div>
            <button class="btn btn-primary" style="width: 100%; font-weight: 700; padding: 11px; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="App.sendEmailOtpAction()">
              ${Icons.get('contact', 14)} <span>Gửi Mã OTP Xác Thực (300s)</span> ${Icons.get('arrowRight', 12)}
            </button>
          </div>

          <!-- Bước 2: Nhập OTP & Đặt PIN mới + Đếm ngược 300s -->
          <div id="otpStep2" style="display: none; padding-top: 10px;">
            <div id="otpCountdownBox" class="otp-countdown-badge">
              <span style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('timer', 13)} Mã OTP có hiệu lực trong:</span>
              <span id="otpCountdownTimer" class="otp-timer-num">05:00</span>
            </div>

            <div style="font-size: 12.5px; color: #166534; background: #f0fdf4; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px;" id="otpNoticeBox">
              Mã OTP đã được gửi đến email của bạn!
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Mã OTP (6 số):</label>
                <input type="text" id="otpCodeInput" class="form-control" placeholder="Nhập 6 số OTP" maxlength="6" style="letter-spacing: 2px; font-weight: 700;">
              </div>
              <div>
                <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Mã PIN mới (6 số):</label>
                <input type="password" id="newPinInput" class="form-control" placeholder="Mã PIN mới" maxlength="6">
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button id="btnVerifyOtp" class="btn btn-success" style="flex: 1; font-weight: 700; padding: 11px; display:inline-flex; align-items:center; justify-content:center; gap:5px;" onclick="App.verifyOtpAndResetPinAction()">
                ${Icons.get('check', 13)} <span>Xác Nhận & Đặt Mã PIN Mới</span>
              </button>
              <button class="btn btn-sm" style="padding: 0 12px; display:inline-flex; align-items:center; gap:4px;" title="Gửi lại mã OTP mới" onclick="App.sendEmailOtpAction()">
                ${Icons.get('refresh', 13)} <span>Gửi lại</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Lựa chọn Thử cách khác: Báo cáo sự cố CSKH / Quên email -->
        <div style="border-top: 1px dashed var(--border); padding-top: 12px; text-align: center;">
          <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0 0 8px 0;">
            Không nhớ địa chỉ email đã đăng ký, không nhận được OTP hoặc tài khoản bị khóa?
          </p>
          <button class="btn" style="width: 100%; border-color: #e11d48; color: #be123c; font-weight: 700; padding: 10px; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="App.openSupportTicketModal()">
            ${Icons.get('refresh', 14)} <span>Thử cách khác (Soạn văn bản gửi Admin & CSKH)</span> ${Icons.get('arrowRight', 12)}
          </button>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.clearOtpTimer(); App.openAccountSwitcherModal()">Quay lại Đăng nhập</button>
      <button class="btn" onclick="App.clearOtpTimer(); App.closeModal()">Đóng</button>
    `;

    modal.classList.add("active");
  },

  async sendEmailOtpAction() {
    const mssv = document.getElementById("forgotMssvInput")?.value.trim();
    const email = document.getElementById("forgotEmailInput")?.value.trim();

    if (!mssv || !email) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ cả MSSV và Email đăng ký!", "warning");
      return;
    }

    try {
      // 1. Tạo mã OTP trong LocalStorage với hạn 300s
      const res = StorageService.generateEmailOtp(mssv, email);

      // 2. Gửi email qua Google Apps Script hoặc Fallback
      this.showToast("⏳ Đang gửi mã OTP đến hộp thư của bạn...", "info", 2000);
      const emailResult = await EmailService.sendOtp(mssv, email, res.user.fullName, res.otp);

      document.getElementById("otpStep1").style.display = "none";
      const step2 = document.getElementById("otpStep2");
      step2.style.display = "block";

      const notice = document.getElementById("otpNoticeBox");
      if (notice) {
        if (emailResult.isRealEmail) {
          notice.innerHTML = `📨 Đã gửi mã OTP thật đến hộp thư: <strong>${email}</strong>. Vui lòng kiểm tra hộp thư đến (và mục Spam nếu có).`;
        } else {
          notice.innerHTML = `📨 Đã tạo mã OTP cho email: <strong>${email}</strong>. (Mã thử nghiệm: <strong style="font-size:15px; color:#b45309;">${res.otp}</strong>)`;
        }
      }

      // 3. Khởi động đồng hồ đếm ngược 300 giây (05:00)
      this.startOtpCountdown(300, mssv, email);

      if (emailResult.isRealEmail) {
        this.showToast(`🎉 Đã gửi mã OTP đến ${email}! Vui lòng kiểm tra hộp thư.`, "success", 4500);
      } else {
        this.showToast(`📨 [Mô phỏng Email Shinora] Mã xác thực OTP của bạn là: ${res.otp}`, "info", 7000);
      }
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4500);
    }
  },

  startOtpCountdown(totalSeconds = 300, mssv = "", email = "") {
    this.clearOtpTimer();
    let remaining = totalSeconds;

    const timerElem = document.getElementById("otpCountdownTimer");
    const boxElem = document.getElementById("otpCountdownBox");
    const btnVerify = document.getElementById("btnVerifyOtp");

    if (boxElem) boxElem.classList.remove("expired");
    if (btnVerify) btnVerify.disabled = false;

    const updateDisplay = () => {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      if (timerElem) timerElem.textContent = formatted;
    };

    updateDisplay();

    this.otpTimerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        this.clearOtpTimer();
        if (timerElem) timerElem.textContent = "00:00 (Hết hạn)";
        if (boxElem) {
          boxElem.classList.add("expired");
          boxElem.innerHTML = `⚠️ <span>Mã OTP đã hết hiệu lực! Vui lòng bấm <strong>Gửi lại</strong>.</span>`;
        }
        if (btnVerify) btnVerify.disabled = true;
      } else {
        updateDisplay();
      }
    }, 1000);
  },

  clearOtpTimer() {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
  },

  verifyOtpAndResetPinAction() {
    const mssv = document.getElementById("forgotMssvInput")?.value.trim();
    const email = document.getElementById("forgotEmailInput")?.value.trim();
    const otp = document.getElementById("otpCodeInput")?.value.trim();
    const newPin = document.getElementById("newPinInput")?.value.trim();

    if (!otp || !newPin) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ mã OTP 6 số và mã PIN mới!", "warning");
      return;
    }

    try {
      const user = StorageService.verifyEmailOtpAndResetPin(mssv, email, otp, newPin);
      this.clearOtpTimer();
      this.showToast(`🎉 Đã đặt lại mã PIN cho tài khoản "${user.fullName}" thành công! Vui lòng đăng nhập.`, "success", 4000);
      this.openAccountSwitcherModal();
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4500);
    }
  },

  openSupportTicketModal(prefill = {}) {
    this.clearOtpTimer();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "🆘 Soạn Văn Bản Báo Cáo Sự Cố & CSKH";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 12.5px; color: #9f1239; line-height: 1.5;">
          ℹ️ <strong>Thông báo:</strong> Văn bản của bạn sẽ được gửi trực tiếp đến hộp thư của <strong>Ban Quản Trị & Admin (${EmailService.ADMIN_EMAIL})</strong> để được hỗ trợ xử lý và cấp lại tài khoản nhanh chóng.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Họ và tên sinh viên (*):</label>
            <input type="text" id="supportFullName" class="form-control" placeholder="Ví dụ: Lê Thị Thu Thảo" value="${prefill.fullName || ''}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã số sinh viên (MSSV) (*):</label>
            <input type="text" id="supportStudentId" class="form-control" placeholder="Ví dụ: 220105888" value="${prefill.studentId || ''}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Email / SĐT liên hệ nhận phản hồi (*):</label>
            <input type="text" id="supportContact" class="form-control" placeholder="Email hoặc Số điện thoại / Zalo" value="${prefill.email || prefill.contact || ''}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Phân loại sự cố (*):</label>
            <select id="supportIssueType" class="form-control">
              <option value="Quên địa chỉ Email đăng ký">Quên địa chỉ Email đăng ký</option>
              <option value="Không nhận được mã OTP (300s)">Không nhận được mã OTP (300s)</option>
              <option value="Tài khoản bị tạm khóa / Lỗi đăng nhập">Tài khoản bị tạm khóa / Lỗi đăng nhập</option>
              <option value="Báo lỗi câu hỏi / Đề cương môn học">Báo lỗi câu hỏi / Đề cương môn học</option>
              <option value="Đóng góp ý kiến & Đề xuất tính năng">Đóng góp ý kiến & Đề xuất tính năng</option>
              <option value="Khác">Sự cố khác</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Tiêu đề yêu cầu (*):</label>
          <input type="text" id="supportTitle" class="form-control" placeholder="Ví dụ: Yêu cầu cấp lại mã PIN do mất quyền truy cập email cũ">
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Nội dung văn bản trình bày chi tiết (*):</label>
          <textarea id="supportContent" class="form-control" rows="5" placeholder="Kính gửi Ban Quản Trị &amp; Admin Shina Sanora,&#10;&#10;Em gặp sự cố...&#10;Kính mong Ban Quản Trị hỗ trợ cấp lại mã PIN hoặc mở khóa tài khoản giúp em. Em xin chân thành cảm ơn!" style="resize: vertical; line-height: 1.5; font-size: 13.5px;"></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.openForgotPasswordModal()">← Quay lại Quên mã PIN</button>
      <button class="btn btn-primary" style="background: #e11d48; border-color: #be123c;" onclick="App.submitSupportTicketAction()">
        📤 Gửi Văn Bản Đến Admin & CSKH ➔
      </button>
    `;

    modal.classList.add("active");
  },

  async submitSupportTicketAction() {
    const fullName = document.getElementById("supportFullName")?.value.trim();
    const studentId = document.getElementById("supportStudentId")?.value.trim();
    const contact = document.getElementById("supportContact")?.value.trim();
    const issueType = document.getElementById("supportIssueType")?.value;
    const title = document.getElementById("supportTitle")?.value.trim();
    const content = document.getElementById("supportContent")?.value.trim();

    if (!fullName || !studentId || !contact || !content) {
      this.showToast("⚠️ Vui lòng điền đầy đủ Họ tên, MSSV, Thông tin liên hệ và Nội dung!", "warning");
      return;
    }

    const ticketId = "TICKET-" + Math.floor(100000 + Math.random() * 900000);

    const ticketData = {
      ticketId,
      fullName,
      studentId,
      contact,
      email: contact.includes("@") ? contact : "",
      phone: !contact.includes("@") ? contact : "",
      issueType,
      title: title || `Yêu cầu hỗ trợ: ${issueType}`,
      content
    };

    this.showToast("⏳ Đang gửi văn bản báo cáo đến Admin...", "info", 2000);

    // 1. Gửi qua Google Apps Script về email Admin
    await EmailService.sendSupportTicket(ticketData);

    // 2. Lưu vào hệ thống quản trị
    StorageService.createSupportTicket(ticketData);

    const modal = document.getElementById("globalModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalFooter = document.getElementById("modalFooter");

    modalTitle.textContent = "✅ Đã Gửi Báo Cáo CSKH Thành Công!";

    modalBody.innerHTML = `
      <div style="text-align: center; padding: 20px 10px;">
        <div style="font-size: 52px; margin-bottom: 12px; line-height: 1;">📨</div>
        <h3 style="font-size: 19px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">Văn Bản Của Bạn Đã Được Chuyển Tiếp!</h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 16px 0;">
          Yêu cầu của bạn đã được gửi trực tiếp đến hộp thư của <strong>Admin Shina (${EmailService.ADMIN_EMAIL})</strong>.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 14px; text-align: left; font-size: 13px; line-height: 1.7; margin-bottom: 20px;">
          <div>🎫 <strong>Mã Phiếu Hỗ Trợ:</strong> <code style="color: #e11d48; font-weight: 700;">${ticketId}</code></div>
          <div>👤 <strong>Người gửi:</strong> ${fullName} (MSSV: ${studentId})</div>
          <div>🏷️ <strong>Loại sự cố:</strong> ${issueType}</div>
          <div>📞 <strong>Kênh phản hồi:</strong> ${contact}</div>
        </div>

        <button class="btn btn-primary" style="width: 100%;" onclick="App.closeModal(); App.navigateTo('home');">
          🏠 Về Trang Chủ
        </button>
      </div>
    `;

    modalFooter.innerHTML = ``;
  },

  viewSupportTicketDetailModal(ticketId) {
    const requests = StorageService.getResetRequests();
    const ticket = requests.find(r => r.id === ticketId || r.ticketId === ticketId);
    if (!ticket) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `👁️ Chi Tiết Phiếu CSKH: ${ticket.ticketId || ticket.id}`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; font-size: 13px; line-height: 1.8;">
          <div>🎫 <strong>Mã phiếu:</strong> <code style="font-weight:700; color:#e11d48;">${ticket.ticketId || ticket.id}</code></div>
          <div>👤 <strong>Sinh viên:</strong> <strong>${ticket.fullName}</strong> (MSSV: <strong>${ticket.studentId || 'Chưa có'}</strong>)</div>
          <div>📞 <strong>Liên hệ:</strong> <a href="mailto:${ticket.contact || ticket.email}" style="color:var(--brand-primary); font-weight:600;">${ticket.contact || ticket.phone || ticket.email || 'Chưa có'}</a></div>
          <div>🏷️ <strong>Phân loại:</strong> <span class="ticket-type-pill">${ticket.issueType || 'CSKH'}</span></div>
          <div>📅 <strong>Thời gian gửi:</strong> ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('vi-VN') : 'Gần đây'}</div>
          <div>📌 <strong>Trạng thái:</strong> <span class="${ticket.status === 'resolved' ? 'status-badge-active' : 'status-badge-pending'}">${ticket.status === 'resolved' ? '✓ Đã xử lý' : '⏳ Cần xử lý'}</span></div>
        </div>

        <div>
          <strong style="font-size: 14px; color: var(--text-primary); display: block; margin-bottom: 6px;">
            📝 Tiêu đề: ${ticket.title || 'Yêu cầu hỗ trợ'}
          </strong>
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; font-size: 13.5px; line-height: 1.7; color: var(--text-primary); white-space: pre-wrap; max-height: 250px; overflow-y: auto;">
${ticket.content || ticket.note || 'Không có nội dung chi tiết.'}
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      ${ticket.status !== 'resolved' ? `
        <button class="btn btn-primary" onclick="App.resolveResetRequestAction('${ticket.id}'); App.closeModal();">
          🔄 Cấp Lại PIN Mặc Định (123456)
        </button>
      ` : ''}
    `;

    modal.classList.add("active");
  },

  openAppsScriptConfigModal() {
    const currentUrl = EmailService.getAppsScriptUrl();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "⚙️ Cấu Hình Google Apps Script (Gửi Email Thật)";

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 13px; color: #0369a1; line-height: 1.5;">
          💡 <strong>Hướng dẫn:</strong> Triển khai mã nguồn trong thư mục <code>google-apps-script/Code.gs</code> lên <a href="https://script.google.com" target="_blank" style="color:#0284c7; font-weight:700; text-decoration:underline;">script.google.com</a>, sau đó sao chép <strong>URL Ứng dụng web</strong> và dán vào ô bên dưới:
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Google Apps Script Web App URL (*):</label>
          <input type="text" id="appsScriptUrlInput" class="form-control" placeholder="https://script.google.com/macros/s/AKfycb.../exec" value="${currentUrl}">
        </div>

        <div id="gasStatusBox" style="font-size: 12.5px; padding: 10px 12px; border-radius: 4px; ${currentUrl ? 'background:#f0fdf4; color:#166534; border:1px solid #bbf7d0;' : 'background:#f8fafc; color:#64748b; border:1px solid #e2e8f0;'}">
          ${currentUrl ? `✓ Đang liên kết: <code>${currentUrl.substring(0, 45)}...</code>` : 'Chưa cấu hình URL (Hệ thống sẽ chạy ở chế độ mô phỏng OTP).'}
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm" style="border-color: #0284c7; color: #0284c7;" onclick="App.testAppsScriptConnection()">
            🧪 Kiểm Tra Kết Nối
          </button>
          <a href="https://script.google.com" target="_blank" class="btn btn-sm">
            🌐 Mở script.google.com ➔
          </a>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveAppsScriptConfig()">Lưu Cấu Hình</button>
    `;

    modal.classList.add("active");
  },

  saveAppsScriptConfig() {
    const url = document.getElementById("appsScriptUrlInput")?.value.trim();
    EmailService.setAppsScriptUrl(url);
    this.showToast(url ? "✅ Đã lưu URL Google Apps Script thành công!" : "ℹ️ Đã xóa URL Google Apps Script.", "success", 3500);
    this.closeModal();
  },

  async testAppsScriptConnection() {
    const url = document.getElementById("appsScriptUrlInput")?.value.trim();
    if (!url) {
      this.showToast("⚠️ Vui lòng nhập URL Google Apps Script trước khi kiểm tra!", "warning");
      return;
    }

    const statusBox = document.getElementById("gasStatusBox");
    if (statusBox) statusBox.innerHTML = "⏳ Đang kết nối tới máy chủ Google Apps Script...";

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (statusBox) {
        statusBox.style.background = "#f0fdf4";
        statusBox.style.color = "#166534";
        statusBox.style.border = "1px solid #bbf7d0";
        statusBox.innerHTML = `🎉 Kết nối thành công! Trạng thái: <strong>${data.status || 'online'}</strong> (Admin: ${data.admin || 'DThu'})`;
      }
      this.showToast("🎉 Kết nối thành công với Google Apps Script!", "success", 3500);
    } catch (err) {
      if (statusBox) {
        statusBox.style.background = "#fef2f2";
        statusBox.style.color = "#991b1b";
        statusBox.style.border = "1px solid #fecdd3";
        statusBox.innerHTML = `❌ Không thể kết nối. Vui lòng kiểm tra lại quyền Web App ("Anyone") và URL!`;
      }
      this.showToast("❌ Không thể kết nối tới Google Apps Script URL này!", "danger", 4000);
    }
  },

  openContactModal(prefill = {}) {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const currentProfile = StorageService.getUserProfile();
    const isUserLoggedIn = StorageService.isLoggedIn();

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:8px;">${Icons.get('contact', 18)} <span>Liên Hệ Ban Quản Trị & Đóng Góp Ý Kiến</span></span>`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Card Thông Tin Trưởng Ban Phát Triển -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1.5px solid #bae6fd; border-radius: var(--radius-sm); padding: 14px 16px; font-size: 13px; color: #0369a1; line-height: 1.6;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <div style="color:#0284c7; display:flex; align-items:center;">${Icons.get('user', 28)}</div>
            <div>
              <strong style="font-size: 14.5px; color: #0c4a6e;">Shina Sanora</strong> (Lead Developer &amp; Project Lead)
              <div style="font-size: 12px; color: #0284c7;">Shinora Academic &amp; Technology Studio</div>
            </div>
          </div>
          <div style="font-size: 12.5px; border-top: 1px dashed #7dd3fc; padding-top: 6px; margin-top: 6px; display: flex; flex-direction: column; gap: 3px;">
            <div>Kênh tiếp nhận: <strong>Hệ thống Ticket Trực Tuyến &amp; Email Hỗ Trợ Kỹ Thuật</strong></div>
            <div>Thời gian tiếp nhận &amp; đối soát: <strong>Trong vòng 24 - 48 giờ làm việc</strong></div>
          </div>
        </div>

        <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.4;">
          Mọi góp ý về ngân hàng câu hỏi, đề xuất tính năng hoặc báo cáo lỗi kỹ thuật sẽ được gửi trực tiếp đến hộp thư của Admin:
        </p>

        <!-- Form Nhập Thông Tin -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Họ và tên của bạn (*):</label>
            <input type="text" id="contactSenderName" class="form-control" placeholder="Họ và tên..." value="${isUserLoggedIn ? currentProfile.fullName : (prefill.fullName || '')}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Mã số sinh viên (MSSV):</label>
            <input type="text" id="contactSenderMssv" class="form-control" placeholder="Ví dụ: 0024xxxxxx" value="${isUserLoggedIn ? (currentProfile.studentId || '') : (prefill.studentId || '')}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Email / SĐT liên hệ (*):</label>
            <input type="text" id="contactSenderInfo" class="form-control" placeholder="Email hoặc SĐT nhận phản hồi..." value="${isUserLoggedIn ? (currentProfile.email || '') : (prefill.contact || '')}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Chủ đề liên hệ (*):</label>
            <select id="contactCategory" class="form-control">
              <option value="Đóng góp ý kiến & Cải tiến tính năng">Đóng góp ý kiến & Tính năng mới</option>
              <option value="Báo lỗi nội dung câu hỏi / Môn học">Báo lỗi câu hỏi / Đề cương</option>
              <option value="Đóng góp bộ đề thi mới (.txt)">Đóng góp bộ đề thi mới</option>
              <option value="Khiếu nại bản quyền & Yêu cầu gỡ bỏ đề thi (24h - 48h)">Khiếu nại bản quyền / Yêu cầu gỡ bỏ đề (24h-48h)</option>
              <option value="Hỗ trợ tài khoản & Cấp lại mã PIN">Hỗ trợ tài khoản & Quên PIN</option>
              <option value="Hợp tác & Khác">Hợp tác & Khác</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Tiêu đề tin nhắn (*):</label>
          <input type="text" id="contactSubject" class="form-control" placeholder="Ví dụ: Góp ý thêm bộ đếm thời gian hoặc báo lỗi câu hỏi môn Toán C1">
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Nội dung chi tiết (*):</label>
          <textarea id="contactMessage" class="form-control" rows="4" placeholder="Kính gửi Ban Quản Trị Shinora QuizMaster &amp; Developer Shina Sanora,&#10;&#10;Em xin phép đóng góp ý kiến..." style="resize: vertical; font-size: 13.5px; line-height: 1.5;"></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-primary" style="font-weight: 700; display:inline-flex; align-items:center; gap:6px;" onclick="App.submitContactFeedbackAction()">
        ${Icons.get('contact', 14)} <span>Gửi Lời Nhắn Đến Ban Quản Trị</span> ${Icons.get('arrowRight', 12)}
      </button>
    `;

    modal.classList.add("active");
  },

  async submitContactFeedbackAction() {
    const fullName = document.getElementById("contactSenderName")?.value.trim();
    const studentId = document.getElementById("contactSenderMssv")?.value.trim();
    const contact = document.getElementById("contactSenderInfo")?.value.trim();
    const issueType = document.getElementById("contactCategory")?.value;
    const title = document.getElementById("contactSubject")?.value.trim();
    const content = document.getElementById("contactMessage")?.value.trim();

    if (!fullName || !contact || !content) {
      this.showToast("⚠️ Vui lòng điền đầy đủ Họ tên, Thông tin liên hệ và Nội dung lời nhắn!", "warning");
      return;
    }

    const ticketId = "FEEDBACK-" + Math.floor(100000 + Math.random() * 900000);

    const ticketData = {
      ticketId,
      fullName,
      studentId: studentId || "Khách",
      contact,
      email: contact.includes("@") ? contact : "",
      phone: !contact.includes("@") ? contact : "",
      issueType,
      title: title || `Liên hệ & Góp ý: ${issueType}`,
      content
    };

    this.showToast("⏳ Đang gửi lời nhắn đến Ban Quản Trị...", "info", 2000);

    // 1. Gửi qua Google Apps Script về email Admin
    await EmailService.sendSupportTicket(ticketData);

    // 2. Lưu vào hệ thống quản trị
    StorageService.createSupportTicket(ticketData);

    this.closeModal();
    this.showToast(`🎉 Cảm ơn bạn! Lời nhắn đã được chuyển tiếp thành công đến Ban Quản Trị Shinora Studio!`, "success", 5000);
  }
});
