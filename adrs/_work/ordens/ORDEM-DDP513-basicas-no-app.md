# Ordem DDP-513: família Básicas no app (elipse, losango, triângulo, texto solto)

**Issue:** `DDP-513`. Só depois da `DDP-515` (pontos de conexão) estar no preview, porque o item 5 escreve sobre as alças novas. Épico DEC-0027, formas aprovadas nos dois temas: elipse (`DDP-255`), losango (`DDP-260`), triângulo (`DDP-265`), texto solto (`DDP-290`). Cor da família fixada em `DDP-250`. Inclui a regra de alça do triângulo achada na `DDP-437`.
**App:** `dok-draw-app`. Sem migração, sem campo novo no banco (`type` do elemento já é um valor de texto livre na tabela), sem dependência nova, sem publicação nesta ordem.

## Por que

`src/domain/c4/families.ts`, linha 38, marca `basicas` como `available: false` com `groups: []`, mesmo com `DEFAULT_FAMILY_IDS` (linha 60) já ligando a família por padrão. A pessoa vê "Básicas" na janela Mais formas como "em breve". As quatro formas têm design aprovado. Esta ordem só liga o que já foi decidido, sem inventar geometria nova.

## O que fazer

**1. Quatro tipos novos em `src/domain/c4/types.ts`.** Em `C4_ELEMENT_TYPES` (linha 9), acrescentar `"ellipse"`, `"diamond"`, `"triangle"`, `"text"`.

**2. Metadados em `src/domain/c4/catalog.ts`.** `C4Shape` (linha 4) ganha `"ellipse" | "diamond" | "triangle" | "text"`. Em `ELEMENT_TYPE_META` (depois do fechamento de `group`, linha 205), quatro entradas novas, uma por tipo, todas com `levels: ["context", "container", "component"]` (forma genérica, não amarrada a um nível do C4):

```ts
ellipse:  { type: "ellipse",  label: "Elipse",     short: "Elipse",     colorVar: "var(--basica-fill)", lineVar: "var(--basica-linha)", textVar: "var(--basica-texto)", shape: "ellipse",  levels: [...] },
diamond:  { type: "diamond",  label: "Losango",    short: "Losango",    colorVar: "var(--basica-fill)", lineVar: "var(--basica-linha)", textVar: "var(--basica-texto)", shape: "diamond",  levels: [...] },
triangle: { type: "triangle", label: "Triângulo",  short: "Triângulo",  colorVar: "var(--basica-fill)", lineVar: "var(--basica-linha)", textVar: "var(--basica-texto)", shape: "triangle", levels: [...] },
text:     { type: "text",     label: "Texto solto", short: "Texto",     colorVar: "var(--basica-fill)", lineVar: "var(--basica-linha)", textVar: "var(--basica-texto)", shape: "text",     levels: [...] },
```

**3. Desenho em `src/components/editor/element-shape.tsx`, dentro de `renderShape`.** Quatro ramos novos, antes do `return` padrão da linha 284:

- `ellipse`: `<ellipse cx={w/2} cy={h/2} rx={w/2} ry={h/2} {...common}/>`. Os quatro pontos médios da caixa já caem sobre a curva por definição, sem cálculo extra.
- `diamond`: `<path d={`M${w/2},0 L${w},${h/2} L${w/2},${h} L0,${h/2} Z`} {...common}/>`. Os quatro vértices já coincidem com os pontos médios da caixa.
- `triangle`: `<path d={`M${w/2},0 L${w},${h} L0,${h} Z`} {...common}/>` (ápice para cima).
- `text`: `return null;`. Sem preenchimento nem contorno próprio (`DDP-290`), o rótulo é o elemento inteiro.

**4. Rótulo, em `ElementLabels` (mesmo arquivo).** Três ajustes:

