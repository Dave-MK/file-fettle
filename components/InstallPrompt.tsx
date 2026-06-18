"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [prompt,    setPrompt]    = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => { setPrompt(null); setDismissed(true); };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!prompt || dismissed) return null;

  const install = async () => {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setDismissed(true);
    setPrompt(null);
  };

  return (
    <div
      role="dialog"
      aria-label="Install FileFettle"
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        zIndex: 200, maxWidth: "calc(100vw - 32px)",
      }}
    >
      <div style={{ fontSize: 28 }}>📲</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14 }}>Install FileFettle</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Add to home screen for instant access</p>
      </div>
      <button
        className="btn-primary"
        style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}
        onClick={install}
      >
        Install
      </button>
      <button
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, padding: 0, flexShrink: 0 }}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
