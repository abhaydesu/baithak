"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { GridIcon, HomeIcon, ToolboxIcon } from "./Icons";
import Logo from "./Logo";
import SurpriseButton from "./SurpriseButton";

const items = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/games", label: "Games", Icon: GridIcon },
  { href: "/tools", label: "Tools", Icon: ToolboxIcon },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavDock() {
  const pathname = usePathname();
  // The tab tapped last, shown as current straight away so the key doesn't
  // bounce back up while the next page loads. Dropped once the route changes.
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null);
  const current = (href: string) =>
    pending && pending.from === pathname ? pending.href === href : isActive(pathname, href);
  const select = (e: React.MouseEvent, href: string) => {
    // Modified clicks open a new tab, so this page stays where it is.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    setPending({ href, from: pathname });
  };
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop / tablet: a quiet bar, so the page scrolls cleanly under it */}
      <header
        data-scrolled={scrolled}
        className="sticky top-0 z-40 hidden border-b border-transparent bg-paper/85 backdrop-blur-md transition-[border-color] duration-200 data-[scrolled=true]:border-line md:block"
      >
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6 lg:px-8">
          <Logo />
          <nav aria-label="Main" className="flex items-center gap-1">
            {items.slice(1).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={current(href) ? "page" : undefined}
                onClick={(e) => select(e, href)}
                className="rounded-full px-4 py-2 font-semibold text-ink-soft transition-colors hover:text-ink aria-[current=page]:bg-paper-deep aria-[current=page]:text-ink"
              >
                {label}
              </Link>
            ))}
            <SurpriseButton className="pill ml-3 h-10 min-h-0 text-[0.95rem]" />
          </nav>
        </div>
      </header>

      {/* Mobile: slim logo header + bottom bar */}
      <header className="flex h-16 items-center px-4 md:hidden">
        <Logo />
      </header>

      <nav
        aria-label="Main"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.4rem] border border-line bg-surface/90 p-1.5 shadow-[0_10px_30px_-12px_rgb(28_25_23/0.3)] backdrop-blur-md">
          {items.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={current(href) ? "page" : undefined}
              onClick={(e) => select(e, href)}
              className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.72rem] font-semibold text-ink-soft transition-colors aria-[current=page]:bg-ink aria-[current=page]:text-white"
            >
              <Icon />
              {label}
            </Link>
          ))}
          <SurpriseButton
            compact
            className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.72rem] font-semibold text-ink-soft"
          />
        </div>
      </nav>
    </>
  );
}
