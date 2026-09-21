# Ordem DDP-297: pastas de diagrama

Issue da ordem: `DDP-311`, rótulo `lovable`.

Prioridade 1, item 8 de `adrs/_work/ANALISE-editor-o-basico.md`. Decisão já tomada em `decisoes/DEC-0022-pasta-de-diagrama-e-tabela-propria.md`: pasta do Diagram Studio é tabela própria, `public.views` ganha só o ponteiro. Categoria `app-release`. A aplicação de migração está parada no classificador (`DDP-140`); esta ordem entra na fila de aprovação mesmo assim.

## O que a `DEC-0022` deixa para esta ordem

Nome da tabela, colunas, e se ela vive em `public` ou em `content` (decidido abaixo: `public`, ao lado de `public.views` e `public.projects`, porque a hierarquia do Studio é separada da hierarquia da wiki, doutrina que a própria `DEC-0022` já registra). `ON DELETE` de pasta com conteúdo já está decidido pela `DDP-145` (`DD3`, apaga a pasta com o conteúdo), então o `ON DELETE CASCADE` abaixo não é pergunta nova, é a aplicação da decisão que já existe.

## O que fazer

**1. Tabela nova, `public.view_folders`.** Auto-referenciada para aninhamento (pasta dentro de pasta), com `project_id` para escopar a árvore ao projeto.

**2. `public.views` ganha `folder_id`.** Nulo por padrão: diagrama sem pasta fica na raiz da árvore, igual a hoje.

**3. Unicidade de nome entre pastas irmãs (`DDP-110`).** Duas pastas irmãs não repetem nome dentro do mesmo pai e do mesmo projeto. Pasta e diagrama com o mesmo nome no mesmo pai são permitidos: ficam em tabelas diferentes e têm ícones diferentes na árvore, e garantir unicidade entre as duas tabelas pediria gatilho sem ganho para o usuário.

**4. Pasta, subpasta e diagrama no mesmo projeto.** Chave estrangeira composta com `project_id`: a subpasta só aponta para pasta do mesmo projeto, e o diagrama só entra em pasta do seu projeto. Mover pasta para dentro dela mesma ou de uma descendente é recusado pelo banco, pelo gatilho da migração, e a árvore nem oferece esse destino.

**5. RLS, reaproveitando `private.can_access_project`.** `public.views` já usa essa função hoje; `view_folders` usa a mesma, sem função nova.

**6. Interface da árvore.** Criar pasta (na raiz ou dentro de outra pasta), renomear, mover (arrastar para dentro de outra pasta ou para a raiz, dentro do mesmo projeto) e excluir, no mesmo componente de árvore que a wiki já usa, parametrizado para aceitar os dois tipos de nó do Studio (pasta e diagrama) em vez dos da wiki. Excluir uma pasta pede confirmação, porque apaga o conteúdo junto (`DD3`).

## 1. Migração

```sql
CREATE TABLE public.view_folders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_folder_id  uuid REFERENCES public.view_folders(id) ON DELETE CASCADE,
  name              text NOT NULL,
  position          numeric NOT NULL DEFAULT 0,
  created_by        uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (project_id, parent_folder_id, name),
  UNIQUE (id, project_id),
  FOREIGN KEY (parent_folder_id, project_id)
    REFERENCES public.view_folders(id, project_id) ON DELETE CASCADE
);

ALTER TABLE public.views
  ADD COLUMN folder_id uuid,
  ADD FOREIGN KEY (folder_id, project_id)
    REFERENCES public.view_folders(id, project_id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.view_folders_no_cycle()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.parent_folder_id IS NOT NULL AND EXISTS (
    WITH RECURSIVE up(id, parent_folder_id) AS (
      SELECT id, parent_folder_id FROM public.view_folders WHERE id = NEW.parent_folder_id
      UNION ALL
      SELECT f.id, f.parent_folder_id FROM public.view_folders f JOIN up ON f.id = up.parent_folder_id
    )
    SELECT 1 FROM up WHERE id = NEW.id
  ) THEN
    RAISE EXCEPTION 'pasta não pode ficar dentro dela mesma';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER view_folders_no_cycle
  BEFORE INSERT OR UPDATE OF parent_folder_id ON public.view_folders
  FOR EACH ROW EXECUTE FUNCTION public.view_folders_no_cycle();

ALTER TABLE public.view_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_folders_select ON public.view_folders FOR SELECT USING (
  private.can_access_project(project_id)
);

CREATE POLICY view_folders_insert ON public.view_folders FOR INSERT WITH CHECK (
  private.can_access_project(project_id)
);

CREATE POLICY view_folders_update ON public.view_folders FOR UPDATE USING (
  private.can_access_project(project_id)
) WITH CHECK (
  private.can_access_project(project_id)
);

CREATE POLICY view_folders_delete ON public.view_folders FOR DELETE USING (
  private.can_access_project(project_id)
);
```

