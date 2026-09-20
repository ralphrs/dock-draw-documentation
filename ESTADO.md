# Estado do DokDraw

**Atualizado em:** 2026-09-20, 11:20
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
| **Diagram Studio** C4, AWS, UML, para compor as páginas | **Funcionando no app**, só com a notação C4. Doze famílias pedidas e aprovadas em 2026-09-20, para entrar depois da meta (`DEC-0011`) |
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
| 006 | **Shell da Wiki (caminho de escrita)** | **Aceito** em 2026-09-20 | Rotas sob `_authenticated`, autosave com debounce de 2 s e envio forçado de 30 s, os dois conflitos do ADR 003 tratados por gravidade, só a fatia `edit` na tela de edição |
| 007 | Renderização | Não escrito | Próximo depois de Tenancy |
| 008 | Navegação e descoberta | Não escrito | |
| 009 | Busca | Não escrito | Depende do 013 |
| 010 | Exportação e sincronização | Não escrito | |
| 011 | Publicação | Não escrito | |
| 012 | Consolidação da stack | Não escrito | Audita todos. Encerra a trilha |
| 013 | Tenancy e acesso | Não escrito | Resolve C-3 e C-7 |
| 014 | Developer Portal | Não escrito | Depende do 007 |
| 015 | Notações do Diagram Studio | Não escrito. Escopo aprovado, no backlog (`DDP-78`) | Doze famílias por inteiro, **depois da meta de `DEC-0004`** (`DEC-0011`). Escopo, número e extensão ao ADR 001 já resolvidos |

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

`src/content-format` real, desde 2026-09-20 (`3185728`): `parseDok`, `serializeDok`, `normalizeDok`, `validateDok` com os 16 códigos de diagnóstico, `classifyUrl`, o registro de diretivas e o schema do frontmatter, com as 30 fixtures rodando no Vitest mais o teste do `DOK-E011`. Primeira linha de Wiki no app.

Diagram Studio completo: rotas de projeto e editor, sete componentes React Flow, ~50 componentes shadcn, arquitetura hexagonal, schema `public` com nove tabelas e RLS, login Google por convite.

### O que os ADRs preveem e não existe

| Previsto | ADR | Situação |
| :--- | :--- | :--- |
| ~~`src/content-format`~~ | 002 | **Existe**, fatias F0 e F1 entregues |
| `src/content-store` | 003 | Não existe |
| `src/editorial-flow` | 004 | Não existe |
| `src/editors` e `src/content-components` | 005 | Não existe |
| Schema `content.*`, 15 tabelas | 003 e 004 | Nenhuma existe |
| ~~Runner de teste~~ | — | **Vitest 5.0.1**, script `test`, 4 testes verdes |
| ~~As 16 dependências do contrato do ADR 002~~ | 002 | **Todas instaladas** na F0 |
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
| 005 | F1 adaptador, F2 registry, F3 colar `html`, F4 lista frouxa, F5 a F8 | 14 | F1 a F4 (6 dias) |

### Sprint 1 — Fundação do `content-format` (FECHADA em 2026-09-20)

**Objetivo:** `src/content-format` no app, com parse, serialize e normalize passando nas 30 fixtures por um comando.

| # | Fatia | Estado |
| :--- | :--- | :--- |
| 1 | ADR 002 F0: dependências, runner de teste, fixtures no app | **Aceita** (`ccc3ce2`, `DDP-5`). Typecheck, build, teste 2/2 e verificação de ambiente verdes. A dívida de formatação dos quatro arquivos novos ficou: 17 problemas só em `environment.test.ts`, que a F1 não pode tocar. Vai para `DDP-61` |
| 2 | ADR 002 F1: `parseDok`, `serializeDok`, `normalizeDok` | **Fechada por inteiro** (`3185728`). Ciclo de oito passos rodado do começo ao fim, com revisão do dono do produto (`DDP-76`) |
| 3 | ADR 002 F2: validação | **Entregue junto com a F1.** O critério de pronto foi conferido item a item contra a `main` e está cumprido. Sobra só a checagem automática de `DDP-68` (`DDP-12`) |
| 4 | ADR 002 F3: URIs e referências | **Aceita** (`769a0be`, `DDP-87`). Primeira ordem a passar pelo canal consertado, sem reconstrução. Falta a revisão do dono do produto (`DDP-88`) |
| 5 | ADR 002 F4: pipeline de save | **Aceita** (`c69b151`, `DDP-101`). Ordem que passou de primeira na revisão. Falta a revisão do dono do produto (`DDP-106`) |

