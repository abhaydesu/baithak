import type { ReactNode } from "react";

/** A little peeled-off label: white, ink outline, hard shadow. */
export function Sticker({
  children,
  color = "#ffffff",
  on = "var(--color-ink)",
  className = "",
}: {
  children: ReactNode;
  color?: string;
  on?: string;
  className?: string;
}) {
  return (
    <span
      className={`sticker ${className}`}
      style={{ "--sticker": color, "--on": on } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

/** A round stamp with text running round its rim and a spark in the middle. */
export function SpinBadge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <circle cx="60" cy="60" r="57" fill="#f5b82e" stroke="#1c1917" strokeWidth="3" />
      <g className="spin-slow" style={{ transformOrigin: "60px 60px" }}>
        <defs>
          <path id="badge-rim" d="M60 60 m-42 0 a42 42 0 1 1 84 0 a42 42 0 1 1 -84 0" />
        </defs>
        <text fontFamily="var(--font-display)" fontWeight="700" fontSize="12.5" letterSpacing="2.6" fill="#1c1917">
          <textPath href="#badge-rim">PASS THE PHONE • NO APP • PASS THE PHONE • NO APP •</textPath>
        </text>
      </g>
      <path
        d="M60 40 L65 55 L80 60 L65 65 L60 80 L55 65 L40 60 L55 55 Z"
        fill="#e2457e"
        stroke="#1c1917"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
