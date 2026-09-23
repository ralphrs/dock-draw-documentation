# Ordem: moldura de serviço e contêineres Azure no app

**Issue da ordem:** preencher ao criar no Jira.

Segunda de duas ordens da família Azure. Depende da `ORDEM-AZURE-icones-bucket.md` (política de leitura da pasta `azure-icons/` do bucket `diagram-images`) já aplicada, e dos ícones já subidos nessa pasta pelo dono do produto. Sem migração nesta ordem, sem dependência nova. Reaproveita o mecanismo já revisado da família AWS (`DDP-529`): componente `cloud-icon-node.tsx`, shape `cloud-boundary`, parâmetro `iconHref` de `renderShape`, `useSignedImage` e `carregarImagens`. Design aceito e consolidado (`DDP-359` a `DDP-365`, `DDP-452`).

## O que fazer

**1. Tipo novo `azure_icon`, em `src/domain/c4/types.ts` (`C4_ELEMENT_TYPES`).** Guarda um serviço com moldura oficial. `C4ElementStyle` ganha `azureIcon?: string | null` (caminho `categoria/slug` do manifesto). Sem variante: a Azure não tem a distinção serviço x recurso que a AWS deixou em aberto.

**2. Moldura, reaproveitando `cloud-icon-node.tsx` (item 2 da `DDP-529`), sem componente novo.** Mesmo quadrado 120×60, fundo `var(--card)`, borda `var(--border)`, ícone oficial centralizado (URL assinada pelo mecanismo já revisado), nome do serviço como rótulo abaixo, mais uma linha `[categoria: Azure]` monoespaçada 10px opacidade 0,85, mesmo formato de `ElementLabels` (`DDP-360`, já aceito: essa segunda linha é regra nova, comum a toda família de nuvem, e vale também retroativamente para o `aws_icon` da `DDP-529`, que ganha a mesma linha `[categoria: AWS]`).

**3. Cinco tipos de contêiner, mesmo arquivo de tipos.** `azure_subscription`, `azure_resource_group`, `azure_vnet`, `azure_subnet`, `azure_region`. Todos com `shape: "cloud-boundary"` (já existe da `DDP-529`), cantos retos, sem preenchimento. Tabela de estilo, literal dos achados aceitos na `DDP-363`/`DDP-365` (a Azure não publica cor por tipo de contêiner nem ícone de grupo dedicado: borda única salvo os dois casos com cor extraída do diagrama oficial da Microsoft, exceção declarada como a AWS já tem):

| Tipo | Borda | Cor | Ícone de canto |
| --- | --- | --- | --- |
| `azure_subscription` | Sólida | `var(--border)` | `general/subscriptions.svg` |
| `azure_resource_group` | Sólida | `var(--border)` | `general/resource-groups.svg` |
| `azure_vnet` | Sólida, 1,5px | `#a4cbfb` (cor fixa, igual nos dois temas) | `networking-content-delivery/virtual-networks.svg` |
| `azure_subnet` | Sólida, 1,5px | `#a4cbfb` (cor fixa, igual nos dois temas) | `networking-content-delivery/subnet.svg` |
| `azure_region` | Sólida | `var(--border)` | `general/region-management.svg` |

Os caminhos de ícone acima seguem o padrão do manifesto gerado em `adrs/_work/azure-icons/azure-icons-manifest.json`: confira o slug exato ali antes de escrever o código, pode divergir da forma acima em hífen ou capitalização.

**4. Ícones de contêiner reaproveitados do catálogo geral, não uma pasta de grupo.** Diferente da AWS (`aws-icons/groups/`), o pacote oficial Azure não tem ícone de fronteira dedicado (`DDP-363`, lacuna declarada). Os cinco ícones acima são os mesmos arquivos de serviço que entram na paleta comum (item 1), já na pasta `azure-icons/{categoria}/` do bucket, sem passo novo aqui.

