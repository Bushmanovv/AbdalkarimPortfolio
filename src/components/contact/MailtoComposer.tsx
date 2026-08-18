"use client";

import { useId, useState } from "react";

import { profile } from "@/data/profile";

/**
 * Message composer.
 *
 * There is no backend and no email service configured, so this deliberately
 * does NOT claim to send anything. It assembles a `mailto:` link and hands off
 * to the visitor's own mail client — the button label and helper text say so
 * explicitly. Nothing here ever reports a false success.
 */
export function MailtoComposer() {
  const nameId = useId();
  const subjectId = useId();
  const messageId = useId();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const composedSubject = subject.trim() || "Hello from your portfolio";
  const composedBody = [message.trim(), name.trim() ? `\n\n— ${name.trim()}` : ""]
    .join("")
    .trim();

  const href = `mailto:${profile.email}?subject=${encodeURIComponent(
    composedSubject,
  )}&body=${encodeURIComponent(composedBody)}`;

  const fieldClass =
    "w-full border border-line bg-bg-secondary px-3 py-2.5 font-mono text-[13px] text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-term-green/60";

  return (
    <form
      className="panel p-5 sm:p-6"
      // No submit handler: the action is the mailto anchor below.
      onSubmit={(e) => e.preventDefault()}
    >
      <p className="mb-5 font-mono text-[11px] tracking-[0.14em] text-fg-muted">
        COMPOSE MESSAGE
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={nameId}
            className="mb-1.5 block font-mono text-[11px] text-fg-secondary"
          >
            Your name
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>

        <div>
          <label
            htmlFor={subjectId}
            className="mb-1.5 block font-mono text-[11px] text-fg-secondary"
          >
            Subject
          </label>
          <input
            id={subjectId}
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={fieldClass}
            placeholder="Engineering role at ..."
          />
        </div>

        <div>
          <label
            htmlFor={messageId}
            className="mb-1.5 block font-mono text-[11px] text-fg-secondary"
          >
            Message
          </label>
          <textarea
            id={messageId}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className={`${fieldClass} resize-y`}
            placeholder="A few lines about the role or project..."
          />
        </div>
      </div>

      <a
        href={href}
        className="mt-5 inline-flex items-center gap-2 border border-term-green/50 bg-term-green/10 px-4 py-2.5 font-mono text-xs text-term-green transition-colors hover:border-term-green hover:bg-term-green/20"
      >
        [ OPEN IN EMAIL CLIENT ]
      </a>

      <p className="mt-3 font-mono text-[11px] leading-relaxed text-fg-muted">
        This opens a pre-filled draft in your own email app — nothing is sent
        from this page. Prefer to write directly? {profile.email}
      </p>
    </form>
  );
}
