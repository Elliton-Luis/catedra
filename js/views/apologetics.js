import { escapeHtml } from "../dom.js";
import { downloadMarkdown, printNote, sanitizeFilename } from "../note-export.js";
import { favoriteButtonHtml, removeFavorite, wireFavoriteButtons } from "../favorites.js";
import { getBacklinks, renderBacklinks, resolveWikiLink } from "../links.js";
import {
  createApologeticsNote,
  deleteApologeticsNote,
  getApologeticsNote,
  loadApologeticsNotes,
  updateApologeticsNote,
} from "../notes-store.js";
import * as noteEditor from "./note-editor.js";

export function mountList(container) {
  const notes = loadApologeticsNotes();

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
    location.hash = `#apologetics/${encodeURIComponent(createApologeticsNote().id)}`;
  });
}

export function mountEditor(container, id) {
  const note = getApologeticsNote(id);

  if (!note) {
    container.innerHTML = `
      <a class="back-link metadata" href="#apologetics">&larr; Apologética</a>
      <section class="empty-state">
        <p>Esta nota não existe mais.</p>
      </section>
    `;
    return;
  }

  noteEditor.mount(container, {
    backHtml: `<a class="back-link metadata" href="#apologetics">&larr; Apologética</a>`,
    getTitle: () => getApologeticsNote(id)?.title ?? "",
    onTitleChange: (value) => updateApologeticsNote(id, { title: value }),
    getContent: () => getApologeticsNote(id)?.content ?? "",
    onContentChange: (value) => updateApologeticsNote(id, { content: value }),
    resolveWiki: resolveWikiLink,
    footerHtml: `
      <div class="editor-buttons">
        ${favoriteButtonHtml(`apologetics:${id}`)}
        <button id="export-md" class="text-button" type="button">Exportar .md</button>
        <button id="export-pdf" class="text-button" type="button">Exportar PDF</button>
        <button id="delete-note" class="button secondary" type="button">Excluir nota</button>
      </div>
    `,
    belowHtml: renderBacklinks(
      getBacklinks([note.title], `#apologetics/${encodeURIComponent(id)}`)
    ),
    onMount: (element) => {
      wireFavoriteButtons(element);
      element.querySelector("#export-md")?.addEventListener("click", () => {
        const current = getApologeticsNote(id);
        const name = sanitizeFilename(current?.title) || "sem-titulo";
        downloadMarkdown(`${name}.md`, current?.content ?? "");
      });
      element.querySelector("#export-pdf")?.addEventListener("click", () => {
        const current = getApologeticsNote(id);
        printNote(current?.title || "Sem título", "", current?.content ?? "");
      });
      element.querySelector("#delete-note")?.addEventListener("click", () => {
        const current = getApologeticsNote(id);
        if (!confirm(`Excluir "${current?.title || "Sem título"}"? Esta ação não pode ser desfeita.`)) {
          return;
        }
        deleteApologeticsNote(id);
        removeFavorite(`apologetics:${id}`);
        location.hash = "#apologetics";
      });
    },
  });
}
