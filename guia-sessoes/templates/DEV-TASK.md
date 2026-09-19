---
id: D-0000
titulo: ""
criada_por: A
criada_em: AAAA-MM-DDTHH:MM
adr: "005"                 # ADR aceito que origina a tarefa, ou "infra"
fatia: "F2"                # fatia de implementação do ADR
sprint: 1
tipo: implementar          # implementar | corrigir | infraestrutura | merge | encerrar
depende_de: []             # ids de tarefas D que precisam estar em done/ e aceitas
branch: dev/D-0000-slug
exige_aprovacao_humana: false   # true para tipo merge, ou se a tarefa já prevê app-release
---

## Objetivo
Uma frase: o que passa a funcionar no app quando a tarefa termina.

## Contrato que vale
ADR, seção e interfaces do ledger que a implementação precisa respeitar. Cite, não resuma de memória.

## Escopo
Arquivos ou módulos que devem mudar. O que fica explicitamente de fora.

## Critério de pronto
Lista verificável: comandos (build, typecheck, testes) e o resultado esperado, comportamento observável, testes novos exigidos.

## Restrições
Travas (prazo, o que não fazer, quando parar e perguntar).
