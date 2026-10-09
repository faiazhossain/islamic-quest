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
  // Dua tiers (2026-10-08 batch): small product milestones. These are
  // personal consistency goals, NOT prescribed counts — sourced counts
  // and times live on each dhikr's practiceGuidance/source instead.
  { dhikrId: "rabbi-inni-lima-anzalta", targets: [1, 3, 7] },
  { dhikrId: "hasbunallahu-wa-nimal-wakil", targets: [1, 3, 7] },
  { dhikrId: "allahumma-inni-asaluka-alhuda", targets: [1, 3, 7] },
  { dhikrId: "audhu-min-hammi-wal-hazan", targets: [1, 3, 7] },
  { dhikrId: "bismika-allahumma-amutu-wa-ahya", targets: [1, 3, 7] },
  { dhikrId: "audhu-bikalimatillah-it-tammat", targets: [1, 3, 7] },
  { dhikrId: "ayat-al-kursi", targets: [1, 3, 7] },
  { dhikrId: "bismillahilladhi-la-yadurru", targets: [1, 3, 7] },
  { dhikrId: "inna-lillahi-wa-inna-ilayhi-rajion", targets: [1, 3, 7] },
  { dhikrId: "rabbana-atina-fid-dunya", targets: [1, 3, 7] },
  { dhikrId: "rabbir-hamhuma", targets: [1, 3, 7] },
];

export const QUESTS: Quest[] = TIERS.flatMap(({ dhikrId, targets }) =>
  targets.map((target) => ({ id: `${dhikrId}-${target}`, dhikrId, target })),
);
