import type { Metadata } from "next";

import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { GITHUB, ISSUES, DISCUSSIONS } from "@/components/links";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Where Reado is going: the calm place to review code, including the code AI writes. What's shipped, what's next (Reado Anywhere, pull-request review, the async review loop), and the bets we're exploring.",
  alternates: { canonical: "/roadmap" },
  openGraph: {
    type: "website",
    url: "https://reado.app/roadmap",
    title: "Reado — Roadmap",
    description: "What's shipped, what's next, and the bets we're exploring.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Reado" }],
  },
};

/** A row's status governs its dot colour — echoing the app itself, where a
 * resolved comment rail is green and an open one is the warm "marker" hue. */
type Status = "shipped" | "building" | "exploring";

interface Item {
  title: string;
  body: string;
}

interface Horizon {
  tag: string;
  heading: string;
  lede: string;
  status: Status;
  statusLabel: string;
  items: Item[];
}

const HORIZONS: Horizon[] = [
  {
    tag: "01 — Now",
    heading: "Shipped, today.",
    lede: "Reado is already a full read-first IDE. This is the ground the rest is built on.",
    status: "shipped",
    statusLabel: "shipped",
    items: [
      {
        title: "Read-first editor",
        body: "A calm reader, not a busy editor. Code is for reading first; everything else recedes.",
      },
      {
        title: "Durable, anchored comments",
        body: "Leave comments pinned to the code. They live in .reado and travel with git, so your review is a real artifact — not a lost thread.",
      },
      {
        title: "Resolved by your own agent",
        body: "Your local agent — Claude Code, Codex — reads the comments and commits the fixes. You review; it does the work.",
      },
      {
        title: "AI pre-review",
        body: "The agent drafts review comments on your changes. You approve each into a real comment, or discard it. The human curates.",
      },
      {
        title: "Anchored Q&A & semantic search",
        body: "Ask a question about a line; the answer becomes a durable, searchable note anchored to that code.",
      },
      {
        title: "Knowledge graph, LSP, git, MCP & extensions",
        body: "See a codebase's shape at a glance, with real language servers, git review, an MCP server, and an extensions marketplace.",
      },
    ],
  },
  {
    tag: "02 — Next",
    heading: "What we're building.",
    lede: "Three things that don't exist yet — and that an AI agent can't just do for you. They turn Reado into the review surface for AI-written code, wherever it's written.",
    status: "building",
    statusLabel: "in progress",
    items: [
      {
        title: "Reado Anywhere",
        body: "Review from your phone. Scan a QR code to pair over your local network — no account, no backend. On a VPN it reaches your desk from anywhere. Read the diff, leave comments, approve, kick off the agent.",
      },
      {
        title: "Pull-request review",
        body: "Review a whole branch or GitHub PR the read-first way: walk it file by file, leave anchored comments, and send the notes back as PR review comments.",
      },
      {
        title: "The async review loop",
        body: "Queue the comments and let your agent work — with its own subagents. Reado tracks the state and pings you, on your phone, when there's something to read and approve. The agent does the work; Reado holds the human loop.",
      },
    ],
  },
  {
    tag: "03 — Later",
    heading: "Bets we're exploring.",
    lede: "Further out, and less certain. The natural extensions once the three above are solid.",
    status: "exploring",
    statusLabel: "exploring",
    items: [
      {
        title: "Reado Anywhere, hosted",
        body: "A relay with sign-in, so remote review works without setting up a VPN — end-to-end encrypted, the server only forwards.",
      },
      {
        title: "Live team review",
        body: "Shared threads already travel via git. The new part: presence, assignments, and notifications — live, across a team.",
      },
      {
        title: "Self-hosted & SSO",
        body: "For teams whose code can't leave the building. On-prem sync, single sign-on, audit.",
      },
    ],
  },
];

const DOT: Record<Status, string> = {
  shipped: "var(--syn-string)",
  building: "var(--marker)",
  exploring: "var(--border-strong)",
};

