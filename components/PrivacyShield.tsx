"use client";

import { NetworkStats } from "@/hooks/useNetworkMonitor";

interface Props {
  stats:    NetworkStats;
  done:     boolean;
}

export default function PrivacyShield({ stats, done }: Props) {
  const clean = stats.externalRequests === 0;

  return (
    <div
      style={{
        background: clean ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
        border: `1px solid ${clean ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.3)"}`,
        borderRadius: 10,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{clean ? "🛡️" : "⚠️"}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: clean ? "var(--green)" : "#f87171" }}>
          {clean
            ? done ? "Conversion verified private" : "Monitoring network…"
            : `${stats.externalRequests} external request${stats.externalRequests !== 1 ? "s" : ""} detected`}
        </p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          {clean
            ? "0 bytes of your file data sent to any external server"
            : "Unexpected outbound connections were intercepted"}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: clean ? "var(--green)" : "#f87171", lineHeight: 1 }}>
          {stats.externalRequests}
        </p>
        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>ext. requests</p>
      </div>
    </div>
  );
}
