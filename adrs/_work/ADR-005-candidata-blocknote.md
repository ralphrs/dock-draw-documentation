# Ficha — BlockNote (ficha de eliminação)

Verificado em: 2026-09-19

Escopo: ficha de eliminação (D-5 do escopo). BlockNote não vai para o spike S-1. A ficha registra a evidência atual e declara onde ela confirma ou não a eliminação.

## Identificação

- Pacotes: `@blocknote/core` 0.54.2, `@blocknote/react` 0.54.2. Publicação: 2026-09-09 (`npm view @blocknote/core time`).
- npm: <https://www.npmjs.com/package/@blocknote/core>, <https://www.npmjs.com/package/@blocknote/react>
- Repositório na tag: <https://github.com/TypeCellOS/BlockNote/tree/v0.54.2>
- Base: Tiptap 3 sobre ProseMirror. `@blocknote/core` depende de `@tiptap/core ^3.29.2`, `@tiptap/pm ^3.29.2` e `prosemirror-*` (`npm view @blocknote/core dependencies`).
- Pipeline Markdown: **parser e serializador próprios, via HTML**. Sem mdast, sem remark, sem marked. Markdown → HTML → blocos: `markdownToBlocks` chama `markdownToHTML` e depois `HTMLToBlocks` ([parseMarkdown.ts:16-24](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/api/parsers/markdown/parseMarkdown.ts#L16-L24)). O conversor se descreve como "Replaces the unified/remark/rehype pipeline with a direct, minimal implementation" ([markdownToHtml.ts:3-6](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/api/parsers/markdown/markdownToHtml.ts#L3-L6)). Blocos → HTML externo → Markdown por serializador DOM próprio ([htmlToMarkdown.ts:1-8](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/api/exporters/markdown/htmlToMarkdown.ts#L1-L8)). A troca do unified pelo parser próprio entrou na 0.51.0, 2026-05-14 ([CHANGELOG.md:236](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/CHANGELOG.md?plain=1#L236), PR [#2624](https://github.com/TypeCellOS/BlockNote/pull/2624)).
- Lançamentos desde 2026-09-18: nenhum. Última versão 0.54.2, de 2026-09-09 (`npm view @blocknote/core time`). A pesquisa anterior (`insumos/pesquisa-editores-wiki.md`) é anterior à troca do unified e está desatualizada nesse ponto.

## Licença

| Pacote | Versão | Licença | Fonte |
| --- | --- | --- | --- |
| `@blocknote/core` | 0.54.2 | MPL-2.0 | `npm view @blocknote/core license` |
| `@blocknote/react` | 0.54.2 | MPL-2.0 | `npm view @blocknote/react license` |
| `@blocknote/shadcn` | 0.54.2 | MPL-2.0 | `npm view @blocknote/shadcn license` |
| `@blocknote/server-util` | 0.54.2 | MPL-2.0 | `npm view @blocknote/server-util license` |
| `@blocknote/xl-ai` | 0.54.2 | GPL-3.0 OR PROPRIETARY | `npm view @blocknote/xl-ai license` |
| `@blocknote/xl-multi-column` | 0.54.2 | GPL-3.0 OR PROPRIETARY | `npm view @blocknote/xl-multi-column license` |
| `@blocknote/xl-docx-exporter` | 0.54.2 | GPL-3.0 OR PROPRIETARY | `npm view @blocknote/xl-docx-exporter license` |
| `@blocknote/xl-pdf-exporter` | 0.54.2 | GPL-3.0 OR PROPRIETARY | `npm view @blocknote/xl-pdf-exporter license` |
| `@tiptap/core`, `@tiptap/pm` (transitivas) | ^3.29.2 | MIT | ver ficha do Tiptap |

Notas:
- O [LICENSE.txt na tag](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/LICENSE.txt) diz: o código é MPL-2.0 "except for the XL packages", e os `@blocknote/xl-*` são "licensed under the GNU General Public License Version 3 (GPL-3.0). Additionally, a commercial license is available."
- MPL-2.0 no núcleo exige nota (briefing): alteração em arquivo do BlockNote obriga publicar o arquivo alterado. Uso sem modificar não obriga nada.
- Funções exigidas que dependem de XL: nenhuma. Os XL cobrem IA, multi-coluna e exportadores PDF, DOCX, ODT, e-mail e Typst ([Format Interoperability](https://www.blocknotejs.org/docs/foundations/supported-formats), coluna "Pro Only"). Nenhum é eliminatório do 005. Exportação é do ADR 010 e, se usasse esses pacotes, cairia em GPL ou licença comercial.

## Critérios

| Critério | Nota | Evidência (link ou trecho) | Dias se C | Observação |
| --- | --- | --- | --- | --- |
| E-01 Round-trip | X | A documentação oficial declara a conversão com perda nos dois sentidos: "The functions to import from Markdown are considered 'lossy'; some information might be dropped" ([Markdown Import](https://www.blocknotejs.org/docs/features/import/markdown)) e o mesmo para export ([Markdown Export](https://www.blocknotejs.org/docs/features/export/markdown)). O parser "covers the common subset (CommonMark + GFM basics: headings, paragraphs, lists, task lists, tables, code, blockquotes, links, images, emphasis, strikethrough, hard breaks)": sem rodapé, sem frontmatter, sem diretivas. "If BlockNote doesn't recognize a symbol, it will parse it as text." O serializador só trata as tags da lista em [htmlToMarkdown.ts:60-103](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/api/exporters/markdown/htmlToMarkdown.ts#L60-L103). | — | O caminho nativo falha por documentação. O desvio (conversor próprio mdast ↔ blocos) esbarra no modelo de blocos, ver E-06. |
| E-02 HTML e text directive | ? | O parser não conhece diretivas, então `Hora:agora` fica texto. HTML no Markdown: não verificado no `markdownToHtml.ts`. | — | Não avaliado (eliminada por E-01). |
| E-03 Inserir diagrama | X | O Markdown sai de HTML externo por um serializador com lista fechada de tags ([htmlToMarkdown.ts:60-103](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/api/exporters/markdown/htmlToMarkdown.ts#L60-L103)). Não há gancho para emitir `::diagram[…]{…}`. | — | Só com conversor próprio (E-06). |
| E-04 Sem avaliar código | ? | Não verificado. | — | Não avaliado (eliminada por E-01). |
| E-05 Licença | N com nota | MPL-2.0 no núcleo, XL em GPL-3.0 ou comercial, nenhum XL exigido. | — | Nota MPL-2.0 exigida pelo briefing. |
| E-06 mdast | X | Não produz nem consome mdast (pipeline acima, sem unified desde a 0.51.0). A conversão oficial para Markdown é declarada "lossy" e o único formato sem perda é o JSON de blocos: "It's recommended to use BlockNote JSON (`editor.document`) for storing your documents, as it's the most durable format & guaranteed to be lossless" ([Format Interoperability](https://www.blocknotejs.org/docs/foundations/supported-formats)). | — | Contorno não documentado: conversor próprio mdast ↔ blocos. Todo bloco tem `children: Block[]` ([document-structure.mdx:32-46](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/docs/content/docs/foundations/document-structure.mdx?plain=1#L32-L46)), o que permitiria simular `note`/`tab` como bloco com rótulo inline e filhos. O bloco customizado só aceita `content: "inline" \| "plain" \| "none"` ([custom-blocks.mdx:57](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/docs/content/docs/features/custom-schemas/custom-blocks.mdx?plain=1#L57)), e os filhos aparecem como recuo, não como caixa. Viabilidade e dias: não estimados. Se o conversor fosse considerado, E-06 viraria C, como no Tiptap. |
| E-07 Rota lazy | ? | Peer `react ^18.0 \|\| ^19.0` (`npm view @blocknote/react peerDependencies`). Lazy no TanStack Start não verificado. | — | Não avaliado. |
| E-10 Diff textual | — | Fora do editor (D-4). | — | Registro só. |
| E-11 Diff renderizado | — | Fora do editor (D-4). | — | Registro só. |
| E-12 Comentário ancorado | — | Fora do editor (D-4). BlockNote tem comentários nativos em `@blocknote/core/comments` (MPL-2.0), ancorados em Yjs ([comments.mdx](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/docs/content/docs/features/collaboration/comments.mdx)). | — | Registro só. |
| E-13 Somente leitura | N | Prop `editable?: boolean` em `BlockNoteView` ("Locks the editor from being editable by the user if set to `false`", [BlockNoteView.tsx:62-66](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/react/src/editor/BlockNoteView.tsx#L62-L66)) e `editor.isEditable` ([BlockNoteEditor.ts:1037-1048](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/editor/BlockNoteEditor.ts#L1037-L1048)). | — | Banner de revisão: não verificado. |

## Perguntas obrigatórias

### Q-A Só diretivas de bloco

X. O parser Markdown é código próprio fechado ([markdownToHtml.ts](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/api/parsers/markdown/markdownToHtml.ts)), sem registro de sintaxe nem extensão micromark. A documentação manda outro caminho: "If you need to handle Markdown beyond this minimal subset, parse it to HTML yourself with a parser of your choice (e.g. marked, markdown-it, or remark) and pass the resulting HTML to `tryParseHTMLToBlocks`" ([Markdown Import](https://www.blocknotejs.org/docs/features/import/markdown)). Isso faz o conteúdo passar por HTML, fora da DokAST.

### Q-B Colar com árvore pronta

N para interceptar: opção `pasteHandler({ event, editor, defaultPasteHandler })`, que recebe o `ClipboardEvent` ([BlockNoteEditor.ts:200-215](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/editor/BlockNoteEditor.ts#L200-L215)). Inserir árvore mdast: não há. O que se insere são blocos BlockNote, então depende do conversor que E-06 não tem.

### Q-C Nó sem nome preso à biblioteca

Não avaliado (eliminada por E-06). O bloco é declarado por `createReactBlockSpec` com `type`, `propSchema` e `content` ([ReactBlockSpec.tsx:130](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/react/src/schema/ReactBlockSpec.tsx#L130)).

### Q-D Alternância WYSIWYG ↔ fonte

X na forma nativa. A troca passaria por `blocksToMarkdownLossy` e `tryParseMarkdownToBlocks`, re-parse completo e declaradamente com perda ([Format Interoperability](https://www.blocknotejs.org/docs/foundations/supported-formats): "Markdown (`blocksToMarkdownLossy`) ✅ (lossy) ✅ (lossy)").

### Q-E React 19, lazy, peso

- React 19: sim, peer `react ^18.0 || ^19.0 || >= 19.0.0-rc` (`npm view @blocknote/react peerDependencies`).
- Lazy no TanStack Start: ? (não verificado).
- Peso gzipped: `@blocknote/react` 235,8 kB no chunk principal, mais chunks de 82,8 kB e 27,4 kB ([bundlephobia](https://bundlephobia.com/package/@blocknote/react@0.54.2), consultado hoje). `@blocknote/core` isolado: ? (bundlephobia devolveu 429). O número não inclui a UI (`@blocknote/shadcn` ou `@blocknote/mantine`).

### Q-F Modo sugestão

Nativo, MPL-2.0, amarrado a Yjs v14. O changelog da 0.52.0 diz: "There is also a `@blocknote/core/y` entrypoint that targets Yjs v14 (`@y/y`) and adds newer features such as suggestions and version history" ([CHANGELOG.md:157](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/CHANGELOG.md?plain=1#L157)). As marcas `y-attributed-insert`, `y-attributed-delete` e `y-attributed-format` ficam em [AttributionExtension.ts:20-25](https://github.com/TypeCellOS/BlockNote/blob/v0.54.2/packages/core/src/y/extensions/AttributionExtension.ts#L20-L25). As sugestões da IA (`insertion`, `deletion`, `modification`, via `@handlewithcare/prosemirror-suggest-changes`) ficam em `@blocknote/xl-ai`, GPL-3.0 ou comercial (`packages/xl-ai/package.json` na tag). Exige documento Yjs como fonte, o que não casa com "a fonte de verdade gravada é o texto canônico" ([LEDGER.md:162](../LEDGER.md)). Não verificado além disso.

## Riscos conhecidos

1. **Modelo de blocos próprio e Markdown com perda.** Confirmado na documentação oficial atual ([Markdown Import](https://www.blocknotejs.org/docs/features/import/markdown), [Markdown Export](https://www.blocknotejs.org/docs/features/export/markdown), [Format Interoperability](https://www.blocknotejs.org/docs/foundations/supported-formats)). A documentação recomenda guardar `JSON.stringify(editor.document)`, o formato próprio, como o único sem perda.
2. **Licença.** Núcleo MPL-2.0 (passa com nota). `@blocknote/xl-*` em "GPL-3.0 OR PROPRIETARY". Nenhuma função exigida pelo 005 depende deles. IA, multi-coluna e exportadores dependem.
3. **mdast.** Não lê nem emite mdast. Desde a 0.51.0 nem usa unified internamente. Lê e emite HTML e um Markdown próprio mínimo, e o formato sem perda é o JSON de blocos.

## Veredito da evidência

A eliminação se sustenta. E-01 recebe X pela documentação oficial ("lossy" nos dois sentidos, parser mínimo sem rodapé, frontmatter nem diretivas, símbolo desconhecido vira texto). E-06 recebe X pelo caminho nativo: sem mdast, e o formato sem perda é o JSON próprio. Ressalva: um conversor próprio mdast ↔ blocos, apoiado nos `children` aninhados, não foi descartado com evidência. Ele colocaria o BlockNote na mesma situação do Tiptap (C de custo alto), com a desvantagem de mapear para um schema de blocos fixo em vez de um schema ProseMirror livre. Nenhuma evidência atual favorece a candidata. A única mudança desde a pesquisa anterior (troca do unified por parser próprio na 0.51.0) afasta ainda mais a candidata da mdast.

## Itens para o spike

Nenhum. BlockNote está fora do spike (D-5).

## Não verificado

- Tratamento de HTML bruto no `markdownToHtml.ts` (E-02).
- Ausência de `eval` ou compilação no pipeline (E-04).
- Lazy e hidratação no TanStack Start (E-07).
- Peso de `@blocknote/core` isolado e da UI shadcn.
- Viabilidade e custo de um conversor mdast ↔ blocos que simule containers com `children` aninhados (contorno do E-06).
- Indicador de revisão sobre o modo somente leitura (E-13).
