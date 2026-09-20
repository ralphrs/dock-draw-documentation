# DEC-0018: a árvore é a forma do projeto, e as duas áreas a usam

**Data:** 2026-09-20
**Quem decidiu:** humano, em duas frases de produto interpretadas pela sessão A e confirmadas antes da implementação
**Alcance:** tela inicial do projeto, navegação do Diagram Studio, pasta nas duas árvores, o que isso cobra do schema

## O pedido

Duas frases:

> dentro do projeto, a wiki é o principal

> quando entrar no diagram studio, pode ser num formato de wiki e quando selecionar o diagrama, entra em modo de edicao... tem que poder criar pastas (assim como na wiki)

## A decisão

**A wiki é a tela inicial do projeto.** Abrir um projeto mostra a árvore de páginas. O canvas de diagrama deixa de ser a primeira coisa na tela. As abas Wiki e Diagramas continuam, com Wiki primeiro.

**O Diagram Studio ganha a forma da wiki.** `/projetos/:projectId/diagramas` é um navegador em árvore, e `/projetos/:projectId/diagramas/:viewId` é o modo de edição, o canvas que já existe. Selecionar um diagrama entra na edição.

**As duas árvores continuam duas.** A leitura alternativa, uma árvore só por projeto misturando página e diagrama, foi descartada. O pedido diz "quando entrar no diagram studio", o que mantém o Studio como lugar em que se entra. Fundir as duas árvores também obrigaria `content.pages` a carregar o nó de diagrama, acoplando a tabela do ADR 003 ao schema do ADR 001, contra doutrina que aquele ADR escreveu para `page_refs.target_id` e que a `DEC-0014` repetiu para `project_id`.

**Pasta existe nas duas.** Pasta agrupa e não tem conteúdo. Clicar abre e fecha, não navega. Pasta aninha dentro de pasta.

### Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| Uma árvore só por projeto, com página e diagrama como irmãos | Acopla `content.pages` ao schema do ADR 001 e contraria a leitura literal do pedido, que mantém o Studio como lugar próprio |
| Pasta implícita, uma página sem conteúdo que tem filhos | Quebra na pasta vazia, que é indistinguível de uma página vazia, e o estado vazio é justamente quando a pessoa precisa do botão de criar |
| Pasta só na wiki, diagramas seguem em lista plana | O pedido nomeia pasta no Studio, e é lá que a lista plana já incomoda |

### Custo aceito

Duas árvores significam dois repositórios, dois componentes de árvore e duas regras de criação. Parte disso é duplicação real, e a mitigação é o componente de árvore ser um só, parametrizado pelos tipos de nó que cada área aceita.

## O que isso cobra do schema, e ainda não foi pago

**`content.pages` não sabe distinguir pasta de página.** A tabela tem `parent_page_id`, então a hierarquia existe, mas nada diz que um nó é pasta. A recomendação é uma coluna `node_kind` com valor padrão `pagina` e restrição de domínio, aditiva, sem tocar na unicidade existente. Reabre o ADR 003.

**`public.views` não tem hierarquia nem pasta.** As colunas são `id`, `project_id`, `name`, `level`, `focus_element_id`, `created_at`, `updated_at`, medidas no banco em 2026-09-20. Diagrama é lista plana por projeto, organizada pelo nível C4. Dar pasta ao Studio reabre o ADR 001.

Enquanto as duas migrações não acontecem, as árvores vivem em memória no cliente, com a razão comentada no código. É gambiarra declarada.

## Lacuna declarada

Renomear e mover nó ficaram fora, tanto da tela quanto desta decisão. Mover é o caso que mexe em `parent_page_id` e em `position` ao mesmo tempo, e que precisa dizer o que acontece com a unicidade de slug quando o nó muda de pai. Sem dono até a árvore sair da memória.

Esta decisão também não diz se uma pasta pode virar página, ou o contrário. Enquanto a distinção não existir no banco, a pergunta não tem onde ser respondida.
