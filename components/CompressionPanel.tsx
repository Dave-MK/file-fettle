"use client";

interface Props {
  enabled:     boolean;
  quality:     number;
  onToggle:    (v: boolean) => void;
  onQuality:   (v: number) => void;
  categoryId?: string;
}

function qualityLabel(q: number): string {
  if (q <= 0.25) return "Maximum compression";
  if (q <= 0.5)  return "Balanced";
  if (q <= 0.75) return "High quality";
  return "Maximum quality";
}

export default function CompressionPanel({ enabled, quality, onToggle, onQuality, categoryId }: Props) {
  const isAV = categoryId === "audio" || categoryId === "video";
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Compress file</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {isAV ? "Reduce bitrate to shrink file size" : "Reduce file size (may reduce quality)"}
          </p>
        </div>
        <button
          style={{
            position: "relative",
            width: 44, height: 24,
            borderRadius: 999,
            background: enabled ? "var(--accent)" : "rgba(255,255,255,0.1)",
            border: "none", cursor: "pointer",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
          onClick={() => onToggle(!enabled)}
          aria-pressed={enabled}
        >
          <span style={{
            position: "absolute", top: 3,
            left: enabled ? 23 : 3,
            width: 18, height: 18,
            borderRadius: "50%", background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }} />
        </button>
      </div>

      {enabled && (
        <div className="fade-in flex flex-col gap-2 pt-1">
          <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span>Smallest</span>
            <span className="font-semibold" style={{ color: "var(--accent)" }}>{qualityLabel(quality)}</span>
            <span>Best quality</span>
          </div>
          <input
            type="range" className="slider"
            min={0} max={100}
            value={Math.round(quality * 100)}
            onChange={(e) => onQuality(parseInt(e.target.value) / 100)}
          />
          <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
}
