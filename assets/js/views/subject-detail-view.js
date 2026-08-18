/**
 * SUBJECT DETAIL VIEW MODULE
 * Chi tiết môn học: Ngân hàng câu hỏi, Quản lý chương, CRUD câu hỏi.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  renderSubjectDetailView(container, subjectId) {
    this.selectedSubjectDetailId = subjectId;
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) {
      this.navigateTo("manage");
      return;
    }

    const allQuestions = sub.questions || [];
    const qCount = allQuestions.length;
    const chapters = sub.chapters || [];
    const latestScore = StorageService.getLatestScoreForSubject(sub.id);
    const activeTab = this.subjectDetailTab || "questions";
    const activeFilter = this.selectedChapterFilter || "all";
    const searchKeyword = (this.subjectSearchKeyword || "").toLowerCase().trim();

    // 1. Lọc theo Chương
    let filtered = (activeFilter === "all")
      ? allQuestions
      : allQuestions.filter(q => q.chapterId === activeFilter);

    // 2. Lọc theo Từ khóa tìm kiếm
    if (searchKeyword) {
      filtered = filtered.filter(q => {
        const qText = (q.question || "").toLowerCase();
        const optText = (q.options || []).map(o => (o.text || "").toLowerCase()).join(" ");
        const noteText = (q.options || []).map(o => (o.note || "").toLowerCase()).join(" ");
        return qText.includes(searchKeyword) || optText.includes(searchKeyword) || noteText.includes(searchKeyword);
      });
    }

    // 3. Phân trang (100 câu hỏi / 1 trang)
    const PAGE_SIZE = 100;
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    const currentPage = Math.min(Math.max(this.subjectQuestionPage || 0, 0), totalPages - 1);
    const pageQuestions = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
    const startIndex = filtered.length > 0 ? (currentPage * PAGE_SIZE + 1) : 0;
    const endIndex = Math.min((currentPage + 1) * PAGE_SIZE, filtered.length);

    const isLogged = StorageService.isLoggedIn();
    const profile = StorageService.getUserProfile();
    const isEditor = isLogged && (profile.role === "admin" || profile.role === "editor" || (profile.permissions && profile.permissions.canEditSubjects));

    // Tên chương đang lọc để hiển thị trên nút phễu
    let activeFilterName = "Tất cả chương";
    if (activeFilter !== "all") {
      const cObj = chapters.find(c => c.id === activeFilter);
      activeFilterName = cObj ? cObj.name : "Chương đã chọn";
    }

    container.innerHTML = `
      <div class="view-subject-detail" style="padding: 20px; max-width: 1150px; margin: 0 auto; width: 100%;">
        
        <!-- Back Navigation & Top Actions Bar -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
          <button class="btn btn-sm" onclick="App.navigateTo('${isEditor ? 'manage' : 'home'}')">
            ${isEditor ? '← Quay lại danh sách môn' : '🏠 Về Trang Chủ'}
          </button>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="App.openQuizConfigModal('${sub.id}')">
              🚀 Vào Làm Bài Ngay
            </button>
            ${isEditor ? `
              <button class="btn btn-sm" onclick="App.navigateTo('parser', { subjectId: '${sub.id}' })">
                📝 Nhập câu (Parser)
              </button>
              <button class="btn btn-sm" onclick="App.shuffleSubjectQuestions('${sub.id}')">
                🔄 Xáo trộn đề
              </button>
            ` : ''}
            <button class="btn btn-sm" onclick="ImportExportService.exportSubject('${sub.id}')">
              📥 Xuất JSON
            </button>
          </div>
        </div>

        <!-- Header Info Card -->
        <div class="detail-header-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px 24px; margin-bottom: 20px;">
          <div class="detail-header-top" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="subject-code-badge" style="font-size: 13.5px; font-weight: 700; padding: 4px 12px;">${sub.code || sub.id}</span>
                <span class="badge badge-blue">${sub.department || 'Đại học Đồng Tháp'}</span>
              </div>
              <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                ${sub.name}
              </h2>
              <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5;">
                ${sub.description || 'Chưa có mô tả chi tiết cho môn học này.'}
              </p>
            </div>
            <button class="btn btn-sm" onclick="App.openEditSubjectModal('${sub.id}')">
              ✏️ Chỉnh sửa thông tin môn
            </button>
          </div>

          <!-- Stats Bar -->
          <div class="detail-stats-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border);">
            <div class="detail-stat-box">
              <div class="num" style="font-size: 22px; font-weight: 800; color: var(--brand-primary);">${qCount}</div>
              <div class="lbl" style="font-size: 12px; color: var(--text-tertiary);">Tổng số câu hỏi</div>
            </div>
            <div class="detail-stat-box">
              <div class="num" style="font-size: 22px; font-weight: 800; color: #8b5cf6;">${chapters.length}</div>
              <div class="lbl" style="font-size: 12px; color: var(--text-tertiary);">Số lượng chương</div>
            </div>
            <div class="detail-stat-box">
              <div class="num" style="font-size: 14.5px; font-weight: 700; padding-top: 4px; color: var(--text-primary);">${sub.author || 'Chưa cập nhật'}</div>
              <div class="lbl" style="font-size: 12px; color: var(--text-tertiary);">Người biên soạn</div>
            </div>
            <div class="detail-stat-box">
              <div class="num" style="font-size: 22px; font-weight: 800; color: var(--success);">${latestScore ? `${latestScore.score10}/10` : 'Chưa thi'}</div>
              <div class="lbl" style="font-size: 12px; color: var(--text-tertiary);">Điểm thi gần nhất</div>
            </div>
          </div>
        </div>

        <!-- 2 TAB NAVIGATION TOÀN MÀN HÌNH (FULL WIDTH) -->
        <div style="display: flex; gap: 8px; border-bottom: 2px solid var(--border); margin-bottom: 20px;">
          <button class="btn ${activeTab === 'questions' ? 'btn-primary' : ''}" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0; padding: 10px 20px; font-size: 14.5px; font-weight: 700; border-bottom: none;" onclick="App.switchSubjectDetailTab('questions')">
            📋 Ngân Hàng Câu Hỏi (${qCount})
          </button>
          <button class="btn ${activeTab === 'chapters' ? 'btn-primary' : ''}" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0; padding: 10px 20px; font-size: 14.5px; font-weight: 700; border-bottom: none;" onclick="App.switchSubjectDetailTab('chapters')">
            📂 Quản Lý Cấu Trúc Các Chương (${chapters.length})
          </button>
        </div>

        <!-- TAB CONTENT -->
        ${activeTab === 'questions' ? `
          <!-- TAB 1: NGÂN HÀNG CÂU HỎI (100% CHIỀU RỘNG) -->
          <div id="subjectQuestionsContainer" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px;">
            
            <!-- Thanh Tìm Kiếm + Icon Phễu Lọc + Các Nút Thao Tác -->
            <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 16px;">
              
              <!-- Khối Tìm Kiếm & Icon Phễu Lọc -->
              <div style="display: flex; gap: 8px; align-items: center; flex: 1; min-width: 260px; max-width: 600px;">
                <div style="position: relative; flex: 1;">
                  <input type="text" id="subjectQuestionSearchInput" class="form-control" placeholder="🔍 Tìm kiếm câu hỏi, nội dung đáp án..." value="${this.subjectSearchKeyword || ''}" oninput="App.onSubjectSearchInput(this.value)" style="padding-right: 32px; font-size: 13.5px;">
                  ${this.subjectSearchKeyword ? `
                    <button style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 14px; cursor: pointer; color: var(--text-tertiary);" onclick="App.clearSubjectSearch()">✕</button>
                  ` : ''}
                </div>

                <!-- Icon Cái Phễu Lọc Dropdown -->
                <div style="position: relative;">
                  <button class="btn ${activeFilter !== 'all' ? 'btn-primary' : ''}" style="padding: 8px 12px; display: flex; align-items: center; gap: 6px; font-size: 13.5px;" onclick="App.toggleChapterFilterMenu()" title="Lọc theo chương">
                    <span style="font-size: 15px;">🌪️</span>
                    <span style="font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px;">${activeFilterName}</span>
                    <span style="font-size: 9px; margin-left: 2px;">▼</span>
                  </button>

                  <!-- Popover Dropdown Danh Sách Chương -->
                  ${this.isChapterFilterMenuOpen ? `
                    <div style="position: absolute; top: calc(100% + 6px); left: 0; min-width: 260px; max-width: 320px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: 0 10px 25px rgba(0,0,0,0.18); z-index: 100; padding: 6px; display: flex; flex-direction: column; gap: 2px;">
                      <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); padding: 6px 10px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                        <span>Lọc theo chương</span>
                        <span style="cursor: pointer; font-size: 13px;" onclick="App.toggleChapterFilterMenu()">✕</span>
                      </div>
                      <button class="btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : ''}" style="width: 100%; text-align: left; justify-content: space-between; display: flex; align-items: center; border: none; margin-top: 4px; padding: 8px 10px; font-size: 13px;" onclick="App.selectChapterFilter('all')">
                        <span>📚 Tất cả chương</span>
                        <span class="badge ${activeFilter === 'all' ? 'badge-gray' : ''}">${allQuestions.length}</span>
                      </button>
                      ${chapters.map(c => {
                        const countInCh = allQuestions.filter(q => q.chapterId === c.id).length;
                        const isAct = (activeFilter === c.id);
                        return `
                          <button class="btn btn-sm ${isAct ? 'btn-primary' : ''}" style="width: 100%; text-align: left; justify-content: space-between; display: flex; align-items: center; border: none; padding: 8px 10px; font-size: 13px;" onclick="App.selectChapterFilter('${c.id}')">
                            <span style="max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.name}</span>
                            <span class="badge ${isAct ? 'badge-gray' : ''}">${countInCh}</span>
                          </button>
                        `;
                      }).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Nhóm Nút Thao Tác Câu Hỏi -->
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="App.openAddQuestionModal('${sub.id}', '${activeFilter}')">
                  ➕ Soạn câu hỏi mới
                </button>
                <button class="btn btn-sm" onclick="App.shuffleSubjectQuestions('${sub.id}')" title="Xáo trộn thứ tự các câu hỏi">
                  🔄 Xáo trộn
                </button>
                <button class="btn btn-sm btn-danger" onclick="App.clearAllQuestionsConfirm('${sub.id}')" title="Xóa toàn bộ câu hỏi của môn">
                  🗑️ Xóa tất cả
                </button>
              </div>
            </div>

            <!-- Thanh Trạng Thái & Phân Trang Trên -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; padding: 10px 14px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm);">
              <div style="font-size: 13px; color: var(--text-secondary);">
                Đang hiển thị <strong>${startIndex} - ${endIndex}</strong> trong tổng số <strong>${filtered.length}</strong> câu hỏi
                ${activeFilter !== 'all' ? `(đã lọc theo <em>${activeFilterName}</em>)` : ''}
                ${searchKeyword ? `(tìm kiếm: "<em>${this.subjectSearchKeyword}</em>")` : ''}
              </div>

              <!-- Điều Khiển Phân Trang -->
              ${totalPages > 1 ? `
                <div style="display: flex; gap: 4px; align-items: center;">
                  <button class="btn btn-sm" style="padding: 3px 10px; font-size: 12px;" ${currentPage === 0 ? 'disabled' : ''} onclick="App.changeSubjectQuestionPage(${currentPage - 1})">
                    ◀ Trước
                  </button>
                  <span style="font-size: 12.5px; font-weight: 700; padding: 0 6px;">
                    Trang ${currentPage + 1} / ${totalPages}
                  </span>
                  <button class="btn btn-sm" style="padding: 3px 10px; font-size: 12px;" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="App.changeSubjectQuestionPage(${currentPage + 1})">
                    Sau ▶
                  </button>
                </div>
              ` : ''}
            </div>

            <!-- Danh Sách Câu Hỏi (100 câu/trang) -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${filtered.length === 0 ? `
                <div style="text-align: center; padding: 50px 20px; color: var(--text-tertiary); font-size: 14px;">
                  <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                  Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.<br>
                  <div style="display: flex; gap: 8px; justify-content: center; margin-top: 14px;">
                    ${searchKeyword ? `<button class="btn btn-sm" onclick="App.clearSubjectSearch()">Xóa tìm kiếm</button>` : ''}
                    ${activeFilter !== 'all' ? `<button class="btn btn-sm" onclick="App.selectChapterFilter('all')">Xem tất cả chương</button>` : ''}
                    <button class="btn btn-sm btn-primary" onclick="App.openAddQuestionModal('${sub.id}', '${activeFilter}')">➕ Soạn câu hỏi mới</button>
                  </div>
                </div>
              ` : pageQuestions.map((q, qIdx) => {
                const globalIndex = currentPage * PAGE_SIZE + qIdx + 1;
                const chapObj = chapters.find(c => c.id === q.chapterId);
                const chapName = chapObj ? chapObj.name : (q.chapterId || 'Chương 1');
                return `
                  <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px 18px;">
                    
                    <!-- Header Câu Hỏi -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="badge badge-gray" style="font-weight: 800; font-size: 12.5px;">Câu ${globalIndex}</span>
                        <span class="badge badge-blue" style="font-size: 11.5px;">${chapName}</span>
                        <span class="badge" style="background:#16a34a; color:#ffffff; font-size: 11.5px; font-weight:700; padding: 3px 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(22,163,74,0.2);">
                          ✓ Đáp án đúng: ${App.letters[q.answerIndex] || 'A'}
                        </span>
                      </div>
                      <div style="display: flex; gap: 4px;">
                        <button class="btn btn-sm" style="padding: 3px 10px; font-size: 12px;" onclick="App.openEditQuestionModal('${sub.id}', '${q.id}')" title="Sửa nội dung câu hỏi">
                          ✏️ Sửa
                        </button>
                        <button class="btn btn-sm" style="padding: 3px 10px; font-size: 12px;" onclick="App.openMoveQuestionModal('${sub.id}', '${q.id}')" title="Đổi sang chương khác">
                          🔀 Đổi chương
                        </button>
                        <button class="btn btn-sm btn-danger" style="padding: 3px 8px; font-size: 12px;" onclick="App.deleteQuestionFromSubject('${sub.id}', '${q.id}')" title="Xóa câu này">
                          🗑️
                        </button>
                      </div>
                    </div>

                    <!-- Nội Dung Câu Hỏi -->
                    <div style="font-size: 14.5px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary); line-height: 1.5;">
                      ${SmartParserService.formatRichText(q.question)}
                    </div>

                    <!-- Các Phương Án Lựa Chọn (Mỗi Hàng 1 Lựa Chọn Dọc Xuống Dòng Rõ Ràng) -->
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

                    <!-- Giải Thích Đáp Án (Nếu Có) -->
                    ${(q.options && q.options[q.answerIndex] && q.options[q.answerIndex].note) ? `
                      <div style="font-size: 13px; color: #14532d; background: #f0fdf4; padding: 10px 14px; border-radius: 6px; border: 1.5px dashed #22c55e; margin-top: 8px;">
                        💡 <strong>Giải thích:</strong> ${SmartParserService.formatRichText(q.options[q.answerIndex].note)}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Điều Khiển Phân Trang Dưới Cùng -->
            ${totalPages > 1 ? `
              <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
                <button class="btn btn-sm" ${currentPage === 0 ? 'disabled' : ''} onclick="App.changeSubjectQuestionPage(${currentPage - 1})">
                  ◀ Trang trước
                </button>
                <div style="display: flex; gap: 4px;">
                  ${Array.from({ length: totalPages }, (_, i) => `
                    <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : ''}" style="min-width: 32px; padding: 4px 8px; font-size: 12px;" onclick="App.changeSubjectQuestionPage(${i})">
                      ${i + 1}
                    </button>
                  `).join('')}
                </div>
                <button class="btn btn-sm" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="App.changeSubjectQuestionPage(${currentPage + 1})">
                  Trang sau ▶
                </button>
              </div>
            ` : ''}

          </div>
        ` : `
          <!-- TAB 2: QUẢN LÝ CẤU TRÚC CÁC CHƯƠNG (100% CHIỀU RỘNG) -->
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">
                  📂 Danh Sách Các Chương (${chapters.length})
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary);">
                  Phân loại câu hỏi theo từng chương giúp sinh viên ôn tập theo chuyên đề hiệu quả.
                </p>
              </div>
              <button class="btn btn-primary" onclick="App.openAddChapterModal('${sub.id}')">
                ➕ Thêm chương mới
              </button>
            </div>

            <!-- Danh Sách Các Chương Dạng Thẻ Rộng Rãi -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${chapters.length === 0 ? `
                <div style="text-align: center; padding: 40px 16px; color: var(--text-tertiary); font-size: 14px;">
                  <div style="font-size: 40px; margin-bottom: 10px;">📂</div>
                  Môn học này chưa có chương nào.<br>
                  Bấm <strong>"➕ Thêm chương mới"</strong> để bắt đầu chia nhóm câu hỏi.
                </div>
              ` : chapters.map(c => {
                const countInCh = allQuestions.filter(q => q.chapterId === c.id).length;
                return `
                  <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                    <div style="flex: 1; min-width: 250px;">
                      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                        <h4 style="font-size: 15.5px; font-weight: 800; color: var(--text-primary); margin: 0;">
                          ${c.name}
                        </h4>
                        <span class="badge badge-blue" style="font-size: 12px;">
                          ${countInCh} câu hỏi
                        </span>
                        <span class="badge badge-gray" style="font-size: 11px;">
                          Mã: ${c.id}
                        </span>
                      </div>
                      ${c.description ? `
                        <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 0 0; line-height: 1.4;">
                          ${c.description}
                        </p>
                      ` : `
                        <p style="font-size: 12.5px; color: var(--text-tertiary); margin: 4px 0 0 0; font-style: italic;">
                          Chưa có mô tả nội dung cho chương này.
                        </p>
                      `}
                    </div>

                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      <button class="btn btn-sm btn-primary" onclick="App.viewChapterQuestions('${sub.id}', '${c.id}')" title="Xem các câu hỏi thuộc chương này">
                        👁️ Xem câu hỏi (${countInCh})
                      </button>
                      <button class="btn btn-sm" onclick="App.openEditChapterModal('${sub.id}', '${c.id}')" title="Sửa tên và mô tả chương">
                        ✏️ Sửa
                      </button>
                      <button class="btn btn-sm btn-danger" onclick="App.deleteChapter('${sub.id}', '${c.id}')" title="Xóa chương này">
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `}

      </div>
    `;
  },

  switchSubjectDetailTab(tab) {
    this.subjectDetailTab = tab;
    this.isChapterFilterMenuOpen = false;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
    }
  },

  toggleChapterFilterMenu() {
    this.isChapterFilterMenuOpen = !this.isChapterFilterMenuOpen;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
    }
  },

  selectChapterFilter(chapId) {
    this.selectedChapterFilter = chapId;
    this.subjectQuestionPage = 0;
    this.isChapterFilterMenuOpen = false;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
    }
  },

  onSubjectSearchInput(value) {
    this.subjectSearchKeyword = (value || "").trim();
    this.subjectQuestionPage = 0;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
      const input = document.getElementById("subjectQuestionSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  },

  clearSubjectSearch() {
    this.subjectSearchKeyword = "";
    this.subjectQuestionPage = 0;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
    }
  },

  changeSubjectQuestionPage(pageIndex) {
    this.subjectQuestionPage = pageIndex;
    const main = document.getElementById("mainContent");
    if (main && this.selectedSubjectDetailId) {
      this.renderSubjectDetailView(main, this.selectedSubjectDetailId);
      const listEl = document.getElementById("subjectQuestionsContainer");
      if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  viewChapterQuestions(subjectId, chapterId) {
    this.subjectDetailTab = "questions";
    this.selectedChapterFilter = chapterId;
    this.subjectQuestionPage = 0;
    this.isChapterFilterMenuOpen = false;
    this.navigateTo("subject-detail", { subjectId: subjectId });
  },

  openEditSubjectModal(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `Chỉnh sửa môn: ${sub.name}`;

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên môn học (*):</label>
        <input type="text" id="editSubName" class="form-control" value="${sub.name}">
      </div>
      <div class="form-group">
        <label class="form-label">Mã môn học (*):</label>
        <input type="text" id="editSubCode" class="form-control" value="${sub.code || sub.id}">
      </div>
      <div class="form-group">
        <label class="form-label">Khoa / Ngành:</label>
        <input type="text" id="editSubDept" class="form-control" value="${sub.department || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Người biên soạn / Sinh viên đóng góp:</label>
        <input type="text" id="editSubAuthor" class="form-control" value="${sub.author || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả môn học:</label>
        <textarea id="editSubDesc" class="form-control" rows="3">${sub.description || ''}</textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedSubject('${sub.id}')">Lưu thay đổi</button>
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

    if (!name || !code) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ Tên môn học và Mã môn học!", "warning");
      return;
    }

    sub.name = name;
    sub.code = code;
    sub.department = dept;
    sub.author = author;
    sub.description = desc;

    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã cập nhật thông tin môn học!", "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  openAddChapterModal(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const nextIndex = (sub.chapters || []).length + 1;
    title.textContent = "➕ Thêm Chương Mới";

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên chương (*):</label>
        <input type="text" id="newChapterName" class="form-control" value="Chương ${nextIndex}: " placeholder="Ví dụ: Chương 1: Giới thiệu chung...">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả chương (Tùy chọn):</label>
        <textarea id="newChapterDesc" class="form-control" rows="2" placeholder="Ghi chú thêm về nội dung chương này..."></textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveNewChapter('${sub.id}')">Thêm chương</button>
    `;

    modal.classList.add("active");
  },

  saveNewChapter(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const name = document.getElementById("newChapterName")?.value.trim();
    const desc = document.getElementById("newChapterDesc")?.value.trim() || "";

    if (!name) {
      this.showToast("⚠️ Vui lòng nhập tên chương!", "warning");
      return;
    }

    if (!sub.chapters) sub.chapters = [];
    const nextIndex = sub.chapters.length + 1;
    const newChap = {
      id: `c${nextIndex}`,
      name: name,
      description: desc
    };

    sub.chapters.push(newChap);
    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast(`🎉 Đã thêm "${name}" thành công!`, "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  openEditChapterModal(subjectId, chapterId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.chapters) return;

    const chap = sub.chapters.find(c => c.id === chapterId);
    if (!chap) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = `✏️ Chỉnh Sửa Chương: ${chap.name}`;

    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tên chương (*):</label>
        <input type="text" id="editChapterName" class="form-control" value="${(chap.name || '').replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả chương:</label>
        <textarea id="editChapterDesc" class="form-control" rows="2">${chap.description || ''}</textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedChapter('${sub.id}', '${chap.id}')">Lưu thay đổi</button>
    `;

    modal.classList.add("active");
  },

  saveEditedChapter(subjectId, chapterId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.chapters) return;

    const chap = sub.chapters.find(c => c.id === chapterId);
    if (!chap) return;

    const name = document.getElementById("editChapterName")?.value.trim();
    const desc = document.getElementById("editChapterDesc")?.value.trim() || "";

    if (!name) {
      this.showToast("⚠️ Vui lòng nhập tên chương!", "warning");
      return;
    }

    chap.name = name;
    chap.description = desc;

    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã cập nhật chương thành công!", "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  deleteChapter(subjectId, chapterId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa chương",
      message: "Bạn có chắc chắn muốn xóa chương này không? Các câu hỏi thuộc chương này vẫn sẽ được giữ lại an toàn trong môn học.",
      icon: "🗑️",
      confirmText: "Xóa chương",
      isDanger: true,
      warningKey: "delete_chapter",
      onConfirm: () => {
        const sub = StorageService.getSubjectById(subjectId);
        if (sub) {
          sub.chapters = (sub.chapters || []).filter(c => c.id !== chapterId);
          if (this.selectedChapterFilter === chapterId) this.selectedChapterFilter = "all";
          StorageService.saveSubject(sub);
          this.navigateTo("subject-detail", { subjectId: sub.id });
        }
      }
    });
  },

  openAddQuestionModal(subjectId, preselectedChapterId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "➕ Soạn Câu Hỏi Mới";

    const chapters = sub.chapters || [{ id: "c1", name: "Chương 1: Mở đầu" }];
    const defaultChap = (preselectedChapterId && preselectedChapterId !== "all") ? preselectedChapterId : (chapters[0]?.id || "c1");

    body.innerHTML = `
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label" style="font-size: 13px;">Gán vào chương (*):</label>
        <select id="newQChapter" class="form-control">
          ${chapters.map(c => `<option value="${c.id}" ${c.id === defaultChap ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 14px;">
        <label class="form-label" style="font-size: 13px; font-weight: 700;">Nội dung câu hỏi (*):</label>
        <textarea id="newQText" class="form-control" rows="3" placeholder="Nhập câu hỏi..."></textarea>
      </div>

      <div style="margin-bottom: 14px;">
        <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
          Các phương án lựa chọn (Tích chọn nút tròn để chọn đáp án đúng):
        </label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${[0, 1, 2, 3].map(oi => `
            <div style="display: flex; gap: 8px; align-items: center; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 10px;">
              <input type="radio" name="newQAnswer" id="newQAns_${oi}" value="${oi}" ${oi === 0 ? 'checked' : ''} style="transform: scale(1.1); cursor: pointer;">
              <label for="newQAns_${oi}" style="font-weight: 800; cursor: pointer; min-width: 20px;">${App.letters[oi]}.</label>
              <input type="text" id="newQOpt_${oi}" class="form-control" placeholder="Phương án ${App.letters[oi]}..." style="font-size: 13px;">
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-group" style="margin: 0;">
        <label class="form-label" style="font-size: 13px;">Giải thích đáp án (Tùy chọn):</label>
        <input type="text" id="newQNote" class="form-control" placeholder="Ghi chú / Giải thích tại sao đáp án này đúng...">
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveNewQuestionToSubject('${sub.id}')">Lưu câu hỏi</button>
    `;

    modal.classList.add("active");
  },

  saveNewQuestionToSubject(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub) return;

    const qText = document.getElementById("newQText")?.value.trim();
    const chapterId = document.getElementById("newQChapter")?.value || "c1";
    const note = document.getElementById("newQNote")?.value.trim() || "";

    if (!qText) {
      this.showToast("⚠️ Vui lòng nhập nội dung câu hỏi!", "warning");
      return;
    }

    const radios = document.querySelectorAll('input[name="newQAnswer"]');
    let selectedAns = 0;
    radios.forEach(r => {
      if (r.checked) selectedAns = parseInt(r.value, 10);
    });

    const options = [0, 1, 2, 3].map(oi => {
      const optText = document.getElementById(`newQOpt_${oi}`)?.value.trim() || `Phương án ${this.letters[oi]}`;
      return {
        text: optText,
        isCorrect: (oi === selectedAns),
        note: (oi === selectedAns ? note : "")
      };
    });

    if (!sub.questions) sub.questions = [];
    const newQuestion = {
      id: `q-${Date.now()}-${sub.questions.length + 1}`,
      chapterId: chapterId,
      question: qText,
      options: options,
      answerIndex: selectedAns
    };

    sub.questions.push(newQuestion);
    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("🎉 Đã thêm câu hỏi mới thành công!", "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  openEditQuestionModal(subjectId, questionId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions) return;

    const q = sub.questions.find(item => item.id === questionId);
    if (!q) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "✏️ Chỉnh Sửa Câu Hỏi";
    const chapters = sub.chapters || [{ id: "c1", name: "Chương 1: Mở đầu" }];

    body.innerHTML = `
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label" style="font-size: 13px;">Chương (*):</label>
        <select id="editQChapter" class="form-control">
          ${chapters.map(c => `<option value="${c.id}" ${c.id === q.chapterId ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 14px;">
        <label class="form-label" style="font-size: 13px; font-weight: 700;">Nội dung câu hỏi (*):</label>
        <textarea id="editQText" class="form-control" rows="3">${q.question || ''}</textarea>
      </div>

      <div style="margin-bottom: 14px;">
        <label class="form-label" style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: block;">
          Các phương án lựa chọn (Tích chọn nút tròn để chọn đáp án đúng):
        </label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${[0, 1, 2, 3].map(oi => {
            const opt = (q.options && q.options[oi]) ? q.options[oi] : { text: '', note: '' };
            const isCorrect = (q.answerIndex === oi);
            return `
              <div style="display: flex; gap: 8px; align-items: center; background: ${isCorrect ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isCorrect ? '#86efac' : 'var(--border)'}; border-radius: var(--radius-sm); padding: 8px 10px;">
                <input type="radio" name="editQAnswer" id="editQAns_${oi}" value="${oi}" ${isCorrect ? 'checked' : ''} style="transform: scale(1.1); cursor: pointer;">
                <label for="editQAns_${oi}" style="font-weight: 800; cursor: pointer; min-width: 20px;">${App.letters[oi]}.</label>
                <input type="text" id="editQOpt_${oi}" class="form-control" value="${(opt.text || '').replace(/"/g, '&quot;')}" style="font-size: 13px;">
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="form-group" style="margin: 0;">
        <label class="form-label" style="font-size: 13px;">Giải thích đáp án:</label>
        <input type="text" id="editQNote" class="form-control" value="${(q.options && q.options[q.answerIndex] && q.options[q.answerIndex].note ? q.options[q.answerIndex].note : '').replace(/"/g, '&quot;')}" placeholder="Ghi chú / Giải thích...">
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveEditedQuestionToSubject('${sub.id}', '${q.id}')">Lưu thay đổi</button>
    `;

    modal.classList.add("active");
  },

  saveEditedQuestionToSubject(subjectId, questionId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions) return;

    const q = sub.questions.find(item => item.id === questionId);
    if (!q) return;

    const qText = document.getElementById("editQText")?.value.trim();
    const chapterId = document.getElementById("editQChapter")?.value || "c1";
    const note = document.getElementById("editQNote")?.value.trim() || "";

    if (!qText) {
      this.showToast("⚠️ Vui lòng nhập nội dung câu hỏi!", "warning");
      return;
    }

    const radios = document.querySelectorAll('input[name="editQAnswer"]');
    let selectedAns = 0;
    radios.forEach(r => {
      if (r.checked) selectedAns = parseInt(r.value, 10);
    });

    const options = [0, 1, 2, 3].map(oi => {
      const optText = document.getElementById(`editQOpt_${oi}`)?.value.trim() || `Phương án ${this.letters[oi]}`;
      return {
        text: optText,
        isCorrect: (oi === selectedAns),
        note: (oi === selectedAns ? note : "")
      };
    });

    q.question = qText;
    q.chapterId = chapterId;
    q.options = options;
    q.answerIndex = selectedAns;

    StorageService.saveSubject(sub);
    this.closeModal();
    this.showToast("✅ Đã cập nhật câu hỏi thành công!", "success", 2500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  openMoveQuestionModal(subjectId, questionId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions) return;

    const q = sub.questions.find(item => item.id === questionId);
    if (!q) return;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    title.textContent = "🔀 Chuyển Câu Hỏi Sang Chương Khác";
    const chapters = sub.chapters || [{ id: "c1", name: "Chương 1: Mở đầu" }];

    body.innerHTML = `
      <div style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 12px;">
        Đang chuyển: <strong>${SmartParserService.formatRichText(q.question).slice(0, 80)}...</strong>
      </div>
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Chọn chương đích:</label>
        <select id="moveTargetChapter" class="form-control">
          ${chapters.map(c => `<option value="${c.id}" ${c.id === q.chapterId ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveMoveQuestion('${sub.id}', '${q.id}')">Xác nhận chuyển</button>
    `;

    modal.classList.add("active");
  },

  saveMoveQuestion(subjectId, questionId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions) return;

    const q = sub.questions.find(item => item.id === questionId);
    if (!q) return;

    const targetChap = document.getElementById("moveTargetChapter")?.value;
    if (targetChap) {
      q.chapterId = targetChap;
      StorageService.saveSubject(sub);
      this.closeModal();
      this.showToast("✅ Đã chuyển câu hỏi sang chương mới!", "success", 2500);
      this.navigateTo("subject-detail", { subjectId: sub.id });
    }
  },

  shuffleSubjectQuestions(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions || sub.questions.length < 2) {
      this.showToast("⚠️ Cần ít nhất 2 câu hỏi để xáo trộn!", "warning");
      return;
    }

    // Fisher-Yates shuffle
    const arr = sub.questions;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    StorageService.saveSubject(sub);
    this.showToast("🎉 Đã xáo trộn ngẫu nhiên thứ tự toàn bộ câu hỏi!", "success", 3000);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  clearAllQuestionsConfirm(subjectId) {
    const sub = StorageService.getSubjectById(subjectId);
    if (!sub || !sub.questions || sub.questions.length === 0) {
      this.showToast("⚠️ Môn học này hiện không có câu hỏi nào để xóa!", "info");
      return;
    }

    this.showConfirmDialog({
      title: "Xác nhận xóa toàn bộ câu hỏi",
      message: `Bạn có chắc chắn muốn xóa TOÀN BỘ ${sub.questions.length} câu hỏi của môn "${sub.name}" không? Hành động này sẽ xóa cả trên máy và Cloud.`,
      icon: "⚠️",
      confirmText: "Xóa toàn bộ câu hỏi",
      isDanger: true,
      warningKey: "clear_all_questions",
      onConfirm: () => {
        sub.questions = [];
        StorageService.saveSubject(sub);
        this.showToast("🗑️ Đã xóa toàn bộ câu hỏi của môn học!", "info", 3000);
        this.navigateTo("subject-detail", { subjectId: sub.id });
      }
    });
  },

  deleteQuestionFromSubject(subjectId, questionId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa câu hỏi",
      message: "Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng đề không?",
      icon: "🗑️",
      confirmText: "Xóa câu hỏi",
      isDanger: true,
      warningKey: "delete_question",
      onConfirm: () => {
        const sub = StorageService.getSubjectById(subjectId);
        if (sub) {
          sub.questions = (sub.questions || []).filter(q => q.id !== questionId);
          StorageService.saveSubject(sub);
          this.navigateTo("subject-detail", { subjectId: sub.id });
        }
      }
    });
  }
});
