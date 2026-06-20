import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — prerendered HTML for SEO; deploys to Cloudflare Pages as is.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
