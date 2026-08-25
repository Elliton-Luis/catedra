import {
  loadApologeticsNotes,
  loadScriptureNotes,
  replaceApologeticsNotes,
  replaceScriptureNotes,
} from "./notes-store.js";
import { loadFavorites, replaceFavorites } from "./favorites.js";

// Simple versioned backup format, independent of browser or account:
//   { version, exportedAt, apologeticsNotes, scriptureNotes, favorites }
// Static data (the 73 Bible books) is not included.
const EXPORT_VERSION = 1;

export function buildBackup() {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    apologeticsNotes: loadApologeticsNotes(),
    scriptureNotes: loadScriptureNotes(),
    favorites: loadFavorites(),
  };
}

function isValidApologeticsNote(note) {
  return Boolean(note) && typeof note.id === "string" && typeof note.content === "string";
}

function isValidScriptureNote(note) {
  return (
    Boolean(note) &&
    typeof note.bookId === "string" &&
    Number.isInteger(note.chapter) &&
    note.chapter >= 1 &&
    typeof note.content === "string"
  );
}

// Parses and minimally validates a backup file.
// Returns a normalized payload, or null when the file is not usable.
export function parseBackup(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return null;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  if (data.version !== EXPORT_VERSION) return null;
  if (!Array.isArray(data.apologeticsNotes)) return null;
  if (!Array.isArray(data.scriptureNotes)) return null;
  if (!Array.isArray(data.favorites)) return null;

  // Invalid entries are dropped instead of rejecting the whole file.
  return {
    version: EXPORT_VERSION,
    apologeticsNotes: data.apologeticsNotes
      .filter(isValidApologeticsNote)
      .map((note) => ({
        id: note.id,
        title: String(note.title ?? ""),
        content: note.content,
      })),
    scriptureNotes: data.scriptureNotes.filter(isValidScriptureNote).map((note) => ({
      id: `${note.bookId}-${note.chapter}`,
      bookId: note.bookId,
      chapter: note.chapter,
      title: String(note.title ?? ""),
      content: note.content,
    })),
    favorites: data.favorites.filter((ref) => typeof ref === "string"),
  };
}

export function applyBackup(backup) {
  replaceApologeticsNotes(backup.apologeticsNotes);
  replaceScriptureNotes(backup.scriptureNotes);
  replaceFavorites(backup.favorites);
}

export function downloadBackup() {
  const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `catedra-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
