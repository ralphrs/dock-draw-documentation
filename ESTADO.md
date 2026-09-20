# Estado do DokDraw

**Atualizado em:** 2026-09-20, 03:10
**Mantido por:** sessão A (arquiteto e scrum master)

Painel vivo do agora. Quanto falta e quando acaba está em `PLANO.md`. A sessão A atualiza este arquivo a cada tarefa concluída, a cada decisão registrada e a cada sprint aberta ou fechada. Quando divergir de `adrs/LEDGER.md` ou do código do app, vale a fonte, e este arquivo está atrasado.

---

## Onde o projeto está, em três linhas

A arquitetura da Wiki está decidida até a camada de edição. **Cinco ADRs aceitos, nenhuma linha de Wiki no app.** A primeira sprint de desenvolvimento acabou de abrir, e a primeira tarefa dela é instalar a fundação que ainda não existe: dependências, runner de teste e as 30 fixtures.

O Diagram Studio, que não é o produto principal, é a única parte que funciona hoje.

---

## 1. Produto: o que o DokDraw promete ser

Do `insumos/BASE.md`. Nada aqui é entrega, é o alvo.

| Capacidade | Estado |
| :--- | :--- |
| **Wiki** estilo Confluence, dialeto Starlight. O produto principal | Decidida até a edição. Nada no código |
| **Diagram Studio** C4, AWS, UML, para compor as páginas | **Funcionando no app** |
| Segundo cérebro: wikilinks, aliases, backlinks, compatível com Obsidian | Decidido no ADR 002. Nada no código |
| Export para `.md`, vault Obsidian, projeto Starlight e `.docx` | ADR 010, não escrito |
| Sync de mão única para nuvem, Google Drive primeiro | ADR 010, não escrito. Placeholder de schema decidido no ADR 003 |
| Pipeline de aprovação de edições | Decidido no ADR 004. Nada no código |
| Busca | ADR 009, não escrito |
| Navegação e descoberta | ADR 008, não escrito |
| Publicação e domínio | ADR 011, não escrito |
| Tenancy: convite, membros de workspace | **Sem ADR e sem código.** Conflitos C-3 e C-7. Recebeu o número 013 |
| Developer Portal: esta documentação como feature viva no app | Decidido que existe (`DEC-0006`), recebeu o 014. ADR não escrito |

---

## 2. Trilha de ADR: o que está documentado

| ADR | Camada | Estado | Decisão principal |
| :--- | :--- | :--- | :--- |
| 001 | Motor de diagrama | **Aceito** | `@xyflow/react`, modelo em tabelas mutáveis sem histórico |
| 002 | Formato de conteúdo | **Aceito** | DokMD v1: CommonMark + GFM + frontmatter + directives só de bloco |
| 002-E1 | Emenda 1: execução, desempenho, testes | **Aceita** em 2026-09-20 | Sem DOM nem builtin de Node, orçamento de 300 ms p95, teto de 300.000 bytes, `runFixtureSuite` compartilhada |
| 003 | Armazenamento e versionamento | **Aceito** | Postgres puro, revisão imutável append-only, status como log de eventos |
| 004 | Fluxo editorial | **Aceito** | Máquina de estados em Postgres, `REVISION_TRANSITIONS` declarativa em TS |
| 005 | Edição | **Aceito** | MDXEditor 4.2.5, adaptador via DokAST, modo fonte CodeMirror 6 |
| 006 | **Shell da Wiki (caminho de escrita)** | Não escrito. Escopo em `adrs/_work/ADR-006-escopo.md` | Rotas, listagem, edição, fila de revisão. Deixou de ser vago em 2026-09-20 (`DDP-47`) |
| 007 | Renderização | Não escrito | Próximo depois de Tenancy |
| 008 | Navegação e descoberta | Não escrito | |
| 009 | Busca | Não escrito | Depende do 013 |
| 010 | Exportação e sincronização | Não escrito | |
| 011 | Publicação | Não escrito | |
| 012 | Consolidação da stack | Não escrito | Audita todos. Encerra a trilha |
| 013 | Tenancy e acesso | Não escrito | Resolve C-3 e C-7 |
| 014 | Developer Portal | Não escrito | Depende do 007 |

