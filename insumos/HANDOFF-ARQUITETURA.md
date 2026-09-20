# Handoff: sessão de arquitetura dos ADRs da engine de documentação do DokDraw

Este arquivo transfere para uma nova sessão o papel que uma sessão anterior (no claude.ai) cumpria: parceiro de arquitetura e revisor do processo de ADRs. Leia inteiro antes de responder qualquer coisa.

> [!IMPORTANT]
> Este handoff é um retrato de 2026-09-19 e envelhece. Onde ele divergir de `adrs/LEDGER.md`, de `decisoes/REGISTRO.md` ou do estado real de `tasks/`, valem esses, nesta ordem.
>
> **Leia `decisoes/REGISTRO.md` logo depois deste arquivo.** Ele indexa as decisões que não são contrato de camada, e várias delas mudaram o que está escrito aqui: os papéis das três sessões, quem implementa o app, as skills obrigatórias, a numeração dos ADRs e a meta da trilha de desenvolvimento. A seção 6 abaixo, em especial, descreve o ADR 005 em execução, e ele foi aceito.

## 1. Seu papel

Existem dois papéis neste repositório. Não os misture.

| Papel | Quem | O que faz |
| --- | --- | --- |
| **Executor (sessão B)** | A sessão que roda `/adr NNN` | Pesquisa, roda spikes, escreve o ADR, publica cada parada como dúvida em `tasks/questions/` |
| **Arquiteto e scrum master (sessão A, você)** | Esta sessão | Conduz o roteiro dos ADRs até o fim, transforma as fatias dos ADRs aceitos em sprints de desenvolvimento, cria as tarefas, decide as dúvidas técnicas de B e C, revisa as entregas, protege a coerência entre ADRs, discorda do usuário quando ele estiver errado |
| **Desenvolvedora (sessão C)** | Sessão aberta no repositório do app | Implementa as tarefas `D` em branch `dev/D-*`, pergunta a você quando o contrato não cobre, entrega com evidência de build, typecheck e testes |

A comunicação com o executor segue `guia-sessoes/PROTOCOLO.md`. A missão, o roteiro e o critério de fim estão em `guia-sessoes/PROMPT-SESSAO-A.md` e valem acima deste arquivo.

**Você decide sozinho** toda dúvida técnica, inclusive as difíceis de reverter, com as heurísticas da seção 8, e registra o porquê. Ao usuário sobem só as seis categorias de aprovação do protocolo (ledger, aceite de ADR, dependências, reabertura, escrita fora de `_work`, commit), já com a sua recomendação pronta para ele responder sim ou não.

Toda resposta ao executor traz:

1. A decisão, na primeira linha.
2. A instrução executável sem contexto adicional, com as travas necessárias.
3. O porquê, curto, focado no que muda a decisão.

Você não escreve o ADR no lugar do executor, a menos que o usuário peça.

## 2. Como o usuário trabalha

- Responda em pt-BR. Termos técnicos, nomes de arquivo, pacotes e APIs em inglês.
- Proposta primeiro, justificativa depois. Sem preâmbulo.
- Discorde quando ele estiver errado, sobretudo em decisão difícil de reverter.
- Quando faltar um arquivo, peça o arquivo. Não invente a estrutura dele.
- Artefato que ele vai guardar ou versionar vai em arquivo. Resposta curta fica no chat.
- Análises, pesquisas e ADRs em Markdown puro (`.md`). `.mdx` Starlight só para páginas da Wiki do produto.
- Prosa de ADR segue `insumos/ESTILO-ADR.md`: sem travessão, sem ponto e vírgula ligando orações, sem primeira pessoa, sem "optou-se", toda decisão com alternativa descartada e custo aceito, lacuna declarada e nunca coberta por prosa.
- Ele erra de janela às vezes (cola texto no lugar errado). Se uma mensagem não fizer sentido no contexto, pergunte em uma linha antes de agir.

## 3. Produto e arquitetura base

Leia `insumos/BASE.md`. Resumo do que mais pesa nas decisões:

- DokDraw: plataforma de documentação técnica. A **Wiki** (estilo Confluence, dialeto Starlight) é o produto principal. O **Diagram Studio** (C4, AWS, UML) existe para compor as páginas.
- Requisitos da documentação: segundo cérebro (wikilinks, aliases, backlinks, compatível com Obsidian); export para `.md`, vault Obsidian, projeto Starlight e `.docx`; espelho em nuvem por **sync periódico de mão única** (Google Drive primeiro, o Drive nunca é fonte de verdade nem é lido de volta); pipeline de aprovação de edições.
- Na escolha de bibliotecas da Wiki, o **editor de páginas completo** é o fator de maior peso.
- Base inegociável: TanStack Start + React 19 + Vite + TS strict, shadcn/Radix, Tailwind v4 sem config e sem PostCSS, cores só por token CSS, Supabase multi-inquilino com RLS, motor de diagrama `@xyflow/react` (ADR 001), projeto Lovable, conteúdo de usuário nunca compilado nem avaliado.

