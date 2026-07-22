/**
 * QR styling renderer.
 *
 * The `qrcode` package only draws plain square modules, so we take its raw
 * module matrix and do our own drawing. Every shape is emitted as SVG path
 * data in *module coordinates*, which is then either filled into a canvas via
 * Path2D or written straight into an <svg>. One geometry implementation, so
 * the PNG and the SVG are guaranteed to match pixel for pixel.
 */

import type { QRCode } from "qrcode";

export type ModuleShape = "square" | "rounded" | "dots";
export type EyeShape    = "square" | "rounded" | "circle";

export interface LogoOptions {
  /** Data URL. Kept as a string so the SVG export can inline it. */
  src: string;
  /** Logo width as a fraction of the full code (0.1–0.3). */
  scale: number;
  /** Draw a solid plate behind the logo so modules don't show through. */
  plate: boolean;
  /** Round the plate into a circle rather than a rounded square. */
  round: boolean;
}

export interface StyleOptions {
  dark: string;
  /** `null` renders a transparent background. */
  light: string | null;
  /** Colour for the three finder patterns; falls back to `dark`. */
  eyeColor?: string | null;
  margin: number;
  moduleShape: ModuleShape;
  eyeShape: EyeShape;
  logo?: LogoOptions | null;
}

/** Paths in module coordinates, plus the overall size including the margin. */
export interface QrPaths {
  body:   string;
  frames: string;
  balls:  string;
  /** Width/height of the drawing in module units (matrix + both margins). */
  dim: number;
}

/* ------------------------------------------------------------------ *
 * Path primitives — all coordinates are in module units
 * ------------------------------------------------------------------ */

const n = (v: number) => {
  // Trim float noise so path strings stay short and diff-stable.
  const r = Math.round(v * 1000) / 1000;
  return Object.is(r, -0) ? "0" : String(r);
};

/** Rounded rectangle with independent corner radii, as SVG path data. */
function rectPath(
  x: number, y: number, w: number, h: number,
  [tl, tr, br, bl]: [number, number, number, number],
): string {
  if (!tl && !tr && !br && !bl) {
    return `M${n(x)} ${n(y)}H${n(x + w)}V${n(y + h)}H${n(x)}Z`;
  }
  return [
    `M${n(x + tl)} ${n(y)}`,
    `H${n(x + w - tr)}`,
    tr ? `A${n(tr)} ${n(tr)} 0 0 1 ${n(x + w)} ${n(y + tr)}` : "",
    `V${n(y + h - br)}`,
    br ? `A${n(br)} ${n(br)} 0 0 1 ${n(x + w - br)} ${n(y + h)}` : "",
    `H${n(x + bl)}`,
    bl ? `A${n(bl)} ${n(bl)} 0 0 1 ${n(x)} ${n(y + h - bl)}` : "",
    `V${n(y + tl)}`,
    tl ? `A${n(tl)} ${n(tl)} 0 0 1 ${n(x + tl)} ${n(y)}` : "",
    "Z",
  ].join("");
}

/** Circle as two arcs — usable in both Path2D and SVG. */
function circlePath(cx: number, cy: number, r: number): string {
  return (
    `M${n(cx - r)} ${n(cy)}` +
    `A${n(r)} ${n(r)} 0 1 0 ${n(cx + r)} ${n(cy)}` +
    `A${n(r)} ${n(r)} 0 1 0 ${n(cx - r)} ${n(cy)}Z`
  );
}

/* ------------------------------------------------------------------ *
 * Matrix → paths
 * ------------------------------------------------------------------ */

/** The three finder patterns occupy 7×7 blocks in the corners. */
function eyeOrigins(size: number): [number, number][] {
  return [[0, 0], [size - 7, 0], [0, size - 7]];
}

function isEyeModule(x: number, y: number, size: number): boolean {
  return eyeOrigins(size).some(([ex, ey]) =>
    x >= ex && x < ex + 7 && y >= ey && y < ey + 7);
}

