import { useEffect, useMemo, useRef, useState } from "react";
import { EMOTION_TO_SUGGESTION, EmotionLabel, Suggestion, TRIGGER } from "../../config/emotionMap";
import { useNotifications } from "../../state/useNotifications";

type EmotionEvent = {
  label: EmotionLabel;
  confidence: number;
  ts: number;
  source: "face" | "voice" | "fuse";
};

type BridgeState = {
  event: EmotionEvent | null;
  suggestion: {
    emotion: EmotionLabel;
    confidence: number;
    data: Suggestion;
  } | null;
};

const DEV_EMIT =
  typeof import.meta !== "undefined" &&
  Boolean((import.meta as any).env?.VITE_DEV_EMIT_EMOTION);

const MOCK_EVENTS: EmotionEvent[] = [
  { label: "Calm", confidence: 0.74, ts: Date.now(), source: "fuse" },
  { label: "Stressed", confidence: 0.72, ts: Date.now(), source: "fuse" },
  { label: "Focused", confidence: 0.81, ts: Date.now(), source: "fuse" },
  { label: "Fatigued", confidence: 0.65, ts: Date.now(), source: "fuse" },
];

export function useEmotionBridge(): BridgeState {
  const { push } = useNotifications();
  const [event, setEvent] = useState<EmotionEvent | null>(null);
  const lastDominantRef = useRef<EmotionEvent | null>(null);
  const lastNotificationAtRef = useRef<number>(0);
  const mockIndex = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handler = (raw: Event) => {
      const detail = (raw as CustomEvent)?.detail ?? {};
      const { top, ts = Date.now(), source } = detail;
      const eventSource = source ?? "fuse";
      if (eventSource !== "fuse") {
        return;
      }
      if (
        !top?.label ||
        typeof top.label !== "string" ||
        typeof top.score !== "number" ||
        top.score < 0
      ) {
        return;
      }
      const label = top.label as EmotionLabel;
      const confidence = top.score;
      const emotionEvent: EmotionEvent = {
        label,
        confidence,
        ts,
        source: "fuse",
      };
      setEvent(emotionEvent);
    };

    window.addEventListener("MAITRI:emotion", handler as EventListener);

    let timer: number | undefined;
    if (DEV_EMIT) {
      timer = window.setInterval(() => {
        const sample = MOCK_EVENTS[mockIndex.current % MOCK_EVENTS.length];
        mockIndex.current += 1;
        window.dispatchEvent(
          new CustomEvent("MAITRI:emotion", {
            detail: {
              source: sample.source,
              top: { label: sample.label, score: sample.confidence },
              ts: Date.now(),
            },
          }),
        );
      }, 12000);
    }

    return () => {
      window.removeEventListener("MAITRI:emotion", handler as EventListener);
      if (timer) window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!event) return;

    const mapping = EMOTION_TO_SUGGESTION[event.label];
    if (!mapping) {
      lastDominantRef.current = event;
      return;
    }

    const shouldNotify =
      event.confidence >= TRIGGER.minConf &&
      (() => {
        const last = lastDominantRef.current;
        if (!last) return true;
        const labelChanged = last.label !== event.label;
        const delta = Math.abs(event.confidence - last.confidence);
        return labelChanged || delta >= TRIGGER.minDelta;
      })() &&
      Date.now() - lastNotificationAtRef.current >= TRIGGER.minGapMs;

    if (shouldNotify) {
      push({
        title: "Live Emotion Detected",
        body: `${event.label} — ${Math.round(event.confidence * 100)}%. Suggested: ${mapping.title}.`,
        ts: event.ts,
      });
      lastNotificationAtRef.current = Date.now();
    }

    lastDominantRef.current = event;
  }, [event, push]);

  const suggestion = useMemo(() => {
    if (!event) return null;
    if (event.confidence < TRIGGER.minConf) return null;
    const mapping = EMOTION_TO_SUGGESTION[event.label];
    if (!mapping) return null;
    return {
      emotion: event.label,
      confidence: event.confidence,
      data: mapping,
    };
  }, [event]);

  return { event, suggestion };
}
