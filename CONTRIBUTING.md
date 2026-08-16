# 📖 Cẩm Nang Hướng Dẫn Đóng Góp Đề Thi — DThu QuizMaster

Chào mừng bạn đến với dự án **DThu QuizMaster**! Dự án được xây dựng nhằm tạo ra một thư viện ngân hàng đề thi trắc nghiệm mở, giúp sinh viên Trường Đại học Đồng Tháp (DThu) cùng nhau ôn tập và chuẩn bị tốt cho các kỳ thi học phần.

---

## 🚀 Cách 1: Đóng góp qua Web App & GitHub Issue (Dễ nhất cho sinh viên)

1. Mở trang web **DThu QuizMaster** trực tuyến.
2. Vào mục **`📝 Nhập đề (Parser)`**, dán đề thi dạng văn bản vào để hệ thống tự động bóc tách thành chuẩn JSON.
3. Bấm **`📥 Tải file JSON (.json)`** về máy của bạn.
4. Truy cập vào mục **[Issues trên GitHub](https://github.com/VKhang-Bui/dthu-quizmaster/issues/new/choose)**.
5. Chọn **"📤 Đóng góp Bộ Đề Thi Mới"**, điền tên môn học và đính kèm file `.json` vừa tải.
6. Admin (**Bùi Văn Khang**) sẽ kiểm tra và tích hợp môn học của bạn vào hệ thống chính thức!

---

## 💻 Cách 2: Đóng góp bằng Pull Request (Dành cho lập trình viên)

1. **Fork** repository này về tài khoản GitHub của bạn.
2. Tạo một file dữ liệu mới trong thư mục `data/<ma-mon-hoc>.json`.
3. Thêm môn học vào `assets/js/data/default-banks.js`.
4. Commit và tạo **Pull Request (PR)** gửi về nhánh `main`.

---

**Biên soạn & Quản trị dự án:** Bùi Văn Khang (Sinh viên CNSH - Trường Đại học Đồng Tháp)  
**Email liên hệ:** `vkhang.bui.dthu@gmail.com`
