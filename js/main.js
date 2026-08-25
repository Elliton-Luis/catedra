const app = document.querySelector("#app");

function render() {
  app.innerHTML = `
    <a class="skip-link" href="#content">Skip to content</a>
    <header class="site-header">
      <div class="site-header-inner">
        <span class="brand">Study Notebook</span>
        <nav aria-label="Main navigation">
          <ul class="site-nav">
            <li><a href="#scriptures">Scriptures</a></li>
            <li><a href="#apologetics">Apologetics</a></li>
            <li><a href="#favorites">Favorites</a></li>
            <li><a href="#settings">Settings &amp; Data</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main id="content" class="page">
      <div class="section-header">
        <h1>Study Notebook</h1>
        <p class="metadata">A quiet place for Scripture study and apologetics.</p>
      </div>
      <section class="empty-state" aria-label="No content yet">
        <p>Nothing here yet.</p>
        <p class="metadata">Your studies will appear here in future sections.</p>
      </section>
    </main>
  `;
}

render();
