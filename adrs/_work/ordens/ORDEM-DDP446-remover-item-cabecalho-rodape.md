# Ordem DDP-446: remover texto ou imagem do cabeçalho e rodapé

**Issue:** `DDP-446` (defeito visto pelo humano em produção em 2026-09-22, no comentário da `DDP-440`: depois de adicionar texto ou imagem no cabeçalho ou no rodapé, não dá para excluir o item).
**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação nesta ordem.

## Causa

A tela `src/routes/_authenticated/projetos.$projectId.configuracoes.cabecalho-rodape.tsx` tem `adicionarTexto` (linha 216), `escolherImagem` (linha 227), `atualizarItem` (linha 263) e `moverItem` (linha 273), mas nenhuma função que tire um item de uma zona. O painel "Texto selecionado" e "Imagem selecionada" (linhas 535 a 687) edita texto, fonte, tamanho, cor, altura e alinhamento, e não tem botão de remover. A única saída hoje é esvaziar o texto, porque `stripEmptyTextItems` descarta texto vazio na gravação (linha 144). Para imagem não há saída nenhuma.

## O que fazer

**1. Função de remoção.** Ao lado de `atualizarItem`, `removerItem(alvo: Selecao)`: lê `frames[alvo.band]`, filtra `zones[alvo.zone]` tirando o índice `alvo.index` (mesma forma do `filter` de `moverItem`, linha 284), chama `alterarBand` com a zona nova, e em seguida `setSelecao(null)`. A gravação acontece pelo `useEffect` de debounce que já existe (linhas 138 a 153), sem chamada nova.

**2. Botão no painel do item.** No fim da `section` do item selecionado, depois do bloco "Alinhamento na zona" (rótulo na linha 664) e antes do `</section>` da linha 687, um `Button` `type="button"`, `variant="outline"`, `size="sm"`, `className="mt-4 w-full text-destructive"`, com `Trash2` (`lucide-react`, acrescentar ao import das linhas 4 a 13) e o texto "Remover texto" ou "Remover imagem" conforme `itemSelecionado.kind`, `onClick={() => removerItem(selecao)}`. Sem diálogo de confirmação: o item some da faixa na hora e a pessoa vê o resultado na prévia ao vivo. Se remover por engano, adiciona de novo.

**3. Tecla Delete.** No `button` de cada item da lista (a partir da linha 375, com o `onClick={() => setSelecao(...)}` na linha 388), `onKeyDown`: `Delete` ou `Backspace` com o item selecionado chama `removerItem(eu)` e `e.preventDefault()`. Não dispara quando o foco está no `Input` de texto do painel, porque o evento fica no `button` da lista.

**4. Conferir** no preview: adicionar texto no cabeçalho, remover pelo botão, a prévia atualiza e o item some depois de recarregar a página. Repetir com imagem no rodapé. Remover o último item de uma zona deixa a zona vazia e a faixa continua ativa.

## O que não fazer aqui

- Não apague o arquivo da imagem no bucket ao remover o item. O arquivo fica órfão e a limpeza do bucket é assunto da `DDP-308`, não desta ordem.
- Não mude a gravação, o debounce nem `stripEmptyTextItems`.
- Não mexa em `.env*` nem em migração.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| Bucket de imagens com trava de tipo e regras próprias (`DDP-308`) | "O que não fazer": o arquivo não é apagado aqui |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project` nesta ordem. Publicar depois entra num card `app-release` |