**Agora:** a Emenda 1 foi aceita em 2026-09-20 (`DDP-8`), e o contrato dela está no `LEDGER.md`. Seis ADRs valem para implementação. O próximo passo da trilha de ADR é o 013, Tenancy e acesso, que fecha os conflitos C-3 e C-7.

**Depois:** 013 Tenancy → 007 → 008 e 009 → 010 e 011 → 014 → 012. Sete ADRs até o 012 fechar a trilha.

### Conflitos em aberto

| # | Sobre | Dono |
| :--- | :--- | :--- |
| C-1 | Revisão aprovada muda de aparência se o diagrama for editado depois. `page_refs.target_rev_id` fica sempre nulo | Extensão do ADR 001 |
| C-2 | SVG/PNG estático de view para export não tem dono | ADR 007 decide, 010 consome |
| C-3 | `public.invites` sem `workspace_id`. Não há como um segundo usuário entrar num workspace | ADR 013 |
| C-6 | Referências cruzadas erradas nos ADRs 002 e 004 | Próxima revisão dos dois |
| C-7 | `public.user_roles` global convive com papel por espaço, sem regra de precedência | ADR 013 |

---

## 3. Trilha de desenvolvimento: o que está no app

### O que existe hoje

Diagram Studio completo: rotas de projeto e editor, sete componentes React Flow, ~50 componentes shadcn, arquitetura hexagonal, schema `public` com nove tabelas e RLS, login Google por convite.

### O que os ADRs preveem e não existe

| Previsto | ADR | Situação |
| :--- | :--- | :--- |
| `src/content-format` | 002 | Não existe |
| `src/content-store` | 003 | Não existe |
| `src/editorial-flow` | 004 | Não existe |
| `src/editors` e `src/content-components` | 005 | Não existe |
| Schema `content.*`, 15 tabelas | 003 e 004 | Nenhuma existe |
| Runner de teste (qualquer um) | — | **Não existe.** Sem Vitest, sem Playwright, sem script `test` |
| As 16 dependências do contrato do ADR 002 | 002 | Nenhuma instalada |
| As 11 dependências do contrato do ADR 005 | 005 | Nenhuma instalada |

Levantamento completo em `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`.

### Meta da trilha

`DEC-0004`: **editar e publicar uma página da Wiki no app, ponta a ponta.** Criar, editar em DokMD no MDXEditor, salvar rascunho, submeter, aprovar, publicar.

Fora da meta: busca, export, sync, publicação pública, navegação. E a renderização de leitura, que depende do ADR 007, então a página publicada ainda não terá tela de leitura própria.

### Backlog por ADR aceito

| ADR | Fatias | Dias | Na meta |
| :--- | :--- | ---: | :--- |
| 002 | F0 fundação, F1 núcleo, F2 validação, F3 URIs, F4 save, F5 migração, F6 importadores | 10 | F0 a F4 |
| 003 | S1 schema, S2 RLS, S3 server functions, S4 `page_refs`, S5 assets, S6 lixeira, S7 `sync_state` | 9 | S1 a S4 |
| 004 | E1 tabelas e RLS, E2 FSM, E3 server functions, E4 comentários, E5 notificações, E6 `rev` | 7 | E1 a E3 |
| 005 | F1 adaptador, F2 registry, F3 colar `html`, F4 lista frouxa, F5 a F8 | a estimar | F1 a F4 |

### Sprint 1 — Fundação do `content-format`

**Objetivo:** `src/content-format` no app, com parse, serialize e normalize passando nas 30 fixtures por um comando.

| # | Fatia | Estado |
| :--- | :--- | :--- |
| 1 | ADR 002 F0: dependências, runner de teste, fixtures no app | **Aceita** (`ccc3ce2`, `DDP-5`). Typecheck, build, teste 2/2 e verificação de ambiente verdes. Sobram 27 problemas de formatação nos quatro arquivos novos, que a ordem da F1 resolve |
| 2 | ADR 002 F1: `parseDok`, `serializeDok`, `normalizeDok` | **Ordem escrita e aceita** (`DDP-9`). Em revisão com a sessão C (`DDP-57`). O despacho espera também `DDP-56` |
| 3 | ADR 002 F2: validação | Não começou |
| 4 | ADR 002 F3: URIs e referências | Não começou |

