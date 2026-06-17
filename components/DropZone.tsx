"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Category } from "@/lib/formats";

interface Props {
  category?:  Category;
  multiple?:  boolean;
  onFiles:    (files: File[]) => void;
  minHeight?: number;
}

export default function DropZone({ category, multiple, onFiles, minHeight = 180 }: Props) {
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
      className={`dropzone${over ? " dropzone-over" : ""} flex flex-col items-center justify-center gap-3 p-10 text-center select-none`}
      style={{ minHeight }}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
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
      <div style={{ fontSize: 36 }}>{category?.icon ?? "📁"}</div>
      <div>
        <p className="font-semibold text-base" style={{ color: "var(--text)" }}>
          Drop {multiple ? "files" : `your ${category?.label.toLowerCase() ?? "file"}`} here
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          or click to browse{multiple ? " (select multiple)" : ""}
        </p>
      </div>
      {category && (
        <p className="text-xs px-4" style={{ color: "var(--text-muted)" }}>
          Accepts: {category.description}
        </p>
      )}
      <div
        className="text-xs px-3 py-1 rounded-full mt-1"
        style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
      >
        🔒 Files never leave your device
      </div>
    </div>
  );
}
