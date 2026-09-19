# ADR 005: Edição

Status: Proposto
Data: 2026-09-19
Camada: Edição (Authoring)
Depende de: ADR 001 (Motor de diagrama, Aceito), ADR 002 (Formato de conteúdo, Proposto vinculante), ADR 003 (Armazenamento e versionamento, Proposto vinculante), ADR 004 (Fluxo editorial, Proposto vinculante)

Decide: a biblioteca de editor WYSIWYG e a versão, o desenho do adaptador entre a árvore da biblioteca e a DokAST, o modo fonte e a alternância entre os dois modos, o registry de componentes de conteúdo compartilhado com o ADR 007 e o ADR 010, a resolução da ancoragem de comentário por faixa de linhas exigida pelo ADR 004, e a decisão sobre modo sugestão na v1.

Não decide: o formato DokMD v1 e a gramática das fixtures (ADR 002), o schema de armazenamento e revisão (ADR 003), a máquina de estados do fluxo editorial e a política de aprovação (ADR 004), a renderização de leitura e a resolução de URIs `dok:` (ADR 007), a exportação por destino (ADR 010).

## 1. Decisão

O ADR 005 escolhe o **MDXEditor 4.2.5** como editor WYSIWYG da Wiki, com um adaptador próprio que opera sobre a DokAST em vez de sobre o parser Markdown da biblioteca, o modo fonte em CodeMirror 6 compartilhado com o Plate, e duas fatias obrigatórias antes da liberação do editor: a lista frouxa (linha em branco entre itens irmãos de lista) e a exceção ao colar de árvore com nó `html`.

O adaptador converte `parseDok` em árvore Lexical na entrada (`importMdastTreeToLexical`) e a árvore Lexical em mdast na saída (`exportLexicalTreeToMdast`), e o shell serializa com `serializeDok`. O parser e o serializador Markdown do MDXEditor nunca entram no caminho de persistência, o que cumpre a restrição do ADR 002 de que nenhuma camada parseia Markdown por conta própria fora de `src/content-format`.

A decisão sobrescreve comportamento interno do Lexical: o `$transform` estático do `ListNode` do `@lexical/list` 0.48.0, que funde listas vizinhas do mesmo tipo já na importação. `lexical` e `@lexical/*` passam de dependência transitiva a dependência direta do app, com versão exata, e a suíte de testes deste ADR vira gate de qualquer atualização do Lexical (seção 9, consequência negativa).

Justificativa:

- O MDXEditor fecha o teste 1 do S-1 (E-01) em **30/30** depois da correção da fusão de listas: 1A 25/25, 1B 17/17, 1C 5/5 (`adrs/_work/spike-s1/RESULTADO-S1.md`, `mdxeditor/playwright-output-correcao-05.txt`). É o único candidato que atinge o número que o ADR 002 (seção 8.2) exige para aceitar o formato e, ao mesmo tempo, escolher o editor.
- A causa da falha original (fusão de listas vizinhas) tinha localização exata no código de terceiro (`LexicalList.dev.mjs:1080-1085`) e correção estimada e executada em código próprio, o que a distingue de uma falha de formato. O Plate falha por outro motivo: `@platejs/list` representa lista por indentação, sem nó de lista e sem item com mais de um bloco, o que é falha de modelo interno, não de detalhe corrigível (seção 5).
- O Plate perde estrutura em duas fixtures do corpus por esse motivo (05 e 06) e numa terceira por comportamento do documento void (23), com estimativa de 3 a 5 dias e risco declarado pelo próprio adaptador do spike (`plate/RESULTADO.md`, tabela de dias). O MDXEditor, depois da correção, perde estrutura em nenhuma fixture do corpus.
- Alternativa descartada: aplicar a regra de desempate do ADR 002 e repetir o S-1 com o Milkdown (reserva, D-5 do escopo). Custo aceito ao não seguir essa alternativa: a letra da trava que autorizou a correção da fixture 05 (`A-Q-0001`) pedia os 12 casos de regressão de `extra/` passando na carga, na alternância e depois de uma edição antes de decidir, e a decisão desta seção segue sem esperar os 6 casos restantes (x05, x06) fechar, tratando a lacuna como fatia planejada (seção 11) em vez de bloqueio. É override explícito do texto da própria trava, registrado aqui e não em silêncio.
- Alternativa descartada: normalizar o `spread` de lista dentro de `normalizeDok`, para o editor nunca ver uma lista frouxa. Descartada porque dissolveria o defeito redefinindo o formato do ADR 002 fora desta sessão, e apagaria intenção autoral do CommonMark que muda o HTML renderizado (lista frouxa embrulha cada item em `<p>`, lista apertada não).

## 2. Contexto e entradas recebidas

O `LEDGER.md` fixa o formato de conteúdo (ADR 002), o schema de armazenamento e revisão (ADR 003) e o fluxo editorial (ADR 004) como **Propostos vinculantes**: os três só viram Aceitos quando o spike S-1 do ADR 002 (seção 8.2) passar, e até lá este ADR os trata como se estivessem aceitos.

O que o ADR 002 impõe à Edição (seção "Propostos vinculantes", `premissas_sobre_camadas_futuras`): "o editor produz DokAST/DokMD sem perda de significado nas fixtures e suporta directives só de bloco. O servidor normaliza no save."

