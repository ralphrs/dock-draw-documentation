# DEC-0009 — As sessões se comunicam por issue do Jira, com uma conta só

- **Data:** 2026-09-20
- **Decidido por:** humano, na conversa com a sessão A
- **Alcance:** protocolo das três sessões, papel de `tasks/`, identidade das sessões no Jira
- **Aplicado em:** `guia-sessoes/PROTOCOLO.md` e `guia-sessoes/PROMPT-SESSAO-{A,B,C}.md` (bloqueados para escrita, texto proposto ao humano), `decisoes/REGISTRO.md`

## Decisão

A comunicação entre as sessões A, B e C passa a acontecer em issues do Jira, no site `dokdrawapp.atlassian.net`. A pasta `tasks/` deixa de ser o canal. O motivo é um só, e é do humano: acompanhar o andamento sem abrir o repositório.

O conector do Atlassian é autorizado na conta Claude, não por sessão, então as três sessões agem como a mesma conta Atlassian (`ralph.renato@gmail.com`). A identidade de cada sessão vive no campo de responsável da issue e num prefixo no comentário (`Sessão B:`), não no autor do registro.

## O que muda

| Antes (arquivo) | Agora (Jira) |
| --- | --- |
| `tasks/todo/T-NNNN-slug.md` | Issue do tipo Tarefa, status A Fazer, responsável Sessão B |
| `tasks/todo/D-NNNN-slug.md` | Issue do tipo Tarefa, status A Fazer, responsável Sessão C |
| `move.sh claim` | Transição para Em Andamento, feita por quem assume |
| `tasks/questions/Q-*.md` | Comentário na issue, prefixado `Dúvida (Sessão B):`, mais o rótulo da categoria de aprovação e a transição para bloqueado |
| `tasks/in-progress/A-Q-*.md` | Comentário de resposta, prefixado `Resposta (Sessão A):`, com a decisão e quem aprovou |
| Seção "Resultado" anexada ao arquivo | Comentário `Resultado (Sessão B):` e transição para Concluído |
| Seção "Revisão do arquiteto" | Comentário `Revisão (Sessão A):` com o veredito |
| `tasks/LOG.md` | Histórico da própria issue |
| `wait-for.sh` | Consulta por JQL em ciclo, uma por sessão, filtrando responsável e status |

O agrupamento por ADR e por sprint sai por rótulo, não por épico. O projeto escolhido é business e não tem o tipo Epic, conforme a seção "Configuração aplicada".

## O que continua em git

ADR, ordem de implementação, contrato do ledger, decisão de `decisoes/` e qualquer anexo longo continuam versionados no repositório. A issue cita o caminho. Documento de arquitetura precisa de diff, revisão e histórico de texto, e campo de Jira não entrega nenhum dos três.

A descrição da issue carrega objetivo, contrato que vale, entregáveis e critério de pronto, que é o que o humano lê para saber o que está acontecendo.

## Alternativas descartadas

**Jira como espelho, com `tasks/` continuando o canal.** Foi a recomendação da sessão A. O humano preferiu o canal único, porque um espelho exige manutenção dos dois lados e diverge no primeiro esquecimento.

**Um servidor MCP local por sessão, autenticado por API token, para identidade real.** Descartada por custo: três tokens, um servidor MCP a instalar e manter em cada máquina, a perda do conector oficial e uma aprovação de `dependencias`, tudo para entregar uma informação que o prefixo do comentário já carrega. O roteamento, que é o que o protocolo precisa, vem do campo de responsável. Reabre se o histórico por autor virar requisito.

**Uma conta Claude por sessão.** Descartada por custo de assinatura.

## Custos aceitos

- **Perda da atomicidade do `move.sh`.** Publicar por arquivo `.tmp` e mover garantia que ninguém lia arquivo pela metade. Transição de status não tem equivalente: duas sessões podem, em tese, assumir a mesma issue. O responsável por tarefa evita isso na prática, e a colisão fica visível no histórico.
- **Escuta por consulta, não por evento.** Cada sessão passa a consultar o Jira por JQL em ciclo. Gasta chamada de ferramenta a cada rodada, inclusive quando não há nada novo, e o atraso é o intervalo do ciclo.
- **Autor único no histórico.** Toda escrita aparece como `ralph.renato@gmail.com`. Quem fez o quê se lê no prefixo do comentário e no responsável.
- **Texto longo em campo de Jira.** Critério de pronto com saída de comando fica menos legível que em Markdown versionado, e não tem diff.

