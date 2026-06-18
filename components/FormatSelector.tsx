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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
      {formats.map(fmt => {
        const active    = selected === fmt.ext;
        const estimated = estimates?.get(fmt.ext);
        return (
          <button
            key={fmt.ext}
            aria-pressed={active}
            className={`format-btn${active ? " format-btn-active" : ""} w-full`}
            style={{ padding: "14px 16px" }}
            onClick={() => onSelect(fmt)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 6 }}>
              <span
                style={{
                  fontWeight: 700, fontSize: 13, borderRadius: 7,
                  padding: "3px 10px",
                  background: active ? "var(--accent)" : "rgba(255,255,255,0.09)",
                  color: active ? "#fff" : "var(--text)",
                  letterSpacing: "0.03em",
                  flexShrink: 0,
                }}
              >
                .{fmt.ext.toUpperCase()}
              </span>
              {fmt.badges.length > 0 && (() => {
                const meta = BADGE_META[fmt.badges[0]];
                return (
                  <span className={`badge ${meta.cls}`} style={{ flexShrink: 0 }}>
                    {meta.icon} {meta.label}
                  </span>
                );
              })()}
            </div>
            <p style={{ fontSize: 12, color: active ? "var(--text)" : "var(--text-muted)", lineHeight: 1.45, marginBottom: estimated !== undefined ? 6 : 0 }}>
              {fmt.description}
            </p>
            {estimated !== undefined && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                {fmtBytes(estimated)}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
