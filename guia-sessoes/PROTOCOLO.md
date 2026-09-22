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
| `backlog` | Estoque, sem responsável: tudo que não será desenvolvido agora, inclusive o que antes se chamava roadmap (rótulo extinto em 2026-09-22). Não está na fila de ninguém e não vira trabalho até A priorizar |
| `processo` | Melhoria do próprio processo, sob o agrupador `Governança e processo`. Nasce sem responsável, em `A FAZER`, e só a sessão A puxa. Ver `decisoes/DEC-0016` |
| `fatia` | A issue representa uma fatia de implementação inteira, que A desdobra em ordem, revisão, execução e revisão quando chega a vez |
| `draft`, `liberada` | Canal de entrada do humano. Ver "Pedidos do humano" |
| `revisar-ordem`, `revisar-resultado`, `encerrar` | Tipo de tarefa, quando não é implementação comum |
| categoria (`ledger`, `app-release`, ...) | O que a issue espera do humano, junto de `humano` |
| `humano` | Único rótulo de humano desde 2026-09-22 (os antigos `aprovacao-humana` e `humano` foram fundidos nele a pedido do humano). Toda issue que espera algo do humano, seja aprovação, resposta, conferência no preview ou tarefa manual. Vai junto de `aprovacao-humana`, `humano` e das bloqueadas por ele. É o filtro que o humano usa para achar o que é dele. Pedido dele em 2026-09-22 |
| `sessao-d` | Tarefa da sessão D, designer de formas no Figma. É a fila dela, porque a D não tem conta no Jira (`DEC-0024`) |

**Correção da sessão A para a sessão D vai na descrição de uma tarefa dela ainda aberta, nunca só num comentário de cartão fechado.** A sessão D não lê cartão depois de entregar e não relê o próprio prompt enquanto roda. Em 2026-09-21 duas correções escritas em cartão fechado não chegaram a ela, e uma tarefa de prioridade foi pulada porque a regra entrou no prompt depois que ela começou. A escuta dela, `aguarda-fila.sh D`, passou a imprimir a próxima tarefa na ordem certa (em andamento, depois prioridade, depois menor chave) e a mandar ler a descrição inteira.

## Ordem de trabalho

Toda sessão escolhe o que fazer olhando o quadro da direita para a esquerda e age na primeira coluna em que tem um card com a bola (`DEC-0038`). Só passa à coluna seguinte quando a anterior está vazia para ela.

| Ordem | Coluna | Sessão A | Sessões B, C e D |
| --- | --- | --- | --- |
| 1 | `EM REVISÃO` | Conferir a entrega e mover no mesmo ciclo | Nada, a bola é de A |
| 2 | `AGUARDANDO APROVAÇÃO` | Resposta do humano e card órfão sem `humano` | Nada |
| 3 | `BLOQUEADA` | Responder a dúvida | Card próprio cuja resposta de A já chegou |
| 4 | `EM ANDAMENTO` | Aprovação respondida, despacho ao Lovable, pedido `liberada` | Retomar o que começou, inclusive correção devolvida na descrição |
| 5 | `A FAZER` | Estoque `processo` por último (`DEC-0016`) | Tarefa nova: `prioridade` primeiro, depois a menor chave |

