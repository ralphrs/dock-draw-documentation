# Estudo: tenant, espaços, projetos, membro por espaço e administração em dois níveis

**Data:** 2026-09-23
**Pedido:** `DDP-494`, insumo do ADR 013 (Tenancy e acesso), a partir da `DEC-0035-lateral-espacos-e-administracao.md`.
**Referências verificadas nesta sessão:** `dok-draw-app/src/integrations/supabase/types.ts` (schema real, 2026-09-23), `dok-draw-app/src/infrastructure/supabase/c4-repository.ts`, `dok-draw-app/src/application/access.functions.ts`, `dok-draw-app/src/routes/_authenticated/convidados.tsx`, `adrs/ADR-003-armazenamento-e-versionamento.md`, `adrs/ADR-004-fluxo-editorial.md`, `adrs/LEDGER.md` (conflitos C-3 e C-7), `decisoes/DEC-0005-numero-do-adr-de-tenancy.md`, `DDP-495`, `DDP-496`.
Este estudo não escreve ADR nem migração. Decide direção e entrega frases prontas para o prompt do ADR 013.

## 1. O que existe hoje, com precisão

`public.workspaces(id, name, owner_id)` tem uma linha por dono. `ensureWorkspace` (`c4-repository.ts:105-117`) cria em silêncio a primeira vez que o dono acessa, sempre com o nome "Meu espaço". `public.projects` tem `workspace_id` e `owner_id`, e `listProjects` filtra por `owner_id` (`c4-repository.ts:119-127`), não por `workspace_id`. Dois donos nunca compartilham um workspace hoje, porque nada popula uma segunda linha de posse.

`public.user_roles` guarda `role: "admin" | "member"`, global, sem `workspace_id` (`types.ts:265-284`). O bootstrap da primeira pessoa a entrar (`access.functions.ts:35-48`) marca essa pessoa como `admin` e aceita seu convite automaticamente. Não há segundo nível: todo `admin` administra o produto inteiro.

`public.invites` tem `email`, `status`, `invited_by`, sem `workspace_id` nem `tenant_id` (`types.ts:17-43`). Convidar hoje significa liberar um e-mail para logar com Google no DokDraw (a tela `/convidados`, `convidados.tsx:60-63`: "Só quem está nesta lista consegue entrar"), não vincular a pessoa a um espaço ou projeto. É a lacuna que o `LEDGER.md` registra como conflito C-3.

O ADR 003 (Aceito, 2026-09-19) já criou, no schema `content`, uma tabela chamada `content.spaces` (flat por `workspace_id`, resposta à pergunta 4 do prompt, seção 6.1) com `content.space_members(space_id, user_id, role)`, papel restrito a `admin | editor | reviewer | viewer` (ADR 004, linha 158). Esse `content.spaces` organiza páginas da Wiki dentro de um workspace. Não guarda projeto de diagrama: `public.projects.workspace_id` aponta direto para `public.workspaces`, sem passar por `content.spaces`. O `types.ts` real do app (2026-09-23) não mostra o schema `content`: os ADRs 002 a 005 estão Aceitos no ledger, mas a migração para `content.*` ainda não foi aplicada no projeto Lovable Cloud.

## 2. Colisão de nome: dois conceitos diferentes já usam a palavra "espaço"

A `DEC-0035` usa "espaço" para uma divisão interna do tenant (gestão, arquitetura, IA, contabilidade), dona de projetos, com membro e papel próprios. O ADR 003 já usa "espaço" (`content.spaces`) para agrupar páginas da Wiki dentro de um workspace, com papel editorial (`admin`, `editor`, `reviewer`, `viewer`, ADR 004 seção 6.1). São conceitos parecidos (ambos ficam um nível abaixo do workspace, ambos têm membro e papel) mas não idênticos: o de hoje só contém página, o da `DEC-0035` contém projeto e, pela prancha pedida na `DDP-495` ("Convidados e Projetos de hoje: onde ficam nessa árvore"), é o nível que a lateral usa para agrupar tudo que a pessoa vê.

Duas direções, sem lacuna coberta por prosa:

**Unificar.** `content.spaces` vira o mesmo espaço da `DEC-0035`. `public.projects` ganha `space_id` (hoje só tem `workspace_id`), e o espaço passa a conter projeto e página ao mesmo tempo. `content.space_members.role` (`admin | editor | reviewer | viewer`) vira o papel geral do espaço, não só o papel editorial da Wiki. Custo aceito: reabre o ADR 003 (seção 6.2, tabela `spaces` e RLS) e o ADR 004 (seção 6.1, o parágrafo que define os quatro papéis como exclusivos da Wiki), os dois Aceitos, porque o papel `reviewer` foi desenhado para aprovação editorial e não tem sentido óbvio fora dela (o que faz um `reviewer` num projeto de diagrama). Precisa de aprovação explícita do humano para reabrir, por regra deste repositório.

