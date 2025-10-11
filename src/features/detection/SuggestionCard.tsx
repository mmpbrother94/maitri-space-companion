import React from "react";
import type { EmotionLabel, Suggestion } from "../../config/emotionMap";

const EMOJI_MAP: Record<EmotionLabel, string> = {
  Calm: "🪐",
  Focused: "🎯",
  Stressed: "⚠️",
  Anxious: "💓",
  Sad: "🌧️",
  Angry: "🔥",
  Fatigued: "😴",
  Happy: "🌈",
};

type SuggestionCardProps = {
  emotion: EmotionLabel;
  confidence: number;
  suggestion: Suggestion;
  onStart: (suggestion: Suggestion) => void;
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  emotion,
  confidence,
  suggestion,
  onStart,
}) => {
  const emoji = EMOJI_MAP[emotion] ?? "🤖";
  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="rounded-3xl border border-sky-400/30 bg-slate-900/80 p-6 shadow-[0_30px_60px_rgba(14,165,233,0.35)] backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-2xl">
          {emoji}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
            Suggested Intervention
          </p>
          <p className="text-lg font-semibold text-white">
            {suggestion.title}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {emotion}
          </p>
          <p className="text-sm font-semibold text-emerald-300">
            {confidencePct}% confidence
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-300">{suggestion.subtitle}</p>
      <button
        type="button"
        className="mt-5 inline-flex items-center rounded-2xl border border-sky-400/60 bg-sky-500/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-100 transition hover:bg-sky-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
        onClick={() => onStart(suggestion)}
        aria-label={`Start ${suggestion.title}`}
      >
        {suggestion.cta}
      </button>
    </div>
  );
};

export default SuggestionCard;
