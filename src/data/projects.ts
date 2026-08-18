import type { Project } from "@/types";

/**
 * PROJECT DATA
 * ============
 *
 * Sourcing rules used when writing this file:
 *
 *  - Repository-backed entries were written against the actual repository
 *    contents (README, file tree, GitHub description). No description here is
 *    inferred from a repository name alone.
 *  - `github` is only set when the repository is public and resolves. Three
 *    repositories referenced during the brief — Progineer_Email_Alert, Spendly
 *    and Delivery-Optimizer — are NOT public under github.com/Bushmanovv, so
 *    those entries carry no GitHub link rather than a dead one.
 *  - Entries marked `draft: true` are real projects for which no verified
 *    content was available. They are filtered out of every page. Fill in the
 *    fields and flip the flag to publish — nothing is invented on their behalf.
 */

export const projects: Project[] = [
  // ───────────────────────────────────────────────────────────── FEATURED ──
  {
    slug: "eeg-prosthetic-hand",
    title: "EEG-Based Artifact Recognition & Prosthetic Hand Control",
    shortTitle: "EEG → Prosthetic Hand",
    featured: true,
    category: ["ai", "embedded", "academic"],
    categoryLabel: "AI · SIGNAL PROCESSING · EMBEDDED",
    year: "Sep 2025 – Jul 2026",
    role: "Graduation project — end-to-end system design",
    description:
      "Real-time EEG artifact classification driving a 3D-printed robotic prosthetic hand, from headset to actuation.",
    technologies: [
      "Python",
      "DTW",
      "Signal Processing",
      "scikit-learn",
      "NumPy",
      "Raspberry Pi 5",
      "ESP32",
      "Embedded Linux",
      "C++",
      "TCP",
      "UART",
      "EDF",
    ],
    metrics: [
      // NOTE: the repository README reports 91.8% macro-F1 under
      // leave-one-session-out evaluation over 1,246 gated windows. The 91.3%
      // accuracy figure below is the one supplied for this portfolio. Both can
      // hold at once (accuracy vs. macro-F1) — reconcile before publishing.
      { value: "91.3%", label: "LOSO Accuracy" },
      { value: "19", label: "EEG Channels" },
      { value: "200 Hz", label: "Sampling Rate" },
      { value: "REAL-TIME", label: "Inference" },
    ],
    overview: [
      "NeuroGrasp is a complete brain–computer interface: a clinical 19-channel EEG headset drives a 3D-printed InMoov prosthetic hand in real time, with every layer of the stack built from scratch.",
      "Rather than attempting motor-imagery decoding — which is unreliable at consumer electrode counts — the system deliberately classifies high-signal-to-noise EEG artifacts: eye blinks and jaw muscle activity. These are voluntary, repeatable and physically accessible to users with limb difference, which makes them a dependable control channel.",
    ],
    problem: [
      "Motor-imagery BCIs generalise poorly across sessions: electrode placement shifts, impedance changes and day-to-day neural variability all degrade a model trained on yesterday's cap placement.",
      "A prosthetic control scheme has to survive that drift. It must also run on hardware a person can actually wear — not a workstation — and respond fast enough to feel like intent rather than lag.",
    ],
    solution: [
      "The system recognises five deliberate facial gestures and maps each to a hand action: single blink opens the hand, double blink pinches, a two-sided jaw clench closes the fist, and left/right jaw grinding rotates the wrist.",
      "Classification is hierarchical. A first stage separates blink events from jaw muscle activity using 93 extracted features. Blinks then go to a Dynamic Time Warping k-NN over raw waveform shape, while jaw classes are separated using Riemannian covariance geometry projected into tangent space.",
      "Gesture-to-action mappings live in a JSON file on the ESP32 and are editable from a phone over the board's own WiFi access point — no reflashing to retune the control scheme.",
    ],
    architecture: {
      caption:
        "Signal path from scalp to servo. Each hop is a separate process on separate hardware.",
      nodes: [
        { label: "EEG HEADSET", detail: "19 channels @ 200 Hz", accent: "purple" },
        { label: "PREPROCESSING", detail: "notch · band-pass · CAR", accent: "purple" },
        { label: "FEATURE EXTRACTION", detail: "93 features · activity gating", accent: "purple" },
        { label: "CLASSIFICATION", detail: "DTW-kNN + Riemannian tangent space", accent: "purple" },
        { label: "RASPBERRY PI 5", detail: "inference host · Embedded Linux", accent: "green" },
        { label: "TCP → UART", detail: "115200 baud", accent: "cyan" },
        { label: "ESP32-WROOM", detail: "servo controller · WiFi AP", accent: "yellow" },
        { label: "PROSTHETIC HAND", detail: "InMoov · 6× MG996R servos", accent: "yellow" },
      ],
    },
    sections: [
      {
        title: "SIGNAL PIPELINE",
        body: [
          "Preprocessing is fixed and deterministic so that training and live inference see identical inputs.",
        ],
        points: [
          "Drop the first 40 s of each recording to discard settling artifacts",
          "50 Hz notch filter for mains interference, then a 1–45 Hz band-pass",
          "Common-average reference across all 19 channels",
          "2-second windows at 50% overlap; reject any window exceeding 500 µV",
          "Per-recording z-score normalisation — discards absolute amplitude so the model learns gesture shape, not electrode gain",
          "Activity gating on peak-to-peak amplitude relative to each recording's 90th percentile, which lifted F1 by 3.1 points on its own",
        ],
      },
      {
        title: "CLASSIFICATION",
        body: [
          "A single flat classifier performed poorly because blinks and jaw activity have fundamentally different signal structure. Splitting the problem let each stage use the representation that actually suits it.",
        ],
        points: [
          "Stage 1 — 93 engineered features separate blink events from jaw muscle activity",
          "Stage 2a — Dynamic Time Warping k-NN over raw blink waveforms distinguishes single from double blinks (F1 0.83–0.84)",
          "Stage 2b — Riemannian covariance geometry in tangent space separates the three jaw classes (F1 0.95–0.99)",
          "Evaluation is leave-one-session-out, so no test window shares a recording session with training data",
        ],
      },
      {
        title: "EMBEDDED DEPLOYMENT",
        body: [
          "The classifier runs on a Raspberry Pi 5 under Embedded Linux. Deployment is a single install script that provisions the virtual environment, configures the UART peripheral and registers a systemd boot service, so the unit comes up ready after a power cycle with no keyboard attached.",
        ],
        points: [
          "Laptop → Pi transport streams 5-second EDF snippets over TCP",
          "Pi → ESP32 over UART at 115200 baud",
          "ESP32 firmware written in C++ under PlatformIO",
          "Offline web dashboard served from the ESP32's LittleFS partition",
        ],
      },
      {
        title: "PROSTHETIC CONTROL",
        points: [
          "InMoov hand geometry — 24 print-ready parts, self-printed and assembled",
          "Six MG996R servos: five digits plus wrist rotation",
          "A command only fires after three consecutive predictions above 0.60 confidence, which suppresses involuntary blinks",
          "Gesture mappings stored in `mappings.json` and editable over the ESP32's WiFi access point",
        ],
      },
    ],
    challenges: [
      "Session-to-session drift was the dominant failure mode. Per-recording z-scoring and leave-one-session-out evaluation were both adopted specifically to stop the model memorising a single cap placement.",
      "Involuntary blinks would otherwise fire commands constantly. The three-consecutive-prediction confidence gate trades a little latency for a control scheme that does not misfire while the user is simply looking around.",
      "Synthetic data augmentation was tried and measurably hurt performance — roughly 1.1 points — so it was cut rather than kept for appearances.",
      "Training data comes from a single subject across three sessions. This is the honest limit of the current result and the first thing further work should address.",
    ],
    results: [
      "Leave-one-session-out evaluation over 1,246 gated windows",
      "Classification latency around 0.75 s",
      "End-to-end stimulus-to-movement latency around 5.6 s",
      "Full system runs untethered on the Pi + ESP32 pair after boot",
    ],
    github: "https://github.com/Bushmanovv/neurograsp",
    // The repo's docs/ tree lists `ENCS5300-Final-Report.pdf`, but the blob and
    // raw URLs both return 404 in a real browser — possibly an LFS pointer
    // without LFS storage. Left empty so no broken link ships; restore the URL
    // here once the file resolves and the "FULL REPORT" button returns.
    report: "",
  },

  {
    slug: "ai-clinic-secretary",
    title: "AI Clinic Secretary — Arabic Medical Assistant",
    shortTitle: "AI Clinic Secretary",
    featured: true,
    category: ["ai", "software"],
    categoryLabel: "GENERATIVE AI · BACKEND · RAG",
    year: "Aug – Nov 2025",
    role: "Backend & AI engineering",
    description:
      "Arabic-language clinic assistant using retrieval-augmented generation over clinic policies and operational information.",
    technologies: [
      "Python",
      "FastAPI",
      "LangChain",
      "OpenAI API",
      "PostgreSQL",
      "Docker",
      "RAG",
      "Vector Search",
    ],
    overview: [
      "A conversational assistant that handles the front-desk workload of a clinic in Arabic: answering questions about policies, services and operating information, and scheduling appointments against the clinic's own database.",
      "The retrieval layer grounds every answer in the clinic's actual documentation rather than the model's general knowledge, which is what makes the output safe to put in front of patients.",
    ],
    problem: [
      "Clinic reception time is dominated by repetitive questions — opening hours, what a service costs, whether a doctor is in, how to prepare for a procedure — all of which are already documented somewhere.",
      "A general-purpose model answering those questions unaided will confidently invent clinic policy. For a medical setting that is unacceptable, and the constraint drove the whole architecture.",
    ],
    solution: [
      "Clinic policies and operational documents are embedded into a vector store. At query time the assistant retrieves the relevant passages and conditions its answer on them, so responses trace back to real source material.",
      "Appointment handling is deliberately not left to the language model. Scheduling operations run against PostgreSQL through explicit backend endpoints — the model decides intent, the database remains the authority on state.",
      "Services are containerised with Docker so the API, database and retrieval layer come up as one reproducible stack.",
    ],
    architecture: {
      caption:
        "Retrieval grounds the conversation; the database, not the model, owns appointment state.",
      nodes: [
        { label: "PATIENT", detail: "Arabic conversation", accent: "neutral" },
        { label: "FastAPI BACKEND", detail: "request orchestration", accent: "cyan" },
        {
          label: "LLM + RAG",
          detail: "LangChain · OpenAI API",
          accent: "purple",
          branches: ["VECTOR KNOWLEDGE BASE — clinic policies & services"],
        },
        { label: "CLINIC SYSTEM", detail: "scheduling logic", accent: "cyan" },
        { label: "PostgreSQL", detail: "appointments · records", accent: "green" },
      ],
    },
    features: [
      "Arabic conversational interface",
      "Retrieval-augmented generation over clinic documentation",
      "Clinic information and policy retrieval",
      "Appointment scheduling backed by PostgreSQL",
      "FastAPI service layer",
      "Containerised multi-service deployment",
    ],
    challenges: [
      "Arabic retrieval quality is sensitive to how documents are chunked — dialectal phrasing in a patient question often shares few exact tokens with the formal Arabic of a policy document.",
      "Keeping the model out of the write path. Letting an LLM issue database mutations directly is a correctness and safety problem, so intent detection and state change were separated.",
    ],
    // No public repository exists for this project. Add the URL here when one does.
    github: "",
    demo: "",
  },

  {
    slug: "ai-code-review-assistant",
    title: "AI Code Review Assistant",
    shortTitle: "AI Code Review",
    featured: true,
    category: ["ai", "software"],
    categoryLabel: "LLM · SOFTWARE ENGINEERING",
    role: "Design & implementation",
    description:
      "Developer tool pairing deterministic static analysis with LLM reasoning to produce actionable code review.",
    technologies: [
      "Python",
      "LLMs",
      "Static Analysis",
      "Prompt Engineering",
      "REST APIs",
    ],
    overview: [
      "A tool that reviews source code for bugs, quality problems and maintainability issues, and returns findings with severity and concrete recommendations rather than generic advice.",
      "The central engineering idea is that neither static analysis nor an LLM is sufficient alone. Static analysis is precise but cannot reason about intent; an LLM reasons about intent but hallucinates issues that do not exist. Running them in sequence lets each cover the other's failure mode.",
    ],
    problem: [
      "Linters produce high-volume, low-context output — hundreds of findings with no sense of which ones matter.",
      "An LLM handed a raw file, meanwhile, will happily report bugs in code it misread. Without grounding, review output cannot be trusted enough to act on.",
    ],
    solution: [
      "Static analysis runs first and produces a deterministic set of factual observations about the code — structure, symbols, and detectable defect patterns.",
      "A context extraction step then assembles only the relevant surrounding code for each observation, so the model reasons over a focused window instead of an entire repository.",
      "The LLM stage interprets those grounded observations, discards noise, and produces a prioritised review with severity levels and specific recommendations.",
    ],
    architecture: {
      caption:
        "Deterministic analysis constrains what the model is allowed to reason about.",
      nodes: [
        { label: "SOURCE CODE", accent: "neutral" },
        { label: "STATIC ANALYSIS", detail: "deterministic findings", accent: "cyan" },
        { label: "CONTEXT EXTRACTION", detail: "focused code windows", accent: "cyan" },
        { label: "LLM REASONING", detail: "interpret · rank · explain", accent: "purple" },
        { label: "ACTIONABLE REVIEW", detail: "severity · recommendations", accent: "green" },
      ],
    },
    features: [
      "Source code ingestion and parsing",
      "Deterministic static analysis pass",
      "Issue categorisation by type",
      "Severity ranking",
      "Contextual, code-specific feedback",
      "Concrete remediation recommendations",
      "REST API surface",
    ],
    challenges: [
      "Suppressing false positives without suppressing real findings — the ranking step matters more than raw detection volume.",
      "Context window budgeting: sending too little surrounding code produces misreadings, sending too much dilutes the model's attention and costs more per review.",
    ],
    // No public repository exists for this project. Add the URL here when one does.
    github: "",
  },

  // ───────────────────────────────────────────────────────────────── LABS ──
  {
    slug: "dv-project",
    title: "SystemVerilog / UVM Verification Environment",
    shortTitle: "DV Project",
    featured: false,
    category: ["verification", "academic"],
    categoryLabel: "DIGITAL VERIFICATION",
    year: "2026",
    role: "Verification engineer — 4-person team",
    description:
      "Class-based verification environment with a structured testplan, coverage collection and Synopsys VCS regression flow.",
    technologies: [
      "SystemVerilog",
      "UVM",
      "Synopsys VCS",
      "Functional Coverage",
      "Code Coverage",
      "Assertions",
    ],
    overview: [
      "A full verification project built as a four-person team, organised the way a real DV environment is: design and verification code separated, a written testplan, scripted regressions, and merged coverage reporting.",
      "The repository is structured around `design/`, `verif/`, `testplan/`, `scripts/`, `coverage/merged_report` and `logs/`, with VCS filelists driving both the smoke test and the full run.",
    ],
    features: [
      "Separated design and verification hierarchies",
      "Written testplan tracked in the repository",
      "Synopsys VCS filelists for smoke and full regression",
      "Merged coverage reporting",
      "Scripted regression automation",
      "Logged simulation runs",
    ],
    github: "https://github.com/Bushmanovv/DV_Project",
  },

  {
    slug: "micromouse",
    title: "MicroMouse Maze Solver",
    featured: false,
    category: ["software", "embedded", "academic"],
    categoryLabel: "ALGORITHMS · ROBOTICS",
    year: "2026",
    description:
      "Browser-based MicroMouse maze-solving project built with Vite, with algorithm implementations kept alongside the visualiser.",
    technologies: ["JavaScript", "Vite", "C++", "HTML", "CSS"],
    overview: [
      "A Vite application for the classic MicroMouse problem — an autonomous mouse mapping and solving an unknown maze. The repository pairs the browser front end with a `Codes/` directory holding the algorithm implementations.",
    ],
    github: "https://github.com/Bushmanovv/MicroMouse",
    demo: "https://micro-mouse-one.vercel.app",
  },

  {
    slug: "neural-vision",
    title: "Neural Vision — Classifier Comparison Platform",
    shortTitle: "Neural Vision",
    featured: false,
    category: ["ai", "computer-vision", "software"],
    categoryLabel: "MACHINE LEARNING · COMPUTER VISION",
    year: "2025",
    description:
      "Flask image-classification platform comparing Naive Bayes, Decision Tree and MLP classifiers on a custom dataset.",
    technologies: [
      "Python",
      "Flask",
      "Scikit-learn",
      "Naive Bayes",
      "Decision Tree",
      "MLP",
    ],
    overview: [
      "A web platform that trains and compares three classical classifiers — Naive Bayes, Decision Tree and a multilayer perceptron — on a custom dataset of cats, dogs and birds.",
      "Rather than shipping a single model, the interface exposes the comparison itself: real-time predictions alongside the performance metrics of each classifier on the same input.",
    ],
    features: [
      "Custom three-class image dataset",
      "Three classifiers trained and compared side by side",
      "Real-time prediction from the web interface",
      "Per-classifier performance metrics",
      "Animated web UI",
    ],
    github: "https://github.com/Bushmanovv/Neural-Vision",
  },

  {
    slug: "topcar",
    title: "TopCar — Vehicle Management System",
    shortTitle: "TopCar",
    featured: false,
    category: ["software"],
    categoryLabel: "FULL-STACK · DATABASES",
    year: "2025",
    description:
      "Streamlit and MySQL vehicle management system covering listings, clients, bookings and sales records.",
    technologies: ["Python", "Streamlit", "MySQL", "SQL"],
    overview: [
      "A web-based vehicle management system built on Streamlit with a MySQL backend. It handles car listings with model, year, price and availability, alongside client management, booking tracking and sales records.",
    ],
    features: [
      "Vehicle listings with model, year, price and availability",
      "Client management and sales records",
      "Booking tracking",
      "Search and filtering",
      "Optional admin authentication",
    ],
    github: "https://github.com/Bushmanovv/TopCar",
  },

  {
    slug: "rescue-robot-ga",
    title: "Rescue Robot — Genetic Algorithm Path Planning",
    shortTitle: "Rescue Robot GA",
    featured: false,
    category: ["embedded", "ai", "academic"],
    categoryLabel: "REAL-TIME SYSTEMS · OPTIMISATION",
    year: "2025",
    description:
      "Real-time systems project in C applying a genetic algorithm to rescue robot planning, with a config-driven Makefile build.",
    technologies: ["C", "Genetic Algorithms", "Real-Time Systems", "Make"],
    overview: [
      "A real-time systems course project written in C, structured with separate `src/` and `config/` trees and built through a Makefile. The planning approach is genetic-algorithm based, with behaviour driven by external configuration rather than recompilation.",
    ],
    github: "https://github.com/Bushmanovv/rescue-robot-ga",
  },

  {
    slug: "hand-battle-ai",
    title: "HandBattleAI — Gesture-Controlled Rock Paper Scissors",
    shortTitle: "HandBattleAI",
    featured: false,
    category: ["computer-vision", "ai"],
    categoryLabel: "COMPUTER VISION",
    year: "2025",
    description:
      "Real-time touchless Rock-Paper-Scissors against an AI opponent, using webcam hand-gesture detection.",
    technologies: ["Python", "OpenCV", "MediaPipe", "Computer Vision"],
    overview: [
      "A real-time Rock-Paper-Scissors game played against an AI using only a hand and a webcam. Hand gestures are detected with MediaPipe and the AI responds immediately — the interaction is fully touchless.",
    ],
    github: "https://github.com/Bushmanovv/HandBattleAI",
  },

  {
    slug: "blink-judge-ai",
    title: "BlinkJudgeAI — Multi-Player Blink Detection",
    shortTitle: "BlinkJudgeAI",
    featured: false,
    category: ["computer-vision", "ai"],
    categoryLabel: "COMPUTER VISION",
    year: "2025",
    description:
      "Staring-contest referee that tracks faces and eyes to detect blinks from up to four players simultaneously.",
    technologies: ["Python", "OpenCV", "MediaPipe", "Face Tracking"],
    overview: [
      "An AI-judged staring contest: the webcam becomes the arena and real-time face and eye tracking decides the outcome. The system detects blinks from up to four players at once — the last person to blink wins.",
    ],
    github: "https://github.com/Bushmanovv/BlinkJudgeAI",
  },

  {
    slug: "draw-with-vision",
    title: "DrawWithVision — Fingertip Air Drawing",
    shortTitle: "DrawWithVision",
    featured: false,
    category: ["computer-vision", "ai"],
    categoryLabel: "COMPUTER VISION",
    year: "2025",
    description:
      "Turns a fingertip into a brush using hand tracking — draw on screen without touching anything.",
    technologies: ["Python", "OpenCV", "MediaPipe", "Hand Tracking"],
    overview: [
      "A computer vision project that tracks a hand through the webcam and turns the index fingertip into a drawing brush, letting you draw on screen with a wave of the hand.",
    ],
    github: "https://github.com/Bushmanovv/DrawWithVision",
  },

  {
    slug: "progineer-email-alert",
    title: "Email Alert Management System",
    featured: false,
    category: ["software"],
    categoryLabel: "FULL-STACK · AUTOMATION",
    year: "Oct 2025 – Feb 2026",
    role: "Software Engineering Intern — Progineer Technologies",
    description:
      "Full-stack real-time system that ingests, parses and delegates operational email alerts.",
    technologies: [
      "Python",
      "Flask",
      "React",
      "Vite",
      "SQLite",
      "REST API",
      "WebSockets",
      "IMAP",
    ],
    overview: [
      "Built during the Progineer Technologies internship: a system that takes an unmanaged stream of operational alert emails and turns it into a tracked, assignable workflow.",
      "Alerts are ingested automatically over IMAP, parsed, normalised and deduplicated, then surfaced in a dashboard where they can be assigned and actioned. WebSocket synchronisation keeps every connected client's view live.",
    ],
    features: [
      "Automated IMAP ingestion and parsing",
      "Alert normalisation and deduplication",
      "Flask REST API over SQLite",
      "React + Vite dashboard",
      "Role-based access control",
      "Bulk actions across alert sets",
      "WebSocket live synchronisation",
    ],
    // Repository is not public under github.com/Bushmanovv — no link rather than a dead one.
    github: "",
  },

  // ─────────────────────────────────────────────── UNVERIFIED — NOT SHOWN ──
  // Real projects with no verified content available. Fill these in and set
  // `draft: false` to publish. Nothing has been invented on their behalf.
  {
    slug: "spendly",
    title: "Spendly",
    featured: false,
    draft: true,
    category: ["software"],
    categoryLabel: "SOFTWARE",
    description: "",
    technologies: [],
    github: "",
  },
  {
    slug: "delivery-optimizer",
    title: "Delivery Optimizer",
    featured: false,
    draft: true,
    category: ["software", "ai"],
    categoryLabel: "SOFTWARE · OPTIMISATION",
    description: "",
    technologies: [],
    github: "",
  },
];

/** Every project that should appear anywhere on the site. */
export const publishedProjects = projects.filter((p) => !p.draft);

export const featuredProjects = publishedProjects.filter((p) => p.featured);

export const labProjects = publishedProjects.filter((p) => !p.featured);

export function getProject(slug: string): Project | undefined {
  return publishedProjects.find((p) => p.slug === slug);
}

export const projectFilters = [
  { id: "all", label: "ALL" },
  { id: "ai", label: "AI" },
  { id: "software", label: "SOFTWARE" },
  { id: "computer-vision", label: "COMPUTER VISION" },
  { id: "embedded", label: "EMBEDDED" },
  { id: "verification", label: "VERIFICATION" },
  { id: "academic", label: "ACADEMIC" },
] as const;
