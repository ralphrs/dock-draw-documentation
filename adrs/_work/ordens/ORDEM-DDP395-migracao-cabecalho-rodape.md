# Ordem DDP-395a: tabela de cabeçalho e rodapé, migração

Issue da ordem: `DDP-397`, rótulo `lovable`.

Categoria `app-release`. Solução aprovada em `DDP-392`, texto completo em `adrs/_work/PROPOSTA-cabecalho-rodape.md`. Primeira de duas ordens da mesma proposta: esta cobre só a tabela, a RLS e a função de leitura e gravação validada. A tela de configuração e exportação é a `ORDEM-DDP395-tela-cabecalho-rodape.md`, e depende desta.

## O que fazer

**1. Tabela `public.project_export_frames`, uma linha por projeto.** `header` e `footer` guardam a faixa inteira em JSONB, no formato do schema Zod abaixo. RLS por `private.can_access_project(project_id)`, já usada em `public.views`: qualquer pessoa com acesso ao projeto lê e grava, mesma regra de hoje para os diagramas.

**2. Permissão e carimbo.** Tabela nova em `public` precisa de `GRANT` para `authenticated`, como a migração das pastas (`DDP-311`) precisou: o arquivo `drizzle/migrations/0003_create_public_view_folders.sql` que o Lovable gerou tem o `GRANT` nas linhas 19 e 20. Um gatilho atualiza `updated_at` e `updated_by` em toda alteração, para o carimbo não depender de quem grava lembrar.

**3. Função de leitura e gravação, com validação Zod.** Arquivo novo, `src/application/export-frames.functions.ts`, no padrão das server functions de `src/application/diagram.functions.ts` (`createServerFn`, `requireSupabaseAuth`, validação no `inputValidator`):

* `fetchExportFrames({ projectId })` devolve `{ header, footer }` do projeto, ou os dois nulos quando não há linha.
* `saveExportFrames({ projectId, header, footer })` valida a entrada com `ProjectExportFrames`, confere que todo `imagePath` de todo item de imagem, nas duas faixas, começa com o `projectId` da chamada seguido de `/frames/`, e só então grava com `upsert` por `project_id`. Caminho de outro projeto recusa a gravação inteira com erro, sem tocar a linha existente.

O JSON nunca é interpretado como código nem gravado sem passar pelo esquema.

## Migração

```sql
CREATE TABLE public.project_export_frames (
  project_id  uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  header      jsonb,
  footer      jsonb,
  updated_by  uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_export_frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_export_frames_select ON public.project_export_frames FOR SELECT USING (
  private.can_access_project(project_id)
);

CREATE POLICY project_export_frames_insert ON public.project_export_frames FOR INSERT WITH CHECK (
  private.can_access_project(project_id)
);

CREATE POLICY project_export_frames_update ON public.project_export_frames FOR UPDATE USING (
  private.can_access_project(project_id)
) WITH CHECK (
  private.can_access_project(project_id)
);

CREATE POLICY project_export_frames_delete ON public.project_export_frames FOR DELETE USING (
  private.can_access_project(project_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_export_frames TO authenticated;

CREATE OR REPLACE FUNCTION public.project_export_frames_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := coalesce(auth.uid(), NEW.updated_by);
  RETURN NEW;
END;
$$;

CREATE TRIGGER project_export_frames_touch
  BEFORE UPDATE ON public.project_export_frames
  FOR EACH ROW EXECUTE FUNCTION public.project_export_frames_touch();
```

## Schema Zod da faixa

Um item de texto e um item de imagem, na ordem em que aparecem dentro da zona. `align` é o alinhamento do item dentro da zona (esquerda, centro, direita da zona em si), separado de qual zona (esquerda, centro, direita da faixa) o item ocupa.

```ts
const TextItem = z.object({
  kind: z.literal("text"),
  text: z.string().min(1).max(200),
  font: z.enum(["inter", "jetbrains-mono", "serif"]),
  size: z.union([z.literal(11), z.literal(12), z.literal(14), z.literal(16), z.literal(20)]),
  bold: z.boolean(),
  italic: z.boolean(),
  underline: z.boolean(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  align: z.enum(["left", "center", "right"]),
});

const ImageItem = z.object({
  kind: z.literal("image"),
  imagePath: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/frames\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpe?g|webp)$/),
  height: z.number().int().min(8).max(200),
  align: z.enum(["left", "center", "right"]),
});

const FrameItem = z.discriminatedUnion("kind", [TextItem, ImageItem]);

const Band = z.object({
  height: z.union([z.literal(40), z.literal(56), z.literal(72)]),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  lineSeparator: z.boolean(),
  zones: z.object({
    left: z.array(FrameItem).max(20),
    center: z.array(FrameItem).max(20),
    right: z.array(FrameItem).max(20),
  }),
});

const ProjectExportFrames = z.object({
  header: Band.nullable(),
  footer: Band.nullable(),
});
```

