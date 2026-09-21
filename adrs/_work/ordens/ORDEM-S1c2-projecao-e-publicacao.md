# Ordem S1c2: projeção de status e publicação da página

**Blocos do recorte:** `S1-B2` (segunda metade)

Segunda metade da sub-fatia S1c do ADR 003 (seção 6.2, bloco 2, linhas 265 a 297), partida em `DDP-122` (`DEC-0015`). A primeira metade, `content.page_revisions` e `content.revision_status_events` com os triggers de imutabilidade, está aplicada em produção (commit `f619fb1` no app, migração `0002_create_content_page_revisions.sql`) e conferida no catálogo. Depende da S1c1.

## O que esta ordem cria

`content.revision_current_status` (projeção de leitura, uma linha por revisão), a função `content.apply_revision_status_event()` e o trigger `revision_status_events_apply`. Nomes diferentes: a função projeta o evento e, quando o status vira `published`, atualiza `content.pages`.

## Como aplicar esta migração

A plataforma grava pela ferramenta própria, journal em `drizzle/migrations/` (`DEC-0013`). Não crie arquivo em `supabase/migrations/`.

1. **Aplicar é categoria `app-release`** (`DEC-0007`), exige aprovação do humano.
2. **Desfazer não é `git revert`.** Falha no meio desfaz tudo, transação única. Reaplicar só é seguro se a tentativa anterior falhou.
3. **`content.page_revisions`, `content.revision_statuses` e `content.revision_status_events` já existem, aplicadas na S1c1.** Este DDL não as recria.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "`content.revision_current_status` tem `workspace_id`, denormalizado" (entrada do ADR 003 no ledger, `DEC-0014`, aprovada em `DDP-118`, registro completado em `DDP-134`) | A tabela nasce com `workspace_id uuid not null references public.workspaces(id)`, fora da chave primária, que continua `revision_id`. A função copia o valor de `NEW.workspace_id` no `INSERT` do trigger. O DDL do ADR (linhas 265 a 269) não tem a coluna, porque é anterior à decisão |

## A projeção nasce vazia

`content.revision_status_events` tem zero linhas hoje, conferido por consulta em 2026-09-20. O trigger só projeta evento inserido depois de ele existir, então não há linha anterior para popular por backfill. Se algum evento já existir no momento de aplicar esta migração, a projeção nasce incompleta para ele, sem erro, porque o trigger passa a rodar só dali em diante. Conferir a contagem de `revision_status_events` antes de aplicar é responsabilidade de quem aplica.

## O evento e a projeção nascem juntos, ou nenhum dos dois

O trigger é `AFTER INSERT` em `revision_status_events`, executado dentro da mesma transação e da mesma instrução SQL que dispara o `INSERT`. `content.apply_revision_status_event()` não captura exceção nenhuma: se o `INSERT` em `revision_current_status` ou o `UPDATE` em `content.pages` falhar, a função propaga o erro, o Postgres aborta a transação corrente, e o `INSERT` em `revision_status_events` que disparou o trigger desfaz junto com ela. Não existe estado em que o evento fica gravado sem a projeção. É comportamento do banco, trigger na mesma transação da instrução que a dispara, não uma captura de erro desta ordem, e é o desenho pretendido: evento e leitura rápida nunca divergem por falha parcial.

## 1. Criar a migração

```sql
CREATE TABLE content.revision_current_status (
  revision_id  uuid PRIMARY KEY REFERENCES content.page_revisions(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  status_code  text NOT NULL REFERENCES content.revision_statuses(code),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION content.apply_revision_status_event()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO content.revision_current_status (revision_id, workspace_id, status_code, updated_at)
  VALUES (NEW.revision_id, NEW.workspace_id, NEW.to_status, NEW.created_at)
  ON CONFLICT (revision_id) DO UPDATE
    SET status_code = excluded.status_code, updated_at = excluded.updated_at;

  IF NEW.to_status = 'published' THEN
    UPDATE content.pages p
       SET published_revision_id = NEW.revision_id,
           title      = coalesce(r.frontmatter ->> 'title', p.title),
           updated_at = NEW.created_at
      FROM content.page_revisions r
     WHERE r.id = NEW.revision_id
       AND p.id = r.page_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER revision_status_events_apply
  AFTER INSERT ON content.revision_status_events
  FOR EACH ROW EXECUTE FUNCTION content.apply_revision_status_event();
```

Nenhum `GRANT` nesta migração, mesmo motivo das sub-fatias anteriores.

## Verificação

Duas metades. O catálogo prova que os objetos nasceram como a ordem escreveu. O teste de comportamento prova o que o catálogo não alcança: que o trigger projeta, que não duplica linha, e que publicar move o ponteiro de `content.pages`.

### 1. Catálogo

Antes de aplicar, confira que a projeção ainda não existe e que não há evento anterior:

```sql
SELECT to_regclass('content.revision_current_status') AS projecao,
       (SELECT count(*) FROM content.revision_status_events) AS eventos;
```

O esperado é `projecao` nula e `eventos` zero. Projeção existente significa migração repetida. Evento existente significa projeção incompleta. Nos dois casos, pare e avise a sessão A.

Depois de aplicar, rode a consulta que `guia-sessoes/bin/confere-execucao.sh --sql` gera a partir deste arquivo, salve a saída e compare:

