# Auditoria: toda restrição do ledger contra o mecanismo que a reprova

**Data:** 2026-09-20
**Feita por:** sessão A
**Motivo:** cinco defeitos do mesmo tipo em um dia, todos com a forma "restrição afirmada, mecanismo sem alcance"

## O que foi auditado

As 37 restrições dos blocos `restricoes_impostas` do `adrs/LEDGER.md`, dos ADRs 001, 002, Emenda 1, 003, 004, 005 e 006. Para cada uma, uma pergunta só:

> Se alguém violar esta restrição amanhã, qual comando, teste ou regra fica vermelho?

Resposta que não nomeia um comando é lacuna, mesmo quando a restrição está sendo cumprida hoje.

## Por que esta auditoria existe

Cinco ocorrências da mesma forma em 2026-09-20, todas apanhadas por leitura humana e nenhuma por máquina:

| # | Restrição | O que faltava |
| :-- | :--- | :--- |
| 1 | `DOK-E011` recusa texto acima de 300.000 bytes | O código não tinha o diagnóstico, e nenhuma fixture passa do limite. A suíte daria 30/30 |
| 2 | `DOK-E010` acusa referência não normalizada | A normalização dentro de `validateDok` apagaria o diagnóstico, e nenhuma fixture roda o validador sobre texto não normalizado |
| 3 | Escopo dos arquivos da ordem | `prettier --write .` reescreveria 64 arquivos, 16 deles fixtures do corpus |
| 4 | Critério de lint da fatia | `bun run lint` já falhava na `main` por dívida alheia, tornando o aceite impossível |
| 5 | `src/content-format` sem builtin do Node | O build de plataforma browser tem entrada só em `index.ts`, e não alcança arquivo novo do módulo |

Nos cinco casos o texto do contrato estava correto e a verificação não existia.

## Resultado

**Das 37 restrições, 9 cobrem código que existe hoje.** As outras 28 pertencem a camadas que o app ainda não tem, e o mecanismo delas precisa nascer junto com a fatia que as implementa, pela regra que o `PROTOCOLO.md` passou a impor.

### Restrições sobre código existente

| Restrição | Mecanismo hoje | Situação |
| :--- | :--- | :--- |
| ADR 002: referência por id em URI `dok:`, título é só rótulo | `classifyUrl`, `DOK-E005`/`DOK-E006`, fixtures 12 a 15 | Coberta |
| ADR 002: directives só de bloco | `flowOnlyDirectives` no parser, fixtures do corpus | Coberta |
| ADR 002: conteúdo não carrega estilo | `DOK-E002` e `DOK-E004`, fixtures 24 e 30 | Coberta |
| ADR 002: datas, autor, status e hierarquia fora do conteúdo | `frontmatterSchema` é `z.strictObject`, fixture 03 | Coberta |
| Emenda 1: `DOK-E011` antes de qualquer outra checagem | Teste unitário próprio em `fixtures.test.ts` | Coberta |
| Emenda 1: sem builtin do Node fora de `testing` | Bloco de ESLint mais build de plataforma browser | **Parcial**, ver lacuna 1 |
| ADR 002: parser só muda com incremento de `dok` | `DOK-E009` existe no validador | **Parcial**, ver lacuna 2 |
| ADR 002: nenhuma camada parseia Markdown por conta própria | Nenhum | **Lacuna 3** |
| ADR 002: nenhuma camada avalia código, MDX nunca é compilado | Nenhum | **Lacuna 4** |

### Cobertura de diagnóstico, conferida contra o manifesto real

O validador emite 13 códigos. O manifesto das 30 fixtures declara 12. O cruzamento:

| Código | Emitido pelo validador | Exercitado por fixture | Observação |
| :--- | :---: | :---: | :--- |
| `DOK-E001` a `DOK-E006`, `DOK-E008` | sim | sim | Cobertos |
| `DOK-E009` | sim | **não** | Lacuna 2 |
| `DOK-E010` | sim | **não** | `DDP-68` |
| `DOK-E011` | sim | não, e tem teste próprio | Coberto por teste unitário |
| `DOK-W101` a `DOK-W103` | sim | sim | Cobertos |
| `DOK-W104`, `DOK-W106` | não, por desenho | sim | Emitidos pelo importador, fatia F6 |
| `DOK-W105` | não, por desenho | não | Depende de índice de página, fora do módulo puro |

Não existe `DOK-E007`: a numeração do ADR 002 pula o número. Conferido, não é código faltando.

## As lacunas, com o conserto de cada uma

### Lacuna 1: o build de plataforma não alcança arquivo novo do módulo

`vite.content-format-check.config.ts` tem entrada única em `src/content-format/index.ts`. Qualquer arquivo novo do módulo que não seja importado por ele fica fora do único mecanismo que pega dependência transitiva com builtin do Node.

**Conserto em curso:** `DDP-79`, que põe `refs.ts` na entrada e o comando na bateria da fatia F3.

