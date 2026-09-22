# DEC-0031: risco aceito, o bucket de imagens fica sem lista de tipos

**Data:** 2026-09-22
**Quem decidiu:** humano, na `DDP-430`, seguindo a recomendação da sessão A depois da resposta do Lovable
**Alcance:** bucket `diagram-images` do Supabase do app, criado pela ordem `DDP-308` e travado pela ordem `DDP-308b` (`DDP-419`)

## A decisão

O bucket `diagram-images` fica com `allowed_mime_types` nulo. A trava de tipo de imagem vive em duas camadas que estão aplicadas e verificadas:

1. Política de envio `diagram_images_insert`, que só aceita objeto cujo nome termina em `png`, `jpg` ou `webp`.
2. Validação no app antes do envio (`checkImageFile`), e envio sem `upsert`, no `uploadDiagramImage`.

A terceira camada, a lista de tipos do próprio bucket, não entra por falta de caminho: a plataforma do Lovable recusa `UPDATE` em `storage.buckets` por SQL (`DDP-419`, erro literal registrado lá), a ferramenta de Storage do Lovable não tem o campo, o painel do Lovable Cloud não expõe a configuração e o projeto não tem acesso ao painel do Supabase. Apagar e recriar o bucket também não resolve, porque a ferramenta de criação não aceita o campo e a exclusão apaga os objetos em cascata. Resposta do Lovable às três perguntas em `DDP-430`, 2026-09-22.

## O risco que fica

Um membro do projeto, usando a API do Storage fora do app, consegue subir um arquivo com nome de imagem e conteúdo SVG, declarando o tipo que quiser no envio.

Por que o risco é baixo, e por que é aceito:

- Só membro do projeto sobe arquivo, pela política de acesso. Não há caminho anônimo.
- O app mostra a imagem por tag `img` e embute no arquivo exportado como imagem. Nesses dois caminhos script dentro de SVG não roda.
- O link assinado aberto direto no navegador roda no domínio do Supabase, não no domínio do app. Não alcança sessão nem dado do DokDraw.

Alternativa descartada: migrar o Storage para fora do Lovable Cloud só para ganhar esse campo. Custo alto para fechar uma lacuna de baixo impacto.

## Quando reabrir

Quando o Lovable expuser o campo `allowed_mime_types` na ferramenta ou na tela de Storage, a sessão A pede o preenchimento com `image/png`, `image/jpeg` e `image/webp`, roda `adrs/_work/ordens/ROTEIRO-DDP308-bucket-imagens.sql` e fecha esta decisão com o roteiro em VERDE.
