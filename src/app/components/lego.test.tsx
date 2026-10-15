import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sfx", () => ({ sfx: new Proxy({}, { get: () => () => {} }) }));

import LegoBuilder from "./LegoBuilder";

const rect = (r: Partial<DOMRect>) =>
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, right: 360, bottom: 300, width: 360, height: 300, x: 0, y: 0, toJSON() {}, ...r,
  } as DOMRect);

beforeEach(() => {
  localStorage.clear();
  rect({});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const count = () => document.querySelectorAll(".plate .lego-brick, section .relative .lego-brick, [aria-hidden=true].lego-brick").length;
const down = (el: Element, x: number, y: number) => fireEvent.pointerDown(el, { clientX: x, clientY: y, button: 0 });
const move = (x: number, y: number) => act(() => void window.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y })));
const up = () => act(() => void window.dispatchEvent(new PointerEvent("pointerup")));
const tray = (w: number) => screen.getByLabelText(`Add a ${w}-stud brick`);

describe("LegoBuilder", () => {
  it("adds a brick by tapping, keyboard, and undoes/clears", () => {
    render(<LegoBuilder />);
    const before = count();
    down(tray(2), 10, 10);
    up();
    expect(count()).toBe(before + 1);
    fireEvent.keyDown(tray(4), { key: "Enter" });
    fireEvent.keyDown(tray(4), { key: " " });
    fireEvent.keyDown(tray(4), { key: "a" });
    expect(count()).toBe(before + 3);
    fireEvent.click(screen.getByText("Undo"));
    expect(count()).toBe(before + 2);
    fireEvent.click(screen.getByText("Clear"));
    expect(count()).toBe(0);
    fireEvent.click(screen.getByText("Undo"));
    expect(count()).toBe(before + 2);
  });
  it("drags a tray brick onto the plate", () => {
    render(<LegoBuilder />);
    const before = count();
    down(tray(3), 5, 5);
    move(100, 100);
    move(120, 150);
    up();
    expect(count()).toBe(before + 1);
  });
  it("ignores non-primary buttons and drops off the plate", () => {
    render(<LegoBuilder />);
    const before = count();
    fireEvent.pointerDown(tray(2), { clientX: 1, clientY: 1, button: 2 });
    up();
    down(tray(2), 5, 5);
    move(2000, 2000);
    up();
    expect(count()).toBe(before);
  });
  it("moves, paints and removes existing bricks", () => {
    render(<LegoBuilder />);
    const brick = () => document.querySelector<HTMLElement>("[aria-hidden=true].lego-brick")!;
    const before = count();
    // paint: pick a different colour then tap
    const swatches = screen.getAllByRole("radio");
    fireEvent.click(swatches[swatches.length - 1]);
    down(brick(), 10, 10);
    up();
    // move
    down(brick(), 10, 10);
    move(60, 120);
    up();
    expect(count()).toBe(before);
    // drag off the plate removes it
    down(brick(), 10, 10);
    move(5000, 5000);
    up();
    expect(count()).toBe(before - 1);
  });
  it("builds random and fills the stack until it is full", () => {
    render(<LegoBuilder />);
    fireEvent.click(screen.getByText("Surprise build"));
    for (let i = 0; i < 40; i++) fireEvent.keyDown(tray(1), { key: "Enter" });
    expect(document.body.textContent).toMatch(/as tall as it goes/);
    // a full-stack drop is rejected
    down(tray(1), 5, 5);
    move(180, 100);
    up();
  });
  it("restores a saved build and survives corrupt data", () => {
    const first = render(<LegoBuilder />);
    fireEvent.keyDown(tray(2), { key: "Enter" });
    const saved = count();
    first.unmount();
    render(<LegoBuilder />);
    expect(count()).toBe(saved);
    cleanup();
    localStorage.setItem("baithak-lego", "{bad");
    render(<LegoBuilder />);
    localStorage.setItem("baithak-lego", JSON.stringify({ not: "an array" }));
    cleanup();
    render(<LegoBuilder />);
  });
});
