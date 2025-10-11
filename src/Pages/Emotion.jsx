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

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
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
    icon: "\u{1F60A}",
  },
  Calm: {
    color: "from-cyan-400 to-sky-500",
    text: "text-cyan-300",
    icon: "\u{1F60C}",
  },
  Focused: {
    color: "from-blue-400 to-indigo-500",
    text: "text-blue-300",
    icon: "\u{1F9E0}",
  },
  Stressed: {
    color: "from-amber-400 to-orange-500",
    text: "text-amber-300",
    icon: "\u{1F625}",
  },
  Anxious: {
    color: "from-purple-400 to-violet-500",
    text: "text-purple-300",
    icon: "\u{1F630}",
  },
  Sad: {
    color: "from-slate-400 to-slate-600",
    text: "text-slate-300",
    icon: "\u{1F622}",
  },
  Neutral: {
    color: "from-slate-400 to-slate-500",
    text: "text-slate-200",
    icon: "\u{1F610}",
  },
  Angry: {
    color: "from-red-400 to-rose-500",
    text: "text-rose-300",
    icon: "\u{1F620}",
  },
  Fearful: {
    color: "from-amber-500 to-yellow-600",
    text: "text-amber-200",
    icon: "\u{1F628}",
  },
  Disgust: {
    color: "from-lime-500 to-green-600",
    text: "text-lime-200",
    icon: "\u{1F922}",
  },
  Surprised: {
    color: "from-pink-400 to-pink-600",
    text: "text-pink-200",
    icon: "\u{1F62E}",
  },
};

const INSIGHT_SOURCE_LABELS = {
  face: "Facial Analysis",
  voice: "Vocal Analysis",
  fused: "Combined Read",
};

const INSIGHT_SUPPORT_COPY = {
  Happy:
    "Energy levels are high. Want me to capture this in your mood log or celebrate with your favourite track?",
  Calm:
    "Breathing and tone look settled. I can stand guard while you stay in this flow.",
  Focused:
    "You are locked in. I can block interruptions or schedule a precision break when you are ready.",
  Stressed:
    "Tension cues detected. Ready for a grounding breath or a quick handoff to mission support?",
  Anxious:
    "Alertness is up. We can slow down with a breathing pattern or reach out to support together.",
  Sad:
    "I feel the weight with you. Want a compassion prompt or to leave a note for the support crew?",
  Neutral:
    "Signals look steady. I will keep watch and surface any changes as they happen.",
  Angry:
    "There is fire in your tone. Vent with me or we can move through a quick reset routine.",
  Fearful:
    "There is concern in your voice. Let us steady the breath and outline the next safe step.",
  Disgust:
    "Something is off. Share it and I will record the details for follow-up.",
  Surprised:
    "A spike in surprise just registered. Need me to capture what happened for the log?",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const ensureEmotionOrder = (probs, fallback) => {
  if (!probs) return fallback;
  return Object.keys(probs);
};

const safeParseJson = (text, fallback = {}) => {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (error) {
    return fallback;
  }
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const encodeWav = (samples, sampleRate) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1, offset += 2) {
    const x = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }

  return buffer;
};

const resampleTo = (channelData, sourceRate, targetRate) => {
  if (sourceRate === targetRate) return new Float32Array(channelData);

  const ratio = sourceRate / targetRate;
  const length = Math.max(1, Math.round(channelData.length / ratio));
  const result = new Float32Array(length);

  for (let i = 0; i < length; i += 1) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;
    const nextIndex =
      index + 1 < channelData.length ? index + 1 : channelData.length - 1;
    const sample =
      channelData[index] * (1 - fraction) + channelData[nextIndex] * fraction;
    result[i] = sample;
  }

  return result;
};

const adjustDuration = (data, sampleRate, minSeconds, maxSeconds) => {
  const min = Math.round(sampleRate * minSeconds);
  const max = Math.round(sampleRate * maxSeconds);
  if (data.length > max) {
    return data.subarray(0, max);
  }
  if (data.length < min) {
    const padded = new Float32Array(min);
    padded.set(data);
    return padded;
  }
  return data;
};

