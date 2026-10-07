/** Localized copy. Bangla ships in v1.1; fields exist now so the shape never migrates. */
export interface LocalizedText {
  en: string;
  bn?: string;
}

export type CategoryId = "istighfar" | "tasbih" | "salawat" | "dhikr";

export interface DhikrSource {
  /** e.g. "Sahih al-Bukhari". Filled during verification (task E1). */
  collection: string;
  /** Hadith or verse reference. Filled during verification (task E1). */
  reference: string;
  /** Grading or attribution context. Supplied during verification only. */
  note?: LocalizedText;
}

export interface ContentReview {
  /**
   * "verified" means the citation was cross-checked against authentic
   * collections; only verified content ships to production.
   */
  status: "draft" | "verified";
  /** Where the citation was cross-checked (automated research pass). */
  verifiedSources?: string[];
  verifiedAt?: string;
}

export interface Dhikr {
  id: string;
  names: LocalizedText;
  arabic: string;
  transliteration: string;
  meaning: LocalizedText;
  category: CategoryId;
  practiceGuidance: LocalizedText;
  source: DhikrSource;
  review: ContentReview;
}

export interface Quest {
  id: string;
  dhikrId: string;
  target: number;
}

/**
 * Why a hadith is shown in the guidance sheet. "prophets-practice" is how
 * the Prophet (peace be upon him) performed the amal; "reward" quotes only
 * his own cited words about its virtue — never a computed claim about the
 * user; "occasion" ties it to a specific time (morning, Friday, ...).
 */
export type HadithTheme = "prophets-practice" | "reward" | "occasion";

export interface HadithEntry {
  /** Stable slug, unique across HADITH, e.g. "salawat-friday-riyad-1158". */
  id: string;
  /** Every amal this narration guides; shared narrations list several. */
  dhikrIds: string[];
  theme: HadithTheme;
  /** Standard Arabic matn (verbatim religious text). */
  arabic: string;
  /**
   * English: a fresh faithful rendering, never a published translation
   * verbatim. Bangla (when present): the VERBATIM translation from the
   * verified iHadis source - never composed or paraphrased. Entries whose
   * Bangla could not be verified on iHadis ship without `bn`.
   */
  translation: LocalizedText;
  /** Companion narrator, e.g. "Abu Huraira". */
  narrator: string;
  /** Narrator as printed on iHadis, e.g. "আবূ হুরায়রা (রাঃ)". */
  narratorBn?: string;
  /** e.g. "Sahih al-Bukhari". */
  collection: string;
  /** sunnah.com numbering, e.g. "6307" or "596a". */
  reference: string;
  /** Only when the collection itself is not the grade, e.g. "Hasan (Darussalam)". */
  grade?: string;
  /** Full canonical link, e.g. "https://sunnah.com/bukhari:6307". */
  sourceUrl: string;
  /** Parallel citations or context the citation line cannot carry. */
  note?: LocalizedText;
  /**
   * Per-entry verification. Deliberately NOT inherited from the parent
   * dhikr's review: each narration stands on its own evidence, and its
   * verification status is shown honestly.
   */
  review: ContentReview;
}

export interface Category {
  id: CategoryId;
  name: LocalizedText;
  description: LocalizedText;
}
