import { z } from "zod";

export const EmotionSnapshot = z.object({
  face: z
    .object({ label: z.string(), score: z.number() })
    .nullable(),
  voice: z
    .object({ label: z.string(), score: z.number() })
    .nullable(),
  ts: z.number(),
});
export type EmotionSnapshot = z.infer<typeof EmotionSnapshot>;

export type RiskLevel = "green" | "amber" | "red";

export function fuse(
  snapshot: EmotionSnapshot
): { state: string; risk: RiskLevel } {
  const f = snapshot.face?.label || "unknown";
  const v = snapshot.voice?.label || "unknown";

  // Simple fusion with conservative bias toward negative agreement
  const negatives = ["sadness", "angry", "fear", "disgust"];
  const pos = ["happiness", "calm", "neutral", "surprise"];

  const fNeg = negatives.includes(f);
  const vNeg = negatives.includes(v);
  const fPos = pos.includes(f);
  const vPos = pos.includes(v);

  if (
    (fNeg && vNeg) ||
    ((fNeg || vNeg) &&
      (snapshot.face?.score || 0) > 0.7 &&
      (snapshot.voice?.score || 0) > 0.7)
  ) {
    return { state: `neg:${f}/${v}`, risk: "red" };
  }
  if (fNeg || vNeg) return { state: `mixed:${f}/${v}`, risk: "amber" };
  if (fPos && vPos) return { state: `pos:${f}/${v}`, risk: "green" };
  return { state: `uncertain:${f}/${v}`, risk: "amber" };
}

