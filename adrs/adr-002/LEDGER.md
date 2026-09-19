# LEDGER — Contratos dos ADRs da engine de documentação

Atualizado a cada ADR aceito. É entrada obrigatória de todo ADR novo. ADRs em status Proposto entram marcados e só viram contrato firme quando aceitos.

## Arquitetura base

- App: TanStack Start (SSR, server functions) + React 19 + Vite + TypeScript strict. Alias @ → src. Formatação oxfmt.
- UI: shadcn/Radix. Tailwind CSS v4 via @tailwindcss/vite, sem tailwind.config e sem PostCSS.
- Cores só por token CSS (custom properties), temas .theme-dark / .theme-light. Único hardcode permitido: linear-gradient(135deg,#8b5cf6,#4f8ff7). Nada de CSS reset universal não-layered.
- Animações respeitam prefers-reduced-motion. Tudo funciona em dark e light.
- Backend: Supabase (Postgres, Auth, RLS, Storage). Multi-inquilino.
- Motor de diagrama: @xyflow/react (React Flow), decidido no ADR 001; o modelo do diagrama vive no Supabase.
- Ambiente: projeto Lovable; instalação só pelo registro npm, sem build nativo nem postinstall que baixa binário.
- Segurança: conteúdo de usuário nunca é compilado nem avaliado como código.
- Versões: sempre a última estável, conferida na data da pesquisa, com link da fonte.
- Dependências novas: permitidas só com justificativa no ADR.

## ADR 001 — Motor de diagrama

```yaml
adr: "001"
camada: "Motor de diagrama"
status: "Aceito"
decisao: "@xyflow/react (React Flow), com nodes/edges controlados pelo estado do app"
interfaces_publicadas:
  - nome: "Modelo de diagrama (elementos, relacionamentos, views)"
    tipo: "tabelas Supabase"
    descricao: "Diagramas e suas views vivem no Postgres; o canvas é controlado de fora"
restricoes_impostas:
  - "Diagramas são referenciados por id estável, nunca por título"
  - "O registry de formas (ShapeDef) é independente do motor"
premissas_sobre_camadas_futuras:
  - camada: "Renderização"
    premissa: "Consegue exibir uma view de diagrama em modo leitura dentro de uma página"
```

## ADR 002 — Formato de conteúdo (Proposto; aceitar após spike S-1)

Substitui o rascunho `adr-002-biblioteca-wiki.md` como ADR 002. A avaliação de editores daquele rascunho é entrada do ADR 005; leitura e navegação, do ADR 007. O spike S-1 é o S1 do rascunho com os testes 1, 3 e 4 reescritos, e serve aos dois ADRs.

```yaml
adr: "002"
camada: "Formato de conteúdo"
status: "Proposto"
data: "2026-09-18"
decisao: "Páginas escritas e armazenadas em DokMD v1 (CommonMark + GFM + frontmatter YAML + directives só de bloco, conjunto fechado), AST mdast, referências por URI dok: com id; MDX/wikilink/alerts só na entrada."
dependencias:
  - { pacote: "mdast-util-from-markdown", versao: "^2.0.3", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-from-markdown" }
  - { pacote: "mdast-util-to-markdown", versao: "^2.1.2", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-to-markdown" }
  - { pacote: "micromark-extension-gfm", versao: "^3.0.0", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/micromark-extension-gfm" }
  - { pacote: "mdast-util-gfm", versao: "^3.1.0", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-gfm" }
  - { pacote: "micromark-extension-directive", versao: "^4.0.0", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/micromark-extension-directive" }
  - { pacote: "mdast-util-directive", versao: "^3.1.0", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-directive" }
  - { pacote: "micromark-extension-frontmatter", versao: "^2.0.0", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/micromark-extension-frontmatter" }
  - { pacote: "mdast-util-frontmatter", versao: "^2.0.1", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-frontmatter" }
  - { pacote: "micromark-extension-mdx-jsx", versao: "^3.0.2", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/micromark-extension-mdx-jsx (só importador)" }
  - { pacote: "mdast-util-mdx-jsx", versao: "^3.2.0", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-mdx-jsx (só importador)" }
  - { pacote: "unist-util-visit", versao: "^5.1.0", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/unist-util-visit" }
  - { pacote: "mdast-util-to-string", versao: "^4.0.0", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/mdast-util-to-string" }
  - { pacote: "github-slugger", versao: "^2.0.0", licenca: "ISC", verificado_em: "2026-09-18 https://www.npmjs.com/package/github-slugger" }
  - { pacote: "yaml", versao: "^2.9.1", licenca: "ISC", verificado_em: "2026-09-18 https://www.npmjs.com/package/yaml" }
  - { pacote: "zod", versao: "^4.6.5", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/zod" }
  - { pacote: "@types/mdast", versao: "^4.0.4", licenca: "MIT", verificado_em: "2026-09-18 https://www.npmjs.com/package/@types/mdast" }
interfaces_publicadas:
  - { nome: "Gramática DokMD v1", tipo: "formato", descricao: "Apêndice A do ADR 002; conformidade = 30 fixtures" }
  - { nome: "DokAST", tipo: "tipo TS", descricao: "mdast restrita (Apêndice A.4) com DokDirective tipada" }
  - { nome: "frontmatterSchema", tipo: "tipo TS", descricao: "Zod estrito: dok, id, title; description, tags, aliases, props opcionais" }
  - { nome: "URIs dok:", tipo: "formato", descricao: "dok:page/<uuid>[#slug], dok:page/new?title=<pct>, dok:asset/<uuid>, dok:diagram/<uuid>[?view=<uuid>]" }
  - { nome: "parseDok / serializeDok / normalizeDok / validateDok", tipo: "função", descricao: "normalizeDok é idempotente e é o que o save grava; códigos DOK-E bloqueiam" }
  - { nome: "importDialect", tipo: "função", descricao: "gfm | obsidian | starlight-mdx | legacy → DokAST + relatório" }
  - { nome: "collectRefs", tipo: "função", descricao: "Refs page/unresolved/asset/diagram para backlinks, grafo e integridade" }
  - { nome: "extractText", tipo: "função", descricao: "Texto indexável por bloco, sem render" }
  - { nome: "migrateDok", tipo: "função", descricao: "Migrações puras vN → vN+1" }
  - { nome: "Matriz de tradução por destino", tipo: "formato", descricao: "Apêndice B do ADR 002; normativa para o ADR 010" }
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
  - { camada: "Edição (ADR 005)", premissa: "Produz DokAST/DokMD sem perda de significado nas fixtures e suporta directives só de bloco; o servidor normaliza no save" }
  - { camada: "Fluxo editorial (ADR 004)", premissa: "Revisões guardam texto canônico com sua versão dok; diff sobre texto canônico na mesma versão" }
  - { camada: "Renderização (ADR 007)", premissa: "Renderiza DokAST sem MDX, resolve URIs dok: e define a política de imagem externa" }
  - { camada: "Busca (ADR 009)", premissa: "Indexa a saída de extractText" }
  - { camada: "Exportação (ADR 010)", premissa: "Implementa a matriz do Apêndice B, com escape de { e < ao emitir .mdx e datas injetadas do banco" }
  - { camada: "Persistência", premissa: "Grava texto canônico + refs derivadas; id do frontmatter = id da linha" }
  - { camada: "Motor de diagrama (ADR 001)", premissa: "Views e revisões com uuid estável; SVG/PNG estático de uma view fora do canvas interativo" }
riscos_abertos:
  - "MDXEditor registra text directives por padrão (spike S-1)"
  - "Plate perde a serialização MDX nativa: componentes como directives exigem regras próprias"
  - "Tiptap usa marked, não mdast"
  - "Âncoras por slug quebram ao renomear heading"
  - "Geração estática de view de diagrama para export sem dono (C-2)"
  - "Import de conteúdo com muito HTML perde marcação"
gatilhos_de_reabertura:
  - "Spike S-1 falha em MDXEditor, Plate e Milkdown"
  - "Starlight deixa de suportar :::note em algum processador"
  - "Extensão de directives sem manutenção ou com major que mude a sintaxe"
  - "Necessidade de componentes inline, transclusão, matemática ou ids de heading estáveis"
  - "Mais de 10% das páginas importadas com DOK-W104"
```

## Conflitos em aberto

| ID  | Entre                        | Descrição                                                                                                                                                                              | Dono da resolução                                       |
| :-- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| C-1 | ADR 001 × ADR 002            | O embed exige que view e revisão de diagrama tenham uuid estável. O ADR 001 publica "tabelas Supabase" sem garantir id de view nem conceito de revisão                                | ADR de persistência (ou adendo ao ADR 001)              |
| C-2 | ADR 001 × ADR 010 (via 002)  | Todo destino de export precisa de SVG/PNG estático da view. React Flow renderiza no DOM; não há caminho definido para gerar a imagem fora do canvas (servidor ou export no navegador) | ADR 010, com entrada do dono do motor de diagrama       |
| C-4 | ADR 002 × rascunho de bibliotecas | O rascunho assumia componentes em JSX canônico e round-trip `out === in` em 28/30; o ADR 002 adota directives e `normalizeDok(saída) === expected` em 30/30. Plate perde a vantagem de serialização MDX | ADR 005 (reescrever E-03 e testes 1 e 3 do S1) |
| C-3 | ADR 002 × conteúdo existente | A Wiki atual usa `[[diagram:Título]]`, que este formato substitui                                                                                                                       | Fatia F5 do ADR 002                                     |
