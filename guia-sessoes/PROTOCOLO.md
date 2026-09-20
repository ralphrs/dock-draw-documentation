# Protocolo de comunicação entre sessões

Três sessões do Claude Code trabalham juntas e se comunicam por **issues do Jira**, no projeto `DDP` do site `dokdrawapp.atlassian.net`. A pasta `tasks/` foi o canal até 2026-09-20 e hoje guarda só o histórico (`decisoes/DEC-0009-comunicacao-por-jira.md`).

| Sessão | Papel | Roda em | Referência |
| --- | --- | --- | --- |
| **A** | Arquiteto principal, gerente de projeto e scrum master. Conduz o roteiro dos ADRs, transforma fatias em tarefas, opera o Lovable, decide dúvidas técnicas, escala ao humano só as categorias de aprovação | `dok-draw-documentation/` | `insumos/HANDOFF-ARQUITETURA.md`, `guia-sessoes/PROMPT-SESSAO-A.md` |
| **B** | Arquiteto especialista que escreve. Produz os ADRs pelo `/adr`, os spikes, a pesquisa e as ordens de implementação | `dok-draw-documentation/` | `CLAUDE.md`, `.claude/commands/adr.md`, `guia-sessoes/PROMPT-SESSAO-B.md` |
| **C** | Especialista em arquitetura, revisora. Aprova a ordem antes de rodar e o resultado depois, contra os contratos. Não escreve código de produto | `dok-draw-app/` | `guia-sessoes/PROMPT-SESSAO-C.md` |
| **Lovable** | Implementador. Lê a ordem na issue do Jira, executa e comenta o resultado. Não decide nada | nuvem, commita na `main` | `decisoes/DEC-0007-lovable-como-implementador.md` |

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
| `lovable` | A issue é uma ordem de implementação. A descrição é o texto que o agente do Lovable executa |
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
- **Quem escreve código é o Lovable.** A sessão C não implementa. A ordem é escrita por B a partir do contrato da fatia e revisada por C antes de rodar.
- **A ordem é a issue.** Desde 2026-09-20 o agente do Lovable tem o conector Atlassian ligado e lê o quadro `DDP` direto. A ordem vai na descrição de uma issue de rótulo `lovable`, e o `send_message` encolhe para uma mensagem curta que nomeia a chave. Existe uma cópia só do texto, que é a que C revisa e a que o Lovable executa. O arquivo em `adrs/_work/ordens/` continua sendo a fonte versionada, e traz a chave da issue no cabeçalho.
- **A descrição da ordem congela quando o Lovable é acordado.** Até lá, A corrige a descrição pelo que C apontou. Depois disso, correção vai como comentário de emenda e nova execução, porque editar por baixo de quem está executando produz um resultado que ninguém revisou.
- **O Lovable não escuta o quadro.** Ele não tem ciclo, não consulta fila e não descobre trabalho sozinho. Quem vigia a fila de rótulo `lovable` é a sessão A, que despacha quando a ordem está revisada por C e, quando for o caso, aprovada pelo humano. O retorno dele cai na fila de A sem nada especial, porque ele move a própria issue para `EM REVISÃO`, que já é o status que A escuta.
- **O Lovable escreve pouco no quadro.** Comenta o resultado com a primeira linha `Lovable: resultado`, move a própria issue para `EM REVISÃO`, e nada além disso. Não cria issue, não edita descrição, não fecha cartão, não responde dúvida de outro. As regras estão no knowledge do projeto no Lovable, que A mantém.
- **O Lovable commita na `main`.** Não há branch. O commit atualiza o preview do projeto e **não** altera a produção: publicar é a ação separada `deploy_project`, categoria `app-release`, que só acontece com o sim do humano.
- **A revisão acontece duas vezes, e a primeira é a que paga.** O rótulo `revisar-ordem` roda antes de qualquer código existir e pergunta se sobra decisão para quem executa. O rótulo `revisar-resultado` roda depois, contra o diff, o build e o preview. Erro apanhado na primeira custa uma leitura, na segunda custa crédito, tempo e um revert na `main`.
- **Pronto é verificável, e a evidência é de C.** O Lovable não entrega saída de build, de typecheck nem de teste. C roda no repositório local depois do `git pull` e anexa a saída real ao comentário de resultado.
- **Desfazer é `git revert`.** Sem branch, não há o que descartar. Revert na `main` é ação de A, depois de falar com o humano, porque a `main` alimenta o Lovable.
- **Crédito é do humano.** `send_message` consome crédito do workspace. A pede autorização a cada envio.
- **Sprint.** A agrupa as fatias em sprints curtas (de 3 a 6). No fim de cada uma, manda ao humano o resumo: o que foi aceito, o que pede `deploy_project`, o que vem a seguir.