export function buildPaths(qr: QRCode, opts: StyleOptions): QrPaths {
  const size   = qr.modules.size;
  const data   = qr.modules.data;
  const margin = opts.margin;
  const dim    = size + margin * 2;

  const dark = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < size && y < size && !!data[y * size + x];

  // Function patterns (timing and alignment) are what a scanner uses to lock
  // onto the module grid. Shrinking those into separated dots breaks the
  // lock and the code stops decoding, so they always stay solid squares —
  // only the data modules get styled. `reservedBit` marks them for us.
  const reserved = qr.modules.reservedBit;
  const isFunction = (x: number, y: number) => !!reserved?.[y * size + x];

  const body: string[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!dark(x, y) || isEyeModule(x, y, size)) continue;
      const px = x + margin;
      const py = y + margin;

      if (opts.moduleShape === "square" || isFunction(x, y)) {
        body.push(rectPath(px, py, 1, 1, [0, 0, 0, 0]));
        continue;
      }
      if (opts.moduleShape === "dots") {
        body.push(circlePath(px + 0.5, py + 0.5, 0.45));
        continue;
      }

      // "rounded": only round corners that aren't touching another dark
      // module, so runs of modules merge into smooth continuous strokes
      // instead of a field of disconnected blobs.
      const up = dark(x, y - 1), rt = dark(x + 1, y);
      const dn = dark(x, y + 1), lf = dark(x - 1, y);
      const r  = 0.5;
      body.push(rectPath(px, py, 1, 1, [
        !up && !lf ? r : 0,
        !up && !rt ? r : 0,
        !dn && !rt ? r : 0,
        !dn && !lf ? r : 0,
      ]));
    }
  }

  const frames: string[] = [];
  const balls:  string[] = [];

  for (const [ex, ey] of eyeOrigins(size)) {
    const x = ex + margin;
    const y = ey + margin;

    if (opts.eyeShape === "circle") {
      // Ring: outer circle with an inner circle subtracted via evenodd.
      frames.push(circlePath(x + 3.5, y + 3.5, 3.5) + circlePath(x + 3.5, y + 3.5, 2.5));
      balls.push(circlePath(x + 3.5, y + 3.5, 1.5));
    } else if (opts.eyeShape === "rounded") {
      frames.push(
        rectPath(x, y, 7, 7, [2, 2, 2, 2]) +
        rectPath(x + 1, y + 1, 5, 5, [1.5, 1.5, 1.5, 1.5]),
      );
      balls.push(rectPath(x + 2, y + 2, 3, 3, [1, 1, 1, 1]));
    } else {
      frames.push(
        rectPath(x, y, 7, 7, [0, 0, 0, 0]) +
        rectPath(x + 1, y + 1, 5, 5, [0, 0, 0, 0]),
      );
      balls.push(rectPath(x + 2, y + 2, 3, 3, [0, 0, 0, 0]));
    }
  }

  return { body: body.join(""), frames: frames.join(""), balls: balls.join(""), dim };
}

/* ------------------------------------------------------------------ *
 * Logo geometry
 * ------------------------------------------------------------------ */

interface LogoBox { x: number; y: number; side: number; plate: string; padding: number }

function logoBox(dim: number, logo: LogoOptions): LogoBox {
  const side    = dim * logo.scale;
  const padding = logo.plate ? Math.max(0.6, side * 0.12) : 0;
  return { x: (dim - side) / 2, y: (dim - side) / 2, side, plate: "", padding };
}

/* ------------------------------------------------------------------ *
 * Canvas rendering
 * ------------------------------------------------------------------ */

