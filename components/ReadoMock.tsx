"use client";

/**
 * A colour- and layout-faithful reconstruction of the Reado IDE, rebuilt from
 * the app's own components (ActivityBar, FileTree, Tabs, Breadcrumb, the comment
 * thread popover and the status bar) and its OKLCH tokens. It plays the core
 * loop on a timer: you leave a note on a line, Claude Code and Codex answer and
 * commit, the thread resolves, repeat.
 */
import { useEffect, useState } from "react";

/* ---- icons, copied 1:1 from the app's atoms/icons.tsx ------------------- */
type IP = { className?: string; style?: React.CSSProperties };
const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const FilesIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <path d="M3 7a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.4.6L11.6 7H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
const SearchIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
const MessageIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <path d="M21 11.5a8.38 8.38 0 0 1-9 8.3 8.5 8.5 0 0 1-3.8-.9L3 20l1.1-3.3A8.38 8.38 0 0 1 12 3.5a8.38 8.38 0 0 1 9 8z" />
  </svg>
);
const OutlineIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <path d="M4 6h4M4 12h4M4 18h4" />
    <path d="M11 6h9M11 12h9M11 18h9" opacity="0.55" />
  </svg>
);
const GitBranchIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="8" r="2.5" />
    <path d="M6 8.5v7M18 10.5c0 4-6 2-6 5.5" />
  </svg>
);
const DocsIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M14 3v5h5M8 13h8M8 17h6" />
  </svg>
);
const GraphIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <circle cx="5" cy="6" r="2.2" />
    <circle cx="18" cy="5" r="2.2" />
    <circle cx="12" cy="18" r="2.2" />
    <path d="M7 7l4 9M16.5 6.8 13 16M7 6.4 16 5.2" />
  </svg>
);
const SettingsIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const ChevronIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const SendIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
  </svg>
);
const CloseIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const TerminalIcon = (p: IP) => (
  <svg {...svg} {...p} aria-hidden>
    <path d="M4 17l6-5-6-5M12 19h8" />
  </svg>
);

/** A folder/file glyph matching the app's FileIcon. */
function FileGlyph({ dir, expanded }: { dir: boolean; expanded?: boolean }) {
  return (
    <svg
      {...svg}
      width={15}
      height={15}
      className={`flex-none ${dir ? "text-accent" : "text-faint"}`}
      aria-hidden
    >
      {dir ? (
        <path
          d="M3 7a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.4.6L11.6 7H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          fill="currentColor"
          fillOpacity={expanded ? 0.12 : 0}
        />
      ) : (
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5" />
      )}
    </svg>
  );
}

/* ---- syntax-coloured source (src/main.tsx) ------------------------------ */
// Short keys (k/s/d/c/p) keep the CODE token table below readable line-by-line.
const SYN = {
  k: "var(--syn-keyword)",
  s: "var(--syn-string)",
  d: "var(--syn-definition)",
  c: "var(--syn-comment)",
  p: "var(--syn-punctuation)",
} as const;
type Tok = [string, keyof typeof SYN];
const CODE: Tok[][] = [
  [["// entry point — mount the React tree", "c"]],
  [["import ", "k"], ["{ createRoot } ", "p"], ["from ", "k"], ['"react-dom/client"', "s"], [";", "p"]],
  [["import ", "k"], ["{ App } ", "p"], ["from ", "k"], ['"./App"', "s"], [";", "p"]],
  [["import ", "k"], ['"./styles/app.css"', "s"], [";", "p"]],
  [],
  [["const ", "k"], ["el", "d"], [" = document.", "p"], ["getElementById", "d"], ['("root");', "p"]],
  [["createRoot", "d"], ["(el).", "p"], ["render", "d"], ["(", "p"]],
  [["  <App />", "d"]],
  [[");", "p"]],
];
const MARK_LINE = 5; // zero-based: the getElementById line

