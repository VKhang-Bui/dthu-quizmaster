/**
 * SYNC MANAGER SERVICE (v4.2.0-beta.a1f8c3)
 * Module quản lý hàng đợi và đồng bộ ngầm lịch sử thi lên Cloudflare D1 khi có mạng.
 * 
 * 🛡️ TÍNH NĂNG & CƠ CHẾ BẢO VỆ:
 * 1. Lắng nghe sự kiện Online/Focus/VisibilityChange của trình duyệt.
 * 2. Đồng bộ tuần tự (Sequential Pipeline with 300ms Delay) chống đụng trần Rate Limiting.
 * 3. Tự động phục hồi khi mất mạng (Offline-first Resilience).
 * 4. Quản lý cờ isSynced trong LocalStorage.
 */

const SyncManager = {
  isSyncing: false,
  intervalId: null,

  init() {
    // 1. Lắng nghe sự kiện mạng Online
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("[SyncManager] 🌐 Phát hiện có mạng trở lại. Kích hoạt đồng bộ ngầm...");
        this.syncPendingData();
      });

      window.addEventListener("focus", () => {
        this.syncPendingData();
      });

      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            this.syncPendingData();
          }
        });
      }
    }

    // 2. Khởi động kiểm tra 1 lần đầu sau khi app nạp xong 2.5 giây
    setTimeout(() => this.syncPendingData(), 2500);
  },

  async syncPendingData() {
    if (this.isSyncing) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    if (typeof StorageService === "undefined" || typeof CloudflareClient === "undefined") return;

    const profile = StorageService.getUserProfile();
    if (!profile || profile.role === "guest") return;

    const unsyncedAttempts = StorageService.getUnsyncedAttempts();
    if (!unsyncedAttempts || unsyncedAttempts.length === 0) return;

    this.isSyncing = true;
    let syncedCount = 0;

    try {
      // 🛡️ Gửi tuần tự (Sequential Loop) với độ trễ 300ms chống Rate Limiting (5 req/phút)
      for (const att of unsyncedAttempts) {
        try {
          const success = await CloudflareClient.submitQuiz({
            userId: att.userId || profile.id,
            studentId: att.studentId || profile.studentId,
            fullName: att.userName || profile.fullName,
            subjectId: att.subjectId || "",
            subjectName: att.subjectName || "Môn học",
            score: att.score10 || 0,
            correctCount: att.correctCount || 0,
            totalQuestions: att.totalQuestions || 0,
            timeSpentSeconds: att.timeTakenSeconds || 0,
            earnedExp: 0 // Điểm EXP bài thi cũ đã được cộng lúc hoàn thành
          });

          if (success) {
            StorageService.markAttemptSynced(att.id);
            syncedCount++;
          }
        } catch (itemErr) {
          console.warn(`[SyncManager] Lỗi đồng bộ bài thi ${att.id}:`, itemErr);
        }

        // Delay 300ms giữa các request để bảo vệ Worker API
        await new Promise(r => setTimeout(r, 300));
      }

      if (syncedCount > 0 && typeof App !== "undefined" && typeof App.showToast === "function") {
        App.showToast(`☁️ Đã đồng bộ ngầm ${syncedCount} bài thi lên Cloudflare D1!`, "info", 3500);
      }
    } catch (e) {
      console.warn("[SyncManager] Lỗi chu trình đồng bộ ngầm:", e);
    } finally {
      this.isSyncing = false;
    }
  }
};
