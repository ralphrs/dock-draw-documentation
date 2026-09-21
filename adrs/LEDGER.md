# LEDGER — Contratos dos ADRs da engine de documentação

Entrada obrigatória de todo ADR novo. Atualizado em 2026-09-19.

> [!NOTE]
> **Histórico de processo.** Entre 2026-09-18 e 2026-09-19 os ADRs 002, 003 e 004 ficaram em "Propostos vinculantes", contratos que os ADRs seguintes deviam respeitar como se estivessem aceitos, enquanto o spike S-1 (definido no ADR 002, seção 8.2) não rodava. O S-1 passou com o MDXEditor 4.2.5 em 2026-09-19 (ADR 005, seção 8), e os três ADRs, junto com o 005, passam para "Aceitos". A seção "Propostos vinculantes" volta a existir se um ADR futuro precisar do mesmo mecanismo.

## Arquitetura base (inegociável; candidata que conflita é eliminada)
- App: TanStack Start (SSR, server functions) + React 19 + Vite + TypeScript strict. Alias @ → src. Formatação oxfmt.
- UI: shadcn/Radix. Tailwind CSS v4 via @tailwindcss/vite, sem tailwind.config e sem PostCSS.
- Cores só por token CSS (custom properties), temas .theme-dark / .theme-light. Único hardcode permitido: linear-gradient(135deg,#8b5cf6,#4f8ff7). Nada de CSS reset universal não-layered.
- Animações respeitam prefers-reduced-motion. Tudo funciona em dark e light.
- Backend: Supabase (Postgres, Auth, RLS, Storage). Multi-inquilino.
- Motor de diagrama: @xyflow/react (React Flow), decidido no ADR 001; o modelo do diagrama vive no Supabase.
- Ambiente: projeto Lovable; instalação só pelo registro npm, sem build nativo nem postinstall que baixa binário.
- Segurança: conteúdo de usuário nunca é compilado nem avaliado como código.
- Versões: sempre a última estável, conferida na data da pesquisa, com link da fonte.
- Dependências novas: permitidas só com justificativa no ADR (exceção documentada, como no ADR 001).

---

## Por que este arquivo diverge dos arquivos dos ADRs

Este ledger é contrato vivo e acumula. O arquivo de cada ADR é registro datado e não se reescreve.

Quando algo é descoberto depois do aceite, ou quando um ADR novo estende aditivamente o contrato de um ADR anterior, a mudança entra aqui, na entrada do ADR dono, com a origem e a data registradas na descrição. O arquivo do ADR continua dizendo o que foi decidido na data dele.

Conferência de consistência entre os dois deve **confirmar** estas divergências, nunca corrigi-las. Corrigir apaga a história ou perde a extensão.

| ADR | O que este ledger tem a mais | Origem |
| --- | --- | --- |
| 002 | Linha do `zod` refinada e dois `riscos_abertos` a mais | Spike S-1 do ADR 005, 2026-09-19 |
| 002 | Restrição de não importar biblioteca de interface | Revisão da ordem da fatia F3, 2026-09-20 |
| 003 | `getSpaceList` na lista de funções | Extensão aditiva do ADR 006, 2026-09-20 |
| 004 | `listPendingRevisions` na lista de funções | Extensão aditiva do ADR 006, 2026-09-20 |
| 003 | `content.pages` tem `project_id` (uuid, nulo, sem FK) | `DEC-0014`, aprovada em `DDP-118`, 2026-09-20 |
| 003 | A unicidade de `content.pages` é `unique nulls not distinct (space_id, project_id, parent_page_id, slug)` | `DEC-0014`, aprovada em `DDP-118`, 2026-09-20 |
| 003 | `content.space_members` tem `workspace_id`, denormalizado, fora da chave primária | `DEC-0014`, aprovada em `DDP-118`, 2026-09-20 |
| 003 | `content.revision_status_events` tem `workspace_id`, denormalizado, fora da chave primária | `DEC-0014`, aprovada em `DDP-118`. Registro completado em `DDP-134`, 2026-09-20 |
| 003 | `content.revision_current_status` tem `workspace_id`, denormalizado | `DEC-0014`, aprovada em `DDP-118`. Registro completado em `DDP-134`, 2026-09-20 |
| 003 | `content.page_drafts` tem `workspace_id`, denormalizado | `DEC-0014`, aprovada em `DDP-118`. Registro completado em `DDP-134`, 2026-09-20 |

As seis linhas do ADR 003 acima vêm da mesma decisão e do mesmo pedido: hierarquia de quatro níveis, unicidade como no Confluence, e estrutura pronta para separar tenants em instâncias. As três primeiras foram registradas quando a sub-fatia S1b fechou, e cobriam só as tabelas que ela tocava. As três últimas faltavam, e a falta custou uma volta: a ordem da S1c1 criou `content.revision_status_events` sem a coluna, porque o ledger é a fonte de verdade que a sessão B lê e o requisito não estava nele (`DDP-122`, `DDP-134`). O DDL da seção 6.2 do ADR 003 continua registrando o que foi decidido em 2026-09-18, e o schema aplicado no banco a partir de 2026-09-20 é o descrito aqui.

Os ADRs 001, 005, 006 e a Emenda 1 conferem byte a byte.

---

# Aceitos

## ADR 001 — Motor de diagrama

```yaml
adr: "001"
camada: "Motor de diagrama"
status: "Aceito"
decisao: "@xyflow/react (React Flow), com nodes/edges controlados pelo estado do app"
interfaces_publicadas:
  - nome: "Modelo de diagrama (elementos, relacionamentos, views)"
    tipo: "tabelas Supabase"
    descricao: "public.projects, public.views, public.view_nodes, public.model_elements, public.relationships (supabase-types-dokdraw.ts). Mutáveis, sem histórico de revisão"
restricoes_impostas:
  - "Diagramas são referenciados por id estável, nunca por título"
  - "O registry de formas (ShapeDef) é independente do motor"
premissas_sobre_camadas_futuras:
  - camada: "Renderização (ADR 007)"
    premissa: "Consegue exibir uma view de diagrama em modo leitura dentro de uma página"
```

## ADR 002 — Formato de conteúdo (DokMD v1)

Arquivo: `ADR-002-formato-de-conteudo.md` · Status: Aceito.

```yaml
adr: "002"
camada: "Formato de conteúdo"
status: "Aceito"
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
    versao: "^4.6.5, ou ^3.25.76 do app importando de zod/v4"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/zod. Confirmado em 2026-09-19 (ADR 005, adrs/_work/spike-s1/AMBIENTE.md): o app usa zod ^3.25.76, que publica a API 4 em zod/v4. O gate do S-1 passa 30/30 importando de zod/v4 e falha na carga importando a API 3 clássica (z.uuid is not a function). src/content-format importa sempre de zod/v4"
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
  - "src/content-format, exceto src/content-format/testing, não importa biblioteca de interface (react, react-dom ou equivalente). É módulo de transformação de dados: entra texto ou árvore, sai texto ou árvore. Verificado por no-restricted-imports no bloco de ESLint do módulo. Acrescentada em 2026-09-20, origem na revisão da ordem da fatia F3 (DDP-84)"
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
  - "DOK-W103 falso no validador de referência do harness: em leafDirective, o rótulo vira filhos diretos (phrasing) sem parágrafo com data.directiveLabel, e o check de conformidade emite o aviso mesmo quando o rótulo está correto. O porte usado no S-1 (ADR 005) mantém o comportamento do harness. Dono: fatia F2 (validação)"
  - "O corpus de 30 fixtures não exercita list.spread = true (linha em branco entre itens irmãos de lista na raiz). O critério de aceite de 30/30 do S-1 foi medido sem essa forma. A fatia F5 do ADR 002 acrescenta o caso ao corpus"
gatilhos_de_reabertura:
  - "Spike S-1 falha em MDXEditor, Plate e Milkdown"
  - "Starlight deixa de suportar :::note em algum processador"
  - "Extensão de directives sem manutenção ou com major que mude a sintaxe"
  - "Necessidade de componentes inline, transclusão, matemática ou ids de heading estáveis"
  - "Mais de 10% das páginas importadas com DOK-W104"
```

### Emenda 1 — Execução, desempenho e testes do `src/content-format`

Arquivo: `ADR-002-emenda-1.md` · Status: Aceita em 2026-09-20 (`DDP-8`).

```yaml
adr: "002"
emenda: 1
titulo: "Execução, desempenho e testes do src/content-format"
data: "2026-09-19"
decisao: "src/content-format roda sem DOM e sem builtin de Node nos três ambientes (navegador, server function em Cloudflare Workers, job agendado), verificado por build de plataforma browser sem externos. O pipeline completo do save conclui em até 300 ms p95 para uma página de 5 mil linhas. Página acima de 300.000 bytes de texto canônico é recusada com DOK-E011. A suíte de 30 fixtures roda como runFixtureSuite compartilhado, sem número fixo."
interfaces_publicadas:
  - nome: "runFixtureSuite"
    tipo: "função"
    descricao: "src/content-format/testing/runFixtureSuite.ts. (fixturesRoot, manifestPath) => SuiteResult. Lê manifest.json e itera o array, sem contar com um número fixo de fixtures. Consumida por content-format (este ADR), pelo adaptador do editor (ADR 005) e pelo renderer (ADR 007, ainda não escrito)"
  - nome: "classifyUrl"
    tipo: "função"
    descricao: "Classifica uma URL em dok:page/<uuid>[#slug], dok:page/new?title=, dok:asset/<uuid>, dok:diagram/<uuid>[?view=<uuid>], https externo, âncora local ou inválida. Já existe em dokmd.ts, uso interno de validateDok. Esta emenda publica a assinatura para o ADR 007 consumir na resolução de links"
restricoes_impostas:
  - "src/content-format, exceto src/content-format/testing, não importa nenhum builtin do Node (node:* ou sem prefixo: fs, path, os, child_process) nem referencia window, document, navigator, localStorage ou sessionStorage. Verificado por build de plataforma browser (rollupOptions.external: []) no mesmo gate da fatia F0. A exceção de testing existe porque runFixtureSuite recebe caminho de diretório e de manifesto e lê fixtures do disco, e porque nada de testing entra no bundle do produto: o build de verificação aponta para src/content-format/index.ts, e o bloco de ESLint da fatia F0 traz ignores de src/content-format/testing"
  - "Toda gravação em content_dokmd passa por validateDok, que recusa com DOK-E011 texto canônico acima de 300.000 bytes UTF-8, antes de qualquer outra checagem"
premissas_sobre_camadas_futuras:
  - camada: "Renderização (ADR 007)"
    premissa: "Resolve dok:page/…, dok:asset/… e dok:diagram/… usando classifyUrl publicado por esta emenda, sem reimplementar a classificação"
  - camada: "Exportação (ADR 010)"
    premissa: "Implementa toProfile(tree, destino) sobre DokAST, usando a Matriz de tradução do Apêndice B do ADR 002 como especificação. Decide o runtime do job agendado de sincronização, respeitando a restrição de execução sem DOM/Node builtin"
riscos_abertos:
  - "O orçamento de 300 ms p95 (seção 2) e o teto de 300.000 bytes foram medidos em Node num laptop, não no isolado V8 do Cloudflare Workers nem num navegador real. Mesma família de motor (V8), número exato em produção não confirmado. O humano decidiu em 2026-09-20 (DDP-105) que os dois valem como contrato assim medidos: a lacuna fica declarada aqui em vez de virar fatia de medição. As fatias F1 e F4, que eram as donas de revisitar os números, fecharam sem fazê-lo, e o risco deixa de ter dono porque deixou de ser risco a fechar"
  - "O plano do Cloudflare Workers em produção (gratuito, com teto de 10 ms de CPU por requisição, ou pago, com 30 s por padrão) não está registrado em nenhum ADR. Um pipeline de save de página grande no plano gratuito estouraria o teto de CPU. Dono: quem decidir o plano de hospedagem"
  - "O limite de 300.000 bytes assume uma correlação bytes/linha medida em conteúdo misto (headings, listas, código, tabela, callout, tabs, steps, diagrama). Uma página real muito mais densa em um único tipo de bloco (por exemplo, só tabelas largas) pode atingir o teto de bytes bem antes das 20 mil linhas usadas como referência de UX na seção 3"
  - "O limite de 300.000 bytes não marca uma descontinuidade medida. A curva do p50 cresce de forma suave e superlinear entre 5 mil e 40 mil linhas, sem joelho. O corte é escolha de produto ancorada no limiar de um segundo, e uma revisão que decida por 150.000 ou por 600.000 bytes não contraria nenhuma medição desta emenda. Dono: quem implementar a fatia F4 do ADR 002, ao observar tamanhos reais de página"
  - "cloudflare.nodeCompat: true no preset do Lovable faz a server function de hoje resolver builtin do Node se src/content-format importar um. A restrição desta seção não depende mais do alvo de build, só do navegador, que não tem essa exceção. Quem revisar código novo do módulo não pode assumir que o ambiente de servidor bloqueia builtin do Node por conta própria. Dono: as três verificações da seção 1, não a configuração do Nitro"
gatilhos_de_reabertura:
  - "A medição em ambiente real (Cloudflare Workers de preview) diverge da ordem de grandeza medida em Node por mais de 2x"
  - "O ADR 010 decide um runtime para o job agendado que não é um isolado V8 (por exemplo, uma função Node tradicional), e passa a poder usar builtins do Node sem quebrar a restrição desta emenda, o que reabre a seção 1 só para esse consumidor"
  - "A fatia F5 do ADR 002 (migração do legado) encontra páginas reais acima de 300.000 bytes, e a migração precisa de uma política de divisão que esta emenda não desenha"
```

## ADR 003 — Armazenamento e versionamento

Arquivo: `ADR-003-armazenamento-e-versionamento.md` · Status: Aceito.

```yaml
adr: "003"
camada: "Armazenamento e versionamento"
status: "Aceito"
data: "2026-09-18"
decisao: "Postgres puro no Supabase: page_revisions append-only e imutável (snapshot completo, não delta); status editorial em log de eventos à parte, projetado em revision_current_status; pages.published_revision_id aponta a revisão publicada; page_drafts mutável, um por autor por página; page_refs derivada de collectRefs para backlinks e integridade."
dependencias: []
interfaces_publicadas:
  - nome: "content.workspace_members / content.spaces / content.space_members / content.pages / content.page_revisions / content.page_drafts / content.revision_statuses / content.revision_status_events / content.revision_current_status / content.page_refs / content.assets / content.sync_state"
    tipo: "tabela"
    descricao: "Schema completo na seção 6.2 deste ADR; page_revisions e revision_status_events são append-only, garantido por trigger. workspace_members não existia no schema real (supabase-types-dokdraw.ts só tinha public.user_roles, global) — é criada por este ADR"
  - nome: "Space, Page, PageRevision, PageDraft, Asset"
    tipo: "tipo TS"
    descricao: "src/content-store/types.ts, seção 6.5"
  - nome: "getPage / getPageTree / getDraft / saveDraft / submitRevision / transitionRevisionStatus / publishRevision / listRevisions / getRevision / createPage / movePage / softDeletePage / restorePage / purgePage / createAsset / getAssetSignedUrl / getBacklinks / getSpaceList"
    tipo: "função"
    descricao: "src/content-store/server.ts; server functions do TanStack Start, seção 6.5. getSpaceList(workspaceId): Promise<Space[]> entrou em 2026-09-20 como extensão aditiva pedida pelo ADR 006 (seção 6.1), sem reabertura deste ADR"
  - nome: "content.effective_role(space_id, user_id)"
    tipo: "função"
    descricao: "Ponto único de resolução de papel para RLS: override por content.space_members, senão content.workspace_members"
restricoes_impostas:
  - "Toda escrita de conteúdo publicado cria uma linha nova em page_revisions; a tabela nunca é UPDATE/DELETE (garantido por trigger e ausência de política de RLS para isso)"
  - "Status editorial nunca é coluna de page_revisions; sempre um evento em revision_status_events"
  - "Ninguém lê o rascunho de outro autor fora do fluxo formal de revisão (RLS: page_drafts só é visível ao próprio autor)"
  - "Assets são imutáveis: substituir o arquivo de um asset cria um novo id, nunca sobrescreve o storage_path existente"
  - "Toda referência (link, asset, diagrama) extraída de uma revisão salva vira uma linha em page_refs; nenhuma camada resolve referência varrendo texto"
  - "A identidade de página é id (uuid); slug é só cosmético e nunca aparece em dok:page/<uuid>"
  - "Todo workspace criado em public.workspaces ganha automaticamente uma linha 'owner' em content.workspace_members (trigger); nenhum fluxo pode depender só de public.workspaces.owner_id para autorização"
premissas_sobre_camadas_futuras:
  - camada: "Fluxo editorial (ADR 004)"
    premissa: "Novos estados e papéis são linhas novas em revision_statuses/revision_status_events; comentários ancorados são uma tabela aditiva que referencia revision_id, sem alterar page_revisions"
  - camada: "Busca (ADR 009)"
    premissa: "Indexa via pages.published_revision_id para conteúdo público; indexa page_drafts só dentro do escopo RLS do próprio autor"
  - camada: "Exportação e sync (ADR 010)"
    premissa: "Usa content.sync_state para remote_file_id/hash/data; nenhuma tabela nova necessária para o estado de sync básico"
  - camada: "Motor de diagrama (persistência, ADR 001)"
    premissa: "Antes de excluir um diagrama ou view, consulta content.page_refs (kind='diagram') para saber se alguma página quebra"
  - camada: "Colaboração em tempo real (futura)"
    premissa: "Uma camada Yjs efêmera pode escrever em page_drafts via autosave incremental sem mudar este schema; Realtime pode assinar page_drafts com segurança porque a RLS já restringe por autor"
riscos_abertos:
  - "public.invites não tem workspace_id hoje; não há fluxo formal para popular content.workspace_members além do seed automático do owner — alguém precisa decidir como um segundo usuário entra num workspace"
  - "Performance de content.effective_role() em RLS não verificada em escala (spike não bloqueante, seção 8)"
  - "page_refs.target_id para diagramas (public.projects/public.views) não tem FK de banco; integridade depende de disciplina de aplicação, não do Postgres"
  - "page_refs.target_rev_id fica null por decisão (DEC-0019): a página vincula o id do diagrama e renderiza sempre a versão mais recente, mesmo depois de o ADR 001 versionar diagramas"
gatilhos_de_reabertura:
  - "Volume de revisões por página torna snapshot completo caro o suficiente para justificar deltas"
  - "effective_role() não escala e precisa sair de subquery para claim de JWT"
  - "ADR 004 precisa de merge automático entre revisores, não só detecção de conflito"
  - "public.invites ganha workspace_id e muda a forma de content.workspace_members ser populada"
```

## ADR 004 — Fluxo editorial

Arquivo: `ADR-004-fluxo-editorial.md` · Status: Aceito.

```yaml
adr: "004"
camada: "Fluxo editorial"
status: "Aceito"
data: "2026-09-18"
decisao: "Máquina de estados própria em Postgres, estendendo o ADR 003: revision_reviews (votos append-only) agrega para revision_status_events conforme a política de space_editorial_policies; revision_comments (ancorados por faixa de linha) e notifications são tabelas aditivas; a fixação de diagrama por revisão foi descartada pela DEC-0019: a página vincula o id do diagrama e a renderização resolve sempre a versão mais recente, então page_refs.target_rev_id fica null por decisão, e o DokMD nunca é reescrito para incluir rev."
dependencias: []
interfaces_publicadas:
  - nome: "RevisionStatus (enum)"
    tipo: "tipo TS"
    descricao: "submitted | in_review | changes_requested | approved | published | rejected | superseded — idêntico ao já semeado em content.revision_statuses pelo ADR 003"
  - nome: "REVISION_TRANSITIONS / isTransitionAllowed"
    tipo: "função"
    descricao: "src/editorial-flow/transitions.ts; tabela declarativa de (from, to, actor) — seção 6.3 — única fonte de verdade sobre quais transições são legais"
  - nome: "content.space_editorial_policies / content.revision_reviews / content.revision_comments / content.notifications"
    tipo: "tabela"
    descricao: "Schema completo na seção 6, com RLS na seção 6.7"
  - nome: "castReviewVote / publishRevision / getSpaceEditorialPolicy / upsertSpaceEditorialPolicy / initializeDraftFrom / listPendingRevisions"
    tipo: "função"
    descricao: "src/editorial-flow/server.ts; server functions do TanStack Start, seção 6.3"
  - nome: "Eventos emitidos"
    tipo: "evento"
    descricao: "Um evento por linha nova em revision_status_events (to_status = submitted|in_review|changes_requested|approved|published|rejected|superseded) e por linha nova em revision_comments; consumidos hoje só pelo fan-out para notifications, disponíveis para ADR 010/011 via leitura direta ou Realtime sobre essas tabelas"
restricoes_impostas:
  - "Toda transição de status passa por uma server function que consulta REVISION_TRANSITIONS antes de inserir em revision_status_events; RLS nega insert direto do cliente nessa tabela"
  - "revision_reviews é append-only (trigger forbid_mutation do ADR 003, reaproveitada); um novo voto do mesmo revisor é uma linha nova, nunca um UPDATE"
  - "Autoaprovação (revisor = autor da revisão) é bloqueada a menos que space_editorial_policies.allow_self_approval = true"
  - "Só revisões publicadas (pages.published_revision_id) aparecem para leitores, na busca pública, na publicação e no sync — salvo ação manual do próprio autor exportando seu rascunho"
  - "Diagrama referenciado nunca tem o DokMD reescrito para incluir rev. A resolução é sempre dinâmica, pela DEC-0019, inclusive em revisão publicada antiga: page_refs.target_rev_id fica null por decisão, não por falta de histórico"
  - "page_revisions permanece imutável; nenhuma tabela ou função deste ADR insere, altera ou apaga uma linha ali além de leitura"
premissas_sobre_camadas_futuras:
  - camada: "Edição (ADR 005)"
    premissa: "Implementa diff textual e renderizado contra a versão publicada, modo de comentário ancorado por faixa de linha, indicador de revisão em changes_requested e modo somente leitura; decide se e como entra modo de sugestão de edição"
  - camada: "Renderização (ADR 007)"
    premissa: "Resolve todo embed de diagrama dinamicamente, em rascunho ou em qualquer revisão, e continua assim depois de o ADR 001 versionar diagramas (DEC-0019). Nunca resolve por target_rev_id"
  - camada: "Busca (ADR 009)"
    premissa: "Indexa exclusivamente via pages.published_revision_id; nenhuma revisão em submitted/in_review/changes_requested/approved é exposta à busca pública"
  - camada: "Exportação e sync (ADR 010)"
    premissa: "Exporta e sincroniza só publicadas por padrão; exportação de rascunho é ação manual do próprio autor, fora do pipeline de sync_state"
  - camada: "Publicação (ADR 011)"
    premissa: "Qualquer superfície pública respeita a mesma barreira de pages.published_revision_id usada por Busca e Exportação"
riscos_abertos:
  - "Sem papel dedicado de publicador — publish_role é política, não papel; ver gatilho de reabertura"
  - "revision_reviews_current é VIEW, não materializada; performance sob alto volume de votos não verificada"
  - "Provedor de e-mail e templates de notificação não escolhidos — só a tabela notifications está pronta para alimentar isso depois"
  - "Concorrência de voto (dois revisores votando ao mesmo tempo) precisa de verificação não bloqueante — seção 8"
  - "Revisão publicada de página não é reproduzível: o texto é imutável, e o diagrama que ela mostra é sempre o mais recente (DEC-0019). Quem precisa do diagrama de uma data vai ao histórico do diagrama, não à página. Custo aceito, não risco a fechar"
gatilhos_de_reabertura:
  - "Produto pedir papel dedicado de publicador, separado de quem aprova"
  - "Aprovação por categoria de revisor (não só contagem) virar requisito"
  - "Modo de sugestão de edição inline virar requisito"
  - "E-mail transacional virar requisito obrigatório"
  - "effective_role() não escalar sob a carga das novas policies (agrava o gatilho já registrado no ADR 003)"
  - "Produto exigir que uma revisão publicada mostre o diagrama como estava na data da publicação — reabre a DEC-0019, não o gatilho antigo de ativar a fixação"
```

## ADR 005 — Edição

Arquivo: `ADR-005-edicao.md` · Status: Aceito.

```yaml
adr: "005"
camada: "Edição"
status: "Aceito"
data: "2026-09-19"
decisao: "Editor WYSIWYG MDXEditor 4.2.5, com adaptador próprio via DokAST (nunca o parser Markdown da biblioteca), modo fonte CodeMirror 6 compartilhado, e as fatias lista frouxa e exceção ao colar de nó html obrigatórias antes da liberação"
dependencias:
  - pacote: "@mdxeditor/editor"
    versao: "4.2.5"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@mdxeditor/editor/v/4.2.5"
  - pacote: "lexical"
    versao: "0.48.0"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/lexical/v/0.48.0 (passa de transitiva a direta por causa da correção da seção 1)"
  - pacote: "@lexical/list"
    versao: "0.48.0"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@lexical/list/v/0.48.0"
  - pacote: "@lexical/link"
    versao: "0.48.0"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@lexical/link/v/0.48.0"
  - pacote: "@lexical/react"
    versao: "0.48.0"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@lexical/react/v/0.48.0"
  - pacote: "@codemirror/state"
    versao: "^6.7.5"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/state"
  - pacote: "@codemirror/view"
    versao: "^6.43.12"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/view"
  - pacote: "@codemirror/commands"
    versao: "^6.11.1"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/commands"
  - pacote: "@codemirror/language"
    versao: "^6.12.4"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/language"
  - pacote: "@codemirror/lang-markdown"
    versao: "^6.5.2"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/lang-markdown"
  - pacote: "@codemirror/lint"
    versao: "^6.9.7"
    licenca: "MIT"
    verificado_em: "2026-09-19 https://www.npmjs.com/package/@codemirror/lint"
interfaces_publicadas:
  - nome: "AdapterContract (AdapterProps, AdapterHandle)"
    tipo: "tipo TS"
    descricao: "src/editors/contract.ts. getTree() converte o estado real da biblioteca para mdast, sem cache do initialTree. insertTree ignora nó yaml. insertDirective usa o registry edit. importDialect e searchPages injetados por prop"
  - nome: "src/content-components/{core,edit}"
    tipo: "tipo TS e componente React"
    descricao: "Registry de diretivas chaveado por DokDirective['name']. core sem React. edit publica create() e o componente de edição por diretiva. Teste de completude por nome contra o registro do ADR 002"
  - nome: "Ancoragem de comentário por faixa de linhas"
    tipo: "atributo de dados"
    descricao: "data-line-start/data-line-end por bloco, emitidos pelo renderer da fatia read (ADR 007) dentro de RevisionView, não pelo editor"
  - nome: "RevisionDiff / RevisionView"
    tipo: "componente React"
    descricao: "Usam a fatia read do ADR 007. Único renderizador de DokAST no app, compartilhado por diff textual (E-10), diff renderizado (E-11) e ancoragem (E-12)"
restricoes_impostas:
  - "O adaptador do editor nunca chama o parser ou o serializador Markdown da biblioteca no caminho de persistência, só a conversão de árvore para árvore (mdast)"
  - "Toda escrita passa por normalizeDok + validateDok no servidor, qualquer DOK-E bloqueia o save, inclusive vindo do modo fonte"
  - "Conteúdo com DOK-E, depois de normalizeDok, abre só no modo fonte, nunca no WYSIWYG"
  - "Nenhum nó do editor serializa text directive nem HTML/JSX fora do que o registro do ADR 002 permite"
  - "insertTree recusa nó html e mdxJsx* com diagnóstico visível, nunca lança exceção não capturada"
  - "Nome novo de diretiva no registry só entra por adição ao registro de diretivas do ADR 002, nunca por código específico do adaptador do editor"
premissas_sobre_camadas_futuras:
  - camada: "Renderização (ADR 007)"
    premissa: "Implementa a fatia read de src/content-components para todos os nomes do registro, e o renderer emite data-line-start/data-line-end por bloco, consumido por RevisionView para a ancoragem de comentário (E-12)"
  - camada: "Exportação e sincronização (ADR 010)"
    premissa: "Implementa a fatia export de src/content-components para todos os nomes do registro, por destino do Apêndice B do ADR 002"
  - camada: "Persistência (ADR 003)"
    premissa: "getDok() do editor alimenta saveDraft/submitRevision sem transformação adicional além de normalizeDok + validateDok"
riscos_abertos:
  - "Lista frouxa (linha em branco entre itens irmãos) falha no MDXEditor fora de contexto de citação. O adaptador grava spread false incondicionalmente na exportação, causa isolada em mdxeditor/RESULTADO.md. O único caso da suíte extra/ que parecia passar (x08, dentro de citação) deve o resultado a um acidente do reparse de normalizeDok sobre mdast-util-from-markdown, não à preservação real da informação. Correção estimada em 1 a 1,5 dia, fatia obrigatória F4 antes de liberar o editor (seção 11). O corpus de 30 fixtures do ADR 002 não exercita essa forma, pendência 14 do ledger"
  - "Colar de árvore com nó html lança exceção não capturada no save. Fatia obrigatória F3 (seção 11)"
  - "Link de título vivo com texto vazio (dok:page/… sem rótulo) falha ao apagar por seleção total e ao ser inserido por colar. Fixtures 26 e 27 do D-2. Fatia não obrigatória F6, 1 dia"
  - "Notas de rodapé ficam como ilha opaca, sem edição direta do texto da nota. Fatia não obrigatória F7, 2 a 3 dias"
  - "A correção da seção 1 depende de getStaticNodeConfig, API pública do pacote lexical sem garantia formal de estabilidade entre minors. A suíte deste ADR precisa rodar a cada atualização de lexical ou de @mdxeditor/editor"
  - "Comentários da revisão anterior dentro do rascunho: quando as linhas do rascunho não coincidem com as da revisão comentada, o mapeamento exige diff entre as duas. Sem dono de implementação definido nesta sessão, fica na fatia F5"
gatilhos_de_reabertura:
  - "Lexical publica major que muda o registro estático de $config e quebra a correção da seção 1"
  - "Atualização de @mdxeditor/editor ou lexical falha na suíte de listas (extra/, 12 casos) antes de F4 entrar em produção"
  - "O corpus do ADR 002 ganha fixture com list.spread = true e o MDXEditor falha nela antes de F4"
  - "MDXEditor descontinua manutenção ou muda de licença para fora de MIT/Apache-2.0/BSD/ISC"
  - "Produto exige modo sugestão na v1 (reabre D-7 e a avaliação de Q-F)"
```

---

## ADR 006 — Shell da Wiki (caminho de escrita)

**Aceito** em 2026-09-20. Primeira camada de interface do projeto. Arquivo: `adrs/ADR-006-shell-da-wiki.md`.

```yaml
adr: "006"
camada: "Shell da Wiki (caminho de escrita)"
status: "Aceito"
data: "2026-09-20"
decisao: "As rotas de escrita da Wiki entram sob a mesma fronteira _authenticated do Diagram Studio, herdando ssr:false e o code splitting por rota. O rascunho vive no cliente entre edições, sincronizado por saveDraft a cada 2 s de inatividade com envio forçado a cada 30 s. DraftVersionConflictError recarrega sem bloquear, RevisionConflictError bloqueia com diálogo. A tela de edição consome só a fatia edit do registro de diretivas, nunca a fatia read, reforçado por regra de ESLint."
dependencias: []
interfaces_publicadas:
  - nome: "Rotas /projetos/:projectId/wiki, /projetos/:projectId/wiki/paginas/:pageId, /projetos/:projectId/wiki/paginas/:pageId/editar"
    tipo: "rota"
    descricao: "src/routes/_authenticated/projetos.$projectId.wiki.*.tsx. Todas herdam ssr:false e beforeLoad de _authenticated/route.tsx. O escopo era :spaceId até DEC-0017, aprovada pelo humano em 2026-09-20, que moveu a wiki para dentro do projeto. A rota de fila de revisão não tem escopo decidido e por isso não consta aqui"
  - nome: "getSpaceList(workspaceId): Promise<Space[]>"
    tipo: "função"
    descricao: "Extensão aditiva ao ADR 003, não interface nova desta camada. Entra em src/content-store/server.ts, seção 6.1. LEDGER.md acolhe esta função na entrada do ADR 003, não numa entrada nova para o 006"
  - nome: "listPendingRevisions(spaceId): Promise<PageRevision[]>"
    tipo: "função"
    descricao: "Extensão aditiva ao ADR 004, não interface nova desta camada. Entra em src/editorial-flow/server.ts, filtra currentStatus em submitted | in_review | changes_requested | approved, seção 6.4. LEDGER.md acolhe esta função na entrada do ADR 004, não numa entrada nova para o 006"
restricoes_impostas:
  - "Toda rota da Wiki entra sob src/routes/_authenticated/, nunca cria uma segunda fronteira de autenticação"
  - "O arquivo de rota da tela de edição nunca referencia src/content-components/read nem o renderer do ADR 007, em nenhuma forma de import (direta, relativa ou por alias), verificado por regra de ESLint com patterns/group (seção 6.7). Um módulo auxiliar futuro, fora do arquivo de rota, não está coberto por esta regra até o files do bloco ser estendido para incluí-lo"
  - "Toda escrita de rascunho passa por saveDraft com expectedVersion. DraftVersionConflictError sempre recarrega o rascunho do servidor antes de aceitar nova digitação, nunca é ignorado em silêncio"
  - "Toda submissão passa por submitRevision. RevisionConflictError bloqueia a tela até o autor escolher recarregar a partir da publicação atual ou cancelar, nunca prossegue sem essa escolha"
  - "Cor só por token CSS nas telas desta camada, mesma restrição da arquitetura base"
premissas_sobre_camadas_futuras:
  - camada: "Renderização (ADR 007)"
    premissa: "As rotas de leitura pública ficam fora de _authenticated, porque a publicação exige SSR e indexação que esta camada não usa"
  - camada: "Navegação e descoberta (ADR 008)"
    premissa: "Um link para editar uma página usa o caminho exato /projetos/:projectId/wiki/paginas/:pageId/editar publicado por este ADR, escopo fixado por DEC-0017"
  - camada: "Tenancy (ADR 013)"
    premissa: "Decide como um content.spaces é criado. Até essa decisão, a rota /wiki assume que ao menos um espaço já existe no workspace"
riscos_abertos:
  - "Nenhum ADR decide criação de content.spaces. content.workspace_members é semeado por trigger para o dono do workspace, mas nenhuma função pública cria um espaço. wiki.index fica sem ação de saída quando o workspace tem zero espaços. Dono: ADR 013 ou uma decisão de produto ainda não tomada"
  - "O debounce de 2 s de inatividade com envio forçado de 30 s é escolha informada por analogia ao padrão de 400 ms já em produção para posição de nó, sem medição de uso real de digitação de texto nesta camada. Ajuste é o gatilho de reabertura da seção 10"
  - "DraftVersionConflictError descarta a diferença entre o rascunho local e o do servidor sem oferecer merge, porque o ADR 003 já registra merge automático como gatilho de reabertura de outra camada, não desta"
gatilhos_de_reabertura:
  - "Produto exigir colaboração em tempo real na v1, reabrindo a decisão B da seção 4"
  - "ADR 013 decidir criação de espaço com uma tela dentro da própria Wiki, acrescentando fatia a esta camada"
  - "ADR 007 decidir que leitura publicada também exige sessão, eliminando a distinção de SSR da seção 6.6"
  - "Uso real mostrar que 2 s ou 30 s produzem perda de digitação ou carga excessiva de escrita no Postgres"
```

---

# Propostos vinculantes

Vazia em 2026-09-19. Os ADRs 002, 003 e 004 passaram para "Aceitos" quando o S-1 (ADR 005) passou. Seção mantida para o próximo ADR que precisar do mesmo mecanismo de contrato vinculante antes do aceite formal.

---

# Numeração oficial

| ADR | Camada | Estado |
| --- | --- | --- |
| 001 | Motor de diagrama | Aceito |
| 002 | Formato de conteúdo | Aceito |
| 003 | Armazenamento e versionamento | Aceito |
| 004 | Fluxo editorial | Aceito |
| 005 | Edição | Aceito |
| 006 | Shell da Wiki (caminho de escrita) | Aceito |
| 007 | Renderização | Não escrito |
| 008 | Navegação e descoberta | Não escrito |
| 009 | Busca | Não escrito |
| 010 | Exportação e sincronização | Não escrito |
| 011 | Publicação | Não escrito |
| 012 | Consolidação da stack | Não escrito |
| 013 | Tenancy e acesso (membros de workspace, convites) | Não escrito. Resolve C-3 e C-7 (`DEC-0005`) |
| 014 | Developer Portal (documentação arc42 como feature viva) | Não escrito (`DEC-0006`) |
| 015 | Notações do Diagram Studio | Não escrito |

---

# Conflitos em aberto

| # | Entre | Descrição | Dono da resolução |
| --- | --- | --- | --- |
| C-1 | 002 × 001 | O embed `dok:diagram/<uuid>?view=` admite `rev`, mas o modelo real do ADR 001 é mutável e sem histórico. `page_refs.target_rev_id` fica sempre `null`; toda resolução de diagrama é dinâmica, inclusive em revisões publicadas. Uma revisão aprovada pode mudar de aparência se o diagrama for editado depois | Extensão do ADR 001 (versionamento de diagramas). Gatilho já registrado no ADR 004 |
| C-2 | 002 × 001 / 007 / 010 | Todo destino de export precisa de SVG/PNG estático de uma view, fora do canvas interativo. Ninguém é dono da geração | ADR 007 (Renderização) decide; o ADR 010 consome. Se exigir mudança no motor, emenda ao ADR 001 |
| C-3 | 003 / 004 × plano | Os ADRs 003 e 004 pressupõem um "ADR de tenancy/auth": `public.invites` não tem `workspace_id`, e só o owner entra em `content.workspace_members` automaticamente. Não há como um segundo usuário entrar num workspace | Novo ADR de Tenancy e acesso — precisa de número |
| C-6 | Numeração | O ADR 002 manda "renderização **e navegação**" para o 007 (o plano tem Navegação no 008) e chama o ADR 003 de "ADR de persistência". A parte "diff visual para ADR 005/006" está resolvida: o ADR 005 (D-4) decidiu que `<RevisionDiff>` usa a fatia `read` do ADR 007, sem editor próprio de diff. A frase sobre `PROMPT-ADR-006.md` saiu em 2026-09-20: o arquivo nunca existiu neste repositório, e `git log --all` não devolve commit para ele (`DEC-0008`) | Corrigir as referências de renderização/navegação e de "ADR de persistência" na próxima revisão de 002 e 004, quando forem abertos por outro motivo |
| C-7 | 003 × base | `public.user_roles` (`admin`/`member`, global) convive com `content.space_members.role` (`admin`/`editor`/`reviewer`/`viewer`, por espaço). São escopos diferentes, mas nenhum ADR diz qual prevalece para ações fora da Wiki | ADR de Tenancy e acesso (C-3) |

# Premissas pendentes por camada destinatária

| Camada | Premissas recebidas (de) |
| --- | --- |
| Edição (005) | Aceito. Produz DokAST/DokMD sem perda nas 30 fixtures via adaptador (002), directives só de bloco. Diff textual e renderizado, indicador changes_requested, somente leitura (004). Comentário por faixa de linhas resolvido pelo ADR 005: a ancoragem acontece em `<RevisionView>`, fora do editor. O renderer da fatia `read` (ADR 007) emite `data-line-start`/`data-line-end` por bloco, e a seleção na visão de leitura vira faixa de linhas a partir desses atributos. Lacuna registrada com dono na fatia F5 do ADR 005: mapear comentário de uma revisão anterior para as linhas do rascunho atual, quando divergem. Modo sugestão fica fora da v1 (D-7 do escopo do 005) |
| Renderização (007) | As rotas de leitura pública ficam fora de `_authenticated`, porque a publicação exige SSR e indexação que o shell de escrita não usa (006). Renderiza DokAST sem MDX, resolve `dok:`, política de imagem externa (002); resolução dinâmica de diagrama até existir versionamento (004); exibe view em modo leitura (001); dono da geração estática de view (C-2); implementa a fatia `read` de `src/content-components` para todos os nomes do registro, com o renderer emitindo `data-line-start`/`data-line-end` por bloco, e é o único renderizador de DokAST do app (005) |
| Navegação e descoberta (008) | Um link para editar uma página usa o caminho exato `/projetos/:projectId/wiki/paginas/:pageId/editar` publicado pelo ADR 006, escopo fixado por `DEC-0017` |
| Tenancy e acesso (013) | Decide como um `content.spaces` é criado. Até essa decisão, a rota `/wiki` assume que ao menos um espaço já existe no workspace, e um workspace com zero espaços fica sem caminho de saída dentro da Wiki (006) |
| Busca (009) | Indexa `extractText` (002); só `pages.published_revision_id` na busca pública; rascunhos só no escopo do autor (003, 004) |
| Exportação (010) | Implementa a matriz do Apêndice B, escape de `{` e `<` no .mdx, datas vindas do banco (002); usa `content.sync_state` (003); só publicadas, rascunho só por ação manual do autor (004); implementa a fatia `export` de `src/content-components` para todos os nomes do registro (005) |
| Publicação (011) | Mesma barreira de `pages.published_revision_id` (004) |
| Motor de diagrama (001) | uuid estável de view e revisão, geração estática fora do canvas (002); consultar `page_refs` antes de excluir diagrama/view (003) |
| Colaboração futura | Yjs efêmero escrevendo em `page_drafts` sem mudar schema (003) |
