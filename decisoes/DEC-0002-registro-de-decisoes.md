# DEC-0002 — Decisão que não é contrato de camada vive em `decisoes/`

- **Data:** 2026-09-19
- **Decidido por:** humano, na conversa com a sessão A
- **Alcance:** repositório da documentação
- **Aplicado em:** `decisoes/`, `.claude/settings.json`

## Decisão

Decisão de numeração, sequenciamento, meta de trilha, processo ou regra do kit entra em `decisoes/DEC-NNNN-slug.md`, indexada em `decisoes/REGISTRO.md`. A vida de cada sprint da trilha de desenvolvimento entra em `decisoes/sprints/SPRINT-NN.md`.

A pasta é escrita pela sessão A. As sessões B e C registram as decisões delas na seção "Resultado" da própria tarefa, em um item "Decisões tomadas", e A promove para `decisoes/` o que precisa sobreviver à tarefa.

## Contexto

As decisões existiam, espalhadas por três lugares com propósitos diferentes. Os contratos de arquitetura ficavam no `LEDGER.md`, que continua a fonte de verdade. As decisões técnicas pontuais ficavam enterradas em `tasks/done/A-Q-*.md`. Os vereditos de revisão ficavam dentro das tarefas. Nada disso é navegável depois de algumas dezenas de tarefas, e nenhum dos três é o lugar de uma decisão de processo.

## Alternativa descartada

Usar `adrs/_work/`, que já estava liberado para escrita e não exigiria mudança de permissão. Descartada porque `_work/` é a bancada de rascunho da sessão B. Misturar o registro permanente com rascunho descartável de ADR apaga a diferença entre os dois.

## Custo aceito

Mais um lugar para procurar uma decisão, e a fronteira entre "contrato de camada" e "decisão de processo" depende de julgamento a cada caso. O `REGISTRO.md` abre com a tabela dessa fronteira justamente porque ela não é óbvia.

## Efeito nas permissões

`.claude/settings.json` ganhou `Edit(decisoes/**)` no `allow`. A pasta fica aberta para A e para B, porque as duas sessões compartilham o mesmo arquivo de permissões e não há como separá-las por ali. A separação de B fica só na regra textual do `PROMPT-SESSAO-B.md`.
