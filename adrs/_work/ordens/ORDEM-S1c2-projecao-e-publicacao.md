# Ordem S1c2: projeção de status e publicação da página

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

A seção de verificação é escrita pela sessão A (`DDP-123`).

## Restrições

- Só este SQL. Não crie nem altere `content.page_revisions`, `content.revision_statuses` nem `content.revision_status_events`: estão aplicadas.
- A única tabela existente tocada é `content.pages`, e só pela escrita que o trigger faz em tempo de execução. Nenhum `ALTER TABLE`.
- Não aplique sem aprovação humana explícita (`app-release`).
- Nenhum contrato do ledger muda.
- Não escreva RLS, nem policy, nem server function.
- Não toque `.env*`.
- Depois de aplicar com sucesso, commite o arquivo que a migração gerar, no mesmo commit ou logo em seguida.
