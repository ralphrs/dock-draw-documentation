# Ordem, dependências e numeração dos ADRs

Um ADR por camada. Números não são reaproveitados.

| ADR | Camada | Depende de | Prompt | Estado |
| --- | --- | --- | --- | --- |
| 001 | Motor de diagrama (React Flow) | — | — | Aceito (arquivo a trazer para `adrs/`) |
| 002 | Formato de conteúdo (DokMD v1) | 001 | `PROMPT-ADR-002.md` | **Aceito** em 2026-09-19 |
| 002-E1 | Emenda 1: execução, desempenho e testes do `src/content-format` | 002, 005 | `PROMPT-ADR-002-emenda-1.md` | Rascunho em `adrs/_work/`, aceito com ressalva. Aguarda o harness de medição (T-0007) e a verificação do alvo real do Nitro |
| 003 | Armazenamento e versionamento | 002 | `PROMPT-ADR-003.md` | **Aceito** em 2026-09-19 |
| 004 | Fluxo editorial | 002, 003 | `PROMPT-ADR-004.md` | **Aceito** em 2026-09-19 |
| 005 | Edição (executa o spike S-1) | 002, 003, 004 | `PROMPT-ADR-005.md` | **Aceito** em 2026-09-19. MDXEditor 4.2.5, S-1 passou 30/30 |
| 006 | *Vago* | — | — | Número reservado, sem camada atribuída (`decisoes/DEC-0008-adr-006-vago.md`) |
| 007 | Renderização | 002, 005 | `PROMPT-ADR-007.md` | Não escrito |
| 008 | Navegação e descoberta | 003, 007 | `PROMPT-ADR-008.md` | Não escrito |
| 009 | Busca | 002, 003, 004 + Tenancy | `PROMPT-ADR-009.md` | Não escrito |
| 010 | Exportação e sincronização | 002, 003, 004, 007 | `PROMPT-ADR-010.md` | Não escrito |
| 011 | Publicação | 004, 007, 008, 009 | `PROMPT-ADR-011.md` | Não escrito |
| 012 | Consolidação da stack | Todos | `PROMPT-ADR-012.md` | Não escrito |
| 013 | Tenancy e acesso (membros de workspace, convites) | 003 | a criar | Não escrito. Resolve os conflitos C-3 e C-7 (`decisoes/DEC-0005-numero-do-adr-de-tenancy.md`) |
| 014 | Developer Portal (documentação arc42 como feature viva) | 002, 007 | a criar | Não escrito (`decisoes/DEC-0006-quatro-decisoes-delegadas.md`, decisões 3 e 4) |

Ordem sugerida a partir de agora: **002-E1** → 013 Tenancy → 007 → 008 e 009 → 010 e 011 → 014 Developer Portal → 012.

O 014 vem depois do 007 porque o portal é renderizado pela fatia `read` decidida lá. O 012 fecha o roteiro, por auditar todos os outros.
