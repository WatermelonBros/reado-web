import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fully static site → export to `out/` for Cloudflare Pages (no Workers runtime).
  output: "export",
  // Cloudflare serves the assets directly; skip the Next image optimizer.
  images: { unoptimized: true },
};

export default nextConfig;
