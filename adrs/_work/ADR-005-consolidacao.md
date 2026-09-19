# ADR 005 — Consolidação das fichas (antes do spike)

Data: 2026-09-19. Fontes: `ADR-005-candidata-{mdxeditor,plate,milkdown,tiptap,blocknote,codemirror6}.md`.

## Correções de grade aplicadas na consolidação

- As fichas usaram X para "não existe na biblioteca" (MDXEditor: E-11, E-12, Q-F; Plate: E-10, E-12). X na grade do `BASE.md` significa "contra a arquitetura". Pelo D-4, E-10, E-11 e E-12 são implementados fora do editor. Na matriz do ADR esses critérios ficam "n/a (D-4)" para todos os candidatos. Q-F fica "não há" (MDXEditor) ou "P" (Plate), só como registro (D-7).

## Matriz consolidada (pré-spike)

| Critério | MDXEditor 4.2.5 | Plate 53.3.14 | Milkdown 7.22.1 (reserva) |
| --- | --- | --- | --- |
| E-01 round-trip | ? (C conhecidos: rótulo `[..]` 0,5; notas de rodapé 2–3; autolink 0,5) | ? (C 3–4: regras de diretiva, frontmatter fora, checagem de nó perdido) | ? |
| E-02 | ? (P para HTML com `suppressHtmlProcessing`; C 0,5 para flow-only) | P | ? |
| E-03 | C 1 | C 1 | C 1 |
| E-04 | N (ressalva: `innerHTML` no `imagePlugin`) | N | N |
| E-05 | N com nota (`argparse` Python-2.0 via `js-yaml`) | N | N (`dompurify` MPL-2.0 OR Apache-2.0) |
| E-06 | N | P | N |
| E-07 | ? (doc: sem SSR) | ? | ? |
| E-10, E-11, E-12 | n/a (D-4) | n/a (D-4) | n/a (D-4) |
| E-13 | N (read-only), P (banner) | N | N/C 0,5 |
| Q-A flow-only | C 0,5 (plugin próprio; `directivesPlugin` não pode ser carregado) | P 0,5 (plugin remark) | C 0,5 |
| Q-B colar → árvore | C 1 (`PASTE_COMMAND` + `importMdastTreeToLexical`) | P 0,5–1 (`parser` próprio; `parser: null` no nativo) | C 1 |
| Q-C nó sem nome preso | N (`testNode` sobre mdast) | C 2–3 (rules assimétricas) | C 0,5 |
| Q-D alternância | N (re-parse completo; nó desconhecido vira erro visível) | C 1 (re-parse; nó desconhecido some em silêncio) | C 1–2 |
| Q-E peso | 577,6 kB gzip pacote inteiro, sem subpath | ~263 kB gzip soma de pacotes isolados | Crepe 458 kB; kit ? |
| Q-F sugestão | não há | P (`@platejs/suggestion` MIT) | P parcial |

Tiptap 3.31.3: sem X com evidência. Sai por custo: conversor ProseMirror JSON ↔ mdast de 4 a 6 dias (E-01, E-03, E-06 = C). BlockNote 0.54.2: X em E-01 e E-06 (Markdown declarado "lossy" na documentação oficial, sem mdast). Core MPL-2.0, `@blocknote/xl-*` GPL-3.0 OR comercial.

## Achado comum que muda o desenho do spike

Os dois finalistas aceitam e devolvem mdast sem passar pelo próprio parser:

- MDXEditor: `importMdastTreeToLexical` e `exportLexicalTreeToMdast` exportados.
- Plate: `mdastToSlate` e `convertNodesSerialize` exportados.

Com isso o adaptador pode ser: `parseDok` → árvore da biblioteca → mdast → `serializeDok`. A sintaxe mora só em `src/content-format`, e os riscos de parser de cada biblioteca (text directives do `directivesPlugin`, `mdxJsx` padrão do MDXEditor, `htmlToJsx` e `remark-mdx` do Plate, `micromark-extension-directive` 3 vs 4) deixam de estar no caminho de persistência. Cumpre a restrição do 002: "nenhuma camada parseia Markdown por conta própria no caminho de persistência". Pendente de aprovação na parada 3.

## Contradições entre fichas

- Peso: nenhuma ficha mediu a rota. MDXEditor 577,6 kB é o pacote inteiro; Plate 263 kB é soma de pacotes isolados. Não comparáveis. Medição real no spike.
- MDXEditor Q-D "N" e Plate Q-D "C": a diferença real é o tratamento de nó desconhecido (erro visível × descarte silencioso). Com D-1 (validar antes de voltar ao WYSIWYG) o descarte silencioso do Plate fica contido, mas a asserção "nenhum nó sem regra" vira teste do spike.
- MDXEditor modo fonte: já é CM6, com tema `basicLight` fixo e `EditorView` não exposto. D-5 mantém CM6 externo como referência; o nativo só substitui se passar nos testes 1, 3 e na alternância.

## Riscos por candidato que o spike precisa medir

MDXEditor: `<u>`/`<sup>`/`<sub>`/`<span style>` gravados como JSX pelo `LexicalTextVisitor`; rótulo `[..]` perdido pelo `AdmonitionDirectiveDescriptor`; notas de rodapé sem suporte (issue #194); parágrafo vazio acrescentado no fim; `innerHTML` no `imagePlugin`; hidratação.

Plate: nó sem regra some nas duas direções; sem regra para `yaml`; regras nativas de `callout`/`comment`/`suggestion` emitem MDX (`null` desliga?); precedência do parser próprio sobre o HTML do core ao colar; seleção e histórico após `replaceNodes`; hidratação.