A escuta `aguarda-fila.sh` imprime a fila já nessa ordem e nomeia a próxima tarefa. O card mais à direita é o que já custou trabalho de mais gente, e terminar vale mais que começar.

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
| escalar | A | Rótulos `humano` e a categoria, responsável passa a ser o humano, transição `3` |
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
- **Rótulo de opção não se repete em nenhuma outra lista da mesma issue.** Issue de aprovação que oferece escolha numera as opções com um esquema que não aparece em mais nenhum lugar do texto. A aprovação das notações do Diagram Studio usou A, B, C e D para os quatro problemas de arquitetura na análise e para as quatro opções de sequenciamento na pergunta, e a resposta "A, B, C e D" leu a primeira lista. Custou uma volta com o dono do produto, que é o recurso mais caro do processo.
- **A sessão A nunca põe nem deixa uma issue num status que a própria JQL dela vigia.** Ao terminar de tratar uma issue, ela vai para onde o próximo passo de fato está: `CONCLUÍDA` se acabou, `EM ANDAMENTO` se outra sessão continua, `AGUARDANDO APROVAÇÃO` se voltou a depender do humano, e `A FAZER` se está aprovada e só espera a vez. O último caso é o mais fácil de esquecer, porque a issue *parece* resolvida: a aprovação chegou, e o que falta é sequência. A escuta usa status como sinal de que outra sessão ou o humano agiu. Status posto pela sessão A é sinal falso, e o custo é um ciclo inteiro de escuta gasto com trabalho que ela mesma acabou de fazer. Aconteceu quatro vezes em 2026-09-20: a ordem da fatia F1 deixada em `EM REVISÃO` depois de lida, a issue de revisão do dono do produto criada em `EM ANDAMENTO`, uma aprovação respondida em parte deixada em `EM ANDAMENTO` enquanto esperava o resto da resposta, e uma aprovação inteira deixada ali enquanto a sessão A a segurava por sequência de despacho.
- **Toda issue que a sessão A recebe de EM REVISÃO muda de status no mesmo ciclo em que é lida.** Ou vai para CONCLUÍDA, ou volta para EM ANDAMENTO com a próxima etapa apontada em comentário. Issue que fica parada em EM REVISÃO depois de lida acorda a sessão a cada tique do `aguarda-fila.sh` sem trabalho novo, porque a JQL vigia o status, não o que já foi respondido.
- **O formato de texto do Jira depende do caminho de escrita, não do Jira.** Medido em 2026-09-20, quatro vezes, sempre contra o campo renderizado:

  | Caminho de escrita | Formato que renderiza | Medição |
  | :--- | :--- | :--- |
  | Conector MCP do Atlassian | **Markdown**, porque o conector converte | Descrição em Markdown rendeu três blocos `<pre>` com o SQL exato |
  | `curl` direto na REST v2 | **wiki markup** | Markdown por `curl` saiu com crase literal, sem negrito e sem código. O mesmo texto em wiki markup saiu correto |

  **Escrever no formato do caminho errado corrompe em silêncio.** O campo cru guarda o que foi enviado, e só o campo renderizado mostra o que o leitor recebe.

  A regra anterior mandava envolver todo bloco de código em `{code}`, e nasceu certa: o canal era wiki markup e texto cru era interpretado, com `(n)` e `(x)` virando emoticon, `-texto-` virando tachado, `|` virando separador e `?texto?` virando citação. A ordem da fatia F1 chegou ao executor com regex, união de tipos e parâmetros deturpados (`DDP-74`).

  O que ela não previu foi o conector passar a converter Markdown. Na aprovação `DDP-110` o `{code:sql}` foi enviado por ele, que inseriu espaços depois do abridor e o macro não abriu: o HTML saiu sem `<pre>`, com `{code:sql}` visível como texto solto. Cerca de crases no mesmo caminho não quebra, porque tolera o espaço.

  **A conferência é obrigatória antes de despachar ordem ou publicar aprovação**, e não se faz pelo campo cru:

  ```
  curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
    "https://dokdrawapp.atlassian.net/rest/api/2/issue/<CHAVE>?expand=renderedFields&fields=description"
  ```

  Verde é um bloco `<pre>` para cada trecho de código, e nenhum marcador sobrando: nada de crase, `{code`, `{{` ou `#` literais no HTML.

  **Em wiki markup, `{{...}}` não sobrevive a chave dentro.** O macro fecha no primeiro `}}`, e o resto do trecho vaza como texto. `{{z.object({ text: z.string() })}}` e `{{async ({ data }) => f(data)}}` saíram truncados em `DDP-91` e `DDP-104`. Trecho com chave vai em bloco `{code}`, que não interpreta nada dentro.

  **Emenda que muda o entregável vai para a descrição, nunca só para um comentário.** A sessão A mandou por comentário a coluna `workspace_id` de `space_members` em 2026-09-20, a sessão B entregou sem ela, e o ciclo se repetiu. Quem executa lê a descrição. É a mesma regra que a sessão A aplica em revisão de ordem, violada na direção contrária.

  **O que sobrevive a todas as versões desta regra:** formato de canal é premissa de infraestrutura, muda sem aviso e não se herda de uma entrega para a seguinte. Três regras diferentes em um dia, cada uma correta na hora em que foi escrita. A que não envelhece é a de medir o renderizado a cada uso.
