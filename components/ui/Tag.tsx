import type { ReactNode } from "react";

/** A small factual label on a row ("for you", "Pro", "this browser"). */
export function Tag({ children, tone = "marker" }: { children: ReactNode; tone?: "marker" | "accent" | "quiet" }) {
  const tones = {
    marker: "border-marker/40 text-marker",
    accent: "border-accent/40 text-accent",
    quiet: "border-line-strong text-muted",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
