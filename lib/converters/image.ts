"use client";

import { ImageResizeOpts } from "@/lib/types";

export interface ImageConvertOptions {
  targetMime: string;
  quality:    number;
  compress:   boolean;
  resize?:    ImageResizeOpts;
  stripExif?: boolean; // canvas conversion always strips EXIF; flag makes intent explicit
}

// MIME types canvas can encode to. Anything else will throw a clear error.
const ENCODABLE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);

function loadImage(src: string, w?: number, h?: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (w) img.width  = w;
    if (h) img.height = h;
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image. The format may not be supported by your browser."));
    img.src = src;
  });
}

// Converts an SVG blob URL to a data URL so canvas can render it at the correct size.
async function svgToDataUrl(objectUrl: string, w: number, h: number): Promise<string> {
  const res  = await fetch(objectUrl);
  const text = await res.text();
  // Ensure width/height attributes exist so the browser renders at the right size
  const patched = text
    .replace(/<svg([^>]*)>/, (m, attrs) => {
      const a = attrs.includes("width=")  ? attrs : attrs + ` width="${w}"`;
      const b = a.includes("height=") ? a : a + ` height="${h}"`;
      return `<svg${b}>`;
    });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(patched)}`;
}

export async function convertImage(file: File, opts: ImageConvertOptions): Promise<Blob> {
  if (!ENCODABLE_MIMES.has(opts.targetMime)) {
    throw new Error(`Output format "${opts.targetMime}" is not supported by your browser.`);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const isSvg = file.type === "image/svg+xml" || file.name.endsWith(".svg");

    // For SVG we need a temporary pass to discover natural dimensions
    let probeImg: HTMLImageElement;
    if (isSvg) {
      probeImg = await loadImage(objectUrl, 800, 800);
    } else {
      probeImg = await loadImage(objectUrl);
    }

    const nw = probeImg.naturalWidth  || probeImg.width  || 800;
    const nh = probeImg.naturalHeight || probeImg.height || 800;

    // Compute output dimensions
    let outW = nw;
    let outH = nh;
    if (opts.resize?.width || opts.resize?.height) {
      const rw = opts.resize!.width;
      const rh = opts.resize!.height;
      if (opts.resize!.keepAspect) {
        if (rw && rh) {
          const scale = Math.min(rw / nw, rh / nh);
          outW = Math.round(nw * scale);
          outH = Math.round(nh * scale);
        } else if (rw) {
          outW = rw;
          outH = Math.round(nh * (rw / nw));
        } else if (rh) {
          outH = rh;
          outW = Math.round(nw * (rh / nh));
        }
      } else {
        outW = rw ?? nw;
        outH = rh ?? nh;
      }
    }

    // For SVG, re-load at the final output size to get a clean rasterisation
    let drawImg = probeImg;
    if (isSvg) {
      const dataUrl = await svgToDataUrl(objectUrl, outW, outH);
      drawImg = await loadImage(dataUrl, outW, outH);
    }

    const canvas  = document.createElement("canvas");
    canvas.width  = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");

    // Opaque background for JPEG (which cannot represent transparency)
    if (opts.targetMime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
    }

    ctx.drawImage(drawImg, 0, 0, outW, outH);

    // EXIF is automatically stripped by canvas
    const quality = opts.compress ? Math.min(opts.quality, 0.72) : opts.quality;

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(
              `Your browser could not encode this image as ${opts.targetMime}. ` +
              `Try PNG or JPEG instead.`
            ));
          }
        },
        opts.targetMime,
        quality
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
