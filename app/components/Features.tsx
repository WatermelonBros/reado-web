"use client";

import { motion } from "motion/react";

const FEATURES = [
  {
    n: "01",
    title: "Read, don’t fight",
    body: "A focused reader: broad syntax highlighting, sticky scope, an outline, go-to-definition, find & replace. Built for understanding code you didn’t write — not wrestling an editor that wants you to type.",
  },
  {
    n: "02",
    title: "The comment is the unit",
    body: "Annotate any line or range. Comments are an external overlay that never touches your code, stored as plain Markdown under .reado/. They survive edits — a moved anchor re-finds its line, or becomes a visible orphan, never a wrong one.",
  },
  {
    n: "03",
    title: "You review, the AI commits",
    body: "Flag a comment as a task. Launch Claude Code or Codex from the built-in terminal; they read your review through the reado CLI, make the change, and mark it done. An inverted code review.",
  },
  {
    n: "04",
    title: "A knowledge base, not a folder",
    body: "Docs, specs and the notes you leave while reading, unified and searchable — with a graph that links comments, files, specs and docs. The understanding you build stays.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-[1120px] px-4 py-24 sm:py-32">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 max-w-[18ch] font-display text-[clamp(30px,4.6vw,52px)] leading-[1.04] tracking-tight text-ink"
      >
        Built to understand, then resolve.
      </motion.h2>

      <div className="flex flex-col">
        {FEATURES.map((f, i) => (
          <motion.article
            key={f.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`grid items-start gap-x-10 gap-y-3 border-t border-line py-10 md:grid-cols-[auto_1fr_1.4fr] ${
              i === FEATURES.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="font-mono text-sm text-[var(--color-marker)]">{f.n}</span>
            <h3 className="font-display text-[24px] leading-tight tracking-tight text-ink sm:text-[28px]">
              {f.title}
            </h3>
            <p className="max-w-[58ch] text-[17px] leading-relaxed text-muted">{f.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
