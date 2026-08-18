import type { SkillGroup } from "@/types";

/**
 * Skills are modelled as a filesystem tree rather than rated bars.
 * No numeric proficiency scores — they would be arbitrary.
 */
export const skillGroups: SkillGroup[] = [
  {
    dir: "programming",
    label: "Programming Languages",
    accent: "cyan",
    items: [
      "Python",
      "Java",
      "C",
      "C++",
      "JavaScript",
      "SQL",
      "SystemVerilog",
      "Shell",
    ],
  },
  {
    dir: "ai-ml",
    label: "AI & Machine Learning",
    accent: "purple",
    items: [
      "PyTorch",
      "TensorFlow",
      "Scikit-learn",
      "OpenCV",
      "NLP",
      "Computer Vision",
      "Signal Processing",
    ],
  },
  {
    dir: "generative-ai",
    label: "Generative AI",
    accent: "purple",
    items: [
      "LangChain",
      "OpenAI API",
      "RAG",
      "Vector Databases",
      "AI Agents",
      "Prompt Engineering",
    ],
  },
  {
    dir: "backend-web",
    label: "Backend & Web",
    accent: "cyan",
    items: [
      "FastAPI",
      "Flask",
      "REST APIs",
      "WebSockets",
      "React",
      "Vite",
      "PostgreSQL",
      "SQLite",
    ],
  },
  {
    dir: "embedded",
    label: "Embedded & Systems",
    accent: "yellow",
    items: [
      "Raspberry Pi",
      "ESP32",
      "Embedded Linux",
      "UART",
      "I2C",
      "MQTT",
      "TCP/IP",
      "Real-Time Systems",
    ],
  },
  {
    dir: "verification",
    label: "Digital Verification",
    accent: "green",
    items: [
      "SystemVerilog",
      "UVM",
      "RTL Verification",
      "Testbench Development",
      "Assertions",
      "Functional Coverage",
      "Code Coverage",
    ],
  },
  {
    dir: "tools",
    label: "Engineering Tools",
    accent: "neutral",
    items: ["Git", "Docker", "Linux", "Postman", "VS Code", "ClickUp"],
  },
];
