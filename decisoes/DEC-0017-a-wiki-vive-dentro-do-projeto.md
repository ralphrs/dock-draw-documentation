# DEC-0017: a wiki vive dentro do projeto, e isso reabre o ADR 006

**Data:** 2026-09-20
**Quem decidiu:** humano, escolhendo entre três desenhos de rota apresentados pela sessão A
**Alcance:** hierarquia da navegação da wiki, rotas do ADR 006, premissa do ADR 008, prioridade da `DDP-114`

## O problema

Dois documentos aceitos discordam sobre onde a wiki fica, e a discordância passou despercebida porque nunca houve tela.

O ADR 006, Shell da Wiki, publica como interface as rotas `/wiki`, `/wiki/:spaceId`, `/wiki/:spaceId/paginas/:pageId/editar` e `/wiki/:spaceId/revisao`. O escopo é o espaço. O ADR 008 registra premissa sobre o caminho literal de edição.

A `DEC-0014` fixou quatro níveis, workspace, espaço, projeto e página. Ela cita o pedido de produto, "wiki e diagramas para cada projeto", e é por causa dele que `content.pages` ganhou `project_id` e que a unicidade virou `unique nulls not distinct (space_id, project_id, parent_page_id, slug)`, escopada ao projeto para que dois projetos do mesmo espaço tenham cada um a página de entrada com o mesmo slug.

O schema tem o nível de projeto. As rotas não têm.

## A decisão

A wiki fica dentro do projeto. As rotas passam a ser `/projetos/:projectId/wiki`, `/projetos/:projectId/wiki/paginas/:pageId` e `/projetos/:projectId/wiki/paginas/:pageId/editar`. A tela do projeto ganha duas áreas irmãs, Diagramas e Wiki.

O segmento `paginas` e a identificação por id sobrevivem do ADR 006. O que muda é o escopo, de `:spaceId` para `:projectId`. A mudança é mínima de propósito: o contrato antigo continua valendo no que não conflita.

### Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| Wiki por espaço, projeto como filtro da árvore | Não reabre nada, e foi essa a razão de ela existir como opção. O caminho até a wiki de um projeto passaria pelo espaço, e o pedido de produto diz o contrário |
| Os dois caminhos, espaço e projeto, para o mesmo conteúdo | Duas URLs para a mesma página obrigam alguém a eleger a canônica para link compartilhado e para índice de busca, decisão que o ADR 008 ainda não tomou |

### Custos aceitos

**O ADR 006 reabre no item de rotas.** É reabertura declarada, com aprovação do humano registrada nesta decisão, não contorno silencioso de contrato.

**O ADR 008 perde a premissa do caminho literal.** A premissa registrada no ledger cita `/wiki/:spaceId/paginas/:pageId/editar`, caminho que deixa de existir. O ADR 008 ainda não foi escrito, então o custo é de registro, não de retrabalho.

**Página que não é de projeto fica sem endereço.** A `DEC-0014` admitiu de propósito a página de espaço, com `project_id` nulo, para documentação que não pertence a projeto nenhum. Com rota só por projeto, esse conteúdo existe no banco e não tem porta de entrada. A coluna continua nula e a constraint continua tratando nulo como não distinto, então o dado está correto e inalcançável.

## O que esta decisão promove

A `DDP-114` dizia, escrita pela sessão A, "a wiki funciona sem isso". Deixa de ser verdade.

`content.pages.space_id` é `not null`. Com a wiki entrando pelo projeto, o espaço da página precisa sair de algum lugar, e o lugar natural é o projeto. `public.projects` não tem `space_id`, e acrescentá-lo reabre o ADR 001. Enquanto a coluna não existir, o vínculo é responsabilidade de aplicação, e as telas em memória usam um valor fixo, marcado no código com a razão.

## Lacuna declarada

Esta decisão não diz o que acontece com a rota `/wiki/:spaceId/revisao`, a fila de revisão do ADR 006. Fila por projeto e fila por espaço servem a papéis diferentes: quem escreve olha o projeto, quem revisa costuma olhar o espaço inteiro. A escolha fica para quando a fila for construída, e até lá a rota não existe.

`insumos/ORDEM.md` ainda registra o ADR 006 como vago, estado anterior à aceitação dele. A pasta é de escrita do humano, então a correção é pedido, não edição.
