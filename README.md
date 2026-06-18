# FileFettle

Convert any file, instantly and privately — 100% in your browser.

**Live:** [file-fettle.vercel.app](https://file-fettle.vercel.app)

## What it does

FileFettle converts files entirely client-side. Nothing is uploaded to a server. Your files never leave your device.

**Supported categories:**
- **Images** — PNG, JPG, HEIC, WebP, AVIF, GIF, SVG, TIFF, BMP, ICO, JFIF, HEIF, and more
- **Audio** — MP3, WAV, FLAC, OGG, AAC, M4A, OPUS, AIFF, WMA, AC3, DTS, CAF, and more
- **Video** — MP4, WebM, MOV, AVI, MKV, WMV, MPEG, VOB, RM, DV, and more
- **Documents** — PDF, DOCX, TXT, HTML, Markdown, RTF
- **Data** — CSV, JSON, XML, YAML, XLSX, XLS, ODS, XLSB, TOML, INI, and more

## How it works

| Category | Engine |
|----------|--------|
| Images | Canvas API |
| Audio / Video | FFmpeg WASM (`@ffmpeg/core`) |
| Documents | mammoth, jsPDF, pdf-lib, pdfjs-dist |
| Data | SheetJS, PapaParse, fast-xml-parser |

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3003](http://localhost:3003).

## Security

- All conversion happens in the browser — no server, no uploads
- `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` enable `SharedArrayBuffer` for FFmpeg WASM
- Standard hardening headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- Service worker skips navigation requests to preserve `cross-origin-isolated` context
