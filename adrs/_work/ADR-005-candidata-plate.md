# Ficha — Plate

Verificado em: 2026-09-19

Convenção de links: `MD@53.3.12` = `https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/` (commit `gitHead` publicado no npm para `@platejs/markdown@53.3.12`; a tag [`@platejs/markdown@53.3.12`](https://github.com/udecode/plate/tree/%40platejs/markdown%4053.3.12) existe). `CORE@v53.3.14` = `https://github.com/udecode/plate/blob/v53.3.14/packages/core/src/`. Os trechos citados foram lidos no código-fonte nesses commits e conferidos contra o `dist/` dos tarballs publicados (baixados com `npm pack`, sem instalar).

## Identificação

- Pacotes e versão estável (`npm view`, dist-tag `latest`):
  - `platejs` **53.3.14**, publicado 2026-09-19T10:08Z. [npm](https://www.npmjs.com/package/platejs/v/53.3.14). Reexporta `@platejs/core` 53.3.14, `@platejs/slate` 53.3.10, `@platejs/utils` 53.3.14.
  - `@platejs/markdown` **53.3.12**, publicado 2026-09-06T18:46Z. [npm](https://www.npmjs.com/package/@platejs/markdown/v/53.3.12).
  - `@platejs/suggestion` 53.2.3 (2026-06-27), `@platejs/comment` 53.0.0, `@platejs/callout` 53.0.0, `@platejs/toggle` 53.0.0, `@platejs/table` 53.0.9, `@platejs/link` 53.3.5, `@platejs/code-block` 53.0.0, `@platejs/list` 53.3.13, `@platejs/basic-nodes` 53.0.0, `@platejs/footnote` 53.0.0, `@platejs/diff` 53.0.0.
  - Existe `54.0.0-beta.1` (dist-tag `beta`, 2026-06-17). Fora do escopo: a ficha avalia só a linha 53.
- Repositório: [github.com/udecode/plate](https://github.com/udecode/plate). Monorepo com 49 pacotes em `packages/` na tag v53.3.14.
- Base: **Slate** (`slate` 0.126.2, `slate-react` 0.126.4, `slate-dom` 0.126.0, dependências fixas de `@platejs/core`). O modelo interno é JSON do Slate, não mdast.
- Pipeline Markdown: `unified` 11 + `remark-parse` 11 + `remark-stringify` 11 (mdast). Conversão mdast ↔ Slate por tabela de `rules`. `marked` 15 entra só no modo `memoize` (`parseMarkdownBlocks`). `remark-gfm` **não** é dependência (só devDependency). O app precisa adicionar `remark-gfm` 4 em `remarkPlugins` ([package.json publicado, linhas 47-67](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/package.json#L47-L67)).
- Lançamentos desde 2026-09-18:
  - [`v53.3.14`](https://github.com/udecode/plate/releases/tag/v53.3.14), 2026-09-19. Patch de `@platejs/core`: "Keep HTML element transforms in their source document during DOCX paste" (PR [#5131](https://github.com/udecode/plate/pull/5131)), conforme [CHANGELOG do core](https://github.com/udecode/plate/blob/main/packages/core/CHANGELOG.md). Não toca Markdown.
  - [`v53.3.13`](https://github.com/udecode/plate/releases/tag/v53.3.13), 2026-09-17 (antes da data de corte, `@platejs/list`).
  - `@platejs/markdown` sem lançamento desde 2026-09-06. A seção 7.3 do ADR 002 cita "Plate 53.3", o que continua correto no major/minor.

## Licença

| Pacote | Versão | Licença | Fonte |
| --- | --- | --- | --- |
| `platejs` | 53.3.14 | MIT | `npm view platejs@53.3.14 license` |
| `@platejs/core` | 53.3.14 | MIT | `npm view` |
| `@platejs/slate` | 53.3.10 | MIT | `npm view` |
| `@platejs/utils` | 53.3.14 | MIT | `npm view` |
| `@platejs/markdown` | 53.3.12 | MIT | `npm view` |
| `@platejs/date` (dep. de markdown) | 53.0.0 | MIT | `npm view` |
| `@platejs/suggestion` | 53.2.3 | MIT | `npm view` |
| `@platejs/diff` (dep. de suggestion) | 53.0.0 | **sem campo `license` no npm**. LICENSE do tarball: MIT + Apache-2.0 | ver nota |
| `@platejs/comment`, `callout`, `toggle`, `table`, `link`, `code-block`, `list`, `basic-nodes`, `footnote`, `indent`, `resizable`, `combobox` | 53.x | MIT | `npm view` |
| `slate`, `slate-react`, `slate-dom`, `slate-hyperscript` | 0.126.2 / 0.126.4 / 0.126.0 / 0.125.0 | MIT | `npm view` |
| `unified` 11.0.5, `remark-parse` 11, `remark-stringify` 11, `remark-mdx` 3.1.x, `mdast-util-mdx` 3.0.0, `mdast-util-math` 3.0.0, `unist-util-visit` 5.0.0, `marked` 15.0.12 | idem | MIT | `npm view` |
| `jotai` 2.8.x, `jotai-x` 2.3.4, `jotai-optics` 0.4.0, `optics-ts` 2.4.1, `zustand` 5, `zustand-x` 6.2.1, `nanoid` 5, `lodash`, `clsx` 2, `is-hotkey`, `use-deep-compare`, `ts-essentials` 10.1.0, `react-compiler-runtime` 1, `direction`, `tiny-invariant` 1.3.1, `scroll-into-view-if-needed`, `is-plain-object` 5, `diff-match-patch-ts`, `@udecode/utils` / `react-utils` / `react-hotkeys` 52.x | idem | MIT | `npm view` |
| `@juggle/resize-observer` (dep. de `slate-react`) | 3.x | Apache-2.0 | `npm view` |
| Repositório (inclui o registry de UI shadcn em `apps/www/src/registry/ui/`) | v53.3.14 | MIT | [LICENSE](https://github.com/udecode/plate/blob/v53.3.14/LICENSE) |

Notas:

- `@platejs/diff`: `npm view @platejs/diff license` devolve vazio. O arquivo `LICENSE` do tarball 53.0.0 diz: "Changes introduced by "@platejs/diff" are dual-licensed under the same Apache License 2.0 as `slate-diff`, in addition to the following MIT License". Ambas permissivas. Entra só se `@platejs/suggestion` for usado.
- Nenhuma GPL/AGPL/BSL/SSPL/MPL encontrada nas dependências diretas e nas transitivas de primeiro e segundo nível listadas acima. Transitivas mais profundas de `remark-*`/`micromark-*` (ecossistema unified, MIT) não foram listadas uma a uma.
- Nenhum pacote executa `postinstall` que baixa binário nem build nativo: não verificado campo a campo (ver "Não verificado").
- **Recursos pagos.** [Plate Plus](https://pro.platejs.org/) é pago (Personal €299, Teams €799, pagamento único). A tabela de recursos da página tem a linha "Plugins | All plugins" na coluna Free. O FAQ diz: "Note: This is source code you integrate into your project, not a hosted service or npm package." O que é pago são componentes de UI e templates (AI, discussão flutuante, sidebar flutuante, menu de blocos premium, link "Notion-like" com busca de páginas internas, export HTML/PDF/imagem, Version History com "Revisions, Compare, Sidebar, Restore"). A página usa ícones para marcar Free/Plus em cada linha, e o texto extraído não permite atribuir cada item com certeza.
- Funções exigidas pelo DokDraw e onde estão:

| Função exigida | Pacote/componente livre (MIT) | Depende de pago? |
| --- | --- | --- |
| Callout | `@platejs/callout`; UI `callout-node.tsx` no registry livre | Não. Mas a regra Markdown nativa emite MDX (ver Riscos) |
| Toggle / `fold` | `@platejs/toggle` (baseado em indent) | Não. Não há regra Markdown nativa para `toggle` em `defaultRules` |
| Tabela GFM | `@platejs/table`; UI `table-node.tsx` livre | Não |
| Link | `@platejs/link`; UI `link-node.tsx`, `link-toolbar.tsx` livres | Autocomplete "Search the internal pages" aparece na linha Link da página Plus. Para `dok:page` o autocomplete é do adaptador (D-3) de qualquer forma |
| Código | `@platejs/code-block` | Não |
| Lista de tarefas | `@platejs/list` (`checked`) | Não |
| Nota de rodapé | `@platejs/footnote` + regras `footnoteDefinition`/`footnoteReference` | Não |
| Colar | `ParserPlugin` do core + `MarkdownPlugin.parser` | Não |
| Somente leitura | prop `readOnly` do core | Não |
| Comentários | `@platejs/comment`; UI `comment-node.tsx` livre | Discussão/sidebar flutuante e integração de backend estão no Plus |
| Sugestão | `@platejs/suggestion`; UI `suggestion-node.tsx`, `block-suggestion.tsx` livres | A doc da sugestão remete a "Plate Plus" para recursos de discussão pro |
| Histórico/compare de versões | `@platejs/diff` (livre) | A UI "Version History" é Plus. O DokDraw faz E-10/E-11 fora do editor (D-4) |

Nenhuma função eliminatória (E-01 a E-07) depende de recurso pago.

## Critérios

| Critério | Nota | Evidência (link ou trecho) | Dias se C | Observação |
| --- | --- | --- | --- | --- |
| E-01 Round-trip | **?** (base C) | Caminho viável: `mdastToSlate` e `convertNodesSerialize` são exportados ([dist exports](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/index.ts)); `remarkStringifyOptions` é espalhado depois dos defaults ([serializeMd.ts#L41-L46](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/serializer/serializeMd.ts#L41-L46): `emphasis: '_', resourceLink: false, ...mergedOptions?.remarkStringifyOptions`), então as opções canônicas do harness são alcançáveis. Ameaças com fonte: nó mdast sem regra é descartado em silêncio ([convertNodesDeserialize.ts#L41-L47](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/deserializer/convertNodesDeserialize.ts#L41-L47): `return [];`), nó Slate sem regra só gera `console.warn` ([convertNodesSerialize.ts#L128](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/serializer/convertNodesSerialize.ts#L128): `unreachable(node)`); `htmlToJsx` reescreve o texto antes do parse se `withoutMdx` não for passado ([deserializeMd.ts#L63](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/deserializer/deserializeMd.ts#L63)); não há regra para `yaml`, `definition`, `linkReference`, `imageReference` em `defaultRules` | 3 a 4 | Regras para 5 diretivas + frontmatter fora do editor + checagem de nó perdido. Só o spike prova 30/30 |
| E-02 Modo fonte / `<Tabs>` / `Hora:agora` | P | O parse do Plate só conhece a sintaxe que os `remarkPlugins` injetam; default `remarkPlugins: []` ([MarkdownPlugin.ts#L97](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/MarkdownPlugin.ts#L97)). Sem `remarkMdx`, `<Tabs>` vira nó `html` e a regra nativa transforma em texto ([defaultRules.ts#L500-L504](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/rules/defaultRules.ts#L500-L504)). Com o plugin flow-only (Q-A), `Hora:agora` fica texto | 0,5 | O "save retorna erro" depende de o texto do modo fonte ir para `validateDok` antes de qualquer `deserialize`. Se passar pelo Plate primeiro, `<script>` vira texto escapado e o erro some. Regra do adaptador, verificar no spike |
| E-03 Inserir diagrama pela UI | C | Elemento void por `node: { isElement, isVoid, component }` ([doc PlatePlugin](https://platejs.org/docs/api/core/plate-plugin)); serializer por tipo Plate devolvendo `leafDirective` ([convertNodesSerialize.ts#L104](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/serializer/convertNodesSerialize.ts#L104): `let key = getPluginKey(editor, node.type) ?? node.type;`) | 1 | Forma exata da fixture 23 depende do `directiveToMarkdown` flow-only do harness e do `normalizeDok`. Spike |
| E-04 Sem eval / sem compilar MDX | N | `grep -rn "new Function\|eval("` nos `dist/` de `@platejs/markdown` 53.3.12, `@platejs/core` 53.3.14, `platejs` 53.3.14, `@platejs/suggestion` 53.2.3 e `@platejs/diff` 53.0.0: zero ocorrências. `remark-mdx` só roda se o app o colocar em `remarkPlugins` (default `[]`, MarkdownPlugin.ts#L97). `htmlToJsx` é `String.replace` com regex ([htmlToJsx.ts](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/deserializer/utils/htmlToJsx.ts)), não avaliação | — | `remark-mdx` e `mdast-util-mdx` continuam como dependências estáticas importadas no topo do `dist/index.js` (linhas 2 e 9). Não executam sem opt-in |
| E-05 Licença permissiva | N | Tabela de licenças acima | — | `@platejs/diff` com campo vazio no npm, LICENSE MIT + Apache-2.0. `@juggle/resize-observer` Apache-2.0 |
| E-06 mdast compatível com a DokAST | P | `remark-parse` 11 usa `mdast-util-from-markdown` 2 e lê `self.data('micromarkExtensions')`/`self.data('fromMarkdownExtensions')` ([remark-parse 11 lib/index.js#L34-L40](https://unpkg.com/remark-parse@11.0.0/lib/index.js)). `mdastToSlate(root, options)` aceita uma árvore mdast pronta, então o adaptador pode receber a DokAST de `parseDok` sem passar pelo parser do Plate | (incluso em E-01) | Internamente o documento é JSON do Slate. "Sem perda" depende de haver regra para todo tipo mdast da DokAST. Spike |
| E-07 Rota lazy no TanStack Start, sem erro de hidratação | ? | Doc RSC: "Do not import `platejs/react` or `@platejs/*/react` from a Server Component" ([platejs.org/docs/installation/rsc](https://platejs.org/docs/installation/rsc)). Doc de instalação cita React para "Vite, React Router, and other client-side apps" ([platejs.org/docs/installation](https://platejs.org/docs/installation)) | — | Nenhuma evidência publicada de uso com TanStack Start. Spike |
| E-10 Diff textual | X (fora do editor) | Nenhuma API de diff de texto Markdown encontrada nos 49 pacotes | — | Implementado fora do editor (D-4). Não discrimina |
| E-11 Diff renderizado | P | `@platejs/diff` `computeDiff(prev, curr, { isInline, lineBreakChar })` gera documento Slate com inserções/remoções, exemplo oficial [Version History](https://platejs.org/docs/examples/version-history) | — | O DokDraw renderiza pela fatia `read` (D-4). Só registro |
| E-12 Comentário por faixa de linhas | X (fora do editor) | `@platejs/comment` ancora por marca em texto Slate, não por linha do DokMD; a regra Markdown nativa serializa a marca como `mdxJsxTextElement` `comment` ([defaultRules.ts#L296-L319](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/rules/defaultRules.ts#L296-L319)) | — | Ancoragem fica em `<RevisionView>` (D-4). Marca de comentário não pode chegar ao save |
| E-13 Somente leitura e indicador | N | `Plate` `readOnly`: "Store-level read-only state. Defaults to `editor.dom.readOnly`"; `PlateContent` `readOnly`: "Overrides the store read-only value and syncs it back to the store"; `disabled`: "Forces read-only state and sets `aria-disabled`" ([platejs.org/docs/api/core/plate-components](https://platejs.org/docs/api/core/plate-components)) | 0,5 | Read-only é do Slate (`contenteditable=false`), não CSS. O banner de `changes_requested` é componente próprio acima do editor (`render.aboveEditable` na API de plugin) |

## Perguntas obrigatórias

### Q-A Só diretivas de bloco

Resposta: sim. A sintaxe inteira vem de plugins remark passados em `MarkdownPlugin.configure({ options: { remarkPlugins } })`. Os mesmos `remarkPlugins` são aplicados no parse ([deserializeMd.ts#L54 e #L69](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/deserializer/deserializeMd.ts#L54-L69)) e no stringify ([serializeMd.ts#L41](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/serializer/serializeMd.ts#L41)). `remark-parse` 11 lê `micromarkExtensions` e `fromMarkdownExtensions` de `this.data()`, e `remark-stringify` 11 lê `toMarkdownExtensions` ([remark-stringify 11 lib/index.js#L34-L39](https://unpkg.com/remark-stringify@11.0.0/lib/index.js)). `micromark-extension-directive` 4 separa as construções por categoria (`text: {58: directiveText}`, `flow: {58: [directiveContainer, directiveLeaf]}`, [lib/syntax.js](https://unpkg.com/micromark-extension-directive@4.0.0/lib/syntax.js)). O plugin do DokDraw injeta só `{ flow: directive().flow }` e o `directiveToMarkdown` filtrado, exatamente como `adrs/ADR-002-anexos/harness/dokmd.mjs` linhas 24-31.

Alternativa mais forte: o adaptador não usa o parser do Plate. Chama `parseDok` e entrega a árvore a `mdastToSlate`, e na volta usa `convertNodesSerialize` + `serializeDok`. Aí a sintaxe mora só em `src/content-format`.

Nota: **P**. Custo: 0,5 dia. Fecha o "?" da seção 7.3 do ADR 002 ("`MarkdownPlugin` aceitar um plugin remark que injete as extensões flow-only").

### Q-B Interceptar colar e inserir árvore pronta

Resposta: sim, por dois caminhos no core.

1. Um plugin com `parser` próprio. O `ParserPlugin` percorre os plugins em ordem reversa, lê `dataTransfer.getData(mimeType)` e chama `parser.deserialize` ([ParserPlugin.ts#L10-L78](https://github.com/udecode/plate/blob/v53.3.14/packages/core/src/lib/plugins/ParserPlugin.ts#L10-L78)). O tipo `Parser` aceita `format`, `mimeTypes`, `query`, `transformData`, `deserialize`, `preInsert`, `transformFragment` ([SlatePlugin.ts#L237](https://github.com/udecode/plate/blob/v53.3.14/packages/core/src/lib/plugin/SlatePlugin.ts#L237)). O `deserialize` do DokDraw entrega o texto cru à porta `importDialect`, recebe a DokAST e devolve `mdastToSlate(dokAst, opts)`.
2. `handlers.onPaste` (tipo `DOMHandler<C, React.ClipboardEvent>`, [DOMHandlers.ts#L128](https://github.com/udecode/plate/blob/v53.3.14/packages/core/src/react/plugin/DOMHandlers.ts#L128)) com `editor.tf.insertFragment`.

Cuidados com fonte: o parser nativo do `MarkdownPlugin` recusa colagem quando há `text/html` e quando o texto é URL ([MarkdownPlugin.ts#L108-L125](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/MarkdownPlugin.ts#L108-L125)); nesse caso o HTML vai para o deserializador HTML do core. O DokDraw precisa desligar o parser nativo (`parser: null`, conforme [doc Markdown](https://platejs.org/docs/markdown): "Set to `null` to disable Markdown paste handling") e registrar o seu com prioridade sobre o de HTML. `withoutMdx` não é opção do plugin (as opções são `allowedNodes`, `disallowedNodes`, `plainMarks`, `remarkPlugins`, `remarkStringifyOptions`, `rules`, MarkdownPlugin.ts#L92-L100), então o parser nativo sempre roda `htmlToJsx`. Mais um motivo para não usá-lo.

Nota: **P** (mecanismo nativo, handler próprio). Custo: 0,5 a 1 dia. Ordem de precedência entre o parser do DokDraw e o de HTML do core: **?** no spike.

### Q-C Nó customizado sem nome preso à biblioteca

Resposta: sim. Há uma assimetria nas `rules` que define o desenho:

- Deserialize procura a regra pela chave `mdastToPlate(editor, mdastNode.type)` ([convertNodesDeserialize.ts#L39-L41](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/deserializer/convertNodesDeserialize.ts#L39-L41)). `mdastToPlate` devolve o próprio tipo mdast quando ele não está em `MDAST_TO_PLATE` ([types.ts#L329-L336](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/types.ts#L329-L336)). Logo a chave é literalmente `containerDirective` ou `leafDirective`.
- Serialize procura pela chave do **tipo Plate** do elemento (`getPluginKey(editor, node.type) ?? node.type`, convertNodesSerialize.ts#L104).
- `MdRules` aceita chave string arbitrária: `Partial<{...}> & Record<string, Nullable<AnyNodeParser>>` ([types.ts#L49](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/types.ts#L49)).

Desenho que decorre disso: um deserializer único sob `containerDirective` (e outro sob `leafDirective`) que despacha por `node.name` consultando `src/content-components/core`, e um serializer por tipo de elemento Plate que devolve `{ type: 'containerDirective', name, attributes, children }`. O componente React vem da fatia `edit`. O nome da diretiva fica no dado, não no código do Plate. O adaptador é a única camada que conhece `rules` e `createPlatePlugin`.

Nota: **C**. Custo: 2 a 3 dias para as 5 diretivas (`note/tip/caution/danger`, `tabs`/`tab`, `steps`, `diagram`), incluindo rótulo (`data.directiveLabel` no primeiro parágrafo filho, convenção do `mdast-util-directive`) e restrição de filhos (`tabs` só aceita `tab`, `steps` só uma lista ordenada) por `normalizeNode`. Que `getPluginKey(editor, undefined)` devolva `undefined` e deixe cair no tipo mdast: lido no código, confirmar no spike.

### Q-D Alternância WYSIWYG ↔ fonte

Resposta: o Plate não tem modo fonte. Nenhum dos 49 pacotes de `packages/` na tag v53.3.14 é de edição de Markdown cru (lista: ai, autoformat, basic-nodes, …, markdown, math, …, yjs; nenhum source/raw), e a [doc do Markdown](https://platejs.org/docs/markdown) não documenta um. Isso não prova inexistência de solução da comunidade. O modo fonte é o CodeMirror 6 decidido em D-5.

Reconstrução, pelo código:

- WYSIWYG → fonte: `serializeMd` ou `convertNodesSerialize` + `serializeDok` sobre o valor inteiro.
- Fonte → WYSIWYG: re-parse completo do texto e troca do valor. `editor.tf.setValue(value)` faz `replaceNodes(children, { at: [], children: true })` ([setValue.ts#L19-L22](https://github.com/udecode/plate/blob/v53.3.14/packages/core/src/lib/plugins/slate-extension/transforms/setValue.ts#L19-L22)). Atenção: se receber **string**, `setValue` a trata como HTML (`editor.api.html.deserialize`, linhas 11-14). O adaptador passa sempre o valor Slate já convertido.
- Nó desconhecido: descartado sem erro (`return []`, convertNodesDeserialize.ts#L47). Por isso o texto do modo fonte passa por `validateDok` antes de voltar ao WYSIWYG, e só volta se válido (D-1: conteúdo inválido nunca é editado no WYSIWYG).
- Estado perdido: seleção e histórico de undo após `replaceNodes`. **?** no spike.

Nota: **C**. Custo: 1 dia de cola entre CM6 e o adaptador.

### Q-E React 19, só-cliente, peso

- React 19: peer `react >=18.0.0` em `platejs` e plugins; `slate-react` 0.126.4 pede `react >=18.2.0` (`npm view`). O próprio monorepo usa `react` 19.2.4 ([package.json#L170](https://github.com/udecode/plate/blob/v53.3.14/package.json#L170)), `apps/www` 19.2.4 e o template playground 19.3.0. Nota **N**.
- Só-cliente com `React.lazy`/rota lazy no TanStack Start: **?**. A doc proíbe importar `platejs/react` em Server Component (link em E-07). Nada publicado sobre TanStack Start.
- Peso gzipped (bundlephobia, 2026-09-19, peers excluídos):

| Pacote | min | gzip |
| --- | --- | --- |
| `platejs` 53.3.14 (inclui core, slate, slate-react) | 324,9 kB | 97,0 kB |
| `@platejs/markdown` 53.3.12 (inclui `marked`, `remark-mdx`, `unified`, `remark-*`) | 448,1 kB | 133,3 kB |
| `@platejs/table` 53.0.9 | 57,4 kB | 17,3 kB |
| `@platejs/list` 53.3.13 | 15,2 kB | 5,1 kB |
| `@platejs/code-block` 53.0.0 | 13,4 kB | 5,2 kB |
| `@platejs/basic-nodes` 53.0.0 | 9,7 kB | 2,5 kB |
| `@platejs/link` 53.3.5 | 6,6 kB | 2,5 kB |
| `@platejs/suggestion` 53.2.3 (fora da v1) | 67,4 kB | 20,5 kB |

Fontes: `https://bundlephobia.com/api/size?package=<pacote>@<versão>`. Soma sem UI e sem sugestão: cerca de 263 kB gzip. É soma de medições isoladas, não medição da rota. `@platejs/markdown` declara `"sideEffects": false`, e `marked` e `remark-mdx` só são alcançados por `parseMarkdownBlocks`/`remarkMdx`. Se o tree-shaking os remove da rota: **?**, medir no spike. Não executar `remark-mdx` está confirmado. Não empacotá-lo, não.

### Q-F Modo sugestão

Resposta: plugin oficial `@platejs/suggestion` 53.2.3, MIT, com dependência `@platejs/diff` (MIT + Apache-2.0). A [doc](https://platejs.org/docs/suggestion) descreve sugestões como marcas de texto e sugestões de bloco, com componentes livres `SuggestionLeaf`, `BlockSuggestion`, `SuggestionToolbarButton` (arquivos `suggestion-node.tsx`, `block-suggestion.tsx`, `suggestion-toolbar-button.tsx` no registry MIT do repositório). A doc remete a "Plate Plus" para recursos de discussão pro. API de aceitar/rejeitar não foi confirmada na doc lida. A regra Markdown nativa serializa a marca de sugestão como `mdxJsxTextElement` `suggestion` ([defaultRules.ts#L917-L943](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/rules/defaultRules.ts#L917-L943)), incompatível com DokMD. Um modo sugestão futuro precisaria guardar sugestões fora do Markdown.

Nota: **P** (só registro, D-7).

## Riscos conhecidos

1. **Perda da serialização MDX nativa.** Confirmado no código. As regras nativas de `callout`, `comment` e `suggestion` emitem MDX: `callout` serializa `{ name: 'callout', type: 'mdxJsxFlowElement' }` ([defaultRules.ts#L248-L263](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/rules/defaultRules.ts#L248-L263)), e o caminho de componente customizado é `customMdxDeserialize` para `mdxJsxFlowElement`/`mdxJsxTextElement` (convertNodesDeserialize.ts#L32-L37). Para directives, as regras são próprias. Declaração:

   ```ts
   MarkdownPlugin.configure({
     options: {
       remarkPlugins: [remarkGfm, remarkDokFlowDirectives], // sem remarkMdx
       remarkStringifyOptions: SERIALIZE_OPTIONS,            // mesmas do harness
       rules: {
         // deserialize: chave = tipo mdast (mdastToPlate cai no próprio tipo)
         containerDirective: {
           deserialize: (node, deco, options) =>
             dokEdit.fromDirective(node, convertChildrenDeserialize(node.children, deco, options)),
         },
         leafDirective: {
           deserialize: (node) => dokEdit.fromLeaf(node), // diagram → elemento void
         },
         // serialize: chave = tipo do elemento Plate
         dok_callout: {
           serialize: (el, options) => ({
             type: 'containerDirective',
             name: el.name,                 // note | tip | caution | danger
             attributes: el.attributes,
             children: [labelParagraph(el.label), ...convertNodesSerialize(el.children, options)],
           }),
         },
         dok_diagram: {
           serialize: (el) => ({
             type: 'leafDirective', name: 'diagram',
             attributes: { src: el.src, view: el.view, title: el.title },
             children: [{ type: 'text', value: el.label }],
           }),
         },
         callout: null, comment: null, suggestion: null,
       },
     },
   });
   ```

   O esboço usa só nomes exportados por `@platejs/markdown` 53.3.12 (`convertChildrenDeserialize`, `convertNodesSerialize`, `MarkdownPlugin`); `dokEdit`, `labelParagraph` e `remarkDokFlowDirectives` são do adaptador. Não foi executado. Se `null` desliga uma regra nativa, conforme `Nullable<…>` em `MdRules`, sem teste: **?**.

2. **`MarkdownPlugin` com extensões injetadas e sem `remark-mdx`.** Sim para as duas, ver Q-A. `package.json` publicado de `@platejs/markdown` 53.3.12 lista em `dependencies`: `remark-mdx` `^3.1.0`, `remark-parse` `^11.0.0`, `remark-stringify` `^11.0.0`, `unified` `^11.0.5`, `mdast-util-mdx` `3.0.0`, `mdast-util-math` `3.0.0`, `marked` `^15.0.12`, `unist-util-visit` `5.0.0`, `@platejs/date` `53.0.0`, `lodash`, `ts-essentials`, `react-compiler-runtime` (`npm view @platejs/markdown@53.3.12 dependencies`). `remark-mdx` é instalado sempre, e só é executado se estiver em `remarkPlugins`. Ponto não coberto pela seção 7.3: **`htmlToJsx` roda por default sobre o documento inteiro**, antes do parse e inclusive dentro de blocos de código, trocando `<!-- x -->` por `{/* x */}`, `class=` por `className=` e `for=` por `htmlFor=` ([htmlToJsx.ts](https://github.com/udecode/plate/blob/cee7a4ec0328718d8cf147094466b597215f5406/packages/markdown/src/lib/deserializer/utils/htmlToJsx.ts)). Só `withoutMdx: true` desliga. Afeta E-01 nas fixtures com HTML em código (07, 29, 30). Mitigação: `deserializeMd(..., { withoutMdx: true })` ou não usar o parser do Plate (Q-A, alternativa).

3. **Plugins livres e pagos.** Ver tabela em "Licença". Todos os pacotes npm necessários são MIT. O que é pago são componentes de UI e templates distribuídos como código-fonte. Nenhuma função exigida só existe em recurso pago. Dois pontos de fronteira: autocomplete de páginas internas no link ("Search the internal pages" na linha Link da página Plus) e UI de Version History. Os dois o DokDraw faz fora do Plate (D-3, D-4).

4. **Sem modo fonte nativo.** Confirmado no limite da evidência (Q-D). CM6 externo, re-parse completo, validação antes de voltar.

5. **Modo sugestão.** `@platejs/suggestion` MIT, com `@platejs/diff` MIT + Apache-2.0 (Q-F).

6. **Nó desconhecido some sem erro, nas duas direções** (convertNodesDeserialize.ts#L47 e convertNodesSerialize.ts#L128). Somado à falta de regras para `yaml`, `definition`, `linkReference` e `imageReference`, é a ameaça central de E-01. Frontmatter: fica fora do editor (o adaptador separa o YAML antes de `mdastToSlate` e recoloca na serialização) ou vira regra própria. Referências (fixture 14, `input.md`): chegam ao editor já resolvidas se o load passar por `normalizeDok`, ou caem no caminho do `importDialect` (D-2). O spike precisa de uma checagem "nenhum nó mdast sem regra" no load.

## Itens para o spike

1. E-01: 30/30 nas fixtures com o adaptador (regras de diretiva, frontmatter fora do editor, `withoutMdx: true` ou parser próprio).
2. Asserção no load: todo tipo mdast da DokAST tem regra de deserialize, e nenhum `console.warn` de `unreachable` na serialização.
3. `rules: { callout: null, comment: null, suggestion: null }` desliga as regras nativas sem efeito colateral.
4. `getPluginKey(editor, undefined)` devolve `undefined` e a chave `containerDirective` é encontrada no deserialize.
5. E-02: texto do modo fonte passa por `validateDok` antes de qualquer `deserialize`; `<Tabs>`, `<script>` e `Hora:agora` nas fixtures 29 e 30.
6. E-03: inserção pela UI gera a forma da fixture 23.
7. Q-B: precedência do parser do DokDraw sobre o deserializador HTML do core quando o clipboard tem `text/html`.
8. Q-D: seleção e histórico depois de `replaceNodes` na volta do modo fonte.
9. E-07 e Q-E: rota lazy no TanStack Start sem erro de hidratação; tamanho gzip real da rota de edição; `marked` e `remark-mdx` ausentes ou presentes no chunk; bundle da rota de leitura sem Plate (D-3).
10. Rótulo de container (`data.directiveLabel`) preservado na ida e volta.

## Não verificado

- Componentes de UI do registry shadcn (`apps/www/src/registry/ui/*`) e suas dependências (Radix, ícones, `cmdk` etc.): licença de cada dependência não auditada.
- Scripts `postinstall`/`install` de cada pacote e transitiva: não conferido campo `scripts` um a um. `@platejs/*` e `slate*` não têm dependência nativa aparente nas `dependencies` listadas.
- Transitivas profundas de `remark-*`, `micromark-*`, `mdast-util-*` (ecossistema unified): licenças não listadas uma a uma.
- API de aceitar/rejeitar sugestão no `@platejs/suggestion`.
- Atribuição exata Free/Plus de cada linha da tabela de [pro.platejs.org](https://pro.platejs.org/) (a página marca por ícone).
- Comportamento de `@platejs/toggle` para o atributo `fold` de callout: o toggle do Plate é por indent, sem regra Markdown nativa. Mapeamento de `fold` não pesquisado.
- Linha 54 (`54.0.0-beta.1`): mudanças de API não avaliadas.
- Comportamento de colar Markdown com `memoize`/`parseMarkdownBlocks` (`marked`): não usado pelo desenho proposto, não analisado.
