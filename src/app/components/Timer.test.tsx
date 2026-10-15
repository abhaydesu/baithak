import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Timer from "./Timer";
import { sfx } from "@/lib/sfx";

vi.mock("@/lib/sfx", () => ({
  sfx: {
    unlock: vi.fn(),
    buzzer: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.clearAllMocks();
});

function expectRemainingTime(value: string) {
  expect(screen.getByRole("timer").querySelector(".sr-only")).toHaveTextContent(value);
}

describe("Timer", () => {
  it("renders the time with the colon as its own spaced element", () => {
    render(<Timer initialSeconds={30} />);

    const timer = screen.getByRole("timer");
    const visualTime = timer.querySelector('[aria-hidden="true"]');

    expectRemainingTime("00 minutes and 30 seconds remaining");
    expect(Array.from(visualTime?.children ?? []).map((part) => part.textContent)).toEqual([
      "00",
      ":",
      "30",
    ]);
  });

  it("renders an empty initial timer with no progress", () => {
    const { container } = render(<Timer initialSeconds={0} presets={[]} />);

    expectRemainingTime("Time is up");
    expect(screen.getByRole("timer")).toHaveAttribute("aria-live", "assertive");
    expect(container.querySelector<HTMLElement>(".mt-3 > div")?.style.width).toBe("0%");
  });

  it("selects a preset and resets the displayed duration", async () => {
    const user = userEvent.setup();
    render(<Timer initialSeconds={30} />);

    await user.click(screen.getByRole("button", { name: "1.5m" }));

    expectRemainingTime("01 minutes and 30 seconds remaining");
    expect(screen.getByRole("button", { name: "1.5m" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows validation when a zero duration is submitted", async () => {
    const user = userEvent.setup();
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "Custom" }));
    await user.clear(screen.getByRole("spinbutton", { name: "Minutes" }));
    await user.clear(screen.getByRole("spinbutton", { name: "Seconds" }));
    await user.click(screen.getByRole("button", { name: "Set time" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a duration from 1 second to 99:59.",
    );
    expectRemainingTime("01 minutes and 00 seconds remaining");
  });

  it("applies a custom duration and closes the editor", async () => {
    const user = userEvent.setup();
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "Custom" }));
    await user.clear(screen.getByRole("spinbutton", { name: "Minutes" }));
    await user.type(screen.getByRole("spinbutton", { name: "Minutes" }), "2");
    await user.clear(screen.getByRole("spinbutton", { name: "Seconds" }));
    await user.type(screen.getByRole("spinbutton", { name: "Seconds" }), "5");
    await user.click(screen.getByRole("button", { name: "Set time" }));

    expectRemainingTime("02 minutes and 05 seconds remaining");
    expect(screen.queryByRole("spinbutton", { name: "Minutes" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Custom" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("pauses, resumes, completes, and can start again", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T00:00:00Z"));
    const onComplete = vi.fn();
    render(<Timer initialSeconds={2} presets={[2]} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(sfx.unlock).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expectRemainingTime("00 minutes and 01 seconds remaining");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    await act(async () => vi.advanceTimersByTimeAsync(2000));
    expectRemainingTime("00 minutes and 01 seconds remaining");

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    await act(async () => vi.advanceTimersByTimeAsync(1200));
    expectRemainingTime("Time is up");
    expect(onComplete).toHaveBeenCalledOnce();
    expect(sfx.buzzer).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Again" }));
    expectRemainingTime("00 minutes and 02 seconds remaining");
  });

  it("resets an in-progress countdown to the selected duration", async () => {
    vi.useFakeTimers();
    render(<Timer initialSeconds={5} presets={[5, 10]} />);

    fireEvent.click(screen.getByRole("button", { name: "10s" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    await act(async () => vi.advanceTimersByTimeAsync(2200));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expectRemainingTime("00 minutes and 10 seconds remaining");
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it.each([
    ["100", "0"],
    ["1", "60"],
    ["1.5", "0"],
  ])("rejects custom duration %s minutes and %s seconds", (minutes, seconds) => {
    render(<Timer />);
    fireEvent.click(screen.getByRole("button", { name: "Custom" }));

    fireEvent.change(screen.getByRole("spinbutton", { name: "Minutes" }), {
      target: { value: minutes },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Seconds" }), {
      target: { value: seconds },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Set time" }).closest("form")!);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a duration from 1 second to 99:59.",
    );
    expectRemainingTime("01 minutes and 00 seconds remaining");
  });

  it.each([
    ["0", "1", "00 minutes and 01 seconds remaining"],
    ["99", "59", "99 minutes and 59 seconds remaining"],
  ])("accepts custom duration %s minutes and %s seconds", async (minutes, seconds, expected) => {
    const user = userEvent.setup();
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "Custom" }));
    await user.clear(screen.getByRole("spinbutton", { name: "Minutes" }));
    await user.type(screen.getByRole("spinbutton", { name: "Minutes" }), minutes);
    await user.clear(screen.getByRole("spinbutton", { name: "Seconds" }));
    await user.type(screen.getByRole("spinbutton", { name: "Seconds" }), seconds);
    await user.click(screen.getByRole("button", { name: "Set time" }));

    expectRemainingTime(expected);
  });
});
