"use client";

import { useState, useCallback } from "react";
import { CATEGORIES } from "@/lib/formats";

export interface ConverterEmbedProps {
  fromExt:    string;
  toExt:      string;
  fromLabel:  string;
  toLabel:    string;
  targetMime: string;
  categoryId: string;
}

type JobStatus = "pending" | "converting" | "done" | "error";

interface Job {
  id:         string;
  file:       File;
  status:     JobStatus;
  progress:   number;
  statusMsg:  string;
  result?:    Blob;
  resultName?: string;
  error?:     string;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function fmtBytes(b: number): string {
  if (b < 1024)       return `${b} B`;
  if (b < 1_048_576)  return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

export default function ConverterEmbed({
  fromExt, toExt, fromLabel, toLabel, targetMime, categoryId,
}: ConverterEmbedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);

  const runJob = useCallback(async (job: Job) => {
    const patch = (p: Partial<Job>) =>
      setJobs(prev => prev.map(j => (j.id === job.id ? { ...j, ...p } : j)));

    patch({ status: "converting", progress: 5, statusMsg: "Starting…" });
    try {
      let blob: Blob;

      if (categoryId === "image") {
        const { convertImage } = await import("@/lib/converters/image");
        blob = await convertImage(job.file, { targetMime, quality: 0.92, compress: false });

      } else if (categoryId === "audio" || categoryId === "video") {
        const { convertAudioVideo } = await import("@/lib/converters/audio-video");
        blob = await convertAudioVideo(job.file, {
          targetExt:  toExt,
          targetMime,
          compress:   false,
          quality:    0.85,
          onProgress: p => patch({ progress: p }),
          onStatus:   m => patch({ statusMsg: m }),
        });

      } else if (categoryId === "document") {
        const { convertDocument } = await import("@/lib/converters/document");
        blob = await convertDocument(job.file, {
          targetExt:  toExt,
          targetMime,
          compress:   false,
          quality:    0.92,
        });

      } else {
        const { convertData } = await import("@/lib/converters/data");
        blob = await convertData(job.file, { targetExt: toExt, targetMime });
      }

      const base = job.file.name.replace(/\.[^.]+$/, "");
      patch({
        status: "done", progress: 100, statusMsg: "Done",
        result: blob, resultName: `${base}.${toExt}`,
      });
    } catch (e) {
      patch({ status: "error", statusMsg: "Failed", error: (e as Error).message });
    }
  }, [categoryId, toExt, targetMime]);

  const handleFiles = useCallback((files: File[]) => {
    const fresh: Job[] = files.map(file => ({
      id: uid(), file, status: "pending", progress: 0, statusMsg: "",
    }));
    setJobs(prev => [...prev, ...fresh]);
    fresh.forEach(j => runJob(j));
  }, [runJob]);

  const triggerDownload = (job: Job) => {
    if (!job.result) return;
    const url = URL.createObjectURL(job.result);
    const a = document.createElement("a");
    a.href = url;
    a.download = job.resultName ?? `converted.${toExt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const category = CATEGORIES.find(c => c.id === categoryId);
  const doneJobs = jobs.filter(j => j.status === "done");
  const inputId  = `ce-${fromExt}-${toExt}`;

  return (
    <div>
      {/* Drop zone */}
      <div
        className="dropzone"
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 12, padding: 40, textAlign: "center",
          cursor: "pointer", minHeight: 180,
        }}
        role="button"
        tabIndex={0}
        aria-label={`Drop ${fromLabel} files here to convert to ${toLabel}`}
        onClick={() => document.getElementById(inputId)?.click()}
        onKeyDown={e => e.key === "Enter" && document.getElementById(inputId)?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dropzone-over"); }}
        onDragLeave={e => e.currentTarget.classList.remove("dropzone-over")}
        onDrop={e => {
          e.preventDefault();
          e.currentTarget.classList.remove("dropzone-over");
          const files = Array.from(e.dataTransfer.files);
          if (files.length) handleFiles(files);
        }}
      >
        <input
          id={inputId}
          type="file"
          style={{ display: "none" }}
          accept={category?.accept ?? "*/*"}
          multiple
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) handleFiles(files);
            e.target.value = "";
          }}
        />
        <div style={{ fontSize: 40 }}>{category?.icon ?? "📁"}</div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>
            Drop your {fromLabel} files here
          </p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            or click to browse — multiple files supported
          </p>
        </div>
        <div style={{
          fontSize: 12, padding: "4px 12px", borderRadius: 999,
          background: "rgba(255,255,255,0.04)", color: "var(--text-muted)",
          border: "1px solid var(--border)",
        }}>
          🔒 Files never leave your device
        </div>
      </div>

      {/* Job queue */}
      {jobs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          {doneJobs.length > 1 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                className="btn-primary"
                style={{ padding: "8px 20px", fontSize: 14 }}
                onClick={() => doneJobs.forEach(triggerDownload)}
              >
                Download all ({doneJobs.length})
              </button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {jobs.map(job => (
              <div key={job.id} className="card" style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {job.file.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {job.status === "converting" ? (job.statusMsg || "Converting…")
                        : job.status === "done"    ? `✓ Converted · ${fmtBytes(job.result!.size)}`
                        : job.status === "error"   ? `✗ ${job.error}`
                        : `${fmtBytes(job.file.size)} · Queued`}
                    </p>
                  </div>
                  {job.status === "converting" && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>
                      {job.progress}%
                    </span>
                  )}
                  {job.status === "done" && (
                    <button
                      className="btn-primary"
                      style={{ padding: "6px 14px", fontSize: 13, flexShrink: 0 }}
                      onClick={() => triggerDownload(job)}
                      aria-label={`Download ${job.resultName}`}
                    >
                      Download
                    </button>
                  )}
                </div>
                {job.status === "converting" && job.progress > 0 && (
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${job.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            style={{
              marginTop: 14, fontSize: 12, color: "var(--text-muted)",
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}
            onClick={() => setJobs([])}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
