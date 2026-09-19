# ADR 005 — Parada 3: lista de pacotes do spike S-1

Data: 2026-09-19. Estado: aguardando aprovação. Nada foi instalado.

Consolidação das fichas: `adrs/_work/ADR-005-consolidacao.md`.

## Mudança de desenho proposta: adaptador via DokAST

Os dois finalistas aceitam mdast pronto e devolvem mdast. No MDXEditor isso é `importMdastTreeToLexical` / `exportLexicalTreeToMdast`. No Plate é `mdastToSlate` / `convertNodesSerialize`.

O adaptador de cada editor passa a ser `parseDok` → árvore da biblioteca → mdast → `serializeDok`. O parser Markdown da biblioteca nunca entra no caminho de persistência. Isso elimina de uma vez os riscos de parser encontrados nas fichas:

- text directives do `directivesPlugin`;
- `mdxJsx` ligado por padrão no MDXEditor;
- `htmlToJsx` e `remark-mdx` do Plate;
- `micromark-extension-directive` 3 no MDXEditor contra 4 no DokMD.

A proposta cumpre a restrição do ADR 002: "nenhuma camada parseia Markdown por conta própria no caminho de persistência".

Os riscos de conversão de árvore continuam e o spike os mede: underline gravado como JSX e rótulo `[..]` perdido no MDXEditor, nó sem regra descartado em silêncio no Plate.

## Pacotes

Versões e licenças conferidas no registro npm em 2026-09-19 (`npm view <pacote> version license`).

| Grupo | Pacote | Versão | Licença |
| --- | --- | --- | --- |
| content-format (porte) | as 14 dependências de `adrs/ADR-002-anexos/harness/package.json`, mesmas versões fixas | idênticas | MIT/ISC |
| App | `react`, `react-dom`, `@types/react`, `@types/react-dom` | 19.3.0 | MIT |
| App | `@tanstack/react-start` / `@tanstack/react-router` | 1.168.56 / 1.170.38 | MIT |
| App | `vite` / `@vitejs/plugin-react` | 8.3.0 / 6.1.1 | MIT |
| App | `typescript` | 7.0.2 | Apache-2.0 |
| MDXEditor | `@mdxeditor/editor` | 4.2.5 | MIT (transitiva `argparse` Python-2.0) |
| Plate | `platejs` | 53.3.14 | MIT |
| Plate | `@platejs/markdown` | 53.3.12 | MIT |
| Plate | `@platejs/basic-nodes` / `list` / `table` / `link` / `code-block` / `footnote` | 53.0.0 / 53.3.13 / 53.0.9 / 53.3.5 / 53.0.0 / 53.0.0 | MIT |
| Modo fonte | `@codemirror/state` / `view` / `commands` / `language` / `lang-markdown` / `lint` / `merge` | 6.7.5 / 6.43.12 / 6.11.1 / 6.12.4 / 6.5.2 / 6.9.7 / 6.12.2 | MIT |
| Diff (E-10/E-11) | `diff` / `@types/diff` | 9.0.0 / 8.0.0 | BSD-3-Clause / MIT |
| Testes | `vitest` | 5.0.1 | MIT |
| Testes | `@playwright/test` | 1.63.0 | Apache-2.0 |

Fora da lista:

- `remark-gfm`: desnecessário com o adaptador via DokAST.
- `importDialect` real: o spike usa stub (D-2).
- `@platejs/suggestion`: modo sugestão fora da v1 (D-7).
- Tailwind: o teste 6 usa só custom properties em `.theme-dark` e `.theme-light`.

## Decisões pendentes

1. **Adaptador via DokAST nos dois editores.** Recomendação: sim. A alternativa, cada editor com o próprio parser configurado só para bloco, mede o uso "como vem", mas deixa três parsers no caminho de persistência.
2. **`argparse` Python-2.0.** Entra via `js-yaml` no MDXEditor e só o `frontmatterPlugin` o importa. O spike não usa esse plugin, porque o frontmatter fica fora do editor. A licença é permissiva e aprovada pela OSI, mas não consta da lista do `BASE.md`. Recomendação: aceitar com nota no ADR.
3. **Binários de ferramenta.** Vite 8 (rolldown), TypeScript 7 e esbuild instalam binários pré-compilados por plataforma via `optionalDependencies`, e o esbuild tem `postinstall` de validação. Vale só para o spike descartável, e o app Lovable já usa Vite. A instalação usa `--ignore-scripts` onde for possível.
4. **Navegador do Playwright.** Os testes de UI e de hidratação precisam do Chromium. O cache local tem `chromium_headless_shell`, mas a 1.63 pode exigir outra revisão. Nesse caso `npx playwright install chromium` baixa o binário para `~/Library/Caches`, fora do projeto.

Depois da aprovação: porte do harness e gate de 30/30, antes de disparar os dois subagentes de editor.
