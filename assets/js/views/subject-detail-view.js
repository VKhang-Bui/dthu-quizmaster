/**
 * SHINORA QUIZMASTER - SUBJECT DETAIL VIEW MODULE (v4.2.1)
 * Trang Tổng Quan & Bảng Điều Khiển Môn Học (Subject Control Hub):
 * - Hỗ trợ 2 chế độ: Môn học chính thức & Đề thi đóng góp chờ phê duyệt (isDraft: true).
 * - Khung kiểm duyệt Draft Moderation Hub Banner (màu vàng cam nổi bật kèm nút Duyệt, Từ chối, Sửa đề).
 * - Nhân sự 3 lớp: Người tạo, Người duyệt, Danh sách sinh viên đóng góp (Contributors).
 * - Bộ chỉ số tổng quan: Tổng câu hỏi, Số chương, Tổng lượt thi, Điểm số.
 * - Lưới thẻ chi tiết từng chương (Chapter Tiles) — Click 1 chạm mở Ngân hàng câu hỏi riêng của chương.
 * - Khung mở rộng "Xem thêm" metadata chuyên sâu.
 */

Object.assign(App, {
  selectedSubjectDetailId: null,
  isSubjectDetailExpanded: false,
  activeSubjectIsDraft: false,

  renderSubjectDetailView(container, param) {
    let subjectId = typeof param === "string" ? param : (param?.subjectId || param?.id || this.selectedSubjectDetailId);
    let draftId = typeof param === "object" ? (param?.draftId) : null;
    let isDraft = Boolean(draftId || (typeof param === "object" && param?.isDraft) || (param === "draft"));

    let sub = null;
    if (isDraft) {
      sub = StorageService.getDraftById(draftId || subjectId);
    } else {
      sub = StorageService.getSubjectById(subjectId);
    }

    // Fallback tìm kiếm chéo
    if (!sub && !isDraft) {
      sub = StorageService.getDraftById(subjectId);
      if (sub) isDraft = true;
    }
    if (!sub && isDraft) {
      sub = StorageService.getSubjectById(subjectId);
      if (sub) isDraft = false;
    }

    if (!sub) {
      if (typeof CloudflareClient !== "undefined") {
        container.innerHTML = `
          <div class="view-subject-detail" style="text-align: center; padding: 80px 20px;">
            <div class="spinner" style="margin: 0 auto 16px auto; width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Đang tải dữ liệu từ Cloudflare D1...</h3>
            <p style="font-size: 13px; color: var(--text-secondary);">Hệ thống đang đồng bộ nội dung và danh sách câu hỏi</p>
          </div>
        `;
        const fetchPromise = isDraft 
          ? CloudflareClient.getDraftById(draftId || subjectId)
          : CloudflareClient.getOfficialSubjects();

        fetchPromise.then(res => {
          if (isDraft && res) {
            StorageService.saveDraftSubject(res);
            this.renderSubjectDetailView(container, param);
          } else if (!isDraft && Array.isArray(res)) {
            StorageService.saveSubjects(res);
            this.renderSubjectDetailView(container, param);
          } else {
            this.showToast("⚠️ Không tìm thấy thông tin môn học hoặc đề thi!", "warning");
            this.navigateTo("home");
          }
        }).catch(e => {
          this.showToast("⚠️ Lỗi kết nối tải dữ liệu!", "danger");
          this.navigateTo("home");
        });
        return;
      }

      this.showToast("⚠️ Không tìm thấy thông tin môn học hoặc đề thi!", "warning");
      this.navigateTo("home");
      return;
    }

    this.selectedSubjectDetailId = sub.id;
    this.activeSubjectIsDraft = isDraft;
    const isLogged = StorageService.isLoggedIn();

    // Chặn máy khách truy cập môn học bị khóa
    if (!isDraft && !isLogged && sub.isGuestAllowed === false) {
      container.innerHTML = `
        <div class="view-subject-detail" style="padding: 48px 20px; max-width: 600px; margin: 40px auto; text-align: center; background: var(--surface); border: 1.5px dashed #cbd5e1; border-radius: var(--radius-md); box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fef2f2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            ${Icons.get('lock', 26)}
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">Môn Học Dành Riêng Cho Sinh Viên DThu</h2>
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
            Môn học <strong>"${sub.name}"</strong> hiện đang được thiết lập giới hạn cho sinh viên và giảng viên Trường Đại học Đồng Tháp. Vui lòng đăng nhập tài khoản để xem chi tiết và ôn thi.
          </p>
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn" onclick="App.navigateTo('home')">← Về Trang Chủ</button>
            <button class="btn btn-primary" onclick="App.openLoginModal()" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
              ${Icons.get('shieldCheck', 14)} <span>Đăng Nhập Tài Khoản</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    const allQuestions = sub.questions || [];
    const qCount = allQuestions.length;
    const chapters = sub.chapters || [];
    const latestScore = isDraft ? null : StorageService.getLatestScoreForSubject(sub.id);
    const allHistory = typeof StorageService.getHistory === "function" ? StorageService.getHistory() : [];
    const history = isDraft ? [] : (allHistory || []).filter(h => h.subjectId === sub.id || h.subjectName === sub.name);
    const totalAttempts = history.length;

    let avgScore = 0;
    if (totalAttempts > 0) {
      const sum = history.reduce((acc, h) => acc + (Number(h.score10) || 0), 0);
      avgScore = (sum / totalAttempts).toFixed(1);
    }

    const profile = StorageService.getUserProfile();
    const isEditor = isLogged && (profile.role === "admin" || profile.role === "editor" || (profile.permissions && profile.permissions.canEditSubjects));

    // Môn học đích dự kiến nếu là bản draft
    let targetSubObj = null;
    if (isDraft) {
      const allOfficial = StorageService.getSubjects();
      if (sub.targetSubjectId && sub.targetSubjectId !== "NEW") {
        targetSubObj = allOfficial.find(s => s.id === sub.targetSubjectId);
      }
      if (!targetSubObj && sub.code) {
        targetSubObj = allOfficial.find(s => s.code && s.code.toLowerCase() === sub.code.toLowerCase());
      }
    }

    // Danh sách người đóng góp (Contributors)
    const contributors = sub.contributors || [];

    container.innerHTML = `
      <div class="view-subject-detail" style="padding: 24px 20px; max-width: 1150px; margin: 0 auto; width: 100%;">
        
        <!-- Top Navigation Bar & Action Buttons -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
            ${isDraft ? `
              <button class="btn btn-sm" onclick="App.switchManageTab('drafts'); App.navigateTo('manage')" style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('chevronLeft', 14)} <span>Quay lại Hàng Đợi Duyệt</span>
              </button>
            ` : `
              <button class="btn btn-sm" onclick="App.navigateTo('${isEditor ? 'manage' : 'home'}')" style="display:inline-flex; align-items:center; gap:6px;">
                ${isEditor ? `${Icons.get('chevronLeft', 14)} <span>Quản lý bộ đề</span>` : `${Icons.get('home', 14)} <span>Trang chủ</span>`}
              </button>
            `}
            <span>/</span>
            <span style="font-weight: 700; color: var(--text-primary); display:inline-flex; align-items:center; gap:4px;">
              ${Icons.get('book', 14)} <span>${sub.name}</span>
            </span>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${isDraft ? `
              <button class="btn btn-sm btn-primary" onclick="App.approveDraft('${sub.id}')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
                ${Icons.get('checkCircle', 14)} <span>Duyệt Chính Thức</span>
              </button>
              <button class="btn btn-sm" onclick="App.navigateTo('question-bank', { draftId: '${sub.id}', isDraft: true })" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                ${Icons.get('fileText', 14)} <span>Ngân Hàng Câu Hỏi (${qCount})</span>
              </button>
              <button class="btn btn-sm" onclick="App.openEditDraftInfoModal('${sub.id}')" style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('edit', 14)} <span>Sửa Đề / Đổi Môn Đích</span>
              </button>
              <button class="btn btn-sm btn-danger" onclick="App.rejectDraftConfirm('${sub.id}')" style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('trash', 14)} <span>Từ Chối</span>
              </button>
            ` : `
              <button class="btn btn-sm btn-primary" onclick="App.openQuizConfigModal('${sub.id}')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
                ${Icons.get('zap', 14)} <span>Vào Làm Bài Ngay</span>
              </button>
              <button class="btn btn-sm" onclick="App.navigateTo('question-bank', { subjectId: '${sub.id}' })" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                ${Icons.get('fileText', 14)} <span>Ngân Hàng Câu Hỏi (${qCount})</span>
              </button>
              ${isEditor ? `
                <button class="btn btn-sm" onclick="App.navigateTo('parser', { subjectId: '${sub.id}' })" style="display:inline-flex; align-items:center; gap:6px;">
                  ${Icons.get('upload', 14)} <span>Nhập Đề (Parser)</span>
                </button>
                <button class="btn btn-sm" onclick="App.openEditSubjectModal('${sub.id}')" style="display:inline-flex; align-items:center; gap:6px;">
                  ${Icons.get('edit', 14)} <span>Chỉnh Sửa Môn</span>
                </button>
              ` : ''}
              <button class="btn btn-sm" onclick="ImportExportService.exportSubject('${sub.id}')" style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('download', 14)} <span>Xuất JSON</span>
              </button>
            `}
          </div>
        </div>

        <!-- 0. KHUNG KIỂM DUYỆT ĐỀ CHỜ DUYỆT (DRAFT MODERATION HUB BANNER) -->
        ${isDraft ? `
          <div style="background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: var(--radius-md); padding: 18px 22px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(245,158,11,0.08);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; border-bottom: 1px dashed #fde68a; padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="badge" style="background:#f59e0b; color:#fff; font-weight:800; font-size:12.5px; padding: 4px 10px;">
                  🟡 ĐỀ THI ĐÓNG GÓP CHỜ PHÊ DUYỆT
                </span>
                <span style="font-size: 13px; color: #92400e; font-weight: 600;">
                  Ngày gửi: ${sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString('vi-VN') : 'Gần đây'}
                </span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-primary" onclick="App.approveDraft('${sub.id}')" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
                  ${Icons.get('checkCircle', 13)} <span>Duyệt & Xuất Bản Ngay</span>
                </button>
                <button class="btn btn-sm btn-danger" onclick="App.rejectDraftConfirm('${sub.id}')" style="display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('trash', 13)} <span>Từ Chối</span>
                </button>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; font-size: 13px; color: #78350f;">
              <div><strong>👨‍🎓 Tác giả gửi:</strong> ${sub.author || 'Ẩn danh'} ${sub.studentId ? `(MSSV: ${sub.studentId})` : ''}</div>
              <div><strong>🎯 Môn học đích:</strong> ${targetSubObj ? `${targetSubObj.name} (${targetSubObj.code})` : 'Tạo thành Môn Mới'}</div>
              <div><strong>🎁 Điểm thưởng:</strong> +30 EXP sau khi phê duyệt</div>
            </div>
          </div>
        ` : ''}

        <!-- 1. KHỐI HEADER ĐỊNH DANH & THÔNG TIN CHÍNH -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
            <div style="flex: 1; min-width: 280px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                <span class="badge" style="background:#e0e7ff; color:#4338ca; font-weight:800; font-family:var(--font-mono); font-size: 14px; padding: 4px 10px;">
                  ${sub.code || sub.id}
                </span>
                <span class="badge badge-blue" style="font-size: 12.5px;">
                  ${sub.department || 'Đại học Đồng Tháp'}
                </span>
                ${isDraft ? `
                  <span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 700; border: 1px solid #fde68a;">
                    🟡 Bản Đề Chờ Duyệt
                  </span>
                ` : `
                  <span class="badge" style="background: #f0fdf4; color: #15803d; font-weight: 700; border: 1px solid #bbf7d0;">
                    🟢 Chuẩn Khảo Thí
                  </span>
                `}
              </div>
              <h1 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0; line-height: 1.3;">
                ${sub.name}
              </h1>
              <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                ${sub.description || 'Chưa có mô tả chi tiết cho bộ đề này.'}
              </p>
            </div>

            <!-- Nút thao tác nhanh bên phải -->
            <div>
              ${isDraft ? `
                <button class="btn btn-primary" onclick="App.approveDraft('${sub.id}')" style="display:inline-flex; align-items:center; gap:8px; padding: 10px 20px; font-weight:800; font-size: 15px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                  ${Icons.get('checkCircle', 16)} <span>Duyệt Môn Này</span>
                </button>
              ` : `
                <button class="btn btn-primary" onclick="App.openQuizConfigModal('${sub.id}')" style="display:inline-flex; align-items:center; gap:8px; padding: 10px 20px; font-weight:800; font-size: 15px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                  ${Icons.get('zap', 16)} <span>Luyện Thi Ngay</span>
                </button>
              `}
            </div>
          </div>

          <!-- 2. KHỐI NHÂN SỰ & NGƯỜI ĐÓNG GÓP (CONTRIBUTORS HUB) -->
          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-sm); padding: 14px 18px; margin-top: 16px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              ${Icons.get('user', 14)} <span>Nhân sự biên soạn & Đóng góp học thuật:</span>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center; font-size: 13px;">
              <div>
                <span style="color: var(--text-tertiary);">${isDraft ? '👨‍🎓 Người đóng góp:' : '👑 Người tạo:'}</span>
                <strong style="color: var(--text-primary); margin-left: 4px;">${sub.author || 'Sinh viên'} ${sub.studentId ? `(${sub.studentId})` : ''}</strong>
              </div>
              <span style="color: #cbd5e1;">|</span>
              <div>
                <span style="color: var(--text-tertiary);">🛡️ Trạng thái duyệt:</span>
                <strong style="color: ${isDraft ? '#d97706' : '#15803d'}; margin-left: 4px;">
                  ${isDraft ? 'Đang chờ Admin phê duyệt' : (sub.approvedBy || 'Admin Hệ Thống')}
                </strong>
              </div>
              ${!isDraft ? `
                <span style="color: #cbd5e1;">|</span>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="color: var(--text-tertiary);">🤝 Người đóng góp:</span>
                  ${contributors.length > 0 ? `
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                      ${contributors.map(c => `
                        <span class="badge" style="background: #ffffff; border: 1px solid #cbd5e1; color: var(--text-primary); display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; font-weight: 600;" title="MSSV: ${c.studentId || ''} · Đóng góp: ${c.contributedQuestions || 0} câu">
                          <span>${c.avatar || '👨‍🎓'}</span>
                          <span>${c.fullName || c.name || 'Sinh viên'}</span>
                          <span style="color: #2563eb; font-weight: 700; font-size: 11px;">+${c.contributedQuestions || 0} câu</span>
                        </span>
                      `).join('')}
                    </div>
                  ` : `
                    <span style="color: var(--text-tertiary); font-style: italic;">Chưa có sinh viên đóng góp thêm</span>
                  `}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- 3. BỘ CHỈ SỐ TỔNG QUAN (CORE METRICS) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 14px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border);">
            <div style="background: #fafafa; border: 1px solid #f1f5f9; border-radius: var(--radius-sm); padding: 12px 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: var(--brand-primary);">${qCount}</div>
              <div style="font-size: 12px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px;">Tổng Số Câu Hỏi</div>
            </div>

            <div style="background: #fafafa; border: 1px solid #f1f5f9; border-radius: var(--radius-sm); padding: 12px 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #8b5cf6;">${chapters.length}</div>
              <div style="font-size: 12px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px;">Số Lượng Chương</div>
            </div>

            <div style="background: #fafafa; border: 1px solid #f1f5f9; border-radius: var(--radius-sm); padding: 12px 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #f59e0b;">${isDraft ? '+30 EXP' : totalAttempts}</div>
              <div style="font-size: 12px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px;">${isDraft ? 'Điểm Thưởng Tác Giả' : 'Lượt Sinh Viên Thi'}</div>
            </div>

            <div style="background: #fafafa; border: 1px solid #f1f5f9; border-radius: var(--radius-sm); padding: 12px 14px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: var(--success);">${isDraft ? 'Chờ Duyệt' : (latestScore ? `${latestScore.score10}/10` : 'Chưa thi')}</div>
              <div style="font-size: 12px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px;">${isDraft ? 'Tình Trạng' : 'Điểm Gần Nhất'}</div>
            </div>
          </div>
        </div>

        <!-- 4. LƯỚI THẺ CHI TIẾT TỪNG CHƯƠNG (INTERACTIVE CHAPTER TILES) -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div>
              <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
                ${Icons.get('folder', 18)} <span>Cấu Trúc Các Chương Kiến Thức (${chapters.length} Chương)</span>
              </h3>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin: 2px 0 0 0;">
                Bấm vào từng thẻ chương để xem và chỉnh sửa ngân hàng câu hỏi riêng của chương đó.
              </p>
            </div>

            <button class="btn btn-sm" onclick="App.navigateTo('question-bank', { ${isDraft ? `draftId: '${sub.id}', isDraft: true` : `subjectId: '${sub.id}'`} })" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
              ${Icons.get('fileText', 13)} <span>Mở Toàn Bộ Ngân Hàng Câu Hỏi</span>
            </button>
          </div>

          <!-- Lưới Thẻ Chương -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px;">
            ${chapters.length === 0 ? `
              <div style="padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); text-align: center; color: var(--text-tertiary);">
                Đề thi chưa phân chia chương cụ thể. Toàn bộ ${qCount} câu hỏi đang nằm trong danh mục chung.
              </div>
            ` : `
              ${chapters.map((c, cIdx) => {
                const cQuestions = allQuestions.filter(q => q.chapterId === c.id);
                const cQCount = cQuestions.length;
                const percent = qCount > 0 ? Math.round((cQCount / qCount) * 100) : 0;
                const isGuestAllowed = c.isGuestAllowed !== false;

                return `
                  <div 
                    class="chapter-tile-card" 
                    style="background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.02); transition: all 0.2s ease; display: flex; flex-direction: column; justify-content: space-between; gap: 14px;"
                    onmouseenter="this.style.borderColor='var(--brand-primary)'; this.style.boxShadow='0 4px 12px rgba(37,99,235,0.08)';"
                    onmouseleave="this.style.borderColor='var(--border)'; this.style.boxShadow='0 1px 4px rgba(0,0,0,0.02)';">
                    
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span class="badge" style="background: #f1f5f9; color: #334155; font-weight: 800; font-size: 11.5px;">
                          Chương ${cIdx + 1}
                        </span>
                        <span class="badge" style="background: ${isGuestAllowed ? '#f0fdf4' : '#fef3c7'}; color: ${isGuestAllowed ? '#15803d' : '#92400e'}; font-size: 11px; font-weight: 700;">
                          ${isGuestAllowed ? '🟢 Mở cho Khách' : '🔒 Khóa với Khách'}
                        </span>
                      </div>

                      <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0; line-height: 1.4;">
                        ${c.name}
                      </h4>

                      <!-- Thanh tiến độ dung lượng câu hỏi -->
                      <div style="margin-top: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">
                          <span>${cQCount} câu hỏi</span>
                          <span>${percent}% ngân hàng đề</span>
                        </div>
                        <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: ${percent}%; background: var(--brand-primary); border-radius: 3px;"></div>
                        </div>
                      </div>
                    </div>

                    <!-- Nút thao tác 1-Click -->
                    <div style="display: flex; gap: 8px; border-top: 1px dashed var(--border); padding-top: 12px;">
                      <button 
                        type="button" 
                        onclick="App.navigateTo('question-bank', { ${isDraft ? `draftId: '${sub.id}', isDraft: true` : `subjectId: '${sub.id}'`}, chapterId: '${c.id}' })" 
                        class="btn btn-sm" 
                        style="flex: 1; display:inline-flex; align-items:center; justify-content:center; gap:4px; font-weight:600; background:#f8fafc; border:1px solid #cbd5e1;">
                        ${Icons.get('edit', 12)} <span>Quản lý ${cQCount} câu</span>
                      </button>
                      ${!isDraft ? `
                        <button 
                          type="button" 
                          onclick="App.openQuizConfigModal('${sub.id}')" 
                          class="btn btn-sm btn-primary" 
                          style="display:inline-flex; align-items:center; justify-content:center; gap:4px;" 
                          title="Ôn tập riêng chương này">
                          ${Icons.get('target', 12)} <span>Ôn Thi</span>
                        </button>
                      ` : ''}
                    </div>

                  </div>
                `;
              }).join('')}
            `}
          </div>
        </div>

        <!-- 5. KHUNG MỞ RỘNG "XEM THÊM" (EXPANDABLE ADVANCED METADATA) -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px;">
          <div 
            onclick="App.toggleSubjectDetailAccordion()" 
            style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-primary); font-size: 14px;">
              ${Icons.get('info', 16)} <span>Xem thêm thông tin giáo trình, đề cương và thiết lập nâng cao</span>
            </div>
            <span style="font-size: 13px; color: var(--brand-primary); font-weight: 600;">
              ${this.isSubjectDetailExpanded ? 'Thu gọn ▲' : 'Mở rộng ▼'}
            </span>
          </div>

          ${this.isSubjectDetailExpanded ? `
            <div style="margin-top: 16px; pt: 14px; border-top: 1px solid var(--border); display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; font-size: 13px;">
              <div>
                <strong style="color: var(--text-primary); display: block; margin-bottom: 4px;">📅 Thời gian & Phiên bản:</strong>
                <div style="color: var(--text-secondary);">Thời điểm tạo: ${sub.createdAt || sub.submissionDate ? new Date(sub.createdAt || sub.submissionDate).toLocaleDateString('vi-VN') : 'Gốc hệ thống'}</div>
                <div style="color: var(--text-secondary);">Cập nhật gần nhất: ${sub.updatedAt ? new Date(sub.updatedAt).toLocaleDateString('vi-VN') : 'Đồng bộ Cloud'}</div>
              </div>

              <div>
                <strong style="color: var(--text-primary); display: block; margin-bottom: 4px;">⚙️ Cấu hình phòng thi chuẩn:</strong>
                <div style="color: var(--text-secondary);">Thời gian làm bài đề xuất: <strong>45 phút</strong></div>
                <div style="color: var(--text-secondary);">Số câu chuẩn kỳ thi kết thúc học phần: <strong>50 câu</strong></div>
              </div>

              <div>
                <strong style="color: var(--text-primary); display: block; margin-bottom: 4px;">📥 Sao lưu & Thao tác:</strong>
                <div style="display: flex; gap: 8px; margin-top: 4px;">
                  <button class="btn btn-sm" onclick="ImportExportService.exportSubject('${sub.id}')" style="display:inline-flex; align-items:center; gap:4px;">
                    ${Icons.get('download', 12)} <span>Tải file .JSON</span>
                  </button>
                  ${isDraft ? `
                    <button class="btn btn-sm btn-danger" onclick="App.rejectDraftConfirm('${sub.id}')" style="display:inline-flex; align-items:center; gap:4px;">
                      ${Icons.get('trash', 12)} <span>Từ Chối & Xóa</span>
                    </button>
                  ` : (isEditor ? `
                    <button class="btn btn-sm btn-danger" onclick="App.deleteSubjectConfirm('${sub.id}')" style="display:inline-flex; align-items:center; gap:4px;">
                      ${Icons.get('trash', 12)} <span>Xóa Môn</span>
                    </button>
                  ` : '')}
                </div>
              </div>
            </div>
          ` : ''}
        </div>

      </div>
    `;
  },

  toggleSubjectDetailAccordion() {
    this.isSubjectDetailExpanded = !this.isSubjectDetailExpanded;
    this.renderSubjectDetailView(document.getElementById("mainContent"), {
      subjectId: this.selectedSubjectDetailId,
      isDraft: this.activeSubjectIsDraft
    });
  },

  openEditDraftInfoModal(draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;

    const allSubjects = StorageService.getSubjects();
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('edit', 16)} <span>Chỉnh Sửa Thông Tin Bản Đề Chờ Duyệt</span></span>`;

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên môn học / Tiêu đề đề thi (*):</label>
        <input type="text" id="editDraftName" class="form-control" value="${draft.name.replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label class="form-label">Mã môn (*):</label>
        <input type="text" id="editDraftCode" class="form-control" value="${(draft.code || draft.id).replace(/"/g, '&quot;')}" style="text-transform: uppercase;">
      </div>
      <div class="form-group">
        <label class="form-label">Môn học đích gán vào khi duyệt:</label>
        <select id="editDraftTargetSelect" class="form-control">
          <option value="NEW" ${(!draft.targetSubjectId || draft.targetSubjectId === 'NEW') ? 'selected' : ''}>➕ Tạo thành môn học mới hoàn toàn</option>
          ${allSubjects.map(s => `
            <option value="${s.id}" ${(draft.targetSubjectId === s.id || draft.code === s.code) ? 'selected' : ''}>
              ${s.name} (${s.code || s.id})
            </option>
          `).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Khoa / Ngành:</label>
        <input type="text" id="editDraftDept" class="form-control" value="${(draft.department || 'Khoa Kỹ thuật - Công nghệ').replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label class="form-label">Người gửi đóng góp:</label>
        <input type="text" id="editDraftAuthor" class="form-control" value="${(draft.author || 'Sinh viên').replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả / Ghi chú đóng góp:</label>
        <textarea id="editDraftDesc" class="form-control" rows="3">${draft.description || ''}</textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedDraftInfo('${draft.id}')">Lưu Thay Đổi</button>
    `;

    modal.classList.add("active");
  },

  saveEditedDraftInfo(draftId) {
    const draft = StorageService.getDraftById(draftId);
    if (!draft) return;

    const name = document.getElementById("editDraftName")?.value.trim();
    const code = document.getElementById("editDraftCode")?.value.trim().toUpperCase();
    const targetSubId = document.getElementById("editDraftTargetSelect")?.value;
    const dept = document.getElementById("editDraftDept")?.value.trim();
    const author = document.getElementById("editDraftAuthor")?.value.trim();
    const desc = document.getElementById("editDraftDesc")?.value.trim();

    if (!name || !code) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ Tên và Mã môn!", "warning");
      return;
    }

    draft.name = name;
    draft.code = code;
    draft.targetSubjectId = targetSubId;
    draft.department = dept;
    draft.author = author;
    draft.description = desc;
    draft.updatedAt = new Date().toISOString();

    StorageService.saveDraftSubject(draft);
    this.closeModal();
    this.showToast("✅ Đã cập nhật thông tin bản đề chờ duyệt!", "success", 2500);
    this.renderSubjectDetailView(document.getElementById("mainContent"), { draftId: draft.id, isDraft: true });
  },

  openEditSubjectModal(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('edit', 16)} <span>Chỉnh Sửa Thông Tin Môn Học</span></span>`;

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên môn học (*):</label>
        <input type="text" id="editSubName" class="form-control" value="${sub.name.replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label class="form-label">Mã môn học (*):</label>
        <input type="text" id="editSubCode" class="form-control" value="${(sub.code || sub.id).replace(/"/g, '&quot;')}" style="text-transform: uppercase;">
      </div>
      <div class="form-group">
        <label class="form-label">Khoa / Ngành:</label>
        <input type="text" id="editSubDept" class="form-control" value="${(sub.department || 'Khoa Kỹ thuật - Công nghệ').replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label class="form-label">Người biên soạn:</label>
        <input type="text" id="editSubAuthor" class="form-control" value="${(sub.author || 'Shina Sanora').replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả chi tiết:</label>
        <textarea id="editSubDesc" class="form-control" rows="3">${sub.description || ''}</textarea>
      </div>
      <div class="form-group" style="margin-top: 10px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
          <input type="checkbox" id="editSubGuestAllowed" ${sub.isGuestAllowed !== false ? 'checked' : ''} style="width: 17px; height: 17px; cursor: pointer;">
          <span>Mở cho máy khách ôn tập (Guest Access Allowed)</span>
        </label>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedSubject('${sub.id}')">Lưu Thay Đổi</button>
    `;

    modal.classList.add("active");
  },

  saveEditedSubject(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const name = document.getElementById("editSubName")?.value.trim();
    const code = document.getElementById("editSubCode")?.value.trim().toUpperCase();
    const dept = document.getElementById("editSubDept")?.value.trim();
    const author = document.getElementById("editSubAuthor")?.value.trim();
    const desc = document.getElementById("editSubDesc")?.value.trim();
    const isGuestAllowed = document.getElementById("editSubGuestAllowed")?.checked;

    if (!name || !code) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ Tên và Mã môn học!", "warning");
      return;
    }

    sub.name = name;
    sub.code = code;
    sub.department = dept;
    sub.author = author;
    sub.description = desc;
    sub.isGuestAllowed = Boolean(isGuestAllowed);
    sub.updatedAt = new Date().toISOString();

    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã cập nhật thông tin môn học thành công!", "success", 2500);
    this.renderSubjectDetailView(document.getElementById("mainContent"), sub.id);
  }
});
