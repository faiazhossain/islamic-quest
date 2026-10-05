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
  /** Grading or attribution context. Supplied by the reviewer only. */
  note?: string;
}

export interface ContentReview {
  status: "draft" | "reviewed";
  reviewer?: string;
  reviewedAt?: string;
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

export interface Category {
  id: CategoryId;
  name: LocalizedText;
  description: LocalizedText;
}
