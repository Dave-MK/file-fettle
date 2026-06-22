"use client";

import { useState } from "react";
import {
  Merge, Scissors, Maximize2, Volume2, Key, Code, Lock, ImageIcon,
  FileUp, Settings, Download, Check, ChevronDown
} from "lucide-react";

export default function HowItWorks() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: "privacy",
      question: "Is my data really private?",
      answer: "Yes. FileFettle runs entirely in your browser using WebAssembly and the Canvas API. Your files never leave your device and are never sent to any server. Everything is processed locally.",
    },
    {
      id: "formats",
      question: "What file formats are supported?",
      answer: "FileFettle supports 80+ formats across 5 categories: Images (JPG, PNG, WebP, AVIF, HEIC, GIF, SVG, TIFF, BMP), Audio (MP3, WAV, FLAC, OGG, AAC, M4A, OPUS), Video (MP4, WebM, MOV, AVI, MKV, MPEG), Documents (PDF, DOCX, TXT, HTML, Markdown), and Data (CSV, JSON, XML, YAML, XLSX).",
    },
    {
      id: "size",
      question: "Is there a file size limit?",
      answer: "No file size limit. Since conversion runs locally in your browser, the only constraint is your device's available memory. You can convert files as large as your device can handle.",
    },
    {
      id: "speed",
      question: "Why are video/audio conversions slow?",
      answer: "Video and audio use FFmpeg compiled to WebAssembly (~30 MB). The first run downloads this library, which takes a moment. It's cached afterwards, so subsequent conversions are faster.",
    },
    {
      id: "account",
      question: "Do I need an account?",
      answer: "No. FileFettle is completely free and requires no registration, login, or account creation.",
    },
    {
      id: "batch",
      question: "Can I convert multiple files at once?",
      answer: "Yes. You can drop or select multiple files, and FileFettle will convert them one at a time. You can download them individually or as a ZIP.",
    },
    {
      id: "quality",
      question: "Can I control compression quality?",
      answer: "Yes. When converting to formats that support quality settings (like JPG, WebP, MP3), you can adjust the quality slider. Lower quality = smaller file size.",
    },
  ];

  const tools = [
    {
      id: "pdf-merge",
      icon: Merge,
      name: "PDF Merge",
      description: "Combine multiple PDF files into a single document",
      features: ["Drag to reorder pages", "Combine unlimited PDFs", "Runs entirely in browser"],
      colorVar: "--color-pdf",
    },
    {
      id: "pdf-split",
      icon: Scissors,
      name: "PDF Split",
      description: "Extract pages or page ranges from any PDF",
      features: ["Extract single pages", "Extract page ranges", "Batch extract multiple ranges"],
      colorVar: "--color-pdf",
    },
    {
      id: "image-resizer",
      icon: Maximize2,
      name: "Image Resizer",
      description: "Resize images to exact dimensions while preserving quality",
      features: ["Pixel-perfect resizing", "Maintain aspect ratio", "Batch resize multiple images"],
      colorVar: "--color-image",
    },
    {
      id: "image-compressor",
      icon: Volume2,
      name: "Image Compressor",
      description: "Reduce image file sizes with adjustable quality",
      features: ["Format conversion (WebP, AVIF, JPG)", "Quality slider", "Batch compression"],
      colorVar: "--color-image",
    },
    {
      id: "file-hash",
      icon: Key,
      name: "File Hash Checker",
      description: "Generate checksums to verify file integrity",
      features: ["SHA-256, SHA-1, SHA-512, MD5", "Verify downloads", "Check file authenticity"],
      colorVar: "--color-data",
    },
    {
      id: "base64",
      icon: Code,
      name: "Base64 Encoder/Decoder",
      description: "Encode text/files to Base64 or decode Base64 strings",
      features: ["Text to Base64", "File to Base64", "Base64 to text"],
      colorVar: "--color-data",
    },
    {
      id: "file-encrypt",
      icon: Lock,
      name: "File Encrypt",
      description: "Encrypt files with password protection",
      features: ["AES-256-GCM encryption", "Password protected", "Decrypt back to original"],
      colorVar: "--color-security",
    },
    {
      id: "exif-viewer",
      icon: ImageIcon,
      name: "EXIF Metadata Viewer",
      description: "View camera settings and metadata in JPEG photos",
      features: ["Camera model & settings", "GPS location data", "Photo timestamps"],
      colorVar: "--color-image",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
      {/* ── How It Works Hero ────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 700 }}>
          <h1 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
            How FileFettle Works
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.6 }}>
            All conversions happen in your browser. Your files never leave your device.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, width: "100%", maxWidth: 900, marginTop: 40 }}>
          {[
            { icon: FileUp, label: "Drop or select your file" },
            { icon: Settings, label: "Choose output format" },
            { icon: Key, label: "Adjust settings (optional)" },
            { icon: Download, label: "Download instantly" },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "32px 24px",
                  textAlign: "center",
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
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                  }}
                >
                  <Icon size={24} color="var(--accent)" />
                </div>
                <p style={{ fontWeight: 600, color: "var(--text)" }}>{step.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Tools Showcase ────────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 40, textAlign: "center" }}>
          Available Tools
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
          {tools.map(tool => {
            const ToolIcon = tool.icon;
            return (
              <div
                key={tool.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `var(${tool.colorVar})`;
                  e.currentTarget.style.boxShadow = `0 0 0 1px var(${tool.colorVar}), 0 4px 20px var(${tool.colorVar.replace('--color', '--color')}-glow)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ color: `var(${tool.colorVar})` }}>
                  <ToolIcon size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{tool.name}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{tool.description}</p>
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  {tool.features.map(feature => (
                    <li
                      key={feature}
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Check size={16} color={`var(${tool.colorVar})`} strokeWidth={3} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQs ──────────────────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 40, textAlign: "center" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map(faq => (
            <div
              key={faq.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                transition: "all 0.2s",
              }}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  fontWeight: 600,
                  color: "var(--text)",
                  fontSize: 15,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {faq.question}
                <div
                  style={{
                    transform: expandedFaq === faq.id ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronDown size={20} color="var(--text-muted)" />
                </div>
              </button>
              {expandedFaq === faq.id && (
                <div
                  style={{
                    padding: "0 24px 20px",
                    borderTop: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    fontSize: 14,
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", paddingBottom: 40 }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Ready to get started?</h2>
        <p style={{ fontSize: 18, color: "var(--text-muted)", marginBottom: 32 }}>
          No account required. All conversions happen entirely in your browser.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            background: "var(--accent-grad)",
            color: "white",
            padding: "16px 40px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 16,
            boxShadow: "0 8px 24px rgba(124, 106, 247, 0.3)",
            transition: "all 0.2s",
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
          Start Converting →
        </a>
      </section>
    </div>
  );
}
