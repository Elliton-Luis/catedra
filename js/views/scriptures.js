import { bibleBooks } from "../data/bible-books.js";

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

function renderBook(book) {
  const categories = book.categories.map((c) => categoryLabels[c]).join(", ");
  return `
    <li>
      <details class="list-item">
        <summary>
          <span>${book.displayName}</span>
          <span class="metadata">${book.abbreviation} · ${book.chapters} capítulos</span>
        </summary>
        <dl class="book-details">
          <dt>Categorias</dt><dd>${categories}</dd>
          <dt>Autor</dt><dd>${book.author}</dd>
          <dt>Data</dt><dd>${book.date}</dd>
        </dl>
        ${book.deuterocanonical ? '<span class="tag">Deuterocanônico</span>' : ""}
        ${book.deuterocanonicalSections ? `<p class="metadata">${book.deuterocanonicalSections}</p>` : ""}
      </details>
    </li>
  `;
}

function renderGroups(books) {
  return groupBooks(books)
    .map(
      (group) => `
      <h3 class="category-title">${group.label}</h3>
      <ul class="item-list">
        ${group.books.map(renderBook).join("")}
      </ul>
    `
    )
    .join("");
}

export function mount(container) {
  const oldTestament = bibleBooks.filter((b) => b.testament === "old");
  const newTestament = bibleBooks.filter((b) => b.testament === "new");
  container.innerHTML = `
    <div class="section-header">
      <h1>Escrituras</h1>
      <p class="metadata">${bibleBooks.length} livros da Bíblia Católica.</p>
    </div>
    <section aria-labelledby="ot-heading">
      <h2 id="ot-heading">Antigo Testamento</h2>
      ${renderGroups(oldTestament)}
    </section>
    <section aria-labelledby="nt-heading">
      <h2 id="nt-heading">Novo Testamento</h2>
      ${renderGroups(newTestament)}
    </section>
  `;
}
