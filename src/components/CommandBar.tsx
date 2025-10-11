import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { getMissionDay, formatUTC, MISSION_START_ISO } from "../utils/mission";
import Bell from "./Bell";
import GlobalSearch, { GlobalSearchHandle } from "./GlobalSearch";

const NAV_ITEMS = [
  { label: "Home", href: "/", end: true },
  { label: "Dashboard", href: "/dashboard", end: true },
  { label: "Detection", href: "/dashboard/emotions", end: true },
  { label: "Interventions", href: "/dashboard/interventions" },
  { label: "Reports", href: "/dashboard/reports" },
];

const COMMAND_ACTIONS = [
  {
    id: "emotion-scan",
    title: "Emotion Scan",
    description: "Launch real-time affect detection",
  },
  {
    id: "plan-schedule",
    title: "Plan Schedule",
    description: "Balance tasks with recovery",
  },
  {
    id: "capture-insight",
    title: "Capture Insight",
    description: "Log notes for mission support",
  },
];

const dispatchCommand = (type: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("MAITRI:command", {
      detail: { type },
    }),
  );
};

const CommandBar: React.FC = () => {
  const [now, setNow] = useState(() => new Date());
  const searchRef = useRef<GlobalSearchHandle | null>(null);
  const pendingShortcut = useRef<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || target?.isContentEditable;
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (event.key === "Escape") {
        searchRef.current?.close();
        pendingShortcut.current = 0;
        return;
      }
      if (event.key.toLowerCase() === "g" && !isTyping) {
        pendingShortcut.current = Date.now();
        return;
      }
      const last = pendingShortcut.current;
      if (last && Date.now() - last < 1200 && !isTyping) {
        switch (event.key.toLowerCase()) {
          case "d":
            event.preventDefault();
            navigate("/dashboard");
            break;
          case "e":
            event.preventDefault();
            navigate("/dashboard/emotions");
            break;
          case "i":
            event.preventDefault();
            navigate("/dashboard/interventions");
            break;
          case "r":
            event.preventDefault();
            navigate("/dashboard/reports");
            break;
          default:
            break;
        }
        pendingShortcut.current = 0;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  const missionDay = useMemo(() => getMissionDay(MISSION_START_ISO, now), [now]);
  const utc = useMemo(() => `${formatUTC(now)} UTC`, [now]);

  const handleAction = (id: string) => {
    switch (id) {
      case "emotion-scan":
        dispatchCommand("emotion-scan");
        break;
      case "plan-schedule":
        navigate("/dashboard/reports/calendar");
        break;
      case "capture-insight":
        navigate("/dashboard/reports");
        break;
      default:
        break;
    }
  };

  return (
    <header className="relative z-10 mb-10 space-y-6">
      <div className="flex flex-col gap-6 rounded-3xl border border-white/12 bg-slate-950/80 px-6 py-6 shadow-[0_35px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          <div className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-2xl font-black text-slate-900 shadow-[0_18px_40px_rgba(59,130,246,0.45)]">
            M
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border border-white/40 bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.85)]" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300/80">
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                Online
              </span>
              <span className="rounded-full bg-slate-900/60 px-3 py-1 text-cyan-200">
                Mission Day {missionDay}
              </span>
              <span className="text-slate-300">{utc}</span>
            </div>
            <p className="text-xl font-semibold tracking-[0.2em] text-white uppercase">
              Maitri Command
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              aria-label={`Navigate to ${item.label}`}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  isActive
                    ? "border-sky-400/60 bg-sky-500/20 text-white shadow-[0_0_30px_rgba(56,189,248,0.45)]"
                    : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-sky-400/40 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <GlobalSearch ref={searchRef} />
          <button
            type="button"
            aria-label="Open settings"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-sky-100 shadow-[0_14px_32px_rgba(59,130,246,0.35)] transition hover:border-sky-400/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/70"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <Bell />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COMMAND_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleAction(action.id)}
            aria-label={action.title}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 px-5 py-6 text-left shadow-[0_30px_60px_rgba(15,23,42,0.45)] transition hover:border-sky-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/80"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/15 via-transparent to-purple-500/10 blur-md" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
              {action.title}
            </p>
            <p className="mt-3 text-sm text-slate-300">{action.description}</p>
          </button>
        ))}
      </div>
    </header>
  );
};

export default CommandBar;
