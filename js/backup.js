import { bibleBooks } from "./data/bible-books.js";
import {
  loadApologeticsNotes,
  loadPrayers,
  loadScriptureNotes,
  replaceApologeticsNotes,
  replacePrayers,
  replaceScriptureNotes,
} from "./notes-store.js";
import { loadFavorites, replaceFavorites } from "./favorites.js";

// Versioned backup format (snapshot):
//   { app: "catedra", version, updatedAt, data: { apologeticsNotes, scriptureNotes, prayerNotes, favorites } }
// Legacy format (v1/v2 without app wrapper) is still accepted on import.
const BACKUP_APP = "catedra";
const BACKUP_VERSION = 2;
const BACKUP_META_KEY = "catedra.backup.meta";
const IDB_DB_NAME = "catedra-backup";
const IDB_STORE = "handles";
const IDB_HANDLE_KEY = "backupFileHandle";

// ---- data collection ----

function collectData() {
  return {
    apologeticsNotes: loadApologeticsNotes(),
    scriptureNotes: loadScriptureNotes(),
    prayerNotes: loadPrayers(),
    favorites: loadFavorites(),
  };
}

export function buildBackup() {
  const data = collectData();
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    updatedAt: new Date().toISOString(),
    data,
  };
}

// Keep legacy builder for tests that check internal shape? Export alias.
export const EXPORT_VERSION = BACKUP_VERSION;

// ---- hashing / change detection ----

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export function computeDataHash(data = collectData()) {
  return hashString(JSON.stringify(data));
}

export function getBackupMeta() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(BACKUP_META_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function setBackupMeta(hash, updatedAt) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(BACKUP_META_KEY, JSON.stringify({ lastBackupHash: hash, lastBackupAt: updatedAt }));
    }
  } catch {
    // ignore quota
  }
}

export function markBackupSynced(updatedAt) {
  const data = collectData();
  const hash = computeDataHash(data);
  const at = updatedAt || new Date().toISOString();
  setBackupMeta(hash, at);
}

export function getBackupStatus() {
  const meta = getBackupMeta();
  const currentHash = computeDataHash();
  const pending = !meta || meta.lastBackupHash !== currentHash;
  return {
    pending,
    lastBackupAt: meta?.lastBackupAt || null,
    lastBackupHash: meta?.lastBackupHash || null,
    currentHash,
  };
}

export function isBackupPending() {
  return getBackupStatus().pending;
}

// ---- IndexedDB handle persistence ----

