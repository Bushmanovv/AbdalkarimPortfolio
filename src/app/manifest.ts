import type { MetadataRoute } from "next";

import { profile } from "@/data/profile";
import { asset } from "@/lib/site";

/**
 * Emitted as a static file: a static export has no server to run this on
 * per request, so Next requires the intent to be declared.
 */
export const dynamic = "force-static";

/**
 * Web app manifest.
 *
 * Completes the metadata set the layout already provides (Open Graph, Twitter,
 * JSON-LD, robots, sitemap): a name and icon for an installed shortcut, and a
 * theme colour that matches the surface behind it so the browser chrome does
 * not flash white against this palette.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} — ${profile.primaryTitle}`,
    short_name: profile.name.split(" ")[0],
    description: profile.positioning,
    start_url: asset("/"),
    display: "standalone",
    // Both match `--color-bg` / the layout's `themeColor`.
    background_color: "#080b0f",
    theme_color: "#080b0f",
    categories: ["portfolio", "engineering", "technology"],
    icons: [
      {
        src: asset("/icon.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
