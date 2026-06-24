"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw, Merge, Scissors, Maximize2, Volume2, Key, Code, Lock, ImageIcon, HelpCircle, Shield } from "lucide-react";
import { useMobileNav } from "./MobileNav";

const TOOLS = [
  { href: "/converter", icon: RefreshCw, label: "Convert" },
  { href: "/tools/pdf-merge", icon: Merge, label: "PDF Merge" },
  { href: "/tools/pdf-split", icon: Scissors, label: "PDF Split" },
  { href: "/tools/image-resizer", icon: Maximize2, label: "Image Resizer" },
  { href: "/tools/image-compressor", icon: Volume2, label: "Image Compressor" },
  { href: "/tools/file-hash", icon: Key, label: "File Hash" },
  { href: "/tools/base64", icon: Code, label: "Base64" },
  { href: "/tools/file-encrypt", icon: Lock, label: "File Encrypt" },
  { href: "/tools/exif-viewer", icon: ImageIcon, label: "EXIF Viewer" },
];

const FOOTER_NAV = [
  { href: "/how-it-works", icon: HelpCircle, label: "How it Works" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open, close, hasSidebar } = useMobileNav();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (!hasSidebar) return null;

  return (
    <>
      {/* Mobile overlay — only rendered while the drawer is open */}
      {open && <div className="sidebar-overlay" onClick={close} />}

      <aside className={`sidebar ${open ? "mobile-open" : ""}`}>
        <nav className="sidebar-nav">
          <div className="nav-section" key="tools-section">
            {TOOLS.map(tool => {
              const Icon = tool.icon;
              return (
                <Link
                  key={`nav-tool-${tool.label}`}
                  href={tool.href}
                  className={`nav-item ${isActive(tool.href) ? "active" : ""}`}
                  onClick={close}
                >
                  <span className="nav-icon"><Icon size={18} /></span>
                  <span className="nav-label">{tool.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nav-section" key="footer-section">
            <div className="nav-divider" key="nav-divider-footer" />
            {FOOTER_NAV.map(navItem => {
              const Icon = navItem.icon;
              return (
                <Link
                  key={`nav-${navItem.label}`}
                  href={navItem.href}
                  className={`nav-item ${isActive(navItem.href) ? "active" : ""}`}
                  onClick={close}
                >
                  <span className="nav-icon"><Icon size={18} /></span>
                  <span className="nav-label">{navItem.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={14} />
            <p style={{ margin: 0 }}>100% Private</p>
          </div>
        </div>
      </aside>
    </>
  );
}
