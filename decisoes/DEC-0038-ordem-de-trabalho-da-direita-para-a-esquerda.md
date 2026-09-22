# DEC-0038: ordem de trabalho da direita para a esquerda no quadro, para toda sessão

**Data:** 2026-09-22
**Quem decidiu:** humano, no terminal da sessão A, com urgência
**Alcance:** sessões A, B, C e D, `guia-sessoes/PROTOCOLO.md`, `guia-sessoes/bin/aguarda-fila.sh`, prompts de abertura

## A decisão

Toda sessão, a cada volta, escolhe o que fazer olhando o quadro `DDP` da direita para a esquerda e age na primeira coluna em que tem um card com a bola. Só quando essa coluna está vazia para ela passa à coluna seguinte. A ordem é fixa:

1. **EM REVISÃO.** Entrega esperando conferência. Para a sessão A: conferir e mover no mesmo ciclo. Para B, C e D: nada, a bola é da sessão A.
2. **AGUARDANDO APROVAÇÃO.** Para a sessão A: resposta do humano (card arrastado ou comentado) e card órfão sem os rótulos `humano` e `aprovacao-humana`, que voltou sem passar pela conferência. Para B, C e D: nada.
3. **BLOQUEADA.** Para a sessão A: dúvida das outras sessões esperando decisão. Para B, C e D: card próprio cuja resposta da sessão A já chegou em comentário.
4. **EM ANDAMENTO.** Retomar o que já começou, inclusive correção devolvida pela sessão A na descrição. Para a sessão A: aprovação já respondida pelo humano, despacho ao Lovable e pedido `liberada`.
5. **Tarefa nova.** Só com as quatro colunas vazias para a sessão: `A FAZER` da própria fila, primeiro o rótulo `prioridade`, depois a menor chave. Para a sessão A, o estoque `processo` vem depois de tudo (`DEC-0016`).

Motivo dado pelo humano: o quadro estava acumulando trabalho à direita (entregas conferidas, aprovações dadas) enquanto as sessões puxavam tarefa nova à esquerda. Card que já andou até a direita representa trabalho de mais gente parado, e terminar vale mais que começar.

## Como a regra roda sem depender de memória

A escuta `aguarda-fila.sh` imprime, para toda sessão, a fila ordenada por coluna da direita para a esquerda, depois por `prioridade`, depois por chave, e nomeia a primeira como próxima tarefa. É o texto que a sessão lê a cada volta, então a ordem sai de lá, não do prompt. O protocolo ganha a seção "Ordem de trabalho" e os quatro prompts de abertura apontam para ela.

## Custo aceito e alternativa descartada

Custo: uma tarefa nova de prioridade alta espera enquanto houver qualquer card da sessão nas colunas da direita. O humano aceita isso, porque o card da direita é o que já custou mais. Alternativa descartada: prioridade por rótulo acima de coluna, que era o comportamento anterior e deixou aprovações e conferências paradas.
