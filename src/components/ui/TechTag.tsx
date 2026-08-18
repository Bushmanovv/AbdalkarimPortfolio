import { cn } from "@/lib/utils";

interface TechTagProps {
  label: string;
  className?: string;
}

/** Neutral monospace technology chip. Colour is reserved for semantics. */
export function TechTag({ label, className }: TechTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-line bg-elevated px-2 py-1",
        "font-mono text-[11px] leading-none text-fg-secondary",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function TechTagList({
  items,
  limit,
  className,
}: {
  items: string[];
  limit?: number;
  className?: string;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  const remaining = limit ? items.length - shown.length : 0;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((item) => (
        <li key={item}>
          <TechTag label={item} />
        </li>
      ))}
      {remaining > 0 ? (
        <li>
          <span className="inline-flex items-center px-2 py-1 font-mono text-[11px] leading-none text-fg-muted">
            +{remaining}
          </span>
        </li>
      ) : null}
    </ul>
  );
}
