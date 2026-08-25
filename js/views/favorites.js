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
  const { books, studies, notes } = collectFavorites();
  const isEmpty = !books.length && !studies.length && !notes.length;

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
        : renderGroup("Livros", books) +
          renderGroup("Estudos bíblicos", studies) +
          renderGroup("Notas de Apologética", notes)
    }
  `;
}
