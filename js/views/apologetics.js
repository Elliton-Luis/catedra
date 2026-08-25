const STORAGE_KEY = "study-notebook.apologetics.notes";

// Local persistence

export function loadNotes() {
  try {
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(notes) ? notes : [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function generateId() {
  return crypto.randomUUID();
}

export function createNote() {
  const note = { id: generateId(), title: "", content: "" };
  saveNotes([...loadNotes(), note]);
  return note;
}

export function getNote(id) {
  return loadNotes().find((note) => note.id === id);
}

export function updateNote(id, changes) {
  const notes = loadNotes();
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  Object.assign(note, changes);
  saveNotes(notes);
}

export function deleteNote(id) {
  saveNotes(loadNotes().filter((note) => note.id !== id));
}

// Views

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

export function mountList(container) {
  const notes = loadNotes();

  container.innerHTML = `
    <div class="section-header">
      <h1>Apologética</h1>
      <p class="metadata">${notes.length} ${notes.length === 1 ? "nota" : "notas"}.</p>
    </div>
    ${
      notes.length
        ? `<ul class="item-list">
            ${notes
              .map(
                (note) => `
              <li>
                <a class="list-link" href="#apologetics/${encodeURIComponent(note.id)}">
                  <span>${escapeHtml(note.title) || "Sem título"}</span>
                  ${note.content ? '<span class="content-dot" role="img" aria-label="Contém conteúdo"></span>' : ""}
                </a>
              </li>
            `
              )
              .join("")}
          </ul>`
        : `<section class="empty-state">
            <p>Você ainda não criou nenhuma nota.</p>
          </section>`
    }
    <button id="new-note" class="button" type="button">Nova nota</button>
  `;

  container.querySelector("#new-note").addEventListener("click", () => {
    location.hash = `#apologetics/${encodeURIComponent(createNote().id)}`;
  });
}

export function mountEditor(container, id) {
  const note = getNote(id);

  if (!note) {
    container.innerHTML = `
      <a class="back-link metadata" href="#apologetics">&larr; Apologética</a>
      <section class="empty-state">
        <p>Esta nota não existe mais.</p>
      </section>
    `;
    return;
  }

  container.innerHTML = `
    <a class="back-link metadata" href="#apologetics">&larr; Apologética</a>
    <input
      id="note-title"
      class="title-input"
      type="text"
      value="${escapeHtml(note.title)}"
      placeholder="Título"
      aria-label="Título da nota"
    >
    <textarea
      id="note-content"
      class="content-textarea"
      placeholder="Escreva seu estudo (Markdown será suportado em uma etapa futura)"
      aria-label="Conteúdo da nota"
    >${escapeHtml(note.content)}</textarea>
    <div class="editor-actions">
      <p id="save-status" class="metadata" aria-live="polite">Salvo</p>
      <button id="delete-note" class="button secondary" type="button">Excluir nota</button>
    </div>
  `;

  const titleInput = container.querySelector("#note-title");
  const contentTextarea = container.querySelector("#note-content");
  const saveStatus = container.querySelector("#save-status");

  // Autosave: state is updated and persisted on every input.
  titleInput.addEventListener("input", () => {
    updateNote(id, { title: titleInput.value });
    saveStatus.textContent = "Salvo";
  });

  contentTextarea.addEventListener("input", () => {
    updateNote(id, { content: contentTextarea.value });
    saveStatus.textContent = "Salvo";
  });

  container.querySelector("#delete-note").addEventListener("click", () => {
    const confirmed = confirm(`Excluir "${note.title || "Sem título"}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    deleteNote(id);
    location.hash = "#apologetics";
  });
}
