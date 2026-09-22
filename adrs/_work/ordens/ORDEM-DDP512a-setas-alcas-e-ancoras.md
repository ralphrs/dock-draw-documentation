# Ordem DDP-512a: setas, pontos de conexão, âncora gravada e reconexão

**Issue:** `DDP-512` (relato do humano em 2026-09-22, parte "Setas"). Depende da `DDP-453` (fase 0 da seta), que cria `src/domain/c4/edge-path.ts`. Esta ordem só roda depois da 453 estar no preview.
**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação nesta ordem.

## Por que

Quatro causas achadas no código explicam o relato:

- A conexão é flutuante. `C4Edge` (`src/components/editor/c4-edge.tsx`, linhas 200 a 205) ignora a alça onde a pessoa soltou e calcula o ponto de saída com `borderPoint`, na direção do centro do outro nó. Por isso a seta nunca sai de onde foi ligada.
- Só existem quatro alças por forma, uma no meio de cada lado (`SIDES` em `src/components/editor/c4-node.tsx`), e `connectionRadius={45}` em `diagram-canvas.tsx` puxa a ligação para uma alça longe do ponteiro.
- Não há reconexão. O React Flow 12 oferece `edgesReconnectable` e `onReconnect`, e o app não usa.
- O roteamento ortogonal (`orthogonalize`, `c4-edge.tsx`, linhas 33 a 45) quebra no meio de qualquer segmento diagonal, sem olhar de que lado a seta sai nem entra.

O ponto de quebra (waypoint) já existe: duplo clique na linha cria, duplo clique no ponto remove, arrastar move (linhas 285 a 297). Ninguém descobre isso sem ler o código.

## O que fazer

**1. Dezesseis pontos de conexão por forma.** Em `c4-node.tsx`, trocar `SIDES` por `PONTOS`: para cada lado (`t`, `r`, `b`, `l`) três pontos em 0,25, 0,5 e 0,75 do comprimento, mais os quatro cantos. Id da alça de origem `{lado}:{t}` (exemplo `r:0.5`, canto `tr`), alça de destino `t-{lado}:{t}`. Posição por `style={{ left: "25%" }}` (ou `top`) sobre a `Position` do lado. Visual do ponto (`.c4-handle-source` em `src/styles.css`): quadrado 8×8, raio 1, fundo `var(--card)`, borda 2px `var(--ring)`, visível no hover do nó e com o nó selecionado, como hoje. Ponto sob o ponteiro: 10×10 e fundo `var(--ring)`. Os cantos são alças, não pegadores de redimensionar: o `NodeResizer` continua com os dele, 8×8 em `ring`. Em `diagram-canvas.tsx`, `connectionRadius={45}` vira `20`.

**2. Âncora gravada na conexão.** Em `onConnect` (`diagram-canvas.tsx`), passar `conn.sourceHandle` e `conn.targetHandle` para `onConnectElements(source, target, sourceHandle, targetHandle)`. Em `connectElements` (rota `projetos.$projectId.diagramas.$viewId.tsx`, linhas 963 a 1010), converter cada id de alça em `{ side, t }` (canto `tr` vira `{ side: "t", t: 1 }`) e gravar em `styleProps.sourceAnchor` e `styleProps.targetAnchor`, tanto no provisório quanto no `createRelationship`. `style_props` é Json sem contrato de banco, então não há migração. Conexão criada pela seta do painel ou pelo clique (`handleConnectClick`) fica sem âncora e continua flutuante.

Em `src/domain/c4/edge-path.ts` (criado pela 453), exportar `anchorPoint(box, anchor)`: ponto do contorno do lado `side` na fração `t`. Em `C4Edge`, `start` usa `anchorPoint` quando `sp.sourceAnchor` existe e `borderPoint` quando não, o mesmo para `end`. A exportação SVG, PNG e draw.io (`export-diagram.tsx`) calcula início e fim pela mesma função, para o arquivo exportado sair igual à tela. No draw.io, âncora vira `exitX`, `exitY`, `entryX`, `entryY` no estilo da aresta.

**3. Reconexão pela ponta.** Em `<ReactFlow>`: `edgesReconnectable`, `reconnectRadius={20}`, `onReconnect={(edge, conn) => onReconnectEdge(edge.id, conn)}`. Cada item de `rfEdges` recebe `reconnectable: true`. Na rota, `onReconnectEdge` chama `patchRelComHistorico` com `sourceId` e `targetId` novos (ids de elemento, não de nó) e as âncoras do item 2, num só passo de desfazer. Soltar fora de qualquer alça não apaga a conexão: `onReconnectEnd` sem conexão nova deixa tudo como estava. Estilo do pegador da ponta (`.react-flow__edgeupdater`): círculo r 6, fundo `var(--card)`, borda 2px `var(--ring)`, visível só com a conexão selecionada.

