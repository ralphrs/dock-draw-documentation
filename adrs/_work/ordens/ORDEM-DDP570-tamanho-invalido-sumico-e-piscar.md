# Ordem: tamanho inválido, sumiço de forma e piscar no arrasto

**Issue da ordem:** `DDP-573`. Relato original: `DDP-570`, itens 4, 5 e 6. Os itens 1 a 3 da mesma issue (modos de alça, modal de edição) ficam de fora: são redesenho de interação, pendentes de proposta da sessão D.

**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação nesta ordem.

## Por que

Causas achadas em leitura direta do código na `main` (HEAD `766274c`) e conferidas pela sessão C.

* Forma some ao digitar tamanho inválido: o `NumberField` (função em `projetos.$projectId.diagramas.$viewId.tsx`, hoje nas linhas 3464 a 3506, `onChange` em 3492 a 3495) é controlado por `value={value}` e só bloqueia `NaN`. Campo vazio vira 0, valor negativo passa direto, e nenhum ponto do caminho (`moveNodes`, `commitNodes`, `c4-node.tsx`, `element-shape.tsx`) faz clamp pelos limites `min` e `max` recebidos como prop. Largura ou altura 0 ou negativa colapsa o nó (`c4-node.tsx:72-73`, `:92`) e o valor inválido é gravado pelo debounce de 400ms.
* Formas somem, caso geral: o `modelQuery` (linha 289 da mesma rota) usa as opções padrão do TanStack Query, com refetch em foco de janela e em reconexão. O `useEffect` das linhas 367 a 376 substitui o `model` inteiro a cada resultado novo. A criação de nó é otimista (`onMutate`, 619 a 666) e só fica definitiva em `onSuccess` (667 a 685). Um refetch que resolva nesse intervalo troca o `model` pelo snapshot do servidor, sem o nó novo. Há um segundo caminho, que as opções do `QueryClient` não cobrem: `src/routes/__root.tsx:129-133` chama `queryClient.invalidateQueries()` a cada `SIGNED_IN` e `USER_UPDATED`, o que refaz toda query ativa mesmo com `refetchOnWindowFocus` desligado e `staleTime` alto. O cliente do Supabase costuma reemitir `SIGNED_IN` quando a aba recupera o foco. A frequência não foi medida.
* Por que a ordem não desliga o refetch de montagem nem mexe no `QueryClient` global: o editor guarda a edição só em `useState` e nunca escreve no cache de `["model", projectId]`. O único `setQueryData` do app é de outra chave (`diagramas.index.tsx:176`), e `refresh` (linha 444) não tem uso. Voltar ao editor com o refetch de montagem desligado reaplicaria o snapshot do primeiro carregamento e apagaria as formas criadas ou movidas na sessão. O desligamento global também deixaria sem atualização a árvore de diagramas (o editor cria diagrama em `$viewId.tsx:1120` sem tocar essa chave) e outras telas.
* Piscar ao arrastar, causa comprovada no fonte instalado (`@xyflow/react` 12.11.6, `@xyflow/system` 0.0.82) e coerente com um perfil do Firefox no app publicado. O `rfNodes` (`diagram-canvas.tsx:192-211`) devolve um objeto novo para todos os nós a cada mudança de `nodes`, e `onNodeDrag` muda `nodes` a cada pixel. O objeto não leva `width`, `height` nem `measured`: as dimensões vão só dentro de `data`, que o React Flow ignora. Em `adoptUserNodes` (`@xyflow/system`, linha 1671) o nó interno só é reaproveitado com a mesma referência. Sendo objeto novo, o `measured` vem indefinido e o `handleBounds` é recalculado. Com `measured` indefinido, `nodeHasDimensions` (linha 756) dá falso e o `NodeWrapper` (`@xyflow/react`, linha 2363) desenha o nó com `visibility: hidden` até o `ResizeObserver` medir de novo. Como o `<ReactFlow>` não recebe `onNodesChange`, a medida nunca volta ao estado do app e o ciclo se repete a cada pixel, em todos os nós. A mesma causa explica o canvas em branco e o aviso "trying to drag a node that is not initialized" da `DDP-535`.

