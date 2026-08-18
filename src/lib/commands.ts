/**
 * TERMINAL COMMAND REGISTRY
 * =========================
 *
 * SECURITY — read before extending.
 *
 * This terminal is a UI metaphor. It is NOT a shell. User input is never
 * evaluated, never sent to a server, and never reaches `eval`, `Function`,
 * `exec`, `child_process`, a filesystem API or any network call.
 *
 * The only thing input can do is look up a key in the frozen `registry`
 * object below and return a pre-authored result. Anything not matching a
 * registered key produces a "command not found" message. Adding a command
 * means adding a static entry here — never a dynamic dispatch.
 */

import { certifications, education } from "@/data/education";
import { experience } from "@/data/experience";
import { languages, navigation, profile } from "@/data/profile";
import {
  featuredProjects,
  labProjects,
  projectFilters,
  publishedProjects,
} from "@/data/projects";
import { skillGroups } from "@/data/skills";
import {
  motd,
  NEUROGRASP_HOST,
  runNeurograspCommand,
} from "@/lib/neurograsp/console";
import { absoluteCwd, parentRoute } from "@/lib/paths";

export type LineTone =
  | "default"
  | "muted"
  | "green"
  | "cyan"
  | "purple"
  | "yellow"
  | "error";

export interface OutputLine {
  text: string;
  tone?: LineTone;
  /** Renders the line as an in-app link that routes on click. */
  href?: string;
  /** Renders the line as an external link. */
  external?: string;
}

export interface CommandResult {
  lines: OutputLine[];
  /** Client-side route to push after printing. */
  navigateTo?: string;
  /** External URL to open in a new tab. */
  openUrl?: string;
  /** Wipes the scrollback. */
  clear?: boolean;
  /**
   * Output that arrives over time rather than all at once — each frame is
   * appended after the one before it. Used by the device console, where the
   * point is watching the pipeline work through a signal.
   */
  frames?: OutputLine[][];
  /** Host to attach the shell to, e.g. after `ssh neurograsp`. */
  enterSession?: string;
  /** Returns the shell to the portfolio host. */
  exitSession?: boolean;
}

interface CommandSpec {
  /** Shown by `help`. Omit to keep a command hidden (easter eggs). */
  description?: string;
  /** Exact input strings that resolve to this command. */
  aliases: string[];
  run: (ctx: CommandContext) => CommandResult;
}

export interface CommandContext {
  /** Previously entered command strings, oldest first. */
  history: string[];
  /** Current shell working directory, e.g. `~/projects/eeg-prosthetic-hand`. */
  cwd: string;
  /** Host the shell is attached to, or null for the portfolio itself. */
  session?: string | null;
}

const line = (text: string, tone: LineTone = "default"): OutputLine => ({
  text,
  tone,
});

const blank = (): OutputLine => ({ text: "" });

/** Pads a label with dots so `[OK]` markers align in a column. */
function dotted(label: string, value: string, width = 30): string {
  const dots = ".".repeat(Math.max(2, width - label.length));
  return `${label}${dots} ${value}`;
}

// ─────────────────────────────────────────────────────────────── registry ──

