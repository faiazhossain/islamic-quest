/** Shared formatting helpers, locale-aware since the bn language shipped. */
import type { Lang } from "./i18n/lang";

const LOCALE: Record<Lang, string> = { en: "en-US", bn: "bn-BD" };

/** Counts in Bengali digits in bn mode ("১০০"), en-US otherwise. */
export const formatCount = (value: number, lang: Lang = "en"): string =>
  value.toLocaleString(LOCALE[lang]);

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

/** "Mar 5, 2026" / "৫ মার্চ, ২০২৬" style short date for cards and journey waypoints. */
export const formatShortDate = (epochMs: number, lang: Lang = "en"): string =>
  new Date(epochMs).toLocaleDateString(LOCALE[lang], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/**
 * Converts ASCII digits inside a citation string to Bengali digits in bn
 * mode ("6307" -> "৬৩০৭"); other characters (letters in "596a") pass
 * through, since the letter is part of the citation's own identity.
 */
export const toBnDigits = (text: string): string =>
  text.replace(/[0-9]/g, (digit) => BN_DIGITS[Number(digit)]);
