/**
 * Converter FAQ — the single source of truth.
 *
 * These entries feed both the visible accordion on /converter and the
 * FAQPage structured data in the root layout. Google only honours FAQ markup
 * when the same questions and answers are visible on the page, so the two
 * must never drift apart — hence one shared list rather than two copies.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How do I convert a file online for free?",
    a: "Drop your file onto FileFettle, select your output format, and click Convert. Your file is processed instantly inside your browser — no upload, no registration, completely free.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "Never. FileFettle uses WebAssembly and the Canvas API to process files entirely in your browser. Zero bytes of your data are ever sent to any server.",
  },
  {
    q: "What file formats can I convert?",
    a: "Over 80 formats across 5 categories — images (JPG, PNG, WebP, AVIF, HEIC, GIF, SVG, TIFF, BMP), audio (MP3, WAV, FLAC, OGG, AAC, M4A, OPUS, AIFF, WMA), video (MP4, WebM, MOV, AVI, MKV, WMV, MPEG), documents (PDF, DOCX, TXT, HTML, Markdown), and data (CSV, JSON, XML, YAML, XLSX, XLS, ODS, TOML, INI).",
  },
  {
    q: "Is there a file size limit?",
    a: "No. Since conversion runs in your browser, there's no server-side size limit. The only constraint is your device's available RAM — which handles most files without issue.",
  },
  {
    q: "Is FileFettle free to use?",
    a: "Yes — completely free, forever. No subscriptions, no paywalls, no ads, no tracking. Optional voluntary contributions help keep the project running.",
  },
  {
    q: "Why does my first video or audio conversion take a moment to start?",
    a: "Video and audio conversion uses FFmpeg compiled to WebAssembly. The first time you convert, your browser downloads a ~30 MB package — this only happens once and is then cached, so subsequent conversions start instantly.",
  },
  {
    q: "How do I convert an image to JPG, PNG, or WebP?",
    a: "Drop your image (supports JPG, PNG, HEIC, GIF, TIFF, BMP, SVG, AVIF and more), choose your output format — JPG, PNG, WebP, etc. — optionally resize or adjust quality, then click Convert.",
  },
];

/** The same list shaped as schema.org FAQPage `mainEntity` entries. */
export const faqStructuredData = () =>
  FAQ_ITEMS.map(item => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  }));
