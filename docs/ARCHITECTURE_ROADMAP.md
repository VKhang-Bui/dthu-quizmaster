# 🗺️ KẾ HOẠCH & TÀI LIỆU KIẾN TRÚC DỰ ÁN DTHU QUIZMASTER (V2.0 CLOUD-NATIVE)

> **Dự án:** DThu QuizMaster – Nền tảng Ôn tập, Thi trắc nghiệm & Thư viện Tài liệu Sinh viên  
> **Tác giả:** Bùi Văn Khang (CNSH – Đại học Đồng Tháp)  
> **Mục tiêu:** Nâng cấp từ ứng dụng LocalStorage tĩnh thành Hệ thống Học tập Trực tuyến Đa người dùng 100% Miễn phí, 24/7 Uptime, hỗ trợ Đăng nhập, Lịch sử làm bài, Đóng góp & Duyệt đề thi, Bảng xếp hạng và Kho tài liệu học tập (.txt, hình ảnh).

---

## 🏛️ 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (HYBRID SERVERLESS ARCHITECTURE)

```text
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                 NGƯỜI DÙNG / SINH VIÊN                                │
│                   (Truy cập qua Điện thoại / Laptop / Máy tính bảng)                  │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │ HTTPS (Mọi lúc, 24/7)
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND HOSTING: Cloudflare Pages / Vercel (Miễn phí vĩnh viễn, 0 VNĐ)           │
│    - Giao diện Single Page Application (SPA): HTML5 + Modular CSS + Vanilla JS ES6+   │
│    - Global CDN: Tốc độ tải cực nhanh tại Việt Nam, chứng chỉ bảo mật SSL/HTTPS sẵn    │
│    - Tự động Deploy khi git push lên nhánh main                                       │
└──────────────────┬───────────────────────────────────────┬────────────────────────────┘
                   │                                       │
                   │ API Calls & Auth                      │ Tải / Xem tài liệu, ảnh
                   ▼                                       ▼
┌──────────────────────────────────────┐ ┌──────────────────────────────────────────────┐
│ 2. BACKEND & DATABASE: Supabase      │ │ 3. STORAGE: Cloudflare R2 / Supabase Storage │
│    (PostgreSQL Cloud - Free Tier)    │ │    (10 GB Miễn phí lưu trữ tài liệu & ảnh)   │
│ ──────────────────────────────────── │ │ ──────────────────────────────────────────── │
│ • Supabase Auth: Google & Email      │ │ • Lưu trữ giáo trình, tài liệu môn học (.txt)│
│ • Database: Questions, Users, Scores │ │ • Lưu trữ hình ảnh minh họa cho câu hỏi trắc │
│ • Row Level Security (RLS): Phân     │ │   nghiệm (sơ đồ sinh học, công thức...)      │
│   quyền Sinh viên vs Ban duyệt đề    │ │ • Băng thông tải miễn phí không giới hạn     │
│ • Realtime Leaderboard & Views       │ └──────────────────────────────────────────────┘
└──────────────────────────────────────┘
```

---

## 👥 2. LUỒNG NGHIỆP VỤ CÁC TÍNH NĂNG MỚI

### 1. Nhận diện người dùng & Đăng nhập (Authentication)
* **Phương thức:** Đăng nhập bằng Google (Email sinh viên `@dthu.edu.vn` hoặc Gmail cá nhân) hoặc Email/Password.
* **Phân quyền (Roles):**
  - `student`: Làm bài ôn tập, thi thử, xem lịch sử cá nhân, tham gia bảng xếp hạng, gửi đề đóng góp.
  - `moderator` / `admin`: Có thêm quyền vào trang **"🛡️ Duyệt đề đóng góp"** để phê duyệt/chỉnh sửa/từ chối câu hỏi từ sinh viên toàn trường.

### 2. Cơ chế Đóng góp Đề thi Thông minh & Đơn giản
* Sinh viên sử dụng công cụ **Smart Parser** hiện có trên web:
  1. Dán văn bản đề thi thô (từ Word, PDF, ChatGPT).
  2. Bấm nút **"📤 Gửi đóng góp bộ đề"**.
  3. Dữ liệu câu hỏi được lưu vào Database với trạng thái `status = 'pending'`.
  4. Thông báo gửi thành công và cộng điểm đóng góp (EXP) cho sinh viên sau khi đề được duyệt.

### 3. Bảng điều khiển Duyệt đề (Admin Moderation Dashboard)
* Giao diện dành riêng cho Ban biên tập / Admin (`role = 'admin'`):
  - Xem danh sách câu hỏi đang ở trạng thái `pending`.
  - Có các nút thao tác 1-click:
    - **[✅ Duyệt ngay]** ➔ Chuyển `status = 'approved'`, lập tức xuất hiện trong ngân hàng đề công khai cho toàn trường.
    - **[✏️ Chỉnh sửa]** ➔ Sửa lỗi chính tả, công thức, đáp án trước khi duyệt.
    - **[❌ Từ chối]** ➔ Kèm theo lý do để phản hồi người đóng góp.

