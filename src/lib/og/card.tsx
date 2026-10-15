import { ImageResponse } from "next/og";

import { MARK_DATA_URL } from "./mark";

/** Share cards are 1200×630, the size WhatsApp, X and LinkedIn expect. */
export const OG_SIZE = { width: 1200, height: 630 };


const TONES: Record<string, string> = {
  red: "#ffb4a8",
  orange: "#ffc58f",
  yellow: "#ffe078",
  green: "#a8e7b7",
  blue: "#a5d5ff",
  purple: "#c9b8ff",
  pink: "#ffb3d4",
  white: "#ffd23f",
};

/**
 * Baloo 2 Bold, to match the site's headings. Fetched from Google Fonts
 * when the card renders (usually once, at build time); if that fails the card
 * falls back to the default font rather than breaking.
 */
async function loadDisplayFont() {
  try {
    const css = await (
      await fetch(
        "https://fonts.googleapis.com/css2?family=Baloo+2:wght@700",
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
      {/* next/og renders plain <img>; next/image doesn't apply here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MARK_DATA_URL} width={56} height={63} alt="" />
      <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
        baithak
      </div>
    </div>
  );
}

/**
 * A share card: logo, a big title with a marker swipe behind its last line,
 * and one line underneath. Used by every opengraph-image route.
 */
export async function shareCard({
  eyebrow,
  lines,
  subtitle,
  tone = "white",
}: {
  eyebrow?: string;
  /** Title lines; the last gets the marker. */
  lines: string[];
  subtitle: string;
  tone?: string;
}) {
  const marker = TONES[tone] ?? TONES.white;
  const display = await loadDisplayFont();
  const font = display ? "Baloo" : undefined;
  const longest = Math.max(...lines.map((l) => l.length));
  const fontSize = longest > 16 ? 84 : 112;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#ffffff",
          color: "#141414",
          fontFamily: font,
        }}
      >
        <Logo />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#55526a",
                marginBottom: 20,
              }}
            >
              {eyebrow}
            </div>
          )}
          {lines.map((line, i) => (
            <div key={line} style={{ display: "flex", marginTop: i ? 8 : 0 }}>
              <div
                style={{
                  fontSize,
                  fontWeight: 700,
                  letterSpacing: -3,
                  lineHeight: 1.05,
                  padding: "0 6px",
                  // Satori rejects "none", so only the marked line gets one.
                  ...(i === lines.length - 1 && {
                    backgroundImage: `linear-gradient(transparent 58%, ${marker} 58%, ${marker} 88%, transparent 88%)`,
                  }),
                }}
              >
                {line}
              </div>
            </div>
          ))}
          <div
            style={{
              fontSize: 34,
              color: "#55526a",
              marginTop: 36,
              fontFamily: "sans-serif",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: display
        ? [{ name: "Baloo", data: display, weight: 700, style: "normal" }]
        : undefined,
    },
  );
}
