"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dhikrForQuest, publicQuests, type Quest } from "@/lib/content";
import { formatCount, formatShortDate, todayStart } from "@/lib/format";
import {
  getAllProgress,
  getFirstEventAt,
  type QuestProgress,
} from "@/lib/db/events";

interface Waypoint {
  title: string;
  date: string;
  x: number;
  y: number;
  next: boolean;
}

const ROW_H = 132;
const TOP_PAD = 56;
const X_LEFT = 92;
const X_RIGHT = 248;
const DAY_MS = 86_400_000;

export default function JourneyPage() {
  const [progress, setProgress] = useState<Map<string, QuestProgress> | null>(null);
  const [firstAt, setFirstAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [map, first] = await Promise.all([getAllProgress(), getFirstEventAt()]);
        if (!cancelled) {
          setProgress(map);
          setFirstAt(first ?? null);
        }
      } catch {
        if (!cancelled) setProgress(new Map());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completed = (progress
    ? publicQuests()
        .map((quest) => ({ quest, entry: progress.get(quest.id) }))
        .filter(
          (row): row is { quest: Quest; entry: QuestProgress } =>
            Boolean(row.entry?.completedAt),
        )
        .sort(
          (a, b) => (a.entry.completedAt ?? 0) - (b.entry.completedAt ?? 0),
        )
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

  const points: Waypoint[] = [
    ...completed.map(({ quest, entry, x, y }) => ({
      title: `${dhikrForQuest(quest).names.en} - ${formatCount(quest.target)}x`,
      date: entry.completedAt ? `Completed ${formatShortDate(entry.completedAt)}` : "",
      x,
      y,
      next: false,
    })),
  ];
  if (nextQuest) {
    points.push({
      title: `${dhikrForQuest(nextQuest).names.en} - ${formatCount(nextQuest.target)}x`,
      date: "Up next",
      x: completed.length % 2 === 0 ? X_LEFT : X_RIGHT,
      y: TOP_PAD + completed.length * ROW_H,
      next: true,
    });
  }

  const hasAnyProgress = (progress?.size ?? 0) > 0;
  const daysPracticed = firstAt
    ? Math.max(1, Math.ceil((todayStart() - firstAt) / DAY_MS) + 1)
    : 0;
  const totalDhikr = [...(progress?.values() ?? [])].reduce(
    (sum, entry) => sum + entry.count,
    0,
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="rise">
        <h1 className="font-display text-[2rem] text-ink">Journey</h1>
        <p className="mt-1 text-sm text-ink-2">Your path of light.</p>
      </header>

      {progress === null ? (
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
        <>
          <div className="rise mt-6 grid grid-cols-3 gap-3 [animation-delay:80ms]">
            <Stat label="Days" value={String(daysPracticed)} />
            <Stat label="Quests" value={String(completed.length)} />
            <Stat label="Dhikr" value={formatCount(totalDhikr)} />
          </div>

          <div className="rise mt-4 [animation-delay:160ms]">
            <svg
              viewBox={`0 0 340 ${TOP_PAD + (points.length - 1) * ROW_H + 110}`}
              className="w-full"
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
              {completed.length > 0 && (
                <path
                  d={pathThrough(points.slice(0, completed.length))}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 7px var(--glow))" }}
                />
              )}
              {points.map((point) => (
                <g key={`${point.title}-${point.y}`}>
                  {!point.next && (
                    <circle cx={point.x} cy={point.y} r="19" fill="var(--glow)" />
                  )}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8.5"
                    fill={point.next ? "var(--bg)" : "var(--accent)"}
                    stroke={point.next ? "var(--ink-3)" : "var(--bg)"}
                    strokeWidth="2"
                    strokeDasharray={point.next ? "3 3" : undefined}
                  />
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
                    className={point.next ? "fill-current text-accent" : "fill-current text-ink-3"}
                  >
                    {point.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </>
      )}
    </div>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3 text-center">
      <p className="font-display text-xl text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-3">
        {label}
      </p>
    </div>
  );
}
