import type { LocalizedText } from "@/lib/content/types";
import { toBnDigits } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";

/**
 * The citation shape both guidance surfaces render: a guidance hadith
 * (HADITH) and a support hadith (HADIYA_HADITH) carry these same fields.
 */
interface HadithCardEntry {
  arabic: string;
  translation: LocalizedText;
  narrator: string;
  narratorBn?: string;
  collection: string;
  reference: string;
  grade?: string;
  sourceUrl: string;
  note?: LocalizedText;
}

/**
 * One narration card as shown inside the hadith sheets: Arabic matn,
 * then the translation. English-first: an English reader gets the
 * English rendering with the verified Bangla beneath it; a Bangla
 * reader gets the Bangla alone. When no verified Bangla exists the
 * card falls back to English (plus an honest pending note in Bangla
 * mode), and the citation line carries the grade and the sunnah.com
 * link.
 */
export function HadithCard({ entry }: { entry: HadithCardEntry }) {
  const copy = useCopy();
  const lang = useLang();

  return (
    <article className="rounded-2xl border border-line bg-surface-2 p-4">
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-xl leading-[2] text-ink sm:text-2xl"
      >
        {entry.arabic}
      </p>
      {entry.translation.bn ? (
        lang === "bn" ? (
          <p lang="bn" className="mt-3 text-[15px] leading-relaxed text-ink">
            {entry.translation.bn}
          </p>
        ) : (
          <>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">
              {entry.translation.en}
            </p>
            <p lang="bn" className="mt-2 text-sm leading-relaxed text-ink-2">
              {entry.translation.bn}
            </p>
          </>
        )
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
  );
}