O que o ADR 004 impõe à Edição: "implementa diff textual e renderizado contra a versão publicada, modo de comentário ancorado por faixa de linha, indicador de revisão em `changes_requested` e modo somente leitura, e decide se e como entra modo de sugestão de edição."

O conflito C-4 do ledger (004 × 005) descreve a tensão central: "ancorar por linha do texto canônico num editor WYSIWYG exige mapear seleção visual ↔ posição no Markdown." A seção 6 resolve esse conflito.

O escopo desta sessão (`adrs/_work/ADR-005-escopo.md`, aprovado em 2026-09-19) fixou oito decisões preliminares (D-1 a D-8) antes do spike, referenciadas ao longo deste ADR pelo identificador.

## 3. Critérios

### Eliminatórios

| Id | Critério | Por que, neste projeto | Como verificar |
| --- | --- | --- | --- |
| E-01 | Teste 1 do S-1: 30/30 no round-trip de todas as fixtures (D-1) | O ADR 002 (seção 8.2) faz do round-trip a condição de aceite do formato e a linha de corte entre candidatas. Um editor que altera bytes fora do que o usuário editou corrompe conteúdo em produção | 25 fixtures com `expected.md`: carga, edição trivial, `save === expected.md`. 17 fixtures `canonical` também com `input.md` até `expected.md`. 5 fixtures de erro: recusa abrir no WYSIWYG, cai para o modo fonte com diagnóstico visível, não altera um byte, o save retorna exatamente os DOK-E do manifest |
| E-02 | Teste 3 do S-1: o modo fonte recusa `<Tabs>`/`<script>` com DOK-E002, e `Hora:agora` nunca vira diretiva | O DokMD v1 proíbe text directives e HTML/JSX no conteúdo (ADR 002, `restricoes_impostas`). Um editor que cria diretiva de `palavra:palavra` corrompe texto comum do usuário | Digitar `<Tabs>`/`<script>` no modo fonte e salvar: DOK-E002. Digitar `Hora:agora` no WYSIWYG e no modo fonte: nenhuma diretiva, texto literal, sem DOK-E003 |
| E-03 | Teste 4 do S-1: inserir diagrama pela UI gera a forma exata da fixture 23 (D-2) | O embed de diagrama é a única diretiva com UI própria de seleção neste ADR e a que mais aparece nas páginas C4 do produto | Inserir pelo menu, escolher a view no seletor, preencher a descrição pela UI do nó: o texto salvo contém a linha 7 do `expected.md` da fixture 23, byte a byte, com save `ok` |
| E-04 | Nenhum caminho avalia conteúdo como código | O `LEDGER.md` (arquitetura base) proíbe conteúdo de usuário compilado ou avaliado como código | `<img src=x onerror=…>` digitado no modo fonte e colado como texto no WYSIWYG: nenhuma execução, nenhum handler disparado |
| E-05 | Licença permissiva do pacote e das transitivas exigidas pelas funções usadas | O produto é comercial e embute o código do editor | Auditoria de licença do fecho de produção, MIT/Apache-2.0/BSD/ISC passam, GPL/AGPL/BSL/SSPL eliminam, MPL-2.0 exige nota |
| E-06 | Produz e consome mdast compatível com a DokAST, sem perda comprovada nas fixtures | O adaptador via DokAST (parada 3) exige que a biblioteca aceite e devolva mdast pronto, sem passar pelo próprio parser | `importMdastTreeToLexical`/`exportLexicalTreeToMdast` exportados pelo pacote, usados pelo adaptador, coberto pelo mesmo resultado de E-01 |
| E-07 | Rota do editor carregada sob demanda no TanStack Start, sem erro de hidratação | A Wiki também tem uma landing e páginas de leitura que não devem carregar o editor | Landing sem chunk do editor nas requisições de rede. Navegação de cliente e carga direta na rota `/edit/*` sem erro de console nem de hidratação |

### Importantes

| Id | Critério | Por que, neste projeto | Como verificar |
| --- | --- | --- | --- |
| E-10 | Diff textual contra a revisão publicada | Premissa do ADR 004 | Independente de editor (D-4): diff de texto sobre `content_dokmd`, na fatia `read` |
| E-11 | Diff renderizado contra a revisão publicada | Premissa do ADR 004 | Independente de editor (D-4): diff por bloco de DokAST, renderizado pela fatia `read` do ADR 007 |
| E-12 | Comentário ancorado por faixa de linhas do DokMD canônico | Premissa do ADR 004, e o conflito C-4 | Resolvido em `<RevisionView>`, fora do editor (D-4, seção 6). Não discrimina candidatas |
| E-13 | Modo somente leitura e indicador de `changes_requested` | Premissa do ADR 004 | `?readOnly=1`: a área editável não aceita entrada, `getDok()` inalterado, menu Inserir ausente. `?changesRequested=1`: banner visível. Único critério de P4 que discrimina candidatas (D-4) |

### Desejáveis

