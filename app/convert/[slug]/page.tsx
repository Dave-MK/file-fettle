import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllFormatPairs, getPairBySlug } from "@/lib/format-pairs";
import { getTargetFormats, CATEGORIES } from "@/lib/formats";
import ConverterEmbed from "@/components/ConverterEmbed";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllFormatPairs().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pair = getPairBySlug(slug);
  if (!pair) return {};

  const t = `Convert ${pair.fromLabel} to ${pair.toLabel} Online — Free, No Upload`;
  const d = `Convert ${pair.fromLabel} to ${pair.toLabel} free in your browser. ${pair.description} No upload required — 100% private and instant.`;
  return {
    title: t,
    description: d,
    alternates: { canonical: `/convert/${slug}` },
    openGraph: { title: t, description: d, url: `/convert/${slug}` },
    twitter: { card: "summary", title: t, description: d },
  };
}

export default async function ConvertPairPage({ params }: Props) {
  const { slug } = await params;
  const pair = getPairBySlug(slug);
  if (!pair) notFound();

  const targets    = getTargetFormats(pair.fromExt);
  const targetFmt  = targets.find(t => t.ext === pair.toExt);
  const targetMime = targetFmt?.mime ?? "application/octet-stream";
  const category   = CATEGORIES.find(c => c.id === pair.categoryId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${pair.fromLabel} to ${pair.toLabel} Converter`,
    url: `https://filefettle.pro/convert/${pair.slug}`,
    description: `Convert ${pair.fromLabel} to ${pair.toLabel} free in your browser. No upload required.`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 32 }}>
          <Link
            href="/"
            style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            ← Back to FileFettle
          </Link>
        </nav>

        {/* Heading */}
        <h1 style={{ fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 800, color: "var(--text)", marginBottom: 12, lineHeight: 1.2 }}>
          Convert {pair.fromLabel} to {pair.toLabel} Online
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-muted)", marginBottom: 36, lineHeight: 1.7, maxWidth: 600 }}>
          {pair.description} Runs entirely in your browser — no upload, no registration, completely free.
        </p>

        {/* Converter */}
        <div className="card" style={{ padding: 24, marginBottom: 48 }}>
          <ConverterEmbed
            fromExt={pair.fromExt}
            toExt={pair.toExt}
            fromLabel={pair.fromLabel}
            toLabel={pair.toLabel}
            targetMime={targetMime}
            categoryId={pair.categoryId}
          />
        </div>

        {/* Features grid */}
        <section aria-labelledby="features-h" style={{ marginBottom: 48 }}>
          <h2 id="features-h" style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
            Why convert {pair.fromLabel} to {pair.toLabel} with FileFettle?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { icon: "🔒", title: "100% Private",       body: "Your files are processed locally in your browser. Nothing is ever uploaded to any server." },
              { icon: "⚡", title: "No file size limit",  body: "Convert files of any size — the only limit is your device's available memory." },
              { icon: "🆓", title: "Completely free",     body: "No subscriptions, no paywalls, no account required. Free forever." },
              { icon: "🌐", title: "Any browser",         body: "Chrome, Firefox, Safari, Edge — no plugins or software to install." },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How-to steps */}
        <section aria-labelledby="howto-h" style={{ marginBottom: 48 }}>
          <h2 id="howto-h" style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
            How to convert {pair.fromLabel} to {pair.toLabel}
          </h2>
          <ol style={{ display: "flex", flexDirection: "column", gap: 14, padding: 0, listStyle: "none" }}>
            {[
              `Drop your ${pair.fromLabel} file onto the converter above, or click to browse and select it from your device.`,
              `FileFettle processes the file instantly using ${pair.categoryId === "image" ? "the browser Canvas API" : pair.categoryId === "audio" || pair.categoryId === "video" ? "FFmpeg compiled to WebAssembly" : "built-in browser APIs"}. No uploading required.`,
              `Click the Download button to save your converted ${pair.toLabel} file directly to your device.`,
            ].map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{
                  minWidth: 28, height: 28, borderRadius: "50%",
                  background: "var(--accent-dim)", border: "1px solid rgba(124,106,247,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, paddingTop: 4 }}>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA footer */}
        <div style={{ paddingTop: 32, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 14 }}>
            Need a different format? FileFettle supports 80+ {category?.label.toLowerCase() ?? ""} conversions.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block", background: "var(--accent)", color: "#fff",
              padding: "10px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Explore all formats →
          </Link>
        </div>

      </div>
    </main>
  );
}