### 4. Bảng xếp hạng (Leaderboard & Gamification)
* **Cơ chế tính điểm Rank:**
  - **Điểm EXP tích lũy:** Làm bài thi đạt điểm cao, số câu đúng tích lũy, đóng góp đề thi được duyệt.
  - **Bảng xếp hạng Thi thử:** Điểm thi cao nhất + thời gian hoàn thành ngắn nhất theo từng Môn học.
  - **Vinh danh:** Huy hiệu Top 1, Top 3, Top 10 toàn trường / theo Khoa.

### 5. Kho Tài liệu & Công cụ Xử lý Dữ liệu (.txt, Hình ảnh)
* **Tài liệu .txt:** Lưu trữ bài giảng tóm tắt, đề cương text thuần trong cơ sở dữ liệu hoặc Cloudflare R2.
* **Xử lý Text & Parser:** Sử dụng JavaScript Client-side (nhanh tức thì, không tốn tài nguyên server) kết hợp bộ lọc Regex mạnh mẽ hỗ trợ Markdown, công thức hóa học, ký tự toán học.
* **Hình ảnh câu hỏi:** Upload trực tiếp lên Cloudflare R2 / Supabase Storage và nhúng URL ảnh vào nội dung câu hỏi.

---

## 🗄️ 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

Xem chi tiết script khởi tạo SQL hoàn chỉnh tại: [`docs/DATABASE_SCHEMA.sql`](file:///home/vkhang-bui/1.HocViec/projects/dthu-quizmaster/docs/DATABASE_SCHEMA.sql)

### Tóm tắt các bảng chính:
1. `profiles`: Thông tin sinh viên, quyền hạn (`role`), điểm tích lũy (`total_exp`).
2. `subjects`: Danh mục môn học (`CNXHKH`, `TRIET_HOC`, `VI_SINH`...).
3. `chapters`: Danh sách chương theo từng môn học.
4. `questions`: Ngân hàng câu hỏi trắc nghiệm (có trường `status`: `pending | approved | rejected`).
5. `quiz_attempts`: Lịch sử làm bài và điểm số của từng sinh viên.
6. `study_materials`: Kho tài liệu môn học (.txt, link tài liệu, tóm tắt kiến thức).
7. `leaderboard_view`: SQL View tự động tổng hợp và sắp xếp thứ hạng sinh viên real-time.

---

## 🗓️ 4. LỘ TRÌNH TRIỂN KHAI CHI TIẾT (STEP-BY-STEP ROADMAP)

### Giai đoạn 1: Chuẩn bị Cơ sở Dữ liệu & Cấu hình Đám mây (Không tốn chi phí)
- [x] Thiết kế cấu trúc hệ thống và Database Schema SQL.
- [ ] Tạo tài khoản [Supabase](https://supabase.com) (Free Tier) và chạy script `DATABASE_SCHEMA.sql`.
- [ ] Bật Google OAuth Authentication trên Supabase Dashboard.

### Giai đoạn 2: Tích hợp Supabase Client vào Frontend
- [ ] Tạo module `supabase-client.js` và `auth-service.js`.
- [ ] Bổ sung cơ chế **Dual-Storage (Graceful Fallback)**: Ưu tiên lấy dữ liệu từ Supabase Cloud khi có mạng / đã đăng nhập; tự động fallback về `localStorage` và dữ liệu offline mặc định khi mất mạng.
- [ ] Thêm nút **Đăng nhập Google / Xem Profile** trên Header của web.

### Giai đoạn 3: Bổ sung các View mới
- [ ] **View Lịch sử làm bài:** Hiển thị biểu đồ tiến độ học tập và lịch sử điểm thi của cá nhân.
- [ ] **View Bảng xếp hạng (Leaderboard):** Bảng xếp hạng điểm thi môn học và top sinh viên chăm chỉ.
- [ ] **View Duyệt đề (Moderation Dashboard):** Giao diện quản lý duyệt đề dành cho Admin.
- [ ] **View Kho Tài liệu (Study Hub):** Đọc tài liệu tóm tắt môn học định dạng `.txt` / markdown trực tiếp trên web.

### Giai đoạn 4: Deploy & Vận hành 24/7
- [ ] Kết nối GitHub repository với [Cloudflare Pages](https://pages.cloudflare.com/) hoặc [Vercel](https://vercel.com).
- [ ] Thiết lập tên miền chính thức miễn phí (ví dụ: `dthu-quizmaster.pages.dev`).
- [ ] Chia sẻ cho sinh viên và các giảng viên Đại học Đồng Tháp cùng sử dụng!
