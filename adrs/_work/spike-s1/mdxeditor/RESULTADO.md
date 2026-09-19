# Spike S-1 — MDXEditor 4.2.5

Data: 2026-09-19. Porta: 5311. Comando: `SPIKE_PORT=5311 npx playwright test tests/mdxeditor 2>&1 | tee mdxeditor/playwright-output.txt`. `npx tsc --noEmit -p .` sem erro nos arquivos do MDXEditor.

Placar desta seção: rodada da parada 3. A correção da fusão de listas e o placar novo estão em "Correção da fixture 05 (parada 4)", no fim do arquivo.

Resultado bruto da rodada da parada 3: 99 testes, 94 passaram, 5 falharam (1A 05, 1B 05, 9 D-2 26, 9 D-2 27, 10 05).

## Placar

| Teste | Resultado | Observação |
| --- | --- | --- |
| 1A | 24/25 | Falha: 05 (duas listas com marcador adjacentes viram uma). 09 passa só com ilha opaca (nota de rodapé preservada, não editável). |
| 1B | 16/17 | Falha: 05, mesma causa. 14 passa só com ilha opaca para `linkReference`, `imageReference` e `definition`. |
| 1C | 5/5 | a, b, c, d nas cinco fixtures. Responsabilidade do shell: o adaptador não monta. |
| E-01 | Não passa | A 24/25 + C 5/5 = 29/30 e B 16/17. A única fixture que falha é a 05, nas duas partes. |
| 2 | Passa | Callouts recriados pela UI do nó (título, tipo `danger`, `variant=bug`, `fold=closed`). Apagar o corpo exige o cursor num parágrafo do editor raiz antes de selecionar tudo. |
| 3 | Passa | `Hora:agora` literal no WYSIWYG e no fonte, sem DOK-E003 e sem escape. `<Tabs>` e `<script>` no fonte: DOK-E002, save recusado. |
| 4 | Parcial (desvio) | Linha 7 da fixture 23 exata e save `ok` (W103 só vem antes da descrição). O seletor de diagrama do shell abre e fecha sozinho. A inserção usou `handle.insertDirective` com o mesmo nó que o botão do seletor cria. Ver Desvios. |
| 5 | Passa | "visão" e "C4" acham "Visão geral". Gera `[texto](dok:page/0192f0a1-…7183)` e `[nova](dok:page/new?title=P%C3%A1gina%20nova)`, save `ok` com W101. |
| 6 | Passa | Cor e fundo da área editável iguais aos tokens nos dois temas. 1 regra sobrescrita. Nenhuma transição ou animação acima de 0,01 ms em 105 elementos. |
| 7 | Passa | Landing sem chunk do editor. Navegação de cliente e carga direta sem erro de console nem de hidratação. |
| 8 | Passa | Uma chamada de `importDialect` por colar, com `html`. Save sem HTML nem JSX. |
| 9 (D-2) | 6/8 | Falham 26 e 27: link de título vivo `[](dok:page/…)` (texto vazio) não sai com selecionar tudo + Backspace e some ao ser inserido por `$insertNodes`. |
| 10 (D-5) | 24/25 + edição no fonte passa | Falha só a 05 (mesma causa do teste 1). |
| 11 (E-13) | Passa | `contenteditable=false` na raiz e nos 6 editores aninhados, campos do nó desabilitados, menu e UI de link ausentes, `getDok` inalterado, banner visível. |
| 12 | Passa | Menu em portal sobre o editor, `elementFromPoint` no centro e em cada item cai no menu, dentro da viewport, Escape devolve o foco ao gatilho. |
| 13 | 8/10 riscos sem pendência, 2 com falha ou lacuna registrada | Sem pendência: rótulo (com descriptor próprio), Mod+U (com bloqueio), colar HTML, autolink, parágrafo final, `<img onerror>`, referência (com ilha opaca), peso medido. Com falha: árvore colada com nó `html` (exceção no save). Com lacuna: notas de rodapé preservadas sem edição. Detalhe na tabela abaixo. |

### Item 13, risco a risco

