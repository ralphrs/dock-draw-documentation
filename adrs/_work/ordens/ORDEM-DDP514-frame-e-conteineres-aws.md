# Ordem DDP-514b: moldura de serviço e contêineres AWS no app

**Issue da ordem:** `DDP-529`.

Segunda de duas ordens da `DDP-514`. Depende da `ORDEM-DDP514-icones-aws-bucket.md` (política de leitura da pasta `aws-icons/` do bucket `diagram-images`, `DEC-0044`) já aplicada, e dos ícones já subidos nessa pasta pelo dono do produto (`DDP-549`). Sem migração nesta ordem, sem dependência nova.

## O que fazer

**1. Tipo novo `aws_icon`, em `src/domain/c4/types.ts` (`C4_ELEMENT_TYPES`).** Guarda um serviço com moldura oficial. `C4ElementStyle` (mesmo arquivo) ganha `awsIcon?: string | null` (caminho `categoria/slug` do manifesto) e `awsVariant?: "service" | "resource"`.

**2. Moldura, em `src/components/editor/element-shape.tsx` ou componente novo `aws-icon-node.tsx` seguindo o padrão de `image-node.tsx`.** Quadrado com fundo `var(--card)`, borda `var(--border)`, o SVG do serviço centralizado dentro (lido por URL assinada com `signDiagramImage("aws-icons/" + style.awsIcon + ".svg")` de `image-storage.ts`, com a mesma renovação antes de expirar que `image-node.tsx` faz), e o nome oficial do serviço como rótulo abaixo da moldura, truncado como `ElementLabels` já faz.

**3. Lacuna declarada de geometria.** A `DDP-237` (moldura aprovada) registra como pendência aberta "qual variante (serviço x recurso) vira padrão e o tamanho do ícone dentro da moldura", a resolver no ADR-015, ainda não escrito. Esta ordem não inventa esses dois números. Até o ADR-015 fechar, implementar só a variante `service` como única disponível na paleta, com o quadrado da moldura do mesmo tamanho mínimo das outras formas (120×60, ajustado para proporção quadrada dentro desse mínimo) e o ícone ocupando o miolo com a mesma margem que `ImageNodeBody` já usa. A sessão C confere visualmente contra o frame `cWI2iIHQDBPPKqSu8J06oS` (página Moldura de serviço) antes de aceitar, e pode pedir ajuste de padding sem reabrir esta ordem.

**4. Seis tipos de contêiner, mesmo arquivo de tipos.** `aws_region`, `aws_vpc`, `aws_az`, `aws_subnet_public`, `aws_subnet_private`, `aws_security_group`. Todos com `shape: "aws-boundary"` novo em `catalog.ts`, cantos retos (`rx=0`, diferente do `group` genérico do DokDraw, que é arredondado: a `DDP-239` confirma que cantos retos são o jeito da AWS e não conflitam com nenhum padrão existente). Tabela de estilo, extraída literal dos achados aceitos na `DDP-239`/`DDP-240` (cor e traço são exceção declarada ao token único, mesmo padrão que a `DDP-239` já documentou para o ícone de grupo, porque são as cores oficiais da categoria AWS, não do DokDraw):

| Tipo | Borda | Cor | Ícone de canto |
| --- | --- | --- | --- |
| `aws_region` | Tracejada fina (`sysDash` do deck oficial, mais fina que a padrão) | `#00A4A6` | `groups/region.svg` |
| `aws_vpc` | Sólida | `#8C4FFF` | `groups/vpc.svg` |
| `aws_az` | Tracejada padrão | `#00A4A6` | nenhum (sem ícone oficial) |
| `aws_subnet_public` | Sólida | `#7AA116` | `groups/subnet-public.svg` |
| `aws_subnet_private` | Sólida | `#00A4A6` | `groups/subnet-private.svg` |
| `aws_security_group` | Sólida | `#DD344C` | nenhum (sem ícone oficial) |

**5. Ícones de grupo já prontos.** `groups/region.svg`, `groups/vpc.svg`, `groups/subnet-public.svg`, `groups/subnet-private.svg` já estão em `aws-icons/groups/` no bucket, subidos pelo dono do produto (`DDP-549`), sem passo novo aqui. Zona de disponibilidade e grupo de segurança não têm ícone oficial (confirmado na `DDP-239`), então não têm arquivo.

