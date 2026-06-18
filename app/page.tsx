"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  CATEGORIES, Category, TargetFormat,
  getTargetFormats, getRecommended, detectCategory,
} from "@/lib/formats";
import { FileJob, ImageResizeOpts } from "@/lib/types";
import { convert }           from "@/lib/convert";
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor";
import { useImageEstimates } from "@/hooks/useImageEstimates";
import DropZone              from "@/components/DropZone";
import FormatSelector        from "@/components/FormatSelector";
import CompressionPanel      from "@/components/CompressionPanel";
import BatchQueue            from "@/components/BatchQueue";
import PrivacyShield         from "@/components/PrivacyShield";
import ImagePreview          from "@/components/ImagePreview";
import ImageOptions          from "@/components/ImageOptions";
import DonationBanner        from "@/components/DonationBanner";

type Stage = "pick-category" | "pick-options" | "converting" | "done";

const HOMEPAGE_TOOLS = [
  { href: "/tools/pdf-merge",        icon: "📎", title: "PDF Merge" },
  { href: "/tools/pdf-split",        icon: "✂️", title: "PDF Split" },
  { href: "/tools/image-resizer",    icon: "📐", title: "Image Resizer" },
  { href: "/tools/image-compressor", icon: "🗜️", title: "Image Compressor" },
  { href: "/tools/file-hash",        icon: "🔑", title: "File Hash" },
  { href: "/tools/base64",           icon: "🔠", title: "Base64" },
];

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
  const [stage,       setStage]       = useState<Stage>("pick-category");
  const [category,    setCategory]    = useState<Category>();
  const [jobs,        setJobs]        = useState<FileJob[]>([]);
  const [targetFmt,   setTargetFmt]   = useState<TargetFormat>();
  const [mode,        setMode]        = useState<"compress" | "convert">("convert");
  const [compress,    setCompress]    = useState(false);
  const [quality,     setQuality]     = useState(0.75);
  const [resize,      setResize]      = useState<ImageResizeOpts>({ keepAspect: true });
  const [stripExif,   setStripExif]   = useState(true);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number }>();
  const [fmtTab,      setFmtTab]      = useState(CATEGORIES[0].id);
  const mainRef = useRef<HTMLElement>(null);

  const monitoring = stage === "converting" || stage === "done";
  const netStats   = useNetworkMonitor(monitoring);
  const firstFile  = jobs[0]?.file;
  const estimates  = useImageEstimates(
    category?.id === "image" ? firstFile : undefined,
    quality
  );

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
    if (!targetFmt && formats.length) setTargetFmt(getRecommended(ext) ?? formats[0]);
    if (detectedCat?.id === "image") {
      const url = URL.createObjectURL(validFiles[0]);
      const img = new Image();
      img.onload = () => { setNaturalDims({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
      img.src = url;
    }
    setJobs(prev => {
      if (prev.length === 0) { setMode("convert"); setCompress(false); }
      return [...prev, ...validFiles.map(mkJob)];
    });
    setStage("pick-options");
  }, [category, targetFmt]);

  const removeJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id));

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) { e.preventDefault(); addFiles(files); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  useEffect(() => {
    if (stage !== "pick-category") mainRef.current?.focus();
  }, [stage]);

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
          resize:    category?.id === "image" ? resize : undefined,
          stripExif: category?.id === "image" ? stripExif : undefined,
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

  const downloadZip = async () => {
    const doneJobs = jobs.filter(j => j.status === "done" && j.result);
    if (!doneJobs.length) return;
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    for (const j of doneJobs) zip.file(j.resultName!, j.result!);
    const blob = await zip.generateAsync({ type: "blob" });
    const url  = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "filefettle-batch.zip" });
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
    <main id="main-content" ref={mainRef} tabIndex={-1} style={{ minHeight: "100vh", outline: "none" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── pick-category ─────────────────────────────────────────── */}
        {stage === "pick-category" && (
          <div className="fade-in">
            <div className="landing-grid">

              {/* Left: pitch + category list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <h1 style={{ fontSize: "clamp(24px,4vw,30px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 10 }}>
                    Convert any file,<br />
                    <span style={{ color: "var(--accent)" }}>instantly & privately.</span>
                  </h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65 }}>
                    100% in your browser — your files never touch a server.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "No file size limit",
                    "Files never leave your device",
                    "No daily limits",
                    "No account required",
                  ].map(label => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <circle cx="7" cy="7" r="6.5" stroke="rgba(34,197,94,0.4)" />
                        <path d="M4.5 7l2 2 3-3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "var(--border)" }} />

                <div>
                  <p className="section-label">Choose file type</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        className="cat-btn"
                        style={{ "--cat-color": cat.color } as React.CSSProperties}
                        onClick={() => selectCategory(cat)}
                      >
                        <span style={{ fontSize: 18, flexShrink: 0, width: 26, textAlign: "center" }}>{cat.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 1 }}>{cat.label}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {cat.formats.slice(0, 6).map(f => f.label).join(" · ")}
                            {cat.formats.length > 6 ? ` · +${cat.formats.length - 6} more` : ""}
                          </p>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: "var(--text-muted)" }}>
                          <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: drop zone + format tabs + tools */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p className="section-label">Drop or select a file to get started</p>

                <DonationBanner variant="compact" />

                <div style={{
                  flex: 1,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  <DropZone multiple onFiles={addFiles} minHeight={240} />

                  {/* Format tabs */}
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    <div role="tablist" aria-label="Format categories" style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 10px" }}>
                      {CATEGORIES.map((cat, idx) => {
                        const active = fmtTab === cat.id;
                        return (
                          <button
                            key={cat.id}
                            role="tab"
                            aria-selected={active}
                            aria-controls={`fmt-panel-${cat.id}`}
                            id={`fmt-tab-${cat.id}`}
                            tabIndex={active ? 0 : -1}
                            onClick={() => setFmtTab(cat.id)}
                            onKeyDown={e => {
                              if (e.key === "ArrowRight") setFmtTab(CATEGORIES[(idx + 1) % CATEGORIES.length].id);
                              if (e.key === "ArrowLeft")  setFmtTab(CATEGORIES[(idx - 1 + CATEGORIES.length) % CATEGORIES.length].id);
                              if (e.key === "Home") { e.preventDefault(); setFmtTab(CATEGORIES[0].id); }
                              if (e.key === "End")  { e.preventDefault(); setFmtTab(CATEGORIES[CATEGORIES.length - 1].id); }
                            }}
                            style={{
                              background: "none", border: "none",
                              borderBottom: active ? `2px solid ${cat.color}` : "2px solid transparent",
                              padding: "7px 7px 5px",
                              cursor: "pointer", fontSize: 11,
                              fontWeight: active ? 700 : 500,
                              color: active ? cat.color : "var(--text-muted)",
                              marginBottom: -1, transition: "color 0.15s", flexShrink: 0,
                            }}
                          >
                            {cat.icon} {cat.label}
                          </button>
                        );
                      })}
                    </div>
                    {CATEGORIES.filter(c => c.id === fmtTab).map(cat => (
                      <div
                        key={cat.id}
                        role="tabpanel"
                        id={`fmt-panel-${cat.id}`}
                        aria-labelledby={`fmt-tab-${cat.id}`}
                        style={{ padding: "9px 12px 11px", display: "flex", flexWrap: "wrap", gap: 4 }}
                      >
                        {cat.formats.map(f => (
                          <span
                            key={f.ext}
                            style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 7px",
                              borderRadius: 999,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--border)",
                              color: "var(--text-muted)", letterSpacing: "0.02em",
                            }}
                          >
                            {f.label}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline tool cards */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <p className="section-label" style={{ marginBottom: 0 }}>File Tools</p>
                    <a href="/tools" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                      View all →
                    </a>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {HOMEPAGE_TOOLS.map(tool => (
                      <a key={tool.href} href={tool.href} style={{ textDecoration: "none" }}>
                        <div className="card" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 9 }}>
                          <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1 }}>{tool.icon}</span>
                          <p style={{ fontWeight: 600, fontSize: 12, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tool.title}
                          </p>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ color: "var(--accent)", flexShrink: 0 }}>
                            <path d="M2.5 6h7M6.5 3L9.5 6l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* How it works */}
            <section aria-labelledby="how-heading" style={{ marginTop: 56 }}>
              <h2 id="how-heading" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20 }}>
                How it works
              </h2>
              <div className="how-grid">
                {([
                  { n: "1", title: "Drop your file",       desc: "Drag & drop onto the zone, click to browse, or paste from clipboard. Any size, any device." },
                  { n: "2", title: "Choose a format",      desc: "Pick a category, then select the output format — 80+ options across images, audio, video, documents and data." },
                  { n: "3", title: "Download instantly",   desc: "Your file is converted locally in seconds and downloaded. Zero data ever leaves your device." },
                ] as const).map(step => (
                  <div key={step.n} className="card p-4" style={{ flex: "1 1 200px", minWidth: 180, display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: "var(--accent-dim)", border: "1px solid rgba(124,106,247,0.3)",
                      color: "var(--accent)", fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {step.n}
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{step.title}</p>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section aria-labelledby="faq-heading" style={{ marginTop: 56 }}>
              <h2 id="faq-heading" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20 }}>
                Frequently asked questions
              </h2>
              <FaqAccordion />
            </section>
          </div>
        )}

        {/* ── pick-options ──────────────────────────────────────────── */}
        {stage === "pick-options" && category && (
          <div className="fade-in">
            <StepHeader step={1} label="Your files" onBack={reset} />
            <div className="mt-4">
              <BatchQueue
                jobs={jobs}
                onRemove={removeJob}
                onAdd={() => {
                  const input = document.createElement("input");
                  input.type     = "file";
                  input.accept   = category.accept;
                  input.multiple = true;
                  input.onchange = () => addFiles(Array.from(input.files ?? []));
                  input.click();
                }}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <StepHeader step={2} label="What would you like to do?" onBack={() => {}} />
              <div className="mode-grid">
                {(["compress", "convert"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => selectMode(m)}
                    style={{
                      background: mode === m ? "var(--accent-dim)" : "var(--bg-elevated)",
                      border: `1px solid ${mode === m ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)", padding: "14px 16px",
                      cursor: "pointer", textAlign: "left",
                      boxShadow: mode === m ? "var(--shadow-glow)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{m === "compress" ? "🗜️" : "🔄"}</div>
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

            {mode === "compress" && (
              <div className="fade-in mt-4">
                <QualitySlider quality={quality} onQuality={setQuality} categoryId={category.id} />
              </div>
            )}

            {mode === "convert" && (
              <div className="fade-in mt-5">
                <p className="section-label">Output format</p>
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
                : `Convert ${jobs.length} file${jobs.length !== 1 ? "s" : ""} → .${targetFmt?.ext.toUpperCase()}`}
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
            <div style={{ marginBottom: 20 }}>
              <PrivacyShield stats={netStats} done={true} />
            </div>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 42, marginBottom: 8 }}>✅</div>
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

            <BatchQueue jobs={jobs} compact />

            {isImage && doneJobs.length === 1 && doneJobs[0].result && (
              <ImagePreview
                originalFile={doneJobs[0].file}
                resultBlob={doneJobs[0].result}
                originalSize={doneJobs[0].file.size}
                resultSize={doneJobs[0].result.size}
              />
            )}

            {doneJobs.length > 1 && (
              <button className="btn-primary w-full py-3 text-base mt-5" onClick={downloadZip}>
                ↓ Download all as ZIP ({doneJobs.length} files)
              </button>
            )}

            <button
              onClick={reset}
              className="btn-secondary w-full mt-3"
              style={{ padding: "10px", fontSize: 14 }}
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

const FAQ_ITEMS = [
  { q: "How do I convert a file online for free?", a: "Drop your file onto FileFettle, select your output format, and click Convert. Your file is processed instantly inside your browser — no upload, no registration, completely free." },
  { q: "Do my files get uploaded to a server?", a: "Never. FileFettle uses WebAssembly and the Canvas API to process files entirely in your browser. Zero bytes of your data are ever sent to any server." },
  { q: "What file formats can I convert?", a: "Over 80 formats across 5 categories — images (JPG, PNG, WebP, AVIF, HEIC, GIF, SVG, TIFF, BMP), audio (MP3, WAV, FLAC, OGG, AAC, M4A, OPUS, AIFF, WMA), video (MP4, WebM, MOV, AVI, MKV, WMV, MPEG), documents (PDF, DOCX, TXT, HTML, Markdown), and data (CSV, JSON, XML, YAML, XLSX, XLS, ODS, TOML, INI)." },
  { q: "Is there a file size limit?", a: "No. Since conversion runs in your browser, there's no server-side size limit. The only constraint is your device's available RAM — which handles most files without issue." },
  { q: "Is FileFettle free to use?", a: "Yes — completely free, forever. No subscriptions, no paywalls, no ads, no tracking. Optional voluntary contributions help keep the project running." },
  { q: "Why does my first video or audio conversion take a moment to start?", a: "Video and audio conversion uses FFmpeg compiled to WebAssembly. The first time you convert, your browser downloads a ~30 MB package — this only happens once and is then cached, so subsequent conversions start instantly." },
  { q: "How do I convert an image to JPG, PNG, or WebP?", a: "Drop your image (supports JPG, PNG, HEIC, GIF, TIFF, BMP, SVG, AVIF and more), choose your output format — JPG, PNG, WebP, etc. — optionally resize or adjust quality, then click Convert." },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq-section">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="faq-item">
          <button
            className="faq-trigger"
            aria-expanded={open === i}
            aria-controls={`faq-answer-${i}`}
            id={`faq-q-${i}`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="faq-q">{item.q}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 18, fontWeight: 400, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">
              {open === i ? "−" : "+"}
            </span>
          </button>
          <div id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={open !== i} className="faq-answer">
            {item.a}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepHeader({ step, label, onBack }: { step: number; label: string; onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={onBack}
        style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
          borderRadius: 7, width: 30, height: 30, cursor: "pointer",
          fontSize: 14, color: "var(--text-muted)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
        aria-label="Go back"
      >
        ←
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "var(--accent-grad)", color: "#fff",
          fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          {step}
        </span>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>{label}</h2>
      </div>
    </div>
  );
}
