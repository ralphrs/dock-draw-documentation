# Ordem DDP-245b: defeitos do editor, lote 2

Issue da ordem: a criar, rótulo `lovable`.

Segundo lote do cartão `DDP-245`, que junta defeitos pequenos do editor achados pelas sessões C e D. Cinco itens, sem migração.

## O que fazer

**1. Linha sem rótulo não mostra texto (`DDP-231`).** Em `src/components/editor/c4-edge.tsx`, o `span` do rótulo mostra "sem rótulo" em itálico a 50% em toda linha sem rótulo, com contraste perto de 2:1. Troque para: linha sem rótulo e não selecionada não desenha o `span`. Linha sem rótulo e selecionada mostra "sem rótulo" como hoje, para a pessoa saber onde clicar. Rótulo preenchido não muda.

**2. Texto da pessoa não entra na cabeça (`DDP-371`).** Em `ElementLabels` (`src/components/editor/element-shape.tsx`), com a pessoa em 120 por 60 e descrição visível, o bloco de três linhas começa perto de y = 21, dentro da cabeça, que vai até y = 2 × `headR` = 30. Regra nova, só para `shape === "person"`:

- A primeira linha nunca tem a linha de base acima de `2 * headR + 4 + s.fontSize`. Se o cálculo de `baseY` der menos, vale esse piso.
- Se, com o piso, a última linha passar de `h - 4`, sai primeiro a descrição, e depois o tipo, até caber. O nome fica sempre.

As outras formas não mudam.

**3. Clonar pela seta é um passo só no desfazer (`DDP-414`).** Em `handleSetaClique` (rota do editor), o clique sem vizinho chama `pasteAt` e depois `conectarComHistorico`, e cada um empilha uma entrada. O primeiro Ctrl+Z tira só a ligação. Troque por uma entrada só: depois que `conectarComHistorico` empilhar, tire as duas últimas entradas de `undoStack` e empilhe uma composta, cujo `undo` roda o `undo` da ligação e depois o da colagem, e cujo `redo` roda o `redo` da colagem e depois o da ligação. O `redo` da colagem recria o clone com o mesmo id (`DDP-294`, item 6), então o `redo` da ligação continua apontando para ele. Se a ligação falhar, nada é fundido e a colagem fica como passo próprio. O clique com vizinho na direção (só liga) não muda.

**4. Nome de pasta repetido diz o motivo (`DDP-421`).** As server functions `addViewFolder` e `patchViewFolder` passam a lançar um erro com a mensagem `NOME_REPETIDO` quando o Supabase devolver o código `23505`. Em `src/routes/_authenticated/projetos.$projectId.diagramas.index.tsx`, os `catch` de `criarPasta` e de `renomear` mostram "Já existe uma pasta com esse nome aqui." quando a mensagem for `NOME_REPETIDO`, e o aviso de hoje nos outros casos. O desfazer otimista continua igual.

**5. Duplo clique na estrela não cria forma (`DDP-429`).** Em `src/components/editor/palette-item.tsx`, o botão da estrela para o `click` com `stopPropagation`, mas o `dblclick` sobe até o `div` que cria a forma. Acrescente ao botão da estrela um `onDoubleClick` que chama `event.stopPropagation()`.

## O que não fazer aqui

- Nenhuma migração, nenhuma mudança de schema.
- Não mude o piso de tamanho do `NodeResizer` nem o corte por caracteres do nome.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: nodes e edges controlados pelo estado do app | O item 3 só junta entradas da pilha de desfazer que já existem, sem mudar como clone e ligação gravam |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: linha sem rótulo some e aparece "sem rótulo" só quando selecionada; pessoa em 120 por 60 com descrição não tem texto dentro da cabeça; clicar na seta sem vizinho e dar um Ctrl+Z tira clone e ligação juntos, e Ctrl+Shift+Z traz os dois; criar pasta com nome repetido mostra "Já existe uma pasta com esse nome aqui."; duplo clique na estrela só marca e desmarca, sem criar forma.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
