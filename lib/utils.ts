"use client";

/**
 * Format bytes into human-readable size.
 */
export function fmtBytes(b: number): string {
  if (b < 1024)      return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(1)} GB`;
}

/**
 * Trigger browser download of a Blob.
 */
export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Map a numeric compression quality (0-1) to a user-facing label.
 */
export function qualityLabel(q: number): string {
  if (q <= 0.25) return "Maximum compression";
  if (q <= 0.5)  return "Balanced";
  if (q <= 0.75) return "High quality";
  return "Maximum quality";
}