export default function RoadmapPage() {
  return (
    <>
      <SmoothScroll />
      <Nav />

      <main id="top">
        {/* Hero */}
        <section className="gutter pt-[clamp(120px,20vh,196px)] pb-[clamp(56px,9vh,104px)]">
          <Reveal>
            <p className="font-mono text-[13px] tracking-[0.16em] text-marker uppercase">
              Roadmap
            </p>
            <h1 className="mt-5 max-w-[15ch] text-[clamp(44px,8.4vw,120px)] font-semibold leading-[0.9] tracking-[-0.04em] text-bright">
              Where Reado
              <br />
              is going<span className="text-marker">.</span>
            </h1>
            <p className="mt-7 max-w-[56ch] text-[clamp(16px,1.6vw,21px)] leading-[1.5] text-ink/80">
              Reado is the calm place to review code — including the code AI
              writes. Here&rsquo;s what&rsquo;s shipped, what&rsquo;s next, and
              the bets we&rsquo;re exploring. It&rsquo;s built in the open, so the
              list bends toward what people ask for.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={DISCUSSIONS}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-accent px-5 py-2.5 text-[15px] font-semibold text-on-accent transition-[filter] hover:brightness-110"
              >
                Help shape it →
              </a>
              <a
                href={ISSUES}
                target="_blank"
                rel="noopener"
                className="rounded-full border border-line-strong px-5 py-2.5 text-[15px] font-semibold text-ink transition-colors hover:border-marker/60"
              >
                Request a feature
              </a>
            </div>
          </Reveal>
        </section>

        {/* Horizons */}
        {HORIZONS.map((h) => (
          <section
            key={h.tag}
            className="gutter border-t border-line py-[clamp(56px,10vh,120px)]"
          >
            <div className="grid gap-x-16 gap-y-[clamp(36px,6vh,64px)] lg:grid-cols-[0.8fr_1.2fr]">
              {/* left: the horizon label */}
              <Reveal>
                <div className="lg:sticky lg:top-28">
                  <p className="font-mono text-[13px] tracking-[0.16em] text-faint uppercase">
                    {h.tag}
                  </p>
                  <h2 className="mt-4 text-[clamp(32px,5vw,64px)] font-semibold leading-[0.96] tracking-[-0.03em] text-bright">
                    {h.heading}
                  </h2>
                  <p className="mt-5 max-w-[42ch] text-[clamp(15px,1.4vw,18px)] leading-[1.55] text-muted">
                    {h.lede}
                  </p>
                </div>
              </Reveal>

              {/* right: the items */}
              <Reveal delay={120}>
                <ul className="m-0 list-none border-b border-line p-0">
                  {h.items.map((it) => (
                    <li
                      key={it.title}
                      className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-line py-[clamp(20px,3vh,32px)]"
                    >
                      <span
                        aria-hidden
                        className="mt-[0.62em] h-2.5 w-2.5 flex-none rounded-full"
                        style={{ background: DOT[h.status] }}
                      />
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="text-[clamp(20px,2.3vw,30px)] font-semibold tracking-[-0.02em] text-ink">
                            {it.title}
                          </h3>
                          <span className="font-mono text-[12px] tracking-wide text-faint">
                            {h.statusLabel}
                          </span>
                        </div>
                        <p className="mt-2.5 max-w-[58ch] text-[clamp(15px,1.4vw,17px)] leading-[1.6] text-muted">
                          {it.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        ))}

        {/* Help shape it */}
        <section className="gutter border-t border-line py-[clamp(96px,16vh,180px)]">
          <Reveal>
            <h2 className="max-w-[18ch] text-[clamp(40px,7vw,104px)] font-semibold leading-[0.9] tracking-[-0.04em] text-bright">
              Help shape it<span className="text-marker">.</span>
            </h2>
            <p className="mt-7 max-w-[52ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] text-ink/80">
              Reado is built in the open by one developer. The features that get
              built are the ones people ask for. Open an issue, vote with a
              thumbs-up, or tell us what your review workflow actually needs.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={DISCUSSIONS}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-accent px-5 py-2.5 text-[15px] font-semibold text-on-accent transition-[filter] hover:brightness-110"
              >
                Start a discussion →
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener"
                className="rounded-full border border-line-strong px-5 py-2.5 text-[15px] font-semibold text-ink transition-colors hover:border-marker/60"
              >
                Reado on GitHub
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
