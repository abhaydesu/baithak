import Link from "next/link";

import { MARK_SVG } from "@/lib/og/mark";

/** The logo mark (see src/lib/og/mark.tsx). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block aspect-[278/297] shrink-0 [&>svg]:h-full [&>svg]:w-full ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: MARK_SVG }}
    />
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group flex min-h-11 items-center py-1 ${className ?? ""}`}
      aria-label="Baithak home"
    >
      <span className="flex items-baseline gap-[0.35rem]">
      <LogoMark className="logo-mark h-[2.15rem]" />
      <span className="relative -top-[0.44rem] font-display text-[2.1rem] font-extrabold leading-none tracking-[-0.04em] text-ink [font-stretch:94%]">
        baithak
      </span>
      </span>
    </Link>
  );
}
