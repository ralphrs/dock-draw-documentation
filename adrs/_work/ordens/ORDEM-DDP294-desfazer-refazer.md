# Ordem DDP-294: desfazer e refazer no editor de diagrama

Issue da ordem: `DDP-304`, rótulo `lovable`.

Prioridade 1, item 2 de `adrs/_work/ANALISE-editor-o-basico.md`. Depende da `DDP-293` (seleção múltipla), que troca o id único de seleção por um conjunto: as ações em lote desta ordem operam sobre esse conjunto.

## Estado atual

Nenhuma pilha de comando existe hoje. Toda mutação em `src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx` (app `dok-draw-app`) já segue o caminho otimista: `setModel` pinta a tela na hora, a mutação (`createMutation`, `patchMutation`, `relPatchMutation`, `commitNodes`) grava depois, e desfaz a pintura no `onError`. As operações relevantes: criar elemento (`createMutation`), excluir (`deleteNodeById`, `apagarConexao`), mover (`moveNodes`/`commitNodes`), redimensionar (`commitNodes`, com `width`/`height`), renomear e mudar estilo (`patchMutation`, `updateStyle`, `updateRelStyle`), conectar (`connectElements`), desconectar (`apagarConexao` da relação), colar (`pasteAt`) e duplicar (`copyNode` mais `pasteAt`).

## O que fazer

**1. Pilha de comando no cliente.** Ctrl+Z desfaz, Ctrl+Shift+Z e Ctrl+Y refazem (Cmd no Mac, mesmo padrão de modificador que o resto do editor já usa). Cada entrada da pilha guarda o suficiente para reaplicar a operação inversa da ação que a gerou: criar guarda excluir, excluir guarda os dados completos do que foi removido (para recriar), mover e redimensionar guardam a posição e o tamanho anteriores, renomear e mudar estilo guardam o valor anterior, conectar guarda desconectar e vice-versa, colar e duplicar guardam excluir do que foi criado.

**2. Ação em lote é um passo só.** Excluir cinco elementos selecionados de uma vez (`DDP-293`) empilha uma entrada, não cinco. Desfazer restaura os cinco juntos, refazer remove os cinco juntos.

**3. A operação inversa reaplica pelo mesmo caminho otimista de hoje.** Desfazer e refazer não são um mecanismo novo de gravação: chamam as mesmas funções e mutações que a ação original usaria se o usuário a tivesse feito de novo pela interface. A tela muda na hora, a gravação no banco segue depois.

**4. Falha ao desfazer não deixa tela e banco diferentes.** Se a mutação de uma operação inversa falhar, a pilha volta ao estado de antes da tentativa de desfazer (a entrada não é consumida) e um aviso aparece, no mesmo padrão de erro que as mutações de hoje já usam. A tela não fica mostrando um estado que o banco não tem.

**5. A pilha esvazia por sessão de edição.** Trocar de vista (abrir outro diagrama) ou recarregar a página limpa a pilha. Desfazer não atravessa vistas nem sobrevive a um recarregamento.

**6. Excluir e recriar mantêm o id.** Desfazer uma exclusão recria o elemento com o mesmo id que ele tinha, e recria junto as conexões que a exclusão levou. Com id novo, as outras entradas da pilha que apontam para o elemento ficariam órfãs, e refazer quebraria.

**7. Ação nova limpa o refazer.** Depois de desfazer, qualquer ação nova do usuário descarta as entradas de refazer, como em todo editor.

**8. Atalho dentro de campo de texto é do campo.** Com o foco num campo de texto (nome, rótulo, painel de propriedades), Ctrl+Z e Ctrl+Y desfazem a digitação do campo, e a pilha do diagrama não é tocada. É a mesma regra que o atalho de excluir já segue hoje.

## O que não fazer aqui

- Persistir a pilha de desfazer no banco ou entre sessões: fica só em memória do cliente.
- Estender desfazer a ações fora da lista da seção anterior (por exemplo exportar ou trocar zoom não entram na pilha).
- Setas de conexão ao passar o mouse (`DDP-295`) e colar imagem externa (`DDP-296`): ordens separadas. Se alguma delas já estiver no app quando esta ordem rodar, as ações que criam devem entrar na pilha pelo mesmo mecanismo desta ordem, sem ordem nova.
- Nenhuma migração, nenhuma tabela nova, nenhuma política RLS.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: `@xyflow/react`, com nodes e edges controlados pelo estado do app | A pilha só chama as funções de mutação que já existem, e a tela muda pelo `setModel` de hoje. Nenhum estado paralelo do React Flow |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: Ctrl+Z e Ctrl+Shift+Z/Ctrl+Y para cada operação da lista (criar, excluir, mover, redimensionar, renomear, mudar estilo, conectar, desconectar, colar, duplicar), exclusão em lote desfeita e refeita como um passo só, e que trocar de vista limpa a pilha, excluir um elemento conectado e desfazer devolve o elemento com as conexões, e Ctrl+Z dentro do campo de nome desfaz só a digitação.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
