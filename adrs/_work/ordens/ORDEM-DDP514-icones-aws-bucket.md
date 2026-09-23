# Ordem DDP-514a: política de leitura da pasta `aws-icons/` no bucket `diagram-images`

**Issue da ordem:** `DDP-528`.
**App:** `dok-draw-app`. Uma migração nova, não aplicada por esta ordem. Sem dependência nova, sem publicação.

Primeira de duas ordens da `DDP-514`. Categoria `app-release` (política RLS, `DEC-0007`): o Lovable escreve o arquivo da migração e não aplica. A aplicação vem depois, com o sim do dono do produto, em card próprio. Decisão de mecanismo em `DEC-0044`, que substitui a `DEC-0043`: os ícones oficiais da AWS já estão na pasta `aws-icons/` do bucket privado `diagram-images`, subidos pelo dono do produto pelo painel Storage do Lovable Cloud (`DDP-549`), e o app os lê por URL assinada.

## Por que

A política de leitura atual do bucket, `diagram_images_select` (`drizzle/migrations/0004_diagram_images_bucket_policies.sql`), só libera objeto cujo primeiro nível de pasta é o uuid de um projeto que a pessoa acessa (`private.can_access_project`). O caminho `aws-icons/compute/lambda.svg` não passa nessa regra, então `createSignedUrl` falha para qualquer pessoa logada. O ícone é o mesmo arquivo para todo mundo, sem dado de usuário e sem regra por projeto: basta uma política de leitura para o prefixo.

## O que fazer

**1. Migração nova, próximo número livre em `drizzle/migrations/`, nome `NNNN_diagram_images_aws_icons_select.sql`, com exatamente este conteúdo e nada além:**

```sql
-- Ordem DDP-528 (DEC-0044): leitura da pasta aws-icons/ do bucket diagram-images para qualquer pessoa autenticada.
CREATE POLICY diagram_images_select_aws_icons ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'diagram-images'
    AND (storage.foldername(name))[1] = 'aws-icons'
  );
```

Entrada correspondente em `drizzle/migrations/meta/_journal.json`, no mesmo padrão das anteriores (`0006_diagram_images_mime_lock`). Nenhuma outra política muda: `diagram_images_select` e `diagram_images_insert` ficam como estão, e continua sem política de `INSERT`, `UPDATE` ou `DELETE` para `aws-icons/`. Quem sobe o arquivo é quem administra, pelo painel.

**2. Não aplicar.** A migração fica no repositório sem rodar no banco. Se a ferramenta perguntar se aplica, a resposta é não. A aplicação é o passo seguinte, com aprovação humana explícita.

**3. Nenhum código de app nesta ordem.** A leitura por URL assinada já existe (`signDiagramImage` em `src/infrastructure/supabase/image-storage.ts`) e é a segunda ordem (`DDP-529`) que a usa para o tipo `aws_icon`.

## O que não fazer aqui

- Não criar bucket, não escrever em `storage.buckets` (a plataforma recusa, `DDP-419`).
- Não subir nem listar arquivos do bucket.
- Não mexer na moldura, nos contêineres nem na família `aws`: isso é a `ORDEM-DDP514-frame-e-conteineres-aws.md`.
- Não instalar nenhum pacote npm.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão (`DEC-0041`).

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| `DEC-0030`: ícone oficial sem alteração, com atribuição | Arquivos subidos direto do pacote oficial pelo dono do produto (`DDP-549`). Atribuição na segunda ordem, item 10 |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |
| Migração e RLS exigem aprovação humana explícita (`DEC-0007`) | Categoria `app-release`, arquivo escrito sem aplicar, aplicação represada até o sim do humano |
| `DEC-0031`: lista de tipos do bucket não gravada, risco aceito | Sem política de escrita para `aws-icons/`, o risco não alcança a pasta |

## Verificação

Roteiro da sessão A, antes de aplicar: o arquivo da migração é idêntico ao SQL do item 1, linha a linha, e o journal tem a entrada. Depois de aplicar: `SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname = 'diagram_images_select_aws_icons'` devolve uma linha. `SELECT count(*) FROM storage.objects WHERE bucket_id = 'diagram-images' AND name LIKE 'aws-icons/%'` devolve 122 (mais o manifesto, se subido). Uma pessoa logada sem acesso a nenhum projeto consegue `createSignedUrl` de `aws-icons/compute/lambda.svg`, e um `curl` sem sessão na URL do objeto (não assinada) devolve 400 ou 403.

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não toque em `content.*`, `content.pages` nem `content.spaces`.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