- Suprimir tipo e descrição para as quatro formas: `const isBasica = ["ellipse","diamond","triangle","text"].includes(shape);` logo após a linha 309, e trocar `mostrarTipo = s.showType` (linha 353) por `mostrarTipo = s.showType && !isBasica`, `mostrarDescricao = Boolean(...)` (linha 354) por `... && !isBasica`. As formas básicas não têm tipo C4 nem campo de tecnologia com sentido.
- Rótulo do triângulo em `2h/3` (achado `DDP-437`, aprovado em `DDP-263`): depois do cálculo genérico de `baseY` (linhas 359 a 364), `if (shape === "triangle") baseY = (2 * h) / 3 - blockHeight / 2 + s.fontSize;`, substituindo a centralização em `h/2` só para este ramo.
- `nameMax` (linha 352): para o triângulo, usar a fórmula da `DDP-437`, `útil = w * (2/3 - 6.5/h)`, `nameMax = Math.min(Math.floor(w/10), Math.floor((útil - 28)/7.5))`. Para o losango, aplicar a mesma família de fórmula com a faixa central do losango (`útil = w * (1 - 2*6.5/h)`, mesmo `nameMax`), que reproduz o resultado aprovado de 14 caracteres em 160×100. Elipse e texto solto usam o `nameMax` genérico já existente (`Math.floor(w/10)`), sem ramo novo: a `DDP-255` e a `DDP-290` pedem exatamente o truncamento que o app já tem.

**5. Alça de conexão do triângulo, em `src/components/editor/c4-node.tsx`.** As alças hoje (linhas 117 a 157) usam só `Position` do React Flow, que ancora no meio de cada lado da caixa. Isso já é a posição certa para elipse (curva coincide), losango (vértices coincidem) e texto solto (sem silhueta a desviar, regra padrão da caixa): nenhuma mudança para essas três. Só o triângulo (ápice para cima) diverge nas laterais. Com os pontos de conexão da `DDP-515` (três por lado em `t` 0,25, 0,5 e 0,75, mais os cantos), para `meta.shape === "triangle"` a posição de cada ponto dos lados `l` e `r` sai da aresta inclinada: no lado `l`, `x = (w / 2) * (1 - t)` e `y = t * h`, e no lado `r`, `x = (w / 2) * (1 + t)` e `y = t * h`, com `t` contado de cima para baixo. Em `t` 0,5 isso dá `w / 4` e `3w / 4`, a regra da `DDP-437`. Os cantos de cima (`tl`, `tr`) do triângulo não existem: só o ápice `t:0.5` fica no topo. O lado `t` fica só com o ápice, e o lado `b` com os três pontos e os dois cantos de baixo. A mesma função `anchorPoint` da `DDP-515` recebe a forma para calcular o ponto do contorno, e a aresta usa esse ponto. `meta` já está disponível no componente (linha 53).

**6. Família em `src/domain/c4/families.ts`.** Linha 38: `{ id: "basicas", label: "Básicas", category: "Geral", available: true, groups: [{ id: "formas", label: "Formas", types: ["ellipse", "diamond", "triangle", "text"] }] }`.

**7. Cor da família, `src/styles.css`.** Três variáveis novas, `--basica-fill`, `--basica-linha`, `--basica-texto`, com os valores aprovados na `DDP-250` (reaproveita o neutro já usado por `--c4-external`/`--c4-group` em preenchimento e borda, com um texto próprio fixo):
  - `:root[data-palette="dokdraw"]` (linha 429): fill `#e4e4ea`, linha `#6b6b78`, texto `#241a44`.
  - `.dark[data-palette="dokdraw"]` (linha 451): fill `#e4e4ea`, linha `#9a9aa8`, texto `#241a44`.
  - `:root[data-palette="c4"]` (linha 475): fill `#e4e4e8`, linha `#686f78`, texto `#17233a`.
  - `.dark[data-palette="c4"]` (linha 497): fill `#e4e4e8`, linha `#9aa0a8`, texto `#17233a`.
  - Acrescentar `--color-basica-fill`, `--color-basica-linha`, `--color-basica-texto` no bloco `@theme` (linhas 70 a 78), mesmo padrão de `--color-c4-external`.

