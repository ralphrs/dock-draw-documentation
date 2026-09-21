# Ordem DDP-395a: tabela de cabeçalho e rodapé, migração

Categoria `app-release`. Solução aprovada em `DDP-392`, texto completo em `adrs/_work/PROPOSTA-cabecalho-rodape.md`. Primeira de duas ordens da mesma proposta: esta cobre só a tabela, a RLS e a função de leitura e gravação validada. A tela de configuração e exportação é a `ORDEM-DDP395-tela-cabecalho-rodape.md`, e depende desta.

## O que fazer

**1. Tabela `public.project_export_frames`, uma linha por projeto.** `header` e `footer` guardam a faixa inteira em JSONB, no formato do schema Zod abaixo. RLS por `private.can_access_project(project_id)`, já usada em `public.views`: qualquer pessoa com acesso ao projeto lê e grava, mesma regra de hoje para os diagramas.

**2. Função de leitura e gravação, com validação Zod.** O JSON de `header`/`footer` nunca é interpretado como código nem gravado sem validar contra o schema abaixo. Falha de validação recusa a gravação com erro, sem tocar a linha existente.

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
  imagePath: z.string().min(1),
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

`imagePath` de `ImageItem` segue o prefixo `{projectId}/frames/{elementId}.{extensão}` no bucket `diagram-images` (`DDP-308`). Tipos aceitos e teto de tamanho são os mesmos da `DDP-296`: PNG, JPEG, WebP, até 5 MB, sem SVG.

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

A seção de verificação é escrita pela sessão A.

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não crie nem altere nada em `content.*`.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
