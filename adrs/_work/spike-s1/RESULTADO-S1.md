# Spike S-1 — Resultado consolidado (parada 4)

Data: 2026-09-19. Fontes: `mdxeditor/RESULTADO.md`, `plate/RESULTADO.md`, saídas brutas `*/playwright-output*.txt`, `shared-independentes-output.txt`, `AMBIENTE.md`.

## Placar

| Teste | MDXEditor 4.2.5 | Plate 53.3.14 |
| --- | --- | --- |
| Gate do porte (referência) | 30/30 | 30/30 |
| 1A expected (25) | 24/25 (falha 05) | 22/25 (falham 05, 06, 23) |
| 1B input canonical (17) | 16/17 (falha 05) | 14/17 (falham 05, 06, 23) |
| 1C erro (5) | 5/5 | 5/5 |
| **E-01 (A + C = 30)** | **29/30, não passa** | **27/30, não passa** |
| 2 callout pela UI (fixture 16) | Passa | Passa |
| **3 (E-02)** | **Passa** | **Passa** |
| 4 diagrama pela UI (fixture 23) | Passa (reexecutado após correção do shell) | Passa (reexecutado após correção do shell) |
| 5 link interno e pendente | Passa | Passa |
| 6 tema por token, preflight Tailwind, reduced motion | Passa (1 regra da biblioteca sobrescrita) | Passa (0 regras) |
| 7 (E-07) lazy, hidratação, landing sem editor | Passa | Passa |
| 8 colar Google Docs e GitHub (roteamento) | Passa | Passa |
| 9 D-2 roteamento (8) | 6/8 (falham 26, 27) | 8/8 |
| 10 alternância WYSIWYG ↔ fonte | 24/25 (falha 05) + edição no fonte passa | 23/25 (falham 05, 06) + edição no fonte passa |
| 11 (E-13) somente leitura e banner | Passa | Passa |
| 12 portal Radix sobre o editor | Passa | Passa |
| E-10, E-11, E-12 (independentes de editor, D-4) | Passam (um teste só, `tests/shared`) | idem |
| Peso do chunk do adaptador (gzip) | 132,88 kB + 9,09 kB CSS | 265,05 kB (inclui `marked`, `remark-mdx`, `acorn`, sem executar) |

Correção feita no shell compartilhado durante a consolidação: o seletor de diagrama (Radix Popover aberto a partir do DropdownMenu) fechava na hora porque o menu devolvia o foco ao gatilho. `EditorShell.tsx` passou a abrir o Popover em `onCloseAutoFocus` com `preventDefault`. Depois da correção, as duas suítes completas foram reexecutadas: MDXEditor 94/99 (`mdxeditor/playwright-output-final.txt`), Plate 89/98 (`plate/playwright-output-final.txt`). As falhas são as mesmas da execução dos subagentes, menos o teste 4, que passa nos dois pelo seletor real. O teste 12 (Escape devolve o foco ao gatilho) continua passando nos dois.

## Causa das falhas

MDXEditor:
- 05 (1A, 1B, 10): o `ListNode` do Lexical 0.48 funde listas vizinhas do mesmo tipo já na carga (`LexicalList.dev.mjs:1083`). C 1 a 1,5 dia, não implementado.
- D-2 26 e 27: link de título vivo `[](dok:page/…)` com texto vazio some ao ser inserido por `$insertNodes` e sobra ao apagar tudo. C 1 dia.
- 09 e 14B passam com "ilha opaca": nó que preserva notas de rodapé e referências sem permitir edição. Round-trip correto, edição ausente. Notas de rodapé editáveis: C 2 a 3 dias.
- Colar árvore com nó `html` (só o stub degradado devolve isso hoje): o save lança exceção. C 0,5 dia (recusar no adaptador).

Plate:
- 05 e 06 (1A, 1B, 10): o `@platejs/list` é por indentação, sem nó de lista nem item com mais de um bloco. Listas vizinhas se fundem em `convertNodesSerialize` (`index.js:603`) e o segundo parágrafo do item sai da lista. C 3 a 5 dias, com risco (o caminho `list-classic` exige outro pacote, não instalado).
- 23: documento só com diagramas; o clique da edição trivial seleciona o nó void e o Backspace o apaga. Sem edição o round-trip é exato. C 0,5 dia.
- Regras nativas perdem `title` de link, `meta` de código, `align` de tabela, imagem inline e referências; primeira execução só com regras nativas: 1A 15/25, 1B 9/17. Todas corrigidas no adaptador (C 1 dia).
- `callout: null` não desliga a regra nativa de elemento.

## Leitura contra a regra de aceite do ADR 002 (seção 8.2)

- Regra: "Pelo menos um candidato passa nos testes 1 e 3". Nenhum passa no teste 1 ao pé da letra (30/30).
- Desempate escrito: "Se nenhum passar, repetir com Milkdown. Se o Milkdown também falhar, reabrir este ADR".
- As falhas não são do formato: o porte passa 30/30, e cada falha tem causa localizada no modelo interno do editor, com correção estimada em código próprio.

## Achados paralelos

- W103 falso no validador de referência do ADR 002 (pendência 13 em `ADR-005-pendencias-ledger.md`).
- zod do app × contrato do 002 (pendência 6).
- MDXEditor: o app teria de declarar `lexical` e `@lexical/*`, hoje só transitivos.

## Decisão da parada 4 (2026-09-19)

O arquiteto técnico escolheu corrigir a fixture 05 no MDXEditor antes de aplicar a regra do Milkdown, com três travas:

