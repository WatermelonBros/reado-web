/**
 * Small, static product vignettes used in the stacked mobile layout, so each
 * capability shows the real Reado UI (not just a wall of copy). Built from the
 * same OKLCH tokens as the live mock; no timers, no animation.
 */

const frame =
  "overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_30px_70px_-50px_rgba(0,0,0,0.85)]";

const C = {
  k: "var(--syn-keyword)",
  s: "var(--syn-string)",
  d: "var(--syn-definition)",
  c: "var(--syn-comment)",
  p: "var(--syn-punctuation)",
} as const;
type Tok = [string, keyof typeof C];

/** Read — a focused code crop with the annotated line. */
export function CodeVignette() {
  const lines: Tok[][] = [
    [["// mount the React tree", "c"]],
    [["import ", "k"], ["{ createRoot } ", "p"], ["from ", "k"], ['"react-dom/client"', "s"]],
    [["const ", "k"], ["el", "d"], [" = document.", "p"], ["getElementById", "d"], ['("root")', "p"]],
    [["createRoot", "d"], ["(el).", "p"], ["render", "d"], ["(<App />)", "p"]],
  ];
  return (
    <div className={`${frame} py-3 font-mono text-[13px] leading-[1.95]`}>
      {lines.map((line, i) => (
        <div
          key={i}
          className={`flex gap-4 px-4 whitespace-pre ${
            i === 2 ? "bg-marker-soft shadow-marker" : ""
          }`}
        >
          <span className="w-4 flex-none text-right text-faint/60 select-none">{i + 1}</span>
          <span className="overflow-hidden">
            {line.map(([t, k], j) => (
              <span key={j} style={{ color: C[k] }}>
                {t}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Review — a compact comment thread, resolved by the agent. */
export function ThreadVignette() {
  return (
    <div className={`${frame} bg-surface p-4`}>
      <div className="overflow-hidden rounded-lg rounded-tl-none bg-thread">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5 text-xs">
          <span className="h-2 w-2 rounded-full bg-syn-control" />
          <span className="text-ink">Question</span>
          <span className="text-syn-string">Done</span>
          <span className="ml-auto font-mono text-faint">Line 6</span>
        </div>
        <div className="space-y-3 px-4 py-3 text-[13.5px]">
          <div>
            <p className="text-xs font-semibold text-ink">You</p>
            <p className="text-ink">getElementById can return null — guard it?</p>
          </div>
          <div className="border-t border-line pt-3">
            <p className="text-xs font-semibold text-accent">Claude Code</p>
            <p className="text-ink">Added the guard and committed to main.</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-line px-3 py-2 text-xs">
          <span className="text-muted">Task</span>
          <span className="text-syn-string">✓ committed</span>
        </div>
      </div>
    </div>
  );
}

/** Remember — the knowledge graph. */
export function GraphVignette() {
  const nodes = [
    { x: 130, y: 70, r: 24, label: "main.tsx", fill: "var(--accent)" },
    { x: 300, y: 50, r: 18, label: "comment", fill: "var(--marker)" },
    { x: 400, y: 130, r: 20, label: "spec", fill: "var(--syn-control)" },
    { x: 250, y: 175, r: 22, label: "app.css", fill: "var(--syn-string)" },
    { x: 95, y: 185, r: 16, label: "note", fill: "var(--syn-number)" },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 3],
    [1, 2],
    [3, 4],
    [0, 4],
    [2, 3],
  ];
  return (
    <div className={`${frame} aspect-[16/9] bg-surface`}>
      <svg viewBox="0 0 460 230" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
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
            <circle cx={n.x} cy={n.y} r={4} fill={n.fill} />
            <text x={n.x} y={n.y + n.r + 15} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export const VIGNETTES = [CodeVignette, ThreadVignette, GraphVignette];
