export const MISSION_START_ISO = "2025-01-01T00:00:00Z";

export function getMissionDay(startIso: string = MISSION_START_ISO, now: Date = new Date()): number {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return 1;
  }

  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, day + 1);
}

export function formatUTC(now: Date = new Date()): string {
  return now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
