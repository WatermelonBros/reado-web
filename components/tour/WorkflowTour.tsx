"use client";

/**
 * The scroll-driven, reversible workflow tour. One pinned 1:1 Reado IDE performs
 * the whole guided-review story as you scroll; a fake cursor moves to each control
 * and "clicks" it, and the UI reacts. Scrolling up reverses it.
 *
 * 60fps strategy: the IDE content changes only at discrete beat boundaries (cheap,
 * not per-frame); the only per-frame work is moving the cursor via `transform`
 * (no layout, no React re-render). Mobile / reduced-motion falls back to autoplay.
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReadoIde, type IdeState, type TermLine } from "./ReadoIde";
import { PhoneAnywhere } from "./PhoneAnywhere";

gsap.registerPlugin(ScrollTrigger);

// ---- The script: each beat is a full IDE state + a caption + a cursor target --

const term = (...lines: TermLine[]) => lines;
const T_PLAN: TermLine[] = term(
  { kind: "cmd", text: "claude" },
  { kind: "agent", text: "Claude Code — planning the review" },
  { kind: "cmd", text: "reado review plan s_4f2 --route '[…]'" },
  { kind: "out", text: "route set: 2 files" },
);
const T_REVIEW: TermLine[] = term(
  ...T_PLAN,
  { kind: "cmd", text: "reado review context s_4f2 --file cart.ts" },
  { kind: "agent", text: "Reading cart.ts — checking the discount path" },
);
const T_PROP: TermLine[] = term(
  ...T_REVIEW,
  { kind: "cmd", text: 'reado review propose-comment … --type bug "…"' },
  { kind: "out", text: "proposed p_1" },
);
const T_SECOND: TermLine[] = term(
  ...T_PROP,
  { kind: "agent", text: "Second agent — challenging the findings" },
  { kind: "out", text: "proposed p_2" },
);
const T_LOOP: TermLine[] = term(
  ...T_SECOND,
  { kind: "cmd", text: "reado task done — resolving 1 task" },
  { kind: "agent", text: "Editing applyDiscount: round + clamp" },
);
const T_DONE: TermLine[] = term(...T_LOOP, { kind: "out", text: "✓ done — review the delta" });

const ROUTE_REVIEW = [
  { file: "src/cart.ts", reason: "core money path", state: "in_review" as const },
  { file: "src/discounts.ts", reason: "lookup table", state: "queued" as const },
];

const P1_PROPOSED = {
  id: "p1" as const,
  type: "bug" as const,
  line: 11,
  body: "Discount isn't rounded to cents or clamped — a 120% code yields a negative amount due.",
  state: "proposed" as const,
  who: "agent" as const,
};
const P1_TASK = { ...P1_PROPOSED, state: "task" as const };
const P2 = {
  id: "p2" as const,
  type: "question" as const,
  line: 7,
  body: "Is `rule.percent` already validated ≤ 1 upstream? If not, clamp it here.",
  state: "proposed" as const,
  who: "second" as const,
};

interface Beat {
  caption: { title: string; body: string };
  target?: string; // CSS selector inside the IDE the cursor flies to + clicks
  state: IdeState;
  phone?: boolean;
}

const BEATS: Beat[] = [
  {
    caption: {
      title: "A review, start to finish",
      body: "This is the real Reado — reading the code you didn't write. Scroll to watch a full guided review play out.",
    },
    state: { tool: "files", file: "cart.ts", review: { phase: "empty" } },
  },
  {
    caption: {
      title: "Open a guided review",
      body: "The reviewer cockpit lives in the activity bar. The agent will propose; you stay in control.",
    },
    target: '[data-act="review"]',
    state: { tool: "review", file: "cart.ts", review: { phase: "empty", objective: "Bug risk" } },
  },
  {
    caption: {
      title: "Point it at your changes",
      body: "Pick a focus — bug risk, security, performance — and aim it at the diff.",
    },
    target: '[data-act="start"]',
    state: { tool: "review", file: "cart.ts", review: { phase: "empty", objective: "Bug risk" } },
  },
  {
    caption: {
      title: "The agent plans a route",
      body: "It reads the change in the terminal and proposes an ordered route — riskiest files first.",
    },
    state: {
      tool: "review",
      file: "cart.ts",
      busy: true,
      terminalOpen: true,
      terminalLines: T_PLAN,
      review: {
        phase: "planning",
        objective: "Bug risk",
        reviewed: 0,
        total: 2,
        route: ROUTE_REVIEW,
      },
    },
  },
  {
    caption: {
      title: "Review file by file",
      body: "It opens the current file and asks targeted, grounded questions — never broad noise.",
    },
    target: '[data-act="review-file"]',
    state: {
      tool: "review",
      file: "cart.ts",
      terminalOpen: true,
      terminalLines: T_REVIEW,
      review: {
        phase: "review",
        objective: "Bug risk",
        reviewed: 0,
        total: 2,
        current: { file: "src/cart.ts", reason: "core money path — discount math" },
        route: ROUTE_REVIEW,
      },
    },
  },
  {
    caption: {
      title: "It proposes — never final",
      body: "Each finding is anchored to a line as a proposal. Nothing touches your code yet.",
    },
    state: {
      tool: "review",
      file: "cart.ts",
      pulseLine: 11,
      terminalOpen: true,
      terminalLines: T_PROP,
      review: {
        phase: "review",
        objective: "Bug risk",
        reviewed: 0,
        total: 2,
        current: { file: "src/cart.ts", reason: "core money path — discount math" },
        route: ROUTE_REVIEW,
        proposals: [P1_PROPOSED],
      },
    },
  },
  {
    caption: {
      title: "You decide",
      body: "Approve, edit, convert to a note, or discard. An approved finding becomes a durable task.",
    },
    target: '[data-act="approve-p1"]',
    state: {
      tool: "review",
      file: "cart.ts",
      markers: [11],
      terminalOpen: true,
      terminalLines: T_PROP,
      review: {
        phase: "review",
        objective: "Bug risk",
        reviewed: 0,
        total: 2,
        current: { file: "src/cart.ts", reason: "core money path — discount math" },
        route: ROUTE_REVIEW,
        proposals: [P1_TASK],
      },
    },
  },
  {
    caption: {
      title: "Review by hand, too",
      body: "Not just AI — select any line and leave your own comment. Reado is a reading tool first.",
    },
    target: '[data-line="6"]',
    state: {
      tool: "review",
      file: "cart.ts",
      markers: [11],
      selectLines: [6, 6],
      composer: { line: 6, text: "Extract the line total — easier to test the rounding." },
      terminalOpen: true,
      terminalLines: T_PROP,
      review: {
        phase: "review",
        objective: "Bug risk",
        reviewed: 1,
        total: 2,
        current: { file: "src/cart.ts", reason: "core money path — discount math" },
        route: ROUTE_REVIEW,
        proposals: [P1_TASK],
      },
    },
  },
  {
    caption: {
      title: "Ask a second opinion",
      body: "A second agent challenges the review — false positives caught, blind spots surfaced.",
    },
    target: '[data-act="second"]',
    state: {
      tool: "review",
      file: "cart.ts",
      markers: [6, 11],
      pulseLine: 7,
      terminalOpen: true,
      terminalLines: T_SECOND,
      review: {
        phase: "review",
        objective: "Bug risk",
        reviewed: 1,
        total: 2,
        current: { file: "src/cart.ts", reason: "core money path — discount math" },
        route: ROUTE_REVIEW,
        proposals: [P1_TASK, P2],
      },
    },
  },
  {
    caption: {
      title: "Hand it to the agent",
      body: "Send the confirmed tasks. The agent resolves them in the background while you watch.",
    },
    target: '[data-act="send"]',
    state: {
      tool: "review",
      file: "cart.ts",
      markers: [6, 11],
      terminalOpen: true,
      terminalLines: T_LOOP,
      review: {
        phase: "loop",
        objective: "Bug risk",
        reviewed: 2,
        total: 2,
        route: [
          { file: "src/cart.ts", reason: "core money path", state: "reviewed" },
          { file: "src/discounts.ts", reason: "lookup table", state: "reviewed" },
        ],
        proposals: [P1_TASK, { ...P2, state: "task" }],
        loop: { resolved: 0, total: 1, status: "running" },
      },
    },
  },
  {
    caption: {
      title: "Resolved — you review the delta",
      body: "The fix lands, the comment resolves. Nothing was applied without your approval.",
    },
    state: {
      tool: "review",
      file: "cart.ts",
      resolved: [11],
      markers: [6],
      terminalOpen: true,
      terminalLines: T_DONE,
      review: {
        phase: "loop",
        objective: "Bug risk",
        reviewed: 2,
        total: 2,
        route: [
          { file: "src/cart.ts", reason: "core money path", state: "reviewed" },
          { file: "src/discounts.ts", reason: "lookup table", state: "reviewed" },
        ],
        proposals: [P1_TASK, { ...P2, state: "task" }],
        loop: { resolved: 1, total: 1, status: "finished" },
      },
    },
  },
  {
    caption: {
      title: "Follow it from your phone",
      body: "Reado Anywhere pairs over your network — review, comment and get pinged when the agent is done.",
    },
    phone: true,
    state: {
      tool: "review",
      file: "cart.ts",
      resolved: [11],
      markers: [6],
      review: {
        phase: "loop",
        objective: "Bug risk",
        reviewed: 2,
        total: 2,
        proposals: [P1_TASK, { ...P2, state: "task" }],
        loop: { resolved: 1, total: 1, status: "finished" },
      },
    },
  },
];

export function WorkflowTour() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const N = BEATS.length;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const centerOf = (sel?: string): { x: number; y: number } | null => {
      if (!sel || !stageRef.current) return null;
      const el = stageRef.current.querySelector(sel) as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    let last = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let lastBeat = -1;

    const apply = (p: number) => {
      const fi = Math.max(0, Math.min(N - 1, p * (N - 1)));
      const idx = Math.round(fi);
      if (idx !== lastBeat) {
        lastBeat = idx;
        setBeat(idx);
        if (BEATS[idx].target) {
          setClicking(true);
          window.setTimeout(() => setClicking(false), 320);
        }
      }
      // Cursor: lerp between the surrounding beats' targets (continuous, reversible).
      const a = Math.floor(fi);
      const b = Math.min(N - 1, Math.ceil(fi));
      const t = fi - a;
      const ca = centerOf(BEATS[a].target);
      const cb = centerOf(BEATS[b].target);
      const from = ca ?? last;
      const to = cb ?? ca ?? last;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      last = { x, y };
      const visible = !!(ca || cb);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        cursorRef.current.style.opacity = visible ? "1" : "0";
      }
    };

    if (reduced) {
      setBeat(0);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: trackRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    apply(0);
    return () => st.kill();
  }, []);

  const current = BEATS[beat];

  return (
    <section ref={trackRef} className="relative" style={{ height: `${BEATS.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-8 px-6 lg:grid-cols-[minmax(260px,360px)_1fr]">
          {/* Caption */}
          <div key={beat} className="reveal-cap order-2 lg:order-1">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-bright sm:text-4xl">
              {current.caption.title}
            </h2>
            <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted">
              {current.caption.body}
            </p>
            <div className="mt-6 flex gap-1.5">
              {BEATS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === beat ? "w-6 bg-accent" : "w-1.5 bg-line-strong"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* The pinned IDE stage */}
          <div className="order-1 lg:order-2">
            <div
              ref={stageRef}
              className="relative mx-auto aspect-[16/10] w-full max-w-[820px]"
            >
              <ReadoIde state={current.state} />
              {current.phone && <PhoneAnywhere />}
            </div>
          </div>
        </div>
      </div>

      {/* Fake cursor (fixed, moved via transform only) */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-50 -ml-2 -mt-2 opacity-0 will-change-transform"
        aria-hidden="true"
      >
        <div className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow">
            <path
              d="M5 3l14 7-6 1.6L9.5 19z"
              fill="white"
              stroke="black"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          {clicking && (
            <span className="absolute left-1 top-1 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-accent/50" />
          )}
        </div>
      </div>
    </section>
  );
}