## O que fazer

**1. Campo de tamanho com texto local.** No `NumberField`, guardar o texto digitado em estado local enquanto o campo está em edição e mostrar esse texto no lugar de `value`. As regras:

* A cada digitação, se o texto for número finito dentro de `min` e `max` (limite ausente não restringe), chamar `onChange` na hora. Digitar valor válido e usar as setas do campo continuam ao vivo.
* Texto vazio, `-` ou fora do intervalo fica só no campo, sem chamar `onChange`.
* Ao sair do campo ou apertar Enter: vazio ou não numérico volta ao valor atual. Número fora do intervalo vai para o limite mais próximo, com `Math.min(max, Math.max(min, n))`, e chama `onChange`. Depois o texto local é descartado.
* Não clampar a cada tecla. Com `min` 40, digitar "100" transformaria o "1" em 40 antes do "0".
* A correção fica no componente e cobre os sete usos de `NumberField` (Largura 40 a 2000, Altura 30 a 2000 e os demais). Os controles de espessura, opacidade e fonte da conexão (linhas 3160 a 3212) são sliders limitados e não entram.
* Não mexer no atributo HTML `min`/`max` do input.

**2. Refetch do modelo, sem mudar o `QueryClient` global.**

* No `useQuery` do modelo (linha 289), acrescentar `refetchOnWindowFocus: false` e `refetchOnReconnect: false`. Manter `refetchOnMount` e `staleTime` padrão, para voltar ao editor continuar buscando o servidor.
* Em `src/routes/__root.tsx:132`, a invalidação passa a excluir a query do modelo:

```
if (event !== "SIGNED_OUT") {
  queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "model" });
}
```

* Não alterar `src/router.tsx`. Efeito residual declarado: o modelo passa a ser buscado só ao montar o editor. A ordem não cria nem remove atualização em tempo real, porque antes ele só se atualizava por foco, reconexão e montagem.

**3. Preservar a identidade do nó e informar as dimensões.** Em `diagram-canvas.tsx` (linhas 192 a 211), duas mudanças no mesmo `rfNodes`. Primeiro, cada nó passa a levar `width` e `height` no próprio objeto (os valores `node.width` e `node.height` que o app já tem e que `C4Node` já aplica), para `nodeHasDimensions` nunca ficar falso. Segundo, manter um cache por id (`useRef` com `Map`) e reaproveitar a referência do objeto anterior quando posição, tamanho, `zIndex`, seleção, `locked`, `draggable` e o elemento não mudaram, criando objeto novo só para o nó que mudou. Com a mesma referência, `adoptUserNodes` reaproveita o nó interno e não recalcula o `handleBounds` dos 32 pontos de conexão. Envolver `C4Node` em `React.memo`.

## O que não fazer aqui

* Não mexer nos itens 1 a 3 da `DDP-570` (modos de alça, modal de edição).
* Não alterar `router.tsx`, `refetchOnMount` nem `staleTime` de nenhuma query.
* Não mudar o formato gravado do diagrama nem o schema de `model_elements` e `relationships`.
* Não tocar em `.env*`, migração nem política RLS.
* Não alterar o debounce de `commitNodes` (400ms) nem os mínimos do `NodeResizer` (60 e 40, `c4-node.tsx:80-81`), mais altos que os do campo (40 e 30). A diferença fica para outra ordem.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| Sem dependência nova sem justificativa em ADR | Nenhuma dependência nova, só opções de `useQuery` já existente e um `predicate` |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project`. Publicar entra num card `app-release` |

## Verificação

No preview:

* Apagar o campo Largura de uma forma selecionada e sair do campo: a forma mantém o último tamanho válido. Digitar `-10` e sair: vira 40.
* Digitar "100" no campo Largura: o campo mostra 100 sem saltar e a forma passa a 100.
* Criar uma forma nova e trocar de aba e voltar rápido, ou reconectar a rede logo depois: a forma continua no canvas.
* Criar uma forma, ir à lista de diagramas e voltar ao editor: a forma continua.
* Arrastar uma forma por alguns segundos observando o quadro inteiro: só o nó arrastado atualiza a cada frame, os outros não piscam.