```
confere-execucao.sh --compara ORDEM-S1c2-projecao-e-publicacao.md saida.txt
```

A comparação é de conjunto exato. Divergência em qualquer linha reprova.

### 2. Comportamento

O bloco abaixo monta os dados, afirma, e termina levantando exceção de propósito. A exceção carrega o veredito e desfaz tudo que o bloco escreveu. Nada fica no banco.

```sql
DO $$
DECLARE
  ws uuid; usr uuid; sp uuid; pg uuid; rev uuid;
  projetado text; conta int; ponteiro uuid; titulo text; veredito text := '';
BEGIN
  SELECT id INTO ws FROM public.workspaces LIMIT 1;
  SELECT id INTO usr FROM auth.users LIMIT 1;

  INSERT INTO content.spaces (workspace_id, name, slug, created_by)
       VALUES (ws, 'Espaco de teste', 'teste-s1c2', usr) RETURNING id INTO sp;
  INSERT INTO content.pages (workspace_id, space_id, slug, title, position, created_by)
       VALUES (ws, sp, 'pagina-teste', 'Titulo antigo', 1, usr) RETURNING id INTO pg;
  INSERT INTO content.page_revisions
         (workspace_id, page_id, dok_version, content_dokmd, content_hash, frontmatter, author_id)
       VALUES (ws, pg, 1, '# oi', 'hash-teste', '{"title":"Titulo novo"}'::jsonb, usr)
    RETURNING id INTO rev;

  -- a) evento projeta
  INSERT INTO content.revision_status_events (workspace_id, revision_id, to_status, actor_id)
       VALUES (ws, rev, 'in_review', usr);
  SELECT status_code INTO projetado FROM content.revision_current_status WHERE revision_id = rev;
  IF projetado IS DISTINCT FROM 'in_review' THEN
    veredito := veredito || 'FALHA a) projecao ausente ou errada: ' || coalesce(projetado,'nula') || '. ';
  END IF;

  -- b) segundo evento atualiza, nao duplica
  INSERT INTO content.revision_status_events (workspace_id, revision_id, from_status, to_status, actor_id)
       VALUES (ws, rev, 'in_review', 'published', usr);
  SELECT count(*) INTO conta FROM content.revision_current_status WHERE revision_id = rev;
  SELECT status_code INTO projetado FROM content.revision_current_status WHERE revision_id = rev;
  IF conta <> 1 OR projetado IS DISTINCT FROM 'published' THEN
    veredito := veredito || 'FALHA b) linhas=' || conta || ' status=' || coalesce(projetado,'nula') || '. ';
  END IF;

  -- c) publicar move o ponteiro e o titulo da pagina
  SELECT published_revision_id, title INTO ponteiro, titulo FROM content.pages WHERE id = pg;
  IF ponteiro IS DISTINCT FROM rev OR titulo IS DISTINCT FROM 'Titulo novo' THEN
    veredito := veredito || 'FALHA c) ponteiro=' || coalesce(ponteiro::text,'nulo')
                || ' titulo=' || coalesce(titulo,'nulo') || '. ';
  END IF;

  -- d) controle negativo: revisao sem evento nao pode ter projecao
  INSERT INTO content.page_revisions
         (workspace_id, page_id, dok_version, content_dokmd, content_hash, frontmatter, author_id)
       VALUES (ws, pg, 1, '# sem evento', 'hash-controle', '{}'::jsonb, usr)
    RETURNING id INTO rev;
  IF EXISTS (SELECT 1 FROM content.revision_current_status WHERE revision_id = rev) THEN
    veredito := veredito || 'FALHA d) projecao existe sem evento. ';
  END IF;

  IF veredito = '' THEN veredito := 'PASSOU a, b, c e d'; END IF;
  RAISE EXCEPTION 'VEREDITO: %', veredito;
END $$;
```

A saída esperada é o erro `VEREDITO: PASSOU a, b, c e d`. Outro texto depois de `VEREDITO:` reprova e diz qual afirmação caiu. Erro que não comece por `VEREDITO:` é falha de montagem, não resultado.

A afirmação `d` é o controle negativo: sem ela, `a` a `c` não provariam que foi o trigger que projetou.

### Lacuna declarada

Este roteiro não distingue "o trigger roda na mesma transação do `INSERT`" de "o tratador de exceção desfez o bloco". As duas explicações produzem a mesma saída em SQL. A garantia de que evento e projeção nascem juntos fica apoiada no comportamento documentado do Postgres para trigger `AFTER INSERT` sem `EXCEPTION`, como a seção acima descreve, e não em medição desta ordem.

## Restrições

- Só este SQL. Não crie nem altere `content.page_revisions`, `content.revision_statuses` nem `content.revision_status_events`: estão aplicadas.
- A única tabela existente tocada é `content.pages`, e só pela escrita que o trigger faz em tempo de execução. Nenhum `ALTER TABLE`.
- Não aplique sem aprovação humana explícita (`app-release`).
- Nenhum contrato do ledger muda.
- Não escreva RLS, nem policy, nem server function.
- Não toque `.env*`.
- Depois de aplicar com sucesso, commite o arquivo que a migração gerar, no mesmo commit ou logo em seguida.
