# Ordem DDP-514b: moldura de serviço e contêineres AWS no app

**Issue da ordem:** `DDP-529`.

Segunda de duas ordens da `DDP-514`. Depende da `ORDEM-DDP514-icones-aws-bucket.md` (política de leitura da pasta `aws-icons/` do bucket `diagram-images`, `DEC-0044`) já aplicada, e dos ícones já subidos nessa pasta pelo dono do produto (`DDP-549`). Sem migração nesta ordem, sem dependência nova.

## O que fazer

**1. Tipo novo `aws_icon`, em `src/domain/c4/types.ts` (`C4_ELEMENT_TYPES`).** Guarda um serviço com moldura oficial. `C4ElementStyle` (mesmo arquivo) ganha `awsIcon?: string | null` (caminho `categoria/slug` do manifesto) e `awsVariant?: "service" | "resource"`.

**2. Moldura, em componente novo `cloud-icon-node.tsx` seguindo `image-node.tsx`, sem nada de AWS no nome (recebe caminho e prefixo do bucket como dado, Azure reaproveita sem duplicar).** Quadrado com fundo `var(--card)`, borda `var(--border)`, o SVG do serviço centralizado dentro (URL assinada pelo mecanismo do item 6) nome como rótulo abaixo (truncado como `ElementLabels` já faz) e segunda linha `[categoria: AWS]` monoespaçada 10px opacidade 0,85, regra comum a toda nuvem (`DDP-360`, aceita).

**3. Lacuna declarada de geometria.** A `DDP-237` deixa em aberto "qual variante (serviço x recurso) vira padrão e o tamanho do ícone", a resolver no ADR-015. Até lá, só `service` entra na paleta, moldura no tamanho mínimo das outras formas (120×60, ajustado a proporção quadrada) e ícone no miolo com a margem que `ImageNodeBody` já usa. A sessão C confere contra o frame `cWI2iIHQDBPPKqSu8J06oS`, ajuste de padding sem reabrir esta ordem.

**4. Seis tipos de contêiner, mesmo arquivo de tipos.** `aws_region`, `aws_vpc`, `aws_az`, `aws_subnet_public`, `aws_subnet_private`, `aws_security_group`. Todos com `shape: "cloud-boundary"` novo em `catalog.ts` (sem prefixo de fornecedor, base reaproveitada por outra nuvem, tabela de estilo própria por tipo), cantos retos (`rx=0`, diferente do `group` genérico, arredondado: a `DDP-239` confirma canto reto no jeito AWS). Tabela literal dos achados da `DDP-239`/`DDP-240` (cor e traço exceção declarada ao token único, mesmo padrão já aceito para o ícone de grupo: cores oficiais da AWS, não do DokDraw):

| Tipo | Borda | Cor | Ícone de canto |
| --- | --- | --- | --- |
| `aws_region` | Tracejada fina (`sysDash` do deck oficial, mais fina que a padrão) | `#00A4A6` | `groups/region.svg` |
| `aws_vpc` | Sólida | `#8C4FFF` | `groups/vpc.svg` |
| `aws_az` | Tracejada padrão | `#00A4A6` | nenhum (sem ícone oficial) |
| `aws_subnet_public` | Sólida | `#7AA116` | `groups/subnet-public.svg` |
| `aws_subnet_private` | Sólida | `#00A4A6` | `groups/subnet-private.svg` |
| `aws_security_group` | Sólida | `#DD344C` | nenhum (sem ícone oficial) |

**5. Ícones de grupo já prontos.** Os quatro arquivos da tabela já estão em `aws-icons/groups/` no bucket, subidos pelo dono do produto (`DDP-549`), sem passo novo aqui. Zona de disponibilidade e grupo de segurança não têm ícone oficial (`DDP-239`).

**6. Rótulo do contêiner sem colisão, em `renderShape`/`ElementLabels` para `shape === "aws-boundary"`.** Faixa reservada de 40px no topo do contêiner para ícone (28px) e rótulo, junto, canto superior esquerdo, nunca embaixo (regra do slide 9 do deck oficial, `DDP-240`). As outras três bordas com 16px de respiro. Contêiner aninhado só começa depois dessa faixa, sem cruzar rótulo em qualquer profundidade (regra do deck, "0.05 inch buffer on all sides", `DDP-240`). É um cálculo do app na hora de aninhar, não um limite de arrasto: a régua só garante que os valores da paleta e do exemplo de arrasto nascem sem colisão.

Mecanismo do ícone, canvas e exportação. `renderShape` é função pura e continua assim: ganha o parâmetro `iconHref?: string | null` e desenha `<image href>` de 28px no canto quando ele vem, nada quando `null`. Quem resolve a URL é o chamador. No canvas, `c4-node.tsx` chama `useSignedImage` (`image-node.tsx`, já renova a URL antes de expirar) com `aws-icons/groups/{arquivo}` da tabela do item 4 para os quatro contêineres com ícone, e com `aws-icons/{awsIcon}.svg` para `aws_icon`, e passa a URL a `ElementShape`. Enquanto a URL não chega, o contêiner desenha sem ícone. Na exportação, `carregarImagens` (`export-diagram.tsx`, linha 43) inclui esses mesmos caminhos no mapa, resolvidos por `diagramImageDataUrl`, e `buildSvg` passa o data URL como `iconHref`. Um caminho por elemento, um mapa, o mesmo desenho nos dois lados.

**7. Família `aws` em `src/domain/c4/families.ts`.** `available: true`, `groups` lidos de `public/aws-icons-manifest.json` (o arquivo vai anexado à mensagem de despacho, copiar para `public/` do app sem alterar), mais um grupo fixo `"Contêineres"` com os seis tipos do item 4, sempre visível independente do manifesto.

