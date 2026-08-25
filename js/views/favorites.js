import { bibleBooks } from "../data/bible-books.js";
import { escapeHtml } from "../dom.js";
import { loadFavorites, removeFavorite } from "../favorites.js";
import { loadApologeticsNotes, getScriptureNote } from "../notes-store.js";

// Resolve each stored favorite reference to a displayable entry.
// Stale references (deleted notes, invalid chapters) are pruned.
export function collectFavorites() {
  const books = [];
  const studies = [];
  const notes = [];

  for (const ref of loadFavorites()) {
    if (ref.startsWith("book:")) {
      const book = bibleBooks.find((b) => b.id === ref.slice("book:".length));
      if (book) {
        books.push({ label: book.displayName, href: "#scriptures" });
      } else {
        removeFavorite(ref);
      }
      continue;
    }

    if (ref.startsWith("scripture:")) {
      const [bookId, chapter] = ref.slice("scripture:".length).split("/");
      const chapterNumber = Number(chapter);
      const book = bibleBooks.find((b) => b.id === bookId);
      const valid =
        book &&
        Number.isInteger(chapterNumber) &&
        chapterNumber >= 1 &&
        chapterNumber <= book.chapters &&
        getScriptureNote(bookId, chapterNumber);
      if (valid) {
        studies.push({
          label: `${book.displayName} ${chapterNumber}`,
          href: `#scriptures/${bookId}/${chapterNumber}`,
        });
      } else {
        removeFavorite(ref);
      }
      continue;
    }

    if (ref.startsWith("apologetics:")) {
      const note = loadApologeticsNotes().find((n) => n.id === ref.slice("apologetics:".length));
      if (note) {
        notes.push({
          label: note.title || "Sem título",
          href: `#apologetics/${encodeURIComponent(note.id)}`,
        });
      } else {
        removeFavorite(ref);
      }
      continue;
    }

    removeFavorite(ref);
  }

  return { books, studies, notes };
}

function renderGroup(title, entries) {
  if (!entries.length) return "";
  return `
    <section>
      <h2 class="category-title">${title}</h2>
      <ul class="item-list">
        ${entries
          .map(
            (entry) => `
          <li>
            <a class="list-link" href="${entry.href}">
              <span>${escapeHtml(entry.label)}</span>
            </a>
          </li>
        `
          )
          .join("")}
      </ul>
    </section>
  `;
}

export function mount(container) {
  const collected = collectFavorites();
  const isEmpty = !collected.books.length && !collected.studies.length && !collected.notes.length;

  container.innerHTML = `
    <div class="section-header">
      <h1>Favoritos</h1>
    </div>
    ${
      isEmpty
        ? `<section class="empty-state">
            <p>Nenhum favorito ainda.</p>
            <p class="metadata">Use o botão ☆ em livros e notas para favoritá-los.</p>
          </section>`
        : `<input id="fav-search" class="input" type="search"
            placeholder="Buscar nos favoritos..." aria-label="Buscar nos favoritos">
          <div id="fav-results"></div>`
    }
  `;

  if (isEmpty) return;

  const input = container.querySelector("#fav-search");
  const results = container.querySelector("#fav-results");

  function run() {
    results.innerHTML = renderFiltered(collected, input.value);
  }

  input.addEventListener("input", run);
  run();
}

function renderFiltered(collected, query) {
  const q = query.trim().toLocaleLowerCase();
  const match = (entry) => entry.label.toLocaleLowerCase().includes(q);
  const books = q ? collected.books.filter(match) : collected.books;
  const studies = q ? collected.studies.filter(match) : collected.studies;
  const notes = q ? collected.notes.filter(match) : collected.notes;

  if (!books.length && !studies.length && !notes.length) {
    return `<p class="metadata">Nenhum favorito encontrado.</p>`;
  }

  return (
    renderGroup("Livros", books) +
    renderGroup("Estudos bíblicos", studies) +
    renderGroup("Notas de Apologética", notes)
  );
}
