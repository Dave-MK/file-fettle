"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Category } from "@/lib/formats";

interface Props {
  category?:  Category;
  multiple?:  boolean;
  onFiles:    (files: File[]) => void;
}

export default function DropZone({ category, multiple, onFiles }: Props) {
  const [over, setOver]   = useState(false);
  const inputRef          = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  return (
    <div
      className={`dropzone${over ? " dropzone-over" : ""} flex flex-col items-center justify-center gap-4 text-center select-none`}
      style={{ padding: "36px 32px" }}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label={category
        ? `Drop ${category.label.toLowerCase()} files here, or press Enter to browse`
        : "Drop files here, or press Enter to browse"}
      onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={category?.accept ?? "*/*"}
        multiple={multiple}
        onChange={handleChange}
      />

      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: over ? "var(--accent-dim)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${over ? "var(--accent)" : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, transition: "all 0.2s", flexShrink: 0,
      }}>
        {category?.icon ?? "📁"}
      </div>

      <div>
        <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>
          Drop {multiple ? "files" : `your ${category?.label.toLowerCase() ?? "file"}`} here
        </p>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          or click to browse{multiple ? " — select multiple" : ""}
        </p>
      </div>

      {category && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", paddingLeft: 24, paddingRight: 24 }}>
          Accepts: {category.description}
        </p>
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 12, color: "var(--text-muted)",
        padding: "5px 12px", borderRadius: 999,
        background: "rgba(34,197,94,0.07)",
        border: "1px solid rgba(34,197,94,0.18)",
      }}>
        <span>🔒</span>
        <span>Files never leave your device</span>
      </div>
    </div>
  );
}
