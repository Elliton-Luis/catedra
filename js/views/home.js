import { bibleBooks } from "../data/bible-books.js";
import { escapeHtml } from "../dom.js";
import { loadApologeticsNotes, loadScriptureNotes } from "../notes-store.js";

// How many items each recent section shows at most.
const RECENT_LIMIT = 5;

function scriptureLabel(note) {
  const book = bibleBooks.find((b) => b.id === note.bookId);
  const name = book ? book.displayName : note.bookId;
  return `${name} ${note.chapter}`;
}

// Most recently modified first; notes without updatedAt (created before
// the field existed) sort last.
function recentNotes(notes) {
  return [...notes]
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .slice(0, RECENT_LIMIT);
}

function renderSection(title, items) {
  return `
    <section>
      <h2 class="category-title">${title}</h2>
      <ul class="item-list">${items.join("")}</ul>
    </section>
  `;
}

export function mount(container) {
  const scriptureItems = recentNotes(loadScriptureNotes()).map((note) => {
    const label = escapeHtml(scriptureLabel(note));
    const href = `#scriptures/${encodeURIComponent(note.bookId)}/${note.chapter}`;
    return `
      <li>
        <a class="list-link" href="${href}">
          <span>${label}</span>
          ${note.title ? `<span class="metadata">${escapeHtml(note.title)}</span>` : ""}
        </a>
      </li>
    `;
  });

  const apologeticsItems = recentNotes(loadApologeticsNotes()).map((note) => {
    const href = `#apologetics/${encodeURIComponent(note.id)}`;
    return `
      <li>
        <a class="list-link" href="${href}">
          <span>${escapeHtml(note.title) || "Sem título"}</span>
        </a>
      </li>
    `;
  });

  if (!scriptureItems.length && !apologeticsItems.length) {
    container.innerHTML = `
      <div class="section-header">
        <h1>Cátedra</h1>
        <p class="metadata">Um lugar tranquilo para o estudo da Escritura e da apologética.</p>
      </div>
      <section class="empty-state">
        <p>Seus estudos aparecerão aqui.</p>
        <p class="metadata">Comece por onde quiser:</p>
        <p><a class="button" href="#scriptures">Escrituras</a> <a class="button secondary" href="#apologetics">Apologética</a></p>
      </section>
    `;
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <h1>Cátedra</h1>
      <p class="metadata">Seus estudos mais recentes.</p>
    </div>
    ${scriptureItems.length ? renderSection("Estudos bíblicos recentes", scriptureItems) : ""}
    ${apologeticsItems.length ? renderSection("Apologética recente", apologeticsItems) : ""}
  `;
}
