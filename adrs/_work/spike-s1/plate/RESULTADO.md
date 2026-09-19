# Spike S-1 — Plate 53.3.14

Data: 2026-09-19. Porta: 5312. Pacotes: `platejs` 53.3.14, `@platejs/markdown` 53.3.12, `@platejs/basic-nodes` 53.0.0, `@platejs/list` 53.3.13, `@platejs/table` 53.0.9, `@platejs/link` 53.3.5, `@platejs/code-block` 53.0.0, `@platejs/footnote` 53.0.0.

Comando: `SPIKE_PORT=5312 npx playwright test tests/plate 2>&1 | tee plate/playwright-output.txt` (98 testes, 88 passaram, 10 falharam, 2,8 min). O dev server da porta 5312 já estava de pé (`reuseExistingServer`), com o mesmo comando do `webServer`. `npx tsc --noEmit -p .`: exit 0.

## Placar

| Teste | Resultado | Observação |
| --- | --- | --- |
| 1A | **22/25** | Falham 05 e 06 (modelo de lista do `@platejs/list`) e 23 (a edição trivial apaga um diagrama, ver Falhas) |
| 1B | **14/17** | Mesmas três: 05, 06, 23 |
| 1C | **5/5** | Critérios (a) a (d) nas cinco |
| E-01 | Não passa | A 22/25 + C 5/5 = 27/30. Exige 30/30 e B 17/17 |
| 2 | Passa | Os dois callouts da fixture 16 recriados pela UI: menu, botão de rótulo, lista pelo botão da barra, tipo `danger`, `variant=bug` e `fold=closed` pelos selects do nó |
| 3 | Passa | Fonte: `<Tabs>` e `<script>` dão `DOK-E002,DOK-E002`. `Hora:agora` no WYSIWYG e no fonte fica texto, sem diretiva e sem DOK-E003 |
| 4 | Falha (shell) | O Popover do seletor abre e fecha na hora, o foco volta ao gatilho do DropdownMenu. Não depende do Plate. Caso 4b, com o nó criado como o seletor cria e a descrição digitada na UI do nó: passa, linha 7 da fixture 23 idêntica, save `ok` |
| 5 | Passa | "visão" e o alias "C4" acham "Visão geral". Links `dok:page/0192…183` e `dok:page/new?title=P%C3%A1gina%20nova`. Save `ok` com DOK-W101 |
| 6 | Passa | Cor e fundo da área editável iguais a `var(--foreground)`/`var(--background)` nos dois temas. Nenhum CSS de tema da biblioteca (0 folhas, 0 regras sobrescritas). Nenhuma transição ou animação acima de 0,01 ms com `reducedMotion: 'reduce'` |
| 7 | Passa | Landing: 0 chunks de `platejs`/`@platejs`/`slate`. Navegação de cliente carrega 9. Zero erro de console e de hidratação na navegação e na carga direta. No build, `dok_container` aparece só em `Adapter-Csj75AJT.js` e em nenhum dos chunks `index-*.js` e `EditorShell-*.js` |
| 8 | Passa | Google Docs e GitHub (`text/html` + `text/plain`): uma chamada a `importDialect` por colar, nenhum HTML no save. O parser do adaptador vence o deserializador HTML do core, inclusive com só `text/html`. A vitória depende de o parser devolver fragmento não vazio: o `ParserPlugin` pula o parser quando o fragmento é vazio (`if (!fragment?.length) continue`, `@platejs/core/dist/withSlate-*.js:3525`) e o HTML do core rodaria em seguida. O adaptador devolve `[{ text: '' }]` quando a porta não traz nada |
| 9 (D-2) | **8/8** | 17, 18, 19, 21, 25, 26, 27, 29: `matchedFixture` certo e save igual ao `expected.md` |
| 10 (D-5) | **23/25** + caso de edição passa | Falham 05 e 06, pela mesma causa do teste 1. Parágrafo digitado no fonte aparece no WYSIWYG e no save |
| 11 (E-13) | Passa | `?readOnly=1`: `getDok()` inalterado, `contenteditable="false"`, menu Inserir ausente, campos da UI do nó desabilitados. Banner visível com `?changesRequested=1` |
| 12 | Passa | Menu no topo (`elementFromPoint`), sem corte, dentro da viewport, Escape devolve o foco a `insert-menu` |
| 13a | Falha | 6 de 42 cargas mudam a estrutura mdast: 05 e 06 perdem (lista e parágrafo de item), 08 embrulha o conteúdo de célula em `paragraph` sem perda de texto. Zero `console.warn` de `Unreachable code` |
| 13b | Medido | `callout: null` **não** desliga a regra nativa de elemento. `comment: null` e `suggestion: null` descartam a marca e mantêm o texto |
| 13c | Passa | `data.directiveLabel` preservado na carga, depois de editar o corpo e depois de editar o rótulo |
| 13d | Passa com regra do adaptador | Com as regras nativas, `linkReference`, `imageReference` e `definition` somem em silêncio ("Leia  e ."). Com as regras do adaptador, 1B 14 passa |
| 13e | Passa | Notas de rodapé renderizadas (2 referências, 2 definições), texto da definição editável, save correto |
| 13f | Medido | Depois da remontagem: seleção `null`, foco fora do editor, histórico vazio (Ctrl/Cmd+Z não desfaz o que foi digitado antes da troca). O histórico novo funciona |
| Peso | Medido | Chunk do adaptador: 870,96 kB min, **265,05 kB gzip**. `marked` e `remark-mdx` (com `acorn`) estão no chunk |

