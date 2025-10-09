import React, { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from "react";
import PropTypes from "prop-types";

/**
 * Starfield (falling stars) — React (plain JS) version
 * - No TypeScript syntax to avoid parser errors in non-TS builds.
 * - Fullscreen canvas background by default; works inside any container when `fullscreen={false}`.
 * - Imperative API via ref: pause(), resume(), toggle(), setSpeed(), setDensity(), setColor(), setRespectReduced(), destroy()
 * - Respects prefers-reduced-motion if enabled (configurable).
 *
 * Usage:
 *   <Starfield density={1} speed={0.75} color="#ffffff" />
 *
 * NOTE: If you use SSR, render this component client-side only, or guard for `window`.
 */

const Starfield = forwardRef(function Starfield(
  {
    density = 1.0,
    speed = 0.75,
    color = "#ffffff",
    respectReduced = true,
    className = "fixed inset-0 -z-10 pointer-events-none ",
    style,
    fullscreen = true,
  },
  ref
) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(null);

  // Config state (mutable ref so we don't restart animation on every prop change)
  const cfgRef = useRef({ density, speed, color, respectReduced });
  useEffect(() => { cfgRef.current.density = density; rebuild(); }, [density]);
  useEffect(() => { cfgRef.current.speed = speed; }, [speed]);
  useEffect(() => { cfgRef.current.color = color; }, [color]);
  useEffect(() => { cfgRef.current.respectReduced = respectReduced; setReduced(getPrefersReduced() && respectReduced); }, [respectReduced]);

  // Layer setup
  const layers = useMemo(() => ([
    { cf: 1 / 16000, speed: 0.12, size: [0.6, 1.0], alpha: 0.40 },
    { cf: 1 / 22000, speed: 0.33, size: [1.0, 1.8], alpha: 0.70 },
    { cf: 1 / 30000, speed: 0.68, size: [1.4, 2.4], alpha: 1.00 },
  ]), []);

  const starsRef = useRef([]);
  const dprRef = useRef(1);
  const sizeRef = useRef({ w: 0, h: 0 });
  const [, setTick] = useState(0); // for visibility/reduced updates

  // --- Environment guards ---
  function hasWindow() { return typeof window !== "undefined" && typeof document !== "undefined"; }
  function getPrefersReduced() {
    if (!hasWindow() || !window.matchMedia) return false;
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
  }

  const [reduced, setReduced] = useState(getPrefersReduced() && respectReduced);

  // react to reduced-motion changes
  useEffect(() => {
    if (!hasWindow() || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(cfgRef.current.respectReduced && !!e.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange); // older Safari
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);

  // Page visibility throttling
  const hiddenRef = useRef(hasWindow() ? document.hidden : false);
  useEffect(() => {
    if (!hasWindow()) return;
    const onVis = () => { hiddenRef.current = document.hidden; setTick(t => t + 1); };
    const onBlur = () => { hiddenRef.current = true; };
    const onFocus = () => { hiddenRef.current = false; };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  function resize() {
    const canvas = canvasRef.current;
    if (!canvas || !hasWindow()) return;

    const rect = fullscreen
      ? { width: window.innerWidth, height: window.innerHeight }
      : (canvas.parentElement && canvas.parentElement.getBoundingClientRect()) || { width: window.innerWidth, height: window.innerHeight };

    const w = Math.max(1, Math.floor(rect.width || 1));
    const h = Math.max(1, Math.floor(rect.height || 1));
    sizeRef.current.w = w; sizeRef.current.h = h;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    dprRef.current = dpr;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;
  }

  function makeStar(L) {
    const { w, h } = sizeRef.current;
    const r = L.size[0] + Math.random() * (L.size[1] - L.size[0]);
    return { x: Math.random() * w, y: Math.random() * h, r, tw: Math.random() * 0.02 + 0.005, ph: Math.random() * Math.PI * 2, L };
  }

  function rebuild() {
    const { w, h } = sizeRef.current;
    if (!w || !h) return;
    const stars = starsRef.current;
    stars.length = 0;
    for (const L of layers) {
      const count = Math.max(10, Math.floor(w * h * L.cf * (cfgRef.current.density || 1)));
      for (let i = 0; i < count; i++) stars.push(makeStar(L));
    }
  }

  const runningRef = useRef(true);
  const bgClear = "rgba(0,0,0,0.30)";
  const wind = () => (Math.sin(Date.now() / 4000) + 1) * 0.2; // subtle drift

  function drawFrame() {
    if (!runningRef.current) return;
    rafRef.current = hasWindow() ? window.requestAnimationFrame(drawFrame) : null;

    const ctx = ctxRef.current;
    if (!ctx) return;

    // throttle when hidden or reduced motion preferred
    const throttle = (hiddenRef.current || reduced) ? 4 : 1;
    if ((performance.now() | 0) % throttle !== 0) return;

    const { w, h } = sizeRef.current;
    ctx.fillStyle = bgClear;
    ctx.fillRect(0, 0, w, h);

    for (const s of starsRef.current) {
      s.ph += s.tw;
      const twinkle = 0.6 + 0.4 * Math.abs(Math.cos(s.ph));
      const a = (s.L.alpha) * twinkle;

      // star head
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = cfgRef.current.color || "#fff";
      ctx.fill();

      // streak
      ctx.globalAlpha = a * 0.45;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - s.r * 0.5);
      ctx.lineTo(s.x, s.y - s.r * 2.5 - s.L.speed * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = Math.max(1, s.r * 0.6);
      ctx.stroke();

      // movement (skip when reduced motion preferred)
      if (!reduced) {
        s.y += (s.L.speed * (cfgRef.current.speed || 1)) + s.r * 0.05;
        s.x += wind() * 0.3 * s.L.speed * (cfgRef.current.speed || 1);
      }

      // wrap
      if (s.y > h + 10) { s.y = -10; s.x = Math.random() * w; }
      if (s.x < -10)  s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
    }
  }

  // Mount / unmount
  useEffect(() => {
    if (!hasWindow()) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    resize();
    const ctx = ctxRef.current;
    if (ctx) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, sizeRef.current.w, sizeRef.current.h); }

    rebuild();
    const onResize = () => { resize(); rebuild(); };
    window.addEventListener("resize", onResize, { passive: true });

    runningRef.current = true;
    rafRef.current = window.requestAnimationFrame(drawFrame);

    return () => {
      runningRef.current = false;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Imperative API (fixed: no `this` usage inside methods)
  useImperativeHandle(ref, () => ({
    pause() {
      runningRef.current = false;
      if (rafRef.current) { if (hasWindow()) window.cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    },
    resume() {
      if (!runningRef.current) {
        runningRef.current = true;
        if (hasWindow()) rafRef.current = window.requestAnimationFrame(drawFrame);
      }
    },
    toggle() {
      if (runningRef.current) this.pause(); else this.resume();
    },
    setSpeed(v = 0.75) { cfgRef.current.speed = Math.max(0, +v || 0); },
    setDensity(v = 1.0) { cfgRef.current.density = Math.max(0.1, +v || 1); rebuild(); },
    setColor(col = "#fff") { cfgRef.current.color = col; },
    setRespectReduced(v = true) { cfgRef.current.respectReduced = !!v; setReduced(v && getPrefersReduced()); },
    destroy() {
      runningRef.current = false;
      if (rafRef.current && hasWindow()) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    },
  }), []);

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ pointerEvents: "none", ...style }}
      aria-hidden
    />
  );
});

Starfield.propTypes = {
  density: PropTypes.number,
  speed: PropTypes.number,
  color: PropTypes.string,
  respectReduced: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  fullscreen: PropTypes.bool,
};

export default Starfield;
