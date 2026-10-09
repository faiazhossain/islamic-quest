"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { StarMark } from "@/components/star-mark";
import {
  challengeStreamId,
  deriveStrictChallenge,
  groupStrictChallenges,
} from "@/lib/challenge";
import { getDhikr } from "@/lib/content";
import { listStrictChallenges } from "@/lib/db/challenges";
import { getPracticeEvents, recordIncrement, recordUndo } from "@/lib/db/events";
import { formatCount } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { playTick } from "@/lib/tick";
import type { StrictChallenge } from "@/lib/db/db";

/*
 * The challenge's fullscreen counter: the same worship moment as the quest
 * counter (/quest/[id]/count) - the whole screen is the tap surface, one
 * tap is one dhikr. It counts today's net count toward the daily target of
 * one commitment; reaching the target acknowledges quietly and returns to
 * the challenge overview. Deliberately a sibling page rather than a shared
 * component: the quest counter's completion routes onward, this one closes
 * in place.
 */

interface Milestone {
  fraction: number;
  key: "quarter" | "half" | "threeQuarters" | "almost";
}

const MILESTONES: Milestone[] = [
  { fraction: 0.25, key: "quarter" },
  { fraction: 0.5, key: "half" },
  { fraction: 0.75, key: "threeQuarters" },
  { fraction: 0.9, key: "almost" },
];

const MILESTONE_COPY = {
  quarter: "milestoneQuarter",
  half: "milestoneHalf",
  threeQuarters: "milestoneThreeQuarters",
  almost: "milestoneAlmost",
} as const;

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

