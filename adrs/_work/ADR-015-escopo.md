# Escopo do ADR 015: notações do Diagram Studio

**Data:** 2026-09-20
**Origem:** pedido do dono do produto, doze famílias de diagrama a acrescentar ao Diagram Studio
**Estado:** escopo aprovado em 2026-09-20 (`DDP-75`). O ADR é escrito depois que a meta de `DEC-0004` fechar

## 1. O pedido

Acrescentar ao Diagram Studio, como tipos de diagrama que o produto sabe desenhar:

| # | Família | Observação do pedido |
| :-- | :--- | :--- |
| 1 | UML | Classe, Sequência, Atividades, Casos de Uso, Componentes, Implantação, Estados |
| 2 | C4 Model | Já existe |
| 3 | ERD | Entidade-relacionamento, modelagem de banco |
| 4 | Arquitetura Cloud | AWS, Google Cloud, Azure, OCI |
| 5 | Topologia de redes | Símbolos Cisco, genéricos, física e lógica |
| 6 | Rack e gabinetes | |
| 7 | DFD | Fluxo de dados |
| 8 | Fluxogramas | Simples, multifuncionais com raias, algoritmos, máquinas de estado |
| 9 | BPMN | |
| 10 | Wireframes e mockups | Web, iOS, Android |
| 11 | Sitemaps e fluxos de navegação | |
| 12 | Jornada do usuário | |

## 2. O que já existe, medido no código real

Levantamento em 2026-09-20 sobre a `main` do `dok-draw-app`.

**O núcleo já é genérico, e o nome esconde isso.** O modelo em `src/domain/c4/types.ts` guarda elemento com `id`, `parentId`, `type`, `name`, `description`, `technology`, `tags`, `color`, `external` e um `style` de formatação livre no padrão do draw.io. A relação guarda origem, destino, rótulo, tecnologia, estilo, pontos de quebra e formatação. A visão guarda nome, nível e elemento em foco. O nó de visão guarda posição, tamanho e empilhamento.

**Três campos que decidem tudo são string livre, não enumeração no banco:** `model_elements.type`, `views.level` e `projects.kind`. O `kind` já existe na tabela, já é lido e gravado pelo repositório, e **nenhuma linha de código ramifica sobre ele**. É o ponto de ancoragem de notação que o schema já oferece sem migração.

**O registro de formas já está separado do motor**, como o contrato do ADR 001 exige. `ELEMENT_TYPE_META` mapeia tipo de elemento para rótulo, cores, forma primitiva e níveis em que o tipo aparece. As formas primitivas são nove: `person`, `box`, `cylinder`, `hexagon`, `pipe`, `browser`, `terminal`, `bucket`, `folder`, `boundary`.

**A exportação já existe em três formatos:** SVG, PNG e `.drawio`. O `.drawio` traduz forma primitiva para estilo mxGraph.

**Dois achados que encarecem o pedido:**

1. **Contenção é dado, não desenho.** `parentId` existe no tipo e na validação, e `diagram-canvas.tsx` nunca usa `parentId`, `parentNode` nem `extent`. O tipo `group` desenha uma caixa `boundary` que a pessoa posiciona à mão. Raia de fluxograma, pool de BPMN e fronteira de sistema precisam de contenção real, que hoje não está ligada.
2. **A exportação degrada em silêncio.** `drawioStyle` termina em `return` de retângulo arredondado para qualquer forma que não reconheça. Cada notação nova que não estender esse mapa exporta como retângulo, sem aviso e sem erro. O conflito C-2 do ledger, que registra que ninguém é dono da geração estática de view, cresce junto com a lista de notações.

## 3. O pedido não é uma coisa, são quatro

A lista de doze famílias agrupa problemas de arquitetura diferentes. Tratá-los como um só produz uma decisão grande demais para revisar, que é o defeito que o `PROTOCOLO.md` passou a barrar por tamanho em 2026-09-20.

### Problema 1: registro de notação sobre o núcleo genérico

**Famílias:** C4, UML estrutural (classe sem compartimento, componentes, implantação, casos de uso), DFD, fluxograma simples, BPMN básico, topologia de rede lógica, sitemap.

**O que é:** uma notação passa a ser um dado, não um módulo. Cada notação publica a lista de tipos de elemento, os tipos de relação, a forma primitiva de cada tipo e as regras de qual tipo aparece em qual nível. `projects.kind` seleciona a notação.

