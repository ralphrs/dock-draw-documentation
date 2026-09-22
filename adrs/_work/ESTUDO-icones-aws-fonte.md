# Estudo: de onde vêm os arquivos dos ícones oficiais da AWS no app

**Data:** 2026-09-22
**Pedido:** `DDP-514`, decidir entre pacote npm, cópia em `public/` ou carga sob demanda para os ícones oficiais da AWS Architecture Icons, antes de escrever a ordem que liga a família `aws` no app.
**Referência de licença já fechada:** `adrs/_work/FICHA-ADR015-icones-aws.md` (pergunta 8 do ADR 015) e `DEC-0030`. O ícone entra sem alteração, com atribuição, conforme a permissão publicada em `aws.amazon.com/architecture/icons/` e os termos CC-BY-ND 2.0 que a própria AWS (`awslabs`) publica para o mesmo conjunto. Este estudo não reabre a licença, só decide o mecanismo de entrega.

## As três opções

### Pacote npm

Pesquisa na web em 2026-09-22 achou dois candidatos plausíveis:

- [`aws-svg-icons`](https://www.npmjs.com/package/aws-svg-icons), de Tamas Sallai (`sashee`). Versão publicada `3.0.0-2021-07-30` (`registry.npmjs.org/aws-svg-icons/latest`, consultado em 2026-09-22), sem release desde 2021. O pacote de release da AWS hoje é trimestral e está na release 24 (`07312026`), então este pacote está três anos e várias releases atrasado.
- [`@aws-icons/svg`](https://www.npmjs.com/package/@aws-icons/svg), de Mohammad Abu Mattar (`MKAbuMattar`). Versão `4.1.1` (consultado em 2026-09-22), publicado há pouco. A própria descrição do pacote no registro diz "AWS Architecture Icons as **optimized** SVGs (**flat, high-contrast, modern**)". Isso é alteração declarada de estilo, o oposto do que a `DEC-0030` e a licença CC-BY-ND (sem obra derivada) permitem.

Nenhum dos dois serve: um está desatualizado havia anos, o outro declara modificar o desenho. O campo `license` que os dois publicam no `package.json` (`ISC` e `MIT`) é a licença do código do pacote, não do conteúdo dos ícones, e nenhum dos dois resolve a questão de redistribuição do ícone em si.

**Custo, se um pacote confiável existisse:** dependência nova, versionada pelo npm, mas amarrada ao ritmo de publicação de um mantenedor terceiro, não ao calendário trimestral da AWS. Ainda assim entraria como `app-release` (dependência nova, `DEC-0007`).

### Cópia dos SVGs em `public/`

Baixar o pacote oficial (`Icon-package_07312026...zip`, já confirmado acessível sem aceite de termos, ficha `FICHA-ADR015-icones-aws.md`) e commitar os arquivos usados dentro de `public/` no repositório do app.

**Custo.** O pacote completo tem 13.988.918 bytes, com PNG e SVG de centenas de serviços em várias categorias. Mesmo usando só os SVGs, um diagrama típico usa uma dezena de serviços, não o catálogo inteiro. Colocar tudo em `public/` bundla no build e no repositório ícones que a maioria dos projetos nunca usa, e qualquer atualização trimestral vira commit grande revisado por humano.

### Carga sob demanda, de um bucket próprio

Um bucket novo no Supabase Storage, só leitura pública (sem RLS por projeto, porque o ícone é o mesmo arquivo para qualquer pessoa, não dado de usuário), com os SVGs oficiais no formato `{categoria}/{slug-do-serviço}.svg`, subidos por quem administra o DokDraw a cada release trimestral da AWS. O app busca só o ícone do serviço que a pessoa arrasta para o quadro, com o mesmo mecanismo de embutir imagem por URL que `diagram-images` já usa (`src/infrastructure/supabase/image-storage.ts`), adaptado para leitura pública em vez de assinada.

**Custo.** Bucket novo é mudança de infraestrutura, categoria `app-release`, exige aprovação do humano antes de aplicar (`DEC-0007`). Sem versionamento automático: quem administra precisa subir o pacote novo a cada release trimestral da AWS (Q1, Q2, Q3) à mão, e nada avisa quando um ícone muda de nome ou categoria. Falha de rede ao carregar um ícone precisa de um estado de erro visível na paleta, que a ordem tem que prever.

## Comparação

| Critério | npm | `public/` | Sob demanda |
| --- | --- | --- | --- |
| Bundle/build | Sem custo de storage, mas nenhum candidato é confiável | Cresce com o catálogo inteiro, usado ou não | Só o que cada diagrama usa |
| Licença/alteração | Nenhum candidato garante arquivo intacto | Garantida, se a cópia vier do zip oficial | Garantida, se o upload vier do zip oficial |
| Atualização trimestral | Depende de um mantenedor terceiro publicar | Commit revisado no repositório do app | Reupload no bucket, sem deploy do app |
| Exportação SVG/PNG | Embute por import estático | Embute por import estático | Busca a URL e embute, igual à `DDP-308` |
| Categoria da mudança | `app-release` (dependência nova) | Normal (só arquivo) | `app-release` (bucket novo) |

## Recomendação

Carga sob demanda, de um bucket novo (`aws-icons`), leitura pública, populado por upload direto do pacote oficial da AWS, sem passar por pacote npm de terceiro. Evita as duas opções desatualizada/alterada do npm, e evita bundlar centenas de ícones que a maioria dos diagramas não usa. Reaproveita o mecanismo de embutir imagem por URL que a `DDP-308` já construiu para `diagram-images`, só trocando URL assinada por URL pública (o ícone não é dado privado de projeto).

## Alternativa descartada

Cópia em `public/` só com os ícones dos serviços mais comuns (um subconjunto pequeno, não o catálogo inteiro), para evitar bucket novo. Descartada porque qualquer subconjunto fixo decidido agora vira lacuna toda vez que alguém precisar de um serviço fora da lista, e a `DDP-514` pede o catálogo oficial das categorias (Compute, Storage, Database e as demais), não uma lista curada.

## Custo aceito

Bucket novo (`aws-icons`) é mudança de infraestrutura e entra como card `app-release`, com aprovação do humano antes de aplicar, antes da ordem de interface que consome o bucket. Sem automação de atualização trimestral: cada release da AWS (Q1, Q2, Q3, sem Q4) precisa de alguém subir o pacote novo à mão. Falha de rede na busca do ícone precisa de um estado de erro visível na paleta e na exportação, coberto na ordem de interface.

## Lacuna declarada

Este estudo não decide o esquema de nomes (`slug`) de cada serviço nem a lista completa de categorias oficiais (Compute, Storage, Database e "os demais", como o card pede): isso fica para a ordem do bucket, que lista as categorias e os arquivos que entram na primeira leva.