`imagePath` de `ImageItem` segue o prefixo `{projectId}/frames/{id}.{extensão}` no bucket `diagram-images` (`DDP-308`). A função de gravação confere, além do formato, que o `{projectId}` do caminho é o mesmo projeto da linha, e recusa imagem de outro projeto. Tipos aceitos e teto de tamanho são os mesmos da `DDP-296`: PNG, JPEG, WebP, até 5 MB, sem SVG.

## O que não fazer aqui

- Nenhuma tela, nenhum componente de interface: fica para `ORDEM-DDP395-tela-cabecalho-rodape.md`.
- Nenhuma mudança em `public.views`, `public.view_folders` nem em qualquer tabela do ADR 003.
- Nenhum campo automático (nome do diagrama, data, versão) no schema: a proposta pede texto livre só, campo automático fica fora desta versão.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 003, seção 6.6: FK direta entre schemas de ADRs diferentes acopla um ao outro | `project_export_frames` fica inteira em `public`, ao lado de `projects` e `views`, sem referência a `content` |
| ADR 001: o modelo do diagrama vive no Supabase | Faixa de cabeçalho/rodapé é dado de projeto, não de diagrama, mesma regra de acesso de `views` |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova. `private.can_access_project` já existe |

## Verificação

Roteiro da sessão A. Testa o gatilho de verdade: grava uma linha com data antiga, altera e confere que a data avançou. Testa também `updated_by`: com a sessão apontando para um usuário inexistente, o gatilho grava esse id e a chave estrangeira recusa. A exceção final desfaz tudo o que ele gravou. As políticas contam só se o texto usar `can_access_project(project_id)`.

```sql
DO $$
DECLARE
  falhas text := '';
  t oid := to_regclass('public.project_export_frames');
  proj uuid;
  usr uuid;
  antes timestamptz;
  depois timestamptz;
BEGIN
  IF t IS NULL THEN falhas := falhas || ' tabela;'; END IF;
  IF NOT coalesce((SELECT relrowsecurity FROM pg_class WHERE oid = t), false)
    THEN falhas := falhas || ' rls;'; END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='project_export_frames'
        AND coalesce(qual, with_check) LIKE '%can_access_project(project_id)%'
        AND (with_check IS NULL OR with_check LIKE '%can_access_project(project_id)%')) <> 4
    THEN falhas := falhas || ' políticas;'; END IF;
  IF t IS NULL OR NOT (has_table_privilege('authenticated', t, 'SELECT')
                       AND has_table_privilege('authenticated', t, 'INSERT')
                       AND has_table_privilege('authenticated', t, 'UPDATE')
                       AND has_table_privilege('authenticated', t, 'DELETE'))
    THEN falhas := falhas || ' grant;'; END IF;

  -- Comportamento do gatilho: uma alteração tem de avançar updated_at.
  IF t IS NOT NULL THEN
    SELECT p.id INTO proj FROM public.projects p
      WHERE NOT EXISTS (SELECT 1 FROM public.project_export_frames f WHERE f.project_id = p.id) LIMIT 1;
    SELECT id INTO usr FROM auth.users LIMIT 1;
    EXECUTE 'INSERT INTO public.project_export_frames (project_id, header, updated_by, updated_at) VALUES ($1, NULL, $2, now() - interval ''1 day'')'
      USING proj, usr;
    EXECUTE 'SELECT updated_at FROM public.project_export_frames WHERE project_id = $1' INTO antes USING proj;
    EXECUTE 'UPDATE public.project_export_frames SET footer = ''null''::jsonb WHERE project_id = $1' USING proj;
    EXECUTE 'SELECT updated_at FROM public.project_export_frames WHERE project_id = $1' INTO depois USING proj;
    IF NOT (depois > antes) THEN falhas := falhas || ' gatilho não carimba;'; END IF;
    -- updated_by: com a sessão apontando para um usuário que não existe, o gatilho
    -- precisa gravar esse id, e a chave estrangeira recusa. Se o UPDATE passar,
    -- o gatilho ignorou updated_by.
    BEGIN
      PERFORM set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
      EXECUTE 'UPDATE public.project_export_frames SET footer = NULL WHERE project_id = $1' USING proj;
      falhas := falhas || ' updated_by não carimba;';
    EXCEPTION WHEN foreign_key_violation THEN NULL;
    END;
  ELSE
    falhas := falhas || ' gatilho;';
  END IF;

  RAISE EXCEPTION 'VEREDITO: %', CASE WHEN falhas = '' THEN 'VERDE' ELSE 'VERMELHO' || falhas END;
END $$;
```

Antes da migração, o bloco sai `VERMELHO tabela; rls; políticas; grant; gatilho;`, medido pela sessão A contra produção em 2026-09-21. Depois, `VERDE`.

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não crie nem altere nada em `content.*`.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
