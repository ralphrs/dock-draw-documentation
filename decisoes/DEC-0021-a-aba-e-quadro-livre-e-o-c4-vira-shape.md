# DEC-0021: a aba é quadro livre, e o C4 vira um conjunto de shapes

**Data:** 2026-09-20
**Quem decidiu:** humano, por comentário em `DDP-149`
**Alcance:** o que o Diagram Studio guarda, o que o ADR 001 assume, e o que o ADR 015 passa a precisar decidir

## O pedido

> C4 será um dos shapes. A aba será um quadro livre. Futuramente podemos criar plugins validadores de diagramas.

## A decisão

A aba do Diagram Studio é uma tela livre. O C4 deixa de ser o modelo e passa a ser um conjunto de shapes entre outros possíveis. A validação de um diagrama contra uma notação sai do núcleo e vira plugin, mais tarde.

## O que isso inverte no que já existe

O schema de hoje assume o contrário. `public.views` tem `level`, que é o nível C4 da vista, e `focus_element_id`, que liga a vista ao elemento que ela detalha. `model_elements` e `relationships` guardam elementos tipados e ligações entre eles.

A consequência desse desenho é que **o diagrama é uma vista sobre um modelo**: o mesmo elemento aparece em vistas diferentes continuando a ser o mesmo elemento, e a estrutura vive no modelo, não no desenho. Numa tela livre, uma caixa é uma caixa naquela aba.

As duas ideias não se somam. Ou a estrutura manda no desenho, ou o desenho é livre e a estrutura é uma leitura opcional em cima dele.

Esta decisão escolhe a segunda.

### Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| Abas como navegação, modelo C4 por baixo | Era a leitura barata, e o pedido diz o contrário com todas as letras. Escolher a barata seria decidir produto pelo custo |
| Quadro livre e modelo C4 convivendo desde já | Obriga cada shape a existir nas duas formas, e obriga alguém a decidir o que acontece quando o desenho contraria o modelo. É trabalho de ADR, não de implementação |

### Custos aceitos

**O ADR 001 reabre no que ele tem de mais central.** Não é uma coluna, é o que a tabela significa.

**`level` e `focus_element_id` perdem o sentido que tinham.** Continuam no banco e deixam de ser a espinha do produto. O que fazer com elas é decisão do ADR 001 reaberto, não desta.

**A `DEC-0019` não muda.** Diagrama versiona no mesmo id e a página renderiza sempre o último. Isso vale para quadro livre igual valia para vista C4.

**`DF3`, filtrar a árvore por nível C4, foi escolhido na `DDP-145` e agora só se aplica a diagrama que use o conjunto C4.** Deixa de ser filtro universal da árvore e passa a ser filtro de um tipo de conteúdo.

## O que o ADR 015 passa a ter de decidir

O ADR 015, notações do Diagram Studio, não foi escrito (`DDP-78`). Ele deixa de ser "quais notações o produto suporta" e passa a ser:

O que um conjunto de shapes é, enquanto contrato. O que um plugin validador recebe e devolve. O que o banco guarda de um desenho livre, e o que guarda de um desenho que declara seguir uma notação. Se um diagrama pode trocar de notação depois de desenhado.

Nenhuma tela do Diagram Studio além da árvore deveria ser construída antes dessas respostas. Desenhar primeiro e decidir a notação depois foi o caminho que produziu os dois históricos de migração paralelos do `DEC-0013`.

## Lacuna declarada

Esta decisão não diz o que acontece com os diagramas que já existem em produção. São três projetos, e as tabelas de modelo não foram medidas nesta decisão.

Também não diz se o quadro livre guarda geometria por forma, como um editor de desenho, ou se continua guardando nós e ligações com posição, como o React Flow já faz hoje. A segunda é bem mais barata e nada no pedido exige a primeira.
