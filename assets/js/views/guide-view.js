/**
 * GUIDE & UTILITY VIEW MODULE
 * Hướng dẫn sử dụng, Cẩm nang cú pháp, Tạo môn học mới, Import file.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  renderGuideView(container) {
    container.innerHTML = `
      <div class="view-guide">
        <!-- Hero Header -->
        <div class="guide-hero">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span class="badge badge-blue" style="font-size: 13px;">Shinora QuizMaster</span>
            <span class="badge badge-green">Phiên bản 3.1.4 (Mới Nhất)</span>
          </div>
          <h2 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
            Hướng Dẫn Sử Dụng
          </h2>
          <p style="font-size: 14.5px; color: var(--text-secondary);">
            Hướng dẫn đầy đủ về cách tạo đề, thi thử, phân tích câu hỏi tự động và cách chia sẻ ngân hàng đề thi cho bạn bè.
          </p>
        </div>

        <!-- Section 1: Quy trình sử dụng -->
        <div class="guide-section">
          <h3>🚀 1. Các chế độ học tập & thi trắc nghiệm</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">1</div>
            <div>
              <strong>Chế độ Ôn tập (Luyện tập có giải thích tức thì):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Phù hợp khi bạn mới bắt đầu học lý thuyết. Bấm chọn vào bất kỳ đáp án nào, hệ thống sẽ <strong>hiển thị ngay màu xanh (Đúng) / đỏ (Sai)</strong> cùng lời giải thích chi tiết cho từng phương án A, B, C, D để bạn ghi nhớ kiến thức.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">2</div>
            <div>
              <strong>Chế độ Thi thử (Đếm ngược thời gian như thi thật):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Phù hợp khi bạn chuẩn bị thi kết thúc học phần. Hệ thống sẽ kích hoạt <strong>đồng hồ đếm ngược</strong> (1 phút/câu), ẩn toàn bộ đáp án. Chỉ khi bạn bấm <strong>"Nộp bài thi"</strong> hoặc hết giờ thì hệ thống mới chấm điểm hệ 10, xếp loại và cho phép xem lại toàn bộ bài làm.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">3</div>
            <div>
              <strong>Ngân hàng câu làm sai (Mistake Vault):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Mỗi khi bạn làm sai một câu trong lúc thi thử, hệ thống sẽ <strong>tự động lưu câu đó vào mục "🎯 Câu làm sai"</strong>. Trước ngày thi thật, bạn chỉ cần vào đây để luyện lại đúng các câu mình hay nhầm lẫn.
              </p>
            </div>
          </div>
        </div>

        <!-- Section 2: Hướng dẫn Soạn đề (Smart Parser) -->
        <div class="guide-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <h3 style="margin: 0;">📝 2. Định dạng văn bản cho "Nhập đề (Parser)"</h3>
            <button class="btn btn-sm btn-primary" onclick="App.navigateTo('syntax-guide', { from: 'guide' })">
              💡 Cú pháp ký tự ➔
            </button>
          </div>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
            Trình nhập đề thông minh hỗ trợ chuyển đổi trực tiếp văn bản từ Word, PDF hoặc ChatGPT thành ngân hàng câu hỏi trên web. Bạn có thể soạn theo 1 trong các định dạng sau:
          </p>

          <!-- Format 1 -->
          <div style="margin-bottom: 18px;">
            <strong style="color: var(--brand-text);">🔹 Mẫu 1: Dạng chuẩn (Có "Đáp án:" và "Giải thích:" ở cuối câu)</strong>
            <div class="guide-code-box">Câu 1: Hai phát kiến vĩ đại của C. Mác và Ph. Ăng-ghen là gì?
A. Chủ nghĩa duy vật biện chứng và Học thuyết giá trị thặng dư
B. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư
C. Phép biện chứng duy vật và Học thuyết đấu tranh giai cấp
D. Học thuyết nhà nước và Học thuyết cách mạng vô sản
Đáp án: B
Giải thích: Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư là hai phát kiến vĩ đại...</div>
          </div>

          <!-- Format 2 -->
          <div style="margin-bottom: 18px;">
            <strong style="color: var(--brand-text);">🔹 Mẫu 2: Dạng ChatGPT / Markdown (Có giải thích chi tiết cho từng phương án)</strong>
            <div class="guide-code-box">Câu 2: Theo nghĩa rộng, **CNXHKH** được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Bao gồm Triết học, KTCT và CNXHKH.
* B. Hệ tư tưởng của riêng giai cấp tư sản > Sai: Là của giai cấp công nhân.
* C. Một nhánh nhỏ độc lập > Sai: Là bộ phận cốt lõi.
* D. Chỉ bao gồm bộ phận KTCT > Sai: Chỉ là 1 bộ phận hợp thành.</div>
          </div>

          <!-- Format 3 -->
          <div style="margin-bottom: 18px;">
            <strong style="color: var(--brand-text);">🔹 Mẫu 3: Dạng đánh dấu hoa thị trước đáp án đúng (*A.)</strong>
            <div class="guide-code-box">Câu 3: Đâu là chức năng cơ bản của gia đình?
A. Chức năng kinh tế
*B. Chức năng tái sản xuất ra con người
C. Chức năng giáo dục
D. Chức năng tâm lý</div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="App.copySampleTemplate()">📋 Mẫu đề cơ bản</button>
            <button class="btn btn-sm" onclick="App.navigateTo('syntax-guide', { from: 'guide' })">📖 Tra cứu cú pháp ➔</button>
            <button class="btn btn-sm" onclick="App.navigateTo('parser')">Đến Nhập đề ➔</button>
          </div>
        </div>

        <!-- Section 3: Xuất nhập file & Triển khai Online -->
        <div class="guide-section">
          <h3>🌐 3. Chia sẻ đề thi & Đưa web lên mạng (GitHub Pages)</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">A</div>
            <div>
              <strong>Cách chia sẻ đề thi cho bạn bè trong lớp:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Vào <strong>"⚙️ Quản lý đề"</strong> ➔ Bấm <strong>"📥 Xuất JSON"</strong> tại môn học bạn muốn chia sẻ. Gửi file <code>.json</code> đó cho bạn bè. Người nhận chỉ cần vào trang chủ bấm <strong>"📥 Nhập file JSON"</strong> là có thể làm bài ngay lập tức!
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">B</div>
            <div>
              <strong>Cách đưa web online miễn phí bằng GitHub Pages:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                1. Tạo 1 repository trên <a href="https://github.com" target="_blank">github.com</a> (chế độ Public).<br>
                2. Tải toàn bộ các thư mục và file của dự án lên.<br>
                3. Vào mục <strong>Settings</strong> ➔ <strong>Pages</strong> ➔ Chọn nhánh <strong>main</strong> ➔ Bấm <strong>Save</strong>.<br>
                4. Nhận ngay link web dạng: <code>https://&lt;username&gt;.github.io/dthu-quizmaster/</code> để học trên điện thoại mọi lúc mọi nơi!
              </p>
            </div>
          </div>
        </div>

        <!-- Section 4: Hệ Thống Điểm Thưởng EXP & CP Sản Lượng -->
        <div class="guide-section">
          <h3>⚡ 4. Hệ Thống Điểm Thưởng: EXP Học Tập & CP Cống Hiến Sản Lượng</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
            Shinora QuizMaster áp dụng hệ thống phân định điểm số kép chặt chẽ, minh bạch và tách bạch rõ ràng giữa <strong>Điểm Mùa Này</strong> và <strong>Điểm Tổng Các Mùa (All-Time)</strong>:
          </p>

          <div class="guide-step-item">
            <div class="guide-step-num" style="background:#fef3c7; color:#b45309; border-color:#fde68a;">⚡</div>
            <div>
              <strong>Điểm EXP Học Tập (Luyện Thi Thử):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Áp dụng cho các bài thi thử từ <strong>5 câu trở lên</strong> để đảm bảo tính công bằng (bài dưới 5 câu nhận +1 EXP khuyến khích). Thang điểm thưởng:
              </p>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li>Đạt từ <strong>9.0 - 10.0 điểm</strong>: Thưởng <strong>+15 EXP</strong> (Xuất sắc)</li>
                <li>Đạt từ <strong>8.0 - 8.9 điểm</strong>: Thưởng <strong>+10 EXP</strong> (Giỏi)</li>
                <li>Đạt từ <strong>6.5 - 7.9 điểm</strong>: Thưởng <strong>+6 EXP</strong> (Khá)</li>
                <li>Đạt từ <strong>5.0 - 6.4 điểm</strong>: Thưởng <strong>+3 EXP</strong> (Đạt yêu cầu)</li>
              </ul>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num" style="background:#dcfce7; color:#15803d; border-color:#86efac;">🌟</div>
            <div>
              <strong>Điểm Cống Hiến (Contribution Points - CP) Theo Sản Lượng Thực Tế:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Điểm CP không tính theo số lần bấm gửi đề đơn thuần mà tính lũy kế theo <strong>khối lượng kiến thức thực tế</strong> được Ban Quản Trị phê duyệt, với cơ chế <em>bảo lưu số dư cộng dồn</em>:
              </p>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li><strong>Cứ mỗi 50 câu trắc nghiệm được duyệt</strong>: Thưởng <strong>+5 CP</strong> (Ví dụ: đề 99 câu được cộng +5 CP và giữ lại 49 câu dư để cộng dồn cho đề tiếp theo).</li>
                <li><strong>Cứ mỗi 5.000 ký tự tài liệu học tập được duyệt</strong>: Thưởng <strong>+5 CP</strong> (Cộng dồn ký tự tài liệu).</li>
                <li><strong>Kiểm duyệt & thẩm định 50 câu trắc nghiệm</strong>: Thưởng <strong>+3 CP</strong> dành cho Ban Biên Tập.</li>
              </ul>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num" style="background:#e0f2fe; color:#0369a1; border-color:#7dd3fc;">🗓️</div>
            <div>
              <strong>Điểm Mùa Này vs Điểm Tổng Các Mùa (All-Time):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                - <strong>Điểm Mùa Này (Season Points):</strong> Phản ánh thành tích thi đua trong học kỳ / mùa giải hiện tại. Khi khởi động mùa mới, điểm này có thể được đặt lại về 0 để mở chặng đua mới.<br>
                - <strong>Điểm Tổng Các Mùa (All-Time):</strong> Điểm tích lũy trọn đời không bao giờ bị mất, ghi nhận toàn bộ thâm niên và đóng góp của sinh viên từ ngày đầu tham gia.
              </p>
            </div>
          </div>
        </div>

        <!-- Section 5: Bảng Xếp Hạng & Vị Trí Của Tôi -->
        <div class="guide-section">
          <h3>🏆 5. Tra Cứu Bảng Xếp Hạng & "Vị Trí Của Tôi"</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">A</div>
            <div>
              <strong>Chuyển đổi Top EXP / CP & Phạm vi Mùa này / All-Time:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Tại trang Bảng Xếp Hạng, bạn có thể dễ dàng chuyển đổi qua lại giữa <strong>⚡ Top Học Tập (EXP)</strong> và <strong>🌟 Top Cống Hiến (CP)</strong>, cũng như xem theo <strong>🗓️ Bảng Mùa Này</strong> hoặc <strong>👑 Bảng Tổng Các Mùa (All-Time)</strong>.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">B</div>
            <div>
              <strong>Lọc theo Khoa / Viện & Tìm kiếm:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Sử dụng thanh công cụ lọc để xem vị trí xếp hạng nội bộ trong từng Khoa/Viện (Sư phạm KHTN, Kỹ thuật - Công nghệ, Ngoại ngữ, v.v.) hoặc gõ MSSV để tìm kiếm nhanh bạn cùng lớp.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">C</div>
            <div>
              <strong>Tính năng "📍 Vị trí của tôi":</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Bấm nút <strong>"📍 Vị trí của tôi"</strong> ở góc phải bộ lọc để màn hình tự động cuộn mượt mà và làm nổi bật hàng thông tin tài khoản của bạn trên bảng tổng sắp toàn trường.
              </p>
            </div>
          </div>
        </div>

        <!-- Section 5: Thư Viện Tài Liệu Số (DocMaster) & Phím Tắt -->
        <div class="guide-section">
          <h3>📚 5. Thư Viện Tài Liệu Số (DocMaster) & Menu Chuột Phải</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">1</div>
            <div>
              <strong>Cây Thư Mục Đa Cấp & Trình Đọc Thông Minh:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Hệ thống phân cấp theo từng Khoa/Môn học. Bạn có thể tìm kiếm tức thì theo từ khóa, chuyển đổi giao diện đọc bảo vệ mắt (<strong>☀️ Sáng / 📜 Sepia / 🌙 Tối</strong>), tăng giảm cỡ chữ linh hoạt, hoặc mở chế độ <strong>🎴 Flashcard</strong> để ôn tập thuật ngữ.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">2</div>
            <div>
              <strong>Menu Chuột Phải Chuẩn VS Code & Kéo Thả (Drag & Drop):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Nhấp chuột phải vào bất kỳ Thư mục, Tài liệu hoặc Khoảng trống để mở Menu ngữ cảnh:
              </p>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li><strong>Tạo File / Tạo Thư mục con</strong>: Khởi tạo tài liệu học tập mới đúng vị trí mong muốn.</li>
                <li><strong>Cắt (Ctrl+X) & Sao chép (Ctrl+C)</strong>: Di chuyển hoặc nhân bản bài viết sang thư mục khác bằng lệnh <strong>Dán (Ctrl+V)</strong>.</li>
                <li><strong>Kéo thả tự mở sau 1s</strong>: Kéo tệp rê qua thư mục đang đóng trong 1 giây để tự động bung mở thư mục.</li>
                <li><strong>Khoảng trống là Cấp Gốc</strong>: Nhấp chuột hoặc thả tệp vào khoảng trống phía dưới để tự động đưa ra cấp ngoài cùng (Root).</li>
              </ul>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">3</div>
            <div>
              <strong>Bảng Phím Tắt Thao Tác Nhanh (Chỉ kích hoạt khi chọn trong Cây Mục Lục):</strong>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; margin-top: 8px;">
                <div style="background: var(--bg-primary); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; display: flex; justify-content: space-between;">
                  <span>✏️ Đổi tên</span> <kbd style="font-weight:700; font-family:var(--font-mono);">F2</kbd>
                </div>
                <div style="background: var(--bg-primary); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; display: flex; justify-content: space-between;">
                  <span>🗑️ Xóa tệp/thư mục</span> <kbd style="font-weight:700; font-family:var(--font-mono);">Delete</kbd>
                </div>
                <div style="background: var(--bg-primary); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; display: flex; justify-content: space-between;">
                  <span>✂️ Cắt tệp</span> <kbd style="font-weight:700; font-family:var(--font-mono);">Ctrl + X</kbd>
                </div>
                <div style="background: var(--bg-primary); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; display: flex; justify-content: space-between;">
                  <span>📋 Sao chép</span> <kbd style="font-weight:700; font-family:var(--font-mono);">Ctrl + C</kbd>
                </div>
                <div style="background: var(--bg-primary); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; display: flex; justify-content: space-between;">
                  <span>📥 Dán tệp</span> <kbd style="font-weight:700; font-family:var(--font-mono);">Ctrl + V</kbd>
                </div>
                <div style="background: var(--bg-primary); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; display: flex; justify-content: space-between;">
                  <span>❌ Đóng Menu</span> <kbd style="font-weight:700; font-family:var(--font-mono);">Esc</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 6: Dynamic Island & YouTube Study Hub -->
        <div class="guide-section">
          <h3>🏝️ 6. Đảo Âm Thanh Học Tập (Dynamic Island) & YouTube Study Hub (v3.1.3)</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">1</div>
            <div>
              <strong>Thao Tác Âm Nhạc & Bài Giảng YouTube 100% Không Cần Nhập Link URL:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Bạn không cần mất thời gian mở app YouTube để sao chép link. Mở <strong>Dynamic Island ➔ Tab "Khám Phá & Tìm Kiếm"</strong> để thưởng thức các kho nhạc sóng não (Alpha Waves 432Hz, Lofi Girl, Studio Ghibli Piano, Mưa Rào) hoặc các bài giảng đại cương DTHU (Triết học Mác - Lênin, Toán C1, Tiếng Anh B1) chỉ bằng 1 cú chạm.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">2</div>
            <div>
              <strong>Thanh Tìm Kiếm YouTube Tức Thì (In-App Instant Search):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Gõ từ khóa tự nhiên (ví dụ: <em>"nhạc ôn thi", "bài giảng triết học", "piano mozart"...</em>) hoặc chọn các thẻ từ khóa gợi ý nhanh bên dưới ô tìm kiếm để hiển thị danh sách kết quả kèm ảnh bìa video sắc nét và bấm nghe ngay.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">3</div>
            <div>
              <strong>Cửa Sổ Video Nổi Mini (Floating Picture-in-Picture):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Khi xem bài giảng có slide hoặc công thức toán học, bấm nút <strong>"📺 Xem Video Nổi"</strong> để mở khung video bo tròn 16:9 ở góc màn hình. Bạn có thể kéo thả di chuyển tự do hoặc thu nhỏ thành bong bóng nổi để vừa xem thầy cô giải đề vừa thao tác làm bài trắc nghiệm.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">4</div>
            <div>
              <strong>Hẹn Giờ Tắt Nhạc, Lưu Yêu Thích & Tự Động Ẩn Viền Màn Hình (Stealth Notch):</strong>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li><strong>Thả tim ❤️</strong>: Lưu bài hát vào danh mục <em>Yêu Thích</em> để nghe lại trong các buổi học sau.</li>
                <li><strong>Hẹn giờ ngủ ⏱️</strong>: Tự động tắt nhạc sau 15p, 30p, 45p hoặc 60p trong menu Cài Đặt Trình Phát.</li>
                <li><strong>Dải Viền Màn Hình (Stealth)</strong>: Sau 30s không thao tác, Island tự động co lên đỉnh màn hình thành dải 4px mỏng. Rê chuột hoặc chạm nhẹ vào đỉnh để gọi Island trượt xuống.</li>
              </ul>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="if(window.DynamicIsland){ DynamicIsland.wakeFromStealth(); DynamicIsland.expandToFull('presets'); }" style="font-weight: 700; background: #9333ea; border-color: #9333ea; display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('radio', 13)} <span>Mở Khám Phá & Tìm Kiếm YouTube</span> ➔
            </button>
            <button class="btn btn-sm" onclick="if(window.DynamicIsland){ DynamicIsland.toggleVideoPip(); }" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('video', 13)} <span>Bật/Tắt Video Nổi (PiP)</span>
            </button>
            <button class="btn btn-sm" onclick="App.renderDrawerLevel('settings-island'); App.openUserDrawer();" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.get('volume2', 13)} <span>Cài Đặt Hệ Thống</span>
            </button>
          </div>
        </div>

        <!-- Section 7: Study Dock & Pomodoro Zen Focus Room -->
        <div class="guide-section">
          <h3>🍅 7. Trung Tâm Tiện Ích Học Tập Nổi (Study Dock) & Không Gian Zen Focus (v3.1.3)</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">1</div>
            <div>
              <strong>Nút Dock Nổi Kéo Thả & Giao Diện Kép Master-Detail:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Nút nổi hình viên thuốc <strong>"⚡ Tiện ích học tập"</strong> nằm cố định ở góc dưới bên phải màn hình. Bạn có thể <strong>kéo thả tự do</strong> đến bất kỳ vị trí thuận tay nào trên màn hình. Khi nhấp mở, bảng điều khiển kép Master-Detail cho phép chuyển đổi tức thì giữa 8 tiện ích học tập:
              </p>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li><strong>🍅 Đồng Hồ Pomodoro</strong>: Chu kỳ 4 hiệp tự động lặp (Auto-Loop), 4 bộ thời gian (15p, 25p, 45p, 90p), đồng bộ nhạc thông minh và gắn mục tiêu ôn tập.</li>
                <li><strong>🔢 Máy Tính Bỏ Túi</strong>: Hỗ trợ tính số liệu đề thi, tính điểm và <strong>gõ trực tiếp bằng bàn phím vật lý</strong> (số, phép tính, Enter, Backspace, Esc).</li>
                <li><strong>📝 Sổ Nháp Tức Thì</strong>: Ghi nhanh công thức, tự động lưu 100% vào LocalStorage và đếm số từ / ký tự thời gian thực.</li>
                <li><strong>🌧️ Âm Thanh Môi Trường 0MB</strong>: Tiếng mưa rơi, sóng biển, gió rừng và tích tắc đồng hồ cơ bằng thuật toán toán học 100% offline không tốn mạng.</li>
                <li><strong>⌨️ Âm Thanh Bàn Phím Cơ</strong>: 6 cấu hình âm sắc đặc sắc (Blue Switch, Red Switch, Cream Thock, Máy Đánh Chữ, Giọt Nước, Gõ Mõ Zen).</li>
                <li><strong>🌙 Trải Nghiệm Học Đêm</strong>: Lọc ánh sáng vàng Amber Warm có thanh trượt độ ấm, Chế độ đen tuyệt đối OLED 100%, Giãn dòng đọc tài liệu, Ánh nến lung linh và Yên tĩnh tuyệt đối DND.</li>
                <li><strong>🥠 Quẻ May Mắn & Mẹo Thi</strong>: Bốc quẻ 1 lần mỗi ngày lúc 00:00 (GMT+7) với thông điệp vũ trụ và mẹo khoanh trắc nghiệm.</li>
                <li><strong>⌨️ Bảng Tra Cứu Phím Tắt</strong>: Toàn bộ phím tắt phòng thi và cú pháp soạn đề nhanh.</li>
              </ul>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">2</div>
            <div>
              <strong>Không Gian Tập Trung Toàn Màn Hình (Zen Focus Desk Clock):</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Trong tab Pomodoro, bấm <strong>"🧘 Mở Không Gian Tập Trung Toàn Màn Hình"</strong> để biến máy tính thành chiếc đồng hồ Pomodoro để bàn siêu lớn, tối giản và thanh tịnh. Toàn bộ thanh điều hướng và footer được ẩn sạch để bạn tập trung cao độ 100%. Thoát cực nhanh bằng nút góc phải hoặc phím <kbd>Esc</kbd>.
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="if(window.StudyDockView){ StudyDockView.open(); StudyDockView.selectMasterItem('pomodoro'); }" style="font-weight: 700; background: #ea580c; border-color: #ea580c; display:inline-flex; align-items:center; gap:5px;">
              <span>🍅</span> <span>Mở Tiện Ích Pomodoro & Zen Room</span> ➔
            </button>
            <button class="btn btn-sm" onclick="if(window.StudyDockView){ StudyDockView.open(); StudyDockView.selectMasterItem('calculator'); }" style="display:inline-flex; align-items:center; gap:5px;">
              <span>🔢</span> <span>Mở Máy Tính Bỏ Túi</span>
            </button>
            <button class="btn btn-sm" onclick="if(window.StudyDockView){ StudyDockView.open(); StudyDockView.selectMasterItem('experience'); }" style="display:inline-flex; align-items:center; gap:5px;">
              <span>🌙</span> <span>Chế Độ Học Đêm & Đèn Nến</span>
            </button>
          </div>
        </div>

        <!-- Section 8: Dành Cho Ban Biên Tập & Admin -->
        <div class="guide-section">
          <h3>🛡️ 8. Cẩm Nang Dành Cho Ban Biên Tập & Quản Trị Viên (Admin)</h3>
          
          <div class="guide-step-item">
            <div class="guide-step-num">1</div>
            <div>
              <strong>Quy trình kiểm duyệt bộ đề cộng đồng:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Khi sinh viên gửi đề đóng góp, Ban Biên Tập vào mục <strong>"⚙️ Quản lý đề" ➔ Tab "Chờ phê duyệt"</strong> để xem trước và hiệu chỉnh. Khi duyệt, hệ thống sẽ tự động gộp các chương câu hỏi vào đúng Môn học đích sẵn có mà không làm phân mảnh hay tạo mã học phần rác.
              </p>
            </div>
          </div>

          <div class="guide-step-item">
            <div class="guide-step-num">2</div>
            <div>
              <strong>Bộ Tính Năng Quản Trị Cao Cấp & Cơ Chế Thông Báo Tự Động 100%:</strong>
              <p style="font-size: 13.5px; margin-top: 4px;">
                Tại <strong>"👑 Quản Trị BXH & Mùa Giải"</strong>, Quản trị viên được trang bị bộ công cụ kiểm toán toàn diện (mỗi thao tác đều bắt buộc nhập lý do và tự động gửi thông báo đến người dùng):
              </p>
              <ul style="font-size: 13px; margin: 4px 0 0 0; padding-left: 18px; line-height: 1.6; color: var(--text-secondary);">
                <li><strong>Lọc trạng thái nhóm</strong>: Xem nhanh thành viên <code>Đang trong nhóm</code>, <code>Đã bị Kick</code>, <code>Chờ duyệt</code>.</li>
                <li><strong>👢 Kick / Khôi phục thành viên</strong>: Loại thành viên vi phạm khỏi nhóm (ẩn BXH, tạm ngưng thi) và khôi phục khi giải trình hợp lệ.</li>
                <li><strong>🔄 Reset điểm cá nhân</strong>: Đặt lại điểm EXP hoặc CP về 0 (chọn phạm vi Mùa này hoặc All-Time) kèm lý do giải trình.</li>
                <li><strong>⚡ Điều chỉnh điểm linh hoạt</strong>: Thưởng / phạt điểm trực tiếp với tùy chọn áp dụng cho Mùa này hoặc Toàn thời gian.</li>
                <li><strong>🚀 Khởi động mùa mới</strong>: Tự động đóng băng kết quả mùa cũ vào Kho Lưu Trữ (Archives), tùy chọn reset điểm Mùa này về 0 và phát thông báo chúc mừng toàn trường.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Section 7: Quản lý cài đặt & Reset cảnh báo -->
        <div class="guide-section">
          <h3>⚙️ 7. Tùy chọn hệ thống & Khôi phục cảnh báo</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 14px;">
            Nếu trước đây bạn đã tích chọn <em>"Không hiển thị lại cảnh báo này trong tương lai"</em> và bây giờ muốn bật lại các hộp thoại xác nhận khi xóa hoặc rời phòng thi:
          </p>
          <button class="btn btn-sm" onclick="App.resetSuppressedWarningsAction()">
            🔄 Khôi phục lại toàn bộ hộp thoại cảnh báo
          </button>
        </div>

      </div>
    `;
  },

  renderSyntaxGuideView(container, data = {}) {
    const fromView = data.from || "parser";
    const subjectId = data.subjectId;

    container.innerHTML = `
      <div class="view-guide">
        <!-- Back Button & Header -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <button class="btn btn-sm" onclick="App.navigateTo('${fromView}', { subjectId: '${subjectId || ''}' })">
            ← Quay lại ${fromView === 'guide' ? 'Hướng dẫn' : 'Nhập đề'}
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary" onclick="App.copyAdvancedSyntaxTemplate()">📋 Chép mẫu nâng cao</button>
            <button class="btn btn-sm" onclick="App.navigateTo('parser', { subjectId: '${subjectId || ''}' })">🚀 Đến Nhập đề</button>
          </div>
        </div>

        <div class="guide-hero">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span class="badge badge-blue" style="font-size: 13px;">Cú pháp & Ký tự</span>
            <span class="badge badge-green">Hỗ trợ 100%</span>
          </div>
          <h2 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
            Cú Pháp & Ký Tự Đặc Biệt
          </h2>
          <p style="font-size: 14.5px; color: var(--text-secondary);">
            Hệ thống Smart Parser tự động nhận diện và hiển thị đẹp mắt tất cả các định dạng in đậm, in nghiêng, khối code, công thức toán học, ký hiệu hóa học, so sánh logic và trích dẫn.
          </p>
        </div>

        <!-- 1. Bảng Tra cứu Cú pháp Markdown -->
        <div class="guide-section">
          <h3>✨ 1. Định dạng chữ (Markdown)</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 12px;">
            Bạn có thể dùng các ký hiệu sau ở cả <strong>Nội dung câu hỏi</strong>, <strong>Lựa chọn A/B/C/D</strong> và <strong>Lời giải thích</strong>:
          </p>

          <table class="syntax-table">
            <thead>
              <tr>
                <th style="width: 28%;">Bạn nhập vào (Cú pháp)</th>
                <th style="width: 32%;">Kết quả hiển thị</th>
                <th>Ý nghĩa & Ứng dụng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="syntax-code">**Chủ nghĩa Mác**</span></td>
                <td><strong>Chủ nghĩa Mác</strong></td>
                <td>In đậm từ khóa quan trọng, thuật ngữ cốt lõi</td>
              </tr>
              <tr>
                <td><span class="syntax-code">*kinh tế chính trị*</span></td>
                <td><em>kinh tế chính trị</em></td>
                <td>In nghiêng tên tác phẩm, tên tiếng Latin, khái niệm</td>
              </tr>
              <tr>
                <td><span class="syntax-code">\`P * Q = M * V\`</span></td>
                <td><code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace;">P * Q = M * V</code></td>
                <td>Khối mã lệnh, công thức toán học, biểu thức kinh tế</td>
              </tr>
              <tr>
                <td><span class="syntax-code">\`H2O + CO2\`</span></td>
                <td><code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace;">H2O + CO2</code></td>
                <td>Công thức hóa học, gen, protein trong Sinh học</td>
              </tr>
              <tr>
                <td><span class="syntax-code">&gt; Đúng: Lời giải...</span></td>
                <td><span class="badge badge-green">✓ Đúng: Lời giải...</span></td>
                <td>Khai báo giải thích chi tiết cho từng phương án</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. Bảng Tra cứu Toán học & Ký tự đặc biệt -->
        <div class="guide-section">
          <h3>🔢 2. Toán học & Ký tự đặc biệt</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 12px;">
            Tất cả các ký tự bên dưới được bảo toàn nguyên vẹn, không bị lỗi nuốt ký tự hay lỗi HTML:
          </p>

          <table class="syntax-table">
            <thead>
              <tr>
                <th style="width: 28%;">Ký hiệu & Biểu thức</th>
                <th style="width: 32%;">Kết quả hiển thị</th>
                <th>Ghi chú & Khả năng xử lý</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="syntax-code">a &lt; b &amp; c &gt; d</span></td>
                <td>a &lt; b &amp; c &gt; d</td>
                <td>So sánh toán học và logic (không bị lỗi thẻ HTML)</td>
              </tr>
              <tr>
                <td><span class="syntax-code">x &gt;= y, a != b</span></td>
                <td>x &gt;= y, a != b</td>
                <td>Toán tử lớn hơn hoặc bằng, khác nhau</td>
              </tr>
              <tr>
                <td><span class="syntax-code">$100, 100%, 37°C</span></td>
                <td>$100, 100%, 37°C</td>
                <td>Ký hiệu tiền tệ, phần trăm, nhiệt độ</td>
              </tr>
              <tr>
                <td><span class="syntax-code">"Tư bản", 'Giá trị'</span></td>
                <td>"Tư bản", 'Giá trị'</td>
                <td>Dấu ngoặc kép, ngoặc đơn trích dẫn nguyên văn</td>
              </tr>
              <tr>
                <td><span class="syntax-code">@author, #CNXHKH</span></td>
                <td>@author, #CNXHKH</td>
                <td>Ký hiệu tag, hashtag và tác giả</td>
              </tr>
              <tr>
                <td><span class="syntax-code">C. Mác, V.I. Lênin</span></td>
                <td>C. Mác, V.I. Lênin</td>
                <td>Tên riêng có dấu chấm (không bị nhầm là lựa chọn C.)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. Bộ câu hỏi mẫu hoàn chỉnh -->
        <div class="guide-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0;">📋 3. Bộ câu hỏi mẫu nâng cao</h3>
            <button class="btn btn-sm btn-primary" onclick="App.copyAdvancedSyntaxTemplate()">📋 Sao chép bộ này</button>
          </div>
          <div class="guide-code-box">Câu 1: Theo nghĩa rộng, **Chủ nghĩa xã hội khoa học** (CNXHKH) được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Bao gồm Triết học, KTCT và CNXHKH.
* B. Hệ tư tưởng của riêng giai cấp "tư sản" > Sai: Là của giai cấp công nhân.
* C. Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác > Sai: Là bộ phận cốt lõi.
* D. Chỉ bao gồm bộ phận KTCT > Sai: Chỉ là 1 bộ phận hợp thành.

Câu 2: Cho biểu thức kinh tế \`P * Q = M * V\` và điều kiện \`a < b & c > d\`. Nhận định nào sau đây là chuẩn xác?
A. Giá trị tỷ lệ $100% với hashtag #kinh_te
* B. Biểu thức \`P * Q = M * V\` thỏa mãn điều kiện (a < b & c > d) > Đúng: Hệ thống hỗ trợ 100% công thức code & so sánh!
C. Ký hiệu @author: Shina Sanora
D. Trích dẫn nguyên văn: "Quy luật giá trị thặng dư là quy luật tuyệt đối"

Câu 3: Hai phát kiến vĩ đại của *C. Mác* và *Ph. Ăng-ghen* tạo tiền đề lý luận cho sự ra đời của CNXHKH là gì?
A. Chủ nghĩa duy vật biện chứng và Học thuyết giá trị thặng dư
B. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư
C. Phép biện chứng duy vật và Học thuyết đấu tranh giai cấp
D. Học thuyết nhà nước và Học thuyết cách mạng vô sản
Đáp án: B
Giải thích: Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư là hai phát kiến vĩ đại của C. Mác và Ph. Ăng-ghen.</div>

          <div style="margin-top: 18px; display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn btn-primary" onclick="App.navigateTo('parser', { subjectId: '${subjectId || ''}' })">
              🚀 Đến Nhập đề ngay ➔
            </button>
          </div>
        </div>

      </div>
    `;
  },

  copyAdvancedSyntaxTemplate() {
    const sample = `Câu 1: Theo nghĩa rộng, **Chủ nghĩa xã hội khoa học** (CNXHKH) được hiểu là gì?
* A. Toàn bộ chủ nghĩa Mác - Lênin > Đúng: Bao gồm Triết học, KTCT và CNXHKH.
* B. Hệ tư tưởng của riêng giai cấp "tư sản" > Sai: Là của giai cấp công nhân.
* C. Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác > Sai: Là bộ phận cốt lõi.
* D. Chỉ bao gồm bộ phận KTCT > Sai: Chỉ là 1 bộ phận hợp thành.

Câu 2: Cho biểu thức kinh tế \`P * Q = M * V\` và điều kiện \`a < b & c > d\`. Nhận định nào sau đây là chuẩn xác?
A. Giá trị tỷ lệ $100% với hashtag #kinh_te
* B. Biểu thức \`P * Q = M * V\` thỏa mãn điều kiện (a < b & c > d) > Đúng: Hệ thống hỗ trợ 100% công thức code & so sánh!
C. Ký hiệu @author: Shina Sanora
D. Trích dẫn nguyên văn: "Quy luật giá trị thặng dư là quy luật tuyệt đối"

Câu 3: Hai phát kiến vĩ đại của *C. Mác* và *Ph. Ăng-ghen* tạo tiền đề lý luận cho sự ra đời của CNXHKH là gì?
A. Chủ nghĩa duy vật biện chứng và Học thuyết giá trị thặng dư
B. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư
C. Phép biện chứng duy vật và Học thuyết đấu tranh giai cấp
D. Học thuyết nhà nước và Học thuyết cách mạng vô sản
Đáp án: B
Giải thích: Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư là hai phát kiến vĩ đại của C. Mác và Ph. Ăng-ghen.`;

    navigator.clipboard.writeText(sample).then(() => {
      this.showToast("📋 Đã sao chép bộ câu hỏi mẫu nâng cao vào Clipboard!", "success", 3000);
    });
  },

  copySampleTemplate() {
    const sample = `Câu 1: Nội dung câu hỏi số 1 ở đây?
A. Phương án A
B. Phương án B
C. Phương án C
D. Phương án D
Đáp án: A
Giải thích: Lời giải thích chi tiết tại sao A đúng...

Câu 2: Nội dung câu hỏi số 2 ở đây?
* A. Lựa chọn A > Đúng: Giải thích A
* B. Lựa chọn B > Sai: Giải thích B
* C. Lựa chọn C > Sai: Giải thích C
* D. Lựa chọn D > Sai: Giải thích D`;

    navigator.clipboard.writeText(sample).then(() => {
      this.showToast("📋 Đã sao chép mẫu cấu trúc đề thi vào Clipboard!", "success", 3000);
    });
  },

  resetSuppressedWarningsAction() {
    StorageService.resetSuppressedWarnings();
    this.showToast("✅ Đã khôi phục lại toàn bộ hộp thoại cảnh báo thành công!", "success", 3000);
  },

  openCreateSubjectModal() {
    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");

    const profile = StorageService.getUserProfile();
    const defaultAuthor = profile?.fullName || "Shina Sanora";

    this.newSubjectChapters = [
      { id: "c1", name: "Chương 1: Mở đầu & Đại cương" },
      { id: "c2", name: "Chương 2: Cơ sở lý thuyết trọng tâm" },
      { id: "c3", name: "Chương 3: Ứng dụng & Thực tiễn" }
    ];

    title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">${Icons.get('plus', 16)} <span>Thêm Môn Học Mới & Setup Chương Nhanh</span></span>`;

    const renderChapterRows = () => {
      return this.newSubjectChapters.map((c, idx) => `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); width: 22px; text-align: center;">${idx + 1}.</span>
          <input 
            type="text" 
            class="form-control new-chapter-input" 
            data-index="${idx}" 
            value="${c.name.replace(/"/g, '&quot;')}" 
            placeholder="Tên chương ${idx + 1}..." 
            style="flex: 1; font-size: 13px; height: 34px;">
          <button 
            type="button" 
            onclick="App.removeChapterFromNewSubjectRow(${idx})" 
            class="btn btn-sm btn-danger" 
            style="padding: 4px 8px; display:inline-flex; align-items:center;" 
            title="Xóa chương này">
            ${Icons.get('trash', 12)}
          </button>
        </div>
      `).join('');
    };

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- KHU VỰC 1: THÔNG TIN MÔN HỌC -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--brand-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            ${Icons.get('book', 14)} <span>1. Thông tin định danh môn học:</span>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12.5px; font-weight: 700;">Tên môn học (*):</label>
              <input type="text" id="newSubName" class="form-control" placeholder="Ví dụ: Hóa Sinh Học, Di Truyền Học..." style="height: 36px; font-size: 13.5px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12.5px; font-weight: 700;">Mã môn (*):</label>
              <input type="text" id="newSubCode" class="form-control" placeholder="Ví dụ: BIO302" style="height: 36px; font-size: 13.5px; text-transform: uppercase; font-family: var(--font-mono);">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Khoa / Ngành:</label>
              <input type="text" id="newSubDept" class="form-control" placeholder="Khoa Kỹ thuật - Công nghệ" value="Khoa Kỹ thuật - Công nghệ" style="height: 34px; font-size: 13px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Người biên soạn:</label>
              <input type="text" id="newSubAuthor" class="form-control" placeholder="Họ tên tác giả" value="${defaultAuthor}" style="height: 34px; font-size: 13px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 12px;">Mô tả ngắn đề cương môn học:</label>
            <input type="text" id="newSubDesc" class="form-control" placeholder="Mô tả tóm tắt nội dung ôn thi..." style="height: 34px; font-size: 13px;">
          </div>

          <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              <input type="checkbox" id="newSubGuestAllowed" checked style="width: 16px; height: 16px; cursor: pointer;">
              <span>Mở cho máy khách ôn tập (Guest Access Allowed)</span>
            </label>
          </div>
        </div>

        <!-- KHU VỰC 2: SETUP CHƯƠNG NHANH -->
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 13px; font-weight: 700; color: #15803d; display: flex; align-items: center; gap: 6px;">
              ${Icons.get('folder', 14)} <span>2. Thiết lập danh mục chương nhanh:</span>
            </div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              <button type="button" onclick="App.quickAddChaptersPreset(3)" class="btn btn-sm" style="padding: 2px 8px; font-size: 11.5px; background:#fff; border:1px solid #cbd5e1;">+3 Chương</button>
              <button type="button" onclick="App.quickAddChaptersPreset(5)" class="btn btn-sm" style="padding: 2px 8px; font-size: 11.5px; background:#fff; border:1px solid #cbd5e1;">+5 Chương</button>
              <button type="button" onclick="App.quickAddChaptersPreset(7)" class="btn btn-sm" style="padding: 2px 8px; font-size: 11.5px; background:#fff; border:1px solid #cbd5e1;">+7 Chương</button>
            </div>
          </div>

          <div id="newSubjectChaptersList" style="max-height: 180px; overflow-y: auto; padding-right: 4px;">
            ${renderChapterRows()}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; pt: 6px; border-top: 1px dashed #e2e8f0;">
            <button type="button" onclick="App.addChapterToNewSubjectRow()" class="btn btn-sm" style="display:inline-flex; align-items:center; gap:4px; font-size: 12px; background:#fff; border:1px solid #cbd5e1;">
              ${Icons.get('plus', 12)} <span>Thêm dòng chương</span>
            </button>
            <span style="font-size: 11.5px; color: var(--text-tertiary);">Có thể đổi tên và thêm bớt sau</span>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Hủy Bỏ</button>
      <button class="btn" onclick="App.saveNewSubject(false)" style="display:inline-flex; align-items:center; gap:5px;">
        ${Icons.get('save', 13)} <span>Chỉ Lưu Môn</span>
      </button>
      <button class="btn btn-primary" onclick="App.saveNewSubject(true)" style="display:inline-flex; align-items:center; gap:5px; font-weight:700;">
        ${Icons.get('zap', 14)} <span>Lưu & Chuyển Sang Nhập Đề (Parser)</span>
      </button>
    `;

    modal.classList.add("active");
  },

  quickAddChaptersPreset(count) {
    this.syncNewSubjectChaptersState();
    this.newSubjectChapters = [];
    for (let i = 1; i <= count; i++) {
      this.newSubjectChapters.push({
        id: `c${i}`,
        name: `Chương ${i}: Nội dung kiến thức phần ${i}`,
        isGuestAllowed: i === 1 // Mặc định chương 1 mở cho khách
      });
    }
    this.refreshNewSubjectChaptersUI();
  },

  addChapterToNewSubjectRow(name = "") {
    this.syncNewSubjectChaptersState();
    const nextIdx = this.newSubjectChapters.length + 1;
    this.newSubjectChapters.push({
      id: `c${nextIdx}`,
      name: name || `Chương ${nextIdx}: Nội dung kiến thức mới`,
      isGuestAllowed: false
    });
    this.refreshNewSubjectChaptersUI();
  },

  removeChapterFromNewSubjectRow(idx) {
    this.syncNewSubjectChaptersState();
    if (this.newSubjectChapters.length <= 1) {
      this.showToast("⚠️ Môn học cần ít nhất 1 chương mặc định!", "warning");
      return;
    }
    this.newSubjectChapters.splice(idx, 1);
    this.refreshNewSubjectChaptersUI();
  },

  syncNewSubjectChaptersState() {
    const inputs = document.querySelectorAll(".new-chapter-input");
    inputs.forEach(inp => {
      const idx = parseInt(inp.getAttribute("data-index"), 10);
      if (!isNaN(idx) && this.newSubjectChapters[idx]) {
        this.newSubjectChapters[idx].name = inp.value.trim() || `Chương ${idx + 1}`;
      }
    });
  },

  refreshNewSubjectChaptersUI() {
    const listEl = document.getElementById("newSubjectChaptersList");
    if (!listEl) return;
    listEl.innerHTML = this.newSubjectChapters.map((c, idx) => `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); width: 22px; text-align: center;">${idx + 1}.</span>
        <input 
          type="text" 
          class="form-control new-chapter-input" 
          data-index="${idx}" 
          value="${c.name.replace(/"/g, '&quot;')}" 
          placeholder="Tên chương ${idx + 1}..." 
          style="flex: 1; font-size: 13px; height: 34px;">
        <button 
          type="button" 
          onclick="App.removeChapterFromNewSubjectRow(${idx})" 
          class="btn btn-sm btn-danger" 
          style="padding: 4px 8px; display:inline-flex; align-items:center;" 
          title="Xóa chương này">
          ${Icons.get('trash', 12)}
        </button>
      </div>
    `).join('');
  },

  saveNewSubject(autoRedirectToParser = true) {
    this.syncNewSubjectChaptersState();
    const name = document.getElementById("newSubName")?.value.trim();
    const code = document.getElementById("newSubCode")?.value.trim().toUpperCase();
    const dept = document.getElementById("newSubDept")?.value.trim() || "Đại học Đồng Tháp";
    const author = document.getElementById("newSubAuthor")?.value.trim() || "Shina Sanora";
    const desc = document.getElementById("newSubDesc")?.value.trim() || "";
    const isGuestAllowed = document.getElementById("newSubGuestAllowed")?.checked !== false;

    if (!name || !code) {
      this.showToast("⚠️ Vui lòng nhập đầy đủ Tên môn học và Mã môn học!", "warning");
      return;
    }

    const finalChapters = (this.newSubjectChapters && this.newSubjectChapters.length > 0)
      ? this.newSubjectChapters.map(c => ({ ...c, isGuestAllowed: c.isGuestAllowed !== false }))
      : [{ id: "c1", name: "Chương 1: Mở đầu", isGuestAllowed: true }];

    const newSub = {
      id: "SUB_" + Date.now(),
      code,
      name,
      department: dept,
      author,
      description: desc,
      isGuestAllowed: Boolean(isGuestAllowed),
      chapters: finalChapters,
      questions: [],
      contributors: [],
      createdAt: new Date().toISOString()
    };

    StorageService.saveSubject(newSub);
    this.closeModal();

    if (autoRedirectToParser) {
      this.showToast(`🎉 Đã tạo môn "${name}" (${finalChapters.length} chương)! Đang mở trình nhập đề...`, "success", 3500);
      this.navigateTo("parser", { subjectId: newSub.id });
    } else {
      this.showToast(`🎉 Đã tạo môn học "${name}" thành công!`, "success", 3000);
      this.navigateTo("subject-detail", { subjectId: newSub.id });
    }
  },

  triggerImportFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        ImportExportService.importFromFile(file, (success, msg) => {
          App.showToast(msg, success ? "success" : "danger", 4000);
          if (success) App.navigateTo("home");
        });
      }
    };
    input.click();
  }
});
