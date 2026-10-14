import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The site's one tactile thing: a chunky button that presses down. Keep it
 * for real actions (start playing, pick a game), one per view, so pressing
 * something still feels like an event. Everything else is a flat `.pill`.
 */
export default function PressButton({
  href,
  children,
  color,
  on,
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  /** Button colour; defaults to ink. */
  color?: string;
  /** Text colour on `color`. */
  on?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = size === "lg" ? "press-lg" : size === "sm" ? "press-sm" : "";
  return (
    <Link
      href={href}
      className={`press ${sizeClass} ${className}`}
      style={color ? ({ "--c": color, "--on": on ?? "#fff" } as React.CSSProperties) : undefined}
    >
      {children}
    </Link>
  );
}