| Risco | Medido | Resultado |
| --- | --- | --- |
| Rótulo `[..]` após editar o callout | Descriptor próprio: `:::note[Antes de começar]` preservado. `AdmonitionDirectiveDescriptor` oficial (modo sem mitigação): o save grava `:::note` e "Antes de começar" vira o primeiro parágrafo do corpo. | Confirmado o defeito da biblioteca. Corrigido no adaptador. |
| Mod+U | Com bloqueio de `FORMAT_TEXT_COMMAND`: nada de `<u>`. Sem bloqueio: o save contém `<u> sublinhado</u>`, DOK-E002, save recusado. | Confirmado. Mitigado no adaptador. |
| Colar HTML com `<u>`, `<sup>`, `<sub>`, `<span style>` | Com `text/html` + `text/plain`: o stub usa o texto, nenhuma tag no save. | Passa. |
| Colar `text/plain` com tags literais | `antes <u>sub</u> e <sup>2</sup> depois`: o save **lança** `Cannot handle unknown node mdxJsxTextElement`. `<span style>` literal: erro de importação não capturado (`[Unhandled error] UnrecognizedMarkdownConstructError … "html"` no log do Vite), nada inserido. | Falha. Só acontece com nó `html` na árvore devolvida pela porta (hoje, o stub degradado). |
| Notas de rodapé (09) | Ilha opaca: 4 nós preservados, `contenteditable=false`, save igual ao esperado. Sem ilha: `UnrecognizedMarkdownConstructError … footnoteReference`, corpo perdido no save. | C, 2 a 3 dias para edição real. |
| Autolink literal (11) | 1A e 1B da 11 passam: o parser é o do DokMD, não o do editor. URL digitada no WYSIWYG vira `<https://exemplo.com.br/doc>` (AutoLinkPlugin do `linkPlugin`). | Passa. |
| Link por referência (14, parte B) | Com ilha opaca, 1B 14 passa. Sem ilha: `UnrecognizedMarkdownConstructError … linkReference`. | C, 0,25 dia (ver Falhas). |
| Parágrafo vazio no fim | Aparece: `getTree` termina em parágrafo vazio nas fixtures 16, 20 e 23, e `getDok` termina com `\n\n` a mais. O `normalizeDok` do save remove, e o save fica igual ao esperado. | Não afeta o save. Afeta `getDok` bruto. |
| `<img src=x onerror=…>` | No fonte: `setMode('wysiwyg')` devolve `false`, save DOK-E002, `window.__pwned` indefinido. Colado como texto no WYSIWYG: nenhum `<img>` no DOM, `__pwned2` indefinido. | Nada executa. |
| Peso | `npx vite build --outDir mdxeditor/dist-check`: chunk `Adapter-vQce0VTX.js` 420,41 kB, **132,88 kB gzip**. CSS `Adapter-n2eE73RR.css` 50,39 kB, 9,09 kB gzip. Chunks compartilhados com o shell (Radix, CodeMirror do modo fonte) fora da conta. | Medido. Saída em `mdxeditor/vite-build-output.txt`. |

## Adaptador

Arquivos em `src/editors/mdxeditor/`:

| Arquivo | Linhas | Papel |
| --- | --- | --- |
| `Adapter.tsx` | 111 | `<MDXEditor markdown="" suppressHtmlProcessing>` com os plugins oficiais (`headings`, `quote`, `lists`, `link`, `table`, `thematicBreak`, `codeBlock`, `markdownShortcut`) e o `dokPlugin`. Descriptor de bloco de código com `textarea`. |
| `dokPlugin.tsx` | 309 | `realmPlugin` próprio: entrada, saída, colar, bloqueio de formatos, flush dos editores aninhados, visitors próprios. |
| `directives.tsx` | 207 | Descriptors gerados de `DIRECTIVE_NAMES` e `EDIT`. Um descriptor para os quatro callouts, um por nome para `tabs`, `tab`, `steps`, `diagram`. Rótulo fora do editor aninhado. |
| `nodes.tsx` | 118 | `DokImageNode` (substitui o `imagePlugin`, sem `innerHTML`) e `DokOpaqueNode` (ilha opaca). |
| `LinkUi.tsx` | 73 | Autocomplete de link interno por `props.searchPages`, link pendente por `pendingPageUri`. |
| `adapter.css` | 55 | Tokens na área editável e nos campos do nó. |

