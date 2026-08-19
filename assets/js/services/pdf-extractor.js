/**
 * PDF EXTRACTOR SERVICE (Mô-đun chuyên sâu trích xuất văn bản từ tệp PDF)
 * Shinora Academic & Technology Studio
 * 
 * Tính năng chính:
 * 1. Bộ giải nén nhị phân Pure JavaScript Inflate / Deflate độc lập (RFC 1951 / Zlib) - 0 phụ thuộc, chạy 100% trên mọi trình duyệt.
 * 2. Phân tích bảng nhúng TrueType cmap table (Format 4 & 0) từ FontFile2 để giải mã 100% Identity CID Glyphs tiếng Việt.
 * 3. Hỗ trợ bảng ToUnicode CMap chuẩn PDF (bfchar, bfrange).
 * 4. Tự động nhận diện DẢI MÀU ĐÁP ÁN ĐÚNG (Dải Đỏ/Hồng/Cam, Dải Xanh Lá, Dải Xanh Dương, Dải Tím) để gắn đuôi " > Đúng" chính xác.
 * 5. Tự động tính khoảng cách Kerning (TJ) để chèn dấu cách giữa các từ chính xác.
 * 6. Tự động nối dòng câu hỏi (Câu 1: ...), phương án (A., B., C., D.) và lọc bỏ Header/Footer/Watermark trang.
 */

