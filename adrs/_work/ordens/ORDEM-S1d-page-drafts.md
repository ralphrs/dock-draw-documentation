# Ordem S1d': `content.page_drafts`

**Blocos do recorte:** `S1-B3`

Sub-fatia S1d' da `DEC-0015`, só `content.page_drafts` (ADR 003, seção 6.2, linhas 318 a 326). `S1-B4` (`content.page_refs`) fica fora desta ordem. Depende de S1b (`content.pages`) e S1c1 (`content.page_revisions`), ambas aplicadas.

## Como aplicar esta migração

A plataforma grava pela ferramenta própria, journal em `drizzle/migrations/` (`DEC-0013`). Não crie arquivo em `supabase/migrations/`.

1. **Aplicar é categoria `app-release`** (`DEC-0007`), exige aprovação do humano. A aplicação está travada esperando a liberação da `DDP-140`.
2. **Desfazer não é `git revert`.** Falha no meio desfaz tudo, transação única.
3. **`content.pages` e `content.page_revisions` já existem, aplicadas.** Este DDL não as recria.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "`content.page_drafts` tem `workspace_id`, denormalizado" (entrada do ADR 003 no ledger, `DEC-0014`, `DDP-118`, registro completado em `DDP-134`) | A tabela nasce com `workspace_id uuid not null references public.workspaces(id)`, fora da chave primária, que continua `(page_id, author_id)`. O DDL do ADR (linhas 318 a 326) não tem a coluna, porque é anterior à decisão |
| "Ninguém lê o rascunho de outro autor fora do fluxo formal de revisão (RLS: `page_drafts` só é visível ao próprio autor)" | Lacuna declarada nesta ordem: nenhuma policy nasce aqui, é trabalho da S2'. A tabela ganha `author_id`, a coluna que a RLS vai usar para filtrar, mas o mecanismo de restrição (a policy) ainda não existe depois desta migração |

## `based_on_revision_id` nulo tem significado

Nulo quer dizer página nunca publicada. Não é ausência de dado, é o valor que marca o caso "sem revisão anterior para comparar". É a base da detecção de conflito entre autores no `submitRevision`: comparar `based_on_revision_id` do rascunho com `pages.published_revision_id` no momento do envio diz se alguém publicou por cima enquanto o autor editava.

## `version` é o bloqueio otimista do autosave

É o `expectedVersion` que o ADR 006 usa em `saveDraft`, e que gera `DraftVersionConflictError` quando o valor enviado pelo cliente não bate com o valor gravado. Esta ordem só cria a coluna com `default 1`. Nenhuma função, trigger ou lógica de incremento nasce aqui: o incremento é responsabilidade da server function `saveDraft`, que é S3.

## 1. Criar a migração

```sql
CREATE TABLE content.page_drafts (
  page_id               uuid NOT NULL REFERENCES content.pages(id) ON DELETE CASCADE,
  workspace_id          uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  author_id             uuid NOT NULL REFERENCES auth.users(id),
  content_dokmd         text NOT NULL,
  based_on_revision_id  uuid REFERENCES content.page_revisions(id), -- null = pagina nunca publicada
  version               integer NOT NULL DEFAULT 1,
  updated_at            timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (page_id, author_id)
);
```

Nenhum `GRANT` nesta migração, mesmo motivo das sub-fatias anteriores.

## Verificação

### 1. Catálogo

Rode a consulta que `guia-sessoes/bin/confere-execucao.sh --sql` gera a partir deste arquivo e compare com `--compara`. Divergência em qualquer linha reprova.

### 2. Comportamento

O bloco termina em exceção de propósito: o veredito sai na mensagem e nada fica gravado.

```sql
DO $$
DECLARE ws uuid; usr uuid; sp uuid; pg uuid; v int; veredito text := '';
BEGIN
  SELECT id INTO ws FROM public.workspaces LIMIT 1;
  SELECT id INTO usr FROM auth.users LIMIT 1;
  INSERT INTO content.spaces (workspace_id, name, slug, created_by) VALUES (ws,'e','e-s1d',usr) RETURNING id INTO sp;
  INSERT INTO content.pages (workspace_id, space_id, slug, title, position, created_by)
       VALUES (ws, sp, 'p', 'P', 1, usr) RETURNING id INTO pg;

  -- a) rascunho de pagina nunca publicada, versao comeca em 1
  INSERT INTO content.page_drafts (page_id, workspace_id, author_id, content_dokmd)
       VALUES (pg, ws, usr, '# r') RETURNING version INTO v;
  IF v IS DISTINCT FROM 1 THEN veredito := veredito || 'FALHA a) versao ' || coalesce(v::text,'nula') || '. '; END IF;

  -- b) um rascunho por autor por pagina
  BEGIN
    INSERT INTO content.page_drafts (page_id, workspace_id, author_id, content_dokmd) VALUES (pg, ws, usr, '# r2');
    veredito := veredito || 'FALHA b) segundo rascunho do mesmo autor aceito. ';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  -- c) apagar a pagina leva o rascunho junto
  DELETE FROM content.pages WHERE id = pg;
  IF EXISTS (SELECT 1 FROM content.page_drafts WHERE page_id = pg) THEN
    veredito := veredito || 'FALHA c) rascunho sobreviveu a pagina. ';
  END IF;

  IF veredito = '' THEN veredito := 'PASSOU a, b e c'; END IF;
  RAISE EXCEPTION 'VEREDITO: %', veredito;
END $$;
```

A saída esperada é o erro `VEREDITO: PASSOU a, b e c`. A afirmação `b` é a discriminante: sem a chave primária composta, o mesmo autor abre dois rascunhos da mesma página, e o autosave passa a não saber qual atualizar.

### Lacuna declarada

Dois autores com rascunho na mesma página não são testados: `author_id` tem chave estrangeira para `auth.users` e o banco tem um usuário só.

A afirmação `c` usa página sem revisão. Apagar página que tem revisão falha antes de chegar ao rascunho, porque o trigger de imutabilidade de `content.page_revisions` recusa o `DELETE` em cascata. Isso é desenho do ADR 003, que apaga página por `deleted_at`, não por `DELETE`.

## Restrições

- Só este SQL. Não crie `content.page_refs` (`S1-B4`): é outra ordem.
- Não recrie `content.pages` nem `content.page_revisions`: já existem.
- Não escreva RLS, nem policy, nem server function: `author_id` só existe para a S2' usar depois.
- Não crie trigger nem função para `version`: o incremento é da S3.
- Não aplique. A aplicação é `app-release`, e está travada na `DDP-140`.
- Nenhum contrato do ledger muda.
- Não toque `.env*`.