## Adaptador

Arquivos em `src/editors/plate/`:

| Arquivo | Linhas | Conteúdo |
| --- | --- | --- |
| `Adapter.tsx` | 222 | Plugins, entrada e saída DokAST, handle do contrato, parser de colar, inserção de diretiva, barra (lista, link interno com autocomplete) |
| `rules.ts` | 145 | Regras mdast ↔ Slate: diretivas por `node.name`, rótulo, e extensões das regras nativas que perdem campo |
| `elements.tsx` | 177 | Componentes dos nós: container com select de nome e campos de atributo vindos de `EDIT[name]`, rótulo, diretiva folha com descrição, imagem inline, referência, definição |

Testes em `tests/plate/`: 795 linhas em 5 arquivos. Tempo gasto: uma sessão de agente, sem medida em dias de engenheiro.

Arquitetura:

- Entrada: `mdastToSlate(structuredClone(initialTree sem yaml), getMergedOptionsDeserialize(editor, {}))` em `Adapter.tsx:125-128`, chamado pelo `value` de `usePlateEditor` (`Adapter.tsx:80-89`). O `structuredClone` é necessário porque `buildSlateRoot` reescreve `root.children` (`@platejs/markdown/dist/index.js:1666`) e o `initialTree` é estado do shell reaproveitado na remontagem.
- Saída: `convertNodesSerialize(editor.children, getMergedOptionsSerialize(editor, { preserveEmptyParagraphs: false }), true)` embrulhado em `Root`, lido no momento da chamada de `getTree()` (`Adapter.tsx:130-133`).
- `MarkdownPlugin.configure({ parser: null, options: { rules } })` (`Adapter.tsx:75`). O plugin precisa estar registrado mesmo sem `deserializeMd`/`serializeMd`: `getMergedOptions*` leem `editor.getOptions(MarkdownPlugin)`.
- Diretivas: regra única de deserialize sob `containerDirective` e outra sob `leafDirective` (`rules.ts:96-114`), que copiam `node.name` e `node.attributes` para o elemento Slate `dok_container`/`dok_leaf`. Serialize por tipo de elemento (`rules.ts:116-140`). Nenhum nome de diretiva no código do adaptador. A UI do nó lê `EDIT[name].attributes` e `labelMode`, e o select de nome oferece os nomes do `DIRECTIVE_NAMES` com a mesma família de atributos e o mesmo modo de rótulo.
- Rótulo: primeiro filho `dok_label` (elemento com inline editável) quando o primeiro parágrafo mdast tem `data.directiveLabel`. Volta como `paragraph` com `data.directiveLabel: true`.
- Colar: plugin `dok_paste` com `parser.mimeTypes: ['text/plain', 'text/html']` registrado depois dos demais (`Adapter.tsx:45-57`). Entrega texto e HTML crus a `props.importDialect` e devolve `mdastToSlate(result.tree)`, inserido por `editor.tf.insertFragment`, o mesmo transform de `insertTree`.
- Menu Inserir: `insertDirective` converte o nó de `EDIT[name].create()` pelo mesmo `mdastToSlate` e insere como bloco de topo depois do bloco corrente, ou no lugar de um parágrafo vazio.
- Instrumentação: `window.__plateEditor` exposto para as sondas do item 13. Não participa do save.

