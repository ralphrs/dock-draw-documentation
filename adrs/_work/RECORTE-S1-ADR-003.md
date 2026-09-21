# Recorte da fatia S1 do ADR 003 em sub-fatias

Medido nesta sessão: o DDL de `adrs/ADR-003-armazenamento-e-versionamento.md` seção 6.2 soma **12.479 caracteres** (a issue citava 15.313, número que não reproduzi. O que importa para o recorte é a medição desta sessão, refeita por bloco abaixo). O teto de uma ordem inteira é 10.000 caracteres, e uma ordem carrega SQL mais prosa (restrições, playbook, recorte de falha), então nenhum bloco de DDL sozinho pode chegar perto do teto.

## Tamanho de cada bloco numerado do DDL (medido)

| Id | Bloco | Caracteres |
| :-- | :--- | ---: |
| `S1-B0` | `workspace_members` + trigger de seed | 932 |
| `S1-B1` | `spaces`, `space_members`, `pages` | 1.695 |
| `S1-B2` | `page_revisions`, `revision_statuses`, `revision_status_events`, `revision_current_status`, triggers de imutabilidade | 4.248 |
| `S1-B3` | `page_drafts` | 484 |
| `S1-B4` | `page_refs` | 1.001 |
| `S1-B5` | `assets` | 783 |
| `S1-B6` | `sync_state` | 707 |
| `S1-B7` | `content.effective_role` | 562 |
| `S1-B8` | `content.position_between` | 337 |

O id é estável e não é reaproveitado. Toda ordem declara, logo abaixo do título, quais ids implementa, e o check 9 do `confere-quadro.sh` compara as duas listas nos dois sentidos: ordem citando id que não existe, e ordem sem declaração nenhuma. O id existir sem ordem é inventário do que falta, não defeito.

## Por que a ordem dos blocos não é livre

O bloco 2 (`page_revisions`) referencia `page_id references content.pages(id)`, que só existe depois do bloco 1. O próprio ADR já resolve a dependência circular entre `pages.published_revision_id` e `page_revisions.id`: a coluna nasce sem `foreign key` no bloco 1 e ganha a constraint só no início do bloco 2 (`alter table content.pages add constraint pages_published_revision_fk ...`). Isso já é um ponto de corte marcado pelo próprio ADR, não inventado aqui.

Os blocos 3 e 4 dependem de `pages` e `page_revisions` (blocos 1 e 2). Os blocos 5, 6, 7 e 8 dependem só de `public.workspaces` (pré-existente) e, no caso do 7, de `spaces`/`space_members`/`workspace_members` (blocos 0 e 1). Nenhum dos blocos 5-8 depende de 2, 3 ou 4.

## O recorte

| Sub-fatia | Blocos | Caracteres (DDL) | Depende de | Deixa o schema em estado consistente porque |
| :--- | :--- | ---: | :--- | :--- |
| **S1a** | 0 | 932 | `public.workspaces` (pré-existente) | Cria schema + uma tabela + um trigger que só referencia o que já existe. Nada aponta para frente |
| **S1b** | 1 | 1.695 | S1a (`workspace_members`, indiretamente via `effective_role` futuro, não usado ainda) | `pages.published_revision_id` fica sem constraint, do jeito que o próprio ADR desenha, não um estado quebrado |
| **S1c1** | parte de 2 (+ a constraint adiada do bloco 1) | 2.987 | S1b (`content.pages`) | Fecha a constraint pendente, cria `page_revisions` e `revision_status_events` (com `workspace_id`, `DEC-0014`) com os dois triggers de imutabilidade. Revisão é gravável e imutável, status é sempre evento: as duas restrições do bloco já valem sem a projeção de leitura |
| **S1c2** | resto de 2 | 1.258 | S1c1 (`page_revisions`, `revision_status_events`) | `revision_current_status` (projeção, também com `workspace_id`) e a função `content.apply_revision_status_event()` com o trigger `revision_status_events_apply`. Só otimiza leitura e automatiza o efeito de publicar, nada que S1c1 deixasse quebrado |
| **S1d** | 3, 4 | 1.485 | S1c1 (`page_revisions`), S1b (`pages`) | Duas tabelas que só acrescentam, nenhuma outra tabela depende delas |
| **S1e** | 5, 6 | 1.490 | `public.workspaces` (pré-existente) | Tabelas auxiliares por workspace, sem relação com páginas ou revisões |
| **S1f** | 7, 8 | 899 | S1b, S1a (`effective_role` lê `spaces`/`space_members`/`workspace_members`) | Só funções, sem tabela nova, sem trigger |

