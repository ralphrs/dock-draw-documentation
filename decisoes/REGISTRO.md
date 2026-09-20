# Registro de decisões

Índice cronológico das decisões que não são contrato de camada. Uma linha por decisão, da mais recente para a mais antiga.

## O que entra aqui, e o que não entra

| Onde | O que |
| --- | --- |
| `adrs/LEDGER.md` | Contrato de arquitetura. Fonte de verdade, não duplicada aqui |
| `adrs/ADR-NNN-*.md` | Decisão de camada, com alternativa descartada e custo aceito |
| `decisoes/DEC-NNNN-*.md` | Decisão que não é de camada: numeração, sequenciamento, meta de trilha, processo, regra do kit |
| `decisoes/sprints/SPRINT-NN.md` | Objetivo, tarefas, resultado e pedido de merge de cada sprint da trilha de desenvolvimento |
| `tasks/done/A-Q-*.md`, `A-QD-*.md` | Decisão técnica pontual em resposta a dúvida. Entra no índice abaixo quando sobrevive à tarefa |

A pasta é escrita pela sessão A. As sessões B e C registram as decisões delas no "Resultado" da própria tarefa, e A promove para cá o que precisa durar.

## Índice

| Id | Data | Decisão | Quem decidiu |
| --- | --- | --- | --- |
| [DEC-0006](DEC-0006-quatro-decisoes-delegadas.md) | 2026-09-19 | Status dos ADRs 002 a 004 corrigido, o app manda sobre o BASE em tema e formatador, portal em DokMD no git e com o número 014 | Arquiteto, por delegação |
| [ACHADOS](ACHADOS-2026-09-19-adrs-x-app.md) | 2026-09-19 | Levantamento dos ADRs contra o código real. A Wiki não existe no app, e nenhuma das 27 dependências dos ADRs 002 e 005 está instalada | Arquiteto |
| [DEC-0005](DEC-0005-numero-do-adr-de-tenancy.md) | 2026-09-19 | Tenancy e acesso recebe o número 013. Dá dono aos conflitos C-3 e C-7 | Humano |
| [DEC-0004](DEC-0004-meta-da-trilha-de-desenvolvimento.md) | 2026-09-19 | Meta da trilha C: editar e publicar uma página da Wiki no app, ponta a ponta | Humano |
| [DEC-0003](DEC-0003-aspas-no-watcher.md) | 2026-09-19 | O comando de escuta passa os padrões entre aspas simples, porque o shell é zsh | Arquiteto |
| [DEC-0002](DEC-0002-registro-de-decisoes.md) | 2026-09-19 | Decisão que não é contrato de camada vive em `decisoes/`, fora do ledger e fora de `adrs/_work/` | Humano |
| [DEC-0001](DEC-0001-skills-por-sessao.md) | 2026-09-19 | Skills do plugin superpowers são obrigatórias por gatilho nomeado, mapeadas por sessão, com três proibições na sessão C | Humano |
| A-Q-0002 | 2026-09-19 | Aplicar o diff no ledger, aceitar os ADRs 002 a 005 e commitar a etapa do ADR 005 | Humano |
| A-Q-0001 | 2026-09-19 | Parada 4 do ADR 005: corrigir a fixture 05 no MDXEditor, com três travas, e criar o arquivo do ADR | Humano |
