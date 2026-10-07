import type { ContentReview } from "./types";

/**
 * Honest, per-item verification status shown to the user. "verified"
 * means the citation was cross-checked against authentic collections;
 * nothing else reaches production builds. Shared by the quest detail
 * page and the hadith sheet so the wording never drifts between
 * surfaces. Resolve with localized() at render time.
 */
export const REVIEW_LABEL: Record<ContentReview["status"], LocalizedLabel> = {
  draft: {
    en: "Reference pending verification",
    bn: "তথ্যসূত্র যাচাই বাকি",
  },
  verified: {
    en: "Reference verified",
    bn: "তথ্যসূত্র যাচাই হয়েছে",
  },
};

interface LocalizedLabel {
  en: string;
  bn: string;
}
