# Custo das flags estritas de TS do app sobre `src/content-format`

Data: 2026-09-20. Medição contra o porte TS strict do S-1 (`adrs/_work/spike-s1/content-format/dokmd.ts`, 30/30 nas fixtures do ADR 002). Resolve a pendência 6 de `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`, antes da ordem da fatia F1.

## Método

`tsconfig.json` real do app (`/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app/tsconfig.json`) tem `strict` mais seis flags além do que o `tsconfig.json` do spike já liga (`strict`, `noUncheckedIndexedAccess`): `noFallthroughCasesInSwitch`, `noImplicitOverride`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, `exactOptionalPropertyTypes`, `noUncheckedSideEffectImports`.

Arquivo `tsconfig.flags-teste.json` temporário no spike, `extends: "./tsconfig.json"`, as seis flags acrescentadas, `include: ["content-format"]`. `tsc -p tsconfig.flags-teste.json --noEmit` rodado, o arquivo temporário apagado ao final. `dokmd.ts` não foi alterado por esta medição.

## Resultado da compilação

```
$ tsc -p tsconfig.flags-teste.json --noEmit
exit: 2
```

8 erros, em 3 códigos, todos em `dokmd.ts`. `check-fixtures.ts` e `perf.ts`, os dois outros arquivos de `content-format/`, compilam sem erro sob as seis flags.

| Código | Ocorrências | Flag que provoca |
| :--- | ---: | :--- |
| `TS4111` | 4 | `noPropertyAccessFromIndexSignature` |
| `TS2322` | 2 | `exactOptionalPropertyTypes` |
| `TS2379` | 2 | `exactOptionalPropertyTypes` |

`noFallthroughCasesInSwitch`, `noImplicitOverride`, `noImplicitReturns` e `noUncheckedSideEffectImports` não produzem nenhum erro nesta versão do arquivo.

## Erros agrupados por causa

### Grupo 1: acesso por índice com ponto (`TS4111`, `noPropertyAccessFromIndexSignature`)

Exemplo, `dokmd.ts:97`:

```ts
if (ordered.props && typeof ordered.props === 'object') {
```

`ordered` é `Record<string, unknown>`, e a flag exige colchete em vez de ponto para qualquer campo que vem de índice, não de propriedade nomeada. As quatro ocorrências são as quatro leituras de `ordered.props` dentro de `canonicalYaml`.

Padrão de correção: trocar `ordered.props` por `ordered['props']` nas quatro linhas. Mecânico, sem mudança de comportamento em runtime.

### Grupo 2: campo opcional recebendo `undefined` explícito (`TS2322`/`TS2379`, `exactOptionalPropertyTypes`)

Exemplo, `dokmd.ts:151` e `165`:

```ts
export type UrlClass =
  | { kind: 'page'; id: string; anchor?: string }
  // ...
return { kind: 'page', id: m[1]!, anchor: m[2] }   // m[2]: string | undefined
```

`exactOptionalPropertyTypes` distingue "a chave está ausente" de "a chave existe com valor `undefined`". `anchor?: string` só aceita a primeira forma. `m[2]` (grupo de captura opcional de regex) é `string | undefined`, e atribuí-lo à chave dispara o erro. As quatro ocorrências são: `UrlClass.anchor`, `UrlClass.view`, o `title` do mapa local de `inlineReferences`, e `Diagnostic.line`.

Padrão de correção: acrescentar `| undefined` ao tipo do campo opcional em cada um dos quatro pontos (`anchor?: string | undefined`, e assim por diante), como o próprio compilador sugere na mensagem de erro. Mecânico, sem mudança de comportamento: o campo continua opcional, só passa a aceitar o valor `undefined` explícito que o código já produzia.

## Fix aplicado e revertido nesta sessão, como evidência

Os dois padrões foram aplicados de fato ao arquivo do spike, para medir o resultado em vez de estimar:

1. `tsc -p tsconfig.flags-teste.json --noEmit` depois do fix: `exit: 0`, zero erros.
2. `node content-format/check-fixtures.ts` depois do fix: 30/30 fixtures aprovadas, sem regressão.
3. `git diff --stat` do fix: 1 arquivo, poucas linhas (as quatro trocas de ponto por colchete mais as quatro anotações `| undefined`).

