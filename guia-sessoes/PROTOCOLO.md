# Protocolo de comunicação entre sessões

Três sessões do Claude Code trabalham juntas e se comunicam só por arquivos em `tasks/`, dentro de `dok-draw-documentation/`.

| Sessão | Papel | Roda em | Referência |
| --- | --- | --- | --- |
| **A** | Arquiteto e scrum master. Conduz o roteiro dos ADRs, transforma fatias de ADRs aceitos em tarefas de desenvolvimento, decide dúvidas técnicas, revisa entregas, escala ao humano só as categorias de aprovação | `dok-draw-documentation/` | `insumos/HANDOFF-ARQUITETURA.md`, `guia-sessoes/PROMPT-SESSAO-A.md` |
| **B** | Executor de ADR. Roda o `/adr`, spikes e pesquisa | `dok-draw-documentation/` | `CLAUDE.md`, `.claude/commands/adr.md`, `guia-sessoes/PROMPT-SESSAO-B.md` |
| **C** | Desenvolvedor. Implementa no app as tarefas de desenvolvimento, em branch, seguindo os ADRs | `dok-draw-app/` | `guia-sessoes/PROMPT-SESSAO-C.md` |

Caminhos:

- Documentação (A, B e a pasta `tasks/`): `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation`
- App Lovable (C): `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app`

O humano conversa com A. B e C só falam com o humano se A estiver parado há mais de uma hora (ver "Ociosidade").

## Objetivo e fim

Há duas trilhas:

- **Trilha de ADR (B):** escolher, camada por camada, a stack da engine de documentação. Termina quando o **ADR 012** for aceito.
- **Trilha de desenvolvimento (C):** implementar no app as fatias de implementação dos ADRs **aceitos**, na ordem de dependência. Termina quando a meta de desenvolvimento definida pelo humano for atingida.

O roteiro, a meta e os critérios de parada estão em `PROMPT-SESSAO-A.md`. O encerramento segue a seção "Encerramento".

## Pastas

```
tasks/
├── todo/          tarefas novas criadas por A: T-* para B, D-* para C
├── in-progress/   tarefas assumidas + respostas de A (A-Q-*, A-QD-*) + a dúvida respondida
├── questions/     dúvidas esperando A: Q-* de B, QD-* de C
├── done/          tarefas concluídas (com Resultado e Revisão) e pares de dúvida e resposta consumidos
├── .state/        controle dos watchers (A.seen, B.seen, C.seen). Não editar
└── LOG.md         uma linha por evento, escrita pelos scripts
```

## Nomes de arquivo

| Tipo | Nome | Quem cria | Modelo |
| --- | --- | --- | --- |
| Tarefa de ADR | `T-0001-slug.md` | A | `templates/TASK.md` |
| Dúvida de B | `Q-0001-T-0001.md` | B | `templates/QUESTION.md` |
| Resposta a B | `A-Q-0001.md` | A | `templates/ANSWER.md` |
| Tarefa de desenvolvimento | `D-0001-slug.md` | A | `templates/DEV-TASK.md` |
| Dúvida de C | `QD-0001-D-0001.md` | C | `templates/QUESTION.md` |
| Resposta a C | `A-QD-0001.md` | A | `templates/ANSWER.md` |

Ids com quatro dígitos, por `guia-sessoes/bin/next-id.sh T | Q | D | QD`. Cada prefixo tem um único autor, então não há colisão. Os prefixos também separam as filas: B nunca vê tarefa `D`, C nunca vê tarefa `T`.

## Scripts

Os scripts de `guia-sessoes/bin/` rodam a partir da raiz da documentação, de onde quer que sejam chamados. Os caminhos passados a eles são sempre relativos a essa raiz (`tasks/...`).

- A e B chamam `guia-sessoes/bin/<script>`.
- C chama pelo caminho absoluto `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation/guia-sessoes/bin/<script>` e grava os arquivos `.tmp` pelo caminho absoluto `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation/tasks/...`.

## Ciclo de vida

```
A cria T ou D ──► todo/ ──(B ou C assume)──► in-progress/ ──(conclui)──► done/ ──(A revisa)
                                                  │
                                           tem dúvida
                                                  ▼
                                   questions/Q ou QD ──(A responde)──► in-progress/ (dúvida + resposta)
                                                                                │
                                                                    consome e retoma a tarefa
                                                                                ▼
                                                                         done/ (dúvida + resposta)
```

