# Reado — marketing site

The marketing site for [Reado](https://github.com/WatermelonBros/reado), a calm,
read-first code IDE. Built with Next.js (App Router) and Tailwind CSS 4, with a
GSAP + Lenis scroll-driven product tour. Fully static — exported to `out/` and
served from Cloudflare Pages.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Build

```bash
pnpm build        # static export → ./out
```

## Deploy (Cloudflare Pages)

**Git integration (recommended):** connect this repo in the Cloudflare dashboard
and set:

- Build command: `pnpm build`
- Output directory: `out`

**Or from the CLI:**

```bash
pnpm build
npx wrangler pages deploy out
```

`wrangler.toml` already declares `pages_build_output_dir = "out"`.
