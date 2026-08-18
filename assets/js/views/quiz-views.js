/**
 * QUIZ VIEWS MODULE
 * Thiết lập bài thi (Quiz Setup), Phòng làm bài (Quiz View), Nộp bài.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  openQuizConfigModal(subjectId) {
    this.navigateTo("quiz-setup", { subjectId });
  },

  renderQuizSetupView(container, subjectId) {
    const subject = StorageService.getSubjectById(subjectId || this.quizSetupSubjectId);
    if (!subject) {
      this.showToast("⚠️ Không tìm thấy thông tin môn học!", "warning");
      this.navigateTo("home");
      return;
    }

    this.activeSubject = subject;
    this.quizSetupSubjectId = subject.id;
    const isLogged = StorageService.isLoggedIn();

    // Khởi tạo state cấu hình nếu chưa có hoặc khi đổi môn
    if (!this.quizSetupState || this.quizSetupState.subjectId !== subject.id) {
      this.quizSetupState = {
        subjectId: subject.id,
        mode: isLogged ? "practice" : "exam", // 'practice' hoặc 'exam'
        instantFeedback: true, // Hiện đáp án ngay sau mỗi câu
        autoExpandNotes: true, // Mở giải thích chi tiết
        repeatMistakes: false, // Lặp lại câu sai đến khi đúng
        timePreset: "auto", // 'auto', '15', '30', '45', '60', '90', 'custom'
        customTimeMinutes: "",
        warnTime: true,
        autoSubmitOnTimeout: true,
        questionCount: "all", // 'all', '10', '20', '30', '40', '50', '100', 'custom'
        customQuestionCount: "",
        shuffleQuestions: true,
        shuffleOptions: true,
        selectedChapters: ["all"]
      };
    }

    // Nếu là tài khoản Khách, cưỡng chế chỉ được Thi thử và luôn bật đảo đáp án
    if (!isLogged) {
      this.quizSetupState.mode = "exam";
      this.quizSetupState.shuffleOptions = true;
    }

    const state = this.quizSetupState;
    const allQuestions = subject.questions || [];
    const chapters = subject.chapters || [];

    // Tính toán số câu hỏi khả dụng theo phạm vi chương đã chọn
    let availableQuestions = allQuestions;
    const isAllChapters = state.selectedChapters.includes("all") || state.selectedChapters.length === 0;
    if (!isAllChapters) {
      availableQuestions = allQuestions.filter(q => state.selectedChapters.includes(q.chapterId));
    }
    const poolCount = availableQuestions.length;

    // Số câu thực tế sẽ làm
    let targetQuestionCount = poolCount;
    if (state.questionCount === "custom") {
      const parsed = parseInt(state.customQuestionCount, 10);
      targetQuestionCount = (!isNaN(parsed) && parsed > 0) ? Math.min(parsed, poolCount) : poolCount;
    } else if (state.questionCount !== "all") {
      const parsed = parseInt(state.questionCount, 10);
      targetQuestionCount = (!isNaN(parsed) && parsed > 0) ? Math.min(parsed, poolCount) : poolCount;
    }

    // Thời gian ước tính
    let timeDisplayText = "Không giới hạn";
    if (state.mode === "exam") {
      if (state.timePreset === "auto") {
        const mins = Math.max(5, Math.ceil(targetQuestionCount * 1.0));
        timeDisplayText = `${mins} phút (${targetQuestionCount} câu × 1p)`;
      } else if (state.timePreset === "custom") {
        const mins = parseInt(state.customTimeMinutes, 10) || 45;
        timeDisplayText = `${mins} phút (Tự đặt)`;
      } else {
        timeDisplayText = `${state.timePreset} phút`;
      }
    }

    container.innerHTML = `
      <div class="view-quiz-setup" style="padding: 24px 20px; max-width: 1100px; margin: 0 auto; width: 100%;">
        
        <!-- Breadcrumb & Top Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
            <button class="btn btn-sm" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('home', 13)} <span>Trang chủ</span></button>
            <span>/</span>
            <button class="btn btn-sm" onclick="App.navigateTo('subject-detail', { subjectId: '${subject.id}' })" style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('book', 13)} <span>${subject.name}</span></button>
            <span>/</span>
            <span style="font-weight: 700; color: var(--text-primary); display:inline-flex; align-items:center; gap:4px;">${Icons.get('settings', 13)} <span>Thiết lập bài làm</span></span>
          </div>

          <button class="btn btn-sm" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:4px;">
            ${Icons.get('chevronLeft', 13)} <span>Quay lại danh sách môn</span>
          </button>
        </div>

        <!-- Layout 2 Cột: Bên Trái là Form Cấu Hình, Bên Phải là Sticky Summary -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; align-items: start;">
          
          <!-- CỘT TRÁI: 3 KHU VỰC CẤU HÌNH -->
          <div style="display: flex; flex-direction: column; gap: 22px;">

            <!-- ── KHU VỰC 1: CHẾ ĐỘ LÀM BÀI ─────────────────────────────── -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                <span style="color: var(--brand-primary);">${Icons.get('target', 18)}</span>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">
                  1. Chọn Chế Độ Làm Bài
                </h3>
              </div>

              <!-- 2 Cards Chọn Chế Độ -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <!-- Tab Ôn Tập -->
                <div 
                  onclick="App.setQuizSetupMode('practice')" 
                  style="border: 2px solid ${state.mode === 'practice' ? 'var(--brand-primary)' : 'var(--border)'}; background: ${state.mode === 'practice' ? '#f0fdf4' : 'var(--surface)'}; padding: 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease; position: relative; ${!isLogged ? 'opacity: 0.65; background: #f8fafc;' : ''}">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <strong style="font-size: 15px; color: ${state.mode === 'practice' ? '#15803d' : 'var(--text-primary)'}; display: inline-flex; align-items: center; gap: 5px;">
                        <span style="color:#16a34a;">${Icons.get('bookOpen', 16)}</span> <span>Chế Độ Ôn Tập</span>
                      </strong>
                      ${!isLogged ? `<span class="badge" style="background: #fef3c7; color: #92400e; font-size: 10.5px; font-weight: 700; display:inline-flex; align-items:center; gap:3px;">${Icons.get('lock', 10)} Cần Đăng nhập</span>` : ''}
                    </div>
                    <input type="radio" name="setupModeRadio" ${state.mode === 'practice' ? 'checked' : ''} ${!isLogged ? 'disabled' : ''} style="cursor: pointer;">
                  </div>
                  <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                    ${!isLogged ? 'Tính năng xem đáp án và giải thích chi tiết từng câu chỉ dành cho sinh viên đã đăng nhập tài khoản DThu.' : 'Tự do củng cố kiến thức, học tới đâu xem đáp án & giải thích tới đó, không áp lực thời gian.'}
                  </p>
                </div>

                <!-- Tab Thi Thử -->
                <div 
                  onclick="App.setQuizSetupMode('exam')" 
                  style="border: 2px solid ${state.mode === 'exam' ? 'var(--brand-primary)' : 'var(--border)'}; background: ${state.mode === 'exam' ? '#eff6ff' : 'var(--surface)'}; padding: 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease; position: relative;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <strong style="font-size: 15px; color: ${state.mode === 'exam' ? '#1d4ed8' : 'var(--text-primary)'}; display: inline-flex; align-items: center; gap: 5px;">
                      <span style="color:#2563eb;">${Icons.get('timer', 16)}</span> <span>Chế Độ Thi Thử</span>
                    </strong>
                    <input type="radio" name="setupModeRadio" ${state.mode === 'exam' ? 'checked' : ''} style="cursor: pointer;">
                  </div>
                  <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                    Mô phỏng phòng thi thật có bấm giờ đếm ngược, nộp bài mới biết điểm, lưu Lịch Sử Thi & BXH.
                  </p>
                </div>
              </div>

              <!-- Tiện Ích Riêng Theo Chế Độ Đã Chọn -->
              ${state.mode === 'practice' ? `
                <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                  <div style="font-size: 13px; font-weight: 700; color: #15803d; display: flex; align-items: center; gap: 5px;">
                    ${Icons.get('sparkles', 14)} <span>Tiện ích & Tùy chọn chuyên biệt cho Ôn Tập:</span>
                  </div>

                  <!-- Tùy chọn 1: Hiện đáp án ngay -->
                  <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary);">
                    <div>
                      <strong style="display: inline-flex; align-items: center; gap: 4px;">${Icons.get('zap', 13)} <span>Hiện đáp án & Đúng/Sai ngay sau khi chọn:</span></strong>
                      <div style="font-size: 12px; color: var(--text-secondary);">Chọn câu trả lời là biết ngay kết quả và vị trí đúng/sai</div>
                    </div>
                    <input type="checkbox" ${state.instantFeedback ? 'checked' : ''} onchange="App.setQuizSetupPracticeOption('instantFeedback', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>

                  <!-- Tùy chọn 2: Tự mở giải thích -->
                  <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary);">
                    <div>
                      <strong style="display: inline-flex; align-items: center; gap: 4px;">${Icons.get('sparkles', 13)} <span>Hiển thị kèm giải thích chi tiết:</span></strong>
                      <div style="font-size: 12px; color: var(--text-secondary);">Tự động hiển thị khung giải thích bên dưới câu hỏi</div>
                    </div>
                    <input type="checkbox" ${state.autoExpandNotes ? 'checked' : ''} onchange="App.setQuizSetupPracticeOption('autoExpandNotes', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>

                  <!-- Tùy chọn 3: Lặp lại câu sai -->
                  <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary);">
                    <div>
                      <strong style="display: inline-flex; align-items: center; gap: 4px;">${Icons.get('refresh', 13)} <span>Chế độ Luyện Tập Lặp Lại (Mastery):</span></strong>
                      <div style="font-size: 12px; color: var(--text-secondary);">Nếu trả lời sai, câu hỏi sẽ được đưa về cuối đề để bạn làm lại đến khi đúng</div>
                    </div>
                    <input type="checkbox" ${state.repeatMistakes ? 'checked' : ''} onchange="App.setQuizSetupPracticeOption('repeatMistakes', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                  </label>

                  <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #16a34a; margin-top: 4px;">
                    <span>${Icons.get('clock', 13)}</span>
                    <span>Chế độ ôn tập <strong>không giới hạn thời gian</strong> để bạn rèn luyện thoải mái nhất.</span>
                  </div>
                </div>
              ` : `
                <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 14px;">
                  <div style="font-size: 13px; font-weight: 700; color: #1d4ed8; display: flex; align-items: center; gap: 5px;">
                    ${Icons.get('timer', 14)} <span>Tùy chỉnh Thời Gian & Quy Tắc Phòng Thi:</span>
                  </div>

                  <!-- Chọn thời gian làm bài -->
                  <div>
                    <label style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: block;">
                      Thời gian làm bài thi:
                    </label>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                      ${['auto', '15', '30', '45', '60', '90', 'custom'].map(preset => {
                        const isSel = (state.timePreset === preset);
                        let label = `${preset} phút`;
                        if (preset === 'auto') label = `⚡ Tự động (1p/câu)`;
                        else if (preset === 'custom') label = `✏️ Tự nhập phút`;

                        return `
                          <button 
                            type="button"
                            onclick="App.setQuizSetupTimePreset('${preset}')" 
                            class="btn btn-sm ${isSel ? 'btn-primary' : ''}" 
                            style="${isSel ? 'font-weight: 800;' : 'background: #ffffff; border: 1px solid var(--border); color: var(--text-primary);'}">
                            ${label}
                          </button>
                        `;
                      }).join('')}
                    </div>

                    ${state.timePreset === 'custom' ? `
                      <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                        <input 
                          type="number" 
                          min="1" 
                          max="300" 
                          class="form-control" 
                          style="max-width: 150px; font-weight: 700;" 
                          placeholder="Ví dụ: 45" 
                          value="${state.customTimeMinutes}" 
                          oninput="App.setQuizSetupCustomTime(this.value)">
                        <span style="font-size: 13px; color: var(--text-secondary);">phút</span>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Tùy chọn cảnh báo & tự nộp -->
                  <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed var(--border); padding-top: 10px;">
                    <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13px; color: var(--text-primary);">
                      <span>🔔 Nhắc nhở cảnh báo khi còn 5 phút cuối</span>
                      <input type="checkbox" ${state.warnTime ? 'checked' : ''} onchange="App.setQuizSetupExamOption('warnTime', this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
                    </label>

                    <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13px; color: var(--text-primary);">
                      <span>📤 Tự động thu bài & tính điểm khi hết giờ</span>
                      <input type="checkbox" ${state.autoSubmitOnTimeout ? 'checked' : ''} onchange="App.setQuizSetupExamOption('autoSubmitOnTimeout', this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
                    </label>
                  </div>

                  <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #2563eb;">
                    <span>📜</span>
                    <span>Kết quả bài thi thử sẽ được tự động ghi nhận vào <strong>Lịch Sử Thi (10 lần gần nhất / lưu 30 ngày)</strong>.</span>
                  </div>
                </div>
              `}

            </div>

            <!-- ── KHU VỰC 2: CẤU HÌNH ĐỀ & TRỘN CÂU HỎI ─────────────────── -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                <span style="font-size: 18px;">⚙️</span>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">
                  2. Cấu Hình Đề & Trộn Câu Hỏi
                </h3>
              </div>

              <!-- Số lượng câu hỏi cần làm -->
              <div style="margin-bottom: 18px;">
                <label style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: block;">
                  Số lượng câu hỏi trong đề:
                </label>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${['all', '10', '20', '30', '40', '50', '100', 'custom'].map(count => {
                    const isSel = (state.questionCount === count);
                    let label = `${count} câu`;
                    if (count === 'all') label = `Toàn bộ (${poolCount} câu)`;
                    else if (count === 'custom') label = `✏️ Tự nhập`;

                    return `
                      <button 
                        type="button"
                        onclick="App.setQuizSetupQuestionCount('${count}')" 
                        class="btn btn-sm ${isSel ? 'btn-primary' : ''}" 
                        style="${isSel ? 'font-weight: 800;' : 'background: #ffffff; border: 1px solid var(--border); color: var(--text-primary);'}">
                        ${label}
                      </button>
                    `;
                  }).join('')}
                </div>

                ${state.questionCount === 'custom' ? `
                  <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                    <input 
                      type="number" 
                      min="1" 
                      max="${poolCount}" 
                      class="form-control" 
                      style="max-width: 150px; font-weight: 700;" 
                      placeholder="Tối đa ${poolCount}" 
                      value="${state.customQuestionCount}" 
                      oninput="App.setQuizSetupCustomQuestionCount(this.value)">
                    <span style="font-size: 13px; color: var(--text-secondary);">câu (trên tổng ${poolCount} câu khả dụng)</span>
                  </div>
                ` : ''}
              </div>

              <!-- Xáo trộn câu hỏi & Xáo trộn đáp án -->
              <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px dashed var(--border); padding-top: 14px;">
                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary); padding: 8px 12px; background: #f8fafc; border-radius: var(--radius-sm);">
                  <div>
                    <strong>🔀 Xáo trộn thứ tự các câu hỏi (Đề ngẫu nhiên):</strong>
                    <div style="font-size: 12px; color: var(--text-secondary);">Các câu hỏi sẽ được đảo vị trí ngẫu nhiên mỗi lần làm</div>
                  </div>
                  <input type="checkbox" ${state.shuffleQuestions ? 'checked' : ''} onchange="App.toggleQuizSetupShuffle('shuffleQuestions')" style="width: 18px; height: 18px; cursor: pointer;">
                </label>

                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13.5px; color: var(--text-primary); padding: 8px 12px; background: #f8fafc; border-radius: var(--radius-sm);">
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <strong>🔤 Xáo trộn thứ tự các đáp án A - B - C - D:</strong>
                      ${!isLogged ? `<span class="badge" style="background: #fef3c7; color: #92400e; font-size: 10.5px; font-weight: 700;">🔒 Khóa với Khách (Luôn bật)</span>` : ''}
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Tránh việc học vẹt vị trí chữ cái, rèn luyện tư duy thực chất</div>
                  </div>
                  <input type="checkbox" ${state.shuffleOptions ? 'checked' : ''} ${!isLogged ? 'disabled' : ''} onchange="App.toggleQuizSetupShuffle('shuffleOptions')" style="width: 18px; height: 18px; cursor: pointer;">
                </label>
              </div>

            </div>

            <!-- ── KHU VỰC 3: PHẠM VI CHƯƠNG KIẾN THỨC ───────────────────── -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">📂</span>
                  <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">
                    3. Phạm Vi Chương Kiến Thức
                  </h3>
                </div>

                <button class="btn btn-sm ${isAllChapters ? 'btn-primary' : ''}" onclick="App.toggleQuizSetupAllChapters()">
                  ${isAllChapters ? '✓ Đang chọn Tất Cả' : 'Chọn Tất Cả Các Chương'}
                </button>
              </div>

              <!-- Danh sách các chương với checkbox đa chọn -->
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${chapters.length === 0 ? `
                  <div style="padding: 12px; background: #f8fafc; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary);">
                    Môn học này chưa phân chia chương cụ thể. Toàn bộ ${allQuestions.length} câu hỏi sẽ được sử dụng.
                  </div>
                ` : `
                  ${chapters.map((c, cIdx) => {
                    const cQCount = allQuestions.filter(q => q.chapterId === c.id).length;
                    const isChecked = isAllChapters || state.selectedChapters.includes(c.id);

                    return `
                      <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1.5px solid ${isChecked ? 'var(--brand-primary)' : 'var(--border)'}; background: ${isChecked ? '#f0fdf4' : '#ffffff'}; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <input 
                            type="checkbox" 
                            ${isChecked ? 'checked' : ''} 
                            onchange="App.toggleQuizSetupChapter('${c.id}')" 
                            style="width: 17px; height: 17px; cursor: pointer;">
                          <span style="font-weight: ${isChecked ? '700' : '500'}; color: ${isChecked ? '#14532d' : 'var(--text-primary)'}; font-size: 13.5px;">
                            ${c.name}
                          </span>
                        </div>
                        <span class="badge" style="background: ${isChecked ? '#dcfce7' : '#f1f5f9'}; color: ${isChecked ? '#15803d' : '#64748b'}; font-weight: 700; font-size: 11.5px;">
                          ${cQCount} câu
                        </span>
                      </label>
                    `;
                  }).join('')}
                `}
              </div>
            </div>

          </div>

          <!-- CỘT PHẢI: STICKY SUMMARY CARD & NÚT BẮT ĐẦU -->
          <div style="position: sticky; top: 20px;">
            <div style="background: var(--surface); border: 2px solid var(--brand-primary); border-radius: var(--radius-md); padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
              
              <div style="border-bottom: 1px solid var(--border); padding-bottom: 14px; margin-bottom: 14px;">
                <span class="badge badge-blue" style="font-weight: 800; margin-bottom: 6px; display: inline-block;">
                  ${subject.code || 'DTHU-QUIZ'}
                </span>
                <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; line-height: 1.3;">
                  ${subject.name}
                </h3>
                <div style="font-size: 12.5px; color: var(--text-secondary);">
                  Tổng ngân hàng: <strong>${allQuestions.length} câu hỏi</strong>
                </div>
              </div>

              <!-- Tóm tắt cấu hình -->
              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Chế độ:</span>
                  <strong style="color: ${state.mode === 'practice' ? '#15803d' : '#1d4ed8'};">
                    ${state.mode === 'practice' ? '🟢 Ôn Tập Có Lời Giải' : '⏱️ Thi Thử Tính Giờ'}
                  </strong>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Số câu sẽ làm:</span>
                  <strong style="color: var(--brand-primary); font-size: 14px;">
                    ${targetQuestionCount} câu
                  </strong>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Thời gian thi:</span>
                  <strong>${timeDisplayText}</strong>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Xáo trộn đề:</span>
                  <span>${state.shuffleQuestions ? '✓ Xáo câu' : '✗ Giữ câu'} · ${state.shuffleOptions ? '✓ Xáo đáp án' : '✗ Giữ đáp án'}</span>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Phạm vi:</span>
                  <span>${isAllChapters ? 'Tất cả các chương' : `${state.selectedChapters.length} chương đã chọn`}</span>
                </div>
              </div>

              <!-- Nút Bắt Đầu Lớn -->
              <button 
                class="btn btn-primary" 
                style="width: 100%; padding: 14px; font-size: 15px; font-weight: 800; letter-spacing: 0.02em; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 10px rgba(37,99,235,0.25);" 
                onclick="App.launchQuizFromSetup()">
                🚀 BẮT ĐẦU LÀM BÀI NGAY ➔
              </button>

              <button 
                class="btn" 
                style="width: 100%; margin-top: 10px; font-size: 13px;" 
                onclick="App.navigateTo('home')">
                ← Quay lại danh sách môn
              </button>

            </div>
          </div>

        </div>

      </div>
    `;
  },

  setQuizSetupMode(mode) {
    if (!this.quizSetupState) return;
    const isLogged = StorageService.isLoggedIn();
    if (mode === "practice" && !isLogged) {
      this.showToast("🔒 Chế độ Ôn tập có đáp án & lời giải chi tiết yêu cầu Đăng nhập tài khoản sinh viên!", "warning", 3000);
      this.openAccountSwitcherModal();
      return;
    }
    this.quizSetupState.mode = mode;
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupPracticeOption(key, checked) {
    if (!this.quizSetupState) return;
    this.quizSetupState[key] = Boolean(checked);
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupExamOption(key, checked) {
    if (!this.quizSetupState) return;
    this.quizSetupState[key] = Boolean(checked);
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupTimePreset(preset) {
    if (!this.quizSetupState) return;
    this.quizSetupState.timePreset = preset;
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupCustomTime(val) {
    if (!this.quizSetupState) return;
    this.quizSetupState.customTimeMinutes = val;
  },

  setQuizSetupQuestionCount(count) {
    if (!this.quizSetupState) return;
    this.quizSetupState.questionCount = count;
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  setQuizSetupCustomQuestionCount(val) {
    if (!this.quizSetupState) return;
    this.quizSetupState.customQuestionCount = val;
  },

  toggleQuizSetupShuffle(key) {
    if (!this.quizSetupState) return;
    const isLogged = StorageService.isLoggedIn();
    if (key === "shuffleOptions" && !isLogged) {
      this.showToast("🔒 Tài khoản Khách bắt buộc đảo thứ tự đáp án A-B-C-D để chống học vẹt!", "warning", 2500);
      return;
    }
    this.quizSetupState[key] = !this.quizSetupState[key];
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  toggleQuizSetupChapter(chapterId) {
    if (!this.quizSetupState) return;
    let list = this.quizSetupState.selectedChapters.filter(c => c !== "all");
    if (list.includes(chapterId)) {
      list = list.filter(c => c !== chapterId);
    } else {
      list.push(chapterId);
    }
    if (list.length === 0) list = ["all"];
    this.quizSetupState.selectedChapters = list;
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  toggleQuizSetupAllChapters() {
    if (!this.quizSetupState) return;
    this.quizSetupState.selectedChapters = ["all"];
    this.renderQuizSetupView(document.getElementById("mainContent"), this.quizSetupSubjectId);
  },

  launchQuizFromSetup() {
    const subject = StorageService.getSubjectById(this.quizSetupSubjectId);
    if (!subject) {
      this.showToast("⚠️ Không tìm thấy môn học!", "danger");
      return;
    }

    const isLogged = StorageService.isLoggedIn();
    const state = this.quizSetupState || {};
    let selectedMode = state.mode || "exam";
    let shuffleOpts = state.shuffleOptions !== false;

    if (!isLogged) {
      // Khách tuyệt đối chỉ được thi thử và bắt buộc xáo trộn đáp án
      selectedMode = "exam";
      shuffleOpts = true;
    }

    const questionCount = (state.questionCount === "custom") ? (parseInt(state.customQuestionCount, 10) || "all") : state.questionCount;
    const customTimeMinutes = (state.timePreset === "custom") ? (parseInt(state.customTimeMinutes, 10) || 45) : ((state.timePreset !== "auto") ? parseInt(state.timePreset, 10) : null);

    const session = QuizEngine.createQuizSession(subject, {
      mode: selectedMode,
      chapterIds: state.selectedChapters,
      questionCount: questionCount || "all",
      shuffleQuestions: state.shuffleQuestions !== false,
      shuffleOptions: shuffleOpts,
      customTimeMinutes: customTimeMinutes,
      instantFeedback: state.instantFeedback !== false,
      autoExpandNotes: state.autoExpandNotes !== false,
      repeatMistakes: state.repeatMistakes === true,
      warnTime: state.warnTime !== false,
      autoSubmitOnTimeout: state.autoSubmitOnTimeout !== false
    });

    if (session.questions.length === 0) {
      this.showToast("⚠️ Không có câu hỏi nào trong phạm vi lựa chọn!", "warning");
      return;
    }

    this.activeSession = session;
    this.currentPage = 0;
    this.navigateTo("quiz");

    // Khởi động đồng hồ nếu thi thử
    if (session.mode === "exam") {
      this.startExamTimer();
    }
  },

  startExamTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.pushActivity === "function" && this.activeSession) {
      const m = Math.floor(this.activeSession.timeRemainingSeconds / 60);
      const s = this.activeSession.timeRemainingSeconds % 60;
      DynamicIsland.pushActivity({
        id: "quiz-timer",
        type: "quiz-timer",
        priority: 3,
        icon: "⏳",
        title: "Phòng Thi",
        subtitle: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      });
    }

    this.timerInterval = setInterval(() => {
      if (!this.activeSession) return;
      this.activeSession.timeRemainingSeconds--;

      const m = Math.floor(this.activeSession.timeRemainingSeconds / 60);
      const s = this.activeSession.timeRemainingSeconds % 60;
      const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

      const digits = document.getElementById("timerDigits");
      if (digits) {
        digits.textContent = timeStr;
      }

      if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.updateActivity === "function") {
        DynamicIsland.updateActivity("quiz-timer", {
          subtitle: timeStr
        });
      }

      if (this.activeSession.timeRemainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        if (typeof DynamicIsland !== "undefined" && typeof DynamicIsland.removeActivity === "function") {
          DynamicIsland.removeActivity("quiz-timer");
        }
        this.showToast("⏰ Đã hết thời gian làm bài! Hệ thống tự động nộp bài.", "warning", 4500);
        this.submitQuiz(true);
      }
    }, 1000);
  },

  renderQuizView(container) {
    const session = this.activeSession;
    if (!session) {
      this.navigateTo("home");
      return;
    }

    if (!session.flags) session.flags = {};
    const isExam = session.mode === "exam";
    const savedWidth = localStorage.getItem("dthu_quiz_sidebar_width") || "320";

    container.innerHTML = `
      <div class="view-quiz" id="viewQuizContainer">
        <!-- Sidebar Navigation Grid -->
        <aside class="quiz-sidebar" id="quizSidebar" style="width: ${savedWidth}px; min-width: ${savedWidth}px;">
          <button class="btn btn-sm" onclick="App.confirmExitQuiz()" style="display:inline-flex; align-items:center; gap:6px;">
            ${Icons.get('logOut', 13)} <span>Rời phòng làm bài</span>
          </button>

          ${isExam ? `
            <div class="quiz-timer-box">
              <span class="timer-label" style="display:inline-flex; align-items:center; gap:5px;">
                ${Icons.get('clock', 14)} <span>Thời gian còn lại:</span>
              </span>
              <span class="timer-digits" id="timerDigits">--:--</span>
            </div>
          ` : ''}

          <div class="sidebar-title">Danh sách câu hỏi (${session.questions.length} câu)</div>
          <div class="sidebar-page-indicator" id="sidebarPageIndicator"></div>
          <div id="sidebarFlagSummary" style="display: none;"></div>
          <div class="q-grid" id="quizGridNav"></div>

          <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
            <button class="btn btn-primary" style="width: 100%; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="App.submitQuiz()">
              ${isExam ? `${Icons.get('checkCircle', 15)} <span>Nộp bài thi</span>` : `${Icons.get('checkCircle', 15)} <span>Kết thúc ôn tập</span>`}
            </button>
          </div>
        </aside>

        <!-- Draggable Resizer Handle -->
        <div class="quiz-resizer" id="quizResizer" title="Kéo chuột để điều chỉnh độ rộng 2 bên"></div>

        <!-- Main Content Question Area -->
        <main class="quiz-main" id="quizMainContent">
          <!-- Top Bar with Navigation -->
          <div class="quiz-top-bar">
            <div class="quiz-top-left">
              <h2>${session.subjectName} (${session.subjectCode || session.subjectId})</h2>
              <p>Chế độ: <strong>${isExam ? 'Thi thử tính giờ' : 'Ôn tập có giải thích'}</strong> · Tổng số câu: ${session.questions.length}</p>
            </div>
            <div id="quizPaginationControls"></div>
          </div>

          <!-- Questions of current page -->
          <div id="quizQuestionsContainer"></div>

          <!-- Bottom Pagination Controls -->
          <div id="quizBottomPaginationControls"></div>
        </main>
      </div>
    `;

    this.renderQuizQuestions();
    this.renderQuizSidebarGrid();
    this.initQuizResizer();
  },

  initQuizResizer() {
    const resizer = document.getElementById("quizResizer");
    const sidebar = document.getElementById("quizSidebar");
    const container = document.getElementById("viewQuizContainer");

    if (!resizer || !sidebar || !container) return;

    let isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      resizer.classList.add("is-dragging");
      document.body.classList.add("is-resizing-quiz");
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();
      const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
      let newWidth = clientX - containerRect.left;

      // Giới hạn kích thước tối thiểu và tối đa (220px <= width <= 580px hoặc 50% màn hình)
      const minWidth = 220;
      const maxWidth = Math.min(580, containerRect.width * 0.55);

      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;

      sidebar.style.width = `${newWidth}px`;
      sidebar.style.minWidth = `${newWidth}px`;
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        resizer.classList.remove("is-dragging");
        document.body.classList.remove("is-resizing-quiz");

        // Lưu kích thước người dùng vừa chỉnh vào localStorage
        const currentWidth = parseInt(sidebar.style.width, 10);
        if (currentWidth) {
          localStorage.setItem("dthu_quiz_sidebar_width", currentWidth.toString());
        }
      }
    };

    resizer.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    // Hỗ trợ cả màn hình cảm ứng
    resizer.addEventListener("touchstart", onMouseDown, { passive: false });
    document.addEventListener("touchmove", onMouseMove, { passive: false });
    document.addEventListener("touchend", onMouseUp);
  },

  getFilteredQuestions() {
    if (!this.activeSession) return [];
    if (this.quizFilterMode === "flagged") {
      const flags = this.activeSession.flags || {};
      return this.activeSession.questions.filter(q => flags[q.id]);
    }
    return this.activeSession.questions;
  },

  toggleFlagFilter(forceMode) {
    if (forceMode !== undefined) {
      this.quizFilterMode = forceMode;
    } else {
      this.quizFilterMode = (this.quizFilterMode === "flagged") ? "all" : "flagged";
    }
    this.currentPage = 0;
    this.renderQuizQuestions();
    this.renderQuizSidebarGrid();
  },

  toggleQuestionFlag(questionId) {
    if (!this.activeSession) return;
    if (!this.activeSession.flags) this.activeSession.flags = {};

    const isFlagged = !this.activeSession.flags[questionId];
    this.activeSession.flags[questionId] = isFlagged;

    const remainingFlagged = Object.values(this.activeSession.flags).filter(Boolean).length;

    // Nếu đang ở chế độ lọc mà gỡ cờ thì re-render lại danh sách
    if (this.quizFilterMode === "flagged") {
      if (remainingFlagged === 0) {
        this.quizFilterMode = "all";
      }
      this.renderQuizQuestions();
      this.renderQuizSidebarGrid();
      return;
    }

    // 1. Cập nhật nút Đặt cờ trên Card câu hỏi
    const btn = document.getElementById(`btnFlag-${questionId}`);
    const card = document.getElementById(`qcard-${questionId}`);
    if (btn) {
      btn.className = `btn-flag ${isFlagged ? 'is-flagged' : ''}`;
      btn.innerHTML = `<span style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('flag', 13, '', isFlagged ? '#ef4444' : 'currentColor')} <span>${isFlagged ? 'Đã đặt cờ' : 'Đặt cờ'}</span></span>`;
    }
    if (card) {
      if (isFlagged) card.classList.add("is-flagged");
      else card.classList.remove("is-flagged");
    }

    // 2. Cập nhật ô số câu hỏi ở Sidebar
    const cell = document.getElementById(`qcell-${questionId}`);
    if (cell) {
      if (isFlagged) cell.classList.add("flagged");
      else cell.classList.remove("flagged");
    }

    // 3. Cập nhật thanh tóm tắt số cờ ở Sidebar
    this.updateSidebarFlagSummary();
  },

  updateSidebarFlagSummary() {
    const summary = document.getElementById("sidebarFlagSummary");
    if (!summary || !this.activeSession) return;

    const flags = this.activeSession.flags || {};
    const flaggedCount = Object.values(flags).filter(Boolean).length;

    if (flaggedCount > 0) {
      summary.style.display = "flex";
      summary.className = `sidebar-flag-summary ${this.quizFilterMode === 'flagged' ? 'is-filtering' : ''}`;
      if (this.quizFilterMode === "flagged") {
        summary.innerHTML = `
          <span style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('flag', 13, '', '#ef4444')} <span>Đang lọc: <strong>${flaggedCount} câu</strong></span></span>
          <button class="btn btn-sm btn-primary" style="padding: 2px 8px; font-size: 11px; height: auto;" onclick="App.toggleFlagFilter('all')">✕ Hiện tất cả</button>
        `;
      } else {
        summary.innerHTML = `
          <span style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('flag', 13, '', '#ef4444')} <span>Đã đặt cờ: <strong>${flaggedCount} câu</strong></span></span>
          <button class="btn btn-sm btn-primary" style="padding: 2px 8px; font-size: 11px; height: auto; display:inline-flex; align-items:center; gap:3px;" onclick="App.toggleFlagFilter('flagged')"><span>Chỉ xem cờ (${flaggedCount})</span> ${Icons.get('arrowRight', 10)}</button>
        `;
      }
    } else {
      summary.style.display = "none";
      summary.innerHTML = "";
    }
  },

  renderQuizSidebarGrid() {
    const grid = document.getElementById("quizGridNav");
    if (!grid || !this.activeSession) return;
    grid.innerHTML = "";

    const displayedList = this.getFilteredQuestions();
    const isFiltering = this.quizFilterMode === "flagged";
    const totalDisplayed = displayedList.length;
    const totalPages = Math.max(1, Math.ceil(totalDisplayed / this.QUESTIONS_PER_PAGE));
    const startIdx = this.currentPage * this.QUESTIONS_PER_PAGE;
    const endIdx = Math.min(startIdx + this.QUESTIONS_PER_PAGE, totalDisplayed);

    // Cập nhật thẻ chỉ báo trang đang xem ở cột bên trái
    const indicator = document.getElementById("sidebarPageIndicator");
    if (indicator) {
      if (isFiltering) {
        indicator.innerHTML = `
          <span style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('flag', 12, '', '#ef4444')} <span>Đang lọc: ${totalDisplayed} câu có cờ</span></span>
          <span>Trang ${this.currentPage + 1}/${totalPages}</span>
        `;
      } else {
        indicator.innerHTML = `
          <span>📌 Đang xem: Câu ${startIdx + 1} – ${endIdx}</span>
          <span>Trang ${this.currentPage + 1}/${totalPages}</span>
        `;
      }
    }

    this.updateSidebarFlagSummary();

    const currentVisibleIds = new Set(displayedList.slice(startIdx, endIdx).map(q => q.id));

    this.activeSession.questions.forEach((q, idx) => {
      const cell = document.createElement("div");
      cell.className = "q-cell";
      cell.textContent = idx + 1;
      cell.id = `qcell-${q.id}`;

      // Đánh dấu phát sáng / viền nổi bật nếu câu này thuộc trang đang xem
      if (currentVisibleIds.has(q.id)) {
        cell.classList.add("in-current-page");
      }

      // Đánh dấu cắm cờ 🚩
      if (this.activeSession.flags && this.activeSession.flags[q.id]) {
        cell.classList.add("flagged");
      } else if (isFiltering) {
        cell.classList.add("filtered-out");
      }

      const userAns = this.activeSession.answers[q.id];
      if (userAns !== undefined) {
        if (this.activeSession.mode === "practice") {
          const isCorrect = userAns === q.answerIndex;
          cell.classList.add(isCorrect ? "correct" : "wrong");
        } else {
          cell.classList.add("answered");
        }
      }

      cell.onclick = () => {
        if (isFiltering) {
          const isThisFlagged = this.activeSession.flags && this.activeSession.flags[q.id];
          if (!isThisFlagged) {
            // Tự động thoát lọc để nhảy tới câu chưa cắm cờ
            this.quizFilterMode = "all";
            const targetPage = Math.floor(idx / this.QUESTIONS_PER_PAGE);
            this.currentPage = targetPage;
            this.renderQuizQuestions();
          } else {
            const filterIdx = displayedList.findIndex(x => x.id === q.id);
            if (filterIdx >= 0) {
              const targetPage = Math.floor(filterIdx / this.QUESTIONS_PER_PAGE);
              if (targetPage !== this.currentPage) {
                this.currentPage = targetPage;
                this.renderQuizQuestions();
              }
            }
          }
        } else {
          const targetPage = Math.floor(idx / this.QUESTIONS_PER_PAGE);
          if (targetPage !== this.currentPage) {
            this.currentPage = targetPage;
            this.renderQuizQuestions();
          }
        }

        setTimeout(() => {
          const el = document.getElementById(`qcard-${q.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      };

      grid.appendChild(cell);
    });
  },

  renderQuizQuestions() {
    const container = document.getElementById("quizQuestionsContainer");
    if (!container || !this.activeSession) return;
    container.innerHTML = "";

    const displayedList = this.getFilteredQuestions();
    const isFiltering = this.quizFilterMode === "flagged";
    const totalDisplayed = displayedList.length;

    // Thanh thông báo khi đang ở chế độ lọc câu có cờ
    if (isFiltering) {
      const banner = document.createElement("div");
      banner.className = "quiz-filter-banner";
      banner.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:5px;">${Icons.get('filter', 14)} <span>Đang ở chế độ lọc: <strong>Chỉ hiển thị ${totalDisplayed} câu hỏi đã đặt cờ</strong></span></span>
        <button class="btn btn-sm btn-primary" onclick="App.toggleFlagFilter('all')">✕ Thoát lọc (Xem tất cả ${this.activeSession.questions.length} câu)</button>
      `;
      container.appendChild(banner);
    }

    if (totalDisplayed === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.style.cssText = "text-align: center; padding: 48px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);";
      emptyBox.innerHTML = `
        <div style="color: #ef4444; margin-bottom: 8px; display:flex; justify-content:center;">${Icons.get('flag', 36, '', '#ef4444')}</div>
        <h3>Không có câu hỏi nào đang được đặt cờ</h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">Bạn có thể bấm "Đặt cờ" ở các câu hỏi chưa chắc chắn để xem lại tại đây.</p>
        <button class="btn btn-sm btn-primary" style="margin-top: 14px; display:inline-flex; align-items:center; gap:5px;" onclick="App.toggleFlagFilter('all')"><span>Xem tất cả ${this.activeSession.questions.length} câu hỏi</span> ${Icons.get('arrowRight', 12)}</button>
      `;
      container.appendChild(emptyBox);
      this.renderQuizPagination();
      this.renderQuizSidebarGrid();
      return;
    }

    const start = this.currentPage * this.QUESTIONS_PER_PAGE;
    const end = Math.min(start + this.QUESTIONS_PER_PAGE, totalDisplayed);

    for (let i = start; i < end; i++) {
      const q = displayedList[i];
      container.appendChild(this.createQuizQuestionElement(q, i, displayedList.length));
    }

    this.renderQuizPagination();
    this.renderQuizSidebarGrid();
  },

  createQuizQuestionElement(q, index, totalDisplayedCount) {
    const card = document.createElement("div");
    const isFlagged = Boolean(this.activeSession.flags && this.activeSession.flags[q.id]);
    card.className = `question-card ${isFlagged ? 'is-flagged' : ''}`;
    card.id = `qcard-${q.id}`;

    const originalIdx = this.activeSession.questions.findIndex(x => x.id === q.id);
    const userAns = this.activeSession.answers[q.id];
    const isAnswered = userAns !== undefined;
    const isPractice = this.activeSession.mode === "practice";

    let optionsHtml = `<div class="options-list">`;
    q.options.forEach((opt, oi) => {
      let optClass = "option-btn";
      let stateNote = "";

      if (isAnswered) {
        if (isPractice && this.activeSession.instantFeedback !== false) {
          optClass += " disabled";
          if (oi === q.answerIndex) {
            optClass += " state-correct";
            stateNote = `<strong>✓ Đúng:</strong> ${SmartParserService.formatRichText(opt.note || 'Đáp án chính xác.')}`;
          } else if (oi === userAns) {
            optClass += " state-wrong";
            stateNote = `<strong>✗ Sai:</strong> ${SmartParserService.formatRichText(opt.note || 'Đáp án chưa chính xác.')}`;
          } else {
            optClass += " show-all";
            stateNote = `<strong>Ghi chú:</strong> ${SmartParserService.formatRichText(opt.note || '')}`;
          }
        } else {
          // Exam mode hoặc Ôn tập không hiện đáp án ngay
          if (oi === userAns) optClass += " selected-exam";
        }
      }

      optionsHtml += `
        <div class="${optClass}" onclick="App.selectQuizOption('${q.id}', ${oi})">
          <div class="option-header-row">
            <div class="opt-letter">${this.letters[oi]}</div>
            <div class="opt-text">${SmartParserService.formatRichText(opt.text)}</div>
          </div>
          ${(isPractice && this.activeSession.instantFeedback !== false && isAnswered && opt.note) ? `<div class="opt-explanation">${stateNote}</div>` : ''}
        </div>
      `;
    });
    optionsHtml += `</div>`;

    card.innerHTML = `
      <div class="question-card-header">
        <span class="badge badge-gray">Câu ${originalIdx + 1} (${q.id || `Q${originalIdx + 1}`})</span>
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn-flag ${isFlagged ? 'is-flagged' : ''}" onclick="App.toggleQuestionFlag('${q.id}')" id="btnFlag-${q.id}" title="Đánh dấu / Đặt cờ câu này để xem lại sau">
            <span style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('flag', 13, '', isFlagged ? '#ef4444' : 'currentColor')} <span>${isFlagged ? 'Đã đặt cờ' : 'Đặt cờ'}</span></span>
          </button>
          <span style="font-size: 12.5px; font-weight: 700; color: var(--text-tertiary);">
            Câu ${originalIdx + 1} / ${this.activeSession.questions.length} ${this.quizFilterMode === 'flagged' ? `(Cờ ${index + 1}/${totalDisplayedCount})` : ''}
          </span>
        </div>
      </div>
      <div class="question-card-title">${SmartParserService.formatRichText(q.question)}</div>
      ${optionsHtml}
    `;

    return card;
  },

  selectQuizOption(questionId, optionIndex) {
    if (!this.activeSession) return;
    if (this.activeSession.mode === "practice" && this.activeSession.instantFeedback !== false && this.activeSession.answers[questionId] !== undefined) {
      return; // Khóa trong chế độ ôn tập khi bật hiện đáp án ngay
    }

    this.activeSession.answers[questionId] = optionIndex;

    // Tính streak trong chế độ Ôn tập
    if (this.activeSession.mode === "practice" && this.activeSession.instantFeedback !== false) {
      const q = this.activeSession.questions.find(x => x.id === questionId);
      if (q) {
        const isCorrect = (optionIndex === q.answerIndex);
        if (isCorrect) {
          this.currentQuizStreak = (this.currentQuizStreak || 0) + 1;
          if (this.currentQuizStreak >= 3 && typeof DynamicIsland !== "undefined" && typeof DynamicIsland.flashActivity === "function") {
            DynamicIsland.flashActivity({
              id: "combo-streak",
              type: "combo",
              priority: 4,
              icon: "🔥",
              title: `Combo x${this.currentQuizStreak}!`,
              subtitle: `+${this.currentQuizStreak * 10} EXP tuyệt đỉnh`
            }, 2500);
          }
        } else {
          this.currentQuizStreak = 0;
        }
      }
    }

    this.renderQuizQuestions();
    this.renderQuizSidebarGrid();
  },

  renderQuizPagination() {
    const topCtrl = document.getElementById("quizPaginationControls");
    const bottomCtrl = document.getElementById("quizBottomPaginationControls");
    if (!this.activeSession) return;

    const displayedList = this.getFilteredQuestions();
    const totalQuestions = displayedList.length;
    const totalPages = Math.ceil(totalQuestions / this.QUESTIONS_PER_PAGE);

    if (totalPages <= 1) {
      if (topCtrl) topCtrl.innerHTML = "";
      if (bottomCtrl) bottomCtrl.innerHTML = "";
      return;
    }

    const start = this.currentPage * this.QUESTIONS_PER_PAGE;
    const end = Math.min(start + this.QUESTIONS_PER_PAGE, totalQuestions);

    // 1. Phân trang ở đầu trang (Gọn gàng)
    if (topCtrl) {
      topCtrl.innerHTML = `
        <div style="display: flex; gap: 6px; align-items: center;">
          <button class="btn btn-sm" ${this.currentPage === 0 ? 'disabled' : ''} onclick="App.changeQuizPage(${this.currentPage - 1})">← Trước</button>
          <span style="font-size: 13px; padding: 6px 10px; font-weight: 600; color: var(--text-primary);">Trang ${this.currentPage + 1}/${totalPages}</span>
          <button class="btn btn-sm" ${this.currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="App.changeQuizPage(${this.currentPage + 1})">Sau →</button>
        </div>
      `;
    }

    // 2. Phân trang ở cuối trang (Đầy đủ)
    if (bottomCtrl) {
      const prevStart = Math.max(1, start - this.QUESTIONS_PER_PAGE + 1);
      const prevEnd = start;
      const nextStart = end + 1;
      const nextEnd = Math.min(end + this.QUESTIONS_PER_PAGE, totalQuestions);

      bottomCtrl.innerHTML = `
        <button class="btn" ${this.currentPage === 0 ? 'disabled' : ''} onclick="App.changeQuizPage(${this.currentPage - 1})">
          ← Quay lại Trang trước ${this.currentPage > 0 ? `(Câu ${prevStart} – ${prevEnd})` : ''}
        </button>

        <div style="font-size: 13.5px; color: var(--text-secondary); text-align: center;">
          <strong>Trang ${this.currentPage + 1} / ${totalPages}</strong> · Hiển thị câu ${start + 1} – ${end}
        </div>

        ${this.currentPage < totalPages - 1 ? `
          <button class="btn btn-primary" onclick="App.changeQuizPage(${this.currentPage + 1})">
            Sang Trang tiếp theo (Câu ${nextStart} – ${nextEnd}) →
          </button>
        ` : `
          <button class="btn btn-success" onclick="App.submitQuiz()">
            🏁 Hoàn thành & Nộp bài thi ➔
          </button>
        `}
      `;
    }
  },

  changeQuizPage(p) {
    this.currentPage = p;
    this.renderQuizQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  confirmExitQuiz() {
    this.showConfirmDialog({
      title: "Rời khỏi phòng làm bài",
      message: "Bạn có chắc chắn muốn rời khỏi phòng làm bài không? Toàn bộ tiến trình làm bài hiện tại sẽ không được lưu.",
      icon: "🚪",
      confirmText: "Rời phòng",
      cancelText: "Tiếp tục làm",
      isDanger: true,
      warningKey: "exit_quiz",
      onConfirm: () => {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.navigateTo("home");
      }
    });
  },

  submitQuiz(isAuto = false) {
    if (!this.activeSession) return;

    const answeredCount = Object.keys(this.activeSession.answers).length;
    const total = this.activeSession.questions.length;
    const flags = this.activeSession.flags || {};
    const flaggedCount = Object.values(flags).filter(Boolean).length;

    const doSubmit = () => {
      if (this.timerInterval) clearInterval(this.timerInterval);
      const { result, details } = QuizEngine.gradeQuiz(this.activeSession);
      this.latestResultDetails = { result, details, subject: this.activeSubject };
      this.navigateTo("result");
    };

    if (isAuto) {
      doSubmit();
      return;
    }

    if (this.activeSession.mode === "exam") {
      let warningMessage = "";
      if (answeredCount < total) {
        warningMessage = `Bạn mới hoàn thành <strong>${answeredCount}/${total}</strong> câu hỏi`;
        if (flaggedCount > 0) {
          warningMessage += ` và đang có <strong>${flaggedCount} câu đã đặt cờ 🚩</strong> cần xem lại.`;
        } else {
          warningMessage += `.`;
        }
        warningMessage += `<br>Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?`;
      } else if (flaggedCount > 0) {
        warningMessage = `Bạn đang có <strong>${flaggedCount} câu hỏi đã đặt cờ 🚩</strong> cần xem lại.<br>Bạn có chắc chắn muốn hoàn thành và nộp bài thi không?`;
      }

      if (warningMessage) {
        this.showConfirmDialog({
          title: "Xác nhận nộp bài thi",
          message: warningMessage,
          icon: "📝",
          confirmText: "Nộp bài ngay",
          cancelText: "Xem lại bài",
          warningKey: "submit_early",
          onConfirm: doSubmit
        });
        return;
      }
    }

    doSubmit();
  }
});
