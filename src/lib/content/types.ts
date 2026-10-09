/** Localized copy. Bangla ships in v1.1; fields exist now so the shape never migrates. */
export interface LocalizedText {
  en: string;
  bn?: string;
}

export type CategoryId = "istighfar" | "tasbih" | "salawat" | "dhikr" | "dua";

/**
 * Discovery intents a user might search or browse by. Deliberately
 * separate from CategoryId: a category classifies the KIND of amal,
 * a topic describes what the amal is FOR. Topics must stay
 * evidence-gated — see TopicLink.
 */
export type TopicId =
  | "forgiveness"
  | "istighfar"
  | "salawat"
  | "gratitude"
  | "tawakkul"
  | "sabr"
  | "anxiety-worry"
  | "sleep-evening"
  | "protection"
  | "general-dhikr"
  | "rizq"
  | "guidance"
  | "health"
  | "family-parents"
  | "knowledge"
  | "akhirah";

/**
 * How an amal relates to a topic — the honesty axis of the library.
 *
 * "dua-for": the amal's own words explicitly ask Allah for this
 * (e.g. Astaghfirullah under "forgiveness"). Only this link may be
 * presented in the UI as "amals for X".
 *
 * "occasion": the amal is tied to this topic by a sourced occasion or
 * prescription (e.g. a before-sleep dua under "sleep & evening"), not
 * by the words asking for it. Requires cited evidence like "dua-for".
 *
 * "related": general dhikr thematically connected (e.g. Subhanallah
 * under "general dhikr"). Never presented as prescribed for the topic.
 */
export type TopicLink = "dua-for" | "occasion" | "related";

export interface TopicLinkEntry {
  topic: TopicId;
  link: TopicLink;
  /**
   * Required for "dua-for" and "occasion": one line pointing at WHERE
   * the amal's words ask for this / the narration that ties it to this
   * occasion. Enforced by content tests (bilingual, non-empty).
   */
  evidence?: LocalizedText;
}

export interface Topic {
  id: TopicId;
  name: LocalizedText;
  description: LocalizedText;
  /** Authored search aliases: Bangla, English, Banglish variants. */
  searchTerms: string[];
}

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
  /**
   * Evidence-based topic links. See TopicLink: only "dua-for" links
   * (with cited evidence) may present an amal as being FOR a purpose.
   */
  topics?: TopicLinkEntry[];
  /**
   * Authored search aliases (any script): Banglish transliteration
   * variants, common Bangla/English synonyms. Never rendered in the UI.
   */
  searchTerms?: string[];
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

/**
 * A narration shown on the Support page about the Hadiya itself: giving,
 * receiving, and the Prophet's (peace be upon him) own practice. Same
 * citation shape and verification standard as a guidance hadith, minus
 * the amal linkage that only the quest sheet needs.
 */
export type HadiyaHadith = Omit<HadithEntry, "dhikrIds" | "theme">;
