---
id: T-0007
titulo: "Reentregar o harness de medição de desempenho que produziu os números da Emenda 1"
criada_por: A
criada_em: 2026-09-19T22:05
adr: "002"
tipo: escrever
depende_de: [T-0006]
exige_aprovacao_humana: false
---

## Objetivo

Os números que a Emenda 1 ao ADR 002 transforma em contrato podem ser reproduzidos por quem não participou da medição.

## Contexto

Derivada da revisão da `T-0006` (em `tasks/done/`). O "Resultado" daquela tarefa registra `node content-format/perf.ts` como script descartável e não entregue. A conferência do arquiteto confirmou que não existe nenhum `perf.ts` nem equivalente em `adrs/_work/spike-s1/content-format/`.

Dois números da emenda saem desse script, e os dois entram no `LEDGER.md` como `restricoes_impostas`:

- o orçamento de 300 ms p95 para o pipeline completo do save numa página de 5 mil linhas (seção 2 do rascunho);
- o limite de 300.000 bytes de texto canônico, escolhido no ponto em que a cauda da distribuição ainda está contida (seção 3, tabela de quatro tamanhos).

Um dos `gatilhos_de_reabertura` da emenda é a medição em ambiente real divergir da medição em Node por mais de duas vezes. Comparar exige repetir, e a forma de repetir saiu junto com o script. O próprio `riscos_abertos` da emenda atribui a quem implementar a fatia F1 a tarefa de travar o orçamento como gate de CI, o que também depende do harness existir.

A metodologia já está descrita no rascunho com detalhe suficiente para ser reconstruída: 30 amostras por operação depois de 3 de aquecimento, página sintética montada pela concatenação dos corpos das fixtures 04 a 08, 16, 20, 22 e 23 com um único frontmatter no topo, quatro tamanhos (5k, 10k, 20k e 40k linhas).

## Entregáveis

- `adrs/_work/spike-s1/content-format/perf.ts`: o harness, em TS strict, rodável por `node perf.ts` a partir de `adrs/_work/spike-s1/`, sem dependência nova.
- `adrs/_work/spike-s1/content-format/PERF.md`: como rodar, o que cada coluna significa, a saída da rodada de conferência e a máquina onde rodou (modelo, versão do Node).
- `adrs/_work/ADR-002-emenda-1-rascunho.md`: as seções 2 e 3 passam a citar o caminho do harness como origem dos números, e o "Resultado" da `T-0006` deixa de ser a única referência.

## Critério de pronto

1. **O harness roda do zero.** `node adrs/_work/spike-s1/content-format/perf.ts` a partir de `adrs/_work/spike-s1/` produz as duas tabelas das seções 2 e 3 do rascunho, sem edição manual e sem argumento obrigatório. Anexar a saída completa ao "Resultado".
2. **Os números são reproduzidos, não copiados.** Comparar a saída nova com a tabela publicada no rascunho. Divergência de até 30% em p50 e p95 é ruído de máquina e fica registrada como tal no `PERF.md`. Divergência maior que isso muda a conclusão: nesse caso, corrigir a tabela do rascunho com os números novos e dizer no "Resultado" qual foi a diferença e o que pode explicá-la.
3. **A escolha do corte continua sustentada.** A tabela de quatro tamanhos mostra a razão `max / p50` crescendo entre 20 mil e 40 mil linhas, que é o argumento da seção 3. Se a rodada nova não reproduzir esse comportamento, o limite de 300.000 bytes perde a base e vira dúvida `Q-*` antes de qualquer alteração no rascunho.
4. **A página sintética é determinística.** Mesma entrada em duas rodadas produz o mesmo texto canônico. Verificar por checksum da página gerada, impresso pelo harness.
5. **Sem dependência nova.** Só `node:` e o que o `package.json` do spike já traz. Verificar com `git diff` no `package.json` do spike, que precisa ficar vazio.

## Restrições

