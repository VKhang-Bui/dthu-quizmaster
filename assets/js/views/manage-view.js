/**
 * MANAGE VIEW & DRAFT REVIEW MODULE
 * Quản lý bộ đề thi (Chính thức + Chờ duyệt), Kiểm duyệt chi tiết Draft.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  renderManageView(container) {
    const subjects = StorageService.getSubjects();
    const drafts = StorageService.getDraftSubjects();
    const profile = StorageService.getUserProfile();
    const canApprove = profile.role === "admin" || StorageService.hasPermission("canApproveDrafts");
    const activeTab = this.adminSubjectTab || "official";

    container.innerHTML = `
      <div style="padding: 32px 28px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800; display:flex; align-items:center; gap:8px;">${Icons.get('manage', 22)} <span>Quản Lý Bộ Đề</span></h2>
            <p style="color: var(--text-secondary); margin-top: 4px;">Quản lý toàn bộ ngân hàng đề thi chính thức và duyệt đề đóng góp từ cộng đồng.</p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.navigateTo('parser')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('upload', 14)} <span>Nhập đề (Parser)</span></button>
            <button class="btn" onclick="App.openCreateSubjectModal()" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('plus', 14)} <span>Thêm môn học</span></button>
            <button class="btn" onclick="App.refreshCloudSubjects()" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('refresh', 14)} <span>Làm mới Cloud</span></button>
            <button class="btn" onclick="ImportExportService.exportAll()" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('download', 14)} <span>Sao lưu (.json)</span></button>
          </div>
        </div>

        <div class="hub-tabs" style="margin-bottom: 20px;">
          <button class="hub-tab-btn ${activeTab === 'official' ? 'active' : ''}" onclick="App.switchManageTab('official')" style="display:inline-flex; align-items:center; gap:6px;">
            <span style="color:#10b981; display:flex; align-items:center;">${Icons.get('shieldCheck', 14)}</span> <span>Bộ Đề Chính Thức</span> <span class="badge-tab-count">${subjects.length}</span>
          </button>
          ${canApprove ? `<button class="hub-tab-btn ${activeTab === 'drafts' ? 'active' : ''}" onclick="App.switchManageTab('drafts')" style="display:inline-flex; align-items:center; gap:6px;"><span style="color:#f59e0b; display:flex; align-items:center;">${Icons.get('clock', 14)}</span> <span>Chờ Phê Duyệt</span> <span class="badge-tab-count">${drafts.length}</span></button>` : ''}
        </div>

        <div id="manageTabContent">
          ${activeTab === 'official' ? this.renderManageOfficialTab(subjects) : this.renderManageDraftsTab(drafts)}
        </div>
      </div>
    `;
  },

  switchManageTab(tab) {
    this.adminSubjectTab = tab;
    this.renderManageView(document.getElementById("mainContent"));
  },

  renderManageOfficialTab(subjects) {
    if (subjects.length === 0) {
      return `<div style="text-align: center; padding: 48px; color: var(--text-tertiary); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);"><div style="color: var(--text-tertiary); margin-bottom: 10px; display:flex; justify-content:center;">${Icons.get('fileText', 40)}</div><h3>Chưa có môn học chính thức nào.</h3><p style="margin-top: 6px;">Bấm "Thêm môn học" hoặc nhập đề qua Parser.</p></div>`;
    }
    return '<div style="display: flex; flex-direction: column; gap: 14px;">' +
      subjects.map(sub => '<div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">' +
        '<div style="flex: 1; min-width: 250px;">' +
          '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;"><span class="badge badge-gray">' + (sub.code || sub.id) + '</span><span class="badge badge-blue">' + (sub.department || 'ĐH Đồng Tháp') + '</span></div>' +
          '<h3 style="font-size: 16.5px; margin-bottom: 2px; color: var(--text-primary);">' + sub.name + '</h3>' +
          '<div style="font-size: 12.5px; color: var(--text-tertiary);">' + (sub.questions ? sub.questions.length : 0) + ' câu hỏi · ' + (sub.chapters ? sub.chapters.length : 0) + ' chương · Tác giả: <strong>' + (sub.author || 'Chưa cập nhật') + '</strong></div>' +
        '</div>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
          '<button class="btn btn-sm btn-primary" onclick="App.openQuizConfigModal(\'' + sub.id + '\')" style="display:inline-flex; align-items:center; gap:4px;">' + Icons.get('target', 13) + ' <span>Ôn Thi</span></button>' +
          '<button class="btn btn-sm" onclick="App.navigateTo(\'subject-detail\', { subjectId: \'' + sub.id + '\' })" style="display:inline-flex; align-items:center; gap:4px;">' + Icons.get('manage', 13) + ' <span>Quản lý</span></button>' +
          '<button class="btn btn-sm" onclick="ImportExportService.exportSubject(\'' + sub.id + '\')" style="display:inline-flex; align-items:center; gap:4px;">' + Icons.get('download', 13) + ' <span>JSON</span></button>' +
          '<button class="btn btn-danger btn-sm" onclick="App.deleteSubjectConfirm(\'' + sub.id + '\')" style="display:inline-flex; align-items:center; gap:4px;">' + Icons.get('trash', 13) + ' <span>Xóa</span></button>' +
        '</div>' +
      '</div>').join('') + '</div>';
  },

  renderManageDraftsTab(drafts) {
    if (drafts.length === 0) {
      return `<div style="text-align: center; padding: 48px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);"><div style="color: #10b981; margin-bottom: 10px; display:flex; justify-content:center;">${Icons.get('checkCircle', 40)}</div><h3>Không có đề thi nào đang chờ duyệt!</h3><p style="margin-top: 6px; color: var(--text-secondary);">Mọi đóng góp từ cộng đồng đã được xử lý.</p></div>`;
    }
    return '<div class="moderation-list">' +
      drafts.map(d => '<div class="moderation-card">' +
        '<div class="moderation-card-header">' +
          '<div class="moderation-title-group">' +
            '<h3><span style="color:#f59e0b; display:inline-flex; align-items:center; margin-right:4px;">' + Icons.get('sparkles', 16) + '</span> ' + d.name + ' <span class="badge" style="background:#fef3c7; color:#b45309;">' + (d.code || d.id) + '</span></h3>' +
            '<div class="moderation-meta">' +
              '<span style="display:inline-flex; align-items:center; gap:4px;">' + Icons.get('home', 12) + ' ' + (d.department || 'ĐH Đồng Tháp') + '</span>' +
              '<span style="display:inline-flex; align-items:center; gap:4px;">' + Icons.get('user', 12) + ' Người gửi: <strong>' + (d.author || 'Ẩn danh') + '</strong></span>' +
              '<span style="display:inline-flex; align-items:center; gap:4px;">' + Icons.get('clock', 12) + ' Ngày gửi: <strong>' + (d.submissionDate || 'Gần đây') + '</strong></span>' +
              '<span style="display:inline-flex; align-items:center; gap:4px;">' + Icons.get('fileText', 12) + ' Số câu hỏi: <strong>' + (d.questions ? d.questions.length : 0) + ' câu</strong></span>' +
            '</div>' +
          '</div>' +
          '<div class="moderation-actions">' +
            '<button class="btn btn-sm" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-weight:700; display:inline-flex; align-items:center; gap:4px;" onclick="App.navigateTo(\'draft-review\', { draftId: \'' + d.id + '\' })">' + Icons.get('edit', 13) + ' <span>Xem & Sửa Đề</span></button>' +
            '<button class="btn btn-primary" style="display:inline-flex; align-items:center; gap:4px;" onclick="App.approveDraft(\'' + d.id + '\')">' + Icons.get('checkCircle', 13) + ' <span>Duyệt Chính Thức</span></button>' +
            '<button class="btn btn-danger btn-sm" style="display:inline-flex; align-items:center; gap:4px;" onclick="App.rejectDraftConfirm(\'' + d.id + '\')">' + Icons.get('close', 13) + ' <span>Từ chối</span></button>' +
          '</div>' +
        '</div>' +
        '<div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">' + (d.description || 'Không có mô tả chi tiết.') + '</div>' +
      '</div>').join('') + '</div>';
  },

  async refreshCloudSubjects() {
    this.showToast("🔄 Đang đồng bộ dữ liệu từ Cloud...", "info", 2000);
    try {
      await StorageService.syncWithCloud();
      this.showToast("✅ Đã đồng bộ xong!", "success", 2500);
      this.renderManageView(document.getElementById("mainContent"));
    } catch (e) {
      this.showToast("❌ Lỗi đồng bộ: " + e.message, "danger", 3000);
    }
  },

  deleteSubjectConfirm(subjectId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa môn học",
      message: "Bạn có chắc chắn muốn xóa môn học này không? Toàn bộ ngân hàng câu hỏi sẽ bị xóa khỏi máy và Cloud.",
      icon: "🗑️",
      confirmText: "Xóa vĩnh viễn",
      isDanger: true,
      warningKey: "delete_subject",
      onConfirm: () => {
        StorageService.deleteSubject(subjectId);
        this.renderManageView(document.getElementById("mainContent"));
      }
    });
  },

  renderDraftReviewView(container, draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) {
      this.showToast("⚠️ Không tìm thấy bộ đề chờ duyệt này!", "warning");
      this.adminSubjectTab = "drafts";
      this.navigateTo("manage");
      return;
    }

    this.activeReviewDraftId = draftId;
    const questions = draft.questions || [];
    const editIdx = this.draftEditingQuestionIndex;
    const allOfficialSubjects = StorageService.getSubjects();

    // 1. Tự động nhận diện môn học đích (Target Subject Auto-Detection)
    let targetSubObj = null;
    if (draft.targetSubjectId && draft.targetSubjectId !== "NEW") {
      targetSubObj = allOfficialSubjects.find(s => s.id === draft.targetSubjectId);
    }
    if (!targetSubObj && draft.subjectId && draft.subjectId !== "NEW") {
      targetSubObj = allOfficialSubjects.find(s => s.id === draft.subjectId);
    }
    if (!targetSubObj && draft.code) {
      targetSubObj = allOfficialSubjects.find(s => s.code && s.code.toLowerCase() === draft.code.toLowerCase());
    }
    if (!targetSubObj && draft.name) {
      targetSubObj = allOfficialSubjects.find(s => s.name && s.name.toLowerCase() === draft.name.toLowerCase());
    }

    // Xác định ID môn học đích đã giải quyết (resolvedTargetSubId)
    const resolvedTargetSubId = targetSubObj ? targetSubObj.id : (draft.targetSubjectId === "NEW" ? "NEW" : (allOfficialSubjects.length > 0 ? allOfficialSubjects[0].id : "NEW"));
    const targetChapterId = draft.targetChapterId || "c1";

    // Danh sách chương của môn học đích
    const targetChapters = (targetSubObj && targetSubObj.chapters && targetSubObj.chapters.length > 0)
      ? targetSubObj.chapters
      : (draft.chapters && draft.chapters.length > 0 ? draft.chapters : [{ id: "c1", name: "Chương 1: Mở đầu & Tổng hợp" }]);

    // Điền sẵn thông tin chuẩn xác từ Môn học đích hoặc Draft
    const displaySubjectName = draft.name || (targetSubObj ? targetSubObj.name : "");
    const displaySubjectCode = draft.code || (targetSubObj ? targetSubObj.code : "POL101");
    const displayDepartment = draft.department || (targetSubObj ? targetSubObj.department : "Khoa Kỹ thuật - Công nghệ");
    const displayAuthor = draft.author || "Học viên Shinora";
    const displayDesc = draft.description || (targetSubObj ? targetSubObj.description : "");

    container.innerHTML = `
      <div style="padding: 28px 24px; max-width: 1050px; margin: 0 auto; width: 100%;">
        <!-- Sticky Header & Action Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-sm" onclick="App.adminSubjectTab = 'drafts'; App.navigateTo('manage')">
              ← Quay lại Quản lý bộ đề
            </button>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700;">⏳ Bản Chờ Phê Duyệt</span>
                <span class="badge badge-gray">${questions.length} câu hỏi</span>
              </div>
              <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
                👁️ Xem Lại & Chỉnh Sửa: ${draft.name || displaySubjectName}
              </h2>
            </div>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="App.saveDraftFullChanges('${draft.id}')">
              💾 Lưu Thay Đổi
            </button>
            <button class="btn btn-success btn-sm" onclick="App.approveDraftFromReview('${draft.id}')">
              ✅ Phê Duyệt Chính Thức
            </button>
            <button class="btn btn-danger btn-sm" onclick="App.rejectDraftConfirm('${draft.id}')">
              ❌ Từ Chối & Xóa
            </button>
          </div>
        </div>

        <!-- Khối Thông Tin Cơ Bản & Đích Đến (Editable) -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">
              📋 Thông Tin Tổng Quan & Môn Học Đích
            </h3>
            <span style="font-size: 12px; color: var(--text-tertiary);">Chỉnh sửa trực tiếp và bấm "Lưu Thay Đổi"</span>
          </div>

          <!-- Môn học đích khi duyệt -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 16px 18px; margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
              <div style="font-weight: 800; font-size: 14px; color: #166534; display: flex; align-items: center; gap: 6px;">
                <span>🎯</span>
                <span>Đích Đến Khi Phê Duyệt (Gộp vào Môn học chính thức):</span>
              </div>
              ${targetSubObj ? `
                <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700; font-size:12px;">
                  🔗 Đang liên kết: ${targetSubObj.name} (${targetSubObj.code || targetSubObj.id}) · ${targetSubObj.questions ? targetSubObj.questions.length : 0} câu hiện có
                </span>
              ` : `
                <span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700; font-size:12px;">
                  ➕ Sẽ tạo thành một Môn học Mới
                </span>
              `}
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 12.5px; color: #166534; font-weight: 700;">Gán vào môn học (*):</label>
                <select id="reviewDraftTargetSubject" class="form-control" style="font-weight: 600;" onchange="App.onReviewTargetSubjectChange('${draft.id}')">
                  ${allOfficialSubjects.map(s => {
                    const isSelected = (resolvedTargetSubId === s.id);
                    return `<option value="${s.id}" ${isSelected ? 'selected' : ''}>📚 ${s.name} (Mã: ${s.code || s.id})</option>`;
                  }).join('')}
                  <option value="NEW" ${resolvedTargetSubId === 'NEW' ? 'selected' : ''}>➕ Tạo thành môn học mới hoàn toàn</option>
                </select>
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 12.5px; color: #166534; font-weight: 700;">Gán câu hỏi vào chương (*):</label>
                <select id="reviewDraftTargetChapter" class="form-control" style="font-weight: 600;">
                  ${targetChapters.map(c => `<option value="${c.id}" ${targetChapterId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 12px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Tên Môn Học / Bộ Đề (*):</label>
              <input type="text" id="reviewDraftName" class="form-control" value="${displaySubjectName}" placeholder="Nhập tên môn học...">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Mã Học Phần (*):</label>
              <input type="text" id="reviewDraftCode" class="form-control" value="${displaySubjectCode}" placeholder="VD: POL102, BIO201...">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Khoa / Bộ Môn:</label>
              <input type="text" id="reviewDraftDept" class="form-control" value="${displayDepartment}" placeholder="Tên khoa...">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 13px; font-weight: 700;">Người Đóng Góp / Tác Giả:</label>
              <input type="text" id="reviewDraftAuthor" class="form-control" value="${displayAuthor}" placeholder="Tên người gửi...">
            </div>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 13px; font-weight: 700;">Mô Tả Bộ Đề:</label>
            <input type="text" id="reviewDraftDesc" class="form-control" value="${displayDesc}" placeholder="Nhập mô tả tóm tắt...">
          </div>
        </div>

        <!-- Khối Danh Sách Câu Hỏi: Hỗ Trợ 2 Tabs (Xem Trực Quan vs Soạn Thảo Văn Bản Thô) -->
        <div style="margin-bottom: 24px;">
          
          <!-- Thanh Tab Chuyển Đổi -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; border-bottom: 2px solid var(--border); padding-bottom: 0;">
            <div style="display: flex; gap: 6px; margin-bottom: -2px;">
              <button 
                class="btn ${(!this.draftReviewTab || this.draftReviewTab === 'cards') ? 'btn-primary' : ''}" 
                style="border-bottom-left-radius: 0; border-bottom-right-radius: 0; padding: 9px 16px; font-weight: 700; font-size: 13.5px; ${this.draftReviewTab === 'text' ? 'background: #f8fafc; border: 1px solid var(--border); border-bottom: none; color: var(--text-secondary);' : 'border-bottom: none;'}"
                onclick="App.switchDraftReviewTab('${draft.id}', 'cards')">
                👁️ Xem Trực Quan & Sửa Theo Thẻ (${questions.length})
              </button>
              <button 
                class="btn ${this.draftReviewTab === 'text' ? 'btn-primary' : ''}" 
                style="border-bottom-left-radius: 0; border-bottom-right-radius: 0; padding: 9px 16px; font-weight: 700; font-size: 13.5px; ${(!this.draftReviewTab || this.draftReviewTab === 'cards') ? 'background: #f8fafc; border: 1px solid var(--border); border-bottom: none; color: var(--text-secondary);' : 'border-bottom: none;'}"
                onclick="App.switchDraftReviewTab('${draft.id}', 'text')">
                📝 Soạn Thảo Văn Bản Thô / Word (Dạng Text)
              </button>
            </div>

            ${(!this.draftReviewTab || this.draftReviewTab === 'cards') ? `
              <button class="btn btn-primary btn-sm" style="margin-bottom: 8px;" onclick="App.addNewDraftQuestion('${draft.id}')">
                ➕ Thêm câu hỏi mới
              </button>
            ` : ''}
          </div>

          ${(!this.draftReviewTab || this.draftReviewTab === 'cards') ? `
            <!-- ── TAB 1: THẺ CÂU HỎI TRỰC QUAN & INLINE EDIT ─────────────── -->
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 14px 0;">
              Đọc soát từng câu hỏi. Bấm <strong>"✏️ Sửa câu này"</strong> để chỉnh sửa nội dung hoặc đáp án trực tiếp tại chỗ.
            </p>

            ${questions.length === 0 ? `
              <div style="text-align: center; padding: 48px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
                <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                <h3>Bộ đề này chưa có câu hỏi nào!</h3>
                <p style="margin-top: 6px; color: var(--text-secondary);">Bấm nút "➕ Thêm câu hỏi mới" bên trên hoặc chuyển sang Tab "Soạn thảo văn bản" để nhập đề.</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${questions.map((q, qIdx) => {
                  const isEditing = (editIdx === qIdx);

                  if (isEditing) {
                    // FORM CHỈNH SỬA TRỰC TIẾP (INLINE EDITOR)
                    return `
                      <div style="background: #ffffff; border: 2px solid var(--brand-primary); border-radius: var(--radius-md); padding: 20px; box-shadow: 0 4px 12px rgba(59,130,246,0.12);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                          <span class="badge" style="background:#dbeafe; color:#1e40af; font-weight:700;">✏️ Đang sửa Câu ${qIdx + 1}</span>
                          <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary btn-sm" onclick="App.saveDraftQuestionEdit('${draft.id}', ${qIdx})">
                              ✔️ Hoàn tất sửa câu này
                            </button>
                            <button class="btn btn-sm" onclick="App.cancelDraftQuestionEdit('${draft.id}')">
                              Hủy
                            </button>
                          </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 14px;">
                          <label class="form-label" style="font-size: 13px; font-weight:700;">Nội dung câu hỏi (*):</label>
                          <textarea id="editDraftQText_${qIdx}" class="form-control" style="min-height: 80px; font-size: 14px;">${q.question || ''}</textarea>
                        </div>

                        <div style="margin-bottom: 14px;">
                          <label class="form-label" style="font-size: 13px; font-weight:700; margin-bottom: 8px; display:block;">
                            Các phương án lựa chọn (Tích chọn nút tròn để đổi đáp án đúng):
                          </label>
                          <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${[0, 1, 2, 3].map(oi => {
                              const opt = (q.options && q.options[oi]) ? q.options[oi] : { text: '', note: '' };
                              const isCorrect = (q.answerIndex === oi || (opt.isCorrect && q.answerIndex === undefined));
                              return `
                                <div style="display: flex; gap: 10px; align-items: flex-start; background: ${isCorrect ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isCorrect ? '#86efac' : 'var(--border)'}; border-radius: var(--radius-sm); padding: 10px 12px;">
                                  <div style="display: flex; align-items: center; gap: 6px; padding-top: 6px;">
                                    <input type="radio" name="editDraftAnswer_${qIdx}" id="editDraftAns_${qIdx}_${oi}" value="${oi}" ${isCorrect ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                                    <label for="editDraftAns_${qIdx}_${oi}" style="font-weight: 800; font-size: 14px; cursor: pointer; color: ${isCorrect ? '#166534' : 'inherit'};">
                                      ${App.letters[oi]}.
                                    </label>
                                  </div>
                                  <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                                    <input type="text" id="editDraftOpt_${qIdx}_${oi}" class="form-control" value="${(opt.text || '').replace(/"/g, '&quot;')}" placeholder="Nội dung phương án ${App.letters[oi]}..." style="font-size: 13.5px;">
                                    <input type="text" id="editDraftNote_${qIdx}_${oi}" class="form-control" value="${(opt.note || '').replace(/"/g, '&quot;')}" placeholder="Giải thích cho phương án ${App.letters[oi]} (tùy chọn)..." style="font-size: 12px; color: var(--text-secondary);">
                                  </div>
                                </div>
                              `;
                            }).join('')}
                          </div>
                        </div>
                      </div>
                    `;
                  }

                  // THẺ REVIEW TRỰC QUAN (READ-ONLY VIEW)
                  return `
                    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 20px; transition: var(--transition-fast);">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span class="badge badge-gray" style="font-weight: 700;">Câu ${qIdx + 1}</span>
                          <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700;">
                            Đáp án: ${App.letters[q.answerIndex] || 'A'}
                          </span>
                        </div>
                        <div style="display: flex; gap: 6px;">
                          <button class="btn btn-sm btn-primary" onclick="App.toggleEditDraftQuestion('${draft.id}', ${qIdx})">
                            ✏️ Sửa câu này
                          </button>
                          <button class="btn btn-sm btn-danger" onclick="App.deleteDraftQuestion('${draft.id}', ${qIdx})">
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>

                      <div style="font-weight: 700; font-size: 14.5px; line-height: 1.5; margin-bottom: 12px; color: var(--text-primary);">
                        ${SmartParserService.formatRichText(q.question)}
                      </div>

                      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; width: 100%;">
                        ${(q.options || []).map((opt, optIdx) => {
                          const isAns = (optIdx === q.answerIndex);
                          return `
                            <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; padding: 10px 14px; border-radius: 6px; border: ${isAns ? '1.5px solid #16a34a' : '1px solid #cbd5e1'}; background: ${isAns ? '#dcfce7' : '#ffffff'}; box-shadow: ${isAns ? '0 1px 3px rgba(22, 163, 74, 0.15)' : 'none'}; width: 100%; box-sizing: border-box;">
                              <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; min-width: 24px; background: ${isAns ? '#16a34a' : '#f1f5f9'}; color: ${isAns ? '#ffffff' : '#475569'}; border: ${isAns ? 'none' : '1px solid #cbd5e1'}; border-radius: 4px; font-weight: 800; font-size: 12.5px; flex-shrink: 0; margin-top: 1px;">
                                ${App.letters[optIdx]}
                              </span>
                              <div style="font-weight: ${isAns ? '700' : '400'}; color: ${isAns ? '#14532d' : '#334155'}; flex: 1; min-width: 0; word-break: break-word; overflow-wrap: break-word; line-height: 1.5;">
                                ${SmartParserService.formatRichText(opt.text || '')}
                              </div>
                              ${isAns ? `
                                <span style="margin-left: 8px; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0;">
                                  ✓ Đúng
                                </span>
                              ` : ''}
                            </div>
                          `;
                        }).join('')}
                      </div>

                      ${(q.options && q.options[q.answerIndex] && q.options[q.answerIndex].note) ? `
                        <div style="font-size: 13px; color: #14532d; background: #f0fdf4; padding: 10px 14px; border-radius: 6px; border: 1.5px dashed #22c55e; margin-top: 8px;">
                          💡 <strong>Giải thích:</strong> ${SmartParserService.formatRichText(q.options[q.answerIndex].note)}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          ` : `
            <!-- ── TAB 2: SOẠN THẢO VĂN BẢN THÔ / WORD STYLE (DẠNG TEXT) ── -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                <div>
                  <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0;">
                    📝 Soạn Thảo & Hiệu Chỉnh Văn Bản Thô (Word Style)
                  </h3>
                  <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0;">
                    Chỉnh sửa nhanh toàn bộ câu hỏi và đáp án đúng bằng cú pháp <code>> Đúng</code>, <code>*</code> hoặc <code>Đáp án: A</code>.
                  </p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button class="btn btn-sm" onclick="App.copyDraftRawText('${draft.id}')">
                    📋 Sao chép Text
                  </button>
                  <button class="btn btn-sm" onclick="App.downloadDraftRawText('${draft.id}')">
                    📥 Tải file .txt
                  </button>
                  <button class="btn btn-sm btn-primary" onclick="App.applyDraftRawTextChanges('${draft.id}')">
                    ⚡ Cập Nhật Câu Hỏi
                  </button>
                </div>
              </div>

              <!-- Khung Textarea lớn -->
              <textarea 
                id="draftRawTextarea" 
                class="form-control" 
                style="width: 100%; min-height: 480px; font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 13.5px; line-height: 1.65; padding: 16px; background: #ffffff; border: 1.5px solid var(--border); border-radius: var(--radius-sm);" 
                placeholder="Dán hoặc chỉnh sửa đề thi theo định dạng:&#10;Câu 1: Nội dung câu hỏi...&#10;A. Đáp án 1&#10;B. Đáp án 2 > Đúng&#10;C. Đáp án 3&#10;D. Đáp án 4"
                oninput="App.onDraftRawTextInput('${draft.id}')">${SmartParserService.questionsToRawText(questions)}</textarea>

              <!-- Real-time Live Badge & Warnings -->
              <div id="draftRawCounterBadge" style="margin-top: 12px; font-size: 13px; font-weight: 700; color: var(--brand-primary); display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-check"></i> ${questions.length} câu hỏi hợp lệ
              </div>
              <div id="draftRawWarningBanner" style="margin-top: 10px;"></div>
            </div>
          `}
        </div>

        <!-- Bottom Action Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;">
          <button class="btn btn-sm" onclick="App.adminSubjectTab = 'drafts'; App.navigateTo('manage')">
            ← Quay lại Quản lý bộ đề
          </button>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${(!this.draftReviewTab || this.draftReviewTab === 'cards') ? `
              <button class="btn btn-primary" onclick="App.addNewDraftQuestion('${draft.id}')">
                ➕ Thêm câu hỏi
              </button>
            ` : `
              <button class="btn btn-primary" onclick="App.applyDraftRawTextChanges('${draft.id}')">
                ⚡ Cập Nhật Văn Bản
              </button>
            `}
            <button class="btn btn-primary" onclick="App.saveDraftFullChanges('${draft.id}')">
              💾 Lưu Thay Đổi
            </button>
            <button class="btn btn-success" onclick="App.approveDraftFromReview('${draft.id}')">
              ✅ Phê Duyệt Chính Thức Ngay ➔
            </button>
          </div>
        </div>
      </div>
    `;
  },

  switchDraftReviewTab(draftId, tabName) {
    if (this.draftReviewTab === "text" && tabName === "cards") {
      // Tự động đồng bộ text đang sửa sang questions khi rời khỏi tab text
      this.applyDraftRawTextChanges(draftId, false);
    }
    this.draftReviewTab = tabName;
    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  onDraftRawTextInput(draftId) {
    const raw = document.getElementById("draftRawTextarea")?.value || "";
    const draft = StorageService.getDraftById(draftId);
    const chapterId = draft ? (draft.targetChapterId || "c1") : "c1";
    const { questions, warnings, errors, totalParsed } = SmartParserService.parseRawText(raw, chapterId);

    const badge = document.getElementById("draftRawCounterBadge");
    const warnContainer = document.getElementById("draftRawWarningBanner");

    if (badge) {
      if (warnings && warnings.length > 0) {
        badge.innerHTML = `<span style="color: #f59e0b; font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> ${totalParsed} câu (${warnings.length} cần chú ý)</span>`;
      } else {
        badge.innerHTML = `<span style="color: var(--success); font-weight: 700;"><i class="fa-solid fa-circle-check"></i> ${totalParsed} câu hỏi hợp lệ</span>`;
      }
    }

    if (warnContainer) {
      if (warnings && warnings.length > 0) {
        warnContainer.innerHTML = `
          <div style="padding: 10px 14px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 6px; color: #b45309; font-size: 12px; line-height: 1.5;">
            <div style="font-weight: 700; margin-bottom: 2px;"><i class="fa-solid fa-triangle-exclamation"></i> Cảnh báo kiểm tra (${warnings.length} câu):</div>
            <div style="max-height: 60px; overflow-y: auto;">${warnings.map(w => `<div>• ${w}</div>`).join('')}</div>
          </div>
        `;
      } else {
        warnContainer.innerHTML = "";
      }
    }
  },

  applyDraftRawTextChanges(draftId, showToastNotice = true) {
    const raw = document.getElementById("draftRawTextarea")?.value;
    if (raw === undefined) return;

    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;

    const chapterId = draft.targetChapterId || "c1";
    const { questions, totalParsed } = SmartParserService.parseRawText(raw, chapterId);

    draft.questions = questions;
    StorageService.saveDraftSubject(draft);

    if (showToastNotice) {
      this.showToast(`⚡ Đã cập nhật thành công ${totalParsed} câu hỏi vào bộ đề chờ duyệt!`, "success", 3000);
      const main = document.getElementById("mainContent");
      if (main) this.renderDraftReviewView(main, draftId);
    }
  },

  copyDraftRawText(draftId) {
    const raw = document.getElementById("draftRawTextarea")?.value;
    if (!raw) return;
    navigator.clipboard.writeText(raw).then(() => {
      this.showToast("📋 Đã sao chép toàn bộ văn bản câu hỏi vào Clipboard!", "success", 2500);
    }).catch(err => {
      this.showToast("Không thể sao chép: " + err, "danger");
    });
  },

  downloadDraftRawText(draftId) {
    const draft = StorageService.getDraftById(draftId);
    const raw = document.getElementById("draftRawTextarea")?.value || (draft ? SmartParserService.questionsToRawText(draft.questions) : "");
    if (!raw) return;

    const blob = new Blob([raw], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `de-thi-${draft ? (draft.code || draft.id) : 'draft'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.showToast("📥 Đã tải file .txt thành công!", "success", 2500);
  },

  onReviewTargetSubjectChange(draftId) {
    const subSelect = document.getElementById("reviewDraftTargetSubject");
    const chapSelect = document.getElementById("reviewDraftTargetChapter");
    const nameInput = document.getElementById("reviewDraftName");
    const codeInput = document.getElementById("reviewDraftCode");
    const deptInput = document.getElementById("reviewDraftDept");
    const descInput = document.getElementById("reviewDraftDesc");
    if (!subSelect || !chapSelect) return;

    const subId = subSelect.value;
    if (subId === "NEW") {
      chapSelect.innerHTML = '<option value="c1">Chương 1: Mở đầu & Tổng hợp</option>';
      if (codeInput && !codeInput.value) codeInput.value = "GEN101";
      if (deptInput && !deptInput.value) deptInput.value = "Khoa Kỹ thuật - Công nghệ";
    } else {
      const sub = StorageService.getSubjectById(subId);
      if (sub) {
        // Tự động điền đầy đủ thông tin Môn học đích có sẵn
        if (nameInput) nameInput.value = sub.name;
        if (codeInput) codeInput.value = sub.code || sub.id;
        if (deptInput) deptInput.value = sub.department || "Khoa Kỹ thuật - Công nghệ";
        if (descInput && !descInput.value) descInput.value = sub.description || "";

        // Nạp đầy đủ các chương thực tế của môn học đích
        if (sub.chapters && sub.chapters.length > 0) {
          chapSelect.innerHTML = sub.chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        } else {
          chapSelect.innerHTML = '<option value="c1">Chương 1: Mở đầu</option>';
        }
      }
    }
  },

  toggleEditDraftQuestion(draftId, qIndex) {
    this.draftEditingQuestionIndex = qIndex;
    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  cancelDraftQuestionEdit(draftId) {
    this.draftEditingQuestionIndex = null;
    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  saveDraftQuestionEdit(draftId, qIndex) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft || !draft.questions || !draft.questions[qIndex]) return;

    const qText = document.getElementById(`editDraftQText_${qIndex}`)?.value.trim() || "";
    if (!qText) {
      this.showToast("⚠️ Vui lòng nhập nội dung câu hỏi!", "warning");
      return;
    }

    const radios = document.querySelectorAll(`input[name="editDraftAnswer_${qIndex}"]`);
    let selectedAns = 0;
    radios.forEach(r => {
      if (r.checked) selectedAns = parseInt(r.value, 10);
    });

    const newOptions = [0, 1, 2, 3].map(oi => {
      const optText = document.getElementById(`editDraftOpt_${qIndex}_${oi}`)?.value.trim() || `Phương án ${this.letters[oi]}`;
      const optNote = document.getElementById(`editDraftNote_${qIndex}_${oi}`)?.value.trim() || "";
      return {
        text: optText,
        isCorrect: (oi === selectedAns),
        note: optNote
      };
    });

    draft.questions[qIndex].question = qText;
    draft.questions[qIndex].options = newOptions;
    draft.questions[qIndex].answerIndex = selectedAns;

    StorageService.saveDraftSubject(draft);
    this.draftEditingQuestionIndex = null;
    this.showToast(`✅ Đã cập nhật Câu ${qIndex + 1}!`, "success", 2500);

    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  deleteDraftQuestion(draftId, qIndex) {
    this.showConfirmDialog({
      title: "Xác nhận xóa câu hỏi",
      message: `Bạn có chắc chắn muốn xóa Câu ${qIndex + 1} khỏi bộ đề này không?`,
      icon: "🗑️",
      confirmText: "Xóa câu này",
      isDanger: true,
      warningKey: "delete_draft_q",
      onConfirm: () => {
        const draft = StorageService.getDraftById(draftId);
        if (!draft || !draft.questions) return;
        draft.questions.splice(qIndex, 1);
        if (this.draftEditingQuestionIndex === qIndex) this.draftEditingQuestionIndex = null;
        StorageService.saveDraftSubject(draft);
        this.showToast("🗑️ Đã xóa câu hỏi khỏi bộ đề!", "info", 2500);
        const main = document.getElementById("mainContent");
        if (main) this.renderDraftReviewView(main, draftId);
      }
    });
  },

  addNewDraftQuestion(draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;
    if (!draft.questions) draft.questions = [];

    const newQ = {
      id: `q-${Date.now()}-${draft.questions.length + 1}`,
      chapterId: draft.targetChapterId || "c1",
      question: "Nội dung câu hỏi mới...",
      options: [
        { text: "Phương án A", isCorrect: true, note: "Giải thích đáp án A (chính xác)." },
        { text: "Phương án B", isCorrect: false, note: "" },
        { text: "Phương án C", isCorrect: false, note: "" },
        { text: "Phương án D", isCorrect: false, note: "" }
      ],
      answerIndex: 0
    };

    draft.questions.push(newQ);
    StorageService.saveDraftSubject(draft);
    this.draftEditingQuestionIndex = draft.questions.length - 1;
    this.showToast("➕ Đã thêm câu hỏi mới vào cuối đề!", "success", 2500);

    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  saveDraftFullChanges(draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;

    // Nếu đang ở Tab Văn bản, tự động áp dụng text trước
    if (this.draftReviewTab === "text") {
      this.applyDraftRawTextChanges(draftId, false);
    }

    const nameVal = document.getElementById("reviewDraftName")?.value.trim();
    const codeVal = document.getElementById("reviewDraftCode")?.value.trim();
    const deptVal = document.getElementById("reviewDraftDept")?.value.trim();
    const authorVal = document.getElementById("reviewDraftAuthor")?.value.trim();
    const descVal = document.getElementById("reviewDraftDesc")?.value.trim();
    const targetSubVal = document.getElementById("reviewDraftTargetSubject")?.value;
    const targetChapVal = document.getElementById("reviewDraftTargetChapter")?.value;

    if (nameVal) draft.name = nameVal;
    if (codeVal) draft.code = codeVal;
    if (deptVal) draft.department = deptVal;
    if (authorVal) draft.author = authorVal;
    if (descVal !== undefined) draft.description = descVal;
    if (targetSubVal) draft.targetSubjectId = targetSubVal;
    if (targetChapVal) {
      draft.targetChapterId = targetChapVal;
      if (draft.questions) {
        draft.questions.forEach(q => {
          if (!q.chapterId) q.chapterId = targetChapVal;
        });
      }
    }

    // Nếu liên kết với môn học có sẵn, bảo đảm mã và tên khớp hoàn toàn
    if (targetSubVal && targetSubVal !== "NEW") {
      const targetSub = StorageService.getSubjectById(targetSubVal);
      if (targetSub) {
        if (!codeVal) draft.code = targetSub.code || targetSub.id;
        if (!nameVal) draft.name = targetSub.name;
        if (!deptVal) draft.department = targetSub.department;
      }
    }

    StorageService.saveDraftSubject(draft);
    this.showToast("💾 Đã lưu toàn bộ thông tin bộ đề vào Cloud & Local thành công!", "success", 3000);
    this.renderHeader();

    const main = document.getElementById("mainContent");
    if (main) this.renderDraftReviewView(main, draftId);
  },

  approveDraftFromReview(draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;

    // Lưu các trường input nếu có thay đổi trước khi duyệt
    const nameVal = document.getElementById("reviewDraftName")?.value.trim();
    const codeVal = document.getElementById("reviewDraftCode")?.value.trim();
    const deptVal = document.getElementById("reviewDraftDept")?.value.trim();
    const authorVal = document.getElementById("reviewDraftAuthor")?.value.trim();
    const descVal = document.getElementById("reviewDraftDesc")?.value.trim();
    const targetSubVal = document.getElementById("reviewDraftTargetSubject")?.value;
    const targetChapVal = document.getElementById("reviewDraftTargetChapter")?.value;

    if (nameVal) draft.name = nameVal;
    if (codeVal) draft.code = codeVal;
    if (deptVal) draft.department = deptVal;
    if (authorVal) draft.author = authorVal;
    if (descVal !== undefined) draft.description = descVal;
    if (targetSubVal) draft.targetSubjectId = targetSubVal;
    if (targetChapVal) {
      draft.targetChapterId = targetChapVal;
      if (draft.questions) {
        draft.questions.forEach(q => {
          if (!q.chapterId) q.chapterId = targetChapVal;
        });
      }
    }

    // Nếu liên kết với môn học có sẵn, bảo đảm mã và tên khớp hoàn toàn
    if (targetSubVal && targetSubVal !== "NEW") {
      const targetSub = StorageService.getSubjectById(targetSubVal);
      if (targetSub) {
        if (!codeVal) draft.code = targetSub.code || targetSub.id;
        if (!nameVal) draft.name = targetSub.name;
        if (!deptVal) draft.department = targetSub.department;
      }
    }

    StorageService.saveDraftSubject(draft);

    const res = StorageService.approveDraft(draftId);
    if (res) {
      this.showToast(`🎉 Đã duyệt bộ đề và gộp vào môn "${res.name}" (${res.code || res.id}) thành công! (+50 EXP)`, "success", 4500);
      this.renderHeader();
      this.adminSubjectTab = "official";
      this.navigateTo("manage");
    }
  }
});
