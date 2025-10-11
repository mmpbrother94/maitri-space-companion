import React, { useEffect, useMemo, useRef, useState } from "react";
import { BellRing } from "lucide-react";
import { useNotifications } from "../state/useNotifications";

const MAX_DISPLAY = 10;

function useOutsideClick(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

const Bell: React.FC = () => {
  const { items, unreadCount, markAllRead, formatTimestamp } = useNotifications();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevUnreadRef = useRef(unreadCount);

  useOutsideClick(containerRef, () => setOpen(false));

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setPulse(true);
      const timer = window.setTimeout(() => setPulse(false), 600);
      prevUnreadRef.current = unreadCount;
      return () => window.clearTimeout(timer);
    }
    prevUnreadRef.current = unreadCount;
    return undefined;
  }, [unreadCount]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [open]);

  const visibleItems = useMemo(
    () => items.slice(0, MAX_DISPLAY),
    [items],
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={
          unreadCount
            ? `${unreadCount} unread notifications`
            : "No unread notifications"
        }
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-sky-100 shadow-[0_14px_32px_rgba(8,145,178,0.35)] transition hover:border-sky-400/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/70"
        onClick={() => setOpen((value) => !value)}
      >
        <BellRing className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold text-emerald-900 shadow-[0_0_8px_rgba(16,185,129,0.85)] transition ${
              pulse ? "animate-pulse" : ""
            }`}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-80 rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-[0_30px_70px_rgba(15,23,42,0.65)] backdrop-blur-2xl"
          role="dialog"
          aria-label="Notification center"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Alerts
            </p>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/80"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {visibleItems.length ? (
              visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-slate-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{item.body}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    {formatTimestamp(item.ts)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                You are all caught up.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bell;
