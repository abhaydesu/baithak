import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/games",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock("@/lib/sfx", () => ({ sfx: new Proxy({}, { get: () => () => {} }) }));

import { monkey } from "@/test/monkey";
import { allGames } from "@/lib/games";
import { offlineGames } from "@/lib/offlineGames";
import { faqs } from "@/lib/faq";
import type { GlyphKind } from "@/lib/gameArt";
import { GAME_ART } from "@/lib/gameArt";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import * as Icons from "./Icons";
import Character from "./Character";
import EndGameButton from "./EndGameButton";
import Faq from "./Faq";
import Footer from "./Footer";
import GameArt from "./GameArt";
import GameCard from "./GameCard";
import GameCatalogue from "./GameCatalogue";
import GameDetails from "./GameDetails";
import GameGlyph from "./GameGlyph";
import { HandTransition, handCardVariants } from "./HandTransition";
import HeroShowcase from "./HeroShowcase";
import JsonLd from "./JsonLd";
import KitChecklist from "./KitChecklist";
import LegoBuilder from "./LegoBuilder";
import Logo, { LogoMark } from "./Logo";
import Marker from "./Marker";
import Mascot from "./Mascot";
import NavDock from "./NavDock";
import PhoneDemo from "./PhoneDemo";
import PixelHorizon from "./PixelHorizon";
import PlayLink from "./PlayLink";
import PressButton from "./PressButton";
import RandomWordGenerator from "./RandomWordGenerator";
import SectionHeading from "./SectionHeading";
import Studs from "./Studs";
import SurpriseButton from "./SurpriseButton";
import Moment, { MOMENTS } from "./phone/Moment";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("static components", () => {
  it("renders every icon", () => {
    for (const [name, Icon] of Object.entries(Icons)) {
      if (typeof Icon !== "function") continue;
      const { container, unmount } = render((Icon as (p: object) => React.ReactElement)({}));
      expect(container.querySelector("svg"), name).toBeTruthy();
      unmount();
    }
  });
  it("renders every glyph, art and character", () => {
    const kinds = new Set<GlyphKind>(Object.values(GAME_ART).map((a) => a.glyph));
    for (const kind of kinds) render(<GameGlyph kind={kind} />);
    for (const slug of [...Object.keys(GAME_ART), "unknown"]) render(<GameArt slug={slug} />);
    for (const g of allGames) render(<Character kind={g.character} />);
    render(<Character kind="pakora" />);
    for (const kind of ["didi", "uncle", "samosa", "laddoo", "dice", "kulfi"] as const) {
      for (const mood of ["wink", "cheer", "shocked", "shifty", "happy", "sweaty"] as const) {
        render(<Mascot kind={kind} mood={mood} fuse delay={1} title="t" />);
      }
    }
    expect(document.querySelectorAll("svg").length).toBeGreaterThan(20);
  });
  it("renders simple pieces", () => {
    render(<><Footer /><Logo /><LogoMark /><Marker>hi</Marker><Studs count={4} /><SectionHeading title="T" description="D" id="x" /><PixelHorizon /><PixelHorizon compact /><HeroShowcase /></>);
    render(<PressButton href="/x" color="#fff" on="#000" size="lg">Go</PressButton>);
    render(<PressButton href="/x" size="sm">Go</PressButton>);
    render(<JsonLd data={{ a: "</script>" }} />);
    expect(document.querySelector("script[type='application/ld+json']")!.innerHTML).not.toContain("</script>");
  });
  it("shows FAQ answers on toggle", () => {
    render(<Faq items={faqs.slice(0, 3)} />);
    monkey(20, 3);
    expect(document.body.textContent).toContain(faqs[0].question);
  });
  it("renders game cards", () => {
    for (const g of allGames) render(<GameCard game={g} className="x" />);
  });
  it("filters the catalogue", () => {
    render(<GameCatalogue games={allGames} />);
    monkey(80, 7);
    expect(document.body.textContent).toBeTruthy();
  });
  it("checks off a kit list", () => {
    render(<KitChecklist items={["Pen", "Paper"]} builtIn={["Timer"]} />);
    fireEvent.click(screen.getByText("Pen"));
    fireEvent.click(screen.getByText("Pen"));
    monkey(10, 2);
    render(<KitChecklist items={[]} />);
    expect(screen.getByText(/Nothing at all/)).toBeInTheDocument();
  });
  it("confirms before ending a game", () => {
    const onEnd = vi.fn();
    render(<EndGameButton onEnd={onEnd} />);
    fireEvent.click(screen.getByText("End game"));
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onEnd).toHaveBeenCalled();
  });
  it("animates hands", () => {
    const { rerender } = render(<HandTransition handKey="a" className="c">x</HandTransition>);
    rerender(<HandTransition handKey="b">y</HandTransition>);
    expect(handCardVariants).toHaveProperty("show");
  });
  it("renders moments", () => {
    for (const spec of Object.values(MOMENTS)) render(<Moment spec={spec} glyph="tiles" />);
  });
});

