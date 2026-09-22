# Estudo: o que uma seta pode ser em um diagrama, e o que falta no DokDraw

**Pedido:** `DDP-348`, humano: "Estude e revise todas as possibilidades que uma seta deve ter em um diagrama, e me traga o que está faltando com uma proposta."
**Data:** 2026-09-22
**Código de referência:** `dok-draw-app`, commit `ceb453a` de 2026-09-22
**Para que serve:** insumo de ordens ao Lovable para a conexão do Diagram Studio e do ADR 015 (formato gravado da conexão)

## Método

1. Leitura do código do app na data: `src/components/editor/c4-edge.tsx`, `src/domain/c4/types.ts`, `src/components/editor/diagram-canvas.tsx`, `src/components/editor/c4-node.tsx`, `src/components/editor/janela-propriedades.tsx`, `src/components/editor/export-diagram.tsx`, `src/application/diagram.functions.ts`, `src/infrastructure/supabase/c4-repository.ts`, `src/styles.css` e o painel lateral em `src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx`. Cada item da seção 1 aponta arquivo e linha.
2. Leitura dos insumos do repositório: `adrs/_work/INVENTARIO-formas-por-diagrama.md` (setas básicas já cobertas), `adrs/_work/REFERENCIA-drawio-persistencia.md` (material de terceiro, não conferido contra o código do draw.io, usado só como contexto), `decisoes/DEC-0026` (os 24 tipos de diagrama) e `decisoes/DEC-0027` (formas básicas). As regras já decididas para a seta direcional do kit básico (`DDP-345` a `DDP-348`) entram como restrição: a seta direcional é a conexão inteira, traço mais ponta, com os tokens `--edge` e `--ring`, rótulo no ponto médio sem truncamento, ponta flutuante no perímetro, sem redimensionamento.
3. Pesquisa na web em 2026-09-22, em três frentes paralelas: ferramentas de desenho livre (draw.io, Lucidchart, Excalidraw, tldraw, FigJam, Miro), ferramentas de texto (Mermaid, PlantUML, C4-PlantUML, Structurizr DSL) mais o React Flow 12, e as notações (UML 2.5.1, BPMN 2.0.2, ER, DFD, C4, fluxograma). Fonte aceita: documentação oficial, especificação da OMG, código-fonte no GitHub, changelog. Resposta de staff em fórum oficial entra marcada como tal. README e página de marketing não contam.
4. Onde nenhuma fonte cobre um aspecto, o texto diz "sem evidência" em vez de supor.

## 1. O que a seta do DokDraw faz hoje

Caminhos relativos a `dok-draw-app/src`. A rota longa `routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx` aparece como `rota`.

