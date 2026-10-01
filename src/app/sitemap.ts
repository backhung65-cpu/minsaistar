import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const products = await listProducts({ publishedOnly: true });
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/prompts`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/membership`, changeFrequency: "weekly", priority: 0.9 },
    ...products.map((p) => ({ url: `${base}/prompts/${p.slug}`, lastModified: p.updated_at, priority: 0.8 })),
  ];
}
