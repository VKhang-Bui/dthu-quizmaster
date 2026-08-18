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

  FALLBACK_MATERIALS: [
    {
      id: "mat-cnxhkh",
      subjectId: "CNXHKH",
      title: "Tóm tắt lý thuyết trọng tâm 7 chương - CNXHKH",
      fileType: "txt",
      author: "Shina (Bùi Văn Khang)",
      description: "Tóm tắt đầy đủ định nghĩa, tiền đề kinh tế - xã hội và sứ mệnh lịch sử GCCN.",
      filePath: "data/materials/cnxhkh-tom-tat.txt",
      content: `================================================================================
TÀI LIỆU ÔN TẬP TÓM TẮT: CHỦ NGHĨA XÃ HỘI KHOA HỌC (POL102)
Biên soạn: Shina (Bùi Văn Khang)
================================================================================

CHƯƠNG 1: NHẬP MÔN CHỦ NGHĨA XÃ HỘI KHOA HỌC
--------------------------------------------------------------------------------
1. Định nghĩa:
   - Nghĩa rộng: CNXHKH là toàn bộ chủ nghĩa Mác - Lênin.
   - Nghĩa hẹp: Là một trong ba bộ phận cấu thành chủ nghĩa Mác - Lênin (Triết học, Kinh tế chính trị, CNXHKH).
2. Điều kiện kinh tế - xã hội ra đời:
   - Thập niên 40 của thế kỷ XIX: Cách mạng công nghiệp phát triển mạnh mẽ tạo ra nền đại công nghiệp cơ khí.
   - Mâu thuẫn kinh tế: Lực lượng sản xuất (xã hội hóa) >< Quan hệ sản xuất (chiếm hữu tư nhân TBCN).
   - Ba phong trào công nhân lớn:
     + Phong trào Hiến chương ở Anh (1836 - 1848).
     + Khởi nghĩa công nhân dệt Lion ở Pháp (1831: Kinh tế; 1834: Chính trị).
     + Khởi nghĩa thợ dệt Xilêdi ở Đức (1844).
3. Tiền đề khoa học tự nhiên:
   - Định luật bảo toàn và chuyển hóa năng lượng.
   - Học thuyết tế bào.
   - Thuyết tiến hóa của Charles Darwin.
4. Tiền đề tư tưởng lý luận:
   - Triết học cổ điển Đức (Hêghen & Phoiơbắc).
   - Kinh tế chính trị học cổ điển Anh (Adam Smith & David Ricardo).
   - Chủ nghĩa xã hội không tưởng - phê phán Pháp & Anh (Xanh Ximông, Sáclơ Phuriê, Rôbớt Ôoen).`
    },
    {
      id: "mat-visinh",
      subjectId: "VI_SINH",
      title: "Bảng tra cứu thuật ngữ & khái niệm trọng tâm - Vi sinh vật học",
      fileType: "txt",
      author: "Shina (Bùi Văn Khang)",
      description: "Tra cứu cấu trúc peptidoglycan, cơ chế nhuộm Gram và 4 pha sinh trưởng vi sinh vật.",
      filePath: "data/materials/vi-sinh-thuat-ngu.txt",
      content: `================================================================================
BẢNG TRA CỨU THUẬT NGỮ & KHÁI NIỆM TRỌNG TÂM: VI SINH VẬT HỌC (BIO201)
Biên soạn: Shina (Bùi Văn Khang)
================================================================================

1. Peptidoglycan (Murein):
   - Bản chất: Đại phân tử dạng lưới gồm các chuỗi glycan liên kết bởi cầu nối tetrapeptide.
   - Vai trò: Tạo khung cơ học vững chắc, quy định hình dạng và bảo vệ tế bào vi khuẩn.

2. Nhuộm Gram (Gram Staining):
   - Gram dương (Gram+): Thành peptidoglycan dày, giữ màu TÍM.
   - Gram âm (Gram-): Thành peptidoglycan mỏng có màng ngoài, bắt màu HỒNG/ĐỎ.

3. Nội bào tử (Endospore):
   - Thể nghỉ đặc biệt hình thành khi điều kiện môi trường bất lợi (Bacillus, Clostridium).
   - Kháng nhiệt nhờ hàm lượng nước thấp và Canxi Dipicolinate (Ca-DPA).`
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