Total: 873 linhas (818 de TS/TSX). Testes em `tests/mdxeditor/`: 670 linhas.

Chamadas da biblioteca no caminho de persistência:

- Entrada: `importMdastTreeToLexical` (`node_modules/@mdxeditor/editor/dist/importMarkdownToLexical.js:76`), chamada em `dokPlugin.tsx:254` dentro de `rootEditor.update(…, { discrete: true })` no `postInit`, a partir de `structuredClone(props.initialTree)`. O `markdown=""` do componente é obrigatório (`MDXEditor.js`, `props.markdown.trim()`) e importa um parágrafo vazio, descartado pelo `$getRoot().clear()` antes do import.
- Saída: `exportLexicalTreeToMdast` (`exportMarkdownFromLexical.js:8`), em `dokPlugin.tsx:286`, com `jsxIsAvailable` do realm e `addImportStatements: false`. O shell serializa com `serializeDok`.
- Colar e `insertTree`: `importMdastTreeToLexical` num ponto de importação próprio + `$insertNodes` (`dokPlugin.tsx:181`), o mesmo desenho do `insertMarkdown$` sem o parser.
- `insertDirective`: `insertDecoratorNode$` com `$createDirectiveNode(node)`, não `insertDirective$` (que zera `children` e perderia o rótulo).
- Editores aninhados: só gravam no nó pai no blur (`NestedLexicalEditor.js:162-168`). O `getTree()` despacha `NESTED_EDITOR_UPDATED_COMMAND` em cada editor aninhado registrado, do mais fundo para o mais raso (`dokPlugin.tsx:278`). Sem isso, o save sem blur devolveria o mdast da carga.

Fora do caminho de persistência, e declarado: o core mantém um listener que roda `exportMarkdownFromLexical` (com `toMarkdown`) a cada atualização para alimentar `markdown$` (`plugins/core/index.js:274-282`). O adaptador não lê esse valor. Ele lança se faltar handler, então o `dokPlugin` registra `directiveToMarkdown()` e `gfmToMarkdown()` só para ele. Nenhum `setMarkdown$`, `insertMarkdown$`, `getMarkdown`, `markdown$` nem `diffSourcePlugin` é usado.

Visitors próprios que substituem ou completam os da 4.2.5 (prioridade 1):

- Diretivas: cópia do `MdastDirectiveVisitor` e do `DirectiveVisitor` (não exportados), sem o ramo de text directive. O `directivesPlugin` oficial não é carregado.
- Lista com `start`: `MdastListVisitor.js:6` cria a lista sem `start` e `LexicalListVisitor.js:6` exporta sem `start`. Na primeira rodada, com os visitors oficiais, a fixture 05 gravava `1. três` / `2. quatro`.
- Quebra dura: `LexicalLinebreakVisitor.js:5` exporta `LineBreakNode` como texto `"\n"`. Na primeira rodada a fixture 10 perdia o `\` de `Linha com quebra\`. O visitor próprio exporta `break`, exceto o par de `LineBreakNode` que o `MdastParagraphVisitor` usa para separar parágrafos dentro de item de lista.

Dependências importadas direto e que o app teria de declarar: `lexical`, `@lexical/link`, `@lexical/list`, `@lexical/react` (hoje só transitivas do MDXEditor).

Dias: o spike consumiu uma sessão. Estimativas para produção dos itens "C":

| Item | Estado no spike | Dias para produção |
| --- | --- | --- |
| Rótulo `[..]` de container (callout e `tab`) | Resolvido com descriptor próprio | 0,5 (UI de rótulo com formatação inline) |
| Listas adjacentes do mesmo tipo (05) | Falha | 1 a 1,5 (substituir o `ListNode` ou impedir o merge) |
| `start` de lista e quebra dura | Resolvidos com visitors próprios | 0,5 (modelo de parágrafos dentro de item sem o par de `LineBreakNode`) |
| Notas de rodapé | Preservadas como ilha opaca, sem edição | 2 a 3 |
| Referências e definições | Ilha opaca | 0,25 (ou normalizar no shell antes de montar, decisão fora do adaptador) |
| Link de título vivo vazio (26, 27) | Falha no apagar e no colar | 1 (nó inline próprio para `[](dok:page/…)`) |
| Árvore colada com nó `html` | Exceção no save e erro não capturado | 0,5 (recusar nós `html` e `mdxJsx*` no `insertTree`, com diagnóstico) |
| Colar (Q-B) | Resolvido | 0,5 (colar dentro de célula de tabela não testado) |
| UI de link interno | Mínima | 1 |
| Editores de `tabs`, `tab`, `steps`, `diagram` | Genéricos, sem as restrições de estrutura | 1 a 2 |
| Bloco de código | `textarea` | 1 (CodeMirror por bloco, se exigido) |
| Tema da UI do MDXEditor (popups, toolbar) | Só a área editável mapeada | 0,5 |

## Falhas

### 1A 05, 1B 05, 10 05: listas adjacentes (corrigido na parada 4, ver o fim do arquivo)

```diff
 - um
 - dois
