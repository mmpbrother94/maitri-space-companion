export type EmotionLabel =
  | "Calm"
  | "Focused"
  | "Stressed"
  | "Anxious"
  | "Sad"
  | "Angry"
  | "Fatigued"
  | "Happy";

export interface Suggestion {
  title: string;
  subtitle: string;
  cta: string;
  code: string;
}

export const EMOTION_TO_SUGGESTION: Record<EmotionLabel, Suggestion> = {
  Stressed: {
    title: "Paced Breathing (3 min)",
    subtitle: "Lower arousal via 6-bpm breathing + 90-sec grounding",
    cta: "Start Session",
    code: "breath_3",
  },
  Anxious: {
    title: "Grounding + Breathing",
    subtitle: "5-4-3-2-1 senses + paced breathing",
    cta: "Start Session",
    code: "ground_breath",
  },
  Sad: {
    title: "Supportive Conversation",
    subtitle: "Talk it out + affirmations (3 min)",
    cta: "Start Session",
    code: "support_talk",
  },
  Angry: {
    title: "Short Walk + Box Breathing",
    subtitle: "2-min box breathing to reset",
    cta: "Start Session",
    code: "box_2",
  },
  Fatigued: {
    title: "NSDR (8 min)",
    subtitle: "Deep relaxation + light exposure tip",
    cta: "Start NSDR",
    code: "nsdr_8",
  },
  Calm: {
    title: "Keep Momentum",
    subtitle: "2-min focus reset to stay in flow",
    cta: "Start Reset",
    code: "focus_2",
  },
  Focused: {
    title: "Micro-Plan",
    subtitle: "One small win: 5-step checklist",
    cta: "Create Plan",
    code: "plan_5",
  },
  Happy: {
    title: "Bank the Win",
    subtitle: "Log the good moment for morale",
    cta: "Log Insight",
    code: "log_good",
  },
};

export const TRIGGER = {
  minConf: 0.6,
  minDelta: 0.15,
  minGapMs: 3000,
};