**6. Rótulo do contêiner sem colisão, em `renderShape`/`ElementLabels` para `shape === "aws-boundary"`.** Faixa reservada de 40px no topo do contêiner para ícone (28px) e rótulo, junto, canto superior esquerdo, nunca embaixo (regra do slide 9 do deck oficial, `DDP-240`). As outras três bordas com 16px de respiro. Um contêiner aninhado dentro de outro só começa depois dessa faixa do nível de fora, para nenhum rótulo cruzar o de dentro em qualquer profundidade (regra literal do deck, "0.05 inch buffer on all sides", citada na `DDP-240`). Isso é um cálculo do app na hora de aninhar, não um limite de arrasto livre: a pessoa pode continuar posicionando os nós como quiser, a régua só garante que os valores usados como referência na paleta e no exemplo de arrasto já nascem sem colisão.

**7. Família `aws` em `src/domain/c4/families.ts`.** `available: true`, `groups` lidos de `public/aws-icons-manifest.json` (o arquivo vai anexado à mensagem de despacho, copiar para `public/` do app sem alterar), mais um grupo fixo `"Contêineres"` com os seis tipos do item 4, sempre visível independente do manifesto.

**8. Exportação SVG e PNG.** Herdam de graça por `ElementShape`/`ElementLabels`, como todo outro tipo (nenhuma mudança em `export-diagram.tsx` para o desenho em si), com uma ressalva: `buildSvg` embute imagem por URL hoje só para o tipo `image` (`carregarImagens`, linha 34). Estender essa função para também embutir `style.awsIcon` do tipo `aws_icon`, pelo mesmo `diagramImageDataUrl` com o caminho `aws-icons/{awsIcon}.svg`.

**9. Exportação `.drawio`, `drawioStyle` em `export-diagram.tsx`.** Estilos conferidos na paleta "AWS / Groups" do próprio draw.io (`jgraph/drawio`, `src/main/webapp/js/diagramly/sidebar/Sidebar-AWS4.js`, linhas 257 a 305, commit `f3abfe0f` de 2026-09-08, consultado em 2026-09-22). Prefixo comum dos grupos, chamado `G` abaixo: `outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;container=1;pointerEvents=0;collapsible=0;recursiveResize=0;shape=mxgraph.aws4.group;verticalAlign=top;align=left;spacingLeft=30;`.

| Tipo | Estilo |
| --- | --- |
| `aws_region` | `G` + `grIcon=mxgraph.aws4.group_region;strokeColor=#00A4A6;fillColor=none;fontColor=#147EBA;dashed=1;` |
| `aws_vpc` | `G` + `grIcon=mxgraph.aws4.group_vpc2;strokeColor=#8C4FFF;fillColor=none;fontColor=#AAB7B8;dashed=0;` |
| `aws_az` | sem `shape` de grupo, como o draw.io faz: `fillColor=none;strokeColor=#147EBA;dashed=1;verticalAlign=top;fontStyle=0;fontColor=#147EBA;whiteSpace=wrap;html=1;` |
| `aws_subnet_public` | `G` + `grIcon=mxgraph.aws4.group_security_group;grStroke=0;strokeColor=#7AA116;fillColor=#F2F6E8;fontColor=#248814;dashed=0;` |
| `aws_subnet_private` | `G` + `grIcon=mxgraph.aws4.group_security_group;grStroke=0;strokeColor=#00A4A6;fillColor=#E6F6F7;fontColor=#147EBA;dashed=0;` |
| `aws_security_group` | sem `shape` de grupo: `fillColor=none;strokeColor=#DD3522;verticalAlign=top;fontStyle=0;fontColor=#DD3522;whiteSpace=wrap;html=1;` |

O draw.io reaproveita o ícone `group_security_group` para as duas sub-redes e não tem ícone de grupo para zona de disponibilidade nem para grupo de segurança na paleta atual. Para `aws_icon`: `shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.{slug};` com `fillColor` da categoria (Compute `#ED7100`, Storage `#7AA116`, os demais conforme a paleta do draw.io), quando o `slug` do manifesto existir no stencil `aws4.xml` (`lambda`, `ec2`, `s3` conferidos). Quando não existir, cair para imagem embutida como data URL (`shape=image;image=...`), como o tipo `image` já faz. A conferência de existência do `resIcon` é por uma lista fixa no app, gerada uma vez a partir do `aws4.xml`, não por chamada de rede.

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
