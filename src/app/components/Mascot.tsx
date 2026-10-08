/**
 * Baithak's mascots: squishy game-night snacks and the people who turn up.
 * A samosa, a laddoo, a cutting chai, a golgappa, a kulfi, a jalebi, a
 * dice, a moustached uncle and a didi with a bindi, plus a gulab jamun, a vada pav, a paan, a bhutta and a pakora. They share one face style (dot
 * eyes, blush, a small mouth), sit on a soft shadow and squash gently while
 * idle. Snacks keep their real colours; the rest take the tone they're given.
 */

export type MascotKind =
  | "samosa"
  | "laddoo"
  | "chai"
  | "golgappa"
  | "kulfi"
  | "dice"
  | "uncle"
  | "didi"
  | "jalebi"
  | "mango"
  | "jamun"
  | "vadapav"
  | "paan"
  | "bhutta"
  | "pakora";

export type MascotMood = "happy" | "cheer" | "wink" | "shifty" | "shocked" | "sweaty";

interface MascotProps {
  kind: MascotKind;
  mood?: MascotMood;
  /** Body colour for uncle, didi, dice and kulfi; defaults to the tone. */
  color?: string;
  /** Laddoo only: a lit fuse, for Pass the Bomb. */
  fuse?: boolean;
  className?: string;
  /** Seconds to offset the idle squish and blink, so groups don't sync up. */
  delay?: number;
  title?: string;
}

const INK = "#141414";

const line = {
  stroke: INK,
  strokeWidth: 2.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

/** Dot eyes, blush and a mouth, centred at (cx, cy). */
function Face({ cx, cy, mood }: { cx: number; cy: number; mood: MascotMood }) {
  const eye = (x: number, big = false) => (
    <g>
      <ellipse cx={x} cy={cy} rx={big ? 3.6 : 3.1} ry={big ? 4.6 : 4} fill={INK} />
      <circle cx={x + 1.1} cy={cy - 1.5} r={1.1} fill="white" />
    </g>
  );
  const my = cy + 10;
  let eyes: React.ReactNode;
  let mouth: React.ReactNode;

  switch (mood) {
    case "wink":
      eyes = (
        <>
          <path d={`M${cx - 13} ${cy}q3-3.5 6 0`} {...line} />
          {eye(cx + 9)}
        </>
      );
      mouth = <path d={`M${cx - 5} ${my}q5 5 11-1`} {...line} />;
      break;
    case "shifty":
      eyes = (
        <>
          {eye(cx - 7)}
          {eye(cx + 11)}
          <path d={`M${cx - 12} ${cy - 3.5}h9M${cx + 6} ${cy - 3.5}h9`} {...line} strokeWidth={2.2} />
        </>
      );
      mouth = <path d={`M${cx - 3} ${my}h8`} {...line} />;
      break;
    case "shocked":
      eyes = (
        <>
          {eye(cx - 10, true)}
          {eye(cx + 10, true)}
        </>
      );
      mouth = <ellipse cx={cx} cy={my + 1} rx={3.6} ry={4.4} fill={INK} />;
      break;
    case "sweaty":
      eyes = (
        <>
          {eye(cx - 10)}
          {eye(cx + 10)}
          <path d={`M${cx - 15} ${cy - 8}l7 2.5M${cx + 15} ${cy - 8}l-7 2.5`} {...line} strokeWidth={2.2} />
        </>
      );
      mouth = <path d={`M${cx - 6} ${my + 1}q3-3 6 0t6 0`} {...line} />;
      break;
    case "cheer":
      eyes = (
        <>
          {eye(cx - 10)}
          {eye(cx + 10)}
        </>
      );
      mouth = (
        <path
          d={`M${cx - 6} ${my - 1.5}h12q-1 8-6 8t-6-8Z`}
          fill={INK}
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      );
      break;
    default:
      eyes = (
        <>
          {eye(cx - 10)}
          {eye(cx + 10)}
        </>
      );
      mouth = <path d={`M${cx - 5} ${my}q5 5 10 0`} {...line} />;
  }

  return (
    <g>
      <ellipse cx={cx - 17} cy={cy + 6} rx={4.6} ry={2.8} fill="#ff6b8a" opacity={0.45} />
      <ellipse cx={cx + 17} cy={cy + 6} rx={4.6} ry={2.8} fill="#ff6b8a" opacity={0.45} />
      <g className={mood === "wink" ? undefined : "mascot-eyes"}>{eyes}</g>
      {mouth}
      {mood === "sweaty" && (
        <path
          d={`M${cx + 25} ${cy - 10}c0 0-4 5.5-4 8a4 4 0 0 0 8 0c0-2.5-4-8-4-8Z`}
          fill="#8fd0ff"
          stroke={INK}
          strokeWidth={1.8}
        />
      )}
    </g>
  );
}

/** Soft gloss on the upper left, which is most of what makes it look squishy. */
function Gloss({ x, y, rx = 9, ry = 5, rotate = -28 }: { x: number; y: number; rx?: number; ry?: number; rotate?: number }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={rx}
      ry={ry}
      fill="white"
      opacity={0.38}
      transform={`rotate(${rotate} ${x} ${y})`}
    />
  );
}

