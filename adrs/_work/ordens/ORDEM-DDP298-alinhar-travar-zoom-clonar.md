# Ordem DDP-298: alinhar, distribuir, atalhos de zoom, travar e clonar com Alt

Prioridade 2, itens 9 a 12 de `adrs/_work/ANALISE-editor-o-basico.md`. Depende da `DDP-293` (seleção múltipla): alinhar e distribuir operam sobre o conjunto que aquela ordem introduz.

## Estado atual

`src/components/editor/diagram-canvas.tsx` (app `dok-draw-app`) já importa `fitView` e `zoomTo` do `useReactFlow()`, hoje só acionados pelo menu. Nenhum elemento tem estado de trava. Zoom por atalho de teclado não existe, só pelo menu.

## O que fazer

**1. Alinhar e distribuir, sobre a seleção.** Alinhar move os elementos selecionados para a borda ou o centro comum: esquerda, centro (horizontal), direita, topo, meio (vertical), base. Distribuir espaça igualmente os elementos entre o primeiro e o último da seleção, no eixo escolhido, horizontal ou vertical, sem mexer nos dois extremos. Os dois pedem pelo menos dois elementos selecionados para alinhar e três para distribuir; com menos, a ação fica sem efeito. Gravação pelo mesmo caminho de `commitNodes` que o arrasto já usa.

**2. Atalhos de zoom e navegação.** Ctrl+mais e Ctrl+menos (Cmd no Mac) aumentam e diminuem o zoom em um passo fixo. Ctrl+0 volta a 100%. Ctrl+Shift+H aciona `fitView`. Segurar Espaço e arrastar move o quadro (pan), mesmo sobre um elemento, sem mover o elemento nem abrir a caixa de seleção que a `DDP-293` introduz: enquanto Espaço está pressionado, arrastar no vazio ou sobre um elemento sempre move a câmera.

**3. Travar elemento, Ctrl+L.** Alterna a trava do elemento selecionado (ou de cada elemento da seleção, se houver mais de um). Guardado em `style.locked` (campo novo em `C4ElementStyle`, dentro do JSONB que a tabela já tem, sem migração). Elemento travado não se move por arrasto nem por seta do teclado, não redimensiona (`NodeResizer` fica invisível mesmo selecionado), e continua selecionável, copiável e com o texto editável. As setas de conexão da `DDP-295`, se já estiverem no app quando esta ordem rodar, não aparecem sobre elemento travado, fechando a condição que aquela ordem deixou sem efeito.

**4. Clonar arrastando com Alt.** Segurar Alt e começar a arrastar um elemento cria uma cópia dele na posição original (mesmos campos que `copyNode` já copia) e arrasta a cópia, deixando o original no lugar. Solto o botão, a cópia fica onde caiu, gravada pelo mesmo caminho de `commitNodes`.

## O que não fazer aqui

- Painel de atalhos, busca no diagrama, agrupar/desagrupar: prioridade 3, fora desta ordem.
- Selecionar múltiplos elementos: `DDP-293`, pré-requisito, não reimplementado aqui.
- Nenhuma migração, nenhuma tabela nova, nenhuma política RLS: a trava vive em `style`, campo já existente.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: `@xyflow/react`, com nodes e edges controlados pelo estado do app | Alinhar, distribuir e clonar com Alt gravam pelo `commitNodes`/`copyNode` que já existem. Nenhum estado paralelo do React Flow |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: alinhar em cada uma das seis direções com dois ou mais elementos selecionados, distribuir horizontal e vertical com três ou mais, Ctrl+mais/menos/0 e Ctrl+Shift+H, Espaço+arrastar move o quadro sem mover elemento nem abrir seleção, Ctrl+L trava e destrava (elemento travado não move nem redimensiona), e Alt+arrastar deixa o original e move uma cópia.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
