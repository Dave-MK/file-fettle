export type Badge = "recommended" | "fastest" | "smallest" | "best-quality" | "most-compatible";

export interface Format {
  ext: string;
  label: string;
  mime: string;
}

export interface TargetFormat extends Format {
  badges: Badge[];
  description: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  accept: string;
  formats: Format[];
}

export const BADGE_META: Record<Badge, { label: string; cls: string; icon: string }> = {
  recommended:       { label: "Recommended",      cls: "badge-purple", icon: "★" },
  fastest:           { label: "Fastest",          cls: "badge-yellow", icon: "⚡" },
  smallest:          { label: "Smallest",         cls: "badge-green",  icon: "↓" },
  "best-quality":    { label: "Best Quality",     cls: "badge-blue",   icon: "◆" },
  "most-compatible": { label: "Most Compatible",  cls: "badge-green",  icon: "✓" },
};

// ── Image targets (canvas-encodable formats only) ──────────────────────────
const IMG_TARGETS = {
  png:  { ext: "png",  label: "PNG",  mime: "image/png"  },
  jpg:  { ext: "jpg",  label: "JPG",  mime: "image/jpeg" },
  webp: { ext: "webp", label: "WebP", mime: "image/webp" },
  avif: { ext: "avif", label: "AVIF", mime: "image/avif" },
};

