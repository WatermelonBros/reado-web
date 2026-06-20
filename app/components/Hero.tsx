"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/* The hero is Reado itself, alive — a faithful replica of the app (dark theme):
   a file being read, a comment anchored to a line range, and the thread where
   the reviewer and two agents work the fix and resolve it. Styling mirrors the
   real components (tokens, the connector that flows into the box, the thread). */

// Neutral surface shared by the connector and the thread box (from the app's
// ACCENT(): a quiet tone of the theme, so they read as one piece).
const SURFACE = "color-mix(in oklab, var(--color-muted) 16%, var(--color-bg-2))";

type Tone = "user" | "claude" | "codex";
const THREAD: { who: string; tone: Tone; time: string; body: string }[] = [
  { who: "You", tone: "user", time: "11:02", body: "getElementById can return null — guard it before render?" },
  { who: "Claude Code", tone: "claude", time: "11:02", body: "Agreed. Adding a null check and committing." },
  { who: "Codex", tone: "codex", time: "11:03", body: "Pulled it — tests still green." },
];

// Code, tokenised by semantic role (k=keyword, s=string, d=definition, p=plain).
type Tok = [string, "k" | "s" | "d" | "p"];
const CODE: Tok[][] = [
  [["import ", "k"], ["{ createRoot } ", "p"], ["from ", "k"], ['"react-dom/client"', "s"], [";", "p"]],
  [["import ", "k"], ["{ App } ", "p"], ["from ", "k"], ['"./App"', "s"], [";", "p"]],
  [],
  [["const ", "k"], ["el", "d"], [" = document.", "p"], ["getElementById", "d"], ['("root");', "p"]],
  [["createRoot", "d"], ["(el).", "p"], ["render", "d"], ["(<App />);", "p"]],
];
const SYN: Record<string, string> = {
  k: "text-[var(--color-syn-keyword)]",
  s: "text-[var(--color-syn-string)]",
  d: "text-[var(--color-syn-def)]",
  p: "text-ink/85",
};

function Bar({ children }: { children: React.ReactNode }) {
  return <span className="flex flex-col items-center gap-5 py-3 text-faint">{children}</span>;
}
const icon = "h-[18px] w-[18px]";

