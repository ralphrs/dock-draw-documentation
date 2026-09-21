# Análise: o básico do editor de diagrama

**Data:** 2026-09-21
**Pedido:** humano, em 2026-09-21, com urgência ("ASAP"): desfazer e refazer, duplicar, colar imagem externa, pastas de diagrama, setas de conexão ao passar o mouse, e remover as marcas do React Flow e do Lovable. Pediu também o levantamento do que mais é básico nessa linha.
**Referência de "básico":** draw.io, por ser a ferramenta que o produto usa de régua desde a `DEC-0021`. Páginas consultadas em 2026-09-21: [conectar formas](https://www.drawio.com/doc/faq/connect-shapes), [formas](https://www.drawio.com/docs/manual/shapes/), [conectores](https://www.drawio.com/docs/manual/connectors/), [desenhar mais rápido](https://www.drawio.com/docs/tutorials/draw-faster-diagrams/).

## 1. O que o editor tem hoje

Medido em `src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx` e `src/components/editor/diagram-canvas.tsx` do app, em 2026-09-21.

| Capacidade | Estado |
| --- | --- |
| Copiar, recortar, colar (Ctrl+C, Ctrl+X, Ctrl+V) | Existe, um elemento por vez, área de transferência interna do app |
| Duplicar (Ctrl+D) | Existe, um elemento por vez |
| Copiar e colar estilo | Existe, pelo menu de contexto |
| Ordem de camada (Ctrl+Shift+F, Ctrl+Shift+B) | Existe |
| Excluir (Del, Backspace), renomear (F2) | Existe |
| Grade com encaixe, ajustar à tela, zoom 100%, minimapa | Existe, pelo menu |
| Exportar PNG, SVG e .drawio | Existe |
| Desfazer e refazer | **Não existe** |
| Seleção de vários elementos | **Não existe.** O estado é um `selectedNodeId` só |
| Mover com as setas do teclado | **Não existe** |
| Alinhar e distribuir | **Não existe** |
| Travar elemento | **Não existe** |
| Setas de conexão ao passar o mouse | **Não existe.** Conexão é por alça ou por "Iniciar conexão daqui" |
| Colar imagem externa | **Não existe** |
| Pastas de diagrama | Decidido na `DEC-0022` (tabela própria), sem ordem nem migração |
| Atribuição do React Flow | Visível, estilizada em `src/styles.css`, sem `proOptions` |
| Selo "Edit with Lovable" | Injetado pela plataforma no site publicado |

O Ctrl+D pedido já existe. Ele passa a valer para vários elementos quando a seleção múltipla existir.

## 2. O que falta, em ordem de entrega

### Prioridade 1: o pedido e o que ele exige

| # | Feature | Como no draw.io | Observação |
| --- | --- | --- | --- |
| 1 | Seleção múltipla: caixa de seleção arrastando no vazio, Shift+clique, Ctrl+A | Igual | Pré-requisito de duplicar, mover, alinhar e excluir em lote. Sem ela, desfazer em lote não tem sentido |
| 2 | Desfazer e refazer: Ctrl+Z, Ctrl+Shift+Z e Ctrl+Y (Cmd no Mac) | Igual | Pilha de comandos no cliente. Cada ação guarda a operação inversa e a reaplica no banco pelo mesmo caminho otimista das ações de hoje. Ação em lote é um passo só da pilha |
| 3 | Setas de conexão ao passar o mouse: quatro setas, uma por lado. Arrastar uma seta cria a conexão. Clicar numa seta clona a forma naquela direção já conectada | Setas azuis, [conectar formas](https://www.drawio.com/doc/faq/connect-shapes) | Se já houver forma naquela direção, o clique conecta a ela em vez de clonar, como no draw.io |
| 4 | Mover com as setas do teclado, Shift para passo de grade | Igual | Barato, e completa a seleção múltipla |
| 5 | Remover a atribuição do React Flow | Não se aplica | `proOptions={{ hideAttribution: true }}`. A licença MIT permite. O time do React Flow pede, sem obrigar, que uso comercial que remove a marca assine o plano Pro ([remove attribution](https://reactflow.dev/learn/troubleshooting/remove-attribution)) |
| 6 | Remover o selo do Lovable | Não se aplica | Ação do humano: Project settings, Publishing, "Hide Lovable badge". Exige plano pago do Lovable, a partir do Pro. Esconder por CSS contorna o plano e fica fora da recomendação |
| 7 | Colar imagem externa: Ctrl+V de imagem copiada e arrastar arquivo de imagem para o quadro | Igual | Exige lugar para guardar o arquivo: bucket no Supabase Storage com política de acesso por projeto. Guardar a imagem em base64 dentro do elemento incha cada leitura do diagrama e fica descartado |
| 8 | Pastas de diagrama | Não se aplica | Já decidido na `DEC-0022`. Falta a ordem e a migração |

As features 7 e 8 dependem de migração ou de bucket com política, e passam pela aprovação do humano (`app-release`). A aplicação de migração está parada no classificador (`DDP-140`). As outras seis andam sem migração.

### Prioridade 2: básico que qualquer editor tem

| # | Feature | Observação |
| --- | --- | --- |
| 9 | Alinhar (esquerda, centro, direita, topo, meio, base) e distribuir na horizontal e na vertical | Precisa da seleção múltipla |
| 10 | Atalhos de zoom: Ctrl+mais, Ctrl+menos, Ctrl+0 para 100%, Ctrl+Shift+H para ajustar à tela. Espaço+arrastar para mover o quadro | Hoje só pelo menu |
| 11 | Travar elemento (Ctrl+L): não move nem redimensiona até destravar | Útil para fundo e fronteira |
| 12 | Clonar arrastando com Alt | Complementa o Ctrl+D |

### Prioridade 3: depois do básico

| # | Feature | Observação |
| --- | --- | --- |
| 13 | Painel de atalhos (Ctrl+/) | Os atalhos passam de dez |
| 14 | Buscar no diagrama (Ctrl+F) | Útil com diagrama grande |
| 15 | Agrupar e desagrupar (Ctrl+G, Ctrl+Shift+G) | Não é a fronteira do C4. Depende do ADR 015 dizer o que é contêiner |

## 3. Relação com o ADR 015

O ADR 015 pode trocar o formato gravado do diagrama (pergunta 5 do rascunho do prompt). Desfazer e refazer ficam no cliente, sobre as ações do editor, e não dependem do formato gravado. Se o ADR 015 escolher documento inteiro por diagrama, a pilha continua igual e muda só a escrita no banco.

## Lacuna declarada

A lista da prioridade 2 e 3 vem do draw.io, sem teste com usuário do DokDraw. A ordem dentro de cada prioridade é da sessão A, e o humano pode reordenar no quadro.
