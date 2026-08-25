import * as home from "./views/home.js";
import * as scriptures from "./views/scriptures.js";
import * as apologetics from "./views/apologetics.js";
import * as favorites from "./views/favorites.js";
import * as search from "./views/search.js";
import * as settings from "./views/settings.js";
import { registerServiceWorker } from "./pwa.js";

const app = document.querySelector("#app");

function renderShell() {
  app.innerHTML = `
    <a class="skip-link" href="#content">Pular para o conteúdo</a>
    <header class="site-header">
      <div class="site-header-inner">
        <div class="brand-row">
          <a class="brand" href="#">Cátedra</a>
          <button
            id="menu-toggle"
            class="menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="site-nav"
            aria-label="Abrir menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <nav id="site-nav" class="site-nav" aria-label="Navegação principal">
          <ul>
            <li><a href="#scriptures">Escrituras</a></li>
            <li><a href="#apologetics">Apologética</a></li>
            <li><a href="#search">Busca</a></li>
            <li><a href="#favorites">Favoritos</a></li>
            <li><a href="#settings">Ajustes &amp; Dados</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main id="content" class="page" tabindex="-1"></main>
  `;

  const skipLink = app.querySelector(".skip-link");
  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("#content").focus();
  });

  const header = app.querySelector(".site-header");
  const menuToggle = app.querySelector("#menu-toggle");
  menuToggle.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
}

// The shell is rendered once; only the content area changes per route.
function updateNavCurrent(hash) {
  for (const link of app.querySelectorAll(".site-nav a")) {
    const target = link.getAttribute("href");
    if (hash === target || hash.startsWith(target + "/")) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

// The mobile menu starts closed on every navigation.
function closeMenu() {
  const header = app.querySelector(".site-header");
  const menuToggle = app.querySelector("#menu-toggle");
  header.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function resolveRoute() {
  const container = document.querySelector("#content");
  const hash = location.hash;
  updateNavCurrent(hash);
  closeMenu();

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
    home.mount(container);
  }
}

renderShell();
resolveRoute();

registerServiceWorker();
window.addEventListener("hashchange", resolveRoute);
