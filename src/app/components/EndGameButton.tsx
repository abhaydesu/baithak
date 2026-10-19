"use client";

import { useState } from "react";

/**
 * The "End game" control every game shows above the stage. The first tap asks
 * to confirm in a full-width row below, so put it in a `flex-wrap` row.
 */
export default function EndGameButton({ onEnd }: { onEnd: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming((c) => !c)}
        aria-expanded={confirming}
        className="keycap tone-white h-9 px-3 text-xs text-danger"
      >
        End game
      </button>
      {confirming && (
        <div
          role="alertdialog"
          aria-label="End the game?"
          className="inset-well flex w-full basis-full flex-wrap items-center justify-between gap-3 px-3 py-2.5"
        >
          <p className="text-sm font-semibold">
            End the game now? Scores so far are final.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="btn btn-sm tone-white"
            >
              Keep playing
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                onEnd();
              }}
              className="btn btn-sm tone-red"
            >
              End game
            </button>
          </div>
        </div>
      )}
    </>
  );
}