**Manter separado.** Cria `public.spaces` novo (ou outro nome), fora do schema `content`, só para a divisão da `DEC-0035`, e `content.spaces` continua exclusivo da Wiki. Custo aceito: duas tabelas chamadas "espaço" no mesmo produto, cada uma com sua própria tabela de membro e seu próprio papel, e a lateral da `DDP-495` precisa mesclar duas fontes (espaços de projeto e espaços de Wiki) para montar uma árvore só, ou a pessoa vê duas árvores.

Este estudo recomenda unificar. A prancha da `DDP-495` já pede um espaço só, com projeto dentro, e a Wiki é o produto principal do DokDraw (contexto do ADR 003, seção 2). Manter dois "espaço" sem relação é a lacuna que mais confunde quem lê o schema depois. O custo (reabrir dois ADRs Aceitos) fica explícito para o humano decidir no prompt do ADR 013, não decidido em silêncio aqui.

## 3. Modelo de três níveis e o que `workspaces` vira

A `DEC-0035` fixa três níveis: tenant, espaço, projeto. `public.workspaces` já é a tabela mais alta do schema atual (nada aponta para ela). Dois candidatos para o que ela vira:

**`workspaces` vira tenant.** Cria-se `spaces` (unificado ou novo, seção 2) um nível abaixo, e `projects` ganha `space_id`. Migração: cada workspace hoje (uma por dono, nome "Meu espaço") ganha um espaço padrão criado no mesmo passo, e todo projeto existente é atribuído a esse espaço padrão, preservando `workspace_id` como o `tenant_id`. Nenhum projeto muda de dono nem de conteúdo. Custo aceito: renomear o conceito de "workspace" para "tenant" no código e na UI é trabalho à parte (não migração de dado), porque `owner_id` de um workspace de uma pessoa só hoje vira, na prática, o dono de um tenant de um espaço só.

**`workspaces` vira espaço, e um tenant novo entra acima.** Descartado. Cada workspace de hoje é "Meu espaço", um por pessoa física, sem nenhuma noção de organização compartilhada. Fazer cada workspace virar um espaço obrigaria inventar um tenant sintético por pessoa (voltando ao problema anterior um nível acima) ou fundir todos os workspaces existentes num tenant só, o que muda a posse de todo projeto existente numa migração de alto risco sem pedido de produto que o justifique.

Recomendação: `workspaces` vira tenant, um `spaces` novo (ou `content.spaces` estendido, seção 2) entra abaixo, `projects` ganha `space_id`.

## 4. Membro por espaço, herança e o papel do administrador do tenant

A `DEC-0035` diz que a pessoa é membro por espaço, não por tenant e não por projeto. Um membro de espaço enxerga os projetos daquele espaço, sem filtro adicional por projeto: hoje `listProjects` já filtra só por `owner_id` (`c4-repository.ts:124`), e a `DEC-0035` não pede granularidade abaixo do espaço.

Administrador do tenant precisa enxergar todos os espaços do tenant, mesmo sem linha própria em cada `space_members`, porque administrar espaço (criar, renomear, arquivar, pedido explícito da `DDP-496`) exige visão total. O ADR 003 já resolve esse mesmo problema um nível abaixo, em `content.effective_role()` (seção 6.2): quando não há linha em `space_members` para a pessoa, a função cai para `workspace_members` e mapeia `role = 'owner'` para `'admin'`. O mesmo padrão serve aqui trocando o nível: administrador do tenant (linha em `tenant_members` ou equivalente, com `role = 'admin'`) enxerga todo espaço do tenant sem precisar de linha em `space_members`, do mesmo jeito que hoje o dono do workspace enxerga toda página sem linha em `content.space_members`. Não é arquitetura nova: é o mesmo mecanismo do ADR 003 aplicado um nível acima.

Alternativa descartada: dar ao administrador do tenant uma linha automática em `space_members` de todo espaço, criada por trigger a cada novo espaço. Descartada porque duplica dado que a função de papel efetivo já resolve sem gravação extra, e cria uma segunda fonte de verdade (a linha trigada pode divergir se alguém editar `space_members` direto).

## 5. Administração em dois níveis

Hoje só existe um nível: `public.user_roles.role = 'admin'` administra o produto inteiro, sem tenant nenhum de fato (o bootstrap da primeira pessoa, seção 1, é o único mecanismo de promoção). A `DEC-0035` pede dois papéis distintos:

**Dono da plataforma.** Cria tenant, define quem é administrador de cada tenant, muda o estado do tenant (ativo, suspenso). Não é membro de espaço nenhum: opera acima de todo tenant. Candidato mais direto: manter `public.user_roles` global exatamente como hoje, mas restringir seu único uso a este papel (dono da plataforma), tirando dele qualquer sentido de administração de um tenant específico. O valor `member` do enum `app_role` (`types.ts:466`) perde sentido nesse desenho, porque estar logado deixa de implicar acesso a qualquer coisa: acesso vira sempre por `tenant_members`/`space_members`.

