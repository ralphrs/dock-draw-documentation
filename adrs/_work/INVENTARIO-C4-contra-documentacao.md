# Inventário do C4 contra a documentação oficial

`DEC-0029` fixa que a família C4 usa só o que c4model.com define. As citações abaixo vêm de nove páginas de c4model.com, lidas por inteiro em 2026-09-21, mais três documentos de apoio (nunca fonte única, por instrução da própria `DEC-0029`). Onde uma citação vem de apoio e não da página primária, o texto diz isso de forma explícita.

Fontes primárias, todas consultadas em 2026-09-21: [c4model.com/diagrams/system-context](https://c4model.com/diagrams/system-context), [c4model.com/diagrams/system-landscape](https://c4model.com/diagrams/system-landscape), [c4model.com/diagrams/container](https://c4model.com/diagrams/container), [c4model.com/diagrams/component](https://c4model.com/diagrams/component), [c4model.com/diagrams/code](https://c4model.com/diagrams/code), [c4model.com/diagrams/dynamic](https://c4model.com/diagrams/dynamic), [c4model.com/diagrams/deployment](https://c4model.com/diagrams/deployment), [c4model.com/diagrams/notation](https://c4model.com/diagrams/notation), [c4model.com/abstractions/microservices](https://c4model.com/abstractions/microservices).

Fontes de apoio, consultadas em 2026-09-21: apresentação de Simon Brown na Devoxx Polônia 2023, "The C4 model: misconceptions, misuses, and mistakes" ([static.architectis.je/devoxxpl2023-c4-model.pdf](https://static.architectis.je/devoxxpl2023-c4-model.pdf), do próprio autor do modelo, peso maior que apoio de terceiro); TCC da PUC Minas, "Geração de Código DSL para Diagramas C4 Model via LLMs" (Murilo Costa, 2025); TCC da UFSJ, "AutorIA" (Álvaro Henrique Santos Ribeiro, 2023). Os dois TCCs aplicam o modelo de forma convencional, sem acrescentar nem contradizer as páginas primárias, e não sustentam nenhum veredito sozinhos, conforme a `DEC-0029` pede.

## 1. Abstrações e elementos da documentação

| Abstração | Citação literal | Onde aparece |
| --- | --- | --- |
| Pessoa (Person) | "Supporting elements: People (e.g. users, actors, roles, or personas)..." (system-context) | Contexto (apoio), Contêiner (apoio, "supporting elements"), Componente (apoio), Panorama (`Primary elements: People and software systems related to the chosen scope`) |
| Sistema de software (Software System) | "Primary elements: The software system in scope." (system-context) | Contexto (primário), Contêiner (apoio, sistemas externos conectados), Componente (apoio), Panorama (primário), Implantação (`software system instances`), Dinâmico (`you can show software systems, containers, or components`) |
| Contêiner (Container) | "In C4, a container is an application or a data store." (container) | Contêiner (primário), Componente (apoio, `Containers (within the software system in scope)`), Implantação (`container instances`), Dinâmico |
| Componente (Component) | "Primary elements: Components within the container in scope." (component). A página `diagrams/component` não define o termo em prosa própria, delega à página `abstractions/component`, não lida nesta pesquisa | Componente (primário), Dinâmico |
| Elemento de código (Code) | "Primary elements: Code elements (e.g. classes, interfaces, objects, functions, database tables, etc) within the component in scope." (code) | Só no diagrama de código |
| Nó de implantação (Deployment Node) | "A deployment node represents where an instance of a software system/container is running; perhaps physical infrastructure..., virtualised infrastructure..., containerised infrastructure..., an execution environment... Deployment nodes can be nested." (deployment) | Só no diagrama de implantação |
| Nó de infraestrutura (Infrastructure Node) | "You may also want to include infrastructure nodes such as DNS services, load balancers, firewalls, etc." (deployment) | Só no diagrama de implantação, como elemento de suporte. A página não dá a este nó uma frase de definição estrutural equivalente à do nó de implantação, só o exemplo citado |
| Fronteira de sistema (system boundary) | Nenhuma página primária nomeia esta abstração com frase própria. Implícita em todo "Scope: A single software system" e nas imagens de exemplo. Nomeada explicitamente só na fonte de apoio (Devoxx, slide do C4-PlantUML): "system boundary (dashed)" | Contêiner e Componente, por implicação estrutural do escopo |
| Relação (relationship) | "Every line should represent a unidirectional relationship." (notation) | Todos os sete tipos |

## 2. Os sete tipos de diagrama

| Tipo | Mostra | Elementos admitidos | Recomendado |
| --- | --- | --- | --- |
| Contexto do sistema (Nível 1) | "your system as a box in the centre, surrounded by its users and the other systems that it interacts with" | Primário: o sistema em escopo. Apoio: pessoas e sistemas externos conectados diretamente | "Yes, a system context diagram is recommended for all software development teams" |
| Contêiner (Nível 2) | "the high-level shape of the software architecture and how responsibilities are distributed across it" | Primário: contêineres do sistema em escopo. Apoio: pessoas e sistemas conectados diretamente aos contêineres | "Yes, a container diagram is recommended for all software development teams" |
| Componente (Nível 3) | "the components that reside inside it [container]; including their responsibilities and the technology/implementation details" | Primário: componentes do contêiner em escopo. Apoio: contêineres do sistema em escopo, mais pessoas e sistemas conectados diretamente aos componentes | "No, only create component diagrams if you feel they add value" |
| Código (Nível 4) | "how it [component] is implemented as code; using UML class diagrams, entity relationship diagrams or similar" | Elementos de código: classes, interfaces, objetos, funções, tabelas de banco, etc | "No, particularly for long-lived documentation because most IDEs can generate this level of detail on demand" |
| Panorama de sistemas | "a system context diagram without a specific focus on a particular software system" | Pessoas e sistemas de software do escopo escolhido (empresa, organização, departamento) | "Yes, particularly for larger organisations" |
| Dinâmico | "how elements in the static model collaborate at runtime to implement a user story, use case, feature, etc", com interações numeradas | "Your choice: you can show software systems, containers, or components interacting at runtime" | "No, dynamic diagrams should be used sparingly" |
| Implantação | "how instances of software systems and/or containers in the static model are deployed on to the infrastructure within a given deployment environment" | Primário/apoio: nós de implantação, instâncias de sistema e de contêiner. Apoio: nós de infraestrutura | "Yes" |

## 3. Regras de notação

A página de notação abre com a frase que resolve a disputa central desta pesquisa: "The C4 model is notation independent, and doesn't prescribe any particular notation." A independência de notação cobre forma e cor de forma explícita: "Although you may see many example diagrams and tools that make use of blue and grey boxes, this isn't something that is dictated by the C4 model, and you are free to use whatever colours you like!" Forma (shape) nunca vira regra à parte na página. Aparece só dentro do item sobre legenda: "a key/legend explaining the notation being used (e.g. shapes, colours, border styles, line types, arrow heads, etc)."

O que a página exige, em linguagem normativa ("should"):

- Todo diagrama tem título com tipo e escopo.
- Todo diagrama tem legenda explicando a notação usada.
- O tipo de cada elemento é escrito de forma explícita: "The type of every element should be explicitly specified (e.g. Person, Software System, Container or Component)." A frase cita só quatro abstrações, sem "Code".
- Todo elemento tem descrição curta.
- Todo contêiner e todo componente tem tecnologia explícita.
- Toda linha é unidirecional e rotulada, com rótulo específico, não genérico ("avoiding single words like, 'Uses'").
- Relação entre contêineres (comunicação entre processos) tem protocolo ou tecnologia explícita.

A página também aceita abandonar a notação tradicional de caixas e linhas: "there are other, often interactive, visualisations that can be used to show the same C4 model abstractions in very different ways", desde que a legenda torne a notação explícita.

## 4. O catálogo do app contra a documentação

Os quinze tipos de `src/domain/c4/catalog.ts` (app `dok-draw-app`), cada um com o campo `short` que a interface escreve entre colchetes no rótulo, o que cumpre a regra "o tipo de cada elemento é escrito de forma explícita" da seção 3.

| Tipo do catálogo | `short` no app | Abstração C4 | Citação | Veredito |
| --- | --- | --- | --- | --- |
| `person` | Pessoa | Person | "People (e.g. users, actors, roles, or personas)" (system-context) | Fica |
| `external_person` | Pessoa | Person, interno/externo | Nenhuma página primária distingue pessoa interna de externa com frase própria. A distinção existe para sistema ("software systems (external dependencies)... you don't have responsibility or ownership of them", system-context), não para pessoa | Fica como Person. A divisão interno/externo é extensão do app por simetria com sistema, sem citação própria |
| `system` | Sistema de Software | Software System | "The software system in scope" (system-context) | Fica |
| `external_system` | Sistema de Software | Software System, externo | "software systems (external dependencies)... you don't have responsibility or ownership of them" (system-context) | Fica, citação direta |
| `container` | Contêiner | Container, genérico | "In C4, a container is an application or a data store" (container) | Fica |
| `microservice` | Contêiner | Container (metade de uma dupla) | "each 'microservice' being a combination of an API container (hexagon) and a database schema container (cylinder)" (microservices) | Fica. O hexágono da documentação rotula especificamente o contêiner de API de uma dupla microsserviço, não o microsserviço inteiro. A outra metade da dupla (banco de dados) já existe no catálogo como tipo separado (`store`), então o app reproduz a dupla completa com dois elementos, mais preciso que um hexágono único representando o conjunto |
| `browser` | Contêiner | Container (client-side) | "a client-side single-page application" (container) | Fica. Mesma citação e mesma forma de desenho (`shape: "browser"`) de `spa`, ver nota abaixo |
| `component` | Componente | Component | "components that reside inside it" (component); "Container or Component" (notation) | Fica |
| `store` | Contêiner | Container (banco de dados) | "a database schema" (container), citação literal | Fica, citação exata |
| `queue` | Contêiner | Container (fila) | Não citada na página container (a busca confirmou zero menção a "message queue" ou "message broker" nessa página). Apoio: Devoxx, slide "Notation", "Container: IBM MQ" | Fica como Container, sem citação na página primária, só em apoio |
| `terminal` | Contêiner | Container (aplicação server-side) | "a server-side web application" (container), citação literal | Fica, citação exata |
| `spa` | Contêiner | Container (client-side SPA) | "a client-side single-page application" (container), citação literal | Fica, citação exata. Ver nota de sobreposição com `browser` |
| `bucket` | Contêiner | Container (armazenamento de objetos) | "an Amazon Web Services S3 bucket" (container), citação literal, igual ao `defaultTechnology` do tipo ("Amazon S3") | Fica, citação exata |
| `folder` | Contêiner | Container (sistema de arquivos) | "a folder on a file system" (container), citação literal, igual ao `defaultTechnology` do tipo ("Sistema de arquivos") | Fica, citação exata. Responde à pergunta da `DDP-222` ("Folder existe no c4 model?"): a página container já cita "a folder on a file system" como exemplo de contêiner, palavra por palavra, sem precisar do Structurizr como apoio |
| `group` | Grupo | Fronteira de sistema | Nenhuma frase própria nas páginas primárias. Apoio: Devoxx, slide do C4-PlantUML, "system boundary (dashed)" | Fica, sem citação na página primária, só em apoio |

Nenhum dos quinze tipos sai da família C4 para virar forma genérica (`DEC-0027`). A lista de exemplos da página container, "a server-side web application, a client-side single-page application, a desktop application, a mobile app, a database schema, a folder on a file system, an Amazon Web Services S3 bucket, etc", termina em "etc": é lista aberta de exemplos de tecnologia, não taxonomia fechada de tipos. Cinco dos quinze tipos (`store`, `terminal`, `spa`, `bucket`, `folder`) batem palavra por palavra com um item dessa lista. Os outros dez ficam sustentados pela abstração Container em geral, mais a regra da página de notação de que forma e cor não são prescritas pelo modelo.

**Sobreposição entre `browser` e `spa`.** Os dois tipos citam a mesma frase da documentação ("a client-side single-page application") e usam a mesma forma de desenho (`shape: "browser"` em `element-shape.tsx`). O catálogo de hoje os trata como tipos distintos, com rótulos diferentes ("Navegador web" e "Aplicação single-page") e a mesma tecnologia padrão ("JavaScript, React"). A documentação não pede dois tipos aqui. Registrado como achado, não como decisão: a fusão ou a distinção fica para quem decide o catálogo, fora do escopo desta pesquisa.

**Evidência mais fraca em `queue` e `group`.** Os dois ficam sustentados só por material de apoio (Devoxx), não pela página primária de container ou notação. Isso não é motivo para sair do C4, porque a página de notação já declara que o modelo não prescreve forma nem cor, mas é uma diferença real de força de citação em relação aos cinco tipos com correspondência literal.

## 5. O que falta ao app

- **Nível de código.** `C4Level` (`src/domain/c4/types.ts`) tem só `context`, `container` e `component`. Não existe elemento de código (classe, interface, objeto, função, tabela) nem diagrama de código.
- **Panorama de sistemas.** Não existe um modo de visão que mostre pessoas e vários sistemas de software ao mesmo tempo, sem foco num sistema só, como a página de panorama descreve ("a system context diagram without a specific focus on a particular software system").
- **Diagrama dinâmico.** `RelationshipStyle` (`sync`, `async`, `dashed`) não tem numeração de interação nem um modo de diagrama que mostre colaboração em tempo de execução como sequência numerada.
- **Nó de implantação e nó de infraestrutura.** Nenhum dos dois existe em `ELEMENT_TYPE_META`. O inventário de formas da `DDP-247` já tinha apontado a lacuna geométrica correspondente (primitiva 24, "Cubo em perspectiva", para o `Node` de implantação do UML), sem repetir a investigação aqui.

## Lacuna declarada

A `DEC-0029` perguntou se a figura de exemplo da página de microsserviços conta como documentação. Resposta desta pesquisa: conta como citação válida para a forma (hexágono rotulado explicitamente na prosa da página, não só numa imagem sem texto), mas com peso menor que uma regra de notação formal, porque a página não tem seção própria de notação e o hexágono aparece uma única vez, dentro da legenda de uma figura específica (Stage 2). Os vereditos da seção 4 usam essa citação para `microservice`, marcada com a ressalva de que o hexágono da documentação nomeia o contêiner de API de uma dupla, não o microsserviço inteiro.

A fusão ou não de `browser` e `spa` (seção 4) e a decisão sobre guardar `queue` e `group` com evidência só de apoio ficam para quem decide o catálogo. Este inventário não decide, só levanta.