/* ---- file tree rows ----------------------------------------------------- */
type Node = { name: string; dir?: boolean; depth: number; expanded?: boolean; active?: boolean };
const TREE: Node[] = [
  { name: "src", dir: true, depth: 0, expanded: true },
  { name: "components", dir: true, depth: 1, expanded: true },
  { name: "Editor.tsx", depth: 2 },
  { name: "CommentThread.tsx", depth: 2 },
  { name: "lib", dir: true, depth: 1 },
  { name: "App.tsx", depth: 1 },
  { name: "main.tsx", depth: 1, active: true },
  { name: "styles", dir: true, depth: 0 },
  { name: "README.md", depth: 0 },
];

/* ---- the conversation that plays in the thread -------------------------- */
type Author = "you" | "claude-code" | "codex";
const THREAD: { author: Author; name: string; time: string; body: string }[] = [
  {
    author: "you",
    name: "You",
    time: "11:02",
    body: "getElementById can return null — guard it before render?",
  },
  {
    author: "claude-code",
    name: "Claude Code",
    time: "11:02",
    body: "Agreed. Throwing a clear error when #root is missing, then committing.",
  },
  {
    author: "codex",
    name: "Codex",
    time: "11:03",
    body: "Pulled the change — typecheck and tests are green.",
  },
];

