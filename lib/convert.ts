"use client";

import { detectCategory }    from "@/lib/formats";
import { ImageResizeOpts }   from "@/lib/types";
import { convertImage }      from "@/lib/converters/image";
import { convertAudioVideo } from "@/lib/converters/audio-video";
import { convertDocument }   from "@/lib/converters/document";
import { convertData }       from "@/lib/converters/data";

export interface ConvertOptions {
  targetExt:    string;
  targetMime:   string;
  compress:     boolean;
  quality:      number;
  resize?:      ImageResizeOpts;
  stripExif?:   boolean;
  onProgress?:  (pct: number) => void;
  onStatus?:    (msg: string) => void;
}

export async function convert(file: File, opts: ConvertOptions): Promise<Blob> {
  const cat = detectCategory(file);
  if (!cat) throw new Error("Unrecognised file type");

  switch (cat.id) {
    case "image":
      opts.onStatus?.("Converting image…");
      return convertImage(file, {
        targetMime: opts.targetMime,
        quality:    opts.quality,
        compress:   opts.compress,
        resize:     opts.resize,
        stripExif:  opts.stripExif,
      });

    case "audio":
    case "video":
      return convertAudioVideo(file, {
        targetExt:  opts.targetExt,
        targetMime: opts.targetMime,
        compress:   opts.compress,
        quality:    opts.quality,
        onProgress: opts.onProgress,
        onStatus:   opts.onStatus,
      });

    case "document":
      opts.onStatus?.("Converting document…");
      return convertDocument(file, {
        targetExt:  opts.targetExt,
        targetMime: opts.targetMime,
        compress:   opts.compress,
        quality:    opts.quality,
      });

    case "data":
      opts.onStatus?.("Converting data file…");
      return convertData(file, {
        targetExt:  opts.targetExt,
        targetMime: opts.targetMime,
      });

    default:
      throw new Error(`No converter for category: ${cat.id}`);
  }
}
