"use client";

import Link from "next/link";
import { HardDrive, Lock, Zap, FileStack, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 80, padding: "80px 32px" }}>
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

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/converter"
            style={{
              background: "var(--accent-grad)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "16px 32px",
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
            Explore Tools
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/how-it-works"
            style={{
              background: "var(--bg-card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 0 1px var(--accent)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Learn More
            <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500, marginTop: 32 }}>
          {[
            { icon: HardDrive, label: "PDF tools • Image tools • Data tools • More" },
            { icon: Lock, label: "100% client-side — Files never leave your device" },
            { icon: Zap, label: "Fast processing with zero cloud uploads" },
            { icon: FileStack, label: "8+ specialized tools in one place" },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                <Icon size={20} color="var(--accent)" strokeWidth={2} />
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
            Convert files. Compress images. Merge PDFs. Encrypt data. Everything you need, nothing you don't.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, width: "100%" }}>
          {[
            {
              title: "Multi-Tool Suite",
              description: "Not just a converter. Merge PDFs, compress images, hash files, encrypt data, and more.",
            },
            {
              title: "All In-Browser",
              description: "Zero uploads. Zero tracking. Everything runs locally on your device.",
            },
            {
              title: "Completely Free",
              description: "No paywalls, no limits, no registration required. Made for everyone.",
            },
            {
              title: "Purpose-Built Tools",
              description: "Each tool is optimized for its task. Powerful yet simple to use.",
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
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "var(--shadow-glow)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{item.title}</h3>
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
