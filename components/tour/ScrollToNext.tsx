"use client";

/**
 * "Keep scrolling" → the roadmap (lusion-style). Sits after the footer: as you
 * scroll past it a bar fills, and at the end we navigate to /roadmap. The bar is
 * driven by transform: scaleX only (60fps); /roadmap is prefetched for an instant
 * transition.
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

  return (
    <section ref={sectionRef} className="relative h-[160vh] border-t border-line">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-faint">Keep scrolling</p>
        <p className="text-[clamp(28px,4vw,56px)] font-semibold leading-none tracking-[-0.03em] text-bright">
          The roadmap →
        </p>
        <div className="mt-2 flex w-[min(460px,72vw)] items-center gap-3">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-line-strong/60">
            <div
              ref={barRef}
              className="h-full w-full origin-left rounded-full bg-accent will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <span ref={pctRef} className="w-9 text-right font-mono text-[11px] tabular-nums text-faint">
            0%
          </span>
        </div>
        <p className="text-[13px] text-muted">Release the scroll to stay — keep going to open the roadmap.</p>
      </div>
    </section>
  );
}
