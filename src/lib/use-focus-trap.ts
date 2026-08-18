"use client";

import { useEffect, type RefObject } from "react";

/**
 * Elements that can hold keyboard focus. `[tabindex="-1"]` is deliberately
 * excluded: those are programmatic focus targets (the dialog panel itself),
 * not Tab stops.
 */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Keeps Tab inside an open dialog, and puts focus back where it came from.
 *
 * `aria-modal="true"` is a promise to assistive tech that the rest of the page
 * is unavailable. Without this, that promise is false: Tab walks straight out
 * of the dialog into the header, sidebar and page behind it, and closing the
 * dialog drops focus at the top of the document instead of returning it.
 *
 * Listens during the capture phase so the wrap happens before any component's
 * own key handling, and re-queries on every Tab because dialog contents change
 * as the visitor types.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
) {
  useEffect(() => {
    if (!open) return;

    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const root = ref.current;
      if (!root) return;

      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        // `offsetParent` is null for anything `display: none`, which is how a
        // filtered-out result or a hidden-on-mobile control leaves the ring.
        (el) => el.offsetParent !== null,
      );

      // Nothing to land on: hold focus rather than letting it escape.
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && root.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);

    // Captured now: by cleanup time the dialog may already be unmounted and
    // `ref.current` null, and this is the node whose focus we care about.
    const root = ref.current;

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      // Only reclaim focus if it is still parked inside the closing dialog or
      // was dropped on <body> — never yank it from wherever the visitor went.
      const active = document.activeElement;
      const stranded =
        active === null ||
        active === document.body ||
        (root !== null && active instanceof Node && root.contains(active));

      if (stranded && opener && opener.isConnected) opener.focus();
    };
  }, [open, ref]);
}
