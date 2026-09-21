# Ordem DDP-369: defeitos de forma e de rótulo do editor

Issue da ordem: `DDP-370`, rótulo `lovable`.

Cinco defeitos achados pela sessão D ao desenhar as formas, reunidos na `DDP-245`: `DDP-175`, `DDP-181`, `DDP-182`, `DDP-211` e `DDP-215`. Todos em `src/components/editor/element-shape.tsx` (app `dok-draw-app`), exceto o item 3, em `src/domain/c4/catalog.ts`.

## Estado atual

`truncate(text, max)` corta por número de caractere, sem medir a largura real do texto renderizado. `ElementLabels` usa `truncate(name, Math.floor(w / 8))` em dois lugares (caso `boundary` e o caso genérico) e `truncate(description, Math.floor(w / 6))`; a tecnologia usa `truncate(technology, 20)`, teto fixo; o tipo curto (`short`) não passa por `truncate` nenhum. No caso `person` de `renderShape`, a cabeça é `cy={r * 0.55}` e o corpo começa em `bodyY = r * 0.85`. Em `catalog.ts`, `external_person.short` é `"Pessoa"` e `external_system.short` é `"Sistema de Software"`, iguais aos tipos internos correspondentes. No caso `terminal`, o ícone de prompt parte de `x=10`, `y=10` e vai até `x = 10 + 1,5 * size` e `y = 10 + 0,9 * size`, com `size = Math.min(18, h * 0.3)`: no tamanho máximo, até `x=37` e `y` perto de 26, sem relação com a posição do rótulo.

## O que fazer

**1. Tipo curto entra no truncate (`DDP-175`).** Em `ElementLabels`, no texto `[{short}...]` (caso genérico, hoje só a tecnologia trunca), aplique `truncate(short, Math.floor(w / 10))` antes de montar a string. Mesma função `truncate` que a tecnologia já usa, teto calculado pela largura da forma, não mais um número fixo.

**2. Cabeça da forma pessoa (`DDP-181`).** Em `renderShape`, caso `person`, três trocas: `const r = Math.min(28, w * 0.24, h * 0.3)` vira `Math.min(28, w * 0.24, h * 0.25)`, `const headCy = r * 0.55` vira `const headCy = r`, e `const bodyY = r * 0.85` vira `const bodyY = r * 1.3`. O topo do círculo fica em `y = 0`, e a alça de conexão de cima toca a ponta da cabeça em vez de cair dentro dela.

A cabeça agora termina em `y = 2 * r`, e não mais em `y = 1,55 * r`, então o texto precisa descer junto. Em `ElementLabels`, `headR` passa a usar a mesma fórmula nova (`Math.min(28, w * 0.24, h * 0.25)` para `person`, 0 para as outras formas), e as duas contas que usam `headR` para posicionar o texto passam a usar a base da cabeça, `2 * headR`: `top = 2 * headR + 12` e, no alinhamento ao meio, `(2 * headR + h) / 2 - blockHeight / 2 + s.fontSize`. Conta de conferência no mínimo de 120 por 60: `r = 15`, cabeça de 0 a 30, texto centrado entre 30 e 60, sem cruzar a cabeça. No tamanho de referência de 200 por 120: `r = 28`, cabeça de 0 a 56, texto centrado entre 56 e 120.

**3. Rótulo dos tipos externos (`DDP-182`).** Em `ELEMENT_TYPE_META` (`catalog.ts`): `external_person.short` vira `"Pessoa externa"`, `external_system.short` vira `"Sistema externo"`. Mesmo texto que `label` desses dois tipos já usa hoje, só duplicado no campo `short`.

**4. Corte do nome por largura com margem, não por caractere solto (`DDP-211`, `DDP-215`).** Decisão desta ordem: manter o corte por caractere (não medir a largura real do texto renderizado, que exigiria um mecanismo de medição compartilhado entre o canvas do editor e a exportação estática, risco de divergência entre os dois). Em vez disso, a margem de segurança cresce: troque o divisor `8` por `10` nos dois lugares de `ElementLabels` que truncam `name` (caso `boundary`, `Math.floor(w / 10)`, e caso genérico, `Math.floor(w / 10)`). Calibração: a sessão D mediu 112px de texto real (negrito 13px Inter) para um corte de 15 caracteres numa forma de 120px, ≈7,5px por caractere; o divisor 10 deixa margem real (≈25%) sobre o pior caso medido. `description` (`w / 6`) e `technology` (teto fixo `20`) não mudam, fora do escopo dos achados.

**5. Terminal tira o texto do canto do ícone (`DDP-211`).** O ícone de prompt ocupa de `x = 10` a `x = 10 + 1,5 * size`, que dá 37 px no tamanho máximo do ícone (`size = 18`, contando o traço de baixo), e de `y = 10` a perto de `y = 27`. Como o nome é centralizado, descontar só um lado do teto não basta: um nome de 9 caracteres centralizado numa forma de 120 px ainda começa em `x` perto de 23, em cima do traço do ícone. Só no caso `terminal`, a coluna de texto passa a ser a faixa de `x = 40` até `x = w - 8`: o `x` de centro de todas as linhas do rótulo é `(40 + w - 8) / 2`, e o teto de caracteres do nome é `Math.floor((w - 48) / 10)`. Conta de conferência no mínimo de 120 por 60: faixa de 40 a 112, teto de 7 caracteres, perto de 60 px de texto centrado em 76, de 46 a 106, longe do ícone. As outras formas continuam centradas na largura toda.

## O que não fazer aqui

- Não meça a largura real do texto renderizado (`canvas.measureText` ou equivalente): decisão do item 4 é manter o corte por caractere.
- Não toque `truncate(description, ...)` nem `truncate(technology, 20)`.
- Fora o que os itens 2 e 5 mandam, não mexa no layout do texto em `ElementLabels`.
- Não altere `label` nem `defaultTechnology` de nenhum tipo em `catalog.ts`, só os dois campos `short` do item 3.
- Nenhuma migração, nenhuma mudança no formato gravado do diagrama, nenhuma dependência nova.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: o modelo do diagrama vive no Supabase, com nodes e edges controlados pelo estado do app | Todas as correções são de desenho e de rótulo (SVG, texto, catálogo estático), nenhum campo novo, nenhuma migração |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: `[tipo: tecnologia]` longo numa forma estreita agora corta com reticências, sem passar do contorno; a forma pessoa tem o topo da cabeça exatamente no topo da caixa, sem sobra acima, a alça de conexão de cima toca a cabeça, e no mínimo de 120 por 60 o texto não cruza a cabeça; pessoa externa e sistema externo mostram "Pessoa externa" e "Sistema externo" no rótulo, diferentes dos tipos internos; um terminal `120×60` com nome longo ("Serviço de Autorização de Usuários" ou similar) corta o nome sem cobrir o ícone de prompt no canto; um balde `120×60` com o mesmo nome longo não passa do contorno inclinado.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
