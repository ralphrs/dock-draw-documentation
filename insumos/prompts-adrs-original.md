# Prompts dos ADRs da engine de documentação do DokDraw

Um ADR por camada. Cada prompt é colado **junto com o Bloco 0** (contexto comum) e com os **contratos dos ADRs anteriores** (o `LEDGER.md`).

A compatibilidade entre ADRs não depende de memória nem de boa vontade. Ela é garantida por três mecanismos:

1. **Contrato de saída.** Todo ADR termina com um bloco YAML padronizado: o que decidiu, com quais versões, que interfaces publica, que restrições impõe às camadas seguintes e o que assume sobre elas.
2. **Ledger.** O `adr/LEDGER.md` acumula esses contratos. Cada ADR novo recebe o ledger como entrada obrigatória e o devolve atualizado.
3. **Checagem dupla de compatibilidade.** Cada ADR verifica as candidatas **para trás** (base e ADRs aceitos) e **para frente** (premissas que as camadas seguintes vão precisar). Depois de todos, o ADR 012 audita o conjunto inteiro.

---

## Ordem, dependências e numeração

| ADR | Camada | Depende de | Pode rodar em paralelo com |
| --- | --- | --- | --- |
| 001 | Motor de diagrama (já aceito: React Flow) | — | — |
| 002 | Formato de conteúdo | 001 | — |
| 003 | Armazenamento e versionamento | 002 | — |
| 004 | Fluxo editorial | 002, 003 | — |
| 005 | Edição | 002, 003, 004 | — |
| 006 | *(camada em produção — definir nome e dependências)* | — | — |
| 007 | Renderização | 002, 005 | — |
| 008 | Navegação e descoberta | 003, 007 | 009 |
| 009 | Busca | 002, 003, 004 | 008 |
| 010 | Exportação e sincronização | 002, 003, 004, 007 | 011 |
| 011 | Publicação | 004, 007, 008, 009 | 010 |
| 012 | Consolidação da stack | Todos | — |

> [!IMPORTANT]
> **Renumeração.** O rascunho atual `adr-002-biblioteca-wiki.md` deixa de ser o ADR 002. O conteúdo dele (matriz de editores, spike S1, avaliação de frameworks de docs e apps de wiki) vira **material de entrada** dos ADRs 005, 007 e 008. O novo ADR 002 é o de Formato de conteúdo.

> [!IMPORTANT]
> **Revisão de 2026-09-18 — o pipeline não é uma camada à parte.** O ADR 002 aceito já publica a API de parse, validação, normalização, serialização, extração de refs e texto (`parseDok`, `serializeDok`, `normalizeDok`, `validateDok`, `collectRefs`, `extractText`, `importDialect`, `migrateDok`), no módulo `src/content-format`, com a restrição "nenhuma camada parseia Markdown por conta própria". Por isso:
>
> - **Não existe ADR de Pipeline de conteúdo.** O que sobrava dele (onde o módulo roda, orçamento de desempenho, testes) entra como **Emenda 1 ao ADR 002** (prompt abaixo).
> - **ADR 007 = Renderização.** O **ADR 006 é outra camada**, em produção. Os textos dos ADRs 002 e 005 que chamam a renderização de "ADR 006" estão desatualizados e devem ser corrigidos na próxima revisão deles.
> - Onde este arquivo dizia "wiki-core", leia **`src/content-format` (ADR 002)**.

---

## Bloco 0 — Contexto comum (colar antes de qualquer prompt)

~~~~md
Você está escrevendo um ADR da engine de documentação do DokDraw. Responda em pt-BR; termos técnicos, nomes de pacotes e APIs em inglês. Entregue o ADR como arquivo Markdown puro (.md), com alertas GFM (> [!NOTE]), não callouts :::.

## Produto
DokDraw é uma plataforma de documentação técnica. A Wiki (estilo Confluence, escrita no dialeto do Starlight: frontmatter + :::note/:::tip/:::caution) é o produto principal. O Diagram Studio (C4, AWS, UML) existe para compor as páginas. A documentação precisa ser: um "segundo cérebro" (wikilinks, aliases, backlinks, compatível com Obsidian); exportável como .md, vault Obsidian, projeto Starlight e .docx; espelhável em nuvem por sincronização periódica de mão única (Google Drive primeiro; o Drive nunca é fonte de verdade); e, no futuro, ter pipeline de aprovação de edições (rascunho → revisão → aprovação → publicação). Na escolha de bibliotecas, o editor de páginas completo (inserção de elementos md/mdx, formatação, links) é o fator de maior peso.

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

