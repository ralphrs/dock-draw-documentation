# DEC-0011: o Diagram Studio ganha as doze notações depois da meta da Wiki

**Data:** 2026-09-20
**Quem decidiu:** o dono do produto, em `DDP-75`
**Alcance:** sequenciamento entre as duas trilhas de desenvolvimento

## A decisão

As doze famílias de diagrama pedidas para o Diagram Studio entram **por inteiro**, sem corte de escopo, e entram **depois** que a meta de `DEC-0004` fechar. A trilha da Wiki segue até que uma página possa ser criada, editada, submetida, aprovada e publicada ponta a ponta. O ADR 015 é escrito a partir daí, com o escopo já aprovado em `adrs/_work/ADR-015-escopo.md`.

Nenhuma fatia do Diagram Studio é despachada antes disso, e nenhuma fatia da Wiki é adiada por causa dele.

## Por quê

Três razões, na ordem em que pesaram.

**A meta acabou de provar que anda.** A fatia F1 do ADR 002 rodou o ciclo completo em 2026-09-20, do despacho à revisão do dono do produto, com o processo já construído em vez de sendo inventado no caminho. Restam 16 fatias. Trocar um caminho medido por um não medido, no momento em que o medido começou a andar, é a troca errada.

**Esperar não encarece o pedido.** Nada no escopo do ADR 015 depende de algo que a Wiki vá produzir, e nada nele apodrece. O problema 4 do escopo, posição derivada da semântica, continua sem medição em qualquer ordem que se escolha, então adiá-lo não acrescenta risco nenhum.

**Alternar entre as duas trilhas é mais lento que a soma das partes.** A regra de um ADR por sessão continua valendo, e o gargalo medido na fatia F1 é o ciclo de escrita e revisão de ordem, não a escrita do ADR. Duas trilhas competindo pelo mesmo gargalo atrasam as duas.

## Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| Uma notação agora, o resto depois | Provar o mecanismo no app antes da Wiki fechar tem valor, e custa um ADR mais algumas fatias no meio da sprint que está andando. O dono do produto preferiu não interromper |
| Em paralelo, alternando | Atrasa as duas trilhas pelo gargalo compartilhado |
| Diagramas primeiro | Exigiria reescrever `DEC-0004`, porque a meta atual deixaria de ser a meta |

## Custo aceito

O Diagram Studio fica sem notação nova enquanto a Wiki não fechar. O pedido tem doze famílias e quatro problemas de arquitetura distintos, dois deles sem medição, então a espera não é curta.

## O que fica pronto desde já

O escopo do ADR 015 está escrito e aprovado, com o recorte definido: o ADR decide o registro de notação e a política de ícone, e declara compartimentos, posição derivada e wireframes como lacuna com dono proposto. O número 015 está na tabela de numeração do ledger. A extensão aditiva ao ADR 001 está declarada. Quando a meta fechar, a sessão B começa a escrever sem etapa de escopo pela frente.

## Gatilho de revisão

Esta decisão volta à mesa se a meta de `DEC-0004` deixar de andar, ou se alguma fatia da Wiki passar a depender de uma notação que o Diagram Studio ainda não tem.
