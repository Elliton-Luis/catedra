# Study Notebook

A lightweight, local-first web application for personal Bible studies and apologetics notes.

Study Notebook runs entirely in the browser: no backend, no database, no accounts, no cloud. Your study data stays with you, on your machine.

## Current features

- Minimal static interface mounted with vanilla JavaScript
- Calm, readable visual foundation

## Project structure

```text
study-notebook/
├── index.html      # Base HTML document
├── css/
│   └── style.css   # Base styles and design tokens
├── js/
│   └── main.js     # Application entry point (mounting)
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
