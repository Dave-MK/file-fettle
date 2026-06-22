"use client";

import { useState } from "react";

// Configure your donation page here
const DONATION_URL = "https://ko-fi.com/filefettle";

const AMOUNTS = [
  { value: 1,  label: "£1",  sub: "☕ a coffee" },
  { value: 3,  label: "£3",  sub: "⚡ powers a day" },
  { value: 5,  label: "£5",  sub: "🚀 helps a lot" },
  { value: 10, label: "£10", sub: "🌟 huge thanks" },
];

interface Props {
  variant?: "inline" | "compact";
  onDismiss?: () => void;
}

export default function DonationBanner({ variant = "inline", onDismiss }: Props) {
  const [selected, setSelected] = useState(3);
  const [custom, setCustom]     = useState("");
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  const amount = custom ? parseFloat(custom) || 0 : selected;

  const handleDonate = () => {
    window.open(DONATION_URL, "_blank", "noopener");
  };

  if (variant === "compact") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10, padding: "10px 14px",
        background: "linear-gradient(135deg, rgba(124,106,247,0.08), rgba(34,197,94,0.06))",
        border: "1px solid rgba(124,106,247,0.2)", borderRadius: 10,
      }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, flex: "1 1 180px" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>FileFettle is free for everyone.</span>
          {" "}A contribution keeps it that way.
        </p>
        <button
          onClick={handleDonate}
          style={{
            background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            minHeight: 36, touchAction: "manipulation",
          }}
        >
          ☕ Support
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid rgba(124,106,247,0.25)",
      borderRadius: 14,
      padding: "20px 20px 16px",
      position: "relative",
    }}>
      <button
        onClick={handleDismiss}
        style={{
          position: "absolute", top: 10, right: 12,
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", fontSize: 16, lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>☕</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            Built free. Kept free by people who use it.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
            No ads, no subscriptions, no tracking — ever. If FileFettle saved you time,
            a small contribution goes directly toward keeping it open and free for everyone who needs it.
          </p>
        </div>
      </div>

      {/* Amount chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {AMOUNTS.map(a => (
          <button
            key={a.value}
            onClick={() => { setSelected(a.value); setCustom(""); }}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: `1px solid ${selected === a.value && !custom ? "var(--accent)" : "var(--border)"}`,
              background: selected === a.value && !custom ? "var(--accent-dim)" : "var(--bg-elevated)",
              cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{a.label}</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{a.sub}</span>
          </button>
        ))}
        {/* Custom input */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>£</span>
          <input
            type="number"
            min={1}
            placeholder="Other"
            value={custom}
            onChange={e => { setCustom(e.target.value); setSelected(0); }}
            style={{
              width: 64, padding: "7px 8px",
              background: custom ? "var(--accent-dim)" : "var(--bg-elevated)",
              border: `1px solid ${custom ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8, color: "var(--text)", fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={handleDonate}
          className="btn-primary"
          style={{ padding: "9px 20px", fontSize: 14, flex: 1 }}
          disabled={amount <= 0}
        >
          {amount > 0 ? `Contribute £${amount}` : "Choose an amount"}
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: "none", border: "1px solid var(--border)",
            borderRadius: 8, padding: "9px 14px", fontSize: 13,
            color: "var(--text-muted)", cursor: "pointer",
          }}
        >
          Maybe later
        </button>
      </div>

      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}>
        Opens Ko-fi — no account needed · any amount welcome
      </p>
    </div>
  );
}
