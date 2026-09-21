# Ordem DDP-369: defeitos de forma e de rótulo do editor

Cinco defeitos achados pela sessão D ao desenhar as formas, reunidos na `DDP-245`: `DDP-175`, `DDP-181`, `DDP-182`, `DDP-211` e `DDP-215`. Todos em `src/components/editor/element-shape.tsx` (app `dok-draw-app`), exceto o item 3, em `src/domain/c4/catalog.ts`.

## Estado atual

`truncate(text, max)` corta por número de caractere, sem medir a largura real do texto renderizado. `ElementLabels` usa `truncate(name, Math.floor(w / 8))` em dois lugares (caso `boundary` e o caso genérico) e `truncate(description, Math.floor(w / 6))`; a tecnologia usa `truncate(technology, 20)`, teto fixo; o tipo curto (`short`) não passa por `truncate` nenhum. No caso `person` de `renderShape`, a cabeça é `cy={r * 0.55}` e o corpo começa em `bodyY = r * 0.85`. Em `catalog.ts`, `external_person.short` é `"Pessoa"` e `external_system.short` é `"Sistema de Software"`, iguais aos tipos internos correspondentes. No caso `terminal`, o ícone de prompt é desenhado fixo em `x=10` a `28`, `y=10` a `25`, sem relação com a posição do rótulo.

## O que fazer

**1. Tipo curto entra no truncate (`DDP-175`).** Em `ElementLabels`, no texto `[{short}...]` (caso genérico, hoje só a tecnologia trunca), aplique `truncate(short, Math.floor(w / 10))` antes de montar a string. Mesma função `truncate` que a tecnologia já usa, teto calculado pela largura da forma, não mais um número fixo.

**2. Cabeça da forma pessoa (`DDP-181`).** Em `renderShape`, caso `person`: troque `const headCy = r * 0.55` por `const headCy = r`, e `const bodyY = r * 0.85` por `const bodyY = r * 1.3` (o corpo desce a mesma distância que a cabeça, `r - r * 0.55 = r * 0.45`). Resultado: o topo do círculo (`headCy - r`) fica exatamente em `y = 0`, no topo da caixa delimitadora, e o ponto de conexão de cima (que já fica em `y = 0`, regra genérica de qualquer forma C4) passa a tocar a ponta da cabeça em vez de cair dentro dela. Não toque `headR` em `ElementLabels` (usado só para posicionar o texto, fora do escopo desta ordem).

**3. Rótulo dos tipos externos (`DDP-182`).** Em `ELEMENT_TYPE_META` (`catalog.ts`): `external_person.short` vira `"Pessoa externa"`, `external_system.short` vira `"Sistema externo"`. Mesmo texto que `label` desses dois tipos já usa hoje, só duplicado no campo `short`.

**4. Corte do nome por largura com margem, não por caractere solto (`DDP-211`, `DDP-215`).** Decisão desta ordem: manter o corte por caractere (não medir a largura real do texto renderizado, que exigiria um mecanismo de medição compartilhado entre o canvas do editor e a exportação estática, risco de divergência entre os dois). Em vez disso, a margem de segurança cresce: troque o divisor `8` por `10` nos dois lugares de `ElementLabels` que truncam `name` (caso `boundary`, `Math.floor(w / 10)`, e caso genérico, `Math.floor(w / 10)`). Calibração: a sessão D mediu 112px de texto real (negrito 13px Inter) para um corte de 15 caracteres numa forma de 120px, ≈7,5px por caractere; o divisor 10 deixa margem real (≈25%) sobre o pior caso medido. `description` (`w / 6`) e `technology` (teto fixo `20`) não mudam, fora do escopo dos achados.

**5. Terminal reserva o canto do ícone (`DDP-211`).** Só no caso `terminal`, o teto de caracteres do nome desconta a largura do ícone: `Math.floor((w - 24) / 10)` em vez de `Math.floor(w / 10)`. Os `24px` aproximam o ícone (tamanho até `18px`, calculado por `Math.min(18, h * 0.3)`, mais margem), suficiente para o nome truncado não alcançar o canto onde o ícone fica, em qualquer tamanho, incluindo o mínimo `120×60`. Sem mudar a posição do ícone nem do texto, só o teto de caracteres.

## O que não fazer aqui

- Não meça a largura real do texto renderizado (`canvas.measureText` ou equivalente): decisão do item 4 é manter o corte por caractere.
- Não toque `truncate(description, ...)` nem `truncate(technology, 20)`.
- Não toque `headR` nem o layout vertical do texto em `ElementLabels`.
- Não altere `label` nem `defaultTechnology` de nenhum tipo em `catalog.ts`, só os dois campos `short` do item 3.
- Nenhuma migração, nenhuma mudança no formato gravado do diagrama, nenhuma dependência nova.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 002: o formato do diagrama (`model_elements`, estilo em JSONB) não muda sem ADR | Todas as correções são de desenho e de rótulo (SVG, texto, catálogo estático), nenhum campo novo, nenhuma migração |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: `[tipo: tecnologia]` longo numa forma estreita agora corta com reticências, sem passar do contorno; a forma pessoa tem o topo da cabeça exatamente no topo da caixa, sem sobra acima, e a alça de conexão de cima toca a cabeça; pessoa externa e sistema externo mostram "Pessoa externa" e "Sistema externo" no rótulo, diferentes dos tipos internos; um terminal `120×60` com nome longo ("Serviço de Autorização de Usuários" ou similar) corta o nome sem cobrir o ícone de prompt no canto; um balde `120×60` com o mesmo nome longo não passa do contorno inclinado.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
