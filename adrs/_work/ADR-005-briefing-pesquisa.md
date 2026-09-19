# Briefing comum da pesquisa de candidatas — ADR 005 (Edição)

Data da pesquisa: 2026-09-19. Raiz do repositório: `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation`.

## Contexto mínimo

DokDraw é uma wiki técnica. O editor de páginas precisa produzir exatamente **DokMD v1**: CommonMark + GFM (tabelas, tarefas, riscado, notas de rodapé, autolink) + frontmatter YAML + **generic directives só de bloco** (leaf `::nome{attrs}` e container `:::nome[rótulo]{attrs}` … `:::`). Text directives (`:nome`) são proibidas: `Hora:agora` precisa continuar texto. HTML, JSX/MDX e atributos fora do registro são proibidos no conteúdo.

A AST oficial é **mdast** (`@types/mdast` 4), produzida com `mdast-util-from-markdown` 2 + `micromark-extension-directive` 4 / `mdast-util-directive` 3 (configurados só para bloco), `micromark-extension-gfm` 3, `micromark-extension-frontmatter` 2. Todo save passa por `normalizeDok` + `validateDok` no servidor. O editor precisa preservar significado, não bytes.

Registro de diretivas v1 (ADR 002, A.3):

| Tipo | Nome | Atributos | Rótulo | Filhos |
| --- | --- | --- | --- | --- |
| container | `note`, `tip`, `caution`, `danger` | `variant`, `fold` | opcional | qualquer bloco |
| container | `tabs` | `sync` | não | só `tab` |
| container | `tab` | — | obrigatório | qualquer bloco |
| container | `steps` | — | não | uma lista ordenada |
| leaf | `diagram` | `src`, `view`, `rev`, `title` | recomendado | — |

Referências por URI: `dok:page/<uuid>[#slug]`, `dok:page/new?title=<pct>`, `dok:asset/<uuid>`, `dok:diagram/<uuid>?view=<uuid>`. Exemplo de embed: `::diagram[Descrição]{src="dok:diagram/<uuid>" view="<uuid>" title="…"}`.

Fixtures de referência (só leitura, podem ser consultadas para exemplos): `adrs/ADR-002-anexos/fixtures/NN-*/input.md|expected.md`.

Arquitetura base (candidata que conflita é eliminada): TanStack Start (SSR) + React 19 + Vite + TypeScript strict; shadcn/Radix; Tailwind v4 sem PostCSS; cores só por token CSS com temas `.theme-dark`/`.theme-light`; `prefers-reduced-motion`; instalação só pelo registro npm, **sem build nativo nem postinstall que baixa binário**; conteúdo de usuário nunca é compilado nem avaliado como código.

## Critérios a notar (grade N Nativo · P Plugin oficial · C Código próprio, estimar dias · X Contra a arquitetura · ? Verificar em spike)

Eliminatórios:
- E-01 Round-trip: carregar Markdown DokMD, inserir e apagar um caractere, serializar; após `normalizeDok`, igual ao original nas fixtures.
- E-02 No modo fonte, `<Tabs>` e `<script>` não viram nó (o save retorna erro); `Hora:agora` num parágrafo não cria diretiva.
- E-03 Inserir diagrama pela UI gera exatamente `::diagram[…]{src=… view=… title=…}` (fixture 23).
- E-04 Nenhum caminho avalia conteúdo como código (sem eval, sem compilar MDX).
- E-05 Licença permissiva, incluindo transitivas necessárias.
- E-06 Produz/consome mdast compatível com a DokAST, ou converte sem perda.
- E-07 Rota do editor carregável sob demanda (lazy) no TanStack Start, sem erro de hidratação.

Importantes:
- E-10 Diff textual contra a revisão publicada.
- E-11 Diff renderizado contra a revisão publicada.
- E-12 Comentário ancorado por faixa de linhas do DokMD canônico.
- E-13 Modo somente leitura e indicador de revisão em `changes_requested`.

Nota: E-10, E-11 e E-12 serão implementados fora do editor (diff de texto e visão de leitura próprios). Na ficha, registre só o que a biblioteca oferece nativamente, sem esforço de pesquisa grande. E-13 importa: modo read-only real (não só CSS) e como exibir um banner/indicador.

## Perguntas obrigatórias (além dos E-xx)

- Q-A Dá para desligar text directives e aceitar só diretivas de bloco? (onde a sintaxe é registrada; se aceita extensão micromark própria)
- Q-B Dá para interceptar o evento de colar, entregar o texto cru a uma função externa e inserir uma árvore (mdast) pronta?
- Q-C Dá para registrar um nó customizado sem o nome da diretiva ficar preso à biblioteca (definição do nó independente do editor, adaptador fino)?
- Q-D Como a alternância WYSIWYG ↔ fonte reconstrói a árvore? (re-parse completo? perde estado? descarta nós desconhecidos?)
- Q-E Compatível com React 19? Funciona só-cliente com `React.lazy`/rota lazy no TanStack Start? Peso gzipped do que a rota de edição carrega (fonte: bundlephobia, pkg-size.dev ou medição publicada; sem fonte → "?").
- Q-F Modo sugestão (track changes): suporte nativo ou por plugin? Só registrar, com evidência.

## Regras de evidência e licença

- Versão estável e licença conferidas hoje no registro npm (`npm view <pacote> version license dependencies` é permitido) ou na página npm/GitHub, com link.
- Licenças: MIT/Apache-2.0/BSD/ISC passam. MPL-2.0 exige nota. GPL, AGPL, BSL, SSPL eliminam. Recursos pagos/"Pro"/licença comercial: registrar explicitamente quais funções exigidas dependem deles.
- Auditar as dependências diretas e transitivas relevantes (as que a função exigida precisa). Pode usar `npm view` recursivo; não instalar.
- **README não é evidência.** Aceito: documentação oficial com link, exemplo funcionando (link), código-fonte (link para arquivo/linha no GitHub na tag da versão), changelog/issue oficial.
- Toda nota N/P/C/X/? tem link ou trecho de código. Sem evidência → "?" e vira item do spike. Nenhuma resposta plausível sem fonte.
- Lacuna declarada, nunca coberta por prosa.

## Proibições

- Não escrever fora de `adrs/_work/`. Não instalar pacotes (`npm install` proibido). Não decidir qual editor vence. Não editar ADR, LEDGER, `insumos/` nem `prompts/`.

## Formato da ficha

```md
# Ficha — <candidata>

Verificado em: 2026-09-19

## Identificação
- Pacote(s), versão estável, data de publicação, link npm, link repositório
- Base (Lexical/Slate/ProseMirror/…), pipeline Markdown (mdast/remark/marked/…)
- Lançamentos desde 2026-09-18 (major/minor relevantes), com link

## Licença
| Pacote | Versão | Licença | Fonte |
Notas: transitivas relevantes, recursos pagos.

## Critérios
| Critério | Nota | Evidência (link ou trecho) | Dias se C | Observação |
(E-01 … E-07, E-10 … E-13)

## Perguntas obrigatórias
### Q-A … Q-F
Resposta, nota, evidência.

## Riscos conhecidos
(resposta com evidência ao risco listado no prompt da candidata)

## Itens para o spike
Lista do que ficou "?".

## Não verificado
Lista explícita.
```
