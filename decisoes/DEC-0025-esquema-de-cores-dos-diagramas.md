# DEC-0025: esquema de cores dos diagramas

**Data:** 2026-09-21
**Quem decidiu:** humano, em comentário na `DDP-187`, ao aprovar a forma caixa
**Alcance:** paletas de cor dos elementos no Diagram Studio, no Figma da sessão D e no app

## A decisão

O esquema de cores faz parte da organização visual do diagrama. O padrão inicial é o do próprio app, nos temas claro e escuro: elementos externos em cinza e todos os outros na cor principal do DokDraw, o violeta do token `--primary`.

Além do padrão, o app oferece um esquema **C4 Padrão**, em cinza e azuis, o convencional da notação C4: externos em cinza e os internos em tons de azul.

A troca de cor fica na mão de quem usa o editor. Hoje o app já tem a troca entre esquemas prontos (`src/lib/palette.tsx`). Cor escolhida livremente por elemento ou por esquema próprio fica para depois, sem tarefa aberta.

Alternativa descartada: manter a paleta DokDraw atual, com uma cor por tipo (violeta, verde-azulado, azul e âmbar). Distingue o tipo pela cor, e custa a leitura do diagrama como sistema, que é o que o C4 quer mostrar: dentro e fora.

## O que muda no app

A paleta `dokdraw` de `src/styles.css` troca a cor por tipo pela cor principal. Os tipos internos se distinguem entre si por tom do mesmo violeta, e pela forma e pelo texto do tipo no rótulo, como já acontece. Os tipos externos (`external_person`, `external_system`) ficam em cinza. Entra um esquema novo, `c4`, com o rótulo C4 Padrão.

Os tons exatos, o contraste e as bordas são da sessão D, com validação da sessão A (delegação do humano na `DDP-243`). Contraste mínimo: texto 4,5:1 e borda 3:1 contra o canvas, nos dois temas.

## De quem é o esquema, respondido em 2026-09-21

O esquema de cores pertence ao tenant, não à pessoa. Cada tenant, espaço ou projeto pode criar o próprio esquema, com cor por forma e por tema, claro e escuro. Os esquemas prontos (DokDraw e C4 Padrão) são o ponto de partida.

Hoje o app guarda o esquema como preferência do navegador (`localStorage`), o que contraria a decisão. Onde o esquema é guardado, como tenant, espaço e projeto herdam um do outro, e o que acontece com um diagrama embutido na wiki de outro espaço é decisão do ADR 015, com a tenancy do ADR 013.

Alternativa descartada: esquema por pessoa, como está hoje. Duas pessoas veriam o mesmo diagrama com cores diferentes, e a cor deixa de organizar o diagrama.

## Lacuna declarada

Até o ADR 015 decidir o armazenamento, o app continua com a escolha no navegador. As paletas `iris` e `ntconsult` continuam como estão.
