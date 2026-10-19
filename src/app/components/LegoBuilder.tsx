"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { sfx } from "@/lib/sfx";

/**
 * A little LEGO set for the home page. Bricks are seen from the front: drag
 * one onto the baseplate and it snaps to the stud grid and drops onto
 * whatever is below it. Drag a placed brick to move it, drag it off the
 * plate to bin it, or tap it to paint it the selected colour.
 */

const COLS = 12;
const ROWS = 9;
/** A real 1×1 brick is 8 mm wide and 9.6 mm tall. */
const HEIGHT_RATIO = 1.2;
const STORAGE_KEY = "baithak-lego";

const COLORS = [
  { id: "red", name: "Red", c: "#ff4b3e" },
  { id: "yellow", name: "Yellow", c: "#ffc21a" },
  { id: "blue", name: "Blue", c: "#2f7bff" },
  { id: "green", name: "Green", c: "#1fbf6a" },
  { id: "orange", name: "Orange", c: "#ff7a1a" },
  { id: "white", name: "White", c: "#f2f1ee" },
  { id: "black", name: "Black", c: "#262626" },
] as const;
type ColorId = (typeof COLORS)[number]["id"];
const colorOf = (id: ColorId) => COLORS.find((c) => c.id === id)!.c;

const SIZES = [1, 2, 3, 4] as const;

interface Brick {
  id: string;
  x: number;
  y: number;
  w: number;
  color: ColorId;
}

let counter = 0;
const newId = () => `b${Date.now().toString(36)}${(counter++).toString(36)}`;

/** A small house with a tree, so the plate never starts empty. */
const STARTER: Omit<Brick, "id">[] = [
  { x: 1, y: 0, w: 3, color: "red" },
  { x: 5, y: 0, w: 4, color: "red" },
  { x: 1, y: 1, w: 3, color: "red" },
  { x: 5, y: 1, w: 4, color: "red" },
  { x: 1, y: 2, w: 4, color: "white" },
  { x: 5, y: 2, w: 4, color: "white" },
  { x: 2, y: 3, w: 3, color: "blue" },
  { x: 5, y: 3, w: 3, color: "blue" },
  { x: 3, y: 4, w: 4, color: "blue" },
  { x: 4, y: 5, w: 2, color: "blue" },
  { x: 10, y: 0, w: 1, color: "orange" },
  { x: 10, y: 1, w: 1, color: "orange" },
  { x: 9, y: 2, w: 3, color: "green" },
  { x: 9, y: 3, w: 3, color: "green" },
  { x: 10, y: 4, w: 1, color: "green" },
];

const starter = () => STARTER.map((b) => ({ ...b, id: newId() }));

/** Top of the stack over columns x..x+w-1, ignoring one brick. */
function landingY(bricks: Brick[], x: number, w: number, ignore?: string) {
  let top = 0;
  for (const b of bricks) {
    if (b.id === ignore) continue;
    if (b.x < x + w && x < b.x + b.w) top = Math.max(top, b.y + 1);
  }
  return top;
}

/** Drops every brick as far as it will go, bottom row first. */
function settle(bricks: Brick[]) {
  const placed: Brick[] = [];
  for (const b of [...bricks].sort((a, c) => a.y - c.y)) {
    placed.push({ ...b, y: landingY(placed, b.x, b.w) });
  }
  return placed.filter((b) => b.y < ROWS);
}

function randomBuild() {
  let bricks: Brick[] = [];
  for (let i = 0; i < 22; i++) {
    const w = SIZES[Math.floor(Math.random() * SIZES.length)];
    const x = Math.floor(Math.random() * (COLS - w + 1));
    const y = landingY(bricks, x, w);
    if (y >= ROWS - 2) continue;
    const color = COLORS[Math.floor(Math.random() * 5)].id;
    bricks = [...bricks, { id: newId(), x, y, w, color }];
  }
  return bricks;
}

function load(): Brick[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return starter();
    const parsed = JSON.parse(raw) as Brick[];
    return Array.isArray(parsed) ? settle(parsed) : starter();
  } catch {
    return starter();
  }
}

interface Drag {
  source: "tray" | "brick";
  id?: string;
  w: number;
  color: ColorId;
  /** Where the pointer grabbed the brick, in px from its top-left. */
  grabX: number;
  grabY: number;
  startX: number;
  startY: number;
  clientX: number;
  clientY: number;
  moved: boolean;
  /** Snapped landing spot while over the plate; null when off it. */
  spot: Spot | null;
}

interface Spot {
  x: number;
  y: number;
  full?: boolean;
}

