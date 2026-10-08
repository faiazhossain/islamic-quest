import { describe, expect, it } from "vitest";
import { publicQuests } from "./index";
import {
  stageProgress,
  suggestedQuest,
  trackQuests,
  trackStages,
} from "./journey";
import type { QuestProgress } from "../db/db";

const entry = (
  questId: string,
  fields: Partial<QuestProgress> = {},
): [string, QuestProgress] => [
  questId,
  {
    questId,
    count: fields.count ?? 0,
    startedAt: fields.startedAt,
    completedAt: fields.completedAt,
    updatedAt: fields.updatedAt ?? 0,
  },
];

describe("journey track", () => {
  it("covers every public quest exactly once", () => {
    const track = trackQuests().map((quest) => quest.id).sort();
    const catalog = publicQuests().map((quest) => quest.id).sort();
    expect(track).toEqual(catalog);
  });

  it("orders stages small to large, Foundation first", () => {
    const stages = trackStages();
    expect(stages[0].stage.id).toBe("foundation");
    const maxTargets = stages.map(({ quests }) =>
      Math.max(...quests.map((quest) => quest.target)),
    );
    expect([...maxTargets].sort((a, b) => a - b)).toEqual(maxTargets);
    // The suggested first amal is a 33-count quest - smallest first.
    expect(trackQuests()[0].target).toBe(33);
  });

  it("suggests the first track quest with no progress", () => {
    const suggested = suggestedQuest(new Map());
    expect(suggested?.id).toBe(trackQuests()[0].id);
  });

  it("skips completed quests in track order, not catalog order", () => {
    const track = trackQuests();
    const progress = new Map([entry(track[0].id, { completedAt: 50 })]);
    expect(suggestedQuest(progress)?.id).toBe(track[1].id);
  });

  it("suggests nothing once every quest is complete", () => {
    const progress = new Map(
      publicQuests().map((quest) => entry(quest.id, { completedAt: 50 })),
    );
    expect(suggestedQuest(progress)).toBeUndefined();
  });

  it("counts stage completion from quest progress", () => {
    const { quests } = trackStages()[0];
    const progress = new Map([
      entry(quests[0].id, { completedAt: 50 }),
      entry(quests[1].id, { count: 10, startedAt: 1 }),
    ]);
    expect(stageProgress(quests, progress)).toEqual({
      completed: 1,
      total: quests.length,
    });
  });
});
