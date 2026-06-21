"use client";

const EXIF_TAGS: Record<number, string> = {
  // TIFF tags
  0x010f: "Make",
  0x0110: "Model",
  0x0112: "Orientation",
  0x011a: "XResolution",
  0x011b: "YResolution",
  0x0128: "ResolutionUnit",
  0x0131: "Software",
  0x0132: "DateTime",
  0x013b: "Artist",
  0x0213: "YCbCrPositioning",
  0x8298: "Copyright",
  0x8769: "ExifIFDPointer",
  0x8825: "GPSInfoIFDPointer",

  // Exif SubIFD tags
  0x829a: "ExposureTime",
  0x829d: "FNumber",
  0x8822: "ExposureProgram",
  0x8827: "ISOSpeedRatings",
  0x9000: "ExifVersion",
  0x9003: "DateTimeOriginal",
  0x9004: "DateTimeDigitized",
  0x9201: "ShutterSpeedValue",
  0x9202: "ApertureValue",
  0x9203: "BrightnessValue",
  0x9204: "ExposureBiasValue",
  0x9205: "MaxApertureValue",
  0x9206: "SubjectDistance",
  0x9207: "MeteringMode",
  0x9208: "LightSource",
  0x9209: "Flash",
  0x920a: "FocalLength",
  0xa000: "FlashpixVersion",
  0xa001: "ColorSpace",
  0xa002: "PixelXDimension",
  0xa003: "PixelYDimension",
  0xa402: "ExposureMode",
  0xa403: "WhiteBalance",
  0xa405: "FocalLengthIn35mmFilm",
  0xa406: "SceneCaptureType",
  0xa408: "Contrast",
  0xa409: "Saturation",
  0xa40a: "Sharpness",
  0xa433: "LensMake",
  0xa434: "LensModel",
};

const GPS_TAGS: Record<number, string> = {
  0x0000: "GPSVersionID",
  0x0001: "GPSLatitudeRef",
  0x0002: "GPSLatitude",
  0x0003: "GPSLongitudeRef",
  0x0004: "GPSLongitude",
  0x0005: "GPSAltitudeRef",
  0x0006: "GPSAltitude",
  0x0007: "GPSTimeStamp",
  0x0008: "GPSSatellites",
  0x000b: "GPSDOP",
  0x001d: "GPSDateStamp",
};

class ExifReader {
  view: DataView;
  littleEndian: boolean = false;
  tiffOffset: number;

  constructor(buffer: ArrayBuffer, tiffOffset: number) {
    this.view = new DataView(buffer);
    this.tiffOffset = tiffOffset;
  }

  getUint16(offset: number): number {
    return this.view.getUint16(this.tiffOffset + offset, this.littleEndian);
  }

  getUint32(offset: number): number {
    return this.view.getUint32(this.tiffOffset + offset, this.littleEndian);
  }

  getString(offset: number, length: number): string {
    const start = this.tiffOffset + offset;
    // Bounds check
    if (start < 0 || start + length > this.view.byteLength) return "";
    const bytes = new Uint8Array(this.view.buffer, start, length);
    let s = "";
    for (let i = 0; i < length; i++) {
      if (bytes[i] === 0) break;
      s += String.fromCharCode(bytes[i]);
    }
    return s.trim();
  }

