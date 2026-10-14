"use client";

import { sfx } from "@/lib/sfx";

/** Plays a sound from a tap (unlocking audio on the first one). */
export function play(name: keyof typeof sfx) {
  sfx.unlock();
  sfx[name]();
}

/** Small caps label, as in the game screens. Takes the stage's text colour. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.54rem] font-bold uppercase tracking-[0.16em] opacity-70">{children}</p>
  );
}

/** The site's press button, sized for the phone. White by default. */
export function Btn({
  children,
  onClick,
  color = "#ffffff",
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press press-xs w-full"
      style={{ "--c": color, "--on": "var(--color-ink)" } as React.CSSProperties}
    >
      {children}
    </button>
  );
}

/** A white card on the stage. */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[0.9rem] bg-white text-ink ${className}`}>{children}</div>;
}
