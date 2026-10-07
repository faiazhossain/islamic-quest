"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MissingQuest } from "@/components/missing-quest";
import { StarMark } from "@/components/star-mark";
import { dhikrForQuest, getPublicQuest } from "@/lib/content";
import { formatCount, formatShortDate } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";
import { getProgress, recordQuestCompleted } from "@/lib/db/events";

export default function CompletePage() {
  const params = useParams<{ id: string }>();
  const quest = getPublicQuest(params.id);
  const copy = useCopy();
  const lang = useLang();
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!quest) return;
    let cancelled = false;
    (async () => {
      // Belt and braces: if the completion event write raced the router
      // push, record it here; recordQuestCompleted is idempotent.
      await recordQuestCompleted(quest.id).catch(() => {});
      const entry = await getProgress(quest.id).catch(() => undefined);
      if (cancelled) return;
      setCompletedAt(entry?.completedAt ?? null);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [quest]);

  if (!quest) return <MissingQuest />;

  const dhikr = dhikrForQuest(quest);

  return (
    <div
      className="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 text-center"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 24px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      <div className="relative">
        <span
          aria-hidden="true"
          className="bloom absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, var(--glow), transparent 72%)" }}
        />
        <StarMark className="relative h-24 w-24 text-accent" />
      </div>

      <p className="rise mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-accent [animation-delay:150ms]">
        {copy.questComplete}
      </p>
      <h1 className="rise mt-3 font-display text-[2.1rem] leading-tight text-ink [animation-delay:230ms]">
        {formatCount(quest.target, lang)}x {localized(dhikr.names, lang)}
      </h1>
      <p className="rise mt-3 font-display text-lg italic text-ink-2 [animation-delay:310ms]">
        {copy.alhamdulillah}
      </p>
      {ready && completedAt && (
        <p className="rise mt-1 text-xs text-ink-3 [animation-delay:360ms]">
          {formatShortDate(completedAt, lang)}
        </p>
      )}

      <p className="rise mt-6 text-sm text-ink-2 [animation-delay:380ms]">
        {copy.amalStaysInJourney}
      </p>

      <div className="rise mt-12 w-full max-w-xs space-y-3 [animation-delay:440ms]">
        <Link
          href={`/quest/${quest.id}/share`}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          {copy.shareMilestone}
        </Link>
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center rounded-2xl border border-line bg-surface font-semibold text-ink transition-colors hover:bg-surface-2 active:bg-surface-2"
        >
          {copy.backHome}
        </Link>
      </div>
    </div>
  );
}
