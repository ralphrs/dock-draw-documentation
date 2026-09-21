# Ficha: tipo 18, Entidade-relacionamento (inventário de formas, `DEC-0026`)

Levantamento do tipo 18 da tabela da `DEC-0026`: "Entidade-relacionamento, Previsto (ERD), com compartimentos". Cobre as formas de nó e o que a notação exige além da forma. As dez primitivas de hoje estão em `dok-draw-app/src/components/editor/element-shape.tsx`: `rect`, `boundary`, `person`, `cylinder`, `pipe`, `hexagon`, `browser`, `terminal`, `bucket`, `folder`. As oito primitivas novas já identificadas em `adrs/_work/INVENTARIO-formas-por-diagrama.md` são elipse, losango, triângulo, paralelogramo, documento, nuvem, nota e texto solto.

## Notação de referência

A ficha usa a notação Crow's Foot (pé de galinha), a mais adotada entre ferramentas de modelagem, com o padrão IE (Information Engineering) como sinônimo do mesmo conjunto de símbolos de cardinalidade. Fontes:

- [Crow's foot notation for ER diagrams](https://www.drawio.com/docs/tutorials/crows-foot-notation/), draw.io, consultada em 2026-09-21. Descreve a notação proposta por Gordon Everest, a entidade como retângulo com nome único no modelo, o relacionamento como linha entre duas entidades, e a cardinalidade como combinação de dois símbolos na ponta do conector: círculo para zero, linha simples para um, pé de galinha para muitos ou infinito.
- [Entity relationship shapes for ER database models](https://www.drawio.com/docs/diagram-types/entity-relationship-tables/), draw.io, consultada em 2026-09-21. Descreve a entidade como tabela com cabeçalho e linhas, cada linha um atributo, com linha de chave primária ou estrangeira como item de biblioteca próprio.

A notação Chen clássica desenha o atributo como elipse fora da entidade, ligada a ela por uma linha. A Crow's Foot não usa esse elemento: o atributo entra como linha dentro do compartimento da entidade. O tipo 18 da `DEC-0026` pede a notação com compartimentos, que é Crow's Foot, e a forma "atributo em elipse" entra na tabela abaixo só como referência do estilo Chen, fora do foco desta ficha.

## Formas

| Forma | O que representa | Primitiva |
| --- | --- | --- |
| Entidade | Retângulo com compartimentos internos: cabeçalho com o nome da entidade e lista de atributos, cada atributo em uma linha, com destaque visual para a chave primária e para toda chave estrangeira. | Primitiva nova. Nenhuma das dez existentes nem das oito já identificadas representa um retângulo com linhas internas editáveis. A mais próxima é `rect`, que fornece só o contorno, sem estrutura de compartimento. |
| Atributo (estilo Chen clássico) | Atributo desenhado fora da entidade, ligado a ela por uma linha. Não faz parte da notação Crow's Foot, que desenha o atributo como linha dentro do compartimento da entidade. | Elipse, já identificada em `INVENTARIO-formas-por-diagrama.md`. Sem uso na notação de referência desta ficha. |
| Relacionamento | Linha entre duas entidades, com símbolo de cardinalidade em cada ponta, indicando quantas ocorrências de uma entidade se associam a quantas ocorrências da outra. | Reaproveita a aresta do editor (`C4Edge`, `dok-draw-app/src/components/editor/c4-edge.tsx`). Não é forma de nó. O que falta é o sistema de ponta de aresta, descrito abaixo. |

## O que a notação pede além da forma

### Compartimento dentro da entidade

A forma "entidade" não é um retângulo liso. A referência do draw.io mostra a entidade como tabela com cabeçalho e linhas de atributo, cada linha podendo carregar a marca de chave primária ou estrangeira. Isso exige, além do identificador de forma, uma estrutura de conteúdo interna (lista de linhas de atributo, cada uma com nome e marca de chave) que as dez primitivas atuais e as oito já identificadas não têm. Nenhuma das duas listas de primitivas cobre um nó com sub-elementos editáveis independentemente do retângulo externo.

> [!WARNING]
> Lacuna: o formato de dado da entidade (lista de atributos, qual campo é chave primária, qual é chave estrangeira e para qual entidade) não está definido nesta ficha. Dono: ADR que decidir a fatia de ERD.

### Cardinalidade como sistema de ponta de aresta novo

A notação Crow's Foot marca a cardinalidade na ponta do conector com um símbolo próprio, não com ponta de seta comum. O sistema `EdgeEnding` do editor hoje tem cinco valores, `["none", "arrow", "open", "diamond", "circle"]` (`dok-draw-app/src/domain/c4/types.ts:34`), renderizados em `EdgeMarker` (`dok-draw-app/src/components/editor/c4-edge.tsx:48`) como seta cheia, seta aberta, losango e círculo preenchido. Nenhum desses cinco é o símbolo de pé de galinha nem a combinação de círculo com traço que a notação exige.

A referência do draw.io descreve a cardinalidade como combinação de dois símbolos elementares na mesma ponta: círculo para zero, traço simples para um, pé de galinha para muitos. A combinação produz pelo menos quatro símbolos compostos, nenhum coberto pelo `EdgeEnding` atual:

| Símbolo Crow's Foot | Cardinalidade | Combinação |
| --- | --- | --- |
| Traço mais traço | Exatamente um (obrigatório) | Traço duplo |
| Traço mais pé de galinha | Um ou muitos | Traço e garfo de três pontas |
| Círculo mais traço | Zero ou um | Círculo e traço |
| Círculo mais pé de galinha | Zero ou muitos | Círculo e garfo de três pontas |

A referência do draw.io trata "traço mais traço" como "um e apenas um (obrigatório)", a mesma combinação que a tabela acima registra como exatamente um.

Nenhum dos quatro símbolos acima é forma de nó. São pontas de aresta, no mesmo lugar do sistema `EdgeEnding` hoje, e pedem valores novos nesse enum, cada um com o próprio desenho SVG em `EdgeMarker`, separados dos cinco que já existem.

> [!WARNING]
> Lacuna: quantos dos quatro símbolos de cardinalidade entram na primeira fatia do ERD, se a combinação (mínimo mais máximo) é um marcador único por valor ou dois marcadores compostos na mesma ponta, e como o compartimento da entidade marca visualmente chave primária e chave estrangeira, não está decidido nesta ficha. Dono: ADR que decidir a fatia de ERD.
