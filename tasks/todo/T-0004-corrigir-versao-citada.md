---
id: T-0004
titulo: "Corrigir a versão de mdast-util-to-markdown citada na evidência do S-1"
criada_por: A
criada_em: 2026-09-19T20:50
adr: "005"
tipo: corrigir
depende_de: []
exige_aprovacao_humana: false
---

## Objetivo

Nenhum artefato do S-1 cita versão de pacote diferente da instalada no spike.

## Contexto

Revisão de T-0002. `adrs/_work/spike-s1/mdxeditor/RESULTADO.md`, seção "Por que x08 passa e x05/x06 não", item 2, cita `mdast-util-to-markdown@9.0.0`. A versão instalada é 2.1.2, e o contrato do ADR 002 no ledger fixa `^2.1.2`. Evidência com versão errada enfraquece o ADR que a cita.

O arquivo e as linhas citados (`lib/join.js:25-38`, `container-flow.js:74-76`) estão corretos. Só o número muda.

## Entregáveis

`adrs/_work/spike-s1/mdxeditor/RESULTADO.md`.

## Critério de pronto

1. A citação usa a versão instalada, conferida com `node -p "require('<caminho>/package.json').version"` para cada pacote citado com versão nessa seção.
2. Varredura das demais citações de versão nos artefatos do S-1 (`adrs/_work/spike-s1/**/*.md`) contra o `package-lock.json` do spike. Cada divergência corrigida ou, se a citação for proposital (versão do app, não do spike), marcada como tal no texto.
3. Nenhuma outra alteração nos arquivos tocados. Verificar com `git diff`.

## Restrições

- Não mexer em `adrs/ADR-005-edicao.md` por esta tarefa. T-0003 é dona desse arquivo agora, e o número errado não aparece lá.
- Não commitar. Os commits desta etapa estão autorizados em `A-Q-0002`, depois do ledger aplicado.
