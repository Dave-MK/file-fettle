"use client";

import { FileJob } from "@/lib/types";

interface Props {
  jobs:      FileJob[];
  onRemove?: (id: string) => void;
  onAdd?:    () => void;
  compact?:  boolean;
}

function fmtBytes(b: number) {
  if (b < 1024)      return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

function StatusBadge({ job }: { job: FileJob }) {
  if (job.status === "done") {
    const saved = job.result && job.file.size > job.result.size
      ? `${Math.round((1 - job.result.size / job.file.size) * 100)}% smaller`
      : "done";
    return <span className="badge badge-green">{saved}</span>;
  }
  if (job.status === "error") return <span className="badge" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>Error</span>;
  if (job.status === "converting") return <span className="badge badge-purple">Converting…</span>;
  return <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Queued</span>;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function BatchQueue({ jobs, onRemove, onAdd, compact }: Props) {
  const done      = jobs.filter(j => j.status === "done").length;
  const hasErrors = jobs.some(j => j.status === "error");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {jobs.length} file{jobs.length !== 1 ? "s" : ""}{done > 0 ? ` · ${done} done` : ""}
          </p>
          {onAdd && (
            <button
              onClick={onAdd}
              style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              + Add more
            </button>
          )}
        </div>
      )}

      {jobs.map(job => (
        <div
          key={job.id}
          style={{
            background: "var(--bg-elevated)",
            border: `1px solid ${job.status === "converting" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.file.name}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {fmtBytes(job.file.size)}
                {job.result && ` → ${fmtBytes(job.result.size)}`}
              </p>
            </div>
            <StatusBadge job={job} />
            {job.status === "done" && job.result && job.resultName && (
              <button
                onClick={() => download(job.result!, job.resultName!)}
                className="btn-primary"
                style={{ padding: "4px 10px", fontSize: 12, flexShrink: 0 }}
              >
                ↓
              </button>
            )}
            {onRemove && job.status === "pending" && (
              <button
                onClick={() => onRemove(job.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16, flexShrink: 0, lineHeight: 1 }}
              >
                ✕
              </button>
            )}
          </div>

          {job.status === "converting" && (
            <div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: job.progress >= 0 ? `${job.progress}%` : "40%",
                    animation: job.progress < 0 ? "indeterminate 1.4s ease-in-out infinite" : "none" }}
                />
              </div>
              {job.statusMsg && (
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{job.statusMsg}</p>
              )}
            </div>
          )}

          {job.status === "error" && (
            <p style={{ fontSize: 11, color: "#f87171" }}>{job.error ?? "Conversion failed"}</p>
          )}
        </div>
      ))}

      {hasErrors && (
        <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
          Some files failed — check the format is supported.
        </p>
      )}
    </div>
  );
}
