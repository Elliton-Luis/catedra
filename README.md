# Cátedra

Um aplicativo web leve e *local-first* para estudos bíblicos pessoais e notas de apologética.

O Cátedra funciona inteiramente no navegador: sem backend, sem banco de dados, sem contas, sem nuvem. Seus dados de estudo ficam com você, na sua máquina.

## Funcionalidades atuais

- Interface estática minimalista em português, montada com JavaScript vanilla
- Identidade visual calma e legível
- Seção Escrituras: navegação pelos 73 livros da Bíblia Católica em ordem canônica, com categoria, número de capítulos, autoria tradicional e data aproximada
- Seção Apologética: criação de notas livres (sem categorias impostas), edição de título e conteúdo com salvamento automático no armazenamento local do navegador, e exclusão com confirmação

## Estrutura do projeto

```text
catedra/
├── index.html      # Documento HTML base
├── css/
│   └── style.css   # Estilos base e tokens de design
├── js/
│   ├── main.js     # Ponto de entrada (shell, navegação, rotas)
│   ├── data/
│   │   └── bible-books.js  # Os 73 livros da Bíblia Católica (dados estáticos)
│   └── views/
│       ├── scriptures.js    # Visão da seção Escrituras
│       └── apologetics.js   # Notas de apologética (armazenamento e visões)
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