+- outra lista
 
-* outra lista
-
 3. três
 4. quatro
```

Causa: o `ListNode` do Lexical 0.48 funde a lista seguinte do mesmo tipo no próprio `$transform` (`node_modules/@lexical/list/dist/LexicalList.dev.mjs:1083`, `mergeNextSiblingListIfSameType(node)`). A fusão já acontece na carga, antes de qualquer edição: o `getTree` logo após abrir a 05 devolve `["list:3","list:2"]` (três itens na primeira lista) e continua igual depois da edição trivial. Duas listas `bullet` vizinhas não existem no modelo do Lexical. O `*` do `expected.md` é o `bulletOther` que o `serializeDok` usa para separar listas irmãs, então a perda está na árvore, não na serialização. O `start` (`3.`) já sai correto com o visitor próprio. Alternativa descartada no spike: separar as listas com nó invisível, que criaria um nó sem forma DokMD.

### 9 D-2 26 e 27: link de título vivo `[](dok:page/…)`

26, esperado × obtido (fim da linha):

```diff
-… e [Página inexistente](dok:page/new?title=P%C3%A1gina%20inexistente).
+… e [Página inexistente](dok:page/new?title=P%C3%A1gina%20inexistente).[](dok:page/0192f0a1-5c3e-7a10-8b2c-3d4e5f607183)
```

27:

```diff
 ![arquitetura.png](dok:asset/0192f0a1-7e50-7c30-8d4e-5f6071829304)
