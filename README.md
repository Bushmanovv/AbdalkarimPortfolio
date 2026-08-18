# Abdalkarim Dwikat — Engineering Portfolio

Professional portfolio for **Abdalkarim Dwikat**, Software & AI Engineer, built
as a Linux engineering workstation. The terminal aesthetic is a branding and
interaction layer only — every page is reachable through ordinary navigation and
works without ever typing a command.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Framer Motion

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
npm run typecheck
```

---

## Editing content

All content is data-driven. **Do not edit copy inside components** — change the
data files and every page updates.

| File | Contents |
|------|----------|
| `src/data/profile.ts` | Name, title, contact details, links, résumé path, languages, navigation |
| `src/data/projects.ts` | Every project and case study |
| `src/data/experience.ts` | Work history and timeline |
| `src/data/skills.ts` | Skill tree groups |
| `src/data/education.ts` | Degree, coursework, certifications |

### Things that need your input

These are deliberately left blank rather than filled with invented content:

1. **Certification credential URLs** — `src/data/education.ts` has empty
   `credentialUrl` fields. The "Verify credential" link only appears once a
   real URL is present.
2. **Draft projects** — `spendly` and `delivery-optimizer` are marked
   `draft: true` and are excluded from the site entirely (listings, detail
   pages, sitemap, command palette). Fill in their fields and set
   `draft: false` to publish.
3. **EEG final-report link** — `report` on the EEG project is empty. The
   `neurograsp` repo's `docs/` tree lists `ENCS5300-Final-Report.pdf`, but its
   blob and raw URLs both return 404 in a real browser (possibly a Git LFS
   pointer without LFS storage provisioned). Fix the file on GitHub, then put
   the URL back — the "FULL REPORT" button reappears on its own.
4. **Project media** — no images exist yet. See below.

### The EEG accuracy figure

`src/data/projects.ts` reports **91.3% LOSO accuracy** for the EEG project, as
supplied for this portfolio. The `neurograsp` repository README reports **91.8%
macro-F1** under leave-one-session-out evaluation over 1,246 gated windows.
Those may both be true — accuracy and macro-F1 are different metrics — but
confirm which figure you want as the headline before publishing. It appears in
exactly one place, in that project's `metrics` array.

---

## Adding project media

Case studies currently carry their visual weight through architecture diagrams
and metric panels — no *project* imagery exists yet. (The About page does have
the terminal portrait, `public/karim-terminal.webp`.) Adding media requires no
code changes:

```ts
// src/data/projects.ts
{
  slug: "eeg-prosthetic-hand",
  heroImage: "/projects/eeg/hero.jpg",
  gallery: [
    { src: "/projects/eeg/hand.jpg", alt: "Assembled InMoov prosthetic hand", caption: "..." },
  ],
}
```

Put the files under `public/projects/<slug>/`. The hero renders at 16:9 and
gallery items at 16:10, both through `next/image` with lazy loading. Sections
with no media do not render at all, so partial coverage is fine.

Highest-value additions, in order: EEG hardware photos, the Neural Vision and
TopCar UIs, and the computer-vision demos.

### Source assets

`assets/` holds the originals and is not served. What ships lives in `public/`:

| Original | Shipped as | Notes |
|----------|-----------|-------|
| `assets/Abdalkarim_Dwikat_Resume.pdf` | `public/resume.pdf` | Copy over the same path to update the résumé |
| `assets/KarimTerminal.png` (1024×1536) | `public/karim-terminal.webp` (480×720, 75 KB) | Sized for the 240px slot at 2× and encoded as WebP. A static export has no image optimiser, so the file ships exactly as authored — the full-resolution PNG would have been 1.3 MB on every visit |

---

## Project data model

See `src/types/index.ts`. Every case-study section is optional — the numbered
sections (`01 / OVERVIEW`, `02 / PROBLEM`, …) renumber themselves contiguously
based on which fields a project actually has, so a sparse project still reads
correctly.

Set `featured: true` to promote a project into `featured/`; everything else
lands in `labs/`.

### Filtering

The active filter lives in the URL (`/projects?filter=embedded`), not in
component state, so a chip click, a shared link and the terminal command
`projects --filter embedded` all arrive by the same route. Ids are whitelisted
against `projectFilters` in both places — an unknown value prints a usage line
in the terminal and falls back to `all` in the UI, never an empty page.

Reading the URL opts the explorer out of prerendering, so it sits behind a
`Suspense` boundary whose fallback is the same listing without the filter bar
(`ProjectGrids`). The complete project list is therefore in the static HTML for
crawlers and for anyone whose JavaScript has not landed yet.

---

## The terminal

A persistent VS Code-style panel pinned to the bottom of every page.

### One navigation system

Everything funnels into a single `commit()` in `TerminalProvider` — sidebar
clicks, project cards, typed commands, scroll reactions. Clicking **Projects**
and typing `ls projects` run the identical code path; there is no second
router. Files:

| File | Role |
|------|------|
| `src/components/terminal/TerminalProvider.tsx` | State, typing animation, the single `commit()` |
| `src/components/terminal/TerminalPanel.tsx` | Panel UI, input, resize |
| `src/components/terminal/TerminalLink.tsx` | A link that types its command before routing |
| `src/components/terminal/SectionWatcher.tsx` | Scroll reactions |
| `src/lib/commands.ts` | Frozen command registry |
| `src/lib/paths.ts` | Route ↔ working-directory mapping |

Each nav item's command lives in `navigation` / `externalLinks` in
`src/data/profile.ts`. **Every command string there must resolve in
`commands.ts`**, or a click will print `command not found`.

### Working directory

`cwd` is *derived from the pathname*, never stored — so it stays correct
through back/forward, the command palette, and any link that bypasses the
terminal. Only `/projects` changes directory; the other sections are reached by
commands that don't `cd` in a real shell, so the prompt stays at `~`.

### Timing

Typing is budgeted at 300 ms total (per-character delay scales to fit), plus a
70 ms beat, then navigation. A newer click bumps a generation counter that
invalidates any in-flight animation — nothing queues. The animation is skipped
entirely when the panel body isn't visible or `prefers-reduced-motion` is set,
so navigation never waits on decoration. Scroll reactions only append a line;
they never gate or delay the section.

### Panel modes

`auto` (CSS decides: collapsed on mobile, open on desktop), `open`,
`collapsed`, `closed`. `auto` exists because the server can't know the
viewport — letting CSS own the default avoids both a hydration mismatch and a
flash. Height, scrollback, history and mode all survive route changes because
the provider sits above the route slot in the layout.

### Security

**The terminal is not a shell.** Input is never evaluated and never leaves the
browser. It cannot reach `eval`, `Function`, `exec`, `child_process`, the
filesystem, or the network. Resolution is an exact-match lookup against a frozen
alias map, with a first-token fallback; anything unmatched returns
`command not found`.

`cd` is the only location-dependent command. It stays whitelisted: `cd ..`
resolves against a fixed route table, and `cd <name>` only succeeds when
`<name>` is a known project slug. Arbitrary paths are never interpreted.

Supported: `help`, `whoami`/`about`, `projects`/`ls projects`/`cd ~/projects &&
ls`, `tree projects`, `experience`/`git log --experience`, `skills`/`tree
~/skills`, `education`/`cat education.txt`, `contact --me`, `resume`/`open
resume.pdf`, `open github`, `open linkedin`, `languages`, `pwd`, `date`,
`history`, `clear`, `ls`, `cd ~`, `cd ..`, `cd <slug>`. Two easter eggs are
intentionally undocumented in `help`.

### Line editing

The prompt behaves like readline, because a terminal that only accepts typing
and Enter reads as a text box wearing a terminal costume:

| Key | Behaviour |
|-----|-----------|
| `↑` / `↓`, `Ctrl+P` / `Ctrl+N` | History. The half-typed line is set aside and comes back when you return to the bottom |
| `Tab` | Completes to the longest unambiguous prefix; a unique match gets a trailing space |
| `Tab` `Tab` | Lists the candidates in columns, then redraws the prompt with the line intact |
| `Ctrl+C` | Prints `^C`, abandons the line, adds nothing to history. With a selection it copies instead, as VS Code's terminal does |
| `Ctrl+L` | Clears the screen and keeps the line being typed — no echoed `clear` |
| `Ctrl+D` | Deletes forward; on an empty line it ends the session |
| `Ctrl+A` / `Ctrl+E` | Start / end of line |
| `Ctrl+U` / `Ctrl+K` / `Ctrl+W` | Kill to start / to end / previous word |
| `Enter` (empty) | Draws a fresh prompt, rather than doing nothing |

Output follows the bottom only when the view is already there, so scrolling up
to read something is not undone by the next command. Selecting output text no
longer collapses on mouse-up — clicking to focus the input is suppressed while
a selection exists, so scrollback can be copied.

`⌘K` / `Ctrl+K` opens the command palette.

### ssh neurograsp — the device console

`ssh neurograsp` attaches the shell to the graduation project. The prompt
changes host (`abdalkarim@neurograsp`), the page routes to the case study, and
a second command registry in `src/lib/neurograsp/` takes over every keystroke
until `exit`. Inside it: `run <gesture>`, `pipeline`, `channels`, `gestures`,
`status`.

**`run` is not an animation.** It generates a 6-second, 19-channel signal with
the morphology of the requested artifact, then pushes it through the real
preprocessing chain in `dsp.ts` — RBJ biquads for the 50 Hz notch and the
1–45 Hz band-pass, common-average reference, 2 s windows at 50% overlap,
±500 µV rejection, and the peak-to-peak activity gate against the recording's
90th percentile. Every number printed (gate threshold, per-window p2p, band
powers, which windows opened) is computed from that signal. Windows that fail
the gate are shown failing, and `run rest` correctly actuates nothing.

| File | Role |
|------|------|
| `src/lib/neurograsp/signal.ts` | Synthetic 19-channel source: alpha rhythm, 50 Hz mains, blink and jaw-EMG morphology. Seeded, so a command prints the same numbers twice |
| `src/lib/neurograsp/dsp.ts` | The filter chain, windowing, gate, band-power routing, sparkline rendering |
| `src/lib/neurograsp/console.ts` | The device command table |

**What it does not claim.** The banner reads *synthetic signal · real DSP ·
simulated actuation*. The final stage reports which branch a gated window is
**routed to** on band power alone — it never says "predicted". The trained
DTW-kNN and Riemannian tangent-space models run on the Pi and are not shipped
to the browser, and the console says so at the end of every run. No accuracy
figure appears anywhere in the session.

Navigation controls call `detach()` before running their command, because a
sidebar click means "open that page" and `cd ~` against a prosthetic hand can
only ever answer *command not found*. Streamed output is cancelled by the same
generation counter the typing animation uses, so any new keystroke stops it.

---

## Deployment

Published to GitHub Pages by `.github/workflows/deploy.yml` on every push to
`main`, as a static export — Pages serves files, not a Node server.

**One-time setup:** Settings → Pages → Build and deployment → Source →
**GitHub Actions**. (The workflow's `configure-pages` step sets this itself on
its first successful run; changing it by hand only matters if Pages was already
pointed at a branch, which serves `README.md` as the site.)

### How the sub-path works

A project repository is served from `/AbdalkarimPortfolio`, so that prefix has
to be compiled in. `src/lib/site.ts` reads it from the environment and the
workflow supplies it from the Pages configuration:

| Variable | Set by CI to | Unset means |
|----------|--------------|-------------|
| `NEXT_PUBLIC_BASE_PATH` | `/AbdalkarimPortfolio` | site lives at the root |
| `NEXT_PUBLIC_SITE_URL` | `https://bushmanovv.github.io/AbdalkarimPortfolio` | falls back to `profile.website` |

