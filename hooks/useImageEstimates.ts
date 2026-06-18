"use client";

import { useEffect, useState } from "react";
import { getTargetFormats }    from "@/lib/formats";

// Renders the source image to canvas and measures toBlob output for each target format.
export function useImageEstimates(file: File | undefined, quality: number): Map<string, number> {
  const [estimates, setEstimates] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!file || !file.type.startsWith("image")) return;

    let cancelled = false;
    const ext     = file.name.split(".").pop()?.toLowerCase() ?? "";
    const formats = getTargetFormats(ext);
    if (!formats.length) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      if (cancelled) return;

      // Scale down for estimation to keep it fast (max 400px wide)
      const scale  = Math.min(1, 400 / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const map = new Map<string, number>();
      for (const fmt of formats) {
        if (cancelled) break;
        const blob = await new Promise<Blob | null>(res =>
          canvas.toBlob(res, fmt.mime, quality)
        );
        if (blob && !cancelled) {
          // Scale estimate back to full resolution
          map.set(fmt.ext, Math.round(blob.size / (scale * scale)));
        }
      }
      if (!cancelled) setEstimates(map);
    };
    img.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file, quality]);

  return estimates;
}
