/**
 * Shared domain types for the portfolio.
 *
 * All page content is data-driven: pages render from `src/data/*`, never from
 * hard-coded copy inside components.
 */

export type Domain =
  | "ai"
  | "software"
  | "computer-vision"
  | "embedded"
  | "verification"
  | "academic";

/** Accent role used to colour a tag or node. Kept semantic, not decorative. */
export type Accent = "green" | "cyan" | "purple" | "yellow" | "neutral";

export interface Metric {
  value: string;
  label: string;
}

/** A single stage in a rendered architecture flow diagram. */
export interface ArchitectureNode {
  label: string;
  /** Optional short clarifier shown under the node label. */
  detail?: string;
  accent?: Accent;
  /** Nodes that hang off this stage rather than continuing the main chain. */
  branches?: string[];
}

export interface ProjectSection {
  /** Section heading, e.g. "PROBLEM". Numbering is applied at render time. */
  title: string;
  /** Prose paragraphs. */
  body?: string[];
  /** Bulleted engineering points. */
  points?: string[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface Project {
  slug: string;
  title: string;
  shortTitle?: string;

  featured: boolean;

  /**
   * Hidden from the rendered site. Used for projects that are real but for
   * which no verified content exists yet — flip to `false` once the entry has
   * been filled in. This keeps unverified copy off the live site.
   */
  draft?: boolean;

  category: Domain[];
  /** Human-readable category line, e.g. "AI + SIGNAL PROCESSING + EMBEDDED". */
  categoryLabel: string;

  year?: string;
  role?: string;

  /** One-line engineering summary. Shown on cards and as the page subtitle. */
  description: string;

  technologies: string[];

  metrics?: Metric[];

  overview?: string[];
  problem?: string[];
  solution?: string[];

  architecture?: {
    caption?: string;
    nodes: ArchitectureNode[];
  };

  /** Free-form extra case-study sections rendered after architecture. */
  sections?: ProjectSection[];

  features?: string[];
  challenges?: string[];
  results?: string[];

  heroImage?: string;
  gallery?: GalleryItem[];

  github?: string;
  demo?: string;
  report?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  location: string;
  /** Display string, e.g. "Oct 2025 – Feb 2026". */
  period: string;
  /** Sort key + timeline rail label. */
  startYear: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  technologies: string[];
}

export interface SkillGroup {
  /** Directory name in the skills filesystem tree. */
  dir: string;
  label: string;
  accent: Accent;
  items: string[];
}

export interface Certification {
  issuer: string;
  title: string;
  /** Left empty until a real credential URL exists. Never fabricate. */
  credentialUrl?: string;
  year?: string;
}

export interface LanguageProficiency {
  language: string;
  level: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
  location: string;
  coursework: string[];
}

export interface NavItem {
  label: string;
  href: string;
  /** Terminal command echoed when the link is activated. */
  command: string;
}
