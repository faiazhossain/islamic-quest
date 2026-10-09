"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Switch } from "@/components/switch";
import { deriveStrictChallenge, groupStrictChallenges } from "@/lib/challenge";
import { getDhikr } from "@/lib/content";
import { listStrictChallenges } from "@/lib/db/challenges";
import { getPracticeEvents } from "@/lib/db/events";
import { formatCount, formatShortDate } from "@/lib/format";
import type { Lang } from "@/lib/i18n/lang";
import { localized, useCopy, useLang } from "@/lib/i18n";
import {
  CARD_H as H,
  CARD_PALETTES,
  CARD_W as W,
  downloadBlob,
  drawEightPointStar,
  drawLattice,
  fitLines,
  setLetterSpacing,
  toBlob,
  type CardPalette,
} from "@/lib/share-card";

/*
 * The challenge's milestone card: the same celebration the quest share
 * page gives a finished quest, shaped for a finished commitment. The
 * whole window is the milestone - the big number is the days kept, the
 * name line is the amal (or amals) carried through. Deliberately a
 * sibling page of /quest/[id]/share rather than a shared component: the
 * two cards celebrate different shapes of completion.
 */

interface ChallengeCardInput {
  days: number;
  /** One amal's name, or a joined list for multi-amal commitments. */
  names: string;
  detailNames: string | null;
  date: string;
  palette: CardPalette;
  lang: Lang;
  banglaFamily: string;
  completeLabel: string;
  daysLabel: string;
  alhamdulillah: string;
}

function drawCard(canvas: HTMLCanvasElement, input: ChallengeCardInput): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { palette } = input;

  // Atmosphere
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, palette.bgTop);
  bg.addColorStop(1, palette.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawLattice(ctx, palette);

  // Mark
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 10;
  drawEightPointStar(ctx, W / 2, 400, 150, 0.92);
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(W / 2, 400, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = "center";

  // The occasion, above the number: what this milestone is.
  ctx.fillStyle = palette.accent;
  ctx.font = `600 40px ${input.lang === "bn" ? `${input.banglaFamily}, "Hanken Grotesk", system-ui, sans-serif` : '"Hanken Grotesk", system-ui, sans-serif'}`;
  setLetterSpacing(ctx, input.lang === "bn" ? "0px" : "8px");
  ctx.fillText(input.completeLabel, W / 2, 620);
  setLetterSpacing(ctx, "0px");

  const bodyFamily = input.lang === "bn"
    ? `${input.banglaFamily}, "Hanken Grotesk", system-ui, sans-serif`
    : '"Hanken Grotesk", system-ui, sans-serif';
  const displayFamily = input.lang === "bn"
    ? `${input.banglaFamily}, Georgia, serif`
    : 'Fraunces, Georgia, serif';

  // The kept window: the day count IS the milestone.
  ctx.fillStyle = palette.ink;
  ctx.font = `300 230px ${displayFamily}`;
  ctx.fillText(formatCount(input.days, input.lang), W / 2, 840);
  ctx.fillStyle = palette.sub;
  ctx.font = `600 44px ${bodyFamily}`;
  ctx.fillText(input.daysLabel, W / 2, 920);

  // Amal line - shrink to fit, then wrap onto two balanced lines.
  ctx.fillStyle = palette.ink;
  const displayName = input.lang === "bn" ? input.names : input.names.toUpperCase();
  const fitted = fitLines(ctx, displayName, W - 160, 84, 56, bodyFamily);
  ctx.font = `700 ${fitted.size}px ${bodyFamily}`;
  const nameY = 1064;
  if (fitted.lines.length === 1) {
    ctx.fillText(fitted.lines[0], W / 2, nameY);
  } else {
    const lineHeight = fitted.size * 1.15;
    ctx.fillText(fitted.lines[0], W / 2, nameY - lineHeight / 2);
    ctx.fillText(fitted.lines[1], W / 2, nameY + lineHeight / 2);
  }

  // Multi-amal commitments list their amals small, under the title.
  if (input.detailNames) {
    ctx.fillStyle = palette.sub;
    ctx.font = `500 34px ${bodyFamily}`;
    ctx.fillText(input.detailNames, W / 2, nameY + 70);
  }

  ctx.fillStyle = palette.accent;
  ctx.font = `italic 500 92px ${displayFamily}`;
  ctx.fillText(input.alhamdulillah, W / 2, 1216);

  ctx.fillStyle = palette.sub;
  ctx.font = `500 36px ${bodyFamily}`;
  ctx.fillText(input.date, W / 2, 1560);

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 90, 1640);
  ctx.lineTo(W / 2 + 90, 1640);
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.font = '600 40px "Hanken Grotesk", system-ui, sans-serif';
  setLetterSpacing(ctx, "10px");
  ctx.fillText("AMALYN", W / 2, 1724);
  setLetterSpacing(ctx, "0px");
}

function toChallengeBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return toBlob(canvas);
}

