# Study Notebook

A lightweight, local-first notebook for personal Bible study and apologetics.
The application interface is in Portuguese and displays the name "Cátedra".

No backend, no accounts, no cloud. Everything runs in the browser and your data
stays in your browser's local storage.

## Concept

Study Notebook has two kinds of notes:

- **Scriptures** — one note per Bible chapter, identified by `book + chapter`.
  The 73 books of the Catholic Bible are pre-registered; you write the content.
- **Apologetics** — free-form notes with your own title and stable ID.
  No categories or subjects are imposed by the application.

Both are a single Markdown document and can link to each other.

## Features

- 73 books of the Catholic Bible in canonical order, grouped by category
- Chapter studies with a starter template (`book + chapter` identity)
- Free-form Apologetics notes
- Minimal Markdown editor with read/write modes
- Autosave to `localStorage`
- Wiki-style links between notes (`[[Sola Scriptura]]`, `[[Romanos 3]]`)
- Backlinks derived from note contents ("Referenced by")
- Global search (books, chapter studies and notes)
- Favorites for books, chapters and notes
- Data export/import as versioned JSON backup
- Per-note export to `.md`
- Per-note export to PDF via the browser print dialog
- Basic PWA support: installable, works offline after first load

## Screenshots

<!-- Add real screenshots here -->

## Structure

```text
study-notebook/
├── index.html              # Base HTML document
├── sw.js                   # Service worker (offline cache)
├── manifest.webmanifest    # PWA manifest
├── css/style.css           # Styles and design tokens
├── assets/                 # Icons
└── js/
    ├── main.js             # Shell, navigation and hash routing
    ├── dom.js / store.js   # Small shared helpers
    ├── notes-store.js      # localStorage persistence for all notes
    ├── markdown.js         # Safe minimal Markdown renderer
    ├── links.js            # [[wiki links]] resolution and backlinks
    ├── favorites.js        # Persistent favorites
    ├── backup.js           # JSON export/import
    ├── note-export.js      # .md download and print-to-PDF view
    ├── pwa.js              # Service worker registration, install prompt
    ├── data/bible-books.js # The 73 books (static data)
    └── views/              # One module per screen plus the shared note editor
```

## Running

Any static file server works. No build step, no dependencies.

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`. A server is required because the app uses
ES modules and registers a service worker; opening `index.html` directly via
`file://` will not load properly.

## Design

The visual intent is a quiet personal study notebook: soft warm tones,
serif typography for reading, restrained spacing and almost no decoration.
It should feel appropriate for Scripture and apologetics, not like a
productivity dashboard.

## Principles

- KISS and YAGNI: only implemented features, no speculative architecture
- SOLID without overengineering: plain modules and functions, no frameworks
- Local-first: all data lives in the user's browser
- Minimal dependencies: vanilla HTML/CSS/JavaScript only

## License

Released under the [MIT License](LICENSE). You are free to use, modify,
redistribute and reuse the software according to its terms.