**8. Exportação SVG e PNG.** Herdam por `ElementShape`/`ElementLabels`, como todo outro tipo. A única mudança em `export-diagram.tsx` é a do item 6: `carregarImagens` passa a resolver também `aws-icons/{awsIcon}.svg` do tipo `aws_icon` e os quatro ícones de canto, pelo mesmo `diagramImageDataUrl`, no mesmo passo de pré-resolução que o tipo `image` já usa.

**9. Exportação `.drawio`, `drawioStyle` em `export-diagram.tsx`.** Estilos da paleta "AWS / Groups" do draw.io (`jgraph/drawio`, `Sidebar-AWS4.js`, linhas 257-305, commit `f3abfe0f`, 2026-09-22). Prefixo comum dos grupos, chamado `G` abaixo: `outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;container=1;pointerEvents=0;collapsible=0;recursiveResize=0;shape=mxgraph.aws4.group;verticalAlign=top;align=left;spacingLeft=30;`.

| Tipo | Estilo |
| --- | --- |
| `aws_region` | `G` + `grIcon=mxgraph.aws4.group_region;strokeColor=#00A4A6;fillColor=none;fontColor=#147EBA;dashed=1;` |
| `aws_vpc` | `G` + `grIcon=mxgraph.aws4.group_vpc2;strokeColor=#8C4FFF;fillColor=none;fontColor=#AAB7B8;dashed=0;` |
| `aws_az` | sem `shape` de grupo, como o draw.io faz: `fillColor=none;strokeColor=#147EBA;dashed=1;verticalAlign=top;fontStyle=0;fontColor=#147EBA;whiteSpace=wrap;html=1;` |
| `aws_subnet_public` | `G` + `grIcon=mxgraph.aws4.group_security_group;grStroke=0;strokeColor=#7AA116;fillColor=#F2F6E8;fontColor=#248814;dashed=0;` |
| `aws_subnet_private` | `G` + `grIcon=mxgraph.aws4.group_security_group;grStroke=0;strokeColor=#00A4A6;fillColor=#E6F6F7;fontColor=#147EBA;dashed=0;` |
| `aws_security_group` | sem `shape` de grupo: `fillColor=none;strokeColor=#DD3522;verticalAlign=top;fontStyle=0;fontColor=#DD3522;whiteSpace=wrap;html=1;` |

O draw.io reaproveita `group_security_group` nas sub-redes, sem ícone de grupo para zona de disponibilidade nem grupo de segurança. Para `aws_icon`: `shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.{slug};` com `fillColor` da categoria (Compute `#ED7100`, Storage `#7AA116`, os demais conforme a paleta do draw.io), quando o `slug` do manifesto existir no stencil `aws4.xml` (`lambda`, `ec2`, `s3` conferidos). Quando não existir, cair para imagem embutida como data URL (`shape=image;image=...`), como o tipo `image` já faz. A existência do `resIcon` é conferida por lista fixa no app, gerada uma vez do `aws4.xml`, sem chamada de rede.

**10. Atribuição da AWS (`DEC-0030`, texto aprovado na `DDP-236`).** Texto literal aprovado na `DDP-236` (ler na issue, sem alterar uma palavra), uma vez por diagrama que tem pelo menos um elemento `aws_icon` ou um dos seis contêineres. Onde aparece: na exportação SVG e PNG, uma linha em `muted-foreground`, 10px, alinhada à esquerda, abaixo do rodapé (ou do diagrama, sem rodapé), no espaço que `AWS_ATTRIBUTION_HEIGHT` já reserva em `export-diagram.tsx` (linhas 26 a 32, hoje `0`): a constante vira 24 e a linha só entra quando a visão tem elemento AWS. No `.drawio`, um `mxCell` de texto com o mesmo conteúdo abaixo do diagrama. No canvas, a mesma linha no canto inferior esquerdo do quadro, fora da área de arrasto, visível só quando a visão tem elemento AWS. A moldura de cada serviço não repete o texto.

## O que não fazer aqui

- Não implementar a variante `resource` da moldura: fica para depois do ADR-015 (item 3).
- Não mudar `group` (Limite genérico do DokDraw): os seis tipos AWS são novos, não substituem o existente.
- Não subir ícone de serviço além dos já cobertos pela outra ordem: a paleta lista o que o manifesto tiver.
- Nenhuma migração, nenhuma dependência nova.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão (`DEC-0041`).

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| `DEC-0030`: ícone oficial sem alteração, com atribuição | Ícones vêm intactos da pasta `aws-icons/` do bucket (itens 2 e 5). Atribuição no item 10, na exportação e no canvas |
| Cor só por token (regra do kit) | Exceção declarada só para as seis cores oficiais de contêiner AWS, mesmo padrão já aceito na `DDP-239` para o ícone de grupo |
| ADR 001: nós e edges controlados pelo estado do app | Contêiner é elemento comum do modelo C4, sem mecanismo paralelo |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: arrastar um ícone `aws_icon` da paleta (categoria e nome vindos do manifesto), ver a moldura com o ícone oficial e o nome do serviço abaixo. Arrastar os seis contêineres e ver borda, cor e ícone de canto batendo com a tabela do item 4. Aninhar Região > VPC > Zona de disponibilidade e ver que nenhum rótulo cruza o de dentro. Exportar em SVG, PNG e `.drawio`, e abrir o `.drawio` em app.diagrams.net vendo os ícones nativos `mxgraph.aws4`.

## Restrições

- Não altere o formato gravado do diagrama nem o schema de `model_elements`.
- Não toque em `content.*` nem em qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
