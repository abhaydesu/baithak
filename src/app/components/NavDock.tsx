"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";

import { GridIcon, HomeIcon, ToolboxIcon } from "./Icons";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import SurpriseButton from "./SurpriseButton";

/* Each tab borrows a seat colour from the logo mark */
const items = [
  { href: "/", label: "Home", Icon: HomeIcon, dot: "var(--logo-blue)" },
  { href: "/games", label: "Games", Icon: GridIcon, dot: "#e86a96" },
  { href: "/tools", label: "Tools", Icon: ToolboxIcon, dot: "var(--logo-green)" },
] as const;

const spring = { type: "spring", stiffness: 520, damping: 38, mass: 0.8 } as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavDock() {
  const pathname = usePathname();
  // The tab tapped last, shown as current straight away so the indicator
  // doesn't bounce back while the next page loads. Dropped once the route changes.
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      {/* Desktop / tablet: logo, a floating tab pill, then the actions */}
      <header
        data-scrolled={scrolled}
        className="nav-top group sticky top-0 z-40 hidden md:block"
      >
        <div className="mx-auto grid h-[4.75rem] max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 transition-[height] duration-300 lg:px-8 group-data-[scrolled=true]:h-16">
          <Logo compact={scrolled} className="justify-self-start" />

          <nav
            aria-label="Main"
            className="nav-tabs flex items-center gap-1 rounded-full border border-line bg-surface/80 p-1 backdrop-blur-md"
          >
            {items.map(({ href, label, dot }) => {
              const active = current(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => select(e, href)}
                  style={{ "--dot": dot } as React.CSSProperties}
                  className="nav-tab relative rounded-full px-5 py-2 font-semibold text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-on-ink"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-desktop-active"
                      className="absolute inset-0 rounded-full bg-ink"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span aria-hidden="true" className="nav-dot" />
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-self-end gap-1.5">
            <ThemeToggle />
            <SurpriseButton className="pill surprise h-10 min-h-0 text-[0.95rem]" />
          </div>
        </div>
      </header>

      {/* Mobile: slim pinned logo header + a bottom dock */}
      <header
        data-scrolled={scrolled}
        className="nav-top sticky top-0 z-40 box-content flex h-16 items-center pt-[env(safe-area-inset-top)] justify-between px-4 transition-[height] duration-300 data-[scrolled=true]:h-14 md:hidden"
      >
        <Logo size="sm" compact={scrolled} />
        <ThemeToggle />
      </header>

      <nav
        aria-label="Main"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.6rem] border border-line bg-surface/85 p-1.5 shadow-[0_14px_36px_-14px_rgb(28_25_23/0.35)] backdrop-blur-xl">
          {items.map(({ href, label, Icon, dot }) => {
            const active = current(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => select(e, href)}
                style={{ "--dot": dot } as React.CSSProperties}
                className="dock-tab relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-[1.15rem] text-xs font-semibold text-ink-soft transition-colors aria-[current=page]:text-on-ink"
              >
                {active && (
                  <motion.span
                    layoutId="nav-mobile-active"
                    className="absolute inset-0 rounded-[1.15rem] bg-ink"
                    aria-hidden="true"
                  />
                )}
                <span className="dock-icon relative">
                  <Icon />
                  <span aria-hidden="true" className="dock-dot" />
                </span>
                <span className="relative">{label}</span>
              </Link>
            );
          })}
          <SurpriseButton
            compact
            className="surprise dock-tab flex h-14 flex-col items-center justify-center gap-0.5 rounded-[1.15rem] text-xs font-semibold text-ink-soft"
          />
        </div>
      </nav>
    </MotionConfig>
  );
}
