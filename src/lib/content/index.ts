import { CATEGORIES } from "./categories";
import { DHIKR } from "./dhikr";
import { QUESTS } from "./quests";
import type { CategoryId, Dhikr, Quest } from "./types";

export { CATEGORIES, DHIKR, QUESTS };
export type { CategoryId, Category, Dhikr, Quest } from "./types";

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
 */
export function isQuestPublic(quest: Quest): boolean {
  return (
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

export function questTitle(quest: Quest): string {
  return `${dhikrForQuest(quest).names.en} × ${quest.target.toLocaleString("en-US")}`;
}