export default function ChallengeSharePage() {
  const params = useParams<{ id: string }>();
  const copy = useCopy();
  const lang = useLang();
  const [theme, setTheme] = useState<"night" | "dawn">("night");
  const [showNames, setShowNames] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [card, setCard] = useState<{
    days: number;
    names: string;
    detailNames: string | null;
    completedDayMs: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await document.fonts.ready;
      } catch {
        // Font API unavailable; canvas falls back to system serif.
      }
      if (!cancelled) setFontsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve the commitment (by row id or group id) and celebrate it only
  // when genuinely complete - an unfinished challenge has no card yet.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [challenges, events] = await Promise.all([
          listStrictChallenges(),
          getPracticeEvents(),
        ]);
        if (cancelled) return;
        const now = Date.now();
        const group = groupStrictChallenges(challenges).find((entry) =>
          entry.rows.some((row) => row.id === params.id || row.groupId === params.id),
        );
        if (!group) {
          if (!cancelled) setLoaded(true);
          return;
        }
        const byId = new Map(challenges.map((row) => [row.id, row]));
        const derived = group.rows.map((row) =>
          deriveStrictChallenge(byId.get(row.id) ?? row, events, now),
        );
        const complete = derived.every((entry) => entry.status === "complete");
        if (!complete) {
          if (!cancelled) setLoaded(true);
          return;
        }
        const first = byId.get(group.rows[0].id) ?? group.rows[0];
        const names = group.rows.map(
          (row) => localized(getDhikr(row.dhikrId)?.names ?? { en: "" }, lang),
        );
        if (cancelled) return;
        setCard({
          days: first.durationDays,
          names:
            names.length === 1
              ? names[0]
              : copy.strictGroupAmals(formatCount(names.length, lang)),
          detailNames: names.length > 1 ? names.join(" · ") : null,
          // The window's final day is when a strict challenge completes.
          completedDayMs:
            new Date(`${first.startDayKey}T12:00:00`).getTime() +
            (first.durationDays - 1) * 86_400_000,
        });
        setLoaded(true);
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, lang, copy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fontsReady || !card) return;
    const banglaFamily =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-bangla")
        .trim() || "sans-serif";
    let cancelled = false;
    (async () => {
      if (lang === "bn") {
        // Bengali glyphs load lazily; make sure the canvas font is ready
        // before drawing, or the card silently falls back to system fonts.
        try {
          await document.fonts.load(`700 84px ${banglaFamily}`, "আমল");
          await document.fonts.load(`300 230px ${banglaFamily}`, "১২৩");
        } catch {
          // Font API unavailable; the draw below still uses the family.
        }
      }
      if (cancelled) return;
      drawCard(canvas, {
        days: card.days,
        names: card.names,
        detailNames: showNames ? card.detailNames : null,
        date: formatShortDate(card.completedDayMs, lang),
        palette: CARD_PALETTES[theme],
        lang,
        banglaFamily,
        completeLabel: copy.strictCanvasComplete,
        daysLabel: copy.strictCanvasDays,
        alhamdulillah: copy.alhamdulillah,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [fontsReady, theme, showNames, card, lang, copy]);

  const share = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setStatus(null);
    let blob: Blob;
    try {
      blob = await toChallengeBlob(canvas);
    } catch {
      setStatus(copy.statusImageFailed);
      return;
    }
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    const file = new File([blob], "amalyn-challenge.png", { type: "image/png" });
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Amalyn",
          text: copy.strictShareText,
        });
        setStatus(copy.statusShared);
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") return;
        // Fall through to download.
      }
    }
    downloadBlob(blob, "amalyn-challenge.png");
    setStatus(copy.statusSaved);
  }, [copy]);

  // Deep link to an unfinished (or unknown) challenge: no card to celebrate.
  if (loaded && !card) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display text-xl text-ink">
          {copy.strictShareNotComplete}
        </p>
        <p className="text-sm leading-relaxed text-ink-2">
          {copy.strictFinishFirst}
        </p>
        <Link
          href="/challenge"
          className="mt-4 flex h-11 items-center justify-center rounded-2xl bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          {copy.strictTitle}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col px-5 lg:max-w-4xl lg:px-10"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 16px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
      }}
    >
      <header className="flex items-center justify-between">
        <Link
          href="/challenge"
          aria-label={copy.backAria}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink active:scale-90"
        >
          <BackIcon />
        </Link>
        <p className="text-sm font-medium text-ink-2">{copy.strictShareTitle}</p>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      <div className="flex flex-col lg:mt-5 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
        <div className="mt-5 flex justify-center lg:sticky lg:top-10 lg:col-span-7 lg:mt-0 lg:self-start">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="max-h-[52vh] w-auto rounded-2xl border border-line lg:max-h-[68vh]"
            style={{ boxShadow: "var(--shadow-card)" }}
            aria-label={copy.canvasAria(card?.names ?? "", formatCount(card?.days ?? 0, lang))}
            role="img"
          />
        </div>

        <div className="flex flex-col lg:col-span-5">
          <div className="mt-6 space-y-4 lg:mt-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                {copy.cardTheme}
              </p>
              <div className="mt-2 flex gap-2">
                {(
                  [
                    ["night", copy.shareThemeNight],
                    ["dawn", copy.shareThemeDawn],
                  ] as const
                ).map(([option, label]) => (
                  <button
                    key={option}
                    onClick={() => setTheme(option)}
                    aria-pressed={theme === option}
                    className={`h-10 flex-1 rounded-xl border text-sm font-medium transition-colors active:opacity-70 ${
                      theme === option
                        ? "border-accent bg-accent text-on-accent"
                        : "border-line bg-surface text-ink-2 hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {card?.detailNames && (
              <button
                onClick={() => setShowNames((value) => !value)}
                aria-pressed={showNames}
                className="flex w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors hover:bg-surface-2"
              >
                <span className="text-sm text-ink">{copy.strictShowNamesOnCard}</span>
                <Switch on={showNames} />
              </button>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={share}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
            >
              {copy.shareOrSave}
            </button>
            {status && (
              <p role="status" className="text-center text-xs text-ink-3">
                {status}
              </p>
            )}
            <p className="text-center text-xs leading-relaxed text-ink-3">
              {copy.cardPrivacy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M10 3.5 5.5 8 10 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