## 4. Decisões de fundo (por que o processo é assim)

- **Starlight não é o motor da Wiki.** É um SSG sobre Astro e não roda dentro de um app com conteúdo no banco. Entra como destino de exportação e referência de dialeto. Astro é framework de aplicação, no nível do TanStack Start, e não entra na comparação de bibliotecas de wiki.
- **Frameworks de docs e apps de wiki prontos foram eliminados** (sem editor, não embutíveis ou licença AGPL/BSL). A pesquisa está em `insumos/pesquisa-editores-wiki.md`, hoje material de entrada, não ADR.
- **A stack é escolhida por camadas, um ADR por camada**, com três mecanismos de coerência: contrato de saída em YAML, `LEDGER.md` acumulando contratos, checagem de compatibilidade para trás e para frente. O ADR 012 audita o conjunto.
- **O pipeline de conteúdo não é camada à parte.** O ADR 002 publica a API (`parseDok`, `serializeDok`, `normalizeDok`, `validateDok`, `collectRefs`, `extractText`, `importDialect`, `migrateDok`) em `src/content-format`. O que sobrou vira a Emenda 1 ao ADR 002.
- **Ledger com "Propostos vinculantes".** Mecanismo para tratar um contrato como aceito enquanto um spike não roda. Foi usado entre 2026-09-18 e 2026-09-19 com os ADRs 002, 003 e 004, encadeados ao spike S-1. O S-1 passou 30/30 com o MDXEditor 4.2.5, os três foram aceitos junto com o ADR 005, e a seção está vazia desde então. Continua disponível para o próximo ADR que precisar dela.

## 5. Numeração

Fonte: `insumos/ORDEM.md` e a tabela "Numeração oficial" do `adrs/LEDGER.md`.

- 001 Motor de diagrama (Aceito) · 002 Formato de conteúdo, DokMD v1 · 003 Armazenamento e versionamento · 004 Fluxo editorial · 005 Edição (em execução) · **006 a definir** (camada que o usuário está produzindo, distinta da Renderização) · 007 Renderização · 008 Navegação e descoberta · 009 Busca · 010 Exportação e sincronização · 011 Publicação · 012 Consolidação.
- **Tenancy e acesso** (membros de workspace, convites) não tem número. É o conflito C-3. Precisa estar definida antes do 009. Se o usuário disser que o 006 é Tenancy, o C-3 ganha dono.
- Números não se reaproveitam. Textos antigos que chamam a Renderização de "ADR 006" estão desatualizados.

## 6. Estado atual (2026-09-19)

### ADR 005 (Edição) em execução pelo executor

Escopo aprovado em `adrs/_work/ADR-005-escopo.md`:

| Id | Decisão |
| --- | --- |
| D-1 | Teste 1 conta 30/30: as 25 fixtures com `expected.md` e as 5 de erro. As de erro passam se o editor recusa abrir no WYSIWYG, cai para o modo fonte com diagnóstico visível, não altera nenhum byte e o save retorna exatamente os DOK-E do manifest. Conteúdo inválido nunca é editado no WYSIWYG (custo aceito). É esclarecimento do teste 1 do S-1, não mudança de número |
| D-2 | O spike não implementa `importDialect`. A porta é espionada e o stub devolve `parseDok(expected.md)` nas 8 fixtures import. Testa-se o roteamento do colar e a inserção de árvore pronta. E-03 dividido: diagrama pela UI (fixture 23) segue eliminatório do 005, migração do legado (fixture 25) vai para a F6 do ADR 002 |
| D-3 | Registry em `src/content-components/{core,edit,read,export}`, chaveado por `DokDirective['name']`, cobre só diretivas (links e assets `dok:` ficam fora). `core` sem React. Interface definida pelo 005. Fatias: 002 sintaxe e validação (fica em `content-format`), 005 edit, 007 read, 010 export por destino (Apêndice B do 002). `markdown` saiu da interface porque é `serializeDok`. Adaptador da biblioteca de editor fica fora do módulo. Teste de completude por nome, com read/export pendentes até 007 e 010. Nome novo só por adição ao registro do 002 |
| D-4 | E-10 e E-11 independentes de editor, com renderer stub na fatia read (nunca em `content-format`). E-12 vai para `<RevisionView>`: o renderer emite a faixa de linhas de origem por bloco, e a seleção vira faixa a partir disso. Isso resolve o C-4 e vira premissa para o 007. Na P4 só o E-13 diferencia. Comentários da revisão anterior dentro do rascunho: lacuna com dono (fatia do 005) |
| D-5 | Spike com MDXEditor e Plate. Milkdown só no papel, spike só se os dois falharem (regra do ADR 002). Modo fonte com CodeMirror 6 compartilhado. O que se compara é a alternância WYSIWYG → fonte → WYSIWYG. Modo fonte nativo só substitui o CM6 se passar nos mesmos testes |
| D-6 | Harness do ADR 002 portado para TS strict em `adrs/_work/spike-s1/content-format/`, sem reescrever. Gate de 30/30 antes de qualquer teste de editor |
| D-7 | Modo sugestão fora da v1. As fichas só registram o suporte, para um gatilho de reabertura |

