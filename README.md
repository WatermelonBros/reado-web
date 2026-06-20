# reado-web

Marketing site for [Reado](https://github.com/WatermelonBros/reado) — a calm,
read-first code IDE. Built with Next.js (static export), Tailwind CSS 4 and
Framer Motion, in Reado's dark theme.

Live: **https://reado.watermelon-studio.it**

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static export → ./out
```

## Deploy (Cloudflare Pages)

Connect this repo to Cloudflare Pages:

- **Build command**: `pnpm build`
- **Output directory**: `out`
- **Custom domain**: `reado.watermelon-studio.it` (CNAME → the Pages project)

Download buttons read the latest signed release from the Reado repo's GitHub
API at runtime, so they stay correct without redeploying.

— by [Watermelon Studio](https://watermelon-studio.it)
