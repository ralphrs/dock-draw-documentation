# Ordem S1b: `spaces`, `space_members` e `pages`

Segunda sub-fatia de S1 do ADR 003 (seção 6.2), recortada em `adrs/_work/RECORTE-S1-ADR-003.md`. Cria `content.spaces`, `content.space_members` e `content.pages`. Depende da S1a (`content.workspace_members`, aplicada em `DDP-103`) e de `public.workspaces`, pré-existente.

**Emendada em `DDP-113`** (`DEC-0014`, a partir de `DDP-110`): `content.pages` ganha `project_id` (hierarquia de quatro níveis) e `UNIQUE NULLS NOT DISTINCT`. `content.space_members` ganha `workspace_id`, denormalizado. `content.spaces` não muda.

## Como aplicar esta migração

A plataforma grava a migração pela ferramenta própria, com journal em `drizzle/migrations/` (`DEC-0013`). Não crie arquivo em `supabase/migrations/`: a S1a tentou e a plataforma recusou. Deixe a ferramenta da plataforma escolher onde grava.

1. **Aplicar a migração é categoria `app-release`** (`DEC-0007`), exige aprovação do humano antes de rodar.
2. **Desfazer não é `git revert`.** O arquivo roda como transação: falha no meio desfaz tudo sozinha. Reaplicar só é seguro se a tentativa anterior falhou.
3. **`content.workspace_members` já existe** (S1a). Este DDL não recria schema nem essa tabela.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "A identidade de página é id (uuid); slug é só cosmético e nunca aparece em `dok:page/<uuid>`" | Primeira metade, coberta: `id` é `uuid primary key default gen_random_uuid()`, `slug` fica fora da chave primária (consulta a `information_schema` no passo 2 confirma). Segunda metade, sem mecanismo nesta fatia: é sobre o formato de referência do DokMD, camada de `src/content-format`, que este DDL não constrói nem viola. Lacuna declarada |
| "Tudo tem que ser único, como no Confluence" (decisão do dono do produto, `DDP-110`) | `UNIQUE NULLS NOT DISTINCT (space_id, project_id, parent_page_id, slug)`: nulo passa a contar como valor comparável, então duas páginas de raiz do mesmo espaço não podem repetir slug. Passo 2 insere duas e mostra a segunda recusada |

Esta sub-fatia não faz RLS (S2) nem server function (S3). As restrições de `page_revisions` (imutabilidade, status como evento) entram na ordem de S1c; o seed automático de `workspace_members` já foi construído e verificado pela S1a.

### `published_revision_id` sem chave estrangeira, de propósito

`content.pages.published_revision_id` nasce `uuid` solto, sem `references`: a FK só pode existir depois de `content.page_revisions` (S1c), dependência circular que o próprio ADR 003 já resolve assim (seção 6.2: "FK adicionada após criar page_revisions"). Constraint adiada de propósito, não lacuna desta ordem. A S1c adiciona `alter table content.pages add constraint pages_published_revision_fk foreign key (published_revision_id) references content.page_revisions(id)` como primeiro passo dela.

### `project_id` sem chave estrangeira e nulo por desenho

`content.pages.project_id` nasce `uuid` solto, sem `references`, e pode ser nulo. Sem FK porque `public.projects` pertence ao ADR 001, e o ADR 003 já decidiu, na seção 6.6, que `page_refs.target_id` não ganha FK para lá pelo mesmo motivo: FK direta acoplaria este ADR ao schema de outro. `project_id` segue a doutrina já registrada, garantia por disciplina de aplicação, não por constraint de banco. Nulo porque um espaço pode ter página própria, fora de qualquer projeto, do jeito que um espaço do Confluence tem; coluna obrigatória forçaria inventar um projeto só para a página existir. É por isso que o `UNIQUE NULLS NOT DISTINCT` cobre esse nulo junto ao de `parent_page_id`: sem a cláusula, duas páginas de raiz de projeto (ambas nulas) driblariam a unicidade, o caso mais comum de todos.

### `workspace_id` em `space_members`, redundante por desenho

