import type { Quest } from "./types";

/**
 * Tiered targets per dhikr, kept declarative so the catalog can be
 * reviewed as plain data. Quest titles and descriptions are derived
 * (see index.ts) rather than duplicated per tier.
 */
const TIERS: Array<{ dhikrId: string; targets: number[] }> = [
  { dhikrId: "astaghfirullah", targets: [100, 500, 1000] },
  { dhikrId: "sayyid-ul-istighfar", targets: [33, 100] },
  { dhikrId: "subhanallah", targets: [33, 100] },
  { dhikrId: "alhamdulillah", targets: [33, 100] },
  { dhikrId: "allahu-akbar", targets: [33, 100] },
  { dhikrId: "la-ilaha-illallah", targets: [100, 500] },
  { dhikrId: "subhanallahi-wa-bihamdihi", targets: [100, 500] },
  { dhikrId: "hawqala", targets: [100, 500] },
  { dhikrId: "salawat-ibrahimiyya", targets: [100, 500, 1000] },
];

export const QUESTS: Quest[] = TIERS.flatMap(({ dhikrId, targets }) =>
  targets.map((target) => ({ id: `${dhikrId}-${target}`, dhikrId, target })),
);