| Aspecto | Estado atual | Arquivo e linha |
| --- | --- | --- |
| Modelo da relação | `C4Relationship`: `sourceId`, `targetId`, `label`, `technology`, `style` (`sync`, `async`, `dashed`), `waypoints`, `styleProps`. Sem porta, sem rótulos de extremidade, sem link, sem metadados | `domain/c4/types.ts:30-31,138-149` |
| Modelo do estilo | `C4RelationshipStyle`: `color`, `width`, `opacity`, `routing`, `startArrow`, `endArrow`, `fontSize`, `textColor`, `labelBackground`. Padrão: largura 1.6, opacidade 1, reta, sem ponta na origem, seta cheia no destino, texto 11, fundo ligado | `domain/c4/types.ts:39-65` |
| Persistência e validação | Coluna `style_props` (Json) em `relationships`. Zod: `label` até 160, `technology` até 120, `waypoints` até 40, `width` 0.5 a 12, `opacity` 0.1 a 1, `fontSize` 8 a 28, `color` até 40 caracteres | `integrations/supabase/types.ts:204-236`, `infrastructure/supabase/c4-repository.ts:55,332-340`, `application/diagram.functions.ts:170-201` |
| Pontas | Cinco valores: `none`, `arrow` (triângulo cheio), `open` (seta aberta), `diamond` (losango cheio), `circle` (círculo cheio). Origem e destino independentes. Marcador SVG por aresta, `markerWidth` 7, `markerUnits="strokeWidth"` (a ponta cresce com a espessura), `refX` 9 ou 5 no círculo. Não existem triângulo vazio, losango vazio, círculo vazio, X, barra, pé de galinha, semicírculo, marcador de origem do BPMN | `domain/c4/types.ts:36-37`, `components/editor/c4-edge.tsx:47-84,262-270` |
| Traço | Padrão do traço vem do campo semântico `style`: `sync` contínuo, `dashed` "8 6", `async` "2 6" (pontilhado). Não há como pedir pontilhado sem declarar a relação assíncrona. Sem padrão personalizado, sem animação, sem sombra, sem sketch | `components/editor/c4-edge.tsx:126-130,275` |
| Espessura, opacidade, cor | `width` (painel limita a 0.5 a 8, zod a 12), `opacity`, `color` livre ou token `--edge` (`--ring` quando selecionada). Selecionada ganha +0.8 de largura | `components/editor/c4-edge.tsx:211,271-276`, `styles.css:110,195,386-391`, `rota:3031-3075` |
| Rotas | `straight`, `orthogonal`, `curved`. Ortogonal insere duas dobras no meio de cada par de pontos. "Curvo" é a mesma polilinha com canto arredondado por curva quadrática, não uma curva de Bézier. A chamada pede raio 28 para curvo, 0 para reto e 10 para ortogonal, mas `buildPath` lê a constante `RADIUS` (10) nas linhas 101 e 102 em vez do parâmetro: defeito `DDP-444`. Sem pulo em cruzamento, sem desvio de formas, sem rota "entity relation" | `domain/c4/types.ts:33-34`, `components/editor/c4-edge.tsx:32-45,88-116,207-209` |
| Waypoints | Duplo clique numa faixa invisível de 18 px insere ponto no segmento mais próximo, snap de 10 px. Arrastar o ponto (só visível com a aresta selecionada). Duplo clique no ponto remove. "Limpar pontos de quebra" no menu de contexto e no painel. Arrastar um segmento não cria ponto | `components/editor/c4-edge.tsx:132-150,219-258,278-303`, `components/editor/diagram-canvas.tsx:433`, `rota:3080-3082` |
| Pontos de conexão | Quatro `Handle` por lado (`t`, `r`, `b`, `l`), origem e destino, `connectionMode` Loose, `connectionRadius` 45. A aresta ignora o handle: `borderPoint` calcula o ponto flutuante na borda do retângulo envolvente na direção do próximo ponto. Nenhuma porta é persistida. O perímetro é sempre o retângulo, também para pessoa, cilindro e hexágono | `components/editor/c4-node.tsx:38-42,117-156`, `components/editor/diagram-canvas.tsx:472-473`, `components/editor/c4-edge.tsx:152-178,200-205` |
| Laço e paralelas | Laço na mesma forma é recusado em dois pontos (`sourceId === targetId`). Duas relações entre o mesmo par são aceitas e desenhadas uma sobre a outra, sem deslocamento | `rota:962-963`, `components/editor/diagram-canvas.tsx:555` |
| Criação | Arrastar de um handle (`onConnect`, com correção quando o arraste começa no handle de destino), clicar na seta lateral do hover (conecta ao vizinho naquela direção ou clona o elemento), ou "Iniciar conexão daqui" e clique no destino, Escape cancela. Rótulo inicial "usa" | `components/editor/diagram-canvas.tsx:539-556`, `rota:971,987,1033-1046,1701-1730,2025-2028` |
| Rótulo | Um só, no ponto médio do segmento central. `EdgeLabelRenderer` em HTML, `fontSize` e `textColor` do estilo, fundo `bg-canvas` opcional. Duplo clique abre `input` de uma linha, Enter grava, Escape cancela. Sem truncamento. Sem quebra de linha, sem rotação, sem arrastar ao longo da linha, sem texto rico. Selecionada e vazia mostra "sem rótulo" | `components/editor/c4-edge.tsx:118-124,304-347` |
| Tecnologia | Existe no modelo e na janela de propriedades, aparece na lista de relações do elemento, mas a aresta não a desenha. O C4 pede `Descrição [Tecnologia]` na linha | `domain/c4/types.ts:144`, `components/editor/janela-propriedades.tsx:398-399,488-503`, `components/editor/c4-edge.tsx:21-30` (só `label`) |
| Seleção e exclusão | Clique seleciona, botão × flutuante, Delete e Backspace, item "Excluir conexão" no menu. Multi-seleção existe no canvas, mas o painel atua em uma relação por vez | `components/editor/c4-edge.tsx:348-364`, `components/editor/diagram-canvas.tsx:482-491,515,521-524`, `rota:401,1447-1448,2021-2024` |
| Inverter direção | Troca `sourceId` e `targetId`. Não troca `startArrow` com `endArrow`: um losango na origem passa para o outro elemento | `rota:1925-1929,2912`, `components/editor/diagram-canvas.tsx:427` |
| Reconectar ponta | Não existe. Nenhum `onReconnect`, `reconnectable` ou `edgesReconnectable` no código | `grep` sem resultado em `src` |
| Copiar e colar estilo | Só de elemento (`onCopyStyle(nodeId)`). Conexão não participa | `components/editor/diagram-canvas.tsx:412-417`, `rota:2202` |
| Painel lateral | Inverter, Rótulo, Traço (sync, async, dashed), Roteamento, Início, Fim, Cor da linha, Espessura, Opacidade, Limpar pontos, Tamanho do texto, Cor do texto, Fundo do rótulo | `rota:2904-3125` |
| Janela de propriedades | Abas Geral (Rótulo) e C4 (Tecnologia ou protocolo). Sem link, tooltip, tags ou metadados | `components/editor/janela-propriedades.tsx:422-518` |
| Desfazer | Toda mudança em relação passa por `patchRelComHistorico`, inclusive `styleProps` e inversão | `rota:788,919-920,953-955` |
| Exportação SVG e PNG | Um único `<marker id="arrow">`, `polyline` com largura fixa 1.6, dash pelo campo `style`, `markerEnd` fixo. Ignora `styleProps` inteiro (cor, espessura, opacidade, pontas, roteamento). Rótulo com retângulo estimado pelo número de caracteres. PNG rasteriza o mesmo SVG | `components/editor/export-diagram.tsx:238,256-258,286-330,423-440` |
| Exportação draw.io | Sempre `orthogonalEdgeStyle`, `endArrow=blockThin`, `dashed=1` para async e dashed. Ignora cor, espessura e pontas | `components/editor/export-diagram.tsx:505-513` |
| Tema | Cores lidas dos tokens no momento da exportação, então o arquivo sai no tema ativo, sem `light-dark()` | `components/editor/export-diagram.tsx:238`, `styles.css:110,195` |
| Acessibilidade | Padrão do React Flow (`edgesFocusable`, Tab e Enter). Nenhum `ariaLabel` definido nas arestas | `components/editor/diagram-canvas.tsx:265-296` |

## 2. O que as referências oferecem