export default function ChallengeCountPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const copy = useCopy();
  const lang = useLang();

  const haptics = useSettings((state) => state.haptics);
  const sound = useSettings((state) => state.sound);
  const wakeLock = useSettings((state) => state.wakeLock);

  const [challenge, setChallenge] = useState<StrictChallenge | null>(null);
  const [dayNumber, setDayNumber] = useState(1);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  // True when finishing today's target finishes the whole commitment: the
  // last day of the window, with every sibling amal settled. The done
  // overlay then offers the milestone share card.
  const [completingGroup, setCompletingGroup] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  // Refs mirror count so rapid taps never read stale render state.
  const countRef = useRef(0);
  const seenMilestones = useRef<Set<number>>(new Set());
  const doneRef = useRef<HTMLAnchorElement | null>(null);
  const noteTimer = useRef<number | null>(null);

  // Load the commitment and seed today's net count. Anything but an
  // active, unfinished day belongs to the overview (unknown id, a broken
  // or finished challenge, or a day already complete), so hand the visit
  // straight back.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [challenges, events] = await Promise.all([
          listStrictChallenges(),
          getPracticeEvents(),
        ]);
        if (cancelled) return;
        const row = challenges.find((entry) => entry.id === params.id) ?? null;
        const derived = row
          ? deriveStrictChallenge(row, events, Date.now())
          : null;
        if (
          !row ||
          !derived ||
          derived.status !== "active" ||
          derived.todayComplete
        ) {
          router.replace("/challenge");
          return;
        }
        countRef.current = derived.todayCount;
        setCount(derived.todayCount);
        for (const milestone of MILESTONES) {
          if (derived.todayCount / row.dailyTarget >= milestone.fraction) {
            seenMilestones.current.add(milestone.fraction);
          }
        }
        // Does today's last count complete the whole commitment? The final
        // day of the window, with every sibling amal already settled (done
        // for today, or already complete). The share page re-validates
        // authoritatively; this only decides whether the overlay offers it.
        const group = groupStrictChallenges(challenges).find((entry) =>
          entry.rows.some((entryRow) => entryRow.id === row.id),
        );
        if (group) {
          const byId = new Map(challenges.map((entry) => [entry.id, entry]));
          const others = group.rows
            .filter((entryRow) => entryRow.id !== row.id)
            .map((entryRow) =>
              deriveStrictChallenge(byId.get(entryRow.id) ?? entryRow, events, Date.now()),
            );
          const finalDay = derived.dayNumber === row.durationDays;
          const othersSettled = others.every(
            (entry) =>
              entry.status === "complete" ||
              (entry.status === "active" && entry.todayComplete),
          );
          setCompletingGroup(finalDay && othersSettled);
        }
        setChallenge(row);
        setDayNumber(derived.dayNumber);
        setReady(true);
      } catch {
        if (!cancelled) router.replace("/challenge");
      }
    })();
    return () => {
      cancelled = true;
      if (noteTimer.current !== null) window.clearTimeout(noteTimer.current);
    };
  }, [params.id, router]);

  // Move focus into the acknowledgment so keyboard and screen-reader users
  // are not left on the covered counter.
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  // Keep the screen awake while counting, if enabled and supported.
  useEffect(() => {
    if (!wakeLock) return;
    const { wakeLock: wakeLockApi } = navigator as WakeLockNavigator;
    if (!wakeLockApi) return;
    let sentinel: WakeLockSentinelLike | null = null;
    let stopped = false;
    const acquire = async () => {
      try {
        if (!stopped) sentinel = await wakeLockApi.request("screen");
      } catch {
        // Denied or unsupported; counting works regardless.
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && !stopped) void acquire();
    };
    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release().catch(() => {});
    };
  }, [wakeLock]);

  const tap = useCallback(() => {
    if (!challenge || !ready || done) return;
    countRef.current += 1;
    const next = countRef.current;
    setCount(next);
    setPulse((value) => value + 1);
    if (haptics && "vibrate" in navigator) navigator.vibrate(8);
    if (sound) playTick();
    // Persistence is fire-and-forget: the UI never waits on IndexedDB.
    void recordIncrement(challengeStreamId(challenge)).catch(() => {});

    const fraction = next / challenge.dailyTarget;
    const milestone = MILESTONES.find(
      (entry) =>
        fraction >= entry.fraction && !seenMilestones.current.has(entry.fraction),
    );
    if (milestone) {
      seenMilestones.current.add(milestone.fraction);
      setNote(copy[MILESTONE_COPY[milestone.key]]);
      if (noteTimer.current !== null) window.clearTimeout(noteTimer.current);
      noteTimer.current = window.setTimeout(() => setNote(null), 2200);
    }

    if (next >= challenge.dailyTarget) setDone(true);
  }, [challenge, ready, done, haptics, sound, copy]);

  const undo = useCallback(() => {
    if (!challenge || countRef.current <= 0 || done) return;
    countRef.current -= 1;
    setCount(countRef.current);
    void recordUndo(challengeStreamId(challenge)).catch(() => {});
  }, [challenge, done]);

  const dhikr = challenge ? getDhikr(challenge.dhikrId) : undefined;
  const name = dhikr ? localized(dhikr.names, lang) : "";
  const percent = challenge
    ? Math.min(Math.round((count / challenge.dailyTarget) * 100), 100)
    : 0;

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header
        className="flex items-center justify-between gap-3 px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)" }}
      >
        <button
          onClick={() => router.push("/challenge")}
          aria-label={copy.leaveCounterAria}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink active:scale-90"
        >
          <CloseIcon />
        </button>
        <p className="min-w-0 truncate text-sm font-medium text-ink-2">{name}</p>
        <button
          onClick={undo}
          disabled={count <= 0}
          aria-label={copy.undoCountAria}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink active:scale-90 disabled:opacity-30"
        >
          <UndoIcon />
        </button>
      </header>

      <button
        onPointerDown={(event) => {
          // Only the primary pointer counts: a second simultaneous
          // finger (or a resting palm) must not inflate the count.
          if (event.isPrimary) tap();
        }}
        onClick={(event) => {
          // Keyboard activation arrives as click with detail 0; pointer taps
          // are already handled above.
          if (event.detail === 0) tap();
        }}
        disabled={!ready}
        aria-label={copy.countAria(
          name,
          formatCount(count, lang),
          formatCount(challenge?.dailyTarget ?? 0, lang),
          copy.todaySuffix,
        )}
        className="relative flex flex-1 touch-manipulation select-none flex-col items-center justify-center gap-5 rounded-3xl px-6 focus-visible:outline-2 focus-visible:outline-offset-[-10px] focus-visible:outline-accent"
      >
        {/* The amal itself, readable while reciting — same treatment as
            the quest counter: Arabic, transliteration, then the meaning
            in the reader's language. Scroll gestures inside the block
            must not count; taps do. */}
        {dhikr && (
          <DuaText
            arabic={dhikr.arabic}
            transliteration={dhikr.transliteration}
            meaning={localized(dhikr.meaning, lang)}
            onTap={tap}
          />
        )}
        <span
          key={pulse}
          className={`font-display text-[clamp(4.5rem,24vw,7.5rem)] leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums] ${
            pulse > 0 ? "count-pulse" : ""
          }`}
          aria-hidden="true"
        >
          {formatCount(count, lang)}
        </span>
        <span className="text-sm text-ink-3">
          {challenge
            ? `${copy.ofTarget(formatCount(challenge.dailyTarget, lang))} · ${copy.strictDayProgress(
                formatCount(dayNumber, lang),
                formatCount(challenge.durationDays, lang),
              )}`
            : ""}
        </span>
        <div
          className="h-1.5 w-44 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={copy.strictTodayProgressAria}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>
        {note && (
          <span
            aria-hidden="true"
            className="rise absolute bottom-24 text-sm font-medium text-accent"
          >
            {note}
          </span>
        )}
      </button>

      {/* Persistent live region so milestone messages reach screen readers. */}
      <span role="status" aria-live="polite" className="sr-only">
        {note ?? ""}
      </span>

      <footer
        className="pb-6 pt-2 text-center"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 26px)" }}
      >
        <p
          className={`text-xs text-ink-3 transition-opacity duration-500 ${
            count > 0 ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden={count > 0}
        >
          {copy.tapToCount}
        </p>
      </footer>

      {done && challenge && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.todaysAmalCompleteAria}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 px-6 text-center backdrop-blur-sm"
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
            <StarMark className="relative h-20 w-20 text-accent" />
          </div>
          <p className="rise mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-accent [animation-delay:150ms]">
            {copy.strictTitle}
          </p>
          <h1 className="rise mt-3 font-display text-[2rem] leading-tight text-ink [animation-delay:230ms]">
            {formatCount(challenge.dailyTarget, lang)}x {name}
          </h1>
          <p className="rise mt-3 font-display text-lg italic text-ink-2 [animation-delay:310ms]">
            {copy.alhamdulillah}
          </p>
          <Link
            ref={doneRef}
            href="/challenge"
            className="rise mt-10 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px [animation-delay:420ms]"
          >
            {copy.done}
          </Link>
          {challenge && completingGroup && (
            <Link
              href={`/challenge/${challenge.id}/share`}
              className="rise mt-4 block text-xs font-semibold text-accent transition-colors hover:text-accent-hover [animation-delay:480ms]"
            >
              {copy.strictSeeShareCard}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The recitation text inside the tap surface — see the quest counter's
 * DuaText: instant counting stays on the outer button's pointerdown,
 * while this block counts on pointerup-within-slop so its scrollable
 * long duas never inflate the count.
 */
const TAP_SLOP_PX = 10;

function DuaText({
  arabic,
  transliteration,
  meaning,
  onTap,
}: {
  arabic: string;
  transliteration: string;
  meaning: string;
  onTap: () => void;
}) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  return (
    <span
      className="flex max-h-[38dvh] flex-col items-center gap-1.5 self-stretch overflow-y-auto px-1"
      onPointerDown={(event) => {
        if (!event.isPrimary) return;
        startRef.current = { x: event.clientX, y: event.clientY };
        // Keep the scroll gesture from counting at the outer button.
        event.stopPropagation();
      }}
      onPointerUp={(event) => {
        const start = startRef.current;
        startRef.current = null;
        if (!event.isPrimary || !start) return;
        const moved =
          Math.abs(event.clientX - start.x) + Math.abs(event.clientY - start.y);
        if (moved <= TAP_SLOP_PX) onTap();
      }}
      onPointerCancel={() => {
        startRef.current = null;
      }}
    >
      <span
        className="font-arabic text-[clamp(1.3rem,5.2vw,1.75rem)] leading-[1.9] text-ink"
        dir="rtl"
        lang="ar"
      >
        {arabic}
      </span>
      <span className="text-xs italic text-ink-3">{transliteration}</span>
      <span className="text-sm leading-relaxed text-ink-2">{meaning}</span>
    </span>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M7.5 4.5 4 8l3.5 3.5M4 8h8a4 4 0 0 1 0 8h-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
