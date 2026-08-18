import { cn } from "@/lib/utils";

interface StatusProps {
  label: string;
  /** Adds the pulsing halo. Use only for the live availability indicator. */
  pulse?: boolean;
  className?: string;
  tone?: "green" | "muted";
}

export function Status({
  label,
  pulse = false,
  className,
  tone = "green",
}: StatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs tracking-wide",
        tone === "green" ? "text-term-green" : "text-fg-muted",
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            tone === "green" ? "bg-term-green" : "bg-fg-muted",
            pulse && "status-pulse",
          )}
        />
      </span>
      {label}
    </span>
  );
}
