/**
 * API CONFIGURATION & CLOUDFLARE ENVIRONMENT SETTINGS
 * File cấu hình hệ thống thuần 100% Cloudflare (CF) & D1 Database cho Shinora QuizMaster.
 */

const API_CONFIG = {
  // Cloudflare D1 Native Database Mode (100% Thuần Cloudflare)
  CF_API_BASE: "/api",
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // Cờ kiểm tra trạng thái kết nối Cloud (Sử dụng Cloudflare D1 Database)
  isCloudEnabled() {
    return true;
  },

  // Cấu hình giới hạn & phân trang
  PAGE_SIZE: 20,
  MAX_MISTAKES_STORED: 100,
  CACHE_TTL_MS: 5 * 60 * 1000 // Cache 5 phút
};