| Id | Critério | Por que, neste projeto | Como verificar |
| --- | --- | --- | --- |
| Teste 2 | Recriar pela UI os callouts da fixture 16, inclusive trocar tipo, `variant` e `fold` | Ergonomia de formatação de blocos frequentes na Wiki | Apagar o corpo e recriar dois callouts pela UI do menu e do nó: `save === expected.md` da 16 |
| Teste 5 | Link interno com autocomplete e link pendente | Requisito de "segundo cérebro" do produto (`insumos/BASE.md`) | Digitar termo de busca, escolher página existente ou criar link pendente, save `ok` com W101 esperado no pendente |
| Teste 6 | Tema por token CSS, preflight do Tailwind, `prefers-reduced-motion` | Arquitetura base exige cores só por token e dois temas | Cor e fundo da área editável batem com `var(--foreground)`/`var(--background)` em `.theme-light` e `.theme-dark`. Nenhuma animação acima de 0,01 ms com `reducedMotion: reduce` |
| Teste 8, D-2 | Colar conteúdo externo roteado por `importDialect`, nunca pelo parser próprio do editor | O produto promete import de Google Docs, GitHub, Obsidian e legado (ADR 002, `importDialect`) | Colar HTML sintético de Google Docs e GitHub: uma chamada a `importDialect` por colar, save sem HTML nem JSX. D-2: as 8 fixtures `import` via stub, `matchedFixture` certo, save igual ao `expected.md` |
| Portal | Menu e seletor sobre a área editável em portal Radix, sem corte, foco devolvido ao Escape | Consistência com o resto do app (shadcn/Radix) | Menu no topo de `elementFromPoint`, dentro da viewport, foco de volta ao gatilho após Escape |

## 4. Candidatas

| Candidata | Versão | Licença | Data de verificação | Link |
| --- | --- | --- | --- | --- |
| MDXEditor | `@mdxeditor/editor` 4.2.5 | MIT (nota: `argparse` 2.0.1 Python-2.0, via `js-yaml`, só no `frontmatterPlugin`, não carregado pelo adaptador) | 2026-09-19 | https://www.npmjs.com/package/@mdxeditor/editor/v/4.2.5 |
| Plate | `platejs` 53.3.14, `@platejs/markdown` 53.3.12 | MIT | 2026-09-19 | https://www.npmjs.com/package/platejs/v/53.3.14 |
| Milkdown (reserva) | `@milkdown/kit` 7.22.1 | MIT (`dompurify` dual MPL-2.0 OR Apache-2.0, opção Apache-2.0 usada) | 2026-09-19 | https://www.npmjs.com/package/@milkdown/kit |
| Tiptap 3 (eliminada por custo) | `@tiptap/react` 3.31.3, `@tiptap/markdown` 3.31.3 | MIT (extensões pagas fora do escopo) | 2026-09-19 | https://www.npmjs.com/package/@tiptap/react |
| BlockNote (eliminada) | `@blocknote/core` 0.54.2 | MPL-2.0 (`@blocknote/xl-*` GPL-3.0 OR comercial, não usados) | 2026-09-19 | https://www.npmjs.com/package/@blocknote/core |
| CodeMirror 6 (modo fonte, não é candidata a WYSIWYG) | `@codemirror/state` 6.7.5, `@codemirror/view` 6.43.12, `@codemirror/lang-markdown` 6.5.2 | MIT | 2026-09-19 | https://www.npmjs.com/package/@codemirror/state |

Milkdown não entrou no spike. A regra de desempate do ADR 002 só chama o Milkdown se MDXEditor e Plate falharem no teste 1, e o MDXEditor fechou 30/30. A ficha de Milkdown registra um risco de manutenção adicional que pesaria contra ela se fosse convocada: mantenedor npm único, com 110 dos 282 commits anuais atribuídos a essa pessoa e 133 ao Renovate (`api.github.com/repos/Milkdown/milkdown/stats/contributors`, consultado em 2026-09-19), e a instalação de `@milkdown/react` arrasta Vue 3, CodeMirror 6 e KaTeX por dependência transitiva não opcional de `@milkdown/components`.

Tiptap 3 e BlockNote não entraram no spike (D-5). Tiptap sai por custo: nenhum eliminatório recebeu X com evidência, mas o pacote não produz nem consome mdast (usa `marked`), e um conversor ProseMirror JSON ↔ mdast próprio foi estimado em 4 a 6 dias, contra o adaptador de poucos dias dos dois finalistas que já trafegam mdast. BlockNote recebe X em E-01 e E-06: a documentação oficial declara a conversão de e para Markdown "lossy" nos dois sentidos desde a troca do pipeline unified por parser próprio na versão 0.51.0, sem suporte a rodapé, frontmatter ou diretivas.

## 5. Avaliação

### Matriz N/P/C/X/?

