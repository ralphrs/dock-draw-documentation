# ADR 002 — Formato de conteúdo (DokMD v1)

| Campo       | Valor                                                                                                                                                                              |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | **Proposto** — vira Aceito quando o spike S-1 (editores) passar                                                                                                                    |
| Data        | 2026-09-18                                                                                                                                                                         |
| Camada      | Formato de conteúdo (dialeto de escrita/armazenamento + AST)                                                                                                                       |
| Depende de  | Arquitetura base; ADR 001 (motor de diagrama)                                                                                                                                      |
| Decide      | Dialeto canônico, dialetos aceitos na entrada, AST oficial, esquema de URIs internas, schema do frontmatter, regras de round-trip, política de segurança do formato, versionamento |
| Não decide  | Editor (ADR 005), fluxo editorial e diff (ADR 004), renderização e navegação (ADR 007), busca (ADR 009), exportação e sync com Drive (ADR 010), tabelas de persistência (ADR de persistência) |
| Substitui   | Rascunho `adr-002-biblioteca-wiki.md` ("Bibliotecas da Wiki") como ADR 002. A avaliação de editores dele vira entrada do ADR 005; leitura e navegação, do ADR 007. Reconciliação na seção 2.1 |
| Reversível? | Pouco. Mudar o dialeto canônico exige migrar o conteúdo de todos os inquilinos                                                                                                     |

## 1. Decisão

**As páginas são escritas e armazenadas em DokMD v1: CommonMark + GFM + frontmatter YAML + generic directives apenas de bloco (leaf `::` e container `:::`), com um conjunto fechado de diretivas registradas. A AST oficial é mdast. Links, imagens, anexos e diagramas são referenciados por URI `dok:` com id estável. MDX/JSX, wikilinks, callouts GFM/Obsidian e a sintaxe antiga `[[diagram:Título]]` são aceitos só na entrada (import/colar) e convertidos; nunca são armazenados.**

Em uma página, isso fica assim:

```md
---
dok: 1
id: 0192f0a1-5c3e-7a10-8b2c-3d4e5f607182
title: Contexto do domínio de pagamentos
tags:
  - arquitetura
aliases:
  - Pagamentos C4
---

:::note[Antes de começar]
Leia a [visão geral](dok:page/0192f0a1-5c3e-7a10-8b2c-3d4e5f607183#contexto).
:::

::diagram[Pessoa usa o Checkout, que chama o Gateway]{src="dok:diagram/0192f0a1-6d4f-7b20-9c3d-4e5f60718293" view="0192f0a1-6d4f-7b20-9c3d-4e5f60718294" title="Contexto do Pagamento"}

![Implantação](dok:asset/0192f0a1-7e50-7c30-8d4e-5f6071829304 "Legenda")
```

Por quê, em uma linha cada:

- **Directives como sintaxe de componente canônica**, não JSX: não há linguagem de expressão (`{}` e `<` voltam a ser texto comum), o callout canônico `:::note` é o mesmo do Starlight, e um editor do grupo candidato (MDXEditor) lê e escreve directives nativamente sobre a mesma mdast.
- **Só de bloco**: com text directives ligadas, `Hora:agora` e `dok:page/…` em prosa viram nós de diretiva e o serializer passa a escapar `:` até dentro de URLs (`dok\:page/…`). Achado do spike, reproduzido nas fixtures 10, 12 e 13.
- **Referência por id em URI `dok:`**: renomear página ou diagrama não quebra nada; o título é só rótulo. Cumpre a restrição do ADR 001.
- **Texto canônico como fonte de verdade, AST derivada**: o diff do fluxo editorial é diff de texto, a exportação parte de um arquivo que já é Markdown, e o armazenamento não fica acoplado ao formato interno de uma biblioteca.
- **Normalização no servidor a cada save**: o que for gravado é sempre `serialize(parse(x))`, então nenhum editor precisa acertar o byte a byte; precisa só não perder significado.

> [!IMPORTANT]
> Esta decisão **substitui** a sintaxe `[[diagram:Título]]` usada hoje na Wiki e citada nas instruções do Projeto. Ela colide com o wikilink do Obsidian (vira link para uma nota chamada "diagram:Título") e quebra quando o diagrama é renomeado. A migração está na fatia F5 e na fixture 25.

## 2. Contexto e entradas recebidas

Do LEDGER.md:

- **ADR 001 (Aceito)** — motor de diagrama `@xyflow/react`; diagramas e views vivem em tabelas Supabase.
  - Restrição: diagramas são referenciados por **id estável, nunca por título**.
  - Restrição: o registry de formas é independente do motor (não afeta este ADR).
  - Premissa para cá: a renderização consegue exibir uma **view** de diagrama em modo leitura dentro de uma página. Este ADR entrega o contrato de embed que torna isso endereçável (`src` + `view` + `rev` opcional).
- **Conflitos em aberto**: nenhum registrado até aqui.

Da arquitetura base, as que mais pesam neste ADR: conteúdo de usuário nunca é compilado nem avaliado; instalação só pelo npm, sem postinstall; cores só por token (logo, o conteúdo não pode carregar estilo); multi-inquilino no Supabase.

Do produto: a Wiki é o produto principal; o editor completo é o fator de maior peso na escolha de bibliotecas; o conteúdo precisa virar segundo cérebro (wikilinks, aliases, backlinks, compatível com Obsidian) e ser exportável para `.md`, vault Obsidian, projeto Starlight e `.docx`; o Google Drive é só espelho.

