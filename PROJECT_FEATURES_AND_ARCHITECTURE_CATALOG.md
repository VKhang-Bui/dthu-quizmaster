# 📖 SHINORA QUIZMASTER — TOÀN BỘ TÍNH NĂNG, CHỨC NĂNG & KIẾN TRÚC HỆ THỐNG
> **Phiên bản:** `v3.1.4` (100% Pure Cloudflare Architecture with Native D1 SQL Database)  
> **Trang Web Trực Tuyến:** [https://shinora-quizmaster.btai37999.workers.dev](https://shinora-quizmaster.btai37999.workers.dev)  
> **Tác giả & Nhà phát triển chính:** **Bùi Văn Khang (Shina Sanora)** — MSSV: `0024418475`  
> **Tài liệu phục vụ:** Rà soát toàn diện, bảo trì hệ thống và định hướng đại tu, nâng cấp tính năng.

---

## 📑 MỤC LỤC TỔNG QUAN

1. [Kiến Trúc Đám Mây & Hạ Tầng (Cloudflare Core)](#1-kiến-trúc-đám-mây--hạ-tầng-cloudflare-core)
2. [Bộ Lõi Khảo Thí & Chế Độ Thi Thử (Quiz Engines)](#2-bộ-lõi-khảo-thí--chế-độ-thi-thử-quiz-engines)
3. [Ngân Hàng 5 Môn Học Chính Thức (Official Quiz Banks)](#3-ngân-hàng-5-môn-học-chính-thức-official-quiz-banks)
4. [Bộ Lõi Bóc Tách Đề Thi Siêu Cấp (Parser Engine v3.1.4)](#4-bộ-lõi-bóc-tách-đề-thi-siêu-cấp-parser-engine-v314)
5. [Ngân Hàng Câu Làm Sai & Ôn Luyện Phục Thù (Mistake Vault)](#5-ngân-hàng-câu-làm-sai--ôn-luyện-phục-thù-mistake-vault)
6. [Hệ Thống Phân Quyền & Quản Trị Người Dùng (Admin & Auth)](#6-hệ-thống-phân-quyền--quản-trị-người-dùng-admin--auth)
7. [Gamification: Tích Điểm EXP/CP, Streak & Bảng Xếp Hạng](#7-gamification-tích-điểm-expcp-streak--bảng-xếp-hạng)
8. [Trạm Học Tập Đa Năng (Study Dock, Pomodoro & Audio Player)](#8-trạm-học-tập-đa-năng-study-dock-pomodoro--audio-player)
9. [Kho Tài Liệu Lý Thuyết & Thuật Ngữ (Materials Engine)](#9-kho-tài-liệu-lý-thuyết--thuật-ngữ-materials-engine)
10. [Bảo Mật, Sao Lưu & Tiện Ích Mở Rộng](#10-bảo-mật-sao-lưu--tiện-ích-mở-rộng)

---

## 1. KIẾN TRÚC ĐÁM MÂY & HẠ TẦNG (CLOUDFLARE CORE)

* **100% Thuần Cloudflare (Pure CF Architecture):** Không phụ thuộc bất kỳ bên thứ 3 nào. Toàn bộ máy chủ, CDN, API và Database đều nằm trong 1 tài khoản Cloudflare duy nhất.
* **Cloudflare Workers API Router (`src/index.js`):** Xử lý toàn bộ logic API backend siêu tốc (thời gian khởi chạy worker: **4ms**).
* **Cloudflare D1 SQL Database (`shinora-quiz-db`):** Cơ sở dữ liệu quan hệ SQL đám mây chính thức, lưu trữ an toàn:
  - Bảng `users`: Danh sách sinh viên, mã PIN, phân quyền, điểm EXP/CP.
  - Bảng `quiz_submissions`: Lịch sử nộp bài thi và bảng điểm chi tiết.
  - Bảng `draft_submissions`: Đề thi đóng góp từ cộng đồng.
  - Bảng `support_tickets`: Phiếu hỗ trợ và báo lỗi CSKH.
* **Local-First & Offline-Ready:** Giao diện SPA thuần Vanilla JS, hỗ trợ nạp dự phòng Offline 100% khi mất mạng.
* **Kiểm soát bộ đệm & điều hướng tối ưu:**
  - `_headers`: Chống dính cache phiên bản cũ.
  - `_redirects` & `wrangler.jsonc`: Định tuyến Single Page Application không bao giờ bị lỗi 404.

---

## 2. BỘ LÕI KHẢO THÍ & CHẾ ĐỘ THI THỬ (QUIZ ENGINES)

Trang bị **3 Chế độ Khảo thí chuyên sâu** đáp ứng mọi nhu cầu học tập:

### 🎓 A. Chế độ Luyện Tập (Practice Mode):
* Làm từng câu hỏi, kiểm tra kết quả ngay lập tức khi chọn đáp án.
* Hiển thị giải thích chi tiết, cơ sở lý thuyết và mẹo nhớ cho từng phương án đúng/sai.
* Không giới hạn thời gian, tự do quay lại câu trước hoặc nhảy đến câu bất kỳ.

### ⏱️ B. Chế độ Thi Thử Chuẩn (Exam Simulation Mode):
* Đếm ngược thời gian làm bài thi chuẩn (tùy chỉnh 15 - 60 phút).
* Ẩn hoàn toàn đáp án và giải thích trong lúc thi để mô phỏng áp lực phòng thi thực tế.
* Tự động thu bài khi hết giờ hoặc bấm nộp bài.
* Chấm điểm thang điểm 10 chuẩn đại học, xếp loại học lực (Xuất sắc, Giỏi, Khá, Trung bình, Yếu) và phân tích biểu đồ tỷ lệ đúng/sai.

### ⚡ C. Chế độ Thách Đấu Sinh Tồn (Survival Mode):
* Thách đấu độ chính xác: Trả lời liên tục cho đến khi sai.
* Đếm chuỗi câu đúng liên tiếp (Streak record) để ghi danh vào bảng vàng thành tích.

### ⚙️ Các Tiện Ích Phòng Thi:
* **Tùy chỉnh phạm vi thi:** Chọn thi theo từng Chương cụ thể hoặc Trộn toàn bộ môn học.
* **Tùy chỉnh số lượng câu:** Chọn 10, 20, 30, 50 hoặc toàn bộ câu hỏi của môn.
* **Xáo trộn thông minh (Shuffle):** Tự động đảo thứ tự câu hỏi và đảo thứ tự 4 đáp án A/B/C/D.
* **Gắn cờ phân vân (Flagging):** Đánh dấu các câu chưa chắc chắn để quay lại rà soát trước khi nộp bài.
* **Hỗ trợ Phím Tắt Toàn Diện:**
  - Phím `1`, `2`, `3`, `4` hoặc `A`, `B`, `C`, `D`: Chọn đáp án nhanh.
  - Phím `Mũi tên Trái` / `Phải`: Chuyển câu hỏi trước/sau.
  - Phím `F`: Bật/Tắt cờ phân vân.

---

## 3. NGÂN HÀNG 5 MÔN HỌC CHÍNH THỨC (OFFICIAL QUIZ BANKS)

Dữ liệu chuẩn hóa 100% bằng tệp JSON lưu tại `data/official/` và nhúng sẵn trong bộ nhớ:

| STT | Mã Môn | Tên Môn Học | Quy Mô Đề Thi | Đặc Điểm Nội Dung |
| :---: | :---: | :--- | :---: | :--- |
| 1 | `POL102` | **Chủ nghĩa Xã hội Khoa học** | 7 Chương chuẩn | Bộ câu hỏi lý luận chính trị nền tảng |
| 2 | `POL101` | **Triết học Mác - Lênin** | 3 Chương chuẩn | Chủ nghĩa duy vật biện chứng & lịch sử |
| 3 | `BIO201` | **Vi sinh vật học đại cương** | 3 Chương chuẩn | Cấu tạo tế bào, dinh dưỡng và sinh trưởng |
| 4 | `BT4026` | **Tin Sinh Học** | **106 câu hỏi** | Chuẩn PRO TEST 1 & 2 (Ngành CNSH) |
| 5 | `GE405` | **Tư Tưởng Hồ Chí Minh** | **223 câu hỏi** | Đầy đủ 6 chương chuẩn khảo thí |

---

## 4. BỘ LÕI BÓC TÁCH ĐỀ THI SIÊU CẤP (PARSER ENGINE v3.1.4)

Công cụ bóc tách đề thi từ văn bản thô (Word/PDF/Text) thành dữ liệu đề thi JSON chuẩn tự động:

* **Động cơ FSM Pipeline $O(N)$ Modular:** Phân tích cú pháp cực nhanh, xử lý đề thi 500 câu trong dưới 1 giây.
* **Bẻ khóa phương án dính dòng (Inline Option Decoupler):** Tự động nhận diện và bẻ gãy các phương án `A. ... B. ... C. ... D. ...` bị dính trên cùng 1 hàng do copy từ file Word/PDF.
* **Nhận diện đáp án đúng đa năng:**
  - Nhận diện dấu sao `*A.`, `A*.`, `[A]`, `(A)*`.
  - Nhận diện block đáp án ở cuối đề: `ĐÁP ÁN: 1A, 2B, 3C...` hoặc `KEY: 1.A 2.B`.
  - Nhận diện phương án có gạch chân hoặc in đậm.
* **Thanh Kéo Phân Tách Khung Nhập (Split-Pane Resizer):**
  - Kéo chuột hoặc chạm touch trên điện thoại để điều chỉnh độ rộng giữa Khung Soạn Thảo và Khung Xem Trước.
  - Nháy đúp chuột vào thanh kéo để tự động chia đôi tỷ lệ 50/50.
  - Tự động lưu tỷ lệ kéo vào `localStorage("shinora_parser_split_ratio")`.
* **Bộ Lọc & Tìm Kiếm Đề Thi Thời Gian Thực:**
  - Tìm kiếm câu hỏi theo từ khóa nội dung.
  - Lọc nhanh: Tất cả câu hỏi, Câu hợp lệ, Câu bị cảnh báo thiếu đáp án đúng, Câu thiếu phương án.
* **Bộ Công Cụ Sửa Lỗi 1 Chạm (Bulk Actions):**
  - **Đánh số lại thứ tự (Renumbering):** Tự động chuẩn hóa câu hỏi từ `Câu 1` đến `Câu N`.
  - **Chuẩn hóa chữ hoa/thường & khoảng trắng thừa.**
  - **Gán đáp án A mặc định** cho toàn bộ câu chưa có đáp án đúng.
* **Đồng Bộ Con Trỏ 2 Chiều (Cursor Sync):** Bấm vào câu hỏi bên khung Xem trước $\rightarrow$ Con trỏ bên khung Soạn thảo tự động cuộn đến và bôi đen câu hỏi tương ứng.

---

## 5. NGÂN HÀNG CÂU LÀM SAI & ÔN LUYỆN PHỤC THÙ (MISTAKE VAULT)

* **Tự động gom nhặt sai sót:** Mọi câu hỏi làm sai trong các lần luyện tập và thi thử đều được tự động lưu vào Kho Câu Sai (`Mistakes Vault`).
* **Thống kê tần suất sai:** Đếm số lần học viên làm sai từng câu để cảnh báo lỗ hổng kiến thức.
* **Chế độ Luyện Tập Phục Thù:** Tạo đề thi gồm riêng các câu làm sai để sinh viên làm lại cho đến khi nhuần nhuyễn.
* **Cơ chế Tự Động Xóa:** Khi sinh viên làm lại câu hỏi và trả lời đúng liên tiếp, câu hỏi sẽ tự động được xóa khỏi kho câu sai.

---

## 6. HỆ THỐNG PHÂN QUYỀN & QUẢN TRỊ NGƯỜI DÙNG (ADMIN & AUTH)

### 👥 4 Cấp Phân Quyền Trong Hệ Thống:
1. 👑 **Admin (Quản trị viên tối cao):** Toàn quyền duyệt sinh viên đăng ký, điều chỉnh điểm thưởng EXP/CP, xóa tài khoản, phân quyền, duyệt đề thi đóng góp.
2. ✍️ **Editor (Biên tập viên học thuật):** Quản lý đề thi, biên tập tài liệu và duyệt đề thi thử nghiệm.
3. 👨‍🎓 **Student (Sinh viên chính thức):** Luyện thi, lưu lịch sử, tích lũy điểm EXP/CP, leo bảng xếp hạng.
4. 👤 **Guest (Khách vãng lai):** Trải nghiệm thi thử cơ bản không cần tài khoản.

### 🛡️ Luồng Phê Duyệt Tài Khoản & Bảo Mật:
* **Đăng ký trực tuyến:** Sinh viên điền MSSV, Lớp, Họ tên, Mã PIN $\rightarrow$ Gửi lên Cloudflare D1 với trạng thái `pending_approval`.
* **Duyệt tức thì (Live Admin Polling):** Bảng Quản trị tự động quét và hiện chuông báo khi có sinh viên mới đăng ký $\rightarrow$ Admin bấm **Duyệt** hoặc **Từ chối**.
* **Đăng nhập bằng Mã PIN:** Sinh viên đăng nhập nhanh bằng `MSSV + Mã PIN (6 số)`.
* **Khôi phục Mã PIN qua Email OTP:** Tích hợp gửi mã xác thực OTP 6 số (hạn 300 giây) qua Google Apps Script / Email.
* **Phiếu Hỗ Trợ CSKH Trực Tuyến:** Gửi yêu cầu trợ giúp hoặc báo lỗi câu hỏi trực tiếp vào Database Cloudflare D1.

---

## 7. GAMIFICATION: TÍCH ĐIỂM EXP/CP, STREAK & BẢNG XẾP HẠNG

* **Điểm EXP (Kinh Nghiệm Học Tập):**
  - Thi đạt $\ge 9.0$ điểm: $+15 \text{ EXP}$.
  - Thi đạt $\ge 8.0$ điểm: $+10 \text{ EXP}$.
  - Hoàn thành bài thi thử: $+1 \text{ EXP}$.
* **Điểm CP (Cống Hiến Học Thuật):**
  - Thẩm định và bóc tách đề thi mới: $+5 \text{ CP}$ đến $+20 \text{ CP}$.
  - Đóng góp tài liệu học tập: $+10 \text{ CP}$.
* **Chuỗi Ngày Học Liên Tục (Streak Days):** Duy trì thói quen ôn bài mỗi ngày, có hiệu ứng ngọn lửa sống động 🔥.
* **Bảng Xếp Hạng Trực Tuyến Toàn Trường (Leaderboard):**
  - Tự động lấy Top 50 sinh viên xuất sắc nhất từ Cloudflare D1 Database.
  - Xếp hạng theo Điểm EXP Mùa Giải (Season EXP) và Điểm Cống Hiến (Contribution Points).
  - Tích hợp huy hiệu Top 1 🥇, Top 2 🥈, Top 3 🥉.

---

## 8. TRẠM HỌC TẬP ĐA NĂNG (STUDY DOCK, POMODORO & AUDIO PLAYER)

Thanh công cụ nổi cố định ở góc dưới màn hình giúp tăng tối đa sự tập trung:

* 🎵 **Trình phát Nhạc Học Tập Tập Trung (YouTube Audio Focus):**
  - Tích hợp danh sách phát nhạc Lofi Chill, Piano không lời, White Noise học bài.
  - Tự động phát ngầm, điều chỉnh âm lượng, nút phát/tạm dừng trực tiếp trên Dock.
* ⏱️ **Đồng hồ Pomodoro Thông Minh:**
  - Chu kỳ chuẩn 25 phút học tập sâu - 5 phút nghỉ ngơi thư giãn.
  - Âm thanh chuông báo Audio FX sống động khi kết thúc phiên học.
* 🏝️ **Dynamic Island Thông Báo Nổi (iOS Style):**
  - Hiển thị thông báo dạng viên thuốc động ở mép trên màn hình.
  - Báo hiệu tức thì khi nhận điểm EXP, duyệt tài khoản, hoặc hoàn thành mục tiêu.
* 🌗 **Giao diện Tối / Sáng (Dark / Light Mode):**
  - Chuyển đổi giao diện nền tối bảo vệ mắt ban đêm hoặc nền sáng thanh lịch.
  - Tự động đồng bộ theo cài đặt hệ điều hành.

---

## 9. KHO TÀI LIỆU LÝ THUYẾT & THUẬT NGỮ (MATERIALS ENGINE)

* Tóm tắt lý thuyết trọng tâm các môn học chính trị, khoa học đại cương.
* Tra cứu thuật ngữ chuyên ngành nhanh.
* Tích hợp công cụ ghi chú cá nhân và đánh dấu tài liệu quan trọng.
* ⚠️ *Lưu ý an toàn: Module `assets/js/views/materials-view.js` được bảo vệ bất biến.*

---

## 10. BẢO MẬT, SAO LƯU & TIỆN ÍCH MỞ RỘNG

* 💾 **Sao Lưu & Phục Hồi Dữ Liệu 1 Chạm (Backup & Restore):**
  - Xuất toàn bộ tài khoản, điểm số, lịch sử thi, kho câu sai ra file `.json`.
  - Nhập file `.json` để khôi phục dữ liệu tức thì trên thiết bị mới.
* 🛡️ **Nhật Ký Kiểm Toán Hệ Thống (Audit Logs):**
  - Lưu lại mọi thao tác quan trọng (đăng ký, duyệt tài khoản, sửa điểm, đổi PIN) để Quản trị viên dễ dàng theo dõi.
* 📱 **Giao Diện Responsive Đa Nền Tảng:**
  - Tương thích 100% trên Điện thoại (iOS/Android), Máy tính bảng (iPad) và Máy tính để bàn (Windows/macOS/Linux).

---

