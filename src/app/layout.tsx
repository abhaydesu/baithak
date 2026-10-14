import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Kalam, Poppins } from "next/font/google";

import { SITE } from "@/lib/site";
import Analytics from "./components/Analytics";
import Footer from "./components/Footer";
import NavDock from "./components/NavDock";
import "./globals.css";

const gued = localFont({
  src: [
    { path: "../../public/gued/Gued.otf",         weight: "400", style: "normal" },
    { path: "../../public/gued/Gued - Bold.otf",  weight: "700", style: "normal" },
  ],
  variable: "--font-gued",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
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
  themeColor: "#faf8f4",
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
    <html lang={SITE.language} className={`${gued.variable} ${poppins.variable} ${kalam.variable}`}>
      <body>
        <Analytics />
        <NavDock />
        {children}
        <Footer />
      </body>
    </html>
  );
}
