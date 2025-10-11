import React, { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030b24] text-white">
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
    </div>
  );
}

export default DashboardLayout;
