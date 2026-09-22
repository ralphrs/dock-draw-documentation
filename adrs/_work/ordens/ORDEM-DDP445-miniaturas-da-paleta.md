# Ordem DDP-445: miniaturas da paleta de formas em escala real

**Issue:** `DDP-445` (pedido do humano em 2026-09-22, no comentário da `DDP-338`: as miniaturas da paleta, onde a pessoa segura para arrastar, estão com formato estranho, e a forma solta no canvas está correta).
**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação.

## Causa

`PaletteItem` (`src/components/editor/palette-item.tsx`, linhas 21 a 55) desenha `ElementShape` num SVG de 40×28 (30×28 para pessoa, 40×26 para limite), e o diálogo Mais formas (`src/components/editor/mais-formas-dialog.tsx`, linhas 43 a 52) num SVG de 30×22. `ElementShape` (`src/components/editor/element-shape.tsx`) tem medidas fixas em pixel pensadas para o canvas, onde a forma tem no mínimo 120×60: cilindro `ry = 12` (linha 126), fila `rx = 14` (linha 145), pasta `tabW = min(0,34w, 90)` com `r = min(radius, 8)` (linhas 260 a 262), terminal `size = min(18, 0,3h)` (linha 206). Em 28px de altura o cilindro vira uma elipse com 4px de corpo, a fila tem 28 dos 40px em curva e a aba da pasta fica com raio maior que a própria aba. A mesma miniatura serve de imagem de arrasto (`setDragImage`, linha 32), por isso o formato estranho acompanha o cursor e some quando a forma é solta.

## O que fazer

**1. Miniatura da paleta.** Em `palette-item.tsx`, o SVG continua com `width={width}` e `height={height}` na tela, mas ganha `viewBox` numa escala de canvas: `viewBox={`0 0 ${width * 3} ${height * 3}`}`, e `ElementShape` recebe `width={width * 3}` e `height={height * 3}` (120×84 para a maioria das formas, 90×84 para pessoa, 120×78 para limite). As medidas fixas caem na faixa para a qual foram desenhadas e o navegador reduz o desenho inteiro em proporção. Para o contorno não sumir na redução, passe `style={{ strokeWidth: 4.5 }}` (1,5px depois da escala, o mesmo `DEFAULT_ELEMENT_STYLE.strokeWidth`). Os pontos de ancoragem do `setDragImage` (`width / 2`, `height / 2`) não mudam, porque são em pixels de tela.

**2. Miniatura do diálogo Mais formas.** Em `mais-formas-dialog.tsx`, a mesma regra: `viewBox="0 0 120 88"`, `ElementShape` com `width={120}`, `height={88}` e `style={{ strokeWidth: 6 }}` (1,5px depois da escala de 4×).

**3. Conferir** as dez formas das seções Contêineres e Dados e mensageria e as duas de Pessoas, no tema claro e no escuro, na paleta, na imagem de arrasto e no diálogo Mais formas: cilindro com tampa proporcional, fila com a curva só na ponta direita, pasta com aba pequena, hexágono, navegador, terminal e bucket iguais aos do canvas em miniatura.

## O que não fazer aqui

- Não mude `element-shape.tsx`. A regra do `ry` proporcional do cilindro para o canvas vem com a ordem das formas básicas (`DDP-437`), não com esta.
- Não altere tamanho, espaçamento, título nem a estrela de favorita dos itens da paleta (`DDP-402`).
- Não mexa em `.env*`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| Miniatura reutiliza a forma do canvas, sem desenho paralelo (`palette-item.tsx`, comentário da linha 17) | Itens 1 e 2 mantêm `ElementShape`, só mudam a escala |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project` nesta ordem |
