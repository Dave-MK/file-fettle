"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Key } from "lucide-react";
import DropZone from "@/components/DropZone";
import { fmtBytes } from "@/lib/utils";

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Minimal MD5 implementation (RFC 1321)
function md5(data: ArrayBuffer): string {
  const b = new Uint8Array(data);
  const S: number[] = [
    7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
    5, 9,14,20, 5, 9,14,20, 5, 9,14,20, 5, 9,14,20,
    4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
    6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21,
  ];
  const K: number[] = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  const origLen = b.length;
  const padLen  = (origLen + 8) % 64 === 0 ? 64 : 64 - ((origLen + 8) % 64);
  const padded  = new Uint8Array(origLen + padLen + 8);
  padded.set(b);
  padded[origLen] = 0x80;
  const bitLen = origLen * 8;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bitLen >>> 0,  true);
  dv.setUint32(padded.length - 4, Math.floor(bitLen / 2 ** 32) >>> 0, true);

  const rot32 = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0;
  for (let i = 0; i < padded.length; i += 64) {
    const M = Array.from({ length: 16 }, (_, j) => dv.getUint32(i + j * 4, true));
    let A = a0, B = b0, C = c0, D = d0;
    for (let j = 0; j < 64; j++) {
      let F: number, g: number;
      if      (j < 16) { F = (B & C) | (~B & D);         g = j; }
      else if (j < 32) { F = (D & B) | (~D & C);         g = (5 * j + 1) % 16; }
      else if (j < 48) { F = B ^ C ^ D;                  g = (3 * j + 5) % 16; }
      else             { F = C ^ (B | ~D);                g = (7 * j)     % 16; }
      F = (F + A + K[j] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + rot32(F, S[j])) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const le = (n: number) => n.toString(16).padStart(8, "0").match(/../g)!.reverse().join("");
  return [a0, b0, c0, d0].map(le).join("");
}

type Alg = "SHA-256" | "SHA-1" | "SHA-512" | "MD5";

interface HashResult {
  alg:  Alg;
  hex:  string;
  done: boolean;
}

export default function FileHashPage() {
  const [file,    setFile]    = useState<File | null>(null);
  const [hashes,  setHashes]  = useState<HashResult[]>([]);
  const [running, setRunning] = useState(false);
  const [copied,  setCopied]  = useState<string | null>(null);

  const computeHashes = useCallback(async (f: File) => {
    setFile(f);
    setRunning(true);
    const algs: Alg[] = ["SHA-256", "SHA-1", "SHA-512", "MD5"];
    setHashes(algs.map(alg => ({ alg, hex: "", done: false })));

    const buf = await f.arrayBuffer();

    for (const alg of algs) {
      let hex: string;
      if (alg === "MD5") {
        hex = md5(buf);
      } else {
        const digest = await crypto.subtle.digest(alg, buf);
        hex = bufToHex(digest);
      }
      setHashes(prev => prev.map(h => h.alg === alg ? { ...h, hex, done: true } : h));
    }
    setRunning(false);
  }, []);

  const copy = async (hex: string, alg: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(alg);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main id="main-content">
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Page header */}
        <div className="flex items-start gap-4 mb-9">
          <div
            className="tool-icon-wrap"
            style={{ background: "var(--color-data-dim)", border: "1px solid rgba(139, 92, 246, 0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-hidden="true"
          >
            <Key size={32} strokeWidth={1.5} color="var(--color-data)" />
          </div>
          <div>
            <h1 className="text-display mb-1">File Hash Checker</h1>
            <p className="text-lg text-muted leading-relaxed">
              Generate SHA-256, SHA-1, SHA-512 and MD5 checksums for any file. Use to verify file integrity and authenticity.
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <p className="section-label">Select file</p>
        {!file ? (
          <DropZone onFiles={files => files[0] && computeHashes(files[0])} minHeight={160} />
        ) : (
          <div className="card p-4 flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div style={{ fontSize: 28 }}>📄</div>
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-muted mt-0.5">{fmtBytes(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setHashes([]); }}
              className="text-sm font-semibold transition-colors"
              style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Results */}
        {hashes.length > 0 && (
          <>
            <p className="section-label">{running ? "Computing…" : "Checksums"}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {hashes.map(h => (
                <div key={h.alg} className="card" style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {h.alg}
                    </span>
                    {h.done && (
                      <button
                        onClick={() => copy(h.hex, h.alg)}
                        style={{ fontSize: 12, color: copied === h.alg ? "var(--green)" : "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                      >
                        {copied === h.alg ? "✓ Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                  {h.done ? (
                    <p style={{ fontFamily: "monospace", fontSize: 12, wordBreak: "break-all", color: "var(--text)", lineHeight: 1.6 }}>
                      {h.hex}
                    </p>
                  ) : (
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: "60%", animation: "pulse 1.5s ease-in-out infinite" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Verify section */}
        {hashes.some(h => h.done) && <VerifySection hashes={hashes} />}

        <div className="privacy-callout">
          <span>🔒</span>
          <span>Hash computation runs entirely in your browser — files are never uploaded to any server.</span>
        </div>

      </div>
    </main>
  );
}

function VerifySection({ hashes }: { hashes: HashResult[] }) {
  const [input,  setInput]  = useState("");
  const [result, setResult] = useState<"match" | "nomatch" | null>(null);

  const verify = () => {
    const clean = input.trim().toLowerCase();
    const match = hashes.some(h => h.hex === clean);
    setResult(match ? "match" : "nomatch");
  };

  return (
    <div style={{ marginTop: 28, padding: "20px 20px 18px", background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border)" }}>
      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Verify a checksum</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setResult(null); }}
          placeholder="Paste expected hash here…"
          style={{ flex: 1, padding: "9px 12px", borderRadius: 8, fontSize: 13, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", fontFamily: "monospace" }}
        />
        <button className="btn-primary" style={{ padding: "9px 16px", fontSize: 13 }} onClick={verify} disabled={!input.trim()}>
          Verify
        </button>
      </div>
      {result === "match"   && <p style={{ marginTop: 10, fontSize: 13, color: "var(--green)", fontWeight: 600 }}>✓ Hash matches — file is intact</p>}
      {result === "nomatch" && <p style={{ marginTop: 10, fontSize: 13, color: "var(--red)"   }}>✗ Hash does not match any algorithm — file may be modified</p>}
    </div>
  );
}