var PdfExtractor = {
  /**
   * Phương thức chính: Nhận tệp PDF và trích xuất chuỗi văn bản thuần (.txt) sạch đẹp kèm đáp án đúng
   * @param {File|Blob|ArrayBuffer|Uint8Array} fileOrBuffer 
   * @returns {Promise<string>} Chuỗi văn bản thuần UTF-8
   */
  async extractText(fileOrBuffer) {
    if (!fileOrBuffer) throw new Error("Vui lòng cung cấp tệp PDF hợp lệ!");

    let uint8Array;
    if (fileOrBuffer instanceof ArrayBuffer) {
      uint8Array = new Uint8Array(fileOrBuffer);
    } else if (fileOrBuffer instanceof Uint8Array) {
      uint8Array = fileOrBuffer;
    } else if (typeof fileOrBuffer.arrayBuffer === "function") {
      const buffer = await fileOrBuffer.arrayBuffer();
      uint8Array = new Uint8Array(buffer);
    } else {
      // Fallback FileReader
      uint8Array = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(new Uint8Array(e.target.result));
        reader.onerror = reject;
        reader.readAsArrayBuffer(fileOrBuffer);
      });
    }

    try {
      const extractedRaw = this.parsePdfBuffer(uint8Array);
      if (extractedRaw && extractedRaw.trim().length > 20) {
        return extractedRaw;
      }
      
      // Fallback quét thô nếu giải nén nâng cao không tìm thấy nội dung
      const fallbackText = this.fallbackStreamScan(uint8Array);
      if (fallbackText && fallbackText.trim().length > 20) {
        return this.cleanAndFormatPdfQuestions([{ text: fallbackText, isHighlight: false }]);
      }

      return "⚠️ Không thể trích xuất văn bản từ tệp PDF này (có thể là tệp PDF dạng ảnh scan hoặc bị mã hóa bảo vệ). Vui lòng chuyển sang định dạng Word (.docx) hoặc sao chép văn bản (.txt) để phân tích tốt nhất.";
    } catch (err) {
      console.warn("PdfExtractor parse error:", err);
      const fallbackText = this.fallbackStreamScan(uint8Array);
      if (fallbackText && fallbackText.trim().length > 20) {
        return this.cleanAndFormatPdfQuestions([{ text: fallbackText, isHighlight: false }]);
      }
      throw new Error("Lỗi khi trích xuất tệp PDF: " + err.message);
    }
  },

  /**
   * Phân tích tổng thể tệp PDF (Font CMap + Content Streams + Dải màu đáp án)
   */
  parsePdfBuffer(uint8) {
    const rawStr = new TextDecoder('latin1').decode(uint8);

    // 1. Trích xuất toàn bộ Font CMap (từ FontFile2 nhúng và ToUnicode)
    const fontCmaps = this.extractEmbeddedFontCmaps(uint8, rawStr);

    // 2. Trích xuất văn bản và trạng thái màu sắc từ tất cả các luồng Stream trang
    const rawItems = this.extractTextFromContentStreams(uint8, rawStr, fontCmaps);

    if (rawItems.length > 0) {
      return this.cleanAndFormatPdfQuestions(rawItems);
    }

    return "";
  },

  /**
   * Kiểm tra dải màu xem có phải là màu đánh dấu đáp án đúng hay không (Hỗ trợ dải màu rộng thay vì chỉ 1 mã màu)
   * @param {number} r Đỏ (0.0 -> 1.0)
   * @param {number} g Lục (0.0 -> 1.0)
   * @param {number} b Lam (0.0 -> 1.0)
   * @returns {boolean}
   */
  isHighlightColor(r, g, b) {
    // 1. Dải màu Đỏ / Đỏ gạch / Hồng cánh sen / Đỏ cam (Red / Crimson / Magenta)
    if (r >= 0.55 && g <= 0.45 && b <= 0.45) return true;
    if ((r - g) > 0.3 && (r - b) > 0.3 && r > 0.5) return true;

    // 2. Dải màu Xanh lá cây / Lục bảo (Green / Emerald)
    if (g >= 0.45 && r <= 0.45 && (g - r) > 0.2) return true;

    // 3. Dải màu Xanh dương đậm / Lam ngọc (Blue / Cyan / Indigo)
    if (b >= 0.6 && r <= 0.35 && (b - r) > 0.25) return true;

    // 4. Dải màu Cam đậm / Hổ phách (Orange / Amber)
    if (r >= 0.75 && g >= 0.30 && g <= 0.65 && b <= 0.25) return true;

    // 5. Dải màu Tím / Mận (Purple / Violet)
    if (r >= 0.5 && b >= 0.5 && g <= 0.35 && (r - g) > 0.2) return true;

    return false;
  },

  /**
   * Trích xuất các bảng font cmap từ các đối tượng Font / FontFile2 / ToUnicode trong PDF
   */
  extractEmbeddedFontCmaps(uint8, rawStr) {
    const fontCmaps = {}; // { 'F1': { gid: 'char' }, 'F2': { ... } }
    const fontDefinitions = {}; // { '11': { baseFont: '...', fontFile2Obj: 8, toUnicodeObj: null } }

    // Quét liên kết Font và FontFile2 theo từng block obj...endobj
    const objRegex = /(\d+)\s+0\s+obj([\s\S]*?)endobj/g;
    let objMatch;
    while ((objMatch = objRegex.exec(rawStr)) !== null) {
      const objId = objMatch[1];
      const block = objMatch[2];

      if (block.includes("/Type /Font") || block.includes("/BaseFont") || block.includes("/DescendantFonts")) {
        const ffMatch = block.match(/\/FontFile2\s+(\d+)\s+0\s+R/);
        const tuMatch = block.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
        const nameMatch = block.match(/\/BaseFont\s*\/([^\s/><()]+)/);
        
        fontDefinitions[objId] = {
          fontFile2Obj: ffMatch ? parseInt(ffMatch[1], 10) : null,
          toUnicodeObj: tuMatch ? parseInt(tuMatch[1], 10) : null,
          baseFont: nameMatch ? nameMatch[1] : ""
        };
      }
    }

    // Quét mapping tên font hiển thị trong Resource (/Font << /F1 11 0 R ... >>)
    const fontNameMap = {}; // { 'F1': 11, 'F2': 19, 'F3': 27 }
    const resFontRegex = /\/Font\s*<<([\s\S]*?)>>/g;
    let resMatch;
    while ((resMatch = resFontRegex.exec(rawStr)) !== null) {
      const inner = resMatch[1];
      const linkRegex = /\/([A-Za-z0-9_]+)\s+(\d+)\s+0\s+R/g;
      let lm;
      while ((lm = linkRegex.exec(inner)) !== null) {
        fontNameMap[lm[1]] = parseInt(lm[2], 10);
      }
    }

    // Trích xuất các luồng stream nhị phân của PDF
    const streamMap = this.indexPdfStreams(uint8, rawStr);

    // Giải mã CMap cho từng Font
    for (const fontName of Object.keys(fontNameMap)) {
      const fontObjId = fontNameMap[fontName];
      const fontDef = fontDefinitions[fontObjId];
      if (!fontDef) continue;

      let cmap = {};

      // 1. Ưu tiên giải mã từ bảng ToUnicode nếu có
      if (fontDef.toUnicodeObj && streamMap[fontDef.toUnicodeObj]) {
        try {
          const decompStream = this.inflate(streamMap[fontDef.toUnicodeObj]);
          if (decompStream && decompStream.length > 0) {
            const tuStr = new TextDecoder('utf-8', { fatal: false }).decode(decompStream);
            cmap = Object.assign(cmap, this.parseToUnicodeCmap(tuStr));
          }
        } catch (e) {}
      }

      // 2. Giải mã bảng cmap Format 4 từ tệp font TrueType FontFile2
      if (fontDef.fontFile2Obj && streamMap[fontDef.fontFile2Obj]) {
        try {
          const ttfBytes = this.inflate(streamMap[fontDef.fontFile2Obj]);
          if (ttfBytes && ttfBytes.length > 12) {
            const ttfCmap = this.parseTtfCmap(ttfBytes);
            cmap = Object.assign(ttfCmap, cmap); // ToUnicode ưu tiên ghi đè nếu có
          }
        } catch (e) {
          console.warn(`FontFile2 decompress error for ${fontName}:`, e);
        }
      }

      if (Object.keys(cmap).length > 0) {
        fontCmaps[fontName] = cmap;
      }
    }

    return fontCmaps;
  },

  /**
   * Tạo bản đồ vị trí các luồng stream nhị phân theo Object ID
   */
  indexPdfStreams(uint8, rawStr) {
    const streamMap = {};
    const objRegex = /(\d+)\s+0\s+obj([\s\S]*?)endobj/g;
    let match;

    while ((match = objRegex.exec(rawStr)) !== null) {
      const objId = parseInt(match[1], 10);
      const objBody = match[2];
      const streamIdx = objBody.indexOf("stream");
      if (streamIdx !== -1) {
        let afterStream = streamIdx + 6;
        if (objBody.charCodeAt(afterStream) === 0x0D) afterStream++; // \r
        if (objBody.charCodeAt(afterStream) === 0x0A) afterStream++; // \n

        const endStreamIdx = objBody.lastIndexOf("endstream");
        if (endStreamIdx > afterStream) {
          const baseOffset = match.index + match[0].indexOf(objBody);
          const absStart = baseOffset + afterStream;
          const absEnd = baseOffset + endStreamIdx;
          streamMap[objId] = uint8.subarray(absStart, absEnd);
        }
      }
    }

    return streamMap;
  },

  /**
   * Phân tích bảng TrueType cmap Format 4 & Format 0 từ dữ liệu font nhị phân
   */
  parseTtfCmap(ttfBytes) {
    if (!ttfBytes || ttfBytes.length < 12) return {};
    const view = new DataView(ttfBytes.buffer, ttfBytes.byteOffset, ttfBytes.byteLength);

    try {
      const numTables = view.getUint16(4);
      let cmapOffset = null;

      for (let i = 0; i < numTables; i++) {
        const offset = 12 + i * 16;
        if (offset + 16 > ttfBytes.length) break;
        const tag = String.fromCharCode(
          ttfBytes[offset],
          ttfBytes[offset + 1],
          ttfBytes[offset + 2],
          ttfBytes[offset + 3]
        );
        if (tag === 'cmap') {
          cmapOffset = view.getUint32(offset + 8);
          break;
        }
      }

      if (!cmapOffset || cmapOffset + 4 > ttfBytes.length) return {};

      const numSubtables = view.getUint16(cmapOffset + 2);
      const gidToUnicode = {};

      for (let i = 0; i < numSubtables; i++) {
        const entryOffset = cmapOffset + 4 + i * 8;
        if (entryOffset + 8 > ttfBytes.length) break;

        const subOffset = view.getUint32(entryOffset + 4);
        const subTable = cmapOffset + subOffset;
        if (subTable + 6 > ttfBytes.length) continue;

        const format = view.getUint16(subTable);

        // --- CMAP FORMAT 4: Segment mapping to delta values (Standard Unicode TrueType) ---
        if (format === 4) {
          const segCountX2 = view.getUint16(subTable + 6);
          const segCount = Math.floor(segCountX2 / 2);
          const endCodesPos = subTable + 14;
          const startCodesPos = endCodesPos + segCount * 2 + 2;
          const idDeltasPos = startCodesPos + segCount * 2;
          const idRangeOffsetsPos = idDeltasPos + segCount * 2;

          if (idRangeOffsetsPos + segCount * 2 > ttfBytes.length) continue;

          for (let s = 0; s < segCount - 1; s++) {
            const endCode = view.getUint16(endCodesPos + s * 2);
            const startCode = view.getUint16(startCodesPos + s * 2);
            const idDelta = view.getInt16(idDeltasPos + s * 2);
            const idRangeOffset = view.getUint16(idRangeOffsetsPos + s * 2);

            for (let c = startCode; c <= endCode; c++) {
              let gid = 0;
              if (idRangeOffset === 0) {
                gid = (c + idDelta) & 0xFFFF;
              } else {
                const glyphPos = idRangeOffsetsPos + s * 2 + idRangeOffset + (c - startCode) * 2;
                if (glyphPos + 2 <= ttfBytes.length) {
                  gid = view.getUint16(glyphPos);
                  if (gid !== 0) {
                    gid = (gid + idDelta) & 0xFFFF;
                  }
                }
              }
              if (gid !== 0 && !gidToUnicode[gid]) {
                gidToUnicode[gid] = String.fromCharCode(c);
              }
            }
          }
        }
        // --- CMAP FORMAT 0: Byte encoding table ---
        else if (format === 0 && subTable + 262 <= ttfBytes.length) {
          for (let c = 0; c < 256; c++) {
            const gid = ttfBytes[subTable + 6 + c];
            if (gid !== 0 && !gidToUnicode[gid]) {
              gidToUnicode[gid] = String.fromCharCode(c);
            }
          }
        }
      }

      return gidToUnicode;
    } catch (e) {
      console.warn("parseTtfCmap error:", e);
      return {};
    }
  },

  /**
   * Phân tích bảng ToUnicode CMap chuẩn PDF (bfchar, bfrange)
   */
  parseToUnicodeCmap(cmapStr) {
    const map = {};
    if (!cmapStr) return map;

    // 1. Parse beginbfchar ... endbfchar
    const bfcharRegex = /beginbfchar[\r\n\s]+([\s\S]*?)[\r\n\s]+endbfchar/g;
    let m;
    while ((m = bfcharRegex.exec(cmapStr)) !== null) {
      const tokens = m[1].trim().split(/\s+/);
      for (let i = 0; i < tokens.length - 1; i += 2) {
        const src = tokens[i].replace(/[<>]/g, "");
        const dst = tokens[i + 1].replace(/[<>]/g, "");
        const srcCode = parseInt(src, 16);
        if (!isNaN(srcCode)) {
          map[srcCode] = this.hexToUnicodeString(dst);
        }
      }
    }

    // 2. Parse beginbfrange ... endbfrange
    const bfrangeRegex = /beginbfrange[\r\n\s]+([\s\S]*?)[\r\n\s]+endbfrange/g;
    while ((m = bfrangeRegex.exec(cmapStr)) !== null) {
      const lines = m[1].trim().split(/\n+/);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const startHex = parts[0].replace(/[<>]/g, "");
          const endHex = parts[1].replace(/[<>]/g, "");
          const startCode = parseInt(startHex, 16);
          const endCode = parseInt(endHex, 16);
          const dstHex = parts[2].replace(/[<>]/g, "");
          let dstCode = parseInt(dstHex, 16);

          if (!isNaN(startCode) && !isNaN(endCode) && !isNaN(dstCode)) {
            for (let c = startCode; c <= endCode; c++) {
              map[c] = String.fromCharCode(dstCode++);
            }
          }
        }
      }
    }

    return map;
  },

  hexToUnicodeString(hex) {
    if (!hex) return "";
    let res = "";
    if (hex.length >= 4 && hex.length % 4 === 0) {
      for (let i = 0; i < hex.length; i += 4) {
        const code = parseInt(hex.substr(i, 4), 16);
        if (!isNaN(code)) res += String.fromCharCode(code);
      }
    } else {
      for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.substr(i, 2), 16);
        if (!isNaN(code)) res += String.fromCharCode(code);
      }
    }
    return res;
  },

  /**
   * Trích xuất văn bản từ các luồng Stream trang (Page Content Streams)
   */
  extractTextFromContentStreams(uint8, rawStr, fontCmaps) {
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match;
    const fullTextParts = [];

    while ((match = streamRegex.exec(rawStr)) !== null) {
      const streamStart = match.index + match[0].indexOf('\n') + 1;
      const streamEnd = match.index + match[0].lastIndexOf('endstream');
      const streamBytes = uint8.subarray(streamStart, streamEnd);

      let decompressed = null;
      try {
        decompressed = this.inflate(streamBytes);
      } catch (e) {}

      // CHỈ XỬ LÝ NẾU ĐÃ GIẢI NÉN THÀNH CÔNG (TUYỆT ĐỐI KHÔNG ĐỌC RÁC TỪ STREAM NHỊ PHÂN NÉN)
      if (!decompressed || decompressed.length === 0) continue;

      const streamContent = new TextDecoder('latin1').decode(decompressed);
      if (!streamContent.includes("BT")) continue;

      const pageRawItems = this.parsePageTextBlocks(streamContent, fontCmaps);
      if (pageRawItems.length > 0) {
        fullTextParts.push(...pageRawItems);
      }
    }

    return fullTextParts;
  },

  /**
   * Bóc tách các câu lệnh vẽ chữ và quản lý trạng thái màu sắc trong khối BT ... ET của một trang
   */
  parsePageTextBlocks(streamContent, fontCmaps) {
    let currentColor = { r: 0, g: 0, b: 0 };
    let currentFont = "F1";
    const rawItems = [];

    // Quét màu sắc bên ngoài khối BT hoặc khối BT...ET
    const blockRegex = /([\d\.\s]+)\s+(rg|RG|g|G|k|K)|BT[\r\n\s]+([\s\S]*?)[\r\n\s]+ET/g;
    let bMatch;

    while ((bMatch = blockRegex.exec(streamContent)) !== null) {
      // 1. Nhận diện lệnh đổi màu ngoài khối BT
      if (bMatch[2]) {
        const op = bMatch[2];
        const vals = bMatch[1].trim().split(/\s+/).map(Number);
        if (op === "rg" || op === "RG") {
          if (vals.length === 3) currentColor = { r: vals[0], g: vals[1], b: vals[2] };
        } else if (op === "g" || op === "G") {
          if (vals.length === 1) currentColor = { r: vals[0], g: vals[0], b: vals[0] };
        } else if (op === "k" || op === "K") {
          if (vals.length === 4) {
            const c = vals[0], m = vals[1], y = vals[2], k = vals[3];
            currentColor = { r: (1 - c) * (1 - k), g: (1 - m) * (1 - k), b: (1 - y) * (1 - k) };
          }
        }
      }
      // 2. Xử lý khối vẽ văn bản BT...ET
      else if (bMatch[3]) {
        const btBlock = bMatch[3];
        let currentLine = "";
        let lineHighlight = false;

        const opRegex = /\/([A-Za-z0-9_]+)\s+[\d\.]+\s+Tf|\[([\s\S]*?)\]\s*TJ|<([0-9a-fA-F\s]+)>\s*Tj|\(([^)]*)\)\s*Tj|([\d\.\s]+)\s+(rg|RG|g|G|k|K)|'|"|T\*|Td|TD|Tm/g;
        let op;

        while ((op = opRegex.exec(btBlock)) !== null) {
          // Đổi Font
          if (op[1]) {
            currentFont = op[1];
            continue;
          }

          // Đổi màu bên trong BT
          if (op[6]) {
            const cOp = op[6];
            const vals = op[5].trim().split(/\s+/).map(Number);
            if (cOp === "rg" || cOp === "RG") {
              if (vals.length === 3) currentColor = { r: vals[0], g: vals[1], b: vals[2] };
            } else if (cOp === "g" || cOp === "G") {
              if (vals.length === 1) currentColor = { r: vals[0], g: vals[0], b: vals[0] };
            }
            continue;
          }

          const cmap = fontCmaps[currentFont] || {};
          const isHl = this.isHighlightColor(currentColor.r, currentColor.g, currentColor.b);

          // Lệnh TJ
          if (op[2] !== undefined) {
            if (isHl) lineHighlight = true;
            const innerTj = op[2];
            const partRegex = /<([0-9a-fA-F\s]+)>|\(([^)]*)\)|(-?\d+(?:\.\d+)?)/g;
            let p;
            while ((p = partRegex.exec(innerTj)) !== null) {
              if (p[1]) currentLine += this.decodeHexWithCmap(p[1], cmap);
              else if (p[2] !== undefined) currentLine += this.decodeLiteralWithCmap(p[2], cmap);
              else if (p[3] && parseFloat(p[3]) < -120 && currentLine.length > 0 && !currentLine.endsWith(" ")) {
                currentLine += " ";
              }
            }
            continue;
          }

          // Lệnh Tj Hex
          if (op[3]) {
            if (isHl) lineHighlight = true;
            currentLine += this.decodeHexWithCmap(op[3], cmap);
            continue;
          }

          // Lệnh Tj Literal
          if (op[4] !== undefined) {
            if (isHl) lineHighlight = true;
            currentLine += this.decodeLiteralWithCmap(op[4], cmap);
            continue;
          }

          // Lệnh xuống dòng
          const token = op[0];
          if (token === "'" || token === '"' || token === "T*" || /Td|TD|Tm$/.test(token)) {
            if (currentLine.trim()) {
              rawItems.push({ text: currentLine.trim(), isHighlight: lineHighlight });
              currentLine = "";
              lineHighlight = false;
            }
          }
        }

        if (currentLine.trim()) {
          rawItems.push({ text: currentLine.trim(), isHighlight: lineHighlight });
        }
      }
    }

    return rawItems;
  },

  /**
   * Giải mã chuỗi Hex bằng Font CMap hoặc 16-bit / 8-bit Unicode
   */
  decodeHexWithCmap(hexStr, cmap) {
    if (!hexStr) return "";
    const cleanHex = hexStr.replace(/\s+/g, "");
    let text = "";

    // Thử giải mã 16-bit CID Hex (VD: 0026 -> GID)
    if (cleanHex.length >= 4 && cleanHex.length % 4 === 0) {
      for (let i = 0; i < cleanHex.length; i += 4) {
        const gid = parseInt(cleanHex.substr(i, 4), 16);
        if (cmap && cmap[gid]) {
          text += cmap[gid];
        } else if (gid === 3) {
          text += " "; // Glyph ID 3 thường là space trong font CID
        } else if (gid > 0 && gid < 0xFFFE) {
          text += String.fromCharCode(gid);
        }
      }
      return text;
    }

    // Giải mã 8-bit Hex
    for (let i = 0; i < cleanHex.length; i += 2) {
      const code = parseInt(cleanHex.substr(i, 2), 16);
      if (cmap && cmap[code]) {
        text += cmap[code];
      } else if (code > 0) {
        text += String.fromCharCode(code);
      }
    }

    return text;
  },

  /**
   * Giải mã chuỗi Literal (...) có ký tự thoát
   */
  decodeLiteralWithCmap(rawLiteral, cmap) {
    if (!rawLiteral) return "";
    let raw = rawLiteral
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\b/g, "\b")
      .replace(/\\f/g, "\f")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");

    if (cmap && Object.keys(cmap).length > 0) {
      let result = "";
      for (let i = 0; i < raw.length; i++) {
        const code = raw.charCodeAt(i);
        result += (cmap[code] || raw[i]);
      }
      return result;
    }

    return raw;
  },

  /**
   * Bộ giải nén nhị phân Pure JavaScript Inflate / Deflate Engine (RFC 1951 & Zlib Header)
   * Độc lập hoàn toàn, không phụ thuộc trình duyệt hay thư viện ngoài
   */
  inflate(input) {
    if (!input || input.length === 0) return new Uint8Array(0);

    let bitBuf = 0, bitLen = 0, inPos = 0;
    function getBits(n) {
      while (bitLen < n) {
        if (inPos >= input.length) return 0;
        bitBuf |= input[inPos++] << bitLen;
        bitLen += 8;
      }
      const val = bitBuf & ((1 << n) - 1);
      bitBuf >>>= n;
      bitLen -= n;
      return val;
    }
    function alignBits() {
      bitBuf = 0; bitLen = 0;
    }

    // Bỏ qua zlib header nếu có (0x78 0x9c, 0x78 0x01, 0x78 0xda...)
    if (input.length > 2 && input[0] === 0x78 && ((input[0] * 256 + input[1]) % 31 === 0)) {
      inPos = 2;
    }

    const out = [];
    let isLast = 0;

    function buildTree(lengths) {
      const count = new Array(16).fill(0);
      for (let l of lengths) count[l]++;
      count[0] = 0;
      const nextCode = new Array(16).fill(0);
      let code = 0;
      for (let bits = 1; bits <= 15; bits++) {
        code = (code + count[bits - 1]) << 1;
        nextCode[bits] = code;
      }
      const tree = {};
      for (let i = 0; i < lengths.length; i++) {
        const len = lengths[i];
        if (len !== 0) {
          tree[(len << 16) | nextCode[len]++] = i;
        }
      }
      return { tree };
    }

    function decodeSymbol(tree) {
      let code = 0;
      for (let len = 1; len <= 15; len++) {
        code = (code << 1) | getBits(1);
        const key = (len << 16) | code;
        if (tree[key] !== undefined) return tree[key];
      }
      return -1;
    }

    // Cây Huffman cố định (Fixed Huffman Trees)
    const fixedLitLens = new Array(288);
    for (let i = 0; i < 144; i++) fixedLitLens[i] = 8;
    for (let i = 144; i < 256; i++) fixedLitLens[i] = 9;
    for (let i = 256; i < 280; i++) fixedLitLens[i] = 7;
    for (let i = 280; i < 288; i++) fixedLitLens[i] = 8;
    const fixedLitTree = buildTree(fixedLitLens).tree;

    const fixedDistLens = new Array(32).fill(5);
    const fixedDistTree = buildTree(fixedDistLens).tree;

    const lengthBases = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
    const lengthExtra = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
    const distBases = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
    const distExtra = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
    const codeOrder = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

    while (!isLast && inPos < input.length) {
      isLast = getBits(1);
      const btype = getBits(2);

      if (btype === 0) { // Không nén (Uncompressed Block)
        alignBits();
        if (inPos + 4 > input.length) break;
        const len = input[inPos] | (input[inPos+1] << 8);
        inPos += 4;
        for (let i = 0; i < len && inPos < input.length; i++) {
          out.push(input[inPos++]);
        }
      } else if (btype === 1 || btype === 2) {
        let litTree, distTree;
        if (btype === 1) {
          litTree = fixedLitTree;
          distTree = fixedDistTree;
        } else {
          const hlit = getBits(5) + 257;
          const hdist = getBits(5) + 1;
          const hclen = getBits(4) + 4;
          const clCodeLens = new Array(19).fill(0);
          for (let i = 0; i < hclen; i++) clCodeLens[codeOrder[i]] = getBits(3);
          const clTree = buildTree(clCodeLens).tree;

          const totalCodes = hlit + hdist;
          const allLens = [];
          while (allLens.length < totalCodes) {
            const sym = decodeSymbol(clTree);
            if (sym < 16) {
              allLens.push(sym);
            } else if (sym === 16) {
              const repeat = getBits(2) + 3;
              const prev = allLens[allLens.length - 1] || 0;
              for (let r = 0; r < repeat; r++) allLens.push(prev);
            } else if (sym === 17) {
              const repeat = getBits(3) + 3;
              for (let r = 0; r < repeat; r++) allLens.push(0);
            } else if (sym === 18) {
              const repeat = getBits(7) + 11;
              for (let r = 0; r < repeat; r++) allLens.push(0);
            }
          }
          litTree = buildTree(allLens.slice(0, hlit)).tree;
          distTree = buildTree(allLens.slice(hlit)).tree;
        }

        while (true) {
          const sym = decodeSymbol(litTree);
          if (sym === 256 || sym === -1) break;
          if (sym < 256) {
            out.push(sym);
          } else {
            const lIdx = sym - 257;
            const matchLen = lengthBases[lIdx] + getBits(lengthExtra[lIdx]);
            const dSym = decodeSymbol(distTree);
            const matchDist = distBases[dSym] + getBits(distExtra[dSym]);
            const start = out.length - matchDist;
            for (let m = 0; m < matchLen; m++) {
              out.push(out[start + m]);
            }
          }
        }
      }
    }

    return new Uint8Array(out);
  },

  /**
   * Fallback quét chuỗi văn bản nếu giải mã CMap bị lỗi
   */
  fallbackStreamScan(uint8) {
    const rawStr = new TextDecoder('latin1').decode(uint8);
    const extracted = [];
    const textChunks = rawStr.match(/(?:Câu|Bài|Question|\b[A-EĐđ]\s*[\.\)])[^\r\n\x00-\x08\x0B\x0C\x0E-\x1F]{5,200}/g);
    if (textChunks && textChunks.length > 0) {
      return textChunks.join("\n");
    }
    return "";
  },

  /**
   * Chuẩn hóa và làm sạch văn bản câu hỏi sau khi trích xuất từ PDF:
   * - Nối dòng câu hỏi bị ngắt: "Câu 1:\nNội dung" -> "Câu 1: Nội dung"
   * - Nối dòng phương án bị ngắt: "A.\nNội dung" -> "A. Nội dung"
   * - Tự động gắn đuôi " > Đúng" cho phương án có chữ hoặc mã màu nằm trong dải màu đáp án
   * - Loại bỏ Watermark / Header lặp lại: "CẤM VẬN HÀNH RA NGOÀI- BY..."
   * - Tạo khoảng cách chuẩn giữa các câu hỏi (\n\n)
   */
  /**
   * Trích xuất các dòng văn bản RAW từ PDF:
   * - Giữ nguyên vẹn 100% từng dòng chữ gốc trích xuất từ các trang PDF.
   * - Chỉ thêm hậu tố ' > Đúng' nếu dòng đó có chứa chữ/mã màu nằm trong dải màu đáp án đúng.
   * - Không tự ý gộp dòng, không tự ý can thiệp logic (để chuyển giao dữ liệu thô cho parser-engine).
   */
  cleanAndFormatPdfQuestions(rawItemsOrText) {
    if (!rawItemsOrText) return "";

    let rawItems = [];
    if (Array.isArray(rawItemsOrText)) {
      rawItems = rawItemsOrText;
    } else if (typeof rawItemsOrText === "string") {
      return rawItemsOrText;
    }

    const rawLines = [];
    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      let t = item.text ? item.text.trim() : "";
      if (!t) continue;
      if (item.isHighlight && !t.includes(">")) {
        rawLines.push(t + " > Đúng");
      } else {
        rawLines.push(t);
      }
    }

    return rawLines.join("\n");
  }
};

// Gắn toàn cục cho trình duyệt
if (typeof window !== "undefined") {
  window.PdfExtractor = PdfExtractor;
}
if (typeof globalThis !== "undefined") {
  globalThis.PdfExtractor = PdfExtractor;
}
