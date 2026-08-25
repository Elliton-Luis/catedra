import { loadJson, saveJson } from "./store.js";

const APOLOGETICS_NOTES_KEY = "study-notebook.apologetics.notes";
const SCRIPTURE_NOTES_KEY = "study-notebook.scriptures.notes";

// Apologetics notes: free-titled notes with their own stable ids.

export function loadApologeticsNotes() {
  return loadJson(APOLOGETICS_NOTES_KEY, []).filter((note) => note && typeof note.id === "string");
}

export function getApologeticsNote(id) {
  return loadApologeticsNotes().find((note) => note.id === id);
}

export function createApologeticsNote() {
  const note = { id: crypto.randomUUID(), title: "", content: "" };
  saveJson(APOLOGETICS_NOTES_KEY, [...loadApologeticsNotes(), note]);
  return note;
}

export function updateApologeticsNote(id, changes) {
  const notes = loadApologeticsNotes();
  const note = notes.find((n) => n.id === id);
  if (!note) return;
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

export function upsertScriptureNote(bookId, chapter, content) {
  const notes = loadScriptureNotes();
  const existing = notes.find((note) => note.bookId === bookId && note.chapter === chapter);
  if (existing) {
    existing.content = content;
  } else {
    notes.push({ id: `${bookId}-${chapter}`, bookId, chapter, content });
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
