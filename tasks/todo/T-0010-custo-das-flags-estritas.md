> [!WARNING]
> Migrada para o Jira: **DDP-2** (https://dokdrawapp.atlassian.net/browse/DDP-2). Não executar a partir deste arquivo. Ver `decisoes/DEC-0009-comunicacao-por-jira.md`.

---
id: T-0010
titulo: "Medir o custo das flags estritas de TS do app para o porte do content-format"
criada_por: A
criada_em: 2026-09-20T09:25
adr: "002"
tipo: pesquisar
depende_de: []
exige_aprovacao_humana: false
---

## Objetivo

O custo de compilar `src/content-format` sob o `tsconfig.json` real do app está medido, em número de erros por categoria, antes que a ordem da fatia F1 seja escrita.

## Contexto

Pendência 6 de `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`. O `tsconfig.json` do app tem `strict` mais seis flags: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noImplicitReturns` e `noFallthroughCasesInSwitch`. O porte que passou 30/30 no S-1 (`adrs/_work/spike-s1/content-format/dokmd.ts`) compila sob o `tsconfig.json` do spike, que não tem essas seis.

`dokmd.ts` é código denso em acesso por índice e em campos opcionais de mdast, que é exatamente o que `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` atingem. Uma ordem de fatia F1 escrita sem esse número manda o Lovable descobrir o custo sozinho, no meio da execução, e a saída provável é ele desligar a flag ou espalhar `as` pelo código.

## Entregáveis

`adrs/_work/ADR-002-custo-flags-estritas.md`.

## Critério de pronto

1. **Número real, obtido por compilação.** Rodar `tsc --noEmit` sobre `adrs/_work/spike-s1/content-format/dokmd.ts` com as seis flags do app ligadas, sem alterar o arquivo. Anexar a saída e a contagem de erros por código (`TS2532`, `TS2375` e os demais que aparecerem).
2. **Erros agrupados por causa, não listados um a um.** Cada grupo com um exemplo de linha, a flag que o provoca e o padrão de correção que resolve o grupo inteiro (checagem explícita, `satisfies`, tipo auxiliar). A contagem de linhas a tocar por grupo entra na tabela.
3. **Custo em dias, com faixa.** Estimativa para deixar `dokmd.ts` compilando limpo sob as seis flags, sem `any`, sem `@ts-expect-error` e sem afrouxar o `tsconfig` do app.
4. **Recomendação com alternativa descartada e custo aceito.** As opções em jogo: corrigir o código na fatia F1, ou dar a `src/content-format` um `tsconfig` próprio mais frouxo por referência de projeto. A recomendação diz qual, e o que se perde na outra.
5. **Sem alterar o porte.** `git diff` de `adrs/_work/spike-s1/` vazio ao final, fora o arquivo novo de análise.

## Restrições

- Não editar o `tsconfig.json` do app, nem qualquer arquivo em `dok-draw-app`. A medição roda no spike, com as flags ligadas por linha de comando ou por um `tsconfig` temporário que não fica no repositório.
- Não escrever a ordem da fatia F1 nesta tarefa. Aqui se mede, lá se decide o texto.
- Não commitar.
