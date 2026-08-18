import type { ArchitectureNode } from "@/types";
import { accentBorder, accentText, cn } from "@/lib/utils";

interface ProjectArchitectureProps {
  nodes: ArchitectureNode[];
  caption?: string;
}

/**
 * Renders a system flow as a vertical chain of stages.
 *
 * Each stage is a real list item so the sequence is meaningful to a screen
 * reader; the connectors and arrows are decorative.
 */
export function ProjectArchitecture({
  nodes,
  caption,
}: ProjectArchitectureProps) {
  return (
    <figure className="panel overflow-hidden">
      <ol className="divide-y divide-[color:var(--color-line)]">
        {nodes.map((node, i) => {
          const accent = node.accent ?? "neutral";
          const isLast = i === nodes.length - 1;

          return (
            <li key={`${node.label}-${i}`} className="relative">
              <div className="flex items-stretch">
                {/* Index rail */}
                <div className="flex w-12 shrink-0 items-center justify-center border-r border-line bg-bg-secondary font-mono text-[10px] text-fg-muted sm:w-14">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1 px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={cn(
                        "font-mono text-[13px] font-medium tracking-wide sm:text-sm",
                        accentText[accent],
                      )}
                    >
                      {node.label}
                    </span>
                    {node.detail ? (
                      <span className="font-mono text-[11px] text-fg-muted">
                        {node.detail}
                      </span>
                    ) : null}
                  </div>

                  {node.branches?.length ? (
                    <ul className="mt-2.5 space-y-1.5">
                      {node.branches.map((branch) => (
                        <li
                          key={branch}
                          className={cn(
                            "border-l-2 pl-3 font-mono text-[11px] text-fg-secondary",
                            accentBorder[accent],
                          )}
                        >
                          <span aria-hidden="true" className="text-fg-muted">
                            └─{" "}
                          </span>
                          {branch}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {/* Flow arrow */}
                {!isLast ? (
                  <div
                    aria-hidden="true"
                    className="flex w-10 shrink-0 items-center justify-center font-mono text-sm text-fg-muted"
                  >
                    ↓
                  </div>
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex w-10 shrink-0 items-center justify-center font-mono text-sm text-term-green"
                  >
                    ●
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {caption ? (
        <figcaption className="border-t border-line bg-bg-secondary px-4 py-3 font-mono text-[11px] leading-relaxed text-fg-muted sm:px-5">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
