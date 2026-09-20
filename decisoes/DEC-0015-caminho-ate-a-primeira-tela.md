# DEC-0015: a sprint reordena para entregar tela antes, sem cortar escopo

**Data:** 2026-09-20
**Quem decidiu:** sessão A, por delegação, no mesmo mandato que produziu a `DEC-0012`
**Alcance:** ordem de execução das sub-fatias restantes de S1, e o recorte de S2 e S3

## O problema

O dono do produto pediu, duas vezes, para ver a wiki funcionando cedo: "preciso ver a wiki base pronta logo, preciso ver como ficou".

O caminho planejado entrega tela só no fim. Depois da S1b, restam quatro sub-fatias de schema, a fatia de RLS inteira e a de server functions inteira, antes de a primeira tela do ADR 006 ter o que chamar. **Nenhuma dessas etapas muda um pixel no preview.**

## A decisão

A ordem das sub-fatias restantes muda, e o escopo não. Nada é cortado, três blocos saem do caminho crítico e voltam depois.

| Ordem nova | Bloco do DDL | Por que está no caminho |
| :--- | :--- | :--- |
| S1c | 2, mais a constraint adiada do bloco 1 | Sem `page_revisions` a página não tem conteúdo, e uma wiki sem texto não é wiki |
| S1f' | 7, só `effective_role` | A RLS inteira do ADR 003 resolve papel por essa função |
| S1d' | 3, só `page_drafts` | Sem rascunho não há edição, e editar é metade da meta da `DEC-0004` |
| S2' | RLS só das tabelas que existirem | Sem RLS o app não pode ler nada com segurança |
| S3' | só as funções que a primeira tela chama | O resto das dezoito funções não tem quem as chame ainda |
| G1, G2 | telas do ADR 006 | O que o dono do produto pediu para ver |

**Sai do caminho crítico, sem sair do escopo:**

| Bloco | O que é | Quando volta |
| :--- | :--- | :--- |
| 4 | `page_refs` | Quando backlink ou integridade de referência for pedido. É tabela derivada, recalculada a cada revisão salva |
| 5 e 6 | `assets`, `sync_state` | Imagem e exportação para Drive. Nenhuma tela da meta depende delas |
| 8 | `position_between` | Ordenação manual da árvore. A primeira tela lista por `position` com o padrão `0` |

## Por que isto é legítimo, e não invenção

O recorte da S1, escrito e revisado antes desta decisão, já registra que **"S1e e S1f não têm dependência entre si nem com S1d, e poderiam trocar de posição sem quebrar nada"**. A ordem original foi mantida ali para não introduzir decisão sem necessidade.

A necessidade apareceu. Esta decisão usa a folga que a análise de dependência já tinha medido, e não inventa uma folga nova.

## O achado que veio junto: a S1c não cabe numa ordem

O bloco 2 tem 4.290 caracteres de DDL. A ordem da S1b fechou em 9.812 caracteres com 3.563 de SQL, ou seja, cerca de 6.250 de prosa: restrições, roteiro de verificação, playbook de falha.

Repetir essa proporção com 4.290 de DDL passa do teto de 10.000, e o bloco 2 traz dois triggers de imutabilidade, que exigem roteiro de verificação maior que o de uma tabela comum.

**A S1c precisa ser partida em duas antes de virar ordem.** O corte pertence a quem escreve a ordem, com o critério que o recorte já usa: cada parte deixa o schema em estado consistente.

## Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| Seguir a ordem original | Entrega tela só no fim, contra um pedido explícito e repetido |
| Tela oca primeiro, com página sem conteúdo | `spaces` e `pages` sozinhas dariam tela em três fatias, mas a página não teria texto. Wiki sem texto não demonstra nada, e o tempo gasto não vira aprendizado |
| Juntar blocos numa migração grande para ir mais rápido | Foi o que produziu a ordem de 31 mil caracteres da fatia F1, com três passadas de revisão e quatro famílias de defeito |
| Cortar `page_refs`, `assets` e `sync_state` do escopo | Cortar não foi pedido. Adiar é reversível, cortar exige decisão do dono do produto |

## Custo aceito

**A primeira tela vai mostrar uma wiki sem imagem, sem backlink e sem ordenação manual.** Página com texto, histórico e fluxo de aprovação, dentro de espaço e projeto, e nada além disso.

O risco é o dono do produto olhar e sentir falta do que foi adiado. Está escrito aqui para que a falta seja reconhecida como adiamento e não como esquecimento.

## Gatilho de revisão

Se a S1c, depois de partida, não couber em duas ordens, o recorte inteiro de S1 volta à mesa. Três partes para um bloco significa que o critério de corte por bloco do ADR não serve para este bloco.
