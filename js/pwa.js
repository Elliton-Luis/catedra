// Native PWA support: service worker registration and the
// discreet install prompt, with no external libraries.

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js");
}

let installEvent = null;
const listeners = new Set();

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installEvent = event;
  for (const callback of listeners) callback(true);
});

window.addEventListener("appinstalled", () => {
  installEvent = null;
  for (const callback of listeners) callback(false);
});

export function isInstallAvailable() {
  return installEvent !== null;
}

export function onInstallAvailability(callback) {
  listeners.add(callback);
}

export async function promptInstall() {
  if (!installEvent) return false;
  await installEvent.prompt();
  const { outcome } = await installEvent.userChoice;
  if (outcome === "accepted") installEvent = null;
  return outcome === "accepted";
}
