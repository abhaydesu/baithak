import { act, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

/** Small seeded PRNG so a failing run reproduces. */
export function prng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/** Taps random enabled buttons and fills random inputs, like a curious user. */
export function monkey(steps: number, seed: number, root: ParentNode = document) {
  const rand = prng(seed);
  const seen = new Set<string>();
  for (let i = 0; i < steps; i++) {
    const buttons = [...root.querySelectorAll<HTMLElement>("button, [role=button], [role=tab], [role=checkbox], a[href], summary, label")].filter(
      (b) => !(b as HTMLButtonElement).disabled && b.getAttribute("aria-disabled") !== "true",
    );
    const inputs = [...root.querySelectorAll<HTMLInputElement>("input:not([type=range]), textarea, select")];
    act(() => {
      if (inputs.length && rand() < 0.2) {
        const el = inputs[Math.floor(rand() * inputs.length)];
        if (el.tagName === "SELECT") {
          const opts = [...(el as unknown as HTMLSelectElement).options];
          if (opts.length) fireEvent.change(el, { target: { value: opts[Math.floor(rand() * opts.length)].value } });
        } else if (el.type === "checkbox" || el.type === "radio") {
          fireEvent.click(el);
        } else {
          fireEvent.change(el, { target: { value: ["Asha", "", "milk", "42", "x".repeat(30)][Math.floor(rand() * 5)] } });
        }
      } else if (buttons.length) {
        const el = buttons[Math.floor(rand() * buttons.length)];
        seen.add(el.textContent?.slice(0, 20) ?? "");
        if (el.tagName === "A") el.addEventListener("click", (e) => e.preventDefault(), { once: true });
        fireEvent.click(el);
      }
      if (rand() < 0.15) fireEvent.keyDown(document.body, { key: ["Enter", "Escape", " ", "ArrowRight"][Math.floor(rand() * 4)] });
    });
    if (rand() < 0.1) act(() => void vi.advanceTimersByTime(3000));
  }
  return seen;
}
