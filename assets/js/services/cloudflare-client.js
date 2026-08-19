/**
 * CLOUDFLARE D1 DATABASE CLIENT SERVICE (v4.2.0-beta.a1f8c3)
 * Dịch vụ giao tiếp bảo mật với Cloudflare D1 Database qua Worker API (/api/*).
 * Tích hợp Session Token Authentication, RBAC + ABAC Authorization, chống IDOR.
 */

const CloudflareClient = {
  TOKEN_STORAGE_KEY: "shinora_cf_session_token",

  getApiBase() {
    return "/api";
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_STORAGE_KEY) || "";
  },

  setToken(token) {
    if (!token) {
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(this.TOKEN_STORAGE_KEY, token.trim());
    }
  },

  getAuthHeaders() {
    const token = this.getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  async isHealthy() {
    try {
      const res = await fetch(`${this.getApiBase()}/health`);
      if (res.ok) {
        const data = await res.json();
        return data.status === "ok";
      }
    } catch (e) {}
    return false;
  },

  async login(studentId, pinCode) {
    try {
      const res = await fetch(`${this.getApiBase()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, pinCode })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.token) {
          this.setToken(json.token);
        }
        return json.user;
      }
      throw new Error(json.error || "Đăng nhập thất bại");
    } catch (e) {
      console.warn("[Cloudflare D1] login error:", e);
      throw e;
    }
  },

  async getMyProfile() {
    try {
      const res = await fetch(`${this.getApiBase()}/users/me`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("[Cloudflare D1] getMyProfile error:", e);
    }
    return null;
  },

  async getAllUsers() {
    try {
      const res = await fetch(`${this.getApiBase()}/users`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("[Cloudflare D1] getAllUsers error:", e);
    }
    return null;
  },

  async registerUser(userData) {
    try {
      const res = await fetch(`${this.getApiBase()}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Đăng ký không thành công trên Cloudflare D1");
      }
      return json.data;
    } catch (e) {
      console.warn("[Cloudflare D1] registerUser error:", e);
      throw e;
    }
  },

  async updateUser(userData) {
    try {
      const res = await fetch(`${this.getApiBase()}/users/update`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      const json = await res.json();
      if (!res.ok) {
        console.warn("[Cloudflare D1] updateUser rejected:", json.error);
      }
      return Boolean(json.success);
    } catch (e) {
      console.warn("[Cloudflare D1] updateUser error:", e);
      return false;
    }
  },

  async submitQuiz(quizData) {
    try {
      const res = await fetch(`${this.getApiBase()}/quiz/submit`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(quizData)
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (e) {
      console.warn("[Cloudflare D1] submitQuiz error:", e);
      return false;
    }
  },

  async getLeaderboard() {
    try {
      const res = await fetch(`${this.getApiBase()}/leaderboard`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("[Cloudflare D1] getLeaderboard error:", e);
    }
    return [];
  },

  async submitTicket(ticketData) {
    try {
      const res = await fetch(`${this.getApiBase()}/support/ticket`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(ticketData)
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (e) {
      console.warn("[Cloudflare D1] submitTicket error:", e);
      return false;
    }
  },

  async getSupportTickets() {
    try {
      const res = await fetch(`${this.getApiBase()}/support/tickets`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("[Cloudflare D1] getSupportTickets error:", e);
    }
    return [];
  },

  async resolveSupportTicket(ticketId, newPin = "", studentId = "") {
    try {
      const res = await fetch(`${this.getApiBase()}/support/resolve`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ticketId, newPin, studentId })
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (e) {
      console.warn("[Cloudflare D1] resolveSupportTicket error:", e);
      return false;
    }
  },

  async getDrafts() {
    try {
      const res = await fetch(`${this.getApiBase()}/drafts`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("[Cloudflare D1] getDrafts error:", e);
    }
    return [];
  },

  async createDraft(draftData) {
    try {
      const res = await fetch(`${this.getApiBase()}/drafts/create`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(draftData)
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (e) {
      console.warn("[Cloudflare D1] createDraft error:", e);
      return false;
    }
  },

  async updateDraftStatus(id, status) {
    try {
      const res = await fetch(`${this.getApiBase()}/drafts/update-status`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id, status })
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (e) {
      console.warn("[Cloudflare D1] updateDraftStatus error:", e);
      return false;
    }
  },

  async deleteDraft(id) {
    try {
      const res = await fetch(`${this.getApiBase()}/drafts/delete`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (e) {
      console.warn("[Cloudflare D1] deleteDraft error:", e);
      return false;
    }
  },

  async getMyQuizHistory(studentId = "") {
    try {
      const url = studentId ? `${this.getApiBase()}/quiz/history?studentId=${encodeURIComponent(studentId)}` : `${this.getApiBase()}/quiz/history`;
      const res = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("[Cloudflare D1] getMyQuizHistory error:", e);
    }
    return [];
  },

  async resetSeasonPoints() {
    try {
      const res = await fetch(`${this.getApiBase()}/season/reset-points`, {
        method: "POST",
        headers: this.getAuthHeaders()
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (e) {
      console.warn("[Cloudflare D1] resetSeasonPoints error:", e);
      return false;
    }
  },

  async reportPresence(status = "online", context = "Trang chủ") {
    try {
      const token = this.getToken();
      if (!token) return false;

      const res = await fetch(`${this.getApiBase()}/users/presence`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, context }),
        keepalive: true
      });
      return res.ok;
    } catch (e) {
      // Bỏ qua lỗi ngầm nếu offline
      return false;
    }
  }
};
