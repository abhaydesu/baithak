/**
 * The logo mark: a tall pill with a slot, and five coloured dots, from the
 * Baithak logo system (public/Baithak logo system.pdf). It sits beside the
 * word "baithak" in the header, footer and share cards, and stands alone as
 * the favicon and home-screen icon. One SVG source for all.
 */
export const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 278 297"><rect width="74" height="297" rx="37" fill="var(--logo-pill,#2a2019)"/><rect x="19" y="31" width="37" height="12" rx="6" fill="var(--logo-slot,#f9f7f3)"/><circle cx="127" cy="116" r="27" fill="var(--logo-blue,#4f5bd9)"/><circle cx="207" cy="116" r="27" fill="#e86a96"/><circle cx="247" cy="186" r="27" fill="#f5a623"/><circle cx="127" cy="256" r="27" fill="var(--logo-green,#1f8a6e)"/><circle cx="207" cy="256" r="27" fill="#e4572e"/></svg>`;

export const MARK_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;
