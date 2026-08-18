/**
 * REGISTER & TERMS VIEW MODULE
 * Đăng ký tài khoản sinh viên, Điều khoản Dịch vụ & Thỏa thuận Sử dụng.
 * Tách từ app.js để dễ quản lý.
 */

Object.assign(App, {
  openTermsModal() {
    // Tự động lưu nháp dữ liệu đang điền dở ở form đăng ký nếu có
    this.saveRegisterFormDraft();

    const modal = document.getElementById("globalModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const footer = document.getElementById("modalFooter");
    if (!modal || !title || !body || !footer) return;

    title.innerHTML = "📜 Điều Khoản Dịch Vụ & Thỏa Thuận Sử Dụng";
    body.innerHTML = `
      <div style="max-height: 65vh; overflow-y: auto; padding: 6px 4px; display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 13px; color: #166534; line-height: 1.5;">
          ⚖️ <strong>Shinora QuizMaster</strong> là nền tảng tự học & luyện thi trắc nghiệm phi thương mại, 100% miễn phí. Bằng việc đăng ký tài khoản, bạn đồng ý với các điều khoản dưới đây.
        </div>

        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
          <h4 style="font-size: 14px; font-weight: 800; color: var(--brand-primary); margin: 0 0 6px 0;">ĐIỀU 1: PHẠM VI DỊCH VỤ & BẢN CHẤT TỰ HỌC</h4>
          <p style="font-size: 12.5px; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            Hệ thống cung cấp bộ câu hỏi rèn luyện, môi trường giả lập thi bấm giờ, trình bóc tách đề (Smart Parser) và lưu trữ cá nhân. Toàn bộ nội dung mang tính chất bài tập tham khảo, không đại diện cho đề thi chính thức hay cơ quan giáo dục nào.
          </p>
        </div>

        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
          <h4 style="font-size: 14px; font-weight: 800; color: var(--brand-primary); margin: 0 0 6px 0;">ĐIỀU 2: TÀI KHOẢN, MÃ PIN 6 SỐ & BẢO MẬT</h4>
          <p style="font-size: 12.5px; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            Hệ thống chỉ dùng Mã PIN 6 số do bạn tự đặt, tuyệt đối <strong>KHÔNG</strong> thu thập mật khẩu email, mật khẩu cổng sinh viên hay ngân hàng. Ban Phát triển hoàn toàn miễn trừ trách nhiệm nếu bạn tự làm lộ mã PIN hoặc đặt trùng với mã PIN dịch vụ khác.
          </p>
        </div>

        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
          <h4 style="font-size: 14px; font-weight: 800; color: var(--brand-primary); margin: 0 0 6px 0;">ĐIỀU 3: BẢN QUYỀN & QUY TRÌNH GỠ BỎ (TAKEDOWN 24H-48H)</h4>
          <p style="font-size: 12.5px; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            Bản quyền phần mềm thuộc Nhà phát triển Shina (Bùi Văn Khang). Người dùng tự chịu trách nhiệm về tài liệu tải lên. Mọi khiếu nại bản quyền gửi về <code>vkhg.bui@gmail.com</code> sẽ được gỡ bỏ ngay trong vòng 24 - 48 giờ làm việc.
          </p>
        </div>

        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
          <h4 style="font-size: 14px; font-weight: 800; color: var(--brand-primary); margin: 0 0 6px 0;">ĐIỀU 4: BẢO MẬT THÔNG TIN & KHÔNG BÁN DỮ LIỆU</h4>
          <p style="font-size: 12.5px; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            Cam kết 100% không thương mại hóa, không bán danh sách sinh viên hay email cho bất kỳ bên thứ ba nào. Bạn có toàn quyền xuất file sao lưu JSON hoặc yêu cầu xóa vĩnh viễn tài khoản bất kỳ lúc nào.
          </p>
        </div>

        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
          <h4 style="font-size: 14px; font-weight: 800; color: var(--brand-primary); margin: 0 0 6px 0;">ĐIỀU 5 & 6: MIỄN TRỪ BẢO ĐẢM & THÔNG TIN LIÊN HỆ</h4>
          <p style="font-size: 12.5px; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            Cung cấp nguyên trạng "As-Is", mức bồi thường tài chính tối đa bằng 0 VNĐ. Người dùng cam kết giữ cho Nhà phát triển không bị tổn hại. Liên hệ chính thức: Email <code>vkhg.bui@gmail.com</code> · Hotline <code>0354 616 301</code>.
          </p>
        </div>

        <div style="text-align: center; margin-top: 4px;">
          <a href="javascript:void(0)" onclick="App.closeModal(); App.navigateTo('terms', { fromView: 'register' });" style="font-size: 12.5px; color: var(--brand-primary); font-weight: 700; text-decoration: underline;">
            📖 Nhấp để đọc toàn văn đầy đủ 6 Điều khoản chi tiết tại trang riêng ➔
          </a>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn" onclick="App.closeModal()">Đóng</button>
      <button class="btn btn-primary" style="font-weight: 700;" onclick="App.acceptTermsFromModal()">
        ✅ Tôi Đã Đọc & Đồng Ý
      </button>
    `;

    modal.classList.add("active");
  },

  acceptTermsFromModal() {
    const check = document.getElementById("regTermsAgree");
    if (check) {
      check.checked = true;
    }
    this.toggleRegisterSubmitState();
    this.saveRegisterFormDraft();
    this.closeModal();
    this.showToast("✅ Đã xác nhận đồng ý với Điều khoản Dịch vụ!", "success", 3000);
  },

  navigateToTermsFromRegister() {
    this.saveRegisterFormDraft();
    this.navigateTo('terms', { fromView: 'register' });
  },

  saveRegisterFormDraft() {
    const fullName = document.getElementById("regFullName")?.value || "";
    const studentId = document.getElementById("regStudentId")?.value || "";
    const email = document.getElementById("regEmail")?.value || "";
    const dept = document.getElementById("regDept")?.value || "";
    const pin = document.getElementById("regPin")?.value || "";
    const pinConfirm = document.getElementById("regPinConfirm")?.value || "";
    const avatar = document.getElementById("selectedRegAvatar")?.value || "👨‍🎓";
    const termsAgree = document.getElementById("regTermsAgree")?.checked || false;

    this.registerFormDraft = {
      fullName,
      studentId,
      email,
      department: dept,
      pinCode: pin,
      pinConfirm,
      avatar,
      termsAgree
    };
  },

  renderTermsView(container) {
    container.innerHTML = `
      <div class="view-terms">
        <div class="terms-header-banner">
          <div class="terms-header-info">
            <h2>📜 Điều Khoản Dịch Vụ & Quy Chế Hoạt Động</h2>
            <p>Nền tảng Ôn tập & Khảo thí Trắc nghiệm Thông minh <strong>Shinora QuizMaster</strong> · Cập nhật ngày 18/08/2026</p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm" onclick="window.print()" title="In hoặc xuất văn bản PDF">
              🖨️ In / Lưu PDF
            </button>
            ${(this.previousView === 'register' || (this.activeRouteData && this.activeRouteData.fromView === 'register') || (this.registerFormDraft && Object.keys(this.registerFormDraft).length > 0)) ? `
              <button class="btn btn-sm btn-primary" onclick="App.navigateTo('register')" title="Quay lại biểu mẫu đăng ký mà không mất dữ liệu">
                ← Quay Lại Form Đăng Ký
              </button>
            ` : `
              <button class="btn btn-sm btn-primary" onclick="App.navigateTo('home')">
                ← Quay Lại Trang Chủ
              </button>
            `}
          </div>
        </div>

        <div class="terms-layout">
          <!-- Thanh Mục Lục Nhanh (Sticky Table of Contents) -->
          <aside class="terms-toc-card">
            <div class="terms-toc-title">📑 Mục Lục Điều Khoản</div>
            <ul class="terms-toc-list">
              <li><a href="javascript:void(0)" onclick="App.scrollToTermsSection('dieu-1')" class="terms-toc-link">Điều 1: Chấp thuận & Phạm vi</a></li>
              <li><a href="javascript:void(0)" onclick="App.scrollToTermsSection('dieu-2')" class="terms-toc-link">Điều 2: Tài khoản & Mã PIN</a></li>
              <li><a href="javascript:void(0)" onclick="App.scrollToTermsSection('dieu-3')" class="terms-toc-link">Điều 3: Bản quyền & Gỡ bỏ</a></li>
              <li><a href="javascript:void(0)" onclick="App.scrollToTermsSection('dieu-4')" class="terms-toc-link">Điều 4: Quyền Riêng tư & Data</a></li>
              <li><a href="javascript:void(0)" onclick="App.scrollToTermsSection('dieu-5')" class="terms-toc-link">Điều 5: Miễn trừ Bảo đảm</a></li>
              <li><a href="javascript:void(0)" onclick="App.scrollToTermsSection('dieu-6')" class="terms-toc-link">Điều 6: Hiệu lực & Liên hệ</a></li>
            </ul>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border); font-size: 11.5px; color: var(--text-tertiary);">
              🛡️ <em>Văn bản hợp đồng điện tử có hiệu lực áp dụng cho toàn bộ người dùng.</em>
            </div>
          </aside>

          <!-- Khu Vực Toàn Văn 6 Điều Khoản -->
          <div class="terms-content-area">
            
            <!-- Lời Mở Đầu -->
            <div class="terms-card" style="background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border-color: #bbf7d0;">
              <h3 style="font-size: 15px; font-weight: 800; color: #166534; margin: 0 0 8px 0;">
                ⚖️ THỎA THUẬN GIAO KẾT ĐIỆN TỬ
              </h3>
              <p class="terms-section-paragraph" style="color: #15803d;">
                Chào mừng bạn đến với <strong>Shinora QuizMaster</strong>. Khi truy cập, tạo tài khoản hoặc sử dụng bất kỳ tính năng nào trên hệ thống, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản được quy định dưới đây.
              </p>
            </div>

            <!-- ĐIỀU 1 -->
            <section class="terms-card" id="dieu-1">
              <h3 class="terms-card-title">
                <span>ĐIỀU 1: CHẤP THUẬN THỎA THUẬN & PHẠM VI DỊCH VỤ</span>
                <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Mục 1.1 - 1.9</span>
              </h3>
              
              <div class="terms-section-block">
                <div class="terms-section-subheading">1.1. Cơ chế Chấp thuận Thỏa thuận (Acceptance of Terms)</div>
                <p class="terms-section-paragraph">
                  Thỏa thuận này cấu thành một hợp đồng điện tử có giá trị pháp lý ràng buộc giữa Người dùng (bao gồm người truy cập vãng lai và thành viên đã đăng ký) với Ban Phát triển Shinora QuizMaster. Bằng các hành vi thực tế như truy cập hệ thống, làm bài kiểm tra, tải lên tài liệu để bóc tách câu hỏi hoặc khởi tạo tài khoản, Người dùng xác nhận đã đủ năng lực hành vi dân sự, hiểu rõ và đồng ý vô điều kiện với toàn bộ điều khoản. Trường hợp không đồng thuận với bất kỳ nội dung nào, Người dùng cần lập tức chấm dứt phiên truy cập và dừng sử dụng nền tảng.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">1.2. Phân loại Chế độ Sử dụng Dịch vụ (Usage Modes)</div>
                <p class="terms-section-paragraph">
                  Hệ thống vận hành song song hai phương thức trải nghiệm: <strong>Chế độ Khách (Guest Mode)</strong> cho phép làm bài kiểm tra nhanh và sử dụng các công cụ cơ bản mà không cần định danh hay đăng ký tài khoản (dữ liệu lưu trữ tạm thời trên bộ nhớ cục bộ LocalStorage của thiết bị và Người dùng vẫn chịu ràng buộc toàn diện bởi thỏa thuận này); <strong>Chế độ Thành viên (Registered Account Mode)</strong> cung cấp đầy đủ các tiện ích nâng cao gồm lưu trữ tiến độ dài hạn, đồng bộ đám mây đa thiết bị, tính điểm kinh nghiệm (EXP), ghi nhận điểm cống hiến (CP), vinh danh trên Bảng xếp hạng và quản lý ngân hàng câu hỏi làm sai (Mistake Vault).
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">1.3. Bản chất và Phạm vi Tiện ích Công nghệ (Scope of Platform Tools)</div>
                <p class="terms-section-paragraph">
                  Shinora QuizMaster là giải pháp phần mềm độc lập phục vụ mục đích tự học phi lợi nhuận, cung cấp các công cụ hỗ trợ kỹ thuật gồm: Bộ câu hỏi rèn luyện kiến thức do đội ngũ phát triển tự biên soạn, số hóa hoặc do cộng đồng người học tự nguyện chia sẻ phục vụ mục đích ôn tập; Môi trường giả lập thi cử hỗ trợ bấm giờ tự động, chấm điểm theo thang điểm 10 và xáo trộn ngẫu nhiên câu hỏi kèm đáp án (Shuffle Engine); Trình bóc tách tài liệu thông minh (Smart Document Parser) chuyển đổi ghi chú cá nhân sang dạng bài tập trắc nghiệm; và Không gian quản lý dữ liệu cá nhân hỗ trợ sao lưu/phục hồi qua tệp tin JSON.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">1.4. Tuyên bố về Nguồn gốc & Bản chất Nội dung (Clarification on Quiz Content)</div>
                <p class="terms-section-paragraph">
                  Toàn bộ dữ liệu câu hỏi và đáp án trên nền tảng mang tính chất bài tập tự luyện và tài liệu tham khảo nội bộ. Shinora QuizMaster không sở hữu, không phân phối và không tuyên bố đại diện cho bất kỳ ngân hàng đề thi mật, đề thi chính thức hay tài liệu khảo thí độc quyền nào của các cơ sở giáo dục và cơ quan khảo thí.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">1.5. Chính sách Phi thương mại & Miễn phí Tuyệt đối (100% Free & Non-Profit Policy)</div>
                <p class="terms-section-paragraph">
                  Nền tảng được xây dựng và duy trì hoàn toàn miễn phí 100%, không thu phí dịch vụ dưới mọi hình thức, không kinh doanh mua bán đề thi và không chèn quảng cáo thương mại. Toàn bộ hoạt động phát triển hướng tới mục tiêu cống hiến vì học thuật và thúc đẩy nghiên cứu công nghệ trong cộng đồng sinh viên.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">1.6. Tuyên bố Độc lập Tuyệt đối (Non-Affiliation Statement)</div>
                <p class="terms-section-paragraph">
                  Dự án được khởi xướng và phát triển độc lập bởi cá nhân <strong>Shina (Bùi Văn Khang)</strong>. Nền tảng hoàn toàn không có mối quan hệ ủy quyền, không đại diện pháp lý và không trực thuộc quyền sở hữu hay quản lý của Trường Đại học Đồng Tháp cũng như bất kỳ tổ chức giáo dục nào khác.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">1.7. Giới hạn Trách nhiệm Kỹ thuật (Technical Disclaimer)</div>
                <p class="terms-section-paragraph">
                  Mặc dù hệ thống nỗ lực tối ưu độ chính xác của thuật toán bóc tách và chấm điểm, nền tảng không cam kết kết quả mô phỏng trên website tương đương tuyệt đối với kết quả đánh giá học thuật thực tế tại các kỳ thi chính thức.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">1.8. Quyền Sửa đổi, Nâng cấp & Bảo trì Kỹ thuật (Service Evolution)</div>
                <p class="terms-section-paragraph">
                  Ban Phát triển giữ toàn quyền cập nhật thuật toán, bảo trì cơ sở dữ liệu, sửa đổi tính năng hoặc điều chỉnh nội dung thỏa thuận sử dụng để phù hợp với định hướng vận hành mà không bắt buộc phải phát đi thông báo trước.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">1.9. Địa chỉ Truy cập Chính thức và Cảnh báo Chống Mạo danh (Official URLs & Anti-Phishing)</div>
                <p class="terms-section-paragraph">
                  Thỏa thuận sử dụng này áp dụng độc quyền cho các địa chỉ truy cập chính thức của nền tảng Shinora QuizMaster do Nhà phát triển Shina (Bùi Văn Khang) trực tiếp quản lý, bao gồm tên miền chính thức trên GitHub Pages tại địa chỉ <code>https://vkhang-bui.github.io/dthu-quizmaster/</code> (hoặc <code>https://shinora-quizmaster.vercel.app</code>) cùng các trang định tuyến nội bộ liên kết. Ban Phát triển không chịu bất kỳ trách nhiệm pháp lý nào đối với các phiên bản phần mềm bị sao chép, chỉnh sửa mã nguồn trái phép, hoặc các trang web mạo danh hoạt động ngoài danh mục các địa chỉ chính thức nêu trên.
                </p>
              </div>
            </section>

            <!-- ĐIỀU 2 -->
            <section class="terms-card" id="dieu-2">
              <h3 class="terms-card-title">
                <span>ĐIỀU 2: TÀI KHOẢN, ĐỊNH DANH, MÃ PIN & BẢO MẬT THÔNG TIN</span>
                <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Mục 2.1 - 2.6</span>
              </h3>

              <div class="terms-section-block">
                <div class="terms-section-subheading">2.1. Đăng ký, Tính Trung thực của Thông tin và Quản lý Dữ liệu</div>
                <p class="terms-section-paragraph">
                  Người dùng có nhu cầu tiếp cận các tính năng nâng cao bắt buộc phải tiến hành khởi tạo tài khoản thành viên. Bằng hành vi gửi yêu cầu đăng ký, Người dùng cam kết, đảm bảo và chịu trách nhiệm pháp lý toàn bộ về tính trung thực, chính xác của thông tin cung cấp (Họ tên, MSSV, Lớp, Email, Chuyên ngành). Nền tảng nghiêm cấm tuyệt đối mọi hành vi mạo danh, sử dụng MSSV hoặc email của cá nhân khác để tạo tài khoản. Ban Quản trị bảo lưu toàn quyền đình chỉ hoặc xóa vĩnh viễn mọi tài khoản gian lận mà không cần thông báo trước.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">2.2. Cơ chế Phê duyệt, Kích hoạt và Từ chối Tài khoản</div>
                <p class="terms-section-paragraph">
                  Mọi tài khoản sau khi đăng ký sẽ tự động được đặt ở trạng thái chờ duyệt (Pending Approval). Ban Quản trị (Admin) nắm giữ toàn quyền tối thượng trong việc thẩm tra thông tin và đưa ra quyết định phê duyệt kích hoạt (Active) hoặc từ chối (Reject) tư cách thành viên theo quy chế vận hành nội bộ.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">2.3. Định danh bằng Mã PIN, Trách nhiệm Bảo mật và Miễn trừ Tuyệt đối</div>
                <p class="terms-section-paragraph">
                  Shinora QuizMaster chỉ sử dụng phương thức định danh qua MSSV/Email kết hợp cùng <strong>Mã PIN cá nhân gồm đúng 06 chữ số</strong> do Người dùng tự thiết lập. Hệ thống tuyệt đối <strong>KHÔNG</strong> thu thập, không lưu trữ và không truy cập vào bất kỳ mật khẩu nào thuộc về dịch vụ bên thứ ba (như Mật khẩu Email, Mật khẩu Cổng thông tin đào tạo của Trường, Mật khẩu Ngân hàng hay Mạng xã hội). Ban Phát triển hoàn toàn miễn trừ mọi trách nhiệm pháp lý và vật chất đối với mọi sự cố phát sinh khi Người dùng bị rò rỉ thông tin hoặc mất quyền kiểm soát các tài khoản cá nhân bên ngoài do tự đặt mã PIN trùng lặp hoặc không tự bảo mật thiết bị đầu cuối.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">2.4. Quy trình Khôi phục Quyền truy cập qua OTP và Chống Lạm dụng</div>
                <p class="terms-section-paragraph">
                  Mã OTP khôi phục mã PIN (gồm 6 số) có thời hạn hiệu lực tối đa 300 giây. Người dùng chịu trách nhiệm tuyệt đối trong việc bảo vệ mã OTP và hộp thư cá nhân. Ban Quản trị khẳng định không bao giờ chủ động liên hệ yêu cầu cung cấp mã OTP hay mã PIN.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">2.5. Phân quyền Truy cập, Cấu trúc Vai trò và Quyền Điều chỉnh</div>
                <p class="terms-section-paragraph">
                  Cấu trúc phân quyền gồm 3 nhóm vai trò nòng cốt: <strong>Quản trị viên Tối cao (Admin)</strong> nắm toàn quyền kiểm soát hệ thống; <strong>Ban Biên tập (Editor)</strong> hỗ trợ kiểm duyệt và thẩm định nội dung học thuật; <strong>Thành viên Tiêu chuẩn (Student)</strong> có quyền rèn luyện và gửi đề đóng góp dạng bản nháp. Ban Quản trị bảo lưu toàn quyền tinh chỉnh, mở rộng hoặc thu hồi quyền hạn chi tiết của từng vai trò nhằm đáp ứng yêu cầu vận hành.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">2.6. Chế tài Xử lý Vi phạm, Đình chỉ và Thu hồi Tài sản Ảo</div>
                <p class="terms-section-paragraph">
                  Ban Quản trị sở hữu đặc quyền vô điều kiện trong việc tạm khóa, xóa vĩnh viễn tài khoản và thu hồi toàn bộ điểm số tích lũy (EXP, CP, Huy hiệu) nếu phát hiện hành vi sử dụng công cụ tự động can thiệp mã nguồn gian lận điểm số, tải lên nội dung độc hại hoặc tấn công phá hoại tài nguyên máy chủ.
                </p>
              </div>
            </section>

            <!-- ĐIỀU 3 -->
            <section class="terms-card" id="dieu-3">
              <h3 class="terms-card-title">
                <span>ĐIỀU 3: SỞ HỮU TRÍ TUỆ, NỘI DUNG ĐÓNG GÓP VÀ QUY TRÌNH GỠ BỎ</span>
                <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Mục 3.1 - 3.5</span>
              </h3>

              <div class="terms-section-block">
                <div class="terms-section-subheading">3.1. Quyền Sở hữu Trí tuệ đối với Hệ thống và Phần mềm</div>
                <p class="terms-section-paragraph">
                  Toàn bộ mã nguồn phần mềm, kiến trúc cơ sở dữ liệu, giao diện UI/UX, thuật toán xử lý độc quyền (Smart Parser, Shuffle Engine, Season Studio) và nhận diện thương hiệu thuộc quyền sở hữu trí tuệ duy nhất của Nhà phát triển <strong>Shina (Bùi Văn Khang)</strong>. Nghiêm cấm tuyệt đối mọi hành vi dịch ngược mã nguồn (Reverse Engineering), sao chép toàn phần hoặc từng phần nhằm mục đích thương mại khi chưa có sự chấp thuận bằng văn bản.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">3.2. Bản chất Nguồn gốc Dữ liệu và Nguyên tắc Sử dụng Hợp lý</div>
                <p class="terms-section-paragraph">
                  Hệ thống phân định rạch ròi giữa hạ tầng công cụ phần mềm và dữ liệu nội dung. Các bộ câu hỏi, bài tập trắc nghiệm được thu thập từ nguồn học liệu mở, giáo trình công khai hoặc do cộng đồng tự nguyện biên soạn phục vụ mục đích tự học phi lợi nhuận theo nguyên tắc Sử dụng hợp lý (Fair Use).
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">3.3. Trách nhiệm Pháp lý và Giấy phép đối với Nội dung Đóng góp</div>
                <p class="terms-section-paragraph">
                  Người dùng tự chịu trách nhiệm pháp lý 100% về tính hợp pháp và quyền chia sẻ của các tài liệu tải lên. Nghiêm cấm đóng góp đề thi mật, tài liệu cấm chia sẻ hoặc vi phạm bản quyền nghiêm ngặt. Khi gửi đóng góp, Người dùng cấp cho Shinora QuizMaster giấy phép phi độc quyền, miễn phí và vĩnh viễn để lưu trữ, chuẩn hóa định dạng và chia sẻ cho cộng đồng cùng học tập.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">3.4. Miễn trừ Trách nhiệm đối với Công cụ Bóc tách Tài liệu</div>
                <p class="terms-section-paragraph">
                  Trình bóc tách tài liệu thông minh (Smart Document Parser) hoạt động thuần túy với tư cách là công cụ chuyển đổi định dạng tệp tin cục bộ trên trình duyệt người dùng. Ban Quản trị hoàn toàn miễn trừ mọi trách nhiệm pháp lý liên quan đến nguồn gốc hay tính bản quyền của các tệp tin mà Người dùng tự ý đưa vào máy Parser để trích xuất.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">3.5. Trách nhiệm Trung gian và Cơ chế Gỡ bỏ Nội dung Vi phạm (Takedown Policy)</div>
                <p class="terms-section-paragraph">
                  Shinora QuizMaster vận hành theo nguyên tắc Cảng an toàn (Safe Harbor). Chủ sở hữu bản quyền hợp pháp khi phát hiện quyền lợi bị xâm phạm chỉ cần gửi thông báo chính thức kèm chứng cứ xác minh đến địa chỉ email: <strong>vkhg.bui@gmail.com</strong>. Ban Quản trị cam kết sẽ tiến hành đối soát và thực thi gỡ bỏ ngay lập tức nội dung bị khiếu nại trong vòng <strong>24 đến 48 giờ làm việc</strong> một cách thiện chí.
                </p>
                <div class="terms-alert-box">
                  📩 <strong>Kênh Tiếp Nhận Bản Quyền:</strong> Email tiếp nhận gỡ bỏ khẩn cấp: <code>vkhg.bui@gmail.com</code> hoặc Hotline <code>0354 616 301</code>.
                </div>
              </div>
            </section>

            <!-- ĐIỀU 4 -->
            <section class="terms-card" id="dieu-4">
              <h3 class="terms-card-title">
                <span>ĐIỀU 4: QUYỀN RIÊNG TƯ, DỮ LIỆU CÁ NHÂN VÀ LƯU LƯỢNG TRUY CẬP</span>
                <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Mục 4.1 - 4.5</span>
              </h3>

              <div class="terms-section-block">
                <div class="terms-section-subheading">4.1. Nguyên tắc Thu thập Dữ liệu Tối thiểu (Data Minimization)</div>
                <p class="terms-section-paragraph">
                  Hệ thống chỉ thu thập thông tin định danh học tập cơ bản: Họ tên, MSSV, Lớp, Ngành/Khoa, Email, Mã PIN 6 số và dữ liệu bài làm. Tuyệt đối không thu thập dữ liệu nhạy cảm, không quét GPS, không truy cập danh bạ và không thu thập mật khẩu bên ngoài.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">4.2. Kiến trúc Lưu trữ Lai: Cục bộ và Đám mây (Offline-First)</div>
                <p class="terms-section-paragraph">
                  Dữ liệu học tập được ưu tiên lưu trữ trực tiếp trên bộ nhớ cục bộ (LocalStorage/SessionStorage) của trình duyệt. Việc đồng bộ lên cơ sở dữ liệu Supabase chỉ kích hoạt đối với tài khoản thành viên chính thức nhằm phục vụ lưu trữ dài hạn và Bảng xếp hạng mùa giải.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">4.3. Đo đạc Lưu lượng và Tín hiệu Trực tuyến Ẩn danh (Live Heartbeat)</div>
                <p class="terms-section-paragraph">
                  Hệ thống sử dụng Tab ID ngẫu nhiên lưu trong bộ nhớ phiên để duy trì tín hiệu nhịp tim đếm số lượng người online thời gian thực. Quá trình này hoàn toàn ẩn danh và cam kết không sử dụng bất kỳ cookie theo dõi quảng cáo của bên thứ ba nào.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">4.4. Cam kết Không Thương mại hóa và Bảo mật Thông tin</div>
                <p class="terms-section-paragraph">
                  Nền tảng tuyệt đối <strong>KHÔNG bán, không cho thuê và không chia sẻ</strong> danh sách sinh viên hay kết quả học tập cho bất kỳ bên thứ ba nào vì mục đích thương mại. Email chỉ được dùng để gửi OTP 300s và chuyển tiếp phản hồi CSKH.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">4.5. Quyền Tự quyết và Tự do Dữ liệu của Người dùng (Data Portability)</div>
                <p class="terms-section-paragraph">
                  Người dùng có toàn quyền xuất toàn bộ dữ liệu học tập và câu hỏi thành tệp tin JSON độc lập về máy bất cứ lúc nào, đồng thời sở hữu Quyền được lãng quên (Right to be Forgotten) để chủ động xóa lịch sử làm bài hoặc yêu cầu xóa vĩnh viễn tài khoản khỏi máy chủ đám mây.
                </p>
              </div>
            </section>

            <!-- ĐIỀU 5 -->
            <section class="terms-card" id="dieu-5">
              <h3 class="terms-card-title">
                <span>ĐIỀU 5: TUYÊN BỐ MIỄN TRỪ BẢO ĐẢM, GIỚI HẠN TRÁCH NHIỆM VÀ BỒI THƯỜNG</span>
                <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Mục 5.1 - 5.5</span>
              </h3>

              <div class="terms-section-block">
                <div class="terms-section-subheading">5.1. Nguyên tắc Cung cấp Nguyên trạng ("As-Is" Standard)</div>
                <p class="terms-section-paragraph">
                  Dịch vụ được cung cấp miễn phí trên nguyên tắc "Như hiện trạng" và "Tùy theo khả năng sẵn có". Ban Phát triển không đưa ra bất kỳ bảo đảm ngầm định nào về việc hệ thống sẽ không có lỗi phần mềm (bug-free) hoặc hoạt động liên tục 100% không gián đoạn.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">5.2. Miễn trừ Tuyệt đối về Kết quả Học tập và Kỳ thi Thực tế</div>
                <p class="terms-section-paragraph">
                  Toàn bộ đáp án, điểm số và thứ hạng mô phỏng trên website chỉ có giá trị tham khảo tự học. Nền tảng hoàn toàn khước từ mọi trách nhiệm pháp lý hay học vụ nếu kết quả thi cử thực tế của Người dùng tại cơ sở giáo dục không đạt như kỳ vọng hoặc có sự sai lệch so với bài thi thử.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">5.3. Miễn trừ Sự cố Hạ tầng Đám mây và Mất mát Dữ liệu</div>
                <p class="terms-section-paragraph">
                  Ban Phát triển được miễn trừ mọi trách nhiệm đối với sự cố gián đoạn dịch vụ do bảo trì Supabase, hạn mức Google Apps Script, đứt cáp mạng quốc tế hoặc lỗi thiết bị cá nhân. Người dùng cần chủ động tải file sao lưu JSON định kỳ.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">5.4. Giới hạn Trách nhiệm Tài chính Tuyệt đối (Mức Bồi Thường 0 VNĐ)</div>
                <p class="terms-section-paragraph">
                  Vì nền tảng là dự án phần mềm phi lợi nhuận và miễn phí 100%, trong phạm vi tối đa mà pháp luật cho phép, mức bồi thường trách nhiệm dân sự tối đa được ấn định tuyệt đối bằng <strong>0 VNĐ (Không đồng)</strong> đối với bất kỳ thiệt hại trực tiếp hay gián tiếp nào.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">5.5. Nghĩa vụ Giữ cho Nhà Phát triển Không bị Tổn hại (Indemnification)</div>
                <p class="terms-section-paragraph">
                  Người dùng cam kết tự chịu trách nhiệm độc lập trước pháp luật, đồng ý bảo vệ, bồi thường và giữ cho Nhà phát triển Shina (Bùi Văn Khang) cùng đội ngũ quản trị hoàn toàn không bị tổn hại trước mọi khiếu nại, tranh chấp hay chi phí pháp lý phát sinh do hành vi vi phạm của chính Người dùng.
                </p>
              </div>
            </section>

            <!-- ĐIỀU 6 -->
            <section class="terms-card" id="dieu-6">
              <h3 class="terms-card-title">
                <span>ĐIỀU 6: ĐIỀU KHOẢN THI HÀNH, LUẬT ĐIỀU CHỈNH VÀ THÔNG TIN LIÊN HỆ</span>
                <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Mục 6.1 - 6.4</span>
              </h3>

              <div class="terms-section-block">
                <div class="terms-section-subheading">6.1. Quyền Sửa đổi và Hiệu lực Cập nhật</div>
                <p class="terms-section-paragraph">
                  Ban Phát triển bảo lưu toàn quyền điều chỉnh, cập nhật các điều khoản vào bất kỳ thời điểm nào. Các sửa đổi có hiệu lực ngay khi được đăng tải công khai trên hệ thống. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc Người dùng đã chấp thuận toàn bộ thay đổi.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">6.2. Tính Độc lập Của Từng Điều khoản (Severability Clause)</div>
                <p class="terms-section-paragraph">
                  Nếu bất kỳ điều khoản nào bị cơ quan có thẩm quyền phán quyết là vô hiệu, sự vô hiệu đó chỉ giới hạn trong phần bị phán quyết. Toàn bộ các điều khoản còn lại vẫn tiếp tục duy trì nguyên vẹn giá trị pháp lý ràng buộc.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">6.3. Luật Điều chỉnh và Nguyên tắc Giải quyết Tranh chấp</div>
                <p class="terms-section-paragraph">
                  Thỏa thuận này được điều chỉnh theo nguyên tắc học thuật, quy chuẩn đạo đức sinh viên và pháp luật hiện hành của nước CHXHCN Việt Nam. Mọi bất đồng sẽ được ưu tiên giải quyết thông qua đối thoại, hòa giải trên tinh thần thiện chí và cống hiến vì giáo dục.
                </p>
              </div>

              <div class="terms-section-block">
                <div class="terms-section-subheading">6.4. Kênh Tiếp nhận và Thông tin Liên hệ Chính thức</div>
                <p class="terms-section-paragraph">
                  Thông tin đầu mối liên hệ duy nhất của nền tảng:
                </p>
                <div style="background: var(--surface-hover, #f8fafc); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-top: 8px; font-size: 13px; line-height: 1.7; color: var(--text-secondary);">
                  <div>👨‍💻 <strong>Tác giả & Lead Developer:</strong> Shina (Bùi Văn Khang)</div>
                  <div>🏷️ <strong>Biệt danh:</strong> Shina Sanora · Shinora Academic Studio</div>
                  <div>📧 <strong>Email tiếp nhận hỗ trợ & bản quyền:</strong> <a href="mailto:vkhg.bui@gmail.com" style="color: var(--brand-primary); font-weight: 700;">vkhg.bui@gmail.com</a></div>
                  <div>📞 <strong>Hotline hỗ trợ kỹ thuật:</strong> <a href="tel:0354616301" style="color: var(--brand-primary); font-weight: 700;">0354 616 301</a></div>
                  <div>⭐ <strong>Mã nguồn mở GitHub:</strong> <a href="https://github.com/VKhang-Bui/dthu-quizmaster" target="_blank" rel="noopener noreferrer" style="color: var(--brand-primary);">github.com/VKhang-Bui/dthu-quizmaster</a></div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    `;
  },

  renderRegisterView(container) {
    const draft = this.registerFormDraft || {};
    const selectedAvatar = draft.avatar || "👨‍🎓";
    const isTermsAgreed = !!draft.termsAgree;

    container.innerHTML = `
      <div class="view-register">
        <div class="auth-card">
          <div class="auth-card-header">
            <div style="font-size: 40px; margin-bottom: 6px;">🎓</div>
            <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0;">Đăng Ký Tài Khoản Học Tập</h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
              Nền tảng Tự học & Luyện thi Trắc nghiệm Thông minh
            </p>
          </div>

          <div class="auth-card-body" id="registerFormContainer">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 12.5px; color: #1e40af; line-height: 1.5;">
              ℹ️ <strong>Lưu ý:</strong> Sau khi gửi đăng ký, tài khoản sẽ ở trạng thái <strong>Chờ Phê Duyệt</strong> bởi Quản trị viên (Admin) trước khi có thể đăng nhập.
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label">Họ và tên sinh viên (*):</label>
              <input type="text" id="regFullName" class="form-control" placeholder="Ví dụ: Lê Thị Thu Thảo" value="${draft.fullName || ''}" oninput="App.saveRegisterFormDraft()">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Mã số sinh viên (MSSV) (*):</label>
                <input type="text" id="regStudentId" class="form-control" placeholder="Ví dụ: 220105888" value="${draft.studentId || ''}" oninput="App.saveRegisterFormDraft()">
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Email sinh viên / Cá nhân (*):</label>
                <input type="email" id="regEmail" class="form-control" placeholder="Ví dụ: user@gmail.com" value="${draft.email || ''}" oninput="App.saveRegisterFormDraft()">
              </div>
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label">Khoa / Chuyên ngành:</label>
              <select id="regDept" class="form-control" onchange="App.saveRegisterFormDraft()">
                ${[
                  "Khoa Nông nghiệp - Sinh học",
                  "Khoa Sư phạm Khoa học Xã hội",
                  "Khoa Sư phạm Khoa học Tự nhiên",
                  "Khoa Kỹ thuật - Công nghệ",
                  "Khoa Kinh tế - Quản trị",
                  "Khoa Ngoại ngữ",
                  "Khoa Giáo dục Tiểu học - Mầm non",
                  "Khác"
                ].map(dept => `<option value="${dept}" ${draft.department === dept ? 'selected' : ''}>${dept}</option>`).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Tạo Mã PIN Đăng nhập (6 số) (*):</label>
                <input type="password" id="regPin" class="form-control" placeholder="Mã PIN 6 số" maxlength="6" value="${draft.pinCode || ''}" oninput="App.saveRegisterFormDraft()">
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Xác nhận Mã PIN (*):</label>
                <input type="password" id="regPinConfirm" class="form-control" placeholder="Nhập lại mã PIN" maxlength="6" value="${draft.pinConfirm || ''}" oninput="App.saveRegisterFormDraft()">
              </div>
            </div>

            <!-- Avatar Picker -->
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Chọn Avatar đại diện:</label>
              <div class="avatar-picker-grid" id="regAvatarPicker">
                ${['👨‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🧪', '🧬', '🌟', '📚', '🎯', '🦁', '🦉', '🚀'].map((av) => `
                  <button type="button" class="avatar-choice-btn ${selectedAvatar === av ? 'active' : ''}" onclick="App.selectRegAvatar('${av}', this)">
                    ${av}
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="selectedRegAvatar" value="${selectedAvatar}">
            </div>

            <!-- Khối Checkbox Chấp thuận Điều khoản Bắt buộc (Clickwrap) -->
            <div class="terms-checkbox-group">
              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12.5px; line-height: 1.5; color: var(--text-secondary); margin: 0;">
                <input type="checkbox" id="regTermsAgree" onchange="App.toggleRegisterSubmitState(); App.saveRegisterFormDraft();" style="margin-top: 3px; cursor: pointer; width: 16px; height: 16px;" ${isTermsAgreed ? 'checked' : ''}>
                <span>
                  Tôi xác nhận đã đủ năng lực hành vi dân sự, đã đọc kỹ, hiểu rõ và hoàn toàn đồng ý với 
                  <a href="javascript:void(0)" onclick="App.openTermsModal()" style="color: var(--brand-primary); font-weight: 700; text-decoration: underline;" title="Nhấp để mở popup xem điều khoản ngay tại chỗ">
                    Điều khoản Dịch vụ & Thỏa thuận Sử dụng
                  </a> 
                  <span style="font-size: 11px; margin-left: 3px;">(<a href="javascript:void(0)" onclick="App.navigateToTermsFromRegister()" style="color: var(--text-tertiary); text-decoration: underline;" title="Xem toàn màn hình tại trang riêng">Xem toàn trang ↗</a>)</span>
                  của Shinora QuizMaster.
                </span>
              </label>
            </div>

            <button id="btnSubmitRegister" class="btn btn-primary" style="padding: 12px; font-size: 14px; font-weight: 700; width: 100%; opacity: ${isTermsAgreed ? '1' : '0.55'}; cursor: ${isTermsAgreed ? 'pointer' : 'not-allowed'};" onclick="App.submitRegistration()" ${isTermsAgreed ? '' : 'disabled'}>
              🚀 Gửi Yêu Cầu Đăng Ký Tài Khoản ➔
            </button>

            <div class="auth-footer-links">
              <span>Đã có tài khoản? <a href="javascript:void(0)" onclick="App.openAccountSwitcherModal()" style="color: var(--brand-primary); font-weight: 700;">Đăng nhập ngay</a></span>
              <a href="javascript:void(0)" onclick="App.openForgotPasswordModal()" style="color: var(--text-secondary);">Quên mã PIN?</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectRegAvatar(avatar, btn) {
    document.querySelectorAll("#regAvatarPicker .avatar-choice-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const hidden = document.getElementById("selectedRegAvatar");
    if (hidden) hidden.value = avatar;
    this.saveRegisterFormDraft();
  },

  toggleRegisterSubmitState() {
    const check = document.getElementById("regTermsAgree");
    const btn = document.getElementById("btnSubmitRegister");
    if (!btn) return;
    if (check && check.checked) {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    } else {
      btn.disabled = true;
      btn.style.opacity = "0.55";
      btn.style.cursor = "not-allowed";
    }
  },

  async submitRegistration() {
    const termsCheck = document.getElementById("regTermsAgree");
    if (!termsCheck || !termsCheck.checked) {
      this.showToast("⚠️ Bạn bắt buộc phải đọc và tích chọn đồng ý với Điều khoản Dịch vụ trước khi đăng ký!", "warning", 4500);
      return;
    }
    const fullName = document.getElementById("regFullName")?.value.trim();
    const studentId = document.getElementById("regStudentId")?.value.trim();
    const email = document.getElementById("regEmail")?.value.trim();
    const dept = document.getElementById("regDept")?.value;
    const pin = document.getElementById("regPin")?.value.trim();
    const pinConfirm = document.getElementById("regPinConfirm")?.value.trim();
    const avatar = document.getElementById("selectedRegAvatar")?.value || "👨‍🎓";

    if (!fullName || !studentId || !pin) {
      this.showToast("⚠️ Vui lòng điền đầy đủ Họ tên, MSSV và Mã PIN!", "warning");
      return;
    }

    if (!email) {
      this.showToast("⚠️ Vui lòng nhập địa chỉ Email của bạn!", "warning");
      return;
    }

    // Kiểm tra cấu trúc & tính hợp lệ của email chạy ẩn phía dưới
    const emailValidation = EmailService.validateEmail(email);
    if (!emailValidation.isValid) {
      this.showToast(`⚠️ ${emailValidation.message}`, "warning", 4500);
      return;
    }

    if (pin.length < 4) {
      this.showToast("⚠️ Mã PIN phải có ít nhất 4 đến 6 số!", "warning");
      return;
    }

    if (pin !== pinConfirm) {
      this.showToast("⚠️ Xác nhận mã PIN không khớp! Vui lòng nhập lại.", "warning");
      return;
    }

    this.showToast("⏳ Đang gửi hồ sơ lên CSDL Đám Mây Supabase...", "info", 1500);

    try {
      const newUser = await StorageService.registerUser({
        fullName,
        studentId,
        email,
        department: dept,
        pinCode: pin,
        avatar
      });

      this.registerFormDraft = null; // Xóa nháp sau khi gửi thành công
      const formContainer = document.getElementById("registerFormContainer");
      if (formContainer) {
        formContainer.innerHTML = `
          <div style="text-align: center; padding: 24px 10px;">
            <div style="font-size: 56px; margin-bottom: 14px; animation: pulse 1.8s infinite;">⏳</div>
            <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">Đăng Ký Thành Công!</h3>
            <div style="background: #fefce8; border: 1.5px solid #fef08a; border-radius: var(--radius-sm); padding: 16px; margin: 16px 0; text-align: left; font-size: 13px; line-height: 1.6; color: #854d0e;">
              <div>👤 <strong>Họ tên:</strong> ${newUser.fullName}</div>
              <div>🆔 <strong>MSSV:</strong> ${newUser.studentId}</div>
              <div>🏛️ <strong>Khoa:</strong> ${newUser.department}</div>
              <div>📧 <strong>Email:</strong> ${newUser.email}</div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #fde047; font-weight: 700; color: #b45309; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; animation: pulse 1s infinite;"></span>
                <span>Trạng thái: Đang chờ Quản trị viên (Shina) phê duyệt...</span>
              </div>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
              ⚡ <strong>Tự Động Kết Nối Realtime:</strong> Khi Admin bấm phê duyệt, trang web này sẽ <strong>tự động đăng nhập và đưa bạn vào phòng thi ngay lập tức</strong> mà không cần tải lại trang.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="App.navigateTo('home')">🏠 Về Trang Chủ</button>
              <button class="btn" onclick="App.openAccountSwitcherModal()">🔑 Đăng Nhập Tài Khoản Khác</button>
            </div>
          </div>
        `;
      }

      this.showToast(`🎉 Gửi yêu cầu đăng ký cho "${fullName}" thành công!`, "success", 4000);
      
      // Bắt đầu quét thời gian thực trạng thái phê duyệt từ Supabase Cloud
      this.startRegistrationLiveWatcher(newUser.studentId);
    } catch (err) {
      this.showToast("❌ " + err.message, "danger", 4000);
    }
  },

  startRegistrationLiveWatcher(studentId) {
    if (this.regWatcherInterval) {
      clearInterval(this.regWatcherInterval);
      this.regWatcherInterval = null;
    }

    if (!studentId || typeof SupabaseClient === "undefined" || !API_CONFIG.isCloudEnabled()) return;

    this.regWatcherInterval = setInterval(async () => {
      try {
        const cloudUser = await SupabaseClient.getUserByStudentId(studentId);
        if (!cloudUser) return;

        if (cloudUser.status === "active") {
          clearInterval(this.regWatcherInterval);
          this.regWatcherInterval = null;

          const mapped = {
            id: cloudUser.id,
            studentId: cloudUser.student_id,
            className: cloudUser.class_name || "",
            fullName: cloudUser.full_name,
            email: cloudUser.email,
            phone: cloudUser.phone || "",
            department: cloudUser.department || "Khoa Kỹ thuật - Công nghệ",
            role: cloudUser.role || "student",
            pinCode: cloudUser.pin_code || "123456",
            avatar: cloudUser.avatar || "👨‍🎓",
            totalExp: cloudUser.total_exp || 50,
            streakDays: 1,
            quizzesCompleted: 0,
            status: "active",
            permissions: cloudUser.permissions || {},
            approvedBy: cloudUser.approved_by || "Admin Shina",
            approvedAt: cloudUser.approved_at,
            createdAt: cloudUser.created_at
          };
          StorageService.updateUser(mapped.id, mapped);
          StorageService.saveUserProfile(mapped);

          const formContainer = document.getElementById("registerFormContainer");
          if (formContainer) {
            formContainer.innerHTML = `
              <div style="text-align: center; padding: 32px 16px;">
                <div style="font-size: 64px; margin-bottom: 12px; animation: bounce 1s infinite;">🎉</div>
                <h3 style="font-size: 22px; font-weight: 800; color: #16a34a; margin-bottom: 8px;">Tài Khoản Đã Được Phê Duyệt!</h3>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
                  Chúc mừng <strong>${mapped.fullName}</strong> (MSSV: <strong>${mapped.studentId}</strong>) đã được Admin duyệt tham gia hệ thống!<br>
                  Đang tự động đăng nhập và đưa bạn vào Trang chủ trong giây lát...
                </p>
                <button class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;" onclick="App.navigateTo('home')">
                  🚀 Vào Trang Chủ Ngay ➔
                </button>
              </div>
            `;
          }

          App.renderHeader();
          App.showToast(`🎉 Chúc mừng ${mapped.fullName}! Tài khoản của bạn đã được Admin phê duyệt!`, "success", 5000);

          setTimeout(() => {
            if (App.currentView === "register") {
              App.navigateTo("home");
            }
          }, 1800);
        } else if (cloudUser.status === "rejected") {
          clearInterval(this.regWatcherInterval);
          this.regWatcherInterval = null;
          const formContainer = document.getElementById("registerFormContainer");
          if (formContainer) {
            formContainer.innerHTML = `
              <div style="text-align: center; padding: 32px 16px;">
                <div style="font-size: 54px; margin-bottom: 12px;">❌</div>
                <h3 style="font-size: 20px; font-weight: 800; color: #dc2626; margin-bottom: 8px;">Hồ Sơ Không Được Phê Duyệt</h3>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
                  Rất tiếc, hồ sơ đăng ký của bạn không được Quản trị viên chấp thuận.
                </p>
                <button class="btn" onclick="App.navigateTo('register')">🔄 Thử Đăng Ký Lại</button>
              </div>
            `;
          }
          App.showToast("❌ Hồ sơ đăng ký của bạn không được Admin chấp thuận.", "danger", 4500);
        }
      } catch (e) {
        console.warn("[Live Watcher Error]:", e);
      }
    }, 2500);
  },

  scrollToTermsSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const headerOffset = 80;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + (window.pageYOffset || window.scrollY || 0) - headerOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
});
