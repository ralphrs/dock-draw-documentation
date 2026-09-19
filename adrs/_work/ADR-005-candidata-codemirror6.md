# Ficha: CodeMirror 6 (modo fonte)

Verificado em: 2026-09-19

Papel: modo fonte (edição de DokMD cru) compartilhado por MDXEditor e Plate no spike S-1 (escopo D-5). Não é candidata a editor WYSIWYG. Os critérios foram lidos para esse papel.

Convenção de links de código: arquivos publicados no npm na versão exata, via unpkg (`https://unpkg.com/<pacote>@<versão>/<arquivo>`). Os números de linha citados são do mesmo arquivo, conferidos no tarball baixado com `npm pack` (sem instalação).

## Identificação

- Pacotes do conjunto mínimo e versão estável (npm, `npm view` em 2026-09-19):

| Pacote | Versão | Publicada em | npm |
| --- | --- | --- | --- |
| `@codemirror/state` | 6.7.5 | 2026-09-15 | https://www.npmjs.com/package/@codemirror/state |
| `@codemirror/view` | 6.43.12 | 2026-09-15 | https://www.npmjs.com/package/@codemirror/view |
| `@codemirror/commands` | 6.11.1 | 2026-09-15 | https://www.npmjs.com/package/@codemirror/commands |
| `@codemirror/language` | 6.12.4 | 2026-06-25 | https://www.npmjs.com/package/@codemirror/language |
| `@codemirror/lang-markdown` | 6.5.2 | 2026-08-04 | https://www.npmjs.com/package/@codemirror/lang-markdown |
| `@codemirror/lint` | 6.9.7 | 2026-06-09 | https://www.npmjs.com/package/@codemirror/lint |
| `@codemirror/merge` (E-10, opcional) | 6.12.2 | 2026-06-09 | https://www.npmjs.com/package/@codemirror/merge |
| `@lezer/markdown` | 1.7.2 | 2026-07-15 | https://www.npmjs.com/package/@lezer/markdown |

