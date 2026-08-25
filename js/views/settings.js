import { applyBackup, downloadBackup, parseBackup } from "../backup.js";
import { clearAllNotes } from "../notes-store.js";
import { isInstallAvailable, onInstallAvailability, promptInstall } from "../pwa.js";
import { replaceFavorites } from "../favorites.js";

export function mount(container) {
  container.innerHTML = `
    <div class="section-header">
      <h1>Ajustes &amp; Dados</h1>
      <p class="metadata">Seus dados ficam apenas neste navegador. Exporte um arquivo para transferi-los a outro dispositivo.</p>
    </div>
    <section aria-labelledby="data-heading">
      <h2 id="data-heading">Dados</h2>
      <p>Exporte todos os seus dados (estudos bíblicos, notas de apologética e favoritos) em um arquivo JSON, ou restaure a partir de um arquivo exportado anteriormente. A importação substitui os dados atuais.</p>
      <div class="data-actions">
        <button id="export-data" class="button" type="button">Exportar dados</button>
        <label class="button secondary" for="import-data">Importar dados</label>
        <input id="import-data" type="file" accept=".json,application/json" hidden>
      </div>
      <p id="data-status" class="metadata" aria-live="polite"></p>
    </section>
    <section aria-labelledby="app-heading">
      <h2 id="app-heading">Aplicativo</h2>
      <div class="data-actions" id="install-area" hidden>
        <button id="install-app" class="button secondary" type="button">Instalar aplicativo</button>
        <span class="metadata">Permite abrir o Cátedra offline, como aplicativo.</span>
      </div>
    </section>
    <section aria-labelledby="danger-heading">
      <h2 id="danger-heading">Zona de risco</h2>
      <p>Apaga permanentemente todos os estudos bíblicos, notas de apologética e favoritos deste navegador. Se deseja guardar uma cópia, exporte seus dados antes.</p>
      <div class="data-actions">
        <button id="clear-data" class="button secondary" type="button">Excluir todos os dados</button>
      </div>
    </section>
  `;

  const status = container.querySelector("#data-status");
  const fileInput = container.querySelector("#import-data");

  // Discreet install option: only shown when the browser offers installation.
  const installArea = container.querySelector("#install-area");
  function refreshInstallArea(available) {
    installArea.hidden = !available;
  }
  refreshInstallArea(isInstallAvailable());
  onInstallAvailability(refreshInstallArea);

  container.querySelector("#install-app").addEventListener("click", async () => {
    await promptInstall();
    refreshInstallArea(isInstallAvailable());
  });

  container.querySelector("#export-data").addEventListener("click", () => {
    downloadBackup();
    status.textContent = "Arquivo de backup gerado.";
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const backup = parseBackup(await file.text());
    if (!backup) {
      status.textContent = "Arquivo inválido. Use um arquivo JSON exportado pelo Cátedra.";
      fileInput.value = "";
      return;
    }

    if (!confirm("A importação substituirá todos os seus dados atuais. Continuar?")) {
      fileInput.value = "";
      return;
    }

    applyBackup(backup);
    status.textContent = "Dados importados com sucesso.";
    fileInput.value = "";
  });

  container.querySelector("#clear-data").addEventListener("click", () => {
    if (!confirm("Excluir TODOS os dados (estudos, notas e favoritos)? Esta ação não pode ser desfeita.")) {
      return;
    }
    clearAllNotes();
    replaceFavorites([]);
    status.textContent = "Todos os dados foram apagados.";
  });
}
