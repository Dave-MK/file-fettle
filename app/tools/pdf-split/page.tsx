"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "ready" | "splitting" | "done" | "error";

function fmtBytes(b: number) {
  if (b < 1024)      return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

function parseRanges(input: string, total: number): number[][] {
  const ranges: number[][] = [];
  for (const part of input.split(",")) {
    const t = part.trim();
    if (!t) continue;
    const dash = t.indexOf("-");
    if (dash === -1) {
      const n = parseInt(t, 10);
      if (!isNaN(n) && n >= 1 && n <= total) ranges.push([n - 1]);
    } else {
      const a = parseInt(t.slice(0, dash), 10);
      const b = parseInt(t.slice(dash + 1), 10);
      if (!isNaN(a) && !isNaN(b) && a >= 1 && b <= total && a <= b) {
        ranges.push(Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i));
      }
    }
  }
  return ranges;
}

export default function PdfSplitPage() {
  const [file,       setFile]       = useState<File | null>(null);
  const [pageCount,  setPageCount]  = useState(0);
  const [status,     setStatus]     = useState<Status>("idle");
  const [rangeInput, setRangeInput] = useState("");
  const [mode,       setMode]       = useState<"each" | "range">("each");
  const [results,    setResults]    = useState<{ name: string; blob: Blob }[]>([]);
  const [error,      setError]      = useState<string | null>(null);
  const fileRef = useRef<ArrayBuffer | null>(null);

  const loadFile = async (f: File) => {
    setStatus("loading");
    setError(null);
    setResults([]);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const ab  = await f.arrayBuffer();
      const doc = await PDFDocument.load(ab);
      fileRef.current = ab;
      setFile(f);
      setPageCount(doc.getPageCount());
      setStatus("ready");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  };

  const split = async () => {
    if (!fileRef.current || !file) return;
    setStatus("splitting");
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(fileRef.current);
      const out: { name: string; blob: Blob }[] = [];
      const base = file.name.replace(/\.pdf$/i, "");

      if (mode === "each") {
        for (let i = 0; i < pageCount; i++) {
          const doc  = await PDFDocument.create();
          const [pg] = await doc.copyPages(src, [i]);
          doc.addPage(pg);
          const bytes = await doc.save();
          const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          out.push({ name: `${base}_page${i + 1}.pdf`, blob: new Blob([buf], { type: "application/pdf" }) });
        }
      } else {
        const groups = parseRanges(rangeInput, pageCount);
        if (!groups.length) { setError("No valid page ranges specified."); setStatus("ready"); return; }
        for (let gi = 0; gi < groups.length; gi++) {
          const indices = groups[gi];
          const doc     = await PDFDocument.create();
          const pages   = await doc.copyPages(src, indices);
          pages.forEach(p => doc.addPage(p));
          const bytes = await doc.save();
          const buf2 = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          const label = indices.length === 1 ? `p${indices[0] + 1}` : `p${indices[0] + 1}-${indices[indices.length - 1] + 1}`;
          out.push({ name: `${base}_${label}.pdf`, blob: new Blob([buf2], { type: "application/pdf" }) });
        }
      }
      setResults(out);
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("ready");
    }
  };

  const download = (r: { name: string; blob: Blob }) => {
    const url = URL.createObjectURL(r.blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = r.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => results.forEach(download);

  return (
    <main id="main-content">
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
          <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← Tools</Link>
        </nav>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 36 }}>
          <div
            className="tool-icon-wrap"
            style={{ background: "rgba(124,106,247,0.12)", border: "1px solid rgba(124,106,247,0.22)", fontSize: 22 }}
            aria-hidden="true"
          >
            ✂️
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, marginBottom: 6 }}>
              PDF Split
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65 }}>
              Extract individual pages or custom page ranges from any PDF. Everything runs in your browser.
            </p>
          </div>
        </div>

        {status === "idle" || status === "loading" ? (
          <>
            <p className="section-label">Select PDF</p>
            <div
              className="dropzone"
              style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer" }}
              role="button" tabIndex={0}
              aria-label="Drop a PDF file here"
              onClick={() => document.getElementById("pdf-split-input")?.click()}
              onKeyDown={e => e.key === "Enter" && document.getElementById("pdf-split-input")?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dropzone-over"); }}
              onDragLeave={e => e.currentTarget.classList.remove("dropzone-over")}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.classList.remove("dropzone-over");
                const f = Array.from(e.dataTransfer.files).find(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
                if (f) loadFile(f);
              }}
            >
              <input id="pdf-split-input" type="file" style={{ display: "none" }} accept=".pdf,application/pdf"
                onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
              <div style={{ fontSize: 32 }}>📄</div>
              <p style={{ fontWeight: 600 }}>{status === "loading" ? "Loading PDF…" : "Drop your PDF here"}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>or click to browse</p>
            </div>
          </>
        ) : (
          <div>
            {/* File info */}
            <p className="section-label">PDF loaded</p>
            <div className="card" style={{ padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>📄</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{file?.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{pageCount} pages · {fmtBytes(file?.size ?? 0)}</p>
              </div>
              <button
                style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => { setStatus("idle"); setFile(null); setResults([]); fileRef.current = null; }}
              >
                Change
              </button>
            </div>

            {/* Mode selector */}
            <p className="section-label">Split mode</p>
            <div className="seg-tabs" style={{ marginBottom: 20 }}>
              {(["each", "range"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`seg-tab${mode === m ? " active" : ""}`}
                >
                  {m === "each" ? "Split into individual pages" : "Extract page range"}
                </button>
              ))}
            </div>

            {mode === "range" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                  Page ranges <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(e.g. 1-3, 5, 7-9)</span>
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={e => setRangeInput(e.target.value)}
                  placeholder={`1-${Math.ceil(pageCount / 2)}, ${Math.ceil(pageCount / 2) + 1}-${pageCount}`}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    color: "var(--text)", outline: "none",
                  }}
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Separate ranges with commas. Each range becomes a separate PDF.
                </p>
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%", padding: "13px 0", fontSize: 15, marginBottom: 16 }}
              disabled={status === "splitting"}
              onClick={split}
            >
              {status === "splitting" ? "Splitting…" : mode === "each" ? `Split into ${pageCount} pages` : "Extract pages"}
            </button>

            {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>✗ {error}</p>}

            {results.length > 0 && (
              <div>
                <p className="section-label">{results.length} file{results.length > 1 ? "s" : ""} ready</p>
                {results.length > 1 && (
                  <button className="btn-primary" style={{ width: "100%", padding: "11px 0", fontSize: 14, marginBottom: 12 }} onClick={downloadAll}>
                    Download all ({results.length} files)
                  </button>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {results.map(r => (
                    <div key={r.name} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16 }}>📄</span>
                      <p style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{r.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtBytes(r.blob.size)}</p>
                      <button className="btn-primary" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => download(r)}>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="privacy-callout">
          <span>🔒</span>
          <span>Processing runs entirely in your browser — files are never uploaded to any server.</span>
        </div>

      </div>
    </main>
  );
}