- **A sessão A confere o commit contra a ordem versionada, caractere a caractere, antes de mandar para a revisão de resultado.** O executor pode ter reconstruído o que recebeu deturpado, e o relato dele de que reconstruiu certo não é evidência. Na F1 a conferência deu idêntico nos três arquivos, e foi o que permitiu seguir.
- **Uma ordem entrega uma fatia, e tem teto de tamanho.** O teto é 10.000 caracteres de texto de ordem. Fatia cujo código não cabe nisso é dividida em sub-fatias antes de a ordem ser escrita, cada uma com bateria própria e com a `main` verde ao fim. Quem escreve a ordem confere, antes de entregar, que o conjunto de símbolos exportados é o da fatia e não o do arquivo inteiro de onde o código veio.

  A regra nasce medida. A ordem da fatia F1 do ADR 002 saiu com 31.449 caracteres, portou o arquivo inteiro do spike em vez do recorte da fatia, e com isso entregou junto a fatia F2 (`frontmatterSchema`, `DIRECTIVES`, `classifyUrl`, `Diagnostic`, `validateDok` e os 16 códigos de diagnóstico). Custou três passadas de revisão e quatro famílias de defeito antes do despacho. A fatia F0, de tamanho pequeno, passou de primeira.

  Portar arquivo inteiro é mais rápido para quem escreve a ordem e mais caro para todo o resto do ciclo, porque a revisão cresce com o tamanho da ordem e cada passada descobre uma família nova de defeito.
- **Ordem que acrescenta arquivo a um módulo estende, no mesmo passo, a entrada de quem verifica aquele módulo.** O build de plataforma browser de `src/content-format` tem lista de entradas, e arquivo fora dela fica sem o único mecanismo que pega dependência transitiva com builtin do Node. A fatia F3 descobriu isso ao criar `refs.ts`, e a F4 repetiria. A exigência entra na tabela de restrições da ordem, onde a revisão a encontra.
- **O cartão de backlog da fatia fecha junto com a fatia.** Toda fatia nasce como issue de estoque, com rótulo `backlog` e sem responsável, e o trabalho acontece em issues próprias: escrever a ordem, revisar, despachar, revisar o resultado. O cartão original não fecha sozinho, e quem olhar o quadro vê fatia aberta com o código já em produção. Aconteceu com as três fatias da sprint 1 ao mesmo tempo, e só apareceu na tentativa de fechar o agrupador da sprint.

  Ao fechar a fatia, o comentário do cartão diz por onde o trabalho passou e o que sobrou, com o dono do que sobrou. Se não sobrou nada, diz isso.
- **Revisão que não consegue produzir a evidência devolve a falta, não um veredito.** A sessão C não tem ferramenta de consulta ao banco, e a revisão da primeira migração pedia conferir tipo de coluna, constraint e ausência de lixo em produção. Ela listou as sete tentativas, recusou-se a autenticar numa conta de produção porque isso não é leitura, recusou-se a reaproveitar o resumo da sessão A como se fosse a checagem pedida, e devolveu as consultas exatas que a desbloqueiam. Quem tem a ferramenta responde e a revisão segue numa volta só.

  O erro que essa disciplina evita é o mais barato de cometer: aceitar "o schema existe" como se cobrisse "as colunas têm os tipos certos". As duas frases parecem a mesma e não são.
- **Chave de issue só se cita depois de a issue existir.** Comentário escrito antes da criação obriga a adivinhar o número, e o Jira não entrega o que se espera quando mais de uma issue nasce na mesma rodada. Aconteceu duas vezes em 2026-09-20, as duas mandando quem lê para a issue errada. A ordem é criar, colher a chave devolvida, e só então escrever o comentário que aponta para ela.
- **A seção de restrições da ordem fala com quem executa, e com mais ninguém.** Restrição de trabalho de quem escreve a ordem ("não commitar", "não despachar", "não editar o ADR") vive na tarefa que pede a ordem, nunca no texto que vai ser despachado. Vazou em três ordens seguidas: a fatia F4 chegou ao executor mandando não commitar, ele obedeceu ao que leu e relatou que não havia commit, enquanto a `main` tinha o commit com os dois arquivos.

  Na fatia de código isso produziu só um relato errado. Numa ordem de migração produziria schema aplicado no banco com o arquivo fora do repositório, que é schema drift, e nenhuma revisão posterior o detecta lendo o repositório.
