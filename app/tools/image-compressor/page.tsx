"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2 } from "lucide-react";
import { fmtBytes, downloadBlob } from "@/lib/utils";

type Status = "idle" | "ready" | "compressing" | "done" | "error";
type OutputFmt = "image/jpeg" | "image/webp";

interface Result {
  blob: Blob;
  w: number;
  h: number;
}

export default function ImageCompressorPage() {
  const [file,    setFile]    = useState<File | null>(null);
  const [origW,   setOrigW]   = useState(0);
  const [origH,   setOrigH]   = useState(0);
  const [quality, setQuality] = useState(82);
  const [format,  setFormat]  = useState<OutputFmt>("image/webp");
  const [status,  setStatus]  = useState<Status>("idle");
  const [result,  setResult]  = useState<Result | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const urlRef = useRef<string>("");

  const loadFile = useCallback((f: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(f);
    urlRef.current = url;
    const img = new Image();
    img.onload = () => {
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      imgRef.current = img;
      setFile(f);
      setStatus("ready");
      setResult(null);
    };
    img.src = url;
  }, []);

  const compress = async () => {
    if (!imgRef.current) return;
    setStatus("compressing");
    setError(null);
    try {
      const { naturalWidth: w, naturalHeight: h } = imgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      if (format === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(imgRef.current, 0, 0);
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, format, quality / 100));
      if (!blob) throw new Error("Could not encode image. Try a different format.");
      setResult({ blob, w, h });
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("ready");
    }
  };

  const download = () => {
    if (!result || !file) return;
    const ext  = format === "image/webp" ? "webp" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(result.blob, `${base}_compressed.${ext}`);
  };

  const saving = result && file
    ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100))
    : 0;

  return (
    <main id="main-content">
      <div className="tool-shell">

        {/* Page header */}
        <div className="flex items-start gap-4 mb-9">
          <div
            className="tool-icon-wrap"
            style={{ background: "var(--color-image-dim)", border: "1px solid rgba(245, 158, 11, 0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-hidden="true"
          >
            <Volume2 size={32} strokeWidth={1.5} color="var(--color-image)" />
          </div>
          <div>
            <h1 className="text-display mb-1">Image Compressor</h1>
            <p className="text-lg text-muted leading-relaxed">
              Reduce image file sizes with adjustable quality. Output as WebP or JPG for maximum compression.
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <p className="section-label">Select image</p>
        <div
          className="dropzone"
          style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer", marginBottom: 28 }}
          role="button" tabIndex={0} aria-label="Drop image here"
          onClick={() => document.getElementById("ic-input")?.click()}
          onKeyDown={e => e.key === "Enter" && document.getElementById("ic-input")?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dropzone-over"); }}
          onDragLeave={e => e.currentTarget.classList.remove("dropzone-over")}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("dropzone-over"); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
        >
          <input id="ic-input" type="file" style={{ display: "none" }} accept="image/*,.svg,.tiff,.tif,.heic,.heif"
            onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
          <div style={{ fontSize: 32 }}>🖼️</div>
          <p style={{ fontWeight: 600 }}>{file ? file.name : "Drop an image here"}</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {file ? `${origW} × ${origH} px · ${fmtBytes(file.size)}` : "or click to browse"}
          </p>
        </div>

        {status !== "idle" && (
          <div>
            {/* Output format */}
            <p className="section-label">Output format</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {([["image/webp", "WebP", "Best compression, modern browsers"], ["image/jpeg", "JPG", "Universal compatibility"]] as [OutputFmt, string, string][]).map(([mime, label, tip]) => (
                <button
                  key={mime}
                  onClick={() => { setFormat(mime); setStatus("ready"); setResult(null); }}
                  style={{
                    flex: 1, padding: "12px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", textAlign: "left",
                    background: format === mime ? "var(--accent-dim)" : "var(--bg-elevated)",
                    border: `1px solid ${format === mime ? "rgba(124,106,247,0.4)" : "var(--border)"}`,
                    color: format === mime ? "var(--accent)" : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}
                >
                  <p style={{ marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>{tip}</p>
                </button>
              ))}
            </div>

            {/* Quality slider */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p className="section-label" style={{ marginBottom: 0 }}>Quality</p>
                <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>{quality}%</span>
              </div>
              <input
                type="range" min={10} max={100} value={quality}
                onChange={e => { setQuality(Number(e.target.value)); setStatus("ready"); setResult(null); }}
                className="slider" style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Smaller file</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Better quality</span>
              </div>
            </div>

            {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>✗ {error}</p>}

            {/* Result comparison */}
            {status === "done" && result && (
              <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Original</p>
                    <p style={{ fontWeight: 700, fontSize: 17 }}>{fmtBytes(file!.size)}</p>
                  </div>
                  <div style={{ width: 1, background: "var(--border)" }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Compressed</p>
                    <p style={{ fontWeight: 700, fontSize: 17, color: saving > 0 ? "var(--green)" : "var(--text)" }}>
                      {fmtBytes(result.blob.size)}
                    </p>
                  </div>
                  <div style={{ width: 1, background: "var(--border)" }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Saved</p>
                    <p style={{ fontWeight: 700, fontSize: 17, color: saving > 0 ? "var(--green)" : "var(--text)" }}>
                      {saving > 0 ? `${saving}%` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "done" && result ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" style={{ flex: 1, padding: "12px 0", fontSize: 14 }} onClick={download}>
                  Download compressed image
                </button>
                <button style={{ padding: "12px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 13 }} onClick={() => setStatus("ready")}>
                  Adjust
                </button>
              </div>
            ) : (
              <button className="btn-primary" style={{ width: "100%", padding: "12px 0", fontSize: 15 }} disabled={status === "compressing"} onClick={compress}>
                {status === "compressing" ? "Compressing…" : "Compress image"}
              </button>
            )}
          </div>
        )}

        <div className="privacy-callout">
          <span>🔒</span>
          <span>Compression runs entirely in your browser — images are never uploaded to any server.</span>
        </div>

      </div>
    </main>
  );
}
