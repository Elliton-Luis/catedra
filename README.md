# Cátedra

Um aplicativo web leve e *local-first* para estudos bíblicos pessoais e notas de apologética.

O Cátedra funciona inteiramente no navegador: sem backend, sem banco de dados, sem contas, sem nuvem. Seus dados de estudo ficam com você, na sua máquina.

## Funcionalidades atuais

- Interface estática minimalista em português, montada com JavaScript vanilla
- Identidade visual calma e legível
- Seção Escrituras: navegação pelos 73 livros da Bíblia Católica em ordem canônica, com categoria, número de capítulos, autoria tradicional e data aproximada; notas em Markdown por capítulo (`livro + capítulo`)
- Seção Apologética: criação de notas livres (sem categorias impostas), edição de título e conteúdo com salvamento automático no armazenamento local do navegador, e exclusão com confirmação
- Editor de Markdown próprio e seguro: títulos, negrito, itálico, listas, citações, links, código e parágrafos, com alternância entre os modos "Escrever" e "Ler"
- Links internos entre notas no formato `[[Título]]` ou `[[Romanos 3]]`, além de backlinks ("Referenciada por") derivados do conteúdo existente

## Estrutura do projeto

```text
catedra/
├── index.html      # Documento HTML base
├── css/
│   └── style.css   # Estilos base e tokens de design
├── js/
│   ├── main.js     # Ponto de entrada (shell, navegação, rotas)
│   ├── dom.js      # Utilitários de DOM
│   ├── store.js    # Helpers de JSON sobre localStorage
│   ├── notes-store.js  # Persistência das notas (apologética e escrituras)
│   ├── markdown.js # Renderizador Markdown mínimo e seguro
│   ├── links.js    # Resolução de [[links]] e backlinks
│   ├── data/
│   │   └── bible-books.js  # Os 73 livros da Bíblia Católica (dados estáticos)
│   └── views/
│       ├── scriptures.js    # Visão da seção Escrituras e notas de capítulo
│       ├── apologetics.js   # Visão da seção Apologética
│       └── note-editor.js   # Editor de notas em Markdown (escrita/leitura)
├── assets/         # Arquivos estáticos
└── README.md
```

Todo o código-fonte é escrito em inglês; apenas os textos exibidos ao usuário estão em português.

## Como executar

Nenhuma etapa de build ou servidor é necessária. Abra o `index.html` diretamente no navegador.

Opcionalmente, sirva localmente:

```sh
python3 -m http.server 8080
```

E acesse `http://localhost:8080`.

## Capturas de tela

<!-- Adicione capturas de tela aqui -->

## Licença

Distribuído sob a [Licença MIT](LICENSE).