**Custo:** renomear `src/domain/c4/` para um núcleo sem nome de notação, acrescentar a dimensão de notação ao registro, e crescer o vocabulário de formas primitivas. **Sem migração de banco.**

### Problema 2: biblioteca de ícones

**Famílias:** arquitetura cloud (AWS, GCP, Azure, OCI), topologia de rede com símbolos Cisco, rack.

**O que é:** não é modelagem, é pipeline de asset. Centenas de ícones por provedor, com tamanho de bundle, busca na paleta e atualização periódica.

**Restrição eliminatória, não nota de rodapé:** a licença de cada conjunto de ícones precisa ser conferida na web, com link e data, antes de qualquer candidata sobreviver. Os conjuntos dos provedores de nuvem têm termos próprios de redistribuição, e o conjunto da Cisco é marca registrada. Isso é pesquisa da sessão B, com o resultado no ADR, e não afirmação deste escopo.

### Problema 3: compartimentos dentro do elemento

**Famílias:** UML classe, ERD.

**O que é:** uma classe tem lista de atributos e de métodos; uma entidade tem lista de colunas com tipo, chave e nulidade. O elemento de hoje não tem onde guardar conteúdo estruturado, porque `tags` é lista de string e `style` é formatação.

**Custo:** toca o schema. É o único dos quatro que exige migration.

### Problema 4: posição derivada da semântica

**Famílias:** UML sequência, raias e pools, rack, jornada do usuário.

**O que é:** `view_nodes` guarda `x`, `y`, `width`, `height` e `zIndex` livres. Num diagrama de sequência a posição da mensagem vem da ordem dela, não do arrasto. Num rack a posição encaixa em slot de 1U. Numa jornada a posição é célula de matriz. Guardar coordenada livre para esses casos é desencontro de modelo, não detalhe de renderização.

**Custo:** desconhecido, e é o maior dos quatro. Nenhuma medição sustenta um número hoje.

## 4. O que o ADR 015 decide

Os problemas 1 e 2, que são uma decisão só: como uma notação entra no produto, e de onde vêm as formas e os ícones dela.

1. O conceito de notação: o que uma notação declara, onde essa declaração vive e como `projects.kind` a seleciona.
2. O renome do núcleo de `c4` para um nome sem notação, e a fronteira entre núcleo genérico e declaração de notação.
3. O vocabulário de formas primitivas: quais formas o núcleo desenha, e o critério para uma notação pedir uma forma nova em vez de reaproveitar.
4. A política de ícone de terceiro: licença, redistribuição, tamanho de bundle, e o que acontece quando um provedor muda o conjunto.
5. A contenção real no canvas, ligando `parentNode` e `extent` do React Flow ao `parentId` que já existe, que as raias e os pools exigem e que o C4 já ganha junto.
6. O que acontece com a exportação quando a forma não tem tradução. Hoje degrada em silêncio, e o ADR decide entre recusar, avisar ou degradar de forma declarada.
7. Quais das doze famílias ficam cobertas pela decisão, nomeadas uma a uma.

## 5. O que o ADR 015 não decide

| Assunto | Dono proposto |
| :--- | :--- |
| Compartimento de atributos e métodos (UML classe, ERD) | ADR novo, problema 3. Toca schema |
| Posição derivada (sequência, raia, rack, jornada) | ADR novo, problema 4. Tamanho desconhecido |
| Wireframes e mockups | Sem dono. Conteúdo aninhado com texto editável aproxima mais de ferramenta de design que de grafo, e nenhum dos quatro problemas o cobre inteiro |
| Geração estática de SVG/PNG de uma view fora do canvas | Conflito C-2, já registrado, dono ADR 007 |
| Versionamento de diagrama | Conflito C-1, já registrado, extensão do ADR 001 |
| Como um diagrama é embutido numa página da Wiki | ADR 002, já aceito (`dok:diagram/<uuid>?view=`) |

## 6. Dependências e o que este ADR estende

**Estende o ADR 001**, que está Aceito. O contrato dele publica as cinco tabelas como modelo de diagrama e impõe que o registry de formas é independente do motor. A restrição está a favor deste pedido. A extensão é aditiva e precisa ser declarada no bloco de contrato, no mesmo formato que o ADR 006 usou para estender o 003 e o 004, para o ledger acolher em nome do ADR 001.

**Consome do ADR 002** a URI `dok:diagram/<uuid>?view=`, sem mudança.

**Não depende** dos ADRs 003, 004, 005 e 006, que formam a trilha da Wiki.

## 6.1. A intenção do dono do produto para o "mais formas", de 2026-09-20

