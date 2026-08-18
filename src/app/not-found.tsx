import type { Metadata } from "next";
import Link from "next/link";

import { Prompt } from "@/components/ui/Prompt";

export const metadata: Metadata = {
  title: "404 — Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 py-16 sm:px-8">
      <Prompt command="cd /missing-page" />

      <p className="mt-5 font-mono text-sm text-term-red">
        bash: cd: /missing-page: No such file or directory
      </p>

      <p className="mt-10 font-mono text-6xl font-bold tracking-tight text-fg sm:text-8xl">
        404
      </p>

      <h1 className="mt-4 font-mono text-lg text-fg-secondary">
        This path doesn&apos;t resolve.
      </h1>

      <p className="prose-body mt-3 max-w-md text-[15px]">
        The page you&apos;re looking for isn&apos;t here. Everything else is
        still one directory up.
      </p>

      <div className="mt-9 flex flex-wrap gap-2.5">
        <Link
          href="/"
          className="inline-flex items-center border border-term-green/50 bg-term-green/10 px-4 py-2.5 font-mono text-xs text-term-green transition-colors hover:border-term-green hover:bg-term-green/20"
        >
          [ cd ~ ]
        </Link>
        <Link
          href="/projects"
          className="inline-flex items-center border border-line bg-elevated px-4 py-2.5 font-mono text-xs text-fg transition-colors hover:border-line-strong"
        >
          [ ls projects ]
        </Link>
      </div>

      <Prompt caret className="mt-10" />
    </div>
  );
}
