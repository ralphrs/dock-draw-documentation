# DEC-0033: famílias de diagrama a partir da referência visual do humano

**Data:** 2026-09-22
**Quem decidiu:** humano, em comentário na `DDP-405`, com dezenove imagens de referência anexadas ao card
**Alcance:** catálogo de formas do Diagram Studio (`DEC-0027`, `DEC-0030`), fila da sessão D, um estudo da sessão B

## A decisão

O humano fixou, por exemplo visual, o que o Diagram Studio precisa desenhar:

1. **Nuvens no estilo dos diagramas de arquitetura de cada provedor.** AWS com regiões e ícones oficiais em quadrado de categoria, Azure com contêineres azul-claro aninhados, OCI com o conjunto vermelho e sub-redes tracejadas, Google Cloud com ícones em cartão e contêineres pontilhados. Faltavam os contêineres de Google Cloud e OCI e um diagrama de referência por provedor.
2. **Linha do tempo**, em três formas: cronograma com barras por período, serpentina com marcos numerados e infográfico com círculos e ícone. Exige componentes novos: eixo com divisões, marco, barra de período, conector serpentino, legenda.
3. **UML moderno**: sequência, atividade com raias, classe, caso de uso, máquina de estados e DFD, com cabeçalhos coloridos, cantos arredondados e rótulo em pílula.
4. **Estilo rascunho** e **rascunho velho**: modo de renderização do diagrama inteiro com traço de mão e fonte manuscrita. Passa por estudo de viabilidade antes de prancha.
5. **BPMN 2.0 completo**, todos os símbolos da referência da Camunda (68 eventos, 15 atividades, 4 gateways, dados, artefatos, pool e raia, conectores).
6. **Ícones Lucide como forma**, família própria com busca. Não reabre a `DEC-0027`, que descartou a Lucide só como substituta de ícone de nuvem.

## Onde isso virou trabalho

| Épico | Chave | Sessão |
| --- | --- | --- |
| Contêineres Google Cloud | `DDP-455` | D |
| Contêineres OCI | `DDP-459` | D |
| Diagrama de referência por nuvem | `DDP-463` | D |
| Linha do tempo | `DDP-468` | D |
| UML moderno | `DDP-473` | D |
| BPMN 2.0 completo | `DDP-479` | D |
| Estilo rascunho | `DDP-484` | B (estudo), depois D |
| Ícones Lucide como forma | `DDP-487` | D |

Ordem na fila da sessão D: depois da `DDP-451` (estrutura do Figma) e das correções em andamento, por chave. UML e BPMN dependem das pontas e traços da fase 1 da seta (`DDP-454`). O diagrama de referência por nuvem depende das molduras e contêineres da nuvem já aprovados.

## Custo aceito e alternativa descartada

Custo: a fila da sessão D cresce em cerca de trinta tarefas, e o app só recebe ordem depois de cada família ser aprovada em prancha, como manda a `DEC-0007`. Alternativa descartada: mandar as famílias direto ao Lovable sem prancha, o que repetiria o retrabalho visto nas formas básicas antes do kit.
