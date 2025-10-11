import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";
import { initFace, inferFaceEmotion } from "../../services/emotion/face";
import { initVoice, inferVoiceEmotionFromPCM } from "../../services/emotion/audio";
import { planResponse } from "../../bot/engine";
import { type EmotionSnapshot } from "../../bot/triage";
// @ts-ignore
import hark from "hark";

type Capture = {
  video: HTMLVideoElement | null;
  stream: MediaStream | null;
  analyser: AnalyserNode | null;
  pcmBuf: Float32Array | null;
};

type ReadyState = { face: boolean; voice: boolean };

export default function MAITRI() {
  const [faceDetector, setFaceDetector] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cap, setCap] = useState<Capture>({
    video: null,
    stream: null,
    analyser: null,
    pcmBuf: null,
  });
  const [log, setLog] = useState<string[]>([]);
  const [lastTurns, setLastTurns] = useState<
    { role: "assistant" | "user"; text: string }[]
  >([]);
  const [ready, setReady] = useState<ReadyState>({ face: false, voice: false });
  const [lastFace, setLastFace] = useState<{ label: string; score: number } | null>(null);
  const [lastVoice, setLastVoice] = useState<{ label: string; score: number } | null>(null);

  // Setup media
  useEffect(() => {
    let active = true;
    let localStream: MediaStream | null = null;
    let speech: ReturnType<typeof hark> | null = null;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });
        if (!videoRef.current || !active) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        localStream = stream;

        const Ctx =
          window.AudioContext || (window as any).webkitAudioContext || null;
        if (!Ctx) {
          setLog((l) => ["[audio] AudioContext not supported", ...l]);
          setCap({
            video: videoRef.current,
            stream,
            analyser: null,
            pcmBuf: null,
          });
          return;
        }

        const ctx = new Ctx();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        src.connect(analyser);

        // Voice activity (for batching audio)
        speech = hark(stream, { play: false });
        speech.on("speaking", () => setLog((l) => ["[voice] speaking...", ...l]));
        speech.on("stopped_speaking", () =>
          setLog((l) => ["[voice] stopped", ...l])
        );

        setCap({
          video: videoRef.current,
          stream,
          analyser,
          pcmBuf: new Float32Array(analyser.fftSize),
        });
      } catch (error) {
        setLog((l) => [`[media] ${String(error)}`, ...l]);
      }
    })();

    return () => {
      active = false;
      speech?.stop();
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Load models
  useEffect(() => {
    (async () => {
      const faceOk = await initFace();
      const voiceOk = await initVoice();
      setReady({ face: faceOk, voice: voiceOk });
      if (!faceOk || !voiceOk) {
        const miss = [
          !faceOk ? "[init] face model missing" : null,
          !voiceOk ? "[init] voice model missing" : null,
        ].filter(Boolean) as string[];
        setLog((l) => [...miss, ...l]);
      }
      // Load MediaPipe face detector
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        const detector = await FaceDetector.createFromOptions(filesetResolver, {
          modelAssetPath:
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/face_detection_short_range.tflite",
          runningMode: "VIDEO",
        });
        setFaceDetector(detector);
      } catch (e) {
        setLog((l) => ["[mediapipe] face detector load error", ...l]);
      }
    })();
  }, []);

  // Inference loop (every ~2s)
  useEffect(() => {
    let on = true;
    const tick = async () => {
      if (!on || !cap.video) return;
      try {
        const canvas = document.createElement("canvas");
        const vw = cap.video.videoWidth || 640;
        const vh = cap.video.videoHeight || 480;
        canvas.width = vw;
        canvas.height = vh;
        const ctx2d = canvas.getContext("2d");
        if (!ctx2d) {
          setLog((l) => ["[face] no 2d context", ...l]);
          return;
        }
        ctx2d.drawImage(cap.video, 0, 0, vw, vh);
        const rgba = ctx2d.getImageData(0, 0, vw, vh);

        // Use MediaPipe face detector if available
        let faceBox = null;
        if (faceDetector) {
          try {
            const faces = await faceDetector.detectForVideo(cap.video, performance.now());
            if (faces.detections.length > 0) {
              const box = faces.detections[0].boundingBox;
              faceBox = {
                x: Math.max(0, Math.floor(box.originX)),
                y: Math.max(0, Math.floor(box.originY)),
                w: Math.floor(box.width),
                h: Math.floor(box.height),
              };
            }
          } catch (e) {
            setLog((l) => ["[mediapipe] detection error", ...l]);
          }
        }
        // fallback to center crop if no face detected
        if (!faceBox) {
          faceBox = {
            x: Math.floor(vw * 0.3),
            y: Math.floor(vh * 0.2),
            w: Math.floor(vw * 0.4),
            h: Math.floor(vh * 0.6),
          };
        }

        let face: EmotionSnapshot["face"] = null;
        let voice: EmotionSnapshot["voice"] = null;

        if (ready.face) {
          try {
            const pred = await inferFaceEmotion(rgba, faceBox);
            if (pred?.length) {
              face = { label: pred[0].label, score: pred[0].score };
              setLastFace(face);
            } else {
              setLastFace(null);
            }
          } catch (error) {
            setLog((l) => [`[face] error ${String(error)}`, ...l]);
            setLastFace(null);
          }
        } else {
          setLastFace(null);
        }

        if (ready.voice && cap.analyser) {
          try {
            const pcm = new Float32Array(cap.analyser.fftSize);
            cap.analyser.getFloatTimeDomainData(pcm);
            const rate =
              (cap.stream?.getAudioTracks()[0]?.getSettings().sampleRate as
                number) || 48000;
            const predV = await inferVoiceEmotionFromPCM(pcm, rate);
            if (predV?.length) {
              voice = { label: predV[0].label, score: predV[0].score };
              setLastVoice(voice);
            } else {
              setLastVoice(null);
            }
          } catch (error) {
            setLog((l) => [`[voice] error ${String(error)}`, ...l]);
            setLastVoice(null);
          }
        } else {
          setLastVoice(null);
        }

        const snapshot: EmotionSnapshot = { face, voice, ts: Date.now() };
        const turns = planResponse(snapshot, null);
        setLastTurns((history) =>
          [...history, ...turns
            .filter((t: any) => t.role === "assistant")
            .map((t: any) => ({ role: "assistant" as const, text: t.text }))].slice(-6)
        );
      } catch (error) {
        setLog((l) => [`[loop] ${String(error)}`, ...l]);
      } finally {
        if (on) setTimeout(tick, 2000);
      }
    };

    const id = setTimeout(tick, 1500);
    return () => {
      on = false;
      clearTimeout(id);
    };
  }, [cap, ready]);

  return (
    <div className="mx-auto max-w-6xl p-6 text-white">
      <h1 className="text-2xl font-semibold">
        MAITRI - Multimodal Well-being Assistant
      </h1>
      <p className="text-white/80">
        On-device emotion detection with short, supportive interactions. No cloud
        calls.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-2 font-medium">Camera / Mic</h3>
          <video
            ref={videoRef}
            className="w-full rounded-lg bg-black/40"
            muted
            playsInline
          />
          <div className="mt-2 text-sm text-white/70">
            Models:{" "}
            <span
              className={ready.face ? "text-emerald-300" : "text-rose-300"}
            >
              Face {ready.face ? "ready" : "missing"}
            </span>
            ,{" "}
            <span
              className={ready.voice ? "text-emerald-300" : "text-amber-300"}
            >
              Voice {ready.voice ? "ready" : "fallback"}
            </span>
          </div>
          <div className="mt-2 text-xs text-white/80">
            <div>
              <strong>Detected Face Emotion:</strong>{" "}
              {lastFace ? `${lastFace.label} (${(lastFace.score*100).toFixed(1)}%)` : <span className="text-rose-300">none</span>}
            </div>
            <div>
              <strong>Detected Voice Emotion:</strong>{" "}
              {lastVoice ? `${lastVoice.label} (${(lastVoice.score*100).toFixed(1)}%)` : <span className="text-amber-300">none</span>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-2 font-medium">Assistant</h3>
          <div className="h-64 space-y-2 overflow-auto text-sm">
            {lastTurns.map((t, i) => (
              <div key={i} className="rounded-md bg-black/30 p-2">
                {t.text}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-white/60">
            The assistant stays concise and action-oriented; escalates on persistent
            distress.
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 font-medium">Logs</h3>
        <div className="h-28 overflow-auto text-xs font-mono">
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
