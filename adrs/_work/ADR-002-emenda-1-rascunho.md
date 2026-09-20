# Emenda 1 ao ADR 002: execução, desempenho e testes do `src/content-format`

Data: 2026-09-19. Anexa ao ADR 002 (Aceito), sem reabrir nenhuma decisão dele: a gramática, a AST, a API e as dependências do contrato da seção 13 continuam como estão. Esta emenda acrescenta o que o ADR 002 não fixou sobre execução, orçamento de desempenho, tamanho máximo de página, estratégia de testes e funções que faltam publicar para camadas futuras.

Nota de não reabertura, ponto a ponto: a emenda toca três campos já existentes no contrato do ADR 002 (`riscos_abertos`, `interfaces_publicadas`, `premissas_sobre_camadas_futuras`) e em todos os três acrescenta item novo, sem remover ou alterar um item existente. Não toca em `dependencias`, `restricoes_impostas` no sentido de revogar nenhuma das nove já publicadas. Acrescenta duas restrições novas (seções 1 e 3 abaixo), que também não colidem com as nove existentes.

## 1. Ambientes de execução

`src/content-format` roda em três ambientes: o navegador (o adaptador do editor do ADR 005 chama `parseDok`/`serializeDok` para montar e ler a árvore), as server functions do TanStack Start, e o job agendado de sincronização do ADR 010.

A restrição de não usar builtin do Node é sustentada pelo navegador, não pelo alvo de build da server function. `@lovable.dev/vite-tanstack-config@2.20.0` (registro npm, inspecionado em 2026-09-19) força `nitroOpts.preset = "cloudflare-module"` dentro de um build do Lovable, com `cloudflare: { nodeCompat: true, deployConfig: true }`. `nodeCompat: true` liga a camada de compatibilidade do Node dentro do Cloudflare Workers, então a server function de hoje resolve `fs`, `path` e os demais builtins do Node se `src/content-format` os importar. O `vite.config.ts` do app (`// nitro (build-only using cloudflare as a default target)`) descreve o alvo, mas não é mais a única fonte da restrição, e sozinho não explicava por que a proibição continuaria valendo com a compatibilidade ligada. Quem sustenta a proibição é o navegador: o adaptador do editor do ADR 005 carrega o mesmo módulo no cliente, onde não existe exceção para ligar, nenhum builtin do Node resolve, e essa é a condição que não muda com a configuração do Nitro. O ambiente do job agendado do ADR 010 ainda não está decidido, porque o ADR 010 não foi escrito. Esta emenda não assume um runtime para ele, só registra a mesma restrição de execução como premissa para quando for escrito.

O código-fonte de `dokmd.ts` (o porte TS strict usado no S-1, `adrs/_work/spike-s1/content-format/dokmd.ts`) não referencia `window`, `document`, `navigator`, `localStorage` nem nenhum builtin do Node (`node:*`, `fs`, `path`). Toda dependência é pacote npm puro (`mdast-util-*`, `micromark-*`, `unist-util-visit`, `yaml`, `zod`). Essa ausência foi confirmada de duas formas nesta sessão, não só declarada:

1. **Build de plataforma browser sem externos.** `vite build` em modo library, `rollupOptions.external: []`, apontando `dokmd.ts` como entrada: 363 módulos transformados, saída de 824,61 kB (176,58 kB gzip), sem erro de resolução. Um builtin do Node importado por engano (`node:fs`, por exemplo) não tem resolução em plataforma browser e o build falha com `UNRESOLVED_IMPORT`, como reproduzido no mesmo teste ao apontar para um módulo que de fato usa Node (`vite`, usado como contraprova). Esse é o mecanismo de verificação proposto para a fatia F1 (seção abaixo), não uma checagem manual.
2. **Execução em Node puro, sem DOM.** `node content-format/check-fixtures.ts` roda as 30 fixtures do ADR 002 contra o porte, no Node 26.8.2, sem `jsdom` nem qualquer polyfill de DOM: 30/30 aprovadas. Isso mostra que o módulo não precisa de DOM para rodar, mas sozinho não prova a ausência de import de DOM, porque um teste sem DOM passa mesmo que o código só use DOM num ramo não exercitado. É o teste 1, não a prova.

