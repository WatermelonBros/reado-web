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

    // Tug-of-war: the bar drains EVERY frame; downward over-scroll pushes it back
    // up. So it fills only while you keep pulling and empties the instant you stop
    // — robust to trackpad momentum (which keeps firing wheel events after you let
    // go). `value` eases toward `target` for a fluid, jump-free motion.
    let target = 0;
    let value = 0;
    let lastFrame = 0;
    let raf = 0;
    let navigated = false;
    let touchY = 0;

    const NEEDED = 900; // px of sustained downward intent to fill against the drain
    const DRAIN = 2.4; // bar lost per second — fast empty when you stop pulling

    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    const render = () => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${value})`;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(value * 100)}%`;
      if (hintRef.current) hintRef.current.style.opacity = value > 0.02 ? "1" : "0";
    };

    const tick = (t: number) => {
      const dt = lastFrame ? Math.min(0.05, (t - lastFrame) / 1000) : 0;
      lastFrame = t;
      target = Math.max(0, target - dt * DRAIN); // always draining
      value += (target - value) * Math.min(1, dt * 14);
      render();
      if (value >= 0.99 && !navigated) {
        navigated = true;
        router.push("/roadmap");
      }
      if (value > 0.002 || target > 0.002) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        lastFrame = 0;
        target = 0;
        value = 0;
        render();
      }
    };
    const ensure = () => {
      if (!raf) {
        lastFrame = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const intent = (px: number) => {
      if (px <= 0 || !atBottom()) return; // only downward over-scroll fills
      target = Math.min(1, target + px / NEEDED);
      ensure();
    };

    const onWheel = (e: WheelEvent) => intent(e.deltaY);
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      const dy = touchY - y; // dragging up (scroll-down intent) is positive
      touchY = y;
      intent(dy * 1.6);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      if (raf) cancelAnimationFrame(raf);
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