const registry: Record<string, CommandSpec> = {
  help: {
    description: "List available commands",
    aliases: ["help", "?", "man"],
    run: () => ({
      lines: [
        line("AVAILABLE COMMANDS", "green"),
        blank(),
        line(dotted("  whoami", "About — background and focus", 26), "muted"),
        line(dotted("  projects", "All projects", 26), "muted"),
        line(
          dotted("  projects --filter ai", "Filter by domain", 26),
          "muted",
        ),
        line(dotted("  tree projects", "Project directory tree", 26), "muted"),
        line(dotted("  experience", "Work history", 26), "muted"),
        line(dotted("  skills", "Engineering stack", 26), "muted"),
        line(dotted("  education", "Degree and certifications", 26), "muted"),
        line(dotted("  contact", "Get in touch", 26), "muted"),
        line(dotted("  resume", "Open résumé PDF", 26), "muted"),
        line(dotted("  github", "Open GitHub profile", 26), "muted"),
        line(dotted("  linkedin", "Open LinkedIn profile", 26), "muted"),
        blank(),
        line(dotted("  pwd", "Print working directory", 26), "muted"),
        line(dotted("  date", "Current date and time", 26), "muted"),
        line(dotted("  history", "Command history", 26), "muted"),
        line(dotted("  clear", "Clear the terminal", 26), "muted"),
        blank(),
        line("Aliases work too — try 'ls projects' or 'cat experience.log'.", "muted"),
        blank(),
        line("LIVE", "green"),
        line(
          dotted("  ssh neurograsp", "Attach to the prosthetic hand", 26),
          "cyan",
        ),
        blank(),
        line("KEYS", "green"),
        line("  ↑ / ↓         history          Tab Tab   list candidates", "muted"),
        line("  Ctrl+C        cancel line      Ctrl+L    clear screen", "muted"),
        line("  Ctrl+A / E    line start/end   Ctrl+U    kill to start", "muted"),
        line("  Ctrl+W        kill word        Esc       close panel", "muted"),
      ],
    }),
  },

  whoami: {
    description: "About",
    // The last three are the prompts printed on the About page — a command
    // shown on screen should resolve when a visitor types it.
    aliases: [
      "whoami",
      "about",
      "cat about.txt",
      "id",
      "cat engineering-profile.txt",
      "cat profile.json",
      "display karim.png",
    ],
    run: () => ({
      lines: [
        line(profile.name, "green"),
        line(profile.primaryTitle),
        blank(),
        line(`${profile.degree} — ${profile.university}`, "muted"),
        line(profile.location, "muted"),
        blank(),
        line(profile.positioning),
      ],
      navigateTo: "/about",
    }),
  },

  projects: {
    description: "List projects",
    aliases: [
      "projects",
      "ls projects",
      "ls -la projects",
      "cd projects",
      "cd ~/projects",
      "cd ~/projects && ls",
      "ls projects/",
      "open projects",
    ],
    // Output stays deliberately minimal — the page itself is the real listing.
    run: () => ({
      lines: [
        line("featured/", "cyan"),
        line("labs/", "cyan"),
        blank(),
        line(`${publishedProjects.length} projects found.`, "muted"),
      ],
      navigateTo: "/projects",
    }),
  },

  tree: {
    description: "Project directory tree",
    aliases: ["tree", "tree projects", "tree -L 2", "tree projects -L 2"],
    run: () => {
      const featuredLines = featuredProjects.map((p, i) => {
        const last = i === featuredProjects.length - 1;
        return line(`│   ${last ? "└──" : "├──"} ${p.slug}/`, "cyan");
      });
      const labLines = labProjects.map((p, i) => {
        const last = i === labProjects.length - 1;
        return line(`    ${last ? "└──" : "├──"} ${p.slug}/`, "cyan");
      });

      return {
        lines: [
          line("projects/"),
          line("│"),
          line("├── featured/", "green"),
          ...featuredLines,
          line("│"),
          line("└── labs/", "green"),
          ...labLines,
          blank(),
          line(
            `${featuredProjects.length + labProjects.length} directories`,
            "muted",
          ),
        ],
      };
    },
  },

  experience: {
    description: "Work history",
    aliases: [
      "experience",
      "git log --experience",
      "cat experience.log",
      "less experience.log",
      "work",
      "cat experience",
    ],
    run: () => ({
      lines: [
        ...experience.map((item) =>
          line(`${item.period.padEnd(20)} ${item.role} — ${item.company}`, "muted"),
        ),
        blank(),
        line(`${experience.length} entries.`, "muted"),
      ],
      navigateTo: "/experience",
    }),
  },

  skills: {
    description: "Engineering stack",
    aliases: [
      "skills",
      "tree ~/skills",
      "tree skills",
      "ls skills",
      "ls -la skills/",
      "ls skills/",
      "stack",
    ],
    run: () => ({
      lines: [
        line("skills/", "cyan"),
        ...skillGroups.map((group, i) =>
          line(
            `${i === skillGroups.length - 1 ? "└──" : "├──"} ${group.dir}/`,
            "muted",
          ),
        ),
        blank(),
        line(
          `${skillGroups.length} directories, ${skillGroups.reduce((n, g) => n + g.items.length, 0)} entries.`,
          "muted",
        ),
      ],
      navigateTo: "/skills",
    }),
  },

  education: {
    description: "Degree and certifications",
    aliases: ["education", "cat education.txt", "edu", "degree"],
    run: () => ({
      lines: [
        line(education.institution.toUpperCase(), "green"),
        line(education.degree),
        line(`${education.year} — ${education.location}`, "muted"),
        blank(),
        line("CERTIFICATIONS", "green"),
        ...certifications.map((c) => line(`  ${c.issuer} — ${c.title}`, "muted")),
      ],
      navigateTo: "/education",
    }),
  },

  contact: {
    description: "Get in touch",
    aliases: ["contact", "contact --me", "hire", "email", "reach"],
    run: () => ({
      lines: [
        line("EMAIL", "muted"),
        { text: `  ${profile.email}`, tone: "cyan", external: `mailto:${profile.email}` },
        blank(),
        line("GITHUB", "muted"),
        { text: `  ${profile.githubHandle}`, tone: "cyan", external: profile.github },
        blank(),
        line("LINKEDIN", "muted"),
        { text: `  ${profile.linkedinHandle}`, tone: "cyan", external: profile.linkedin },
        blank(),
        line("LOCATION", "muted"),
        line(`  ${profile.location}`),
        blank(),
        line(`● ${profile.status}`, "green"),
      ],
      navigateTo: "/contact",
    }),
  },

  resume: {
    description: "Open résumé",
    aliases: [
      "resume",
      "open resume.pdf",
      "cat resume.pdf",
      "cv",
      "open resume",
      "less resume.pdf",
    ],
    run: () => ({
      lines: [
        line("Opening resume.pdf in a new tab ...", "muted"),
        {
          text: profile.resumeUrl,
          tone: "cyan",
          external: profile.resumeUrl,
        },
      ],
      openUrl: profile.resumeUrl,
    }),
  },

  github: {
    description: "Open GitHub",
    aliases: ["github", "open github", "gh", "git"],
    run: () => ({
      lines: [
        line(`Opening ${profile.githubHandle} ...`, "muted"),
        { text: profile.github, tone: "cyan", external: profile.github },
      ],
      openUrl: profile.github,
    }),
  },

  linkedin: {
    description: "Open LinkedIn",
    aliases: ["linkedin", "open linkedin", "li"],
    run: () => ({
      lines: [
        line(`Opening ${profile.linkedinHandle} ...`, "muted"),
        { text: profile.linkedin, tone: "cyan", external: profile.linkedin },
      ],
      openUrl: profile.linkedin,
    }),
  },

  /**
   * Attaches the shell to the graduation project's device console. The session
   * itself lives in `lib/neurograsp/` — from here it is one more whitelisted
   * command that happens to change which registry the next input reaches.
   */
  ssh: {
    description: "Connect to the NeuroGrasp device",
    aliases: [
      "ssh neurograsp",
      "ssh pi@neurograsp",
      "ssh neurograsp.local",
      "ssh hand",
      "neurograsp",
    ],
    run: () => ({
      lines: [
        line(`Connecting to ${NEUROGRASP_HOST} (10.42.0.1:22) ...`, "muted"),
        line("Authenticated (publickey).", "muted"),
        blank(),
        ...motd(),
      ],
      enterSession: NEUROGRASP_HOST,
      navigateTo: "/projects/eeg-prosthetic-hand",
    }),
  },

  "ssh-usage": {
    aliases: ["ssh"],
    run: () => ({
      lines: [
        line("usage: ssh [user@]host", "muted"),
        blank(),
        line("Known hosts:", "muted"),
        line(`  ${NEUROGRASP_HOST}   Raspberry Pi 5 · brain–computer interface`, "cyan"),
      ],
    }),
  },

  languages: {
    description: "Spoken languages",
    aliases: ["languages", "lang", "cat languages.txt"],
    run: () => ({
      lines: languages.map((l) => line(dotted(`  ${l.language}`, l.level, 18))),
    }),
  },

  home: {
    description: "Go home",
    aliases: ["home", "cd ~", "cd", "cd /", "cd ~/"],
    run: () => ({ lines: [], navigateTo: "/" }),
  },

  pwd: {
    description: "Print working directory",
    aliases: ["pwd"],
    run: (ctx) => ({ lines: [line(absoluteCwd(ctx.cwd))] }),
  },

  date: {
    description: "Current date and time",
    aliases: ["date", "now"],
    run: () => ({
      lines: [
        line(
          new Date().toLocaleString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
        ),
      ],
    }),
  },

  history: {
    description: "Command history",
    aliases: ["history"],
    run: (ctx) => ({
      lines: ctx.history.length
        ? ctx.history.map((cmd, i) =>
            line(`${String(i + 1).padStart(4, " ")}  ${cmd}`, "muted"),
          )
        : [line("No commands yet.", "muted")],
    }),
  },

  clear: {
    description: "Clear the terminal",
    aliases: ["clear", "cls"],
    run: () => ({ lines: [], clear: true }),
  },

  ls: {
    description: "List the current directory",
    aliases: ["ls", "ls -la", "ls -l", "dir"],
    run: () => ({
      lines: [
        ...navigation
          .filter((n) => n.href !== "/")
          .map((n) => ({
            text: `  ${n.label}/`,
            tone: "cyan" as LineTone,
            href: n.href,
          })),
        { text: "  resume.pdf", tone: "muted" as LineTone },
      ],
    }),
  },

  // ───────────────────────────────────────────────────── easter eggs ──
  // Undocumented on purpose — `help` does not list these.
  "sudo-hire": {
    aliases: [
      "sudo hire abdalkarim",
      "sudo hire",
      "hire abdalkarim",
      "sudo hire karim",
    ],
    run: () => ({
      lines: [
        line("[sudo] password for recruiter: ********", "muted"),
        blank(),
        line("Running candidate evaluation...", "muted"),
        blank(),
        line(dotted("Computer Engineering", "[PASS]"), "green"),
        line(dotted("Software Engineering", "[PASS]"), "green"),
        line(dotted("Artificial Intelligence", "[PASS]"), "green"),
        line(dotted("Embedded Systems", "[PASS]"), "green"),
        line(dotted("Digital Verification", "[PASS]"), "green"),
        line(dotted("Problem Solving", "[PASS]"), "green"),
        blank(),
        line("Candidate status:"),
        blank(),
        line(dotted("READY TO BUILD.", "[OK]"), "green"),
        blank(),
        line("Next command:", "muted"),
        line("  contact --me", "cyan"),
      ],
    }),
  },

  coffee: {
    aliases: ["coffee", "make coffee", "brew"],
    run: () => ({
      lines: [
        line("coffee: dependency not found.", "error"),
        blank(),
        line("Try:", "muted"),
        line("  sudo apt install coffee", "cyan"),
      ],
    }),
  },

  sudo: {
    aliases: ["sudo", "su", "sudo su"],
    run: () => ({
      lines: [
        line(`${profile.username} is not in the sudoers file.`, "error"),
        line("This incident has been reported.", "muted"),
      ],
    }),
  },

  exit: {
    aliases: ["exit", "quit", "logout", ":q"],
    run: () => ({
      lines: [line("Nice try. There is no escape from the portfolio.", "muted")],
    }),
  },
};

