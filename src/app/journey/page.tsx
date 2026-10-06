"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Stat } from "@/components/stat";
import { dhikrForQuest, publicQuests, type Quest } from "@/lib/content";
import { formatCount, formatShortDate } from "@/lib/format";
import {
  getAllProgress,
  getPracticeEvents,
  type QuestProgress,
} from "@/lib/db/events";
import {
  allQuestsCompleted,
  completedDhikrCount,
  derivePracticeStats,
  type PracticeEvent,
} from "@/lib/practice";

interface Waypoint {
  title: string;
  date: string;
  x: number;
  y: number;
  variant: "completed" | "up-next" | "continues";
}

const ROW_H = 132;
const TOP_PAD = 56;
const X_LEFT = 92;
const X_RIGHT = 248;

export default function JourneyPage() {
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

  const completed = (progress
    ? completedQuestsInOrder(progress)
    : []
  ).map(({ quest, entry }, index) => ({
    quest,
    entry,
    x: index % 2 === 0 ? X_LEFT : X_RIGHT,
    y: TOP_PAD + index * ROW_H,
  }));

  const nextQuest = progress
    ? publicQuests().find((quest) => !progress.get(quest.id)?.completedAt)
    : undefined;
  const journeyComplete = progress ? allQuestsCompleted(progress) : false;
  // `now` arrives with the loaded data, so this stays render-pure; the value
  // is only read once the skeleton branch is gone.
  const stats = derivePracticeStats(events ?? [], now);

  const points: Waypoint[] = completed.map(({ quest, entry, x, y }) => ({
    title: `${dhikrForQuest(quest).names.en} - ${formatCount(quest.target)}x`,
    date: entry.completedAt ? `Completed ${formatShortDate(entry.completedAt)}` : "",
    x,
    y,
    variant: "completed",
  }));
  if (nextQuest) {
    points.push({
      title: `${dhikrForQuest(nextQuest).names.en} - ${formatCount(nextQuest.target)}x`,
      date: "Up next",
      x: completed.length % 2 === 0 ? X_LEFT : X_RIGHT,
      y: TOP_PAD + completed.length * ROW_H,
      variant: "up-next",
    });
  } else if (journeyComplete && completed.length > 0) {
    points.push({
      title: "Your Journey continues",
      date: `${completed.length} of ${publicQuests().length} quests complete`,
      x: completed.length % 2 === 0 ? X_LEFT : X_RIGHT,
      y: TOP_PAD + completed.length * ROW_H,
      variant: "continues",
    });
  }

  const hasAnyProgress = (progress?.size ?? 0) > 0;
  const totalDhikr = [...(progress?.values() ?? [])].reduce(
    (sum, entry) => sum + entry.count,
    0,
  );
  // The lit path runs through every milestone - and, once each quest has
  // been discovered, through the continuation point itself.
  const litLength = journeyComplete ? completed.length + 1 : completed.length;

  return (
    <div className="flex flex-1 flex-col">
      <header className="rise">
        <h1 className="font-display text-[2rem] text-ink lg:text-4xl">Journey</h1>
        <p className="mt-1 text-sm text-ink-2">Your path of light.</p>
      </header>

      {progress === null || events === null ? (
        <div className="mt-8 h-64 animate-pulse rounded-3xl bg-surface" aria-hidden="true" />
      ) : !hasAnyProgress ? (
        <div className="rise mt-10 rounded-3xl border border-line bg-surface p-6 text-center [animation-delay:100ms]">
          <p className="font-display text-lg text-ink">
            Your path begins with the first quest.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Every completed quest adds a light to this path.
          </p>
          <Link
            href="/explore"
            className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
          >
            Choose a quest
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-6 lg:items-start">
          <div className="rise mt-6 grid grid-cols-3 gap-3 [animation-delay:80ms] lg:col-span-5 lg:sticky lg:top-10 lg:mt-0 lg:self-start">
            <Stat label="Days" value={String(stats.daysPracticed)} />
            <Stat label="Quests" value={String(completed.length)} />
            <Stat label="Dhikr" value={formatCount(totalDhikr)} />
          </div>

          <div className="rise mt-4 [animation-delay:160ms] lg:col-span-7 lg:mt-0 lg:[animation-delay:80ms]">
            <svg
              viewBox={`0 0 340 ${TOP_PAD + (points.length - 1) * ROW_H + 110}`}
              className="w-full lg:mx-auto lg:block lg:max-w-md"
              role="img"
              aria-label={`Journey with ${completed.length} completed quests`}
            >
              <path
                d={pathThrough(points)}
                fill="none"
                stroke="var(--line)"
                strokeWidth="2"
                strokeDasharray="1 8"
                strokeLinecap="round"
              />
              {litLength > 0 && (
                <path
                  d={pathThrough(points.slice(0, litLength))}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 7px var(--glow))" }}
                />
              )}
              {points.map((point) => (
                <WaypointNode key={`${point.title}-${point.y}`} point={point} />
              ))}
            </svg>
          </div>

          {journeyComplete && (
            <div className="rise rounded-3xl border border-line bg-surface p-6 [animation-delay:240ms] lg:col-span-5 lg:mt-0 lg:self-start lg:[animation-delay:160ms]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                Your Journey continues
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                {completedDhikrCount(progress)}{" "}
                {completedDhikrCount(progress) === 1 ? "Amal is" : "Amals are"} now
                part of your practice. Return to any of them, any day - the path
                grows with you.
              </p>
              <p className="mt-3 text-xs text-ink-3">
                This month {formatCount(stats.thisMonthCount)} dhikr
                {stats.thisMonthCount > stats.lastMonthCount &&
                  ` - +${formatCount(stats.thisMonthCount - stats.lastMonthCount)} over last month`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Completed quests with their milestone entries, in completion order. */
function completedQuestsInOrder(
  progress: Map<string, QuestProgress>,
): Array<{ quest: Quest; entry: QuestProgress }> {
  return publicQuests()
    .map((quest) => ({ quest, entry: progress.get(quest.id) }))
    .filter(
      (row): row is { quest: Quest; entry: QuestProgress } =>
        Boolean(row.entry?.completedAt),
    )
    .sort((a, b) => (a.entry.completedAt ?? 0) - (b.entry.completedAt ?? 0));
}

function WaypointNode({ point }: { point: Waypoint }) {
  return (
    <g>
      {(point.variant === "completed" || point.variant === "continues") && (
        <circle cx={point.x} cy={point.y} r="19" fill="var(--glow)" />
      )}
      <circle
        cx={point.x}
        cy={point.y}
        r="8.5"
        fill={point.variant === "completed" ? "var(--accent)" : "var(--bg)"}
        stroke={point.variant === "up-next" ? "var(--ink-3)" : "var(--accent)"}
        strokeWidth="2"
        strokeDasharray={point.variant === "up-next" ? "3 3" : undefined}
      />
      {point.variant === "continues" && (
        <circle cx={point.x} cy={point.y} r="3" fill="var(--accent)" />
      )}
      <text
        x={point.x === X_LEFT ? point.x + 26 : point.x - 26}
        y={point.y - 2}
        textAnchor={point.x === X_LEFT ? "start" : "end"}
        className="fill-current text-ink"
        fontSize="12"
        fontWeight="600"
      >
        {point.title}
      </text>
      <text
        x={point.x === X_LEFT ? point.x + 26 : point.x - 26}
        y={point.y + 16}
        textAnchor={point.x === X_LEFT ? "start" : "end"}
        fontSize="11"
        className={
          point.variant === "up-next"
            ? "fill-current text-accent"
            : "fill-current text-ink-3"
        }
      >
        {point.date}
      </text>
    </g>
  );
}

function pathThrough(points: Waypoint[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    const midY = (prev.y + current.y) / 2;
    d += ` C ${prev.x} ${midY}, ${current.x} ${midY}, ${current.x} ${current.y}`;
  }
  return d;
}
