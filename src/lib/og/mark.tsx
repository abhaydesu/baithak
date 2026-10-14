/**
 * The logo mark: the laddoo b. A lowercase b with a violet stem and a rani
 * round part, the laddoo, with boondi specks and the cast's dot-eyed face. It
 * sits beside the word "baithak" in the header, footer and share cards, and
 * stands alone as the favicon and home-screen icon. One SVG source for all.
 */
export const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 48"><rect x="4" y="1.5" width="11.5" height="45" rx="5.75" fill="#7c5cff"/><circle cx="9.5" cy="12" r="1.3" fill="#5a3fd6"/><circle cx="24.5" cy="31.5" r="15" fill="#e2457e"/><circle cx="31" cy="21.5" r="1.3" fill="#b8336a"/><circle cx="35.5" cy="34" r="1.3" fill="#b8336a"/><circle cx="15.5" cy="40" r="1.3" fill="#b8336a"/><circle cx="21" cy="30" r="1.9" fill="#1c1917"/><circle cx="29" cy="30" r="1.9" fill="#1c1917"/><path d="M23 34.3q2 1.9 4 0" fill="none" stroke="#1c1917" stroke-width="1.4" stroke-linecap="round"/></svg>`;

export const MARK_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;