// ────────────────────────────────────────────────────────────── resolver ──

/** Frozen alias → command-key lookup, built once at module load. */
const aliasMap: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [key, spec] of Object.entries(registry)) {
    for (const alias of spec.aliases) {
      map.set(alias, key);
    }
  }
  return map;
})();

/** Every alias, used for Tab completion. */
export const allAliases: readonly string[] = Object.freeze(
  [...aliasMap.keys()].sort(),
);

/** Aliases surfaced by `help`, i.e. excluding easter eggs. */
export const documentedAliases: readonly string[] = Object.freeze(
  Object.entries(registry)
    .filter(([, spec]) => Boolean(spec.description))
    .map(([, spec]) => spec.aliases[0])
    .sort(),
);

function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Slugs that `cd` is permitted to enter. A fixed set, not free-form input. */
const projectSlugs: ReadonlySet<string> = new Set(
  publishedProjects.map((p) => p.slug),
);

/**
 * Handles the two `cd` forms whose target depends on where you currently are.
 *
 * These are still whitelisted: `cd ..` resolves against a fixed route table,
 * and `cd <name>` only succeeds when `<name>` is a known project slug. Nothing
 * here interprets arbitrary paths.
 */
function resolveDynamicCd(
  normalized: string,
  ctx: CommandContext,
): CommandResult | null {
  if (normalized === "cd .." || normalized === "cd ../") {
    const target = parentRoute(ctx.cwd);
    if (!target) {
      return { lines: [{ text: "Already at ~", tone: "muted" }] };
    }
    return { lines: [], navigateTo: target };
  }

  const enter = normalized.match(/^cd (?:~\/projects\/|\.\/|projects\/)?([a-z0-9-]+)\/?$/);
  if (enter) {
    const slug = enter[1];
    if (projectSlugs.has(slug)) {
      return { lines: [], navigateTo: `/projects/${slug}` };
    }
    return {
      lines: [
        { text: `cd: ${slug}: No such file or directory`, tone: "error" },
        { text: "Try 'ls projects'.", tone: "muted" },
      ],
    };
  }

  return null;
}

