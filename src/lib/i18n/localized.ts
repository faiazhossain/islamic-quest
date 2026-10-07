import type { LocalizedText } from "../content/types";
import type { Lang } from "./lang";

/**
 * Resolves a content field (dhikr names, meanings, hadith translations)
 * to the active language, falling back to English when the Bangla text is
 * absent - e.g. a hadith whose Bangla could not be verified on iHadis
 * ships without one rather than with invented text.
 */
export const localized = (text: LocalizedText, lang: Lang): string =>
  lang === "bn" ? (text.bn ?? text.en) : text.en;
