# DEC-0020: o escopo escolhido das duas árvores, e o que cada pedaço espera

**Data:** 2026-09-20
**Quem decidiu:** humano, respondendo aos catálogos `DDP-144` e `DDP-145`
**Alcance:** quais operações de árvore entram, em que ordem elas podem entrar, e o que cada grupo exige antes de existir

## O que foi escolhido

Cinquenta e nove itens dos sessenta e oito catalogados. A wiki fica com 32 agora e 13 no backlog, o Diagram Studio com 27 agora e 3 no backlog.

Três itens vieram com o texto do pedido alterando o que o catálogo descrevia, e essa alteração vale mais que a linha original do catálogo:

**E1, copiar link**, fica restrito a caminho dentro do projeto. Compartilhar página e vincular entre árvores de projetos diferentes sai do "agora".

**G7, subárvore dentro da página**, deixa de ser diretiva escrita à mão e passa a ser elemento inserido por barra de ferramentas, como no Confluence.

**DA5** deixa de ser "criar a vista de nível abaixo a partir de um elemento". O pedido descreve outra coisa: quadro branco livre, organizado por abas ao estilo do draw.io, com as abas podendo ficar embaixo, em cima ou na lateral. Isso não é um item de árvore, é outro modelo de diagrama, e está tratado como pergunta aberta abaixo.

## A ordem em que isso pode ser construído

A ordem não é preferência. Ela sai de o que cada grupo exige para existir.

| Camada | Itens | O que espera |
| :--- | :--- | :--- |
| Nada além de tela | A1, A2, D1, G5, G6, H1, H2, DD1, DE1, DE2, DF3, DF5, DE4, DG3 | nada |
| Coluna de pasta na wiki | A3, B1, B2, C1, C2, C3, D3, D4, D5 | `DDP-141` |
| Pasta e hierarquia no diagrama | DA1, DA2, DA3, DB2, DC1, DC2, DC3, DD3, DG1 | `DDP-142`, ainda sem resposta |
| Lixeira de diagrama | DD2, DD4, DD5, DG2 | coluna de exclusão em `public.views`, hoje inexistente |
| Referência entre conteúdos | F1, F2, F4, DE3 | `content.page_refs`, sub-fatia S4 do ADR 003 |
| Rascunho | A5 | `content.page_drafts`, sub-fatia S1d |
| Cópia e movimentação entre projetos | B3, C4, DB3, DC4 | `public.projects.space_id`, `DDP-114` |
| Redirecionamento de link antigo | C6 | tabela de endereços antigos, que nenhum ADR desenha |
| Busca | G4, DF4 | **ADR 009, não escrito** |
| Exportação | I3, I4, DG4 | **ADR 010, não escrito** |
| Duplicar diagrama | DB1 | decisão sobre elemento copiado ou compartilhado |

Tudo isso, sem exceção, continua sobre dado em memória enquanto a RLS e o acesso do papel `authenticated` ao schema `content` não existirem. A árvore mais completa do mundo sobre dado falso não cumpre a meta da `DEC-0004`.

## Três respostas que o catálogo não conseguiu colher

**D2 aparece nas duas listas.** "Esconder da árvore sem apagar" está em "Agora" e em "Backlog" no mesmo comentário. A sessão A não escolhe por conta própria e trata como backlog até haver resposta, porque é o lado que não cria trabalho.

**G1 veio com "não entendi".** Rótulo é etiqueta livre no nó, como no Confluence: a pessoa escreve `arquitetura` ou `rascunho`, e depois filtra a árvore ou busca por essa etiqueta. Serve para agrupar por assunto atravessando a hierarquia, que é o que pasta não faz. Fica no backlog até a explicação ser aceita ou recusada.

**DA5 mudou de conceito.** Está registrado como pergunta em cartão próprio, não como item de árvore.

## Alternativa descartada

Construir na ordem em que o pedido foi escrito. Descartada porque nove dos itens escolhidos dependem de dois ADRs que ninguém escreveu, e outros catorze dependem de migrações que ainda não têm ordem. Seguir a ordem do pedido produziria uma fila de itens bloqueados sem que a razão aparecesse.

## Custo aceito

A lista de "agora" tem 59 itens e não cabe numa entrega. Chamar tudo de "agora" e construir por camada significa que parte do que foi escolhido demora, e a demora não é recusa. O cartão de cada camada diz o que ela espera.

## Lacuna declarada

Nenhum item do catálogo cobre renomear pasta para página, nem o contrário. A pergunta só existe se pasta e página forem coisas diferentes no banco, o que é exatamente o que a `DDP-141` decide.

Também não há item para ordenar diagrama dentro da pasta por outro critério que não o manual. `public.views.level` existe e permitiria agrupar por nível C4 sem ordem manual, e ninguém pediu.
