"use client";

import Link from "next/link";
import { HardDrive, Lock, Zap, FileStack, ArrowRight, RefreshCw, Merge, Scissors, Maximize2, Volume2, Key, Code, ImageIcon } from "lucide-react";

// 10 entries → 2 rows of 5 on large screens. Convert leads (primary),
// Learn More closes (ghost); the 8 tools sit between.
const TOOLS = [
  { href: "/converter", icon: RefreshCw, label: "Convert", variant: "primary" },
  { href: "/tools/pdf-merge", icon: Merge, label: "Merge PDFs" },
  { href: "/tools/pdf-split", icon: Scissors, label: "Split PDFs" },
  { href: "/tools/image-resizer", icon: Maximize2, label: "Resize Images" },
  { href: "/tools/image-compressor", icon: Volume2, label: "Compress Images" },
  { href: "/tools/file-hash", icon: Key, label: "File Hash" },
  { href: "/tools/base64", icon: Code, label: "Base64" },
  { href: "/tools/file-encrypt", icon: Lock, label: "File Encrypt" },
  { href: "/tools/exif-viewer", icon: ImageIcon, label: "EXIF Viewer" },
  { href: "/how-it-works", icon: ArrowRight, label: "Learn More", variant: "ghost" },
] as const;

export default function Home() {
  return (
    <main style={{ display: "flex", flexDirection: "column", gap: "clamp(40px, 10vw, 80px)", padding: "clamp(40px, 8vw, 80px) clamp(16px, 5vw, 32px)" }}>
      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 32, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 700 }}>
          <h1 style={{ fontSize: "clamp(40px,6vw,60px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            One workspace for
            <br />
            <span style={{ background: "var(--accent-grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              all your file needs
            </span>
          </h1>
          <p style={{ fontSize: "clamp(16px,2vw,20px)", color: "var(--text-muted)", lineHeight: 1.6, fontWeight: 400 }}>
            Convert, compress, edit, and optimize files — all in one place. 8+ purpose-built tools for images, PDFs, data, and more. 100% client-side. 100% private.
          </p>
        </div>

        <div className="tool-grid">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            const variant = "variant" in tool ? tool.variant : undefined;
            const cls =
              variant === "primary" ? "tool-btn tool-btn--primary"
              : variant === "ghost" ? "tool-btn tool-btn--ghost"
              : "tool-btn";
            return (
              <Link key={tool.href} href={tool.href} className={cls}>
                <Icon size={18} />
                {tool.label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500, marginTop: 32 }}>
          {[
            { icon: HardDrive, label: "PDF tools • Image tools • Data tools • More", color: "var(--accent-primary)" },
            { icon: Lock, label: "100% client-side — Files never leave your device", color: "var(--color-secondary)" },
            { icon: Zap, label: "Fast processing with zero cloud uploads", color: "var(--color-tertiary)" },
            { icon: FileStack, label: "8+ specialized tools in one place", color: "var(--accent-primary)" },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                <Icon size={20} color={feature.color} strokeWidth={2} />
                <span style={{ fontSize: 15, color: "var(--text-muted)" }}>{feature.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Trust Section ───────────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>One Suite. Many Uses.</h2>
          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Convert files. Compress images. Merge PDFs. Encrypt data. Everything you need, nothing you don&apos;t.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, width: "100%" }}>
          {[
            {
              title: "Multi-Tool Suite",
              description: "Not just a converter. Merge PDFs, compress images, hash files, encrypt data, and more.",
              accentColor: "var(--accent-primary)",
              accentGlow: "var(--accent-glow)",
            },
            {
              title: "All In-Browser",
              description: "Zero uploads. Zero tracking. Everything runs locally on your device.",
              accentColor: "var(--color-secondary)",
              accentGlow: "var(--color-secondary-glow)",
            },
            {
              title: "Completely Free",
              description: "No paywalls, no limits, no registration required. Made for everyone.",
              accentColor: "var(--color-tertiary)",
              accentGlow: "var(--color-tertiary-glow)",
            },
            {
              title: "Purpose-Built Tools",
              description: "Each tool is optimized for its task. Powerful yet simple to use.",
              accentColor: "var(--color-secondary)",
              accentGlow: "var(--color-secondary-glow)",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "all 0.2s",
                borderLeft: `4px solid ${item.accentColor}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = item.accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${item.accentColor}, 0 4px 20px ${item.accentGlow}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, color: item.accentColor }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 900 }}>Ready to get started?</h2>
        <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 500 }}>
          Pick a tool and start in seconds. No account needed. No limits. Completely private.
        </p>
        <Link
          href="/converter"
          style={{
            background: "var(--accent-grad)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "16px 48px",
            fontSize: "16px",
            fontWeight: 700,
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 8px 24px rgba(124, 106, 247, 0.3)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(124, 106, 247, 0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(124, 106, 247, 0.3)";
          }}
        >
          Start Now
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