- Repositório: o GitHub `codemirror/dev` está arquivado desde 2026-04-15 com aviso "This repository has moved to https://code.haverbeke.berlin/codemirror/dev" (https://github.com/codemirror/dev). Os `repository.url` no npm dos pacotes `@codemirror/*` e da maior parte dos `@lezer/*` já apontam para `code.haverbeke.berlin` (ex.: https://code.haverbeke.berlin/codemirror/view). Último commit em `view`: 2026-09-18, ainda não publicado.
- Base: CodeMirror 6 (editor de texto, documento é string). Pipeline Markdown: `@lezer/markdown` (parser incremental Lezer, só para realce e estrutura de sintaxe). Não produz mdast.
- Lançamentos desde 2026-09-18: nenhum major/minor. Só `style-mod` 4.1.4 (patch, 2026-09-18, `npm view style-mod time`). Os últimos patches de `state`/`view`/`commands` são de 2026-09-15. Changelog do `view` de 6.43.8 a 6.43.12 só traz correções (https://code.haverbeke.berlin/codemirror/view/raw/branch/main/CHANGELOG.md).
- Wrapper React avaliado: `@uiw/react-codemirror` 4.25.11, publicado 2026-07-08, MIT, https://www.npmjs.com/package/@uiw/react-codemirror, https://github.com/uiwjs/react-codemirror (165 issues abertas em 2026-09-19).

## Licença

Auditoria recursiva de `dependencies` via `npm view <pacote> version license dependencies` a partir de `state`, `view`, `commands`, `language`, `lang-markdown`, `lint`, `merge` (2026-09-19). Todos sem script de install (`npm view <pacote> scripts`), portanto sem binário nem build nativo.

| Pacote | Versão | Licença | Fonte |
| --- | --- | --- | --- |
| `@codemirror/state` | 6.7.5 | MIT | npm view |
| `@codemirror/view` | 6.43.12 | MIT | npm view, LICENSE em https://code.haverbeke.berlin/codemirror/view |
| `@codemirror/commands` | 6.11.1 | MIT | npm view |
| `@codemirror/language` | 6.12.4 | MIT | npm view |
| `@codemirror/lang-markdown` | 6.5.2 | MIT | npm view |
| `@codemirror/lint` | 6.9.7 | MIT | npm view |
| `@codemirror/merge` | 6.12.2 | MIT | npm view |
| `@codemirror/autocomplete` (transitiva de `lang-markdown`) | 6.20.3 | MIT | npm view |
| `@codemirror/lang-html` (transitiva de `lang-markdown`) | 6.4.12 | MIT | npm view |
| `@codemirror/lang-css` (transitiva de `lang-html`) | 6.3.1 | MIT | npm view |
| `@codemirror/lang-javascript` (transitiva de `lang-html`) | 6.2.5 | MIT | npm view |
| `@lezer/common` | 1.5.2 | MIT | npm view |
| `@lezer/highlight` | 1.2.3 | MIT | npm view |
| `@lezer/lr` | 1.4.10 | MIT | npm view |
| `@lezer/markdown` | 1.7.2 | MIT | npm view |
| `@lezer/html` | 1.3.13 | MIT | npm view |
| `@lezer/css` | 1.3.6 | MIT | npm view |
| `@lezer/javascript` | 1.5.4 | MIT | npm view |
| `style-mod` | 4.1.4 | MIT | npm view |
| `crelt` | 1.0.7 | MIT | npm view |
| `w3c-keyname` | 2.2.8 | MIT | npm view |
| `@marijn/find-cluster-break` | 1.0.4 | MIT | npm view |
| `@codemirror/lang-yaml` (opcional, realce de frontmatter) | 6.1.3 | MIT | npm view |
| `@lezer/yaml` (transitiva de `lang-yaml`) | 1.0.4 | MIT | npm view |
| `@uiw/react-codemirror` (se usado) | 4.25.11 | MIT | npm view |
| `@uiw/codemirror-extensions-basic-setup` | 4.25.11 | MIT | npm view |
| `codemirror` (meta-pacote, dep. do wrapper) | 6.0.2 | MIT | npm view |
| `@codemirror/theme-one-dark` (dep. do wrapper) | 6.1.3 | MIT | npm view |
| `@codemirror/search` (via basic-setup do wrapper) | 6.7.2 | MIT | npm view |
| `@babel/runtime` (dep. do wrapper, faixa `^7.18.6`, hoje 7.29.7) | 7.x | MIT | npm view |

Notas: todo o conjunto é MIT. Não há recurso pago. `lang-markdown` puxa `lang-html`, `lang-css`, `lang-javascript` e os parsers Lezer correspondentes como dependência obrigatória (ver E-07 e Riscos).

## Critérios

| Critério | Nota | Evidência (link ou trecho) | Dias se C | Observação |
| --- | --- | --- | --- | --- |
| E-01 Round-trip | N | O documento é texto. `EditorState.doc` é `Text` e `state.doc.toString()` devolve a string exata. Inserir e apagar um caractere volta ao mesmo texto por construção. API: https://codemirror.net/docs/ref/#state.Text | 0 | Dentro do modo fonte o round-trip não depende de parser. O que o spike mede é a alternância WYSIWYG ↔ fonte (Q-D), responsabilidade do editor WYSIWYG. |
| E-02 `<Tabs>`, `<script>`, `Hora:agora` | N (exibição) · C (diagnóstico) | O modo fonte não interpreta nada: `<Tabs>` e `<script>` ficam como texto. O realce do `lang-markdown` classifica HTML via Lezer, sem executar (`lang-markdown` dist/index.js linhas 402, 407, 422: `htmlNoMatch = html({ matchClosingTags: false })`, `parseCode({ codeParser, htmlParser: htmlTagLanguage.language.parser })`, https://unpkg.com/@codemirror/lang-markdown@6.5.2/dist/index.js). O erro vem do `validateDok` no save. Exibição: `setDiagnostics(state, diagnostics): TransactionSpec` (`@codemirror/lint` dist/index.d.ts linha 128, https://unpkg.com/@codemirror/lint@6.9.7/dist/index.d.ts). O `Diagnostic` do CM6 usa offsets (`from`, `to`, `severity`, `message`, `source?`, `markClass?`, `renderMessage?`, `actions?`, linhas 9 a 49), sem `line` e sem `code`. `setDiagnostics` instala o state field sozinho quando não há `linter()` (dist/index.js linha 127: `return state.field(lintState, false) ? effects : effects.concat(StateEffect.appendConfig.of(lintExtensions))`). | 0,5 | Ponte de `Diagnostic{code, message, line}` do DokDraw (trecho abaixo). `lintGutter()` mostra o marcador na linha, e Ctrl/Cmd-Shift-M abre o painel (https://codemirror.net/examples/lint/). Sugestão de config para DokMD: `markdown({ completeHTMLTags: false })` para não autocompletar tags proibidas (dist/index.d.ts linhas 97 a 102). |
| E-03 Inserir diagrama pela UI | não se aplica | Inserção pela UI é do editor WYSIWYG. No modo fonte o usuário digita a forma, e o save valida. | | Um snippet de autocomplete para `::diagram[...]{...}` seria possível via `@codemirror/autocomplete`, não pesquisado (fora do escopo). |
| E-04 Nada avaliado como código | N | `grep -l "eval(\|new Function"` nos `dist/index.js` de `state`, `view`, `commands`, `language`, `lang-markdown`, `lint`, `merge`, `autocomplete`, `lang-html`, `lang-css`, `lang-javascript`, `@lezer/common`, `highlight`, `lr`, `markdown`, `html`, `css`, `javascript`, `lang-yaml`, `@lezer/yaml`: zero arquivos (tarballs 2026-09-19). O Lezer só tokeniza para realce. | 0 | Os parsers HTML/CSS/JS do Lezer rodam sobre o texto só para produzir árvore de realce. Nada é executado nem transformado, e os bytes do documento não mudam. |
| E-05 Licença | N | Tabela de licença acima: tudo MIT, sem script de install. | 0 | |
| E-06 mdast | não se aplica | O CM6 não produz nem consome mdast. O modo fonte entrega string ao `parseDok`/`normalizeDok` do `src/content-format`. | | A árvore Lezer do `@lezer/markdown` é só para realce e não pode ser usada como DokAST (ver Riscos, dois parsers). |
| E-07 Lazy, só-cliente, SSR | N (mecanismo) · ? (hidratação medida) | `new EditorView({ state, parent })` exige DOM (https://codemirror.net/docs/ref/#view.EditorView.constructor). Integração direta: `div` com `ref` e criação do `EditorView` em `useEffect`, destruída com `view.destroy()` no cleanup. No servidor só o `div` vazio é renderizado, portanto o HTML do SSR e o do cliente coincidem. Comparação com o wrapper na subseção abaixo. | 0,5 | Hidratação sem erro na rota lazy do TanStack Start não foi medida. Vai para o spike. |
| E-10 Diff textual | P | `@codemirror/merge` 6.12.2 exporta `MergeView` (lado a lado), `unifiedMergeView` (unificado), `diff`, `presentableDiff`, `getChunks` (dist/index.d.ts linhas 75, 82, 188, 280, 385, 434, https://unpkg.com/@codemirror/merge@6.12.2/dist/index.d.ts). Referência: https://codemirror.net/docs/ref/#merge | 0 | Pelo escopo D-4 o diff textual é independente de editor. O `@codemirror/merge` é uma opção pronta para ele, MIT. |
| E-11 Diff renderizado | não se aplica | Pelo D-4, é da fatia `read` (stub no spike, 007 depois). | | |
| E-12 Faixa de linhas | N (só modo fonte) | `Text.lineAt(pos): Line` e `Text.line(n): Line` (`@codemirror/state` dist/index.d.ts linhas 43 e 47, https://unpkg.com/@codemirror/state@6.7.5/dist/index.d.ts). `Line` tem `number`, `from`, `to`, `text`. Trecho abaixo. | 0 | Pelo D-4 a ancoragem oficial acontece em `<RevisionView>`. No modo fonte a faixa sai direto da seleção. Cuidado: se `range.to` cai no início de uma linha (seleção de linha inteira), a linha final fica uma a mais. Ajustar com `to - 1` quando `to > from`. |
| E-13 Somente leitura | N | `EditorState.readOnly: Facet<boolean>` (`@codemirror/state` dist/index.d.ts linha 1242) bloqueia mudanças de comandos. `EditorView.editable: Facet<boolean>` (`@codemirror/view` dist/index.d.ts linha 1285, https://unpkg.com/@codemirror/view@6.43.12/dist/index.d.ts) desliga o `contenteditable`. Banner: `showPanel: Facet<PanelConstructor>` (mesmo arquivo, linha 2200), exemplo oficial https://codemirror.net/examples/panel/ | 0,5 | Read-only real, não só CSS. Os dois facets podem ser trocados em execução com `Compartment.reconfigure`. O indicador de `changes_requested` pode ser um panel ou um componente React fora do editor. |

Ponte `validateDok` → `@codemirror/lint`:

```ts
import { setDiagnostics, type Diagnostic as CmDiagnostic } from "@codemirror/lint";

function toCm(state: EditorState, ds: { code: string; message: string; line: number }[]): CmDiagnostic[] {
  return ds.map((d) => {
    const l = state.doc.line(Math.min(Math.max(d.line, 1), state.doc.lines));
    return { from: l.from, to: l.to, severity: "error", message: d.message, source: d.code };
  });
}
view.dispatch(setDiagnostics(view.state, toCm(view.state, diagnosticsDoSave)));
```

`code` não tem campo próprio no `Diagnostic` do CM6. O trecho usa `source`, que o painel exibe junto da mensagem. A alternativa é prefixar o `code` no `message`. Diagnóstico sem linha (erro do documento inteiro) precisa de regra própria, por exemplo linha 1.

Seleção → faixa de linhas no modo fonte:

```ts
const r = view.state.selection.main;
const start = view.state.doc.lineAt(r.from).number;
const endPos = r.to > r.from ? r.to - 1 : r.to;
const end = view.state.doc.lineAt(endPos).number;
```

### Wrapper React: `@uiw/react-codemirror` ou integração direta

| Aspecto | `@uiw/react-codemirror` 4.25.11 | Integração direta (`useEffect` + `ref`) |
| --- | --- | --- |
| Licença | MIT, com transitivas MIT (tabela acima) | MIT (só pacotes `@codemirror/*` e `@lezer/*`) |
| React 19 | `peerDependencies.react: ">=17.0.0"` (npm view) | Não depende de API React específica |
| Manutenção | Última versão 2026-07-08, 165 issues abertas (https://github.com/uiwjs/react-codemirror) | Segue o ritmo do CM6 (patches em 2026-09-15) |
| Criação da view | `useLayoutEffect` (src/useCodeMirror.ts linha 100, https://unpkg.com/@uiw/react-codemirror@4.25.11/src/useCodeMirror.ts) | `useEffect`, controlado pelo projeto |
| Dependências extras | `@babel/runtime`, `codemirror` (meta-pacote), `@codemirror/theme-one-dark`, `@uiw/codemirror-extensions-basic-setup` (que puxa `autocomplete`, `search`, `lint`) | Nenhuma além do conjunto mínimo |
| Tema padrão | `theme = 'light'` injeta tema JS próprio, `'none'` desliga, mas `oneDark` continua importado estaticamente (src/getDefaultExtensions.ts linhas 5, 9, 22) | Nenhum tema JS, só o `baseTheme` do CM6 |
| `basicSetup` | Ligado por padrão (`basicSetup: defaultBasicSetup = true`) | Montado à mão com as extensões escolhidas |
| Sincronização de `value` | Pronta (`value`/`onChange`) | Código próprio: `updateListener` para saída, `dispatch({ changes })` para entrada externa |

Nenhum dos dois caminhos foi eliminado. A diferença medível fica em peso (dependências extras) e no `useLayoutEffect`, que não roda no servidor, então o componente precisa montar só no cliente. O comportamento de aviso do React 19 no SSR para `useLayoutEffect` não foi verificado. Integração direta é estimada em 1 dia (C), incluindo sincronização de `value` e troca de `readOnly` por `Compartment`.

### Tema por token CSS

Nota: N. Evidência:

- Classes estáveis: "The important elements in the editor have regular (non-generated) CSS class names, which can be targeted with manually written style sheets" (https://codemirror.net/examples/styling/). As regras injetadas pelo `baseTheme` usam classe gerada, e a folha própria precisa de especificidade igual ou maior (mesma página).
- `EditorView.theme(spec, { dark })` e `EditorView.baseTheme(spec)` aceitam objeto de seletores com `StyleSpec` (`@codemirror/view` dist/index.d.ts linhas 1404 a 1425). O valor é CSS comum, então `var(--token)` passa como string. `&dark`/`&light` dependem do facet `EditorView.darkTheme` (linha 1415), que é estático por instância e não segue `.theme-dark` no `<html>`.
- Realce sem tema JS: `classHighlighter` de `@lezer/highlight` (dist/index.d.ts linhas 621 e 623, https://unpkg.com/@lezer/highlight@1.2.3/dist/index.d.ts) atribui classes estáticas `tok-*` aos tokens. Com `syntaxHighlighting(classHighlighter)`, as cores ficam em CSS: `.theme-dark .tok-heading { color: var(--...) }`.

Conclusão com evidência: dá para estilizar só com CSS e tokens, sem tema JS paralelo, usando classes `cm-*` e `tok-*` em `.theme-dark`/`.theme-light`. O custo é casar a especificidade das regras do `baseTheme` (ex.: seleção e cursor usam `&light`/`&dark`, `@codemirror/view` dist/index.js linhas 6887 a 6906). Alternativa: um único `EditorView.theme` cujos valores são todos `var(--...)`, sem duplicar claro/escuro.

### `prefers-reduced-motion`

Nota: C, 0,25 dia. Evidência:

- O cursor pisca por animação CSS do `baseTheme`: `"&.cm-focused > .cm-scroller > .cm-cursorLayer": { animation: "steps(1) cm-blink 1.2s infinite" }` (`@codemirror/view` dist/index.js linhas 6896 a 6903). Só existe com `drawSelection()`.
- `drawSelection({ cursorBlinkRate })`: "Defaults to 1200. Can be set to 0 to disable blinking." (`@codemirror/view` dist/index.d.ts linhas 1586 a 1590).
- Scroll: nenhuma ocorrência de `smooth` em `@codemirror/view` dist/index.js. O scroll é por atribuição direta de `scrollTop`/`scrollLeft` e `scrollBy` (linhas 602, 696, 3435, 4827), sem animação para desligar.
- O changelog do `view` não menciona reduced motion (https://code.haverbeke.berlin/codemirror/view/raw/branch/main/CHANGELOG.md), por isso não é N.

Solução: `drawSelection({ cursorBlinkRate: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1200 })`, ou regra CSS `@media (prefers-reduced-motion: reduce) { .cm-editor .cm-cursorLayer { animation: none } }` com especificidade suficiente.

### Realce de directives `:::`/`::`

Nota: C, estimativa de 2 dias (1 para leaf `::nome[...]{...}` de uma linha, 1 para container `:::nome` ... `:::` com aninhamento). Evidência:

- `markdown({ extensions?: MarkdownExtension })` (`@codemirror/lang-markdown` dist/index.d.ts linhas 86 a 91).
- `MarkdownConfig` com `defineNodes`, `parseBlock`, `parseInline`, `remove`, `props` (`@lezer/markdown` dist/index.d.ts linhas 332 a 357, https://unpkg.com/@lezer/markdown@1.7.2/dist/index.d.ts). `BlockParser` com `parse`, `leaf`, `endLeaf`, `before`, `after` (linhas 261 a 301). Container usa `BlockContext.startComposite`.
- Não foi encontrado pacote npm de directives para Lezer (`npm search "lezer markdown directive"` em 2026-09-19 só retornou gramáticas oficiais de outras linguagens).
- `remove: ["HTMLBlock", "HTMLTag"]` é possível para que `<Tabs>` apareça como texto comum no realce, se desejado (mesma interface, linha 352). Não muda E-02.

Sem essa extensão, `:::note` aparece como parágrafo. Isso é só estético: o conteúdo continua texto e o save valida.

### Peso gzipped

Nota: ?. Não há medição publicada do conjunto mínimo. Dados disponíveis, todos com limitação declarada:

- bundlephobia (2026-09-19): `@codemirror/view` 6.43.12 com dependências (`state`, `style-mod`, `w3c-keyname`, `crelt`, `find-cluster-break`) = 79 219 bytes gzip, 248 999 minificado (https://bundlephobia.com/package/@codemirror/view@6.43.12). Os demais pacotes deram HTTP 429 (limite de requisições) em três tentativas.
- Página oficial de bundling (sem versão): `minimalSetup` sem linguagem ≈ 75 kB gzip, `basicSetup` + uma linguagem ≈ 135 kB gzip (https://codemirror.net/examples/bundle/).
- Medição local, limite superior, não é peso de bundle: gzip -9 de cada `dist/index.js` não minificado, somado por pacote, sem tree-shaking. Conjunto mínimo (state, view, commands, language, lang-markdown, lint, autocomplete, lang-html, lang-css, lang-javascript e os seis `@lezer/*`, mais style-mod, crelt, w3c-keyname) ≈ 371 kB. Só a cadeia HTML/CSS/JS arrastada por `lang-markdown` soma ≈ 65 kB nessa medida. `@codemirror/merge` acrescenta ≈ 17 kB.
- `lang-markdown` importa `@codemirror/lang-html` estaticamente (dist/index.js linha 6) e cria `html({ matchClosingTags: false })` como valor padrão de `htmlTagLanguage` (linhas 402 e 407). Não há opção documentada para não carregar o HTML. Evitar exigiria montar a linguagem a partir de `@lezer/markdown` sem `lang-markdown`.

Spike: medir o chunk da rota de edição no build Vite do projeto.

## Perguntas obrigatórias

### Q-A Text directives desligadas

Não se aplica ao modo fonte: o CM6 não interpreta diretivas. `Hora:agora` é texto, e o `validateDok` decide no save. A extensão de realce do item acima só reconhece bloco (`::`/`:::` no início de linha) por construção, via `BlockParser`.

### Q-B Interceptar colar

Nota: N. Dois pontos de extensão:

- `EditorView.clipboardInputFilter: Facet<(text: string, state: EditorState) => string>` (`@codemirror/view` dist/index.d.ts linha 1230), desde 6.33.0 de 2024-08-24 (changelog). É síncrono e só transforma texto.
- `EditorView.domEventHandlers({ paste(event, view) { ... return true } })` (linha 1204): lê `event.clipboardData.getData("text/plain")`, entrega o texto à porta externa (`importDialect`) e faz `view.dispatch({ changes: { from, to, insert: serializeDok(ast) } })`. Retornar `true` impede o comportamento padrão. Para resposta assíncrona, o handler bloqueia o padrão e despacha a inserção quando a promessa resolver.

No modo fonte não se insere árvore, e sim o Markdown serializado dela. `markdown()` instala `pasteURLAsLink` por padrão (`@codemirror/lang-markdown` dist/index.js linhas 413 e 460), que precisa ser desligado com `pasteURLAsLink: false` ou ordenado com `Prec` para não concorrer com o handler.

### Q-C Nó customizado desacoplado

Não se aplica: o CM6 não tem nós de documento. A única ligação com nomes de diretiva seria a extensão de realce, que pode ler os nomes do `core` do `src/content-components` (D-3).

### Q-D Alternância WYSIWYG ↔ fonte

O lado do CM6 é trivial: recebe a string de `serializeDok` e devolve `state.doc.toString()`. Estado perdido na troca: seleção, histórico de desfazer e dobras, salvo se o editor guardar o `EditorState` (existe `EditorState.toJSON`/`fromJSON` com campos `history`, https://codemirror.net/docs/ref/#state.EditorState.toJSON). Quem reconstrói a árvore na volta é o editor WYSIWYG, medido na ficha de cada candidata. O mapeamento de cursor entre os dois modos não foi pesquisado (?).

### Q-E React 19, lazy, peso

React 19: o CM6 não depende de React. O wrapper declara `react >=17.0.0`. Só-cliente e lazy: ver E-07. Peso: ver "Peso gzipped" (?).

### Q-F Modo sugestão

Não há track changes no CM6. O mais próximo é `unifiedMergeView` com `acceptChunk`/`rejectChunk` (`@codemirror/merge` dist/index.d.ts linha 434), que mostra diferenças contra um documento original e aceita ou rejeita blocos. Isso é revisão de diff, não sugestão por autor. Registro para o gatilho de reabertura do D-7.

## Riscos conhecidos

- O prompt do ADR 005 não lista risco específico do CodeMirror 6.
- Dois parsers de DokMD: a extensão Lezer de realce de directives duplica, em forma simplificada, a gramática que o `src/content-format` define com micromark. Divergência aparece só como cor errada no modo fonte, sem efeito na DokAST nem na validade, que continuam no `validateDok`. Afeta quem mantém o registro de diretivas: nome novo no 002 exige atualizar a extensão, ou ela lê os nomes do `core`.
- Hospedagem: o código-fonte saiu do GitHub (arquivado em 2026-04-15) para uma forja própria em `code.haverbeke.berlin`, com um mantenedor principal. Pacotes continuam no npm. Sinal a observar: atraso de patches do `@codemirror/view` (ritmo atual de 1 a 2 semanas entre patches, agosto e setembro de 2026).
- Peso: `lang-markdown` arrasta os parsers de HTML, CSS e JavaScript sem opção de desligar (seção de peso).
- `@codemirror/merge` e `@codemirror/lint` não tiveram lançamento desde 2026-06-09. Não é problema em si, fica como dado.

## Itens para o spike

- Peso gzipped real do chunk da rota de edição (build Vite do projeto), com e sem `@codemirror/merge`, e confirmação de que a rota de leitura não contém CM6.
- Hidratação sem erro com o modo fonte montado em rota lazy do TanStack Start (integração direta e, se testado, com `@uiw/react-codemirror`).
- Estado preservado na alternância WYSIWYG ↔ fonte (seleção, undo), e mapeamento de cursor entre os modos.
- Tema só por tokens CSS: verificar especificidade contra o `baseTheme` em seleção, cursor e gutter, em `.theme-dark` e `.theme-light`.
- Handler de colar assíncrono com `importDialect` espionado (D-2) e ordem com `pasteURLAsLink`.

## Não verificado

- Tamanhos minificados de todos os pacotes exceto `@codemirror/view` (bundlephobia retornou 429).
- Comportamento do `lintGutter()` com diagnósticos só via `setDiagnostics` sem `linter()` foi lido no código-fonte, não executado.
- Acessibilidade do modo fonte (leitor de tela) e comportamento em IME/mobile, fora do pedido.
- Autocomplete de snippet para `::diagram` e de links `dok:page`.
- Issues abertas do `@uiw/react-codemirror` sobre SSR ou React 19 não foram lidas uma a uma.
- A extensão Lezer de directives não foi prototipada. Os 2 dias são estimativa a partir da API.
