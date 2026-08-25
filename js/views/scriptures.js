import { bibleBooks } from "../data/bible-books.js";
import { escapeHtml } from "../dom.js";
import { favoriteButtonHtml, removeFavorite, wireFavoriteButtons } from "../favorites.js";
import { downloadMarkdown, printNote } from "../note-export.js";
import { getBacklinks, renderBacklinks, resolveWikiLink } from "../links.js";
import {
  deleteScriptureNote,
  getScriptureNote,
  loadScriptureNotes,
  upsertScriptureNote,
} from "../notes-store.js";
import * as noteEditor from "./note-editor.js";

// User-facing labels in Portuguese; keys are internal English identifiers.
const categoryLabels = {
  pentateuch: "Pentateuco",
  historical: "Livros Históricos",
  wisdom: "Sapienciais",
  poetry: "Poéticos",
  prophetic: "Profetas",
  gospel: "Evangelhos",
  acts: "Atos dos Apóstolos",
  pauline: "Cartas Paulinas",
  catholic_epistle: "Cartas Católicas",
  apocalyptic: "Apocalíptico",
  deuterocanonical: "Deuterocanônico",
};

function renderChapterGrid(book, notedChapters) {
  const chapters = Array.from({ length: book.chapters }, (_, index) => index + 1)
    .map(
      (chapter) => `
      <a
        class="chapter${notedChapters.has(chapter) ? " has-note" : ""}"
        href="#scriptures/${book.id}/${chapter}"
        aria-label="Nota de ${book.displayName} ${chapter}"
      >${chapter}</a>`
    )
    .join("");
  return `<div class="chapter-grid" aria-label="Capítulos de ${escapeHtml(book.displayName)}">${chapters}</div>`;
}

function renderBook(book, notedByBook) {
  const categories = book.categories.map((c) => categoryLabels[c]).join(", ");
  const notedChapters = notedByBook.get(book.id) ?? new Set();
  return `
    <li>
      <details class="list-item">
        <summary>
          <span>${book.displayName}</span>
          <span class="metadata">${book.abbreviation} · ${book.chapters} capítulos</span>
        </summary>
        ${favoriteButtonHtml(`book:${book.id}`)}
        <dl class="book-details">
          <dt>Categorias</dt><dd>${categories}</dd>
          <dt>Autor</dt><dd>${book.author}</dd>
          <dt>Data</dt><dd>${book.date}</dd>
        </dl>
        ${book.deuterocanonical ? '<span class="tag">Deuterocanônico</span>' : ""}
        ${book.deuterocanonicalSections ? `<p class="metadata">${book.deuterocanonicalSections}</p>` : ""}
        ${renderChapterGrid(book, notedChapters)}
      </details>
    </li>
  `;
}

// Group books by consecutive runs of their primary category,
// which follows the canonical ordering.
function groupBooks(books) {
  const groups = [];
  for (const book of books) {
    const label = categoryLabels[book.categories[0]];
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.books.push(book);
    } else {
      groups.push({ label, books: [book] });
    }
  }
  return groups;
}

function renderGroups(books, notedByBook) {
  return groupBooks(books)
    .map(
      (group) => `
      <h3 class="category-title">${group.label}</h3>
      <ul class="item-list">
        ${group.books.map((book) => renderBook(book, notedByBook)).join("")}
      </ul>
    `
    )
    .join("");
}

export function mount(container) {
  // Map of bookId -> Set of chapters that already have notes.
  const notedByBook = new Map();
  for (const note of loadScriptureNotes()) {
    if (!notedByBook.has(note.bookId)) notedByBook.set(note.bookId, new Set());
    notedByBook.get(note.bookId).add(note.chapter);
  }

  const oldTestament = bibleBooks.filter((b) => b.testament === "old");
  const newTestament = bibleBooks.filter((b) => b.testament === "new");
  container.innerHTML = `
    <div class="section-header">
      <h1>Escrituras</h1>
      <p class="metadata">${bibleBooks.length} livros da Bíblia Católica. Abra um livro e escolha um capítulo para ler ou criar um estudo.</p>
    </div>
    <section aria-labelledby="ot-heading">
      <h2 id="ot-heading">Antigo Testamento</h2>
      ${renderGroups(oldTestament, notedByBook)}
    </section>
    <section aria-labelledby="nt-heading">
      <h2 id="nt-heading">Novo Testamento</h2>
      ${renderGroups(newTestament, notedByBook)}
    </section>
  `;
  wireFavoriteButtons(container);
}

// Starter structure shown for chapters that have no note yet.
// Not persisted until the user actually writes something;
// the suggested relation points to the nearest chapter.
function buildStudyTemplate(book, chapter) {
  const lines = ["# Ensino geral", "", "Paulo demonstra...", "", "## Relações", ""];
  if (chapter < book.chapters) {
    lines.push(`Este capítulo se relaciona com [[${book.displayName} ${chapter + 1}]].`, "");
  } else if (chapter > 1) {
    lines.push(`Este capítulo se relaciona com [[${book.displayName} ${chapter - 1}]].`, "");
  }
  lines.push("## Extras", "");
  return lines.join("\n");
}

export function mountChapterNote(container, bookId, chapter) {
  const backHtml = `<a class="back-link metadata" href="#scriptures">&larr; Escrituras</a>`;
  const book = bibleBooks.find((b) => b.id === bookId);

  if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
    container.innerHTML = `
      ${backHtml}
      <section class="empty-state">
        <p>Esta nota não existe.</p>
      </section>
    `;
    return;
  }

  const label = `${book.displayName} ${chapter}`;
  const getNote = () => getScriptureNote(bookId, chapter);

  noteEditor.mount(container, {
    backHtml,
    heading: label,
    getTitle: () => getNote()?.title ?? "",
    onTitleChange: (value) => upsertScriptureNote(bookId, chapter, { title: value }),
    titlePlaceholder: "Título do estudo (opcional)",
    placeholder: `Escreva seu estudo sobre ${label} em Markdown`,
    getContent: () => getNote()?.content ?? buildStudyTemplate(book, chapter),
    onContentChange: (value) => upsertScriptureNote(bookId, chapter, { content: value }),
    resolveWiki: resolveWikiLink,
    footerHtml: `
      <div class="editor-buttons">
        ${favoriteButtonHtml(`scripture:${bookId}/${chapter}`)}
        <button id="export-md" class="text-button" type="button">Exportar .md</button>
        <button id="export-pdf" class="text-button" type="button">Exportar PDF</button>
        <button id="delete-note" class="button secondary" type="button">Excluir nota</button>
      </div>
    `,
    belowHtml: renderBacklinks(
      getBacklinks([label, getScriptureNote(bookId, chapter)?.title], `#scriptures/${bookId}/${chapter}`)
    ),
    onMount: (element) => {
      wireFavoriteButtons(element);
      element.querySelector("#export-md")?.addEventListener("click", () => {
        const note = getNote();
        const header = `# ${label}\n\n`;
        downloadMarkdown(`${label}.md`, `${header}${note?.content ?? ""}`);
      });
      element.querySelector("#export-pdf")?.addEventListener("click", () => {
        printNote(label, getNote()?.title || "", getNote()?.content ?? "");
      });
      element.querySelector("#delete-note")?.addEventListener("click", () => {
        if (!confirm(`Excluir a nota de "${label}"? Esta ação não pode ser desfeita.`)) return;
        deleteScriptureNote(bookId, chapter);
        removeFavorite(`scripture:${bookId}/${chapter}`);
        location.hash = "#scriptures";
      });
    },
  });
}
