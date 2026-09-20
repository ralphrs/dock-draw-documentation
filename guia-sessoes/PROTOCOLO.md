# Protocolo de comunicação entre sessões

Três sessões do Claude Code trabalham juntas e se comunicam por **issues do Jira**, no projeto `DDP` do site `dokdrawapp.atlassian.net`. A pasta `tasks/` foi o canal até 2026-09-20 e hoje guarda só o histórico (`decisoes/DEC-0009-comunicacao-por-jira.md`).

| Sessão | Papel | Roda em | Referência |
| --- | --- | --- | --- |
| **A** | Arquiteto principal, gerente de projeto e scrum master. Conduz o roteiro dos ADRs, transforma fatias em tarefas, opera o Lovable, decide dúvidas técnicas, escala ao humano só as categorias de aprovação | `dok-draw-documentation/` | `insumos/HANDOFF-ARQUITETURA.md`, `guia-sessoes/PROMPT-SESSAO-A.md` |
| **B** | Arquiteto especialista que escreve. Produz os ADRs pelo `/adr`, os spikes, a pesquisa e as ordens de implementação | `dok-draw-documentation/` | `CLAUDE.md`, `.claude/commands/adr.md`, `guia-sessoes/PROMPT-SESSAO-B.md` |
| **C** | Especialista em arquitetura, revisora. Aprova a ordem antes de rodar e o resultado depois, contra os contratos. Não escreve código de produto | `dok-draw-app/` | `guia-sessoes/PROMPT-SESSAO-C.md` |
| **Lovable** | Implementador. Executa a ordem que A envia pelo MCP. Não decide nada | nuvem, commita na `main` | `decisoes/DEC-0007-lovable-como-implementador.md` |

Caminhos:

- Documentação (A e B): `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation`
- App Lovable (C): `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app`

O humano conversa com A, e acompanha o quadro. B e C só falam com o humano se A estiver parado há mais de uma hora (ver "Ociosidade").

## Objetivo e fim

Há duas trilhas:

- **Trilha de ADR (B):** escolher, camada por camada, a stack da engine de documentação. Termina quando o **ADR 012** for aceito.
- **Trilha de desenvolvimento (C e Lovable):** implementar no app as fatias de implementação dos ADRs **aceitos**, na ordem de dependência. Termina quando a meta de desenvolvimento definida pelo humano for atingida.

O roteiro, a meta e os critérios de parada estão em `PROMPT-SESSAO-A.md`. O encerramento segue a seção "Encerramento".

## O quadro

Site `https://dokdrawapp.atlassian.net`, `cloudId` `5f3024da-2ee6-4363-81e4-ec0230c86f6e`, projeto **DDP**, tipo de item **Tarefa**. Toda chamada ao MCP do Atlassian passa o `cloudId`.

| Status | Significa | Bola com |
| --- | --- | --- |
| `A FAZER` | Tarefa escrita por A, esperando quem assume | B ou C |
| `EM ANDAMENTO` | Assumida, trabalho rodando | B ou C |
| `BLOQUEADA` | Dúvida aberta em comentário, esperando decisão da arquitetura | A |
| `AGUARDANDO APROVAÇÃO` | Escalada ao humano, numa das sete categorias | humano |
| `EM REVISÃO` | Entregue com resultado e evidência, esperando conferência | A |
| `CONCLUÍDA` | Revisada e aceita por A | ninguém |

Ids de transição, para a chamada de transição do MCP:

| Para | id |
| --- | --- |
| A FAZER | `21` |
| EM ANDAMENTO | `31` |
| BLOQUEADA | `2` |
| AGUARDANDO APROVAÇÃO | `3` |
| EM REVISÃO | `4` |
| CONCLUÍDA | `41` |

### Contas

| Sessão | accountId |
| --- | --- |
| A | `712020:ed8eef8a-2595-4b25-aec0-b64f1e399096` |
| B | `712020:ec30868f-8e34-4c25-97e2-cd920e5da679` |
| C | `712020:6ac2f667-9728-4b07-bffb-eaa19704a4c9` |
| Humano | `5d1ba41843efe40d1d30677c` |

