import { escapeHtml } from "../dom.js";
import { downloadMarkdown, printNote, sanitizeFilename } from "../note-export.js";
import { favoriteButtonHtml, removeFavorite, wireFavoriteButtons } from "../favorites.js";
import { getBacklinks, renderBacklinks, resolveWikiLink } from "../links.js";
import {
  deletePrayer,
  getPrayer,
  loadPrayers,
  updatePrayer,
} from "../notes-store.js";
import * as noteEditor from "./note-editor.js";

export function mountList(container) {
  const notes = loadPrayers();

  container.innerHTML = `
    <div class="section-header">
      <h1>Orações</h1>
      <p class="metadata">${notes.length} ${notes.length === 1 ? "oração" : "orações"}.</p>
    </div>
    ${
      notes.length
        ? `<ul class="item-list">
            ${notes
              .map(
                (note) => `
              <li>
                <a class="list-link" href="#prayers/${encodeURIComponent(note.id)}">
                  <span>${escapeHtml(note.title) || "Sem título"}</span>
                  ${note.content ? '<span class="content-dot" role="img" aria-label="Contém conteúdo"></span>' : ""}
                </a>
              </li>
            `
              )
              .join("")}
          </ul>`
        : `<section class="empty-state">
            <p>Você ainda não adicionou nenhuma oração.</p>
          </section>`
    }
    <button id="new-note" class="button" type="button">Nova oração</button>
  `;

  container.querySelector("#new-note").addEventListener("click", () => {
    location.hash = `#prayers/${crypto.randomUUID()}`;
  });
}

export function mountEditor(container, id) {
  const note = getPrayer(id);

  noteEditor.mount(container, {
    backHtml: `<a class="back-link metadata" href="#prayers">&larr; Orações</a>`,
    getTitle: () => getPrayer(id)?.title ?? "",
    onTitleChange: (value) => updatePrayer(id, { title: value }),
    getContent: () => getPrayer(id)?.content ?? "",
    onContentChange: (value) => updatePrayer(id, { content: value }),
    resolveWiki: resolveWikiLink,
    footerHtml: `
      <div class="editor-buttons">
        ${favoriteButtonHtml(`prayer:${id}`)}
        <button id="export-md" class="text-button" type="button">Exportar .md</button>
        <button id="export-pdf" class="text-button" type="button">Exportar PDF</button>
        <button id="delete-note" class="button secondary" type="button">Excluir oração</button>
      </div>
    `,
    belowHtml: renderBacklinks(
      getBacklinks([note?.title].filter(Boolean), `#prayers/${encodeURIComponent(id)}`)
    ),
    onMount: (element) => {
      wireFavoriteButtons(element);
      element.querySelector("#export-md")?.addEventListener("click", () => {
        const current = getPrayer(id);
        const name = sanitizeFilename(current?.title) || "sem-titulo";
        downloadMarkdown(`${name}.md`, current?.content ?? "");
      });
      element.querySelector("#export-pdf")?.addEventListener("click", () => {
        const current = getPrayer(id);
        printNote(current?.title || "Sem título", "", current?.content ?? "");
      });
      element.querySelector("#delete-note")?.addEventListener("click", () => {
        const current = getPrayer(id);
        if (!confirm(`Excluir "${current?.title || "Sem título"}"? Esta ação não pode ser desfeita.`)) {
          return;
        }
        deletePrayer(id);
        removeFavorite(`prayer:${id}`);
        location.hash = "#prayers";
      });
    },
  });
}