A fatia F0 é maior do que a seção 11 do ADR 002 previa, porque o critério de pronto da F1 são as 30 fixtures rodando, e não há onde rodá-las.

---

## 4. Quem faz o quê

| Sessão | Papel | Agora |
| :--- | :--- | :--- |
| **A** | Arquiteto principal, gerente de projeto, scrum master | Aplicou três aprovações de ledger. Abriu o escopo do ADR 006 |
| **B** | Arquiteto especialista que escreve: ADRs e ordens de implementação | Entregou `DDP-1`, `DDP-2` e `DDP-7`, as três aceitas. Tem `DDP-9` (ordem da F1) e `DDP-10` (estimar as fatias do ADR 005) |
| **C** | Especialista em arquitetura, UX e UI, revisora | Revisando a ordem da fatia F1 (`DDP-57`) |
| **Lovable** | Implementador. Executa ordem, não decide | Lê o quadro `DDP` direto, desde 2026-09-20. Canal verificado em `DDP-6` |

O quadro `DDP` guarda o backlog inteiro desde 2026-09-20: 34 issues de estoque com o rótulo `backlog` e sem responsável, 2 ativas, 8 concluídas. O humano cria issue direto lá, com `draft` enquanto escreve e `liberada` quando quer que a sessão A refine no padrão.

Protocolo em `guia-sessoes/PROTOCOLO.md`. Decisões em `decisoes/REGISTRO.md`. As sessões conversam por issues do projeto `DDP` em `https://dokdrawapp.atlassian.net` (`decisoes/DEC-0009-comunicacao-por-jira.md`). A pasta `tasks/` guarda só o histórico até 2026-09-20.

---

## 5. Esperando o humano

| O que | Categoria | Desde |
| :--- | :--- | :--- |
| Colar as linhas de `insumos/ORDEM.md` | proposta ao humano (`insumos/` é bloqueado) | 2026-09-20. Texto pronto no comentário de `DDP-8` |
| Ordem das colunas do quadro e campos da tela de criação | configuração do Jira | Só pela interface, o MCP não expõe administração. Não bloqueia nada |
| ~~Aplicar a Emenda 1 ao ADR 002 e ao ledger~~ | `ledger`, `aceite-adr`, `fora-de-work` | **Aprovada e aplicada em 2026-09-20** (`DDP-8`) |

---

## 6. Riscos que eu estou observando

**O processo cresceu mais rápido que o produto, e a regra que impedia isso foi quebrada quatro vezes.** A contagem e o teste que passa a valer estão na seção 4 do `PLANO.md`: mudança de processo só entra se alguém estiver parado esperando por ela.

**O original, de 2026-09-19.** Em 2026-09-19 foram criados o kit de sessões, o mapa de skills, o registro de decisões, os papéis novos e o knowledge do Lovable. O `src/` do app não ganhou uma linha. A sprint 1 é a correção disso, e nenhuma peça de processo nova entra até ela entregar. Em 2026-09-20 o protocolo mudou duas vezes mesmo assim, e as duas precisam de justificativa para não virarem exceção de conveniência: a regra de escopo de commit conserta um defeito que corrompeu evidência de spike, e o canal do Lovable mudou porque o humano ligou o conector do Jira lá. Nenhuma das duas é processo inventado por antecipação.

**O argumento de um número de contrato já caiu uma vez.** A medição de desempenho da Emenda 1 não se reproduziu quando o instrumento foi reentregue. Isso foi apanhado porque a revisão exigiu o harness de volta. Todo número que vira contrato precisa do instrumento junto.

**Ninguém testa o app hoje.** Não há runner de teste, e o Lovable não devolve evidência de build nem de teste. A partir da sprint 1 isso passa a ser critério de pronto das tarefas da sessão C.

**Sem branch, desfazer é `git revert`.** O Lovable commita direto na `main`. O gate de publicação é o `deploy_project`, que exige aprovação, mas um erro commitado já está no histórico.