O conector do Atlassian é autorizado na conta Claude, não por sessão, então toda escrita aparece como feita pelo humano. Quem fez o quê se lê em dois lugares: o **responsável** da issue e o **prefixo** do comentário. Todo comentário começa por `Sessão A:`, `Sessão B:` ou `Sessão C:`.

### Rótulos

| Rótulo | Uso |
| --- | --- |
| `sessao-b`, `sessao-c` | Fila de destino, redundante com o responsável e útil no JQL |
| `trilha-adr`, `trilha-dev` | Qual das duas trilhas |
| `adr-002`, `adr-005`, ... | ADR de origem. O projeto é business e não tem Epic, então o rótulo é o agrupador |
| `sprint-1`, ... | Sprint da trilha de desenvolvimento |
| `revisar-ordem`, `revisar-resultado`, `encerrar` | Tipo de tarefa, quando não é implementação comum |
| `aprovacao-humana` mais a categoria (`ledger`, `app-release`, ...) | O que a issue espera do humano |

## O que vive no Jira e o que vive em git

A issue carrega a conversa e o estado: objetivo, contrato que vale, entregáveis, critério de pronto, dúvidas, respostas, resultado e revisão.

O repositório carrega o que precisa de diff e histórico de texto: ADRs em `adrs/`, contratos em `adrs/LEDGER.md`, ordens em `adrs/_work/ordens/`, trabalho em `adrs/_work/` e decisões em `decisoes/`. A issue cita o caminho, nunca cola o documento inteiro.

```
decisoes/
├── REGISTRO.md              índice cronológico, uma linha por decisão
├── DEC-NNNN-slug.md         decisão que não é contrato de camada: numeração, sequenciamento, meta, processo, kit
└── sprints/SPRINT-NN.md     objetivo, tarefas, resultado e pedido de deploy de cada sprint
```

B e C registram as decisões delas no comentário de resultado, em "Decisões tomadas". A promove para `decisoes/` o que precisa durar.

## Ciclo de vida

```
A cria issue ──► A FAZER ──(B ou C assume)──► EM ANDAMENTO ──(entrega)──► EM REVISÃO ──(A revisa)──► CONCLUÍDA
                                                   │
                                            tem dúvida
                                                   ▼
                                              BLOQUEADA ──(A responde)──► EM ANDAMENTO
                                                   │
                                     categoria de aprovação
                                                   ▼
                                       AGUARDANDO APROVAÇÃO ──(humano responde)──► A responde ──► EM ANDAMENTO
```

| Evento | Quem | Ação |
| --- | --- | --- |
| criar | A | Cria a issue com descrição completa, responsável, rótulos. Nasce em `A FAZER` |
| assumir | B ou C | Transição `31` para `EM ANDAMENTO` |
| perguntar | B ou C | Comentário `Sessão X: dúvida` e transição `2` para `BLOQUEADA` |
| responder | A | Comentário `Sessão A: resposta` e transição `31` de volta. Reatribui se mudar de fila |
| escalar | A | Rótulos `aprovacao-humana` e a categoria, responsável passa a ser o humano, transição `3` |
| liberar | A | Depois do sim do humano, comentário de resposta com `aprovado_por: humano`, responsável volta para B ou C, transição `31` |
| entregar | B ou C | Comentário `Sessão X: resultado` e transição `4` para `EM REVISÃO` |
| revisar | A | Comentário `Sessão A: revisão` com o veredito e transição `41` para `CONCLUÍDA` |

Quem entrega nunca fecha a própria issue. `EM REVISÃO` existe para separar "B diz que terminou" de "A conferiu".

## Formato dos comentários

Dúvida, por B ou C:

```md
Sessão B: dúvida

**Pergunta.** Uma frase.
**Contexto.** O que foi feito, o que foi encontrado, caminho do arquivo com a evidência.
**Opções.** 1. Nome curto, o que implica, custo, o que muda em contrato. 2. ...
**Recomendação.** Opção e motivo em até três linhas. "Sem recomendação" é válido.
**Categoria de aprovação.** nenhuma | ledger | aceite-adr | dependencias | reabertura | fora-de-work | commit | app-release
```

Resposta, por A:

