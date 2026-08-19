PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  class_name TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT DEFAULT 'Khoa Kỹ thuật - Công nghệ',
  role TEXT DEFAULT 'student',
  pin_code TEXT DEFAULT '123456',
  avatar TEXT DEFAULT '👨‍🎓',
  total_exp INTEGER DEFAULT 50,
  season_exp INTEGER DEFAULT 50,
  contribution_points INTEGER DEFAULT 0,
  season_cp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 1,
  quizzes_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending_approval',
  permissions TEXT DEFAULT '{}',
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
, presence_status TEXT DEFAULT 'offline', presence_context TEXT DEFAULT 'Trang chủ', last_seen_at TEXT DEFAULT '');
INSERT INTO "users" ("id","student_id","class_name","full_name","email","phone","department","role","pin_code","avatar","total_exp","season_exp","contribution_points","season_cp","streak_days","quizzes_completed","status","permissions","approved_by","approved_at","created_at","updated_at","presence_status","presence_context","last_seen_at") VALUES('USR-01','0024418475','ĐHCNSH24A','Bùi Văn Khang (Shina Sanora)','vkhg.bui@gmail.com','0354616301','Khoa Kỹ thuật - Công nghệ','admin','b5d6611c40792da5e50f6c3f3ea1e381dd064bc86ca84bf31ab697b60d546f2c','avatar-crown',50,50,9999,0,30,1,'active','{"canApproveDrafts":true,"canEditSubjects":true,"canManageMaterials":true,"canManageUsers":true}','Hệ Thống','2026-08-19 12:27:33','2026-08-19 12:27:33','2026-08-19 18:24:11','online','Trang chủ','2026-08-19 18:24:10');
INSERT INTO "users" ("id","student_id","class_name","full_name","email","phone","department","role","pin_code","avatar","total_exp","season_exp","contribution_points","season_cp","streak_days","quizzes_completed","status","permissions","approved_by","approved_at","created_at","updated_at","presence_status","presence_context","last_seen_at") VALUES('USR-3bbf26eb-b17c-4b3c-b6e0-c7ed0c0ef556','0024418536','','Lê Hoàng Anh Kiệt','lehoanganhkiet.dmx2020@gmail.com','','Khoa Kỹ thuật - Công nghệ','student','a49e73a7056eda6574e598c39af7302fe24e371dbd0bf194f7e65861a8831342','avatar-student',50,50,0,0,1,0,'active','{"canApproveDrafts":false,"canEditSubjects":false,"canManageMaterials":false,"canManageUsers":false}','Bùi Văn Khang (Shina Sanora)','2026-08-19T15:01:54.744Z','2026-08-19 15:01:26','2026-08-19 15:01:54','offline','Trang chủ','');
INSERT INTO "users" ("id","student_id","class_name","full_name","email","phone","department","role","pin_code","avatar","total_exp","season_exp","contribution_points","season_cp","streak_days","quizzes_completed","status","permissions","approved_by","approved_at","created_at","updated_at","presence_status","presence_context","last_seen_at") VALUES('USR-7fbf6cb5-5623-4965-a579-2258fbf54241','0024416320','','gơ tone hằm','dangthuhiendmx321@gmail.com','','Khoa Nông nghiệp - Sinh học','student','e9df7708c5742aaa0bbce6fda2b3dba3f4e8a8c28929ff4ab65f01edcd0a0a33','👨‍🎓',85,85,0,0,1,3,'active','{"canApproveDrafts":false,"canEditSubjects":false,"canManageMaterials":false,"canManageUsers":false}','Bùi Văn Khang (Shina Sanora)','2026-08-19T15:02:24.372Z','2026-08-19 15:02:14','2026-08-19 16:01:22','offline','Trang chủ','');
INSERT INTO "users" ("id","student_id","class_name","full_name","email","phone","department","role","pin_code","avatar","total_exp","season_exp","contribution_points","season_cp","streak_days","quizzes_completed","status","permissions","approved_by","approved_at","created_at","updated_at","presence_status","presence_context","last_seen_at") VALUES('USR-836ca8a2-8cf5-4fbb-91a7-ea2471efba38','24419338','','huỳnh thái khang','khang0766860695@gmail.com','','Khoa Kỹ thuật - Công nghệ','student','b814fb70e9b741b5fbfe19d48d8b08c82856c6467e9faa2c970d65258fac55c9','avatar-student',50,50,0,0,1,0,'active','{"canApproveDrafts":false,"canEditSubjects":false,"canManageMaterials":false,"canManageUsers":false}','Bùi Văn Khang (Shina Sanora)','2026-08-19T15:45:52.418Z','2026-08-19 15:35:27','2026-08-19 15:45:52','offline','Trang chủ','');
INSERT INTO "users" ("id","student_id","class_name","full_name","email","phone","department","role","pin_code","avatar","total_exp","season_exp","contribution_points","season_cp","streak_days","quizzes_completed","status","permissions","approved_by","approved_at","created_at","updated_at","presence_status","presence_context","last_seen_at") VALUES('USR-45417b05-36fc-4bf9-8dc9-5f4513a86a57','0024418277','','Ngọc Như','lythingocnhu111220@gmail.com','','Khoa Nông nghiệp - Sinh học','student','886e18c7f2a6ba4a01064a4e8ea43a979d4adb72a9e8db436f1a9af65ce3bdf7','avatar-student',50,50,0,0,1,0,'active','{"canApproveDrafts":false,"canEditSubjects":false,"canManageMaterials":false,"canManageUsers":false}','Bùi Văn Khang (Shina Sanora)','2026-08-19T15:45:53.870Z','2026-08-19 15:42:50','2026-08-19 15:45:53','offline','Trang chủ','');
INSERT INTO "users" ("id","student_id","class_name","full_name","email","phone","department","role","pin_code","avatar","total_exp","season_exp","contribution_points","season_cp","streak_days","quizzes_completed","status","permissions","approved_by","approved_at","created_at","updated_at","presence_status","presence_context","last_seen_at") VALUES('USR-77781054-3c9e-4948-b25c-5a737cf52cad','0024419030','','Đỗ Bảo Hồ','baoho12406@gmail.com','','Khoa Kỹ thuật - Công nghệ','student','9735c55367cadb4ae6a8ceb180a38dce37e94e474dbacb77b55166b79e79a49d','👨‍🎓',50,50,0,0,1,0,'active','{"canApproveDrafts":false,"canEditSubjects":false,"canManageMaterials":false,"canManageUsers":false}','Bùi Văn Khang (Shina Sanora)','2026-08-19T16:17:08.951Z','2026-08-19 16:15:44','2026-08-19 16:17:08','offline','Trang chủ','');
CREATE TABLE quiz_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  student_id TEXT,
  full_name TEXT,
  subject_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  score REAL NOT NULL,
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "quiz_submissions" ("id","user_id","student_id","full_name","subject_id","subject_name","score","correct_count","total_questions","time_spent_seconds","submitted_at") VALUES('SUB-278a7ed0-ad9c-460e-aac7-9367f30d919d','USR-01','0024418475','Bùi Văn Khang (Shina Sanora)','SUB_1787130055148','Tư Tưởng Hồ Chí Minh',8.55,53,62,1938,'2026-08-19 14:48:19');
INSERT INTO "quiz_submissions" ("id","user_id","student_id","full_name","subject_id","subject_name","score","correct_count","total_questions","time_spent_seconds","submitted_at") VALUES('SUB-e71460fd-c68b-4bee-9d1d-32510f2d581d','USR-7fbf6cb5-5623-4965-a579-2258fbf54241','0024416320','gơ tone hằm','SUB_1787130055148','Tư Tưởng Hồ Chí Minh',8.33,30,36,421,'2026-08-19 15:11:48');
INSERT INTO "quiz_submissions" ("id","user_id","student_id","full_name","subject_id","subject_name","score","correct_count","total_questions","time_spent_seconds","submitted_at") VALUES('SUB-1da69394-870a-47d5-b0d8-303ab1bfc867','USR-7fbf6cb5-5623-4965-a579-2258fbf54241','0024416320','gơ tone hằm','SUB_1787130055148','Tư Tưởng Hồ Chí Minh',8.87,55,62,1025,'2026-08-19 15:30:32');
INSERT INTO "quiz_submissions" ("id","user_id","student_id","full_name","subject_id","subject_name","score","correct_count","total_questions","time_spent_seconds","submitted_at") VALUES('SUB-e1550bc1-a583-4fd5-9237-96b299bbaa1e','USR-7fbf6cb5-5623-4965-a579-2258fbf54241','0024416320','gơ tone hằm','SUB_1787130055148','Tư Tưởng Hồ Chí Minh',9.26,50,54,884,'2026-08-19 15:46:27');
CREATE TABLE draft_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  author_name TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  data_json TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "draft_submissions" ("id","user_id","author_name","subject_name","subject_code","status","data_json","created_at") VALUES('draft-1787164022638','','Bùi Văn Khang (Shina Sanora) (MSSV: 0024418475)','Tin Sinh Hoc','BT4026','pending','{"id":"draft-1787164022638","targetSubjectId":"SUB_1786975462944","targetChapterId":"c1","name":"Tin Sinh Hoc","code":"BT4026","department":"Khoa Công Nghệ - Kỹ Thuật","description":"Bộ đề gồm 3 câu hỏi môn Tin Sinh Hoc (Chương: c1), nhập qua Parser ngày 20/8/2026.","icon":"📚","author":"Bùi Văn Khang (Shina Sanora) (MSSV: 0024418475)","authorEmail":"vkhg.bui@gmail.com","submissionDate":"20/8/2026","isDraft":true,"status":"pending","chapters":[{"id":"c1","name":"PRO TEST 1","description":""},{"id":"c2","name":"PRO TEST 2","description":""}],"questions":[{"id":"Q-71301","chapterId":"c1","question":"Theo nghĩa rộng, **Chủ nghĩa xã hội khoa học** (CNXHKH) được hiểu là gì?","options":[{"text":"Toàn bộ chủ nghĩa Mác - Lênin","isCorrect":true,"note":"Đáp án chính xác."},{"text":"Hệ tư tưởng của riêng giai cấp \"tư sản\"","isCorrect":false,"note":""},{"text":"Một nhánh nhỏ độc lập không thuộc chủ nghĩa Mác","isCorrect":false,"note":""},{"text":"Chỉ bao gồm bộ phận Kinh tế chính trị Mác - Lênin","isCorrect":false,"note":""}],"answerIndex":0,"warning":null,"type":"single"},{"id":"Q-71302","chapterId":"c1","question":"Công thức nào sau đây biểu thị đúng điều kiện cân bằng trong điều kiện kinh tế: `P * Q = M * V` và so sánh `a < b & c > d`?","options":[{"text":"Điều kiện kinh tế số 1 với $100% tỷ lệ #thành_công *","isCorrect":false,"note":""},{"text":"Phương trình `P * Q = M * V` và biểu thức so sánh (a < b & c > d)","isCorrect":false,"note":""},{"text":"Ký hiệu @author: Shina Sanora &amp; Shinora Community","isCorrect":true,"note":"Đáp án chính xác."},{"text":"Biểu thức ''chuỗi ký tự đặc biệt'': \"100% chính xác?\" / [Ghi chú]","isCorrect":false,"note":""}],"answerIndex":2,"warning":null,"type":"single"},{"id":"Q-71303","chapterId":"c1","question":"Phát kiến vĩ đại nào của *","options":[{"text":"","isCorrect":false,"note":""},{"text":"","isCorrect":false,"note":""},{"text":"Mác* và *Ph. Ăng-ghen* tạo tiền đề để luận chứng sự ra đời của CNXHKH? A. Định luật vạn vật hấp dẫn B. Thuyết tương đối của Einstein C. Chủ nghĩa duy vật lịch sử và Học thuyết giá trị thặng dư [Đúng]","isCorrect":true,"note":"Đáp án chính xác."},{"text":"Thuyết chọn lọc tự nhiên của Darwin","isCorrect":false,"note":""}],"answerIndex":2,"warning":null,"type":"single"}]}','2026-08-19 18:27:02');
CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  ticket_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  student_id TEXT,
  full_name TEXT,
  contact TEXT,
  email TEXT,
  phone TEXT,
  issue_type TEXT DEFAULT 'support',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_draft_created_at ON draft_submissions(created_at DESC);
CREATE INDEX idx_tickets_created_at ON support_tickets(created_at DESC);
