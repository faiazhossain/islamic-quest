"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  TOPICS,
  dhikrForQuest,
  publicDhikr,
  publicQuests,
  type CategoryId,
  type Dhikr,
  type Quest,
  type TopicId,
} from "@/lib/content";
import { searchContent } from "@/lib/content/search";
import { getAllProgress, type QuestProgress } from "@/lib/db/events";
import { formatCount } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";

type Filter = "all" | CategoryId;

/**
 * Public topics: a topic chip renders only when at least one public
 * amal links to it, so the registry can stay ahead of verified content
 * without advertising empty shelves.
 */
function topicsWithContent(): TopicId[] {
  const populated = new Set<TopicId>();
  for (const dhikr of publicDhikr()) {
    for (const entry of dhikr.topics ?? []) populated.add(entry.topic);
  }
  return TOPICS.filter((topic) => populated.has(topic.id)).map(
    (topic) => topic.id,
  );
}

export default function ExplorePage() {
  const copy = useCopy();
  const lang = useLang();
  const FILTERS: Array<{ id: Filter; label: string }> = [
    { id: "all", label: copy.allFilter },
    ...CATEGORIES.map((category) => ({ id: category.id as Filter, label: localized(category.name, lang) })),
  ];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [topic, setTopic] = useState<TopicId | "all">("all");
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

  const visibleTopics = useMemo(topicsWithContent, []);
  const quests = publicQuests().filter(
    (quest) => filter === "all" || dhikrForQuest(quest).category === filter,
  );
  const questsForDhikr = useMemo(() => {
    const map = new Map<string, Quest[]>();
    for (const quest of publicQuests()) {
      const list = map.get(quest.dhikrId) ?? [];
      list.push(quest);
      map.set(quest.dhikrId, list);
    }
    return map;
  }, []);

  // Search takes over the whole surface once the query is long enough
  // to mean something; searchContent itself enforces the same minimum.
  const searching = query.trim().length > 0;
  const results = searching ? searchContent(query) : null;
  const hasResults =
    results !== null && (results.dhikrs.length > 0 || results.topics.length > 0);

  const topicDhikrs = useMemo(() => {
    if (topic === "all") return null;
    const duaFor: Dhikr[] = [];
    const occasion: Dhikr[] = [];
    const related: Dhikr[] = [];
    for (const dhikr of publicDhikr()) {
      const link = (dhikr.topics ?? []).find((entry) => entry.topic === topic);
      if (!link) continue;
      if (link.link === "dua-for") duaFor.push(dhikr);
      else if (link.link === "occasion") occasion.push(dhikr);
      else related.push(dhikr);
    }
    return { duaFor, occasion, related };
  }, [topic]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="rise">
        <h1 className="font-display text-[2rem] text-ink lg:text-4xl">{copy.exploreTitle}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {copy.exploreSubtitle}
        </p>
      </header>

      <SearchBox query={query} onQueryChange={setQuery} />

      {searching ? (
        <SearchResultsView
          results={results}
          suggestions={visibleTopics}
          onPickTopic={(id) => {
            setTopic(id);
            setQuery("");
          }}
        />
      ) : (
        <>
          <p className="rise mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3 [animation-delay:40ms]">
            {copy.topicsHeading}
          </p>
          <div
            role="group"
            aria-label={copy.topicsAria}
            className="no-scrollbar rise -mx-5 mt-2 overflow-x-auto px-5 [animation-delay:60ms] lg:mx-0 lg:flex-wrap lg:overflow-x-visible lg:px-0"
          >
            <div className="flex w-max gap-2 lg:w-auto lg:flex-wrap">
              {visibleTopics.map((id) => {
                const topicMeta = TOPICS.find((entry) => entry.id === id);
                if (!topicMeta) return null;
                const selected = topic === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTopic(selected ? "all" : id)}
                    aria-pressed={selected}
                    className={`h-9 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors active:opacity-70 ${
                      selected
                        ? "border-accent bg-accent text-on-accent"
                        : "border-line bg-surface text-ink-2 hover:text-ink"
                    }`}
                  >
                    {localized(topicMeta.name, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          {topicDhikrs ? (
            <TopicView
              topic={topic as TopicId}
              duaFor={topicDhikrs.duaFor}
              occasion={topicDhikrs.occasion}
              related={topicDhikrs.related}
            />
          ) : (
            <>
              <p className="rise mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3 [animation-delay:70ms]">
                {copy.categoryHeading}
              </p>
              <div
                role="group"
                aria-label={copy.filterAria}
                className="no-scrollbar rise -mx-5 mt-2 overflow-x-auto px-5 [animation-delay:80ms] lg:mx-0 lg:flex-wrap lg:overflow-x-visible lg:px-0"
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
            </>
          )}
        </>
      )}
    </div>
  );

  /** Amal-level discovery card: the amal first, its quests as tiers. */
  function AmalCard({ dhikr }: { dhikr: Dhikr }) {
    const tiers = questsForDhikr.get(dhikr.id) ?? [];
    const primary = tiers[0];
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent-deep/50">
        <div className="flex items-start gap-3">
          {primary ? (
            <Link href={`/quest/${primary.id}`} className="min-w-0 flex-1">
              <p className="truncate font-display text-[17px] text-ink">
                {localized(dhikr.names, lang)}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-3">
                {localized(dhikr.meaning, lang)}
              </p>
            </Link>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[17px] text-ink">
                {localized(dhikr.names, lang)}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-3">
                {localized(dhikr.meaning, lang)}
              </p>
            </div>
          )}
          <Link
            href={`/challenge?amal=${dhikr.id}`}
            aria-label={copy.startChallengeAria(localized(dhikr.names, lang))}
            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:border-accent active:opacity-70"
          >
            {copy.challengePill}
          </Link>
        </div>
        {tiers.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-ink-3">
              {copy.questCount(formatCount(tiers.length, lang))}
            </span>
            {tiers.map((quest) => {
              const entry = progress?.get(quest.id);
              const complete = Boolean(entry?.completedAt);
              return (
                <Link
                  key={quest.id}
                  href={`/quest/${quest.id}`}
                  className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors active:opacity-70 ${
                    complete
                      ? "border-jade/40 bg-jade/10 text-jade"
                      : "border-line text-ink-2 hover:text-ink"
                  }`}
                >
                  {complete && <CheckIcon />}
                  {formatCount(quest.target, lang)}x
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function TopicView({
    topic,
    duaFor,
    occasion,
    related,
  }: {
    topic: TopicId;
    duaFor: Dhikr[];
    occasion: Dhikr[];
    related: Dhikr[];
  }) {
    const topicMeta = TOPICS.find((entry) => entry.id === topic);
    const empty = duaFor.length === 0 && occasion.length === 0 && related.length === 0;
    if (empty) {
      return (
        <section className="rise mt-10 rounded-3xl border border-line bg-surface p-6 text-center [animation-delay:80ms]">
          <p className="text-sm leading-relaxed text-ink-2">{copy.noCategoryQuests}</p>
        </section>
      );
    }
    return (
      <div className="mt-5 space-y-6 [animation-delay:140ms]">
        {topicMeta && (
          <p className="text-sm leading-relaxed text-ink-2">
            {localized(topicMeta.description, lang)}
          </p>
        )}
        {duaFor.length > 0 && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              {copy.duaForLabel}
            </h2>
            <ul className="mt-2 space-y-3 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-3 xl:grid-cols-3">
              {duaFor.map((dhikr) => (
                <li key={dhikr.id}>
                  <AmalCard dhikr={dhikr} />
                </li>
              ))}
            </ul>
          </section>
        )}
        {occasion.length > 0 && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2">
              {copy.occasionLabel}
            </h2>
            <ul className="mt-2 space-y-3 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-3 xl:grid-cols-3">
              {occasion.map((dhikr) => (
                <li key={dhikr.id}>
                  <AmalCard dhikr={dhikr} />
                </li>
              ))}
            </ul>
          </section>
        )}
        {related.length > 0 && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">
              {copy.relatedLabel}
            </h2>
            <ul className="mt-2 space-y-3 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-3 xl:grid-cols-3">
              {related.map((dhikr) => (
                <li key={dhikr.id}>
                  <AmalCard dhikr={dhikr} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  function SearchResultsView({
    results,
    suggestions,
    onPickTopic,
  }: {
    results: ReturnType<typeof searchContent> | null;
    suggestions: TopicId[];
    onPickTopic: (id: TopicId) => void;
  }) {
    if (!results) return null;
    if (!hasResults) {
      return (
        <section className="rise mt-8 rounded-3xl border border-line bg-surface p-6 text-center [animation-delay:80ms]">
          <p className="font-display text-lg text-ink">{copy.noResultsTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{copy.noResultsBody}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">
            {copy.tryTopicsLabel}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {/* A handful of doors, not the whole shelf. */}
            {suggestions.slice(0, 6).map((id) => {
              const topicMeta = TOPICS.find((entry) => entry.id === id);
              if (!topicMeta) return null;
              return (
                <button
                  key={id}
                  onClick={() => onPickTopic(id)}
                  className="h-9 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink-2 transition-colors hover:text-ink active:opacity-70"
                >
                  {localized(topicMeta.name, lang)}
                </button>
              );
            })}
          </div>
        </section>
      );
    }
    const hitDhikrs = results.dhikrs
      .map((hit) => ({ hit, dhikr: getDhikr(hit.dhikrId) }))
      .filter((entry): entry is { hit: (typeof results.dhikrs)[number]; dhikr: Dhikr } =>
        Boolean(entry.dhikr),
      )
      .map((entry) => entry.dhikr);
    return (
      <div className="mt-4 space-y-5 [animation-delay:80ms]">
        {results.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {results.topics.map((hit) => {
              const topicMeta = TOPICS.find((entry) => entry.id === hit.topicId);
              if (!topicMeta) return null;
              return (
                <button
                  key={hit.topicId}
                  onClick={() => onPickTopic(hit.topicId)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-accent/50 bg-accent/[0.08] px-4 text-sm font-medium text-accent transition-colors active:opacity-70"
                >
                  {localized(topicMeta.name, lang)}
                  <ChevronIcon />
                </button>
              );
            })}
          </div>
        )}
        {hitDhikrs.length > 0 && (
          <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-3 xl:grid-cols-3">
            {hitDhikrs.map((dhikr) => (
              <li key={dhikr.id}>
                <AmalCard dhikr={dhikr} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

function SearchBox({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const copy = useCopy();
  return (
    <div className="rise relative mt-4 [animation-delay:40ms]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
      >
        <MagnifierIcon />
      </span>
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={copy.searchPlaceholder}
        aria-label={copy.searchAria}
        autoComplete="off"
        className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-11 text-[15px] text-ink placeholder:text-ink-3 focus:border-accent/60 focus:outline-none"
      />
      {query.length > 0 && (
        <button
          onClick={() => onQueryChange("")}
          aria-label={copy.clearSearch}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 transition-colors hover:text-ink active:opacity-60"
        >
          <CrossIcon />
        </button>
      )}
    </div>
  );
}

function getDhikr(id: string): Dhikr | undefined {
  return publicDhikr().find((dhikr) => dhikr.id === id);
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true" className="mr-1">
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
      />
    </svg>
  );
}

function MagnifierIcon() {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m13.2 13.2 3.3 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
