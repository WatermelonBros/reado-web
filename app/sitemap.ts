import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE = "https://reado.watermelon-studio.it";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/roadmap`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
