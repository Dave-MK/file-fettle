"use client";

export interface DataConvertOptions {
  targetExt:  string;
  targetMime: string;
}

type Row = Record<string, unknown>;

import { readAsText, readAsArrayBuffer } from "@/lib/file-utils";

function rowsToCsv(rows: Row[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const quote = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n"))
    ? `"${v.replace(/"/g, '""')}"` : v;
  const body = rows.map(row => keys.map(k => quote(String(row[k] ?? ""))).join(","));
  return [keys.join(","), ...body].join("\n");
}

function rowsToTsv(rows: Row[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const quote = (v: string) => v.replace(/\t/g, " "); // tabs in values → spaces
  const body  = rows.map(row => keys.map(k => quote(String(row[k] ?? ""))).join("\t"));
  return [keys.join("\t"), ...body].join("\n");
}

function rowsToXml(rows: Row[], rootTag = "root", itemTag = "item"): string {
  const esc   = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const items = rows.map(row => {
    const fields = Object.entries(row)
      .map(([k, v]) => `  <${k}>${esc(String(v ?? ""))}</${k}>`)
      .join("\n");
    return `<${itemTag}>\n${fields}\n</${itemTag}>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${items}\n</${rootTag}>`;
}

function jsonToYaml(obj: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "boolean" || typeof obj === "number") return String(obj);
  if (typeof obj === "string") {
    const needsQuote = /[:#\[\]{},|>&*!'"@`]/.test(obj) || obj.startsWith(" ") || obj.trim() !== obj;
    return needsQuote ? `"${obj.replace(/"/g, '\\"')}"` : obj;
  }
  if (Array.isArray(obj)) {
    if (!obj.length) return "[]";
    return obj.map(item => {
      if (typeof item === "object" && item !== null) return `${pad}-\n${jsonToYaml(item, indent + 1)}`;
      return `${pad}- ${jsonToYaml(item, indent)}`;
    }).join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (!entries.length) return "{}";
    return entries.map(([k, v]) => {
      if (typeof v === "object" && v !== null && !Array.isArray(v))
        return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      if (Array.isArray(v))
        return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      return `${pad}${k}: ${jsonToYaml(v, indent)}`;
    }).join("\n");
  }
  return String(obj);
}

function yamlToJson(yaml: string): unknown {
  // Simple flat YAML parser — handles key: value and basic lists
  const lines  = yaml.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
  const result: Record<string, unknown> = {};
  let currentKey: string | null = null;
  const listItems: string[] = [];

  for (const line of lines) {
    const listMatch = line.match(/^[ \t]*-\s+(.*)/);
    if (listMatch && currentKey) {
      listItems.push(listMatch[1].trim().replace(/^["']|["']$/g, ""));
      result[currentKey] = [...listItems];
      continue;
    }
    const m = line.match(/^([^:]+)\s*:\s*(.*)/);
    if (m) {
      currentKey = m[1].trim();
      listItems.length = 0;
      const val = m[2].trim().replace(/^["']|["']$/g, "");
      if (val === "true")  { result[currentKey] = true;  continue; }
      if (val === "false") { result[currentKey] = false; continue; }
      if (val === "null" || val === "~") { result[currentKey] = null; continue; }
      const num = Number(val);
      if (val !== "" && !isNaN(num)) { result[currentKey] = num; continue; }
      if (val) result[currentKey] = val;
    }
  }
  return result;
}

function parseToml(text: string): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  let current = root;
  function coerce(s: string): unknown {
    if ((s[0] === '"' || s[0] === "'") && s[s.length - 1] === s[0]) return s.slice(1, -1);
    if (s === "true")  return true;
    if (s === "false") return false;
    if (s.startsWith("[")) {
      const inner = s.slice(1, s.lastIndexOf("]")).trim();
      return inner ? inner.split(",").map(p => coerce(p.trim())) : [];
    }
    const n = Number(s);
    return Number.isNaN(n) ? s : n;
  }
  for (const raw of text.split("\n")) {
    const line = raw.replace(/#[^"]*$/, "").trim();
    if (!line) continue;
    const sec = line.match(/^\[([^\[\]]+)\]$/);
    if (sec) {
      current = root;
      for (const k of sec[1].trim().split(".")) {
        if (!(k in current)) current[k] = {};
        current = current[k] as Record<string, unknown>;
      }
      continue;
    }
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    current[line.slice(0, eq).trim()] = coerce(line.slice(eq + 1).trim());
  }
  return root;
}

function parseIni(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let section = "";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line[0] === "#" || line[0] === ";") continue;
    const sm = line.match(/^\[([^\]]+)\]/);
    if (sm) { section = sm[1].trim(); result[section] ??= {}; continue; }
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const raw2 = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    const coerced: unknown = raw2 === "true" ? true : raw2 === "false" ? false : (raw2 !== "" && !isNaN(Number(raw2))) ? Number(raw2) : raw2;
    if (section) (result[section] as Record<string, unknown>)[key] = coerced;
    else result[key] = coerced;
  }
  return result;
}

async function xlsxToRows(file: File): Promise<Row[]> {
  const XLSX = await import("xlsx");
  const ab   = await readAsArrayBuffer(file);
  const wb   = XLSX.read(ab, { type: "array" });
  return XLSX.utils.sheet_to_json<Row>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
}

async function rowsToXlsx(rows: Row[]): Promise<Blob> {
  const XLSX = await import("xlsx");
  const ws   = XLSX.utils.json_to_sheet(rows);
  const wb   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf  = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

async function parseCsv(file: File, delimiter = ","): Promise<Row[]> {
  const { default: Papa } = await import("papaparse");
  const result = Papa.parse<Row>(await readAsText(file), { header: true, skipEmptyLines: true, delimiter });
  return result.data;
}

function jsonToRows(data: unknown): Row[] {
  if (Array.isArray(data)) return data as Row[];
  if (typeof data === "object" && data !== null) return [data as Row];
  return [{ value: String(data) }];
}

export async function convertData(file: File, opts: DataConvertOptions): Promise<Blob> {
  const src = file.name.split(".").pop()?.toLowerCase() ?? "";
  const to  = opts.targetExt.toLowerCase();

  // ── CSV / TSV ─────────────────────────────────────────────────────────────
  if (src === "csv" && to === "json") {
    return new Blob([JSON.stringify(await parseCsv(file), null, 2)], { type: "application/json" });
  }
  if (src === "csv" && to === "xml") {
    return new Blob([rowsToXml(await parseCsv(file))], { type: "application/xml" });
  }
  if (src === "csv" && to === "xlsx") {
    return rowsToXlsx(await parseCsv(file));
  }
  if (src === "csv" && to === "tsv") {
    return new Blob([rowsToTsv(await parseCsv(file))], { type: "text/tab-separated-values" });
  }
  if (src === "csv" && to === "yaml") {
    return new Blob([jsonToYaml(await parseCsv(file))], { type: "text/yaml" });
  }

  // ── TSV ───────────────────────────────────────────────────────────────────
  if (src === "tsv" && to === "csv") {
    return new Blob([rowsToCsv(await parseCsv(file, "\t"))], { type: "text/csv" });
  }
  if (src === "tsv" && to === "json") {
    return new Blob([JSON.stringify(await parseCsv(file, "\t"), null, 2)], { type: "application/json" });
  }
  if (src === "tsv" && to === "xlsx") {
    return rowsToXlsx(await parseCsv(file, "\t"));
  }
  if (src === "tsv" && to === "xml") {
    return new Blob([rowsToXml(await parseCsv(file, "\t"))], { type: "application/xml" });
  }

  // ── JSON ──────────────────────────────────────────────────────────────────
  if (src === "json" && to === "csv") {
    const data = JSON.parse(await readAsText(file)) as unknown;
    return new Blob([rowsToCsv(jsonToRows(data))], { type: "text/csv" });
  }
  if (src === "json" && to === "tsv") {
    const data = JSON.parse(await readAsText(file)) as unknown;
    return new Blob([rowsToTsv(jsonToRows(data))], { type: "text/tab-separated-values" });
  }
  if (src === "json" && to === "xml") {
    const data = JSON.parse(await readAsText(file)) as unknown;
    return new Blob([rowsToXml(jsonToRows(data))], { type: "application/xml" });
  }
  if (src === "json" && to === "yaml") {
    return new Blob([jsonToYaml(JSON.parse(await readAsText(file)))], { type: "text/yaml" });
  }
  if (src === "json" && to === "xlsx") {
    const data = JSON.parse(await readAsText(file)) as unknown;
    return rowsToXlsx(jsonToRows(data));
  }

  // ── XML ───────────────────────────────────────────────────────────────────
  if (src === "xml") {
    const { XMLParser } = await import("fast-xml-parser");
    const obj   = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" }).parse(await readAsText(file)) as Record<string, unknown>;
    // Extract the first array of items (or wrap the root)
    const values = Object.values(obj).find(v => Array.isArray(v)) ?? Object.values(obj)[0];
    const rows   = Array.isArray(values) ? values as Row[] : [values as Row];

    if (to === "json")  return new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    if (to === "csv")   return new Blob([rowsToCsv(rows)],  { type: "text/csv" });
    if (to === "tsv")   return new Blob([rowsToTsv(rows)],  { type: "text/tab-separated-values" });
    if (to === "yaml")  return new Blob([jsonToYaml(obj)],  { type: "text/yaml" });
    if (to === "xlsx")  return rowsToXlsx(rows);
  }

  // ── YAML / YML ────────────────────────────────────────────────────────────
  if (src === "yaml" || src === "yml") {
    const parsed = yamlToJson(await readAsText(file));
    const rows   = jsonToRows(parsed);

    if (to === "json")  return new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
    if (to === "csv")   return new Blob([rowsToCsv(rows)],               { type: "text/csv" });
    if (to === "tsv")   return new Blob([rowsToTsv(rows)],               { type: "text/tab-separated-values" });
    if (to === "xml")   return new Blob([rowsToXml(rows)],               { type: "application/xml" });
    if (to === "xlsx")  return rowsToXlsx(rows);
  }

  // ── XLSX / XLS / ODS / XLSB / XLSM / DBF / DIF (all handled by SheetJS) ──
  if (src === "xlsx" || src === "xls" || src === "ods" || src === "xlsb" || src === "xlsm" || src === "dbf" || src === "dif") {
    const rows = await xlsxToRows(file);
    if (to === "csv")   return new Blob([rowsToCsv(rows)],               { type: "text/csv" });
    if (to === "tsv")   return new Blob([rowsToTsv(rows)],               { type: "text/tab-separated-values" });
    if (to === "json")  return new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    if (to === "xml")   return new Blob([rowsToXml(rows)],               { type: "application/xml" });
    if (to === "yaml")  return new Blob([jsonToYaml(rows)],              { type: "text/yaml" });
    if (to === "xlsx")  return rowsToXlsx(rows);
  }

  // ── TOML ─────────────────────────────────────────────────────────────────
  if (src === "toml") {
    const parsed = parseToml(await readAsText(file));
    const rows   = jsonToRows(parsed);
    if (to === "json")  return new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
    if (to === "yaml")  return new Blob([jsonToYaml(parsed)],              { type: "text/yaml" });
    if (to === "csv")   return new Blob([rowsToCsv(rows)],                 { type: "text/csv" });
    if (to === "xml")   return new Blob([rowsToXml(rows)],                 { type: "application/xml" });
  }

  // ── INI ───────────────────────────────────────────────────────────────────
  if (src === "ini") {
    const parsed = parseIni(await readAsText(file));
    const rows   = jsonToRows(parsed);
    if (to === "json")  return new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
    if (to === "yaml")  return new Blob([jsonToYaml(parsed)],              { type: "text/yaml" });
    if (to === "csv")   return new Blob([rowsToCsv(rows)],                 { type: "text/csv" });
    if (to === "toml") {
      // Serialise back to TOML (flat sections only)
      const lines: string[] = [];
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "object" && v !== null && !Array.isArray(v)) {
          lines.push(`[${k}]`);
          for (const [sk, sv] of Object.entries(v as Record<string, unknown>))
            lines.push(`${sk} = ${typeof sv === "string" ? `"${sv}"` : String(sv)}`);
          lines.push("");
        } else {
          lines.push(`${k} = ${typeof v === "string" ? `"${v}"` : String(v)}`);
        }
      }
      return new Blob([lines.join("\n")], { type: "application/toml" });
    }
  }

  // ── JSONL / NDJSON (newline-delimited JSON) ───────────────────────────────
  if (src === "jsonl" || src === "ndjson") {
    const text = await readAsText(file);
    const rows = text.split("\n").filter(l => l.trim()).map(l => JSON.parse(l) as Row);
    if (to === "json")  return new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    if (to === "csv")   return new Blob([rowsToCsv(rows)],               { type: "text/csv" });
    if (to === "tsv")   return new Blob([rowsToTsv(rows)],               { type: "text/tab-separated-values" });
    if (to === "xml")   return new Blob([rowsToXml(rows)],               { type: "application/xml" });
    if (to === "yaml")  return new Blob([jsonToYaml(rows)],              { type: "text/yaml" });
    if (to === "xlsx")  return rowsToXlsx(rows);
  }

  throw new Error(`Unsupported data conversion: ${src} → ${to}`);
}
