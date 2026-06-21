"use client";

import { useState } from "react";
import Link from "next/link";
import { downloadBlob, fmtBytes } from "@/lib/utils";

type Mode   = "encrypt" | "decrypt";
type Status = "idle" | "working" | "done" | "error";

const MAGIC        = new Uint8Array([0x46, 0x46, 0x45, 0x43]); // "FFEC"
const ITERATIONS   = 250_000;
const SALT_BYTES   = 16;
const IV_BYTES     = 12;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc     = new TextEncoder();
  // Ensure salt has a plain ArrayBuffer backing (required by WebCrypto type signature)
  const saltBuf = new Uint8Array(new ArrayBuffer(salt.byteLength));
  saltBuf.set(salt);
  const raw = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBuf, iterations: ITERATIONS, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptFile(file: File, password: string): Promise<Blob> {
  const salt        = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv          = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key         = await deriveKey(password, salt);
  const plaintext   = await file.arrayBuffer();
  const nameBytes   = new TextEncoder().encode(file.name);
  const nameLenBuf  = new Uint8Array(2);
  new DataView(nameLenBuf.buffer).setUint16(0, nameBytes.length, false);

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  // Header: MAGIC (4) + salt (16) + iv (12) + nameLen (2) + name (N)
  const header = new Uint8Array(4 + SALT_BYTES + IV_BYTES + 2 + nameBytes.length);
  let off = 0;
  header.set(MAGIC,      off); off += 4;
  header.set(salt,       off); off += SALT_BYTES;
  header.set(iv,         off); off += IV_BYTES;
  header.set(nameLenBuf, off); off += 2;
  header.set(nameBytes,  off);

  return new Blob([header, ciphertext], { type: "application/octet-stream" });
}

async function decryptFile(file: File, password: string): Promise<{ blob: Blob; name: string }> {
  const buf = await file.arrayBuffer();
  const dv  = new DataView(buf);

  // Verify magic
  const magic = new Uint8Array(buf, 0, 4);
  if (!magic.every((b, i) => b === MAGIC[i])) throw new Error("Not a FileFettle encrypted file (.ffenc)");

  let off = 4;
  const salt     = new Uint8Array(buf, off, SALT_BYTES);  off += SALT_BYTES;
  const iv       = new Uint8Array(buf, off, IV_BYTES);     off += IV_BYTES;
  const nameLen  = dv.getUint16(off, false);               off += 2;
  const nameArr  = new Uint8Array(buf, off, nameLen);      off += nameLen;
  const origName = new TextDecoder().decode(nameArr);
  const cipher   = buf.slice(off);

  const key = await deriveKey(password, salt);
  let plain: ArrayBuffer;
  try {
    plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  } catch {
    throw new Error("Decryption failed — wrong password or corrupted file");
  }

  const mime = origName.match(/\.(jpg|jpeg)$/i) ? "image/jpeg"
             : origName.match(/\.png$/i)         ? "image/png"
             : origName.match(/\.pdf$/i)         ? "application/pdf"
             : "application/octet-stream";

  return { blob: new Blob([plain], { type: mime }), name: origName };
}