**4. Setas grandes e translúcidas fora da forma.** As quatro setas de hover (`c4-handle-arrow` e `.c4-arrow-glyph`) viram triângulos cheios, 40px de base por 28px de altura, apontando para fora, a 12px do contorno, uma no meio de cada lado. Cor `var(--primary)` com opacidade 0,25, e 0,9 quando o ponteiro está sobre a seta. Sem borda, sem chevron. Comportamento mantido: clique clona e conecta, arrastar puxa uma conexão (ordem `DDP-295`). As setas ficam fora da área do nó, então o `div` do nó precisa de `overflow: visible` e a área de hover inclui a faixa das setas (`padding` negativo não serve, usar um wrapper com `inset: -44px` e `pointer-events` só nas setas).

**5. Ponto de quebra visível e no menu.** No menu de contexto da conexão (`diagram-canvas.tsx`, `kind: "edge"`): "Adicionar ponto aqui", que insere um waypoint na posição do clique com `nearestSegment`, e, quando o clique cai sobre um waypoint, "Remover ponto". Os waypoints aparecem com a conexão selecionada e também no hover da linha, r 6. Duplo clique continua funcionando. Dica no rodapé do painel Detalhes da conexão: "Duplo clique na linha adiciona um ponto. Duplo clique no ponto remove."

**6. Sem o X na linha.** Apagar o botão `×` de `c4-edge.tsx` (linhas 349 a 363). Excluir fica pela tecla Delete, pelo menu de contexto "Excluir conexão" e pelo painel. `data.onDelete` continua existindo para o menu.

**7. Roteamento ortogonal por lado.** Reescrever `orthogonalize` em `edge-path.ts` com as âncoras: o primeiro segmento sai perpendicular ao lado de origem por 20px, o último entra perpendicular ao lado de destino por 20px. Entre os dois trechos: lados opostos horizontais (`l`/`r`) quebram em `midX`, lados verticais (`t`/`b`) em `midY`, lados mistos fazem um único cotovelo em `(fim.x, início.y)` quando a origem é `l`/`r` e `(início.x, fim.y)` quando é `t`/`b`. Sem âncora, o lado é o que `borderPoint` toca. Com waypoints, cada waypoint é respeitado como hoje. O raio de canto continua o de `buildPath`.

**8. Atraso ao conectar, medido.** Em `connectElements` a conexão provisória entra no estado antes da chamada ao servidor, então o atraso vem de outro lugar. Instrumentar no preview com `performance.now()` entre `onConnect` e a primeira pintura da aresta (`requestAnimationFrame` depois do `setModel`), com dois nós já gravados e com um nó recém-criado. Registrar os dois números no "Resultado". Suspeitos, em ordem: `rfEdges` depende de `nodeIdByElement`, que é refeito a cada mudança em `nodes`, o `await Promise.all` de `idReal` quando um dos nós ainda não tem id real, e o `queueMicrotask` de `handleSelectionChange`. Corrigir o que a medição apontar e escrever a causa achada, não a estimada.

**9. Conferir** no preview: ligar `r:0.25` de A em `l:0.75` de B, a seta sai e chega exatamente nesses pontos, sobrevive a recarregar a página e sai igual no SVG exportado. Pegar a ponta de destino e soltar em C, a conexão muda de destino e Ctrl+Z volta. Rota ortogonal entre A à esquerda e B à direita desenha três segmentos. Botão direito na linha adiciona e remove ponto. Nenhum X na conexão selecionada.

## O que não fazer aqui

- Não mexer em `EDGE_ENDINGS`, pontas nem traços. Isso é a fase 1 (`DDP-454`).
- Não mudar rótulo, painel de propriedades nem seleção múltipla. Isso é a ordem `DDP-512b`.
- Não criar coluna nova em `relationships`. Âncora vai em `style_props`.
- Não mexer em migração, política RLS nem `.env*`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| `style_props` é Json sem contrato de banco (ADR 003) | Âncoras gravadas ali, sem migração. O ADR 015 pode mover para coluna própria depois, com custo declarado |
| Formato gravado da conexão fica para o ADR 015 | A ordem grava só `sourceAnchor` e `targetAnchor`, com o formato anotado na `DDP-512` para o ADR herdar |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project`. Publicar entra num card `app-release` |
| Kit de seleção da sessão A: anel 2,5px em `ring` | Pontos e pegadores usam `ring`, tamanho fixo em px |
