import { loadJson, saveJson } from "./store.js";

const APOLOGETICS_NOTES_KEY = "study-notebook.apologetics.notes";
const SCRIPTURE_NOTES_KEY = "study-notebook.scriptures.notes";

// Starter structure for new apologetics notes.
// The user is free to change or discard it entirely.
const APOLOGETICS_TEMPLATE = [
  "# Tese",
  "",
  "## Argumentos",
  "",
  "## Relações",
  "",
  "## Extras",
  "",
].join("\n");

// Apologetics notes: free-titled notes with their own stable ids.

export function loadApologeticsNotes() {
  return loadJson(APOLOGETICS_NOTES_KEY, []).filter((note) => note && typeof note.id === "string");
}

export function getApologeticsNote(id) {
  return loadApologeticsNotes().find((note) => note.id === id);
}

export function getApologeticsTemplate() {
  return APOLOGETICS_TEMPLATE;
}

// Creates the note if it does not exist yet (drafts are only
// persisted on first edit, so abandoned drafts leave no clutter).
export function updateApologeticsNote(id, changes) {
  const notes = loadApologeticsNotes();
  let note = notes.find((n) => n.id === id);
  if (!note) {
    note = { id, title: "", content: APOLOGETICS_TEMPLATE };
    notes.push(note);
  }
  Object.assign(note, changes);
  saveJson(APOLOGETICS_NOTES_KEY, notes);
}

export function deleteApologeticsNote(id) {
  saveJson(
    APOLOGETICS_NOTES_KEY,
    loadApologeticsNotes().filter((note) => note.id !== id)
  );
}

// Replaces the whole collection (used by data import).
export function replaceApologeticsNotes(notes) {
  saveJson(
    APOLOGETICS_NOTES_KEY,
    notes.filter((note) => note && typeof note.id === "string")
  );
}

// Removes every note from both collections.
export function clearAllNotes() {
  localStorage.removeItem(APOLOGETICS_NOTES_KEY);
  localStorage.removeItem(SCRIPTURE_NOTES_KEY);
}

// Scripture notes: one Markdown document per book + chapter.
// The id is derived from bookId and chapter, so it stays stable.

export function loadScriptureNotes() {
  return loadJson(SCRIPTURE_NOTES_KEY, []).filter(
    (note) => note && typeof note.bookId === "string" && Number.isInteger(note.chapter)
  );
}

export function getScriptureNote(bookId, chapter) {
  return loadScriptureNotes().find((note) => note.bookId === bookId && note.chapter === chapter);
}

export function upsertScriptureNote(bookId, chapter, changes) {
  const notes = loadScriptureNotes();
  const existing = notes.find((note) => note.bookId === bookId && note.chapter === chapter);
  if (existing) {
    Object.assign(existing, changes);
  } else {
    notes.push({
      id: `${bookId}-${chapter}`,
      bookId,
      chapter,
      title: "",
      content: "",
      ...changes,
    });
  }
  saveJson(SCRIPTURE_NOTES_KEY, notes);
}

export function deleteScriptureNote(bookId, chapter) {
  saveJson(
    SCRIPTURE_NOTES_KEY,
    loadScriptureNotes().filter((note) => !(note.bookId === bookId && note.chapter === chapter))
  );
}

// Replaces the whole collection (used by data import).
export function replaceScriptureNotes(notes) {
  saveJson(
    SCRIPTURE_NOTES_KEY,
    notes.filter(
      (note) => note && typeof note.bookId === "string" && Number.isInteger(note.chapter)
    )
  );
}
