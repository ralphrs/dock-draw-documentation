# PERF.md — harness de medição de desempenho do `src/content-format`

Produz as duas tabelas das seções 2 e 3 da Emenda 1 ao ADR 002 (`adrs/_work/ADR-002-emenda-1-rascunho.md`).

## Como rodar

```
cd adrs/_work/spike-s1
node content-format/perf.ts
```

Sem argumento, sem dependência nova (só `node:fs`, `node:crypto`, `node:os`, `node:path`, `node:url`, builtins do Node, e o `dokmd.ts` já existente). Roda em qualquer máquina com Node 22+ (usa suporte nativo a TS do Node, o mesmo que `check-fixtures.ts` já usa neste diretório).

## O que cada coluna significa

- **Linhas / Bytes**: tamanho da página sintética depois de `normalizeDok`. A entrada é montada concatenando os corpos reais das fixtures `04-headings-e-inline`, `05-listas-marcadores`, `06-listas-aninhadas-tarefas`, `07-blocos-de-codigo`, `08-tabela-gfm`, `16-callout-canonico`, `20-tabs-canonico`, `22-steps-canonico` e `23-diagram-canonico` em round-robin, até passar do número de linhas alvo, com um único frontmatter válido no topo.
- **sha256**: hash do texto canônico gerado, para conferir que a mesma entrada produz sempre a mesma saída (determinismo, critério 4 de T-0007). O script verifica sozinho que `normalizeDok` é ponto fixo (`normalizeDok(canonical) === canonical`) antes de medir.
- **p50 / p95 / max**: percentis de 30 amostras de tempo de execução, depois de 3 de aquecimento descartadas, medidas com `performance.now()`.
- **max / p50**: razão entre a amostra mais lenta e a mediana, usada na seção 3 do rascunho como indício de cauda pesada.

## Máquina de referência

Apple M4 Pro, 12 núcleos lógicos, arm64/darwin, Node v26.8.2.

## Rodada de conferência (isolada, sem outro processo Node em paralelo)

```
Máquina: Apple M4 Pro (12 núcleos lógicos), arm64/darwin, Node v26.8.2
Amostras por operação: 30, aquecimento: 3

=== Seção 2: página de 5 mil linhas ===
linhas: 5003, bytes (texto canônico): 74083, sha256: 16ed2d51ca36b875ad2ab68c19b64c43a624a923fae56c9f643fbb1be9dbb695

| Operação | p50 | p95 |
| :--- | ---: | ---: |
| parseDok | 81.26 ms | 90.02 ms |
| serializeDok | 12.03 ms | 12.76 ms |
| validateDok | 87.64 ms | 91.72 ms |
| normalizeDok (parse + serialize) | 102.85 ms | 109.47 ms |
| normalizeDok + validateDok (save completo) | 191.87 ms | 201.55 ms |

=== Seção 3: escala do pipeline completo do save (normalizeDok + validateDok) ===
| Linhas | Bytes (texto canônico) | sha256 | p50 | p95 | max | max / p50 |
| ---: | ---: | :--- | ---: | ---: | ---: | ---: |
| 5003 | 74083 | 16ed2d51ca36… | 188.91 ms | 270.87 ms | 304.80 ms | 1.61x |
| 10002 | 148208 | 459031c4707a… | 406.71 ms | 437.49 ms | 642.60 ms | 1.58x |
| 20002 | 296708 | 3257b5833b89… | 940.11 ms | 961.94 ms | 966.72 ms | 1.03x |
| 40002 | 593708 | 21425e9d4753… | 2359.92 ms | 2442.18 ms | 2464.85 ms | 1.04x |
```

## Reprodução: o que se confirmou e o que não se sustentou

Cinco rodadas nesta sessão, todas com o mesmo `perf.ts`, todas com o mesmo sha256 por tamanho (o texto canônico gerado é idêntico byte a byte em toda rodada, confirmando o critério 4 de T-0007). Três rodadas isoladas (nenhum outro processo Node concorrente) e duas que acabaram rodando ao mesmo tempo uma da outra, por um erro de sequenciamento nesta sessão (descoberto depois, não intencional).

| Rodada | Isolada? | p50 5k | p50 10k | p50 20k | p50 40k | max/p50 20k | max/p50 40k |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Sim | 185,11 ms | 402,83 ms | 934,06 ms | 2.374,29 ms | 1,04x | 1,95x |
| 2 | Não (concorrente com a 3) | 189,70 ms | 410,41 ms | 952,65 ms | 2.409,21 ms | 1,68x | 1,03x |
| 3 | Não (concorrente com a 2) | 190,72 ms | 417,04 ms | 956,66 ms | 2.369,15 ms | 1,04x | 1,89x |
| 4 | Sim | 188,91 ms | 406,71 ms | 940,11 ms | 2.359,92 ms | 1,03x | 1,04x |
| 5 | Sim | 191,86 ms | 408,77 ms | 963,33 ms | 2.435,04 ms | 1,58x | 1,87x |

**O p50 é a estatística mais estável, não uma estatística perfeitamente estável.** Nas cinco rodadas, incluindo as duas contaminadas por concorrência, o p50 de cada tamanho varia entre 3,13% e 3,65% entre a rodada mais baixa e a mais alta (recalculado sobre as cinco, não arredondado), e o fator de crescimento a cada duplicação de tamanho fica estável entre 2,13x e 2,54x (mais que o dobro linear, sinal de crescimento superlinear consistente, não de ruído). A quinta rodada empurrou o espalhamento para cima do que as quatro primeiras sozinhas mostravam: a afirmação anterior ("varia menos de 3%") não sobrevive à quinta rodada, e o texto agora diz a faixa real.

**O `max / p50` não se sustenta.** Das cinco rodadas, a 1, a 3 e a 5 mostram a razão crescendo de ~1,0x a ~1,6x em 20 mil linhas para ~1,9x em 40 mil, o padrão que a seção 3 do rascunho original descrevia. As rodadas 2 e 4 não mostram isso: a 2 até inverte (20k mais alto que 40k), a 4 fica achatada nos dois tamanhos. A concorrência entre processos não é o fator decisivo: das três rodadas isoladas, duas (1 e 5) reproduzem o crescimento e uma (4) não.

Causa investigada, não só observada: `max` é o maior valor entre 30 amostras, uma estatística de valor extremo. Uma única pausa de coleta de lixo do V8 caindo (ou não) dentro dessa janela de 30 execuções domina o resultado, e se essa pausa acontece é uma questão de timing, não uma função direta do tamanho da página dentro de só 30 tentativas. O `p95` (29ª de 30 amostras) sofre do mesmo problema, e a quinta rodada é o exemplo mais extremo das cinco: em 40 mil linhas, o p95 chegou a 4.556,58 ms contra um p50 de 2.435,04 ms na mesma rodada, razão 1,87x, acima da faixa de 1,02x a 1,47x que as quatro primeiras rodadas mostravam sozinhas. Só a mediana, estimada com a amostra inteira em vez de um único valor extremo, fica relativamente estável.

**Consequência para o rascunho:** o argumento original da seção 3 ("a razão max/p50 cresce entre 20 mil e 40 mil linhas") não é uma base confiável, apesar de ter aparecido em três das cinco medições. O número escolhido (300.000 bytes, 20 mil linhas) não muda com a quinta rodada: 20 mil linhas continua abaixo de 1 segundo (963,33 ms) e 40 mil continua acima de 2 segundos (2.435,04 ms) em todas as cinco. A seção 3 do rascunho já não se apoia na razão max/p50, e sim no p50 cruzando essas duas marcas, então a quinta rodada não abre uma dúvida nova.
