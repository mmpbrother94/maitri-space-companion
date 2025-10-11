import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AvatarBadge from "./AvatarBadge";
import ChatDrawer from "./ChatDrawer";
import { companionStore, pickPreferredEvent } from "./useCompanionStore";
import "./styles.css";

const INTERVENTION_EMOTIONS = new Set(["Stressed", "Anxious"]);
const EVENT_TTL = 2000;

function CompanionDock() {
  const location = useLocation();
  const path = location?.pathname ?? "/";

  const isEmotionRoute =
    path.startsWith("/dashboard/emotions") || path === "/emotion";
  const showOnRoute = path !== "/";
  const showAvatar = isEmotionRoute;
  const showChat = showOnRoute;
  const showCompanion = showAvatar || showChat;

  const [toastVisible, setToastVisible] = useState(false);
  const highStressRef = useRef(null);
  const pendingEventsRef = useRef({});
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !showCompanion) {
      return undefined;
    }

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        companionStore.setDimmed(true);
      }, 10000);
    };

    const maybeTriggerIntervention = (candidate, ts) => {
      if (
        candidate?.label &&
        candidate.score >= 0.6 &&
        INTERVENTION_EMOTIONS.has(candidate.label)
      ) {
        if (!highStressRef.current) {
          highStressRef.current = { label: candidate.label, start: ts };
        } else if (
          highStressRef.current.label === candidate.label &&
          ts - highStressRef.current.start >= 5000
        ) {
          triggerToast();
          highStressRef.current = { label: candidate.label, start: ts };
        } else if (highStressRef.current.label !== candidate.label) {
          highStressRef.current = { label: candidate.label, start: ts };
        }
      } else {
        highStressRef.current = null;
      }
    };

    function handleEmotionEvent(event) {
      const detail = event?.detail;
      if (!detail?.top?.label || typeof detail.top.score !== "number") {
        return;
      }

      const source = detail.source || null;
      const ts = typeof detail.ts === "number" ? detail.ts : Date.now();
      const activeEvent = {
        label: detail.top.label,
        score: detail.top.score,
        source,
        ts,
      };

      if (source) {
        const next = { ...pendingEventsRef.current, [source]: activeEvent };
        Object.keys(next).forEach((key) => {
          if (ts - next[key].ts > EVENT_TTL) {
            delete next[key];
          }
        });
        pendingEventsRef.current = next;
        const candidate = pickPreferredEvent(next);
        if (candidate?.label) {
          companionStore.setEmotion({
            label: candidate.label,
            score: candidate.score ?? 0,
            source: candidate.source ?? null,
            ts: candidate.ts ?? ts,
          });
          maybeTriggerIntervention(candidate, ts);
        }
      } else {
        companionStore.setEmotion(activeEvent);
        maybeTriggerIntervention(activeEvent, ts);
      }

      companionStore.setDimmed(false);
      resetInactivityTimer();
    }

    window.addEventListener("MAITRI:emotion", handleEmotionEvent);
    resetInactivityTimer();

    return () => {
      window.removeEventListener("MAITRI:emotion", handleEmotionEvent);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [showCompanion]);

  useEffect(() => {
    if (!showAvatar) {
      setToastVisible(false);
    }
  }, [showAvatar]);

  const toastContent = useMemo(
    () => (
      <div className="maitri-toast">
        <span>⚠ Intervention recommended</span>
        <a
          href="/dashboard/interventions"
          className="underline font-semibold text-white"
        >
          View interventions
        </a>
      </div>
    ),
    [],
  );

  const triggerToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4500);
  };

  if (!showCompanion) {
    return null;
  }

  return (
    <div className="maitri-companion-layer">
      {showAvatar && <AvatarBadge />}
      {showChat && <ChatDrawer />}
      {showAvatar && toastVisible && toastContent}
    </div>
  );
}

export default CompanionDock;