export const CONVERSIONS: Record<string, TargetFormat[]> = {
  // ── Images ────────────────────────────────────────────────────────────────
  png: [
    { ...IMG_TARGETS.webp, badges: ["recommended", "smallest"],        description: "Best compression with excellent quality. Ideal for web." },
    { ...IMG_TARGETS.jpg,  badges: ["most-compatible", "fastest"],     description: "Universal support. Great for photos without transparency." },
    { ...IMG_TARGETS.avif, badges: ["best-quality", "smallest"],       description: "Next-gen format. Smallest file size at high quality." },
  ],
  jpg: [
    { ...IMG_TARGETS.webp, badges: ["recommended", "smallest"],        description: "Same visual quality at 25–35% smaller file size." },
    { ...IMG_TARGETS.png,  badges: ["best-quality"],                   description: "Lossless. Preserves every pixel perfectly." },
    { ...IMG_TARGETS.avif, badges: ["smallest"],                       description: "Up to 50% smaller than JPG at equivalent quality." },
  ],
  jpeg: [
    { ...IMG_TARGETS.webp, badges: ["recommended", "smallest"],        description: "Same visual quality at 25–35% smaller file size." },
    { ...IMG_TARGETS.png,  badges: ["best-quality"],                   description: "Lossless. Preserves every pixel perfectly." },
    { ...IMG_TARGETS.avif, badges: ["smallest"],                       description: "Up to 50% smaller than JPG at equivalent quality." },
  ],
  webp: [
    { ...IMG_TARGETS.png,  badges: ["recommended", "best-quality"],    description: "Lossless. Best for editing or transparency." },
    { ...IMG_TARGETS.jpg,  badges: ["most-compatible"],                description: "Widest compatibility across all platforms." },
    { ...IMG_TARGETS.avif, badges: ["smallest"],                       description: "Even smaller than WebP at similar quality." },
  ],
  avif: [
    { ...IMG_TARGETS.webp, badges: ["recommended"],                    description: "Slightly larger but broader browser support." },
    { ...IMG_TARGETS.png,  badges: ["best-quality"],                   description: "Lossless. Perfect for editing." },
    { ...IMG_TARGETS.jpg,  badges: ["most-compatible"],                description: "Universal support everywhere." },
  ],
  gif: [
    { ...IMG_TARGETS.webp, badges: ["recommended", "smallest"],        description: "Supports animation and is far smaller than GIF." },
    { ...IMG_TARGETS.png,  badges: ["best-quality"],                   description: "Lossless static export of first frame." },
    { ...IMG_TARGETS.jpg,  badges: ["most-compatible"],                description: "Static export — widest compatibility." },
  ],
  bmp: [
    { ...IMG_TARGETS.png,  badges: ["recommended", "best-quality"],    description: "Lossless with much smaller file size than BMP." },
    { ...IMG_TARGETS.webp, badges: ["smallest"],                       description: "Excellent compression with great quality." },
    { ...IMG_TARGETS.jpg,  badges: ["most-compatible"],                description: "Much smaller. Universal compatibility." },
    { ...IMG_TARGETS.avif, badges: [],                                 description: "Next-gen format. Excellent quality and compression." },
  ],
  svg: [
    { ...IMG_TARGETS.png,  badges: ["recommended", "most-compatible"], description: "Rasterise to PNG. Widely supported everywhere." },
    { ...IMG_TARGETS.webp, badges: ["smallest"],                       description: "Rasterise to WebP. Compact for web use." },
    { ...IMG_TARGETS.jpg,  badges: [],                                 description: "Rasterise to JPG. Loses transparency." },
  ],
  tiff: [
    { ...IMG_TARGETS.png,  badges: ["recommended", "best-quality"],    description: "Lossless PNG — same fidelity, widely compatible." },
    { ...IMG_TARGETS.jpg,  badges: ["smallest", "most-compatible"],    description: "Compressed. Plays everywhere." },
    { ...IMG_TARGETS.webp, badges: ["smallest"],                       description: "Modern compression. Excellent quality-to-size ratio." },
    { ...IMG_TARGETS.avif, badges: [],                                 description: "Next-gen. Smallest file size." },
  ],
  tif: [
    { ...IMG_TARGETS.png,  badges: ["recommended", "best-quality"],    description: "Lossless PNG — same fidelity, widely compatible." },
    { ...IMG_TARGETS.jpg,  badges: ["smallest", "most-compatible"],    description: "Compressed. Plays everywhere." },
    { ...IMG_TARGETS.webp, badges: ["smallest"],                       description: "Modern compression. Excellent quality-to-size ratio." },
    { ...IMG_TARGETS.avif, badges: [],                                 description: "Next-gen. Smallest file size." },
  ],
  ico: [
    { ...IMG_TARGETS.png,  badges: ["recommended", "most-compatible"], description: "Full quality PNG. Use for favicons and icons." },
    { ...IMG_TARGETS.webp, badges: ["smallest"],                       description: "Compact modern format." },
    { ...IMG_TARGETS.jpg,  badges: [],                                 description: "JPEG export — loses transparency." },
  ],
  heic: [
    { ...IMG_TARGETS.jpg,  badges: ["recommended", "most-compatible"], description: "Universal JPEG — works on every device." },
    { ...IMG_TARGETS.png,  badges: ["best-quality"],                   description: "Lossless. Perfect quality." },
    { ...IMG_TARGETS.webp, badges: ["smallest"],                       description: "Modern web format. Excellent compression." },
  ],

  // ── Audio ──────────────────────────────────────────────────────────────────
  mp3: [
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Lossless PCM. Perfect for further editing." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["recommended", "smallest"],       description: "Open format. Smaller than MP3 at same quality." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: [],                                description: "Lossless compressed. Best archival quality." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: ["most-compatible"],               description: "Better than MP3. Native on iOS/macOS/Android." },
    { ext: "m4a",  label: "M4A",  mime: "audio/mp4",   badges: [],                                description: "AAC in an MPEG-4 container. Apple ecosystem." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "State-of-the-art codec. Best quality per kilobit." },
  ],
  wav: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible", "smallest"], description: "Dramatically smaller. Works everywhere." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Open format. Compact with good quality." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless compression. Preserves all audio data." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Better compression than MP3. Great mobile support." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Smallest at equivalent quality. Modern codec." },
    { ext: "aiff", label: "AIFF", mime: "audio/aiff",  badges: [],                                description: "Uncompressed PCM in Apple container." },
  ],
  flac: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "smallest", "most-compatible"], description: "Much smaller. Universal playback support." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["fastest"],                       description: "Uncompressed PCM. Instant decode." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Open format. Excellent compression." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Excellent quality at small file sizes." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Best quality per kilobit." },
  ],
  ogg: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal support across all devices." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Lossless PCM." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: [],                                description: "Lossless compressed archive quality." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: ["smallest"],                      description: "Better quality-to-size ratio than MP3." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Excellent compression." },
  ],
  aac: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Widest device and player support." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Lossless uncompressed." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Open format. Good compression." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: [],                                description: "Lossless archive copy." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "State-of-the-art codec. Excellent at low bitrates." },
  ],
  m4a: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Widest compatibility. Near-identical quality." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Lossless uncompressed." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Compact open format." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: [],                                description: "Lossless archive quality." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Raw AAC — same quality, smaller container." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Best quality per kilobit." },
  ],
  opus: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal playback on all devices and players." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Lossless uncompressed PCM." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: [],                                description: "Lossless archive copy." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Good compression and broad support." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: [],                                description: "Vorbis in Ogg container." },
  ],
  aiff: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "smallest", "most-compatible"], description: "Massively smaller. Plays everywhere." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["most-compatible"],               description: "Uncompressed PCM — cross-platform standard." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless compressed. Smaller than AIFF." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Great compression. iOS/macOS native." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "State-of-the-art. Best quality at low bitrates." },
  ],
  aif: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "smallest", "most-compatible"], description: "Massively smaller. Plays everywhere." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["most-compatible"],               description: "Uncompressed PCM — cross-platform standard." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless compressed. Smaller than AIFF." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Great compression. iOS/macOS native." },
  ],

  // ── Video ──────────────────────────────────────────────────────────────────
  mp4: [
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["recommended", "smallest"],       description: "Open web format. Excellent browser support and compression." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: ["best-quality"],                  description: "Apple QuickTime. Best for macOS / iOS workflows." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: ["most-compatible"],               description: "Classic Windows container. Wide legacy support." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: [],                               description: "Flexible open container. Supports all codecs." },
    { ext: "flv",  label: "FLV",  mime: "video/x-flv",       badges: [],                               description: "Flash Video. Legacy web streaming format." },
    { ext: "ogv",  label: "OGV",  mime: "video/ogg",         badges: [],                               description: "Open source Theora/Vorbis container." },
  ],
  mov: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal format. Works on every device and platform." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open format for web delivery." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                               description: "Legacy Windows format. Wide compatibility." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: [],                               description: "Flexible container for archiving." },
    { ext: "flv",  label: "FLV",  mime: "video/x-flv",       badges: [],                               description: "Flash Video container." },
  ],
  avi: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible", "smallest"], description: "Modern, compact, plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Web-optimised open format." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                               description: "Apple QuickTime format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                 description: "High-quality flexible container." },
  ],
  mkv: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal compatibility. Great compression." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact web format." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                               description: "Apple QuickTime." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                               description: "Legacy Windows format." },
    { ext: "flv",  label: "FLV",  mime: "video/x-flv",       badges: [],                               description: "Flash Video container." },
  ],
  webm: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal. Works on every device and player." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                               description: "Apple QuickTime." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                               description: "Legacy Windows format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                 description: "High-quality archival container." },
  ],
  flv: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Modern universal format. Plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: [],                               description: "Flexible archival container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                               description: "Legacy Windows format." },
  ],
  ogv: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal. Plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Modern open format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: [],                               description: "Flexible container." },
  ],
  m4v: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Standard MP4 — plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Open web format with great compression." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: [],                               description: "Flexible open container." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                               description: "Apple QuickTime format." },
  ],
  "3gp": [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Standard MP4. Plays on all modern devices." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                               description: "Legacy Windows format." },
  ],

  // ── Documents ──────────────────────────────────────────────────────────────
  pdf: [
    { ext: "txt",  label: "TXT",  mime: "text/plain",        badges: ["recommended", "fastest"],        description: "Extract all text. Tiny, instantly readable." },
    { ext: "html", label: "HTML", mime: "text/html",         badges: [],                               description: "Extract text with basic structure." },
    { ext: "md",   label: "MD",   mime: "text/markdown",     badges: [],                               description: "Extract as Markdown — clean and readable." },
  ],
  docx: [
    { ext: "pdf",  label: "PDF",  mime: "application/pdf",   badges: ["recommended"],                   description: "Preserves formatting. Universal read-only format." },
    { ext: "txt",  label: "TXT",  mime: "text/plain",        badges: ["fastest", "smallest"],           description: "Plain text extraction. Fastest and smallest." },
    { ext: "html", label: "HTML", mime: "text/html",         badges: [],                               description: "Preserves headings and basic formatting." },
    { ext: "md",   label: "MD",   mime: "text/markdown",     badges: [],                               description: "Clean Markdown with headings and bold preserved." },
  ],
  doc: [
    { ext: "pdf",  label: "PDF",  mime: "application/pdf",   badges: ["recommended"],                   description: "Preserves formatting. Universal." },
    { ext: "txt",  label: "TXT",  mime: "text/plain",        badges: ["fastest", "smallest"],           description: "Extract plain text." },
    { ext: "html", label: "HTML", mime: "text/html",         badges: [],                               description: "Basic formatted output." },
  ],
  txt: [
    { ext: "pdf",  label: "PDF",  mime: "application/pdf",   badges: ["recommended"],                   description: "Professional, printable, shareable document." },
    { ext: "docx", label: "DOCX", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", badges: [], description: "Editable Word document." },
    { ext: "html", label: "HTML", mime: "text/html",         badges: ["fastest"],                       description: "Simple web page." },
    { ext: "md",   label: "MD",   mime: "text/markdown",     badges: [],                               description: "Plain Markdown file." },
  ],
  html: [
    { ext: "pdf",  label: "PDF",  mime: "application/pdf",   badges: ["recommended"],                   description: "Print-ready document preserving layout." },
    { ext: "txt",  label: "TXT",  mime: "text/plain",        badges: ["fastest", "smallest"],           description: "Strip all HTML — extract plain text." },
    { ext: "md",   label: "MD",   mime: "text/markdown",     badges: [],                               description: "Convert to Markdown markup." },
  ],
  htm: [
    { ext: "pdf",  label: "PDF",  mime: "application/pdf",   badges: ["recommended"],                   description: "Print-ready document." },
    { ext: "txt",  label: "TXT",  mime: "text/plain",        badges: ["fastest", "smallest"],           description: "Strip HTML — extract plain text." },
    { ext: "md",   label: "MD",   mime: "text/markdown",     badges: [],                               description: "Convert to Markdown." },
  ],
  md: [
    { ext: "html", label: "HTML", mime: "text/html",         badges: ["recommended"],                   description: "Render Markdown to styled HTML." },
    { ext: "pdf",  label: "PDF",  mime: "application/pdf",   badges: [],                               description: "Printable PDF from your Markdown." },
    { ext: "txt",  label: "TXT",  mime: "text/plain",        badges: ["smallest"],                      description: "Strip all Markdown — plain text output." },
    { ext: "docx", label: "DOCX", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", badges: [], description: "Editable Word document." },
  ],
  markdown: [
    { ext: "html", label: "HTML", mime: "text/html",         badges: ["recommended"],                   description: "Render Markdown to styled HTML." },
    { ext: "pdf",  label: "PDF",  mime: "application/pdf",   badges: [],                               description: "Printable PDF." },
    { ext: "txt",  label: "TXT",  mime: "text/plain",        badges: ["smallest"],                      description: "Strip Markdown — plain text." },
  ],
  rtf: [
    { ext: "txt",  label: "TXT",  mime: "text/plain",        badges: ["recommended", "fastest"],        description: "Extract plain text from RTF." },
    { ext: "pdf",  label: "PDF",  mime: "application/pdf",   badges: [],                               description: "Printable PDF." },
    { ext: "html", label: "HTML", mime: "text/html",         badges: [],                               description: "Basic HTML output." },
  ],

  // ── Data ──────────────────────────────────────────────────────────────────
  csv: [
    { ext: "json", label: "JSON", mime: "application/json",  badges: ["recommended"],                   description: "Structured data. Ideal for APIs and JavaScript." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                               description: "Extensible markup. Enterprise and legacy system support." },
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: ["most-compatible"], description: "Open in Excel with formatting." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                       description: "Tab-separated. Useful when values contain commas." },
  ],
  json: [
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["recommended", "most-compatible"], description: "Flat table. Opens in any spreadsheet app." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                               description: "Hierarchical markup for enterprise systems." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: ["fastest"],                       description: "Human-readable config format." },
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: [], description: "Open in Excel directly." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                       description: "Tab-separated values." },
  ],
  xml: [
    { ext: "json", label: "JSON", mime: "application/json",  badges: ["recommended", "smallest"],       description: "Compact modern alternative to XML." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: [],                               description: "Flat table (first-level elements)." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                               description: "Human-readable YAML." },
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: [], description: "Open in Excel." },
  ],
  yaml: [
    { ext: "json", label: "JSON", mime: "application/json",  badges: ["recommended"],                   description: "Machine-friendly. Works with any API or toolchain." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                               description: "Enterprise/legacy system format." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: [],                               description: "Flat table format." },
  ],
  yml: [
    { ext: "json", label: "JSON", mime: "application/json",  badges: ["recommended"],                   description: "Machine-friendly. Works with any API or toolchain." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                               description: "Enterprise/legacy system format." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: [],                               description: "Flat table format." },
  ],
  xlsx: [
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["recommended", "most-compatible", "smallest"], description: "Universal. Opens in any app or code." },
    { ext: "json", label: "JSON", mime: "application/json",  badges: [],                               description: "Structured data for APIs and apps." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                               description: "XML data structure." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                       description: "Tab-separated. Avoids comma ambiguity." },
  ],
  tsv: [
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["recommended", "most-compatible"], description: "Comma-separated. Universal spreadsheet import." },
    { ext: "json", label: "JSON", mime: "application/json",  badges: [],                               description: "Structured data for APIs." },
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: [], description: "Open in Excel." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                               description: "XML structure." },
  ],

  // ── Image aliases ─────────────────────────────────────────────────────────
  jfif: [
    { ...IMG_TARGETS.webp, badges: ["recommended", "smallest"],    description: "Same visual quality at 25–35% smaller file size." },
    { ...IMG_TARGETS.jpg,  badges: ["most-compatible"],            description: "Standard JPEG — universal support." },
    { ...IMG_TARGETS.png,  badges: ["best-quality"],               description: "Lossless. Perfect quality." },
    { ...IMG_TARGETS.avif, badges: ["smallest"],                   description: "Next-gen format. Excellent compression." },
  ],
  jpe: [
    { ...IMG_TARGETS.webp, badges: ["recommended", "smallest"],    description: "Same visual quality at 25–35% smaller file size." },
    { ...IMG_TARGETS.jpg,  badges: ["most-compatible"],            description: "Standard JPEG — universal support." },
    { ...IMG_TARGETS.png,  badges: ["best-quality"],               description: "Lossless. Perfect quality." },
    { ...IMG_TARGETS.avif, badges: ["smallest"],                   description: "Next-gen format. Excellent compression." },
  ],
  heif: [
    { ...IMG_TARGETS.jpg,  badges: ["recommended", "most-compatible"], description: "Universal JPEG — works on every device." },
    { ...IMG_TARGETS.png,  badges: ["best-quality"],               description: "Lossless. Perfect quality." },
    { ...IMG_TARGETS.webp, badges: ["smallest"],                   description: "Modern web format. Excellent compression." },
    { ...IMG_TARGETS.avif, badges: [],                             description: "Next-gen. Excellent quality-to-size ratio." },
  ],

  // ── New audio sources ─────────────────────────────────────────────────────
  wma: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal support. Works on every device and player." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless archive copy." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Better compression than MP3 at equivalent quality." },
    { ext: "m4a",  label: "M4A",  mime: "audio/mp4",   badges: [],                                description: "AAC in MPEG-4 container. Apple ecosystem." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Open format. Compact with good quality." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "State-of-the-art codec. Best quality per kilobit." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: [],                                description: "Lossless uncompressed PCM." },
  ],
  amr: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal support. Works everywhere." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Better compression, great mobile support." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Uncompressed PCM — full fidelity." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Compact open format." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Excellent at low bitrates." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: [],                                description: "Lossless compressed archive." },
  ],
  m4r: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal format. Plays everywhere." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Native Apple codec — small and high quality." },
    { ext: "m4a",  label: "M4A",  mime: "audio/mp4",   badges: [],                                description: "MPEG-4 audio — same quality, editable." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Lossless uncompressed." },
  ],
  mka: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal support across all devices." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless — preserves all audio data." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Excellent quality at small file sizes." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Compact open format." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Best quality per kilobit." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: [],                                description: "Uncompressed PCM." },
  ],
  mp2: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Modern MPEG audio. Far better compression." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Better quality-to-size ratio than MP2." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless archive copy." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Open format. Excellent compression." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "State-of-the-art codec." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: [],                                description: "Uncompressed PCM." },
  ],
  oga: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal support across all devices." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Lossless PCM." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: [],                                description: "Lossless compressed archive quality." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: ["smallest"],                      description: "Better quality-to-size ratio than MP3." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Excellent compression." },
  ],

  // ── New video sources ─────────────────────────────────────────────────────
  wmv: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal format. Works on every device." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "High-quality flexible container." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows container." },
  ],
  mpg: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible", "smallest"], description: "Modern, compact, plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Open web format with great compression." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "High-quality flexible container." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
  ],
  mpeg: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible", "smallest"], description: "Modern, compact, plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Open web format with great compression." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "High-quality flexible container." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
  ],
  ts: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal. Works on every device and player." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Flexible archival container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
  ],
  m2ts: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal. Works on every device and player." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Flexible archival container." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
  ],
  mts: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal. Works on every device and player." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Flexible archival container." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
  ],
  "3g2": [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Standard MP4. Plays on all modern devices." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: [],                                description: "Flexible container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
  ],
  f4v: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Standard MP4. Plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: [],                                description: "Flexible container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
  ],

  // ── New data sources ──────────────────────────────────────────────────────
  xls: [
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: ["recommended"], description: "Upgrade to modern Excel format." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["most-compatible", "smallest"],        description: "Universal. Opens in any spreadsheet app." },
    { ext: "json", label: "JSON", mime: "application/json",  badges: [],                                    description: "Structured data for APIs and apps." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                            description: "Tab-separated values." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                                    description: "XML data structure." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                                    description: "Human-readable config format." },
  ],
  ods: [
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: ["recommended"], description: "Open in Excel with full formatting." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["most-compatible", "smallest"],        description: "Universal. Opens anywhere." },
    { ext: "json", label: "JSON", mime: "application/json",  badges: [],                                    description: "Structured data for APIs." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                            description: "Tab-separated values." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                                    description: "XML structure." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                                    description: "Human-readable YAML." },
  ],
  ndjson: [
    { ext: "json", label: "JSON", mime: "application/json",  badges: ["recommended"],                       description: "Standard JSON array — works with any toolchain." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["most-compatible"],                   description: "Flat table. Opens in any spreadsheet app." },
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: [], description: "Open in Excel directly." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                                    description: "XML data structure." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                                    description: "Human-readable YAML." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                            description: "Tab-separated values." },
  ],
  jsonl: [
    { ext: "json", label: "JSON", mime: "application/json",  badges: ["recommended"],                       description: "Standard JSON array — works with any toolchain." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["most-compatible"],                   description: "Flat table. Opens in any spreadsheet app." },
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: [], description: "Open in Excel directly." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                                    description: "XML data structure." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                                    description: "Human-readable YAML." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                            description: "Tab-separated values." },
  ],

  // ── More data sources (SheetJS) ───────────────────────────────────────────
  xlsb: [
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: ["recommended"], description: "Convert to open XML format — works everywhere." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["most-compatible", "smallest"],        description: "Universal. Opens in any spreadsheet app." },
    { ext: "json", label: "JSON", mime: "application/json",  badges: [],                                    description: "Structured data for APIs." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                            description: "Tab-separated values." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                                    description: "XML data structure." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                                    description: "Human-readable YAML." },
  ],
  xlsm: [
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: ["recommended"], description: "Strip macros — safe, shareable Excel format." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["most-compatible", "smallest"],        description: "Universal. Opens in any spreadsheet app." },
    { ext: "json", label: "JSON", mime: "application/json",  badges: [],                                    description: "Structured data for APIs." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                            description: "Tab-separated values." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                                    description: "XML data structure." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                                    description: "Human-readable YAML." },
  ],
  dbf: [
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["recommended", "most-compatible"],     description: "Universal table format. Opens anywhere." },
    { ext: "json", label: "JSON", mime: "application/json",  badges: [],                                    description: "Structured data for apps and APIs." },
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: [], description: "Open in Excel." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                            description: "Tab-separated values." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                                    description: "XML data structure." },
  ],
  dif: [
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: ["recommended", "most-compatible"],     description: "Universal table. Opens in any spreadsheet app." },
    { ext: "json", label: "JSON", mime: "application/json",  badges: [],                                    description: "Structured data for APIs." },
    { ext: "xlsx", label: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", badges: [], description: "Open in Excel." },
    { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", badges: [],                            description: "Tab-separated values." },
  ],

  // ── Config file sources ───────────────────────────────────────────────────
  toml: [
    { ext: "json", label: "JSON", mime: "application/json",  badges: ["recommended"],                       description: "Standard structured data. Works with any toolchain." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                                    description: "Human-readable config format." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: [],                                    description: "Flat table (top-level key-value pairs)." },
    { ext: "xml",  label: "XML",  mime: "application/xml",   badges: [],                                    description: "XML structure." },
  ],
  ini: [
    { ext: "json", label: "JSON", mime: "application/json",  badges: ["recommended"],                       description: "Structured JSON — machine-readable." },
    { ext: "yaml", label: "YAML", mime: "text/yaml",         badges: [],                                    description: "Human-readable YAML config." },
    { ext: "csv",  label: "CSV",  mime: "text/csv",          badges: [],                                    description: "Flat key-value pairs as a table." },
    { ext: "toml", label: "TOML", mime: "application/toml",  badges: [],                                    description: "TOML config format." },
  ],

  // ── More audio sources ────────────────────────────────────────────────────
  ac3: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal. Plays on every device and player." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Efficient modern codec. Great mobile support." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless archive copy." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: [],                                description: "Uncompressed PCM." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: ["smallest"],                      description: "Compact open format." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "State-of-the-art codec. Best quality per kilobit." },
  ],
  dts: [
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless archive — no audio data lost." },
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal. Plays on every device." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Compact high-quality audio." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: [],                                description: "Uncompressed PCM." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Excellent compression." },
  ],
  caf: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal. Works on every device and player." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Native Apple codec — small and high quality." },
    { ext: "m4a",  label: "M4A",  mime: "audio/mp4",   badges: [],                                description: "MPEG-4 audio. Apple ecosystem." },
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["best-quality"],                  description: "Lossless archive copy." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: [],                                description: "Uncompressed PCM." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Excellent at any bitrate." },
  ],
  wv: [
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["recommended", "best-quality"],   description: "Lossless — matches WavPack quality with wider support." },
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["most-compatible"],               description: "Universal. Works everywhere." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: [],                                description: "Uncompressed PCM." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: ["smallest"],                      description: "Efficient modern codec." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Best quality per kilobit." },
  ],
  tta: [
    { ext: "flac", label: "FLAC", mime: "audio/flac",  badges: ["recommended", "best-quality"],   description: "Lossless — same quality, far wider support." },
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["most-compatible"],               description: "Universal. Plays everywhere." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: [],                                description: "Uncompressed PCM." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: ["smallest"],                      description: "Efficient modern codec." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern codec. Excellent compression." },
  ],
  spx: [
    { ext: "mp3",  label: "MP3",  mime: "audio/mpeg",  badges: ["recommended", "most-compatible"], description: "Universal. Plays on every device and player." },
    { ext: "ogg",  label: "OGG",  mime: "audio/ogg",   badges: [],                                description: "Open format. Good for voice content." },
    { ext: "aac",  label: "AAC",  mime: "audio/aac",   badges: [],                                description: "Efficient modern voice codec." },
    { ext: "wav",  label: "WAV",  mime: "audio/wav",   badges: ["best-quality"],                  description: "Uncompressed PCM." },
    { ext: "opus", label: "OPUS", mime: "audio/opus",  badges: ["smallest"],                      description: "Modern voice codec. Far better than Speex." },
  ],

  // ── More video sources ────────────────────────────────────────────────────
  vob: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible", "smallest"], description: "Modern universal format. Great for sharing." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Preserves chapters and multiple audio tracks." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
  ],
  asf: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Universal. Works on every device." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Flexible open container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
  ],
  rm: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Modern universal format. Plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Flexible archival container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
  ],
  rmvb: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible"], description: "Modern universal format. Plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Flexible archival container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
  ],
  m2v: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible", "smallest"], description: "Modern compact format. Plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Flexible archival container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime format." },
  ],
  dv: [
    { ext: "mp4",  label: "MP4",  mime: "video/mp4",         badges: ["recommended", "most-compatible", "smallest"], description: "Vastly smaller than DV. Plays everywhere." },
    { ext: "webm", label: "WebM", mime: "video/webm",        badges: ["smallest"],                      description: "Compact open web format." },
    { ext: "mkv",  label: "MKV",  mime: "video/x-matroska",  badges: ["best-quality"],                  description: "Flexible archival container." },
    { ext: "mov",  label: "MOV",  mime: "video/quicktime",   badges: [],                                description: "Apple QuickTime — native DV container." },
    { ext: "avi",  label: "AVI",  mime: "video/x-msvideo",   badges: [],                                description: "Legacy Windows format." },
  ],
};

