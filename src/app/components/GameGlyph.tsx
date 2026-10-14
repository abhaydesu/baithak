import type { GlyphKind } from "@/lib/gameArt";

/** Cream object, ink details: the same flat style as the mascots, minus faces. */
const C = "#fff7ea";
const SHADE = "#eadcc3";
const K = "#1c1917";
const GOLD = "#f5b82e";
const RANI = "#e2457e";

function Tiles() {
  const tiles = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 25 + c * 25;
      const y = 22 + r * 25;
      const i = r * 3 + c;
      const open = i === 0 || i === 4;
      tiles.push(
        <g key={i}>
          <rect x={x} y={y + 2.5} width="20" height="20" rx="5" fill={open ? "#000" : SHADE} opacity={open ? 0.35 : 1} />
          <rect x={x} y={y} width="20" height="20" rx="5" fill={open ? K : C} />
          {open && (
            <text
              x={x + 10}
              y={y + 15}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill={C}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {i === 0 ? 1 : 2}
            </text>
          )}
        </g>,
      );
    }
  }
  return <g transform="rotate(-6 60 58)">{tiles}</g>;
}

function Bomb() {
  return (
    <g>
      <path d="M80 42c2-9 6-15 12-19" stroke={C} strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="69" y="38" width="18" height="13" rx="3.5" fill={K} transform="rotate(45 78 44.5)" />
      <circle cx="56" cy="68" r="29" fill={K} />
      <ellipse cx="45" cy="55" rx="9" ry="5" fill="#fff" opacity=".22" transform="rotate(-35 45 55)" />
      <path d="M94 12l2.4 5.6 6 .6-4.6 4 1.4 6-5.2-3.2-5.2 3.2 1.4-6-4.6-4 6-.6z" fill={GOLD} />
    </g>
  );
}

function Fedora() {
  return (
    <g>
      <ellipse cx="60" cy="76" rx="44" ry="12" fill={SHADE} />
      <ellipse cx="60" cy="73" rx="44" ry="11" fill={C} />
      <path d="M34 72c0-22 6-38 26-38s26 16 26 38z" fill={C} />
      <path d="M48 38q12 10 24 0" stroke={SHADE} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M35 60h50l1 12H34z" fill={K} />
      <ellipse cx="45" cy="47" rx="4" ry="7" fill="#fff" opacity=".6" transform="rotate(15 45 47)" />
    </g>
  );
}

function Mask() {
  return (
    <g transform="rotate(-8 60 60)">
      <path d="M28 32q32-10 64 0 4 40-32 62-36-22-32-62z" fill={C} />
      <path d="M60 94q36-22 32-62" stroke={SHADE} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M38 52q7-9 14 0" stroke={K} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M68 52q7-9 14 0" stroke={K} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M43 66q17 20 34 0-17 8-34 0z" fill={K} stroke={K} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="37" cy="64" r="4.5" fill="#f5917a" opacity=".55" />
      <circle cx="83" cy="64" r="4.5" fill="#f5917a" opacity=".55" />
    </g>
  );
}

