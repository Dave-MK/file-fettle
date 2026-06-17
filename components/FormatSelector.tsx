"use client";

import { TargetFormat, BADGE_META } from "@/lib/formats";

function fmtBytes(b: number) {
  if (b < 1024)      return `~${b} B`;
  if (b < 1024 ** 2) return `~${(b / 1024).toFixed(0)} KB`;
  return `~${(b / 1024 ** 2).toFixed(1)} MB`;
}

interface Props {
  formats:    TargetFormat[];
  selected?:  string;
  onSelect:   (fmt: TargetFormat) => void;
  estimates?: Map<string, number>;
}

export default function FormatSelector({ formats, selected, onSelect, estimates }: Props) {
  if (!formats.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {formats.map(fmt => {
        const active    = selected === fmt.ext;
        const estimated = estimates?.get(fmt.ext);
        return (
          <button
            key={fmt.ext}
            className={`format-btn${active ? " format-btn-active" : ""} p-4 w-full`}
            onClick={() => onSelect(fmt)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontWeight: 700, fontSize: 12, borderRadius: 5, padding: "3px 8px",
                    background: active ? "var(--accent)" : "rgba(255,255,255,0.08)",
                    color: active ? "#fff" : "var(--text)",
                    minWidth: 48, textAlign: "center", flexShrink: 0,
                  }}
                >
                  .{fmt.ext.toUpperCase()}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {fmt.description}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {estimated !== undefined && (
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {fmtBytes(estimated)}
                  </span>
                )}
                {fmt.badges.map(b => {
                  const meta = BADGE_META[b];
                  return (
                    <span key={b} className={`badge ${meta.cls}`}>
                      {meta.icon} {meta.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
