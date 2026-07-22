import type { Metadata } from "next";

// The page itself is a Client Component, and `metadata` is only supported in
// Server Components — so the route's SEO metadata lives in this layout.
export const metadata: Metadata = {
  title: "Free QR Code Generator — Unlimited, Never Expires | FileFettle",
  description:
    "Generate QR codes for URLs, Wi-Fi, vCard contacts, email, SMS, WhatsApp, payments, calendar events and more. Static codes with unlimited scans that never expire. Runs in your browser — no upload, no account.",
  alternates: { canonical: "/tools/qr-generator" },
};

export default function QrGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
