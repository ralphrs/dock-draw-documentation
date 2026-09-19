# Protocolo de comunicação entre sessões

Duas sessões do Claude Code trabalham no mesmo `adr-kit/` e se comunicam só por arquivos em `tasks/`.

| Sessão | Papel | Referência |
| --- | --- | --- |
| **A** | Arquiteto. Representa a sessão de arquitetura do claude.ai. Cria tarefas, responde dúvidas, revisa entregas, escala ao humano | `insumos/HANDOFF-ARQUITETURA.md` |
| **B** | Executor. Roda o `/adr`, spikes e pesquisa. Executa tarefas, pergunta quando precisa, entrega resultado | `CLAUDE.md`, `.claude/commands/adr.md` |

O humano conversa com A. B só fala com o humano se A estiver parado há mais de uma hora (ver "Ociosidade").

## Pastas

```
tasks/
├── todo/          tarefas novas, criadas por A, esperando B
├── in-progress/   tarefas que B assumiu + respostas de A às dúvidas (A-*.md) + a dúvida respondida (Q-*.md)
├── questions/     dúvidas de B esperando A
├── done/          tarefas concluídas (com Resultado e Revisão) e pares Q/A já consumidos
├── .state/        controle dos watchers (A.seen, B.seen). Não editar
└── LOG.md         uma linha por evento, escrita pelos scripts
```

## Nomes de arquivo

| Tipo | Nome | Quem cria | Modelo |
| --- | --- | --- | --- |
| Tarefa | `T-0001-slug-curto.md` | A | `guia-sessoes/templates/TASK.md` |
| Dúvida | `Q-0001-T-0001.md` | B | `guia-sessoes/templates/QUESTION.md` |
| Resposta | `A-Q-0001.md` | A | `guia-sessoes/templates/ANSWER.md` |

Ids sequenciais com quatro dígitos, obtidos com `guia-sessoes/bin/next-id.sh T` ou `Q`. Só A gera `T`, só B gera `Q`, então não há colisão.

## Ciclo de vida

```
A cria T ──► todo/ ──(B assume)──► in-progress/ ──(B conclui)──► done/ ──(A revisa)
                                        │
                              B tem dúvida
                                        ▼
                                  questions/Q ──(A responde)──► in-progress/ (Q + A-Q)
                                                                      │
                                                          B consome e retoma a tarefa
                                                                      ▼
                                                                done/ (Q + A-Q)
```

| Evento | Quem | Ação |
| --- | --- | --- |
| create | A | Escreve `tasks/todo/T-NNNN-slug.md.tmp` e publica com `move.sh A create <arquivo.tmp> tasks/todo` |
| claim | B | `move.sh B claim tasks/todo/T-... tasks/in-progress` |
| ask | B | Escreve `tasks/questions/Q-NNNN-T-NNNN.md.tmp` e publica com `move.sh B ask <arquivo.tmp> tasks/questions` |
| answer | A | Escreve `tasks/in-progress/A-Q-NNNN.md.tmp`, publica com `move.sh A answer ... tasks/in-progress` e move a dúvida com `move.sh A answer tasks/questions/Q-... tasks/in-progress` |
| consume | B | Lê Q e A-Q, anexa o resumo na tarefa (seção "Dúvidas resolvidas"), move os dois com `move.sh B consume ... tasks/done` |
| complete | B | Anexa a seção "Resultado" na tarefa e move com `move.sh B complete ... tasks/done` |
| review | A | Anexa a seção "Revisão do arquiteto" na tarefa em `done/` e marca com `seen.sh A <arquivo>` |

Publicar sempre via `.tmp` + `move.sh`. O watcher ignora `.tmp`, então ninguém lê arquivo pela metade.

## Posse dos arquivos

