# 🎓 Shinora QuizMaster – Nền Tảng Ôn Tập & Thi Trắc Nghiệm Đại Học

> **Tác giả:** Bùi Văn Khang  
> **Chuyên ngành:** Công nghệ Sinh học – Cộng đồng Tự học & Ôn thi Shinora (DThu)  
> **Mục tiêu:** Hệ thống mã nguồn mở giúp sinh viên tự quản lý ngân hàng đề cương, ôn tập theo chương có giải thích tức thì, và thi thử tính giờ trực tuyến.

---

## 🌟 Tính Năng Nổi Bật

1. **Quản Lý Môn Học Đa Dạng (Subject Hub):**
   - Hỗ trợ không giới hạn số môn học (ví dụ: *Chủ nghĩa Xã hội Khoa học*, *Triết học Mác - Lênin*, *Vi sinh vật học*, *Hóa sinh*...).
   - Tìm kiếm nhanh theo tên môn hoặc mã môn học (`POL102`, `BIO201`...).
   - Lọc môn học theo Khoa / Ngành.

2. **Chế Độ Ôn Thi Linh Hoạt (Dual-Mode Quiz Engine):**
   - 🟢 **Chế độ Ôn tập:** Hiển thị đáp án và giải thích chi tiết cho từng lựa chọn A, B, C, D ngay sau khi chọn.
   - ⏱️ **Chế độ Thi thử:** Đồng hồ đếm ngược thời gian, ẩn đáp án, nộp bài mới chấm điểm và xếp loại.
   - **Tùy chọn số lượng:** Toàn bộ đề, 10 câu, 20 câu, 40 câu hoặc 50 câu ngẫu nhiên.
   - **Trộn đề thông minh (Fisher-Yates Shuffle):** Tránh học vẹt vị trí đáp án.

3. **Ngân Hàng Câu Sai (Mistake Vault):**
   - Tự động ghi nhận các câu hỏi bạn từng làm sai trong các lần thi để giúp bạn ôn lại đúng lỗ hổng kiến thức trước kỳ thi.

4. **Quản Lý & Đóng Góp Câu Hỏi Trực Quan:**
   - Soạn câu hỏi mới trực tiếp trên giao diện web (không cần biết lập trình).
   - 📥 **Nhập / Xuất file JSON (1-Click Portability):** Xuất bộ đề ra file `.json` để gửi cho bạn bè trong lớp chỉ việc nạp vào học chung.

5. **Lưu Trữ Cục Bộ (Zero-Server, 100% Free):**
   - Hoạt động mượt mà ngay cả khi mất mạng (Offline-first) nhờ công nghệ `localStorage`.

---

## 📁 Cấu Trúc Dự Án (Clean Open Data Architecture)

