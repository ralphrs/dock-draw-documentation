# DEC-0022: pasta de diagrama é tabela própria, e pasta de página não é

**Data:** 2026-09-20
**Quem decidiu:** sessão A, por delegação. O humano arrastou `DDP-142` duas vezes sem escrever, depois de um pedido explícito de resposta escrita
**Alcance:** como a hierarquia do Diagram Studio é guardada, e por que ela difere da hierarquia da wiki

## Como esta decisão foi tomada

O cartão `DDP-142` dizia, com estas palavras, que arrastar não bastava e que a resposta precisava vir escrita. Foi arrastado, a sessão A repetiu o pedido em comentário, e foi arrastado de novo, sem texto.

Devolver uma terceira vez é laço. A sessão A decide, registra a razão e deixa a reversão barata: mudar esta decisão antes de a migração existir custa reescrever uma ordem.

## A decisão

A pasta do Diagram Studio é uma tabela própria. `public.views` ganha só o ponteiro para ela.

A pasta da wiki não. Lá, pasta e página são a mesma linha de `content.pages` com valor diferente em `node_kind`, decidido em `DDP-141`.

## Por que as duas árvores respondem diferente

A assimetria não é descuido, e ela tem uma razão que vale mais que a simetria.

Na wiki, pasta e página são a mesma coisa: conteúdo com título, dentro de uma árvore. Uma página sem corpo é coerente, existe em qualquer wiki, e vira pasta sem perder nada. A `DDP-141` decidiu isso e ganhou de brinde que converter uma na outra é trocar um valor.

No Diagram Studio, não. Uma `view` é uma tela: tem conteúdo desenhado, e depois da `DEC-0021` é um quadro livre. Uma pasta não tem tela. Guardá-la em `public.views` cria uma linha cujas colunas de desenho são todas nulas, e obriga toda consulta de diagrama a filtrar o que não é diagrama.

### Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| Coluna de pai em `public.views`, pasta como `view` sem conteúdo | Muda o significado de toda consulta de diagrama já escrita. Cada uma passa a precisar de um filtro que ninguém lembra de pôr, e esquecer o filtro devolve pasta onde o código espera diagrama |
| Copiar a solução da wiki por simetria | Simetria entre coisas diferentes é o que produz o filtro esquecido acima |

### Custo aceito

Uma tabela a mais, e duas formas de hierarquia no produto. Quem ler os dois schemas vai precisar da explicação acima, e por isso ela está escrita aqui em vez de ficar implícita.

## O que pesou a favor, e veio da `DEC-0021`

`public.views` está prestes a ser redesenhada pelo ADR 001 reaberto, porque a aba virou quadro livre e o C4 virou um conjunto de shapes. Acrescentar o conceito de pasta a essa tabela agora amarra duas mudanças que não têm relação.

A tabela de pasta sobrevive ao redesenho sem alteração, porque ela não sabe o que há dentro de um diagrama.

## Lacuna declarada

Esta decisão não desenha a tabela. Nome, colunas e se ela vive em `public` ou em `content` ficam para a ordem, que é escrita pela sessão B contra o schema real.

Também não diz o que acontece ao apagar uma pasta com diagramas dentro. O Confluence promove os filhos um nível acima, o que surpreende quase todo mundo. A `DDP-145` escolheu `DD3`, apagar a pasta com o conteúdo, que é o oposto. A ordem precisa perguntar isso antes de escrever o `ON DELETE`.
