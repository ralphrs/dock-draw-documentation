# Ordem S1c1: `page_revisions`, `revision_statuses`, `revision_status_events`

Primeira metade da sub-fatia S1c do ADR 003 (seção 6.2, bloco 2), partida em `DDP-122` por exigência de teto (`DEC-0015`): o bloco tem 4.290 caracteres de DDL e dois triggers de imutabilidade, que pedem roteiro de verificação maior que o de uma tabela comum. Fecha também a constraint adiada de `pages.published_revision_id`, primeiro passo do bloco 2. Depende da S1b (`content.pages`, aplicada).

## O corte, e por que cada metade fica consistente

**S1c1 (esta ordem):** armazenamento append-only de revisões e status como evento, sem projeção de leitura rápida nem efeito de publicar. Sozinha já cumpre as duas restrições do ledger que o bloco 2 constrói: revisão imutável, status sempre evento. Falta só otimização de leitura e o gatilho que publica a página, que não impedem gravar revisão nem registrar evento.

**S1c2 (depois, tarefa própria):** `content.revision_current_status` (projeção) e a função/trigger `apply_revision_status_event`, que projeta o evento e marca `pages.published_revision_id` quando o status vira `published`.

`content.pages` não precisa de `project_id` nem de coluna nova aqui (`DEC-0014`): o projeto vive na página, a revisão herda por `page_id`.

## Como aplicar esta migração

A plataforma grava pela ferramenta própria, com journal em `drizzle/migrations/` (`DEC-0013`). Não crie arquivo em `supabase/migrations/`. Deixe a ferramenta da plataforma escolher onde grava.

1. **Aplicar é categoria `app-release`** (`DEC-0007`), exige aprovação do humano.
2. **Desfazer não é `git revert`.** Falha no meio desfaz tudo (transação única). Reaplicar só é seguro se a tentativa anterior falhou.
3. **`content.pages`, `content.spaces`, `content.space_members`, `content.workspace_members` já existem** (S1a, S1b). Este DDL não as recria.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "Toda escrita de conteúdo publicado cria uma linha nova em `page_revisions`; a tabela nunca é UPDATE/DELETE (garantido por trigger e ausência de política de RLS para isso)" | Trigger `page_revisions_immutable` + `content.forbid_mutation()`: qualquer UPDATE/DELETE levanta exceção. Passo 3 tenta um UPDATE dentro de `SAVEPOINT` e espera erro. RLS é da S2, fora desta ordem: mecanismo aqui é só o trigger |
| "Status editorial nunca é coluna de `page_revisions`; sempre um evento em `revision_status_events`" | `page_revisions` não tem coluna de status. `revision_status_events` grava cada mudança como linha, com o mesmo trigger de imutabilidade. Passo 2 insere um evento de verdade e confere o trigger via `pg_trigger` |

## 1. Criar a migração

```sql
CREATE TABLE content.page_revisions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  page_id             uuid NOT NULL REFERENCES content.pages(id) ON DELETE CASCADE,
  parent_revision_id  uuid REFERENCES content.page_revisions(id),
  dok_version         smallint NOT NULL CHECK (dok_version >= 1),
  content_dokmd       text NOT NULL,
  content_hash        text NOT NULL, -- sha256 hex de content_dokmd
  frontmatter         jsonb NOT NULL, -- cache de leitura; sempre derivável de content_dokmd
  ast                 jsonb, -- cache opcional de mdast; regenerável, pode ficar null
  author_id           uuid NOT NULL REFERENCES auth.users(id),
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE content.pages
  ADD CONSTRAINT pages_published_revision_fk
  FOREIGN KEY (published_revision_id) REFERENCES content.page_revisions(id);

CREATE INDEX page_revisions_by_page ON content.page_revisions (page_id, created_at DESC);
CREATE INDEX page_revisions_by_hash ON content.page_revisions (page_id, content_hash); -- detectar save sem mudança real

CREATE TABLE content.revision_statuses (
  code        text PRIMARY KEY,
  label       text NOT NULL,
  is_terminal boolean NOT NULL DEFAULT false
);

INSERT INTO content.revision_statuses (code, label, is_terminal) VALUES
  ('submitted',         'Enviada para revisão', false),
  ('in_review',         'Em revisão',           false),
  ('changes_requested', 'Mudanças solicitadas', false),
  ('approved',          'Aprovada',             false),
  ('published',         'Publicada',            true),
  ('rejected',          'Rejeitada',            true),
  ('superseded',        'Substituída',          true)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE content.revision_status_events (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  revision_id  uuid NOT NULL REFERENCES content.page_revisions(id) ON DELETE CASCADE,
  from_status  text REFERENCES content.revision_statuses(code),
  to_status    text NOT NULL REFERENCES content.revision_statuses(code),
  actor_id     uuid NOT NULL REFERENCES auth.users(id),
  comment      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION content.forbid_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'tabela append-only: % não é permitido em % (id=%)', TG_OP, TG_TABLE_NAME, OLD.id;
END;
$$;

CREATE TRIGGER page_revisions_immutable
  BEFORE UPDATE OR DELETE ON content.page_revisions
  FOR EACH ROW EXECUTE FUNCTION content.forbid_mutation();

CREATE TRIGGER revision_status_events_immutable
  BEFORE UPDATE OR DELETE ON content.revision_status_events
  FOR EACH ROW EXECUTE FUNCTION content.forbid_mutation();
```

