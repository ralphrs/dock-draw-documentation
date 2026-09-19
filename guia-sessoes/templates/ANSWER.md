---
responde: Q-0000           # Q-NNNN ou QD-NNNN
tarefa: T-0000             # T-NNNN ou D-NNNN
criada_por: A
criada_em: AAAA-MM-DDTHH:MM
decisao: "1"               # número da opção, "outra" ou "adiar"
aprovado_por: arquiteto    # arquiteto | humano (obrigatório "humano" se a pergunta tem categoria_aprovacao diferente de nenhuma)
---

## Decisão
Opção escolhida, na primeira linha.

## Instrução
O que B ou C deve fazer, executável sem contexto adicional, com as travas. Se houver aprovação do humano, liste cada ação que ela cobre.

## Por quê
Curto. O que muda a decisão.

## Registrar
O que B ou C precisa registrar no ADR, no escopo ou nas pendências do ledger por causa desta resposta.
