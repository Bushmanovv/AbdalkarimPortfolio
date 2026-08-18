import type { MetadataRoute } from "next";

import { profile } from "@/data/profile";

/**
 * Emitted as a static file: a static export has no server to run this on
 * per request, so Next requires the intent to be declared.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = profile.website.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
