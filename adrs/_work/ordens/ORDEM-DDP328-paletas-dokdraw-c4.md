# Ordem DDP-328: paletas DokDraw e C4 Padrão no app

`DEC-0025-esquema-de-cores-dos-diagramas.md`, cores aprovadas pelo humano na `DDP-246`, comentário de resultado da sessão D (id `10338`), aceito pela sessão A no mesmo card.

## Estado atual

`src/styles.css` (app `dok-draw-app`) guarda o esquema de cor dos elementos C4 em blocos por `data-palette`, atributo que `src/lib/palette.tsx` põe em `<html>`. Hoje só `dokdraw` e `ntconsult` têm bloco próprio; `iris` cai no `:root`/`.dark` sem escopo, que este trabalho não toca. O bloco `dokdraw` atual mistura a cor do tipo a 16% sobre `--card` (`--c4-fill-alpha: 16%`) e tem um segundo bloco, só para o tema claro, que escurece algumas bordas à parte para chegar a 3:1 contra o canvas. `PALETTES`, em `src/lib/palette.tsx`, lista três esquemas (`dokdraw`, `iris`, `ntconsult`); nenhum chamado `c4`.

## O que fazer

**1. Troca dos valores do esquema `dokdraw`.** No bloco `:root[data-palette="dokdraw"]` e no bloco `.dark[data-palette="dokdraw"]` de `src/styles.css`, os hexadecimais viram os da tabela da seção seguinte, um bloco por tema (claro e escuro têm bordas diferentes, preenchimento igual).

**2. `--c4-fill-alpha` sai do bloco `dokdraw`.** A mistura a 16% sobre o card vira cor direta, no mesmo modelo que `iris` e `ntconsult` já usam. Sem a linha `--c4-fill-alpha: 16%` no bloco, o valor herda do `:root` base (`--c4-fill-alpha: 100%`, linha 137 de `styles.css` hoje), sem precisar declarar de novo. `element-shape.tsx` e `export-diagram.tsx` já leem essa variável por `color-mix`; com 100% a mistura já dá a cor pura, sem mudança de código ali.

**3. Remove o bloco de escurecimento de borda do tema claro.** O bloco hoje separado, comentado "Bordas da DokDraw no tema claro, escurecidas para 3:1 contra o canvas", fica redundante: a tabela da seção seguinte já traz o valor de borda calculado por tema, com o contraste medido pela sessão D.

**4. Esquema novo `c4`, rótulo C4 Padrão.** Em `PALETTES` (`src/lib/palette.tsx`), um item novo `{ id: "c4", label: "C4 Padrão", swatches: [...] }`. Em `src/styles.css`, dois blocos novos, `:root[data-palette="c4"]` e `.dark[data-palette="c4"]`, com os hexadecimais da tabela. Sem `--c4-fill-alpha` nesses blocos, pelo mesmo motivo do item 2.

**5. `iris` e `ntconsult` não mudam.** Nenhuma linha dos blocos deles é tocada.

**6. Esquema continua salvo no navegador.** `DEFAULT_PALETTE`, `STORAGE_KEY` e o mecanismo de `localStorage` em `usePalette` não mudam. Guardar por tenant é do ADR 015, fora desta ordem.

## Tabela de hexadecimais

Copiada sem redigitar do comentário de resultado da sessão D na `DDP-246` (id do comentário `10338`).

| Paleta | Papel | Claro | Escuro |
| --- | --- | --- | --- |
| DokDraw | `person`, `system` (fill+line base) | `#301c5f` | `#301c5f` |
| DokDraw | `person`/`system` linha | `#1c1037` | `#a890df` |
| DokDraw | `container`, `store`, `queue` (fill) | `#502e9e` | `#502e9e` |
| DokDraw | `container`/`store`/`queue` linha | `#38206f` | `#8969d3` |
| DokDraw | `component` (fill) | `#e0d7f4` | `#e0d7f4` |
| DokDraw | `component` linha | `#46288a` | `#734dcb` |
| DokDraw | `external`, `external_system`, `group` (fill) | `#e4e4ea` | `#e4e4ea` |
| DokDraw | linha do grupo externo/grupo | `#6b6b78` | `#9a9aa8` |
| DokDraw | `on-fill` / `on-fill-alt` | `#ffffff` / `#241a44` | `#ffffff` / `#241a44` |
| C4 Padrão | `person`, `system` (fill) | `#1c3f5f` | `#1c3f5f` |
| C4 Padrão | `person`/`system` linha | `#102537` | `#90badf` |
| C4 Padrão | `container`, `store`, `queue` (fill) | `#224f77` | `#224f77` |
| C4 Padrão | `container`/`store`/`queue` linha | `#193a57` | `#69a2d3` |
| C4 Padrão | `component` (fill) | `#d7e6f4` | `#d7e6f4` |
| C4 Padrão | `component` linha | `#285d8a` | `#4d90cb` |
| C4 Padrão | `external`, `external_system`, `group` (fill) | `#e4e4e8` | `#e4e4e8` |
| C4 Padrão | linha do externo/grupo | `#686f78` | `#9aa0a8` |
| C4 Padrão | `on-fill` / `on-fill-alt` | `#ffffff` / `#17233a` | `#ffffff` / `#17233a` |

Preenchimento e texto não mudam entre temas (cor direta, sem card por baixo). Só a linha (borda) muda por tema, porque precisa de 3:1 contra o `--canvas` de cada tema.

## Mapeamento papel → variável CSS

