import { useCallback, useRef, useSyncExternalStore } from "react";

const EMOTION_PRIORITIES = ["fuse", "face", "voice"];

const initialState = {
  online: true,
  topEmotion: null,
  confidence: null,
  lastSource: null,
  lastUpdated: null,
  dimmed: false,
  drawerOpen: false,
};

let state = { ...initialState };
const listeners = new Set();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const setState = (partial) => {
  state = {
    ...state,
    ...partial,
  };
  emitChange();
};

export const companionStore = {
  getState: () => state,
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setOpen: (drawerOpen) => setState({ drawerOpen }),
  setDimmed: (dimmed) => {
    if (state.dimmed !== dimmed) {
      setState({ dimmed });
    }
  },
  reset: () => {
    state = { ...initialState };
    emitChange();
  },
  setEmotion: ({ label, score, source, ts }) => {
    if (!label || score == null) {
      setState({
        topEmotion: null,
        confidence: null,
        lastSource: null,
        lastUpdated: ts,
        dimmed: false,
      });
      return;
    }

    const current = companionStore.getState();
    const nextScore = Number(score);

    const passesThreshold =
      current.topEmotion !== label
        ? nextScore >= 0.22
        : Math.abs((current.confidence ?? 0) - nextScore) >= 0.06;

    if (!passesThreshold && current.topEmotion === label) {
      setState({
        lastUpdated: ts,
        lastSource: source ?? current.lastSource,
        dimmed: false,
      });
      return;
    }

    setState({
      topEmotion: label,
      confidence: nextScore,
      lastSource: source ?? current.lastSource,
      lastUpdated: ts,
      dimmed: false,
    });
  },
};

const shallowEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0; i < aKeys.length; i += 1) {
    const key = aKeys[i];
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!Object.is(a[key], b[key])) return false;
  }
  return true;
};

export function useCompanionStore(selector = (s) => s, equalityFn) {
  const compare = equalityFn ?? shallowEqual;
  const selectorRef = useRef(selector);
  const equalityRef = useRef(compare);
  const snapshotRef = useRef();

  selectorRef.current = selector;
  equalityRef.current = compare;

  const getSnapshot = useCallback(() => {
    const next = selectorRef.current(companionStore.getState());
    if (
      snapshotRef.current !== undefined &&
      equalityRef.current(snapshotRef.current, next)
    ) {
      return snapshotRef.current;
    }
    snapshotRef.current = next;
    return next;
  }, []);

  const getServerSnapshot = useCallback(
    () => selectorRef.current(initialState),
    [],
  );

  return useSyncExternalStore(
    companionStore.subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}

export function pickPreferredEvent(events) {
  const now = Date.now();
  const windowMs = 800;
  const eligible = EMOTION_PRIORITIES.map((source) => {
    const evt = events[source];
    if (!evt) return null;
    if (now - evt.ts > windowMs) return null;
    return { source, ...evt };
  }).filter(Boolean);

  if (eligible.length) {
    return eligible[0];
  }

  // fallback to newest event
  const all = Object.values(events)
    .filter(Boolean)
    .sort((a, b) => b.ts - a.ts);
  return all[0] || null;
}
