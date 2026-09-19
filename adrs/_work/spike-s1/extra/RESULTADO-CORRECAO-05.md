# Correção da fixture 05 (MDXEditor) — resultado consolidado

Data: 2026-09-19. Trava e instrução de origem: `A-Q-0001` (`aprovado_por: humano`), decisão 1 sobre `Q-0001` (`tasks/done/`). Comando: `SPIKE_PORT=5311 npx playwright test tests/mdxeditor 2>&1 | tee mdxeditor/playwright-output-correcao-05.txt`, 135 testes, 127 passam, 8 falham.

## Trava 1, critério numérico

| Item | Antes da correção | Depois |
| --- | --- | --- |
| 1A expected (25) | 24/25 | **25/25** |
| 1B input canonical (17) | 16/17 | **17/17** |
| 1C erro (5) | 5/5 | 5/5 |
| E-01 (A + C, 30) | 29/30 | **30/30** |
| Alternância, teste 10, corpus (25) | 24/25 | **25/25** |
| D-2, teste 9 (8) | 6/8 | 6/8, fora da rodada por decisão de `A-Q-0001` |

Nenhum teste que passava antes passa a falhar (`git diff --stat` contra `tests/mdxeditor`, `extra/`, `src/shared`, `content-format`, `src/routes`, configs e `package.json`: sem alteração, exceto `tests/mdxeditor/t06-t12-shell.spec.ts`, ver Arquivos tocados).

## Trava 2, correção de modelo

Substitui o `$transform` estático do `ListNode` do `@lexical/list` 0.48, que fundia a lista seguinte do mesmo tipo já na carga (`node_modules/@lexical/list/dist/LexicalList.dev.mjs:1080-1085`, chamava `mergeNextSiblingListIfSameType`, `:367-372`). A troca acontece no registro estático do Lexical (`getStaticNodeConfig(ListNode).ownNodeConfig.$transform`), lido por cada `createEditor` em `getTransformSetFromKlass` (`node_modules/lexical/dist/Lexical.dev.mjs:14427-14445`), porque o transform é herdado pela cadeia de configuração e os editores aninhados importam conteúdo no próprio `initialEditorState`, antes de qualquer código do adaptador. O substituto mantém a outra metade do transform original, a numeração dos itens, reimplementada a partir de `updateChildrenListItemValue` (`LexicalList.dev.mjs:344-360`, não exportada).

Medição da causa antiga: `getTree` da fixture 05 logo na carga, antes de qualquer edição, devolvia `["list:3","list:2"]` com os visitors oficiais (a primeira lista já vinha com três itens); depois da correção, `["list:2","list:2"]`.

### Os 12 casos de `extra/`, nos três momentos

| Caso | Carga | Alternância | Edição |
| --- | --- | --- | --- |
| x01-ul-ul | PASS | PASS | PASS |
| x02-ol-ol | PASS | PASS | PASS |
| x03-ul-ol | PASS | PASS | PASS |
| x04-ol-ul | PASS | PASS | PASS |
| x05-ul-ul-varios-blocos | **FAIL** | **FAIL** | **FAIL** |
| x06-ol-ol-varios-blocos | **FAIL** | **FAIL** | **FAIL** |
| x07-tres-ul-seguidas | PASS | PASS | PASS |
| x08-citacao-ul-ul | PASS | PASS | PASS |
| x09-citacao-ol-ol-varios-blocos | PASS | PASS | PASS |
| x10-callout-ul-ul | PASS | PASS | PASS |
| x11-callout-ol-ol-varios-blocos | PASS | PASS | PASS |
| x12-callout-ul-ol | PASS | PASS | PASS |

30 de 36 subtestes passam, contra 9 de 36 na linha de base sem a correção (`extra/baseline-antes-da-correcao.txt`). A fusão de listas vizinhas está corrigida em todos os casos que a exercitam sozinha, incluindo tipos diferentes (x03, x04), três listas seguidas (x07) e dentro de citação e de callout (x08 a x12). As seis falhas restantes são x05 e x06, as duas únicas que combinam listas vizinhas com item de vários blocos.

### Causa das seis falhas: lista frouxa, não fusão

O diff é só de linha em branco, nenhum conteúdo perdido:

```
   continuação do um
-
 - dois

 * três
-
   ```ts
