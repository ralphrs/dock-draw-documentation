# Inventário de formas por tipo de diagrama

Levantamento pedido pela `DEC-0026`, para os 24 tipos de diagrama que o Diagram Studio precisa cobrir. A ordem de entrega segue a `DEC-0027`: formas básicas e ícones de tecnologia primeiro, os 24 tipos da tabela depois. As dez formas primitivas de hoje estão em `src/components/editor/element-shape.tsx` (app `dok-draw-app`): `rect` (padrão, retângulo com raio configurável), `boundary`, `person`, `cylinder`, `pipe`, `hexagon`, `browser`, `terminal`, `bucket`, `folder`. As arestas (`src/components/editor/c4-edge.tsx`) já têm ponta de seta (`arrow`, `open`, `diamond`, `circle`, `none`), roteamento (`straight`, `orthogonal`, `curved`) e traço (contínuo, tracejado, pontilhado assíncrono).

## 1. Formas básicas e setas básicas

Referência: família "General" do draw.io, [fluxograma básico](https://www.drawio.com/docs/getting-started/basic-flowchart/) e [quantas formas um diagrama técnico precisa](https://www.drawio.com/docs/best-practice/technical-diagramming-shapes/), consultadas em 2026-09-21. Diagrama conceitual sem notação, para quem não quer C4 nem UML.

| Forma pedida (`DEC-0027`) | Primitiva |
| :--- | :--- |
| Retângulo | `rect`, existente, raio zero |
| Retângulo arredondado | `rect`, existente, raio maior que zero |
| Elipse | primitiva nova |
| Losango | primitiva nova |
| Triângulo | primitiva nova |
| Paralelogramo | primitiva nova |
| Hexágono | `hexagon`, existente |
| Cilindro | `cylinder`, existente |
| Documento (retângulo com base ondulada) | primitiva nova |
| Nuvem | primitiva nova |
| Nota (retângulo com canto dobrado, notação UML) | primitiva nova |
| Texto solto | primitiva nova. Visualmente é `rect` sem preenchimento nem borda, mas precisa de identificador de forma próprio: sem ele, redimensionar ou reconectar trataria o texto como retângulo |
| Contêiner | `boundary`, existente. Já é o retângulo tracejado de agrupamento |

Cinco das treze reaproveitam primitiva existente. Oito são novas: elipse, losango, triângulo, paralelogramo, documento, nuvem, nota, texto solto.

### Setas básicas

Já cobertas pelo `C4Edge` de hoje, sem primitiva nova:

| Pedido (`DEC-0027`) | Onde já existe |
| :--- | :--- |
| Traço contínuo | `relStyle` padrão (`sync`), sem `strokeDasharray` |
| Traço tracejado | `relStyle: "dashed"`, `strokeDasharray: "8 6"` |
| Rota reta | `routing: "straight"` |
| Rota ortogonal | `routing: "orthogonal"` |
| Rota curva | `routing: "curved"` |
| Ponta de seta (preenchida) | `EdgeEnding: "arrow"` |
| Ponta aberta | `EdgeEnding: "open"` |
| Ponta losango | `EdgeEnding: "diamond"` |
| Ponta nenhuma | `EdgeEnding: "none"` |

`C4Edge` também tem `circle` como ponta e `async` como traço pontilhado, não pedidos pela `DEC-0027`, sem custo adicional por já existirem.

## 2. Ícones de tecnologia

Duas fichas separadas, `superpowers:dispatching-parallel-agents`, porque cada fornecedor tem regra de marca própria, separada da licença do arquivo.

### CNCF e Kubernetes

Ficha completa em `adrs/_work/FICHA-INVENTARIO-icones-cncf.md`. O caso não é análogo ao da AWS (`DEC-0023`). O `LICENSE.md` do repositório `cncf/artwork` não é licença de conteúdo, aponta para a regra de marca da Linux Foundation ([linuxfoundation.org/legal/trademark-usage](https://www.linuxfoundation.org/legal/trademark-usage), consultada em 2026-09-21), que trata o logotipo como selo de compatibilidade e proíbe uso comercial fora do expressamente permitido, sem autorização escrita. As diretrizes de marca da CNCF ([cncf.io/brand-guidelines](https://www.cncf.io/brand-guidelines/)) dizem "Don't use our logo or incorporate our logo into yours" e "check in with us before using our logo on ... products ... or other commercial or product use". As diretrizes específicas do logotipo do Kubernetes ([kubernetes/kubernetes, `logo/usage_guidelines.md`](https://github.com/kubernetes/kubernetes/blob/master/logo/usage_guidelines.md)) só abrem exceção para uso não comercial.

Faltam as duas peças que sustentaram a `DEC-0023` para a AWS: permissão explícita de uso e licença de conteúdo redistribuível. Nenhuma das duas existe aqui.

**Recomendação:** não incluir logotipos CNCF nem Kubernetes como forma do Diagram Studio sem autorização escrita prévia da Linux Foundation. **Alternativa descartada:** tratar como o caso AWS, aceitando risco residual sem a base que sustentou aquela decisão. **Custo aceito:** esta família de ícones fica bloqueada até autorização ou decisão explícita do humano assumindo o risco, e a mesma checagem se repete por projeto (Prometheus, Envoy, containerd, etcd) fora do guarda-chuva geral.

### Linguagens de programação e infraestrutura fora do CNCF

Ficha completa em `adrs/_work/FICHA-INVENTARIO-icones-linguagens-infra.md`. Fonte de arquivo: `simple-icons` (CC0 1.0, `LICENSE.md`), com `DISCLAIMER.md` próprio separando licença do arquivo SVG da marca de cada logotipo, campo por ícone. Reserva: `devicon` (`devicons/devicon`, MIT), aviso de marca só em parágrafo de README, sem a mesma granularidade.

Amostra de três regras de marca, verificadas com link e data (2026-09-21): Python Software Foundation libera só uso nominativo de compatibilidade. Docker exige permissão prévia por escrito para qualquer uso fora de citação referencial limitada, cobrindo pela leitura literal o caso de biblioteca de forma comercial. PostgreSQL é o único dos três que abre uma zona de uso sem aprovação prévia, logotipo intacto, sem afirmação de afiliação.

**Recomendação:** `simple-icons` como fonte primária, `devicon` de reserva, mesma regra de exibição da `DEC-0023` (ícone intacto, moldura do DokDraw, atribuição visível). Diferente da AWS, nenhum dos três fornecedores da amostra autoriza explicitamente o caso "SaaS comercial vende o logo como forma de diagrama". **Alternativa descartada:** pedir autorização formal a cada fornecedor antes de publicar, e desenhar ícone próprio sem reproduzir o logo oficial. **Custo aceito:** risco jurídico não uniforme por fornecedor (Docker é o mais restritivo da amostra), conferência manual que não escala para centenas de logotipos sem processo repetível, e nenhuma das três políticas declara cadência de atualização.

## 3. Os 24 tipos, por família de notação

Oito fichas, uma por família, `superpowers:dispatching-parallel-agents`. Cada ficha tem a tabela completa de formas, a notação de referência com link e o que o tipo pede além de forma. Esta seção resume tipo por tipo e aponta para a ficha.

### C4 (tipo 1)

Ficha: `adrs/_work/FICHA-INVENTARIO-tipo-c4.md`. Os 15 tipos de elemento de `C4_ELEMENT_TYPES` já mapeiam para primitiva existente (`person`, `box`/`rect`, `hexagon` para microsserviço, `browser`, `terminal`, `cylinder`, `pipe`, `bucket`, `folder`, `boundary`). Nível de código (nível 4) é lacuna total: sem primitiva, sem campo de compartimento em `C4Element`. Notação: [c4model.com/diagrams/notation](https://c4model.com/diagrams/notation) e [c4model.com/diagrams/code](https://c4model.com/diagrams/code), consultadas em 2026-09-21, que delega o nível de código a "UML class diagrams... or similar". Nível de código reaproveita as formas de classe UML (tipo 2), sem antecipar conteúdo, e só quando a fatia de compartimento existir.

### UML 2.5.1 (tipos 2, 3, 4, 5, 6, 7, 8, 14)

Ficha: `adrs/_work/FICHA-INVENTARIO-tipo-uml.md`. Notação: PDF normativo `formal/17-12-05` em [omg.org/spec/UML/2.5.1/PDF](https://www.omg.org/spec/UML/2.5.1/PDF), consultado em 2026-09-21, com clause e página citadas por tipo. Nenhum dos oito tipos tem implementação no app hoje.

| Tipo | Situação (`DEC-0026`) | O que a ficha achou |
| :--- | :--- | :--- |
| 2. Classes | Previsto | Compartimento (nome/atributos/métodos), pirulito/soquete e porta para interface |
| 3. Componentes | Previsto | Mesma porta e pirulito/soquete de Classes |
| 4. Pacotes | Não previsto | Cobre inteiro com `folder`, existente, sem forma nova |
| 5. Sequência | Previsto, posição derivada | Linha de vida, barra de ativação, moldura de interação, marca de destruição |
| 6. Atividades | Previsto | Nó inicial/final, bifurcação/junção, raia com eixo |
| 7. Casos de uso | Previsto | Ator reaproveita `person`; extension point pede compartimento |
| 8. Máquina de estados | Previsto | Compartilha nó inicial/final e bifurcação com Atividades; soma aba de nome, histórico, ponto de conexão, sinal |
| 14. Implantação | Previsto | Cubo em perspectiva para `Node`; `Artifact` reaproveita `documento`, já identificado |

Dezesseis primitivas novas ao todo, listadas na tabela final. Duas lacunas fora de forma: a spec não define o `Gate` de Sequência, e falta ponta de diamante vazado/triângulo fechado no vocabulário de `EdgeEnding`.

### Enterprise Integration Patterns (tipo 9)

Ficha: `adrs/_work/FICHA-INVENTARIO-tipo-eip.md`. Notação: [enterpriseintegrationpatterns.com/patterns/messaging](https://www.enterpriseintegrationpatterns.com/patterns/messaging/), ícones conferidos por inspeção visual, não só por texto, em 2026-09-21. Quatro formas reaproveitam `pipe` (canal, ponto a ponto, publish-subscribe, dead letter). Message é composta nova, no molde de `person`. Router, Filter, Translator, Endpoint, Aggregator e Splitter compartilham um mecanismo novo, retângulo com pictograma interno, no molde de `terminal`/`browser`. Dead Letter Channel soma um octógono sem primitiva hoje. Publish-Subscribe pede ponta de aresta bifurcada, que `EdgeEnding` não tem.

### Rede e nuvem (tipos 10, 11, 12, 13, 15, 16)

Ficha: `adrs/_work/FICHA-INVENTARIO-tipo-rede-nuvem.md`. Zero formas geométricas novas: os seis tipos usam as dez primitivas e as oito já identificadas, com `nuvem` servindo de fronteira externa nos tipos 15 e 16. Falta é de catálogo, não de geometria: tópico e broker genéricos, função serverless (usa `rect`, não `hexagon`, para não colidir com microsserviço), gateway, load balancer, roteador, switch, firewall, servidor. O catálogo já tem `queue` com forma `pipe`, então "fila genérica" do tipo 12 já existe em parte, corrigindo a "situação" da `DEC-0026`.

Licença de ícone de fornecedor, verificada em 2026-09-21: **Azure**, mesmo regime da AWS (`DEC-0023`), permissão explícita em [learn.microsoft.com/azure/architecture/icons](https://learn.microsoft.com/en-us/azure/architecture/icons/). **Cisco**, regime mais próximo de AWS/Azure que de CNCF, mas evidência mais fraca ("you may use them freely, but you may not alter them", sem "para diagrama" explícito), sem formato SVG oficial, só EPS/JPG/Visio/PowerPoint.

**Google Cloud, conferido em 2026-09-21, lacuna real, não de busca.** [cloud.google.com/icons](https://cloud.google.com/icons) só carrega o catálogo de ícones por JavaScript, mas o HTML estático da página (lido direto, sem renderizar JS) já chega com a `<meta name="description">`: *"Official Google Cloud icons to build your own architectural diagrams or reference architectures."* Fora essa frase de propósito, a página não tem nenhuma cláusula de licença, uso comercial, alteração ou atribuição: o rodapé só linka os termos genéricos do site ([policies.google.com/terms](https://policies.google.com/terms)) e do Google Cloud como produto ([cloud.google.com/product-terms](https://cloud.google.com/product-terms)), os mesmos de qualquer página do domínio, não específicos de ícone. O guia oficial vinculado na própria página, `google-cloud-product-icons.pdf` (34 páginas, baixado e lido por inteiro em 2026-09-21), é só catálogo de qual ícone representa qual produto: zero texto de termos, licença ou permissão em qualquer página. Os termos gerais de marca da Google (Partner Marketing Hub, [partnermarketinghub.withgoogle.com/brands/google/trademarks-and-terms/terms-and-conditions](https://partnermarketinghub.withgoogle.com/brands/google/trademarks-and-terms/terms-and-conditions/), consultados na mesma data) exigem aprovação prévia por formulário para qualquer uso de "Google Brand Features", com aviso de atribuição obrigatório se aprovado, sem exceção de uso nominativo ou descritivo. **Veredito: não é o regime de AWS/Azure.** Não há permissão explícita para uso em diagrama, nem licença de redistribuição como a CC-BY-ND da AWS; o único texto favorável é a frase de propósito da meta tag, sem força de cláusula legal. Decisão de uso (aguardar aprovação formal, tratar como Cisco, ou não incluir Google Cloud no inventário de ícones) fica para o humano.

O aninhamento região > VPC > sub-rede (tipo 10) reaproveita `adrs/_work/FICHA-ADR015-conteineres.md`, sem repetir a investigação.

### Pipeline de CI/CD (tipo 17)

Ficha: `adrs/_work/FICHA-INVENTARIO-tipo-cicd.md`. Notação: grafo de pipeline do [GitLab CI](https://docs.gitlab.com/ci/pipelines/), reforçado pelo mesmo padrão em Jenkins Blue Ocean e GitHub Actions, consultadas em 2026-09-21. Zero formas novas: estágio, job, gate de aprovação, artefato, trigger e ambiente de destino mapeiam para `rect`, `boundary`, losango, documento e elipse, já identificados.

Licença de ícone de ferramenta, todas bloqueadas sem autorização escrita: Jenkins tem CC BY-SA 3.0 só para variações artísticas da comunidade, o logotipo padrão segue a mesma regra de marca da Linux Foundation que bloqueia Kubernetes. GitHub Actions, GitLab CI e CircleCI exigem permissão ou licença escrita explícita. Argo está sob o guarda-chuva CNCF, já bloqueado.

### Entidade-relacionamento (tipo 18)

Ficha: `adrs/_work/FICHA-INVENTARIO-tipo-erd.md`. Notação: Crow's Foot, referência draw.io ER shapes, consultada em 2026-09-21. Entidade é compartimento novo (retângulo com cabeçalho e lista de atributos, destaque de chave primária e estrangeira). Atributo estilo Chen reaproveita elipse, sem uso na notação de referência. Relacionamento reaproveita `C4Edge`, mas a cardinalidade Crow's Foot exige sistema de ponta de aresta novo: hoje `EdgeEnding` tem cinco valores (`none`, `arrow`, `open`, `diamond`, `circle`), nenhum é pé de galinha nem círculo com traço.

### Pipeline e linhagem de dados (tipos 19, 20)

Ficha: `adrs/_work/FICHA-INVENTARIO-tipo-dados.md`. Tipo 19, DFD (Gane-Sarson e Yourdon-DeMarco, [Visual Paradigm](https://skills.visual-paradigm.com/docs/mastering-data-flow-diagram-leveling-and-balancing/core-concepts-and-foundations/dfd-symbols-data-flow-diagram-notation/) e [Lucid](https://lucid.co/diagram/dfd/symbols-and-notation), 2026-09-21): processo reaproveita `rect` ou elipse conforme a variante, entidade externa reaproveita `rect`, fluxo reaproveita `C4Edge`. Armazenamento de dados (retângulo aberto ou linhas paralelas) é a única forma sem primitiva.

Tipo 20, linhagem no nível de coluna ([dbt Developer Hub](https://docs.getdbt.com/docs/explore/column-level-lineage) e [Collibra](https://productresources.collibra.com/docs/collibra/latest/Content/CollibraDataLineage/ref_technical-lineage-graph.htm), 2026-09-21): cartão com lista de colunas é o mesmo compartimento novo do tipo 18 (ERD). A ligação sai de uma coluna, não do nó inteiro: `borderPoint` em `c4-edge.tsx` conecta sempre ao contorno, e `C4Node` só tem quatro `Handle` fixos por lado, sem `id` por linha. O padrão de referência é o Database Schema Node do `@xyflow/react` ([reactflow.dev/ui/components/database-schema-node](https://reactflow.dev/ui/components/database-schema-node), 2026-09-21), `Handle` com `id` por coluna.

### Eixo de tempo e comparação (tipos 21, 22, 23, 24)

Ficha: `adrs/_work/FICHA-INVENTARIO-tipo-tempo-comparacao.md`. O quadro livre da `DEC-0021` não cobre nenhum dos dois comportamentos que esta família pede. Cada tipo é avaliado contra as três alternativas de mecanismo da `DEC-0026` (modo próprio, posição derivada, comparação entre versões da `DEC-0019`), sem decidir entre elas, decisão do ADR 015.

Roadmap (21) e Gantt (23) reaproveitam `boundary` (swimlane), `rect` (cartão ou barra) e losango (marco), e somam régua com eixo de tempo, sem primitiva hoje. Gantt deriva posição e largura de duas datas, mais caro que a sequência UML, que deriva só posição. Ciclo de vida (24) soma barra com múltiplos segmentos internos coloridos por estágio, sem campo equivalente em `model_elements`. AS-IS vs. TO-BE (22) não usa eixo de tempo: reaproveita as formas do diagrama comparado e encaixa melhor na alternativa de comparação entre versões, que esbarra na lacuna já declarada pela `DEC-0019` sobre navegação de histórico pela interface.

## 4. Tabela de formas primitivas novas

Consolidação das oito fichas. É desta tabela que saem os épicos da sessão D, um por forma (`DEC-0026`).

| # | Primitiva nova | Natureza | Tipos que dependem |
| :-- | :--- | :--- | :--- |
| 1 | Elipse | geometria simples | Básicas; 19 (processo Yourdon-DeMarco) |
| 2 | Losango | geometria simples | Básicas; 21, 23, 24 (marco) |
| 3 | Triângulo | geometria simples | Básicas |
| 4 | Paralelogramo | geometria simples | Básicas |
| 5 | Documento | geometria simples | Básicas; 14 (Artifact); 17 (artefato de pipeline) |
| 6 | Nuvem | geometria simples | Básicas; 10, 13, 15, 16 (fronteira externa de rede) |
| 7 | Nota | geometria simples | Básicas |
| 8 | Texto solto | geometria simples, identificador próprio | Básicas |
| 9 | Pirulito e soquete (interface) | composta pequena | 2, 3 |
| 10 | Porta | composta pequena | 2, 3 |
| 11 | Moldura de interação (`sd`/`ref`/CombinedFragment) | composta com etiqueta | 5 |
| 12 | Linha de vida | composta, duração derivada | 5 |
| 13 | Barra de ativação | composta | 5 |
| 14 | Marca em X isolada (destruição/término) | geometria simples | 5, 8 |
| 15 | Nó inicial (círculo preenchido) | geometria simples | 6, 8 |
| 16 | Nó final de atividade/estado (círculo em círculo) | geometria simples | 6, 8 |
| 17 | Círculo com X (fluxo final) | geometria simples | 6, 8 |
| 18 | Barra de bifurcação/junção | geometria simples | 6, 8 |
| 19 | Raia de atividade, com eixo | mecanismo de grade | 6 |
| 20 | Aba de nome do estado composto | composta pequena | 8 |
| 21 | Pseudo-estado de histórico (H/H*) | composta pequena | 8 |
| 22 | Ponto de conexão de entrada | composta pequena | 8 |
| 23 | Sinal (bandeira) | geometria simples | 8 |
| 24 | Cubo em perspectiva (Node de implantação) | geometria simples | 14 |
| 25 | Message (círculo mais dois blocos) | composta | 9 |
| 26 | Retângulo com pictograma interno reaproveitável | mecanismo de ícone interno, seis variantes | 9 (Router, Filter, Translator, Endpoint, Aggregator, Splitter) |
| 27 | Octógono (selo Dead Letter) | geometria simples pequena | 9 |
| 28 | Compartimento, lista interna de linhas editáveis | mecanismo estrutural | 2, 7, 8, 18, 20 |
| 29 | Armazenamento de dados DFD (retângulo aberto ou linhas paralelas) | geometria simples | 19 |
| 30 | Régua com eixo de tempo | mecanismo de grade | 21, 23, 24 |

### Capacidade de mecanismo, não de forma

Três achados não cabem na tabela acima porque não são geometria de nó, são capacidade nova do editor:

- **Ponto de conexão por linha interna.** Hoje `borderPoint` (`c4-edge.tsx`) conecta sempre ao contorno do nó. A linhagem de dados (tipo 20) precisa de `Handle` com `id` por linha dentro do compartimento (item 28), no padrão do Database Schema Node do `@xyflow/react`.
- **Ponta de aresta bifurcada.** Publish-Subscribe Channel (tipo 9) marca cópia a cada receptor com um garfo na ponta, fora do vocabulário atual de `EdgeEnding` (`arrow`, `open`, `diamond`, `circle`, `none`).
- **Cardinalidade Crow's Foot.** Entidade-relacionamento (tipo 18) marca a ponta da aresta com símbolo próprio (pé de galinha, traço duplo, círculo com traço), um sistema de ponta inteiro, não um valor a mais em `EdgeEnding`.

## Lacuna declarada

A ordem de prioridade entre as formas da tabela acima não foi dada. A `DEC-0027` só fixa que formas básicas e ícones de tecnologia vêm antes dos 24 tipos; a ordem dentro dos 24 tipos é pergunta aberta ao humano, mesma lacuna que a `DEC-0026` já registrava.

Autorização CNCF/Kubernetes/ferramentas de CI/CD depende de decisão fora do alcance desta pesquisa, listada na seção correspondente. Google Cloud já foi conferido com navegador (seção "Rede e nuvem"): a lacuna não é mais de busca automatizada, é a ausência real de termos na fonte, e a decisão de uso fica com o humano.
