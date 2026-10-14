"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PlayLinkProps {
  href: string;
  storageKey: string;
  className?: string;
  style?: React.CSSProperties;
  /** When a game is mid-way, also offer to start a fresh one. */
  restart?: boolean;
  restartClassName?: string;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function hasGameInProgress(storageKey: string) {
  try {
    const phase = JSON.parse(localStorage.getItem(storageKey) ?? "null")?.state
      ?.phase;
    return Boolean(phase) && phase !== "setup" && phase !== "gameover";
  } catch {
    return false;
  }
}

/**
 * Sends a saved game back to its setup screen. Players, teams and settings
 * stay; every game's start resets the rounds and scores.
 */
function resetToSetup(storageKey: string) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (saved?.state) {
      saved.state.phase = "setup";
      localStorage.setItem(storageKey, JSON.stringify(saved));
    }
  } catch {}
}

/** "Play now", or "Resume game" (plus "Start new game") when one is mid-way. */
export default function PlayLink({
  href,
  storageKey,
  className,
  style,
  restart = false,
  restartClassName,
}: PlayLinkProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const inProgress = useSyncExternalStore(
    subscribe,
    () => hasGameInProgress(storageKey),
    () => false,
  );

  // Back out of the "are you sure" state if they don't follow through.
  useEffect(() => {
    if (!confirming) return;
    const id = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(id);
  }, [confirming]);

  function startNew() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    resetToSetup(storageKey);
    router.push(href);
  }

  return (
    <>
      <Link href={href} className={className} style={style}>
        {inProgress ? "Resume game" : "Play now"}
      </Link>
      {restart && inProgress && (
        <button
          type="button"
          onClick={startNew}
          aria-live="polite"
          className={restartClassName}
        >
          {confirming ? "Tap again to end it" : "Start new game"}
        </button>
      )}
    </>
  );
}
