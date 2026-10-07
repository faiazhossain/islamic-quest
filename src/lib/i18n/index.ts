"use client";

import { useSettings } from "../settings";
import { copyFor, type Copy } from "./dictionary";
import type { Lang } from "./lang";

export { copyFor, type Copy } from "./dictionary";
export { localized } from "./localized";
export type { Lang } from "./lang";

/**
 * The active language for rendering. The unset (null) first-visit state
 * renders English until the chooser is answered, which also keeps the
 * server-rendered markup consistent with the first client render.
 */
export const useLang = (): Lang =>
  useSettings((state) => (state.language === "bn" ? "bn" : "en"));

/** The full copy table for the active language. */
export const useCopy = (): Copy => copyFor(useSettings((state) => state.language));