Fato novo desde a última pesquisa, relevante para o destino Starlight: o Astro 7 tornou o Sätteri (processador Markdown/MDX em Rust) o padrão, no lugar do pipeline unified/remark/rehype ([release astro@7.0.0-beta.4](https://github.com/withastro/astro/releases/tag/astro%407.0.0-beta.4)). O Sätteri **continua baseado em mdast/hast** e usa um modelo próprio de plugins, não os plugins do remark ([guia de Markdown do Astro](https://docs.astro.build/en/guides/markdown-content/)). A sintaxe `:::note` do Starlight segue válida em Markdown e MDX ([Authoring Content](https://starlight.astro.build/guides/authoring-content/)). Consequência: escolher mdast como AST continua alinhado com o destino, mas o export para Starlight **não pode depender de plugin remark** no projeto gerado; ele precisa emitir sintaxe que o Starlight entende sem plugin.

### 2.1 Rascunho anterior (`adr-002-biblioteca-wiki.md`)

O rascunho decidia bibliotecas (editor MDXEditor ou Plate, renderer próprio sobre `unified`, navegação própria) e deixava o formato canônico para outro ADR, indicando "directives **e** subconjunto de MDX sem expressões". Este ADR é esse outro ADR. Onde ele diverge do rascunho, a divergência é deliberada:

| Ponto do rascunho | Situação aqui | Efeito no ADR 005/007 |
| :---------------- | :------------ | :-------------------- |
| Componentes como **JSX canônico** (`<Tabs>`, `<Card>`, `<Steps>` com formulário de props; `mdxJsxFlowElement` resolvido num registry) | **Mudança.** Componentes são directives; JSX só entra pelo importador. Motivos na seção 5.2 (candidata C) | O critério E-03 do rascunho passa a ser "componentes como diretivas, com formulário de **atributos**". MDXEditor mantém N (o `DirectiveDescriptor` tem editor de atributos). **Plate cai de P para C**: a vantagem dele era serializar elementos customizados como MDX |
| E-01 / teste 1 do S1: `out === in` em ≥ 28 de 30 fixtures | **Mudança.** O critério certo é `normalizeDok(saída do editor) === expected.md` em **30 de 30**. `out === in` falha por normalização legítima (fixtures 04–08), e perder significado em 2 de 30 páginas não é tolerável num formato | Reescrever o teste 1 do S1 |
| Teste 3 do S1: `{alert(1)}` no modo fonte é recusado ou escapado | **Ajuste.** `{…}` é texto comum no DokMD e nunca é avaliado; o teste passa a ser digitar `<Tabs>` ou `<script>` no modo fonte e receber DOK-E002 no save | Reescrever o teste 3 |
| Teste 4 do S1: diagrama "serializa como a sintaxe definida no ADR de formato" | Atendido: `::diagram[..]{src view title}` | Usar as fixtures 23–25 |
| `<Card>` citado como componente-alvo | Não entra na v1; `card` e `cardgrid` estão reservados. Adicionar um nome ao registro não exige versão nova (A.8) | Nenhum para o S1 |
| Leitura sobre `unified`/`remark` | Compatível. O parser canônico usa `mdast-util-from-markdown` com as extensões deste ADR; o renderer pode usar `unified` por cima, desde que passe essas mesmas extensões ou consuma a DokAST pronta | ADR 007 não parseia por conta própria |
| Wikilinks e backlinks calculáveis a partir do AST (L-04) | Atendido de outro jeito: wikilink não é armazenado; backlinks saem de `collectRefs` | — |
| F0: `install`, `build` e `tsc` passando no Lovable como pré-condição | Adotado como dependência da fatia F1 | — |
| Finalistas do spike: **MDXEditor × Plate** | Adotado: S-1 usa os mesmos dois (antes eu tinha proposto MDXEditor × Milkdown) | Um único spike serve aos dois ADRs |

## 3. Critérios

### Eliminatórios

| ID   | Critério                                                                   | Por que, neste projeto                                                                                                           | Como verificar                                                                                                                             |
| :--- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| F-01 | Não exige avaliação de código para renderizar                              | Regra de segurança da base; conteúdo multi-inquilino                                                                             | Ler a gramática: existe construção cuja semântica depende de executar JS? Conferir no parser se há `acorn`/`eval` no caminho de render     |
| F-02 | Round-trip determinístico: `serialize(parse(x))` estável em fixtures       | Sem isso, cada save gera diff fantasma e o fluxo editorial vira ruído                                                            | Harness executável: ponto fixo `N(N(x)) = N(x)` e `N(input) = expected` byte a byte nas fixtures                                           |
| F-03 | Traduzível sem perda de significado para Starlight, Obsidian, GFM e .docx | Exportação é requisito de produto                                                                                                | Matriz construção × destino (Apêndice B) sem célula "sem tradução"                                                                         |
| F-04 | AST com ecossistema maduro e licença permissiva                            | Todas as camadas seguintes consomem a AST                                                                                        | Pacotes publicados e mantidos, licenças auditadas incluindo transitivas                                                                    |
| B-01 | Compatível com a arquitetura base                                          | Regra 1 de compatibilidade                                                                                                       | Checagem item a item (seção 7)                                                                                                             |
| B-02 | Compatível com contratos do LEDGER                                         | Regra 2                                                                                                                          | Diagrama por id, nunca por título                                                                                                          |
| B-03 | Editável por ≥ 2 candidatas a editor do ADR 005                            | Regra 3; o editor é o fator de maior peso do produto                                                                             | Seção 7.3: como cada editor representa callout, componente, link interno e diagrama; confirmar no spike S-1                              |

### Importantes (com peso)

| ID  | Critério                                            | Peso | Por que, neste projeto                                                           | Como verificar                                                                  |
| :-- | :-------------------------------------------------- | ---: | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| I-1 | Suporte nos editores candidatos                     |    5 | Editor completo é o fator de maior peso                                          | Documentação/exemplos oficiais de cada editor para a sintaxe                    |
| I-2 | Fidelidade ao Starlight                             |    3 | Dialeto de referência da Wiki e destino de export                                | Construção existe no Starlight sem plugin?                                      |
| I-3 | Legibilidade como texto puro e no Obsidian          |    3 | Segundo cérebro; export para vault; `.md` universal                              | Abrir a construção crua no GitHub/Obsidian: dá para entender?                   |
| I-4 | Segurança por construção                            |    3 | Multi-inquilino; nada avaliado                                                   | O parser canônico sequer reconhece expressões/HTML?                             |
| I-5 | Diff legível                                        |    2 | Fluxo editorial (ADR 004)                                                        | Uma edição local produz diff local? Ordem de atributos/chaves é fixa?           |
| I-6 | Extensível sem mudar a gramática                    |    2 | Novos componentes (cards, badges, include) virão                                 | Componente novo = registro de nome, não sintaxe nova                            |
| I-7 | Custo de implementação                              |    2 | Time pequeno, Lovable                                                            | Dias estimados das fatias                                                       |

### Desejáveis

| ID  | Critério                                   | Peso | Como verificar                                        |
| :-- | :----------------------------------------- | ---: | :---------------------------------------------------- |
| D-1 | Confortável de escrever à mão              |    1 | Escrever as fixtures sem consultar a spec             |
| D-2 | Portável para outras plataformas de docs  |    1 | Docusaurus, VitePress, MkDocs entendem a construção?  |

## 4. Candidatas

Versões conferidas em 2026-09-18 no registro npm (links para a página do pacote).

| ID | Candidata                                                             | Peças principais (versão, licença)                                                                                                                                                                                                                                                                                                                                                           |
| :- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A  | CommonMark + GFM puro, com convenções (alerts, imagem como embed)     | [mdast-util-from-markdown 2.0.3](https://www.npmjs.com/package/mdast-util-from-markdown) MIT · [mdast-util-gfm 3.1.0](https://www.npmjs.com/package/mdast-util-gfm) MIT                                                                                                                                                                                                                         |
| B  | **CommonMark + GFM + directives de bloco + dialetos aceitos na entrada** | A + [micromark-extension-directive 4.0.0](https://www.npmjs.com/package/micromark-extension-directive) MIT · [mdast-util-directive 3.1.0](https://www.npmjs.com/package/mdast-util-directive) MIT · [mdast-util-frontmatter 2.0.1](https://www.npmjs.com/package/mdast-util-frontmatter) MIT                                                                                                  |
| C  | Subconjunto de MDX (JSX sem expressões, sem import/export)            | A + [micromark-extension-mdx-jsx 3.0.2](https://www.npmjs.com/package/micromark-extension-mdx-jsx) MIT · [mdast-util-mdx-jsx 3.2.0](https://www.npmjs.com/package/mdast-util-mdx-jsx) MIT                                                                                                                                                                                                     |
| D  | MDX completo                                                          | [@mdx-js/mdx 3.1.1](https://www.npmjs.com/package/@mdx-js/mdx) MIT                                                                                                                                                                                                                                                                                                                                |
| E  | Markdoc                                                               | [@markdoc/markdoc 0.5.10](https://www.npmjs.com/package/@markdoc/markdoc) MIT · [@astrojs/markdoc 2.0.9](https://www.npmjs.com/package/@astrojs/markdoc) MIT (integração com o Starlight documentada como experimental)                                                                                                                                                                         |
| F  | Obsidian Flavored Markdown como canônico                              | [remark-wiki-link 2.0.1](https://www.npmjs.com/package/remark-wiki-link) MIT (ou [@flowershow/remark-wiki-link 4.0.0](https://www.npmjs.com/package/@flowershow/remark-wiki-link) MIT)                                                                                                                                                                                                         |
| G  | MyST Markdown (pesquisada)                                            | [myst-parser 1.7.3](https://www.npmjs.com/package/myst-parser) MIT                                                                                                                                                                                                                                                                                                                                |
| H  | Djot (pesquisada)                                                     | [@djot/djot 0.3.2](https://www.npmjs.com/package/@djot/djot) MIT, última publicação em 2024-12                                                                                                                                                                                                                                                                                                  |

## 5. Avaliação

### 5.1 Eliminatórios

| Requisito                            | A  | B  | C  | D  | E  | F  | G  | H  |
| :----------------------------------- | :- | :- | :- | :- | :- | :- | :- | :- |
| F-01 sem avaliação de código         | N  | N  | C¹ | X  | N  | N  | N  | N  |
| F-02 round-trip determinístico       | N  | N² | ?  | —  | ?  | C  | ?  | ?  |
| F-03 traduzível p/ os 4 destinos     | C  | C  | C  | —  | C  | C  | C  | C  |
| F-04 AST madura, licença permissiva  | N  | N  | N  | —  | N³ | N  | N⁴ | X  |
| B-02 diagrama por id (ADR 001)       | C  | N  | N  | —  | N  | X  | N  | —  |
| B-03 ≥ 2 editores                    | N  | C⁵ | C⁵ | —  | X⁶ | C  | X⁶ | —  |

1. O parser JSX reconhece `{…}` em atributos e filhos; é preciso recusar cada caso no validador. Não é avaliação, mas é superfície de ataque que B não tem.
2. Verificado: 30/30 fixtures (seção 8).
3. AST própria do Markdoc, não mdast; todas as camadas precisariam de conversor.
4. MyST usa uma AST derivada de mdast, mas o ecossistema de editor é inexistente.
5. Detalhe por editor na seção 7.3.
6. Nenhuma das quatro candidatas a editor tem suporte, nem exemplo; seria C alto em todas. Com zero editores com caminho documentado, conto como X no requisito "editável por ≥ 2".

Eliminadas: **D** (F-01 e a regra de segurança da base: MDX completo é compilado para JS e executado), **F** (B-02: wikilink e embed do Obsidian são por nome de arquivo/título; seria contornar o ADR 001 em silêncio), **H** (F-04: ecossistema imaturo e parado), **E** e **G** (B-03: nenhum editor candidato).

### 5.2 Ponderação das sobreviventes (0–3 por critério)

| Critério (peso)              | A (GFM puro) | **B (directives)** | C (MDX subset) |
| :--------------------------- | -----------: | -----------------: | -------------: |
| I-1 Editores (5)             |            2 |                  3 |              3 |
| I-2 Starlight (3)            |            1 |                  2 |              3 |
| I-3 Texto puro/Obsidian (3)  |            3 |                  2 |              1 |
| I-4 Segurança (3)            |            3 |                  3 |              2 |
| I-5 Diff (2)                 |            3 |                  3 |              2 |
| I-6 Extensível (2)           |            0 |                  3 |              3 |
| I-7 Custo (2)                |            3 |                  2 |              2 |
| D-1 Escrita à mão (1)        |            3 |                  2 |              1 |
| D-2 Portabilidade (1)        |            2 |                  3 |              1 |
| **Total (máx. 66)**          |       **48** |             **57** |         **49** |

Leitura da tabela:

- **A** perde em extensibilidade: sem atributos não há como expressar abas, `view` de diagrama ou revisão fixada sem inventar convenções dentro de links/imagens, que são exatamente o tipo de sintaxe implícita que quebra no round-trip.
- **C** empata em editores (MDXEditor e Plate têm JSX nativo) e ganha no Starlight, mas perde em texto puro: `<Tabs>` cru no Obsidian e no GitHub é ruído, e todo `<` e `{` na prosa passa a precisar de escape. É a segunda colocada e a saída de emergência se o spike S-1 falhar (seção 8).
- **B** ganha porque o callout canônico já é o do Starlight, degrada para texto legível, e a extensão futura é só registrar um nome novo.

## 6. Especificação resumida do dialeto

A especificação completa, com gramática e exemplos de cada construção, está no **Apêndice A**. Resumo das respostas às 11 perguntas do prompt:

| #  | Pergunta              | Resposta                                                                                                                                                                                                                                                                                         |
| :- | :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Dialeto base          | CommonMark 0.31 + GFM (tabela, riscado, tarefas, notas de rodapé, autolink literal) + frontmatter YAML + generic directives **só de bloco**. Sem HTML, sem MDX, sem Markdoc                                                                                                                         |
| 2  | Sintaxe de componente | Directive é a canônica. JSX é aceito só no import de `.mdx` do Starlight, por allowlist (`Aside`, `Tabs`, `TabItem`, `Steps`), e convertido                                                                                                                                                      |
| 3  | Callouts              | `:::note`, `:::tip`, `:::caution`, `:::danger`, título em `[..]`. `> [!NOTE]` (GitHub) e `> [!tipo]` (Obsidian) são convertidos na entrada; o tipo original fica em `variant` para o export de volta ser idêntico                                                                                  |
| 4  | Links internos        | Link Markdown comum com URI `dok:page/<uuid>[#slug]`. Texto vazio = "título vivo" (o renderer mostra o título atual). Wikilink `[[..]]` é só gesto de entrada no editor e sintaxe de import                                                                                                        |
| 5  | Embed de diagrama     | Leaf directive `::diagram[descrição]{src="dok:diagram/<uuid>" view="<uuid>" title="…"}`, `rev` opcional. `title` é legenda editorial (não é chave); a descrição em `[..]` é o fallback de texto e o alt                                                                                            |
| 6  | Imagens e anexos      | `![alt](dok:asset/<uuid> "legenda")` e `[nome.pdf](dok:asset/<uuid>)`. Imagem externa `https` permitida com aviso                                                                                                                                                                                  |
| 7  | Frontmatter           | Obrigatórios `dok`, `id`, `title`; opcionais `description`, `tags`, `aliases`, `props`. **Sem datas, slug, status ou hierarquia**: isso é do banco                                                                                                                                                 |
| 8  | AST                   | mdast (`@types/mdast` 4) + mdast-util-gfm + mdast-util-directive + mdast-util-frontmatter. mdast-util-mdx-jsx **só no importador**                                                                                                                                                                 |
| 9  | Round-trip            | Pode mudar: marcadores, escapes, indentação, espaços, padding de tabela, ordem de chaves/atributos (para a canônica), referência→inline, setext→ATX. Nunca: texto, estrutura, URLs, atributos, código, valores do frontmatter                                                                        |
| 10 | Segurança             | HTML cru e JSX na forma canônica = erro de save. `{…}`, `import`, `export` não existem no parser canônico (são texto). Esquemas `javascript:`, `data:`, `vbscript:`, `file:` = erro. Nada de `class`/`style`                                                                                          |
| 11 | Versionamento         | `dok: 1` no frontmatter. Qualquer sintaxe nova (mesmo "aditiva") incrementa a versão, com migração pura e testada por fixtures                                                                                                                                                                     |

### 6.1 Por que datas não moram no frontmatter

O prompt pede avaliar datas. A decisão é deixá-las fora do conteúdo canônico: `updated` mudaria em todo save e sujaria todo diff do ADR 004; e o banco já é a fonte de verdade de quando algo mudou. Datas, autor e status editorial são **injetados no export** (Obsidian `created`/`updated`, Starlight `lastUpdated`), conforme a matriz do Apêndice B.

### 6.2 Por que `src="dok:diagram/…"` e não `id="…"`

No spike, `mdast-util-directive` serializa o atributo `id` com o atalho `#valor` (`::diagram{#0192…}`). É estável, mas ilegível, e o atalho `{#x}` escrito à mão vira `id` sem que o autor perceba. Usar `src` com a mesma URI `dok:` dos links deixa um único código de reescrita de URIs para todas as camadas.

## 7. Verificação de compatibilidade

### 7.1 Para trás — arquitetura base

| Contrato ou restrição                                   | Situação   | Evidência                                                                                                                                                             |
| :------------------------------------------------------ | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TanStack Start + React 19 + Vite + TS strict            | Compatível | Pacotes ESM puros, rodam em server function e no cliente; tipos em `@types/mdast` 4.0.4                                                                                 |
| shadcn/Radix, Tailwind v4, tokens CSS, dark/light       | Compatível | O formato não carrega estilo: `class`, `style`, `{.x}` e HTML são recusados (DOK-E002/E004), então nenhuma página consegue burlar a regra de tokens                      |
| Supabase multi-inquilino                                | Compatível | Texto canônico em coluna `text`; ids são uuid; `collectRefs` alimenta tabelas de refs (desenho no ADR de persistência)                                                 |
| Lovable: só npm, sem build nativo nem postinstall       | Compatível | Instalação real das 16 dependências diretas (88 pacotes no total) com `--ignore-scripts`; nenhum pacote declara `install`/`postinstall`                                 |
| Conteúdo nunca compilado nem avaliado                   | Compatível | Parser canônico não carrega extensão MDX nem `acorn`; `{x}` e `import` são texto (fixture 10)                                                                            |
| Última versão estável, com link                         | Compatível | Seção 4 e contrato de saída                                                                                                                                            |
| Dependência nova só com justificativa                   | Compatível | Justificativa na seção 1; lista no contrato. `zod` provavelmente já está no app (TanStack/shadcn): conferir antes de adicionar                                            |
| Licenças                                                | Compatível | Auditoria transitiva da instalação real: 86 MIT, 2 ISC (`yaml`, `github-slugger`); `format` (transitiva de `fault`) declara MIT pelo campo legado `licenses`. Nada de MPL/GPL |

### 7.2 Para trás — ADRs aceitos

| Contrato                                                     | Situação   | Evidência                                                                                                                             |
| :----------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| ADR 001: diagramas por id estável, nunca por título          | Compatível | `src="dok:diagram/<uuid>"` obrigatório; `title` é legenda e não é usado para resolver (fixtures 23, 24)                                |
| ADR 001: registry de formas independente do motor            | Não afeta  | O formato referencia a view, não formas                                                                                               |
| ADR 001: modelo de diagrama em tabelas Supabase              | Compatível | O embed endereça `diagram` + `view` (+ `rev`), que precisam ser ids de linha; ver conflito C-1                                       |
| ADR 001 premissa: renderização exibe view em modo leitura    | Atendida   | Contrato do embed define exatamente qual view e qual revisão mostrar                                                                  |

### 7.3 Para frente — Edição (ADR 005)

Estimativas em dias de desenvolvimento. "Mesma AST" = o editor importa/exporta mdast e pode usar as mesmas extensões micromark deste ADR.

| Construção            | MDXEditor 4.2.5 (Lexical, mdast)                                                                                          | Plate 53.3 (Slate, remark via `@platejs/markdown`)                             | Milkdown 7.22 (ProseMirror, remark)                                      | Tiptap 3.31 (ProseMirror, `@tiptap/markdown` sobre marked)                                          |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| Callout `:::note[T]`  | **P** — `directivesPlugin` + `AdmonitionDirectiveDescriptor`; título em `[..]` pede descriptor próprio (C 0,5)              | C 1 — regra mdast↔elemento no `@platejs/markdown` + elemento callout           | C 1 — `$remark` com a extensão + `$node` com `parseMarkdown/toMarkdown`   | C 1 — `createBlockMarkdownSpec` cobre blocos `:::nome`                                               |
| Componente (abas)     | C 1–2 — `DirectiveDescriptor` com `NestedLexicalEditor`; atributos editados pelo popup nativo do descriptor               | C 2 — elemento próprio + regra de serialização para directive (o caminho MDX nativo do Plate não se aplica) | C 2                                                                      | C 2–3                                                                                               |
| Link interno `dok:`   | P — `linkPlugin` + `linkDialogPlugin` com autocomplete de páginas; título vivo exige nó de link próprio (C 1)             | P — `LinkPlugin`; título vivo C 1                                              | P — link do preset; título vivo C 1                                      | P — extensão Link; título vivo C 1                                                                  |
| Diagrama `::diagram`  | C 1–2 — leaf directive com `Editor` que mostra o preview                                                                    | C 1 — elemento void                                                            | C 1 — nó atom                                                            | C 1–2 — nó atom + tokenizer                                                                         |
| Mesma AST?            | Sim                                                                                                                       | Sim                                                                            | Sim                                                                      | **Não**: tokens do marked; sintaxe reimplementada, risco de divergência                             |
| Risco a verificar     | **?** o `directivesPlugin` registra a sintaxe completa (com text directives); é preciso trocar por flow-only via `addSyntaxExtension$` | ? `MarkdownPlugin` aceitar um plugin remark que injete as extensões flow-only (0,5)  | ? API de `$remark` na 7.22                                               | ? paridade do tokenizer com micromark nas 30 fixtures; alternativa: conversor próprio ProseMirror JSON ↔ mdast (C 3–4) |

Fontes: [Directives no MDXEditor](https://mdxeditor.dev/editor/docs/custom-directive-editors), [Admonitions no MDXEditor](https://mdxeditor.dev/editor/docs/Admonitions), [Markdown em extensões Tiptap](https://tiptap.dev/docs/editor/markdown/guides/integrate-markdown-in-your-extension), [tokenizer customizado Tiptap](https://tiptap.dev/docs/editor/markdown/advanced-usage/custom-tokenizer.md). A dependência de Plate em `remark-mdx`/`remark-parse` e de MDXEditor em `mdast-util-mdx` foi conferida no `package.json` publicado de cada um.

Conclusão: **três editores (MDXEditor, Plate, Milkdown) trabalham sobre a mesma mdast**, e o MDXEditor tem directives nativas. Custo desta decisão para o ADR 005: escolher directives em vez de JSX tira do Plate a vantagem de serializar componentes como MDX (seção 2.1); ele continua viável, com mais código próprio. A exigência de ≥ 2 está atendida no papel; o spike S-1 prova com as fixtures. Independentemente do editor escolhido, o servidor normaliza no save, então o editor precisa preservar significado, não bytes.

### 7.4 Para frente — Fluxo editorial (ADR 004)

| Premissa do ADR 004                    | Situação | Evidência                                                                                                                                                                         |
| :------------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diff legível entre revisões, em texto  | Atende   | Forma canônica é texto; ordem de chaves do frontmatter e de atributos é fixa (fixtures 01, 02, 16, 23); sem hard wrap, então editar um parágrafo não reflui os vizinhos; tags uma por linha |
| Publicação fixa o que foi aprovado     | Atende   | `rev` opcional no `::diagram` permite a página publicada apontar para a revisão aprovada do diagrama                                                                              |
| Revisões antigas em versões antigas    | Atende   | Cada revisão guarda seu `dok:`; o diff migra as duas para a versão corrente antes de comparar                                                                                     |

### 7.5 Para frente — Busca (ADR 009)

`extractText(ast)` percorre a mdast sem renderizar e devolve blocos `{ headingPath, text, kind }`. Entra: texto de parágrafos, headings, itens, células, rótulos de callout e aba, `title` e descrição de diagrama, `alt` de imagem, texto de link. Não entra: URLs, atributos técnicos (`src`, `view`, `rev`, `sync`). Código entra com `kind: "code"` para o ADR 009 decidir o peso. Atende.

### 7.6 Para frente — Exportação (ADR 010)

Toda construção tem tradução para os quatro destinos: **Apêndice B**. Nenhuma célula fica "sem tradução"; as perdas conhecidas estão marcadas (estilo de abas no GFM, recolhimento de callout fora do Obsidian).

Dois pontos que o ADR 010 precisa respeitar:

- **Starlight**: exportar `.md` por padrão e `.mdx` só quando a página tem abas ou passos. Ao emitir `.mdx`, escapar `{` e `<` do texto (a fixture 10 é o caso de teste), porque o que é texto no DokMD é sintaxe no MDX.
- **Diagramas estáticos**: todo destino precisa de SVG/PNG da view. Isso depende do motor de diagrama gerar imagem fora do canvas interativo; está registrado como conflito C-2.

## 8. Spike

### 8.1 Já executado (F-02)

Harness em `harness/` (anexo a este ADR): implementação de referência de parse, normalização e validação com as dependências exatas do contrato, rodada contra as 30 fixtures em `fixtures/`. Resultado em 2026-09-18: **30/30 aprovadas**. Para cada fixture, o harness confere:

- idempotência: `N(N(input)) === N(input)`;
- ponto fixo do esperado: `N(expected) === expected`;
- esperado válido (sem erro `DOK-E`) e com os avisos declarados;
- nas fixtures `canonical`: `N(input) === expected` byte a byte;
- nas fixtures de erro: códigos `DOK-E` exatamente iguais aos declarados.

Achados do spike que viraram regra:

1. Text directives transformam prosa comum em nós (`Hora:agora`, `dok:page/x`) e fazem o serializer escapar `:` dentro de URLs. **Regra: só directives de bloco.**
2. O atributo `id` é serializado como `#valor`. **Regra: o embed usa `src`.**
3. `> [!NOTE]` vira `> \[!NOTE]` e `[[x]]` vira `\[\[x]]` ao serializar (é por isso que o próprio prompt deste ADR chegou com `> \[!NOTE]`). **Regra: alerts e wikilinks são convertidos antes, no importador; na forma canônica, `[[` é texto.**
4. Contêineres aninhados com o mesmo número de `:` são ambíguos: `:::note` dentro de `:::tab` fecha no lugar errado. O serializer resolve sozinho (`:::::tabs` → `::::tab` → `:::note`), e o validador acusa a forma errada (DOK-E008). **Regra: o contêiner externo tem mais dois-pontos que o interno; só o serializer escreve isso.**
5. `resourceLink: true` transformaria `<https://x>` em `[https://x](https://x)`. **Regra: autolinks ficam como `<…>`.**
6. "`Subtítulo ##`" em setext é texto, e o serializer escapa para `#\#` para não virar fechamento ATX. Estável e correto.

### 8.2 Pendente: S-1 (editores), bloqueia o status Aceito

Este spike é o mesmo S1 do rascunho anterior, com os testes 1, 3 e 4 reescritos para o DokMD. Roda uma vez e serve ao ADR 002 (aceite do formato) e ao ADR 005 (escolha do editor).

| Item | Definição |
| :--- | :-------- |
| Candidatos | **MDXEditor** e **Plate** (finalistas do rascunho). Milkdown é o reserva |
| Teste 1 (substitui o round-trip 28/30) | Carregar cada `expected.md` e cada entrada `canonical`; fazer uma edição trivial (inserir e apagar um caractere); salvar via `normalizeDok`. Passa com **30/30** iguais ao `expected.md` |
| Teste 3 (substitui `{alert(1)}`) | No modo fonte, digitar `<Tabs>` e `<script>`: o save retorna DOK-E002. Digitar `Hora:agora` num parágrafo: não cria diretiva |
| Teste 4 | Inserir diagrama pela UI gera exatamente a forma das fixtures 23; a 25 migra o legado |
| Demais testes do S1 (2, 5, 6, 7, 8) | Como no rascunho; o teste 2 compara com a fixture 16 |
| Duração máxima | 3 dias (o do rascunho), depois da F0 |
| Aceite deste ADR | Pelo menos um candidato passa nos testes 1 e 3 |
| Desempate | Se só um passar, o ADR 002 é aceito e o ADR 005 escolhe esse. Se nenhum passar, repetir com Milkdown. Se o Milkdown também falhar, reabrir este ADR avaliando a candidata C (subconjunto MDX), onde MDXEditor e Plate têm JSX nativo |

## 9. Consequências

**Positivas**

- Uma AST para todas as camadas, sem conversores entre formatos internos.
- Callout canônico idêntico ao do Starlight; export para Starlight de páginas simples é quase cópia.
- Renomear página, diagrama ou asset nunca quebra link.
- Segurança por construção: o parser canônico não conhece HTML útil nem expressões.
- Backlinks, grafo e "links pendentes" do segundo cérebro saem de `collectRefs`, sem render.
- Conteúdo não carrega estilo: design system trocável continua possível.

**Negativas**

- Um arquivo DokMD cru aberto fora do DokDraw mostra URIs `dok:` que não navegam; só o export produz links navegáveis.
- `:::note` aparece como texto no GitHub e no Obsidian se alguém abrir o arquivo canônico direto; o export resolve.
- Import de conteúdo rico em HTML perde marcação (vira texto), com relatório.
- Links para heading dependem do slug do texto: renomear o heading quebra a âncora (mitigação: aviso no save; ids de heading estáveis ficam para v2).
- Dependência de uma extensão (directives) que não é padrão CommonMark.

**Reversibilidade**

- Trocar o **editor** não mexe neste ADR.
- Trocar o **dialeto canônico** exige migrar tudo, mas é mecânico: como a AST é mdast, sair de directives para JSX (candidata C) é uma transformação AST→AST de poucas regras. Custo estimado: 3–5 dias + janela de migração em lote.
- Trocar a **AST** (sair de mdast) é o caro: reescrever parser, validador, importadores, exportadores e integração de editor.

## 10. Gatilhos de reabertura

- O spike S-1 falhar em MDXEditor, Plate e Milkdown.
- O Starlight deixar de suportar `:::note` em algum processador (unified ou Sätteri).
- `micromark-extension-directive` ou `mdast-util-directive` sem release por 18 meses com bug bloqueante aberto, ou major que mude a sintaxe.
- Necessidade real de componentes inline (menção a pessoa, badge, `kbd`, fórmula inline): exige decidir text directives com sintaxe que não capture `palavra:palavra` (v2).
- Mais de 10% das páginas importadas com avisos DOK-W104 (perda na conversão).
- Pedido de transclusão (`![[nota]]`), matemática ou ids de heading estáveis: cada um é versão nova do formato.

## 11. Fatias de implementação

Em ordem de dependência. Código em `src/content-format/` (compartilhado entre server functions e cliente).

| #  | Fatia                                                                                                                         | Depende de | Estimativa | Pronto quando                                                                                                                                                  |
| :- | :---------------------------------------------------------------------------------------------------------------------------- | :--------- | ---------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F0 | Build real no app Lovable (herdada do rascunho)                                                                                | —          |          — | `install`, `build` e `tsc` passam com as dependências do contrato                                                                                              |
| F1 | Núcleo: `parseDok`, `serializeDok`, `normalizeDok` (flow-only directives, GFM, frontmatter canônico, referência→inline, ordem de atributos) | F0         |          2 | Portar `harness/dokmd.mjs` para TS strict; as 30 fixtures rodam no Vitest com os mesmos 5 checks; `tsc` limpo                                                   |
| F2 | Validação: schema Zod do frontmatter, registro de diretivas, política de URL, códigos de diagnóstico                           | F1         |          1 | Fixtures 03, 15, 22, 24, 30 retornam exatamente os códigos esperados; tipos `Diagnostic` exportados                                                            |
| F3 | URIs e referências: `parseDokUri`, `collectRefs`, `extractText`, slug de âncora (github-slugger)                               | F1         |          1 | `collectRefs` lista todos os `dok:` das fixtures 12–14, 23, 28 com posição; `extractText` passa em testes de snapshot                                          |
| F4 | Save pipeline: server function que normaliza, valida, bloqueia em `DOK-E` e devolve o texto canônico                           | F1, F2     |          1 | Salvar texto com HTML retorna erro com linha; salvar texto válido grava exatamente `normalizeDok(x)`; round-trip de uma página salva duas vezes gera diff vazio |
| F5 | Migração do legado: conteúdo atual da Wiki (onde estiver hoje) → DokMD v1, incluindo `[[diagram:Título]]`                      | F1–F4      |          2 | Toda página existente valida sem `DOK-E`; relatório lista cada `[[diagram:…]]` não resolvido (fixture 25)                                                     |
| F6 | Importadores: GFM (alerts), Obsidian (callouts, wikilinks, embeds), Starlight `.mdx` (allowlist JSX; único uso de mdast-util-mdx-jsx) | F1–F3      |          3 | Fixtures `import` (17–19, 21, 25–27, 29) produzem o `expected.md` e o relatório com os avisos declarados; importar o próprio vault exportado não duplica páginas (id no frontmatter) |

Total: 10 dias. Exportadores ficam no ADR 010, com o Apêndice B como especificação.

## 12. Fora de escopo

| Assunto                                                                     | Vai para                  |
| :-------------------------------------------------------------------------- | :------------------------ |
| Escolha do editor e da UI de inserção de wikilink/diagrama                  | ADR 005                   |
| Estados rascunho → revisão → publicação, algoritmo de diff, comentários     | ADR 004                   |
| mdast → React/hast, navegação (sidebar, TOC), proxy ou bloqueio de imagem externa, preview de diagrama | ADR 007                   |
| Indexação e ranking                                                         | ADR 009                   |
| Exportadores, geração de `.docx`, sync periódico com Google Drive           | ADR 010                   |
| Tabelas `pages`, `page_refs`, `assets`, revisões                            | ADR de persistência       |
| Matemática, transclusão, componentes inline, ids de heading estáveis        | Versões futuras do formato |

## 13. Contrato de saída

```yaml
adr: "002"
camada: "Formato de conteúdo"
status: "Proposto"
data: "2026-09-18"
decisao: "Páginas escritas e armazenadas em DokMD v1 (CommonMark + GFM + frontmatter YAML + directives só de bloco, conjunto fechado), AST mdast, referências por URI dok: com id; MDX/wikilink/alerts só na entrada."
dependencias:
  - pacote: "mdast-util-from-markdown"
    versao: "^2.0.3"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-from-markdown"
  - pacote: "mdast-util-to-markdown"
    versao: "^2.1.2"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-to-markdown"
  - pacote: "micromark-extension-gfm"
    versao: "^3.0.0"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/micromark-extension-gfm"
  - pacote: "mdast-util-gfm"
    versao: "^3.1.0"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-gfm"
  - pacote: "micromark-extension-directive"
    versao: "^4.0.0"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/micromark-extension-directive"
  - pacote: "mdast-util-directive"
    versao: "^3.1.0"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-directive"
  - pacote: "micromark-extension-frontmatter"
    versao: "^2.0.0"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/micromark-extension-frontmatter"
  - pacote: "mdast-util-frontmatter"
    versao: "^2.0.1"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-frontmatter"
  - pacote: "micromark-extension-mdx-jsx"
    versao: "^3.0.2"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/micromark-extension-mdx-jsx (só importador)"
  - pacote: "mdast-util-mdx-jsx"
    versao: "^3.2.0"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-mdx-jsx (só importador)"
  - pacote: "unist-util-visit"
    versao: "^5.1.0"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/unist-util-visit"
  - pacote: "mdast-util-to-string"
    versao: "^4.0.0"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-to-string"
  - pacote: "github-slugger"
    versao: "^2.0.0"
    licenca: "ISC"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/github-slugger"
  - pacote: "yaml"
    versao: "^2.9.1"
    licenca: "ISC"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/yaml"
  - pacote: "zod"
    versao: "^4.6.5"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/zod (provavelmente já presente no app)"
  - pacote: "@types/mdast"
    versao: "^4.0.4"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/@types/mdast (devDependency)"
interfaces_publicadas:
  - nome: "Gramática DokMD v1"
    tipo: "formato"
    descricao: "Apêndice A deste ADR; conformidade definida pelas 30 fixtures em fixtures/"
  - nome: "DokAST"
    tipo: "tipo TS"
    descricao: "mdast (@types/mdast 4) restrita aos nós listados no Apêndice A.4, com DokDirective discriminada por name e atributos tipados"
  - nome: "frontmatterSchema"
    tipo: "tipo TS"
    descricao: "Schema Zod estrito: dok, id, title obrigatórios; description, tags, aliases, props opcionais; ordem canônica de chaves"
  - nome: "URIs dok:"
    tipo: "formato"
    descricao: "dok:page/<uuid>[#slug], dok:page/new?title=<pct>, dok:asset/<uuid>, dok:diagram/<uuid>[?view=<uuid>]"
  - nome: "parseDok / serializeDok / normalizeDok / validateDok"
    tipo: "função"
    descricao: "src/content-format; normalizeDok é idempotente e é o que o save grava; validateDok devolve Diagnostic[] com códigos DOK-Exxx (bloqueiam) e DOK-Wxxx"
  - nome: "importDialect"
    tipo: "função"
    descricao: "gfm | obsidian | starlight-mdx | legacy → DokAST + relatório de conversão; nunca falha, degrada para texto"
  - nome: "collectRefs"
    tipo: "função"
    descricao: "Lista refs {kind: page|unresolved|asset|diagram, id, view?, rev?, anchor?, position} para backlinks, grafo e integridade"
  - nome: "extractText"
    tipo: "função"
    descricao: "Texto indexável por bloco, sem render (regras na seção 7.5)"
  - nome: "migrateDok"
    tipo: "função"
    descricao: "Migrações puras versão n → n+1 sobre a AST"
  - nome: "Matriz de tradução por destino"
    tipo: "formato"
    descricao: "Apêndice B; normativa para o ADR 010"
restricoes_impostas:
  - "Todo produtor e consumidor de conteúdo usa DokAST via src/content-format; nenhuma camada parseia Markdown por conta própria no caminho de persistência"
  - "A fonte de verdade gravada é o texto canônico (saída de normalizeDok); AST, HTML e índices são derivados"
  - "Nenhuma camada avalia código; MDX nunca é compilado dentro do app"
  - "Links, imagens, anexos e diagramas são referenciados por id em URI dok:; título é só rótulo"
  - "Todo save passa por normalizeDok + validateDok no servidor; qualquer DOK-E bloqueia"
  - "Directives só de bloco; nenhum componente ou editor pode fazer 'palavra:palavra' virar diretiva"
  - "Conteúdo não carrega estilo: sem HTML, class, style ou atributos fora do registro"
  - "Datas, autor, status editorial, slug e hierarquia não moram no conteúdo"
  - "Mudança no que o parser reconhece só com incremento de dok, migração e fixtures novas; nome novo no registro de diretivas é aditivo e não incrementa"
premissas_sobre_camadas_futuras:
  - camada: "Edição (ADR 005)"
    premissa: "O editor produz DokAST/DokMD sem perda de significado nas fixtures e suporta directives só de bloco; o servidor normaliza no save"
  - camada: "Fluxo editorial (ADR 004)"
    premissa: "Revisões guardam texto canônico com sua versão dok; o diff é feito sobre texto canônico na mesma versão"
  - camada: "Renderização (ADR 007)"
    premissa: "Renderiza DokAST sem MDX, resolve URIs dok: e define a política de imagem externa"
  - camada: "Busca (ADR 009)"
    premissa: "Indexa a saída de extractText"
  - camada: "Exportação (ADR 010)"
    premissa: "Implementa a matriz do Apêndice B, incluindo escape de { e < ao emitir .mdx e injeção de datas a partir do banco"
  - camada: "Persistência"
    premissa: "Grava texto canônico + refs derivadas de collectRefs; id do frontmatter é igual ao id da linha da página"
  - camada: "Motor de diagrama (ADR 001)"
    premissa: "Views e revisões de diagrama têm uuid estável; existe forma de gerar SVG/PNG estático de uma view fora do canvas interativo"
riscos_abertos:
  - "MDXEditor registra text directives por padrão; precisa aceitar a extensão flow-only (spike S-1)"
  - "Plate perde a serialização MDX nativa: componentes como directives exigem regras próprias no @platejs/markdown"
  - "Tiptap usa marked, não mdast; se for o escolhido, exige conversor próprio para não divergir"
  - "Âncoras por slug quebram quando o heading é renomeado"
  - "Geração estática de view de diagrama para export ainda não tem dono (conflito C-2)"
  - "Import de conteúdo com muito HTML perde marcação"
gatilhos_de_reabertura:
  - "Spike S-1 falha em MDXEditor, Plate e Milkdown"
  - "Starlight deixa de suportar :::note em algum processador"
  - "Extensão de directives sem manutenção ou com major que mude a sintaxe"
  - "Necessidade de componentes inline, transclusão, matemática ou ids de heading estáveis"
  - "Mais de 10% das páginas importadas com DOK-W104"
```

---

## Apêndice A — Especificação DokMD v1

### A.1 Documento

Um documento é um frontmatter YAML seguido do corpo. A forma canônica é a saída de `normalizeDok`: LF como fim de linha, uma linha em branco entre blocos, arquivo terminando com uma única LF, sem hard wrap de parágrafos.

```ebnf
documento      = frontmatter , LF , corpo ;
frontmatter    = "---" , LF , yaml , LF , "---" , LF ;
corpo          = { bloco } ;
bloco          = bloco-commonmark | bloco-gfm | callout | tabs | steps | diagram ;

callout        = ":::" , tipo , [ "[" , inline , "]" ] , [ "{" , attrs-callout , "}" ] , LF , corpo , ":::" ;
tipo           = "note" | "tip" | "caution" | "danger" ;
attrs-callout  = [ 'variant="' , variante , '"' ] , [ ' fold="' , ( "open" | "closed" ) , '"' ] ;
tabs           = "::::tabs" , [ '{sync="' , slug , '"}' ] , LF , tab , { LF , tab } , "::::" ;
tab            = ":::tab[" , inline , "]" , LF , corpo , ":::" ;
steps          = ":::steps" , LF , lista-ordenada , ":::" ;
diagram        = "::diagram" , [ "[" , inline , "]" ] ,
                 '{src="dok:diagram/' , uuid , '" view="' , uuid , '"' ,
                 [ ' rev="' , uuid , '"' ] , ' title="' , texto , '"}' ;
```

Regras que a gramática não mostra:

- O número de `:` cresce com o aninhamento: o contêiner mais interno usa 3, cada nível acima soma 1 (`:::::tabs` › `::::tab` › `:::note`). Só o serializer escreve isso; escrita à mão com a mesma contagem é acusada por DOK-E008.
- Atributos sempre com aspas duplas, na ordem do registro (A.3).
- Não existem text directives. `:nome` no meio de uma frase é texto.

### A.2 Construções, com exemplo canônico

**Frontmatter**

```yaml
---
dok: 1
id: 0192f0a1-5c3e-7a10-8b2c-3d4e5f607182
title: "Visão: pagamentos"
description: Como o domínio de pagamentos se encaixa no ecossistema.
tags:
  - arquitetura
  - c4/contexto
aliases:
  - Pagamentos C4
props:
  owner: time-plataforma
  revisado: true
---
```

Schema (é o contrato; o arquivo TS vai para `src/content-format/frontmatter.ts`):

```ts
import { z } from 'zod'

export const DOK_FORMAT_VERSION = 1 as const

const tag = z
  .string()
  .max(64)
  .regex(/^(?!\d+$)[\p{L}\p{N}_/-]+$/u)
const propKey = z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/)
const propScalar = z.union([z.string(), z.number(), z.boolean(), z.null()])
const propValue = z.union([propScalar, z.array(z.union([z.string(), z.number(), z.boolean()]))])
const unique = (arr: string[]) => new Set(arr).size === arr.length

export const frontmatterSchema = z.strictObject({
  dok: z.literal(DOK_FORMAT_VERSION),
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(300).optional(),
  tags: z.array(tag).max(50).refine(unique, 'tags duplicadas').optional(),
  aliases: z.array(z.string().trim().min(1).max(200)).max(20).refine(unique, 'aliases duplicados').optional(),
  props: z.record(propKey, propValue).optional(),
})

export type DokFrontmatter = z.infer<typeof frontmatterSchema>

export const FRONTMATTER_KEY_ORDER = ['dok', 'id', 'title', 'description', 'tags', 'aliases', 'props'] as const
```

`props` é onde vivem as propriedades livres do usuário (as "properties" do Obsidian). O importador move para `props` qualquer chave que não seja do schema; o export do Obsidian as devolve ao nível de cima. Chaves de `props` são serializadas em ordem alfabética.

**Callouts**

```md
:::note[Antes de começar]
Você precisa de:

- Node 22
- acesso ao Supabase
:::

:::danger{variant="bug" fold="closed"}
Não rode em produção.
:::
```

`variant` guarda o tipo de origem (GitHub/Obsidian) quando ele não é um dos quatro canônicos: `info`, `important`, `abstract`, `summary`, `tldr`, `todo`, `quote`, `cite`, `hint`, `success`, `check`, `done`, `example`, `question`, `help`, `faq`, `warning`, `attention`, `error`, `bug`, `failure`, `fail`, `missing`. O renderer ignora `variant` (usa só o tipo canônico); o export do Obsidian o usa.

Mapeamento na entrada:

| Origem                                                                  | Canônico                      |
| :---------------------------------------------------------------------- | :---------------------------- |
| GitHub `NOTE` / `TIP`                                                   | `note` / `tip`                |
| GitHub `IMPORTANT`                                                      | `note{variant="important"}`   |
| GitHub `WARNING`                                                        | `caution`                     |
| GitHub `CAUTION`                                                        | `danger`                      |
| Obsidian `note`, `info`, `abstract`/`summary`/`tldr`, `todo`, `quote`/`cite` | `note` (+ `variant` se ≠ note) |
| Obsidian `tip`/`hint`, `success`/`check`/`done`, `example`, `question`/`help`/`faq` | `tip` (+ `variant`)   |
| Obsidian `warning`/`caution`/`attention`                                | `caution` (+ `variant`)       |
| Obsidian `danger`, `error`, `bug`, `failure`/`fail`/`missing`           | `danger` (+ `variant`)        |
| Obsidian `-` / `+` depois do tipo                                       | `fold="closed"` / `fold="open"` |
| Starlight `<Aside type="x" title="T">`                                  | `:::x[T]`                     |

**Abas**

```md
::::tabs{sync="pkg"}
:::tab[npm]
npm i
:::

:::tab[pnpm]
pnpm i
:::
::::
```

**Passos**

```md
:::steps
1. Crie o projeto
2. Configure o Supabase
:::
```

**Diagrama**

```md
::diagram[Pessoa usa o Checkout, que chama o Gateway de pagamento]{src="dok:diagram/0192f0a1-6d4f-7b20-9c3d-4e5f60718293" view="0192f0a1-6d4f-7b20-9c3d-4e5f60718294" title="Contexto do Pagamento"}
```

| Campo      | Obrigatório | Significado                                                                                                     |
| :--------- | :---------- | :-------------------------------------------------------------------------------------------------------------- |
| `src`      | Sim         | `dok:diagram/<uuid>` — o diagrama                                                                               |
| `view`     | Sim         | uuid da view a exibir                                                                                           |
| `title`    | Sim         | Legenda editorial, escrita pelo autor (o editor preenche com o nome do diagrama ao inserir). Não se atualiza sozinha ao renomear o diagrama, de propósito: senão, renomear um diagrama alteraria o texto de N páginas sem ninguém editar |
| `rev`      | Não         | uuid de uma revisão específica; ausente = a revisão que o ADR 004 considerar corrente/publicada                  |
| `[..]`     | Recomendado | Descrição textual: alt, leitor de tela e fallback em destinos sem imagem. Ausente = aviso DOK-W103 e fallback no `title` |

**Links**

| Forma                          | Exemplo                                              | Significado                                          |
| :----------------------------- | :--------------------------------------------------- | :--------------------------------------------------- |
| Página                         | `[visão geral](dok:page/0192…183)`                   | Link para a página                                   |
| Página + heading               | `[contexto](dok:page/0192…183#contexto)`             | Âncora = slug github-slugger do heading              |
| Título vivo                    | `[](dok:page/0192…183)`                              | O renderer mostra o título atual da página           |
| Pendente                       | `[Página inexistente](dok:page/new?title=P%C3%A1gina%20inexistente)` | Página ainda não existe (aviso DOK-W101). Ao ser criada, o pipeline troca pelo id |
| Diagrama no Studio             | `[abrir](dok:diagram/0192…293?view=0192…294)`        | Abre o Studio                                        |
| Mesma página                   | `[topo](#pagamentos)`                                | Âncora local                                         |
| Externo                        | `[Docs](https://docs.astro.build)`, `<https://x.dev>`, `mailto:` | Normal                                   |

Como o editor exibe (orientação para o ADR 005): digitar `[[` abre autocomplete por título e alias; confirmar grava `[](dok:page/<id>)` (título vivo) ou `[texto](dok:page/<id>)` se o autor digitou `|texto`. O link aparece com o título atual e um indicador de link interno; link pendente aparece em estilo distinto.

**Imagens e anexos**

```md
![Diagrama de implantação](dok:asset/0192f0a1-7e50-7c30-8d4e-5f6071829304 "Legenda da figura")

Baixe o [relatorio-q3.pdf](dok:asset/0192f0a1-7e50-7c30-8d4e-5f6071829305).
```

### A.3 Registro de diretivas v1

| Tipo      | Nome                               | Atributos (ordem canônica)   | Rótulo `[..]`             | Filhos                           |
| :-------- | :--------------------------------- | :--------------------------- | :------------------------ | :------------------------------- |
| container | `note`, `tip`, `caution`, `danger` | `variant`, `fold`            | Opcional (título)         | Qualquer bloco                   |
| container | `tabs`                             | `sync`                       | Não                       | Somente `tab`, ao menos um       |
| container | `tab`                              | —                            | **Obrigatório** (rótulo)  | Qualquer bloco; pai tem de ser `tabs` |
| container | `steps`                            | —                            | Não                       | Exatamente uma lista ordenada    |
| leaf      | `diagram`                          | `src`, `view`, `rev`, `title` | Recomendado (descrição)   | —                                |

Nomes reservados para versões futuras (recusados hoje com DOK-E003; `card`/`cardgrid` são os primeiros candidatos, pedidos no rascunho anterior): `include`, `card`, `cardgrid`, `badge`, `math`, `embed`, `video`, `toc`, `details`.

### A.4 Nós da DokAST

Permitidos: `root`, `yaml` (só como primeiro filho), `paragraph`, `heading`, `thematicBreak`, `blockquote`, `list`, `listItem` (com `checked`), `code`, `table`, `tableRow`, `tableCell`, `footnoteDefinition`, `footnoteReference`, `text`, `emphasis`, `strong`, `delete`, `inlineCode`, `break`, `link`, `image`, `containerDirective` e `leafDirective` (só nomes do registro).

Existem só transitoriamente, antes da normalização: `definition`, `linkReference`, `imageReference` (viram `link`/`image` inline).

Proibidos: `html`, `textDirective`, qualquer `mdx*`, `math`, `inlineMath`.

Tipo publicado (esboço do `src/content-format/types.ts`):

```ts
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive'

export type CalloutName = 'note' | 'tip' | 'caution' | 'danger'

export type DokDirective =
  | (ContainerDirective & { name: CalloutName; attributes: { variant?: string; fold?: 'open' | 'closed' } })
  | (ContainerDirective & { name: 'tabs'; attributes: { sync?: string } })
  | (ContainerDirective & { name: 'tab'; attributes: Record<string, never> })
  | (ContainerDirective & { name: 'steps'; attributes: Record<string, never> })
  | (LeafDirective & { name: 'diagram'; attributes: { src: string; view: string; rev?: string; title: string } })

export type DokRef =
  | { kind: 'page'; id: string; anchor?: string; line: number }
  | { kind: 'unresolved'; title: string; line: number }
  | { kind: 'asset'; id: string; line: number }
  | { kind: 'diagram'; id: string; view?: string; rev?: string; line: number }

export type Diagnostic = { code: `DOK-${'E' | 'W'}${number}`; message: string; line?: number }
```

### A.5 Regras de round-trip

| Pode mudar entre entrada e forma canônica                                    | Nunca muda                                                         |
| :--------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| Marcador de lista (`-`, e `*` quando duas listas se tocam)                  | Texto (caracteres visíveis)                                        |
| Numeração de lista ordenada (incremental a partir do início)                 | Estrutura (ordem e aninhamento de blocos e inlines)                |
| Ênfase `_x_`, forte `**x**`, riscado `~~x~~`                                 | Destino e título de links e imagens                                 |
| Setext → ATX; fechamento `###` removido                                      | Conteúdo, linguagem e meta de blocos de código (byte a byte)       |
| Código indentado → cercado; cerca cresce se o conteúdo tiver crases          | Valores de atributos de diretiva                                   |
| Quebra dura com dois espaços → `\` + LF                                     | Valores do frontmatter                                             |
| Escapes (`\*`, `\<`, `\[`, `#\#`)                                            | Nível de heading, alinhamento de coluna de tabela                  |
| Padding de tabelas; indentação de itens; linhas em branco entre blocos       | Tipo de callout e seu título                                       |
| Ordem de chaves do frontmatter e de atributos; flow → block YAML; aspas YAML  |                                                                    |
| Link/imagem por referência → inline; autolink literal → `<…>`               |                                                                    |

Garantias testadas: `N(N(x)) = N(x)` para toda entrada; `N(expected) = expected` para toda fixture.

### A.6 Política de segurança

| Construção na entrada                         | Na forma canônica (save)               | No import                                                  |
| :-------------------------------------------- | :------------------------------------- | :--------------------------------------------------------- |
| HTML em bloco ou inline                       | **Erro DOK-E002**                      | Tags removidas, texto mantido; comentários removidos; `<br>` fora de tabela vira quebra; relatório W104 |
| JSX (`<Tabs>`)                                | Erro DOK-E002 (o parser vê como HTML)  | Allowlist convertida para diretiva; o resto vira texto     |
| `{expressão}`                                 | É texto (não existe no parser)         | Expressão vira texto literal; atributo com expressão é descartado (W104) |
| `import` / `export`                           | É texto                                | Removido (W104)                                            |
| `javascript:`, `data:`, `vbscript:`, `file:`  | **Erro DOK-E005**                      | Link vira texto                                            |
| Caminho relativo (`./x.md`, `/wiki/x`)        | **Erro DOK-E006**                      | Resolvido para `dok:page/…` ou vira link pendente          |
| Diretiva fora do registro                     | **Erro DOK-E003**                      | Vira texto literal                                         |
| Atributo fora do registro (`class`, `style`, `width`, `#id`) | **Erro DOK-E004**       | Descartado (W104)                                          |
| Imagem externa `https`                        | Aviso DOK-W102                         | Mantida (ou baixada como asset, a decidir no ADR 010)      |

### A.7 Códigos de diagnóstico

| Código   | Nível | Significado                                                          |
| :------- | :---- | :------------------------------------------------------------------- |
| DOK-E001 | Erro  | Frontmatter ausente, YAML inválido ou fora do schema                 |
| DOK-E002 | Erro  | HTML/JSX cru                                                         |
| DOK-E003 | Erro  | Diretiva desconhecida                                                |
| DOK-E004 | Erro  | Atributo não permitido, inválido ou obrigatório ausente              |
| DOK-E005 | Erro  | Esquema de URL proibido                                              |
| DOK-E006 | Erro  | URL relativa ou `dok:` malformada                                    |
| DOK-E008 | Erro  | Estrutura inválida (`tab` fora de `tabs`, `steps` sem lista…)        |
| DOK-E009 | Erro  | Versão de formato mais nova que a suportada                          |
| DOK-E010 | Erro  | Referência não normalizada (só aparece se alguém validar sem normalizar) |
| DOK-W101 | Aviso | Link pendente                                                        |
| DOK-W102 | Aviso | Imagem externa                                                       |
| DOK-W103 | Aviso | Diagrama sem descrição textual                                       |
| DOK-W104 | Aviso | Conversão com perda no import                                        |
| DOK-W105 | Aviso | Âncora não existe na página alvo (checado no save, com o índice)     |
| DOK-W106 | Aviso | Embed legado `[[diagram:…]]` não resolvido                           |

### A.8 Versionamento

- `dok` é inteiro. Leitura aceita `dok ≤ atual` e migra em memória; `dok > atual` é DOK-E009.
- Toda mudança no que o **parser** reconhece incrementa `dok`, inclusive as "aditivas": ligar matemática, por exemplo, muda o significado de `$5 e $6` que hoje é texto. A migração correspondente escapa as colisões.
- Nome novo no **registro** de diretivas (ex.: `:::card`), ou atributo opcional novo, **não** incrementa: hoje esse conteúdo é recusado no save (DOK-E003/E004), então nenhuma página gravada muda de significado. Exige só fixtures novas. Cuidado operacional: depois de gravar páginas com o nome novo, reverter o deploy as torna inválidas.
- Migração = função pura `(ast: DokAST) => DokAST`, com fixtures de entrada em vN e saída em vN+1.
- Save sempre grava a versão corrente. Um job em lote migra o acervo; revisões antigas ficam como foram gravadas.

---

## Apêndice B — Matriz construção × destino

| Construção                  | Starlight (projeto Astro)                                                                                              | Vault Obsidian                                                                     | Markdown GFM universal                                                          | .docx                                                                   |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------------------- |
| Frontmatter                 | `title`, `description` nativos; `dok`, `id`, `tags`, `aliases`, `props` via `docsSchema({ extend })` no `content.config.ts` gerado; `lastUpdated` injetado | Propriedades como estão; `props` achatado no nível de cima; `created`/`updated` injetados | Bloco YAML mantido (GitHub mostra como tabela)                                  | Propriedades do documento: título, assunto (`description`), palavras-chave (`tags`) |
| Extensão do arquivo         | `.md`; `.mdx` só se houver abas ou passos                                                                               | `.md`                                                                              | `.md`                                                                           | Um `.docx` por página ou por space                                      |
| Headings, ênfase, listas, citação, riscado, código inline | Idêntico                                                                                  | Idêntico                                                                           | Idêntico                                                                        | Estilos Título 1–6, runs, numeração, citação                            |
| Lista de tarefas            | Idêntico                                                                                                               | Idêntico                                                                           | Idêntico                                                                        | ☐ / ☑ no início do item                                                 |
| Bloco de código com meta    | Idêntico (Expressive Code lê `title=` e marcações)                                                                     | Idêntico (meta ignorada)                                                           | Idêntico (meta ignorada)                                                        | Parágrafo monoespaçado; realce a decidir no ADR 010                     |
| Tabela                      | Idêntico                                                                                                               | Idêntico                                                                           | Idêntico                                                                        | Tabela Word com alinhamento                                             |
| Notas de rodapé             | Idêntico                                                                                                               | Idêntico                                                                           | Idêntico                                                                        | Notas de rodapé nativas                                                 |
| Quebra dura `\`             | Idêntico                                                                                                               | Idêntico                                                                           | Idêntico                                                                        | Quebra de linha                                                         |
| Link externo / autolink     | Idêntico                                                                                                               | Idêntico                                                                           | Idêntico                                                                        | Hyperlink                                                               |
| `dok:page/<id>`             | Caminho do site `/<space>/<slug>/` (respeitando `base`)                                                                | `[[Nome do arquivo\|texto]]`                                                        | Caminho relativo `../space/slug.md`                                             | Mesmo documento: link para indicador; senão URL da página publicada ou texto |
| `…#slug`                    | `/<space>/<slug>/#slug` (mesmo slugger)                                                                                | `[[Nome do arquivo#Texto do heading\|texto]]`                                       | `../space/slug.md#slug` (GitHub usa o mesmo slugger)                            | Indicador no heading                                                    |
| Título vivo `[](dok:page/…)` | Texto = título atual                                                                                                  | `[[Nome do arquivo]]`                                                              | Texto = título atual                                                            | Texto = título atual                                                    |
| Link pendente               | Texto sem link                                                                                                         | `[[Título]]` (link não resolvido é nativo do Obsidian)                            | Texto sem link                                                                  | Texto                                                                   |
| Callout `:::tipo[T]`        | Idêntico (sintaxe nativa, nos dois processadores)                                                                      | `> [!variant ou tipo]± T` (volta idêntico ao original importado)                  | `> [!NOTE\|TIP\|IMPORTANT\|WARNING\|CAUTION]`; título como primeira linha em negrito; `fold` descartado | Tabela de 1 célula sombreada com título em negrito                      |
| Abas                        | `<Tabs syncKey><TabItem label>` com `import` (`.mdx`)                                                                  | Sequência de `> [!tab]- Rótulo` (o importador reconhece e remonta as abas)        | Rótulo em negrito + conteúdo, em sequência (perde só a interação)               | Rótulo em negrito + conteúdo                                            |
| Passos                      | `<Steps>` envolvendo a lista (`.mdx`)                                                                                  | Lista ordenada                                                                     | Lista ordenada                                                                  | Lista numerada                                                          |
| Diagrama                    | SVG em `src/assets/diagrams/` + `![descrição](…)` + legenda em itálico                                                 | SVG em `diagrams/` + `![descrição](diagrams/x.svg)` + legenda                     | SVG em `assets/` + imagem + legenda                                             | PNG embutido, alt = descrição, legenda "Figura N — title"              |
| Imagem `dok:asset`          | Arquivo em `src/assets/`, caminho relativo (otimização do Astro)                                                        | Arquivo em `assets/`, `![alt](assets/x.png)`                                      | Arquivo em `assets/`, caminho relativo                                          | Imagem embutida, alt e legenda                                          |
| Anexo `dok:asset`           | Arquivo em `public/files/`, link                                                                                       | Arquivo em `assets/`, link                                                         | Arquivo em `assets/`, link                                                      | Hyperlink para a URL publicada ou nome do arquivo                       |
| Imagem externa              | Idêntico                                                                                                               | Idêntico                                                                           | Idêntico                                                                        | Baixada e embutida, ou link (ADR 010)                                   |

Nome de arquivo no vault: título saneado para o sistema de arquivos, com sufixo em colisão. Como o `id` vai no frontmatter, reimportar o vault exportado reconhece as mesmas páginas.

---

## Apêndice C — Fixtures de referência

Pasta `fixtures/`: cada fixture tem `input.md` e, quando o resultado é válido, `expected.md`. O `manifest.json` diz o estágio (`canonical` = só normalização; `import` = passa por um importador), a origem e os diagnósticos esperados. `harness/` roda tudo (`npm install && npm run check`).

| #  | Fixture                         | Estágio   | Origem        | O que prova                                                              |
| :- | :------------------------------ | :-------- | :------------ | :----------------------------------------------------------------------- |
| 01 | frontmatter-minimo              | canonical | dok           | Ordem de chaves, aspas, linha em branco                                   |
| 02 | frontmatter-completo            | canonical | dok           | Flow → block, `props` ordenado, título com `:`                            |
| 03 | frontmatter-invalido            | canonical | dok           | E001: sem id, chave de data, tag duplicada                               |
| 04 | headings-e-inline               | canonical | dok           | Setext→ATX, marcadores de ênfase, escape `#\#`                            |
| 05 | listas-marcadores               | canonical | dok           | Marcadores, listas adjacentes, numeração                                 |
| 06 | listas-aninhadas-tarefas        | canonical | dok           | Tarefas, indentação, continuação de item                                 |
| 07 | blocos-de-codigo                | canonical | dok           | Indentado→cercado, meta preservada, cerca que cresce                    |
| 08 | tabela-gfm                      | canonical | dok           | Alinhamento, padding, `\|` em célula                                     |
| 09 | notas-de-rodape                 | canonical | dok           | Definições separadas                                                     |
| 10 | quebras-e-escapes               | canonical | dok           | `{x}`, `Hora:agora`, `dok:page/x`, `\<T>`, `$5` como texto               |
| 11 | links-externos                  | canonical | dok           | Autolink literal → `<…>`                                                 |
| 12 | link-interno                    | canonical | dok           | `dok:page` com e sem âncora, âncora local, sem escape de `:`             |
| 13 | link-titulo-vivo                | canonical | dok           | Texto vazio estável                                                      |
| 14 | link-por-referencia             | canonical | dok           | Referência → inline                                                      |
| 15 | urls-proibidas                  | canonical | dok           | E005, E006                                                               |
| 16 | callout-canonico                | canonical | dok           | Título, lista dentro, atributos ordenados e com aspas                    |
| 17 | callout-gfm-alert               | import    | gfm           | Os 5 alerts do GitHub                                                    |
| 18 | callout-obsidian                | import    | obsidian      | Título, fold, variant                                                    |
| 19 | aside-starlight-jsx             | import    | starlight-mdx | `<Aside>` → callout; `import` removido                                   |
| 20 | tabs-canonico                   | canonical | dok           | Abas com `sync`                                                          |
| 21 | tabs-starlight-jsx              | import    | starlight-mdx | `<Tabs>`/`<TabItem>`; `icon` descartado                                  |
| 22 | steps-canonico                  | canonical | dok           | Válido + E008                                                            |
| 23 | diagram-canonico                | canonical | dok           | Ordem de atributos, `rev`, W103                                          |
| 24 | diagram-invalido                | canonical | dok           | E003, E004 (atalho `#id`, falta `view`, `width`, `::mermaid`)            |
| 25 | diagram-legado                  | import    | legacy        | `[[diagram:Título]]` resolvido e não resolvido                           |
| 26 | wikilinks-obsidian              | import    | obsidian      | Título, alias, `\|texto`, `#heading`, pendente                           |
| 27 | embeds-obsidian                 | import    | obsidian      | `![[img.png\|300]]`, `![[nota]]`                                         |
| 28 | imagens-e-anexos                | canonical | dok           | Asset com legenda, anexo, imagem externa (W102)                         |
| 29 | html-e-mdx-na-entrada           | import    | starlight-mdx | `export`, `{expr}`, comentário, `<kbd>`, `<div>`                         |
| 30 | html-e-diretivas-na-canonica    | canonical | dok           | E002, E003, E008                                                         |

Ids usados nas fixtures: página corrente `…607182`; página "Visão geral" (alias "Visão C4") `…607183`; diagrama "Contexto do Pagamento" `…293` com view padrão `…294` e revisão `…295`; assets `…304` (png) e `…305` (pdf). Os spikes dos ADRs 005 e 006 devem simular esse mesmo índice.
