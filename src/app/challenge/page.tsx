"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DHIKR, getDhikr } from "@/lib/content";
import {
  CHALLENGE_DURATION_PRESETS,
  CHALLENGE_TARGET_PRESETS,
  MAX_CHALLENGE_DAYS,
  MAX_CHALLENGE_TARGET,
  RECOMMENDED_DURATION_DAYS,
  deriveChallengeGroup,
  deriveStrictChallenge,
  groupStrictChallenges,
  type ChallengeGroup,
  type DerivedStrictChallenge,
} from "@/lib/challenge";
import {
  createStrictChallenges,
  deleteStrictChallenges,
  listStrictChallenges,
} from "@/lib/db/challenges";
import { getPracticeEvents } from "@/lib/db/events";
import { formatCount, formatShortDate, localDayKey } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";
import type { StrictChallenge } from "@/lib/db/db";

const dayKeyMs = (key: string): number =>
  new Date(`${key}T12:00:00`).getTime();

interface ChallengeGroupView {
  group: ChallengeGroup;
  derived: DerivedStrictChallenge[];
  status: ReturnType<typeof deriveChallengeGroup>;
}

/** Attaches each row's derivation to its group, keeping setup order. */
function buildGroupViews(
  challenges: StrictChallenge[],
  events: Parameters<typeof deriveStrictChallenge>[1],
  now: number,
): ChallengeGroupView[] {
  const groups = groupStrictChallenges(challenges);
  const byId = new Map(challenges.map((challenge) => [challenge.id, challenge]));
  return groups.map((group) => {
    const derived = group.rows.map((row) =>
      deriveStrictChallenge(byId.get(row.id) ?? row, events, now),
    );
    return {
      group: { ...group, derived },
      derived,
      status: deriveChallengeGroup({ ...group, derived }),
    };
  });
}

