"use client";

import { useEffect, useRef } from "react";

/**
 * Jumps back to the top of the page whenever a game moves to a new screen,
 * so a long setup form doesn't leave you looking at the footer.
 */
export function useScrollToTopOnChange(key: string, ready = true) {
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const last = prev.current;
    prev.current = key;
    if (last === null || last === key) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [key, ready]);
}
