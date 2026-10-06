/**
 * Pure derivations for the lifelong Amal practice layer. Everything here is
 * computed from the append-only event log and the derived questProgress
 * cache - no new event types, no extra persistence, and all of it rebuilds
 * from the event log alone.
 */
import { publicQuests, type Quest } from "./content";
import { dayKeyOrdinal, localDayKey } from "./format";
import type { QuestProgress } from "./db/db";

/** Minimal event projection the practice derivations need. */
export interface PracticeEvent {
  questId: string;
  delta: number;
  at: number;
}

export interface PracticeStats {
  /** Distinct local days with at least one count. */
  daysPracticed: number;
  /**
   * Consecutive-day run ending today or yesterday. A quiet personal signal,
   * never a streak to protect: after a missed day it simply restarts.
   */
  currentRunDays: number;
  /** Longest consecutive-day run ever recorded. */
  bestRunDays: number;
  /** Net dhikr this local month, never negative. */
  thisMonthCount: number;
  /** Net dhikr last local month, never negative. */
  lastMonthCount: number;
}

/**
 * Derives personal practice stats from the event log. Only positive counts
 * create practiced days (a lone undo never does); month totals are clamped
 * at zero because an undo may correct a count made in an earlier month.
 */
export function derivePracticeStats(
  events: ReadonlyArray<PracticeEvent>,
  now: number,
): PracticeStats {
  const dayKeys = new Set<string>();
  const monthTotals = new Map<string, number>();
  const thisMonthKey = localDayKey(now).slice(0, 7);
  const lastMonthDate = new Date(now);
  // Day 1 of the previous month via the local constructor is DST-safe.
  const lastMonthAnchor = new Date(
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth() - 1,
    1,
  );
  const lastMonthKey = `${lastMonthAnchor.getFullYear()}-${String(lastMonthAnchor.getMonth() + 1).padStart(2, "0")}`;

  for (const event of events) {
    const dayKey = localDayKey(event.at);
    if (event.delta > 0) dayKeys.add(dayKey);
    const monthKey = dayKey.slice(0, 7);
    monthTotals.set(monthKey, (monthTotals.get(monthKey) ?? 0) + event.delta);
  }

  const ordinals = [...dayKeys].map(dayKeyOrdinal).sort((a, b) => a - b);
  let bestRunDays = 0;
  let run = 0;
  let previous = Number.NaN;
  for (const ordinal of ordinals) {
    run = ordinal === previous + 1 ? run + 1 : 1;
    bestRunDays = Math.max(bestRunDays, run);
    previous = ordinal;
  }

  const ordinalSet = new Set(ordinals);
  const todayOrdinal = dayKeyOrdinal(localDayKey(now));
  // Ending yesterday still counts: the day is not over, and a morning view
  // must never read as failure for yesterday's rest.
  const anchorOrdinal = ordinalSet.has(todayOrdinal)
    ? todayOrdinal
    : ordinalSet.has(todayOrdinal - 1)
      ? todayOrdinal - 1
      : null;
  let currentRunDays = 0;
  if (anchorOrdinal !== null) {
    currentRunDays = 1;
    while (ordinalSet.has(anchorOrdinal - currentRunDays)) currentRunDays += 1;
  }

  return {
    daysPracticed: dayKeys.size,
    currentRunDays,
    bestRunDays,
    thisMonthCount: Math.max(0, monthTotals.get(thisMonthKey) ?? 0),
    lastMonthCount: Math.max(0, monthTotals.get(lastMonthKey) ?? 0),
  };
}

/** Completed quests in catalog order - the milestones of the Journey. */
export function completedQuests(
  progress: Map<string, QuestProgress>,
): Quest[] {
  return publicQuests().filter((quest) =>
    Boolean(progress.get(quest.id)?.completedAt),
  );
}

/** True only when every public quest is complete - the lifelong-practice gate. */
export function allQuestsCompleted(
  progress: Map<string, QuestProgress>,
): boolean {
  const publicQuestList = publicQuests();
  return (
    publicQuestList.length > 0 &&
    completedQuests(progress).length === publicQuestList.length
  );
}

/** Distinct dhikr with at least one completed quest - "Amals unlocked". */
export function completedDhikrCount(
  progress: Map<string, QuestProgress>,
): number {
  return new Set(completedQuests(progress).map((quest) => quest.dhikrId)).size;
}

/**
 * Deterministic daily suggestion among completed dhikr: rotate by local day,
 * stable within a day, no clock reads inside. The suggested target is the
 * smallest completed tier of that dhikr - consistency over quantity; the
 * daily practice stays at the Amal's intended count.
 */
export function pickDailyAmal(
  completed: ReadonlyArray<Quest>,
  now: number,
): Quest | null {
  const questsByDhikr = new Map<string, Quest[]>();
  for (const quest of completed) {
    const tiers = questsByDhikr.get(quest.dhikrId) ?? [];
    tiers.push(quest);
    questsByDhikr.set(quest.dhikrId, tiers);
  }
  const dhikrIds = [...questsByDhikr.keys()];
  if (dhikrIds.length === 0) return null;
  const ordinal = dayKeyOrdinal(localDayKey(now));
  const picked = questsByDhikr.get(dhikrIds[ordinal % dhikrIds.length]);
  if (!picked || picked.length === 0) return null;
  return picked.reduce((smallest, quest) =>
    quest.target < smallest.target ? quest : smallest,
  );
}
