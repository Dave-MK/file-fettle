"use client";

export interface DocConvertOptions {
  targetExt:  string;
  targetMime: string;
  compress:   boolean;
  quality:    number;
}

function readAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as string);
    r.onerror = rej;
    r.readAsText(file);
  });
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as ArrayBuffer);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}

// ── PDF helpers ──────────────────────────────────────────────────────────────

async function pdfToText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Use a version-matched worker from unpkg
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const ab    = await readAsArrayBuffer(file);
  const doc   = await pdfjs.getDocument({ data: ab }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page    = await doc.getPage(i);
    const content = await page.getTextContent();
    const line    = content.items.map(it => ("str" in it ? it.str : "")).join(" ");
    parts.push(line);
  }
  return parts.join("\n\n");
}

async function textToPdf(text: string, title = "Converted"): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc    = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const maxW   = doc.internal.pageSize.getWidth() - margin * 2;
  const pageH  = doc.internal.pageSize.getHeight();
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(text, maxW) as string[];
  let y = margin + 16;
  for (const line of lines) {
    if (y > pageH - margin) { doc.addPage(); y = margin + 16; }
    doc.text(line, margin, y);
    y += 15;
  }
  return doc.output("blob");
}

// ── DOCX helpers ─────────────────────────────────────────────────────────────

async function docxToHtml(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const ab      = await readAsArrayBuffer(file);
  const result  = await mammoth.convertToHtml({ arrayBuffer: ab });
  return result.value;
}

async function docxToText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const ab      = await readAsArrayBuffer(file);
  const result  = await mammoth.extractRawText({ arrayBuffer: ab });
  return result.value;
}

// ── Markdown helpers ─────────────────────────────────────────────────────────

