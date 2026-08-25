import { escapeHtml } from "./dom.js";
import { loadJson, saveJson } from "./store.js";

const FAVORITES_KEY = "study-notebook.favorites";

// Favorites are stored as stable string references, never titles:
//   "book:<bookId>", "scripture:<bookId>/<chapter>", "apologetics:<noteId>"

export function loadFavorites() {
  return loadJson(FAVORITES_KEY, []).filter((ref) => typeof ref === "string");
}

export function isFavorite(reference) {
  return loadFavorites().includes(reference);
}

export function addFavorite(reference) {
  const favorites = loadFavorites();
  if (!favorites.includes(reference)) {
    saveJson(FAVORITES_KEY, [...favorites, reference]);
  }
}

export function removeFavorite(reference) {
  saveJson(
    FAVORITES_KEY,
    loadFavorites().filter((ref) => ref !== reference)
  );
}

// Returns true when the reference became a favorite.
export function toggleFavorite(reference) {
  if (isFavorite(reference)) {
    removeFavorite(reference);
    return false;
  }
  addFavorite(reference);
  return true;
}

export function favoriteButtonHtml(reference) {
  const active = isFavorite(reference);
  return `
    <button
      class="favorite-button${active ? " active" : ""}"
      type="button"
      data-favorite="${escapeHtml(reference)}"
      aria-pressed="${active}"
    >${active ? "★ Favoritado" : "☆ Favoritar"}</button>
  `;
}

// Wire every favorite button inside a freshly rendered subtree.
export function wireFavoriteButtons(container) {
  for (const button of container.querySelectorAll("[data-favorite]")) {
    button.addEventListener("click", () => {
      const active = toggleFavorite(button.dataset.favorite);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      button.textContent = active ? "★ Favoritado" : "☆ Favoritar";
    });
  }
}
