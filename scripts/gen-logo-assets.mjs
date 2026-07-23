/**
 * Regenerate every brand asset from the supplied artwork in
 * public/file-fettle-icon.png. Run with:  node scripts/gen-logo-assets.mjs
 *
 * The source render sits on a grey glow background, so we first isolate the
 * hexagon badge: collect the vivid/bright "logo" pixels, take their convex hull
 * (the hexagon is convex), and clip to it — dropping the grey and the coloured
 * halo in one shot. Everything downstream is generated from that transparent
 * master so the logo is identical across the header, favicon, PWA/Apple icons
 * and OG image.
 *
 * Outputs:
 *   public/file-fettle-logo.png  — transparent hexagon master (header, OG)
 *   public/icon.png              — 512 transparent (browser-tab icon)
 *   public/icon-192.png / 512    — PWA icons (dark rounded square)
 *   public/apple-icon.png        — 180 Apple touch icon (dark rounded square)
 *   app/favicon.ico              — 16/32/48 transparent frames
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "public/file-fettle-icon.png");

/** Convex hull (Andrew's monotone chain). */
function convexHull(points) {
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of points) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Isolate the hexagon badge → trimmed, padded transparent PNG buffer. */
async function cutHexagon() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const sat = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; };
  const pts = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C, r = data[i], g = data[i + 1], b = data[i + 2];
      const s = sat(r, g, b), lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // vivid rim/halves/arrows, or the bright document — never the soft grey glow.
      if ((s > 0.5 && lum > 60) || lum > 205) pts.push([x, y]);
    }
  }

  let hull = convexHull(pts);
  // Nudge each vertex ~4px outward so the rim's outer edge is never clipped.
  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;
  hull = hull.map(([x, y]) => {
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
    return [Math.round(x + (dx / d) * 4), Math.round(y + (dy / d) * 4)];
  });

  const poly = hull.map(p => p.join(",")).join(" ");
  const maskSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><polygon points="${poly}" fill="#fff"/></svg>`,
  );
  const mask = await sharp(maskSvg).blur(0.6).toColourspace("b-w").png().toBuffer();

  const masked = await sharp(SRC).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  return sharp(masked).trim({ threshold: 1 }).extend({ top: 6, bottom: 6, left: 6, right: 6, background: "#00000000" }).png().toBuffer();
}

/** Fit the logo into a dark rounded square (for maskable PWA / Apple icons). */
async function darkSquare(logo, size) {
  const inner = Math.round(size * 0.74);
  const fitted = await sharp(logo).resize(inner, inner, { fit: "inside", background: "#00000000" }).toBuffer();
  const radius = Math.round(size * 0.22);
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" fill="#0d0d16"/></svg>`,
  );
  return sharp(await sharp(bg).png().toBuffer())
    .composite([{ input: fitted, gravity: "center" }])
    .png().toBuffer();
}

/** Pack PNG frames into a Windows .ico (PNG-encoded, Vista+). */
function buildIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
  const dir = Buffer.alloc(16 * frames.length);
  let offset = 6 + 16 * frames.length;
  const chunks = [header, dir];
  frames.forEach((f, i) => {
    const e = 16 * i;
    dir.writeUInt8(f.size >= 256 ? 0 : f.size, e + 0);
    dir.writeUInt8(f.size >= 256 ? 0 : f.size, e + 1);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(f.data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += f.data.length;
    chunks.push(f.data);
  });
  return Buffer.concat(chunks);
}

async function main() {
  const logo = await cutHexagon();

  // Transparent masters.
  await sharp(logo).toFile(join(ROOT, "public/file-fettle-logo.png"));
  await sharp(logo).resize(512, 512, { fit: "contain", background: "#00000000" }).png().toFile(join(ROOT, "public/icon.png"));

  // PWA + Apple (dark rounded square so the mark survives maskable crops).
  await sharp(await darkSquare(logo, 192)).toFile(join(ROOT, "public/icon-192.png"));
  await sharp(await darkSquare(logo, 512)).toFile(join(ROOT, "public/icon-512.png"));
  await sharp(await darkSquare(logo, 180)).toFile(join(ROOT, "public/apple-icon.png"));

  // favicon.ico — transparent frames.
  const frames = [];
  for (const s of [16, 32, 48]) {
    const data = await sharp(logo).resize(s, s, { fit: "contain", background: "#00000000" }).png().toBuffer();
    frames.push({ size: s, data });
  }
  await writeFile(join(ROOT, "app/favicon.ico"), buildIco(frames));

  const m = await sharp(logo).metadata();
  console.log(`Isolated hexagon: ${m.width}×${m.height}`);
  console.log("Wrote: public/file-fettle-logo.png, public/icon.png, icon-192/512, apple-icon.png, app/favicon.ico");
}

main().catch(err => { console.error(err); process.exit(1); });
