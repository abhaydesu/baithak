import Link from "next/link";

import { MARK_SVG } from "@/lib/og/mark";

/** The logo mark (see src/lib/og/mark.tsx). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block aspect-[42/48] shrink-0 [&>svg]:h-full [&>svg]:w-full ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: MARK_SVG }}
    />
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group flex items-end gap-1.5 ${className ?? ""}`}
      aria-label="Baithak home"
    >
      <LogoMark className="logo-mark h-[1.95rem]" />
      <span className="pb-[0.08em] font-display text-[1.7rem] font-bold leading-none tracking-[-0.02em] text-ink">
        baithak
      </span>
    </Link>
  );
}
