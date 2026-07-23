import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Node runtime (not edge) so we can read the logo PNG off disk and embed it.
export const alt         = "FileFettle — Free Online File Converter";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), "public/file-fettle-logo.png"));
  const logoUri = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #12121a 60%, #1a1a26 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Hexagon badge — the same isolated artwork used everywhere else. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUri}
          width={132}
          height={146}
          alt=""
          style={{ marginBottom: 24 }}
        />

        {/* Wordmark — "File" white, "Fettle" in the brand gradient. */}
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, marginBottom: 16, letterSpacing: "-2px" }}>
          <span style={{ color: "#f0f0f8" }}>File</span>
          <span
            style={{
              backgroundImage: "linear-gradient(120deg, #29b6f6 0%, #8b7bff 50%, #f45ba8 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Fettle
          </span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: "#a0a0c0", marginBottom: 40, textAlign: "center" }}>
          Free Online File Converter
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {["🔒 100% Private", "⚡ Instant", "🆓 Free", "📂 80+ Formats"].map(label => (
            <div
              key={label}
              style={{
                padding: "10px 22px", borderRadius: 999,
                background: "rgba(124,106,247,0.15)",
                border: "1.5px solid rgba(124,106,247,0.35)",
                color: "#b4a8ff", fontSize: 18, fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: "absolute", bottom: 36, fontSize: 16, color: "rgba(255,255,255,0.3)" }}>
          filefettle.pro
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