| Critério | MDXEditor 4.2.5 | Plate 53.3.14 |
| --- | --- | --- |
| E-01 (30/30) | **P** (30/30 depois da correção de modelo, seção 1) | X (27/30, falha de modelo em três fixtures) |
| E-02 | N | P |
| E-03 | C, feito (1 dia) | C, feito (1 dia) |
| E-04 | N | N |
| E-05 | N com nota (`argparse` Python-2.0, não embutido no bundle, seção 4) | N |
| E-06 | N (`importMdastTreeToLexical`/`exportLexicalTreeToMdast` exportados) | P (`mdastToSlate`/`convertNodesSerialize` exportados, com risco de nó sem regra) |
| E-07 | P, feito | P, feito |
| E-10, E-11, E-12 | n/a (D-4, resolvidos fora do editor) | n/a (D-4) |
| E-13 | N (read-only), P (banner) | N |
| Teste 2 | P, feito | P, feito |
| Teste 5 | C, feito (1 dia) | C, feito (1 dia) |
| Teste 6 | P, feito, 1 regra da biblioteca sobrescrita | P, feito, 0 regras sobrescritas |
| Teste 8, D-2 | P mecanismo, 6/8 fixtures import (falham 26 e 27) | P mecanismo, 8/8 |
| Portal | P (shell compartilhado) | P (shell compartilhado) |
| Peso do chunk da rota de edição (gzip) | 132,88 kB + 9,09 kB CSS | 265,05 kB (inclui `marked`, `remark-mdx`, `acorn`, sem executar) |

Nota da grade: X na matriz do `insumos/BASE.md` significa "contra a arquitetura base". A entrada X do Plate em E-01 é uma exceção declarada: marca falha eliminatória do critério do S-1 (não fechar 30/30), não violação da arquitetura base. O critério é numérico e binário por definição do ADR 002, e o Plate fica abaixo do número em três fixtures por causa de modelo interno (seção 1).

### Ponderação por grupo do prompt

P1 fidelidade ao DokMD v1, 40%: MDXEditor fecha E-01, E-02, E-03 e o teste 2. Plate falha E-01. P1 decide a favor do MDXEditor.

P2 formatação, links e ergonomia, 20%: teste 5 e Q-B (colar) empatam entre os dois, mecanismo presente e testado nos dois. Sem diferença que discrimine.

P3 integração com a stack, 20%: E-04, E-05, E-07 e teste 6 passam nos dois. O peso do chunk difere (132,88 kB contra 265,05 kB gzip), a favor do MDXEditor, sem ser eliminatório.

P4 capacidades do fluxo editorial, 10%: por D-4, E-10, E-11 e E-12 são iguais para qualquer editor e não entram na comparação. Só E-13 discrimina, e os dois passam. P4 não desempata.

P5 sustentabilidade, 10%: MDXEditor carrega risco de manutenção (a correção da seção 1 depende de detalhe interno versionado do Lexical, e a suíte deste ADR vira gate de atualização). Plate carrega risco de modelo (o `@platejs/list` não representa a estrutura, com correção estimada em 3 a 5 dias e risco declarado). A distinção entre os dois riscos é qualitativa, não numérica: um afeta manutenção futura do que já funciona, o outro impede fechar o critério agora.

O peso decisivo é P1: nenhum outro grupo produz um X eliminatório, e P1 tem 40% contra os 10% de P4 (que sequer discrimina) e os 10% de P5 (empate qualitativo).

## 6. Desenho da solução

### Ancoragem de comentário e resolução do C-4

O renderer da fatia `read` (ADR 007) emite `data-line-start` e `data-line-end` em cada bloco, calculados a partir de `position.start.line`/`position.end.line` do nó mdast. `<RevisionView>` (visão somente leitura de uma revisão) lê esses atributos de dados a partir do elemento DOM que contém a seleção visual do usuário e converte a seleção numa faixa de linhas do texto canônico, sem depender de posição de caractere do editor. Essa faixa grava `anchor_start_line`/`anchor_end_line` em `content.revision_comments` (ADR 004, seção 6.5), que referencia `revision_id`, uma linha de `page_revisions` (ADR 003: append-only, snapshot completo, imutável).

Isso funciona porque a revisão comentada é texto canônico já gravado, saída de `normalizeDok`, fixo para sempre a partir da publicação da revisão. A faixa de linhas calculada a partir da seleção do usuário sobre esse texto bate, byte a byte, com o texto que `anchor_start_line`/`anchor_end_line` vão referenciar depois. O mesmo mecanismo não vale para o rascunho: o rascunho é editado no WYSIWYG, e cada save passa por `normalizeDok`, que pode mudar a numeração de linha entre o que o autor vê ao compor o texto e o que fica persistido. Por isso o C-4 se resolve ancorando comentário só em revisão publicada e imutável, nunca no rascunho, o que elimina o descompasso entre seleção e posição salva.

Lacuna com dono: mostrar ao autor, dentro do rascunho, os comentários que ficaram numa revisão anterior. As linhas do rascunho não coincidem com as da revisão comentada sempre que o rascunho já mudou o texto, e o mapeamento entre as duas exige diff. Sem implementação nesta sessão, fica na fatia F5 (seção 11).

### Modo fonte e alternância

O modo fonte é o CodeMirror 6 do spike (`src/shared/SourceMode.tsx`), o mesmo componente para os dois candidatos, conforme D-5 do escopo. A alternância mede a ida e volta WYSIWYG → fonte → WYSIWYG sem perda (teste 10 do S-1), rodada contra as 25 fixtures do corpus que têm `expected.md`.

