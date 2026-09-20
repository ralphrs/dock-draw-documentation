# Ordem S1c1: `page_revisions`, `revision_statuses`, `revision_status_events`

Primeira metade da sub-fatia S1c do ADR 003 (seção 6.2, bloco 2), partida em `DDP-122` (`DEC-0015`): o bloco tem 4.248 caracteres de DDL e dois triggers de imutabilidade. Fecha a constraint adiada de `pages.published_revision_id`. Depende da S1b (`content.pages`, aplicada).

## O corte, e por que cada metade fica consistente

**S1c1 (esta ordem):** armazenamento append-only de revisões e status como evento. Sozinha já cumpre as duas restrições do bloco 2: revisão imutável, status sempre evento.

**S1c2 (depois, tarefa própria):** `content.revision_current_status` (projeção, também com `workspace_id`) e a função/trigger `revision_status_events_apply`, que atualiza `pages.published_revision_id`, `title` e `updated_at` quando o status vira `published`. Projeção nasce vazia: "sem evento anterior" ou backfill fica para quem escrever a S1c2.

`content.page_revisions` não precisa de `project_id` (`DEC-0014`): o projeto vive na página, a revisão herda por `page_id`.

## Como aplicar esta migração

A plataforma grava pela ferramenta própria (journal em `drizzle/migrations/`, `DEC-0013`). Não crie arquivo em `supabase/migrations/`.

1. **Aplicar é categoria `app-release`** (`DEC-0007`), exige aprovação do humano.
2. **Desfazer não é `git revert`.** Falha no meio desfaz tudo (transação única). Reaplicar só é seguro se a tentativa anterior falhou.
3. **`content.pages`, `content.spaces`, `content.space_members`, `content.workspace_members` já existem** (S1a/S1b). Não recria.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "Toda escrita de conteúdo publicado cria uma linha nova em `page_revisions`; a tabela nunca é UPDATE/DELETE (garantido por trigger e ausência de política de RLS para isso)" | Trigger `page_revisions_immutable` + `forbid_mutation()`, passo 5 testa UPDATE/DELETE, espera recusa dos dois. RLS é da S2 |
| "Status editorial nunca é coluna de `page_revisions`; sempre um evento em `revision_status_events`" | `page_revisions` não tem coluna de status. `revision_status_events` grava cada mudança como linha, mesmo trigger de imutabilidade. Passo 2 insere um evento; passo 3 confere os dois triggers |

### `workspace_id` em `revision_status_events`, redundante por desenho

Fora da chave primária (`id bigint identity`). Mesma estratégia de multi-inquilino do ADR 003 (seção 6.1, decisão 8), aplicada por igual pelo `DEC-0014`. Faltou na entrega original porque o ledger só registrou três das cinco linhas da `DEC-0014`; registro completo é pendência separada (`DDP-134`), sem travar esta ordem.

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
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
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

SQL puro, sem `information_schema` (`DDP-121`: filtra por privilégio, zero linha vira falso-negativo). Testes que devem falhar usam `DO`/`EXCEPTION`, não `SAVEPOINT`: contêm o erro num statement, sem depender do cliente continuar após erro no meio do script. Escolha um `user_id` real e use o mesmo valor em todo o script. Termina em `ROLLBACK`.

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

-- 1. FK adiada fecha, tipo e alvo certos
SELECT conname FROM pg_constraint
 WHERE conrelid = 'content.pages'::regclass
   AND conname = 'pages_published_revision_fk'
   AND contype = 'f'
   AND confrelid = 'content.page_revisions'::regclass;
-- esperado: uma linha

-- 2. revisão gravada, status registrado como evento
INSERT INTO content.page_revisions (workspace_id, page_id, dok_version, content_dokmd, content_hash, frontmatter, author_id)
  SELECT w.id, p.id, 1, 'texto', 'hash-teste', '{}'::jsonb, '<mesmo user_id>'
    FROM public.workspaces w
    JOIN content.pages p ON p.workspace_id = w.id
   WHERE w.name = 'teste-s1c1';

INSERT INTO content.revision_status_events (workspace_id, revision_id, to_status, actor_id)
  SELECT r.workspace_id, r.id, 'submitted', '<mesmo user_id>'
    FROM content.page_revisions r
   WHERE r.content_hash = 'hash-teste';

-- 3. os dois triggers existem, habilitados, na função certa
SELECT tgname, tgenabled, tgfoid::regproc::text, tgtype
  FROM pg_trigger
 WHERE tgrelid IN ('content.page_revisions'::regclass, 'content.revision_status_events'::regclass)
   AND NOT tgisinternal;
-- esperado: duas linhas, tgenabled = 'O', tgfoid = content.forbid_mutation,
-- tgtype com os bits de UPDATE (16) e DELETE (8) ligados

-- 4. linha de teste existe (senão UPDATE/DELETE abaixo afetam zero, sem erro)
SELECT count(*) FROM content.page_revisions WHERE content_hash = 'hash-teste';
-- esperado: 1

-- 5. recusa UPDATE e DELETE, sem abortar script
DO $$
BEGIN
  BEGIN
    UPDATE content.page_revisions SET content_dokmd = 'outro' WHERE content_hash = 'hash-teste';
    RAISE EXCEPTION 'UPDATE não recusado';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'tabela append-only%' THEN RAISE; END IF;
  END;
  BEGIN
    DELETE FROM content.page_revisions WHERE content_hash = 'hash-teste';
    RAISE EXCEPTION 'DELETE não recusado';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'tabela append-only%' THEN RAISE; END IF;
  END;
END $$;

ROLLBACK;
```

## O que fazer se algo falhar

- Migração falha no meio: nada foi commitado. Corrija o arquivo e rode de novo.
- Consulta 1 devolve zero linha: constraint não fechou, ou aponta para outra tabela.
- `INSERT` do passo 2 falha por FK: confira se `content.pages`/`content.spaces` de teste existem.
- Consulta 3 devolve menos de duas linhas, `tgenabled` != `O`, ou bits de UPDATE/DELETE desligados: trigger ausente, desabilitado ou incompleto.
- Consulta 4 devolve 0: o preparo falhou, não é o trigger. Refaça o passo 2.
- `DO` do passo 5 propaga erro que **não** começa com "tabela append-only": falhou por outro motivo (função errada, coluna errada). Leia a mensagem real, não assuma nada.
- `DO` termina sem erro: `UPDATE`/`DELETE` não foi recusado. Pare e devolva a saída.
- Erro de permissão: pare e abra dúvida.

## Restrições

- Só este SQL. Não crie `content.revision_current_status`, nem a função/trigger `revision_status_events_apply`: são da S1c2.
- Não recrie `content.pages`, `content.spaces`, `content.space_members` nem `content.workspace_members`.
- Não aplique sem aprovação humana explícita (`app-release`).
- Nenhum contrato do ledger muda.
- Não escreva RLS, nem policy, nem server function.
- Não toque `.env*`.
- Depois de aplicar com sucesso, commite o arquivo que a migração gerar, no mesmo commit ou logo em seguida.