/** A small knowledge graph (comments ↔ files ↔ specs ↔ docs). */
function GraphOverlay() {
  const nodes = [
    { x: 150, y: 110, r: 30, label: "main.tsx", fill: "var(--accent)" },
    { x: 330, y: 70, r: 22, label: "comment", fill: "var(--marker)" },
    { x: 470, y: 150, r: 24, label: "spec", fill: "var(--syn-control)" },
    { x: 300, y: 250, r: 26, label: "app.css", fill: "var(--syn-string)" },
    { x: 110, y: 280, r: 20, label: "note", fill: "var(--syn-number)" },
    { x: 520, y: 300, r: 22, label: "README", fill: "var(--syn-definition)" },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 3],
    [1, 2],
    [3, 5],
    [3, 4],
    [0, 4],
    [2, 5],
  ];
  return (
    <div
      aria-hidden
      className="reado-graph-overlay absolute inset-0 z-40 flex flex-col bg-canvas"
      style={{ opacity: 0, pointerEvents: "none" }}
    >
      <div className="flex flex-none items-center gap-2 border-b border-line bg-canvas px-4 py-2.5 text-xs text-faint">
        <span className="text-muted">Knowledge graph</span>
        <span className="ml-auto font-mono">6 nodes · 7 links</span>
      </div>
      <svg viewBox="0 0 640 380" className="min-h-0 flex-1" preserveAspectRatio="xMidYMid meet">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.fill} fillOpacity={0.16} />
            <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke={n.fill} strokeWidth={1.5} strokeOpacity={0.5} />
            <circle cx={n.x} cy={n.y} r={4.5} fill={n.fill} />
            <text
              x={n.x}
              y={n.y + n.r + 16}
              textAnchor="middle"
              fontSize="13"
              fontFamily="var(--font-mono)"
              fill="var(--text-muted)"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ReadoMock() {
  // How many thread messages are revealed; -1 = nothing yet, length = all done.
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const reduce =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(THREAD.length);
      setResolved(true);
      return;
    }

    let timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    function run() {
      timers.forEach(clearTimeout);
      timers = [];
      setShown(0);
      setTyping(false);
      setResolved(false);

      let t = 900;
      THREAD.forEach((m, i) => {
        if (m.author !== "you") {
          at(t, () => setTyping(true));
          t += 1050;
        }
        at(t, () => {
          setTyping(false);
          setShown(i + 1);
        });
        t += 1700;
      });
      at(t, () => setResolved(true));
      at(t + 4200, run);
    }
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line-strong bg-canvas text-[15px] shadow-[0_50px_120px_-50px_rgba(0,0,0,0.85)]"
      aria-label="The Reado interface"
    >
      {/* window titlebar (desktop app chrome) */}
      <div className="flex flex-none items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
        <span className="flex gap-2" aria-hidden>
          <i className="h-3 w-3 rounded-full bg-traffic-red" />
          <i className="h-3 w-3 rounded-full bg-traffic-amber" />
          <i className="h-3 w-3 rounded-full bg-traffic-green" />
        </span>
        <span className="ml-2 font-mono text-xs text-faint">
          reado — codebase-reader
        </span>
        <span className="ml-auto font-mono text-[11px] text-faint">main</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* activity bar */}
        <nav className="flex w-12 flex-none flex-col items-center justify-between border-r border-line bg-surface py-2">
          <div className="relative flex flex-col items-center gap-1">
            <span
              aria-hidden
              className="absolute top-1.5 left-0 h-7 w-0.5 rounded-full bg-accent"
            />
            {[FilesIcon, SearchIcon, MessageIcon, OutlineIcon, GitBranchIcon].map(
              (Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className={`relative grid h-10 w-10 place-items-center ${
                    i === 0 ? "text-ink" : "text-faint"
                  }`}
                  tabIndex={-1}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                  {i === 2 && (
                    <span className="absolute top-1 right-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-marker px-1 text-[9px] font-bold text-on-accent">
                      1
                    </span>
                  )}
                </button>
              ),
            )}
          </div>
          <div className="flex flex-col items-center gap-1 text-faint">
            {[DocsIcon, GraphIcon, SettingsIcon].map((Icon, i) => (
              <span key={i} className="grid h-10 w-10 place-items-center">
                <Icon className="h-5 w-5" />
              </span>
            ))}
          </div>
        </nav>

        {/* file tree */}
        <aside className="hidden w-60 flex-none flex-col overflow-hidden border-r border-line bg-canvas sm:flex">
          <div className="flex-1 overflow-y-auto py-2">
            {TREE.map((n) => (
              <div
                key={n.name + n.depth}
                style={{ paddingLeft: n.depth * 14 + 8 }}
                className={`flex w-full items-center gap-1.5 py-1.5 pr-3 text-left text-[14.5px] text-ink ${
                  n.active ? "bg-selection" : ""
                }`}
              >
                {n.dir ? (
                  <ChevronIcon
                    className={`h-[13px] w-[13px] flex-none text-faint ${
                      n.expanded ? "rotate-90" : ""
                    }`}
                  />
                ) : (
                  <span className="w-[13px] flex-none" />
                )}
                <FileGlyph dir={!!n.dir} expanded={n.expanded} />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {n.name}
                </span>
                {n.active && (
                  <span className="ml-auto h-[7px] w-[7px] flex-none rounded-full bg-marker" />
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* editor column */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* tabs */}
          <div className="flex h-11 flex-none items-stretch border-b border-line bg-surface">
            <div className="group flex max-w-[240px] items-center gap-2 border-r border-line bg-canvas pr-2 pl-4 text-[14.5px] text-ink shadow-[inset_0_2px_0_var(--accent)]">
              <span>main.tsx</span>
              <span className="grid h-[18px] w-[18px] place-items-center text-faint">
                <CloseIcon className="h-[13px] w-[13px]" />
              </span>
            </div>
          </div>

          {/* breadcrumb */}
          <nav className="flex flex-none items-center gap-0.5 border-b border-line bg-canvas px-4 py-2 text-xs text-faint">
            <span>src</span>
            <ChevronIcon className="h-[11px] w-[11px] opacity-60" />
            <span className="text-muted">main.tsx</span>
          </nav>

          {/* code */}
          <div
            className="flex-1 overflow-hidden py-4 font-mono text-base leading-[1.9]"
          >
            {CODE.map((line, i) => {
              const marked = i === MARK_LINE;
              return (
                <div
                  key={i}
                  className={`flex gap-5 px-4 whitespace-pre ${
                    marked
                      ? resolved
                        ? "bg-string-soft shadow-string"
                        : "bg-marker-soft shadow-marker"
                      : ""
                  }`}
                >
                  <span className="relative w-7 flex-none text-right text-faint/70 select-none">
                    {i + 1}
                    {marked && (
                      <span
                        aria-hidden
                        className={`absolute top-1/2 -right-[14px] h-2 w-2 -translate-y-1/2 rounded-full ${
                          resolved ? "bg-syn-string" : "bg-marker"
                        }`}
                      />
                    )}
                  </span>
                  <span>
                    {line.length === 0 ? (
                      " "
                    ) : (
                      line.map(([text, kind], j) => (
                        <span key={j} style={{ color: SYN[kind] }}>
                          {text}
                        </span>
                      ))
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* comment thread popover */}
          <div
            className="absolute top-[170px] right-5 z-30 flex w-[min(420px,calc(100%-2rem))] flex-col rounded-lg rounded-tl-none bg-thread shadow-elevated"
          >
            {/* header */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-line px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs text-ink">
                <span
                  className="inline-block h-2 w-2 flex-none rounded-full bg-syn-control"
                />
                Question
              </span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  resolved ? "text-syn-string" : "text-muted"
                }`}
              >
                {resolved ? "Done" : "Open"}
              </span>
              <span className="ml-auto font-mono text-xs text-faint">Line 6</span>
              <span className="grid h-6 w-6 place-items-center rounded-sm text-muted">
                <SendIcon className="h-3.5 w-3.5" />
              </span>
              <span className="grid h-6 w-6 place-items-center rounded-sm text-muted">
                <CloseIcon className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* messages */}
            <div className="flex max-h-[230px] min-h-[150px] flex-col gap-4 overflow-y-auto px-4 py-3">
              {THREAD.map((m, i) => (
                <div
                  key={i}
                  className={`msg ${i < shown ? "in" : ""} ${
                    i > 0 ? "border-t border-line pt-3" : ""
                  }`}
                  style={i >= shown ? { display: "none" } : undefined}
                >
                  <div className="mb-1 flex items-baseline gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        m.author === "you" ? "text-ink" : "text-accent"
                      }`}
                    >
                      {m.name}
                    </span>
                    <span className="text-[11px] text-faint">{m.time}</span>
                  </div>
                  <p className="text-[14.5px] leading-relaxed text-ink">{m.body}</p>
                </div>
              ))}
              {typing && (
                <div className="flex items-center gap-1.5 py-1" aria-label="typing">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-faint"
                      style={{
                        animation: "reado-blink 1s infinite",
                        animationDelay: `${d * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* footer */}
            <div className="border-t border-line p-2">
              <div className="rounded-md bg-surface px-2 py-1.5 text-sm text-faint">
                {resolved ? "Resolved · committed to main" : "Reply…"}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <span
                    className="grid h-3.5 w-3.5 place-items-center rounded-sm bg-accent text-on-accent text-[9px]"
                  >
                    ✓
                  </span>
                  Task
                </span>
                {resolved ? (
                  <span className="text-xs font-semibold text-syn-string">
                    ✓ Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="rounded-md px-2 py-1 text-xs text-muted">Delete</span>
                    <span
                      className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-on-accent"
                    >
                      Reply
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <GraphOverlay />
        </div>
      </div>

      {/* status bar */}
      <footer className="flex h-[26px] flex-none items-center justify-between border-t border-line bg-surface px-2 text-xs text-muted select-none">
        <div className="flex min-w-0 items-center gap-1">
          <span className="px-1">src/main.tsx</span>
          <span className="px-1">Ln 6, Col 18</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="hidden px-1 sm:inline">Spaces: 2</span>
          <span className="hidden px-1 sm:inline">UTF-8</span>
          <span className="hidden px-1 sm:inline">LF</span>
          <span className="hidden px-1 sm:inline">TypeScript React</span>
          <span className="inline-flex items-center gap-[5px] px-1">
            <GitBranchIcon className="h-[13px] w-[13px]" />
            main
          </span>
          <span className="inline-flex items-center gap-[5px] px-1">
            <MessageIcon className="h-[13px] w-[13px]" />
            {resolved ? 0 : 1} open
          </span>
          <span className="px-1 text-faint">
            {resolved ? "Agent · committed" : "Agent · idle"}
          </span>
          <span className="grid h-5 w-5 place-items-center text-faint">
            <TerminalIcon className="h-[13px] w-[13px]" />
          </span>
        </div>
      </footer>
    </div>
  );
}
