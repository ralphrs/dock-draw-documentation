# Achado de 2026-09-20: a Emenda 1 foi aceita com uma restrição que contradizia uma interface dela mesma

## O que aconteceu

A Emenda 1 ao ADR 002 entrou no `LEDGER.md` em 2026-09-20 com duas afirmações incompatíveis, nas duas seções do mesmo bloco de contrato.

Em `restricoes_impostas`:

> `src/content-format` não importa nenhum builtin do Node (`node:*` ou sem prefixo: `fs`, `path`, `os`, `child_process`)

Em `interfaces_publicadas`:

> `runFixtureSuite`, em `src/content-format/testing/runFixtureSuite.ts`, assinatura `(fixturesRoot: string, manifestPath: string) => SuiteResult`

Uma função que recebe um caminho de diretório e um caminho de manifesto e devolve o resultado de uma suíte lê o disco. Não há implementação dela sem `node:fs`, e o caminho dela está dentro de `src/content-format`.

## Por que a revisão não apanhou

A revisão da Emenda 1 conferiu o que estava sob suspeita. A primeira medição de desempenho da emenda já tinha caído uma vez, e a atenção foi para os números: cinco rodadas do harness, três faixas recalculadas, o espalhamento do p50 refeito de fora. A premissa de ambiente foi verificada abrindo o preset real do Nitro. O custo das flags estritas foi reproduzido erro a erro.

Nada disso olhava a coerência interna do bloco de contrato. As duas seções foram lidas, cada uma julgada correta em si, e a contradição entre elas não pertencia a nenhuma das duas leituras.

## O que a apanhou

Escrever o código. A ordem da fatia F1 precisou criar `runFixtureSuite.ts`, e o arquivo saiu com `import { existsSync, readFileSync } from "node:fs"` na terceira linha.

A fatia F0 já tinha resolvido o problema prático, antes de a emenda existir: o bloco de ESLint traz `ignores: ["src/content-format/testing/**"]`, e o build de verificação de plataforma browser aponta para `src/content-format/index.ts`, não para a pasta. O mecanismo estava certo, o texto do contrato é que ficou absoluto.

## O custo, se não tivesse sido apanhado aqui

A sessão C confere o diff contra as `restricoes_impostas` de todos os ADRs aceitos. Lendo a frase como estava escrita, o veredito correto dela seria reverter, por uma violação que não existia. Um ciclo de fatia e um `git revert` na `main` do app, que alimenta o Lovable.

## Correção aplicada

A restrição passou a nomear a exceção, aprovada em `DDP-56`, e a dizer por que ela existe, no `LEDGER.md` e em `adrs/ADR-002-emenda-1.md`, que continuam idênticos byte a byte.

## O que fica para as próximas revisões de contrato

Um bloco de contrato precisa ser lido contra si mesmo, e não só contra a realidade. A pergunta que faltou é curta: **cada interface publicada pode ser implementada sem violar alguma restrição imposta no mesmo bloco?**

Isso não é uma regra de processo nova nem um passo a mais no checklist. É a pergunta que a revisão de `parada 5` já deveria fazer, e que esta sessão não fez.
