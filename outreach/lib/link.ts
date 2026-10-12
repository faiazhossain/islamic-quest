// Deep links into the app's challenge surface. Plain functional links:
// no UTM parameters, no attribution - the outreach workflow records where
// a post was shared locally and does no click or campaign measurement.
// Must stay in sync with src/lib/site.ts - the guard test link.test.ts
// enforces it.

// Keep in sync with SITE_URL in src/lib/site.ts (guarded by a test).
export const SITE_URL = "https://amalyn.vercel.app";

// The regular-amal deep links. Ids mirror src/lib/content/dhikr.ts; a
// test in link.test.ts cross-checks the full set against the catalog.
export const DHIKR_IDS = [
  "astaghfirullah",
  "sayyid-ul-istighfar",
  "subhanallah",
  "alhamdulillah",
  "allahu-akbar",
  "la-ilaha-illallah",
  "subhanallahi-wa-bihamdihi",
  "hawqala",
  "salawat-ibrahimiyya",
  "rabbi-inni-lima-anzalta",
  "hasbunallahu-wa-nimal-wakil",
  "allahumma-inni-asaluka-alhuda",
  "audhu-min-hammi-wal-hazan",
  "bismika-allahumma-amutu-wa-ahya",
  "audhu-bikalimatillah-it-tammat",
  "ayat-al-kursi",
  "bismillahilladhi-la-yadurru",
  "inna-lillahi-wa-inna-ilayhi-rajion",
  "rabbana-atina-fid-dunya",
  "rabbir-hamhuma",
] as const;

export type DhikrId = (typeof DHIKR_IDS)[number];

export function isDhikrId(value: string): value is DhikrId {
  return (DHIKR_IDS as readonly string[]).includes(value);
}

// Link a reader can open to start the named amal as a 30-day challenge.
export function challengeUrl(
  dhikrId: string,
  options: { siteUrl?: string } = {},
): string {
  if (!isDhikrId(dhikrId)) {
    throw new Error(
      `unknown dhikr id "${dhikrId}". Valid ids: ${DHIKR_IDS.join(", ")}`,
    );
  }
  const site = options.siteUrl ?? process.env.OUTREACH_SITE_URL ?? SITE_URL;
  return `${site}/challenge?amal=${dhikrId}`;
}
