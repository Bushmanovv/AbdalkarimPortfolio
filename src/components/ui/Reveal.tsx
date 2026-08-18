"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Distance in px to translate up from. Kept small and subtle. */
  y?: number;
  as?: "div" | "li" | "section" | "article";
}

/**
 * Single scroll-reveal primitive, used sparingly — for section blocks and
 * timeline entries, never for individual paragraphs.
 *
 * Every instance carries `data-reveal`, which two CSS safety nets key off
 * (see `globals.css` and the `<noscript>` block in the root layout):
 *
 *  - Under `prefers-reduced-motion: reduce`, opacity and transform are forced
 *    back to their resting values. This matters because Framer Motion writes
 *    its `initial` styles into the server-rendered HTML, and React does not
 *    clear those inline styles when this component swaps to a plain element —
 *    without the override, reduced-motion visitors would be left staring at
 *    permanently invisible content.
 *  - With JavaScript disabled, the same override keeps content readable
 *    instead of stranding it at `opacity: 0`.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 12,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (reduceMotion) {
    const Tag = as;
    return (
      <Tag className={className} data-reveal="">
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      data-reveal=""
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