-
-[](dok:page/0192f0a1-5c3e-7a10-8b2c-3d4e5f607183)
```

Causa, medida pela árvore do `getTree` em cada passo: depois de selecionar tudo e Backspace, sobra `paragraph[link(0)]` (o `LinkNode` sem texto não entra na seleção). No colar, `$insertNodes` junta o primeiro parágrafo colado ao que restou e descarta o parágrafo cujo único filho é o `LinkNode` vazio. Carregar as mesmas fixtures (1A 13, 26, 27) passa, porque o import não passa por `$insertNodes`. O defeito é do tratamento de elemento inline vazio no Lexical, e o DokMD usa esse formato para o título vivo.

### 13b: árvore colada com nó `html`

Saída: `exceção no save=page.evaluate: Error: Cannot handle unknown node mdxJsxTextElement`. O `getTree` após colar mostra `{"type":"html","value":"<u>"}` e `{"type":"mdxJsxTextElement","name":"sup",…}`. Cadeia: o `MdastFormattingVisitor` do core converte nós `html` `<u>`/`<sup>`/`<sub>` em formato de texto (`plugins/core/MdastFormattingVisitor.js:13` e `:19`), o `LexicalTextVisitor` exporta esses formatos como `mdxJsxTextElement`, e `convertUnderlineJsxToHtml` só converte `u` de volta para `html` (`exportMarkdownFromLexical.js:199`). O `sup` sobra como JSX e o `serializeDok` do shell lança. A conversão de `u` depende de `jsxIsAvailable` ser `false`: o cell nasce `false` (`plugins/core/index.js:114`) e só o `jsxPlugin` o liga (`plugins/jsx/index.js:78`), que o adaptador não carrega. O `getTree` medido confirma: `<u>` aparece como `{"type":"html","value":"<u>"}`, a forma que `convertUnderlineJsxToHtml` produz. Com `<span style>`, o nó `html` não tem visitor, a importação lança dentro do `editor.update` e o `onError` do editor (`plugins/core/lexicalExtensions.js:26`) relança fora do `try/catch` do adaptador. Hoje só o stub degradado devolve nó `html`, mas o contrato de `insertTree` não impede.

## Desvios e limites

- Teste 4: o `Popover` do seletor de diagrama (`src/shared/EditorShell.tsx`) aparece e fecha antes de 500 ms: o `MutationObserver` registra o `diagram-picker` e, em seguida, a contagem volta a 0. O item "Diagrama" só abre o `Popover` e não chama o adaptador. A hipótese, não confirmada, é o `DropdownMenu` devolver o foco ao gatilho e o `Popover` fechar por foco fora. Não foi medido no Plate. O arquivo é compartilhado e não foi alterado. O teste chama `handle.insertDirective(EDIT.diagram.create({ src, view, title, label: '' }))`, o mesmo nó do `onClick` do seletor, e segue pela UI do nó.
- Teste 2: "apagar o corpo" com o cursor dentro de um callout seleciona só o editor aninhado. O teste põe o cursor no parágrafo final do editor raiz antes de selecionar tudo.
- Edição trivial do teste 1: cursor no primeiro texto Lexical da página, que pode estar dentro de um editor aninhado (16 a 21). A fixture 23 não tem texto Lexical e recebe o clique na área editável.
- Modo sem mitigação: a chave `localStorage` `spike-mdx-sem-mitigacao=1` troca os callouts pelo `AdmonitionDirectiveDescriptor` oficial, tira as ilhas opacas e libera `FORMAT_TEXT_COMMAND`. Existe só para o item 13 e sai do código de produção.
- Ilhas opacas (`footnoteReference`, `footnoteDefinition`, `linkReference`, `imageReference`, `definition`): preservam o nó e mostram um texto de prévia, sem edição. 1A 09 e 1B 14 dependem delas.
- `spread` de lista: o `ListImportVisitor` próprio não lê `spread` e o `ListExportVisitor` grava `spread: false`, como os oficiais. Lista frouxa (itens separados por linha em branco) não foi testada e tende a voltar compacta.
- Não testado: colar dentro de célula de tabela e dentro de editor aninhado, desfazer e refazer entre editores aninhados, edição de tabela, atalhos de lista em `steps`, restrições de estrutura de `tabs` e `steps` na UI, tema das janelas do MDXEditor fora da área editável, acessibilidade.
- `markdown=""`: exigido pelo tipo e pelo código do componente. O import inicial do core com texto vazio roda e é descartado.
- `vite build` rodou sem alterar configs e sem mudar `src/routeTree.gen.ts` (mesmo MD5 antes e depois).

## Saída real

Saída completa em `mdxeditor/playwright-output.txt`. Trechos sem edição:

```
1C 03 a=true b=true c=true (setMode=false) d=true códigos=DOK-E001 manifest=DOK-E001
1C 15 a=true b=true c=true (setMode=false) d=true códigos=DOK-E005,DOK-E006 manifest=DOK-E005,DOK-E006
1C 22 a=true b=true c=true (setMode=false) d=true códigos=DOK-E008 manifest=DOK-E008
1C 24 a=true b=true c=true (setMode=false) d=true códigos=DOK-E003,DOK-E004 manifest=DOK-E003,DOK-E004
1C 30 a=true b=true c=true (setMode=false) d=true códigos=DOK-E002,DOK-E003,DOK-E008 manifest=DOK-E002,DOK-E003,DOK-E008
```

```
2 PASS ok=true erro-adaptador=null
3 WYSIWYG Hora:agora: contém literal=true escapado=false E003=false ok=true
3 fonte <Tabs>/<script>: códigos=DOK-E002,DOK-E002 ok=false
4 seletor de diagrama: apareceu=true aberto após 500 ms=false
4 via=handle.insertDirective (desvio) linha 7 da fixture 23 presente=true ok=true códigos=DOK-W103
5 interno=true pendente=true ok=true códigos=DOK-W101
6 claro={"editColor":"oklch(0.2 0 0)","editBg":"oklch(0.99 0 0)","tokenFg":"oklch(0.2 0 0)","tokenBg":"oklch(0.99 0 0)"}
6 escuro={"editColor":"oklch(0.95 0 0)","editBg":"oklch(0.18 0 0)","tokenFg":"oklch(0.95 0 0)","tokenBg":"oklch(0.18 0 0)"}
6 movimento reduzido: elementos=105 acima de 0,01 ms=[]
7 navegação de cliente: requisições do editor=14 erros=[]
7 carga direta: erros acumulados=[] landing=[]
8 save ok=true códigos= contém HTML/JSX=false erro-adaptador=null
11 contenteditable raiz=false aninhados=["false","false","false","false","false","false"] campos habilitados=0 getDok inalterado=true menu Inserir=0 UI de link=0
```

```
13a oficial: rótulo preservado=false ok=true

