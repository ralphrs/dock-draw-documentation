# Ordem DDP-424: duplo clique abre a janela de propriedades (fase 1)

Issue da ordem: `DDP-427`, rótulo `lovable`.

O humano aprovou na `DDP-424`, em 2026-09-22, a proposta `adrs/_work/PROPOSTA-janela-de-propriedades.md`, com o protótipo em [claude.ai/artifact/KRmvf2pFKTLNGEWPa2AVH5](https://claude.ai/artifact/KRmvf2pFKTLNGEWPa2AVH5). Esta ordem é a fase 1, sem mudança no banco. Link, propriedades livres e texto alternativo ficam para a fase 2, com migração, em ordem própria.

## Estado atual

Tudo em `src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx` (a rota), salvo quando indicado.

- `onNodeDoubleClick` de `src/components/editor/diagram-canvas.tsx` chama `onOpenNode`, que é `openElement`: cria ou abre a visão filha.
- A janela "Detalhes do elemento" (o `Dialog` com `detailsOpen`) edita nome, tipo, tecnologia e descrição, e grava por `patchMutation` direto, fora da pilha de desfazer. Abre por `focusName` (F2 e o item "Editar nome" do menu) e pelo lápis do painel da direita.
- `patchElementComHistorico` empilha o inverso de `type`, `name`, `description`, `technology` e `style`, mas não de `tags`.
- O menu da linha (`edgeEntries` em `diagram-canvas.tsx`) tem "Editar rótulo", que só seleciona a linha.

## O que fazer

**1. Duplo clique abre a janela.** `onNodeDoubleClick` passa a abrir a janela de propriedades do elemento clicado, para qualquer tipo, inclusive imagem e grupo. `openElement` sai do duplo clique e continua no item do menu (renomeado de "Abrir nível de baixo" para "Abrir visão de" seguido do nível filho em minúsculas, como no botão do painel da direita) e no botão "Abrir …" do painel da direita, que já existe.

**2. Os outros caminhos abrem a mesma janela.** F2, o lápis do painel da direita e o item de menu, que passa de "Editar nome" para "Propriedades…" (atalho F2), abrem a janela na aba Geral, com o nome selecionado, como `focusName` já faz hoje.

**3. A janela.** O `Dialog` de "Detalhes do elemento" é substituído por um `Dialog` mais largo, com abas verticais à esquerda (em tela estreita, abas em linha no topo). O cabeçalho mostra o nome e, embaixo, a família e o rótulo do tipo, por exemplo "C4 Model · Contêiner" (o rótulo vem de `ELEMENT_TYPE_META`). O tipo `image` não tem família (`familyIdOfType("image")` devolve nulo), e o cabeçalho dele mostra só "Imagem", sem o ponto. Rodapé com o botão "Concluir" e o texto "Cada campo grava ao sair dele, e Ctrl+Z desfaz."

**4. Aba Geral, para todo elemento.** Nome, descrição e tags. Tags em campo de chips: Enter adiciona, o x do chip remove, até 40 caracteres cada, sem repetir. Grava em `tags`, coluna que já existe e já está no schema de `patchElement`.

**5. Aba C4, para os tipos C4** (todos, menos `image`). Tipo (o `Select` de hoje), tecnologia e a visão de detalhe:

- Tecnologia aparece em todo tipo, menos `person`, `external_person` e `group`. Em `container`, `microservice`, `browser`, `spa`, `terminal`, `component`, `store`, `queue`, `bucket` e `folder` (contêineres e componentes no C4, bancos e filas incluídos), a tecnologia vazia mostra o aviso "Sem tecnologia. O C4 pede que todo contêiner e componente tenha uma.", sem bloquear nada.
- Se `childLevelOf(tipo)` existir, um botão "Abrir visão de" seguido do nível filho chama `openElement` e fecha a janela. Sem nível filho, o texto "Este tipo não tem visão de detalhe no C4."

**6. Aba Imagem, para o tipo `image`.** Prévia pela URL assinada que o nó já usa, o nome do arquivo, e o botão "Substituir imagem…": abre o seletor, valida com `checkImageFile` e sobe por `uploadDiagramImage` com o segundo argumento igual ao id do elemento seguido de hífen e de um sufixo novo a cada envio (o upload usa `upsert: false`, então o nome não pode repetir). Depois grava por `patchElementComHistorico` o objeto `style` inteiro com o `imagePath` novo. Como o inverso de `style` já guarda o objeto anterior inteiro, o desfazer volta o `imagePath` antigo sem código novo. O arquivo antigo fica no bucket.

**7. Aba Ligações, para todo elemento.** As relações da visão ativa em que o elemento é origem ou destino, com "sai →" ou "← entra", o rótulo, a tecnologia e o nome do outro elemento. Clicar numa fecha a janela e seleciona a linha, pelo mesmo caminho de `onSelectRelationship`. Sem relação, o texto "Nenhuma relação entra ou sai deste elemento."

**8. Gravação com desfazer.** Todo campo da janela grava ao sair dele por `patchElementComHistorico`. Estenda o inverso de `patchElementComHistorico` para `tags`, no mesmo molde dos outros campos.

**9. Relação.** O item "Editar rótulo" do menu da linha vira "Propriedades…" e abre a mesma janela para a relação, com duas abas: Geral (rótulo, com a linha "De" origem "para" destino embaixo) e C4 (tecnologia ou protocolo, com o texto de apoio "O C4 pede o protocolo explícito entre contêineres."). Grava por `patchRelComHistorico`, estendendo o inverso dele para `technology` e acrescentando `technology` à interface `RelPatchInput` da rota, que hoje não tem esse campo. Duplo clique na linha continua criando ponto de quebra.

## O que não fazer aqui

- Nenhuma migração, nenhuma coluna nova. Link, propriedades livres e texto alternativo são da fase 2.
- Não mexa na aparência: o painel da direita continua igual, e a janela não tem campo de estilo.
- Duplo clique numa forma do painel da esquerda continua criando a forma.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: nodes e edges controlados pelo estado do app | A janela grava pelos mesmos `patchElementComHistorico` e `patchRelComHistorico` que já atualizam o estado da rota |
| "Segurança: conteúdo de usuário nunca é compilado nem avaliado como código" (arquitetura base) | Nome, descrição, tags e tecnologia entram como texto, nunca como HTML |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: duplo clique num sistema abre a janela e não cria visão; o item de menu "Abrir visão de contêineres" e o botão da aba C4 abrem a visão; F2 e o lápis abrem a janela com o nome selecionado; tag nova grava, sobrevive a recarregar e sai com Ctrl+Z; contêiner sem tecnologia mostra o aviso; "Substituir imagem…" troca a imagem e Ctrl+Z volta a anterior; clicar numa ligação seleciona a linha; "Propriedades…" no menu da linha edita rótulo e tecnologia, com desfazer.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
