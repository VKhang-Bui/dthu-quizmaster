/**
 * PARSER VIEW MODULE
 * Giao diện bóc tách đề thi tự động (Smart Parser): Upload file, live preview, xuất JSON.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  renderParserView(container, preselectedSubjectId) {
    if (!StorageService.isLoggedIn()) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="color: var(--text-tertiary); margin-bottom: 14px; display:flex; justify-content:center;">${Icons.get('upload', 52)}</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Công Cụ Nhập Đề & Đóng Góp Đề Thi</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Vui lòng đăng nhập tài khoản để sử dụng công cụ bóc tách câu hỏi thông minh và gửi đóng góp đề thi lên hệ thống (+30 EXP).
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 22px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('key', 14)} <span>Đăng Nhập Ngay</span> ${Icons.get('arrowRight', 12)}</button>
            <button class="btn" onclick="App.navigateTo('home')" style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('home', 14)} <span>Về Trang Chủ</span></button>
          </div>
        </div>
      `;
      return;
    }

    const subjects = StorageService.getSubjects();
    const defaultSubId = preselectedSubjectId || (subjects[0] ? subjects[0].id : "");

    container.innerHTML = `
      <div class="view-parser">
        <!-- Top Navigation Header -->
        <div class="parser-top-header">
          <div class="parser-top-left">
            <button class="btn btn-sm btn-back-nav" onclick="App.navigateBackOrHome()" title="Quay lại trang trước" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('chevronLeft', 13)} <span>Quay Lại</span>
            </button>
            <div class="parser-header-title-box">
              <h2 style="display:flex; align-items:center; gap:8px;">${Icons.get('upload', 22)} <span>Công Cụ Nhập & Bóc Tách Đề Thi Tự Động</span></h2>
              <p>Tải tệp tin (.docx Word, .pdf text, .txt, .md) hoặc Dán văn bản trắc nghiệm để trích xuất đề thi thông minh</p>
            </div>
          </div>
          <div class="parser-top-right">
            <button class="btn btn-sm btn-primary" onclick="App.navigateTo('syntax-guide', { from: 'parser', subjectId: '${defaultSubId}' })" style="display:inline-flex; align-items:center; gap:6px;">
              ${Icons.get('helpCircle', 14)} <span>Cú pháp ký tự</span> ${Icons.get('arrowRight', 12)}
            </button>
          </div>
        </div>

        <div class="parser-main-layout" id="parserMainLayout">
          <!-- Left Panel: Raw Input & File Upload Area -->
          <div class="parser-panel parser-left-panel" id="parserLeftPanel" ondragover="App.handleParserDragOver(event)" ondragleave="App.handleParserDragLeave(event)" ondrop="App.handleParserFileDrop(event)">
            <div class="parser-panel-header">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h3 style="display:flex; align-items:center; gap:6px;">${Icons.get('upload', 16)} <span>1. Nhập hoặc Tải Tệp Đề</span></h3>
                <span id="parserFileLoadedBadge" class="badge badge-blue" style="display: none; font-size: 11px;"></span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <input type="file" id="parserFileInput" accept=".txt,.docx,.pdf,.md,.json,.csv,.text" style="display: none;" onchange="App.handleParserFileUpload(event)">
                <button class="btn btn-sm btn-upload-doc" onclick="document.getElementById('parserFileInput').click()" title="Tải tệp Word (.docx), PDF hoặc TXT" style="display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.get('upload', 13)} <span>Tải tệp lên</span>
                </button>
                <button class="btn btn-sm" onclick="App.loadParserSampleText()">Dán mẫu</button>
                <button class="btn btn-sm" onclick="App.clearParserInput()">Xóa</button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Chọn môn học cần nạp (*):</label>
                <select id="parserSubjectSelect" class="form-control" onchange="App.onParserSubjectChange()">
                  ${subjects.map(s => `<option value="${s.id}" ${s.id === defaultSubId ? 'selected' : ''}>${s.name} (${s.code || s.id})</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Gán vào chương:</label>
                <select id="parserChapterSelect" class="form-control">
                  <option value="c1">Chương 1</option>
                </select>
              </div>
            </div>

            <!-- Drag & Drop Hint Dropzone Bar -->
            <div class="parser-drop-hint" id="parserDropzone" onclick="document.getElementById('parserFileInput').click()" style="display:flex; align-items:center; gap:6px;">
              <span>${Icons.get('upload', 14)} Kéo thả tệp tin hoặc bấm vào đây để nạp: <strong>.docx (Word)</strong>, <strong>.pdf (Text)</strong>, <strong>.txt</strong>, <strong>.md</strong></span>
            </div>

            <textarea id="rawTextarea" class="parser-textarea" placeholder="Dán văn bản câu hỏi từ Word, PDF, ChatGPT hoặc Kéo thả tệp tin vào đây...

Hỗ trợ mọi định dạng phổ biến:
1. Kiểu chuẩn:
Câu 1: Nội dung câu hỏi ở đây?
A. Lựa chọn A
B. Lựa chọn B
C. Lựa chọn C
D. Lựa chọn D
Đáp án: A
Giải thích: Lý do vì sao đáp án A đúng...

2. Hoặc kiểu có giải thích từng câu:
Câu 2: Theo nghĩa rộng, **CNXHKH** được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Giải thích A
* B. Hệ tư tưởng của riêng giai cấp tư sản > Sai: Giải thích B
* C. Một nhánh nhỏ độc lập > Sai: Giải thích C
* D. Chỉ bao gồm bộ phận KTCT > Sai: Giải thích D" oninput="App.onParserInput(false, true)"></textarea>

            <div style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
              <span style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('sparkles', 13)} <span><strong>Mẹo:</strong> Hỗ trợ in đậm <code>**text**</code>, in nghiêng <code>*text*</code>, công thức <code>\`code\`</code> và mọi ký tự đặc biệt.</span></span>
              <a href="javascript:void(0)" onclick="App.navigateTo('syntax-guide', { from: 'parser', subjectId: '${defaultSubId}' })" style="font-weight: 700; color: var(--brand-primary); text-decoration: underline; display:inline-flex; align-items:center; gap:3px;"><span>Cú pháp ký tự</span> ${Icons.get('arrowRight', 11)}</a>
            </div>

            <button class="btn btn-primary" onclick="App.onParserInput(true)" style="display:inline-flex; align-items:center; gap:6px;">
              ${Icons.get('zap', 14)} <span>Bóc tách & Phân tích lại</span>
            </button>
          </div>

          <!-- Draggable Splitter Resizer Handle -->
          <div class="parser-resizer" id="parserResizer" title="Kéo chuột để điều chỉnh độ rộng 2 khung (Nháy đúp để cân bằng 50/50)"></div>

          <!-- Right Panel: Live Parsed Preview & Actions -->
          <div class="parser-panel parser-right-panel" id="parserRightPanel">
            <div class="parser-panel-header">
              <h3 style="display:flex; align-items:center; gap:6px;">${Icons.get('target', 16)} <span>2. Xem trước kết quả bóc tách</span></h3>
              <span class="badge badge-green" id="parserCounterBadge">0 câu hỏi hợp lệ</span>
            </div>

            <div class="parser-preview-list" id="parserPreviewList">
              <div style="text-align: center; padding: 48px 20px; color: var(--text-tertiary);">
                Vui lòng tải tệp hoặc dán văn bản câu hỏi ở khung bên trái để xem kết quả phân tích tự động.
              </div>
            </div>

            <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-primary" id="btnSaveToSubject" onclick="App.saveParsedQuestionsToDraft()" disabled style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('checkCircle', 14)} <span>Lưu Bộ Đề Vào Hệ Thống (Chờ Duyệt)</span> ${Icons.get('arrowRight', 12)}
              </button>
              <button class="btn" id="btnDownloadJson" onclick="App.downloadParsedAsJson()" disabled style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('download', 14)} <span>Tải file JSON</span>
              </button>
              <button class="btn" id="btnCopyJson" onclick="App.copyParsedJsonToClipboard()" disabled style="display:inline-flex; align-items:center; gap:6px;">
                ${Icons.get('copy', 14)} <span>Sao chép JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Khởi tạo thanh kéo điều chỉnh kích thước 2 cột
    this.initParserResizer();

    // Cập nhật danh sách chương theo môn được chọn
    this.onParserSubjectChange();
  },

  async handleParserFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    await this.processParserFile(file);
    event.target.value = "";
  },

  handleParserDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById("parserDropzone");
    if (dropzone) dropzone.classList.add("dragover");
  },

  handleParserDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById("parserDropzone");
    if (dropzone) dropzone.classList.remove("dragover");
  },

  async handleParserFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById("parserDropzone");
    if (dropzone) dropzone.classList.remove("dragover");

    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    await this.processParserFile(file);
  },

  async processParserFile(file) {
    try {
      this.showToast(`⏳ Đang trích xuất nội dung từ tệp "${file.name}"...`, "info", 2500);
      const text = await SmartParserService.extractTextFromFile(file);
      
      const textarea = document.getElementById("rawTextarea");
      if (textarea) {
        textarea.value = text;
      }

      const badge = document.getElementById("parserFileLoadedBadge");
      if (badge) {
        badge.style.display = "inline-flex";
        badge.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      }

      this.showToast(`📄 Đã nạp thành công dữ liệu thô từ "${file.name}"! Bấm "Bóc tách & Phân tích lại" để xử lý.`, "info", 4000);
    } catch (err) {
      console.error("processParserFile error:", err);
      this.showToast(`❌ Lỗi: ${err.message}`, "danger", 4500);
    }
  },

  saveParsedQuestionsToDraft() {
    if (!this.currentParsedQuestions || this.currentParsedQuestions.length === 0) {
      this.showToast("⚠️ Chưa có câu hỏi nào để lưu!", "warning");
      return;
    }

    const invalidQuestions = this.currentParsedQuestions.filter(q => q.answerIndex === -1 || q.warning !== null);
    if (invalidQuestions.length > 0) {
      this.showToast(`❌ Không thể lưu: Có ${invalidQuestions.length} câu hỏi chưa có đáp án đúng hoặc bị xung đột. Vui lòng sửa hết trước khi lưu!`, "danger", 5000);
      return;
    }

    const subId = document.getElementById("parserSubjectSelect")?.value;
    const chapterId = document.getElementById("parserChapterSelect")?.value || "c1";
    const sub = StorageService.getSubjectById(subId);
    const profile = StorageService.getUserProfile();

    const mappedQuestions = this.currentParsedQuestions.map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
      chapterId: chapterId
    }));

    const draftData = {
      targetSubjectId: sub ? sub.id : null,
      targetChapterId: chapterId,
      code: sub ? sub.code : "GEN101",
      name: sub ? sub.name : "Bộ đề mới",
      department: sub ? sub.department : profile.department,
      author: profile.fullName + ` (MSSV: ${profile.studentId || 'Shinora'})`,
      authorEmail: profile.email || "",
      description: `Bộ đề gồm ${mappedQuestions.length} câu hỏi môn ${sub ? sub.name : ''} (Chương: ${chapterId}), nhập qua Parser ngày ${new Date().toLocaleDateString('vi-VN')}.`,
      icon: sub ? (sub.icon || "📝") : "📝",
      chapters: sub && sub.chapters ? sub.chapters : [{ id: "c1", name: "Chương 1: Mở đầu" }],
      questions: mappedQuestions
    };

    StorageService.addDraftSubject(draftData);

    this.showToast(`🎉 Đã lưu ${mappedQuestions.length} câu hỏi vào danh sách Chờ Phê Duyệt! (Điểm Cống Hiến CP sẽ được trao khi Ban biên tập phê duyệt đề).`, "success", 4500);
    this.renderHeader();

    // Tự động chuyển sang trang Quản Lý Bộ Đề, tab "Chờ duyệt"
    this.adminSubjectTab = "drafts";
    this.navigateTo("manage");
  },

  onParserSubjectChange() {
    const subId = document.getElementById("parserSubjectSelect")?.value;
    const sub = StorageService.getSubjectById(subId);
    const chapterSelect = document.getElementById("parserChapterSelect");
    if (!sub || !chapterSelect) return;

    if (sub.chapters && sub.chapters.length > 0) {
      chapterSelect.innerHTML = sub.chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } else {
      chapterSelect.innerHTML = `<option value="c1">Chương 1</option>`;
    }
  },

  findActiveQuestionIndexAtCursor(text, cursorPos) {
    if (!text || cursorPos <= 0) return 0;
    const textBefore = text.slice(0, cursorPos);
    const headerRegex = /(?:^|\n)\s*(?:(?:\*{0,2}(?:Câu|Bài|Question)\s*\d+[\s\.:\*\-\]]+|\b\d+\s*[\.)]\s+|\[(?:Câu\s*)?\d+\]))/gi;
    let match;
    let count = 0;
    while ((match = headerRegex.exec(textBefore)) !== null) {
      count++;
    }
    return Math.max(0, count - 1);
  },

  onParserInput(isManual = false, isTypingEdit = false) {
    let raw = document.getElementById("rawTextarea")?.value || "";
    const chapterId = document.getElementById("parserChapterSelect")?.value || "c1";

    if (isManual) {
      const textarea = document.getElementById("rawTextarea");
      if (textarea && raw.trim()) {
        const cleanedText = SmartParserService.formatExtractedDocumentText(raw);
        if (cleanedText && cleanedText.trim() !== raw.trim()) {
          textarea.value = cleanedText;
          raw = cleanedText;
        }
      }
    }

    const { questions, warnings, errors, totalParsed } = SmartParserService.parseRawText(raw, chapterId);
    this.currentParsedQuestions = questions;

    if (isManual) {
      if (totalParsed > 0) {
        this.showToast(`🎉 Đã bóc tách và chuẩn hóa lại ${totalParsed} câu hỏi thành công!`, "success", 3000);
      } else {
        this.showToast("⚠️ Chưa nhận diện được câu hỏi nào. Vui lòng kiểm tra lại định dạng!", "warning", 3000);
      }
    }

    const badge = document.getElementById("parserCounterBadge");
    const previewList = document.getElementById("parserPreviewList");
    const btnSave = document.getElementById("btnSaveToSubject");
    const btnDownload = document.getElementById("btnDownloadJson");
    const btnCopy = document.getElementById("btnCopyJson");
    const btnContribute = document.getElementById("btnContribute");

    this.parserFilter = this.parserFilter || 'all';
    this.parserSearchQuery = this.parserSearchQuery || '';
    const invalidQuestions = questions.filter(q => q.answerIndex === -1 || q.warning !== null);
    const hasError = invalidQuestions.length > 0;
    const validCount = totalParsed - invalidQuestions.length;

    if (badge) {
      if (hasError) {
        badge.innerHTML = `<span style="color: #ef4444; font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> ${totalParsed} câu (${invalidQuestions.length} câu cần sửa)</span>`;
      } else {
        badge.innerHTML = `<span style="color: var(--success); font-weight: 700;"><i class="fa-solid fa-circle-check"></i> ${totalParsed} câu hỏi hợp lệ (Đủ điều kiện lưu)</span>`;
      }
    }

    if (totalParsed === 0) {
      if (previewList) {
        previewList.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; color: var(--text-tertiary);">
            Chưa nhận diện được câu hỏi nào. Vui lòng kiểm tra lại định dạng câu hỏi (Ví dụ: <code>Câu 1: ... A. ... B. ... Đáp án: A</code>).
          </div>
        `;
      }
      if (btnSave) btnSave.disabled = true;
      if (btnDownload) btnDownload.disabled = true;
      if (btnCopy) btnCopy.disabled = true;
      if (btnContribute) btnContribute.disabled = true;
      return;
    }

    if (btnSave) {
      btnSave.disabled = hasError;
      if (hasError) {
        btnSave.title = `Có ${invalidQuestions.length} câu hỏi chưa có đáp án hoặc bị xung đột. Vui lòng sửa hết trước khi lưu!`;
      } else {
        btnSave.title = "Lưu bộ đề vào hệ thống";
      }
    }
    if (btnDownload) btnDownload.disabled = false;
    if (btnCopy) btnCopy.disabled = false;
    if (btnContribute) btnContribute.disabled = false;

    if (previewList) {
      // 1. Ô Tìm Kiếm Câu Hỏi Thông Minh
      const searchBoxHtml = `
        <div class="parser-search-box" style="position: relative; margin-bottom: 10px;">
          <div style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); pointer-events: none; display: flex; align-items: center;">
            <i class="fa-solid fa-magnifying-glass" style="font-size: 13px;"></i>
          </div>
          <input 
            type="text" 
            id="parserSearchInput" 
            class="form-control" 
            placeholder="Tìm kiếm số câu (VD: 20), từ khóa đề bài, đáp án..." 
            value="${(this.parserSearchQuery || '').replace(/"/g, '&quot;')}"
            oninput="App.onParserSearchInput(this.value)"
            style="padding-left: 34px; padding-right: 32px; font-size: 12.5px; border-radius: 8px; height: 36px; background: var(--bg-primary); border: 1px solid var(--border);"
          />
          ${this.parserSearchQuery ? `
            <button 
              type="button" 
              onclick="App.clearParserSearch()" 
              style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 4px; display: flex; align-items: center; font-size: 13px;"
              title="Xóa tìm kiếm"
            >
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          ` : ''}
        </div>
      `;

      // 2. Thanh Bộ Lọc Câu Hỏi Trực Quan (Tabs: Tất cả / Cần sửa / Hợp lệ)
      const filterBarHtml = `
        <div class="parser-filter-bar" style="display: flex; gap: 6px; margin-bottom: 12px; padding: 4px; background: var(--bg-secondary, #f8fafc); border: 1px solid var(--border); border-radius: 8px; font-size: 12px;">
          <button type="button" onclick="App.setParserFilter('all')" style="flex: 1; padding: 6px 10px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; background: ${this.parserFilter === 'all' ? 'var(--brand-primary, #2563eb)' : 'transparent'}; color: ${this.parserFilter === 'all' ? '#fff' : 'var(--text-secondary)'}; transition: all 0.2s;">
            Tất cả (${totalParsed})
          </button>
          <button type="button" onclick="App.setParserFilter('issues')" style="flex: 1; padding: 6px 10px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; background: ${this.parserFilter === 'issues' ? '#ef4444' : 'transparent'}; color: ${this.parserFilter === 'issues' ? '#fff' : (invalidQuestions.length > 0 ? '#ef4444' : 'var(--text-secondary)')}; transition: all 0.2s;">
            <i class="fa-solid fa-triangle-exclamation"></i> Cần sửa (${invalidQuestions.length})
          </button>
          <button type="button" onclick="App.setParserFilter('valid')" style="flex: 1; padding: 6px 10px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; background: ${this.parserFilter === 'valid' ? 'var(--success, #10b981)' : 'transparent'}; color: ${this.parserFilter === 'valid' ? '#fff' : 'var(--text-secondary)'}; transition: all 0.2s;">
            <i class="fa-solid fa-circle-check"></i> Hợp lệ (${validCount})
          </button>
        </div>
      `;

      // 3. Banner Cảnh Báo Thu Gọn (Collapsible Accordion)
      let warningBannerHtml = "";
      if (warnings && warnings.length > 0) {
        warningBannerHtml = `
          <details class="parser-warning-accordion" style="margin-bottom: 12px; padding: 8px 12px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; color: #dc2626; font-size: 12px;">
            <summary style="font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i> Cảnh báo: ${warnings.length} câu hỏi cần kiểm tra đáp án
              </span>
              <span style="font-size: 11px; opacity: 0.85; font-weight: 600; text-decoration: underline;">Xem danh sách / Thu gọn</span>
            </summary>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(239, 68, 68, 0.2); max-height: 120px; overflow-y: auto; line-height: 1.6;">
              ${warnings.map(w => `<div style="cursor: pointer; padding: 2px 0;" onclick="App.scrollTextareaToQuestionText('${w.replace(/'/g, "\\'")}')" title="Nhấp để cuộn đến câu này">• ${w}</div>`).join('')}
            </div>
          </details>
        `;
      }

      // 4. Lọc danh sách câu hỏi theo tab đang chọn và từ khóa tìm kiếm
      let displayedQuestions = questions.map((q, idx) => ({ ...q, originalIndex: idx }));
      if (this.parserFilter === 'issues') {
        displayedQuestions = displayedQuestions.filter(q => q.answerIndex === -1 || q.warning !== null);
      } else if (this.parserFilter === 'valid') {
        displayedQuestions = displayedQuestions.filter(q => q.answerIndex >= 0 && q.warning === null);
      }

      if (this.parserSearchQuery && this.parserSearchQuery.trim()) {
        const qClean = this.parserSearchQuery.trim().toLowerCase();
        displayedQuestions = displayedQuestions.filter(q => {
          const qNumStr = (q.originalIndex + 1).toString();
          if (qClean === qNumStr || qClean === `câu ${qNumStr}` || qClean === `#${qNumStr}`) return true;
          if (q.question && q.question.toLowerCase().includes(qClean)) return true;
          if (q.options && q.options.some(opt => 
            (opt.text && opt.text.toLowerCase().includes(qClean)) || 
            (opt.note && opt.note.toLowerCase().includes(qClean))
          )) return true;
          return false;
        });
      }

      let cardsHtml = "";
      if (displayedQuestions.length === 0) {
        cardsHtml = `
          <div style="text-align: center; padding: 32px 16px; color: var(--text-tertiary); font-size: 13px;">
            ${this.parserSearchQuery ? `🔍 Không tìm thấy câu hỏi nào phù hợp với từ khóa "<strong>${this.parserSearchQuery}</strong>".` : (this.parserFilter === 'issues' ? '🎉 Tuyệt vời! Không có câu hỏi nào bị lỗi.' : 'Chưa có câu hỏi nào trong danh mục này.')}
          </div>
        `;
      } else {
        cardsHtml = displayedQuestions.map(q => {
          const idx = q.originalIndex;
          let warnBoxHtml = "";
          let cardBorderStyle = "";
          if (q.warning) {
            if (q.warning.type === "missing_answer") {
              cardBorderStyle = "border-color: rgba(239, 68, 68, 0.4);";
              warnBoxHtml = `
                <div style="display: flex; align-items: center; gap: 6px; padding: 6px 10px; margin-bottom: 8px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 4px; color: #dc2626; font-size: 11.5px; font-weight: 600;">
                  <i class="fa-solid fa-triangle-exclamation"></i> ${q.warning.message}
                </div>
              `;
            } else {
              cardBorderStyle = "border-color: rgba(239, 68, 68, 0.4);";
              warnBoxHtml = `
                <div style="display: flex; align-items: center; gap: 6px; padding: 6px 10px; margin-bottom: 8px; background: rgba(239, 68, 68, 0.12); border-left: 3px solid #ef4444; border-radius: 4px; color: #dc2626; font-size: 11.5px; font-weight: 600;">
                  <i class="fa-solid fa-circle-exclamation"></i> ${q.warning.message}
                </div>
              `;
            }
          }

          const hasValidAnswer = q.answerIndex >= 0 && q.answerIndex < q.options.length;
          const answerBadgeHtml = hasValidAnswer
            ? `<span style="font-size: 11.5px; font-weight: 700; color: var(--success);">Đáp án: ${this.letters[q.answerIndex]}</span>`
            : `<span style="font-size: 11.5px; font-weight: 700; color: #ef4444;"><i class="fa-solid fa-circle-xmark"></i> Chưa có đáp án</span>`;

          return `
            <div class="preview-card" id="parserPreviewCard-${idx}" data-q-index="${idx}" onclick="App.scrollTextareaToQuestion(${idx})" style="${cardBorderStyle} cursor: pointer; transition: all 0.2s;" title="Nhấp vào thẻ để cuộn đến câu này trong ô soạn thảo">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge ${q.warning ? 'badge-danger' : 'badge-gray'}">Câu ${idx + 1}</span>
                ${answerBadgeHtml}
              </div>
              ${warnBoxHtml}
              <div class="preview-card-title">${SmartParserService.formatRichText(q.question)}</div>
              <div>
                ${q.options.map((opt, oi) => `
                  <div class="preview-opt-item ${oi === q.answerIndex ? 'is-correct' : ''}" onclick="event.stopPropagation(); App.setQuestionAnswerDirectly(${idx}, ${oi})" style="cursor: pointer; padding: 5px 8px; border-radius: 6px; margin-bottom: 4px; transition: all 0.15s;" title="Nhấp để chọn đáp án [${this.letters[oi]}]">
                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                      <i class="${oi === q.answerIndex ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}" style="color: ${oi === q.answerIndex ? 'var(--success)' : 'var(--text-tertiary)'}; font-size: 12.5px;"></i>
                      <strong>${this.letters[oi]}.</strong> ${SmartParserService.formatRichText(opt.text)}
                    </span>
                    ${opt.note ? `<div style="font-size: 11.5px; opacity: 0.85; margin-left: 20px; margin-top: 2px;">↳ <em>${SmartParserService.formatRichText(opt.note)}</em></div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('');
      }

      previewList.innerHTML = searchBoxHtml + filterBarHtml + warningBannerHtml + cardsHtml;

      // Tự động cuộn đến câu hỏi đang chỉnh sửa khi người dùng đang nhập văn bản/edit/cut/paste
      if (isTypingEdit) {
        const textarea = document.getElementById("rawTextarea");
        const cursorPos = textarea ? (textarea.selectionStart || 0) : 0;
        const activeQIndex = this.findActiveQuestionIndexAtCursor(raw, cursorPos);
        const activeCard = document.getElementById(`parserPreviewCard-${activeQIndex}`);

        if (activeCard && previewList) {
          activeCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
          activeCard.style.transition = "border-color 0.25s, box-shadow 0.25s";
          activeCard.style.borderColor = "var(--brand-primary)";
          activeCard.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.3)";
          
          clearTimeout(this._activeCardHighlightTimer);
          this._activeCardHighlightTimer = setTimeout(() => {
            if (activeCard) {
              activeCard.style.borderColor = "";
              activeCard.style.boxShadow = "";
            }
          }, 1200);
        }
      }
    }
  },

  loadParserSampleText() {
    const sample = `Câu 1: Theo nghĩa rộng, **Chủ nghĩa xã hội khoa học** (CNXHKH) được hiểu là gì?
<u>A.</u> Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Theo nghĩa rộng, CNXHKH chính là toàn bộ chủ nghĩa Mác - Lênin (Triết học, KTCT và CNXHKH).
B. Hệ tư tưởng của riêng giai cấp "tư sản" > Sai: CNXHKH là hệ tư tưởng của giai cấp công nhân.
C. Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác > Sai: CNXHKH là bộ phận cốt lõi của chủ nghĩa Mác - Lênin.
D. Chỉ bao gồm bộ phận Kinh tế chính trị Mác - Lênin > Sai: Đây chỉ là một bộ phận hợp thành.

Câu 2: Công thức nào sau đây biểu thị đúng điều kiện cân bằng trong điều kiện kinh tế: \`P * Q = M * V\` và so sánh \`a < b & c > d\`?
A. Điều kiện kinh tế số 1 với $100% tỷ lệ #thành_công
* B. Phương trình \`P * Q = M * V\` và biểu thức so sánh (a < b & c > d) > Đúng: Hỗ trợ 100% ký tự toán học, code và dấu đặc biệt!
C. Ký hiệu @author: Shina Sanora &amp; Shinora Community
D. Biểu thức 'chuỗi ký tự đặc biệt': "100% chính xác?" / [Ghi chú]

Câu 3: Phát kiến vĩ đại nào của *C. Mác* và *Ph. Ăng-ghen* tạo tiền đề để luận chứng sự ra đời của CNXHKH?
A. Định luật vạn vật hấp dẫn
B. Thuyết tương đối của Einstein
C. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư [Đúng]
D. Thuyết chọn lọc tự nhiên của Darwin`;

    const textarea = document.getElementById("rawTextarea");
    if (textarea) {
      textarea.value = sample;
      this.onParserInput(true);
    }
  },

  clearParserInput() {
    const textarea = document.getElementById("rawTextarea");
    if (textarea) {
      textarea.value = "";
      this.onParserInput();
    }
  },

  saveParsedQuestionsToSubject() {
    const subId = document.getElementById("parserSubjectSelect")?.value;
    const sub = StorageService.getSubjectById(subId);
    if (!sub || this.currentParsedQuestions.length === 0) return;

    if (!sub.questions) sub.questions = [];
    sub.questions.push(...this.currentParsedQuestions);

    StorageService.saveSubject(sub);
    this.showToast(`🎉 Đã thêm ${this.currentParsedQuestions.length} câu hỏi mới vào môn "${sub.name}"!`, "success", 3500);
    this.navigateTo("subject-detail", { subjectId: sub.id });
  },

  downloadParsedAsJson() {
    if (this.currentParsedQuestions.length === 0) return;

    const subId = document.getElementById("parserSubjectSelect")?.value || "custom";
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.currentParsedQuestions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ngan-hang-cau-hoi-${subId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  copyParsedJsonToClipboard() {
    if (this.currentParsedQuestions.length === 0) return;
    const jsonStr = JSON.stringify(this.currentParsedQuestions, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      this.showToast("📋 Đã sao chép toàn bộ mã JSON câu hỏi vào Clipboard!", "success", 3000);
    }).catch(err => {
      this.showToast("Không thể sao chép: " + err, "danger", 3000);
    });
  },

  setParserFilter(filter) {
    this.parserFilter = filter || 'all';
    this.onParserInput(false, false);
  },

  setQuestionAnswerDirectly(questionIndex, optionIndex) {
    const textarea = document.getElementById("rawTextarea");
    if (!textarea) return;

    const text = textarea.value;
    const headerRegex = /(?:^|\n)\s*(?:(?:\*{0,2}(?:Câu|Bài|Question)\s*\d+[\s\.:\*\-\]]+|\b\d+\s*[\.)]\s+|\[(?:Câu\s*)?\d+\]))/gi;
    const blockRanges = [];
    let match;
    while ((match = headerRegex.exec(text)) !== null) {
      blockRanges.push(match.index);
    }

    if (questionIndex >= blockRanges.length) return;

    const startPos = blockRanges[questionIndex];
    const endPos = (questionIndex + 1 < blockRanges.length) ? blockRanges[questionIndex + 1] : text.length;
    const blockText = text.substring(startPos, endPos);

    const lines = blockText.split("\n");
    let currentOptIdx = -1;
    const optRegex = /^\s*(?:\*\s*)?\[?([A-Ea-eĐđ])\]?[\.\)\:\*\_]\s+/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const optMatch = line.match(optRegex);
      if (optMatch) {
        currentOptIdx++;
        let cleanLine = line.replace(/^\s*\*+\s*/, "");
        cleanLine = cleanLine.replace(/\s*>\s*(?:đúng|đ|true|chính xác|sai|s|false|chưa đúng)\b(?:\s*:[^>\n]*)?/gi, "").trim();

        if (currentOptIdx === optionIndex) {
          cleanLine = cleanLine + " > Đúng";
        }
        lines[i] = cleanLine;
      }
    }

    const updatedBlockText = lines.join("\n");
    textarea.value = text.substring(0, startPos) + updatedBlockText + text.substring(endPos);

    // Kích hoạt re-parse xem trước
    this.onParserInput(false, false);

    // Tự động cuộn textarea đến câu hỏi vừa sửa
    this.scrollTextareaToQuestion(questionIndex);
    const letter = this.letters[optionIndex] || "A";
    this.showToast(`🎯 Đã chọn đáp án [${letter}] cho Câu ${questionIndex + 1}!`, "success", 2000);
  },

  scrollTextareaToQuestion(questionIndex) {
    const textarea = document.getElementById("rawTextarea");
    if (!textarea) return;

    const text = textarea.value;
    const headerRegex = /(?:^|\n)\s*(?:(?:\*{0,2}(?:Câu|Bài|Question)\s*\d+[\s\.:\*\-\]]+|\b\d+\s*[\.)]\s+|\[(?:Câu\s*)?\d+\]))/gi;
    let match;
    let count = 0;
    let targetPos = 0;

    while ((match = headerRegex.exec(text)) !== null) {
      if (count === questionIndex) {
        targetPos = match.index;
        break;
      }
      count++;
    }

    textarea.focus();
    textarea.setSelectionRange(targetPos, targetPos);

    const textBefore = text.substring(0, targetPos);
    const lineCountBefore = textBefore.split("\n").length;
    const totalLines = text.split("\n").length;
    const approxScrollTop = (lineCountBefore / totalLines) * textarea.scrollHeight;

    textarea.scrollTo({
      top: Math.max(0, approxScrollTop - 40),
      behavior: "smooth"
    });
  },

  scrollTextareaToQuestionText(warningMessage) {
    const qNumMatch = warningMessage.match(/(?:Câu|Bài|Question)\s*(\d+)/i);
    if (qNumMatch) {
      const qNum = parseInt(qNumMatch[1], 10);
      if (!isNaN(qNum) && qNum > 0) {
        this.scrollTextareaToQuestion(qNum - 1);
      }
    }
  },

  onParserSearchInput(query) {
    this.parserSearchQuery = query || "";
    this.onParserInput(false, false);
    const input = document.getElementById("parserSearchInput");
    if (input) {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  },

  clearParserSearch() {
    this.parserSearchQuery = "";
    this.onParserInput(false, false);
    const input = document.getElementById("parserSearchInput");
    if (input) {
      input.value = "";
      input.focus();
    }
  },

  /**
   * Khởi tạo thanh kéo điều chỉnh độ rộng linh hoạt giữa Khung Nhập Đề và Khung Xem Trước
   */
  initParserResizer() {
    const layout = document.getElementById("parserMainLayout");
    const resizer = document.getElementById("parserResizer");
    const leftPanel = document.getElementById("parserLeftPanel");
    const rightPanel = document.getElementById("parserRightPanel");
    if (!layout || !resizer || !leftPanel || !rightPanel) return;

    // Khôi phục tỷ lệ đã lưu hoặc mặc định 52%
    let savedRatio = parseFloat(localStorage.getItem("shinora_parser_split_ratio"));
    if (isNaN(savedRatio) || savedRatio < 20 || savedRatio > 80) {
      savedRatio = 52;
    }

    const applyRatio = (ratio) => {
      if (window.innerWidth > 900) {
        layout.style.setProperty("--parser-left-width", `${ratio}%`);
      } else {
        layout.style.removeProperty("--parser-left-width");
      }
    };

    applyRatio(savedRatio);

    let isDragging = false;

    const onStart = (e) => {
      if (window.innerWidth <= 900) return;
      isDragging = true;
      resizer.classList.add("is-dragging");
      document.body.classList.add("is-resizing-parser");
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const rect = layout.getBoundingClientRect();
      if (rect.width <= 0) return;

      const clientX = (e.type && e.type.includes("touch") && e.touches && e.touches[0]) 
        ? e.touches[0].clientX 
        : e.clientX;
      const offsetLeft = clientX - rect.left;

      // Giới hạn tối thiểu 300px cho cả 2 bên
      const minPixels = 300;
      const minPercent = Math.max(22, (minPixels / rect.width) * 100);
      const maxPercent = Math.min(78, ((rect.width - minPixels) / rect.width) * 100);

      let ratio = (offsetLeft / rect.width) * 100;
      if (ratio < minPercent) ratio = minPercent;
      if (ratio > maxPercent) ratio = maxPercent;

      applyRatio(ratio);
      localStorage.setItem("shinora_parser_split_ratio", ratio.toFixed(1));
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      resizer.classList.remove("is-dragging");
      document.body.classList.remove("is-resizing-parser");
    };

    const onDoubleClick = () => {
      applyRatio(50);
      localStorage.setItem("shinora_parser_split_ratio", "50");
    };

    resizer.addEventListener("mousedown", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);

    resizer.addEventListener("touchstart", onStart, { passive: false });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);

    resizer.addEventListener("dblclick", onDoubleClick);
  }
});