- **Achado de revisão que muda o texto da ordem volta para quem escreve, nunca fica em comentário.** A ordem é despachada como descrição de issue, e correção que mora no comentário de outra issue não viaja com ela: quem executa lê o texto com o defeito dentro. Vale mesmo quando o achado é pequeno e a revisora já escreveu o conserto pronto.
- **Roteiro de verificação que pode ficar vermelho com o sistema certo é defeito de gravidade própria.** Checagem que não reprova o que deveria já era barrada; esta é a inversa, e o custo depende do que está do outro lado. Num código, um falso alarme custa uma releitura. Numa migração de banco, custa desfazer algo que estava correto.
- **Toda linha da tabela nomeia a origem, e origem que não existe não entra.** A coluna de origem admite duas: uma restrição de `restricoes_impostas` no `LEDGER.md`, que é contrato entre camadas, ou a especificação de uma entrada de `interfaces_publicadas`, que é vinculante para quem implementa aquela interface. Propriedade que o autor considera boa, mas que nenhum texto decidiu, não entra: infla o que parece vinculante e produz linha que promete verificação impossível. Se tiver valor, sobe como proposta de restrição nova, com aprovação do humano, e só depois vira linha de tabela. A ordem da fatia F3 trouxe "não importa biblioteca de render", sem origem nenhuma, e a sessão C provou por execução que nada reprovava o import.
- **A tabela de restrições aponta mecanismo, não intenção.** Cada linha diz qual comando, teste ou regra de lint reprova quando a restrição for violada, e não o que o autor pretendeu escrever. "O arquivo importa só estes quatro módulos" é intenção. "O bloco de eslint pega import direto e o build de plataforma browser pega dependência transitiva" é mecanismo. Restrição sem mecanismo entra como lacuna declarada, com o motivo, nunca como linha preenchida.
- **Quem escreve a ordem não escreve o roteiro que prova a ordem.** A sessão B entrega o DDL e as restrições, e para de propósito na seção de verificação, deixando escrito que ela vem da sessão A. A sessão A escreve o roteiro antes de mandar à revisão da sessão C. Motivo: verificação escrita por quem executa herda as premissas de quem executa, e premissa errada passa verde. O defeito que originou foi a sessão A aceitar a alegação de que os tipos do Supabase tinham sido regerados, sem conferir, e a sessão C achar que o arquivo não estava no commit. Primeira aplicação na `DDP-139`, cujo roteiro foi exercido nas duas direções contra o banco antes de existir migração.

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
7. A abre issue para o humano -> rótulo humano. O que olhar no preview, com a URL
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

**Toda issue de aprovação termina numa seção `A pergunta`, na descrição.** Não num comentário, porque quem abre o cartão pela primeira vez lê a descrição. A pergunta é aquela cuja resposta muda o trabalho, e o texto diz o que cada resposta faria de diferente. Depois dela vem uma linha dizendo o que o arraste significa naquele cartão específico.

Cartão que só afirma e propõe obriga o humano a inferir o que o gesto aprova, e o gesto é justamente a única assinatura que existe. `DDP-140`, `DDP-141` e `DDP-142` nasceram assim em 2026-09-20 e precisaram ser corrigidas depois de abertas. O check 8 reprova por máquina.

> [!IMPORTANT]
> **A sessão A nunca move uma issue de rótulo `humano` para `EM ANDAMENTO`.** Esse movimento é a assinatura do humano, e é a única coisa que distingue uma aprovação dada de uma aprovação pedida. O conector do Atlassian é da conta, não da sessão, então todo comentário e toda transição das três sessões e do Lovable aparecem com o mesmo autor do humano. O histórico do cartão não sabe dizer quem arrastou. A separação entre pedir e aprovar existe porque a sessão A se abstém do gesto, e não porque o Jira a impeça.
>
> Os movimentos que A faz numa issue de aprovação são dois: criar em `AGUARDANDO APROVAÇÃO`, e fechar em `CONCLUÍDA` depois de executar. Se uma issue de aprovação aparecer em `EM ANDAMENTO` e A não souber de resposta nenhuma, a saída é perguntar ao humano, nunca presumir o sim.

Nos dois caminhos, A registra o sim no comentário de resposta com `aprovado_por: humano`, porque B e C leem a issue, não a conversa.