Versões conferidas em 2026-09-22: draw.io [v31.4.6](https://github.com/jgraph/drawio/releases/tag/v31.4.6) (2026-09-16), Excalidraw [v0.18.1](https://github.com/excalidraw/excalidraw/releases/tag/v0.18.1), tldraw [v5.4.2](https://github.com/tldraw/tldraw/releases/tag/v5.4.2) (2026-09-10), Mermaid [12.0.0](https://github.com/mermaid-js/mermaid/releases/tag/mermaid%4012.0.0) (2026-09-10, ELK vira layout padrão), PlantUML [v1.2026.8](https://github.com/plantuml/plantuml/releases/tag/v1.2026.8), C4-PlantUML [v2.14.0](https://github.com/plantuml-stdlib/C4-PlantUML/releases), Structurizr [v2026.09.19](https://github.com/structurizr/structurizr/releases), React Flow [@xyflow/react 12.11.6](https://github.com/xyflow/xyflow/releases) (2026-09-01, a mesma do `package.json` do app). Lucidchart, FigJam e Miro são SaaS sem versão pública.

### 2.1 Ferramentas

Legenda: sim, parcial, não, s/e (sem evidência). Links por ferramenta na lista logo abaixo da tabela.

| Aspecto | draw.io | Lucidchart | Excalidraw | tldraw | FigJam | Miro | Mermaid 12 | PlantUML e C4-PlantUML | Structurizr DSL | React Flow 12 | DokDraw hoje |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ponta por extremidade | sim, 20+ tipos com variante cheia ou vazia, tamanho e recuo | sim, menus por ponta, tamanho, sem lista nominal | sim, 11 tipos (inclui 3 pés de galinha) | sim, 9 tipos | sim, 5 tipos | sim, 16 tipos (inclui 6 ERD) | parcial, combinações fixas por sintaxe | parcial, pela sintaxe (`<\|--\|>`) | não, só uma seta no destino | sim, `markerStart` e `markerEnd`, 2 tipos nativos, marcador SVG livre | sim, 5 tipos, sem variante vazia |
| Ponta ERD | sim | sim (menu ERD) | sim | não | não | sim | sim (`erDiagram`) | não | não | parcial (marcador próprio) | não |
| Traço | solid, dashed, dotted, gaps predefinidos | solid, dashed, padrão "traço, intervalo" livre, linha dupla | solid, dashed, dotted, roughness | draw, solid, dashed, dotted | solid, dashed (`dashPattern` na API) | normal, dashed, dotted | sólido, pontilhado, grosso, invisível | solid, dashed, dotted, bold, hidden | solid, dashed, dotted | qualquer `stroke-dasharray` | contínuo, "8 6", "2 6" presos à semântica |
| Espessura, cor, opacidade | sim, sim, sim | 0.5 a 10, sim, s/e | sim, sim, sim | 4 níveis, sim, sim | 2 níveis (livre na API), sim, s/e | 1 a 24, sim, s/e | sim, sim, parcial | 1 a 16, sim, s/e | sim, sim, sim | sim (CSS) | sim, sim, sim |
| Animação de fluxo | sim, com duração, timing e sentido, preservada no SVG | não (staff, 2024) | s/e | s/e | s/e | s/e | sim (`e1@{ animate: true }`) | não | não | sim (`animated`, `animateMotion`) | não |
| Rotas | straight, orthogonal, simple, isometric, curved, entity relation. Cantos sharp, rounded, curved | straight, curved, elbow, raio do canto, 45° com Shift | reta, multiponto, elbow com A* que desvia das formas ligadas | arc, elbow (desvia de obstáculos) | elbowed, straight, curved | straight, elbowed, curved | curvas d3 (12 tipos), ELK roteia com dobras | ortho ou polyline só com Graphviz | Direct, Orthogonal, Curved | straight, bezier, step, smoothstep com `borderRadius` | reta, ortogonal, "curvo" (canto arredondado, raio preso em 10) |
| Pulo em cruzamento | sim: arc, gap, sharp, com tamanho | sim, por linha e por documento | s/e | s/e | s/e | sim, só em retas e ortogonais | não | s/e | sim (`jump`) | parcial, via `react-flow-smart-edge` | não |
| Desvio automático de formas | s/e | s/e (smart lines recalculam rota) | sim (elbow) | sim (elbow) | s/e | s/e | sim (ELK) | sim (Graphviz) | sim (renderizador) | parcial (`elkjs`, `libavoid-js`, `smart-edge`) | não |
| Porta fixa e flutuante | sim, as duas, Alt cria ponto fixo em qualquer lugar do contorno, pontos por forma | fixa e smart | `fixedPoint` 0..1, modo inside ou orbit | anchor normalizado, preciso ou centro, exato | magnet por lado ou qualquer ponto com Cmd | snapTo por lado ou posição 0..1 | não | não | não | `Handle` fixo, flutuante por exemplo oficial | só flutuante, no retângulo envolvente |
| Conexão a outra conexão | parcial (forma "waypoint" como junção) | sim (staff, 2017) | s/e | s/e | s/e | s/e | não | não | não | não | não |
| Laço na mesma forma | sim | parcial, ajuste manual | sim (PR 9670, 2025-11) | s/e | parcial (outra lateral do mesmo objeto) | parcial (relato de comunidade) | s/e | sim | s/e | sim (exemplo Self Connecting) | recusado |
| Paralelas com deslocamento | s/e | s/e | s/e | s/e | s/e | s/e | pelo layout | pelo layout | permitidas se a descrição difere | manual (exemplo bidirecional) | sobrepostas |
| Quantos rótulos | 3 (meio e cada ponta), arrastáveis, com rotação | ilimitado por duplo clique, sem rotação | 1 no meio | 1, posição 0..1 | 1, arrastável, multilinha | vários (`captions[]`, posição 0..1, orientação alinhada) | 1 | 1 mais duas cardinalidades | descrição mais tecnologia, `position` 0 a 100 | ilimitado (`EdgeLabelRenderer`) | 1, fixo no meio |
| Fundo e texto rico do rótulo | fundo, HTML, sobrescrito | text pill, formatação | s/e | `richText`, contorno | fundo, negrito e tachado | fonte fixa | fundo, markdown | creole | não | livre (React) | fundo, texto puro |
| Reconectar ponta por arrasto | sim | sim | sim | sim | sim | sim | não | não | não | sim (`onReconnect`, `reconnectRadius`) | não |
| Waypoint manual | arrastar segmento cria, menu de contexto | nós no meio e nos quartos do segmento | segmentos fixos no elbow | não (pedido aberto) | arrastar alças do caminho | pontos da linha | não | não | só no renderizador | exemplo Pro "Editable Edge" | duplo clique cria, arrasto move |
| Inverter direção | sim (Reverse, move rótulos) | sim (ícone de seta dupla) | não (pedido aberto) | s/e | s/e | s/e | reescrever | `Rel_Back` | reescrever | s/e | sim, sem trocar pontas |
| Copiar estilo | Alt+C, Alt+V | Copy Style, Paint Format | Ctrl+Alt+C, Ctrl+Alt+V | Shift+Q | s/e | s/e | `linkStyle default` | `AddRelTag` | estilo por tag | por conta do app | só em elemento |
| Link, tooltip, metadados | sim, sim, sim (Edit Data, id editável) | só em formas | link, `customData`, id | `meta`, id | não | não | não | `$link` no C4-PlantUML | `url`, `properties`, `perspectives`, tags | `data` livre | não |
| SVG e PNG com marcadores, tema | sim, "Appearance: Dark", `light-dark()` | sim, sem modo escuro | `exportWithDarkMode` | `darkMode` | export do quadro | export do quadro | temas dark, `mermaid-cli -t dark` | temas | PNG e SVG | `html-to-image` | SVG e PNG só com a ponta padrão, no tema ativo |
| Acessibilidade de teclado | s/e | s/e | s/e | s/e | s/e | s/e | não | não | não | `edgesFocusable`, `ariaLabel`, Tab, Enter, Delete | padrão do React Flow, sem `ariaLabel` |

Fontes, acesso em 2026-09-22:

- draw.io: [estilos de conector](https://www.drawio.com/docs/manual/styles/connector-styles/), [waypoints](https://www.drawio.com/docs/manual/connectors/waypoints-connectors/), [rótulos do conector](https://www.drawio.com/docs/manual/connectors/connector-labels/), [fixo vs flutuante](https://www.drawio.com/doc/faq/connector-fixed-vs-floating), [reverse](https://www.drawio.com/docs/manual/connectors/connector-reverse/), [animação](https://www.drawio.com/doc/faq/connector-animate), [junção de conectores](https://www.drawio.com/docs/manual/connectors/connectors-join/), [metadados](https://www.drawio.com/doc/faq/shape-metadata), [tooltips](https://www.drawio.com/docs/manual/links-tooltips-tags/tooltips/), [exportar SVG](https://www.drawio.com/docs/manual/export/export-to-svg/), [cores adaptativas](https://www.drawio.com/docs/manual/editor/appearance/adaptive-colours/), [atalhos com modificador](https://www.drawio.com/docs/reference/shortcuts/modifier-shortcuts-in-diagrams/), nomes das pontas em [`Format.js`](https://github.com/jgraph/drawio/blob/dev/src/main/webapp/js/grapheditor/Format.js) e [`mxMarker.js`](https://github.com/jgraph/mxgraph/blob/master/javascript/src/js/shape/mxMarker.js).
- Lucidchart: [adicionar e estilizar linhas](https://help.lucid.co/hc/en-us/articles/16157138194836-Add-and-style-lines-in-Lucidchart) (atualizado 2026-09-09), [ERD](https://help.lucid.co/hc/en-us/articles/16471565238292-Create-an-Entity-Relationship-Diagram-in-Lucidchart), [animação recusada](https://community.lucid.co/ideas/line-flow-animation-8071), [rotação recusada](https://community.lucid.co/ideas/rotate-the-text-on-a-line-in-lucidchart-857), [linha em linha](https://community.lucid.co/product-questions-3/connecting-lines-to-lines-in-lucidchart-2344), [exportar](https://help.lucid.co/hc/en-us/articles/16324571257492-Export-or-print-a-Lucid-document).
- Excalidraw: [`types.ts`](https://github.com/excalidraw/excalidraw/blob/master/packages/element/src/types.ts) (`Arrowhead`, `strokeStyle`, `FixedPointBinding`), [pés de galinha](https://github.com/excalidraw/excalidraw/pull/8942), [elbow com A*](https://plus.excalidraw.com/blog/building-elbow-arrows-part-two), [segmentos fixos](https://github.com/excalidraw/excalidraw/pull/8952), [laço](https://github.com/excalidraw/excalidraw/pull/9670), [inverter, pedido aberto](https://github.com/excalidraw/excalidraw/issues/7541), [export](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export).
- tldraw: [`TLArrowShape.ts`](https://github.com/tldraw/tldraw/blob/main/packages/tlschema/src/shapes/TLArrowShape.ts), [binding](https://tldraw.dev/reference/tlschema/TLArrowBindingProps), [opções de snap](https://tldraw.dev/reference/tldraw/ArrowShapeOptions), [elbow v3.13](https://tldraw.dev/releases/v3.13.0), [waypoints, pedido aberto](https://github.com/tldraw/tldraw/issues/6664), [export](https://tldraw.dev/sdk-features/image-export).
- FigJam: [conectores](https://help.figma.com/hc/en-us/articles/1500004414542), [`ConnectorNode`](https://developers.figma.com/docs/plugins/api/ConnectorNode/).
- Miro: [linhas de conexão](https://help.miro.com/hc/en-us/articles/360017730733-Connection-lines), [SDK `connector`](https://developers.miro.com/docs/websdk-reference-connector), [line jumps](https://medium.com/miro-engineering/how-we-made-line-jumps-83bb767137f8).
- Mermaid: [flowchart](https://mermaid.js.org/syntax/flowchart.html), [classDiagram](https://mermaid.js.org/syntax/classDiagram.html), [erDiagram](https://mermaid.js.org/syntax/entityRelationshipDiagram.html), [C4](https://mermaid.js.org/syntax/c4.html), [temas](https://mermaid.js.org/config/theming.html).
- PlantUML e C4-PlantUML: [diagrama de classes](https://plantuml.com/en/class-diagram), [skinparam](https://plantuml.com/en/skinparam), [motores de layout](https://plantuml.com/layout-engines), [`C4.puml`](https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4.puml), [LayoutOptions](https://github.com/plantuml-stdlib/C4-PlantUML/blob/master/LayoutOptions.md).
- Structurizr: [linguagem DSL](https://docs.structurizr.com/dsl/language), [estilos de relação](https://docs.structurizr.com/dsl/cookbook/relationship-styles/), [notação](https://docs.structurizr.com/ui/diagrams/notation).
- React Flow: [`Edge`](https://reactflow.dev/api-reference/types/edge), [`EdgeMarker`](https://reactflow.dev/api-reference/types/edge-marker), [`BaseEdge`](https://reactflow.dev/api-reference/components/base-edge), [`EdgeLabelRenderer`](https://reactflow.dev/api-reference/components/edge-label-renderer), [`Handle`](https://reactflow.dev/api-reference/components/handle), [reconexão](https://reactflow.dev/examples/edges/reconnect-edge), [floating edges](https://reactflow.dev/examples/edges/floating-edges), [custom edges, inclui laço](https://reactflow.dev/examples/edges/custom-edges), [editable edge, Pro](https://reactflow.dev/examples/edges/editable-edge), [animação](https://reactflow.dev/examples/edges/animating-edges), [layouting](https://reactflow.dev/learn/layouting/layouting), [acessibilidade](https://reactflow.dev/learn/advanced-use/accessibility), [`react-flow-smart-edge`](https://github.com/tisoap/react-flow-smart-edge).

### 2.2 O que cada notação exige da linha

Fontes primárias: [UML 2.5.1](https://www.omg.org/spec/UML/2.5.1/PDF) (seções citadas), [BPMN 2.0.2](https://www.omg.org/spec/BPMN/2.0.2/PDF), [c4model.com, Notation](https://c4model.com/diagrams/notation), [Structurizr, notação](https://docs.structurizr.com/ui/diagrams/notation), [Yourdon, cap. 9](https://www.businessanalystlearnings.com/s/Yourdon-DFD.pdf), [Red Gate, pé de galinha](https://www.red-gate.com/blog/crow-s-foot-notation/), [Red Gate, Barker](https://www.red-gate.com/blog/barkers-erd-notation/), [Wikipedia, IDEF1X](https://en.wikipedia.org/wiki/IDEF1X), [Wikipedia, fluxograma](https://en.wikipedia.org/wiki/Flowchart). Acesso em 2026-09-22.

| Notação e linha | Traço | Ponta na origem | Ponta no destino | Rótulos | O que torna a linha válida | DokDraw hoje |
| --- | --- | --- | --- | --- | --- | --- |
| UML associação (11.5.4) | contínuo | nada, seta aberta (navegável) ou X (não navegável) | idem | nome no meio, papel e multiplicidade em cada ponta, todos opcionais | linha contínua entre dois classificadores ou de um classificador para ele mesmo. Cada ponta é independente | falta X, faltam rótulos de ponta, falta laço |
| UML agregação e composição (11.5.4) | contínuo | losango vazio ou cheio, só na ponta do todo | nada ou navegabilidade | os da associação | losango em uma ponta só | falta losango vazio |
| UML generalização (9.2.4) e realização (7.7.4) | contínuo, tracejado | nada | triângulo vazio | nenhum | triângulo vazio no geral ou no realizado | falta triângulo vazio |
| UML dependência, include, extend, import, merge (7.7.4, 18.1.4, 7.4.4, 12.2.4) | tracejado | nada | seta aberta | «include», «extend», «import», «access», «merge» obrigatórios no meio | seta aberta tracejada com a palavra-chave | tracejado depende de `style: dashed`, o texto «» é digitável, faltam os guillemets na UI |
| UML sequência (17.4.4.1) | contínuo, tracejado no retorno e na criação | nada, ou círculo cheio (found) | triângulo cheio (síncrona), seta aberta (assíncrona), círculo cheio (lost) | nome e argumentos | todo trecho horizontal ou descendente | pontas existem, regra de geometria não |
| UML atividade e estado (15.2.4, 14.2.4.8) | contínuo | nada | seta aberta | `[guarda]` junto à cauda, `gatilho [guarda] / efeito` no meio | seta aberta contínua | rótulo único no meio serve, falta rótulo junto à cauda |
| UML componentes (10.4.4, 11.2.4) | contínuo | componente | bola (fornecida) ou semicírculo (requerida) | nome da interface | bola e socket | faltam as duas pontas |
| BPMN fluxo de sequência (8.4.13) | contínuo | nada, barra diagonal (default) ou mini losango (condicional, só de atividade) | triângulo cheio | nome opcional | contínuo, uma origem e um destino, não cruza pool | faltam barra diagonal e mini losango na origem |
| BPMN fluxo de mensagem (9.4) | tracejado | círculo vazio | seta aberta | nome opcional | tracejado, só entre pools | falta círculo vazio |
| BPMN associação e associação de dados (8.3.3, 10.3) | pontilhado | nada ou seta aberta | nada ou seta aberta | nenhum | pontilhado. A spec reserva contínuo, tracejado e pontilhado: a ferramenta não pode inventar um estilo que colida | pontilhado só via `style: async`, que significa outra coisa |
| ER pé de galinha (IE) | contínuo (identificador), tracejado (não identificador) | um par (mínimo interno, máximo externo): círculo ou barra, depois barra ou pé de galinha | idem | verbo no meio, papel nas pontas | exatamente um par (mín, máx) por ponta | faltam pé de galinha, barra, barra dupla e marcador composto |
| ER Barker | contínuo ou tracejado por metade | pé de galinha ou nada, barra identificadora | idem | locução em cada ponta | cada metade da linha é independente | falta traço por metade |
| ER Chen e IDEF1X | contínuo, dupla (participação total), tracejado | nada, losango vazio (opcional IDEF1X) | nada, ponto cheio (muitos, IDEF1X) | `1`, `N`, `M`, `P`, `Z` nas pontas, nome no losango (que é nó) | losango como nó, ponto no filho | ponto cheio existe (`circle`), falta linha dupla |
| DFD (Yourdon 9.1 e 9.5) | contínuo, curvo aceito | nada ou seta (diálogo) | seta | nome do dado, obrigatório. Diálogo: um nome em cada ponta | rótulo obrigatório, ao menos uma ponta em processo | falta rótulo por ponta no diálogo |
| C4 (Notation, FAQ, Checklist) | livre e consistente, tracejado por padrão no Structurizr, contínuo no C4-PlantUML | nada | uma seta | descrição obrigatória, tecnologia entre colchetes, evitar "Uses" | unidirecional, rotulada, protocolo explícito entre contêineres. Bidirecional "ambígua e não suportada" no Structurizr | tecnologia não é desenhada, rótulo padrão "usa" contraria a recomendação |
| Fluxograma (ISO 5807 via Wikipedia) | contínuo | nada | seta, opcional no sentido padrão | Sim e Não nas saídas de decisão | linha de fluxo | coberto |
| Mapa mental (Buzan) | contínuo, curvo, afinando | nó pai | nada | uma palavra ao longo da linha | ramo curvo sem ponta, palavra sobre a linha | falta rótulo alinhado à linha e espessura variável |

Consolidado do que um motor precisa para cobrir as notações acima: 17 tipos de ponta (triângulo cheio, triângulo vazio, seta aberta, losango cheio, losango vazio, círculo cheio, círculo vazio, pé de galinha, barra, barra dupla, círculo com barra, X, semicírculo, bola com nome, barra diagonal na origem, mini losango na origem, retângulo de qualificador), pontas empilhadas na mesma extremidade (pé de galinha), 3 traços (contínuo, tracejado, pontilhado) mais linha dupla, e 7 formatos de rótulo (nome no meio, multiplicidade nas pontas, papel nas pontas, «estereótipo», `[guarda]`, `[tecnologia]`, seta de leitura). Restrições semânticas (fluxo de sequência não cruza pool, C4 sem bidirecional, mensagem UML só descendente) não são do motor, são da camada de notação, e o motor só precisa expor os dados para ela validar.

## 3. O que falta no DokDraw

### Grupo A. Necessário para as notações já prometidas no catálogo (C4, UML, BPMN, formas básicas e nuvens)

| # | Lacuna | Quem exige | Evidência no app |
| --- | --- | --- | --- |
| A1 | Pontas: triângulo vazio, losango vazio, círculo vazio, X, barra diagonal na origem, mini losango na origem, bola e semicírculo | UML generalização, realização, agregação, navegabilidade e componentes. BPMN default, condicional e mensagem | `EDGE_ENDINGS` com 5 valores, `types.ts:36` |
| A2 | Traço desacoplado da semântica: contínuo, tracejado e pontilhado escolhidos por si, e o campo `style` (sync, async, dashed) restrito ao significado C4 | BPMN reserva os três traços. UML usa tracejado sem ser assíncrono | `dashFor(relStyle)`, `c4-edge.tsx:126-130` |
| A3 | Tecnologia desenhada na linha, como segunda linha `[Tecnologia]` | C4 exige protocolo explícito entre contêineres | `c4-edge.tsx:21-30` só recebe `label` |
| A4 | Rótulos nas extremidades (dois textos por ponta: multiplicidade e papel) e rótulo junto à cauda | UML associação, atividade, DFD diálogo | um `EdgeLabelRenderer` no ponto médio, `c4-edge.tsx:304-347` |
| A5 | Laço na mesma forma | UML auto-associação, transição para o mesmo estado, mensagem para si | `sourceId === targetId` recusado, `rota:963` |
| A6 | Ponta no contorno real da forma, não no retângulo envolvente | Losango de gateway BPMN e de decisão, elipse de caso de uso, pessoa C4: hoje a seta para no canto invisível da caixa | `boxOf` e `borderPoint`, `c4-edge.tsx:159-178` |
| A7 | Curva real e correção do raio (`DDP-444`) | Formas básicas prometem "linha curva" (`DEC-0027`) | `buildPath` lê `RADIUS` em vez do parâmetro, `c4-edge.tsx:101-102` |
| A8 | Exportação fiel: SVG, PNG e draw.io lendo `styleProps` (pontas, cor, espessura, opacidade, traço) | Sem isso, tudo acima some no arquivo exportado | `export-diagram.tsx:256-258,305-314,511` |
| A9 | Inverter direção trocando também `startArrow` e `endArrow` (e os rótulos de ponta, quando existirem) | Agregação invertida troca o lado do losango | `invertRelationship`, `rota:1925-1929` |
| A10 | Rótulo padrão "usa" contraria a orientação do C4 ("avoid single words like Uses") | c4model.com Notation | `rota:971,987` |

Fora das cinco famílias, mas item 18 da `DEC-0026`: o pé de galinha do ERD, com marcador composto (mínimo e máximo na mesma ponta) e traço por metade (Barker). É a única ponta que não cabe num marcador SVG simples, por isso entra numa fase própria.

### Grupo B. Esperado por quem vem do draw.io

| # | Lacuna | Referência |
| --- | --- | --- |
| B1 | Reconectar a ponta arrastando para outra forma. O React Flow 12 entrega `onReconnect`, `reconnectable` por aresta e `reconnectRadius` | draw.io, Lucidchart, FigJam, Miro, Excalidraw, tldraw fazem |
| B2 | Porta fixa por lado (ou ponto fixo com Alt) além da flutuante, persistida na relação | draw.io fixo vs flutuante, FigJam magnet, Miro snapTo |
| B3 | Arrastar o segmento cria waypoint, sem precisar de duplo clique. Atalho para limpar pontos | draw.io waypoints, Lucidchart nós de segmento |
| B4 | Rótulo arrastável ao longo da linha e afastável dela, com os três rótulos (meio e pontas) e rotação alinhada à linha | draw.io três rótulos, Miro `textOrientation: aligned` |
| B5 | Copiar e colar estilo em conexão, e aplicar o painel a várias conexões selecionadas | draw.io Alt+C e Alt+V, Lucidchart Paint Format |
| B6 | Pulo em cruzamento (arco ou vão) | draw.io, Lucidchart, Miro, Structurizr `jump` |
| B7 | Rota "entity relation" (sai e entra pelo mesmo lado) e arredondamento de canto configurável | draw.io, Lucidchart |
| B8 | Tamanho da ponta independente da espessura. Hoje `markerUnits="strokeWidth"` faz uma linha de 8 px ter ponta de 56 px | draw.io campos Line end e Line start |
| B9 | Link, tooltip e metadados na conexão, com id visível | draw.io Edit Data, Edit Tooltip, Edit Link. Structurizr `url` e `properties` |
| B10 | Padrão de tracejado livre e animação de fluxo | draw.io Flow animation, Lucidchart "dash, gap", Mermaid `animate`, React Flow `animated` |
| B11 | Quebra de linha e edição multilinha do rótulo | draw.io, FigJam |

### Grupo C. Refinamento

| # | Lacuna | Referência |
| --- | --- | --- |
| C1 | Roteamento automático desviando de formas (A* ou ELK) sem perder os waypoints manuais | Excalidraw e tldraw elbow, `react-flow-smart-edge`, `elkjs` |
| C2 | Paralelas entre o mesmo par com deslocamento automático | nenhuma ferramenta documenta, Structurizr só permite |
| C3 | Conexão que termina em outra conexão | draw.io por forma de junção, Lucidchart |
| C4 | Texto rico no rótulo | tldraw `richText`, draw.io HTML |
| C5 | `ariaLabel` por aresta ("origem para destino: rótulo") e navegação por teclado entre conexões | React Flow acessibilidade |
| C6 | SVG exportado com `light-dark()` para os dois temas | draw.io cores adaptativas |
| C7 | Sketch e sombra | draw.io, Excalidraw roughness |
| C8 | Ponta de tamanho e recuo (ponta dentro da forma) | draw.io espaçamento negativo |

## 4. Proposta

Quatro fases com escopo fechado. Nenhuma fase escreve código aqui: o que sai é o contrato do modelo e a ordem ao Lovable, uma por fase, revisada pela sessão C (`DEC-0007`). Mudança de coluna no banco é migração, categoria `app-release`, e o humano cola o texto no Lovable.

### Fase 0. Correção do que já existe

Entra: `DDP-444` (o raio passa a ser o parâmetro, e "curvo" vira curva de fato, Catmull-Rom ou Bézier quadrática pelos waypoints, com `getBezierPath` do React Flow quando não há waypoint), exportação SVG, PNG e draw.io lendo `styleProps` (pontas nas duas extremidades, cor, espessura, opacidade, traço, roteamento com canto arredondado), `invertRelationship` trocando `startArrow` com `endArrow`, `markerUnits="userSpaceOnUse"` com tamanho fixo de ponta escalado por uma função da espessura (B8), rótulo padrão vazio em vez de "usa" (A10, o placeholder "sem rótulo" já cobre a aresta vazia).

Fica de fora: qualquer campo novo.

Custo aceito: o export do draw.io precisa de uma tabela de mapeamento `EdgeEnding` para `endArrow`/`startArrow` do mxGraph (`block`, `open`, `diamond`, `oval`, com `endFill`), que cresce em cada fase seguinte. Trocar `markerUnits` muda o visual de toda seta existente com espessura diferente de 1.6.

Modelo: sem mudança em `C4RelationshipStyle`.

Alternativa descartada: dobrar a fase 0 dentro da fase 1. Descartada porque a exportação hoje anula até o que o painel já oferece, e a correção é independente de qualquer decisão de modelo.

### Fase 1. Kit de pontas e traço para C4, UML e BPMN

Entra:

- `EDGE_ENDINGS` passa de 5 para 14 valores: `none`, `arrow` (triângulo cheio), `open` (seta aberta), `triangle` (triângulo vazio), `diamond`, `diamond_open`, `circle`, `circle_open`, `cross` (X), `bar`, `slash` (barra diagonal, BPMN default), `diamond_small` (mini losango, BPMN condicional), `ball` (interface fornecida), `socket` (semicírculo). Os cinco atuais mantêm o nome, sem migração.
- Campo novo `lineStyle: "solid" | "dashed" | "dotted"` em `C4RelationshipStyle`, com `dashPattern` derivado por espessura (o "8 6" e o "2 6" atuais escalam com `width`). O campo `style` da relação (`sync`, `async`, `dashed`) continua existindo como semântica C4 e só define o padrão de `lineStyle` quando este está ausente. Regra de conflito: `lineStyle` presente vence.
- Tecnologia desenhada como segunda linha `[Tecnologia]` no rótulo do meio, fonte um ponto menor, quando `technology` não é nulo (A3).
- Laço na mesma forma: `connectElements` aceita `sourceId === targetId` e gera três waypoints automáticos ao redor do canto superior direito, editáveis como qualquer outro (A5, modelo do exemplo "Self Connecting" do React Flow).
- Ponta no contorno real: `borderPoint` recebe a primitiva da forma (`rect`, `ellipse`, `diamond`, `person`, `cylinder`, `hexagon`) e calcula a interseção com o contorno, com o retângulo como reserva (A6).
- Painel: os seletores Início e Fim mostram o desenho da ponta, não só o nome, e ganham o seletor Traço (contínuo, tracejado, pontilhado) separado do seletor semântico, que passa a se chamar "Relação C4".

Fica de fora: rótulos de extremidade (fase 2), pé de galinha (fase 3), reconexão por arrasto (fase 2).

Custo aceito: dois campos que podem discordar (`style` e `lineStyle`) até o ADR 015 decidir se `style` sobrevive como campo ou vira tag. Cada aresta define os próprios `<marker>` em `<defs>`, e 14 formas de ponta são 14 caminhos SVG a manter em três lugares (canvas, export SVG, mapeamento draw.io). O laço em forma pequena pode cruzar o próprio rótulo.

Modelo (`C4RelationshipStyle`):

```
lineStyle?: "solid" | "dashed" | "dotted"      // novo, padrão derivado de C4Relationship.style
startArrow?: EdgeEnding                        // enum cresce de 5 para 14
endArrow?: EdgeEnding
```

Nada muda no banco: `style_props` é Json e o zod amplia o enum e adiciona `lineStyle`.

Alternativa descartada: modelar a ponta como par `{ shape, filled }` ou como string de estilo do draw.io (`endArrow=block;endFill=1`). O par exige duas chaves coerentes por ponta e complica o zod e o painel, e a string perde tipagem. O enum plano cresce, mas cada valor é um desenho e um caso de mapeamento explícito.

### Fase 2. Rótulos e interação, paridade com o draw.io

Entra:

- Três rótulos por conexão: meio (existente), origem e destino. Os dois novos são texto multilinha, então multiplicidade e papel da UML cabem em duas linhas do mesmo rótulo, sem campo próprio (A4, B4, DFD diálogo).
- Posição do rótulo do meio ao longo da linha (`labelPosition` 0 a 1) e afastamento perpendicular (`labelOffset`), arrastáveis. Os de ponta ficam a uma distância fixa da extremidade, no lado externo.
- Quebra de linha no rótulo do meio (B11): o `input` vira `textarea` de altura automática, Shift+Enter quebra.
- Reconectar ponta por arrasto: `onReconnect`, `reconnectable: true`, `reconnectRadius` 12 (B1).
- Porta fixa opcional: `sourceAnchor` e `targetAnchor` com valor `null` (flutuante, padrão) ou um dos quatro lados. Persistido na relação, não no estilo, porque muda a topologia (B2).
- Arrastar segmento cria waypoint (B3). Atalho: Alt+Shift+R limpa os pontos, como no draw.io.
- Copiar e colar estilo em conexão, e o painel aplicando a todas as conexões selecionadas (B5).
- Inverter direção troca também os rótulos de origem e destino (A9, complemento).
- «Estereótipo»: botão no rótulo do meio que envolve o texto em guillemets. Sem campo novo.

Fica de fora: pulo em cruzamento, rota entity relation, link e metadados.

Custo aceito: migração no banco (três colunas ou um Json `labels` em `relationships`, mais `source_anchor` e `target_anchor`). O export SVG e o draw.io passam a emitir três rótulos (draw.io suporta os três nativamente, como filhos da aresta). Reconexão por arrasto convive com a ponta flutuante: ao soltar sobre a forma, a porta é `null` de novo, e só vira fixa com Alt.

Modelo:

```
// C4Relationship (dados, não estilo)
sourceLabel: string | null       // novo
targetLabel: string | null       // novo
sourceAnchor: "t" | "r" | "b" | "l" | null   // novo, null = flutuante
targetAnchor: "t" | "r" | "b" | "l" | null   // novo

// C4RelationshipStyle
labelPosition?: number           // novo, 0 a 1, padrão 0.5
labelOffset?: { dx: number; dy: number }   // novo, padrão 0,0
```

Alternativa descartada: rótulos ilimitados como `captions[]` do Miro. Descartada porque os sete formatos de rótulo da seção 2.2 cabem em três posições com texto multilinha, e um array sem posição semântica complica o export e a UML (que precisa saber qual texto é a multiplicidade da origem).

### Fase 3. ERD, dados na conexão e refinamento

Entra:

- Pontas do pé de galinha como marcador composto: `er_one`, `er_many`, `er_zero_one`, `er_one_only`, `er_zero_many`, `er_one_many` (nomes na linha do draw.io e do Miro). Cada um é dois desenhos empilhados no mesmo `<marker>`. Linha dupla do Chen como `lineStyle: "double"`.
- Traço por metade (Barker): `lineStyleSource` e `lineStyleTarget` opcionais, que sobrepõem `lineStyle` na metade correspondente.
- Link, tooltip e metadados (`url`, `tooltip`, `properties` como no Structurizr) na relação (B9).
- Pulo em cruzamento (B6), calculado só entre segmentos retos, como o Miro.
- Rota entity relation (B7).
- `ariaLabel` por aresta e tema nos dois modos no SVG exportado (C5, C6).
- Animação de fluxo (B10) como `animated: boolean` do React Flow, sem duração configurável.

Fica de fora: roteamento automático com desvio (C1), paralelas com deslocamento (C2), conexão em conexão (C3), texto rico (C4), sketch (C7). Cada um depende de biblioteca ou de modelo de dados novo e espera pedido explícito.

Custo aceito: o marcador composto não tem equivalente 1 para 1 em todos os exports (o draw.io tem `ERmany` e família, o SVG puro precisa de dois `<marker>` ou um caminho combinado). Pulo em cruzamento é O(n²) nos segmentos e precisa de limite (por exemplo, desligado acima de 200 conexões na visão).

Modelo:

```
// C4RelationshipStyle
lineStyle?: "solid" | "dashed" | "dotted" | "double"
lineStyleSource?: ... | null     // novo, metade da origem (Barker)
lineStyleTarget?: ... | null
jumps?: boolean                  // novo
animated?: boolean               // novo
// EdgeEnding ganha os seis er_*
// C4Relationship
url: string | null, tooltip: string | null, properties: Record<string, string>
```

## 5. Alternativas descartadas

| Alternativa | Por que foi descartada | O que custaria |
| --- | --- | --- |
| Trocar o `C4Edge` por uma biblioteca de aresta (`react-flow-smart-edge`, `SmartEditableEdge`) | A biblioteca resolve rota, não ponta, rótulo nem persistência. O DokDraw já tem waypoints próprios e ponta flutuante decididos em `DDP-345` a `DDP-348` | Reescrever o que existe para ganhar só o desvio de formas, que é item C1 |
| Adotar o motor de seta do tldraw ou do Excalidraw | Viola o ADR 001 (React Flow como motor) | Reabrir o ADR 001 |
| Modelar a ponta como `{ shape, filled, size }` | Dois ou três campos por extremidade para manter coerentes no zod, no painel e nos três exports | Menos valores no enum, mais regras de validação. Pode ser revisitado no ADR 015 se o formato gravado preferir composição |
| Guardar o estilo como string no formato do draw.io | Sem tipagem, sem zod, sem enum no painel | Export para draw.io trivial, todo o resto pior |
| Rótulos ilimitados (`captions[]`) | Ver fase 2 | Export e UML sem posição semântica |
| Bloquear seta bidirecional para seguir o C4 | O Structurizr proíbe, mas UML, DFD e BPMN (associação Both) precisam. A regra é da camada de notação, não do motor | Um aviso no painel quando a visão é C4, nada no modelo |
| Roteamento automático (ELK ou A*) já na fase 1 | Conflita com waypoints manuais persistidos e com a ponta flutuante. Nenhuma ferramenta com waypoint manual documenta os dois juntos, exceto o elbow do Excalidraw, que trava segmentos um a um | Fica em C1 até haver pedido |
| Ponta com tamanho configurável por conexão (C8) | Nenhuma notação exige. A regra do kit (`DDP-345` a `348`) diz sem redimensionamento | Um campo a menos |

## 6. Riscos

1. `style` e `lineStyle` em conflito durante a fase 1 até o ADR 015 fechar o formato gravado (`adrs/_work/FICHA-ADR015-formato-gravado.md`). Mitigação: regra de precedência escrita no tipo e no zod.
2. Cada aresta declara os próprios `<marker>` em `<defs>` (hoje já é assim). Com 14 pontas e 200 conexões são 400 `<marker>` no DOM. Sem medição. Alternativa se pesar: `<defs>` global por combinação de ponta e cor.
3. Trocar `markerUnits` para `userSpaceOnUse` altera o desenho de toda conexão existente com espessura fora do padrão. Precisa de captura de tela antes e depois na visão de referência.
4. O export para draw.io é o mais frágil: cada ponta nova exige um valor `endArrow` conhecido pelo mxGraph, e o pé de galinha composto muda de nome entre versões (`ERmany`, `ERoneToMany`). Sem teste automatizado de export hoje.
5. O contorno real (A6) depende de uma função de interseção por primitiva. O inventário prevê oito primitivas novas (`DEC-0027`), e cada uma precisa da sua.
6. Reconexão por arrasto (B1) e a seta lateral do hover disputam o mesmo gesto nas bordas do nó. Precisa de teste manual na visão de referência antes de publicar.
7. A migração da fase 2 (rótulos e portas) é a primeira mudança de coluna em `relationships` desde `style_props`. Categoria `app-release`, e passa pelo humano.
8. A pesquisa sobre Lucidchart, FigJam e Miro veio de páginas de ajuda que bloqueiam leitura direta ou exigem JavaScript, lida por API do help center ou por trechos de busca. Onde diz "s/e", pode existir o recurso sem documentação pública.
9. Este estudo não mediu o que o Lovable consegue implementar por ordem. Fase 1 tem seis entregas, e pode precisar de duas ordens.

## Resumo para o humano

A seta do DokDraw já cobre o kit básico da `DEC-0027` (reta, ortogonal, curva, cheia, aberta, losango, nenhuma, contínua e tracejada), mas não cobre UML nem BPMN, e o que ela tem some na exportação. As cinco lacunas que mais pesam:

1. Só 5 pontas, todas cheias. UML precisa de triângulo e losango vazios e X, BPMN de círculo vazio, barra diagonal e mini losango na origem.
2. O traço está preso ao significado C4: pontilhado só existe como "assíncrono", e BPMN reserva os três traços para coisas diferentes.
3. Um rótulo só, no meio. UML pede multiplicidade e papel nas pontas, C4 pede `[Tecnologia]`, que existe no banco mas não é desenhada.
4. Exportação SVG, PNG e draw.io ignora cor, espessura, pontas e traço (`export-diagram.tsx:256-314,511`), e a curva usa raio 10 fixo (`DDP-444`).
5. Sem reconectar ponta por arrasto, sem laço na mesma forma, e a ponta encosta no retângulo envolvente, não no losango ou na elipse.

Recomendação: começar pela fase 0 (correções sem campo novo, uma ordem ao Lovable) e emendar a fase 1 (14 pontas, `lineStyle` separado do `style`, tecnologia na linha, laço, contorno real). As duas não mexem no banco. Rótulos de ponta e reconexão ficam para a fase 2, que exige migração e aprovação sua. Pé de galinha, link e pulo em cruzamento ficam para a fase 3.

Pergunta: aprova a fase 0 e a fase 1 como duas ordens seguidas ao Lovable, ou prefere só a fase 0 até o ADR 015 fechar o formato gravado da conexão?
