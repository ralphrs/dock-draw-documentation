# Ordem DDP-512b: painel Detalhes, cor da borda, seleção, Delete e precisão

**Issue:** `DDP-512` (relato do humano em 2026-09-22, partes "Painel detalhes", "Cor da borda/linha" e "Melhorias"). Independente da `DDP-512a` e da `DDP-453`. Pode rodar antes delas.
**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação nesta ordem.

## Por que

- **Cor da borda não bate com o painel.** `element-shape.tsx`, linha 36: `stroke = selected ? "var(--ring)" : line`. A pessoa escolhe "Cor da borda" no painel Detalhes com o elemento selecionado, e a forma mostra a cor do anel de seleção no lugar da escolhida. A linha 37 ainda força espessura mínima 2 na seleção. A conexão faz o mesmo em `c4-edge.tsx`, linha 211: `color = sp.color || (selected ? "var(--ring)" : "var(--edge)")`.
- **Painel Detalhes sem respiro.** Na rota `projetos.$projectId.diagramas.$viewId.tsx`, o `TabsContent` de estilo (linha 2581) tem só `px-4`, sem espaço vertical, e as seções do `Accordion` encostam no cabeçalho das abas.
- **Delete apaga um tipo por vez.** `handleDeleteSelection` (linha 1447) apaga a conexão selecionada ou os nós selecionados, nunca os dois, porque selecionar nó zera a conexão e vice-versa (`onSelect` e `onSelectRelationship`, linhas 2503 a 2510).
- **Grade grossa.** `snapGrid={[20, 20]}` e `GRID_STEP` de 20 no teclado. O draw.io usa 10.

Seleção múltipla, arraste de laço (`selectionOnDrag`), Shift+clique e Ctrl/Cmd+A já existem no código (ordem `DDP-293`). O relato diz que não funcionam para a pessoa, então o item 4 verifica em vez de assumir.

## O que fazer

**1. Seleção por anel, não por troca de cor.** Em `element-shape.tsx`, `stroke` passa a ser sempre `line` e `strokeWidth` sempre `s.strokeWidth`. A seleção vira um anel separado, desenhado depois da forma dentro do mesmo `<g>`: o mesmo caminho da forma (`renderShape` com `fill="none"`), `stroke="var(--ring)"`, `strokeWidth 2.5`, `vectorEffect="non-scaling-stroke"`, deslocado 3px para fora com `transform` de escala em torno do centro, ou, quando a forma for retângulo ou elipse, um `rect`/`ellipse` 3px maior. Sem `pointer-events`. O halo (`filter` da linha 38) continua. A exportação não desenha o anel. Em `c4-edge.tsx`: `color = sp.color || "var(--edge)"`, e a seleção passa a ser um segundo `<path>` por baixo, mesmo `d`, `stroke="var(--ring)"`, largura `sp.width + 6`, opacidade 0,35. A espessura da linha selecionada volta a ser `sp.width`.

**2. Respiro no painel Detalhes.** Todo `TabsContent` do `aside` de Detalhes (estilo, texto, ordenar, e as abas da conexão a partir da linha 2947) recebe `px-4 py-3`. Dentro de cada `InspectorSection`, os campos ficam em `space-y-3`. `ColorField` e `NumberField` ganham `Label` com `mb-1`. Os blocos de aviso (como o de "fora do padrão do tipo") ficam com `my-2`. O cabeçalho "Detalhes" e a barra de abas não mudam.

**3. Delete apaga tudo que está selecionado.** A rota passa a guardar `selectedRelIds: string[]` no lugar de `selectedRelId`. `handleSelectionChange` (`diagram-canvas.tsx`) passa também `edges` para a rota, e `rfEdges` marca `selected` pela lista. Clique numa conexão seleciona só ela, Shift+clique acrescenta, laço de seleção pega nós e conexões dentro da área. `handleDeleteSelection` apaga nós e conexões selecionados num único item de histórico (Ctrl+Z restaura os dois). Delete e Backspace valem para forma, imagem colada (`image-node.tsx`) e conexão. O painel Detalhes mostra "CONEXÃO" quando há uma só conexão selecionada e "SELEÇÃO (n)" quando há mais de um item. O teclado continua ignorando o evento quando o foco está em `INPUT`, `TEXTAREA` ou `contentEditable`.

**4. Selecionar todos ou alguns, conferido.** Verificar no preview e em produção, e corrigir o que falhar: arrastar no fundo com o botão esquerdo desenha o laço e seleciona o que ele cobre. Shift+clique acrescenta e tira da seleção. Ctrl/Cmd+A seleciona todos os nós e todas as conexões (hoje só nós, linha 2041). Arrastar um nó selecionado move a seleção toda. Se algo funciona no preview e não em produção, escrever isso no "Resultado", porque então o problema é publicação pendente. Acrescentar ao menu de ajuda de atalhos (o mesmo do Shift+H) as linhas "Arrastar no fundo: laço de seleção", "Shift+clique: acrescentar à seleção", "Ctrl/Cmd+A: selecionar tudo", "Delete: excluir a seleção".

**5. Precisão.** `snapGrid={[20, 20]}` vira `[10, 10]` em `diagram-canvas.tsx`. `GRID_STEP` da rota (linha 258) vira 10, então seta move 1px e Shift+seta move 10px. O arredondamento do menu do fundo (`flowX`, `flowY`, linha 535 de `diagram-canvas.tsx`) vira `/ 10`. O `NodeResizer` recebe `minWidth 60` e `minHeight 40` (hoje 120 e 60). O redimensionar já não tem snap, então cada lado para onde a pessoa solta. Depois de aplicar, abrir um diagrama com cinco formas e três conexões no preview, alinhar duas formas pela borda e uma conexão a um ponto de conexão, e anotar no "Resultado" tudo que ainda parecer impreciso, com número.

**6. Conferir** no preview: escolher uma cor de borda com o elemento selecionado e a forma mostrar essa cor com o anel violeta por fora. Selecionar duas formas e uma conexão com o laço, apertar Delete, os três somem, Ctrl+Z traz os três de volta. Aba Estilo do painel com espaço acima do primeiro campo. Mover uma forma com seta do teclado anda 1px.

## O que não fazer aqui

- Não tocar em alças, âncoras, reconexão nem roteamento. Isso é a `DDP-512a`.
- Não tocar em pontas nem traços (`DDP-454`).
- Não mudar a janela de propriedades (`janela-propriedades.tsx`), que já tem `space-y-4`.
- Não mexer em migração, política RLS nem `.env*`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| Kit de seleção da sessão A: anel 2,5px em `ring`, forma mantém a própria cor | Item 1 |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project`. Publicar entra num card `app-release` |
| Nenhum campo novo no banco | Seleção é estado de tela, grade é constante do canvas |
