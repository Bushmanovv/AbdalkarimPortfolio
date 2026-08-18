import type { MetadataRoute } from "next";

import { profile } from "@/data/profile";

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