## Grade de avaliação (a mesma em todos os ADRs)
N Nativo · P Plugin oficial · C Código próprio (estimar em dias) · X Contra a arquitetura · ? Verificar em spike.
Todo requisito tem uma coluna "Como verificar". Afirmação de README não é evidência: exija documentação, exemplo funcionando ou código-fonte.
Um X em eliminatório encerra a avaliação da candidata.

## Regras de compatibilidade (obrigatórias)
1. PARA TRÁS — base: toda candidata é conferida contra a arquitetura base acima. Conflito = eliminada.
2. PARA TRÁS — ADRs aceitos: toda candidata é conferida contra as "restricoes_impostas" e as "interfaces_publicadas" de cada contrato no LEDGER.md. Conflito = eliminada, a menos que o ADR proponha explicitamente reabrir o ADR anterior, com custo estimado e justificativa. Nunca contorne um contrato em silêncio.
3. PARA FRENTE: toda candidata é conferida contra as "premissas_sobre_camadas_futuras" do ledger e contra os requisitos das camadas seguintes listados no prompt. Uma escolha que inviabiliza uma camada futura é eliminada.
4. Licenças: auditar o pacote e as dependências transitivas. MIT/Apache-2/BSD/ISC passam. MPL-2.0 exige nota. GPL, AGPL, BSL e SSPL são eliminatórios para código embutido no produto.
5. O ADR termina com a seção "Verificação de compatibilidade" (tabela: contrato ou restrição × situação × evidência) e com o "Contrato de saída" no formato abaixo.

## Estrutura obrigatória do ADR
1. Cabeçalho (status, data, camada, depende de, decide, não decide)
2. Decisão (proposta primeiro, justificativa depois)
3. Contexto e entradas recebidas (resumo do ledger relevante)
4. Critérios: eliminatórios, importantes, desejáveis — cada um com "por que, neste projeto" e "como verificar"
5. Candidatas (versão, licença, data de verificação, link)
6. Avaliação (matriz N/P/C/X/?, e ponderação quando houver pesos)
7. Verificação de compatibilidade (para trás e para frente)
8. Spike, se houver "?" em eliminatório: testes, critério de aprovação e regra de desempate
9. Consequências (positivas, negativas, reversibilidade)
10. Gatilhos de reabertura
11. Fatias de implementação, em ordem de dependência, com critério de pronto
12. Fora de escopo (e para qual ADR foi)
13. Contrato de saída (YAML) + atualização do LEDGER.md

## Formato do contrato de saída
```yaml
adr: "00X"
camada: ""
status: "Proposto | Aceito"
data: "AAAA-MM-DD"
decisao: ""                  # uma frase
dependencias:                # pacotes que esta decisão adiciona
  - pacote: ""
    versao: ""               # faixa semver fixada
    licenca: ""
    verificado_em: ""        # data + link
interfaces_publicadas:       # o que as outras camadas podem usar
  - nome: ""
    tipo: "tipo TS | tabela | função | formato | evento"
    descricao: ""
restricoes_impostas:         # o que as camadas seguintes são obrigadas a respeitar
  - ""
premissas_sobre_camadas_futuras:  # o que esta decisão assume que outra camada vai entregar
  - camada: ""
    premissa: ""
riscos_abertos:
  - ""
gatilhos_de_reabertura:
  - ""
```
~~~~

---

## Template do LEDGER.md

~~~~md
# LEDGER — Contratos dos ADRs da engine de documentação

Atualizado a cada ADR aceito. É entrada obrigatória de todo ADR novo.

## Arquitetura base
(copiar do Bloco 0)

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

## ADR 002 — (a preencher)
...

## Conflitos em aberto
| Entre | Descrição | Dono da resolução |
| --- | --- | --- |
~~~~

---

## Prompt — ADR 002: Formato de conteúdo (Content Format)

~~~~md
[Colar o Bloco 0 antes deste prompt. Anexar: LEDGER.md; adr-002-biblioteca-wiki.md (rascunho antigo, como material de entrada).]

# Tarefa
Escreva o ADR 002 — Formato de conteúdo. É a decisão menos reversível da engine: se estiver errada, obriga a migrar o conteúdo de todos os clientes. Decida o dialeto em que as páginas são escritas e armazenadas, e a árvore sintática (AST) que todas as outras camadas vão consumir.

