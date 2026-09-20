# Protocolo de comunicação entre sessões

Três sessões do Claude Code trabalham juntas e se comunicam só por arquivos em `tasks/`, dentro de `dok-draw-documentation/`.

| Sessão | Papel | Roda em | Referência |
| --- | --- | --- | --- |
| **A** | Arquiteto principal, gerente de projeto e scrum master. Conduz o roteiro dos ADRs, transforma fatias em tarefas, opera o Lovable, decide dúvidas técnicas, escala ao humano só as categorias de aprovação | `dok-draw-documentation/` | `insumos/HANDOFF-ARQUITETURA.md`, `guia-sessoes/PROMPT-SESSAO-A.md` |
| **B** | Arquiteto especialista que escreve. Produz os ADRs pelo `/adr`, os spikes, a pesquisa e as ordens de implementação | `dok-draw-documentation/` | `CLAUDE.md`, `.claude/commands/adr.md`, `guia-sessoes/PROMPT-SESSAO-B.md` |
| **C** | Especialista em arquitetura, revisora. Aprova a ordem antes de rodar e o resultado depois, contra os contratos. Não escreve código de produto | `dok-draw-app/` | `guia-sessoes/PROMPT-SESSAO-C.md` |
| **Lovable** | Implementador. Executa a ordem que A envia pelo MCP. Não decide nada | nuvem, commita na `main` | `decisoes/DEC-0007-lovable-como-implementador.md` |

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

A pasta `tasks/` guarda a conversa, não o registro permanente. Decisão que precisa sobreviver à tarefa vai para `decisoes/`, escrita por A (`decisoes/DEC-0002-registro-de-decisoes.md`):

```
decisoes/
├── REGISTRO.md              índice cronológico, uma linha por decisão
├── DEC-NNNN-slug.md         decisão que não é contrato de camada: numeração, sequenciamento, meta, processo, kit
└── sprints/SPRINT-NN.md     objetivo, tarefas, resultado e pedido de merge de cada sprint
```

Contrato de arquitetura continua em `adrs/LEDGER.md`, e `decisoes/` não o duplica. B e C registram as decisões dela no "Resultado" da própria tarefa, em uma seção "Decisões tomadas", e A promove o que precisa durar.

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

## Desenvolvimento no app (Lovable executa, C revisa)

- **Só se implementa o que está decidido.** A cria tarefa apenas para fatias de ADR com status **Aceito** no `LEDGER.md`, ou para trabalho de infraestrutura que não depende de ADR. Fatia de ADR Proposto espera.
- **Quem escreve código é o Lovable.** A sessão C não implementa. O agente do Lovable recebe uma ordem por `send_message`, escrita por B a partir do contrato da fatia e revisada por C antes de rodar.
- **O Lovable commita na `main`.** Não há branch. O commit atualiza o preview do projeto e **não** altera a produção: publicar é a ação separada `deploy_project`, categoria `app-release`, que só acontece com o sim do humano.
- **A revisão acontece duas vezes, e a primeira é a que paga.** `tipo: revisar-ordem` roda antes de qualquer código existir e pergunta se sobra decisão para quem executa. `tipo: revisar-resultado` roda depois, contra o diff, o build e o preview. Erro apanhado na primeira custa uma leitura, na segunda custa crédito, tempo e um revert na `main`.
- **Pronto é verificável, e a evidência é de C.** O Lovable não entrega saída de build, de typecheck nem de teste. C roda no repositório local depois do `git pull` e anexa a saída real ao "Resultado".
- **Desfazer é `git revert`.** Sem branch, não há o que descartar. Revert na `main` é ação de A, depois de falar com o humano, porque a `main` alimenta o Lovable.
- **Crédito é do humano.** `send_message` consome crédito do workspace. A pede autorização a cada envio.
- **Sprint.** A agrupa as fatias em sprints curtas (de 3 a 6). No fim de cada uma, manda ao humano o resumo: o que foi aceito, o que pede `deploy_project`, o que vem a seguir.

Ciclo de uma fatia:

```
1. A abre T para B       ->  B escreve a ordem derivada do contrato da fatia
2. A abre D para C       ->  tipo: revisar-ordem. Ambiguidade vira correção antes de custar crédito
3. A pede o sim humano   ->  send_message consome crédito do workspace
4. A envia ao Lovable    ->  commit na main, preview atualiza, produção intacta
5. A abre D para C       ->  tipo: revisar-resultado. Diff, build, typecheck, preview
6. A pede app-release    ->  deploy_project só com o sim do humano
```

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
| A | `guia-sessoes/bin/wait-for.sh A 570 'tasks/questions:Q-*.md' 'tasks/questions:QD-*.md' 'tasks/done:T-*.md' 'tasks/done:D-*.md'` |
| B | `guia-sessoes/bin/wait-for.sh B 570 'tasks/todo:T-*.md' 'tasks/in-progress:A-Q-*.md'` |
| C | `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation/guia-sessoes/bin/wait-for.sh C 570 'tasks/todo:D-*.md' 'tasks/in-progress:A-QD-*.md'` |

- **Os padrões vão entre aspas simples.** O shell é zsh, e sem elas ele tenta expandir `T-*.md` antes de chamar o script, não encontra arquivo com a fila vazia e aborta o comando com erro em vez de devolver `TIMEOUT`. Fila vazia é o estado normal de quem espera trabalho (`decisoes/DEC-0003-aspas-no-watcher.md`).
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
