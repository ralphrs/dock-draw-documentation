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
