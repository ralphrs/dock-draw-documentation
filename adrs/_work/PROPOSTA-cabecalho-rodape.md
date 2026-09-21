# Proposta: cabeçalho e rodapé nos diagramas exportados

**Data:** 2026-09-21
**Pedido:** humano, com urgência. Configurar cabeçalho e rodapé para os diagramas do projeto, com textos livres e imagens formatáveis, e escolher na exportação se eles entram.
**Layout:** https://claude.ai/artifact/2K35f1bCzXYUumpNCr2yCD

## O que a pessoa faz

1. Em Projeto, Configurações, Cabeçalho e rodapé, monta as duas faixas. Cada faixa tem três zonas, esquerda, centro e direita, e cada zona recebe textos livres e imagens, em ordem.
2. Formata o item selecionado. Texto: fonte (Inter, JetBrains Mono ou uma serifada), tamanho (11, 12, 14, 16 e 20), negrito, itálico, sublinhado, cor e alinhamento na zona. Imagem: altura dentro da faixa e alinhamento. Faixa: altura (40, 56 ou 72 px), fundo e linha separando do diagrama.
3. Vê a prévia ao lado, com um diagrama do próprio projeto.
4. Ao exportar em PNG, SVG ou .drawio, marca ou desmarca "Incluir cabeçalho e rodapé do projeto". A opção vem marcada quando o projeto tem alguma faixa, e o app lembra a última escolha de cada pessoa.

As faixas só existem no arquivo exportado e na prévia. O quadro de edição continua igual.

## Como o produto guarda

Uma tabela nova, `public.project_export_frames`, uma linha por projeto:

| Coluna | Tipo | O que guarda |
| --- | --- | --- |
| `project_id` | `uuid`, chave primária, referência a `public.projects` com `ON DELETE CASCADE` | O projeto dono |
| `header` | `jsonb` | Faixa do cabeçalho: altura, fundo, linha, e as três zonas com a lista de itens |
| `footer` | `jsonb` | Faixa do rodapé, no mesmo formato |
| `updated_by` | `uuid`, padrão `auth.uid()` | Quem salvou por último |
| `updated_at` | `timestamptz`, padrão `now()` | Quando |

Item de texto guarda o texto e a formatação. Item de imagem guarda o caminho do arquivo no bucket `diagram-images` (`DDP-308`), no prefixo `{projectId}/frames/`, e a altura. O formato do JSON é validado por esquema Zod na server function que salva, e nunca é interpretado como código.

RLS com `private.can_access_project(project_id)` para ler e gravar, a mesma regra de `public.views`. Qualquer membro do projeto edita, como acontece hoje com os diagramas.

## Como a exportação monta o arquivo

O arquivo exportado cresce para cima e para baixo: a faixa do cabeçalho entra acima do diagrama, a do rodapé abaixo, e nada cobre o diagrama. No SVG e no PNG as faixas são desenhadas pelo mesmo `buildSvg` de hoje, com as imagens embutidas no arquivo como na `DDP-308`. No .drawio elas entram como dois grupos travados, acima e abaixo.

Diagrama com ícone da AWS ganha a linha de atribuição (`DDP-236`) embaixo do rodapé, sempre, mesmo com as faixas desligadas. Essa linha não é editável.

## Dependências e categoria

- Tabela nova com RLS é migração, categoria `app-release`, e pede o sim do humano. A aplicação de migração ainda está represada no classificador (`DDP-140`).
- As imagens dependem do bucket da `DDP-308`, também `app-release`.
- A parte de texto funciona sem o bucket. Se o bucket atrasar, a primeira entrega sai só com texto, e as imagens entram quando ele existir.

## Fora desta primeira versão

- Campos automáticos no texto, como nome do diagrama, data e versão. O pedido é texto livre por enquanto.
- Cabeçalho próprio de um diagrama, diferente do projeto.
- Mostrar as faixas no quadro de edição.

## Lacuna declarada

A fonte serifada ainda não foi escolhida. Ela sai da mesma lista do Google Fonts que o app já carrega, com licença OFL, e a sessão D propõe junto com o layout em Figma, depois da aprovação.