**O que falta além disso:** a entrada precisa crescer a cada arquivo novo, e nada obriga isso. A fatia F4 vai acrescentar outro arquivo e repetir o problema.

### Lacuna 2: `DOK-E009` não tem fixture

O diagnóstico de versão futura de formato existe no validador e nenhuma fixture declara `dok:` maior que 1. Se ele parar de funcionar, a suíte continua verde.

É a mesma forma do `DOK-E011`, e o conserto é o mesmo: uma fixture, ou um teste unitário se a fixture poluir o corpus canônico.

### Lacuna 3: nada impede outra camada de parsear Markdown

A restrição diz que todo produtor e consumidor usa DokAST via `src/content-format`, e que nenhuma camada parseia Markdown por conta própria. Hoje qualquer arquivo do app pode importar `mdast-util-from-markdown` direto e ninguém acusa.

**Conserto barato:** bloco de ESLint com `no-restricted-imports` sobre `src/**`, exceto `src/content-format/**`, proibindo os pacotes de parse e serialização de Markdown do contrato.

### Lacuna 4: nada impede avaliar código

A restrição proíbe avaliar código e compilar MDX dentro do app. O `eslint.config.js` não tem `no-eval`, `no-new-func` nem `no-implied-eval`, e o app não usa nenhum dos três hoje.

**Conserto barato:** as três regras ligadas em `src/**`.

### Lacuna 5, de processo: o canal de ordem ainda corrompe código

`DDP-74` continua aberto. A descrição de issue do Jira interpreta Markdown como wiki markup, e a ordem da fatia F1 chegou ao executor com regex, união de tipos e parâmetros deturpados. Sobreviveu por diligência de quem executou e pela existência de 30 fixtures.

**Bloqueia a próxima publicação de ordem**, que é a fatia F3.

## Restrições sobre camadas que ainda não existem

Vinte e oito restrições pertencem aos ADRs 003, 004, 005 e 006, cujo código não existe no app. Auditar mecanismo para elas hoje não produz nada verificável.

O que as protege é a regra nova do `PROTOCOLO.md`: a ordem de cada fatia entrega a tabela de restrição por mecanismo, e a revisão começa por ela. A fatia F3 foi a primeira a rodar sob essa regra, e a tabela encontrou a lacuna 1 na primeira leitura.

**Fica declarado como risco:** nenhuma dessas 28 tem verificação hoje, e a única garantia é que a ordem de cada fatia traga o mecanismo junto. Se essa regra for afrouxada, o projeto volta ao estado em que cinco defeitos passaram num dia.

## Achado extra: o ledger e o arquivo do ADR divergem de propósito, e isso não está escrito em lugar nenhum

A auditoria comparou o bloco de contrato de cada ADR com o bloco correspondente no `LEDGER.md`. Três divergem, e **as três divergências estão certas**:

| ADR | O que o ledger tem a mais | Origem |
| :--- | :--- | :--- |
| 002 | A linha do `zod` refinada para `^4.6.5, ou ^3.25.76 do app importando de zod/v4`, com a confirmação de 2026-09-19. Mais dois `riscos_abertos`: o falso `DOK-W103` do validador do harness, e o corpus não exercitar `list.spread = true` | Descobertos depois do aceite, pelo spike S-1 do ADR 005 |
| 003 | `getSpaceList` na lista de funções de `src/content-store/server.ts` | Extensão aditiva pedida pelo ADR 006 |
| 004 | `listPendingRevisions` na lista de funções de `src/editorial-flow/server.ts` | Extensão aditiva pedida pelo ADR 006 |

O princípio por trás disso nunca foi escrito:

> **O `LEDGER.md` é contrato vivo e acumula. O arquivo do ADR é registro datado e não se reescreve.**

Um ADR aceito em 2026-09-18 não decidiu o que foi descoberto em 2026-09-20. Reescrevê-lo para "sincronizar" apaga a história de quando cada coisa foi sabida, que é o que dá valor ao registro. Manter os dois idênticos à força exigiria ou mentir sobre a data de uma decisão, ou perder a extensão.

**O risco de não escrever isso é concreto.** Uma conferência futura de consistência, feita por qualquer sessão, encontra "divergência" e conserta: ou reescrevendo o ADR, que destrói o registro, ou revertendo o ledger, que perde a extensão. As duas são piores que a divergência.

Os ADRs 005, 006 e a Emenda 1 conferem byte a byte hoje, porque nada foi estendido neles ainda.

**Conserto:** o `LEDGER.md` ganha uma seção declarando o princípio e listando as divergências conhecidas, para que uma conferência futura confirme em vez de consertar. Editar o ledger exige aprovação, e está em `DDP-81`.

## O que esta auditoria não promete

Ela fecha uma classe de defeito, não todas. Nada aqui cobre erro de lógica dentro de uma função que passa em todos os testes, decisão de produto errada, ou restrição que ninguém escreveu no contrato porque ninguém pensou nela. A auditoria mede a distância entre o que o contrato afirma e o que a máquina confere, e só isso.
