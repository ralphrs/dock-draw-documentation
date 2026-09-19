# ADR 005 — Escopo (rascunho em construção)

Estado: em aprovação. Decisões abaixo foram tomadas pelo arquiteto técnico na sessão de escopo de 2026-09-19.

## Etapa 0

- Contratos 002, 003 e 004 no LEDGER idênticos à seção 13 de cada ADR.
- Harness do ADR 002 (`adrs/ADR-002-anexos/harness`) rodado em 2026-09-19: 30/30.
- O harness exporta `parse`, `serialize`, `normalize`, `validate`, `frontmatterSchema`, `classifyUrl`. Não há `importDialect`: nas 8 fixtures `import` só se confere que o `expected.md` é ponto fixo.
- ADR 001: o contrato do LEDGER basta. O 005 depende dele só pelo embed de diagrama por id.

## D-1. Teste 1 do S-1 (E-01): corpus e critério

- 25 fixtures com `expected.md`: carregar o `expected.md`, inserir e apagar um caractere, salvar via `normalizeDok`, resultado idêntico ao `expected.md`.
- Nas fixtures `canonical` com `expected.md`, carregar também o `input.md` e aplicar o mesmo critério.
- As 8 `input.md` de estágio `import` não entram no teste 1 (são do teste de roteamento, D-2).
- 5 fixtures de erro (03, 15, 22, 24, 30) passam se o editor: (a) recusa abrir no WYSIWYG; (b) cai para o modo fonte com o diagnóstico visível; (c) não altera um byte do texto; (d) tentar salvar dali retorna exatamente os DOK-E do manifest.
- Conta 30/30.
- Decisão de produto que entra no ADR: conteúdo inválido nunca é editado no WYSIWYG. Custo aceito (consequência negativa): o usuário corrige no Markdown cru.
- Diff do LEDGER (parada 5): esclarecimento do teste 1 do S-1, não mudança de número.

## D-2. `importDialect` no spike

- A porta `importDialect` é espionada e devolve `parseDok(expected.md)` da fixture correspondente.
- Teste, nas 8 fixtures `import` (inclui a 25): colar o `input.md` → o handler do editor entrega o texto cru à porta, nunca ao parser próprio → o editor insere a DokAST recebida → `serialize === expected.md`.
- E-03 dividido: "inserir diagrama pela UI gera a forma da fixture 23" continua eliminatório do 005. "A fixture 25 migra o legado" sai do spike e vira critério de pronto da F6 do ADR 002.
- O aceite do 002 não muda (exige só os testes 1 e 3).
- Diff do LEDGER (parada 5): esclarecimento do teste 4 do S-1.

## D-3. Registry de componentes

- Módulo único `src/content-components`, interface definida pelo 005, chave tipada por `DokDirective['name']`. Nenhum nome fora do registro de diretivas do 002.
- Entradas separadas por fatia: `core` (tipos e mapa de nomes, sem React), `edit` (005), `read` (007), `export` (010, por destino do Apêndice B). Servidor (SSR, job de sync) importa `core`/`read`/`export`, nunca `edit`.
- Verificar no spike: o bundle da rota de leitura não contém a biblioteca do editor.
- "markdown" não é fatia: o Markdown canônico é `serializeDok` (002).
- Adaptador da biblioteca de editor fica fora do módulo.
- Teste de completude: para cada nome do registro do 002 existe a fatia `edit`. Preparado para `read` e `export`, pendente até 007 e 010 serem aceitos, depois falha o build se faltar fatia. Substitui a restrição "todo componente implementa as três representações" do prompt 007.
- Escopo: só diretivas. Links `dok:page`, imagens e anexos `dok:asset` ficam fora. Resolução de URI `dok:` continua premissa do 002 para o 007. Autocomplete de link é do adaptador do editor.
- Contrato do 005: interface publicada = `core` + fatia `edit`. Premissas: 007 implementa `read`, 010 implementa `export`, para todos os nomes. Nome novo só entra por adição ao registro do 002 (aditiva, não incrementa `dok`).

## Fatos verificados para E-12 (comentário ancorado)

- ADR 004, seção 6.5: `content.revision_comments(revision_id, anchor_start_line, anchor_end_line)`, sobre o `content_dokmd` de uma revisão imutável e já canônica.
- A seleção que gera âncora acontece na visão somente leitura de uma revisão. `normalizeDok` não roda entre seleção e âncora. "Sobrevive ao normalizeDok" (pergunta 6) só se aplica ao rascunho.
- Comparar comentários entre revisões é UI do 005, via diff de texto (ADR 004, 6.5).

## D-4. E-10 a E-13 no spike

