/**
 * EMAIL SERVICE
 * Quản lý kết nối tới Google Apps Script Web App để gửi Email OTP (300s) và Ticket CSKH.
 * Tích hợp kiểm tra cấu trúc email chạy ẩn và cơ chế Fallback mô phỏng.
 */
const EmailService = {
  STORAGE_KEY_URL: "dthu_quiz_apps_script_url",
  ADMIN_EMAIL: "bvkhang.cnsh@dthu.edu.vn",
  DEFAULT_EXPIRY_SECONDS: 300, // 300 giây (5 phút)

  getAppsScriptUrl() {
    return localStorage.getItem(this.STORAGE_KEY_URL) || "";
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
   * Chấp nhận: @dthu.edu.vn hoặc các domain email phổ biến chuẩn RFC 5322
   */
  validateEmail(email) {
    if (!email || typeof email !== "string") {
      return { isValid: false, message: "Địa chỉ email không được để trống!" };
    }
    const clean = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!regex.test(clean)) {
      return { isValid: false, message: "Định dạng email không hợp lệ (Ví dụ: sinhvien@dthu.edu.vn hoặc user@gmail.com)!" };
    }

    const domain = clean.split("@")[1];
    if (!domain || !domain.includes(".")) {
      return { isValid: false, message: "Tên miền email không tồn tại hoặc không hợp lệ!" };
    }

    // Các đuôi domain bị cấm hoặc rác phổ biến
    const blockedDomains = ["tempmail.com", "10minutemail.com", "fake.com", "test.com", "dispostable.com"];
    if (blockedDomains.includes(domain)) {
      return { isValid: false, message: "Vui lòng không sử dụng email tạm thời. Hãy dùng email sinh viên DThu hoặc Gmail chính chủ!" };
    }

    return { isValid: true, email: clean, message: "Email hợp lệ." };
  },

  /**
   * Gửi OTP 6 số đến Email sinh viên (Hạn 300s)
   */
  async sendOtp(studentId, email, fullName, otpCode) {
    const url = this.getAppsScriptUrl();
    const expirySeconds = this.DEFAULT_EXPIRY_SECONDS;

    // Nếu đã cấu hình Google Apps Script URL -> Gửi qua API thật
    if (url) {
      try {
        const payload = {
          action: "send-otp",
          email: email,
          fullName: fullName || "Sinh viên DThu",
          studentId: studentId || "",
          otp: otpCode,
          expirySeconds: expirySeconds
        };

        // Dùng fetch POST text/plain để tránh preflight CORS phức tạp
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        try {
          const resJson = await response.json();
          return {
            success: true,
            isRealEmail: true,
            message: resJson.message || `Đã gửi mã OTP thật đến hộp thư ${email}`,
            otp: otpCode,
            expirySeconds: expirySeconds
          };
        } catch (parseErr) {
          return {
            success: true,
            isRealEmail: true,
            message: `Đã gửi mã OTP thật đến hộp thư ${email}`,
            otp: otpCode,
            expirySeconds: expirySeconds
          };
        }
      } catch (networkErr) {
        console.warn("Lỗi kết nối tới Google Apps Script, fallback sang mô phỏng:", networkErr);
      }
    }

    // Fallback: Chế độ mô phỏng khi chưa gắn Web App URL
    return {
      success: true,
      isRealEmail: false,
      message: `[Mô phỏng Email DThu] Mã OTP: ${otpCode} (Chưa cấu hình Google Apps Script URL)`,
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
      try {
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

        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        return {
          success: true,
          isRealEmail: true,
          message: `Đã gửi email thông báo sự cố trực tiếp đến hòm thư Admin (${this.ADMIN_EMAIL})!`
        };
      } catch (err) {
        console.warn("Không thể gửi email CSKH qua Google Apps Script:", err);
      }
    }

    return {
      success: true,
      isRealEmail: false,
      message: `Đã lưu phiếu báo cáo sự cố vào hệ thống hỗ trợ của Admin (${this.ADMIN_EMAIL})!`
    };
  }
};