| Evento | Quem | Ação |
| --- | --- | --- |
| create | A | Escreve `tasks/todo/<T ou D>-NNNN-slug.md.tmp` e publica com `move.sh A create <arquivo.tmp> tasks/todo` |
| claim | B ou C | `move.sh <B|C> claim tasks/todo/<arquivo> tasks/in-progress` |
| ask | B ou C | Escreve `tasks/questions/<Q ou QD>-NNNN-<tarefa>.md.tmp` e publica com `move.sh <B|C> ask <arquivo.tmp> tasks/questions` |
| answer | A | Escreve `tasks/in-progress/A-<Q ou QD>-NNNN.md.tmp`, publica com `move.sh A answer ... tasks/in-progress` e move a dúvida com `move.sh A answer tasks/questions/<dúvida> tasks/in-progress` |
| consume | B ou C | Lê dúvida e resposta, anexa o resumo na tarefa (seção "Dúvidas resolvidas"), move as duas com `move.sh <B|C> consume ... tasks/done` |
| complete | B ou C | Anexa a seção "Resultado" na tarefa e move com `move.sh <B|C> complete ... tasks/done` |
| review | A | Anexa a seção "Revisão do arquiteto" na tarefa em `done/` e marca com `seen.sh A <arquivo>` |

Publicar sempre via `.tmp` + `move.sh`. O watcher ignora `.tmp`, então ninguém lê arquivo pela metade.

## Posse dos arquivos

| Arquivo | Dono | Quem mais pode escrever |
| --- | --- | --- |
| Tarefa em `todo/` | A | Ninguém. A corrige criando outra tarefa ou editando antes de alguém assumir |
| Tarefa em `in-progress/` | Quem assumiu (B ou C) | Ninguém |
| Tarefa em `done/` | Quem assumiu, até mover | A anexa só a seção "Revisão do arquiteto" |
| Dúvida `Q-*` / `QD-*` | B / C | Ninguém |
| Resposta `A-Q-*` / `A-QD-*` | A | Ninguém |

Uma resposta errada não se edita: A escreve uma tarefa nova ou quem perguntou faz uma dúvida nova.

## Seções anexadas por B ou C

```md
## Dúvidas resolvidas
- QD-0003: decisão 1 (aprovado_por: arquiteto). Efeito: ...

## Resultado
- Entregáveis: caminhos dos arquivos produzidos (C: branch e commits).
- Critério de pronto: cada item com ✔ ou ✘ e a evidência (comando e saída, teste, contagem).
- Pendências: o que ficou aberto, onde foi registrado.
- Sugestão de próxima tarefa (opcional).
```

## Seção anexada por A

```md
## Revisão do arquiteto
- Veredito: aceita | aceita com ressalva | refazer
- Motivo: ...
- Tarefas derivadas: T-00NN / D-00NN (se houver)
```

"Refazer" nunca reabre o arquivo. Vira tarefa nova que cita a anterior.

## Desenvolvimento no app (sessão C)

- **Só se implementa o que está decidido.** A cria tarefa `D` apenas para fatias de ADR com status **Aceito** no `LEDGER.md`, ou para trabalho de infraestrutura que não depende de ADR. Fatia de ADR Proposto espera.
- **Uma tarefa, uma branch.** C cria `dev/D-NNNN-slug` a partir da `main` atualizada, faz commits nela e nunca commita na `main`.
- **Pronto é verificável.** Toda tarefa `D` termina com build, typecheck e testes rodando, com a saída real anexada ao "Resultado", e com o nome da branch e a lista de commits.
- **Revisão por A.** A lê o diff (`git -C <app> diff main...dev/D-NNNN-slug`) e confere contra os contratos do ledger e as regras do `CLAUDE.md` da documentação.
- **Merge só com aprovação.** Branch aceita na revisão entra na `main` só com `app-release`. A junta as branches aceitas de uma sprint numa única pergunta ao humano.
- **Sprint.** A agrupa as tarefas `D` em sprints curtas (de 3 a 6 tarefas). No fim de cada sprint, manda ao humano um resumo: o que foi aceito, o que pede merge, o que vem a seguir.

