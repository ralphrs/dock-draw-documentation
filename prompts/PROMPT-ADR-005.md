# Prompt — ADR 005: Edição (Authoring)

[Anexar: LEDGER.md (versão de 2026-09-19, com os contratos 002, 003 e 004 na seção "Propostos vinculantes"); ADR-002-formato-de-conteudo.md (inclui o spike S-1 na seção 8.2, as fixtures no Apêndice C e a matriz no Apêndice B); ADR-004-fluxo-editorial.md; insumos/pesquisa-editores-wiki.md (rascunho antigo, só como material de pesquisa).]

# Tarefa

Escreva o ADR 005 — Edição. É o critério de maior peso do produto: o editor de páginas completo, com inserção de elementos, formatação, links e as capacidades exigidas pelo fluxo editorial. O editor precisa produzir **exatamente DokMD v1** (ADR 002): CommonMark + GFM + frontmatter + directives **só de bloco**, referências por URI `dok:`, e todo save passa por `normalizeDok` + `validateDok` no servidor.

Os contratos 002, 003 e 004 estão Propostos, mas são **vinculantes** para este ADR (ver a regra no topo do LEDGER). Não os contorne; se algum for inviável para todos os editores, proponha a reabertura explicitamente.

# O spike S-1 é compartilhado

O spike S-1 definido no ADR 002 (seção 8.2) serve a dois fins: aceitar o ADR 002 e escolher o editor deste ADR. **Não crie um spike diferente para os mesmos testes.** Este ADR executa o S-1 como definido lá e acrescenta os testes E-10 a E-13 abaixo, que vêm do ADR 004.

# Perguntas que o ADR precisa responder

1. Qual biblioteca de editor e em qual versão?
2. Como cada construção do DokMD v1 é inserida, editada e serializada: callouts (`:::note` etc.), directives de bloco registradas (Apêndice A.3 do ADR 002), link interno `dok:page/<uuid>` com autocomplete de página, link pendente `dok:page/new?title=`, embed `::diagram{src="dok:diagram/<uuid>?view=<uuid>"}`, imagem/anexo `dok:asset/<uuid>`, frontmatter (`dok`, `id`, `title`, opcionais)?
3. Como o editor **impede** o que o DokMD proíbe: text directives (`palavra:palavra` não pode virar diretiva), HTML, JSX, atributos fora do registro, estilo no conteúdo?
4. Como a entrada de dialetos (colar MDX, wikilink, alerts GFM/Obsidian, `[[diagram:Título]]` legado) passa por `importDialect` do ADR 002, em vez de parser próprio do editor?
5. Capacidades do fluxo editorial (premissa do ADR 004 para esta camada): diff textual **e** diff renderizado contra `pages.published_revision_id`; comentário ancorado por **faixa de linhas do texto canônico** da revisão; indicador de revisão em `changes_requested`; modo somente leitura; decisão explícita sobre modo sugestão (entra, fica para depois, ou nunca).
6. Mapeamento seleção visual ↔ faixa de linhas do DokMD canônico (necessário para o comentário ancorado): como obter, e se sobrevive ao `normalizeDok`.
7. Modo fonte (DokMD cru) e alternância sem perda.
8. Registry de nós customizados: interface para registrar nós (diagrama hoje) com representação de edição, **compartilhado com a Renderização (ADR 007)**, que vai declarar as representações de leitura e de Markdown. Sem acoplar a definição do nó à biblioteca do editor.
9. Integração: rota lazy no TanStack Start, só-cliente se preciso, tokens de tema, portais Radix, `prefers-reduced-motion`.
10. Rascunho: como o editor grava em `page_drafts` (autosave, `based_on_revision_id`, conflito detectado — ADR 003) e chama `submitRevision`.

# Pesos

P1 fidelidade ao DokMD v1 e inserção de elementos 40% · P2 formatação, links e ergonomia 20% · P3 integração com a stack 20% · P4 capacidades do fluxo editorial (ADR 004) 10% · P5 sustentabilidade 10%.

# Candidatas

Finalistas do ADR 002: **MDXEditor** e **Plate**. Reserva: **Milkdown**. Reavaliar também Tiptap 3 (+ `@tiptap/markdown`) e BlockNote apenas para registrar a eliminação com evidência atual. CodeMirror 6 para o modo fonte. Pesquisar lançamentos novos desde 2026-09-18.

Riscos já conhecidos (do contrato do ADR 002), que precisam de resposta com evidência:
- MDXEditor registra text directives por padrão; precisa aceitar a extensão só de bloco.
- Plate perde a serialização MDX nativa; componentes como directives exigem regras próprias no `@platejs/markdown`.
- Tiptap usa marked, não mdast; exigiria conversor próprio.

# Eliminatórios

- E-01 **Teste 1 do S-1: 30/30.** Carregar cada `expected.md` e cada entrada `canonical` das fixtures; inserir e apagar um caractere; salvar via `normalizeDok`; o resultado é idêntico ao `expected.md` nas 30. (Substitui o antigo 28/30.)
- E-02 **Teste 3 do S-1.** No modo fonte, digitar `<Tabs>` e `<script>`: o save retorna DOK-E002. Digitar `Hora:agora` num parágrafo: não cria diretiva.
- E-03 **Teste 4 do S-1.** Inserir diagrama pela UI gera exatamente a forma da fixture 23; a fixture 25 migra o legado.
- E-04 Nenhum caminho avalia conteúdo como código.
- E-05 Licença permissiva, incluindo os pacotes necessários para as funções exigidas (auditar transitivas).
- E-06 Produz/consome mdast compatível com a DokAST, ou converte sem perda comprovada pelas fixtures.
- E-07 Rota do editor carregada sob demanda no TanStack Start, sem erro de hidratação.

# Importantes (vindos do ADR 004)

- E-10 Diff textual contra a revisão publicada.
- E-11 Diff renderizado contra a revisão publicada.
- E-12 Comentário ancorado por faixa de linhas do DokMD canônico.
- E-13 Modo somente leitura e indicador de `changes_requested`.

Se nenhuma candidata atingir E-12 de forma nativa ou com código próprio razoável (estimar em dias), registre como conflito com o ADR 004 e proponha a alternativa (ex.: comentários só no modo fonte ou no diff), em vez de rebaixar o requisito em silêncio.

# Demais testes do S-1

Testes 2, 5, 6, 7 e 8 como no rascunho antigo; o teste 2 compara com a fixture 16.

# Checagem para frente

- Renderização (ADR 007): o registry de nós é o mesmo; o diff renderizado usa o renderer do 007 ou um próprio? Não pode haver dois renderizadores de DokAST.
- Exportação (ADR 010): nada que o editor produza pode ficar fora da matriz do Apêndice B do ADR 002.
- Colaboração futura (ADR 003): a escolha impede Yjs escrevendo em `page_drafts`?

# Contrato de saída esperado (mínimo)

interfaces_publicadas: componente `<PageEditor>` (props e eventos); interface do registry de nós (representação de edição); API de ancoragem seleção ↔ faixa de linhas; componente de diff (ou a decisão de delegá-lo ao ADR 007).
restricoes_impostas: toda escrita passa por `normalizeDok` + `validateDok`; o editor nunca parseia dialetos de entrada por conta própria (usa `importDialect`); nenhum nó pode serializar text directive.
premissas: a Renderização (007) implementa as representações de leitura e de Markdown do mesmo registry.

# Ao terminar

Se o S-1 passar para o candidato escolhido, registre no ADR que o **ADR 002 pode ser aceito** e, com ele, os ADRs 003 e 004. Proponha o diff do LEDGER movendo os quatro para "Aceitos".
