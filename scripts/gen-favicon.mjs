import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "app", "icon.svg"));

// Apple touch icons must be full-bleed and opaque — iOS applies its own
// rounded mask and renders transparent pixels as black. Square off the
// corners so the gradient fills the whole tile.
const appleSvg = Buffer.from(svg.toString().replace('rx="5.5"', 'rx="0"'));

const png = (size, src = svg) =>
  sharp(src, { density: 384 }).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

// Assemble a multi-size PNG-in-ICO (supported by all modern browsers).
function buildIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type: icon
  header.writeUInt16LE(count, 4);  // image count

  const entries = [];
  let offset = 6 + count * 16;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 => 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2);                      // palette
    e.writeUInt8(0, 3);                      // reserved
    e.writeUInt16LE(1, 4);                   // color planes
    e.writeUInt16LE(32, 6);                  // bits per pixel
    e.writeUInt32LE(data.length, 8);         // size of image data
    e.writeUInt32LE(offset, 12);             // offset
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(size) })));
writeFileSync(join(root, "app", "favicon.ico"), buildIco(icoImages));

writeFileSync(join(root, "public", "icon-192.png"), await png(192));
writeFileSync(join(root, "public", "icon-512.png"), await png(512));
writeFileSync(join(root, "public", "apple-icon.png"), await png(180, appleSvg));

console.log("favicon.ico + PWA icons written");
