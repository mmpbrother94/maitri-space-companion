import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CommandBar from "../components/CommandBar";
import SuggestionCard from "../features/detection/SuggestionCard";
import { useEmotionBridge } from "../features/detection/useEmotionBridge";

// Remove backend dependency - simulate locally
const DEFAULT_EMOTIONS = [
  "Happy",
  "Calm",
  "Focused",
  "Stressed",
  "Anxious",
  "Sad",
];
const CLIP_DURATION_MS = 2000;

const EMOTION_VISUALS = {
  Happy: {
    color: "from-emerald-400 to-green-500",
    text: "text-emerald-400",
    icon: "😊",
  },
  Calm: {
    color: "from-cyan-400 to-sky-500",
    text: "text-cyan-300",
    icon: "😌",
  },
  Focused: {
    color: "from-blue-400 to-indigo-500",
    text: "text-blue-300",
    icon: "🧐",
  },
  Stressed: {
    color: "from-amber-400 to-orange-500",
    text: "text-amber-300",
    icon: "😰",
  },
  Anxious: {
    color: "from-purple-400 to-violet-500",
    text: "text-purple-300",
    icon: "😟",
  },
  Sad: {
    color: "from-slate-400 to-slate-600",
    text: "text-slate-300",
    icon: "😢",
  },
  Neutral: {
    color: "from-slate-400 to-slate-500",
    text: "text-slate-200",
    icon: "😐",
  },
};

const INSIGHT_SUPPORT_COPY = {
  Happy:
    "Energy levels are high. Want me to capture this in your mood log or celebrate with your favourite track?",
  Calm: "Breathing and tone look settled. I can stand guard while you stay in this flow.",
  Focused:
    "You are locked in. I can block interruptions or schedule a precision break when you are ready.",
  Stressed:
    "Tension cues detected. Ready for a grounding breath or a quick handoff to mission support?",
  Anxious:
    "Alertness is up. We can slow down with a breathing pattern or reach out to support together.",
  Sad: "I feel the weight with you. Want a compassion prompt or to leave a note for the support crew?",
  Neutral:
    "Signals look steady. I will keep watch and surface any changes as they happen.",
};

const InsightCard = ({ insight, active }) => (
  <div className="bg-slate-900/60 border border-cyan-500/20 rounded-3xl p-5 hover:border-cyan-500/40 transition-all duration-300 h-full flex flex-col">
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-lg font-semibold text-cyan-300">{insight.title}</h3>
      <span
        className={`ml-auto w-2 h-2 rounded-full ${
          active ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
        }`}
      />
    </div>
    <div className="mb-3">
      <p className="text-sm text-slate-400 uppercase tracking-wide">
        Detected Emotion
      </p>
      <p className="text-2xl font-bold text-white">
        {insight.emotion ?? "Standby"}
      </p>
      {insight.confidence != null && (
        <p className="text-xs text-slate-400 mt-1">
          Confidence ~{insight.confidence}%
        </p>
      )}
    </div>
    <p className="text-sm text-slate-300 leading-relaxed flex-1">
      {insight.message}
    </p>
  </div>
);