Ordem de aplicação, reordenada pela `DEC-0015` para tirar três blocos do caminho crítico até a primeira tela: S1a, S1b, S1c1, S1c2, depois **S1f'** (só `effective_role`, bloco 7), depois **S1d'** (só `page_drafts`, bloco 3), depois a RLS recortada às tabelas que existirem. O resto da S1d, a S1e e o resto da S1f voltam depois, sem corte de escopo.

A frase anterior desta linha dizia S1a, S1b, S1c1, S1c2, S1d, S1e, S1f, ordem que a `DEC-0015` substituiu sem atualizar este arquivo. Quem lesse o recorte sem ler a decisão aplicava a ordem errada (`DDP-135`).

## S1c partida em duas (`DDP-122`, `DEC-0015`)

O bloco 2 sozinho (4.248 caracteres de DDL) não cabe numa ordem: a proporção medida na S1b (9.812 caracteres de ordem para 3.563 de SQL, o resto prosa) estouraria o teto de 10.000 com um DDL maior, e o bloco ainda traz dois triggers de imutabilidade, que pedem roteiro de verificação maior que o de uma tabela comum.

O corte segue o mesmo critério das demais sub-fatias: cada parte deixa o schema em estado consistente. `page_revisions` e `revision_status_events`, com os dois triggers de imutabilidade e a constraint fechada de `pages.published_revision_id`, cumprem sozinhas as duas restrições do ledger que o bloco 2 constrói (revisão imutável, status sempre evento). O que sobra, `revision_current_status` (projeção de leitura) e a função `content.apply_revision_status_event()` com o trigger `revision_status_events_apply` (que marca a página como publicada, atualizando `pages.published_revision_id`, `title` e `updated_at`), não é necessário para essas restrições valerem: é otimização e automação, adiável sem deixar buraco.

`revision_status_events` (S1c1) e `revision_current_status` (S1c2) levam `workspace_id`, denormalizado, pela `DEC-0014` decisão 4: toda tabela de dado de tenant carrega a chave dele sem depender de join. Essa coluna faltava no recorte original desta sub-fatia porque o ledger só tinha registrado três das cinco linhas da `DEC-0014`. As três que faltavam entraram no ledger em `DDP-134`, aprovadas pelo humano.

Duas partes, não três: o gatilho de revisão do `DEC-0015` ("três partes para um bloco significa que o critério de corte por bloco não serve para este bloco") não foi acionado.

## Por que não três restrições na primeira sub-fatia

A issue cita três restrições candidatas para a tabela da primeira ordem: imutabilidade de `page_revisions`, status como evento, e seed automático de `workspace_members`. As duas primeiras só existem depois do bloco 2 (`page_revisions` e os triggers de imutabilidade), que é S1c1, não S1a. Forçá-las na tabela de S1a citaria mecanismo que o arquivo daquela sub-fatia não cria. A ordem de S1a traz só a terceira, que é a única que o bloco 0 de fato constrói. As outras duas entraram na ordem de S1c1 (`DDP-122`).

## Formato da migração, conferido contra o app real

`supabase/migrations/*.sql`, nome `<carimbo de 14 dígitos>_<uuid>.sql`. SQL em maiúsculas nas migrações reais mais recentes (`CREATE TABLE`, `ALTER TABLE`, `CREATE OR REPLACE FUNCTION`, `RETURNS`, `LANGUAGE`, `SECURITY DEFINER`), diferente do rascunho em minúsculas do ADR 003. A ordem de S1a converte para o estilo real.

## Falha no meio da migração e reaplicação

Cada arquivo de migração roda como uma transação só (DDL é transacional em Postgres). Uma falha no meio desfaz tudo o que aquele arquivo tentou, então o schema volta exatamente ao estado de antes de rodar o arquivo. Reaplicar o mesmo arquivo é seguro **só se a tentativa anterior falhou** (nada foi commitado). Se a migração já teve sucesso, não reaplicar: o Supabase já registra o arquivo como aplicado, e `create table` sem `if not exists` falharia na segunda vez, contra uma tabela que já existe de verdade, não é retomar um progresso: é a migração fazendo o trabalho dela duas vezes, e ela mesma protegeria contra isso.