```md
Sessão A: resposta

**Decisão.** A opção escolhida, na primeira linha.
**Instrução.** O que fazer, com as travas. Executável sem contexto adicional.
**Por quê.** Curto, só o que muda a decisão.
**Registrar.** O que entra no ADR, no escopo ou nas pendências por causa desta resposta.
**aprovado_por.** arquiteto | humano
```

Resultado, por B ou C:

```md
Sessão B: resultado

**Entregáveis.** Caminhos dos arquivos produzidos.
**Critério de pronto.** Cada item com ✔ ou ✘ e a evidência real (comando e saída, teste, contagem).
**Decisões tomadas.** Cada uma com alternativa descartada e custo aceito.
**Pendências.** O que ficou aberto e onde está registrado.
```

Revisão, por A:

```md
Sessão A: revisão

**Veredito.** aceita | aceita com ressalva | refazer
**Motivo.** ...
**Tarefas derivadas.** DDP-NN, se houver
```

"Refazer" não reabre a issue. Vira issue nova que cita a anterior.

## Posse

| O que | Dono | Quem mais escreve |
| --- | --- | --- |
| Descrição da issue | A | Ninguém. A corrige criando issue nova, ou editando antes de alguém assumir |
| Status | Quem a tabela de eventos indica | Ninguém fora dela |
| Comentário | Quem escreveu | Ninguém edita comentário alheio |
| Responsável | A | B e C não reatribuem |

Resposta errada não se edita. A escreve uma issue nova ou quem perguntou abre outra dúvida.

## Desenvolvimento no app (Lovable executa, C revisa)

- **Só se implementa o que está decidido.** A cria tarefa apenas para fatias de ADR com status **Aceito** no `LEDGER.md`, ou para trabalho de infraestrutura que não depende de ADR. Fatia de ADR Proposto espera.
- **Quem escreve código é o Lovable.** A sessão C não implementa. O agente do Lovable recebe uma ordem por `send_message`, escrita por B a partir do contrato da fatia e revisada por C antes de rodar.
- **O Lovable commita na `main`.** Não há branch. O commit atualiza o preview do projeto e **não** altera a produção: publicar é a ação separada `deploy_project`, categoria `app-release`, que só acontece com o sim do humano.
- **A revisão acontece duas vezes, e a primeira é a que paga.** O rótulo `revisar-ordem` roda antes de qualquer código existir e pergunta se sobra decisão para quem executa. O rótulo `revisar-resultado` roda depois, contra o diff, o build e o preview. Erro apanhado na primeira custa uma leitura, na segunda custa crédito, tempo e um revert na `main`.
- **Pronto é verificável, e a evidência é de C.** O Lovable não entrega saída de build, de typecheck nem de teste. C roda no repositório local depois do `git pull` e anexa a saída real ao comentário de resultado.
- **Desfazer é `git revert`.** Sem branch, não há o que descartar. Revert na `main` é ação de A, depois de falar com o humano, porque a `main` alimenta o Lovable.
- **Crédito é do humano.** `send_message` consome crédito do workspace. A pede autorização a cada envio.
- **Sprint.** A agrupa as fatias em sprints curtas (de 3 a 6). No fim de cada uma, manda ao humano o resumo: o que foi aceito, o que pede `deploy_project`, o que vem a seguir.

Ciclo de uma fatia:

```
1. A abre issue para B   ->  B escreve a ordem derivada do contrato da fatia
2. A abre issue para C   ->  rótulo revisar-ordem. Ambiguidade vira correção antes de custar crédito
3. A pede o sim humano   ->  send_message consome crédito do workspace
4. A envia ao Lovable    ->  commit na main, preview atualiza, produção intacta
5. A abre issue para C   ->  rótulo revisar-resultado. Diff, build, typecheck, preview
6. A pede app-release    ->  deploy_project só com o sim do humano
```

## Quem decide

**A decide sozinha** toda dúvida técnica de B e de C, inclusive as difíceis de reverter, aplicando as heurísticas da seção 8 do handoff e registrando o porquê no comentário de resposta (`aprovado_por: arquiteto`).

