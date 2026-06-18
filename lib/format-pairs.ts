import { CONVERSIONS, CATEGORIES } from "./formats";

export interface FormatPair {
  fromExt:   string;
  toExt:     string;
  fromLabel: string;
  toLabel:   string;
  categoryId: string;
  description: string;
  slug: string;
}

function getLabel(ext: string): string {
  for (const cat of CATEGORIES) {
    const fmt = cat.formats.find(f => f.ext === ext);
    if (fmt) return fmt.label;
  }
  return ext.toUpperCase();
}

export function getCategoryId(ext: string): string {
  for (const cat of CATEGORIES) {
    if (cat.formats.some(f => f.ext === ext)) return cat.id;
  }
  return "image";
}

export function getAllFormatPairs(): FormatPair[] {
  const pairs: FormatPair[] = [];
  for (const [fromExt, targets] of Object.entries(CONVERSIONS)) {
    for (const target of targets) {
      pairs.push({
        fromExt,
        toExt:       target.ext,
        fromLabel:   getLabel(fromExt),
        toLabel:     target.label,
        categoryId:  getCategoryId(fromExt),
        description: target.description,
        slug:        `${fromExt}-to-${target.ext}`,
      });
    }
  }
  return pairs;
}

export function getPairBySlug(slug: string): FormatPair | undefined {
  return getAllFormatPairs().find(p => p.slug === slug);
}

// Top high-traffic pairs to feature prominently
export const FEATURED_PAIRS = [
  "jpg-to-png", "jpg-to-webp", "png-to-jpg", "png-to-webp",
  "mp4-to-mp3", "mov-to-mp4", "avi-to-mp4", "mkv-to-mp4",
  "wav-to-mp3", "mp3-to-wav", "flac-to-mp3",
  "pdf-to-txt", "docx-to-pdf", "txt-to-pdf",
  "csv-to-json", "json-to-csv", "xlsx-to-csv",
  "heic-to-jpg", "webp-to-png", "svg-to-png",
];