`next/link` and `next/image` normally apply `basePath` themselves — but
**`images.unoptimized` bypasses the optimiser, and with it the prefixing**, so
image `src` values go through `asset()` explicitly. Same for anything Next never
touches: the resume anchor, metadata icons and the manifest.

### Moving to a custom domain

Add the domain in Settings → Pages, drop `NEXT_PUBLIC_BASE_PATH` from the
workflow, and point `NEXT_PUBLIC_SITE_URL` at the new origin. No source change:
an unset base path is an empty string everywhere it is used.

### Export constraints

`output: "export"` forbids cookies, rewrites, redirects, custom headers and
request-dependent route handlers — none of which this app uses. Two things it
does require:

- `trailingSlash: true`, so routes emit `about/index.html` rather than
  `about.html`. Pages resolves directory URLs predictably; extensionless files
  are far less reliable.
- `export const dynamic = "force-static"` on `robots.ts`, `sitemap.ts`,
  `manifest.ts` and `opengraph-image.tsx`. Without it the build fails outright,
  because Next will not guess whether a route handler is safe to freeze.

`public/.nojekyll` stops Pages' Jekyll pass from discarding `_next/`, whose
leading underscore it would otherwise treat as private.

---

## Design system

Tokens live in `@theme` in `src/app/globals.css`.