O fix foi revertido ao final desta tarefa (`git checkout -- content-format/dokmd.ts`), porque escrever o fix definitivo é trabalho da fatia F1, não desta medição.

> [!WARNING]
> Nota sobre o estado do repositório: ao reverter, `git checkout` restaurou o arquivo para o `HEAD` atual, não para o estado anterior a esta sessão. Um commit externo (`f742395`, não feito por esta tarefa) capturou o `HEAD` no meio da medição, e o `HEAD` de hoje já contém quatro das cinco linhas do fix aplicado aqui (as quatro do Grupo 1 e duas das quatro do Grupo 2). Confirmado por `git diff` linha a linha depois do `checkout`: o arquivo em disco ficou idêntico ao `HEAD`, e o `HEAD` já tinha a maior parte do fix. Não é uma decisão desta tarefa, é um efeito do commit externo. Registrado para quem revisar não interpretar as linhas já mudadas como decisão tomada aqui.

> [!NOTE]
> Adendo de 2026-09-20, escrito pela sessão A na revisão desta tarefa e acrescentado sem alterar o texto acima. O reparo saiu no commit que traz este adendo: `dokmd.ts` voltou ao estado de `14379cd`, o artefato que passou 30/30 no S-1, e `tsconfig.flags-teste.json` deixou o repositório. As 30 fixtures rodaram contra o arquivo restaurado, 30/30. Duas correções ao alerta acima. As linhas que o `f742395` levou ao `HEAD` foram três do Grupo 2 (`Diagnostic.line`, `UrlClass.anchor`, `UrlClass.view`), não duas, e por isso a compilação do `HEAD` devolvia um erro e não dois. O commit foi da sessão A, com escopo largo de `git add`, e a regra que faltava está em `guia-sessoes/PROTOCOLO.md`, seção "Quem decide".

## Custo em dias

Medido, não estimado, para a extensão dos dois padrões: aplicar as oito correções em `dokmd.ts` (319 linhas) levou menos de cinco minutos, e o resultado compila limpo e passa 30/30 sem edição adicional.

Estimado, não medido, para o custo real da fatia F1: **0,25 a 0,5 dia**. A diferença entre o medido e o estimado é o que a fatia F1 faz além de aplicar este padrão ao arquivo já existente: revisar cada novo trecho de código que `content-format` ganhar durante o porte (`collectRefs`, `extractText`, `importDialect`, `migrateDok`, nenhum escrito ainda) com o mesmo cuidado, porque o padrão se repete em qualquer código novo que leia campo opcional de `mdast` ou objeto por índice. O número não é uma reserva de risco por incerteza de causa: a causa está identificada e o fix, verificado.

## Recomendação

**Corrigir o código na fatia F1, não afrouxar o `tsconfig.json` de `src/content-format`.**

Alternativa descartada: um `tsconfig.json` próprio para `src/content-format`, mais frouxo, por referência de projeto (`references` no `tsconfig.json` raiz do app). Descartada porque o módulo roda no navegador, onde o `noPropertyAccessFromIndexSignature` e o `exactOptionalPropertyTypes` pegam exatamente o tipo de erro que a Emenda 1 (seção 1) já trata como superfície de risco (acesso indevido a estrutura dinâmica, campo que deveria estar ausente e não está). Afrouxar o rigor no módulo que mais lida com entrada externa (Markdown de terceiros, via `importDialect`) é o oposto do que a arquitetura pede. Custo aceito da recomendação: a fatia F1 carrega este ajuste como parte do seu próprio critério de pronto (`tsc` limpo já está lá), sem virar item novo na estimativa de 2 dias do ADR 002, porque o custo medido é pequeno o bastante para caber dentro dela.

## Verificação final

```
$ git diff --stat -- adrs/_work/spike-s1/content-format/dokmd.ts
(vazio)
```

`adrs/_work/spike-s1/tsconfig.flags-teste.json` apagado ao final, não é entregável desta tarefa.
