import * as ort from "onnxruntime-web";

export async function initOrt(): Promise<void> {
  if ((globalThis as any).__ortReady) return;
  if (!(globalThis as any).ort) {
    (globalThis as any).ort = ort;
  }
  try {
    (ort as any).env.wasm.numThreads = Math.max(
      1,
      (navigator as any).hardwareConcurrency || 4
    );
    (ort as any).env.wasm.simd = true;
  } catch {}
  (globalThis as any).__ortReady = true;
}

export async function createSession(modelUrl: string) {
  await initOrt();
  const providers: ort.InferenceSession.SessionOptions["executionProviders"] = [
    { name: "webgpu" },
    { name: "webgl" },
    { name: "wasm" },
  ];
  try {
    return await ort.InferenceSession.create(modelUrl, {
      executionProviders: providers,
      graphOptimizationLevel: "all",
    });
  } catch (e) {
    console.warn("[ORT] falling back to WASM", e);
    return await ort.InferenceSession.create(modelUrl, {
      executionProviders: ["wasm"] as any,
    });
  }
}
