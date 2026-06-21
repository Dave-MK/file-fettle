"use client";

import { useState } from "react";
import Link from "next/link";
import { parseExif, ExifMetadata } from "@/lib/exif-parser";
import { readAsArrayBuffer } from "@/lib/file-utils";
import { fmtBytes, downloadBlob } from "@/lib/utils";

type Status = "idle" | "reading" | "done" | "error";

function formatValue(v: unknown): string {
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(4).replace(/\.?0+$/, "");
  }
  if (Array.isArray(v)) return v.map(formatValue).join(", ");
  return String(v);
}

function MetaTable({ rows }: { rows: Array<{ tag: string; value: string }> }) {
  if (!rows.length) return null;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {rows.map(({ tag, value }) => (
            <tr key={tag} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 12px 8px 0", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap", verticalAlign: "top", width: "40%" }}>{tag}</td>
              <td style={{ padding: "8px 0", wordBreak: "break-all", verticalAlign: "top" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: "20px 20px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>{title}</p>
        {badge && <span className="badge badge-purple">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

export default function ExifViewerPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [meta,   setMeta]   = useState<ExifMetadata | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  const handleFile = async (f: File) => {
    setStatus("reading");
    setError(null);
    setMeta(null);
    try {
      const buf  = await readAsArrayBuffer(f);
      const data = parseExif(buf, f);
      setMeta(data);
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  };

  const reset = () => { setStatus("idle"); setMeta(null); setError(null); };

  const downloadJSON = () => {
    if (!meta) return;
    const json = JSON.stringify(meta, null, 2);
    downloadBlob(new Blob([json], { type: "application/json" }), `${meta.fileInfo.name}.exif.json`);
  };

  const downloadCSV = () => {
    if (!meta) return;
    const rows = [
      ["Tag", "Value", "Category"],
      ...meta.allTags.map(t => [t.tag, t.value.replace(/,/g, ";"), t.category]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv" }), `${meta.fileInfo.name}.exif.csv`);
  };

  const cameraRows = meta?.allTags.filter(t => t.category === "Camera").map(t => ({ tag: t.tag, value: t.value })) ?? [];
  const imageRows  = meta?.allTags.filter(t => t.category === "Image").map(t => ({ tag: t.tag, value: t.value })) ?? [];
  const gpsRows    = meta?.allTags.filter(t => t.category === "GPS").map(t => ({ tag: t.tag, value: t.value })) ?? [];
  const fileRows   = meta?.allTags.filter(t => t.category === "File").map(t => ({ tag: t.tag, value: t.value })) ?? [];

  const hasExif = meta && (cameraRows.length > 0 || imageRows.length > 0 || gpsRows.length > 0);

  return (
    <main id="main-content">
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
          <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← Tools</Link>
        </nav>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
          <div
            className="tool-icon-wrap"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)", fontSize: 22 }}
            aria-hidden="true"
          >
            📸
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, marginBottom: 6 }}>EXIF Metadata Viewer</h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65 }}>
              View camera settings, GPS location, timestamps and all EXIF data embedded in JPEG photos. Download as JSON or CSV.
            </p>
          </div>
        </div>

        {/* Drop zone */}
        {status === "idle" || status === "error" ? (
          <>
            <p className="section-label">Select image</p>
            <div
              className="dropzone"
              style={{
                padding: 40, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 10, textAlign: "center",
                cursor: "pointer", marginBottom: 20,
              }}
              role="button" tabIndex={0} aria-label="Drop JPEG image here"
              onClick={() => document.getElementById("ev-input")?.click()}
              onKeyDown={e => e.key === "Enter" && document.getElementById("ev-input")?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dropzone-over"); }}
              onDragLeave={e => e.currentTarget.classList.remove("dropzone-over")}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.classList.remove("dropzone-over");
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
            >
              <input
                id="ev-input" type="file" style={{ display: "none" }}
                accept="image/jpeg,image/jpg,.jpg,.jpeg,.jpe,.jfif"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
              />
              <div style={{ fontSize: 40 }}>📷</div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>Drop a JPEG photo here</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>or click to browse · JPG, JPEG, JFIF</p>
            </div>
            {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>✗ {error}</p>}
          </>
        ) : null}

        {status === "reading" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="progress-bar" style={{ maxWidth: 280, margin: "0 auto 12px" }}>
              <div className="progress-fill" style={{ width: "70%", animation: "indeterminate 1.4s ease-in-out infinite" }} />
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Reading metadata…</p>
          </div>
        )}

        {status === "done" && meta && (
          <>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 10, flexWrap: "wrap" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {meta.fileInfo.name} · {fmtBytes(meta.fileInfo.size)}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ fontSize: 13, padding: "7px 14px" }} onClick={downloadJSON}>↓ JSON</button>
                <button className="btn-secondary" style={{ fontSize: 13, padding: "7px 14px" }} onClick={downloadCSV}>↓ CSV</button>
                <button onClick={reset} style={{ fontSize: 13, padding: "7px 14px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-muted)" }}>
                  New file
                </button>
              </div>
            </div>

            {!hasExif && (
              <div className="card" style={{ padding: "24px 20px", textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>No EXIF data found</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  This image doesn't appear to contain EXIF metadata. EXIF is only embedded in JPEG files taken with a camera — screenshots and heavily processed images are often stripped.
                </p>
              </div>
            )}

            {/* File Info */}
            <Section title="File Information">
              <MetaTable rows={fileRows} />
            </Section>

            {/* Camera */}
            {cameraRows.length > 0 && (
              <Section title="Camera & Lens">
                <MetaTable rows={cameraRows} />
              </Section>
            )}

            {/* Image details */}
            {imageRows.length > 0 && (
              <Section title="Image Details">
                <MetaTable rows={imageRows} />
              </Section>
            )}

            {/* GPS */}
            {gpsRows.length > 0 && meta.gps && (
              <Section title="GPS Location" badge="Has location">
                {meta.gps.latitude !== undefined && meta.gps.longitude !== undefined && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", background: "rgba(34,197,94,0.07)",
                    border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-sm)",
                    marginBottom: 14, gap: 12, flexWrap: "wrap",
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>
                        {meta.gps.latitude.toFixed(6)}°{meta.gps.latitudeRef === "S" ? "S" : "N"},{" "}
                        {meta.gps.longitude.toFixed(6)}°{meta.gps.longitudeRef === "W" ? "W" : "E"}
                      </p>
                      {meta.gps.altitude !== undefined && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{meta.gps.altitude.toFixed(0)} m altitude</p>
                      )}
                    </div>
                    {meta.gps.mapLink && (
                      <a
                        href={meta.gps.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ fontSize: 12, padding: "6px 14px", textDecoration: "none", display: "inline-block" }}
                      >
                        Open in Maps →
                      </a>
                    )}
                  </div>
                )}
                <MetaTable rows={gpsRows} />
              </Section>
            )}

            {/* All tags raw table */}
            {hasExif && (
              <details style={{ marginTop: 4 }}>
                <summary style={{
                  cursor: "pointer", fontSize: 13, color: "var(--text-muted)", fontWeight: 600,
                  padding: "12px 0", listStyle: "none", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: 11 }}>▶</span> Show all {meta.allTags.length} raw tags
                </summary>
                <div className="card" style={{ padding: "16px 20px", marginTop: 8 }}>
                  <MetaTable rows={meta.allTags.map(t => ({ tag: `[${t.category}] ${t.tag}`, value: t.value }))} />
                </div>
              </details>
            )}
          </>
        )}

        <div className="privacy-callout">
          <span>🔒</span>
          <span>EXIF data is read entirely in your browser — photos are never uploaded to any server.</span>
        </div>

      </div>
    </main>
  );
}