O teste 2 é o que teria um resultado diferente se um import de DOM ou de builtin do Node fosse introduzido por engano, porque o bundler falha na resolução antes mesmo de rodar qualquer teste. A fatia F1 (implementação, seção 11 do ADR 002) ganha três verificações automáticas, todas rodando no mesmo gate de `install`/`build`/`tsc` da fatia F0:

- **Build de plataforma browser** de `src/content-format` em modo library, sem externos, igual ao teste acima. Falha o build se algum import não resolver em ambiente browser.
- **Lint com escopo restrito.** O `eslint.config.js` do app já usa `no-restricted-imports` (bloqueia `server-only` fora do padrão `*.server.ts` do TanStack Start). A mesma composição `tseslint.config` ganha um bloco `files: ["src/content-format/**/*.ts"]` com `languageOptions.globals: {}` (em vez de `globals.browser`, que o app usa por padrão) e `no-restricted-imports` com o padrão `node:*` e os builtins sem prefixo mais comuns (`fs`, `path`, `os`, `child_process`). Isso pega o import antes do build, no editor e no CI.
- **Suíte Vitest fixada em `environment: 'node'`**, sem `jsdom`, como já roda no S-1. Funciona como canário: se alguém introduzir um uso de `document`/`window` sem import explícito (por exemplo, via uma dependência transitiva que só falha em runtime), a suíte quebra com `ReferenceError` na primeira chamada.

Nenhuma das três, sozinha, é suficiente. O build de plataforma browser é o gate estrutural (pega qualquer import não resolvível, presente ou futuro). O lint pega cedo, no editor. A suíte Node sem DOM pega o que só aparece em runtime. Nenhum teste com DOM ligado prova ausência de import de DOM: prova só que o caminho testado não precisou dele. Nenhuma das três verificações depende do alvo Cloudflare da server function: as três continuam do jeito que estão porque testam contra a ausência de DOM e de builtin do Node de forma direta, não contra um preset de build específico.

> [!WARNING]
> Lacuna: o ambiente real do job agendado do ADR 010 (Cloudflare Workers com Cron Triggers, um worker separado, ou outro runtime) não está decidido. A restrição desta seção (JS puro, sem builtin de Node, sem DOM) cobre qualquer runtime do tipo isolado V8, mas fica registrada como premissa para o ADR 010, não como fato confirmado. Dono: ADR 010.

## 2. Orçamento de desempenho

Medição em `adrs/_work/spike-s1/content-format/dokmd.ts` (porte TS strict, 30/30 nas fixtures do ADR 002), Node 26.8.2, sem bundler, 30 amostras por operação depois de 3 de aquecimento. Página sintética de 5.003 linhas (72,3 KB de texto canônico), montada concatenando os corpos reais das fixtures 04 a 08, 16, 20, 22 e 23 (headings, listas, código, tabela, callout, tabs, steps, diagrama) em repetição, com um único frontmatter válido no topo. Harness reprodutível em `adrs/_work/spike-s1/content-format/perf.ts` (`node content-format/perf.ts` a partir de `adrs/_work/spike-s1/`), metodologia e rodadas de conferência em `PERF.md` no mesmo diretório.

| Operação | p50 | p95 |
| :--- | ---: | ---: |
| `parseDok` | 79 ms | 89 ms |
| `serializeDok` | 12 ms | 13 ms |
| `validateDok` | 80 ms | 89 ms |
| `normalizeDok` (parse + serialize) | 99 ms | 107 ms |
| `normalizeDok` + `validateDok` (pipeline completo do save, fatia F4) | 181 ms | 200 ms |

Orçamento: o pipeline completo do save (`normalizeDok` + `validateDok`, a operação que a fatia F4 do ADR 002 executa a cada gravação) conclui em até 300 ms p95 para uma página de 5 mil linhas, tanto no servidor quanto no navegador, que carrega o mesmo `parseDok` para montar a árvore inicial do editor (ADR 005). O valor medido (200 ms p95) fica com 100 ms de margem sobre o orçamento.