Configurações da biblioteca que o round-trip exigiu, cada uma com a evidência da primeira execução (`plate/playwright-output-regras-nativas.txt`, regras nativas: 1A 15/25, 1B 9/17, 1C 5/5, com a 1A 01 perdida por temporização de teclas, ver Riscos):

| Configuração | Motivo | Sem ela |
| --- | --- | --- |
| `preserveEmptyParagraphs: false` no serialize | `normalizeParagraphLineBreaks` troca texto vazio por U+200B (`index.js:748-751`) | Não medido: a opção já estava ligada na primeira execução. Leitura do código |
| `LinkPlugin.configure({ rules: { normalize: { removeEmpty: false } } })` | O LinkPlugin declara `normalize: { removeEmpty: true }` (`@platejs/link/dist/upsertLink-*.js:140`) | 1A 13: `Relacionado: [](dok:page/…).` vira `Relacionado: .` depois da edição trivial |
| `shouldNormalizeEditor: true` | `mdastToSlate` devolve link e imagem inline sem texto irmão, fora do schema do Slate. É a normalização de schema do Slate na carga, não conserto de DokAST: o adaptador não chama `normalizeDok` e o 13a, com a opção ligada, registra as perdas de 05 e 06 em vez de escondê-las | Fixture 27: Ctrl/Cmd+A e Backspace não apagam nada, e o colar do D-2 duplica o conteúdo (execução intermediária do teste 9, saída não gravada) |
| Regra `a` com `title` | A regra nativa descarta `title` e, quando texto = URL, devolve nó `html` via `marked.Lexer` (`index.js:770-785`). A primeira execução desarmou o nó `html` com `remarkStringifyOptions.resourceLink: true`, que a regra própria dispensa | 11: `[Docs](https://docs.astro.build "Astro")` perde `"Astro"` |
| Regra `code_block` com `meta` | A nativa só guarda `lang` (`index.js:835-849`) | 07: ` ```ts title="a.ts" {2}` vira ` ```ts` |
| Regra `table` com `align` | A nativa não guarda `align` (`index.js:1323-1365`) | 08: alinhamento das colunas some |
| `img` como inline void `dok_img` | O `p` nativo arranca `img` do parágrafo (`splitBlockTypes`, `index.js:1205`) | 14: a imagem vira bloco e a frase quebra em três parágrafos |
| Regras para `linkReference`, `imageReference`, `definition` | Sem regra nativa, `buildSlateNode` devolve `[]` (`index.js:1921-1926`) | 1B 14: `Leia  e .` |

Dias estimados para produção, itens "C":

| Item | Estado no spike | Dias |
| --- | --- | --- |
| Regras das diretivas, rótulo e UI de nó por `EDIT` | Feito, 2 e 13c passam | 2 (restrição de filhos de `tabs`/`steps` por `normalizeNode`, Enter no rótulo, inserção de diretiva aninhada, UI de `tabs`) |
| Extensões de fidelidade das regras nativas (tabela acima) | Feito, 1A e 1B passam nessas fixtures | 1 (testes unitários por regra, revisão a cada release do `@platejs/markdown`) |
| Modelo de lista: listas adjacentes (05) e item com mais de um bloco (06) | Não resolvido | 3 a 5, com risco. O `@platejs/list` não tem nó de lista nem item com blocos. O caminho clássico da regra nativa (`ul > li > lic`) foi sondado sem o `ListPlugin` e apagou todas as listas (ver Desvios). Ele exige `@platejs/list-classic` (53.0.0 no npm, não instalado) e a regra nativa `list.serialize` só emite `lic`, `ol` e `ul` dentro de `li` (`index.js:1138-1161`), sem `checked` e sem bloco extra. Nos dois caminhos o adaptador precisa de modelo ou regra de lista própria |
| Documento só com diretivas folha (23) | Não resolvido | 0,5 (bloco final de texto ou navegação por teclado entre voids, a validar) |
| Colar pela porta `importDialect` | Feito, 8 e D-2 passam | 0,5 |
| Alternância com o CodeMirror | Feito, 10 passa exceto 05/06 | 1 (seleção e histórico se perdem na remontagem, 13f) |

