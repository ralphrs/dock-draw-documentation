# Ficha — Milkdown (reserva)

Verificado em: 2026-09-19

Papel no ADR 005: candidata reserva. Só entra no spike se MDXEditor e Plate falharem (D-5 do escopo). Código-fonte lido no clone raso da tag `v7.22.1` (commit `bb9b3867edc535c0aea31bdd15e7110808b26324`, 2026-08-12). Links abaixo usam `G = https://github.com/Milkdown/milkdown/blob/v7.22.1/`.

## Identificação

- Pacotes: `@milkdown/kit` 7.22.1, `@milkdown/react` 7.22.1, `@milkdown/crepe` 7.22.1 (opcional). Todos publicados em 2026-08-12 (`npm view @milkdown/kit time`: `"7.22.1": "2026-08-12T12:21:53.055Z"`).
  - npm: https://www.npmjs.com/package/@milkdown/kit , https://www.npmjs.com/package/@milkdown/react , https://www.npmjs.com/package/@milkdown/crepe
  - Repositório: https://github.com/Milkdown/milkdown (tag https://github.com/Milkdown/milkdown/tree/v7.22.1)
- Base: ProseMirror (`@milkdown/prose` 7.22.1 reexporta `prosemirror-model ^1.25.4`, `prosemirror-view ^1.41.3`, `prosemirror-state ^1.4.4`, `prosemirror-tables ^1.8.1` etc., conforme `npm view @milkdown/prose dependencies`).
- Pipeline Markdown: remark/unified sobre mdast. `@milkdown/core` depende de `remark-parse ^11.0.0`, `remark-stringify ^11.0.0`, `unified ^11.0.3`. `@milkdown/transformer` depende de `remark ^15.0.1`. O processador é `unified().use(remarkParse).use(remarkStringify, options)` ([G/packages/core/src/internal-plugin/init.ts#L44-L53](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/core/src/internal-plugin/init.ts#L44-L53)). Markdown vira mdast, mdast vira doc ProseMirror pelos `parseMarkdown` de cada nó, e o caminho inverso usa `toMarkdown` de cada nó para montar mdast e chamar `remark.stringify` ([G/packages/transformer/src/parser/state.ts#L208-L218](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/parser/state.ts#L208-L218), [G/packages/transformer/src/serializer/state.ts#L357-L368](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/serializer/state.ts#L357-L368)).
- Lançamentos desde 2026-09-18: **nenhum**. Últimos: 7.22.0 (2026-08-03, minor, só features do Crepe: toolbar, slash menu, AI) e 7.22.1 (2026-08-12, patch). Changelog: [G/packages/kit/CHANGELOG.md](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/kit/CHANGELOG.md). A pesquisa antiga citava 7.21 (`insumos/pesquisa-editores-wiki.md`) e 7.22 (ADR 002, 7.3). A linha 7.22 está confirmada.

## Licença

| Pacote | Versão | Licença | Fonte |
| --- | --- | --- | --- |
| `@milkdown/kit` (e todos os `@milkdown/*` que ele puxa) | 7.22.1 | MIT | `npm view @milkdown/kit license`, [LICENSE](https://github.com/Milkdown/milkdown/blob/v7.22.1/LICENSE) |
| `@milkdown/react` | 7.22.1 | MIT | `npm view @milkdown/react license` |
| `@milkdown/crepe` | 7.22.1 | MIT | `npm view @milkdown/crepe license` |
| `@milkdown/components` (dependência direta do kit) | 7.22.1 | MIT | `npm view @milkdown/components license` |
| `remark-parse` / `remark-stringify` / `unified` | 11 / 11 / 11 | MIT | npm |
| `prosemirror-*` | ver acima | MIT | npm |
| `vue` (dependência de `@milkdown/components` e de `@milkdown/crepe`) | ^3.5.20 (hoje 3.5.43) | MIT | `npm view vue license` |
| `dompurify` (components e crepe) | ^3.2.5 (hoje 3.4.15) | `(MPL-2.0 OR Apache-2.0)` | `npm view dompurify license` |
| `katex` (só crepe) | ^0.18.0 (hoje 0.18.7) | MIT | `npm view katex@0.18.7 license` |
| `codemirror`, `@codemirror/*` (crepe; peer de components) | 6.x | MIT | `npm view codemirror license`, `npm view @codemirror/language-data license` |
| `@floating-ui/dom`, `lodash-es`, `nanoid` 6, `clsx`, `remark-math` 6, `prosemirror-virtual-cursor` | — | MIT | npm |
| `@prosemirror-adapter/react` (node views React, mesmo autor) | 0.5.5 | MIT | `npm view @prosemirror-adapter/react license` |
| `remark-directive` (se usado) / `micromark-extension-directive` / `mdast-util-directive` | 4.0.0 / ^4 / ^3 (3.1.0) | MIT | npm |

Notas:
- `dompurify` é dual `MPL-2.0 OR Apache-2.0`. A opção Apache-2.0 passa. Registrar a escolha no inventário de licenças.
- Não há recurso pago nem "Pro". O recurso AI do Crepe é opt-in (`[CrepeFeature.AI]: false`, [G/packages/crepe/src/feature/index.ts#L70-L83](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/feature/index.ts#L70-L83)) e fala com provedores LLM externos. Nenhuma função exigida depende dele.
- Nenhum `postinstall`/`install` nos `package.json` dos pacotes do monorepo na tag (grep em `packages/*/package.json` sem resultado) nem em `katex`, `vue`, `dompurify`, `@codemirror/language-data`, `lodash-es`, `nanoid` (`npm view <p> scripts.postinstall scripts.install` vazio).
- **Árvore de instalação**: `@milkdown/react` depende em runtime de `@milkdown/crepe` (`npm view @milkdown/react dependencies` → `"@milkdown/crepe": "7.22.1", "@milkdown/kit": "7.22.1"`), embora o código da integração só importe tipo de `@milkdown/crepe/builder` ([G/packages/integrations/react/src/types.ts#L1](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/integrations/react/src/types.ts#L1)). E `@milkdown/kit` depende de `@milkdown/components`, que tem `vue` como dependência (não peer). Resultado: instalar kit + react instala Vue 3, CodeMirror 6 e KaTeX mesmo sem usar Crepe. Todos MIT, sem binário. O que chega ao bundle é outra pergunta (Q-E).

## Critérios

| Critério | Nota | Evidência (link ou trecho) | Dias se C | Observação |
| --- | --- | --- | --- | --- |
| E-01 Round-trip | ? | Preset padrão transforma a árvore: `commonmark` inclui `remarkInlineLinkPlugin`, `remarkPreserveEmptyLinePlugin`, `remarkHtmlTransformer`, `remarkAddOrderInListPlugin` e `remarkMarker` (este preserva o marcador original `_`/`*` de ênfase, [remark-marker-plugin.ts#L8-L19](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/preset-commonmark/src/plugin/remark-marker-plugin.ts#L8-L19), o que pode divergir do marcador canônico do `normalizeDok`) ([G/packages/plugins/preset-commonmark/src/composed/plugins.ts#L19-L34](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/preset-commonmark/src/composed/plugins.ts#L19-L34)). Parágrafo vazio que não é o último vira `state.addNode('html', undefined, '<br />')` ([G/packages/plugins/preset-commonmark/src/node/paragraph.ts#L40-L47](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/preset-commonmark/src/node/paragraph.ts#L40-L47)). Serializer usa handlers próprios para `text` e `strong` ([G/packages/core/src/__internal__/remark-handlers.ts#L3-L28](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/core/src/__internal__/remark-handlers.ts#L3-L28)) | 1–2 para montar preset sem `remarkPreserveEmptyLinePlugin` e com nós DokMD | O `<br />` é HTML, que o DokMD proíbe: `validateDok` recusaria o save de uma página com linha vazia editada. Não carregar o plugin desliga a emissão por construção: `shouldPreserveEmptyLine` faz `ctx.get(remarkPreserveEmptyLinePlugin.id)` em `try` e devolve `false` no `catch` ([paragraph.ts#L55-L63](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/preset-commonmark/src/node/paragraph.ts#L55-L63)). O custo restante é remontar o array do preset (`plugins` é `[...].flat()`, e um `$remark` é tupla de dois plugins). Referência vira inline pelo `remark-inline-links`, o que coincide com a canonização da fixture 14 (`expected.md` já é inline). Frontmatter não tem nó no preset (ver E-06). Paridade nas 30 fixtures sem evidência publicada |
| E-02 HTML/JSX e `Hora:agora` | ? | HTML vira nó `html` inline atômico, exibido como texto: `span.textContent = node.attrs.value` ([G/packages/plugins/preset-commonmark/src/node/html.ts#L23-L31](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/preset-commonmark/src/node/html.ts#L23-L31)) e reemitido como `html` no save (L50-L55). Não há modo fonte nativo (Q-D) | 0,5 (modo fonte é CodeMirror próprio; erro vem de `validateDok`) | `<Tabs>`/`<script>` no WYSIWYG viram nó `html`, não somem. No modo fonte próprio o texto vai direto ao servidor e o save retorna o DOK-E. `Hora:agora` depende da config de directive (Q-A): com a receita oficial (`remark-directive` completo) a text directive fica ligada |
| E-03 Inserir diagrama gera `::diagram[…]{…}` | C | Serializer aceita `openNode/addNode(type, value, props)` com props arbitrárias ([G/packages/transformer/src/serializer/state.ts#L186-L189](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/serializer/state.ts#L186-L189), [#L276-L283](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/serializer/state.ts#L276-L283)). Exemplo oficial de leaf directive: `state.addNode('leafDirective', undefined, undefined, { name: 'iframe', attributes: { src } })` ([Milkdown/website docs/plugin/example-iframe-plugin.md](https://github.com/Milkdown/website/blob/e473618e71695d08367fec5ba7f68ce159c489d8/docs/plugin/example-iframe-plugin.md)) | 1 | Rótulo `[…]` exige filho `paragraph` com `data.directiveLabel: true`. A ordem de atributos é refeita por `reorderDirectiveAttributes` no `normalizeDok` (harness). Byte a byte da fixture 23 fica para o spike |
| E-04 Sem avaliação de código | N | Sem `eval`/`new Function` no código de `packages/` na tag (grep). `innerHTML` só com `DOMPurify.sanitize` ou em `<template>` inerte no paste HTML ([G/packages/plugins/plugin-clipboard/src/index.ts#L122-L127](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/plugin-clipboard/src/index.ts#L122-L127)). Nó `html` renderiza como texto (E-02) | — | Não compila MDX. KaTeX (Crepe, feature Latex) renderiza fórmula, não executa código. Preview de code block do Crepe usa `sanitizeSvg` ([G/packages/components/src/code-block/view/components/preview-panel.tsx#L99](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/components/src/code-block/view/components/preview-panel.tsx#L99)) |
| E-05 Licença | N | Tabela acima | — | Tudo MIT, `dompurify` dual com Apache-2.0 |
| E-06 mdast compatível | N | `@milkdown/core` → `remark-parse ^11.0.0` → `mdast-util-from-markdown ^2.0.0` e `@types/mdast ^4.0.0`; `remark-stringify ^11` → `mdast-util-to-markdown ^2.0.0`, `@types/mdast ^4.0.0` (`npm view remark-parse@11 dependencies`, `npm view remark-stringify@11 dependencies`). `preset-gfm` → `remark-gfm ^4.0.1` | 0,5 frontmatter | Mesma geração da DokAST. O doc ProseMirror é intermediário: o que não tiver `$node` com `parseMarkdown` lança `parserMatchError` ([G/packages/transformer/src/parser/state.ts#L66-L79](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/parser/state.ts#L66-L79)). Nó `yaml` do frontmatter não existe nos presets (grep sem resultado em `preset-*`), então é `$remark` + `$node` próprios ou frontmatter separado antes do editor |
| E-07 Rota lazy sem erro de hidratação | ? | O editor é criado em `useEffect` e renderiza só `<div data-milkdown-root>` ([G/packages/integrations/react/src/use-get-editor.ts#L18-L44](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/integrations/react/src/use-get-editor.ts#L18-L44), [editor.tsx](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/integrations/react/src/editor.tsx)) | — | Sem acesso ao DOM no render. Efeito colateral no import (CSS do Crepe, Vue) sob SSR do TanStack Start não verificado |
| E-10 Diff textual | ? | Nada nativo de diff textual Markdown | — | Implementado fora do editor (D-4) |
| E-11 Diff renderizado | P (parcial) | `@milkdown/plugin-diff` (exportado em `@milkdown/kit/plugin/diff`): `startDiffReviewCmd(modifiedMarkdown)` e `startDiffReviewFromDocCmd(newDoc)` ([G/packages/plugins/plugin-diff/src/diff-commands.ts#L31-L63](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/plugin-diff/src/diff-commands.ts#L31-L63)), `computeDocDiff` ([G/packages/plugins/plugin-diff/src/index.ts](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/plugin-diff/src/index.ts)) | — | Diff dentro do editor, não na fatia `read`. D-4 põe E-11 fora do editor, então só registra |
| E-12 Comentário por faixa de linhas | ? | Nada nativo | — | Fora do editor (D-4) |
| E-13 Somente leitura e indicador | N (read-only) / C (indicador) | Kit: `editorViewOptionsCtx` com `editable` ([docs interacting-with-editor.md, seção Readonly Mode](https://github.com/Milkdown/website/blob/e473618e71695d08367fec5ba7f68ce159c489d8/docs/guide/interacting-with-editor.md), [G/packages/core/src/internal-plugin/editor-view.ts#L35](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/core/src/internal-plugin/editor-view.ts#L35)). Crepe: `setReadonly` atualiza `editable` da `EditorView` ([G/packages/crepe/src/core/builder.ts#L146-L160](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/core/builder.ts#L146-L160)) | 0,5 | É o `editable` do ProseMirror, não CSS. O paste também respeita (`if (!editable ...) return false`, clipboard L73-L74). Banner de `changes_requested` é componente React fora do editor |

## Perguntas obrigatórias

### Q-A Desligar text directives e aceitar só bloco

Resposta: sim, por código próprio pequeno. Nota **C (0,5 dia)**.

- `$remark(id, (ctx) => plugin)` aceita qualquer plugin unified e o empilha em `remarkPluginsCtx` ([G/packages/utils/src/composable/composed/$remark.ts#L27-L45](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/utils/src/composable/composed/%24remark.ts#L27-L45)). O core aplica todos com `acc.use(plug.plugin, plug.options)` sobre o processador base ([G/packages/core/src/internal-plugin/schema.ts#L53-L61](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/core/src/internal-plugin/schema.ts#L53-L61)). Um plugin unified que empurra em `this.data('micromarkExtensions')`, `fromMarkdownExtensions` e `toMarkdownExtensions` é o mecanismo padrão do remark 11 e funciona aqui.
- O que injetar é o mesmo par do harness do ADR 002: `{ flow: directive().flow }` e `directiveToMarkdown()` com `unsafe` filtrado (`adrs/ADR-002-anexos/harness/dokmd.mjs` L24-L31).
- A receita oficial do Milkdown **não serve** ao DokMD: `$remark('remarkDirective', () => directive)` com `remark-directive` 4 ([example-iframe-plugin.md](https://github.com/Milkdown/website/blob/e473618e71695d08367fec5ba7f68ce159c489d8/docs/plugin/example-iframe-plugin.md)) liga text directives e traz a regra `unsafe` `{before: '[^:]', character: ':', after: '[A-Za-z]', inConstruct: ['phrasing']}` ([mdast-util-directive 3.1.0 lib/index.js#L113-L129](https://github.com/syntax-tree/mdast-util-directive/blob/3.1.0/lib/index.js#L113-L129)). É a falha `Hora:agora` / `dok\:page` registrada no ADR 002 (linha 43).
- Os handlers próprios do Milkdown chamam `state.safe(value, …)` para texto ([remark-handlers.ts#L14](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/core/src/__internal__/remark-handlers.ts#L14)), então o `unsafe` filtrado precisa estar ativo no stringify do editor. Verificar no spike que o `remarkStringifyOptionsCtx` não sobrescreve as extensões vindas de `this.data` ([init.ts#L40-L53](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/core/src/internal-plugin/init.ts#L40-L53)): **?**.

### Q-B Interceptar colar, entregar texto cru e inserir mdast pronta

Resposta: sim, com plugin ProseMirror próprio e um construtor de doc a partir de mdast. Nota **C (1 dia)**.

- O paste nativo (`@milkdown/plugin-clipboard`) lê `text/plain` e chama `parser(text)` ([G/packages/plugins/plugin-clipboard/src/index.ts#L70-L118](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/plugin-clipboard/src/index.ts#L70-L118)). Substituir significa não carregar `clipboard` e registrar `handlePaste` próprio via `$prose`.
- `ParserState` é exportado por `@milkdown/transformer` ([index.ts](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/parser/index.ts)), o construtor recebe só o schema e `next(nodes)` aceita `MarkdownNode | MarkdownNode[]` ([G/packages/transformer/src/parser/state.ts#L50-L53](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/parser/state.ts#L50-L53), [#L199-L205](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/parser/state.ts#L199-L205)). Logo `new ParserState(schema).next(dokAstRoot).toDoc()` converte a DokAST recebida sem reparse. O construtor está marcado `/// @internal` no comentário: API não documentada, risco de quebra em minor.
- Alternativa documentada: serializar a DokAST e usar `insert(markdown)`/`parser` (macro em [G/packages/utils/src/macro/insert.ts](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/utils/src/macro/insert.ts)). Custa um parse extra e passa pelo parser do editor, o que D-2 quer evitar.

### Q-C Nó customizado sem o nome preso à biblioteca

Resposta: sim. Nota **C (0,5 dia de adaptador)**.

- `$node(id, (ctx) => NodeSchema)` recebe `parseMarkdown.match(mdastNode)` e `toMarkdown.match(pmNode)` como funções livres ([G/packages/utils/src/composable/$node.ts](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/utils/src/composable/%24node.ts), exemplo de container em [blockquote.ts#L33-L43](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/preset-commonmark/src/node/blockquote.ts#L33-L43): `state.openNode(type).next(node.children).closeNode()`). Nada do nome da diretiva fica no Milkdown: o adaptador gera um `$node` por entrada do registro de `src/content-components/core`.
- Node view React: `@prosemirror-adapter/react` 0.5.5 (MIT, mesmo mantenedor), citado pela receita React ([docs/recipes/react.md](https://github.com/Milkdown/website/blob/e473618e71695d08367fec5ba7f68ce159c489d8/docs/recipes/react.md)). Não verificado com React 19: **?**.

### Q-D Alternância WYSIWYG ↔ fonte

Resposta: não há modo fonte nativo. O enum `CrepeFeature` não tem modo fonte ([G/packages/crepe/src/feature/index.ts#L17-L60](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/feature/index.ts#L17-L60)) e grep por `sourceMode`/`source mode` no repositório não retorna nada. Nota **C (1–2 dias)**: CodeMirror 6 próprio.

- Reconstrução: `getMarkdown()` serializa o doc ([G/packages/utils/src/macro/get-markdown.ts#L8](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/utils/src/macro/get-markdown.ts#L8)) e `replaceAll(markdown, flush)` faz **re-parse completo** ([G/packages/utils/src/macro/replace-all.ts#L15-L40](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/utils/src/macro/replace-all.ts#L15-L40)). Sem `flush`, entra como uma transação (histórico preservado). Com `flush = true`, recria o `EditorState` (histórico perdido).
- Nó desconhecido: **não é descartado em silêncio**, o parser lança `parserMatchError` (state.ts L76) e o serializer lança `serializerMatchError` ([G/packages/transformer/src/serializer/state.ts#L68-L78](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/transformer/src/serializer/state.ts#L68-L78)). Para D-1 (conteúdo inválido nunca abre no WYSIWYG) o adaptador precisa rodar `validateDok` antes e capturar a exceção como segunda barreira.

### Q-E React 19, só-cliente com lazy, peso

- React 19: `@milkdown/react` declara `peerDependencies: { react: "*", "react-dom": "*" }` e o próprio pacote desenvolve e testa contra `react ^19.0.0` ([G/packages/integrations/react/package.json](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/integrations/react/package.json), linhas 45-53; testes em [__tests__](https://github.com/Milkdown/milkdown/tree/v7.22.1/packages/integrations/react/src/__tests__)). Nota **N**.
- Só-cliente: criação em `useEffect` (E-07). Rota lazy no TanStack Start: **?**.
- Peso gzipped:
  - `@milkdown/crepe@7.22.1`: 458 245 B gzip (1 475 906 B minificado), bundlephobia, consultado em 2026-09-19 ([bundlephobia](https://bundlephobia.com/package/@milkdown/crepe@7.22.1)). Inclui CodeMirror, KaTeX e Vue.
  - `@milkdown/kit` só com core + presets + plugins escolhidos: **?** (bundlephobia retornou 429 para kit, core, react e preset-gfm).
  - `sideEffects: false` em kit, components e crepe ([G/packages/kit/package.json#L22](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/kit/package.json#L22)) permite ao bundler descartar o que não é importado. Isso é hipótese de tree-shaking, não medição: **?**.

### Q-F Modo sugestão (track changes)

Resposta: não há track changes no sentido de marcas de inserção/remoção por autor durante a edição. Existe revisão de diff com aceitar/rejeitar por trecho: `@milkdown/plugin-diff` com `acceptDiffChunkCmd`, `rejectDiffChunkCmd`, `acceptAllDiffsCmd`, `acceptDiffRangeCmd`, `rejectDiffRangeCmd` ([G/packages/plugins/plugin-diff/src/index.ts](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/plugins/plugin-diff/src/index.ts)), usada pelo recurso AI do Crepe. Nota **P (parcial)**: revisão de uma proposta inteira contra o doc atual, não sugestão acumulada.

## Riscos conhecidos

1. **API `$remark` / `$node` na 7.22.1 com directive só de bloco.** Viável. `$remark` aceita plugin unified arbitrário (Q-A), e `$node` mapeia `leafDirective`/`containerDirective` por `match` sobre o nó mdast (Q-C, exemplo oficial de `leafDirective` no iframe). Container com filhos usa `openNode(type, attrs).next(node.children).closeNode()` no parser e `openNode('containerDirective', undefined, { name, attributes })` no serializer (state.ts L186). O rótulo (`paragraph` com `data.directiveLabel`) precisa de tratamento próprio nos dois sentidos. A receita oficial com `remark-directive` completo é incompatível com o DokMD (Q-A).
2. **remark/mdast internos vs. E-06.** `remark-parse ^11.0.0` → `mdast-util-from-markdown ^2.0.0`, `@types/mdast ^4.0.0`; `remark-stringify ^11.0.0` → `mdast-util-to-markdown ^2.0.0`; `remark ^15.0.1`; `remark-gfm ^4.0.1`; `unified ^11.0.3`. Compatível com `mdast-util-from-markdown` 2 / `@types/mdast` 4 e com `micromark-extension-directive` 4 (que também é micromark 4). Fonte: `npm view @milkdown/core dependencies`, `npm view @milkdown/transformer dependencies`, `npm view @milkdown/preset-gfm dependencies`, `npm view remark-parse@11 dependencies`, `npm view remark-stringify@11 dependencies`.
3. **Crepe vs. kit.**
   - Kit tem slash menu e tooltip **headless** (`@milkdown/kit/plugin/slash`, `@milkdown/kit/plugin/tooltip`, sem Vue: grep por `from 'vue'` vazio em `plugin-slash` e `plugin-tooltip`). A UI (toolbar, menu) é código próprio em React/shadcn: C.
   - Crepe entrega toolbar, slash menu (BlockEdit), link tooltip, tabela, image block e Latex prontos, renderizados em Vue (`from 'vue'` em `crepe/src/feature/toolbar/component.tsx`, `block-edit/menu/component.tsx`, `top-bar/component.tsx`). Tema por CSS pré-compilado (`@milkdown/crepe/theme/*.css`) e variáveis `--crepe-*`, fora do shadcn/Tailwind do DokDraw.
   - `Crepe` importa todas as features estaticamente via `loadFeature` ([G/packages/crepe/src/feature/loader.ts](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/feature/loader.ts)), com CodeMirror e Latex ligados por padrão (index.ts L78, L80). `@milkdown/crepe/builder` + `@milkdown/crepe/feature/*` permitem montar só o necessário (exports do [package.json](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/package.json)), mas o `CrepeBuilder` importa o preset `commonmark` inteiro e o `image-block` do components ([G/packages/crepe/src/core/builder.ts#L1-L23](https://github.com/Milkdown/milkdown/blob/v7.22.1/packages/crepe/src/core/builder.ts#L1-L23)), o que traz de volta o `remarkPreserveEmptyLinePlugin` (E-01).
   - Licenças: todos MIT (tabela). Dependências pesadas: CodeMirror 6 (seis pacotes + `@codemirror/language-data`), KaTeX 0.18, Vue 3.5 no Crepe. Vue também vem por `@milkdown/components`, dependência direta do kit. `preset-commonmark` e `preset-gfm` não dependem de `@milkdown/components` (`npm view` das duas). Condição verificável para a rota só-kit ficar sem Vue no bundle: nenhum import de `@milkdown/kit/component/*` nem de `@milkdown/crepe*`.
4. **Modo fonte nativo (Q-D).** Não existe. `getMarkdown` + `replaceAll` com re-parse completo e exceção em nó desconhecido.
5. **Manutenção.**
   - Cadência: 7.18.0 (2026-01-05), 7.19.0 (03-03), 7.19.1 (03-22), 7.19.2 (03-23), 7.20.0 (03-30), 7.21.0 (05-12), 7.21.1 (05-13), 7.21.2 (06-02), 7.21.3 (07-12), 7.22.0 (08-03), 7.22.1 (08-12). Um minor a cada 1–2 meses, sem major desde a linha 7. Fonte: `npm view @milkdown/kit time`.
   - Mantenedor: um só. Mantenedor npm único `mirone <Saul-Mirone@outlook.com>` (`npm view @milkdown/kit maintainers`). Commits nos últimos 365 dias pela API de estatísticas do GitHub ([contributors](https://api.github.com/repos/Milkdown/milkdown/stats/contributors)): `renovate[bot]` 133, `Saul-Mirone` 110, `autofix-ci[bot]` 20, `github-actions[bot]` 15, próximo humano `vm-zero` 4. Repositório com 11 930 estrelas, 38 issues abertas, último push 2026-09-18 (API `repos/Milkdown/milkdown`). O mesmo autor mantém `@prosemirror-adapter/react`. Risco de mantenedor único confirmado.

## Itens para o spike

Só se MDXEditor e Plate falharem (D-5).

1. E-01: rodar as 30 fixtures com preset montado sem `remarkPreserveEmptyLinePlugin` e sem `remarkHtmlTransformer`, com os nós DokMD. Conferir `remarkMarker` (preserva marcador original, pode brigar com o marcador canônico), `remarkAddOrderInListPlugin` e os handlers de `text`/`strong` contra `normalizeDok`.
2. E-01/E-06: frontmatter (nó `yaml` via `$node` ou separado antes do editor).
3. E-02: `Hora:agora` com o par flow-only do harness injetado por `$remark`. Confirmar que o `remarkStringifyOptionsCtx` preserva as `toMarkdownExtensions` com o `unsafe` filtrado.
4. E-03: fixture 23 byte a byte, incluindo rótulo e `rev`.
5. E-07: rota lazy no TanStack Start com SSR, sem erro de hidratação, com e sem Crepe (CSS e Vue no import).
6. Q-B: `new ParserState(schema).next(dokAst).toDoc()` com a DokAST das 8 fixtures `import` (API marcada `@internal`).
7. Q-C: `@prosemirror-adapter/react` 0.5.5 com React 19.
8. Q-E: peso gzip da rota de edição só com kit (core, presets, history, listener, slash/tooltip headless) e peso com `CrepeBuilder` + features escolhidas. Conferir que Vue, CodeMirror e KaTeX não entram no bundle quando nada importa `@milkdown/kit/component/*` nem `@milkdown/crepe*`.
9. E-10, E-12: sem suporte nativo, fora do editor (D-4).

## Não verificado

- Peso gzip de `@milkdown/kit`, `@milkdown/core`, `@milkdown/react`, `@milkdown/preset-gfm` (bundlephobia 429).
- Comportamento sob SSR do TanStack Start e de `React.lazy`.
- Compatibilidade de `@prosemirror-adapter/react` com React 19.
- Integração de tema do Crepe com tokens `.theme-dark`/`.theme-light` e Tailwind v4 (não pesquisado; a UI do DokDraw com kit seria shadcn própria).
- `prefers-reduced-motion` nas animações do Crepe (não pesquisado).
- Scripts de instalação das transitivas de segundo nível além das listadas (auditoria recursiva completa não feita).
- Issues abertas relevantes para directives ou round-trip no repositório (não pesquisadas).
