# Achado: a bateria de verificação de uma ordem não pode rodar comando de escopo aberto

**Data:** 2026-09-20
**Origem:** revisão da ordem da fatia F1 do ADR 002 (`DDP-57`, sessão C) e a conferência da sessão A sobre a mesma ordem
**Alcance:** toda ordem de implementação escrita conforme `DEC-0007`

## O fato

A ordem da F1 nomeia três arquivos que o executor pode tocar e proíbe qualquer outro. A bateria de verificação dela abre com `bun run format`, que é `prettier --write .` no `package.json` real do app, e fecha com `bun run lint`, que é `eslint .`. Os dois varrem o projeto inteiro.

O estado da `main` do `dok-draw-app` em `ccc3ce2`, medido em 2026-09-20:

| Comando | Resultado hoje |
| :--- | :--- |
| `bunx prettier --check .` | 64 arquivos fora de formato |
| `bun run lint` | 704 problemas, 666 deles da regra `prettier/prettier` |
| `bun run typecheck` | limpo, código de saída 0 |

Dezesseis dos 64 arquivos fora de formato são fixtures de `src/content-format/testing/fixtures/`. O Prettier formata Markdown, e o que ele faz nesses arquivos muda o que o parser lê:

- `07-blocos-de-codigo/expected.md`: acrescenta ponto e vírgula ao JavaScript dentro do bloco de código, que é exatamente o conteúdo que a fixture existe para provar que sobrevive intacto ao round-trip.
- `16-callout-canonico/expected.md`: indenta em dois espaços o `:::` que fecha o callout, alterando a forma canônica que o ADR 002 decidiu.
- `20-tabs-canonico/expected.md`: insere linha em branco dentro da estrutura de tabs.

O corpus de 30 fixtures é a evidência citada pelo ADR 002 e pelo spike S-1. Reescrevê-lo apaga a base de uma decisão aceita, e a suíte não acusa: ela compara `input` transformado contra `expected`, e os dois seriam reescritos na mesma passada.

A ordem manda seguir em frente quando isso acontece: "`bun run format` muda alguma coisa nos dois arquivos novos. Aceitável, é para isso que o passo existe."

O `bun run lint` tem o defeito espelhado. O critério de pronto pede lint sem nenhum problema nos arquivos de `src/content-format/`, "incluindo os quatro que a F0 criou", e a mesma ordem proíbe editar `environment.test.ts`. Esse arquivo carrega 17 problemas de formatação herdados da F0. `bunx eslint src/content-format` termina com código 1 mesmo depois de a F1 entregar os três arquivos dela perfeitos. O critério é insatisfazível sob a própria restrição da ordem.

## A causa

Uma ordem recorta um escopo de arquivos. Um comando de projeto inteiro ignora esse recorte. Quando o repositório está limpo, os dois convivem por acidente; quando o repositório carrega dívida anterior, o comando de escopo aberto ou viola a restrição (o `--write`) ou trava o aceite (o `--check`).

A F0 entrou com 27 problemas de formatação e ninguém percebeu na hora, porque a bateria daquela ordem não tinha passo de formatação. A F1 tentou corrigir isso acrescentando `bun run format`, e o remédio de escopo aberto é pior que a doença que ele cura.

## A regra

> Todo comando da bateria de verificação de uma ordem roda no escopo que a ordem declara, não no projeto inteiro. Comando que escreve (`--write`, `--fix`) recebe a lista literal dos arquivos que a ordem cria ou edita. Comando que só confere (`--check`, `tsc`, build) pode rodar aberto quando já passa limpo na `main`, e nesse caso a ordem registra a medição do dia.

Dívida de formatação anterior não é trabalho da fatia. Ela é nomeada na ordem como pré-existente, com o número medido, e sai da definição de pronto.

## Consequências aplicadas

1. A ordem da F1 volta para a sessão B com os ajustes listados em `DDP-59`.
2. `src/content-format/testing/fixtures/` entra no `.prettierignore` do app pela própria F1. O corpus deixa de ser alcançável por qualquer execução futura de `bun run format`, inclusive fora do processo das ordens.
3. A dívida de formatação da `main` (64 arquivos, 666 problemas de `prettier/prettier`) vira issue própria de backlog, fora da meta de `DEC-0004`.