A fatia F0 é maior do que a seção 11 do ADR 002 previa, porque o critério de pronto da F1 são as 30 fixtures rodando, e não há onde rodá-las.

**A sprint fechou com cinco fatias em vez de quatro**, porque a ordem da F1 entregou a F2 junto. Entregue: o motor do formato DokMD, a extração de referências e o pipeline de save, com 16 testes verdes e desempenho dentro do orçamento.

**O que a sprint não fechou, e não é esquecimento:** gravar página de verdade (migrado para o ADR 003 por `DEC-0012`), o orçamento de 300 ms medido fora do Node local (`DDP-105`), e o mecanismo automático de duas restrições do contrato (`DDP-80`). As fatias F5 e F6 do ADR 002 continuam sem sub-fatia e sem sprint, o que é o estado certo: a meta de `DEC-0004` não passa por nenhuma das duas.

### Sprint 2 — Armazenamento, adiantada durante a espera

A sprint 1 está parada esperando duas respostas do dono do produto, e as sessões B e C ficariam ociosas. O recorte da primeira fatia do ADR 003 começou (`DDP-94`), porque não depende de nada da sprint 1 e a execução é gated de qualquer forma.

**A primeira migração do projeto está aplicada e aceita** (`493586b`, `DDP-103`), conferida contra o catálogo do Postgres coluna por coluna. A decisão sobre o mecanismo saiu (`DEC-0013`): os dois históricos ficam, com a fronteira em 2026-09-20, e a sequência voltou a andar pela S1b (`DDP-109`).

**A fatia S1 não cabe numa ordem.** Os blocos SQL do ADR 003 somam 15.313 caracteres, só de DDL, contra um teto de 10.000 para a ordem inteira. Ela precisa ser recortada em sub-fatias antes de virar ordem, cada uma aplicável sozinha e deixando o schema consistente.

**É a primeira fatia do projeto que toca banco.** Três coisas mudam: migração é categoria `app-release` e exige aprovação separada da de crédito; desfazer não é `git revert`, porque reverter o arquivo não desfaz o que foi aplicado; e o mecanismo tem formato próprio, `supabase/migrations/` com carimbo de tempo.

---

## 4. Quem faz o quê

| Sessão | Papel | Agora |
| :--- | :--- | :--- |
| **A** | Arquiteto principal, gerente de projeto, scrum master | Revisou o ADR 006 e a ordem da F1. Decidiu não emendar o ledger para acomodar a sequência de diagnósticos, e inverter o código em vez disso |
| **B** | Arquiteto especialista que escreve: ADRs e ordens de implementação | Sete entregas aceitas, as últimas `DDP-59` e `DDP-58`. Tem `DDP-63` (parse único na ordem da F1) e `DDP-64` (correções do ADR 006) |
| **C** | Especialista em arquitetura, UX e UI, revisora | Duas revisões de ordem entregues, as quatro conclusões confirmadas. A segunda mediu o parse triplo no harness do spike e derrubou um argumento da sessão A. Sem tarefa aberta até a ordem voltar |
| **Lovable** | Implementador. Executa ordem, não decide | Lê o quadro `DDP` direto, desde 2026-09-20. Canal verificado em `DDP-6` |

O quadro `DDP` guarda o backlog inteiro desde 2026-09-20: 34 issues de estoque com o rótulo `backlog` e sem responsável, 2 ativas, 8 concluídas. O humano cria issue direto lá, com `draft` enquanto escreve e `liberada` quando quer que a sessão A refine no padrão.

Protocolo em `guia-sessoes/PROTOCOLO.md`. Decisões em `decisoes/REGISTRO.md`. As sessões conversam por issues do projeto `DDP` em `https://dokdrawapp.atlassian.net` (`decisoes/DEC-0009-comunicacao-por-jira.md`). A pasta `tasks/` guarda só o histórico até 2026-09-20.

---

## 5. Esperando o humano

