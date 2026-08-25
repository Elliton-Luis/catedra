// Small cache-first service worker: all app assets are precached at
// install time so the application works fully offline. Data itself
// lives in localStorage and never touches the service worker.

const CACHE_NAME = "catedra-v1";
const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css",
  "js/main.js",
  "js/dom.js",
  "js/store.js",
  "js/notes-store.js",
  "js/markdown.js",
  "js/links.js",
  "js/favorites.js",
  "js/backup.js",
  "js/note-export.js",
  "js/pwa.js",
  "js/data/bible-books.js",
  "js/views/scriptures.js",
  "js/views/apologetics.js",
  "js/views/search.js",
  "js/views/favorites.js",
  "js/views/settings.js",
  "js/views/note-editor.js",
  "assets/icon.svg",
  "assets/icon-192.png",
  "assets/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
