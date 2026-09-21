# Ordem S2 (parte 1 de 2): políticas de RLS

RLS recortada às tabelas com ordem pronta ou aplicada: `workspace_members` (S1a), `spaces`, `space_members`, `pages` (S1b), `page_revisions`, `revision_statuses`, `revision_status_events`, `revision_current_status` (S1c1/S1c2), `page_drafts` (S1d'). Fora do recorte: `page_refs`, `assets`, `sync_state` (adiadas pela `DEC-0015`). Depende de S1f' (`content.effective_role`, `DDP-146`). A parte 2, `GRANT` e exposição no PostgREST, é `ORDEM-S2-acesso-postgrest.md`, e depende da resposta em `DDP-154`.

## Antes de ligar: o dono precisa existir

`content.workspace_members` está vazia (`DDP-115`). Ligar RLS sem a linha de dono faz `effective_role` devolver nulo para o workspace existente, e toda política recusa: o dono fica trancado fora dos próprios dados. O `INSERT` de preenchimento da `DDP-115` entra antes desta migração, ou na mesma transação, nunca depois.

## Cada tabela e a política que recebe

| Tabela | Comando | Quem passa |
| :--- | :--- | :--- |
| `workspace_members` | SELECT | a própria linha de membro |
| `spaces` | SELECT | `effective_role` não nulo, não deletado |
| `space_members` | SELECT | `effective_role` não nulo no espaço |
| `pages` | SELECT | `effective_role` não nulo; deletada só para admin/editor |
| `pages` | INSERT, UPDATE | admin/editor no espaço |
| `page_revisions` | SELECT | publicada com acesso ao espaço, ou autor, ou admin/reviewer |
| `page_revisions` | INSERT | autor é o próprio usuário, e admin/editor no espaço |
| `revision_statuses` | SELECT | qualquer autenticado |
| `revision_status_events` | SELECT | mesmo critério de `page_revisions`, por join |
| `revision_status_events` | INSERT | ator é o próprio usuário, admin/editor/reviewer no espaço |
| `revision_current_status` | SELECT | mesmo critério de `page_revisions`, via `revision_space_id()` |
| `page_drafts` | SELECT, UPDATE, DELETE | autor é o próprio usuário |
| `page_drafts` | INSERT | autor é o próprio usuário, e admin/editor no espaço |

Nenhuma tabela fica sem linha nesta lista. Onde não há comando de escrita, RLS nega por padrão: é o caso de `workspace_members` e `space_members`, sem fluxo de convite ainda (risco aberto do ADR 003), e de `page_revisions`/`revision_status_events`, onde a ausência de política de UPDATE/DELETE é a segunda garantia de imutabilidade que o próprio ADR já descreve para `page_revisions`. `revision_current_status` também fica sem política de escrita: só o trigger grava nela, e a partir da emenda da S1c2 (`DDP-155`) ele roda `security definer`, por fora desta RLS.

## `pages` ganha UPDATE, que o ADR não escreve

ADR 003 (6.3) só dá `pages_select` e `pages_write` (INSERT). Renomear/mover página são `UPDATE`, sem política recusados. `pages_update` usa o filtro de `pages_write`. Publicação não depende dela: o trigger da S1c2 grava `published_revision_id` como `security definer`, por fora desta RLS, e um revisor que publica move o ponteiro mesmo sem ser admin/editor.

## `revision_current_status` só lê

Com `content` exposto no PostgREST (`DDP-154`), RLS vira a única barreira de escrita. Política de escrita, mesmo restrita, deixaria gravar `status_code = 'published'` sem evento, contornando "status é sempre evento". A emenda da S1c2 torna a função do trigger `security definer`, escrevendo por fora desta RLS. Aqui só `SELECT`.

## A segunda recursão, achada em teste contra produção

`revisions_select` faz join em `revision_current_status`; uma primeira versão desta fazia join de volta em `page_revisions`, e o Postgres recusa com `infinite recursion detected in policy`. Correção: `content.revision_space_id(p_revision_id)`, função `security definer` que lê o espaço por fora da RLS, quebrando o ciclo. Testado como `authenticated` contra produção, em transação desfeita: sete afirmações passaram.

## `page_drafts` tem política de `DELETE` sem `GRANT`

`drafts_delete` existe na RLS, a parte 2 não concede `DELETE` para `authenticated`. Lacuna declarada: nada no fluxo de rascunho apaga linha direto hoje, a política fica pronta sem abrir a porta antes da hora.

## `revision_status_events` exige papel, não só acesso

`effective_role` não nulo inclui `viewer`, que não deveria publicar. `INSERT` exige `admin`, `editor` ou `reviewer`. Lacuna declarada: qual papel faz qual transição não é garantido pelo banco, é máquina de estados do ADR 004 (fatia E2), ainda não escrita.

## `page_drafts` separa leitura de criação

`drafts_own` original deixava `viewer` criar rascunho. `SELECT`/`UPDATE`/`DELETE` restritos ao autor. `INSERT` soma admin/editor no espaço, filtro de `pages_write`.

## `revision_statuses` é exceção deliberada

Catálogo global de códigos, sem `workspace_id`, sem escopo de tenant. O padrão das outras tabelas usa `effective_role`, que pede espaço ou workspace; aqui não há o que escopar, e o conteúdo (nomes de status) não é sensível. A política é leitura livre para qualquer autenticado.

## 1. Políticas

```sql
ALTER TABLE content.workspace_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.spaces                ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.space_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.pages                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.page_revisions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.revision_statuses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.revision_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.revision_current_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.page_drafts           ENABLE ROW LEVEL SECURITY;

CREATE POLICY workspace_members_select ON content.workspace_members FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY spaces_select ON content.spaces FOR SELECT USING (
  content.effective_role(id, auth.uid()) IS NOT NULL AND deleted_at IS NULL
);

CREATE POLICY space_members_select ON content.space_members FOR SELECT USING (
  content.effective_role(space_id, auth.uid()) IS NOT NULL
);

CREATE POLICY pages_select ON content.pages FOR SELECT USING (
  content.effective_role(space_id, auth.uid()) IS NOT NULL
  AND (deleted_at IS NULL OR content.effective_role(space_id, auth.uid()) IN ('admin', 'editor'))
);

CREATE POLICY pages_write ON content.pages FOR INSERT WITH CHECK (
  content.effective_role(space_id, auth.uid()) IN ('admin', 'editor')
);

CREATE POLICY pages_update ON content.pages FOR UPDATE USING (
  content.effective_role(space_id, auth.uid()) IN ('admin', 'editor')
) WITH CHECK (
  content.effective_role(space_id, auth.uid()) IN ('admin', 'editor')
);

CREATE POLICY revisions_select ON content.page_revisions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM content.pages p
    LEFT JOIN content.revision_current_status rcs ON rcs.revision_id = page_revisions.id
    WHERE p.id = page_revisions.page_id
      AND (
        (coalesce(rcs.status_code, 'submitted') = 'published'
           AND content.effective_role(p.space_id, auth.uid()) IS NOT NULL)
        OR page_revisions.author_id = auth.uid()
        OR content.effective_role(p.space_id, auth.uid()) IN ('admin', 'reviewer')
      )
  )
);

CREATE POLICY revisions_insert ON content.page_revisions FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (SELECT 1 FROM content.pages p WHERE p.id = page_revisions.page_id
              AND content.effective_role(p.space_id, auth.uid()) IN ('admin', 'editor'))
);

CREATE POLICY revision_statuses_select ON content.revision_statuses FOR SELECT USING (true);

CREATE POLICY revision_status_events_select ON content.revision_status_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM content.page_revisions r JOIN content.pages p ON p.id = r.page_id
          WHERE r.id = revision_status_events.revision_id
            AND content.effective_role(p.space_id, auth.uid()) IS NOT NULL)
);

CREATE POLICY revision_status_events_insert ON content.revision_status_events FOR INSERT WITH CHECK (
  actor_id = auth.uid()
  AND EXISTS (SELECT 1 FROM content.page_revisions r JOIN content.pages p ON p.id = r.page_id
              WHERE r.id = revision_status_events.revision_id
                AND content.effective_role(p.space_id, auth.uid()) IN ('admin', 'editor', 'reviewer'))
);

CREATE OR REPLACE FUNCTION content.revision_space_id(p_revision_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, content
AS $$
  SELECT p.space_id FROM content.page_revisions r JOIN content.pages p ON p.id = r.page_id
   WHERE r.id = p_revision_id;
$$;

CREATE POLICY revision_current_status_select ON content.revision_current_status FOR SELECT USING (
  content.effective_role(content.revision_space_id(revision_id), auth.uid()) IS NOT NULL
);

CREATE POLICY drafts_select ON content.page_drafts FOR SELECT USING (author_id = auth.uid());
CREATE POLICY drafts_update ON content.page_drafts FOR UPDATE
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY drafts_delete ON content.page_drafts FOR DELETE USING (author_id = auth.uid());
CREATE POLICY drafts_insert ON content.page_drafts FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (SELECT 1 FROM content.pages p WHERE p.id = page_drafts.page_id
              AND content.effective_role(p.space_id, auth.uid()) IN ('admin', 'editor'))
);
```

## Verificação

A seção de verificação é escrita pela sessão A (`DDP-123`).

## Restrições

- Só políticas, `ENABLE ROW LEVEL SECURITY` e `content.revision_space_id()` (necessária para evitar a recursão). Sem `GRANT`, sem exposição de schema: é a parte 2.
- Não crie `content.page_refs`, `content.assets` nem `content.sync_state`: fora do recorte.
- Não aplique sem a `DDP-115` resolvida antes ou junto.
- Não aplique sem aprovação humana (`app-release`).
- Nenhum contrato do ledger muda.
