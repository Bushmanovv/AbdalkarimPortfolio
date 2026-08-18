import type { Certification, Education } from "@/types";

export const education: Education = {
  institution: "Birzeit University",
  degree: "B.Sc. in Computer Engineering",
  year: "2026",
  location: "Birzeit, Palestine",
  coursework: [
    "Artificial Intelligence",
    "Information Retrieval & NLP",
    "Algorithms",
    "Operating Systems",
    "Computer Networks",
    "Embedded Systems",
    "Digital Signal Processing",
  ],
};

/**
 * `credentialUrl` is intentionally empty. Populate with the real credential
 * link when available — the UI hides the verify action while it is blank.
 */
export const certifications: Certification[] = [
  {
    issuer: "Udacity",
    title: "AI with TensorFlow Nanodegree",
    credentialUrl: "",
  },
  {
    issuer: "Udacity",
    title: "Data Analysis Nanodegree",
    credentialUrl: "",
  },
  {
    issuer: "Gaza Sky Geeks",
    title: "Data Science Program",
    credentialUrl: "",
  },
];
