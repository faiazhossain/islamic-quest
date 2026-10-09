import type { QuestProgress } from "../db/db";
import { publicQuests, getQuest } from "./index";
import type { Quest } from "./types";

/**
 * The suggested Journey track: the existing quest catalog, ordered into
 * stages so escalation is perceived across journeys rather than as
 * isolated larger numbers. This is a RECOMMENDATION layer only - nothing
 * is ever locked, and Explore stays fully open. The amounts are
 * product-designed practice goals for habit-building; the dhikr
 * themselves carry their own verified citations and no stage framing
 * implies religious prescription.
 *
 * Stage membership deliberately keeps each stage internally consistent
 * (a run of same-size chunks), with longer formulas placed later inside
 * a stage so a stage still ramps gently.
 */
export type StageId = "foundation" | "growth" | "depth" | "abundance";

export interface JourneyStage {
  id: StageId;
  questIds: string[];
}

const STAGES: JourneyStage[] = [
  {
    id: "foundation",
    questIds: [
      "subhanallah-33",
      "alhamdulillah-33",
      "allahu-akbar-33",
      "sayyid-ul-istighfar-33",
      // Gentle one-time duas first: a single recitation is a real start.
      "bismika-allahumma-amutu-wa-ahya-1",
      "rabbi-inni-lima-anzalta-1",
      "inna-lillahi-wa-inna-ilayhi-rajion-1",
    ],
  },
  {
    id: "growth",
    questIds: [
      "astaghfirullah-100",
      "subhanallah-100",
      "alhamdulillah-100",
      "allahu-akbar-100",
      "subhanallahi-wa-bihamdihi-100",
      "hawqala-100",
      "la-ilaha-illallah-100",
      "sayyid-ul-istighfar-100",
      "salawat-ibrahimiyya-100",
      // First-tier duas.
      "hasbunallahu-wa-nimal-wakil-1",
      "audhu-min-hammi-wal-hazan-1",
      "audhu-bikalimatillah-it-tammat-1",
      "ayat-al-kursi-1",
      "bismillahilladhi-la-yadurru-1",
      "allahumma-inni-asaluka-alhuda-1",
      "rabbana-atina-fid-dunya-1",
      "rabbir-hamhuma-1",
    ],
  },
  {
    id: "depth",
    questIds: [
      "subhanallahi-wa-bihamdihi-500",
      "hawqala-500",
      "la-ilaha-illallah-500",
      "astaghfirullah-500",
      "salawat-ibrahimiyya-500",
      // Second-tier duas.
      "bismika-allahumma-amutu-wa-ahya-3",
      "rabbi-inni-lima-anzalta-3",
      "inna-lillahi-wa-inna-ilayhi-rajion-3",
      "hasbunallahu-wa-nimal-wakil-3",
      "audhu-min-hammi-wal-hazan-3",
      "audhu-bikalimatillah-it-tammat-3",
      "ayat-al-kursi-3",
      "bismillahilladhi-la-yadurru-3",
      "allahumma-inni-asaluka-alhuda-3",
      "rabbana-atina-fid-dunya-3",
      "rabbir-hamhuma-3",
    ],
  },
  {
    id: "abundance",
    questIds: [
      "astaghfirullah-1000",
      "salawat-ibrahimiyya-1000",
      // Third-tier duas.
      "bismika-allahumma-amutu-wa-ahya-7",
      "rabbi-inni-lima-anzalta-7",
      "inna-lillahi-wa-inna-ilayhi-rajion-7",
      "hasbunallahu-wa-nimal-wakil-7",
      "audhu-min-hammi-wal-hazan-7",
      "audhu-bikalimatillah-it-tammat-7",
      "ayat-al-kursi-7",
      "bismillahilladhi-la-yadurru-7",
      "allahumma-inni-asaluka-alhuda-7",
      "rabbana-atina-fid-dunya-7",
      "rabbir-hamhuma-7",
    ],
  },
];

/** A stage joined with its public quests, in track order. */
export interface TrackStage {
  stage: JourneyStage;
  quests: Quest[];
}

/**
 * The public track, with a build-time tripwire: every public quest must
 * appear in exactly one stage, so the track can never silently drift
 * out of sync with the catalog.
 */
export function trackStages(): TrackStage[] {
  const seen = new Set<string>();
  const stages = STAGES.map((stage) => {
    const quests = stage.questIds.map((id) => {
      const quest = getQuest(id);
      if (!quest) {
        throw new Error(`Track stage ${stage.id} references unknown quest ${id}`);
      }
      seen.add(id);
      return quest;
    });
    return { stage, quests };
  });
  const missing = publicQuests().filter((quest) => !seen.has(quest.id));
  if (missing.length > 0) {
    throw new Error(
      `Track is missing quests: ${missing.map((quest) => quest.id).join(", ")}`,
    );
  }
  return stages;
}

/** Every public quest in suggested order - the flat path through the track. */
export function trackQuests(): Quest[] {
  return trackStages().flatMap(({ quests }) => quests);
}

/**
 * The suggested quest: the first not-yet-completed quest in track order.
 * A suggestion only - the user's active quest always takes precedence in
 * the Home flow, and every quest stays freely startable.
 */
export function suggestedQuest(
  progress: Map<string, QuestProgress>,
): Quest | undefined {
  return trackQuests().find((quest) => !progress.get(quest.id)?.completedAt);
}

/** Completed-vs-total for one stage, for the Journey page's stage cards. */
export function stageProgress(
  quests: ReadonlyArray<Quest>,
  progress: Map<string, QuestProgress>,
): { completed: number; total: number } {
  return {
    completed: quests.filter((quest) => progress.get(quest.id)?.completedAt)
      .length,
    total: quests.length,
  };
}