**Depois de consumir a resposta, A tira o rótulo `humano`.** O rótulo significa "A espera o humano". Quando o humano já respondeu, ele passa a mentir, e a JQL da sessão A continua acordando a escuta a cada ciclo por uma issue que não tem nada de novo. Em 2026-09-20 cinco issues respondidas derrubaram a escuta três vezes seguidas sem trabalho nenhum atrás.

O rótulo que entra no lugar diz em que a issue está parada:

| Rótulo | Quando |
| :--- | :--- |
| `aprovado` | A resposta veio e o trabalho está em curso |
| `bloqueio-externo` | A resposta veio e algo fora do quadro impede executar, como uma permissão da sessão |

Issue que foi movida mas cuja pergunta não aceita o arraste como resposta volta para `AGUARDANDO APROVAÇÃO`, com comentário dizendo por quê. Isso não desfaz o gesto do humano, registra que a resposta ainda não chegou.

**Quando o gesto e o texto discordam, vale o texto.** Em `DDP-149` o humano arrastou o cartão, que naquela pergunta significava uma resposta, e comentou a outra. O arraste é um sinal de um bit, o comentário diz qual é a escolha e por quê. A sessão A segue o comentário, escreve na resposta que seguiu, e diz qual foi o gesto contrário, para o humano poder corrigir se o errado foi o texto.

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
| A | `project = DDP AND (status in ("BLOQUEADA", "EM REVISÃO") OR (status = "EM ANDAMENTO" AND labels = "humano") OR (status = "AGUARDANDO APROVAÇÃO" AND (labels is EMPTY OR labels != "humano")) OR (labels = "liberada" AND labels != "draft" AND status != "CONCLUÍDA"))` |
| B | `project = DDP AND assignee = "712020:ec30868f-8e34-4c25-97e2-cd920e5da679" AND status in ("A FAZER", "EM ANDAMENTO")` |
| C | `project = DDP AND assignee = "712020:6ac2f667-9728-4b07-bffb-eaa19704a4c9" AND status in ("A FAZER", "EM ANDAMENTO")` |

**A contagem é a volta normal.** `searchResultMode` em `count` devolve um número e nada mais, cerca de 250 tokens. A mesma consulta pedindo campos devolve de 3.000 a 5.000, porque o Jira manda junto URL de avatar, link de API e categoria de status de cada issue. Como a volta sem novidade é a maioria absoluta das voltas, é ela que precisa ser barata.

**Quando a contagem for maior que zero**, repita a consulta com `fields` e `ORDER BY updated DESC` para saber o que apareceu, e use `getJiraIssue` com `fields: ["summary","description","comment","status"]` na issue que interessa. Nunca peça `*all`.

**O intervalo dobra enquanto o quadro está parado.** Piso de 300 segundos, teto de 1800. A sessão começa no piso, dobra a cada volta vazia (300, 600, 1200, 1800, 1800...) e volta ao piso assim que tratar qualquer coisa. Uma fila parada de madrugada custa duas consultas por hora em vez de sete, e uma fila ativa continua respondendo em cinco minutos.

- B e C incluem `EM ANDAMENTO` na consulta porque é o status para onde A devolve uma issue respondida. Ao ver uma issue própria em `EM ANDAMENTO` com comentário novo, leia o comentário antes de retomar.
- Nada novo na fila: espere de novo, sem comentar.
- O custo real de escutar não é a chamada, é o contexto da sessão, que viaja inteiro a cada volta. Por isso a volta vazia não deve produzir texto nenhum: nem resumo, nem "nada novo até agora", nem atualização de painel.

## A conferência que roda por máquina

Toda regra deste arquivo nasceu de um defeito medido, e por muito tempo todas viviam só como prosa aqui. Prosa depende de alguém lembrar de ler, o que é exatamente o defeito que a auditoria de 2026-09-20 nomeou nas restrições do ledger: afirmação sem mecanismo que a reprove. As regras de processo tinham a mesma falha, e a prova é que a sessão A violou a regra de formato de canal quinze minutos depois de escrevê-la.

`guia-sessoes/bin/confere-quadro.sh` reprova, por máquina, nove defeitos que já aconteceram, e imprime um inventário do que falta antes deles:

