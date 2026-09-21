# Ordem DDP-403: conectar pela seta do painel, sem botão Conectar, e exportar só pelo Baixar

Issue da ordem: `DDP-407`, rótulo `lovable`.

Pedido do humano em 2026-09-21, urgência. Dois arquivos: `src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx` e `src/components/editor/diagram-canvas.tsx` (app `dok-draw-app`).

## Parte 1: conectar pela seta do painel

**Estado atual.** O botão Conectar do cabeçalho (`variant={connectFrom ? "default" : "outline"}`) só liga com um elemento já selecionado (`if (!selectedElement) return toast.info(...)`) e usa o estado `connectFrom`. `DiagramCanvas` recebe `connectFrom` e, no `onNodeClick`, só desvia para `onNodeClickWhileConnecting` quando `connectFrom` já tem valor; sem isso, o clique chama `onSelect`. `handleConnect(targetElementId)` lê `connectFrom`, zera e chama `connectElements(from, targetElementId)`. O menu de clique direito do elemento já tem "Iniciar conexão daqui" (linha 224 de `diagram-canvas.tsx`), que grava `connectFrom` sem passar pelo botão.

**1. Sai o botão Conectar do cabeçalho.** Remove o `Button` das linhas 1236 a 1248 de `projetos.$projectId.diagramas.$viewId.tsx`. O item "Iniciar conexão daqui" do menu de clique direito não muda.

**2. Estado novo, `connectArmed`.** `const [connectArmed, setConnectArmed] = useState(false)`, ao lado de `connectFrom`. Verdadeiro do clique na seta do painel até a relação nascer ou até Esc, sem depender de elemento já selecionado.

**3. `handleConnect` vira `handleConnectClick`, cobre origem e destino.**

```ts
function handleConnectClick(elementId: string) {
  if (!connectFrom) {
    setConnectFrom(elementId);
    return;
  }
  if (elementId !== connectFrom) connectElements(connectFrom, elementId);
  setConnectFrom(null);
  setConnectArmed(false);
}
```

Primeiro clique em elemento, com `connectArmed` ligado e `connectFrom` vazio, grava a origem. Segundo clique cria a relação por `connectElements` (sem mecanismo novo) e desliga `connectArmed` e `connectFrom` juntos: o modo desliga depois de criar, como pede o pedido.

**4. `DiagramCanvas` reage a `connectArmed` do mesmo jeito que já reage a `connectFrom`.** Nova prop `connectArmed: boolean`. Em `onNodeClick` (linha 291), a condição `if (connectFrom)` vira `if (connectFrom || connectArmed)`, chamando `onNodeClickWhileConnecting` (que agora aponta para `handleConnectClick`). Clicar em elemento com o modo ligado nunca chama `onSelect`: a condição atual já tem `return` antes da linha de seleção, então a seleção (e a seleção múltipla da `DDP-301`, caixa de arrasto, Shift+clique, Ctrl+A) já fica intocada por construção, sem precisar de outro código.

**5. Seta "Relação" no painel de elementos.** Não é tipo de elemento (`C4ElementType`): não entra em `ELEMENT_GROUPS` de `catalog.ts`, porque `PaletteItem` (`palette-item.tsx`) é arrastável e cria elemento por `onCreate`, mecanismo que não se aplica aqui. Componente novo e pequeno, no mesmo estilo visual do `PaletteItem` (borda, fundo, hover), sem `draggable`, com o ícone `Cable` (já importado no arquivo) no lugar da miniatura de `ElementShape`, rótulo "Relação". Fica num grupo próprio, "Conexões", acima do accordion "Elementos" existente. Ao clicar:

```ts
onClick: () => {
  if (connectArmed || connectFrom) {
    setConnectArmed(false);
    setConnectFrom(null);
    return;
  }
  setConnectArmed(true);
}
```

Clicar de novo com o modo ligado desliga, mesmo comportamento de alternância que o botão antigo tinha. O item fica com destaque visual (mesma borda `border-primary` que os itens selecionados já usam em outros lugares do app) enquanto `connectArmed || connectFrom` é verdadeiro.

**6. Cursor e Esc.** Enquanto `connectArmed || connectFrom`, o contêiner do quadro (onde `ReactFlow` renderiza) ganha `cursor-crosshair` ou equivalente, trocando de volta ao cursor normal quando o modo desliga. No `useEffect` de atalhos de teclado já existente na rota, tecla `Escape` com `connectArmed || connectFrom` verdadeiro zera os dois, cancelando a qualquer momento, sem criar relação.

