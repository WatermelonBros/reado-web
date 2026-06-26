"use client";

/**
 * A 1:1, state-driven recreation of the Reado desktop IDE for the homepage
 * workflow tour. Every beat is just a different `IdeState`; the same render
 * drives all of them, so the scroll timeline can scrub forward and back. Visuals
 * reuse the app's exact Tailwind theme keys (bg-surface, text-ink, syn-*, marker,
 * accent…) which already live in globals.css — so it matches the app, not a mock.
 */
import type { ReactNode } from "react";
import { DEMO_LINES, DEMO_TREE } from "./demoFile";

// ---- State model -----------------------------------------------------------

export type Tool = "files" | "review";
export type PropType = "bug" | "refactor" | "performance" | "question" | "note";
export type PropState = "proposed" | "task" | "note" | "discarded";

export interface Proposal {
  id: string;
  type: PropType;
  line: number;
  body: string;
  state: PropState;
  /** Author of the proposal: the first reviewer or the second-opinion agent. */
  who?: "agent" | "second";
}

export interface RouteEntry {
  file: string;
  reason: string;
  state: "queued" | "in_review" | "reviewed";
}

export interface ReviewState {
  phase: "empty" | "planning" | "review" | "loop";
  objective?: string;
  reviewed?: number;
  total?: number;
  current?: { file: string; reason: string };
  route?: RouteEntry[];
  proposals?: Proposal[];
  loop?: { resolved: number; total: number; status: "running" | "finished" };
}

export interface IdeState {
  tool: Tool;
  file: string;
  busy?: boolean;
  /** Open comment markers in the gutter (line numbers). */
  markers?: number[];
  /** Resolved markers (rendered done/accent). */
  resolved?: number[];
  /** A selected line range in the editor (manual-comment beat). */
  selectLines?: [number, number];
  /** A line that pulses (a proposal just anchored there). */
  pulseLine?: number;
  /** An inline comment composer shown under a line (manual review). */
  composer?: { line: number; text: string };
  terminalOpen?: boolean;
  terminalLines?: TermLine[];
  review: ReviewState;
}

export interface TermLine {
  kind: "cmd" | "out" | "agent" | "prompt";
  text: string;
}

export const INITIAL_STATE: IdeState = {
  tool: "files",
  file: "cart.ts",
  review: { phase: "empty" },
};

// ---- Per-type colour (matches the app's TYPE_COLOR) ------------------------

const TYPE_VAR: Record<PropType, string> = {
  bug: "var(--marker)",
  refactor: "var(--syn-keyword)",
  performance: "var(--syn-number)",
  question: "var(--syn-control)",
  note: "var(--text-muted)",
};
const TYPE_LABEL: Record<PropType, string> = {
  bug: "bug",
  refactor: "refactor",
  performance: "performance",
  question: "question",
  note: "note",
};

// ---- Icons (18px, stroke, currentColor) ------------------------------------

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
  outline: ic(<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />),
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
  sparkle: ic(<path d="M12 4l1.7 4.8L18.5 10.5l-4.8 1.7L12 17l-1.7-4.8L5.5 10.5l4.8-1.7z" />),
  settings: ic(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>,
  ),
};

// ---- Activity bar ----------------------------------------------------------

function ActivityBar({ tool }: { tool: Tool }) {
  const items = [
    { id: "files", icon: Icons.files, active: tool === "files" },
    { id: "search", icon: Icons.search, active: false },
    { id: "comments", icon: Icons.comments, active: false },
    { id: "outline", icon: Icons.outline, active: false },
    { id: "review", icon: Icons.route, active: tool === "review" },
    { id: "git", icon: Icons.git, active: false },
  ];
  return (
    <nav className="flex w-12 flex-none flex-col items-center border-r border-line bg-surface py-2">
      <div className="relative flex flex-1 flex-col items-center gap-1">
        {items.map((it) => (
          <span
            key={it.id}
            data-act={it.id}
            className={`relative grid h-10 w-10 place-items-center ${it.active ? "text-ink" : "text-faint"}`}
          >
            {it.active && <span className="absolute left-0 h-7 w-0.5 rounded-full bg-accent" />}
            {it.icon}
          </span>
        ))}
      </div>
      <span className="grid h-10 w-10 place-items-center text-faint">{Icons.settings}</span>
    </nav>
  );
}

// ---- File tree -------------------------------------------------------------

