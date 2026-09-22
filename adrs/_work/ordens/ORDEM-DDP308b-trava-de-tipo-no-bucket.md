# Ordem DDP-308b: trava de tipo de arquivo no bucket de imagens

Issue da ordem: `DDP-419`, rótulo `lovable`. Categoria `app-release` (`DEC-0007`): altera bucket e política do Supabase Storage.

Complemento da `ORDEM-DDP296-colar-imagem.md`. O item 3 daquela ordem pede que PNG, JPEG e WebP sejam recusados também pelo bucket, e não só pelo cliente. Na aplicação (`DDP-308`, resultado de 2026-09-21 21:49), o bucket `diagram-images` foi criado pela ferramenta de storage do Lovable, que não aceita `allowed_mime_types`. Consulta ao banco depois da aplicação: `public = false`, `file_size_limit = 5242880`, `allowed_mime_types = null`. Hoje só `checkImageFile` (`src/domain/c4/image.ts`) barra SVG, e um envio direto pela API do Storage, fora do app, passa.

## O que fazer

**1. Migração nova, `drizzle/migrations/` com o próximo número livre.** Conteúdo exato:

```sql
UPDATE storage.buckets
   SET allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
 WHERE id = 'diagram-images';

DROP POLICY diagram_images_insert ON storage.objects;

CREATE POLICY diagram_images_insert ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'diagram-images'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND private.can_access_project((storage.foldername(name))[1]::uuid)
  AND lower(storage.extension(name)) IN ('png', 'jpg', 'webp')
);
```

O `UPDATE` põe a lista no bucket, que o Storage confere pelo tipo declarado no envio. A política confere a extensão do nome, a mesma que `imageExtension` gera (`png`, `jpg`, `webp`). Uma não substitui a outra: o bucket barra o tipo, a política barra o nome.

**2. Upload sem `upsert`.** Em `src/infrastructure/supabase/image-storage.ts`, `uploadDiagramImage` chama `.upload(path, file, { contentType: mime, upsert: true })`. Troque por `upsert: false`. O caminho usa o id do elemento, novo a cada colagem, então nunca há arquivo para sobrescrever. A documentação do Supabase ([Storage access control](https://supabase.com/docs/guides/storage/security/access-control)) diz que sobrescrever por `upsert` exige também `SELECT` e `UPDATE`, e o bucket não tem política de `UPDATE` por decisão da ordem DDP-296.

**3. Escreva o arquivo e não aplique.** A aplicação espera o sim do humano, por mensagem colada no chat.

**4. Se o `UPDATE` em `storage.buckets` for bloqueado na aplicação**, como aconteceu com o `INSERT`, aplique só a política e informe no resultado, com a mensagem de erro literal. A lista de tipos então vira ajuste manual no Storage, pedido ao humano em card próprio.

## O que não fazer aqui

- Nenhuma política de `UPDATE` nem de `DELETE`.
- Não mexa em `diagram_images_select`.
- Não mude o caminho do objeto nem `imageExtension`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| "Segurança: conteúdo de usuário nunca é compilado nem avaliado como código" (arquitetura base) | SVG passa a ser recusado pelo servidor, não só pelo cliente |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

Roteiro da sessão A em `adrs/_work/ordens/ROTEIRO-DDP308-bucket-imagens.sql`, que já cobra a lista de tipos do bucket e passa a cobrar a extensão na política de envio. A sessão C confere no preview: colar PNG, JPEG e WebP sobe e mostra a imagem, e SVG continua recusado com aviso.

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
