/**
 * Type sizes that shrink as the text gets longer. Game screens put these
 * inside fixed-height panels, so a long word or question never makes the
 * panel grow and push the buttons below it around.
 */
export function fitWordClass(text: string) {
  const n = text.length;
  if (n <= 10) return "text-[clamp(2.6rem,13vw,4.25rem)]";
  if (n <= 18) return "text-[clamp(2.1rem,10vw,3.4rem)]";
  if (n <= 30) return "text-[clamp(1.7rem,7.5vw,2.6rem)]";
  if (n <= 50) return "text-[clamp(1.35rem,5.8vw,2rem)]";
  return "text-[clamp(1.1rem,4.6vw,1.5rem)]";
}

/** For whole sentences, like a question or a prompt. */
export function fitPromptClass(text: string) {
  const n = text.length;
  if (n <= 30) return "text-[clamp(1.9rem,8vw,2.8rem)]";
  if (n <= 55) return "text-[clamp(1.6rem,6.5vw,2.3rem)]";
  if (n <= 85) return "text-[clamp(1.35rem,5.5vw,1.9rem)]";
  return "text-[clamp(1.15rem,4.6vw,1.5rem)]";
}
