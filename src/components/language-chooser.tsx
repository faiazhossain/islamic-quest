"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { StarMark } from "./star-mark";
import { useSettings } from "@/lib/settings";

/**
 * Hydration-safe mount gate: false during SSR and the first client render
 * (so server and client markup agree), true once mounted.
 */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * First-visit language choice: shown only while no language has ever been
 * chosen (settings.language === null, hydrated client-side so the SSR
 * markup never contains it). Bilingual by design - both buttons are
 * self-labeled, so it reads correctly in either language. After this,
 * changing language lives in Settings.
 */
export function LanguageChooser() {
  const mounted = useMounted();
  const language = useSettings((state) => state.language);
  const englishRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mounted && language === null) englishRef.current?.focus();
  }, [mounted, language]);

  if (!mounted || language !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose your language"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-bg px-6"
    >
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center">
        <StarMark className="mx-auto h-12 w-12 text-accent" />
        <h1 className="rise mt-5 font-display text-2xl text-ink">
          Choose your language
        </h1>
        <p className="rise mt-1 text-sm text-ink-2 [animation-delay:60ms]">
          আপনার ভাষা বেছে নিন
        </p>
        <div className="rise mt-6 grid grid-cols-2 gap-3 [animation-delay:120ms]">
          <button
            ref={englishRef}
            onClick={() => useSettings.getState().setLanguage("en")}
            className="flex h-14 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
          >
            English
          </button>
          <button
            onClick={() => useSettings.getState().setLanguage("bn")}
            className="flex h-14 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
          >
            বাংলা
          </button>
        </div>
        <p className="rise mt-5 text-xs leading-relaxed text-ink-3 [animation-delay:180ms]">
          You can change this anytime in Settings.
          <br />
          সেটিংস থেকে যেকোনো সময় বদলাতে পারবেন।
        </p>
      </div>
    </div>
  );
}
