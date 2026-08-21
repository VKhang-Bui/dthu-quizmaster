-- ==============================================================================
-- SHINORA QUIZMASTER — CLOUDFLARE D1 SQL DATABASE SCHEMA (v4.2.0-beta.a1f8c3)
-- Hệ thống Cơ sở dữ liệu SQL Phân tán trên nền tảng Cloudflare Edge (D1 SQLite)
-- Tác giả: Bùi Văn Khang (Shina Sanora) — MSSV: 0024418475
-- ==============================================================================

-- BẬT HỖ TRỢ KHÓA NGOẠI (FOREIGN KEYS) CHO SQLITE
PRAGMA foreign_keys = ON;

-- 1. BẢNG USERS (TÀI KHOẢN NGƯỜI DÙNG, PHÂN QUYỀN & GAMIFICATION)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                             -- UUID v4 chống xung đột
  student_id TEXT UNIQUE NOT NULL,                 -- Mã số sinh viên duy nhất
  class_name TEXT DEFAULT '',                      -- Lớp sinh hoạt
  full_name TEXT NOT NULL,                         -- Họ và tên đầy đủ
  email TEXT DEFAULT '',                           -- Email sinh viên
  phone TEXT DEFAULT '',                           -- Số điện thoại
  department TEXT DEFAULT 'Khoa Kỹ thuật - Công nghệ', -- Khoa đào tạo
  role TEXT DEFAULT 'student',                     -- 'student', 'editor', 'admin'
  pin_code TEXT NOT NULL DEFAULT '90c4e8ab0935d9f3864339eab57266459c2fba3d2558e242881d627efcac100e', -- Hash của '123456' + Salt
  avatar TEXT DEFAULT '👨‍🎓',                       -- Emoji Avatar đại diện
  total_exp INTEGER DEFAULT 50,                   -- Điểm kinh nghiệm tích lũy toàn thời gian
  season_exp INTEGER DEFAULT 50,                  -- Điểm kinh nghiệm mùa giải
  contribution_points INTEGER DEFAULT 0,          -- Điểm cống hiến học thuật (CP)
  season_cp INTEGER DEFAULT 0,                    -- Điểm cống hiến mùa giải
  streak_days INTEGER DEFAULT 1,                  -- Chuỗi ngày học liên tục (🔥)
  quizzes_completed INTEGER DEFAULT 0,            -- Tổng số bài thi đã hoàn thành
  status TEXT DEFAULT 'pending_approval',         -- 'active', 'pending_approval', 'rejected'
  presence_status TEXT DEFAULT 'offline',         -- 'online', 'afk', 'offline'
  presence_context TEXT DEFAULT 'Trang chủ',      -- 'Trang chủ', 'Khảo thí', 'Nhập đề', 'Tài liệu', etc.
  last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP,    -- Thời điểm hoạt động gần nhất
  permissions TEXT DEFAULT '{}' CHECK(json_valid(permissions)), -- Ràng buộc JSON hợp lệ
  approved_by TEXT DEFAULT '',                    -- Người phê duyệt tài khoản
  approved_at TEXT,                               -- Thời điểm phê duyệt
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,      -- Thời điểm tạo
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP       -- Thời điểm cập nhật
);

-- INDEXES TỐI ƯU TRUY VẤN USERS (O(1) LOOKUP & LEADERBOARD)
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_leaderboard ON users(status, season_exp DESC, total_exp DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email != '';

-- TRIGGER TỰ ĐỘNG CẬP NHẬT updated_at (CHỐNG VÒNG LẶP VÔ HẠN VỚI MỆNH ĐỀ WHEN)
CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 2. BẢNG QUIZ_SUBMISSIONS (LỊCH SỬ LÀM BÀI THI & BẢNG XẾP HẠNG)
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id TEXT PRIMARY KEY,                             -- SUB-UUID v4
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Khóa ngoại xóa dây chuyền chống rác
  student_id TEXT NOT NULL,                        -- MSSV người làm bài
  full_name TEXT DEFAULT '',                       -- Họ tên người làm bài
  subject_id TEXT NOT NULL,                        -- Mã môn học (POL102, BT4026,...)
  subject_name TEXT NOT NULL,                      -- Tên môn học
  score REAL NOT NULL,                             -- Điểm số thang 10 (0.00 -> 10.00)
  correct_count INTEGER NOT NULL,                  -- Số câu trả lời đúng
  total_questions INTEGER NOT NULL,                -- Tổng số câu hỏi trong bài thi
  time_spent_seconds INTEGER DEFAULT 0,            -- Thời gian làm bài (giây)
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP      -- Thời điểm nộp bài
);

