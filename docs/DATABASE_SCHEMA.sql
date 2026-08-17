-- ==============================================================================
-- DTHU QUIZMASTER - SUPABASE POSTGRESQL DATABASE SCHEMA & RLS POLICIES
-- Tác giả: Bùi Văn Khang (CNSH - Đại học Đồng Tháp)
-- Dự án: Hệ thống Ôn tập & Thi trắc nghiệm Đại học Đồng Tháp
-- ==============================================================================

-- 1. BẬT EXTENSIONS CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TẠO BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES)
-- Liên kết 1-1 với bảng auth.users của Supabase
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    student_id TEXT DEFAULT '',
    department TEXT DEFAULT 'Khoa Sư phạm Khoa học Tự nhiên', -- Khoa/Ngành
    avatar_url TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin')),
    total_exp INTEGER NOT NULL DEFAULT 0, -- Điểm kinh nghiệm tích lũy
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger tự động tạo profile khi người dùng đăng ký/đăng nhập lần đầu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'student'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. BẢNG MÔN HỌC & CHƯƠNG (SUBJECTS & CHAPTERS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY, -- Ví dụ: 'CNXHKH', 'TRIET_HOC', 'VI_SINH'
    code TEXT NOT NULL,  -- Mã môn: 'POL102', 'BIO201'
    name TEXT NOT NULL,
    department TEXT DEFAULT 'Khoa Lý luận Chính trị',
    author TEXT DEFAULT 'Ban Biên Tập DThu',
    description TEXT DEFAULT '',
    icon TEXT DEFAULT '📚',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapters (
    id TEXT NOT NULL,          -- Ví dụ: 'c1', 'c2'
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (subject_id, id)
);

-- ==============================================================================
-- 4. BẢNG NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM (QUESTIONS)
-- Hỗ trợ phân quyền duyệt đề: status IN ('pending', 'approved', 'rejected')
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,       -- Ví dụ: 'CNXHKH-001' hoặc sinh tự động
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    image_url TEXT DEFAULT '', -- Hình ảnh minh họa (lưu trên Cloudflare R2/Storage)
    options JSONB NOT NULL,    -- Mảng [ { "text": "...", "isCorrect": true, "note": "..." }, ... ]
    answer_index INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    contributor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    moderation_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_subject_chapter ON public.questions(subject_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);

-- ==============================================================================
-- 5. BẢNG LỊCH SỬ LÀM BÀI THI (QUIZ_ATTEMPTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam')),
    chapter_id TEXT DEFAULT 'all',
    score_10 NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    percentage INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    grade_title TEXT DEFAULT '',
    answers_data JSONB DEFAULT '{}'::jsonb, -- Lưu chi tiết đáp án thí sinh đã chọn
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_subject ON public.quiz_attempts(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON public.quiz_attempts(score_10 DESC, duration_seconds ASC);

-- ==============================================================================
-- 6. BẢNG KHO TÀI LIỆU HỌC TẬP (.TXT, GIÁO TRÌNH, TÓM TẮT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_id TEXT DEFAULT '',
    title TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'txt' CHECK (file_type IN ('txt', 'pdf', 'docx', 'image', 'link')),
    content_text TEXT DEFAULT '', -- Chứa nội dung text thuần nếu là file .txt
    file_url TEXT DEFAULT '',     -- Link tải file (Cloudflare R2 / Storage)
    author_name TEXT DEFAULT '',
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. SQL VIEW BẢNG XẾP HẠNG (LEADERBOARD VIEWS)
-- ==============================================================================
-- Bảng xếp hạng điểm thi theo Môn học (Top điểm cao nhất, thời gian nhanh nhất)
CREATE OR REPLACE VIEW public.v_subject_leaderboard AS
SELECT 
    qa.subject_id,
    s.name AS subject_name,
    qa.user_id,
    p.full_name,
    p.avatar_url,
    p.department,
    MAX(qa.score_10) AS max_score,
    MIN(qa.duration_seconds) AS best_time_seconds,
    COUNT(qa.id) AS total_exams_taken,
    MAX(qa.completed_at) AS last_attempt_at
FROM public.quiz_attempts qa
JOIN public.profiles p ON qa.user_id = p.id
JOIN public.subjects s ON qa.subject_id = s.id
WHERE qa.mode = 'exam'
GROUP BY qa.subject_id, s.name, qa.user_id, p.full_name, p.avatar_url, p.department
ORDER BY max_score DESC, best_time_seconds ASC;

-- Bảng xếp hạng Chăm chỉ toàn trường (Dựa trên điểm EXP và số bài ôn tập)
CREATE OR REPLACE VIEW public.v_overall_leaderboard AS
SELECT 
    p.id AS user_id,
    p.full_name,
    p.avatar_url,
    p.department,
    p.role,
    p.total_exp,
    COUNT(qa.id) AS total_quizzes,
    COALESCE(SUM(qa.correct_count), 0) AS total_correct_answers
FROM public.profiles p
LEFT JOIN public.quiz_attempts qa ON p.id = qa.user_id
GROUP BY p.id, p.full_name, p.avatar_url, p.department, p.role, p.total_exp
ORDER BY p.total_exp DESC, total_correct_answers DESC;

-- ==============================================================================
-- 8. THIẾT LẬP BẢO MẬT ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- 8.1. POLICIES CHO PROFILES
CREATE POLICY "Mọi người đều xem được hồ sơ công khai" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Người dùng chỉ được cập nhật hồ sơ của chính mình" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 8.2. POLICIES CHO SUBJECTS & CHAPTERS
CREATE POLICY "Mọi người đều xem được danh sách môn học & chương" 
    ON public.subjects FOR SELECT USING (is_active = true);

CREATE POLICY "Mọi người đều xem được chương" 
    ON public.chapters FOR SELECT USING (true);

CREATE POLICY "Chỉ Admin/Moderator được thêm/sửa/xóa môn học" 
    ON public.subjects FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
    );

-- 8.3. POLICIES CHO QUESTIONS (QUAN TRỌNG: PHÂN QUYỀN DUYỆT ĐỀ)
-- Sinh viên bình thường chỉ xem được câu hỏi đã được duyệt ('approved')
CREATE POLICY "Xem câu hỏi đã duyệt" 
    ON public.questions FOR SELECT USING (
        status = 'approved' OR 
        (auth.uid() IS NOT NULL AND contributor_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
    );

-- Sinh viên đã đăng nhập được quyền gửi câu hỏi mới (mặc định status = 'pending')
CREATE POLICY "Gửi đóng góp câu hỏi mới" 
    ON public.questions FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Chỉ Admin/Moderator được duyệt (UPDATE) hoặc XÓA (DELETE) câu hỏi
CREATE POLICY "Admin duyệt và sửa câu hỏi" 
    ON public.questions FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
    );

CREATE POLICY "Admin xóa câu hỏi" 
    ON public.questions FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
    );

-- 8.4. POLICIES CHO QUIZ_ATTEMPTS (LỊCH SỬ LÀM BÀI)
CREATE POLICY "Người dùng xem lịch sử bài thi của chính mình" 
    ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Người dùng lưu kết quả bài thi của mình" 
    ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8.5. POLICIES CHO STUDY_MATERIALS (TÀI LIỆU .TXT)
CREATE POLICY "Mọi người đều xem và tải tài liệu học tập" 
    ON public.study_materials FOR SELECT USING (true);

CREATE POLICY "Sinh viên đăng nhập có thể tải lên tài liệu" 
    ON public.study_materials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