`person` e `system` usam a mesma cor de preenchimento (`--c4-person`/`--c4-system`) e a mesma linha. `container`, `store` e `queue` também compartilham cor e linha entre si (`--c4-container`, `--c4-store`, `--c4-queue`), porque os três são nível contêiner no C4. `external`, `external_system` e `group` compartilham o mesmo cinza. `component` tem par próprio. Tipos que reaproveitam `colorVar` de outro (`microservice`, `browser`, `terminal`, `spa` → `--c4-container`; `bucket`, `folder` → `--c4-store`, conforme `src/domain/c4/catalog.ts`) herdam a cor sem entrada própria na tabela.

```css
/* src/styles.css — substitui o bloco dokdraw de hoje (o combinado e o de escurecimento de borda) */
:root[data-palette="dokdraw"] {
  --c4-person: #301c5f; --c4-person-line: #1c1037;
  --c4-system: #301c5f; --c4-system-line: #1c1037;
  --c4-container: #502e9e; --c4-container-line: #38206f;
  --c4-store: #502e9e; --c4-store-line: #38206f;
  --c4-queue: #502e9e; --c4-queue-line: #38206f;
  --c4-component: #e0d7f4; --c4-component-line: #46288a;
  --c4-external: #e4e4ea; --c4-external-line: #6b6b78;
  --c4-external-system: #e4e4ea; --c4-external-system-line: #6b6b78;
  --c4-group: #e4e4ea; --c4-group-line: #6b6b78;
  --c4-on-fill: #ffffff; --c4-on-fill-alt: #241a44;
}
.dark[data-palette="dokdraw"] {
  --c4-person: #301c5f; --c4-person-line: #a890df;
  --c4-system: #301c5f; --c4-system-line: #a890df;
  --c4-container: #502e9e; --c4-container-line: #8969d3;
  --c4-store: #502e9e; --c4-store-line: #8969d3;
  --c4-queue: #502e9e; --c4-queue-line: #8969d3;
  --c4-component: #e0d7f4; --c4-component-line: #734dcb;
  --c4-external: #e4e4ea; --c4-external-line: #9a9aa8;
  --c4-external-system: #e4e4ea; --c4-external-system-line: #9a9aa8;
  --c4-group: #e4e4ea; --c4-group-line: #9a9aa8;
  --c4-on-fill: #ffffff; --c4-on-fill-alt: #241a44;
}

/* Bloco novo */
:root[data-palette="c4"] {
  --c4-person: #1c3f5f; --c4-person-line: #102537;
  --c4-system: #1c3f5f; --c4-system-line: #102537;
  --c4-container: #224f77; --c4-container-line: #193a57;
  --c4-store: #224f77; --c4-store-line: #193a57;
  --c4-queue: #224f77; --c4-queue-line: #193a57;
  --c4-component: #d7e6f4; --c4-component-line: #285d8a;
  --c4-external: #e4e4e8; --c4-external-line: #686f78;
  --c4-external-system: #e4e4e8; --c4-external-system-line: #686f78;
  --c4-group: #e4e4e8; --c4-group-line: #686f78;
  --c4-on-fill: #ffffff; --c4-on-fill-alt: #17233a;
}
.dark[data-palette="c4"] {
  --c4-person: #1c3f5f; --c4-person-line: #90badf;
  --c4-system: #1c3f5f; --c4-system-line: #90badf;
  --c4-container: #224f77; --c4-container-line: #69a2d3;
  --c4-store: #224f77; --c4-store-line: #69a2d3;
  --c4-queue: #224f77; --c4-queue-line: #69a2d3;
  --c4-component: #d7e6f4; --c4-component-line: #4d90cb;
  --c4-external: #e4e4e8; --c4-external-line: #9aa0a8;
  --c4-external-system: #e4e4e8; --c4-external-system-line: #9aa0a8;
  --c4-group: #e4e4e8; --c4-group-line: #9aa0a8;
  --c4-on-fill: #ffffff; --c4-on-fill-alt: #17233a;
}
```

```tsx
// src/lib/palette.tsx — PALETTES ganha o item c4, os outros três ficam como estão
export const PALETTES = [
  { id: "dokdraw", label: "DokDraw", swatches: ["#301c5f", "#502e9e", "#e0d7f4", "#e4e4ea"] },
  { id: "iris", label: "Íris", swatches: ["#7a4f93", "#b184c8", "#4c3a5e", "#e6dcf0"] },
  { id: "ntconsult", label: "NTConsult", swatches: ["#08427B", "#1168BD", "#2E7D32", "#8C8C8C"] },
  { id: "c4", label: "C4 Padrão", swatches: ["#1c3f5f", "#224f77", "#d7e6f4", "#e4e4e8"] },
] as const;
```

## O que não fazer aqui

- Não mexer nos blocos `iris` (sem escopo de `data-palette`) nem `ntconsult`.
- Não guardar o esquema por tenant, espaço ou projeto: fica no `localStorage`, decisão do ADR 015.
- Nenhuma migração, nenhuma tabela nova, nenhuma dependência nova.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`/`DEC-0025`) | Onde esta ordem cumpre |
| --- | --- |
| DEC-0025: "Contraste mínimo: texto 4,5:1 e borda 3:1 contra o canvas, nos dois temas" | Valores da tabela medidos pela sessão D com a composição real de opacidade do texto (85%/80%), sem redigitar; a ordem só copia |
| DEC-0025: "As paletas `iris` e `ntconsult` continuam como estão" | Seção "O que não fazer aqui" veda qualquer alteração nos dois blocos |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: trocar para o esquema DokDraw e ver os internos em tons do mesmo violeta (pessoa e sistema mais escuros, contêiner/banco/fila no meio, componente claro) e os externos em cinza, nos dois temas; trocar para C4 Padrão e ver a mesma estrutura em azul; texto de tipo e de descrição legíveis sobre cada preenchimento, nos dois esquemas e nos dois temas; Íris e NTConsult sem nenhuma mudança visual.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
