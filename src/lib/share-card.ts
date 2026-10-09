/**
 * Shared canvas-card primitives for the milestone share pages (2026-10-08).
 * Extracted from the quest share page when the challenge share card
 * arrived; the card LAYOUTS stay per-page (they celebrate different
 * shapes of completion), but palette, geometry, text fitting, and
 * export/download helpers are one implementation.
 */

export const CARD_W = 1080;
export const CARD_H = 1920;

export interface CardPalette {
  bgTop: string;
  bgBottom: string;
  accent: string;
  ink: string;
  sub: string;
  line: string;
}

export const CARD_PALETTES: Record<"night" | "dawn", CardPalette> = {
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

/**
 * Finds the largest font size (down to minSize) at which text fits the
 * given width; past that, splits at the most balanced space onto two lines.
 */
export function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  family: string,
): { size: number; lines: string[] } {
  const font = (size: number) => `700 ${size}px ${family}`;
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

/** Two overlaid squares, one rotated: the khatam eight-point star. */
export function drawEightPointStar(
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

/** Paints the faint lattice backdrop shared by every card theme. */
export function drawLattice(
  ctx: CanvasRenderingContext2D,
  palette: CardPalette,
): void {
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.globalAlpha = 0.05;
  ctx.lineWidth = 2;
  for (let x = 108; x < CARD_W; x += 216) {
    for (let y = 108; y < CARD_H; y += 216) {
      drawEightPointStar(ctx, x, y, 62);
    }
  }
  ctx.restore();
}

export function setLetterSpacing(
  ctx: CanvasRenderingContext2D,
  value: string,
): void {
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in spaced) spaced.letterSpacing = value;
}

export function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
