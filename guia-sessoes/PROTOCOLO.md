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
| `arquitetura`, `analise`, `ux-ui`, `desenvolvimento` | **Disciplina do trabalho.** Escrever ADR e decidir contrato é `arquitetura`. Medir, estimar, escrever ordem e revisar ordem é `analise`. Fatia com interface leva `ux-ui` junto de `desenvolvimento`. Uma issue pode ter mais de uma |
| `backlog` | Estoque, sem responsável. Não está na fila de ninguém e não vira trabalho até A priorizar |
| `fatia` | A issue representa uma fatia de implementação inteira, que A desdobra em ordem, revisão, execução e revisão quando chega a vez |
| `draft`, `liberada` | Canal de entrada do humano. Ver "Pedidos do humano" |
| `revisao-humana` | Entrega do Lovable esperando o olhar do dono do produto no preview |
| `revisar-ordem`, `revisar-resultado`, `encerrar` | Tipo de tarefa, quando não é implementação comum |
| `aprovacao-humana` mais a categoria (`ledger`, `app-release`, ...) | O que a issue espera do humano |

## Pedidos do humano

O humano cria issue direto no quadro, com as próprias palavras e sem seguir formato nenhum. Dois rótulos dizem em que ponto o pedido está.

| Rótulo | Significa | O que a sessão A faz |
| --- | --- | --- |
| `draft` | Ele ainda está escrevendo | Nada. A issue não entra na fila de A, e ler um pedido pela metade só produz refino errado |
| `liberada` | O pedido está pronto para análise | Entra na fila de A na próxima volta da escuta |

**O que A faz com um pedido `liberada`**, nesta ordem:

1. **Preserva o texto original.** Antes de tocar na descrição, copia o pedido inteiro para um comentário que começa com `Pedido original do humano`. A descrição vai ser reescrita, e o que ele pediu com as palavras dele não pode sumir no processo.
2. **Analisa contra o que já existe.** O pedido colide com contrato do `LEDGER.md`? Repete algo que já está no backlog? Depende de ADR que não existe? Cabe numa fatia já prevista?
3. **Reescreve no padrão**, na própria descrição: objetivo, contexto, entregável com caminho, critério de pronto verificável, restrições. Mesmo formato de qualquer issue do quadro.
4. **Classifica**: disciplina (`arquitetura`, `analise`, `ux-ui`, `desenvolvimento`), trilha, ADR de origem quando houver, e `backlog` se não for para agora.
5. **Troca o rótulo** `liberada` por `refinada`, para o pedido não ser reprocessado a cada volta.
6. **Comenta o que mudou** entre o pedido e a issue: o que foi interpretado, o que foi acrescentado e o que ficou de fora, com o motivo.

**Quando A não reescreve.** Se o pedido for ambíguo a ponto de duas leituras levarem a trabalhos diferentes, ou se ele contrariar um contrato aceito, a issue vai para `BLOQUEADA` com a dúvida, e o rótulo `liberada` fica. Contrariar contrato aceito é categoria `reabertura`, e a saída é uma proposta com custo, nunca um refino silencioso que acomode o pedido.

Refinar não é obedecer ao pé da letra nem reinterpretar por conta própria. É transformar um pedido em algo executável sem perder o que foi pedido.

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
- **Uma ordem entrega uma fatia, e tem teto de tamanho.** O teto é 10.000 caracteres de texto de ordem. Fatia cujo código não cabe nisso é dividida em sub-fatias antes de a ordem ser escrita, cada uma com bateria própria e com a `main` verde ao fim. Quem escreve a ordem confere, antes de entregar, que o conjunto de símbolos exportados é o da fatia e não o do arquivo inteiro de onde o código veio.

  A regra nasce medida. A ordem da fatia F1 do ADR 002 saiu com 31.449 caracteres, portou o arquivo inteiro do spike em vez do recorte da fatia, e com isso entregou junto a fatia F2 (`frontmatterSchema`, `DIRECTIVES`, `classifyUrl`, `Diagnostic`, `validateDok` e os 16 códigos de diagnóstico). Custou três passadas de revisão e quatro famílias de defeito antes do despacho. A fatia F0, de tamanho pequeno, passou de primeira.

  Portar arquivo inteiro é mais rápido para quem escreve a ordem e mais caro para todo o resto do ciclo, porque a revisão cresce com o tamanho da ordem e cada passada descobre uma família nova de defeito.
