# Ordem, dependências e numeração dos ADRs

Um ADR por camada. Números não são reaproveitados.

| ADR | Camada | Depende de | Prompt | Estado |
| --- | --- | --- | --- | --- |
| 001 | Motor de diagrama (React Flow) | — | — | Aceito (arquivo a trazer para `adrs/`) |
| 002 | Formato de conteúdo (DokMD v1) | 001 | `PROMPT-ADR-002.md` | Proposto — aceito quando o S-1 passar |
| 002-E1 | Emenda 1: execução, desempenho e testes do `src/content-format` | 002, 005 | `PROMPT-ADR-002-emenda-1.md` | Não escrito |
| 003 | Armazenamento e versionamento | 002 | `PROMPT-ADR-003.md` | Proposto — aceito com o 002 |
| 004 | Fluxo editorial | 002, 003 | `PROMPT-ADR-004.md` | Proposto — aceito com o 002 |
| 005 | Edição (executa o spike S-1) | 002, 003, 004 | `PROMPT-ADR-005.md` | **Próximo** |
| 006 | *A definir* (camada em produção) | — | — | — |
| 007 | Renderização | 002, 005 | `PROMPT-ADR-007.md` | Não escrito |
| 008 | Navegação e descoberta | 003, 007 | `PROMPT-ADR-008.md` | Não escrito |
| 009 | Busca | 002, 003, 004 + Tenancy | `PROMPT-ADR-009.md` | Não escrito |
| 010 | Exportação e sincronização | 002, 003, 004, 007 | `PROMPT-ADR-010.md` | Não escrito |
| 011 | Publicação | 004, 007, 008, 009 | `PROMPT-ADR-011.md` | Não escrito |
| 012 | Consolidação da stack | Todos | `PROMPT-ADR-012.md` | Não escrito |
| — | Tenancy e acesso (membros de workspace, convites) | 003 | a criar | **Sem número** — conflito C-3 do LEDGER |

Ordem sugerida a partir de agora: **005** → 002-E1 → Tenancy → 007 → 008 e 009 → 010 e 011 → 012.
