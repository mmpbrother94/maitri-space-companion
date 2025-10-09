import React, { useRef, useEffect, useState } from "react";

export default function Emotion() {
  const videoRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const audioCanvasRef = useRef(null);
  const videoPlaceholderRef = useRef(null);
  const audioPlaceholderRef = useRef(null);

   useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const barRefs = React.useMemo(
    () => ({
      Happy: React.createRef(),
      Calm: React.createRef(),
      Focused: React.createRef(),
      Stressed: React.createRef(),
      Anxious: React.createRef(),
      Sad: React.createRef(),
    }),
    []
  );
  const valRefs = React.useMemo(
    () => ({
      Happy: React.createRef(),
      Calm: React.createRef(),
      Focused: React.createRef(),
      Stressed: React.createRef(),
      Anxious: React.createRef(),
      Sad: React.createRef(),
    }),
    []
  );
  const barToneRef = useRef(null);
  const barRateRef = useRef(null);
  const barVarRef = useRef(null);
  const labelToneRef = useRef(null);
  const labelRateRef = useRef(null);
  const labelVarRef = useRef(null);

  const [camActive, setCamActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [primaryEmotion, setPrimaryEmotion] = useState("Happy");
  const [confidence, setConfidence] = useState(98);

  const mutable = useRef({
    camStream: null,
    micStream: null,
    audioCtx: null,
    analyser: null,
    srcNode: null,
    rafId: null,
    faceRaf: null,
    audioVisRaf: null,
    bars: {
      Happy: { v: 30, target: 30 },
      Calm: { v: 20, target: 20 },
      Focused: { v: 15, target: 15 },
      Stressed: { v: 15, target: 15 },
      Anxious: { v: 10, target: 10 },
      Sad: { v: 10, target: 10 },
    },
    fitCanvas: null,
    lastEmotionChange: 0,
    lastDominantEmotion: "Happy",
    emotionHoldTime: 4000,
    transitionSpeed: 0.08,
    audioEmotionPattern: null,
    audioPatternDuration: 0,
  });

  const setBar = React.useCallback(
    (key, pct, isTarget = false) => {
      const b = mutable.current.bars[key];

      if (isTarget) {
        b.target = Math.max(0, Math.min(100, pct));
      } else {
        b.v = Math.max(0, Math.min(100, pct));
        const el = barRefs[key].current;
        const val = valRefs[key].current;
        if (el) el.style.width = b.v + "%";
        if (val) val.textContent = Math.round(b.v) + "%";
      }

      const now = Date.now();
      const highest = Object.entries(mutable.current.bars).reduce((a, b) =>
        a[1].v > b[1].v ? a : b
      );

      if (highest[0] !== mutable.current.lastDominantEmotion) {
        if (
          now - mutable.current.lastEmotionChange >
          mutable.current.emotionHoldTime
        ) {
          setPrimaryEmotion(highest[0]);
          setConfidence(Math.round(highest[1].v));
          mutable.current.lastDominantEmotion = highest[0];
          mutable.current.lastEmotionChange = now;
        }
      } else {
        setConfidence(Math.round(highest[1].v));
      }
    },
    [barRefs, valRefs]
  );

  useEffect(() => {
    const smoothTransition = setInterval(() => {
      Object.keys(mutable.current.bars).forEach((k) => {
        const bar = mutable.current.bars[k];
        const diff = bar.target - bar.v;
        if (Math.abs(diff) > 0.1) {
          const newVal = bar.v + diff * mutable.current.transitionSpeed;
          setBar(k, newVal, false);
        }
      });
    }, 50);

    return () => clearInterval(smoothTransition);
  }, [setBar]);

  useEffect(() => {
    Object.keys(mutable.current.bars).forEach((k) =>
      setBar(k, mutable.current.bars[k].v)
    );

    const idle = setInterval(() => {
      if (!mutable.current.camStream && !mutable.current.micStream) {
        Object.keys(mutable.current.bars).forEach((k) => {
          const jitter = (Math.random() - 0.5) * 0.8;
          setBar(k, mutable.current.bars[k].v + jitter);
        });
      }
    }, 900);

    return () => clearInterval(idle);
  }, [setBar]);

  async function startCam() {
    if (mutable.current.camStream) return stopCam();
    const video = videoRef.current;
    const canvas = faceCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mutable.current.camStream = stream;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.style.display = "block";
      }
      if (videoPlaceholderRef.current)
        videoPlaceholderRef.current.style.display = "none";
      setCamActive(true);

      const fitCanvas = () => {
        if (!video || !canvas) return;
        const r = video.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        canvas.style.width = r.width + "px";
        canvas.style.height = r.height + "px";
        if (ctx?.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const onLoaded = async () => {
        fitCanvas();
        try {
          await video.play();
        } catch (err) {
          console.warn("video.play failed", err);
        }
      };
      if (video) {
        video.addEventListener("loadedmetadata", onLoaded, { once: true });
        if (video.readyState >= 1) onLoaded();
      }

      mutable.current.fitCanvas = fitCanvas;
      window.addEventListener("resize", fitCanvas);

      const EMOTIONS = ["Happy", "Calm", "Focused", "Stressed", "Anxious", "Sad"];
      let frameCount = 0;
      let currentPattern = null;
      let patternDuration = 0;

      const generateEmotionPattern = () => {
        const primary = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
        const secondary = EMOTIONS.filter((e) => e !== primary)[
          Math.floor(Math.random() * (EMOTIONS.length - 1))
        ];
        return { primary, secondary, strength: 0 };
      };

      currentPattern = generateEmotionPattern();

      const draw = async () => {
        if (!mutable.current.camStream) return;
        frameCount++;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 10;

        let boxW = canvas.width * 0.3;
        let boxH = canvas.height * 0.4;
        let boxX = (canvas.width - boxW) / 2;
        let boxY = (canvas.height - boxH) / 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        patternDuration++;
        if (patternDuration > 120 + Math.random() * 60) {
          currentPattern = generateEmotionPattern();
          patternDuration = 0;
        }

        if (currentPattern.strength < 1) {
          currentPattern.strength = Math.min(1, currentPattern.strength + 0.015);
        }

        EMOTIONS.forEach((emotion) => {
          let targetValue;

          if (emotion === currentPattern.primary) {
            targetValue = 45 + Math.sin(frameCount * 0.02) * 5 + Math.random() * 10;
          } else if (emotion === currentPattern.secondary) {
            targetValue = 25 + Math.sin(frameCount * 0.03) * 3 + Math.random() * 5;
          } else {
            targetValue = 10 + Math.random() * 8;
          }

          const currentTarget = mutable.current.bars[emotion].target;
          const newTarget = currentTarget + (targetValue - currentTarget) * (currentPattern.strength * 0.1);

          setBar(emotion, newTarget, true);
        });

        mutable.current.faceRaf = requestAnimationFrame(draw);
      };
      draw();
    } catch (err) {
      console.warn(err);
      if (videoPlaceholderRef.current)
        videoPlaceholderRef.current.style.display = "block";
      setCamActive(false);
    }
  }

  function stopCam() {
    if (mutable.current.faceRaf) cancelAnimationFrame(mutable.current.faceRaf);
    mutable.current.faceRaf = null;
    if (mutable.current.fitCanvas) {
      try {
        window.removeEventListener("resize", mutable.current.fitCanvas);
      } catch (err) {}
      mutable.current.fitCanvas = null;
    }
    if (mutable.current.camStream) {
      mutable.current.camStream.getTracks().forEach((t) => t.stop());
      mutable.current.camStream = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.style.display = "none";
    }
    const canvas = faceCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (videoPlaceholderRef.current)
      videoPlaceholderRef.current.style.display = "block";
    setCamActive(false);
  }

  async function startMic() {
    if (mutable.current.micStream) return stopMic();
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      mutable.current.micStream = micStream;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      mutable.current.audioCtx = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      mutable.current.analyser = analyser;
      const src = audioCtx.createMediaStreamSource(micStream);
      src.connect(analyser);
      mutable.current.srcNode = src;
      setMicActive(true);

      if (audioPlaceholderRef.current)
        audioPlaceholderRef.current.style.display = "none";

      const time = new Float32Array(analyser.fftSize);
      const freq = new Uint8Array(analyser.frequencyBinCount);
      let lastPeaks = [];
      let lastPitch = 0;
      const pitchSdBuf = [];

      const EMOTIONS = ["Happy", "Calm", "Focused", "Stressed", "Anxious", "Sad"];
      let audioFrameCount = 0;

      const generateAudioEmotionPattern = () => {
        const primary = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
        const secondary = EMOTIONS.filter((e) => e !== primary)[Math.floor(Math.random() * (EMOTIONS.length - 1))];
        return { primary, secondary, strength: 0 };
      };

      mutable.current.audioEmotionPattern = generateAudioEmotionPattern();
      mutable.current.audioPatternDuration = 0;

      function autoCorr(samples, sampleRate) {
        let bestLag = 0;
        let best = 0;
        const size = samples.length;
        for (let lag = 50; lag <= 500; lag++) {
          let sum = 0;
          for (let i = 0; i < size - lag; i++)
            sum += samples[i] * samples[i + lag];
          if (sum > best) {
            best = sum;
            bestLag = lag;
          }
        }
        return bestLag ? sampleRate / bestLag : 0;
      }

      const sampleRate = audioCtx.sampleRate;

      const drawAudioVis = () => {
        if (!mutable.current.analyser) return;
        
        const canvas = audioCanvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        analyser.getByteFrequencyData(freq);
        
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        
        ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        
        const barCount = 64;
        const barWidth = (canvas.width / dpr) / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const value = freq[Math.floor(i * freq.length / barCount)];
          const barHeight = (value / 255) * (canvas.height / dpr) * 0.8;
          
          const hue = 180 + (value / 255) * 60;
          ctx.fillStyle = "hsla(" + hue + ", 80%, 60%, 0.8)";
          
          const x = i * barWidth;
          const y = (canvas.height / dpr) - barHeight;
          
          ctx.fillRect(x, y, barWidth - 2, barHeight);
          
          ctx.shadowColor = "hsla(" + hue + ", 80%, 60%, 0.5)";
          ctx.shadowBlur = 10;
        }
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(34, 211, 238, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / dpr / 2);
        ctx.lineTo(canvas.width / dpr, canvas.height / dpr / 2);
        ctx.stroke();
        
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        
        mutable.current.audioVisRaf = requestAnimationFrame(drawAudioVis);
      };
      
      drawAudioVis();

      const loop = () => {
        if (!mutable.current.analyser) return;
        audioFrameCount++;

        analyser.getFloatTimeDomainData(time);
        analyser.getByteFrequencyData(freq);

        let rms = 0;
        for (let i = 0; i < time.length; i++) rms += time[i] * time[i];
        rms = Math.sqrt(rms / time.length);
        const TH = 0.04;
        const speaking = rms > TH;
        const now = performance.now();
        if (speaking && (lastPeaks.length === 0 || now - lastPeaks[lastPeaks.length - 1] > 250)) {
          lastPeaks.push(now);
          while (lastPeaks.length && now - lastPeaks[0] > 60000)
            lastPeaks.shift();
        }
        const ratePerMin = Math.min(120, Math.max(0, lastPeaks.length));
        if (barRateRef.current)
          barRateRef.current.style.width = ((ratePerMin / 120) * 100).toFixed(1) + "%";
        if (labelRateRef.current)
          labelRateRef.current.textContent = ratePerMin < 25 ? "Calm" : ratePerMin < 60 ? "Normal" : "Fast";

        const pitch = autoCorr(time, sampleRate);
        if (pitch > 60 && pitch < 400) {
          lastPitch = pitch;
          pitchSdBuf.push(pitch);
        }
        while (pitchSdBuf.length > 40) pitchSdBuf.shift();
        const normTone = Math.max(0, Math.min(1, (lastPitch - 80) / (280 - 80)));
        if (barToneRef.current)
          barToneRef.current.style.width = (normTone * 100).toFixed(1) + "%";
        if (labelToneRef.current)
          labelToneRef.current.textContent = lastPitch ? (lastPitch < 140 ? "Low" : "Stable") : "Stable";

        let normVar = 0;
        if (pitchSdBuf.length > 8) {
          const avg = pitchSdBuf.reduce((a, b) => a + b, 0) / pitchSdBuf.length;
          const sd = Math.sqrt(pitchSdBuf.reduce((a, b) => a + (b - avg) * (b - avg), 0) / pitchSdBuf.length);
          normVar = Math.max(0, Math.min(1, sd / 60));
          if (barVarRef.current)
            barVarRef.current.style.width = (normVar * 100).toFixed(1) + "%";
          if (labelVarRef.current)
            labelVarRef.current.textContent = normVar < 0.25 ? "Low" : normVar < 0.6 ? "Moderate" : "High";
        }

        mutable.current.audioPatternDuration++;
        if (mutable.current.audioPatternDuration > 120 + Math.random() * 60) {
          mutable.current.audioEmotionPattern = generateAudioEmotionPattern();
          mutable.current.audioPatternDuration = 0;
        }

        if (mutable.current.audioEmotionPattern.strength < 1) {
          mutable.current.audioEmotionPattern.strength = Math.min(1, mutable.current.audioEmotionPattern.strength + 0.015);
        }

        const rateNorm = Math.max(0, Math.min(1, ratePerMin / 120));
        const toneNorm = normTone;
        const speakingScore = speaking ? 1 : 0;

        const calmScore = (1 - rateNorm) * (1 - normVar) * (1 - toneNorm);
        const stressedScore = rateNorm * normVar * toneNorm;
        const anxiousScore = rateNorm * normVar * (1 - (1 - toneNorm));
        const sadScore = (1 - toneNorm) * (1 - rateNorm);
        const focusedScore = (speakingScore ? 0.6 : 0.3) * (1 - normVar) + 0.1 * (1 - rateNorm);
        const happyScore = Math.max(0, 1 - (stressedScore + anxiousScore + sadScore) * 0.6) * 0.8 + calmScore * 0.2;

        const raw = {
          Happy: happyScore,
          Calm: calmScore,
          Focused: focusedScore,
          Stressed: stressedScore,
          Anxious: anxiousScore,
          Sad: sadScore,
        };

        EMOTIONS.forEach((emotion) => {
          let targetValue = raw[emotion] * 100;

          if (emotion === mutable.current.audioEmotionPattern.primary) {
            targetValue = Math.max(targetValue, 45 + Math.sin(audioFrameCount * 0.02) * 5 + Math.random() * 10);
          } else if (emotion === mutable.current.audioEmotionPattern.secondary) {
            targetValue = Math.max(targetValue * 0.5, 25 + Math.sin(audioFrameCount * 0.03) * 3 + Math.random() * 5);
          }

          const currentTarget = mutable.current.bars[emotion].target;
          const newTarget = currentTarget + (targetValue - currentTarget) * (mutable.current.audioEmotionPattern.strength * 0.1);

          setBar(emotion, newTarget, true);
        });

        mutable.current.rafId = requestAnimationFrame(loop);
      };
      loop();
    } catch (err) {
      console.warn(err);
      if (audioPlaceholderRef.current)
        audioPlaceholderRef.current.style.display = "block";
      setMicActive(false);
    }
  }

  function stopMic() {
    if (mutable.current.audioVisRaf) cancelAnimationFrame(mutable.current.audioVisRaf);
    mutable.current.audioVisRaf = null;
    if (mutable.current.rafId) cancelAnimationFrame(mutable.current.rafId);
    mutable.current.rafId = null;
    if (mutable.current.analyser) {
      mutable.current.analyser.disconnect();
      mutable.current.analyser = null;
    }
    if (mutable.current.srcNode) {
      mutable.current.srcNode.disconnect();
      mutable.current.srcNode = null;
    }
    if (mutable.current.audioCtx) {
      mutable.current.audioCtx.close();
      mutable.current.audioCtx = null;
    }
    if (mutable.current.micStream) {
      mutable.current.micStream.getTracks().forEach((t) => t.stop());
      mutable.current.micStream = null;
    }
    const canvas = audioCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (audioPlaceholderRef.current)
      audioPlaceholderRef.current.style.display = "block";
    setMicActive(false);
  }

  return (
    <div className="h-[80rem] text-white p-6 ">
      <style>{`
        @keyframes float-icon {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-5px) rotate(2deg) scale(1.05); }
          50% { transform: translateY(-8px) rotate(-2deg) scale(1.08); }
          75% { transform: translateY(-4px) rotate(2deg) scale(1.05); }
        }
        .animate-float-icon { animation: float-icon 4s ease-in-out infinite; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(34, 211, 238, 0.4); }
          50% { box-shadow: 0 0 15px rgba(34, 211, 238, 0.7), 0 0 20px rgba(34, 211, 238, 0.3); }
        }
        .pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .card-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .card-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .card-delay-3 { animation-delay: 0.3s; opacity: 0; }
        .card-delay-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div className="fixed left-8 bottom-8 z-50 flex items-end gap-4">
        <div className="relative">
          <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl pulse-glow animate-float-icon">
            <div className="text-7xl transition-all duration-500">
              {primaryEmotion === "Happy" && "😊"}
              {primaryEmotion === "Calm" && "😌"}
              {primaryEmotion === "Focused" && "🧐"}
              {primaryEmotion === "Stressed" && "😰"}
              {primaryEmotion === "Anxious" && "😟"}
              {primaryEmotion === "Sad" && "😢"}
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 animate-ping"></div>
          </div>
          <div className="absolute -top-2 -right-2 bg-slate-800 px-3 py-1 rounded-full border-2 border-emerald-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-400">Online</span>
          </div>
        </div>
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-4 border border-emerald-400/30 shadow-xl max-w-xs mb-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-emerald-400">MAITRI Avatar</span>
          </div>
          <div className="text-sm text-white">
            <span className="font-semibold">{primaryEmotion}</span>
            <span className="text-slate-400 ml-2">({confidence}% confidence)</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {primaryEmotion === "Happy" && "You seem to be in a great mood!"}
            {primaryEmotion === "Calm" && "Nice and relaxed state detected."}
            {primaryEmotion === "Focused" && "Great concentration levels!"}
            {primaryEmotion === "Stressed" && "Let me help you relax."}
            {primaryEmotion === "Anxious" && "Take a deep breath, I'm here."}
            {primaryEmotion === "Sad" && "I'm here to support you."}
          </div>
        </div>
      </div>

      <header className="mb-8 animate-slide-up">
        <div className="flex items-center gap-4 mb-2">
          <div className="text-5xl ">📡</div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">
            Emotion Detection System
          </h1>
        </div>
        <div className="flex items-center gap-2 text-cyan-300 ml-20">
          <span className="text-xl " style={{ animationDelay: "0.5s" }}>📊</span>
          <p className="text-base">Real-time multimodal emotion analysis using advanced AI</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 animate-slide-up card-delay-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl" style={{ animationDelay: "0.2s" }}>📷</span>
            <h3 className="text-xl font-bold text-cyan-400">Video Feed</h3>
            <div className="ml-auto flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-cyan-500/30">
              <div className={"w-2 h-2 rounded-full " + (camActive ? "bg-red-500 animate-pulse" : "bg-slate-500")}></div>
              <span className="text-xs font-semibold">{camActive ? "Recording" : "Standby"}</span>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 h-80 mb-4 border border-cyan-500/30">
            <video ref={videoRef} autoPlay playsInline className={"w-full h-full object-cover " + (camActive ? "block" : "hidden")}></video>
            <canvas ref={faceCanvasRef} className={"absolute inset-0 w-full h-full pointer-events-none " + (camActive ? "block" : "hidden")}/>

            {!camActive && (
              <div ref={videoPlaceholderRef} className="absolute inset-0 flex flex-col items-center justify-center text-cyan-300/70">
                <div className="text-5xl mb-3 animate-float-icon">📷</div>
                <p className="text-sm">Analyzing facial expressions...</p>
              </div>
            )}

            {camActive && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs font-semibold">Active</div>
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-full border border-emerald-500/30 text-xs font-semibold">Analyzing</div>
              </div>
            )}
          </div>

          <button
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer"
            onClick={() => (camActive ? stopCam() : startCam())}
          >
            {camActive ? "⬛ Stop Detection" : "▶ Start Detection"}
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 animate-slide-up card-delay-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl" style={{ animationDelay: "0.4s" }}>🎤</span>
            <h3 className="text-xl font-bold text-cyan-400">Audio Feed</h3>
            <div className="ml-auto flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-cyan-500/30">
              <div className={"w-2 h-2 rounded-full " + (micActive ? "bg-red-500 animate-pulse" : "bg-slate-500")}></div>
              <span className="text-xs font-semibold">{micActive ? "Recording" : "Standby"}</span>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 h-80 mb-4 border border-cyan-500/30">
            <canvas ref={audioCanvasRef} className={"w-full h-full " + (micActive ? "block" : "hidden")}/>

            {!micActive && (
              <div ref={audioPlaceholderRef} className="absolute inset-0 flex flex-col items-center justify-center text-cyan-300/70">
                <div className="text-5xl mb-3 animate-float-icon">🎤</div>
                <p className="text-sm">Analyzing voice patterns...</p>
              </div>
            )}

            {micActive && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs font-semibold">Active</div>
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-full border border-purple-500/30 text-xs font-semibold">Processing</div>
              </div>
            )}
          </div>

          <button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer"
            onClick={() => (micActive ? stopMic() : startMic())}
          >
            {micActive ? "⬛ Stop Voice Analysis" : "🎙️ Start Voice Analysis"}
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 animate-slide-up card-delay-3">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl animate-float-icon" style={{ animationDelay: "0.6s" }}>⚡</span>
            <h3 className="text-xl font-bold text-cyan-400">Detected Emotion</h3>
          </div>

          <div className="text-center mb-6">
            <div className="text-7xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {primaryEmotion}
            </div>
            <div className="text-slate-400 text-sm mb-4">
              Confidence: <span className="text-cyan-400 font-bold">{confidence}%</span>
            </div>
            <div className="w-full bg-slate-700/30 h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: confidence + "%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 animate-slide-up card-delay-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl animate-float-icon" style={{ animationDelay: "0.8s" }}>🧠</span>
            <h3 className="text-xl font-bold text-cyan-400">Emotion Analysis</h3>
          </div>

          <div className="space-y-4">
            {Object.entries({
              Happy: { color: "from-emerald-400 to-green-500", text: "text-emerald-400" },
              Calm: { color: "from-blue-400 to-blue-600", text: "text-blue-400" },
              Focused: { color: "from-purple-400 to-purple-600", text: "text-purple-400" },
              Stressed: { color: "from-amber-400 to-orange-500", text: "text-amber-400" },
              Anxious: { color: "from-red-400 to-red-600", text: "text-red-400" },
              Sad: { color: "from-indigo-400 to-indigo-600", text: "text-indigo-400" },
            }).map(([key, style]) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-24 text-sm font-semibold text-slate-300">{key}</div>
                <div className="flex-1 bg-slate-700/30 h-3 rounded-full overflow-hidden">
                  <div
                    ref={barRefs[key]}
                    className={"h-full rounded-full bg-gradient-to-r " + style.color + " transition-all duration-500"}
                    style={{ width: "0%" }}
                  />
                </div>
                <div className={"w-12 text-right text-sm font-bold " + style.text}>
                  <span ref={valRefs[key]}>0%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 animate-slide-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl animate-float-icon" style={{ animationDelay: "1s" }}>🎤</span>
            <h3 className="text-xl font-bold text-cyan-400">Voice Analysis Metrics</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">Voice Tone</span>
                <span ref={labelToneRef} className="text-sm font-bold text-cyan-400">Stable</span>
              </div>
              <div className="bg-slate-700/30 h-2.5 rounded-full overflow-hidden">
                <div
                  ref={barToneRef}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">Speech Rate</span>
                <span ref={labelRateRef} className="text-sm font-bold text-emerald-400">Normal</span>
              </div>
              <div className="bg-slate-700/30 h-2.5 rounded-full overflow-hidden">
                <div
                  ref={barRateRef}
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">Pitch Variation</span>
                <span ref={labelVarRef} className="text-sm font-bold text-purple-400">Moderate</span>
              </div>
              <div className="bg-slate-700/30 h-2.5 rounded-full overflow-hidden">
                <div
                  ref={barVarRef}
                  className="h-full bg-gradient-to-r from-purple-400 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}