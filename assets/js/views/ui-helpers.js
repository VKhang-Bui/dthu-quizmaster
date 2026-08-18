/**
 * UI HELPERS MODULE
 * Toast thông báo, Alert inline, Confirm Dialog, Modal helpers.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  showToast(message, type = "info", duration = null) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const settings = StorageService.getAppSettings();
    const timeout = duration || settings.toastDuration || 3500;

    const icons = {
      success: "✓",
      info: "ℹ️",
      warning: "⚠️",
      danger: "✕"
    };

    const toast = document.createElement("div");
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
      <div class="toast-msg">${message}</div>
      <button class="toast-close" title="Đóng">&times;</button>
      <div class="toast-progress"></div>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    const progressBar = toast.querySelector(".toast-progress");

    // Animation progress bar
    progressBar.style.transition = `transform ${timeout}ms linear`;
    setTimeout(() => {
      progressBar.style.transform = "scaleX(0)";
    }, 10);

    const removeToast = () => {
      toast.classList.add("hide");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    };

    const timer = setTimeout(removeToast, timeout);

    closeBtn.onclick = () => {
      clearTimeout(timer);
      removeToast();
    };

    container.appendChild(toast);
  },

  showInlineAlert(targetContainerId, message, type = "warning") {
    const container = document.getElementById(targetContainerId);
    if (!container) {
      this.showToast(message, type);
      return;
    }

    // Xóa alert cũ nếu có
    const existing = container.querySelector(".inline-alert-bar");
    if (existing) existing.remove();

    const icons = {
      warning: "⚠️",
      danger: "🚫",
      info: "ℹ️",
      success: "✓"
    };

    const alertEl = document.createElement("div");
    alertEl.className = `inline-alert-bar ${type}`;
    alertEl.innerHTML = `
      <span>${icons[type] || '⚠️'}</span>
      <span style="flex: 1;">${message}</span>
      <button style="background:none; border:none; cursor:pointer; font-size:16px; color:inherit; padding:0 4px;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.insertBefore(alertEl, container.firstChild);

    // Tự động cuộn tới nếu cấu hình cho phép
    const settings = StorageService.getAppSettings();
    if (settings.autoScrollToError) {
      alertEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      if (alertEl.parentNode) alertEl.remove();
    }, 4500);
  },

  openSettingsModal() {
    this.openUserDrawer("settings");
  },

  onToastDurationChange(val) {
    const duration = parseInt(val, 10) || 3500;
    StorageService.saveAppSettings({ toastDuration: duration });
    this.showToast(`Đã lưu thời gian hiển thị thông báo: ${duration / 1000} giây`, "success", 2000);
  },

  toggleWarningKey(key) {
    if (StorageService.isWarningSuppressed(key)) {
      StorageService.unsuppressWarning(key);
      this.showToast(`Đã bật lại cảnh báo: ${StorageService.KNOWN_WARNINGS[key]?.title || key}`, "success");
    } else {
      StorageService.suppressWarning(key);
      this.showToast(`Đã tắt (ẩn) cảnh báo: ${StorageService.KNOWN_WARNINGS[key]?.title || key}`, "info");
    }
    this.renderDrawerLevel("settings-alerts");
  },

  resetAllWarnings() {
    StorageService.resetSuppressedWarnings();
    this.showToast("✅ Đã khôi phục toàn bộ các cảnh báo gốc của hệ thống!", "success");
    this.renderDrawerLevel("settings-alerts");
  },

  showConfirmDialog(config = {}) {
    const {
      title = "Xác nhận hành động",
      message = "Bạn có chắc chắn muốn thực hiện hành động này?",
      icon = "⚠️",
      confirmText = "Xác nhận",
      cancelText = "Hủy bỏ",
      isDanger = false,
      warningKey = null,
      onConfirm = () => {},
      onCancel = () => {}
    } = config;

    // Nếu người dùng đã chọn "Không hiển thị lại cảnh báo này" trước đó -> Thực thi ngay lập tức
    if (warningKey && StorageService.isWarningSuppressed(warningKey)) {
      onConfirm();
      return;
    }

    const modal = document.getElementById("globalModal");
    const titleEl = document.getElementById("modalTitle");
    const bodyEl = document.getElementById("modalBody");
    const footerEl = document.getElementById("modalFooter");

    titleEl.textContent = title;

    bodyEl.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: flex-start;">
        <div style="font-size: 32px; line-height: 1;">${icon}</div>
        <div style="flex: 1;">
          <div style="font-size: 14.5px; color: var(--text-primary); line-height: 1.55; margin-bottom: 16px;">
            ${message}
          </div>

          ${warningKey ? `
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); cursor: pointer; user-select: none; padding: 6px 0; border-top: 1px dashed var(--border);">
              <input type="checkbox" id="chkSuppressWarning" style="cursor: pointer; width: 16px; height: 16px;">
              <span>Không hiển thị lại cảnh báo này trong tương lai</span>
            </label>
          ` : ''}
        </div>
      </div>
    `;

    footerEl.innerHTML = `
      <button class="btn" id="btnCancelDialog">${cancelText}</button>
      <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="btnConfirmDialog">${confirmText}</button>
    `;

    document.getElementById("btnCancelDialog").onclick = () => {
      App.closeModal();
      onCancel();
    };

    document.getElementById("btnConfirmDialog").onclick = () => {
      const chk = document.getElementById("chkSuppressWarning");
      if (chk && chk.checked && warningKey) {
        StorageService.suppressWarning(warningKey);
      }
      App.closeModal();
      onConfirm();
    };

    modal.classList.add("active");
  }
});
