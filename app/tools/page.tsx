import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Online File Tools — FileFettle",
  description: "Free browser-based file tools: PDF merge & split, image resize & compress, file hash checker, Base64 encoder. No upload, 100% private.",
  alternates: { canonical: "/tools" },
};

const CATEGORIES = [
  {
    id: "pdf",
    label: "PDF Tools",
    iconBg: "rgba(124,106,247,0.12)",
    iconBorder: "rgba(124,106,247,0.22)",
    tools: [
      { href: "/tools/pdf-merge", icon: "📎", title: "PDF Merge", desc: "Combine multiple PDF files into a single document in seconds.", badge: "Popular" },
      { href: "/tools/pdf-split", icon: "✂️", title: "PDF Split", desc: "Extract individual pages or custom page ranges from any PDF.", badge: "" },
    ],
  },
  {
    id: "image",
    label: "Image Tools",
    iconBg: "rgba(59,130,246,0.12)",
    iconBorder: "rgba(59,130,246,0.22)",
    tools: [
      { href: "/tools/image-resizer", icon: "📐", title: "Image Resizer", desc: "Resize images to exact pixel dimensions while preserving quality.", badge: "Popular" },
      { href: "/tools/image-compressor", icon: "🗜️", title: "Image Compressor", desc: "Reduce image file sizes with adjustable quality and format options.", badge: "" },
    ],
  },
  {
    id: "utility",
    label: "Utilities",
    iconBg: "rgba(34,197,94,0.1)",
    iconBorder: "rgba(34,197,94,0.2)",
    tools: [
      { href: "/tools/file-hash",   icon: "🔑", title: "File Hash Checker",        desc: "Generate SHA-256, SHA-1, SHA-512 and MD5 checksums to verify integrity.",             badge: "" },
      { href: "/tools/base64",      icon: "🔠", title: "Base64 Encoder / Decoder", desc: "Encode text or files to Base64, or decode Base64 strings instantly.",                  badge: "" },
      { href: "/tools/file-encrypt",icon: "🔒", title: "File Encrypt",             desc: "Encrypt any file with AES-256-GCM. Password-protected, decrypt back to the original.", badge: "New" },
      { href: "/tools/exif-viewer", icon: "📸", title: "EXIF Metadata Viewer",     desc: "View camera settings, GPS location and all EXIF data in JPEG photos.",                 badge: "New" },
    ],
  },
];

export default function ToolsPage() {
  return (
    <main id="main-content">
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px 80px" }}>

        <nav aria-label="Breadcrumb" style={{ marginBottom: 36 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
            ← FileFettle
          </Link>
        </nav>

        {/* Hero */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 20 }}>
            <div
              className="tool-icon-wrap"
              style={{ background: "var(--accent-dim)", border: "1px solid rgba(124,106,247,0.22)", fontSize: 26 }}
              aria-hidden="true"
            >
              🛠️
            </div>
            <div>
              <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 8 }}>
                Free File Tools
              </h1>
              <p style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 520 }}>
                Browser-based tools for PDF editing, image processing, checksums and encoding. No upload, no account.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
            <span className="badge badge-green">No upload</span>
            <span className="badge badge-blue">No account required</span>
            <span className="badge badge-purple">100% free</span>
            <span className="badge badge-green">Runs in browser</span>
          </div>
        </div>

        {/* Tool categories */}
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="tools-section">
            <p className="section-label">{cat.label}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {cat.tools.map(tool => (
                <Link key={tool.href} href={tool.href} style={{ textDecoration: "none" }}>
                  <div
                    className="card"
                    style={{ padding: "22px 20px", height: "100%", display: "flex", flexDirection: "column", gap: 12 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div
                        className="tool-icon-wrap"
                        style={{ width: 44, height: 44, borderRadius: 11, background: cat.iconBg, border: `1px solid ${cat.iconBorder}`, fontSize: 20 }}
                        aria-hidden="true"
                      >
                        {tool.icon}
                      </div>
                      {tool.badge && <span className="badge badge-purple">{tool.badge}</span>}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>{tool.title}</p>
                      <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55 }}>{tool.desc}</p>
                    </div>
                    <p className="tool-card-cta">Open tool →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Converter CTA */}
        <div style={{
          marginTop: 12,
          padding: "28px",
          background: "linear-gradient(135deg, var(--bg-elevated) 0%, rgba(124,106,247,0.05) 100%)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Need to convert a file?</p>
            <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 380 }}>
              The main converter supports 80+ formats — images, audio, video, documents and data.
            </p>
          </div>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--accent)", color: "#fff",
              padding: "11px 22px", borderRadius: 9,
              fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            File Converter →
          </Link>
        </div>

      </div>
    </main>
  );
}
