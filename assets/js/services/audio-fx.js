/**
 * AUDIO FX SERVICE (WEB AUDIO API MULTI-SOUNDSCAPE SYNTHESIZER)
 * Module âm thanh toán học thuần túy — 0MB dung lượng, 100% Offline, không phụ thuộc file MP3 ngoài.
 * Cung cấp:
 * 1. 🌧️ Tiếng mưa rơi tập trung (Rain Sound)
 * 2. 🌊 Sóng biển dạt dào (Ocean Waves Generator)
 * 3. 🌲 Gió rừng êm dịu (Forest Breeze)
 * 4. ⏱️ Tiếng tích tắc đồng hồ Pomodoro (Mechanical Clock Tick)
 * 5. ⌨️ Âm thanh phím cơ 2 chế độ (Clicky Blue vs Cream Thock)
 * 6. 🔔 Chuông thiền Zen Chime & Tiếng chuông chúc mừng
 */

const AudioFXService = {
  ctx: null,

  // Trạng thái âm thanh môi trường
  isRainPlaying: false,
  isOceanPlaying: false,
  isWindPlaying: false,
  isTickingPlaying: false,

  // Trạng thái âm lượng
  rainVolume: 0.4,
  oceanVolume: 0.4,
  windVolume: 0.35,
  tickingVolume: 0.25,

  // Phím cơ
  isKeySoundEnabled: false,
  keySoundProfile: "clicky", // 'clicky' | 'thock'

  // Audio Nodes tham chiếu
  rainNodes: null,
  oceanNodes: null,
  windNodes: null,
  tickingInterval: null,

  init() {
    try {
      const saved = localStorage.getItem("dthu_audio_settings_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.isKeySoundEnabled = Boolean(parsed.isKeySoundEnabled);
        this.keySoundProfile = parsed.keySoundProfile || "clicky";
        if (typeof parsed.rainVolume === "number") this.rainVolume = parsed.rainVolume;
        if (typeof parsed.oceanVolume === "number") this.oceanVolume = parsed.oceanVolume;
        if (typeof parsed.windVolume === "number") this.windVolume = parsed.windVolume;
      }
    } catch (e) {}
  },

  getAudioContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  saveSettings() {
    try {
      localStorage.setItem("dthu_audio_settings_v2", JSON.stringify({
        isKeySoundEnabled: this.isKeySoundEnabled,
        keySoundProfile: this.keySoundProfile,
        rainVolume: this.rainVolume,
        oceanVolume: this.oceanVolume,
        windVolume: this.windVolume
      }));
    } catch (e) {}
  },

  // 🌧️ 1. TIẾNG MƯA TẬP TRUNG (Pink Noise Lowpass)
  toggleRain(forceState = null) {
    const next = forceState !== null ? forceState : !this.isRainPlaying;
    if (next) {
      this.startRain();
    } else {
      this.stopRain();
    }
    return this.isRainPlaying;
  },

  startRain() {
    if (this.isRainPlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.isRainPlaying = true;
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(950, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.01, this.rainVolume * 0.35), ctx.currentTime + 1.2);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(0);
      this.rainNodes = { source, filter, gain };
    } catch (err) {
      console.warn("Rain start error:", err);
      this.isRainPlaying = false;
    }
  },

  stopRain() {
    this.isRainPlaying = false; // Đồng bộ tức thì cờ trạng thái UI
    if (!this.rainNodes || !this.ctx) return;

    try {
      const { source, gain } = this.rainNodes;
      const ctx = this.ctx;
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      setTimeout(() => {
        try { source.stop(); } catch (e) {}
        source.disconnect();
        this.rainNodes = null;
      }, 450);
    } catch (e) {
      this.rainNodes = null;
    }
  },

  setRainVolume(val) {
    this.rainVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
    if (this.isRainPlaying && this.rainNodes && this.ctx) {
      this.rainNodes.gain.gain.setValueAtTime(Math.max(0.001, this.rainVolume * 0.35), this.ctx.currentTime);
    }
  },

  // 🌊 2. TIẾNG SÓNG BIỂN THƯ THÁI (LFO Modulated Pink Noise)
  toggleOcean(forceState = null) {
    const next = forceState !== null ? forceState : !this.isOceanPlaying;
    if (next) {
      this.startOcean();
    } else {
      this.stopOcean();
    }
    return this.isOceanPlaying;
  },

  startOcean() {
    if (this.isOceanPlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.isOceanPlaying = true;
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.2;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      // Filter dải thấp
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      // LFO tạo nhịp sóng 0.12Hz (khoảng 8 giây/chu kỳ sóng vỗ)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(250, ctx.currentTime);
      lfo.connect(filter.frequency);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.01, ctx.currentTime);
      mainGain.gain.exponentialRampToValueAtTime(Math.max(0.01, this.oceanVolume * 0.4), ctx.currentTime + 1.5);

      source.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(ctx.destination);

      source.start(0);
      lfo.start(0);

      this.oceanNodes = { source, lfo, filter, mainGain };
    } catch (e) {
      this.isOceanPlaying = false;
    }
  },

  stopOcean() {
    this.isOceanPlaying = false;
    if (!this.oceanNodes || !this.ctx) return;

    try {
      const { source, lfo, mainGain } = this.oceanNodes;
      const ctx = this.ctx;
      mainGain.gain.setValueAtTime(mainGain.gain.value, ctx.currentTime);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      setTimeout(() => {
        try { source.stop(); lfo.stop(); } catch (err) {}
        source.disconnect();
        this.oceanNodes = null;
      }, 450);
    } catch (e) {
      this.oceanNodes = null;
    }
  },

  setOceanVolume(val) {
    this.oceanVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
    if (this.isOceanPlaying && this.oceanNodes && this.ctx) {
      this.oceanNodes.mainGain.gain.setValueAtTime(Math.max(0.001, this.oceanVolume * 0.4), this.ctx.currentTime);
    }
  },

  // 🌲 3. TIẾNG GIÓ RỪNG ÊM DỊU (Forest Breeze)
  toggleWind(forceState = null) {
    const next = forceState !== null ? forceState : !this.isWindPlaying;
    if (next) {
      this.startWind();
    } else {
      this.stopWind();
    }
    return this.isWindPlaying;
  },

  startWind() {
    if (this.isWindPlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.isWindPlaying = true;
      const bufferSize = ctx.sampleRate * 2.5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      // Gió thổi ngắt quãng nhẹ nhàng
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      lfo.connect(filter.frequency);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.01, ctx.currentTime);
      mainGain.gain.exponentialRampToValueAtTime(Math.max(0.01, this.windVolume * 0.3), ctx.currentTime + 1.5);

      source.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(ctx.destination);

      source.start(0);
      lfo.start(0);

      this.windNodes = { source, lfo, filter, mainGain };
    } catch (e) {
      this.isWindPlaying = false;
    }
  },

  stopWind() {
    this.isWindPlaying = false;
    if (!this.windNodes || !this.ctx) return;

    try {
      const { source, lfo, mainGain } = this.windNodes;
      const ctx = this.ctx;
      mainGain.gain.setValueAtTime(mainGain.gain.value, ctx.currentTime);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      setTimeout(() => {
        try { source.stop(); lfo.stop(); } catch (err) {}
        source.disconnect();
        this.windNodes = null;
      }, 450);
    } catch (e) {
      this.windNodes = null;
    }
  },

  setWindVolume(val) {
    this.windVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
    if (this.isWindPlaying && this.windNodes && this.ctx) {
      this.windNodes.mainGain.gain.setValueAtTime(Math.max(0.001, this.windVolume * 0.3), this.ctx.currentTime);
    }
  },

  // ⏱️ 4. TIẾNG TÍCH TẮC POMODORO (Mechanical Clock Tick)
  toggleTicking(forceState = null) {
    const next = forceState !== null ? forceState : !this.isTickingPlaying;
    this.isTickingPlaying = next;
    if (this.isTickingPlaying) {
      if (this.tickingInterval) clearInterval(this.tickingInterval);
      this.playSingleTick();
      this.tickingInterval = setInterval(() => {
        if (this.isTickingPlaying) this.playSingleTick();
      }, 1000);
    } else {
      if (this.tickingInterval) {
        clearInterval(this.tickingInterval);
        this.tickingInterval = null;
      }
    }
    return this.isTickingPlaying;
  },

  playSingleTick() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

      gain.gain.setValueAtTime(this.tickingVolume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {}
  },

  // ⌨️ 5. TIẾNG PHÍM CƠ (Switch Profile: 'clicky' vs 'thock')
  playKeyClick() {
    if (!this.isKeySoundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (this.keySoundProfile === "thock") {
        // Âm Thock trầm ấm (Cream Switch)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(180 + Math.random() * 40, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        // Âm Clicky đanh giòn (Blue Switch)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(420 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.035);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    } catch (e) {}
  },

  // 🔔 6. TIẾNG CHUÔNG THIỀN POMODORO (Zen Singing Bowl)
  playBell() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [528, 1056, 1584];
      const gains = [0.25, 0.1, 0.04];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.2);
      });
    } catch (e) {}
  },

  // 🎉 7. TIẾNG CHÚC MỪNG HOÀN THÀNH
  playSuccess() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // Đô 5 - Mi 5 - Sol 5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.09;
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {}
  }
};

AudioFXService.init();