| # | O que reprova | De onde veio |
| :-- | :--- | :--- |
| 1 | Issue tratada pela sessão A deixada num status que a JQL dela vigia | Quatro ocorrências em 2026-09-20, cada uma queimando um ciclo de escuta |
| 2 | Chave de issue citada antes de a issue existir | Duas ocorrências, mandando o leitor para a issue errada |
| 3 | Texto publicado no formato errado para o caminho de escrita | A ordem da fatia F1 e quatro cartões de 2026-09-20 |
| 4 | Aprovação com mais de uma opção sem nomear a recomendada | `DDP-110`, que voltou movida e sem resposta |
| 5 | Emenda da sessão A com código só em comentário, fora da descrição | `DDP-113`, entregue sem a coluna que a emenda pedia |
| 6 | Ordem versionada acima de 10.000 bytes | O teto da S1c foi descoberto na mão, com a ordem já escrita, e a da S1c1 estourou de novo na volta da revisão (`DDP-124`) |
| 7 | `information_schema` dentro de bloco SQL executável | `DDP-121`. A view filtra por privilégio e devolve zero linha sem provar nada (`DDP-125`) |
| 8 | Issue de rótulo `humano` sem a seção `A pergunta` na descrição | `DDP-140`, `DDP-141` e `DDP-142`, abertas afirmando e propondo, sem nada a responder |
| 9 | Ordem de S1 sem declarar os blocos do recorte, ou declarando bloco que não existe | `DDP-127`. Nenhum comando respondia qual decisão do ADR nenhuma ordem implementou |

**A conferência também lista o que espera o humano fora do quadro**: issue aberta com `acao-humana` (arquivo que só o humano escreve, em `insumos/`, `prompts/` ou `adrs/`) ou `bloqueio-externo` (permissão da sessão). É aviso, nunca reprovação, e some quando a issue fecha. Origem: a `DDP-66` e a `DDP-75` fecharam com linhas por colar em `insumos/ORDEM.md`, e nada lembrava delas (`DDP-131`). Pendência manual nova vira issue aberta com `acao-humana`, nunca comentário numa issue que vai fechar.

**O check 9 não reprova bloco sem ordem.** Bloco do recorte que ainda não virou ordem sai como inventário, impresso antes dos achados, sem derrubar a conferência. Check que fica sempre vermelho é check que ninguém lê, e cinco blocos da S1 seguem legitimamente por escrever.

**Ela roda dentro do `aguarda-fila.sh`, na partida da escuta da sessão A**, e não como comando à parte. Religar a escuta é o único ponto por onde a sessão passa em todo ciclo, então é onde a conferência não pode ser esquecida: esquecê-la significa parar de escutar, que é parar de trabalhar. A saída aparece no mesmo lugar onde a sessão lê o motivo de ter acordado.

**Ela não bloqueia a escuta.** Falso positivo que trave a fila custa mais que o defeito procurado.

Duas propriedades que a conferência precisa manter, e que custaram conserto no primeiro dia:

- **Ela precisa conseguir ficar verde.** Issue fechada fica fora das checagens de texto, porque ninguém vai agir nela e achado impossível de consertar deixa o script vermelho para sempre. Checagem que nunca alcança o verde ensina a ignorar a checagem.
- **Ela não pode reprovar o sistema correto.** A checagem 5 reprovava emenda repetida na descrição e no comentário, que é o caminho certo. Passou a comparar o conteúdo dos dois antes de acusar.

As checagens 6 e 7 leem arquivo, e não o quadro. Elas pulam as ordens já executadas, por uma lista fechada dentro do script, com a razão de cada entrada. Três ordens do content-format passam do teto e a ordem da S1b usa `information_schema`: as quatro já foram aplicadas, ninguém as vai reescrever, e reprová-las manteria o script vermelho para sempre. Ordem nova nunca entra nessa lista.

A checagem 7 lê apenas o interior dos blocos cercados por crase tripla. A ordem da S1c1 escreve "SQL puro, sem `information_schema`" em prosa, que é a instrução certa, e um grep sobre o arquivo inteiro reprovaria o sistema correto.

## Conferir a execução contra a ordem

Depois de o Lovable aplicar uma migração, a sessão A compara o schema aplicado com o DDL da ordem versionada. `guia-sessoes/bin/confere-execucao.sh` faz isso em duas fases, porque nenhuma sessão alcança o banco por shell e quem consulta é o MCP do Lovable.

```
confere-execucao.sh --sql ORDEM.md              # imprime o SQL de conferência
confere-execucao.sh --compara ORDEM.md saida.txt # compara com o que o banco devolveu
```

