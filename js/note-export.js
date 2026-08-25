import { escapeHtml } from "./dom.js";
import { renderMarkdown } from "./markdown.js";

// Per-note export: raw Markdown download and print-to-PDF rendering.
// The stored Markdown is never modified; exports are derived views.

function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function sanitizeFilename(name) {
  return String(name ?? "")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim();
}

export function downloadMarkdown(filename, content) {
  triggerDownload(
    filename,
    new Blob([String(content ?? "")], { type: "text/markdown;charset=utf-8" })
  );
}

const PRINT_STYLES = `
  @page { margin: 2cm; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 12pt;
    line-height: 1.65;
    color: #1f1d19;
  }
  .note-heading { font-size: 20pt; line-height: 1.25; margin: 0 0 0.25rem; }
  .note-subtitle { font-style: italic; color: #555; margin: 0; }
  .note-rule { border: none; border-top: 1px solid #999; margin: 1rem 0 1.5rem; }
  h1, h2, h3, h4, h5, h6 { line-height: 1.25; break-after: avoid; page-break-after: avoid; }
  h1 { font-size: 16pt; } h2 { font-size: 14pt; } h3 { font-size: 12.5pt; }
  p { margin: 0 0 0.8rem; orphans: 2; widows: 2; }
  ul, ol { margin: 0 0 0.8rem 1.4rem; }
  blockquote { margin: 0 0 1rem; padding: 0.4rem 1rem; border-left: 3px solid #999; color: #444; }
  code { font-family: "Courier New", monospace; background: #f0ede6; padding: 0 3px; }
  pre { background: #f0ede6; padding: 0.8rem; overflow-x: auto; break-inside: avoid; page-break-inside: avoid; }
  pre code { background: none; padding: 0; }
  a { color: inherit; }
  .wiki-link.unresolved { border-bottom: 1px dashed #999; text-decoration: none; }
`;

// Opens the browser print dialog with a reading-friendly version of the note,
// which allows saving as PDF. Uses a hidden iframe so popups are never blocked.
export function printNote(heading, subtitle, markdown) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${escapeHtml(heading)}</title>
<style>${PRINT_STYLES}</style>
</head>
<body>
<h1 class="note-heading">${escapeHtml(heading)}</h1>
${subtitle ? `<p class="note-subtitle">${escapeHtml(subtitle)}</p>` : ""}
<hr class="note-rule">
${renderMarkdown(markdown)}
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("hidden", "");
  iframe.onload = () => {
    iframe.contentWindow.addEventListener("afterprint", () => iframe.remove());
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 60000);
  };
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
}
