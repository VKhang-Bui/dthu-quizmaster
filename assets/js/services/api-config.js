/**
 * API CONFIGURATION & SUPABASE ENVIRONMENT SETTINGS
 * File cấu hình kết nối đám mây (Supabase / Cloudflare) cho Shinora QuizMaster.
 * 
 * Hướng dẫn:
 * 1. Đăng ký tài khoản miễn phí tại https://supabase.com
 * 2. Tạo một Project mới (Ví dụ: shinora-quizmaster)
 * 3. Chạy script SQL trong docs/DATABASE_SCHEMA.sql tại mục SQL Editor của Supabase
 * 4. Điền URL và Anon Key vào bên dưới:
 */

const API_CONFIG = {
  // Cấu hình Supabase Cloud (Đã kích hoạt CSDL đám mây PostgreSQL Shinora QuizMaster)
  SUPABASE_URL: "https://bpntyxetofyqchlmoaua.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_XDlDvMS7oPEA-Xm3l-SpTg_YLQaPTpZ",

  // Cờ kiểm tra trạng thái kết nối Cloud
  isCloudEnabled() {
    return Boolean(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
  },

  // Cấu hình giới hạn & phân trang
  PAGE_SIZE: 20,
  MAX_MISTAKES_STORED: 100,
  CACHE_TTL_MS: 5 * 60 * 1000 // Cache 5 phút
};
