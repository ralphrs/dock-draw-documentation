# Ordem DDP-297: pastas de diagrama

Prioridade 1, item 8 de `adrs/_work/ANALISE-editor-o-basico.md`. Decisão já tomada em `decisoes/DEC-0022-pasta-de-diagrama-e-tabela-propria.md`: pasta do Diagram Studio é tabela própria, `public.views` ganha só o ponteiro. Categoria `app-release`. A aplicação de migração está parada no classificador (`DDP-140`); esta ordem entra na fila de aprovação mesmo assim.

## O que a `DEC-0022` deixa para esta ordem

Nome da tabela, colunas, e se ela vive em `public` ou em `content` (decidido abaixo: `public`, ao lado de `public.views` e `public.projects`, porque a hierarquia do Studio é separada da hierarquia da wiki, doutrina que a própria `DEC-0022` já registra). `ON DELETE` de pasta com conteúdo já está decidido pela `DDP-145` (`DD3`, apaga a pasta com o conteúdo), então o `ON DELETE CASCADE` abaixo não é pergunta nova, é a aplicação da decisão que já existe.

## O que fazer

**1. Tabela nova, `public.view_folders`.** Auto-referenciada para aninhamento (pasta dentro de pasta), com `project_id` para escopar a árvore ao projeto.

**2. `public.views` ganha `folder_id`.** Nulo por padrão: diagrama sem pasta fica na raiz da árvore, igual a hoje.

**3. Unicidade de nome, mesma doutrina da wiki (`DDP-110`).** Duas pastas irmãs, ou uma pasta e um diagrama irmãos, não repetem nome dentro do mesmo pai e do mesmo projeto.

**4. RLS, reaproveitando `private.can_access_project`.** `public.views` já usa essa função hoje; `view_folders` usa a mesma, sem função nova.

**5. Interface da árvore.** Criar pasta (na raiz ou dentro de outra pasta), renomear, mover (arrastar para dentro de outra pasta ou para a raiz, dentro do mesmo projeto) e excluir, no mesmo componente de árvore que a wiki já usa, parametrizado para aceitar os dois tipos de nó do Studio (pasta e diagrama) em vez dos da wiki. Excluir uma pasta pede confirmação, porque apaga o conteúdo junto (`DD3`).

## 1. Migração

```sql
CREATE TABLE public.view_folders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_folder_id  uuid REFERENCES public.view_folders(id) ON DELETE CASCADE,
  name              text NOT NULL,
  position          numeric NOT NULL DEFAULT 0,
  created_by        uuid NOT NULL REFERENCES auth.users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (project_id, parent_folder_id, name)
);

ALTER TABLE public.views
  ADD COLUMN folder_id uuid REFERENCES public.view_folders(id) ON DELETE CASCADE;

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
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova. `private.can_access_project` já existe |

## Verificação

A sessão C confere no preview: criar pasta na raiz e dentro de outra pasta, renomear, arrastar diagrama e pasta para dentro de outra pasta, excluir pasta com conteúdo pede confirmação e remove tudo dentro, e duas pastas irmãs com o mesmo nome são recusadas.

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não crie nem altere nada em `content.*`.
- Não toque `.env*`.
- Nenhum contrato do ledger muda além da entrada que registra esta interface nova.
