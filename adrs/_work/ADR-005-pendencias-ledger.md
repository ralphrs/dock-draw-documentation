# ADR 005 — Pendências para o diff do LEDGER (parada 5)

Acumuladas durante a sessão de 2026-09-19. Nenhuma foi aplicada. Viram o diff proposto na parada 5.

## Texto do ledger (pedidas na aprovação da Etapa 0)

1. **Nota velha do 005** na tabela "Numeração oficial": trocar "Não escrito — o arquivo `ADR-005-edicao.md` contém o prompt, não o ADR" pelo estado real depois da escrita.
2. **Fechar C-5**: o `prompts/PROMPT-ADR-005.md` já pede 30/30 (E-01). Mover para resolvido, com a referência ao prompt.
3. **C-6**: continua em aberto (ADR 004 cita "ADR 005/006" para o diff visual; ADR 002 chama o 003 de "ADR de persistência"). Acrescentar que o ADR 005 decidiu o diff renderizado (D-4: `<RevisionDiff>` usa a fatia `read` do 007), o que resolve a parte "005/006" do C-6.

## Esclarecimentos do S-1 (não mudam números)

4. **Teste 1 do S-1**: o ADR 002 pedia `expected.md` para as 30, e 5 fixtures (03, 15, 22, 24, 30) não têm. Texto proposto: "As 25 fixtures com `expected.md` passam por igualdade após `normalizeDok`. As 5 de erro passam se o editor recusa abrir no WYSIWYG, cai para o modo fonte com o diagnóstico visível, não altera um byte do texto e o save retorna exatamente os DOK-E do manifest. Conta 30/30. Nas 17 fixtures `canonical` com `expected.md`, o `input.md` também é carregado e precisa chegar ao `expected.md`."
5. **Teste 4 do S-1 (E-03)**: texto proposto: "Inserir diagrama pela UI gera a forma da fixture 23 (eliminatório do ADR 005). A migração do legado da fixture 25 sai do S-1 e vira critério de pronto da fatia F6 do ADR 002 (importadores). No S-1, a fixture 25 entra só no teste de roteamento do colar (D-2), com a porta `importDialect` em stub."

## Contrato do ADR 002 × app

6. **zod**: o contrato do 002 lista `zod ^4.6.5` "provavelmente já presente no app". O `insumos/package.json` do app tem `zod ^3.25.76`. Evidência (`adrs/_work/spike-s1/AMBIENTE.md`): o módulo portado importando `zod/v4` do `zod@3.25.76` passa 30/30; importando a API 3 clássica falha na carga (`z.uuid is not a function`). Proposta de correção no contrato do 002: dependência "zod (API v4): `^4.6.5`, ou `^3.25.76` importando de `zod/v4`; o `src/content-format` importa sempre de `zod/v4`". Dono: ADR 002 (via ledger, é correção de fato sem mudança de decisão). A decisão de subir o app para zod 4 fica fora do ADR 005.

## Status (se o S-1 passar)

7. Mover 002, 003, 004 e 005 para "Aceitos", conforme o prompt do 005 ("Ao terminar").

## Novos itens do ADR 005 para o ledger

8. Contrato do 005 (seção 13 do ADR).
9. Premissa nova para o 007: "o renderer de leitura emite posição de origem por bloco (`data-line-start`/`data-line-end`)" e "implementa a fatia `read` de `src/content-components` para todos os nomes do registro".
10. Premissa nova para o 010: "implementa a fatia `export` de `src/content-components` para todos os nomes do registro".
11. C-4: resolvido pelo 005 (ancoragem em `<RevisionView>`, fora do editor). Lacuna registrada com dono na fatia de implementação do 005: comentários da revisão anterior dentro do rascunho.
12. Restrição do prompt 007 "todo componente implementa as três representações" substituída pelo teste de completude do registry (D-3). Registrar como premissa para o prompt 007, que não é editado nesta sessão.