```

Medido na carga da x05: `spread` vem `false` em listas e itens contra `true` no `parseDok`. Duas perdas independentes da fusão, ambas nos visitors do MDXEditor 4.2.5:

1. `spread` nunca é exportado. `LexicalListVisitor` grava só `ordered` e `spread: false` (`plugins/lists/LexicalListVisitor.js:6`), `LexicalListItemVisitor` grava `spread: false` em todo item.
2. Item com dois parágrafos vira um parágrafo só. `MdastParagraphVisitor` representa a separação com dois `LineBreakNode` dentro do `ListItemNode` (`plugins/core/MdastParagraphVisitor.js:6-16`), e o caminho de volta devolve texto com `\n\n` dentro de um único parágrafo.

Correção estimada em 1 a 1,5 dia: `NodeState` para `spread` no `ListNode` e no `ListItemNode`, e um modelo de item com blocos de verdade no lugar do par de `LineBreakNode`. Fora do escopo desta rodada, que pediu a correção da fusão. Nenhuma correção pontual foi tentada, por decisão de `A-Q-0001` ("se a correção geral não fechar o critério, para sem ajuste pontual").

## Arquivos tocados

| Arquivo | Mudança |
| --- | --- |
| `src/editors/mdxeditor/listNoMerge.ts` | Novo, 37 linhas. `installListNoMerge()` |
| `src/editors/mdxeditor/dokPlugin.tsx` | +2 linhas: import e chamada de `installListNoMerge()` no corpo do módulo, antes de qualquer editor |
| `tests/mdxeditor/t06-t12-shell.spec.ts` | O teste 12 (foco após Escape no menu Inserir) passou a esperar até 2 s pelo foco no gatilho, porque o Radix devolve o foco num efeito posterior ao Escape. Já era intermitente antes da correção (3 de 5 com `--repeat-each 5`), 5 de 5 depois do ajuste |

`git diff --stat` confirma que `extra/`, `tests/mdxeditor/t14-extra-listas.spec.ts`, `src/shared`, `content-format`, `src/content-components`, `src/editors/contract.ts`, `src/routes`, configs e `package.json` não foram tocados.

## Saída real

Placar completo em `mdxeditor/playwright-output-correcao-05.txt`. Trecho com as 30 fixtures do corpus (1A/1B):

```
1A PASS: 25  1A FAIL: 0
1B PASS: 17  FAIL: 0
```

Trecho com os 8 testes que falham, ao final do arquivo:

```
  8 failed
    tests/mdxeditor/t08-t10-colar-alternancia.spec.ts:41:5 › 9 D-2 colar input.md das fixtures import › 9 D-2 26
    tests/mdxeditor/t08-t10-colar-alternancia.spec.ts:41:5 › 9 D-2 colar input.md das fixtures import › 9 D-2 27
    tests/mdxeditor/t14-extra-listas.spec.ts:22:5 › 14 extra x05-ul-ul-varios-blocos › 14 x05-ul-ul-varios-blocos carga
    tests/mdxeditor/t14-extra-listas.spec.ts:29:5 › 14 extra x05-ul-ul-varios-blocos › 14 x05-ul-ul-varios-blocos alternância
    tests/mdxeditor/t14-extra-listas.spec.ts:41:5 › 14 extra x05-ul-ul-varios-blocos › 14 x05-ul-ul-varios-blocos edição na última lista
    tests/mdxeditor/t14-extra-listas.spec.ts:22:5 › 14 extra x06-ol-ol-varios-blocos › 14 x06-ol-ol-varios-blocos carga
    tests/mdxeditor/t14-extra-listas.spec.ts:29:5 › 14 extra x06-ol-ol-varios-blocos › 14 x06-ol-ol-varios-blocos alternância
    tests/mdxeditor/t14-extra-listas.spec.ts:41:5 › 14 extra x06-ol-ol-varios-blocos › 14 x06-ol-ol-varios-blocos edição na última lista
  127 passed (3.1m)
```

Trecho com as 36 linhas de `console.log` dos casos `extra/`:

```
14 x01-ul-ul carga PASS
14 x01-ul-ul alternância voltou=true PASS
14 x01-ul-ul edição (textos em li=4) PASS
14 x02-ol-ol carga PASS
14 x02-ol-ol alternância voltou=true PASS
14 x02-ol-ol edição (textos em li=4) PASS
14 x03-ul-ol carga PASS
14 x03-ul-ol alternância voltou=true PASS
14 x03-ul-ol edição (textos em li=4) PASS
14 x04-ol-ul carga PASS
14 x04-ol-ul alternância voltou=true PASS
14 x04-ol-ul edição (textos em li=4) PASS
14 x05-ul-ul-varios-blocos carga FAIL
14 x05-ul-ul-varios-blocos alternância voltou=true FAIL
14 x05-ul-ul-varios-blocos edição (textos em li=5) FAIL
14 x06-ol-ol-varios-blocos carga FAIL
14 x06-ol-ol-varios-blocos alternância voltou=true FAIL
14 x06-ol-ol-varios-blocos edição (textos em li=6) FAIL
14 x07-tres-ul-seguidas carga PASS
14 x07-tres-ul-seguidas alternância voltou=true PASS
14 x07-tres-ul-seguidas edição (textos em li=3) PASS
14 x08-citacao-ul-ul carga PASS
14 x08-citacao-ul-ul alternância voltou=true PASS
14 x08-citacao-ul-ul edição (textos em li=4) PASS
14 x09-citacao-ol-ol-varios-blocos carga PASS
14 x09-citacao-ol-ol-varios-blocos alternância voltou=true PASS
14 x09-citacao-ol-ol-varios-blocos edição (textos em li=4) PASS
14 x10-callout-ul-ul carga PASS
14 x10-callout-ul-ul alternância voltou=true PASS
14 x10-callout-ul-ul edição (textos em li=4) PASS
14 x11-callout-ol-ol-varios-blocos carga PASS
14 x11-callout-ol-ol-varios-blocos alternância voltou=true PASS
14 x11-callout-ol-ol-varios-blocos edição (textos em li=4) PASS
14 x12-callout-ul-ol carga PASS
14 x12-callout-ul-ol alternância voltou=true PASS
14 x12-callout-ul-ol edição (textos em li=2) PASS
```

## Achado paralelo: cobertura do corpus do ADR 002

Nenhuma das 30 fixtures do ADR 002 exercita `list.spread = true` na raiz (linha em branco entre itens irmãos). A fixture 06 cobre item de vários blocos e `listItem.spread = true`, e passa. A lacuna virou pendência 14 em `ADR-005-pendencias-ledger.md`, dono ADR 002 (fatia F5). Não muda o resultado desta rodada.

## Verificações de bundle (parada 3, item 2, e D-3)

Build `mdxeditor/dist-check`: nenhum chunk contém `js-yaml`, `argparse`, `ArgumentParser` ou `YAMLException`. O runtime do Lexical (`createEditor`, `registerNodeTransform`) aparece só em `Adapter-vQce0VTX.js`, o chunk lazy da rota de edição. Os chunks de leitura (`read-*.js`) têm 244 e 503 bytes.