Ciclo de uma fatia:

```
1. A abre issue para B   ->  B escreve a ordem derivada do contrato da fatia, em adrs/_work/ordens/
2. A publica a ordem     ->  issue de rótulo lovable, a descrição é o texto da ordem
3. A abre issue para C   ->  rótulo revisar-ordem, apontando a issue da ordem. Ajuste antes de custar crédito
4. A pede o sim humano   ->  send_message consome crédito do workspace
5. A acorda o Lovable    ->  mensagem curta com a chave. Ele executa, comenta e move para EM REVISÃO
6. A abre issue para C   ->  rótulo revisar-resultado. Diff, build, typecheck, preview
7. A pede app-release    ->  deploy_project só com o sim do humano
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

**Escopo de um commit.** A categoria `commit` vale para B e para C. A sessão A commita pelo mandato permanente do humano, e em troca nomeia os caminhos um a um: `git add <caminho>`, nunca `git add -A` nem `git commit -a`. As três sessões editam a mesma cópia de trabalho ao mesmo tempo, então um commit de escopo largo publica o rascunho de outra sessão no meio da execução dela. Em 2026-09-20 o commit `f742395` fez isso: levou ao `HEAD` um tsconfig temporário e parte de um fix experimental dentro de `adrs/_work/spike-s1/`, que é o artefato citado pelo ADR 005 como evidência do spike S-1 (`DDP-2`).

Paradas do `/adr` são sempre dúvidas. A parada 3 leva `dependencias`. A parada 5 leva `ledger` e `aceite-adr`.

### Como o humano responde

Dois caminhos valem, e a diferença é só quando A fica sabendo.

**Pela conversa com A.** Resposta imediata, A age na hora. É o caminho para quando os dois estão na mesma janela.

**Pelo quadro, sem A estar por perto.** Um arrasto do cartão, e o destino é a resposta:

| Destino | Significa |
| --- | --- |
| `EM ANDAMENTO` | **Sim.** Aprova todas as ações que a seção "O que a aprovação cobre" da issue lista, e só elas. Sem precisar comentar |
| `BLOQUEADA` | **Não**, ou sim com ressalva. Aqui o comentário é obrigatório, com o motivo ou com o que fica de fora |

O movimento é o que faz A acordar. Comentário sozinho não aparece em consulta nenhuma, porque JQL não sabe procurar por comentário novo, e um cartão parado em `AGUARDANDO APROVAÇÃO` é indistinguível de um que ninguém leu.

O destino do sim é `EM ANDAMENTO` e não `CONCLUÍDA` porque `CONCLUÍDA` quer dizer que as ações aprovadas já aconteceram. Fechar o cartão no momento da aprovação deixa o quadro afirmando um trabalho que ainda não foi feito, e apaga o rastro caso a execução falhe no meio. Quem move para `CONCLUÍDA` é A, depois de executar e dizer o que executou.

Uma issue de aprovação é escrita para caber nesse gesto: a lista de ações que o sim cobre é fechada e numerada, e A não faz nada fora dela.

Nos dois caminhos, A registra o sim no comentário de resposta com `aprovado_por: humano`, porque B e C leem a issue, não a conversa.

## Escuta

Não há mais watcher de arquivo. A espera de uma sessão pode acontecer em dois lugares, e o lugar muda o custo por ordem de grandeza.

### Modo preferido: a espera acontece fora da sessão

```
guia-sessoes/bin/aguarda-fila.sh <A|B|C> 60 3600      (Bash, run_in_background)
```

O script consulta a contagem da fila a cada 60 segundos e **só termina quando a fila tem alguma coisa**, ou quando o limite de uma hora estoura. Enquanto a fila está vazia, a sessão continua bloqueada no comando em segundo plano: nenhuma chamada de ferramenta, nenhum token, nenhum texto. Ela volta a pensar uma vez, já sabendo que há trabalho.

A diferença não é a requisição ao Jira, que é barata nos dois modos. É o contexto da sessão, que viaja inteiro a cada volta que o modelo dá. Uma noite parada custa uma volta por hora em vez de sete.

O script precisa de uma credencial de API do Atlassian, num arquivo fora deste repositório (`~/.config/dokdraw/jira.env`, com `JIRA_EMAIL` e `JIRA_TOKEN`). Nenhuma sessão lê esse arquivo: só o script o abre, e a leitura dele está negada nas permissões.

> [!WARNING]
> `/rest/api/3/search/approximate-count` responde `{"count":0}` com HTTP 200 mesmo sem autenticação válida. Credencial quebrada fica indistinguível de fila vazia, e a sessão esperaria para sempre por trabalho que ela nunca veria. Por isso o script confere a credencial em `/rest/api/3/myself` antes de entrar no laço e aborta com código 2 se ela não autenticar.

### Modo de reserva: a espera acontece dentro da sessão

Quando a credencial não está disponível, vale o par espera mais consulta, em duas etapas: primeiro um número, só depois o conteúdo.

```
loop:
  guia-sessoes/bin/espera.sh <n>      (Bash, run_in_background: a sessão volta quando o comando termina)
  conta a fila:  searchResultMode "count", sem campos
  0 resultados  -> dorme de novo, e <n> dobra até o teto
  1 ou mais     -> consulta de novo com os campos, trata, e <n> volta ao piso