- Renderer mínimo do spike em `src/content-components/read` (stub descartável), nunca em `src/content-format`. Igual para todos os editores.
- E-10: diff de texto sobre `content_dokmd`, independente de editor.
- E-11: diff por bloco de DokAST, renderizado pela fatia `read` (stub).
- E-12 sai do editor. A ancoragem acontece em `<RevisionView>`: o renderer emite em cada bloco a faixa de linhas de origem (`position` do mdast) como atributo de dados, e a seleção vira faixa de linhas a partir dele. O C-4 se resolve assim. Premissa ao 007: "o renderer de leitura emite posição de origem por bloco".
- Um renderizador só: `<RevisionDiff>` e `<RevisionView>` usam a fatia `read` do 007.
- Ponderação P4: E-10, E-11 e E-12 não discriminam editores. Só o E-13 (somente leitura e indicador de `changes_requested`) compara candidatas. A matriz mostra isso explicitamente, em vez de manter 10% sobre critérios empatados.
- Lacuna com dono (fatia de implementação do 005, fora do spike): mostrar ao autor, dentro do rascunho, os comentários da revisão anterior. Linhas da revisão não coincidem com as do rascunho, exige mapeamento por diff.

## D-5. Candidatas e modo fonte

- Spike: MDXEditor e Plate, um subagente cada. Milkdown só no papel. Spike no Milkdown só se os dois falharem (regra de desempate do 002, vinculante).
- Tiptap 3 e BlockNote: só ficha de eliminação com evidência atual.
- Modo fonte: CodeMirror 6, o mesmo nos dois candidatos, na lista de pacotes da parada 3.
- O que se compara é a alternância: ida e volta WYSIWYG → fonte → WYSIWYG sem perda roda em cada editor.
- Modo fonte nativo (ex.: o do MDXEditor) só substitui o CM6 depois de passar nos testes 1 e 3 e na alternância. O ADR registra qual modo fonte foi medido.

## D-6. Referência do spike (porte do harness)

- `adrs/_work/spike-s1/content-format/`: porte para TS strict de `harness/dokmd.mjs`, com os nomes do contrato (`parseDok`, `serializeDok`, `normalizeDok`, `validateDok`). Lógica e versões de dependência idênticas ao harness. Sem reescrita.
- Gate antes de qualquer teste de editor: `check-fixtures` rodando contra o módulo portado dá 30/30.
- Stub de `importDialect` (D-2) e renderer stub `content-components/read` (D-4) ficam no mesmo projeto do spike, compartilhados.

## Plano de trabalho

1. Pesquisa em paralelo (5 subagentes, fichas em `adrs/_work/ADR-005-candidata-<nome>.md`): MDXEditor, Plate, Milkdown, Tiptap 3 + BlockNote (uma ficha cada, mesmo subagente), CodeMirror 6. Cada ficha: versão estável e data, licença do pacote e transitivas, nota N/P/C/X/? por critério E-01 a E-13 com link ou trecho de código, dias por "C", lacunas. Pesquisar lançamentos desde 2026-09-18.
2. Consolidação das fichas e contradições (thread principal).
3. Parada 3: lista de pacotes do spike (pacote, versão, licença).
4. Spike: porte + gate 30/30, depois um subagente por editor rodando testes 1 a 8 e E-10, E-11, E-13, com saída real em `adrs/_work/spike-s1/<editor>/RESULTADO.md`.
5. Parada 4: resultado do S-1 e editor proposto.
6. Escrita do ADR e parada 5: diff do LEDGER (inclui as pendências de texto: nota velha do 005, fechar C-5, C-6, esclarecimentos dos testes 1 e 4 do S-1).

## D-7. Modo sugestão

- Fora da v1. As fichas registram só se cada candidato tem suporte nativo ou por plugin, com evidência, para alimentar um gatilho de reabertura. Não entra na ponderação.

## D-8. Perguntas obrigatórias das fichas (premissas de D-2, D-3, D-5)

Toda ficha de candidata responde com evidência, além dos critérios E-xx:

- Q-A: dá para desligar text directives e aceitar só diretivas de bloco?
- Q-B: dá para interceptar o evento de colar e inserir uma árvore pronta?
- Q-C: dá para registrar um nó customizado sem o nome da diretiva ficar preso à biblioteca?
- Q-D: como a alternância WYSIWYG ↔ fonte reconstrói a árvore?
- Q-E: compatível com React 19, só-cliente com lazy no TanStack Start, peso gzipped do que a rota de edição carrega.

Pergunta sem evidência fica "?" e vira item do spike.

Escopo aprovado em 2026-09-19.
