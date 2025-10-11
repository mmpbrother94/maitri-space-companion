import { createSession } from "./ort";

export type FaceEmotion =
  | "neutral"
  | "happiness"
  | "surprise"
  | "sadness"
  | "anger"
  | "disgust"
  | "fear"
  | "contempt";
type Pred = { label: FaceEmotion; score: number };

let session: any = null;

export async function initFace(modelUrl = "/models/ferplus_dynamic.onnx") {
  if (session) return true;
  try {
    session = await createSession(modelUrl);
    return true;
  } catch (e) {
    console.warn("[FACE] model not available", e);
    return false;
  }
}

// Simple grayscale 64x64 crop util
function preprocessFaceRGBA(
  rgba: ImageData,
  box: { x: number; y: number; w: number; h: number }
) {
  const size = 64; // FER+ default
  const tmp = document.createElement("canvas");
  tmp.width = size;
  tmp.height = size;
  const ctx = tmp.getContext("2d")!;
  const src = document.createElement("canvas");
  src.width = rgba.width;
  src.height = rgba.height;
  const sctx = src.getContext("2d")!;
  sctx.putImageData(rgba, 0, 0);
  ctx.drawImage(src, box.x, box.y, box.w, box.h, 0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size).data;

  // grayscale & normalize
  const x = new Float32Array(size * size);
  for (let i = 0, j = 0; i < img.length; i += 4, j++) {
    const g =
      (img[i] * 0.2989 + img[i + 1] * 0.587 + img[i + 2] * 0.114) / 255.0;
    x[j] = g;
  }
  return x;
}

export async function inferFaceEmotion(
  rgba: ImageData,
  faceBox: { x: number; y: number; w: number; h: number }
): Promise<Pred[] | null> {
  if (!session) return null;
  const x = preprocessFaceRGBA(rgba, faceBox);
  // [N,1,64,64]
  const input = new Float32Array(1 * 1 * 64 * 64);
  input.set(x, 0);
  const feeds: Record<string, any> = {
    input: new (window as any).ort.Tensor("float32", input, [1, 1, 64, 64]),
  };
  const out = await session.run(feeds);
  const logits = (out[Object.keys(out)[0]].data as Float32Array).slice();
  const labels: FaceEmotion[] = [
    "neutral",
    "happiness",
    "surprise",
    "sadness",
    "anger",
    "disgust",
    "fear",
    "contempt",
  ];
  const exps = logits.map((v) => Math.exp(v));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((v) => v / sum);
  return labels
    .map((label, i) => ({ label, score: probs[i] }))
    .sort((a, b) => b.score - a.score);
}