**8. Exportação draw.io, `src/components/editor/export-diagram.tsx`, função `drawioStyle` (linhas 499 a 510, `base` na 500).** SVG e PNG não precisam de nenhuma mudança neste arquivo: `buildSvg` (linha 218) já desenha por `ElementShape`/`ElementLabels`, os mesmos componentes do item 3, então herdam as quatro formas de graça. Só o `.drawio` monta estilo próprio. Quatro ramos novos antes do `return` padrão da linha 509:

```ts
if (shape === "ellipse") return `${base}ellipse;`;
if (shape === "diamond") return `${base}rhombus;`;
if (shape === "triangle") return `${base}triangle;direction=north;`;
if (shape === "text") return `html=1;whiteSpace=wrap;fontColor=${fontColor};align=center;verticalAlign=middle;`;
```

O ramo `text` não usa `base`: sem `fillColor` nem `strokeColor`, porque a forma não tem preenchimento nem contorno próprio. As formas nativas `ellipse`, `rhombus` e `triangle` do mxGraph já têm os pontos de conexão corretos por definição (o `triangle` do draw.io já entra e sai pelo ápice e pelo meio das arestas), sem precisar de `exitX`/`exitY` customizado nas arestas.

**9. Conferir** no preview, nos dois temas e nas duas paletas com valor aprovado (DokDraw, C4 Padrão): arrastar as quatro formas da paleta "Básicas", redimensionar até o mínimo 120×60, digitar um nome longo e ver o truncamento (14 caracteres no losango em 160×100, rótulo na base do triângulo), conectar por uma seta partindo do meio da aresta inclinada do triângulo (não de fora dela), exportar em PNG, SVG e `.drawio` e abrir o `.drawio` em app.diagrams.net vendo as quatro formas com o ponto de conexão certo.

## O que não fazer aqui

- Não mexer em `palette-item.tsx` nem em `familias-de-formas.tsx`: os dois já reutilizam `ElementShape` pela miniatura em escala (`DDP-445`), sem código por tipo, então herdam as formas novas sem alteração.
- Não mudar `NodeResizer` em `c4-node.tsx` além do item 5: o contorno 2,5px e as quatro alças 8×8 na seleção já vêm do resizer padrão do app (`isVisible`, `handleStyle`, `lineStyle`, linhas 68 a 81), igual para toda forma.
- Não trocar `element-shape.tsx` de nenhuma forma existente do C4 (pessoa, sistema, contêiner etc.).
- Nenhuma migração, nenhum campo novo no banco.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão (`DEC-0041`).

## O que fica em aberto (lacuna declarada)

- **Paleta `ntconsult` sem cor aprovada.** A `DDP-250` só cobriu DokDraw e C4 Padrão. `styles.css` tem uma terceira paleta, `ntconsult` (linhas 521 a 570), cujos `--c4-external`/`--c4-group` não são neutros (são coloridos, tom de marca) e não servem como base para `--basica-fill`/`--basica-linha`. Esta ordem não inventa um valor: `--basica-fill`/`--basica-linha`/`--basica-texto` ficam sem regra em `[data-palette="ntconsult"]` até a sessão D propor. O Lovable declara isso no resultado, sem escolher cor.
- **Fórmula de truncamento do losango.** O ticket `DDP-260` aprovou o resultado (14 caracteres em 160×100), não a fórmula por trás. O item 4 deriva a fórmula pela mesma família de cálculo do triângulo (`DDP-437`), que reproduz esse único ponto, sem conferência na prancha para outros tamanhos. A sessão C confere no preview.
- **Contraste `basica-linha`/`basica-fill` no Escuro.** A `DDP-492` (ainda A FAZER) já achou que esse par dá 2,19:1 no Escuro, abaixo do mínimo 3:1 de contraste gráfico. Esta ordem usa o valor atual, o único aprovado hoje. Quando a `DDP-492` fechar, outra ordem troca só a variável no Escuro.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| `public.model_elements` é do ADR 001, `type` texto livre e `style` Json sem contrato de banco | Nenhum campo novo, nenhuma migração |
| Cor só por variável, nunca literal no componente (regra do kit, `DDP-250`) | Os quatro tipos usam `var(--basica-fill)`/`var(--basica-linha)`/`var(--basica-texto)`, nunca hex direto |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project` nesta ordem |
