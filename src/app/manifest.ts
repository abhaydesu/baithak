import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name}: party games on one phone`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f9f7f3",
    theme_color: "#f9f7f3",
    lang: SITE.language,
    categories: ["games", "entertainment"],
    icons: [
      { src: "/icon", type: "image/png", sizes: "64x64" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