:::note
Antes de começar

Você precisa de: agora
```

```
13b sem bloqueio: tags no save=["<u>","</u>"] ok=false códigos=DOK-E002,DOK-E002
13c sem ilha opaca: erro-adaptador=importação: UnrecognizedMarkdownConstructError: Parsing of the following markdown structure failed: {"type":"footnoteReference","name":"N/A"} save igual=false
13e 23: getTree={"tipos":["leafDirective","leafDirective","paragraph"],"ultimoVazio":true} getDok termina com "a)\"}\n\n" save igual=true
13f fonte: setMode(wysiwyg)=false save ok=false códigos=DOK-E002 __pwned=undefined
13f colado: __pwned2=undefined erro-adaptador=null <img> no editor=0
```

Primeira rodada do teste 1, antes dos visitors próprios de lista e quebra (visitors oficiais da 4.2.5), fixture 10:

```
-Linha com quebra\
+Linha com quebra
 seguinte.
```

## Correção da fixture 05 (parada 4)

Critério de saída **não atingido**: 1A, 1B, 1C e alternância fecham, o t14 fica em 30/36. A fusão de listas vizinhas está corrigida em todos os casos. As seis falhas restantes do t14 são de outra causa, lista frouxa e item com vários blocos, fora do escopo desta rodada.

Placar da rodada (`mdxeditor/playwright-output-correcao-05.txt`, 135 testes, 127 passam, 8 falham):

| Item | Antes | Agora |
| --- | --- | --- |
| 1A | 24/25 | **25/25** |
| 1B | 16/17 | **17/17** |
| 1C | 5/5 | 5/5 |
| Alternância (teste 10, corpus) | 24/25 | **25/25** |
| t14 extra | 9/36 | **30/36** (falham x05 e x06, três testes cada) |
| 9 (D-2) | 6/8 | 6/8, fora desta rodada |
| Demais testes (2 a 8, 11, 12, 13) | Passavam | Passam |

Nenhum teste que passava antes passou a falhar. O teste 12 já era intermitente antes da correção (o Radix devolve o foco ao gatilho num efeito posterior ao Escape): com `--repeat-each 5` e sem a correção, 3 de 5 passaram. A asserção do teste passou a esperar o foco por até 2 s, e com isso 5 de 5 passam. O arquivo do teste é do autor desta correção, `tests/mdxeditor/t06-t12-shell.spec.ts`.

### Abordagem

`src/editors/mdxeditor/listNoMerge.ts`, 37 linhas, mais duas linhas em `dokPlugin.tsx` (import e a chamada `installListNoMerge()` no corpo do módulo, antes de qualquer editor existir).

O que foi sobrescrito: o `$transform` declarado no `$config` do `ListNode` do `@lexical/list` 0.48 (`node_modules/@lexical/list/dist/LexicalList.dev.mjs:1080-1085`), que chama `mergeNextSiblingListIfSameType` (`:367-372`, que por sua vez chama `mergeLists`, `:271`). O substituto mantém a outra metade do transform original, a numeração dos itens, reimplementada a partir de `updateChildrenListItemValue` (`:344-360`, não exportada), e não funde nada.

A troca é feita no registro estático do Lexical, por `getStaticNodeConfig(ListNode).ownNodeConfig.$transform`. `getStaticNodeConfig` é exportado pelo pacote `lexical` e tem cache por classe (`node_modules/lexical/dist/Lexical.dev.mjs:17770`), e cada `createEditor` lê esse registro em `getTransformSetFromKlass` (`:14427-14445`, usado em `:14549`). Assim a troca vale para o editor raiz e para todo editor aninhado criado depois, inclusive os que importam conteúdo no próprio `initialEditorState`, que era o ponto onde a fusão acontecia antes de qualquer código do adaptador poder agir.

Por que não uma subclasse com `replace`: `getTransformSetFromKlass` percorre `iterStaticNodeConfigChain`, e o `$transform` do `ListNode` entra na cadeia de qualquer subclasse. Substituir o nó não removeria a fusão.

Alcance: a troca é global para o `ListNode` na página. O `mergeLists` continua em pé nas operações de edição que o usam de propósito, indentação e remoção de item aninhado (`:800`). Só o transform automático de lista suja deixou de fundir.

Medição da causa antiga, com o `getTree` da fixture 05 logo na carga e antes de qualquer edição: `["list:3","list:2"]` com os visitors oficiais (a primeira lista já vinha com três itens), contra `["list:2","list:2"]` depois da correção. A fusão acontecia na importação, não na edição.

### O que ficou de fora e por quê

x05 e x06 (listas vizinhas com item de vários blocos) falham por lista frouxa, não por fusão. Diferença medida na carga da x05:

```
SPREAD obtido   [{"spread":false,"itens":[{"spread":false,"blocos":["paragraph"]},…]},…]
SPREAD parseDok [{"spread":true,"itens":[{"spread":true,"blocos":["paragraph","paragraph"]},…]},…]
```

Duas perdas independentes da fusão, ambas nos visitors do MDXEditor 4.2.5:

1. `spread` nunca é exportado. O `LexicalListVisitor` grava só `ordered` e `spread: false` (`plugins/lists/LexicalListVisitor.js:6`) e o `LexicalListItemVisitor` grava `spread: false` em todo item (`plugins/lists/LexicalListItemVisitor.js`). O `ListExportVisitor` próprio do adaptador herdou isso ao acrescentar `start`.
2. Item com dois parágrafos vira um parágrafo só. O `MdastParagraphVisitor` representa a separação com dois `LineBreakNode` dentro do `ListItemNode` (`plugins/core/MdastParagraphVisitor.js:6-16`), e o caminho de volta devolve texto com `\n\n` dentro de um único parágrafo.

Saída real da x05 nesta rodada:

```
14 x05-ul-ul-varios-blocos carga FAIL
@@ -10,12 +10,9 @@
 
   continuação do um