export default function FileEncryptPage() {
  const [mode,     setMode]     = useState<Mode>("encrypt");
  const [file,     setFile]     = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [status,   setStatus]   = useState<Status>("idle");
  const [error,    setError]    = useState<string | null>(null);
  const [result,   setResult]   = useState<{ blob: Blob; name: string } | null>(null);

  const reset = () => {
    setFile(null);
    setPassword("");
    setConfirm("");
    setStatus("idle");
    setError(null);
    setResult(null);
  };

  const handleFile = (f: File) => {
    reset();
    setFile(f);
    if (f.name.endsWith(".ffenc") && mode === "encrypt") setMode("decrypt");
    if (!f.name.endsWith(".ffenc") && mode === "decrypt") setMode("encrypt");
  };

  const run = async () => {
    if (!file || !password) return;
    if (mode === "encrypt" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setStatus("working");
    setError(null);
    try {
      if (mode === "encrypt") {
        const blob = await encryptFile(file, password);
        const name = file.name + ".ffenc";
        setResult({ blob, name });
      } else {
        const out = await decryptFile(file, password);
        setResult(out);
      }
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  };

  const strength = !password ? 0
    : password.length < 8    ? 1
    : password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) ? 2
    : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthColor = ["", "var(--red)", "var(--yellow)", "var(--green)"][strength];

  const canRun = file && password.length >= 8 && (mode === "decrypt" || password === confirm);

  return (
    <main id="main-content">
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 20px 80px" }}>

        <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
          <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← Tools</Link>
        </nav>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
          <div
            className="tool-icon-wrap"
            style={{ background: "rgba(124,106,247,0.12)", border: "1px solid rgba(124,106,247,0.22)", fontSize: 22 }}
            aria-hidden="true"
          >
            🔒
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, marginBottom: 6 }}>File Encrypt</h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65 }}>
              Encrypt any file with AES-256-GCM using a password. Decrypt .ffenc files back to their originals.
              Files never leave your device.
            </p>
          </div>
        </div>

        {/* Encrypt / Decrypt tabs */}
        <div className="seg-tabs" style={{ marginBottom: 24 }}>
          {(["encrypt", "decrypt"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); reset(); }} className={`seg-tab${mode === m ? " active" : ""}`}>
              {m === "encrypt" ? "🔒 Encrypt" : "🔓 Decrypt"}
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <p className="section-label">
          {mode === "encrypt" ? "File to encrypt" : "Encrypted file (.ffenc)"}
        </p>
        <div
          className="dropzone"
          style={{
            padding: 32, marginBottom: 24, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer",
          }}
          role="button" tabIndex={0} aria-label="Drop file here"
          onClick={() => document.getElementById("fe-input")?.click()}
          onKeyDown={e => e.key === "Enter" && document.getElementById("fe-input")?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dropzone-over"); }}
          onDragLeave={e => e.currentTarget.classList.remove("dropzone-over")}
          onDrop={e => {
            e.preventDefault();
            e.currentTarget.classList.remove("dropzone-over");
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          <input
            id="fe-input" type="file" style={{ display: "none" }}
            accept={mode === "decrypt" ? ".ffenc" : "*/*"}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
          <div style={{ fontSize: 32 }}>{mode === "encrypt" ? "📄" : "🔒"}</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>
            {file ? file.name : mode === "encrypt" ? "Drop any file here" : "Drop .ffenc file here"}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {file ? fmtBytes(file.size) : "or click to browse"}
          </p>
        </div>

        {/* Password */}
        <p className="section-label">Password</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null); }}
              placeholder={mode === "encrypt" ? "Create a strong password…" : "Enter your password…"}
              style={{
                width: "100%", padding: "10px 44px 10px 14px",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", color: "var(--text)", fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", fontSize: 16, padding: 0,
              }}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Strength indicator */}
          {mode === "encrypt" && password && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 3, background: "var(--bg-elevated)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${(strength / 3) * 100}%`, height: "100%", background: strengthColor, borderRadius: 999, transition: "width 0.2s" }} />
              </div>
              <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600, minWidth: 36 }}>{strengthLabel}</span>
            </div>
          )}

          {mode === "encrypt" && (
            <input
              type={showPwd ? "text" : "password"}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(null); }}
              placeholder="Confirm password…"
              style={{
                width: "100%", padding: "10px 14px",
                background: confirm && password !== confirm ? "rgba(239,68,68,0.07)" : "var(--bg-elevated)",
                border: `1px solid ${confirm && password !== confirm ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
                borderRadius: "var(--radius-md)", color: "var(--text)", fontSize: 14, outline: "none",
              }}
            />
          )}
        </div>

        {/* Warning */}
        <div style={{
          marginBottom: 20, padding: "10px 14px",
          background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)",
        }}>
          ⚠️ <strong style={{ color: "#fbbf24" }}>There is no password recovery.</strong> If you forget your password, the file cannot be decrypted. Store it safely.
        </div>

        {error && (
          <p style={{ marginBottom: 16, fontSize: 13, color: "var(--red)" }}>✗ {error}</p>
        )}

        {/* Action / result */}
        {status === "done" && result ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-primary"
              style={{ flex: 1, padding: "12px 0", fontSize: 15 }}
              onClick={() => downloadBlob(result.blob, result.name)}
            >
              ↓ Download {result.name}
            </button>
            <button
              onClick={reset}
              className="btn-secondary"
              style={{ padding: "12px 16px", fontSize: 13 }}
            >
              {mode === "encrypt" ? "Encrypt another" : "Decrypt another"}
            </button>
          </div>
        ) : (
          <button
            className="btn-primary"
            style={{ width: "100%", padding: "13px 0", fontSize: 15 }}
            disabled={!canRun || status === "working"}
            onClick={run}
          >
            {status === "working"
              ? (mode === "encrypt" ? "Encrypting…" : "Decrypting…")
              : (mode === "encrypt" ? `Encrypt ${file?.name ?? "file"}` : `Decrypt ${file?.name ?? "file"}`)}
          </button>
        )}

        <div className="privacy-callout">
          <span>🔒</span>
          <span>AES-256-GCM encryption runs entirely in your browser using WebCrypto. Files never leave your device.</span>
        </div>

        {/* How it works */}
        <div style={{ marginTop: 32 }}>
          <p className="section-label">How the encryption works</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { t: "AES-256-GCM",  d: "Military-grade authenticated encryption. Protects both the file content and detects any tampering." },
              { t: "PBKDF2",       d: "Your password is stretched with 250,000 iterations of SHA-256 to resist brute-force attacks." },
              { t: "Random salt + IV", d: "A unique 16-byte salt and 12-byte IV are generated for every encryption, so identical files produce different output." },
            ].map(item => (
              <div key={item.t} className="card" style={{ padding: "12px 16px", display: "flex", gap: 12 }}>
                <span className="badge badge-purple" style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 1 }}>{item.t}</span>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
