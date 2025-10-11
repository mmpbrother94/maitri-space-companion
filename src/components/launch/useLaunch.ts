import React from "react";
import { useCallback, useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import RocketLaunch from "./RocketLaunch";

type LaunchOptions = {
  onDone?: () => void;
  timeoutMs?: number;
};

type Listener = (playing: boolean) => void;

let playing = false;
let container: HTMLDivElement | null = null;
let root: Root | null = null;

const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener(playing));
};

const cleanup = () => {
  if (root) {
    root.unmount();
    root = null;
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  container = null;
  playing = false;
  notify();
};

export function useLaunch(): { play: (opts?: LaunchOptions) => void; isPlaying: boolean } {
  const [isPlaying, setIsPlaying] = useState<boolean>(playing);

  useEffect(() => {
    const listener: Listener = (value) => setIsPlaying(value);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const play = useCallback((opts?: LaunchOptions) => {
    const { onDone, timeoutMs = 2400 } = opts || {};
    if (typeof window === "undefined" || typeof document === "undefined") {
      onDone?.();
      return;
    }

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReduced) {
      onDone?.();
      return;
    }

    if (playing) {
      return;
    }

    playing = true;
    notify();

    try {
      container = document.createElement("div");
      document.body.appendChild(container);
      root = createRoot(container);

      let resolved = false;
      const handleDone = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        onDone?.();
      };

      root.render(
        React.createElement(RocketLaunch, {
          timeout: timeoutMs,
          onDone: handleDone,
        }),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[MAITRI] Rocket launch animation failed", error);
      cleanup();
      onDone?.();
    }
  }, []);

  return { play, isPlaying };
}
