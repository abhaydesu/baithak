"use client";

import { useSyncExternalStore } from "react";

const KEY = "baithak-theme";

const CHROME = { light: "#faf8f4", dark: "#1d1814" };

/** Mobile browser chrome follows <meta theme-color>, whose media queries only
 *  know the system theme. Replace them with one tag that matches the choice. */
function paintChrome(theme: "light" | "dark") {
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  const meta = document.createElement("meta");
  meta.name = "theme-color";
  meta.content = CHROME[theme];
  document.head.appendChild(meta);
}

function resolved(): "light" | "dark" {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(notify: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const obs = new MutationObserver(notify);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  mq.addEventListener("change", notify);
  return () => {
    obs.disconnect();
    mq.removeEventListener("change", notify);
  };
}

/*
 * The track is a tiny pixel-art landscape, 34×16 pixels (each 2px on screen),
 * in the style of the game-night band's pixel horizon. Built once, here.
 */
const COLS = 34;
const ROWS = 16;

type Cell = [number, number];
const px = (cells: Cell[]) => cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join("");
const row = (x0: number, x1: number, y: number): Cell[] =>
  Array.from({ length: x1 - x0 + 1 }, (_, i) => [x0 + i, y]);

/** Rolling hills along the bottom: a top colour, dithered into a lower one. */
function buildHills() {
  const top: Cell[] = [];
  const low: Cell[] = [];
  for (let x = 0; x < COLS; x++) {
    const wave = 3.4 + 1.6 * Math.sin(x * 0.45 + 0.6) + 0.9 * Math.sin(x * 1.1 + 2);
    const h = Math.max(2, Math.min(6, Math.round(wave)));
    for (let y = ROWS - h; y < ROWS; y++) {
      const depth = y - (ROWS - h);
      // The top row is the top colour, the next a checkerboard of both, then the low colour.
      (depth === 0 || (depth === 1 && x % 2 === 0) ? top : low).push([x, y]);
    }
  }
  return { top: px(top), low: px(low) };
}
const HILLS = buildHills();

/* Night: a four-point sparkle and a scatter of single stars, left of the moon */
const SPARKLE = px([[10, 3], [9, 4], [10, 4], [11, 4], [10, 5]]);
const STARS: Cell[] = [[3, 3], [6, 7], [12, 1], [13, 8], [2, 9]];
/* The pixel "z" the sleeping moon breathes out */
const ZED = px([...row(0, 3, 0), [2, 1], [1, 2], ...row(0, 3, 3)]);
/* Day: two pixel clouds, right of the sun */
const CLOUDS = px([...row(21, 23, 3), ...row(19, 25, 4), ...row(18, 26, 5), [29, 7], ...row(28, 31, 8)]);

const INK = "#141414";
const face = { fill: "none", stroke: INK, strokeWidth: 1.3, strokeLinecap: "round" as const };

/** Mascot-style faces (see Mascot.tsx): an awake sun and a sleeping moon. */
function Knob() {
  return (
    <span className="tt-knob" aria-hidden="true">
      <svg viewBox="0 0 26 26" className="tt-face">
        <circle className="tt-disc" cx="13" cy="13" r="13" />
        <g className="tt-moon" fill="#ddd2bf">
          <circle cx="18.5" cy="6.5" r="2.2" />
          <circle cx="6" cy="19" r="1.5" />
          <circle cx="20" cy="19.5" r="1.1" />
        </g>
        <ellipse cx="6.4" cy="15.2" rx="2.3" ry="1.4" fill="#ff6b8a" opacity="0.5" />
        <ellipse cx="19.6" cy="15.2" rx="2.3" ry="1.4" fill="#ff6b8a" opacity="0.5" />
        <g className="tt-sun">
          <g className="tt-eyes">
            <ellipse cx="9.6" cy="11.6" rx="1.45" ry="1.85" fill={INK} />
            <ellipse cx="16.4" cy="11.6" rx="1.45" ry="1.85" fill={INK} />
            <circle cx="10.1" cy="10.9" r="0.5" fill="#fff" />
            <circle cx="16.9" cy="10.9" r="0.5" fill="#fff" />
          </g>
          <path d="M11 15.4q2 2.2 4 0" {...face} />
        </g>
        <g className="tt-moon" {...face}>
          <path d="M8 11.4q1.6 1.6 3.2 0M14.8 11.4q1.6 1.6 3.2 0" />
          <path d="M12.2 16.2h1.6" />
        </g>
      </svg>
    </span>
  );
}

/**
 * Light / dark switch. Follows the system until the first tap, then remembers.
 *
 * Built like the site's other physical controls (ink outline, a hard side
 * that presses down), with a pixel-art landscape for a track: a dawn sky with
 * clouds and marigold hills by day; the game-night sky, violet hills and
 * twinkling stars by night. The knob rolls across between a smiling sun and a
 * sleeping moon. Which scene shows is decided in CSS from the page's theme
 * (globals.css, "Theme toggle"), so it's right from the first paint.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, resolved, () => "light");
  const dark = theme === "dark";

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    paintChrome(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={toggle}
      className={`tt-switch ${className ?? ""}`}
    >
      <span className="tt-track" aria-hidden="true">
        <svg viewBox={`0 0 ${COLS} ${ROWS}`} className="tt-scene" shapeRendering="crispEdges">
          <rect className="tt-sky-day" width={COLS} height={ROWS} />
          <rect className="tt-sky-night" width={COLS} height={ROWS} />
          <path className="tt-clouds" d={CLOUDS} />
          <path className="tt-star" d={SPARKLE} style={{ "--i": 0 } as React.CSSProperties} />
          {STARS.map(([x, y], i) => (
            <rect
              key={i}
              className="tt-star"
              x={x}
              y={y}
              width="1"
              height="1"
              style={{ "--i": i + 1 } as React.CSSProperties}
            />
          ))}
          <g transform="translate(14 2)">
            <path className="tt-zed" d={ZED} />
          </g>
          <path className="tt-hill-low" d={HILLS.low} />
          <path className="tt-hill-top" d={HILLS.top} />
        </svg>
      </span>
      <Knob />
    </button>
  );
}
