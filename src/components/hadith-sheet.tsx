"use client";

import { HadithCard } from "@/components/hadith-card";
import { SheetDialog } from "@/components/sheet-dialog";
import { REVIEW_LABEL } from "@/lib/content/review";
import type { HadithEntry, HadithTheme } from "@/lib/content";
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
 * Guidance sheet listing the cited hadith for one amal. Sheet chrome,
 * focus management and scroll lock live in SheetDialog; this component
 * owns only the amal-specific content: entries grouped by theme and the
 * verification footnote.
 */
export function HadithSheet({ open, onClose, title, entries }: HadithSheetProps) {
  const copy = useCopy();
  const lang = useLang();

  return (
    <SheetDialog
      open={open}
      onClose={onClose}
      title={copy.hadithTitle}
      subtitle={title}
      titleId="hadith-sheet-title"
      describedById="hadith-sheet-footnote"
    >
      {THEME_GROUPS.map(({ theme }) => {
        const group = entries.filter((entry) => entry.theme === theme);
        if (group.length === 0) return null;
        return (
          <section key={theme} className="mt-5 first:mt-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">
              {copy[THEME_HEADINGS[theme]]}
            </h3>
            {group.map((entry) => (
              <div key={entry.id} className="mt-3">
                <HadithCard entry={entry} />
              </div>
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
    </SheetDialog>
  );
}
