/**
 * Pure selector for the Home screen's state. Keeping the branch logic out of
 * the component makes the full quest-lifecycle matrix (0 / 1 / 16 / 20 of 20
 * complete) unit-testable without a DOM.
 */
import { dhikrForQuest, publicQuests, type Quest } from "./content";
import { suggestedQuest } from "./content/journey";
import { STRICT_CHALLENGE_QUEST_ID } from "./challenge";
import type { Lang } from "./i18n/lang";
import { localized } from "./i18n/localized";
import { dayStartOf } from "./format";
import {
  allQuestsCompleted,
  completedQuests,
  derivePracticeStats,
  pickDailyAmal,
  type PracticeEvent,
  type PracticeStats,
} from "./practice";
import type { QuestProgress } from "./db/db";

export interface DailyAmal {
  questId: string;
  /** Dhikr name for display. */
  name: string;
  target: number;
  /** Today's net count for the daily quest - fresh every day, never lifetime. */
  todayCount: number;
}

export type HomeView =
  | {
      kind: "first-visit";
      /** Suggested first amal: the smallest quest on the track's first stage. */
      questId: string;
      name: string;
      target: number;
    }
  | {
      kind: "active-quest";
      questId: string;
      name: string;
      count: number;
      target: number;
      todayTotal: number;
    }
  | {
      kind: "next-quest";
      /** Suggested next amal: the first incomplete quest on the track. */
      questId: string;
      name: string;
      target: number;
      todayTotal: number;
    }
  | {
      kind: "all-complete";
      daily: DailyAmal;
      stats: PracticeStats;
      /** Lifetime net dhikr across all quests. */
      totalDhikr: number;
      todayTotal: number;
      completedCount: number;
      questTotal: number;
    };

export interface HomeInput {
  progress: Map<string, QuestProgress>;
  events: ReadonlyArray<PracticeEvent>;
  now: number;
  /** Display language for dhikr names; defaults to English. */
  lang?: Lang;
}

export function selectHomeView(input: HomeInput): HomeView {
  const { progress, events, now, lang = "en" } = input;
  const dayStart = dayStartOf(now);
  const todayTotal = Math.max(
    0,
    events.reduce((sum, event) => (event.at >= dayStart ? sum + event.delta : sum), 0),
  );

  // Most recently active quest that is started but not complete. This
  // mirrors the original Home precedence exactly.
  let active: { quest: Quest; entry: QuestProgress } | undefined;
  for (const quest of publicQuests()) {
    const entry = progress.get(quest.id);
    if (
      entry?.startedAt &&
      !entry.completedAt &&
      (!active || entry.updatedAt > active.entry.updatedAt)
    ) {
      active = { quest, entry };
    }
  }
  if (active) {
    return {
      kind: "active-quest",
      questId: active.quest.id,
      name: localized(dhikrForQuest(active.quest).names, lang),
      count: active.entry.count,
      target: active.quest.target,
      todayTotal,
    };
  }

  if (allQuestsCompleted(progress)) {
    const completed = completedQuests(progress);
    const pick = pickDailyAmal(completed, now);
    if (pick) {
      const todayCount = Math.max(
        0,
        events.reduce(
          (sum, event) =>
            event.questId === pick.id && event.at >= dayStart
              ? sum + event.delta
              : sum,
          0,
        ),
      );
      return {
        kind: "all-complete",
        daily: {
          questId: pick.id,
          name: localized(dhikrForQuest(pick).names, lang),
          target: pick.target,
          todayCount,
        },
        stats: derivePracticeStats(events, now),
        // Quest-labeled total: Strict Challenge counts are worship but not
        // quest progress, so the reserved id stays out of this figure.
        totalDhikr: [...progress.values()].reduce(
          (sum, entry) =>
            entry.questId === STRICT_CHALLENGE_QUEST_ID
              ? sum
              : sum + entry.count,
          0,
        ),
        todayTotal,
        completedCount: completed.length,
        questTotal: publicQuests().length,
      };
    }
  }

  // The track's next suggestion powers both remaining states, so Home can
  // reach the quest in one tap fewer than routing through Explore. The
  // fallback only fires for an empty catalog, which the launch gate forbids.
  const suggested = suggestedQuest(progress) ?? publicQuests()[0];
  return progress.size > 0
    ? {
        kind: "next-quest",
        questId: suggested.id,
        name: localized(dhikrForQuest(suggested).names, lang),
        target: suggested.target,
        todayTotal,
      }
    : {
        kind: "first-visit",
        questId: suggested.id,
        name: localized(dhikrForQuest(suggested).names, lang),
        target: suggested.target,
      };
}