A medição roda em Node, não no isolado V8 do Cloudflare Workers nem num navegador real. Os três compartilham o motor V8, então a ordem de grandeza se mantém, mas o número exato em produção não está confirmado. O limite de CPU do Cloudflare Workers no plano pago é de 30 segundos por requisição por padrão, configurável até 5 minutos ([Cloudflare Workers, limites de plataforma](https://developers.cloudflare.com/workers/platform/limits/)), então o orçamento de 300 ms desta emenda não é ditado pelo teto de CPU do Workers, e sim pela percepção de resposta imediata no save. No plano gratuito, o teto é 10 ms por requisição, abaixo do que qualquer página de 5 mil linhas mede aqui.

> [!WARNING]
> Lacuna: qual plano do Cloudflare Workers o app usa em produção não está registrado em nenhum ADR nem no `vite.config.ts`. O orçamento desta seção assume implicitamente um plano que comporta pipelines de centenas de milissegundos de CPU (o pago, no mínimo). Dono: quem decidir o plano de hospedagem, antes da fatia F1 entrar em produção.

## 3. Tamanho máximo de página

Medição da mesma forma da seção 2, variando o tamanho da página sintética. Harness em `adrs/_work/spike-s1/content-format/perf.ts`, cinco rodadas de conferência em `PERF.md` no mesmo diretório.

| Linhas | Bytes (texto canônico) | `normalizeDok` + `validateDok`, p50 | p95 | max |
| ---: | ---: | ---: | ---: | ---: |
| 5.003 | 74 KB | 189 ms | 271 ms | 305 ms |
| 10.002 | 148 KB | 407 ms | 437 ms | 643 ms |
| 20.002 | 297 KB | 940 ms | 962 ms | 967 ms |
| 40.002 | 594 KB | 2.360 ms | 2.442 ms | 2.465 ms |

O p50 é a estatística mais estável entre rodadas, ainda que não perfeitamente estável: varia entre 3,13% e 3,65% de uma rodada para outra em cada tamanho (mínimo e máximo entre as cinco rodadas, cada tamanho medido de novo), e cresce de forma superlinear a cada duplicação do tamanho, com fator entre 2,13x e 2,54x, consistente nas cinco rodadas registradas em `PERF.md`.

O `max` e o `p95` não sustentam argumento nesta suíte, e a quinta rodada reforça essa conclusão em vez de contradizê-la. Cada um é uma estatística de valor extremo (o maior e o 29º de 30 amostras), e o resultado depende de uma pausa de coleta de lixo do V8 cair ou não dentro da janela de 30 execuções, uma questão de quando a pausa acontece, não uma função do tamanho da página. Nas cinco rodadas de `PERF.md`, a razão `max/p50` cresce entre 20 mil e 40 mil linhas em três delas e não cresce nas outras duas. Isolar a máquina (nenhum outro processo Node rodando ao mesmo tempo) não separa os dois grupos: das três rodadas isoladas, duas reproduzem o crescimento e uma não. Na quinta rodada, o `p95` de 40 mil linhas chegou a 4.557 ms, contra um p50 de 2.435 ms na mesma rodada, quase o dobro. É a maior discrepância entre `p95` e p50 das cinco rodadas, e apareceu numa rodada isolada, não numa contaminada por outro processo.

A curva do p50 cresce de forma suave entre 5 mil e 40 mil linhas, sem descontinuidade em nenhum dos quatro tamanhos medidos. A medição não indica um ponto de corte natural. O limite desta emenda é escolha de produto, ancorada em dois fatos medidos e num limiar declarado:

- Em 20 mil linhas, o pipeline completo do save fica entre 934 ms e 963 ms nas cinco rodadas, abaixo de um segundo em todas.
- Em 40 mil linhas, fica entre 2.360 ms e 2.435 ms, acima de dois segundos em todas.
- Um segundo é o limiar em que a resposta deixa de parecer imediata, e o save é operação síncrona do ponto de vista de quem escreve.

O corte fica em **20.000 linhas, ou 300.000 bytes de texto canônico** (a correlação bytes/linha ficou estável em ≈ 14,8 nas três amostras maiores, mas varia com a mistura de conteúdo: um documento denso em tabelas ou blocos de código atinge o teto em bytes antes das 20 mil linhas). Nenhuma medição desta emenda distingue 20 mil linhas de 15 mil ou de 25 mil, o corte exato é decisão de produto, não achado de spike.

O orçamento da seção 2 (300 ms p95 para uma página de 5 mil linhas) e o limite desta seção não se contradizem, porque medem coisas diferentes. A seção 2 fixa o caso comum, o tempo que uma gravação típica deve levar. Esta seção fixa o caso patológico, o tamanho que o save recusa. Uma página de 20 mil linhas excede o orçamento da seção 2 em várias vezes e ainda assim é aceita: o teto existe para impedir o inviável, não para garantir o confortável.

Acima do limite, o save é recusado com um diagnóstico novo:

```
DOK-E011: página excede o tamanho máximo (300.000 bytes de texto canônico)
```

`validateDok` calcula o tamanho em bytes UTF-8 do texto que `normalizeDok` devolveu (não do texto bruto de entrada, que pode ser maior ou menor depois da normalização) e emite `DOK-E011` antes de qualquer outra checagem, porque o diagnóstico não depende de percorrer a árvore. O autor recebe o diagnóstico com o tamanho atual e o limite, e precisa dividir o conteúdo em mais de uma página. Esta emenda não desenha um mecanismo de divisão automática: fica fora de escopo, sem dono definido.

Alternativa descartada: limitar por número de linhas em vez de bytes. O número de linhas depende da mistura de conteúdo (uma tabela GFM de 50 colunas cabe numa linha e pesa mais que 50 linhas de prosa), então bytes do texto canônico é a medida estável para uma coluna `text` do Postgres, que é o que `content.page_revisions.content_dokmd` de fato guarda (ADR 003). O custo aceito é que o autor não vê "linhas restantes" na UI, só bytes, menos intuitivo de acompanhar durante a digitação.

## 4. Estratégia de testes

A suíte de 30 fixtures do ADR 002 já roda como regressão compartilhada, e não assume um número fixo. `check-fixtures.ts` (o porte TS strict usado no S-1) lê `manifest.json` e itera o array, sem nenhuma constante `30` no código: o placar final é `${manifest.length - fail}/${manifest.length}`. Rodada nesta sessão: 30/30. Essa forma já satisfaz "não assumir 30 fixtures fixas" (ponto de atenção do arquiteto): acrescentar uma fixture nova (a pendência 14 do ledger, lista frouxa fora de citação e de callout, dona a fatia F5 do ADR 002) muda o denominador sozinho, sem tocar no runner.

A emenda formaliza esse runner como interface publicada (`runFixtureSuite`, bloco YAML abaixo), extraído de `check-fixtures.ts` para `src/content-format/testing/runFixtureSuite.ts`, com assinatura `(fixturesRoot: string, manifestPath: string) => SuiteResult`, para três consumidores:

- **ADR 002** (este): roda a suíte direto contra `parseDok`/`normalizeDok`/`validateDok`, como já faz.
- **ADR 005** (editor): roda a mesma suíte por trás do adaptador do editor (`handle.getTree()`/`handle.insertTree()`), como o S-1 já fez com Playwright em `tests/mdxeditor`. A fonte das fixtures é a mesma pasta, nunca uma cópia.
- **ADR 007** (renderização, ainda não escrito): roda a mesma suíte contra o renderer, comparando snapshot do HTML ou do hast por fixture. Fica registrado como premissa para quando o 007 for escrito, não implementado aqui.

Nenhum dos três consumidores duplica a lista de fixtures nem o cálculo do placar. Alternativa descartada: cada ADR manter sua própria cópia da suíte, como o S-1 fez de fato para os testes de editor (Playwright, fora do `runFixtureSuite`). Custo aceito: a suíte de editor continua em Playwright, fora deste runner, porque testa interação de UI que o runner Vitest não cobre. `runFixtureSuite` cobre a parte que os três têm em comum: carregar a fixture, aplicar a operação e comparar com `expected.md` ou com os códigos `DOK-E` esperados.

## 5. Funções que camadas futuras vão pedir

Duas funções que o ADR 002 ainda não publica, registradas para a camada consumidora acrescentar quando chegar a vez, sem implementação nesta emenda:

1. **`toProfile(tree, destino)`** para o ADR 010 (Exportação): converte `DokAST` para a árvore ou o texto de um destino (`markdown-gfm`, `obsidian`, `starlight-md`, `starlight-mdx`, `docx-intermediate`), usando a Matriz de tradução do Apêndice B do ADR 002 como especificação. O ADR 010 é dono da implementação e da assinatura final.
2. **Exportação formal de `classifyUrl`** para o ADR 007 (Renderização): a função já existe em `dokmd.ts`, usada hoje só internamente por `validateDok` para classificar `dok:page/…`, `dok:asset/…` e `dok:diagram/…`. O ADR 007 precisa da mesma classificação para resolver um link em algo navegável (título da página, existência do recurso), e hoje reimplementaria a lógica ou dependeria de um símbolo não publicado. Fica registrado como premissa para o ADR 007: publicar `classifyUrl` (ou um envoltório com outro nome) em `interfaces_publicadas`, sem mudar a assinatura nem o comportamento, então é adição e não reabertura quando acontecer.

## Verificação de compatibilidade

### Para trás

| Contrato | Situação | Evidência |
| :--- | :--- | :--- |
| ADR 002, "todo produtor e consumidor de conteúdo usa DokAST via `src/content-format`" | Cumprida | Nenhuma função nova nesta emenda parseia Markdown por conta própria. `toProfile` e `classifyUrl` publicado seguem operando sobre `DokAST` |
| ADR 002, dependências do contrato (seção 13) | Intactas | Nenhum pacote novo. A medição e o build de plataforma browser usam só `vite` e `node`, já presentes no ambiente de desenvolvimento, não entram como dependência de produção |
| ADR 003, `content.page_revisions.content_dokmd text not null` | Cumprida | O limite de tamanho (seção 3) é guarda de aplicação, não migração de schema. A coluna `text` do Postgres continua sem limite próprio |
| ADR 005, adaptador do editor chama `parseDok`/`serializeDok` no navegador | Cumprida | Seção 1 confirma que o mesmo módulo roda sem DOM nem builtin de Node, condição que o adaptador já assume |

### Para frente

| Camada | Premissa desta emenda | Evidência |
| :--- | :--- | :--- |
| Renderização (007) | Recebe `classifyUrl` publicado (seção 5) e a restrição de execução sem DOM/Node builtin (seção 1) | Interfaces publicadas abaixo |
| Exportação (010) | Recebe `toProfile` a implementar (seção 5) e o ambiente do job agendado como lacuna aberta (seção 1) | Interfaces publicadas abaixo, alerta da seção 1 |
| Busca (009) | Sem mudança: `extractText` já publicado pelo ADR 002, esta emenda não altera | Nenhuma |
| Persistência | Recebe o limite de 300.000 bytes (seção 3) como validação que roda antes de qualquer gravação em `content_dokmd` | Seção 3 |

## Bloco YAML complementar (LEDGER.md, contrato do ADR 002)

```yaml
adr: "002"
emenda: 1
titulo: "Execução, desempenho e testes do src/content-format"
data: "2026-09-19"
decisao: "src/content-format roda sem DOM e sem builtin de Node nos três ambientes (navegador, server function em Cloudflare Workers, job agendado), verificado por build de plataforma browser sem externos. O pipeline completo do save conclui em até 300 ms p95 para uma página de 5 mil linhas. Página acima de 300.000 bytes de texto canônico é recusada com DOK-E011. A suíte de 30 fixtures roda como runFixtureSuite compartilhado, sem número fixo."
interfaces_publicadas:
  - nome: "runFixtureSuite"
    tipo: "função"
    descricao: "src/content-format/testing/runFixtureSuite.ts. (fixturesRoot, manifestPath) => SuiteResult. Lê manifest.json e itera o array, sem contar com um número fixo de fixtures. Consumida por content-format (este ADR), pelo adaptador do editor (ADR 005) e pelo renderer (ADR 007, ainda não escrito)"
  - nome: "classifyUrl"
    tipo: "função"
    descricao: "Classifica uma URL em dok:page/<uuid>[#slug], dok:page/new?title=, dok:asset/<uuid>, dok:diagram/<uuid>[?view=<uuid>], https externo, âncora local ou inválida. Já existe em dokmd.ts, uso interno de validateDok. Esta emenda publica a assinatura para o ADR 007 consumir na resolução de links"
restricoes_impostas:
  - "src/content-format não importa nenhum builtin do Node (node:* ou sem prefixo: fs, path, os, child_process) nem referencia window, document, navigator, localStorage ou sessionStorage. Verificado por build de plataforma browser (rollupOptions.external: []) no mesmo gate da fatia F0"
  - "Toda gravação em content_dokmd passa por validateDok, que recusa com DOK-E011 texto canônico acima de 300.000 bytes UTF-8, antes de qualquer outra checagem"
premissas_sobre_camadas_futuras:
  - camada: "Renderização (ADR 007)"
    premissa: "Resolve dok:page/…, dok:asset/… e dok:diagram/… usando classifyUrl publicado por esta emenda, sem reimplementar a classificação"
  - camada: "Exportação (ADR 010)"
    premissa: "Implementa toProfile(tree, destino) sobre DokAST, usando a Matriz de tradução do Apêndice B do ADR 002 como especificação. Decide o runtime do job agendado de sincronização, respeitando a restrição de execução sem DOM/Node builtin"
riscos_abertos:
  - "O orçamento de 300 ms p95 (seção 2) foi medido em Node num laptop, não no isolado V8 do Cloudflare Workers nem num navegador real. Mesma família de motor (V8), número exato em produção não confirmado. Dono: quem implementar a fatia F1, antes de travar o orçamento como gate de CI"
  - "O plano do Cloudflare Workers em produção (gratuito, com teto de 10 ms de CPU por requisição, ou pago, com 30 s por padrão) não está registrado em nenhum ADR. Um pipeline de save de página grande no plano gratuito estouraria o teto de CPU. Dono: quem decidir o plano de hospedagem"
  - "O limite de 300.000 bytes assume uma correlação bytes/linha medida em conteúdo misto (headings, listas, código, tabela, callout, tabs, steps, diagrama). Uma página real muito mais densa em um único tipo de bloco (por exemplo, só tabelas largas) pode atingir o teto de bytes bem antes das 20 mil linhas usadas como referência de UX na seção 3"
  - "O limite de 300.000 bytes não marca uma descontinuidade medida. A curva do p50 cresce de forma suave e superlinear entre 5 mil e 40 mil linhas, sem joelho. O corte é escolha de produto ancorada no limiar de um segundo, e uma revisão que decida por 150.000 ou por 600.000 bytes não contraria nenhuma medição desta emenda. Dono: quem implementar a fatia F4 do ADR 002, ao observar tamanhos reais de página"
  - "cloudflare.nodeCompat: true no preset do Lovable faz a server function de hoje resolver builtin do Node se src/content-format importar um. A restrição desta seção não depende mais do alvo de build, só do navegador, que não tem essa exceção. Quem revisar código novo do módulo não pode assumir que o ambiente de servidor bloqueia builtin do Node por conta própria. Dono: as três verificações da seção 1, não a configuração do Nitro"
gatilhos_de_reabertura:
  - "A medição em ambiente real (Cloudflare Workers de preview) diverge da ordem de grandeza medida em Node por mais de 2x"
  - "O ADR 010 decide um runtime para o job agendado que não é um isolado V8 (por exemplo, uma função Node tradicional), e passa a poder usar builtins do Node sem quebrar a restrição desta emenda, o que reabre a seção 1 só para esse consumidor"
  - "A fatia F5 do ADR 002 (migração do legado) encontra páginas reais acima de 300.000 bytes, e a migração precisa de uma política de divisão que esta emenda não desenha"
```