The interface stays roughly 85% neutral. Accent colours are semantic, never
decorative:

| Colour | Meaning |
|--------|---------|
| Green | Prompt, success, active state, online |
| Cyan | Links, software / backend |
| Purple | AI / ML |
| Yellow | Embedded / hardware |
| Red | Error |

**Contrast:** every text token clears WCAG AA (4.5:1) against `bg`, `panel` and
`elevated`. `--color-fg-muted` was lightened from the original `#626C77` — which
measured 3.3–3.7:1 and failed — to `#7C8693`.

**Reduced motion:** `prefers-reduced-motion: reduce` disables the boot sequence,
scroll reveals, typing effects and route transitions. Content is always present
in the DOM regardless; no animation ever gates access to information.

---

## Accessibility notes

- Skip-to-content link, semantic landmarks, exactly one `<h1>` per page.
- Terminal prompt chrome (`user@host:~$`) is `aria-hidden` so screen-reader
  users hear commands and output, not repeated shell decoration.
- The terminal input never captures keystrokes globally — it only listens on its
  own field, so typing in the contact form is unaffected. The palette uses a
  modifier chord for the same reason.
- The terminal does not autofocus on touch devices, so the mobile keyboard never
  opens uninvited.
- Both `aria-modal` dialogs — the command palette and the mobile drawer — trap
  Tab inside themselves and return focus to the control that opened them, via
  `src/lib/use-focus-trap.ts`. `aria-modal` is a promise that the rest of the
  page is unavailable; without the trap that promise is false.

