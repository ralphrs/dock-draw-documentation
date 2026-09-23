# Ordem: política de leitura da pasta `google-cloud-icons/` no bucket `diagram-images`

**Issue da ordem:** preencher ao criar no Jira.
**App:** `dok-draw-app`. Uma migração nova, não aplicada por esta ordem. Sem dependência nova, sem publicação.

Primeira de duas ordens da família Google Cloud, mesmo mecanismo já aprovado e aplicado para AWS (`DEC-0044`, `DDP-528`) e escrito para Azure (`DDP-556`). Categoria `app-release` (política RLS, `DEC-0007`): o Lovable escreve o arquivo da migração e não aplica. Os ícones oficiais do Google Cloud (`cloud.google.com/icons`, `DEC-0030`) vão para a pasta `google-cloud-icons/` do bucket privado `diagram-images`, subidos pelo dono do produto pelo painel Storage do Lovable Cloud, e o app os lê por URL assinada.

**Dependência de sequência, não de arquivo.** A segunda ordem desta família (moldura e contêineres) só entra depois que a sessão D terminar os contêineres Google Cloud (`DDP-457`, `DDP-458`, hoje devolvidos com correção). Esta primeira ordem não depende disso: a moldura de serviço já está aceita (`DDP-376` a `DDP-378`), e a política de leitura pode ir para o Lovable antes, na vez dela na fila de despacho.

## Por que

A política de leitura do bucket só libera `aws-icons/` (`DDP-528`) e o prefixo por uuid de projeto. O caminho `google-cloud-icons/compute/cloud-run.svg` não passa em nenhuma das duas, então `createSignedUrl` falha para qualquer pessoa logada. Basta mais uma política de leitura para o prefixo novo.

## O que fazer

**1. Migração nova, próximo número livre em `drizzle/migrations/`, nome `NNNN_diagram_images_google_cloud_icons_select.sql`, com exatamente este conteúdo e nada além:**

```sql
-- Leitura da pasta google-cloud-icons/ do bucket diagram-images para qualquer pessoa autenticada.
CREATE POLICY diagram_images_select_google_cloud_icons ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'diagram-images'
    AND (storage.foldername(name))[1] = 'google-cloud-icons'
  );
```

Entrada correspondente em `drizzle/migrations/meta/_journal.json`. Nenhuma outra política muda, e continua sem política de `INSERT`, `UPDATE` ou `DELETE` para `google-cloud-icons/`.

**2. Não aplicar.** Aplicação represada até aprovação humana explícita.

**3. Nenhum código de app nesta ordem.**

## O que não fazer aqui

- Não criar bucket, não escrever em `storage.buckets` (`DDP-419`).
- Não subir nem listar arquivos do bucket.
- Não mexer na moldura, nos contêineres nem na família `google-cloud`: isso é a segunda ordem, ainda não escrita.
- Não instalar nenhum pacote npm.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão (`DEC-0041`).

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| `DEC-0030`: ícone oficial sem alteração, com atribuição | Arquivos subidos direto do pacote oficial pelo dono do produto. Atribuição na segunda ordem |
| Migração e RLS exigem aprovação humana explícita (`DEC-0007`) | Categoria `app-release`, arquivo escrito sem aplicar |
| `DEC-0031`: lista de tipos do bucket não gravada, risco aceito | Sem política de escrita para `google-cloud-icons/` |

## Verificação

O arquivo da migração é idêntico ao SQL do item 1, linha a linha, e o journal tem a entrada. Depois de aplicar: `SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname = 'diagram_images_select_google_cloud_icons'` devolve uma linha. `SELECT count(*) FROM storage.objects WHERE bucket_id = 'diagram-images' AND name LIKE 'google-cloud-icons/%'` devolve a contagem do manifesto (`adrs/_work/google-cloud-icons/google-cloud-icons-manifest.json`).

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não toque em `content.*`, `content.pages` nem `content.spaces`.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