/**
 * Draw onto a canvas at (or near) `pixelSize`. The module size is snapped to a
 * whole number of pixels so modules never land on half-pixel boundaries — that
 * snapping is what keeps the code crisp rather than blurry. Returns the exact
 * pixel size used.
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  qr: QRCode,
  opts: StyleOptions,
  pixelSize: number,
  logoImage?: HTMLImageElement | null,
): number {
  const paths = buildPaths(qr, opts);
  const scale = Math.max(1, Math.round(pixelSize / paths.dim));
  const side  = scale * paths.dim;

  canvas.width  = side;
  canvas.height = side;

  const ctx = canvas.getContext("2d");
  if (!ctx) return side;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, side, side);

  if (opts.light) {
    ctx.fillStyle = opts.light;
    ctx.fillRect(0, 0, side, side);
  }

  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  ctx.fillStyle = opts.dark;
  if (paths.body) ctx.fill(new Path2D(paths.body));

  ctx.fillStyle = opts.eyeColor || opts.dark;
  if (paths.frames) ctx.fill(new Path2D(paths.frames), "evenodd");
  if (paths.balls)  ctx.fill(new Path2D(paths.balls));

  if (opts.logo && logoImage) {
    const box = logoBox(paths.dim, opts.logo);

    if (opts.logo.plate) {
      const p = box.padding;
      ctx.fillStyle = opts.light || "#ffffff";
      const plate = opts.logo.round
        ? circlePath(paths.dim / 2, paths.dim / 2, box.side / 2 + p)
        : rectPath(box.x - p, box.y - p, box.side + p * 2, box.side + p * 2,
                   [0.8, 0.8, 0.8, 0.8]);
      ctx.fill(new Path2D(plate));
    }

    // Preserve the logo's aspect ratio inside the square box.
    const ratio = logoImage.naturalWidth / logoImage.naturalHeight || 1;
    const w = ratio >= 1 ? box.side : box.side * ratio;
    const h = ratio >= 1 ? box.side / ratio : box.side;
    ctx.drawImage(logoImage, (paths.dim - w) / 2, (paths.dim - h) / 2, w, h);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return side;
}

/* ------------------------------------------------------------------ *
 * SVG rendering
 * ------------------------------------------------------------------ */

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderToSvg(
  qr: QRCode,
  opts: StyleOptions,
  pixelSize: number,
  logoRatio = 1,
): string {
  const paths = buildPaths(qr, opts);
  const d     = paths.dim;
  const eye   = opts.eyeColor || opts.dark;

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" ` +
      `viewBox="0 0 ${d} ${d}" shape-rendering="geometricPrecision">`,
  ];

  if (opts.light) parts.push(`<rect width="${d}" height="${d}" fill="${xmlEscape(opts.light)}"/>`);
  if (paths.body)   parts.push(`<path d="${paths.body}" fill="${xmlEscape(opts.dark)}"/>`);
  if (paths.frames) parts.push(`<path d="${paths.frames}" fill="${xmlEscape(eye)}" fill-rule="evenodd"/>`);
  if (paths.balls)  parts.push(`<path d="${paths.balls}" fill="${xmlEscape(eye)}"/>`);

  if (opts.logo) {
    const box = logoBox(d, opts.logo);
    if (opts.logo.plate) {
      const p = box.padding;
      const fill = xmlEscape(opts.light || "#ffffff");
      parts.push(opts.logo.round
        ? `<circle cx="${d / 2}" cy="${d / 2}" r="${n(box.side / 2 + p)}" fill="${fill}"/>`
        : `<rect x="${n(box.x - p)}" y="${n(box.y - p)}" width="${n(box.side + p * 2)}" ` +
          `height="${n(box.side + p * 2)}" rx="0.8" fill="${fill}"/>`);
    }
    const w = logoRatio >= 1 ? box.side : box.side * logoRatio;
    const h = logoRatio >= 1 ? box.side / logoRatio : box.side;
    parts.push(
      `<image href="${xmlEscape(opts.logo.src)}" x="${n((d - w) / 2)}" y="${n((d - h) / 2)}" ` +
      `width="${n(w)}" height="${n(h)}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }

  parts.push("</svg>");
  return parts.join("");
}