**7. Bolinhas de conexão não mudam.** Arrastar de uma alça (`Handle`) de um elemento até outro elemento continua criando a conexão pelo caminho de hoje, sem relação com `connectArmed`.

**8. Convivência com a seleção múltipla (`DDP-301`/`DDP-293`).** Coberto pelo item 4: o clique em elemento com o modo de conexão ligado nunca chega à lógica de seleção. Enquanto `connectArmed || connectFrom` for verdadeiro, a caixa de arrasto de seleção e o Ctrl+A também ficam suspensos: um clique ou arrasto no quadro serve só para escolher origem e destino, nunca para selecionar. Se a `DDP-301`/`DDP-293` já estiver no app quando esta ordem rodar, o gate dela para modos exclusivos (o mesmo que já impede seleção durante redimensionamento) ganha `connectArmed || connectFrom` como mais uma condição.

**9. Convivência com as setas de hover (`DDP-306`/`DDP-295`).** A `ORDEM-DDP295-setas-de-conexao.md` já lista duas condições para as setas não aparecerem: durante arrasto de qualquer elemento, e com o `NodeResizer` ativo. Esta ordem soma uma terceira: as setas de hover não aparecem enquanto `connectArmed || connectFrom` for verdadeiro. Se a `DDP-306` já estiver no app quando esta ordem rodar, o componente das setas ganha essa condição a mais. Os dois mecanismos continuam independentes fora disso: a seta do painel é um modo de dois cliques, a seta de hover é um arrasto ou clique direto sobre o próprio elemento, e nenhum dos dois substitui o outro.

## Parte 2: exportar só pelo botão Baixar

**1. Fica só o botão Baixar do cabeçalho.** O `DropdownMenu` das linhas 1249 a 1264 de `projetos.$projectId.diagramas.$viewId.tsx` não muda, com as três opções de hoje (PNG, SVG, .drawio).

**2. Sai a seção Baixar do painel de detalhes.** Remove o bloco `<div className="space-y-1"><Label>Baixar</Label>...</div>` das linhas 2033 a 2059, os três `Button` de Imagem PNG, Vetor SVG e Arquivo .drawio.

**3. Saem os três itens de exportar do menu de clique direito do quadro.** Em `diagram-canvas.tsx`, `paneEntries`: remove as linhas 268 a 270 (`Baixar PNG`, `Baixar SVG`, `Baixar .drawio`) e o separador da linha 267, que fica sem função depois da remoção, porque nada mais segue ele na lista.

**4. `runExport` não muda.** Continua exatamente como está, só perde dois dos três lugares que o chamavam.

**5. A ordem de cabeçalho e rodapé roda depois.** A `ORDEM-DDP395-tela-cabecalho-rodape.md` (issue `DDP-399`), ainda não aplicada nesta data, troca o `DropdownMenu` do Baixar por um `Dialog` com prévia e a opção de incluir as faixas. Esta ordem não antecipa essa troca: o Baixar de hoje (dropdown com as três opções) continua como está, só os outros dois caminhos saem.

## O que não fazer aqui

- Não mude `connectElements`, `createRelationship` nem o formato gravado da relação.
- Não toque no `DropdownMenu` do botão Baixar do cabeçalho.
- Não implemente a `DDP-301`/`DDP-293` nem a `DDP-306`/`DDP-295` aqui: só prepare o gate para conviver com elas, itens 8 e 9.
- Nenhuma migração, nenhuma dependência nova.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: `@xyflow/react`, nodes e edges controlados pelo estado do app | `handleConnectClick` grava pelo mesmo `connectElements` que já atualiza o estado da rota. Nenhum estado paralelo do React Flow |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova. Ícone `Cable` já importado |

## Verificação

A sessão C confere no preview: o botão Conectar não existe mais no cabeçalho; clicar em "Relação" no painel liga o modo (cursor muda, item fica destacado), clicar em dois elementos em sequência cria a relação com o estilo padrão, e o modo desliga sozinho; clicar em "Relação" de novo com o modo ligado desliga sem criar nada; Esc cancela a qualquer momento do modo; clicar em elemento com o modo ligado não muda a seleção nem abre a seleção múltipla; arrastar da bolinha de um elemento até outro continua criando conexão; "Iniciar conexão daqui" no menu de clique direito continua funcionando; o painel de detalhes sem seleção não tem mais a seção Baixar; o menu de clique direito do quadro não tem mais os três itens de baixar; o botão Baixar do cabeçalho continua exportando PNG, SVG e .drawio normalmente.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
