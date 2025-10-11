import React, { useEffect, useMemo, useState } from "react";
import { useCompanionStore } from "./useCompanionStore";

const EMOTION_HELPERS = {
  Happy: "Great to see your energy!",
  Calm: "Steady and composed.",
  Focused: "Laser-focused mode.",
  Stressed: "Let's try a breathing break?",
  Anxious: "I'm right here with you.",
  Sad: "I'm here to support you.",
  default: "Standing by for your signal.",
};

function EmotionChip() {
  const { topEmotion, confidence, dimmed } = useCompanionStore((s) => ({
    topEmotion: s.topEmotion,
    confidence: s.confidence,
    dimmed: s.dimmed,
  }));

  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 240);
    return () => clearTimeout(timer);
  }, [topEmotion, confidence]);

  const helper = useMemo(() => {
    if (!topEmotion) return EMOTION_HELPERS.default;
    return EMOTION_HELPERS[topEmotion] ?? EMOTION_HELPERS.default;
  }, [topEmotion]);

  const confidenceLabel =
    !dimmed && topEmotion && confidence != null
      ? `${Math.round(confidence * 100)}% confidence`
      : "(standby)";

  return (
    <div
      className={`maitri-emotion-chip ${animating ? "slide-in" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="maitri-emotion-chip__title">Maitri Avatar</div>
      <div className="maitri-emotion-chip__label">
        {dimmed ? "Standby" : topEmotion ?? "Standby"}{" "}
        <span className="text-xs font-medium text-slate-300">
          ({confidenceLabel})
        </span>
      </div>
      <div className="maitri-emotion-chip__helper">{helper}</div>
    </div>
  );
}

export default EmotionChip;