## Falhas

### 1A/1B/10 fixture 05: listas adjacentes se fundem

```diff
 - um
 - dois
+- outra lista

-* outra lista
-
 3. três
```

Causa: o `@platejs/list` representa lista como parágrafos com `listStyleType` e `indent`, sem nó de lista. O agrupamento em `list` mdast é feito dentro de `convertNodesSerialize` (`index.js:603-614`), antes de qualquer regra, e só separa listas quando `listStyleType` muda. Duas listas `disc` seguidas viram uma. 13a registra `root>list 3→2`. Não há regra que o adaptador possa sobrescrever nesse ponto.

### 1A/1B/10 fixture 06: segundo parágrafo do item sai da lista

```diff
   - sub item
 
-    código indentado dentro do item
+código indentado dentro do item
```

Causa: a regra nativa `list.deserialize` transforma o primeiro filho do item em parágrafo de lista e os blocos seguintes em parágrafos com `indent + 1` e sem `listStyleType` (`index.js:1094-1129`). Na volta, `convertNodesSerialize` só agrupa parágrafos com `listStyleType` (`index.js:603`), e o parágrafo extra cai na raiz. 13a registra `listItem>paragraph 4→3` e `root>paragraph 0→1`.

### 1A/1B fixture 23: a edição trivial apaga o segundo diagrama

```diff
 ::diagram[Pessoa usa o Checkout, que chama o Gateway de pagamento]{src="dok:diagram/0192f0a1-6d4f-7b20-9c3d-4e5f60718293" view="0192f0a1-6d4f-7b20-9c3d-4e5f60718294" title="Contexto do Pagamento"}
-
-::diagram{src="dok:diagram/0192f0a1-6d4f-7b20-9c3d-4e5f60718293" view="0192f0a1-6d4f-7b20-9c3d-4e5f60718294" rev="0192f0a1-6d4f-7b20-9c3d-4e5f60718295" title="Contexto (versão aprovada)"}
```

Causa: a fixture 23 não tem nenhum texto editável, só dois voids. O clique seleciona o void, `x` é ignorado e Backspace apaga o void selecionado, comportamento padrão do Slate. A sonda registrou a sequência: depois do clique 2 diagramas, depois de `x` 2, depois de Backspace 1. Sem edição o round-trip é exato: 10 23 passa e 13a 23 não perde nada. O protocolo "cursor no texto" não se aplica a esse documento, e o adaptador também não oferece posição de texto depois do último void.

### 4: seletor de diagrama do shell fecha ao abrir

Saída: `4 seletor: apareceu no DOM=true visível após 500 ms=false foco=insert-menu`, e o mesmo pelo teclado. O item Diagrama do `DropdownMenu` abre o `Popover` em `onSelect` (`src/shared/EditorShell.tsx`), o menu fecha e devolve o foco ao gatilho, e o Popover se fecha por foco fora. O Plate não está nesse caminho. Item parado por exigir mudança compartilhada. O caso 4b mede a parte do adaptador (inserir o nó e editar a descrição pela UI do nó) e passa.

### 13a: mudança de estrutura mdast sem edição

Das 42 cargas, 05 e 06 (expected e input) perdem estrutura pelas causas acima. 08 (expected e input) ganha `tableCell>paragraph` porque a regra nativa `table.deserialize` embrulha o conteúdo da célula em parágrafo (`index.js:1333-1347`). O texto não muda e o save de 08 é idêntico ao esperado. O teste conta 08 como mudança porque compara pares pai>filho.

## Riscos do item 13