```text
├── index.html                   # Điểm vào chính của ứng dụng SPA
├── README.md                    # Tài liệu giới thiệu và triển khai
├── CONTRIBUTING.md              # Cẩm nang đóng góp ngân hàng đề thi
│
├── docs/                        # Tài liệu Kiến trúc & Thiết kế Database v2.0
│   ├── ARCHITECTURE_ROADMAP.md  # Kế hoạch chi tiết kiến trúc Cloud-Native & Lộ trình
│   └── DATABASE_SCHEMA.sql      # Script khởi tạo Database PostgreSQL/Supabase & RLS Policies
│
├── data/                        # 📂 TRUNG TÂM DỮ LIỆU MỞ (Mọi người đều xem & đóng góp được)
│   ├── official/                # 🟢 Ngân hàng đề thi chính thức đã thẩm định
│   │   ├── subjects-index.json  # Danh mục tất cả các môn học chính thức
│   │   ├── cnxhkh.json          # Đề chuẩn Chủ nghĩa Xã hội Khoa học
│   │   ├── triet-hoc.json       # Đề chuẩn Triết học Mác - Lênin
│   │   └── vi-sinh-vat.json     # Đề chuẩn Vi sinh vật học
│   ├── drafts/                  # 🟡 Đề thi cộng đồng đóng góp / chờ duyệt (Bản thử nghiệm)
│   │   ├── submissions/         # Các bộ đề Draft sinh viên đóng góp
│   │   └── raw-texts/           # Đề thô (.txt) copy từ Word/PDF chờ parse
│   ├── materials/               # 📚 Kho tài liệu lý thuyết tóm tắt (.txt)
│   │   ├── cnxhkh-tom-tat.txt   # Tóm tắt 7 chương CNXHKH
│   │   └── vi-sinh-thuat-ngu.txt# Bảng tra cứu thuật ngữ Vi sinh vật học
│   └── templates/               # 📋 File mẫu chuẩn để sinh viên tải về soạn đề
│       ├── template-mon-hoc.json# Mẫu JSON môn học đầy đủ
│       └── template-de-thi.txt  # Mẫu soạn đề dạng text cho Smart Parser
│
└── assets/                      # 💻 Mã nguồn & Giao diện ứng dụng
    ├── css/
    │   ├── variables.css        # Hệ thống Design Tokens (Màu sắc, Typography, Shadows)
    │   ├── base.css             # Reset CSS, Layout khung, Header & Navigation
    │   ├── components.css       # Các Component: Nút bấm, Thẻ, Modal Popup, Form, Badges
    │   └── views.css            # Giao diện: Home, Leaderboard, Materials, Moderation, Quiz, Result
    │
    └── js/
        ├── data/
        │   └── default-banks.js # Dữ liệu dự phòng offline (Fallback)
        ├── services/
        │   ├── api-config.js    # Cấu hình kết nối Cloud (Supabase / Storage)
        │   ├── data-loader.js   # Module nạp dữ liệu động từ thư mục data/ (HTTP & Fallback)
        │   ├── storage.js       # Quản lý lưu trữ LocalStorage (Môn học, Điểm, User Profile, EXP)
        │   ├── quiz-engine.js   # Thuật toán trộn đề, chấm thi và đồng hồ bấm giờ
        │   ├── parser.js        # Trình phân tích văn bản thô Word/PDF/ChatGPT thông minh
        │   └── import-export.js # Xử lý xuất và nhập file đề JSON
        └── app.js               # Controller & Router điều hướng Single Page App (SPA)
```

---

## 🚀 Hướng Dẫn Đưa Lên GitHub Pages (Online Miễn Phí 100%)

1. Tạo một repository mới trên [GitHub](https://github.com) (ví dụ: `shinora-quizmaster`), chọn chế độ **Public**.
2. Tải toàn bộ các thư mục và file của dự án này lên GitHub.
3. Vào mục **Settings** của repository ➔ Chọn **Pages** (ở cột bên trái).
4. Tại mục **Branch**, chọn nhánh `main` (hoặc `master`) ➔ Bấm **Save**.
5. Đợi 1 phút, bạn sẽ nhận được đường link web có dạng:
   ```
   https://<ten-tai-khoan-cua-ban>.github.io/shinora-quizmaster/
   ```

---

## 📝 Định Dạng Cấu Trúc Câu Hỏi JSON (Dành cho người đóng góp đề)

```json
{
  "id": "CNXHKH-001",
  "chapterId": "c1",
  "question": "Nội dung câu hỏi ở đây?",
  "options": [
    {
      "text": "Nội dung đáp án A",
      "isCorrect": true,
      "note": "Giải thích chi tiết tại sao A Đúng"
    },
    {
      "text": "Nội dung đáp án B",
      "isCorrect": false,
      "note": "Giải thích chi tiết tại sao B Sai"
    },
    {
      "text": "Nội dung đáp án C",
      "isCorrect": false,
      "note": "Giải thích chi tiết tại sao C Sai"
    },
    {
      "text": "Nội dung đáp án D",
      "isCorrect": false,
      "note": "Giải thích chi tiết tại sao D Sai"
    }
  ],
  "answerIndex": 0
}
```