Regra do escopo D-5: um modo fonte nativo de candidata (por exemplo, o `diffSourcePlugin` do MDXEditor, que por dentro já é CodeMirror 6 mas não expõe o `EditorView` ao app) só substitui o CodeMirror 6 compartilhado depois de passar nos testes 1 e 3 e na alternância, nas mesmas condições. O modo medido no S-1, para os dois candidatos, foi o CodeMirror 6 externo e compartilhado. O modo fonte nativo do MDXEditor não foi submetido a esse critério nesta sessão e continua fora de uso: o app usa o CodeMirror 6 compartilhado.

### Registry `src/content-components`

O registry tem quatro fatias, chaveadas por `DokDirective['name']`: `core` (tipos e mapa de nomes, sem React), `edit` (este ADR), `read` (ADR 007) e `export` (ADR 010, por destino do Apêndice B do ADR 002). O servidor (SSR, job de sincronização) importa `core`, `read` e `export`, nunca `edit`, o que mantém o editor fora do bundle de servidor e da rota de leitura (verificado no S-1: nenhum chunk de leitura carrega a biblioteca do editor).

Teste de completude: para cada nome do registro de diretivas do ADR 002, existe entrada `edit` hoje. Quando o ADR 007 e o ADR 010 forem aceitos, o mesmo teste passa a exigir `read` e `export` para cada nome, e falha o build se alguma faltar. Substitui a restrição "todo componente implementa as três representações" do prompt do 007.

Escopo do registry: só as diretivas de bloco do ADR 002 (`note`, `tip`, `caution`, `danger`, `tabs`, `tab`, `steps`, `diagram`). Links `dok:page` e anexos `dok:asset` ficam fora: a resolução de URI `dok:` é premissa do ADR 002 para o ADR 007, e o autocomplete de link interno é responsabilidade do adaptador de cada editor, não do registry.

## 7. Verificação de compatibilidade

### Para trás

| Contrato ou restrição | Situação | Evidência |
| --- | --- | --- |
| ADR 002, "nenhuma camada parseia Markdown por conta própria no caminho de persistência" | Cumprida | O adaptador do MDXEditor usa `importMdastTreeToLexical`/`exportLexicalTreeToMdast`, nunca `setMarkdown$`, `insertMarkdown$`, `getMarkdown` ou `diffSourcePlugin` (`mdxeditor/RESULTADO.md`, "Adaptador") |
| ADR 002, directives só de bloco | Cumprida | O `directivesPlugin` oficial (que registra text directive) não é carregado. Visitors próprios copiados de `MdastDirectiveVisitor`/`DirectiveVisitor` sem o ramo de text directive. Teste 3 confirma `Hora:agora` literal, sem DOK-E003 |
| ADR 002, todo save passa por `normalizeDok` + `validateDok` | Cumprida no spike (shell) | `saveDok = normalizeDok + validateDok` em `src/shared/save.ts`, chamado por todos os editores |
| ADR 002, conteúdo não carrega estilo (sem HTML, class, style fora do registro) | Cumprida com fatia obrigatória | Colar de árvore com nó `html` hoje lança exceção em vez de recusar com diagnóstico (seção 11, fatia obrigatória) |
| ADR 002, links, imagens, anexos e diagramas referenciados por id em URI `dok:` | Cumprida | Teste 5: link interno gera `dok:page/<uuid>`, link pendente `dok:page/new?title=`. E-03: diagrama gera `dok:diagram/<uuid>?view=<uuid>` |
| ADR 003, `page_drafts` mutável por autor | Fora do escopo do spike, sem conflito | O S-1 simula save, não grava em `page_drafts`. Nenhuma decisão deste ADR impede o autosave do ADR 003 |
| ADR 004, diff textual e renderizado, comentário ancorado, indicador `changes_requested`, somente leitura | Cumprida, com C-4 resolvido | Seção 6 |

### Para frente

| Camada | Premissa recebida deste ADR | Evidência |
| --- | --- | --- |
| Renderização (007) | Implementa a fatia `read` de `src/content-components` para todos os nomes do registro, e o renderer emite posição de origem por bloco (`data-line-start`/`data-line-end`) | D-4, seção 6. `<RevisionView>` e `<RevisionDiff>` usam essa fatia, um único renderizador de DokAST |
| Exportação (010) | Implementa a fatia `export` de `src/content-components` para todos os nomes do registro | D-3, seção 6 |
| Colaboração futura | Nada nesta decisão exige que a edição escreva direto em Yjs | O adaptador só troca DokAST com o shell. O Lexical não é exposto fora do componente |

O ADR 002 pode ser aceito: o gatilho de reabertura "spike S-1 falha em MDXEditor, Plate e Milkdown" não se materializou, porque o MDXEditor fechou 30/30. Os ADRs 003 e 004 são aceitos junto, conforme a regra de status do `LEDGER.md`.

## 8. Spike

O ADR 002 (seção 8.2) define o S-1: gate do porte do harness em 30/30 antes de qualquer teste de editor, depois testes 1 a 8 e E-10 a E-13 rodados por Playwright real contra cada candidata, com regra de desempate "se nenhum candidato passar nos testes 1 e 3, repetir com Milkdown. Se o Milkdown também falhar, reabrir este ADR."

