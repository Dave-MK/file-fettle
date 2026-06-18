"use client";

import { useState, useRef } from "react";
import Link from "next/link";

function fmtBytes(b: number) {
  if (b < 1024)      return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

type Mode = "encode" | "decode" | "file";

function encodeText(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64.trim())));
  } catch {
    throw new Error("Invalid Base64 input. Make sure the string is valid Base64.");
  }
}

export default function Base64Page() {
  const [mode,    setMode]    = useState<Mode>("encode");
  const [input,   setInput]   = useState("");
  const [output,  setOutput]  = useState("");
  const [error,   setError]   = useState<string | null>(null);
  const [file,    setFile]    = useState<File | null>(null);
  const [fileB64, setFileB64] = useState<string>("");
  const [copied,  setCopied]  = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const process = (val: string, m: Mode) => {
    setError(null);
    if (!val.trim()) { setOutput(""); return; }
    try {
      setOutput(m === "encode" ? encodeText(val) : decodeBase64(val));
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const handleInput = (val: string) => {
    setInput(val);
    process(val, mode);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    if (m !== "file") process(input, m);
    setFile(null);
    setFileB64("");
  };

  const loadFile = async (f: File) => {
    setFile(f);
    const ab  = await f.arrayBuffer();
    const arr = new Uint8Array(ab);
    let bin   = "";
    arr.forEach(byte => { bin += String.fromCharCode(byte); });
    setFileB64(btoa(bin));
    setError(null);
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadDecoded = () => {
    if (mode !== "decode") return;
    const blob = new Blob([output], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "decoded.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFileB64 = () => {
    if (!fileB64) return;
    const blob = new Blob([fileB64], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${file?.name ?? "file"}.b64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main id="main-content">
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
          <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← Tools</Link>
        </nav>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 36 }}>
          <div
            className="tool-icon-wrap"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 22 }}
            aria-hidden="true"
          >
            🔠
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, marginBottom: 6 }}>
              Base64 Encoder / Decoder
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65 }}>
              Encode text or files to Base64, or decode Base64 strings back to plain text. Everything runs in your browser.
            </p>
          </div>
        </div>

        {/* Mode tabs */}
        <p className="section-label">Mode</p>
        <div className="seg-tabs" style={{ marginBottom: 28 }}>
          {([
            ["encode", "Encode text"],
            ["decode", "Decode Base64"],
            ["file",   "Encode file"],
          ] as [Mode, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`seg-tab${mode === m ? " active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Text encode/decode */}
        {(mode === "encode" || mode === "decode") && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                {mode === "encode" ? "Text to encode" : "Base64 to decode"}
              </label>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => handleInput(e.target.value)}
                placeholder={mode === "encode" ? "Enter text here…" : "Paste Base64 string here…"}
                rows={6}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 8, fontSize: 13, lineHeight: 1.6,
                  background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)",
                  outline: "none", resize: "vertical", fontFamily: mode === "decode" ? "monospace" : "inherit",
                }}
              />
            </div>

            {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>✗ {error}</p>}

            {output && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    {mode === "encode" ? "Base64 output" : "Decoded text"}
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {mode === "decode" && (
                      <button onClick={downloadDecoded} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => copy(output)}
                      style={{ fontSize: 12, color: copied ? "var(--green)" : "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px 14px", borderRadius: 8, background: "var(--bg-elevated)",
                    border: "1px solid var(--border)", fontSize: 12, fontFamily: "monospace",
                    wordBreak: "break-all", lineHeight: 1.7, color: "var(--text)", maxHeight: 240, overflowY: "auto",
                    cursor: "text", userSelect: "text",
                  }}
                  onClick={() => {
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(document.getElementById("b64-output")!);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }}
                >
                  <span id="b64-output">{output}</span>
                </div>
                {mode === "encode" && (
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                    {input.length} chars → {output.length} chars Base64
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* File encode */}
        {mode === "file" && (
          <div>
            <p className="section-label">Select file</p>
            <div
              className="dropzone"
              style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer", marginBottom: 20 }}
              role="button" tabIndex={0} aria-label="Drop a file to encode to Base64"
              onClick={() => document.getElementById("b64-input")?.click()}
              onKeyDown={e => e.key === "Enter" && document.getElementById("b64-input")?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dropzone-over"); }}
              onDragLeave={e => e.currentTarget.classList.remove("dropzone-over")}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("dropzone-over"); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            >
              <input id="b64-input" type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
              <div style={{ fontSize: 32 }}>📁</div>
              <p style={{ fontWeight: 600 }}>{file ? file.name : "Drop any file here"}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{file ? fmtBytes(file.size) : "or click to browse"}</p>
            </div>

            {fileB64 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Base64 output</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={downloadFileB64} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Save as .txt
                    </button>
                    <button onClick={() => copy(fileB64)} style={{ fontSize: 12, color: copied ? "var(--green)" : "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)", fontSize: 12, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.7, maxHeight: 200, overflowY: "auto" }}>
                  {fileB64.slice(0, 500)}{fileB64.length > 500 ? "…" : ""}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  {fmtBytes(file!.size)} → {fmtBytes(fileB64.length)} Base64
                </p>
              </div>
            )}
          </div>
        )}

        <div className="privacy-callout">
          <span>🔒</span>
          <span>All encoding and decoding runs in your browser — files are never uploaded to any server.</span>
        </div>

      </div>
    </main>
  );
}