-
 - dois
 
 * três
-
   ```ts
   const x = 1
   ```
-
 * quatro
```

Corrigir isso exige estado próprio no `ListNode` e no `ListItemNode` (o `NodeState` do Lexical) para carregar `spread`, e um modelo de item com blocos de verdade no lugar do par de `LineBreakNode`. Estimativa de 1 a 1,5 dia, fora do escopo da parada 4, que pediu a fusão. Pela regra de esforço da rodada, nenhuma correção pontual foi tentada para fechar x05 e x06.

Saída real da correção:

```
1A 05 PASS
1B 05 PASS
10 05 PASS setMode(source)=true setMode(wysiwyg)=true erro-adaptador=null
14 x01-ul-ul carga PASS
14 x02-ol-ol carga PASS
14 x07-tres-ul-seguidas carga PASS
14 x08-citacao-ul-ul carga PASS
14 x09-citacao-ol-ol-varios-blocos carga PASS
14 x10-callout-ul-ul carga PASS
14 x11-callout-ol-ol-varios-blocos carga PASS
14 x12-callout-ul-ol carga PASS
```

### Por que x08 passa e x05/x06 não: causa exata (T-0002)

Diagnóstico feito com o dev server do spike (porta 5311) e com chamadas diretas a `parseDok` sobre texto reconstruído à mão, sem alterar `extra/`, o corpus ou o adaptador. Peças do mecanismo, cada uma verificada:

**1. O `save()` do shell faz duas serializações, não uma.** `saveDok = normalizeDok(getDok())`, e `normalizeDok` reparseia o texto já serializado uma vez (`parseDok(texto) → serializeDok`). Instrumentando `mdast-util-to-markdown/lib/util/container-flow.js` (`between()`, revertido depois da medição) e capturando o console do navegador, cada `save()` de uma fixture com lista mostra dois conjuntos de chamadas de `join`, um por passagem.

**2. Na primeira passagem, o item-item de qualquer lista sai apertado.** O `getTree()` do adaptador grava `spread: false` em todo `list` e `listItem` (achado já registrado acima). `mdast-util-to-markdown@9.0.0` decide a quebra entre itens irmãos por `parent.spread` (`node_modules/mdast-util-to-markdown/lib/join.js:25-38`, função `joinDefaults`): `spread` falso devolve `0`, que vira `\n`.repeat(1) em `container-flow.js:74-76`, ou seja uma linha só, sem branco. A junção entre dois parágrafos do mesmo item (`left.type === 'paragraph' && left.type === right.type`) é a única exceção, sempre incondicional (`join.js:26-35`), o que explica por que o parágrafo de continuação nunca se perde, só a linha em branco ao redor dele.

**3. A segunda passagem reparseia esse texto já apertado, e o resultado depende de onde a lista está.** `mdast-util-from-markdown@2.0.3`, função `prepareList` (`node_modules/mdast-util-from-markdown/lib/index.js:278-382`), decide `list.spread` andando para trás a partir do ponto em que a lista fecha (linha 330: o gatilho é tanto "começa o próximo item" quanto "a própria lista fecha", `containerBalance === -1`). Se esse fechamento encontra uma linha em branco logo antes (linhas 336-343), marca `listSpread = true` para a lista inteira, mesmo que a linha em branco pertença à separação para a lista seguinte, não a um item interno. `containerBalance` conta `blockQuote` do mesmo jeito que `listOrdered`/`listUnordered` (linhas 292-304), e uma linha em branco dentro de uma citação (uma linha só com `>`) é absorvida como conteúdo contínuo da citação em vez de fechar o contêiner de forma limpa. Na raiz, a mesma linha em branco fecha a lista de forma limpa, sem contaminar o `spread`.

**4. Verificação direta com `parseDok`, sem o editor, isolando a variável:**

```
lista apertada de 2 itens + lista diferente logo depois, na raiz:
  list spread= false   (fecha limpo, sem contaminação)

