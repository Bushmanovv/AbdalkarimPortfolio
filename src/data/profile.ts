import type { LanguageProficiency, NavItem } from "@/types";

/**
 * Single source of truth for identity, contact details and links.
 * Nothing in this object should be duplicated inside components.
 */
export const profile = {
  name: "Abdalkarim Dwikat",
  username: "abdalkarim",
  host: "portfolio",

  primaryTitle: "Software & AI Engineer",
  degree: "B.Sc. Computer Engineering",
  university: "Birzeit University",

  location: "Ramallah, Palestine",

  email: "karimdwikat22@gmail.com",

  github: "https://github.com/Bushmanovv",
  githubHandle: "github.com/Bushmanovv",

  linkedin: "https://linkedin.com/in/abdalkarim-dwikat",
  linkedinHandle: "linkedin.com/in/abdalkarim-dwikat",

  website: "https://abdalkarimdwikat.com",

  status: "Open to opportunities",

  /** Drop a replacement PDF at `public/resume.pdf` to update the résumé. */
  resumeUrl: "/resume.pdf",

  /** Domains shown under the primary title. */
  domains: ["Computer Engineering", "AI", "Software", "Embedded Systems"],

  heroStatement:
    "Building intelligent software and engineering systems — from AI-powered applications to real-time embedded ML.",

  positioning:
    "Computer Engineering graduate building software at the intersection of AI and systems — from real-time ML pipelines on embedded Linux to full-stack web applications.",
} as const;

/** `user@host` string used by every prompt on the site. */
export const promptUser = `${profile.username}@${profile.host}`;

/**
 * Each nav item carries the command the terminal types when it is activated.
 * Every one of these strings must resolve in `src/lib/commands.ts`, so that a
 * click and a typed command run the exact same code path.
 */
export const navigation: NavItem[] = [
  { label: "home", href: "/", command: "cd ~" },
  { label: "about", href: "/about", command: "whoami" },
  { label: "projects", href: "/projects", command: "cd ~/projects && ls" },
  { label: "experience", href: "/experience", command: "git log --experience" },
  { label: "skills", href: "/skills", command: "tree ~/skills" },
  { label: "education", href: "/education", command: "cat education.txt" },
  { label: "contact", href: "/contact", command: "contact --me" },
];

/** External sidebar links, which also echo a command before opening. */
export const externalLinks = [
  { label: "resume.pdf", href: profile.resumeUrl, command: "open resume.pdf" },
  { label: "github", href: profile.github, command: "open github" },
  { label: "linkedin", href: profile.linkedin, command: "open linkedin" },
];

export const languages: LanguageProficiency[] = [
  { language: "Arabic", level: "Native" },
  { language: "Russian", level: "Bilingual" },
  { language: "English", level: "C1" },
  { language: "German", level: "C1" },
  { language: "Ukrainian", level: "A2" },
  { language: "Hebrew", level: "A1" },
];

export const professionalSkills = [
  "Leadership",
  "Problem Solving",
  "Critical Thinking",
  "Teamwork",
  "Communication",
  "Adaptability",
  "Working Under Pressure",
];

/** The layer-crossing story told on the About page. */
export const engineeringLayers = [
  { label: "AI / ML", accent: "purple" as const },
  { label: "Software", accent: "cyan" as const },
  { label: "Linux / Systems", accent: "green" as const },
  { label: "Embedded", accent: "yellow" as const },
  { label: "Hardware", accent: "yellow" as const },
];

export const engineeringPhilosophy =
  "I enjoy engineering problems that cross traditional boundaries — where software needs to understand hardware, AI needs to operate under real-world constraints, or automation needs to integrate with existing systems.";