- **Nó mdast sem regra.** `13a-nativo` lista os tipos do corpus e a regra nativa: `containerDirective`, `leafDirective`, `definition`, `imageReference`, `linkReference` e `yaml` não têm `deserialize` em `defaultRules` (`listItem`, `tableRow` e `tableCell` são tratados pela regra do pai). Com regras nativas, a 1B 14 perdeu as referências sem erro nem aviso. Na serialização, nó Slate sem regra só gera `console.warn` (`unreachable`, `index.js:304-306`). Na execução final, zero warns.
- **`rules: { callout: null, comment: null, suggestion: null }`.** Não desliga a regra de elemento: `getSerializerByKey` testa `=== void 0` e, com `null`, cai em `buildRules` (`index.js:296-300`). Um elemento `callout` inserido direto no editor sai como `mdxJsxFlowElement` com atributo `id` (o id de bloco do Plate) e o save quebra: `Cannot handle unknown node \`mdxJsxFlowElement\``. Para marca o efeito é outro: `getCustomMark` filtra `parser?.mark` (`index.js:108-111`), então `comment` e `suggestion` com `null` saem como texto puro, sem MDX e sem aviso. No spike nenhum plugin cria `callout`, e o colar passa pela porta `importDialect`, então o caminho não é alcançável pela UI. Um plugin futuro que crie esse tipo reabre o risco.
- **Rótulo de container.** Preservado (13c).
- **Link por referência.** Ver 13d e a tabela de configurações.
- **Notas de rodapé.** `@platejs/footnote` com as regras nativas `footnoteReference`/`footnoteDefinition`: 1A 09, 1B 09 e 13e passam.
- **Seleção e histórico na volta do fonte.** O shell remonta o adaptador. Seleção `null`, foco fora do editor, histórico vazio (13f).
- **Id de bloco.** Os blocos recebem `id` (`data-block-id` no DOM). As regras do adaptador ignoram o campo. A regra nativa de `callout` o vaza como atributo MDX (13b).
- **Temporização da seleção.** Na execução com regras nativas, 1A 01 falhou com `Teto.x`: `End`, `x` e `Backspace` enviados sem pausa chegaram antes de o Slate sincronizar a seleção do DOM (evento `selectionchange`). Os testes finais têm pausas de 50 a 100 ms entre as teclas.
- **Peso.** `npx vite build --outDir plate/dist-check` rodou sem mudar configuração (saída em `plate/vite-build-output.txt`, pasta de build apagada depois). Chunk do adaptador `Adapter-Csj75AJT.js`: 870,96 kB min, 265,05 kB gzip, identificado por `dok_container`. `marked` está no chunk (`marked(): input parameter` 2 vezes, `lexInline` 4), importado estaticamente e usado pela regra nativa `a`. `remark-mdx` está no chunk (`remarkMdx` 1, `mdxJsxFlowTag` 1, `acorn` 26 ocorrências), importado no topo de `@platejs/markdown` (`index.js:2` e `:9`). Nenhum dos dois roda no caminho do spike: o adaptador não chama `deserializeMd`, e a regra `a` do adaptador não usa `marked`. O `sideEffects: false` do pacote não bastou para tirá-los do chunk.

## Desvios e limites