a mesma forma dentro de citação (> ):
  list spread= true    (a linha em branco da citação contamina a lista anterior)

a mesma forma dentro de citação, com item de vários blocos:
  list spread= true    (contamina do mesmo jeito, com ou sem parágrafo extra)
```

Isso prova que a diferença não está no parágrafo de continuação. Está em a lista estar dentro de uma citação (ou, por extensão de código, de qualquer contêiner que o `containerBalance` de `prepareList` trate como `blockQuote`) e ser seguida por outra lista. x08 tem exatamente essa forma e se autocorrige na segunda passagem, por acidente do reparse, não porque o exportador do MDXEditor preserva `spread`. x05 e x06 estão na raiz e não têm esse acidente para se apoiar.

**5. Por que x09, x10, x11 e x12 passam sem depender desse acidente.** Nenhum deles tem uma lista com dois ou mais itens que precise de linha em branco entre irmãos: x09 e x11 têm listas de um item só (a mudança de marcador `1.`/`1)` cria uma lista nova de um item, não dois itens na mesma lista), x10 e x12 têm listas tight ou também de um item. O único caso da suíte `extra/` que testa "linha em branco entre itens irmãos sobrevive ao save" é x08, e ele passa pelo acidente do item 3, não por correção real.

**Conclusão para a fatia F4:** a estimativa de 1 a 1,5 dia (seção "Adaptador" acima) segue de pé. A correção precisa gravar o `spread` real de `list` e `listItem` no `NodeState` do Lexical na importação e lê-lo de volta na exportação, o que resolve a raiz (passo 2) e torna irrelevante o acidente do passo 3. Depois da correção, x08 passa pela razão certa, não mais pelo reparse. O ponto novo desta análise: hoje nenhuma fixture do corpus do ADR 002 e só um caso de `extra/` (x08) exercitam essa forma, e esse único caso passa por um efeito colateral do `mdast-util-from-markdown` dentro de citação, não por o MDXEditor preservar a informação. A cobertura real de "lista frouxa com itens irmãos" é, na prática, zero.
