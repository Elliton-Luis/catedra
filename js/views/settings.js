import { applyBackup, downloadBackup, parseBackup } from "../backup.js";

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
  `;

  const status = container.querySelector("#data-status");
  const fileInput = container.querySelector("#import-data");

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
}
