# Spike S-1 — Ambiente e gate

Data: 2026-09-19. Projeto descartável. Nada daqui vai para o app.

## Instalação

- `npm install --ignore-scripts`, cache do npm isolado no scratchpad da sessão. 516 pacotes.
- Scripts dos pacotes de produto conferidos antes (`npm view <pacote> scripts`): `@mdxeditor/editor`, `platejs`, `@platejs/*`, `@codemirror/*` e `diff` não têm `preinstall`, `install` nem `postinstall`. Os `@codemirror/*` têm só `prepare`, que não roda em instalação a partir do registro.
- Auditoria do fecho transitivo de produto depois da instalação (editores, CodeMirror, `diff`, dependências do content-format, Radix, React): 323 pacotes, nenhum com script de instalação, nenhum `binding.gyp` nem `.node`. Licenças: 314 MIT, 3 BSD-3-Clause (`diff` 5.2.2 via MDXEditor, `diff` 9.0.0), 2 ISC (`github-slugger`, `yaml`), 1 MIT via campo legado (`format`), 1 0BSD (`tslib`), 1 Python-2.0 (`argparse` 2.0.1, via `js-yaml` do MDXEditor), 1 Apache-2.0 (`@juggle/resize-observer`, via `slate-react`).
- `@types/diff` removido: `diff` 9.0.0 publica os próprios tipos (`exports["."].import.types`).
- `tsx` descartado: o Node 26.8.2 executa `.ts` direto.

## Versões: app × última estável

Versões de `insumos/package.json` (o app). A instrução pedia `insumos/package-app.json`; o arquivo existente é `insumos/package.json`.

| Pacote | App (faixa) | Resolvido no spike | Última estável em 2026-09-19 |
| --- | --- | --- | --- |
| `react`, `react-dom`, `@types/react*` | `^19.2.0` | 19.3.0 | 19.3.0 |
| `@tanstack/react-start` | `1.168.32` | 1.168.32 | 1.168.56 |
| `@tanstack/react-router` | `1.170.18` | 1.170.18 | 1.170.38 |
| `@tanstack/router-plugin` | `1.168.23` | 1.168.23 | não conferida |
| `vite` | `8.1.5` (override `rolldown` 1.2.1) | 8.1.5 | 8.3.0 |
| `@vitejs/plugin-react` | `^5.2.0` | 5.2.0 | 6.1.1 |
| `typescript` | `^5.8.3` | 5.9.3 | 7.0.2 |
| `tailwindcss`, `@tailwindcss/vite` | `^4.2.1` | 4.3.3 | 4.3.3 |
| `@radix-ui/react-dropdown-menu` | `^2.1.16` | 2.1.24 | 2.1.24 |
| `@radix-ui/react-popover` | `^1.1.15` | 1.1.23 | 1.1.23 |
| `vite-tsconfig-paths` | `^6.0.2` | 6.1.1 | 6.1.1 |
| `@lovable.dev/vite-tanstack-config` | `^2.20.0` | 2.23.1 | 2.23.1 |
| `nitro` | `3.0.260603-beta` | idem | não conferida |

Radix: o app usa pacotes separados `@radix-ui/react-*`, não o agregado `radix-ui`. O spike segue o app: `react-dropdown-menu` e `react-popover`.

## Achado: zod do app × contrato do ADR 002

- O contrato do ADR 002 fixa `zod ^4.6.5`, com a nota "provavelmente já presente no app". O app usa `zod ^3.25.76`.
- `zod` 3.25.76 publica a API 4 no subpath `zod/v4`.
- Gate com o módulo portado importando `zod-app/v4` (alias de `zod@3.25.76`): **30/30**.
- Gate importando `zod-app` (API 3 clássica): falha na carga, `TypeError: z.uuid is not a function`.
- Consequência: o `src/content-format` funciona no app sem trocar a major do zod, desde que importe `zod/v4`. A divergência com o texto do contrato do 002 vai para a parada 5 (dono: ADR 002, emenda 1 ou o diff do ledger). O ADR 005 não altera o contrato.

## Gate do porte

Porte em `content-format/dokmd.ts` e `content-format/check-fixtures.ts`, a partir de `adrs/ADR-002-anexos/harness/`. Mudanças: tipos, nomes do contrato (`parseDok`, `serializeDok`, `normalizeDok`, `validateDok`) e `Diagnostic.message` no lugar de `msg`. Lógica idêntica.

- `npx tsc --noEmit -p .` (strict, `noUncheckedIndexedAccess`): exit 0.
- `npm run gate`:

```
ok    01-frontmatter-minimo              canonical 5 checagens
ok    02-frontmatter-completo            canonical 5 checagens
ok    03-frontmatter-invalido            canonical 2 checagens
ok    04-headings-e-inline               canonical 5 checagens
ok    05-listas-marcadores               canonical 5 checagens
ok    06-listas-aninhadas-tarefas        canonical 5 checagens
ok    07-blocos-de-codigo                canonical 5 checagens
ok    08-tabela-gfm                      canonical 5 checagens
ok    09-notas-de-rodape                 canonical 5 checagens
ok    10-quebras-e-escapes               canonical 5 checagens
ok    11-links-externos                  canonical 5 checagens
ok    12-link-interno                    canonical 5 checagens
ok    13-link-titulo-vivo                canonical 5 checagens
ok    14-link-por-referencia             canonical 5 checagens
ok    15-urls-proibidas                  canonical 2 checagens
ok    16-callout-canonico                canonical 5 checagens
ok    17-callout-gfm-alert               import    4 checagens
ok    18-callout-obsidian                import    4 checagens
ok    19-aside-starlight-jsx             import    4 checagens
ok    20-tabs-canonico                   canonical 5 checagens
ok    21-tabs-starlight-jsx              import    4 checagens
ok    22-steps-canonico                  canonical 2 checagens
ok    23-diagram-canonico                canonical 5 checagens
ok    24-diagram-invalido                canonical 2 checagens
ok    25-diagram-legado                  import    4 checagens
ok    26-wikilinks-obsidian              import    4 checagens
ok    27-embeds-obsidian                 import    4 checagens
ok    28-imagens-e-anexos                canonical 5 checagens
ok    29-html-e-mdx-na-entrada           import    4 checagens
ok    30-html-e-diretivas-na-canonica    canonical 2 checagens

30/30 fixtures aprovadas
```
