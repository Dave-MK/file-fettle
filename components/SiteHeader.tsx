"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, Zap } from "lucide-react";
import DonationBanner from "./DonationBanner";

export default function SiteHeader() {
  const [showDonation, setShowDonation] = useState(true);

  return (
    <>
      <header className="site-header" role="banner">
        <div className="site-header-inner">
        <Link href="/" className="site-logo" aria-label="FileFettle — home">
          <div className="logo-icon">
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #7c6af7 0%, #a78bfa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Zap size={16} color="white" strokeWidth={3} />
            </div>
          </div>
          <span className="site-logo-text">
            file<span className="site-logo-accent">fettle</span>
          </span>
        </Link>

        <div className="site-header-right">
          <span className="header-pill header-pill-green" aria-label="Files never leave your device">
            <Shield size={10} strokeWidth={3} />
            100% Private
          </span>
          <span className="header-pill header-pill-purple header-pill-hide-xs">
            <Zap size={10} strokeWidth={3} />
            No limits
          </span>
        </div>
      </div>
      </header>

      {/* Donation Banner Below Header */}
      {showDonation && (
        <div style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: "16px 32px",
          zIndex: "var(--z-sticky)",
          position: "sticky",
          top: "var(--header-height, 60px)",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <DonationBanner variant="compact" />
          </div>
        </div>
      )}
    </>
  );
}
