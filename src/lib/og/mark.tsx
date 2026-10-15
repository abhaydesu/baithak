/**
 * The logo mark: the laddoo b. A lowercase b with a violet stem and a rani
 * round part, the laddoo, with boondi specks and the cast's dot-eyed face,
 * drawn in the site's outline language: an ink outline and a hard shadow, like
 * the Press button. It
 * sits beside the word "baithak" in the header, footer and share cards, and
 * stands alone as the favicon and home-screen icon. One SVG source for all.
 */
export const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 56"><g fill="#1c1917"><rect x="4" y="5" width="13" height="48" rx="6.5"/><circle cx="28" cy="36" r="17.5"/></g><rect x="4" y="2" width="13" height="48" rx="6.5" fill="#7c5cff" stroke="#1c1917" stroke-width="2.4"/><path d="M8.5 9v26" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/><circle cx="28" cy="33" r="17.5" fill="#e2457e" stroke="#1c1917" stroke-width="2.4"/><g fill="#b8336a"><circle cx="36.5" cy="21" r="1.4"/><circle cx="41" cy="33" r="1.4"/><circle cx="38" cy="43" r="1.4"/><circle cx="19" cy="44" r="1.4"/><circle cx="26" cy="46" r="1.4"/></g><path d="M18.5 25.5q3-5 8.5-5.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/><circle cx="23" cy="33" r="2.4" fill="#1c1917"/><circle cx="33.5" cy="33" r="2.4" fill="#1c1917"/><circle cx="23.8" cy="32.2" r=".8" fill="#fff"/><circle cx="34.3" cy="32.2" r=".8" fill="#fff"/><ellipse cx="19.5" cy="38" rx="2.4" ry="1.5" fill="#ff9bbb"/><ellipse cx="37" cy="38" rx="2.4" ry="1.5" fill="#ff9bbb"/><path d="M25 38q3.3 3.2 6.6 0" fill="none" stroke="#1c1917" stroke-width="2" stroke-linecap="round"/></svg>`;

export const MARK_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;
