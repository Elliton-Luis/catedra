import { applyBackup, exportBackup, getBackupStatus, parseBackup, tryAutoBackup } from "../backup.js";
import { clearAllNotes } from "../notes-store.js";
import { isInstallAvailable, onInstallAvailability, promptInstall } from "../pwa.js";
import { replaceFavorites } from "../favorites.js";

function formatBackupDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function renderBackupInfo(container) {
  const status = getBackupStatus();
  const metaEl = container.querySelector("#backup-last");
  const statusEl = container.querySelector("#backup-status");
  if (metaEl) {
    metaEl.textContent = `Último backup: ${status.lastBackupAt ? formatBackupDate(status.lastBackupAt) : "nunca"}`;
  }
  if (statusEl) {
    statusEl.textContent = status.pending ? "Status: Backup pendente" : "Status: Backup atualizado";
    statusEl.setAttribute("data-pending", String(status.pending));
  }
}

export function mount(container) {
  container.innerHTML = `
    <div class="section-header">
      <h1>Ajustes &amp; Dados</h1>
      <p class="metadata">Seus dados ficam apenas neste navegador. Exporte um arquivo para transferi-los a outro dispositivo.</p>
    </div>
    <section aria-labelledby="data-heading">
      <h2 id="data-heading">Dados</h2>
      <p>Exporte todos os seus dados (estudos bíblicos, notas de apologética, orações e favoritos) em um arquivo JSON, ou restaure a partir de um arquivo exportado anteriormente. A importação substitui os dados atuais.</p>
      <div class="data-actions">
        <button id="export-data" class="button" type="button">Exportar backup</button>
        <label class="button secondary" for="import-data">Importar backup</label>
        <input id="import-data" type="file" accept=".json,application/json" hidden>
      </div>
      <p id="backup-last" class="metadata" aria-live="polite"></p>
      <p id="backup-status" class="metadata" aria-live="polite"></p>
      <p id="data-status" class="metadata" aria-live="polite"></p>
      <p class="metadata">O backup automático tenta atualizar o arquivo escolhido quando você sai do app (se o navegador permitir). Caso contrário, o status ficará como pendente até o próximo export manual.</p>
    </section>
    <section aria-labelledby="app-heading" class="settings-section">
      <h2 id="app-heading">Aplicativo</h2>
      <div class="data-actions" id="install-area" hidden>
        <button id="install-app" class="button secondary" type="button">Instalar aplicativo</button>
        <span class="metadata">Permite abrir o Cátedra offline, como aplicativo.</span>
      </div>
    </section>
    <section aria-labelledby="danger-heading" class="settings-section">
      <h2 id="danger-heading">Zona de risco</h2>
      <p>Apaga permanentemente todos os estudos bíblicos, notas de apologética, orações e favoritos deste navegador. Se deseja guardar uma cópia, exporte seus dados antes.</p>
      <div class="data-actions">
        <button id="clear-data" class="button danger" type="button">Excluir todos os dados</button>
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

  renderBackupInfo(container);

  container.querySelector("#export-data").addEventListener("click", async () => {
    const result = await exportBackup();
    if (result && result.aborted) {
      status.textContent = "Exportação cancelada.";
    } else if (result && result.ok) {
      status.textContent = result.method === "handle" ? "Backup salvo no arquivo escolhido." : "Arquivo de backup gerado.";
    } else {
      status.textContent = "Arquivo de backup gerado.";
    }
    renderBackupInfo(container);
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    let text;
    try {
      text = await file.text();
    } catch {
      status.textContent = "Não foi possível ler o arquivo.";
      fileInput.value = "";
      return;
    }

    const backup = parseBackup(text);
    if (!backup) {
      status.textContent = "Arquivo inválido. Use um arquivo JSON exportado pelo Cátedra.";
      fileInput.value = "";
      return;
    }

    if (!confirm("A importação substituirá todos os seus dados atuais. Continuar?")) {
      fileInput.value = "";
      return;
    }

    // Optional: offer to export current state before replace (keep pending handling)
    // We keep current data safe until confirmed; parse already validated.

    applyBackup(backup);
    status.textContent = "Dados importados com sucesso.";
    fileInput.value = "";
    renderBackupInfo(container);
  });

  container.querySelector("#clear-data").addEventListener("click", () => {
    if (!confirm("Excluir TODOS os dados (estudos, notas e favoritos)? Esta ação não pode ser desfeita.")) {
      return;
    }
    clearAllNotes();
    replaceFavorites([]);
    status.textContent = "Todos os dados foram apagados.";
    renderBackupInfo(container);
    // Try to reflect pending state after clear
  });

  // Keep status live when data changes elsewhere or after auto-backup attempts
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") renderBackupInfo(container);
    });
    // Also update after pagehide/tryAutoBackup
    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", async () => {
        await tryAutoBackup();
      });
    }
  }
}
