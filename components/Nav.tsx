"use client";

import { useEffect, useState } from "react";
import { GITHUB, RELEASES } from "./links";

const GitHubMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

/** Always-visible slim site header. Background fades in once you scroll. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      style={
        scrolled
          ? {
              background: "color-mix(in oklch, var(--bg) 78%, transparent)",
              backdropFilter: "blur(10px)",
              borderBottom: "1px solid var(--border)",
            }
          : undefined
      }
    >
      <div className="gutter flex items-center justify-between py-3.5">
        <a href="/" className="flex items-center gap-3" aria-label="Reado — home">
          <img
            src="/icon.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-[9px]"
          />
          <span className="text-[22px] font-semibold tracking-[-0.03em] text-ink">
            Reado
          </span>
        </a>
        <div className="flex items-center gap-1.5">
          <a
            href="/roadmap"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink sm:block"
          >
            Roadmap
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener"
            aria-label="Reado on GitHub"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <GitHubMark />
          </a>
          <a
            href={RELEASES}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-[filter] hover:brightness-110"
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
