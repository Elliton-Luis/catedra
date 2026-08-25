import { bibleBooks } from "./data/bible-books.js";

const app = document.querySelector("#app");

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

function renderShell(contentHtml) {
  app.innerHTML = `
    <a class="skip-link" href="#content">Skip to content</a>
    <header class="site-header">
      <div class="site-header-inner">
        <span class="brand">Study Notebook</span>
        <nav aria-label="Main navigation">
          <ul class="site-nav">
            <li><a href="#scriptures">Scriptures</a></li>
            <li><a href="#apologetics">Apologetics</a></li>
            <li><a href="#favorites">Favorites</a></li>
            <li><a href="#settings">Settings &amp; Data</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main id="content" class="page">
      ${contentHtml}
    </main>
  `;
}

function renderWelcome() {
  return `
    <div class="section-header">
      <h1>Study Notebook</h1>
      <p class="metadata">A quiet place for Scripture study and apologetics.</p>
    </div>
    <section class="empty-state" aria-label="No content yet">
      <p>Nothing here yet.</p>
      <p class="metadata">Your studies will appear here in future sections.</p>
    </section>
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

function renderBook(book) {
  const categories = book.categories.map((c) => categoryLabels[c]).join(", ");
  const deuteroTag = book.deuterocanonical ? '<span class="tag">Deuterocanonical</span>' : "";
  return `
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
      ${deuteroTag}
      ${book.deuterocanonicalSections ? `<p class="metadata">${book.deuterocanonicalSections}</p>` : ""}
    </details>
  `;
}

function renderScriptures() {
  const oldTestament = bibleBooks.filter((b) => b.testament === "old");
  const newTestament = bibleBooks.filter((b) => b.testament === "new");
  return `
    <div class="section-header">
      <h1>Scriptures</h1>
      <p class="metadata">${bibleBooks.length} books of the Catholic Bible.</p>
    </div>
    <section aria-labelledby="ot-heading">
      <h2 id="ot-heading">Old Testament</h2>
      ${groupBooks(oldTestament)
        .map(
          (group) => `
        <h3 class="category-title">${group.label}</h3>
        <ul class="book-list">
          ${group.books.map(renderBook).join("")}
        </ul>
      `
        )
        .join("")}
    </section>
    <section aria-labelledby="nt-heading">
      <h2 id="nt-heading">New Testament</h2>
      ${groupBooks(newTestament)
        .map(
          (group) => `
        <h3 class="category-title">${group.label}</h3>
        <ul class="book-list">
          ${group.books.map(renderBook).join("")}
        </ul>
      `
        )
        .join("")}
    </section>
  `;
}

function renderSectionPlaceholder(name) {
  return `
    <div class="section-header">
      <h1>${name}</h1>
    </div>
    <section class="empty-state">
      <p>Nothing here yet.</p>
      <p class="metadata">This section will be implemented later.</p>
    </section>
  `;
}

function currentView() {
  switch (location.hash) {
    case "#scriptures":
      return renderScriptures();
    case "#apologetics":
      return renderSectionPlaceholder("Apologetics");
    case "#favorites":
      return renderSectionPlaceholder("Favorites");
    case "#settings":
      return renderSectionPlaceholder("Settings & Data");
    default:
      return renderWelcome();
  }
}

function render() {
  renderShell(currentView());
}

window.addEventListener("hashchange", () => {
  document.querySelector("#content").innerHTML = currentView();
});

render();
