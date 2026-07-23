"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, Zap, Menu, X } from "lucide-react";
import { useMobileNav } from "./MobileNav";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const [showDonation, setShowDonation] = useState(true);
  const { open, toggle, hasSidebar } = useMobileNav();

  return (
    <header className="site-header" role="banner">
      <div className="site-header-inner">
        {/* Mobile hamburger — only on pages that have a sidebar, only on small screens */}
        {hasSidebar && (
          <button
            className="mobile-hamburger"
            onClick={toggle}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}

        <Link href="/" className="site-logo" aria-label="FileFettle — home">
          {/* Hexagon badge — the same isolated artwork used for the favicon,
              PWA icons and OG image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="site-logo-mark"
            src="/file-fettle-logo.png"
            alt=""
            width={35}
            height={39}
          />
          <span className="site-logo-text">
            file<span className="site-logo-grad">fettle</span>
          </span>
        </Link>

        {/* Donation banner — hidden on small screens to keep the header clean */}
        {showDonation && (
          <div className="donation-banner">
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 14px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
            }}>
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>FileFettle is free for everyone.</span>
              <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>•</span>
              <button
                onClick={() => {
                  window.open("https://ko-fi.com/filefettle", "_blank", "noopener");
                }}
                style={{
                  background: "var(--color-secondary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-secondary-hover)";
                  e.currentTarget.style.boxShadow = "0 2px 8px var(--color-secondary-glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-secondary)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                ☕ Support
              </button>
              <button
                onClick={() => setShowDonation(false)}
                aria-label="Dismiss"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: "2px 4px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="site-header-right">
          <span className="header-pill header-pill-green" aria-label="Files never leave your device">
            <Shield size={10} strokeWidth={3} />
            100% Private
          </span>
          <span className="header-pill header-pill-purple header-pill-hide-sm">
            <Zap size={10} strokeWidth={3} />
            No limits
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
