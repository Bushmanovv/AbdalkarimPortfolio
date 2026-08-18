import type { NextConfig } from "next";

import { basePath } from "./src/lib/site";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Static HTML export — GitHub Pages serves files, not a Node server. Every
   * route in this app already prerenders, and none of the features export
   * forbids (cookies, rewrites, redirects, headers, request-dependent route
   * handlers) are used.
   */
  output: "export",

  /** Sub-path when deployed to a GitHub project page. See `src/lib/site.ts`. */
  basePath,

  /**
   * Emits `about/index.html` instead of `about.html`. Pages resolves directory
   * URLs reliably; extensionless files are far less predictable.
   */
  trailingSlash: true,

  images: {
    /**
     * A static export has no image optimiser, so assets ship exactly as
     * authored. That is why the portrait is a pre-sized 480×720 WebP (75 KB)
     * rather than the full-resolution PNG it was.
     */
    unoptimized: true,
  },
};

export default nextConfig;
