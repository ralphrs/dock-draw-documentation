# Ficha de inventário: sete tipos UML 2.5.1 (Classes, Componentes, Pacotes, Sequência, Atividades, Casos de uso, Máquina de estados) e Implantação

Levantamento pedido pela `DEC-0026`, cobrindo os tipos 2, 3, 4, 5, 6, 7, 8 e 14 da tabela daquela decisão, todos da família UML 2.5.1 da OMG. Referência geral da família: [omg.org/spec/UML/2.5.1/About-UML](https://www.omg.org/spec/UML/2.5.1/About-UML), link testado e resolvendo em 2026-09-21. A partir dessa página, o PDF normativo é `formal/17-12-05`, dezembro de 2017, baixado de [omg.org/spec/UML/2.5.1/PDF](https://www.omg.org/spec/UML/2.5.1/PDF) na mesma data. Toda citação de página abaixo é a paginação impressa desse PDF.

As dez primitivas de hoje ficam em `dok-draw-app/src/components/editor/element-shape.tsx`: `rect`, `boundary`, `person`, `cylinder`, `pipe`, `hexagon`, `browser`, `terminal`, `bucket`, `folder`. As oito primitivas já identificadas pela ficha anterior (`adrs/_work/INVENTARIO-formas-por-diagrama.md`) são elipse, losango, triângulo, paralelogramo, documento, nuvem, nota e texto solto. As arestas de `dok-draw-app/src/components/editor/c4-edge.tsx` têm hoje cinco pontas (`arrow` cheia, `open` aberta, `diamond` losango cheio, `circle` círculo cheio, `none`), três roteamentos (`straight`, `orthogonal`, `curved`) e dois traços (contínuo, tracejado, mais um pontilhado assíncrono sem pedido correspondente nesta ficha).

## O que já existe no código do app

Busca em `dok-draw-app/src` pelos termos `uml`, `class-diagram`, `sequence`, `activity`, `state-machine`, `use-case`, `package`, `deployment`, `component-diagram`, `actor`, `lifeline`, `swimlane` não encontrou nenhuma implementação dos oito tipos desta ficha. As três ocorrências textuais não relacionadas ao motor de diagrama:

- `src/components/landing/diagram-carousel.tsx` desenha um `SequenceSketch`, um SVG estático da página de marketing sem ligação com `element-shape.tsx` nem `c4-edge.tsx`. Mostra atores e mensagens fixas em coordenadas hardcoded, sem modelo de dados por trás.
- `src/lib/wiki/tipos.ts` e `src/lib/wiki/repositorio-memoria.ts` usam `actor_id` para autoria de página da Wiki, sem relação com o ator de UML.

Nenhum dos oito tipos tem começo de implementação no editor. O registro de formas (`ELEMENT_TYPE_META`, citado em `adrs/_work/ADR-015-escopo.md`) e o modelo genérico de `src/domain/c4/` não têm tipo algum com prefixo ou família UML.

## 2. Classes

Notação de referência: clause 11.4 Classes (`Classes` estendem `EncapsulatedClassifier`), notação em 11.4.4, páginas 194 a 198. A Associação entre classes é a clause 11.5, notação em 11.5.4, páginas 199 a 203.

| Forma UML | O que representa | Primitiva mais próxima |
| --- | --- | --- |
| Class | Classificador com nome, atributos e operações | `rect`, existente, com compartimentos internos que o editor não tem hoje |
| Association (linha) | Relação semântica entre classificadores | Aresta existente (linha contínua, ponta aberta para navegabilidade) |
| Aggregation / Composition (losango na ponta) | Associação todo-parte, vazada (compartilhada) ou cheia (composição) | A ponta `diamond` de `c4-edge.tsx` cobre a composição (losango cheio). Falta a variante vazada |
| Generalization (triângulo vazado na ponta) | Herança entre classificadores | Nenhuma ponta de `c4-edge.tsx` cobre um triângulo fechado sem preenchimento. `open` é um V sem base, não o mesmo desenho |
| Interface fornecida/requerida (pirulito/soquete) | Contrato que a classe oferece ou exige | Primitiva nova: pirulito (círculo pequeno preso por linha curta) e soquete (meio-círculo) |
| Port | Ponto de interação nomeado na borda da classe | Primitiva nova: quadrado pequeno sobreposto à borda do nó |
| AssociationClass | Associação que também é classe | `rect`, existente, mais uma aresta tracejada que liga o retângulo a um ponto do meio da linha de associação, não a outro nó |

A notação pede além de forma: um `Class` tem quatro compartimentos obrigatórios (nome, atributos, operações, recepções) mais um compartimento opcional de estrutura interna (11.4.4, p.195). O editor guarda hoje só nome, descrição e tecnologia por elemento (`adrs/_work/ADR-015-escopo.md` já registra isso como o Problema 3, fora do escopo do ADR 015 por tocar schema). Uma `AssociationClass` liga o retângulo da classe ao meio da linha de associação, não ao contorno de outro nó, o que a aresta de hoje não representa. A ponta de diamante vazado (agregação compartilhada) e a ponta de triângulo fechado (generalização, realização) exigem duas variantes de `EdgeEnding` que `c4-edge.tsx` ainda não declara. O pirulito e o soquete de `Port` e de interface anexam-se a um ponto específico da borda do classificador, não ao contorno inteiro, o mesmo problema de ligação pontual da `AssociationClass`.

## 3. Componentes

Notação de referência: clause 11.6 Components, notação em 11.6.4, páginas 210 a 214. Reaproveita a notação de `EncapsulatedClassifier` (Port, clause 11.3, notação em 11.3.4, p.191) e a notação de pirulito e soquete referenciada por ambas as clauses em 10.4.4.

| Forma UML | O que representa | Primitiva mais próxima |
| --- | --- | --- |
| Component | Módulo substituível com interfaces explícitas | `rect`, existente, com palavra-chave «component» e ícone de duas réguas no canto superior direito |
| Interface fornecida/requerida | Contrato oferecido ou exigido pelo componente | Mesma primitiva pirulito/soquete já identificada em Classes (Tipo 2) |
| Port | Ponto de interação nomeado do componente | Mesma primitiva porta já identificada em Classes (Tipo 2) |
| Assembly Connector (notação bola-e-soquete) | Liga a interface fornecida de um componente à requerida de outro | Aresta existente, mas a ponta encosta no pirulito ou no soquete, não no contorno do componente |
| Delegation Connector | Liga uma porta do componente a uma parte interna | Aresta existente, atracada na porta, mesmo ponto específico de ligação |
| ComponentRealization | Um componente realiza um classificador | Aresta existente com traço tracejado e ponta de triângulo vazado, a mesma ponta que falta em Generalization (Tipo 2) |

A notação pede além de forma: a estrutura interna de um `Component` reaproveita a notação de `StructuredClassifier` (11.2.4, p.185), com partes (`part box`) aninhadas dentro do retângulo do componente e conectadas entre si. `adrs/_work/ADR-015-escopo.md` já registra que `parentId` existe no modelo mas nenhuma linha de `diagram-canvas.tsx` o usa, então o aninhamento real de um componente dentro de outro (Figura 11.47 da spec, `Store` contendo `:Order`, `:Customer`, `:Product`) não é hoje uma operação do editor, é um desenho manual de caixas sobrepostas. A notação bola-e-soquete também aceita representar um conector n-ário canalizado (Figura 11.9), quatro portas simples convergindo num único símbolo de interface, o que não tem equivalente hoje em nenhuma aresta do editor.

## 4. Pacotes

Notação de referência: clause 12.2 Packages, notação em 12.2.4, página 248.

| Forma UML | O que representa | Primitiva mais próxima |
| --- | --- | --- |
| Package | Agrupamento nomeado de elementos, com ou sem membros visíveis | `folder`, existente. O desenho de `element-shape.tsx` (retângulo mais aba retangular no canto superior esquerdo) já é o ícone de pasta pedido pela spec |
| Model | Package com visão completa de um sistema | `folder`, existente, mais um pequeno triângulo decorativo no canto superior direito da aba |
| PackageMerge | Fusão de dois pacotes | Aresta existente (tracejada, ponta aberta), rotulada com a palavra-chave «merge» |

A notação pede além de forma: um `Package` pode mostrar seus membros dentro do próprio retângulo grande, como aninhamento real, não decoração. A primeira leva de formas básicas já usa `folder` sem essa contenção. `adrs/_work/ADR-015-escopo.md` chama isso de contenção não ligada (Problema 4 do escopo, `parentId` sem uso em `diagram-canvas.tsx`). Fora isso, Pacotes não pede nenhuma primitiva nova, é o único dos oito tipos desta ficha inteiramente coberto pelo vocabulário existente.

## 5. Sequência

Notação de referência: clause 17 Interactions. Lifelines em 17.3, notação em 17.3.4, p.572. Messages em 17.4, notação em 17.4.4, p.576 a 578. Occurrences (barra de ativação) em 17.5, notação em 17.5.4, p.581. Fragments (CombinedFragment) em 17.6, notação em 17.6.4, p.585 e 586. A visão consolidada de Sequence Diagrams está em 17.8, com a Tabela 17.1 (nós gráficos) e a Tabela 17.2 (caminhos gráficos) na página 596 a 598.

| Forma UML | O que representa | Primitiva mais próxima |
| --- | --- | --- |
| Moldura de interação (`sd`) | Retângulo que envolve o diagrama de sequência inteiro | Primitiva nova: retângulo com uma etiqueta pentagonal no canto superior esquerdo contendo `sd <nome>` |
| Lifeline | Linha do tempo de um participante | Primitiva nova: cabeça retangular mais uma linha vertical cuja extensão é derivada da duração do diagrama, não arrastável livremente |
| ExecutionSpecification (barra de ativação) | Período em que um participante executa um comportamento | Primitiva nova: retângulo estreito cinza ou branco sobreposto à linha de vida |
| Message | Comunicação entre duas linhas de vida | Aresta existente. Síncrona usa ponta `arrow` cheia, assíncrona usa `open`, resposta usa traço tracejado com `open` ou `arrow` |
| Lost/Found Message | Mensagem cujo destino ou origem está fora do escopo descrito | Ponta `circle` de `c4-edge.tsx` já cobre o ponto preenchido no extremo solto da mensagem |
| DestructionOccurrenceSpecification | Fim da vida de um participante | Primitiva nova: X pequeno no pé da linha de vida |
| CombinedFragment | Bloco de controle (alt, opt, loop, par, entre outros) | Mesma primitiva de moldura pentagonal do `sd`, com o operador (`alt`, `opt`, `loop`) na etiqueta em vez de `sd` |
| InteractionUse (`ref`) | Referência a outra interação | Mesma primitiva de moldura pentagonal, com `ref` na etiqueta |
| StateInvariant | Condição que deve valer num ponto da linha de vida | `rect` com raio (mesmo desenho de State, ver Tipo 8), ligado à linha de vida |
| Gate | Ponto de conexão na borda da moldura | Lacuna. A spec (17.4.3.5, p.575) só diz "pontos na moldura", sem descrever a forma gráfica exata. Dono: pesquisa visual em ferramenta de referência antes de desenhar |

A notação pede além de forma: a posição vertical de todo evento numa linha de vida é derivada da ordem no tempo, não do arrasto do mouse. A `DEC-0026` já registra isso como "posição derivada" para este tipo. Uma `ExecutionSpecification` cobre um trecho específico da linha de vida, não o nó inteiro, e uma `Message` liga dois pontos de tempo específicos em duas linhas de vida diferentes, não os contornos dos nós. Um `CombinedFragment` se divide em `InteractionOperand`s por linhas tracejadas horizontais internas, e a ordenação geral entre ocorrências (`GeneralOrdering`) usa uma seta no meio da linha pontilhada, não na ponta, adorno que nenhuma aresta atual do editor posiciona fora da extremidade.

## 6. Atividades

Notação de referência: clause 15 Activities. Notação geral em 15.2.4, p.379 a 381. Control Nodes em 15.3.4, p.391 a 393. Activity Groups (partições e regiões interrompíveis) em 15.6.4, p.408 a 410.

| Forma UML | O que representa | Primitiva mais próxima |
| --- | --- | --- |
| Action node | Passo executável da atividade | `rect` com raio (retângulo arredondado, já identificado na ficha de formas básicas) |
| Object node | Objeto que flui entre ações | `rect`, existente, raio zero |
| InitialNode | Início do fluxo de controle | Primitiva nova: círculo preto preenchido, pequeno, sem texto |
| ActivityFinalNode | Fim de toda a atividade | Primitiva nova: círculo preenchido dentro de um círculo vazado (alvo) |
| FlowFinalNode | Fim de um fluxo específico, sem encerrar a atividade | Primitiva nova: círculo vazado com um X dentro |
| ForkNode / JoinNode | Divide ou sincroniza fluxos paralelos | Primitiva nova: barra reta preenchida, sem compartimento de texto |
| DecisionNode / MergeNode | Escolhe ou junta ramos de controle | Losango, já identificado na ficha de formas básicas |
| ActivityParameterNode | Parâmetro de entrada ou saída na borda da atividade | `rect`, existente, posicionado sobre a moldura da atividade |
| ActivityPartition (raia) | Agrupa nós por responsável ou dimensão | Primitiva nova: linhas paralelas (raia) com rótulo, capaz de aninhamento hierárquico e de grade multidimensional |
| InterruptibleActivityRegion | Região cujos fluxos são abortados por um evento | `boundary`, existente. O retângulo tracejado de canto arredondado já usado para agrupamento C4 é exatamente essa notação |

A notação pede além de forma: uma `ActivityPartition` é um eixo categórico (departamento, ator, localização), podendo ter duas dimensões cruzadas ao mesmo tempo (Figura 15.66c da spec, raias por linha e por coluna). Isso é contenção real e um eixo de classificação, não um retângulo isolado, o mesmo Problema 4 do escopo do ADR 015 (`adrs/_work/ADR-015-escopo.md` cita raias e pools nominalmente). Uma `InterruptibleActivityRegion` também é contenção, mas de uma única região sem eixo, o que a primitiva `boundary` já resolve sem mudança. Arestas de controle e de objeto dentro de uma `InterruptibleActivityRegion` que a atravessam ganham um adorno de raio (zigue-zague) quando são a `interruptingEdge`, decoração de aresta que nenhum `EdgeEnding` ou traço de `c4-edge.tsx` cobre hoje.

## 7. Casos de uso

Notação de referência: clause 18.1 Use Cases, notação em 18.1.4, páginas 641 e 642.

| Forma UML | O que representa | Primitiva mais próxima |
| --- | --- | --- |
| UseCase | Unidade de funcionalidade oferecida pelo sistema | Elipse, já identificada na ficha de formas básicas |
| Actor | Papel externo que interage com o sistema | `person`, existente. O ícone de `element-shape.tsx` (círculo mais corpo arredondado) é uma silhueta estilizada, não o boneco-palito tradicional da spec, mas ocupa o mesmo lugar semântico |
| Subject (fronteira do sistema) | Retângulo que contém as elipses de caso de uso aplicáveis a um classificador | `rect`, existente, contorno sólido com o nome no canto superior esquerdo, sem compartimentos |
| Extend / Include | Relações entre casos de uso | Aresta existente (tracejada, ponta `open`), rotulada «extend» ou «include» |

A notação pede além de forma: um `Subject` contém visualmente as elipses de caso de uso que lhe pertencem, mesma contenção real pendente nos tipos anteriores. A associação entre `Actor` e `UseCase` carrega multiplicidade nas duas pontas (Figura 18.2 da spec mostra `1` do lado do ator e `0..1` do lado do caso de uso), o mesmo rótulo de multiplicidade já pedido pela Associação de Classes (Tipo 2). Um `UseCase` pode ter um compartimento opcional de `extension points`, lista de texto dentro da elipse, o mesmo problema de conteúdo estruturado do compartimento de atributos de Classes.

## 8. Máquina de estados

Notação de referência: clause 14.2 Behavior StateMachines, notação em 14.2.4, páginas 319 a 334. A notação gráfica alternativa de `Transition` (14.2.4.8) reaproveita símbolos de Atividades para o comportamento associado a uma transição composta.

| Forma UML | O que representa | Primitiva mais próxima |
| --- | --- | --- |
| State | Situação estável do classificador | `rect` com raio, mesma primitiva de Action node em Atividades (Tipo 6) |
| Composite State com regiões | Estado com sub-máquinas paralelas | `rect` com raio, dividido por linhas tracejadas internas, mesmo princípio de eixo da raia de Atividades, aplicado dentro de um único nó |
| Aba de nome | Rótulo do estado composto fora do corpo do retângulo | Primitiva nova: pequeno retângulo apoiado no topo externo do State |
| Pseudo-estado inicial | Ponto de entrada da máquina ou região | Mesma primitiva de nó inicial já identificada em Atividades (Tipo 6) |
| FinalState | Fim da máquina de estados | Mesma primitiva de nó final de atividade (alvo) já identificada em Atividades (Tipo 6) |
| Pseudo-estado junction | Ponto de junção de transições sem tempo de execução | Mesma primitiva de nó inicial (círculo preenchido pequeno) já identificada em Atividades (Tipo 6) |
| Pseudo-estado choice | Escolha dinâmica de ramo | Losango, já identificado na ficha de formas básicas |
| Pseudo-estado terminate | Fim abrupto de toda a execução do classificador | Primitiva nova: X isolado, sem círculo ao redor |
| Pseudo-estado fork / join | Divide ou sincroniza regiões paralelas dentro da máquina | Mesma primitiva de barra de bifurcação/junção já identificada em Atividades (Tipo 6) |
| entryPoint / ConnectionPointReference de entrada | Ponto de entrada nomeado na borda de um estado composto ou sub-máquina | Primitiva nova: círculo pequeno vazado, sem preenchimento |
| exitPoint / ConnectionPointReference de saída | Ponto de saída nomeado na borda | Mesma primitiva de nó final de fluxo (círculo com X) já identificada em Atividades (Tipo 6) |
| shallowHistory / deepHistory | Pseudo-estado que retoma o último sub-estado ativo | Primitiva nova: círculo pequeno com o rótulo `H` ou `H*` dentro |
| Signal receipt / Signal send (símbolo da transição composta) | Evento de sinal recebido ou disparado na cadeia gráfica de uma transição | Primitiva nova: polígono de cinco lados com um entalhe triangular numa das faces, em forma de bandeira |

A notação pede além de forma: o compartimento de um `State` guarda até três listas de texto (comportamentos internos `entry`/`exit`/`do`, transições internas, e para estado composto, um compartimento de decomposição), o mesmo problema de conteúdo estruturado dos compartimentos de Classes e das extension points de Casos de uso. Uma `Region` dentro de um estado composto é uma divisão interna por linha tracejada, análoga à divisão de `InteractionOperand` em Sequência e à raia de Atividades, mas sem eixo nomeado, só separação paralela. As transições `local` podem se originar ou terminar na borda do estado composto ou num ponto de entrada/saída específico, não no contorno inteiro, o mesmo problema de ligação pontual já visto em Port (Tipo 2 e 3) e em `ConnectionPointReference`. Um `Trigger` de sinal ou de mudança, quando mostrado na notação gráfica de `Transition` (14.2.4.8.2), usa o símbolo de bandeira descrito acima, plugado numa cadeia de setas junto com símbolos de ação, de escolha e de junção que já têm primitiva definida nos itens anteriores desta mesma tabela.

## 14. Implantação

Notação de referência: clause 19 Deployments, notação em 19.2.4, página 654. Artifacts em 19.3, notação em 19.3.4, página 657. Nodes em 19.4, notação em 19.4.4, página 658.

| Forma UML | O que representa | Primitiva mais próxima |
| --- | --- | --- |
| Node (Device / ExecutionEnvironment) | Recurso computacional que hospeda artefatos | Primitiva nova: cubo em perspectiva (retângulo com face lateral e face superior desenhadas em fuga, efeito 3D) |
| Artifact | Peça de informação física (arquivo, executável, script) | `rect`, existente, com palavra-chave «artifact» e um pequeno ícone de página com canto dobrado no canto superior direito |
| DeploymentSpecification | Parâmetros de execução de um artefato num nó | `rect`, existente, com palavra-chave «deployment spec» |
| Deployment / Manifestation | Liga um artefato a um nó, ou um artefato ao elemento que ele materializa | Aresta existente (tracejada, ponta `open`), rotulada «deploy» ou «manifest» |
| CommunicationPath | Associação entre dois nós que podem trocar sinais ou mensagens | Aresta existente (linha contínua), mesma notação de Associação de Classes (Tipo 2) |

A notação pede além de forma: um `Node` pode aninhar outro `Node` (Device contendo ExecutionEnvironment, Figura 19.12 da spec), mesma contenção real pendente nos tipos anteriores desta ficha. Artefatos implantados num nó podem aparecer dentro do próprio cubo em perspectiva, como lista de texto ou como retângulos de `Artifact` aninhados, e uma `DeploymentSpecification` se conecta ao artefato que ela parametriza por uma dependência tracejada comum, sem ponto de ligação especial. Não há eixo de tempo nem compartimento estruturado neste tipo, ao contrário de Classes, Sequência, Atividades, Casos de uso e Máquina de estados.

## Formas novas descobertas por esta ficha

Além das oito já identificadas (elipse, losango, triângulo, paralelogramo, documento, nuvem, nota, texto solto), esta ficha encontra dezesseis primitivas novas, várias reaparecendo entre tipos:

1. Pirulito e soquete (interface fornecida/requerida), Tipo 2 e Tipo 3.
2. Porta (quadrado pequeno na borda), Tipo 2 e Tipo 3.
3. Moldura de interação com etiqueta pentagonal (`sd`, `ref`, CombinedFragment), Tipo 5.
4. Linha de vida (cabeça mais linha vertical de duração derivada do tempo), Tipo 5.
5. Barra de ativação (ExecutionSpecification), Tipo 5.
6. Marca em X isolada (destruição em Sequência, término em Máquina de estados), Tipo 5 e Tipo 8.
7. Nó inicial, círculo preenchido pequeno (InitialNode de Atividades, pseudo-estados inicial e junction de Máquina de estados), Tipo 6 e Tipo 8.
8. Nó final de atividade ou estado, círculo dentro de círculo (ActivityFinalNode, FinalState), Tipo 6 e Tipo 8.
9. Círculo com X (FlowFinalNode, ponto de saída de Máquina de estados), Tipo 6 e Tipo 8.
10. Barra de bifurcação/junção (ForkNode/JoinNode de Atividades, pseudo-estado fork/join de Máquina de estados), Tipo 6 e Tipo 8.
11. Raia de atividade, com eixo e possível grade multidimensional, Tipo 6.
12. Aba de nome do estado composto, Tipo 8.
13. Pseudo-estado de histórico, círculo com rótulo H ou H*, Tipo 8.
14. Ponto de conexão de entrada, círculo pequeno vazado, Tipo 8.
15. Sinal, polígono de cinco lados em forma de bandeira, Tipo 8.
16. Cubo em perspectiva (Node de Implantação), Tipo 14.
