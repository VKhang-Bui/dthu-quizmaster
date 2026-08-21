/**
 * ============================================================================
 * SHINORA QUIZMASTER - PARSER VIEW MODULE (Schema V3 + Multi-thread Worker)
 * ----------------------------------------------------------------------------
 * 1. Khung soạn thảo 2 lớp với dải dạ quang chìm bên dưới chữ (Background Underlay)
 * 2. Bóc tách tức thì qua Web Worker trên nhân CPU riêng (Không đơ giao diện)
 * 3. Ánh xạ tọa độ 2 chiều & Cuộn thích ứng chống lag (SourceSync)
 * 4. Kiểm định chuyên sâu 2 cấp độ (🔴 Không chấp nhận được / 🟡 Chấp nhận được)
 * 5. Ngăn kéo Cài Đặt tùy biến (Slide-over Settings Drawer)
 * 6. Xuất JSON Schema V3 và Lưu trực tiếp vào StorageService (Bản nháp chờ duyệt)
 * ============================================================================
 */

Object.assign(App, {
  parserState: {
    currentTab: "preview",
    subjectCode: "CNXHKH",
    chapterId: "c1",
    rawText: "",
    parsedData: null,
    renderedJsonStr: "",
    currentPage: 1,
    pageSize: 20,
    activeFilter: "all",
    isParsing: false,
    lastParseDurationMs: 0,
    activeQuestionId: null,
    settings: {
      scrollMode: "adaptive",       // "adaptive" | "smooth" | "instant"
      triggerMoment: "afterScroll",  // "afterScroll" | "immediate"
      highlightDuration: 1.8,        // Giây
      pageSize: 20
    }
  },

  parserWorker: null,

  /**
   * Khởi tạo và hiển thị Giao diện Bóc Tách Đề Thi
   */
  renderParserView(container, preselectedSubjectId) {
    if (!StorageService.isLoggedIn()) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="color: var(--text-tertiary); margin-bottom: 14px; display:flex; justify-content:center;">${Icons.get('upload', 52)}</div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Công Cụ Soạn & Nhập Đề Thi Chuẩn Hóa</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Vui lòng đăng nhập tài khoản để sử dụng công cụ bóc tách câu hỏi và đóng góp bộ đề mới lên hệ thống (+30 EXP).
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
    const defaultSubId = preselectedSubjectId || (subjects[0] ? subjects[0].id : "CNXHKH");
    const activeSub = StorageService.getSubjectById(defaultSubId) || subjects[0];
    const subjectCode = activeSub ? (activeSub.code || activeSub.id) : "CNXHKH";

    this.parserState.subjectCode = subjectCode;
    this.parserState.activeFilter = "all";
    this.parserState.currentPage = 1;
    this.parserState.currentTab = "preview";
    this.loadParserSavedSettings();

    container.innerHTML = `
      <div class="view-parser">
        <!-- Top Navigation Header (Hàng 1: Tiêu đề & Model Status) -->
        <div class="parser-top-header">
          <div class="parser-top-left">
            <button class="btn btn-sm btn-back-nav" onclick="App.navigateBackOrHome()" title="Quay lại trang trước" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('chevronLeft', 13)} <span>Quay Lại</span>
            </button>
            <div class="parser-header-title-box">
              <h2>${Icons.get('sparkles', 18, '', 'var(--brand-primary)')} <span>Soạn &amp; Bóc Tách Đề Thi Chuẩn Hóa</span> <span class="badge badge-blue" style="font-size:11px; font-family:var(--font-mono, monospace);">Schema V3 + Web Worker</span></h2>
              <p>Tự động bóc tách, đánh số, phân tích lỗi khảo thí và chuyển đổi sang JSON Schema V3 thời gian thực</p>
            </div>
          </div>

          <div class="parser-header-status-box" style="display: flex; align-items: center; gap: 8px;">
            <span id="parserActiveModelBadge" class="badge" onclick="App.openParserSettings()" style="background: rgba(124, 58, 237, 0.08); color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.2); font-weight: 700; font-size: 11.5px; padding: 5px 9px; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;" title="Mô hình Google Gemini AI đang sử dụng (Nhấp để thay đổi model trong Cài Đặt)">
              ${Icons.get('sparkles', 13, '', '#7c3aed')} <span id="parserActiveModelName">${(typeof GeminiAIParser !== 'undefined') ? GeminiAIParser.getModelDisplayName() : 'Gemini 3.5 Flash Lite'}</span>
            </span>
            <span id="parserAiQuotaPill" onclick="App.openParserSettings()" style="display: ${(typeof AIQuotaTracker !== 'undefined' && AIQuotaTracker.isEnabled()) ? 'inline-flex' : 'none'}; align-items: center; gap: 4px; font-size: 11px; font-family: var(--font-mono, monospace); background: var(--surface); padding: 4px 8px; border-radius: var(--radius-sm, 4px); border: 1px solid var(--border); cursor: pointer; color: var(--text-secondary);" title="Mức dùng Google Gemini API thực tế (RPM, TPM, RPD) từ usageMetadata của Google - Nhấp để xem chi tiết"></span>
          </div>
        </div>

        <!-- Action Toolbar Bar (Hàng 2: Thanh Công Cụ & Tùy Chọn Môn Học) -->
        <div class="parser-action-toolbar">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary);">Môn &amp; Chương:</span>
            <select id="parserSubjectSelect" class="form-control" style="font-size:12.5px; padding:4px 8px; font-weight:700; height:32px; min-width: 170px;" onchange="App.onParserSubjectChanged()">
              ${subjects.map(s => `<option value="${s.id}" ${s.id === defaultSubId ? 'selected' : ''}>${s.name} (${s.code || s.id})</option>`).join('')}
            </select>

            <select id="parserChapterSelect" class="form-control" style="font-size:12.5px; padding:4px 8px; height:32px; min-width: 120px;" onchange="App.onParserChapterChanged()">
              ${(activeSub.chapters || [{ id: "c1", name: "Chương 1" }]).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
            <button class="btn btn-sm" onclick="App.addNewChapterFromParser()" title="Thêm chương mới vào môn học này" style="display:inline-flex; align-items:center; gap:4px; padding:4px 8px; font-size:12px; height:32px; white-space:nowrap;">
              <span>➕ Thêm Chương</span>
            </button>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-sm btn-primary" onclick="App.triggerUploadFileToParser()" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;" title="Tải tệp đề thi (DOCX, PDF, Ảnh, Text) để gửi thẳng tới Google Gemini AI">
              ${Icons.get('upload', 13)} <span>Tải File Đề (AI)</span>
            </button>
            <input type="file" id="parserFileInput" multiple style="display:none;" onchange="App.onParserFileSelected(event)">
            <input type="file" id="preflightAddMoreFileInput" multiple style="display:none;" onchange="App.onPreflightAddMoreFiles(event)">

            <button class="btn btn-sm" onclick="App.loadParserSample()" title="Nạp bộ 3 câu hỏi mẫu cú pháp chuẩn (4 đáp án, 3 đáp án, 2 đáp án)">📄 Đề Mẫu</button>
            <button class="btn btn-sm" onclick="App.openParserSettings()" title="Mở bảng Cài Đặt tùy chỉnh cuộn, dạ quang, phân trang và API Key">⚙️ Cài Đặt</button>
          </div>
        </div>

        <!-- Main 2-Column Split Layout -->
        <div class="parser-main-layout">
          
          <!-- LEFT PANEL: Direct Text Editor -->
          <div class="parser-panel">
            <div class="parser-panel-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <h3 style="font-size:14px; font-weight:800; display:flex; align-items:center; gap:6px;">${Icons.get('edit', 14)} <span>Khung Soạn Thảo Đề Thi</span></h3>
                <span id="parserInputStatsBadge" class="badge badge-info" style="font-size:11px; font-family:var(--font-mono, monospace);">0 ký tự · 0 dòng</span>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm" onclick="App.clearParserTextarea()" title="Xóa toàn bộ văn bản">Xóa</button>
              </div>
            </div>

            <!-- Textarea 2-Layer Underlay Component (Dạ quang chìm bên dưới chữ) -->
            <div class="lab-textarea-wrap">
              <div class="editor-line-underlay"></div>
              <textarea id="rawInputTextarea" class="lab-textarea" placeholder="Nhập hoặc dán văn bản câu hỏi theo chuẩn siêu gọn:
Câu 1: Quá trình đường phân diễn ra ở vị trí nào trong tế bào?
A. Chất nền ty thể
B. Bào tương >đúng:Diễn ra hoàn toàn tại tế bào chất (tùy chọn giải thích)
C. Màng trong ty thể
D. Nhân tế bào

Câu 2: Sản phẩm cuối cùng của đường phân từ 1 phân tử Glucose là gì?
A. 2 Pyruvate, 2 ATP và 2 NADH >đúng
B. 2 Lactate và 4 ATP
C. 1 Acetyl-CoA và 1 CO2
D. Ethanol và CO2"></textarea>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text-secondary); margin-top:8px;">
              <span>⚡ <em>Bóc tách đa luồng ngầm qua Web Worker (Không đơ giao diện).</em></span>
              <button class="btn btn-primary btn-sm" onclick="App.triggerParserParseNow()">⚡ Phân tích ngay</button>
            </div>
          </div>

          <!-- RIGHT PANEL: Live Preview, JSON Viewer & Diagnostics -->
          <div class="parser-panel">
            
            <!-- 3 Tabs Navigation -->
            <div class="parser-tab-nav">
              <button class="parser-tab-btn active" id="tabBtnPreview" onclick="App.switchParserTab('preview')">
                <span>🎯 Xem Trước Đề</span>
              </button>
              <button class="parser-tab-btn" id="tabBtnJson" onclick="App.switchParserTab('json')">
                <span>📄 Cấu Trúc JSON (Schema V3)</span>
              </button>
              <button class="parser-tab-btn" id="tabBtnDiagnostics" onclick="App.switchParserTab('diagnostics')">
                <span>🛡️ Kiểm Định &amp; Đánh Giá</span>
              </button>
            </div>

            <!-- TAB 1: Preview List -->
            <div id="parserTabPreview" style="flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden;">
              <!-- Dropdown Filter Bar -->
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px; flex-shrink:0; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:12px; font-weight:700; color:var(--text-secondary);">Hiển thị:</span>
                  <select id="parserFilterSelect" onchange="App.onFilterSelectChanged(this.value)" style="font-size:12px; padding:3px 8px; border-radius:6px; border:1px solid var(--border); background:var(--surface); color:var(--text-primary); font-weight:600; cursor:pointer;">
                    <option value="all">📋 Tất cả câu hỏi (0)</option>
                    <option value="unacceptable">🔴 Chỉ câu lỗi cấu trúc (0)</option>
                    <option value="acceptable">🟡 Chỉ câu có lưu ý (0)</option>
                  </select>
                </div>
                <span id="parserParseTimingPill" style="font-size:11px; font-family:var(--font-mono, monospace); color:var(--text-secondary);"></span>
              </div>

              <!-- Question Cards List -->
              <div class="parser-preview-list" id="parserPreviewCardList"></div>

              <!-- Pagination Bar -->
              <div class="pagination-bar" id="parserPaginationBar"></div>
            </div>

            <!-- TAB 2: JSON Code Viewer (Schema V3) -->
            <div id="parserTabJson" style="display:none; flex:1; min-height:0; flex-direction:column; overflow:hidden;">
              <div class="code-viewer-wrapper">
                <div class="code-editor-header">
                  <div class="code-editor-tabs">
                    <span class="code-tab"><span class="code-tab-dot"></span> schema_v3.json</span>
                  </div>
                  <div class="code-editor-meta" id="parserJsonStatsBar">
                    <span>⚡ JSON Schema V3</span>
                    <span>UTF-8</span>
                    <span>2 spaces</span>
                  </div>
                </div>
                <pre class="code-viewer-container" id="parserJsonCodeViewer"></pre>
              </div>
            </div>

            <!-- TAB 3: Diagnostics Dashboard -->
            <div id="parserTabDiagnostics" style="display:none; flex:1; min-height:0; flex-direction:column; overflow:hidden;">
              <div class="diag-list" id="parserDiagnosticsList"></div>
            </div>

            <!-- Bottom Action Buttons -->
            <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border); display:flex; gap:8px; flex-wrap:wrap; justify-content:space-between; align-items:center; flex-shrink:0;">
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn" id="btnDownloadJsonV3" onclick="App.downloadParsedAsJsonV3()" disabled style="display:inline-flex; align-items:center; gap:5px; font-size:12.5px;">
                  ${Icons.get('download', 13)} <span>Tải file JSON</span>
                </button>
                <button class="btn" id="btnCopyJsonV3" onclick="App.copyParsedJsonV3ToClipboard()" disabled style="display:inline-flex; align-items:center; gap:5px; font-size:12.5px;">
                  ${Icons.get('copy', 13)} <span>Sao chép JSON</span>
                </button>
              </div>

              <button class="btn btn-primary" id="btnSaveToShinoraDraft" onclick="App.saveParsedQuestionsToDraft()" disabled style="display:inline-flex; align-items:center; gap:6px; font-weight:800; font-size:13px;">
                ${Icons.get('checkCircle', 14)} <span>Lưu Bộ Đề Vào Hệ Thống (Chờ Duyệt)</span> ${Icons.get('arrowRight', 12)}
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    this.initParserWorker();
    this.bindParserEvents();
    this.loadParserSample();
    if (typeof this.updateQuotaUI === 'function') this.updateQuotaUI();
  },

  /**
   * Khởi tạo Web Worker đa luồng ngầm (Đồng bộ tuyệt đối 100% với StrictQuizParser)
   */
  initParserWorker() {
    try {
      const parserRef = window.StrictQuizParser || (typeof StrictQuizParser !== 'undefined' ? StrictQuizParser : null);
      if (!parserRef) {
        this.parserWorker = null;
        return;
      }

      const workerCode = `
        const StrictQuizParser = {
          ${parserRef.generateSmartIndexId.toString()},
          ${parserRef.parse.toString()},
          ${parserRef.parseSingleBlock.toString()},
          ${parserRef.toSchemaV3.toString()}
        };

        self.onmessage = function(e) {
          const { rawText, subjectCode, taskId } = e.data;
          const startTime = performance.now();
          const result = StrictQuizParser.parse(rawText, subjectCode);
          const duration = performance.now() - startTime;
          const v3Data = StrictQuizParser.toSchemaV3(result.data);
          self.postMessage({ taskId, result, v3Data, duration });
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      this.parserWorker = new Worker(blobUrl);

      this.parserWorker.onmessage = (e) => {
        const { result, v3Data, duration } = e.data;
        this.onParserWorkerResult(result, v3Data, duration);
      };
    } catch (err) {
      console.warn("Worker fallback to main thread:", err);
      this.parserWorker = null;
    }
  },

  bindParserEvents() {
    const textarea = document.getElementById("rawInputTextarea");
    if (!textarea) return;

    let debounceTimer = null;
    textarea.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.onParserInputChanged();
      }, 150);
    });

    textarea.addEventListener("keyup", () => this.syncParserCursor());
    textarea.addEventListener("click", () => this.syncParserCursor());

    // Hỗ trợ Kéo & Thả file (DOCX, PDF, Text) trực tiếp vào ô soạn thảo
    textarea.addEventListener("dragover", (e) => {
      e.preventDefault();
      textarea.style.outline = "2px dashed var(--brand-primary, #7c3aed)";
    });

    textarea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      textarea.style.outline = "";
    });

    textarea.addEventListener("drop", (e) => {
      e.preventDefault();
      textarea.style.outline = "";
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.onParserFileSelected({ target: { files: e.dataTransfer.files } });
      }
    });
  },

  syncParserCursor() {
    const textarea = document.getElementById("rawInputTextarea");
    if (!textarea || !this.parserState.parsedData || !window.SourceSync) return;

    const questions = this.parserState.parsedData.data || [];
    const match = SourceSync.findQuestionAtCursor(textarea.selectionStart, questions);
    if (!match) return;

    const matchedId = match.question.id;
    if (this.parserState.activeQuestionId === matchedId) return;
    this.parserState.activeQuestionId = matchedId;

    const filtered = this.getFilteredQuestions();
    const filteredIndex = filtered.findIndex(q => q.id === matchedId);
    if (filteredIndex !== -1) {
      const targetPage = Math.floor(filteredIndex / this.parserState.pageSize) + 1;
      if (this.parserState.currentPage !== targetPage) {
        this.parserState.currentPage = targetPage;
        this.renderParserPreviewList();
      }
      SourceSync.highlightPreviewCard(matchedId);
    }
  },

  jumpToQuestionInEditor(index) {
    const textarea = document.getElementById("rawInputTextarea");
    const questions = this.parserState.parsedData?.data || [];
    const item = questions[index];
    if (!textarea || !item || !window.SourceSync) return;

    this.parserState.activeQuestionId = item.id;
    SourceSync.jumpToEditor(textarea, item);
  },

  onParserInputChanged() {
    const textarea = document.getElementById("rawInputTextarea");
    if (!textarea) return;

    const text = textarea.value;
    this.parserState.rawText = text;

    // Cập nhật thống kê dòng & ký tự
    const statsBadge = document.getElementById("parserInputStatsBadge");
    if (statsBadge) {
      const lines = text ? text.split("\n").length : 0;
      statsBadge.textContent = `${text.length.toLocaleString('vi-VN')} ký tự · ${lines.toLocaleString('vi-VN')} dòng`;
    }

    // Luôn ưu tiên chạy phân tích đồng bộ ngay lập tức để giao diện hiển thị tức thì 0ms không bao giờ bị trắng
    const parserRef = window.StrictQuizParser || (typeof StrictQuizParser !== 'undefined' ? StrictQuizParser : null);
    if (parserRef) {
      const t0 = performance.now();
      const result = parserRef.parse(text, this.parserState.subjectCode);
      const v3 = parserRef.toSchemaV3(result.data);
      this.onParserWorkerResult(result, v3, performance.now() - t0);
    } else if (this.parserWorker) {
      this.parserWorker.postMessage({
        rawText: text,
        subjectCode: this.parserState.subjectCode,
        taskId: Date.now()
      });
    }
  },

  triggerParserParseNow() {
    const textarea = document.getElementById("rawInputTextarea");
    if (!textarea) return;

    const text = textarea.value;
    this.parserState.rawText = text;

    const parserRef = window.StrictQuizParser || (typeof StrictQuizParser !== 'undefined' ? StrictQuizParser : null);
    if (parserRef) {
      const t0 = performance.now();
      const result = parserRef.parse(text, this.parserState.subjectCode);
      const v3 = parserRef.toSchemaV3(result.data);
      this.onParserWorkerResult(result, v3, performance.now() - t0);
    }

    this.openParserDiagnosticsModal();
  },

  openParserDiagnosticsModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");
    if (!modal || !body) return;

    const questions = this.parserState.parsedData?.data || [];
    const total = questions.length;
    const diagReport = this.parserState.diagReport || (window.QuizDiagnostics ? QuizDiagnostics.analyzeQuiz(questions) : {
      total, perfectCount: total, acceptableCount: 0, unacceptableCount: 0, issues: []
    });

    const issues = diagReport.issues || [];
    const unacceptables = issues.filter(i => i.severity === "unacceptable");
    const acceptables = issues.filter(i => i.severity === "acceptable");

    // Phân loại nhóm lỗi nghiêm trọng
    const noAnswerIssues = unacceptables.filter(i => i.code === "ERR_NO_CORRECT_ANSWER");
    const fewOptionsIssues = unacceptables.filter(i => i.code === "ERR_TOO_FEW_OPTIONS");
    const multiAnswerIssues = unacceptables.filter(i => i.code === "ERR_MULTIPLE_CORRECT_ANSWERS");
    const duplicateIssues = unacceptables.filter(i => i.code === "ERR_DUPLICATE_QUESTION");
    const otherCriticalIssues = unacceptables.filter(i => !["ERR_NO_CORRECT_ANSWER", "ERR_TOO_FEW_OPTIONS", "ERR_MULTIPLE_CORRECT_ANSWERS", "ERR_DUPLICATE_QUESTION"].includes(i.code));

    // Phân loại nhóm lỗi lưu ý
    const missingQuestionMarkIssues = acceptables.filter(i => i.code === "WARN_MISSING_QUESTION_MARK");
    const duplicateOptIssues = acceptables.filter(i => i.code === "WARN_DUPLICATE_OPTION_TEXT");
    const otherWarningIssues = acceptables.filter(i => !["WARN_MISSING_QUESTION_MARK", "WARN_DUPLICATE_OPTION_TEXT"].includes(i.code));

    if (title) title.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">⚡ Báo Cáo Phân Tích &amp; Kiểm Định Khảo Thí (${total} Câu)</span>`;

    let html = `
      <div style="display:flex; flex-direction:column; gap:12px; max-height:70vh; overflow-y:auto; padding-right:4px;">
        
        <!-- 3 Thẻ Chỉ Số Tổng Quan -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
          <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:10px 12px; text-align:center;">
            <div style="font-size:18px; font-weight:800; color:#059669;">${diagReport.perfectCount}</div>
            <div style="font-size:11.5px; font-weight:700; color:#047857;">🟢 Đạt chuẩn (Hoàn hảo)</div>
          </div>
          <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 12px; text-align:center;">
            <div style="font-size:18px; font-weight:800; color:#dc2626;">${diagReport.unacceptableCount}</div>
            <div style="font-size:11.5px; font-weight:700; color:#b91c1c;">🔴 Lỗi nghiêm trọng (Cần sửa)</div>
          </div>
          <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px 12px; text-align:center;">
            <div style="font-size:18px; font-weight:800; color:#d97706;">${diagReport.acceptableCount}</div>
            <div style="font-size:11.5px; font-weight:700; color:#b45309;">🟡 Có lưu ý (Khuyến nghị)</div>
          </div>
        </div>

        <!-- Khối Loại Bỏ Câu Trùng Lặp -->
        ${duplicateIssues.length > 0 ? `
          <div style="background:rgba(124, 58, 237, 0.08); border:1px solid rgba(124, 58, 237, 0.25); border-radius:8px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <div style="flex:1; min-width:200px;">
              <div style="font-weight:700; font-size:13px; color:#7c3aed;">🗑️ Phát hiện ${duplicateIssues.length} câu hỏi trùng lặp 100% nội dung</div>
              <div style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">Tự động xóa các câu trùng, giữ lại 1 bản gốc đầu tiên và tự động đánh số lại câu.</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="App.removeDuplicateQuestionsFromEditor()" style="white-space:nowrap; font-weight:700; font-size:12px; padding:6px 12px;">
              🗑️ Loại Bỏ ${duplicateIssues.length} Câu Trùng Lặp
            </button>
          </div>
        ` : ''}

        <!-- Danh sách Lỗi Nghiêm Trọng (Cần sửa thủ công) -->
        <div>
          <h4 style="font-size:13px; font-weight:800; color:#dc2626; margin:0 0 6px 0;">
            🔴 Nhóm Lỗi Nghiêm Trọng (${diagReport.unacceptableCount} lỗi)
          </h4>
          
          ${diagReport.unacceptableCount === 0 ? `
            <div style="font-size:12px; color:#059669; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:8px 12px;">
              ✓ Tuyệt vời! Không phát hiện lỗi cấu trúc nghiêm trọng nào.
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${noAnswerIssues.length > 0 ? `
                <div style="font-size:12px; background:var(--surface); border:1px solid var(--border); border-left:3px solid #dc2626; border-radius:4px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <div><strong>Thiếu đáp án đúng:</strong> ${noAnswerIssues.length} câu (Các câu: ${noAnswerIssues.map(i => `#${i.questionNum}`).join(', ')})</div>
                  <span style="font-size:11px; color:#dc2626; font-weight:700;">Thêm &gt;đúng</span>
                </div>
              ` : ''}
              ${fewOptionsIssues.length > 0 ? `
                <div style="font-size:12px; background:var(--surface); border:1px solid var(--border); border-left:3px solid #dc2626; border-radius:4px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <div><strong>Thiếu phương án (&lt; 2 lựa chọn):</strong> ${fewOptionsIssues.length} câu (Các câu: ${fewOptionsIssues.map(i => `#${i.questionNum}`).join(', ')})</div>
                  <span style="font-size:11px; color:#dc2626; font-weight:700;">Thêm A, B</span>
                </div>
              ` : ''}
              ${multiAnswerIssues.length > 0 ? `
                <div style="font-size:12px; background:var(--surface); border:1px solid var(--border); border-left:3px solid #dc2626; border-radius:4px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <div><strong>Nhiều hơn 1 đáp án đúng:</strong> ${multiAnswerIssues.length} câu (Các câu: ${multiAnswerIssues.map(i => `#${i.questionNum}`).join(', ')})</div>
                  <span style="font-size:11px; color:#dc2626; font-weight:700;">Giữ 1 &gt;đúng</span>
                </div>
              ` : ''}
              ${duplicateIssues.length > 0 ? `
                <div style="font-size:12px; background:var(--surface); border:1px solid var(--border); border-left:3px solid #7c3aed; border-radius:4px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <div><strong>Trùng lặp nội dung 100%:</strong> ${duplicateIssues.length} câu (Các câu: ${duplicateIssues.map(i => `#${i.questionNum}`).join(', ')})</div>
                  <span style="font-size:11px; color:#7c3aed; font-weight:700;">Bấm nút loại bỏ ở trên</span>
                </div>
              ` : ''}
              ${otherCriticalIssues.length > 0 ? `
                <div style="font-size:12px; background:var(--surface); border:1px solid var(--border); border-left:3px solid #dc2626; border-radius:4px; padding:6px 10px;">
                  ${otherCriticalIssues.map(i => `<div>• Câu #${i.questionNum}: ${i.message}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          `}
        </div>

        <!-- Danh sách Cảnh Báo Lưu Ý (Khuyến nghị sửa) -->
        <div style="margin-top:4px;">
          <h4 style="font-size:13px; font-weight:800; color:#d97706; margin:0 0 6px 0;">
            🟡 Nhóm Cảnh Báo Lưu Ý (${diagReport.acceptableCount} lưu ý)
          </h4>
          
          ${diagReport.acceptableCount === 0 ? `
            <div style="font-size:12px; color:#059669; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:8px 12px;">
              ✓ Không có cảnh báo lưu ý nào.
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${missingQuestionMarkIssues.length > 0 ? `
                <div style="font-size:12px; background:var(--surface); border:1px solid var(--border); border-left:3px solid #f59e0b; border-radius:4px; padding:6px 10px;">
                  <strong>Thiếu dấu '?' ở cuối câu:</strong> ${missingQuestionMarkIssues.length} câu (Các câu: ${missingQuestionMarkIssues.map(i => `#${i.questionNum}`).join(', ')})
                </div>
              ` : ''}
              ${duplicateOptIssues.length > 0 ? `
                <div style="font-size:12px; background:var(--surface); border:1px solid var(--border); border-left:3px solid #f59e0b; border-radius:4px; padding:6px 10px;">
                  <strong>Trùng nội dung giữa các phương án:</strong> ${duplicateOptIssues.length} câu (Các câu: ${duplicateOptIssues.map(i => `#${i.questionNum}`).join(', ')})
                </div>
              ` : ''}
              ${otherWarningIssues.length > 0 ? `
                <div style="font-size:12px; background:var(--surface); border:1px solid var(--border); border-left:3px solid #f59e0b; border-radius:4px; padding:6px 10px;">
                  ${otherWarningIssues.map(i => `<div>• Câu #${i.questionNum}: ${i.message}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          `}
        </div>

      </div>
    `;

    body.innerHTML = html;

    if (footer) {
      footer.innerHTML = `
        <div style="display:flex; justify-content:flex-end; align-items:center; width:100%;">
          <button class="btn btn-primary btn-sm" onclick="App.closeModal()">Đóng</button>
        </div>
      `;
    }

    this.openModal();
  },

  removeDuplicateQuestionsFromEditor() {
    const textarea = document.getElementById("rawInputTextarea");
    if (!textarea) return;

    const text = textarea.value;
    const parserRef = window.StrictQuizParser || (typeof StrictQuizParser !== 'undefined' ? StrictQuizParser : null);
    if (!parserRef) return;

    const parsed = parserRef.parse(text, this.parserState.subjectCode);
    const questions = parsed.data || [];
    if (questions.length === 0) return;

    const seenSignatures = new Set();
    const uniqueQuestions = [];
    let duplicateCount = 0;

    questions.forEach(q => {
      // Chuẩn hóa signature nội dung câu hỏi + các phương án
      const optSig = (q.options || []).map(o => (o.text || "").trim().toLowerCase()).sort().join("|");
      const qSig = `${(q.question || "").trim().toLowerCase()}:::${optSig}`;

      if (seenSignatures.has(qSig)) {
        duplicateCount++;
      } else {
        seenSignatures.add(qSig);
        uniqueQuestions.push(q);
      }
    });

    if (duplicateCount === 0) {
      this.showToast("ℹ️ Không tìm thấy câu hỏi nào bị trùng lặp!", "info", 2500);
      return;
    }

    // Tái tạo lại văn bản chuẩn hóa sạch sẽ
    const newText = uniqueQuestions.map((q, idx) => {
      const qNum = idx + 1;
      let block = `Câu ${qNum}: ${q.question.trim()}\n`;
      (q.options || []).forEach(opt => {
        let optLine = `${opt.key}. ${opt.text.trim()}`;
        if (opt.isCorrect) {
          optLine += opt.explanation ? ` >đúng:${opt.explanation.trim()}` : ` >đúng`;
        } else if (opt.explanation) {
          optLine += ` >sai:${opt.explanation.trim()}`;
        }
        block += `${optLine}\n`;
      });
      return block;
    }).join("\n");

    textarea.value = newText;
    this.onParserInputChanged();

    // Làm mới lại modal phân tích
    this.openParserDiagnosticsModal();
    this.showToast(`🎉 Đã loại bỏ thành công ${duplicateCount} câu trùng lặp! Đề thi còn ${uniqueQuestions.length} câu.`, "success", 3500);
  },

  onParserWorkerResult(result, v3Data, duration) {
    this.parserState.parsedData = result;
    this.parserState.lastParseDurationMs = duration;

    // Cập nhật chỉ số kiểm định toàn diện 1 lần duy nhất
    const diagReport = window.QuizDiagnostics 
      ? QuizDiagnostics.analyzeQuiz(result.data) 
      : { perfectCount: result.total, acceptableCount: 0, unacceptableCount: 0, isPublishReady: result.total > 0, issues: [] };

    this.parserState.diagReport = diagReport;

    // Gắn trực tiếp chẩn đoán lỗi vào từng object câu hỏi để đồng bộ 100%
    const issuesByQNum = new Map();
    (diagReport.issues || []).forEach(iss => {
      if (!issuesByQNum.has(iss.questionNum)) {
        issuesByQNum.set(iss.questionNum, []);
      }
      issuesByQNum.get(iss.questionNum).push(iss);
    });

    (result.data || []).forEach((q, idx) => {
      const qNum = idx + 1;
      q.diagnosticsIssues = issuesByQNum.get(qNum) || [];
      q.hasUnacceptable = q.diagnosticsIssues.some(i => i.severity === "unacceptable");
      q.hasAcceptable = q.diagnosticsIssues.some(i => i.severity === "acceptable");
      q.isPerfect = !q.hasUnacceptable && !q.hasAcceptable;
    });

    // Cập nhật các lựa chọn trong Dropdown Filter
    const filterSelect = document.getElementById("parserFilterSelect");
    if (filterSelect) {
      const currentVal = filterSelect.value || "all";
      filterSelect.options[0].textContent = `📋 Tất cả câu hỏi (${result.total})`;
      filterSelect.options[1].textContent = `🔴 Chỉ câu lỗi cấu trúc (${diagReport.unacceptableCount})`;
      filterSelect.options[2].textContent = `🟡 Chỉ câu có lưu ý (${diagReport.acceptableCount})`;
      filterSelect.value = currentVal;
    }

    // Cập nhật số lượng câu hỏi
    const countAll = document.getElementById("countAllPill");
    const timingPill = document.getElementById("parserParseTimingPill");

    if (countAll) countAll.textContent = result.total;
    if (timingPill) timingPill.textContent = `⚡ ${duration.toFixed(1)}ms`;

    // Cập nhật các nút lưu & xuất
    const btnSave = document.getElementById("btnSaveToShinoraDraft");
    const btnDownload = document.getElementById("btnDownloadJsonV3");
    const btnCopy = document.getElementById("btnCopyJsonV3");

    const canSave = result.total > 0 && diagReport.unacceptableCount === 0;

    if (btnSave) {
      btnSave.disabled = !canSave;
      if (!canSave && result.total > 0) {
        btnSave.title = `Có ${diagReport.unacceptableCount} câu hỏi lỗi nghiêm trọng (🔴). Vui lòng khắc phục trước khi lưu!`;
      } else {
        btnSave.title = "Lưu bộ đề vào hệ thống (Chờ duyệt)";
      }
    }

    if (btnDownload) btnDownload.disabled = result.total === 0;
    if (btnCopy) btnCopy.disabled = result.total === 0;

    this.renderParserPreviewList();
    this.renderParserJsonView(v3Data);
    this.renderParserDiagnosticsView(diagReport);
  },

  onFilterSelectChanged(value) {
    this.parserState.previewFilter = value;
    this.parserState.currentPage = 1;
    this.renderParserPreviewList();
  },

  renderParserPreviewList() {
    const container = document.getElementById("parserPreviewCardList");
    const paginationBar = document.getElementById("parserPaginationBar");
    if (!container) return;
    const allQuestions = this.parserState.parsedData?.data || [];
    const total = allQuestions.length;

    if (total === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; color: var(--text-secondary);">
          Chưa có câu hỏi nào. Hãy nhập hoặc dán văn bản câu hỏi vào khung bên trái.
        </div>
      `;
      if (paginationBar) paginationBar.innerHTML = "";
      return;
    }

    const filter = this.parserState.previewFilter || "all";
    let displayQuestions = allQuestions;
    if (filter === "unacceptable") {
      displayQuestions = allQuestions.filter(q => q.hasUnacceptable === true || (q.diagnosticsIssues || []).some(i => i.severity === "unacceptable"));
    } else if (filter === "acceptable") {
      displayQuestions = allQuestions.filter(q => (q.hasAcceptable === true || (q.diagnosticsIssues || []).some(i => i.severity === "acceptable")) && !q.hasUnacceptable);
    }

    if (displayQuestions.length === 0) {
      const filterLabel = filter === 'unacceptable' ? '🔴 lỗi cấu trúc' : '🟡 có lưu ý';
      container.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; background: var(--surface); border: 1px dashed var(--border); border-radius: 8px; margin: 8px 0;">
          <div style="font-size: 24px; margin-bottom: 6px;">🎉</div>
          <div style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">Không có câu hỏi nào có ${filterLabel}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Toàn bộ ${total} câu hỏi trong đề không gặp vấn đề thuộc nhóm này.</div>
        </div>
      `;
      if (paginationBar) paginationBar.innerHTML = "";
      return;
    }

    const displayTotal = displayQuestions.length;
    const pageSize = this.parserState.pageSize || 20;
    const totalPages = Math.max(1, Math.ceil(displayTotal / pageSize));
    if (this.parserState.currentPage > totalPages) this.parserState.currentPage = totalPages;
    if (this.parserState.currentPage < 1) this.parserState.currentPage = 1;

    const startIdx = (this.parserState.currentPage - 1) * pageSize;
    const pageItems = displayQuestions.slice(startIdx, startIdx + pageSize);

    let html = "";
    pageItems.forEach((item) => {
      const actualListIndex = item.num - 1;
      const displayIndex = item.num;
      const issues = item.diagnosticsIssues || [];
      const hasUnacceptable = Boolean(item.hasUnacceptable);
      const hasAcceptable = Boolean(item.hasAcceptable);

      let statusBadge = '<span class="badge badge-green" style="font-size:11px;">✓ Hoàn hảo</span>';
      let cardBorder = "";

      if (hasUnacceptable) {
        statusBadge = '<span class="badge badge-red" style="font-size:11px;">🔴 Lỗi cấu trúc</span>';
        cardBorder = "border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.15);";
      } else if (hasAcceptable) {
        statusBadge = '<span class="badge badge-yellow" style="font-size:11px;">🟡 Có lưu ý</span>';
        cardBorder = "border-color: rgba(245, 158, 11, 0.5); box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.15);";
      }

      const isLabelMismatch = item.rawLabel && item.rawLabel !== displayIndex;

      html += `
        <div class="q-card" data-question-id="${item.id}" style="${cardBorder}" onclick="App.jumpToQuestionInEditor(${actualListIndex})">
          <div class="q-header">
            <div style="display:flex; align-items:flex-start; gap:8px; flex:1; flex-wrap:wrap;">
              <span class="q-num">#${displayIndex}</span>
              ${isLabelMismatch ? `<span class="badge badge-yellow" style="font-size:10px; font-family:var(--font-mono, monospace);" title="Số gốc do người soạn gõ">[Gốc: Câu ${item.rawLabel}]</span>` : ''}
              <span class="badge badge-blue" style="font-family:var(--font-mono, monospace); font-size:11px;" title="Smart Index ID">${item.id}</span>
              <div class="q-title" style="flex-basis: 100%; margin-top: 4px;">${this.escapeParserHtml(item.question)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              ${statusBadge}
            </div>
          </div>

          <!-- Khung Cảnh Báo Lỗi Trực Tiếp Trên Card -->
          ${issues.length > 0 ? `
            <div style="margin: 8px 0; display: flex; flex-direction: column; gap: 4px;">
              ${issues.map(iss => `
                <div style="font-size: 11.5px; padding: 4px 8px; border-radius: 4px; display: flex; align-items: flex-start; gap: 6px; ${iss.severity === 'unacceptable' ? 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;' : 'background: #fffbeb; color: #d97706; border: 1px solid #fde68a;'}">
                  <span style="font-weight: 800;">${iss.severity === 'unacceptable' ? '🔴' : '🟡'}</span>
                  <div style="flex: 1;">
                    <strong>${this.escapeParserHtml(iss.title)}:</strong> ${this.escapeParserHtml(iss.message)}
                    ${iss.suggestion ? `<div style="font-size: 10.5px; opacity: 0.9; margin-top: 1px;">💡 <em>${this.escapeParserHtml(iss.suggestion)}</em></div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="q-options">
            ${item.options.map(opt => `
              <div class="opt-item ${opt.isCorrect ? 'is-correct' : ''}">
                <span class="opt-key">${opt.key}.</span>
                <div class="opt-text">
                  <div>${this.escapeParserHtml(opt.text)}</div>
                  ${opt.explanation ? `
                    <div class="opt-note" style="${opt.isCorrect ? '' : 'background:#fff1f2; color:#9f1239; border-color:#fecdd3;'}">
                      <strong>${opt.isCorrect ? '✓ Giải thích đúng:' : '✗ Giải thích sai:'}</strong> ${this.escapeParserHtml(opt.explanation)}
                    </div>
                  ` : ''}
                </div>
                ${opt.isCorrect ? '<span style="color:var(--success, #10b981); font-weight:800;">✓</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Render Pagination
    if (paginationBar) {
      paginationBar.innerHTML = `
        <div style="font-size:12px; color:var(--text-secondary);">
          Hiển thị <strong>${startIdx + 1}–${Math.min(startIdx + pageSize, total)}</strong> / <strong>${total}</strong> câu
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn btn-sm" ${this.parserState.currentPage === 1 ? 'disabled' : ''} onclick="App.changeParserPage(${this.parserState.currentPage - 1})">◀ Trang trước</button>
          <span style="font-size:12px; font-weight:700; padding:0 8px;">Trang ${this.parserState.currentPage} / ${totalPages}</span>
          <button class="btn btn-sm" ${this.parserState.currentPage === totalPages ? 'disabled' : ''} onclick="App.changeParserPage(${this.parserState.currentPage + 1})">Trang sau ▶</button>
        </div>
      `;
    }
  },

  changeParserPage(page) {
    this.parserState.currentPage = page;
    this.renderParserPreviewList();
    const container = document.getElementById("parserPreviewCardList");
    if (container) container.scrollTop = 0;
  },

  renderParserJsonView(v3Data) {
    const codeBlock = document.getElementById("parserJsonCodeViewer");
    const statsBar = document.getElementById("parserJsonStatsBar");
    if (!codeBlock) return;

    const jsonStr = JSON.stringify(v3Data, null, 2);
    this.parserState.renderedJsonStr = jsonStr;

    if (statsBar) {
      statsBar.innerHTML = `<span style="margin-right:12px;">⚡ Schema V3 (<strong>${(v3Data || []).length}</strong> câu)</span><span style="margin-right:12px;">${(jsonStr.length / 1024).toFixed(1)} KB</span><span>UTF-8</span>`;
    }

    codeBlock.innerHTML = this.highlightJsonSyntax(jsonStr);
  },

  highlightJsonSyntax(jsonStr) {
    if (!jsonStr) return "";
    const escaped = jsonStr
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "json-number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "json-key";
            return `<span class="${cls}">${match.slice(0, -1)}</span><span class="json-colon">:</span>`;
          } else {
            cls = "json-string";
          }
        } else if (/true|false/.test(match)) {
          cls = "json-boolean";
        } else if (/null/.test(match)) {
          cls = "json-null";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  },

  renderParserDiagnosticsView(diagReport) {
    const container = document.getElementById("parserDiagnosticsList");
    if (!container) return;

    if (!diagReport || diagReport.total === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary);">Chưa có dữ liệu kiểm định.</div>`;
      return;
    }

    let html = `
      <div style="background:var(--surface-subtle); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
        <div style="font-weight:800; font-size:14px; margin-bottom:6px; color:var(--text-primary);">${diagReport.summary}</div>
        <div style="display:flex; gap:10px; font-size:12px;">
          <span style="color:var(--success, #10b981);">✓ ${diagReport.perfectCount} câu hoàn hảo</span>
          <span style="color:#f59e0b;">🟡 ${diagReport.acceptableCount} câu có lưu ý</span>
          <span style="color:#ef4444;">🔴 ${diagReport.unacceptableCount} câu cần sửa</span>
        </div>
      </div>
    `;

    if (diagReport.issues.length === 0) {
      html += `
        <div class="diag-item success">
          <div style="font-size:18px;">🎉</div>
          <div>
            <strong>Toàn bộ câu hỏi đạt chuẩn khảo thí tuyệt đối 100%!</strong>
            <div style="font-size:12px; margin-top:2px;">Không phát hiện bất kỳ lỗi cấu trúc, xung đột hay trùng lặp nào.</div>
          </div>
        </div>
      `;
    } else {
      diagReport.issues.forEach(issue => {
        const isError = issue.severity === QuizDiagnostics.SEVERITY.UNACCEPTABLE;
        html += `
          <div class="diag-item ${isError ? 'error' : 'warn'}">
            <div style="font-size:16px;">${isError ? '🔴' : '🟡'}</div>
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>Câu #${issue.questionNum}: ${issue.title}</strong>
                <span class="badge" style="font-size:10px;">${issue.code}</span>
              </div>
              <div style="font-size:12px; margin-top:3px;">${issue.message}</div>
              <div style="font-size:11.5px; margin-top:4px; font-style:italic;">💡 Hướng dẫn sửa: ${issue.suggestion}</div>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  },

  switchParserTab(tabId) {
    this.parserState.currentTab = tabId;

    const tabPreview = document.getElementById("parserTabPreview");
    const tabJson = document.getElementById("parserTabJson");
    const tabDiagnostics = document.getElementById("parserTabDiagnostics");

    if (tabPreview) tabPreview.style.display = tabId === "preview" ? "flex" : "none";
    if (tabJson) tabJson.style.display = tabId === "json" ? "flex" : "none";
    if (tabDiagnostics) tabDiagnostics.style.display = tabId === "diagnostics" ? "flex" : "none";

    document.querySelectorAll(".parser-tab-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`tabBtn${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
    if (activeBtn) activeBtn.classList.add("active");
  },

  clearParserTextarea() {
    const textarea = document.getElementById("rawInputTextarea");
    if (!textarea || !textarea.value.trim()) {
      this.showToast("Ô soạn thảo đang trống!", "info", 1500);
      return;
    }

    this.showConfirmDialog({
      title: "Xác nhận xóa văn bản",
      message: "Bạn có chắc chắn muốn xóa toàn bộ nội dung đề thi trong khung soạn thảo không? Dữ liệu chưa lưu sẽ bị mất.",
      confirmText: "Xóa toàn bộ",
      cancelText: "Giữ lại",
      isDanger: true,
      onConfirm: () => {
        textarea.value = "";
        this.onParserInputChanged();
        this.showToast("Đã xóa sạch nội dung khung soạn thảo", "info", 1500);
      }
    });
  },

  onParserSubjectChanged() {
    const subSelect = document.getElementById("parserSubjectSelect");
    const chapSelect = document.getElementById("parserChapterSelect");
    if (!subSelect || !chapSelect) return;

    const subId = subSelect.value;
    const sub = StorageService.getSubjectById(subId);
    if (!sub) return;

    this.parserState.subjectCode = sub.code || sub.id;

    if (sub.chapters && sub.chapters.length > 0) {
      chapSelect.innerHTML = sub.chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } else {
      chapSelect.innerHTML = `<option value="c1">Chương 1</option>`;
    }
    this.parserState.chapterId = chapSelect.value || "c1";

    this.onParserInputChanged();
  },

  onParserChapterChanged() {
    const chapSelect = document.getElementById("parserChapterSelect");
    if (chapSelect) {
      this.parserState.chapterId = chapSelect.value || "c1";
    }
  },

  addNewChapterFromParser() {
    const subSelect = document.getElementById("parserSubjectSelect");
    const subId = subSelect ? subSelect.value : this.parserState.subjectId;
    const subjects = StorageService.getSubjects();
    const sub = subjects.find(s => s.id === subId);
    if (!sub) {
      this.showToast("⚠️ Không tìm thấy môn học đã chọn!", "warning");
      return;
    }

    const chapterName = prompt(`Nhập tên chương mới muốn thêm vào môn "${sub.name}":`);
    if (!chapterName || !chapterName.trim()) return;

    if (!sub.chapters) sub.chapters = [];
    const nextChapId = "c" + (sub.chapters.length + 1) + "_" + Date.now().toString(36);
    const newChap = {
      id: nextChapId,
      name: chapterName.trim(),
      isGuestAllowed: true
    };
    sub.chapters.push(newChap);

    StorageService.saveSubject(sub);

    // Cập nhật lại dropdown chương
    const chapSelect = document.getElementById("parserChapterSelect");
    if (chapSelect) {
      chapSelect.innerHTML = sub.chapters.map(c => `<option value="${c.id}" ${c.id === nextChapId ? 'selected' : ''}>${c.name}</option>`).join('');
      this.parserState.chapterId = nextChapId;
    }

    this.showToast(`✅ Đã thêm thành công "${newChap.name}" vào môn "${sub.name}"!`, "success", 3000);
  },

  saveParsedQuestionsToDraft() {
    const parsed = this.parserState.parsedData;
    if (!parsed || !parsed.data || parsed.data.length === 0) {
      this.showToast("⚠️ Chưa có câu hỏi nào để lưu!", "warning");
      return;
    }

    const diag = this.parserState.diagReport;
    if (diag && diag.unacceptableCount > 0) {
      this.showToast(`❌ Không thể lưu: Có ${diag.unacceptableCount} câu hỏi có lỗi nghiêm trọng (🔴). Vui lòng sửa hết trước khi lưu!`, "danger", 5000);
      return;
    }

    const subId = document.getElementById("parserSubjectSelect")?.value;
    const chapterId = document.getElementById("parserChapterSelect")?.value || "c1";
    const sub = StorageService.getSubjectById(subId);
    const profile = StorageService.getUserProfile();

    // Ánh xạ sang cấu trúc Question của Shinora QuizMaster (Tương thích 100% với Quiz Engine & Player)
    const mappedQuestions = parsed.data.map((item) => ({
      id: item.id,
      chapterId: chapterId,
      question: item.question,
      answerIndex: item.correctIndex !== null ? item.correctIndex : 0,
      explanation: item.options[item.correctIndex]?.explanation || "",
      options: item.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        note: opt.explanation || ""
      }))
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

    this.showToast(`🎉 Đã lưu ${mappedQuestions.length} câu hỏi vào danh sách Chờ Phê Duyệt! (+30 EXP)`, "success", 4500);
    this.renderHeader();

    this.adminSubjectTab = "drafts";
    this.navigateTo("manage");
  },

  downloadParsedAsJsonV3() {
    if (!this.parserState.renderedJsonStr) return;
    const subCode = this.parserState.subjectCode || "QUIZ";
    const filename = `shinora-quiz-${subCode.toLowerCase()}-v3.json`;
    const blob = new Blob([this.parserState.renderedJsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(`📥 Đã tải xuống tệp ${filename}!`, "success", 2500);
  },

  copyParsedJsonV3ToClipboard() {
    if (!this.parserState.renderedJsonStr) return;
    navigator.clipboard.writeText(this.parserState.renderedJsonStr).then(() => {
      this.showToast("📋 Đã sao chép cấu trúc JSON Schema V3 vào bộ nhớ tạm!", "success", 2500);
    }).catch(() => {
      this.showToast("⚠️ Không thể tự động sao chép.", "warning");
    });
  },

  loadParserSavedSettings() {
    try {
      const appSettings = StorageService.getAppSettings();
      const pCfg = appSettings.parser || {};
      this.parserState.settings = Object.assign({}, this.parserState.settings, pCfg);
      this.parserState.pageSize = this.parserState.settings.pageSize || 20;
    } catch (e) {}

    if (window.SourceSync) {
      SourceSync.setConfig(this.parserState.settings);
    }
  },

  saveParserSettings() {
    try {
      const appSettings = StorageService.getAppSettings();
      appSettings.parser = Object.assign({}, this.parserState.settings);
      StorageService.saveAppSettings(appSettings);
    } catch (e) {}

    if (window.SourceSync) {
      SourceSync.setConfig(this.parserState.settings);
    }
  },

  openParserSettings() {
    this.openUserDrawer();
    this.renderDrawerLevel('settings-parser');
  },

  closeParserSettings() {
    this.closeUserDrawer();
  },

  loadParserSample() {
    const textarea = document.getElementById("rawInputTextarea");
    if (!textarea) return;

    this.parserState.currentPage = 1;

    textarea.value = `Câu 1: Quá trình quang hợp ở thực vật diễn ra chủ yếu ở bào quan nào?
A. Ti thể
B. Lục lạp >đúng:Lục lạp chứa diệp lục hấp thu năng lượng ánh sáng mặt trời
C. Ribosome
D. Không bào

Câu 2: Sản phẩm của pha sáng quang hợp gồm những chất nào? (Minh họa câu lỗi: Thiếu thẻ >đúng)
A. ATP, NADPH và O2
B. Glucose và CO2
C. Axit amin và Lipit
D. Nước và khoáng chất

Câu 3: Vai trò chính của diệp lục trong quang hợp là gì (Minh họa câu lưu ý: Thiếu dấu ?)
A. Hấp thu quang năng và chuyển hóa thành hóa năng >đúng:Diệp lục hấp thu photon ánh sáng
B. Cung cấp nước cho tế bào
C. Dự trữ tinh bột`;

    this.onParserInputChanged();
  },

  escapeParserHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  // ==========================================================================
  // FILE PIPELINE & PIPELINE INSPECTOR (Trình Giám Sát Luồng Xử Lý File)
  // ==========================================================================

  triggerUploadFileToParser() {
    const input = document.getElementById("parserFileInput");
    if (input) {
      input.value = "";
      input.click();
    }
  },

  triggerAddMoreFilesToPreflight() {
    const input = document.getElementById("preflightAddMoreFileInput");
    if (input) {
      input.value = "";
      input.click();
    }
  },

  onParserFileSelected(event) {
    const inputEl = event.target;
    const files = Array.from(inputEl && inputEl.files ? inputEl.files : []);
    if (!files || files.length === 0) return;

    this._pendingAiFiles = files;
    this.showAiPreflightModal();
    if (inputEl) inputEl.value = "";
  },

  onPreflightAddMoreFiles(event) {
    const inputEl = event.target;
    const newFiles = Array.from(inputEl && inputEl.files ? inputEl.files : []);
    if (!newFiles || newFiles.length === 0) return;

    const existing = this._pendingAiFiles || [];
    newFiles.forEach(nf => {
      const isDup = existing.some(ef => ef.name === nf.name && ef.size === nf.size);
      if (!isDup) existing.push(nf);
    });
    this._pendingAiFiles = existing;
    this.updateAiPreflightModalUI();
    if (inputEl) inputEl.value = "";
  },

  removePreflightFile(index) {
    if (this._pendingAiFiles && this._pendingAiFiles.length > index) {
      this._pendingAiFiles.splice(index, 1);
    }
    if (!this._pendingAiFiles || this._pendingAiFiles.length === 0) {
      this.closeModal();
      this.showToast("Đã đóng bảng kiểm soát do danh sách tệp trống.", "info", 1500);
      return;
    }
    this.updateAiPreflightModalUI();
  },

  getPreflightAggregatedMetrics() {
    const files = this._pendingAiFiles || [];
    if (typeof GeminiAIParser !== "undefined" && typeof GeminiAIParser.estimateMultipleFilesMetrics === "function") {
      return GeminiAIParser.estimateMultipleFilesMetrics(files);
    }
    return {
      totalFiles: files.length,
      totalBytes: files.reduce((s, f) => s + f.size, 0),
      estimatedQuestions: files.length * 50,
      estimatedInputTokens: files.length * 5000,
      estimatedOutputTokens: files.length * 6750,
      isLargeDocument: files.length > 1,
      advice: "Sẵn sàng gửi AI."
    };
  },

  /**
   * Mở Hộp Thoại Tiền Kiểm Soát & Tối Ưu Hóa Gửi Google Gemini AI
   */
  showAiPreflightModal() {
    const files = this._pendingAiFiles || [];
    if (files.length === 0) return;

    const modalHtml = `
      <div id="preflightModalContent" style="display: flex; flex-direction: column; gap: 12px;">
        ${this.renderAiPreflightModalBodyHtml()}
      </div>
    `;

    const footerHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span style="font-size: 11px; color: var(--text-secondary);">Nhấn <strong>Bắt Đầu Gửi AI</strong> để tiến hành bóc tách toàn bộ danh sách.</span>
        <div style="display: flex; gap: 8px;">
          <button class="btn" onclick="App.closeModal()">✕ Hủy Bỏ (0 Token)</button>
          <button class="btn btn-primary" id="btnConfirmSendAi" onclick="App.executeAiParseConfirmed()" style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); border: none; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.get('sparkles', 14)} <span id="preflightSubmitBtnLabel">🚀 Bắt Đầu Gửi AI (${files.length} Tệp)</span>
          </button>
        </div>
      </div>
    `;

    this.showModal({
      title: "🪄 Tiền Kiểm Soát & Tối Ưu Hóa Gửi Google Gemini AI",
      body: modalHtml,
      footer: footerHtml,
      maxWidth: "680px"
    });

    // 🔌 GỌI NGẦM GOOGLE GEMINI TOKENIZER API ĐỂ ĐO LƯỜNG TOKEN ĐẦU VÀO CHÍNH XÁC 100%
    setTimeout(async () => {
      try {
        if (typeof GeminiAIParser !== "undefined" && typeof GeminiAIParser.countFileTokens === "function") {
          let totalExactTokens = 0;
          let countSuccess = 0;
          for (const f of files) {
            const tk = await GeminiAIParser.countFileTokens(f);
            if (typeof tk === "number") {
              totalExactTokens += tk;
              countSuccess++;
            }
          }
          if (countSuccess > 0 && totalExactTokens > 0) {
            const inEl = document.getElementById("preflightEstInputTokens");
            if (inEl) inEl.innerHTML = `${totalExactTokens.toLocaleString()} <span style="font-size:9.5px; font-weight:700; color:#059669; background:rgba(16,185,129,0.12); padding:1px 4px; border-radius:3px;">Google Tokenizer</span>`;
          }
        }
      } catch (e) {
        console.warn("Async Google Tokenizer measurement skipped:", e);
      }
    }, 80);
  },

  updateAiPreflightModalUI() {
    const container = document.getElementById("preflightModalContent");
    if (container) {
      container.innerHTML = this.renderAiPreflightModalBodyHtml();
    }
    const btnLabel = document.getElementById("preflightSubmitBtnLabel");
    if (btnLabel) {
      const count = (this._pendingAiFiles || []).length;
      btnLabel.textContent = `🚀 Bắt Đầu Gửi AI (${count} Tệp)`;
    }
  },

  renderAiPreflightModalBodyHtml() {
    const files = this._pendingAiFiles || [];
    const agg = this.getPreflightAggregatedMetrics();
    const currentModel = (typeof GeminiAIParser !== "undefined") ? GeminiAIParser.getSelectedModel() : "gemini-3.5-flash-lite";
    const modelsList = (typeof GeminiAIParser !== "undefined") ? GeminiAIParser.MODELS : [];
    const promptText = (typeof GeminiAIParser !== "undefined") ? GeminiAIParser.SYSTEM_PROMPT : "";

    const defaultBatchSize = 50;
    const defaultBatches = (typeof GeminiAIParser !== "undefined" && typeof GeminiAIParser.estimateBatchPlan === "function")
      ? GeminiAIParser.estimateBatchPlan(agg.estimatedQuestions, defaultBatchSize, 1, agg.estimatedQuestions)
      : [{ batchIndex: 1, fromQ: 1, toQ: agg.estimatedQuestions, count: agg.estimatedQuestions, maxOutputLimit: 8192, isSafe: true }];

    return `
      <!-- 1. DANH SÁCH CÁC TỆP ĐÃ CHỌN -->
      <div style="background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm, 6px); padding: 12px 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 6px; color: var(--text-primary);">
            <span>📁 Danh Sách Tệp Đã Chọn (${files.length})</span>
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-sm btn-primary" onclick="App.triggerAddMoreFilesToPreflight()" style="padding: 3px 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.get('plus', 12)} <span>➕ Thêm Tệp</span>
            </button>
            <button type="button" class="btn btn-sm" onclick="App.triggerUploadFileToParser()" style="padding: 3px 8px; font-size: 11px;" title="Chọn lại bộ tệp mới">
              🔄 Chọn Lại
            </button>
          </div>
        </div>

        <!-- Khung cuộn danh sách file -->
        <div style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border); border-radius: 4px; background: var(--bg);">
          ${files.map((f, idx) => {
            const sizeStr = (f.size / 1024).toFixed(1) + " KB";
            const ext = (f.name.split('.').pop() || "").toUpperCase();
            const estQ = (typeof GeminiAIParser !== "undefined") ? GeminiAIParser.estimateFileMetrics(f).estimatedQuestions : 10;
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 8px; border-bottom: 1px solid var(--border); font-size: 11.5px;">
                <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 82%;">
                  <span style="font-size: 14px;">${ext === 'PDF' ? '📕' : ext.includes('DOC') ? '📘' : ['PNG','JPG','JPEG'].includes(ext) ? '🖼️' : '📄'}</span>
                  <strong style="color: var(--text-primary);">${this.escapeParserHtml(f.name)}</strong>
                  <span style="color: var(--text-secondary); font-size: 11px;">(${sizeStr} · ~${estQ} câu)</span>
                </div>
                <button type="button" onclick="App.removePreflightFile(${idx})" class="btn btn-sm" style="padding: 2px 6px; color: #dc2626; border-color: rgba(220, 38, 38, 0.3); font-size: 11px;" title="Xóa tệp này khỏi danh sách">✕</button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Bảng 3 Chỉ Số Tổng Hợp -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center; margin-top: 10px;">
          <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 6px; padding: 6px 4px;">
            <div style="font-size: 10px; color: var(--text-secondary); font-weight: 700;">Dự Đoán Quy Mô</div>
            <div id="preflightEstQuestions" style="font-size: 15px; font-weight: 800; color: #2563eb; margin-top: 2px;">~${agg.estimatedQuestions} câu</div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 6px; padding: 6px 4px;">
            <div style="font-size: 10px; color: var(--text-secondary); font-weight: 700;">Token Đầu Vào (Input)</div>
            <div id="preflightEstInputTokens" style="font-size: 14.5px; font-weight: 800; color: #059669; margin-top: 2px;">~${agg.estimatedInputTokens.toLocaleString()}</div>
          </div>
          <div style="background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 6px; padding: 6px 4px;">
            <div style="font-size: 10px; color: var(--text-secondary); font-weight: 700;">Trần Output Cho Phép</div>
            <div id="preflightEstOutputTokens" style="font-size: 14.5px; font-weight: 800; color: #7c3aed; margin-top: 2px;">8,192 Token/đợt</div>
          </div>
        </div>

        <!-- Lời khuyên tối ưu hóa -->
        <div id="preflightEstAdvice" style="margin-top: 8px; font-size: 11.5px; color: ${agg.isLargeDocument ? '#b45309' : '#047857'}; background: ${agg.isLargeDocument ? '#fffbeb' : '#f0fdf4'}; border: 1px solid ${agg.isLargeDocument ? '#fde68a' : '#bbf7d0'}; padding: 6px 10px; border-radius: 4px; line-height: 1.45;">
          ${agg.advice}
        </div>
      </div>

      <!-- 2. TÙY CHỌN CẤU HÌNH GỬI AI & PHƯƠNG THỨC BÓC TÁCH -->
      <div style="background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm, 6px); padding: 12px 14px;">
        <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          ${Icons.get('sliders', 14, '', 'var(--brand-primary)')} <span>Cấu Hình Bóc Tách & Kế Hoạch Đợt</span>
        </h4>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <!-- Chọn Model AI -->
          <div>
            <label class="form-label" style="font-size: 11.5px; font-weight: 700; margin-bottom: 4px;">Mô hình Google Gemini:</label>
            <select id="preflightModelSelect" class="form-control" style="font-size: 12px; font-weight: 600;">
              ${modelsList.map(m => `
                <option value="${m.id}" ${m.id === currentModel ? 'selected' : ''}>
                  ${m.name} — ${m.badge}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Chọn Phương thức bóc tách -->
          <div>
            <label class="form-label" style="font-size: 11.5px; font-weight: 700; margin-bottom: 4px;">Phương thức bóc tách:</label>
            <select id="preflightMethodSelect" class="form-control" style="font-size: 12px; font-weight: 600;" onchange="App.onPreflightMethodChanged(this.value)">
              <option value="auto" selected>🔄 Setup 1: Tự Động Chia Đợt (Khuyên dùng - 50 câu/đợt)</option>
              <option value="manual">🛠️ Setup 2: Tùy Chỉnh Thủ Công (Chọn dải câu & số câu/đợt)</option>
              <option value="single">⚡ Setup 3: Bóc Tách 1 Lần Gọi Nhanh (Single Request)</option>
            </select>
          </div>
        </div>

        <!-- Khung Cấu Hình Thủ Công (Ẩn/Hiện khi chọn Setup 2) -->
        <div id="preflightManualControls" style="display: none; margin-top: 10px; padding: 10px; background: rgba(124, 58, 237, 0.04); border: 1px dashed rgba(124, 58, 237, 0.3); border-radius: 6px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #7c3aed; margin-bottom: 8px;">🛠️ Thiết lập dải câu hỏi và phân đợt thủ công:</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <div>
              <label style="font-size: 11px; color: var(--text-secondary);">Từ câu số:</label>
              <input type="number" id="preflightFromQ" class="form-control" style="font-size: 12px; height: 32px;" value="1" min="1" oninput="App.onPreflightManualInputsChanged()">
            </div>
            <div>
              <label style="font-size: 11px; color: var(--text-secondary);">Đến câu số:</label>
              <input type="number" id="preflightToQ" class="form-control" style="font-size: 12px; height: 32px;" value="${agg.estimatedQuestions || 50}" min="1" oninput="App.onPreflightManualInputsChanged()">
            </div>
            <div>
              <label style="font-size: 11px; color: var(--text-secondary);">Số câu mỗi đợt:</label>
              <select id="preflightManualBatchSize" class="form-control" style="font-size: 12px; height: 32px;" onchange="App.onPreflightManualInputsChanged()">
                <option value="25">25 câu/đợt (Rất nhẹ)</option>
                <option value="40">40 câu/đợt</option>
                <option value="50" selected>50 câu/đợt (Chuẩn)</option>
                <option value="80">80 câu/đợt</option>
                <option value="0">Tất cả trong 1 đợt</option>
              </select>
            </div>
          </div>
        </div>

        <!-- BẢNG KẾ HOẠCH ĐỢT BÓC TÁCH THỜI GIAN THỰC -->
        <div id="preflightBatchPlanSection" style="margin-top: 10px; border-top: 1px dashed var(--border); padding-top: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--brand-primary);" id="preflightBatchCountBadge">
              📦 Kế hoạch bóc tách: Web sẽ gửi <strong>${defaultBatches.length} đợt</strong>
            </span>
            <span style="font-size: 10.5px; color: var(--text-secondary);">Trần Google API: 8,192 Token Output/đợt</span>
          </div>

          <div style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border); border-radius: 4px; font-size: 11px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background: var(--bg); border-bottom: 1px solid var(--border);">
                  <th style="padding: 4px 6px;">Đợt</th>
                  <th style="padding: 4px 6px;">Phạm vi câu hỏi</th>
                  <th style="padding: 4px 6px; text-align:center;">Số câu</th>
                  <th style="padding: 4px 6px; text-align:center;">Trần Output Google</th>
                  <th style="padding: 4px 6px; text-align:center;">Đánh giá mức tải</th>
                </tr>
              </thead>
              <tbody id="preflightBatchPlanTableBody">
                ${this.renderBatchPlanRowsHtml(defaultBatches)}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. XEM FORM LỆNH & SYSTEM PROMPT -->
        <details style="margin-top: 10px; border-top: 1px dashed var(--border); padding-top: 6px;">
          <summary style="cursor: pointer; font-size: 11.5px; font-weight: 700; color: var(--brand-primary); user-select: none;">
            👁️ Xem Form Lệnh & Quy Tắc Cú Pháp gửi tới AI
          </summary>
          <div style="margin-top: 6px;">
            <textarea readonly style="width: 100%; height: 90px; font-size: 11px; font-family: var(--font-mono, monospace); background: var(--bg); border: 1px solid var(--border); border-radius: 4px; padding: 6px; resize: vertical; line-height: 1.4; color: var(--text-secondary);">${promptText}</textarea>
          </div>
        </details>
      </div>
    `;
  },

  renderBatchPlanRowsHtml(batches = []) {
    if (!batches || batches.length === 0) {
      return `<tr><td colspan="5" style="padding:6px; text-align:center; color:var(--text-secondary);">Chưa có đợt nào.</td></tr>`;
    }
    return batches.map(b => `
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 4px 6px; font-weight: 700; color: #7c3aed;">Đợt ${b.batchIndex}</td>
        <td style="padding: 4px 6px;">Câu ${b.fromQ} ➔ Câu ${b.toQ}</td>
        <td style="padding: 4px 6px; text-align:center; font-weight: 600;">${b.count} câu</td>
        <td style="padding: 4px 6px; text-align:center; color: #7c3aed; font-family: var(--font-mono, monospace);">Tối đa 8,192 Token</td>
        <td style="padding: 4px 6px; text-align:center;">
          ${b.isSafe
            ? '<span class="badge" style="font-size:9.5px; background:rgba(16,185,129,0.1); color:#059669; font-weight:700;">🟢 An toàn (< 60 câu)</span>'
            : '<span class="badge" style="font-size:9.5px; background:rgba(245,158,11,0.1); color:#d97706; font-weight:700;">🟡 Tiệm cận trần 8,192</span>'}
        </td>
      </tr>
    `).join('');
  },

  onPreflightMethodChanged(method) {
    const manualCtrl = document.getElementById("preflightManualControls");
    const planSec = document.getElementById("preflightBatchPlanSection");
    const agg = this.getPreflightAggregatedMetrics();

    if (method === "manual") {
      if (manualCtrl) manualCtrl.style.display = "block";
      if (planSec) planSec.style.display = "block";
      this.onPreflightManualInputsChanged();
    } else if (method === "auto") {
      if (manualCtrl) manualCtrl.style.display = "none";
      if (planSec) planSec.style.display = "block";
      const batches = (typeof GeminiAIParser !== "undefined")
        ? GeminiAIParser.estimateBatchPlan(agg.estimatedQuestions, 50, 1, agg.estimatedQuestions)
        : [{ batchIndex: 1, fromQ: 1, toQ: agg.estimatedQuestions, count: agg.estimatedQuestions, maxOutputLimit: 8192, isSafe: true }];

      const badge = document.getElementById("preflightBatchCountBadge");
      if (badge) badge.innerHTML = `📦 Kế hoạch bóc tách: Web sẽ gửi <strong>${batches.length} đợt</strong>`;
      const tbody = document.getElementById("preflightBatchPlanTableBody");
      if (tbody) tbody.innerHTML = this.renderBatchPlanRowsHtml(batches);
    } else {
      // Single
      if (manualCtrl) manualCtrl.style.display = "none";
      if (planSec) planSec.style.display = "block";
      const batches = [{ batchIndex: 1, fromQ: 1, toQ: agg.estimatedQuestions, count: agg.estimatedQuestions, maxOutputLimit: 8192, isSafe: agg.estimatedQuestions <= 60 }];
      const badge = document.getElementById("preflightBatchCountBadge");
      if (badge) badge.innerHTML = `📦 Kế hoạch bóc tách: Web sẽ gửi <strong>1 đợt duy nhất</strong>`;
      const tbody = document.getElementById("preflightBatchPlanTableBody");
      if (tbody) tbody.innerHTML = this.renderBatchPlanRowsHtml(batches);
    }
  },

  onPreflightManualInputsChanged() {
    const fromQEl = document.getElementById("preflightFromQ");
    const toQEl = document.getElementById("preflightToQ");
    const sizeEl = document.getElementById("preflightManualBatchSize");

    const fromQ = fromQEl ? (parseInt(fromQEl.value, 10) || 1) : 1;
    const toQ = toQEl ? (parseInt(toQEl.value, 10) || 50) : 50;
    const batchSize = sizeEl ? parseInt(sizeEl.value, 10) : 50;

    const batches = (typeof GeminiAIParser !== "undefined")
      ? GeminiAIParser.estimateBatchPlan(toQ, batchSize, fromQ, toQ)
      : [];

    const totalQ = Math.max(0, toQ - fromQ + 1);
    const badge = document.getElementById("preflightBatchCountBadge");
    if (badge) badge.innerHTML = `📦 Kế hoạch bóc tách: Web sẽ gửi <strong>${batches.length} đợt</strong> (${totalQ} câu: từ câu ${fromQ} ➔ ${toQ})`;
    const tbody = document.getElementById("preflightBatchPlanTableBody");
    if (tbody) tbody.innerHTML = this.renderBatchPlanRowsHtml(batches);

    const qEl = document.getElementById("preflightEstQuestions");
    if (qEl) qEl.textContent = `~${totalQ} câu`;
  },

  /**
   * Thực thi gửi toàn bộ danh sách tệp tới Google Gemini AI theo kế hoạch đợt đã duyệt
   */
  async executeAiParseConfirmed() {
    const files = this._pendingAiFiles || [];
    if (files.length === 0) {
      this.closeModal();
      return;
    }

    const modelSelect = document.getElementById("preflightModelSelect");
    const methodSelect = document.getElementById("preflightMethodSelect");
    const selectedModel = modelSelect ? modelSelect.value : "gemini-3.5-flash-lite";
    const method = methodSelect ? methodSelect.value : "auto";

    let fromQ = 1;
    let toQ = null;
    let batchSize = 50;

    if (method === "manual") {
      const fQEl = document.getElementById("preflightFromQ");
      const tQEl = document.getElementById("preflightToQ");
      const bSEl = document.getElementById("preflightManualBatchSize");
      fromQ = fQEl ? parseInt(fQEl.value, 10) || 1 : 1;
      toQ = tQEl ? parseInt(tQEl.value, 10) || null : null;
      batchSize = bSEl ? parseInt(bSEl.value, 10) : 50;
    } else if (method === "single") {
      batchSize = 0;
    }

    // Cập nhật model đã chọn vào LocalStorage & Header badge
    if (typeof GeminiAIParser !== "undefined") {
      GeminiAIParser.setSelectedModel(selectedModel);
      const name = GeminiAIParser.getModelDisplayName(selectedModel);
      const el = document.getElementById("parserActiveModelName");
      if (el) el.textContent = name;
    }

    const confirmBtn = document.getElementById("btnConfirmSendAi");
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span class="spinner-inline" style="width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; display:inline-block; animation:spin 0.8s linear infinite;"></span> <span>Đang xử lý ${files.length} tệp...</span>`;
    }

    this.showToast(`🪄 Bắt đầu bóc tách ${files.length} tệp đề thi bằng Google Gemini AI [${selectedModel}]...`, "info", 4000);

    try {
      if (typeof GeminiAIParser === "undefined") {
        throw new Error("Không tìm thấy dịch vụ GeminiAIParser.");
      }

      let allExtractedText = "";
      let totalQuestionsAllFiles = 0;
      let totalDurationAllFiles = 0;
      let totalBatchesRun = 0;

      for (let fIdx = 0; fIdx < files.length; fIdx++) {
        const file = files[fIdx];
        const fileNum = fIdx + 1;

        if (window.DynamicIsland && typeof DynamicIsland.show === "function") {
          DynamicIsland.show({
            title: `Google Gemini AI [Tệp ${fileNum}/${files.length}]`,
            subtitle: `Đang xử lý ${file.name}...`,
            icon: "sparkles",
            pulse: true
          });
        }

        let fileResult;

        if (method === "single" || (batchSize === 0)) {
          fileResult = await GeminiAIParser.parseDocument(file, {
            model: selectedModel,
            fromQuestion: fromQ,
            toQuestion: toQ
          });
          totalBatchesRun += 1;
        } else {
          fileResult = await GeminiAIParser.parseDocumentInBatches(file, {
            model: selectedModel,
            fromQuestion: fromQ,
            toQuestion: toQ,
            batchSize: batchSize
          }, (progress) => {
            if (confirmBtn) {
              confirmBtn.innerHTML = `<span class="spinner-inline" style="width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; display:inline-block; animation:spin 0.8s linear infinite;"></span> <span>Tệp ${fileNum}/${files.length} · Đợt ${progress.currentBatch}/${progress.totalBatches}...</span>`;
            }
            if (progress.status === "batch_done" && progress.combinedText) {
              const currentFullText = (allExtractedText ? allExtractedText + "\n\n" : "") + progress.combinedText;
              const textarea = document.getElementById("rawInputTextarea");
              if (textarea) {
                textarea.value = currentFullText;
                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                this.onParserInputChanged();
              }
            }
          });
          totalBatchesRun += (fileResult.totalBatches || 1);
        }

        if (fileResult && fileResult.text) {
          const chunk = fileResult.text.trim();
          if (chunk) {
            allExtractedText += (allExtractedText ? "\n\n" : "") + chunk;
            const qCount = (chunk.match(/(?:^|\n)\s*(?:câu|cau|question)\s*(?::\s*)?\[?\d+\]?[\:\.\-]/gi) || []).length;
            totalQuestionsAllFiles += (fileResult.questionCount || qCount);
          }
        }
        totalDurationAllFiles += (fileResult.durationMs || 0);
      }

      // 🎯 ĐỔ TOÀN BỘ VĂN BẢN VÀO TEXTAREA VÀ BẮN EVENT
      const textarea = document.getElementById("rawInputTextarea");
      if (textarea) {
        textarea.value = allExtractedText;
        textarea.scrollTop = 0;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        this.onParserInputChanged();
      }

      // Đóng modal tiền kiểm soát
      this.closeModal();

      if (window.DynamicIsland && typeof DynamicIsland.show === "function") {
        DynamicIsland.show({
          title: "Bóc Tách Hoàn Tất",
          subtitle: `Đã nạp ${totalQuestionsAllFiles} câu từ ${files.length} tệp · ${totalDurationAllFiles}ms`,
          icon: "checkCircle",
          autoHide: 4500
        });
      }

      const batchMsg = (totalBatchesRun > 1) ? ` qua ${totalBatchesRun} đợt` : "";
      this.showToast(`🎉 Google Gemini AI [${selectedModel}] đã bóc tách thành công ${totalQuestionsAllFiles} câu từ ${files.length} tệp${batchMsg} [${totalDurationAllFiles}ms]!`, "success", 6000);

      if (window.AudioFx && typeof AudioFx.play === "function") {
        AudioFx.play("complete");
      }

    } catch (err) {
      console.error("Multi-File Parser Error:", err);
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `🚀 Thử Lại`;
      }
      if (window.DynamicIsland && typeof DynamicIsland.show === "function") {
        DynamicIsland.show({
          title: "Lỗi Bóc Tách",
          subtitle: err.message,
          icon: "alertTriangle",
          autoHide: 6000
        });
      }
      this.showToast(`❌ Lỗi bóc tách: ${err.message}`, "danger", 6000);
    }
  },

  openPipelineStudio() {
    const textarea = document.getElementById("rawInputTextarea");
    const currentText = textarea ? textarea.value : "";
    
    // Gửi dữ liệu thực tế đang có sang Pipeline Studio
    try {
      if (currentText.trim()) {
        localStorage.setItem("shinora_studio_realtime_input", currentText);
      }
    } catch (e) {}

    window.open("pipeline-studio.html", "_blank");
  }
});
