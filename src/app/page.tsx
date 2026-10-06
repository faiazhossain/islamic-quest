"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StarMark } from "@/components/star-mark";
import { Stat } from "@/components/stat";
import { formatCount } from "@/lib/format";
import {
  getAllProgress,
  getPracticeEvents,
  type QuestProgress,
} from "@/lib/db/events";
import { selectHomeView, type DailyAmal, type HomeView } from "@/lib/home";
import type { PracticeEvent, PracticeStats } from "@/lib/practice";

export default function HomePage() {
  const [progress, setProgress] = useState<Map<string, QuestProgress> | null>(null);
  const [events, setEvents] = useState<PracticeEvent[] | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [map, log] = await Promise.all([
          getAllProgress(),
          getPracticeEvents(),
        ]);
        if (!cancelled) {
          setProgress(map);
          setEvents(log);
          setNow(Date.now());
        }
      } catch {
        if (!cancelled) {
          setProgress(new Map());
          setEvents([]);
          setNow(Date.now());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived once per data load; a day boundary landing mid-session simply
  // refreshes on the next mount, as today's totals always have.
  const view = useMemo<HomeView | null>(
    () =>
      progress && events
        ? selectHomeView({ progress, events, now })
        : null,
    [progress, events, now],
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="rise pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-3">
          Amalyn
        </p>
        <h1 className="mt-4 font-display text-[2.15rem] leading-[1.12] text-ink">
          As-salamu alaykum.
        </h1>
        {view && view.kind !== "first-visit" && view.todayTotal > 0 && (
          <p className="mt-3 text-[15px] text-ink-2">
            Today: {formatCount(view.todayTotal)} dhikr. Your Journey is waiting.
          </p>
        )}
      </header>

      {view === null ? (
        <div className="mt-10 h-56 animate-pulse rounded-3xl bg-surface" aria-hidden="true" />
      ) : view.kind === "active-quest" ? (
        <CurrentQuestCard
          questId={view.questId}
          name={view.name}
          count={view.count}
          target={view.target}
        />
      ) : view.kind === "all-complete" ? (
        <>
          <TodaysAmalCard daily={view.daily} />
          <PracticeProgressCard stats={view.stats} totalDhikr={view.totalDhikr} />
        </>
      ) : view.kind === "next-quest" ? (
        <section className="rise mt-10 [animation-delay:120ms]">
          <div
            className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Next step
            </p>
            <h2 className="mt-2 font-display text-xl text-ink">
              Begin your next quest.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Your journey grows with every quest you complete.
            </p>
            <Link
              href="/explore"
              className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
            >
              Choose a quest
            </Link>
          </div>
        </section>
      ) : (
        <>
          <FirstQuestCard />
          <HowItWorks />
        </>
      )}

      {view !== null && view.kind !== "first-visit" && (
        <Link
          href="/journey"
          className="rise mt-5 flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors hover:bg-surface-2 active:bg-surface-2 [animation-delay:240ms]"
        >
          <span className="min-w-0">
            <span className="block text-sm text-ink">View your Journey</span>
            {view.kind === "all-complete" && (
              <span className="mt-0.5 block text-xs text-ink-3">
                {view.completedCount} / {view.questTotal} quests complete
              </span>
            )}
          </span>
          <span aria-hidden="true" className="text-ink-3">
            <Chevron />
          </span>
        </Link>
      )}

      <p className="rise mt-auto pb-2 pt-10 text-center text-xs text-ink-3 [animation-delay:280ms]">
        Free forever. No ads, no account needed.
      </p>
    </div>
  );
}

function CurrentQuestCard({
  questId,
  name,
  count,
  target,
}: {
  questId: string;
  name: string;
  count: number;
  target: number;
}) {
  const percent = Math.min(Math.round((count / target) * 100), 100);
  return (
    <section className="rise mt-10 [animation-delay:120ms]">
      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Current quest
        </p>
        <h2 className="mt-2 font-display text-xl text-ink">{name}</h2>
        <p className="mt-1 text-sm text-ink-2">
          {formatCount(count)} / {formatCount(target)}
        </p>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Current quest progress"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <Link
          href={`/quest/${questId}/count`}
          className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          Continue quest
        </Link>
      </div>
    </section>
  );
}

/**
 * The lifelong-practice suggestion: one unlocked Amal per day, at its
 * intended count. Completing it for the day is acknowledged quietly - the
 * Amal continues tomorrow, and nothing is ever lost by resting.
 */
function TodaysAmalCard({ daily }: { daily: DailyAmal }) {
  const done = daily.todayCount >= daily.target;
  const percent = Math.min(Math.round((daily.todayCount / daily.target) * 100), 100);
  return (
    <section className="rise mt-10 [animation-delay:120ms]">
      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Today&apos;s Amal
        </p>
        <h2 className="mt-2 font-display text-xl text-ink">{daily.name}</h2>
        {done ? (
          <>
            <p className="mt-1 text-sm text-jade">
              {formatCount(daily.target)}x complete
            </p>
            <p className="mt-1 text-sm text-ink-2">
              Today: {formatCount(daily.todayCount)}x
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-2">
              {formatCount(daily.todayCount)} / {formatCount(daily.target)}
            </p>
            <div
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Today's Amal progress"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <Link
              href={`/quest/${daily.questId}/count`}
              className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
            >
              Practice now
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

function PracticeProgressCard({
  stats,
  totalDhikr,
}: {
  stats: PracticeStats;
  totalDhikr: number;
}) {
  return (
    <section className="rise mt-5 [animation-delay:180ms]">
      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Your progress
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Days practiced" value={String(stats.daysPracticed)} />
          <Stat label="Total" value={formatCount(totalDhikr)} />
          <Stat
            label="Best"
            value={`${stats.bestRunDays} ${stats.bestRunDays === 1 ? "day" : "days"}`}
          />
        </div>
        {/* A quiet run note only while one is live; a rested day shows no zero. */}
        {stats.currentRunDays > 0 && (
          <p className="mt-3 text-xs text-jade">
            {stats.currentRunDays} {stats.currentRunDays === 1 ? "day" : "days"} in a
            row
          </p>
        )}
      </div>
    </section>
  );
}

function FirstQuestCard() {
  return (
    <section className="rise mt-10 [animation-delay:120ms]">
      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          First quest
        </p>
        <h2 className="mt-2 font-display text-xl text-ink">
          Choose a dhikr and begin.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Pick a quest, count with intention, and watch your journey of light
          grow. Everything stays on your device.
        </p>
        <Link
          href="/explore"
          className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          Choose your first quest
        </Link>
      </div>
    </section>
  );
}

const HOW_IT_WORKS_STEPS = [
  {
    title: "Choose a quest",
    body: "Pick a dhikr with a target, like 33 or 100. Every quest shows the Arabic, its meaning, and its source, so you always know what you are reciting.",
  },
  {
    title: "Count with intention",
    body: "A calm, fullscreen counter: tap to count, undo anytime. It works fully offline, and your practice stays private on your device.",
  },
  {
    title: "Watch your Journey grow",
    body: "Reaching the target extends your path of light. Completing a quest is a milestone, not an ending - the Amal stays with you, ready to practice any day.",
  },
];

function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="rise mt-5 [animation-delay:180ms]"
    >
      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          First visit?
        </p>
        <h2
          id="how-it-works-heading"
          className="mt-2 font-display text-xl text-ink"
        >
          How Amalyn works
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Amalyn turns daily dhikr into a gentle journey: each quest gives your
          remembrance a beginning, a rhythm, and a visible path.
        </p>
        <ol className="mt-5 space-y-4">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3.5">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-xs font-semibold text-accent"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[15px] text-ink">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-3">
          No streaks to break, no points, no pressure - and no finish line.
          Just your practice, at your pace.
        </p>
      </div>
    </section>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
