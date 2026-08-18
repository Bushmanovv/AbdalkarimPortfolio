/**
 * DEPLOYMENT TARGET
 * =================
 *
 * GitHub Pages serves a project repository from a sub-path
 * (`bushmanovv.github.io/AbdalkarimPortfolio`), so both the sub-path and the
 * public origin have to be known at build time. Both are environment-driven
 * rather than hard-coded, so the same source deploys unchanged to a custom
 * domain — unset the variables and the site lives at the root again.
 */

/** Sub-path the site is served from. Empty for a root deployment. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Public origin, including any sub-path. Used for canonicals and sitemap. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://abdalkarimdwikat.com"
).replace(/\/$/, "");

/**
 * Prefixes a file in `public/` with the base path.
 *
 * `next/link` and `next/image` apply the base path themselves. Plain anchors,
 * `window.open`, metadata icons and the web manifest do not — those are the
 * ones that silently 404 on a sub-path deployment.
 */
export function asset(path: string): string {
  return `${basePath}${path}`;
}