## O que não fazer aqui

- Pasta com escopo entre projetos: `project_id` não muda ao mover, só `parent_folder_id`.
- Ligação entre a pasta da wiki (`content.pages`, `node_kind`) e a pasta do Studio: são tabelas e doutrinas diferentes, `DEC-0022` já registra o motivo.
- Qualquer trabalho da prioridade 1 além deste item (seleção múltipla, desfazer, setas de conexão, colar imagem, atribuição): ordens separadas.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 003, seção 6.6: FK direta entre schemas de ADRs diferentes acopla um ao outro | `view_folders` fica inteira em `public`, ao lado de `views` e `projects`, sem referência a `content`. Doutrina seguida, não violada |
| ADR 001: o modelo do diagrama vive no Supabase | Pasta e ponteiro ficam em `public`, junto de `views`. Excluir pasta apaga os diagramas dentro pelo mesmo `ON DELETE CASCADE` que já leva `view_nodes` junto com a vista |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova. `private.can_access_project` já existe |

## Verificação

Roteiro da sessão A, só leitura de catálogo, para rodar depois da migração. Termina sempre em exceção com o veredito, e não grava nada.

```sql
DO $$
DECLARE
  falhas text := '';
  vf oid := to_regclass('public.view_folders');
BEGIN
  IF vf IS NULL THEN falhas := falhas || ' tabela;'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='views' AND column_name='folder_id')
    THEN falhas := falhas || ' views.folder_id;'; END IF;
  IF (SELECT count(*) FROM pg_constraint WHERE contype='f' AND confrelid = vf
        AND conrelid IN (vf, to_regclass('public.views'))
        AND array_length(conkey,1) = 2 AND confdeltype = 'c') <> 2
    THEN falhas := falhas || ' fk compostas;'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='view_folders_no_cycle' AND tgrelid = vf)
    THEN falhas := falhas || ' gatilho;'; END IF;
  IF NOT coalesce((SELECT relrowsecurity FROM pg_class WHERE oid = vf), false)
    THEN falhas := falhas || ' rls;'; END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='view_folders') <> 4
    THEN falhas := falhas || ' políticas;'; END IF;
  RAISE EXCEPTION 'VEREDITO: %', CASE WHEN falhas = '' THEN 'VERDE' ELSE 'VERMELHO' || falhas END;
END $$;
```

Antes da migração, o bloco sai `VERMELHO tabela; views.folder_id; fk compostas; gatilho; rls; políticas;`, medido pela sessão A contra produção em 2026-09-21. Depois, `VERDE`. A direção verde só se exerce com a migração aplicada, e fica para a revisão de resultado.

No preview, a sessão C confere: criar pasta na raiz e dentro de outra pasta, renomear, arrastar diagrama e pasta para dentro de outra pasta, excluir pasta com conteúdo pede confirmação e remove tudo dentro, duas pastas irmãs com o mesmo nome são recusadas, e arrastar uma pasta para dentro de uma subpasta dela é recusado.

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não crie nem altere nada em `content.*`.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
