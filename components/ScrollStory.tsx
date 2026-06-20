"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReadoMock } from "./ReadoMock";
import { VIGNETTES } from "./Vignettes";

gsap.registerPlugin(ScrollTrigger);

/**
 * The pinned, scroll-driven product tour. One persistent Reado mock stays
 * pinned while the page scrolls; GSAP scrubs its zoom/pan through the regions
 * that matter (code → comment thread → knowledge graph) as the big headline
 * below swaps between beats.
 */

type Beat = {
  title: React.ReactNode;
  body: string;
  // Focus point (fraction of the mock) and zoom for this beat.
  cx: number;
  cy: number;
  scale: number;
};

const BEATS: Beat[] = [
  {
    title: (
      <>
        A calm place to <span className="text-accent">read code.</span>
      </>
    ),
    body: "A read-first code IDE for the AI era. The code is the hero; the chrome disappears.",
    cx: 0.5,
    cy: 0.5,
    scale: 1,
  },
  {
    title: (
      <>
        A <span className="text-accent">reader</span>, not a writer&rsquo;s
        editor.
      </>
    ),
    body: "Syntax that guides the eye, sticky scope, an outline and go-to-definition — tuned for sustained comprehension of code you didn't write.",
    cx: 0.5,
    cy: 0.46,
    scale: 1.26,
  },
  {
    title: (
      <>
        You annotate. <span className="text-accent">The AI commits.</span>
      </>
    ),
    body: "Drop a durable comment on any line, flag it a task — Claude Code and Codex resolve it from the built-in terminal and commit the fix.",
    cx: 0.74,
    cy: 0.42,
    scale: 1.8,
  },
  {
    title: (
      <>
        A <span className="text-accent">knowledge base</span>, not a folder.
      </>
    ),
    body: "Comments, docs and specs become one searchable graph that links what you've learned. Understanding accrues instead of evaporating.",
    cx: 0.5,
    cy: 0.5,
    scale: 1.06,
  },
];

const focus = (b: Beat) => ({
  scale: b.scale,
  xPercent: -(b.cx - 0.5) * b.scale * 100,
  yPercent: -(b.cy - 0.5) * b.scale * 100,
});

export function ScrollStory() {
  const pinRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);
  const capsRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  // The pinned, scroll-scrubbed tour only runs on a real pointer + wide screen.
  // Touch / narrow / reduced-motion get a clean stacked layout instead.
  useEffect(() => {
    const small = matchMedia("(max-width: 1023px)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(small.matches || reduce.matches);
    update();
    small.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      small.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (reduced) return;

    const ctx = gsap.context(() => {
      const caps = gsap.utils.toArray<HTMLElement>(".story-cap");
      const graph = ".reado-graph-overlay";

      gsap.set(mockRef.current, focus(BEATS[0]));
      gsap.set(caps, { autoAlpha: 0, yPercent: 14 });
      gsap.set(caps[0], { autoAlpha: 1, yPercent: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=340%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 1; i < BEATS.length; i++) {
        const at = i - 1;
        tl.to(mockRef.current, focus(BEATS[i]), at);
        tl.to(caps[i - 1], { autoAlpha: 0, yPercent: -14, duration: 0.4 }, at);
        tl.to(caps[i], { autoAlpha: 1, yPercent: 0, duration: 0.4 }, at + 0.35);
        // Knowledge-graph overlay fades in on the final beat.
        tl.to(graph, { autoAlpha: i === BEATS.length - 1 ? 1 : 0 }, at);
      }
    }, pinRef);

    return () => ctx.revert();
  }, [reduced]);

  // Mobile / reduced-motion: a clean stacked layout. Establishing headline, the
  // product mock, then each capability as its own block. No pinning, no scrub.
  if (reduced) {
    return (
      <section id="top" className="gutter">
        <div className="pt-[clamp(88px,16vh,128px)]">
          <h2 className="max-w-[16ch] text-[clamp(36px,9vw,60px)] font-semibold leading-[0.98] tracking-[-0.035em] text-bright">
            {BEATS[0].title}
          </h2>
          <p className="mt-5 max-w-[48ch] text-[clamp(16px,4.4vw,19px)] leading-[1.55] text-ink/85">
            {BEATS[0].body}
          </p>
        </div>

        <div className="mt-9 h-[min(64vh,560px)] min-h-[340px]">
          <ReadoMock />
        </div>

        <div className="space-y-[clamp(56px,10vh,88px)] pt-[clamp(64px,11vh,104px)] pb-[clamp(40px,7vh,72px)]">
          {BEATS.slice(1).map((b, i) => {
            const Visual = VIGNETTES[i];
            return (
              <div key={i}>
                <h2 className="max-w-[16ch] text-[clamp(30px,7.5vw,52px)] font-semibold leading-[1.0] tracking-[-0.03em] text-bright">
                  {b.title}
                </h2>
                <p className="mt-4 max-w-[48ch] text-[clamp(16px,4.4vw,19px)] leading-[1.55] text-ink/85">
                  {b.body}
                </p>
                <div className="mt-7">
                  <Visual />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section id="top" className="relative">
      <div
        ref={pinRef}
        className="gutter flex h-[100dvh] flex-col gap-[clamp(22px,3.4vh,46px)] overflow-hidden pt-[clamp(64px,7.5vh,96px)] pb-[clamp(30px,4.5vh,58px)]"
      >
        {/* the pinned product viewport (clips the zoom) */}
        <div className="relative min-h-0 flex-1">
          <div ref={mockRef} className="absolute inset-0 will-change-transform">
            <ReadoMock />
          </div>
        </div>

        {/* the big "wow" caption band; beats cross-fade in place */}
        <div ref={capsRef} className="relative flex-none">
          <div className="relative h-[clamp(168px,24vh,250px)]">
            {BEATS.map((b, i) => (
              <div
                key={i}
                className="story-cap absolute inset-0 flex flex-col justify-end"
              >
                <h2 className="max-w-[20ch] text-[clamp(32px,5.6vw,74px)] font-semibold leading-[0.98] tracking-[-0.035em] text-bright">
                  {b.title}
                </h2>
                <p className="mt-5 max-w-[46ch] text-[clamp(16px,1.5vw,20px)] leading-[1.55] text-ink/85">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
