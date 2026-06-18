"use client";

import { ImageResizeOpts } from "@/lib/types";

interface Props {
  resize:    ImageResizeOpts;
  onChange:  (r: ImageResizeOpts) => void;
  stripExif: boolean;
  onStripExif: (v: boolean) => void;
  naturalW?: number;
  naturalH?: number;
}

export default function ImageOptions({ resize, onChange, stripExif, onStripExif, naturalW, naturalH }: Props) {
  const aspect = naturalW && naturalH ? naturalW / naturalH : null;

  const setW = (raw: string) => {
    const w = parseInt(raw) || undefined;
    if (resize.keepAspect && w && aspect) {
      onChange({ ...resize, width: w, height: Math.round(w / aspect) });
    } else {
      onChange({ ...resize, width: w });
    }
  };

  const setH = (raw: string) => {
    const h = parseInt(raw) || undefined;
    if (resize.keepAspect && h && aspect) {
      onChange({ ...resize, height: h, width: Math.round(h * aspect) });
    } else {
      onChange({ ...resize, height: h });
    }
  };

  return (
    <div className="card p-4 flex flex-col gap-4">
      <p className="font-semibold text-sm">Image options</p>

      {/* Resize */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Resize (optional)</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 100px", minWidth: 80 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Width (px)</label>
            <input
              type="number"
              min={1}
              placeholder={naturalW ? String(naturalW) : "auto"}
              value={resize.width ?? ""}
              onChange={e => setW(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text)", fontSize: 13, outline: "none",
                minHeight: 40,
              }}
            />
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 18, marginTop: 16, flexShrink: 0 }}>×</span>
          <div style={{ flex: "1 1 100px", minWidth: 80 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Height (px)</label>
            <input
              type="number"
              min={1}
              placeholder={naturalH ? String(naturalH) : "auto"}
              value={resize.height ?? ""}
              onChange={e => setH(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text)", fontSize: 13, outline: "none",
                minHeight: 40,
              }}
            />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={resize.keepAspect}
            onChange={e => onChange({ ...resize, keepAspect: e.target.checked })}
            style={{ accentColor: "var(--accent)" }}
          />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Lock aspect ratio</span>
        </label>
        {(resize.width || resize.height) && (
          <button
            onClick={() => onChange({ ...resize, width: undefined, height: undefined })}
            style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            ✕ Clear resize
          </button>
        )}
      </div>

      {/* EXIF strip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600 }}>Strip EXIF metadata</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            Removes GPS, camera info, and personal data
          </p>
        </div>
        <button
          style={{
            position: "relative", flexShrink: 0,
            width: 44, height: 24, borderRadius: 999,
            background: stripExif ? "var(--accent)" : "rgba(255,255,255,0.1)",
            border: "none", cursor: "pointer", transition: "background 0.2s",
          }}
          onClick={() => onStripExif(!stripExif)}
          aria-pressed={stripExif}
        >
          <span style={{
            position: "absolute", top: 3, left: stripExif ? 23 : 3,
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }} />
        </button>
      </div>
    </div>
  );
}
