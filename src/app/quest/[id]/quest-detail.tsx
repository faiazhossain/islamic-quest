"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HadithSheet } from "@/components/hadith-sheet";
import { MissingQuest } from "@/components/missing-quest";
import {
  CATEGORIES,
  dhikrForQuest,
  getPublicQuest,
  hadithForDhikr,
} from "@/lib/content";
import { REVIEW_LABEL } from "@/lib/content/review";
import { formatCount, formatShortDate } from "@/lib/format";
import {
  getProgress,
  recordQuestStarted,
  type QuestProgress,
} from "@/lib/db/events";
import { moreContentBelow } from "@/lib/scroll";

/**
 * Bottom offset for the mobile action bar, mirroring BottomNav's fixed
 * chrome: a 52px item row plus its 6px top padding, then the same
 * safe-area floor the nav uses for its own bottom padding. Keep the two
 * in sync if the nav's fixed dimensions ever change.
 */
const NAV_OFFSET = "calc(58px + max(env(safe-area-inset-bottom), 10px))";

export function QuestDetail({ questId }: { questId: string }) {
  const router = useRouter();
  const quest = getPublicQuest(questId);
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hadithOpen, setHadithOpen] = useState(false);
  const [moreBelow, setMoreBelow] = useState(false);

  // The fixed action bar can make the page look finished at the fold, so
  // a hint above it shows while content still extends below the viewport.
  // It hides once the user reaches the bottom, or entirely when the page
  // fits without scrolling. A ResizeObserver catches height changes that
  // are not scroll-driven, like the completed-note rendering after load.
  useEffect(() => {
    const check = () => {
      const doc = document.documentElement;
      setMoreBelow(
        moreContentBelow(doc.scrollHeight, window.innerHeight, window.scrollY),
      );
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(check);
      observer.observe(document.body);
    }
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!quest) return;
    let cancelled = false;
    getProgress(quest.id)
      .then((entry) => {
        if (!cancelled) setProgress(entry ?? null);
      })
      .catch(() => {
        // Progress stays null; the quest can still be started.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [quest]);

  if (!quest) return <MissingQuest />;

  const dhikr = dhikrForQuest(quest);
  const category = CATEGORIES.find((entry) => entry.id === dhikr.category);
  const count = progress?.count ?? 0;
  const started = Boolean(progress?.startedAt) || count > 0;
  const complete = Boolean(progress?.completedAt);
  const sourceText = [dhikr.source.collection, dhikr.source.reference]
    .filter(Boolean)
    .join(" ");
  const hadith = hadithForDhikr(dhikr.id);

  const start = async () => {
    if (!started) await recordQuestStarted(quest.id).catch(() => {});
    router.push(`/quest/${quest.id}/count`);
  };

  const startLabel = complete
    ? "Practice now"
    : started
      ? `Continue - ${formatCount(count)} / ${formatCount(quest.target)}`
      : `Start quest - ${formatCount(quest.target)}x`;

  return (
    // Extra bottom padding clears the mobile action bar that sits above
    // the bottom nav (main's own padding only clears the nav itself).
    <div className="flex flex-1 flex-col pb-24 lg:pb-0">
      <div className="rise">
        <Link
          href="/explore"
          className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-sm text-ink-3 transition-colors hover:text-ink-2 active:opacity-60"
        >
          <BackChevron />
          Explore
        </Link>
      </div>

      <header className="rise mt-4 [animation-delay:60ms]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {category && (
            <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">
              {category.name.en}
            </span>
          )}
          <span className="text-[11px] text-ink-3">
            {REVIEW_LABEL[dhikr.review.status] ?? REVIEW_LABEL.draft}
          </span>
        </div>
        <h1 className="mt-3 font-display text-[2rem] leading-tight text-ink lg:text-4xl">
          {dhikr.names.en}
        </h1>
      </header>

      <div className="flex flex-col lg:mt-6 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
        <section className="rise mt-6 [animation-delay:120ms] lg:col-span-7 lg:mt-0">
          <div
            className="rounded-3xl border border-line bg-surface-2 px-5 py-6 text-center lg:px-6 lg:py-8"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <p className="font-arabic text-[1.9rem] leading-[2] text-ink lg:text-4xl lg:leading-[2.2]" dir="rtl" lang="ar">
              {dhikr.arabic}
            </p>
            <p className="mt-4 text-sm italic leading-relaxed text-ink-2 lg:mt-5">
              {dhikr.transliteration}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">
              {dhikr.meaning.en}
            </p>
          </div>
        </section>

        <div className="flex flex-col lg:col-span-5">
          <dl className="rise mt-6 text-sm [animation-delay:180ms] lg:mt-0 lg:[animation-delay:120ms]">
            <Row label="Quest" value={`${formatCount(quest.target)}x`} />
            <div className="border-b border-line py-3">
              <dt className="text-xs uppercase tracking-wide text-ink-3">
                Guidance
              </dt>
              <dd className="mt-1 text-ink">{dhikr.practiceGuidance.en}</dd>
              {hadith.length > 0 && (
                <dd className="mt-2">
                  <button
                    onClick={() => setHadithOpen(true)}
                    aria-haspopup="dialog"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 active:bg-surface-2"
                  >
                    <BookIcon />
                    See the hadith ({hadith.length})
                  </button>
                </dd>
              )}
            </div>
            <Row
              label="Source"
              value={sourceText || "Verification in progress"}
              sub={dhikr.source.note}
            />
          </dl>

          <div className="rise mt-8 hidden pb-4 [animation-delay:240ms] lg:block lg:[animation-delay:180ms]">
            <button
              onClick={start}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
            >
              {startLabel}
            </button>
            {loaded && complete && progress?.completedAt && (
              <>
                <p className="mt-3 text-center text-xs text-jade">
                  Completed {formatShortDate(progress.completedAt)}
                </p>
                <p className="mt-1 text-center text-xs text-ink-3">
                  You&apos;ve practiced this Amal {formatCount(count)} times.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <HadithSheet
        open={hadithOpen}
        onClose={() => setHadithOpen(false)}
        title={dhikr.names.en}
        entries={hadith}
      />

      {/* Mobile action bar: the primary CTA stays on screen at every scroll
          position, directly above BottomNav (desktop keeps the inline CTA). */}
      <div
        className="fixed inset-x-0 z-40 border-t border-line bg-bg/90 backdrop-blur-lg lg:hidden"
        style={{ bottom: NAV_OFFSET }}
      >
        {/* Tells the user content continues past the fold: content fades
            out toward the bar, with a bobbing chevron on top. Hidden at the
            bottom of the page and when everything fits on screen. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 -top-8 transition-opacity duration-300 ${
            moreBelow ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="h-8 bg-linear-to-t from-bg/90" />
          <div className="absolute inset-x-0 bottom-1.5 flex justify-center text-ink-3">
            <svg className="bob" viewBox="0 0 16 16" width="16" height="16" fill="none">
              <path
                d="M3.5 6 8 10.5 12.5 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md px-5 py-3">
          <button
            onClick={start}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent shadow-lg transition hover:bg-accent-hover active:translate-y-px"
          >
            {startLabel}
          </button>
          {loaded && complete && progress?.completedAt && (
            <p className="mt-1.5 text-center text-[11px] text-ink-3">
              Completed {formatShortDate(progress.completedAt)} · practiced{" "}
              {formatCount(count)} times
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border-b border-line py-3">
      <dt className="text-xs uppercase tracking-wide text-ink-3">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
      {sub && <dd className="mt-0.5 text-xs leading-relaxed text-ink-3">{sub}</dd>}
    </div>
  );
}

function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M10 3.5 5.5 8 10 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
      <path
        d="M8 4.2C7 3.4 5.7 3 4.2 3c-.7 0-1.4.1-2 .2v9c.6-.1 1.3-.2 2-.2 1.5 0 2.8.4 3.8 1.2 1-.8 2.3-1.2 3.8-1.2.7 0 1.4.1 2 .2v-9c-.6-.1-1.3-.2-2-.2-1.5 0-2.8.4-3.8 1.2Zm0 0v9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
