"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MissingQuest } from "@/components/missing-quest";
import { Switch } from "@/components/switch";
import { dhikrForQuest, getQuest } from "@/lib/content";
import { formatCount, formatShortDate } from "@/lib/format";
import { getProgress } from "@/lib/db/events";

const W = 1080;
const H = 1920;

interface CardPalette {
  bgTop: string;
  bgBottom: string;
  accent: string;
  ink: string;
  sub: string;
  line: string;
}

const PALETTES: Record<"night" | "dawn", CardPalette> = {
  night: {
    bgTop: "#0b1020",
    bgBottom: "#060a16",
    accent: "#f0c877",
    ink: "#eaedf9",
    sub: "#a7b1cc",
    line: "rgba(167, 177, 204, 0.14)",
  },
  dawn: {
    bgTop: "#faf6ed",
    bgBottom: "#f0e9d8",
    accent: "#8a5f22",
    ink: "#212941",
    sub: "#5a6379",
    line: "rgba(33, 41, 65, 0.12)",
  },
};

interface CardInput {
  dhikrName: string;
  target: number;
  showCount: boolean;
  date: string;
  palette: CardPalette;
}

/** Draws the 9:16 milestone card. Pure canvas; no external assets. */
function drawCard(canvas: HTMLCanvasElement, input: CardInput): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { palette } = input;

  // Atmosphere
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, palette.bgTop);
  bg.addColorStop(1, palette.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Faint khatam lattice
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.globalAlpha = 0.05;
  ctx.lineWidth = 2;
  for (let x = 108; x < W; x += 216) {
    for (let y = 108; y < H; y += 216) {
      drawEightPointStar(ctx, x, y, 62);
    }
  }
  ctx.restore();

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

  if (input.showCount) {
    ctx.fillStyle = palette.ink;
    ctx.font = '300 230px Fraunces, Georgia, serif';
    ctx.fillText(`${formatCount(input.target)}`, W / 2, 840);
    ctx.fillStyle = palette.sub;
    ctx.font = '600 44px "Hanken Grotesk", system-ui, sans-serif';
    ctx.fillText("COMPLETED", W / 2, 920);
  }

  // Long names must never clip at the card edge: shrink to fit, then wrap
  // onto two balanced lines as a last resort.
  ctx.fillStyle = palette.ink;
  const nameY = input.showCount ? 1064 : 820;
  const fitted = fitLines(ctx, input.dhikrName.toUpperCase(), W - 160, 84, 56);
  ctx.font = `700 ${fitted.size}px "Hanken Grotesk", system-ui, sans-serif`;
  if (fitted.lines.length === 1) {
    ctx.fillText(fitted.lines[0], W / 2, nameY);
  } else {
    const lineHeight = fitted.size * 1.15;
    ctx.fillText(fitted.lines[0], W / 2, nameY - lineHeight / 2);
    ctx.fillText(fitted.lines[1], W / 2, nameY + lineHeight / 2);
  }

  ctx.fillStyle = palette.accent;
  ctx.font = 'italic 500 92px Fraunces, Georgia, serif';
  ctx.fillText("Alhamdulillah", W / 2, input.showCount ? 1216 : 972);

  ctx.fillStyle = palette.sub;
  ctx.font = '500 36px "Hanken Grotesk", system-ui, sans-serif';
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
  ctx.fillText("AMAL QUEST", W / 2, 1724);
  setLetterSpacing(ctx, "0px");
}

/**
 * Finds the largest font size (down to minSize) at which text fits the
 * given width; past that, splits at the most balanced space onto two lines.
 */