| O que | Categoria | Desde |
| :--- | :--- | :--- |
| Colar as linhas de `insumos/ORDEM.md` | proposta ao humano (`insumos/` é bloqueado) | 2026-09-20. Texto pronto nos comentários de `DDP-8` e `DDP-47` |
| Ordem das colunas do quadro e campos da tela de criação | configuração do Jira | Só pela interface, o MCP não expõe administração. Não bloqueia nada |
| ~~Aceitar o ADR 006~~ | `aceite-adr`, `ledger` | **Aprovado e aplicado em 2026-09-20** (`DDP-66`) |
| ~~Autorizar o crédito da ordem da F1~~ | `credito` | **Aprovado em 2026-09-20** (`DDP-69`). O Lovable está executando |
| ~~Aprovar a coluna de estimativa do ADR 005~~ | `fora-de-work` | **Aprovada e aplicada em 2026-09-20** (`DDP-60`, commit `2f46167`) |
| ~~Aplicar a Emenda 1 ao ADR 002 e ao ledger~~ | `ledger`, `aceite-adr`, `fora-de-work` | **Aprovada e aplicada em 2026-09-20** (`DDP-8`) |

---

## 6. Riscos que eu estou observando

**O gargalo mudou de lugar, e agora é a aprovação.** Nas primeiras fatias o gargalo era a qualidade da ordem: a F1 levou três passadas de revisão e quatro famílias de defeito. Depois das seis regras que saíram dela, a F4 passou de primeira e a S1a em duas. Em 2026-09-20, das 09:00 às 09:40, três itens ficaram parados esperando resposta do dono do produto enquanto as sessões B e C terminavam tudo que não dependia dele.

Isso não é queixa, é medição. Se a espera virar regra em vez de exceção, vale discutir pré-autorizar categorias de baixo risco, por exemplo crédito abaixo de um teto por fatia. Nenhuma proposta nesse sentido foi feita, porque a amostra é de um dia.

**O processo cresceu mais rápido que o produto, e a regra que impedia isso foi quebrada quatro vezes.** A contagem e o teste que passa a valer estão na seção 4 do `PLANO.md`: mudança de processo só entra se alguém estiver parado esperando por ela.

**O original, de 2026-09-19.** Em 2026-09-19 foram criados o kit de sessões, o mapa de skills, o registro de decisões, os papéis novos e o knowledge do Lovable. O `src/` do app não ganhou uma linha. A sprint 1 é a correção disso, e nenhuma peça de processo nova entra até ela entregar. Em 2026-09-20 o protocolo mudou duas vezes mesmo assim, e as duas precisam de justificativa para não virarem exceção de conveniência: a regra de escopo de commit conserta um defeito que corrompeu evidência de spike, e o canal do Lovable mudou porque o humano ligou o conector do Jira lá. Nenhuma das duas é processo inventado por antecipação.

**O argumento de um número de contrato já caiu uma vez.** A medição de desempenho da Emenda 1 não se reproduziu quando o instrumento foi reentregue. Isso foi apanhado porque a revisão exigiu o harness de volta. Todo número que vira contrato precisa do instrumento junto.

**Vinte e oito das 37 restrições do ledger não têm verificação nenhuma hoje**, porque pertencem a camadas que o app ainda não tem. A auditoria de 2026-09-20 (`decisoes/AUDITORIA-2026-09-20-restricao-x-mecanismo.md`) mediu isso. O que protege essas 28 é uma regra de processo, não um comando: a ordem de cada fatia entrega a tabela de restrição por mecanismo, e a revisão começa por ela. Se a regra for afrouxada, o projeto volta ao estado em que cinco defeitos do mesmo tipo passaram num dia só.

**~~O canal de ordem corrompia o código na leitura.~~** Resolvido em 2026-09-20 (`DDP-74`): blocos de código da ordem entram em `{code}`, o que desliga a interpretação de wiki markup. Provado com os nove padrões exatos que se corromperam na fatia F1, todos íntegros pelos três caminhos de leitura.

**O corpus de 30 fixtures estava ao alcance de um comando de rotina.** `bun run format` é `prettier --write .`, o Prettier formata Markdown, e 16 fixtures estão fora do formato dele. Rodá-lo acrescenta ponto e vírgula ao JavaScript dentro do bloco de código da fixture 07, indenta o `:::` que fecha o callout da 16 e insere linha em branco nas tabs da 20, com `input` e `expected` reescritos na mesma passada, sem a suíte acusar nada. A fatia F1 passa a pôr a pasta no `.prettierignore`. Até esse commit existir, o risco continua de pé, e vale para qualquer pessoa que rode o script, dentro ou fora do processo.

**Ninguém testa o app hoje.** Não há runner de teste, e o Lovable não devolve evidência de build nem de teste. A partir da sprint 1 isso passa a ser critério de pronto das tarefas da sessão C.

**Sem branch, desfazer é `git revert`.** O Lovable commita direto na `main`. O gate de publicação é o `deploy_project`, que exige aprovação, mas um erro commitado já está no histórico.