**5. Mecanismo do ícone, canvas e exportação: idêntico ao item 6 da `DDP-529`, sem código novo.** `renderShape` já recebe `iconHref?: string | null` de forma genérica. `c4-node.tsx` passa a resolver `azure-icons/{categoria}/{slug}.svg` para os cinco contêineres e para `azure_icon`, pelo mesmo `useSignedImage`. `carregarImagens` (`export-diagram.tsx`) inclui os mesmos caminhos no mapa via `diagramImageDataUrl`.

**6. Família `azure` em `src/domain/c4/families.ts`.** `available: true`, `groups` lidos de `public/azure-icons-manifest.json` (arquivo anexado à mensagem de despacho, copiar para `public/` sem alterar), mais um grupo fixo `"Contêineres"` com os cinco tipos do item 3.

**7. Exportação SVG e PNG.** Herdam por `ElementShape`/`ElementLabels`. A mudança em `export-diagram.tsx` é a extensão do mapa do item 5 (mesmo padrão do tipo `image` e do `aws_icon`).

**8. Exportação `.drawio`.** O draw.io não tem biblioteca de contêiner/fronteira nativa para Azure (conferido em `jgraph/drawio`, branch `dev`, `Sidebar-Azure2.js` e `Sidebar-MSCAE.js`, consultado em 2026-09-23: só entradas de ícone único, nenhum `shape=` de grupo equivalente a `mxgraph.aws4.group_region`). Os cinco contêineres exportam como retângulo simples, sem `shape=` de stencil: `fillColor=none;strokeColor={cor};verticalAlign=top;fontStyle=0;fontColor={cor};whiteSpace=wrap;html=1;dashed=0;`, com `{cor}` igual à tabela do item 3 (`#a4cbfb` fixo para Rede virtual e Sub-rede, valor computado do token `--border` resolvido em tempo de exportação para os outros três, mesmo mecanismo que os demais tipos com cor de token já usam no export, nenhum mecanismo novo). Para `azure_icon`, a biblioteca `azure2` do draw.io referencia imagem embutida por caminho interno (`image=img/lib/azure2/{categoria}/{Nome_Com_Underscore}.svg`), não um stencil vetorial: usar esse caminho quando o nome do arquivo bater com o catálogo azure2 (lista fixa gerada uma vez, sem chamada de rede, mesmo padrão da lista `resIcon` da AWS), e cair para imagem embutida como data URL quando não bater.

**9. Atribuição (`DEC-0030`, texto igual ao aceito na `DDP-361`).** Mesmo mecanismo do item 10 da `DDP-529` (`AWS_ATTRIBUTION_HEIGHT`, renomear para `CLOUD_ATTRIBUTION_HEIGHT` nesta ordem, sem mudar comportamento): uma vez por diagrama que tem elemento `aws_icon`, `azure_icon` ou um dos onze contêineres das duas famílias, mesmo texto do aviso de marca da `DEC-0030` (não o texto específico da AWS da `DDP-236`, que fica só na página de licenças do app, fora desta ordem).

## O que não fazer aqui

- Não criar componente novo nem shape novo: tudo já existe da `DDP-529`.
- Não subir ícone além do que o manifesto de `adrs/_work/azure-icons/` tiver.
- Nenhuma migração, nenhuma dependência nova.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão (`DEC-0041`).

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| `DEC-0030`: ícone oficial sem alteração, com atribuição | Ícones intactos da pasta `azure-icons/` (itens 1 e 4). Atribuição no item 9 |
| Cor só por token (regra do kit) | Exceção declarada só para `#a4cbfb`, mesmo padrão aceito na `DDP-239`/`DDP-363` |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: arrastar `azure_icon` da paleta, ver moldura com ícone oficial, nome e `[categoria: Azure]`. Arrastar os cinco contêineres e ver borda, cor e ícone de canto batendo com a tabela do item 3, `#a4cbfb` idêntico nos dois temas. Exportar em SVG, PNG e `.drawio`, abrir o `.drawio` em app.diagrams.net vendo o ícone Azure (nativo ou embutido) e o retângulo simples dos contêineres.

## Restrições

- Não altere o formato gravado do diagrama nem o schema de `model_elements`.
- Não toque em `content.*` nem em qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
