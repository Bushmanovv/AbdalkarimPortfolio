import { profile } from "@/data/profile";

/**
 * Maps a route to the shell working directory shown in the prompt.
 *
 * Only `/projects` actually changes directory. The other sections are reached
 * with commands that don't `cd` in a real shell — `whoami`, `cat education.txt`,
 * `git log` — so the prompt correctly stays at `~` for those.
 */
export function cwdForPath(pathname: string): string {
  const project = pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (project) return `~/projects/${project[1]}`;
  if (pathname === "/projects" || pathname === "/projects/") return "~/projects";
  return "~";
}

/** Absolute form of a `~`-relative cwd, used by `pwd`. */
export function absoluteCwd(cwd: string): string {
  return cwd.replace(/^~/, `/home/${profile.username}`);
}

/** Where `cd ..` goes from a given cwd. Returns null at `~`. */
export function parentRoute(cwd: string): string | null {
  if (cwd.startsWith("~/projects/")) return "/projects";
  if (cwd === "~/projects") return "/";
  return null;
}
