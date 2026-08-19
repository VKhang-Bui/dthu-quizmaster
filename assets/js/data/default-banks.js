/**
 * NGÂN HÀNG MÔN HỌC & CÂU HỎI MẶC ĐỊNH (5 MÔN HỌC CHÍNH THỨC)
 * Nền tảng 100% Thuần Cloudflare (CF) & Local-First.
 * Được nạp tự động khi lần đầu mở Web App (Lưu vào localStorage).
 */
const DEFAULT_SUBJECTS = [
  {
    "id": "CNXHKH",
    "code": "POL102",
    "name": "Chủ nghĩa Xã hội Khoa học",
    "department": "Lý luận Chính trị",
    "author": "Shina Sanora",
    "description": "Bộ câu hỏi ôn tập và thi thử chuẩn môn Chủ nghĩa Xã hội Khoa học gồm đầy đủ 7 chương.",
    "icon": "📕",
    "status": "official",
    "chapters": [
      {
        "id": "c1",
        "name": "Chương 1: Nhập môn Chủ nghĩa Xã hội Khoa học"
      },
      {
        "id": "c2",
        "name": "Chương 2: Sứ mệnh lịch sử của giai cấp công nhân"
      },
      {
        "id": "c3",
        "name": "Chương 3: Chủ nghĩa xã hội và thời kỳ quá độ lên CNXH"
      },
      {
        "id": "c4",
        "name": "Chương 4: Dân chủ XHCN và Nhà nước XHCN"
      },
      {
        "id": "c5",
        "name": "Chương 5: Cơ cấu xã hội - giai cấp và liên minh trong thời kỳ quá độ"
      },
      {
        "id": "c6",
        "name": "Chương 6: Vấn đề dân tộc và tôn giáo trong thời kỳ quá độ"
      },
      {
        "id": "c7",
        "name": "Chương 7: Vấn đề gia đình trong thời kỳ quá độ lên CNXH"
      }
    ],
    "questions": [
      {
        "id": "CNXHKH-001",
        "chapterId": "c1",
        "question": "Theo nghĩa rộng, Chủ nghĩa xã hội khoa học (CNXHKH) được hiểu là gì?",
        "options": [
          {
            "text": "Toàn bộ chủ nghĩa Mác - Lênin",
            "isCorrect": true,
            "note": "Theo nghĩa rộng, CNXHKH chính là toàn bộ chủ nghĩa Mác - Lênin (bao gồm Triết học Mác - Lênin, Kinh tế chính trị Mác - Lênin và CNXHKH)."
          },
          {
            "text": "Hệ tư tưởng của riêng giai cấp tư sản",
            "isCorrect": false,
            "note": "CNXHKH là hệ tư tưởng và lý luận của giai cấp công nhân."
          },
          {
            "text": "Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác",
            "isCorrect": false,
            "note": "CNXHKH là một bộ phận cốt lõi của chủ nghĩa Mác - Lênin."
          },
          {
            "text": "Chỉ bao gồm bộ phận Kinh tế chính trị Mác - Lênin",
            "isCorrect": false,
            "note": "Đây chỉ là một bộ phận hợp thành chứ không phải toàn bộ CNXHKH theo nghĩa rộng."
          }
        ],
        "answerIndex": 0
      },
      {
        "id": "CNXHKH-002",
        "chapterId": "c1",
        "question": "Theo nghĩa hẹp, Chủ nghĩa xã hội khoa học được định nghĩa là gì?",
        "options": [
          {
            "text": "Toàn bộ hệ thống tri thức nhân loại thời cận đại",
            "isCorrect": false,
            "note": "Đây là khái niệm chung, không phản ánh nghĩa hẹp của CNXHKH."
          },
          {
            "text": "Một trong ba bộ phận cấu thành chủ nghĩa Mác - Lênin",
            "isCorrect": true,
            "note": "Theo nghĩa hẹp, CNXHKH là một trong ba bộ phận hợp thành (cùng với Triết học Mác - Lênin và Kinh tế chính trị Mác - Lênin)."
          },
          {
            "text": "Một hình thức triết học duy tâm",
            "isCorrect": false,
            "note": "CNXHKH dựa trên nền tảng thế giới quan duy vật biện chứng."
          },
          {
            "text": "Lý thuyết thuần túy về phát triển kinh tế tư bản",
            "isCorrect": false,
            "note": "CNXHKH luận giải về sứ mệnh lịch sử của giai cấp công nhân và con đường đi lên CNXH."
          }
        ],
        "answerIndex": 1
      },
      {
        "id": "CNXHKH-003",
        "chapterId": "c1",
        "question": "Chủ nghĩa Mác - Lênin được cấu thành từ ba bộ phận lý luận nào?",
        "options": [
          {
            "text": "Triết học Mác - Lênin, Kinh tế chính trị Mác - Lênin và Chủ nghĩa xã hội khoa học",
            "isCorrect": true,
            "note": "Đây là ba bộ phận lý luận hợp thành chủ nghĩa Mác - Lênin."
          },
          {
            "text": "Lịch sử thế giới, Xã hội học và Kinh tế học cổ điển",
            "isCorrect": false,
            "note": "Đây không phải là ba bộ phận cấu thành chủ nghĩa Mác - Lênin."
          },
          {
            "text": "Triết học duy tâm, Chủ nghĩa không tưởng và Kinh tế vi mô",
            "isCorrect": false,
            "note": "Chủ nghĩa Mác kế thừa có chọn lọc chứ không bao gồm các bộ phận này."
          },
          {
            "text": "Chủ nghĩa duy vật lịch sử, Đạo đức học và Mỹ học",
            "isCorrect": false,
            "note": "Đạo đức học và Mỹ học là các chuyên ngành triết học, không phải bộ phận hợp thành chính."
          }
        ],
        "answerIndex": 0
      },
      {
        "id": "CNXHKH-004",
        "chapterId": "c1",
        "question": "Vào những năm 40 của thế kỷ XIX, mâu thuẫn kinh tế cơ bản trong lòng xã hội tư bản chủ nghĩa là gì?",
        "options": [
          {
            "text": "Giữa lực lượng sản xuất mang tính xã hội hóa và quan hệ sản xuất chiếm hữu tư nhân TBCN",
            "isCorrect": true,
            "note": "Sự phát triển của đại công nghiệp tạo ra LLSX có tính xã hội hóa cao, mâu thuẫn gay gắt với QHSX chiếm hữu tư nhân TBCN."
          },
          {
            "text": "Giữa nền kinh tế nông nghiệp tự cung tự cấp và thương nghiệp",
            "isCorrect": false,
            "note": "Thời kỳ này nền đại công nghiệp đã phát triển mạnh, mâu thuẫn chính nằm ở lòng CNTB."
          },
          {
            "text": "Giữa các tập đoàn tư bản xuyên quốc gia với nhau",
            "isCorrect": false,
            "note": "Mâu thuẫn này diễn ra chủ yếu ở giai đoạn đế quốc chủ nghĩa sau này."
          },
          {
            "text": "Giữa phương thức sản xuất phong kiến và tư bản sơ khai",
            "isCorrect": false,
            "note": "CNTB thời kỳ này đã xác lập vị thế thống trị hoàn toàn."
          }
        ],
        "answerIndex": 0
      },
      {
        "id": "CNXHKH-005",
        "chapterId": "c1",
        "question": "Ba phong trào đấu tranh tiêu biểu của giai cấp công nhân trong những năm 30 - 40 của thế kỷ XIX diễn ra ở những quốc gia nào?",
        "options": [
          {
            "text": "Anh, Pháp, Đức",
            "isCorrect": true,
            "note": "Ba phong trào lớn gồm: Phong trào Hiến chương (Anh), Phong trào Lion (Pháp), Phong trào Xilêdi (Đức)."
          },
          {
            "text": "Nga, Mỹ, Nhật Bản",
            "isCorrect": false,
            "note": "Phong trào ở các nước này phát triển mạnh vào giai đoạn sau."
          },
          {
            "text": "Ý, Tây Ban Nha, Bồ Đào Nha",
            "isCorrect": false,
            "note": "Đây không phải nơi diễn ra 3 phong trào công nhân tiêu biểu làm tiền đề ra đời CNXHKH."
          },
          {
            "text": "Trung Quốc, Ấn Độ, Việt Nam",
            "isCorrect": false,
            "note": "Đây là phong trào giải phóng dân tộc ở châu Á vào thế kỷ XX."
          }
        ],
        "answerIndex": 0
      },
      {
        "id": "CNXHKH-006",
        "chapterId": "c1",
        "question": "Trong cuộc khởi nghĩa năm 1831 của công nhân dệt Lion (Pháp), khẩu hiệu nổi bật mang tính kinh tế là gì?",
        "options": [
          {
            "text": "“Sống có việc làm hay là chết trong đấu tranh”",
            "isCorrect": true,
            "note": "Đây là khẩu hiệu đòi quyền lợi kinh tế/việc làm của công nhân Lion năm 1831."
          },
          {
            "text": "“Cộng hòa hay là chết”",
            "isCorrect": false,
            "note": "Đây là khẩu hiệu mang tính chính trị trong cuộc khởi nghĩa năm 1834."
          },
          {
            "text": "“Tự do - Bình đẳng - Bác ái”",
            "isCorrect": false,
            "note": "Đây là khẩu hiệu của Cách mạng tư sản Pháp 1789."
          },
          {
            "text": "“Vô sản tất cả các nước, đoàn kết lại!”",
            "isCorrect": false,
            "note": "Đây là khẩu hiệu chiến lược trong Tuyên ngôn của Đảng Cộng sản (1848)."
          }
        ],
        "answerIndex": 0
      },
      {
        "id": "CNXHKH-007",
        "chapterId": "c1",
        "question": "Phong trào công nhân dệt Lion năm 1834 ở Pháp giương cao khẩu hiệu chính trị nào, đánh dấu bước phát triển về chất của phong trào?",
        "options": [
          {
            "text": "“Cộng hòa hay là chết”",
            "isCorrect": true,
            "note": "Năm 1834, phong trào chuyển từ mục tiêu kinh tế sang mục tiêu chính trị rõ nét với khẩu hiệu 'Cộng hòa hay là chết'."
          },
          {
            "text": "“Tăng lương, giảm giờ làm”",
            "isCorrect": false,
            "note": "Đây là yêu sách thuần túy mang tính kinh tế."
          },
          {
            "text": "“Sống có việc làm hay là chết trong đấu tranh”",
            "isCorrect": false,
            "note": "Đây là khẩu hiệu của năm 1831."
          },
          {
            "text": "“Tất cả chính quyền về tay Xô Viết”",
            "isCorrect": false,
            "note": "Đây là khẩu hiệu trong Cách mạng Tháng Mười Nga 1917."
          }
        ],
        "answerIndex": 0
      }
    ]
  },
  {
    "id": "TRIET_HOC",
    "code": "POL101",
    "name": "Triết học Mác - Lênin",
    "department": "Lý luận Chính trị",
    "author": "Shinora Academic Community",
    "description": "Ngân hàng trắc nghiệm Triết học Mác - Lênin (Chủ nghĩa duy vật biện chứng và duy vật lịch sử).",
    "icon": "🏛️",
    "status": "official",
    "chapters": [
      {
        "id": "c1",
        "name": "Chương 1: Triết học và vai trò trong đời sống"
      },
      {
        "id": "c2",
        "name": "Chương 2: Chủ nghĩa duy vật biện chứng"
      },
      {
        "id": "c3",
        "name": "Chương 3: Chủ nghĩa duy vật lịch sử"
      }
    ],
    "questions": [
      {
        "id": "THML-001",
        "chapterId": "c1",
        "question": "Vấn đề cơ bản của triết học là vấn đề gì?",
        "options": [
          {
            "text": "Mối quan hệ giữa tư duy và tồn tại (giữa ý thức và vật chất)",
            "isCorrect": true,
            "note": "Ph. Ăng-ghen khẳng định: 'Vấn đề cơ bản lớn của mọi triết học, đặc biệt là triết học hiện đại, là vấn đề quan hệ giữa tư duy và tồn tại'."
          },
          {
            "text": "Mối quan hệ giữa con người và tự nhiên",
            "isCorrect": false,
            "note": "Đây là mối quan hệ cụ thể, không phải vấn đề nền tảng phân định các trường phái triết học."
          },
          {
            "text": "Nguồn gốc của vũ trụ và sự sống",
            "isCorrect": false,
            "note": "Đây là đối tượng nghiên cứu của khoa học tự nhiên."
          },
          {
            "text": "Quy luật vận động của nền kinh tế thị trường",
            "isCorrect": false,
            "note": "Đây là đối tượng của Kinh tế chính trị học."
          }
        ],
        "answerIndex": 0
      },
      {
        "id": "THML-002",
        "chapterId": "c2",
        "question": "Theo định nghĩa của V.I. Lênin, thuộc tính phổ biến nhất của mọi dạng vật chất là gì?",
        "options": [
          {
            "text": "Tính thực tại khách quan (tồn tại độc lập với ý thức con người)",
            "isCorrect": true,
            "note": "Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác."
          },
          {
            "text": "Có khối lượng và kích thước xác định",
            "isCorrect": false,
            "note": "Đây là thuộc tính vật lý cụ thể, không phải thuộc tính triết học khái quát nhất."
          },
          {
            "text": "Luôn luôn đứng im tuyệt đối",
            "isCorrect": false,
            "note": "Vật chất luôn luôn vận động; đứng im chỉ là tương đối, tạm thời."
          },
          {
            "text": "Được sinh ra từ ý niệm tuyệt đối",
            "isCorrect": false,
            "note": "Đây là quan điểm duy tâm khách quan của Hêghen."
          }
        ],
        "answerIndex": 0
      }
    ]
  },
  {
    "id": "VI_SINH",
    "code": "BIO201",
    "name": "Vi sinh vật học đại cương",
    "department": "Khoa Sư phạm Khoa học Tự nhiên",
    "author": "Shina Sanora",
    "description": "Bộ câu hỏi ôn thi môn Vi sinh vật học đại cương dành cho sinh viên ngành Công nghệ Sinh học.",
    "icon": "🔬",
    "status": "official",
    "chapters": [
      {
        "id": "c1",
        "name": "Chương 1: Hình thái và cấu tạo tế bào vi sinh vật"
      },
      {
        "id": "c2",
        "name": "Chương 2: Dinh dưỡng và trao đổi chất"
      },
      {
        "id": "c3",
        "name": "Chương 3: Sinh trưởng và phát triển của vi sinh vật"
      }
    ],
    "questions": [
      {
        "id": "VSV-001",
        "chapterId": "c1",
        "question": "Thành phần cấu tạo đặc trưng của thành tế bào vi khuẩn là gì?",
        "options": [
          {
            "text": "Peptidoglycan (Murein)",
            "isCorrect": true,
            "note": "Peptidoglycan là thành phần chính cấu tạo nên thành tế bào của hầu hết các vi khuẩn."
          },
          {
            "text": "Cellulose",
            "isCorrect": false,
            "note": "Cellulose là thành phần cấu tạo thành tế bào thực vật."
          },
          {
            "text": "Chitin",
            "isCorrect": false,
            "note": "Chitin là thành phần cấu tạo thành tế bào nấm."
          },
          {
            "text": "Glycogen",
            "isCorrect": false,
            "note": "Glycogen là chất dự trữ ở động vật và nấm men."
          }
        ],
        "answerIndex": 0
      }
    ]
  },
  {
    "id": "SUB_1786975462944",
    "code": "BT4026",
    "name": "Tin Sinh Hoc",
    "department": "Khoa Công Nghệ - Kỹ Thuật",
    "author": "Bùi Văn Khang",
    "description": "",
    "icon": "📚",
    "chapters": [
      {
        "id": "c1",
        "name": "PRO TEST 1",
        "description": ""
      },
      {
        "id": "c2",
        "name": "PRO TEST 2",
        "description": ""
      }
    ],
    "questions": [
      {
        "id": "q-1787035316350-0-978",
        "options": [
          {
            "note": "",
            "text": "Trình tự này chỉ xuất hiện ở các tế bào ung thư mà không có ở tế bào người bình thường.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Trình tự này có tính bảo tồn tuyệt đối qua hàng tỷ năm tiến hóa giữa các họ kinase khác nhau.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Đây là vùng có độ biến thiên cao nhất, giúp thuốc phân biệt được các loại kinase.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó chứa các amino acid kỵ nước giúp tăng cường liên kết cộng hóa trị với thuốc.",
            "isCorrect": false
          }
        ],
        "question": "Trong thiết kế thuốc dựa trên cấu trúc, tại sao miền mồi (catalytic loop) mang trình tự  lại được coi là mục tiêu lý tưởng cho các thuốc ức chế đa kinase (multikinase inhibitors)?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-1-526",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Do tính thoái hóa của mã di truyền, các đột biến đồng nghĩa có thể làm mồi không bám được dù protein không đổi.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Trình tự amino acid không chứa thông tin về cấu trúc bậc hai của virus.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì mồi PCR thực chất là các chuỗi peptide ngắn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Các thuật toán MSA cho nucleotide chính xác hơn nhiều so với protein.",
            "isCorrect": false
          }
        ],
        "question": "Khi thiết kế mồi PCR cho các tác nhân gây bệnh virus có tốc độ đột biến cao (như HIV), tại sao việc thực hiện MSA trên trình tự nucleotide lại quan trọng hơn trình tự amino acid?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-2-349",
        "options": [
          {
            "note": "",
            "text": "Mồi PCR có quá nhiều đầu thế  làm thuật toán Smith-Waterman bị lỗi.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Giá trị  (Expectation value) được tính toán dựa trên các truy vấn dài, khiến các đoạn ngắn bị coi là nhiễu thống kê.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Kích thước từ (word size) mặc định quá nhỏ so với chiều dài mồi.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Bộ gen người không chứa các vùng lặp lại mà mồi thường nhắm tới.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao các thiết lập BLAST tiêu chuẩn thường thất bại khi tìm kiếm vị trí bám của mồi PCR dài 20-bp trong bộ gen người?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-3-660",
        "options": [
          {
            "note": "",
            "text": "Để đảm bảo cây luôn có cấu trúc phân đôi (bifurcating) tại mọi nút.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để đơn giản hóa cây bằng cách giả định tất cả các nhánh có tốc độ tiến hóa bằng nhau.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để loại bỏ hoàn toàn các cột có khoảng trống (gaps) trong đa dải trình tự.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để tính toán xác suất xảy ra các sự kiện thay thế nucleotide/amino acid cụ thể giữa các trạng thái.",
            "isCorrect": true
          }
        ],
        "question": "Trong thuật toán xây dựng cây phát sinh loài Maximum Likelihood (ML), mục đích chính của việc sử dụng mô hình tiến hóa (ví dụ: GTR hoặc LG) là gì?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-4-394",
        "options": [
          {
            "note": "",
            "text": "Cơ sở dữ liệu NCBI đã loại bỏ toàn bộ trình tự 16S của nấm để tránh nhầm lẫn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Gene 16S chỉ tồn tại trong ty thể của nấm và không có tính phân loại cao.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Trình tự 16S ở nấm đã bị biến đổi thành các vùng ITS không thể khuếch đại bằng PCR.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nấm là sinh vật nhân thực () nên sử dụng rRNA 18S thay vì 16S của vi khuẩn.",
            "isCorrect": true
          }
        ],
        "question": "Nếu bạn đang phân tích một chủng nấm mới gây bệnh trên hoa hồng và muốn xác định danh tính của nó bằng bioinformatics, tại sao việc tìm kiếm trình tự '16S' trong cơ sở dữ liệu lại là một sai lầm?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-5-462",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "//B. =C. ;",
            "isCorrect": true
          },
          {
            "note": "",
            "text": ">",
            "isCorrect": false
          }
        ],
        "question": "Trong định dạng Boulder-IO được sử dụng bởi Primer3, ký tự nào sau đây là bắt buộc phải có ở dòng cuối cùng của mỗi bản ghi để thuật toán bắt đầu xử lý trình tự?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-6-817",
        "options": [
          {
            "note": "",
            "text": "Sự hiện diện của các motif bảo tồn như DFG hoặc VHRDL.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Tổng số lượng các amino acid kỵ nước trong cột đó.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Sự phân bố của các khoảng trống (gaps) trên toàn bộ dải trình tự.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Chiều dài trung bình của tất cả các trình tự trong file đầu vào.",
            "isCorrect": false
          }
        ],
        "question": "Khi sử dụng TrimAl với flag `-gappyout`, tiêu chí chính nào được thuật toán sử dụng để quyết định loại bỏ một cột trong đa dải trình tự (MSA)?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-7-136",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Hai mồi phải có nhiệt độ nóng chảy () chính xác bằng nhau.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Khoảng cách giữa hai vị trí bám của mồi phải nằm trong giới hạn hợp lý (ví dụ:  bp).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Hai mồi phải có hướng (orientation) đối diện nhau (Forward 5'->3' và Reverse 3'<-5').",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Hai mồi phải nằm trên cùng một nhiễm sắc thể hoặc contig.",
            "isCorrect": false
          }
        ],
        "question": "Trong phân tích In-Silico PCR, điều kiện nào sau đây KHÔNG bắt buộc để xác định một cặp mồi sẽ tạo ra một sản phẩm PCR (amplicon) tiềm năng?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-8-458",
        "options": [
          {
            "note": "",
            "text": "Nó sử dụng ma trận khoảng cách để tính toán đường đi ngắn nhất giữa các loài.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó tìm kiếm cây có tổng số lượng các bước thay đổi tiến hóa ít nhất để giải thích dữ liệu.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó loại bỏ tất cả các trình tự có tốc độ tiến hóa nhanh để làm gọn cây.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó tự động cắt bỏ các nhánh có giá trị Bootstrap thấp dưới .",
            "isCorrect": false
          }
        ],
        "question": "Tại sao phương pháp Maximum Parsimony (MP) thường được gọi là áp dụng nguyên lý 'Dao cạo Occam' (Occam's Razor) trong sinh học tiến hóa?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-9-897",
        "options": [
          {
            "note": "",
            "text": "Vì G và C là các base duy nhất mà Taq polymerase có thể nhận diện để bắt đầu sao chép.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để ngăn chặn mồi tự hình thành cấu trúc kẹp tóc (hairpin).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để giảm nhiệt độ nóng chảy () tổng thể của mồi.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để đảm bảo đầu  liên kết chặt chẽ với khuôn, giúp polymerase dễ dàng khởi đầu kéo dài.",
            "isCorrect": true
          }
        ],
        "question": "Trong cấu trúc của một mồi PCR tối ưu, tại sao sự hiện diện của 1-2 base G hoặc C ở đầu  (gọi là GC Clamp) lại được khuyến nghị?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-10-444",
        "options": [
          {
            "note": "",
            "text": "NJ tự động phát hiện được nguồn gốc gốc () của virus mà không cần nhóm ngoại ().",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "NJ là phương pháp duy nhất có thể sử dụng dữ liệu RNA trực tiếp mà không cần chuyển sang DNA.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "NJ có tốc độ tính toán cực nhanh, phù hợp với các tập dữ liệu khổng lồ gồm hàng ngàn bộ gen.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "NJ có độ chính xác cao hơn ML khi xử lý các virus có tốc độ đột biến nhanh.",
            "isCorrect": false
          }
        ],
        "question": "Khi phân tích cây phát sinh loài của virus SARS-CoV-2 để theo dõi các cụm lây nhiễm trong đại dịch, tại sao phương pháp Neighbor-Joining (NJ) thường được ưu tiên hơn Maximum Likelihood (ML) trong các tình huống khẩn cấp?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-11-604",
        "options": [
          {
            "note": "",
            "text": "Percent Identity luôn là con số duy nhất chính xác để kết luận hai protein có cùng tổ tiên.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Bit score độc lập với kích thước cơ sở dữ liệu và phản ánh độ mạnh của việc so khớp dựa trên bảng điểm.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Bit score chỉ được tính cho nucleotide, còn Percent Identity chỉ dành cho protein.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Bit score tỷ lệ thuận với giá trị , giá trị  càng cao thì Bit score càng cao.",
            "isCorrect": false
          }
        ],
        "question": "Trong thuật toán BLAST, giá trị 'Bit score' khác với 'Percent Identity' ở điểm quan trọng nào khi đánh giá mối quan hệ tương đồng (homology)?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-12-902",
        "options": [
          {
            "note": "",
            "text": "0.4",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "0.9",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "1.1",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "0.6",
            "isCorrect": false
          }
        ],
        "question": "Giả sử bạn có một chuỗi Newick: `((Human:0.1,Chimp:0.2):0.3,Mouse:0.5);`. Khoảng cách tiến hóa ước tính giữa Human và Mouse là bao nhiêu?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-13-95",
        "options": [
          {
            "note": "",
            "text": "Xác suất để nút đó là giả là 1/1000.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nhánh đó có độ dài tương ứng với 1000 đột biến trên mỗi trang web.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Có đúng 1000 loài khác nhau thuộc về clade này.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nhánh đó xuất hiện trong 100% các cây được dựng lại từ việc lấy mẫu ngẫu nhiên dữ liệu.",
            "isCorrect": true
          }
        ],
        "question": "Trong phân tích Bootstrap cho cây phát sinh loài, giá trị '1000' xuất hiện tại một nút (node) khi thực hiện 1000 lần lặp (replicates) có ý nghĩa gì?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-14-642",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Sử dụng biến đổi Fourier để nhanh chóng xác định các vùng có độ tương đồng cao.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Chỉ thực hiện dải trình tự trên các vùng bảo tồn tuyệt đối.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Sử dụng trí tuệ nhân tạo để đoán trước các vị trí gap.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Loại bỏ hoàn toàn bước xây dựng cây hướng dẫn ().",
            "isCorrect": false
          }
        ],
        "question": "Thuật toán MAFFT (Multiple Alignment using Fast Fourier Transform) cải thiện tốc độ so với các phương pháp truyền thống chủ yếu nhờ vào bước nào?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-15-900",
        "options": [
          {
            "note": "",
            "text": "PHI-BLAST",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "blastn -task blastn-short",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "blastx",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "PSI-BLAST",
            "isCorrect": true
          }
        ],
        "question": "Lệnh BLAST nào sau đây là phù hợp nhất để tìm kiếm các miền protein tương đồng rất xa (distantly related) khi các tìm kiếm BLASTP thông thường không cho kết quả?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-16-68",
        "options": [
          {
            "note": "",
            "text": "Nó chỉ ra một đột biến gây bệnh chắc chắn trong bối cảnh lâm sàng.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó cho thấy sự thay thế giữa các amino acid có tính chất lý hóa tương tự nhau (nhóm bảo tồn mạnh).",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó đánh dấu vị trí mà tất cả các trình tự đều có amino acid giống hệt nhau.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó cho biết vị trí đó luôn luôn chứa một khoảng trống (gap).",
            "isCorrect": false
          }
        ],
        "question": "Tại sao một cột trong MSA có ký hiệu dấu hai chấm (`:`) trong định dạng Clustal lại có ý nghĩa quan trọng đối với các nhà thiết kế thuốc?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-17-787",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Xây dựng cây phát sinh loài bằng phương pháp Neighbor-Joining (NJ).",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Xác định các motif chức năng cực ngắn trong protein.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "So sánh trình tự nucleotide của các virus RNA.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Xây dựng cây Maximum Likelihood (ML) với độ chính xác tối đa.",
            "isCorrect": false
          }
        ],
        "question": "Mô hình 'Gappyout' trong TrimAl thường được khuyên dùng nhất cho hạ nguồn phân tích nào sau đây?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-18-424",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Cặp mồi đó càng xa rời các thông số lý tưởng mà người dùng đã thiết lập.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Mồi đó chắc chắn sẽ bám vào các vị trí ngoài ý muốn (off-target).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Cặp mồi đó có khả năng khuếch đại cực kỳ mạnh mẽ trong điều kiện thực nghiệm.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Mồi đó có chi phí tổng hợp hóa học đắt hơn bình thường.",
            "isCorrect": false
          }
        ],
        "question": "Trong hệ thống tính điểm của Primer3, một giá trị 'Penalty' cao cho một cặp mồi có ý nghĩa gì đối với người dùng?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-19-436",
        "options": [
          {
            "note": "",
            "text": "7",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "1",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "28",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "11",
            "isCorrect": false
          }
        ],
        "question": "Khi chạy lệnh `blastn -task blastn-short`, giá trị mặc định của 'word size' thường được hạ xuống bao nhiêu để tìm kiếm mồi hiệu quả?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-20-432",
        "options": [
          {
            "note": "",
            "text": "Một tập hợp các loài có vẻ ngoài giống nhau dù không có quan hệ họ hàng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nhánh dài nhất trong một cây phát sinh loài dựa trên khoảng cách di truyền.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Một nhóm đơn ngành bao gồm một tổ tiên chung và tất cả các hậu duệ của nó.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Điểm mà tại đó một dòng dõi phân tách thành hai dòng dõi mới.",
            "isCorrect": false
          }
        ],
        "question": "Trong phân tích cây phát sinh loài, thuật ngữ 'Clade' được định nghĩa chính xác là gì?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-21-743",
        "options": [
          {
            "note": "",
            "text": "Taq polymerase không thể hoạt động ở nhiệt độ dưới .",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó buộc phải hạ nhiệt độ bắt cặp (annealing), làm tăng nguy cơ mồi bám không đặc hiệu vào các vị trí khác.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Mồi sẽ bị biến tính hoàn toàn và không thể bám vào sợi khuôn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó làm cho bộ gen khuôn bị phân hủy trong quá trình chạy PCR.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao việc thiết kế mồi PCR có nhiệt độ nóng chảy (Tm) quá thấp (ví dụ: >500C ) lại được coi là một rủi ro kỹ thuật?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-22-851",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Smith-Waterman đặt các điểm âm về 0 để cho phép bắt đầu lại dải trình tự tại bất kỳ vị trí nào (Local Alignment).",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Smith-Waterman cố gắng dải toàn bộ chiều dài của cả hai trình tự từ đầu đến cuối (Global Alignment).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Smith-Waterman chỉ áp dụng được cho nucleotide và không dùng được cho protein.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Smith-Waterman nhanh hơn nhưng kém chính xác hơn so với thuật toán BLAST.",
            "isCorrect": false
          }
        ],
        "question": "Phát biểu nào sau đây đúng về cơ chế của thuật toán Smith-Waterman so với Needleman-Wunsch?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-23-271",
        "options": [
          {
            "note": "",
            "text": "Nó là vị trí duy nhất mà mồi PCR có thể bám vào để chẩn đoán ung thư.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó tạo ra một liên kết cộng hóa trị không thể đảo ngược với cơ chế sửa chữa DNA.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Phenylalanine (F) giúp protein kinase tan tốt hơn trong môi trường nước.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Aspartate (D) liên kết với ion Magie (Mg2+) để định vị phân tử ATP.",
            "isCorrect": true
          }
        ],
        "question": "Ký hiệu 'DFG' bảo tồn trong các protein kinase có vai trò sinh học then chốt nào mà các nhà thiết kế thuốc cần lưu ý?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-24-252",
        "options": [
          {
            "note": "",
            "text": "Cột đó chứa ít nhất một khoảng trống (gap) ở một trong các trình tự.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Các amino acid trong cột đó có mức độ tương đồng lý hóa thấp hơn (nhóm bảo tồn yếu).",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Dấu chấm chỉ ra rằng vị trí đó không có ý nghĩa gì đối với tiến hóa.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Đó là vị trí mà tất cả các trình tự đều có đột biến vô nghĩa (stop codon).",
            "isCorrect": false
          }
        ],
        "question": "Trong file đầu ra của Clustal Omega, biểu tượng dấu chấm (`.`) dưới một cột dải trình tự có ý nghĩa gì thấp hơn so với dấu hai chấm (`:`)?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-25-968",
        "options": [
          {
            "note": "",
            "text": "Chuyển đổi file từ định dạng Clustal sang định dạng FASTA.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Hiển thị toàn bộ nội dung file kết quả dải trình tự trực tiếp lên màn hình console.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Xóa bỏ các file tạm thời được tạo ra trong quá trình dải trình tự.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Sắp xếp lại thứ tự các loài trong cây phát sinh loài dựa trên tên.",
            "isCorrect": false
          }
        ],
        "question": "Lệnh `cat hba_clustalw.aln` trong môi trường Linux/Colab được sử dụng để làm gì sau khi chạy ClustalW?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-26-455",
        "options": [
          {
            "note": "",
            "text": "Mồi dimer sẽ liên kết vĩnh viễn với Taq polymerase và làm nó mất hoạt tính.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó làm cho sản phẩm PCR có kích thước lớn hơn so với dự kiến.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Primer dimer sẽ làm cho máy PCR bị quá nhiệt và hỏng.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Mồi sẽ tự bắt cặp với nhau thay vì bám vào DNA khuôn, làm giảm hiệu suất khuếch đại.",
            "isCorrect": true
          }
        ],
        "question": "Tại sao trong thiết kế mồi PCR, người ta thường tránh các trình tự có khả năng hình thành 'Primer Dimer'?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-27-69",
        "options": [
          {
            "note": "",
            "text": "Nó giả định rằng mọi thay thế nucleotide (ví dụ: A->G và A->T) đều có xác suất như nhau.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó chỉ tính toán dựa trên các vùng không mã hóa để tránh áp lực chọn lọc.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó là mô hình duy nhất không yêu cầu phải dải trình tự trước khi dựng cây.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó cho phép tất cả 6 loại thay thế nucleotide có tỷ lệ khác nhau và tần suất các base không bằng nhau.",
            "isCorrect": true
          }
        ],
        "question": "Mô hình tiến hóa 'GTR' (Generalized Time-Reversible) thường được sử dụng trong xây dựng cây Maximum Likelihood cho DNA vì lý do nào?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-28-220",
        "options": [
          {
            "note": "",
            "text": "gtr",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "nt",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "boot 1000",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "lg",
            "isCorrect": true
          }
        ],
        "question": "Khi sử dụng phần mềm FastTree để dựng cây Maximum Likelihood, tham số nào sau đây được khuyến nghị để xử lý các trình tự protein?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-29-280",
        "options": [
          {
            "note": "",
            "text": "Để tăng giá trị Bootstrap cho các nhánh quan trọng trong cây.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để thu hẹp khoảng cách di truyền giữa các loài trong nhóm nghiên cứu chính.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để xác định hướng tiến hóa và đặt gốc cho cây, phân biệt cái nào là cổ xưa.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Để loại bỏ các trình tự có chất lượng kém khỏi đa dải trình tự.",
            "isCorrect": false
          }
        ],
        "question": "Lợi ích lớn nhất của việc sử dụng một 'Outgroup' khi dựng cây phát sinh loài là gì?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-30-503",
        "options": [
          {
            "note": "",
            "text": "Chỉ có gene M1 mới có thể được dịch mã ngược từ RNA sang DNA.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Gene M1 chứa các motif lặp lại giúp tăng cường tín hiệu huỳnh quang.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "M1 là gene cấu trúc có tính bảo tồn cực cao, ít thay đổi giữa các chủng virus khác nhau.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "HA và NA quá ngắn để có thể thiết kế được mồi PCR hiệu quả.",
            "isCorrect": false
          }
        ],
        "question": "Trong bối cảnh chẩn đoán virus Influenza bằng qPCR, tại sao gene Matrix (M1) lại thường được chọn làm đích khuếch đại thay vì các gene HA hay NA?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-31-241",
        "options": [
          {
            "note": "",
            "text": "Tự động đăng tải kết quả dải trình tự lên trang web của NCBI.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Dịch toàn bộ trình tự nucleotide sang protein để hiển thị trên trình duyệt.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nén file kết quả lại để giảm dung lượng lưu trữ trên đám mây.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Tạo ra một báo cáo trực quan bằng màu sắc cho phép kiểm tra nhanh các vùng bị cắt bỏ.",
            "isCorrect": true
          }
        ],
        "question": "Khi chạy TrimAl, flag `-html` có tác dụng gì giúp ích cho người dùng trong quá trình làm sạch dữ liệu?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-32-237",
        "options": [
          {
            "note": "",
            "text": "Giá trị  chỉ ra rằng trình tự đó có chiều dài 50 amino acid.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó cho biết trình tự này đã tiến hóa cách đây 50 triệu năm.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó cho thấy xác suất để kết quả khớp này xảy ra do ngẫu nhiên là cực kỳ thấp.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó có nghĩa là hai trình tự giống hệt nhau 50% .",
            "isCorrect": false
          }
        ],
        "question": "Tại sao một giá trị 'E-value' bằng  trong kết quả BLAST lại được coi là có ý nghĩa sinh học cao hơn giá trị ?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-33-597",
        "options": [
          {
            "note": "",
            "text": "HMM giúp tự động sửa lỗi cho các trình tự DNA bị hỏng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Cho phép người dùng vẽ cây phát sinh loài bằng tay ngay trong terminal.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Khả năng mở rộng cực tốt cho các tập dữ liệu cực lớn với hàng chục ngàn trình tự.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó loại bỏ nhu cầu sử dụng ma trận điểm như BLOSUM62.",
            "isCorrect": false
          }
        ],
        "question": "Trong thuật toán Clustal Omega, việc sử dụng các mô hình Hidden Markov (HMM) mang lại lợi thế gì so với ClustalW truyền thống?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-34-215",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Cài đặt phần mềm dựng cây phát sinh loài nhanh vào hệ thống Linux của máy ảo.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Mở một giao diện đồ họa để người dùng kéo thả các cành cây.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Chạy một phân tích cây ngay lập tức trên file dải trình tự hiện có.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Dùng để gỡ bỏ (uninstall) các phiên bản cũ của ClustalW.",
            "isCorrect": false
          }
        ],
        "question": "Lệnh `apt-get install fasttree` trong môi trường Colab dùng để làm gì?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-35-184",
        "options": [
          {
            "note": "",
            "text": "Mồi off-target sẽ làm thay đổi nhóm máu của bệnh nhân.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó tạo ra các sản phẩm giả có thể dẫn đến kết luận dương tính giả về sự hiện diện của mầm bệnh.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó làm cho máy PCR tiêu thụ điện năng nhiều hơn bình thường.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó ngăn cản việc bác sĩ kê đơn thuốc kháng sinh cho bệnh nhân.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao việc mồi PCR bám vào các vị trí 'Off-target' trong bộ gen lại đặc biệt nguy hiểm trong chẩn đoán lâm sàng?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-36-272",
        "options": [
          {
            "note": "",
            "text": "Tổng số lượng các khoảng trống (gaps) trong toàn bộ file.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Xác suất để một amino acid bị thay thế bởi một amino acid khác.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Số lượng các nút (nodes) dự kiến sẽ xuất hiện trên cây.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Phần trăm sự khác biệt giữa từng cặp trình tự (100% - %Identity).",
            "isCorrect": true
          }
        ],
        "question": "Trong thuật toán xây dựng cây Neighbor-Joining (NJ), khoảng cách di truyền được tính toán ban đầu dựa trên thông số nào từ MSA?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-37-877",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Nó giả định một 'đồng hồ phân tử' nghiêm ngặt, điều hiếm khi xảy ra trong thực tế.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "UPGMA chỉ có thể xử lý tối đa 10 trình tự cùng một lúc.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó yêu cầu phải sử dụng các máy tính siêu cấp để chạy thuật toán.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó không cho phép hiển thị tên của các loài trên các nút lá.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao phương pháp UPGMA ít được sử dụng trong các nghiên cứu tiến hóa hiện đại so với Neighbor-Joining?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-38-14",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Vùng này có sự khác biệt về hóa lý so với các kinase khác (ví dụ: EGFR có QDLL ), giúp tạo ra tính chọn lọc.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Trình tự  dễ dàng bị cắt đứt bởi các enzyme tiêu hóa.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì vùng DFG không có vai trò gì trong hoạt động của enzyme ALK.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì ALK là một protein duy nhất không có miền xúc tác bảo tồn.",
            "isCorrect": false
          }
        ],
        "question": "Khi thiết kế thuốc ức chế chọn lọc cho ALK kinase, tại sao các nhà hóa học lại tập trung vào trình tự  thay vì vùng DFG?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-39-929",
        "options": [
          {
            "note": "",
            "text": "Dịch toàn bộ bộ gen sang 6 khung dịch mã để tìm protein.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Gửi dữ liệu bộ gen của bạn lên máy chủ công cộng của NCBI.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Dùng để kiểm tra xem file FASTA có chứa các ký tự lạ hay không.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Định dạng lại file FASTA thô thành một chỉ mục (index) giúp tìm kiếm nhanh hơn.",
            "isCorrect": true
          }
        ],
        "question": "Lệnh `makeblastdb -in genome.fasta -dbtype nucl -out My_DB` có mục đích gì trong quy trình làm việc với BLAST?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-40-308",
        "options": [
          {
            "note": "",
            "text": "Bệnh nhân đã bị nhiễm nấm men vào máu (nhiễm trùng huyết).",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Vị trí đó cực kỳ quan trọng đối với chức năng của protein qua hàng triệu năm và đột biến ở đó có thể gây bệnh.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Biến thể đó là lành tính vì nấm men vẫn sống được với amino acid đó.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nấm men và người thực chất là cùng một loài nhưng sống ở môi trường khác nhau.",
            "isCorrect": false
          }
        ],
        "question": "Trong phân tích trình tự di truyền lâm sàng, việc tìm thấy một biến thể amino acid ở người trùng khớp với amino acid của nấm men (*S. cerevisiae*) tại một vị trí bảo tồn tuyệt đối gợi ý điều gì?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-41-189",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Các thuật toán progressive alignment không thể sửa lỗi các khoảng trống đã đặt ở các bước ban đầu.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Vì DNA không bao giờ có thể chèn thêm base vào các vị trí đã bị mất.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì khoảng trống là vĩnh viễn và không bao giờ bị loại bỏ bởi các công cụ như TrimAl.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để đảm bảo rằng tất cả các trình tự trong MSA có cùng chiều dài bằng nhau tuyệt đối.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao trong dải trình tự đa trình tự (MSA), người ta thường nói 'Once a gap, always a gap' (Một khi đã là gap, mãi mãi là gap)?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-42-616",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Phương pháp đặc điểm xem xét từng cột cụ thể trong MSA, trong khi phương pháp khoảng cách gộp tất cả thành một con số duy nhất.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Phương pháp khoảng cách chỉ dùng cho DNA, còn phương pháp đặc điểm chỉ dùng cho protein.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Phương pháp đặc điểm luôn cho kết quả nhanh hơn phương pháp khoảng cách.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Phương pháp khoảng cách không thể sử dụng kết quả từ ClustalW làm đầu vào.",
            "isCorrect": false
          }
        ],
        "question": "Sự khác biệt chính giữa phương pháp dựng cây dựa trên khoảng cách (distance - maxtrix) và dựa trên đặc điểm (character - based) là gì?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-43-522",
        "options": [
          {
            "note": "",
            "text": "Nó loại bỏ tất cả các trình tự có độ tương đồng dưới .",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó sử dụng giai đoạn tinh chỉnh lặp lại (iterative refinement) để sửa các lỗi dải trình tự ban đầu.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Vì MUSCLE không sử dụng khoảng trống (gaps) trong kết quả cuối cùng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "MUSCLE được thiết kế đặc biệt để chỉ dải trình tự các gene kháng kháng sinh.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao việc sử dụng thuật toán 'MUSCLE' đôi khi cho kết quả tốt hơn Clustal Omega cho các bộ dữ liệu nhỏ?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-44-524",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Đánh dấu sự kết thúc hoàn toàn của cấu trúc cây.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Biểu thị độ dài nhánh dẫn tới một loài cụ thể.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Dùng để ghi chú tên của một nút tổ tiên trung gian.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Ngăn cách giữa hai loài chị em (sister taxa).",
            "isCorrect": false
          }
        ],
        "question": "Trong định dạng Newick, dấu chấm phẩy (`;`) có ý nghĩa gì?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-45-387",
        "options": [
          {
            "note": "",
            "text": "Một danh sách các amino acid bị lỗi trong quá trình dải trình tự.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Cây đồng thuận (consensus tree) tích hợp các giá trị Bootstrap từ nhiều lần lặp.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Bảng điểm BLAST của tất cả các loài trong cây.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Mã nguồn Python để vẽ lại cây bằng thư viện Matplotlib.",
            "isCorrect": false
          }
        ],
        "question": "Khi chạy IQ-TREE, file có đuôi `.contree` chứa thông tin quan trọng nhất nào?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-46-521",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Sự cân bằng giữa số lượng cột được giữ lại và độ chính xác dự kiến cho cây ML.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó tự động dịch toàn bộ DNA sang protein trước khi dải trình tự.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó ưu tiên giữ lại các trình tự có tên bắt đầu bằng chữ cái 'A'.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó đảm bảo file đầu ra luôn ở định dạng HTML trực quan.",
            "isCorrect": false
          }
        ],
        "question": "Trong lệnh `trimal -in input.fasta -out output.fasta -automated1`, tham số `-automated1` ưu tiên lựa chọn thuật toán dựa trên yếu tố nào?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-47-388",
        "options": [
          {
            "note": "",
            "text": "Nó sẽ làm tăng kích thước của sản phẩm PCR lên gấp đôi.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Cấu trúc kẹp tóc làm cho mồi trở nên độc hại đối với người thao tác.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Mồi sẽ tự gập lại và không thể bắt cặp với sợi DNA khuôn.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó sẽ làm cho mồi bị cắt đứt bởi nhiệt độ cao của chu kỳ biến tính.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao mồi PCR không nên có các cấu trúc 'Hairpin' (kẹp tóc) với năng lượng tự do ΔG quá âm?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787035316350-48-865",
        "options": [
          {
            "note": "",
            "text": "Máy PCR sẽ tự động nối hai nhiễm sắc thể đó lại với nhau.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Sẽ không có sản phẩm PCR nào được hình thành.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Sản phẩm sẽ chỉ chứa trình tự của mồi Forward mà không có mồi Reverse.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Sản phẩm PCR sẽ có kích thước bằng tổng chiều dài của hai nhiễm sắc thể.",
            "isCorrect": false
          }
        ],
        "question": "Trong phân tích In-Silico PCR, nếu hai mồi bám vào hai nhiễm sắc thể khác nhau của cùng một sinh vật, kết quả sẽ là gì?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-49-4",
        "options": [
          {
            "note": "",
            "text": "Để thay thế tất cả các ký tự lạ trong file FASTA bằng các ký tự chuẩn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để tính toán chính xác thời gian mà một loài đã tuyệt chủng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để đảm bảo rằng các khoảng trống (gaps) không bao giờ được đặt cạnh các amino acid kỵ nước.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để cung cấp điểm số cho việc thay thế một amino acid này bằng một amino acid khác dựa trên tần suất quan sát được trong tự nhiên.",
            "isCorrect": true
          }
        ],
        "question": "Mục đích của việc sử dụng 'Substitution Matrix' (như BLOSUM62) trong dải trình tự protein là gì?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-50-185",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Một tổ tiên chung giả định của các loài nằm ở các nhánh phía trên nó.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Một vùng DNA bị mất do đột biến trong quá trình tiến hóa.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Điểm bắt đầu của toàn bộ sự sống trên Trái đất.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Một loài hiện đang sống và được lấy mẫu trực tiếp.",
            "isCorrect": false
          }
        ],
        "question": "Trong cây phát sinh loài, thuật ngữ 'Internal Node' (nút bên trong) đại diện cho điều gì?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787035316350-51-254",
        "options": [
          {
            "note": "",
            "text": "Nó làm cho sản phẩm PCR bị biến thành trình tự RNA.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Mồi liên kết quá chặt, dẫn đến nhiệt độ biến tính cần thiết cao hơn và dễ bám sai vị trí.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Vì mồi giàu GC sẽ bị hòa tan ngay lập tức trong nước và biến mất.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Mồi giàu GC sẽ ngăn cản máy PCR đạt đến nhiệt độ .",
            "isCorrect": false
          }
        ],
        "question": "Tại sao việc thiết kế mồi PCR có tỷ lệ GC quá cao (ví dụ: >70% ) lại có thể gây khó khăn cho phản ứng PCR?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035316350-52-521",
        "options": [
          {
            "note": "",
            "text": "Hai trình tự là các loài khác nhau nhưng có cùng chức năng sinh học.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Truy vấn đã bị lỗi và cần phải chạy lại với các tham số khác.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Đối tượng khớp là một virus cổ đại đã tuyệt chủng.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Hai trình tự hoàn toàn giống hệt nhau về chiều dài và thành phần tại mọi vị trí.",
            "isCorrect": true
          }
        ],
        "question": "Kết quả BLAST hiển thị 'Identities = 142/142 (100%)' nhưng 'Gaps = 0/142 (0%)'. Điều này có nghĩa là gì về mối quan hệ giữa truy vấn và đối tượng khớp?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-53-968",
        "options": [
          {
            "note": "",
            "text": "Cài đặt thư viện Biopython trên máy tính.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Thực hiện đa dải trình tự (MSA) bằng Clustal Omega.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Chạy thuật toán Maximum Likelihood để tìm cây tối ưu.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Thu thập các trình tự tương đồng (homologous sequences) từ cơ sở dữ liệu.",
            "isCorrect": true
          }
        ],
        "question": "Trong quy trình xây dựng cây phát sinh loài, bước nào sau đây PHẢI được thực hiện trước tiên?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-54-322",
        "options": [
          {
            "note": "",
            "text": "Nó chứng minh rằng hàng chục loài đã tiến hóa đồng thời trong cùng một ngày.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Các loài trong nút đó không hề có quan hệ họ hàng với nhau.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Đó là một lỗi phần mềm và cây cần phải được dựng lại bằng FastTree.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Dữ liệu không đủ để xác định thứ tự chính xác của các sự kiện phân tách.",
            "isCorrect": true
          }
        ],
        "question": "Tại sao một 'Polytomy' (nút có nhiều hơn hai nhánh xuất phát) trong cây phát sinh loài thường được coi là một kết quả 'chưa được giải quyết'?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787035316350-55-603",
        "options": [
          {
            "note": "",
            "text": "Luôn luôn cao hơn Tm  của mồi để đảm bảo chỉ có mồi hoàn hảo mới bám được.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Thường thấp hơn Tm của mồi khoảng 3 - 50C .",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Được thiết lập dựa trên nhiệt độ phòng của phòng thí nghiệm.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Phải bằng chính xác nhiệt độ biến tính DNA (950C).",
            "isCorrect": false
          }
        ],
        "question": "Trong thực hành PCR, thuật ngữ 'Annealing Temperature' (Ta) thường được thiết lập như thế nào so với Tm của mồi?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-0-957",
        "options": [
          {
            "note": "",
            "text": "efetch",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "xtract",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "esummary",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "esearch",
            "isCorrect": true
          }
        ],
        "question": "Khi sử dụng EDirect, lệnh nào đóng vai trò như một 'biên lai kỹ thuật số' chứa kết quả tìm kiếm thay vì tải xuống trực tiếp dữ liệu trình tự?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-1-775",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Thường được thiết lập thấp hơn  khoảng  để đảm bảo mồi liên kết ổn định.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Chỉ phụ thuộc vào nồng độ ion  mà không liên quan đến cấu trúc của mồi.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Phải cao hơn  để ngăn chặn việc hình thành các liên kết hydro không mong muốn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Và phải luôn bằng nhau để duy trì trạng thái cân bằng hoàn hảo.",
            "isCorrect": false
          }
        ],
        "question": "Trong thiết kế PCR, tại sao nhiệt độ nóng chảy (Tm) của mồi lại quan trọng đối với nhiệt độ bắt cặp (Ta)?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-2-16",
        "options": [
          {
            "note": "",
            "text": "Lặp lại quá trình căn chỉnh nhiều lần để sửa lỗi ở các giai đoạn sớm.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Xây dựng ma trận khoảng cách đầy đủ cho mọi cặp trình tự trước khi bắt đầu.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Sử dụng phép biến đổi Fourier nhanh (FFT) để xác định các vùng tương đồng.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Seeded guide trees và Hidden Markov Models (HMMs) profile-profile.",
            "isCorrect": true
          }
        ],
        "question": "Thuật toán Clustal Omega sử dụng phương pháp nào sau đây để xử lý các bộ dữ liệu lớn một cách hiệu quả?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-3-514",
        "options": [
          {
            "note": "",
            "text": "ML chỉ tập trung vào việc tìm kiếm cây có ít bước đột biến nhất.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "ML không giả định một đồng hồ phân tử không đổi và sử dụng các mô hình tiến hóa phức tạp.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "UPGMA quá phức tạp vì nó cho phép các nhánh có tốc độ tiến hóa khác nhau.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "ML nhanh hơn nhiều về mặt tính toán so với các phương pháp dựa trên ma trận khoảng cách.",
            "isCorrect": false
          }
        ],
        "question": "Khi xây dựng cây di truyền để truy vết nguồn gốc các biến thể SARS-CoV-2, tại sao phương pháp Maximum Likelihood (ML) thường được ưu tiên hơn UPGMA?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-4-239",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Xác định các túi xúc tác (catalytic pockets) bảo tồn để thiết kế các chất ức chế đặc hiệu.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Loại bỏ hoàn toàn nhu cầu thử nghiệm lâm sàng trên người.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Dự đoán chính xác thời gian mà virus hoặc vi khuẩn sẽ kháng thuốc.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Tính toán nhiệt độ nóng chảy của các protein trong điều kiện khắc nghiệt.",
            "isCorrect": false
          }
        ],
        "question": "Trong ứng dụng thiết kế thuốc, việc căn chỉnh nhiều trình tự (MSA) các kinase như EGFR và ALK giúp ích gì cho các nhà nghiên cứu?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-5-454",
        "options": [
          {
            "note": "",
            "text": "Toàn bộ hệ gen của virus gây bệnh trên hoa hồng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Gen kháng kháng sinh beta-lactam của thực vật.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "18S rRNA hoặc vùng Internal Transcribed Spacer (ITS).",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Vùng 16S rRNA bảo tồn của ty thể nấm.",
            "isCorrect": false
          }
        ],
        "question": "Nếu bạn muốn thiết kế một quy trình PCR để phát hiện nấm gây bệnh trên cây hoa hồng, bạn nên nhắm mục tiêu vào vùng gen nào thay vì 16S rRNA?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-6-799",
        "options": [
          {
            "note": "",
            "text": "Xác suất để nhánh đó bị sai là 100%.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nhánh đó xuất hiện trong tất cả 1000 lần lấy mẫu lại từ dữ liệu gốc.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Trình tự đó dài 1000 cặp base (bp).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Có chính xác 1000 đột biến đã xảy ra giữa các trình tự trong nhánh đó.",
            "isCorrect": false
          }
        ],
        "question": "Trong phân tích Bootstrap cho cây di truyền, giá trị 1000 tại một nút (node) có ý nghĩa gì?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-7-987",
        "options": [
          {
            "note": "",
            "text": "einfolist",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "xtract",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "efetch",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "esummary",
            "isCorrect": true
          }
        ],
        "question": "Lệnh EDirect nào sau đây được sử dụng để trích xuất các trường cụ thể như Accession number hoặc Title từ một tệp XML khổng lồ sang định dạng bảng?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-8-94",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Virus có tỷ lệ đột biến cực cao, đòi hỏi phải tìm kiếm các vùng 'Golden Zone' tuyệt đối bảo tồn qua MSA.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "DNA của virus lớn hơn nhiều so với DNA vi khuẩn, làm mồi bị loãng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Virus không sử dụng các nucleotide A, T, G, C thông thường.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Mồi PCR không thể liên kết với RNA của virus cúm.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao việc thiết kế mồi PCR cho các mầm bệnh virus như cúm (Influenza) lại khó khăn hơn so với vi khuẩn?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-9-503",
        "options": [
          {
            "note": "",
            "text": "Nhiệt độ nóng chảy của mồi là .",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Mồi có độ đặc hiệu bằng 0 và sẽ bám vào mọi nơi trong hệ gen.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Cặp mồi hoàn toàn khớp với tất cả các tham số tối ưu (OPT) đã thiết lập.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Thuật toán đã thất bại và không thể thiết kế được mồi.",
            "isCorrect": false
          }
        ],
        "question": "Trong hệ thống Penalty của Primer3, giá trị 'PRIMER_PAIR_0_PENALTY = 0.00' có nghĩa là gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-10-335",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "NN tính đến năng lượng xếp chồng giữa các cặp base liền kề, không chỉ là số lượng H-bonds.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "NN chỉ áp dụng được cho các trình tự DNA cực ngắn (dưới 10bp).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "NN không quan tâm đến nồng độ muối trong dung dịch đệm.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "NN đơn giản hơn và có thể tính nhẩm nhanh chóng.",
            "isCorrect": false
          }
        ],
        "question": "Mô hình Nearest-Neighbor (NN) khác với quy tắc Wallace (2+4) như thế nào trong việc tính ?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-11-422",
        "options": [
          {
            "note": "",
            "text": "Để giảm nhiệt độ nóng chảy của mồi xuống mức an toàn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để làm cho mồi hòa tan tốt hơn trong nước.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để đảm bảo enzyme polymerase bắt đầu kéo dài mạch một cách hiệu quả nhờ sự liên kết chặt chẽ.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Để ngăn chặn mồi hình thành cấu trúc kẹp tóc (hairpin).",
            "isCorrect": false
          }
        ],
        "question": "Tại sao 'GC Clamp' ở đầu 3' của mồi lại được khuyến nghị trong thiết kế PCR?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-12-133",
        "options": [
          {
            "note": "",
            "text": "cat hoặc less",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "mkdir",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "ls -l",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "chmod +x",
            "isCorrect": true
          }
        ],
        "question": "Lệnh nào trong Linux giúp bạn xem nội dung của tệp căn chỉnh `.aln` mà không cần mở một trình soạn thảo văn bản đầy đủ?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-13-958",
        "options": [
          {
            "note": "",
            "text": "Tất cả các trình tự đều có cùng một nucleotide hoặc axit amin.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Sự bảo tồn yếu giữa các axit amin ít tương đồng.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Sự bảo tồn mạnh mẽ giữa các axit amin có tính chất hóa sinh tương tự nhau.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Có một khoảng trống (gap) được đưa vào để tối ưu hóa căn chỉnh.",
            "isCorrect": false
          }
        ],
        "question": "Trong kết quả căn chỉnh của ClustalW, ký hiệu dấu hai chấm (:) biểu thị điều gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-14-392",
        "options": [
          {
            "note": "",
            "text": "esearch -db protein",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "clustalo",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "blastn-short",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "FastTree -nt",
            "isCorrect": true
          }
        ],
        "question": "Kỹ thuật 'In-silico PCR' sử dụng công cụ nào để đảm bảo mồi không khuếch đại các sản phẩm ngoài ý muốn trong hệ gen phức tạp?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-15-870",
        "options": [
          {
            "note": "",
            "text": "Nó được sử dụng để thay thế cho phân tích Bootstrap.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó giúp xác định điểm gốc (root) của cây và hướng tiến hóa.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó đảm bảo rằng tất cả các loài trong cây tiến hóa với cùng một tốc độ.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó tăng tốc độ tính toán cho các thuật toán Maximum Likelihood.",
            "isCorrect": false
          }
        ],
        "question": "Một cây di truyền có 'Outgroup' giúp ích gì cho việc giải thích các mối quan hệ tiến hóa?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-16-409",
        "options": [
          {
            "note": "",
            "text": "Vì Salmonella luôn cần sự hiện diện của",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "coli để gây bệnh.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để tránh hiện tượng dương tính giả do sự tương đồng giữa các loài vi khuẩn đường ruột gần gũi.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Để đảm bảo mồi có thể khuếch đại cả hai loài cùng một lúc.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì hệ gen của",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "coli đóng vai trò là chất đệm cho phản ứng PCR.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao trong chẩn đoán xét nghiệm thực phẩm (ví dụ: phát hiện Salmonella), mồi PCR phải được kiểm tra chéo với hệ gen của E. coli?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-17-405",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Các tổ tiên giả định đã từng tồn tại trong quá khứ.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Các loài hiện còn đang tồn tại mà chúng ta đang phân tích.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Các vùng gen không bao giờ thay đổi.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Số lượng đột biến tích lũy theo thời gian.",
            "isCorrect": false
          }
        ],
        "question": "Trong cấu trúc của một cây di truyền, các 'Internal Nodes' đại diện cho điều gì?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-18-578",
        "options": [
          {
            "note": "",
            "text": "CLUSTAL",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "XML",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "FASTA",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "NEWICK",
            "isCorrect": true
          }
        ],
        "question": "Định dạng tệp nào sau đây thường được sử dụng để lưu trữ cây di truyền dưới dạng chuỗi văn bản toán học với các dấu ngoặc đơn?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-19-825",
        "options": [
          {
            "note": "",
            "text": "Nó làm cho mồi quá nặng và chìm xuống đáy ống nghiệm.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó ngăn chặn enzyme Taq polymerase liên kết với mồi.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó có thể dẫn đến việc bắt cặp không đặc hiệu và gây ra kết quả dương tính giả.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Nó làm cho mồi dễ bị phân hủy bởi tia UV.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao mồi PCR có 3 hoặc nhiều hơn các base G/C ở cuối đầu 3' lại có thể gây hại cho phản ứng?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-20-901",
        "options": [
          {
            "note": "",
            "text": "Chuyển đổi dữ liệu sang dạng tệp PDF để in ấn.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Yêu cầu NCBI gửi dữ liệu dưới dạng tiêu đề '>' kèm theo chuỗi ký tự trình tự thô.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Chỉ tải xuống phần chú thích các đặc điểm (features) của gen.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Tải xuống toàn bộ các bài báo khoa học liên quan đến trình tự đó.",
            "isCorrect": false
          }
        ],
        "question": "Trong lệnh `efetch -db nucleotide -id M57671 -format fasta`, tham số `-format fasta` có vai trò gì?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-21-376",
        "options": [
          {
            "note": "",
            "text": "Global chỉ dùng cho DNA, còn Local chỉ dùng cho Protein.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Local alignment luôn cho kết quả chính xác hơn Global alignment.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Global căn chỉnh toàn bộ chiều dài của hai trình tự, trong khi Local chỉ tìm các vùng tương đồng nhỏ nhất.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Global alignment sử dụng thuật toán Smith-Waterman.",
            "isCorrect": false
          }
        ],
        "question": "Sự khác biệt chính giữa 'Global Alignment' và 'Local Alignment' là gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-22-778",
        "options": [
          {
            "note": "",
            "text": "Vì nó không sử dụng bất kỳ ma trận khoảng cách nào.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Vì nó tìm kiếm một giải pháp đủ tốt một cách nhanh chóng thay vì tính toán mọi khả năng tuyệt đối.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Vì nó luôn đảm bảo tìm được cây di truyền chính xác 100%.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì nó chỉ hoạt động trên các siêu máy tính đắt tiền.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao phương pháp căn chỉnh tiến triển (Progressive Alignment) của Clustal được gọi là phương pháp 'heuristic'?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-23-86",
        "options": [
          {
            "note": "",
            "text": "Character-based (Dựa trên đặc điểm cụ thể).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Purely Morphological (Chỉ dựa trên hình thái).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Randomized Clustering (Phân cụm ngẫu nhiên).",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Distance-based (Dựa trên khoảng cách).",
            "isCorrect": true
          }
        ],
        "question": "Trong phân tích cây di truyền, thuật toán Neighbor-Joining (NJ) thuộc nhóm nào?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-24-934",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Giới hạn tìm kiếm trong các bài báo được xuất bản trong 10 ngày qua.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Tự động xóa kết quả sau 10 ngày lưu trữ.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Yêu cầu máy chủ NCBI chạy truy vấn liên tục trong 10 ngày.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Tìm kiếm các bài báo có ít nhất 10 ngày thử nghiệm lâm sàng.",
            "isCorrect": false
          }
        ],
        "question": "Khi sử dụng lệnh `esearch -db pubmed -query \"...\" -days 10`, tham số `-days 10` có ý nghĩa gì?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-25-721",
        "options": [
          {
            "note": "",
            "text": "Chúng làm tăng độ đặc hiệu của phản ứng lên mức quá cao.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Chúng làm cho enzyme Taq polymerase bị biến tính nhanh hơn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Chúng sẽ khiến dung dịch PCR chuyển sang màu đục.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Chúng có thể tạo ra các cấu trúc kẹp tóc (hairpins) hoặc Primer Dimers, làm giảm hiệu suất PCR.",
            "isCorrect": true
          }
        ],
        "question": "Trong thiết kế mồi, tại sao các mồi có vùng tự bổ sung (self-complementarity) lại là một vấn đề lớn?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-26-989",
        "options": [
          {
            "note": "",
            "text": "Để xác định tên loài (Species Name) của trình tự.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để trích xuất thông tin về chiều dài của trình tự (Sequence Length).",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Để tính toán tốc độ căn chỉnh (Speed of Alignment).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để hiển thị ngày tải lên của trình tự.",
            "isCorrect": false
          }
        ],
        "question": "Mục đích của việc sử dụng 'Slen' trong lệnh `xtract` sau một truy vấn `esummary` là gì?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-27-181",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Do sự thoái hóa của mã di truyền (codon degeneracy), nhiều trình tự DNA khác nhau có thể tạo ra cùng một protein.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Protein của virus cúm quá nhỏ để có thể thiết kế mồi.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì mồi PCR được cấu tạo từ các axit amin.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "DNA polymerase không thể đọc được thông tin từ axit amin.",
            "isCorrect": false
          }
        ],
        "question": "Trong ứng dụng phát hiện mầm bệnh, tại sao 'Diagnostic Primer Design' phải được thực hiện trên trình tự Nucleotide thay vì Protein?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-28-900",
        "options": [
          {
            "note": "",
            "text": "Vì chúng là những trình tự do máy tính tự tạo ra (giả lập).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì chúng đã bị tuyệt chủng hoàn toàn trong quá trình tiến hóa.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì chúng có chiều dài trình tự dài hơn các trình tự khác.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Vì chúng đại diện cho các trình tự hiện có, đang tồn tại hoặc đã được thu thập thực tế.",
            "isCorrect": true
          }
        ],
        "question": "Tại sao các đầu nhánh của một cây di truyền được gọi là 'Extant' sequences?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-29-871",
        "options": [
          {
            "note": "",
            "text": "Lỗi của máy giải trình tự DNA khiến dữ liệu bị mất.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vùng đó chứa các nucleotide không xác định (N).",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Sự kiện mất đoạn (deletion) hoặc thêm đoạn (insertion) trong quá trình tiến hóa.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Đó là vùng có độ bảo tồn tuyệt đối 100%.",
            "isCorrect": false
          }
        ],
        "question": "Trong phân tích MSA, cột có dấu gạch ngang (-) trong một số trình tự nhưng có ký tự trong các trình tự khác biểu thị điều gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-30-290",
        "options": [
          {
            "note": "",
            "text": "Tính toán xác suất cao nhất dựa trên một mô hình tiến hóa cụ thể.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Tìm kiếm cây có tổng số bước đột biến ít nhất để giải thích dữ liệu.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Sử dụng ma trận khoảng cách để nhóm các loài gần nhau nhất.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Giả định rằng tất cả các loài tiến hóa theo một đường thẳng duy nhất.",
            "isCorrect": false
          }
        ],
        "question": "Thuật toán 'Maximum Parsimony' hoạt động dựa trên nguyên tắc nào?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-31-752",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Mồi sẽ bám không đặc hiệu vào nhiều vị trí khác nhau, tạo ra các vạch phụ không mong muốn.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Enzyme polymerase sẽ bị phá hủy hoàn toàn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Mạch DNA khuôn sẽ không thể tách rời (denature).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Các đoạn mồi sẽ bốc hơi khỏi hỗn hợp phản ứng.",
            "isCorrect": false
          }
        ],
        "question": "Điều gì xảy ra nếu bạn đặt nhiệt độ bắt cặp (Ta) quá thấp trong phản ứng PCR?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-32-717",
        "options": [
          {
            "note": "",
            "text": "Nó quá khó để tính toán mà không có máy tính siêu mạnh.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó chỉ tính được cho trình tự RNA, không tính được cho DNA.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Nó yêu cầu phải biết chính xác nồng độ của ion .",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Nó không chính xác đối với các đoạn mồi dài hơn 20 base hoặc có phân bố GC cực đoan.",
            "isCorrect": true
          }
        ],
        "question": "Công thức Wallace (Tm= 2(A+T) +4(G+C)) có nhược điểm lớn nhất là gì?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-33-915",
        "options": [
          {
            "note": "",
            "text": "Bắt đầu một nhánh mới của cây.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Ngăn cách giữa tên loài và khoảng cách di truyền.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Sự kết thúc của toàn bộ cấu trúc cây.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Đánh dấu rằng trình tự đó là một Outgroup.",
            "isCorrect": false
          }
        ],
        "question": "Trong định dạng Newick, dấu chấm phẩy (;) ở cuối chuỗi biểu thị điều gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-34-74",
        "options": [
          {
            "note": "",
            "text": "Nối hai tệp FASTA lại với nhau thành một tệp duy nhất.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Tạo nhanh một tệp văn bản mới với nội dung được nhập trực tiếp từ script.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Xóa toàn bộ nội dung của tệp hiện có.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Tải xuống một tệp từ internet thông qua giao thức FTP.",
            "isCorrect": false
          }
        ],
        "question": "Lệnh `cat << 'EOF' > filename` trong các bài thực hành Linux có công dụng gì?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-35-401",
        "options": [
          {
            "note": "",
            "text": "Dữ liệu DNA quá lớn để các máy tính hiện nay có thể xử lý.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Protein có 20 chữ cái (axit amin), cung cấp nhiều tổ hợp đặc trưng hơn so với 4 chữ cái của DNA.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Protein không bao giờ bị đột biến.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "DNA chỉ tồn tại trong nhân tế bào, còn Protein có ở khắp nơi.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao việc căn chỉnh protein thường cung cấp thông tin tiến hóa sâu sắc hơn so với căn chỉnh DNA?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787035320798-36-231",
        "options": [
          {
            "note": "",
            "text": "Tất cả các trình tự được viết nối tiếp nhau từ đầu đến cuối trong một dòng duy nhất.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Các trình tự được sắp xếp theo thứ tự bảng chữ cái của tên loài.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Kết quả hiển thị 60 vị trí đầu tiên của tất cả các trình tự, sau đó mới đến 60 vị trí tiếp theo.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Dữ liệu được mã hóa để chỉ máy tính mới đọc được.",
            "isCorrect": false
          }
        ],
        "question": "Trong Clustal Omega, đầu ra mặc định thường là định dạng 'Interleaved'. Điều này có nghĩa là gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-37-853",
        "options": [
          {
            "note": "",
            "text": "Vì hệ gen của con người chỉ có các đoạn lặp lại 24bp.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để khớp chính xác với kích thước của enzyme Taq polymerase.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì máy tổng hợp DNA chỉ có thể tạo ra tối đa 24 ký tự.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để đảm bảo tính đặc hiệu đủ cao trong khi vẫn duy trì nhiệt độ bắt cặp hợp lý.",
            "isCorrect": true
          }
        ],
        "question": "Tại sao mồi PCR thường có chiều dài lý tưởng từ 18 đến 24 nucleotide?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-38-741",
        "options": [
          {
            "note": "",
            "text": "Tăng tốc độ tính toán bằng cách bỏ qua các khoảng trống (gaps).",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Tự động tạo ra 100 lần lặp lại Bootstrap.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Chỉ định rằng đây là dữ liệu Protein (Great Total Residues).",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Mô hình Generalized Time-Reversible cho sự thay thế nucleotide.",
            "isCorrect": true
          }
        ],
        "question": "Khi chạy lệnh `FastTree -nt -gtr < alignment.fasta > tree.nwk`, tham số `-gtr` đại diện cho điều gì?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-39-161",
        "options": [
          {
            "note": "",
            "text": "Để đảm bảo probe có màu sắc rực rỡ dưới kính hiển vi.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để tăng tốc độ của máy PCR khi chạy mẫu bệnh phẩm.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để tìm vùng gen có tính bảo tồn tuyệt đối trên tất cả các chủng đang lưu hành.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Để loại bỏ nhu cầu sử dụng enzyme phiên mã ngược.",
            "isCorrect": false
          }
        ],
        "question": "Lý do quan trọng nhất để thực hiện MSA trước khi thiết kế các probe (đầu dò) chẩn đoán bệnh truyền nhiễm là gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-40-115",
        "options": [
          {
            "note": "",
            "text": "Chỉ bao gồm các loài hiện còn sống, bỏ qua các tổ tiên đã tuyệt chủng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Tập hợp tất cả các loài vi khuẩn có khả năng kháng kháng sinh.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Một tổ tiên chung và tất cả các hậu duệ của nó.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Một nhóm các loài có hình dáng giống nhau nhưng không có quan hệ họ hàng.",
            "isCorrect": false
          }
        ],
        "question": "Trong phân tích di truyền, thuật ngữ 'Monophyletic group' (Clade) có nghĩa là gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-41-231",
        "options": [
          {
            "note": "",
            "text": "Để mã hóa dữ liệu di truyền, ngăn chặn tin tặc đánh cắp thông tin.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để tự động dịch các bài báo khoa học sang ngôn ngữ bản địa.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để tăng tốc độ truy cập và cho phép gửi nhiều yêu cầu hơn trong một giây.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Để NCBI có thể thu phí người dùng cho mỗi lần tìm kiếm.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao việc sử dụng API Key khi truy cập NCBI qua EDirect lại được khuyến khích?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-42-290",
        "options": [
          {
            "note": "",
            "text": "Do nồng độ DNA khuôn quá cao trong hỗn hợp phản ứng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Do phản ứng PCR được thực hiện trong bóng tối.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Do sử dụng loại nhựa ống nghiệm kém chất lượng.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Do sự bổ sung base giữa mồi xuôi và mồi ngược (hoặc giữa hai phân tử cùng loại).",
            "isCorrect": true
          }
        ],
        "question": "Trong thiết kế mồi, 'Primer Dimer' thường hình thành do đâu?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-43-527",
        "options": [
          {
            "note": "",
            "text": "Kiểm tra xem trình tự có chứa các lỗi đột biến hay không.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Đếm tổng số ký tự A, T, G, C trong tệp tin.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Liệt kê tất cả các dòng tiêu đề của các trình tự có trong tệp multi-FASTA.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Xóa toàn bộ các tiêu đề để chỉ để lại chuỗi nucleotide.",
            "isCorrect": false
          }
        ],
        "question": "Lệnh `cat database_targets.fasta | grep \">\"` giúp bạn thực hiện công việc gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787035320798-44-740",
        "options": [
          {
            "note": "",
            "text": "Để ngăn chặn probe tự phân hủy ở nhiệt độ phòng.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để probe có thể phát sáng mạnh hơn trong bóng tối.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì probe thường ngắn hơn mồi rất nhiều.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Để đảm bảo probe bám chắc vào khuôn trước khi mồi bắt đầu được kéo dài bởi polymerase.",
            "isCorrect": true
          }
        ],
        "question": "Tại sao việc thiết kế TaqMan probe lại yêu cầu nhiệt độ nóng chảy () cao hơn mồi từ ?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-45-382",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "MUSCLE sử dụng quy trình lặp lại (iterative) để tinh chỉnh kết quả căn chỉnh.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "MUSCLE không yêu cầu xây dựng bất kỳ cây dẫn đường (guide tree) nào.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "ClustalW nhanh hơn đáng kể so với MUSCLE khi xử lý dữ liệu lớn.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "ClustalW chỉ dành cho DNA, còn MUSCLE chỉ dành cho Protein.",
            "isCorrect": false
          }
        ],
        "question": "Sự khác biệt lớn nhất giữa MUSCLE và ClustalW là gì?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-46-489",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "NJ cho phép các nhánh có tốc độ tiến hóa khác nhau, phản ánh đúng thực tế sinh học hơn.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "NJ luôn tạo ra các cây có gốc (rooted trees) một cách tự động.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "NJ dễ tính toán bằng tay hơn nhiều so với UPGMA.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "UPGMA yêu cầu trình tự phải dài ít nhất 10,000 bp mới hoạt động được.",
            "isCorrect": false
          }
        ],
        "question": "Trong phân tích cây di truyền 16S rRNA của vi khuẩn, tại sao Neighbor-Joining (NJ) là phương pháp tiêu chuẩn thay vì UPGMA?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-47-95",
        "options": [
          {
            "note": "",
            "text": "Ảnh chụp hiển vi của các tế bào người.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Toàn bộ trình tự hệ gen của một cá thể người cụ thể.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Danh sách tất cả các bệnh di truyền của con người.",
            "isCorrect": false
          },
          {
            "note": "Đáp án chính xác.",
            "text": "Thứ bậc phân loại đầy đủ từ giới đến loài.",
            "isCorrect": true
          }
        ],
        "question": "Khi sử dụng lệnh `efetch -db taxonomy -id 9606 -format xml`, bạn đang cố gắng lấy thông tin gì về loài người (TaxID: 9606)?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787035320798-48-510",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Vì để khuếch đại PCR, cần có cả mồi xuôi và mồi ngược bám gần nhau và quay mặt vào nhau.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Vì NCBI sẽ tự động chặn các yêu cầu có quá ít mồi.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì mồi đơn lẻ không thể bám vào DNA ở nhiệt độ cao.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Vì mồi đơn lẻ sẽ bị enzyme Taq polymerase phân hủy ngay lập tức.",
            "isCorrect": false
          }
        ],
        "question": "Tại sao một 'Single Primer Hit' trong In-silico PCR thường không được coi là một mối đe dọa tạo ra sản phẩm ngoài ý muốn?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787035320798-49-964",
        "options": [
          {
            "note": "Đáp án chính xác.",
            "text": "Để ưu tiên việc tạo ra ít khoảng trống dài thay vì nhiều khoảng trống ngắn rải rác.",
            "isCorrect": true
          },
          {
            "note": "",
            "text": "Để buộc các trình tự phải có chiều dài bằng nhau tuyệt đối.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để tiết kiệm bộ nhớ cho máy tính khi chạy thuật toán.",
            "isCorrect": false
          },
          {
            "note": "",
            "text": "Để ngăn chặn hoàn toàn việc chèn bất kỳ khoảng trống nào vào căn chỉnh.",
            "isCorrect": false
          }
        ],
        "question": "Trong MSA, mục đích của việc gán điểm 'Gap Opening Penalty' cao hơn 'Gap Extension Penalty' là gì?",
        "chapterId": "c1",
        "answerIndex": 0
      }
    ],
    "is_active": true,
    "created_at": "2026-08-17T14:04:24.121305+00:00",
    "updated_at": "2026-08-18T06:42:00.805+00:00"
  },
  {
    "id": "SUB_1787130055148",
    "code": "GE405",
    "name": "Tư Tưởng Hồ Chí Minh",
    "department": "Khoa Công Nghệ - Kỹ Thuật",
    "author": "Bùi Văn Khang",
    "description": "",
    "icon": "📚",
    "chapters": [
      {
        "id": "c1",
        "name": "Chương 1",
        "description": ""
      },
      {
        "id": "c2",
        "name": "Chương 2",
        "description": ""
      },
      {
        "id": "c3",
        "name": "Chương 3:",
        "description": ""
      },
      {
        "id": "c4",
        "name": "Chương 4",
        "description": ""
      },
      {
        "id": "c5",
        "name": "Chương 5",
        "description": ""
      },
      {
        "id": "c6",
        "name": "Chương 6",
        "description": ""
      }
    ],
    "questions": [
      {
        "id": "q-1787130928458-0-417",
        "options": [
          {
            "note": "Văn bản không đề cập Đại hội IX nêu khái niệm này, Đại hội IX chỉ khẳng định tư tưởng HCM là tài sản vô giá.",
            "text": "Đại hội IX năm 2001",
            "isCorrect": false
          },
          {
            "note": "Văn bản không nhắc đến Đại hội X nêu khái niệm này.",
            "text": "Đại hội X năm 2006",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ Đại hội XI năm 2011 nêu khái niệm tư tưởng Hồ Chí Minh là một hệ thống quan điểm toàn diện và sâu sắc.",
            "text": "Đại hội XI năm 2011",
            "isCorrect": true
          },
          {
            "note": "Đại hội XIII kiên định vận dụng và phát triển sáng tạo, không phải nơi nêu khái niệm này trong văn bản.",
            "text": "Đại hội XIII năm 2021",
            "isCorrect": false
          }
        ],
        "question": "Khái niệm tư tưởng Hồ Chí Minh là \"một hệ thống quan điểm toàn diện và sâu sắc về những vấn đề cơ bản của cách mạng Việt Nam\" được nêu ra tại Đại hội đại biểu toàn quốc lần thứ mấy của Đảng Cộng sản Việt Nam?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787130928458-1-641",
        "options": [
          {
            "note": "Thiếu sự phát triển sáng tạo, kế thừa truyền thống và tiếp thu tinh hoa nhân loại.",
            "text": "Chỉ là sự vận dụng chủ nghĩa Mác Lênin vào thực tiễn Việt Nam.",
            "isCorrect": false
          },
          {
            "note": "Thiếu yếu tố vận dụng và phát triển sáng tạo chủ nghĩa Mác Lênin.",
            "text": "Chỉ tiếp thu tinh hoa văn hoá nhân loại và giá trị truyền thống.",
            "isCorrect": false
          },
          {
            "note": "Đây là đầy đủ 3 yếu tố hình thành tư tưởng Hồ Chí Minh theo văn bản.",
            "text": "Vận dụng và phát triển sáng tạo chủ nghĩa Mác Lênin, kế thừa phát triển giá trị truyền thống tốt đẹp của dân tộc, tiếp thu tinh hoa văn hoá nhân loại.",
            "isCorrect": true
          },
          {
            "note": "Văn bản nhấn mạnh sự \"vận dụng và phát triển sáng tạo\", không phải sao chép.",
            "text": "Sao chép nguyên bản chủ nghĩa Mác Lênin vào điều kiện cụ thể của Việt Nam.",
            "isCorrect": false
          }
        ],
        "question": "Tư tưởng Hồ Chí Minh là kết quả của quá trình nào dưới đây?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787130928458-2-266",
        "options": [
          {
            "note": "Văn bản ghi rõ mục tiêu là xây dựng một nước Việt Nam hòa bình, thống nhất, độc lập, dân chủ và giàu mạnh.",
            "text": "Hòa bình, thống nhất, độc lập, dân chủ và giàu mạnh.",
            "isCorrect": true
          },
          {
            "note": "\"Hội nhập quốc tế\" không được nhắc đến trong đoạn này của văn bản.",
            "text": "Độc lập, tự do và hội nhập quốc tế.",
            "isCorrect": false
          },
          {
            "note": "Đây là mục tiêu chung của Đảng hiện nay nhưng không phải là cụm từ nguyên gốc trong văn bản cung cấp.",
            "text": "Dân giàu, nước mạnh, xã hội công bằng, dân chủ, văn minh.",
            "isCorrect": false
          },
          {
            "note": "Không đầy đủ và chính xác với cụm từ trong văn bản.",
            "text": "Hòa bình, tự do và bình đẳng.",
            "isCorrect": false
          }
        ],
        "question": "Theo nội hàm thứ nhất của khái niệm, mục tiêu xây dựng nước Việt Nam theo tư tưởng Hồ Chí Minh là gì?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787130928458-3-350",
        "options": [
          {
            "note": "Văn bản khẳng định rõ \"con đường là độc lập dân tộc gắn liền với chủ nghĩa xã hội\".",
            "text": "Độc lập dân tộc gắn liền với chủ nghĩa xã hội.",
            "isCorrect": true
          },
          {
            "note": "Văn bản không đề cập nội dung này.",
            "text": "Tiến thẳng lên chủ nghĩa cộng sản.",
            "isCorrect": false
          },
          {
            "note": "Nội dung này thuộc về mục tiêu của hệ thống quan điểm (đối tượng nghiên cứu), không phải \"con đường\".",
            "text": "Giải phóng giai cấp để giải phóng dân tộc.",
            "isCorrect": false
          },
          {
            "note": "Không có trong nội dung cung cấp.",
            "text": "Xây dựng nền kinh tế thị trường.",
            "isCorrect": false
          }
        ],
        "question": "Theo nội hàm thứ nhất của khái niệm tư tưởng Hồ Chí Minh, con đường của cách mạng Việt Nam là gì?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787130928458-4-268",
        "options": [
          {
            "note": "Đây là một yếu tố cấu thành nhưng không được gọi là giá trị cơ bản nhất.",
            "text": "Giá trị truyền thống tốt đẹp của dân tộc.",
            "isCorrect": false
          },
          {
            "note": "Đây là yếu tố được \"tiếp thu\", không phải giá trị cơ bản nhất.",
            "text": "Tinh hoa văn hóa nhân loại.",
            "isCorrect": false
          },
          {
            "note": "Văn bản gọi chung là chủ nghĩa Mác Lênin.",
            "text": "Chủ nghĩa duy vật lịch sử.",
            "isCorrect": false
          },
          {
            "note": "Văn bản khẳng định rõ \"chủ nghĩa Mác Lênin là giá trị cơ bản nhất\".",
            "text": "Chủ nghĩa Mác Lênin.",
            "isCorrect": true
          }
        ],
        "question": "Trong cơ sở hình thành tư tưởng Hồ Chí Minh (nội hàm thứ hai), yếu tố nào được xem là \"giá trị cơ bản nhất\"?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787130928458-5-323",
        "options": [
          {
            "note": "Không có trong văn bản.",
            "text": "Là công cụ để đánh giá các nước trên thế giới.",
            "isCorrect": false
          },
          {
            "note": "Đoạn văn bản nêu rõ nội hàm thứ ba khẳng định đây là nền tảng tư tưởng và kim chỉ nam.",
            "text": "Làm nên nền tảng tư tưởng và kim chỉ nam cho hành động của Đảng và cách mạng Việt Nam.",
            "isCorrect": true
          },
          {
            "note": "Không phải là vai trò được nhắc đến ở nội hàm thứ ba.",
            "text": "Là nguồn gốc hình thành đạo đức cách mạng.",
            "isCorrect": false
          },
          {
            "note": "Trái với văn bản (tiếp thu tinh hoa là cơ sở hình thành tư tưởng).",
            "text": "Là cơ sở để tiếp thu tinh hoa nhân loại.",
            "isCorrect": false
          }
        ],
        "question": "Theo nội hàm thứ ba, tư tưởng Hồ Chí Minh cùng với chủ nghĩa Mác Lênin có vai trò gì?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787130928458-6-399",
        "options": [
          {
            "note": "Văn bản ghi rõ \"Cương lĩnh chính trị đầu tiên của Đảng đã thể hiện những nội dung rất cơ bản...\".",
            "text": "Cương lĩnh chính trị đầu tiên của Đảng.",
            "isCorrect": true
          },
          {
            "note": "Không được nhắc đến trong văn bản.",
            "text": "Lời kêu gọi toàn quốc kháng chiến.",
            "isCorrect": false
          },
          {
            "note": "Đại hội II kêu gọi học tập, không phải văn kiện lúc Đảng mới ra đời.",
            "text": "Nghị quyết của Đại hội II.",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản được cung cấp.",
            "text": "Tuyên ngôn độc lập.",
            "isCorrect": false
          }
        ],
        "question": "Ngay từ khi ra đời, văn kiện nào đã thể hiện những nội dung rất cơ bản của tư tưởng Hồ Chí Minh về cách mạng Việt Nam?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787130928458-7-503",
        "options": [
          {
            "note": "Không được nhắc đến trong văn bản.",
            "text": "Quốc hội nước Việt Nam Dân chủ Cộng hòa.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ \"Ban Chấp hành Trung ương Đảng tôn vinh Người là Anh hùng dân tộc vĩ đại\".",
            "text": "Ban Chấp hành Trung ương Đảng.",
            "isCorrect": true
          },
          {
            "note": "UNESCO ghi nhận năm 1987",
            "text": "Tổ chức UNESCO.",
            "isCorrect": false
          },
          {
            "note": "Không đúng với chủ thể tôn vinh trong văn bản.",
            "text": "Toàn thể nhân dân Việt Nam.",
            "isCorrect": false
          }
        ],
        "question": "Tổ chức nào đã tôn vinh Chủ tịch Hồ Chí Minh là \"Anh hùng dân tộc vĩ đại\" tại Đại hội II (tháng 2 năm 1951)?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787130928458-8-663",
        "options": [
          {
            "note": "Khái niệm được nêu ở Đại hội XI (2011).",
            "text": "Nêu ra khái niệm hoàn chỉnh về Tư tưởng Hồ Chí Minh.",
            "isCorrect": false
          },
          {
            "note": "Kêu gọi học tập diễn ra từ Đại hội II (1951).",
            "text": "Lần đầu tiên kêu gọi học tập đạo đức Hồ Chí Minh.",
            "isCorrect": false
          },
          {
            "note": "Văn bản xác nhận Đại hội VII là mốc lớn đưa ra khẳng định này.",
            "text": "Đảng đánh giá đúng tầm vóc và khẳng định lấy chủ nghĩa Mác Lênin, tư tưởng Hồ Chí Minh làm nền tảng tư tưởng, kim chỉ nam cho hành động.",
            "isCorrect": true
          },
          {
            "note": "UNESCO ra nghị quyết vào năm",
            "text": "Tổ chức UNESCO ra Nghị quyết kỷ niệm 100 năm ngày sinh của Người.",
            "isCorrect": false
          }
        ],
        "question": "Đại hội VII năm 1991 của Đảng được coi là một mốc lớn vì lý do gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787130928458-9-320",
        "options": [
          {
            "note": "Chữ \"danh nhân\" không đúng với từ ngữ trong văn bản.",
            "text": "Anh hùng dân tộc vĩ đại và Danh nhân văn hóa.",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Lãnh tụ vĩ đại của giai cấp công nhân.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi chính xác cụm từ này trong nghị quyết của UNESCO nhân kỷ niệm 100 năm ngày sinh.",
            "text": "Anh hùng giải phóng dân tộc và Nhà văn hóa kiệt xuất của Việt Nam.",
            "isCorrect": true
          },
          {
            "note": "Không chính xác từng chữ so với văn bản.",
            "text": "Anh hùng cách mạng và Nhà văn hóa lớn.",
            "isCorrect": false
          }
        ],
        "question": "Năm 1987, tổ chức UNESCO đã ra Nghị quyết ghi nhận Chủ tịch Hồ Chí Minh với danh hiệu gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787130928458-10-465",
        "options": [
          {
            "note": "Bị thiếu ý hoạt động cách mạng và cuộc sống hằng ngày.",
            "text": "Chỉ bao gồm bài nói, bài viết của Hồ Chí Minh.",
            "isCorrect": false
          },
          {
            "note": "Gộp cả 2 đoạn thuộc phần II Đối tượng nghiên cứu.",
            "text": "Toàn bộ quan điểm thể hiện trong di sản của Người và quá trình hiện thực hóa, phát triển sáng tạo hệ thống quan điểm đó.",
            "isCorrect": true
          },
          {
            "note": "Đây chỉ là đối tượng thứ hai, bỏ qua đối tượng thứ nhất.",
            "text": "Chỉ là quá trình vận động quan điểm Hồ Chí Minh trong thực tiễn.",
            "isCorrect": false
          },
          {
            "note": "Không đúng khái niệm đối tượng nghiên cứu.",
            "text": "Hệ thống các sự kiện lịch sử của dân tộc Việt Nam thế kỷ 20.",
            "isCorrect": false
          }
        ],
        "question": "Đối tượng nghiên cứu của môn học Tư tưởng Hồ Chí Minh là gì?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787130928458-11-905",
        "options": [
          {
            "note": "Văn bản liệt kê 4 cụm từ \"giải phóng\" liên tiếp.",
            "text": "Giải phóng dân tộc, giải phóng xã hội, giải phóng giai cấp và giải phóng con người.",
            "isCorrect": true
          },
          {
            "note": "Không đầy đủ và sai đối tượng.",
            "text": "Giải phóng dân tộc và giải phóng giai cấp công nhân.",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Giải phóng nông dân và trí thức.",
            "isCorrect": false
          },
          {
            "note": "Văn bản không nhắc đến bảo vệ thiên nhiên.",
            "text": "Giải phóng xã hội, giải phóng con người và bảo vệ thiên nhiên.",
            "isCorrect": false
          }
        ],
        "question": "Hệ thống quan điểm của Hồ Chí Minh nhằm mục đích giải phóng những đối tượng nào?",
        "chapterId": "c1",
        "answerIndex": 0
      },
      {
        "id": "q-1787130928458-12-48",
        "options": [
          {
            "note": "Sai hoàn toàn so với văn bản.",
            "text": "Chủ nghĩa kinh nghiệm và chủ nghĩa thực dụng.",
            "isCorrect": false
          },
          {
            "note": "Sai học thuyết.",
            "text": "Phương pháp luận chủ nghĩa duy tâm khách quan.",
            "isCorrect": false
          },
          {
            "note": "Văn bản khẳng định đây là cơ sở phương pháp luận.",
            "text": "Phương pháp luận chủ nghĩa duy vật biện chứng và chủ nghĩa duy vật lịch sử Mác Lênin.",
            "isCorrect": true
          },
          {
            "note": "Đây là phương pháp cụ thể, không phải cơ sở phương pháp luận.",
            "text": "Phương pháp chuyên ngành và liên ngành.",
            "isCorrect": false
          }
        ],
        "question": "Cơ sở phương pháp luận của việc nghiên cứu tư tưởng Hồ Chí Minh lấy phương pháp luận nào làm cơ sở?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787130928458-13-909",
        "options": [
          {
            "note": "Không có trong văn bản.",
            "text": "Giai cấp nông dân.",
            "isCorrect": false
          },
          {
            "note": "Sai hoàn toàn bản chất.",
            "text": "Giai cấp tư sản.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ \"đòi hỏi phải đứng trên lập trường giai cấp công nhân\".",
            "text": "Giai cấp công nhân.",
            "isCorrect": true
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Tầng lớp trí thức.",
            "isCorrect": false
          }
        ],
        "question": "Nguyên tắc \"Thống nhất tính đảng và tính khoa học\" đòi hỏi người nghiên cứu phải đứng trên lập trường của giai cấp nào?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787130928458-14-86",
        "options": [
          {
            "note": "Không được nhắc đến.",
            "text": "Bệnh quan liêu và tham nhũng.",
            "isCorrect": false
          },
          {
            "note": "Trích nguyên văn từ mục III.1.b.",
            "text": "Sự chủ quan, bệnh khinh lý luận và bệnh lý luận suông không áp dụng vào thực tế.",
            "isCorrect": true
          },
          {
            "note": "Dù có ý nghĩa tương đương ở ngoài đời nhưng văn bản không dùng các từ này.",
            "text": "Bệnh giáo điều và kinh nghiệm.",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Bệnh thành tích.",
            "isCorrect": false
          }
        ],
        "question": "Nguyên tắc \"Thống nhất lý luận và thực tiễn\" yêu cầu phê bình những căn bệnh nào?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787130928458-15-412",
        "options": [
          {
            "note": "Đây là quan điểm toàn diện và hệ thống.",
            "text": "Trong mối liên hệ qua lại của các yếu tố.",
            "isCorrect": false
          },
          {
            "note": "Đúng với nội dung mục III.1.c.",
            "text": "Trong mối liên hệ lịch sử căn bản, xem sự vật hiện tượng đã xuất hiện thế nào và trải qua những giai đoạn phát triển chủ yếu nào.",
            "isCorrect": true
          },
          {
            "note": "Đi ngược lại nguyên tắc lịch sử.",
            "text": "Trong trạng thái tĩnh tại không thay đổi.",
            "isCorrect": false
          },
          {
            "note": "Đây là yêu cầu của quan điểm kế thừa và phát triển.",
            "text": "Phát triển sáng tạo trong điều kiện lịch sử mới.",
            "isCorrect": false
          }
        ],
        "question": "Theo \"Quan điểm lịch sử cụ thể\", cần phải xem xét sự vật hiện tượng như thế nào?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787130928458-16-512",
        "options": [
          {
            "note": "Không phải hạt nhân.",
            "text": "Sự vận dụng chủ nghĩa Mác Lênin.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ \"hạt nhân cốt lõi là tư tưởng độc lập, tự do, dân chủ và chủ nghĩa xã hội\".",
            "text": "Độc lập, tự do, dân chủ và chủ nghĩa xã hội.",
            "isCorrect": true
          },
          {
            "note": "Thuộc nguyên tắc tính đảng.",
            "text": "Lập trường giai cấp công nhân.",
            "isCorrect": false
          },
          {
            "note": "Thuộc ý nghĩa học tập (rèn luyện phương pháp).",
            "text": "Dĩ bất biến, ứng vạn biến.",
            "isCorrect": false
          }
        ],
        "question": "Hạt nhân cốt lõi trong \"Quan điểm toàn diện và hệ thống\" là tư tưởng gì?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787130928458-17-989",
        "options": [
          {
            "note": "Phân tích văn bản được kết hợp với nghiên cứu thực tiễn.",
            "text": "Phương pháp phân tích văn bản.",
            "isCorrect": false
          },
          {
            "note": "Kết hợp với chuyên ngành, liên ngành.",
            "text": "Phương pháp điều tra xã hội học.",
            "isCorrect": false
          },
          {
            "note": "Mục III.2 nêu rõ vai trò của sự kết hợp hai phương pháp này.",
            "text": "Phương pháp lôgíc, phương pháp lịch sử và sự kết hợp phương pháp lôgíc với phương pháp lịch sử.",
            "isCorrect": true
          },
          {
            "note": "Phương pháp so sánh thuộc nhóm phương pháp liên ngành.",
            "text": "Phương pháp so sánh.",
            "isCorrect": false
          }
        ],
        "question": "Phương pháp cụ thể nào được sử dụng để \"khái quát lý luận và tìm ra bản chất, trình tự diễn biến của tư tưởng\"?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787130928458-18-127",
        "options": [
          {
            "note": "Sai cặp kết hợp.",
            "text": "Phương pháp điều tra xã hội học.",
            "isCorrect": false
          },
          {
            "note": "Mục III.2 ghi \"Phương pháp phân tích văn bản kết hợp với nghiên cứu hoạt động thực tiễn...\".",
            "text": "Phương pháp phân tích văn bản.",
            "isCorrect": true
          },
          {
            "note": "Sai cặp kết hợp.",
            "text": "Phương pháp tổng hợp.",
            "isCorrect": false
          },
          {
            "note": "Sai cặp kết hợp.",
            "text": "Phương pháp lôgíc.",
            "isCorrect": false
          }
        ],
        "question": "Theo văn bản, nghiên cứu hoạt động thực tiễn của Hồ Chí Minh cần được kết hợp với phương pháp nào?",
        "chapterId": "c1",
        "answerIndex": 1
      },
      {
        "id": "q-1787130928458-19-601",
        "options": [
          {
            "note": "Không đề cập trong phần ý nghĩa.",
            "text": "Chủ nghĩa đế quốc.",
            "isCorrect": false
          },
          {
            "note": "Thuộc phần phương pháp nghiên cứu.",
            "text": "Bệnh khinh lý luận.",
            "isCorrect": false
          },
          {
            "note": "Mục IV.2 ghi rõ \"Giúp sinh viên chống chủ nghĩa cá nhân...\".",
            "text": "Chủ nghĩa cá nhân.",
            "isCorrect": true
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Chủ nghĩa cơ hội.",
            "isCorrect": false
          }
        ],
        "question": "Ý nghĩa \"giáo dục và định hướng thực hành đạo đức cách mạng\" của việc học tập tư tưởng Hồ Chí Minh giúp sinh viên chống lại điều gì?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787130928458-20-895",
        "options": [
          {
            "note": "Đây là nguyên tắc nghiên cứu.",
            "text": "Thống nhất lý luận và thực tiễn.",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản cung cấp.",
            "text": "Vừa hồng vừa chuyên.",
            "isCorrect": false
          },
          {
            "note": "Đây là nguyên tắc nghiên cứu.",
            "text": "Kế thừa và phát triển.",
            "isCorrect": false
          },
          {
            "note": "Nêu rõ ở mục IV.3 \"...ứng xử phù hợp với hoàn cảnh theo phương châm dĩ bất biến, ứng vạn biến\".",
            "text": "Dĩ bất biến, ứng vạn biến.",
            "isCorrect": true
          }
        ],
        "question": "Theo ý nghĩa học tập, sinh viên rèn luyện phương pháp, phong cách công tác và ứng xử cần tuân theo phương châm nào?",
        "chapterId": "c1",
        "answerIndex": 3
      },
      {
        "id": "q-1787130928458-21-443",
        "options": [
          {
            "note": "Sai cơ sở nền tảng quy định trong văn bản.",
            "text": "Truyền thống yêu nước của dân tộc.",
            "isCorrect": false
          },
          {
            "note": "Sai cơ sở nền tảng.",
            "text": "Tinh hoa văn hóa nhân loại.",
            "isCorrect": false
          },
          {
            "note": "Mục IV.1 kết luận \"củng cố lập trường cách mạng trên nền tảng chủ nghĩa Mác Lênin, tư tưởng Hồ Chí Minh\".",
            "text": "Chủ nghĩa Mác Lênin, tư tưởng Hồ Chí Minh.",
            "isCorrect": true
          },
          {
            "note": "Đây là cơ sở phương pháp luận nghiên cứu, không phải cách diễn đạt phần ý nghĩa. Nguồn lấy nội dung: GT - TU TUONG HO CHI MINH (HE KHONG CHUYEN",
            "text": "Phương pháp luận chủ nghĩa duy vật lịch sử.",
            "isCorrect": false
          }
        ],
        "question": "Việc học tập môn Tư tưởng Hồ Chí Minh góp phần củng cố lập trường cách mạng trên nền tảng nào?",
        "chapterId": "c1",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-0-343",
        "options": [
          {
            "note": "Văn bản nêu rõ thực tiễn diễn ra trong bối cảnh thực dân Pháp xâm lược và biến nước ta thành thuộc địa và phong kiến.",
            "text": "Thực dân Pháp xâm lược và biến nước ta thành thuộc địa và phong kiến.",
            "isCorrect": true
          },
          {
            "note": "Văn bản cung cấp ghi là \"thuộc địa và phong kiến\", không có chữ \"nửa\".",
            "text": "Thực dân Pháp xâm lược và biến nước ta thành thuộc địa nửa phong kiến.",
            "isCorrect": false
          },
          {
            "note": "Trái với văn bản vì đã bị thực dân Pháp xâm lược và biến thành thuộc địa.",
            "text": "Trở thành nước phong kiến độc lập hoàn toàn.",
            "isCorrect": false
          },
          {
            "note": "Không có nội dung này trong văn bản.",
            "text": "Trở thành nước thuộc địa kiểu mới của đế quốc Mỹ.",
            "isCorrect": false
          }
        ],
        "question": "Bối cảnh thực tiễn Việt Nam cuối thế kỷ mười chín đầu thế kỷ hai mươi diễn ra như thế nào?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-1-250",
        "options": [
          {
            "note": "Văn bản ghi rõ sự thất bại này \"dẫn đến sự khủng hoảng sâu sắc về đường lối cứu nước\".",
            "text": "Khủng hoảng sâu sắc về đường lối cứu nước.",
            "isCorrect": true
          },
          {
            "note": "Nội dung văn bản không nhắc đến cụm từ \"lực lượng lãnh đạo\".",
            "text": "Khủng hoảng sâu sắc về lực lượng lãnh đạo.",
            "isCorrect": false
          },
          {
            "note": "Không có chi tiết này trong văn bản.",
            "text": "Dẫn đến sự thỏa hiệp với thực dân Pháp.",
            "isCorrect": false
          },
          {
            "note": "Sự ra đời của giai cấp công nhân là một yếu tố độc lập được nhắc ngay sau đó, không phải là hệ quả của việc phong trào thất bại.",
            "text": "Dẫn đến sự ra đời của giai cấp công nhân.",
            "isCorrect": false
          }
        ],
        "question": "Hệ quả của việc các phong trào đấu tranh yêu nước nổ ra liên tục nhưng đều thất bại là gì?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-2-426",
        "options": [
          {
            "note": "Văn bản ghi nhận \"Sự ra đời của giai cấp công nhân và các phong trào đấu tranh đã tạo điều kiện thuận lợi để chủ nghĩa Mác Lênin thâm nhập\".",
            "text": "Sự ra đời của giai cấp công nhân và các phong trào đấu tranh.",
            "isCorrect": true
          },
          {
            "note": "Đây là hệ quả của sự thất bại phong trào yêu nước, không phải điều kiện thuận lợi để chủ nghĩa Mác Lênin thâm nhập.",
            "text": "Sự khủng hoảng sâu sắc về đường lối cứu nước.",
            "isCorrect": false
          },
          {
            "note": "Đây là sự kiện thuộc thực tiễn thế giới, còn câu hỏi đang nói về điều kiện tại Việt Nam.",
            "text": "Thắng lợi của Cách mạng Tháng Mười Nga.",
            "isCorrect": false
          },
          {
            "note": "Đây là sự kiện thuộc thực tiễn thế giới.",
            "text": "Sự ra đời của Quốc tế Cộng sản.",
            "isCorrect": false
          }
        ],
        "question": "Yếu tố nào đã tạo điều kiện thuận lợi để chủ nghĩa Mác Lênin thâm nhập vào Việt Nam?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-3-508",
        "options": [
          {
            "note": "Văn bản khẳng định đây là \"cơ sở thực tiễn để Hồ Chí Minh chuẩn bị lý luận chính trị, tư tưởng, tổ chức sáng lập Đảng Cộng sản Việt Nam\".",
            "text": "Chuẩn bị lý luận chính trị, tư tưởng, tổ chức sáng lập Đảng Cộng sản Việt Nam.",
            "isCorrect": true
          },
          {
            "note": "Đây là tác động của các sự kiện thế giới đối với quá trình tìm đường cứu nước.",
            "text": "Đấu tranh giải phóng các dân tộc bị áp bức.",
            "isCorrect": false
          },
          {
            "note": "Nội dung này thuộc về tài năng hoạt động thực tiễn của Người.",
            "text": "Hiện thực hóa tư tưởng lý luận thành các phong trào sinh động.",
            "isCorrect": false
          },
          {
            "note": "Không đúng nguyên văn đoạn nói về cơ sở thực tiễn Việt Nam.",
            "text": "Cống hiến cho sự nghiệp cách mạng thế giới.",
            "isCorrect": false
          }
        ],
        "question": "Sự ra đời của giai cấp công nhân và các phong trào đấu tranh là cơ sở thực tiễn để Hồ Chí Minh làm gì?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-4-268",
        "options": [
          {
            "note": "Không có trong văn bản.",
            "text": "Giai đoạn chủ nghĩa tư bản tự do cạnh tranh.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ \"chủ nghĩa tư bản phát triển sang giai đoạn đế quốc chủ nghĩa\".",
            "text": "Giai đoạn đế quốc chủ nghĩa.",
            "isCorrect": true
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Giai đoạn chủ nghĩa cộng sản.",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Giai đoạn toàn cầu hóa.",
            "isCorrect": false
          }
        ],
        "question": "Thực tiễn thế giới cuối thế kỷ mười chín đầu thế kỷ hai mươi chứng kiến sự phát triển của chủ nghĩa tư bản sang giai đoạn nào?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-5-430",
        "options": [
          {
            "note": "Không đúng với từ ngữ trong văn bản.",
            "text": "Mâu thuẫn giữa tư bản và lao động.",
            "isCorrect": false
          },
          {
            "note": "Văn bản nêu rõ \"làm các mâu thuẫn giai cấp và mâu thuẫn dân tộc ngày càng gay gắt\".",
            "text": "Mâu thuẫn giai cấp và mâu thuẫn dân tộc.",
            "isCorrect": true
          },
          {
            "note": "Dù ý nghĩa tương đồng nhưng không đúng với nguyên văn cung cấp.",
            "text": "Mâu thuẫn giữa thuộc địa và đế quốc.",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Mâu thuẫn nội bộ giai cấp tư sản.",
            "isCorrect": false
          }
        ],
        "question": "Chủ nghĩa tư bản phát triển sang giai đoạn đế quốc chủ nghĩa đã làm cho các mâu thuẫn nào ngày càng gay gắt?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-6-761",
        "options": [
          {
            "note": "Văn bản liên kết trực tiếp hai sự kiện này với việc mở ra con đường giải phóng và ảnh hưởng sâu sắc đến Người.",
            "text": "Thắng lợi của Cách mạng Tháng Mười Nga năm 1917 và sự ra đời của Quốc tế Cộng sản năm 1919.",
            "isCorrect": true
          },
          {
            "note": "Các cuộc cách mạng này thuộc phần tiếp thu giá trị phương Tây, không phải sự kiện thế giới mở ra con đường giải phóng đoạn này.",
            "text": "Cuộc cách mạng tư sản Anh, Pháp, Mỹ.",
            "isCorrect": false
          },
          {
            "note": "Đây là bối cảnh thực tiễn Việt Nam.",
            "text": "Sự bùng nổ của các phong trào đấu tranh yêu nước.",
            "isCorrect": false
          },
          {
            "note": "Đây là yếu tố của thực tiễn Việt Nam.",
            "text": "Sự ra đời của giai cấp công nhân.",
            "isCorrect": false
          }
        ],
        "question": "Những sự kiện nào trên thế giới đã mở ra con đường giải phóng cho các dân tộc bị áp bức và ảnh hưởng sâu sắc đến hành trình của Hồ Chí Minh?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-7-657",
        "options": [
          {
            "note": "Đây là giá trị được Người kế thừa và phát triển, không phải nền tảng xuyên suốt.",
            "text": "Tinh thần đấu tranh bất khuất.",
            "isCorrect": false
          },
          {
            "note": "Đây là các giá trị kế thừa và phát triển.",
            "text": "Tinh thần đoàn kết, nhân ái, khoan dung.",
            "isCorrect": false
          },
          {
            "note": "Văn bản khẳng định \"chủ nghĩa yêu nước là giá trị xuyên suốt, là nền tảng tư tưởng, điểm xuất phát và động lực\".",
            "text": "Chủ nghĩa yêu nước.",
            "isCorrect": true
          },
          {
            "note": "Thuộc về những tinh thần dân tộc được kế thừa và phát triển.",
            "text": "Cần cù, dũng cảm và sáng tạo.",
            "isCorrect": false
          }
        ],
        "question": "Trong các giá trị truyền thống tốt đẹp của dân tộc Việt Nam, giá trị nào là nền tảng tư tưởng, điểm xuất phát và động lực thúc đẩy Hồ Chí Minh ra đi tìm đường cứu nước?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-8-61",
        "options": [
          {
            "note": "Văn bản liệt kê đầy đủ chuỗi giá trị này.",
            "text": "Đấu tranh bất khuất, đoàn kết, nhân ái, khoan dung, yêu dân, trọng dân, cần cù, dũng cảm và sáng tạo.",
            "isCorrect": true
          },
          {
            "note": "Đây là tinh hoa văn hóa phương Tây.",
            "text": "Tự do, bình đẳng, bác ái, nhân quyền, dân quyền.",
            "isCorrect": false
          },
          {
            "note": "Đây là giá trị của Phật giáo.",
            "text": "Từ bi, vị tha, yêu thương con người.",
            "isCorrect": false
          },
          {
            "note": "Đây là giá trị của Nho giáo.",
            "text": "Dùng nhân trị, đức trị và tu dưỡng đạo đức.",
            "isCorrect": false
          }
        ],
        "question": "Theo văn bản, bên cạnh chủ nghĩa yêu nước, Hồ Chí Minh đã kế thừa và phát triển những tinh thần nào của dân tộc Việt Nam?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-9-278",
        "options": [
          {
            "note": "Đây là giá trị của Lão giáo.",
            "text": "Sống gắn bó với thiên nhiên và thoát vòng danh lợi.",
            "isCorrect": false
          },
          {
            "note": "Đây là giá trị của Phật giáo.",
            "text": "Từ bi, vị tha, yêu thương con người.",
            "isCorrect": false
          },
          {
            "note": "Đây là của Tôn Trung Sơn.",
            "text": "Chủ nghĩa Tam dân.",
            "isCorrect": false
          },
          {
            "note": "Văn bản nêu rõ kế thừa Nho giáo về \"dùng nhân trị, đức trị và tu dưỡng đạo đức\".",
            "text": "Dùng nhân trị, đức trị và tu dưỡng đạo đức.",
            "isCorrect": true
          }
        ],
        "question": "Về tinh hoa văn hóa phương Đông, Hồ Chí Minh đã kế thừa những giá trị tích cực nào của Nho giáo?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787131795696-10-537",
        "options": [
          {
            "note": "Văn bản ghi rõ \"Phật giáo về từ bi, vị tha, yêu thương con người\".",
            "text": "Phật giáo.",
            "isCorrect": true
          },
          {
            "note": "Lão giáo về gắn bó thiên nhiên, thoát vòng danh lợi.",
            "text": "Lão giáo.",
            "isCorrect": false
          },
          {
            "note": "Nho giáo về nhân trị, đức trị.",
            "text": "Nho giáo.",
            "isCorrect": false
          },
          {
            "note": "Phương Tây về nhân quyền, dân quyền.",
            "text": "Cách mạng tư sản phương Tây.",
            "isCorrect": false
          }
        ],
        "question": "Giá trị \"từ bi, vị tha, yêu thương con người\" được Hồ Chí Minh tiếp thu từ nguồn nào?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-11-953",
        "options": [
          {
            "note": "Nho giáo nói về tu dưỡng đạo đức, nhân trị.",
            "text": "Nho giáo.",
            "isCorrect": false
          },
          {
            "note": "Phật giáo là từ bi vị tha.",
            "text": "Phật giáo.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ \"của Lão giáo về sống gắn bó với thiên nhiên và thoát vòng danh lợi\".",
            "text": "Lão giáo.",
            "isCorrect": true
          },
          {
            "note": "Không phải nội dung của chủ nghĩa Tam dân theo văn bản.",
            "text": "Chủ nghĩa Tam dân.",
            "isCorrect": false
          }
        ],
        "question": "Tư tưởng về \"sống gắn bó với thiên nhiên và thoát vòng danh lợi\" là sự kế thừa từ học thuyết nào?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-12-847",
        "options": [
          {
            "note": "Văn bản ghi rõ \"cùng chủ nghĩa Tam dân của Tôn Trung Sơn\".",
            "text": "Tôn Trung Sơn.",
            "isCorrect": true
          },
          {
            "note": "Khổng Tử liên quan đến Nho giáo.",
            "text": "Khổng Tử.",
            "isCorrect": false
          },
          {
            "note": "Lão Tử liên quan đến Lão giáo.",
            "text": "Lão Tử.",
            "isCorrect": false
          },
          {
            "note": "Phương Tây không thuộc phương Đông.",
            "text": "Các nhà khai sáng phương Tây.",
            "isCorrect": false
          }
        ],
        "question": "Chủ nghĩa Tam dân mà Hồ Chí Minh tiếp thu là của ai?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-13-273",
        "options": [
          {
            "note": "Không được nhắc tới trong phần văn hóa phương Tây.",
            "text": "Cuộc cách mạng vô sản Nga.",
            "isCorrect": false
          },
          {
            "note": "Văn bản liệt kê đầy đủ \"từ cuộc cách mạng tư sản Anh, Pháp, Mỹ và tư tưởng của các nhà khai sáng phương Tây\".",
            "text": "Cuộc cách mạng tư sản Anh, Pháp, Mỹ và tư tưởng của các nhà khai sáng phương Tây.",
            "isCorrect": true
          },
          {
            "note": "Không nằm trong phần tiếp thu tinh hoa văn hóa.",
            "text": "Phong trào đấu tranh yêu nước của giai cấp công nhân.",
            "isCorrect": false
          },
          {
            "note": "Chủ nghĩa Mác Lênin là một mục riêng biệt ở đoạn tiếp theo.",
            "text": "Chủ nghĩa Mác Lênin.",
            "isCorrect": false
          }
        ],
        "question": "Về phương Tây, Hồ Chí Minh đã trực tiếp nghiên cứu và tiếp thu các giá trị về nhân quyền, dân quyền, tự do, bình đẳng, bác ái từ đâu?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-14-889",
        "options": [
          {
            "note": "Văn bản khẳng định \"Chủ nghĩa Mác Lênin là cơ sở lý luận quyết định bước phát triển mới về chất\".",
            "text": "Chủ nghĩa Mác Lênin.",
            "isCorrect": true
          },
          {
            "note": "Yêu nước là nền tảng, điểm xuất phát.",
            "text": "Chủ nghĩa yêu nước.",
            "isCorrect": false
          },
          {
            "note": "Thuộc phần khác.",
            "text": "Giá trị truyền thống tốt đẹp của dân tộc.",
            "isCorrect": false
          },
          {
            "note": "Thuộc phần khác.",
            "text": "Tinh hoa văn hóa nhân loại.",
            "isCorrect": false
          }
        ],
        "question": "Đâu là cơ sở lý luận quyết định bước phát triển mới về chất trong tư tưởng Hồ Chí Minh?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-15-534",
        "options": [
          {
            "note": "Đây là đặc điểm của chủ nghĩa yêu nước.",
            "text": "Là điểm xuất phát và động lực.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi \"Đây là thế giới quan, phương pháp luận giúp Người triệt để kế thừa...\".",
            "text": "Là thế giới quan, phương pháp luận.",
            "isCorrect": true
          },
          {
            "note": "Không có trong nội dung phần này.",
            "text": "Là quá trình đấu tranh bất khuất.",
            "isCorrect": false
          },
          {
            "note": "Nhân tố chủ quan là phẩm chất, tài năng của bản thân Hồ Chí Minh.",
            "text": "Là nhân tố chủ quan quyết định.",
            "isCorrect": false
          }
        ],
        "question": "Chủ nghĩa Mác Lênin đóng vai trò gì giúp Hồ Chí Minh triệt để kế thừa, đổi mới các giá trị truyền thống và tinh hoa nhân loại?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-16-806",
        "options": [
          {
            "note": "Chỉ là một phần tiếp thu lý luận.",
            "text": "Tinh hoa văn hóa phương Tây.",
            "isCorrect": false
          },
          {
            "note": "Là nền tảng, động lực, không phải tiền đề lý luận quan trọng nhất.",
            "text": "Giá trị truyền thống dân tộc.",
            "isCorrect": false
          },
          {
            "note": "Văn bản nhấn mạnh chủ nghĩa Mác Lênin là \"tiền đề lý luận quan trọng nhất đóng vai trò quyết định\".",
            "text": "Chủ nghĩa Mác Lênin.",
            "isCorrect": true
          },
          {
            "note": "Không phải tiền đề quyết định.",
            "text": "Tư tưởng của các nhà khai sáng phương Tây.",
            "isCorrect": false
          }
        ],
        "question": "Yếu tố nào là tiền đề lý luận quan trọng nhất đóng vai trò quyết định trong việc hình thành tư tưởng Hồ Chí Minh?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-17-971",
        "options": [
          {
            "note": "Đây là chuỗi phẩm chất thuộc nhân tố chủ quan dẫn đến tầm nhìn chiến lược theo văn bản.",
            "text": "Lý tưởng cao cả, hoài bão lớn cứu dân cứu nước, ý chí nghị lực to lớn, bản lĩnh tư duy độc lập tự chủ, sáng tạo và giàu tính phê phán đổi mới.",
            "isCorrect": true
          },
          {
            "note": "Đây là giá trị truyền thống dân tộc Việt Nam.",
            "text": "Tinh thần đoàn kết, nhân ái, khoan dung.",
            "isCorrect": false
          },
          {
            "note": "Đây là tài năng hoạt động và tổ chức, không phải phẩm chất tư duy.",
            "text": "Biết hiện thực hóa tư tưởng lý luận thành các phong trào sinh động.",
            "isCorrect": false
          },
          {
            "note": "Đây là kết quả của vốn sống phong phú, thuộc về tài năng hoạt động.",
            "text": "Thấu hiểu sâu sắc bản chất chủ nghĩa đế quốc.",
            "isCorrect": false
          }
        ],
        "question": "Phẩm chất cá nhân nào của Hồ Chí Minh thuộc về \"nhân tố chủ quan\" giúp Người có tầm nhìn chiến lược và năng lực dự báo tương lai chính xác?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-18-301",
        "options": [
          {
            "note": "Đây là tinh thần dân tộc Người kế thừa.",
            "text": "Yêu dân, trọng dân.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ \"suốt đời tận trung với nước, tận hiếu với dân và cống hiến cho sự nghiệp cách mạng\".",
            "text": "Tận trung với nước, tận hiếu với dân và cống hiến cho sự nghiệp cách mạng.",
            "isCorrect": true
          },
          {
            "note": "Thuộc về Phật giáo.",
            "text": "Từ bi, vị tha, yêu thương con người.",
            "isCorrect": false
          },
          {
            "note": "Thuộc về giá trị truyền thống dân tộc.",
            "text": "Cần cù, dũng cảm và sáng tạo.",
            "isCorrect": false
          }
        ],
        "question": "Thái độ và mục tiêu cống hiến suốt đời của Hồ Chí Minh đối với đất nước, với nhân dân và cách mạng được thể hiện như thế nào?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-19-750",
        "options": [
          {
            "note": "Thuộc phần tiếp thu cơ sở lý luận.",
            "text": "Tiếp thu tư tưởng của các nhà khai sáng phương Tây.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi nhận rõ ràng quá trình hun đúc này.",
            "text": "Vốn sống phong phú khi làm việc, học tập và hoạt động cách mạng ở gần 30 nước trên thế giới.",
            "isCorrect": true
          },
          {
            "note": "Không đúng với chữ nghĩa của đoạn văn bản cung cấp.",
            "text": "Nghiên cứu thực tiễn phong trào đấu tranh yêu nước trong nước.",
            "isCorrect": false
          },
          {
            "note": "Không được dùng để giải thích cho tài năng hoạt động trong đoạn này.",
            "text": "Tham gia Quốc tế Cộng sản năm 1919.",
            "isCorrect": false
          }
        ],
        "question": "Tài năng hoạt động và tổng kết thực tiễn phát triển lý luận của Hồ Chí Minh được hun đúc qua quá trình nào?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-20-384",
        "options": [
          {
            "note": "Không nằm trong câu đang hỏi về tài năng tổng kết thực tiễn.",
            "text": "Tinh hoa văn hóa nhân loại.",
            "isCorrect": false
          },
          {
            "note": "Đây là tác động của Cách mạng Tháng Mười Nga và Quốc tế Cộng sản.",
            "text": "Con đường giải phóng cho các dân tộc bị áp bức.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi \"Người thấu hiểu sâu sắc bản chất chủ nghĩa đế quốc\".",
            "text": "Bản chất chủ nghĩa đế quốc.",
            "isCorrect": true
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Các mâu thuẫn giai cấp tại Việt Nam.",
            "isCorrect": false
          }
        ],
        "question": "Việc hoạt động ở gần 30 nước trên thế giới đã giúp Hồ Chí Minh thấu hiểu sâu sắc điều gì?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-21-947",
        "options": [
          {
            "note": "Thuộc về phần khái niệm, không có trong đoạn này.",
            "text": "Khái quát thành hệ thống quan điểm toàn diện.",
            "isCorrect": false
          },
          {
            "note": "Văn bản viết rõ tài năng tổ chức vĩ đại này của Người.",
            "text": "Hiện thực hóa tư tưởng lý luận thành các phong trào sinh động, đồng thời tổng kết thực tiễn để bổ sung và phát triển lý luận.",
            "isCorrect": true
          },
          {
            "note": "Trái với bản chất sáng tạo của tư tưởng Hồ Chí Minh.",
            "text": "Áp dụng máy móc vào điều kiện cụ thể của Việt Nam.",
            "isCorrect": false
          },
          {
            "note": "Đây là thuộc về phẩm chất tư duy, không phải hành động tổ chức phong trào.",
            "text": "Phê phán và đổi mới các giá trị truyền thống.",
            "isCorrect": false
          }
        ],
        "question": "Là một nhà tổ chức vĩ đại, Hồ Chí Minh đã biết làm gì với các tư tưởng lý luận?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-22-865",
        "options": [
          {
            "note": "Văn bản ghi rõ \"Thời kỳ trước năm 1911 là thời kỳ hình thành tư tưởng yêu nước và chí hướng tìm đường cứu nước mới\".",
            "text": "Tư tưởng yêu nước và chí hướng tìm đường cứu nước mới.",
            "isCorrect": true
          },
          {
            "note": "Đây là đặc điểm của thời kỳ 1911 đến 1920",
            "text": "Tư tưởng cứu nước theo con đường cách mạng vô sản.",
            "isCorrect": false
          },
          {
            "note": "Đây là đặc điểm của thời kỳ 1920 đến 1930",
            "text": "Những nội dung cơ bản tư tưởng về cách mạng Việt Nam.",
            "isCorrect": false
          },
          {
            "note": "Đây là đặc điểm của thời kỳ 1941 đến 1969",
            "text": "Tư tưởng tiếp tục phát triển, soi đường cho sự nghiệp cách mạng.",
            "isCorrect": false
          }
        ],
        "question": "Thời kỳ trước năm 1911 trong quá trình hình thành và phát triển tư tưởng Hồ Chí Minh là thời kỳ hình thành điều gì?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-23-196",
        "options": [
          {
            "note": "Nội dung này thuộc về cơ sở lý luận, không có trong đoạn nói về thời kỳ trước 1911",
            "text": "Tinh hoa văn hóa nhân loại phương Đông và phương Tây.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ Người \"Tiếp thu truyền thống tốt đẹp của quê hương, gia đình và của dân tộc\".",
            "text": "Quê hương, gia đình và của dân tộc.",
            "isCorrect": true
          },
          {
            "note": "Đây là đối tượng được truyền bá ở thời kỳ 1920-1930.",
            "text": "Phong trào công nhân và phong trào yêu nước Việt Nam.",
            "isCorrect": false
          },
          {
            "note": "Chủ nghĩa Mác Lênin chưa được tiếp thu ở giai đoạn này.",
            "text": "Chủ nghĩa Mác Lênin.",
            "isCorrect": false
          }
        ],
        "question": "Hồ Chí Minh sớm có tư tưởng yêu nước và thể hiện rõ trong hành động ở thời kỳ trước năm 1911 là nhờ tiếp thu truyền thống tốt đẹp từ đâu?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-24-694",
        "options": [
          {
            "note": "Văn bản ghi Người không tán thành phương pháp của họ.",
            "text": "Hoàn toàn đồng ý và đi theo con đường của họ.",
            "isCorrect": false
          },
          {
            "note": "Văn bản nêu rõ \"Khâm phục các vị tiền bối nhưng Người sáng suốt phê phán, không tán thành phương pháp của họ\".",
            "text": "Khâm phục nhưng sáng suốt phê phán, không tán thành phương pháp của họ.",
            "isCorrect": true
          },
          {
            "note": "Người có khâm phục các vị tiền bối, không phủ nhận hoàn toàn.",
            "text": "Phủ nhận hoàn toàn những đóng góp của họ.",
            "isCorrect": false
          },
          {
            "note": "Trái với văn bản vì Người không tán thành phương pháp.",
            "text": "Vận dụng sáng tạo phương pháp của họ vào thực tiễn.",
            "isCorrect": false
          }
        ],
        "question": "Thái độ của Hồ Chí Minh đối với các vị tiền bối trong thời kỳ trước năm 1911 được miêu tả như thế nào?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-25-337",
        "options": [
          {
            "note": "Sự kiện này diễn ra vào đầu năm 1930",
            "text": "Thành lập Đảng Cộng sản Việt Nam.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ Người \"đã quyết định đi ra nước ngoài tìm con đường cứu nước vào ngày 5 tháng 6 năm 1911\"",
            "text": "Đi ra nước ngoài tìm con đường cứu nước.",
            "isCorrect": true
          },
          {
            "note": "Sự kiện này diễn ra trong thời kỳ 1920-1930",
            "text": "Xuất bản Bản án chế độ thực dân Pháp.",
            "isCorrect": false
          },
          {
            "note": "Sự kiện này diễn ra năm 1919",
            "text": "Gửi Yêu sách tới Hội nghị Vécxây.",
            "isCorrect": false
          }
        ],
        "question": "Vì không tán thành phương pháp của các vị tiền bối, Hồ Chí Minh đã có quyết định quan trọng nào vào ngày 5 tháng 6 năm 1911?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-26-678",
        "options": [
          {
            "note": "Không được nhắc đến trong văn bản.",
            "text": "Con đường cách mạng dân chủ tư sản.",
            "isCorrect": false
          },
          {
            "note": "Văn bản xác định thời kỳ này hình thành tư tưởng cứu nước theo \"con đường cách mạng vô sản\".",
            "text": "Con đường cách mạng vô sản.",
            "isCorrect": true
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Con đường cải cách ôn hòa.",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản.",
            "text": "Con đường bạo lực vũ trang phong kiến.",
            "isCorrect": false
          }
        ],
        "question": "Thời kỳ 1911 đến 1920 là thời kỳ hình thành tư tưởng cứu nước, giải phóng dân tộc Việt Nam theo con đường nào?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-27-270",
        "options": [
          {
            "note": "Đây là năm Người ra nước ngoài tìm đường cứu nước.",
            "text": "Năm 1911.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ sự kiện \"gửi Yêu sách tới Hội nghị Vécxây năm 1919\".",
            "text": "Năm 1919.",
            "isCorrect": true
          },
          {
            "note": "Đây là năm Người nghiên cứu Sơ thảo luận cương của Lênin.",
            "text": "Năm 1920.",
            "isCorrect": false
          },
          {
            "note": "Đây là năm thành lập Đảng.",
            "text": "Năm 1930.",
            "isCorrect": false
          }
        ],
        "question": "Sự kiện Hồ Chí Minh gửi Yêu sách tới Hội nghị Vécxây diễn ra vào năm nào?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-28-143",
        "options": [
          {
            "note": "Tác phẩm này được xuất bản trong thời kỳ 1920-1930",
            "text": "Đường cách mệnh.",
            "isCorrect": false
          },
          {
            "note": "Tài liệu này được thông qua năm 1930",
            "text": "Cương lĩnh chính trị đầu tiên.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ Người \"nghiên cứu Sơ thảo lần thứ nhất những luận cương của Lênin năm 1920\"",
            "text": "Sơ thảo lần thứ nhất những luận cương của Lênin.",
            "isCorrect": true
          },
          {
            "note": "Tác phẩm này xuất bản trong giai đoạn 1920-1930",
            "text": "Bản án chế độ thực dân Pháp.",
            "isCorrect": false
          }
        ],
        "question": "Quá trình hoạt động của Hồ Chí Minh trong thời kỳ 1911 đến 1920 bao gồm việc nghiên cứu tài liệu quan trọng nào vào năm 1920?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-29-938",
        "options": [
          {
            "note": "Văn bản nêu Người \"tham gia sáng lập Đảng Cộng sản Pháp\".",
            "text": "Đảng Cộng sản Pháp.",
            "isCorrect": true
          },
          {
            "note": "Tổ chức này sáng lập ở thời kỳ 1920-1930",
            "text": "Hội Việt Nam Cách mạng Thanh niên.",
            "isCorrect": false
          },
          {
            "note": "Đảng được thành lập năm 1930",
            "text": "Đảng Cộng sản Việt Nam.",
            "isCorrect": false
          },
          {
            "note": "Mặt trận được sáng lập trong thời kỳ 1941-1969",
            "text": "Mặt trận Việt Minh.",
            "isCorrect": false
          }
        ],
        "question": "Cùng với việc gửi Yêu sách và nghiên cứu Sơ thảo luận cương của Lênin, Hồ Chí Minh còn tham gia sáng lập tổ chức nào trong thời kỳ 1911 đến 1920?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-30-663",
        "options": [
          {
            "note": "Đây là đặc điểm trước năm 1911",
            "text": "Tư tưởng yêu nước và chí hướng tìm đường cứu nước mới.",
            "isCorrect": false
          },
          {
            "note": "Văn bản khẳng định \"Thời kỳ 1920 đến 1930 là thời kỳ hình thành những nội dung cơ bản tư tưởng về cách mạng Việt Nam\".",
            "text": "Những nội dung cơ bản tư tưởng về cách mạng Việt Nam.",
            "isCorrect": true
          },
          {
            "note": "Đây là đặc điểm của thời kỳ 1911-1920",
            "text": "Tư tưởng giải phóng dân tộc theo con đường cách mạng vô sản.",
            "isCorrect": false
          },
          {
            "note": "Đây là đặc điểm trong thời kỳ 1930-1941",
            "text": "Chuyển hướng chiến lược sách lược của cách mạng.",
            "isCorrect": false
          }
        ],
        "question": "Thời kỳ 1920 đến 1930 được xác định là thời kỳ hình thành nội dung gì?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-31-416",
        "options": [
          {
            "note": "Văn bản ghi rõ Người \"tích cực truyền bá chủ nghĩa Mác Lênin vào phong trào công nhân và yêu nước Việt Nam\".",
            "text": "Phong trào công nhân và yêu nước Việt Nam.",
            "isCorrect": true
          },
          {
            "note": "Đây là nơi Người chủ trì để thành lập Đảng.",
            "text": "Hội nghị hợp nhất các tổ chức cộng sản.",
            "isCorrect": false
          },
          {
            "note": "Người tham gia sáng lập tổ chức này ở thời kỳ trước đó.",
            "text": "Đảng Cộng sản Pháp.",
            "isCorrect": false
          },
          {
            "note": "Quân đội nhân dân thành lập sau năm 1941",
            "text": "Quân đội nhân dân Việt Nam.",
            "isCorrect": false
          }
        ],
        "question": "Trong thời kỳ 1920 đến 1930, Hồ Chí Minh đã tích cực truyền bá chủ nghĩa Mác Lênin vào đâu?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-32-892",
        "options": [
          {
            "note": "Di chúc để lại trong thời kỳ 1941-1969.",
            "text": "Di chúc lịch sử.",
            "isCorrect": false
          },
          {
            "note": "Văn bản liệt kê rõ việc \"xuất bản các tác phẩm Bản án chế độ thực dân Pháp và Đường cách mệnh\" trong thời kỳ này.",
            "text": "Bản án chế độ thực dân Pháp và Đường cách mệnh.",
            "isCorrect": true
          },
          {
            "note": "Được ra đời năm 1945 thuộc thời kỳ 1941-1969",
            "text": "Lời kêu gọi Tổng khởi nghĩa.",
            "isCorrect": false
          },
          {
            "note": "Đây là văn kiện được thông qua, không gọi là xuất bản tác phẩm trong ngữ cảnh đoạn này.",
            "text": "Cương lĩnh chính trị đầu tiên.",
            "isCorrect": false
          }
        ],
        "question": "Các tác phẩm nào do Hồ Chí Minh xuất bản trong thời kỳ 1920 đến 1930?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-33-612",
        "options": [
          {
            "note": "Diễn ra năm 1941",
            "text": "Hội nghị Trung ương Đảng tháng 5 năm 1941.",
            "isCorrect": false
          },
          {
            "note": "Diễn ra trước năm 1930",
            "text": "Thành lập Hội Việt Nam Cách mạng Thanh niên.",
            "isCorrect": false
          },
          {
            "note": "Văn bản nêu rõ chuỗi sự kiện này \"vào đầu năm 1930, chấm dứt khủng hoảng về đường lối cứu nước\".",
            "text": "Chủ trì Hội nghị hợp nhất các tổ chức cộng sản, thành lập Đảng Cộng sản Việt Nam và thông qua Cương lĩnh chính trị đầu tiên.",
            "isCorrect": true
          },
          {
            "note": "Diễn ra năm 1945",
            "text": "Khai sinh nước Việt Nam Dân chủ Cộng hòa.",
            "isCorrect": false
          }
        ],
        "question": "Sự kiện nào diễn ra vào đầu năm 1930 đã chấm dứt khủng hoảng về đường lối cứu nước?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-34-217",
        "options": [
          {
            "note": "Đây là đặc điểm thời kỳ 1920-1930",
            "text": "Hình thành những nội dung cơ bản tư tưởng về cách mạng.",
            "isCorrect": false
          },
          {
            "note": "Đoạn mở đầu thời kỳ 1930-1941 ghi nhận nguyên văn nội dung này.",
            "text": "Vượt qua thử thách, giữ vững đường lối, phương pháp cách mạng Việt Nam đúng đắn, sáng tạo.",
            "isCorrect": true
          },
          {
            "note": "Đây là đặc điểm của thời kỳ 1941-1969",
            "text": "Tiếp tục phát triển, soi đường cho sự nghiệp cách mạng.",
            "isCorrect": false
          },
          {
            "note": "Đây là đặc điểm thời kỳ trước 1911",
            "text": "Hình thành tư tưởng yêu nước và chí hướng cứu nước mới.",
            "isCorrect": false
          }
        ],
        "question": "Đặc điểm của thời kỳ 1930 đến 1941 trong quá trình phát triển tư tưởng Hồ Chí Minh là gì?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-35-55",
        "options": [
          {
            "note": "Không có trong văn bản.",
            "text": "Từ thực dân Pháp và phong kiến.",
            "isCorrect": false
          },
          {
            "note": "Sự phê phán các vị tiền bối diễn ra ở thời kỳ trước năm 1911",
            "text": "Từ các vị tiền bối.",
            "isCorrect": false
          },
          {
            "note": "Văn bản nêu Người \"gặp phải sự hiểu lầm do quan điểm tả khuynh từ Quốc tế Cộng sản và một số người trong Đảng\".",
            "text": "Từ Quốc tế Cộng sản và một số người trong Đảng.",
            "isCorrect": true
          },
          {
            "note": "Đây là đối tượng được truyền bá ở thời kỳ 1920-1930",
            "text": "Từ phong trào công nhân và yêu nước.",
            "isCorrect": false
          }
        ],
        "question": "Trong thời kỳ 1930 đến 1941, Hồ Chí Minh đã gặp phải sự hiểu lầm do quan điểm tả khuynh từ ai?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-36-783",
        "options": [
          {
            "note": "Trái với tinh thần giữ vững đường lối.",
            "text": "Người từ bỏ đường lối của mình.",
            "isCorrect": false
          },
          {
            "note": "Không có chi tiết này trong văn bản.",
            "text": "Người thay đổi phương pháp cách mạng.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ \"Người vẫn kiên định với đường lối của mình\".",
            "text": "Người vẫn kiên định với đường lối của mình.",
            "isCorrect": true
          },
          {
            "note": "Không đúng với văn bản.",
            "text": "Người rời bỏ Đảng Cộng sản.",
            "isCorrect": false
          }
        ],
        "question": "Khi gặp phải sự hiểu lầm do quan điểm tả khuynh trong thời kỳ 1930 đến 1941, thái độ của Hồ Chí Minh là gì?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-37-124",
        "options": [
          {
            "note": "Đây là nhiệm vụ ở miền Bắc trong thời kỳ 1941-1969",
            "text": "Xây dựng chủ nghĩa xã hội.",
            "isCorrect": false
          },
          {
            "note": "Không được nhắc tới trong câu này.",
            "text": "Giải phóng giai cấp.",
            "isCorrect": false
          },
          {
            "note": "Văn bản khẳng định Hội nghị \"đã đặt nhiệm vụ giải phóng dân tộc lên hàng đầu\".",
            "text": "Giải phóng dân tộc.",
            "isCorrect": true
          },
          {
            "note": "Dù có thực hiện nhưng không phải cụm từ văn bản sử dụng ở đây.",
            "text": "Xây dựng lực lượng vũ trang.",
            "isCorrect": false
          }
        ],
        "question": "Hội nghị Trung ương Đảng do Hồ Chí Minh trực tiếp chủ trì vào tháng 5 năm 1941 đã đặt nhiệm vụ gì lên hàng đầu?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-38-836",
        "options": [
          {
            "note": "Đây là ý nghĩa của việc thành lập Đảng năm 1930",
            "text": "Chấm dứt khủng hoảng về đường lối cứu nước.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi Hội nghị đã \"hoàn chỉnh sự chuyển hướng chiến lược sách lược của cách mạng\".",
            "text": "Hoàn chỉnh sự chuyển hướng chiến lược sách lược của cách mạng.",
            "isCorrect": true
          },
          {
            "note": "Thuộc thời kỳ 1941-1969",
            "text": "Bổ sung hoàn thiện hệ thống quan điểm xây dựng chủ nghĩa xã hội.",
            "isCorrect": false
          },
          {
            "note": "Thuộc thời kỳ 1941-1969",
            "text": "Đề ra chiến lược lãnh đạo kháng chiến chống Mỹ.",
            "isCorrect": false
          }
        ],
        "question": "Đóng góp của Hội nghị Trung ương Đảng tháng 5 năm 1941 do Hồ Chí Minh chủ trì đối với chiến lược của cách mạng là gì?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-39-122",
        "options": [
          {
            "note": "Đây là đặc điểm thời kỳ 1911-1920",
            "text": "Thời kỳ hình thành tư tưởng cứu nước.",
            "isCorrect": false
          },
          {
            "note": "Đây là đặc điểm thời kỳ 1920-1930",
            "text": "Thời kỳ hình thành nội dung cơ bản về cách mạng.",
            "isCorrect": false
          },
          {
            "note": "Đây là đặc điểm thời kỳ 1930-1941",
            "text": "Thời kỳ vượt qua thử thách, giữ vững đường lối.",
            "isCorrect": false
          },
          {
            "note": "Câu mở đầu đoạn 5 ghi rõ nội dung này.",
            "text": "Thời kỳ tư tưởng Hồ Chí Minh tiếp tục phát triển, soi đường cho sự nghiệp cách mạng của Đảng và nhân dân ta.",
            "isCorrect": true
          }
        ],
        "question": "Đặc điểm của thời kỳ 1941 đến 1969 trong quá trình hình thành và phát triển tư tưởng Hồ Chí Minh là gì?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787131795696-40-566",
        "options": [
          {
            "note": "Sáng lập thời kỳ 1920-1930",
            "text": "Hội Việt Nam Cách mạng Thanh niên.",
            "isCorrect": false
          },
          {
            "note": "Thành lập ở các giai đoạn trước năm 1930",
            "text": "Đảng Cộng sản Pháp và Đảng Cộng sản Việt Nam.",
            "isCorrect": false
          },
          {
            "note": "Văn bản liệt kê Người \"sáng lập Mặt trận Việt Minh, Quân đội nhân dân Việt Nam\" trong thời kỳ này.",
            "text": "Mặt trận Việt Minh, Quân đội nhân dân Việt Nam.",
            "isCorrect": true
          },
          {
            "note": "Ra đời năm",
            "text": "Quốc tế Cộng sản.",
            "isCorrect": false
          }
        ],
        "question": "Những tổ chức, lực lượng nào được Hồ Chí Minh sáng lập trong thời kỳ 1941 đến 1969?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-41-381",
        "options": [
          {
            "note": "Diễn ra năm 1930",
            "text": "Thành lập Đảng Cộng sản Việt Nam.",
            "isCorrect": false
          },
          {
            "note": "Diễn ra ở giai đoạn sau.",
            "text": "Kháng chiến chống Mỹ.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi Người \"chớp thời cơ ra Lời kêu gọi Tổng khởi nghĩa và lãnh đạo thành công Cách mạng Tháng Tám năm 1945\".",
            "text": "Cách mạng Tháng Tám năm 1945.",
            "isCorrect": true
          },
          {
            "note": "Diễn ra năm 1941",
            "text": "Chuyển hướng chiến lược sách lược.",
            "isCorrect": false
          }
        ],
        "question": "Lời kêu gọi Tổng khởi nghĩa của Hồ Chí Minh đã lãnh đạo thành công sự kiện lịch sử nào?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-42-126",
        "options": [
          {
            "note": "Chưa diễn ra vào thời điểm này.",
            "text": "Giải phóng miền Nam.",
            "isCorrect": false
          },
          {
            "note": "Văn bản viết \"lãnh đạo thành công Cách mạng Tháng Tám năm 1945, khai sinh nước Việt Nam Dân chủ Cộng hòa\".",
            "text": "Khai sinh nước Việt Nam Dân chủ Cộng hòa.",
            "isCorrect": true
          },
          {
            "note": "Là kết quả của Hội nghị tháng 5/1941",
            "text": "Hoàn chỉnh chuyển hướng chiến lược cách mạng.",
            "isCorrect": false
          },
          {
            "note": "Quân đội được thành lập trước Cách mạng tháng Tám, không phải kết quả trực tiếp được nhắc kèm Cách mạng tháng Tám.",
            "text": "Thành lập Quân đội nhân dân Việt Nam.",
            "isCorrect": false
          }
        ],
        "question": "Thắng lợi của Cách mạng Tháng Tám năm 1945 đã dẫn đến kết quả lịch sử gì đối với đất nước?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-43-485",
        "options": [
          {
            "note": "Không đúng với nguyên văn.",
            "text": "Chống phong kiến và đế quốc.",
            "isCorrect": false
          },
          {
            "note": "Không có tên Nhật trong đoạn này.",
            "text": "Chống Pháp và chống Nhật.",
            "isCorrect": false
          },
          {
            "note": "Văn bản nêu \"Người đề ra chiến lược lãnh đạo hai cuộc kháng chiến chống Pháp và chống Mỹ\".",
            "text": "Chống Pháp và chống Mỹ.",
            "isCorrect": true
          },
          {
            "note": "Không đúng chữ nghĩa văn bản.",
            "text": "Chống Mỹ và tay sai.",
            "isCorrect": false
          }
        ],
        "question": "Tiếp sau Cách mạng Tháng Tám, Hồ Chí Minh đã đề ra chiến lược lãnh đạo hai cuộc kháng chiến chống lại thế lực nào?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-44-533",
        "options": [
          {
            "note": "Sai bối cảnh địa lý trong văn bản.",
            "text": "Trên cả nước.",
            "isCorrect": false
          },
          {
            "note": "Văn bản ghi rõ Người \"bổ sung hoàn thiện hệ thống quan điểm chỉ đạo xây dựng chủ nghĩa xã hội ở miền Bắc\".",
            "text": "Ở miền Bắc.",
            "isCorrect": true
          },
          {
            "note": "Miền Nam lúc này đang chống Mỹ.",
            "text": "Ở miền Nam.",
            "isCorrect": false
          },
          {
            "note": "Không đúng với từ ngữ trong văn bản.",
            "text": "Tại Việt Bắc.",
            "isCorrect": false
          }
        ],
        "question": "Trong thời kỳ 1941 đến 1969, Hồ Chí Minh đã bổ sung hoàn thiện hệ thống quan điểm chỉ đạo xây dựng chủ nghĩa xã hội ở phạm vi nào?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-45-786",
        "options": [
          {
            "note": "Đây là tác phẩm của thời kỳ 1920-1930",
            "text": "Bản án chế độ thực dân Pháp.",
            "isCorrect": false
          },
          {
            "note": "Thuộc thời kỳ 1920-1930",
            "text": "Cương lĩnh chính trị đầu tiên.",
            "isCorrect": false
          },
          {
            "note": "Của Lênin năm 1920",
            "text": "Sơ thảo lần thứ nhất những luận cương.",
            "isCorrect": false
          },
          {
            "note": "Văn bản kết thúc bằng chi tiết Người \"để lại bản Di chúc lịch sử vô giá\".",
            "text": "Bản Di chúc lịch sử vô giá.",
            "isCorrect": true
          }
        ],
        "question": "Hồ Chí Minh đã để lại tài liệu vô giá nào trong giai đoạn 1941 đến 1969?",
        "chapterId": "c2",
        "answerIndex": 3
      },
      {
        "id": "q-1787131795696-46-668",
        "options": [
          {
            "note": "Tư tưởng Hồ Chí Minh đã trực tiếp đưa cách mạng giải phóng dân tộc đến thắng lợi, mở ra kỷ nguyên mới và bắt đầu xây dựng một xã hội mới",
            "text": "Thắng lợi, mở ra kỷ nguyên mới và bắt đầu xây dựng một xã hội mới trên đất nước ta",
            "isCorrect": true
          },
          {
            "note": "Giá trị cốt lõi được nhấn mạnh đối với cách mạng Việt Nam là đưa cách mạng đến thắng lợi, mở ra kỷ nguyên mới và xây dựng xã hội mới",
            "text": "Hòa bình, thống nhất và đi lên con đường chủ nghĩa xã hội",
            "isCorrect": false
          },
          {
            "note": "Mục tiêu này thuộc về định hướng giải phóng chung của lý luận, trong khi tác động trực tiếp là mang lại thắng lợi và xây dựng xã hội mới",
            "text": "Giải phóng giai cấp, giải phóng xã hội và giải phóng con người",
            "isCorrect": false
          },
          {
            "note": "Điểm then chốt là giải phóng dân tộc gắn liền với bước khởi đầu xây dựng một xã hội mới trên đất nước ta",
            "text": "Giải phóng dân tộc và hội nhập với nền kinh tế quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Đối với cách mạng Việt Nam, tư tưởng Hồ Chí Minh đã đưa cách mạng giải phóng dân tộc đến kết quả gì?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-47-663",
        "options": [
          {
            "note": "Sự kết hợp giữa giải phóng dân tộc và tiến bộ xã hội là giá trị mang tầm vóc quốc tế đối với các nước thuộc địa",
            "text": "Mở ra con đường giải phóng dân tộc gắn với sự tiến bộ xã hội",
            "isCorrect": false
          },
          {
            "note": "Đối với cách mạng Việt Nam, tư tưởng của Người chính là bước ngoặt mở ra kỷ nguyên mới và bắt đầu tiến trình xây dựng một xã hội mới",
            "text": "Mở ra kỷ nguyên mới và bắt đầu xây dựng một xã hội mới",
            "isCorrect": true
          },
          {
            "note": "Việc thúc đẩy hợp tác và phát triển là giá trị đóng góp cho sự tiến bộ chung của nhân loại",
            "text": "Mở ra sự hợp tác và phát triển giữa các quốc gia",
            "isCorrect": false
          },
          {
            "note": "Tư tưởng của Người tập trung vào việc tạo lập kỷ nguyên độc lập và định hướng xây dựng một xã hội mới một cách toàn diện",
            "text": "Mở ra cơ hội phát triển kinh tế thị trường",
            "isCorrect": false
          }
        ],
        "question": "Tư tưởng Hồ Chí Minh đã mở ra điều gì và bắt đầu xây dựng điều gì trên đất nước ta?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-48-276",
        "options": [
          {
            "note": "Phương pháp luận dùng trong nghiên cứu lý luận, còn vai trò thực tiễn chỉ đạo hành động là nền tảng tư tưởng và kim chỉ nam",
            "text": "Là cơ sở phương pháp luận để nghiên cứu thực tiễn cách mạng",
            "isCorrect": false
          },
          {
            "note": "Sự dẫn dắt của tư tưởng Hồ Chí Minh đóng vai trò là nền tảng tư tưởng, chỗ dựa vững chắc và kim chỉ nam định hướng cho mọi hành động",
            "text": "Là nền tảng tư tưởng, chỗ dựa vững chắc và kim chỉ nam định hướng",
            "isCorrect": true
          },
          {
            "note": "Dù bao hàm giá trị giáo dục đạo đức, nhưng vai trò bao trùm nhất để định hướng hành động chung là kim chỉ nam và nền tảng tư tưởng",
            "text": "Là nguồn gốc hình thành phẩm chất đạo đức của người cách mạng",
            "isCorrect": false
          },
          {
            "note": "Tư tưởng của Người là chỗ dựa vững chắc định hướng hành động cùng với nền tảng lý luận chung, không bó hẹp trong khái niệm di sản văn hóa truyền thống",
            "text": "Là di sản văn hóa truyền thống duy nhất của Đảng và cách mạng Việt Nam",
            "isCorrect": false
          }
        ],
        "question": "Tư tưởng của Hồ Chí Minh đóng vai trò như thế nào đối với mọi hành động của Đảng và nhân dân ta?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-49-675",
        "options": [
          {
            "note": "Sự định hướng vững chắc của tư tưởng Hồ Chí Minh là cơ sở để hành động của Đảng và nhân dân ta liên tục đi từ thắng lợi này đến thắng lợi khác",
            "text": "Đi từ thắng lợi này đến thắng lợi khác",
            "isCorrect": true
          },
          {
            "note": "Vai trò định hướng xuyên suốt được khẳng định là đưa con đường cách mạng đi từ thắng lợi này đến những thắng lợi tiếp theo",
            "text": "Đi từ đấu tranh giải phóng dân tộc đến đấu tranh giai cấp",
            "isCorrect": false
          },
          {
            "note": "Khủng hoảng đường lối là hoàn cảnh lịch sử trước khi có Đảng, trong khi ý nghĩa định hướng của Người mang tính lâu dài cho mọi hành động",
            "text": "Đi từ khủng hoảng đường lối đến việc thành lập Đảng",
            "isCorrect": false
          },
          {
            "note": "Việc bổ sung lý luận là đóng góp cho thế giới, còn tiến trình của cách mạng Việt Nam là đạt được các thắng lợi liên tiếp",
            "text": "Đi từ xây dựng xã hội mới đến việc bổ sung lý luận chủ nghĩa Mác Lênin",
            "isCorrect": false
          }
        ],
        "question": "Tư tưởng Hồ Chí Minh đã định hướng cho hành động của Đảng và nhân dân ta đạt được tiến trình như thế nào?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787131795696-50-675",
        "options": [
          {
            "note": "Đối với nhân loại, tư tưởng của Người đóng góp cụ thể bằng cách vạch ra con đường giải phóng dân tộc gắn với sự tiến bộ của xã hội",
            "text": "Con đường cách mạng vô sản",
            "isCorrect": false
          },
          {
            "note": "Tư tưởng Hồ Chí Minh có giá trị to lớn khi chỉ ra hướng đi đúng đắn cho các dân tộc thuộc địa là giải phóng dân tộc gắn với sự tiến bộ xã hội",
            "text": "Con đường giải phóng dân tộc gắn với sự tiến bộ xã hội",
            "isCorrect": true
          },
          {
            "note": "Trọng tâm lý luận dành cho các quốc gia thuộc địa là vấn đề giải phóng dân tộc gắn liền với tiến bộ xã hội",
            "text": "Con đường đấu tranh giai cấp gắn với giải phóng con người",
            "isCorrect": false
          },
          {
            "note": "Đóng góp sát thực nhất cho các dân tộc bị áp bức là mang lại con đường giải phóng dân tộc kết hợp với tiến bộ xã hội",
            "text": "Con đường xây dựng chủ nghĩa cộng sản trên toàn thế giới",
            "isCorrect": false
          }
        ],
        "question": "Đối với sự phát triển tiến bộ của nhân loại, tư tưởng Hồ Chí Minh góp phần mở ra cho các dân tộc thuộc địa điều gì?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-51-970",
        "options": [
          {
            "note": "Tư tưởng của Người kế thừa, vận dụng sáng tạo và đóng góp thêm vào kho tàng lý luận chứ không bác bỏ hay thay thế hoàn toàn",
            "text": "Thay thế và làm mới hoàn toàn chủ nghĩa Mác Lênin",
            "isCorrect": false
          },
          {
            "note": "Hồ Chí Minh dùng chủ nghĩa Mác Lênin làm nền tảng thế giới quan và từ thực tiễn để bổ sung, phát triển làm phong phú thêm kho tàng này",
            "text": "Là nền tảng để xem xét lại các lý luận cũ của chủ nghĩa Mác Lênin",
            "isCorrect": false
          },
          {
            "note": "Giá trị lý luận mang tầm thời đại của tư tưởng Hồ Chí Minh là đã bổ sung phát triển kho tàng lý luận chủ nghĩa Mác Lênin",
            "text": "Bổ sung phát triển kho tàng lý luận chủ nghĩa Mác Lênin",
            "isCorrect": true
          },
          {
            "note": "Đóng góp lý luận của Người hướng tới việc giải phóng các dân tộc thuộc địa và bổ sung kho tàng lý luận chung",
            "text": "Là cơ sở để hiện thực hóa chủ nghĩa Mác Lênin ở các nước tư bản",
            "isCorrect": false
          }
        ],
        "question": "Tư tưởng Hồ Chí Minh có giá trị như thế nào đối với kho tàng lý luận chủ nghĩa Mác Lênin?",
        "chapterId": "c2",
        "answerIndex": 2
      },
      {
        "id": "q-1787131795696-52-918",
        "options": [
          {
            "note": "Vấn đề giải phóng dân tộc đã hoàn thành vai trò lịch sử ở ý trước, còn giá trị đối với thế giới hiện đại được nhấn mạnh là củng cố hòa bình",
            "text": "Nền độc lập của các dân tộc",
            "isCorrect": false
          },
          {
            "note": "Sự lan tỏa giá trị tư tưởng Hồ Chí Minh góp phần tích cực vào việc củng cố hòa bình trên toàn thế giới ngày nay",
            "text": "Hòa bình",
            "isCorrect": true
          },
          {
            "note": "Giá trị mang tính toàn cầu được khẳng định rộng mở hơn là củng cố hòa bình và thúc đẩy tình hữu nghị giữa tất cả các quốc gia",
            "text": "Liên minh giữa các nước xã hội chủ nghĩa",
            "isCorrect": false
          },
          {
            "note": "Đóng góp thực tiễn đối với nhân loại ngày nay tập trung vào các vấn đề hòa bình, đoàn kết và hợp tác quốc tế",
            "text": "Lực lượng của giai cấp công nhân quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Tư tưởng của Hồ Chí Minh góp phần tích cực củng cố điều gì trên thế giới ngày nay?",
        "chapterId": "c2",
        "answerIndex": 1
      },
      {
        "id": "q-1787131795696-53-911",
        "options": [
          {
            "note": "Tư tưởng của Người là nhân tố định hướng thúc đẩy tình hữu nghị, đoàn kết, hợp tác và sự phát triển chung giữa các quốc gia",
            "text": "Tình hữu nghị, đoàn kết, hợp tác và phát triển",
            "isCorrect": true
          },
          {
            "note": "Yếu tố thúc đẩy bao trùm và đầy đủ được xác định là tình hữu nghị, đoàn kết, hợp tác và phát triển",
            "text": "Tình đoàn kết quốc tế và sự bình đẳng",
            "isCorrect": false
          },
          {
            "note": "Phạm vi thúc đẩy rộng lớn hơn và toàn diện hơn thông qua sự hữu nghị, đoàn kết, hợp tác và cùng phát triển",
            "text": "Sự giao lưu văn hóa và phát triển kinh tế",
            "isCorrect": false
          },
          {
            "note": "Cốt lõi của việc thúc đẩy mối quan hệ tốt đẹp giữa các quốc gia trên thế giới là sự hữu nghị, đoàn kết, hợp tác và phát triển",
            "text": "Sự độc lập, tự chủ và hội nhập",
            "isCorrect": false
          }
        ],
        "question": "Cùng với việc củng cố hòa bình, tư tưởng của Hồ Chí Minh thúc đẩy những điều kiện nào giữa các quốc gia trên thế giới ngày nay?",
        "chapterId": "c2",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-0-923",
        "options": [
          {
            "note": "Tư tưởng Hồ Chí Minh khẳng định rất rõ ràng rằng độc lập, tự do chính là quyền thiêng liêng và bất khả xâm phạm của tất cả các dân tộc",
            "text": "Độc lập, tự do",
            "isCorrect": true
          },
          {
            "note": "Khái niệm được nhắc đến trực tiếp mang tính chất thiêng liêng và bất khả xâm phạm là độc lập tự do chứ không phải quyền con người nói chung",
            "text": "Quyền con người",
            "isCorrect": false
          },
          {
            "note": "Yếu tố dân chủ không được đề cập trong mệnh đề khẳng định quyền thiêng liêng của các dân tộc",
            "text": "Quyền dân chủ",
            "isCorrect": false
          },
          {
            "note": "Dù có ý nghĩa thực tiễn nhưng không phải là cụm từ gốc được khẳng định mang tính thiêng liêng bất khả xâm phạm",
            "text": "Quyền bình đẳng và tự quyết",
            "isCorrect": false
          }
        ],
        "question": "Hồ Chí Minh khẳng định điều gì là quyền thiêng liêng, bất khả xâm phạm của tất cả các dân tộc?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-1-592",
        "options": [
          {
            "note": "Đây là hai tính chất cốt lõi được gắn liền với quyền độc lập tự do của tất cả các dân tộc",
            "text": "Thiêng liêng, bất khả xâm phạm",
            "isCorrect": true
          },
          {
            "note": "Tính chất được nhấn mạnh mang ý nghĩa tuyệt đối là thiêng liêng và bất khả xâm phạm",
            "text": "Quan trọng và cấp thiết",
            "isCorrect": false
          },
          {
            "note": "Khái niệm này mang tính lý luận chung và không đúng với từ ngữ miêu tả trực tiếp tính chất của quyền độc lập",
            "text": "Khách quan và tất yếu",
            "isCorrect": false
          },
          {
            "note": "Hoàn toàn trái ngược với tính chất bất khả xâm phạm của quyền độc lập tự do",
            "text": "Tương đối và có điều kiện",
            "isCorrect": false
          }
        ],
        "question": "Quyền độc lập, tự do được Hồ Chí Minh khẳng định có tính chất như thế nào đối với tất cả các dân tộc?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-2-305",
        "options": [
          {
            "note": "Yêu cầu bắt buộc là sự gắn liền giữa độc lập dân tộc với tự do và hạnh phúc của nhân dân",
            "text": "Tự do, hạnh phúc",
            "isCorrect": true
          },
          {
            "note": "Từ ngữ chính xác quy định sự gắn kết với độc lập dân tộc là tự do và hạnh phúc",
            "text": "Ấm no, tự do",
            "isCorrect": false
          },
          {
            "note": "Không xuất hiện trong nội dung về sự gắn kết cơ bản của độc lập dân tộc",
            "text": "Quyền làm chủ",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là nội dung được nhắc đến đi kèm với độc lập dân tộc",
            "text": "Sự phát triển toàn diện",
            "isCorrect": false
          }
        ],
        "question": "Độc lập dân tộc phải gắn liền với yếu tố nào của nhân dân?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-3-490",
        "options": [
          {
            "note": "Lý do nền tảng là nếu dân không hưởng hạnh phúc tự do thì nền độc lập đó hoàn toàn vô nghĩa",
            "text": "Bởi nước độc lập mà dân không hưởng hạnh phúc tự do thì độc lập cũng chẳng có nghĩa lý gì",
            "isCorrect": true
          },
          {
            "note": "Mặc dù đúng về mặt chân lý lịch sử nhưng không phải là lời giải thích nguyên bản cho việc gắn kết này",
            "text": "Bởi vì nhân dân là gốc của nước",
            "isCorrect": false
          },
          {
            "note": "Không đúng với lý do cụ thể được đưa ra để giải thích ý nghĩa của nền độc lập",
            "text": "Bởi vì hạnh phúc là mục tiêu cuối cùng của mọi quốc gia",
            "isCorrect": false
          },
          {
            "note": "Lập luận này không phản ánh lý do trực tiếp làm mất đi nghĩa lý của nền độc lập",
            "text": "Bởi vì đó là quy luật tất yếu của sự phát triển",
            "isCorrect": false
          }
        ],
        "question": "Vì sao độc lập dân tộc phải gắn liền với tự do, hạnh phúc của nhân dân?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-4-263",
        "options": [
          {
            "note": "Một nền độc lập đúng nghĩa phải đạt được tiêu chuẩn thật sự, hoàn toàn và triệt để trên tất cả các lĩnh vực",
            "text": "Thật sự, hoàn toàn và triệt để",
            "isCorrect": true
          },
          {
            "note": "Yêu cầu chuẩn xác là sự thật sự, hoàn toàn và triệt để chứ không dùng từ tuyệt đối",
            "text": "Tuyệt đối và duy nhất",
            "isCorrect": false
          },
          {
            "note": "Cụm từ này thường dùng để chỉ hệ thống quan điểm, không phải tính chất của nền độc lập",
            "text": "Toàn diện và sâu sắc",
            "isCorrect": false
          },
          {
            "note": "Đây là tinh thần dân tộc nhưng không mô tả tiêu chuẩn nền độc lập",
            "text": "Tự chủ và tự cường",
            "isCorrect": false
          }
        ],
        "question": "Nền độc lập dân tộc phải đáp ứng yêu cầu gì trên tất cả các lĩnh vực?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-5-298",
        "options": [
          {
            "note": "Ba lĩnh vực trọng yếu mà người dân bắt buộc phải có quyền tự quyết là ngoại giao, quân đội và tài chính",
            "text": "Ngoại giao, quân đội và tài chính",
            "isCorrect": true
          },
          {
            "note": "Đây là các lĩnh vực xã hội nói chung nhưng không phải là những nội dung tự quyết cốt lõi được chỉ định",
            "text": "Kinh tế, chính trị và văn hóa",
            "isCorrect": false
          },
          {
            "note": "Các lĩnh vực này không trùng khớp với danh sách những quyền tự quyết thiết yếu",
            "text": "An ninh, quốc phòng và giáo dục",
            "isCorrect": false
          },
          {
            "note": "Việc tự quyết cụ thể nhắm vào ba yếu tố ngoại giao, quân đội và tài chính chứ không dùng các thuật ngữ này",
            "text": "Đối nội, đối ngoại và thương mại",
            "isCorrect": false
          }
        ],
        "question": "Để có nền độc lập thật sự, hoàn toàn và triệt để, người dân phải có quyền tự quyết về những lĩnh vực nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-6-836",
        "options": [
          {
            "note": "Yêu cầu không thể tách rời của độc lập dân tộc chính là sự thống nhất và toàn vẹn lãnh thổ",
            "text": "Thống nhất và toàn vẹn lãnh thổ",
            "isCorrect": true
          },
          {
            "note": "Tính chất của nền độc lập là bảo vệ toàn vẹn chứ không phải xâm chiếm hay mở rộng",
            "text": "Mở rộng và phát triển lãnh thổ",
            "isCorrect": false
          },
          {
            "note": "Đây là một hành động cụ thể nhưng khái quát chung phải là sự thống nhất và toàn vẹn",
            "text": "Bảo vệ đường biên giới",
            "isCorrect": false
          },
          {
            "note": "Từ ngữ chính xác thể hiện tính toàn vẹn và hợp nhất của lãnh thổ không phải là xây dựng",
            "text": "Xây dựng và củng cố lãnh thổ",
            "isCorrect": false
          }
        ],
        "question": "Độc lập dân tộc cũng phải gắn liền với vấn đề gì về mặt lãnh thổ?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-7-705",
        "options": [
          {
            "note": "Chân lý không thể chối cãi để minh chứng cho sự toàn vẹn và thống nhất là nước Việt Nam là một, dân tộc Việt Nam là một",
            "text": "Nước Việt Nam là một, dân tộc Việt Nam là một",
            "isCorrect": true
          },
          {
            "note": "Đây là một chân lý khác không nằm trong phần khẳng định về sự thống nhất lãnh thổ",
            "text": "Không có gì quý hơn độc lập tự do",
            "isCorrect": false
          },
          {
            "note": "Nội dung này thuộc về quyền cơ bản của con người và dân tộc nhưng không giải thích cho sự toàn vẹn lãnh thổ",
            "text": "Các dân tộc trên thế giới đều sinh ra bình đẳng",
            "isCorrect": false
          },
          {
            "note": "Không đúng với nội dung gốc miêu tả tính thống nhất của đất nước và dân tộc",
            "text": "Dân tộc Việt Nam có chung một cội nguồn",
            "isCorrect": false
          }
        ],
        "question": "Chân lý nào được khẳng định khi nhắc đến sự gắn liền giữa độc lập dân tộc với thống nhất và toàn vẹn lãnh thổ?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-8-527",
        "options": [
          {
            "note": "Định hướng cốt lõi và duy nhất để cách mạng giải phóng dân tộc giành được thắng lợi là đi theo con đường cách mạng vô sản",
            "text": "Con đường cách mạng vô sản",
            "isCorrect": true
          },
          {
            "note": "Đây là con đường của các cuộc cách mạng kiểu cũ và không phải định hướng để đi đến thắng lợi",
            "text": "Con đường cách mạng dân chủ tư sản",
            "isCorrect": false
          },
          {
            "note": "Cải cách không phải là con đường cách mạng mang lại thắng lợi triệt để cho việc giải phóng dân tộc",
            "text": "Con đường cải cách xã hội",
            "isCorrect": false
          },
          {
            "note": "Bạo lực là phương pháp tiến hành chứ không phải là tên gọi của con đường cách mạng",
            "text": "Con đường bạo lực vũ trang",
            "isCorrect": false
          }
        ],
        "question": "Cách mạng giải phóng dân tộc muốn thắng lợi phải đi theo con đường nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-9-388",
        "options": [
          {
            "note": "Đặc trưng cơ bản của con đường này là giải phóng dân tộc luôn phải gắn liền với giải phóng giai cấp",
            "text": "Giải phóng giai cấp",
            "isCorrect": true
          },
          {
            "note": "Khái niệm được kết nối trực tiếp với giải phóng dân tộc trong định hướng này là giải phóng giai cấp",
            "text": "Giải phóng con người",
            "isCorrect": false
          },
          {
            "note": "Đây là mục tiêu chi tiết nhưng không bao hàm ý nghĩa rộng của sự gắn kết cách mạng",
            "text": "Giải phóng phụ nữ",
            "isCorrect": false
          },
          {
            "note": "Nội hàm trực tiếp yêu cầu sự gắn kết đồng hành là giải phóng giai cấp",
            "text": "Giải phóng xã hội",
            "isCorrect": false
          }
        ],
        "question": "Theo định hướng con đường cách mạng vô sản, giải phóng dân tộc phải gắn với yếu tố nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-10-435",
        "options": [
          {
            "note": "Trọng tâm ưu tiên cao nhất trong sự kết hợp này chính là phải đặt giải phóng dân tộc lên hàng đầu",
            "text": "Giải phóng dân tộc",
            "isCorrect": true
          },
          {
            "note": "Đây là yếu tố đi kèm nhưng không giữ vị trí ưu tiên hàng đầu",
            "text": "Giải phóng giai cấp",
            "isCorrect": false
          },
          {
            "note": "Sự phân định rõ ràng yêu cầu giải phóng dân tộc phải mang tính dẫn dắt và đặt lên trên hết",
            "text": "Cả hai yếu tố đều ngang bằng nhau",
            "isCorrect": false
          },
          {
            "note": "Quan điểm nhấn mạnh tính xuyên suốt của việc đặt giải phóng dân tộc lên hàng đầu",
            "text": "Tùy thuộc vào hoàn cảnh lịch sử",
            "isCorrect": false
          }
        ],
        "question": "Trong mối quan hệ giữa giải phóng dân tộc và giải phóng giai cấp, yếu tố nào được đặt lên hàng đầu?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-11-930",
        "options": [
          {
            "note": "Nhân tố lãnh đạo mang tính quyết định để cách mạng tại Việt Nam giành thắng lợi là Đảng Cộng sản",
            "text": "Đảng Cộng sản",
            "isCorrect": true
          },
          {
            "note": "Đây là lực lượng mang tính chất tiên phong nhưng tổ chức đứng ra lãnh đạo toàn cục là Đảng Cộng sản",
            "text": "Giai cấp công nhân",
            "isCorrect": false
          },
          {
            "note": "Đây là nơi tập hợp lực lượng đại đoàn kết chứ không phải tổ chức giữ vai trò lãnh đạo trực tiếp",
            "text": "Mặt trận dân tộc thống nhất",
            "isCorrect": false
          },
          {
            "note": "Nông dân là lực lượng nền tảng nhưng tổ chức nắm quyền lãnh đạo là Đảng Cộng sản",
            "text": "Giai cấp nông dân",
            "isCorrect": false
          }
        ],
        "question": "Cách mạng giải phóng dân tộc trong điều kiện của Việt Nam muốn thắng lợi phải do tổ chức nào lãnh đạo?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-12-21",
        "options": [
          {
            "note": "Tính chất tiên phong của Đảng bao trùm rộng rãi, không chỉ của giai cấp công nhân mà còn của nhân dân lao động và toàn thể dân tộc",
            "text": "Của nhân dân lao động và cả dân tộc",
            "isCorrect": true
          },
          {
            "note": "Phạm vi tiên phong không bị giới hạn chỉ ở hai giai cấp này mà mở rộng ra toàn dân tộc",
            "text": "Của giai cấp công nhân và nông dân",
            "isCorrect": false
          },
          {
            "note": "Mặc dù đúng về tính chất nhưng cụm từ chuẩn xác định danh là nhân dân lao động và cả dân tộc",
            "text": "Của toàn thể nhân dân yêu nước",
            "isCorrect": false
          },
          {
            "note": "Không đúng với việc khẳng định bản chất tiên phong rộng khắp toàn dân tộc",
            "text": "Của lực lượng trí thức và giai cấp vô sản",
            "isCorrect": false
          }
        ],
        "question": "Đảng Cộng sản vừa là đội tiên phong của giai cấp công nhân vừa là đội tiên phong của những lực lượng nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-13-797",
        "options": [
          {
            "note": "Chỗ dựa vững chắc và rộng lớn nhất cho sức mạnh cách mạng chính là lực lượng đại đoàn kết toàn dân tộc",
            "text": "Lực lượng đại đoàn kết toàn dân tộc",
            "isCorrect": true
          },
          {
            "note": "Đây thiên về phương thức tiến hành chứ không mô tả bản chất cấu thành khối lực lượng",
            "text": "Đấu tranh vũ trang toàn dân",
            "isCorrect": false
          },
          {
            "note": "Lực lượng cách mạng không chỉ dựa vào bộ phận nhỏ này mà phải mang tính toàn dân tộc",
            "text": "Tầng lớp trí thức và tư sản dân tộc",
            "isCorrect": false
          },
          {
            "note": "Sức mạnh nội lực được nhấn mạnh thông qua sự đoàn kết của dân tộc chứ không phụ thuộc ngoại lực",
            "text": "Sự viện trợ của phong trào quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Về mặt lực lượng, cách mạng giải phóng dân tộc phải dựa trên cơ sở nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-14-952",
        "options": [
          {
            "note": "Cấu trúc vững chắc nhất làm nền tảng cho sự đại đoàn kết chính là khối liên minh công nông",
            "text": "Liên minh công nông",
            "isCorrect": true
          },
          {
            "note": "Lực lượng nền tảng cốt lõi chỉ bao gồm liên minh công nông",
            "text": "Liên minh công nông và trí thức",
            "isCorrect": false
          },
          {
            "note": "Thuật ngữ chính xác mô tả trụ cột nền tảng này là liên minh công nông",
            "text": "Liên minh giai cấp vô sản",
            "isCorrect": false
          },
          {
            "note": "Tư sản dân tộc thuộc về khối đoàn kết mở rộng chứ không tạo thành nền tảng cốt lõi",
            "text": "Liên minh công nhân và tư sản dân tộc",
            "isCorrect": false
          }
        ],
        "question": "Khối lực lượng đại đoàn kết toàn dân tộc phải lấy liên minh nào làm nền tảng?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-15-744",
        "options": [
          {
            "note": "Nguyên lý cốt lõi lý giải cho việc cần phải tập hợp sức mạnh toàn dân chính là vì cách mệnh là việc chung của cả dân chúng",
            "text": "Vì cách mệnh là việc chung của cả dân chúng",
            "isCorrect": true
          },
          {
            "note": "Dù thực tế đông đảo nhưng nguyên nhân sâu xa được khẳng định là tính chất việc chung của đại chúng",
            "text": "Vì đây là lực lượng đông đảo nhất trong xã hội",
            "isCorrect": false
          },
          {
            "note": "Mức độ áp bức không phải là lý do gốc rễ giải thích cho sức mạnh đoàn kết toàn dân",
            "text": "Vì giai cấp công nhân và nông dân bị áp bức nặng nề nhất",
            "isCorrect": false
          },
          {
            "note": "Yếu tố thúc đẩy lực lượng đoàn kết xuất phát từ bản chất công việc của toàn dân chứ không chỉ vì lý luận quy định",
            "text": "Vì đây là quy định của con đường cách mạng vô sản",
            "isCorrect": false
          }
        ],
        "question": "Vì sao cách mạng giải phóng dân tộc phải dựa trên lực lượng đại đoàn kết toàn dân tộc với nền tảng là liên minh công nông?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-16-812",
        "options": [
          {
            "note": "Cách mạng ở thuộc địa không hề bị động mà mang tính chủ động, sáng tạo và hoàn toàn có khả năng giành thắng lợi trước cách mạng ở chính quốc",
            "text": "Cần chủ động, sáng tạo, có khả năng giành thắng lợi trước",
            "isCorrect": true
          },
          {
            "note": "Tính chất chủ động và khả năng thắng lợi trước đã phủ nhận sự phụ thuộc hoàn toàn này",
            "text": "Phụ thuộc hoàn toàn vào thắng lợi của cách mạng ở chính quốc",
            "isCorrect": false
          },
          {
            "note": "Khả năng giành thắng lợi trước cho thấy không có sự bắt buộc phải diễn ra song song cùng lúc",
            "text": "Bắt buộc phải diễn ra đồng thời với thắng lợi ở chính quốc",
            "isCorrect": false
          },
          {
            "note": "Cách mạng giải phóng dân tộc mang vai trò chủ động quyết định chứ không chỉ làm hậu phương",
            "text": "Là hậu phương vững chắc chỉ mang tính chất hỗ trợ cho chính quốc",
            "isCorrect": false
          }
        ],
        "question": "Tính chất của cách mạng giải phóng dân tộc trước sự tác động với cách mạng vô sản ở chính quốc là gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-17-179",
        "options": [
          {
            "note": "Động lực trực tiếp quyết định khả năng đi trước giành thắng lợi chính là sức mạnh và tinh thần đấu tranh mãnh liệt của nhân dân thuộc địa",
            "text": "Sức mạnh và tinh thần đấu tranh của nhân dân thuộc địa",
            "isCorrect": true
          },
          {
            "note": "Sự suy yếu của kẻ thù là điều kiện khách quan nhưng nhân tố quyết định trực tiếp là sức mạnh của nhân dân thuộc địa",
            "text": "Sự suy yếu và khủng hoảng của chủ nghĩa đế quốc",
            "isCorrect": false
          },
          {
            "note": "Yếu tố tự chủ và tự cường của nhân dân thuộc địa mới là nền tảng tạo nên khả năng thắng lợi trước",
            "text": "Sự lãnh đạo chỉ đạo của Quốc tế Cộng sản",
            "isCorrect": false
          },
          {
            "note": "Dù có hỗ trợ nhưng nền tảng cốt lõi sinh ra sự chủ động chiến thắng là sức mạnh đấu tranh của chính nhân dân thuộc địa",
            "text": "Sự hỗ trợ đắc lực từ phong trào vô sản quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Khả năng giành thắng lợi trước của cách mạng giải phóng dân tộc dựa vào yếu tố sức mạnh cốt lõi nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-18-930",
        "options": [
          {
            "note": "Con đường tất yếu và phương pháp bắt buộc phải áp dụng để giải phóng dân tộc là phương pháp bạo lực cách mạng",
            "text": "Phương pháp bạo lực cách mạng",
            "isCorrect": true
          },
          {
            "note": "Bản chất của cách mạng không thể tiến hành bằng sự hòa bình nhượng bộ",
            "text": "Phương pháp đấu tranh hòa bình",
            "isCorrect": false
          },
          {
            "note": "Ngoại giao chỉ mang tính phụ trợ trong khi phương pháp quyết định cục diện là bạo lực cách mạng",
            "text": "Phương pháp thương lượng ngoại giao",
            "isCorrect": false
          },
          {
            "note": "Đấu tranh chính trị đơn thuần là chưa đủ mà phải đặt trong tổng thể bạo lực cách mạng",
            "text": "Phương pháp đấu tranh chính trị đơn thuần",
            "isCorrect": false
          }
        ],
        "question": "Phương pháp cơ bản để tiến hành cách mạng giải phóng dân tộc là gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-19-543",
        "options": [
          {
            "note": "Mục đích cốt lõi và tất yếu của việc dùng bạo lực là để đập tan sự chống phá của bạo lực phản cách mạng",
            "text": "Dùng bạo lực cách mạng để chống lại bạo lực phản cách mạng",
            "isCorrect": true
          },
          {
            "note": "Dù giành chính quyền là kết quả nhưng bản chất phương pháp là lấy bạo lực chính nghĩa chống lại bạo lực phi nghĩa",
            "text": "Nhanh chóng giành được chính quyền từ tay kẻ thù",
            "isCorrect": false
          },
          {
            "note": "Đích đến là chống lại sự đàn áp bạo lực chứ không đơn thuần là sự tiêu diệt vật lý",
            "text": "Tiêu diệt triệt để hoàn toàn kẻ thù",
            "isCorrect": false
          },
          {
            "note": "Bạo lực cách mạng được sử dụng vì mục đích tự vệ và giải phóng chứ không phải để phô trương uy thế",
            "text": "Khẳng định và phô trương sức mạnh của lực lượng vũ trang",
            "isCorrect": false
          }
        ],
        "question": "Việc sử dụng phương pháp bạo lực cách mạng nhằm mục đích cốt lõi gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-20-142",
        "options": [
          {
            "note": "Cấu thành đầy đủ sức mạnh của bạo lực cách mạng là sự gắn kết chặt chẽ giữa đấu tranh chính trị và đấu tranh vũ trang",
            "text": "Kết hợp đấu tranh chính trị và đấu tranh vũ trang",
            "isCorrect": true
          },
          {
            "note": "Ngoại giao không cấu thành nội hàm cốt lõi của phương pháp bạo lực cách mạng",
            "text": "Kết hợp đấu tranh quân sự và đấu tranh ngoại giao",
            "isCorrect": false
          },
          {
            "note": "Hai mặt trận này không trực tiếp tạo ra sức mạnh bạo lực lật đổ chế độ phản cách mạng",
            "text": "Kết hợp đấu tranh kinh tế và đấu tranh tư tưởng",
            "isCorrect": false
          },
          {
            "note": "Đấu tranh nghị viện là con đường hòa bình, hoàn toàn trái ngược với bản chất bạo lực cách mạng cần có vũ trang",
            "text": "Kết hợp đấu tranh quần chúng và đấu tranh nghị viện",
            "isCorrect": false
          }
        ],
        "question": "Bạo lực cách mạng được thông qua sự kết hợp của những hình thức đấu tranh nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-21-233",
        "options": [
          {
            "note": "Định nghĩa về chủ nghĩa xã hội nhấn mạnh rõ đây là xã hội do nhân dân lao động làm chủ",
            "text": "Nhân dân lao động",
            "isCorrect": true
          },
          {
            "note": "Chủ thể làm chủ được xác định rộng hơn bao gồm toàn thể nhân dân lao động chứ không chỉ riêng một giai cấp",
            "text": "Giai cấp công nhân",
            "isCorrect": false
          },
          {
            "note": "Lực lượng này là một bộ phận nhưng không đại diện thay thế cho toàn thể nhân dân lao động trong khái niệm làm chủ",
            "text": "Tầng lớp trí thức",
            "isCorrect": false
          },
          {
            "note": "Chủ thể đích thực làm chủ xã hội phải là nhân dân lao động",
            "text": "Các tổ chức chính trị xã hội",
            "isCorrect": false
          }
        ],
        "question": "Theo quan niệm của Hồ Chí Minh, chủ nghĩa xã hội là một xã hội do bộ phận nào làm chủ?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-22-945",
        "options": [
          {
            "note": "Đặc điểm về đời sống trong xã hội chủ nghĩa mang lại công ăn việc làm, sự ấm no hạnh phúc và xóa bỏ hoàn toàn áp bức bóc lột",
            "text": "Có công ăn việc làm, được ấm no hạnh phúc, không còn áp bức bóc lột",
            "isCorrect": true
          },
          {
            "note": "Đặc điểm này không nằm trong định nghĩa được cung cấp về chủ nghĩa xã hội",
            "text": "Có tài sản riêng và tự do kinh doanh",
            "isCorrect": false
          },
          {
            "note": "Mặc dù mang tính thiết thực nhưng đây không phải là những cụm từ gốc được sử dụng để mô tả xã hội mới",
            "text": "Được học hành miễn phí và chăm sóc y tế",
            "isCorrect": false
          },
          {
            "note": "Chủ nghĩa xã hội hướng tới việc không còn áp bức bóc lột chứ không tạo ra đặc quyền kinh tế cho riêng ai",
            "text": "Có quyền lợi kinh tế vượt trội so với các giai cấp khác",
            "isCorrect": false
          }
        ],
        "question": "Trong xã hội chủ nghĩa, đời sống của mọi người được bảo đảm những điều kiện thiết yếu nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-23-957",
        "options": [
          {
            "note": "Quá trình tiến lên chủ nghĩa xã hội hoàn toàn không phải là ý muốn chủ quan mà là một tất yếu khách quan của lịch sử",
            "text": "Là một tất yếu khách quan của lịch sử",
            "isCorrect": true
          },
          {
            "note": "Tính tất yếu khách quan phủ nhận hoàn toàn sự ngẫu nhiên",
            "text": "Là sự lựa chọn ngẫu nhiên của các dân tộc",
            "isCorrect": false
          },
          {
            "note": "Tính chất khách quan của lịch sử đã bác bỏ yếu tố chủ quan áp đặt",
            "text": "Là một quá trình chủ quan do con người sắp đặt",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là nội dung miêu tả tính chất của quá trình tiến lên chủ nghĩa xã hội",
            "text": "Là con đường chung duy nhất cho mọi quốc gia tư bản",
            "isCorrect": false
          }
        ],
        "question": "Việc tiến lên chủ nghĩa xã hội được Hồ Chí Minh đánh giá mang tính chất gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-24-522",
        "options": [
          {
            "note": "Điểm xuất phát đặc thù của Việt Nam trên con đường này chính là từ một nước nông nghiệp lạc hậu",
            "text": "Từ một nước nông nghiệp lạc hậu",
            "isCorrect": true
          },
          {
            "note": "Hoàn cảnh thực tế được xác định rõ là một nền nông nghiệp lạc hậu",
            "text": "Từ một nước phong kiến phát triển",
            "isCorrect": false
          },
          {
            "note": "Dù mang ý nghĩa lịch sử nhưng cụm từ miêu tả thực trạng xuất phát ở đây là nước nông nghiệp lạc hậu",
            "text": "Từ một nước thuộc địa nửa phong kiến",
            "isCorrect": false
          },
          {
            "note": "Trái ngược hoàn toàn với tình trạng xuất phát điểm thực tế của đất nước",
            "text": "Từ một nước công nghiệp mới nổi",
            "isCorrect": false
          }
        ],
        "question": "Quá trình tiến thẳng lên chủ nghĩa xã hội đối với Việt Nam xuất phát từ hoàn cảnh thực tiễn nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-25-652",
        "options": [
          {
            "note": "Tiến trình của Việt Nam mang tính đặc thù khi đi thẳng lên chủ nghĩa xã hội mà bỏ qua giai đoạn phát triển tư bản chủ nghĩa",
            "text": "Giai đoạn phát triển tư bản chủ nghĩa",
            "isCorrect": true
          },
          {
            "note": "Chế độ phong kiến đã tồn tại trước đó chứ không phải là giai đoạn được bỏ qua để lên chủ nghĩa xã hội",
            "text": "Giai đoạn phát triển phong kiến",
            "isCorrect": false
          },
          {
            "note": "Thời kỳ quá độ là tất yếu và đang diễn ra chứ không hề bị bỏ qua",
            "text": "Giai đoạn quá độ",
            "isCorrect": false
          },
          {
            "note": "Đấu tranh cải tạo xã hội cũ vẫn là nhiệm vụ của thời kỳ này chứ không bị bỏ qua",
            "text": "Giai đoạn đấu tranh giai cấp",
            "isCorrect": false
          }
        ],
        "question": "Con đường tiến lên chủ nghĩa xã hội ở Việt Nam đã bỏ qua giai đoạn phát triển nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-26-162",
        "options": [
          {
            "note": "Nền tảng chính trị của xã hội mới được định hình rõ nét thông qua việc nhân dân là người làm chủ",
            "text": "Chính trị do nhân dân làm chủ",
            "isCorrect": true
          },
          {
            "note": "Mặc dù Đảng lãnh đạo nhưng đặc trưng chính trị nền tảng được nhấn mạnh là quyền làm chủ của nhân dân",
            "text": "Chính trị do một đảng duy nhất lãnh đạo",
            "isCorrect": false
          },
          {
            "note": "Yếu tố này không xuất hiện trong các đặc trưng cơ bản được định hình",
            "text": "Chính trị dựa trên sự phân quyền",
            "isCorrect": false
          },
          {
            "note": "Không liên quan đến đặc trưng cơ bản về mặt chính trị được nêu ra",
            "text": "Chính trị tuân theo pháp luật quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Đặc trưng cơ bản về mặt chính trị của chủ nghĩa xã hội là gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-27-741",
        "options": [
          {
            "note": "Yếu tố then chốt tạo nên sự phát triển cao của kinh tế chủ nghĩa xã hội chính là lực lượng sản xuất hiện đại",
            "text": "Lực lượng sản xuất hiện đại",
            "isCorrect": true
          },
          {
            "note": "Sự phát triển kinh tế phải dựa trên sự hiện đại hóa chứ không dừng lại ở mức truyền thống",
            "text": "Nền nông nghiệp truyền thống",
            "isCorrect": false
          },
          {
            "note": "Khái niệm này không nằm trong đặc trưng kinh tế của chủ nghĩa xã hội được cung cấp",
            "text": "Kinh tế thị trường tự do",
            "isCorrect": false
          },
          {
            "note": "Viện trợ là yếu tố hỗ trợ bên ngoài chứ không phải nền tảng cơ sở của nền kinh tế phát triển cao",
            "text": "Sự viện trợ của các nước anh em",
            "isCorrect": false
          }
        ],
        "question": "Nền kinh tế phát triển cao của chủ nghĩa xã hội dựa trên cơ sở nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-28-365",
        "options": [
          {
            "note": "Đặc trưng cốt lõi về mặt sở hữu cấu thành nền kinh tế xã hội chủ nghĩa là chế độ công hữu về tư liệu sản xuất chủ yếu",
            "text": "Chế độ công hữu về tư liệu sản xuất chủ yếu",
            "isCorrect": true
          },
          {
            "note": "Sự tư hữu hoàn toàn trái ngược với bản chất kinh tế của chủ nghĩa xã hội",
            "text": "Chế độ tư hữu về mọi tư liệu sản xuất",
            "isCorrect": false
          },
          {
            "note": "Thuật ngữ này không nằm trong đặc trưng cơ bản được quy định",
            "text": "Chế độ cổ phần hóa toàn dân",
            "isCorrect": false
          },
          {
            "note": "Cụm từ chuẩn xác được sử dụng để khái quát là chế độ công hữu về tư liệu sản xuất chủ yếu",
            "text": "Chế độ sở hữu nhà nước tuyệt đối",
            "isCorrect": false
          }
        ],
        "question": "Chế độ sở hữu nào về tư liệu sản xuất chủ yếu được áp dụng trong nền kinh tế chủ nghĩa xã hội?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-29-917",
        "options": [
          {
            "note": "Sự phát triển cao của văn hóa đạo đức đóng vai trò quan trọng trong việc bảo đảm công bằng xã hội",
            "text": "Công bằng xã hội",
            "isCorrect": true
          },
          {
            "note": "Yếu tố được văn hóa đạo đức bảo đảm là sự công bằng chứ không nhấn mạnh vào tự do cá nhân",
            "text": "Sự tự do cá nhân",
            "isCorrect": false
          },
          {
            "note": "Khái niệm này không được kết nối với đặc trưng văn hóa đạo đức",
            "text": "Quyền con người tuyệt đối",
            "isCorrect": false
          },
          {
            "note": "Văn hóa đạo đức nhằm bảo đảm công bằng xã hội chứ không trực tiếp bảo đảm kinh tế thị trường",
            "text": "Sự phát triển kinh tế thị trường",
            "isCorrect": false
          }
        ],
        "question": "Đặc trưng về văn hóa đạo đức của chủ nghĩa xã hội nhằm bảo đảm điều kiện gì trong xã hội?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-30-263",
        "options": [
          {
            "note": "Sự nghiệp này được khẳng định mang tính tập thể của nhân dân dưới sự lãnh đạo xuyên suốt của Đảng",
            "text": "Của nhân dân dưới sự lãnh đạo của Đảng",
            "isCorrect": true
          },
          {
            "note": "Chủ thể xây dựng là toàn thể nhân dân và tổ chức lãnh đạo là Đảng",
            "text": "Của giai cấp công nhân dưới sự lãnh đạo của Nhà nước",
            "isCorrect": false
          },
          {
            "note": "Chủ thể và cơ quan lãnh đạo không đúng với nguyên văn cung cấp",
            "text": "Của toàn quân dưới sự lãnh đạo của Quốc hội",
            "isCorrect": false
          },
          {
            "note": "Không phản ánh đúng sự quy định về công trình tập thể của nhân dân",
            "text": "Của các tổ chức chính trị dưới sự lãnh đạo của giai cấp vô sản",
            "isCorrect": false
          }
        ],
        "question": "Công cuộc xây dựng chủ nghĩa xã hội là công trình tập thể của ai và dưới sự lãnh đạo của tổ chức nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-31-958",
        "options": [
          {
            "note": "Về mặt chính trị thì mục tiêu cốt lõi phải đạt được là xây dựng một chế độ dân chủ do nhân dân làm chủ",
            "text": "Xây dựng chế độ dân chủ do nhân dân làm chủ",
            "isCorrect": true
          },
          {
            "note": "Dù mang ý nghĩa thực tiễn nhưng không phải là mục tiêu chính trị gốc được khẳng định",
            "text": "Xây dựng nhà nước pháp quyền vững mạnh",
            "isCorrect": false
          },
          {
            "note": "Hoàn toàn trái ngược với quan điểm về chính trị tại Việt Nam",
            "text": "Xây dựng hệ thống chính trị đa nguyên đa đảng",
            "isCorrect": false
          },
          {
            "note": "Đây là mục tiêu về mặt an ninh quốc phòng chứ không phải mục tiêu chính trị nền tảng",
            "text": "Xây dựng nền quốc phòng toàn dân vững chắc",
            "isCorrect": false
          }
        ],
        "question": "Mục tiêu chính trị của việc xây dựng chủ nghĩa xã hội ở Việt Nam là gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-32-400",
        "options": [
          {
            "note": "Nền kinh tế phát triển cao luôn được yêu cầu phải gắn bó mật thiết với mục tiêu chính trị",
            "text": "Gắn bó mật thiết với mục tiêu chính trị",
            "isCorrect": true
          },
          {
            "note": "Sự tách rời giữa kinh tế và chính trị đi ngược lại với định hướng xây dựng chủ nghĩa xã hội",
            "text": "Độc lập hoàn toàn với mục tiêu chính trị",
            "isCorrect": false
          },
          {
            "note": "Mối quan hệ được xác định là sự gắn bó mật thiết chứ không phải sự quyết định một chiều",
            "text": "Quyết định hoàn toàn mục tiêu chính trị",
            "isCorrect": false
          },
          {
            "note": "Yếu tố gắn kết mật thiết được chỉ ra là mục tiêu chính trị chứ không phải văn hóa",
            "text": "Đặt dưới sự chi phối của mục tiêu văn hóa",
            "isCorrect": false
          }
        ],
        "question": "Mục tiêu kinh tế trong xây dựng chủ nghĩa xã hội ở Việt Nam có mối quan hệ như thế nào với mục tiêu chính trị?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-33-63",
        "options": [
          {
            "note": "Ba đặc tính trụ cột của nền văn hóa cần xây dựng là mang tính dân tộc, khoa học và đại chúng",
            "text": "Tính dân tộc, khoa học, đại chúng",
            "isCorrect": true
          },
          {
            "note": "Cụm từ này ra đời ở giai đoạn sau và không đúng với nguyên văn trong tài liệu",
            "text": "Tính tiên tiến, đậm đà bản sắc dân tộc",
            "isCorrect": false
          },
          {
            "note": "Các tính chất này không nằm trong tiêu chuẩn mục tiêu văn hóa được cung cấp",
            "text": "Tính hiện đại, bao dung, nhân văn",
            "isCorrect": false
          },
          {
            "note": "Không phản ánh đúng ba tính chất cốt lõi của mục tiêu văn hóa",
            "text": "Tính truyền thống, cổ điển, dân chủ",
            "isCorrect": false
          }
        ],
        "question": "Mục tiêu văn hóa là xây dựng nền văn hóa mang những tính chất cơ bản nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-34-957",
        "options": [
          {
            "note": "Sự phát triển văn hóa không thể khép kín mà bắt buộc phải tiếp thu tinh hoa văn hóa nhân loại",
            "text": "Tiếp thu tinh hoa văn hóa nhân loại",
            "isCorrect": true
          },
          {
            "note": "Tư tưởng Hồ Chí Minh khuyến khích tiếp thu những tinh hoa chứ không bài xích cực đoan",
            "text": "Chống lại mọi luồng văn hóa phương Tây",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là nội dung nằm trong mục tiêu văn hóa được chỉ định",
            "text": "Truyền bá văn hóa Việt Nam ra toàn cầu",
            "isCorrect": false
          },
          {
            "note": "Hành động này trái ngược hoàn toàn với tư tưởng văn hóa tiến bộ và nhân văn",
            "text": "Đồng hóa các nền văn hóa lân cận",
            "isCorrect": false
          }
        ],
        "question": "Cùng với việc giữ vững các tính chất cơ bản, mục tiêu văn hóa còn yêu cầu phải làm gì đối với thế giới?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-35-414",
        "options": [
          {
            "note": "Việc thiết lập các quan hệ xã hội mới hướng tới đích đến cuối cùng là bảo đảm dân chủ, công bằng và văn minh",
            "text": "Dân chủ, công bằng, văn minh",
            "isCorrect": true
          },
          {
            "note": "Đây là các yếu tố vĩ mô chung chứ không phải nội dung cụ thể của mục tiêu quan hệ xã hội",
            "text": "Hòa bình, ổn định, phát triển",
            "isCorrect": false
          },
          {
            "note": "Khẩu hiệu này thuộc về cách mạng tư sản chứ không định danh cho mục tiêu quan hệ xã hội mới",
            "text": "Tự do, bình đẳng, bác ái",
            "isCorrect": false
          },
          {
            "note": "Các yếu tố này không khớp với cụm tiêu chuẩn của quan hệ xã hội được đề ra",
            "text": "Trật tự, kỷ cương, an toàn",
            "isCorrect": false
          }
        ],
        "question": "Mục tiêu quan hệ xã hội khi xây dựng chủ nghĩa xã hội ở Việt Nam là bảo đảm những yếu tố nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-36-434",
        "options": [
          {
            "note": "Toàn bộ sức mạnh thúc đẩy công cuộc xây dựng chủ nghĩa xã hội được hội tụ đầy đủ qua các yếu tố về dân, các tổ chức và con người mới",
            "text": "Lợi ích của dân, dân chủ của dân, sức mạnh đoàn kết toàn dân, hoạt động của các tổ chức và vai trò của con người Việt Nam mới",
            "isCorrect": true
          },
          {
            "note": "Các yếu tố này mang tính hỗ trợ bên ngoài hoặc kỹ thuật chứ không phải động lực căn bản từ nội sinh",
            "text": "Sự viện trợ quốc tế, sức mạnh quân sự và sự phát triển của khoa học công nghệ",
            "isCorrect": false
          },
          {
            "note": "Những yếu tố này không phản ánh bản chất động lực của chủ nghĩa xã hội",
            "text": "Cuộc đấu tranh giai cấp, sự cạnh tranh thị trường và lợi ích cá nhân",
            "isCorrect": false
          },
          {
            "note": "Mặc dù có đóng góp nhưng không đầy đủ và đúng với hệ thống động lực được liệt kê",
            "text": "Lực lượng trí thức, tinh thần yêu nước và phong trào thi đua",
            "isCorrect": false
          }
        ],
        "question": "Hệ thống động lực của chủ nghĩa xã hội bao gồm những yếu tố nào dưới đây?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-37-907",
        "options": [
          {
            "note": "Sự phát triển không thể tách rời việc kiến tạo cái mới đồng thời bài trừ cái xấu thông qua sự kết hợp chặt chẽ giữa xây và chống",
            "text": "Cần kết hợp chặt chẽ giữa xây và chống",
            "isCorrect": true
          },
          {
            "note": "Nguyên tắc đưa ra là sự kết hợp chặt chẽ chứ không phải phân định thứ tự trước sau một cách cực đoan",
            "text": "Cần ưu tiên chống lại cái cũ trước khi xây dựng cái mới",
            "isCorrect": false
          },
          {
            "note": "Việc phát huy động lực yêu cầu sự kết hợp toàn diện giữa xây và chống chứ không chỉ tập trung vào kinh tế",
            "text": "Cần tập trung hoàn toàn vào việc xây dựng nền kinh tế",
            "isCorrect": false
          },
          {
            "note": "Hành động chống tiêu cực phải gắn liền với xây dựng trong một mối quan hệ kết hợp chặt chẽ",
            "text": "Cần loại bỏ ngay lập tức mọi tư tưởng phong kiến",
            "isCorrect": false
          }
        ],
        "question": "Trong quá trình phát huy động lực của chủ nghĩa xã hội, yêu cầu nào mang tính nguyên tắc về mặt hành động?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-38-115",
        "options": [
          {
            "note": "Sự thay đổi toàn diện mọi mặt của đời sống xã hội khiến thời kỳ này mang tính chất là công cuộc cải biến sâu sắc nhất",
            "text": "Là công cuộc cải biến sâu sắc nhất",
            "isCorrect": true
          },
          {
            "note": "Sự thay đổi cấu trúc xã hội diễn ra lâu dài chứ không thể nhanh chóng",
            "text": "Là công cuộc cải biến nhanh chóng nhất",
            "isCorrect": false
          },
          {
            "note": "Trái ngược hoàn toàn với bản chất phức tạp và gian khổ của thời kỳ này",
            "text": "Là công cuộc cải biến dễ dàng nhất",
            "isCorrect": false
          },
          {
            "note": "Công cuộc cải biến phải đi sâu vào cốt lõi mọi lĩnh vực chứ không nằm ở bề ngoài",
            "text": "Là công cuộc cải biến mang tính bề ngoài",
            "isCorrect": false
          }
        ],
        "question": "Tính chất của công cuộc cải biến trong thời kỳ quá độ lên chủ nghĩa xã hội ở Việt Nam được đánh giá như thế nào về mặt mức độ?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-39-617",
        "options": [
          {
            "note": "Thực tiễn hành trình thay đổi phương thức phát triển xã hội tất yếu dẫn đến tính chất phức tạp, lâu dài, khó khăn và gian khổ",
            "text": "Phức tạp, lâu dài, khó khăn và gian khổ",
            "isCorrect": true
          },
          {
            "note": "Hoàn toàn sai lệch với nhận định về tính chất của quá trình quá độ",
            "text": "Thuận lợi, ngắn hạn, đơn giản và dễ dàng",
            "isCorrect": false
          },
          {
            "note": "Không đúng với những từ ngữ dùng để phản ánh mức độ khó khăn của thời kỳ cải biến",
            "text": "Ôn hòa, thỏa hiệp, từ từ và ổn định",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là tính chất thực tế mô tả thời kỳ quá độ",
            "text": "Đột phá, thần tốc, triệt để và bạo lực",
            "isCorrect": false
          }
        ],
        "question": "Bên cạnh sự cải biến sâu sắc, thời kỳ quá độ lên chủ nghĩa xã hội ở Việt Nam còn mang những tính chất gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-40-60",
        "options": [
          {
            "note": "Tính chất quá độ đặc thù và quan trọng nhất của Việt Nam là đi thẳng lên chủ nghĩa xã hội từ xuất phát điểm nông nghiệp lạc hậu mà không qua tư bản chủ nghĩa",
            "text": "Từ một nước nông nghiệp lạc hậu tiến thẳng lên chủ nghĩa xã hội không trải qua giai đoạn phát triển tư bản chủ nghĩa",
            "isCorrect": true
          },
          {
            "note": "Sự phát triển tuần tự này không áp dụng cho hoàn cảnh thực tế lịch sử của Việt Nam",
            "text": "Từ một nước phong kiến tiến lên chủ nghĩa tư bản rồi mới lên chủ nghĩa xã hội",
            "isCorrect": false
          },
          {
            "note": "Định hướng quá độ là đi thẳng lên chủ nghĩa xã hội và không trải qua giai đoạn tư bản chủ nghĩa",
            "text": "Xây dựng chủ nghĩa xã hội song song với việc phát triển tư bản chủ nghĩa",
            "isCorrect": false
          },
          {
            "note": "Thực tế xuất phát điểm lúc bước vào quá độ là một nền nông nghiệp lạc hậu",
            "text": "Hoàn thành công nghiệp hóa hiện đại hóa trước khi bắt đầu thời kỳ quá độ",
            "isCorrect": false
          }
        ],
        "question": "Đặc điểm lớn nhất của thời kỳ quá độ lên chủ nghĩa xã hội ở Việt Nam là gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-41-323",
        "options": [
          {
            "note": "Nhiệm vụ tất yếu để làm sạch nền tảng xã hội là đấu tranh cải tạo và xóa bỏ tàn tích xã hội cũ",
            "text": "Đấu tranh cải tạo, xóa bỏ tàn tích xã hội cũ",
            "isCorrect": true
          },
          {
            "note": "Tàn tích xã hội cũ mang tính cản trở nên phải xóa bỏ chứ không được bảo tồn",
            "text": "Kế thừa và bảo tồn nguyên vẹn tàn tích xã hội cũ",
            "isCorrect": false
          },
          {
            "note": "Việc thỏa hiệp sẽ làm mất đi tính triệt để của sự nghiệp cải biến xã hội",
            "text": "Thỏa hiệp và chung sống với tàn tích xã hội cũ",
            "isCorrect": false
          },
          {
            "note": "Tàn tích xã hội cũ không thể trở thành động lực phát triển mà phải bị đấu tranh cải tạo và xóa bỏ",
            "text": "Cải cách tàn tích xã hội cũ thành động lực phát triển",
            "isCorrect": false
          }
        ],
        "question": "Trong thời kỳ quá độ, nhiệm vụ đối với tàn tích của xã hội cũ là gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-42-13",
        "options": [
          {
            "note": "Sự kiến tạo những giá trị mới đòi hỏi phải tuân thủ nghiêm ngặt tính phù hợp với quy luật tiến lên chủ nghĩa xã hội và được áp dụng bao trùm trên tất cả các lĩnh vực",
            "text": "Phù hợp với quy luật tiến lên chủ nghĩa xã hội trên tất cả các lĩnh vực",
            "isCorrect": true
          },
          {
            "note": "Phạm vi xây dựng không chỉ bó hẹp ở kinh tế mà phải trên tất cả các lĩnh vực để đáp ứng quy luật tiến lên chủ nghĩa xã hội",
            "text": "Phù hợp với tiêu chuẩn quốc tế trong lĩnh vực kinh tế",
            "isCorrect": false
          },
          {
            "note": "Nội dung này không phải là định hướng trung tâm của nhiệm vụ xây dựng yếu tố mới",
            "text": "Phù hợp với văn hóa phương Đông trong lĩnh vực tinh thần",
            "isCorrect": false
          },
          {
            "note": "Yêu cầu cốt lõi là sự phù hợp với quy luật tiến lên chủ nghĩa xã hội mang tính khách quan",
            "text": "Phù hợp với nguyện vọng của một bộ phận nhân dân",
            "isCorrect": false
          }
        ],
        "question": "Việc xây dựng các yếu tố mới trong thời kỳ quá độ phải đáp ứng yêu cầu gì và diễn ra trên phạm vi nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-43-991",
        "options": [
          {
            "note": "Sự vững chắc của mọi đường lối, tư tưởng và hành động đều phải được đặt trên cơ sở nền tảng chủ nghĩa Mác Lênin",
            "text": "Nền tảng chủ nghĩa Mác Lênin",
            "isCorrect": true
          },
          {
            "note": "Truyền thống là cơ sở kế thừa nhưng nền tảng định hướng hành động tiến lên xã hội mới là chủ nghĩa Mác Lênin",
            "text": "Nền tảng tư tưởng dân tộc truyền thống",
            "isCorrect": false
          },
          {
            "note": "Yêu nước là động lực nhưng nền tảng tư tưởng lý luận chỉ đạo là chủ nghĩa Mác Lênin",
            "text": "Nền tảng chủ nghĩa yêu nước",
            "isCorrect": false
          },
          {
            "note": "Sai lệch hoàn toàn với cơ sở lý luận của công cuộc xây dựng chủ nghĩa xã hội tại Việt Nam",
            "text": "Nền tảng triết học phương Tây",
            "isCorrect": false
          }
        ],
        "question": "Theo nguyên tắc xây dựng chủ nghĩa xã hội, mọi tư tưởng hành động phải dựa trên nền tảng nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-44-406",
        "options": [
          {
            "note": "Thái độ cầu thị và tinh thần quốc tế được thể hiện qua nguyên tắc đoàn kết học tập kinh nghiệm các nước anh em",
            "text": "Đoàn kết học tập kinh nghiệm các nước anh em",
            "isCorrect": true
          },
          {
            "note": "Thái độ khép kín này trái với nguyên tắc mở rộng đoàn kết học tập",
            "text": "Tự lực cánh sinh không cần học tập từ bất kỳ ai",
            "isCorrect": false
          },
          {
            "note": "Học tập kinh nghiệm nhưng phải kết hợp với việc giữ vững độc lập dân tộc chứ không được sao chép máy móc",
            "text": "Sao chép toàn bộ mô hình của các nước đi trước",
            "isCorrect": false
          },
          {
            "note": "Đối tượng học tập được nhấn mạnh ở đây là các nước anh em",
            "text": "Chỉ học tập kinh nghiệm của các nước tư bản phát triển",
            "isCorrect": false
          }
        ],
        "question": "Việc học tập kinh nghiệm từ bên ngoài trong nguyên tắc xây dựng chủ nghĩa xã hội được quy định như thế nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145408-45-615",
        "options": [
          {
            "note": "Mối liên hệ biện chứng không thể tách rời để xã hội phát triển lành mạnh là nguyên tắc xây phải đi đôi với chống",
            "text": "Xây phải đi đôi với chống",
            "isCorrect": true
          },
          {
            "note": "Việc bỏ qua hành động chống sẽ khiến những yếu tố tiêu cực kìm hãm sự phát triển của cái mới",
            "text": "Chỉ xây mà không chống",
            "isCorrect": false
          },
          {
            "note": "Nguyên tắc yêu cầu hai hành động này phải đi đôi và song hành cùng nhau",
            "text": "Chống trước xây sau",
            "isCorrect": false
          },
          {
            "note": "Cả hai yếu tố xây và chống phải được thực hiện song song như một thể thống nhất không thể tách rời",
            "text": "Lấy chống làm nền tảng quyết định sự thành bại",
            "isCorrect": false
          }
        ],
        "question": "Nguyên tắc nào phản ánh sự kết hợp bắt buộc giữa việc tạo lập cái mới và loại bỏ cái tiêu cực trong công cuộc xây dựng?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-46-866",
        "options": [
          {
            "note": "Để bảo đảm sự tự chủ trong quá trình xây dựng, nguyên tắc bắt buộc là phải giữ vững độc lập dân tộc",
            "text": "Giữ vững độc lập dân tộc",
            "isCorrect": true
          },
          {
            "note": "Dù quan trọng nhưng độc lập dân tộc mới là nguyên tắc chính trị cốt lõi được liệt kê song song với các nền tảng tư tưởng",
            "text": "Giữ vững tốc độ tăng trưởng kinh tế",
            "isCorrect": false
          },
          {
            "note": "Đây là nền tảng lực lượng nhưng nguyên tắc tổng thể định hướng quá trình xây dựng nhắc tới việc giữ vững độc lập dân tộc",
            "text": "Giữ vững liên minh công nông",
            "isCorrect": false
          },
          {
            "note": "Việc bảo vệ truyền thống thuộc về mục tiêu văn hóa chứ không phải nguyên tắc chính trị bảo vệ quyền tự quyết của quốc gia",
            "text": "Giữ vững truyền thống văn hóa",
            "isCorrect": false
          }
        ],
        "question": "Yếu tố then chốt nào phải được giữ vững song song với việc dựa trên nền tảng chủ nghĩa Mác Lênin và học tập các nước anh em?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-47-608",
        "options": [
          {
            "note": "Văn bản khẳng định rõ độc lập dân tộc chính là cơ sở và tiền đề để tiến lên chủ nghĩa xã hội",
            "text": "Là cơ sở, tiền đề để tiến lên chủ nghĩa xã hội",
            "isCorrect": true
          },
          {
            "note": "Đây là vai trò của chủ nghĩa xã hội đối với độc lập dân tộc chứ không phải chiều ngược lại",
            "text": "Là điều kiện để bảo đảm vững chắc nền độc lập",
            "isCorrect": false
          },
          {
            "note": "Việc tạo ra nền tảng ý thức xã hội là vai trò trực tiếp của chủ nghĩa xã hội",
            "text": "Là nền tảng ý thức xã hội để bảo vệ chủ quyền",
            "isCorrect": false
          },
          {
            "note": "Khái niệm này không nằm trong phần nội dung được cung cấp",
            "text": "Là mục tiêu duy nhất của cách mạng vô sản",
            "isCorrect": false
          }
        ],
        "question": "Độc lập dân tộc đóng vai trò gì đối với việc tiến lên chủ nghĩa xã hội?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-48-500",
        "options": [
          {
            "note": "Theo văn bản thì giải phóng dân tộc chính là mục tiêu đầu tiên nhằm tạo sức mạnh to lớn cho cách mạng xã hội chủ nghĩa",
            "text": "Là mục tiêu đầu tiên tạo sức mạnh to lớn",
            "isCorrect": true
          },
          {
            "note": "Văn bản chỉ ghi đây là mục tiêu đầu tiên chứ không phải là mục tiêu cuối cùng",
            "text": "Là mục tiêu cuối cùng và xuyên suốt",
            "isCorrect": false
          },
          {
            "note": "Việc tạo cơ sở phát triển trên các lĩnh vực là vai trò của bản thân chủ nghĩa xã hội",
            "text": "Là cơ sở phát triển mạnh mẽ trên tất cả các lĩnh vực",
            "isCorrect": false
          },
          {
            "note": "Không đúng với từ ngữ và ý nghĩa trong văn bản cung cấp",
            "text": "Là mục tiêu trung tâm của thời kỳ quá độ",
            "isCorrect": false
          }
        ],
        "question": "Đối với cách mạng xã hội chủ nghĩa, giải phóng dân tộc được xác định là mục tiêu mang lại ý nghĩa gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-49-816",
        "options": [
          {
            "note": "Văn bản ghi rõ chủ nghĩa xã hội là điều kiện để bảo đảm nền độc lập dân tộc vững chắc",
            "text": "Nền độc lập dân tộc vững chắc",
            "isCorrect": true
          },
          {
            "note": "Yếu tố này thuộc về lực lượng nền tảng của cách mạng chứ không phải nội dung được nhắc đến ở đây",
            "text": "Khối liên minh công nông vững chắc",
            "isCorrect": false
          },
          {
            "note": "Hoàn toàn không có nội dung này trong đoạn văn bản",
            "text": "Sự nghiệp đấu tranh giai cấp vững chắc",
            "isCorrect": false
          },
          {
            "note": "Văn bản nhấn mạnh vào việc bảo đảm nền độc lập dân tộc chứ không nói riêng về lực lượng vũ trang",
            "text": "Lực lượng vũ trang nhân dân vững chắc",
            "isCorrect": false
          }
        ],
        "question": "Chủ nghĩa xã hội đóng vai trò là điều kiện để bảo đảm cho yếu tố nào được vững chắc?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-50-542",
        "options": [
          {
            "note": "Văn bản khẳng định chủ nghĩa xã hội tạo ra nền tảng ý thức xã hội và cơ sở phát triển mạnh mẽ trên tất cả các lĩnh vực để bảo vệ chủ quyền",
            "text": "Nền tảng ý thức xã hội và cơ sở phát triển mạnh mẽ trên tất cả các lĩnh vực",
            "isCorrect": true
          },
          {
            "note": "Không đúng với các từ ngữ gốc trong văn bản miêu tả về vai trò của chủ nghĩa xã hội",
            "text": "Nền tảng kinh tế thị trường và cơ sở hạ tầng hiện đại",
            "isCorrect": false
          },
          {
            "note": "Cụm từ nguyên bản được cung cấp là nền tảng ý thức xã hội và phát triển trên tất cả các lĩnh vực",
            "text": "Nền tảng văn hóa dân tộc và cơ sở khoa học công nghệ",
            "isCorrect": false
          },
          {
            "note": "Các thuật ngữ này không xuất hiện trong đoạn văn bản",
            "text": "Nền tảng pháp lý và cơ sở chính trị đối ngoại",
            "isCorrect": false
          }
        ],
        "question": "Nhằm mục đích bảo vệ chủ quyền, chủ nghĩa xã hội đã tạo ra những nền tảng và cơ sở nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-51-422",
        "options": [
          {
            "note": "Yếu tố kiên quyết đầu tiên được nêu ra là phải bảo đảm vai trò lãnh đạo tuyệt đối của Đảng Cộng sản",
            "text": "Bảo đảm vai trò lãnh đạo tuyệt đối của Đảng Cộng sản",
            "isCorrect": true
          },
          {
            "note": "Yếu tố này không được nhắc đến trong điều kiện của văn bản cung cấp",
            "text": "Bảo đảm vai trò quản lý điều hành của Nhà nước",
            "isCorrect": false
          },
          {
            "note": "Văn bản nhấn mạnh vào vai trò lãnh đạo của Đảng Cộng sản",
            "text": "Bảo đảm vai trò làm chủ của Mặt trận Tổ quốc",
            "isCorrect": false
          },
          {
            "note": "Trái với cụm từ nguyên bản về vai trò lãnh đạo tuyệt đối của Đảng",
            "text": "Bảo đảm sự kết hợp của các tổ chức chính trị xã hội",
            "isCorrect": false
          }
        ],
        "question": "Yêu cầu then chốt về mặt tổ chức để bảo đảm độc lập dân tộc gắn liền với chủ nghĩa xã hội là phải bảo đảm vai trò của tổ chức nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-52-368",
        "options": [
          {
            "note": "Điều kiện quan trọng song hành là củng cố tăng cường khối đại đoàn kết dân tộc",
            "text": "Củng cố tăng cường khối đại đoàn kết dân tộc",
            "isCorrect": true
          },
          {
            "note": "Lực lượng được nhấn mạnh mang tính bao trùm toàn diện là khối đại đoàn kết dân tộc",
            "text": "Củng cố tăng cường khối liên minh công nông",
            "isCorrect": false
          },
          {
            "note": "Đây là bản chất của Đảng chứ không mô tả đúng khối lực lượng cần củng cố trong nội dung này",
            "text": "Củng cố đội tiên phong của giai cấp công nhân",
            "isCorrect": false
          },
          {
            "note": "Không có nội dung này trong phần điều kiện được liệt kê",
            "text": "Củng cố sức mạnh của quân đội quốc gia",
            "isCorrect": false
          }
        ],
        "question": "Cùng với việc bảo đảm vai trò lãnh đạo của Đảng, điều kiện tiếp theo để bảo vệ mối quan hệ giữa độc lập dân tộc và chủ nghĩa xã hội là phải củng cố lực lượng nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-53-460",
        "options": [
          {
            "note": "Mối liên hệ quốc tế bắt buộc phải có là sự đoàn kết gắn bó chặt chẽ với cách mạng thế giới",
            "text": "Đoàn kết gắn bó chặt chẽ với cách mạng thế giới",
            "isCorrect": true
          },
          {
            "note": "Thuật ngữ mang tính bao quát và chính xác trong văn bản là cách mạng thế giới",
            "text": "Đoàn kết gắn bó chặt chẽ với phong trào giải phóng thuộc địa",
            "isCorrect": false
          },
          {
            "note": "Không đúng với quy mô và đối tượng đoàn kết được nêu trong văn bản",
            "text": "Đoàn kết gắn bó chặt chẽ với các nước trong khu vực",
            "isCorrect": false
          },
          {
            "note": "Yếu tố đối ngoại được chỉ định rõ ràng là cách mạng thế giới",
            "text": "Đoàn kết gắn bó chặt chẽ với lực lượng gìn giữ hòa bình",
            "isCorrect": false
          }
        ],
        "question": "Về mặt đối ngoại, điều kiện để bảo đảm độc lập dân tộc gắn liền với chủ nghĩa xã hội đòi hỏi phải có sự đoàn kết gắn bó chặt chẽ với lực lượng nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-54-837",
        "options": [
          {
            "note": "Sự kiên định mục tiêu và con đường cách mạng được thể hiện rõ qua việc nắm vững ngọn cờ độc lập dân tộc và chủ nghĩa xã hội",
            "text": "Ngọn cờ độc lập dân tộc và chủ nghĩa xã hội",
            "isCorrect": true
          },
          {
            "note": "Quyền làm chủ là yếu tố cần phát huy, nhưng định hướng xuyên suốt cần nắm vững để dẫn dắt cách mạng là ngọn cờ độc lập dân tộc và chủ nghĩa xã hội",
            "text": "Quyền làm chủ của nhân dân lao động",
            "isCorrect": false
          },
          {
            "note": "Đại đoàn kết là nền tảng sức mạnh, còn mục tiêu và con đường cách mạng được khẳng định mang tính định hướng là độc lập dân tộc và chủ nghĩa xã hội",
            "text": "Khối đại đoàn kết toàn dân tộc",
            "isCorrect": false
          },
          {
            "note": "Dù đóng vai trò làm nền tảng lý luận, nhưng ngọn cờ thực tiễn dẫn dắt con đường cách mạng được nhấn mạnh ở đây là độc lập dân tộc và chủ nghĩa xã hội",
            "text": "Nền tảng tư tưởng chủ nghĩa Mác Lênin",
            "isCorrect": false
          }
        ],
        "question": "Trong giai đoạn hiện nay, Đảng và nhân dân ta kiên định mục tiêu và con đường cách mạng mà Hồ Chí Minh đã xác định là phải nắm vững điều gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-55-59",
        "options": [
          {
            "note": "Yêu cầu trọng tâm đặt ra để xây dựng chế độ mới là phải phát huy mạnh mẽ sức mạnh của nền dân chủ xã hội chủ nghĩa",
            "text": "Dân chủ xã hội chủ nghĩa",
            "isCorrect": true
          },
          {
            "note": "Chế độ dân chủ mang tính chất nền tảng cần phát huy sức mạnh được định danh chính xác là dân chủ xã hội chủ nghĩa",
            "text": "Dân chủ đại nghị nhân dân",
            "isCorrect": false
          },
          {
            "note": "Chế độ dân chủ tư sản thuộc về hình thái kinh tế xã hội cũ và hoàn toàn trái ngược với định hướng cách mạng của nước ta",
            "text": "Dân chủ tư sản",
            "isCorrect": false
          },
          {
            "note": "Thuật ngữ chuẩn xác được sử dụng để định hướng phát huy sức mạnh chính trị là dân chủ xã hội chủ nghĩa",
            "text": "Dân chủ tập trung toàn diện",
            "isCorrect": false
          }
        ],
        "question": "Theo định hướng vận dụng tư tưởng Hồ Chí Minh hiện nay, chúng ta cần phát huy sức mạnh của nền dân chủ nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-56-420",
        "options": [
          {
            "note": "Mục đích tối thượng và bản chất tốt đẹp của nền dân chủ xã hội chủ nghĩa là bảo đảm tất cả quyền lực nhà nước đều phải thuộc về nhân dân",
            "text": "Thuộc về nhân dân",
            "isCorrect": true
          },
          {
            "note": "Quyền lực nhà nước mang tính rộng khắp và được trao cho toàn thể nhân dân thay vì bị thu hẹp chỉ trong một giai cấp",
            "text": "Thuộc về giai cấp công nhân",
            "isCorrect": false
          },
          {
            "note": "Đảng mang sứ mệnh lãnh đạo, còn quyền lực nhà nước thực sự phải được bảo đảm giao phó và thuộc về nhân dân",
            "text": "Thuộc về Đảng cầm quyền",
            "isCorrect": false
          },
          {
            "note": "Hệ thống chính trị là công cụ thực thi, bản chất gốc rễ của quyền lực nhà nước bắt buộc phải thuộc về nhân dân",
            "text": "Thuộc về hệ thống chính trị",
            "isCorrect": false
          }
        ],
        "question": "Việc phát huy sức mạnh dân chủ xã hội chủ nghĩa nhằm mục đích bảo đảm tất cả quyền lực nhà nước thuộc về chủ thể nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-57-330",
        "options": [
          {
            "note": "Chìa khóa để phát huy đầy đủ quyền làm chủ của nhân dân là phải củng cố, kiện toàn và phát huy sức mạnh hoạt động của toàn bộ hệ thống chính trị",
            "text": "Toàn bộ hệ thống chính trị",
            "isCorrect": true
          },
          {
            "note": "Việc phát huy quyền làm chủ đòi hỏi sự đồng bộ và sức mạnh tổng hợp của toàn bộ hệ thống chính trị chứ không thể chỉ dựa vào nhánh hành pháp",
            "text": "Hệ thống cơ quan hành pháp",
            "isCorrect": false
          },
          {
            "note": "Khối liên minh này là nền tảng xã hội, trong khi tổ chức bộ máy cần kiện toàn để phục vụ nhân dân là toàn bộ hệ thống chính trị",
            "text": "Khối liên minh công nông",
            "isCorrect": false
          },
          {
            "note": "Mặt trận chỉ là một bộ phận, sự vận hành trơn tru nhằm bảo đảm quyền làm chủ cần đến sức mạnh của toàn bộ hệ thống chính trị",
            "text": "Mặt trận Tổ quốc Việt Nam",
            "isCorrect": false
          }
        ],
        "question": "Để quyền làm chủ của nhân dân được phát huy đầy đủ, chúng ta cần củng cố, kiện toàn và nâng cao hiệu quả hoạt động của tổ chức nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-58-8",
        "options": [
          {
            "note": "Sự vững mạnh và hoạt động hiệu quả của toàn bộ hệ thống chính trị phục vụ trực tiếp cho mục đích làm cho quyền làm chủ của nhân dân được phát huy đầy đủ",
            "text": "Để quyền làm chủ của nhân dân được phát huy đầy đủ",
            "isCorrect": true
          },
          {
            "note": "Việc củng cố hệ thống chính trị ở khía cạnh này hướng thẳng đến việc bảo đảm dân chủ và quyền làm chủ của nhân dân thay vì mục tiêu kinh tế",
            "text": "Để hoàn thành mục tiêu công nghiệp hóa hiện đại hóa",
            "isCorrect": false
          },
          {
            "note": "Mục đích nội sinh và trọng tâm nhất trị được đề cập đến trong quá trình kiện toàn hệ thống chính trị là phát huy đầy đủ quyền làm chủ của nhân dân",
            "text": "Để nâng cao năng lực đối ngoại của đất nước",
            "isCorrect": false
          },
          {
            "note": "An ninh quốc gia là nhiệm vụ bảo vệ, còn mục tiêu chính trị nền tảng khi kiện toàn hệ thống là phát huy quyền làm chủ của nhân dân",
            "text": "Để bảo vệ an ninh quốc gia",
            "isCorrect": false
          }
        ],
        "question": "Mục đích cốt lõi của việc củng cố, kiện toàn, phát huy sức mạnh và hiệu quả hoạt động của toàn bộ hệ thống chính trị là gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-59-702",
        "options": [
          {
            "note": "Những biểu hiện tiêu cực gây nguy hại khôn lường cần kiên quyết đấu tranh chống lại chính là sự suy thoái về tư tưởng chính trị, đạo đức và lối sống",
            "text": "Suy thoái về tư tưởng chính trị, đạo đức, lối sống",
            "isCorrect": true
          },
          {
            "note": "Trọng tâm đấu tranh bảo vệ sự trong sạch của nội bộ được đặt vào việc chấn chỉnh tư tưởng chính trị, đạo đức và lối sống",
            "text": "Suy thoái về năng lực quản lý và chuyên môn",
            "isCorrect": false
          },
          {
            "note": "Những khía cạnh đấu tranh cốt lõi được định hình rõ ràng thuộc về phẩm chất chính trị, đạo đức lối sống",
            "text": "Suy thoái về bản lĩnh kinh tế và hội nhập",
            "isCorrect": false
          },
          {
            "note": "Vấn đề nền tảng cần ngăn chặn sự suy thoái không phải kỹ năng mà là tư tưởng chính trị và đạo đức lối sống",
            "text": "Suy thoái về kỹ năng lãnh đạo quần chúng",
            "isCorrect": false
          }
        ],
        "question": "Trong công tác xây dựng bộ máy hiện nay, cần đấu tranh chống lại những biểu hiện suy thoái ở những khía cạnh nào?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-60-430",
        "options": [
          {
            "note": "Nguy cơ tiềm ẩn làm thay đổi bản chất từ bên trong cần được ngăn chặn triệt để là hiện tượng tự diễn biến, tự chuyển hóa",
            "text": "Tự diễn biến, tự chuyển hóa",
            "isCorrect": true
          },
          {
            "note": "Dù là những khuyết điểm cần sửa chữa, nhưng thuật ngữ phản ánh mức độ biến chất chính trị nghiêm trọng là tự diễn biến, tự chuyển hóa",
            "text": "Tự cao, tự đại",
            "isCorrect": false
          },
          {
            "note": "Đây là những tệ nạn thực tế, nhưng biểu hiện làm lung lay tư tưởng cần chặn đứng tận gốc được nêu ở đây là tự diễn biến, tự chuyển hóa",
            "text": "Tham nhũng, lãng phí",
            "isCorrect": false
          },
          {
            "note": "Vấn đề trực tiếp đi đôi với sự suy thoái đạo đức và tư tưởng chính trị được cảnh báo là tự diễn biến, tự chuyển hóa",
            "text": "Bệnh quan liêu, xa rời quần chúng",
            "isCorrect": false
          }
        ],
        "question": "Cùng với việc chống suy thoái về tư tưởng chính trị, đạo đức, lối sống, chúng ta cần đấu tranh chống lại những biểu hiện nguy hiểm nào khác trong nội bộ?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132145409-61-767",
        "options": [
          {
            "note": "Việc rèn luyện đội ngũ, ngăn chặn suy thoái nhằm mục đích cao nhất là bảo vệ uy tín, bản lĩnh để Đảng xứng đáng là Đảng cầm quyền",
            "text": "Để Đảng xứng đáng là Đảng cầm quyền",
            "isCorrect": true
          },
          {
            "note": "Đối tượng cốt lõi của cuộc đấu tranh tư tưởng chính trị này là củng cố năng lực lãnh đạo để Đảng xứng đáng là Đảng cầm quyền",
            "text": "Để làm trong sạch toàn bộ bộ máy nhà nước",
            "isCorrect": false
          },
          {
            "note": "Mục tiêu hướng nội thiết thực nhất là bảo đảm sự trong sạch và tư cách cầm quyền vững vàng của Đảng",
            "text": "Để lấy lại niềm tin tuyệt đối của bạn bè quốc tế",
            "isCorrect": false
          },
          {
            "note": "Việc đấu tranh nội bộ nhắm tới phẩm chất của tổ chức lãnh đạo nhằm bảo đảm Đảng xứng đáng với vị trí Đảng cầm quyền",
            "text": "Để hoàn thiện hệ thống pháp luật nhà nước",
            "isCorrect": false
          }
        ],
        "question": "Mục đích cuối cùng của việc đấu tranh chống những biểu hiện suy thoái và tự diễn biến, tự chuyển hóa trong nội bộ là gì?",
        "chapterId": "c3",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-0-479",
        "options": [
          {
            "note": "Tư tưởng cốt lõi được khẳng định rõ ràng là để tiến hành cách mạng thì trước hết phải có sự dẫn dắt của một đảng cách mệnh",
            "text": "Cách mạng trước hết phải có đảng cách mệnh",
            "isCorrect": true
          },
          {
            "note": "Vấn đề lực lượng là bước sau, nền tảng lãnh đạo tiên quyết phải là sự hiện diện của một đảng cách mệnh",
            "text": "Cách mạng trước hết phải xây dựng lực lượng vũ trang",
            "isCorrect": false
          },
          {
            "note": "Yếu tố ngoại lực không phải là điều kiện tiên quyết được nhắc tới trong khẳng định về sự chuẩn bị cho cách mạng",
            "text": "Cách mạng trước hết phải có sự viện trợ từ quốc tế",
            "isCorrect": false
          },
          {
            "note": "Đây là nhiệm vụ của quá trình cách mạng chứ không phải yếu tố tổ chức mang tính tiền đề",
            "text": "Cách mạng trước hết phải giải quyết mâu thuẫn giai cấp",
            "isCorrect": false
          }
        ],
        "question": "Hồ Chí Minh đã khẳng định điều kiện tiên quyết đầu tiên đối với sự nghiệp cách mạng là gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-1-547",
        "options": [
          {
            "note": "Vai trò tất yếu của Đảng hoàn toàn bắt nguồn một cách khách quan từ chính yêu cầu phát triển của dân tộc",
            "text": "Yêu cầu phát triển của dân tộc",
            "isCorrect": true
          },
          {
            "note": "Nền tảng đòi hỏi sự lãnh đạo bao trùm rộng lớn hơn nhiều, đó là yêu cầu phát triển của cả một dân tộc",
            "text": "Khát vọng giải phóng của giai cấp công nhân",
            "isCorrect": false
          },
          {
            "note": "Vai trò lãnh đạo của Đảng xuất phát từ nhu cầu nội tại của đất nước chứ không phải do sự áp đặt từ bên ngoài",
            "text": "Sự chỉ đạo của Quốc tế Cộng sản",
            "isCorrect": false
          },
          {
            "note": "Đây là yếu tố góp phần ra đời Đảng, nhưng nguyên nhân sâu xa làm nên tính tất yếu lãnh đạo là yêu cầu phát triển của dân tộc",
            "text": "Sự trưởng thành của phong trào yêu nước",
            "isCorrect": false
          }
        ],
        "question": "Sự lãnh đạo của Đảng Cộng sản Việt Nam được coi là một tất yếu xuất phát từ cơ sở nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-2-742",
        "options": [
          {
            "note": "Đảng Cộng sản Việt Nam ra đời là sản phẩm của sự kết hợp mang tính quy luật giữa chủ nghĩa Mác Lênin với phong trào công nhân và phong trào yêu nước",
            "text": "Phong trào công nhân và phong trào yêu nước",
            "isCorrect": true
          },
          {
            "note": "Các lực lượng và phong trào này không phải là những nhân tố nền tảng cấu thành sự ra đời của Đảng",
            "text": "Phong trào nông dân và phong trào dân chủ",
            "isCorrect": false
          },
          {
            "note": "Không đúng với những nhân tố cốt lõi được đúc kết trong quá trình thành lập Đảng tại Việt Nam",
            "text": "Phong trào trí thức và phong trào vô sản",
            "isCorrect": false
          },
          {
            "note": "Cụm từ chính xác phản ánh sự kết hợp đặc thù của Việt Nam là phong trào công nhân và phong trào yêu nước",
            "text": "Phong trào giải phóng dân tộc và phong trào đấu tranh giai cấp",
            "isCorrect": false
          }
        ],
        "question": "Sự ra đời của Đảng Cộng sản Việt Nam là kết quả của sự kết hợp giữa chủ nghĩa Mác Lênin với những nhân tố nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-3-263",
        "options": [
          {
            "note": "Trọng trách lịch sử to lớn mà Đảng được toàn dân tộc giao phó là lãnh đạo sự nghiệp giải phóng dân tộc và đi lên chủ nghĩa xã hội",
            "text": "Sự nghiệp giải phóng dân tộc và đi lên chủ nghĩa xã hội",
            "isCorrect": true
          },
          {
            "note": "Đây chỉ là một giai đoạn phát triển cụ thể, không bao quát toàn bộ sứ mệnh lịch sử vĩ đại được trao",
            "text": "Sự nghiệp xây dựng nền kinh tế công nghiệp hóa",
            "isCorrect": false
          },
          {
            "note": "Sứ mệnh của Đảng không dừng lại ở việc đánh đuổi ngoại xâm mà còn bao gồm cả con đường tiến lên chủ nghĩa xã hội",
            "text": "Sự nghiệp đấu tranh đánh đuổi thực dân phong kiến",
            "isCorrect": false
          },
          {
            "note": "Sứ mệnh thực tế bao trùm toàn dân tộc được định danh rõ ràng là giải phóng dân tộc và đi lên chủ nghĩa xã hội",
            "text": "Sự nghiệp giải phóng giai cấp vô sản và tiến lên cộng sản chủ nghĩa",
            "isCorrect": false
          }
        ],
        "question": "Toàn dân tộc đã trao cho Đảng Cộng sản Việt Nam sứ mệnh lãnh đạo đất nước trong sự nghiệp gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-4-379",
        "options": [
          {
            "note": "Tính đạo đức và văn minh của Đảng bộc lộ trọn vẹn thông qua mục đích cao cả là lãnh đạo đấu tranh giải phóng dân tộc, giải phóng xã hội, giai cấp và con người",
            "text": "Lãnh đạo đấu tranh giải phóng dân tộc, giải phóng xã hội, giai cấp và con người",
            "isCorrect": true
          },
          {
            "note": "Mục đích hoạt động chứng minh cho đạo đức và văn minh mang tầm vóc giải phóng toàn diện con người và xã hội thay vì chỉ ở khía cạnh nhà nước",
            "text": "Lãnh đạo nhân dân giành lại chính quyền và xây dựng nhà nước pháp quyền",
            "isCorrect": false
          },
          {
            "note": "Đại đoàn kết là phương thức tạo lực lượng chứ không phản ánh trọn vẹn mục đích giải phóng làm nên sự văn minh",
            "text": "Lãnh đạo xây dựng khối đại đoàn kết toàn dân tộc vững chắc",
            "isCorrect": false
          },
          {
            "note": "Chuỗi mục đích giải phóng toàn diện mọi mặt đời sống mới là cốt lõi thể hiện tính đạo đức và văn minh",
            "text": "Lãnh đạo sự nghiệp công nghiệp hóa nhằm mang lại ấm no cho nhân dân",
            "isCorrect": false
          }
        ],
        "question": "Bản chất \"Đảng là đạo đức, là văn minh\" được thể hiện cụ thể ở mục đích hoạt động nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-5-183",
        "options": [
          {
            "note": "Một tiêu chuẩn tối cao để Đảng luôn trong sạch vững mạnh là phải luôn trung thành với lợi ích toàn dân tộc",
            "text": "Lợi ích toàn dân tộc",
            "isCorrect": true
          },
          {
            "note": "Bản chất của Đảng bắt rễ sâu rộng nên sự trung thành phải hướng tới lợi ích của toàn dân tộc chứ không bó hẹp trong một giai cấp",
            "text": "Lợi ích của giai cấp công nhân",
            "isCorrect": false
          },
          {
            "note": "Mặc dù đây là lực lượng nòng cốt nhưng lợi ích mà Đảng phụng sự và trung thành phải bao trùm lên toàn bộ dân tộc",
            "text": "Lợi ích của liên minh công nông",
            "isCorrect": false
          },
          {
            "note": "Định hướng trung thành cốt lõi không phân biệt mà mang tính bao trùm lên lợi ích toàn dân tộc",
            "text": "Lợi ích của những người yếu thế trong xã hội",
            "isCorrect": false
          }
        ],
        "question": "Về mặt lợi ích, Đảng Cộng sản Việt Nam được yêu cầu phải luôn trung thành với điều gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-6-627",
        "options": [
          {
            "note": "Cốt lõi của đạo đức cách mạng mà mỗi đảng viên bắt buộc phải thấm nhuần chính là cần kiệm liêm chính, chí công vô tư",
            "text": "Cần kiệm liêm chính, chí công vô tư",
            "isCorrect": true
          },
          {
            "note": "Đây là những đức tính tốt nhưng cụm từ đúc kết bản chất đạo đức cách mạng là cần kiệm liêm chính, chí công vô tư",
            "text": "Trung thành, tận tụy, dũng cảm, kiên cường",
            "isCorrect": false
          },
          {
            "note": "Những yếu tố này thiên về tư duy năng lực chứ không phải là nền tảng phẩm chất đạo đức cách mạng được chỉ định",
            "text": "Trí tuệ, bản lĩnh, đổi mới, sáng tạo",
            "isCorrect": false
          },
          {
            "note": "Đây là các giá trị đạo đức truyền thống và tôn giáo, không phải những phẩm chất đạo đức cách mạng trọng tâm đối với đảng viên",
            "text": "Khoan dung, độ lượng, từ bi, vị tha",
            "isCorrect": false
          }
        ],
        "question": "Đội ngũ đảng viên phải thấm nhuần đạo đức cách mạng thông qua những phẩm chất trọng tâm nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-7-425",
        "options": [
          {
            "note": "Sự vĩ đại và tính văn minh của Đảng được khẳng định khi Đảng là tổ chức tiêu biểu cho lương tâm, trí tuệ và danh dự của dân tộc",
            "text": "Tiêu biểu cho lương tâm, trí tuệ và danh dự của dân tộc",
            "isCorrect": true
          },
          {
            "note": "Các cụm từ này mang tính chất động lực phấn đấu nhưng không đúng với khái niệm cấu thành Đảng văn minh",
            "text": "Tiêu biểu cho sức mạnh, ý chí và khát vọng của dân tộc",
            "isCorrect": false
          },
          {
            "note": "Tinh thần bất khuất là truyền thống lịch sử, trong khi tính văn minh gắn liền với lương tâm, trí tuệ và danh dự",
            "text": "Tiêu biểu cho tinh thần bất khuất và truyền thống anh hùng của dân tộc",
            "isCorrect": false
          },
          {
            "note": "Từ ngữ chuẩn xác được sử dụng để định danh một tổ chức Đảng văn minh là tiêu biểu cho lương tâm, trí tuệ và danh dự",
            "text": "Tiêu biểu cho bản sắc văn hóa và đạo đức lối sống của dân tộc",
            "isCorrect": false
          }
        ],
        "question": "Khái niệm \"Đảng văn minh\" được mô tả là tổ chức tiêu biểu cho những giá trị nào của dân tộc?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-8-744",
        "options": [
          {
            "note": "Tính văn minh của Đảng đi liền với sự tôn trọng kỷ cương đất nước, thể hiện qua việc hoạt động trong khuôn khổ Hiến pháp và pháp luật",
            "text": "Hoạt động trong khuôn khổ Hiến pháp và pháp luật",
            "isCorrect": true
          },
          {
            "note": "Nghị quyết là định hướng nội bộ, còn khuôn khổ pháp lý quốc gia định hình tính văn minh là Hiến pháp và pháp luật",
            "text": "Hoạt động trong khuôn khổ các nghị quyết của Trung ương",
            "isCorrect": false
          },
          {
            "note": "Cương lĩnh là đường lối vĩ mô của tổ chức nhưng sự minh bạch và văn minh yêu cầu phải tuân thủ khuôn khổ Hiến pháp và pháp luật nhà nước",
            "text": "Hoạt động trong khuôn khổ Cương lĩnh chính trị",
            "isCorrect": false
          },
          {
            "note": "Đạo đức là nền tảng phẩm chất cá nhân nhưng ranh giới hoạt động mang tính quy chuẩn của tổ chức phải là Hiến pháp và pháp luật",
            "text": "Hoạt động trong khuôn khổ đạo đức truyền thống",
            "isCorrect": false
          }
        ],
        "question": "Về mặt pháp lý và thể chế, một tổ chức Đảng văn minh phải hoạt động trong khuôn khổ nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-9-63",
        "options": [
          {
            "note": "Tính văn minh trên trường quốc tế được minh chứng qua việc Đảng luôn có quan hệ quốc tế trong sáng",
            "text": "Có quan hệ quốc tế trong sáng",
            "isCorrect": true
          },
          {
            "note": "Đây là đường lối ngoại giao nói chung, còn tiêu chuẩn cốt lõi thể hiện tính văn minh của Đảng là sự trong sáng",
            "text": "Có quan hệ quốc tế rộng mở, đa phương và đa dạng",
            "isCorrect": false
          },
          {
            "note": "Khái niệm này làm hẹp đi tính chất đối ngoại của Đảng, tính chất bao quát được nhấn mạnh là sự trong sáng",
            "text": "Có quan hệ chặt chẽ với các nước xã hội chủ nghĩa",
            "isCorrect": false
          },
          {
            "note": "Dù là nguyên tắc ngoại giao đúng đắn nhưng thuật ngữ dùng để gắn với đạo đức và văn minh của tổ chức Đảng là sự trong sáng trong quan hệ quốc tế",
            "text": "Có quan hệ bình đẳng, cùng có lợi với mọi đối tác",
            "isCorrect": false
          }
        ],
        "question": "Yêu cầu về quan hệ đối ngoại của một Đảng văn minh mang tính chất gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-10-971",
        "options": [
          {
            "note": "Yêu cầu nguyên tắc tối cao định hướng cho mọi hoạt động của Đảng là phải lấy chủ nghĩa Mác Lênin làm nền tảng tư tưởng và kim chỉ nam cho hành động",
            "text": "Lấy chủ nghĩa Mác Lênin làm nền tảng tư tưởng và kim chỉ nam cho hành động",
            "isCorrect": true
          },
          {
            "note": "Tư tưởng dân tộc chủ nghĩa không phải là nền tảng lý luận khoa học dẫn đường cho hành động của tổ chức Đảng",
            "text": "Lấy tư tưởng dân tộc chủ nghĩa làm nền tảng cốt lõi",
            "isCorrect": false
          },
          {
            "note": "Đây là yếu tố được tiếp thu chọn lọc nhưng nền tảng tư tưởng cốt lõi và kim chỉ nam duy nhất được khẳng định là chủ nghĩa Mác Lênin",
            "text": "Lấy tinh hoa văn hóa nhân loại làm kim chỉ nam",
            "isCorrect": false
          },
          {
            "note": "Giá trị truyền thống là cội nguồn động lực chứ không đóng vai trò nền tảng tư tưởng lý luận chỉ đạo hành động",
            "text": "Lấy giá trị truyền thống tốt đẹp của dân tộc làm nền tảng tư tưởng",
            "isCorrect": false
          }
        ],
        "question": "Trong các nguyên tắc hoạt động của Đảng, yếu tố nào được lấy làm nền tảng tư tưởng và kim chỉ nam cho hành động?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-11-319",
        "options": [
          {
            "note": "Đây là chuỗi toàn bộ những nguyên tắc rường cột bắt buộc phải có để điều hành và duy trì sinh khí của tổ chức Đảng",
            "text": "Tập trung dân chủ, tự phê bình và phê bình, kỷ luật nghiêm minh tự giác, thường xuyên tự chỉnh đốn, đoàn kết thống nhất trong Đảng, liên hệ mật thiết với nhân dân và đoàn kết quốc tế",
            "isCorrect": true
          },
          {
            "note": "Việc thay đổi các từ ngữ như tập trung toàn diện hay kỷ luật bắt buộc làm sai lệch hoàn toàn bản chất các nguyên tắc của Đảng",
            "text": "Tập trung toàn diện, tự phê bình định kỳ, kỷ luật bắt buộc, liên hệ mật thiết với giai cấp công nhân và đoàn kết quốc tế",
            "isCorrect": false
          },
          {
            "note": "Các nguyên tắc này pha trộn mô hình tổ chức khác và không phản ánh đúng tư tưởng định hướng của Đảng",
            "text": "Dân chủ đại nghị, phê bình từ cấp trên, kỷ luật quân đội, thường xuyên tự chỉnh đốn, đoàn kết nội bộ và liên hệ với nhân dân",
            "isCorrect": false
          },
          {
            "note": "Những khái niệm tự do ngôn luận hay kỷ luật tự nguyện không phải là các nguyên tắc tổ chức chặt chẽ được quy định",
            "text": "Tự do ngôn luận, tự phê bình và phê bình, kỷ luật tự nguyện, đoàn kết thống nhất, liên hệ mật thiết với liên minh công nông",
            "isCorrect": false
          }
        ],
        "question": "Đâu là sự kết hợp đúng và đầy đủ các nguyên tắc trong hoạt động của Đảng Cộng sản Việt Nam?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-12-202",
        "options": [
          {
            "note": "Sức mạnh của Đảng nằm ở kỷ luật, và kỷ luật đó phải đáp ứng trọn vẹn được cả hai tiêu chuẩn là nghiêm minh và tự giác",
            "text": "Kỷ luật nghiêm minh tự giác",
            "isCorrect": true
          },
          {
            "note": "Tính chất kỷ luật của Đảng không chỉ có sự răn đe mà còn đòi hỏi sự tự giác từ nhận thức sâu sắc của người đảng viên",
            "text": "Kỷ luật thép và bắt buộc tuyệt đối",
            "isCorrect": false
          },
          {
            "note": "Kỷ luật cần sự nghiêm minh và thống nhất chứ không thể linh hoạt tùy tiện làm suy yếu sức mạnh tổ chức",
            "text": "Kỷ luật linh hoạt và dân chủ",
            "isCorrect": false
          },
          {
            "note": "Mục đích của kỷ luật là duy trì sự vững mạnh của tổ chức chứ không phải thuần túy hướng tới sự khắt khe hay trừng phạt",
            "text": "Kỷ luật khắt khe và trừng phạt nặng nề",
            "isCorrect": false
          }
        ],
        "question": "Tính chất kỷ luật trong các nguyên tắc hoạt động của Đảng đòi hỏi phải đạt được những tiêu chuẩn nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-13-122",
        "options": [
          {
            "note": "Để bảo đảm sự vững mạnh của tổ chức, tiêu chuẩn hàng đầu về lập trường chính trị đối với cán bộ và đảng viên là phải tuyệt đối trung thành với Đảng",
            "text": "Tuyệt đối trung thành với Đảng",
            "isCorrect": true
          },
          {
            "note": "Bản lĩnh là yếu tố cần thiết nhưng yêu cầu được khẳng định trực tiếp mang tính sống còn là sự tuyệt đối trung thành",
            "text": "Có bản lĩnh chính trị vững vàng trước mọi khó khăn",
            "isCorrect": false
          },
          {
            "note": "Đây là biểu hiện của phẩm chất chí công vô tư, còn yêu cầu khái quát về mặt chính trị là sự trung thành tuyệt đối",
            "text": "Luôn đặt lợi ích của tập thể lên trên lợi ích cá nhân",
            "isCorrect": false
          },
          {
            "note": "Yêu cầu cốt lõi gốc rễ định hình tư cách của đội ngũ cán bộ đảng viên là sự tuyệt đối trung thành với Đảng",
            "text": "Kiên định với con đường đổi mới và hội nhập",
            "isCorrect": false
          }
        ],
        "question": "Trong công tác xây dựng đội ngũ, yêu cầu chính trị quan trọng nhất đối với cán bộ, đảng viên là gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-14-993",
        "options": [
          {
            "note": "Trách nhiệm tuân thủ và bảo vệ định hướng của tổ chức thể hiện qua việc cán bộ đảng viên phải nghiêm chỉnh thực hiện Cương lĩnh đường lối",
            "text": "Nghiêm chỉnh thực hiện Cương lĩnh đường lối",
            "isCorrect": true
          },
          {
            "note": "Dù phải chấp hành cấp trên nhưng nền tảng mang tính nguyên tắc chỉ đạo hành động là Cương lĩnh đường lối",
            "text": "Nghiêm chỉnh thực hiện mọi chỉ thị của ban lãnh đạo cấp cao",
            "isCorrect": false
          },
          {
            "note": "Đạo đức xã hội là tiêu chuẩn chung của con người, còn kỷ luật hành động của đảng viên gắn chặt với Cương lĩnh đường lối của tổ chức",
            "text": "Nghiêm chỉnh thực hiện các quy ước đạo đức xã hội",
            "isCorrect": false
          },
          {
            "note": "Yêu cầu mang tính tổng thể và định hướng toàn diện cho đảng viên là thực hiện Cương lĩnh đường lối của Đảng",
            "text": "Nghiêm chỉnh thực hiện chính sách đối ngoại của nhà nước",
            "isCorrect": false
          }
        ],
        "question": "Cán bộ, đảng viên được yêu cầu phải nghiêm chỉnh thực hiện nội dung gì để bảo đảm sự thống nhất trong hành động?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-15-493",
        "options": [
          {
            "note": "Nhằm đáp ứng yêu cầu của cách mạng, đội ngũ này phải không ngừng tự hoàn thiện qua việc luôn tu dưỡng đạo đức và học tập nâng cao trình độ",
            "text": "Luôn tu dưỡng đạo đức và học tập nâng cao trình độ",
            "isCorrect": true
          },
          {
            "note": "Năng lực chuyên biệt này không bao hàm đầy đủ sự phát triển toàn diện giữa đạo đức và trình độ học vấn chung",
            "text": "Luôn rèn luyện kỹ năng lãnh đạo và quản lý",
            "isCorrect": false
          },
          {
            "note": "Động cơ tu dưỡng không nhằm mục đích thăng tiến cá nhân mà để hoàn thiện đạo đức và nâng cao trình độ phụng sự xã hội",
            "text": "Luôn phấn đấu thăng tiến để cống hiến nhiều hơn",
            "isCorrect": false
          },
          {
            "note": "Lối sống giản dị là một phần của đạo đức nhưng chưa đủ để phản ánh yêu cầu song hành về cả đạo đức lẫn học tập nâng cao trình độ",
            "text": "Luôn duy trì lối sống giản dị và tiết kiệm",
            "isCorrect": false
          }
        ],
        "question": "Về mặt phát triển năng lực và phẩm chất cá nhân, cán bộ và đảng viên phải luôn rèn luyện như thế nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-16-926",
        "options": [
          {
            "note": "Phẩm chất hành động thiết thực gắn kết Đảng với dân là đội ngũ đảng viên phải có mối liên hệ mật thiết với nhân dân và dám chịu trách nhiệm trước công việc",
            "text": "Có mối liên hệ mật thiết với nhân dân, dám chịu trách nhiệm",
            "isCorrect": true
          },
          {
            "note": "Dù mang ý nghĩa tương tự nhưng không phản ánh đúng từ ngữ gốc quy định là liên hệ mật thiết và dám chịu trách nhiệm",
            "text": "Thường xuyên xuống cơ sở, hoàn thành tốt nhiệm vụ",
            "isCorrect": false
          },
          {
            "note": "Các cụm từ này mang tính chất diễn giải thay vì sử dụng đúng những yêu cầu nghiêm ngặt được đặt ra cho đảng viên",
            "text": "Chỉ đạo sát sao phong trào quần chúng, không đùn đẩy trách nhiệm",
            "isCorrect": false
          },
          {
            "note": "Nhận lỗi hay tôn trọng là biểu hiện cụ thể, nhưng khái quát toàn diện theo nguyên bản phải là liên hệ mật thiết và dám chịu trách nhiệm",
            "text": "Tôn trọng quyền làm chủ của nhân dân, dũng cảm nhận lỗi",
            "isCorrect": false
          }
        ],
        "question": "Để củng cố vai trò và uy tín trước quần chúng, đội ngũ cán bộ đảng viên phải duy trì mối quan hệ và tinh thần trách nhiệm như thế nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-17-733",
        "options": [
          {
            "note": "Thái độ kiên quyết bảo vệ sự trong sạch của bộ máy đòi hỏi đảng viên phải luôn phòng chống các tiêu cực nguy hiểm là tham ô lãng phí quan liêu",
            "text": "Luôn phòng chống các tiêu cực như tham ô lãng phí quan liêu",
            "isCorrect": true
          },
          {
            "note": "Sự đoàn kết là một nguyên tắc quan trọng nhưng những tiêu cực trực tiếp liên quan đến trách nhiệm công vụ được chỉ đích danh là tham ô lãng phí quan liêu",
            "text": "Luôn phòng chống các tiêu cực như bè phái và chia rẽ nội bộ",
            "isCorrect": false
          },
          {
            "note": "Dù là một hiện tượng tiêu cực đáng lên án nhưng trọng tâm ngăn chặn được nhấn mạnh vào chuỗi hành vi tham ô lãng phí quan liêu",
            "text": "Luôn phòng chống các tiêu cực như chạy chức chạy quyền",
            "isCorrect": false
          },
          {
            "note": "Các biểu hiện này nằm trong bệnh quan liêu nhưng không diễn đạt đầy đủ cả cụm tiêu cực tham ô lãng phí quan liêu",
            "text": "Luôn phòng chống các tiêu cực như hách dịch và cửa quyền",
            "isCorrect": false
          }
        ],
        "question": "Cán bộ, đảng viên phải luôn kiên quyết phòng chống các biểu hiện tiêu cực nổi cộm nào trong quá trình công tác?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-18-963",
        "options": [
          {
            "note": "Tính chất cốt lõi quyết định nền tảng của Nhà nước Việt Nam chính là bản chất giai cấp công nhân",
            "text": "Bản chất giai cấp công nhân",
            "isCorrect": true
          },
          {
            "note": "Mặc dù là lực lượng đông đảo nhưng giai cấp công nhân mới là nền tảng định hình bản chất của nhà nước",
            "text": "Bản chất giai cấp nông dân",
            "isCorrect": false
          },
          {
            "note": "Tính dân tộc là yếu tố thống nhất cùng nhưng nền tảng bản chất gốc vẫn là bản chất giai cấp công nhân",
            "text": "Bản chất của toàn dân tộc",
            "isCorrect": false
          },
          {
            "note": "Trí thức là một lực lượng quan trọng nhưng không quyết định bản chất giai cấp của nhà nước",
            "text": "Bản chất của tầng lớp trí thức",
            "isCorrect": false
          }
        ],
        "question": "Bản chất giai cấp của Nhà nước Việt Nam là gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-19-17",
        "options": [
          {
            "note": "Sự lãnh đạo của Đảng, định hướng tiến lên xã hội mới và nguyên tắc tập trung dân chủ là những minh chứng rõ nét cho bản chất giai cấp công nhân của nhà nước",
            "text": "Đảng Cộng sản Việt Nam giữ vị trí lãnh đạo, định hướng đi lên chủ nghĩa xã hội và hoạt động theo nguyên tắc tập trung dân chủ",
            "isCorrect": true
          },
          {
            "note": "Những dấu hiệu này không phản ánh bản chất giai cấp công nhân về mặt chính trị và nguyên tắc hoạt động",
            "text": "Nhà nước quản lý toàn bộ nền kinh tế và thực hiện chính sách phân phối bình quân",
            "isCorrect": false
          },
          {
            "note": "Biểu hiện chính trị của bản chất nhà nước nằm ở sự lãnh đạo của Đảng và nguyên tắc hoạt động chứ không thuần túy ở việc quản lý tư liệu sản xuất",
            "text": "Nhân dân lao động trực tiếp quản lý mọi tư liệu sản xuất",
            "isCorrect": false
          },
          {
            "note": "Không phản ánh đúng nguyên lý thể hiện bản chất giai cấp thông qua vai trò của Đảng và định hướng xã hội chủ nghĩa",
            "text": "Sự tham gia trực tiếp của công nhân vào mọi cơ quan lập pháp",
            "isCorrect": false
          }
        ],
        "question": "Bản chất giai cấp công nhân của Nhà nước được thể hiện qua những yếu tố nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-20-461",
        "options": [
          {
            "note": "Bản chất giai cấp của nhà nước không hề tách rời mà luôn hòa quyện và thống nhất chặt chẽ với tính nhân dân và tính dân tộc",
            "text": "Tính nhân dân và tính dân tộc",
            "isCorrect": true
          },
          {
            "note": "Sự thống nhất mang tính nội tại của quốc gia được tập trung vào tính nhân dân và tính dân tộc",
            "text": "Tính nhân loại và tính thời đại",
            "isCorrect": false
          },
          {
            "note": "Dù mang ý nghĩa tích cực nhưng khái niệm được kết nối trực tiếp tạo nên sự thống nhất nội tại là tính nhân dân và tính dân tộc",
            "text": "Tính dân chủ và tính công bằng",
            "isCorrect": false
          },
          {
            "note": "Tính chất thống nhất được nhấn mạnh trong bối cảnh quốc gia là tính nhân dân và dân tộc",
            "text": "Tính giai cấp và tính quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Bản chất giai cấp công nhân của nhà nước có mối liên hệ thống nhất với những tính chất nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-21-946",
        "options": [
          {
            "note": "Yếu tố định hình một nhà nước của nhân dân chính là việc mọi quyền lực đều hoàn toàn thuộc về nhân dân",
            "text": "Thuộc về nhân dân",
            "isCorrect": true
          },
          {
            "note": "Nhà nước chỉ là bộ máy thực thi, nguồn gốc và chủ thể nắm giữ quyền lực thật sự là nhân dân",
            "text": "Thuộc về Nhà nước",
            "isCorrect": false
          },
          {
            "note": "Quyền lực ở đây được trao trọn vẹn cho nhân dân chứ không bị thâu tóm bởi một tầng lớp riêng biệt",
            "text": "Thuộc về tầng lớp lãnh đạo",
            "isCorrect": false
          },
          {
            "note": "Pháp luật là công cụ để bảo vệ và thực thi quyền lực chứ không phải chủ thể sở hữu quyền lực",
            "text": "Thuộc về pháp luật",
            "isCorrect": false
          }
        ],
        "question": "Trong khái niệm Nhà nước của nhân dân, tất cả mọi quyền lực được xác định thuộc về ai?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-22-844",
        "options": [
          {
            "note": "Quyền lực của nhân dân được chuyển hóa vào thực tiễn thông qua hai phương thức cơ bản là dân chủ trực tiếp và dân chủ gián tiếp",
            "text": "Dân chủ trực tiếp và dân chủ gián tiếp",
            "isCorrect": true
          },
          {
            "note": "Tập trung là nguyên tắc tổ chức, trong khi hình thức thực thi quyền lực bao quát là trực tiếp và gián tiếp",
            "text": "Dân chủ tập trung và dân chủ cơ sở",
            "isCorrect": false
          },
          {
            "note": "Cách gọi chính xác và đầy đủ nhất bao hàm mọi khía cạnh thực thi là dân chủ trực tiếp và gián tiếp",
            "text": "Dân chủ đại diện và dân chủ hiệp thương",
            "isCorrect": false
          },
          {
            "note": "Đây là các hình thái dân chủ chứ không phải phương thức để nhân dân thực thi quyền lực",
            "text": "Dân chủ nhân dân và dân chủ vô sản",
            "isCorrect": false
          }
        ],
        "question": "Nhân dân thực thi quyền lực nhà nước thông qua những hình thức dân chủ nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-23-685",
        "options": [
          {
            "note": "Quyền lực của nhà nước không tự nhiên mà có, đó là quyền lực do chính nhân dân ủy thác",
            "text": "Do nhân dân ủy thác",
            "isCorrect": true
          },
          {
            "note": "Tính chính danh của quyền lực trong nhà nước kiểu mới đến từ sự ủy thác của nhân dân",
            "text": "Do sự đấu tranh giành giật",
            "isCorrect": false
          },
          {
            "note": "Nguồn gốc trực tiếp và mang tính pháp lý chính trị là sự ủy thác từ nhân dân",
            "text": "Do lịch sử trao tặng",
            "isCorrect": false
          },
          {
            "note": "Pháp luật chỉ cụ thể hóa quyền lực, còn khởi nguồn sâu xa phải là sự ủy thác của nhân dân",
            "text": "Do pháp luật quy định",
            "isCorrect": false
          }
        ],
        "question": "Nguồn gốc quyền lực mà nhà nước có được xuất phát từ đâu?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-24-580",
        "options": [
          {
            "note": "Bản chất phục vụ của bộ máy nhà nước quy định rõ người cán bộ phải là công bộc của dân",
            "text": "Cán bộ là công bộc của dân",
            "isCorrect": true
          },
          {
            "note": "Tư tưởng này hoàn toàn đối lập với bản chất của nhà nước dân chủ",
            "text": "Cán bộ là người cai trị dân",
            "isCorrect": false
          },
          {
            "note": "Cán bộ chỉ thực thi nhiệm vụ được giao phó với tư cách là người phục vụ, tức công bộc của dân",
            "text": "Cán bộ là người thay mặt dân quyết định mọi việc",
            "isCorrect": false
          },
          {
            "note": "Cán bộ không có đặc quyền ban phát mà mang trọng trách của một người công bộc phục vụ nhân dân",
            "text": "Cán bộ là người ban phát quyền lợi cho dân",
            "isCorrect": false
          }
        ],
        "question": "Trong mối quan hệ với nhân dân, vị trí của người cán bộ nhà nước được xác định như thế nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-25-760",
        "options": [
          {
            "note": "Để bảo đảm quyền lực thực sự, nhân dân nắm trong tay quyền kiểm soát và bãi miễn đối với các đại biểu",
            "text": "Quyền kiểm soát, bãi miễn đại biểu",
            "isCorrect": true
          },
          {
            "note": "Đại biểu được bầu ra chứ không phải do chỉ định hay bổ nhiệm",
            "text": "Quyền chỉ định và bổ nhiệm đại biểu",
            "isCorrect": false
          },
          {
            "note": "Nhân dân thực hiện quyền lực qua sự kiểm soát và bãi miễn khi cần thiết thay vì can thiệp tùy tiện",
            "text": "Quyền can thiệp trực tiếp vào công việc của đại biểu",
            "isCorrect": false
          },
          {
            "note": "Công cụ quản lý trực tiếp con người được nêu rõ là quyền kiểm soát và bãi miễn",
            "text": "Quyền thay đổi luật do đại biểu ban hành",
            "isCorrect": false
          }
        ],
        "question": "Đối với các đại biểu đại diện cho mình, nhân dân có những quyền hạn trực tiếp nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-26-666",
        "options": [
          {
            "note": "Sức mạnh pháp lý trong nhà nước mới thực chất là công cụ quyền lực của nhân dân",
            "text": "Là công cụ quyền lực của nhân dân",
            "isCorrect": true
          },
          {
            "note": "Khái niệm này áp dụng cho nhà nước bóc lột, không đúng với nhà nước của nhân dân",
            "text": "Là công cụ đàn áp của giai cấp cầm quyền",
            "isCorrect": false
          },
          {
            "note": "Dù có chức năng quản lý kinh tế nhưng bản chất sâu xa nhất của pháp luật là công cụ quyền lực của nhân dân",
            "text": "Là công cụ điều hành nền kinh tế",
            "isCorrect": false
          },
          {
            "note": "Pháp luật bảo vệ lợi ích chung và là công cụ của nhân dân chứ không sinh ra để bảo vệ cán bộ",
            "text": "Là công cụ bảo vệ cán bộ nhà nước",
            "isCorrect": false
          }
        ],
        "question": "Trong nền dân chủ, pháp luật được định nghĩa là công cụ mang ý nghĩa gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-27-713",
        "options": [
          {
            "note": "Sự hình thành và vận hành của nhà nước này xuất phát từ việc do nhân dân lập nên, đồng thời nhân dân làm chủ thông qua việc thực hiện các quyền lợi và nghĩa vụ công dân",
            "text": "Do nhân dân lập nên, nhân dân làm chủ với các quyền lợi và nghĩa vụ công dân",
            "isCorrect": true
          },
          {
            "note": "Sự đóng góp là nghĩa vụ nhưng gốc rễ hình thành nhà nước là do nhân dân lập nên và làm chủ",
            "text": "Do nhân dân tự nguyện đóng góp tài sản để duy trì",
            "isCorrect": false
          },
          {
            "note": "Nhà nước là một hệ thống thiết chế do nhân dân lập nên và làm chủ toàn diện",
            "text": "Do nhân dân bầu ra một lãnh tụ tối cao",
            "isCorrect": false
          },
          {
            "note": "Nhân dân có thể thông qua dân chủ gián tiếp, nhưng đặc trưng tổng quát là lập nên nhà nước và làm chủ với quyền và nghĩa vụ công dân",
            "text": "Do nhân dân trực tiếp xử lý mọi công việc hành chính",
            "isCorrect": false
          }
        ],
        "question": "Đặc điểm cốt lõi của \"Nhà nước do nhân dân\" là gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-28-347",
        "options": [
          {
            "note": "Sứ mệnh vì dân đòi hỏi bộ máy phải phục vụ lợi ích, nguyện vọng của dân, không có đặc quyền đặc lợi và thực sự trong sạch, cần kiệm liêm chính",
            "text": "Phục vụ lợi ích và nguyện vọng của nhân dân, không có đặc quyền đặc lợi, thực sự trong sạch cần kiệm liêm chính",
            "isCorrect": true
          },
          {
            "note": "Sự phục vụ hướng tới lợi ích chung bền vững, không phải lời hứa về sự giàu có nhanh chóng",
            "text": "Đem lại sự giàu có nhanh chóng cho tất cả mọi người",
            "isCorrect": false
          },
          {
            "note": "Việc phục vụ phải gắn liền với trật tự pháp luật chứ không phải tự do vô tổ chức",
            "text": "Cho phép nhân dân làm bất cứ điều gì mình muốn",
            "isCorrect": false
          },
          {
            "note": "Việc phục vụ lợi ích và nguyện vọng mang ý nghĩa toàn diện, đi liền với sự trong sạch của bộ máy",
            "text": "Chăm lo đời sống vật chất mà không cần chú trọng đời sống tinh thần",
            "isCorrect": false
          }
        ],
        "question": "Tiêu chí nào phản ánh bản chất của \"Nhà nước vì nhân dân\"?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-29-731",
        "options": [
          {
            "note": "Tính chính danh hợp hiến hợp pháp được tạo nên từ việc tuân thủ pháp luật, sở hữu Hiến pháp dân chủ và ra đời thông qua con đường Tổng tuyển cử",
            "text": "Phù hợp với pháp luật, có Hiến pháp dân chủ và được bầu ra qua Tổng tuyển cử",
            "isCorrect": true
          },
          {
            "note": "Yếu tố chỉ định làm mất đi tính dân chủ và cơ sở pháp lý của sự bầu cử",
            "text": "Phù hợp với truyền thống, có sự đồng thuận của nhân dân và được cấp trên chỉ định",
            "isCorrect": false
          },
          {
            "note": "Tính hợp hiến hợp pháp xuất phát từ chủ quyền nội tại qua pháp luật, Hiến pháp và Tổng tuyển cử",
            "text": "Phù hợp với xu thế quốc tế và được các nước công nhận",
            "isCorrect": false
          },
          {
            "note": "Quy ước hay đạo đức không thay thế được tính pháp lý của pháp luật, Hiến pháp và quá trình Tổng tuyển cử",
            "text": "Phù hợp với đạo đức xã hội và dựa trên quy ước cộng đồng",
            "isCorrect": false
          }
        ],
        "question": "Nhà nước hợp hiến hợp pháp đòi hỏi tổ chức và vận hành phải dựa trên những cơ sở nền tảng nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-30-493",
        "options": [
          {
            "note": "Muốn pháp luật được tôn trọng thì trước hết phải làm tốt công tác lập pháp và tiến hành giáo dục pháp luật cho nhân dân",
            "text": "Làm tốt công tác lập pháp, giáo dục pháp luật cho nhân dân",
            "isCorrect": true
          },
          {
            "note": "Sự nghiêm minh là cần thiết nhưng nền tảng để thượng tôn pháp luật là xây dựng luật và giáo dục ý thức",
            "text": "Làm tốt công tác trấn áp và xử phạt tội phạm",
            "isCorrect": false
          },
          {
            "note": "Đây chỉ là một khâu trong tư pháp, công tác nền móng cần làm tốt là lập pháp và giáo dục pháp luật",
            "text": "Làm tốt công tác tuyển chọn cán bộ tòa án",
            "isCorrect": false
          },
          {
            "note": "Hoạt động tuyên truyền là cần thiết nhưng để thượng tôn pháp luật thì phải trực tiếp giáo dục pháp luật",
            "text": "Làm tốt công tác tuyên truyền chủ trương của Đảng",
            "isCorrect": false
          }
        ],
        "question": "Để xây dựng một nhà nước thượng tôn pháp luật, bước đầu tiên cần phải làm tốt công tác gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-31-765",
        "options": [
          {
            "note": "Hệ thống pháp luật chỉ phát huy sức mạnh khi đáp ứng được tiêu chuẩn nghiêm minh, đúng đắn và đầy đủ",
            "text": "Pháp luật phải nghiêm minh, đúng và đủ",
            "isCorrect": true
          },
          {
            "note": "Sự tùy tiện thay đổi sẽ phá vỡ tính ổn định và nghiêm minh của pháp luật",
            "text": "Pháp luật phải linh hoạt và dễ thay đổi",
            "isCorrect": false
          },
          {
            "note": "Tính nghiêm khắc là chưa đủ, pháp luật còn phải đảm bảo yếu tố đúng và đủ",
            "text": "Pháp luật phải nghiêm khắc và mang tính trừng phạt cao",
            "isCorrect": false
          },
          {
            "note": "Việc dễ hiểu là tốt nhưng tiêu chuẩn cốt lõi để duy trì trật tự là tính nghiêm minh, đúng và đủ",
            "text": "Pháp luật phải ngắn gọn và dễ hiểu tuyệt đối",
            "isCorrect": false
          }
        ],
        "question": "Tiêu chuẩn bắt buộc đối với hệ thống pháp luật trong nhà nước thượng tôn pháp luật là gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-32-894",
        "options": [
          {
            "note": "Trọng trách bảo vệ công lý đòi hỏi người thực thi pháp luật phải luôn giữ được sự công tâm",
            "text": "Người thực thi pháp luật phải công tâm",
            "isCorrect": true
          },
          {
            "note": "Lòng dũng cảm là quý giá nhưng cốt lõi khi cầm cân nảy mực là sự công tâm",
            "text": "Người thực thi pháp luật phải dũng cảm",
            "isCorrect": false
          },
          {
            "note": "Sự khoan dung áp dụng không đúng chỗ sẽ làm mất đi tính nghiêm minh, điều kiện tiên quyết là sự công tâm",
            "text": "Người thực thi pháp luật phải khoan dung",
            "isCorrect": false
          },
          {
            "note": "Trình độ là nền tảng năng lực nhưng phẩm chất định hình sự công bằng là thái độ công tâm",
            "text": "Người thực thi pháp luật phải có trình độ học vấn cao nhất",
            "isCorrect": false
          }
        ],
        "question": "Đối với những người thực thi pháp luật, yêu cầu về phẩm chất đạo đức khi làm việc là gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-33-480",
        "options": [
          {
            "note": "Chiều sâu nhân bản của một nền pháp quyền nhân nghĩa chính là việc tôn trọng và bảo đảm thực hiện đầy đủ quyền con người",
            "text": "Quyền con người",
            "isCorrect": true
          },
          {
            "note": "Nghĩa vụ là điều công dân phải làm, còn tính nhân nghĩa thể hiện qua việc nhà nước bảo đảm quyền con người",
            "text": "Nghĩa vụ công dân",
            "isCorrect": false
          },
          {
            "note": "Pháp quyền nhân nghĩa hướng tới con người thay vì chỉ tập trung củng cố quyền lực nhà nước",
            "text": "Quyền lực nhà nước",
            "isCorrect": false
          },
          {
            "note": "Đây chỉ là một khía cạnh hẹp, sự nhân nghĩa phải bao trùm lên toàn bộ quyền con người",
            "text": "Quyền tự do kinh doanh",
            "isCorrect": false
          }
        ],
        "question": "Một nền pháp quyền được coi là \"nhân nghĩa\" khi nhà nước tôn trọng và bảo đảm thực hiện đầy đủ điều gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-34-797",
        "options": [
          {
            "note": "Pháp luật nhân nghĩa không chỉ trừng phạt mà sâu xa hơn là có tính nhân văn, khuyến thiện và đặt mục đích giáo dục cảm hóa làm căn bản",
            "text": "Có tính nhân văn, khuyến thiện và lấy mục đích giáo dục cảm hóa làm căn bản",
            "isCorrect": true
          },
          {
            "note": "Quan điểm này nghiêng về trừng phạt và đi ngược lại cốt lõi giáo dục cảm hóa của pháp quyền nhân nghĩa",
            "text": "Có tính răn đe mạnh mẽ và loại trừ mọi mầm mống tội phạm",
            "isCorrect": false
          },
          {
            "note": "Pháp luật nhân nghĩa hướng tới sự nhân văn và khuyến thiện cho mọi con người",
            "text": "Có tính giai cấp sâu sắc và bảo vệ lợi ích bộ phận",
            "isCorrect": false
          },
          {
            "note": "Đặc tính nhân nghĩa được định hình bằng sự nhân văn, khuyến thiện và sức mạnh giáo dục cảm hóa",
            "text": "Có tính truyền thống và bảo vệ phong tục tập quán",
            "isCorrect": false
          }
        ],
        "question": "Tính chất của pháp luật trong nền pháp quyền nhân nghĩa được thể hiện như thế nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-35-655",
        "options": [
          {
            "note": "Chìa khóa tất yếu để ngăn chặn nguy cơ thoái hóa biến chất chính là phải thực hiện kiểm soát quyền lực nhà nước",
            "text": "Kiểm soát quyền lực nhà nước",
            "isCorrect": true
          },
          {
            "note": "Việc tập trung quyền lực mà thiếu kiểm soát chính là nguyên nhân dẫn đến sự thoái hóa",
            "text": "Tăng cường quyền lực cho người đứng đầu",
            "isCorrect": false
          },
          {
            "note": "Sự thay đổi nhân sự không giải quyết được gốc rễ vấn đề nếu thiếu đi cơ chế kiểm soát quyền lực",
            "text": "Liên tục thay đổi đội ngũ cán bộ",
            "isCorrect": false
          },
          {
            "note": "Quy mô bộ máy không liên quan trực tiếp đến việc chống thoái hóa bằng việc kiểm soát quyền lực",
            "text": "Thu gọn quy mô tổ chức nhà nước",
            "isCorrect": false
          }
        ],
        "question": "Để phòng chống sự thoái hóa biến chất của bộ máy, việc làm nào mang tính tất yếu?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-36-862",
        "options": [
          {
            "note": "Hệ thống rào chắn vững chắc để kiểm soát quyền lực bao gồm sự kiểm tra của Đảng, sự phân công phân nhiệm rành mạch giữa các cơ quan và sự kiểm soát từ phía nhân dân",
            "text": "Sự kiểm tra của Đảng, sự phân công phân nhiệm giữa các cơ quan và sự kiểm soát của nhân dân",
            "isCorrect": true
          },
          {
            "note": "Cơ chế kiểm soát quyền lực được xây dựng dựa trên nguồn lực và thể chế nội tại của quốc gia",
            "text": "Sự giám sát của quốc tế và các tổ chức phi chính phủ",
            "isCorrect": false
          },
          {
            "note": "Dù có tác động nhưng cơ chế nền tảng và chính thống là sự kiểm tra của Đảng, phân công cơ quan và sự kiểm soát của nhân dân",
            "text": "Sự kiểm duyệt của báo chí và mạng xã hội",
            "isCorrect": false
          },
          {
            "note": "Lực lượng vũ trang có nhiệm vụ riêng, cơ chế kiểm soát toàn diện nằm ở Đảng, hệ thống cơ quan phân công và nhân dân",
            "text": "Sự thanh tra của cảnh sát và lực lượng vũ trang",
            "isCorrect": false
          }
        ],
        "question": "Quyền lực nhà nước được đặt dưới sự kiểm soát của những chủ thể và phương thức nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-37-790",
        "options": [
          {
            "note": "Mọi mầm mống phá hoại sự trong sạch của nhà nước cần bị triệt tiêu bao gồm đặc quyền đặc lợi, tham ô, lãng phí, quan liêu, tư túng, chia rẽ và kiêu ngạo",
            "text": "Chống lại đặc quyền đặc lợi, tham ô, lãng phí, quan liêu, tư túng, chia rẽ và kiêu ngạo",
            "isCorrect": true
          },
          {
            "note": "Dù là những thói hư nhưng những căn bệnh trầm kha phá hoại bộ máy được chỉ đích danh là tham ô, lãng phí, quan liêu, tư túng, chia rẽ và kiêu ngạo",
            "text": "Chống lại sự chậm trễ, lười biếng và thiếu sáng tạo",
            "isCorrect": false
          },
          {
            "note": "Nội dung phòng chống tiêu cực này hướng vào sự làm trong sạch nội bộ nhà nước",
            "text": "Chống lại các thế lực thù địch bên ngoài",
            "isCorrect": false
          },
          {
            "note": "Không nằm trong danh sách các biểu hiện tiêu cực cấu thành tội lỗi của bộ máy cần phòng chống",
            "text": "Chống lại sự tự do ngôn luận bừa bãi",
            "isCorrect": false
          }
        ],
        "question": "Công cuộc phòng chống tiêu cực trong nhà nước nhắm đến việc loại bỏ những biểu hiện nguy hại nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-38-860",
        "options": [
          {
            "note": "Cần áp dụng một hệ thống giải pháp toàn diện từ nâng cao dân chủ, giữ pháp luật kỷ luật nghiêm minh, giáo dục đạo đức, nêu gương của cán bộ cho đến huy động sức mạnh chủ nghĩa yêu nước",
            "text": "Nâng cao dân chủ, pháp luật kỷ luật nghiêm minh, coi trọng giáo dục đạo đức, cán bộ đi trước làm gương và huy động sức mạnh chủ nghĩa yêu nước",
            "isCorrect": true
          },
          {
            "note": "Những biện pháp mang tính cải cách hành chính này không phải là nội dung trọng tâm của triết lý phòng chống tiêu cực được đúc kết",
            "text": "Tăng lương cho cán bộ, giảm bớt thủ tục hành chính và ứng dụng công nghệ",
            "isCorrect": false
          },
          {
            "note": "Sự trừng phạt cực đoan đi ngược lại tính nhân văn và không đúng với các biện pháp kết hợp được đưa ra",
            "text": "Thành lập các đội thanh tra đặc biệt và áp dụng hình phạt tử hình cho mọi sai phạm",
            "isCorrect": false
          },
          {
            "note": "Biện pháp này trái ngược với yêu cầu nâng cao dân chủ và sự phân công phân nhiệm",
            "text": "Hạn chế quyền lực của cấp dưới và giao toàn quyền cho cấp trên",
            "isCorrect": false
          }
        ],
        "question": "Các biện pháp đồng bộ để phòng chống tiêu cực trong nhà nước bao gồm những gì?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-39-457",
        "options": [
          {
            "note": "Nền tảng tư tưởng cốt lõi để xây dựng đường lối chủ trương chính là chủ nghĩa Mác Lênin và tư tưởng Hồ Chí Minh",
            "text": "Chủ nghĩa Mác Lênin, tư tưởng Hồ Chí Minh",
            "isCorrect": true
          },
          {
            "note": "Mặc dù truyền thống rất quan trọng nhưng nền tảng lý luận được quy định cụ thể là chủ nghĩa Mác Lênin và tư tưởng Hồ Chí Minh",
            "text": "Truyền thống yêu nước và đại đoàn kết",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là cụm từ gốc chỉ nền tảng tư tưởng được nêu trong văn bản",
            "text": "Tinh hoa văn hóa nhân loại và thực tiễn đất nước",
            "isCorrect": false
          },
          {
            "note": "Không có nội dung này trong văn bản cung cấp",
            "text": "Sự chỉ đạo của phong trào vô sản quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Việc đề ra đường lối chủ trương đúng đắn trong công tác xây dựng Đảng phải dựa trên nền tảng nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-40-131",
        "options": [
          {
            "note": "Đề ra đường lối phải đi đôi với việc tổ chức thực hiện thật tốt đường lối chủ trương đó trong thực tiễn",
            "text": "Tổ chức thực hiện thật tốt đường lối chủ trương",
            "isCorrect": true
          },
          {
            "note": "Việc thực hiện cần sự chủ động tiến hành chứ không thể thụ động chờ đợi",
            "text": "Chờ đợi sự ủng hộ tự nguyện từ quần chúng",
            "isCorrect": false
          },
          {
            "note": "Hoàn toàn không có yêu cầu này trong đoạn văn bản cung cấp",
            "text": "Sửa đổi đường lối cho phù hợp với yêu cầu quốc tế",
            "isCorrect": false
          },
          {
            "note": "Tổ chức Đảng phải trực tiếp tổ chức thực hiện thật tốt chứ không phó mặc hoàn toàn cho nhà nước",
            "text": "Giao phó toàn bộ cho các cơ quan nhà nước thi hành",
            "isCorrect": false
          }
        ],
        "question": "Cùng với việc đề ra đường lối chủ trương đúng đắn, Đảng cần phải làm gì để biến đường lối thành hiện thực?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-41-713",
        "options": [
          {
            "note": "Việc giữ gìn sự trong sạch và vững mạnh luôn đòi hỏi sự chú trọng đặc biệt vào công tác chỉnh đốn Đảng",
            "text": "Công tác chỉnh đốn Đảng",
            "isCorrect": true
          },
          {
            "note": "Dân vận là hoạt động bên ngoài, còn nội dung được nhắc đến trực tiếp để củng cố tổ chức ở đây là chỉnh đốn Đảng",
            "text": "Công tác dân vận quần chúng",
            "isCorrect": false
          },
          {
            "note": "Đây là nhiệm vụ quản lý của nhà nước chứ không mô tả công tác nội bộ Đảng được nhấn mạnh",
            "text": "Công tác phát triển kinh tế",
            "isCorrect": false
          },
          {
            "note": "Không xuất hiện trong văn bản về việc chú trọng công tác nội bộ của Đảng",
            "text": "Công tác đối ngoại nhân dân",
            "isCorrect": false
          }
        ],
        "question": "Trong quá trình tổ chức thực hiện đường lối, công tác nào cần được chú trọng để bảo đảm sự vững mạnh của tổ chức Đảng?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-42-538",
        "options": [
          {
            "note": "Mục đích cốt lõi của công tác kiểm tra giám sát và chỉnh đốn là giữ gìn bản chất để Đảng luôn là đạo đức, là văn minh",
            "text": "Để Đảng luôn là đạo đức, là văn minh",
            "isCorrect": true
          },
          {
            "note": "Hoàn toàn không đúng với mục đích của việc kiểm tra giám sát trong Đảng",
            "text": "Để loại bỏ các đảng viên có tư tưởng khác biệt",
            "isCorrect": false
          },
          {
            "note": "Mục tiêu hướng tới là sự trong sạch về đạo đức và văn minh chứ không phải tạo dựng uy quyền cá nhân hay tập thể",
            "text": "Để củng cố uy quyền tuyệt đối của Ban lãnh đạo",
            "isCorrect": false
          },
          {
            "note": "Đây là khía cạnh của công tác tổ chức cán bộ chứ không phản ánh đúng mục đích của việc kiểm tra giám sát",
            "text": "Để tuyển chọn những người xuất sắc nhất bổ nhiệm vào bộ máy",
            "isCorrect": false
          }
        ],
        "question": "Việc tăng cường kiểm tra giám sát trong Đảng nhằm hướng tới mục đích cao đẹp nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-43-670",
        "options": [
          {
            "note": "Hệ thống pháp luật chỉ phát huy giá trị khi việc hoàn thiện pháp luật được gắn liền với công tác tổ chức thi hành",
            "text": "Tổ chức thi hành",
            "isCorrect": true
          },
          {
            "note": "Dù mang ý nghĩa thực tiễn nhưng văn bản nhấn mạnh việc hoàn thiện pháp luật phải gắn với tổ chức thi hành",
            "text": "Tuyên truyền và phổ biến pháp luật",
            "isCorrect": false
          },
          {
            "note": "Không đúng với nội dung nguyên bản của đoạn văn cung cấp",
            "text": "Nghiên cứu sửa đổi Hiến pháp",
            "isCorrect": false
          },
          {
            "note": "Không phải là hoạt động được ghép đôi với việc hoàn thiện pháp luật theo nội dung văn bản",
            "text": "Tinh giản biên chế bộ máy hành chính",
            "isCorrect": false
          }
        ],
        "question": "Trong công tác xây dựng Nhà nước, việc hoàn thiện pháp luật phải được gắn kết chặt chẽ với quá trình nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-44-676",
        "options": [
          {
            "note": "Đích đến của việc xây dựng nhà nước pháp quyền và thi hành pháp luật là để bảo đảm quyền con người và quyền công dân",
            "text": "Bảo đảm quyền con người và quyền công dân",
            "isCorrect": true
          },
          {
            "note": "Sự bảo đảm hướng tới giá trị phổ quát cho toàn xã hội là quyền con người và quyền công dân",
            "text": "Bảo đảm quyền làm chủ của giai cấp lãnh đạo",
            "isCorrect": false
          },
          {
            "note": "Pháp luật trong nhà nước của nhân dân là để bảo vệ quyền con người chứ không sinh ra để bảo vệ quyền lực tuyệt đối của bộ máy",
            "text": "Bảo đảm quyền lực tuyệt đối của các cơ quan chính quyền",
            "isCorrect": false
          },
          {
            "note": "Khái niệm này không bao quát và không có mặt trong văn bản quy định về quyền con người, quyền công dân",
            "text": "Bảo đảm quyền tự do kinh doanh độc quyền",
            "isCorrect": false
          }
        ],
        "question": "Việc hoàn thiện pháp luật gắn với tổ chức thi hành nhằm bảo đảm quyền lợi thiết thực nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-45-783",
        "options": [
          {
            "note": "Sự phân quyền rành mạch và phối hợp kiểm soát quyền lực phải được thực hiện giữa ba nhánh lập pháp, hành pháp và tư pháp",
            "text": "Giữa lập pháp, hành pháp và tư pháp",
            "isCorrect": true
          },
          {
            "note": "Đây là sự phân cấp quản lý theo lãnh thổ chứ không phải phân công quyền lực nhà nước theo chức năng hoạt động",
            "text": "Giữa cấp trung ương, cấp tỉnh và cấp cơ sở",
            "isCorrect": false
          },
          {
            "note": "Đây là cơ cấu hệ thống chính trị nói chung, không phản ánh các nhánh quyền lực nhà nước được đề cập",
            "text": "Giữa tổ chức Đảng, cơ quan Nhà nước và các đoàn thể",
            "isCorrect": false
          },
          {
            "note": "Thiếu vắng nhánh hành pháp nên không diễn đạt trọn vẹn sự phân công ba quyền",
            "text": "Giữa cơ quan ban hành luật và cơ quan bảo vệ pháp luật",
            "isCorrect": false
          }
        ],
        "question": "Cơ chế kiểm soát quyền lực nhà nước đòi hỏi phải xác định rõ sự phân công và phối hợp giữa những cơ quan nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-46-221",
        "options": [
          {
            "note": "Sự vận hành của bộ máy nhà nước gắn liền với con người nên bắt buộc phải chú trọng công tác cán bộ công chức",
            "text": "Chú trọng công tác cán bộ công chức",
            "isCorrect": true
          },
          {
            "note": "Dù phù hợp thực tế nhưng thuật ngữ bao quát được cung cấp là công tác cán bộ công chức",
            "text": "Chú trọng tuyển dụng nguồn nhân lực chất lượng cao",
            "isCorrect": false
          },
          {
            "note": "Không có sự phân biệt rạch ròi nhóm này trong nội dung gốc của đoạn văn bản",
            "text": "Chú trọng phát triển đội ngũ chuyên gia kinh tế",
            "isCorrect": false
          },
          {
            "note": "Mặc dù là một chủ trương thực tế nhưng văn bản chỉ sử dụng cụm từ gốc là chú trọng công tác cán bộ công chức",
            "text": "Chú trọng tinh giản tối đa biên chế hành chính",
            "isCorrect": false
          }
        ],
        "question": "Cùng với việc hoàn thiện thể chế và kiểm soát quyền lực, công tác nhân sự nào trong bộ máy nhà nước cần được chú trọng?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-47-1",
        "options": [
          {
            "note": "Những căn bệnh trầm kha trong bộ máy cần kiên quyết đẩy mạnh phòng chống chính là tham nhũng lãng phí quan liêu",
            "text": "Tham nhũng lãng phí quan liêu",
            "isCorrect": true
          },
          {
            "note": "Khái niệm này thường áp dụng để chỉ sự biến chất tư tưởng trong Đảng, còn tệ nạn của bộ máy hành chính được nêu là tham nhũng lãng phí quan liêu",
            "text": "Tự diễn biến và tự chuyển hóa",
            "isCorrect": false
          },
          {
            "note": "Đây cũng là thuật ngữ dùng trong nội bộ Đảng, tiêu cực cụ thể của nhà nước là tham nhũng lãng phí quan liêu",
            "text": "Suy thoái về đạo đức và tư tưởng chính trị",
            "isCorrect": false
          },
          {
            "note": "Các cụm từ này thiếu đi tính hệ thống và đầy đủ của chuỗi hành vi tham nhũng lãng phí quan liêu",
            "text": "Tham ô hối lộ và bè phái",
            "isCorrect": false
          }
        ],
        "question": "Đi đôi với việc chú trọng công tác cán bộ, nhà nước cần đẩy mạnh phòng chống những tệ nạn gây nhức nhối nào?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787132746716-48-874",
        "options": [
          {
            "note": "Bản chất của hệ thống chính trị yêu cầu phải luôn đổi mới tăng cường sự lãnh đạo của Đảng đối với Nhà nước",
            "text": "Sự lãnh đạo của Đảng đối với Nhà nước",
            "isCorrect": true
          },
          {
            "note": "Hoạt động của nhà nước dựa trên độc lập chủ quyền, không có sự tăng cường giám sát từ quốc tế trong văn bản này",
            "text": "Sự giám sát độc lập của các tổ chức quốc tế đối với Nhà nước",
            "isCorrect": false
          },
          {
            "note": "Không phù hợp với nguyên tắc phân công kiểm soát quyền lực và lãnh đạo của Đảng",
            "text": "Quyền lực tập trung của cá nhân người đứng đầu Nhà nước",
            "isCorrect": false
          },
          {
            "note": "Vấn đề tài chính không được đề cập, trọng tâm chính trị là đổi mới tăng cường sự lãnh đạo của Đảng",
            "text": "Sự tự chủ tài chính của các cấp chính quyền đối với Nhà nước",
            "isCorrect": false
          }
        ],
        "question": "Để nhà nước không ngừng vững mạnh, cần đổi mới và tăng cường yếu tố nào đối với Nhà nước?",
        "chapterId": "c4",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-0-236",
        "options": [
          {
            "note": "Vai trò cốt lõi của sự đoàn kết được nhấn mạnh là mang ý nghĩa chiến lược, có khả năng quyết định đến sự thành bại của cách mạng và liên quan trực tiếp đến sự sống còn của toàn dân tộc",
            "text": "Là vấn đề có ý nghĩa chiến lược, quyết định thành công của cách mạng, mang tính sống còn của dân tộc Việt Nam",
            "isCorrect": true
          },
          {
            "note": "Khái niệm sách lược đi ngược lại với tính chất chiến lược mang ý nghĩa sống còn và lâu dài đã được chỉ định",
            "text": "Là vấn đề sách lược nhất thời trong giai đoạn khó khăn",
            "isCorrect": false
          },
          {
            "note": "Sự đoàn kết mang ý nghĩa chiến lược xuyên suốt chứ không phải chỉ là phương pháp giành chính quyền",
            "text": "Là phương pháp đấu tranh giành chính quyền trong thời bình",
            "isCorrect": false
          },
          {
            "note": "Văn bản khẳng định đây là vấn đề mang tính quyết định thành công và sống còn chứ không phải nhiệm vụ thứ yếu",
            "text": "Là nhiệm vụ thứ yếu sau khi giải quyết xong mâu thuẫn giai cấp",
            "isCorrect": false
          }
        ],
        "question": "Vai trò của đại đoàn kết toàn dân tộc mang những tính chất nào đối với cách mạng và dân tộc Việt Nam?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-1-307",
        "options": [
          {
            "note": "Sự nghiệp đoàn kết này không chỉ tồn tại trong một giai đoạn mà được duy trì liên tục qua cả cách mạng dân tộc dân chủ nhân dân và cách mạng xã hội chủ nghĩa",
            "text": "Cách mạng dân tộc dân chủ nhân dân và cách mạng xã hội chủ nghĩa",
            "isCorrect": true
          },
          {
            "note": "Các loại hình cách mạng này không phản ánh đúng tiến trình lịch sử thực tế của Việt Nam theo như nội dung cung cấp",
            "text": "Cách mạng tư sản và cách mạng vô sản",
            "isCorrect": false
          },
          {
            "note": "Dù mang ý nghĩa thực tiễn nhưng khái niệm gốc được cung cấp là cách mạng dân tộc dân chủ nhân dân và cách mạng xã hội chủ nghĩa",
            "text": "Cách mạng giải phóng dân tộc và chiến tranh bảo vệ tổ quốc",
            "isCorrect": false
          },
          {
            "note": "Không đúng với những giai đoạn cách mạng đặc thù được chỉ ra",
            "text": "Cách mạng phong kiến và cách mạng tư sản dân quyền",
            "isCorrect": false
          }
        ],
        "question": "Vấn đề đại đoàn kết toàn dân tộc được duy trì xuyên suốt trong những giai đoạn cách mạng nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-2-198",
        "options": [
          {
            "note": "Mức độ ưu tiên cao nhất của sự đoàn kết được khẳng định rõ ràng khi nó đóng vai trò vừa là mục tiêu vừa là nhiệm vụ hàng đầu của cách mạng Việt Nam",
            "text": "Là một mục tiêu, nhiệm vụ hàng đầu",
            "isCorrect": true
          },
          {
            "note": "Sự đoàn kết không bao giờ là nhiệm vụ thứ yếu mà luôn giữ vị trí ưu tiên hàng đầu",
            "text": "Là một mục tiêu thứ yếu và ngắn hạn",
            "isCorrect": false
          },
          {
            "note": "Bản chất của sự đoàn kết vượt ra ngoài phạm vi phương pháp để trở thành một mục tiêu và nhiệm vụ vĩ mô",
            "text": "Là phương pháp đấu tranh đơn thuần của quần chúng",
            "isCorrect": false
          },
          {
            "note": "Sự đoàn kết xuất phát từ nhu cầu nội tại của phong trào chứ không phải do tác động hay đòi hỏi từ nước ngoài",
            "text": "Là đòi hỏi của các nước đồng minh",
            "isCorrect": false
          }
        ],
        "question": "Đối với cách mạng Việt Nam, đại đoàn kết toàn dân tộc được xác định đóng vai trò gì trong hệ thống các nhiệm vụ?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-3-74",
        "options": [
          {
            "note": "Quá trình tự giải phóng không thể thiếu sức mạnh tập thể, do đó đại đoàn kết chính là một đòi hỏi mang tính khách quan của quần chúng nhân dân",
            "text": "Của quần chúng nhân dân trong cuộc đấu tranh tự giải phóng",
            "isCorrect": true
          },
          {
            "note": "Đòi hỏi này rộng lớn hơn và bao trùm lên toàn bộ quần chúng nhân dân thay vì chỉ một giai cấp",
            "text": "Của giai cấp công nhân trong phong trào bãi công",
            "isCorrect": false
          },
          {
            "note": "Lực lượng được đề cập mang tính phổ quát toàn xã hội là quần chúng nhân dân chứ không phải một tầng lớp riêng biệt",
            "text": "Của đội ngũ trí thức trong thời kỳ công nghiệp hóa",
            "isCorrect": false
          },
          {
            "note": "Nhu cầu đoàn kết xuất phát từ chính đòi hỏi khách quan của nhân dân trong nước",
            "text": "Của phong trào cộng sản và công nhân quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Việc xây dựng đại đoàn kết toàn dân tộc xuất phát từ đòi hỏi khách quan của lực lượng nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-4-223",
        "options": [
          {
            "note": "Sự rộng mở và bao trùm của khối đại đoàn kết được thể hiện qua việc thu hút toàn thể nhân dân và tất cả người Việt Nam yêu nước từ mọi giai cấp, tầng lớp, tôn giáo hay đảng phái",
            "text": "Toàn thể nhân dân, tất cả những người Việt Nam yêu nước ở các giai cấp, tầng lớp, tôn giáo, đảng phái",
            "isCorrect": true
          },
          {
            "note": "Dù là nền tảng nhưng chủ thể của khối đại đoàn kết lại rộng lớn hơn rất nhiều, không bỏ sót bất kỳ ai",
            "text": "Chỉ bao gồm công nhân và nông dân lao động",
            "isCorrect": false
          },
          {
            "note": "Khối đại đoàn kết không phân biệt ranh giới địa lý mà tập hợp mọi người Việt Nam yêu nước",
            "text": "Chỉ bao gồm những người sống và làm việc ở trong nước",
            "isCorrect": false
          },
          {
            "note": "Đây chỉ là một lực lượng nhỏ mang vai trò hạt nhân, không đại diện cho toàn bộ chủ thể của khối đại đoàn kết",
            "text": "Những đảng viên trung kiên của tổ chức Đảng",
            "isCorrect": false
          }
        ],
        "question": "Chủ thể của khối đại đoàn kết toàn dân tộc bao gồm những lực lượng nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-5-364",
        "options": [
          {
            "note": "Tiêu chuẩn duy nhất để đánh giá và tập hợp một con người vào khối đại đoàn kết chính là sự trung thành và tinh thần sẵn sàng phục vụ Tổ quốc",
            "text": "Miễn là họ trung thành và sẵn sàng phục vụ Tổ quốc",
            "isCorrect": true
          },
          {
            "note": "Tôn giáo cũng là một lực lượng được tôn trọng và tập hợp trong khối đại đoàn kết",
            "text": "Miễn là họ từ bỏ hoàn toàn tôn giáo và tín ngưỡng",
            "isCorrect": false
          },
          {
            "note": "Tiêu chuẩn cốt lõi được đặt ra là lòng trung thành và ý chí phục vụ Tổ quốc",
            "text": "Miễn là họ chấp nhận sự lãnh đạo tuyệt đối về mặt kinh tế",
            "isCorrect": false
          },
          {
            "note": "Không có tiêu chuẩn vật chất nào được đặt ra, điều kiện hội tụ duy nhất là sự trung thành phục vụ Tổ quốc",
            "text": "Miễn là họ đóng góp tài sản lớn cho cách mạng",
            "isCorrect": false
          }
        ],
        "question": "Để không bị bỏ sót, bất kỳ lực lượng nào muốn tham gia khối đại đoàn kết toàn dân tộc phải đáp ứng điều kiện tiên quyết nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-6-177",
        "options": [
          {
            "note": "Cấu trúc cơ bản tạo nên sự vững chắc cho khối đại đoàn kết bắt nguồn từ nền tảng liên minh của công nhân, nông dân và trí thức",
            "text": "Công nhân, nông dân và trí thức",
            "isCorrect": true
          },
          {
            "note": "Thành phần cốt lõi tạo thành nền tảng không bao gồm tư sản và tiểu tư sản",
            "text": "Công nhân, tư sản và tiểu tư sản",
            "isCorrect": false
          },
          {
            "note": "Lực lượng công nhân là yếu tố không thể thiếu trong nền tảng của khối đại đoàn kết",
            "text": "Nông dân, địa chủ yêu nước và trí thức",
            "isCorrect": false
          },
          {
            "note": "Đây chỉ là một phần trong khi nền tảng phải là sự kết hợp của cả công nhân, nông dân và trí thức",
            "text": "Tầng lớp trí thức và văn nghệ sĩ",
            "isCorrect": false
          }
        ],
        "question": "Khối đại đoàn kết toàn dân tộc được xây dựng dựa trên lực lượng nền tảng nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-7-403",
        "options": [
          {
            "note": "Sức mạnh tập hợp toàn dân tộc chỉ có thể được phát huy tối đa khi tổ chức lãnh đạo giữ vững được sự đoàn kết và thống nhất trong nội bộ Đảng để làm hạt nhân quy tụ",
            "text": "Sự đoàn kết và thống nhất trong Đảng",
            "isCorrect": true
          },
          {
            "note": "Dù là động lực mạnh mẽ nhưng hạt nhân gắn kết mọi thành phần được chỉ rõ là sự đoàn kết trong Đảng",
            "text": "Tinh thần yêu nước của nhân dân",
            "isCorrect": false
          },
          {
            "note": "Quân đội là công cụ bảo vệ chứ không phải là hạt nhân chính trị của khối đại đoàn kết",
            "text": "Lực lượng quân đội nhân dân",
            "isCorrect": false
          },
          {
            "note": "Sức mạnh cốt lõi phải xuất phát từ hạt nhân bên trong chính là sự thống nhất của Đảng",
            "text": "Sự viện trợ từ phong trào quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Yếu tố nào đóng vai trò là hạt nhân trung tâm của khối đại đoàn kết toàn dân tộc?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-8-340",
        "options": [
          {
            "note": "Nguyên tắc tập hợp lực lượng đòi hỏi sự khéo léo khi dùng lợi ích chung để quy tụ đồng thời vẫn tôn trọng những lợi ích khác biệt nhưng chính đáng của từng bộ phận",
            "text": "Lấy lợi ích chung làm điểm quy tụ, đồng thời tôn trọng các lợi ích khác biệt chính đáng",
            "isCorrect": true
          },
          {
            "note": "Việc xóa bỏ mọi khác biệt sẽ phá vỡ tính bao dung và rộng mở của khối đại đoàn kết",
            "text": "Lấy ý thức hệ làm điểm quy tụ và xóa bỏ mọi lợi ích khác biệt",
            "isCorrect": false
          },
          {
            "note": "Lợi ích mang tính tổng thể chung mới là điểm hội tụ thay vì phân chia cứng nhắc theo kinh tế",
            "text": "Lấy nền tảng kinh tế làm quy tụ và phân chia lợi ích theo giai cấp",
            "isCorrect": false
          },
          {
            "note": "Không phản ánh đúng nguyên tắc tôn trọng những sự khác biệt chính đáng",
            "text": "Lấy quyền lực chính trị làm quy tụ và cấm đoán các lợi ích cá nhân",
            "isCorrect": false
          }
        ],
        "question": "Khi xây dựng khối đại đoàn kết toàn dân tộc, cần lấy yếu tố nào làm điểm quy tụ và có thái độ thế nào trước những khác biệt?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-9-350",
        "options": [
          {
            "note": "Nguồn sức mạnh tinh thần được kế thừa để tạo dựng khối đại đoàn kết chính là những truyền thống yêu nước, nhân nghĩa và bản thân sự đoàn kết vốn có của dân tộc",
            "text": "Truyền thống yêu nước, nhân nghĩa, đoàn kết của dân tộc",
            "isCorrect": true
          },
          {
            "note": "Dù là lịch sử chống giặc ngoại xâm nhưng các giá trị tinh thần được nhắc đến là yêu nước, nhân nghĩa và đoàn kết",
            "text": "Truyền thống đấu tranh vũ trang và bạo lực cách mạng",
            "isCorrect": false
          },
          {
            "note": "Các giá trị này tốt đẹp nhưng không phải là nền tảng cốt lõi được liệt kê phục vụ trực tiếp cho việc xây dựng đoàn kết",
            "text": "Truyền thống hiếu học và tôn sư trọng đạo",
            "isCorrect": false
          },
          {
            "note": "Nội dung nhấn mạnh vào các giá trị gắn kết con người là yêu nước, nhân nghĩa và đoàn kết",
            "text": "Truyền thống cần cù lao động và sáng tạo",
            "isCorrect": false
          }
        ],
        "question": "Xây dựng khối đại đoàn kết toàn dân tộc đòi hỏi phải kế thừa những truyền thống quý báu nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-10-929",
        "options": [
          {
            "note": "Sức thu hút và tập hợp đông đảo mọi lực lượng chỉ có được khi duy trì lòng khoan dung và độ lượng đối với con người",
            "text": "Phải có lòng khoan dung, độ lượng với con người",
            "isCorrect": true
          },
          {
            "note": "Việc thu hút mọi thành phần phức tạp đòi hỏi sự bao dung độ lượng chứ không thuần túy là sự nghiêm khắc cứng nhắc",
            "text": "Phải có sự nghiêm khắc và kỷ luật tuyệt đối",
            "isCorrect": false
          },
          {
            "note": "Sức mạnh tập hợp dựa trên tinh thần nhân văn chứ không dựa vào lợi ích vật chất",
            "text": "Phải có năng lực ban phát quyền lợi vật chất",
            "isCorrect": false
          },
          {
            "note": "Quản lý là cần thiết nhưng thái độ cốt lõi để quy tụ con người là lòng khoan dung và độ lượng",
            "text": "Phải có sự giám sát và quản lý chặt chẽ",
            "isCorrect": false
          }
        ],
        "question": "Để tập hợp, quy tụ rộng rãi mọi lực lượng trong xã hội, người lãnh đạo và tổ chức cần có phẩm chất gì đối với con người?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-11-80",
        "options": [
          {
            "note": "Sự gắn bó máu thịt với nền tảng xã hội thể hiện qua việc phải luôn tin dân, dựa vào dân và lấy hạnh phúc của nhân dân làm mục tiêu phấn đấu",
            "text": "Phải có niềm tin vào nhân dân, tin dân, dựa vào dân, sống và phấn đấu vì hạnh phúc của nhân dân",
            "isCorrect": true
          },
          {
            "note": "Khía cạnh được nhấn mạnh là sự tôn trọng và phấn đấu vì nhân dân chứ không mang tính mệnh lệnh áp đặt",
            "text": "Phải giáo dục nhân dân tuân thủ mệnh lệnh cấp trên",
            "isCorrect": false
          },
          {
            "note": "Việc đào tạo là một phần của phát triển xã hội nhưng không phải nguyên tắc thái độ cốt lõi đối với nhân dân trong đại đoàn kết",
            "text": "Phải đào tạo nhân dân thành những chuyên gia kỹ thuật",
            "isCorrect": false
          },
          {
            "note": "Hành động này không phản ánh tinh thần chăm lo vì hạnh phúc của nhân dân",
            "text": "Phải yêu cầu nhân dân đóng góp toàn bộ tài sản cho cách mạng",
            "isCorrect": false
          }
        ],
        "question": "Thái độ hành động đối với nhân dân trong quá trình xây dựng khối đại đoàn kết được quy định như thế nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-12-409",
        "options": [
          {
            "note": "Biểu hiện sinh động về mặt tổ chức và cũng là hình thức thể hiện khối đại đoàn kết chính là Mặt trận dân tộc thống nhất",
            "text": "Mặt trận dân tộc thống nhất",
            "isCorrect": true
          },
          {
            "note": "Đây là tổ chức đại diện cho một giai cấp cụ thể chứ không mang tính bao trùm hình thức của toàn khối đại đoàn kết",
            "text": "Tổ chức Công đoàn Việt Nam",
            "isCorrect": false
          },
          {
            "note": "Quốc hội là cơ quan quyền lực nhà nước cao nhất, còn tổ chức đại diện cho hình thức đoàn kết toàn dân là Mặt trận",
            "text": "Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam",
            "isCorrect": false
          },
          {
            "note": "Đây là cơ quan tư pháp, hoàn toàn không liên quan đến hình thức tổ chức đại đoàn kết",
            "text": "Hệ thống Tòa án nhân dân",
            "isCorrect": false
          }
        ],
        "question": "Hình thức và nguyên tắc tổ chức của khối đại đoàn kết toàn dân tộc được cụ thể hóa bằng tổ chức nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-13-170",
        "options": [
          {
            "note": "Mặt trận thể hiện sự bao dung rộng lớn khi là nơi quy tụ mọi tổ chức cá nhân yêu nước và tập hợp toàn thể đồng bào ở cả trong lẫn ngoài nước",
            "text": "Quy tụ mọi tổ chức và cá nhân yêu nước, tập hợp mọi người dân nước Việt ở trong và ngoài nước",
            "isCorrect": true
          },
          {
            "note": "Phạm vi tập hợp không bị giới hạn trong nước mà mở rộng ra đồng bào ở nước ngoài",
            "text": "Quy tụ những quần chúng nhân dân ưu tú đang sinh sống trong nước",
            "isCorrect": false
          },
          {
            "note": "Những lực lượng này chỉ là một phần nhỏ trong khi Mặt trận hướng tới mọi cá nhân và tổ chức yêu nước",
            "text": "Quy tụ các lực lượng vũ trang và thanh niên xung phong",
            "isCorrect": false
          },
          {
            "note": "Đối tượng quy tụ bao trùm lên mọi cá nhân và người dân chứ không giới hạn ở các tổ chức cụ thể",
            "text": "Quy tụ các đảng phái chính trị và các doanh nghiệp lớn",
            "isCorrect": false
          }
        ],
        "question": "Vai trò quy tụ và tập hợp của Mặt trận dân tộc thống nhất hướng tới những đối tượng nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-14-534",
        "options": [
          {
            "note": "Để bảo đảm phương hướng hoạt động đúng đắn, toàn bộ khối Mặt trận phải được đặt dưới sự lãnh đạo duy nhất của Đảng",
            "text": "Đặt dưới sự lãnh đạo của Đảng",
            "isCorrect": true
          },
          {
            "note": "Nhà nước quản lý bằng pháp luật, còn vai trò lãnh đạo định hướng Mặt trận thuộc về Đảng",
            "text": "Đặt dưới sự lãnh đạo của Nhà nước",
            "isCorrect": false
          },
          {
            "note": "Mặc dù trí thức là nền tảng nhưng tổ chức nắm vai trò lãnh đạo Mặt trận là Đảng",
            "text": "Đặt dưới sự điều hành của những trí thức ưu tú",
            "isCorrect": false
          },
          {
            "note": "Mặt trận là tổ chức độc lập tự chủ của dân tộc nên chỉ chịu sự lãnh đạo của tổ chức Đảng trong nước",
            "text": "Đặt dưới sự giám sát của các tổ chức quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Hoạt động của Mặt trận dân tộc thống nhất phải được đặt dưới sự lãnh đạo của tổ chức nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-15-390",
        "options": [
          {
            "note": "Sự đồng thuận và nhất trí trong Mặt trận được giải quyết thông qua việc bàn bạc công khai dựa trên nguyên tắc hiệp thương dân chủ",
            "text": "Nguyên tắc hiệp thương dân chủ",
            "isCorrect": true
          },
          {
            "note": "Tập trung dân chủ là nguyên tắc hoạt động của Đảng và Nhà nước, còn của Mặt trận là hiệp thương dân chủ",
            "text": "Nguyên tắc tập trung dân chủ",
            "isCorrect": false
          },
          {
            "note": "Phương thức làm việc của Mặt trận là hiệp thương dân chủ để tạo sự nhất trí chứ không biểu quyết áp đặt",
            "text": "Nguyên tắc đa số phục tùng thiểu số",
            "isCorrect": false
          },
          {
            "note": "Việc ra quyết định phải trải qua bàn bạc công khai và hiệp thương để tạo sự đồng thuận",
            "text": "Nguyên tắc lãnh đạo ra quyết định tuyệt đối",
            "isCorrect": false
          }
        ],
        "question": "Mọi vấn đề trong Mặt trận dân tộc thống nhất đều được đưa ra bàn bạc công khai theo nguyên tắc nào để đi đến nhất trí?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-16-146",
        "options": [
          {
            "note": "Sự bền vững của khối Mặt trận được duy trì bởi tinh thần đoàn kết chân thành, gắn bó lâu dài và phương châm tìm kiếm điểm chung để hòa hợp sự khác biệt",
            "text": "Đoàn kết lâu dài, chặt chẽ, thật sự, chân thành, thân ái theo phương châm cầu đồng tồn dị",
            "isCorrect": true
          },
          {
            "note": "Tính chất đoàn kết phải mang ý nghĩa lâu dài và chân thành chứ không phải là sự kết hợp nhất thời",
            "text": "Đoàn kết nhất thời, cục bộ và cạnh tranh để cùng phát triển",
            "isCorrect": false
          },
          {
            "note": "Sự đoàn kết gượng ép đi ngược lại phương châm thân ái và cầu đồng tồn dị",
            "text": "Đoàn kết dựa trên mệnh lệnh hành chính và ép buộc cá nhân",
            "isCorrect": false
          },
          {
            "note": "Phương châm cầu đồng tồn dị chính là việc tìm tiếng nói chung nhưng vẫn chấp nhận bảo lưu sự khác biệt chính đáng",
            "text": "Đoàn kết bằng cách xóa bỏ mọi quan điểm cá nhân để tạo sự đồng nhất",
            "isCorrect": false
          }
        ],
        "question": "Tính chất của sự đoàn kết và phương châm giúp đỡ nhau cùng tiến bộ trong Mặt trận được thể hiện như thế nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-17-597",
        "options": [
          {
            "note": "Bước khởi đầu quan trọng nhất trong phương thức xây dựng khối đoàn kết là thực hiện công tác dân vận một cách sâu sát và phù hợp với tâm tư của quần chúng",
            "text": "Công tác vận động quần chúng tức là dân vận phù hợp với tâm tư nguyện vọng của quần chúng",
            "isCorrect": true
          },
          {
            "note": "Nội dung trực tiếp phục vụ cho việc xây dựng khối đoàn kết được nêu là công tác dân vận",
            "text": "Công tác tuyên truyền đường lối đối ngoại của Nhà nước",
            "isCorrect": false
          },
          {
            "note": "Dù mang ý nghĩa chiến lược nhưng phương pháp xây dựng đoàn kết tập trung vào công tác vận động quần chúng",
            "text": "Công tác phát triển kinh tế thị trường định hướng xã hội chủ nghĩa",
            "isCorrect": false
          },
          {
            "note": "Việc xây dựng quân đội không nằm trong phương thức trực tiếp tạo lập khối đoàn kết được đề cập",
            "text": "Công tác xây dựng lực lượng vũ trang nhân dân vững mạnh",
            "isCorrect": false
          }
        ],
        "question": "Phương thức đầu tiên để xây dựng khối đại đoàn kết dân tộc là phải làm tốt công tác nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-18-334",
        "options": [
          {
            "note": "Sự đa dạng của các giai tầng đòi hỏi phải thành lập các đoàn thể và tổ chức quần chúng có tính chất phù hợp riêng với từng đối tượng",
            "text": "Thành lập đoàn thể, tổ chức quần chúng phù hợp với từng đối tượng",
            "isCorrect": true
          },
          {
            "note": "Việc gộp chung mọi tầng lớp vào một tổ chức sẽ không bảo đảm được sự phù hợp đặc thù với từng đối tượng",
            "text": "Thành lập một tổ chức duy nhất bao trùm mọi giai tầng",
            "isCorrect": false
          },
          {
            "note": "Phương pháp tập hợp mang tính dân sự thông qua các đoàn thể quần chúng chứ không phải tổ chức quân sự",
            "text": "Thành lập các liên minh quân sự ở từng địa phương",
            "isCorrect": false
          },
          {
            "note": "Tổ chức quần chúng mang tính chất chính trị xã hội chứ không phải mô hình doanh nghiệp kinh tế",
            "text": "Thành lập các doanh nghiệp nhà nước để thu hút lao động",
            "isCorrect": false
          }
        ],
        "question": "Để tập hợp quần chúng một cách hiệu quả, cần phải thành lập các tổ chức với tiêu chí gì?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-19-698",
        "options": [
          {
            "note": "Đích đến cuối cùng để hội tụ sức mạnh của tất cả các đoàn thể và tổ chức quần chúng chính là mặt trận dân tộc thống nhất",
            "text": "Trong mặt trận dân tộc thống nhất",
            "isCorrect": true
          },
          {
            "note": "Cơ quan hành chính thực thi pháp luật, còn tổ chức đại diện liên hiệp là mặt trận dân tộc thống nhất",
            "text": "Trong cơ quan hành chính nhà nước",
            "isCorrect": false
          },
          {
            "note": "Đây là môi trường giáo dục, không phải là nơi tập hợp chính trị xã hội của các đoàn thể",
            "text": "Trong hệ thống giáo dục quốc dân",
            "isCorrect": false
          },
          {
            "note": "Phạm vi tập hợp để xây dựng khối đại đoàn kết toàn dân tộc được thực hiện thông qua mặt trận dân tộc thống nhất trong nước",
            "text": "Trong tổ chức công đoàn quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Sau khi thành lập, các đoàn thể và tổ chức quần chúng được tập hợp và đoàn kết trong tổ chức chung nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-20-464",
        "options": [
          {
            "note": "Văn bản ghi rõ thực hiện đoàn kết quốc tế nhằm kết hợp sức mạnh dân tộc với sức mạnh thời đại",
            "text": "Sức mạnh dân tộc với sức mạnh thời đại",
            "isCorrect": true
          },
          {
            "note": "Không đúng với từ ngữ trong văn bản cung cấp",
            "text": "Sức mạnh quân sự với sức mạnh kinh tế",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là khái niệm được sử dụng để chỉ mục đích của đoàn kết quốc tế",
            "text": "Sức mạnh trong nước với sức mạnh kiều bào",
            "isCorrect": false
          },
          {
            "note": "Đây là liên minh giai cấp chứ không phải khái niệm kết hợp sức mạnh dân tộc và thời đại",
            "text": "Sức mạnh của giai cấp công nhân với nông dân",
            "isCorrect": false
          }
        ],
        "question": "Việc thực hiện đoàn kết quốc tế nhằm kết hợp những sức mạnh nào để tạo sức mạnh tổng hợp cho cách mạng?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-21-748",
        "options": [
          {
            "note": "Các mục tiêu cách mạng của thời đại được liệt kê đầy đủ là hòa bình, độc lập dân tộc, dân chủ và tiến bộ xã hội",
            "text": "Hòa bình, độc lập dân tộc, dân chủ và tiến bộ xã hội",
            "isCorrect": true
          },
          {
            "note": "Đây là mục đích của sự nghiệp cách mạng do Đảng lãnh đạo chứ không phải mục tiêu thời đại được nêu ở phần này",
            "text": "Giải phóng giai cấp, giải phóng xã hội và con người",
            "isCorrect": false
          },
          {
            "note": "Đây là mục tiêu xây dựng đất nước hiện nay chứ không phải nguyên văn các mục tiêu thời đại",
            "text": "Dân giàu, nước mạnh, công bằng, dân chủ, văn minh",
            "isCorrect": false
          },
          {
            "note": "Dù mang ý nghĩa tương đồng nhưng không đúng với các cụm từ chỉ mục tiêu cách mạng của thời đại",
            "text": "Xóa bỏ áp bức bóc lột và xây dựng chủ nghĩa xã hội",
            "isCorrect": false
          }
        ],
        "question": "Cùng với nhân dân thế giới, đoàn kết quốc tế nhằm góp phần thực hiện thắng lợi các mục tiêu cách mạng của thời đại bao gồm những gì?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-22-404",
        "options": [
          {
            "note": "Văn bản liệt kê đầy đủ ba lực lượng nòng cốt này tham gia vào khối đoàn kết quốc tế",
            "text": "Phong trào cộng sản và công nhân quốc tế, phong trào đấu tranh giải phóng dân tộc và phong trào hòa bình, dân chủ thế giới",
            "isCorrect": true
          },
          {
            "note": "Các lực lượng này không phản ánh đúng diện mạo các phong trào mang tầm quốc tế được nêu",
            "text": "Phong trào công nhân, phong trào nông dân và phong trào sinh viên",
            "isCorrect": false
          },
          {
            "note": "Không có trong nội dung văn bản",
            "text": "Phong trào chống chủ nghĩa khủng bố và bảo vệ môi trường",
            "isCorrect": false
          },
          {
            "note": "Đây là các phong trào khác, không nằm trong văn bản cung cấp",
            "text": "Phong trào phi liên kết và phong trào nữ quyền thế giới",
            "isCorrect": false
          }
        ],
        "question": "Lực lượng đoàn kết quốc tế bao gồm những phong trào nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-23-138",
        "options": [
          {
            "note": "Văn bản ghi rõ hình thức tổ chức được định hướng thành bốn tầng mặt trận",
            "text": "Bốn tầng mặt trận",
            "isCorrect": true
          },
          {
            "note": "Số lượng này không đúng so với văn bản",
            "text": "Hai tầng mặt trận",
            "isCorrect": false
          },
          {
            "note": "Số lượng này không đúng so với văn bản",
            "text": "Ba tầng mặt trận",
            "isCorrect": false
          },
          {
            "note": "Số lượng này không đúng so với văn bản",
            "text": "Năm tầng mặt trận",
            "isCorrect": false
          }
        ],
        "question": "Hình thức tổ chức của lực lượng đoàn kết quốc tế được định hướng thành bao nhiêu tầng mặt trận?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-24-64",
        "options": [
          {
            "note": "Đây là sự liệt kê đầy đủ và chính xác tên gọi của cả bốn tầng mặt trận",
            "text": "Mặt trận đại đoàn kết dân tộc, Mặt trận đoàn kết Việt Nam Lào Campuchia, Mặt trận nhân dân Á Phi đoàn kết với Việt Nam và Mặt trận nhân dân thế giới đoàn kết với Việt Nam chống đế quốc xâm lược",
            "isCorrect": true
          },
          {
            "note": "Sai tên gọi chính thức của các tầng mặt trận được định hướng",
            "text": "Mặt trận Tổ quốc Việt Nam, Mặt trận giải phóng miền Nam, Mặt trận Đông Dương và Mặt trận quốc tế",
            "isCorrect": false
          },
          {
            "note": "Hoàn toàn không khớp với danh sách các tầng mặt trận trong văn bản",
            "text": "Mặt trận dân chủ, Mặt trận hòa bình, Mặt trận giải phóng và Mặt trận xã hội chủ nghĩa",
            "isCorrect": false
          },
          {
            "note": "Không đúng với hình thức tổ chức các tầng mặt trận được cung cấp",
            "text": "Mặt trận công nông binh, Mặt trận trí thức, Mặt trận kiều bào và Mặt trận quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Các tầng mặt trận trong hình thức tổ chức đoàn kết quốc tế bao gồm những mặt trận nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-25-514",
        "options": [
          {
            "note": "Văn bản khẳng định nguyên tắc đoàn kết là phải trên cơ sở thống nhất mục tiêu và lợi ích, đồng thời ứng xử có lý có tình",
            "text": "Thống nhất mục tiêu và lợi ích, có lý có tình",
            "isCorrect": true
          },
          {
            "note": "Nội dung này không xuất hiện trong phần nguyên tắc được nêu",
            "text": "Thống nhất về tư tưởng và hành động quân sự",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản cung cấp",
            "text": "Chia sẻ tài nguyên kinh tế và công nghệ",
            "isCorrect": false
          },
          {
            "note": "Nguyên tắc đoàn kết không nhắc đến sự tuân thủ này",
            "text": "Tuân thủ sự lãnh đạo của Quốc tế Cộng sản",
            "isCorrect": false
          }
        ],
        "question": "Nguyên tắc đầu tiên của đoàn kết quốc tế là đoàn kết trên cơ sở nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-26-145",
        "options": [
          {
            "note": "Nguyên tắc đòi hỏi phải giương cao ngọn cờ độc lập dân tộc gắn liền với chủ nghĩa xã hội",
            "text": "Ngọn cờ độc lập dân tộc gắn liền với chủ nghĩa xã hội",
            "isCorrect": true
          },
          {
            "note": "Không đúng với tên gọi ngọn cờ được nêu trong văn bản",
            "text": "Ngọn cờ tự do dân chủ và nhân quyền",
            "isCorrect": false
          },
          {
            "note": "Đây là một phần của ngọn cờ khác, không phản ánh ngọn cờ về dân tộc và chế độ",
            "text": "Ngọn cờ hòa bình và hữu nghị",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản",
            "text": "Ngọn cờ giải phóng giai cấp và xây dựng kinh tế",
            "isCorrect": false
          }
        ],
        "question": "Trong đoàn kết quốc tế, cần giương cao ngọn cờ nào liên quan đến sự nghiệp của dân tộc?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-27-141",
        "options": [
          {
            "note": "Ngọn cờ tiếp theo được nhắc đến để giương cao là ngọn cờ hòa bình chống chiến tranh xâm lược",
            "text": "Ngọn cờ hòa bình chống chiến tranh xâm lược",
            "isCorrect": true
          },
          {
            "note": "Hoàn toàn không có nội dung này",
            "text": "Ngọn cờ đấu tranh giai cấp triệt để",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là ngọn cờ tư tưởng được chỉ định",
            "text": "Ngọn cờ hợp tác kinh tế toàn cầu",
            "isCorrect": false
          },
          {
            "note": "Dù mang ý nghĩa hòa bình nhưng văn bản dùng cụm từ gốc là chống chiến tranh xâm lược",
            "text": "Ngọn cờ giải trừ vũ khí hạt nhân",
            "isCorrect": false
          }
        ],
        "question": "Cùng với ngọn cờ độc lập dân tộc gắn liền với chủ nghĩa xã hội, đoàn kết quốc tế còn phải giương cao ngọn cờ nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-28-496",
        "options": [
          {
            "note": "Nguyên tắc quan trọng bảo đảm sức mạnh nội sinh khi đoàn kết là độc lập, tự chủ, tự lực cánh sinh, dựa vào sức mình là chính và bắt buộc phải có thực lực",
            "text": "Độc lập, tự chủ, tự lực cánh sinh, dựa vào sức mình là chính và phải có thực lực",
            "isCorrect": true
          },
          {
            "note": "Nguyên tắc nhấn mạnh vào sự tự chủ và tự lực cánh sinh chứ không hướng tới sự phụ thuộc",
            "text": "Phụ thuộc hoàn toàn vào sự giúp đỡ của các nước anh em",
            "isCorrect": false
          },
          {
            "note": "Không có trong văn bản",
            "text": "Liên minh quân sự để tạo sức mạnh răn đe",
            "isCorrect": false
          },
          {
            "note": "Nội dung này không nằm trong phần nguyên tắc của văn bản",
            "text": "Phát triển kinh tế thị trường để thu hút đầu tư",
            "isCorrect": false
          }
        ],
        "question": "Quá trình đoàn kết quốc tế phải được xây dựng trên những nền tảng nào về mặt nội lực?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-29-436",
        "options": [
          {
            "note": "Mục đích cốt lõi của việc quán triệt tư tưởng trong hoạch định chủ trương là để khơi dậy các nguồn sức mạnh và đặt lợi ích dân tộc lên trên hết",
            "text": "Khơi dậy sức mạnh dân tộc và sức mạnh quốc tế, đặt lợi ích dân tộc lên hàng đầu",
            "isCorrect": true
          },
          {
            "note": "Nội dung này hoàn toàn không có trong văn bản được cung cấp",
            "text": "Khơi dậy sức mạnh quân sự và mở rộng lãnh thổ quốc gia",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là mục đích của việc quán triệt tư tưởng đại đoàn kết được nêu ra",
            "text": "Thúc đẩy sự phát triển của các doanh nghiệp nhà nước",
            "isCorrect": false
          },
          {
            "note": "Việc quán triệt nhằm khơi dậy sức mạnh và đặt lợi ích dân tộc lên hàng đầu chứ không phải nhường quyền cho quốc tế",
            "text": "Tăng cường quyền lực của các tổ chức quốc tế đối với Việt Nam",
            "isCorrect": false
          }
        ],
        "question": "Việc quán triệt tư tưởng Hồ Chí Minh về đại đoàn kết toàn dân tộc và đoàn kết quốc tế trong hoạch định chủ trương, đường lối của Đảng nhằm mục đích gì?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-30-889",
        "options": [
          {
            "note": "Văn bản khẳng định rõ ràng yêu cầu bắt buộc là phải đặt lợi ích dân tộc lên hàng đầu",
            "text": "Lợi ích dân tộc",
            "isCorrect": true
          },
          {
            "note": "Mặc dù mang bản chất giai cấp công nhân nhưng lợi ích được ưu tiên đặt lên hàng đầu ở đây là lợi ích dân tộc",
            "text": "Lợi ích của giai cấp công nhân",
            "isCorrect": false
          },
          {
            "note": "Không đúng với từ ngữ và định hướng của văn bản",
            "text": "Lợi ích của các tầng lớp trí thức",
            "isCorrect": false
          },
          {
            "note": "Dù có đoàn kết quốc tế nhưng nguyên tắc kiên quyết luôn là đặt lợi ích dân tộc lên hàng đầu",
            "text": "Lợi ích của bạn bè quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Trong hoạch định chủ trương, đường lối của Đảng hiện nay, lợi ích nào phải được đặt lên hàng đầu?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-31-142",
        "options": [
          {
            "note": "Cơ sở vững chắc để xây dựng khối đại đoàn kết là nền tảng liên minh công nông trí và phải được đặt dưới sự lãnh đạo của Đảng",
            "text": "Trên nền tảng liên minh công nông trí dưới sự lãnh đạo của Đảng",
            "isCorrect": true
          },
          {
            "note": "Đây không phải là nền tảng lực lượng và chủ thể lãnh đạo theo định hướng của văn bản",
            "text": "Trên nền tảng giai cấp tư sản dưới sự quản lý của Nhà nước",
            "isCorrect": false
          },
          {
            "note": "Tôn giáo là một bộ phận nhưng nền tảng cốt lõi được xác định là liên minh công nông trí",
            "text": "Trên nền tảng các tôn giáo dưới sự điều hành của Mặt trận Tổ quốc",
            "isCorrect": false
          },
          {
            "note": "Không phản ánh đúng định hướng xây dựng lực lượng nền tảng và sự lãnh đạo",
            "text": "Trên nền tảng các doanh nghiệp dưới sự bảo trợ của quốc tế",
            "isCorrect": false
          }
        ],
        "question": "Khối đại đoàn kết toàn dân tộc hiện nay cần được xây dựng trên nền tảng lực lượng nào và dưới sự lãnh đạo của ai?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-32-353",
        "options": [
          {
            "note": "Yêu cầu thiết yếu đi kèm với việc xây dựng khối đại đoàn kết là phải tăng cường mối quan hệ mật thiết giữa Đảng, Nhà nước và nhân dân",
            "text": "Giữa Đảng, Nhà nước và nhân dân",
            "isCorrect": true
          },
          {
            "note": "Dù là các lực lượng nền tảng nhưng mối quan hệ cần tăng cường mang tính bao quát được chỉ định là giữa Đảng, Nhà nước và nhân dân",
            "text": "Giữa giai cấp công nhân và tầng lớp trí thức",
            "isCorrect": false
          },
          {
            "note": "Không có nội dung này trong đoạn văn bản cung cấp",
            "text": "Giữa trung ương và chính quyền địa phương",
            "isCorrect": false
          },
          {
            "note": "Trái với thực tiễn và không có trong nội dung văn bản quy định",
            "text": "Giữa các đảng phái chính trị khác nhau",
            "isCorrect": false
          }
        ],
        "question": "Để củng cố khối đại đoàn kết toàn dân tộc, cần tăng cường quan hệ mật thiết giữa những chủ thể nào?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-33-76",
        "options": [
          {
            "note": "Yêu cầu mang tính tổng hợp sức mạnh là đại đoàn kết toàn dân tộc bắt buộc phải kết hợp với đoàn kết quốc tế",
            "text": "Đoàn kết quốc tế",
            "isCorrect": true
          },
          {
            "note": "Không đúng với định hướng kết hợp được nêu trong văn bản",
            "text": "Sức mạnh quân sự hiện đại",
            "isCorrect": false
          },
          {
            "note": "Đây không phải là nội dung kết hợp được nhắc tới",
            "text": "Khả năng tự cung tự cấp",
            "isCorrect": false
          },
          {
            "note": "Đây là biểu hiện tiêu cực cần loại bỏ chứ không phải yếu tố để kết hợp",
            "text": "Chế độ tập trung quan liêu",
            "isCorrect": false
          }
        ],
        "question": "Đại đoàn kết toàn dân tộc phải được kết hợp với yếu tố nào để phát huy sức mạnh?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-34-607",
        "options": [
          {
            "note": "Chủ trương được đề ra để phát triển đất nước là phải chủ động hội nhập kinh tế khu vực và thế giới",
            "text": "Chủ động hội nhập kinh tế khu vực và thế giới",
            "isCorrect": true
          },
          {
            "note": "Hành động này đi ngược lại hoàn toàn với định hướng chủ động hội nhập",
            "text": "Đóng cửa nền kinh tế để tự cung tự cấp",
            "isCorrect": false
          },
          {
            "note": "Chúng ta chủ động hội nhập chứ không phải chấp nhận sự phụ thuộc",
            "text": "Phụ thuộc hoàn toàn vào viện trợ nước ngoài",
            "isCorrect": false
          },
          {
            "note": "Phạm vi hội nhập được chỉ định rộng hơn, bao gồm cả khu vực và thế giới",
            "text": "Chỉ giao thương với các nước láng giềng",
            "isCorrect": false
          }
        ],
        "question": "Cùng với việc kết hợp đoàn kết quốc tế và nâng cao hiệu quả hợp tác, chúng ta cần chủ động thực hiện điều gì trong lĩnh vực kinh tế?",
        "chapterId": "c5",
        "answerIndex": 0
      },
      {
        "id": "q-1787133016731-35-705",
        "options": [
          {
            "note": "Quá trình hội nhập dù mở rộng đến đâu cũng phải kiên quyết dựa trên nguyên tắc không thể tách rời là độc lập tự chủ",
            "text": "Nguyên tắc độc lập tự chủ",
            "isCorrect": true
          },
          {
            "note": "Hoàn toàn trái ngược với nguyên tắc bảo vệ lợi ích và sự tự chủ của dân tộc",
            "text": "Nguyên tắc hy sinh lợi ích quốc gia",
            "isCorrect": false
          },
          {
            "note": "Nguyên tắc cốt lõi là sự độc lập tự chủ chứ không chấp nhận sự phụ thuộc",
            "text": "Nguyên tắc phụ thuộc vào các cường quốc",
            "isCorrect": false
          },
          {
            "note": "Việc hội nhập phải bảo đảm tính độc lập tự chủ vững vàng chứ không phải là sự nhượng bộ vô điều kiện",
            "text": "Nguyên tắc nhượng bộ vô điều kiện",
            "isCorrect": false
          }
        ],
        "question": "Việc chủ động hội nhập kinh tế khu vực và thế giới phải được thực hiện trên nguyên tắc nào?",
        "chapterId": "c5",
        "answerIndex": 0
      }
    ],
    "is_active": true,
    "created_at": "2026-08-19T09:00:55.272228+00:00",
    "updated_at": "2026-08-19T09:50:16.735+00:00"
  }
];