> **Intenção registrada, ainda não decidida.** O dono do produto pediu que ficasse escrita e disse que a discussão continua. O que está abaixo da intenção é análise da sessão A, para essa discussão ter de onde partir, e não conclusão fechada.

### A intenção, nas palavras do pedido

O "mais formas" é **um drawer centralizado com uma lista de cards em miniatura**, um por família de diagrama: AWS, GCP, Azure, UML, BPMN, e as demais. Em vez de mostrar só o nome da forma, cada card mostra **a miniatura da forma**. Para as famílias que não têm ícone pronto (UML, BPMN), a miniatura é criada.

O que motiva: nome de forma não comunica. Miniatura comunica.

**A miniatura já é o padrão certo no app, e o motivo importa.** `PaletteItem` renderiza o mesmo `<ElementShape>` que desenha no canvas, em 40 por 28. A miniatura não é um asset separado, é o renderizador real em tamanho pequeno, e por isso nunca diverge da forma de verdade. Gerar imagem de miniatura por forma quebraria essa propriedade na primeira mudança de cor ou de traço.

**Pegar forma e ligar biblioteca são duas funções, e o nome "mais formas" as junta.** Pegar forma é ação repetida: abre, escolhe, fecha, desenha, precisa de outra. Um drawer centralizado cobre o canvas justamente quando a pessoa decide o que encaixa nele. Ligar biblioteca é ação rara, e aí o drawer centralizado com card por família é a forma certa, porque uma miniatura decide "quero AWS ligado" muito melhor que a palavra AWS.

**A escala quebra a miniatura como navegação primária.** Os conjuntos de nuvem têm centenas de ícones, contra uma dezena de uma notação UML. Ninguém encontra um serviço específico olhando uma grade de trezentos quadrados. Acima de algumas dezenas de formas, busca por nome é o meio de chegar, e a miniatura serve para confirmar que o resultado é o certo.

**A razão real do drawer não é descoberta, é manter a paleta utilizável.** A paleta de hoje mostra tudo que o nível permite. Com doze famílias ligadas ao mesmo tempo ela vira lista infinita. Biblioteca ligada e desligada é o mecanismo que impede isso.

### O desenho que a sessão A propõe para a discussão continuar

Não é decisão. É a proposta que o ADR confirma ou derruba com argumento:

| Elemento | Função | Por quê |
| :--- | :--- | :--- |
| Drawer centralizado, card por família com formas representativas | Ligar e desligar biblioteca | Ação rara, decisão visual, não compete com o canvas |
| Paleta lateral persistente, com busca | Pegar forma | Ação repetida, fica ao lado do trabalho em vez de por cima |
| Agrupamento por família na paleta, mostrando só o que está ligado | Manter a lista navegável | Doze famílias ligadas de uma vez são inutilizáveis sem isso |

Duas coisas que o ADR precisa decidir e que esta entrada não resolve: onde fica o estado de "biblioteca ligada" (por projeto, por usuário, ou derivado da notação do `projects.kind`), e se a busca é por nome do tipo, por rótulo visível, ou pelos dois.

## 7. Exigências sobre as fatias

1. Cada fatia precisa ser executável por quem não participou da decisão, com teto de 10.000 caracteres de ordem, pela regra que o `PROTOCOLO.md` passou a impor.
2. Toda fatia com interface carrega os quatro pontos de UX da sessão C, e uma issue de revisão para o dono do produto.
3. Nenhuma fatia entrega uma família inteira de uma vez. A unidade é a declaração de uma notação, ou uma forma primitiva nova, ou um conjunto de ícones.

## 8. O conflito de prioridade, que não é decisão desta sessão

`DEC-0004` fixa a meta da trilha de desenvolvimento: editar e publicar uma página da Wiki ponta a ponta. O `insumos/BASE.md` diz que a Wiki é o produto principal, e que o Diagram Studio compõe as páginas dela.

Este pedido é maior que a meta em aberto. A meta tem 17 fatias restantes e 29 dias estimados. O ADR 015 sozinho publica fatias novas em número ainda desconhecido, e os problemas 3 e 4 abrem dois ADRs a mais.

**Decidido em 2026-09-20 (`DDP-75`): depois da meta.** A trilha da Wiki segue até `DEC-0004` fechar, e o ADR 015 é escrito quando a meta for atingida. As doze famílias entram por inteiro, sem corte de escopo. Registro em `decisoes/DEC-0011-sequenciamento-do-diagram-studio.md`.
