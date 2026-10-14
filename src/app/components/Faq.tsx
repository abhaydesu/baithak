"use client";

import { useId, useState } from "react";
import Link from "next/link";

import type { Faq as FaqItem } from "@/lib/faq";

/**
 * A plain list split by hairlines, with a thin plus that turns into a minus.
 * The answer eases open (grid rows 0fr → 1fr). Closed answers stay in the
 * page for search engines but are inert for keyboards and screen readers.
 */
export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();

  return (
    <ul className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panel = `${base}-panel-${i}`;
        const button = `${base}-button-${i}`;
        return (
          <li key={item.question} className="border-b border-line">
            <h3>
              <button
                id={button}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-6 py-6 text-left font-display text-lg font-semibold leading-snug text-ink transition-colors hover:text-ink-soft lg:py-7 lg:text-[1.3rem]"
              >
                {item.question}
                <span aria-hidden="true" className="faq-icon mt-1 shrink-0" data-open={isOpen}>
                  <span />
                  <span />
                </span>
              </button>
            </h3>
            <div
              id={panel}
              role="region"
              aria-labelledby={button}
              inert={!isOpen}
              className="faq-panel"
              data-open={isOpen}
            >
              <div className="overflow-hidden">
                <div className="faq-body max-w-2xl pb-8 pr-2 sm:pr-14">
                  <p className="text-[1.05rem] leading-relaxed text-ink-soft lg:text-lg">
                    {item.answer}
                  </p>
                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="text-link mt-4 inline-flex items-center gap-1"
                    >
                      {item.link.label} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
