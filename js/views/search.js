import { bibleBooks } from "../data/bible-books.js";
import { escapeHtml } from "../dom.js";
import { loadApologeticsNotes, loadScriptureNotes } from "../notes-store.js";

const TYPE_LABELS = {
  book: "Livro",
  study: "Estudo bíblico",
  note: "Nota de Apologética",
};

function normalize(value) {
  return String(value).toLocaleLowerCase();
}

// Direct scan over the local data; indexing is unnecessary at this scale.
function collectResults(query) {
  const q = normalize(query.trim());
  if (!q) return [];
  const results = [];

  for (const book of bibleBooks) {
    if (normalize(book.displayName).includes(q) || normalize(book.name).includes(q)) {
      results.push({
        type: "book",
        label: book.displayName,
        detail: `${book.chapters} capítulos`,
        href: "#scriptures",
      });
    }
  }

  for (const note of loadScriptureNotes()) {
    if (!String(note.content ?? "").trim()) continue;
    const book = bibleBooks.find((b) => b.id === note.bookId);
    if (!book) continue;
    const label = `${book.displayName} ${note.chapter}`;
    if (normalize(label).includes(q) || normalize(note.content).includes(q)) {
      results.push({
        type: "study",
        label,
        detail: snippet(note.content, q),
        href: `#scriptures/${note.bookId}/${note.chapter}`,
      });
    }
  }

  for (const note of loadApologeticsNotes()) {
    if (!normalize(note.title).includes(q) && !normalize(note.content ?? "").includes(q)) continue;
    results.push({
      type: "note",
      label: note.title || "Sem título",
      detail: snippet(note.content, q),
      href: `#apologetics/${encodeURIComponent(note.id)}`,
    });
  }

  return results;
}

function snippet(content, q) {
  const text = String(content ?? "").replace(/\s+/g, " ").trim();
  const index = normalize(text).indexOf(q);
  if (index === -1) return "";
  const start = Math.max(0, index - 20);
  const end = start + 80;
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

function renderResults(results) {
  if (!results.length) return `<p class="metadata">Nenhum resultado.</p>`;
  return `
    <ul class="item-list">
      ${results
        .map(
          (result) => `
        <li>
          <a class="list-link" href="${result.href}">
            <span>${escapeHtml(result.label)}</span>
            <span class="metadata">${TYPE_LABELS[result.type]}${
              result.detail ? ` · ${escapeHtml(result.detail)}` : ""
            }</span>
          </a>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

export function mount(container) {
  container.innerHTML = `
    <div class="section-header">
      <h1>Busca</h1>
      <p class="metadata">Procure livros, estudos bíblicos e notas.</p>
    </div>
    <input id="search-input" class="input" type="search" placeholder="Buscar..." aria-label="Busca">
    <div id="search-results"></div>
  `;

  const input = container.querySelector("#search-input");
  const resultsContainer = container.querySelector("#search-results");

  function run() {
    const query = input.value.trim();
    if (!query) {
      resultsContainer.innerHTML = "";
      return;
    }
    resultsContainer.innerHTML = renderResults(collectResults(query));
  }

  input.addEventListener("input", run);
  input.focus();
}