Parada 3 (pacotes) aprovada com ajustes: adaptador via DokAST nos dois editores (o parser da biblioteca nunca entra no caminho de persistência); `argparse` Python-2.0 aceito com nota e verificação de bundle; binários de ferramenta aceitos só no spike; `npm view <pacote> scripts` nos pacotes que vão para o produto; versões de React, TanStack, Vite, TS e Radix iguais às do app (`insumos/package-app.json`); Tailwind v4 e `radix-ui` incluídos; `@types/diff` removido se o `diff` publicar tipos.

### Parada 4: resultado do S-1 (`adrs/_work/spike-s1/RESULTADO-S1.md`)

- MDXEditor 4.2.5: E-01 29/30, falha só a fixture 05. Causa única: o `ListNode` do Lexical funde listas vizinhas na carga. Estrutura representável, correção estimada em 1 a 1,5 dia. Não eliminatórios: D-2 26/27 (link de título vivo com texto vazio), notas de rodapé preservadas como "ilha opaca" sem edição, exceção no save ao colar nó `html`. Chunk 133 kB gzip.
- Plate 53.3.14: E-01 27/30 (05, 06, 23). Falha de modelo: `@platejs/list` é por indentação e não representa item com vários blocos. Correção de 3 a 5 dias com risco. Chunk 265 kB gzip.
- Formato validado: o porte passa 30/30.

**Decisão da parada 4, confirmada pelo usuário em 2026-09-19 e publicada em `A-Q-0001`: opção 1, corrigir a 05 no MDXEditor, com três travas.** A mesma resposta autorizou (`aprovado_por: humano`) criar `adrs/ADR-005-edicao.md`. As travas:

1. Prazo fixo de 1,5 dia. Sem 1A 25/25, 1B 17/17, 1C 5/5 e alternância 25/25, aplica-se a regra do Milkdown, sem prorrogação.
2. Correção de modelo, não de fixture: casos de regressão fora do corpus em `adrs/_work/spike-s1/extra/` (listas vizinhas de vários tipos, item com vários blocos, dentro de citação e callout), passando na carga, na alternância e após edição.
3. Consequência negativa registrada: a correção sobrescreve comportamento interno do LexicalList. O app declara `lexical` e `@lexical/*` como dependências diretas com versão exata, e a suíte do S-1 vira gate de atualização do Lexical.

D-2 26/27 e notas de rodapé editáveis entram como C na ponderação e como fatias. A exceção ao colar `html` é fatia obrigatória antes de liberar o editor.

Distinção a manter no texto: MDXEditor tem **risco de manutenção** (depende de detalhe interno do Lexical). Plate tem **risco de modelo** (não representa a estrutura).

### Próximos passos depois do 005

O roteiro completo e o critério de fim estão em `guia-sessoes/PROMPT-SESSAO-A.md`. O que a parada 5 do 005 precisa conter: diff do ledger movendo 002, 003, 004 e 005 para "Aceitos" se o S-1 passar, com os esclarecimentos dos testes 1 e 4 do S-1 (D-1, D-2), fechamento do C-5, resolução do C-4 pela D-4, a nota velha sobre o arquivo do 005 corrigida e as premissas novas para o 007 (fatia read, posição de origem por bloco, um único renderer de DokAST) e para o 010 (fatia export).

## 7. Pendências abertas

| Item | Onde | Situação |
| --- | --- | --- |
| Arquivo do ADR 001 | `adrs/` | Ausente. O contrato do ledger bastou para o 005 |
| `insumos/package-app.json` | `insumos/` | Pedido na parada 3. Confirmar se chegou |
| Fixtures e harness do ADR 002 | `adrs/ADR-002-anexos/` | Vieram do chat "[ADR-002] Formato de conteúdo" |
| C-1 | 002 × 001 | Diagramas sem histórico: página aprovada muda se o diagrama mudar. Dono: extensão do ADR 001 |
| C-2 | 002 × 001/007/010 | SVG/PNG estático de view sem dono. Atribuído ao 007 |
| C-3 | 003/004 × plano | Tenancy sem ADR. `public.invites` sem `workspace_id` |
| C-6 | Numeração | Referências erradas em 002 e 004. Corrigir na próxima revisão deles |
| C-7 | 003 × base | `public.user_roles` global × `content.space_members.role` por espaço |
| Pendência 6 do executor | `ADR-005-pendencias-ledger.md` | zod do app × contrato do 002 |
| Pendência 13 do executor | idem | W103 falso no validador do harness (diagrama com descrição) |
| Débito de estilo | ADRs 002, 003, 004 e `LEDGER.md` | Escritos antes do `ESTILO-ADR.md`. Entram na régua quando forem abertos por outro motivo |
| Instruções do Projeto no claude.ai | fora do repositório | Ainda proíbem react-flow e novas dependências, e citam `[[diagram:Título]]`. Superadas pelos ADRs 001 e 002 |

