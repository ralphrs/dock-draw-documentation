# DEC-0001 — Skills do superpowers por sessão, com gatilho nomeado

- **Data:** 2026-09-19
- **Decidido por:** humano, na conversa com a sessão A
- **Alcance:** as três sessões
- **Aplicado em:** `guia-sessoes/PROMPT-SESSAO-A.md`, `PROMPT-SESSAO-B.md`, `PROMPT-SESSAO-C.md`

## Decisão

Cada sessão passa a ter um conjunto de skills do plugin superpowers obrigatórias, cada uma presa a um gatilho nomeado, e um conjunto de skills proibidas com o motivo escrito.

## Contexto

O pedido original foi usar o plugin "para cada coisa". O arquiteto discordou da forma literal e apresentou o mapa abaixo, aceito na mesma conversa.

Duas skills causariam dano concreto se aplicadas sem recorte:

- `superpowers:finishing-a-development-branch` encerra a branch e faz merge. Merge na `main` do app é categoria `app-release` e exige aprovação do humano por resposta `A-QD-*`. A skill passaria por cima do controle que o protocolo existe para manter.
- `superpowers:test-driven-development` não tem objeto nas sessões A e B, cujos artefatos são documentos. O `CLAUDE.md` já registrava a proibição.

## Mapa

### Sessão A

| Skill | Gatilho |
| --- | --- |
| `superpowers:brainstorming` | Antes de decidir dúvida difícil de reverter, e antes de montar cada sprint |
| `superpowers:writing-plans` | Ao transformar fatias de ADR aceito em tarefas `D` de uma sprint |
| `superpowers:verification-before-completion` | Antes de todo veredito "aceita" numa revisão |
| `superpowers:dispatching-parallel-agents` | Revisão de ADR contra o ledger, e diff de C com mais de dez arquivos |

### Sessão B

| Skill | Gatilho |
| --- | --- |
| `superpowers:brainstorming` | Etapa de escopo de cada ADR, antes de propor candidata |
| `superpowers:systematic-debugging` | Spike que falha, antes de escrever a causa no ADR |
| `superpowers:dispatching-parallel-agents` | Fichas de pesquisa por candidata, avaliação de mais de duas bibliotecas |
| `superpowers:verification-before-completion` | Antes de anexar "Resultado" |

### Sessão C

| Skill | Gatilho |
| --- | --- |
| `superpowers:executing-plans` | Ao assumir a tarefa. A tarefa `D` é o plano |
| `superpowers:test-driven-development` | Toda fatia que produz código executável |
| `superpowers:systematic-debugging` | Teste que continua vermelho depois da primeira hipótese |
| `superpowers:requesting-code-review` | Antes de mover a tarefa para `done/` |
| `superpowers:verification-before-completion` | Antes de anexar "Resultado" |

## Proibições

| Skill | Sessão | Motivo |
| --- | --- | --- |
| `finishing-a-development-branch` | C | Faz merge, que é `app-release` |
| `using-git-worktrees` | C | Conflita com "uma tarefa, uma branch" do protocolo |
| `subagent-driven-development` | C | Tira a decisão de implementação de dentro da tarefa e do ADR |
| `test-driven-development` | A, B | Não há código. Já proibida pelo `CLAUDE.md` |

## Alternativa descartada

Aplicar todas as skills em todas as sessões, conforme o pedido literal. Descartada pelo dano descrito no contexto.

## Custo aceito

O mapa é uma lista fixa e envelhece. Skill nova do plugin não entra sozinha, e skill que mude de comportamento numa atualização continua listada com o gatilho antigo. A revisão do mapa fica sem gatilho próprio, o que é uma lacuna conhecida desta decisão.

## Dependência

As skills precisam estar instaladas no escopo do usuário, não no do projeto. A sessão C roda em `dok-draw-app` e não enxerga plugin instalado só em `dok-draw-documentation`.
