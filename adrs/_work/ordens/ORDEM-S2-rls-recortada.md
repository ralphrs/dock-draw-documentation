# Ordem S2 (parte 1 de 2): políticas de RLS

RLS recortada às tabelas com ordem pronta ou aplicada: `workspace_members` (S1a), `spaces`, `space_members`, `pages` (S1b), `page_revisions`, `revision_statuses`, `revision_status_events`, `revision_current_status` (S1c1/S1c2), `page_drafts` (S1d'). Fora do recorte: `page_refs`, `assets`, `sync_state` (adiadas pela `DEC-0015`). Depende de S1f' (`content.effective_role`, `DDP-146`). A parte 2, `GRANT` e exposição no PostgREST, é `ORDEM-S2-acesso-postgrest.md`, e depende da resposta em `DDP-154`.

## Antes de ligar: o dono precisa existir

`content.workspace_members` está vazia (`DDP-115`). Ligar RLS sem a linha de dono faz `effective_role` devolver nulo para o workspace existente, e toda política recusa: o dono fica trancado fora dos próprios dados. O `INSERT` de preenchimento da `DDP-115` entra antes desta migração, ou na mesma transação, nunca depois.

## Cada tabela e a política que recebe

| Tabela | Comando | Quem passa |
| :--- | :--- | :--- |
| `workspace_members` | SELECT | membro do mesmo workspace |
| `spaces` | SELECT | `effective_role` não nulo, não deletado |
| `space_members` | SELECT | `effective_role` não nulo no espaço |
| `pages` | SELECT | `effective_role` não nulo; deletada só para admin/editor |
| `pages` | INSERT, UPDATE | admin/editor no espaço |
| `page_revisions` | SELECT | publicada com acesso ao espaço, ou autor, ou admin/reviewer |
| `page_revisions` | INSERT | autor é o próprio usuário, e admin/editor no espaço |
| `revision_statuses` | SELECT | qualquer autenticado |
| `revision_status_events` | SELECT | mesmo critério de `page_revisions`, por join |
| `revision_status_events` | INSERT | ator é o próprio usuário, `effective_role` não nulo |
| `revision_current_status` | ALL | mesmo critério de `page_revisions`, por join |
| `page_drafts` | ALL | autor é o próprio usuário |

Nenhuma tabela fica sem linha nesta lista. Onde não há comando de escrita, RLS nega por padrão: é o caso de `workspace_members` e `space_members`, sem fluxo de convite ainda (risco aberto do ADR 003), e de `page_revisions`/`revision_status_events`, onde a ausência de política de UPDATE/DELETE é a segunda garantia de imutabilidade que o próprio ADR já descreve para `page_revisions`.

## `pages` ganha UPDATE, que o ADR não escreve

O ADR 003 (seção 6.3) só dá `pages_select` e `pages_write` (INSERT). Sem UPDATE, o trigger `revision_status_events_apply` (S1c2) não consegue gravar `published_revision_id`/`title`/`updated_at`: a função não é `security definer`, roda com o papel de quem insere o evento, e RLS bloquearia o `UPDATE` interno dela. A política `pages_update` deste ordem fecha essa lacuna, com o mesmo filtro de `pages_write`.

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
  EXISTS (SELECT 1 FROM content.workspace_members m
          WHERE m.workspace_id = workspace_members.workspace_id AND m.user_id = auth.uid())
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
                AND content.effective_role(p.space_id, auth.uid()) IS NOT NULL)
);

CREATE POLICY revision_current_status_rw ON content.revision_current_status FOR ALL USING (
  EXISTS (SELECT 1 FROM content.page_revisions r JOIN content.pages p ON p.id = r.page_id
          WHERE r.id = revision_current_status.revision_id
            AND content.effective_role(p.space_id, auth.uid()) IS NOT NULL)
) WITH CHECK (
  EXISTS (SELECT 1 FROM content.page_revisions r JOIN content.pages p ON p.id = r.page_id
          WHERE r.id = revision_current_status.revision_id
            AND content.effective_role(p.space_id, auth.uid()) IS NOT NULL)
);

CREATE POLICY drafts_own ON content.page_drafts FOR ALL
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
```

## Verificação

A seção de verificação é escrita pela sessão A (`DDP-123`).

## Restrições

- Só políticas e `ENABLE ROW LEVEL SECURITY`. Sem `GRANT`, sem exposição de schema: é a parte 2.
- Não crie `content.page_refs`, `content.assets` nem `content.sync_state`: fora do recorte.
- Não aplique sem a `DDP-115` resolvida antes ou junto.
- Não aplique sem aprovação humana (`app-release`).
- Nenhum contrato do ledger muda.