- **Ordem entregue traz a tabela de restrições do contrato.** Antes de entregar, quem escreve a ordem lista toda restrição do `LEDGER.md` que a fatia toca e aponta, para cada uma, a linha do código da ordem que a cumpre. Restrição que nenhuma linha cumpre entra na tabela como lacuna declarada, nunca fica de fora. A tabela vai no corpo da ordem, e a revisão começa por ela. Motivo: das quatro reprovações da ordem da F1, três eram conferíveis por leitura mecânica do contrato, e nenhuma foi apanhada na entrega. Revisão que descobre família nova de defeito a cada passada é revisão sem lista fechada.
- **A bateria de verificação roda no escopo da ordem.** Comando que escreve (`--write`, `--fix`) recebe a lista literal dos arquivos que a ordem cria ou edita, nunca o projeto inteiro. Comando que só confere pode rodar aberto quando já passa limpo na `main`, e nesse caso a ordem registra a medição do dia. Dívida anterior do repositório é nomeada como pré-existente, com o número medido, e fica fora da definição de pronto da fatia. Motivo em `decisoes/ACHADO-2026-09-20-bateria-de-verificacao-de-escopo-aberto.md`: a ordem da F1 abria com `prettier --write .` num escopo de três arquivos, o que reescreveria 64 arquivos alheios e 16 fixtures do corpus de teste.
- **Suíte verde não prova contrato cumprido.** A revisão de ordem confere cada restrição do `LEDGER.md` que a fatia toca contra o código colado, uma a uma. A ordem da F1 omitia o `DOK-E011` inteiro, e as 30 fixtures passariam mesmo assim, porque nenhuma delas chega perto do limite de tamanho. O que o teste não exercita, só a leitura apanha.
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
7. A abre issue para o humano -> rótulo revisao-humana. O que olhar no preview, com a URL
8. A pede app-release    ->  deploy_project só com o sim do humano
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

> [!IMPORTANT]
> **A sessão A nunca move uma issue de rótulo `aprovacao-humana` para `EM ANDAMENTO`.** Esse movimento é a assinatura do humano, e é a única coisa que distingue uma aprovação dada de uma aprovação pedida. O conector do Atlassian é da conta, não da sessão, então todo comentário e toda transição das três sessões e do Lovable aparecem com o mesmo autor do humano. O histórico do cartão não sabe dizer quem arrastou. A separação entre pedir e aprovar existe porque a sessão A se abstém do gesto, e não porque o Jira a impeça.
>
> Os movimentos que A faz numa issue de aprovação são dois: criar em `AGUARDANDO APROVAÇÃO`, e fechar em `CONCLUÍDA` depois de executar. Se uma issue de aprovação aparecer em `EM ANDAMENTO` e A não souber de resposta nenhuma, a saída é perguntar ao humano, nunca presumir o sim.

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
| A | `project = DDP AND (status in ("BLOQUEADA", "EM REVISÃO") OR (status = "EM ANDAMENTO" AND labels in ("aprovacao-humana", "revisao-humana")) OR (labels = "liberada" AND labels != "draft" AND status != "CONCLUÍDA"))` |
| B | `project = DDP AND assignee = "712020:ec30868f-8e34-4c25-97e2-cd920e5da679" AND status in ("A FAZER", "EM ANDAMENTO")` |
| C | `project = DDP AND assignee = "712020:6ac2f667-9728-4b07-bffb-eaa19704a4c9" AND status in ("A FAZER", "EM ANDAMENTO")` |

**A contagem é a volta normal.** `searchResultMode` em `count` devolve um número e nada mais, cerca de 250 tokens. A mesma consulta pedindo campos devolve de 3.000 a 5.000, porque o Jira manda junto URL de avatar, link de API e categoria de status de cada issue. Como a volta sem novidade é a maioria absoluta das voltas, é ela que precisa ser barata.

**Quando a contagem for maior que zero**, repita a consulta com `fields` e `ORDER BY updated DESC` para saber o que apareceu, e use `getJiraIssue` com `fields: ["summary","description","comment","status"]` na issue que interessa. Nunca peça `*all`.

**O intervalo dobra enquanto o quadro está parado.** Piso de 300 segundos, teto de 1800. A sessão começa no piso, dobra a cada volta vazia (300, 600, 1200, 1800, 1800...) e volta ao piso assim que tratar qualquer coisa. Uma fila parada de madrugada custa duas consultas por hora em vez de sete, e uma fila ativa continua respondendo em cinco minutos.