**Administrador do tenant.** Governa espaço, membro e convite dentro do próprio tenant, sem alcançar outro tenant. Precisa de uma tabela nova, `tenant_members` (ou o `workspace_members` que o ADR 003 seção 6.2 já criou, com `role = 'owner'`), porque `public.user_roles` não tem `workspace_id` e não serve para distinguir "administrador deste tenant" de "administrador de outro tenant" (o mesmo problema que o C-7 do ledger já registra para `space_members` um nível abaixo).

O convite muda de forma com os dois níveis. Hoje `public.invites` é uma lista de permissão para logar no produto (seção 1). Com tenant, convidar alguém passa a significar duas coisas possíveis: convidar para um tenant novo (fluxo do dono da plataforma, pedido explícito na `DDP-496`, "o que hoje é a tela Convidados quando o convite é para um tenant novo") ou convidar para um espaço dentro de um tenant existente (fluxo do administrador do tenant). `public.invites` sem `tenant_id` não distingue os dois. Resolver isso é o próprio conflito C-3 do ledger, e a decisão de schema (uma tabela de convite com `tenant_id` nulo para convite de plataforma, ou duas tabelas) fica para o ADR 013, não para este estudo.

## 6. Impacto nos contratos já aceitos

| Contrato | Situação | O que muda |
| --- | --- | --- |
| ADR 003, `content.spaces`/`content.space_members` | Aceito, 2026-09-19 | Se a unificação da seção 2 for aprovada, reabre para `spaces` ganhar relação com projeto e para `space_members.role` deixar de ser exclusivo de Wiki |
| ADR 003, `content.effective_role()` | Aceito | Reaproveitável como padrão de herança (seção 4), sem mudar a função em si. Uma segunda função equivalente no nível tenant é aditiva |
| ADR 004, os quatro papéis (`admin`, `editor`, `reviewer`, `viewer`) | Aceito | Se a unificação for aprovada, o ADR 013 decide se os quatro valores servem para espaço geral ou se o espaço geral precisa de um vocabulário de papel próprio, diferente do papel editorial da Wiki |
| ADR 009 (Busca, não escrito) | Depende de tenancy, `insumos/ORDEM.md` | Continua bloqueado até o ADR 013 ser aceito, sem mudança nesta análise |
| `DDP-495` (lateral) | Bloqueada por esta issue | Precisa de: espaços de que a pessoa é membro, projetos por espaço, papel da pessoa em cada espaço. Os três já são consulta direta assim que `tenant_members`/`space_members` existir |
| `DDP-496` (administração) | Bloqueada por esta issue | Visão do dono: listar/criar tenant, definir administrador do tenant, estado do tenant. Visão do administrador do tenant: CRUD de espaço, membro por espaço com papel, convite. `/convidados` de hoje deixa de ser lista de permissão de login e vira, no mínimo, o fluxo de convite por tenant/espaço que a `DDP-496` pede para desenhar |
| `public.invites` | Existe, sem `tenant_id` | Ganha `tenant_id` (ou `space_id`) no ADR 013, resolvendo o conflito C-3 do ledger |

## 7. Frases prontas para o prompt do ADR 013

Para o humano colar em `prompts/PROMPT-ADR-013.md`, junto às já registradas na `DEC-0035`:

- "`public.workspaces` vira a tabela de tenant. Um `spaces` novo entra um nível abaixo, um `space_id` novo em `public.projects` liga projeto a espaço, e todo projeto existente migra para um espaço padrão criado no mesmo passo que o tenant existente."
- "Decidir se `content.spaces`/`content.space_members` (ADR 003) e o espaço da lateral (`DEC-0035`) são a mesma tabela ou duas tabelas diferentes. Unificar reabre o ADR 003 (seção 6.2) e o ADR 004 (seção 6.1, os quatro papéis deixam de ser exclusivos da Wiki). Manter separado evita reabertura, ao custo de duas tabelas chamadas espaço com papel e membro próprios."
- "Administrador do tenant enxerga todo espaço do tenant sem linha própria em cada `space_members`, pelo mesmo padrão de fallback que `content.effective_role()` já usa entre `space_members` e `workspace_members` (ADR 003, seção 6.2)."
- "Dono da plataforma é um papel acima de todo tenant, sem ser membro de espaço nenhum. `public.user_roles` global fica restrito a esse papel. O valor `member` do enum atual perde sentido: acesso a qualquer coisa passa a vir só de `tenant_members`/`space_members`."
- "`public.invites` ganha `tenant_id` (nulo para convite de plataforma feito pelo dono, preenchido para convite de espaço feito pelo administrador do tenant), fechando o conflito C-3 do `LEDGER.md`."

## 8. Lacuna declarada

Este estudo não decide se a unificação da seção 2 acontece. É uma escolha de custo (reabrir dois ADRs Aceitos) que cabe ao humano no prompt do ADR 013, não a este estudo. Não decide o vocabulário de papel do espaço geral caso a unificação seja aprovada e `reviewer` não sirva fora da Wiki. Não decide a forma exata de `public.invites` (`tenant_id` nulo versus duas tabelas). As três ficam registradas na seção 7 como pergunta explícita para o prompt, não como resposta assumida aqui.
