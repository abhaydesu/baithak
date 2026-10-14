"use client";

import { useState } from "react";

import { CheckIcon } from "./Icons";

interface KitChecklistProps {
  items: string[];
  /** Items the site already provides, e.g. "Timer". */
  builtIn?: string[];
}

export default function KitChecklist({ items, builtIn = [] }: KitChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    return (
      <p className="text-lg text-ink-soft">
        Nothing at all. Just your people and this page.
      </p>
    );
  }

  function toggle(item: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const provided = builtIn.includes(item);
        const done = provided || checked.has(item);
        return (
          <li key={item}>
            <button
              type="button"
              disabled={provided}
              aria-pressed={done}
              onClick={() => toggle(item)}
              className="flex min-h-14 w-full items-center gap-3 py-3 text-left disabled:cursor-default"
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-ink bg-ink text-white"
                    : "border-[#cfccc5] bg-white text-transparent"
                }`}
              >
                <CheckIcon width={15} height={15} strokeWidth={3} />
              </span>
              <span className="flex-1 text-lg text-ink">{item}</span>
              {provided && (
                <span className="rounded-full bg-paper-deep px-2.5 py-0.5 text-sm font-semibold text-ink-soft">
                  Built in
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