- B e C incluem `EM ANDAMENTO` na consulta porque é o status para onde A devolve uma issue respondida. Ao ver uma issue própria em `EM ANDAMENTO` com comentário novo, leia o comentário antes de retomar.
- Nada novo na fila: espere de novo, sem comentar.
- O custo real de escutar não é a chamada, é o contexto da sessão, que viaja inteiro a cada volta. Por isso a volta vazia não deve produzir texto nenhum: nem resumo, nem "nada novo até agora", nem atualização de painel.

## Revisão do humano, depois de toda entrega do Lovable

Toda vez que o agente do Lovable entrega, a sessão A abre uma issue de rótulo `revisao-humana` para o dono do produto olhar o resultado com os próprios olhos. Ela vem depois da revisão da sessão C, para ele não gastar tempo com o que já foi reprovado por build, typecheck ou contrato.

A issue não pede um parecer genérico. Ela diz o que olhar:

1. **A URL do preview**, e a rota exata que mudou.
2. **O que mudou**, uma frase por item, tirada do diff e não da ordem. O que a ordem pediu e o que de fato entrou podem divergir, e é isso que a revisão procura.
3. **O que observar**, específico da fatia: qual fluxo percorrer, o que deveria acontecer em cada passo, e o que seria sinal de problema.
4. **O que a sessão C já verificou**, para ele não repetir: build, typecheck, lint, contrato, e o que ela olhou no preview.
5. **O que esta fatia não faz**, para ele não procurar o que ainda não existe e cobrar uma falta que pertence a outra fatia.

**Fatia sem interface também gera issue**, e o que ela pede é o contrário: confirmar que **nada mudou**. O Diagram Studio é a única parte do app que funciona hoje, e uma fatia de módulo interno pode quebrá-lo sem que teste nenhum apanhe, porque o app não tem teste de interface. A issue nomeia as telas que precisam continuar iguais.

**Como ele responde**, pelo mesmo gesto das aprovações: arrastar para `EM ANDAMENTO` quando estiver bom, ou para `BLOQUEADA` quando achar problema, com o problema em comentário. Problema achado aqui vira ordem nova para o Lovable, nunca ajuste direto no código.

## Agrupadores: a sprint que o Jira não tem

O projeto `DDP` é do tipo business, que não tem board ágil nem sprint nativa: sprint é recurso do Jira Software. O que existe é hierarquia, e o tipo de item **Fluxo de trabalho** fica um nível acima de Tarefa.

Sete agrupadores cobrem o quadro inteiro, e toda issue tem um pai:

| Agrupador | O que junta |
| --- | --- |
| `Sprint 1` a `Sprint 4` | As fatias que estão no caminho da meta de `DEC-0004`, uma sprint por ADR |
| `Backlog fora da meta` | Fatias de ADR aceito que a meta deixou de fora |
| `Trilha de ADR` | Os ADRs por escrever e o trabalho de contrato |
| `Governança e processo` | Aprovações, decisões de processo, verificação de canal, correção do kit. Separado de propósito, para que a contagem de entregas de produto não seja inflada por trabalho de processo |

**Para que serve na prática.** Filtrando o quadro por um agrupador, a coluna `CONCLUÍDA` mostra só o que aquela sprint fechou, em vez de todo o histórico do projeto. É o substituto do fechamento de sprint, que o tipo de projeto não oferece.

Sprint nova é um item `Fluxo de trabalho` novo, criado pela sessão A ao abrir a sprint, com o objetivo dela na descrição.

## Backlog e realimentação do quadro

Toda fatia de implementação de ADR aceito e todo ADR não escrito têm issue no quadro, com o rótulo `backlog` e **sem responsável**. Sem responsável significa fora da fila de B e de C, que filtram por `assignee`: o backlog é estoque visível, não trabalho despachado.

Quando o quadro fica sem trabalho ativo, A puxa do backlog, na ordem que o `PLANO.md` fixa: as fatias da sprint corrente primeiro, o roteiro de ADR depois. Priorizar uma fatia significa desdobrá-la em ordem, revisão de ordem, execução e revisão de resultado, e atribuir a primeira dessas a quem for dona.

A ordem de prioridade não é negociada por sessão. Quem muda o `PLANO.md` é A, e mudança de meta vem do humano.

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
