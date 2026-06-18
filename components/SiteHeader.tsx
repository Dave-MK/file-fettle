"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="url(#ff-grad)" />
      <defs>
        <linearGradient id="ff-grad" x1="0" y1="0" x2="28" y2="28">
          <stop stopColor="#7c6af7" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path
        d="M8 10.5h8m0 0-2-1.5m2 1.5-2 1.5"
        stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M20 17.5h-8m0 0 2-1.5m-2 1.5 2 1.5"
        stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome   = pathname === "/";

  return (
    <header className="site-header" role="banner">
      <div className="site-header-inner">
        <div className="site-header-left">
          <Link href="/" className="site-logo" aria-label="FileFettle — home">
            <LogoMark />
            <span className="site-logo-text">
              file<span className="site-logo-accent">fettle</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="site-nav">
            <Link
              href="/"
              className={`site-nav-link${isHome ? " active" : ""}`}
              aria-current={isHome ? "page" : undefined}
            >
              Convert
            </Link>
            <Link
              href="/tools"
              className={`site-nav-link${pathname.startsWith("/tools") ? " active" : ""}`}
              aria-current={pathname.startsWith("/tools") ? "page" : undefined}
            >
              Tools
            </Link>
          </nav>
        </div>

        <div className="site-header-right">
          <span className="header-pill header-pill-green" aria-label="Files never leave your device">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <rect width="10" height="10" rx="3" fill="#22c55e" opacity="0.25" />
              <rect x="3" y="3" width="4" height="4" rx="1" fill="#22c55e" />
            </svg>
            100% Private
          </span>
          <span className="header-pill header-pill-purple header-pill-hide-xs">
            No limits
          </span>
        </div>
      </div>
    </header>
  );
}
