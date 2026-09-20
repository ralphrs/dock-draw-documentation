# Achados: os ADRs aceitos contra o código real do app

Levantamento de 2026-09-19, feito lendo `dok-draw-app` de fato (`package.json`, `tsconfig.json`, `vite.config.ts`, `src/`, `supabase/migrations/`) e comparando com `insumos/BASE.md` e `adrs/LEDGER.md`.

Este arquivo registra fatos verificados e as decisões que eles exigem. Não é um DEC: vira um ou mais DEC quando cada pendência for decidida.

## 1. O app entregue é o Diagram Studio, não a Wiki

O `insumos/BASE.md` declara a Wiki como produto principal e o Diagram Studio como apoio. No código, a relação está invertida: o Diagram Studio existe e funciona, a Wiki não tem uma linha.

| Previsto | ADR | No app |
| :--- | :--- | :--- |
| `src/content-format` | 002 | não existe |
| `src/content-store` | 003 | não existe |
| `src/editorial-flow` | 004 | não existe |
| `src/editors` e `src/content-components` | 005 | não existe |
| Schema `content.*` (15 tabelas) | 003 e 004 | nenhuma. O banco tem só `public` e `private` |
| `content.effective_role()` | 003 | não existe. O real é `public.has_role` |

Das 27 dependências fixadas nos contratos dos ADRs 002 e 005, **nenhuma está instalada**. O ADR 001 é o único contrato implementado, e suas cinco tabelas existem exatamente como o contrato descreve.

Consequência para o planejamento: a trilha de desenvolvimento começa do zero na Wiki. A meta de `DEC-0004` não tem atalho, e a estimativa de seis a sete sprints se confirma pelo lado do código.

## 2. Divergências entre a arquitetura base declarada e o app

Estas precisam de decisão, porque `insumos/BASE.md` é a referência que todo ADR novo consulta.

| Item | `insumos/BASE.md` diz | O app usa | Efeito |
| :--- | :--- | :--- | :--- |
| Formatador | `oxfmt` | `prettier ^3.7.3`, com `.prettierrc`, `.prettierignore`, `eslint-config-prettier` e `eslint-plugin-prettier` | Uma tarefa `D` que rodar o formatador declarado reformata o repositório inteiro |
| Classes de tema | `.theme-dark` e `.theme-light` | `.dark` do padrão shadcn, mais `data-palette` para paleta | O critério de aceite do teste 6 do ADR 005 cita as classes declaradas. Escrito como está, o teste falha no app |
| Versão de dependência | "sempre a última estável" | `nitro 3.0.260603-beta` | Beta em dependência de build |
| Rigor de TypeScript | "TS strict" | `strict` mais seis flags: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch` | O app é mais rigoroso que o declarado. Nenhum ADR precificou esse custo para `src/content-format`, que é código denso em índices e opcionais |
| Dependências do ADR 001 | o contrato no ledger não tem bloco `dependencias` | `@xyflow/react ^12.11.6` instalado | Não há valor declarado para conferir contra o instalado |

O `insumos/` é bloqueado para escrita, então a correção de `BASE.md` é proposta ao humano, nunca aplicada pela sessão A.

## 3. Uma afirmação da Emenda 1 apoia-se em comentário, não em verificação

A seção 1 da Emenda 1 ao ADR 002 decide que `src/content-format` não pode usar builtin de Node, e justifica com o alvo Cloudflare do Nitro. A evidência citada é um comentário dentro de `vite.config.ts`:

```
// nitro (build-only using cloudflare as a default target)
```

Toda a configuração do Vite vem do preset `@lovable.dev/vite-tanstack-config`, e o conteúdo desse pacote não foi lido. O alvo Cloudflare é, hoje, declaração de um comentário sobre um preset, não fato verificado.

A restrição continua provavelmente certa, e é conservadora de qualquer forma: código sem builtin de Node roda em Node e em isolado V8. O que não está estabelecido é a premissa usada para justificá-la, e dela sai também o segundo `riscos_abertos` da emenda, sobre o plano do Cloudflare Workers.

Esta ressalva não apareceu na revisão de `T-0006` porque a conferência do arquiteto olhou o `vite.config.ts` do app e encontrou o comentário, sem abrir o preset.

## 4. O que está íntegro

Registrado porque conferir e não achar problema também é resultado.

- `insumos/package.json` é byte a byte idêntico ao `package.json` do app. O drift previsto no `CLAUDE.md` não aconteceu.
- `insumos/supabase-types-dokdraw.ts` é idêntico a `src/integrations/supabase/types.ts` do app.
- `zod`: o contrato do ADR 002 no ledger foi corrigido para `^4.6.5, ou ^3.25.76 do app importando de zod/v4`. O app tem `^3.25.76`. A reconciliação feita pelo ADR 005 está correta.
- Tailwind v4 sem `tailwind.config` e sem PostCSS, cores por token em `@theme inline`, alias `@`: tudo conforme declarado.
- `public.invites` de fato não tem `workspace_id`. O conflito C-3 está confirmado contra o schema real, não só contra os ADRs.

## 5. Divergência de status, em três lugares

Além dos arquivos dos ADRs 002, 003 e 004, que dizem `status: "Proposto"` enquanto o ledger diz Aceito, o `insumos/ORDEM.md` também marca 002 a 004 como "Proposto" e 005 como "Próximo".

São três fontes discordando sobre o mesmo fato. O ledger é a fonte de verdade declarada, e os outros dois estão defasados. A correção dos arquivos de ADR é categoria `aceite-adr`. A correção do `ORDEM.md` cai no bloqueio de `insumos/` e é proposta ao humano.

## Pendências que este levantamento cria

| # | Pendência | Categoria | Estado |
| :--- | :--- | :--- | :--- |
| 1 | Status dos ADRs 002, 003 e 004 nos arquivos | `aceite-adr` | aguarda o humano |
| 2 | Status no `insumos/ORDEM.md` | proposta ao humano (`insumos/` bloqueado) | aguarda o humano |
| 3 | Formatador: `oxfmt` ou `prettier` | proposta ao humano | aguarda o humano |
| 4 | Classes de tema: `.theme-*` ou `.dark` | proposta ao humano, e afeta o teste 6 do ADR 005 | aguarda o humano |
| 5 | `nitro` beta | proposta ao humano | aguarda o humano |
| 6 | Custo das flags estritas de TS para `src/content-format` | tarefa `T`, entra na Emenda 1 ou numa emenda própria | a criar |
| 7 | Verificar o alvo real do Nitro abrindo o preset do Lovable | tarefa `T`, qualifica a seção 1 da Emenda 1 | a criar |
| 8 | Dependências do ADR 001 ausentes do contrato no ledger | `ledger` | aguarda o humano |
