import React, { useMemo } from "react";
import { useCompanionStore } from "./useCompanionStore";
import EmotionChip from "./EmotionChip";

const EMOTION_CONFIG = {
  Happy: { emoji: "😊", glow: "#20e3b2" },
  Calm: { emoji: "🙂", glow: "#2e7bff" },
  Focused: { emoji: "🧠", glow: "#7c4dff" },
  Stressed: { emoji: "😟", glow: "#ff8a00" },
  Anxious: { emoji: "😰", glow: "#ff5e7e" },
  Sad: { emoji: "😢", glow: "#6aa0ff" },
  default: { emoji: "🤖", glow: "#475569" },
};

function ringStyle(color, confidence = 0) {
  const degrees = Math.max(0, Math.min(1, confidence)) * 360;
  return {
    backgroundImage: `conic-gradient(${color} ${degrees}deg, rgba(15,23,42,0.25) ${degrees}deg)`,
  };
}

function AvatarBadge() {
  const { topEmotion, confidence, dimmed } = useCompanionStore((s) => ({
    topEmotion: s.topEmotion,
    confidence: s.confidence,
    dimmed: s.dimmed,
  }));

  const config = useMemo(() => {
    if (!topEmotion) return EMOTION_CONFIG.default;
    return EMOTION_CONFIG[topEmotion] ?? EMOTION_CONFIG.default;
  }, [topEmotion]);

  return (
    <div className="maitri-companion-avatar" aria-live="polite">
      <div
        className={`maitri-companion-avatar__canvas ${
          confidence != null && confidence > 0.6 ? "pulse-strong" : ""
        } ${dimmed ? "dimmed" : ""}`}
      >
        <div
          className="maitri-companion-avatar__glow"
          style={{ backgroundColor: config.glow }}
        />
        <div
          className="maitri-companion-avatar__ring"
          style={ringStyle(config.glow, confidence ?? 0)}
        />
        <div
          className="maitri-companion-avatar__emoji"
          role="img"
          aria-label={`${topEmotion ?? "Standby"} emoji`}
        >
          {config.emoji}
        </div>
      </div>
      <div className="maitri-companion-avatar__pill">
        <span>●</span> Online
      </div>
      <EmotionChip />
    </div>
  );
}

export default AvatarBadge;