Ele confere coluna, chave primária, chave estrangeira, unicidade, `CHECK`, índice e trigger. A unicidade distingue `NULLS NOT DISTINCT` de unicidade comum, que é a decisão da `DEC-0014` sobre `content.pages`. Restrição escrita dentro do `CREATE TABLE` é comparada por tipo mais lista ordenada de colunas, porque o Postgres batiza essas e o DDL da ordem não conhece o nome.

**Ele não confere** o corpo de um `CHECK` nem a tabela de destino de uma chave estrangeira. Uma FK na coluna certa, apontando para a tabela errada, passa. A lacuna está declarada no cabeçalho do script.

A conferência da S1b, feita na mão em 2026-09-20, custou trinta e cinco linhas de cada lado, duas vezes. Este script substitui esse trabalho e deixa registro repetível.

## Revisão do humano, depois de toda entrega do Lovable

Toda vez que o agente do Lovable entrega, a sessão A abre uma issue de rótulo `humano` para o dono do produto olhar o resultado com os próprios olhos. Ela vem depois da revisão da sessão C, para ele não gastar tempo com o que já foi reprovado por build, typecheck ou contrato.

A issue não pede um parecer genérico. Ela diz o que olhar:

1. **A URL do preview**, e a rota exata que mudou.
2. **O que mudou**, uma frase por item, tirada do diff e não da ordem. O que a ordem pediu e o que de fato entrou podem divergir, e é isso que a revisão procura.
3. **O que observar**, específico da fatia: qual fluxo percorrer, o que deveria acontecer em cada passo, e o que seria sinal de problema.
4. **O que a sessão C já verificou**, para ele não repetir: build, typecheck, lint, contrato, e o que ela olhou no preview.
5. **O que esta fatia não faz**, para ele não procurar o que ainda não existe e cobrar uma falta que pertence a outra fatia.

**Fatia sem interface também gera issue**, e o que ela pede é o contrário: confirmar que **nada mudou**. O Diagram Studio é a única parte do app que funciona hoje, e uma fatia de módulo interno pode quebrá-lo sem que teste nenhum apanhe, porque o app não tem teste de interface. A issue nomeia as telas que precisam continuar iguais.

**Issue de aprovação que oferece opções nomeia a recomendada.** O gesto de aprovar é arrastar o cartão, e arrastar só carrega um bit. Uma issue que pergunta "qual das três" e não diz qual a sessão A recomenda deixa o arrasto sem destino: o cartão volta movido, sem comentário, e nada foi decidido.

Aconteceu em `DDP-110`, em 2026-09-20. A issue expôs três saídas para o `unique` de `content.pages` com o custo de cada uma, lado a lado, sem recomendação. O cartão voltou para `EM ANDAMENTO` às 13:26 sem uma palavra, e a sessão A não tinha como saber qual saída tinha sido escolhida. Um ciclo inteiro gasto, e a decisão no mesmo lugar.

O formato que funciona: a recomendação com as razões primeiro, as alternativas depois, e uma frase dizendo o que o arrasto significa. "Se concorda com a saída 1, arraste de volta. Se prefere outra, comente só o número e arraste." Quem responde gasta um gesto no caso comum, e escreve só quando discorda.

**A sessão A nunca supre a resposta que faltou.** Decisão de contrato adivinhada a partir de um status é decisão sem dono, e o custo aparece quando alguém procurar quem decidiu.

**A issue nasce em `AGUARDANDO APROVAÇÃO`**, nunca em `EM ANDAMENTO`. A JQL de escuta da sessão A lê `EM ANDAMENTO` com o rótulo `humano` como resposta já dada, então uma issue criada nesse status se anuncia respondida antes de ser lida.

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

**A sessão A, antes de parar, puxa um item de processo.** A ordem de prioridade é fila vigiada, depois desbloqueio de quem espera resposta de A, depois estoque `processo`, depois parar. Nada disso depende de lembrança: o `aguarda-fila.sh` sai por fila vazia imprimindo o próximo item `processo`, e não imprime nada enquanto houver issue vigiada.

Item de processo para num estado consistente do repositório, porque a janela ociosa acaba quando a fila voltar a encher, sem aviso. Trabalho de processo nunca interrompe entrega. Decisão inteira em `decisoes/DEC-0016-trilha-de-processo-e-trabalho-ocioso.md`.

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