  readTagValue(offset: number, type: number, count: number): any {
    if (type === 2) {
      // ASCII
      const valOffset = count > 4 ? this.getUint32(offset + 8) : (offset + 8);
      return this.getString(valOffset, count);
    }
    if (type === 3) {
      // SHORT
      if (count === 1) return this.getUint16(offset + 8);
      const res = [];
      const valOffset = count > 2 ? this.getUint32(offset + 8) : (offset + 8);
      for (let i = 0; i < count; i++) res.push(this.getUint16(valOffset + i * 2));
      return res;
    }
    if (type === 4 || type === 9) {
      // LONG / SLONG
      if (count === 1) return this.getUint32(offset + 8);
      const res = [];
      const valOffset = count > 1 ? this.getUint32(offset + 8) : (offset + 8);
      for (let i = 0; i < count; i++) res.push(this.getUint32(valOffset + i * 4));
      return res;
    }
    if (type === 5 || type === 10) {
      // RATIONAL / SRATIONAL
      const valOffset = this.getUint32(offset + 8);
      if (count === 1) {
        const num = this.getUint32(valOffset);
        const den = this.getUint32(valOffset + 4);
        return den === 0 ? 0 : num / den;
      }
      const res = [];
      for (let i = 0; i < count; i++) {
        const num = this.getUint32(valOffset + i * 8);
        const den = this.getUint32(valOffset + i * 8 + 4);
        res.push(den === 0 ? 0 : num / den);
      }
      return res;
    }
    return null;
  }
}

function parseIFD(reader: ExifReader, offset: number, tagMap: Record<number, string>): Record<string, any> {
  const tags: Record<string, any> = {};
  if (offset + 2 > reader.view.byteLength - reader.tiffOffset) return tags;
  
  const numEntries = reader.getUint16(offset);
  let entryOffset = offset + 2;

  for (let i = 0; i < numEntries; i++) {
    if (entryOffset + 12 > reader.view.byteLength - reader.tiffOffset) break;
    const tagId = reader.getUint16(entryOffset);
    const type = reader.getUint16(entryOffset + 2);
    const count = reader.getUint32(entryOffset + 4);
    const tagName = tagMap[tagId] || `Tag_0x${tagId.toString(16).toUpperCase()}`;

    const val = reader.readTagValue(entryOffset, type, count);
    if (val !== null) {
      tags[tagName] = val;
    }

    if (tagId === 0x8769 || tagId === 0x8825) {
      tags[tagName + "_Offset"] = reader.getUint32(entryOffset + 8);
    }

    entryOffset += 12;
  }
  return tags;
}

export interface ExifMetadata {
  fileInfo: {
    name: string;
    size: number;
    type: string;
    lastModified: string;
  };
  camera?: Record<string, any>;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    latitudeRef?: string;
    longitudeRef?: string;
    altitudeRef?: number;
    mapLink?: string;
    raw?: Record<string, any>;
  };
  imageDetails?: Record<string, any>;
  allTags: Array<{ tag: string; value: string; category: string }>;
}

