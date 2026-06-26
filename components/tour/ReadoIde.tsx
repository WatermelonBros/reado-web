"use client";

/**
 * A 1:1, state-driven recreation of the Reado desktop IDE for the homepage
 * workflow tour. Everything is declarative: the same <ReadoIde state={…}/> render
 * drives every beat, so the scroll timeline can scrub forward and back simply by
 * changing `state`. Visuals reuse the app's exact Tailwind theme keys (bg-surface,
 * text-ink, syn-*, marker, …) which already live in globals.css.
 *
 * Phase 1: faithful chrome (macOS titlebar, activity bar, file tree, tabs) + the
 * editor with the demo TypeScript file, syntax-highlighted. The Review Guide
 * sidebar, terminal stream, proposals, fake cursor and the GSAP timeline land in
 * the following phases.
 */
import type { ReactNode } from "react";

// ---- The demo project ------------------------------------------------------

export const DEMO_TREE = [
  { name: "src", dir: true, depth: 0, open: true },
  { name: "cart.ts", dir: false, depth: 1, active: true },
  { name: "discounts.ts", dir: false, depth: 1 },
  { name: "types.ts", dir: false, depth: 1 },
  { name: "index.ts", dir: false, depth: 1 },
  { name: "package.json", dir: false, depth: 0 },
] as const;

/** Which side panel the activity bar has selected. */
export type Tool = "files" | "review";

export interface IdeState {
  tool: Tool;
  /** Open editor tab (filename). */
  file: string;
  /** 1-based lines that carry a comment marker in the gutter. */
  markers?: number[];
}

export const INITIAL_STATE: IdeState = { tool: "files", file: "cart.ts" };

// ---- Icons (16px, stroke, currentColor) — matched to the app ---------------

const ic = (d: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px]"
    aria-hidden="true"
  >
    {d}
  </svg>
);

const Icons = {
  files: ic(<path d="M4 5h6l2 2h8v12H4z" />),
  search: ic(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>,
  ),
  comments: ic(<path d="M5 5h14v10H8l-3 3z" />),
  outline: ic(
    <>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </>,
  ),
  route: ic(
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6" />
    </>,
  ),
  git: ic(
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="9" r="2" />
      <path d="M6 8v8M18 11a6 6 0 0 1-6 6H8" />
    </>,
  ),
  settings: ic(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>,
  ),
};

// ---- Demo file content, hand-highlighted (perfect + zero-cost) -------------

const K = ({ children }: { children: ReactNode }) => (
  <span className="text-syn-keyword">{children}</span>
);
const C = ({ children }: { children: ReactNode }) => (
  <span className="text-syn-control">{children}</span>
);
const D = ({ children }: { children: ReactNode }) => (
  <span className="text-syn-definition">{children}</span>
);
const S = ({ children }: { children: ReactNode }) => (
  <span className="text-syn-string">{children}</span>
);
const N = ({ children }: { children: ReactNode }) => (
  <span className="text-syn-number">{children}</span>
);
const M = ({ children }: { children: ReactNode }) => (
  <span className="text-syn-comment">{children}</span>
);
const P = ({ children }: { children: ReactNode }) => (
  <span className="text-syn-punctuation">{children}</span>
);

/** cart.ts — a believable TS file with a subtle money bug for the review. */
const DEMO_LINES: ReactNode[] = [
  <>
    <K>import</K> <P>{"{"}</P> CartItem<P>,</P> Discount <P>{"}"}</P> <K>from</K>{" "}
    <S>&quot;./types&quot;</S>
    <P>;</P>
  </>,
  <>
    <K>import</K> <P>{"{"}</P> DISCOUNTS <P>{"}"}</P> <K>from</K>{" "}
    <S>&quot;./discounts&quot;</S>
    <P>;</P>
  </>,
  <>&nbsp;</>,
  <>
    <M>{"// Apply a discount code to the cart and return the amount due."}</M>
  </>,
  <>
    <K>export</K> <K>function</K> <D>applyDiscount</D>
    <P>(</P>items<P>:</P> CartItem<P>[],</P> code<P>:</P> <D>string</D>
    <P>)</P><P>:</P> <D>number</D> <P>{"{"}</P>
  </>,
  <>
    {"  "}
    <K>const</K> total <P>=</P> items<P>.</P>
    <D>reduce</D>
    <P>(</P>
    <P>(</P>sum<P>,</P> i<P>)</P> <C>=&gt;</C> sum <P>+</P> i<P>.</P>price <P>*</P> i
    <P>.</P>qty<P>,</P> <N>0</N>
    <P>);</P>
  </>,
  <>
    {"  "}
    <K>const</K> rule <P>=</P> DISCOUNTS<P>[</P>code<P>];</P>
  </>,
  <>
    {"  "}
    <C>if</C> <P>(</P>
    <P>!</P>rule<P>)</P> <C>return</C> total<P>;</P>
  </>,
  <>&nbsp;</>,
  <>
    {"  "}
    <M>{"// percent off, applied to the running total"}</M>
  </>,
  <>
    {"  "}
    <C>return</C> total <P>-</P> total <P>*</P> rule<P>.</P>percent<P>;</P>
  </>,
  <>
    <P>{"}"}</P>
  </>,
];