function openBackupDB() {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("indexedDB unavailable"));
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getBackupHandle() {
  try {
    const db = await openBackupDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function setBackupHandle(handle) {
  try {
    const db = await openBackupDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(handle, IDB_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch {
    return false;
  }
}

export async function clearBackupHandle() {
  try {
    const db = await openBackupDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(IDB_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

// ---- validation ----

function isValidApologeticsNote(note) {
  return Boolean(note) && typeof note.id === "string" && typeof note.content === "string";
}

function isValidPrayerNote(note) {
  return Boolean(note) && typeof note.id === "string" && typeof note.content === "string";
}

function isValidScriptureNote(note) {
  if (!note || typeof note.bookId !== "string" || typeof note.content !== "string") {
    return false;
  }
  const book = bibleBooks.find((book) => book.id === note.bookId);
  return Number.isInteger(note.chapter) && note.chapter >= 1 && !!book && note.chapter <= book.chapters;
}

// Parses and validates a backup file (new or legacy).
// Returns normalized payload or null when not usable.
export function parseBackup(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return null;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  // Reject backups from other apps
  if (data.app !== undefined && data.app !== BACKUP_APP) return null;

  const version = data.version;
  if (version !== BACKUP_VERSION && version !== 1) return null;

  // New format: { app, version, updatedAt, data: { ... } }
  let payload = null;
  if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    const d = data.data;
    if (!Array.isArray(d.apologeticsNotes) || !Array.isArray(d.scriptureNotes) || !Array.isArray(d.favorites)) {
      return null;
    }
    payload = {
      apologeticsNotes: d.apologeticsNotes,
      scriptureNotes: d.scriptureNotes,
      prayerNotes: Array.isArray(d.prayerNotes) ? d.prayerNotes : [],
      favorites: d.favorites,
    };
  } else if (Array.isArray(data.apologeticsNotes) && Array.isArray(data.scriptureNotes) && Array.isArray(data.favorites)) {
    // Legacy flat format: { version, exportedAt, apologeticsNotes, scriptureNotes, prayerNotes, favorites }
    payload = {
      apologeticsNotes: data.apologeticsNotes,
      scriptureNotes: data.scriptureNotes,
      prayerNotes: Array.isArray(data.prayerNotes) ? data.prayerNotes : [],
      favorites: data.favorites,
    };
  } else {
    return null;
  }

  return {
    version: BACKUP_VERSION,
    updatedAt: data.updatedAt || data.exportedAt || null,
    apologeticsNotes: payload.apologeticsNotes
      .filter(isValidApologeticsNote)
      .map((note) => ({
        id: note.id,
        title: String(note.title ?? ""),
        content: note.content,
        ...(note.updatedAt ? { updatedAt: String(note.updatedAt) } : {}),
      })),
    scriptureNotes: payload.scriptureNotes.filter(isValidScriptureNote).map((note) => ({
      id: `${note.bookId}-${note.chapter}`,
      bookId: note.bookId,
      chapter: note.chapter,
      title: String(note.title ?? ""),
      content: note.content,
      ...(note.updatedAt ? { updatedAt: String(note.updatedAt) } : {}),
    })),
    prayerNotes: payload.prayerNotes.filter(isValidPrayerNote).map((note) => ({
      id: note.id,
      title: String(note.title ?? ""),
      content: note.content,
      ...(note.updatedAt ? { updatedAt: String(note.updatedAt) } : {}),
    })),
    favorites: payload.favorites.filter((ref) => typeof ref === "string"),
  };
}

export function applyBackup(backup) {
  replaceApologeticsNotes(backup.apologeticsNotes);
  replaceScriptureNotes(backup.scriptureNotes);
  replacePrayers(backup.prayerNotes);
  replaceFavorites(backup.favorites);
  // Mark as synced with backup just applied
  markBackupSynced(backup.updatedAt || new Date().toISOString());
}

// ---- download helpers ----

function downloadViaBlob(jsonString, updatedAt) {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const date = (updatedAt || new Date().toISOString()).slice(0, 10);
  link.download = `catedra-backup-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Legacy downloadBackup keeps compatibility for existing callers
export function downloadBackup() {
  const backup = buildBackup();
  const json = JSON.stringify(backup, null, 2);
  // Browser fallback
  if (typeof document !== "undefined") {
    downloadViaBlob(json, backup.updatedAt);
  }
  markBackupSynced(backup.updatedAt);
}

// Preferred export that tries File System Access handle reuse for single-file overwrite
export async function exportBackup() {
  const backup = buildBackup();
  const json = JSON.stringify(backup, null, 2);

  // Try File System Access API if available
  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      let handle = await getBackupHandle();
      // If we have a handle, try to reuse it silently (single backup)
      if (handle) {
        try {
          if (handle.queryPermission) {
            const p = await handle.queryPermission({ mode: "readwrite" });
            if (p !== "granted") {
              const r = await handle.requestPermission({ mode: "readwrite" });
              if (r !== "granted") throw new Error("permission-denied");
            }
          }
          const writable = await handle.createWritable();
          await writable.write(json);
          await writable.close();
          markBackupSynced(backup.updatedAt);
          return { ok: true, method: "handle", updatedAt: backup.updatedAt };
        } catch (e) {
          // Handle stale/lost; fall through to picker
          if (e && e.name === "AbortError") return { ok: false, aborted: true };
        }
      }
      // No handle or reuse failed → ask user to pick file (first time)
      const picker = window.showSaveFilePicker;
      if (typeof picker === "function") {
        const newHandle = await window.showSaveFilePicker({
          suggestedName: `catedra-backup-${backup.updatedAt.slice(0, 10)}.json`,
          types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
        });
        const writable = await newHandle.createWritable();
        await writable.write(json);
        await writable.close();
        await setBackupHandle(newHandle);
        markBackupSynced(backup.updatedAt);
        return { ok: true, method: "handle", updatedAt: backup.updatedAt };
      }
    } catch (e) {
      if (e && e.name === "AbortError") return { ok: false, aborted: true };
      // fallback to download on other errors
    }
  }

  // Fallback: blob download
  if (typeof document !== "undefined") {
    downloadViaBlob(json, backup.updatedAt);
  }
  markBackupSynced(backup.updatedAt);
  return { ok: true, method: "download", updatedAt: backup.updatedAt };
}

// ---- automatic backup on lifecycle events ----

export async function tryAutoBackup() {
  if (!isBackupPending()) return { done: false, reason: "no-pending" };
  const handle = await getBackupHandle();
  if (!handle) return { done: false, reason: "no-handle" };
  try {
    if (handle.queryPermission) {
      const perm = await handle.queryPermission({ mode: "readwrite" });
      if (perm !== "granted") {
        const req = await handle.requestPermission({ mode: "readwrite" });
        if (req !== "granted") return { done: false, reason: "permission-denied" };
      }
    }
    const backup = buildBackup();
    const json = JSON.stringify(backup, null, 2);
    const writable = await handle.createWritable();
    await writable.write(json);
    await writable.close();
    markBackupSynced(backup.updatedAt);
    return { done: true, updatedAt: backup.updatedAt };
  } catch (e) {
    return { done: false, reason: "error", error: e };
  }
}

let autoBackupInitialized = false;
export function initAutoBackup() {
  if (autoBackupInitialized) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  autoBackupInitialized = true;

  const handler = () => {
    // best-effort; don't await in event handler (browser may terminate)
    tryAutoBackup();
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") handler();
  });
  window.addEventListener("pagehide", handler);
  // beforeunload is limited but try sync check (cannot do async blob download here)
  // We keep pending state so next visit can still export.
  window.addEventListener("beforeunload", () => {
    // No-op: ensure meta reflects pending state is already persisted via hash comparison
  });
}
