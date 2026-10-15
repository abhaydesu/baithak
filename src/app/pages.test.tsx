import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(public element: unknown, public options?: unknown) {}
  },
}));
vi.mock("next/font/local", () => ({ default: () => ({ variable: "f", className: "f" }) }));
vi.mock("next/font/google", () => ({
  Kalam: () => ({ variable: "k", className: "k" }),
  Poppins: () => ({ variable: "p", className: "p" }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/games",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
const track = vi.fn();
vi.mock("@/lib/analytics/client", () => ({ track: (...a: unknown[]) => track(...a) }));
vi.mock("@/lib/sfx", () => ({ sfx: new Proxy({}, { get: () => () => {} }) }));

import Layout, { metadata as layoutMeta, viewport } from "./layout";
import Home from "./page";
import GamesPage from "./games/page";
import OfflineIndex from "./games/offline/page";
import ToolsPage from "./tools/page";
import OfflineGame, {
  generateMetadata as offlineMeta, generateStaticParams as offlineParams,
} from "./games/offline/[slug]/page";
import OfflinePlay, {
  generateMetadata as playMeta, generateStaticParams as playParams,
} from "./games/offline/[slug]/play/page";
import OfflineOg, { generateStaticParams as ogParams } from "./games/offline/[slug]/opengraph-image";
import BombPage from "./games/pass-the-bomb/page";
import BombPlay from "./games/pass-the-bomb/play/page";
import Top9Page from "./games/top-9/page";
import Top9Play from "./games/top-9/play/page";
import BombOg from "./games/pass-the-bomb/opengraph-image";
import Top9Og from "./games/top-9/opengraph-image";
import SiteOg from "./opengraph-image";
import Icon from "./icon";
import AppleIcon from "./apple-icon";
import robots from "./robots";
import sitemap from "./sitemap";
import manifest from "./manifest";
import { GET as llms } from "./llms.txt/route";
import { offlineGames } from "@/lib/offlineGames";
import { allGames } from "@/lib/games";
import { playableGames, playProps } from "./games/playable";
import Analytics from "./components/Analytics";

afterEach(cleanup);

async function show(node: ReactElement | Promise<ReactElement>) {
  const { container } = render(await node);
  expect(container.innerHTML.length).toBeGreaterThan(20);
  return container;
}
const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("pages render", () => {
  it("home, games, tools, offline index", async () => {
    await show(<Home />);
    await show(<GamesPage />);
    await show(<ToolsPage />);
    expect(() => OfflineIndex()).toThrow("NEXT_REDIRECT:/games");
  });
  it("top 9 and bomb detail + play pages", async () => {
    await show(<Top9Page />);
    await show(<BombPage />);
    await show(<Top9Play />);
    await show(<BombPlay />);
  });
  it("root layout wraps children", async () => {
    const { container } = render(Layout({ children: <p>child</p> }) as ReactElement, {
      container: document.createElement("div"),
    });
    expect(container.textContent).toContain("child");
    expect(layoutMeta.title).toBeTruthy();
    expect(viewport).toBeTruthy();
  });
  it("every offline game has a details page and metadata", async () => {
    expect(await offlineParams()).toHaveLength(offlineGames.length);
    for (const g of offlineGames) {
      await show(await OfflineGame(params(g.slug)));
      cleanup();
      expect((await offlineMeta(params(g.slug))).title).toContain(g.title);
    }
    expect(await offlineMeta(params("nope"))).toEqual({});
    await expect(OfflineGame(params("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
  it("every playable game has a play page", async () => {
    const slugs = await playParams();
    expect(slugs.length).toBe(Object.keys(playableGames).filter((s) => offlineGames.some((g) => g.slug === s)).length);
    for (const { slug } of slugs) {
      await show(await OfflinePlay(params(slug)));
      cleanup();
      expect(await playMeta(params(slug))).toBeTruthy();
      expect(playProps(slug)).toBeTruthy();
    }
    await expect(OfflinePlay(params("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("metadata routes", () => {
  it("builds share images", async () => {
    expect(ogParams()).toHaveLength(offlineGames.length);
    for (const slug of [offlineGames[0].slug, "nope"]) expect(await OfflineOg(params(slug))).toBeTruthy();
    for (const fn of [BombOg, Top9Og, SiteOg, Icon, AppleIcon]) expect(await fn()).toBeTruthy();
  });
  it("builds robots, sitemap, manifest and llms.txt", async () => {
    expect(robots().rules).toBeTruthy();
    expect(sitemap().length).toBe(allGames.length + 3);
    expect(manifest().name).toBeTruthy();
    const res = llms();
    expect(await res.text()).toContain("## Games");
  });
});

describe("analytics beacon", () => {
  it("tracks a pageview", () => {
    render(<Analytics />);
    expect(track).toHaveBeenCalledWith("pageview");
  });
});