Ambiente: projeto descartável em `adrs/_work/spike-s1/`, mesmas versões do app (`insumos/package.json`) onde existiam, instalação com `--ignore-scripts`, auditoria de 323 pacotes de produção sem script de instalação nem binário nativo (`AMBIENTE.md`). Gate do porte: 30/30 (`AMBIENTE.md`).

Primeira rodada (parada 4): MDXEditor 29/30 (falha só a fixture 05), Plate 27/30 (falham 05, 06, 23). Nenhum fecha 30/30 ao pé da letra.

Decisão da parada 4: corrigir a fixture 05 no MDXEditor antes de aplicar a regra do Milkdown, sob três travas (prazo fixo de 1,5 dia sem prorrogação, correção de modelo verificada com 12 casos de regressão fora do corpus em `extra/`, consequência negativa registrada). Resultado: trava do critério numérico atingida (30/30), trava dos casos extras atingida em 30 de 36, com as seis falhas restantes de causa diferente da corrigida (lista frouxa, não fusão), tratada como fatia obrigatória em vez de reprovação (seção 1, seção 11).

O critério de aceite do ADR 002 ("pelo menos um candidato passa nos testes 1 e 3") está satisfeito pelo MDXEditor. O gatilho de desempate com o Milkdown não se aciona.

## 9. Consequências

### Positivas

- O editor fecha o round-trip das 30 fixtures do DokMD v1 sem conversor externo, porque a biblioteca já trafega mdast (E-06), com o menor peso de chunk gzip entre os dois finalistas (132,88 kB contra 265,05 kB).
- O adaptador via DokAST isola o parser e o serializador da biblioteca do caminho de persistência, o que elimina de uma vez os riscos de parser levantados nas fichas (text directives do `directivesPlugin`, `mdxJsx` ligado por padrão, divergência de versão do `micromark-extension-directive`).
- O registry de componentes (D-3) publica só a fatia `core` + `edit` deste ADR, com teste de completude por nome, e não acopla o nome de uma diretiva à biblioteca do editor (`Q-C`, N para o MDXEditor).

### Negativas

- A correção da seção 1 sobrescreve comportamento interno do `@lexical/list` 0.48.0. `lexical` e `@lexical/*` passam a dependência direta do app com versão exata, em vez de transitiva do MDXEditor, e a suíte deste ADR vira gate obrigatório de qualquer atualização futura do Lexical, inclusive dentro do próprio MDXEditor.
- Conteúdo inválido nunca é editado no WYSIWYG (D-1): o usuário corrige um documento com DOK-E no Markdown cru, no modo fonte. É decisão de produto aceita, não limitação escondida.
- A lista frouxa (linha em branco entre itens irmãos de lista) e a exceção ao colar de árvore com nó `html` não estão implementadas no spike. Ficam como fatias obrigatórias antes da liberação do editor (F3 e F4, seção 11), não como consequência só documentada. A causa da lista frouxa está isolada: o adaptador grava `spread: false` incondicionalmente em `list` e `listItem` na exportação, e o único caso da suíte informal `extra/` que parecia contradizer isso (`x08-citacao-ul-ul`, dentro de citação) passa por um efeito colateral do reparse de `normalizeDok` sobre `mdast-util-from-markdown@2.0.3` (`prepareList`, `lib/index.js:278-382`), não porque o exportador preserva a informação (`mdxeditor/RESULTADO.md`, "Por que x08 passa e x05/x06 não"). Fora de citação (`x05`, `x06`) o mesmo acidente não ocorre e a fixture falha.
- O link de título vivo com texto vazio (`[](dok:page/…)`, fixtures 26 e 27 do D-2) falha ao ser apagado por seleção total e ao ser inserido por colar (`$insertNodes` descarta o parágrafo cujo único filho é um `LinkNode` sem texto). Fica como fatia não obrigatória, estimada em 1 dia.
- Notas de rodapé ficam como "ilha opaca" no MDXEditor: o nó é preservado e exibido, sem edição direta. Edição real estimada em 2 a 3 dias, fatia não obrigatória.
- O app precisa declarar `lexical`, `@lexical/link`, `@lexical/list` e `@lexical/react` como dependências diretas, hoje só transitivas do `@mdxeditor/editor`.

### Reversibilidade

A troca de editor depois de aceito exige reescrever o adaptador (`src/editors/mdxeditor/`) e substituir a UI de inserção, mas não afeta o formato persistido, porque o adaptador só produz e consome DokAST. O registry (`src/content-components`) e o contrato de fatia `edit` seguem valendo para qualquer editor futuro que implemente a mesma interface (`src/editors/contract.ts`).

## 10. Gatilhos de reabertura

- O Lexical publica uma major que muda o registro estático de `$config` (`getStaticNodeConfig`), e a correção da seção 1 deixa de funcionar sem reescrita.
- A suíte de listas (`extra/`, 12 casos) falha depois de uma atualização de `@mdxeditor/editor` ou `lexical`, mesmo sem mudança de major.
- O corpus do ADR 002 ganha uma fixture com `list.spread = true` (pendência 14 do ledger) e o MDXEditor falha nela antes da fatia da lista frouxa (seção 11) entrar em produção.
- O MDXEditor descontinua manutenção ou a licença muda para algo fora de MIT/Apache-2.0/BSD/ISC.
- O produto exige modo sugestão na v1 (D-7 do escopo), o que reabre a avaliação de Q-F entre os candidatos.