export function Hero() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? THREAD.length : 0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setShown(0);
      setTyping(false);
      let t = 900;
      THREAD.forEach((m, i) => {
        if (m.tone !== "user") {
          timers.push(setTimeout(() => setTyping(true), t));
          t += 950;
        }
        timers.push(
          setTimeout(() => {
            setTyping(false);
            setShown(i + 1);
          }, t),
        );
        t += 1500;
      });
      timers.push(setTimeout(run, t + 4200));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  const resolved = shown >= THREAD.length;

  return (
    <section className="px-4 pt-10 pb-12 sm:pt-16">
      <div className="mx-auto max-w-[1120px]">
        <p className="mb-6 text-center font-mono text-xs tracking-[0.2em] text-faint uppercase">
          Read-first code IDE
        </p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-xl border border-line-2 bg-bg"
          style={{ boxShadow: "var(--shadow)" }}
        >
          {/* title bar */}
          <div className="flex items-center gap-2 border-b border-line bg-bg-2 px-4 py-2.5">
            <span className="flex gap-1.5">
              <i className="h-3 w-3 rounded-full" style={{ background: "#e8675b" }} />
              <i className="h-3 w-3 rounded-full" style={{ background: "#e3b341" }} />
              <i className="h-3 w-3 rounded-full" style={{ background: "#5fb865" }} />
            </span>
            <span className="ml-2 text-xs text-faint">codebase-reader — Reado</span>
          </div>

          <div className="flex">
            {/* activity bar */}
            <div className="flex-none border-r border-line bg-bg-2">
              <Bar>
                <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                <span className="relative text-[var(--color-marker)]">
                  <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 11.5a8.38 8.38 0 0 1-9 8 9 9 0 0 1-4-1L3 20l1.5-4a8.38 8.38 0 0 1-1-4 8.5 8.5 0 0 1 17 0z"/></svg>
                  <i className="absolute -top-1 -right-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-[var(--color-marker)] text-[8px] font-bold text-bg">1</i>
                </span>
                <svg className={`${icon} text-accent`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M8.5 6H14a4 4 0 0 1 4 4M6 8.5v7"/></svg>
              </Bar>
            </div>

            {/* editor + thread */}
            <div className="relative min-h-[440px] min-w-0 flex-1">
              <div className="border-b border-line px-4 py-2 text-xs text-faint">
                src <span className="px-1 text-faint/60">›</span> main.tsx
              </div>

              <div className="py-3 font-mono text-[13.5px] leading-7">
                {CODE.map((line, i) => {
                  const anchored = i === 3 || i === 4;
                  return (
                    <div
                      key={i}
                      className="flex gap-3 px-2"
                      style={
                        anchored
                          ? { background: "var(--color-marker)", backgroundColor: "color-mix(in oklch, var(--color-marker) 14%, transparent)", boxShadow: "inset 2px 0 0 var(--color-marker)" }
                          : undefined
                      }
                    >
                      <span className="w-6 flex-none pr-1 text-right text-faint/60 select-none">{i + 1}</span>
                      <span className="whitespace-pre">
                        {line.length === 0
                          ? " "
                          : line.map(([tx, c], j) => (
                              <span key={j} className={SYN[c]}>{tx}</span>
                            ))}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* connector: a short neutral run from the anchored band into the box */}
              <div
                className="pointer-events-none absolute hidden sm:block"
                style={{ left: "210px", top: "150px", width: "calc(100% - 210px - 16px)", height: "6px" }}
              >
                <div className="h-1.5 w-full rounded-full" style={{ background: SURFACE }} />
              </div>

              {/* thread popover — faithful to CommentThread */}
              <div
                className="absolute right-4 z-10 flex w-[min(360px,calc(100%-2rem))] flex-col"
                style={{ top: "120px", background: SURFACE, borderRadius: "0 8px 8px 8px", boxShadow: "var(--shadow)" }}
              >
                <div className="flex items-center gap-2 border-b border-line px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink">
                    <span className="h-2 w-2 rounded-full bg-muted" /> Note
                  </span>
                  <span className="text-xs text-muted">{resolved ? "Done" : "Open"}</span>
                  <span className="ml-auto font-mono text-xs text-faint">Lines 4–5</span>
                </div>

                <div className="space-y-3 px-3.5 py-3">
                  <AnimatePresence initial={false}>
                    {THREAD.slice(0, shown).map((m, i) => (
                      <motion.div
                        key={i}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className={i > 0 ? "border-t border-line pt-3" : ""}
                      >
                        <div className="mb-0.5 flex items-baseline gap-2">
                          <span className={`text-xs font-semibold ${m.tone === "user" ? "text-ink" : "text-accent"}`}>
                            {m.who}
                          </span>
                          <span className="text-[11px] text-faint">{m.time}</span>
                        </div>
                        <p className="m-0 text-[13px] leading-relaxed text-ink">{m.body}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {typing && (
                    <div className="flex items-center gap-1.5" aria-hidden>
                      {[0, 1, 2].map((d) => (
                        <motion.i
                          key={d}
                          className="h-1.5 w-1.5 rounded-full bg-faint"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-line p-2">
                  <div className="rounded-md bg-bg px-2 py-1.5 text-sm text-faint">Reply…</div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-muted">
                      <span className="grid h-3.5 w-3.5 place-items-center rounded-[3px] bg-accent text-[9px] text-on-accent">✓</span>
                      Task
                    </span>
                    <AnimatePresence mode="wait">
                      {resolved ? (
                        <motion.span
                          key="done"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="inline-flex items-center gap-1.5 font-medium text-[var(--color-syn-string)]"
                        >
                          ✓ Resolved · committed to main
                        </motion.span>
                      ) : (
                        <motion.span key="btns" exit={{ opacity: 0 }} className="flex items-center gap-1">
                          <span className="rounded-md px-2 py-1 text-muted">Delete</span>
                          <span className="rounded-md bg-accent px-2.5 py-1 font-semibold text-on-accent">Reply</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* status bar */}
          <div className="flex items-center gap-4 border-t border-line bg-bg-2 px-4 py-1.5 text-[11px] text-faint">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M8.5 6H14a4 4 0 0 1 4 4M6 8.5v7"/></svg>
              main
            </span>
            <span>1 open</span>
            <span className="ml-auto">{resolved ? "Agent: committed" : "Agent idle"}</span>
          </div>
        </motion.div>

        <p className="mx-auto mt-9 max-w-[44ch] text-center font-display text-[24px] leading-snug text-muted sm:text-[28px]">
          You read and annotate. The AI <span className="text-ink">reviews</span> and{" "}
          <span className="text-ink">commits</span>.
        </p>
      </div>
    </section>
  );
}
