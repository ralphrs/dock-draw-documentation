> [!WARNING]
> Migrada para o Jira: **DDP-1** (https://dokdrawapp.atlassian.net/browse/DDP-1). Não executar a partir deste arquivo. Ver `decisoes/DEC-0009-comunicacao-por-jira.md`.

---
id: T-0009
titulo: "Corrigir a premissa de ambiente da Emenda 1 à luz do preset real do Lovable"
criada_por: A
criada_em: 2026-09-20T09:15
adr: "002"
tipo: corrigir
depende_de: []
exige_aprovacao_humana: false
---

## Objetivo

A seção 1 da Emenda 1 descreve o alvo de build real do app, e a restrição de ambiente continua de pé pelo motivo que a sustenta de fato.

## Contexto

Achado de T-0008, registrado na seção "Decisões tomadas" daquela tarefa: `@lovable.dev/vite-tanstack-config@2.20.0`, baixado e inspecionado no registro npm em 2026-09-19, força `nitroOpts.preset = "cloudflare-module"` com `cloudflare: { nodeCompat: true, ... }` dentro de um build do Lovable.

A seção 1 da Emenda 1 hoje diz que a server function "roda num isolado V8 do Cloudflare Workers, sem `fs`, `path` ou qualquer builtin do Node, a menos que o binding `nodejs_compat` seja ligado explicitamente", citando como evidência o comentário `// nitro (build-only using cloudflare as a default target)` do `vite.config.ts`. A ressalva existe no texto, e o fato é que a exceção está ligada: o preset do Lovable liga `nodeCompat`.

A restrição da emenda (JS puro, sem builtin de Node, sem DOM em `src/content-format`) não cai por isso. O que cai é a razão citada. O módulo roda também no navegador, pelo adaptador do editor do ADR 005, e o navegador não tem `nodejs_compat` para ligar. A ordem F0 já usa essa razão: a verificação que ela manda rodar é o build de plataforma browser.

## Entregáveis

`adrs/_work/ADR-002-emenda-1-rascunho.md`.

## Critério de pronto

1. **O alvo real está descrito, com a evidência.** A seção 1 cita `@lovable.dev/vite-tanstack-config@2.20.0`, o preset `cloudflare-module` e `cloudflare.nodeCompat: true`, com a data de verificação. O comentário do `vite.config.ts` deixa de ser a única fonte.
2. **A razão da restrição passa a ser o navegador.** O texto sustenta a proibição de builtin de Node pelo ambiente que não admite exceção, e registra que na server function do Lovable a compatibilidade está ligada hoje, o que não autoriza usar builtin em `src/content-format`, porque o mesmo módulo carrega no navegador.
3. **A verificação não muda.** As três checagens (build de plataforma browser, ESLint restrito, Vitest em `environment: 'node'`) continuam como estão. Se alguma delas passar a depender da razão antiga, dizer qual e por quê.
4. **A lacuna do ADR 010 continua declarada.** O alerta sobre o runtime do job agendado permanece, com dono.
5. **Nada mais muda.** Seções 2, 3 e seguintes, `DOK-E011`, os números e o bloco YAML ficam como estão, exceto se o item 2 exigir ajuste de um `riscos_abertos`, caso em que o ajuste é aditivo e declarado no "Resultado".
6. **Estilo.** `grep -n "—"` vazio e busca por ponto e vírgula fora de bloco de código vazia no arquivo inteiro.

## Restrições

- Não editar `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`. O registro em `decisoes/` é da sessão A, que promove o achado a partir do "Resultado" desta tarefa.
- Não editar `adrs/LEDGER.md`. A Emenda 1 ainda é rascunho e entra no ledger quando for aceita.
- Não commitar.