/** Filter ids the projects page understands. A fixed list, like every other
 *  argument this shell accepts. */
const filterIds: ReadonlySet<string> = new Set(projectFilters.map((f) => f.id));

/**
 * `projects --filter <id>` — the one command that carries an argument through
 * to the interface, landing on the same `?filter=` the filter bar writes.
 *
 * The id is checked against the list the filter bar itself renders from, so an
 * unknown value prints a usage line instead of reaching the URL.
 */
function resolveProjectFilter(normalized: string): CommandResult | null {
  const match = normalized.match(
    /^(?:projects|ls projects|ls -la projects)\s+--filter[= ]([a-z0-9-]+)$/,
  );
  if (!match) return null;

  const id = match[1];
  if (!filterIds.has(id)) {
    return {
      lines: [
        { text: `projects: unknown filter '${id}'`, tone: "error" },
        {
          text: `Available: ${[...filterIds].join(", ")}`,
          tone: "muted",
        },
      ],
    };
  }

  const matched =
    id === "all"
      ? publishedProjects
      : publishedProjects.filter((p) =>
          (p.category as readonly string[]).includes(id),
        );

  return {
    lines: [
      ...matched.map((p) => ({ text: `${p.slug}/`, tone: "cyan" as LineTone })),
      blank(),
      line(
        `${matched.length} ${matched.length === 1 ? "project" : "projects"} matching '${id}'.`,
        "muted",
      ),
    ],
    navigateTo: id === "all" ? "/projects" : `/projects?filter=${id}`,
  };
}

