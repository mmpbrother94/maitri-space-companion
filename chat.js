// chat.js — MAITRI accessible chat widget (single include for all pages)
// Now with Stars.pause()/resume() hooks (if stars.js is present)
(() => {
  if (window.MaitriChat) return; // prevent double-inject

  const ID = "maitri-chat";
  const qs = (sel, el = document) => el.querySelector(sel);

  // ------- create UI -------
  const btn = document.createElement("button");
  btn.id = `${ID}-btn`;
  btn.className = "btn btn-primary";
  btn.title = "MAITRI Companion";
  btn.setAttribute("aria-haspopup", "dialog");
  btn.style.cssText =
    "position:fixed;right:22px;bottom:22px;border:none;border-radius:50%;width:58px;height:58px;z-index:70";
  btn.textContent = "💬";

  const pane = document.createElement("div");
  pane.id = `${ID}-pane`;
  pane.className = "panel";
  pane.setAttribute("role", "dialog");
  pane.setAttribute("aria-modal", "true");
  pane.setAttribute("aria-labelledby", `${ID}-title`);
  pane.setAttribute("aria-describedby", `${ID}-log`);
  pane.style.cssText =
    "position:fixed;right:22px;bottom:90px;width:360px;max-height:70vh;display:none;z-index:70";

  pane.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px">
        <div class="badge">🧠</div>
        <strong id="${ID}-title">MAITRI Companion</strong>
      </div>
      <button id="${ID}-close" class="btn btn-ghost" aria-label="Close chat">×</button>
    </div>
    <div id="${ID}-log" style="overflow:auto;height:300px;font-size:14px" aria-live="polite" aria-atomic="false">
      <div><em>👋 Namaste, Commander. I can chat like family, track vitals, and suggest interventions.</em></div>
    </div>
    <div id="${ID}-chips" class="chips" style="margin-top:8px"></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <input id="${ID}-input" placeholder="Type a message…" autocomplete="off"
             style="flex:1;border-radius:12px;border:1px solid var(--stroke);padding:10px;background:transparent;color:#fff">
      <button id="${ID}-send" class="btn btn-primary">Send</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(pane);

  // ------- elements -------
  const closeBtn = qs(`#${ID}-close`, pane);
  const log = qs(`#${ID}-log`, pane);
  const chipsWrap = qs(`#${ID}-chips`, pane);
  const input = qs(`#${ID}-input`, pane);
  const sendBtn = qs(`#${ID}-send`, pane);

  // ------- state / config -------
  let lastFocus = null;
  let presets = ["I'm stressed", "I miss my family", "I can't sleep"];

  // ------- helpers -------
  function renderChips() {
    chipsWrap.innerHTML = "";
    presets.forEach((txt) => {
      const b = document.createElement("button");
      b.className = "chipbtn";
      b.textContent = txt;
      b.style.cssText =
        "border-radius:999px;padding:8px 12px;border:1px solid var(--stroke);background:linear-gradient(180deg, var(--glass), var(--glass2));cursor:pointer";
      b.addEventListener("click", () => {
        input.value = txt;
        sendNow();
      });
      chipsWrap.appendChild(b);
    });
  }
  renderChips();

  function push(sender, text) {
    const d = document.createElement("div");
    d.style.margin = "6px 0";
    d.innerHTML = sender + ": " + text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function typing() {
    const dot = document.createElement("div");
    dot.id = `${ID}-typing`;
    dot.style.opacity = ".8";
    dot.innerHTML = "<em>MAITRI is typing…</em>";
    log.appendChild(dot);
    log.scrollTop = log.scrollHeight;
    return dot;
  }

  // simple demo replies (you can override with MaitriChat.setReplies)
  let replyFn = (t) => {
    t = t.toLowerCase();
    if (t.includes("stress")) return "Breathing 5 min + Mindfulness 10 min are recommended. Start session?";
    if (t.includes("family") || t.includes("home"))
      return "I am here with you. Want me to play a family-style message and soft music?";
    if (t.includes("sleep"))
      return "Target 7–8h sleep. I can dim UI and queue a soundscape.";
    if (t.includes("scan") || t.includes("detect"))
      return "Opening Emotion Detection… (or say ‘cancel’)";
    return "Logged. I can also open Interventions or start an Emotion Scan.";
  };

  // ------- focus trap / open / close -------
  function trap(e) {
    if (e.key !== "Tab") return;
    const f = pane.querySelectorAll(
      'button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'
    );
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  function escClose(e) { if (e.key === "Escape") toggle(false); }

  function open() {
    if (pane.style.display !== "none") return;
    lastFocus = document.activeElement;
    pane.style.display = "block";
    pane.style.opacity = "0";
    pane.animate(
      [{ transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
      { duration: 220, easing: "ease-out" }
    ).onfinish = () => (pane.style.opacity = "1");
    document.addEventListener("keydown", trap);
    document.addEventListener("keydown", escClose);
    // Pause stars while chat is open (if stars.js loaded)
    try { window.Stars && window.Stars.pause && window.Stars.pause(); } catch {}
    setTimeout(() => input.focus(), 0);
  }
  function close() {
    if (pane.style.display === "none") return;
    pane.animate(
      [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(20px)", opacity: 0 }],
      { duration: 180, easing: "ease-in" }
    ).onfinish = () => (pane.style.display = "none");
    document.removeEventListener("keydown", trap);
    document.removeEventListener("keydown", escClose);
    // Resume stars when chat closes (if stars.js loaded)
    try { window.Stars && window.Stars.resume && window.Stars.resume(); } catch {}
    if (lastFocus) lastFocus.focus();
  }
  function toggle(force) {
    const openNow = force === undefined ? pane.style.display === "none" : force;
    openNow ? open() : close();
  }

  // ------- send / reply -------
  function sendNow() {
    const val = input.value.trim();
    if (!val) return;
    push("<strong>You</strong>", val);
    input.value = "";
    const tip = typing();
    setTimeout(() => {
      tip.remove();
      const r = replyFn(val);
      push("<strong>MAITRI</strong>", r);
      log.scrollTop = log.scrollHeight;
    }, 700);
  }

  // ------- events -------
  btn.addEventListener("click", () => toggle(true));
  closeBtn.addEventListener("click", () => toggle(false));
  sendBtn.addEventListener("click", sendNow);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendNow(); });

  // ------- API -------
  window.MaitriChat = {
    open, close, toggle,
    send: (text) => { input.value = text || ""; sendNow(); },
    announce: (text) => push("<strong>MAITRI</strong>", text),
    setReplies: (fn) => { if (typeof fn === "function") replyFn = fn; },
    setChips: (arr) => {
      if (Array.isArray(arr)) { presets = arr; renderChips(); }
    },
    setPosition: ({ right = 22, bottom = 22 } = {}) => {
      btn.style.right = `${right}px`;
      btn.style.bottom = `${bottom}px`;
      pane.style.right = `${right}px`;
      pane.style.bottom = `${bottom + 68}px`;
    }
  };
})();