function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split("\n");
  let html = "";
  let inCode = false;
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("```")) {
      if (inList) { html += "</ul>"; inList = false; }
      inCode = !inCode;
      html += inCode ? "<pre><code>" : "</code></pre>\n";
      continue;
    }
    if (inCode) { html += esc(line) + "\n"; continue; }

    if (line === "") {
      if (inList) { html += "</ul>\n"; inList = false; }
      html += "<br>\n"; continue;
    }

    const hm = line.match(/^(#{1,6})\s+(.*)/);
    if (hm) {
      if (inList) { html += "</ul>\n"; inList = false; }
      const lvl = hm[1].length;
      html += `<h${lvl}>${inline(esc(hm[2]))}</h${lvl}>\n`;
      continue;
    }

    if (line.match(/^[-*]\s+/)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(esc(line.replace(/^[-*]\s+/, "")))}</li>\n`;
      continue;
    }

    const nm = line.match(/^\d+\.\s+(.*)/);
    if (nm) {
      if (!inList) { html += "<ol>"; inList = true; }
      html += `<li>${inline(esc(nm[1]))}</li>\n`;
      continue;
    }

    if (line.startsWith("> ")) {
      if (inList) { html += "</ul>\n"; inList = false; }
      html += `<blockquote>${inline(esc(line.slice(2)))}</blockquote>\n`;
      continue;
    }

    if (line.match(/^---+$|^\*\*\*+$|^___+$/)) {
      html += "<hr>\n"; continue;
    }

    if (inList) { html += "</ul>\n"; inList = false; }
    html += `<p>${inline(esc(line))}</p>\n`;
  }

  if (inList) html += "</ul>\n";
  if (inCode) html += "</code></pre>\n";
  return html;
}

function inline(s: string): string {
  return s
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,         "<em>$1</em>")
    .replace(/__(.+?)__/g,         "<strong>$1</strong>")
    .replace(/_(.+?)_/g,           "<em>$1</em>")
    .replace(/~~(.+?)~~/g,         "<del>$1</del>")
    .replace(/`([^`]+)`/g,         "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function mdToText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^---+$/gm, "")
    .trim();
}

function wrapHtmlDoc(body: string, title = "Converted"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.6; }
    h1,h2,h3,h4,h5,h6 { margin-top: 1.5em; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #ccc; margin: 0; padding-left: 16px; color: #555; }
    a { color: #0066cc; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

// ── RTF helper ───────────────────────────────────────────────────────────────

function rtfToText(rtf: string): string {
  // Remove RTF header, groups, and control words
  let text = rtf
    .replace(/\{\\[^}]*\}/g, "")          // remove groups like {\colortbl ...}
    .replace(/\\[a-z*]+\-?\d*[ ]?/g, " ") // remove control words like \par \b \f0
    .replace(/[{}\\]/g, "")               // remove remaining braces and backslashes
    .replace(/\\'/g, "")                  // remove hex escapes \'xx
    .replace(/\n\s*\n/g, "\n")            // collapse blank lines
    .trim();

  // Re-insert paragraph breaks where \par was
  return rtf
    .replace(/\\par[\s\r\n]/g, "\n\n")
    .replace(/\\line[\s\r\n]/g, "\n")
    .replace(/\{\\[^}]*\}/g, "")
    .replace(/\\[a-z*]+\-?\d*[ ]?/g, " ")
    .replace(/[{}\\]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/ \n/g, "\n")
    .replace(/\n /g, "\n")
    .trim() || text;
}

// ── Text to DOCX ─────────────────────────────────────────────────────────────

async function textToDocx(text: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const doc = new Document({
    sections: [{
      children: text.split("\n").map(line =>
        new Paragraph({ children: [new TextRun(line)] })
      ),
    }],
  });
  return Packer.toBlob(doc);
}

// ── HTML to Markdown (basic) ─────────────────────────────────────────────────

function htmlToMd(html: string): string {
  const div  = document.createElement("div");
  div.innerHTML = html;

  function nodeToMd(node: Node, depth = 0): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const inner = Array.from(el.childNodes).map(n => nodeToMd(n, depth)).join("");

    switch (tag) {
      case "h1": return `# ${inner}\n\n`;
      case "h2": return `## ${inner}\n\n`;
      case "h3": return `### ${inner}\n\n`;
      case "h4": return `#### ${inner}\n\n`;
      case "h5": return `##### ${inner}\n\n`;
      case "h6": return `###### ${inner}\n\n`;
      case "p":  return `${inner}\n\n`;
      case "br": return "\n";
      case "strong": case "b": return `**${inner}**`;
      case "em": case "i": return `*${inner}*`;
      case "del": case "s": return `~~${inner}~~`;
      case "code": return el.parentElement?.tagName === "PRE" ? inner : `\`${inner}\``;
      case "pre":  return `\`\`\`\n${inner}\n\`\`\`\n\n`;
      case "a": return `[${inner}](${el.getAttribute("href") ?? "#"})`;
      case "li": return `${"  ".repeat(depth)}- ${inner}\n`;
      case "ul": case "ol": return `${inner}\n`;
      case "blockquote": return inner.split("\n").map(l => `> ${l}`).join("\n") + "\n\n";
      case "hr": return `---\n\n`;
      case "img": return `![${el.getAttribute("alt") ?? ""}](${el.getAttribute("src") ?? ""})`;
      case "table": return inner + "\n";
      case "tr": return `| ${inner.trim()} |\n`;
      case "td": case "th": return ` ${inner.trim()} |`;
      default: return inner;
    }
  }

  return Array.from(div.childNodes).map(n => nodeToMd(n)).join("").replace(/\n{3,}/g, "\n\n").trim();
}

// ── Main dispatcher ──────────────────────────────────────────────────────────

export async function convertDocument(file: File, opts: DocConvertOptions): Promise<Blob> {
  const src = file.name.split(".").pop()?.toLowerCase() ?? "";

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (src === "pdf" && opts.targetExt === "pdf") {
    // Compress: re-save with object streams
    const { PDFDocument } = await import("pdf-lib");
    const ab  = await readAsArrayBuffer(file);
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
    const out = await doc.save({ useObjectStreams: true });
    return new Blob([out.buffer.slice(0) as ArrayBuffer], { type: "application/pdf" });
  }
  if (src === "pdf" && opts.targetExt === "txt") {
    return new Blob([await pdfToText(file)], { type: "text/plain" });
  }
  if (src === "pdf" && (opts.targetExt === "html" || opts.targetExt === "htm")) {
    const text = await pdfToText(file);
    return new Blob([wrapHtmlDoc(`<pre style="white-space:pre-wrap">${text}</pre>`)], { type: "text/html" });
  }
  if (src === "pdf" && opts.targetExt === "md") {
    const text = await pdfToText(file);
    return new Blob([text], { type: "text/markdown" });
  }

  // ── DOCX / DOC ───────────────────────────────────────────────────────────
  if ((src === "docx" || src === "doc") && opts.targetExt === "txt") {
    return new Blob([await docxToText(file)], { type: "text/plain" });
  }
  if ((src === "docx" || src === "doc") && (opts.targetExt === "html" || opts.targetExt === "htm")) {
    return new Blob([wrapHtmlDoc(await docxToHtml(file))], { type: "text/html" });
  }
  if ((src === "docx" || src === "doc") && opts.targetExt === "pdf") {
    const text = await docxToText(file);
    return textToPdf(text);
  }
  if ((src === "docx" || src === "doc") && opts.targetExt === "md") {
    const html  = await docxToHtml(file);
    const div   = document.createElement("div");
    div.innerHTML = html;
    return new Blob([htmlToMd(html)], { type: "text/markdown" });
  }

  // ── TXT ──────────────────────────────────────────────────────────────────
  if (src === "txt" && opts.targetExt === "pdf") {
    return textToPdf(await readAsText(file));
  }
  if (src === "txt" && (opts.targetExt === "html" || opts.targetExt === "htm")) {
    const text    = await readAsText(file);
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return new Blob([wrapHtmlDoc(`<pre style="white-space:pre-wrap">${escaped}</pre>`)], { type: "text/html" });
  }
  if (src === "txt" && opts.targetExt === "docx") {
    return textToDocx(await readAsText(file));
  }
  if (src === "txt" && opts.targetExt === "md") {
    // Plain text → trivially valid Markdown
    return new Blob([await readAsText(file)], { type: "text/markdown" });
  }

  // ── HTML / HTM ───────────────────────────────────────────────────────────
  if ((src === "html" || src === "htm") && opts.targetExt === "txt") {
    const html = await readAsText(file);
    const div  = document.createElement("div");
    div.innerHTML = html;
    return new Blob([div.textContent ?? ""], { type: "text/plain" });
  }
  if ((src === "html" || src === "htm") && opts.targetExt === "pdf") {
    const html = await readAsText(file);
    const div  = document.createElement("div");
    div.innerHTML = html;
    return textToPdf(div.textContent ?? "");
  }
  if ((src === "html" || src === "htm") && opts.targetExt === "md") {
    return new Blob([htmlToMd(await readAsText(file))], { type: "text/markdown" });
  }

  // ── Markdown ─────────────────────────────────────────────────────────────
  if ((src === "md" || src === "markdown") && opts.targetExt === "html") {
    return new Blob([wrapHtmlDoc(mdToHtml(await readAsText(file)))], { type: "text/html" });
  }
  if ((src === "md" || src === "markdown") && opts.targetExt === "pdf") {
    const html = mdToHtml(await readAsText(file));
    const div  = document.createElement("div");
    div.innerHTML = html;
    return textToPdf(div.textContent ?? "");
  }
  if ((src === "md" || src === "markdown") && opts.targetExt === "txt") {
    return new Blob([mdToText(await readAsText(file))], { type: "text/plain" });
  }
  if ((src === "md" || src === "markdown") && opts.targetExt === "docx") {
    const text = mdToText(await readAsText(file));
    return textToDocx(text);
  }

  // ── RTF ──────────────────────────────────────────────────────────────────
  if (src === "rtf") {
    const raw  = await readAsText(file);
    const text = rtfToText(raw);
    if (opts.targetExt === "txt")               return new Blob([text], { type: "text/plain" });
    if (opts.targetExt === "pdf")               return textToPdf(text);
    if (opts.targetExt === "html" || opts.targetExt === "htm") {
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return new Blob([wrapHtmlDoc(`<pre style="white-space:pre-wrap">${escaped}</pre>`)], { type: "text/html" });
    }
  }

  throw new Error(`Unsupported document conversion: ${src} → ${opts.targetExt}`);
}
