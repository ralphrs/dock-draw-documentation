# Ficha — Tiptap 3 (ficha de eliminação)

Verificado em: 2026-09-19

Escopo: ficha de eliminação (D-5 do escopo). Tiptap 3 não vai para o spike S-1. A ficha registra a evidência atual e declara onde ela confirma ou não a eliminação.

## Identificação

- Pacotes: `@tiptap/react` 3.31.3, `@tiptap/core` 3.31.3, `@tiptap/pm` 3.31.3, `@tiptap/markdown` 3.31.3. Publicação: 2026-09-04 (`time.modified` no registro npm para os quatro pacotes).
- npm: <https://www.npmjs.com/package/@tiptap/react>, <https://www.npmjs.com/package/@tiptap/markdown>
- Repositório na tag: <https://github.com/ueberdosis/tiptap/tree/v3.31.3>
- Base: ProseMirror (`@tiptap/pm` reexporta `prosemirror-model`, `prosemirror-view`, `prosemirror-state` etc., conferido com `npm view @tiptap/pm dependencies`).
- Pipeline Markdown: **marked**, não mdast/remark. `@tiptap/markdown` tem uma única dependência, `marked ^17.0.1` (`npm view @tiptap/markdown dependencies`), e o `MarkdownManager` importa `Lexer`, `Token` e `TokenizerExtension` de `marked` ([MarkdownManager.ts:24](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/MarkdownManager.ts#L24)). A documentação oficial diz: "This extension integrates MarkedJS as its parser" e classifica o pacote como "early release" ([Markdown Introduction](https://tiptap.dev/docs/editor/markdown)).
- Lançamentos desde 2026-09-18: nenhum. A última versão publicada é 3.31.3, de 2026-09-04 (tags `v3.31.0` a `v3.31.3` em `git ls-remote --tags https://github.com/ueberdosis/tiptap`).

## Licença

| Pacote | Versão | Licença | Fonte |
| --- | --- | --- | --- |
| `@tiptap/react` | 3.31.3 | MIT | `npm view @tiptap/react license` |
| `@tiptap/core` | 3.31.3 | MIT | `npm view @tiptap/core license` |
| `@tiptap/pm` | 3.31.3 | MIT | `npm view @tiptap/pm license` |
| `@tiptap/markdown` | 3.31.3 | MIT | `npm view @tiptap/markdown license` |
| `marked` (transitiva do Markdown) | 17.0.6 | MIT | `npm view marked@17 license` |
| `@tiptap/extension-collaboration` | 3.31.3 | MIT | `npm view @tiptap/extension-collaboration license` |
| `@tiptap/ai-toolkit` | 0.4.0 | MIT | `npm view @tiptap/ai-toolkit license` |

Recursos pagos (licença proprietária, [Pro license](https://tiptap.dev/pro-license), "non-exclusive, non-sublicensable, non-transferable"), conforme a [página de preços](https://tiptap.dev/pricing) consultada hoje:

| Função | Plano | Exigida pelo DokDraw? |
| --- | --- | --- |
| Comments | Start ($49/mês) em diante | Não. E-12 fica fora do editor (D-4) |
| Real-time Collaboration (Tiptap Cloud) | Start em diante. A extensão cliente `@tiptap/extension-collaboration` é MIT, o servidor gerenciado é pago | Não na v1 |
| Snapshot Compare (diff) | Team ($149/mês) em diante | Não. E-10 e E-11 ficam fora do editor (D-4) |
| DOCX Import/Export (Conversion) | Start em diante | Não. Exportação é do ADR 010 |
| AI Generation, AI Toolkit | AI Toolkit é "paid add-on" com preço sob consulta. O pacote público `@tiptap/ai-toolkit` (MIT) é o cliente do serviço pago ([packages/ai-toolkit/src](https://github.com/ueberdosis/tiptap/tree/v3.31.3/packages/ai-toolkit/src) contém `server-ai-toolkit-extension.ts`) | Não |
| Tracked Changes (modo sugestão) | "Tracked Changes is a paid add-on that isn't included in any plan", distribuído no "Tiptap's private npm registry" ([Tracked Changes overview](https://tiptap.dev/docs/tracked-changes/getting-started/overview)) | Não na v1 (D-7) |

Nenhuma função eliminatória (E-01 a E-07) depende de pacote pago. E-05 passa.

## Critérios

| Critério | Nota | Evidência (link ou trecho) | Dias se C | Observação |
| --- | --- | --- | --- | --- |
| E-01 Round-trip | C | O pipeline oficial não lê a sintaxe DokMD. `createBlockMarkdownSpec` só aceita `:::nome {attrs}` com espaço antes da chave e sem rótulo: regex `^:::${blockName}(?:\s+\{([^}]*)\})?\s*\n` ([createBlockMarkdownSpec.ts:124](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/core/src/utilities/markdown/createBlockMarkdownSpec.ts#L124)). `:::note[Título]{variant="x"}` não casa e cai como parágrafo. Na saída emite `:::${blockName}${attrString}` com `attrString = " {…}"` ([linha 223-226](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/core/src/utilities/markdown/createBlockMarkdownSpec.ts#L223-L226)), forma que não é container directive para `micromark-extension-directive`. Rodapé e frontmatter não existem no pacote (não há extensão de footnote nem frontmatter em `packages/` na tag). | 4–6 | Caminho viável: descartar `@tiptap/markdown` e escrever conversor ProseMirror JSON ↔ mdast sobre `parseDok`/`serializeDok` do 002. Estimativa: cerca de 20 tipos mdast (bloco, inline, GFM, 5 diretivas, footnote) em duas direções, mais testes nas 30 fixtures. O ADR 002 (7.3) estimou 3–4. Alternativa: tokenizers marked próprios, com risco de paridade com micromark que só o spike mediria. |
| E-02 HTML e text directive | C | Text directive: nenhum tokenizer inline distribuído na tag reconhece `:nome`. Os que existem são `==` (highlight, [highlight.ts:120](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/extension-highlight/src/highlight.ts#L120)), underline, math e o shortcode `[nome …]` de `createInlineMarkdownSpec` ([createInlineMarkdownSpec.ts:189-203](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/core/src/utilities/markdown/createInlineMarkdownSpec.ts#L189-L203)), usado pelo mention com `[@ …]` ([mention.ts:279-282](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/extension-mention/src/mention.ts#L279-L282)). Então `Hora:agora` continua texto, porque o marked não tem regra para `:`. HTML: no navegador, HTML reconhecido vira nó pelo schema via `generateJSON` ([MarkdownManager.ts:956-967](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/MarkdownManager.ts#L956-L967)), e tag desconhecida (`<Tabs>`) vira texto literal ([linha 956-957](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/MarkdownManager.ts#L956-L957)). | 0,5 | O modo fonte é CM6 (D-5) e o save passa por `validateDok`, que retorna o erro. O risco está no WYSIWYG: `<em>x</em>` colado vira itálico em silêncio. Com conversor mdast próprio (E-01) o problema some, porque o HTML chega como nó `html` do mdast e o adaptador recusa. |
| E-03 Inserir diagrama | C | `createAtomBlockMarkdownSpec` gera `:::${blockName} {attrs} :::` ([createAtomBlockMarkdownSpec.ts:131-136](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/core/src/utilities/markdown/createAtomBlockMarkdownSpec.ts#L131-L136)), não `::diagram[…]{…}`. | incluído no E-01 | Com conversor mdast próprio, o nó atom `diagram` vira `leafDirective` e `serializeDok` emite a forma da fixture 23. |
| E-04 Sem avaliar código | N | HTML reconhecido passa por `generateJSON`, que usa `DOMParser` e as regras `parseHTML` do schema ([MarkdownManager.ts:960-967](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/MarkdownManager.ts#L960-L967)). Não há compilação de MDX nem `eval` no pacote. | — | `DOMParser` não executa script. |
| E-05 Licença | N | Tabela de licença acima. | — | Pacotes pagos não são exigidos por nenhum eliminatório. |
| E-06 mdast | C | Não produz nem consome mdast. Tokens do marked ([MarkdownManager.ts:24](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/MarkdownManager.ts#L24)). Não há caminho oficial mdast/remark: a extensão só aceita trocar a instância de `marked` (`marked?: typeof marked`, [Extension.ts:77-86](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/Extension.ts#L77-L86)). | 4–6 (mesmo conversor do E-01) | Não é X: o conversor próprio atende a regra "converte sem perda". É C de custo alto, e nenhuma linha dele vem da biblioteca. |
| E-07 Rota lazy | ? | `@tiptap/react` declara peer `react ^19.0.0` (`npm view @tiptap/react peerDependencies`). Comportamento sob `React.lazy` no TanStack Start não verificado. | — | Não avaliado (fora do spike por D-5). |
| E-10 Diff textual | — | Fora do editor (D-4). Snapshot Compare é pago (Team). | — | Registro só. |
| E-11 Diff renderizado | — | Fora do editor (D-4). | — | Registro só. |
| E-12 Comentário ancorado | — | Fora do editor (D-4). Comments é pago (Start). | — | Registro só. |
| E-13 Somente leitura | N | Opção `editable` e `setEditable(editable, emitUpdate)` ([Editor.ts:307](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/core/src/Editor.ts#L307)), que alimenta o `editable` da `EditorView` do ProseMirror. | — | Banner de `changes_requested` é UI própria (Tiptap é headless). |

## Perguntas obrigatórias

### Q-A Só diretivas de bloco

N para "não criar text directive": o marked do Tiptap só conhece o que se registra, e nenhuma extensão distribuída registra tokenizer inline para `:nome` (ver E-02. O shortcode inline do Tiptap usa `[nome …]`). X para "aceitar extensão micromark própria": a sintaxe é registrada como tokenizer do marked (`registerTokenizer`, [MarkdownManager.ts:191, 214](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/MarkdownManager.ts#L214)), sem ponto de entrada para micromark. `micromark-extension-directive` só entra por conversor próprio (E-06).

### Q-B Colar com árvore pronta

N pela API do ProseMirror: `editorProps.handlePaste(view, event, slice)` recebe o evento, e `event.clipboardData.getData('text/plain')` entrega o texto cru. Fonte: [ProseMirror EditorProps.handlePaste](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste). A inserção da DokAST exige o conversor mdast → ProseMirror JSON do E-06.

### Q-C Nó sem nome preso à biblioteca

C. O nó é `Node.create({ name, … })` com `parseMarkdown`/`renderMarkdown` no próprio config ([createBlockMarkdownSpec.ts:43-56](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/core/src/utilities/markdown/createBlockMarkdownSpec.ts#L43-L56)). Um adaptador fino que gera o `Node` a partir da entrada `edit` do registry é possível, mas não verificado. Dias: não estimado (eliminada por custo de E-06).

### Q-D Alternância WYSIWYG ↔ fonte

Não avaliado. Tiptap não tem modo fonte nativo. Com CM6, a volta seria `setContent` do documento inteiro (re-parse completo). Perda de histórico e seleção: não verificado.

### Q-E React 19, lazy, peso

- React 19: sim, peer `react ^17 || ^18 || ^19` (`npm view @tiptap/react peerDependencies`).
- Lazy no TanStack Start: ? (não verificado).
- Peso gzipped ([bundlephobia](https://bundlephobia.com/package/@tiptap/react@3.31.3), consultado hoje): `@tiptap/react` 8,3 kB, `@tiptap/starter-kit` 105,5 kB (inclui `@tiptap/core`), `@tiptap/markdown` 18,5 kB. Soma aproximada de 132 kB, sem UI (headless) e sem o conversor próprio.

### Q-F Modo sugestão

Pago. Tracked Changes é "paid add-on that isn't included in any plan", em registro npm privado, sob licença proprietária ([Tracked Changes overview](https://tiptap.dev/docs/tracked-changes/getting-started/overview), [pricing](https://tiptap.dev/pricing), [Pro license](https://tiptap.dev/pro-license)). Não há extensão MIT oficial de track changes na tag v3.31.3 (nenhum pacote com esse nome em `packages/`).

## Riscos conhecidos

1. **marked, não mdast.** Confirmado no `package.json` publicado (`dependencies: { marked: ^17.0.1 }`) e no código ([MarkdownManager.ts:24](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/MarkdownManager.ts#L24)). Caminho oficial mdast/remark: não existe na 3.31.3. A única customização de parser é trocar a instância do marked ([Extension.ts:77-86](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/markdown/src/Extension.ts#L77-L86)). Paridade com micromark exige conversor próprio ProseMirror JSON ↔ mdast, estimado em 4–6 dias.
2. **Extensões pagas.** Comments, Snapshot Compare, DOCX, AI Toolkit e Tracked Changes são pagos (tabela de licença). Nenhuma é exigida pelos eliminatórios do 005.
3. **`createBlockMarkdownSpec` e text directives.** O helper usa sintaxe Pandoc (`:::nome {attrs}`), sem rótulo `[…]` e com espaço antes das chaves ([linha 124](https://github.com/ueberdosis/tiptap/blob/v3.31.3/packages/core/src/utilities/markdown/createBlockMarkdownSpec.ts#L124)). Ele não impede text directives por projeto: simplesmente não existe tokenizer inline para `:nome` se ninguém registrar `createInlineMarkdownSpec`. E-02 fica atendido por omissão, mas a sintaxe de bloco do DokMD não é a do helper, então o helper não serve e o tokenizer seria reescrito.

## Veredito da evidência

A eliminação se sustenta por **custo**, não por um X. Nenhum eliminatório recebeu X com evidência: E-01, E-03 e E-06 são C (conversor mdast próprio, 4–6 dias, nada aproveitado de `@tiptap/markdown`), e E-05 passa. Isso contradiz a ideia de que o Tiptap cai por um eliminatório. O motivo sustentável é outro: MDXEditor, Plate e Milkdown trabalham sobre mdast (ADR 002, 7.3), enquanto o Tiptap exige escrever do zero a ponte que os outros já têm, com UI inteira própria (headless).

## Itens para o spike

Nenhum. Tiptap está fora do spike (D-5). Se for reaberto: E-07 (lazy no TanStack Start), Q-D (alternância com CM6), custo real do conversor ProseMirror JSON ↔ mdast nas 30 fixtures.

## Não verificado

- Comportamento sob `React.lazy` e hidratação no TanStack Start (E-07).
- Perda de histórico e seleção no `setContent` da alternância (Q-D).
- Custo real do adaptador de nó a partir do registry (Q-C).
- Existência de extensão de track changes de terceiros com licença permissiva (só se registrou a oficial).
