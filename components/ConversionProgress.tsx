"use client";

interface Props {
  status:   string;
  progress: number;  // 0–100, or -1 for indeterminate
}

export default function ConversionProgress({ status, progress }: Props) {
  const indeterminate = progress < 0;
  return (
    <div className="card p-5 flex flex-col gap-3 fade-in">
      <div className="flex items-center gap-3">
        <div className="spin" style={{
          width: 18, height: 18, flexShrink: 0,
          border: "2px solid rgba(255,255,255,0.1)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
        }} />
        <span className="text-sm font-medium">{status}</span>
      </div>
      <div className="progress-bar">
        {indeterminate ? (
          <div style={{
            height: "100%", width: "40%",
            background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
            borderRadius: 999,
            animation: "indeterminate 1.4s ease-in-out infinite",
          }} />
        ) : (
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        )}
      </div>
      {!indeterminate && (
        <p className="text-xs text-right" style={{ color: "var(--text-muted)" }}>{progress}%</p>
      )}
      <style>{`@keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style>
    </div>
  );
}
