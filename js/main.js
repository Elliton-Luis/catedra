const app = document.querySelector("#app");

function render() {
  app.innerHTML = `
    <header>
      <h1>Study Notebook</h1>
    </header>
    <main id="content"></main>
  `;
}

render();
