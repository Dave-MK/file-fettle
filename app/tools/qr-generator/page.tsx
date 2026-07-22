"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QrCode } from "lucide-react";
import {
  QR_TYPES, QR_GROUPS, getQrType, isComplete, initialValues,
  type FieldValues, type QrField,
} from "@/lib/qr-payloads";
import {
  renderToCanvas, renderToSvg,
  type ModuleShape, type EyeShape, type StyleOptions,
} from "@/lib/qr-render";
import { downloadBlob } from "@/lib/utils";

type Ecc = "L" | "M" | "Q" | "H";

const ECC_LEVELS: { value: Ecc; label: string; hint: string }[] = [
  { value: "L", label: "L — 7%",  hint: "Smallest code. Best for clean digital screens." },
  { value: "M", label: "M — 15%", hint: "Balanced. The usual choice for print." },
  { value: "Q", label: "Q — 25%", hint: "Survives scuffs on stickers and labels." },
  { value: "H", label: "H — 30%", hint: "Most robust — needed if you overlay a logo." },
];

const MODULE_SHAPES: { value: ModuleShape; label: string }[] = [
  { value: "square",  label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots",    label: "Dots" },
];

const EYE_SHAPES: { value: EyeShape; label: string }[] = [
  { value: "square",  label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "circle",  label: "Circle" },
];

/** Miniature preview of a module shape, drawn as a 3×3 sample. */
function ShapeSwatch({ kind }: { kind: ModuleShape }) {
  const cells = [[0, 0], [1, 0], [2, 0], [1, 1], [0, 2], [1, 2], [2, 2]];
  return (
    <svg viewBox="0 0 3 3" width="22" height="22" aria-hidden="true" focusable="false">
      {cells.map(([x, y]) =>
        kind === "dots"
          ? <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.42} fill="currentColor" />
          : <rect
              key={`${x}-${y}`} x={x + 0.06} y={y + 0.06} width={0.88} height={0.88}
              rx={kind === "rounded" ? 0.34 : 0} fill="currentColor"
            />,
      )}
    </svg>
  );
}

