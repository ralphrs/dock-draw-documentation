# Ordem DDP-395b: tela de configuração e exportação do cabeçalho e rodapé

Issue da ordem: `DDP-399`, rótulo `lovable`.

Segunda de duas ordens da mesma proposta (`DDP-392`, `adrs/_work/PROPOSTA-cabecalho-rodape.md`, layout aprovado em [claude.ai/artifact/2K35f1bCzXYUumpNCr2yCD](https://claude.ai/artifact/2K35f1bCzXYUumpNCr2yCD)). Depende da `ORDEM-DDP395-migracao-cabecalho-rodape.md`: tabela, RLS e função de leitura/gravação validada por Zod precisam estar aplicadas antes desta. Depende também das telas no Figma (`DDP-394`), que trazem os componentes, a regra de margens e a fonte serifada: esta ordem roda depois delas, e o valor `serif` do schema usa a família registrada lá.

## O que fazer

**1. Rota nova, `projetos.$projectId.configuracoes.cabecalho-rodape.tsx`** (app `dok-draw-app`, convenção de arquivo igual às rotas já existentes em `src/routes/_authenticated/`). Breadcrumb "Projetos › [nome do projeto] › Cabeçalho e rodapé". Acesso pelo menu do projeto, junto de "Diagramas" e "Wiki".

**2. Duas abas, Cabeçalho e Rodapé.** Cada uma com três zonas, Esquerda, Centro e Direita. Cada zona lista os itens na ordem em que ficam (texto ou imagem), com botões "+ Texto" e "+ Imagem" no fim da lista. Item de texto novo entra com um valor padrão vazio, focado para digitar. Arrastar reordena dentro da zona e entre zonas.

**3. Painel de formatação do item selecionado.** Texto: fonte (`Inter`, `JetBrains Mono` ou `Serifada`, campo `font` do schema), tamanho (`11`, `12`, `14`, `16`, `20`), negrito, itálico, sublinhado, cor (paleta com 4 tons mais campo hex livre) e alinhamento na zona (esquerda, centro, direita). Imagem: altura dentro da faixa (`8` a `200`px) e alinhamento na zona. Sem item selecionado, o painel some.

**4. Painel da faixa.** Altura (`Compacta, 40 px` / `Média, 56 px` / `Alta, 72 px`), fundo (cor ou transparente) e a caixa "Linha separando do diagrama".

**5. Prévia ao lado, ao vivo.** Um diagrama real do projeto (o mais recente editado, ou o primeiro da lista se nenhum tiver sido aberto), com a faixa do cabeçalho acima e a do rodapé abaixo, por fora do diagrama e sem cobrir nada dele, como no layout aprovado, atualizando a cada mudança de campo.

**6. Salvar.** Grava por debounce (a cada pausa de digitação ou mudança de campo) pela função da `ORDEM-DDP395-migracao-cabecalho-rodape.md`. Falha de gravação mostra aviso, no padrão de erro que as mutações do app já usam, sem perder o que a pessoa digitou na tela.

**7. Diálogo de exportação, novo.** Hoje `runExport(kind)` (`src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx`) chama a exportação direto, sem diálogo. Essa chamada direta vira um `Dialog` (mesmo componente que o app já usa em outros diálogos, como o de detalhes do elemento): título "Exportar '[nome do diagrama]'", seleção de formato (PNG, SVG, .drawio, um selecionado por vez), a caixa "Incluir cabeçalho e rodapé do projeto" com o texto de apoio descrevendo o que está configurado, prévia em miniatura do resultado, e os botões Cancelar e Baixar. A caixa vem marcada quando o projeto tem `header` ou `footer` gravado (qualquer um dos dois, não precisa dos dois), e o app lembra a última escolha por pessoa em `localStorage`, mesmo padrão de `usePalette` (`src/lib/palette.tsx`). Link "Editar cabeçalho e rodapé" no rodapé do diálogo leva à rota do item 1.

**8. `buildSvg` monta as faixas.** Em `src/components/editor/export-diagram.tsx`, `buildSvg` recebe `header` e `footer` opcionais (o formato do schema Zod da outra ordem). Quando presentes e a exportação pede as faixas: a altura da faixa de cabeçalho soma ao topo do `viewBox` (o diagrama desce a mesma medida), a do rodapé soma à base, cada faixa desenha seu fundo, a linha separadora (se marcada) e os itens de cada zona (texto como `<text>`, imagem como `<image>` com a URL assinada do bucket, mesmo mecanismo de embutir imagem que a `DDP-308` já pede para elementos de imagem no diagrama). `exportViewAsSvg` e `exportViewAsPng` passam adiante o resultado maior, sem mudar a montagem do diagrama em si. Se a ordem de colar imagem (`DDP-308`) já estiver no app, `buildSvg` já é assíncrona, e esta ordem segue a assinatura que encontrar.

**9. `.drawio` monta as faixas como dois grupos travados.** Em `exportViewAsDrawio`, quando as faixas estão marcadas: dois `mxCell` do tipo grupo (`vertex="1"` com `style` incluindo `group;locked=1`), um acima e um abaixo do retângulo que hoje envolve os nós do diagrama, cada um com os `mxCell` filhos de texto e imagem posicionados dentro pela mesma zona/alinhamento da faixa. `locked=1` impede mover ou editar o grupo depois de aberto no draw.io, mantendo o desenho original.

**10. Bucket de imagem ainda não existe.** A `DDP-308` (bucket `diagram-images`) segue "A Fazer" nesta data. Enquanto o bucket não existir, o botão "+ Imagem" das zonas fica desabilitado, com aviso "Disponível em breve" ao passar o mouse, e texto funciona normalmente. Quando o bucket entrar, "+ Imagem" habilita sem outra mudança nesta tela, porque o campo `imagePath` do schema já está pronto.

**11. Linha de atribuição da AWS, fora desta ordem.** O arquivo exportado reserva a faixa inteira, abaixo do rodapé (ou abaixo do diagrama, se o rodapé estiver desligado), sempre que o diagrama tiver algum ícone AWS, independente da caixa "Incluir cabeçalho e rodapé" estar marcada. O texto e a regra de quando mostrar ficam para a ordem que implementar a `DDP-236` no fluxo de exportação: esta ordem só deixa o espaço reservado, sem desenhar nada nele.

## O que não fazer aqui

- Campo automático no texto (nome do diagrama, data, versão): a proposta pede texto livre só, nesta versão.
- Cabeçalho ou rodapé por diagrama, diferente do de projeto.
- Mostrar as faixas no quadro de edição: elas aparecem só na prévia desta tela e no arquivo exportado.
- Escrever o texto ou a lógica da atribuição AWS: só reservar o espaço, item 11.
- Nenhuma migração: a tabela já é da outra ordem.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: `@xyflow/react`, nodes e edges controlados pelo estado do app | A faixa é desenho fora do quadro React Flow, gravada à parte, sem tocar no modelo do diagrama |
| "Segurança: conteúdo de usuário nunca é compilado nem avaliado como código" (arquitetura base) | Texto da faixa entra como `<text>`/nó de texto, nunca como HTML ou script interpretado |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: criar itens de texto nas três zonas do cabeçalho e do rodapé, formatar fonte/tamanho/estilo/cor/alinhamento, mudar altura/fundo/linha da faixa, ver a prévia atualizar; exportar em PNG, SVG e .drawio com a caixa marcada e desmarcada, e ver a diferença no arquivo; reabrir o diálogo de exportação depois e ver a última escolha lembrada; com o bucket de imagem ainda fora do ar, "+ Imagem" aparece desabilitado e o texto continua funcionando.

## Restrições

- Não altere o formato gravado do diagrama nem o schema de `model_elements`.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
