import { bibleBooks } from "./data/bible-books.js";
import { escapeHtml } from "./dom.js";
import { loadApologeticsNotes, loadScriptureNotes } from "./notes-store.js";

const WIKI_LINK_PATTERN = /\[\[([^\][]+)\]\]/g;

function normalize(value) {
  return String(value).trim().toLocaleLowerCase();
}

// A scripture reference looks like "Romanos 3" (displayName + chapter).
function findScriptureTarget(name) {
  const match = name.match(/^(.+)\s+(\d+)$/);
  if (!match) return null;
  const key = normalize(match[1]);
  const chapter = Number(match[2]);
  const book = bibleBooks.find((book) => normalize(book.displayName) === key);
  if (!book || chapter < 1 || chapter > book.chapters) return null;
  return { href: `#scriptures/${book.id}/${chapter}` };
}

export function resolveWikiLink(name) {
  const key = normalize(name);
  const note = loadApologeticsNotes().find((note) => normalize(note.title) === key);
  if (note) return { href: `#apologetics/${encodeURIComponent(note.id)}` };
  const study = loadScriptureNotes().find(
    (note) => note.title && normalize(note.title) === key
  );
  if (study) return { href: `#scriptures/${study.bookId}/${study.chapter}` };
  return findScriptureTarget(name);
}

function extractWikiNames(content) {
  return [...String(content ?? "").matchAll(WIKI_LINK_PATTERN)].map((match) => normalize(match[1]));
}

// Backlinks are always derived from existing notes, never stored.
export function getBacklinks(targetNames, selfHref) {
  const keys = targetNames.map(normalize);
  const backlinks = [];

  for (const note of loadApologeticsNotes()) {
    const href = `#apologetics/${encodeURIComponent(note.id)}`;
    if (href === selfHref) continue;
    if (extractWikiNames(note.content).some((key) => keys.includes(key))) {
      backlinks.push({ label: note.title || "Sem título", href });
    }
  }

  for (const note of loadScriptureNotes()) {
    const href = `#scriptures/${note.bookId}/${note.chapter}`;
    if (href === selfHref) continue;
    if (extractWikiNames(note.content).some((key) => keys.includes(key))) {
      const book = bibleBooks.find((book) => book.id === note.bookId);
      backlinks.push({
        label: `${book?.displayName ?? note.bookId} ${note.chapter}`,
        href,
      });
    }
  }

  return backlinks;
}

export function renderBacklinks(backlinks) {
  if (!backlinks.length) return "";
  return `
    <section class="backlinks">
      <h2 class="category-title">Referenciada por</h2>
      <ul class="item-list">
        ${backlinks
          .map(
            (link) => `
          <li>
            <a class="list-link" href="${link.href}">
              <span>${escapeHtml(link.label)}</span>
            </a>
          </li>
        `
          )
          .join("")}
      </ul>
    </section>
  `;
}