export function parseExif(buffer: ArrayBuffer, file: File): ExifMetadata {
  const metadata: ExifMetadata = {
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
      lastModified: new Date(file.lastModified).toLocaleString(),
    },
    allTags: [],
  };

  // Populate basic file info tags
  metadata.allTags.push(
    { tag: "File Name", value: file.name, category: "File" },
    { tag: "File Size", value: `${(file.size / 1024).toFixed(1)} KB`, category: "File" },
    { tag: "File Type", value: file.type || "unknown", category: "File" },
    { tag: "Last Modified", value: new Date(file.lastModified).toLocaleString(), category: "File" }
  );

  const view = new DataView(buffer);
  if (view.byteLength < 4) return metadata;

  // Verify SOI marker (0xFFD8)
  if (view.getUint16(0) !== 0xFFD8) {
    return metadata; // Not a JPEG
  }

  let offset = 2;
  let app1Offset = -1;

  while (offset < view.byteLength) {
    if (offset + 4 > view.byteLength) break;
    const marker = view.getUint16(offset);
    const length = view.getUint16(offset + 2);

    if (marker === 0xFFE1) {
      // Found APP1 marker
      app1Offset = offset;
      break;
    }

    // Skip marker (marker code + length field + payload length)
    offset += 2 + length;
  }

  if (app1Offset === -1) return metadata; // No APP1 marker found

  const app1PayloadStart = app1Offset + 4;
  if (app1PayloadStart + 6 > view.byteLength) return metadata;

  // Check Exif header "Exif\0\0"
  const isExif =
    view.getUint8(app1PayloadStart) === 0x45 &&
    view.getUint8(app1PayloadStart + 1) === 0x78 &&
    view.getUint8(app1PayloadStart + 2) === 0x69 &&
    view.getUint8(app1PayloadStart + 3) === 0x66 &&
    view.getUint8(app1PayloadStart + 4) === 0x00 &&
    view.getUint8(app1PayloadStart + 5) === 0x00;

  if (!isExif) return metadata;

  const tiffHeaderOffset = app1PayloadStart + 6;
  if (tiffHeaderOffset + 8 > view.byteLength) return metadata;

  const reader = new ExifReader(buffer, tiffHeaderOffset);

  // Read TIFF byte alignment
  const align = reader.view.getUint16(tiffHeaderOffset);
  if (align === 0x4949) {
    reader.littleEndian = true;
  } else if (align === 0x4D4D) {
    reader.littleEndian = false;
  } else {
    return metadata; // Invalid TIFF alignment
  }

  // Verify TIFF magic number (0x002A)
  if (reader.getUint16(2) !== 0x002A) {
    return metadata;
  }

  // Get offset to first IFD (usually 8)
  const firstIFDOffset = reader.getUint32(4);

  // Parse IFD0 (Image File Directory 0)
  const ifd0 = parseIFD(reader, firstIFDOffset, EXIF_TAGS);

  // Parse Exif SubIFD if present
  let subIfd: Record<string, any> = {};
  if (ifd0.ExifIFDPointer_Offset !== undefined) {
    subIfd = parseIFD(reader, ifd0.ExifIFDPointer_Offset, EXIF_TAGS);
  }

  // Parse GPS IFD if present
  let gpsIfd: Record<string, any> = {};
  if (ifd0.GPSInfoIFDPointer_Offset !== undefined) {
    gpsIfd = parseIFD(reader, ifd0.GPSInfoIFDPointer_Offset, GPS_TAGS);
  }

  // Format Camera settings
  const camera: Record<string, any> = {};
  const imageDetails: Record<string, any> = {};

  const addToMeta = (source: Record<string, any>, key: string, target: Record<string, any>, category: string, prettyName?: string) => {
    if (source[key] !== undefined) {
      let val = source[key];
      // Clean up string representations if needed
      if (typeof val === "string") val = val.trim();
      target[prettyName || key] = val;
      metadata.allTags.push({ tag: prettyName || key, value: String(val), category });
    }
  };

  // Populate TIFF/IFD0 metadata
  addToMeta(ifd0, "Make", camera, "Camera", "Camera Make");
  addToMeta(ifd0, "Model", camera, "Camera", "Camera Model");
  addToMeta(ifd0, "Software", camera, "Camera", "Software");
  addToMeta(ifd0, "Artist", camera, "Camera", "Artist");
  addToMeta(ifd0, "Copyright", camera, "Camera", "Copyright");
  addToMeta(ifd0, "DateTime", imageDetails, "Image", "Date/Time");
  addToMeta(ifd0, "Orientation", imageDetails, "Image", "Orientation");

  // Populate Exif SubIFD metadata
  addToMeta(subIfd, "ExposureTime", camera, "Camera", "Exposure Time");
  addToMeta(subIfd, "FNumber", camera, "Camera", "F-Number");
  addToMeta(subIfd, "ExposureProgram", camera, "Camera", "Exposure Program");
  addToMeta(subIfd, "ISOSpeedRatings", camera, "Camera", "ISO Speed");
  addToMeta(subIfd, "DateTimeOriginal", imageDetails, "Image", "Date/Time Original");
  addToMeta(subIfd, "DateTimeDigitized", imageDetails, "Image", "Date/Time Digitized");
  addToMeta(subIfd, "ShutterSpeedValue", camera, "Camera", "Shutter Speed");
  addToMeta(subIfd, "ApertureValue", camera, "Camera", "Aperture");
  addToMeta(subIfd, "BrightnessValue", camera, "Camera", "Brightness");
  addToMeta(subIfd, "ExposureBiasValue", camera, "Camera", "Exposure Bias");
  addToMeta(subIfd, "MaxApertureValue", camera, "Camera", "Max Aperture");
  addToMeta(subIfd, "MeteringMode", camera, "Camera", "Metering Mode");
  addToMeta(subIfd, "LightSource", camera, "Camera", "Light Source");
  addToMeta(subIfd, "Flash", camera, "Camera", "Flash");
  addToMeta(subIfd, "FocalLength", camera, "Camera", "Focal Length");
  addToMeta(subIfd, "ColorSpace", imageDetails, "Image", "Color Space");
  addToMeta(subIfd, "PixelXDimension", imageDetails, "Image", "Pixel Width");
  addToMeta(subIfd, "PixelYDimension", imageDetails, "Image", "Pixel Height");
  addToMeta(subIfd, "LensMake", camera, "Camera", "Lens Make");
  addToMeta(subIfd, "LensModel", camera, "Camera", "Lens Model");

  metadata.camera = camera;
  metadata.imageDetails = imageDetails;

  // Process GPS tags if present
  if (Object.keys(gpsIfd).length > 0) {
    const gps: NonNullable<ExifMetadata["gps"]> = { raw: gpsIfd };

    const parseGPSCoordinate = (coords: any, ref: string): number | undefined => {
      if (Array.isArray(coords) && coords.length >= 3) {
        const d = coords[0];
        const m = coords[1];
        const s = coords[2];
        let dec = d + m / 60 + s / 3600;
        if (ref === "S" || ref === "W") dec = -dec;
        return dec;
      }
      return undefined;
    };

    const lat = parseGPSCoordinate(gpsIfd.GPSLatitude, gpsIfd.GPSLatitudeRef);
    const lng = parseGPSCoordinate(gpsIfd.GPSLongitude, gpsIfd.GPSLongitudeRef);

    if (lat !== undefined) gps.latitude = lat;
    if (lng !== undefined) gps.longitude = lng;
    if (gpsIfd.GPSLatitudeRef) gps.latitudeRef = gpsIfd.GPSLatitudeRef;
    if (gpsIfd.GPSLongitudeRef) gps.longitudeRef = gpsIfd.GPSLongitudeRef;

    if (gpsIfd.GPSAltitude !== undefined) {
      let alt = gpsIfd.GPSAltitude;
      if (gpsIfd.GPSAltitudeRef === 1) alt = -alt; // Below sea level
      gps.altitude = alt;
      gps.altitudeRef = gpsIfd.GPSAltitudeRef;
    }

    // Generate Google Maps link if both lat and lng are successfully parsed
    if (lat !== undefined && lng !== undefined) {
      gps.mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }

    metadata.gps = gps;

    // Add GPS info to allTags list
    if (lat !== undefined) metadata.allTags.push({ tag: "GPS Latitude", value: `${lat.toFixed(6)}° ${gpsIfd.GPSLatitudeRef || ""}`, category: "GPS" });
    if (lng !== undefined) metadata.allTags.push({ tag: "GPS Longitude", value: `${lng.toFixed(6)}° ${gpsIfd.GPSLongitudeRef || ""}`, category: "GPS" });
    if (gps.altitude !== undefined) metadata.allTags.push({ tag: "GPS Altitude", value: `${gps.altitude.toFixed(1)}m`, category: "GPS" });
    if (gpsIfd.GPSTimeStamp) metadata.allTags.push({ tag: "GPS Time Stamp", value: String(gpsIfd.GPSTimeStamp), category: "GPS" });
    if (gpsIfd.GPSDateStamp) metadata.allTags.push({ tag: "GPS Date Stamp", value: String(gpsIfd.GPSDateStamp), category: "GPS" });
  }

  return metadata;
}