export default function ChallengePage() {
  const copy = useCopy();
  const router = useRouter();
  const [views, setViews] = useState<ChallengeGroupView[] | null>(null);
  const [now, setNow] = useState(0);
  const [restartFromGroupId, setRestartFromGroupId] = useState<string | null>(
    null,
  );
  const [confirmEndGroupId, setConfirmEndGroupId] = useState<string | null>(
    null,
  );
  const [creatingTapped, setCreating] = useState(false);
  const [prefillDhikrId, setPrefillDhikrId] = useState<string | null>(() => {
    // Deep link: /challenge?amal=<dhikrId> opens setup with that amal
    // preselected (e.g. arriving from Explore). Read via window.location
    // rather than useSearchParams so the page stays statically
    // prerenderable (Next 16 CSR-bailout). Lazy read, then strip the
    // param so a refresh or back-navigation doesn't reopen setup. Safe
    // against hydration mismatch: the page renders a skeleton until the
    // challenge list loads, so this state never changes prerendered HTML.
    if (typeof window === "undefined") return null;
    const id = new URLSearchParams(window.location.search).get("amal");
    if (!id || !getDhikr(id)) return null;
    window.history.replaceState(null, "", "/challenge");
    return id;
  });
  const setupRef = useRef<HTMLDivElement | null>(null);
  // A deep-linked prefill opens setup even without the tap.
  const creating = creatingTapped || prefillDhikrId !== null;

  const clearSetup = () => {
    setCreating(false);
    setPrefillDhikrId(null);
  };

  // A challenge begun from a deep link (arriving from a quest or Explore)
  // goes straight into its fullscreen counter; one started from the list
  // stays here, where the new card appears in the stack.
  const handleCreated = (created: StrictChallenge[]) => {
    const deepLinked = prefillDhikrId !== null;
    clearSetup();
    if (deepLinked && created.length > 0) {
      router.push(`/challenge/${created[0].id}/count`);
    } else {
      void load();
    }
  };

  // The inline setup opens below the stack; bring it into view so the
  // commitment being made is immediately on screen.
  useEffect(() => {
    if (creating) setupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [creating]);

  const load = useCallback(async () => {
    const [challenges, events] = await Promise.all([
      listStrictChallenges(),
      getPracticeEvents(),
    ]);
    const now = Date.now();
    // One instant for every derivation, so the whole stack describes the
    // same moment.
    setViews(buildGroupViews(challenges, events, now));
    setNow(now);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [challenges, events] = await Promise.all([
          listStrictChallenges(),
          getPracticeEvents(),
        ]);
        if (!cancelled) {
          const now = Date.now();
          setViews(buildGroupViews(challenges, events, now));
          setNow(now);
        }
      } catch {
        if (!cancelled) setViews([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const groupIds = (groupId: string): string[] =>
    views
      ?.find((view) => view.group.id === groupId)
      ?.group.rows.map((row) => row.id) ?? [];

  const startRestart = async () => {
    if (restartFromGroupId === null) return;
    await deleteStrictChallenges(groupIds(restartFromGroupId)).catch(() => {});
    setRestartFromGroupId(null);
    await load();
  };

  const hasActive = views?.some((view) => view.status === "active") ?? false;

  let body: React.ReactNode;
  if (views === null) {
    body = (
      <div className="mt-8 h-64 animate-pulse rounded-3xl bg-surface" aria-hidden="true" />
    );
  } else if (views.length === 0) {
    body = (
      <ChallengeSetup
        prefillDhikrId={prefillDhikrId ?? undefined}
        onCreated={handleCreated}
      />
    );
  } else {
    // Oldest commitment first: the stack reads in the order the
    // commitments were made.
    const active = views.filter((view) => view.status === "active");
    const terminal = views.filter((view) => view.status !== "active");
    const delayFor = (index: number) => 80 + index * 60;
    body = (
      <>
        {active.map((view, index) => (
          <ChallengeCard
            key={view.group.id}
            view={view}
            delayMs={delayFor(index)}
            onEnd={() => setConfirmEndGroupId(view.group.id)}
          />
        ))}
        {terminal.map((view, index) =>
          view.group.id === restartFromGroupId ? (
            <Fragment key={view.group.id}>
              <ChallengeSetup
                prefill={view.group.rows}
                onCreated={startRestart}
              />
              <button
                onClick={() => setRestartFromGroupId(null)}
                className="mx-auto mt-4 block text-xs font-medium text-ink-3 transition-colors hover:text-ink"
              >
                {copy.strictKeep}
              </button>
            </Fragment>
          ) : (
            <TerminalCard
              key={view.group.id}
              view={view}
              now={now}
              delayMs={delayFor(active.length + index)}
              onRestart={() => setRestartFromGroupId(view.group.id)}
            />
          ),
        )}
        {creating ? (
          <div ref={setupRef}>
            <ChallengeSetup
              parallel={hasActive}
              prefillDhikrId={prefillDhikrId ?? undefined}
              onCreated={handleCreated}
              onCancel={clearSetup}
            />
          </div>
        ) : (
          restartFromGroupId === null && (
            <button
              onClick={() => setCreating(true)}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-sm font-medium text-accent transition-colors hover:border-accent hover:text-accent-hover active:translate-y-px lg:max-w-2xl"
            >
              <PlusIcon />
              {copy.strictNewChallenge}
            </button>
          )
        )}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:max-w-4xl">
      <header className="rise">
        <h1 className="font-display text-[2rem] text-ink lg:text-4xl">
          {copy.strictTitle}
        </h1>
        <p className="mt-1 text-sm text-ink-2">{copy.strictTagline}</p>
        {/* The rule stated up front: strictness must never be learned by
            breaking it. */}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-3">
          {copy.strictRules}
        </p>
      </header>

      {body}

      <ConfirmDialog
        open={confirmEndGroupId !== null}
        onCancel={() => setConfirmEndGroupId(null)}
        onConfirm={async () => {
          const groupId = confirmEndGroupId;
          setConfirmEndGroupId(null);
          if (groupId !== null) {
            await deleteStrictChallenges(groupIds(groupId)).catch(() => {});
          }
          await load();
        }}
        title={copy.strictEndConfirmTitle}
        description={copy.strictEndConfirmBody}
        confirmLabel={copy.strictEndConfirm}
        cancelLabel={copy.strictKeep}
        danger
      />
    </div>
  );
}

/**
 * The setup screen: the commitment made before it starts. One screen,
 * no wizard - the amals (one or many, each with its own daily target),
 * the duration, then the summary. `prefill` carries a previous
 * commitment's shape for restarts; `prefillDhikrId` preselects one amal
 * (deep link from Explore); `parallel` notes an already-running
 * challenge this one will sit beside.
 */
function ChallengeSetup({
  prefill,
  prefillDhikrId,
  parallel = false,
  onCreated,
  onCancel,
}: {
  prefill?: StrictChallenge[];
  prefillDhikrId?: string;
  parallel?: boolean;
  onCreated: (created: StrictChallenge[]) => void;
  onCancel?: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const [targets, setTargets] = useState<Record<string, number>>(() => {
    if (!prefill) {
      return prefillDhikrId ? { [prefillDhikrId]: CHALLENGE_TARGET_PRESETS[0] } : {};
    }
    return Object.fromEntries(
      prefill.map((row) => [row.dhikrId, row.dailyTarget]),
    );
  });
  const [customTargets, setCustomTargets] = useState<Record<string, string>>(
    () => {
      if (!prefill) return {};
      return Object.fromEntries(
        prefill
          .filter((row) => !isPresetTarget(row.dailyTarget))
          .map((row) => [row.dhikrId, String(row.dailyTarget)]),
      );
    },
  );
  const [days, setDays] = useState(
    prefill?.[0]?.durationDays ?? RECOMMENDED_DURATION_DAYS,
  );
  const [customDays, setCustomDays] = useState(
    prefill && !isPresetDuration(prefill[0].durationDays)
      ? String(prefill[0].durationDays)
      : "",
  );
  const [busy, setBusy] = useState(false);

  // Selection order follows the catalog, not tap order.
  const selected = DHIKR.filter((dhikr) => dhikr.id in targets);
  const isCustomDays = !isPresetDuration(days);
  const ready =
    selected.length > 0 &&
    days >= 1 &&
    selected.every((dhikr) => targets[dhikr.id] >= 1);

  const toggle = (dhikrId: string) => {
    setTargets((current) => {
      if (dhikrId in current) {
        const next = { ...current };
        delete next[dhikrId];
        return next;
      }
      return { ...current, [dhikrId]: CHALLENGE_TARGET_PRESETS[0] };
    });
  };

  const setTarget = (dhikrId: string, target: number) => {
    setTargets((current) => ({ ...current, [dhikrId]: target }));
  };

  const start = async () => {
    setBusy(true);
    try {
      const created = await createStrictChallenges(
        selected.map((dhikr) => ({
          dhikrId: dhikr.id,
          dailyTarget: targets[dhikr.id],
        })),
        { durationDays: days, now: Date.now() },
      );
      onCreated(created);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rise mt-8 space-y-6 [animation-delay:80ms] lg:grid lg:grid-cols-5 lg:items-start lg:gap-10 lg:space-y-0">
      <div className="space-y-6 lg:col-span-3">
        {parallel && (
          <p className="text-sm text-accent">{copy.strictParallelNote}</p>
        )}

        <ChoiceGroup
          label={copy.strictChooseAmals}
          hint={
            selected.length > 0
              ? copy.strictAmalsSelected(formatCount(selected.length, lang))
              : undefined
          }
        >
        <div className="space-y-2">
          {DHIKR.map((dhikr) => {
            const isSelected = dhikr.id in targets;
            const isCustomTarget =
              isSelected && !isPresetTarget(targets[dhikr.id]);
            return (
              <div
                key={dhikr.id}
                className={`rounded-2xl border transition-colors ${
                  isSelected
                    ? "border-accent bg-accent/[0.06]"
                    : "border-line bg-surface"
                }`}
              >
                <button
                  onClick={() => toggle(dhikr.id)}
                  aria-pressed={isSelected}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      isSelected
                        ? "border-accent bg-accent text-on-accent"
                        : "border-line text-transparent"
                    }`}
                  >
                    <CheckIcon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {localized(dhikr.names, lang)}
                    </span>
                    {isSelected && (
                      <span className="block text-xs text-ink-2">
                        {copy.strictPerDay(
                          formatCount(targets[dhikr.id], lang),
                        )}
                      </span>
                    )}
                  </span>
                </button>
                {isSelected && (
                  <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pl-12">
                    {CHALLENGE_TARGET_PRESETS.map((preset) => (
                      <Pill
                        key={preset}
                        small
                        selected={targets[dhikr.id] === preset}
                        onClick={() => setTarget(dhikr.id, preset)}
                      >
                        {copy.strictTimes(formatCount(preset, lang))}
                      </Pill>
                    ))}
                    <Pill
                      small
                      selected={isCustomTarget}
                      onClick={() => {
                        const parsed = Number(customTargets[dhikr.id]);
                        setTarget(
                          dhikr.id,
                          Number.isInteger(parsed) && parsed >= 1 ? parsed : 0,
                        );
                      }}
                    >
                      {copy.strictCustom}
                    </Pill>
                    {isCustomTarget && (
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={MAX_CHALLENGE_TARGET}
                        value={customTargets[dhikr.id] ?? ""}
                        onChange={(event) => {
                          setCustomTargets((current) => ({
                            ...current,
                            [dhikr.id]: event.target.value,
                          }));
                          const parsed = Number(event.target.value);
                          if (
                            Number.isInteger(parsed) &&
                            parsed >= 1 &&
                            parsed <= MAX_CHALLENGE_TARGET
                          ) {
                            setTarget(dhikr.id, parsed);
                          }
                        }}
                        aria-label={copy.strictTargetInputAria}
                        className="h-8 w-20 rounded-xl border border-line bg-surface px-2 text-sm text-ink"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </ChoiceGroup>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <ChoiceGroup label={copy.strictDuration}>
        <div className="flex flex-wrap items-center gap-2">
          {CHALLENGE_DURATION_PRESETS.map((preset) => (
            <Pill
              key={preset}
              selected={days === preset}
              onClick={() => setDays(preset)}
            >
              {copy.dayCount(formatCount(preset, lang))}
            </Pill>
          ))}
          <Pill
            selected={isCustomDays}
            onClick={() => {
              const parsed = Number(customDays);
              setDays(Number.isInteger(parsed) && parsed >= 1 ? parsed : 0);
            }}
          >
            {copy.strictCustom}
          </Pill>
        </div>
        {isCustomDays && (
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_CHALLENGE_DAYS}
            value={customDays}
            onChange={(event) => {
              setCustomDays(event.target.value);
              const parsed = Number(event.target.value);
              if (
                Number.isInteger(parsed) &&
                parsed >= 1 &&
                parsed <= MAX_CHALLENGE_DAYS
              ) {
                setDays(parsed);
              }
            }}
            aria-label={copy.strictDurationInputAria}
            className="h-10 w-24 rounded-xl border border-line bg-surface px-3 text-sm text-ink"
          />
        )}
        {days === RECOMMENDED_DURATION_DAYS && (
          <p className="mt-2 text-xs text-accent">
            {copy.dayCount(formatCount(RECOMMENDED_DURATION_DAYS, lang))} -{" "}
            {copy.strictRecommended}
          </p>
        )}
      </ChoiceGroup>

      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {copy.strictYourChallenge}
        </p>
        {ready ? (
          <>
            <p className="mt-2 font-display text-xl text-ink">
              {copy.dayCount(formatCount(days, lang))}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">
              {copy.strictAmalsDaily(formatCount(selected.length, lang))}
            </p>
            <ul className="mt-1 space-y-0.5">
              {selected.map((dhikr) => (
                <li key={dhikr.id} className="text-sm text-ink-2">
                  {localized(dhikr.names, lang)} —{" "}
                  {copy.strictTimes(formatCount(targets[dhikr.id], lang))}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-3">
            {copy.strictChooseAmals}
          </p>
        )}
        <button
          onClick={() => void start()}
          disabled={busy || !ready}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px disabled:opacity-60"
        >
          {copy.strictStart}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mx-auto mt-4 block text-xs font-medium text-ink-3 transition-colors hover:text-ink"
          >
            {copy.strictKeep}
          </button>
        )}
      </div>
      </div>
    </section>
  );
}

const isPresetTarget = (value: number): boolean =>
  (CHALLENGE_TARGET_PRESETS as readonly number[]).includes(value);
const isPresetDuration = (value: number): boolean =>
  (CHALLENGE_DURATION_PRESETS as readonly number[]).includes(value);

/**
 * Today at a glance: one card per commitment. A single-amal commitment
 * keeps the big-number moment; a multi-amal one lists each amal with its
 * own progress and its own way into the fullscreen counter.
 */
function ChallengeCard({
  view,
  delayMs = 80,
  onEnd,
}: {
  view: ChallengeGroupView;
  delayMs?: number;
  onEnd: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const { group, derived } = view;
  const challenge = group.rows[0];
  const allDone = derived.every((entry) => entry.todayComplete);
  const doneCount = derived.filter((entry) => entry.todayComplete).length;
  const streak = derived[0]?.streakDays ?? 0;

  return (
    <section className="rise mt-8 lg:max-w-2xl" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="rounded-3xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            {copy.strictToday}
          </p>
          <p className="text-xs font-semibold text-ink-2">
            {copy.strictDayProgress(
              formatCount(derived[0]?.dayNumber ?? 0, lang),
              formatCount(challenge.durationDays, lang),
            )}
          </p>
        </div>

        {group.rows.length === 1 ? (
          <SingleAmalToday
            challenge={challenge}
            derived={derived[0]}
          />
        ) : (
          <>
            <p className="mt-3 font-display text-xl text-ink">
              {copy.strictGroupAmals(formatCount(group.rows.length, lang))}
            </p>
            <div className="mt-4 space-y-2">
              {group.rows.map((row, index) => (
                <AmalProgressRow
                  key={row.id}
                  challenge={row}
                  derived={derived[index]}
                />
              ))}
            </div>
            {allDone && (
              <p className="mt-4 text-sm font-semibold text-jade">
                {copy.strictTodayComplete}
              </p>
            )}
            {!allDone && doneCount > 0 && (
              <p className="mt-4 text-sm text-ink-2">
                {copy.strictTodayAmalsDone(
                  formatCount(doneCount, lang),
                  formatCount(group.rows.length, lang),
                )}
              </p>
            )}
          </>
        )}
        <p className="mt-2 text-sm text-ink-2">
          {copy.strictStreak(formatCount(streak, lang))}
        </p>
      </div>
      <button
        onClick={onEnd}
        className="mx-auto mt-4 block text-xs font-medium text-ink-3 transition-colors hover:text-ink"
      >
        {copy.strictEnd}
      </button>
    </section>
  );
}

/** The single-amal today moment: one big number, one way in. */
function SingleAmalToday({
  challenge,
  derived,
}: {
  challenge: StrictChallenge;
  derived: DerivedStrictChallenge | undefined;
}) {
  const copy = useCopy();
  const lang = useLang();
  if (!derived) return null;

  const dhikr = getDhikr(challenge.dhikrId);
  const name = dhikr ? localized(dhikr.names, lang) : "";
  const done = derived.todayComplete;
  const percent = Math.min(
    Math.round((derived.todayCount / challenge.dailyTarget) * 100),
    100,
  );

  return (
    <>
      <p className="mt-3 font-display text-xl text-ink">{name}</p>
      {done ? (
        <>
          <p className="mt-4 font-display text-[2rem] text-jade">
            {formatCount(challenge.dailyTarget, lang)} /{" "}
            {formatCount(challenge.dailyTarget, lang)}
          </p>
          <p className="mt-2 text-sm font-semibold text-jade">
            {copy.strictTodayComplete}
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 font-display text-[2rem] text-ink">
            {formatCount(derived.todayCount, lang)}{" "}
            <span className="text-lg text-ink-3">
              / {formatCount(challenge.dailyTarget, lang)}
            </span>
          </p>
          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2"
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
          <Link
            href={`/challenge/${challenge.id}/count`}
            className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
          >
            {copy.practiceNow}
          </Link>
        </>
      )}
    </>
  );
}

/** One amal's today line inside a multi-amal commitment. */
function AmalProgressRow({
  challenge,
  derived,
}: {
  challenge: StrictChallenge;
  derived: DerivedStrictChallenge;
}) {
  const lang = useLang();
  const dhikr = getDhikr(challenge.dhikrId);
  const name = dhikr ? localized(dhikr.names, lang) : "";
  const done = derived.todayComplete;
  const percent = Math.min(
    Math.round((derived.todayCount / challenge.dailyTarget) * 100),
    100,
  );

  const body = (
    <>
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
          done
            ? "border-jade bg-jade text-on-accent"
            : "border-line text-transparent"
        }`}
      >
        <CheckIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm text-ink">{name}</span>
          <span
            className={`shrink-0 text-xs font-semibold tabular-nums ${
              done ? "text-jade" : "text-ink-2"
            }`}
          >
            {formatCount(Math.min(derived.todayCount, challenge.dailyTarget), lang)}
            {" / "}
            {formatCount(challenge.dailyTarget, lang)}
          </span>
        </span>
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-2">
          <span
            className={`block h-full rounded-full transition-[width] duration-150 ${
              done ? "bg-jade" : "bg-accent"
            }`}
            style={{ width: `${percent}%` }}
          />
        </span>
      </span>
      {!done && (
        <span aria-hidden="true" className="shrink-0 text-ink-3">
          <ChevronIcon />
        </span>
      )}
    </>
  );

  const rowClass =
    "flex items-center gap-3 rounded-2xl border border-line px-3 py-2.5";

  return done ? (
    <div className={rowClass}>{body}</div>
  ) : (
    <Link href={`/challenge/${challenge.id}/count`} className={`${rowClass} transition-colors hover:bg-surface-2`}>
      {body}
    </Link>
  );
}

/** A broken or finished commitment: calm, honest, with a way forward. */
function TerminalCard({
  view,
  now,
  delayMs = 80,
  onRestart,
}: {
  view: ChallengeGroupView;
  now: number;
  delayMs?: number;
  onRestart: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const { group, derived, status } = view;
  const complete = status === "complete";
  const missed = derived.find((entry) => entry.missedDayKey !== null);
  const streak = derived[0]?.streakDays ?? 0;

  return (
    <section className="rise mt-8 lg:max-w-2xl" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="rounded-3xl border border-line bg-surface p-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {complete ? copy.strictCompleteTitle : copy.strictTitle}
        </p>
        <p className="mt-3 font-display text-xl text-ink">
          {group.rows.length === 1
            ? localized(getDhikr(group.rows[0].dhikrId)?.names ?? { en: "" }, lang)
            : copy.strictGroupAmals(formatCount(group.rows.length, lang))}
        </p>
        {group.rows.length > 1 && (
          <p className="mt-1 text-sm text-ink-2">
            {group.rows
              .map((row) => localized(getDhikr(row.dhikrId)?.names ?? { en: "" }, lang))
              .join(" · ")}
          </p>
        )}
        {!complete && missed?.missedDayKey && (
          <p className="mt-2 text-sm text-ink-2">
            {missed.missedDayKey === localDayKey(now - 86_400_000)
              ? copy.strictMissedYesterday
              : copy.strictMissedOn(
                  formatShortDate(dayKeyMs(missed.missedDayKey), lang),
                )}
          </p>
        )}
        <p className="mt-2 text-sm text-ink-2">
          {copy.strictStreak(formatCount(streak, lang))}
        </p>
        {complete && (
          <p className="mt-2 text-sm text-ink-2">
            {copy.strictCompleteBody(
              formatCount(group.rows[0].durationDays, lang),
            )}
          </p>
        )}
        <button
          onClick={onRestart}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          {copy.strictNewChallenge}
        </button>
        {complete && (
          <Link
            href={`/challenge/${group.id}/share`}
            className="mt-4 block text-xs font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            {copy.strictSeeShareCard}
          </Link>
        )}
      </div>
    </section>
  );
}

function ChoiceGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="text-xs font-semibold text-accent">{hint}</p>}
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function Pill({
  selected,
  onClick,
  small = false,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`whitespace-nowrap rounded-full border font-medium transition-colors active:opacity-70 ${
        small ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"
      } ${
        selected
          ? "border-accent bg-accent text-on-accent"
          : "border-line bg-surface text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="12" height="12" fill="none" aria-hidden="true">
      <path
        d="m4 10.5 4 4 8-9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="m7.5 4.5 5.5 5.5-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
