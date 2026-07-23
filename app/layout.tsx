import type { Metadata, Viewport } from "next";
import InstallPrompt from "@/components/InstallPrompt";
import SiteHeader from "@/components/SiteHeader";
import Sidebar from "@/components/Sidebar";
import { MobileNavProvider } from "@/components/MobileNav";
import { faqStructuredData } from "@/lib/faq";
import "./design-tokens.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "FileFettle — Free Online File Converter | No Upload Required",
  description:
    "Convert images, audio, video, documents and data files free in your browser. No upload, no registration, no file size limit. 80+ formats supported.",
  keywords: [
    "file converter",
    "convert files online",
    "free file converter",
    "online file converter no upload",
    "image converter",
    "audio converter",
    "video converter",
    "document converter",
    "convert files without uploading",
    "browser file converter",
    "private file converter",
    "converting files",
    "i want to convert my file",
    "convert jpg to png",
    "convert mp4 to mp3",
    "convert pdf to word",
    "free online file converter",
  ],
  applicationName: "FileFettle",
  creator: "FileFettle",
  manifest: "/manifest.json",
  // favicon.ico is auto-detected from app/. The high-res PNG tab icon and the
  // Apple touch icon are declared explicitly — this Next build doesn't
  // auto-emit links for the public/ assets.
  icons: {
    // favicon.ico is auto-detected from app/; add the high-res PNG for tabs
    // that prefer it, plus the Apple touch icon.
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  metadataBase: new URL("https://filefettle.pro"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://filefettle.pro",
    title: "FileFettle — Free Online File Converter | No Upload Required",
    description:
      "Convert any file free in your browser — no upload, no limits, no account required. 80+ formats.",
    siteName: "FileFettle",
    images: [
      { url: "/opengraph-image.png", width: 1200, height: 630, alt: "FileFettle — Free Online File Converter" },
    ],
  },
  twitter: {
    card: "summary",
    title: "FileFettle — Free Online File Converter",
    description:
      "Convert any file free in your browser. No upload, no limits, no account. 80+ formats.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = { themeColor: "#7c6af7" };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://filefettle.pro/#app",
      name: "FileFettle",
      url: "https://filefettle.pro",
      description:
        "Free online file converter. Convert images, audio, video, documents and data files entirely in your browser — no upload, no registration, no file size limits.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Convert image files — JPG, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP, HEIC",
        "Convert audio files — MP3, WAV, FLAC, OGG, AAC, M4A, OPUS, AIFF, WMA",
        "Convert video files — MP4, WebM, MOV, AVI, MKV, WMV, MPEG",
        "Convert documents — PDF, DOCX, TXT, HTML, Markdown",
        "Convert data files — CSV, JSON, XML, YAML, XLSX, XLS, ODS, TOML, INI",
        "No file upload required — 100% browser-based conversion",
        "No file size limits",
        "No account or registration required",
        "Completely free — no subscriptions or paywalls",
      ],
    },
    {
      "@type": "FAQPage",
      // Shared with the visible accordion on /converter so the markup can
      // never describe questions the page doesn't actually show.
      mainEntity: faqStructuredData(),
    },
    {
      "@type": "HowTo",
      name: "How to convert a file online for free",
      description:
        "Convert any file to a different format using FileFettle — entirely in your browser, no upload required.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Drop or select your file",
          text: "Drag and drop your file onto the FileFettle drop zone, or click to browse and select a file from your device.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Choose your output format",
          text: "Select the file category (image, audio, video, document, or data), then pick the target format you want to convert to.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download your converted file",
          text: "Click Convert. Your file is processed instantly inside your browser and downloaded to your device. Nothing is uploaded to any server.",
        },
      ],
      totalTime: "PT30S",
      estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
      tool: [{ "@type": "SoftwareApplication", name: "FileFettle", url: "https://filefettle.pro" }],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resolve theme before paint to avoid a flash of the wrong theme.
            Uses the saved choice, else the OS preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c5ce8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FileFettle" />
        <script
          type="application/ld+json"
          // Escaping `<` stops any string in the payload from closing the
          // script tag early — the guard Next's JSON-LD guide prescribes.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Analytics />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        <MobileNavProvider>
          <Sidebar />
          <SiteHeader />
          {children}
        </MobileNavProvider>
        <InstallPrompt />
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
            }}
          />
        )}
      </body>
    </html>
  );
}
