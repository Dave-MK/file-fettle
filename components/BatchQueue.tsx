"use client";

import { FileJob } from "@/lib/types";
import { fmtBytes, downloadBlob } from "@/lib/utils";

interface Props {
  jobs:      FileJob[];
  onRemove?: (id: string) => void;
  onAdd?:    () => void;
  compact?:  boolean;
}

function StatusBadge({ job }: { job: FileJob }) {
  if (job.status === "done") {
    const saved = job.result && job.file.size > job.result.size
      ? `${Math.round((1 - job.result.size / job.file.size) * 100)}% smaller`
      : "done";
    return <span className="badge badge-green">{saved}</span>;
  }
  if (job.status === "error")      return <span className="badge badge-red">Error</span>;
  if (job.status === "converting") return <span className="badge badge-purple">Converting…</span>;
  return <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Queued</span>;
}



export default function BatchQueue({ jobs, onRemove, onAdd, compact }: Props) {
  const done      = jobs.filter(j => j.status === "done").length;
  const hasErrors = jobs.some(j => j.status === "error");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {jobs.length} file{jobs.length !== 1 ? "s" : ""}{done > 0 ? ` · ${done} done` : ""}
          </p>
          {onAdd && (
            <button
              onClick={onAdd}
              style={{ fontSize: 13, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              + Add more
            </button>
          )}
        </div>
      )}

      <div className="batch-queue">
        {jobs.map(job => (
          <div
            key={job.id}
            className={`batch-item ${job.status}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.file.name}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {fmtBytes(job.file.size)}
                  {job.result && <span style={{ color: "var(--green)" }}> → {fmtBytes(job.result.size)}</span>}
                </p>
              </div>
              <StatusBadge job={job} />
              {job.status === "done" && job.result && job.resultName && (
                <button
                  aria-label={`Download ${job.resultName}`}
                  onClick={() => downloadBlob(job.result!, job.resultName!)}
                  className="btn-primary"
                  style={{ padding: "6px 16px", fontSize: 13, flexShrink: 0, minHeight: 36 }}
                >
                  ↓ Save
                </button>
              )}
              {onRemove && job.status === "pending" && (
                <button
                  aria-label={`Remove ${job.file.name}`}
                  onClick={() => onRemove(job.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 17, flexShrink: 0, lineHeight: 1, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation", borderRadius: 6, transition: "color 0.15s" }}
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
                    style={{
                      width: job.progress >= 0 ? `${job.progress}%` : "40%",
                      animation: job.progress < 0 ? "indeterminate 1.4s ease-in-out infinite" : "none",
                    }}
                  />
                </div>
                {job.statusMsg && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5 }}>{job.statusMsg}</p>
                )}
              </div>
            )}

            {job.status === "error" && (
              <p style={{ fontSize: 12, color: "#f87171" }}>{job.error ?? "Conversion failed"}</p>
            )}
          </div>
        ))}
      </div>

      {hasErrors && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
          Some files failed — check the format is supported.
        </p>
      )}
    </div>
  );
}