/** Miniature preview of a finder-pattern style. */
function EyeSwatch({ kind }: { kind: EyeShape }) {
  if (kind === "circle") {
    return (
      <svg viewBox="0 0 7 7" width="22" height="22" aria-hidden="true" focusable="false">
        <circle cx="3.5" cy="3.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="3.5" cy="3.5" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  const r = kind === "rounded" ? 2 : 0;
  return (
    <svg viewBox="0 0 7 7" width="22" height="22" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="6" height="6" rx={r} fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="2" y="2" width="3" height="3" rx={r ? 1 : 0} fill="currentColor" />
    </svg>
  );
}

/** Filenames are derived from the type so a folder of downloads stays readable. */
function fileName(typeId: string, ext: string) {
  return `qr-${typeId}.${ext}`;
}

export default function QrGeneratorPage() {
  const [typeId, setTypeId] = useState("url");
  const [group,  setGroup]  = useState(QR_GROUPS[0]);

  // Values are kept per type so switching away and back doesn't lose input.
  const [allValues, setAllValues] = useState<Record<string, FieldValues>>(() => {
    const seed: Record<string, FieldValues> = {};
    for (const t of QR_TYPES) seed[t.id] = initialValues(t);
    return seed;
  });

  // Appearance
  const [size,   setSize]   = useState(512);
  const [margin, setMargin] = useState(4);
  const [ecc,    setEcc]    = useState<Ecc>("M");
  const [dark,   setDark]   = useState("#000000");
  const [light,  setLight]  = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [moduleShape, setModuleShape] = useState<ModuleShape>("square");
  const [eyeShape,    setEyeShape]    = useState<EyeShape>("square");
  const [eyeColor,    setEyeColor]    = useState("#000000");
  const [matchEyes,   setMatchEyes]   = useState(true);

  // Logo
  const [logoSrc,   setLogoSrc]   = useState<string | null>(null);
  const [logoName,  setLogoName]  = useState<string>("");
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoScale, setLogoScale] = useState(0.2);
  const [logoPlate, setLogoPlate] = useState(true);
  const [logoRound, setLogoRound] = useState(false);

  const [error,     setError]     = useState<string | null>(null);
  const [copied,    setCopied]    = useState<"payload" | "png" | null>(null);
  const [showPayload, setShowPayload] = useState(false);
  const [actualSize, setActualSize] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const def    = getQrType(typeId);
  // Stable identity — an inline `?? {}` would be a new object every render and
  // would retrigger the render effect continuously.
  const values = useMemo(() => allValues[typeId] ?? {}, [allValues, typeId]);
  const ready  = isComplete(def, values);

  const payload = useMemo(() => (ready ? def.build(values) : ""), [def, values, ready]);

  const setField = (id: string, val: string) =>
    setAllValues(prev => ({ ...prev, [typeId]: { ...prev[typeId], [id]: val } }));

  const pickType = (id: string) => {
    setTypeId(id);
    setError(null);
  };

  const pickGroup = (g: string) => {
    setGroup(g);
    if (getQrType(typeId).group !== g) {
      const first = QR_TYPES.find(t => t.group === g);
      if (first) pickType(first.id);
    }
  };

  const styleOptions: StyleOptions = useMemo(() => ({
    dark,
    light: transparent ? null : light,
    eyeColor: matchEyes ? null : eyeColor,
    margin,
    moduleShape,
    eyeShape,
    logo: logoSrc ? { src: logoSrc, scale: logoScale, plate: logoPlate, round: logoRound } : null,
  }), [dark, light, transparent, eyeColor, matchEyes, margin, moduleShape, eyeShape,
       logoSrc, logoScale, logoPlate, logoRound]);

  /* Render to canvas whenever the payload or appearance changes. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!payload) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

    let cancelled = false;
    (async () => {
      try {
        // Awaited before any setState so this never cascades a render.
        const QRCode = (await import("qrcode")).default;
        if (cancelled) return;
        if (!payload) { setError(null); return; }
        const qr = QRCode.create(payload, { errorCorrectionLevel: ecc });
        const px = renderToCanvas(canvas, qr, styleOptions, size, logoImage);
        if (!cancelled) { setError(null); setActualSize(px); }
      } catch (e) {
        if (cancelled) return;
        const msg = (e as Error).message || "";
        setError(
          /too (big|long)|code length overflow|data too long/i.test(msg)
            ? "Too much data for a single QR code. Shorten the content, or drop the error correction level to L."
            : msg || "Could not generate this QR code.",
        );
      }
    })();

    return () => { cancelled = true; };
  }, [payload, styleOptions, ecc, size, logoImage]);

  /* ---------------------------- downloads --------------------------- */

  /** JPEG has no alpha, so flatten onto white before encoding. */
  const flatten = useCallback((src: HTMLCanvasElement) => {
    const out = document.createElement("canvas");
    out.width  = src.width;
    out.height = src.height;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, 0, 0);
    return out;
  }, []);

  const downloadRaster = (type: "image/png" | "image/jpeg" | "image/webp", ext: string) => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    const source = type === "image/jpeg" ? flatten(canvas) : canvas;
    source.toBlob(blob => {
      if (blob) downloadBlob(blob, fileName(typeId, ext));
    }, type, type === "image/png" ? undefined : 0.95);
  };

  const downloadSvg = async () => {
    if (!payload) return;
    const QRCode = (await import("qrcode")).default;
    const qr    = QRCode.create(payload, { errorCorrectionLevel: ecc });
    const ratio = logoImage ? logoImage.naturalWidth / logoImage.naturalHeight || 1 : 1;
    const svg   = renderToSvg(qr, styleOptions, size, ratio);
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), fileName(typeId, "svg"));
  };

  /* ------------------------------- logo ----------------------------- */

  const loadLogo = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Use a PNG, JPG or SVG logo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        setLogoImage(img);
        setLogoSrc(src);
        setLogoName(file.name);
        // A logo covers modules, so the code needs the strongest error
        // correction to stay scannable.
        setEcc("H");
      };
      img.onerror = () => setError("That image couldn't be loaded.");
      img.src = src;
    };
    reader.onerror = () => setError("That image couldn't be read.");
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoSrc(null);
    setLogoImage(null);
    setLogoName("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const copyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    try {
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied("png");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Your browser blocked copying images. Use Download PNG instead.");
    }
  };

  const copyPayload = async () => {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    setCopied("payload");
    setTimeout(() => setCopied(null), 1500);
  };

  const reset = () => {
    setAllValues(prev => ({ ...prev, [typeId]: initialValues(def) }));
    setError(null);
  };

  /* ------------------------------ field ----------------------------- */

  const renderField = (f: QrField) => {
    const val = values[f.id] ?? "";
    const common = {
      id: `qr-${typeId}-${f.id}`,
      className: "qr-input",
      value: val,
      placeholder: f.placeholder,
    };

    // The grid auto-fits as many ~240px tracks as the width allows. Short
    // fields take one track, longer ones take two, and textareas span the
    // whole row — so a wide screen fills out instead of leaving a dead gutter.
    const cellClass = [
      f.type === "textarea" ? "qr-field-full" : f.half ? "" : "qr-field-wide",
      f.type === "checkbox" ? "qr-field-check" : "",
    ].filter(Boolean).join(" ") || undefined;

    return (
      <div key={f.id} className={cellClass}>
        {f.type !== "checkbox" && (
          <label className="qr-label" htmlFor={common.id}>
            {f.label}
            {f.required && <span style={{ color: "var(--color-data)" }}> *</span>}
          </label>
        )}

        {f.type === "textarea" && (
          <textarea {...common} rows={3} onChange={e => setField(f.id, e.target.value)} />
        )}

        {f.type === "select" && (
          <select
            id={common.id}
            className={common.className}
            value={val || f.initial || f.options![0].value}
            onChange={e => setField(f.id, e.target.value)}
          >
            {f.options!.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}

        {f.type === "checkbox" && (
          <label className="qr-check" htmlFor={common.id}>
            <input
              id={common.id}
              type="checkbox"
              checked={val === "true"}
              onChange={e => setField(f.id, e.target.checked ? "true" : "")}
            />
            {f.label}
          </label>
        )}

        {!["textarea", "select", "checkbox"].includes(f.type) && (
          <input {...common} type={f.type} onChange={e => setField(f.id, e.target.value)} />
        )}

        {f.hint && <p className="qr-hint">{f.hint}</p>}
      </div>
    );
  };

  const typesInGroup = QR_TYPES.filter(t => t.group === group);

  return (
    <main id="main-content">
      <div className="tool-shell">

        {/* Page header */}
        <div className="flex items-start gap-4 mb-9">
          <div
            className="tool-icon-wrap"
            style={{ background: "var(--color-data-dim)", border: "1px solid rgba(139, 92, 246, 0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-hidden="true"
          >
            <QrCode size={32} strokeWidth={1.5} color="var(--color-data)" />
          </div>
          <div>
            <h1 className="text-display mb-1">QR Code Generator</h1>
            <p className="text-lg text-muted leading-relaxed">
              Create QR codes for {QR_TYPES.length} kinds of data — links, Wi-Fi, contacts, payments and more.
              Generated in your browser, so every code is static: unlimited scans, no expiry, no tracking.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 30 }}>
          <span className="badge badge-green">Unlimited scans</span>
          <span className="badge badge-green">Never expires</span>
          <span className="badge badge-blue">No account required</span>
          <span className="badge badge-purple">No tracking redirect</span>
        </div>

        <div className="qr-stack">

          {/* -- 1. Pick the data type -- */}
          <section>
            <p className="section-label">Data type</p>
            <div className="seg-tabs qr-group-tabs" style={{ marginBottom: 16 }}>
              {QR_GROUPS.map(g => (
                <button
                  key={g}
                  onClick={() => pickGroup(g)}
                  className={`seg-tab${group === g ? " active" : ""}`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="qr-type-grid">
              {typesInGroup.map(t => (
                <button
                  key={t.id}
                  onClick={() => pickType(t.id)}
                  className={`qr-type-btn${typeId === t.id ? " active" : ""}`}
                  aria-pressed={typeId === t.id}
                >
                  <span className="qr-type-icon" aria-hidden="true">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* -- 2. Fill in the content -- */}
          <section className="card qr-card">
            <div className="qr-card-head">
              <div>
                <p className="qr-card-title">{def.icon} {def.label}</p>
                <p className="qr-card-desc">{def.desc}</p>
              </div>
              <button onClick={reset} className="qr-clear">Clear</button>
            </div>

            <div className="qr-fields">{def.fields.map(renderField)}</div>
          </section>

          {/* -- 3. Preview and download -- */}
          <section className="card qr-card">
            <div className="qr-result">
              <div className="qr-result-preview">
                {/* The canvas stays mounted in every state - remounting it
                    would orphan the ref the render effect draws into. */}
                <div className="qr-canvas-wrap">
                  {/* Square by aspect-ratio and sized purely by CSS width -
                      never give it a fixed height, or it gets squashed. */}
                  <canvas
                    ref={canvasRef}
                    className="qr-canvas"
                    style={{ display: payload && !error ? "block" : "none" }}
                  />
                  {(!payload || error) && (
                    <div className="qr-placeholder">
                      <p>
                        {error ? "Nothing to show" : `Fill in the required ${def.label.toLowerCase()} fields to see your code.`}
                      </p>
                    </div>
                  )}
                </div>
                {actualSize > 0 && !!payload && !error && (
                  <p className="qr-size-note">{actualSize} x {actualSize} px</p>
                )}
              </div>

              <div className="qr-result-actions">
                <p className="section-label">Download</p>

                {error && <p className="qr-error">&#10007; {error}</p>}

                <button
                  onClick={() => downloadRaster("image/png", "png")}
                  className="btn-primary"
                  disabled={!payload || !!error}
                  style={{ width: "100%", marginBottom: 8 }}
                >
                  Download PNG
                </button>
                <div className="qr-download-row">
                  <button onClick={downloadSvg} className="btn-secondary" disabled={!payload || !!error}>SVG</button>
                  <button onClick={() => downloadRaster("image/jpeg", "jpg")}  className="btn-secondary" disabled={!payload || !!error}>JPG</button>
                  <button onClick={() => downloadRaster("image/webp", "webp")} className="btn-secondary" disabled={!payload || !!error}>WebP</button>
                </div>
                <button
                  onClick={copyImage}
                  className="btn-secondary"
                  disabled={!payload || !!error}
                  style={{ width: "100%", fontSize: 12 }}
                >
                  {copied === "png" ? "✓ Copied to clipboard" : "Copy image"}
                </button>
              </div>
            </div>

            {/* Raw payload inspector — full card width so long payloads wrap
                sensibly rather than being squeezed under the buttons. */}
            {payload && (
              <div className="qr-payload">
                <div className="qr-payload-head">
                  <button onClick={() => setShowPayload(v => !v)} className="qr-payload-toggle">
                    {showPayload ? "▾" : "▸"} Encoded data ({payload.length} characters)
                  </button>
                  {showPayload && (
                    <button
                      onClick={copyPayload}
                      className="qr-payload-copy"
                      style={{ color: copied === "payload" ? "var(--green)" : "var(--accent)" }}
                    >
                      {copied === "payload" ? "✓ Copied" : "Copy"}
                    </button>
                  )}
                </div>
                {showPayload && <pre className="qr-payload-pre">{payload}</pre>}
              </div>
            )}
          </section>

          {/* -- 4. Customise -- */}
          <section>
            <p className="section-label">Customise</p>
            <div className="qr-settings-grid">

              {/* Style */}
              <div className="card qr-panel">
                <p className="qr-panel-title">Style</p>
                <div className="qr-panel-body">
                  <div>
                    <p className="qr-label">Module shape</p>
                    <div className="qr-shape-row">
                      {MODULE_SHAPES.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setModuleShape(s.value)}
                          className={`qr-shape-btn${moduleShape === s.value ? " active" : ""}`}
                          aria-pressed={moduleShape === s.value}
                          title={s.label}
                        >
                          <ShapeSwatch kind={s.value} />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="qr-label">Corner (eye) shape</p>
                    <div className="qr-shape-row">
                      {EYE_SHAPES.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setEyeShape(s.value)}
                          className={`qr-shape-btn${eyeShape === s.value ? " active" : ""}`}
                          aria-pressed={eyeShape === s.value}
                          title={s.label}
                        >
                          <EyeSwatch kind={s.value} />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colours */}
              <div className="card qr-panel">
                <p className="qr-panel-title">Colours</p>
                <div className="qr-panel-body">
                  <div>
                    <label className="qr-label" htmlFor="qr-dark">Modules</label>
                    <div className="qr-color-row">
                      <input id="qr-dark" type="color" className="qr-swatch" value={dark}
                             onChange={e => setDark(e.target.value)} />
                      <span className="qr-hex">{dark}</span>
                    </div>
                  </div>

                  <div>
                    <label className="qr-label" htmlFor="qr-light">Background</label>
                    <div className="qr-color-row">
                      <input
                        id="qr-light" type="color" className="qr-swatch" value={light}
                        disabled={transparent}
                        onChange={e => setLight(e.target.value)}
                        style={{ opacity: transparent ? 0.4 : 1 }}
                      />
                      <span className="qr-hex">{transparent ? "none" : light}</span>
                    </div>
                    <label className="qr-check">
                      <input type="checkbox" checked={transparent}
                             onChange={e => setTransparent(e.target.checked)} />
                      Transparent
                    </label>
                  </div>

                  <div>
                    <p className="qr-label">Corners</p>
                    {!matchEyes && (
                      <div className="qr-color-row">
                        <input id="qr-eye-color" type="color" className="qr-swatch" value={eyeColor}
                               onChange={e => setEyeColor(e.target.value)} />
                        <label className="qr-hex" htmlFor="qr-eye-color">{eyeColor}</label>
                      </div>
                    )}
                    <label className="qr-check">
                      <input type="checkbox" checked={!matchEyes}
                             onChange={e => setMatchEyes(!e.target.checked)} />
                      Colour separately
                    </label>
                  </div>

                  <p className="qr-hint qr-span-all">
                    Keep the modules darker than the background - inverted codes fail on many scanners.
                  </p>
                </div>
              </div>

              {/* Logo */}
              <div className="card qr-panel">
                <p className="qr-panel-title">Logo</p>

                <input
                  ref={logoInputRef}
                  id="qr-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) loadLogo(f); }}
                  style={{ display: "none" }}
                />

                {!logoSrc ? (
                  <div className="qr-panel-body">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="btn-secondary"
                      style={{ fontSize: 12 }}
                    >
                      Add a logo or icon
                    </button>
                    <p className="qr-hint" style={{ marginTop: 0, alignSelf: "center" }}>
                      PNG, JPG or SVG. Your image stays on your device.
                    </p>
                  </div>
                ) : (
                  <div className="qr-panel-body">
                    <div className="qr-logo-row qr-span-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoSrc} alt="" className="qr-logo-thumb" />
                      <span className="qr-logo-name" title={logoName}>{logoName}</span>
                      <button onClick={removeLogo} className="qr-logo-remove">Remove</button>
                    </div>

                    <div>
                      <label className="qr-label" htmlFor="qr-logo-scale">
                        Logo size - {Math.round(logoScale * 100)}%
                      </label>
                      <input
                        id="qr-logo-scale"
                        type="range"
                        min={10}
                        max={30}
                        value={Math.round(logoScale * 100)}
                        onChange={e => setLogoScale(Number(e.target.value) / 100)}
                        className="qr-range"
                      />
                    </div>

                    <div>
                      <label className="qr-check">
                        <input type="checkbox" checked={logoPlate}
                               onChange={e => setLogoPlate(e.target.checked)} />
                        Clear space behind the logo
                      </label>
                      <label className="qr-check">
                        <input type="checkbox" checked={logoRound} disabled={!logoPlate}
                               onChange={e => setLogoRound(e.target.checked)} />
                        Round that space
                      </label>
                    </div>

                    <p className="qr-hint qr-span-all">
                      Error correction is set to H so the code still scans with the logo on top.
                      Above ~25% it may stop scanning - always test before printing.
                    </p>
                  </div>
                )}
              </div>

              {/* Output */}
              <div className="card qr-panel">
                <p className="qr-panel-title">Output</p>
                <div className="qr-panel-body">
                  <div>
                    <label className="qr-label" htmlFor="qr-size">
                      Size - {actualSize ? `${actualSize}x${actualSize}` : `${size}x${size}`} px
                    </label>
                    <input
                      id="qr-size" type="range" min={128} max={2048} step={64}
                      value={size}
                      onChange={e => setSize(Number(e.target.value))}
                      className="qr-range"
                    />
                    <p className="qr-hint">
                      Snapped to a whole number of pixels per module so the code stays sharp.
                    </p>
                  </div>

                  <div>
                    <label className="qr-label" htmlFor="qr-margin">Quiet zone - {margin} modules</label>
                    <input
                      id="qr-margin" type="range" min={0} max={10}
                      value={margin}
                      onChange={e => setMargin(Number(e.target.value))}
                      className="qr-range"
                    />
                    <p className="qr-hint">The clear border scanners need to find the code.</p>
                  </div>

                  <div>
                    <label className="qr-label" htmlFor="qr-ecc">Error correction</label>
                    <select id="qr-ecc" className="qr-input" value={ecc}
                            onChange={e => setEcc(e.target.value as Ecc)}>
                      {ECC_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    <p className="qr-hint">{ECC_LEVELS.find(l => l.value === ecc)!.hint}</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        <div className="privacy-callout" style={{ marginTop: 28 }}>
          <span>🔒</span>
          <span>
            QR codes are generated entirely in your browser. Nothing you type is uploaded, and because the
            data is baked into the code itself there is no short link to expire, no scan limit and no
            redirect service tracking whoever scans it.
          </span>
        </div>

      </div>
    </main>
  );
}
