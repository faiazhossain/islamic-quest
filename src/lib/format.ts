/** Shared formatting helpers (en-US now; the active locale can be threaded in when i18n ships). */

export const formatCount = (value: number): string => value.toLocaleString("en-US");

/** Epoch ms for local midnight of today. */
export const todayStart = (): number => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/** "Mar 5, 2026" style short date for cards and journey waypoints. */
export const formatShortDate = (epochMs: number): string =>
  new Date(epochMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
