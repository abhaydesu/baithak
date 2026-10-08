/**
 * Tiny synthesized sound effects: no audio files to download, works offline.
 * Browsers only allow audio after a user gesture, which is always the case
 * here because every sound follows a tap (or a timer the user started).
 */

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOptions {
  type?: OscillatorType;
  volume?: number;
  delay?: number;
}

function tone(
  freq: number,
  duration: number,
  { type = "sine", volume = 0.15, delay = 0 }: ToneOptions = {},
) {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function vibrate(pattern: number | number[]) {
  try {
    // Chrome blocks (and logs) vibration before the first tap on the page.
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    navigator.vibrate?.(pattern);
  } catch {}
}

export const sfx = {
  /** Call on the first tap so later timer-driven sounds are allowed to play. */
  unlock() {
    audio();
  },
  tap() {
    tone(620, 0.05, { type: "triangle", volume: 0.08 });
  },
  tick() {
    tone(1000, 0.05, { type: "square", volume: 0.04 });
  },
  buzzer() {
    tone(196, 0.55, { type: "square", volume: 0.12 });
    tone(147, 0.7, { type: "square", volume: 0.1, delay: 0.12 });
    vibrate([220, 90, 220]);
  },
  /** Bomb explosion: a low rumble and a crack. */
  boom() {
    tone(70, 0.9, { type: "sawtooth", volume: 0.25 });
    tone(110, 0.5, { type: "square", volume: 0.15, delay: 0.02 });
    tone(45, 1.1, { type: "sine", volume: 0.3, delay: 0.05 });
    vibrate([300, 80, 300, 80, 500]);
  },
  /** Answer revealed on the board. */
  ding() {
    tone(880, 0.12, { type: "triangle", volume: 0.14 });
    tone(1320, 0.35, { type: "triangle", volume: 0.14, delay: 0.1 });
  },
  success() {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(f, 0.22, { type: "triangle", volume: 0.12, delay: i * 0.08 }),
    );
    vibrate(60);
  },
  fanfare() {
    [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) =>
      tone(f, 0.3, { type: "triangle", volume: 0.12, delay: i * 0.11 }),
    );
  },
};
