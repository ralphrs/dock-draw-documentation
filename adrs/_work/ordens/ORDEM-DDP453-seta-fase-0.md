# Ordem DDP-453: seta, fase 0, correção do que já existe

**Issue:** `DDP-453`. Fase 0 da proposta aprovada pelo humano na `DDP-348` em 2026-09-22 (estudo em `adrs/_work/ESTUDO-seta-possibilidades.md`, seção 4). Inclui o defeito `DDP-444`.
**App:** `dok-draw-app`. Sem migração, sem campo novo no modelo, sem dependência nova, sem publicação nesta ordem.

## Por que

A janela de propriedades já oferece cor, espessura, opacidade, rota e ponta nas duas extremidades (`C4RelationshipStyle`, `src/domain/c4/types.ts`, linhas 39 a 49), mas três partes do app ignoram isso: a rota curva desenha igual à ortogonal (`DDP-444`), a exportação usa um marcador fixo e uma polilinha reta para toda conexão, e inverter a direção troca origem e destino sem trocar as pontas. Esta ordem corrige o que existe. Campo novo e ponta nova ficam para a fase 1, depois da prancha da sessão D.

## O que fazer

**1. Caminho da conexão num módulo só.** Criar `src/domain/c4/edge-path.ts` e mover para lá, sem mudar o comportamento, `orthogonalize` (linhas 33 a 45 de `src/components/editor/c4-edge.tsx`), `buildPath` (linhas 90 a 116) e `midpoint` (118 a 124). Exportar também `pathFor(points, routing)`, que decide o caminho pela rota: `straight` chama `buildPath(points, 0)`, `orthogonal` chama `buildPath(orthogonalize(points), 10)`, `curved` segue o item 2. O canvas (`c4-edge.tsx`, linhas 208 e 209) e a exportação (item 3) passam a chamar `pathFor`.

**2. Curva de verdade (`DDP-444`).** Em `buildPath`, trocar `RADIUS` por `radius` nas linhas 101 e 102, que é o defeito registrado. Para a rota `curved`, `pathFor` não usa `buildPath`: sem waypoint, usa `getBezierPath` de `@xyflow/react` com `sourceX`, `sourceY`, `targetX`, `targetY` e as posições dos lados que a ponta flutuante já calcula (`borderPoint`), e com um ou mais waypoints usa uma spline Catmull-Rom convertida em Bézier cúbica passando por todos os pontos (tensão 0,5). O `midpoint` do rótulo continua sendo o meio da polilinha original, para não mudar onde o rótulo fica.

**3. Exportação lendo o estilo inteiro.** Em `src/components/editor/export-diagram.tsx`:

- SVG e PNG (`buildSvg`, linhas 209 a 330): tirar o marcador único `#arrow` (linhas 256 a 258). Para cada relação, montar `sp = { ...DEFAULT_RELATIONSHIP_STYLE, ...(rel.styleProps ?? {}) }` e emitir dois `<marker>` próprios em `<defs>`, com id `exp-start-${rel.id}` e `exp-end-${rel.id}`, com o mesmo desenho do canvas. Para isso, mover o desenho das cinco pontas de `EdgeMarker` (`c4-edge.tsx`, linhas 60 a 69) para `src/domain/c4/edge-markers.tsx`, uma função `markerShape(kind, color)` que devolve o elemento SVG, e usar essa função nos dois lugares. O `<path>` da relação usa `pathFor` do item 1 com a rota de `sp.routing`, `stroke` igual a `sp.color` resolvido pelo `colors.resolve` ou `edgeColor` quando nulo, `strokeWidth` igual a `sp.width`, `strokeOpacity` igual a `sp.opacity`, o `strokeDasharray` que já existe pela `rel.style`, `markerStart` só quando `sp.startArrow` não é `none` e `markerEnd` só quando `sp.endArrow` não é `none`. O rótulo mantém a posição e o tamanho de hoje.
- draw.io (`exportViewAsDrawio`, linhas 505 a 513): montar o estilo da aresta a partir de `sp`. Tabela de pontas, igual para `startArrow`/`startFill` e `endArrow`/`endFill`: `none` vira `none`, `arrow` vira `block` com `Fill=1`, `open` vira `open` com `Fill=0`, `diamond` vira `diamond` com `Fill=1`, `circle` vira `oval` com `Fill=1`. Rota: `straight` vira `edgeStyle=none;`, `orthogonal` vira `edgeStyle=orthogonalEdgeStyle;rounded=1;`, `curved` vira `edgeStyle=none;curved=1;`. Mais `strokeWidth=${sp.width};opacity=${Math.round(sp.opacity * 100)};strokeColor=${hex(sp.color ?? "var(--edge)", "#8a8a8a")};` e o `dashed=1;` que já existe.

**4. Inverter troca as pontas.** Em `invertRelationship` (`src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx`, a função que chama `patchRelComHistorico` com `sourceId` e `targetId` trocados): incluir no mesmo patch `styleProps: { ...rel.styleProps, startArrow: rel.styleProps.endArrow ?? DEFAULT_RELATIONSHIP_STYLE.endArrow, endArrow: rel.styleProps.startArrow ?? DEFAULT_RELATIONSHIP_STYLE.startArrow }`. Se `patchRelComHistorico` não aceita `styleProps`, usar a mesma função que a janela de propriedades já usa para gravar o estilo, no mesmo passo de histórico, para que um único "desfazer" reverta a inversão inteira.

**5. Ponta com tamanho estável.** Em `EdgeMarker` (`c4-edge.tsx`, linhas 70 a 80) e nos marcadores do item 3: `markerUnits="userSpaceOnUse"`, com `markerWidth` e `markerHeight` iguais a `8 + 2 * sp.width`. Com a espessura padrão 1,6 o resultado é 11,2px, o mesmo tamanho de hoje, e com espessura 4 a ponta fica com 16px em vez de 28px. `refX` e `refY` continuam em unidades do `viewBox`. O acréscimo de 0,8 na espessura quando a conexão está selecionada (linha 273) deixa de crescer a ponta, o que é o comportamento desejado.

**6. Rótulo padrão vazio.** Em `connectElements` (mesma rota, linhas 971 e 988), `label: "usa"` vira `label: ""` nos dois lugares. O texto de apoio "sem rótulo" em itálico (`c4-edge.tsx`, linhas 335 a 346) já cobre a conexão vazia quando selecionada. Se a validação de `createRelationship` exigir texto não vazio, relaxar para aceitar string vazia, sem tocar na coluna.

**7. Conferir** no preview, com um diagrama de três nós e três conexões (reta com ponta `open` nas duas pontas, ortogonal tracejada com cor e espessura 3, curva com um waypoint): a curva é visivelmente diferente da ortogonal, a ponta da conexão de espessura 3 não fica gigante, inverter a curva troca as pontas, o SVG exportado abre no navegador igual ao canvas (cor, espessura, pontas, traço, rota), o draw.io exportado abre em app.diagrams.net com as mesmas pontas e rotas, e uma conexão nova nasce sem texto.

## O que não fazer aqui

- Não acrescentar valor a `EDGE_ENDINGS` nem campo a `C4RelationshipStyle`. Isso é a fase 1, depois da prancha da sessão D.
- Não mudar a posição, o fundo nem a edição do rótulo.
- Não mexer em migração, política RLS nem `.env*`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| `style_props` é Json sem contrato de banco (ADR 003) | Nenhum campo novo, nenhuma migração |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project` nesta ordem. Publicar entra num card `app-release` |
| Formato gravado da conexão fica para o ADR 015 | A ordem não decide modelo, só corrige leitura e escrita do que existe |
