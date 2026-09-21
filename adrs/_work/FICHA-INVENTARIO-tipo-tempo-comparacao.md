# Ficha de inventário: tipos 21 a 24, eixo de tempo e comparação

Levantamento pedido pela `DEC-0026` para os quatro tipos que a tabela marca como "não previsto" por motivo de tempo ou de comparação, e não por forma faltante: roadmap de arquitetura (21), AS-IS vs. TO-BE (22), Gantt de arquitetura (23) e ciclo de vida de aplicações (24). A `DEC-0026` registra o ponto central: os três primeiros posicionam o item pela data, não pelo arrasto, e o quarto compara dois estados. O quadro livre da `DEC-0021` não cobre nenhum dos dois comportamentos.

Cada seção descreve as formas visuais da notação de referência e avalia as três alternativas de mecanismo que a `DEC-0026` cita, sem escolher entre elas. A escolha é do ADR 015. As dez primitivas de hoje estão em `src/components/editor/element-shape.tsx` (`rect`, `boundary`, `person`, `cylinder`, `pipe`, `hexagon`, `browser`, `terminal`, `bucket`, `folder`). O losango entra na lista das oito primitivas novas já identificadas em `adrs/_work/INVENTARIO-formas-por-diagrama.md`, junto com elipse, triângulo, paralelogramo, documento, nuvem, nota e texto solto. As arestas de `src/components/editor/c4-edge.tsx` já cobrem seta, roteamento e traço.

## Tipo 21: Roadmap de arquitetura

