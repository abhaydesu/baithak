import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Kalam, Poppins } from "next/font/google";

import { SITE } from "@/lib/site";
import Analytics from "./components/Analytics";
import Footer from "./components/Footer";
import NavDock from "./components/NavDock";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}: party games for friends and family, on one phone`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "party games",
    "game night",
    "games to play with friends",
    "family games",
    "imposter game",
    "dumb charades",
    "dumb charades movie names",
    "pictionary words",
    "family feud game",
    "desi party games",
    "Bollywood games",
    "games for Indian families",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: "/",
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1814" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables go on <html> so the theme tokens on :root can see them.
    <html lang={SITE.language} suppressHydrationWarning className={`${bricolage.variable} ${poppins.variable} ${kalam.variable}`}>
      <head>
        {/* Apply a saved theme before first paint, so dark mode never flashes light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("baithak-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Analytics />
        <NavDock />
        {children}
        <Footer />
      </body>
    </html>
  );
}
