/**
 * AI QUOTA TRACKER SERVICE
 * Giám sát mức dùng API (RPM, TPM, RPD) theo thời gian thực.
 * Tính năng tùy chọn (Mặc định: TẮT để tiết kiệm tối đa tài nguyên và bộ nhớ).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AIQuotaTracker = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {

  const AIQuotaTracker = {
    STORAGE_KEY: "shinora_ai_quota_metrics_v2",

    // Bảng định mức chính xác cho từng Model riêng lẻ (Google AI Studio Free Tier)
    MODEL_QUOTAS: {
      "gemini-3.5-flash-lite": { name: "Gemini 3.5 Flash Lite", category: "Text-out models", rpm: 15, tpm: 250000, rpd: 500 },
      "gemini-3.6-flash":      { name: "Gemini 3.6 Flash",      category: "Text-out models", rpm: 5,  tpm: 250000, rpd: 20 },
      "gemini-3.5-flash":      { name: "Gemini 3.5 Flash",      category: "Text-out models", rpm: 5,  tpm: 250000, rpd: 20 },
      "gemini-3.7-flash":      { name: "Gemini 3.7 Flash",      category: "Text-out models", rpm: 5,  tpm: 250000, rpd: 20 },
      "gemini-3.1-flash-lite": { name: "Gemini 3.1 Flash Lite", category: "Text-out models", rpm: 15, tpm: 250000, rpd: 500 },
      "gemini-3-flash-preview":{ name: "Gemini 3 Flash Preview", category: "Text-out models", rpm: 5, tpm: 250000, rpd: 20 },
      "gemini-flash-latest":   { name: "Gemini Flash Latest",   category: "Text-out models", rpm: 5,  tpm: 250000, rpd: 20 },
      "gemini-flash-lite-latest":{ name: "Gemini Flash-Lite Latest", category: "Text-out models", rpm: 15, tpm: 250000, rpd: 500 },
      "gemini-3.1-pro-preview":{ name: "Gemini 3.1 Pro Preview",category: "Text-out models", rpm: 2,  tpm: 32000,  rpd: 50 },
      "gemini-3.1-flash-tts":  { name: "Gemini 3.1 Flash TTS",  category: "Multi-modal generative models", rpm: 3,  tpm: 10000,  rpd: 10 },
      "gemini-embedding-1":    { name: "Gemini Embedding 1",    category: "Other models", rpm: 100, tpm: 30000,  rpd: 1000 },
      "gemini-embedding-2":    { name: "Gemini Embedding 2",    category: "Other models", rpm: 100, tpm: 30000,  rpd: 1000 },
      "gemma-4-26b-a4b-it":    { name: "Gemma 4 26B",           category: "Other models", rpm: 30,  tpm: 16000,  rpd: 14400 },
      "gemma-4-31b-it":        { name: "Gemma 4 31B",           category: "Other models", rpm: 30,  tpm: 16000,  rpd: 14400 },
      "antigravity-agents":    { name: "Antigravity",           category: "Agents",       rpm: 60,  tpm: 100000, rpd: 100 }
    },

    isEnabled() {
      try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return false;
        const parsed = JSON.parse(data);
        return Boolean(parsed.enabled);
      } catch (e) {
        return false;
      }
    },

    setEnabled(enabled) {
      const state = this._loadState();
      state.enabled = Boolean(enabled);
      this._saveState(state);
      if (typeof App !== "undefined" && typeof App.updateQuotaUI === "function") {
        App.updateQuotaUI();
      }
    },

    _loadState() {
      try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) return JSON.parse(data);
      } catch (e) {}
      return { enabled: false, history: [] };
    },

    _saveState(state) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
    },

    /**
     * Ghi nhận một request vừa thực thi kèm theo Model cụ thể
     * @param {Object} usage usageMetadata từ Google Generative Language API
     * @param {string} [modelId]
     */
    recordRequest(usage = null, modelId = null) {
      if (!this.isEnabled()) return;

      const state = this._loadState();
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      // Dọn dẹp các bản ghi cũ hơn 24 giờ để giải phóng RAM
      state.history = (state.history || []).filter(item => item.time >= oneDayAgo);

      const targetModel = modelId || (typeof GeminiAIParser !== "undefined" ? GeminiAIParser.getSelectedModel() : "gemini-3.5-flash-lite");
      const promptTokens = (usage && usage.promptTokenCount) || 0;
      const candidatesTokens = (usage && usage.candidatesTokenCount) || 0;
      const totalTokens = (usage && usage.totalTokenCount) || (promptTokens + candidatesTokens) || 0;

      state.history.push({
        time: now,
        model: targetModel,
        promptTokens: promptTokens,
        candidatesTokens: candidatesTokens,
        totalTokens: totalTokens
      });

      this._saveState(state);

      if (typeof App !== "undefined" && typeof App.updateQuotaUI === "function") {
        App.updateQuotaUI();
      }
    },

    /**
     * Lấy hạn mức và số liệu thời gian thực của một Model cụ thể
     * @param {string} [modelId]
     */
    getMetrics(modelId = null) {
      const state = this._loadState();
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const todayStart = new Date().setHours(0, 0, 0, 0);

      const activeModel = modelId || (typeof GeminiAIParser !== "undefined" ? GeminiAIParser.getSelectedModel() : "gemini-3.5-flash-lite");
      const quota = this.MODEL_QUOTAS[activeModel] || { name: activeModel, category: "Text-out models", rpm: 15, tpm: 250000, rpd: 500 };

      // Lọc các bản ghi của riêng model này
      const recentMin = (state.history || []).filter(h => h.model === activeModel && h.time >= oneMinuteAgo);
      const recentDay = (state.history || []).filter(h => h.model === activeModel && h.time >= todayStart);

      const currentRPM = recentMin.length;
      const currentTPM = recentMin.reduce((sum, h) => sum + (h.totalTokens || 0), 0);
      const currentRPD = recentDay.length;
      const totalTokensToday = recentDay.reduce((sum, h) => sum + (h.totalTokens || 0), 0);

      return {
        enabled: Boolean(state.enabled),
        modelId: activeModel,
        modelName: quota.name,
        category: quota.category,
        rpm: {
          current: currentRPM,
          limit: quota.rpm,
          percent: quota.rpm > 0 ? Math.min(100, Math.round((currentRPM / quota.rpm) * 100)) : 0
        },
        tpm: {
          current: currentTPM,
          limit: quota.tpm,
          percent: quota.tpm > 0 ? Math.min(100, Math.round((currentTPM / quota.tpm) * 100)) : 0
        },
        rpd: {
          current: currentRPD,
          limit: quota.rpd,
          percent: quota.rpd > 0 ? Math.min(100, Math.round((currentRPD / quota.rpd) * 100)) : 0
        },
        tokensToday: totalTokensToday
      };
    },

    /**
     * Lấy danh sách toàn bộ Model kèm thông số giám sát chi tiết
     */
    getAllModelMetrics() {
      const state = this._loadState();
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const todayStart = new Date().setHours(0, 0, 0, 0);

      return Object.keys(this.MODEL_QUOTAS).map(modelId => {
        const quota = this.MODEL_QUOTAS[modelId];
        const recentMin = (state.history || []).filter(h => h.model === modelId && h.time >= oneMinuteAgo);
        const recentDay = (state.history || []).filter(h => h.model === modelId && h.time >= todayStart);

        const currentRPM = recentMin.length;
        const currentTPM = recentMin.reduce((sum, h) => sum + (h.totalTokens || 0), 0);
        const currentRPD = recentDay.length;

        return {
          modelId: modelId,
          name: quota.name,
          category: quota.category,
          rpm: { current: currentRPM, limit: quota.rpm },
          tpm: { current: currentTPM, limit: quota.tpm },
          rpd: { current: currentRPD, limit: quota.rpd }
        };
      });
    },

    /**
     * Đặt lại bộ đếm về 0
     */
    resetMetrics() {
      const state = this._loadState();
      state.history = [];
      this._saveState(state);
      if (typeof App !== "undefined" && typeof App.updateQuotaUI === "function") {
        App.updateQuotaUI();
      }
    }
  };

  return AIQuotaTracker;
}));