Referência: [Timelines and roadmaps, draw.io](https://www.drawio.com/docs/diagram-types/timeline-diagrams/) e [Swimlane roadmap, Tempo](https://www.tempo.io/products/project-portfolio-management-software-ppm/swimlane-roadmap), consultadas em 2026-09-21. A Tempo descreve um roadmap segmentado por trimestre e por categoria funcional, com raia por tema ou departamento, barra de tarefa colorida por raia e marcador de marco em formato de losango. O draw.io oferece a mesma ideia como coleção de formas pré-estilizadas da biblioteca Infographic, sem separar simbolicamente data de marco.

| Forma visual | Nome | O que representa | Primitiva mais próxima |
| :--- | :--- | :--- | :--- |
| Faixa horizontal | Swimlane | Trimestre ou iniciativa, agrupa os cartões da mesma categoria | `boundary`, existente, mas sem contenção real ligada no canvas hoje (`adrs/_work/ADR-015-escopo.md`, problema 5) |
| Cartão retangular | Cartão de item | Entrega ou iniciativa posicionada no tempo | `rect`, existente |
| Losango pequeno | Marco | Data-chave dentro da faixa, sem duração | Primitiva nova, já listada em `INVENTARIO-formas-por-diagrama.md` |
| Régua com rótulo | Eixo de tempo | Escala de trimestre ou mês que ordena as faixas | Sem primitiva equivalente hoje, forma nova de régua ou grade, não coberta pela lista das oito |

### Alternativa 1: modo próprio do editor

Um modo timeline separado exigiria eixo de data real como referência de posicionamento, com a faixa (swimlane) fixada como raia perpendicular ao eixo e o cartão de item travado no eixo x pela data, arrastável apenas dentro da faixa. O modo substitui o arrasto livre da `DEC-0021` só dentro dessa tela, sem afetar o quadro livre dos outros diagramas.

### Alternativa 2: família de forma com posição derivada

O cartão de item guardaria um campo de data no elemento, e o motor derivaria a posição x a partir dela, dentro do mesmo quadro livre que hoje guarda coordenada arbitrária em `view_nodes`. É o padrão do problema 4 do escopo do ADR 015, já usado para a sequência UML. A swimlane continuaria como `boundary` com posição fixa, e a contenção real entre raia e cartão depende do mesmo trabalho de ligar `parentNode` e `extent` do React Flow que o problema 4 já lista como custo desconhecido.

### Alternativa 3: comparação entre versões

O roadmap não compara dois estados, mostra uma linha contínua de iniciativas ao longo do tempo dentro de uma única versão. A comparação entre versões do mesmo diagrama, que a `DEC-0019` torna possível, resolveria no máximo "roadmap de hoje contra roadmap de um trimestre atrás", o que não é o uso descrito pela referência consultada. Aderência fraca, não avaliada em profundidade.

## Tipo 22: AS-IS vs. TO-BE

Referência: [Comparing as-is and to-be business process diagram, Visual Paradigm](https://www.visual-paradigm.com/support/documents/vpuserguide/26/39/6690_comparingas-.html), consultada em 2026-09-21. A ferramenta mostra as duas versões lado a lado no mesmo painel, com a forma alterada pintada em cor diferente e um painel de resultado à parte listando as mudanças como "New" ou "Deleted".

| Forma visual | Nome | O que representa | Primitiva mais próxima |
| :--- | :--- | :--- | :--- |
| Moldura com rótulo | Estado AS-IS / TO-BE | Identifica qual dos dois desenhos está sendo visto | `boundary`, existente, usado como rótulo de contêiner |
| Elemento arquitetural | Reaproveitado do diagrama comparado | Qualquer forma do C4, nuvem ou básica que compõe a arquitetura em cada estado | Nenhuma primitiva nova, reaproveita o que o diagrama de origem já usa |
| Marca de cor sobre o elemento | Selo de mudança | Sinaliza elemento novo, removido ou alterado entre os dois estados | Sem primitiva geométrica nova, é atributo de estilo (`fill`, `stroke`) sobre a forma existente, condicionado ao resultado da comparação |

### Alternativa 1: modo próprio do editor

Um modo de comparação lado a lado exigiria duas instâncias do canvas renderizadas simultaneamente, com zoom e pan sincronizados, sem posicionamento por data. Não é o mesmo mecanismo do modo timeline dos outros três tipos, porque nenhum elemento é reposicionado por eixo de tempo, só duplicado e exibido em paralelo.

### Alternativa 2: família de forma com posição derivada

O padrão de posição derivada resolve item posicionado por ordem ou por data, e o AS-IS vs. TO-BE não posiciona nada por esses critérios. Aderência fraca, não avaliada em profundidade.

### Alternativa 3: comparação entre versões

É o mecanismo mais próximo do problema descrito. O AS-IS seria uma versão anterior do diagrama e o TO-BE a versão mais recente, ou vice-versa, usando o histórico que a `DEC-0019` cria para o diagrama versionado. A `DEC-0019` deixa em aberto se esse histórico é navegável pela interface e por quem, remetendo a decisão ao ADR 001. Sem essa navegação, não há como abrir duas versões lado a lado nem calcular o selo de mudança entre elas. Lacuna declarada: a comparação visual entre duas versões, com destaque de elemento novo, removido ou alterado, não está coberta por nenhum ADR aceito hoje.

## Tipo 23: Gantt de arquitetura

Referência: [Project planning with Gantt charts, draw.io](https://www.drawio.com/docs/diagram-types/gantt-charts/) e [Gantt syntax, Mermaid](https://mermaid.js.org/syntax/gantt.html), consultadas em 2026-09-21. O draw.io monta o Gantt sobre uma tabela, com retângulo sobre cada linha representando a tarefa e conector para dependência. O Mermaid define o marco como instante único, calculado pela data inicial mais metade da duração, e a tarefa crítica ou concluída recebe estilo próprio via marcação (`crit`, `done`, `active`).

| Forma visual | Nome | O que representa | Primitiva mais próxima |
| :--- | :--- | :--- | :--- |
| Barra horizontal | Barra de tarefa | Atividade com início e fim, largura proporcional à duração | `rect`, existente, alongado |
| Losango sobre a barra | Marco | Instante único sem duração, como uma entrega | Primitiva nova, já listada em `INVENTARIO-formas-por-diagrama.md` |
| Linha com seta entre barras | Dependência | Uma tarefa depende do fim ou início de outra | Aresta de `c4-edge.tsx`, existente, sem forma de nó nova |
| Régua com rótulo | Eixo de datas | Escala de dia, semana ou mês que calibra a largura das barras | Sem primitiva equivalente hoje, mesma lacuna do eixo de tempo do roadmap |

### Alternativa 1: modo próprio do editor

O modo timeline exigiria eixo de data real e cálculo de posição e de largura a partir de duas datas por tarefa, início e fim, não só a posição que o roadmap pede. O marco entraria como ponto sobre o eixo, sem largura. A dependência continuaria como aresta entre duas barras, mas o roteamento precisaria respeitar a ordem temporal das duas datas.

### Alternativa 2: família de forma com posição derivada

A tarefa guardaria data de início e de fim, e o motor derivaria x e largura a partir das duas datas, dentro do quadro livre. É uma exigência maior que a da sequência UML e a do roadmap, que derivam só a posição: o Gantt deriva posição e tamanho ao mesmo tempo, e o redimensionamento manual da barra passaria a significar mudança de data, não mudança de forma.

### Alternativa 3: comparação entre versões

O Gantt não compara dois estados, mostra o avanço de um cronograma dentro de uma única versão. A comparação entre versões da `DEC-0019` poderia mostrar "cronograma planejado contra cronograma atual", uso citado como possível em ferramentas de portfólio mas não verificado nas referências desta ficha. Lacuna declarada: nenhuma fonte consultada confirma esse uso.

## Tipo 24: Ciclo de vida de aplicações

Referência: [Application Development Life Cycle, Kissflow](https://kissflow.com/application-development/application-development-lifecycle/), consultada em 2026-09-21, para os estágios usuais (planejamento, desenvolvimento, produção, descontinuado), e [Application Lifecycle, SAP LeanIX](https://www.leanix.net/en/wiki/tech-transformation/application-roadmap), consultada em 2026-09-21, para a notação visual: LeanIX diferencia cinco fases (Plan, Phase in, Active, Phase out, End of life) e colore a barra da aplicação na visão de linha do tempo conforme a fase corrente. A [documentação de gestão do ciclo de vida do Ardoq](https://help.ardoq.com/en/articles/44013-getting-started-with-application-lifecycle-management), consultada em 2026-09-21, confirma o uso de uma visão de linha do tempo para o mesmo propósito, sem detalhar a marcação visual por estágio.

| Forma visual | Nome | O que representa | Primitiva mais próxima |
| :--- | :--- | :--- | :--- |
| Linha do tempo horizontal | Eixo de tempo | Escala de data que ordena os estágios de uma aplicação | Sem primitiva equivalente hoje, mesma lacuna do eixo do roadmap e do Gantt |
| Barra segmentada | Barra de ciclo de vida | Span de uma aplicação ao longo do tempo, dividido por estágio | `rect`, existente, com a divisão em segmentos por estágio como lacuna: uma barra hoje é um elemento só, sem subdivisão interna por período |
| Cor ou selo sobre o segmento | Marca de estágio | Planejado, em desenvolvimento, em produção ou descontinuado | Sem forma geométrica nova, é atributo de estilo (`fill`) sobre o segmento, condicionado à resolução da lacuna acima |
| Losango na fronteira entre segmentos | Marco de transição | Evento pontual como entrada em produção ou descontinuação | Primitiva nova, já listada em `INVENTARIO-formas-por-diagrama.md` |

### Alternativa 1: modo próprio do editor

O modo timeline exigiria o mesmo eixo de data das outras duas famílias de tempo, com a barra de uma aplicação ocupando o intervalo entre a data de entrada e a data de saída de cada estágio. Diferente do Gantt, a barra de ciclo de vida precisa de múltiplos segmentos internos coloridos por estágio, não só início e fim únicos.

### Alternativa 2: família de forma com posição derivada

O elemento guardaria uma lista de estágios, cada um com data de início, e o motor derivaria a posição e o comprimento de cada segmento a partir dessa lista. É mais complexo que o Gantt, que deriva posição e tamanho de uma tarefa só: aqui o mesmo elemento tem vários segmentos derivados, um por transição de estágio, sem que hoje exista no schema um campo equivalente a essa lista de transições. `model_elements` guarda tipo, nome, descrição e um `style` de formatação livre, nenhum dos dois modela uma sequência de estágios com data.

### Alternativa 3: comparação entre versões

O ciclo de vida de uma aplicação não compara dois estados, mostra a evolução contínua de um único elemento no tempo. A comparação entre versões do diagrama, via `DEC-0019`, compararia o desenho do diagrama em duas datas, não o estágio interno de uma aplicação dentro dele. Aderência fraca, não avaliada em profundidade.

## Lacuna declarada, comum às três famílias de tempo

Nenhuma das dez primitivas de hoje nem das oito já identificadas cobre um eixo de datas com régua e grade. As três referências consultadas para roadmap, Gantt e ciclo de vida mostram esse eixo como parte do layout da notação, não como uma forma de nó isolada. Se a alternativa 1 ou a alternativa 2 for escolhida pelo ADR 015, o eixo de tempo entra como peça de desenho adicional, de natureza distinta das treze formas básicas já levantadas, e o custo dela não está medido nesta ficha.
