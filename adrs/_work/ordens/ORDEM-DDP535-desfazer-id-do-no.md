# Ordem DDP-535: desfazer para depois de restaurar um elemento excluído (RT-C07)

**Issue:** `DDP-535`, defeito achado pela rodada 1 do plano de regressão (`DDP-524`, casos RT-C06 e RT-C07, preview no commit `b5c15ed`). Tela: editor de diagrama.
**App:** `dok-draw-app`. Sem migração, sem campo novo no banco, sem dependência nova, sem publicação nesta ordem.

## Por que

Medido no preview em 2026-09-22, com o `fetch` interceptado: criar uma Pessoa externa, mover, excluir, e então Ctrl+Z três vezes.

| Passo | O que a tela faz | O que vai ao servidor |
| --- | --- | --- |
| Criar | nó `c5f2922f` | `addElement` |
| Mover | pilha guarda antes e depois com o id `c5f2922f` | `saveNodes` |
| Excluir | pilha guarda o elemento e os nós | `removeElement` |
| Ctrl+Z 1, desfaz a exclusão | elemento volta com o mesmo id, mas o nó volta como `19481699` | `addElement` com `id` do elemento, `patchElement`, `saveNodes` |
| Ctrl+Z 2, desfaz o mover | nada muda na tela | `saveNodes` para `c5f2922f`, que não existe mais: zero linhas, sem erro |
| Ctrl+Z 3, desfaz a criação | toast "Não foi possível desfazer a ação." | nenhuma chamada |

A causa está em `src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx`, `recriarElemento` (linha 1294). Ela manda `id: element.id` ao `createElement`, então o elemento volta com o id de antes, mas `createElement` no repositório (`src/infrastructure/supabase/c4-repository.ts`, linha 205) e `addElementToView` (linha 473) inserem em `view_nodes` sem id, e o nó volta com id novo. Toda entrada mais antiga da pilha guarda o id do nó: `commitNodes` (linha 494) guarda a geometria por `id` do nó, e `criarElementoComHistorico` (linha 2116) guarda `ids.nodeId` para o `deleteNodeById` do desfazer. Depois da restauração, `aplicarGeometria` não acha o nó e grava no vazio, e `deleteNodeById` devolve `false` sem chamar o servidor.

O refazer tem a mesma falha na outra direção: `criarElementoComHistorico.redo` cria de novo e troca `ids.nodeId` só na própria entrada, e as entradas seguintes (mover, redimensionar) continuam com o id antigo.

Sintoma ligado (RT-C06): ao desfazer uma colagem de três elementos, uma vez em duas o canvas ficou em branco até recarregar, com os nós no DOM em `visibility: hidden` e nenhuma conexão desenhada, e o console repetindo "[React Flow]: It seems that you are trying to drag a node that is not initialized". Não foi reproduzido de forma determinística, e a troca de id do nó em pleno voo é a hipótese mais forte: o React Flow mede o nó pelo id, e um nó que troca de id entre dois renders fica sem medida.

## O que fazer

**1. O nó recriado volta com o id que tinha.** Em `createElement` do repositório (linha 205), aceitar um campo opcional `nodeId` e usá-lo no `insert` de `view_nodes`, no mesmo padrão do `id` do elemento (`...(input.nodeId ? { id: input.nodeId } : {})`). Em `addElementToView` (linha 473), aceitar um `id` opcional da mesma forma. Em `src/application/diagram.functions.ts`, `addElement` (linha 67) ganha `nodeId: z.string().uuid().optional()` e `placeElement` (linha 348) ganha `id: z.string().uuid().optional()`, e os dois repassam ao repositório.

**2. `recriarElemento` pede os ids originais.** Na rota, `recriarElemento` (linha 1294) passa `nodeId: primeiro.id` ao `createElement` e `id: n.id` a cada `placeElementFn`. Com isso os `provisorios` podem ser os próprios nós de `alvo.nodes`, sem `crypto.randomUUID()`, e o `setModel` final não precisa mais trocar provisório por real: só confirma a geometria. Os ids gravados nas entradas anteriores da pilha voltam a apontar para nós que existem.

**3. O refazer da criação volta com o mesmo nó.** Em `criarElementoComHistorico` (linha 2116), guardar também `elementId: created.element.id`, e no `redo` mandar `id: ids.elementId` e `nodeId: ids.nodeId` ao `createMutation`. Conferir que `createMutation` (linha 597, `mutationFn` na 600) repassa `id` e `nodeId` ao `createElement` quando vierem no input. A mesma regra vale para o `redo` de `colarImagemNoQuadro` (linha 2141) e o de `pasteAt` (linha 1509): refazer recria com os ids que a entrada guardou, em vez de trocar `ids.nodeId` e `refs.ids` por ids novos.

**4. Conferir** no preview, no projeto `Regressão`, diagrama `RT`:
- Criar, mover, renomear, mudar a cor, conectar a outro elemento, excluir. Ctrl+Z seis vezes: cada passo volta, sem toast, e o sexto deixa o canvas sem o elemento. Ctrl+Shift+Z seis vezes: tudo refeito na ordem, com o elemento na posição do mover e a conexão de volta.
- Copiar três elementos, colar, Ctrl+Z, Ctrl+Shift+Z, Ctrl+Z, dez vezes seguidas: o canvas nunca fica em branco, nenhum nó fica com `visibility: hidden`, e o console não mostra "trying to drag a node that is not initialized".
- Colar uma imagem, Ctrl+Z, Ctrl+Shift+Z, mover a imagem, Ctrl+Z: a imagem volta à posição anterior.
- Recarregar a página ao fim de cada bloco: o que está na tela é o que está no banco.

## O que não fazer aqui

- Não trocar a pilha por biblioteca nem redesenhar o histórico: a pilha de `empilhar`/`desfazer`/`refazer` (linhas 543 a 590) fica como está.
- Não mexer no `pendingNodes` (registro de ids provisórios, linha 151): ele cobre a criação otimista pela paleta, que não é o caso daqui.
- Não mexer em `c4-node.tsx`, `diagram-canvas.tsx` nem no React Flow.
- Nenhuma migração: `view_nodes.id` já é `uuid` com default, e inserir com id escolhido pelo cliente já é feito em `model_elements` pelo mesmo desfazer.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão (`DEC-0041`).

## O que fica em aberto (lacuna declarada)

- **Canvas em branco (RT-C06) sem reprodução determinística.** O item 4 é o teste que decide. Se o sintoma continuar depois dos itens 1 a 3, o Lovable relata os passos exatos e o console no resultado, sem tentar corrigir por conta própria: vira ordem própria.
- **Ctrl+Z que leva 5 s para restaurar 4 formas e 2 conexões (RT-C16).** `recriarElemento` faz três chamadas por elemento em série (`addElement`, `patchElement`, `saveNodes`) e `recriarRel` mais duas por conexão. Não é desta ordem. Fica registrado em `DDP-539`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project` nesta ordem |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |
| `public.view_nodes` e `public.model_elements` são do ADR 001, sem contrato novo de banco | Nenhuma migração, só `insert` com id opcional, padrão já usado em `model_elements` |
| Desfazer e refazer num passo por ação, na ordem inversa (`DDP-294`) | Itens 1 a 3 devolvem à pilha ids que existem |
| Nenhum texto de tela com referência interna (`DEC-0041`) | Nenhum texto de tela novo |