# Perguntas que o ADR precisa responder
1. Dialeto base: CommonMark + GFM? Com directives (remark-directive)? Com subconjunto de MDX (JSX sem expressões, imports e exports)? MDX completo? Markdoc?
2. Sintaxe de componentes: directive (::diagram{...}, :::tabs) ou JSX (<Tabs>)? Os dois? Qual é o canônico e qual é só aceito na entrada?
3. Sintaxe de callouts: :::note (Starlight) como canônico; como tratar > [!NOTE] (GitHub/Obsidian) na entrada?
4. Links internos: por id estável (ex.: [texto](dok:page/<uuid>)) ou wikilink [[Título]]? Como o editor exibe e como cada destino de exportação reescreve?
5. Embed de diagrama: sintaxe, campos obrigatórios (id, view, título), fallback de texto. Registrar a troca de [[diagram:Título]] (colide com wikilink do Obsidian e quebra ao renomear).
6. Imagens e anexos: referência por id de asset (ex.: dok:asset/<uuid>)?
7. Schema do frontmatter: campos obrigatórios e opcionais (id, title, description, tags, aliases, datas), tipos, validação.
8. AST oficial: mdast + quais extensões (mdast-util-directive, mdast-util-mdx-jsx, mdast-util-frontmatter, mdast-util-gfm)?
9. Regras de round-trip e normalização: o que pode mudar entre entrada e saída (ex.: marcador de lista), o que nunca pode.
10. Política de segurança do formato: o que é recusado ou escapado (HTML cru, expressões {}, import/export).
11. Versionamento do próprio formato (campo de versão no frontmatter? migrações?).

# Candidatas iniciais (pesquisar outras)
CommonMark+GFM+directives · subconjunto de MDX · MDX completo · Markdoc (o Starlight tem integração oficial) · Obsidian Flavored Markdown · combinação canônico + dialetos aceitos na entrada.

# Eliminatórios específicos
- F-01 Não exige avaliação de código para renderizar.
- F-02 Round-trip determinístico: serialize(parse(x)) estável em fixtures.
- F-03 Traduzível sem perda de significado para: Starlight (.mdx), vault Obsidian, Markdown GFM universal e .docx. Montar a matriz formato × destino.
- F-04 Parseável por uma AST com ecossistema maduro e licença permissiva.

# Checagem para frente (obrigatória)
- Edição (ADR 005): o formato precisa ser editável por pelo menos DUAS das candidatas a editor (MDXEditor, Plate, Milkdown, Tiptap). Mostrar como cada uma representaria callout, componente, link interno e diagrama.
- Fluxo editorial (ADR 004): o formato precisa gerar diff legível entre duas revisões, em texto.
- Busca (ADR 009): o texto indexável precisa ser extraível da AST sem render.
- Exportação (ADR 010): cada construção do formato precisa ter tradução definida para cada perfil de export.

# Entregáveis extras
- Especificação curta do dialeto, com exemplos de cada construção.
- 30 fixtures de referência (o mesmo conjunto será usado nos spikes dos ADRs 005 e 006).
- Matriz construção × destino (Starlight, Obsidian, GFM, .docx), com a tradução de cada uma.

# Contrato de saída esperado (mínimo)
interfaces_publicadas: gramática do dialeto; lista de tipos de nó da AST; schema do frontmatter (Zod); esquema de URIs internas (dok:page, dok:asset, diagram).
restricoes_impostas: todo produtor e consumidor de conteúdo usa essa AST; nenhuma camada avalia código; links e embeds são por id.
premissas: o editor serializa exatamente nesse dialeto; o pipeline valida o dialeto no save.
~~~~

---

## Prompt — ADR 003: Armazenamento e versionamento (Content Store & Versioning)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md com o contrato do ADR 002; o schema atual do Supabase do app Lovable (arquivo de types ou migrations) — se não estiver disponível, peça antes de propor tabelas.]

# Tarefa
Escreva o ADR 003 — Armazenamento e versionamento. Decida onde páginas, revisões, espaços e assets moram, e como o histórico é mantido. O modelo precisa suportar, SEM MIGRAÇÃO FUTURA, o fluxo de aprovação (ADR 004) e não pode impedir colaboração em tempo real mais adiante.

