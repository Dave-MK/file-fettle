import type { MetadataRoute } from "next";
import { getAllFormatPairs, FEATURED_PAIRS } from "@/lib/format-pairs";

const BASE = "https://file-fettle.vercel.app";

function url(path: string, priority: number, freq: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") {
  return { url: `${BASE}${path}`, lastModified: new Date(), changeFrequency: freq, priority };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const formatPairs = getAllFormatPairs();

  const pairPages = formatPairs.map(p => ({
    url:             `${BASE}/convert/${p.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly" as const,
    // Featured pairs get higher priority
    priority: FEATURED_PAIRS.includes(p.slug) ? 0.8 : 0.6,
  }));

  return [
    url("/",                      1.0, "weekly"),
    url("/tools",                 0.9, "monthly"),
    url("/tools/pdf-merge",       0.8, "monthly"),
    url("/tools/pdf-split",       0.8, "monthly"),
    url("/tools/image-resizer",   0.8, "monthly"),
    url("/tools/image-compressor",0.8, "monthly"),
    url("/tools/file-hash",       0.7, "monthly"),
    url("/tools/base64",          0.7, "monthly"),
    ...pairPages,
  ];
}
