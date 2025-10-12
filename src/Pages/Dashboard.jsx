import React, { useEffect, useMemo, useState, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Home,
  LayoutDashboard,
  Radar,
  ScanLine,
  Search,
  Sparkles,
} from "lucide-react";
import { companionStore, useCompanionStore } from "../components/Companion";

const NAV_LINKS = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", end: true },
  { name: "Detection", icon: Radar, href: "/dashboard/emotions" },
  { name: "Interventions", icon: HeartPulse, href: "/dashboard/interventions" },
  { name: "Reports", icon: BarChart3, href: "/dashboard/reports" },
];

const QUICK_ACTIONS = [
  {
    label: "Emotion Scan",
    description: "Launch real-time affect detection",
    icon: ScanLine,
    href: "/dashboard/emotions",
  },
  {
    label: "Plan Schedule",
    description: "Balance tasks with recovery",
    icon: CalendarDays,
    href: "/dashboard/reports/calendar",
  },
  {
    label: "Capture Insight",
    description: "Log notes for mission support",
    icon: ClipboardList,
    href: "/dashboard/reports",
  },
];

function DashboardLayout() {
  const drawerOpen = useCompanionStore((s) => s.drawerOpen);
  const outletContext = useMemo(
    () => ({
      chatOpen: drawerOpen,
      setChatOpen: companionStore.setOpen,
    }),
    [drawerOpen],
  );

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const location = useLocation();

  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "maitri",
      text: "👋 Namaste, Commander. I can chat, track vitals, and suggest interventions.",
    },
  ]);
  const [input, setInput] = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Chatbot effects
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, chatOpen]);

  const missionClock = useMemo(() => {
    const options = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return currentTime.toLocaleTimeString(undefined, options);
  }, [currentTime]);

  const missionDate = useMemo(() => {
    const options = { month: "short", day: "numeric", weekday: "short" };
    return currentTime.toLocaleDateString(undefined, options);
  }, [currentTime]);

  const missionDay = useMemo(() => {
    const missionStart = new Date("2025-01-01T00:00:00Z");
    const diff = currentTime.getTime() - missionStart.getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
  }, [currentTime]);

  const isDetectionRoute = location.pathname.startsWith("/dashboard/emotions");

  // Chatbot functions
  function replyTo(t) {
    const text = t.toLowerCase();
    if (text.includes("stress"))
      return "Breathing 5 min + Mindfulness 10 min are recommended. Start session?";
    if (text.includes("family") || text.includes("home"))
      return "I'm here with you. Want me to play a family-style message and soft music?";
    if (text.includes("sleep"))
      return "Target 7–8h sleep. I can dim UI and queue a soundscape.";
    return "Logged. I can also open Interventions or start an Emotion Scan.";
  }

  function sendMessage(msg) {
    if (!msg) return;
    setMessages((m) => [...m, { from: "you", text: msg }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "maitri", text: replyTo(msg) }]);
    }, 700);
  }

  const chips = ["I'm stressed", "I miss my family", "I can't sleep"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030b24] text-white">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(56, 189, 248, 0.3); }
          50% { opacity: 1; box-shadow: 0 0 40px rgba(56, 189, 248, 0.6); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes typing-dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in 0.4s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        
        .gradient-text {
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-nav {
          background: linear-gradient(145deg, rgba(15,23,42,0.8), rgba(30,41,59,0.8));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(56,189,248,0.2);
        }
        
        .glass-chat {
          background: linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(56,189,248,0.3);
        }
        
        .nav-link {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #38bdf8, #0ea5e9);
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after,
        .nav-link-active::after {
          width: 100%;
        }
        
        .chat-message {
          animation: slide-up 0.3s ease-out;
        }
        
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(15,23,42,0) 0%,
            rgba(56,189,248,0.15) 50%,
            rgba(15,23,42,0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite linear;
        }
        
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 8s ease-in-out infinite;
        }
        
        .glow-button {
          position: relative;
          overflow: hidden;
        }
        
        .glow-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .glow-button:hover::before {
          width: 300px;
          height: 300px;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_65%)] opacity-80" />
      <div className="pointer-events-none absolute bottom-[-26rem] left-1/2 h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_70%)]" />
      <div className="relative flex min-h-screen w-full flex-col px-0 pb-16 pt-4 lg:px-0">
        {!isDetectionRoute && (
          <nav className="relative mb-12 overflow-hidden rounded-3xl border border-white/12 bg-slate-950/80 px-6 py-7 shadow-[0_35px_90px_rgba(15,23,42,0.55)] backdrop-blur-[18px]">
            <div className="pointer-events-none absolute -left-32 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.4),transparent_70%)] blur-3xl opacity-60" />
            <div className="pointer-events-none absolute -right-44 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.35),transparent_70%)] blur-3xl opacity-70" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            <div className="relative flex flex-col gap-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-2xl font-black text-slate-900 shadow-[0_18px_40px_rgba(59,130,246,0.45)]">
                    M
                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border border-white/40 bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.85)]" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xl font-semibold tracking-[0.2em] text-white uppercase">
                      Maitri Command
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300/80">
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        Online
                      </span>
                      <span className="rounded-full bg-slate-900/60 px-3 py-1 text-cyan-200">
                        Mission Day {missionDay}
                      </span>
                      <span className="text-slate-300">{missionDate}</span>
                      <span className="text-sky-200">{missionClock}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 shadow-[0_10px_25px_rgba(15,23,42,0.45)] focus-within:border-sky-400/50 sm:w-72">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="search"
                      placeholder="Search support, crew, or telemetry..."
                      className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-sky-100 shadow-[0_14px_32px_rgba(59,130,246,0.35)] transition hover:border-sky-400/50 hover:text-white"
                      aria-label="Show highlights"
                    >
                      <Sparkles className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-sky-100 shadow-[0_14px_32px_rgba(8,145,178,0.35)] transition hover:border-sky-400/50 hover:text-white"
                      aria-label="View notifications"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white shadow-[0_0_8px_rgba(244,63,94,0.7)]">
                        3
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {NAV_LINKS.map(({ name, icon: Icon, href, end }) => (
                  <NavLink
                    key={name}
                    to={href}
                    end={end}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "border-sky-400/70 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-fuchsia-500/20 text-white shadow-[0_0_25px_rgba(14,165,233,0.45)]"
                          : "border-white/10 text-slate-300 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
                      }`
                    }
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/70 text-sky-300 transition-colors duration-300 group-hover:text-sky-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    {name}
                  </NavLink>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {QUICK_ACTIONS.map(({ label, description, icon: Icon, href }) => (
                  <NavLink
                    key={label}
                    to={href}
                    className="group flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/70 px-5 py-4 text-left shadow-[0_18px_45px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-sky-400/40 hover:bg-slate-900/80"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-slate-300 mt-1">{description}</p>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/30 to-indigo-500/30 text-sky-200 shadow-[0_12px_25px_rgba(59,130,246,0.35)] transition group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
        )}
        <main className="flex-1 pb-10">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        aria-label="Open MAITRI Companion"
        className="fixed right-14 bottom-14 z-50 w-32 h-32 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 cursor-pointer"
      >
        <img src="/discord-clyde-bot.gif" alt="" />
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed right-8 bottom-4 z-50">
          <img
            src="/pom-bot-creatives.gif"
            alt=""
            className="absolute -z-20 -top-36 right-48 animate-slide-in"
          />
          <div className="z-50 w-96 max-h-[75vh] glass-chat rounded-2xl p-5 shadow-2xl flex flex-col animate-slide-in">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="text-2xl animate-float">🫶</div>
                <div>
                  <strong className="gradient-text text-lg">
                    MAITRI Companion
                  </strong>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    Online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white text-2xl transition-colors hover:rotate-90 duration-300 cursor-pointer"
              >
                ✖
              </button>
            </div>

            {/* Messages */}
            <div
              ref={logRef}
              className="overflow-auto flex-1 text-sm space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`chat-message flex ${
                    m.from === "you" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      m.from === "you"
                        ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg"
                        : "glass-nav text-slate-100 border border-slate-700/50"
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1 font-semibold">
                      {m.from === "you" ? "You" : "MAITRI"}
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: m.text }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Reply Chips */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => sendMessage(c)}
                  className="glass-nav px-3 py-1.5 rounded-full text-xs font-semibold text-cyan-400 hover:bg-slate-700/50 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-500/60 hover:scale-105"
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage(input);
                }}
                className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Type a message…"
              />
              <button
                onClick={() => sendMessage(input)}
                className="glow-button bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 px-5 py-3 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="relative z-10">Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;