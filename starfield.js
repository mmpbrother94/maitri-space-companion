// stars.js — MAITRI falling-star background with pause/resume + reduced-motion
(() => {
  if (window.Stars) return; // avoid double init

  // ---------- config ----------
  const CFG = {
    density: 1.0,       // 1.0 = default star count; <1 fewer, >1 more
    speed: 0.75,        // global speed multiplier (0.5 slower, 1 normal)
    color: "#ffffff",   // star color
    respectReduced: true
  };

  // allow overrides via <script src="stars.js" data-speed="0.6" data-density="1.2">
  try {
    const self = document.currentScript;
    if (self?.dataset) {
      if (self.dataset.speed)   CFG.speed   = +self.dataset.speed   || CFG.speed;
      if (self.dataset.density) CFG.density = +self.dataset.density || CFG.density;
      if (self.dataset.color)   CFG.color   = self.dataset.color;
    }
  } catch {}

  // ---------- canvas bootstrap ----------
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d", { alpha: true });
  Object.assign(c.style, {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none"
  });
  document.body.appendChild(c);

  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W = 0, H = 0;
  const resize = () => {
    W = innerWidth; H = innerHeight;
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  addEventListener("resize", resize, { passive: true });
  resize();

  // ---------- star field ----------
  const layers = [
    //    baseCountFactor        speed     size[min,max]  alpha
    { cf: 1 / 16000, speed: 0.12, size: [0.6, 1.0], alpha: 0.40 },
    { cf: 1 / 22000, speed: 0.33, size: [1.0, 1.8], alpha: 0.70 },
    { cf: 1 / 30000, speed: 0.68, size: [1.4, 2.4], alpha: 1.00 },
  ];

  let stars = [];
  function makeStar(L) {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: L.size[0] + Math.random() * (L.size[1] - L.size[0]),
      tw: Math.random() * 0.02 + 0.005,   // twinkle speed
      ph: Math.random() * Math.PI * 2,    // twinkle phase
      L
    };
  }
  function rebuild() {
    stars.length = 0;
    for (const L of layers) {
      const count = Math.max(10, Math.floor(W * H * L.cf * CFG.density));
      for (let i = 0; i < count; i++) stars.push(makeStar(L));
    }
  }
  rebuild();

  // ---------- motion preferences / lifecycle ----------
  const mql = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = CFG.respectReduced && mql.matches;
  mql.addEventListener?.("change", e => { reduced = CFG.respectReduced && e.matches; });

  let running = true;
  let hidden = document.hidden;
  document.addEventListener("visibilitychange", () => { hidden = document.hidden; });
  addEventListener("blur",  () => running && (hidden = true));
  addEventListener("focus", () => running && (hidden = false));

  // ---------- animation ----------
  const bgClear = "rgba(0,0,0,0.30)";
  const starStroke = (a) => `rgba(255,255,255,${a})`;

  const wind = () => (Math.sin(Date.now() / 4000) + 1) * 0.2; // subtle drift

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);

    // throttle drawing when tab hidden or reduced motion
    const throttle = hidden || reduced ? 4 : 1;
    if ((performance.now() | 0) % throttle !== 0) return;

    ctx.fillStyle = bgClear;
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      s.ph += s.tw;
      const twinkle = 0.6 + 0.4 * Math.abs(Math.cos(s.ph));
      const a = s.L.alpha * twinkle;

      // star head
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = CFG.color;
      ctx.fill();

      // streak
      ctx.globalAlpha = a * 0.45;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - s.r * 0.5);
      ctx.lineTo(s.x, s.y - s.r * 2.5 - s.L.speed * 2);
      ctx.strokeStyle = starStroke(0.85);
      ctx.lineWidth = Math.max(1, s.r * 0.6);
      ctx.stroke();

      // movement (skip when reduced)
      if (!reduced) {
        s.y += (s.L.speed * CFG.speed) + s.r * 0.05;
        s.x += wind() * 0.3 * s.L.speed * CFG.speed;
      }

      // wrap
      if (s.y > H + 10) { s.y = -10; s.x = Math.random() * W; }
      if (s.x < -10)  s.x = W + 10;
      if (s.x > W+10) s.x = -10;
    }
  }
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  requestAnimationFrame(frame);

  // ---------- API ----------
  window.Stars = {
    pause()  { running = false; },
    resume() { if (!running) { running = true; requestAnimationFrame(frame); } },
    toggle() { running ? this.pause() : this.resume(); },
    setSpeed(v = 0.75)  { CFG.speed = Math.max(0, +v || 0); },
    setDensity(v = 1.0) { CFG.density = Math.max(0.1, +v || 1); rebuild(); },
    setColor(col = "#fff") { CFG.color = col; },
    respectReduced(v = true) { CFG.respectReduced = !!v; reduced = v && mql.matches; },
    destroy() { running = false; c.remove(); removeEventListener("resize", resize); }
  };
})();