| Arquivo | Dono | Quem mais pode escrever |
| --- | --- | --- |
| Tarefa em `todo/` | A | Ninguém. A corrige criando outra tarefa ou editando antes de B assumir |
| Tarefa em `in-progress/` | B | Ninguém |
| Tarefa em `done/` | B até mover | A anexa só a seção "Revisão do arquiteto" |
| Dúvida `Q-*` | B | Ninguém |
| Resposta `A-Q-*` | A | Ninguém |

Uma resposta errada não se edita: A escreve uma tarefa nova ou B faz uma dúvida nova.

## Seções anexadas pela sessão B

```md
## Dúvidas resolvidas
- Q-0003: decisão 1 (aprovado_por: humano). Efeito: ...

## Resultado
- Entregáveis: caminhos dos arquivos produzidos.
- Critério de pronto: cada item com ✔ ou ✘ e a evidência (comando e saída, teste, contagem).
- Pendências: o que ficou aberto, onde foi registrado.
- Sugestão de próxima tarefa (opcional).
```

## Seção anexada pela sessão A

```md
## Revisão do arquiteto
- Veredito: aceita | aceita com ressalva | refazer
- Motivo: ...
- Tarefas derivadas: T-00NN (se houver)
```

"Refazer" nunca reabre o arquivo. Vira tarefa nova que cita a anterior.

## Aprovação humana

As categorias abaixo exigem que A obtenha a aprovação do humano na própria conversa antes de responder. A resposta leva `aprovado_por: humano`. B **recusa** executar resposta dessas categorias sem esse campo e abre uma dúvida nova apontando a falta.

| Categoria (`categoria_aprovacao`) | Exemplos |
| --- | --- |
| `ledger` | Qualquer edição em `adrs/LEDGER.md` |
| `aceite-adr` | Mudar status de ADR para Aceito |
| `dependencias` | Instalar pacote, baixar binário |
| `reabertura` | Contornar ou reabrir contrato vinculante |
| `fora-de-work` | Escrever fora de `adrs/_work/` e `tasks/` (ex.: criar `adrs/ADR-NNN-*.md`, mexer em insumos) |
| `commit` | Qualquer commit |

Paradas do `/adr` são sempre dúvidas (`tipo: parada`). As paradas 3 e 5 têm categoria de aprovação.

## Escuta

Nenhuma sessão fica ouvindo sozinha: cada uma chama o watcher em ciclo.

```
guia-sessoes/bin/wait-for.sh <A|B> <timeout_s> <pasta:glob> ...
```

| Sessão | Comando de escuta |
| --- | --- |
| A | `guia-sessoes/bin/wait-for.sh A 570 tasks/questions:Q-*.md tasks/done:T-*.md` |
| B | `guia-sessoes/bin/wait-for.sh B 570 tasks/todo:T-*.md tasks/in-progress:A-Q-*.md` |

- Chamar o Bash com timeout de 600000 ms. Se a instalação limitar a 120000 ms, usar 110 no lugar de 570.
- Saída `NEW <arquivo>`: tratar o arquivo e voltar a escutar.
- Saída `TIMEOUT`: voltar a escutar, sem comentar.
- Arquivo que continua no lugar depois de tratado (só tarefas em `done/`, no caso de A) é marcado com `seen.sh`. Os demais saem da pasta ao serem tratados e não precisam de marca.

## Ociosidade

Depois de seis `TIMEOUT` seguidos (cerca de uma hora), a sessão para de escutar e escreve ao humano uma linha: o que está pendente e de quem. Evita consumo sem trabalho.

## Paralelismo em B

B pode assumir outra tarefa de `todo/` enquanto espera resposta bloqueante, desde que ela não dependa da tarefa bloqueada (`depende_de`) e não mexa nos mesmos arquivos. Nunca duas tarefas do mesmo ADR ao mesmo tempo sem A ter dito que são independentes.

## Recuperação

- Sessão caiu: ao voltar, relê `tasks/LOG.md` do fim para o começo e o estado das pastas, e retoma da última linha que é sua.
- Arquivo em pasta errada: não mover à mão. A sessão dona pergunta ao humano (A) ou abre dúvida (B).
