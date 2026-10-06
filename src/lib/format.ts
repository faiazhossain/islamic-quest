/** Shared formatting helpers (en-US now; the active locale can be threaded in when i18n ships). */

export const formatCount = (value: number): string => value.toLocaleString("en-US");

/** Epoch ms for local midnight of the day containing epochMs. */
export const dayStartOf = (epochMs: number): number => {
  const date = new Date(epochMs);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/** Epoch ms for local midnight of today. */
export const todayStart = (): number => dayStartOf(Date.now());

/**
 * Stable local calendar-day key "YYYY-MM-DD" for any epoch ms. Built from
 * local date parts rather than ms arithmetic, so DST shifts and 23/25-hour
 * days cannot merge or split practice days.
 */
export const localDayKey = (epochMs: number): string => {
  const date = new Date(epochMs);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Days-since-epoch ordinal of a local day key. Calendar parts are evaluated
 * at UTC noon, so consecutive keys stay consecutive across DST transitions.
 */
export const dayKeyOrdinal = (key: string): number => {
  const [year, month, day] = key.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day, 12) / 86_400_000);
};

/** "Mar 5, 2026" style short date for cards and journey waypoints. */
export const formatShortDate = (epochMs: number): string =>
  new Date(epochMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
