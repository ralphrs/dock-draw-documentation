# Ordem DDP-295: setas de conexão ao passar o mouse, com clonar e conectar

Issue da ordem: `DDP-306`, rótulo `lovable`.

Prioridade 1, item 3 de `adrs/_work/ANALISE-editor-o-basico.md`, no molde das setas azuis do draw.io ([drawio.com/doc/faq/connect-shapes](https://www.drawio.com/doc/faq/connect-shapes)).

## Estado atual

`src/components/editor/c4-node.tsx` (app `dok-draw-app`) já desenha, por elemento, quatro `Handle` de origem (`s-t`, `s-r`, `s-b`, `s-l`, um por lado) e quatro de destino (`t-t`, `t-r`, `t-b`, `t-l`), nas classes `c4-handle-source` e `c4-handle-target`. O nó já usa `className="group relative"`, o padrão Tailwind de hover por grupo que o resto do app usa. A conexão hoje só acontece por essas alças pequenas ou pelo menu de contexto "Iniciar conexão daqui" (`onStartConnection`). Duplicar (`copyNode` mais `pasteAt`, `Ctrl+D`) já copia tipo, nome, tecnologia, descrição, estilo, largura e altura, com deslocamento fixo de `+40, +40`.

## O que fazer

**1. Seta por lado, visível só no hover.** Ao passar o mouse sobre um elemento (fora de arrasto, fora de redimensionamento, e com o elemento não selecionado para edição de texto), quatro setas aparecem, uma por lado, apontando de dentro para fora, sobre ou substituindo visualmente a alça pequena que já existe naquele lado. As setas somem ao tirar o mouse do elemento, não aparecem durante arrasto de qualquer elemento no quadro, e não aparecem enquanto o `NodeResizer` está ativo.

**2. Arrastar uma seta desenha conexão.** Igual ao comportamento de arrastar a partir de um `Handle` de origem hoje: solta sobre outro elemento cria a relação entre os dois, pelo mesmo caminho que `connectElements` já usa.

**3. Clicar numa seta clona na direção dela.** Sem elemento nenhum naquela direção, o clique cria uma cópia do elemento de origem (mesmo tipo, nome, tecnologia, descrição, estilo, largura e altura, no molde do que `copyNode` já copia), posicionada na direção da seta com 80 px de vão entre a borda do original e a borda da cópia, alinhada pelo centro do original no outro eixo, e já conectada ao original pela mesma relação que `connectElements` cria.

**4. Clicar numa seta com elemento já naquela direção conecta a ele.** Em vez de clonar, o clique cria a relação entre o elemento de origem e o elemento existente na direção da seta, sem criar elemento novo. "Naquela direção" é o elemento mais próximo que cumpre três condições: o centro dele está do lado da seta, a distância entre os centros no eixo da seta é de no máximo 400 px, e o desvio no outro eixo é menor que metade da largura (setas de cima e de baixo) ou da altura (setas da esquerda e da direita) do elemento de origem. Sem elemento que cumpra as três, o clique clona.

## O que não fazer aqui

- Elemento travado: a trava (`Ctrl+L`, prioridade 2, item 11) ainda não existe no app. Esta ordem não a implementa. A condição "não aparece em elemento travado" fica sem efeito até a trava existir, e a ordem que a criar precisa esconder também as setas desta ordem.
- Desfazer e refazer (`DDP-294`), seleção múltipla (`DDP-293`) e colar imagem (`DDP-296`): ordens separadas. Se `DDP-294` já estiver no app quando esta rodar, criar e conectar por clique nas setas entram na mesma pilha de desfazer pelo mecanismo que aquela ordem define, sem ordem nova.
- Nenhuma migração, nenhuma tabela nova, nenhuma política RLS.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: `@xyflow/react`, com nodes e edges controlados pelo estado do app | Clonar e conectar passam por `copyNode`, `pasteAt` e `connectElements`, que já atualizam o estado da rota. As setas são desenho dentro do nó, sem nó extra no React Flow |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: as quatro setas aparecem só no hover e somem ao tirar o mouse, não aparecem durante arrasto nem durante redimensionamento, arrastar uma seta até outro elemento cria a conexão, clicar numa seta sem elemento na direção clona e conecta, e clicar numa seta com elemento já na direção conecta ao existente em vez de clonar.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
