import { promptUser } from "@/data/profile";
import { cn } from "@/lib/utils";

interface PromptProps {
  /** Current working directory shown after the host, e.g. "~/projects". */
  cwd?: string;
  /** The command text rendered after the `$`. */
  command?: string;
  /** Render a blinking caret after the command. */
  caret?: boolean;
  className?: string;
  size?: "sm" | "base";
}

/**
 * The shell prompt line used to frame sections across the site.
 *
 * Rendered as a single decorative line: screen readers get the command as
 * ordinary text, but the `user@host:cwd$` chrome is hidden from them so the
 * repetition does not clutter audio navigation.
 */
export function Prompt({
  cwd = "~",
  command,
  caret = false,
  className,
  size = "base",
}: PromptProps) {
  return (
    <div
      className={cn(
        "font-mono leading-relaxed",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
    >
      {/* Shell chrome is decorative: the command itself is the only part a
          screen reader needs to hear. */}
      <span aria-hidden="true" className="text-term-green">
        {promptUser}
      </span>
      <span aria-hidden="true" className="text-fg-muted">
        :
      </span>
      <span aria-hidden="true" className="text-term-cyan">
        {cwd}
      </span>
      <span aria-hidden="true" className="text-fg-muted">
        ${" "}
      </span>
      {command ? <span className="break-all text-fg">{command}</span> : null}
      {caret ? (
        <span aria-hidden="true" className="caret ml-1 translate-y-[2px]" />
      ) : null}
    </div>
  );
}
