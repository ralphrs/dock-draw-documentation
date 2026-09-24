# Ordem: instrumentar o redoStack vazio depois de desfazer exclusão em lote (RT-C16)

**Issue da ordem:** `DDP-576`. Caso RT-C16 da `DDP-542`. Esta ordem só instrumenta e reporta. A correção vem numa emenda, depois que o mecanismo estiver confirmado.

**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação nesta ordem.

## Repro

Selecionar por laço de arrasto 2 elementos e 1 conexão. Delete (some tudo, correto). Ctrl+Z (os três voltam, sem toast, correto). Ctrl+Y ou Ctrl+Shift+Z (esperado: some tudo de novo). Não acontece nada, sem toast e sem erro visível. O dono do produto confirmou que nenhum toast apareceu em nenhum dos dois passos.

## Por que

Arquivo: `src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx`, HEAD `766274c`. Todas as linhas abaixo foram conferidas nesse HEAD.

O `refazer` (569 a 586) só tem uma saída sem efeito visível: `redoStack.current.pop()` devolve `undefined` e a função sai na linha 571. Qualquer falha do `redo()` da entrada mostra `toast.error` na linha 584. Sem toast, a pilha `redoStack` estava vazia no Ctrl+Y.

**Hipótese principal, da revisão da sessão C, confirmada por leitura.** O `desfazer` (549 a 567) só empilha a entrada em `redoStack` na linha 561, depois de `await entry.undo()`. O undo da exclusão em lote (1484 a 1491) é sequencial: cada `recriarElemento` (1337 em diante) e cada `recriarRel` (1297 em diante) faz chamadas ao servidor. Os dois pintam o modelo na hora, com `setModel` nas linhas 1298 e 1342, antes de qualquer resposta. Os três itens reaparecem enquanto a entrada ainda está fora das duas pilhas, e um Ctrl+Y nesse intervalo cai no `pop` vazio. O `refazer` não consulta `reaplicando.current`, então nada o barra. A duração do intervalo (mais de um segundo, a partir de cerca de 170 ms por chamada) vem de uma medição da `DDP-515` que não foi refeita aqui.

**Segunda causa possível, que a revisão da C descartou cedo demais.** A C afirma que os pontos de reset (linhas 380 e 546) não são alcançáveis pelo repro. O reset da 546 vale para qualquer chamada de `empilhar`, e o arquivo tem 11 chamadas. Uma delas, o fim do gesto em `moveNodes` (linhas 510 a 530), só se protege com `reaplicando.current`. Se um gesto de geometria terminar depois que o undo acabou (por exemplo, evento de medida de nó recriado), ele empilha uma entrada nova e zera o `redoStack`. A leitura estática não exclui isso, então a instrumentação cobre as duas causas.

## O que fazer

Sem breakpoint: o agente do Lovable não usa o devtools. Tudo por `console.log` e `console.trace`, com o prefixo `[DDP-576]` para a remoção ser uma busca simples na emenda.

1. **`desfazer`.** Log no início, logo antes do `await entry.undo()`, e outro logo depois da linha 561 (`redoStack.current.push(entry)`) e nos dois ramos de falha. Cada log leva `performance.now()`, `reaplicando.current`, `undoStack.current.length` e `redoStack.current.length`.
2. **`refazer`.** Log na linha 570, antes do `pop`, com os mesmos quatro valores, e outro quando o `pop` devolver `undefined`, dizendo isso.
3. **`empilhar`.** Antes do reset da linha 546, se `redoStack.current.length` for maior que zero, um `console.trace` com o tamanho da pilha e o `performance.now()`. Não muda o comportamento.
4. **Efeito de troca de vista (379 a 382).** Um log quando o efeito rodar, com o `activeViewId`.

Nenhuma outra mudança de código, e nenhum log entra em produção: a ordem não publica.

## Como reportar

Rodar o repro duas vezes no preview, com o console aberto, e colar os logs no "Resultado".

- **Tentativa 1, Ctrl+Y logo depois do Ctrl+Z**, sem esperar. Reportar a hora do Ctrl+Z (log do início de `desfazer`), a hora do `push` no `redoStack`, a hora do Ctrl+Y, e se algum `console.trace` de `empilhar` apareceu entre o Ctrl+Z e o Ctrl+Y, com a pilha de chamadas.
- **Tentativa 2, esperando cerca de 3 segundos** depois do Ctrl+Z, até o log do `push` aparecer, e só então Ctrl+Y. Reportar se o refazer funcionou.

Leitura do resultado. Se a tentativa 1 falha e a 2 funciona, o mecanismo é a janela assíncrona. Se a 2 também falha e um `console.trace` de `empilhar` aparece depois do `push`, a segunda causa é a real e a pilha de chamadas aponta quem a chama. Se nada disso ocorrer, reportar o que os logs mostram e parar.

## O que não fazer aqui

* Não corrigir nada. Esta ordem é só de instrumentação e relato.
* Não alterar `excluirSelecaoComHistorico`, `recriarElemento`, `recriarRel`, `empilhar`, `desfazer` ou `refazer` além dos logs. Elas ficam intactas nesta ordem por ser só instrumentação, não por terem sido descartadas como causa: o caminho de `recriarElemento` e `recriarRel` é o que alonga a janela da hipótese principal.
* Não mexer em `.env*`, migração nem política RLS.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| Sem dependência nova sem justificativa em ADR | Nenhuma dependência nova |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project`. Os logs não vão a produção |

## Verificação

No preview, com o console aberto: as duas tentativas do repro produzem os logs pedidos, e o comportamento do app não muda em nada além do console.