# Perguntas que o ADR precisa responder
1. Modelo de revisões: append-only (page_revisions imutáveis + ponteiro para a publicada)? Event sourcing? Snapshot + deltas?
2. O que se guarda: o texto no dialeto do ADR 002 (recomendação inicial) ou a AST em JSONB? Justificar pela portabilidade, diff, busca e tamanho.
3. Rascunhos: um rascunho por autor por página? Branches nomeados? Como conciliar dois rascunhos concorrentes?
4. Espaços, hierarquia de páginas (árvore), ordenação, slugs, renomear sem quebrar links (ids estáveis do ADR 002).
5. Tabelas derivadas: links/backlinks, índice de busca, estado de sync — o que é derivado no save e o que é calculado sob demanda.
6. Assets: Supabase Storage (buckets, privados, URLs assinadas), limites de tamanho por plano, relação asset ↔ revisão.
7. Relação página ↔ diagrama (modelo do ADR 001): referência por id, integridade ao excluir.
8. Multi-inquilino: isolamento por workspace, RLS por espaço e por papel, soft delete, lixeira, retenção.
9. Concorrência: bloqueio otimista (versão), conflito de save.
10. Alternativas completas a comparar: Postgres puro; Git como store (kit docs-as-code); híbrido Postgres + espelho Git; armazenamento de documento CRDT (Yjs) com snapshot em Markdown.

# Eliminatórios específicos
- A-01 Suporta os estados do fluxo editorial sem mudar o schema das revisões.
- A-02 Toda revisão publicada é reconstituível byte a byte (auditoria e export).
- A-03 RLS aplicável em todas as tabelas de conteúdo.
- A-04 Funciona no Supabase gerenciado, sem extensão que o plano não ofereça.

# Checagem para frente
- Fluxo editorial (ADR 004): estados, papéis e comentários ancorados cabem no modelo?
- Busca (ADR 009): há onde indexar só revisões publicadas e, para o autor, os próprios rascunhos?
- Export e sync (ADR 010): há onde guardar o estado de sincronização (id do arquivo remoto, hash, data)?
- Colaboração futura: o modelo impede Yjs depois? Se sim, documentar o custo.

# Entregáveis extras
- DDL proposto (tabelas, índices, políticas RLS) em SQL legível, marcado como proposta.
- Diagrama de entidades (Mermaid).
- Assinaturas das server functions de leitura e escrita (tipos TS).

# Contrato de saída esperado (mínimo)
interfaces_publicadas: tabelas e invariantes; tipos TS de Page, Revision e Space; server functions de CRUD de revisão.
restricoes_impostas: toda escrita de conteúdo cria revisão; nada lê rascunho alheio fora do fluxo; assets só por id.
premissas: o fluxo editorial define as transições; a busca indexa a partir das revisões.
~~~~

---

## Prompt — ADR 004: Fluxo editorial (Editorial Workflow)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 e 003.]

# Tarefa
Escreva o ADR 004 — Fluxo editorial. Decida como uma edição vai de rascunho a publicada, quem pode fazer cada transição e o que o revisor vê. A implementação completa pode vir depois; o ADR precisa fixar agora o que afeta as outras camadas.

# Perguntas que o ADR precisa responder
1. Máquina de estados: rascunho → em revisão → aprovada → publicada; rejeitada → rascunho; outras? Publicação direta para quem tem permissão?
2. Papéis por espaço: leitor, autor, revisor, publicador, admin. Como mapeiam para RLS (ADR 003)?
3. Política por espaço: aprovação obrigatória ou opcional; número mínimo de aprovadores; autoaprovação proibida?
4. Revisão: diff em texto (Markdown), diff renderizado (lado a lado) ou os dois? Comentários ancorados em trecho? Sugestões de edição inline (suggestion mode)?
5. Diagramas: como revisar mudança de diagrama referenciado (versão do diagrama presa à revisão da página ou sempre a atual)?
6. Notificações (no app, e-mail) e trilha de auditoria.
7. Alternativas a comparar: máquina de estados própria em Postgres; biblioteca de state machine (ex.: XState) no servidor; GitHub PR (kit docs-as-code); serviços de comentários/colaboração terceirizados (avaliar licença e lock-in).

# Eliminatórios específicos
- W-01 Estados e transições validados no servidor (server functions + RLS), nunca só na UI.
- W-02 Não exige que o cliente final tenha conta em serviço de terceiros (ex.: GitHub).
- W-03 Auditoria imutável de quem fez cada transição.

