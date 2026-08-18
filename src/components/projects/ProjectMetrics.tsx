import type { Metric } from "@/types";
import type { Accent } from "@/types";
import { accentText, cn } from "@/lib/utils";

interface ProjectMetricsProps {
  metrics: Metric[];
  accent?: Accent;
  className?: string;
}

/** Headline figures. The first metric is emphasised as the key result. */
export function ProjectMetrics({
  metrics,
  accent = "green",
  className,
}: ProjectMetricsProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px border border-line bg-[color:var(--color-line)] lg:grid-cols-4",
        className,
      )}
    >
      {metrics.map((metric, i) => (
        <div key={metric.label} className="bg-panel px-4 py-5 sm:px-5 sm:py-6">
          <dt className="font-mono text-[10px] tracking-[0.14em] text-fg-muted">
            {metric.label.toUpperCase()}
          </dt>
          <dd
            className={cn(
              "mt-2 font-mono font-semibold tracking-tight",
              i === 0 ? accentText[accent] : "text-fg",
              metric.value.length > 8
                ? "text-lg sm:text-xl"
                : "text-2xl sm:text-3xl",
            )}
          >
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
