export function mount(container) {
  container.innerHTML = `
    <div class="section-header">
      <h1>Ajuda</h1>
    </div>

    <section>
      <h2>O que é o Cátedra</h2>
      <p>O Cátedra é um caderno pessoal para estudo e meditação. Nele você pode:</p>
      <ul>
        <li>Estudar as Escrituras, capítulo por capítulo.</li>
        <li>Criar notas livres sobre Apologética.</li>
        <li>Guardar orações que deseja consultar.</li>
        <li>Organizar seu conhecimento com notas em Markdown.</li>
      </ul>
      <p>Todos os dados ficam armazenados apenas neste navegador. Para transferir seus dados a outro dispositivo, use a exportação disponível em <a href="#settings">Ajustes &amp; Dados</a>.</p>
    </section>

    <section>
      <h2>Escrituras</h2>
      <p>A seção Escrituras é organizada pelos livros da Bíblia. Cada capítulo é uma nota individual.</p>
      <p>Ao abrir um livro, você vê a grade de capítulos. Capítulos que já possuem anotações são destacados. Basta tocar em um capítulo para abrir sua nota.</p>
      <p>Comece escrevendo suas reflexões, observações ou estudos sobre o texto sagrado. Cada capítulo salva automaticamente.</p>
    </section>

    <section>
      <h2>Apologética</h2>
      <p>A seção Apologética é um espaço para notas livres. Você cria uma nota, dá um título e escreve em Markdown.</p>
      <p>Não há temas ou categorias predefinidas. O organizador é você, através dos títulos e conteúdos das suas notas.</p>
    </section>

    <section>
      <h2>Orações</h2>
      <p>A seção Orações funciona como a de Apologética, mas destinada a guardar orações: o Ato de Contrição, uma oração que encontrou, uma oração pessoal, entre outras.</p>
      <p>Novamente, sem categorias predefinidas. Você organiza como quiser.</p>
    </section>

    <section>
      <h2>Editor</h2>
      <p>Todas as notas usam o mesmo editor. Ele possui dois modos:</p>
      <ul>
        <li><strong>Escrever</strong> — para digitar Markdown diretamente.</li>
        <li><strong>Ler</strong> — para visualizar o conteúdo formatado.</li>
      </ul>
      <p>Tudo é salvo automaticamente. Não há botão de salvar.</p>
    </section>

    <section>
      <h2>Markdown</h2>
      <p>O editor aceita Markdown. Sintaxe básica:</p>
      <ul>
        <li><code># Título</code> até <code>###### Título</code> — títulos.</li>
        <li><code>**negrito**</code> — <strong>negrito</strong>.</li>
        <li><code>*itálico*</code> — <em>itálico</em>.</li>
        <li><code>\`código\`</code> — código inline.</li>
        <li><code>- item</code> — lista não ordenada.</li>
        <li><code>1. item</code> — lista ordenada.</li>
        <li><code>> citação</code> — bloco de citação.</li>
        <li><code>~~~</code> — bloco de código.</li>
        <li><code>[texto](url)</code> — link externo.</li>
      </ul>
    </section>

    <section>
      <h2>Links internos</h2>
      <p>Para conectar suas notas entre si, use links internos com colchetes duplos:</p>
      <ul>
        <li><code>[[Nome da nota]]</code></li>
      </ul>
      <p>Se existir uma nota com esse título, o link será resolvido automaticamente. Caso contrário, aparecerá como texto tracejado.</p>
      <p>As notas também mostram <em>backlinks</em> — uma lista de outras notas que fazem referência a ela.</p>
    </section>

    <section>
      <h2>Favoritos</h2>
      <p>Na parte inferior de cada nota, há um botão ☆ para favoritar. Os favoritos aparecem na seção <a href="#favorites">Favoritos</a>, onde podem ser buscados e filtrados.</p>
      <p>É possível favoritar livros, estudos bíblicos, notas de Apologética e orações.</p>
    </section>

    <section>
      <h2>Busca</h2>
      <p>A <a href="#search">Busca</a> encontra conteúdo nos títulos e no corpo de todas as notas, além de livros bíblicos. Os resultados mostram o tipo de conteúdo encontrado.</p>
    </section>

    <section>
      <h2>Exportação e importação</h2>
      <p>Em <a href="#settings">Ajustes &amp; Dados</a> você pode:</p>
      <ul>
        <li><strong>Exportar dados</strong> — gera um arquivo JSON com todos os seus estudos, notas e favoritos.</li>
        <li><strong>Importar dados</strong> — restaura a partir de um arquivo exportado anteriormente.</li>
      </ul>
      <p>Cada nota individual também pode ser exportada como Markdown (.md) ou impressa como PDF.</p>
      <p>A importação substitui os dados atuais. Faça um backup antes de importar.</p>
    </section>

    <section>
      <h2>Offline</h2>
      <p>O Cátedra funciona sem conexão com a internet. O conteúdo do aplicativo é armazenado no dispositivo, e os dados ficam no navegador.</p>
      <p>Se o seu navegador permitir, você pode instalar o Cátedra como aplicativo para acesso rápido pela tela inicial.</p>
    </section>
  `;
}