function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
): { size: number; lines: string[] } {
  const font = (size: number) =>
    `700 ${size}px "Hanken Grotesk", system-ui, sans-serif`;
  for (let size = maxSize; size >= minSize; size -= 4) {
    ctx.font = font(size);
    if (ctx.measureText(text).width <= maxWidth) {
      return { size, lines: [text] };
    }
  }
  const words = text.split(" ");
  if (words.length < 2) return { size: minSize, lines: [text] };
  ctx.font = font(minSize);
  let splitAt = 1;
  let bestWidth = Infinity;
  for (let i = 1; i < words.length; i += 1) {
    const top = words.slice(0, i).join(" ");
    const bottom = words.slice(i).join(" ");
    const wider = Math.max(
      ctx.measureText(top).width,
      ctx.measureText(bottom).width,
    );
    if (wider < bestWidth) {
      bestWidth = wider;
      splitAt = i;
    }
  }
  return {
    size: minSize,
    lines: [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")],
  };
}

function drawEightPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  halfSize: number,
  scale = 1,
): void {
  const half = halfSize * scale;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeRect(-half / 1.42, -half / 1.42, (half / 1.42) * 2, (half / 1.42) * 2);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-half / 1.42, -half / 1.42, (half / 1.42) * 2, (half / 1.42) * 2);
  ctx.restore();
}

function setLetterSpacing(
  ctx: CanvasRenderingContext2D,
  value: string,
): void {
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in spaced) spaced.letterSpacing = value;
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, "image/png");
  });
}

function downloadBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "amal-quest-milestone.png";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const quest = getQuest(params.id);
  const [theme, setTheme] = useState<"night" | "dawn">("night");
  const [showCount, setShowCount] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
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

  const completedAt = useRef<number>(0);
  useEffect(() => {
    if (!quest) return;
    let cancelled = false;
    getProgress(quest.id)
      .then((entry) => {
        if (!cancelled && entry?.completedAt) completedAt.current = entry.completedAt;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [quest]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fontsReady || !quest) return;
    drawCard(canvas, {
      dhikrName: dhikrForQuest(quest).names.en,
      target: quest.target,
      showCount,
      date: completedAt.current
        ? formatShortDate(completedAt.current)
        : formatShortDate(new Date().getTime()),
      palette: PALETTES[theme],
    });
  }, [fontsReady, theme, showCount, quest]);

  const share = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setStatus(null);
    let blob: Blob;
    try {
      blob = await toBlob(canvas);
    } catch {
      setStatus("Could not create the card image.");
      return;
    }
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    const file = new File([blob], "amal-quest-milestone.png", { type: "image/png" });
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Amal Quest",
          text: "Quest complete - Alhamdulillah",
        });
        setStatus("Shared.");
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") return;
        // Fall through to download.
      }
    }
    downloadBlob(blob);
    setStatus("Card saved to your device.");
  }, []);

  if (!quest) return <MissingQuest />;
  const dhikr = dhikrForQuest(quest);

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col px-5"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 16px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
      }}
    >
      <header className="flex items-center justify-between">
        <Link
          href={`/quest/${quest.id}/complete`}
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink active:scale-90"
        >
          <BackIcon />
        </Link>
        <p className="text-sm font-medium text-ink-2">Share milestone</p>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      <div className="mt-5 flex justify-center">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-auto rounded-2xl border border-line"
          style={{ maxHeight: "52vh", boxShadow: "var(--shadow-card)" }}
          aria-label={`Milestone card: ${formatCount(quest.target)} times ${dhikr.names.en}, quest complete`}
          role="img"
        />
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
            Card theme
          </p>
          <div className="mt-2 flex gap-2">
            {(["night", "dawn"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setTheme(option)}
                aria-pressed={theme === option}
                className={`h-10 flex-1 rounded-xl border text-sm font-medium capitalize transition-colors active:opacity-70 ${
                  theme === option
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line bg-surface text-ink-2 hover:text-ink"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowCount((value) => !value)}
          aria-pressed={showCount}
          className="flex w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors hover:bg-surface-2"
        >
          <span className="text-sm text-ink">Show the count on the card</span>
          <Switch on={showCount} />
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={share}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
        >
          Share or save card
        </button>
        {status && (
          <p role="status" className="text-center text-xs text-ink-3">
            {status}
          </p>
        )}
        <p className="pb-4 text-center text-xs leading-relaxed text-ink-3">
          Your card only shows what you choose. Sharing is always up to you.
        </p>
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
