"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MissingQuest } from "@/components/missing-quest";
import { dhikrForQuest, getQuest } from "@/lib/content";
import { formatCount } from "@/lib/format";
import {
  getProgress,
  recordIncrement,
  recordQuestCompleted,
  recordQuestStarted,
  recordUndo,
} from "@/lib/db/events";
import { useSettings } from "@/lib/settings";
import { playTick } from "@/lib/tick";

interface Milestone {
  fraction: number;
  message: string;
}

const MILESTONES: Milestone[] = [
  { fraction: 0.25, message: "A quarter of the way" },
  { fraction: 0.5, message: "Halfway there" },
  { fraction: 0.75, message: "Three quarters done" },
  { fraction: 0.9, message: "Almost there" },
];

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

export default function CountPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const quest = getQuest(params.id);

  const haptics = useSettings((state) => state.haptics);
  const sound = useSettings((state) => state.sound);
  const wakeLock = useSettings((state) => state.wakeLock);

  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  // Refs mirror count so rapid taps never read stale render state.
  const countRef = useRef(0);
  const seenMilestones = useRef<Set<number>>(new Set());
  const completing = useRef(false);
  const noteTimer = useRef<number | null>(null);

  // Load existing progress, seed milestone state, mark the quest started.
  useEffect(() => {
    if (!quest) return;
    let cancelled = false;
    (async () => {
      const entry = await getProgress(quest.id).catch(() => undefined);
      if (cancelled) return;
      const existing = entry?.count ?? 0;
      countRef.current = existing;
      setCount(existing);
      if (entry) {
        for (const milestone of MILESTONES) {
          if (existing / quest.target >= milestone.fraction) {
            seenMilestones.current.add(milestone.fraction);
          }
        }
      }
      if (!entry?.startedAt) {
        await recordQuestStarted(quest.id).catch(() => {});
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
      if (noteTimer.current !== null) window.clearTimeout(noteTimer.current);
    };
  }, [quest]);

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
    if (!quest || completing.current || !ready) return;
    countRef.current += 1;
    const next = countRef.current;
    setCount(next);
    setPulse((value) => value + 1);
    if (haptics && "vibrate" in navigator) navigator.vibrate(8);
    if (sound) playTick();
    // Persistence is fire-and-forget: the UI never waits on IndexedDB.
    void recordIncrement(quest.id).catch(() => {});

    const fraction = next / quest.target;
    const milestone = MILESTONES.find(
      (entry) => fraction >= entry.fraction && !seenMilestones.current.has(entry.fraction),
    );
    if (milestone) {
      seenMilestones.current.add(milestone.fraction);
      setNote(milestone.message);
      if (noteTimer.current !== null) window.clearTimeout(noteTimer.current);
      noteTimer.current = window.setTimeout(() => setNote(null), 2200);
    }

    if (next >= quest.target) {
      completing.current = true;
      void recordQuestCompleted(quest.id)
        .catch(() => {
          // Completion event write failed; retry happens via progress check on the completion screen.
        })
        .finally(() => {
          router.push(`/quest/${quest.id}/complete`);
        });
    }
  }, [quest, ready, haptics, sound, router]);

  const undo = useCallback(() => {
    if (!quest || countRef.current <= 0 || completing.current) return;
    countRef.current -= 1;
    setCount(countRef.current);
    void recordUndo(quest.id).catch(() => {});
  }, [quest]);

  if (!quest) return <MissingQuest />;

  const dhikr = dhikrForQuest(quest);
  const fraction = Math.min(count / quest.target, 1);
  const percent = Math.round(fraction * 100);

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header
        className="flex items-center justify-between gap-3 px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)" }}
      >
        <button
          onClick={() => router.push(`/quest/${quest.id}`)}
          aria-label="Leave counter (progress is saved)"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink active:scale-90"
        >
          <CloseIcon />
        </button>
        <p className="min-w-0 truncate text-sm font-medium text-ink-2">
          {dhikr.names.en}
        </p>
        <button
          onClick={undo}
          disabled={count <= 0}
          aria-label="Undo one count"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink active:scale-90 disabled:opacity-30"
        >
          <UndoIcon />
        </button>
      </header>

      <button
        onPointerDown={tap}
        onClick={(event) => {
          // Keyboard activation arrives as click with detail 0; pointer taps
          // are already handled above.
          if (event.detail === 0) tap();
        }}
        disabled={!ready}
        aria-label={`Count one ${dhikr.names.en}. ${formatCount(count)} of ${formatCount(quest.target)}.`}
        className="relative flex flex-1 select-none flex-col items-center justify-center gap-5 rounded-3xl px-6 focus-visible:outline-2 focus-visible:outline-offset-[-10px] focus-visible:outline-accent"
      >
        <span className="font-arabic text-lg leading-relaxed text-ink-3" dir="rtl" lang="ar">
          {dhikr.arabic}
        </span>
        <span
          key={pulse}
          className={`font-display text-[clamp(4.5rem,24vw,7.5rem)] leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums] ${
            pulse > 0 ? "count-pulse" : ""
          }`}
          aria-hidden="true"
        >
          {formatCount(count)}
        </span>
        <span className="text-sm text-ink-3">
          of {formatCount(quest.target)}
        </span>
        <div
          className="h-1.5 w-44 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quest progress"
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
          Tap anywhere to count
        </p>
      </footer>
    </div>
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
