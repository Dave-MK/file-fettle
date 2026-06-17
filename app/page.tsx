"use client";

import { useState, useCallback, useRef } from "react";
import {
  CATEGORIES, Category, TargetFormat,
  getTargetFormats, getRecommended, detectCategory,
} from "@/lib/formats";
import { FileJob, ImageResizeOpts } from "@/lib/types";
import { convert }          from "@/lib/convert";
import { useNetworkMonitor }from "@/hooks/useNetworkMonitor";
import { useImageEstimates }from "@/hooks/useImageEstimates";
import DropZone             from "@/components/DropZone";
import FormatSelector       from "@/components/FormatSelector";
import CompressionPanel     from "@/components/CompressionPanel";
import BatchQueue           from "@/components/BatchQueue";
import PrivacyShield        from "@/components/PrivacyShield";
import ImagePreview         from "@/components/ImagePreview";
import ImageOptions         from "@/components/ImageOptions";
import DonationBanner      from "@/components/DonationBanner";

type Stage = "pick-category" | "pick-options" | "converting" | "done";

function fmt(b: number) {
  if (b < 1024)      return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(1)} GB`;
}

let jobIdCounter = 0;
function mkJob(file: File): FileJob {
  return { id: String(++jobIdCounter), file, status: "pending", progress: -1, statusMsg: "" };
}

export default function Home() {
  const [stage,     setStage]     = useState<Stage>("pick-category");
  const [category,  setCategory]  = useState<Category>();
  const [jobs,      setJobs]      = useState<FileJob[]>([]);
  const [targetFmt, setTargetFmt] = useState<TargetFormat>();
  const [mode,      setMode]      = useState<"compress" | "convert">("convert");
  const [compress,  setCompress]  = useState(false);
  const [quality,   setQuality]   = useState(0.75);
  const [resize,    setResize]    = useState<ImageResizeOpts>({ keepAspect: true });
  const [stripExif, setStripExif] = useState(true);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Network monitor active only while converting or done
  const monitoring   = stage === "converting" || stage === "done";
  const netStats     = useNetworkMonitor(monitoring);

  // Live size estimates for selected format (images only)
  const firstFile  = jobs[0]?.file;
  const estimates  = useImageEstimates(
    category?.id === "image" ? firstFile : undefined,
    quality
  );

  // ── helpers ───────────────────────────────────────────────────────────

  const selectCategory = (cat: Category) => {
    setCategory(cat);
    setJobs([]);
    setTargetFmt(undefined);
    setStage("pick-options");
  };

  const addFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    let detectedCat = category;

    for (const f of files) {
      const cat = detectCategory(f) ?? category;
      if (!cat) continue;
      if (!detectedCat) detectedCat = cat;
      validFiles.push(f);
    }
    if (!validFiles.length) return;

    if (!category && detectedCat) setCategory(detectedCat);

    const ext     = validFiles[0].name.split(".").pop()?.toLowerCase() ?? "";
    const formats = getTargetFormats(ext);
    if (!targetFmt && formats.length) {
      setTargetFmt(getRecommended(ext) ?? formats[0]);
    }

    // Load natural dims for first image (for resize UI)
    if (detectedCat?.id === "image") {
      const url = URL.createObjectURL(validFiles[0]);
      const img = new Image();
      img.onload = () => {
        setNaturalDims({ w: img.naturalWidth, h: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    setJobs(prev => {
      const newJobs = validFiles.map(mkJob);
      const updated = [...prev, ...newJobs];
      if (prev.length === 0) {
        setMode("convert");
        setCompress(false);
      }
      return updated;
    });
    setStage("pick-options");
  }, [category, targetFmt]);

  const removeJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id));

  const selectMode = (m: "compress" | "convert") => {
    setMode(m);
    if (m === "compress") {
      const ext  = jobs[0]?.file.name.split(".").pop()?.toLowerCase() ?? "";
      const mime = jobs[0]?.file.type ?? "";
      setTargetFmt({ ext, label: ext.toUpperCase(), mime, badges: [], description: "Same format, reduced file size" });
      setCompress(true);
    } else {
      const ext     = jobs[0]?.file.name.split(".").pop()?.toLowerCase() ?? "";
      const formats = getTargetFormats(ext);
      setTargetFmt(getRecommended(ext) ?? formats[0]);
      setCompress(false);
    }
  };

  // ── conversion ────────────────────────────────────────────────────────

  const startConversion = async () => {
    if (!jobs.length || !targetFmt) return;
    setStage("converting");

    const updateJob = (id: string, patch: Partial<FileJob>) =>
      setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));

    for (const job of jobs) {
      updateJob(job.id, { status: "converting", progress: -1, statusMsg: "Starting…" });
      try {
        const blob = await convert(job.file, {
          targetExt:  targetFmt.ext,
          targetMime: targetFmt.mime,
          compress:   mode === "compress" ? true : compress,
          quality,
          resize:     category?.id === "image" ? resize : undefined,
          stripExif:  category?.id === "image" ? stripExif : undefined,
          onProgress: p => updateJob(job.id, { progress: p }),
          onStatus:   s => updateJob(job.id, { statusMsg: s }),
        });
        const baseName = job.file.name.replace(/\.[^.]+$/, "");
        updateJob(job.id, { status: "done", progress: 100, result: blob, resultName: `${baseName}.${targetFmt.ext}` });
      } catch (e) {
        updateJob(job.id, { status: "error", error: (e as Error).message ?? "Failed" });
      }
    }
    setStage("done");
  };

  // ── ZIP download ──────────────────────────────────────────────────────

  const downloadZip = async () => {
    const doneJobs = jobs.filter(j => j.status === "done" && j.result);
    if (!doneJobs.length) return;
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    for (const j of doneJobs) zip.file(j.resultName!, j.result!);
    const blob = await zip.generateAsync({ type: "blob" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: "filefettle-batch.zip" });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const reset = () => {
    setStage("pick-category");
    setCategory(undefined);
    setJobs([]);
    setTargetFmt(undefined);
    setMode("convert");
    setCompress(false);
    setQuality(0.75);
    setResize({ keepAspect: true });
    setStripExif(true);
    setNaturalDims(undefined);
  };

  const srcExt           = jobs[0]?.file.name.split(".").pop()?.toLowerCase() ?? "";
  const availableFormats = getTargetFormats(srcExt);
  const doneJobs         = jobs.filter(j => j.status === "done" && j.result);
  const isImage          = category?.id === "image";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header style={{ borderBottom: "1px solid var(--border)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>⟳</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em" }}>
                file<span style={{ color: "var(--accent)" }}>fettle</span>
              </span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge badge-green" style={{ fontSize: 11 }}>🔒 100% Client-side</span>
              <span className="badge badge-purple" style={{ fontSize: 11 }}>∞ No limits</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ── pick-category ─────────────────────────────────────────── */}
        {stage === "pick-category" && (
          <div className="fade-in">
            <div className="landing-grid">

              {/* ── Left column: pitch + category list ────────────────── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Headline */}
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 10 }}>
                    Convert any file,<br />
                    <span style={{ color: "var(--accent)" }}>instantly & privately.</span>
                  </h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                    100% in your browser — your files never touch a server.
                  </p>
                </div>

                {/* No-limits pills */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { icon: "∞", label: "No file size limit" },
                    { icon: "🔒", label: "Files never leave your device" },
                    { icon: "⚡", label: "No daily limits" },
                    { icon: "👤", label: "No account required" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, width: 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "var(--border)" }} />

                {/* Category list */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>
                    Choose file type
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        className="cat-btn"
                        style={{ "--cat-color": cat.color } as React.CSSProperties}
                        onClick={() => selectCategory(cat)}
                      >
                        <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: "center" }}>{cat.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 1 }}>{cat.label}</p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {cat.formats.map(f => f.label).join(" · ")}
                          </p>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>›</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right column: drop zone ────────────────────────────── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                  Drop or select a file to get started
                </p>

                <DonationBanner variant="compact" />

                <div style={{
                  flex: 1,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  <DropZone multiple onFiles={addFiles} minHeight={260} />

                  {/* Supported format chips — inside the box, below the drop area */}
                  <div style={{ padding: "12px 16px 14px", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Supported formats</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {["PNG","JPG","JFIF","HEIC","HEIF","WebP","AVIF","GIF","SVG","TIFF","BMP","ICO","MP3","WAV","FLAC","OGG","OGA","AAC","M4A","OPUS","AIFF","WMA","AMR","MKA","MP2","AC3","DTS","CAF","WV","TTA","SPX","MP4","WebM","MOV","AVI","MKV","FLV","WMV","MPG","MPEG","TS","M2TS","VOB","ASF","RM","RMVB","M2V","DV","3GP","3G2","F4V","PDF","DOCX","TXT","HTML","MD","RTF","CSV","JSON","JSONL","NDJSON","XML","YAML","XLSX","XLS","XLSB","XLSM","ODS","TSV","DBF","DIF","TOML","INI"].map(f => (
                        <span key={f} style={{
                          fontSize: 10, fontWeight: 600,
                          padding: "2px 7px", borderRadius: 999,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border)",
                          color: "var(--text-muted)",
                          letterSpacing: "0.02em",
                        }}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── pick-options ──────────────────────────────────────────── */}
        {stage === "pick-options" && category && (
          <div className="fade-in">
            <StepHeader step={1} label="Your files" onBack={reset} />

            {/* File queue */}
            <div className="mt-4">
              <BatchQueue
                jobs={jobs}
                onRemove={removeJob}
                onAdd={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = category.accept;
                  input.multiple = true;
                  input.onchange = () => addFiles(Array.from(input.files ?? []));
                  input.click();
                }}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <StepHeader step={2} label="What would you like to do?" onBack={() => {}} />

              {/* Mode cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                {(["compress", "convert"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => selectMode(m)}
                    style={{
                      background: mode === m ? "var(--accent-dim)" : "var(--bg-elevated)",
                      border: `1px solid ${mode === m ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                      boxShadow: mode === m ? "0 0 0 1px var(--accent)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{m === "compress" ? "🗜️" : "🔄"}</div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                      {m === "compress" ? "Compress only" : "Convert format"}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                      {m === "compress" ? "Keep format, reduce file size" : "Change to a different format"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Compress-only controls */}
            {mode === "compress" && (
              <div className="fade-in mt-4">
                <QualitySlider quality={quality} onQuality={setQuality} categoryId={category.id} />
              </div>
            )}

            {/* Convert controls */}
            {mode === "convert" && (
              <div className="fade-in mt-5">
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                  Output format
                </p>
                <FormatSelector
                  formats={availableFormats}
                  selected={targetFmt?.ext}
                  onSelect={setTargetFmt}
                  estimates={isImage ? estimates : undefined}
                />
                <div className="mt-4">
                  <CompressionPanel enabled={compress} quality={quality} onToggle={setCompress} onQuality={setQuality} categoryId={category.id} />
                </div>
              </div>
            )}

            {/* Image-specific options */}
            {isImage && (
              <div className="mt-4 fade-in">
                <ImageOptions
                  resize={resize}
                  onChange={setResize}
                  stripExif={stripExif}
                  onStripExif={setStripExif}
                  naturalW={naturalDims?.w}
                  naturalH={naturalDims?.h}
                />
              </div>
            )}

            <button
              className="btn-primary mt-5 w-full py-3 text-base"
              disabled={!targetFmt || !jobs.length}
              onClick={startConversion}
            >
              {mode === "compress"
                ? `Compress ${jobs.length} file${jobs.length !== 1 ? "s" : ""}`
                : `Convert ${jobs.length} file${jobs.length !== 1 ? "s" : ""} to .${targetFmt?.ext.toUpperCase()}`}
            </button>

            {(category.id === "audio" || category.id === "video") && (
              <p className="text-xs text-center mt-2" style={{ color: "var(--text-muted)" }}>
                Audio/video uses FFmpeg WebAssembly — first run downloads ~30 MB (cached afterwards).
              </p>
            )}
          </div>
        )}

        {/* ── converting ────────────────────────────────────────────── */}
        {stage === "converting" && (
          <div className="fade-in">
            <div style={{ marginBottom: 20 }}>
              <PrivacyShield stats={netStats} done={false} />
            </div>
            <BatchQueue jobs={jobs} compact />
            <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
              Files are processed one at a time, entirely in your browser.
            </p>
          </div>
        )}

        {/* ── done ──────────────────────────────────────────────────── */}
        {stage === "done" && (
          <div className="fade-in">
            {/* Privacy verification */}
            <div style={{ marginBottom: 20 }}>
              <PrivacyShield stats={netStats} done={true} />
            </div>

            {/* Summary */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
              <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                {doneJobs.length === jobs.length ? "All done!" : `${doneJobs.length} of ${jobs.length} complete`}
              </h2>
              {doneJobs.length > 0 && (() => {
                const totalIn  = doneJobs.reduce((s, j) => s + j.file.size, 0);
                const totalOut = doneJobs.reduce((s, j) => s + (j.result?.size ?? 0), 0);
                const saved    = totalIn > totalOut ? Math.round((1 - totalOut / totalIn) * 100) : 0;
                return (
                  <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    {fmt(totalIn)} → {fmt(totalOut)}{saved > 0 ? ` · ${saved}% smaller` : ""}
                  </p>
                );
              })()}
            </div>

            {/* Results queue */}
            <BatchQueue jobs={jobs} compact />

            {/* Before/after for single image */}
            {isImage && doneJobs.length === 1 && doneJobs[0].result && (
              <ImagePreview
                originalFile={doneJobs[0].file}
                resultBlob={doneJobs[0].result}
                originalSize={doneJobs[0].file.size}
                resultSize={doneJobs[0].result.size}
              />
            )}

            {/* Bulk download */}
            {doneJobs.length > 1 && (
              <button className="btn-primary w-full py-3 text-base mt-5" onClick={downloadZip}>
                ↓ Download all as ZIP ({doneJobs.length} files)
              </button>
            )}

            <button
              onClick={reset}
              style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", fontSize: 14, marginTop: 10 }}
            >
              Convert more files
            </button>

            <div style={{ marginTop: 20 }}>
              <DonationBanner />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function QualitySlider({ quality, onQuality, categoryId }: { quality: number; onQuality: (v: number) => void; categoryId?: string }) {
  const isAV = categoryId === "audio" || categoryId === "video";
  function label(q: number) {
    if (q <= 0.25) return "Maximum compression";
    if (q <= 0.5)  return "Balanced";
    if (q <= 0.75) return "High quality";
    return "Maximum quality";
  }
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div>
        <p className="font-semibold text-sm">Compression level</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {isAV ? "Controls output bitrate" : "Controls output quality"}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <span>Smallest file</span>
          <span className="font-semibold" style={{ color: "var(--accent)" }}>{label(quality)}</span>
          <span>Best quality</span>
        </div>
        <input type="range" className="slider" min={0} max={100} value={Math.round(quality * 100)} onChange={e => onQuality(parseInt(e.target.value) / 100)} />
        <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>
    </div>
  );
}

function StepHeader({ step, label, onBack }: { step: number; label: string; onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", borderRadius: 6, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ←
        </button>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {step}
        </span>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>{label}</h2>
      </div>
    </div>
  );
}
