"use client";

/**
 * A compact "scroll to next page" strip under the footer (lusion-style). It adds
 * NO extra page height: once you're at the bottom, a little more downward scroll
 * (wheel or touch-drag) fills the bar — then we navigate to /roadmap. Scrolling
 * back up empties it. The bar is transform: scaleX only (60fps); /roadmap is
 * prefetched for an instant transition.
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function ScrollToNext() {
  const router = useRouter();
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    router.prefetch("/roadmap");

    let progress = 0;
    let navigated = false;
    let touchY = 0;
    const NEEDED = 640; // px of extra downward intent to fill (a small flick)

    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    const render = () => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(progress * 100)}%`;
      if (hintRef.current) hintRef.current.style.opacity = progress > 0.02 ? "1" : "0";
    };
    const set = (v: number) => {
      progress = Math.max(0, Math.min(1, v));
      render();
      if (progress >= 1 && !navigated) {
        navigated = true;
        router.push("/roadmap");
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!atBottom()) {
        if (progress > 0) set(0);
        return;
      }
      set(progress + e.deltaY / NEEDED);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      const dy = touchY - y; // dragging up (scroll-down intent) is positive
      touchY = y;
      if (!atBottom()) {
        if (progress > 0) set(0);
        return;
      }
      set(progress + dy / (NEEDED * 0.6));
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [router]);

  return (
    <div className="border-t border-line bg-canvas">
      <div className="gutter flex items-center justify-between gap-4 py-5">
        <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-faint">
          Scroll to next page
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-ink">The roadmap</span>
          <span className="text-muted" aria-hidden>
            →
          </span>
          <span
            ref={pctRef}
            className="w-8 text-right font-mono text-[11px] tabular-nums text-faint"
          >
            0%
          </span>
        </div>
      </div>
      <div className="relative h-[3px] w-full overflow-hidden bg-line-strong/40">
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-accent will-change-transform"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <span
        ref={hintRef}
        className="block py-2 text-center text-[11px] text-faint opacity-0 transition-opacity"
      >
        keep scrolling to open the roadmap
      </span>
    </div>
  );
}
