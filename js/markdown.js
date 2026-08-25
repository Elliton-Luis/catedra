import { escapeHtml } from "./dom.js";

// Minimal, safe Markdown renderer.
// Supports only what a study note needs: headings, bold, italic,
// lists, blockquotes, links, code and paragraphs.
// All input is HTML-escaped first, so user content can never inject markup.

function safeUrl(url) {
  const trimmed = url.trim();
  return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : null;
}

const INLINE_CODE_PLACEHOLDER = "\x00";

function renderInline(rawText, resolveWiki) {
  // Escape first so user content can never produce markup.
  const text = escapeHtml(rawText);

  const codeSpans = [];
  let result = text.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(`<code>${code}</code>`);
    return `${INLINE_CODE_PLACEHOLDER}${codeSpans.length - 1}${INLINE_CODE_PLACEHOLDER}`;
  });

  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Wiki links must be handled before regular links.
  result = result.replace(/\[\[([^\][]+)\]\]/g, (_, name) => {
    const target = resolveWiki ? resolveWiki(name) : null;
    const label = name.trim();
    return target
      ? `<a class="wiki-link" href="${target.href}">${label}</a>`
      : `<span class="wiki-link unresolved">${label}</span>`;
  });

  result = result.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const safe = safeUrl(url);
    return safe
      ? `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`
      : label;
  });

  return result.replaceAll(
    new RegExp(`${INLINE_CODE_PLACEHOLDER}(\\d+)${INLINE_CODE_PLACEHOLDER}`, "g"),
    (_, index) => codeSpans[index]
  );
}

const BLOCK_START = /^(#{1,6}\s|>|```|\s*[-*]\s|\s*\d+\.\s)/;

function renderBlocks(source, resolveWiki) {
  const lines = source.split("\n");
  const html = [];
  let i = 0;

  while (i < lines.length) {
    if (lines[i].startsWith("```")) {
      const buffer = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buffer.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      html.push(`<pre><code>${escapeHtml(buffer.join("\n"))}</code></pre>`);
      continue;
    }

    if (!lines[i].trim()) {
      i++;
      continue;
    }

    const heading = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2], resolveWiki)}</h${level}>`);
      i++;
      continue;
    }

    if (/^>\s?/.test(lines[i])) {
      const buffer = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buffer.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      html.push(`<blockquote>${renderBlocks(buffer.join("\n"), resolveWiki)}</blockquote>`);
      continue;
    }

    const unordered = /^\s*[-*]\s+/;
    if (unordered.test(lines[i])) {
      const items = [];
      while (i < lines.length && unordered.test(lines[i])) {
        items.push(lines[i].replace(unordered, ""));
        i++;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item, resolveWiki)}</li>`).join("")}</ul>`);
      continue;
    }

    const ordered = /^\s*\d+\.\s+/;
    if (ordered.test(lines[i])) {
      const items = [];
      while (i < lines.length && ordered.test(lines[i])) {
        items.push(lines[i].replace(ordered, ""));
        i++;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInline(item, resolveWiki)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraphLines = [];
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) {
      paragraphLines.push(lines[i]);
      i++;
    }
    html.push(`<p>${renderInline(paragraphLines.join(" "), resolveWiki)}</p>`);
  }

  return html.join("\n");
}

export function renderMarkdown(source, resolveWiki) {
  return renderBlocks(String(source ?? ""), resolveWiki);
}