## Achados do S-1 para o ADR 002 (sem editar o 002 nesta sessão)

13. **W103 falso no validador de referência.** Em `leafDirective`, o rótulo `[..]` vira filhos diretos (phrasing), sem parágrafo com `data.directiveLabel`. O `validate` do harness procura `children[0].data.directiveLabel` e emite DOK-W103 em todo `::diagram` com descrição. A fixture 23 espera W103 (o segundo diagrama não tem rótulo) e o check deduplica os códigos, o que esconde o defeito. Evidência: `harness/dokmd.mjs` linha 253 e o teste com diagrama rotulado (`validate` devolve W103, `children` = `[{type:'text', value:'Descrição'}]`). Só aviso, não bloqueia save nem S-1. Dono: ADR 002, fatia F2 (validação). O porte do spike mantém o comportamento do harness.

14. **O corpus de 30 fixtures não cobre `list.spread = true`, e a única cobertura informal (`extra/x08`) passa por acidente de parser, não por correção real.** Varredura das 30 fixtures pelo `parseDok`: a fixture 06 tem `listItem.spread = true` e item de vários blocos, e nenhuma tem `list.spread = true`, a linha em branco entre itens irmãos.

    Causa exata, verificada em `mdxeditor/RESULTADO.md` (seção "Por que x08 passa e x05/x06 não", T-0002): o adaptador do MDXEditor grava `spread: false` em todo `list`/`listItem` na exportação. `normalizeDok` reparseia o texto já apertado uma segunda vez, e o `prepareList` do `mdast-util-from-markdown@2.0.3` (`lib/index.js:278-382`) recalcula `list.spread` andando para trás a partir do fechamento da lista. Quando esse fechamento acontece dentro de uma citação (`blockQuote`, tratado por `containerBalance` do mesmo jeito que lista aninhada), uma linha em branco que na verdade separa a lista da lista seguinte é absorvida como se fosse interna, e `listSpread` vira `true` por acidente. Na raiz do documento, a mesma linha em branco fecha a lista de forma limpa e o acidente não acontece. Confirmado com `parseDok` isolado: a mesma forma (lista de 2 itens tight, seguida de outra lista) reparseia `spread=false` na raiz e `spread=true` dentro de citação.

    De todos os 12 casos de `extra/` (parada 4), só `x08-citacao-ul-ul.md` testa "linha em branco entre itens irmãos sobrevive ao save", e ele passa por esse acidente de reparse, não porque o MDXEditor preserva a informação. `x09`, `x10`, `x11` e `x12` não testam essa forma (listas de um item só, ou tight). O MDXEditor falha nas duas fixtures fora de citação que testam a mesma forma (`x05-ul-ul-varios-blocos.md`, `x06-ol-ol-varios-blocos.md`).

    Um editor pode passar em 30/30 e ainda perder a forma da lista, e o único caso da suíte informal que sugeria o contrário passa pelo motivo errado. Dono: ADR 002, fatia F5 (fixtures), que ganha um caso com lista frouxa na raiz e um caso com lista frouxa fora de citação/callout, para não repetir a lacuna que `extra/x08` mascarou. Só aviso de cobertura, não muda decisão nem número do S-1.

    **Fatia obrigatória no ADR 005 (F4, seção 10):** antes de liberar o editor, o adaptador precisa gravar o `spread` real de `list` e `listItem` no `NodeState` do Lexical na importação e lê-lo de volta na exportação. Critério de pronto: os 12 casos de `extra/` passando na carga, na alternância e depois de uma edição (36/36), mais um caso novo de lista frouxa na raiz sem citação nem callout equivalente a `x05`/`x06` mas fora do escopo desta correção. Estimativa mantida em 1 a 1,5 dia: a causa raiz (visitors gravando `spread: false` incondicionalmente) já estava certa antes desta análise, e o acidente do reparse não muda o que precisa ser corrigido, só explica por que `x08` enganava.
