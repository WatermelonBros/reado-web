import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";

/**
 * The account pages sit in the site's own composition — the statement on the
 * left, the working part on the right, both on the page's gutter — rather than
 * in a centred app card.
 */
export function AccountLayout({
  aside,
  children,
  align = "end",
}: {
  aside: ReactNode;
  children: ReactNode;
  /** `end` lines a short form up with the headline's foot; `start` lets a long list run down the page. */
  align?: "start" | "end";
}) {
  return (
    <>
      <Nav />
      <main
        className={`gutter grid min-h-dvh content-center gap-x-16 gap-y-12 pt-[clamp(120px,18vh,180px)] pb-[clamp(64px,10vh,120px)] lg:grid-cols-[0.95fr_1.05fr] ${
          align === "end" ? "lg:items-end" : "lg:items-start"
        }`}>
        <div>{aside}</div>
        <div className="w-full max-w-[520px] lg:justify-self-end">{children}</div>
      </main>
    </>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return (
    <p className="mt-7 max-w-[34ch] text-[clamp(16px,1.5vw,20px)] leading-[1.5] text-ink/80">{children}</p>
  );
}
