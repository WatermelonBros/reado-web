"use client";

/**
 * The Reado Anywhere phone, the final beat: the same review on a paired phone,
 * with the "review done" ping. Slides in over the IDE on transform/opacity only.
 */
export function PhoneAnywhere() {
  return (
    <div className="reveal-phone pointer-events-none absolute -bottom-4 right-2 z-30 w-[180px] sm:w-[210px]">
      <div className="overflow-hidden rounded-[2rem] border-[6px] border-black/80 bg-canvas shadow-[0_24px_60px_oklch(0.12_0.02_250/0.6)]">
        {/* status bar */}
        <div className="relative flex h-6 items-center justify-center bg-surface">
          <span className="absolute left-1/2 top-1.5 h-3 w-16 -translate-x-1/2 rounded-full bg-black/80" />
        </div>
        {/* header */}
        <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-[11px] text-muted">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Reado Anywhere
        </div>
        {/* condensed review */}
        <div className="px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-faint">cart.ts</p>
          <div className="mt-1.5 rounded-md border border-line bg-surface/60 p-2">
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="h-1.5 w-1.5 rounded-full bg-marker" />
              <span className="uppercase tracking-wide text-marker">bug</span>
              <span className="ml-auto text-faint">:11</span>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-ink">
              Discount isn&apos;t rounded or clamped.
            </p>
          </div>
          {/* notification */}
          <div className="mt-2 flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-[10px] text-accent">Review done — 1 task resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
