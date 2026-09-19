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

## Resultado

### Entregáveis

`adrs/_work/spike-s1/mdxeditor/RESULTADO.md`, uma linha corrigida.

### Critério de pronto

1. **Versão correta.** ✔ `node -p "require('./adrs/_work/spike-s1/node_modules/mdast-util-to-markdown/package.json').version"` devolve `2.1.2`. Citação corrigida de `mdast-util-to-markdown@9.0.0` para `mdast-util-to-markdown@2.1.2`.
2. **Varredura completa.** ✔ `grep -rnoE "[a-zA-Z@/_.-]+@[0-9]+\.[0-9]+\.[0-9]+" --include="*.md" .` em `adrs/_work/spike-s1/` (recursivo, exclui `node_modules`) encontrou três citações no total: `zod@3.25.76` em `AMBIENTE.md` (versão do app, já marcada como tal no texto: "zod-app (alias de `zod@3.25.76`)"), `mdast-util-to-markdown@9.0.0` (corrigida) e `mdast-util-from-markdown@2.0.3` em `mdxeditor/RESULTADO.md`. A última conferida contra `node -p "require('./node_modules/mdast-util-from-markdown/package.json').version"`: `2.0.3`, já correta, sem alteração.
3. **Nenhuma outra alteração.** ✔ `git diff -- adrs/_work/spike-s1/mdxeditor/RESULTADO.md` mostra uma linha removida e uma adicionada, só o número da versão muda.