const averageChannels = (audioBuffer) => {
  if (audioBuffer.numberOfChannels === 1) {
    return new Float32Array(audioBuffer.getChannelData(0));
  }

  const { length } = audioBuffer;
  const temp = new Float32Array(length);
  for (let c = 0; c < audioBuffer.numberOfChannels; c += 1) {
    const channel = audioBuffer.getChannelData(c);
    for (let i = 0; i < length; i += 1) {
      temp[i] += channel[i];
    }
  }
  for (let i = 0; i < length; i += 1) {
    temp[i] /= audioBuffer.numberOfChannels;
  }
  return temp;
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

const EmotionBars = ({
  title,
  latency,
  active,
  result,
  fallbackLabels,
}) => {
  const labels = ensureEmotionOrder(result?.probs, fallbackLabels);
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
        {latency != null && (
          <span className="text-xs font-semibold text-slate-300 bg-slate-900/80 px-2 py-1 rounded-full border border-slate-600/60">
            ~{Math.round(latency)} ms
          </span>
        )}
      </div>

      <div className="space-y-4">
        {labels.map((label) => {
          const styles = EMOTION_VISUALS[label] ?? {
            color: "from-slate-500 to-slate-600",
            text: "text-slate-200",
          };
          const probability = result?.probs?.[label] ?? 0;
          const percent = Math.round(probability * 100);
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

function EmotionAvatarBadge({ summary, styles, active }) {
  if (!summary) return null;
  const confidenceText =
    summary.confidence != null
      ? `${summary.emotion} (${summary.confidence}% confidence)`
      : summary.emotion ?? "Standby";
  const helperText =
    summary.confidence != null
      ? "I'm here to support you."
      : "Start detection to receive live updates.";

  return (
    <div className="pointer-events-none absolute -bottom-16 left-6 flex items-center gap-3">
      <div
        className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${styles.color} shadow-[0_18px_45px_rgba(59,130,246,0.25)]`}
      >
        <span className="text-4xl drop-shadow-[0_6px_12px_rgba(15,23,42,0.75)]">
          {styles.icon ?? "\u{1F642}"}
        </span>
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/60 bg-emerald-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
          {active ? "Online" : "Standby"}
        </span>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-[0_12px_30px_rgba(59,130,246,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-200/80">
          MAITRI Avatar
        </p>
        <p className="mt-1 text-sm font-semibold text-white">{confidenceText}</p>
        <p className="text-xs text-slate-300 mt-1">{helperText}</p>
      </div>
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
          <linearGradient id="emotion-bot-shell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff8c5a" />
            <stop offset="100%" stopColor="#ff3f64" />
          </linearGradient>
          <linearGradient id="emotion-bot-glow" x1="0%" y1="0%" x2="100%" y2="100%">
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

const convertBlobToWav = async (blob) => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("Web Audio API is not supported in this browser.");
  }
  const audioContext = new AudioCtx();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await new Promise((resolve, reject) => {
      audioContext.decodeAudioData(
        arrayBuffer.slice(0),
        (decoded) => resolve(decoded),
        (err) => reject(err),
      );
    });

    const mono = averageChannels(audioBuffer);
    const resampled = resampleTo(mono, audioBuffer.sampleRate, 16000);
    const durationAdjusted = adjustDuration(resampled, 16000, 1, 3);
    const wav = encodeWav(durationAdjusted, 16000);
    return new Blob([wav], { type: "audio/wav" });
  } finally {
    await audioContext.close();
  }
};

const buildInsight = (source, payload, active) => {
  const title = INSIGHT_SOURCE_LABELS[source] ?? "Analysis";
  const hasPrediction = Boolean(payload?.top);
  if (!hasPrediction) {
    return {
      title,
      emotion: active ? "Processing" : "Standby",
      confidence: null,
      message: active
        ? "Gathering more cues. Keep streaming for a confident read."
        : "Awaiting signal. Activate the stream to receive live insights.",
    };
  }

  const rawConfidence =
    payload.confidence ?? payload.probs?.[payload.top] ?? null;
  const confidence =
    rawConfidence != null ? Math.round(rawConfidence * 100) : null;
  const baseMessage =
    payload.message ??
    `${title} suggests ${payload.top.toLowerCase()}. ${
      INSIGHT_SUPPORT_COPY[payload.top] ??
      "I'm ready with interventions whenever you need them."
    }`;
  const message = active
    ? baseMessage
    : `${baseMessage} This is the most recent capture while the stream is idle.`;

  return {
    title,
    emotion: payload.top,
    confidence,
    message,
  };
};

export default function Emotion() {
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const faceStreamRef = useRef(null);
  const audioStreamRef = useRef(null);

  const faceLoopRef = useRef({
    running: false,
    inFlight: false,
    timer: null,
    lastDelay: 600,
    lastErrorAt: 0,
  });

  const voiceLoopRef = useRef({
    running: false,
    inFlight: false,
    timer: null,
    stopTimer: null,
    lastDelay: 1000,
    recorder: null,
    lastErrorAt: 0,
  });

  const fuseStateRef = useRef({
    faceTs: null,
    voiceTs: null,
    inFlight: false,
    lastErrorAt: 0,
  });

  const [camActive, setCamActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micPermission, setMicPermission] = useState("prompt");
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthOk, setHealthOk] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [faceResult, setFaceResult] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  const [fusedResult, setFusedResult] = useState(null);
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

  const checkHealth = useCallback(async () => {
    setCheckingHealth(true);
    try {
      const response = await fetch(`${API_BASE}/api/health`, {
        method: "GET",
      });
      if (!response.ok) {
        setHealthOk(false);
        return false;
      }
      const payload = await response.json();
      const ok = Boolean(payload?.ok);
      setHealthOk(ok);
      return ok;
    } catch (error) {
      setHealthOk(false);
      return false;
    } finally {
      setCheckingHealth(false);
    }
  }, []);

  const ensureHealth = useCallback(async () => {
    const ok = await checkHealth();
    if (!ok) {
      pushToast("Backend unavailable. Start the API server and retry.");
    }
    return ok;
  }, [checkHealth, pushToast]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleSuggestionStart = useCallback(
    (item) => {
      console.log(`Starting session: ${item.code}`);
      pushToast(`Starting: ${item.title}`);
    },
    [pushToast],
  );

  useEffect(() => {
    let active = true;
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "microphone" })
        .then((status) => {
          if (!active) return;
          setMicPermission(status.state);
          status.onchange = () => {
            setMicPermission(status.state);
          };
        })
        .catch(() => {
          if (active) setMicPermission("prompt");
        });
    }
    return () => {
      active = false;
    };
  }, []);

  const captureFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      throw new Error("Video not ready");
    }

    let canvas = captureCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      captureCanvasRef.current = canvas;
    }
    const targetSize = 224;
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas rendering context unavailable");
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, targetSize, targetSize);

    const scale = Math.min(
      targetSize / video.videoWidth,
      targetSize / video.videoHeight,
    );
    const width = video.videoWidth * scale;
    const height = video.videoHeight * scale;
    const offsetX = (targetSize - width) / 2;
    const offsetY = (targetSize - height) / 2;

    ctx.drawImage(video, offsetX, offsetY, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Unable to encode frame"));
          }
        },
        "image/jpeg",
        0.92,
      );
    });
  }, []);

  const stopCam = useCallback(() => {
    const loop = faceLoopRef.current;
    loop.running = false;
    loop.inFlight = false;
    if (loop.timer) {
      window.clearTimeout(loop.timer);
      loop.timer = null;
    }
    if (faceStreamRef.current) {
      faceStreamRef.current.getTracks().forEach((track) => track.stop());
      faceStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCamActive(false);
  }, []);

  const stopMic = useCallback(() => {
    const loop = voiceLoopRef.current;
    loop.running = false;
    loop.inFlight = false;
    if (loop.timer) {
      window.clearTimeout(loop.timer);
      loop.timer = null;
    }
    if (loop.stopTimer) {
      window.clearTimeout(loop.stopTimer);
      loop.stopTimer = null;
    }
    if (loop.recorder && loop.recorder.state === "recording") {
      loop.recorder.stop();
    }
    loop.recorder = null;
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    setMicActive(false);
  }, []);

  const scheduleFaceLoop = useCallback(
    (delay) => {
      const loop = faceLoopRef.current;
      if (!loop.running) return;
      if (loop.timer) {
        window.clearTimeout(loop.timer);
      }
      const nextDelay = delay ?? loop.lastDelay ?? 600;
      loop.timer = window.setTimeout(async () => {
        if (!loop.running) return;
        if (loop.inFlight) {
          scheduleFaceLoop(loop.lastDelay);
          return;
        }

        try {
          loop.inFlight = true;
          const frame = await captureFrame();
          const formData = new FormData();
          formData.append("frame", frame, "frame.jpg");
          const started = performance.now();
          const response = await fetch(`${API_BASE}/api/emotion/face`, {
            method: "POST",
            body: formData,
          });
          const text = await response.text();
          const parsed = safeParseJson(text, {});

          if (response.status === 503) {
            loop.lastDelay = clamp(loop.lastDelay + 200, 300, 1200);
            scheduleFaceLoop(loop.lastDelay);
            return;
          }

          if (!response.ok) {
            const detail =
              parsed?.detail ?? parsed?.error ?? "Facial analysis failed.";
            throw new Error(detail);
          }

          const latency = performance.now() - started;
          loop.lastDelay = clamp(latency + 100, 200, 1000);
          setFaceResult({
            payload: parsed,
            latency,
            receivedAt: Date.now(),
          });
          scheduleFaceLoop(loop.lastDelay);
        } catch (error) {
          if (loop.running) {
            const now = Date.now();
            if (now - loop.lastErrorAt > 3500) {
              loop.lastErrorAt = now;
              pushToast(
                error?.message ?? "Facial analysis failed. Retrying shortly.",
              );
            }
            loop.lastDelay = clamp(loop.lastDelay + 200, 400, 1500);
            scheduleFaceLoop(loop.lastDelay);
          }
        } finally {
          loop.inFlight = false;
        }
      }, nextDelay);
    },
    [captureFrame, pushToast],
  );

  const scheduleVoiceLoop = useCallback(
    (delay) => {
      const loop = voiceLoopRef.current;
      if (!loop.running) return;
      if (loop.timer) {
        window.clearTimeout(loop.timer);
      }
      const nextDelay = delay ?? loop.lastDelay ?? 1000;

      loop.timer = window.setTimeout(() => {
        if (!loop.running) return;
        if (loop.inFlight) {
          scheduleVoiceLoop(loop.lastDelay);
          return;
        }

        const stream = audioStreamRef.current;
        if (!stream) {
          scheduleVoiceLoop(800);
          return;
        }

        let recorder;
        try {
          recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        } catch (error) {
          recorder = new MediaRecorder(stream);
        }

        const chunks = [];
        loop.inFlight = true;
        loop.recorder = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onerror = () => {
          loop.inFlight = false;
          const now = Date.now();
          if (now - loop.lastErrorAt > 3500) {
            loop.lastErrorAt = now;
            pushToast("Audio capture error. Retrying...");
          }
          scheduleVoiceLoop(1500);
        };

        recorder.onstop = async () => {
          if (!loop.running) {
            loop.inFlight = false;
            return;
          }

          try {
            if (!chunks.length) {
              throw new Error("Captured audio was empty.");
            }
            const blob = new Blob(chunks, {
              type: recorder.mimeType || "audio/webm",
            });
            const wavBlob = await convertBlobToWav(blob);

            const formData = new FormData();
            formData.append("audio", wavBlob, "clip.wav");
            const started = performance.now();
            const response = await fetch(`${API_BASE}/api/emotion/voice`, {
              method: "POST",
              body: formData,
            });
            const text = await response.text();
            const parsed = safeParseJson(text, {});

            if (response.status === 503) {
              loop.lastDelay = clamp(loop.lastDelay + 300, 800, 1600);
              scheduleVoiceLoop(loop.lastDelay);
              return;
            }

            if (!response.ok) {
              const message =
                parsed?.detail ?? parsed?.error ?? "Voice analysis failed.";
              throw new Error(message);
            }

            const latency = performance.now() - started;
            loop.lastDelay = clamp(latency + 200, 600, 1600);
            setVoiceResult({
              payload: parsed,
              latency,
              receivedAt: Date.now(),
            });
            scheduleVoiceLoop(loop.lastDelay);
          } catch (error) {
            const now = Date.now();
            if (now - loop.lastErrorAt > 3500) {
              loop.lastErrorAt = now;
              pushToast(error?.message ?? "Voice analysis failed.");
            }
            loop.lastDelay = clamp(loop.lastDelay + 200, 800, 2000);
            scheduleVoiceLoop(loop.lastDelay);
          } finally {
            loop.inFlight = false;
          }
        };

        loop.stopTimer = window.setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, CLIP_DURATION_MS);

        recorder.start();
      }, nextDelay);
    },
    [pushToast],
  );

  const startCam = useCallback(async () => {
    if (camActive) {
      stopCam();
      return;
    }
    const ok = await ensureHealth();
    if (!ok) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });
      faceStreamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => {});
      }
      setCamActive(true);
      const loop = faceLoopRef.current;
      loop.running = true;
      loop.lastDelay = 600;
      scheduleFaceLoop(100);
    } catch (error) {
      pushToast("Unable to access webcam. Check permissions.");
      stopCam();
    }
  }, [camActive, ensureHealth, pushToast, scheduleFaceLoop, stopCam]);

  const startMic = useCallback(async () => {
    if (micActive) {
      stopMic();
      return;
    }
    if (!window.MediaRecorder) {
      pushToast("MediaRecorder API is not supported in this browser.");
      return;
    }
    const ok = await ensureHealth();
    if (!ok) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      audioStreamRef.current = stream;
      setMicPermission("granted");
      setMicActive(true);
      const loop = voiceLoopRef.current;
      loop.running = true;
      loop.lastDelay = 1000;
      scheduleVoiceLoop(0);
    } catch (error) {
      if (error && error.name === "NotAllowedError") {
        setMicPermission("denied");
        pushToast("Microphone permission denied by the user.");
      } else {
        pushToast("Unable to access microphone.");
      }
      stopMic();
    }
  }, [ensureHealth, micActive, pushToast, scheduleVoiceLoop, stopMic]);

  useEffect(
    () => () => {
      stopCam();
      stopMic();
    },
    [stopCam, stopMic],
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = (event) => {
      const type = event?.detail?.type;
      if (type === "emotion-scan") {
        if (!camActive) {
          startCam();
        }
        if (!micActive) {
          startMic();
        }
      }
    };
    window.addEventListener("MAITRI:command", handler);
    return () => window.removeEventListener("MAITRI:command", handler);
  }, [camActive, micActive, startCam, startMic]);

  useEffect(() => {
    const faceTs = faceResult?.receivedAt ?? null;
    const voiceTs = voiceResult?.receivedAt ?? null;

    if (!faceTs || !voiceTs) {
      setFusedResult(null);
      return;
    }

    const fuseState = fuseStateRef.current;
    if (
      fuseState.inFlight ||
      (fuseState.faceTs === faceTs && fuseState.voiceTs === voiceTs)
    ) {
      return;
    }

    fuseState.inFlight = true;

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/emotion/fuse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            face: faceResult.payload,
            voice: voiceResult.payload,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail ?? data?.error ?? "Fusion failed.");
        }
        fuseState.faceTs = faceTs;
        fuseState.voiceTs = voiceTs;
        setFusedResult(data);
      } catch (error) {
        const now = Date.now();
        if (now - fuseState.lastErrorAt > 5000) {
          fuseState.lastErrorAt = now;
          pushToast(
            error?.message ??
              "Fusion request failed. Showing individual predictions.",
          );
        }
      } finally {
        fuseState.inFlight = false;
      }
    })();
  }, [faceResult, voiceResult, pushToast]);

  const summary = useMemo(() => {
    const fused = fusedResult;
    if (fused?.top) {
      return {
        source: "Combined",
        emotion: fused.top,
        confidence: Math.round((fused.probs?.[fused.top] ?? 0) * 100),
      };
    }
    if (faceResult?.payload?.top) {
      return {
        source: "Face",
        emotion: faceResult.payload.top,
        confidence: Math.round(
          (faceResult.payload.probs?.[faceResult.payload.top] ?? 0) * 100,
        ),
      };
    }
    if (voiceResult?.payload?.top) {
      return {
        source: "Voice",
        emotion: voiceResult.payload.top,
        confidence: Math.round(
          (voiceResult.payload.probs?.[voiceResult.payload.top] ?? 0) * 100,
        ),
      };
    }
    return { source: "Standby", emotion: "Standby", confidence: null };
  }, [faceResult, voiceResult, fusedResult]);

  const emitEmotionEvent = useCallback((source, payload) => {
    if (typeof window === "undefined" || !source || !payload?.top) {
      return;
    }

    const probs =
      payload.probs && typeof payload.probs === "object" ? payload.probs : {};
    const label = payload.top;
    const scoreCandidate =
      typeof payload.confidence === "number"
        ? payload.confidence
        : probs[label];

    if (typeof scoreCandidate !== "number") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("MAITRI:emotion", {
        detail: {
          source,
          probs,
          top: { label, score: scoreCandidate },
          ts: Date.now(),
        },
      }),
    );
  }, []);

  useEffect(() => {
    if (faceResult?.payload?.top) {
      emitEmotionEvent("face", faceResult.payload);
    }
  }, [faceResult, emitEmotionEvent]);

  useEffect(() => {
    if (voiceResult?.payload?.top) {
      emitEmotionEvent("voice", voiceResult.payload);
    }
  }, [voiceResult, emitEmotionEvent]);

  useEffect(() => {
    if (fusedResult?.top) {
      emitEmotionEvent("fuse", {
        top: fusedResult.top,
        probs: fusedResult.probs ?? null,
        confidence: fusedResult.probs?.[fusedResult.top] ?? null,
      });
    }
  }, [fusedResult, emitEmotionEvent]);
  const faceLabels = useMemo(
    () => ensureEmotionOrder(faceResult?.payload?.probs, DEFAULT_EMOTIONS),
    [faceResult],
  );

  const voiceLabels = useMemo(
    () =>
      ensureEmotionOrder(
        voiceResult?.payload?.probs,
        Object.keys(EMOTION_VISUALS),
      ),
    [voiceResult],
  );

  const faceInsight = useMemo(
    () => buildInsight("face", faceResult?.payload, camActive),
    [faceResult, camActive],
  );

  const voiceInsight = useMemo(
    () => buildInsight("voice", voiceResult?.payload, micActive),
    [voiceResult, micActive],
  );

  const fusedInsight = useMemo(() => {
    const active = camActive || micActive;
    if (fusedResult?.top) {
      return buildInsight("fused", fusedResult, active);
    }

    const facePayload = faceResult?.payload ?? null;
    const voicePayload = voiceResult?.payload ?? null;
    const faceTop = facePayload?.top ?? null;
    const voiceTop = voicePayload?.top ?? null;

    if (faceTop && voiceTop) {
      const faceMessage = buildInsight("face", facePayload, true);
      const voiceMessage = buildInsight("voice", voicePayload, true);
      return {
        title: INSIGHT_SOURCE_LABELS.fused,
        emotion: `${faceTop} & ${voiceTop}`,
        confidence: null,
        message: `${faceMessage.message} Additionally, vocal cues point to ${voiceTop.toLowerCase()}.`,
      };
    }

    if (faceTop) {
      const faceMessage = buildInsight("face", facePayload, true);
      return {
        ...faceMessage,
        title: INSIGHT_SOURCE_LABELS.fused,
        message: `${faceMessage.message} Vocal stream is idle, so I'm leaning on facial cues for now.`,
      };
    }

    if (voiceTop) {
      const voiceMessage = buildInsight("voice", voicePayload, true);
      return {
        ...voiceMessage,
        title: INSIGHT_SOURCE_LABELS.fused,
        message: `${voiceMessage.message} Camera feed is idle, so I'm leaning on vocal cues for now.`,
      };
    }

    return buildInsight("fused", null, active);
  }, [fusedResult, faceResult, voiceResult, camActive, micActive]);

  const primarySummaryEmotion =
    summary.emotion?.includes("&")
      ? summary.emotion.split("&")[0].trim()
      : summary.emotion;

  const summaryStyles =
    EMOTION_VISUALS[primarySummaryEmotion] ??
    EMOTION_VISUALS[summary.emotion ?? ""] ??
    {
      color: "from-slate-500 to-slate-600",
      text: "text-slate-200",
      icon: "\u{1F642}",
    };

  const micButtonDisabled =
    micPermission === "denied" || checkingHealth || !healthOk;

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
        `}
      </style>
      <ToastStack items={toasts} />

      <div className="relative flex w-full flex-col px-6 pt-16 lg:px-10">
        <CommandBar />

        <div className="mb-10 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/60 px-5 py-3 text-sm text-slate-300 shadow-[0_25px_60px_rgba(15,23,42,0.45)] md:max-w-lg">
          <span>Status:</span>
          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-200">
            <span
              className={`h-2 w-2 rounded-full ${
                healthOk ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            {healthOk ? "API Online" : checkingHealth ? "Checking backend..." : "Offline"}
          </span>
        </div>

        {suggestion ? (
          <div className="mb-12 animate-slide-up">
            <SuggestionCard
              emotion={suggestion.emotion}
              confidence={suggestion.confidence}
              suggestion={suggestion.data}
              onStart={handleSuggestionStart}
            />
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-10 mb-16">
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

            <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 h-80 mb-4 border border-cyan-500/30">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
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
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-red-500 via-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_45px_rgba(249,115,22,0.35)] transition hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none"
              onClick={startCam}
              aria-label={camActive ? "Stop Detection" : "Start Detection"}
              disabled={checkingHealth}
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

            <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 h-80 mb-4 border border-cyan-500/30 flex items-center justify-center">
              <p className="text-sm text-cyan-200/70 px-6 text-center">
                Voice analysis captures 2 second clips to evaluate tone, rate, and emotional cues. Enable the microphone to begin streaming.
              </p>
            </div>

            <button
              type="button"
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_45px_rgba(56,189,248,0.35)] transition hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none ${
                micActive
                  ? "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"
                  : "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500"
              } ${micButtonDisabled ? "opacity-60 pointer-events-none" : ""}`}
              onClick={startMic}
              aria-label={micActive ? "Stop Voice Analysis" : "Start Voice Analysis"}
              disabled={micButtonDisabled}
              title={
                micPermission === "denied"
                  ? "Microphone permission denied. Update browser settings to enable."
                  : undefined
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

            <MaitriRobotOverlay active={micActive} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <InsightCard insight={faceInsight} active={camActive} />
          <InsightCard insight={voiceInsight} active={micActive} />
          <InsightCard
            insight={fusedInsight}
            active={camActive || micActive}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <EmotionBars
            title="Facial Analysis"
            latency={faceResult?.latency}
            active={camActive}
            result={faceResult?.payload}
            fallbackLabels={faceLabels}
          />
          <EmotionBars
            title="Voice Analysis"
            latency={voiceResult?.latency}
            active={micActive}
            result={voiceResult?.payload}
            fallbackLabels={voiceLabels}
          />
        </div>

        <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-cyan-500/20">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">
            System Status
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="font-semibold text-white mb-1">API Health</p>
              <p>
                {healthOk
                  ? "Backend online â€” ready for inference."
                  : checkingHealth
                    ? "Checking API availability..."
                    : "Backend offline. Start the FastAPI server."}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="font-semibold text-white mb-1">Face Loop</p>
              <p>
                {camActive
                  ? "Streaming frames with adaptive cadence."
                  : "Camera inactive. Start detection to resume streaming."}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="font-semibold text-white mb-1">Voice Loop</p>
              <p>
                {micActive
                  ? "Capturing short clips for spectral analysis."
                  : "Microphone disabled or awaiting permission."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
