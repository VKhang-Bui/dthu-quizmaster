/**
 * API CONFIGURATION & SUPABASE ENVIRONMENT SETTINGS
 * File cấu hình kết nối đám mây (Supabase / Cloudflare) cho DThu QuizMaster.
 * 
 * Hướng dẫn:
 * 1. Đăng ký tài khoản miễn phí tại https://supabase.com
 * 2. Tạo một Project mới (Ví dụ: dthu-quizmaster)
 * 3. Chạy script SQL trong docs/DATABASE_SCHEMA.sql tại mục SQL Editor của Supabase
 * 4. Điền URL và Anon Key vào bên dưới:
 */

const API_CONFIG = {
  // Cấu hình Supabase Cloud (Để trống nếu chạy chế độ Offline / LocalStorage thuần)
  SUPABASE_URL: "",      // Ví dụ: "https://xyzcompany.supabase.co"
  SUPABASE_ANON_KEY: "", // Khóa công khai Anon Key từ Project Settings > API

  // Cờ kiểm tra trạng thái kết nối Cloud
  isCloudEnabled() {
    return Boolean(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
  },

  // Cấu hình giới hạn & phân trang
  PAGE_SIZE: 20,
  MAX_MISTAKES_STORED: 100,
  CACHE_TTL_MS: 5 * 60 * 1000 // Cache 5 phút
};