# Checagem para frente
- Edição (ADR 005): que capacidades o editor PRECISA ter por causa deste fluxo (visualização de diff contra a versão publicada, modo sugestão, comentários ancorados, modo somente leitura)? Esta lista vira eliminatório ou importante no ADR 005.
- Busca (ADR 009) e Publicação (ADR 011): o que é visível em cada estado.
- Exportação (ADR 010): exporta só publicadas? Rascunho pode ser exportado pelo autor?

# Contrato de saída esperado (mínimo)
interfaces_publicadas: enum de estados; tabela de transições com papel exigido; eventos emitidos (para notificações e sync).
restricoes_impostas: só revisões publicadas aparecem para leitores, na busca pública, na publicação e no sync (salvo decisão diferente registrada).
premissas: o editor oferece visualização de diff; o armazenamento guarda comentários ancorados por revisão.
~~~~

---

## Prompt — ADR 005: Edição (Authoring)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002, 003 e 004; adr-002-biblioteca-wiki.md (rascunho antigo com a matriz de editores e o spike S1); as 30 fixtures do ADR 002.]

# Tarefa
Escreva o ADR 005 — Edição. É o critério de maior peso do produto: o editor de páginas completo, com inserção de elementos md/mdx, formatação, links e as capacidades exigidas pelo fluxo editorial. Parta da matriz do rascunho antigo, mas refaça a avaliação à luz dos contratos 002, 003 e 004: o editor precisa serializar EXATAMENTE no dialeto do ADR 002.

# Perguntas que o ADR precisa responder
1. Qual biblioteca de editor e em qual versão?
2. Como cada construção do dialeto (callouts, componentes, link interno com autocomplete, embed de diagrama, imagem por asset id, frontmatter) é inserida, editada e serializada?
3. Como o editor atende o fluxo editorial: diff contra a versão publicada, modo somente leitura, comentários ou sugestões (se o ADR 004 exigir)?
4. Modo fonte (Markdown cru) e alternância sem perda.
5. Registry de nós customizados: interface para registrar nós novos (diagrama hoje; outros depois) sem acoplar a definição ao editor.
6. Integração: rota lazy no TanStack Start, SSR (só-cliente?), tokens de tema, convivência com portais Radix.

# Pesos (manter do rascunho, ajustando se o ADR 004 acrescentar requisitos)
P1 fidelidade ao dialeto e inserção de elementos 40% · P2 formatação, links e ergonomia 20% · P3 integração com a stack 20% · P4 capacidades do fluxo editorial 10% · P5 sustentabilidade (licença, mantenedores, colaboração futura) 10%.

# Candidatas iniciais
MDXEditor · Plate · Milkdown · Tiptap 3 (+ @tiptap/markdown) · BlockNote (conferir licença dos pacotes XL) · CodeMirror 6 (modo fonte). Pesquisar lançamentos novos.

# Eliminatórios específicos
- E-01 Round-trip das 30 fixtures do ADR 002 (mínimo 28/30, divergências só de normalização permitida pelo ADR 002).
- E-02 Nenhum caminho que avalie o conteúdo como código.
- E-03 Licença permissiva, incluindo os pacotes necessários para as funções exigidas.
- E-04 Consegue produzir/consumir a AST do ADR 002 ou uma que converte para ela sem perda.

# Spike obrigatório
Reaproveitar o S1 do rascunho (8 testes), acrescentando: diff contra a revisão publicada (se exigido pelo ADR 004) e serialização exata de cada construção do dialeto.

# Checagem para frente
- Formato (ADR 002, `src/content-format`): o editor usa ou é compatível com o mesmo parser/AST? Se o editor tiver parser próprio, documentar a camada de conversão e o risco de divergência.
- Renderização (ADR 007): o que se vê no editor e o que se vê na leitura saem do mesmo registry de componentes?

# Contrato de saída esperado (mínimo)
interfaces_publicadas: componente <PageEditor> (props e eventos); interface do registry de nós customizados; formato de saída (texto no dialeto 002).
restricoes_impostas: toda escrita passa pelo serializador do editor ou do pipeline, nunca por concatenação de string.
premissas: o pipeline valida no save o que o editor produz; o renderer resolve os mesmos componentes do registry.
~~~~

---

## Prompt — Emenda 1 ao ADR 002: execução, desempenho e testes do `src/content-format`

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md atualizado; ADR-002 aceito; ADR-005 aceito.]

