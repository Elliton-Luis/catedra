# Study Notebook

A lightweight, local-first web application for personal Bible studies and apologetics notes.

Study Notebook runs entirely in the browser: no backend, no database, no accounts, no cloud. Your study data stays with you, on your machine.

## Current features

- Minimal static interface mounted with vanilla JavaScript
- Calm, readable visual foundation
- Scriptures section: browse the 73 books of the Catholic Bible in canonical order, with category, chapter count, traditional authorship and approximate date
- Apologetics section: create free-form notes (no imposed categories), edit title and content with automatic saving to browser local storage, and delete with confirmation

## Project structure

```text
study-notebook/
├── index.html      # Base HTML document
├── css/
│   └── style.css   # Base styles and design tokens
├── js/
│   ├── main.js     # Application entry point (shell, navigation, routing)
│   ├── data/
│   │   └── bible-books.js  # The 73 Catholic Bible books (static data)
│   └── views/
│       ├── scriptures.js    # Scriptures section view
│       └── apologetics.js   # Apologetics notes (storage and views)
├── assets/         # Static assets
└── README.md
```

## How to run

No build step or server is required. Open `index.html` directly in a browser.

Optionally, serve it locally:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Screenshots

<!-- Add screenshots here -->

## License

Distributed under the [MIT License](LICENSE).