function FileTree({ active }: { active: string }) {
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
              !n.dir && n.name === active ? "bg-selection text-ink" : "text-muted"
            }`}
            style={{ paddingLeft: 8 + n.depth * 14 }}
          >
            <span className="w-3 text-faint">{n.dir ? "▾" : ""}</span>
            <span className="truncate">{n.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Review Guide panel (mirrors the redesigned app panel) -----------------

function Chip({
  children,
  tone = "muted",
  act,
}: {
  children: ReactNode;
  tone?: "muted" | "accent";
  act?: string;
}) {
  const cls = tone === "accent" ? "text-accent" : "text-muted";
  return (
    <span
      data-act={act}
      className={`rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] ${cls}`}
    >
      {children}
    </span>
  );
}

function ReviewPanel({ review }: { review: ReviewState }) {
  const { phase } = review;
  const reviewed = review.reviewed ?? 0;
  const total = review.total ?? 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-none items-center gap-2 border-b border-line px-2 py-1.5">
        <span className="text-faint">{Icons.route}</span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-muted">
          Review this branch vs main
        </span>
        {review.phase === "planning" && (
          <span className="flex items-center gap-1 text-[10px] text-accent">
            <span className="text-accent">{Icons.sparkle}</span> Agent working…
          </span>
        )}
      </div>

      {phase === "empty" ? (
        <div className="flex flex-1 flex-col gap-3 px-4 py-5">
          <div>
            <h3 className="text-xs font-semibold text-ink">Guided Pair Review</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-faint">
              The agent proposes a route, reviews file by file and drafts comments; you
              decide. Nothing is final until you approve it.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-[11px] text-faint">
            Objective
            <span
              data-act="objective"
              className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink"
            >
              {review.objective ?? "Bug risk"}
            </span>
          </div>
          <span
            data-act="start"
            className="rounded-md bg-accent px-3 py-1.5 text-center text-xs font-medium text-on-accent"
          >
            Review current changes
          </span>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Progress */}
          <div className="flex-none px-3 pt-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="tabular-nums text-muted">
                {reviewed}/{total} reviewed
              </span>
              <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] text-muted">
                {review.objective ?? "Bug risk"}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300"
                style={{ width: total ? `${(reviewed / total) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* Current file card */}
          {review.current && (
            <section className="flex-none px-3 pt-3">
              <div className="rounded-lg border border-line bg-surface/50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-faint">
                  Current file
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-ink">
                  {review.current.file}
                </p>
                <p className="mt-1 text-xs leading-relaxed break-words text-muted">
                  {review.current.reason}
                </p>
                <div className="mt-3">
                  <span
                    data-act="review-file"
                    className="block rounded-md bg-accent px-3 py-2 text-center text-xs font-medium text-on-accent"
                  >
                    Review this file
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Chip>Mark reviewed</Chip>
                  <Chip>Skip</Chip>
                  {(review.proposals?.length ?? 0) > 0 && <Chip act="second">Second opinion</Chip>}
                </div>
              </div>
            </section>
          )}

          {phase === "planning" && (
            <p className="px-3 py-4 text-[11px] leading-relaxed text-faint">
              Planning the route — the agent is reading the change…
            </p>
          )}

          {/* Proposals */}
          {(review.proposals?.length ?? 0) > 0 && (
            <section className="mt-3 flex-none">
              <p className="px-3 pb-1 text-[10px] uppercase tracking-wide text-faint">Proposals</p>
              <ul className="m-0 list-none p-0">
                {review.proposals!.map((p) => (
                  <li
                    key={p.id}
                    data-prop={p.id}
                    className={`border-b border-line/60 px-3 py-2.5 ${
                      p.state === "discarded" ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className="h-2 w-2 flex-none rounded-full"
                        style={{ background: TYPE_VAR[p.type] }}
                      />
                      <span
                        className="font-medium uppercase tracking-wide"
                        style={{ color: TYPE_VAR[p.type] }}
                      >
                        {TYPE_LABEL[p.type]}
                      </span>
                      {p.who === "second" && (
                        <span className="rounded bg-overlay px-1 text-[9px] uppercase text-faint">
                          2nd opinion
                        </span>
                      )}
                      <span className="ml-auto text-faint">cart.ts:{p.line}</span>
                    </div>
                    <p className="mt-1 text-xs leading-snug break-words text-ink">{p.body}</p>
                    {p.state === "proposed" && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Chip tone="accent" act={`approve-${p.id}`}>
                          Approve
                        </Chip>
                        <Chip>As note</Chip>
                        <Chip>Edit</Chip>
                        <Chip act={`discard-${p.id}`}>Discard</Chip>
                      </div>
                    )}
                    {p.state === "task" && (
                      <p className="mt-1 text-[10px] text-accent">✓ task created</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Route queue */}
          {(review.route?.length ?? 0) > 0 && (
            <section className="mt-3 flex-none">
              <p className="flex items-center gap-1 px-3 pb-1 text-[10px] uppercase tracking-wide text-faint">
                <span className="h-3 w-3">{Icons.route}</span> Route
              </p>
              <ul className="m-0 list-none p-0">
                {review.route!.map((e) => (
                  <li key={e.file}>
                    <span
                      className={`flex w-full items-center gap-2 border-l-2 py-1.5 pl-3 pr-3 text-[11px] ${
                        e.state === "in_review"
                          ? "border-accent bg-surface text-ink"
                          : "border-transparent text-muted"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{e.file}</span>
                      <span
                        className={`flex-none text-[10px] ${
                          e.state === "reviewed" ? "text-accent" : "text-faint"
                        }`}
                      >
                        {e.state === "reviewed"
                          ? "done"
                          : e.state === "in_review"
                            ? "reviewing"
                            : "queued"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Footer */}
          <div className="mt-auto flex-none border-t border-line px-3 py-2.5">
            {review.loop ? (
              <div className="mb-2 rounded-md border border-line bg-surface px-2 py-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={review.loop.status === "finished" ? "text-accent" : "text-muted"}>
                    {Icons.sparkle}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate ${
                      review.loop.status === "finished" ? "text-accent" : "text-muted"
                    }`}
                  >
                    {review.loop.status === "finished" ? "Resolved — review the changes" : "Resolving…"}
                  </span>
                  <span className="text-[10px] tabular-nums text-faint">
                    {review.loop.resolved}/{review.loop.total}
                  </span>
                </div>
                <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-overlay">
                  <div
                    className={`h-full rounded-full ${review.loop.status === "finished" ? "bg-accent" : "bg-muted"}`}
                    style={{ width: `${(review.loop.resolved / review.loop.total) * 100}%` }}
                  />
                </div>
              </div>
            ) : null}
            <span
              data-act="send"
              className="block rounded-md bg-accent px-3 py-1.5 text-center text-xs font-medium text-on-accent"
            >
              Send {(review.proposals ?? []).filter((p) => p.state === "task").length} confirmed tasks
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Editor ----------------------------------------------------------------

function Editor({ state }: { state: IdeState }) {
  const { markers = [], resolved = [], selectLines, pulseLine, composer } = state;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-none items-stretch border-b border-line bg-surface text-[13px]">
        <div className="flex items-center gap-2 border-r border-line bg-canvas px-3 py-1.5 text-ink">
          <span className="h-2 w-2 rounded-sm bg-syn-keyword/70" />
          {state.file}
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-canvas font-mono text-[13px] leading-[1.65]">
        <div className="py-3">
          {DEMO_LINES.map((line, i) => {
            const n = i + 1;
            const isMarker = markers.includes(n);
            const isResolved = resolved.includes(n);
            const selected =
              selectLines && n >= selectLines[0] && n <= selectLines[1];
            const pulse = pulseLine === n;
            return (
              <div key={n}>
                <div
                  data-line={n}
                  className={`relative flex ${selected ? "bg-selection" : ""} ${
                    pulse ? "bg-marker-soft" : ""
                  }`}
                >
                  <span className="relative w-12 flex-none select-none pr-3 text-right text-faint">
                    {(isMarker || isResolved) && (
                      <span
                        className={`absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${
                          isResolved ? "bg-accent" : "bg-marker"
                        }`}
                      />
                    )}
                    {!isMarker && !isResolved && n}
                  </span>
                  <code className="flex-1 whitespace-pre pr-4 text-ink">{line}</code>
                </div>
                {composer?.line === n && (
                  <div className="ml-12 my-1 rounded-md border border-line bg-surface p-2 text-[12px]">
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] text-faint">
                      <span className="h-2 w-2 rounded-full bg-marker" /> NEW COMMENT
                    </div>
                    <span className="text-ink">{composer.text}</span>
                    <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-ink align-middle" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Terminal state={state} />
    </div>
  );
}

// ---- Terminal --------------------------------------------------------------

function Terminal({ state }: { state: IdeState }) {
  if (!state.terminalOpen) {
    return (
      <div className="flex flex-none items-center gap-2 border-t border-line bg-surface px-3 py-1.5 text-[11px] text-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-syn-string" /> Terminal
      </div>
    );
  }
  const lines = state.terminalLines ?? [];
  return (
    <div className="flex h-[148px] flex-none flex-col border-t border-line bg-canvas">
      <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-1 text-[11px] text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-syn-string" /> Terminal — claude
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-3 py-2 font-mono text-[12px] leading-[1.6]">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "cmd"
                ? "text-ink"
                : l.kind === "agent"
                  ? "text-accent"
                  : l.kind === "prompt"
                    ? "text-syn-string"
                    : "text-muted"
            }
          >
            {l.kind === "cmd" && <span className="text-faint">$ </span>}
            {l.kind === "agent" && <span>● </span>}
            {l.text}
          </div>
        ))}
        <span className="inline-block h-3.5 w-2 animate-pulse bg-ink/70 align-middle" />
      </div>
    </div>
  );
}

// ---- Root ------------------------------------------------------------------

export function ReadoIde({ state = INITIAL_STATE }: { state?: IdeState }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-line-strong bg-canvas text-ink shadow-[var(--shadow)]">
      <div className="relative flex h-9 flex-none items-center border-b border-line bg-canvas px-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-traffic-red" />
          <span className="h-3 w-3 rounded-full bg-traffic-amber" />
          <span className="h-3 w-3 rounded-full bg-traffic-green" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 flex justify-center">
          <span className="rounded-md px-2 py-0.5 text-[12px] text-muted">reado — {state.file}</span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <ActivityBar tool={state.tool} />
        <aside className="w-[280px] flex-none border-r border-line bg-surface">
          {state.tool === "files" ? (
            <FileTree active={state.file} />
          ) : (
            <ReviewPanel review={state.review} />
          )}
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <Editor state={state} />
        </main>
      </div>
    </div>
  );
}
