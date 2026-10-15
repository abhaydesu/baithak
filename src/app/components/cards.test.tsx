import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { allGames } from "@/lib/games";
import { CardPeek, CardSpread, PlayingCard } from "./Cards";
import { SpinBadge, Sticker } from "./Stickers";

afterEach(cleanup);

describe("playing cards", () => {
  it("shows the name, tagline and smallest group, and links to the game", () => {
    const game = allGames[0];
    render(<PlayingCard game={game} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", game.href);
    expect(link).toHaveTextContent(game.title);
    expect(link).toHaveTextContent(`${game.players.match(/\d+/)![0]}+`);
  });
  it("deals a spread and a peeking hand", () => {
    render(<CardSpread games={allGames.slice(0, 3)} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    cleanup();
    const { container } = render(<CardPeek games={allGames.slice(0, 5)} />);
    expect(container.querySelectorAll("a")).toHaveLength(5);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("stickers", () => {
  it("renders a label and a rim-text badge", () => {
    render(<Sticker color="#f2862e">2–15 players</Sticker>);
    expect(screen.getByText("2–15 players")).toHaveClass("sticker");
    const { container } = render(<SpinBadge />);
    expect(container.querySelector("textPath")?.textContent).toContain("PASS THE PHONE");
  });
});