export default function LegoBuilder({ className = "" }: { className?: string }) {
  const [bricks, setBricks] = useState<Brick[]>(() => starter());
  const [history, setHistory] = useState<Brick[][]>([]);
  const [color, setColor] = useState<ColorId>("red");
  const [drag, setDrag] = useState<Drag | null>(null);
  const [unit, setUnit] = useState(36);
  const [announce, setAnnounce] = useState("");
  const plateRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  const H = unit * HEIGHT_RATIO;
  const STUD = unit * 0.2;
  const BASE = unit * 0.32;

  // Restore the last build after mount (keeps server and client HTML equal).
  useEffect(() => {
    const saved = load();
    // One-off restore from localStorage; can't happen during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBricks(saved);
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bricks));
    } catch {}
  }, [bricks]);

  // Size bricks to the plate's width.
  useEffect(() => {
    const el = plateRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setUnit(entry.contentRect.width / COLS),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const commit = useCallback(
    (next: Brick[], message: string) => {
      setHistory((h) => [...h.slice(-29), bricks]);
      setBricks(next);
      setAnnounce(message);
    },
    [bricks],
  );

  /** Snapped column and landing row for the current drag, if over the plate. */
  function target(d: Omit<Drag, "spot">): Spot | null {
    const rect = plateRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const inside =
      d.clientX > rect.left - unit &&
      d.clientX < rect.right + unit &&
      d.clientY > rect.top - H * 1.5 &&
      d.clientY < rect.bottom + H * 0.5;
    if (!inside) return null;
    const left = d.clientX - d.grabX - rect.left;
    const x = Math.min(COLS - d.w, Math.max(0, Math.round(left / unit)));
    const y = landingY(bricks, x, d.w, d.id);
    return y < ROWS ? { x, y } : { x, y, full: true };
  }

  function startDrag(
    e: React.PointerEvent,
    d: Omit<Drag, "startX" | "startY" | "clientX" | "clientY" | "moved" | "spot">,
  ) {
    if (e.button !== 0) return;
    sfx.unlock();
    e.preventDefault();
    setDrag({
      ...d,
      startX: e.clientX,
      startY: e.clientY,
      clientX: e.clientX,
      clientY: e.clientY,
      moved: false,
      spot: null,
    });
  }

  function addAtCentre(w: number) {
    const x = Math.floor((COLS - w) / 2);
    const y = landingY(bricks, x, w);
    if (y >= ROWS) {
      setAnnounce("That stack is as tall as it goes.");
      return;
    }
    sfx.tap();
    commit(
      [...bricks, { id: newId(), x, y, w, color }],
      `Added a ${COLORS.find((c) => c.id === color)!.name.toLowerCase()} ${w}-stud brick.`,
    );
  }

  function finishDrag() {
    const d = drag;
    setDrag(null);
    if (!d) return;

    // A tap, not a drag.
    if (!d.moved) {
      if (d.source === "tray") addAtCentre(d.w);
      else if (d.id) {
        const b = bricks.find((x) => x.id === d.id);
        if (b && b.color !== color) {
          sfx.tap();
          commit(
            bricks.map((x) => (x.id === d.id ? { ...x, color } : x)),
            "Painted the brick.",
          );
        }
      }
      return;
    }

    const t = d.spot;
    if (!t || t.full) {
      if (d.source === "brick" && d.id && !t) {
        commit(settle(bricks.filter((b) => b.id !== d.id)), "Removed a brick.");
      }
      return;
    }
    sfx.tap();
    const rest = bricks.filter((b) => b.id !== d.id);
    const placed = { id: d.id ?? newId(), x: t.x, y: t.y, w: d.w, color: d.color };
    commit(
      d.source === "brick" ? settle([...rest, placed]) : [...rest, placed],
      d.source === "brick" ? "Moved a brick." : "Placed a brick.",
    );
  }

  // Follow the pointer anywhere on the page while dragging.
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) =>
      setDrag((d) => {
        if (!d) return d;
        const next = {
          ...d,
          clientX: e.clientX,
          clientY: e.clientY,
          moved:
            d.moved ||
            Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 5,
        };
        return { ...next, spot: next.moved ? target(next) : null };
      });
    const up = () => finishDrag();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  });

  const t = drag?.moved ? drag.spot : null;

  return (
    <section
      aria-label="LEGO brick builder"
      className={`lego-builder rounded-[1.75rem] border border-line bg-paper p-3 sm:p-4 ${className}`}
    >
      {/* Colours */}
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <div role="radiogroup" aria-label="Brick colour" className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={color === c.id}
              aria-label={c.name}
              onClick={() => setColor(c.id)}
              className="lego-swatch"
              style={{ "--c": c.c } as React.CSSProperties}
            />
          ))}
        </div>
        <p className="hidden text-sm text-ink-soft sm:block">
          Drag to build · tap a brick to paint
        </p>
      </div>

      {/* Plate */}
      <div
        ref={plateRef}
        className="relative w-full select-none overflow-visible rounded-2xl bg-surface"
        style={{ height: ROWS * H + BASE + STUD + 8 }}
      >
        {bricks.map((b) => {
          const dragging = drag?.moved && drag.id === b.id;
          return (
            <div
              key={b.id}
              className="lego-brick"
              aria-hidden="true"
              onPointerDown={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                startDrag(e, {
                  source: "brick",
                  id: b.id,
                  w: b.w,
                  color: b.color,
                  grabX: e.clientX - r.left,
                  grabY: e.clientY - r.top,
                });
              }}
              style={
                {
                  "--c": colorOf(b.color),
                  left: b.x * unit,
                  bottom: BASE + b.y * H,
                  width: b.w * unit,
                  height: H,
                  zIndex: b.y + 2,
                  opacity: dragging ? 0 : 1,
                } as React.CSSProperties
              }
            >
              <Studs w={b.w} unit={unit} />
            </div>
          );
        })}

        {/* Where the dragged brick will land */}
        {drag && t && (
          <div
            className={`lego-brick lego-ghost ${t.full ? "lego-full" : ""}`}
            aria-hidden="true"
            style={
              {
                "--c": colorOf(drag.color),
                left: t.x * unit,
                bottom: BASE + Math.min(t.y, ROWS - 1) * H,
                width: drag.w * unit,
                height: H,
                zIndex: 50,
              } as React.CSSProperties
            }
          >
            <Studs w={drag.w} unit={unit} />
          </div>
        )}

        {/* Baseplate */}
        <div
          className="lego-baseplate absolute inset-x-0 bottom-0 rounded-b-2xl"
          style={{ height: BASE }}
          aria-hidden="true"
        >
          <Studs w={COLS} unit={unit} />
        </div>
      </div>

      {/* Brick tray + actions */}
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 px-1">
        <div className="flex items-end gap-2" aria-label="Bricks to add">
          {SIZES.map((w) => (
            <button
              key={w}
              type="button"
              aria-label={`Add a ${w}-stud brick`}
              className="lego-tray-item"
              onPointerDown={(e) =>
                startDrag(e, {
                  source: "tray",
                  w,
                  color,
                  grabX: (w * unit) / 2,
                  grabY: H / 2,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  addAtCentre(w);
                }
              }}
            >
              <span
                className="lego-brick relative block"
                style={
                  {
                    "--c": colorOf(color),
                    width: w * 18,
                    height: 21,
                  } as React.CSSProperties
                }
              >
                <Studs w={w} unit={18} />
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <ToolButton
            onClick={() => {
              const prev = history.at(-1);
              if (!prev) return;
              setHistory((h) => h.slice(0, -1));
              setBricks(prev);
              setAnnounce("Undone.");
            }}
            disabled={history.length === 0}
          >
            Undo
          </ToolButton>
          <ToolButton
            onClick={() => commit([], "Cleared the plate.")}
            disabled={bricks.length === 0}
          >
            Clear
          </ToolButton>
          <ToolButton onClick={() => commit(randomBuild(), "Built something random.")}>
            Surprise build
          </ToolButton>
        </div>
      </div>

      {/* The brick in your hand, when it's off the plate */}
      {drag?.moved && !t && (
        <div
          className="lego-brick lego-floating"
          aria-hidden="true"
          style={
            {
              "--c": colorOf(drag.color),
              position: "fixed",
              left: drag.clientX - drag.grabX,
              top: drag.clientY - drag.grabY,
              width: drag.w * unit,
              height: H,
              zIndex: 100,
            } as React.CSSProperties
          }
        >
          <Studs w={drag.w} unit={unit} />
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  );
}

function Studs({ w, unit }: { w: number; unit: number }) {
  return (
    <>
      {Array.from({ length: w }, (_, i) => (
        <span
          key={i}
          className="lego-stud"
          style={{
            left: i * unit + unit * 0.2,
            width: unit * 0.6,
            height: unit * 0.2,
            top: -unit * 0.2 + 1,
          }}
        />
      ))}
    </>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-deep disabled:opacity-40"
    >
      {children}
    </button>
  );
}
