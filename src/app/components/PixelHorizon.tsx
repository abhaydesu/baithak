/**
 * An arcade-style horizon for the game-night band: rolling hills of square
 * pixels that thin out with ordered (Bayer) dithering as they rise, from
 * marigold at the bottom through rani pink to violet. On wider screens a
 * few pixel stars blink in the empty sky above. Everything is generated from a fixed seed, so it renders the same on
 * the server and the client, and pixels stay square at every screen width
 * (the size comes from --px, set in CSS).
 */

import { BRAND } from "@/lib/gameArt";
import { BAYER, rng } from "@/lib/pixel";

const COLS = 160;
const ROWS = 24;
const HERO_COLS = 48;
const HERO_ROWS = 18;
const BANDS = [BRAND.marigold, BRAND.saffron, BRAND.rani, BRAND.violet, BRAND.indigo];

/** One path per colour, with each row's runs of that colour merged. */
function buildPaths(cols = COLS, rows = ROWS) {
  const rand = rng(7);
  const bandHeight = rows === ROWS ? 3.6 : rows / BANDS.length;
  const grid: (number | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (let x = 0; x < cols; x++) {
    // Hill height in rows, from a few slow waves plus a little noise.
    const hill =
      rows === ROWS
        ? 9 + 5 * Math.sin(x * 0.075 + 1) + 3 * Math.sin(x * 0.21 + 2.4) + 1.6 * rand()
        : rows * 0.38 +
          rows * 0.2 * Math.sin(x * 0.075 + 1) +
          rows * 0.12 * Math.sin(x * 0.21 + 2.4) +
          1.6 * rand();
    for (let y = 0; y < rows; y++) {
      // y counts up from the bottom row.
      const density = Math.min(1, Math.max(0, (hill - y) / 7));
      const threshold = BAYER[y % 4][x % 4];
      if (density <= threshold) continue;
      // Colour bands, dithered into each other with the same matrix.
      grid[rows - 1 - y][x] = Math.min(
        BANDS.length - 1,
        Math.max(0, Math.floor(y / bandHeight + (threshold - 0.5) * 0.9)),
      );
    }
  }
  const paths = BANDS.map(() => "");
  grid.forEach((row, y) => {
    let x = 0;
    while (x < cols) {
      const band = row[x];
      let end = x + 1;
      while (end < cols && row[end] === band) end++;
      if (band !== null) paths[band] += `M${x} ${y}h${end - x}v1h${x - end}z`;
      x = end;
    }
  });
  return paths.map((d, i) => ({ d, fill: BANDS[i] }));
}

function buildStars() {
  const rand = rng(21);
  // Only in the empty sky to the top right, so they never sit behind text.
  return Array.from({ length: 16 }, (_, i) => ({
    left: 56 + rand() * 42,
    top: 4 + rand() * 34,
    gold: i % 7 === 0,
    blink: i % 3 === 0,
    delay: rand() * 4,
  }));
}

const PATHS = buildPaths();
const HERO_PATHS = buildPaths(HERO_COLS, HERO_ROWS);
const STARS = buildStars();
const HERO_STARS = (() => {
  const rand = rng(31);
  // The phone leaves a narrow, quiet patch of sky on the right on mobile.
  return Array.from({ length: 9 }, (_, i) => ({
    left: 82 + rand() * 14,
    top: 5 + rand() * 38,
    gold: i % 5 === 0,
    blink: i % 3 === 0,
    delay: rand() * 4,
  }));
})();

export default function PixelHorizon({ compact = false }: { compact?: boolean }) {
  const cols = compact ? HERO_COLS : COLS;
  const rows = compact ? HERO_ROWS : ROWS;
  const paths = compact ? HERO_PATHS : PATHS;
  const stars = compact ? HERO_STARS : STARS;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className={`pixel-star ${compact ? "pixel-star-hero" : "hidden md:block"} ${s.blink ? "pixel-star-blink" : ""}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            background: s.gold ? BRAND.marigold : "#fff",
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <svg
        viewBox={`0 0 ${cols} ${rows}`}
        shapeRendering="crispEdges"
        className={`${compact ? "pixel-horizon-compact" : "pixel-horizon"} absolute bottom-0 left-1/2 -translate-x-1/2`}
      >
        {paths.map((p) => (
          <path key={p.fill} d={p.d} fill={p.fill} />
        ))}
      </svg>
    </div>
  );
}
