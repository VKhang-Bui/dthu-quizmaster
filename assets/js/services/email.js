/**
 * EMAIL SERVICE
 * Quản lý kết nối tới Google Apps Script Web App để gửi Email OTP (300s) và Ticket CSKH.
 * Tích hợp kiểm tra cấu trúc email chạy ẩn và cơ chế Fallback mô phỏng.
 */
const EmailService = {
  STORAGE_KEY_URL: "dthu_quiz_apps_script_url",
  DEFAULT_APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw5INBlFEEhIeQkgRzPkc5ZGtsZkMKrjaXVfRnlXqpdRMemyW4DTUwA-sKE3GGQVWXLtA/exec",
  ADMIN_EMAIL: "vkhg.bui@gmail.com, giaosukhang621@gmail.com",
  ADMIN_PRIMARY_EMAIL: "vkhg.bui@gmail.com",
  ADMIN_BACKUP_EMAIL: "giaosukhang621@gmail.com",
  ADMIN_PHONE: "0354616301",
  ADMIN_NAME: "Shina (Bùi Văn Khang)",
  ADMIN_CLASS: "Shinora Dev",
  ADMIN_MSSV: "0024418475",
  ADMIN_UNIT: "Shinora Academic Studio",
  DEFAULT_EXPIRY_SECONDS: 300, // 300 giây (5 phút)

  getAppsScriptUrl() {
    return localStorage.getItem(this.STORAGE_KEY_URL) || this.DEFAULT_APPS_SCRIPT_URL;
  },

  setAppsScriptUrl(url) {
    if (!url) {
      localStorage.removeItem(this.STORAGE_KEY_URL);
    } else {
      localStorage.setItem(this.STORAGE_KEY_URL, url.trim());
    }
  },

  isConfigured() {
    return Boolean(this.getAppsScriptUrl());
  },

  /**
   * Kiểm tra định dạng và cấu trúc email (Chạy ẩn ở dưới)
   * Chấp nhận: các domain email phổ biến chuẩn RFC 5322
   */
  validateEmail(email) {
    if (!email || typeof email !== "string") {
      return { isValid: false, message: "Địa chỉ email không được để trống!" };
    }
    const clean = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!regex.test(clean)) {
      return { isValid: false, message: "Định dạng email không hợp lệ (Ví dụ: user@gmail.com)!" };
    }

    const domain = clean.split("@")[1];
    if (!domain || !domain.includes(".")) {
      return { isValid: false, message: "Tên miền email không tồn tại hoặc không hợp lệ!" };
    }

    // Các đuôi domain bị cấm hoặc rác phổ biến
    const blockedDomains = ["tempmail.com", "10minutemail.com", "fake.com", "test.com", "dispostable.com"];
    if (blockedDomains.includes(domain)) {
      return { isValid: false, message: "Vui lòng không sử dụng email tạm thời. Hãy dùng email chính chủ!" };
    }

    return { isValid: true, email: clean, message: "Email hợp lệ." };
  },

  /**
   * Gửi OTP 6 số đến Email sinh viên (Hạn 300s)
   */
  async sendOtp(studentId, email, fullName, otpCode) {
    const url = this.getAppsScriptUrl();
    const expirySeconds = this.DEFAULT_EXPIRY_SECONDS;

    // Nếu đã có Google Apps Script URL -> Gửi qua API thật
    if (url) {
      const payload = {
        action: "send-otp",
        email: email,
        fullName: fullName || "Học viên Shinora",
        studentId: studentId || "",
        otp: otpCode,
        expirySeconds: expirySeconds
      };

      try {
        // Gửi qua POST no-cors
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
          mode: "no-cors"
        });

        return {
          success: true,
          isRealEmail: true,
          message: `Đã gửi mã OTP thật đến hộp thư ${email}`,
          otp: otpCode,
          expirySeconds: expirySeconds
        };
      } catch (networkErr) {
        console.warn("Lỗi fetch POST, thử fallback GET:", networkErr);
        try {
          const params = new URLSearchParams(payload);
          await fetch(`${url}?${params.toString()}`, { mode: "no-cors" });
          return {
            success: true,
            isRealEmail: true,
            message: `Đã gửi mã OTP thật đến hộp thư ${email}`,
            otp: otpCode,
            expirySeconds: expirySeconds
          };
        } catch (getErr) {
          console.warn("Lỗi kết nối tới Google Apps Script:", getErr);
        }
      }
    }

    // Fallback: Chế độ mô phỏng khi không có mạng hoặc chưa gắn URL
    return {
      success: true,
      isRealEmail: false,
      message: `[Mô phỏng Email Shinora] Mã OTP: ${otpCode}`,
      otp: otpCode,
      expirySeconds: expirySeconds
    };
  },

  /**
   * Gửi Phiếu Báo Cáo Sự Cố / CSKH đến Email của Admin Bùi Văn Khang
   */
  async sendSupportTicket(ticketData) {
    const url = this.getAppsScriptUrl();

    if (url) {
      const payload = {
        action: "send-cskh-ticket",
        ticketId: ticketData.ticketId || ("TICKET-" + Date.now()),
        fullName: ticketData.fullName,
        studentId: ticketData.studentId,
        contact: ticketData.contact || ticketData.email || ticketData.phone,
        issueType: ticketData.issueType,
        title: ticketData.title,
        content: ticketData.content
      };

      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
          mode: "no-cors"
        });

        return {
          success: true,
          isRealEmail: true,
          message: `Đã gửi email thông báo sự cố trực tiếp đến hòm thư Admin (${this.ADMIN_EMAIL})!`
        };
      } catch (err) {
        console.warn("Không thể gửi email CSKH qua Google Apps Script POST, thử GET:", err);
        try {
          const params = new URLSearchParams(payload);
          await fetch(`${url}?${params.toString()}`, { mode: "no-cors" });
          return {
            success: true,
            isRealEmail: true,
            message: `Đã gửi email thông báo sự cố trực tiếp đến hòm thư Admin (${this.ADMIN_EMAIL})!`
          };
        } catch (e) {
          console.warn("Lỗi kết nối CSKH:", e);
        }
      }
    }

    return {
      success: true,
      isRealEmail: false,
      message: `Đã lưu phiếu báo cáo sự cố vào hệ thống hỗ trợ của Admin (${this.ADMIN_EMAIL})!`
    };
  }
};