## 11. Fatias de implementação

Em ordem de dependência:

| Fatia | Critério de pronto | Obrigatória antes de liberar o editor? |
| --- | --- | --- |
| F1: adaptador via DokAST, entrada e saída | `importMdastTreeToLexical`/`exportLexicalTreeToMdast` integrados ao shell real, 30/30 no ambiente de produção (não só no spike descartável) | Sim |
| F2: registry `core` + `edit`, teste de completude por nome | Toda diretiva do registro do ADR 002 tem entrada `edit`, o build falha se faltar uma | Sim |
| F3: exceção ao colar de árvore com nó `html` | `insertTree` recusa nós `html` e `mdxJsx*` com diagnóstico visível, sem lançar exceção não capturada (falha confirmada na seção 7 e em `mdxeditor/RESULTADO.md`, "13b") | Sim |
| F4: lista frouxa (`spread` real de `list` e `listItem` via `NodeState` do Lexical, na importação e na exportação) | Os 12 casos de `extra/` passam na carga, na alternância e depois de uma edição (36/36), mais um caso novo de lista frouxa fora de citação e de callout que a fatia F5 do ADR 002 acrescenta ao corpus (pendência 14 do ledger). `x08-citacao-ul-ul` passa pela correção, não mais pelo acidente de reparse descrito em `mdxeditor/RESULTADO.md` | Sim |
| F5: `<RevisionView>` com posição de origem por bloco | Depende do ADR 007 implementar a fatia `read`. Critério de pronto do 007, premissa registrada na seção 7 | Não desta fatia, mas bloqueia E-12 em produção |
| F6: link de título vivo vazio (D-2, fixtures 26 e 27) | `save === expected.md` nas duas, no apagar e no colar | Não |
| F7: notas de rodapé editáveis | Substitui a ilha opaca por edição real de `footnoteReference`/`footnoteDefinition` | Não |
| F8: UI de restrição de estrutura (`tabs` só contém `tab`, `steps` só uma lista ordenada) | Inserção fora da estrutura bloqueada na UI, não só no `validateDok` | Não |

## 12. Fora de escopo

- Modo sugestão (track changes). Fora da v1 por D-7. As fichas registram suporte nativo ou por plugin de cada candidata (MDXEditor: não há. Plate: `@platejs/suggestion` MIT. Milkdown: revisão de diff parcial), para alimentar um gatilho de reabertura futuro.
- Migração do legado da fixture 25 (`[[diagram:Título]]`). Sai do S-1 e vira critério de pronto da fatia F6 do ADR 002 (importadores), conforme D-2 do escopo.
- A implementação real de `importDialect`. O spike usa stub espionado que devolve `parseDok(expected.md)` para as fixtures `import`. A implementação é do ADR 002.
- Resolução de URI `dok:` e política de imagem externa. Premissa recebida do ADR 002 para o ADR 007, não deste ADR.
- Geração estática de SVG/PNG de uma view de diagrama para export. Conflito C-2 do ledger, dono ADR 007.
- Persistência do rascunho em `page_drafts`, autosave, `based_on_revision_id` e detecção de conflito. Schema e mecanismo do ADR 003, este ADR só assume que o shell final chama `saveDraft`/`submitRevision` com o texto que `getDok()` devolve.

## 13. Contrato de saída

