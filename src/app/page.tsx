"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StarMark } from "@/components/star-mark";
import { Stat } from "@/components/stat";
import {
  deriveChallengeGroup,
  deriveStrictChallenge,
  groupStrictChallenges,
  type DerivedStrictChallenge,
} from "@/lib/challenge";
import { listStrictChallenges } from "@/lib/db/challenges";
import { formatCount } from "@/lib/format";
import { useCopy, useLang } from "@/lib/i18n";
import {
  getAllProgress,
  getPracticeEvents,
  type QuestProgress,
} from "@/lib/db/events";
import { selectHomeView, type DailyAmal, type HomeView } from "@/lib/home";
import type { StrictChallenge } from "@/lib/db/db";
import type { PracticeEvent, PracticeStats } from "@/lib/practice";

/** One challenge row with its derivation, inside a group. */
interface StrictEntry {
  challenge: StrictChallenge;
  derived: DerivedStrictChallenge;
}

export default function HomePage() {
  const copy = useCopy();
  const lang = useLang();
  const [progress, setProgress] = useState<Map<string, QuestProgress> | null>(null);
  const [events, setEvents] = useState<PracticeEvent[] | null>(null);
  const [challenges, setChallenges] = useState<StrictChallenge[]>([]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [map, log, challengeRows] = await Promise.all([
          getAllProgress(),
          getPracticeEvents(),
          listStrictChallenges().catch(() => []),
        ]);
        if (!cancelled) {
          setProgress(map);
          setEvents(log);
          setChallenges(challengeRows);
          setNow(Date.now());
        }
      } catch {
        if (!cancelled) {
          setProgress(new Map());
          setEvents([]);
          setChallenges([]);
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
        ? selectHomeView({ progress, events, now, lang })
        : null,
    [progress, events, now, lang],
  );

  // Home shows ONE Challenge row no matter how many commitments run: the
  // row aggregates every active group's state and hands off to /challenge,
  // where the full list lives. Finished and broken ones live on /challenge
  // only, and with none active the invitation row returns.
  const activeEntries: StrictEntry[] =
    events && now > 0
      ? groupStrictChallenges(challenges)
          .map((group) => {
            const byId = new Map(
              challenges.map((challenge) => [challenge.id, challenge]),
            );
            const entries: StrictEntry[] = group.rows.map((row) => ({
              challenge: byId.get(row.id) ?? row,
              derived: deriveStrictChallenge(
                byId.get(row.id) ?? row,
                events,
                now,
              ),
            }));
            return {
              entries,
              status: deriveChallengeGroup({ ...group, derived: entries.map((entry) => entry.derived) }),
            };
          })
          .filter((group) => group.status === "active")
          .flatMap((group) => group.entries)
      : [];

  return (
    <div className="flex flex-1 flex-col">
      <header className="rise pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-3">
          Amalyn
        </p>
        <h1 className="mt-4 font-display text-[2.15rem] leading-[1.12] text-ink lg:text-5xl lg:leading-[1.08]">
          {copy.greeting}
        </h1>
        {view && view.kind !== "first-visit" && view.todayTotal > 0 && (
          <p className="mt-3 text-[15px] text-ink-2">
            {copy.todayLine(formatCount(view.todayTotal, lang))}
          </p>
        )}
      </header>

      {view === null ? (
        <div className="mt-10 h-56 animate-pulse rounded-3xl bg-surface" aria-hidden="true" />
      ) : view.kind === "first-visit" ? (
        // One centered column: action first (the suggested quest), then the
        // challenge entry, then the collapsible explainer last.
        <div className="flex flex-col lg:mx-auto lg:max-w-2xl">
          <FirstQuestCard
            questId={view.questId}
            name={view.name}
            target={view.target}
          />
          {activeEntries.length > 0 ? (
            <StrictRow entries={activeEntries} />
          ) : (
            <StrictRow entries={null} />
          )}
          <HowItWorks />
        </div>
      ) : (
        <div className="flex flex-col lg:mt-10 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-6 lg:items-start">
          {view.kind === "active-quest" ? (
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
          ) : (
            <section className="rise mt-10 [animation-delay:120ms] lg:col-span-7 lg:mt-0">
              <div
                className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                  {copy.nextStep}
                </p>
                <h2 className="mt-2 font-display text-xl text-ink">
                  {view.name}
                </h2>
                <p className="mt-1 text-sm text-ink-2">
                  {formatCount(view.target, lang)}x
                </p>
                <Link
                  href={`/quest/${view.questId}`}
                  className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
                >
                  {copy.startThisQuest}
                </Link>
                <Link
                  href="/explore"
                  className="mt-3 block text-center text-xs font-medium text-ink-3 transition-colors hover:text-ink"
                >
                  {copy.orChooseAnother}
                </Link>
              </div>
            </section>
          )}

          {/* Mobile reads hero -> challenge strip -> journey nav; the lg
              order utilities put the full-width strip back below the hero
              row on desktop, where the journey link fills the hero's right
              column. */}
          {activeEntries.length > 0 ? (
            <StrictRow entries={activeEntries} className="lg:order-3 lg:mt-0" />
          ) : (
            <StrictRow entries={null} className="lg:order-3 lg:mt-0" />
          )}

          <Link
            href="/journey"
            className="rise mt-5 flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors hover:bg-surface-2 active:bg-surface-2 [animation-delay:300ms] lg:order-2 lg:col-span-5 lg:col-start-8 lg:mt-0 lg:[animation-delay:180ms]"
          >
            <span className="min-w-0">
              <span className="block text-sm text-ink">{copy.viewJourney}</span>
              {view.kind === "all-complete" && (
                <span className="mt-0.5 block text-xs text-ink-3">
                  {copy.questsCompleteOf(formatCount(view.completedCount, lang), formatCount(view.questTotal, lang))}
                </span>
              )}
            </span>
            <span aria-hidden="true" className="text-ink-3">
              <Chevron />
            </span>
          </Link>
        </div>
      )}

      <p className="rise mt-auto pb-2 pt-10 text-center text-xs text-ink-3 [animation-delay:280ms]">
        {copy.freeForever}
      </p>
    </div>
  );
}

/**
 * The Simple Challenge entry: home's clear second tier - louder than a
 * nav row, quieter than the quest hero. Always a SINGLE row named
 * "Challenge", whatever is running: the subtitle aggregates every active
 * commitment (how many run, how much of today is done); the full list of
 * started challenges lives on /challenge, one tap away. A dial tells the
 * aggregated state at a glance (arc = average place in the windows,
 * center = best live streak) and the tone follows the status calmly,
 * never punitively: gold while running, jade when today's amals are all
 * done. Always rendered so the challenge stays reachable before the
 * first one is ever started; with none active, a dashed dial around a
 * plus is the invitation.
 */
type StrictTone = "accent" | "jade" | "danger" | "idle";

/* Whole literals so Tailwind's scanner sees every tone's classes. */
const STRIP_TONE_CLASSES: Record<StrictTone, string> = {
  accent:
    "border-accent/30 bg-accent/[0.05] hover:bg-accent/[0.1] active:bg-accent/[0.1]",
  jade: "border-jade/30 bg-jade/[0.05] hover:bg-jade/[0.1] active:bg-jade/[0.1]",
  danger:
    "border-danger/30 bg-danger/[0.05] hover:bg-danger/[0.1] active:bg-danger/[0.1]",
  idle: "border-line bg-surface hover:bg-surface-2 active:bg-surface-2",
};

const DIAL_TONE_CLASSES: Record<StrictTone, string> = {
  accent: "text-accent",
  jade: "text-jade",
  danger: "text-danger",
  idle: "text-accent",
};

function StrictRow({
  entries,
  className = "",
}: {
  entries: StrictEntry[] | null;
  className?: string;
}) {
  const copy = useCopy();
  const lang = useLang();

  let tone: StrictTone = "idle";
  let dashed = true;
  let percent = 0;
  let streak: number | null = null;
  // The single row always carries the product name; the subtitle carries
  // the aggregated facts.
  const title = copy.strictTitle;
  let line = copy.strictTagline;
  if (entries && entries.length > 0) {
    dashed = false;
    streak = Math.max(...entries.map((entry) => entry.derived.streakDays));
    // Dial: average place in the window across commitments.
    const percents = entries.map(({ challenge, derived }) =>
      challenge.durationDays > 0
        ? (derived.dayNumber / challenge.durationDays) * 100
        : 0,
    );
    percent = percents.reduce((sum, value) => sum + value, 0) / percents.length;
    const doneToday = entries.filter((entry) => entry.derived.todayComplete);
    const commitmentIds = new Set(
      entries.map(({ challenge }) => challenge.groupId ?? challenge.id),
    );
    const singleCommitment = commitmentIds.size === 1;
    const first = entries[0];
    if (doneToday.length === entries.length) {
      tone = "jade";
      line =
        commitmentIds.size > 1
          ? `${copy.strictChallengesRunning(formatCount(commitmentIds.size, lang))} · ${copy.strictTodayComplete}`
          : copy.strictTodayComplete;
    } else if (singleCommitment) {
      tone = "accent";
      line =
        entries.length === 1
          ? `${formatCount(first.derived.todayCount, lang)} / ${formatCount(
              first.challenge.dailyTarget,
              lang,
            )} · ${copy.strictDayProgress(
              formatCount(first.derived.dayNumber, lang),
              formatCount(first.challenge.durationDays, lang),
            )}`
          : `${copy.strictTodayAmalsDone(
              formatCount(doneToday.length, lang),
              formatCount(entries.length, lang),
            )} · ${copy.strictDayProgress(
              formatCount(first.derived.dayNumber, lang),
              formatCount(first.challenge.durationDays, lang),
            )}`;
    } else {
      tone = "accent";
      line = `${copy.strictChallengesRunning(formatCount(commitmentIds.size, lang))} · ${copy.strictTodayAmalsDone(
        formatCount(doneToday.length, lang),
        formatCount(entries.length, lang),
      )}`;
    }
  }

  return (
    <Link
      href="/challenge"
      className={`rise col-span-12 mt-5 flex items-center gap-4 rounded-2xl border px-4 py-4 transition-colors [animation-delay:240ms] ${className} ${STRIP_TONE_CLASSES[tone]}`}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 ${DIAL_TONE_CLASSES[tone]}`}
      >
        <ChallengeDial percent={percent} dashed={dashed}>
          {streak !== null ? (
            <span className="text-[13px] font-semibold leading-none tabular-nums">
              {formatCount(streak, lang)}
            </span>
          ) : null}
        </ChallengeDial>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-2">{line}</span>
      </span>
      <span aria-hidden="true" className="text-ink-3">
        <Chevron />
      </span>
    </Link>
  );
}

/**
 * The commitment dial: the ring's arc is the challenge window's progress
 * and the center slot holds the live streak. Purely decorative - the
 * strip's text states the same facts for assistive tech. Dashed (no
 * challenge yet), the ring circles a plus: a commitment waiting to be
 * made.
 */
function ChallengeDial({
  percent,
  dashed = false,
  children,
}: {
  percent: number;
  dashed?: boolean;
  children?: ReactNode;
}) {
  const radius = 20.5;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <span className="relative block h-12 w-12">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-[0.15]"
          {...(dashed ? { strokeDasharray: "1.5 5.5" } : {})}
        />
        {!dashed && clamped > 0 && (
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {children ?? (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path
              d="M8 3.5v9M3.5 8h9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </span>
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
  const copy = useCopy();
  const lang = useLang();
  const percent = Math.min(Math.round((count / target) * 100), 100);
  return (
    <section className="rise mt-10 [animation-delay:120ms] lg:col-span-7 lg:mt-0">
      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {copy.currentQuest}
        </p>
        <h2 className="mt-2 font-display text-xl text-ink">{name}</h2>
        <p className="mt-1 text-sm text-ink-2">
          {formatCount(count, lang)} / {formatCount(target, lang)}
        </p>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={copy.currentQuestProgressAria}
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
          {copy.continueQuest}
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
  const copy = useCopy();
  const lang = useLang();
  const done = daily.todayCount >= daily.target;
  const percent = Math.min(Math.round((daily.todayCount / daily.target) * 100), 100);
  return (
    <section className="rise mt-10 [animation-delay:120ms] lg:col-span-7 lg:mt-0">
      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {copy.todaysAmal}
        </p>
        <h2 className="mt-2 font-display text-xl text-ink">{daily.name}</h2>
        {done ? (
          <>
            <p className="mt-1 text-sm text-jade">
              {copy.timesComplete(formatCount(daily.target, lang))}
            </p>
            <p className="mt-1 text-sm text-ink-2">
              {copy.todayCountLine(formatCount(daily.todayCount, lang))}
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-2">
              {formatCount(daily.todayCount, lang)} / {formatCount(daily.target, lang)}
            </p>
            <div
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={copy.todaysAmalProgressAria}
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
              {copy.practiceNow}
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
  const copy = useCopy();
  const lang = useLang();
  return (
    <section className="rise mt-5 [animation-delay:180ms] lg:col-span-5 lg:col-start-8 lg:mt-0 lg:[animation-delay:120ms]">
      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {copy.yourProgress}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label={copy.daysPracticed} value={formatCount(stats.daysPracticed, lang)} />
          <Stat label={copy.statTotal} value={formatCount(totalDhikr, lang)} />
          <Stat
            label={copy.statBest}
            value={copy.dayCount(formatCount(stats.bestRunDays, lang))}
          />
        </div>
        {/* A quiet run note only while one is live; a rested day shows no zero. */}
        {stats.currentRunDays > 0 && (
          <p className="mt-3 text-xs text-jade">
            {copy.daysInARow(formatCount(stats.currentRunDays, lang))}
          </p>
        )}
      </div>
    </section>
  );
}

function FirstQuestCard({
  questId,
  name,
  target,
}: {
  questId: string;
  name: string;
  target: number;
}) {
  const copy = useCopy();
  const lang = useLang();
  return (
    <section className="rise mt-10 [animation-delay:120ms]">
      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {copy.firstQuest}
        </p>
        <h2 className="mt-2 font-display text-xl text-ink">{name}</h2>
        <p className="mt-1 text-sm text-ink-2">{formatCount(target, lang)}x</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {copy.firstQuestBody}
        </p>
        <Link
          href={`/quest/${questId}`}
          className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          {copy.beginSuggested}
        </Link>
        <Link
          href="/explore"
          className="mt-3 block text-center text-xs font-medium text-ink-3 transition-colors hover:text-ink"
        >
          {copy.orChooseAnother}
        </Link>
      </div>
    </section>
  );
}

/**
 * The first-visit explainer: collapsed by default so the screen opens on
 * actions, not prose. The header row is the toggle; expanding reveals the
 * three quest steps, the no-pressure note, and a short primer on the
 * Simple Challenge - what it is and what happens when a day is missed.
 */
function HowItWorks() {
  const copy = useCopy();
  const [open, setOpen] = useState(false);
  const steps = [
    { title: copy.howStep1Title, body: copy.howStep1Body },
    { title: copy.howStep2Title, body: copy.howStep2Body },
    { title: copy.howStep3Title, body: copy.howStep3Body },
  ];
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="rise mt-5 [animation-delay:300ms]"
    >
      <div className="rounded-3xl border border-line bg-surface">
        <h2 id="how-it-works-heading">
          <button
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="how-it-works-body"
            className="flex w-full items-center justify-between gap-3 p-6 text-left"
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                {copy.firstVisit}
              </span>
              <span className="mt-2 block font-display text-xl text-ink">
                {copy.howAmalynWorks}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`shrink-0 text-ink-3 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            >
              <CollapseChevron />
            </span>
          </button>
        </h2>
        {open && (
          <div id="how-it-works-body" className="px-6 pb-6">
            <p className="text-sm leading-relaxed text-ink-2">
              {copy.howItWorksIntro}
            </p>
            <ol className="mt-5 space-y-4">
              {steps.map((step, index) => (
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
              {copy.noStreaks}
            </p>
            <div className="mt-4 border-t border-line pt-4">
              <h3 className="font-display text-[15px] text-ink">
                {copy.strictTitle}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">
                {copy.howChallengeBody}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CollapseChevron() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M3.5 6 8 10.5 12.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
