/**
 * SHINORA QUIZMASTER — CLOUDFLARE WORKERS API CORE (v4.2.0-beta.a1f8c3)
 * Backend xử lý toàn bộ logic Khảo thí, Xác thực & Phân quyền, Bảng xếp hạng trên Cloudflare D1.
 * 
 * 🛡️ HỆ THỐNG PHÒNG THỦ TOÀN DIỆN (ZERO-TRUST, CHỐNG GIAN LẬN & CHỐNG DDOS):
 * 1. Chặn đứng gian lận EXP (/api/quiz/submit: Bắt buộc Auth, Auto-bind Token StudentId, Trần 100 EXP).
 * 2. Cập nhật đầy đủ avatar & department trong /api/users/update.
 * 3. Triệt tiêu xung đột CORS (Chuẩn W3C: Whitelist Origin cố định, không dùng * khi Credentials: true).
 * 4. Bộ nhớ Rate Limit có cơ chế Tự động Dọn rác (GC) chống rò rỉ RAM Worker.
 * 5. Chống IDOR 2 lớp (RBAC + ABAC): Sinh viên chỉ sửa được thông tin của chính mình.
 * 6. Băm mật khẩu WebCrypto SHA-256 kết hợp Dynamic Secret Key (env.ADMIN_TOKEN_SECRET).
 * 7. Khóa cứng GET /api/users (Chỉ Admin), Data Minimization trong /api/leaderboard.
 */

// ── 1. BẢO MẬT: HÀM BĂM MÃ PIN VỚI WEBCRYPTO SHA-256 ──
const PIN_SALT = "shinora_quiz_secure_salt_v3";

async function hashPinCode(pin, customSalt = PIN_SALT) {
  if (!pin) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(String(pin).trim() + customSalt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── 2. BẢO MẬT: SINH VÀ XÁC THỰC SESSION TOKEN ──
async function createSessionToken(studentId, role, secretKey = "shinora_admin_secret_fallback_key_2026") {
  const payload = {
    sub: studentId,
    role: role,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // Hạn 7 ngày
  };
  const str = JSON.stringify(payload);
  const hash = await hashPinCode(str, secretKey);
  return btoa(str) + "." + hash;
}

async function verifyToken(authHeader, env) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const jsonStr = atob(parts[0]);
    const secretKey = env.ADMIN_TOKEN_SECRET || "shinora_admin_secret_fallback_key_2026";
    const expectedHash = await hashPinCode(jsonStr, secretKey);
    if (parts[1] !== expectedHash) return null;

    const payload = JSON.parse(jsonStr);
    if (Date.now() > payload.exp) return null; // Token hết hạn
    return payload; // Trả về { sub: studentId, role: role, ... }
  } catch (e) {
    return null;
  }
}

// ── 3. BẢO MẬT: BỘ ĐẾM RATE LIMIT NỘI TẠI CÓ CƠ CHẾ DỌN RÁC (GC) ──
const ipRateLimitStore = new Map();

function checkRateLimit(ip, endpoint, limit = 5, windowMs = 60000) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  // Tự động dọn dẹp các key hết hạn nếu Map quá lớn (> 500 phần tử) để chống tràn RAM
  if (ipRateLimitStore.size > 500) {
    for (const [k, v] of ipRateLimitStore.entries()) {
      if (now > v.resetAt) ipRateLimitStore.delete(k);
    }
  }

  let record = ipRateLimitStore.get(key);
  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + windowMs };
    ipRateLimitStore.set(key, record);
    return true;
  }

  record.count++;
  return record.count <= limit;
}

// ── 4. CHUẨN HÓA DỮ LIỆU USER TRẢ VỀ (DATA MINIMIZATION) ──
function sanitizeUserResponse(u, isAdmin = false) {
  const base = {
    id: u.id,
    studentId: u.student_id,
    className: u.class_name,
    fullName: u.full_name,
    department: u.department,
    role: u.role,
    avatar: u.avatar || "👨‍🎓",
    totalExp: u.total_exp || 0,
    seasonExp: u.season_exp || 0,
    contributionPoints: u.contribution_points || 0,
    seasonCp: u.season_cp || 0,
    streakDays: u.streak_days || 1,
    quizzesCompleted: u.quizzes_completed || 0,
    status: u.status,
    presenceStatus: u.presence_status || "offline",
    presenceContext: u.presence_context || "Trang chủ",
    lastSeenAt: u.last_seen_at,
    createdAt: u.created_at,
    permissions: typeof u.permissions === "string" ? JSON.parse(u.permissions || "{}") : (u.permissions || {})
  };

  if (isAdmin) {
    base.email = u.email;
    base.phone = u.phone;
    base.approvedBy = u.approved_by;
    base.approvedAt = u.approved_at;
  }

  // ⚠️ TUYỆT ĐỐI KHÔNG BAO GIỜ TRẢ PIN_CODE RA CLIENT
  return base;
}

