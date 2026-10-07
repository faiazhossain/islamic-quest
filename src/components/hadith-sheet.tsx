"use client";

import { useEffect, useRef } from "react";
import { REVIEW_LABEL } from "@/lib/content/review";
import type { HadithEntry, HadithTheme } from "@/lib/content";
import { toBnDigits } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";

interface HadithSheetProps {
  open: boolean;
  onClose: () => void;
  /** Amal name shown under the sheet heading, e.g. "Salawat (Ibrahimiyya)". */
  title: string;
  /** Already filtered to the public set; grouped here by theme. */
  entries: HadithEntry[];
}

const THEME_GROUPS: { theme: HadithTheme }[] = [
  { theme: "prophets-practice" },
  { theme: "reward" },
  { theme: "occasion" },
];

const THEME_HEADINGS = {
  "prophets-practice": "themePracticeHeading",
  reward: "themeRewardHeading",
  occasion: "themeOccasionHeading",
} as const;

/**
 * Guidance sheet listing the cited hadith for one amal. Bottom sheet on
 * phones, centered dialog on larger screens, following the ConfirmDialog
 * conventions (focus save/restore, Escape, focus trap, body scroll lock,
 * rise animation; the global prefers-reduced-motion override collapses
 * the animation to a single frame). The tab trap covers links as well as
 * buttons because each entry links to sunnah.com.
 */
export function HadithSheet({ open, onClose, title, entries }: HadithSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const copy = useCopy();
  const lang = useLang();

  useEffect(() => {
    if (!open) return;
    // Focus the close button on open; return focus to the trigger on close.
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    // Lock background scrolling so the sheet stays anchored.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        // Focus trap across the sheet's buttons and links.
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href]",
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hadith-sheet-title"
        aria-describedby="hadith-sheet-footnote"
        onClick={(event) => event.stopPropagation()}
        className="rise flex h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-b-0 border-line bg-surface sm:h-auto sm:max-h-[85dvh] sm:max-w-lg sm:rounded-3xl sm:border-b"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="relative border-b border-line px-5 pb-4 pt-5 sm:px-6">
          <h2
            id="hadith-sheet-title"
            className="font-display text-xl text-ink"
          >
            {copy.hadithTitle}
          </h2>
          <p className="mt-0.5 text-sm text-ink-2">{title}</p>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={copy.closeAria}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2"
          >
            <svg
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(env(safe-area-inset-bottom),2rem)] sm:px-6">
          {THEME_GROUPS.map(({ theme }) => {
            const group = entries.filter((entry) => entry.theme === theme);
            if (group.length === 0) return null;
            return (
              <section key={theme} className="mt-5 first:mt-0">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                  {copy[THEME_HEADINGS[theme]]}
                </h3>
                {group.map((entry) => (
                  <article
                    key={entry.id}
                    className="mt-3 rounded-2xl border border-line bg-surface-2 p-4"
                  >
                    <p
                      dir="rtl"
                      lang="ar"
                      className="font-arabic text-xl leading-[2] text-ink sm:text-2xl"
                    >
                      {entry.arabic}
                    </p>
                    {entry.translation.bn ? (
                      <p
                        lang="bn"
                        className="mt-3 text-[15px] leading-relaxed text-ink"
                      >
                        {entry.translation.bn}
                      </p>
                    ) : (
                      <>
                        <p className="mt-3 text-[15px] leading-relaxed text-ink">
                          {entry.translation.en}
                        </p>
                        {lang === "bn" && (
                          <p className="mt-1.5 text-xs italic leading-relaxed text-ink-3">
                            {copy.hadithBnPending}
                          </p>
                        )}
                      </>
                    )}
                    <p className="mt-3 text-xs text-ink-3">
                      {copy.narratedBy(lang === "bn" ? (entry.narratorBn ?? entry.narrator) : entry.narrator)}{" "}
                      · {lang === "bn" ? (copy.collectionBn[entry.collection] ?? entry.collection) : entry.collection}{" "}
                      {lang === "bn" ? toBnDigits(entry.reference) : entry.reference}
                      {entry.grade && (
                        <span className="text-jade">
                          {" "}· {lang === "bn" ? (copy.gradeBn[entry.grade] ?? entry.grade) : entry.grade}
                        </span>
                      )}
                    </p>
                    {entry.note && (
                      <p className="mt-1 text-xs leading-relaxed text-ink-3">
                        {localized(entry.note, lang)}
                      </p>
                    )}
                    <a
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-6 items-center text-xs font-medium text-ink-2 underline underline-offset-2 transition-colors hover:text-ink"
                    >
                      sunnah.com
                    </a>
                  </article>
                ))}
              </section>
            );
          })}

          <p
            id="hadith-sheet-footnote"
            className="mt-6 text-[11px] leading-relaxed text-ink-3"
          >
            {`${localized(REVIEW_LABEL.verified, lang)}. ${copy.footnoteComposed}`}
          </p>
        </div>
      </div>
    </div>
  );
}