export const CATEGORIES: Category[] = [
  {
    id: "image",
    label: "Images",
    icon: "🖼️",
    description: "PNG, JPG, WebP, AVIF, TIFF, GIF, BMP, SVG, ICO, HEIC, JFIF, HEIF",
    color: "#a855f7",
    accept: "image/*,.svg,.tiff,.tif,.ico,.heic,.heif,.bmp,.jfif,.jpe",
    formats: [
      { ext: "png",  label: "PNG",  mime: "image/png"     },
      { ext: "jpg",  label: "JPG",  mime: "image/jpeg"    },
      { ext: "webp", label: "WebP", mime: "image/webp"    },
      { ext: "avif", label: "AVIF", mime: "image/avif"    },
      { ext: "gif",  label: "GIF",  mime: "image/gif"     },
      { ext: "bmp",  label: "BMP",  mime: "image/bmp"     },
      { ext: "tiff", label: "TIFF", mime: "image/tiff"    },
      { ext: "tif",  label: "TIF",  mime: "image/tiff"    },
      { ext: "svg",  label: "SVG",  mime: "image/svg+xml" },
      { ext: "ico",  label: "ICO",  mime: "image/x-icon"  },
      { ext: "heic", label: "HEIC", mime: "image/heic"    },
      { ext: "heif", label: "HEIF", mime: "image/heif"    },
      { ext: "jfif", label: "JFIF", mime: "image/jpeg"    },
      { ext: "jpe",  label: "JPE",  mime: "image/jpeg"    },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    icon: "🎵",
    description: "MP3, WAV, FLAC, OGG, AAC, M4A, OPUS, AIFF, WMA, AMR, MKA, MP2, AC3, DTS, CAF, WV, TTA, SPX",
    color: "#3b82f6",
    accept: "audio/*,.flac,.ogg,.wav,.mp3,.aac,.m4a,.opus,.aiff,.aif,.wma,.amr,.m4r,.mka,.mp2,.oga,.ac3,.dts,.caf,.wv,.tta,.spx",
    formats: [
      { ext: "mp3",  label: "MP3",  mime: "audio/mpeg"       },
      { ext: "wav",  label: "WAV",  mime: "audio/wav"        },
      { ext: "flac", label: "FLAC", mime: "audio/flac"       },
      { ext: "ogg",  label: "OGG",  mime: "audio/ogg"        },
      { ext: "aac",  label: "AAC",  mime: "audio/aac"        },
      { ext: "m4a",  label: "M4A",  mime: "audio/mp4"        },
      { ext: "opus", label: "OPUS", mime: "audio/opus"       },
      { ext: "aiff", label: "AIFF", mime: "audio/aiff"       },
      { ext: "aif",  label: "AIF",  mime: "audio/aiff"       },
      { ext: "wma",  label: "WMA",  mime: "audio/x-ms-wma"  },
      { ext: "amr",  label: "AMR",  mime: "audio/amr"        },
      { ext: "m4r",  label: "M4R",  mime: "audio/mp4"        },
      { ext: "mka",  label: "MKA",  mime: "audio/x-matroska" },
      { ext: "mp2",  label: "MP2",  mime: "audio/mpeg"       },
      { ext: "oga",  label: "OGA",  mime: "audio/ogg"        },
      { ext: "ac3",  label: "AC3",  mime: "audio/ac3"        },
      { ext: "dts",  label: "DTS",  mime: "audio/vnd.dts"    },
      { ext: "caf",  label: "CAF",  mime: "audio/x-caf"      },
      { ext: "wv",   label: "WV",   mime: "audio/x-wavpack"  },
      { ext: "tta",  label: "TTA",  mime: "audio/x-tta"      },
      { ext: "spx",  label: "SPX",  mime: "audio/ogg"        },
    ],
  },
  {
    id: "video",
    label: "Video",
    icon: "🎬",
    description: "MP4, WebM, MOV, AVI, MKV, FLV, WMV, MPEG, TS, M2TS, VOB, ASF, RM, DV, M2V",
    color: "#ef4444",
    accept: "video/*,.mkv,.webm,.flv,.ogv,.m4v,.3gp,.wmv,.mpg,.mpeg,.ts,.m2ts,.mts,.3g2,.f4v,.vob,.asf,.rm,.rmvb,.m2v,.dv",
    formats: [
      { ext: "mp4",  label: "MP4",  mime: "video/mp4"           },
      { ext: "webm", label: "WebM", mime: "video/webm"          },
      { ext: "mov",  label: "MOV",  mime: "video/quicktime"     },
      { ext: "avi",  label: "AVI",  mime: "video/x-msvideo"     },
      { ext: "mkv",  label: "MKV",  mime: "video/x-matroska"    },
      { ext: "flv",  label: "FLV",  mime: "video/x-flv"         },
      { ext: "ogv",  label: "OGV",  mime: "video/ogg"           },
      { ext: "m4v",  label: "M4V",  mime: "video/x-m4v"         },
      { ext: "3gp",  label: "3GP",  mime: "video/3gpp"          },
      { ext: "wmv",  label: "WMV",  mime: "video/x-ms-wmv"      },
      { ext: "mpg",  label: "MPG",  mime: "video/mpeg"          },
      { ext: "mpeg", label: "MPEG", mime: "video/mpeg"          },
      { ext: "ts",   label: "TS",   mime: "video/mp2t"          },
      { ext: "m2ts", label: "M2TS", mime: "video/mp2t"          },
      { ext: "mts",  label: "MTS",  mime: "video/mp2t"          },
      { ext: "3g2",  label: "3G2",  mime: "video/3gpp2"         },
      { ext: "f4v",  label: "F4V",  mime: "video/x-f4v"         },
      { ext: "vob",  label: "VOB",  mime: "video/dvd"           },
      { ext: "asf",  label: "ASF",  mime: "video/x-ms-asf"      },
      { ext: "rm",   label: "RM",   mime: "application/vnd.rn-realmedia" },
      { ext: "rmvb", label: "RMVB", mime: "application/vnd.rn-realmedia-vbr" },
      { ext: "m2v",  label: "M2V",  mime: "video/mpeg"          },
      { ext: "dv",   label: "DV",   mime: "video/x-dv"          },
    ],
  },
  {
    id: "document",
    label: "Documents",
    icon: "📄",
    description: "PDF, DOCX, TXT, HTML, MD, RTF",
    color: "#22c55e",
    accept: ".pdf,.docx,.doc,.txt,.html,.htm,.md,.markdown,.rtf",
    formats: [
      { ext: "pdf",      label: "PDF",      mime: "application/pdf" },
      { ext: "docx",     label: "DOCX",     mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      { ext: "txt",      label: "TXT",      mime: "text/plain"      },
      { ext: "html",     label: "HTML",     mime: "text/html"       },
      { ext: "md",       label: "MD",       mime: "text/markdown"   },
      { ext: "rtf",      label: "RTF",      mime: "application/rtf" },
    ],
  },
  {
    id: "data",
    label: "Data",
    icon: "📊",
    description: "CSV, JSON, XML, YAML, XLSX, XLS, ODS, TSV, JSONL, XLSB, XLSM, DBF, TOML, INI",
    color: "#f59e0b",
    accept: ".csv,.json,.xml,.yaml,.yml,.xlsx,.xls,.ods,.xlsb,.xlsm,.tsv,.jsonl,.ndjson,.dbf,.dif,.toml,.ini",
    formats: [
      { ext: "csv",    label: "CSV",    mime: "text/csv"             },
      { ext: "json",   label: "JSON",   mime: "application/json"     },
      { ext: "xml",    label: "XML",    mime: "application/xml"      },
      { ext: "yaml",   label: "YAML",   mime: "text/yaml"            },
      { ext: "xlsx",   label: "XLSX",   mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
      { ext: "xls",    label: "XLS",    mime: "application/vnd.ms-excel" },
      { ext: "ods",    label: "ODS",    mime: "application/vnd.oasis.opendocument.spreadsheet" },
      { ext: "xlsb",   label: "XLSB",   mime: "application/vnd.ms-excel.sheet.binary.macroEnabled.12" },
      { ext: "xlsm",   label: "XLSM",   mime: "application/vnd.ms-excel.sheet.macroEnabled.12" },
      { ext: "tsv",    label: "TSV",    mime: "text/tab-separated-values" },
      { ext: "jsonl",  label: "JSONL",  mime: "application/jsonl"    },
      { ext: "ndjson", label: "NDJSON", mime: "application/x-ndjson" },
      { ext: "dbf",    label: "DBF",    mime: "application/dbase"    },
      { ext: "dif",    label: "DIF",    mime: "text/plain"           },
      { ext: "toml",   label: "TOML",   mime: "application/toml"     },
      { ext: "ini",    label: "INI",    mime: "text/plain"           },
    ],
  },
];

export function getTargetFormats(sourceExt: string): TargetFormat[] {
  return CONVERSIONS[sourceExt.toLowerCase()] ?? [];
}

export function getRecommended(sourceExt: string): TargetFormat | undefined {
  return getTargetFormats(sourceExt).find(f => f.badges.includes("recommended"));
}

export function detectCategory(file: File): Category | undefined {
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type;
  return CATEGORIES.find(cat =>
    cat.formats.some(f => f.ext === ext || f.mime === mime || mime.startsWith(cat.id + "/"))
  );
}
