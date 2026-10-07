"use client";

import { HadithCard } from "@/components/hadith-card";
import { SheetDialog } from "@/components/sheet-dialog";
import { REVIEW_LABEL } from "@/lib/content/review";
import type { HadiyaHadith } from "@/lib/content";
import { localized, useCopy, useLang } from "@/lib/i18n";

interface SupportHadithSheetProps {
  open: boolean;
  onClose: () => void;
  entries: HadiyaHadith[];
}

/**
 * Support page sheet holding the rest of the verified Hadiya hadith.
 * Unlike the quest guidance sheet there are no theme groups - the
 * entries form one flat list, newest context first.
 */
export function SupportHadithSheet({ open, onClose, entries }: SupportHadithSheetProps) {
  const copy = useCopy();
  const lang = useLang();

  return (
    <SheetDialog
      open={open}
      onClose={onClose}
      title={copy.hadithTitle}
      subtitle={copy.supportHadithHeading}
      titleId="support-hadith-title"
      describedById="support-hadith-footnote"
    >
      {entries.map((entry) => (
        <div key={entry.id} className="mt-3 first:mt-0">
          <HadithCard entry={entry} />
        </div>
      ))}

      <p
        id="support-hadith-footnote"
        className="mt-6 text-[11px] leading-relaxed text-ink-3"
      >
        {`${localized(REVIEW_LABEL.verified, lang)}. ${copy.footnoteComposed}`}
      </p>
    </SheetDialog>
  );
}