1. Prazo fixo de 1,5 dia. Critério de saída: suíte completa com 1A 25/25, 1B 17/17, 1C 5/5 e alternância 25/25. Sem isso, aplica-se a regra do Milkdown, sem prorrogação.
2. Correção de modelo, não de fixture. A correção impede a fusão de listas vizinhas em geral. Casos de regressão fora do corpus ficam em `extra/`: listas vizinhas ordenada/ordenada, não ordenada/não ordenada, de tipos diferentes, com e sem item de vários blocos, e o mesmo dentro de citação e de callout. Todos passam na carga, na alternância e depois de uma edição. O corpus do ADR 002 não muda.
3. Consequência negativa a registrar no ADR 005: a correção sobrescreve comportamento interno do Lexical (LexicalList, fusão na carga). `lexical` e `@lexical/*` viram dependências diretas do app com versão exata, e a suíte do S-1 vira gate de qualquer atualização do Lexical.

Fora do prazo, como C na ponderação e fatias de implementação: D-2 26/27, notas de rodapé editáveis. A exceção ao colar árvore com nó `html` é fatia obrigatória antes de liberar o editor (um save que lança exceção perde trabalho do usuário).

O Plate não recebe a mesma rodada: a falha dele é de modelo (lista por indentação sem item de vários blocos, 3 a 5 dias com risco).

## Desfecho da rodada de correção (parada 4)

Saída real: `mdxeditor/playwright-output-correcao-05.txt`, 135 testes, 127 passam, 8 falham.

### Trava 1, critério numérico: atingida

| Item | Antes | Depois |
| --- | --- | --- |
| 1A expected | 24/25 | **25/25** |
| 1B input canonical | 16/17 | **17/17** |
| 1C erro | 5/5 | **5/5** |
| **E-01 (A + C)** | 29/30 | **30/30** |
| Alternância (D-5) | 24/25 | **25/25** |
| D-2 roteamento | 6/8 | 6/8 (fora da rodada por decisão da parada 4) |

Nenhum teste que passava antes passa a falhar.

### Trava 2, correção de modelo: verificada na forma, incompleta no resultado

A correção substitui o `$transform` declarado no `$config` do `ListNode` do `@lexical/list` 0.48 (`LexicalList.dev.mjs:1080-1085`), que chamava `mergeNextSiblingListIfSameType` (`:367-372`). O substituto mantém só a numeração dos itens. A troca acontece no registro estático (`getStaticNodeConfig(ListNode).ownNodeConfig.$transform`), lido por cada `createEditor` em `getTransformSetFromKlass` (`Lexical.dev.mjs:14427-14445`), porque o transform é herdado pela cadeia de configuração e os editores aninhados importam conteúdo no próprio `initialEditorState`. Arquivos: `src/editors/mdxeditor/listNoMerge.ts` (37 linhas) e duas linhas em `dokPlugin.tsx`.

Revisão de conformidade: nenhum caso especial por fixture, nenhuma chamada a `parseDok`, `serializeDok` ou `normalizeDok` dentro do adaptador, e `extra/`, `tests/mdxeditor/t14-extra-listas.spec.ts`, `src/shared`, `content-format`, `src/routes`, configs e `package.json` sem alteração (`git diff --stat`). A única mudança de teste está no `tests/mdxeditor/t06-t12-shell.spec.ts`, arquivo do próprio subagente: o teste 12 passou a esperar até 2 s pelo foco no gatilho, porque o Radix devolve o foco num efeito posterior ao Escape. O teste já era intermitente antes da correção (3 de 5 com `--repeat-each 5`), e depois do ajuste dá 5 de 5.

Casos extras de regressão (`extra/`, 12 casos, 3 testes cada): **30/36**, contra 9/36 na linha de base (`extra/baseline-antes-da-correcao.txt`). Falham os três testes de `x05-ul-ul-varios-blocos` e os três de `x06-ol-ol-varios-blocos`.

### Causa do que sobrou: lista frouxa, não fusão

As seis falhas restantes têm causa diferente da fusão. O diff é só de linha em branco:

```
   continuação do um
-
 - dois

 * três
-
   ```ts
```

Nenhum conteúdo se perde. O parágrafo de continuação, o bloco de código e a citação continuam dentro do item. O que se perde é o `spread` do CommonMark: a lista frouxa volta apertada. Medido na carga da x05, `spread` vem `false` em listas e itens contra `true` no `parseDok`. Origem nos visitors do MDXEditor, que gravam `spread: false` (`LexicalListVisitor.js:6`, `LexicalListItemVisitor.js`) e representam parágrafos do item com par de `LineBreakNode` (`MdastParagraphVisitor.js:6-16`). Correção estimada em 1 a 1,5 dia, com `NodeState` para `spread` e modelo de item com blocos.

### Achado: o corpus do ADR 002 não cobre lista frouxa

Nenhuma das 30 fixtures tem lista frouxa. A fixture 05 tem três listas vizinhas, todas apertadas. O E-01 30/30 não prova, portanto, que uma lista com parágrafo de continuação sobrevive ao round-trip no MDXEditor. Os casos `extra/` exigidos pela trava 2 são o que expõe a lacuna, e o corpus do ADR 002 fica com uma fatia de teste a acrescentar (dono: ADR 002, fatia F5).

### Verificações de bundle (parada 3, item 2, e D-3)

Build `mdxeditor/dist-check`, chunks em `client/assets`:

- Nenhum chunk contém `js-yaml`, `argparse`, `ArgumentParser` ou `YAMLException`. O `argparse` com licença Python-2.0 fica fora do bundle de produto.
- O runtime do Lexical (`createEditor`, `registerNodeTransform`) aparece só em `Adapter-vQce0VTX.js`, o chunk lazy da rota de edição. Os chunks de leitura (`read-*.js`, 244 e 503 bytes), de rota e de índice não o carregam. As ocorrências da palavra `mdxeditor` no `index-*.js` são o nome do arquivo de rota, não a biblioteca.
