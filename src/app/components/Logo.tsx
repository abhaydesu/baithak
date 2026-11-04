import Link from "next/link";

import { MARK_SVG } from "@/lib/og/mark";

/** The static logo mark (see src/lib/og/mark.tsx), for places that don't animate. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block aspect-[278/297] shrink-0 [&>svg]:h-full [&>svg]:w-full ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: MARK_SVG }}
    />
  );
}

/*
 * Where the "b" glyph's bowl sits, in the mark's own units (viewBox 278×297),
 * once the mark is laid over the letter (see .logo-mark in globals.css).
 * Measured from Bricolage Grotesque ExtraBold, 94% width, opsz 32: the middle of the
 * bowl's stroke. The dots start there as beads, so the bowl seems to break
 * apart into them.
 */
const BOWL = { cx: 111, cy: 187, rx: 73, ry: 82 };
/* The middle of the dot cluster in the finished mark */
const CLUSTER = { cx: 187, cy: 186 };

/* The five seats around the pill, clockwise from the top left */
const DOTS = [
  { cx: 127, cy: 116, fill: "var(--logo-blue,#4f5bd9)" },
  { cx: 207, cy: 116, fill: "#e86a96" },
  { cx: 247, cy: 186, fill: "#f5a623" },
  { cx: 207, cy: 256, fill: "#e4572e" },
  { cx: 127, cy: 256, fill: "var(--logo-green,#1f8a6e)" },
].map((d) => {
  // Each bead starts on the bowl in the same direction as its seat.
  const a = Math.atan2(d.cy - CLUSTER.cy, d.cx - CLUSTER.cx);
  const sx = BOWL.cx + BOWL.rx * Math.cos(a) - d.cx;
  const sy = BOWL.cy + BOWL.ry * Math.sin(a) - d.cy;
  return { ...d, sx: Math.round(sx), sy: Math.round(sy) };
});

/** The mark as live SVG, so the pill, slot and each dot can move on their own. */
function AnimatedMark() {
  return (
    <svg viewBox="0 0 278 297" aria-hidden="true" className="logo-mark">
      <g className="logo-pill">
        <rect width="74" height="297" rx="37" fill="var(--logo-pill,#2a2019)" />
        <rect className="logo-slot" x="19" y="31" width="37" height="12" rx="6" fill="var(--logo-slot,#f9f7f3)" />
      </g>
      {DOTS.map((d, i) => (
        <g
          key={i}
          className="logo-seat"
          style={{ "--i": i, "--sx": `${d.sx}px`, "--sy": `${d.sy}px`, "--c": d.fill } as React.CSSProperties}
        >
          <circle className="logo-dot" cx={d.cx} cy={d.cy} r="30" />
        </g>
      ))}
    </svg>
  );
}

const WORD = "aithak";

/**
 * The wordmark: "baithak", set in the display face.
 *
 * `compact` (the header, once the page scrolls) turns it into the mark in two
 * beats. First "aithak" slides left and disappears behind the b. Then the b
 * becomes the logo: its bowl breaks into five beads that roll out to their
 * seats and take their colours, and its stem rounds off into the pill.
 * Scrolling back to the top plays it in reverse.
 *
 * Hover: the letters wave (full word), or the dots hop and the pill leans in
 * (compact). A tap squishes either.
 */
export default function Logo({
  className,
  size = "md",
  compact = false,
}: {
  className?: string;
  size?: "sm" | "md";
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Baithak home"
      data-compact={compact}
      className={`logo relative flex min-h-11 w-fit items-center rounded-2xl py-1 outline-offset-4 ${
        size === "sm" ? "text-[1.75rem]" : "text-[2.1rem]"
      } ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="logo-inner flex items-baseline font-display font-extrabold leading-none tracking-[-0.04em] text-ink [font-stretch:94%]"
      >
        {/* The b: its stem and bowl as two halves of the same letter, with the
            mark laid exactly over it */}
        <span className="logo-letter logo-b relative z-10 inline-block" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="logo-b-stem inline-block">b</span>
          <span className="logo-b-bowl absolute inset-0">b</span>
          <AnimatedMark />
        </span>
        {/* clip (its left edge is the b's right edge, so the word slides
            "behind" the b) > track (slides) > letters (wave) */}
        <span className="logo-word-clip">
          <span className="logo-word-track">
            {WORD.split("").map((ch, i) => (
              <span key={i} className="logo-letter inline-block" style={{ "--i": i + 1 } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        </span>
      </span>
    </Link>
  );
}
