import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ThemeToggle from "./ThemeToggle";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.theme;
  localStorage.clear();
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
});

describe("theme toggle", () => {
  it("is a switch that flips the page theme, remembers it and recolours the browser bar", async () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    // The system (mocked) is light, and nothing is saved yet.
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);
    // The switch state follows <html data-theme> through a MutationObserver.
    await act(async () => {});
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("baithak-theme")).toBe("dark");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    expect(metas).toHaveLength(1);
    expect(metas[0]).toHaveAttribute("content", "#1d1814");

    fireEvent.click(toggle);
    await act(async () => {});
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("baithak-theme")).toBe("light");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });
});