# Tarefa
Escreva a Emenda 1 ao ADR 002. Não reabra nenhuma decisão do ADR 002: a gramática, a AST, a API e as dependências continuam como estão. A emenda só acrescenta o que o ADR não fixou sobre o módulo `src/content-format`.

# Perguntas
1. Ambientes de execução: navegador, server functions do TanStack Start e jobs agendados (sync do ADR 010). O mesmo código ESM roda nos três? Há API que depende de DOM ou de Node? Como garantir isso (ex.: teste em ambiente sem DOM, lint de imports)?
2. Orçamento de desempenho: parse + validate + serialize de uma página de 5 mil linhas, no cliente e no servidor. Definir limite (ms) e como medir.
3. Tamanho máximo de página aceito no save e o que acontece acima dele.
4. Estratégia de testes: as 30 fixtures do ADR 002 como suíte de regressão compartilhada (Vitest, sem DOM), usada também pelo ADR 005 (editor) e pelo ADR 007 (renderização).
5. Funções que camadas futuras vão pedir e que o ADR 002 ainda não publica (ex.: `toProfile` para o ADR 010). Registrar como "a acrescentar pela camada consumidora", sem implementar agora.

# Saída
Seção "Emenda 1" anexada ao ADR 002 e bloco YAML de contrato **complementar** (só os campos novos) para o LEDGER.md.
~~~~

---

## Prompt — ADR 007: Renderização (Rendering)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 005 (e 003/004, se já aceitos); ADR-002 e ADR-005 aceitos; adr-002-biblioteca-wiki.md como material de pesquisa.]

# Tarefa
Escreva o ADR 007 — Renderização. Decida como a AST do ADR 002 (obtida só via `src/content-format`) vira tela na leitura: renderer mdast → React/hast, registry de componentes compartilhado com o editor do ADR 005, destaque de código, matemática, embed e preview de diagrama, política de imagem externa e temas por token. Os itens que o ADR 002 mandou para cá na tabela "Fora de escopo" são obrigatórios.

# Perguntas que o ADR precisa responder
1. Renderer: mdast/hast → React próprio · hast-util-to-jsx-runtime · react-markdown · rehype-react. SSR no TanStack Start.
2. Registry de componentes: o MESMO usado pelo editor (ADR 005)? Como um componente declara sua versão de leitura e de edição?
3. Destaque de código: Shiki · Expressive Code (usado pelo Starlight) · Prism. Tema por token, dark/light, custo em SSR e bundle.
4. Matemática (KaTeX?) e Mermaid: entram agora ou ficam como desejáveis?
5. Embed de diagrama: React Flow em modo leitura, SVG estático pré-renderizado ou os dois (SVG no SSR, interativo no cliente)? Coerência com o ADR 001.
6. Âncoras de heading estáveis (TOC, links profundos).
7. Acessibilidade e prefers-reduced-motion.

# Eliminatórios específicos
- R-01 Não avalia código; componentes só do registry.
- R-02 Cores 100% por token, igual em .theme-dark e .theme-light.
- R-03 Renderiza no servidor sem erro de hidratação.

# Checagem para frente
- Navegação (008): gera TOC e âncoras de que ela precisa?
- Publicação (011): o mesmo renderer serve a rota pública?
- Exportação (010): componentes têm representação em Markdown puro para os perfis de export (padrão "render para Markdown")?

# Contrato de saída esperado (mínimo)
interfaces_publicadas: <PageView>; interface do registry (leitura/edição/markdown); tema de código por token.
restricoes_impostas: todo componente novo implementa as três representações (leitura, edição, markdown).
premissas: navegação consome headings/âncoras gerados aqui.
~~~~

---

## Prompt — ADR 008: Navegação e descoberta (Navigation & Discovery)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 007.]

# Tarefa
Escreva o ADR 008 — Navegação e descoberta. Decida como o leitor se orienta: árvore de espaços e páginas, TOC, breadcrumbs, página anterior/próxima, tags, backlinks e visão em grafo.

