import type { MetadataRoute } from "next";

import { navigation, profile } from "@/data/profile";
import { publishedProjects } from "@/data/projects";

/**
 * Emitted as a static file: a static export has no server to run this on
 * per request, so Next requires the intent to be declared.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = profile.website.replace(/\/$/, "");

  const pages: MetadataRoute.Sitemap = navigation.map((item) => ({
    url: `${base}${item.href === "/" ? "" : item.href}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const projectPages: MetadataRoute.Sitemap = publishedProjects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: p.featured ? 0.9 : 0.6,
  }));

  return [...pages, ...projectPages];
}
