/**
 * DATA LOADER SERVICE
 * Tự động nạp dữ liệu từ thư mục data/ (data/official, data/drafts, data/materials).
 * Có cơ chế Graceful Fallback để web luôn hoạt động ngay cả khi mở file:// offline.
 */

const DataLoader = {
  // Dữ liệu nhúng dự phòng khi mở qua file:// không hỗ trợ fetch CORS
  FALLBACK_OFFICIAL: [
    {
      id: "CNXHKH",
      code: "POL102",
      name: "Chủ nghĩa Xã hội Khoa học",
      department: "Lý luận Chính trị",
      author: "Shina (Bùi Văn Khang)",
      description: "Bộ câu hỏi ôn tập và thi thử chuẩn môn Chủ nghĩa Xã hội Khoa học gồm đầy đủ 7 chương.",
      icon: "📕",
      status: "official",
      chapters: [
        { id: "c1", name: "Chương 1: Nhập môn Chủ nghĩa Xã hội Khoa học" },
        { id: "c2", name: "Chương 2: Sứ mệnh lịch sử của giai cấp công nhân" },
        { id: "c3", name: "Chương 3: Chủ nghĩa xã hội và thời kỳ quá độ lên CNXH" },
        { id: "c4", name: "Chương 4: Dân chủ XHCN và Nhà nước XHCN" },
        { id: "c5", name: "Chương 5: Cơ cấu xã hội - giai cấp và liên minh trong thời kỳ quá độ" },
        { id: "c6", name: "Chương 6: Vấn đề dân tộc và tôn giáo trong thời kỳ quá độ" },
        { id: "c7", name: "Chương 7: Vấn đề gia đình trong thời kỳ quá độ lên CNXH" }
      ],
      questions: (typeof DEFAULT_SUBJECTS !== "undefined" && DEFAULT_SUBJECTS[0]) ? DEFAULT_SUBJECTS[0].questions : []
    },
    {
      id: "TRIET_HOC",
      code: "POL101",
      name: "Triết học Mác - Lênin",
      department: "Lý luận Chính trị",
      author: "Shinora Academic Community",
      description: "Ngân hàng trắc nghiệm Triết học Mác - Lênin (Chủ nghĩa duy vật biện chứng và duy vật lịch sử).",
      icon: "🏛️",
      status: "official",
      chapters: [
        { id: "c1", name: "Chương 1: Triết học và vai trò trong đời sống" },
        { id: "c2", name: "Chương 2: Chủ nghĩa duy vật biện chứng" },
        { id: "c3", name: "Chương 3: Chủ nghĩa duy vật lịch sử" }
      ],
      questions: (typeof DEFAULT_SUBJECTS !== "undefined" && DEFAULT_SUBJECTS[1]) ? DEFAULT_SUBJECTS[1].questions : []
    },
    {
      id: "VI_SINH",
      code: "BIO201",
      name: "Vi sinh vật học đại cương",
      department: "Khoa học Tự nhiên",
      author: "Shina (Bùi Văn Khang)",
      description: "Bộ câu hỏi ôn thi môn Vi sinh vật học đại cương tham khảo dành cho sinh viên ngành Sinh học.",
      icon: "🔬",
      status: "official",
      chapters: [
        { id: "c1", name: "Chương 1: Hình thái và cấu tạo tế bào vi sinh vật" },
        { id: "c2", name: "Chương 2: Dinh dưỡng và trao đổi chất" },
        { id: "c3", name: "Chương 3: Sinh trưởng và phát triển của vi sinh vật" }
      ],
      questions: (typeof DEFAULT_SUBJECTS !== "undefined" && DEFAULT_SUBJECTS[2]) ? DEFAULT_SUBJECTS[2].questions : []
    }
  ],

  FALLBACK_DRAFTS: [
    {
      id: "DRAFT_HOA_SINH",
      code: "BIO205",
      name: "Hóa sinh học đại cương (Bản Thử Nghiệm)",
      department: "Khoa Sư phạm Khoa học Tự nhiên",
      author: "Nguyễn Văn An (K48 CNSH)",
      description: "Đề ôn tập chuyển hóa Glucid và Lipid do sinh viên K48 đóng góp, đang chờ thẩm định bổ sung.",
      icon: "🧪",
      status: "draft",
      submissionDate: "2026-08-15",
      chapters: [
        { id: "c1", name: "Chương 1: Cấu tạo và chuyển hóa Glucid" },
        { id: "c2", name: "Chương 2: Cấu tạo và chuyển hóa Lipid" }
      ],
      questions: [
        {
          id: "HS-001",
          chapterId: "c1",
          question: "Quá trình đường phân (Glycolysis) xảy ra ở vị trí nào trong tế bào?",
          options: [
            { text: "Bào tương (Cytosol)", isCorrect: true, note: "Quá trình đường phân diễn ra hoàn toàn trong tế bào chất (bào tương)." },
            { text: "Chất nền ty thể", isCorrect: false, note: "Chất nền ty thể là nơi diễn ra chu trình Krebs." },
            { text: "Màng trong ty thể", isCorrect: false, note: "Màng trong ty thể là nơi diễn ra chuỗi truyền điện tử hô hấp." },
            { text: "Nhân tế bào", isCorrect: false, note: "Nhân tế bào không phải nơi diễn ra đường phân." }
          ],
          answerIndex: 0
        },
        {
          id: "HS-002",
          chapterId: "c1",
          question: "Sản phẩm cuối cùng của quá trình đường phân từ 1 phân tử Glucose trong điều kiện hiếu khí là gì?",
          options: [
            { text: "2 phân tử Pyruvate, 2 ATP và 2 NADH", isCorrect: true, note: "1 Glucose (6C) bị bẻ gãy tạo 2 Pyruvate (3C) kèm 2 ATP ròng và 2 NADH." },
            { text: "2 phân tử Lactate và 4 ATP", isCorrect: false, note: "Lactate chỉ tạo thành trong điều kiện kỵ khí (lên men lactic)." },
            { text: "1 Acetyl-CoA và 1 CO2", isCorrect: false, note: "Đây là phản ứng oxy hóa pyruvate tại ty thể." },
            { text: "Ethanol và CO2", isCorrect: false, note: "Đây là sản phẩm lên men rượu của nấm men." }
          ],
          answerIndex: 0
        }
      ]
    },
    {
      id: "DRAFT_TOAN_CC",
      code: "MAT101",
      name: "Toán Cao Cấp A1 (Bản Thử Nghiệm)",
      department: "Khoa Sư phạm Toán - Tin",
      author: "Lê Hoàng Phúc (K47 Sư phạm Toán)",
      description: "Đề ôn tập Ma trận và Định thức do sinh viên đóng góp, đang chờ Ban biên tập duyệt.",
      icon: "📐",
      status: "draft",
      submissionDate: "2026-08-16",
      chapters: [
        { id: "c1", name: "Chương 1: Ma trận và Định thức" },
        { id: "c2", name: "Chương 2: Hệ phương trình tuyến tính" }
      ],
      questions: [
        {
          id: "TCC-001",
          chapterId: "c1",
          question: "Điều kiện để ma trận vuông A khả nghịch (tồn tại ma trận nghịch đảo A⁻¹) là gì?",
          options: [
            { text: "Định thức det(A) ≠ 0", isCorrect: true, note: "Ma trận vuông khả nghịch khi và chỉ khi det(A) khác 0 (ma trận không suy biến)." },
            { text: "Định thức det(A) = 0", isCorrect: false, note: "Nếu det(A) = 0 thì ma trận suy biến và không khả nghịch." },
            { text: "Tất cả các phần tử trên đường chéo chính phải bằng 1", isCorrect: false, note: "Đây là đặc điểm của ma trận đơn vị, không phải điều kiện chung." },
            { text: "Vết của ma trận tr(A) > 0", isCorrect: false, note: "Vết ma trận không quyết định tính khả nghịch." }
          ],
          answerIndex: 0
        }
      ]
    }
  ],

  FALLBACK_FOLDERS: [
    {
      id: "fld-llct",
      parentId: null,
      name: "Khoa Lý Luận Chính Trị",
      icon: "🏛️",
      description: "Các môn lý luận chính trị Mác - Lênin & Tư tưởng Hồ Chí Minh"
    },
    {
      id: "fld-pol102",
      parentId: "fld-llct",
      name: "Chủ nghĩa Xã hội Khoa học (POL102)",
      icon: "📕",
      description: "Lý luận về sứ mệnh GCCN, thời kỳ quá độ, dân chủ và nhà nước XHCN"
    },
    {
      id: "fld-pol101",
      parentId: "fld-llct",
      name: "Triết học Mác - Lênin (POL101)",
      icon: "📘",
      description: "Thế giới quan duy vật biện chứng, phép biện chứng và duy vật lịch sử"
    },
    {
      id: "fld-pol103",
      parentId: "fld-llct",
      name: "Kinh tế Chính trị Mác - Lênin (POL103)",
      icon: "📙",
      description: "Sản xuất hàng hóa, quy luật giá trị và học thuyết giá trị thặng dư"
    },
    {
      id: "fld-pol104",
      parentId: "fld-llct",
      name: "Tư tưởng Hồ Chí Minh (POL104)",
      icon: "📗",
      description: "Tư tưởng về độc lập dân tộc, CNXH, đại đoàn kết và nhà nước của dân"
    },
    {
      id: "fld-pol105",
      parentId: "fld-llct",
      name: "Lịch sử Đảng Cộng sản Việt Nam (POL105)",
      icon: "📔",
      description: "Các mốc lịch sử, đường lối cách mạng và công cuộc Đổi mới 1986"
    },
    {
      id: "fld-khtn",
      parentId: null,
      name: "Khoa KHTN & Y Sinh",
      icon: "🔬",
      description: "Các môn khoa học sinh học, vi sinh vật và hóa sinh"
    },
    {
      id: "fld-bio201",
      parentId: "fld-khtn",
      name: "Vi sinh vật học đại cương (BIO201)",
      icon: "🧫",
      description: "Hình thái, sinh lý, nhuộm Gram và nuôi cấy vi sinh vật"
    },
    {
      id: "fld-bio205",
      parentId: "fld-khtn",
      name: "Hóa sinh học đại cương (BIO205)",
      icon: "🧪",
      description: "Cấu trúc Protein, Enzyme, chuyển hóa Glucid và chu trình Krebs"
    },
    {
      id: "fld-toan-tin",
      parentId: null,
      name: "Khoa Toán - Tin Học",
      icon: "📐",
      description: "Toán cao cấp, kỹ năng số và tin học đại cương"
    },
    {
      id: "fld-mat101",
      parentId: "fld-toan-tin",
      name: "Toán Cao Cấp (MAT101)",
      icon: "📊",
      description: "Ma trận, định thức, hệ phương trình tuyến tính và vi tích phân"
    },
    {
      id: "fld-it101",
      parentId: "fld-toan-tin",
      name: "Tin học & Kỹ năng số",
      icon: "💻",
      description: "Hệ thống máy tính, phím tắt và các hàm tính toán Excel"
    }
  ],

  FALLBACK_MATERIALS: [
    {
      id: "mat-cnxhkh",
      folderId: "fld-pol102",
      subjectId: "CNXHKH",
      title: "Tóm tắt lý thuyết trọng tâm 7 chương - CNXHKH",
      fileType: "md",
      author: "Shina (Bùi Văn Khang)",
      readTimeMin: 6,
      wordCount: 1850,
      tags: ["CNXHKH", "Chính trị", "Trọng tâm 7 chương"],
      description: "Đầy đủ định nghĩa, tiền đề kinh tế - xã hội và sứ mệnh lịch sử của giai cấp công nhân.",
      filePath: "data/materials/cnxhkh-tom-tat.txt",
      content: `# 📕 TÓM TẮT TRỌNG TÂM 7 CHƯƠNG: CHỦ NGHĨA XÃ HỘI KHOA HỌC (POL102)

> **Tác giả:** Shina (Bùi Văn Khang) · **Cập nhật:** 2026 · **Dành cho sinh viên:** Đại cương toàn trường

---

## 📑 MỤC LỤC TRỌNG TÂM
- [Chương 1: Nhập môn Chủ nghĩa Xã hội Khoa học](#chuong-1)
- [Chương 2: Sứ mệnh lịch sử của Giai cấp Công nhân](#chuong-2)
- [Chương 3: Chủ nghĩa Xã hội và Thời kỳ Quá độ](#chuong-3)
- [Chương 4: Dân chủ XHCN và Nhà nước XHCN](#chuong-4)
- [Chương 5: Cơ cấu Xã hội - Giai cấp trong Thời kỳ Quá độ](#chuong-5)
- [Chương 6: Vấn đề Dân tộc và Tôn giáo](#chuong-6)
- [Chương 7: Vấn đề Gia đình trong Thời kỳ Quá độ](#chuong-7)

---

<h2 id="chuong-1">CHƯƠNG 1: NHẬP MÔN CHỦ NGHĨA XÃ HỘI KHOA HỌC</h2>

### 1. Định nghĩa khoa học
- **Nghĩa rộng:** CNXHKH là toàn bộ chủ nghĩa Mác - Lênin.
- **Nghĩa hẹp:** Là một trong ba bộ phận cấu thành chủ nghĩa Mác - Lênin (*Triết học, Kinh tế chính trị, CNXHKH*).

### 2. Điều kiện kinh tế - xã hội ra đời
- **Bối cảnh:** Thập niên 40 của thế kỷ XIX, Cách mạng công nghiệp phát triển mạnh mẽ tạo ra nền đại công nghiệp cơ khí.
- **Mâu thuẫn cơ bản:** Lực lượng sản xuất (xã hội hóa ngày càng cao) mâu thuẫn gay gắt với Quan hệ sản xuất (chiếm hữu tư nhân TBCN).
- **3 phong trào công nhân lịch sử:**
  1. *Phong trào Hiến chương ở Anh (1836 - 1848)*.
  2. *Khởi nghĩa công nhân dệt Lion ở Pháp (1831: Kinh tế; 1834: Chính trị)*.
  3. *Khởi nghĩa thợ dệt Xilêdi ở Đức (1844)*.

### 3. Tiền đề khoa học tự nhiên & tư tưởng lý luận
- **3 phát minh khoa học tự nhiên thế kỷ XIX:**
  - Định luật bảo toàn và chuyển hóa năng lượng (Lômônôxốp & Mayer).
  - Học thuyết tế bào (Slâyđen & Svan).
  - Thuyết tiến hóa của Charles Darwin (1859).
- **3 tiền đề tư tưởng lý luận:**
  - Triết học cổ điển Đức (*Hêghen & Phoiơbắc*).
  - Kinh tế chính trị học cổ điển Anh (*Adam Smith & David Ricardo*).
  - Chủ nghĩa xã hội không tưởng - phê phán Pháp & Anh (*Xanh Ximông, Sáclơ Phuriê, Rôbớt Ôoen*).

---

<h2 id="chuong-2">CHƯƠNG 2: SỨ MỆNH LỊCH SỬ CỦA GIAI CẤP CÔNG NHÂN</h2>

### 1. Khái niệm và đặc điểm giai cấp công nhân
- Là tập đoàn xã hội gắn liền với **lực lượng sản xuất tiên tiến nhất**, nền đại công nghiệp hiện đại.
- **Về quan hệ sản xuất:** Là người làm thuê, không có hoặc về cơ bản không có tư liệu sản xuất, phải bán sức lao động để kiếm sống và bị nhà tư bản bóc lột giá trị thặng dư.

### 2. Nội dung sứ mệnh lịch sử
- **Nội dung kinh tế:** Là lực lượng sản xuất cơ bản, giải phóng LLSX, xây dựng QHSX mới XHCN.
- **Nội dung chính trị - xã hội:** Lật đổ sự thống trị của giai cấp tư sản, giành chính quyền về tay nhân dân, xây dựng nhà nước kiểu mới (Nhà nước chuyên chính vô sản / Dân chủ XHCN).
- **Nội dung văn hóa, tư tưởng:** Xây dựng hệ tư tưởng tiên tiến của giai cấp công nhân (Chủ nghĩa Mác - Lênin), xây dựng nền văn hóa mới xã hội chủ nghĩa.

### 3. Điều kiện quy định sứ mệnh lịch sử
- **Điều kiện khách quan:** Do địa vị kinh tế - xã hội và đặc điểm chính trị - xã hội của GCCN quy định (*tính tổ chức, kỷ luật cao, tinh thần quốc tế chân chính*).
- **Điều kiện chủ quan:** Sự phát triển của bản thân giai cấp công nhân và vai trò lãnh đạo tối cao của **Đảng Cộng sản**.

---

<h2 id="chuong-3">CHƯƠNG 3: CHỦ NGHĨA XÃ HỘI VÀ THỜI KỲ QUÁ ĐỘ LÊN CNXH</h2>

### 1. Hai hình thức quá độ
1. **Quá độ trực tiếp:** Từ CNTB phát triển lên CNXH (*chưa từng diễn ra trên thực tế*).
2. **Quá độ gián tiếp:** Từ nước tư bản trung bình hoặc tiền tư bản bỏ qua chế độ TBCN tiến lên CNXH (*Việt Nam, Trung Quốc, Cuba...*).

### 2. Đặc điểm thời kỳ quá độ
- Tồn tại đan xen giữa những nhân tố của xã hội mới và tàn dư của xã hội cũ trên tất cả các lĩnh vực: kinh tế (nhiều thành phần kinh tế), chính trị (đấu tranh giai cấp phức tạp), văn hóa - tư tưởng (tồn tại nhiều tư tưởng cũ và mới).

---

<h2 id="chuong-4">CHƯƠNG 4: DÂN CHỦ XHCN VÀ NHÀ NƯỚC XHCN</h2>

### 1. Bản chất của nền Dân chủ XHCN
- **Bản chất chính trị:** Quyền lực thuộc về nhân dân, do Đảng Cộng sản lãnh đạo.
- **Bản chất kinh tế:** Dựa trên chế độ công hữu về các tư liệu sản xuất chủ yếu.
- **Bản chất tư tưởng - văn hóa:** Lấy chủ nghĩa Mác - Lênin làm nền tảng kim chỉ nam.

### 2. Nhà nước pháp quyền XHCN Việt Nam
- Là nhà nước **của Nhân dân, do Nhân dân, vì Nhân dân**.
- Hoạt động theo nguyên tắc: Quyền lực nhà nước là thống nhất, có sự phân công, phối hợp, kiểm soát giữa các cơ quan trong việc thực hiện quyền lập pháp, hành pháp và tư pháp.`
    },
    {
      id: "mat-triethoc",
      folderId: "fld-pol101",
      subjectId: "TRIET_HOC",
      title: "Cẩm nang 2 Nguyên Lý, 3 Quy Luật & 6 Cặp Phạm Trù - Triết học Mác",
      fileType: "md",
      author: "Shina (Bùi Văn Khang)",
      readTimeMin: 7,
      wordCount: 2100,
      tags: ["Triết học", "Mác - Lênin", "Phép biện chứng", "Quy luật"],
      description: "Tổng hợp cốt lõi Phép biện chứng duy vật và Chủ nghĩa duy vật lịch sử.",
      content: `# 📘 CẨM NANG TOÀN DIỆN PHÉP BIỆN CHỨNG DUY VẬT (POL101)

> **Tác giả:** Shina (Bùi Văn Khang) · **Bộ môn:** Triết học Mác - Lênin

---

## 🌟 PHẦN 1: HAI NGUYÊN LÝ CƠ BẢN
1. **Nguyên lý về Mối liên hệ phổ biến:**
   - Mọi sự vật, hiện tượng trong vũ trụ không tồn tại cô lập mà luôn liên hệ, ràng buộc, chuyển hóa lẫn nhau.
   - *Ý nghĩa phương pháp luận:* Quan điểm toàn diện và quan điểm lịch sử - cụ thể.
2. **Nguyên lý về Sự phát triển:**
   - Phát triển là quá trình vận động đi lên từ thấp đến cao, từ đơn giản đến phức tạp, từ kém hoàn thiện đến hoàn thiện hơn.
   - *Ý nghĩa phương pháp luận:* Quan điểm phát triển.

---

## ⚡ PHẦN 2: BA QUY LUẬT CƠ BẢN CỦA PHÉP BIỆN CHỨNG

### 1. Quy luật Chuyển hóa từ những thay đổi về Lượng dẫn đến những thay đổi về Chất và ngược lại
- **Chất:** Là tính quy định khách quan vốn có của sự vật, là sự thống nhất hữu cơ giữa các thuộc tính.
- **Lượng:** Tính quy định khách quan về quy mô, tốc độ, số lượng, trình độ phát triển.
- **Độ:** Giới hạn mà trong đó sự thay đổi về lượng chưa làm thay đổi căn bản về chất.
- **Điểm nút:** Thời điểm mà tại đó sự thay đổi về lượng đủ để làm thay đổi chất.
- **Bước nhảy:** Quá trình chuyển hóa về chất của sự vật do những thay đổi về lượng trước đó gây nên.

### 2. Quy luật Thống nhất và Đấu tranh của các Mặt đối lập (Quy luật Mâu thuẫn)
- *Là hạt nhân của phép biện chứng duy vật*, chỉ ra **nguồn gốc và động lực bên trong** của sự phát triển.
- Mâu thuẫn biện chứng gồm 2 mặt đối lập vừa thống nhất (nương tựa nhau) vừa đấu tranh (bài trừ, phủ định nhau).

### 3. Quy luật Phủ định của Phủ định
- Chỉ ra **khuynh hướng phát triển** của sự vật: Diễn ra theo hình **xoắn ốc** (tiến lên nhưng lặp lại một số đặc trưng ở trình độ cao hơn).

---

## 🧩 PHẦN 3: SÁU CẶP PHẠM TRÙ BIỆN CHỨNG
1. **Cái riêng và Cái chung:** Cái chung chỉ tồn tại trong cái riêng; Cái riêng chỉ tồn tại trong mối liên hệ với cái chung.
2. **Nguyên nhân và Kết quả:** Nguyên nhân sinh ra kết quả; Nguyên nhân luôn có trước kết quả.
3. **Tất nhiên và Ngẫu nhiên:** Tất nhiên vạch đường đi cho mình thông qua vô số ngẫu nhiên.
4. **Nội dung và Hình thức:** Nội dung quyết định hình thức; Hình thức tác động trở lại nội dung.
5. **Bản chất và Hiện tượng:** Bản chất bộc lộ qua hiện tượng; Hiện tượng phản ánh bản chất.
6. **Khả năng và Hiện thực:** Khả năng biến thành hiện thực khi có đủ điều kiện khách quan và nhân tố chủ quan.`
    },
    {
      id: "mat-ktct",
      folderId: "fld-pol103",
      subjectId: "KTCT",
      title: "Bản đồ tư duy Hàng hóa, Tiền tệ & Giá trị thặng dư - KTCT Mác",
      fileType: "md",
      author: "Shina (Bùi Văn Khang)",
      readTimeMin: 5,
      wordCount: 1600,
      tags: ["Kinh tế chính trị", "Hàng hóa", "Giá trị thặng dư", "Quy luật giá trị"],
      description: "2 thuộc tính hàng hóa, 2 tính chất lao động, công thức chung tư bản và bản chất bóc lột m.",
      content: `# 📙 BẢN ĐỒ TƯ DUY KINH TẾ CHÍNH TRỊ MÁC - LÊNIN (POL103)

## 📦 1. HÀNG HÓA VÀ HAI THUỘC TÍNH
- **Hàng hóa:** Sản phẩm của lao động, thỏa mãn nhu cầu con người và đem ra trao đổi, mua bán.
- **2 Thuộc tính:**
  1. *Giá trị sử dụng:* Công dụng của vật phẩm nhằm thỏa mãn nhu cầu (thuộc tính tự nhiên).
  2. *Giá trị hàng hóa:* Lao động xã hội của người sản xuất kết tinh trong hàng hóa (thuộc tính xã hội).

## 🔨 2. TÍNH CHẤT HAI MẶT CỦA LAO ĐỘNG SẢN XUẤT HÀNG HÓA
- **Lao động cụ thể:** Tạo ra *Giá trị sử dụng* của hàng hóa.
- **Lao động trừu tượng:** Tạo ra *Giá trị* của hàng hóa.

## 💰 3. HỌC THUYẾT GIÁ TRỊ THẶNG DƯ (m)
- **Công thức chung của tư bản:** \`T - H - T'\` (với \`T' = T + \Delta T\`, trong đó \`\Delta T = m\`).
- **Hàng hóa sức lao động:** Có giá trị sử dụng đặc biệt là khi sử dụng thì **tạo ra một lượng giá trị lớn hơn bản thân nó** -> Nguồn gốc duy nhất sinh ra giá trị thặng dư ($m$).
- **Phân chia tư bản:**
  - *Tư bản bất biến ($c$):* Mua tư liệu sản xuất, giá trị bảo tồn không tăng thêm.
  - *Tư bản khả biến ($v$):* Mua sức lao động, giá trị tăng lên tạo ra $m$.
- **Hai phương pháp sản xuất giá trị thặng dư:**
  1. *Giá trị thặng dư tuyệt đối:* Kéo dài ngày lao động vượt quá thời gian lao động tất yếu.
  2. *Giá trị thặng dư tương đối:* Rút ngắn thời gian lao động tất yếu bằng cách tăng năng suất lao động xã hội.`
    },
    {
      id: "mat-visinh",
      folderId: "fld-bio201",
      subjectId: "VI_SINH",
      title: "Bảng tra cứu thuật ngữ & khái niệm trọng tâm - Vi sinh vật học",
      fileType: "md",
      author: "Shina (Bùi Văn Khang)",
      readTimeMin: 5,
      wordCount: 1400,
      tags: ["Vi sinh", "Nhuộm Gram", "Peptidoglycan", "Pha sinh trưởng"],
      description: "Tra cứu cấu trúc peptidoglycan, cơ chế nhuộm Gram và 4 pha sinh trưởng vi sinh vật.",
      filePath: "data/materials/vi-sinh-thuat-ngu.txt",
      content: `# 🧫 CẨM NANG THUẬT NGỮ TRỌNG TÂM: VI SINH VẬT HỌC (BIO201)

## 🔬 1. CẤU TRÚC TẾ BÀO VI SINH VẬT
- **Peptidoglycan (Murein):**
  - Bản chất: Đại phân tử dạng lưới gồm các chuỗi glycan (NAG - NAM) liên kết bởi cầu nối tetrapeptide.
  - Chức năng: Tạo khung cơ học vững chắc, quy định hình dạng và bảo vệ áp suất thẩm thấu.

- **Nhuộm Gram (Gram Staining):**
  - **Gram dương (Gram+):** Thành peptidoglycan dày (20 - 80nm), có acid teichoic, giữ màu **TÍM** của tinh thể tím (Crystal Violet).
  - **Gram âm (Gram-):** Thành peptidoglycan mỏng (2 - 7nm), có màng ngoài chứa Lipopolysaccharide (LPS - nội độc tố), bắt màu **HỒNG/ĐỎ** của Safranin.

---

## 📈 2. ĐƯỜNG CONG SINH TRƯỞNG TRONG HỆ NUÔI CẤY KÍN
1. **Pha tiềm phát (Lag phase):** Vi khuẩn thích ứng với môi trường mới, tổng hợp enzyme, chưa phân chia.
2. **Pha lũy thừa / Số mũ (Log phase):** Tốc độ sinh trưởng cực đại, thời gian thế hệ ($g$) hằng số -> *Thời điểm tốt nhất để thu sinh khối và nghiên cứu*.
3. **Pha cân bằng (Stationary phase):** Số lượng tế bào sinh ra bằng số lượng tế bào chết đi, chất dinh dưỡng cạn dần, chất độc tích lũy.
4. **Pha suy vong (Death phase):** Số lượng tế bào chết vượt số lượng tế bào sinh ra do cạn kiệt dinh dưỡng và tự phân giải.`
    },
    {
      id: "mat-hoasinh",
      folderId: "fld-bio205",
      subjectId: "HOA_SINH",
      title: "Sơ đồ chuyển hóa Glucid, Lipid & Chu trình Krebs - Hóa sinh học",
      fileType: "md",
      author: "Shina (Bùi Văn Khang)",
      readTimeMin: 6,
      wordCount: 1700,
      tags: ["Hóa sinh", "Krebs", "Enzyme", "Glucid", "ATP"],
      description: "Đường phân (Glycolysis), chu trình Acid Citric (Krebs) và chuỗi hô hấp tế bào.",
      content: `# 🧪 SƠ ĐỒ CHUYỂN HÓA NĂNG LƯỢNG & CHU TRÌNH KREBS (BIO205)

## ⚡ 1. ĐƯỜNG PHÂN (GLYCOLYSIS)
- Diễn ra tại: **Bào tương (Cytosol)** của tế bào.
- Từ 1 phân tử Glucose (6C) chuyển hóa thành **2 phân tử Pyruvate (3C)**.
- Năng lượng thu được ròng: **2 ATP + 2 NADH**.

---

## 🔄 2. CHU TRÌNH ACID CITRIC (CHU TRÌNH KREBS)
- Diễn ra tại: **Chất nền ty thể (Mitochondrial Matrix)**.
- Nguyên liệu đầu vào: **Acetyl-CoA (2C)** kết hợp với **Oxaloacetate (4C)** tạo thành **Citrate (6C)** dưới xúc tác của Citrate Synthase.
- Sản phẩm của 1 vòng Krebs (tính cho 1 Acetyl-CoA):
  - **3 NADH** (~ 7.5 ATP)
  - **1 FADH2** (~ 1.5 ATP)
  - **1 GTP / ATP**
  - **2 CO2**

---

## 🔋 3. TỔNG NĂNG LƯỢNG KHI OXY HÓA HOÀN TOÀN 1 GLUCOSE
- Trong điều kiện hiếu khí: 1 Glucose tạo ra **30 - 32 ATP**.
- Trong điều kiện kỵ khí (Lên men Lactic / Ethanol): Chỉ tạo ra **2 ATP** ròng.`
    },
    {
      id: "mat-toancc",
      folderId: "fld-mat101",
      subjectId: "TOAN_CC",
      title: "Sổ tay công thức Ma Trận, Định Thức & Hệ Phương Trình Tuyến Tính",
      fileType: "md",
      author: "Shina (Bùi Văn Khang)",
      readTimeMin: 6,
      wordCount: 1500,
      tags: ["Toán cao cấp", "Đại số tuyến tính", "Ma trận", "Định thức", "Cramer"],
      description: "Các phép toán ma trận, tính định thức cấp n, hạng ma trận và giải hệ Cramer / Gauss.",
      content: `# 📊 SỔ TAY ĐẠI SỐ TUYẾN TÍNH & TOÁN CAO CẤP (MAT101)

## 📐 1. PHÉP TOÁN MA TRẬN
- **Điều kiện nhân 2 ma trận:** Muốn nhân $A_{m \\times n}$ với $B_{p \\times q}$ thì bắt buộc $n = p$. Ma trận tích $C = A \\times B$ có kích thước $m \\times q$.
- **Tính chất chuyển vị:**
  - $(A^T)^T = A$
  - $(A + B)^T = A^T + B^T$
  - $(A \\times B)^T = B^T \\times A^T$ (*đảo thứ tự!*)

---

## 🧮 2. TÍNH ĐỊNH THỨC (DETERMINANT)
- **Quy tắc đổi dòng/cột:** Đổi chỗ 2 dòng (hoặc 2 cột) thì định thức **đổi dấu**.
- Nhân một dòng với số $k$ thì định thức nhân với $k$: $\\det(kA) = k^n \\det(A)$ (với $A$ cấp $n$).
- Nếu ma trận có 2 dòng (cột) tỷ lệ hoặc bằng nhau thì $\\det(A) = 0$.

---

## ⚖️ 3. GIẢI HỆ PHƯƠNG TRÌNH TUYẾN TÍNH (ĐỊNH LÝ KRONECKER - CAPELLI)
- Hệ phương trình $Ax = b$ có nghiệm khi và chỉ khi: $\\text{rank}(A) = \\text{rank}(\\bar{A})$ (với $\\bar{A} = [A|b]$ là ma trận bổ sung).
  - Nếu $\\text{rank}(A) < \\text{rank}(\\bar{A})$: Hệ **vô nghiệm**.
  - Nếu $\\text{rank}(A) = \\text{rank}(\\bar{A}) = n$ (số ẩn): Hệ có **nghiệm duy nhất** (có thể dùng quy tắc Cramer nếu $A$ vuông và $\\det(A) \\neq 0$).
  - Nếu $\\text{rank}(A) = \\text{rank}(\\bar{A}) = r < n$: Hệ có **vô số nghiệm** phụ thuộc $n - r$ ẩn tự do.`
    },
    {
      id: "mat-it-excel",
      folderId: "fld-it101",
      subjectId: "IT101",
      title: "Cẩm nang các hàm Excel & Phím tắt tin học văn phòng trọng điểm",
      fileType: "md",
      author: "Shina (Bùi Văn Khang)",
      readTimeMin: 4,
      wordCount: 1200,
      tags: ["Tin học", "Excel", "Phím tắt", "Hàm logic"],
      description: "Tổng hợp các hàm VLOOKUP, INDEX/MATCH, COUNTIF, SUMIFS và mẹo xử lý bảng tính.",
      content: `# 💻 CẨM NANG HÀM EXCEL & PHÍM TẮT THÔNG DỤNG (IT101)

## 🚀 1. PHÍM TẮT BẤT HỦ
- \`F4\`: Cố định ô tham chiếu tuyệt đối (\`$A$1\`) hoặc lặp lại thao tác vừa thực hiện.
- \`Ctrl + Shift + L\`: Bật / tắt nhanh bộ lọc (Filter).
- \`Alt + =\`: Tự động điền hàm tính tổng (\`=SUM(...)\`).
- \`Ctrl + ;\`: Điền nhanh ngày tháng hiện tại.

---

## 📊 2. CÁC HÀM TRA CỨU & THỐNG KÊ
- **VLOOKUP(lookup_value, table_array, col_index, [range_lookup]):**
  - Tìm kiếm theo cột từ trái qua phải (cột tìm kiếm phải là cột đầu tiên trong bảng).
- **INDEX & MATCH (Giải pháp thay thế VLOOKUP linh hoạt):**
  - \`=INDEX(cột_kết_quả, MATCH(giá_trị_tìm, cột_tìm_kiếm, 0))\`
- **SUMIFS(sum_range, criteria_range1, criteria1, ...):**
  - Tính tổng các ô thỏa mãn nhiều điều kiện đồng thời.`
    }
  ],

  // Khởi tạo và nạp dữ liệu ban đầu
  async init() {
    // 1. Kiểm tra xem LocalStorage đã có dữ liệu chưa
    const existingSubjects = StorageService.getSubjects();
    if (!existingSubjects || existingSubjects.length === 0) {
      StorageService.saveSubjects(this.FALLBACK_OFFICIAL);
    }

    const existingDrafts = StorageService.getDraftSubjects();
    if (!existingDrafts || existingDrafts.length === 0) {
      StorageService.saveDraftSubjects(this.FALLBACK_DRAFTS);
    }

    const existingFolders = StorageService.getFolders();
    if (!existingFolders || existingFolders.length === 0) {
      StorageService.saveFolders(this.FALLBACK_FOLDERS);
    }

    const existingMaterials = StorageService.getMaterials();
    if (!existingMaterials || existingMaterials.length === 0) {
      StorageService.saveMaterials(this.FALLBACK_MATERIALS);
    }

    // 2. Thử fetch bất đồng bộ từ thư mục data/ nếu chạy qua HTTP/HTTPS server
    if (window.location.protocol.startsWith("http")) {
      try {
        await this.syncFromHttp();
      } catch (e) {
        console.log("Running in offline/local storage mode");
      }
    }
  },

  async syncFromHttp() {
    try {
      const res = await fetch("data/official/subjects-index.json");
      if (res.ok) {
        const indexList = await res.json();
        const loadedSubjects = [];
        for (const item of indexList) {
          if (item.file) {
            const subRes = await fetch(`data/official/${item.file}`);
            if (subRes.ok) {
              const subData = await subRes.json();
              loadedSubjects.push(subData);
            }
          }
        }
        if (loadedSubjects.length > 0) {
          StorageService.saveSubjects(loadedSubjects);
        }
      }
    } catch (err) {
      console.warn("HTTP Data fetch bypassed:", err);
    }
  }
};
