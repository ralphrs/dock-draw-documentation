# Guia das sessões A, B e C

| Arquivo | Para quê |
| --- | --- |
| `PROTOCOLO.md` | Regras de comunicação das três sessões: o quadro do Jira, status, transições, comentários, desenvolvimento no app, aprovação humana, escuta, encerramento |
| `PROMPT-SESSAO-A.md` | Abertura da sessão A (arquiteto e scrum master): missão, trilhas, roteiro dos ADRs, sprints de desenvolvimento |
| `PROMPT-SESSAO-B.md` | Abertura da sessão B (executor de ADR) |
| `PROMPT-SESSAO-C.md` | Abertura da sessão C (revisora, roda no repositório do app) |
| `CONFIGURACAO.md` | Permissões dos dois repositórios, acesso ao Jira, ordem de início e retomada |
| `templates/` | Modelos de descrição de issue e de comentário |
| `bin/` | `aguarda-fila.sh`, que espera a fila fora da sessão e é o modo preferido de escuta, e `espera.sh`, o relógio do modo de reserva. Mais `instalar-fixtures.sh`. Os demais serviram ao protocolo por arquivo, anterior a 2026-09-20 |

As sessões se comunicam por issues do Jira, no projeto `DDP` (`decisoes/DEC-0009-comunicacao-por-jira.md`). A pasta `tasks/` guarda o histórico do protocolo anterior e não recebe trabalho novo.

A trilha de ADR termina com o ADR 012 aceito. A trilha de desenvolvimento termina quando a meta definida pelo humano for atingida. A sessão A encerra cada trilha com uma issue de rótulo `encerrar`.
