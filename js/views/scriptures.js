import { bibleBooks } from "../data/bible-books.js";

const categoryLabels = {
  pentateuch: "Pentateuch",
  historical: "Historical Books",
  wisdom: "Wisdom",
  poetry: "Poetry",
  prophetic: "Prophets",
  gospel: "Gospels",
  acts: "Acts of the Apostles",
  pauline: "Pauline Letters",
  catholic_epistle: "Catholic Letters",
  apocalyptic: "Apocalypse",
  deuterocanonical: "Deuterocanonical",
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
          <span class="metadata">${book.abbreviation} · ${book.chapters} chapters</span>
        </summary>
        <dl class="book-details">
          <dt>Categories</dt><dd>${categories}</dd>
          <dt>Author</dt><dd>${book.author}</dd>
          <dt>Date</dt><dd>${book.date}</dd>
        </dl>
        ${book.deuterocanonical ? '<span class="tag">Deuterocanonical</span>' : ""}
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
      <h1>Scriptures</h1>
      <p class="metadata">${bibleBooks.length} books of the Catholic Bible.</p>
    </div>
    <section aria-labelledby="ot-heading">
      <h2 id="ot-heading">Old Testament</h2>
      ${renderGroups(oldTestament)}
    </section>
    <section aria-labelledby="nt-heading">
      <h2 id="nt-heading">New Testament</h2>
      ${renderGroups(newTestament)}
    </section>
  `;
}
