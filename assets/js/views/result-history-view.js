/**
 * RESULT & HISTORY VIEW MODULE
 * Kết quả bài thi, Xem lại đáp án, Lịch sử thi thử.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  renderResultView(container) {
    if (!this.latestResultDetails) {
      this.navigateTo("home");
      return;
    }

    const { result, details } = this.latestResultDetails;
    const wrongDetails = details.filter(d => !d.isCorrect && d.userAnswer !== undefined);

    container.innerHTML = `
      <div class="view-result">
        <div class="result-card-banner">
          <span class="badge badge-blue">${result.subjectName} · Chế độ: ${result.mode === 'exam' ? 'Thi thử' : 'Ôn tập'}</span>
          <div class="result-score-large">${result.score10} <span style="font-size: 20px; font-weight: 600; color: var(--text-tertiary);">/ 10</span></div>
          <h3 style="font-size: 18px; margin-bottom: 4px;">${result.gradeTitle}</h3>
          <p>Tỷ lệ trả lời chính xác: <strong>${result.percentage}%</strong></p>

          <div class="result-grid-stats">
            <div class="result-stat-item">
              <div class="val" style="color: var(--success);">${result.correctCount}</div>
              <div class="lbl">Số câu đúng</div>
            </div>
            <div class="result-stat-item">
              <div class="val" style="color: var(--danger);">${result.wrongCount}</div>
              <div class="lbl">Số câu sai</div>
            </div>
            <div class="result-stat-item">
              <div class="val" style="color: var(--text-tertiary);">${result.unattemptedCount}</div>
              <div class="lbl">Chưa làm</div>
            </div>
            <div class="result-stat-item">
              <div class="val">${result.totalQuestions}</div>
              <div class="lbl">Tổng số câu</div>
            </div>
          </div>

          ${result.mode === 'exam' ? `
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 14px 18px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <div style="text-align: left;">
                <strong style="color: #1e40af; font-size: 14px; display:inline-flex; align-items:center; gap:5px;">${Icons.get('history', 15)} <span>Bài thi thử đã được lưu vào Lịch Sử Thi (10 lần gần nhất / lưu 30 ngày):</span></strong>
                <div style="font-size: 12.5px; color: #3b82f6; margin-top: 2px;">Bạn có thể xem lại chi tiết bài làm hoặc so sánh kết quả bất cứ lúc nào.</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.navigateTo('history')" style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('history', 14)} <span>Xem Lịch Sử Thi</span> ${Icons.get('arrowRight', 12)}
              </button>
            </div>
          ` : ''}

          <div style="margin-top: 24px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="App.openQuizConfigModal('${result.subjectId}')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('refresh', 14)} <span>Thi lại môn này</span></button>
            ${result.mode === 'exam' ? `<button class="btn" onclick="App.navigateTo('history')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('history', 14)} <span>Lịch Sử Thi (${StorageService.getUserExamHistory().length}/10)</span></button>` : ''}
            <button class="btn" onclick="App.openUserDrawer()" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('user', 14)} <span>Menu Cá nhân & BXH</span></button>
            <button class="btn" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('home', 14)} <span>Về trang chủ</span></button>
          </div>
        </div>

        <h3 style="margin-bottom: 16px; font-size: 17px; font-weight: 800;">Xem lại chi tiết bài làm vừa thi:</h3>
        <div id="reviewDetailsList" style="display: flex; flex-direction: column; gap: 14px;">
          ${details.map(d => this.renderReviewItem(d)).join('')}
        </div>
      </div>
    `;
  },

  renderReviewItem(d) {
    const q = d.question;
    const isCorrect = d.isCorrect;
    const hasAnswer = (d.userAnswer !== undefined && d.userAnswer !== null);

    return `
      <div class="question-card" style="border-left: 4px solid ${isCorrect ? '#16a34a' : '#ef4444'}; background: #ffffff; border-radius: var(--radius-sm); border: 1px solid var(--border); border-left-width: 5px; padding: 18px 20px;">
        <div class="question-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="badge" style="background: ${isCorrect ? '#dcfce7' : '#fee2e2'}; color: ${isCorrect ? '#15803d' : '#b91c1c'}; font-weight: 800; display:inline-flex; align-items:center; gap:4px;">
              ${isCorrect ? `${Icons.get('check', 12)} <span>Trả lời Đúng</span>` : (hasAnswer ? `${Icons.get('close', 12)} <span>Trả lời Sai</span>` : '<span>⚪ Chưa trả lời</span>')}
            </span>
            <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 700;">Câu ${d.index + 1}</span>
          </div>
          <span class="badge badge-gray" style="font-size: 11.5px;">Đáp án đúng: ${this.letters[q.answerIndex]}</span>
        </div>
        <div class="question-card-title" style="font-size: 14.5px; font-weight: 600; line-height: 1.5; margin-bottom: 12px; color: var(--text-primary);">
          ${SmartParserService.formatRichText(q.question)}
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          ${q.options.map((opt, oi) => {
            const isRightOption = (oi === q.answerIndex);
            const isUserPick = (oi === d.userAnswer);

            let bg = "#ffffff";
            let border = "1px solid #cbd5e1";
            let textCol = "#334155";
            let badgeBg = "#f1f5f9";
            let badgeText = "#475569";
            let tagHtml = "";

            if (isRightOption) {
              bg = "#dcfce7";
              border = "1.5px solid #16a34a";
              textCol = "#14532d";
              badgeBg = "#16a34a";
              badgeText = "#ffffff";
              tagHtml = `<span style="margin-left: 8px; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;">${Icons.get('check', 11)} Đáp án đúng</span>`;
            } else if (isUserPick && !isCorrect) {
              bg = "#fee2e2";
              border = "1.5px solid #ef4444";
              textCol = "#991b1b";
              badgeBg = "#ef4444";
              badgeText = "#ffffff";
              tagHtml = `<span style="margin-left: 8px; background: #ef4444; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;">${Icons.get('close', 11)} Bạn đã chọn</span>`;
            }

            return `
              <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; padding: 10px 14px; border-radius: 6px; border: ${border}; background: ${bg}; width: 100%; box-sizing: border-box;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; min-width: 24px; background: ${badgeBg}; color: ${badgeText}; border-radius: 4px; font-weight: 800; font-size: 12.5px; flex-shrink: 0; margin-top: 1px;">
                  ${this.letters[oi]}
                </span>
                <div style="font-weight: ${(isRightOption || isUserPick) ? '700' : '400'}; color: ${textCol}; flex: 1; min-width: 0; word-break: break-word; overflow-wrap: break-word; line-height: 1.5;">
                  ${SmartParserService.formatRichText(opt.text)}
                </div>
                ${tagHtml}
              </div>
            `;
          }).join('')}
        </div>
        ${(q.options[q.answerIndex] && q.options[q.answerIndex].note) ? `
          <div style="font-size: 13px; color: #14532d; background: #f0fdf4; padding: 10px 14px; border-radius: 6px; border: 1.5px dashed #22c55e; margin-top: 10px; display: flex; align-items: flex-start; gap: 6px;">
            <span style="color:#16a34a; margin-top:2px;">${Icons.get('sparkles', 14)}</span>
            <div><strong>Giải thích:</strong> ${SmartParserService.formatRichText(q.options[q.answerIndex].note)}</div>
          </div>
        ` : ''}
      </div>
    `;
  },

  async renderExamHistoryView(container) {
    const isLogged = StorageService.isLoggedIn();
    if (!isLogged) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 600px; margin: 0 auto;">
          <div style="color: var(--text-tertiary); margin-bottom: 12px; display:flex; justify-content:center;">${Icons.get('history', 52)}</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Lịch Sử Thi Dành Riêng Cho Thành Viên</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Bạn hiện đang ở chế độ <strong>Khách (Guest)</strong>. Vui lòng đăng nhập bằng Mã số sinh viên (MSSV) để xem và lưu trữ lịch sử các lần thi thử, tự động tính điểm trung bình và biểu đồ tiến bộ học tập.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 22px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('key', 14)} <span>Đăng Nhập Ngay</span> ${Icons.get('arrowRight', 12)}</button>
            <button class="btn" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('home', 14)} <span>Về Trang Chủ</span></button>
          </div>
        </div>
      `;
      return;
    }

    let examHistory = StorageService.getUserExamHistory();
    // Tự động khôi phục lịch sử thi từ Cloudflare D1 nếu LocalStorage đang trống (khi đổi máy / xóa cache)
    if (examHistory.length === 0 && typeof CloudflareClient !== "undefined") {
      try {
        const cloudHistory = await CloudflareClient.getMyQuizHistory();
        if (Array.isArray(cloudHistory) && cloudHistory.length > 0) {
          const profile = StorageService.getUserProfile();
          const currentUserId = profile ? profile.id : "guest";
          const all = StorageService.getHistory();
          const other = all.filter(h => h.userId && h.userId !== currentUserId);
          const merged = [...cloudHistory, ...other];
          StorageService.safeSetHistory(merged);
          examHistory = StorageService.getUserExamHistory();
        }
      } catch (e) {}
    }

    const count = examHistory.length;
    const avgScore = count > 0 ? (examHistory.reduce((s, a) => s + (a.score10 || 0), 0) / count).toFixed(1) : "0.0";
    const passCount = examHistory.filter(a => a.isPassed).length;
    const passRate = count > 0 ? Math.round((passCount / count) * 100) : 0;
    const maxScore = count > 0 ? Math.max(...examHistory.map(a => a.score10 || 0)).toFixed(1) : "0.0";

    container.innerHTML = `
      <div class="view-exam-history" style="padding: 24px 20px; max-width: 1050px; margin: 0 auto; width: 100%;">
        
        <!-- Header & Navigation -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge badge-blue" style="font-weight: 700; display:inline-flex; align-items:center; gap:4px;">${Icons.get('history', 13)} <span>Nhật Ký Thi Thử</span></span>
              <span class="badge badge-gray">${count}/10 bài thi gần nhất</span>
            </div>
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0;">
              Lịch Sử Thi & Bảng Điểm Gần Đây
            </h2>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">
              Hệ thống tự động lưu <strong>10 lần thi thử gần nhất</strong> (tự động xóa sau 30 ngày) của bạn để bạn theo dõi tiến bộ và ôn lại bài làm bất kỳ lúc nào.
            </p>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:6px;">
              ${Icons.get('zap', 14)} <span>Vào Thi Thử Mới</span>
            </button>
            ${count > 0 ? `
              <button class="btn btn-danger btn-sm" onclick="App.clearExamHistoryConfirm()" style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('trash', 14)} <span>Xóa Lịch Sử</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Thẻ Thống Kê Tổng Quan (Analytics Summary) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px;">
          
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">
              Lượt thi đã lưu
            </div>
            <div style="font-size: 26px; font-weight: 800; color: var(--brand-primary); margin-top: 4px;">
              ${count} <span style="font-size: 14px; font-weight: 600; color: var(--text-tertiary);">/ 10 lần</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
              Tự động luân chuyển bài mới
            </div>
          </div>

          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">
              Điểm trung bình (GPA)
            </div>
            <div style="font-size: 26px; font-weight: 800; color: #8b5cf6; margin-top: 4px;">
              ${avgScore} <span style="font-size: 14px; font-weight: 600; color: var(--text-tertiary);">/ 10</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
              Dựa trên ${count} lần thi gần nhất
            </div>
          </div>

          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">
              Tỷ lệ đạt yêu cầu
            </div>
            <div style="font-size: 26px; font-weight: 800; color: var(--success); margin-top: 4px;">
              ${passRate}%
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
              ${passCount}/${count} lần đạt điểm $\ge$ 5.0
            </div>
          </div>

          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">
              Điểm số cao nhất
            </div>
            <div style="font-size: 26px; font-weight: 800; color: #b45309; margin-top: 4px; display:flex; align-items:center; gap:6px;">
              ${maxScore} <span style="color:#d97706; display:flex; align-items:center;">${Icons.get('trophy', 20)}</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
              Thành tích tốt nhất
            </div>
          </div>

        </div>

        <!-- Danh Sách 10 Lần Thi Thử Gần Nhất -->
        <div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 14px; display:flex; align-items:center; gap:6px;">
            ${Icons.get('fileText', 16)} <span>Danh Sách Bài Thi Gần Nhất</span>
          </h3>

          ${count === 0 ? `
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 56px 20px; text-align: center;">
              <div style="color: var(--text-tertiary); margin-bottom: 12px; display:flex; justify-content:center;">${Icons.get('fileText', 48)}</div>
              <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0;">
                Bạn chưa có lịch sử thi thử nào!
              </h3>
              <p style="font-size: 13.5px; color: var(--text-secondary); margin: 0 0 20px 0; max-width: 450px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                Khi bạn làm bài ở chế độ <strong>"Thi Thử (Exam Mode)"</strong>, hệ thống sẽ tự động ghi nhận kết quả và lưu lại chi tiết từng câu làm tại đây (tối đa 10 lần gần nhất trong vòng 30 ngày).
              </p>
              <button class="btn btn-primary" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('zap', 14)} <span>Vào Danh Sách Môn Thi Ngay</span> ${Icons.get('arrowRight', 12)}
              </button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${examHistory.map((h, idx) => {
                const dateStr = h.completedAt ? new Date(h.completedAt).toLocaleString('vi-VN') : 'Vừa xong';
                const mins = Math.floor((h.timeTakenSeconds || 0) / 60);
                const secs = (h.timeTakenSeconds || 0) % 60;
                const isLatest = (idx === 0);

                return `
                  <div style="background: var(--surface); border: 1.5px solid ${isLatest ? 'var(--brand-primary)' : 'var(--border)'}; border-radius: var(--radius-md); padding: 20px 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); position: relative;">
                    
                    <!-- Header Thẻ Bài Thi -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                          <span class="badge ${isLatest ? 'badge-blue' : 'badge-gray'}" style="font-weight: 800; display:inline-flex; align-items:center; gap:3px;">
                            ${isLatest ? `<span style="color:#f97316;">${Icons.get('flame', 12)}</span> Lần thi 1 (Mới nhất)` : `Lần thi ${idx + 1}`}
                          </span>
                          <span class="badge badge-gray" style="display:inline-flex; align-items:center; gap:3px;">${Icons.get('clock', 11)} ${dateStr}</span>
                        </div>
                        <h4 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">
                          ${h.subjectName}
                        </h4>
                      </div>

                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="badge" style="background: ${h.isPassed ? '#dcfce7' : '#fee2e2'}; color: ${h.isPassed ? '#15803d' : '#b91c1c'}; font-size: 13px; font-weight: 800; padding: 6px 14px; border-radius: 20px; display:inline-flex; align-items:center; gap:4px;">
                          ${h.isPassed ? `${Icons.get('checkCircle', 13)} ĐẠT YÊU CẦU` : `${Icons.get('alertTriangle', 13)} CHƯA ĐẠT`}
                        </span>
                      </div>
                    </div>

                    <!-- Metrics Grid 4 Cột -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 16px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px;">
                      <div>
                        <div style="font-size: 11.5px; color: var(--text-tertiary); font-weight: 600;">Điểm số</div>
                        <div style="font-size: 20px; font-weight: 800; color: ${h.isPassed ? 'var(--success)' : 'var(--danger)'};">
                          ${h.score10} <span style="font-size: 12px; color: var(--text-tertiary);">/ 10</span>
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 11.5px; color: var(--text-tertiary); font-weight: 600;">Số câu đúng</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--success);">
                          ${h.correctCount} / ${h.totalQuestions} câu (${h.percentage}%)
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 11.5px; color: var(--text-tertiary); font-weight: 600;">Thời gian làm bài</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">
                          ${mins > 0 ? `${mins}p ` : ''}${secs}s
                        </div>
                      </div>
                      <div>
                        <div style="font-size: 11.5px; color: var(--text-tertiary); font-weight: 600;">Câu sai & Chưa làm</div>
                        <div style="font-size: 14px; font-weight: 600; color: var(--danger);">
                          ${h.wrongCount} sai · ${h.unattemptedCount || 0} bỏ qua
                        </div>
                      </div>
                    </div>

                    <!-- Nút Thao Tác Bài Thi -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                      <button class="btn btn-primary btn-sm" onclick="App.openExamAttemptDetailModal('${h.id}')" style="display:inline-flex; align-items:center; gap:5px;">
                        ${Icons.get('search', 13)} <span>Xem Chi Tiết Bài Làm (${h.totalQuestions} câu)</span>
                      </button>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm" onclick="App.openQuizConfigModal('${h.subjectId}')" style="display:inline-flex; align-items:center; gap:5px;">
                          ${Icons.get('refresh', 13)} <span>Thi Lại Môn Này</span>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="App.deleteExamAttemptConfirm('${h.id}')" title="Xóa lần thi này" style="display:inline-flex; align-items:center;">
                          ${Icons.get('trash', 13)}
                        </button>
                      </div>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>
          `}

        </div>

      </div>
    `;
  },

  openExamAttemptDetailModal(attemptId) {
    const attempt = StorageService.getAttemptById(attemptId);
    if (!attempt) {
      this.showToast("⚠️ Không tìm thấy dữ liệu chi tiết của bài thi này!", "warning");
      return;
    }

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const dateStr = attempt.completedAt ? new Date(attempt.completedAt).toLocaleString('vi-VN') : '';
    const mins = Math.floor((attempt.timeTakenSeconds || 0) / 60);
    const secs = (attempt.timeTakenSeconds || 0) % 60;
    const details = attempt.details || [];

    title.innerHTML = `🔍 Chi Tiết Bài Thi: ${attempt.subjectName}`;

    body.innerHTML = `
      <div style="max-height: 70vh; overflow-y: auto; padding-right: 4px;">
        
        <!-- Summary Strip -->
        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
              Điểm số: <span style="color: ${attempt.isPassed ? 'var(--success)' : 'var(--danger)'}; font-size: 16px;">${attempt.score10}/10</span> (${attempt.gradeTitle})
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              Thời gian: <strong>${mins}p ${secs}s</strong> · Hoàn thành lúc: ${dateStr}
            </div>
          </div>
          <span class="badge" style="background: ${attempt.isPassed ? '#dcfce7' : '#fee2e2'}; color: ${attempt.isPassed ? '#15803d' : '#b91c1c'}; font-weight: 800; font-size: 12.5px;">
            ${attempt.isPassed ? '🏆 ĐẠT' : '⚠️ CHƯA ĐẠT'}
          </span>
        </div>

        <!-- Questions List -->
        ${details.length === 0 ? `
          <div style="text-align: center; padding: 30px; color: var(--text-tertiary); font-size: 13px;">
            Bài thi này không có bản ghi chi tiết từng câu.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${details.map(d => this.renderReviewItem(d)).join('')}
          </div>
        `}
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-primary" onclick="App.closeModal(); App.openQuizConfigModal('${attempt.subjectId}')">🔄 Thi Lại Môn Này</button>
    `;

    modal.classList.add("active");
  },

  deleteExamAttemptConfirm(attemptId) {
    this.showConfirmDialog({
      title: "Xác nhận xóa lần thi",
      message: "Bạn có chắc chắn muốn xóa bản ghi lần thi này khỏi danh sách lịch sử không?",
      icon: "🗑️",
      confirmText: "Xóa lần thi",
      isDanger: true,
      warningKey: "delete_exam_attempt",
      onConfirm: () => {
        StorageService.deleteExamAttempt(attemptId);
        this.showToast("🗑️ Đã xóa lần thi khỏi lịch sử!", "info", 2500);
        this.renderExamHistoryView(document.getElementById("mainContent"));
      }
    });
  },

  clearExamHistoryConfirm() {
    this.showConfirmDialog({
      title: "Xác nhận xóa toàn bộ lịch sử thi",
      message: "Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử các lần thi thử của tài khoản này không?",
      icon: "⚠️",
      confirmText: "Xóa toàn bộ",
      isDanger: true,
      warningKey: "clear_all_exam_history",
      onConfirm: () => {
        StorageService.clearUserExamHistory();
        this.showToast("🗑️ Đã xóa sạch lịch sử thi!", "info", 2500);
        this.renderExamHistoryView(document.getElementById("mainContent"));
      }
    });
  }
});
