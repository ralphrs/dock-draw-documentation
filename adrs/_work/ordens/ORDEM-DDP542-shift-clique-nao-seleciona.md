# Ordem: Shift+clique não entra na seleção de nós (RT-C02)

**Issue da ordem:** `DDP-574`. Relato original: `DDP-542`, caso RT-C02.

**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação nesta ordem.

## Por que

Medido no preview: clicar num elemento seleciona ele sozinho. Shift+clique num segundo elemento deveria acrescentar à seleção (painel mostra 2). Não funciona: o segundo elemento nunca entra.

Causa achada em leitura direta do código, branch main, HEAD `766274c`. `<ReactFlow>` em `src/components/editor/diagram-canvas.tsx` roda em modo totalmente controlado (a prop `nodes` recebe `rfNodes` na linha 559, com `selected` calculado na linha 204 a partir do estado da rota) e não recebe `onNodesChange`. Na versão instalada do `@xyflow/react` (12.11.6), entrar na seleção com tecla de multi-seleção ativa (`addSelectedNodes`, `index.js` 3576-3580) só monta a mudança e a repassa via `onNodesChange`. Sem esse prop, a mudança é descartada em silêncio. Sair da seleção usa outro caminho (`unselectNodesAndEdges`, que muta o `nodeLookup` direto e chega ao app por `onSelectionChange`), e por isso o sintoma aparece só ao entrar.

O comentário das linhas 591-592 documenta a decisão original: fora do modo de conexão, a seleção de nós fica por conta do clique nativo do React Flow. Para a entrada por tecla modificadora, esse mecanismo está quebrado. Conexões não dependem dele: `onEdgeClick` (609-614) faz o toggle por conta própria, com `event.shiftKey`.

## Revisão da sessão C e o que a ordem decidiu

A C confirmou o diagnóstico e corrigiu duas citações (a linha em que a prop `nodes` recebe `rfNodes` é 559, não 204). Também levantou que o toggle novo colidiria com a saída da seleção que o React Flow já faz, porque o `handleNodeClick` rodaria no mousedown e o `selecionados` do click já viria alterado. A ordem verificou isso no código instalado e **não confirma a colisão no caso comum**:

- O `nodeDragThreshold` padrão é 1 (`@xyflow/react` `index.js:3331`), e o app não o define (nenhuma ocorrência em `src`). Com limiar maior que zero, `XYDrag` só chama `startDrag`, e portanto o `onNodeMouseDown`, depois que o ponteiro anda mais que 1 px (`@xyflow/system` `index.js` 2279-2309).
- Nesse caso o `handleNodeClick` roda dentro do próprio handler de click do nó, imediatamente antes do `onNodeClick` do app (`onSelectNodeHandler`, `@xyflow/react` `index.js` 2282-2295, condição `nodeDragThreshold > 0`). Não há render entre os dois, então o `selecionados` lido no `onNodeClick` ainda é o de antes do clique.
- A saída pelo React Flow chega ao app só depois, pelo `SelectionListener` (efeito, `index.js` 148-175). Ela e o toggle chegam ao mesmo resultado.
- Um clique com movimento maior que 0 px é descartado pelo d3-drag (`nodeClickDistance` 0, `system` linha 2272), então o `onNodeClick` nem dispara. Fica a lacuna de um Shift+clique com tremor de mais de 1 px num nó não selecionado, que a entrada descarta. Comportamento aceito nesta ordem.
- Nó travado (`draggable: false`, linha 206): o `handleNodeClick` roda no click, no mesmo handler, na mesma ordem. Vale o mesmo raciocínio.

A conclusão é de leitura estática, sem preview. A verificação abaixo é o teste real, e o item 4 é o plano B se ela reprovar.

## O que fazer

**1. Toggle próprio no `onNodeClick`, espelhando o padrão de `onEdgeClick`.** Em `diagram-canvas.tsx`, no bloco `onNodeClick` (590-594), fora do ramo de conexão (`connectFrom` e `connectArmed`): se `event.shiftKey`, `event.ctrlKey` ou `event.metaKey` estiver ativo, alternar o nó clicado sobre a lista `selecionadosRef.current` e chamar `onSelect` com a lista resultante de ids de nó (o nó sai se já estava, entra no fim se não estava). A lista de relações passa como `selecionadosRelRef.current`, sem alteração. O id vem do mesmo campo já usado no ramo de conexão, `node.data.element.id`. Sem tecla modificadora, o `onNodeClick` continua sem seleção própria, como hoje.

**2. Proteger a premissa.** Um comentário de uma linha acima do toggle diz que ele lê a seleção anterior ao clique e que isso vale só com `nodeDragThreshold` maior que zero (padrão). Não definir `nodeDragThreshold` como 0 neste componente.

**3. Não mexer no laço de seleção nem no `multiSelectionKeyCode`.** O laço de arrasto usa caminho próprio. `multiSelectionKeyCode` continua com as três teclas, porque ainda governa o laço e a saída da seleção pelo React Flow.

**4. Plano B, só se a verificação reprovar a saída.** Se no preview o Shift+clique num nó selecionado o reacrescentar em vez de tirá-lo, trocar o toggle por um `onNodesChange` que trate apenas mudanças do tipo `select` (nada de dimensões nem posição), calculando a nova lista a partir de `selecionadosRef.current` e chamando `onSelect`. Registrar no resultado que o plano B foi usado e por quê. Sem falha observada, não implementar.

**5. Conferir** no preview e escrever cada resultado no comentário `Lovable: resultado`:

* Clique simples seleciona só o elemento clicado.
* Shift+clique num segundo elemento: painel mostra 2.
* Shift+clique de novo nesse segundo: painel volta a mostrar só o primeiro. Esta é a saída que a sessão C pediu para provar.
* Cmd+clique (macOS) e Ctrl+clique (Windows ou Linux) repetem os três passos. No macOS, Ctrl+clique abre o menu de contexto e não conta como click: o caminho é `onNodeContextMenu` (615-619), que só seleciona o nó se ainda não estiver selecionado. Não testar Ctrl+clique no macOS.
* O mesmo com um nó travado.
* Laço de seleção e seleção de conexões continuam como antes.

**Lacuna declarada.** Um teste anterior (`DDP-512b`) registrou Ctrl/Cmd+clique como funcionando, e o mesmo caminho quebrado vale para Shift, Ctrl e Meta. Não foi possível reconciliar por leitura de código. A correção resolve as três teclas de qualquer forma. Se o Lovable observar que Ctrl/Cmd+clique já funcionava antes desta ordem, registrar no resultado, sem investigar a causa.

## O que não fazer aqui

* Não mudar o comportamento de seleção de conexões (`onEdgeClick`), já correto.
* Não adicionar `onNodesChange` ou `onEdgesChange` genéricos ao `<ReactFlow>`. O plano B do item 4 é a única exceção, e só com filtro de `select`.
* Não mexer no laço de seleção nem no menu de contexto.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| ADR 001: nós e edges controlados pelo estado do app | Toggle passa pelo `onSelect` já existente, sem mecanismo paralelo |
| Nenhuma migração, nenhuma dependência nova | Confirmado |
