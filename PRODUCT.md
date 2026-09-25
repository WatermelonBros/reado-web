# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **individual software developers** who work with AI coding agents (Claude
Code, Codex, Copilot) every day. They arrive on the site to understand what Reado is,
download it, try it on their own code, and — if it earns its place — pay for Pro with
their own card.

Secondary: **team leads and companies** who buy seats for a team. They read pricing,
manage members, seats, projects and invoices from the site's account area, and often
do not use the app themselves.

## Product Purpose

Reado is a read-first code IDE: the primary experience is reading code, and the
primary action is leaving durable comments anchored to precise lines. An AI agent
resolves those comments. The site exists to explain that loop, get the app
downloaded, and — for the paid tier — let people sign in, buy Pro, and manage their
account and team.

Success: a developer who lands on the site understands the loop within the first
screen, downloads the app, and later finds signing in, upgrading and managing a team
straightforward.

## Positioning

"Reado is the IDE for reading code: you read and leave comments anchored to lines, the
agent (Claude Code, Codex, Copilot) resolves them. Inverted code review, open source,
data stays local." (confirmed 2026-09-24)

## Operating Context

- The app is a desktop app (macOS, Linux, Windows), downloaded from GitHub Releases.
- The core app is open source (MIT, `github.com/WatermelonBros/reado`); the official
  build adds closed Pro modules. Accounts are optional; the app works fully without one.
- Signing in from the app opens this site's `/sign-in` in the system browser and
  returns to the app when done. `/account` is where people manage their account; team
  management and buying Pro will live here too.
- Self-hosted customers run the service without this site.

## Capabilities and Constraints

- Static export (Next.js `output: "export"`), deployed on Cloudflare. Pages that need
  the account call the Reado service from the browser (`NEXT_PUBLIC_API_URL`).
- Sign-in: GitHub or email + password. Two plans: free and Pro. Self-hosted is
  "contact us".
- Undecided: prices, billing provider UI details, team-management scope.

## Brand Commitments

- Name **Reado**, by **Watermelon Studio** (`watermelon-studio.it`). Domain
  `reado.watermelon-studio.it`. Logo: `public/icon.png`.
- Personality carried over from the product: **calm, precise, trustworthy**. Quiet,
  confident voice; never loud, never playful for its own sake.
- The site is a website, not the app: it does not reuse the app's interface
  components or form controls. The in-page product mock stays faithful to the app.

## Evidence on Hand

- Real GitHub numbers (downloads, stars, releases) from the public repository.
- Real product: the app itself, its screenshots and the loop GIF
  (`docs/media/reado-loop.gif` in the app repo).
- No testimonials, customer logos, press or benchmarks exist. Do not invent any.

## Product Principles

1. **Explain the loop before anything else** — read, annotate, the agent resolves.
2. **Honest by default** — real numbers only, no fabricated proof; state what is free
   and what is paid plainly.
3. **The account is optional** — never gate the download or the product behind
   sign-in; Pro is an addition, not a toll.
4. **Developer first, buyer second** — the developer's path (understand, download,
   try) comes first; the team buyer's path (pricing, seats, invoices) is complete but
   does not crowd it.

## Accessibility & Inclusion

WCAG AA as the floor (same as the app); reduced motion respected.
