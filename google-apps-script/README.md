# 🚀 Hướng Dẫn Triển Khai Google Apps Script (Gửi Email Thật Miễn Phí 100%)

Tài liệu hướng dẫn triển khai hệ thống gửi email tự động cho **Shinora QuizMaster** thông qua Google Apps Script (tích hợp trực tiếp với Gmail cá nhân hoặc Google Workspace trường ĐH Đồng Tháp `@dthu.edu.vn`).

---

## 📌 Bước 1: Mở Google Apps Script và Dán Mã Nguồn

1. Truy cập vào trang: [https://script.google.com/](https://script.google.com/) (đăng nhập bằng Gmail của bạn hoặc Email trường DThu).
2. Bấm vào nút **`+ Dự án mới` (New Project)** ở góc trên bên trái.
3. Đổi tên dự án từ *"Dự án không có tiêu đề"* thành **`DThu-QuizMaster-Email-Service`**.
4. Xóa toàn bộ nội dung mặc định trong file `Mã.gs` (hoặc `Code.gs`).
5. Mở file [`google-apps-script/Code.gs`](Code.gs) trong dự án này, copy toàn bộ nội dung và **Dán vào** trình biên soạn của Google Apps Script.
6. Nhấn tổ hợp phím `Ctrl + S` (hoặc biểu tượng đĩa mềm 💾) để **Lưu lại**.

---

## 📌 Bước 2: Triển Khai Thành Web App (Deploy)

1. Ở góc trên bên phải của Google Apps Script, bấm vào nút màu xanh **`Triển khai` (Deploy)** $\rightarrow$ Chọn **`Triển khai mới` (New deployment)**.
2. Tại cửa sổ hiện ra:
   - Bấm vào biểu tượng bánh răng ⚙️ bên cạnh dòng *Chọn loại* $\rightarrow$ Chọn **`Ứng dụng web` (Web app)**.
   - **Mô tả (Description)**: `Shinora QuizMaster Email Gateway v2.0`.
   - **Thực thi dưới dạng (Execute as)**: Chọn **`Tôi` (Me - địa chỉ email của bạn)**.
   - **Ai có quyền truy cập (Who has access)**: Chọn **`Bất kỳ ai` (Anyone)** *(Quan trọng: phải chọn "Bất kỳ ai" để trình duyệt web có thể gửi OTP và báo cáo sự cố qua API mà không cần đăng nhập tài khoản Google)*.
3. Bấm nút **`Triển khai` (Deploy)**.
4. Google sẽ yêu cầu bạn cấp quyền lần đầu tiên:
   - Bấm **`Ủy quyền truy cập` (Authorize access)**.
   - Chọn tài khoản Google của bạn.
   - Nếu xuất hiện màn hình cảnh báo *"Google chưa xác minh ứng dụng này"*, bấm vào **`Nâng cao` (Advanced)** ở góc dưới $\rightarrow$ Bấm tiếp vào liên kết **`Đi tới DThu-QuizMaster-Email-Service (không an toàn)`**.
   - Bấm **`Cho phép` (Allow)**.

---

## 📌 Bước 3: Lấy URL và Dán Vào Shinora QuizMaster

1. Sau khi triển khai xong, Google sẽ cung cấp cho bạn một **URL Ứng dụng web** dạng:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
2. Sao chép (Copy) đường link URL này.
3. Mở ứng dụng **Shinora QuizMaster** $\rightarrow$ Vào **Quản Lý Người Dùng** $\rightarrow$ Bấm nút **⚙️ Cấu Hình Google Apps Script** $\rightarrow$ Dán đường link URL vào và bấm **Lưu Cấu Hình**.

---

## ✨ Kết Quả Đạt Được:
- **Gửi Email OTP**: Sinh viên yêu cầu đặt lại mã PIN sẽ nhận được email HTML chuẩn nhận diện ĐH Đồng Tháp trong vòng 1-2 giây với mã OTP có hiệu lực 300 giây.
- **Báo cáo sự cố CSKH**: Khi sinh viên bấm *"Thử cách khác"* và gửi văn bản phản ánh, email sẽ tự động gửi thẳng về hòm thư của Admin cấu hình trong `Code.gs`.
- **Hoàn toàn miễn phí**: Giới hạn lên đến 100 - 1500 emails/ngày mà không tốn bất kỳ chi phí duy trì nào!
