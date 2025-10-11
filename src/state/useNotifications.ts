import { useMemo, useSyncExternalStore } from "react";
import { getMissionDay, formatUTC, MISSION_START_ISO } from "../utils/mission";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  ts: number;
  read: boolean;
};

type NotificationState = {
  items: NotificationItem[];
  unreadCount: number;
};

const listeners = new Set<() => void>();

const state: NotificationState = {
  items: [],
  unreadCount: 0,
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

const getId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `noti_${Math.random().toString(36).slice(2, 10)}`;
};

const MAX_ITEMS = 50;

function pushNotification(title: string, body: string, ts: number) {
  state.items = [{ id: getId(), title, body, ts, read: false }, ...state.items].slice(
    0,
    MAX_ITEMS,
  );
  state.unreadCount += 1;
  notify();
}

function markAllRead() {
  if (!state.unreadCount) return;
  state.items = state.items.map((item) =>
    item.read ? item : { ...item, read: true },
  );
  state.unreadCount = 0;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): NotificationState {
  return state;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const missionDay = getMissionDay(MISSION_START_ISO, date);
  return `Mission Day ${missionDay}, ${formatUTC(date)}`;
}

export function useNotifications() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(
    () => ({
      items: snapshot.items,
      unreadCount: snapshot.unreadCount,
      push: ({
        title,
        body,
        ts = Date.now(),
      }: {
        title: string;
        body: string;
        ts?: number;
      }) => pushNotification(title, body, ts),
      markAllRead: () => markAllRead(),
      formatTimestamp,
    }),
    [snapshot],
  );
}