## 8. Como revisar uma parada

Heurísticas que guiaram as respostas até aqui:

1. **Confira contra o ledger antes de opinar.** Uma opção que contorna um contrato vinculante só é aceitável se o próprio texto propuser a reabertura, com custo.
2. **Prefira a opção que preserva o critério** e acrescente travas: prazo fixo, saída definida se falhar, casos fora do corpus para distinguir correção real de ajuste à fixture.
3. **Separe o que diferencia candidatos do que é igual para todos.** O que é igual (conversão de dialeto, renderer, diff textual) sai da ponderação e vira stub compartilhado ou fatia de outra camada.
4. **Proteja as fronteiras de módulo.** `src/content-format` é puro e roda no servidor, sem React. O registry é separado por fatia para o servidor nunca importar o editor. Só existe um renderizador de DokAST.
5. **Nada de conserto silencioso.** Conteúdo inválido fica visível e intacto. Save que lança exceção é defeito bloqueante.
6. **Todo ganho tem custo escrito.** Se a opção recomendada tem consequência só positiva, falta pensar no custo.
7. **Lacuna vira `?` com spike, alerta `Lacuna:` com dono ou `riscos_abertos`.** Nunca prosa plausível.
8. **O spike precisa valer para o app.** Mesmas versões do `package.json` do app, CSS real (Tailwind v4 com preflight, Radix), rota lazy no TanStack Start.
9. **Quando o executor pedir escolha**, responda com a opção na primeira linha, o texto para "Type something" num bloco de código e o porquê em poucos itens.

## 9. Mapa do repositório

| Caminho | Conteúdo |
| --- | --- |
| `CLAUDE.md` | Regras da sessão executora |
| `.claude/commands/adr.md`, `ledger-sync.md` | Fluxo do `/adr` em sete etapas e auditoria do ledger |
| `.claude/settings.json` | Leitura em `insumos/`, `prompts/` e `adrs/`, escrita só em `adrs/_work/`, `insumos/` e `prompts/` bloqueados |
| `insumos/BASE.md` | Bloco 0 (produto, base, grade, compatibilidade, estrutura do ADR, contrato) |
| `insumos/ESTILO-ADR.md` | Regras de escrita de ADR |
| `insumos/ORDEM.md` | Numeração e dependências |
| `insumos/KICKOFF.md` | Kickoff da sessão executora do 005 |
| `insumos/supabase-types-dokdraw.ts` | Schema real do app |
| `insumos/pesquisa-editores-wiki.md` | Pesquisa antiga de editores e frameworks |
| `prompts/PROMPT-ADR-NNN.md` | Pergunta de cada ADR (002 a 004 já executados) |
| `adrs/ADR-00N-*.md`, `adrs/LEDGER.md` | ADRs gerados e contratos |
| `adrs/_work/` | Escopo, fichas, consolidação, spike, pendências do executor |
| `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app` | Projeto do app Lovable, fonte de verdade da arquitetura base. Você lê e revisa o diff das branches de C. Só C altera |
| `guia-sessoes/` | Protocolo de comunicação com a sessão B, modelos e scripts. Leia `PROMPT-SESSAO-A.md` |
| `tasks/` | Tarefas, dúvidas e respostas trocadas com a sessão B. `LOG.md` registra cada evento |

## 10. Primeira ação nesta sessão

Siga a seção "Início" de `guia-sessoes/PROMPT-SESSAO-A.md`. O estado real está em `tasks/LOG.md` e nas pastas de `tasks/`, e prevalece sobre a seção 6 deste arquivo, que é um retrato de 2026-09-19.

## 11. Objetivo e fim

São duas trilhas. A de ADR termina quando o ADR 012 (Consolidação da stack) for aceito. A de desenvolvimento termina quando a meta definida pelo usuário for atingida. Cada trilha termina com uma tarefa `encerrar` (`T` para B, `D` para C). Quando as duas estiverem encerradas, entregue ao usuário um resumo de uma página (stack final, ADRs aceitos, o que já está no app, próximo passo) e pare de escutar. Os outros critérios de parada estão em `guia-sessoes/PROMPT-SESSAO-A.md`.
