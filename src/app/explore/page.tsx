"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CATEGORIES,
  dhikrForQuest,
  publicQuests,
  type CategoryId,
} from "@/lib/content";
import { getAllProgress, type QuestProgress } from "@/lib/db/events";
import { formatCount } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";

type Filter = "all" | CategoryId;

export default function ExplorePage() {
  const copy = useCopy();
  const lang = useLang();
  const FILTERS: Array<{ id: Filter; label: string }> = [
    { id: "all", label: copy.allFilter },
    ...CATEGORIES.map((category) => ({ id: category.id as Filter, label: localized(category.name, lang) })),
  ];
  const [filter, setFilter] = useState<Filter>("all");
  const [progress, setProgress] = useState<Map<string, QuestProgress> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllProgress()
      .then((map) => {
        if (!cancelled) setProgress(map);
      })
      .catch(() => {
        if (!cancelled) setProgress(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const quests = publicQuests().filter(
    (quest) => filter === "all" || dhikrForQuest(quest).category === filter,
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="rise">
        <h1 className="font-display text-[2rem] text-ink lg:text-4xl">{copy.exploreTitle}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {copy.exploreSubtitle}
        </p>
      </header>

      {progress !== null && quests.length === 0 ? (
        publicQuests().length === 0 ? (
          // Production catalog is still behind the verification gate:
          // an honest empty state instead of a blank page under the filters.
          <section className="rise mt-10 rounded-3xl border border-line bg-surface p-6 text-center [animation-delay:80ms]">
            <p className="font-display text-lg text-ink">
              {copy.preparingQuests}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {copy.verificationEmpty}
            </p>
          </section>
        ) : (
          // A filter with no matches differs from an empty catalog: say so
          // instead of implying the whole app is still being prepared.
          <section className="rise mt-10 rounded-3xl border border-line bg-surface p-6 text-center [animation-delay:80ms]">
            <p className="text-sm leading-relaxed text-ink-2">
              {copy.noCategoryQuests}
            </p>
          </section>
        )
      ) : (
        <>
          <div
            role="group"
            aria-label={copy.filterAria}
            className="no-scrollbar rise -mx-5 mt-5 overflow-x-auto px-5 [animation-delay:80ms] lg:mx-0 lg:flex-wrap lg:overflow-x-visible lg:px-0"
          >
            <div className="flex w-max gap-2 lg:w-auto lg:flex-wrap">
              {FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  aria-pressed={filter === id}
                  className={`h-9 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors active:opacity-70 ${
                    filter === id
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-surface text-ink-2 hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {progress === null ? (
            <div className="mt-5 space-y-3 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-3 xl:grid-cols-3" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="h-[72px] animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
          ) : (
            <ul className="rise mt-5 space-y-3 [animation-delay:140ms] lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-3 xl:grid-cols-3">
              {quests.map((quest) => {
                const dhikr = dhikrForQuest(quest);
                const entry = progress.get(quest.id);
                const complete = Boolean(entry?.completedAt);
                const entryCount = entry?.count ?? 0;
                const inProgress = !complete && entryCount > 0;
                const percent = Math.min(
                  Math.round((entryCount / quest.target) * 100),
                  100,
                );
                const categoryName = CATEGORIES.find(
                  (category) => category.id === dhikr.category,
                );
                return (
                  <li key={quest.id}>
                    <Link
                      href={`/quest/${quest.id}`}
                      className="flex min-h-[72px] items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent-deep/50 active:bg-surface-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-[17px] text-ink">
                          {localized(dhikr.names, lang)}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-3">
                          {formatCount(quest.target, lang)}x
                          {categoryName ? ` - ${localized(categoryName.name, lang)}` : ""}
                        </p>
                        {inProgress && (
                          <div
                            className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-surface-2"
                            aria-hidden="true"
                          >
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {complete ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-jade">
                          <CheckIcon />
                          {copy.completeBadge}
                        </span>
                      ) : inProgress ? (
                        <span className="text-xs font-medium text-ink-2">
                          {formatCount(entryCount, lang)} /{" "}
                          {formatCount(quest.target, lang)}
                        </span>
                      ) : (
                        <ChevronIcon />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink-3"
      />
    </svg>
  );
}