# Perguntas que o ADR precisa responder
1. Própria ou com biblioteca (ex.: fumadocs-core headless)? Avaliar acoplamento ao modelo de dados do ADR 003.
2. Árvore: carregamento (tudo, preguiçoso por espaço), ordenação manual, arrastar para reordenar, permissões (só o que o usuário pode ver).
3. TOC a partir das âncoras do ADR 007; realce da seção ativa; acessível por teclado.
4. Backlinks e "páginas relacionadas" a partir das tabelas derivadas (ADR 002/003).
5. Visão em grafo (segundo cérebro): biblioteca candidata, licença, peso, render em SVG com tokens (coerência com o design system), respeito a prefers-reduced-motion.
6. Tags e aliases (frontmatter do ADR 002).

# Eliminatórios específicos
- N-01 Respeita RLS: nada aparece na árvore sem permissão de leitura.
- N-02 Cores por token; operável por teclado.

# Checagem para frente
- Publicação (011): a mesma navegação serve a wiki pública?
- Busca (009): onde a busca entra na UI de navegação?

# Contrato de saída esperado (mínimo)
interfaces_publicadas: componentes <SpaceTree>, <PageToc>, <Backlinks>, <GraphView> (se aprovado); consultas de árvore.
restricoes_impostas: ordenação e hierarquia vêm do armazenamento, não do frontmatter (ou o contrário — decidir e registrar).
~~~~

---

## Prompt — ADR 009: Busca (Search)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 006 (e 008, se já aceito).]

# Tarefa
Escreva o ADR 009 — Busca. Decida como o usuário encontra conteúdo, respeitando permissões e o estado editorial.

# Perguntas que o ADR precisa responder
1. Motor: Postgres full-text (configuração portuguese, unaccent, pg_trgm) · busca híbrida com pgvector · Orama no cliente · Meilisearch/Typesense auto-hospedados · serviço gerenciado.
2. Permissões: a busca respeita RLS e o estado editorial (leitores só veem publicadas; autores veem os próprios rascunhos)? Como, em cada motor?
3. O que é indexado: título, texto extraído por `extractText` (ADR 002), headings, tags, aliases, nomes de elementos de diagrama?
4. Idioma: pt-BR primeiro; multi-idioma depois.
5. Atualização do índice: no save (trigger), em fila, por job?
6. Busca semântica: agora ou depois? Custo de embeddings e onde rodam.
7. UI: paleta de comandos (cmdk já está na stack?) — conferir e reaproveitar.

# Eliminatórios específicos
- B-01 Nunca retorna conteúdo que o usuário não pode ler.
- B-02 Roda na infraestrutura do Supabase ou num serviço com licença e custo aceitáveis; sem copyleft embutido.

# Contrato de saída esperado (mínimo)
interfaces_publicadas: server function de busca (tipos); tabela/índice; gatilho de reindexação.
restricoes_impostas: toda mudança de estado editorial reindexa.
~~~~

---

## Prompt — ADR 010: Exportação e sincronização (Export & Sync)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 007; o trecho de exportação e sync do rascunho antigo do ADR 002 (perfis, destinos, sync periódico do Drive).]

# Tarefa
Escreva o ADR 010 — Exportação e sincronização. Decida como o conteúdo sai do DokDraw: perfis de export (Markdown universal, vault Obsidian, projeto Starlight, .docx) e destinos (download, pasta local, Google Drive, depois OneDrive e Dropbox). O Google Drive é espelho por sincronização periódica de mão única; nunca é fonte de verdade nem é lido de volta.

# Perguntas que o ADR precisa responder
1. Perfis: a tradução de cada construção do ADR 002 para cada perfil (usar a matriz do ADR 002). Implementação sobre `src/content-format` (ADR 002); se precisar de `toProfile`, acrescentá-la como emenda ao ADR 002, não como parser paralelo.
2. .docx: biblioteca (ex.: docx), mapeador próprio de AST → Word, estilos nomeados derivados dos tokens; Pandoc como plano B (GPL: só isolado no servidor, com análise jurídica).
3. Diagramas no export: SVG/PNG gerados de onde (ADR 007)? Sidecar .dokdraw.json no vault Obsidian?
4. Zip: biblioteca e licença.
5. Pasta local: File System Access API (Chromium) e fallback de zip.
6. Sync periódico: onde roda o job (pg_cron, Supabase Edge Functions agendadas, server functions + cron externo); envio só do delta (updated_at + hash); tabela de estado de sync (ADR 003); tokens OAuth no servidor; escopo drive.file; conflito quando o arquivo foi editado no Drive; exclusão vai para a lixeira; retry com backoff.
7. O que é exportado e sincronizado: só revisões publicadas (ADR 004)? Rascunhos pelo autor?