- As regras de fidelidade e as três configurações da tabela entraram depois da primeira execução. A execução com regras nativas está inteira em `plate/playwright-output-regras-nativas.txt` (só o teste 1).
- Teste 4: parte do seletor parada por depender do shell. 4b cria o nó chamando `handle.insertDirective(EDIT.diagram.create(...))` com os mesmos argumentos do seletor.
- Teste 8: o colar sintético segue a ordem do navegador (evento `paste` e, se não cancelado, `beforeinput` `insertFromPaste` com o mesmo `DataTransfer`). O slate-react só trata o `paste` direto quando o clipboard é só texto. Com `text/html`, espera o `beforeinput`. Os três colares com HTML foram tratados no `beforeinput`. O colar com só `text/html` chegou à porta com `text: ''` e o stub não inseriu nada (limite declarado do stub, D-2).
- Sonda do caminho de lista clássica: com o `ListPlugin` fora do array de plugins (mudança temporária no `Adapter.tsx`, revertida), a regra nativa `list.deserialize` entra no ramo clássico (`index.js:1076`) e produz `ul/ol > li > lic`. Sem plugins registrados para esses tipos, `list.serialize` não reconhece nenhum `li` (`getPluginKey(editor, child.type) === "li"`, `index.js:1141`) e toda lista some do save: 05 e 06 perdem as listas inteiras e a 16 perde a lista dentro do callout. Saída em `plate/playwright-output-sonda-lista-classica.txt`.
- A lista do teste 2 foi criada pelo botão "Lista" do adaptador (`toggleList`). O spike não instalou autoformat de Markdown, então digitar `- ` não cria lista.
- Inserir diretiva sempre no nível de topo: o menu não cria diretiva dentro de outra.
- Nó `dok_leaf` guarda a descrição como texto simples. Formatação inline na descrição de um diagrama não é editável pela UI do nó.

## Saída real

Saída bruta completa em `plate/playwright-output.txt` (execução final), `plate/playwright-output-regras-nativas.txt` (primeira execução, regras nativas) e `plate/playwright-output-sonda-lista-classica.txt` (sonda sem `ListPlugin`). Trechos sem edição:

```
  ✘   4 tests/plate/t01-corpus.spec.ts:8:3 › 1A fixture 05 expected (1.4s)
  ✘   5 tests/plate/t01-corpus.spec.ts:8:3 › 1A fixture 06 expected (1.4s)
  ✘  20 tests/plate/t01-corpus.spec.ts:8:3 › 1A fixture 23 expected (1.4s)
  ✘  29 tests/plate/t01-corpus.spec.ts:21:3 › 1B fixture 05 input (1.3s)
  ✘  30 tests/plate/t01-corpus.spec.ts:21:3 › 1B fixture 06 input (1.4s)
  ✘  41 tests/plate/t01-corpus.spec.ts:21:3 › 1B fixture 23 input (1.3s)
  ✘  50 tests/plate/t02-t05-ui.spec.ts:120:1 › 4 E-03: diagrama pelo menu, seletor e descrição pela UI do nó (2.2s)
  ✘  67 tests/plate/t06-t12-shell.spec.ts:192:3 › 10 D-5 alternância fixture 05 (1.0s)
  ✘  68 tests/plate/t06-t12-shell.spec.ts:192:3 › 10 D-5 alternância fixture 06 (1.0s)
  ✘  92 tests/plate/t13-riscos.spec.ts:24:1 › 13a nó mdast perdido nas duas direções (sem edição) e warn unreachable (36.8s)
  10 failed
  88 passed (2.8m)
```

```
1C 3: ok {"a_mode":true,"a_semWysiwyg":true,"b_diagnostics":true,"c_source":true,"c_setModeFalse":true,"c_sourceDepois":true,"d_codes":true} codes=DOK-E001 manifest=DOK-E001
```

```
13b callout: getTree=:"text","value":"Texto."}],"type":"paragraph"},{"attributes":[{"name":"id","type":"mdxJsxAttribute","value":"7rNIYe7rR0"}],"children":[{"children":[{"type":"text","value":"dentro do callout"}],"type":"paragraph"}],"name":"callout","type":"mdxJsxFlowElement"}]}
   nós mdxJsx no getTree=1 erro no save=Cannot handle unknown node `mdxJsxFlowElement`
13b comment: getTree={"type":"root","children":[{"children":[{"type":"text","value":"Texto."}],"type":"paragraph"},{"children":[{"type":"text","value":"comentado"}],"type":"paragraph"}]}
```

Regras nativas, 1B 14 (`plate/playwright-output-regras-nativas.txt`):

```
-Leia [a visão](dok:page/0192f0a1-5c3e-7a10-8b2c-3d4e5f607183) e ![logo](dok:asset/0192f0a1-7e50-7c30-8d4e-5f6071829304 "Logo").
+Leia  e .
```

Build (`plate/vite-build-output.txt`):

```
plate/dist-check/client/assets/Adapter-Csj75AJT.js         870.96 kB │ gzip: 265.05 kB
```
