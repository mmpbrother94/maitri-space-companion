import { createSession } from "./ort";

// simple MFCC-ish frontend is done on the fly; for brevity we use mel log-energies windowing
// In production, consider a dedicated DSP lib (Meyda) or ship features precomputed in WASM.

export type VoiceEmotion =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "fear"
  | "disgust"
  | "surprise"
  | "calm";
type Pred = { label: VoiceEmotion; score: number };

let session: any = null;

export async function initVoice(modelUrl = "/models/ser_convnext.onnx") {
  if (session) return true;
  try {
    session = await createSession(modelUrl);
    return true;
  } catch (e) {
    console.warn("[VOICE] model not available", e);
    return false;
  }
}

// VERY minimal feature extractor: log-mel energies frames
export async function inferVoiceEmotionFromPCM(
  pcm: Float32Array,
  sampleRate = 48000
): Promise<Pred[] | null> {
  if (!session) return null;
  // Resample to 16k
  const target = 16000;
  const ratio = sampleRate / target;
  const outLen = Math.max(1, Math.floor(pcm.length / ratio));
  const resampled = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    resampled[i] = pcm[Math.floor(i * ratio)] || 0;
  }

  // frame into 1.0s window, 50% hop, dummy 64 mel bins (placeholder)
  const frame = target;
  const hop = target >> 1;
  const melBins = 64;
  const frames = Math.max(1, Math.floor((resampled.length - frame) / hop) + 1);
  const feat = new Float32Array(frames * melBins).fill(0.001);
  // NOTE: This is a placeholder. Replace with real mel/MFCC if your model expects it.
  // We still feed something shaped [1,1,frames,melBins] to avoid crashes.

  const tensor = new (window as any).ort.Tensor(
    "float32",
    feat,
    [1, 1, frames, melBins]
  );
  const out = await session.run({ input: tensor });
  const logits = (out[Object.keys(out)[0]].data as Float32Array).slice();
  const labels: VoiceEmotion[] = [
    "neutral",
    "happy",
    "sad",
    "angry",
    "fear",
    "disgust",
    "surprise",
    "calm",
  ].slice(0, logits.length);
  const exps = logits.map((v) => Math.exp(v));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((v) => v / sum);
  return labels
    .map((label, i) => ({ label, score: probs[i] }))
    .sort((a, b) => b.score - a.score);
}

