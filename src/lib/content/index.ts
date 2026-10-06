import { CATEGORIES } from "./categories";
import { DHIKR } from "./dhikr";
import { HADITH } from "./hadith";
import { QUESTS } from "./quests";
import type { CategoryId, Dhikr, HadithEntry, HadithTheme, Quest } from "./types";

export { CATEGORIES, DHIKR, HADITH, QUESTS };
export type { CategoryId, Category, Dhikr, HadithEntry, HadithTheme, Quest } from "./types";

const dhikrById = new Map(DHIKR.map((dhikr) => [dhikr.id, dhikr]));

export const getDhikr = (id: string): Dhikr | undefined => dhikrById.get(id);

export const dhikrForQuest = (quest: Quest): Dhikr => {
  const dhikr = getDhikr(quest.dhikrId);
  if (!dhikr) {
    throw new Error(`Quest ${quest.id} references unknown dhikr ${quest.dhikrId}`);
  }
  return dhikr;
};

/**
 * Launch gate: a quest is public in production only when its dhikr has
 * passed scholar review. Draft content stays visible in development.
 *
 * A deliberate staging deploy can set NEXT_PUBLIC_ALLOW_UNREVIEWED=1 to
 * publish the whole catalog before review completes. The quest page
 * still labels unreviewed dhikr honestly ("scholar review pending"),
 * so staging never presents unreviewed content as reviewed. NEXT_PUBLIC_
 * is required because this gate also runs in client bundles, where only
 * prefixed variables are inlined. Read at call time, like NODE_ENV.
 */
export function isQuestPublic(quest: Quest): boolean {
  return (
    process.env.NEXT_PUBLIC_ALLOW_UNREVIEWED === "1" ||
    process.env.NODE_ENV !== "production" ||
    dhikrForQuest(quest).review.status === "reviewed"
  );
}

export function publicQuests(): Quest[] {
  return QUESTS.filter(isQuestPublic);
}

export function questsForCategory(category: CategoryId): Quest[] {
  return publicQuests().filter((quest) => dhikrForQuest(quest).category === category);
}

export function getQuest(id: string): Quest | undefined {
  return QUESTS.find((quest) => quest.id === id);
}

/** A quest by id, but only when it is public in the current environment. */
export function getPublicQuest(id: string): Quest | undefined {
  const quest = getQuest(id);
  return quest && isQuestPublic(quest) ? quest : undefined;
}

/**
 * Build-time tripwire: refuses a production build while no quest has
 * passed scholar review, so an empty catalog can never deploy silently.
 * Deliberate staging deploys can opt out with NEXT_PUBLIC_ALLOW_UNREVIEWED=1
 * (the same flag that publishes the unreviewed catalog in staging).
 */
export function assertLaunchReady(): void {
  if (
    process.env.NODE_ENV === "production" &&
    publicQuests().length === 0 &&
    process.env.NEXT_PUBLIC_ALLOW_UNREVIEWED !== "1"
  ) {
    throw new Error(
      "Launch gate: every dhikr is still awaiting scholar review " +
        "(review.status in src/lib/content/dhikr.ts). A production build " +
        "would ship an empty catalog. Flip statuses after review, or set " +
        "NEXT_PUBLIC_ALLOW_UNREVIEWED=1 for a deliberate staging deploy.",
    );
  }
}

export function questTitle(quest: Quest): string {
  return `${dhikrForQuest(quest).names.en} × ${quest.target.toLocaleString("en-US")}`;
}

const THEME_ORDER: Record<HadithTheme, number> = {
  "prophets-practice": 0,
  reward: 1,
  occasion: 2,
};

/**
 * Guidance hadith for one amal, ordered prophets-practice -> reward ->
 * occasion. Stable sort keeps authored order within a theme.
 *
 * Same environment gate philosophy as isQuestPublic: an entry still
 * awaiting citation verification (review.status "draft") never ships to
 * production, while development and deliberate staging deploys
 * (NEXT_PUBLIC_ALLOW_UNREVIEWED=1) show the full set for review.
 */
export function hadithForDhikr(dhikrId: string): HadithEntry[] {
  const entries = HADITH.filter((entry) => entry.dhikrIds.includes(dhikrId));
  if (
    process.env.NEXT_PUBLIC_ALLOW_UNREVIEWED === "1" ||
    process.env.NODE_ENV !== "production"
  ) {
    return entries.sort((a, b) => THEME_ORDER[a.theme] - THEME_ORDER[b.theme]);
  }
  return entries
    .filter((entry) => entry.review.status !== "draft")
    .sort((a, b) => THEME_ORDER[a.theme] - THEME_ORDER[b.theme]);
}