CREATE INDEX IF NOT EXISTS idx_quiz_user_id ON quiz_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_student_id ON quiz_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_subject_id ON quiz_submissions(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submitted_at ON quiz_submissions(submitted_at DESC);

-- 3. BẢNG DRAFT_SUBMISSIONS (ĐỀ THI ĐÓNG GÓP TỪ CỘNG ĐỒNG)
CREATE TABLE IF NOT EXISTS draft_submissions (
  id TEXT PRIMARY KEY,                             -- DRAFT-UUID v4
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- Giữ lại đề thi nếu user bị xóa
  author_name TEXT NOT NULL,                       -- Tên tác giả đề thi
  subject_name TEXT NOT NULL,                      -- Tên môn học
  subject_code TEXT NOT NULL,                      -- Mã môn học
  status TEXT DEFAULT 'pending',                   -- 'pending', 'approved', 'rejected'
  data_json TEXT NOT NULL CHECK(json_valid(data_json)), -- Ràng buộc JSON hợp lệ
  created_at TEXT DEFAULT CURRENT_TIMESTAMP       -- Thời điểm gửi
);

CREATE INDEX IF NOT EXISTS idx_draft_status ON draft_submissions(status);

-- 4. BẢNG SUPPORT_TICKETS (PHIẾU HỖ TRỢ CSKH & KHÔI PHỤC TÀI KHOẢN)
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,                             -- TICKET-UUID v4
  ticket_id TEXT UNIQUE NOT NULL,                  -- Mã phiếu rút gọn (TCK-XXXXXX)
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  student_id TEXT DEFAULT '',                      -- MSSV
  full_name TEXT DEFAULT '',                       -- Họ tên
  contact TEXT DEFAULT '',                         -- Thông tin liên hệ
  email TEXT DEFAULT '',                           -- Email
  phone TEXT DEFAULT '',                           -- Số điện thoại
  issue_type TEXT DEFAULT 'support',               -- 'support', 'pin_reset', 'question_bug'
  title TEXT NOT NULL,                             -- Tiêu đề phiếu
  content TEXT NOT NULL,                           -- Nội dung yêu cầu
  status TEXT DEFAULT 'open',                      -- 'open', 'in_progress', 'resolved'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP       -- Thời điểm tạo
);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_draft_created_at ON draft_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON support_tickets(ticket_id);

-- 5. KHỞI TẠO TÀI KHOẢN ADMIN CHÍNH THỨC (SHINA SANORA)
-- Mã PIN 012319 đã được băm SHA-256 thực sự: b5d6611c40792da5e50f6c3f3ea1e381dd064bc86ca84bf31ab697b60d546f2c
-- Sử dụng UPSERT hiện đại (ON CONFLICT) thay vì INSERT OR REPLACE để bảo toàn Created At và Khóa Ngoại
INSERT INTO users (
  id, student_id, class_name, full_name, email, phone, department, role, pin_code, avatar,
  total_exp, season_exp, contribution_points, season_cp, streak_days, quizzes_completed, status,
  permissions, approved_by, approved_at, created_at, updated_at
) VALUES (
  'USR-01', '0024418475', 'ĐHCNSH24A', 'Bùi Văn Khang (Shina Sanora)', 'vkhg.bui@gmail.com', '0354616301',
  'Khoa Kỹ thuật - Công nghệ', 'admin', 'b5d6611c40792da5e50f6c3f3ea1e381dd064bc86ca84bf31ab697b60d546f2c', 'avatar-crown',
  50, 50, 0, 0, 1, 1, 'active',
  '{"canApproveDrafts":true,"canEditSubjects":true,"canManageMaterials":true,"canManageUsers":true}',
  'Hệ Thống', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT(student_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  class_name = EXCLUDED.class_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  avatar = EXCLUDED.avatar,
  status = EXCLUDED.status,
  permissions = EXCLUDED.permissions,
  updated_at = CURRENT_TIMESTAMP;

-- 6. BẢNG OFFICIAL_SUBJECTS (NGÂN HÀNG MÔN HỌC & CÂU HỎI CHÍNH THỨC TRÊN CLOUDFLARE D1)
CREATE TABLE IF NOT EXISTS official_subjects (
  id TEXT PRIMARY KEY,                             -- ID môn học (POL102, BT4026, SUB_xxx)
  code TEXT NOT NULL,                              -- Mã học phần
  name TEXT NOT NULL,                              -- Tên môn học
  department TEXT DEFAULT 'Khoa Kỹ thuật - Công nghệ',
  author TEXT DEFAULT 'Ban Biên Tập',
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '📚',
  status TEXT DEFAULT 'official',
  is_guest_allowed INTEGER DEFAULT 1,              -- 1: Mở cho khách, 0: Khóa nội bộ
  chapters_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(chapters_json)),
  questions_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(questions_json)),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_official_subjects_code ON official_subjects(code);
CREATE INDEX IF NOT EXISTS idx_official_subjects_updated ON official_subjects(updated_at DESC);

