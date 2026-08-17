/**
 * ═════════════════════════════════════════════════════════════════════════════
 * DTHU QUIZMASTER - GOOGLE APPS SCRIPT BACKEND SERVICE
 * ═════════════════════════════════════════════════════════════════════════════
 * Hệ thống tự động gửi Email OTP (Hiệu lực 300s) và Phiếu hỗ trợ CSKH đến Admin.
 * 
 * Tác giả: Bùi Văn Khang (Admin - Khoa Nông nghiệp & Sinh học DThu)
 * Phiên bản: 2.0 (Google Workspace / Gmail Integration)
 * ═════════════════════════════════════════════════════════════════════════════
 */

// Cấu hình Email Quản Trị Viên & CSKH Mặc Định
const CONFIG = {
  ADMIN_EMAIL: "vkhg.bui@gmail.com, giaosukhang621@gmail.com",
  ADMIN_NAME: "Bùi Văn Khang",
  ADMIN_CLASS: "ĐHCNSH24A",
  ADMIN_MSSV: "0024418475",
  ADMIN_PHONE: "0354616301",
  ADMIN_UNIT: "Khoa Kỹ thuật - Công nghệ · Trường Đại học Đồng Tháp",
  APP_NAME: "DThu QuizMaster",
  SYSTEM_TITLE: "Hệ Thống Ôn Thi Trắc Nghiệm - Đại Học Đồng Tháp"
};

/**
 * Xử lý yêu cầu GET (Kiểm tra trạng thái máy chủ hoặc gửi OTP dạng URL Parameters)
 */
function doGet(e) {
  try {
    let data = (e && e.parameter) ? e.parameter : {};
    if (data.action) {
      return handleAction(data);
    }
    return createJsonResponse({
      success: true,
      service: "DThu QuizMaster Email Gateway",
      status: "online",
      admin: CONFIG.ADMIN_EMAIL,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString(),
      message: "Lỗi xử lý yêu cầu GET: " + err.message
    });
  }
}

/**
 * Xử lý yêu cầu POST từ Frontend DThu QuizMaster
 */
function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (pErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    return handleAction(data);

  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString(),
      message: "Lỗi xử lý yêu cầu POST: " + err.message
    });
  }
}

/**
 * Điều phối các hành động nghiệp vụ
 */
function handleAction(data) {
  const action = data.action || "health-check";
  let response = { success: false, message: "Hành động không xác định." };

  switch (action) {
    // 1. Kiểm tra tính hợp lệ của email
    case "verify-email":
      response = handleVerifyEmail(data);
      break;

    // 2. Gửi mã OTP xác thực khôi phục PIN (Hiệu lực 300s)
    case "send-otp":
      response = handleSendOtp(data);
      break;

    // 3. Gửi phiếu báo cáo sự cố / ý kiến đóng góp đến Admin & CSKH
    case "send-cskh-ticket":
      response = handleSendCskhTicket(data);
      break;

    default:
      response = { success: true, message: "DThu QuizMaster Serverless API đang hoạt động tốt!" };
  }

  return createJsonResponse(response);
}

/**
 * 1. Hàm kiểm tra tính hợp lệ của Email
 */
function handleVerifyEmail(data) {
  const email = (data.email || "").trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      isValid: false,
      message: "Địa chỉ email không đúng định dạng chuẩn!"
    };
  }

  return {
    success: true,
    isValid: true,
    email: email,
    message: "Email hợp lệ và sẵn sàng đăng ký!"
  };
}

/**
 * 2. Hàm gửi Mã OTP Khôi Phục Mã PIN (Hiệu lực 300s)
 */