Nenhum `GRANT`, mesmo motivo da S1a/S1b.

## 2. Verificar por SQL direto

SQL puro, sem `information_schema` (`DDP-121`: filtra por privilégio do papel corrente, e zero linha vira falso-negativo). Use `pg_constraint`/`pg_trigger` com join em `pg_class`/`pg_namespace`. Escolha um `user_id` real de `auth.users` e use o mesmo valor em todo o script. Termina em `ROLLBACK`.

```sql
BEGIN;

INSERT INTO public.workspaces (name, owner_id) VALUES ('teste-s1c1', '<user_id real>');

INSERT INTO content.spaces (workspace_id, name, slug, created_by)
  SELECT id, 'Espaço teste', 'espaco-teste', '<mesmo user_id>'
    FROM public.workspaces WHERE name = 'teste-s1c1';

INSERT INTO content.pages (workspace_id, space_id, slug, created_by)
  SELECT w.id, s.id, 'pagina-teste', '<mesmo user_id>'
    FROM public.workspaces w
    JOIN content.spaces s ON s.workspace_id = w.id
   WHERE w.name = 'teste-s1c1';

-- 1. a FK adiada de published_revision_id fecha de verdade
SELECT con.conname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
 WHERE nsp.nspname = 'content' AND rel.relname = 'pages'
   AND con.conname = 'pages_published_revision_fk';
-- esperado: uma linha

-- 2. revisão gravada, status registrado como evento
INSERT INTO content.page_revisions (workspace_id, page_id, dok_version, content_dokmd, content_hash, frontmatter, author_id)
  SELECT w.id, p.id, 1, 'texto', 'hash-teste', '{}'::jsonb, '<mesmo user_id>'
    FROM public.workspaces w
    JOIN content.pages p ON p.workspace_id = w.id
   WHERE w.name = 'teste-s1c1';

INSERT INTO content.revision_status_events (revision_id, to_status, actor_id)
  SELECT r.id, 'submitted', '<mesmo user_id>'
    FROM content.page_revisions r
   WHERE r.content_hash = 'hash-teste';

SELECT tgname FROM pg_trigger
 WHERE tgrelid = 'content.revision_status_events'::regclass
   AND tgname = 'revision_status_events_immutable';
-- esperado: uma linha

-- 3. o trigger recusa UPDATE em page_revisions
SAVEPOINT tenta_mutar;

UPDATE content.page_revisions SET content_dokmd = 'outro' WHERE content_hash = 'hash-teste';
-- esperado: erro, "tabela append-only"

ROLLBACK TO SAVEPOINT tenta_mutar;

ROLLBACK;
```

## O que fazer se algo falhar

- A migração falha no meio: nada foi commitado. Corrija o arquivo e rode de novo.
- A consulta 1 devolve zero linha: a constraint não fechou. Confira se o `ALTER TABLE` rodou.
- O `INSERT` do passo 2 falha por FK: confira se `content.pages`/`content.spaces` de teste existem antes.
- O `UPDATE` do passo 3 **não** falha: o trigger não está criado, ou a função não está anexada à tabela certa. Pare e devolva a saída.
- Qualquer erro de permissão: pare e abra dúvida.

## Restrições

- Só este SQL. Não crie `content.revision_current_status`, nem a função/trigger `apply_revision_status_event`: são da S1c2.
- Não recrie `content.pages`, `content.spaces`, `content.space_members` nem `content.workspace_members`.
- Não aplique sem aprovação humana explícita (`app-release`).
- Nenhum contrato do ledger muda.
- Não escreva RLS, nem policy, nem server function.
- Não toque `.env*`.
- Depois de aplicar com sucesso, o arquivo que a ferramenta de migração gerar é commitado no mesmo commit ou logo em seguida.
