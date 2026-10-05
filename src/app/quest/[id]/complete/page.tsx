"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MissingQuest } from "@/components/missing-quest";
import { StarMark } from "@/components/star-mark";
import { dhikrForQuest, getQuest } from "@/lib/content";
import { formatCount, formatShortDate } from "@/lib/format";
import { getProgress, recordQuestCompleted } from "@/lib/db/events";

export default function CompletePage() {
  const params = useParams<{ id: string }>();
  const quest = getQuest(params.id);
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
        Quest complete
      </p>
      <h1 className="rise mt-3 font-display text-[2.1rem] leading-tight text-ink [animation-delay:230ms]">
        {formatCount(quest.target)}x {dhikr.names.en}
      </h1>
      <p className="rise mt-3 font-display text-lg italic text-ink-2 [animation-delay:310ms]">
        Alhamdulillah
      </p>
      {ready && completedAt && (
        <p className="rise mt-1 text-xs text-ink-3 [animation-delay:360ms]">
          {formatShortDate(completedAt)}
        </p>
      )}

      <div className="rise mt-12 w-full max-w-xs space-y-3 [animation-delay:420ms]">
        <Link
          href={`/quest/${quest.id}/share`}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          Share this milestone
        </Link>
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center rounded-2xl border border-line bg-surface font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