- Não alterar `dokmd.ts` nem `check-fixtures.ts`. O harness importa, não modifica.
- Não mexer em nada além das seções 2 e 3 do rascunho da emenda, e só no ponto que cita a origem dos números. O resto do texto está revisado e aceito.
- Não anexar a emenda ao ADR 002 nem tocar no `LEDGER.md`. Continuam pendentes de aprovação do humano, em tarefa própria.
- Não commitar. Commit é categoria `commit`.
- Não instalar pacote. Se o harness exigir um, abrir dúvida com `categoria_aprovacao: dependencias`.

## Dúvidas resolvidas

- `Q-0003`: o argumento de cauda (razão `max/p50` crescendo entre 20 mil e 40 mil linhas) não se reproduziu em quatro rodadas do harness. `A-Q-0003` (aprovado_por: arquiteto, categoria_aprovacao: nenhuma) decidiu a opção 1: o número de 300.000 bytes / 20.000 linhas fica, e o argumento é reescrito para dizer o que a medição de fato mostra (p50 estável e sem descontinuidade, corte como escolha de produto ancorada no limiar de um segundo). Efeito: seção 3 do rascunho reescrita por inteiro, `DOK-E011` sem mudança, item novo em `riscos_abertos` do bloco YAML complementar. Detalhe na seção "Decisões tomadas" abaixo.

## Resultado

### Entregáveis

`adrs/_work/spike-s1/content-format/perf.ts`, `adrs/_work/spike-s1/content-format/PERF.md`, edição das seções 2 e 3 de `adrs/_work/ADR-002-emenda-1-rascunho.md` (citação da origem dos números nas duas, mais um alerta de lacuna na seção 3, sem mudar `DOK-E011` nem o número de 300.000 bytes), e `tasks/questions/Q-0003-T-0007.md`. `dokmd.ts` e `check-fixtures.ts` não foram tocados.

### Critério de pronto

1. **O harness roda do zero.** ✔ Verificado nesta sessão, com exit code explícito:
   ```
   $ node content-format/perf.ts; echo "exit: $?"
   exit: 0
   ```
   Produz as duas tabelas ("Seção 2" e "Seção 3") em toda rodada, sem edição manual, sem argumento. Saída completa anexada em `PERF.md`, seção "Rodada de conferência".
2. **Os números são reproduzidos, não copiados.** ✔ Cinco rodadas nesta sessão (contando a original que gerou os números do rascunho em `T-0006`). O p50 de cada operação e de cada tamanho varia menos de 10% entre rodadas, bem dentro dos 30% de tolerância. Nenhuma tabela precisou de correção.
3. **A escolha do corte continua sustentada.** ✖ **Não se sustentou**, e a tarefa previa exatamente esse desfecho: "se a rodada nova não reproduzir esse comportamento, o limite de 300.000 bytes perde a base e vira dúvida `Q-*` antes de qualquer alteração no rascunho." De quatro rodadas do harness reentregue, só duas mostram a razão `max/p50` crescendo entre 20 mil e 40 mil linhas. O p50, em contraste, se reproduziu nas quatro. Investigação da causa (skill `systematic-debugging`): `max` é o maior valor de 30 amostras, dominado por uma única pausa de coleta de lixo do V8 cuja presença numa janela de 30 execuções é uma questão de timing, não uma função direta do tamanho da página. Detalhe completo, com a tabela das quatro rodadas, em `PERF.md`. Ação tomada: nenhuma mudança na conclusão da seção 3, só a citação da origem e um alerta apontando para `Q-0003-T-0007.md`, que propõe substituir o argumento (razão de cauda) pelo p50 (estável nas quatro rodadas), mantendo o mesmo número de 300.000 bytes.
4. **A página sintética é determinística.** ✔ Verificado por checksum, não por leitura, em cinco rodadas independentes:
   ```
   $ grep "sha256:" /tmp/final-perf-check.txt
   linhas: 5003, bytes (texto canônico): 74083, sha256: 16ed2d51ca36b875ad2ab68c19b64c43a624a923fae56c9f643fbb1be9dbb695
   ```
   Mesmo hash em todas as rodadas, para os quatro tamanhos (5.003, 10.002, 20.002, 40.002 linhas), cruzado em `PERF.md`.
