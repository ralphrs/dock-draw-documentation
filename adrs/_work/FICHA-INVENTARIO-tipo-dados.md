# Ficha de inventário: tipos 19 e 20 (dados)

Levantamento pedido pela `DEC-0026`, tipos 19 (Pipeline de dados) e 20 (Linhagem de dados). Reaproveita as dez primitivas de `src/components/editor/element-shape.tsx` (app `dok-draw-app`), `rect`, `boundary`, `person`, `cylinder`, `pipe`, `hexagon`, `browser`, `terminal`, `bucket`, `folder`, e as oito primitivas novas já identificadas em `adrs/_work/INVENTARIO-formas-por-diagrama.md`: elipse, losango, triângulo, paralelogramo, documento, nuvem, nota, texto solto.

## Tipo 19: Pipeline de dados

Notação de referência: DFD clássico, nas variantes Gane-Sarson e Yourdon-DeMarco, funcionalmente equivalentes e com quatro elementos em comum: processo, armazenamento de dados, entidade externa e fluxo de dados ([Visual Paradigm, "DFD Symbols: Mastering Data Flow Diagram Notation"](https://skills.visual-paradigm.com/docs/mastering-data-flow-diagram-leveling-and-balancing/core-concepts-and-foundations/dfd-symbols-data-flow-diagram-notation/), consultado em 2026-09-21). As duas variantes diferem no traço de processo e de armazenamento. Gane-Sarson usa retângulo de cantos arredondados para processo e retângulo aberto para armazenamento. Yourdon-DeMarco usa círculo para processo e par de linhas paralelas para armazenamento ([Lucid, "Data Flow Diagram Symbols"](https://lucid.co/diagram/dfd/symbols-and-notation), consultado em 2026-09-21). O Yourdon-DeMarco original é de 1978.

| Forma | Representa | Primitiva |
| --- | --- | --- |
| Retângulo de cantos arredondados | Processo, notação Gane-Sarson | `rect`, existente, raio maior que zero |
| Círculo | Processo, notação Yourdon-DeMarco | Elipse, primitiva nova já identificada, com largura igual à altura |
| Retângulo | Entidade externa (fonte ou destino de dado, fora do sistema) | `rect`, existente, raio zero |
| Retângulo aberto (três lados, sem o lado direito) | Armazenamento de dados, notação Gane-Sarson | Primitiva nova, fora das dez existentes e das oito já identificadas |
| Par de linhas horizontais paralelas | Armazenamento de dados, notação Yourdon-DeMarco | Mesma primitiva nova acima, variante de traço do mesmo elemento |
| Seta rotulada com o nome do dado que flui | Fluxo de dados | `C4Edge`, existente. O rótulo de aresta já é editável no canvas (`c4-edge.tsx`, `onLabel`) |

Das quatro formas do DFD, entidade externa e fluxo de dados reaproveitam primitiva existente sem alteração. O processo reaproveita `rect` na variante Gane-Sarson e a elipse já identificada na variante Yourdon-DeMarco. O armazenamento de dados é a única forma sem primitiva equivalente nas duas notações, nem entre as dez existentes nem entre as oito já identificadas.

## Tipo 20: Linhagem de dados

Situação declarada na `DEC-0026`: não previsto, porque "a ligação sai de uma coluna, não da forma inteira". O dbt Explorer confirma essa granularidade: a lineage no nível de coluna parte do cartão da coluna, na aba Columns de um recurso do Catalog, e a aresta liga a coluna de origem à coluna de destino, marcada por tipo de transformação (passthrough ou rename), não a tabela inteira ([dbt Developer Hub, "Column-level lineage"](https://docs.getdbt.com/docs/explore/column-level-lineage), consultado em 2026-09-21). O Collibra Data Lineage confirma o mesmo recorte no grafo de linhagem técnica: a relação é desenhada entre colunas, não entre tabelas inteiras ([Collibra Product Resource Center, "The technical lineage graph"](https://productresources.collibra.com/docs/collibra/latest/Content/CollibraDataLineage/ref_technical-lineage-graph.htm), consultado em 2026-09-21). Nenhuma das duas fontes documenta o layout exato do cartão de coluna, o que fica como lacuna de referência visual específica de lineage.

| Forma | Representa | Primitiva |
| --- | --- | --- |
| Cartão com título (tabela, modelo ou schema) e lista de colunas, uma por linha, no formato do componente Database Schema Node do `@xyflow/react` (abaixo) | Tabela ou modelo de dados, unidade de linhagem | Primitiva nova. Nenhuma das dez existentes nem das oito já identificadas tem lista interna de itens. É a mesma lacuna do compartimento de atributos que a `DEC-0026` cita para o tipo 18 (Entidade-relacionamento), não coberta hoje em `element-shape.tsx` nem em `src/domain/c4/catalog.ts` |
| Seta entre colunas | Fluxo de linhagem entre uma coluna de origem e uma coluna de destino | `C4Edge`, existente para o traço e a ponta. O ponto de saída e de chegada é o requisito novo, descrito abaixo |

> [!WARNING]
> Lacuna: o ponto de conexão por linha dentro de uma forma composta não existe no mecanismo de aresta atual, e nenhuma das dezoito primitivas (dez existentes, oito já identificadas) resolve isso sozinha, porque o problema não é de forma geométrica. Dono: camada de edição (Diagram Studio), decisão de ADR.

O mecanismo de conexão hoje é flutuante e por contorno. `borderPoint` em `c4-edge.tsx` (linhas 153 a 162) calcula o ponto na borda do retângulo delimitador do nó, na direção do outro extremo da aresta, e ignora qualquer estrutura interna do nó. `C4Node` (`c4-node.tsx`, linhas 68 a 85) declara quatro `Handle` de origem e quatro de destino, um por lado (`SIDES`), sem `id` por linha interna. Uma coluna dentro do cartão de linhagem exigiria um `Handle` com `id` próprio por linha, e a aresta precisaria de `sourceHandle` e `targetHandle` apontando para esse `id`, não para `borderPoint`.

O componente Database Schema Node do `@xyflow/react`, mesma base do Diagram Studio, resolve esse mesmo problema em outro domínio (schema de banco de dados). Cada linha da tabela declara dois `Handle`, esquerdo e direito, com `id` igual ao nome da coluna, e a aresta liga um `id` de linha a outro por `sourceHandle` e `targetHandle`, não o nó inteiro ([xyflow, "Database Schema Node"](https://reactflow.dev/ui/components/database-schema-node), consultado em 2026-09-21). O mecanismo de `id` por `Handle` que sustenta isso está documentado em [xyflow, "Handles"](https://reactflow.dev/learn/customization/handles) (consultado em 2026-09-21).

A forma composta (cartão com lista de colunas) é uma primitiva nova de geometria. O ponto de conexão por linha é uma capacidade nova do mecanismo de aresta, que nenhuma primitiva de forma resolve por si.