## Quem decide

**A decide sozinha** toda dúvida técnica de B e de C, inclusive as difíceis de reverter, aplicando as heurísticas da seção 8 do handoff e registrando o porquê na resposta (`aprovado_por: arquiteto`).

**Só as categorias abaixo sobem ao humano.** A obtém o sim explícito dele na própria conversa, já levando a recomendação pronta, e responde com `aprovado_por: humano`. B e C **recusam** executar resposta dessas categorias sem esse campo e abrem uma dúvida nova apontando a falta.

| Categoria (`categoria_aprovacao`) | Exemplos |
| --- | --- |
| `ledger` | Qualquer edição em `adrs/LEDGER.md` |
| `aceite-adr` | Mudar status de ADR para Aceito |
| `dependencias` | Instalar pacote ou baixar binário no spike da documentação |
| `reabertura` | Contornar ou reabrir contrato vinculante |
| `fora-de-work` | B escrevendo fora de `adrs/_work/` e `tasks/` (ex.: criar `adrs/ADR-NNN-*.md`) |
| `commit` | Qualquer commit no repositório da documentação |
| `app-release` | No app: merge na `main`, `push`, dependência nova no `package.json`, migration do Supabase, alteração de política RLS, qualquer coisa que o Lovable passe a ver |

Commit na branch `dev/D-*` do app **não** precisa de aprovação. É o trabalho normal de C.

**Alcance de uma aprovação.** Uma resposta com `aprovado_por: humano` vale para as ações que ela lista explicitamente na seção "Instrução", e só para elas.

Paradas do `/adr` são sempre dúvidas `tipo: parada`. A parada 3 leva `dependencias`. A parada 5 leva `ledger` e `aceite-adr`.

## Escuta

Cada sessão chama o watcher em ciclo.

| Sessão | Comando de escuta |
| --- | --- |
| A | `guia-sessoes/bin/wait-for.sh A 570 tasks/questions:Q-*.md tasks/questions:QD-*.md tasks/done:T-*.md tasks/done:D-*.md` |
| B | `guia-sessoes/bin/wait-for.sh B 570 tasks/todo:T-*.md tasks/in-progress:A-Q-*.md` |
| C | `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation/guia-sessoes/bin/wait-for.sh C 570 tasks/todo:D-*.md tasks/in-progress:A-QD-*.md` |

- Chamar o Bash com timeout de 600000 ms. Se a instalação limitar a 120000 ms, usar 110 no lugar de 570.
- Saída `NEW <arquivo>`: tratar o arquivo e voltar a escutar. O caminho é relativo à raiz da documentação.
- Saída `TIMEOUT`: voltar a escutar, sem comentar.
- Arquivo que continua no lugar depois de tratado (tarefas em `done/`, no caso de A) é marcado com `seen.sh`.

## Ociosidade

Depois de seis `TIMEOUT` seguidos (cerca de uma hora), a sessão para de escutar e escreve ao humano uma linha: o que está pendente e de quem.

## Paralelismo

B e C trabalham em paralelo. Cada um pode assumir outra tarefa da própria fila enquanto espera resposta bloqueante, desde que ela não dependa da bloqueada e não mexa nos mesmos arquivos (C: não mexa na mesma branch).

## Encerramento

- **Trilha de ADR:** quando o ADR 012 for aceito, A cria `T-NNNN-encerrar.md` (`tipo: encerrar`). B confere que não sobrou nada seu em `todo/`, `questions/` e `in-progress/`, conclui e **para de escutar**.
- **Trilha de desenvolvimento:** quando a meta de desenvolvimento for atingida, ou o humano mandar, A cria `D-NNNN-encerrar.md` (`tipo: encerrar`). C confere que não há branch `dev/D-*` aceita sem merge nem trabalho sem commit, conclui e **para de escutar**.
- A revisa as duas, entrega ao humano o resumo final e **para de escutar** quando as duas trilhas estiverem encerradas.

## Recuperação

- Sessão caiu ou foi reaberta: relê `tasks/LOG.md` do fim para o começo e o estado das pastas, e retoma da última linha que é sua. Não refaz bootstrap se `tasks/` já tem tarefa da sua fila.
- Arquivo em pasta errada: não mover à mão. A pergunta ao humano, B e C abrem dúvida.