/**
 * Resolves raw input to a pre-authored result.
 *
 * Resolution is exact-match-only against the frozen alias map, falling back to
 * the first token. There is no dynamic evaluation of any kind.
 */
export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const normalized = normalize(input);

  if (!normalized) return { lines: [] };

  // Attached to a device: its console owns every keystroke until `exit`, the
  // way a real remote session does.
  if (ctx.session === NEUROGRASP_HOST) {
    const result = runNeurograspCommand(input);
    return {
      lines: result.lines,
      frames: result.frames,
      exitSession: result.exit,
    };
  }


  // 1. Full-string alias, e.g. "cat experience.log".
  let key = aliasMap.get(normalized);

  // 2. Commands that carry an argument, checked before the first-token
  //    fallback so `cd <slug>` isn't swallowed by the bare `cd` → home alias
  //    and `projects --filter x` isn't flattened to a bare `projects`.
  if (!key) {
    const dynamic = resolveDynamicCd(normalized, ctx);
    if (dynamic) return dynamic;

    const filtered = resolveProjectFilter(normalized);
    if (filtered) return filtered;
  }

  // 3. First-token alias, e.g. "projects --filter ai" → "projects".
  if (!key) {
    const head = normalized.split(" ")[0];
    key = aliasMap.get(head);
  }

  if (!key) {
    const attempted = normalized.split(" ")[0];
    return {
      lines: [
        { text: `bash: ${attempted}: command not found`, tone: "error" },
        { text: "Try 'help'.", tone: "muted" },
      ],
    };
  }

  return registry[key].run(ctx);
}

export interface CompletionResult {
  /**
   * What the line should become when Tab can fill something in: the sole match
   * (with the trailing space bash adds), or the longest common prefix when it
   * is longer than what is typed. Null when Tab cannot extend the line — that
   * is exactly when a second Tab lists `matches`.
   */
  completed: string | null;
  /** Every alias that starts with what is typed. */
  matches: readonly string[];
}

/**
 * Like `normalize`, but keeps a trailing space: after `cat ` the next word is
 * being completed, so `cat` must not count as already-typed text — otherwise
 * Tab would "complete" the line to what it already is, forever.
 */
function normalizePartial(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").replace(/^ /, "");
}

/** Bash-style Tab completion: complete what is unambiguous, list the rest. */
export function completeCommand(input: string): CompletionResult {
  const typed = normalizePartial(input);
  if (!typed) return { completed: null, matches: [] };

  const matches = allAliases.filter((alias) => alias.startsWith(typed));
  if (matches.length === 0) return { completed: null, matches };
  if (matches.length === 1) return { completed: `${matches[0]} `, matches };

  // Every match starts with `typed`, so the prefix can never shrink past it.
  let prefix = matches[0];
  for (const match of matches.slice(1)) {
    while (!match.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return { completed: prefix.length > typed.length ? prefix : null, matches };
}

/** Lays candidates out in aligned columns, the way bash lists completions. */
export function columnize(items: readonly string[], width = 72): string[] {
  if (items.length === 0) return [];
  const cell = Math.max(...items.map((item) => item.length)) + 2;
  const perRow = Math.max(1, Math.floor(width / cell));

  const rows: string[] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(
      items
        .slice(i, i + perRow)
        .map((item) => item.padEnd(cell))
        .join("")
        .trimEnd(),
    );
  }
  return rows;
}
