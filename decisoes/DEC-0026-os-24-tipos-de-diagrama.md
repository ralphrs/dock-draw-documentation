# DEC-0026: o Diagram Studio cobre os 24 tipos de diagrama da lista do humano

**Data:** 2026-09-21
**Quem decidiu:** humano, em comentário na `DDP-184`: "Preciso que considere shapes para todos esses diagramas"
**Alcance:** escopo de formas do Diagram Studio, ADR 015 e fila da sessão D

## A decisão

O Diagram Studio precisa ter formas para os 24 tipos de diagrama abaixo. A lista entra no escopo do ADR 015 ao lado das doze famílias de `adrs/_work/ADR-015-escopo.md`.

| # | Tipo | Situação em 2026-09-21 |
| --- | --- | --- |
| 1 | Modelo C4 (contexto, contêineres, componentes e código) | Previsto, menos o nível de código, que o editor não tem |
| 2 | Classes | Previsto (UML) |
| 3 | Componentes | Previsto (UML) |
| 4 | Pacotes | Não previsto |
| 5 | Sequência | Previsto (UML), com posição derivada |
| 6 | Atividades | Previsto (UML) |
| 7 | Casos de uso | Previsto (UML) |
| 8 | Máquina de estados | Previsto (UML) |
| 9 | Arquitetura de integração | Em parte: faltam os Enterprise Integration Patterns |
| 10 | Topologia de rede virtual | Previsto (contêineres de nuvem) |
| 11 | Computação e serverless | Previsto (nuvem) |
| 12 | Serverless e orientado a eventos | Em parte: faltam broker, tópico e fila genéricos |
| 13 | Híbrido e multicloud | Previsto (famílias misturadas no mesmo diagrama) |
| 14 | Implantação | Previsto (UML) |
| 15 | Rede física | Previsto (topologia de redes) |
| 16 | Rede lógica | Previsto (topologia de redes) |
| 17 | Pipeline de CI/CD | Não previsto. Ícones de ferramenta têm licença de marca, uma por fornecedor |
| 18 | Entidade-relacionamento | Previsto (ERD), com compartimentos |
| 19 | Pipeline de dados | Previsto (DFD) |
| 20 | Linhagem de dados | Não previsto. A ligação sai de uma coluna, não da forma inteira |
| 21 | Roadmap de arquitetura | Não previsto. Eixo de tempo |
| 22 | AS-IS vs. TO-BE | Não previsto. Comparação entre dois estados |
| 23 | Gantt de arquitetura | Não previsto. Eixo de tempo |
| 24 | Ciclo de vida de aplicações | Não previsto. Eixo de tempo |

## O que isso pede antes do desenho

A sessão D não decide que formas o produto tem (`DEC-0024`). Antes de novos épicos de forma, a sessão B levanta o inventário: para cada tipo, as formas da notação de referência, a forma primitiva de cada uma, e a licença de todo ícone de terceiro. Os épicos da sessão D saem do inventário, um por forma, no molde da primeira leva.

## Tempo e comparação não são só formas

Roadmap, Gantt e ciclo de vida posicionam o item pela data, não pelo arrasto. AS-IS vs. TO-BE compara dois estados. O quadro livre da `DEC-0021` não cobre nenhum dos dois comportamentos, e o ADR 015 decide como entram: modo próprio do editor, família com posição derivada (problema 4 do escopo) ou comparação entre versões do mesmo diagrama, que a `DEC-0019` já torna possível.

Alternativa descartada: tirar os quatro da lista por não caberem no quadro livre. Encolhe o pedido do humano sem a decisão dele.

## Lacuna declarada

A ordem entre os 24 tipos não foi dada. A primeira leva continua C4 e AWS, e a prioridade das próximas é pergunta aberta ao humano.
