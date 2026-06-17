"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;

async function getFFmpeg(onProgress?: (p: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;

  if (!loadPromise) {
    const ff = new FFmpeg();
    ff.on("progress", ({ progress }) => onProgress?.(Math.round(Math.min(progress, 1) * 100)));
    loadPromise = (async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`,   "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegInstance = ff;
    })();
  }
  await loadPromise;
  return ffmpegInstance!;
}

export interface AVConvertOptions {
  targetExt:   string;
  targetMime:  string;
  compress:    boolean;
  quality:     number;
  onProgress?: (pct: number) => void;
  onStatus?:   (msg: string) => void;
}

// Codec flags per output format — chosen for broad compatibility
const AUDIO_CODECS: Record<string, string[]> = {
  mp3:  ["-c:a", "libmp3lame", "-q:a", "2"],           // VBR ~190 kbps
  ogg:  ["-c:a", "libvorbis",  "-q:a", "4"],           // VBR ~128 kbps
  wav:  ["-c:a", "pcm_s16le"],
  flac: ["-c:a", "flac"],
  aac:  ["-c:a", "aac",        "-b:a", "192k"],
  m4a:  ["-c:a", "aac",        "-b:a", "192k"],
  opus: ["-c:a", "libopus",    "-b:a", "128k"],
  aiff: ["-c:a", "pcm_s16le"],                          // AIFF PCM
  aif:  ["-c:a", "pcm_s16le"],
};

const VIDEO_CODECS: Record<string, string[]> = {
  // -pix_fmt yuv420p ensures playback in QuickTime, Windows Media Player, older devices
  mp4:  ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart"],
  mov:  ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart"],
  m4v:  ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart"],
  avi:  ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "mp3"],
  mkv:  ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac"],
  webm: ["-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p", "-c:a", "libvorbis", "-b:v", "0"],
  flv:  ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-f", "flv"],
  ogv:  ["-c:v", "libtheora", "-c:a", "libvorbis"],
  "3gp":["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-profile:v", "baseline", "-level", "3.0"],
};

export async function convertAudioVideo(file: File, opts: AVConvertOptions): Promise<Blob> {
  opts.onStatus?.("Loading converter…");
  const ff = await getFFmpeg(opts.onProgress);

  const srcExt     = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const inputName  = `input_${Date.now()}.${srcExt}`;
  const outputName = `output_${Date.now()}.${opts.targetExt}`;

  opts.onStatus?.("Reading file…");
  await ff.writeFile(inputName, await fetchFile(file));

  const isAudio   = file.type.startsWith("audio") || ["mp3","wav","flac","ogg","aac","m4a","opus","aiff","aif","wma","amr","m4r","mka","mp2","oga","ac3","dts","caf","wv","tta","spx"].includes(srcExt);
  const codecArgs = isAudio
    ? (AUDIO_CODECS[opts.targetExt] ?? ["-c:a", "copy"])
    : (VIDEO_CODECS[opts.targetExt] ?? ["-c:v", "copy", "-c:a", "copy"]);

  // Quality override — applied when user explicitly requests compression
  const compressionArgs: string[] = [];
  if (opts.compress) {
    if (isAudio) {
      // Replace default bitrate with quality-scaled one
      const kbps = Math.round(32 + opts.quality * 256);
      compressionArgs.push("-b:a", `${kbps}k`);
    } else {
      // CRF: 18 = near-lossless, 46 = heavy compression
      const crf = Math.round(18 + (1 - opts.quality) * 28);
      compressionArgs.push("-crf", String(crf));
    }
  }

  opts.onStatus?.("Converting…");

  try {
    await ff.exec([
      "-i", inputName,
      ...codecArgs,
      ...compressionArgs,
      "-avoid_negative_ts", "make_zero",
      "-y",
      outputName,
    ]);
  } catch (e) {
    // Clean up before re-throwing
    try { await ff.deleteFile(inputName); } catch { /* ignore */ }
    throw new Error(`FFmpeg conversion failed: ${(e as Error).message ?? e}`);
  }

  opts.onStatus?.("Packaging…");
  const data = await ff.readFile(outputName);
  const buf  = data instanceof Uint8Array ? data.buffer.slice(0) as ArrayBuffer : (data as unknown as ArrayBuffer);
  const blob = new Blob([buf], { type: opts.targetMime });

  // Clean up virtual FS to free WASM memory
  try { await ff.deleteFile(inputName);  } catch { /* ignore */ }
  try { await ff.deleteFile(outputName); } catch { /* ignore */ }

  return blob;
}
