/**
 * MATERIALS & KNOWLEDGE HUB (DOCMASTER) VIEW MODULE
 * Thư viện tài liệu học tập số, Cây thư mục (Tree Explorer), Trình đọc sách thông minh (Smart Reader),
 * Menu chuột phải chuẩn VS Code (Right-Click Context Menu: Open, New File/Folder, Cut, Copy, Paste, Rename F2, Delete Del, Change Icon),
 * Đổi tên trực tiếp tại chỗ (Inline Renaming), Cửa sổ chọn biểu tượng (Icon Picker Modal),
 * Kéo thả (Drag & Drop) tự mở sau 1s, Chế độ bảo vệ mắt (Sepia).
 * Tác giả: Shina (Bùi Văn Khang)
 */

Object.assign(App, {
  docReaderTheme: (typeof localStorage !== "undefined" && localStorage.getItem("dthu_doc_theme")) || "auto",
  docEyeCareWarmth: (typeof localStorage !== "undefined" && parseInt(localStorage.getItem("dthu_doc_warmth"), 10)) || 0,
  docReaderFontSize: 16,
  docSidebarCollapsed: false,
  docSearchKeyword: "",
  docActiveTab: "all", // 'all' | 'bookmarks' | 'recent'
  docOpenFolders: new Set(["fld-llct", "fld-pol102"]),
  docFoldersInitialized: false,
  docSelectedContext: { type: "root", id: null, folderId: null, name: "Cấp gốc (Home)" },
  docRenamingItem: null, // { id: string, type: 'folder'|'file' } | null
  docClipboard: null, // { action: 'cut'|'copy', type: 'file'|'folder', id: string, name: string }
  docDragHoverTimer: null,
  docDraggingItem: null,
  docGlobalEventsBound: false,
  docExplorerFocused: false,
  activeFlashcardIndex: 0,
  currentFlashcards: [],
  docIconPickerState: { id: null, type: null, selectedIcon: "📁", searchKw: "" },

  renderDocMarkdown(rawText) {
    if (!rawText) return "";
    let html = rawText;

    // Escape HTML tags slightly but allow safe formatting
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Headers with IDs for mini-ToC
    html = html.replace(/^# (.*$)/gim, '<h1 id="sec-$1">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 id="sec-$1">📌 $1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 id="sec-$1">🔹 $1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 id="sec-$1">$1</h4>');

    // Blockquotes & Callout Alerts
    html = html.replace(/^> (.*$)/gim, '<blockquote>💡 $1</blockquote>');

    // Bold, Italic, Strikethrough
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    // Inline Code & Pre blocks
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr>');

    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');

    // Wrap list items
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/gim, '');

    // Paragraphs / linebreaks
    html = html.split('\n\n').map(para => {
      para = para.trim();
      if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<block') || para.startsWith('<hr')) {
        return para;
      }
      return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  },

  initDocGlobalEvents() {
    if (this.docGlobalEventsBound) return;
    this.docGlobalEventsBound = true;

    // Track whether mouse/focus is inside the explorer sidebar
    window.addEventListener("mousedown", (e) => {
      const explorer = document.querySelector(".doc-tree-explorer");
      const contextMenu = document.getElementById("docContextMenu");
      if (contextMenu && contextMenu.contains(e.target)) {
        return;
      }
      if (explorer && explorer.contains(e.target)) {
        this.docExplorerFocused = true;
      } else {
        this.docExplorerFocused = false;
      }
    });

    // Global click: close context menu & popovers
    window.addEventListener("click", (e) => {
      this.closeDocContextMenu();
      const themePopover = document.getElementById("docThemePopoverWrapper");
      if (themePopover && !themePopover.contains(e.target)) {
        this.closeDocThemePopover();
      }
      const morePopover = document.getElementById("docMoreToolsPopoverWrapper");
      if (morePopover && !morePopover.contains(e.target)) {
        this.closeDocMoreToolsPopover();
      }
    });

    // Global keyboard shortcuts (Scaped strictly to tree explorer only)
    window.addEventListener("keydown", (e) => {
      const hash = window.location.hash.split("?")[0];
      if (hash !== "#materials") return;

      if (e.key === "Escape") {
        this.closeDocContextMenu();
        if (this.docRenamingItem) {
          this.cancelInlineRename();
        }
        return;
      }

      // Check app settings for shortcuts toggle
      const settings = StorageService.getAppSettings();
      if (settings.enableExplorerShortcuts === false) return;

      // DO NOT trigger explorer shortcuts if typing inside general inputs or if focus is outside the explorer tree!
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      if ((tag === "input" || tag === "textarea" || tag === "select") && !document.activeElement.classList.contains("doc-inline-rename-input")) {
        return;
      }
      if (!this.docExplorerFocused && !this.docRenamingItem) return;

      if (e.key === "F2") {
        e.preventDefault();
        this.renameSelectedDocItem();
      } else if (e.key === "Delete" && !this.docRenamingItem) {
        e.preventDefault();
        this.deleteSelectedDocItem();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "c" && !this.docRenamingItem) {
        if (this.docSelectedContext && this.docSelectedContext.type !== "root") {
          e.preventDefault();
          this.copyDocItem(this.docSelectedContext.id, this.docSelectedContext.type);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "x" && !this.docRenamingItem) {
        if (this.docSelectedContext && this.docSelectedContext.type !== "root") {
          e.preventDefault();
          this.cutDocItem(this.docSelectedContext.id, this.docSelectedContext.type);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v" && !this.docRenamingItem) {
        if (this.docClipboard) {
          e.preventDefault();
          this.pasteDocItem();
        }
      }
    });
  },

  renderMaterialsView(container, activeId) {
    this.initDocGlobalEvents();

    if (!StorageService.isLoggedIn()) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; max-width: 550px; margin: 0 auto;">
          <div style="font-size: 56px; margin-bottom: 14px;">📚</div>
          <h3 style="font-size: 22px; font-weight: 800; color: var(--text-primary);">Thư Viện Tài Liệu Học Tập Số</h3>
          <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">
            Chào mừng bạn đến với <strong>Shinora Knowledge Hub</strong>. Vui lòng đăng nhập tài khoản sinh viên để mở khóa toàn bộ kho giáo trình tóm tắt, đề cương ôn tập và công cụ đọc thông minh.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 24px;">
            <button class="btn btn-primary" onclick="App.openAccountSwitcherModal()">🔑 Đăng Nhập Ngay ➔</button>
            <button class="btn" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
          </div>
        </div>
      `;
      return;
    }

    const materials = StorageService.getMaterials();
    const folders = StorageService.getFolders();
    const bookmarks = StorageService.getBookmarks();
    const recentDocs = StorageService.getRecentDocs();

    // Select active material
    let active = null;
    if (activeId) {
      active = materials.find(m => m.id === activeId);
    }
    if (!active && materials.length > 0) {
      active = materials[0];
    }
    this.activeMaterialId = active ? active.id : null;

    if (active) {
      StorageService.recordRecentDoc(active.id);
    }

    // Auto-open parent folder of active document ONLY once on first initial load
    if (!this.docFoldersInitialized && active && active.folderId) {
      this.docOpenFolders.add(active.folderId);
      const parentFld = folders.find(f => f.id === active.folderId);
      if (parentFld && parentFld.parentId) {
        this.docOpenFolders.add(parentFld.parentId);
      }
      this.docFoldersInitialized = true;
    }

    // Calculate reading stats
    const wordCount = active ? (active.wordCount || (active.content ? active.content.split(/\s+/).length : 0)) : 0;
    const readTime = active ? (active.readTimeMin || Math.max(1, Math.round(wordCount / 250))) : 0;
    const isBookmarked = active ? StorageService.isBookmarked(active.id) : false;

    // Filter documents based on current tab & search
    let filteredMaterials = [...materials];
    if (this.docActiveTab === "bookmarks") {
      filteredMaterials = filteredMaterials.filter(m => bookmarks.includes(m.id));
    } else if (this.docActiveTab === "recent") {
      filteredMaterials = recentDocs.map(id => materials.find(m => m.id === id)).filter(Boolean);
    }

    if (this.docSearchKeyword) {
      const kw = this.docSearchKeyword.toLowerCase();
      filteredMaterials = filteredMaterials.filter(m =>
        m.title.toLowerCase().includes(kw) ||
        (m.description && m.description.toLowerCase().includes(kw)) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(kw))) ||
        (m.subjectId && m.subjectId.toLowerCase().includes(kw))
      );
    }

    // Render tree items
    const renderFolderTree = () => {
      if (this.docSearchKeyword || this.docActiveTab !== "all") {
        // Flat list for search / bookmarks / recent
        if (filteredMaterials.length === 0) {
          return `<div style="text-align: center; padding: 24px 10px; color: var(--text-tertiary); font-size: 12.5px;">Không tìm thấy tài liệu phù hợp.</div>`;
        }
        return filteredMaterials.map(m => {
          const isCut = this.docClipboard && this.docClipboard.action === "cut" && this.docClipboard.id === m.id;
          const isRenaming = this.docRenamingItem && this.docRenamingItem.id === m.id;

          return `
            <div
              class="doc-item-row ${m.id === this.activeMaterialId ? 'active' : ''} ${this.docSelectedContext.id === m.id ? 'selected-context' : ''} ${isCut ? 'is-cut' : ''}"
              onclick="App.onDocFileClick('${m.id}', event)"
              oncontextmenu="App.onDocContextMenu(event, 'file', '${m.id}')"
              draggable="${!isRenaming}"
              ondragstart="App.onDocDragStart(event, 'file', '${m.id}')"
              ondragend="App.onDocDragEnd(event)"
            >
              ${isRenaming ? `
                <div class="doc-inline-rename-wrapper" onclick="event.stopPropagation()">
                  <span style="font-size: 14px;">${m.icon || '📄'}</span>
                  <input
                    type="text"
                    id="docInlineRenameInput"
                    class="doc-inline-rename-input"
                    value="${m.title.replace(/"/g, '&quot;')}"
                    onkeydown="App.onInlineRenameKeydown(event, '${m.id}', 'file')"
                    onblur="App.saveInlineRename('${m.id}', 'file', this.value)"
                  >
                  <button type="button" class="doc-inline-icon-picker-btn" title="Đổi biểu tượng (Icon)" onclick="event.stopPropagation(); App.openIconPickerModal('${m.id}', 'file')">
                    🎨
                  </button>
                </div>
              ` : `
                <div class="doc-item-title-wrapper">
                  <span>${m.icon || '📄'}</span>
                  <span title="${m.title}">${m.title}</span>
                </div>
                <button class="doc-item-star-btn ${StorageService.isBookmarked(m.id) ? 'bookmarked' : ''}" onclick="event.stopPropagation(); App.toggleDocBookmark('${m.id}')" title="Ghim yêu thích">
                  ${StorageService.isBookmarked(m.id) ? '★' : '☆'}
                </button>
              `}
            </div>
          `;
        }).join('');
      }

      // Hierarchical Folders Tree
      const rootFolders = folders.filter(f => !f.parentId);
      return rootFolders.map(rootFld => {
        const isOpenRoot = this.docOpenFolders.has(rootFld.id);
        const subFolders = folders.filter(f => f.parentId === rootFld.id);
        const directDocs = materials.filter(m => m.folderId === rootFld.id);
        const totalDocsInGroup = materials.filter(m => m.folderId === rootFld.id || subFolders.some(sf => sf.id === m.folderId)).length;
        const isRootSelected = this.docSelectedContext.id === rootFld.id;
        const isCutRoot = this.docClipboard && this.docClipboard.action === "cut" && this.docClipboard.id === rootFld.id;
        const isRenamingRoot = this.docRenamingItem && this.docRenamingItem.id === rootFld.id;

        return `
          <div class="doc-folder-group">
            <div
              class="doc-folder-title ${isRootSelected ? 'selected-context' : ''} ${isCutRoot ? 'is-cut' : ''}"
              onclick="App.onDocFolderClick('${rootFld.id}', event)"
              oncontextmenu="App.onDocContextMenu(event, 'folder', '${rootFld.id}')"
              draggable="${!isRenamingRoot}"
              ondragstart="App.onDocDragStart(event, 'folder', '${rootFld.id}')"
              ondragend="App.onDocDragEnd(event)"
              ondragover="App.onDocDragOver(event, '${rootFld.id}')"
              ondragleave="App.onDocDragLeave(event, '${rootFld.id}')"
              ondrop="App.onDocDrop(event, '${rootFld.id}')"
              title="Nhấp chuột phải để mở Menu tùy chọn (VS Code)"
            >
              ${isRenamingRoot ? `
                <div class="doc-inline-rename-wrapper" onclick="event.stopPropagation()">
                  <span class="doc-folder-arrow ${isOpenRoot ? 'open' : ''}">▶</span>
                  <span style="font-size: 14px;">${rootFld.icon || '📁'}</span>
                  <input
                    type="text"
                    id="docInlineRenameInput"
                    class="doc-inline-rename-input"
                    value="${rootFld.name.replace(/"/g, '&quot;')}"
                    onkeydown="App.onInlineRenameKeydown(event, '${rootFld.id}', 'folder')"
                    onblur="App.saveInlineRename('${rootFld.id}', 'folder', this.value)"
                  >
                  <button type="button" class="doc-inline-icon-picker-btn" title="Đổi biểu tượng (Icon)" onclick="event.stopPropagation(); App.openIconPickerModal('${rootFld.id}', 'folder')">
                    🎨
                  </button>
                </div>
              ` : `
                <div class="doc-folder-left">
                  <span class="doc-folder-arrow ${isOpenRoot ? 'open' : ''}">▶</span>
                  <span>${rootFld.icon || '📁'}</span>
                  <span>${rootFld.name}</span>
                </div>
                <span class="doc-folder-badge">${totalDocsInGroup}</span>
              `}
            </div>

            ${isOpenRoot ? `
              <div class="doc-folder-items">
                <!-- Subfolders -->
                ${subFolders.map(subFld => {
                  const isOpenSub = this.docOpenFolders.has(subFld.id);
                  const subDocs = materials.filter(m => m.folderId === subFld.id);
                  const isSubSelected = this.docSelectedContext.id === subFld.id;
                  const isCutSub = this.docClipboard && this.docClipboard.action === "cut" && this.docClipboard.id === subFld.id;
                  const isRenamingSub = this.docRenamingItem && this.docRenamingItem.id === subFld.id;

                  return `
                    <div class="doc-folder-group" style="margin-top: 2px;">
                      <div
                        class="doc-folder-title ${isSubSelected ? 'selected-context' : ''} ${isCutSub ? 'is-cut' : ''}"
                        style="font-size: 12.5px;"
                        onclick="App.onDocFolderClick('${subFld.id}', event)"
                        oncontextmenu="App.onDocContextMenu(event, 'folder', '${subFld.id}')"
                        draggable="${!isRenamingSub}"
                        ondragstart="App.onDocDragStart(event, 'folder', '${subFld.id}')"
                        ondragend="App.onDocDragEnd(event)"
                        ondragover="App.onDocDragOver(event, '${subFld.id}')"
                        ondragleave="App.onDocDragLeave(event, '${subFld.id}')"
                        ondrop="App.onDocDrop(event, '${subFld.id}')"
                        title="Nhấp chuột phải để mở Menu tùy chọn (VS Code)"
                      >
                        ${isRenamingSub ? `
                          <div class="doc-inline-rename-wrapper" onclick="event.stopPropagation()">
                            <span class="doc-folder-arrow ${isOpenSub ? 'open' : ''}">▶</span>
                            <span style="font-size: 14px;">${subFld.icon || '📂'}</span>
                            <input
                              type="text"
                              id="docInlineRenameInput"
                              class="doc-inline-rename-input"
                              value="${subFld.name.replace(/"/g, '&quot;')}"
                              onkeydown="App.onInlineRenameKeydown(event, '${subFld.id}', 'folder')"
                              onblur="App.saveInlineRename('${subFld.id}', 'folder', this.value)"
                            >
                            <button type="button" class="doc-inline-icon-picker-btn" title="Đổi biểu tượng (Icon)" onclick="event.stopPropagation(); App.openIconPickerModal('${subFld.id}', 'folder')">
                              🎨
                            </button>
                          </div>
                        ` : `
                          <div class="doc-folder-left">
                            <span class="doc-folder-arrow ${isOpenSub ? 'open' : ''}">▶</span>
                            <span>${subFld.icon || '📂'}</span>
                            <span>${subFld.name}</span>
                          </div>
                          <span class="doc-folder-badge" style="font-size: 10px;">${subDocs.length}</span>
                        `}
                      </div>

                      ${isOpenSub ? `
                        <div class="doc-folder-items">
                          ${subDocs.map(m => {
                            const isCutDoc = this.docClipboard && this.docClipboard.action === "cut" && this.docClipboard.id === m.id;
                            const isRenamingDoc = this.docRenamingItem && this.docRenamingItem.id === m.id;

                            return `
                              <div
                                class="doc-item-row ${m.id === this.activeMaterialId ? 'active' : ''} ${this.docSelectedContext.id === m.id ? 'selected-context' : ''} ${isCutDoc ? 'is-cut' : ''}"
                                onclick="App.onDocFileClick('${m.id}', event)"
                                oncontextmenu="App.onDocContextMenu(event, 'file', '${m.id}')"
                                draggable="${!isRenamingDoc}"
                                ondragstart="App.onDocDragStart(event, 'file', '${m.id}')"
                                ondragend="App.onDocDragEnd(event)"
                              >
                                ${isRenamingDoc ? `
                                  <div class="doc-inline-rename-wrapper" onclick="event.stopPropagation()">
                                    <span style="font-size: 14px;">${m.icon || '📄'}</span>
                                    <input
                                      type="text"
                                      id="docInlineRenameInput"
                                      class="doc-inline-rename-input"
                                      value="${m.title.replace(/"/g, '&quot;')}"
                                      onkeydown="App.onInlineRenameKeydown(event, '${m.id}', 'file')"
                                      onblur="App.saveInlineRename('${m.id}', 'file', this.value)"
                                    >
                                    <button type="button" class="doc-inline-icon-picker-btn" title="Đổi biểu tượng (Icon)" onclick="event.stopPropagation(); App.openIconPickerModal('${m.id}', 'file')">
                                      🎨
                                    </button>
                                  </div>
                                ` : `
                                  <div class="doc-item-title-wrapper">
                                    <span>${m.icon || '📄'}</span>
                                    <span title="${m.title}">${m.title}</span>
                                  </div>
                                  <button class="doc-item-star-btn ${StorageService.isBookmarked(m.id) ? 'bookmarked' : ''}" onclick="event.stopPropagation(); App.toggleDocBookmark('${m.id}')" title="Ghim yêu thích">
                                    ${StorageService.isBookmarked(m.id) ? '★' : '☆'}
                                  </button>
                                `}
                              </div>
                            `;
                          }).join('')}
                          ${subDocs.length === 0 ? `<div style="font-size: 11.5px; color: var(--text-tertiary); padding: 4px 8px;">(Thư mục trống)</div>` : ''}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}

                <!-- Direct docs under root -->
                ${directDocs.map(m => {
                  const isCutDoc = this.docClipboard && this.docClipboard.action === "cut" && this.docClipboard.id === m.id;
                  const isRenamingDoc = this.docRenamingItem && this.docRenamingItem.id === m.id;

                  return `
                    <div
                      class="doc-item-row ${m.id === this.activeMaterialId ? 'active' : ''} ${this.docSelectedContext.id === m.id ? 'selected-context' : ''} ${isCutDoc ? 'is-cut' : ''}"
                      onclick="App.onDocFileClick('${m.id}', event)"
                      oncontextmenu="App.onDocContextMenu(event, 'file', '${m.id}')"
                      draggable="${!isRenamingDoc}"
                      ondragstart="App.onDocDragStart(event, 'file', '${m.id}')"
                      ondragend="App.onDocDragEnd(event)"
                    >
                      ${isRenamingDoc ? `
                        <div class="doc-inline-rename-wrapper" onclick="event.stopPropagation()">
                          <span style="font-size: 14px;">${m.icon || '📄'}</span>
                          <input
                            type="text"
                            id="docInlineRenameInput"
                            class="doc-inline-rename-input"
                            value="${m.title.replace(/"/g, '&quot;')}"
                            onkeydown="App.onInlineRenameKeydown(event, '${m.id}', 'file')"
                            onblur="App.saveInlineRename('${m.id}', 'file', this.value)"
                          >
                          <button type="button" class="doc-inline-icon-picker-btn" title="Đổi biểu tượng (Icon)" onclick="event.stopPropagation(); App.openIconPickerModal('${m.id}', 'file')">
                            🎨
                          </button>
                        </div>
                      ` : `
                        <div class="doc-item-title-wrapper">
                          <span>${m.icon || '📄'}</span>
                          <span title="${m.title}">${m.title}</span>
                        </div>
                        <button class="doc-item-star-btn ${StorageService.isBookmarked(m.id) ? 'bookmarked' : ''}" onclick="event.stopPropagation(); App.toggleDocBookmark('${m.id}')" title="Ghim yêu thích">
                          ${StorageService.isBookmarked(m.id) ? '★' : '☆'}
                        </button>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    };

    // Main layout HTML
    container.innerHTML = `
      <div class="view-materials">
        <!-- Banner Header -->
        <div class="docmaster-header-banner">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0;">
                📚 Shinora Knowledge Hub
              </h2>
              <span class="badge badge-primary">Thư Viện Số</span>
            </div>
            <p style="color: var(--text-secondary); margin: 4px 0 0 0; font-size: 13px;">
              Kho học liệu số, tóm tắt lý thuyết trọng tâm & sổ tay tra cứu thông minh Đại học Đồng Tháp.
            </p>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); font-style: italic; font-weight: 500;">
            📖 Học tập chủ động · Tra cứu thông minh · Kiến thức trong tầm tay
          </div>
        </div>

        <!-- 2-Column Workpsace -->
        <div class="docmaster-layout ${this.docSidebarCollapsed ? 'sidebar-collapsed' : ''}" id="docmasterLayout">
          
          <!-- LEFT: Explorer Tree -->
          <aside class="doc-tree-explorer">
            <div class="doc-explorer-header">
              <!-- Explorer Titlebar -->
              <div class="doc-explorer-titlebar">
                <span class="doc-explorer-heading">📁 Mục Lục Tài Liệu</span>
              </div>

              <!-- Search Box -->
              <div class="doc-search-wrapper">
                <input
                  type="text"
                  id="docSearchInput"
                  class="doc-search-input"
                  placeholder="🔍 Tìm bài viết, môn học..."
                  value="${this.docSearchKeyword}"
                  oninput="App.onDocSearchInput(this.value)"
                >
                ${this.docSearchKeyword ? `
                  <button class="doc-search-clear" onclick="App.clearDocSearch()">✕</button>
                ` : ''}
              </div>

              <!-- Filter Tabs -->
              <div class="doc-filter-tabs">
                <button class="doc-filter-tab ${this.docActiveTab === 'all' ? 'active' : ''}" onclick="App.switchDocTab('all')">
                  📚 Tất cả (${materials.length})
                </button>
                <button class="doc-filter-tab ${this.docActiveTab === 'bookmarks' ? 'active' : ''}" onclick="App.switchDocTab('bookmarks')">
                  ⭐ Đã ghim (${bookmarks.length})
                </button>
                <button class="doc-filter-tab ${this.docActiveTab === 'recent' ? 'active' : ''}" onclick="App.switchDocTab('recent')">
                  🕒 Gần đây
                </button>
              </div>
            </div>

            <!-- Tree Content (Clicking or Right-clicking empty area defaults to Root Level) -->
            <div
              class="doc-tree-content"
              id="docTreeContent"
              onclick="App.onTreeEmptyAreaClick(event)"
              oncontextmenu="App.onDocContextMenu(event, 'root', null)"
              ondragover="App.onDocDragOver(event, null)"
              ondrop="App.onDocDropToRoot(event)"
              style="min-height: 250px;"
            >
              ${renderFolderTree()}
            </div>
          </aside>

          <!-- RIGHT: Interactive Reader Canvas -->
          <main class="doc-reader-canvas theme-${this.getEffectiveDocTheme(this.docReaderTheme)}" id="docReaderCanvas" style="--doc-font-size: ${this.docReaderFontSize}px; --doc-warmth: ${this.docEyeCareWarmth};">
            
            <!-- Topbar Reader Tools -->
            <div class="doc-reader-topbar">
              <!-- Left: Sidebar Toggle & Breadcrumb -->
              <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex-shrink: 1;">
                <button id="docSidebarToggleBtn" class="btn btn-sm ${this.docSidebarCollapsed ? 'btn-primary' : ''}" onclick="App.toggleDocSidebar()" title="${this.docSidebarCollapsed ? 'Mở thanh thư mục' : 'Thu gọn thanh thư mục (Zen Mode)'}">
                  ${this.docSidebarCollapsed ? '📂 Mở Mục Lục' : '◀ Thu Gọn'}
                </button>
                
                ${active ? `
                  <div class="doc-breadcrumb">
                    <span style="opacity: 0.7;">${active.subjectId || 'DThu'}</span>
                    <span style="opacity: 0.5;">/</span>
                    <span class="doc-breadcrumb-title" title="${active.title}">${active.title}</span>
                  </div>
                ` : ''}
              </div>

              <!-- Right: Reading Controls (Cố định 1 hàng, không tràn) -->
              <div class="doc-reader-tools">
                <!-- Theme Dropdown Popover -->
                <div class="doc-theme-popover-wrapper" id="docThemePopoverWrapper">
                  <button
                    type="button"
                    class="doc-theme-trigger-btn"
                    id="docThemeTriggerBtn"
                    onclick="App.toggleDocThemePopover(event)"
                    title="Tùy biến chế độ màu sắc và bộ lọc bảo vệ mắt"
                  >
                    <span>🎨 ${this.getDocThemeLabel(this.docReaderTheme)}</span>
                    <span style="font-size: 10px; margin-left: 2px;">▾</span>
                  </button>

                  <div class="doc-theme-popover-menu" id="docThemePopoverMenu" style="display: none;" onclick="event.stopPropagation()">
                    <div class="doc-theme-popover-section-title">
                      <span>🎨 Chế Độ Màu Sắc</span>
                    </div>
                    
                    <div class="doc-theme-card-grid">
                      <div class="doc-theme-card-item ${this.docReaderTheme === 'auto' ? 'active' : ''}" data-theme="auto" onclick="App.setDocReaderTheme('auto')">
                        <span class="doc-theme-preview-dot" style="background: linear-gradient(135deg, #ffffff 50%, #0f172a 50%);"></span>
                        <span>💻 Hệ Thống</span>
                      </div>
                      <div class="doc-theme-card-item ${this.docReaderTheme === 'light' ? 'active' : ''}" data-theme="light" onclick="App.setDocReaderTheme('light')">
                        <span class="doc-theme-preview-dot" style="background: #ffffff;"></span>
                        <span>☀️ Sáng</span>
                      </div>
                      <div class="doc-theme-card-item ${this.docReaderTheme === 'sepia' ? 'active' : ''}" data-theme="sepia" onclick="App.setDocReaderTheme('sepia')">
                        <span class="doc-theme-preview-dot" style="background: #fbf0d9;"></span>
                        <span>📜 Sepia</span>
                      </div>
                      <div class="doc-theme-card-item ${this.docReaderTheme === 'dark' ? 'active' : ''}" data-theme="dark" onclick="App.setDocReaderTheme('dark')">
                        <span class="doc-theme-preview-dot" style="background: #0f172a;"></span>
                        <span>🌙 Tối</span>
                      </div>
                      <div class="doc-theme-card-item ${this.docReaderTheme === 'forest' ? 'active' : ''}" data-theme="forest" onclick="App.setDocReaderTheme('forest')">
                        <span class="doc-theme-preview-dot" style="background: #edf6ed;"></span>
                        <span>🌿 Rừng Xanh</span>
                      </div>
                      <div class="doc-theme-card-item ${this.docReaderTheme === 'mocha' ? 'active' : ''}" data-theme="mocha" onclick="App.setDocReaderTheme('mocha')">
                        <span class="doc-theme-preview-dot" style="background: #231d19;"></span>
                        <span>☕ Cà Phê</span>
                      </div>
                    </div>

                    <div class="doc-theme-popover-section-title">
                      <span>🛡️ Lọc Ánh Sáng Xanh</span>
                      <strong id="docWarmthValDisplay" style="color: #d97706; font-size: 12px;">${this.docEyeCareWarmth}%</strong>
                    </div>

                    <div class="doc-warmth-slider-box">
                      <input
                        type="range"
                        id="docWarmthRangeInput"
                        class="doc-warmth-range-input"
                        min="0"
                        max="100"
                        step="5"
                        value="${this.docEyeCareWarmth}"
                        oninput="App.onDocWarmthChange(this.value)"
                      >
                      <div class="doc-warmth-quick-pills">
                        <button type="button" class="doc-warmth-pill ${this.docEyeCareWarmth === 0 ? 'active' : ''}" data-val="0" onclick="App.onDocWarmthChange(0)">Tắt (0%)</button>
                        <button type="button" class="doc-warmth-pill ${this.docEyeCareWarmth === 30 ? 'active' : ''}" data-val="30" onclick="App.onDocWarmthChange(30)">Dịu (30%)</button>
                        <button type="button" class="doc-warmth-pill ${this.docEyeCareWarmth === 60 ? 'active' : ''}" data-val="60" onclick="App.onDocWarmthChange(60)">Chuẩn (60%)</button>
                        <button type="button" class="doc-warmth-pill ${this.docEyeCareWarmth === 90 ? 'active' : ''}" data-val="90" onclick="App.onDocWarmthChange(90)">Ấm (90%)</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Font Resizer -->
                <div style="display: flex; gap: 2px;">
                  <button class="doc-tool-btn" onclick="App.setDocReaderFontSize(-1)" title="Giảm cỡ chữ">A-</button>
                  <button class="doc-tool-btn" onclick="App.setDocReaderFontSize(1)" title="Tăng cỡ chữ">A+</button>
                </div>

                ${active ? `
                  <!-- Smart Quiz Generator -->
                  <button class="btn btn-sm btn-primary" onclick="App.launchQuizFromDoc('${active.id}')" title="Chuyển sang Smart Parser để tạo đề thi trắc nghiệm">
                    🚀 Bóc Tách Quiz
                  </button>

                  <!-- Flashcard Mode -->
                  <button class="btn btn-sm" onclick="App.openDocFlashcardModal('${active.id}')" title="Mở thẻ học lật mặt">
                    🎴 Flashcard
                  </button>

                  <!-- Star / Bookmark -->
                  <button class="btn btn-sm ${isBookmarked ? 'btn-primary' : ''}" onclick="App.toggleDocBookmark('${active.id}')" title="${isBookmarked ? 'Bỏ ghim tài liệu' : 'Ghim yêu thích'}">
                    ${isBookmarked ? '★' : '☆'}
                  </button>

                  <!-- More Tools Dropdown -->
                  <div class="doc-theme-popover-wrapper" id="docMoreToolsPopoverWrapper">
                    <button
                      type="button"
                      class="doc-tool-btn"
                      id="docMoreToolsBtn"
                      onclick="App.toggleDocMoreToolsPopover(event)"
                      title="Tiện ích khác (Sao chép, Tải file, In ấn)"
                    >
                      ⋯
                    </button>

                    <div class="doc-theme-popover-menu" id="docMoreToolsPopoverMenu" style="display: none; width: 220px;" onclick="event.stopPropagation()">
                      <div class="doc-theme-popover-section-title">
                        <span>🛠️ Tiện Ích Đọc</span>
                      </div>
                      <div class="doc-more-menu-item" onclick="App.closeDocMoreToolsPopover(); App.copyMaterialText();">
                        <span>📋</span> <span>Sao chép toàn văn</span>
                      </div>
                      <div class="doc-more-menu-item" onclick="App.closeDocMoreToolsPopover(); App.downloadMaterialTxt('${active.id}', 'md');">
                        <span>📥</span> <span>Tải file Markdown (.md)</span>
                      </div>
                      <div class="doc-more-menu-item" onclick="App.closeDocMoreToolsPopover(); window.print();">
                        <span>🖨️</span> <span>In văn bản / Lưu PDF</span>
                      </div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Document Content Body -->
            <div class="doc-reader-body-wrapper">
              ${active ? `
                <!-- Article Hero Header (Tiêu đề đầy đủ & Metadata) -->
                <header class="doc-article-header">
                  <div class="doc-article-tags">
                    <span class="badge badge-primary" style="font-size: 11px;">📚 ${active.subjectId || 'DThu'}</span>
                    ${(active.tags || []).map(t => `<span class="badge badge-gray" style="font-size: 11px;">#${t}</span>`).join('')}
                    ${isBookmarked ? `<span class="badge badge-warning" style="font-size: 10px;">★ Đã Ghim</span>` : ''}
                  </div>
                  <h1 class="doc-article-main-title">${active.title}</h1>
                  <div class="doc-article-meta-bar">
                    <span>✍️ Biên soạn: <strong>${active.author || 'Shina'}</strong></span>
                    <span>•</span>
                    <span>⏱️ <strong>${readTime} phút đọc</strong> (${wordCount.toLocaleString()} từ)</span>
                  </div>
                </header>

                <article class="doc-markdown-content" id="docMarkdownArticle">
                  ${this.renderDocMarkdown(active.content || '')}
                </article>
              ` : `
                <div style="text-align: center; padding: 100px 20px; color: var(--text-tertiary);">
                  <div style="font-size: 48px; margin-bottom: 12px;">📑</div>
                  <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary);">Chưa chọn tài liệu</h3>
                  <p>Vui lòng chọn một tài liệu từ cây thư mục bên trái để bắt đầu đọc.</p>
                </div>
              `}
            </div>
          </main>
        </div>
      </div>

      <!-- Floating VS Code Context Menu Container -->
      <div id="docContextMenu" class="doc-context-menu" style="display: none;"></div>
    `;

    // Auto-focus and highlight inline rename input if active
    if (this.docRenamingItem) {
      setTimeout(() => {
        const input = document.getElementById("docInlineRenameInput");
        if (input) {
          input.focus();
          input.select();
        }
      }, 40);
    }
  },

  onDocFolderClick(folderId, event) {
    if (event) event.stopPropagation();
    if (this.docRenamingItem) return; // Don't collapse if renaming
    const fld = StorageService.getFolderById(folderId);

    this.docSelectedContext = {
      type: "folder",
      id: folderId,
      folderId: folderId,
      name: fld ? fld.name : "Thư mục"
    };

    if (this.docOpenFolders.has(folderId)) {
      this.docOpenFolders.delete(folderId);
    } else {
      this.docOpenFolders.add(folderId);
    }

    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  onDocFileClick(fileId, event) {
    if (event) event.stopPropagation();
    if (this.docRenamingItem) return;
    this.activeMaterialId = fileId;
    const mat = StorageService.getMaterialById(fileId);
    this.docSelectedContext = {
      type: "file",
      id: fileId,
      folderId: mat ? mat.folderId : null,
      name: mat ? mat.title : "Tài liệu"
    };

    const container = document.getElementById("mainContent");
    if (container) {
      this.renderMaterialsView(container, fileId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  onTreeEmptyAreaClick(event) {
    if (this.docRenamingItem) {
      this.cancelInlineRename();
      return;
    }
    // If user clicks on empty space outside rows, select Root level
    if (event.target && event.target.id === "docTreeContent") {
      this.docSelectedContext = { type: "root", id: null, folderId: null, name: "Cấp gốc (Home)" };
      const container = document.getElementById("mainContent");
      if (container) this.renderMaterialsView(container, this.activeMaterialId);
    }
  },

  // ── VS Code Right-Click Context Menu ──────────────────────────────
  onDocContextMenu(event, targetType, targetId) {
    event.preventDefault();
    event.stopPropagation();
    if (this.docRenamingItem) {
      this.cancelInlineRename();
    }

    // Set selection context to this target
    if (targetType === "folder") {
      const fld = StorageService.getFolderById(targetId);
      this.docSelectedContext = { type: "folder", id: targetId, folderId: targetId, name: fld ? fld.name : "Thư mục" };
    } else if (targetType === "file") {
      const mat = StorageService.getMaterialById(targetId);
      this.docSelectedContext = { type: "file", id: targetId, folderId: mat ? mat.folderId : null, name: mat ? mat.title : "Tài liệu" };
    } else {
      this.docSelectedContext = { type: "root", id: null, folderId: null, name: "Cấp gốc (Home)" };
    }

    const menu = document.getElementById("docContextMenu");
    if (!menu) return;

    const hasClipboard = Boolean(this.docClipboard);

    let menuItemsHtml = "";

    if (targetType === "folder") {
      menuItemsHtml = `
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('open')">
          <div class="doc-context-menu-left"><span>📂</span> <span>Đóng / Mở Thư Mục</span></div>
        </div>
        <div class="doc-context-menu-divider"></div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('new_file')">
          <div class="doc-context-menu-left"><span>📄</span> <span>Tạo File Mới</span></div>
        </div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('new_folder')">
          <div class="doc-context-menu-left"><span>📁</span> <span>Tạo Thư Mục Con</span></div>
        </div>
        <div class="doc-context-menu-divider"></div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('cut')">
          <div class="doc-context-menu-left"><span>✂️</span> <span>Cắt (Cut)</span></div>
          <span class="doc-context-menu-shortcut">Ctrl+X</span>
        </div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('copy')">
          <div class="doc-context-menu-left"><span>📋</span> <span>Sao chép (Copy)</span></div>
          <span class="doc-context-menu-shortcut">Ctrl+C</span>
        </div>
        <div class="doc-context-menu-item ${!hasClipboard ? 'disabled' : ''}" onclick="App.handleContextMenuAction('paste')">
          <div class="doc-context-menu-left"><span>📥</span> <span>Dán (Paste)</span></div>
          <span class="doc-context-menu-shortcut">Ctrl+V</span>
        </div>
        <div class="doc-context-menu-divider"></div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('rename')">
          <div class="doc-context-menu-left"><span>✏️</span> <span>Đổi tên</span></div>
          <span class="doc-context-menu-shortcut">F2</span>
        </div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('change_icon')">
          <div class="doc-context-menu-left"><span>🎨</span> <span>Đổi Biểu Tượng (Icon)</span></div>
        </div>
        <div class="doc-context-menu-item danger" onclick="App.handleContextMenuAction('delete')">
          <div class="doc-context-menu-left"><span>🗑️</span> <span>Xóa Thư Mục</span></div>
          <span class="doc-context-menu-shortcut">Del</span>
        </div>
      `;
    } else if (targetType === "file") {
      menuItemsHtml = `
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('open')">
          <div class="doc-context-menu-left"><span>📖</span> <span>Mở Đọc Tài Liệu</span></div>
        </div>
        <div class="doc-context-menu-divider"></div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('new_file')">
          <div class="doc-context-menu-left"><span>📄</span> <span>Tạo File Cùng Cấp</span></div>
        </div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('new_folder')">
          <div class="doc-context-menu-left"><span>📁</span> <span>Tạo Thư Mục Cùng Cấp</span></div>
        </div>
        <div class="doc-context-menu-divider"></div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('cut')">
          <div class="doc-context-menu-left"><span>✂️</span> <span>Cắt (Cut)</span></div>
          <span class="doc-context-menu-shortcut">Ctrl+X</span>
        </div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('copy')">
          <div class="doc-context-menu-left"><span>📋</span> <span>Sao chép (Copy)</span></div>
          <span class="doc-context-menu-shortcut">Ctrl+C</span>
        </div>
        <div class="doc-context-menu-divider"></div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('rename')">
          <div class="doc-context-menu-left"><span>✏️</span> <span>Đổi tên</span></div>
          <span class="doc-context-menu-shortcut">F2</span>
        </div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('change_icon')">
          <div class="doc-context-menu-left"><span>🎨</span> <span>Đổi Biểu Tượng (Icon)</span></div>
        </div>
        <div class="doc-context-menu-item danger" onclick="App.handleContextMenuAction('delete')">
          <div class="doc-context-menu-left"><span>🗑️</span> <span>Xóa Tài Liệu</span></div>
          <span class="doc-context-menu-shortcut">Del</span>
        </div>
      `;
    } else {
      // Root context
      menuItemsHtml = `
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('new_file')">
          <div class="doc-context-menu-left"><span>📄</span> <span>Tạo File Cấp Gốc</span></div>
        </div>
        <div class="doc-context-menu-item" onclick="App.handleContextMenuAction('new_folder')">
          <div class="doc-context-menu-left"><span>📁</span> <span>Tạo Thư Mục Cấp Gốc</span></div>
        </div>
        <div class="doc-context-menu-divider"></div>
        <div class="doc-context-menu-item ${!hasClipboard ? 'disabled' : ''}" onclick="App.handleContextMenuAction('paste')">
          <div class="doc-context-menu-left"><span>📥</span> <span>Dán vào Cấp Gốc (Paste)</span></div>
          <span class="doc-context-menu-shortcut">Ctrl+V</span>
        </div>
      `;
    }

    menu.innerHTML = menuItemsHtml;
    menu.style.display = "block";

    // Calculate position bounded to screen viewport
    const menuWidth = 210;
    const menuHeight = 320;
    let x = event.clientX;
    let y = event.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = Math.max(10, window.innerWidth - menuWidth - 12);
    }
    if (y + menuHeight > window.innerHeight) {
      y = Math.max(10, window.innerHeight - menuHeight - 12);
    }

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  },

  closeDocContextMenu() {
    const menu = document.getElementById("docContextMenu");
    if (menu) {
      menu.style.display = "none";
    }
  },

  handleContextMenuAction(action) {
    this.closeDocContextMenu();
    const ctx = this.docSelectedContext;
    if (!ctx) return;

    switch (action) {
      case "open":
        if (ctx.type === "folder") {
          this.onDocFolderClick(ctx.id);
        } else if (ctx.type === "file") {
          this.onDocFileClick(ctx.id);
        }
        break;
      case "new_file":
        this.openContextualCreate("file");
        break;
      case "new_folder":
        this.openContextualCreate("folder");
        break;
      case "cut":
        this.cutDocItem(ctx.id, ctx.type);
        break;
      case "copy":
        this.copyDocItem(ctx.id, ctx.type);
        break;
      case "paste":
        this.pasteDocItem();
        break;
      case "rename":
        this.renameSelectedDocItem();
        break;
      case "change_icon":
        this.openIconPickerModal(ctx.id, ctx.type);
        break;
      case "delete":
        this.deleteSelectedDocItem();
        break;
    }
  },

  cutDocItem(id, type) {
    if (!id || type === "root") return;
    const name = type === "folder" ? StorageService.getFolderById(id)?.name : StorageService.getMaterialById(id)?.title;
    this.docClipboard = { action: "cut", type, id, name: name || "" };
    this.showToast(`✂️ Đã cắt "${name}". Nhấp chuột phải vào thư mục đích để Dán (Paste)!`, "info", 3000);
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  copyDocItem(id, type) {
    if (!id || type === "root") return;
    const name = type === "folder" ? StorageService.getFolderById(id)?.name : StorageService.getMaterialById(id)?.title;
    this.docClipboard = { action: "copy", type, id, name: name || "" };
    this.showToast(`📋 Đã sao chép "${name}". Nhấp chuột phải vào thư mục đích để Dán (Paste)!`, "info", 3000);
  },

  pasteDocItem() {
    if (!this.docClipboard) return;
    const { action, type, id } = this.docClipboard;
    const ctx = this.docSelectedContext;

    // Determine target folderId
    let targetFolderId = null;
    if (ctx.type === "folder") {
      targetFolderId = ctx.id;
    } else if (ctx.type === "file") {
      targetFolderId = ctx.folderId;
    }

    if (action === "cut") {
      if (type === "file") {
        const materials = StorageService.getMaterials();
        const mat = materials.find(m => m.id === id);
        if (mat) {
          mat.folderId = targetFolderId;
          StorageService.saveMaterials(materials);
          this.showToast(`🎉 Đã di chuyển tài liệu "${mat.title}" thành công!`, "success", 3000);
        }
      } else if (type === "folder") {
        if (id === targetFolderId) return;
        const folders = StorageService.getFolders();
        const fld = folders.find(f => f.id === id);
        if (fld) {
          fld.parentId = targetFolderId;
          StorageService.saveFolders(folders);
          this.showToast(`🎉 Đã di chuyển thư mục "${fld.name}" thành công!`, "success", 3000);
        }
      }
      this.docClipboard = null; // Clear clipboard after cut & paste
    } else if (action === "copy") {
      if (type === "file") {
        const materials = StorageService.getMaterials();
        const orig = materials.find(m => m.id === id);
        if (orig) {
          const newCopy = {
            ...orig,
            id: "mat-" + Date.now(),
            folderId: targetFolderId,
            title: `(Bản sao) ${orig.title}`
          };
          materials.unshift(newCopy);
          StorageService.saveMaterials(materials);
          this.showToast(`🎉 Đã dán bản sao tài liệu "${newCopy.title}" thành công!`, "success", 3000);
        }
      } else if (type === "folder") {
        const folders = StorageService.getFolders();
        const origFld = folders.find(f => f.id === id);
        if (origFld) {
          const newFldId = "fld-" + Date.now();
          const newFld = {
            ...origFld,
            id: newFldId,
            parentId: targetFolderId,
            name: `(Bản sao) ${origFld.name}`
          };
          folders.push(newFld);
          StorageService.saveFolders(folders);
          this.showToast(`🎉 Đã dán bản sao thư mục "${newFld.name}" thành công!`, "success", 3000);
        }
      }
    }

    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  openContextualCreate(type) {
    if (type === "folder") {
      this.openCreateDocFolderModal();
    } else if (type === "file") {
      this.openUploadMaterialModal();
    }
  },

  // ── Inline Renaming (VS Code Style) ───────────────────────────────
  renameSelectedDocItem() {
    if (!this.docSelectedContext || this.docSelectedContext.type === "root") {
      this.showToast("💡 Vui lòng nhấp chọn một thư mục hoặc tài liệu trước khi đổi tên (F2)!", "info", 3000);
      return;
    }
    this.docRenamingItem = { id: this.docSelectedContext.id, type: this.docSelectedContext.type };
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  onInlineRenameKeydown(event, id, type) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.saveInlineRename(id, type, event.target.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.cancelInlineRename();
    }
  },

  saveInlineRename(id, type, newName) {
    if (!this.docRenamingItem || this.docRenamingItem.id !== id) return;
    const trimmed = (newName || "").trim();

    if (!trimmed) {
      this.showToast("⚠️ Tên không được để trống!", "warning");
      this.cancelInlineRename();
      return;
    }

    if (type === "folder") {
      const folders = StorageService.getFolders();
      const fld = folders.find(f => f.id === id);
      if (fld && fld.name !== trimmed) {
        fld.name = trimmed;
        StorageService.saveFolders(folders);
        if (this.docSelectedContext.id === id) {
          this.docSelectedContext.name = trimmed;
        }
        this.showToast(`🎉 Đã đổi tên thư mục thành "${trimmed}"!`, "success", 2500);
      }
    } else if (type === "file") {
      const materials = StorageService.getMaterials();
      const mat = materials.find(m => m.id === id);
      if (mat && mat.title !== trimmed) {
        mat.title = trimmed;
        StorageService.saveMaterials(materials);
        if (this.docSelectedContext.id === id) {
          this.docSelectedContext.name = trimmed;
        }
        this.showToast(`🎉 Đã đổi tên tài liệu thành "${trimmed}"!`, "success", 2500);
      }
    }

    this.docRenamingItem = null;
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  cancelInlineRename() {
    this.docRenamingItem = null;
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  // ── Icon Picker Modal System ──────────────────────────────────────
  ICON_LIBRARY: {
    "📁 Mục Lục & Học Liệu": ["📁", "📂", "🗂️", "📑", "📄", "📜", "📝", "📦", "🏷️", "📌", "🗃️", "💼", "📖", "📚", "📔", "📕", "📗", "📘", "📙"],
    "🏛️ Chính Trị & Xã Hội": ["🏛️", "⚖️", "🚩", "🎖️", "🌐", "📢", "🕊️", "🇻🇳", "🎓", "📜", "📰", "👥", "🤝", "🏆", "🛡️"],
    "🔬 KHTN & Y Sinh": ["🔬", "🧬", "🧪", "🌿", "🌸", "🧫", "🦠", "🍎", "🐾", "🪐", "⚡", "🌡️", "💊", "🩺", "💉", "🌱"],
    "📐 Toán Học & CNTT": ["📐", "💻", "🖥️", "⚙️", "🔢", "📊", "📈", "🤖", "📱", "🔌", "💾", "💡", "🧠", "⌨️", "🖱️", "📡"],
    "🎨 Nghệ Thuật & Tiện Ích": ["🎨", "✏️", "🎭", "✍️", "⭐", "🌟", "🎯", "✨", "🔥", "🚀", "🎉", "🔑", "🧩", "🧭", "⏰", "💎"]
  },

  openIconPickerModal(id, type) {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");
    if (!modal || !title || !body || !footer) return;

    let currentIcon = "📁";
    let itemName = "Mục";

    if (type === "folder") {
      const fld = StorageService.getFolderById(id);
      if (fld) {
        currentIcon = fld.icon || "📁";
        itemName = fld.name;
      }
    } else if (type === "file") {
      const mat = StorageService.getMaterialById(id);
      if (mat) {
        currentIcon = mat.icon || "📄";
        itemName = mat.title;
      }
    }

    this.docIconPickerState = { id, type, selectedIcon: currentIcon, searchKw: "" };

    title.innerHTML = `🎨 Bộ Chọn Biểu Tượng · ${itemName}`;

    const renderPickerBody = () => {
      const st = this.docIconPickerState;
      const kw = (st.searchKw || "").toLowerCase();

      let categoriesHtml = "";
      for (const [catName, icons] of Object.entries(this.ICON_LIBRARY)) {
        const filteredIcons = kw
          ? icons.filter(ic => ic.includes(kw) || catName.toLowerCase().includes(kw))
          : icons;

        if (filteredIcons.length > 0) {
          categoriesHtml += `
            <div class="icon-picker-category-title">${catName}</div>
            <div class="icon-picker-grid">
              ${filteredIcons.map(ic => `
                <button
                  type="button"
                  class="icon-picker-btn ${st.selectedIcon === ic ? 'active' : ''}"
                  onclick="App.selectIconInPicker('${ic}')"
                  title="Chọn ${ic}"
                >
                  ${ic}
                </button>
              `).join('')}
            </div>
          `;
        }
      }

      if (!categoriesHtml) {
        categoriesHtml = `<div style="text-align: center; padding: 24px; color: var(--text-tertiary);">Không tìm thấy icon phù hợp. Bạn có thể tự dán emoji vào ô bên dưới!</div>`;
      }

      body.innerHTML = `
        <div class="icon-picker-container">
          <!-- Live Preview Box -->
          <div class="icon-picker-preview-box">
            <span class="icon-picker-preview-icon" id="iconPickerLiveIcon">${st.selectedIcon}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700;">Xem trước hiển thị:</div>
              <div class="icon-picker-preview-name">${itemName}</div>
            </div>
          </div>

          <!-- Search & Custom Emoji Bar -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 11.5px; font-weight: 700;">🔍 Tìm nhanh theo chủ đề:</label>
              <input
                type="text"
                class="form-control"
                style="font-size: 12.5px; padding: 6px 10px;"
                placeholder="toán, sách, khoa học..."
                value="${st.searchKw}"
                oninput="App.onIconPickerSearch(this.value)"
              >
            </div>
            <div>
              <label class="form-label" style="font-size: 11.5px; font-weight: 700;">✨ Tự nhập / dán Emoji tùy ý:</label>
              <input
                type="text"
                id="customEmojiInput"
                class="form-control"
                style="font-size: 13px; padding: 6px 10px;"
                placeholder="Dán emoji bất kỳ..."
                value="${st.selectedIcon}"
                oninput="App.selectIconInPicker(this.value.trim())"
              >
            </div>
          </div>

          <!-- Icon Categorized Lists -->
          <div style="max-height: 260px; overflow-y: auto; padding-right: 4px;" id="iconPickerCategoriesWrapper">
            ${categoriesHtml}
          </div>
        </div>
      `;

      footer.innerHTML = `
        <button class="btn" onclick="App.closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="App.saveDocItemIconAction()">✓ Lưu Biểu Tượng</button>
      `;
    };

    this.renderActiveIconPicker = renderPickerBody;
    renderPickerBody();
    modal.classList.add("active");
  },

  selectIconInPicker(icon) {
    if (!icon) return;
    this.docIconPickerState.selectedIcon = icon;
    const preview = document.getElementById("iconPickerLiveIcon");
    if (preview) preview.textContent = icon;
    const customInp = document.getElementById("customEmojiInput");
    if (customInp && customInp.value !== icon) customInp.value = icon;
    document.querySelectorAll(".icon-picker-btn").forEach(btn => {
      btn.classList.toggle("active", btn.textContent.trim() === icon);
    });
  },

  onIconPickerSearch(kw) {
    this.docIconPickerState.searchKw = kw;
    if (this.renderActiveIconPicker) this.renderActiveIconPicker();
  },

  saveDocItemIconAction() {
    const { id, type, selectedIcon } = this.docIconPickerState;
    if (!id || !selectedIcon) return;

    if (type === "folder") {
      const folders = StorageService.getFolders();
      const fld = folders.find(f => f.id === id);
      if (fld) {
        fld.icon = selectedIcon;
        StorageService.saveFolders(folders);
        this.showToast(`🎨 Đã cập nhật biểu tượng thư mục "${fld.name}" thành ${selectedIcon}!`, "success", 3000);
      }
    } else if (type === "file") {
      const materials = StorageService.getMaterials();
      const mat = materials.find(m => m.id === id);
      if (mat) {
        mat.icon = selectedIcon;
        StorageService.saveMaterials(materials);
        this.showToast(`🎨 Đã cập nhật biểu tượng tài liệu "${mat.title}" thành ${selectedIcon}!`, "success", 3000);
      }
    }

    this.closeModal();
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  // ── Delete Functionality (Delete key or Click) ────────────────────
  deleteSelectedDocItem() {
    if (!this.docSelectedContext || this.docSelectedContext.type === "root") {
      this.showToast("💡 Vui lòng nhấp chọn một thư mục hoặc tài liệu trước khi xóa (Delete)!", "info", 3000);
      return;
    }
    this.deleteDocItemConfirm(this.docSelectedContext.id, this.docSelectedContext.type);
  },

  deleteDocItemConfirm(id, type) {
    if (type === "folder") {
      const fld = StorageService.getFolderById(id);
      if (!fld) return;

      this.showConfirmDialog({
        title: `Xác nhận xóa thư mục "${fld.name}"`,
        message: `Bạn có chắc chắn muốn xóa thư mục này không? Các tài liệu bên trong sẽ được tự động chuyển ra Cấp Gốc (Root) để không bị mất dữ liệu.`,
        icon: "🗑️",
        confirmText: "Xóa Thư Mục",
        isDanger: true,
        onConfirm: () => {
          // Reassign files in this folder to root
          const materials = StorageService.getMaterials();
          materials.forEach(m => {
            if (m.folderId === id) m.folderId = null;
          });
          StorageService.saveMaterials(materials);

          // Delete folder
          StorageService.deleteFolder(id);
          this.docSelectedContext = { type: "root", id: null, folderId: null, name: "Cấp gốc (Home)" };
          this.showToast(`🗑️ Đã xóa thư mục "${fld.name}"!`, "success", 3000);
          this.renderMaterialsView(document.getElementById("mainContent"), this.activeMaterialId);
        }
      });
    } else if (type === "file") {
      const mat = StorageService.getMaterialById(id);
      if (!mat) return;

      this.showConfirmDialog({
        title: `Xác nhận xóa tài liệu "${mat.title}"`,
        message: `Bạn có chắc chắn muốn xóa tài liệu học tập này không? Thao tác này sẽ xóa vĩnh viễn khỏi bộ nhớ của bạn.`,
        icon: "⚠️",
        confirmText: "Xóa Tài Liệu",
        isDanger: true,
        onConfirm: () => {
          let materials = StorageService.getMaterials();
          materials = materials.filter(m => m.id !== id);
          StorageService.saveMaterials(materials);

          if (this.activeMaterialId === id) {
            this.activeMaterialId = materials.length > 0 ? materials[0].id : null;
          }
          this.docSelectedContext = { type: "root", id: null, folderId: null, name: "Cấp gốc (Home)" };
          this.showToast(`🗑️ Đã xóa tài liệu "${mat.title}"!`, "success", 3000);
          this.renderMaterialsView(document.getElementById("mainContent"), this.activeMaterialId);
        }
      });
    }
  },

  // ── Drag & Drop Handlers ──────────────────────────────────────────
  onDocDragStart(event, type, id) {
    if (this.docRenamingItem) return;
    event.stopPropagation();
    this.docDraggingItem = { type, id };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify({ type, id }));
    if (event.target && event.target.classList) {
      event.target.classList.add("is-dragging");
    }
  },

  onDocDragEnd(event) {
    if (event.target && event.target.classList) {
      event.target.classList.remove("is-dragging");
    }
    if (this.docDragHoverTimer) {
      clearTimeout(this.docDragHoverTimer);
      this.docDragHoverTimer = null;
    }
    document.querySelectorAll(".drag-target-hover").forEach(el => el.classList.remove("drag-target-hover"));
    this.docDraggingItem = null;
  },

  onDocDragOver(event, targetFolderId) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";

    const targetEl = event.currentTarget;
    if (targetEl && targetEl.classList && !targetEl.classList.contains("drag-target-hover")) {
      document.querySelectorAll(".drag-target-hover").forEach(el => el.classList.remove("drag-target-hover"));
      targetEl.classList.add("drag-target-hover");
    }

    // Auto-expand folder on 1s hover
    if (targetFolderId && !this.docOpenFolders.has(targetFolderId)) {
      if (!this.docDragHoverTimer) {
        this.docDragHoverTimer = setTimeout(() => {
          this.docOpenFolders.add(targetFolderId);
          const container = document.getElementById("mainContent");
          if (container) this.renderMaterialsView(container, this.activeMaterialId);
        }, 1000);
      }
    }
  },

  onDocDragLeave(event, targetFolderId) {
    event.stopPropagation();
    const targetEl = event.currentTarget;
    if (targetEl && targetEl.classList) {
      targetEl.classList.remove("drag-target-hover");
    }
    if (this.docDragHoverTimer) {
      clearTimeout(this.docDragHoverTimer);
      this.docDragHoverTimer = null;
    }
  },

  onDocDrop(event, targetFolderId) {
    event.preventDefault();
    event.stopPropagation();
    if (this.docDragHoverTimer) {
      clearTimeout(this.docDragHoverTimer);
      this.docDragHoverTimer = null;
    }
    document.querySelectorAll(".drag-target-hover").forEach(el => el.classList.remove("drag-target-hover"));

    if (!this.docDraggingItem) return;
    const { type, id } = this.docDraggingItem;

    if (type === "file") {
      const materials = StorageService.getMaterials();
      const mat = materials.find(m => m.id === id);
      if (mat) {
        mat.folderId = targetFolderId;
        StorageService.saveMaterials(materials);
        const targetFld = StorageService.getFolderById(targetFolderId);
        this.showToast(`🎉 Đã di chuyển tài liệu "${mat.title}" vào "${targetFld ? targetFld.name : 'Thư mục'}"!`, "success", 3000);
      }
    } else if (type === "folder") {
      if (id === targetFolderId) return; // Cannot drop into itself
      const folders = StorageService.getFolders();
      const fld = folders.find(f => f.id === id);
      if (fld) {
        fld.parentId = targetFolderId;
        StorageService.saveFolders(folders);
        const targetFld = StorageService.getFolderById(targetFolderId);
        this.showToast(`🎉 Đã di chuyển thư mục "${fld.name}" vào "${targetFld ? targetFld.name : 'Thư mục'}"!`, "success", 3000);
      }
    }

    this.docDraggingItem = null;
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  onDocDropToRoot(event) {
    event.preventDefault();
    event.stopPropagation();
    document.querySelectorAll(".drag-target-hover").forEach(el => el.classList.remove("drag-target-hover"));

    if (!this.docDraggingItem) return;
    const { type, id } = this.docDraggingItem;

    if (type === "file") {
      const materials = StorageService.getMaterials();
      const mat = materials.find(m => m.id === id);
      if (mat) {
        mat.folderId = null;
        StorageService.saveMaterials(materials);
        this.showToast(`🎉 Đã đưa tài liệu "${mat.title}" ra Cấp Gốc (Root)!`, "success", 3000);
      }
    } else if (type === "folder") {
      const folders = StorageService.getFolders();
      const fld = folders.find(f => f.id === id);
      if (fld) {
        fld.parentId = null;
        StorageService.saveFolders(folders);
        this.showToast(`🎉 Đã đưa thư mục "${fld.name}" ra Cấp Gốc (Root)!`, "success", 3000);
      }
    }

    this.docDraggingItem = null;
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  toggleDocSidebar() {
    this.docSidebarCollapsed = !this.docSidebarCollapsed;
    const layout = document.getElementById("docmasterLayout");
    if (layout) {
      layout.classList.toggle("sidebar-collapsed", this.docSidebarCollapsed);
    }
    const toggleBtn = document.getElementById("docSidebarToggleBtn");
    if (toggleBtn) {
      toggleBtn.innerHTML = this.docSidebarCollapsed ? "📂 Mở Mục Lục" : "◀ Thu Gọn";
      toggleBtn.title = this.docSidebarCollapsed ? "Mở thanh thư mục" : "Thu gọn thanh thư mục (Zen Mode)";
      toggleBtn.className = `btn btn-sm ${this.docSidebarCollapsed ? 'btn-primary' : ''}`;
    }
  },

  getEffectiveDocTheme(theme) {
    if (theme === "auto") {
      // Synchronize with the Web App's global theme setting
      const settings = (typeof StorageService !== "undefined" && StorageService.getAppSettings) ? StorageService.getAppSettings() : {};
      const webTheme = settings.theme || "auto";
      if (webTheme === "dark") return "dark";
      if (webTheme === "light") return "light";
      const isDark = (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
      return isDark ? "dark" : "light";
    }
    return theme || "light";
  },

  getDocThemeLabel(theme) {
    const map = {
      auto: "💻 Hệ Thống",
      light: "☀️ Sáng",
      sepia: "📜 Sepia",
      dark: "🌙 Tối",
      forest: "🌿 Rừng Xanh",
      mocha: "☕ Cà Phê"
    };
    return map[theme] || "☀️ Sáng";
  },

  toggleDocThemePopover(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById("docThemePopoverMenu");
    const triggerBtn = document.getElementById("docThemeTriggerBtn");
    if (!menu || !triggerBtn) return;

    const isShowing = menu.style.display === "block";
    if (isShowing) {
      menu.style.display = "none";
      return;
    }

    menu.style.display = "block";

    // Smart viewport positioning
    const rect = triggerBtn.getBoundingClientRect();
    const menuWidth = 290;
    const winWidth = window.innerWidth || 1024;
    const winHeight = window.innerHeight || 768;

    let left = rect.right - menuWidth;
    // Prevent overflowing into left sidebar or screen edge
    if (left < 14) {
      left = Math.max(14, rect.left);
    }
    // Prevent overflowing right edge
    if (left + menuWidth > winWidth - 14) {
      left = Math.max(14, winWidth - menuWidth - 14);
    }

    let top = rect.bottom + 8;
    // If overflowing bottom of viewport, flip to show above button
    if (top + 340 > winHeight) {
      top = Math.max(10, rect.top - 350);
    }

    menu.style.position = "fixed";
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.right = "auto";
    menu.style.zIndex = "10000";
  },

  closeDocThemePopover() {
    const menu = document.getElementById("docThemePopoverMenu");
    if (menu) {
      menu.style.display = "none";
    }
  },

  toggleDocMoreToolsPopover(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById("docMoreToolsPopoverMenu");
    const triggerBtn = document.getElementById("docMoreToolsBtn");
    if (!menu || !triggerBtn) return;

    const isShowing = menu.style.display === "block";
    if (isShowing) {
      menu.style.display = "none";
      return;
    }

    // Close other popover if open
    this.closeDocThemePopover();

    menu.style.display = "block";

    const rect = triggerBtn.getBoundingClientRect();
    const menuWidth = 220;
    const winWidth = window.innerWidth || 1024;
    const winHeight = window.innerHeight || 768;

    let left = rect.right - menuWidth;
    if (left < 14) {
      left = Math.max(14, rect.left);
    }
    if (left + menuWidth > winWidth - 14) {
      left = Math.max(14, winWidth - menuWidth - 14);
    }

    let top = rect.bottom + 8;
    if (top + 180 > winHeight) {
      top = Math.max(10, rect.top - 190);
    }

    menu.style.position = "fixed";
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.right = "auto";
    menu.style.zIndex = "10000";
  },

  closeDocMoreToolsPopover() {
    const menu = document.getElementById("docMoreToolsPopoverMenu");
    if (menu) {
      menu.style.display = "none";
    }
  },

  setDocReaderTheme(theme) {
    this.docReaderTheme = theme;
    try {
      localStorage.setItem("dthu_doc_theme", theme);
    } catch (e) {}

    const canvas = document.getElementById("docReaderCanvas");
    if (canvas) {
      const effective = this.getEffectiveDocTheme(theme);
      canvas.className = `doc-reader-canvas theme-${effective}`;
    }
    
    const triggerBtn = document.getElementById("docThemeTriggerBtn");
    if (triggerBtn) {
      triggerBtn.innerHTML = `<span>🎨 ${this.getDocThemeLabel(theme)}</span> <span style="font-size: 10px; margin-left: 2px;">▾</span>`;
    }

    document.querySelectorAll(".doc-theme-card-item").forEach(card => {
      card.classList.toggle("active", card.dataset.theme === theme);
    });
  },

  onDocWarmthChange(val) {
    this.docEyeCareWarmth = parseInt(val, 10) || 0;
    try {
      localStorage.setItem("dthu_doc_warmth", this.docEyeCareWarmth);
    } catch (e) {}

    const canvas = document.getElementById("docReaderCanvas");
    if (canvas) {
      canvas.style.setProperty("--doc-warmth", this.docEyeCareWarmth);
    }

    const disp = document.getElementById("docWarmthValDisplay");
    if (disp) disp.textContent = `${this.docEyeCareWarmth}%`;

    const input = document.getElementById("docWarmthRangeInput");
    if (input && input.value !== String(this.docEyeCareWarmth)) {
      input.value = this.docEyeCareWarmth;
    }

    document.querySelectorAll(".doc-warmth-pill").forEach(p => {
      p.classList.toggle("active", parseInt(p.dataset.val, 10) === this.docEyeCareWarmth);
    });
  },

  setDocReaderFontSize(delta) {
    this.docReaderFontSize = Math.max(13, Math.min(24, this.docReaderFontSize + delta));
    const canvas = document.getElementById("docReaderCanvas");
    if (canvas) {
      canvas.style.setProperty("--doc-font-size", `${this.docReaderFontSize}px`);
    }
  },

  toggleDocBookmark(materialId) {
    const isNow = StorageService.toggleBookmark(materialId);
    this.showToast(isNow ? "⭐ Đã thêm tài liệu vào mục Ghim Yêu Thích!" : "Đã bỏ ghim tài liệu.", isNow ? "success" : "info", 2000);
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  switchDocTab(tabName) {
    this.docActiveTab = tabName;
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  onDocSearchInput(val) {
    this.docSearchKeyword = val.trim();
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  clearDocSearch() {
    this.docSearchKeyword = "";
    const container = document.getElementById("mainContent");
    if (container) this.renderMaterialsView(container, this.activeMaterialId);
  },

  launchQuizFromDoc(materialId) {
    const mat = StorageService.getMaterialById(materialId);
    if (!mat || !mat.content) return;

    // Navigate to Parser view and pre-fill input
    this.navigateTo("parser", { subjectId: mat.subjectId });

    setTimeout(() => {
      const parserInput = document.getElementById("parserInput");
      if (parserInput) {
        parserInput.value = mat.content;
        this.onParserInput(true);
        this.showToast(`🚀 Đã nạp nội dung tài liệu "${mat.title}" vào Smart Parser! Hãy kiểm tra và lưu thành đề thi.`, "success", 4000);
      }
    }, 150);
  },

  openDocFlashcardModal(materialId) {
    const mat = StorageService.getMaterialById(materialId);
    if (!mat || !mat.content) return;

    // Extract key bullet points / definitions into flashcards
    const lines = mat.content.split('\n');
    const cards = [];
    let currentTerm = "";
    let currentDef = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('- **')) {
        if (currentTerm && currentDef) {
          cards.push({ front: currentTerm, back: currentDef });
        }
        if (trimmed.startsWith('- **')) {
          const match = trimmed.match(/- \*\*(.*?)\*\*(.*)/);
          if (match) {
            currentTerm = match[1].replace(/:$/, '');
            currentDef = match[2].replace(/^:/, '').trim();
          }
        } else {
          currentTerm = trimmed.replace(/^#+\s*/, '');
          currentDef = "";
        }
      } else if (currentTerm && trimmed && !trimmed.startsWith('#')) {
        currentDef += (currentDef ? " " : "") + trimmed.replace(/^-\s*/, '');
      }
    }

    if (currentTerm && currentDef) {
      cards.push({ front: currentTerm, back: currentDef });
    }

    if (cards.length === 0) {
      cards.push({
        front: mat.title,
        back: mat.description || mat.content.slice(0, 300)
      });
    }

    this.currentFlashcards = cards;
    this.activeFlashcardIndex = 0;

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");
    if (!modal || !title || !body || !footer) return;

    title.innerHTML = `🎴 Thẻ Ghi Nhớ (Flashcard) · ${mat.title}`;
    
    const renderCardContent = () => {
      const card = this.currentFlashcards[this.activeFlashcardIndex];
      const total = this.currentFlashcards.length;
      body.innerHTML = `
        <div style="text-align: center; margin-bottom: 8px;">
          <span class="badge badge-primary">Thẻ ${this.activeFlashcardIndex + 1} / ${total}</span>
          <p style="font-size: 12px; color: var(--text-tertiary); margin: 4px 0 0 0;">(Nhấp vào thẻ để lật xem định nghĩa / câu trả lời)</p>
        </div>

        <div class="doc-flashcard-box" id="docFlashcardBox" onclick="this.classList.toggle('flipped')">
          <div class="doc-flashcard-inner">
            <div class="doc-flashcard-front">
              <div style="font-size: 13px; color: var(--brand-primary); font-weight: 700; margin-bottom: 8px;">❓ KHÁI NIỆM / THUẬT NGỮ</div>
              <h3 style="font-size: 18px; font-weight: 800; line-height: 1.4;">${card.front}</h3>
              <div style="margin-top: 16px; font-size: 11.5px; color: var(--text-tertiary);">👆 Nhấp để lật thẻ ➔</div>
            </div>
            <div class="doc-flashcard-back">
              <div style="font-size: 13px; color: #166534; font-weight: 700; margin-bottom: 8px;">💡 GIẢI NGHĨA & BẢN CHẤT</div>
              <div style="font-size: 14.5px; line-height: 1.6;">${card.back}</div>
            </div>
          </div>
        </div>
      `;

      footer.innerHTML = `
        <button class="btn btn-sm" onclick="App.prevFlashcard()" ${this.activeFlashcardIndex === 0 ? 'disabled' : ''}>◀ Thẻ Trước</button>
        <button class="btn btn-sm" onclick="document.getElementById('docFlashcardBox')?.classList.toggle('flipped')">🔄 Lật Thẻ</button>
        <button class="btn btn-sm btn-primary" onclick="App.nextFlashcard()" ${this.activeFlashcardIndex === total - 1 ? 'disabled' : ''}>Thẻ Tiếp Theo ▶</button>
      `;
    };

    this.renderActiveFlashcard = renderCardContent;
    renderCardContent();
    modal.classList.add("active");
  },

  nextFlashcard() {
    if (this.activeFlashcardIndex < this.currentFlashcards.length - 1) {
      this.activeFlashcardIndex++;
      if (this.renderActiveFlashcard) this.renderActiveFlashcard();
    }
  },

  prevFlashcard() {
    if (this.activeFlashcardIndex > 0) {
      this.activeFlashcardIndex--;
      if (this.renderActiveFlashcard) this.renderActiveFlashcard();
    }
  },

  copyMaterialText() {
    const materials = StorageService.getMaterials();
    const active = materials.find(m => m.id === this.activeMaterialId);
    if (active && active.content) {
      navigator.clipboard.writeText(active.content).then(() => {
        this.showToast("📋 Đã sao chép toàn văn tài liệu vào bộ nhớ tạm!", "success", 2500);
      });
    }
  },

  downloadMaterialTxt(id, format = "md") {
    const materials = StorageService.getMaterials();
    const active = materials.find(m => m.id === id);
    if (active) {
      const ext = format === "md" ? "md" : "txt";
      const mime = format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
      const blob = new Blob([active.content || ""], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (active.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')) + "." + ext;
      a.click();
      URL.revokeObjectURL(url);
    }
  },

  openCreateDocFolderModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");
    if (!modal || !title || !body || !footer) return;

    const folders = StorageService.getFolders();
    
    // Determine default parent based on context:
    let defaultParentId = "";
    let contextDesc = "Tạo tại Cấp Gốc (Root)";
    if (this.docSelectedContext.type === "folder") {
      defaultParentId = this.docSelectedContext.id;
      contextDesc = `Tạo bên trong thư mục: <strong>${this.docSelectedContext.name}</strong>`;
    } else if (this.docSelectedContext.type === "file") {
      defaultParentId = this.docSelectedContext.folderId || "";
      const parentFld = folders.find(f => f.id === defaultParentId);
      contextDesc = `Tạo cùng cấp với file (trong thư mục: <strong>${parentFld ? parentFld.name : 'Cấp gốc'}</strong>)`;
    }

    title.textContent = "📁 Khởi Tạo Thư Mục Học Tập Mới";
    body.innerHTML = `
      <div style="margin-bottom: 14px; font-size: 12.5px; color: var(--text-secondary); background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
        📍 Vị trí tạo: ${contextDesc}
      </div>
      <div class="form-group">
        <label class="form-label">Tên thư mục (*):</label>
        <input type="text" id="newFolderNameInput" class="form-control" placeholder="Ví dụ: Khoa Sư Phạm, Môn Sinh Học...">
      </div>
      <div class="form-group">
        <label class="form-label">Biểu tượng Icon:</label>
        <input type="text" id="newFolderIconInput" class="form-control" value="📁" placeholder="VD: 🏛️, 🔬, 📐, 📕...">
      </div>
      <div class="form-group">
        <label class="form-label">Thư mục cha (Cấp cao hơn):</label>
        <select id="newFolderParentSelect" class="form-control">
          <option value="" ${!defaultParentId ? 'selected' : ''}>-- Là Thư Mục Gốc (Root) --</option>
          ${folders.map(f => `<option value="${f.id}" ${f.id === defaultParentId ? 'selected' : ''}>${f.icon || '📁'} ${f.name}</option>`).join('')}
        </select>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveCreateDocFolderAction()">Lưu Thư Mục</button>
    `;

    modal.classList.add("active");
  },

  saveCreateDocFolderAction() {
    const name = document.getElementById("newFolderNameInput")?.value.trim();
    const icon = document.getElementById("newFolderIconInput")?.value.trim() || "📁";
    const parentId = document.getElementById("newFolderParentSelect")?.value || null;

    if (!name) {
      this.showToast("⚠️ Vui lòng nhập tên thư mục!", "warning");
      return;
    }

    const created = StorageService.createFolder({ name, icon, parentId });
    this.docOpenFolders.add(created.id);
    if (parentId) this.docOpenFolders.add(parentId);
    
    // Set newly created folder as context
    this.docSelectedContext = {
      type: "folder",
      id: created.id,
      folderId: created.id,
      name: created.name
    };

    this.closeModal();
    this.showToast(`🎉 Đã tạo thư mục "${name}" thành công!`, "success", 3000);
    this.renderMaterialsView(document.getElementById("mainContent"), this.activeMaterialId);
  },

  openUploadMaterialModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");
    if (!modal || !title || !body || !footer) return;

    const folders = StorageService.getFolders();

    // Determine default folder based on context
    let defaultFolderId = "fld-llct";
    let contextDesc = "Thư mục mặc định";
    if (this.docSelectedContext.type === "folder") {
      defaultFolderId = this.docSelectedContext.id;
      contextDesc = `Tạo bên trong thư mục: <strong>${this.docSelectedContext.name}</strong>`;
    } else if (this.docSelectedContext.type === "file") {
      defaultFolderId = this.docSelectedContext.folderId || "fld-llct";
      const parentFld = folders.find(f => f.id === defaultFolderId);
      contextDesc = `Tạo cùng cấp với file (trong thư mục: <strong>${parentFld ? parentFld.name : 'Cấp gốc'}</strong>)`;
    } else if (folders.length > 0) {
      defaultFolderId = folders[0].id;
    }

    title.textContent = "➕ Đăng Tải Tài Liệu Học Tập Mới";
    body.innerHTML = `
      <div style="margin-bottom: 14px; font-size: 12.5px; color: var(--text-secondary); background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
        📍 Vị trí tạo: ${contextDesc}
      </div>
      <div class="form-group">
        <label class="form-label">Tiêu đề tài liệu (*):</label>
        <input type="text" id="matTitleInput" class="form-control" placeholder="Ví dụ: Tóm tắt 7 chương Kinh tế Chính trị">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">Thuộc Thư Mục (*):</label>
          <select id="matFolderSelect" class="form-control">
            ${folders.map(f => `<option value="${f.id}" ${f.id === defaultFolderId ? 'selected' : ''}>${f.icon || '📁'} ${f.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mã môn học:</label>
          <input type="text" id="matSubjectInput" class="form-control" placeholder="Ví dụ: POL103, BIO202...">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tags từ khóa (cách nhau bằng dấu phẩy):</label>
        <input type="text" id="matTagsInput" class="form-control" placeholder="Ví dụ: Tóm tắt, Đề cương, Trọng tâm...">
      </div>
      <div class="form-group">
        <label class="form-label">Tác giả / Người biên soạn:</label>
        <input type="text" id="matAuthorInput" class="form-control" value="${StorageService.getUserProfile().fullName}">
      </div>
      <div class="form-group">
        <label class="form-label">Nội dung tài liệu (Markdown / Text) (*):</label>
        <textarea id="matContentInput" class="form-control" rows="8" placeholder="# Tiêu đề\n- Ý 1: Giải thích..."></textarea>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="App.saveUploadedMaterial()">Lưu tài liệu (+20 EXP & +CP)</button>
    `;

    modal.classList.add("active");
  },

  saveUploadedMaterial() {
    const title = document.getElementById("matTitleInput")?.value.trim();
    const folderId = document.getElementById("matFolderSelect")?.value || "fld-llct";
    const subId = document.getElementById("matSubjectInput")?.value.trim() || "Shinora";
    const tagsRaw = document.getElementById("matTagsInput")?.value.trim() || "";
    const author = document.getElementById("matAuthorInput")?.value.trim() || "Sinh viên DThU";
    const content = document.getElementById("matContentInput")?.value.trim();

    if (!title || !content) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ Tiêu đề và Nội dung tài liệu!", "warning");
      return;
    }

    const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
    const wordCount = content.split(/\s+/).length;
    const readTimeMin = Math.max(1, Math.round(wordCount / 250));

    const newMat = {
      id: "mat-" + Date.now(),
      folderId,
      subjectId: subId,
      title,
      fileType: "md",
      author,
      readTimeMin,
      wordCount,
      tags,
      description: content.slice(0, 160).replace(/[#*`\n]/g, ' ').trim() + "...",
      content
    };

    const materials = StorageService.getMaterials();
    materials.unshift(newMat);
    StorageService.saveMaterials(materials);

    // Ghi nhận tích lũy ký tự đóng góp tài liệu & thưởng CP theo mốc 5k ký tự = 5 CP
    const profile = StorageService.getUserProfile();
    const cpGained = StorageService.recordMaterialContribution(profile.id, content.length, title);

    // Thưởng +20 EXP cho người dùng
    if (profile && profile.id !== "guest") {
      profile.exp = (profile.exp || 0) + 20;
      StorageService.saveUserProfile(profile);
    }

    this.closeModal();
    if (cpGained > 0) {
      this.showToast(`🎉 Đã lưu tài liệu "${title}" (+20 EXP) và đạt mốc thưởng +${cpGained} CP!`, "success", 4500);
    } else {
      this.showToast(`🎉 Đã lưu tài liệu "${title}" (+20 EXP) và cộng ${content.length.toLocaleString()} ký tự vào tiến độ tích lũy CP!`, "success", 4500);
    }

    // Set new doc as selected context
    this.docSelectedContext = {
      type: "file",
      id: newMat.id,
      folderId: newMat.folderId,
      name: newMat.title
    };

    this.renderHeader();
    this.renderMaterialsView(document.getElementById("mainContent"), newMat.id);
  },

  renderModerationView(container) {
    this.adminSubjectTab = "drafts";
    this.renderManageView(container);
  },

  approveDraft(draftId) {
    const res = StorageService.approveDraft(draftId);
    if (res) {
      this.showToast(`🎉 Đã duyệt bộ đề và gộp vào môn "${res.name}" (${res.code || res.id}) thành công! (Điểm Cống Hiến CP đã được trao theo sản lượng)`, "success", 4500);
      this.renderHeader();
      this.renderManageView(document.getElementById("mainContent"));
    }
  },

  rejectDraftConfirm(draftId) {
    this.showConfirmDialog({
      title: "Xác nhận từ chối đề thi",
      message: "Bạn có chắc chắn muốn từ chối bộ đề này không? Bộ đề sẽ bị xóa khỏi hàng đợi duyệt.",
      icon: "⚠️",
      confirmText: "Từ chối đề",
      isDanger: true,
      onConfirm: () => {
        StorageService.rejectDraft(draftId);
        this.renderHeader();
        this.renderManageView(document.getElementById("mainContent"));
      }
    });
  }
});
