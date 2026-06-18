"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Status = "idle" | "merging" | "done" | "error";

function fmtBytes(b: number) {
  if (b < 1024)      return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

export default function PdfMergePage() {
  const [files,  setFiles]  = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Blob | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  const addFiles = useCallback((incoming: File[]) => {
    const pdfs = incoming.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...pdfs.filter(f => !names.has(f.name))];
    });
  }, []);

  const removeFile = (idx: number) =>
    setFiles(prev => prev.filter((_, i) => i !== idx));

  const move = (from: number, to: number) =>
    setFiles(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  const merge = async () => {
    if (files.length < 2) return;
    setStatus("merging");
    setError(null);
    setResult(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const file of files) {
        const ab  = await file.arrayBuffer();
        const doc = await PDFDocument.load(ab);
        const copied = await merged.copyPages(doc, doc.getPageIndices());
        copied.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      setResult(new Blob([buf], { type: "application/pdf" }));
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  };

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = "merged.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setFiles([]); setStatus("idle"); setResult(null); setError(null); };

  return (
    <main id="main-content">
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
          <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
            ← Tools
          </Link>
        </nav>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 36 }}>
          <div
            className="tool-icon-wrap"
            style={{ background: "rgba(124,106,247,0.12)", border: "1px solid rgba(124,106,247,0.22)", fontSize: 22 }}
            aria-hidden="true"
          >
            📎
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, marginBottom: 6 }}>
              PDF Merge
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65 }}>
              Combine multiple PDF files into a single document. Drag to reorder. Files never leave your device.
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <p className="section-label">Add PDFs</p>
        <div
          className="dropzone"
          style={{ padding: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer", marginBottom: 20 }}
          role="button"
          tabIndex={0}
          aria-label="Drop PDF files here"
          onClick={() => document.getElementById("pdf-merge-input")?.click()}
          onKeyDown={e => e.key === "Enter" && document.getElementById("pdf-merge-input")?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dropzone-over"); }}
          onDragLeave={e => e.currentTarget.classList.remove("dropzone-over")}
          onDrop={e => {
            e.preventDefault();
            e.currentTarget.classList.remove("dropzone-over");
            addFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <input
            id="pdf-merge-input"
            type="file"
            style={{ display: "none" }}
            accept=".pdf,application/pdf"
            multiple
            onChange={e => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
          />
          <div style={{ fontSize: 32 }}>📄</div>
          <p style={{ fontWeight: 600 }}>Drop PDF files here</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>or click to browse — select multiple</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p className="section-label">
              {files.length} file{files.length > 1 ? "s" : ""} queued
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {files.map((file, idx) => (
                <div key={file.name} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, color: "var(--text-muted)", cursor: "grab", userSelect: "none" }}>⠿</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmtBytes(file.size)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {idx > 0 && (
                      <button style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }} onClick={() => move(idx, idx - 1)} aria-label="Move up">↑</button>
                    )}
                    {idx < files.length - 1 && (
                      <button style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }} onClick={() => move(idx, idx + 1)} aria-label="Move down">↓</button>
                    )}
                    <button style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12, color: "var(--red)" }} onClick={() => removeFile(idx)} aria-label={`Remove ${file.name}`}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        {status === "done" && result ? (
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-primary" style={{ flex: 1, padding: "12px 0", fontSize: 15 }} onClick={download}>
              Download merged.pdf ({fmtBytes(result.size)})
            </button>
            <button style={{ padding: "12px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 14 }} onClick={reset}>
              Start over
            </button>
          </div>
        ) : (
          <button
            className="btn-primary"
            style={{ width: "100%", padding: "13px 0", fontSize: 15 }}
            disabled={files.length < 2 || status === "merging"}
            onClick={merge}
          >
            {status === "merging" ? "Merging…" : files.length < 2 ? "Add at least 2 PDFs to merge" : `Merge ${files.length} PDFs`}
          </button>
        )}

        {error && (
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--red)" }}>✗ {error}</p>
        )}

        <div className="privacy-callout">
          <span>🔒</span>
          <span>PDF merging runs entirely in your browser — files are never uploaded to any server.</span>
        </div>

      </div>
    </main>
  );
}
