# DEC-0016: a melhoria de processo vira trilha própria, e roda no tempo ocioso

**Data:** 2026-09-20
**Quem decidiu:** sessão A, por delegação, com o pedido do humano de usar o quadro também para aprovar melhoria de processo
**Alcance:** onde vive o trabalho de processo, quando ele roda, quem decide cada item

## O problema

Em 2026-09-20 a sessão A cometeu quatro defeitos de processo medidos, todos já corrigidos no artefato e nenhum corrigido no mecanismo. O `confere-quadro.sh` fechou cinco deles por máquina. Restam dez melhorias levantadas, e nenhuma tem lugar no quadro.

Sem lugar, elas competem com a entrega. O dono do produto pediu duas vezes para ver a wiki funcionando, e trabalho de processo despachado como tarefa normal atrasa exatamente isso. Sem lugar nenhum, elas somem, que é o que aconteceu com as regras que hoje vivem só em prosa.

## A decisão

### 1. A trilha usa o agrupador que já existe

O trabalho de processo fica sob `Governança e processo`, o agrupador criado quando o quadro foi desenhado, com a finalidade escrita no `PROTOCOLO.md`: "para que a contagem de entregas de produto não seja inflada por trabalho de processo". Toda issue da trilha leva o rótulo novo `processo`.

**Alternativa descartada:** criar um agrupador novo chamado `Processo`. O custo seria dois agrupadores com o mesmo significado, que é a falha de duas fontes de verdade sobre o mesmo trabalho.

### 2. Issue de processo nasce sem responsável

Estoque de processo entra em `A FAZER`, sem responsável, pela mesma convenção do rótulo `backlog`.

A razão é mecânica. A JQL de escuta da sessão A vigia `BLOQUEADA`, `EM REVISÃO`, `EM ANDAMENTO` com rótulo de aprovação, e `liberada` fora de rascunho. Não vigia `A FAZER`. Estoque de processo nesse status não falsifica a fila, e a fila continua podendo esvaziar de verdade. Fila que nunca esvazia apaga o gatilho de ociosidade, que é o que faz esta decisão funcionar.

**Custo aceito:** issue sem responsável não aparece na fila de ninguém, então item de processo só anda quando A o puxa. Nenhuma outra sessão o pega por engano, e nenhuma o pega por iniciativa.

### 3. A prioridade é executável, não lembrada

A sessão A puxa um item de processo quando a fila dela está vazia e nenhuma sessão está bloqueada esperando resposta de A.

Essa regra não fica só em prosa. O `aguarda-fila.sh` já conhece o estado da fila, e passa a imprimir o próximo item `processo` quando sai por fila vazia. Enquanto houver issue vigiada, ele não imprime item nenhum.

**Alternativa descartada:** escrever a ordem de prioridade na seção "Ociosidade" do `PROTOCOLO.md` e confiar na leitura. O levantamento que originou esta decisão aponta como defeito próprio que "regra nasce em prosa e só vira máquina quando dói". Registrar a regra em prosa cometeria o defeito no mesmo documento que o descreve.

### 4. Cada item para num estado consistente

Item de processo é dimensionado pelo mesmo critério que a `DEC-0015` impôs ao corte da S1c: cada parada deixa o repositório consistente. O tempo de uma janela ociosa não é previsível, então dimensionar por duração seria chute. Item que não pode parar no meio está mal dimensionado e volta para corte.

### 5. Quem decide cada item

A sessão A decide sozinha o que muda apenas como as sessões trabalham por dentro. Sobe ao humano o que muda o que o humano faz.

**Alternativa descartada:** mandar os dez itens por aprovação. O mesmo levantamento aponta a aprovação humana serializada como gargalo. Transformar cada melhoria em issue de aprovação reconstruiria o gargalo dentro da trilha criada para reduzi-lo.

## Os dez itens

| Id | O que faz | Defeito medido que o originou | Decide |
| :--- | :--- | :--- | :--- |
| P-1 (`DDP-123`) | O roteiro de verificação sai da mão de quem escreve a ordem | A sessão A aceitou a alegação do Lovable sobre `types.ts` sem conferir. Verificação do próprio trabalho não pega erro de premissa | A |
| P-2 (`DDP-124`) | Check 6: ordem versionada acima de 10.000 caracteres reprova | O teto da S1c foi descoberto na mão, depois de a ordem já estar escrita | A |
| P-3 (`DDP-125`) | Check 7: `information_schema` em ordem ou roteiro reprova | `DDP-121`. O catálogo filtra por privilégio, e o roteiro fica verde sem provar nada | A |
| P-4 (`DDP-126`) | `confere-execucao.sh`: compara o catálogo do Postgres com a ordem versionada | A conferência da S1b foi feita linha a linha na mão, duas vezes | A |
| P-5 (`DDP-127`) | Id estável por bloco do recorte, mais check 8 de cobertura | Nenhum comando responde qual decisão do ADR 003 nenhuma ordem implementou | A |
| P-6 (`DDP-128`) | Triagem do backlog sem dono | Treze issues sem dono e sem sprint. Achado parado treina todos a ignorar o quadro | A |
| P-7 (`DDP-129`) | O `aguarda-fila.sh` avisa fila vazia com estoque não vazio | A fila ficou uma hora parada e o fato só apareceu no fim do ciclo | A |
| P-8 (`DDP-130`) | Medida de ciclo, de ordem escrita a schema aplicado | Sem número, "melhorar o processo" é opinião | A |
| P-9 (`DDP-131`) | Lembrete das pendências manuais do humano em `insumos/` | `DDP-66` e `DDP-75` esperam colagem desde 2026-09-19, e `insumos/` é bloqueado para as sessões | A |
| P-10 (`DDP-132`) | Categorias pré-aprovadas, ou aprovação em lote | Todo o pipeline espera um arrastar de cartão por vez | Humano |

## Lacunas declaradas

**Defeito medido durante a própria escrita desta decisão.** A sessão A chamou a API do Jira no host `dokdraw.atlassian.net`, digitado de memória. O host correto é `dokdrawapp.atlassian.net`, escrito em três lugares do `PROTOCOLO.md` e no padrão do próprio `aguarda-fila.sh`. A resposta foi HTTP 404 com a página "Your Atlassian Cloud site is currently unavailable", que é indistinguível de uma queda real do serviço. Esta decisão chegou a registrar a queda como lacuna antes de a checagem desmentir.

O defeito é o mesmo que a auditoria de 2026-09-20 nomeou nas restrições do ledger: afirmação sem mecanismo que a reprove. Aqui a afirmação era "o Jira caiu", e o mecanismo que faltava é ler o host de onde ele está escrito em vez de digitá-lo. A correção de uma linha é `JIRA_SITE` no arquivo de credencial, que carrega junto com `JIRA_EMAIL` e `JIRA_TOKEN`. A escrita nesse arquivo é negada às sessões por regra, então a linha depende do humano.

**P-1 não alcança a `DDP-122`.** A sessão B está executando sob o contrato antigo, em que ela escreve a ordem e o roteiro. Mudar o entregável dela no meio da execução é o defeito do check 5 aplicado no nível do processo. P-1 vale a partir da ordem seguinte.

**O efeito não será medido até P-8 rodar.** Nenhum dos outros nove itens produz número comparável antes e depois. A trilha começa sem linha de base.

**Trabalho de processo nunca interrompe entrega.** Um defeito pode se repetir entre a medição e a correção, porque a correção espera a fila esvaziar. O custo é aceito porque a alternativa é parar a sprint para consertar processo, e o dono do produto já respondeu a isso duas vezes ao pedir para ver a wiki.