function Clapper() {
  const stripes = (y: number) =>
    [0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${33 + i * 17} ${y}h9l-7 10h-9z`} fill={K} />
    ));
  return (
    <g>
      <rect x="24" y="52" width="72" height="46" rx="6" fill={K} />
      <rect x="24" y="52" width="72" height="11" fill={C} />
      {stripes(52)}
      <rect x="33" y="72" width="34" height="4.5" rx="2.25" fill={C} opacity=".55" />
      <rect x="33" y="82" width="22" height="4.5" rx="2.25" fill={C} opacity=".35" />
      <g transform="rotate(-20 25 48)">
        <rect x="24" y="37" width="72" height="11" rx="2" fill={C} />
        {stripes(37)}
      </g>
      <circle cx="26" cy="49" r="4" fill={GOLD} />
    </g>
  );
}

function Pencil() {
  return (
    <g>
      <path d="M22 98q9-8 18 0t18 0" stroke={C} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".75" />
      <g transform="rotate(-38 60 58)">
        <rect x="14" y="49" width="14" height="18" rx="4" fill="#f59ab9" />
        <rect x="26" y="49" width="9" height="18" fill={K} />
        <rect x="35" y="49" width="50" height="18" fill={C} />
        <rect x="35" y="61" width="50" height="6" fill={SHADE} />
        <path d="M85 49l20 9-20 9z" fill="#f1d09a" />
        <path d="M98 55l7 3-7 3z" fill={K} />
      </g>
    </g>
  );
}

function Card() {
  return (
    <g>
      <rect x="44" y="24" width="46" height="64" rx="8" fill="#000" opacity=".22" transform="rotate(14 67 56)" />
      <g transform="rotate(-8 58 62)">
        <rect x="34" y="30" width="48" height="66" rx="8" fill={C} />
        <rect x="34" y="88" width="48" height="8" rx="4" fill={SHADE} />
        <text
          x="58"
          y="77"
          textAnchor="middle"
          fontSize="44"
          fontWeight="700"
          fill={K}
          style={{ fontFamily: "var(--font-display)" }}
        >
          ?
        </text>
        <circle cx="42" cy="38" r="2.5" fill={K} />
        <circle cx="74" cy="88" r="2.5" fill={K} opacity="0" />
      </g>
    </g>
  );
}

function Bubbles() {
  const bubble = (x: number, y: number, fill: string, tailLeft: boolean) => (
    <>
      <rect x={x} y={y} width="54" height="24" rx="12" fill={fill} />
      <path
        d={tailLeft ? `M${x + 10} ${y + 20}l-4 10 12-7z` : `M${x + 44} ${y + 20}l4 10-12-7z`}
        fill={fill}
      />
    </>
  );
  return (
    <g>
      {bubble(20, 18, C, true)}
      <path d="M38 30l5 5 9-10" stroke={K} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {bubble(46, 48, K, false)}
      <path d="M68 55l10 10M78 55l-10 10" stroke={C} strokeWidth="4" strokeLinecap="round" />
      {bubble(24, 78, C, true)}
      <path d="M42 90l5 5 9-10" stroke={K} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
}

function Chair() {
  return (
    <g>
      {[46, 60, 74].map((x) => (
        <path key={x} d={`M${x} 26q-5-4 0-8t0-8`} stroke={C} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ))}
      <rect x="37" y="76" width="7" height="26" rx="3.5" fill={K} />
      <rect x="76" y="76" width="7" height="26" rx="3.5" fill={K} />
      <rect x="38" y="32" width="44" height="44" rx="11" fill={C} />
      <rect x="45" y="40" width="30" height="5" rx="2.5" fill={SHADE} />
      <rect x="31" y="68" width="58" height="14" rx="6" fill={SHADE} />
      <rect x="31" y="66" width="58" height="12" rx="6" fill={C} />
    </g>
  );
}

function Bolt() {
  return (
    <g>
      <path
        d="M68 14L34 64h22l-8 42 40-54H66l10-38z"
        fill={SHADE}
        stroke={SHADE}
        strokeWidth="5"
        strokeLinejoin="round"
        transform="translate(3 3)"
      />
      <path d="M68 14L34 64h22l-8 42 40-54H66l10-38z" fill={C} stroke={C} strokeWidth="5" strokeLinejoin="round" />
    </g>
  );
}

function Stopwatch() {
  return (
    <g>
      <rect x="53" y="18" width="14" height="9" rx="3" fill={K} />
      <rect x="57" y="25" width="6" height="8" fill={K} />
      <rect x="84" y="31" width="10" height="7" rx="2.5" fill={K} transform="rotate(45 89 34)" />
      <circle cx="60" cy="68" r="33" fill={SHADE} />
      <circle cx="60" cy="66" r="33" fill={C} />
      <path d="M60 66V38a28 28 0 0 1 14 3.75z" fill={RANI} />
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x="58.5" y="40" width="3" height="6" rx="1.5" fill={K} transform={`rotate(${a} 60 66)`} />
      ))}
      <path d="M60 66V44" stroke={K} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="60" cy="66" r="4.5" fill={K} />
    </g>
  );
}

function Podium() {
  const num = (x: number, y: number, n: number) => (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize="18"
      fontWeight="700"
      fill={K}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {n}
    </text>
  );
  return (
    <g>
      <path d="M60 22l3 6.4 7 .8-5.2 4.8 1.4 7L60 37.6 53.8 41l1.4-7-5.2-4.8 7-.8z" fill={GOLD} />
      <rect x="18" y="62" width="29" height="38" rx="4" fill={C} />
      <rect x="46" y="46" width="28" height="54" rx="4" fill={C} />
      <rect x="73" y="72" width="29" height="28" rx="4" fill={C} />
      <rect x="18" y="92" width="84" height="8" rx="3" fill={SHADE} />
      {num(32.5, 82, 2)}
      {num(60, 68, 1)}
      {num(87.5, 90, 3)}
    </g>
  );
}

function Chain() {
  // Two links woven together (cream and ink so the weave reads on any
  // field), and a third snapping off.
  const arc = "A12 12 0 0 1";
  return (
    <g transform="rotate(-16 60 60)">
      <rect x="10" y="48" width="46" height="24" rx="12" stroke={C} strokeWidth="8" fill="none" />
      <rect x="40" y="48" width="46" height="24" rx="12" stroke={K} strokeWidth="8" fill="none" />
      {/* the cream link passes back over the gold one at the bottom */}
      <path d={`M55.4 64.5 ${arc} 47.5 71.5`} stroke={C} strokeWidth="8" fill="none" />
      <path d="M96 49a12 12 0 0 1 10 9M105 68a12 12 0 0 1-9 5" stroke={C} strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M92 40l-2-6M98 40l3-5M92 82l-2 5" stroke={K} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

const GLYPHS: Record<GlyphKind, () => React.ReactElement> = {
  tiles: Tiles,
  bomb: Bomb,
  fedora: Fedora,
  mask: Mask,
  clapper: Clapper,
  pencil: Pencil,
  card: Card,
  bubbles: Bubbles,
  chair: Chair,
  bolt: Bolt,
  stopwatch: Stopwatch,
  podium: Podium,
  chain: Chain,
};

export default function GameGlyph({ kind, className }: { kind: GlyphKind; className?: string }) {
  const Glyph = GLYPHS[kind];
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <ellipse cx="60" cy="108" rx="30" ry="4" fill="#000" opacity=".16" />
      <Glyph />
    </svg>
  );
}