## Pendência que a decisão criou, e como fechou

O `dok-draw-squad` que o humano criou primeiro é um Atlassian Project (`DOKDR-1`), ferramenta de acompanhamento, sem issue nem quadro. O catálogo do MCP não expõe criação de projeto Jira, então o humano criou o `DDP` pela interface, com os seis status do protocolo. O projeto `SCRUM` que existia antes saiu do site.

## Configuração aplicada em 2026-09-20

Site `https://dokdrawapp.atlassian.net`, `cloudId` `5f3024da-2ee6-4363-81e4-ec0230c86f6e`. Projeto **DDP**, "Dok Draw Project", business (Jira Work Management), gerenciado pela equipe. Todas as tarefas usam o tipo de item `Tarefa`.

O projeto business não tem Epic, backlog nem sprint. O agrupamento sai por rótulo, e o acompanhamento de sprint continua em `decisoes/sprints/`.

### Contas

| Nome no Jira | accountId |
| --- | --- |
| Sessão A | `712020:ed8eef8a-2595-4b25-aec0-b64f1e399096` |
| Sessão B | `712020:ec30868f-8e34-4c25-97e2-cd920e5da679` |
| Sessão C | `712020:6ac2f667-9728-4b07-bffb-eaa19704a4c9` |
| Ralph Renato (humano) | `5d1ba41843efe40d1d30677c` |

O conector do Atlassian está autorizado na conta do humano, então toda escrita aparece como dele. O responsável da issue diz de quem é a tarefa, e o comentário começa com `Sessão X:`.

### Status e transições

| Status | id | Categoria | Transição para ele |
| --- | --- | --- | --- |
| A FAZER | 10004 | new | `21` |
| EM ANDAMENTO | 10005 | indeterminate | `31` |
| BLOQUEADA | 10007 | indeterminate | `2` |
| AGUARDANDO APROVAÇÃO | 10008 | indeterminate | `3` |
| EM REVISÃO | 10009 | indeterminate | `4` |
| CONCLUÍDA | 10006 | done | `41` |

As categorias já estão corretas. Uma leitura anterior, feita pela operação de status do projeto, devolveu `new` para três delas, e o fluxo de transições, que é o que vale, devolve `indeterminate`.

### Rótulos

| Rótulo | Uso |
| --- | --- |
| `sessao-b`, `sessao-c` | Fila de destino, redundante com o responsável e útil no JQL |
| `trilha-adr`, `trilha-dev` | Qual das duas trilhas |
| `adr-002`, `adr-005`, ... | ADR de origem, substitui o épico |
| `sprint-1`, ... | Sprint da trilha de desenvolvimento |
| `aprovacao-humana` mais a categoria (`app-release`, `ledger`, `commit`, ...) | O que a issue espera do humano |
| `historico` | Registro de trabalho anterior à migração |

### Escuta de cada sessão

```
Sessão B: project = DDP AND assignee = "712020:ec30868f-8e34-4c25-97e2-cd920e5da679" AND status in ("A FAZER", "BLOQUEADA")
Sessão C: project = DDP AND assignee = "712020:6ac2f667-9728-4b07-bffb-eaa19704a4c9" AND status in ("A FAZER", "BLOQUEADA")
Sessão A: project = DDP AND status in ("BLOQUEADA", "EM REVISÃO")
Humano:   project = DDP AND status = "AGUARDANDO APROVAÇÃO"
```

### O que o MCP não faz

O conector expõe issue, campo, comentário, transição e link. Não expõe administração: categoria de status, tela de criação, ordem de coluna do quadro e criação de projeto Jira ficam na interface, com o humano.

### Issues criadas na migração

| Issue | O que é | Status |
| --- | --- | --- |
| DDP-1 | T-0009, premissa de ambiente da Emenda 1 (Sessão B) | A FAZER |
| DDP-2 | T-0010, custo das flags estritas de TS (Sessão B) | A FAZER |
| DDP-3 | Aprovação `app-release` do push das fixtures e do despacho da ordem F0 | AGUARDANDO APROVAÇÃO |
| DDP-4 | Histórico de T-0001 a T-0008 e D-0001 | CONCLUÍDA |

Os arquivos de `tasks/todo/` correspondentes ganharam um alerta de migração e não devem ser executados.
