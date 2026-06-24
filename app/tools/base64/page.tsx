"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Code } from "lucide-react";
import DropZone from "@/components/DropZone";
import { fmtBytes, downloadBlob } from "@/lib/utils";

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
    downloadBlob(blob, "decoded.txt");
  };

  const downloadFileB64 = () => {
    if (!fileB64) return;
    const blob = new Blob([fileB64], { type: "text/plain" });
    downloadBlob(blob, `${file?.name ?? "file"}.b64.txt`);
  };

  return (
    <main id="main-content">
      <div className="tool-shell">

        {/* Page header */}
        <div className="flex items-start gap-4 mb-9">
          <div
            className="tool-icon-wrap"
            style={{ background: "var(--color-data-dim)", border: "1px solid rgba(139, 92, 246, 0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-hidden="true"
          >
            <Code size={32} strokeWidth={1.5} color="var(--color-data)" />
          </div>
          <div>
            <h1 className="text-display mb-1">
              Base64 Encoder / Decoder
            </h1>
            <p className="text-lg text-muted leading-relaxed">
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
            {!file ? (
              <DropZone onFiles={files => files[0] && loadFile(files[0])} />
            ) : (
              <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 28 }}>📄</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{fmtBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setFileB64(""); }}
                  className="btn-text"
                  style={{ color: "#f87171", fontSize: 13, cursor: "pointer", background: "none", border: "none" }}
                >
                  Remove
                </button>
              </div>
            )}

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