function handleSendOtp(data) {
  const recipientEmail = (data.email || "").trim();
  const recipientName = data.fullName || "Sinh viên DThu";
  const studentId = data.studentId || "";
  const otpCode = data.otp || Math.floor(100000 + Math.random() * 900000).toString();
  const expirySeconds = data.expirySeconds || 300; // 5 phút

  if (!recipientEmail) {
    return { success: false, message: "Thiếu địa chỉ email người nhận!" };
  }

  const subject = `[${CONFIG.APP_NAME}] Mã Xác Thực Đặt Lại Mã PIN: ${otpCode}`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px 28px; text-align: center; color: #ffffff;">
        <div style="font-size: 36px; margin-bottom: 6px;">🎓</div>
        <h1 style="font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">TRƯỜNG ĐẠI HỌC ĐỒNG THÁP</h1>
        <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">${CONFIG.APP_NAME} - Hệ Thống Ôn Thi Trắc Nghiệm</div>
      </div>

      <!-- Body -->
      <div style="padding: 28px; color: #334155; line-height: 1.6;">
        <p style="font-size: 15px; margin-top: 0;">
          Xin chào <strong>${recipientName}</strong> ${studentId ? `(MSSV: <strong>${studentId}</strong>)` : ''},
        </p>
        <p style="font-size: 14px; color: #475569;">
          Hệ thống vừa nhận được yêu cầu đặt lại mã PIN đăng nhập cho tài khoản của bạn trên cổng <strong>${CONFIG.APP_NAME}</strong>.
        </p>

        <!-- OTP Card -->
        <div style="background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 8px; padding: 18px 24px; text-align: center; margin: 24px 0;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0369a1; letter-spacing: 1px; margin-bottom: 6px;">
            MÃ XÁC THỰC OTP CỦA BẠN
          </div>
          <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0284c7; font-family: monospace;">
            ${otpCode}
          </div>
          <div style="font-size: 12.5px; color: #b45309; margin-top: 8px; font-weight: 600;">
            ⏱️ Mã có hiệu lực trong <strong>${Math.floor(expirySeconds / 60)} phút (${expirySeconds} giây)</strong>.
          </div>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400e; margin-bottom: 20px;">
          🔒 <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Ban quản trị không bao giờ yêu cầu bạn cung cấp mã OTP. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
        </div>

        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          Nếu bạn gặp sự cố, vui lòng liên hệ CSKH & Admin Bùi Văn Khang qua email: <a href="mailto:${CONFIG.ADMIN_EMAIL}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${CONFIG.ADMIN_EMAIL}</a>.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} ${CONFIG.APP_NAME} · Trường Đại học Đồng Tháp (DThu)<br>
        Email tự động từ hệ thống, vui lòng không phản hồi trực tiếp vào địa chỉ này.
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    htmlBody: htmlBody
  });

  return {
    success: true,
    message: `Đã gửi mã OTP thành công đến ${recipientEmail}`,
    email: recipientEmail,
    expirySeconds: expirySeconds
  };
}

/**
 * 3. Hàm gửi Phiếu Báo Cáo Sự Cố / CSKH Đến Hộp Thư Của Admin
 */
function handleSendCskhTicket(data) {
  const studentName = data.fullName || "Sinh viên ẩn danh";
  const studentId = data.studentId || "Chưa cung cấp";
  const contactInfo = data.contact || data.email || data.phone || "Chưa cung cấp";
  const issueType = data.issueType || "Yêu cầu hỗ trợ CSKH";
  const ticketTitle = data.title || "Yêu cầu hỗ trợ tài khoản DThu QuizMaster";
  const content = data.content || "Không có nội dung chi tiết.";
  const ticketId = data.ticketId || ("TICKET-" + Date.now());

  const subject = `[CSKH DThu QuizMaster] [${issueType}] - ${studentName} (${studentId}) - Mã: ${ticketId}`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 22px 28px; text-align: center; color: #ffffff;">
        <div style="font-size: 36px; margin-bottom: 6px;">🆘</div>
        <h1 style="font-size: 19px; font-weight: 800; margin: 0;">PHIẾU BÁO CÁO SỰ CỐ & YÊU CẦU CSKH</h1>
        <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Gửi đến Ban Quản Trị & Admin Bùi Văn Khang</div>
      </div>

      <!-- Info Table -->
      <div style="padding: 26px; color: #334155;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13.5px; line-height: 1.8;">
          <div>🎫 <strong>Mã Phiếu (Ticket ID):</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 700; color: #be123c;">${ticketId}</code></div>
          <div>👤 <strong>Họ và tên:</strong> ${studentName}</div>
          <div>🆔 <strong>Mã số sinh viên (MSSV):</strong> <strong>${studentId}</strong></div>
          <div>📞 <strong>Liên hệ phản hồi:</strong> <a href="mailto:${contactInfo}" style="color: #0284c7; font-weight: 600;">${contactInfo}</a></div>
          <div>🏷️ <strong>Phân loại sự cố:</strong> <span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 700;">${issueType}</span></div>
          <div>📅 <strong>Thời gian gửi:</strong> ${new Date().toLocaleString('vi-VN')}</div>
        </div>

        <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">📝 Tiêu đề: ${ticketTitle}</h3>
        
        <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 18px; font-size: 14px; line-height: 1.7; color: #1e293b; white-space: pre-wrap; margin-bottom: 22px;">
${content}
        </div>

        <div style="border-top: 1px dashed #cbd5e1; padding-top: 14px; font-size: 12.5px; color: #64748b;">
          💡 <strong>Hướng dẫn xử lý cho Admin:</strong> Bạn có thể truy cập Bảng quản trị người dùng trên DThu QuizMaster để cấp lại mã PIN mặc định <code>123456</code> hoặc phản hồi qua email của sinh viên ở trên.
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 14px 28px; text-align: center; font-size: 12px; color: #64748b;">
        Thông báo tự động từ Hệ Thống CSKH DThu QuizMaster
      </div>
    </div>
  `;

  // Gửi email cho Admin Bùi Văn Khang
  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });

  return {
    success: true,
    ticketId: ticketId,
    message: `Đã gửi phiếu hỗ trợ thành công đến Ban Quản Trị / Admin (${CONFIG.ADMIN_EMAIL})!`
  };
}

/**
 * Trợ giúp tạo phản hồi HTTP JSON kèm CORS Headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
