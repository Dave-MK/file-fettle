import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "FileFettle — Free Online File Converter";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
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
        {/* Logo mark */}
        <div
          style={{
            width: 80, height: 80, borderRadius: 20,
            background: "linear-gradient(135deg, #7c6af7, #9584ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 44, marginBottom: 28,
            boxShadow: "0 8px 32px rgba(124,106,247,0.4)",
          }}
        >
          ⇄
        </div>

        {/* Wordmark */}
        <div style={{ fontSize: 72, fontWeight: 800, color: "#f0f0f8", marginBottom: 16, letterSpacing: "-2px" }}>
          FileFettle
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
