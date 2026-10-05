import { mkdir } from "node:fs/promises";
import sharp from "sharp";

/**
 * Generates PWA icons from the source SVG marks.
 * - src/app/icon.svg (rounded square) -> standard "any" icons
 * - scripts/icon-maskable.svg (full-bleed, safe-zone content) -> maskable
 *   and apple-touch icons, which must survive platform masking.
 */
const OUT_DIR = "public/icons";
const ANY_SOURCE = "src/app/icon.svg";
const MASKABLE_SOURCE = "scripts/icon-maskable.svg";

const JOBS = [
  { source: ANY_SOURCE, size: 192, file: "icon-192.png" },
  { source: ANY_SOURCE, size: 512, file: "icon-512.png" },
  { source: MASKABLE_SOURCE, size: 512, file: "icon-maskable-512.png" },
  { source: MASKABLE_SOURCE, size: 180, file: "apple-touch-icon.png" },
];

await mkdir(OUT_DIR, { recursive: true });

for (const { source, size, file } of JOBS) {
  await sharp(source, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(`${OUT_DIR}/${file}`);
  console.log(`wrote ${OUT_DIR}/${file} (${size}x${size})`);
}
