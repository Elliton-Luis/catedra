import * as scriptures from "./views/scriptures.js";
import * as apologetics from "./views/apologetics.js";
import * as favorites from "./views/favorites.js";
import * as search from "./views/search.js";
import * as settings from "./views/settings.js";

const app = document.querySelector("#app");

function renderShell(contentHtml) {
  app.innerHTML = `
    <a class="skip-link" href="#content">Pular para o conteúdo</a>
    <header class="site-header">
      <div class="site-header-inner">
        <span class="brand">Cátedra</span>
        <nav aria-label="Navegação principal">
          <ul class="site-nav">
            <li><a href="#scriptures">Escrituras</a></li>
            <li><a href="#apologetics">Apologética</a></li>
            <li><a href="#search">Busca</a></li>
            <li><a href="#favorites">Favoritos</a></li>
            <li><a href="#settings">Ajustes &amp; Dados</a></li>
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
      <h1>Cátedra</h1>
      <p class="metadata">Um lugar tranquilo para o estudo da Escritura e da apologética.</p>
    </div>
    <section class="empty-state" aria-label="Nenhum conteúdo ainda">
      <p>Nada por aqui ainda.</p>
      <p class="metadata">Seus estudos aparecerão nas seções.</p>
    </section>
  `;
}

function renderSectionPlaceholder(container, name) {
  container.innerHTML = `
    <div class="section-header">
      <h1>${name}</h1>
    </div>
    <section class="empty-state">
      <p>Nada por aqui ainda.</p>
      <p class="metadata">Esta seção será implementada futuramente.</p>
    </section>
  `;
}

function resolveRoute() {
  const container = document.querySelector("#content");
  const hash = location.hash;
  if (hash === "#scriptures") {
    scriptures.mount(container);
  } else if (hash.startsWith("#scriptures/")) {
    // "#scriptures/<bookId>/<chapter>" -> ["#scriptures", "<bookId>", "<chapter>"]
    const [, bookId, chapter] = hash.split("/");
    scriptures.mountChapterNote(container, bookId, Number(chapter));
  } else if (hash === "#apologetics") {
    apologetics.mountList(container);
  } else if (hash.startsWith("#apologetics/")) {
    apologetics.mountEditor(container, decodeURIComponent(hash.slice("#apologetics/".length)));
  } else if (hash === "#favorites") {
    favorites.mount(container);
  } else if (hash === "#search") {
    search.mount(container);
  } else if (hash === "#settings") {
    settings.mount(container);
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
