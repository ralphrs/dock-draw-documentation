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
