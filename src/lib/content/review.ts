import type { ContentReview } from "./types";

/**
 * Honest, per-item review status shown to the user. "reviewed" means a
 * human scholar has signed off; nothing else reaches production builds.
 * Shared by the quest detail page and the hadith sheet so the wording
 * never drifts between surfaces.
 */
export const REVIEW_LABEL: Record<ContentReview["status"], string> = {
  draft: "Reference pending scholar review",
  verified: "Reference verified; scholar review pending",
  reviewed: "Scholar reviewed",
};