/** The body art, where the face sits, and anything worn over the face. */
function parts(kind: MascotKind, color: string, fuse?: boolean) {
  switch (kind) {
    case "samosa":
      return {
        face: { cx: 50, cy: 62 },
        art: (
          <>
            <path
              d="M50 16L86 82H14Z"
              fill="#f2a93b"
              stroke="#f2a93b"
              strokeWidth={16}
              strokeLinejoin="round"
            />
            {/* crimped edges */}
            <path
              d="M42 24l-3 5M35 36l-3 5M28 48l-3 5M21 60l-3 5M58 24l3 5M65 36l3 5M72 48l3 5M79 60l3 5"
              stroke="#c97d16"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <circle cx="33" cy="76" r="1.6" fill="#c97d16" />
            <circle cx="68" cy="74" r="1.6" fill="#c97d16" />
            <circle cx="60" cy="40" r="1.4" fill="#c97d16" />
            <Gloss x={40} y={34} rx={7} ry={4} rotate={-58} />
          </>
        ),
      };
    case "laddoo":
      return {
        face: { cx: 50, cy: 56 },
        art: (
          <>
            {fuse && (
              <>
                <path d="M62 25c4-6 10-9 15-8" {...line} strokeWidth={3} />
                <path
                  d="M80 9l2 5 5 1-4 3 1 5-4-3-5 2 2-5-3-4 5 0Z"
                  fill="#ffc21a"
                  stroke={INK}
                  strokeWidth={1.6}
                  strokeLinejoin="round"
                  className="mascot-spark"
                />
              </>
            )}
            <circle cx="50" cy="56" r="36" fill="#ff9a2e" />
            {/* boondi */}
            {[
              [30, 40], [44, 30], [60, 33], [72, 46], [27, 60], [76, 64], [36, 80], [52, 85], [66, 79],
              [40, 46], [62, 50],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={2.3} fill="#e57a0f" opacity={0.7} />
            ))}
            <Gloss x={34} y={36} />
          </>
        ),
      };
    case "chai":
      return {
        face: { cx: 50, cy: 60 },
        art: (
          <>
            <path className="mascot-steam" d="M40 18q-5-6 0-12" {...line} strokeWidth={2.4} opacity={0.4} />
            <path className="mascot-steam mascot-steam-2" d="M56 18q-5-6 0-12" {...line} strokeWidth={2.4} opacity={0.4} />
            <path d="M16 24H84L76 88Q75 94 69 94H31Q25 94 24 88Z" fill="#cf8240" />
            <path d="M16 24H84L82.5 36H17.5Z" fill="#f7e2bf" />
            {/* glass ridges */}
            <path d="M30 40l3 50M44 40l1 52M56 40l-1 52M70 40l-3 50" stroke="white" strokeWidth={2} opacity={0.18} />
            <path d="M16 24H84L76 88Q75 94 69 94H31Q25 94 24 88Z" fill="none" stroke="#a8622a" strokeWidth={2} strokeLinejoin="round" />
            <Gloss x={27} y={46} rx={4} ry={11} rotate={-6} />
          </>
        ),
      };
    case "golgappa":
      return {
        face: { cx: 50, cy: 62 },
        art: (
          <>
            <path d="M14 56C14 34 30 22 50 22S86 34 86 56C86 78 70 92 50 92S14 78 14 56Z" fill="#e8b468" />
            <ellipse cx="50" cy="34" rx="17" ry="7.5" fill="#6b3f1d" />
            <ellipse cx="50" cy="33" rx="12" ry="4.5" fill="#3f8f3a" opacity={0.85} />
            <circle cx="26" cy="70" r="1.6" fill="#c08537" />
            <circle cx="76" cy="58" r="1.6" fill="#c08537" />
            <circle cx="70" cy="80" r="1.6" fill="#c08537" />
            <Gloss x={28} y={46} rx={7} ry={4} />
          </>
        ),
      };
    case "kulfi":
      return {
        face: { cx: 50, cy: 44 },
        art: (
          <>
            <rect x="44" y="72" width="12" height="24" rx="4" fill="#e3c08d" />
            <path d="M24 26Q24 8 50 8Q76 8 76 26V66Q76 78 64 78H36Q24 78 24 66Z" fill={color} />
            {/* pista bits */}
            <circle cx="34" cy="64" r="2" fill="white" opacity={0.55} />
            <circle cx="64" cy="22" r="2" fill="white" opacity={0.55} />
            <circle cx="66" cy="62" r="1.8" fill="white" opacity={0.55} />
            <Gloss x={34} y={20} rx={6} ry={3.6} rotate={-35} />
          </>
        ),
      };
    case "jalebi": {
      // A spiral of half-circles, each wider than the last.
      const spiral =
        "M50 54A5 5 0 0 1 60 54A10 10 0 0 1 40 54A15 15 0 0 1 70 54A20 20 0 0 1 30 54A25 25 0 0 1 80 54A30 30 0 0 1 20 54";
      return {
        face: { cx: 50, cy: 52 },
        art: (
          <>
            <path d={spiral} fill="none" stroke="#d9650b" strokeWidth={12} strokeLinecap="round" />
            <path d={spiral} fill="none" stroke="#ff9a2e" strokeWidth={8} strokeLinecap="round" />
            <path d={spiral} fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round" opacity={0.35} transform="translate(-1.5 -2)" />
            <circle cx="50" cy="54" r="19" fill="#ff9a2e" stroke="#d9650b" strokeWidth={2.4} />
            <Gloss x={41} y={43} rx={5} ry={3} />
          </>
        ),
      };
    }
    case "mango":
      return {
        face: { cx: 50, cy: 58 },
        art: (
          <>
            <defs>
              <linearGradient id="mango-skin" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0" stopColor="#d8dc3a" />
                <stop offset="0.45" stopColor="#ffb02e" />
                <stop offset="1" stopColor="#ff7a3d" />
              </linearGradient>
            </defs>
            {/* stem and leaf */}
            <path d="M50 22C50 16 53 12 57 10" {...line} strokeWidth={3} />
            <path d="M57 11C66 4 78 6 82 14C74 20 62 19 57 11Z" fill="#2fa84f" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
            <path d="M60 12C67 11 74 12 79 14" stroke="#1d7a38" strokeWidth={1.6} strokeLinecap="round" />
            <path
              d="M50 20C74 16 92 36 90 62C88 84 68 96 50 94C30 96 10 82 10 60C10 36 28 22 50 20Z"
              fill="url(#mango-skin)"
            />
            <ellipse cx="30" cy="80" rx="6" ry="3" fill="#ff5a3d" opacity={0.35} />
            <Gloss x={30} y={36} rx={8} ry={4.5} />
          </>
        ),
      };
    case "dice":
      return {
        face: { cx: 50, cy: 58 },
        art: (
          <>
            <rect x="12" y="16" width="76" height="76" rx="22" fill={color} />
            <circle cx="28" cy="31" r="4.4" fill="white" />
            <circle cx="72" cy="31" r="4.4" fill="white" />
            <Gloss x={30} y={22} rx={8} ry={3.6} rotate={-12} />
          </>
        ),
      };
    case "jamun":
      return {
        face: { cx: 50, cy: 54 },
        art: (
          <>
            <ellipse cx="50" cy="88" rx="34" ry="8" fill="#ffb02e" opacity={0.75} />
            <circle cx="50" cy="56" r="36" fill="#7a3419" />
            <path d="M24 70Q50 90 76 70" fill="none" stroke="#ffb02e" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
            <Gloss x={33} y={34} rx={8} ry={4.5} />
          </>
        ),
      };
    case "vadapav":
      return {
        face: { cx: 50, cy: 34 },
        art: (
          <>
            <path d="M14 70H86Q86 90 50 90Q14 90 14 70Z" fill="#e8b468" />
            <path d="M18 56H82Q88 56 88 63Q88 70 80 70H20Q12 70 12 63Q12 56 18 56Z" fill="#f08a24" />
            <path d="M20 58H80" stroke="#3f9a45" strokeWidth={4} strokeLinecap="round" />
            <path d="M10 56C10 30 28 14 50 14S90 30 90 56Z" fill="#e8b468" />
            <circle cx="30" cy="26" r="1.5" fill="#c08537" />
            <circle cx="70" cy="24" r="1.5" fill="#c08537" />
            <circle cx="78" cy="42" r="1.5" fill="#c08537" />
            <circle cx="22" cy="44" r="1.5" fill="#c08537" />
            <Gloss x={32} y={26} rx={7} ry={3.6} rotate={-30} />
          </>
        ),
      };
    case "paan":
      return {
        face: { cx: 50, cy: 46 },
        art: (
          <>
            <path d="M50 92C18 70 6 50 12 32C18 14 42 14 50 32C58 14 82 14 88 32C94 50 82 70 50 92Z" fill="#3f9a45" />
            <path d="M50 88V66M50 78L40 68M50 78L60 68" fill="none" stroke="#2a7a33" strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
            <Gloss x={28} y={30} rx={7} ry={4} rotate={-35} />
          </>
        ),
      };
    case "bhutta":
      return {
        face: { cx: 50, cy: 40 },
        art: (
          <>
            <rect x="28" y="6" width="44" height="84" rx="22" fill="#ffc21a" />
            {[[38, 66], [50, 66], [62, 66], [38, 78], [50, 78], [62, 78], [44, 86], [56, 86]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={3.4} fill="#f0a800" />
            ))}
            <path d="M50 96C26 92 16 70 22 48C32 62 44 70 50 96Z" fill="#5cbf5c" stroke="#2a7a33" strokeWidth={2} strokeLinejoin="round" />
            <path d="M50 96C74 92 84 70 78 48C68 62 56 70 50 96Z" fill="#49ad4d" stroke="#2a7a33" strokeWidth={2} strokeLinejoin="round" />
            <Gloss x={38} y={20} rx={4} ry={8} rotate={-6} />
          </>
        ),
      };
    case "pakora":
      return {
        face: { cx: 52, cy: 54 },
        art: (
          <>
            <path d="M18 62C8 44 20 26 38 28C40 12 62 10 68 26C86 22 96 42 88 58C94 76 76 92 56 87C44 96 22 88 18 62Z" fill="#d98b2b" />
            {[[30, 44], [48, 34], [70, 40], [78, 64], [64, 80], [36, 76], [26, 60]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} fill="#a8621a" opacity={0.7} />
            ))}
            <path d="M74 30q6-2 8 3" stroke="#3f9a45" strokeWidth={4} strokeLinecap="round" fill="none" />
            <Gloss x={36} y={38} rx={7} ry={3.8} rotate={-30} />
          </>
        ),
      };
    case "uncle":
      return {
        face: { cx: 50, cy: 52 },
        art: (
          <>
            <path d="M50 12C78 12 92 34 92 60C92 82 74 93 50 93C26 93 8 82 8 60C8 34 22 12 50 12Z" fill={color} />
            <Gloss x={30} y={28} />
          </>
        ),
        extra: (
          <>
            {/* round specs */}
            <circle cx="40" cy="52" r="9" fill="white" fillOpacity={0.25} stroke={INK} strokeWidth={2.4} />
            <circle cx="60" cy="52" r="9" fill="white" fillOpacity={0.25} stroke={INK} strokeWidth={2.4} />
            <path d="M49 51h2" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
            {/* handlebar moustache, over the mouth */}
            <path
              d="M50 64C45 60 36 60 30 65C27 68 23 67 22 63C23 72 34 74 42 70C46 68 48 67 50 67C52 67 54 68 58 70C66 74 77 72 78 63C77 67 73 68 70 65C64 60 55 60 50 64Z"
              fill={INK}
            />
          </>
        ),
      };
    case "didi":
      return {
        face: { cx: 50, cy: 58 },
        art: (
          <>
            <path d="M50 10C66 10 74 26 78 42C86 54 92 66 90 76C88 88 72 94 50 94C28 94 12 88 10 76C8 66 14 54 22 42C26 26 34 10 50 10Z" fill={color} />
            <Gloss x={36} y={26} rx={7} ry={4} />
          </>
        ),
        extra: (
          <>
            <circle cx="50" cy="42" r="3.4" fill="#e3262f" stroke="white" strokeWidth={1.2} />
            {/* jhumkas */}
            {[13, 87].map((x) => (
              <g key={x} className="mascot-jhumka" style={{ transformOrigin: `${x}px 60px` }}>
                <circle cx={x} cy={60} r={2.2} fill="#ffc21a" stroke={INK} strokeWidth={1.4} />
                <path
                  d={`M${x - 5} 70a5 5 0 0 1 10 0Z`}
                  fill="#ffc21a"
                  stroke={INK}
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
                <path d={`M${x} 62v3`} stroke={INK} strokeWidth={1.4} />
                <circle cx={x} cy={72} r={1.4} fill="#ffc21a" stroke={INK} strokeWidth={1} />
              </g>
            ))}
          </>
        ),
      };
  }
}

export default function Mascot({
  kind,
  mood = "happy",
  color = "var(--tone-solid)",
  fuse,
  className,
  delay,
  title,
}: MascotProps) {
  const { art, face, extra } = parts(kind, color, fuse) as {
    art: React.ReactNode;
    face: { cx: number; cy: number };
    extra?: React.ReactNode;
  };
  const style = delay === undefined ? undefined : ({ "--mascot-delay": `${delay}s` } as React.CSSProperties);

  return (
    <svg
      viewBox="0 0 100 100"
      className={`mascot ${className ?? ""}`}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      overflow="visible"
    >
      <ellipse cx="50" cy="97" rx="30" ry="3.5" fill="black" opacity={0.08} className="mascot-shadow" />
      <g className="mascot-body">
        {art}
        <Face cx={face.cx} cy={face.cy} mood={mood} />
        {extra}
      </g>
    </svg>
  );
}
