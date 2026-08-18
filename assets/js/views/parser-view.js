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

        <div class="parser-main-layout">
          <!-- Left Panel: Raw Input & File Upload Area -->
          <div class="parser-panel" id="parserDropzone" ondragover="App.handleParserDragOver(event)" ondragleave="App.handleParserDragLeave(event)" ondrop="App.handleParserFileDrop(event)">
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
            <div class="parser-drop-hint" onclick="document.getElementById('parserFileInput').click()" style="display:flex; align-items:center; gap:6px;">
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
* D. Chỉ bao gồm bộ phận KTCT > Sai: Giải thích D" oninput="App.onParserInput()"></textarea>

            <div style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
              <span style="display:inline-flex; align-items:center; gap:4px;">${Icons.get('sparkles', 13)} <span><strong>Mẹo:</strong> Hỗ trợ in đậm <code>**text**</code>, in nghiêng <code>*text*</code>, công thức <code>\`code\`</code> và mọi ký tự đặc biệt.</span></span>
              <a href="javascript:void(0)" onclick="App.navigateTo('syntax-guide', { from: 'parser', subjectId: '${defaultSubId}' })" style="font-weight: 700; color: var(--brand-primary); text-decoration: underline; display:inline-flex; align-items:center; gap:3px;"><span>Cú pháp ký tự</span> ${Icons.get('arrowRight', 11)}</a>
            </div>

            <button class="btn btn-primary" onclick="App.onParserInput(true)" style="display:inline-flex; align-items:center; gap:6px;">
              ${Icons.get('zap', 14)} <span>Bóc tách & Phân tích lại</span>
            </button>
          </div>

          <!-- Right Panel: Live Parsed Preview & Actions -->
          <div class="parser-panel">
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

      this.onParserInput(true);
      const count = this.currentParsedQuestions ? this.currentParsedQuestions.length : 0;
      if (count > 0) {
        this.showToast(`🎉 Đã trích xuất thành công ${count} câu hỏi từ tệp "${file.name}"!`, "success", 4000);
      } else {
        this.showToast(`ℹ️ Đã nạp nội dung tệp. Vui lòng kiểm tra lại cấu trúc câu hỏi.`, "info", 3500);
      }
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

  onParserInput(isManual = false) {
    const raw = document.getElementById("rawTextarea")?.value || "";
    const chapterId = document.getElementById("parserChapterSelect")?.value || "c1";

    const { questions, warnings, errors, totalParsed } = SmartParserService.parseRawText(raw, chapterId);
    this.currentParsedQuestions = questions;

    const badge = document.getElementById("parserCounterBadge");
    const previewList = document.getElementById("parserPreviewList");
    const btnSave = document.getElementById("btnSaveToSubject");
    const btnDownload = document.getElementById("btnDownloadJson");
    const btnCopy = document.getElementById("btnCopyJson");
    const btnContribute = document.getElementById("btnContribute");

    if (badge) {
      if (warnings && warnings.length > 0) {
        badge.innerHTML = `<span style="color: #f59e0b; font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> ${totalParsed} câu (${warnings.length} cần chú ý)</span>`;
      } else {
        badge.textContent = `${totalParsed} câu hỏi hợp lệ`;
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

    if (btnSave) btnSave.disabled = false;
    if (btnDownload) btnDownload.disabled = false;
    if (btnCopy) btnCopy.disabled = false;
    if (btnContribute) btnContribute.disabled = false;

    if (previewList) {
      let warningBannerHtml = "";
      if (warnings && warnings.length > 0) {
        warningBannerHtml = `
          <div style="margin-bottom: 14px; padding: 12px 14px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; color: #b45309; font-size: 12px;">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 12.5px;">
              <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i> Cảnh báo (${warnings.length} câu hỏi cần kiểm tra đáp án):
            </div>
            <div style="max-height: 80px; overflow-y: auto; line-height: 1.5; opacity: 0.9;">
              ${warnings.map(w => `<div>• ${w}</div>`).join('')}
            </div>
          </div>
        `;
      }

      previewList.innerHTML = warningBannerHtml + questions.map((q, idx) => {
        let warnBoxHtml = "";
        let cardBorderStyle = "";
        if (q.warning) {
          if (q.warning.type === "missing_answer") {
            cardBorderStyle = "border-color: rgba(245, 158, 11, 0.4);";
            warnBoxHtml = `
              <div style="display: flex; align-items: center; gap: 6px; padding: 6px 10px; margin-bottom: 8px; background: rgba(245, 158, 11, 0.12); border-left: 3px solid #f59e0b; border-radius: 4px; color: #b45309; font-size: 11.5px; font-weight: 600;">
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

        return `
          <div class="preview-card" style="${cardBorderStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="badge ${q.warning ? 'badge-warning' : 'badge-gray'}">Câu ${idx + 1}</span>
              <span style="font-size: 11.5px; font-weight: 700; color: ${q.warning ? '#f59e0b' : 'var(--success)'};">Đáp án: ${this.letters[q.answerIndex]}</span>
            </div>
            ${warnBoxHtml}
            <div class="preview-card-title">${SmartParserService.formatRichText(q.question)}</div>
            <div>
              ${q.options.map((opt, oi) => `
                <div class="preview-opt-item ${oi === q.answerIndex ? 'is-correct' : ''}">
                  <strong>${this.letters[oi]}.</strong> ${SmartParserService.formatRichText(opt.text)}
                  ${opt.note ? `<div style="font-size: 11.5px; opacity: 0.85; margin-left: 14px; margin-top: 2px;">↳ <em>${SmartParserService.formatRichText(opt.note)}</em></div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
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
C. Ký hiệu @author: Shina (Bùi Văn Khang) & Shinora Community
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
  }
});
