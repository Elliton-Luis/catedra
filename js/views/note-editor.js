import { escapeHtml } from "../dom.js";
import { renderMarkdown } from "../markdown.js";

// Shared Markdown note editor used by Apologetics and Scripture notes.
// Options:
//   backHtml       - markup for the back link
//   heading        - fixed, non-editable title (scripture notes)
//   getTitle       - accessor for the editable title (apologetics notes)
//   onTitleChange  - called when the editable title changes
//   getContent     - accessor for the current Markdown content
//   onContentChange- called on every content change (autosave)
//   resolveWiki    - resolver for [[wiki links]]
//   footerHtml     - extra actions row markup (e.g. delete button)
//   belowHtml      - markup rendered below the editor (e.g. backlinks)
//   onMount        - callback after each render for custom event wiring

export function mount(container, options) {
  let mode = "write";

  function setStatusSaved() {
    const status = container.querySelector("#save-status");
    if (status) status.textContent = "Salvo";
  }

  function render() {
    const content = options.getContent();
    container.innerHTML = `
      ${options.backHtml ?? ""}
      ${options.heading ? `<div class="section-header"><h1>${escapeHtml(options.heading)}</h1></div>` : ""}
      ${
        options.onTitleChange
          ? `<input id="note-title" class="title-input" type="text"
              value="${escapeHtml(options.getTitle())}"
              placeholder="${options.titlePlaceholder ?? "Título"}" aria-label="Título da nota">`
          : ""
      }
      <div class="mode-toggle" role="group" aria-label="Modo do editor">
        <button type="button" data-mode="write" aria-pressed="${mode === "write"}">Escrever</button>
        <button type="button" data-mode="read" aria-pressed="${mode === "read"}">Ler</button>
      </div>
      ${
        mode === "write"
          ? `<textarea id="note-content" class="content-textarea"
              placeholder="${options.placeholder ?? "Escreva seu estudo em Markdown"}"
              aria-label="Conteúdo da nota">${escapeHtml(content)}</textarea>`
          : `<article class="markdown">${renderMarkdown(content, options.resolveWiki)}</article>`
      }
      <div class="editor-actions">
        <p id="save-status" class="metadata" aria-live="polite">Salvo</p>
        ${options.footerHtml ?? ""}
      </div>
      ${options.belowHtml ?? ""}
    `;
    wire();
  }

  function wire() {
    const titleInput = container.querySelector("#note-title");
    if (titleInput) {
      titleInput.addEventListener("input", () => {
        options.onTitleChange(titleInput.value);
        setStatusSaved();
      });
    }

    const contentArea = container.querySelector("#note-content");
    if (contentArea) {
      contentArea.addEventListener("input", () => {
        options.onContentChange(contentArea.value);
        setStatusSaved();
      });
    }

    for (const button of container.querySelectorAll(".mode-toggle button")) {
      button.addEventListener("click", () => {
        mode = button.dataset.mode;
        render();
      });
    }

    options.onMount?.(container);
  }

  render();
}