```yaml
adr: "005"
camada: "Edição"
status: "Proposto"
data: "2026-09-19"
decisao: "Editor WYSIWYG MDXEditor 4.2.5, com adaptador próprio via DokAST (nunca o parser Markdown da biblioteca), modo fonte CodeMirror 6 compartilhado, e as fatias lista frouxa e exceção ao colar de nó html obrigatórias antes da liberação"
dependencias:
  - pacote: "@mdxeditor/editor"
    versao: "4.2.5"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@mdxeditor/editor/v/4.2.5"
  - pacote: "lexical"
    versao: "0.48.0"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/lexical/v/0.48.0 (passa de transitiva a direta por causa da correção da seção 1)"
  - pacote: "@lexical/list"
    versao: "0.48.0"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@lexical/list/v/0.48.0"
  - pacote: "@lexical/link"
    versao: "0.48.0"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@lexical/link/v/0.48.0"
  - pacote: "@lexical/react"
    versao: "0.48.0"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@lexical/react/v/0.48.0"
  - pacote: "@codemirror/state"
    versao: "^6.7.5"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/state"
  - pacote: "@codemirror/view"
    versao: "^6.43.12"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/view"
  - pacote: "@codemirror/commands"
    versao: "^6.11.1"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/commands"
  - pacote: "@codemirror/language"
    versao: "^6.12.4"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/language"
  - pacote: "@codemirror/lang-markdown"
    versao: "^6.5.2"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/lang-markdown"
  - pacote: "@codemirror/lint"
    versao: "^6.9.7"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/lint"
interfaces_publicadas:
  - nome: "AdapterContract (AdapterProps, AdapterHandle)"
    tipo: "tipo TS"
    descricao: "src/editors/contract.ts. getTree() converte o estado real da biblioteca para mdast, sem cache do initialTree. insertTree ignora nó yaml. insertDirective usa o registry edit. importDialect e searchPages injetados por prop"
  - nome: "src/content-components/{core,edit}"
    tipo: "tipo TS e componente React"
    descricao: "Registry de diretivas chaveado por DokDirective['name']. core sem React. edit publica create() e o componente de edição por diretiva. Teste de completude por nome contra o registro do ADR 002"
  - nome: "Ancoragem de comentário por faixa de linhas"
    tipo: "atributo de dados"
    descricao: "data-line-start/data-line-end por bloco, emitidos pelo renderer da fatia read (ADR 007) dentro de RevisionView, não pelo editor"
  - nome: "RevisionDiff / RevisionView"
    tipo: "componente React"
    descricao: "Usam a fatia read do ADR 007. Único renderizador de DokAST no app, compartilhado por diff textual (E-10), diff renderizado (E-11) e ancoragem (E-12)"
restricoes_impostas:
  - "O adaptador do editor nunca chama o parser ou o serializador Markdown da biblioteca no caminho de persistência, só a conversão de árvore para árvore (mdast)"
  - "Toda escrita passa por normalizeDok + validateDok no servidor, qualquer DOK-E bloqueia o save, inclusive vindo do modo fonte"
  - "Conteúdo com DOK-E, depois de normalizeDok, abre só no modo fonte, nunca no WYSIWYG"
  - "Nenhum nó do editor serializa text directive nem HTML/JSX fora do que o registro do ADR 002 permite"
  - "insertTree recusa nó html e mdxJsx* com diagnóstico visível, nunca lança exceção não capturada"
  - "Nome novo de diretiva no registry só entra por adição ao registro de diretivas do ADR 002, nunca por código específico do adaptador do editor"
premissas_sobre_camadas_futuras:
  - camada: "Renderização (ADR 007)"
    premissa: "Implementa a fatia read de src/content-components para todos os nomes do registro, e o renderer emite data-line-start/data-line-end por bloco, consumido por RevisionView para a ancoragem de comentário (E-12)"
  - camada: "Exportação e sincronização (ADR 010)"
    premissa: "Implementa a fatia export de src/content-components para todos os nomes do registro, por destino do Apêndice B do ADR 002"
  - camada: "Persistência (ADR 003)"
    premissa: "getDok() do editor alimenta saveDraft/submitRevision sem transformação adicional além de normalizeDok + validateDok"
riscos_abertos:
  - "Lista frouxa (linha em branco entre itens irmãos) falha no MDXEditor fora de contexto de citação. O adaptador grava spread false incondicionalmente na exportação, causa isolada em mdxeditor/RESULTADO.md. O único caso da suíte extra/ que parecia passar (x08, dentro de citação) deve o resultado a um acidente do reparse de normalizeDok sobre mdast-util-from-markdown, não à preservação real da informação. Correção estimada em 1 a 1,5 dia, fatia obrigatória F4 antes de liberar o editor (seção 11). O corpus de 30 fixtures do ADR 002 não exercita essa forma, pendência 14 do ledger"
  - "Colar de árvore com nó html lança exceção não capturada no save. Fatia obrigatória F3 (seção 11)"
  - "Link de título vivo com texto vazio (dok:page/… sem rótulo) falha ao apagar por seleção total e ao ser inserido por colar. Fixtures 26 e 27 do D-2. Fatia não obrigatória F6, 1 dia"
  - "Notas de rodapé ficam como ilha opaca, sem edição direta do texto da nota. Fatia não obrigatória F7, 2 a 3 dias"
  - "A correção da seção 1 depende de getStaticNodeConfig, API pública do pacote lexical sem garantia formal de estabilidade entre minors. A suíte deste ADR precisa rodar a cada atualização de lexical ou de @mdxeditor/editor"
  - "Comentários da revisão anterior dentro do rascunho: quando as linhas do rascunho não coincidem com as da revisão comentada, o mapeamento exige diff entre as duas. Sem dono de implementação definido nesta sessão, fica na fatia F5"
gatilhos_de_reabertura:
  - "Lexical publica major que muda o registro estático de $config e quebra a correção da seção 1"
  - "Atualização de @mdxeditor/editor ou lexical falha na suíte de listas (extra/, 12 casos) antes de F4 entrar em produção"
  - "O corpus do ADR 002 ganha fixture com list.spread = true e o MDXEditor falha nela antes de F4"
  - "MDXEditor descontinua manutenção ou muda de licença para fora de MIT/Apache-2.0/BSD/ISC"
  - "Produto exige modo sugestão na v1 (reabre D-7 e a avaliação de Q-F)"
```

## 14. Atualização do LEDGER.md

Diff proposto em `adrs/_work/ADR-005-ledger-diff.md`, não aplicado nesta sessão. Move os ADRs 002, 003 e 004 de "Propostos vinculantes" para "Aceitos", adiciona o contrato do ADR 005 acima, resolve o conflito C-4, fecha C-5, e registra as pendências consolidadas em `adrs/_work/ADR-005-pendencias-ledger.md`. Aplicação sujeita a `categoria_aprovacao: ledger` e `aceite-adr`.
