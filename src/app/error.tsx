"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Prompt } from "@/components/ui/Prompt";

/**
 * Route-level error boundary.
 *
 * Without this file an unexpected render error drops the visitor onto Next's
 * unstyled default screen — the one moment the site is guaranteed to look
 * broken. The recovery path stays in character: a signal, an exit code, and a
 * command to run next.
 *
 * `retry` is Next 16's re-render-and-refetch recovery function.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // No error service is wired up; the console is the honest destination.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 py-16 sm:px-8">
      <Prompt command="./render --page" />

      <p className="mt-5 font-mono text-sm text-term-red">
        Segmentation fault (core dumped)
      </p>

      <p className="mt-10 font-mono text-6xl font-bold tracking-tight text-fg sm:text-8xl">
        500
      </p>

      <h1 className="mt-4 font-mono text-lg text-fg-secondary">
        This page crashed on render.
      </h1>

      <p className="prose-body mt-3 max-w-md text-[15px]">
        Something threw where it shouldn&apos;t have. Retrying re-runs this
        section — the rest of the site is unaffected.
      </p>

      {/* The digest is the only safe identifier to surface: it points at the
          server log entry without exposing a stack trace to visitors. */}
      {error.digest ? (
        <p className="mt-5 font-mono text-[11px] text-fg-muted">
          digest: <span className="text-fg-secondary">{error.digest}</span>
        </p>
      ) : null}

      <div className="mt-9 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center border border-term-green/50 bg-term-green/10 px-4 py-2.5 font-mono text-xs text-term-green transition-colors hover:border-term-green hover:bg-term-green/20"
        >
          [ RETRY ]
        </button>
        <Link
          href="/"
          className="inline-flex items-center border border-line bg-elevated px-4 py-2.5 font-mono text-xs text-fg transition-colors hover:border-line-strong"
        >
          [ cd ~ ]
        </Link>
      </div>

      <Prompt caret className="mt-10" />
    </div>
  );
}
