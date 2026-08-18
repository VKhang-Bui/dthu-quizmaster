/**
 * NGÂN HÀNG MÔN HỌC & CÂU HỎI MẶC ĐỊNH
 * Được nạp tự động khi lần đầu mở Web App (Lưu vào localStorage)
 */
const DEFAULT_SUBJECTS = [
  {
    id: "CNXHKH",
    code: "POL102",
    name: "Chủ nghĩa Xã hội Khoa học",
    department: "Lý luận Chính trị",
    author: "Shina (Bùi Văn Khang)",
    description: "Bộ câu hỏi ôn tập và thi thử chuẩn môn Chủ nghĩa Xã hội Khoa học gồm đầy đủ các chương.",
    chapters: [
      { id: "c1", name: "Chương 1: Nhập môn Chủ nghĩa Xã hội Khoa học" },
      { id: "c2", name: "Chương 2: Sứ mệnh lịch sử của giai cấp công nhân" },
      { id: "c3", name: "Chương 3: Chủ nghĩa xã hội và thời kỳ quá độ lên CNXH" },
      { id: "c4", name: "Chương 4: Dân chủ XHCN và Nhà nước XHCN" },
      { id: "c5", name: "Chương 5: Cơ cấu xã hội - giai cấp và liên minh trong thời kỳ quá độ" },
      { id: "c6", name: "Chương 6: Vấn đề dân tộc và tôn giáo trong thời kỳ quá độ" },
      { id: "c7", name: "Chương 7: Vấn đề gia đình trong thời kỳ quá độ lên CNXH" }
    ],
    questions: [
      {
        id: "CNXHKH-001",
        chapterId: "c1",
        question: "Theo nghĩa rộng, Chủ nghĩa xã hội khoa học (CNXHKH) được hiểu là gì?",
        options: [
          {
            text: "Toàn bộ chủ nghĩa Mác - Lênin",
            isCorrect: true,
            note: "Theo nghĩa rộng, CNXHKH chính là toàn bộ chủ nghĩa Mác - Lênin (bao gồm Triết học Mác - Lênin, Kinh tế chính trị Mác - Lênin và CNXHKH)."
          },
          {
            text: "Hệ tư tưởng của riêng giai cấp tư sản",
            isCorrect: false,
            note: "CNXHKH là hệ tư tưởng và lý luận của giai cấp công nhân."
          },
          {
            text: "Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác",
            isCorrect: false,
            note: "CNXHKH là một bộ phận cốt lõi của chủ nghĩa Mác - Lênin."
          },
          {
            text: "Chỉ bao gồm bộ phận Kinh tế chính trị Mác - Lênin",
            isCorrect: false,
            note: "Đây chỉ là một bộ phận hợp thành chứ không phải toàn bộ CNXHKH theo nghĩa rộng."
          }
        ],
        answerIndex: 0
      },
      {
        id: "CNXHKH-002",
        chapterId: "c1",
        question: "Theo nghĩa hẹp, Chủ nghĩa xã hội khoa học được định nghĩa là gì?",
        options: [
          {
            text: "Toàn bộ hệ thống tri thức nhân loại thời cận đại",
            isCorrect: false,
            note: "Đây là khái niệm chung, không phản ánh nghĩa hẹp của CNXHKH."
          },
          {
            text: "Một trong ba bộ phận cấu thành chủ nghĩa Mác - Lênin",
            isCorrect: true,
            note: "Theo nghĩa hẹp, CNXHKH là một trong ba bộ phận hợp thành (cùng với Triết học Mác - Lênin và Kinh tế chính trị Mác - Lênin)."
          },
          {
            text: "Một hình thức triết học duy tâm",
            isCorrect: false,
            note: "CNXHKH dựa trên nền tảng thế giới quan duy vật biện chứng."
          },
          {
            text: "Lý thuyết thuần túy về phát triển kinh tế tư bản",
            isCorrect: false,
            note: "CNXHKH luận giải về sứ mệnh lịch sử của giai cấp công nhân và con đường đi lên CNXH."
          }
        ],
        answerIndex: 1
      },
      {
        id: "CNXHKH-003",
        chapterId: "c1",
        question: "Chủ nghĩa Mác - Lênin được cấu thành từ ba bộ phận lý luận nào?",
        options: [
          {
            text: "Triết học Mác - Lênin, Kinh tế chính trị Mác - Lênin và Chủ nghĩa xã hội khoa học",
            isCorrect: true,
            note: "Đây là ba bộ phận lý luận hợp thành chủ nghĩa Mác - Lênin."
          },
          {
            text: "Lịch sử thế giới, Xã hội học và Kinh tế học cổ điển",
            isCorrect: false,
            note: "Đây không phải là ba bộ phận cấu thành chủ nghĩa Mác - Lênin."
          },
          {
            text: "Triết học duy tâm, Chủ nghĩa không tưởng và Kinh tế vi mô",
            isCorrect: false,
            note: "Chủ nghĩa Mác kế thừa có chọn lọc chứ không bao gồm các bộ phận này."
          },
          {
            text: "Chủ nghĩa duy vật lịch sử, Đạo đức học và Mỹ học",
            isCorrect: false,
            note: "Đạo đức học và Mỹ học là các chuyên ngành triết học, không phải bộ phận hợp thành chính."
          }
        ],
        answerIndex: 0
      },
      {
        id: "CNXHKH-004",
        chapterId: "c1",
        question: "Vào những năm 40 của thế kỷ XIX, mâu thuẫn kinh tế cơ bản trong lòng xã hội tư bản chủ nghĩa là gì?",
        options: [
          {
            text: "Giữa lực lượng sản xuất mang tính xã hội hóa và quan hệ sản xuất chiếm hữu tư nhân TBCN",
            isCorrect: true,
            note: "Sự phát triển của đại công nghiệp tạo ra LLSX có tính xã hội hóa cao, mâu thuẫn gay gắt với QHSX chiếm hữu tư nhân TBCN."
          },
          {
            text: "Giữa nền kinh tế nông nghiệp tự cung tự cấp và thương nghiệp",
            isCorrect: false,
            note: "Thời kỳ này nền đại công nghiệp đã phát triển mạnh, mâu thuẫn chính nằm ở lòng CNTB."
          },
          {
            text: "Giữa các tập đoàn tư bản xuyên quốc gia với nhau",
            isCorrect: false,
            note: "Mâu thuẫn này diễn ra chủ yếu ở giai đoạn đế quốc chủ nghĩa sau này."
          },
          {
            text: "Giữa phương thức sản xuất phong kiến và tư bản sơ khai",
            isCorrect: false,
            note: "CNTB thời kỳ này đã xác lập vị thế thống trị hoàn toàn."
          }
        ],
        answerIndex: 0
      },
      {
        id: "CNXHKH-005",
        chapterId: "c1",
        question: "Ba phong trào đấu tranh tiêu biểu của giai cấp công nhân trong những năm 30 - 40 của thế kỷ XIX diễn ra ở những quốc gia nào?",
        options: [
          {
            text: "Anh, Pháp, Đức",
            isCorrect: true,
            note: "Ba phong trào lớn gồm: Phong trào Hiến chương (Anh), Phong trào Lion (Pháp), Phong trào Xilêdi (Đức)."
          },
          {
            text: "Nga, Mỹ, Nhật Bản",
            isCorrect: false,
            note: "Phong trào ở các nước này phát triển mạnh vào giai đoạn sau."
          },
          {
            text: "Ý, Tây Ban Nha, Bồ Đào Nha",
            isCorrect: false,
            note: "Đây không phải nơi diễn ra 3 phong trào công nhân tiêu biểu làm tiền đề ra đời CNXHKH."
          },
          {
            text: "Trung Quốc, Ấn Độ, Việt Nam",
            isCorrect: false,
            note: "Đây là phong trào giải phóng dân tộc ở châu Á vào thế kỷ XX."
          }
        ],
        answerIndex: 0
      },
      {
        id: "CNXHKH-006",
        chapterId: "c1",
        question: "Trong cuộc khởi nghĩa năm 1831 của công nhân dệt Lion (Pháp), khẩu hiệu nổi bật mang tính kinh tế là gì?",
        options: [
          {
            text: "“Sống có việc làm hay là chết trong đấu tranh”",
            isCorrect: true,
            note: "Đây là khẩu hiệu đòi quyền lợi kinh tế/việc làm của công nhân Lion năm 1831."
          },
          {
            text: "“Cộng hòa hay là chết”",
            isCorrect: false,
            note: "Đây là khẩu hiệu mang tính chính trị trong cuộc khởi nghĩa năm 1834."
          },
          {
            text: "“Tự do - Bình đẳng - Bác ái”",
            isCorrect: false,
            note: "Đây là khẩu hiệu của Cách mạng tư sản Pháp 1789."
          },
          {
            text: "“Vô sản tất cả các nước, đoàn kết lại!”",
            isCorrect: false,
            note: "Đây là khẩu hiệu chiến lược trong Tuyên ngôn của Đảng Cộng sản (1848)."
          }
        ],
        answerIndex: 0
      },
      {
        id: "CNXHKH-007",
        chapterId: "c1",
        question: "Phong trào công nhân dệt Lion năm 1834 ở Pháp giương cao khẩu hiệu chính trị nào, đánh dấu bước phát triển về chất của phong trào?",
        options: [
          {
            text: "“Cộng hòa hay là chết”",
            isCorrect: true,
            note: "Năm 1834, phong trào chuyển từ mục tiêu kinh tế sang mục tiêu chính trị rõ nét với khẩu hiệu 'Cộng hòa hay là chết'."
          },
          {
            text: "“Tăng lương, giảm giờ làm”",
            isCorrect: false,
            note: "Đây là yêu sách thuần túy mang tính kinh tế."
          },
          {
            text: "“Sống có việc làm hay là chết trong đấu tranh”",
            isCorrect: false,
            note: "Đây là khẩu hiệu của năm 1831."
          },
          {
            text: "“Tất cả chính quyền về tay Xô Viết”",
            isCorrect: false,
            note: "Đây là khẩu hiệu trong Cách mạng Tháng Mười Nga 1917."
          }
        ],
        answerIndex: 0
      }
    ]
  },
  {
    id: "TRIET_HOC",
    code: "POL101",
    name: "Triết học Mác - Lênin",
    department: "Lý luận Chính trị",
    author: "Shinora Academic Community",
    description: "Ngân hàng trắc nghiệm Triết học Mác - Lênin (Chủ nghĩa duy vật biện chứng và duy vật lịch sử).",
    chapters: [
      { id: "c1", name: "Chương 1: Triết học và vai trò trong đời sống" },
      { id: "c2", name: "Chương 2: Chủ nghĩa duy vật biện chứng" },
      { id: "c3", name: "Chương 3: Chủ nghĩa duy vật lịch sử" }
    ],
    questions: [
      {
        id: "THML-001",
        chapterId: "c1",
        question: "Vấn đề cơ bản của triết học là vấn đề gì?",
        options: [
          { text: "Mối quan hệ giữa tư duy và tồn tại (giữa ý thức và vật chất)", isCorrect: true, note: "Ph. Ăng-ghen khẳng định: 'Vấn đề cơ bản lớn của mọi triết học, đặc biệt là triết học hiện đại, là vấn đề quan hệ giữa tư duy và tồn tại'." },
          { text: "Mối quan hệ giữa con người và tự nhiên", isCorrect: false, note: "Đây là mối quan hệ cụ thể, không phải vấn đề nền tảng phân định các trường phái triết học." },
          { text: "Nguồn gốc của vũ trụ và sự sống", isCorrect: false, note: "Đây là đối tượng nghiên cứu của khoa học tự nhiên." },
          { text: "Quy luật vận động của nền kinh tế thị trường", isCorrect: false, note: "Đây là đối tượng của Kinh tế chính trị học." }
        ],
        answerIndex: 0
      },
      {
        id: "THML-002",
        chapterId: "c2",
        question: "Theo định nghĩa của V.I. Lênin, thuộc tính phổ biến nhất của mọi dạng vật chất là gì?",
        options: [
          { text: "Tính thực tại khách quan (tồn tại độc lập với ý thức con người)", isCorrect: true, note: "Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác." },
          { text: "Có khối lượng và kích thước xác định", isCorrect: false, note: "Đây là thuộc tính vật lý cụ thể, không phải thuộc tính triết học khái quát nhất." },
          { text: "Luôn luôn đứng im tuyệt đối", isCorrect: false, note: "Vật chất luôn luôn vận động; đứng im chỉ là tương đối, tạm thời." },
          { text: "Được sinh ra từ ý niệm tuyệt đối", isCorrect: false, note: "Đây là quan điểm duy tâm khách quan của Hêghen." }
        ],
        answerIndex: 0
      }
    ]
  },
  {
    id: "VI_SINH",
    code: "BIO201",
    name: "Vi sinh vật học đại cương",
    department: "Công nghệ Sinh học",
    author: "Shina (Bùi Văn Khang)",
    description: "Bộ câu hỏi ôn thi môn Vi sinh vật học đại cương tham khảo dành cho sinh viên ngành Sinh học/CNSH.",
    chapters: [
      { id: "c1", name: "Chương 1: Hình thái và cấu tạo tế bào vi sinh vật" },
      { id: "c2", name: "Chương 2: Dinh dưỡng và trao đổi chất" },
      { id: "c3", name: "Chương 3: Sinh trưởng và phát triển của vi sinh vật" }
    ],
    questions: [
      {
        id: "VSV-001",
        chapterId: "c1",
        question: "Thành phần cấu tạo đặc trưng của thành tế bào vi khuẩn là gì?",
        options: [
          { text: "Peptidoglycan (Murein)", isCorrect: true, note: "Peptidoglycan là thành phần chính cấu tạo nên thành tế bào của hầu hết các vi khuẩn." },
          { text: "Cellulose", isCorrect: false, note: "Cellulose là thành phần cấu tạo thành tế bào thực vật." },
          { text: "Chitin", isCorrect: false, note: "Chitin là thành phần cấu tạo thành tế bào nấm." },
          { text: "Glycogen", isCorrect: false, note: "Glycogen là chất dự trữ ở động vật và nấm men." }
        ],
        answerIndex: 0
      }
    ]
  }
];
