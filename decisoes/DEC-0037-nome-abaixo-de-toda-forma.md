# DEC-0037: toda forma leva o nome escrito abaixo dela

**Data:** 2026-09-22
**Quem decidiu:** humano, no terminal da sessão A
**Alcance:** Design System e pranchas no Figma, paleta de formas do app, diálogos de escolha de forma

## A decisão

Toda forma tem o nome oficial escrito logo abaixo dela, onde quer que ela apareça para ser escolhida ou consultada. Motivo dado pelo humano: várias formas e ícones são parecidos entre si (molduras de nuvem, cilindros, contêineres, ícones Lucide) e sem o nome a pessoa não sabe qual é qual.

Onde vale:

- **Design System (`design-system-latest`) e toda prancha de draft.** Cada componente e cada exemplo leva uma legenda com o nome oficial da forma abaixo do desenho, na fonte de legenda do kit, cor `muted-foreground`. Entra na arrumação da `DDP-506` e passa a ser critério de aceite de toda consolidação e de toda prancha nova.
- **Paleta do app.** Hoje `PaletteItem` mostra a miniatura com o nome ao lado, numa linha. Quando a paleta virar grade (famílias de nuvem, tecnologia, Lucide, onde o ícone é o que se vê), o nome fica abaixo da miniatura, sempre visível, sem depender de tooltip. Tooltip continua, mas não substitui o nome.
- **Diálogos de escolha** (Mais formas, galeria de modelos da `DDP-502`): mesma regra.

Fora da regra: o elemento no canvas, que já carrega o nome do elemento (não da forma) e a linha de tipo `[categoria: provedor]` decidida na `DDP-360`.

## Onde vira trabalho

| O quê | Card | Sessão |
| --- | --- | --- |
| Legenda com o nome abaixo de todo componente e exemplo do Design System, na arrumação das páginas | `DDP-506` (emenda) | D |
| Prancha da paleta em grade com o nome abaixo de cada forma, nos dois temas, para as famílias de ícone | `DDP-507` | D |

A ordem para o app sai depois da prancha aprovada, por card próprio.

## Custo aceito e alternativa descartada

Custo: a paleta em grade fica mais alta, porque cada célula ganha uma linha de texto, e nomes longos precisam de truncamento com o nome inteiro no tooltip. Alternativa descartada: nome só no tooltip, que exige passar o ponteiro em cada ícone para descobrir o que é.