`content.space_members` ganha `workspace_id`, denormalizado a partir do espaço. A chave primária continua `(space_id, user_id)`: `workspace_id` entrar nela abriria caminho para duas linhas do mesmo par espaço e usuário. Não é defeito de normalização, é a estratégia de multi-inquilino que o ADR 003 já escolheu (seção 6.1, decisão 8), aplicada por igual pelo `DEC-0014`: toda tabela de dado de tenant carrega a chave dele sem depender de join, para separar um tenant de instância pelo mesmo predicado em toda tabela.

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
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  space_id     uuid NOT NULL REFERENCES content.spaces(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id),
  role         text NOT NULL CHECK (role IN ('admin', 'editor', 'reviewer', 'viewer')),
  PRIMARY KEY (space_id, user_id)
);

CREATE TABLE content.pages (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id           uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  space_id               uuid NOT NULL REFERENCES content.spaces(id) ON DELETE CASCADE,
  project_id             uuid, -- sem FK: public.projects pertence ao ADR 001
  parent_page_id         uuid REFERENCES content.pages(id) ON DELETE CASCADE,
  slug                   text NOT NULL,
  title                  text NOT NULL DEFAULT 'Sem título', -- cache; fonte de verdade é frontmatter.title da revisão publicada
  position               numeric NOT NULL DEFAULT 0,
  published_revision_id  uuid, -- sem FK nesta sub-fatia: page_revisions ainda não existe (dependência circular, S1c fecha)
  created_by             uuid NOT NULL REFERENCES auth.users(id),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  deleted_at             timestamptz,
  UNIQUE NULLS NOT DISTINCT (space_id, project_id, parent_page_id, slug)
);
```

Nenhum `GRANT` nesta migração, mesmo motivo da S1a: acesso é por server function com conexão direta, não por PostgREST.

## 2. Verificar por SQL direto

SQL puro, sem meta-comando de cliente. Escolha um `user_id` real de `auth.users` e use o mesmo valor em todo o script. Termina em `ROLLBACK`: não persiste nada.

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

-- 3. duas páginas de raiz do mesmo espaço não podem repetir slug
SAVEPOINT slug_duplicado;

INSERT INTO content.pages (workspace_id, space_id, slug, created_by)
  SELECT w.id, s.id, 'pagina-teste', '<mesmo user_id>'
    FROM public.workspaces w
    JOIN content.spaces s ON s.workspace_id = w.id
   WHERE w.name = 'teste-s1b';
-- esperado: erro, unique_violation

ROLLBACK TO SAVEPOINT slug_duplicado;

ROLLBACK;
```

## O que fazer se algo falhar

- A migração falha no meio: nada foi commitado (transação única). Corrija o arquivo e rode de novo.
- `INSERT` em `content.spaces`/`content.pages` falha por FK: confira se o workspace de teste foi criado antes, e se o `user_id` existe em `auth.users`.
- O `INSERT` do passo 3 **não** falha: a constraint não tem `NULLS NOT DISTINCT` ou não inclui as quatro colunas. Pare e devolva a saída.
- Erro de permissão (`GRANT`): pare e abra dúvida, decisão que não cabe a quem executa.

## Restrições

- Só este SQL. Não crie `page_revisions`, `revision_statuses`, `revision_status_events`, `revision_current_status`, `page_drafts`, `page_refs`, `assets` nem `sync_state`: são de S1c em diante.
- Não recrie `content.workspace_members` nem o schema `content`: já existem (S1a).
- Não aplique a migração sem aprovação humana explícita (`app-release`).
- Não adicione a FK de `published_revision_id` nem de `project_id` nesta sub-fatia.
- Não crie nem edite nada em `public.projects` (ADR 001): fica fora desta ordem.
- Não ponha `workspace_id` na chave primária de `space_members`: continua `(space_id, user_id)`.
- Não escreva RLS, nem policy, nem server function.
- Nenhum contrato do ledger muda.
- Não toque `.env*`.
- Depois de aplicar com sucesso, o arquivo que a ferramenta de migração gerar é commitado no mesmo commit ou logo em seguida: banco e histórico do repositório precisam ficar alinhados.