**Só as categorias abaixo sobem ao humano.** A obtém o sim explícito dele, já levando a recomendação pronta, e responde com `aprovado_por: humano`. B e C **recusam** executar resposta dessas categorias sem esse campo, e abrem uma dúvida nova apontando a falta.

| Categoria | Exemplos |
| --- | --- |
| `ledger` | Qualquer edição em `adrs/LEDGER.md` |
| `aceite-adr` | Mudar status de ADR para Aceito |
| `dependencias` | Instalar pacote ou baixar binário no spike da documentação |
| `reabertura` | Contornar ou reabrir contrato vinculante |
| `fora-de-work` | B escrevendo fora de `adrs/_work/` (ex.: criar `adrs/ADR-NNN-*.md`) |
| `commit` | Qualquer commit no repositório da documentação |
| `app-release` | No app: `deploy_project`, push na `main`, dependência nova, migration do Supabase, política RLS, qualquer coisa que o Lovable passe a ver |

**Alcance de uma aprovação.** Uma resposta com `aprovado_por: humano` vale para as ações que ela lista na "Instrução", e só para elas.

Paradas do `/adr` são sempre dúvidas. A parada 3 leva `dependencias`. A parada 5 leva `ledger` e `aceite-adr`.

O humano responde comentando na issue, ou direto na conversa com A. Nos dois casos A registra o sim no comentário de resposta, porque B e C leem a issue, não a conversa.

## Escuta

Não há mais watcher de arquivo. Cada sessão alterna espera e consulta:

```
loop:
  guia-sessoes/bin/espera.sh 540      (Bash, run_in_background: a sessão volta quando o comando termina)
  consulta JQL da sua fila
  trata o que apareceu, ou nada
```

| Sessão | JQL |
| --- | --- |
| A | `project = DDP AND status in ("BLOQUEADA", "EM REVISÃO") ORDER BY updated DESC` |
| B | `project = DDP AND assignee = "712020:ec30868f-8e34-4c25-97e2-cd920e5da679" AND status in ("A FAZER", "EM ANDAMENTO") ORDER BY updated DESC` |
| C | `project = DDP AND assignee = "712020:6ac2f667-9728-4b07-bffb-eaa19704a4c9" AND status in ("A FAZER", "EM ANDAMENTO") ORDER BY updated DESC` |

- B e C incluem `EM ANDAMENTO` na consulta porque é o status para onde A devolve uma issue respondida. Ao ver uma issue própria em `EM ANDAMENTO` com comentário novo, leia o comentário antes de retomar.
- A consulta custa uma chamada de ferramenta por volta, com ou sem novidade. É o preço de trocar evento por consulta (`decisoes/DEC-0009-comunicacao-por-jira.md`).
- Nada novo na fila: espere de novo, sem comentar.

## Ociosidade

Depois de seis voltas seguidas sem novidade (cerca de uma hora), a sessão para de escutar e escreve ao humano uma linha: o que está pendente e de quem.

## Paralelismo

B e C trabalham em paralelo. Cada um pode assumir outra issue da própria fila enquanto espera resposta bloqueante, desde que não dependa da bloqueada e não mexa nos mesmos arquivos.

## Encerramento

- **Trilha de ADR:** quando o ADR 012 for aceito, A cria uma issue com o rótulo `encerrar` para B. B confere que não sobrou issue sua fora de `CONCLUÍDA`, entrega e **para de escutar**.
- **Trilha de desenvolvimento:** quando a meta for atingida, ou o humano mandar, A cria a issue `encerrar` para C. C confere que não há fatia aceita sem `deploy_project` pedido, entrega e **para de escutar**.
- A revisa as duas, entrega ao humano o resumo final e **para de escutar** quando as duas trilhas estiverem encerradas.

## Recuperação

- Sessão caiu ou foi reaberta: consulte a própria fila no Jira, mais `project = DDP ORDER BY updated DESC`, e retome pela issue mais recente que é sua. O histórico da issue diz o que já aconteceu.
- Issue em status que não corresponde ao trabalho real: não conserte em silêncio. A pergunta ao humano, B e C abrem dúvida na própria issue.
- As tarefas anteriores a 2026-09-20 estão em `tasks/done/`, em arquivo, com resultado e revisão. `DDP-4` resume o que elas decidiram.
