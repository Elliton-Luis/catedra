import * as scriptures from "./views/scriptures.js";
import * as apologetics from "./views/apologetics.js";

const app = document.querySelector("#app");

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

function renderWelcome(container) {
  container.innerHTML = `
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

function renderSectionPlaceholder(container, name) {
  container.innerHTML = `
    <div class="section-header">
      <h1>${name}</h1>
    </div>
    <section class="empty-state">
      <p>Nothing here yet.</p>
      <p class="metadata">This section will be implemented later.</p>
    </section>
  `;
}

function resolveRoute() {
  const container = document.querySelector("#content");
  const hash = location.hash;
  if (hash === "#scriptures") {
    scriptures.mount(container);
  } else if (hash === "#apologetics") {
    apologetics.mountList(container);
  } else if (hash.startsWith("#apologetics/")) {
    apologetics.mountEditor(container, decodeURIComponent(hash.slice("#apologetics/".length)));
  } else if (hash === "#favorites") {
    renderSectionPlaceholder(container, "Favorites");
  } else if (hash === "#settings") {
    renderSectionPlaceholder(container, "Settings & Data");
  } else {
    renderWelcome(container);
  }
}

function render() {
  renderShell("");
  resolveRoute();
}

window.addEventListener("hashchange", render);

render();
