"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DHIKR, getDhikr } from "@/lib/content";
import {
  CHALLENGE_DURATION_PRESETS,
  CHALLENGE_TARGET_PRESETS,
  MAX_CHALLENGE_DAYS,
  MAX_CHALLENGE_TARGET,
  RECOMMENDED_DURATION_DAYS,
  STRICT_CHALLENGE_QUEST_ID,
  deriveStrictChallenge,
  type DerivedStrictChallenge,
} from "@/lib/challenge";
import {
  createStrictChallenge,
  deleteStrictChallenge,
  getLatestStrictChallenge,
} from "@/lib/db/challenges";
import { getPracticeEvents, recordIncrement, recordUndo } from "@/lib/db/events";
import { formatCount, formatShortDate, localDayKey } from "@/lib/format";
import { localized, useCopy, useLang } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { playTick } from "@/lib/tick";
import type { StrictChallenge } from "@/lib/db/db";

const dayKeyMs = (key: string): number =>
  new Date(`${key}T12:00:00`).getTime();

interface Loaded {
  challenge: StrictChallenge | null;
  derived: DerivedStrictChallenge | null;
  now: number;
}

export default function ChallengePage() {
  const copy = useCopy();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [restartFrom, setRestartFrom] = useState<StrictChallenge | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const reload = useCallback(async () => {
    const [challenge, events] = await Promise.all([
      getLatestStrictChallenge(),
      getPracticeEvents(),
    ]);
    const now = Date.now();
    setLoaded({
      challenge: challenge ?? null,
      derived: challenge
        ? deriveStrictChallenge(challenge, events, now)
        : null,
      now,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [challenge, events] = await Promise.all([
          getLatestStrictChallenge(),
          getPracticeEvents(),
        ]);
        if (!cancelled) {
          const now = Date.now();
          setLoaded({
            challenge: challenge ?? null,
            derived: challenge
              ? deriveStrictChallenge(challenge, events, now)
              : null,
            now,
          });
        }
      } catch {
        if (!cancelled) setLoaded({ challenge: null, derived: null, now: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startRestart = async () => {
    if (!restartFrom) return;
    await deleteStrictChallenge(restartFrom.id).catch(() => {});
    setRestartFrom(null);
    await reload();
  };

  let body: React.ReactNode;
  if (loaded === null) {
    body = (
      <div className="mt-8 h-64 animate-pulse rounded-3xl bg-surface" aria-hidden="true" />
    );
  } else if (restartFrom) {
    body = (
      <>
        <CreateChallenge prefill={restartFrom} onCreated={startRestart} />
        <button
          onClick={() => setRestartFrom(null)}
          className="mx-auto mt-4 block text-xs font-medium text-ink-3 transition-colors hover:text-ink"
        >
          {copy.strictKeep}
        </button>
      </>
    );
  } else if (loaded.challenge === null || loaded.derived === null) {
    body = <CreateChallenge onCreated={() => void reload()} />;
  } else if (loaded.derived.status === "active") {
    body = (
      <TodayCard
        challenge={loaded.challenge}
        derived={loaded.derived}
        onEnd={() => setConfirmEnd(true)}
      />
    );
  } else {
    body = (
      <TerminalCard
        challenge={loaded.challenge}
        derived={loaded.derived}
        now={loaded.now}
        onRestart={() => setRestartFrom(loaded.challenge)}
      />
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

      {loaded?.challenge && (
        <ConfirmDialog
          open={confirmEnd}
          onCancel={() => setConfirmEnd(false)}
          onConfirm={async () => {
            setConfirmEnd(false);
            await deleteStrictChallenge(loaded.challenge!.id).catch(() => {});
            await reload();
          }}
          title={copy.strictEndConfirmTitle}
          description={copy.strictEndConfirmBody}
          confirmLabel={copy.strictEndConfirm}
          cancelLabel={copy.strictKeep}
          danger
        />
      )}
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
 * Today is the whole feature: target, progress, remaining, day. The local
 * count is the UI's truth (mirroring the quest counter); every tap's write
 * is fire-and-forget, and the derivation refreshes on the next load.
 */
function TodayCard({
  challenge,
  derived,
  onEnd,
}: {
  challenge: StrictChallenge;
  derived: DerivedStrictChallenge;
  onEnd: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const haptics = useSettings((state) => state.haptics);
  const sound = useSettings((state) => state.sound);

  const [today, setToday] = useState(derived.todayCount);
  const todayRef = useRef(today);

  const add = (amount: number) => {
    if (haptics) navigator.vibrate?.(8);
    if (sound) playTick();
    todayRef.current += amount;
    setToday(todayRef.current);
    for (let i = 0; i < amount; i += 1) {
      void recordIncrement(STRICT_CHALLENGE_QUEST_ID).catch(() => {});
    }
  };

  const undo = () => {
    if (todayRef.current <= 0) return;
    todayRef.current -= 1;
    setToday(todayRef.current);
    void recordUndo(STRICT_CHALLENGE_QUEST_ID).catch(() => {});
  };

  const done = today >= challenge.dailyTarget;
  const shown = Math.min(today, challenge.dailyTarget);
  const percent = Math.min(
    Math.round((today / challenge.dailyTarget) * 100),
    100,
  );

  return (
    <section className="rise mt-8 [animation-delay:80ms]">
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
        <p className="mt-3 font-display text-xl text-ink">
          {localized(getDhikr(challenge.dhikrId)?.names ?? { en: "" }, lang)}
        </p>

        {done ? (
          <>
            <p className="mt-4 font-display text-[2rem] text-jade">
              {formatCount(shown, lang)} /{" "}
              {formatCount(challenge.dailyTarget, lang)}
            </p>
            <p className="mt-2 text-sm font-semibold text-jade">
              {copy.strictTodayComplete}
            </p>
            <p className="mt-1 text-sm text-ink-2">
              {copy.strictStreak(
                formatCount(derived.streakDays + 1, lang),
              )}
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 font-display text-[2rem] text-ink">
              {formatCount(shown, lang)}{" "}
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
                className="h-full rounded-full bg-accent transition-[width]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-5 flex gap-3">
              {[1, 10, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => add(amount)}
                  className={`h-14 flex-1 rounded-2xl font-semibold transition active:translate-y-px ${
                    amount === 1
                      ? "bg-accent text-on-accent hover:bg-accent-hover"
                      : "border border-line bg-surface-2 text-ink hover:bg-surface"
                  }`}
                >
                  +{amount}
                </button>
              ))}
            </div>
            <button
              onClick={undo}
              disabled={today <= 0}
              aria-label={copy.undoCountAria}
              className="mx-auto mt-3 block rounded-full px-4 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink disabled:opacity-40"
            >
              −1
            </button>
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
  onRestart,
}: {
  challenge: StrictChallenge;
  derived: DerivedStrictChallenge;
  now: number;
  onRestart: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const complete = derived.status === "complete";

  return (
    <section className="rise mt-8 [animation-delay:80ms]">
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