```

| Sessão | JQL da fila |
| --- | --- |
| A | `project = DDP AND (status in ("BLOQUEADA", "EM REVISÃO") OR (status = "EM ANDAMENTO" AND labels = "aprovacao-humana"))` |
| B | `project = DDP AND assignee = "712020:ec30868f-8e34-4c25-97e2-cd920e5da679" AND status in ("A FAZER", "EM ANDAMENTO")` |
| C | `project = DDP AND assignee = "712020:6ac2f667-9728-4b07-bffb-eaa19704a4c9" AND status in ("A FAZER", "EM ANDAMENTO")` |

**A contagem é a volta normal.** `searchResultMode` em `count` devolve um número e nada mais, cerca de 250 tokens. A mesma consulta pedindo campos devolve de 3.000 a 5.000, porque o Jira manda junto URL de avatar, link de API e categoria de status de cada issue. Como a volta sem novidade é a maioria absoluta das voltas, é ela que precisa ser barata.

**Quando a contagem for maior que zero**, repita a consulta com `fields` e `ORDER BY updated DESC` para saber o que apareceu, e use `getJiraIssue` com `fields: ["summary","description","comment","status"]` na issue que interessa. Nunca peça `*all`.

**O intervalo dobra enquanto o quadro está parado.** Piso de 300 segundos, teto de 1800. A sessão começa no piso, dobra a cada volta vazia (300, 600, 1200, 1800, 1800...) e volta ao piso assim que tratar qualquer coisa. Uma fila parada de madrugada custa duas consultas por hora em vez de sete, e uma fila ativa continua respondendo em cinco minutos.

- B e C incluem `EM ANDAMENTO` na consulta porque é o status para onde A devolve uma issue respondida. Ao ver uma issue própria em `EM ANDAMENTO` com comentário novo, leia o comentário antes de retomar.
- Nada novo na fila: espere de novo, sem comentar.
- O custo real de escutar não é a chamada, é o contexto da sessão, que viaja inteiro a cada volta. Por isso a volta vazia não deve produzir texto nenhum: nem resumo, nem "nada novo até agora", nem atualização de painel.

## Ociosidade

Depois de seis voltas seguidas sem novidade, a sessão para de escutar e escreve ao humano uma linha: o que está pendente e de quem. Com o intervalo dobrando, seis voltas vazias somam cerca de duas horas.

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
