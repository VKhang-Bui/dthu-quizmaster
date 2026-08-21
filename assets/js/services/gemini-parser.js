/**
 * SHINORA QUIZMASTER — GEMINI AI PARSER SERVICE (v4.3.0)
 * Module tích hợp Google Gemini AI Studio API để bóc tách tài liệu (PDF, Word, Ảnh, Text).
 * 
 * 🛡️ TÍNH NĂNG NỀN TẢNG:
 * 1. Dual-Gateway: Hỗ trợ Cổng Direct Client (BYOK) lẫn Cổng Server Worker (/api/ai/parse).
 * 2. Model Router: Mặc định gemini-2.0-flash-lite siêu nhanh (<2s), dự phòng gemini-1.5-flash-8b.
 * 3. Siêu Tiết Kiệm Token: Xuất trực tiếp định dạng Shinora Raw Text (Câu 1: ... A. ... B. >đúng:... )
 * 4. Bảo Mật 2 Chiều: Mã hóa Key cục bộ trong LocalStorage, Zero-Server logging cho Client Key.
 */

const GeminiAIParser = {
  STORAGE_KEYS: {
    API_KEY: "shinora_gemini_api_key",
    PRIVACY_MODE: "shinora_gemini_privacy_mode", // 'direct' hoặc 'proxy'
    MODEL: "shinora_gemini_model"
  },

  DEFAULT_MODEL: "gemini-3.5-flash-lite",

  MODELS: [
    { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", badge: "⚡ Siêu tốc & Tiết kiệm Token (Khuyên dùng)", tier: "fast" },
    { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", badge: "✨ Mới nhất (Thay thế 2.5 Flash)", tier: "standard" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", badge: "🎯 Chuẩn Flash & Đề thi phức tạp", tier: "standard" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", badge: "🚀 Dự phòng tốc độ cao (500 RPD)", tier: "fast" },
    { id: "gemini-flash-latest", name: "Gemini Flash Latest", badge: "🔄 Tự động cập nhật bản Flash mới nhất", tier: "standard" },
    { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", badge: "🧠 Dòng Pro (Yêu cầu Quota Pro/Paid Tier)", tier: "pro" }
  ],

  SYSTEM_PROMPT: `Bạn là bộ vi xử lý trích xuất đề thi trắc nghiệm siêu tốc của Shinora QuizMaster.
Nhiệm vụ: Đọc toàn bộ tài liệu đầu vào (PDF, Word, Ảnh chụp đề thi hoặc Text) và chuyển đổi thành văn bản thuần túy theo đúng quy tắc nghiêm ngặt sau:

1. QUY TẮC ĐỊNH DẠNG:
- Mỗi câu hỏi bắt đầu bằng: "Câu [Số]: [Nội dung câu hỏi]" (Ví dụ: "Câu 1: Quá trình đường phân diễn ra ở đâu?")
- Mỗi phương án nằm trên 1 DÒNG RIÊNG BIỆT: "A. [Nội dung]", "B. [Nội dung]", "C. [Nội dung]", "D. [Nội dung]"
- Phương án ĐÚNG bắt buộc phải gắn cờ " >đúng" ở cuối dòng: "B. Bào tương >đúng"
- Nếu trong đề bài gốc CÓ SẴN giải thích, hãy gắn vào sau dấu hai chấm: "B. Bào tương >đúng:Diễn ra tại bào tương tế bào"
- Các phương án SAI để nguyên (không gắn bất kỳ thẻ nào).

2. QUY TẮC NHẬN DIỆN ĐÁP ÁN ĐÚNG TRONG ĐỀ:
- Nhận diện phương án đúng dựa vào: dấu gạch chân, chữ in đậm, màu chữ đỏ/xanh, dấu sao (*A.), chữ [Đúng], hoặc Bảng đáp án tổng hợp (Answer Key) ở cuối đề.
- Nếu câu nào trong đề không có đáp án đúng, hãy gán phương án A mặc định là >đúng.

3. QUY TẮC XUẤT BẢN:
- CHỈ TRẢ VỀ VĂN BẢN THEO CÚ PHÁP TRÊN.
- TUYỆT ĐỐI KHÔNG viết lời chào, KHÔNG bọc trong markdown code block (\`\`\`markdown hay \`\`\`), KHÔNG thêm bất kỳ ghi chú nào ngoài nội dung câu hỏi.`,

  getModelDisplayName(modelId = null) {
    const target = modelId || this.getSelectedModel();
    const found = this.MODELS.find(m => m.id === target);
    return found ? found.name : target;
  },

  getSelectedModel() {
    return localStorage.getItem(this.STORAGE_KEYS.MODEL) || this.DEFAULT_MODEL;
  },

  setSelectedModel(modelId) {
    if (!modelId) {
      localStorage.removeItem(this.STORAGE_KEYS.MODEL);
    } else {
      localStorage.setItem(this.STORAGE_KEYS.MODEL, modelId);
    }
  },

  /**
   * Dự đoán thông số tài nguyên trước khi gửi AI (Pre-flight Estimation)
   * @param {File|Blob} file 
   * @returns {{ estimatedQuestions: number, estimatedInputTokens: number, estimatedOutputTokens: number, isLargeDocument: boolean, advice: string }}
   */
  estimateFileMetrics(file) {
    const sizeBytes = (file && file.size) || 1024;
    const fileName = (file && file.name) ? file.name.toLowerCase() : "";
    const ext = fileName.split('.').pop() || "";

    let estimatedQuestions = 10;
    let estimatedInputTokens = Math.round(sizeBytes / 4);

    if (ext === "docx" || ext === "doc") {
      // Tệp Word: Trung bình 400 - 500 byte mỗi câu hỏi (bao gồm 4 phương án)
      estimatedQuestions = Math.max(5, Math.round(sizeBytes / 450));
      estimatedInputTokens = Math.round(sizeBytes / 3.5);
    } else if (ext === "pdf") {
      // Tệp PDF: Trung bình 1.5KB - 2.5KB mỗi trang (~10-15 câu/trang)
      estimatedQuestions = Math.max(5, Math.round(sizeBytes / 900));
      estimatedInputTokens = Math.round(sizeBytes / 2.5);
    } else if (ext === "txt" || ext === "md" || ext === "csv") {
      // Tệp Text thuần: Trung bình 250 byte mỗi câu hỏi
      estimatedQuestions = Math.max(5, Math.round(sizeBytes / 250));
      estimatedInputTokens = Math.round(sizeBytes / 3);
    } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
      // Hình ảnh scan: 1 ảnh thường chứa 5 - 20 câu hỏi
      estimatedQuestions = 15;
      estimatedInputTokens = 1500;
    }

    // Mỗi câu hỏi trắc nghiệm tiếng Việt (kèm 4 đáp án & giải thích) sinh ra ~120 - 150 tokens
    const estimatedOutputTokens = estimatedQuestions * 135;
    const isLargeDocument = estimatedQuestions > 60 || estimatedOutputTokens > 7500;

    let advice = "✅ Kích thước tài nguyên tối ưu, sẵn sàng bóc tách trong 1 lần gọi duy nhất.";
    if (isLargeDocument) {
      advice = `⚠️ Đề thi dài (khoảng ~${estimatedQuestions} câu). Output của Google Gemini giới hạn tối đa 8,192 Token. Bạn có thể chọn bóc tách toàn bộ hoặc giới hạn số câu để đảm bảo không bị ngắt giữa chừng.`;
    }

    return {
      estimatedQuestions,
      estimatedInputTokens,
      estimatedOutputTokens,
      isLargeDocument,
      advice
    };
  },

  /**
   * Dự đoán thông số tổng hợp cho danh sách nhiều file
   * @param {Array<File>} files
   */
  estimateMultipleFilesMetrics(files = []) {
    if (!files || files.length === 0) {
      return {
        totalFiles: 0,
        totalBytes: 0,
        estimatedQuestions: 0,
        estimatedInputTokens: 0,
        estimatedOutputTokens: 0,
        isLargeDocument: false,
        filesBreakdown: [],
        advice: "Chưa chọn tệp nào."
      };
    }

    let totalBytes = 0;
    let totalQuestions = 0;
    let totalInputTokens = 0;
    const filesBreakdown = [];

    files.forEach(f => {
      const m = this.estimateFileMetrics(f);
      totalBytes += (f.size || 0);
      totalQuestions += m.estimatedQuestions;
      totalInputTokens += m.estimatedInputTokens;
      filesBreakdown.push({
        file: f,
        name: f.name || "Tệp đề thi",
        size: f.size || 0,
        estimatedQuestions: m.estimatedQuestions,
        estimatedInputTokens: m.estimatedInputTokens,
        estimatedOutputTokens: m.estimatedOutputTokens
      });
    });

    const totalOutputTokens = totalQuestions * 135;
    const isLarge = totalQuestions > 60 || totalOutputTokens > 7500 || files.length > 1;

    let advice = "✅ Kích thước tài nguyên tối ưu, sẵn sàng bóc tách.";
    if (isLarge) {
      advice = `⚠️ Tổng cộng ~${totalQuestions} câu hỏi qua ${files.length} tệp. Khuyên dùng Chế độ Tự Động Chia Đợt Tuần Tự để bóc tách trọn vẹn không bị tràn 8,192 Token.`;
    }

    return {
      totalFiles: files.length,
      totalBytes,
      estimatedQuestions: totalQuestions,
      estimatedInputTokens: totalInputTokens,
      estimatedOutputTokens: totalOutputTokens,
      isLargeDocument: isLarge,
      filesBreakdown,
      advice
    };
  },

  /**
   * Đo lường chính xác 100% Token Đầu Vào bằng Google Gemini Tokenizer API (Miễn phí, không tốn Output Token)
   * @param {File|Blob} file 
   * @param {string} [modelId] 
   * @returns {Promise<number|null>}
   */
  async countFileTokens(file, modelId = null) {
    if (!file) return null;
    const model = modelId || this.getSelectedModel();
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      const base64Data = await this.fileToBase64(file);
      const mimeType = file.type || this.detectMimeType(file.name);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:countTokens?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              },
              {
                text: this.SYSTEM_PROMPT
              }
            ]
          }
        ]
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) return null;
      const data = await response.json();
      return (data && typeof data.totalTokens === "number") ? data.totalTokens : null;
    } catch (e) {
      console.warn("countFileTokens failed:", e);
      return null;
    }
  },

  /**
   * Tính toán danh sách các đợt bóc tách theo cấu hình (Batch Plan Generator)
   * Chuẩn hóa theo trần phần cứng 8,192 Output Tokens của Google Gemini (không dùng công thức nhân mò)
   * @param {number} totalQuestions Tổng số câu hỏi dự kiến
   * @param {number} batchSize Kích thước mỗi đợt (0 = toàn bộ trong 1 đợt)
   * @param {number} fromQ Câu bắt đầu (mặc định 1)
   * @param {number} toQ Câu kết thúc (mặc định bằng totalQuestions)
   * @returns {Array<{ batchIndex: number, fromQ: number, toQ: number, count: number, maxOutputLimit: number, isSafe: boolean }>}
   */
  estimateBatchPlan(totalQuestions = 50, batchSize = 50, fromQ = 1, toQ = null) {
    const startQ = Math.max(1, parseInt(fromQ, 10) || 1);
    const endQ = Math.max(startQ, parseInt(toQ, 10) || totalQuestions || 50);
    const totalQRange = endQ - startQ + 1;

    const bSize = (parseInt(batchSize, 10) > 0) ? parseInt(batchSize, 10) : totalQRange;
    const totalBatches = Math.max(1, Math.ceil(totalQRange / bSize));

    const batches = [];
    for (let i = 1; i <= totalBatches; i++) {
      const bFrom = startQ + (i - 1) * bSize;
      const bTo = Math.min(bFrom + bSize - 1, endQ);
      const bCount = bTo - bFrom + 1;
      const isSafe = bCount <= 60; // Dưới 60 câu nằm hoàn toàn trong hạn mức trần 8,192 Output Tokens

      batches.push({
        batchIndex: i,
        fromQ: bFrom,
        toQ: bTo,
        count: bCount,
        maxOutputLimit: 8192,
        isSafe: isSafe
      });
    }

    return batches;
  },

  getPrivacyMode() {
    return localStorage.getItem(this.STORAGE_KEYS.PRIVACY_MODE) || "direct";
  },

  setPrivacyMode(mode) {
    localStorage.setItem(this.STORAGE_KEYS.PRIVACY_MODE, mode === "proxy" ? "proxy" : "direct");
  },

  getApiKey() {
    return localStorage.getItem(this.STORAGE_KEYS.API_KEY) || "";
  },

  setApiKey(key) {
    if (!key) {
      localStorage.removeItem(this.STORAGE_KEYS.API_KEY);
    } else {
      localStorage.setItem(this.STORAGE_KEYS.API_KEY, key.trim());
    }
  },

  hasApiKey() {
    return Boolean(this.getApiKey());
  },

  /**
   * Chuyển đổi File sang Base64 Payload
   */
  async fileToBase64(file) {
    if (file && typeof file.arrayBuffer === "function") {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return (typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64"));
    }
    return new Promise((resolve, reject) => {
      if (typeof FileReader !== "undefined") {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          const base64 = result.includes(",") ? result.split(",")[1] : result;
          resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      } else {
        reject(new Error("Không hỗ trợ đọc file Base64"));
      }
    });
  },

  /**
   * Đọc nội dung Text từ File thuần
   */
  async fileToText(file) {
    if (file && typeof file.text === "function") {
      return await file.text();
    }
    return new Promise((resolve, reject) => {
      if (typeof FileReader !== "undefined") {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file, "UTF-8");
      } else {
        reject(new Error("Không hỗ trợ đọc file Text"));
      }
    });
  },

  /**
   * Kiểm tra tính hợp lệ của API Key bằng 1 prompt nhẹ (Ping Test)
   */
  async testApiKey(apiKey = null) {
    const key = apiKey || this.getApiKey();
    if (!key) {
      return { success: false, message: "Vui lòng nhập API Key để kiểm tra!" };
    }

    const model = this.getSelectedModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

    try {
      const startTime = performance.now();
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Trả về duy nhất từ 'OK' nếu bạn nhận được tin nhắn này." }]
          }],
          generationConfig: {
            maxOutputTokens: 10,
            temperature: 0.1
          }
        })
      });

      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      if (res.ok && data.candidates && data.candidates.length > 0) {
        return {
          success: true,
          message: `✅ Kết nối thành công tới model ${model} (${durationMs}ms)!`,
          durationMs
        };
      } else {
        const errMsg = data.error?.message || "API Key không hợp lệ hoặc đã hết hạn ngạch.";
        return { success: false, message: `❌ Lỗi Google API: ${errMsg}` };
      }
    } catch (err) {
      return { success: false, message: `❌ Lỗi kết nối mạng: ${err.message}` };
    }
  },

  /**
   * Hàm chính: Nhận File (PDF, DOCX, Ảnh, Text) và bóc tách thành chuỗi Shinora Raw Text (1 lần gọi duy nhất)
   * @param {File|Blob} file 
   * @param {Object} [options] 
   * @returns {Promise<{ success: boolean, text: string, model: string, durationMs: number, source: string }>}
   */
  async parseDocument(file, options = {}) {
    if (!file) throw new Error("Vui lòng chọn tệp đề thi hợp lệ!");

    const startTime = performance.now();
    const fileName = (file.name || "").toLowerCase();
    const fileType = (file.type || "").toLowerCase();
    const model = options.model || this.getSelectedModel();

    const isPdf = fileName.endsWith(".pdf") || fileType.includes("pdf");
    const isImage = fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".webp") || fileType.startsWith("image/");
    const isText = fileName.endsWith(".txt") || fileName.endsWith(".md") || fileType.includes("text");

    const customKey = this.getApiKey();
    const privacyMode = this.getPrivacyMode();
    let callSource = (customKey && privacyMode === "direct") ? "direct_client" : "worker_gateway";

    // 1. Chuẩn bị Prompt
    const contents = [];
    let basePrompt = options.customPrompt || "Hãy đọc và chuyển đổi toàn bộ đề thi trắc nghiệm trong tài liệu này thành văn bản thuần túy theo đúng cú pháp:\n- Mỗi câu bắt đầu bằng: 'Câu [Số]: [Nội dung]'\n- Mỗi phương án 1 dòng: 'A. ...', 'B. ...', 'C. ...', 'D. ...'\n- Phương án đúng gắn cờ ' >đúng' (hoặc ' >đúng:[Giải thích]').\n- Phương án sai để nguyên.\n- Tuyệt đối không bọc trong markdown code block, chỉ trả về văn bản đề thi.";

    if (options.maxQuestions && parseInt(options.maxQuestions, 10) > 0) {
      basePrompt += `\n- LƯU Ý ĐẶC BIỆT: Chỉ trích xuất tối đa đúng ${options.maxQuestions} câu hỏi đầu tiên có trong tài liệu để tối ưu Token.`;
    }

    if (isText) {
      const rawText = await this.fileToText(file);
      contents.push({
        parts: [
          { text: `${basePrompt}\n\n--- NỘI DUNG TÀI LIỆU VĂN BẢN ---\n${rawText}` }
        ]
      });
    } else {
      // Tệp nhị phân: PDF, DOCX, Hình ảnh (Gửi trực tiếp Multimodal Base64 tới Google Gemini AI)
      let mimeType = "application/octet-stream";
      if (isPdf) mimeType = "application/pdf";
      else if (isImage) mimeType = fileType || "image/jpeg";
      else if (fileName.endsWith(".docx") || fileType.includes("word")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      else if (fileName.endsWith(".doc")) mimeType = "application/msword";

      const base64Data = await this.fileToBase64(file);
      contents.push({
        parts: [
          { text: basePrompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      });
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: this.SYSTEM_PROMPT }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    };

    let rawOutputText = "";

    if (callSource === "direct_client") {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(customKey)}`;
      const res = await fetch(directUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": customKey
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        const rawMsg = data.error?.message || `Lỗi Google API (${res.status})`;
        if (rawMsg.includes("is no longer available to new users")) {
          throw new Error(`Mô hình [${model}] đã bị Google đóng. Vui lòng chuyển sang [gemini-3.5-flash-lite] hoặc [gemini-3.6-flash] để hoạt động ổn định nhất.`);
        }
        if (rawMsg.includes("Quota exceeded") || rawMsg.includes("limit: 0")) {
          throw new Error(`Mô hình [${model}] không được cấp hạn mức trên gói miễn phí (Quota: 0). Vui lòng chuyển sang [gemini-3.5-flash-lite] hoặc [gemini-3.6-flash] để sử dụng miễn phí.`);
        }
        if (rawMsg.includes("is not found for API version")) {
          throw new Error(`Mô hình [${model}] không tồn tại trên Google API. Vui lòng chuyển sang [gemini-3.5-flash-lite] hoặc [gemini-3.6-flash].`);
        }
        throw new Error(rawMsg);
      }
      rawOutputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (typeof AIQuotaTracker !== "undefined" && data.usageMetadata) {
        AIQuotaTracker.recordRequest(data.usageMetadata, model);
      }
    } else {
      const headers = { "Content-Type": "application/json" };
      if (customKey) headers["X-User-Gemini-Key"] = customKey;
      if (typeof CloudflareClient !== "undefined" && CloudflareClient.getToken()) {
        headers["Authorization"] = `Bearer ${CloudflareClient.getToken()}`;
      }

      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ model: model, payload: payload })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Lỗi Máy Chủ AI Proxy (${res.status})`);
      }
      rawOutputText = data.text || "";
      if (typeof AIQuotaTracker !== "undefined" && data.usageMetadata) {
        AIQuotaTracker.recordRequest(data.usageMetadata, model);
      }
    }

    const durationMs = Math.round(performance.now() - startTime);

    let cleanedText = rawOutputText
      .replace(/^```(?:markdown|text)?\r?\n/i, "")
      .replace(/\r?\n```$/i, "")
      .trim();

    return {
      success: true,
      text: cleanedText,
      model: model,
      durationMs: durationMs,
      source: callSource
    };
  },

  /**
   * Bóc tách tuần tự theo từng đợt (Sequential Multi-Batch Pipeline)
   * Tự động gửi từng đợt 50-80 câu liên tiếp để vượt trần 8,192 Token của Google Gemini
   * @param {File|Blob} file
   * @param {Object} [options]
   * @param {Function} [onProgress] Callback tiến độ: ({ currentBatch, totalBatches, fromQuestion, toQuestion, percent, combinedText, durationMs }) => {}
   */
  async parseDocumentInBatches(file, options = {}, onProgress = null) {
    if (!file) throw new Error("Vui lòng chọn tệp đề thi hợp lệ!");

    const metrics = this.estimateFileMetrics(file);
    const startQ = Math.max(1, parseInt(options.fromQuestion, 10) || 1);
    const endQ = Math.max(startQ, parseInt(options.toQuestion, 10) || (options.totalQuestions || metrics.estimatedQuestions || 50));
    const batchSize = (parseInt(options.batchSize, 10) > 0) ? parseInt(options.batchSize, 10) : 50;

    const batchPlan = this.estimateBatchPlan(endQ, batchSize, startQ, endQ);
    const totalBatches = batchPlan.length;

    let combinedText = "";
    let totalDuration = 0;
    let totalQuestionsExtracted = 0;
    const model = options.model || this.getSelectedModel();

    for (let i = 0; i < totalBatches; i++) {
      const b = batchPlan[i];
      const batchNum = i + 1;

      if (typeof onProgress === "function") {
        onProgress({
          status: "processing",
          currentBatch: batchNum,
          totalBatches: totalBatches,
          fromQuestion: b.fromQ,
          toQuestion: b.toQ,
          percent: Math.round((i / totalBatches) * 100),
          combinedText: combinedText,
          message: `Đang gửi đợt ${batchNum}/${totalBatches}: Trích xuất câu ${b.fromQ} - ${b.toQ}...`
        });
      }

      const batchPrompt = `Hãy đọc tài liệu đầu vào và CHỈ trích xuất các câu hỏi từ Câu ${b.fromQ} đến Câu ${b.toQ} (nếu có trong tài liệu). Đảm bảo tuân thủ nghiêm ngặt cú pháp:\n- Mỗi câu bắt đầu bằng 'Câu [Số]: ...'\n- Mỗi phương án 1 dòng: A. ..., B. ..., C. ..., D. ...\n- Phương án đúng gắn thẻ ' >đúng' (hoặc ' >đúng:[Giải thích]').\n- Phương án sai để nguyên.\n- Tuyệt đối không bọc trong markdown code block, chỉ trả về văn bản đề thi.`;

      const result = await this.parseDocument(file, {
        ...options,
        model: model,
        customPrompt: batchPrompt
      });

      if (result && result.text) {
        const chunk = result.text.trim();
        if (chunk) {
          combinedText += (combinedText ? "\n\n" : "") + chunk;
          const qCountInChunk = (chunk.match(/(?:^|\n)\s*(?:câu|cau|question)\s*(?::\s*)?\[?\d+\]?[\:\.\-]/gi) || []).length;
          totalQuestionsExtracted += qCountInChunk;
        }
      }

      totalDuration += (result.durationMs || 0);

      if (typeof onProgress === "function") {
        onProgress({
          status: "batch_done",
          currentBatch: batchNum,
          totalBatches: totalBatches,
          fromQuestion: b.fromQ,
          toQuestion: b.toQ,
          percent: Math.round((batchNum / totalBatches) * 100),
          combinedText: combinedText,
          questionsExtracted: totalQuestionsExtracted,
          message: `Đã hoàn thành đợt ${batchNum}/${totalBatches} (${totalQuestionsExtracted} câu)`
        });
      }

      // Nếu đợt vừa rồi trả về rất ít (dưới 5 câu hoặc nội dung ngắn), có thể tài liệu đã hết câu hỏi
      if (batchNum > 1 && (!result.text || result.text.length < 80)) {
        break;
      }
    }

    return {
      success: true,
      text: combinedText,
      model: model,
      totalBatches: totalBatches,
      durationMs: totalDuration,
      questionCount: totalQuestionsExtracted
    };
  }
};

if (typeof window !== "undefined") window.GeminiAIParser = GeminiAIParser;
if (typeof global !== "undefined") global.GeminiAIParser = GeminiAIParser;
if (typeof module !== "undefined" && module.exports) module.exports = GeminiAIParser;