// ---- Component -------------------------------------------------------------

function ActivityBar({ tool }: { tool: Tool }) {
  const items: { id: string; icon: ReactNode; active?: boolean }[] = [
    { id: "files", icon: Icons.files, active: tool === "files" },
    { id: "search", icon: Icons.search },
    { id: "comments", icon: Icons.comments },
    { id: "outline", icon: Icons.outline },
    { id: "review", icon: Icons.route, active: tool === "review" },
    { id: "git", icon: Icons.git },
  ];
  return (
    <nav className="flex w-12 flex-none flex-col items-center border-r border-line bg-surface py-2">
      <div className="relative flex flex-1 flex-col items-center gap-1">
        {items.map((it) => (
          <span
            key={it.id}
            data-act={it.id}
            className={`grid h-10 w-10 place-items-center ${
              it.active ? "text-ink" : "text-faint"
            }`}
          >
            {it.active && (
              <span className="absolute left-0 h-7 w-0.5 rounded-full bg-accent" />
            )}
            {it.icon}
          </span>
        ))}
      </div>
      <span className="grid h-10 w-10 place-items-center text-faint">{Icons.settings}</span>
    </nav>
  );
}

function FileTree() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-faint">
        Explorer
      </div>
      <ul className="m-0 list-none p-0 text-[13px]">
        {DEMO_TREE.map((n) => (
          <li
            key={n.name}
            data-file={n.dir ? undefined : n.name}
            className={`flex items-center gap-1.5 py-1 pr-2 ${
              "active" in n && n.active
                ? "bg-selection text-ink"
                : "text-muted"
            }`}
            style={{ paddingLeft: 8 + n.depth * 14 }}
          >
            <span className="text-faint">
              {n.dir ? "▾" : ""}
            </span>
            <span className="truncate">{n.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Editor({ file, markers = [] }: { file: string; markers?: number[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tab bar */}
      <div className="flex flex-none items-stretch border-b border-line bg-surface text-[13px]">
        <div className="flex items-center gap-2 border-r border-line bg-canvas px-3 py-1.5 text-ink">
          <span className="h-2 w-2 rounded-sm bg-syn-keyword/70" />
          {file}
        </div>
      </div>
      {/* Code */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-canvas font-mono text-[13px] leading-[1.65]">
        <div className="py-3">
          {DEMO_LINES.map((line, i) => {
            const n = i + 1;
            const marked = markers.includes(n);
            return (
              <div key={n} data-line={n} className="group relative flex">
                {/* gutter */}
                <span className="relative w-12 flex-none select-none pr-3 text-right text-faint">
                  {marked && (
                    <span className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-marker" />
                  )}
                  {!marked && n}
                </span>
                <code className="flex-1 whitespace-pre pr-4 text-ink">{line}</code>
              </div>
            );
          })}
        </div>
      </div>
      {/* Terminal strip (collapsed placeholder until phase 2) */}
      <div className="flex flex-none items-center gap-2 border-t border-line bg-surface px-3 py-1.5 text-[11px] text-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-syn-string" />
        Terminal
      </div>
    </div>
  );
}

export function ReadoIde({ state = INITIAL_STATE }: { state?: IdeState }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-line-strong bg-canvas text-ink shadow-[var(--shadow)]">
      {/* macOS titlebar */}
      <div className="relative flex h-9 flex-none items-center border-b border-line bg-canvas px-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-traffic-red" />
          <span className="h-3 w-3 rounded-full bg-traffic-amber" />
          <span className="h-3 w-3 rounded-full bg-traffic-green" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 flex justify-center">
          <span className="rounded-md px-2 py-0.5 text-[12px] text-muted">
            reado — {state.file}
          </span>
        </div>
      </div>
      {/* Body: activity bar · sidebar · editor */}
      <div className="flex min-h-0 flex-1">
        <ActivityBar tool={state.tool} />
        <aside className="w-[244px] flex-none border-r border-line bg-surface">
          {state.tool === "files" ? <FileTree /> : null}
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <Editor file={state.file} markers={state.markers} />
        </main>
      </div>
    </div>
  );
}