---

## Print

The site prints as ink on paper. Two things had to be true for that to work:

- **Scroll reveals must not hide content.** `[data-reveal]` starts at
  `opacity: 0` and waits for an IntersectionObserver that printing never fires,
  so every section below the fold used to print blank. The print sheet pins it
  to its resting state — the third safety net alongside reduced motion and
  `<noscript>`.
- **Fixed chrome must not repeat.** Header, sidebar and terminal panel carry
  `data-chrome`, and the print sheet drops them along with the layout offsets
  that only existed to clear them.

The palette flip is one block of token overrides in `globals.css` rather than
per-component print rules — the interface is already driven by those variables.
`data-print="omit"` removes anything that is meaningless on paper (the portrait,
the filter controls); `data-print="stack"` collapses a screen-only column.
External links print their URL after the text.

---

## Error handling

`src/app/error.tsx` catches render errors per route segment and keeps the
recovery in character (`Segmentation fault (core dumped)`, a `[ RETRY ]` that
calls Next 16's `retry()`, and the error `digest` — the one identifier safe to
show, since it points at the server log without exposing a stack). The layout
chrome survives, so the terminal and navigation still work on a crashed page.

---

## Contact form

`src/components/contact/MailtoComposer.tsx` composes a `mailto:` draft and hands
off to the visitor's own mail client. There is no backend and it never reports a
false success. To switch to a real service, replace the anchor with a form
action — the labelling already says the message opens in an email client, so
update that copy too.
