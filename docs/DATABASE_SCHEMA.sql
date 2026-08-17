-- ==============================================================================
-- DTHU QUIZMASTER - SUPABASE POSTGRESQL DATABASE SCHEMA & RLS POLICIES
-- Tác giả: Bùi Văn Khang (Lớp ĐHCNSH24A - Khoa Kỹ thuật & Công nghệ - ĐH Đồng Tháp)
-- Dự án: Hệ thống Ôn tập & Thi trắc nghiệm Đại học Đồng Tháp
-- ==============================================================================

-- 1. BẬT EXTENSIONS CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TẠO BẢNG TÀI KHOẢN NGƯỜI DÙNG & PHÂN QUYỀN (USERS & PROFILES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('USR-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)),
    student_id TEXT UNIQUE NOT NULL,
    class_name TEXT DEFAULT '',
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT '',
    department TEXT DEFAULT 'Khoa Kỹ thuật - Công nghệ',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'editor', 'admin')),
    pin_code TEXT NOT NULL DEFAULT '123456',
    avatar TEXT DEFAULT '👨‍🎓',
    total_exp INTEGER NOT NULL DEFAULT 50,
    streak_days INTEGER NOT NULL DEFAULT 1,
    quizzes_completed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('active', 'pending_approval', 'suspended', 'rejected')),
    permissions JSONB DEFAULT '{"canApproveDrafts": false, "canEditSubjects": false, "canManageMaterials": false, "canManageUsers": false}'::jsonb,
    approved_by TEXT DEFAULT '',
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_student_id ON public.users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Seed Tài Khoản ADMIN Mặc Định (Bùi Văn Khang)
INSERT INTO public.users (
    id, student_id, class_name, full_name, email, phone, department, role, pin_code, avatar, total_exp, streak_days, quizzes_completed, status, permissions
) VALUES (
    'USR-01',
    '0024418475',
    'ĐHCNSH24A',
    'Bùi Văn Khang',
    'vkhg.bui@gmail.com',
    '0354616301',
    'Khoa Kỹ thuật - Công nghệ',
    'admin',
    '123456',
    '👨‍🎓',
    1000,
    14,
    35,
    'active',
    '{"canApproveDrafts": true, "canEditSubjects": true, "canManageMaterials": true, "canManageUsers": true}'::jsonb
) ON CONFLICT (student_id) DO UPDATE SET
    role = 'admin',
    status = 'active',
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    permissions = EXCLUDED.permissions;

-- ==============================================================================
-- 3. BẢNG MÔN HỌC & NGÂN HÀNG ĐỀ THI (SUBJECTS & DRAFTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY, -- 'CNXHKH', 'TRIET_HOC'
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT DEFAULT 'Khoa Kỹ thuật - Công nghệ',
    author TEXT DEFAULT 'Ban Biên Tập DThu',
    description TEXT DEFAULT '',
    icon TEXT DEFAULT '📚',
    chapters JSONB DEFAULT '[]'::jsonb,
    questions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng Đề Thi Đóng Góp Chờ Duyệt (Drafts)
CREATE TABLE IF NOT EXISTS public.draft_subjects (
    id TEXT PRIMARY KEY DEFAULT ('DRAFT-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')),
    name TEXT NOT NULL,
    department TEXT DEFAULT 'Khoa Kỹ thuật - Công nghệ',
    author TEXT NOT NULL,
    student_id TEXT DEFAULT '',
    email TEXT DEFAULT '',
    note TEXT DEFAULT '',
    chapters JSONB DEFAULT '[]'::jsonb,
    questions JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. BẢNG LỊCH SỬ LÀM BÀI THI & BẢNG XẾP HẠNG (QUIZ_HISTORY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_history (
    id TEXT PRIMARY KEY DEFAULT ('HIST-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)),
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    student_id TEXT DEFAULT '',
    user_name TEXT DEFAULT '',
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam')),
    chapter_id TEXT DEFAULT 'all',
    score_10 NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    percentage INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    grade_title TEXT DEFAULT '',
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user ON public.quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_subject ON public.quiz_history(subject_id);
CREATE INDEX IF NOT EXISTS idx_history_score ON public.quiz_history(score_10 DESC, duration_seconds ASC);

-- ==============================================================================
-- 5. BẢNG KHO TÀI LIỆU ÔN TẬP (.TXT & GIÁO TRÌNH)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_materials (
    id TEXT PRIMARY KEY DEFAULT ('MAT-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')),
    subject_id TEXT NOT NULL,
    subject_name TEXT DEFAULT '',
    chapter_id TEXT DEFAULT '',
    title TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'txt' CHECK (file_type IN ('txt', 'pdf', 'docx', 'image', 'link')),
    content_text TEXT DEFAULT '',
    file_url TEXT DEFAULT '',
    author_name TEXT DEFAULT '',
    uploader_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. BẢNG PHIẾU HỖ TRỢ CSKH & BÁO LỖI (SUPPORT_TICKETS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY DEFAULT ('TICKET-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')),
    ticket_id TEXT NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    student_id TEXT DEFAULT '',
    contact TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    issue_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
    resolved_by TEXT DEFAULT '',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. BẢNG NGÂN HÀNG CÂU SAI CÁ NHÂN (USER_MISTAKES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_mistakes (
    id TEXT PRIMARY KEY DEFAULT ('MSTK-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL DEFAULT 1,
    last_wrong_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. BẬT ROW LEVEL SECURITY (RLS) & CHO PHÉP WEB TĨNH GIAO TIẾP
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;

-- Cấp quyền truy cập mở (Public Anonymous Access với Anon Key) cho Web tĩnh DThu QuizMaster
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Insert Users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Public All Subjects" ON public.subjects FOR ALL USING (true);
CREATE POLICY "Public All Drafts" ON public.draft_subjects FOR ALL USING (true);
CREATE POLICY "Public All History" ON public.quiz_history FOR ALL USING (true);
CREATE POLICY "Public All Materials" ON public.study_materials FOR ALL USING (true);
CREATE POLICY "Public All Tickets" ON public.support_tickets FOR ALL USING (true);
CREATE POLICY "Public All Mistakes" ON public.user_mistakes FOR ALL USING (true);