describe("GameDetails", () => {
  const base = { slug: "imposter", title: "Imposter", description: "d", players: "3-8", duration: "20m", kit: ["Pen"], steps: ["Setup: do it", "Just play"] };
  it("renders with and without play, tools, notes", () => {
    render(<GameDetails {...base} />);
    render(<GameDetails {...base} details="more" onScreen builtIn={["Timer"]} note="small print" tools={<p>tools</p>} play={{ href: "/p", storageKey: STORAGE_KEYS.imposter, pitch: "pitch" }} />);
    for (const g of offlineGames) render(<GameDetails {...base} slug={g.slug} title={g.title} />);
    expect(screen.getAllByText("Imposter").length).toBeGreaterThan(0);
  });
});

describe("PlayLink", () => {
  it("offers resume when a game is in progress", () => {
    localStorage.setItem("k", JSON.stringify({ state: { phase: "discuss" } }));
    render(<PlayLink href="/play" storageKey="k" restart />);
    expect(screen.getByText(/Resume/i)).toBeInTheDocument();
    monkey(5, 1);
  });
  it("starts fresh when none or finished or corrupt", () => {
    render(<PlayLink href="/play" storageKey="none" restart />);
    expect(screen.queryByText(/Resume/i)).toBeNull();
    cleanup();
    localStorage.setItem("k", JSON.stringify({ state: { phase: "gameover" } }));
    render(<PlayLink href="/play" storageKey="k" />);
    expect(screen.queryByText(/Resume/i)).toBeNull();
    cleanup();
    localStorage.setItem("k", "{bad");
    render(<PlayLink href="/play" storageKey="k" />);
    expect(screen.queryByText(/Resume/i)).toBeNull();
  });
  it("reacts to storage events", () => {
    render(<PlayLink href="/play" storageKey="k" />);
    localStorage.setItem("k", JSON.stringify({ state: { phase: "play" } }));
    act(() => void window.dispatchEvent(new Event("storage")));
    expect(screen.getByText(/Resume/i)).toBeInTheDocument();
  });
});

describe("interactive components", () => {
  it("nav dock", () => {
    render(<NavDock />);
    monkey(10, 1);
  });
  it("surprise button picks a game", () => {
    render(<SurpriseButton compact label="Surprise" />);
    render(<SurpriseButton className="x" />);
    monkey(5, 1);
  });
  it("lego builder survives play", () => {
    render(<LegoBuilder />);
    monkey(120, 4);
  });
  it("phone demo opens every game", () => {
    const games = allGames.map(({ slug, title, href }) => ({ slug, title, href }));
    for (const seed of [1, 2, 3]) {
      render(<PhoneDemo games={games} />);
      monkey(300, seed);
      cleanup();
    }
  });
  it("random word generator", () => {
    for (const seed of [1, 2, 3]) {
      render(<RandomWordGenerator />);
      monkey(150, seed);
      cleanup();
    }
    render(<RandomWordGenerator words={["a", "b", "c"]} title="Mine" />);
    monkey(30, 9);
    localStorage.setItem("vybrid_custom_words", "{bad");
    cleanup();
    render(<RandomWordGenerator />);
  });
});
