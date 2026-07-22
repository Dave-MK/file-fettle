"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Maximize2 } from "lucide-react";
import { fmtBytes, downloadBlob } from "@/lib/utils";

type Status = "idle" | "ready" | "resizing" | "done" | "error";
type OutputFmt = "image/png" | "image/jpeg" | "image/webp";

export default function ImageResizerPage() {
  const [file,       setFile]       = useState<File | null>(null);
  const [origW,      setOrigW]      = useState(0);
  const [origH,      setOrigH]      = useState(0);
  const [width,      setWidth]      = useState("");
  const [height,     setHeight]     = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [quality,    setQuality]    = useState(92);
  const [format,     setFormat]     = useState<OutputFmt>("image/png");
  const [status,     setStatus]     = useState<Status>("idle");
  const [result,     setResult]     = useState<Blob | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objUrl = useRef<string>("");

  useEffect(() => () => { if (objUrl.current) URL.revokeObjectURL(objUrl.current); }, []);

  const loadFile = useCallback((f: File) => {
    if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    const url = URL.createObjectURL(f);
    objUrl.current = url;
    const img = new Image();
    img.onload = () => {
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
      setFormat(f.type === "image/jpeg" ? "image/jpeg" : f.type === "image/webp" ? "image/webp" : "image/png");
      imgRef.current = img;
      setFile(f);
      setStatus("ready");
      setResult(null);
    };
    img.src = url;
  }, []);

  const onWidthChange = (v: string) => {
    setWidth(v);
    if (keepAspect && origW && origH) {
      const w = parseInt(v, 10);
      if (!isNaN(w) && w > 0) setHeight(String(Math.round(w * origH / origW)));
    }
  };

  const onHeightChange = (v: string) => {
    setHeight(v);
    if (keepAspect && origW && origH) {
      const h = parseInt(v, 10);
      if (!isNaN(h) && h > 0) setWidth(String(Math.round(h * origW / origH)));
    }
  };

  const resize = async () => {
    if (!imgRef.current) return;
    const w = parseInt(width,  10);
    const h = parseInt(height, 10);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) { setError("Enter valid width and height."); return; }
    setStatus("resizing");
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      if (format === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(imgRef.current, 0, 0, w, h);
      const q = ["image/jpeg", "image/webp"].includes(format) ? quality / 100 : 1;
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, format, q));
      if (!blob) throw new Error("Canvas could not encode the image.");
      setResult(blob);
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("ready");
    }
  };

  const download = () => {
    if (!result || !file) return;
    const ext  = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(result, `${base}_${width}x${height}.${ext}`);
  };

  const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";

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
            <Maximize2 size={32} strokeWidth={1.5} color="var(--color-image)" />
          </div>
          <div>
            <h1 className="text-display mb-1">Image Resizer</h1>
            <p className="text-lg text-muted leading-relaxed">
              Resize images to exact pixel dimensions. Supports JPG, PNG, WebP, GIF, HEIC, SVG and more.
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <p className="section-label">Select image</p>
        <div
          className="dropzone"
          style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer", marginBottom: 28 }}
          role="button" tabIndex={0} aria-label="Drop image here"
          onClick={() => document.getElementById("ir-input")?.click()}
          onKeyDown={e => e.key === "Enter" && document.getElementById("ir-input")?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dropzone-over"); }}
          onDragLeave={e => e.currentTarget.classList.remove("dropzone-over")}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("dropzone-over"); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
        >
          <input id="ir-input" type="file" style={{ display: "none" }} accept="image/*,.svg,.tiff,.tif,.heic,.heif"
            onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
          <div style={{ fontSize: 32 }}>🖼️</div>
          <p style={{ fontWeight: 600 }}>
            {file ? file.name : "Drop an image here"}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {file ? `${origW} × ${origH} px · ${fmtBytes(file.size)}` : "or click to browse"}
          </p>
        </div>

        {status !== "idle" && (
          <div>
            {/* Dimensions */}
            <p className="section-label">Dimensions</p>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Width (px)</p>
                  <input
                    type="number" min={1} max={16000} value={width} onChange={e => onWidthChange(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }}
                  />
                </div>
                <button
                  title={keepAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                  onClick={() => setKeepAspect(v => !v)}
                  style={{ padding: "10px 12px", marginTop: 16, borderRadius: 8, fontSize: 16, cursor: "pointer", background: keepAspect ? "var(--accent-dim)" : "var(--bg-elevated)", border: `1px solid ${keepAspect ? "rgba(124,106,247,0.4)" : "var(--border)"}` }}
                >
                  {keepAspect ? "🔒" : "🔓"}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Height (px)</p>
                  <input
                    type="number" min={1} max={16000} value={height} onChange={e => onHeightChange(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Output format */}
            <p className="section-label">Output format</p>
            <div className="seg-tabs" style={{ marginBottom: 20 }}>
              {([["image/png", "PNG"], ["image/jpeg", "JPG"], ["image/webp", "WebP"]] as [OutputFmt, string][]).map(([mime, label]) => (
                <button
                  key={mime}
                  onClick={() => setFormat(mime)}
                  className={`seg-tab${format === mime ? " active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Quality (lossy only) */}
            {(format === "image/jpeg" || format === "image/webp") && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p className="section-label" style={{ marginBottom: 0 }}>Quality</p>
                  <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>{quality}%</span>
                </div>
                <input
                  type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))}
                  className="slider" style={{ width: "100%" }}
                />
              </div>
            )}

            {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>✗ {error}</p>}

            {status === "done" && result ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" style={{ flex: 1, padding: "12px 0", fontSize: 14 }} onClick={download}>
                  Download {width}×{height}.{ext} ({fmtBytes(result.size)})
                </button>
                <button style={{ padding: "12px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 13 }} onClick={() => setStatus("ready")}>
                  Adjust
                </button>
              </div>
            ) : (
              <button className="btn-primary" style={{ width: "100%", padding: "12px 0", fontSize: 15 }} disabled={status === "resizing"} onClick={resize}>
                {status === "resizing" ? "Resizing…" : `Resize to ${width || "?"}×${height || "?"} px`}
              </button>
            )}
          </div>
        )}

        <div className="privacy-callout">
          <span>🔒</span>
          <span>Resizing runs entirely in your browser — images are never uploaded to any server.</span>
        </div>

      </div>
    </main>
  );
}
