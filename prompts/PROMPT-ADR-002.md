# Prompt — ADR 002: Formato de conteúdo (Content Format)

> [!NOTE]
> Prompt já executado. O ADR está em `adrs/`. Mantido só como histórico.

[Colar o Bloco 0 antes deste prompt. Anexar: LEDGER.md; insumos/pesquisa-editores-wiki.md (rascunho antigo, como material de entrada).]

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