# Eliminatórios específicos
- X-01 Export e sync usam `src/content-format` (ADR 002), nunca parse próprio.
- X-02 Nenhum componente GPL embutido no produto.
- X-03 O sync nunca sobrescreve em silêncio um arquivo editado no destino.

# Contrato de saída esperado (mínimo)
interfaces_publicadas: interfaces ExportProfile, ExportTarget (sob demanda) e SyncTarget (agendado); tabela de estado de sync.
restricoes_impostas: todo componente do registry tem representação em cada perfil ou fallback documentado.
~~~~

---

## Prompt — ADR 011: Publicação (Publishing)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 010.]

# Tarefa
Escreva o ADR 011 — Publicação. Decida como uma wiki (ou um espaço) vira site público: rotas, SEO, domínio próprio, cache e busca pública.

# Perguntas que o ADR precisa responder
1. Estratégia: rotas públicas no próprio app TanStack Start (SSR/prerender, reaproveitando os ADRs 007 e 008) · build estático gerado pelo perfil Starlight do ADR 010 e hospedado · fumadocs-core headless · combinação.
2. Só revisões publicadas (ADR 004). Invalidação de cache ao publicar.
3. SEO: metadados do frontmatter, sitemap, Open Graph, canonical.
4. Domínio próprio por workspace, HTTPS, multi-inquilino.
5. Busca pública (ADR 009) e analytics (respeitando privacidade).
6. Visibilidade: espaço inteiro público, páginas selecionadas, link secreto?
7. Tema do site público: tokens do DokDraw; design system trocável por cliente.

# Eliminatórios específicos
- U-01 Nada não publicado vaza para a rota pública, cache ou sitemap.
- U-02 Reaproveita renderer e navegação decididos; não cria um segundo pipeline.

# Contrato de saída esperado (mínimo)
interfaces_publicadas: rotas públicas; política de cache; configuração de publicação por espaço.
~~~~

---

## Prompt — ADR 012: Consolidação da stack (auditoria de compatibilidade)

~~~~md
[Colar o Bloco 0. Anexar: LEDGER.md completo; todos os ADRs 001 a 011.]

# Tarefa
Escreva o ADR 012 — Consolidação da stack de documentação. Não escolha tecnologia nova. Audite se as escolhas isoladas formam um sistema coerente com a arquitetura base, e aponte o que precisa ser reaberto.

# O que o ADR precisa conter
1. Tabela da stack final: camada × tecnologia × versão × licença × ADR.
2. Matriz de compatibilidade N×N entre as tecnologias escolhidas: mesma AST? mesmas versões de React/Vite/TS? mesmo registry de componentes? conflitos de peerDependencies? duplicação de parser (ex.: dois parsers Markdown diferentes no bundle)?
3. Verificação de cada "premissa_sobre_camadas_futuras" do ledger: foi cumprida pela camada destinatária? Evidência.
4. Verificação de cada "restricao_imposta": alguma camada posterior a violou?
5. Auditoria de licenças da árvore inteira de dependências.
6. Orçamento de bundle por rota (Landing, Wiki leitura, Wiki edição, Studio) e o que é carregado sob demanda.
7. Fluxo ponta a ponta, em diagrama de sequência (Mermaid): escrever → salvar → validar → revisar → aprovar → publicar → indexar → exportar/sincronizar. Cada passo com a camada e a interface responsável.
8. Lacunas: requisitos do produto (Bloco 0) que nenhuma camada cobre.
9. Lista de reaberturas, se houver: qual ADR, por quê, custo, prioridade.
10. Plano de implementação consolidado em fatias, ordenado por dependência entre camadas, com critério de pronto.

# Critério de pronto
Nenhuma premissa sem dono, nenhuma restrição violada sem reabertura registrada, nenhuma licença eliminatória na árvore, e o fluxo ponta a ponta sem passo órfão.
~~~~

---

## Checklist de uso (a cada ADR)

1. Colar **Bloco 0** + prompt do ADR + anexos listados no próprio prompt.
2. Conferir que o ADR entregue tem a seção **Verificação de compatibilidade** preenchida contra **todo** o ledger, e não só contra o ADR anterior.
3. Se o ADR propuser reabrir outro, **pare** e decida a reabertura antes de aceitar.
4. Copiar o **Contrato de saída** para o `LEDGER.md` e mudar o status para Aceito.
5. Só então passar para o próximo ADR da ordem.