const EmotionBars = ({ title, active, bars }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
        <div className="ml-auto flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs font-semibold">
          <div
            className={`w-2 h-2 rounded-full ${
              active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
            }`}
          />
          <span>{active ? "Live" : "Standby"}</span>
        </div>
      </div>
      <div className="space-y-4">
        {DEFAULT_EMOTIONS.map((label) => {
          const styles = EMOTION_VISUALS[label] ?? {
            color: "from-slate-500 to-slate-600",
            text: "text-slate-200",
          };
          const percent = bars[label] || 0;
          return (
            <div key={label} className="flex items-center gap-4">
              <div className="w-24 text-sm font-semibold text-slate-300">
                {label}
              </div>
              <div className="flex-1 bg-slate-700/30 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${styles.color} transition-all duration-300`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div
                className={`w-12 text-right text-sm font-bold ${styles.text}`}
              >
                {percent}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function EmotionRobotBadge({ size = 72, animated = true, tilt = false }) {
  const dimension =
    typeof size === "number" ? size : Number.parseInt(size, 10) || 72;
  const glowClass = animated ? "animate-pulse" : "";
  const tiltClass = tilt ? "animate-[tilt_3s_ease-in-out_infinite]" : "";
  return (
    <div
      className={`relative flex items-center justify-center ${glowClass} ${tiltClass}`}
      style={{ width: dimension, height: dimension }}
    >
      <style>{`
        @keyframes tilt {
          0%, 100% { transform: rotate(-6deg) translateY(0); }
          50% { transform: rotate(6deg) translateY(-4px); }
        }
      `}</style>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="emotion-bot-shell"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ff8c5a" />
            <stop offset="100%" stopColor="#ff3f64" />
          </linearGradient>
          <linearGradient
            id="emotion-bot-glow"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
          </linearGradient>
        </defs>
        <ellipse
          cx="60"
          cy="60"
          rx="54"
          ry="46"
          fill="url(#emotion-bot-shell)"
          stroke="#ffcf78"
          strokeWidth="2"
        />
        <ellipse cx="22" cy="60" rx="12" ry="16" fill="#ffe066" />
        <ellipse cx="98" cy="60" rx="12" ry="16" fill="#ffe066" />
        <ellipse cx="60" cy="18" rx="10" ry="8" fill="#3b82f6" />
        <rect x="28" y="36" width="64" height="48" rx="22" fill="#0a0a14" />
        <path
          d="M42 64 C48 76, 72 76, 78 64"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="46" cy="52" r="6" fill="#ffffff" />
        <circle cx="74" cy="52" r="6" fill="#ffffff" />
        <ellipse
          cx="60"
          cy="36"
          rx="28"
          ry="26"
          fill="url(#emotion-bot-glow)"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}

function MaitriRobotOverlay({ active }) {
  return (
    <div className="pointer-events-none absolute -top-16 right-8 hidden md:block">
      <EmotionRobotBadge size={80} tilt={!active} animated />
    </div>
  );
}

const ToastStack = ({ items }) => {
  if (!items.length) return null;
  return (
    <div className="fixed top-6 right-6 z-50 space-y-3">
      {items.map((toast) => (
        <div
          key={toast.id}
          className="bg-slate-900/90 border border-red-500/40 text-red-200 px-4 py-3 rounded-2xl shadow-xl backdrop-blur"
        >
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

const buildInsight = (emotion, confidence, active) => {
  const title = "Combined Read";
  if (!emotion || emotion === "Standby") {
    return {
      title,
      emotion: active ? "Processing" : "Standby",
      confidence: null,
      message: active
        ? "Gathering more cues. Keep streaming for a confident read."
        : "Awaiting signal. Activate the stream to receive live insights.",
    };
  }

  const message = `${title} suggests ${emotion.toLowerCase()}. ${
    INSIGHT_SUPPORT_COPY[emotion] ??
    "I'm ready with interventions whenever you need them."
  }`;

  return {
    title,
    emotion,
    confidence,
    message,
  };
};

export default function Emotion() {
  const videoRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const audioCanvasRef = useRef(null);
  const [camActive, setCamActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [faceBars, setFaceBars] = useState({});
  const [voiceBars, setVoiceBars] = useState({});
  const [fusedBars, setFusedBars] = useState({});

  // Avatar state
  const [primaryEmotion, setPrimaryEmotion] = useState("Standby");
  const [confidence, setConfidence] = useState(null);

  // Emotion hold logic
  const mutable = useRef({
    lastEmotionChange: 0,
    lastDominantEmotion: "Standby",
    emotionHoldTime: 4000, // 4 seconds minimum
    camStream: null,
    micStream: null,
    audioCtx: null,
    analyser: null,
    srcNode: null,
    faceRaf: null,
    audioVisRaf: null,
    rafId: null,
  });

  const { suggestion } = useEmotionBridge();

  const pushToast = useCallback((message) => {
    setToasts((items) => [
      ...items,
      { id: `${Date.now()}-${Math.random()}`, message },
    ]);
  }, []);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = window.setTimeout(() => {
      setToasts((items) => items.slice(1));
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Generate random emotion bars
  const generateEmotionBars = useCallback(() => {
    const bars = {};
    let total = 0;

    // Generate 5 emotions with random values
    const emotions = [...DEFAULT_EMOTIONS];
    for (let i = 0; i < 5; i++) {
      const value = Math.floor(Math.random() * 30) + 5;
      bars[emotions[i]] = value;
      total += value;
    }

    // Ensure Happy is always present
    if (!bars["Happy"]) {
      bars["Happy"] = Math.floor(Math.random() * 20) + 10;
      total += bars["Happy"];
    }

    // Normalize to 100%
    Object.keys(bars).forEach((key) => {
      bars[key] = Math.round((bars[key] / total) * 100);
    });

    return bars;
  }, []);

  // Update emotion state with 4-second hold
  const updateEmotionState = useCallback((newBars) => {
    if (!newBars || Object.keys(newBars).length === 0) return;

    // Find dominant emotion
    const dominantEmotion = Object.entries(newBars).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];
    const newConfidence = newBars[dominantEmotion];

    const now = Date.now();
    const shouldChange =
      dominantEmotion !== mutable.current.lastDominantEmotion &&
      now - mutable.current.lastEmotionChange > mutable.current.emotionHoldTime;

    if (shouldChange) {
      setPrimaryEmotion(dominantEmotion);
      setConfidence(newConfidence);
      mutable.current.lastDominantEmotion = dominantEmotion;
      mutable.current.lastEmotionChange = now;
    } else if (dominantEmotion === mutable.current.lastDominantEmotion) {
      setConfidence(newConfidence);
    }
  }, []);

  // Camera simulation
  const startCam = useCallback(async () => {
    if (mutable.current.camStream) return stopCam();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      mutable.current.camStream = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.style.display = "block";
        videoRef.current.play().catch(() => {});
      }
      setCamActive(true);

      // Simulate face analysis
      const faceInterval = setInterval(() => {
        if (!mutable.current.camStream) {
          clearInterval(faceInterval);
          return;
        }

        const newBars = generateEmotionBars();
        setFaceBars(newBars);
        setFusedBars(newBars); // For simplicity, use face bars as fused
        updateEmotionState(newBars);
      }, 2000);

      mutable.current.faceRaf = faceInterval;
    } catch (error) {
      pushToast("Unable to access webcam. Check permissions.");
      stopCam();
    }
  }, [generateEmotionBars, pushToast, updateEmotionState]);

  const stopCam = useCallback(() => {
    if (mutable.current.faceRaf) {
      clearInterval(mutable.current.faceRaf);
      mutable.current.faceRaf = null;
    }

    if (mutable.current.camStream) {
      mutable.current.camStream.getTracks().forEach((track) => track.stop());
      mutable.current.camStream = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.style.display = "none";
    }

    setCamActive(false);
    setFaceBars({});
  }, []);

  // Microphone simulation
  const startMic = useCallback(async () => {
    if (mutable.current.micStream) return stopMic();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      mutable.current.micStream = stream;
      setMicActive(true);

      // Setup audio visualization
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      mutable.current.audioCtx = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      mutable.current.analyser = analyser;
      const src = audioCtx.createMediaStreamSource(stream);
      src.connect(analyser);
      mutable.current.srcNode = src;

      // Audio visualization
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

        const freq = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freq);

        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        const barCount = 64;
        const barWidth = canvas.width / dpr / barCount;
        for (let i = 0; i < barCount; i++) {
          const value = freq[Math.floor((i * freq.length) / barCount)];
          const barHeight = (value / 255) * (canvas.height / dpr) * 0.8;
          const hue = 180 + (value / 255) * 60;
          ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
          const x = i * barWidth;
          const y = canvas.height / dpr - barHeight;
          ctx.fillRect(x, y, barWidth - 2, barHeight);
          ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
          ctx.shadowBlur = 10;
        }

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(34, 211, 238, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        mutable.current.audioVisRaf = requestAnimationFrame(drawAudioVis);
      };

      drawAudioVis();

      // Simulate voice analysis
      const voiceInterval = setInterval(() => {
        if (!mutable.current.micStream) {
          clearInterval(voiceInterval);
          return;
        }

        const newBars = generateEmotionBars();
        setVoiceBars(newBars);
        if (Object.keys(fusedBars).length === 0) {
          setFusedBars(newBars);
          updateEmotionState(newBars);
        }
      }, 2500);

      mutable.current.rafId = voiceInterval;
    } catch (error) {
      pushToast("Unable to access microphone.");
      stopMic();
    }
  }, [generateEmotionBars, pushToast, updateEmotionState, fusedBars]);

  const stopMic = useCallback(() => {
    if (mutable.current.audioVisRaf) {
      cancelAnimationFrame(mutable.current.audioVisRaf);
      mutable.current.audioVisRaf = null;
    }

    if (mutable.current.rafId) {
      clearInterval(mutable.current.rafId);
      mutable.current.rafId = null;
    }

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
      mutable.current.micStream.getTracks().forEach((track) => track.stop());
      mutable.current.micStream = null;
    }

    setMicActive(false);
    setVoiceBars({});
  }, []);

  useEffect(() => {
    return () => {
      stopCam();
      stopMic();
    };
  }, [stopCam, stopMic]);

  // Build insights
  const faceInsight = useMemo(
    () =>
      buildInsight(
        Object.keys(faceBars).length > 0
          ? Object.entries(faceBars).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
          : null,
        Object.keys(faceBars).length > 0
          ? Math.max(...Object.values(faceBars))
          : null,
        camActive
      ),
    [faceBars, camActive]
  );

  const voiceInsight = useMemo(
    () =>
      buildInsight(
        Object.keys(voiceBars).length > 0
          ? Object.entries(voiceBars).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
          : null,
        Object.keys(voiceBars).length > 0
          ? Math.max(...Object.values(voiceBars))
          : null,
        micActive
      ),
    [voiceBars, micActive]
  );

  const fusedInsight = useMemo(
    () =>
      buildInsight(
        primaryEmotion !== "Standby" ? primaryEmotion : null,
        confidence,
        camActive || micActive
      ),
    [primaryEmotion, confidence, camActive, micActive]
  );

  // Avatar styles
  const summaryStyles =
    EMOTION_VISUALS[primaryEmotion] ?? EMOTION_VISUALS["Neutral"];

  return (
    <div className="emotion-theme relative min-h-screen overflow-hidden bg-gradient-to-br from-[#170425] via-[#12002f] to-[#03010e] pb-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.18),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.15),transparent_70%)] blur-3xl" />

      <style>
        {`
          .emotion-theme .text-cyan-400,
          .emotion-theme .text-cyan-300,
          .emotion-theme .text-cyan-200 {
            color: #f5b5ff !important;
          }
          .emotion-theme .border-cyan-500\\/20,
          .emotion-theme .border-cyan-500\\/30,
          .emotion-theme .border-cyan-500\\/40 {
            border-color: rgba(236, 72, 153, 0.35) !important;
          }
          .emotion-theme .bg-slate-900\\/70,
          .emotion-theme .bg-slate-900\\/60,
          .emotion-theme .bg-slate-900\\/50,
          .emotion-theme .bg-slate-900\\/40,
          .emotion-theme .bg-slate-900\\/30 {
            background-color: rgba(38, 6, 61, 0.6) !important;
          }
          .emotion-theme .bg-gradient-to-br.from-slate-800.to-slate-900,
          .emotion-theme .bg-gradient-to-r.from-slate-900\\/80.to-slate-900\\/40 {
            background-image: linear-gradient(135deg, rgba(88,34,135,0.75), rgba(28,6,52,0.85)) !important;
          }
          .emotion-theme .bg-gradient-to-r.from-cyan-500.to-blue-500 {
            background-image: linear-gradient(90deg, #f472b6, #a855f7) !important;
          }
          .emotion-theme .text-cyan-400 {
            color: #f9a8d4 !important;
          }
          .emotion-theme .text-cyan-300 {
            color: #e0e7ff !important;
          }
          .emotion-theme .bg-gradient-to-r.from-red-600.to-orange-600 {
            background-image: linear-gradient(90deg, #fb7185, #f97316) !important;
          }
          /* Avatar animations */
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
          .animate-pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        `}
      </style>

      <ToastStack items={toasts} />

      {/* Avatar */}
      <div className="fixed left-8 bottom-8 z-50 flex items-end gap-4 pointer-events-none">
        <div className="relative">
          <div
            className={`relative w-32 h-32 bg-gradient-to-br ${summaryStyles.color} rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow animate-float-icon`}
          >
            <div className="text-7xl drop-shadow-[0_6px_12px_rgba(15,23,42,0.75)]">
              {summaryStyles.icon}
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
            <span className="text-sm font-bold text-emerald-400">
              MAITRI Avatar
            </span>
          </div>
          <div className="text-sm text-white">
            <span className="font-semibold">{primaryEmotion}</span>
            {confidence !== null && (
              <span className="text-slate-400 ml-2">
                ({confidence}% confidence)
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {INSIGHT_SUPPORT_COPY[primaryEmotion] ||
              "Start detection to receive live emotional insights."}
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col px-6 pt-16 lg:px-10">
        <CommandBar />
        {suggestion ? (
          <div className="mb-12 animate-slide-up">
            <SuggestionCard
              emotion={suggestion.emotion}
              confidence={suggestion.confidence}
              suggestion={suggestion.data}
              onStart={() => pushToast(`Starting: ${suggestion.data.title}`)}
            />
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Video Feed */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 pb-20 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-cyan-400">Video Feed</h3>
              <div className="ml-auto flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs font-semibold">
                <div
                  className={`w-2 h-2 rounded-full ${
                    camActive ? "bg-red-500 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <span>{camActive ? "Recording" : "Standby"}</span>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 h-80 mb-4  border border-cyan-500/30">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  camActive ? "block" : "hidden"
                }`}
              />
              <canvas
                ref={faceCanvasRef}
                className={`absolute inset-0 w-full h-full pointer-events-none ${
                  camActive ? "block" : "hidden"
                }`}
              />
              {!camActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-300/70">
                  <p className="text-lg font-semibold">Camera standby</p>
                  <p className="text-sm">Start detection to begin analysis.</p>
                </div>
              )}
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-red-500 via-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_45px_rgba(249,115,22,0.35)] transition hover:brightness-110 cursor-pointer"
              onClick={startCam}
              aria-label={camActive ? "Stop Detection" : "Start Detection"}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{"\u{1F3A5}"}</span>
                {camActive ? "Stop Detection" : "Start Detection"}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg">
                {"\u{25B6}"}
              </span>
            </button>
          </div>

          {/* Audio Feed */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 pb-16 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-cyan-400">Audio Feed</h3>
              <div className="ml-auto flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs font-semibold">
                <div
                  className={`w-2 h-2 rounded-full ${
                    micActive ? "bg-red-500 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <span>{micActive ? "Recording" : "Standby"}</span>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 h-80 mb-4 border border-cyan-500/30">
              <canvas
                ref={audioCanvasRef}
                className={`w-full h-full ${micActive ? "block" : "hidden"}`}
              />
              {!micActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-300/70">
                  <p className="text-lg font-semibold">Microphone standby</p>
                  <p className="text-sm">
                    Enable microphone to begin analysis.
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_45px_rgba(56,189,248,0.35)] transition hover:brightness-110 ${
                micActive
                  ? "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"
                  : "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500"
              }`}
              onClick={startMic}
              aria-label={
                micActive ? "Stop Voice Analysis" : "Start Voice Analysis"
              }
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{"\u{1F399}"}</span>
                {micActive ? "Stop Voice Analysis" : "Start Voice Analysis"}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-2xl">
                {"\u{1F916}"}
              </span>
            </button>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <InsightCard insight={faceInsight} active={camActive} />
          <InsightCard insight={voiceInsight} active={micActive} />
          <InsightCard insight={fusedInsight} active={camActive || micActive} />
        </div>

        {/* Emotion Bars */}
        <div className="grid lg:grid-cols-2 gap-6">
          <EmotionBars
            title="Facial Analysis"
            active={camActive}
            bars={faceBars}
          />
          <EmotionBars
            title="Voice Analysis"
            active={micActive}
            bars={voiceBars}
          />
        </div>

        {/* System Status */}
        <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-cyan-500/20">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">
            System Status
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="font-semibold text-white mb-1">Detection Status</p>
              <p>
                {camActive || micActive
                  ? "Live emotion detection active"
                  : "All systems idle. Start detection to begin analysis."}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="font-semibold text-white mb-1">Face Analysis</p>
              <p>
                {camActive
                  ? "Camera active - analyzing facial expressions"
                  : "Camera inactive"}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="font-semibold text-white mb-1">Voice Analysis</p>
              <p>
                {micActive
                  ? "Microphone active - analyzing vocal patterns"
                  : "Microphone inactive"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
