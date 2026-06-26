"use client";

/**
 * A compact "scroll to next page" strip under the footer (lusion-style): a short
 * over-scroll fills the bar and we navigate to /roadmap — no long scrolling
 * needed. The bar is transform: scaleX only (60fps); /roadmap is prefetched.
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollToNext() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    router.prefetch("/roadmap");
    let navigated = false;
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      // A short range: the bar fills with just a flick past the footer.
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const v = self.progress;
        if (barRef.current) barRef.current.style.transform = `scaleX(${v})`;
        if (pctRef.current) pctRef.current.textContent = `${Math.round(v * 100)}%`;
        if (v >= 0.992 && !navigated) {
          navigated = true;
          router.push("/roadmap");
        }
      },
    });
    return () => st.kill();
  }, [router]);

  // ~55vh of travel = a small flick fills it; the strip stays pinned at the
  // bottom while it does, so it reads like part of the footer.
  return (
    <section ref={sectionRef} className="relative h-[55vh]">
      <div className="sticky bottom-0 border-t border-line bg-canvas">
        <div className="gutter flex items-center justify-between gap-4 py-5">
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-faint">
            Scroll to next page
          </span>
          <div className="flex items-center gap-2 text-muted">
            <span className="text-[13px] font-medium text-ink">The roadmap</span>
            <span aria-hidden>→</span>
            <span ref={pctRef} className="w-8 text-right font-mono text-[11px] tabular-nums text-faint">
              0%
            </span>
          </div>
        </div>
        <div className="h-[3px] w-full overflow-hidden bg-line-strong/40">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-accent will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </section>
  );
}
