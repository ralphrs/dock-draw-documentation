# Ordem S1b: `spaces`, `space_members` e `pages`

Segunda sub-fatia de S1 do ADR 003 (seção 6.2), recortada em `adrs/_work/RECORTE-S1-ADR-003.md`. Cria `content.spaces`, `content.space_members` e `content.pages`, o bloco 1 do DDL. Depende da S1a (`content.workspace_members`, já aplicada e aceita em `DDP-103`) e de `public.workspaces`, pré-existente.

## Como aplicar esta migração

A plataforma grava a migração pela ferramenta própria dela, com journal em `drizzle/migrations/` (`DEC-0013`). Não crie arquivo em `supabase/migrations/`: a S1a tentou esse caminho e a plataforma recusou. Gere a migração pela ferramenta da plataforma e deixe que ela escolha onde grava.

1. **Aplicar a migração é categoria `app-release`** (`DEC-0007`), exige aprovação do humano antes de rodar.
2. **Desfazer não é `git revert`.** O arquivo roda como uma transação: uma falha no meio desfaz tudo dele sozinha. Reaplicar o mesmo arquivo só é seguro se a tentativa anterior falhou.
3. **`content.workspace_members` já existe** (S1a aplicada). Este DDL não recria schema nem essa tabela.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "A identidade de página é id (uuid); slug é só cosmético e nunca aparece em `dok:page/<uuid>`" | Primeira metade, coberta: `content.pages.id` é `uuid primary key default gen_random_uuid()`, `slug` é coluna separada, fora da chave primária. Consulta a `information_schema` no passo 2 confirma. Segunda metade, sem mecanismo nesta fatia: "nunca aparece em `dok:page/<uuid>`" é sobre o formato de referência do DokMD, camada de `src/content-format`, que este DDL de schema não constrói nem viola. Lacuna declarada, não coberta por este passo |

Esta sub-fatia não faz RLS (S2), não faz server function (S3). As restrições de `page_revisions` (imutabilidade, status como evento) e a de seed automático de `workspace_members` já estão cobertas: a primeira entra na ordem de S1c, a segunda foi construída e verificada pela S1a.

### `published_revision_id` sem chave estrangeira, de propósito

`content.pages.published_revision_id` nasce como `uuid` solto, sem `references`. A dependência é circular: a FK só pode existir depois de `content.page_revisions`, que é a S1c. O próprio ADR 003 resolve assim (seção 6.2, comentário no bloco 1: "FK adicionada após criar page_revisions"). Não é lacuna desta ordem, é uma constraint adiada de propósito. A S1c adiciona `alter table content.pages add constraint pages_published_revision_fk foreign key (published_revision_id) references content.page_revisions(id)` como primeiro passo dela.

## 1. Criar a migração

```sql
CREATE TABLE content.spaces (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name         text NOT NULL,
  slug         text NOT NULL,
  icon         text,
  position     numeric NOT NULL DEFAULT 0,
  created_by   uuid NOT NULL REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz,
  UNIQUE (workspace_id, slug)
);

CREATE TABLE content.space_members (
  space_id uuid NOT NULL REFERENCES content.spaces(id) ON DELETE CASCADE,
  user_id  uuid NOT NULL REFERENCES auth.users(id),
  role     text NOT NULL CHECK (role IN ('admin', 'editor', 'reviewer', 'viewer')),
  PRIMARY KEY (space_id, user_id)
);

CREATE TABLE content.pages (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id           uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  space_id               uuid NOT NULL REFERENCES content.spaces(id) ON DELETE CASCADE,
  parent_page_id         uuid REFERENCES content.pages(id) ON DELETE CASCADE,
  slug                   text NOT NULL,
  title                  text NOT NULL DEFAULT 'Sem título', -- cache; fonte de verdade é frontmatter.title da revisão publicada
  position               numeric NOT NULL DEFAULT 0,
  published_revision_id  uuid, -- sem FK nesta sub-fatia: page_revisions ainda não existe (dependência circular, S1c fecha)
  created_by             uuid NOT NULL REFERENCES auth.users(id),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  deleted_at             timestamptz,
  UNIQUE (space_id, parent_page_id, slug)
);
```

Nenhum `GRANT` nesta migração, pelo mesmo motivo da S1a: acesso é por server function com conexão direta, não por PostgREST.

## 2. Verificar por SQL direto

SQL puro, sem meta-comando de cliente. Escolha antes um `user_id` real de `auth.users` já existente no projeto, e use o mesmo valor em todo o script. A transação termina em `ROLLBACK`: não persiste nada, não sobra linha para limpar.

```sql
BEGIN;

-- 1. a chave primária de content.pages é id, slug fica fora dela
SELECT kcu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = tc.constraint_name
   AND kcu.constraint_schema = tc.constraint_schema
 WHERE tc.table_schema = 'content'
   AND tc.table_name = 'pages'
   AND tc.constraint_type = 'PRIMARY KEY';
-- esperado: uma linha, column_name = 'id'

-- 2. id nasce gerado, sem depender do slug informado
INSERT INTO public.workspaces (name, owner_id) VALUES ('teste-s1b', '<user_id real>');

INSERT INTO content.spaces (workspace_id, name, slug, created_by)
  SELECT id, 'Espaço teste', 'espaco-teste', '<mesmo user_id>'
    FROM public.workspaces WHERE name = 'teste-s1b';

INSERT INTO content.pages (workspace_id, space_id, slug, created_by)
  SELECT w.id, s.id, 'pagina-teste', '<mesmo user_id>'
    FROM public.workspaces w
    JOIN content.spaces s ON s.workspace_id = w.id
   WHERE w.name = 'teste-s1b';

SELECT p.id, p.slug, p.published_revision_id
  FROM content.pages p
  JOIN public.workspaces w ON w.id = p.workspace_id
 WHERE w.name = 'teste-s1b';
-- esperado: uma linha; id é um uuid gerado; published_revision_id é null

ROLLBACK;
```

## O que fazer se algo falhar

- A migração falha no meio: nada foi commitado (transação única). Ler o erro, corrigir o arquivo, rodar de novo o mesmo arquivo.
- `INSERT INTO content.spaces` ou `content.pages` falha por FK: confira se `public.workspaces` de teste foi criado antes, e se o `user_id` usado existe de fato em `auth.users`.
- Qualquer erro de permissão (`GRANT`): pare e abra dúvida, essa é uma decisão que não cabe a quem executa.

## Restrições

- Só este SQL. Não crie `page_revisions`, `revision_statuses`, `revision_status_events`, `revision_current_status`, `page_drafts`, `page_refs`, `assets` nem `sync_state`: são de S1c em diante.
- Não recrie `content.workspace_members` nem o schema `content`: já existem (S1a).
- Não aplique a migração sem aprovação humana explícita (`app-release`).
- Não adicione a FK de `published_revision_id` nesta sub-fatia.
- Não escreva RLS, nem policy, nem server function.
- Nenhum contrato do ledger muda.
- Não toque `.env*`.
- Depois de aplicar a migração com sucesso, o arquivo que a ferramenta de migração gerar é commitado no mesmo commit ou logo em seguida: banco e histórico do repositório precisam ficar alinhados.
