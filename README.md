# Reado — marketing site

The marketing site for [Reado](https://github.com/WatermelonBros/reado), a calm,
read-first code IDE. Built with Next.js (App Router) and Tailwind CSS 4, with a
GSAP + Lenis scroll-driven product tour. Fully static — exported to `out/` and
served from Cloudflare Workers (static assets).

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Build

```bash
pnpm build        # static export → ./out
```

## Deploy (Cloudflare Workers static assets)

The static export in `out/` is served by a Worker. `wrangler.toml` declares the
assets directory (`[assets] directory = "./out"`), so deploying is:

```bash
pnpm build
npx wrangler deploy
```

**Git integration:** connect this repo in the Cloudflare dashboard with build
command `pnpm build` and the same `wrangler.toml` — Cloudflare builds and
uploads `out/` on push.
