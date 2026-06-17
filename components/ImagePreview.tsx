"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  originalFile: File;
  resultBlob:   Blob;
  originalSize: number;
  resultSize:   number;
}

function fmtBytes(b: number) {
  if (b < 1024)      return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

export default function ImagePreview({ originalFile, resultBlob, originalSize, resultSize }: Props) {
  const [pos,      setPos]      = useState(50); // 0-100 %
  const [dragging, setDragging] = useState(false);
  const [origUrl,  setOrigUrl]  = useState("");
  const [resultUrl,setResultUrl]= useState("");
  const containerRef            = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = URL.createObjectURL(originalFile);
    const r = URL.createObjectURL(resultBlob);
    setOrigUrl(o);
    setResultUrl(r);
    return () => { URL.revokeObjectURL(o); URL.revokeObjectURL(r); };
  }, [originalFile, resultBlob]);

  const handleMove = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  };

  if (!origUrl || !resultUrl) return null;

  const saving = originalSize > resultSize
    ? `${Math.round((1 - resultSize / originalSize) * 100)}% smaller`
    : "converted";

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
        Before / After
      </p>
      <div
        ref={containerRef}
        style={{ position: "relative", borderRadius: 10, overflow: "hidden", cursor: "ew-resize", userSelect: "none", background: "var(--bg-elevated)" }}
        onMouseDown={() => setDragging(true)}
        onMouseMove={e => dragging && handleMove(e.clientX)}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchMove={e => handleMove(e.touches[0].clientX)}
      >
        {/* Original (full width, clipped right) */}
        <img
          src={origUrl}
          alt="Original"
          draggable={false}
          style={{ display: "block", width: "100%", maxHeight: 320, objectFit: "contain" }}
        />
        {/* Result (overlaid, clipped left) */}
        <div style={{
          position: "absolute", inset: 0,
          clipPath: `inset(0 0 0 ${pos}%)`,
          overflow: "hidden",
        }}>
          <img
            src={resultUrl}
            alt="Converted"
            draggable={false}
            style={{ display: "block", width: "100%", maxHeight: 320, objectFit: "contain" }}
          />
        </div>
        {/* Divider handle */}
        <div style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${pos}%`, transform: "translateX(-50%)",
          width: 2, background: "#fff", boxShadow: "0 0 8px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 28, height: 28, borderRadius: "50%",
            background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#333", fontWeight: 700,
          }}>⇔</div>
        </div>
        {/* Labels */}
        <div style={{ position: "absolute", top: 8, left: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5 }}>
          Before · {fmtBytes(originalSize)}
        </div>
        <div style={{ position: "absolute", top: 8, right: 10, background: "rgba(124,106,247,0.8)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5 }}>
          After · {fmtBytes(resultSize)} · {saving}
        </div>
      </div>
      <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
        Drag the slider to compare
      </p>
    </div>
  );
}
