"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MissingQuest } from "@/components/missing-quest";
import {
  CATEGORIES,
  dhikrForQuest,
  getPublicQuest,
} from "@/lib/content";
import { formatCount, formatShortDate } from "@/lib/format";
import {
  getProgress,
  recordQuestStarted,
  type QuestProgress,
} from "@/lib/db/events";

/**
 * Honest, per-item review status shown to the user. "reviewed" means a
 * human scholar has signed off; nothing else reaches production builds.
 */
const REVIEW_LABEL: Record<string, string> = {
  draft: "Reference pending scholar review",
  verified: "Reference verified; scholar review pending",
  reviewed: "Scholar reviewed",
};

export function QuestDetail({ questId }: { questId: string }) {
  const router = useRouter();
  const quest = getPublicQuest(questId);
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [loaded, setLoaded] = useState(false);

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

  const start = async () => {
    if (!started) await recordQuestStarted(quest.id).catch(() => {});
    router.push(`/quest/${quest.id}/count`);
  };

  return (
    <div className="flex flex-1 flex-col">
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
        <h1 className="mt-3 font-display text-[2rem] leading-tight text-ink">
          {dhikr.names.en}
        </h1>
      </header>

      <section className="rise mt-6 [animation-delay:120ms]">
        <div
          className="rounded-3xl border border-line bg-surface-2 px-6 py-8 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="font-arabic text-[2.1rem] leading-[2.2] text-ink" dir="rtl" lang="ar">
            {dhikr.arabic}
          </p>
          <p className="mt-5 text-sm italic leading-relaxed text-ink-2">
            {dhikr.transliteration}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink">
            {dhikr.meaning.en}
          </p>
        </div>
      </section>

      <dl className="rise mt-6 text-sm [animation-delay:180ms]">
        <Row label="Quest" value={`${formatCount(quest.target)}x`} />
        <Row label="Guidance" value={dhikr.practiceGuidance.en} />
        <Row
          label="Source"
          value={sourceText || "Verification in progress"}
          sub={dhikr.source.note}
        />
      </dl>

      <div className="rise mt-8 pb-4 [animation-delay:240ms]">
        <button
          onClick={start}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          {complete
            ? "Practice now"
            : started
              ? `Continue - ${formatCount(count)} / ${formatCount(quest.target)}`
              : `Start quest - ${formatCount(quest.target)}x`}
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
