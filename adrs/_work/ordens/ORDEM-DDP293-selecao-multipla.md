# Ordem DDP-293: seleção múltipla, Ctrl+A, mover com as setas e sem atribuição do React Flow

Issue da ordem: `DDP-301`, rótulo `lovable`.

Prioridade 1, itens 1, 4 e 5 de `adrs/_work/ANALISE-editor-o-basico.md`. Pré-requisito da ordem de desfazer e refazer (`DDP-294`).

## Estado atual

Medido em `src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx` e `src/components/editor/diagram-canvas.tsx`, no app `dok-draw-app`. A seleção é um único id: `const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)`, passado ao `FlowCanvas` como `selectedId`/`onSelect`. Copiar, recortar, colar e duplicar (`copyNode`, `pasteAt`, `handleDeleteSelection`) operam sempre sobre esse único id. `ReactFlow` em `diagram-canvas.tsx` já usa `snapGrid={[20, 20]}`, sem `proOptions`.

## O que fazer

**1. Seleção múltipla.** Trocar o id único por um conjunto de ids selecionados. Caixa de seleção ao arrastar no vazio do quadro (não sobre uma forma), Shift+clique soma ou tira um elemento da seleção sem limpar o resto, clique simples no vazio limpa a seleção, Ctrl+A (Cmd+A no Mac) seleciona todos os elementos da vista atual. O React Flow tem suporte nativo a isso (seleção por arrasto e clique com tecla modificadora); prefira o mecanismo da biblioteca a reimplementar do zero, e adapte o estado da rota para refletir o conjunto que o React Flow reporta.

**2. Ações em lote.** Excluir, copiar, recortar, colar e duplicar (Ctrl+D) passam a valer para a seleção inteira, não só para o último elemento clicado. Colar mantém a posição relativa entre os elementos copiados. Duplicar aplica o mesmo deslocamento fixo que já existe hoje (`+40, +40`) a cada elemento da seleção, preservando a posição relativa entre eles.

**2b. Arrastar o grupo com o mouse.** Hoje `onNodeDrag` e `onNodeDragStop`, em `diagram-canvas.tsx`, mandam para `onMoveNodes` e `onCommitNodes` só o nó que recebem no segundo parâmetro. Com seleção múltipla, o React Flow arrasta o grupo inteiro e manda todos os nós movidos no terceiro parâmetro. Os dois passam a mandar as posições de todos os nós desse terceiro parâmetro. Sem isso, os outros elementos do grupo voltam para o lugar assim que o estado da rota pinta de novo.

**2c. Área de transferência com vários itens.** Hoje o `Clipboard` guarda um item só, sem posição. Ele passa a guardar uma lista, e cada item leva o deslocamento dele em relação ao canto superior esquerdo da caixa da seleção copiada. `copyNode` passa a copiar a seleção inteira, e `pasteAt` passa a colar a lista a partir de um ponto de destino, somando o deslocamento de cada item. Duplicar é copiar e colar a lista com o ponto de destino deslocado em `+40, +40`. `pasteAt` devolve os ids criados, na mesma ordem da lista, como a `DDP-295` já pede para o caso de um item.

**3. Mover com o teclado.** Com a seleção não vazia e o foco fora de campo de texto, as quatro setas do teclado movem a seleção inteira em 1 pixel por toque. Com Shift, o passo é o da grade (`20`, o mesmo valor de `snapGrid`). O movimento por teclado usa o mesmo caminho de gravação otimista que o arrasto de mouse já usa hoje (pintar antes, persistir depois).

**4. Sem a atribuição do React Flow.** `proOptions={{ hideAttribution: true }}` no componente `ReactFlow`. A licença MIT permite ([reactflow.dev/learn/troubleshooting/remove-attribution](https://reactflow.dev/learn/troubleshooting/remove-attribution)).

## O que não fazer aqui

- Desfazer e refazer: `DDP-294`, ordem separada, que depende desta.
- Setas de conexão ao passar o mouse: `DDP-295`, ordem separada.
- Colar imagem externa: `DDP-296`, ordem separada.
- Alinhar, distribuir, travar elemento, clonar com Alt: prioridade 2 de `ANALISE-editor-o-basico.md`, fora desta ordem.
- Nenhuma migração, nenhuma tabela nova, nenhuma política RLS. Todo o trabalho é de estado do cliente e de props do `ReactFlow`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: `@xyflow/react`, com nodes e edges controlados pelo estado do app | Item 1: a seleção que o React Flow reporta (`onSelectionChange`) vira o conjunto de ids no estado da rota. Nada passa a modo não controlado |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova. Seleção múltipla e `proOptions` são do `@xyflow/react` já instalado |

## Verificação

A sessão C confere no preview: seleção por arrasto, Shift+clique, Ctrl+A, arrastar um grupo selecionado com o mouse e ver todos ficarem onde caíram depois de recarregar, copiar e colar três elementos e ver a posição relativa mantida, exclusão/cópia/colagem/duplicação em lote, movimento por seta do teclado com e sem Shift, e a ausência da marca do React Flow no canto do quadro.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não remova nem altere o selo do Lovable: é ação do humano nas configurações de publicação, fora do código.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
