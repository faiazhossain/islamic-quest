import type { ContentReview } from "./types";

/**
 * Honest, per-item review status shown to the user. "reviewed" means a
 * human scholar has signed off; nothing else reaches production builds.
 * Shared by the quest detail page and the hadith sheet so the wording
 * never drifts between surfaces. Resolve with localized() at render time.
 */
export const REVIEW_LABEL: Record<ContentReview["status"], LocalizedLabel> = {
  draft: {
    en: "Reference pending scholar review",
    bn: "তথ্যসূত্র যাচাই বাকি",
  },
  verified: {
    en: "Reference verified; scholar review pending",
    bn: "তথ্যসূত্র যাচাই হয়েছে; আলেমের পর্যালোচনা বাকি",
  },
  reviewed: {
    en: "Scholar reviewed",
    bn: "আলেম কর্তৃক পর্যালোচিত",
  },
};

interface LocalizedLabel {
  en: string;
  bn: string;
}
