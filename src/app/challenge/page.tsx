"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DHIKR, getDhikr } from "@/lib/content";
import {
  CHALLENGE_DURATION_PRESETS,
  CHALLENGE_TARGET_PRESETS,
  MAX_CHALLENGE_DAYS,
  MAX_CHALLENGE_TARGET,
  RECOMMENDED_DURATION_DAYS,
  deriveStrictChallenge,
  type DerivedStrictChallenge,
} from "@/lib/challenge";
import {
  createStrictChallenge,
  deleteStrictChallenge,
  listStrictChallenges,
} from "@/lib/db/challenges";
import { getPracticeEvents } from "@/lib/db/events";
import { formatCount, formatShortDate, localDayKey } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";
import type { StrictChallenge } from "@/lib/db/db";

const dayKeyMs = (key: string): number =>
  new Date(`${key}T12:00:00`).getTime();

interface ChallengeEntry {
  challenge: StrictChallenge;
  derived: DerivedStrictChallenge;
}

export default function ChallengePage() {
  const copy = useCopy();
  const [entries, setEntries] = useState<ChallengeEntry[] | null>(null);
  const [now, setNow] = useState(0);
  const [restartFromId, setRestartFromId] = useState<string | null>(null);
  const [confirmEndId, setConfirmEndId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = useCallback(async () => {
    const [challenges, events] = await Promise.all([
      listStrictChallenges(),
      getPracticeEvents(),
    ]);
    const now = Date.now();
    // One instant for every derivation, so the whole stack describes the
    // same moment.
    setEntries(
      challenges.map((challenge) => ({
        challenge,
        derived: deriveStrictChallenge(challenge, events, now),
      })),
    );
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
          setEntries(
            challenges.map((challenge) => ({
              challenge,
              derived: deriveStrictChallenge(challenge, events, now),
            })),
          );
          setNow(now);
        }
      } catch {
        if (!cancelled) setEntries([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startRestart = async () => {
    if (restartFromId === null) return;
    await deleteStrictChallenge(restartFromId).catch(() => {});
    setRestartFromId(null);
    await reload();
  };

  let body: React.ReactNode;
  if (entries === null) {
    body = (
      <div className="mt-8 h-64 animate-pulse rounded-3xl bg-surface" aria-hidden="true" />
    );
  } else if (entries.length === 0) {
    body = <CreateChallenge onCreated={() => void reload()} />;
  } else {
    // Oldest commitment first: the stack reads in the order the
    // commitments were made.
    const active = entries.filter((entry) => entry.derived.status === "active");
    const terminal = entries.filter((entry) => entry.derived.status !== "active");
    const delayFor = (index: number) => 80 + index * 60;
    body = (
      <>
        {active.map((entry, index) => (
          <TodayCard
            key={entry.challenge.id}
            challenge={entry.challenge}
            derived={entry.derived}
            delayMs={delayFor(index)}
            onEnd={() => setConfirmEndId(entry.challenge.id)}
          />
        ))}
        {terminal.map((entry, index) =>
          entry.challenge.id === restartFromId ? (
            <Fragment key={entry.challenge.id}>
              <CreateChallenge prefill={entry.challenge} onCreated={startRestart} />
              <button
                onClick={() => setRestartFromId(null)}
                className="mx-auto mt-4 block text-xs font-medium text-ink-3 transition-colors hover:text-ink"
              >
                {copy.strictKeep}
              </button>
            </Fragment>
          ) : (
            <TerminalCard
              key={entry.challenge.id}
              challenge={entry.challenge}
              derived={entry.derived}
              now={now}
              delayMs={delayFor(active.length + index)}
              onRestart={() => setRestartFromId(entry.challenge.id)}
            />
          ),
        )}
        {creating ? (
          <>
            <CreateChallenge
              onCreated={() => {
                setCreating(false);
                void reload();
              }}
            />
            <button
              onClick={() => setCreating(false)}
              className="mx-auto mt-4 block text-xs font-medium text-ink-3 transition-colors hover:text-ink"
            >
              {copy.strictKeep}
            </button>
          </>
        ) : (
          restartFromId === null && (
            <button
              onClick={() => setCreating(true)}
              className="mx-auto mt-6 block text-xs font-medium text-accent transition-colors hover:text-accent-hover"
            >
              {copy.strictNewChallenge}
            </button>
          )
        )}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:max-w-2xl">
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
        open={confirmEndId !== null}
        onCancel={() => setConfirmEndId(null)}
        onConfirm={async () => {
          const id = confirmEndId;
          setConfirmEndId(null);
          if (id !== null) await deleteStrictChallenge(id).catch(() => {});
          await reload();
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
 * The create screen: 1 amal + 1 daily target + 1 duration, one screen,
 * no wizard. `prefill` carries a previous challenge's shape for restarts.
 */
function CreateChallenge({
  prefill,
  onCreated,
}: {
  prefill?: StrictChallenge;
  onCreated: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const [dhikrId, setDhikrId] = useState(prefill?.dhikrId ?? DHIKR[0].id);
  const [target, setTarget] = useState(
    prefill?.dailyTarget ?? CHALLENGE_TARGET_PRESETS[0],
  );
  const [days, setDays] = useState(
    prefill?.durationDays ?? RECOMMENDED_DURATION_DAYS,
  );
  const [customTarget, setCustomTarget] = useState(
    prefill && !isPresetTarget(prefill.dailyTarget)
      ? String(prefill.dailyTarget)
      : "",
  );
  const [customDays, setCustomDays] = useState(
    prefill && !isPresetDuration(prefill.durationDays)
      ? String(prefill.durationDays)
      : "",
  );
  const [busy, setBusy] = useState(false);

  const isCustomTarget = !isPresetTarget(target);
  const isCustomDays = !isPresetDuration(days);
  const ready = dhikrId !== "" && target >= 1 && days >= 1;

  const start = async () => {
    setBusy(true);
    try {
      await createStrictChallenge({
        dhikrId,
        dailyTarget: target,
        durationDays: days,
        now: Date.now(),
      });
      onCreated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rise mt-8 space-y-6 [animation-delay:80ms]">
      <ChoiceGroup label={copy.strictChooseAmal}>
        {DHIKR.map((dhikr) => (
          <Pill
            key={dhikr.id}
            selected={dhikrId === dhikr.id}
            onClick={() => setDhikrId(dhikr.id)}
          >
            {localized(dhikr.names, lang)}
          </Pill>
        ))}
      </ChoiceGroup>

      <ChoiceGroup label={copy.strictDailyTarget}>
        {CHALLENGE_TARGET_PRESETS.map((preset) => (
          <Pill
            key={preset}
            selected={target === preset}
            onClick={() => setTarget(preset)}
          >
            {copy.strictTimes(formatCount(preset, lang))}
          </Pill>
        ))}
        <Pill
          selected={isCustomTarget}
          onClick={() => {
            const parsed = Number(customTarget);
            setTarget(
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
            value={customTarget}
            onChange={(event) => {
              setCustomTarget(event.target.value);
              const parsed = Number(event.target.value);
              if (
                Number.isInteger(parsed) &&
                parsed >= 1 &&
                parsed <= MAX_CHALLENGE_TARGET
              ) {
                setTarget(parsed);
              }
            }}
            aria-label={copy.strictTargetInputAria}
            className="h-10 w-24 rounded-xl border border-line bg-surface px-3 text-sm text-ink"
          />
        )}
      </ChoiceGroup>

      <ChoiceGroup label={copy.strictDuration}>
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
      </ChoiceGroup>
      {days === RECOMMENDED_DURATION_DAYS && (
        <p className="-mt-4 text-xs text-accent">
          {copy.dayCount(formatCount(RECOMMENDED_DURATION_DAYS, lang))} -{" "}
          {copy.strictRecommended}
        </p>
      )}

      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {copy.strictYourChallenge}
        </p>
        <p className="mt-2 font-display text-xl text-ink">
          {localized(getDhikr(dhikrId)?.names ?? { en: "" }, lang)}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink">
          {copy.strictPerDay(formatCount(target, lang))}
        </p>
        <p className="text-sm font-semibold text-ink">
          {copy.dayCount(formatCount(days, lang))}
        </p>
        <button
          onClick={() => void start()}
          disabled={busy || !ready}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px disabled:opacity-60"
        >
          {copy.strictStart}
        </button>
      </div>
    </section>
  );
}

const isPresetTarget = (value: number): boolean =>
  (CHALLENGE_TARGET_PRESETS as readonly number[]).includes(value);
const isPresetDuration = (value: number): boolean =>
  (CHALLENGE_DURATION_PRESETS as readonly number[]).includes(value);

/**
 * Today at a glance: target, progress, day - and the way in. Counting
 * itself lives in the fullscreen counter (/challenge/[id]/count), the
 * same worship moment as the quest counter; this card is the overview.
 */
function TodayCard({
  challenge,
  derived,
  delayMs = 80,
  onEnd,
}: {
  challenge: StrictChallenge;
  derived: DerivedStrictChallenge;
  delayMs?: number;
  onEnd: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();

  const done = derived.todayComplete;
  const percent = Math.min(
    Math.round((derived.todayCount / challenge.dailyTarget) * 100),
    100,
  );
  const dhikr = getDhikr(challenge.dhikrId);
  const name = dhikr ? localized(dhikr.names, lang) : "";

  return (
    <section className="rise mt-8" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="rounded-3xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            {copy.strictToday}
          </p>
          <p className="text-xs font-semibold text-ink-2">
            {copy.strictDayProgress(
              formatCount(derived.dayNumber, lang),
              formatCount(challenge.durationDays, lang),
            )}
          </p>
        </div>
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
            {/* The derivation already includes today once its target is
                met, so the streak shows as-is - no offset needed. */}
            <p className="mt-1 text-sm text-ink-2">
              {copy.strictStreak(formatCount(derived.streakDays, lang))}
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

/** A broken or finished challenge: calm, honest, with a way forward. */
function TerminalCard({
  challenge,
  derived,
  now,
  delayMs = 80,
  onRestart,
}: {
  challenge: StrictChallenge;
  derived: DerivedStrictChallenge;
  now: number;
  delayMs?: number;
  onRestart: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const complete = derived.status === "complete";

  return (
    <section className="rise mt-8" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="rounded-3xl border border-line bg-surface p-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {complete ? copy.strictCompleteTitle : copy.strictTitle}
        </p>
        <p className="mt-3 font-display text-xl text-ink">
          {localized(getDhikr(challenge.dhikrId)?.names ?? { en: "" }, lang)}
        </p>
        {!complete && derived.missedDayKey && (
          <p className="mt-2 text-sm text-ink-2">
            {derived.missedDayKey === localDayKey(now - 86_400_000)
              ? copy.strictMissedYesterday
              : copy.strictMissedOn(
                  formatShortDate(dayKeyMs(derived.missedDayKey), lang),
                )}
          </p>
        )}
        <p className="mt-2 text-sm text-ink-2">
          {copy.strictStreak(formatCount(derived.streakDays, lang))}
        </p>
        {complete && (
          <p className="mt-2 text-sm text-ink-2">
            {copy.strictCompleteBody(
              formatCount(challenge.durationDays, lang),
            )}
          </p>
        )}
        <button
          onClick={onRestart}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          {copy.strictNewChallenge}
        </button>
      </div>
    </section>
  );
}

function ChoiceGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`h-10 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors active:opacity-70 ${
        selected
          ? "border-accent bg-accent text-on-accent"
          : "border-line bg-surface text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