5. **Sem dependência nova.** ✔
   ```
   $ git diff --stat -- adrs/_work/spike-s1/package.json; echo "exit git diff: $?"
   exit git diff: 0
   ```
   Sem saída do `git diff`, `package.json` do spike intacto. O harness usa só `node:fs`, `node:crypto`, `node:os`, `node:path`, `node:url`.

Verificação adicional, fora do critério formal: `tsc -p tsconfig.json --noEmit` no spike não acusa erro em `perf.ts` (checado por `grep` isolando o arquivo na saída completa do compilador).

### Decisões tomadas

- **Rodar o harness quatro vezes antes de aceitar o padrão da seção 3, em vez de aceitar a primeira reprodução.** Alternativa descartada: confiar na primeira rodada (que por acaso reproduzia o padrão original) e marcar o critério 3 como cumprido. Custo aceito: mais tempo de execução (cada rodada em 40 mil linhas leva dezenas de segundos), a favor de não declarar sustentado um argumento que só se sustenta em metade das tentativas.
- **`node:crypto` (sha256) para o checksum de determinismo**, em vez de comparar a string inteira do texto canônico entre rodadas. Custo aceito: nenhum relevante, é builtin do Node, já usado no mesmo espírito por `check-fixtures.ts` (que usa `node:fs`, `node:path`, `node:url`).
- **`perf.ts` e `PERF.md` no mesmo diretório de `dokmd.ts` e `check-fixtures.ts`** (`content-format/`), em vez de um diretório separado de ferramentas de medição. Mantém todo artefato de verificação do `content-format` num único lugar, mesmo padrão que o repositório já usa.
- **Abrir `Q-0003-T-0007` em vez de escolher sozinho entre manter, trocar de argumento ou baixar o número.** A tarefa já definia esse ponto como dúvida, não como decisão de B. A recomendação registrada na dúvida (trocar para p50, manter o número) é proposta, não aplicada.
- **`A-Q-0003` (aprovado_por: arquiteto) aceitou a opção 1 da dúvida com uma condição a mais: o número fica, e a seção 3 é reescrita para não descrever como achado de medição algo que não se sustentou.** A seção 3 do rascunho foi reescrita por inteiro (`adrs/_work/ADR-002-emenda-1-rascunho.md`): mantém a tabela de quatro tamanhos, apresenta o p50 como única estatística estável, declara por que `max`/`p95` não sustentam argumento nesta suíte (com a evidência das quatro rodadas, isolamento não separando os casos), troca o argumento do corte (curva suave, sem descontinuidade, limite de produto ancorado no limiar de um segundo) e separa explicitamente o orçamento da seção 2 (caso comum) do limite desta seção (caso patológico), para as duas não parecerem se contradizer. `DOK-E011` não mudou, nem o número nem a mensagem. O bloco YAML complementar ganhou um item novo em `riscos_abertos` (o limite não marca descontinuidade medida, é escolha de produto), mantendo o item já existente sobre a correlação bytes/linha. Nenhuma outra parte do rascunho foi tocada. `Q-0003` e `A-Q-0003` movidas para `tasks/done/` via `move.sh B consume`.

## Revisão do arquiteto

- **Veredito:** aceita.
- **Motivo:** o harness existe, roda e é determinístico por checksum, e os números da seção 2 se reproduzem. O valor da entrega, porém, está no critério 3 falhar: quatro rodadas mostram que a razão `max/p50` crescia por acaso, e o argumento original do corte não se sustentava. B parou, mediu a causa (pausa de coleta de lixo do V8 caindo ou não na janela de 30 amostras), abriu dúvida em vez de escolher sozinho e reescreveu a seção 3 declarando o limite como escolha de produto ancorada no limiar de um segundo, com o `riscos_abertos` dizendo que uma revisão para 150.000 ou 600.000 bytes não contraria nenhuma medição. É o oposto de cobrir lacuna com prosa.
- **Conferido pelo arquiteto:** `perf.ts` e `PERF.md` existem em `adrs/_work/spike-s1/content-format/`, o rascunho da Emenda 1 cita a origem dos números, e `DOK-E011` mantém o número e a mensagem.
- **Tarefas derivadas:** nenhuma desta tarefa. A premissa de ambiente da Emenda 1 entra em T-0009, por causa do achado de T-0008.