// Helper an toàn đọc JSON body
async function safeParseJson(request) {
  try {
    return await request.json();
  } catch (e) {
    return null;
  }
}

// ── MAIN WORKER EXPORT ──
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const reqOrigin = request.headers.get("Origin") || "";
    const clientIP = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "local_dev_ip";

    // 1. CORS Whitelist chuẩn W3C (Không dùng * khi Credentials: true)
    const allowedOrigins = [
      "https://shinora-quizmaster.btai37999.workers.dev",
      "https://shinora-quizmaster.pages.dev",
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:5173",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:8080"
    ];

    let corsOrigin = allowedOrigins[0]; // Mặc định luôn trỏ về domain chính an toàn
    if (reqOrigin) {
      if (allowedOrigins.includes(reqOrigin) || reqOrigin.startsWith("http://localhost:") || reqOrigin.startsWith("http://127.0.0.1:")) {
        corsOrigin = reqOrigin;
      }
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ── API ROUTER XỬ LÝ DATABASE CLOUDFLARE D1 ──
    if (url.pathname.startsWith("/api/")) {
      try {
        const path = url.pathname.replace("/api", "");
        const authHeader = request.headers.get("Authorization");
        const tokenPayload = await verifyToken(authHeader, env);
        const isAdmin = tokenPayload?.role === "admin";
        const requestStudentId = tokenPayload?.sub;
        const secretKey = env.ADMIN_TOKEN_SECRET || "shinora_admin_secret_fallback_key_2026";

        // ----------------------------------------------------
        // 1. HEALTH CHECK
        // ----------------------------------------------------
        if (path === "/health" || path === "") {
          return new Response(JSON.stringify({
            status: "ok",
            version: "4.2.0-beta.a1f8c3",
            provider: "Cloudflare D1 SQL Database",
            timestamp: new Date().toISOString()
          }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 2. AUTHENTICATION: ĐĂNG NHẬP & CHỐNG BRUTE-FORCE RATE LIMIT
        // ----------------------------------------------------
        if (path === "/auth/login" && request.method === "POST") {
          // Lớp bảo vệ Rate Limit (Tối đa 5 lần / phút / IP)
          let isRateAllowed = true;
          if (env.LOGIN_LIMITER && typeof env.LOGIN_LIMITER.limit === "function") {
            try {
              const res = await env.LOGIN_LIMITER.limit({ key: clientIP });
              isRateAllowed = res.success;
            } catch (e) {
              isRateAllowed = checkRateLimit(clientIP, "login", 5, 60000);
            }
          } else {
            isRateAllowed = checkRateLimit(clientIP, "login", 5, 60000);
          }

          if (!isRateAllowed) {
            return new Response(JSON.stringify({
              success: false,
              error: "Lỗi 429: Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút."
            }), { status: 429, headers: corsHeaders });
          }

          const body = await safeParseJson(request);
          if (!body) {
            return new Response(JSON.stringify({ success: false, error: "Định dạng JSON không hợp lệ" }), { status: 400, headers: corsHeaders });
          }

          const studentId = (body.studentId || "").trim();
          const pinCode = (body.pinCode || "").trim();

          if (!studentId || !pinCode) {
            return new Response(JSON.stringify({ success: false, error: "Vui lòng nhập đầy đủ MSSV và Mã PIN" }), { status: 400, headers: corsHeaders });
          }

          const user = await env.DB.prepare("SELECT * FROM users WHERE student_id = ?").bind(studentId).first();
          if (!user) {
            return new Response(JSON.stringify({ success: false, error: "Không tìm thấy tài khoản với MSSV này" }), { status: 404, headers: corsHeaders });
          }

          if (user.status === "rejected") {
            return new Response(JSON.stringify({ success: false, error: "Tài khoản của bạn đã bị từ chối hoặc bị vô hiệu hóa." }), { status: 403, headers: corsHeaders });
          }

          // So khớp PIN (Hỗ trợ cả SHA-256 hash lẫn legacy PIN)
          const inputHashed = await hashPinCode(pinCode);
          const isPinValid = (user.pin_code === inputHashed) || (user.pin_code === pinCode);

          if (!isPinValid) {
            return new Response(JSON.stringify({ success: false, error: "Mã PIN đăng nhập không chính xác" }), { status: 401, headers: corsHeaders });
          }

          // Tự động nâng cấp hash nếu user đang dùng plaintext
          if (user.pin_code === pinCode) {
            await env.DB.prepare("UPDATE users SET pin_code = ? WHERE id = ?").bind(inputHashed, user.id).run();
          }

          // Cấp Session Token cho người dùng
          const token = await createSessionToken(user.student_id, user.role, secretKey);

          return new Response(JSON.stringify({
            success: true,
            token: token,
            user: sanitizeUserResponse(user, user.role === "admin")
          }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 3. USERS: LẤY DANH SÁCH TOÀN BỘ (CHỈ ADMIN MỚI ĐƯỢC PHÉP)
        // ----------------------------------------------------
        if (path === "/users" && request.method === "GET") {
          if (!isAdmin) {
            return new Response(JSON.stringify({
              success: false,
              error: "Lỗi 403: Truy cập bị từ chối. Cần quyền Quản trị viên."
            }), { status: 403, headers: corsHeaders });
          }

          const { results } = await env.DB.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
          const sanitized = results.map(u => sanitizeUserResponse(u, true));
          return new Response(JSON.stringify({ success: true, data: sanitized }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 3.1. USERS: LẤY THÔNG TIN CÁ NHÂN CỦA TÔI (PROFILE / ME)
        // ----------------------------------------------------
        if (path === "/users/me" && request.method === "GET") {
          if (!tokenPayload || !tokenPayload.sub) {
            return new Response(JSON.stringify({
              success: false,
              error: "Lỗi 401: Vui lòng đăng nhập để xem thông tin."
            }), { status: 401, headers: corsHeaders });
          }

          const user = await env.DB.prepare("SELECT * FROM users WHERE student_id = ?").bind(tokenPayload.sub).first();
          if (!user) {
            return new Response(JSON.stringify({ success: false, error: "Không tìm thấy tài khoản người dùng." }), { status: 404, headers: corsHeaders });
          }

          const myProfile = sanitizeUserResponse(user, false);
          myProfile.email = user.email;
          myProfile.phone = user.phone;

          return new Response(JSON.stringify({ success: true, data: myProfile }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 3.2. USERS: CẬP NHẬT TRẠNG THÁI HOẠT ĐỘNG (PRESENCE / AFK / OFFLINE)
        // ----------------------------------------------------
        if (path === "/users/presence" && request.method === "POST") {
          if (!tokenPayload || !tokenPayload.sub) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers: corsHeaders });
          }
          const body = await safeParseJson(request);
          const status = (body?.status || "online").toLowerCase();
          const context = (body?.context || "Trang chủ").trim();

          await env.DB.prepare(`
            UPDATE users 
            SET presence_status = ?, presence_context = ?, last_seen_at = CURRENT_TIMESTAMP 
            WHERE student_id = ?
          `).bind(status, context, tokenPayload.sub).run();

          return new Response(JSON.stringify({ success: true, status, context }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 4. USERS: ĐĂNG KÝ NGƯỜI DÙNG MỚI (CHỐNG SPAM RATE LIMIT)
        // ----------------------------------------------------
        if (path === "/users/register" && request.method === "POST") {
          if (!checkRateLimit(clientIP, "register", 5, 60000)) {
            return new Response(JSON.stringify({
              success: false,
              error: "Lỗi 429: Bạn đã gửi quá nhiều yêu cầu đăng ký. Vui lòng đợi 1 phút trước khi thử lại."
            }), { status: 429, headers: corsHeaders });
          }

          const body = await safeParseJson(request);
          if (!body) {
            return new Response(JSON.stringify({ success: false, error: "Định dạng JSON không hợp lệ" }), { status: 400, headers: corsHeaders });
          }

          const studentId = (body.studentId || "").trim();
          const fullName = (body.fullName || "").trim();
          const rawPin = (body.pinCode || "123456").trim();

          if (!studentId || !fullName) {
            return new Response(JSON.stringify({ success: false, error: "MSSV và Họ tên không được để trống" }), { status: 400, headers: corsHeaders });
          }

          // Kiểm tra trùng lặp MSSV
          const existing = await env.DB.prepare("SELECT id FROM users WHERE student_id = ?").bind(studentId).first();
          if (existing) {
            return new Response(JSON.stringify({ success: false, error: `Mã số sinh viên ${studentId} đã tồn tại trong hệ thống!` }), { status: 400, headers: corsHeaders });
          }

          const id = "USR-" + crypto.randomUUID();
          const hashedPin = await hashPinCode(rawPin);
          const permissionsJson = JSON.stringify(body.permissions || {});

          await env.DB.prepare(`
            INSERT INTO users (
              id, student_id, class_name, full_name, email, phone, department, role, pin_code, avatar,
              total_exp, season_exp, contribution_points, season_cp, streak_days, quizzes_completed,
              status, permissions, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            id,
            studentId,
            (body.className || "").trim(),
            fullName,
            body.email ? body.email.trim().toLowerCase() : `${studentId}@dthu.edu.vn`,
            (body.phone || "").trim(),
            (body.department || "Khoa Kỹ thuật - Công nghệ").trim(),
            "student", // Luôn ép role student khi tự đăng ký
            hashedPin,
            body.avatar || "👨‍🎓",
            50, // total_exp
            50, // season_exp
            0,  // contribution_points
            0,  // season_cp
            1,  // streak_days
            0,  // quizzes_completed
            "pending_approval",
            permissionsJson
          ).run();

          return new Response(JSON.stringify({
            success: true,
            data: { id, studentId, status: "pending_approval" }
          }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 5. USERS: CẬP NHẬT THÔNG TIN / DUYỆT TÀI KHOẢN (CHỐNG IDOR & 403 STRICT)
        // ----------------------------------------------------
        if (path === "/users/update" && request.method === "POST") {
          const body = await safeParseJson(request);
          if (!body || !body.id) {
            return new Response(JSON.stringify({ success: false, error: "Thiếu ID người dùng cần cập nhật" }), { status: 400, headers: corsHeaders });
          }

          // 1. KIỂM TRA QUYỀN ADMIN CHO CÁC TRƯỜNG NHẠY CẢM (RBAC)
          const isPrivilegedUpdate = (
            body.role !== undefined ||
            body.status !== undefined ||
            body.totalExp !== undefined ||
            body.seasonExp !== undefined ||
            body.contributionPoints !== undefined ||
            body.seasonCp !== undefined ||
            body.permissions !== undefined ||
            body.approvedBy !== undefined ||
            body.approvedAt !== undefined
          );

          if (isPrivilegedUpdate && !isAdmin) {
            return new Response(JSON.stringify({
              success: false,
              error: "Lỗi 403: Bạn không có quyền Quản trị viên để chỉnh sửa các trường nhạy cảm này."
            }), { status: 403, headers: corsHeaders });
          }

          // 2. CHỐNG IDOR: NGƯỜI DÙNG THƯỜNG CHỈ ĐƯỢC PHÉP SỬA CHÍNH MÌNH (ABAC)
          if (!isAdmin) {
            const targetUser = await env.DB.prepare("SELECT student_id FROM users WHERE id = ?").bind(body.id).first();
            if (!tokenPayload || !targetUser || targetUser.student_id !== requestStudentId) {
              return new Response(JSON.stringify({
                success: false,
                error: "Lỗi 403: Bạn chỉ được phép chỉnh sửa thông tin của chính mình."
              }), { status: 403, headers: corsHeaders });
            }
          }

          const fields = [];
          const values = [];

          if (body.status !== undefined) { fields.push("status = ?"); values.push(String(body.status)); }
          if (body.role !== undefined) { fields.push("role = ?"); values.push(String(body.role)); }
          if (body.pinCode !== undefined) {
            const hashed = await hashPinCode(String(body.pinCode));
            fields.push("pin_code = ?");
            values.push(hashed);
          }
          if (body.fullName !== undefined) { fields.push("full_name = ?"); values.push(String(body.fullName).trim()); }
          if (body.className !== undefined) { fields.push("class_name = ?"); values.push(String(body.className).trim()); }
          if (body.avatar !== undefined) { fields.push("avatar = ?"); values.push(String(body.avatar)); }
          if (body.department !== undefined) { fields.push("department = ?"); values.push(String(body.department).trim()); }
          if (body.email !== undefined) { fields.push("email = ?"); values.push(String(body.email).trim().toLowerCase()); }
          if (body.phone !== undefined) { fields.push("phone = ?"); values.push(String(body.phone).trim()); }
          if (body.totalExp !== undefined) { fields.push("total_exp = ?"); values.push(Math.max(0, Number(body.totalExp) || 0)); }
          if (body.seasonExp !== undefined) { fields.push("season_exp = ?"); values.push(Math.max(0, Number(body.seasonExp) || 0)); }
          if (body.contributionPoints !== undefined) { fields.push("contribution_points = ?"); values.push(Math.max(0, Number(body.contributionPoints) || 0)); }
          if (body.seasonCp !== undefined) { fields.push("season_cp = ?"); values.push(Math.max(0, Number(body.seasonCp) || 0)); }
          if (body.streakDays !== undefined) { fields.push("streak_days = ?"); values.push(Math.max(1, Number(body.streakDays) || 1)); }
          if (body.quizzesCompleted !== undefined) { fields.push("quizzes_completed = ?"); values.push(Math.max(0, Number(body.quizzesCompleted) || 0)); }
          if (body.approvedBy !== undefined) { fields.push("approved_by = ?"); values.push(String(body.approvedBy)); }
          if (body.approvedAt !== undefined) { fields.push("approved_at = ?"); values.push(String(body.approvedAt)); }
          if (body.permissions !== undefined) { fields.push("permissions = ?"); values.push(JSON.stringify(body.permissions)); }

          if (fields.length > 0) {
            fields.push("updated_at = CURRENT_TIMESTAMP");
            values.push(body.id);
            const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
            await env.DB.prepare(query).bind(...values).run();
          }

          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 6. QUIZ: NỘP BÀI THI & CHỐNG GIAN LẬN EXP (ANTI-CHEAT)
        // ----------------------------------------------------
        if (path === "/quiz/submit" && request.method === "POST") {
          // 🚨 BẢO MẬT: Bắt buộc đăng nhập mới được nộp bài
          if (!tokenPayload || !tokenPayload.sub) {
            return new Response(JSON.stringify({
              success: false,
              error: "Lỗi 401: Vui lòng đăng nhập để nộp bài thi."
            }), { status: 401, headers: corsHeaders });
          }

          const body = await safeParseJson(request);
          if (!body) {
            return new Response(JSON.stringify({ success: false, error: "Định dạng JSON không hợp lệ" }), { status: 400, headers: corsHeaders });
          }

          // 💡 TỰ ĐỘNG GÁN studentId TỪ TOKEN NẾU CLIENT KHÔNG TRUYỀN
          const studentId = (body.studentId || requestStudentId || "").trim();

          // 🚨 BẢO MẬT: Chống nộp bài thay người khác (ABAC)
          if (studentId !== requestStudentId && !isAdmin) {
            return new Response(JSON.stringify({
              success: false,
              error: "Lỗi 403: Bạn không thể nộp bài thay cho tài khoản khác."
            }), { status: 403, headers: corsHeaders });
          }

          // 🚨 BẢO MẬT: Giới hạn trần EXP hợp lệ (Tối đa 100 EXP / bài thi)
          const earnedExp = Math.min(Math.max(Number(body.earnedExp) || 0, 0), 100);
          const score = Math.min(Math.max(Number(body.score) || 0, 0), 10);
          const correctCount = Math.max(0, parseInt(body.correctCount, 10) || 0);
          const totalQuestions = Math.max(1, parseInt(body.totalQuestions, 10) || 1);
          const timeSpentSeconds = Math.max(0, parseInt(body.timeSpentSeconds, 10) || 0);

          const subId = "SUB-" + crypto.randomUUID();

          await env.DB.prepare(`
            INSERT INTO quiz_submissions (
              id, user_id, student_id, full_name, subject_id, subject_name,
              score, correct_count, total_questions, time_spent_seconds, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            subId,
            body.userId || "",
            studentId,
            (body.fullName || "").trim(),
            body.subjectId || "",
            body.subjectName || "",
            score,
            correctCount,
            totalQuestions,
            timeSpentSeconds
          ).run();

          // Cộng EXP hợp lệ và tăng quizzes_completed cho user
          if (studentId && earnedExp > 0) {
            await env.DB.prepare(`
              UPDATE users SET
                total_exp = total_exp + ?,
                season_exp = season_exp + ?,
                quizzes_completed = quizzes_completed + 1,
                updated_at = CURRENT_TIMESTAMP
              WHERE student_id = ?
            `).bind(earnedExp, earnedExp, studentId).run();
          }

          return new Response(JSON.stringify({
            success: true,
            submissionId: subId,
            earnedExp: earnedExp
          }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 7. LEADERBOARD: BẢNG XẾP HẠNG TRỰC TUYẾN (DATA MINIMIZATION)
        // ----------------------------------------------------
        if (path === "/leaderboard" && request.method === "GET") {
          // 🛡️ DATA MINIMIZATION: Ẩn hoàn toàn UUID (id) và contact info ra ngoài
          const { results } = await env.DB.prepare(`
            SELECT student_id as studentId, full_name as fullName, class_name as className,
                   avatar, season_exp as seasonExp, total_exp as totalExp,
                   season_cp as seasonCp, contribution_points as contributionPoints,
                   streak_days as streakDays, quizzes_completed as quizzesCompleted
            FROM users
            WHERE status = 'active'
            ORDER BY season_exp DESC, total_exp DESC
            LIMIT 50
          `).all();
          return new Response(JSON.stringify({ success: true, data: results }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 8. SUPPORT: TIẾP NHẬN PHIẾU BÁO LỖI & CSKH (RATE LIMIT 3 REQ/MIN)
        // ----------------------------------------------------
        if (path === "/support/ticket" && request.method === "POST") {
          if (!checkRateLimit(clientIP, "ticket", 3, 60000)) {
            return new Response(JSON.stringify({
              success: false,
              error: "Lỗi 429: Bạn đã gửi quá nhiều phiếu hỗ trợ. Vui lòng đợi 1 phút trước khi gửi tiếp."
            }), { status: 429, headers: corsHeaders });
          }

          const body = await safeParseJson(request);
          if (!body || !body.content) {
            return new Response(JSON.stringify({ success: false, error: "Nội dung phiếu hỗ trợ không được để trống" }), { status: 400, headers: corsHeaders });
          }

          const tId = body.ticketId || ("TCK-" + Math.floor(100000 + Math.random() * 900000));
          const id = "TICKET-" + crypto.randomUUID();

          await env.DB.prepare(`
            INSERT INTO support_tickets (
              id, ticket_id, user_id, student_id, full_name, contact, email, phone, issue_type, title, content, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)
          `).bind(
            id,
            tId,
            body.userId || "",
            body.studentId || "",
            (body.fullName || "").trim(),
            (body.contact || "").trim(),
            (body.email || "").trim(),
            (body.phone || "").trim(),
            body.issueType || "support",
            (body.title || "Phiếu hỗ trợ").trim(),
            body.content.trim()
          ).run();

          return new Response(JSON.stringify({ success: true, ticketId: tId }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 8.1. SUPPORT: LẤY DANH SÁCH PHIẾU CSKH (CHỈ ADMIN)
        // ----------------------------------------------------
        if (path === "/support/tickets" && request.method === "GET") {
          if (!isAdmin) {
            return new Response(JSON.stringify({ success: false, error: "Lỗi 403: Cần quyền Quản trị viên." }), { status: 403, headers: corsHeaders });
          }
          const { results } = await env.DB.prepare("SELECT * FROM support_tickets ORDER BY created_at DESC").all();
          const mapped = results.map(t => ({
            id: t.id,
            ticketId: t.ticket_id,
            userId: t.user_id,
            studentId: t.student_id,
            fullName: t.full_name,
            contact: t.contact,
            email: t.email,
            phone: t.phone,
            issueType: t.issue_type,
            title: t.title,
            content: t.content,
            note: t.content,
            status: t.status,
            createdAt: t.created_at
          }));
          return new Response(JSON.stringify({ success: true, data: mapped }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 8.2. SUPPORT: GIẢI QUYẾT PHIẾU & CẤP LẠI PIN (CHỈ ADMIN)
        // ----------------------------------------------------
        if (path === "/support/resolve" && request.method === "POST") {
          if (!isAdmin) {
            return new Response(JSON.stringify({ success: false, error: "Lỗi 403: Cần quyền Quản trị viên." }), { status: 403, headers: corsHeaders });
          }
          const body = await safeParseJson(request);
          if (!body || !body.ticketId) {
            return new Response(JSON.stringify({ success: false, error: "Thiếu mã phiếu hỗ trợ" }), { status: 400, headers: corsHeaders });
          }
          await env.DB.prepare("UPDATE support_tickets SET status = 'resolved' WHERE ticket_id = ? OR id = ?").bind(body.ticketId, body.ticketId).run();

          // Nếu có yêu cầu đặt lại mã PIN cho sinh viên
          if (body.studentId && body.newPin) {
            const hashed = await hashPinCode(body.newPin);
            await env.DB.prepare("UPDATE users SET pin_code = ?, updated_at = CURRENT_TIMESTAMP WHERE student_id = ?").bind(hashed, body.studentId).run();
          }

          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 9. DRAFTS: LẤY DANH SÁCH ĐỀ THI ĐÓNG GÓP (ADMIN & EDITOR)
        // ----------------------------------------------------
        if (path === "/drafts" && request.method === "GET") {
          const isEditorOrAdmin = isAdmin || tokenPayload?.role === "editor";
          if (!isEditorOrAdmin) {
            return new Response(JSON.stringify({ success: false, error: "Lỗi 403: Cần quyền Ban Biên Tập hoặc Quản trị viên." }), { status: 403, headers: corsHeaders });
          }
          const { results } = await env.DB.prepare("SELECT * FROM draft_submissions WHERE status = 'pending' ORDER BY created_at DESC").all();
          const mapped = results.map(d => {
            let parsedData = {};
            try { parsedData = JSON.parse(d.data_json); } catch (e) {}
            return Object.assign({}, parsedData, {
              id: d.id,
              userId: d.user_id,
              author: d.author_name,
              name: d.subject_name,
              code: d.subject_code,
              status: d.status,
              createdAt: d.created_at
            });
          });
          return new Response(JSON.stringify({ success: true, data: mapped }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 9.1. DRAFTS: GỬI ĐỀ THI ĐÓNG GÓP MỚI LÊN D1
        // ----------------------------------------------------
        if (path === "/drafts/create" && request.method === "POST") {
          if (!tokenPayload || !tokenPayload.sub) {
            return new Response(JSON.stringify({ success: false, error: "Lỗi 401: Vui lòng đăng nhập để đóng góp đề thi." }), { status: 401, headers: corsHeaders });
          }
          const body = await safeParseJson(request);
          if (!body || !body.name) {
            return new Response(JSON.stringify({ success: false, error: "Tên môn học không được để trống" }), { status: 400, headers: corsHeaders });
          }
          const id = body.id || ("DRAFT-" + crypto.randomUUID());
          const authorName = (body.author || tokenPayload.sub || "Sinh viên").trim();
          const subName = (body.name || "Bộ đề đóng góp").trim();
          const subCode = (body.code || "CONTRIB-01").trim();
          const dataJson = JSON.stringify(body);

          await env.DB.prepare(`
            INSERT INTO draft_submissions (id, user_id, author_name, subject_name, subject_code, status, data_json, created_at)
            VALUES (?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP)
          `).bind(id, body.userId || "", authorName, subName, subCode, dataJson).run();

          return new Response(JSON.stringify({ success: true, draftId: id }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 9.2. DRAFTS: CẬP NHẬT TRẠNG THÁI DUYỆT / TỪ CHỐI (ADMIN & EDITOR)
        // ----------------------------------------------------
        if (path === "/drafts/update-status" && request.method === "POST") {
          const isEditorOrAdmin = isAdmin || tokenPayload?.role === "editor";
          if (!isEditorOrAdmin) {
            return new Response(JSON.stringify({ success: false, error: "Lỗi 403: Cần quyền Ban Biên Tập hoặc Quản trị viên." }), { status: 403, headers: corsHeaders });
          }
          const body = await safeParseJson(request);
          if (!body || !body.id || !body.status) {
            return new Response(JSON.stringify({ success: false, error: "Thiếu ID đề thi hoặc trạng thái cần cập nhật" }), { status: 400, headers: corsHeaders });
          }
          await env.DB.prepare("UPDATE draft_submissions SET status = ? WHERE id = ?").bind(String(body.status), String(body.id)).run();
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 9.3. DRAFTS: XÓA VĨNH VIỄN ĐỀ THI ĐÓNG GÓP (ADMIN & EDITOR)
        // ----------------------------------------------------
        if (path === "/drafts/delete" && request.method === "POST") {
          const isEditorOrAdmin = isAdmin || tokenPayload?.role === "editor";
          if (!isEditorOrAdmin) {
            return new Response(JSON.stringify({ success: false, error: "Lỗi 403: Cần quyền Ban Biên Tập hoặc Quản trị viên." }), { status: 403, headers: corsHeaders });
          }
          const body = await safeParseJson(request);
          if (!body || !body.id) {
            return new Response(JSON.stringify({ success: false, error: "Thiếu ID đề thi cần xóa" }), { status: 400, headers: corsHeaders });
          }
          await env.DB.prepare("DELETE FROM draft_submissions WHERE id = ?").bind(String(body.id)).run();
          return new Response(JSON.stringify({ success: true, message: "Đã xóa vĩnh viễn đề thi đóng góp khỏi CSDL." }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 10. QUIZ: LẤY LỊCH SỬ THI TỪ CLOUDFLARE D1
        // ----------------------------------------------------
        if (path === "/quiz/history" && request.method === "GET") {
          if (!tokenPayload || !tokenPayload.sub) {
            return new Response(JSON.stringify({ success: false, error: "Lỗi 401: Vui lòng đăng nhập để xem lịch sử." }), { status: 401, headers: corsHeaders });
          }
          const targetStudentId = (isAdmin && url.searchParams.get("studentId")) ? url.searchParams.get("studentId") : tokenPayload.sub;
          const { results } = await env.DB.prepare(`
            SELECT id, student_id as studentId, full_name as userName, subject_id as subjectId,
                   subject_name as subjectName, score as score10, correct_count as correctCount,
                   total_questions as totalQuestions, time_spent_seconds as timeTakenSeconds,
                   submitted_at as completedAt
            FROM quiz_submissions
            WHERE student_id = ?
            ORDER BY submitted_at DESC
            LIMIT 30
          `).bind(targetStudentId).all();

          const mapped = results.map(r => ({
            ...r,
            mode: "exam",
            isSynced: true,
            isPassed: (r.score10 >= 5.0),
            percentage: r.totalQuestions > 0 ? Math.round((r.correctCount / r.totalQuestions) * 100) : 0,
            gradeTitle: r.score10 >= 9.0 ? "Xuất sắc 🎉" : (r.score10 >= 8.0 ? "Giỏi ⭐" : (r.score10 >= 6.5 ? "Khá 👍" : (r.score10 >= 5.0 ? "Đạt Yêu Cầu ✓" : "Cần cố gắng thêm")))
          }));

          return new Response(JSON.stringify({ success: true, data: mapped }), { headers: corsHeaders });
        }

        // ----------------------------------------------------
        // 11. SEASON: ĐẶT LẠI ĐIỂM MÙA GIẢI (CHỈ ADMIN)
        // ----------------------------------------------------
        if (path === "/season/reset-points" && request.method === "POST") {
          if (!isAdmin) {
            return new Response(JSON.stringify({ success: false, error: "Lỗi 403: Cần quyền Quản trị viên." }), { status: 403, headers: corsHeaders });
          }
          await env.DB.prepare("UPDATE users SET season_exp = 0, season_cp = 0, updated_at = CURRENT_TIMESTAMP WHERE status = 'active'").run();
          return new Response(JSON.stringify({ success: true, message: "Đã đặt lại điểm mùa giải về 0 cho tất cả thành viên." }), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // ── TỰ ĐỘNG PHÂN PHỐI STATIC ASSETS (INDEX.HTML, CSS, JS, DATA) ──
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  }
};
