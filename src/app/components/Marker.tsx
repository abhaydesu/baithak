import type { ReactNode } from "react";

import { BRAND } from "@/lib/gameArt";

/**
 * A thick marigold underline that draws in under a word, then sheds a slow
 * trickle of square pixels in the brand colours below it, like sparks off the
 * pixel horizon. Fixed positions and timings,
 * so it renders the same on the server and the client.
 */
const SPARKS = [
  { left: 6, size: 0.09, color: BRAND.marigold, delay: 0.9, drift: -0.12 },
  { left: 18, size: 0.06, color: BRAND.rani, delay: 2.3, drift: 0.08 },
  { left: 31, size: 0.08, color: BRAND.saffron, delay: 1.5, drift: -0.05 },
  { left: 45, size: 0.06, color: BRAND.violet, delay: 3.1, drift: 0.1 },
  { left: 57, size: 0.09, color: BRAND.marigold, delay: 1.1, drift: 0.04 },
  { left: 69, size: 0.06, color: BRAND.rani, delay: 2.7, drift: -0.09 },
  { left: 81, size: 0.08, color: BRAND.saffron, delay: 1.9, drift: 0.12 },
  { left: 93, size: 0.06, color: BRAND.violet, delay: 3.5, drift: -0.06 },
];

export default function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="marker">
      {children}
      <span aria-hidden="true" className="marker-sparks">
        {SPARKS.map((s, i) => (
          <span
            key={i}
            style={
              {
                left: `${s.left}%`,
                width: `${s.size}em`,
                height: `${s.size}em`,
                background: s.color,
                animationDelay: `${s.delay}s`,
                "--drift": `${s.drift}em`,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
    </span>
  );
}
