# Ordem DDP-402: janela "Mais formas" e painel de elementos com favoritas primeiro

Issue da ordem: `DDP-422`, rótulo `lovable`.

O humano aprovou a janela "Mais formas" e escolheu a organização 3 do painel, "Favoritas primeiro", na `DDP-402` em 2026-09-21. O layout aprovado está em [claude.ai/artifact/1V5c73v6Zdmuqy8djFUgA1](https://claude.ai/artifact/1V5c73v6Zdmuqy8djFUgA1). Hoje o painel da esquerda do editor (`src/routes/_authenticated/projetos.$projectId.diagramas.$viewId.tsx`, seção com o título "Elementos") é um `Accordion` com os grupos de `groupsForLevel` (`src/domain/c4/catalog.ts`), todos abertos, e cada forma é um `PaletteItem`.

## O que fazer

**1. Registro de famílias.** Arquivo novo `src/domain/c4/families.ts`, com a lista fixa de famílias. Cada uma tem `id`, nome, categoria e estado, disponível ou "em breve":

| `id` | Nome | Categoria | Estado |
| --- | --- | --- | --- |
| `basicas` | Básicas | Geral | em breve |
| `c4` | C4 Model | Arquitetura | disponível, com os grupos de `ELEMENT_GROUPS` |
| `aws` | AWS | Nuvem | em breve |
| `azure` | Azure | Nuvem | em breve |
| `gcp` | Google Cloud | Nuvem | em breve |
| `oci` | OCI | Nuvem | em breve |
| `tecnologias` | Tecnologias | Tecnologia | em breve |
| `uml` | UML | Arquitetura | em breve |
| `bpmn` | BPMN | Processos | em breve |

Só `c4` tem formas hoje. Família nova entra neste arquivo quando for construída, por outra ordem.

**2. Famílias ligadas, por pessoa e por projeto.** Guardadas em `localStorage` na chave `dokdraw-familias-` seguida do id do projeto, com hífen como as chaves que o app já usa (`dokdraw-palette`, `dokdraw-export-format`). O formato de hook é o de `usePalette` (`src/lib/palette.tsx`), com uma diferença: leitura e gravação ficam dentro de `try/catch`, que `usePalette` não tem. Sem nada gravado, valem `basicas` e `c4`. Família "em breve" gravada como ligada não mostra nada no painel.

**3. Janela "Mais formas".** Botão "+ Mais formas" logo abaixo do título "Elementos" abre um `Dialog`, o mesmo componente dos outros diálogos do app. Dentro:

- À esquerda, as categorias Todas, Geral, Arquitetura, Nuvem, Tecnologia e Processos, cada uma com a contagem de famílias. Clicar filtra os cards.
- No topo, busca por nome de família ou de forma.
- Um card por família, com o nome, até cinco miniaturas das formas (o mesmo desenho que `PaletteItem` já usa), a categoria, o total de formas e uma caixa de seleção. Família "em breve" mostra o selo "em breve", sem miniatura, com a caixa desabilitada.
- No rodapé, o texto "N famílias ligadas:" seguido dos nomes, e os botões Cancelar e Aplicar. Só Aplicar grava.

**4. Painel "Favoritas primeiro".** A seção "Elementos" troca o `Accordion` por esta ordem, de cima para baixo:

1. Busca "Buscar forma", que filtra por nome em todas as famílias ligadas e esconde as seções vazias.
2. "Favoritas": as formas marcadas com estrela. Cada `PaletteItem` ganha uma estrela que aparece no hover e fica fixa quando marcada. As favoritas ficam em `localStorage` na chave `dokdraw-formas-favoritas`, por pessoa e não por projeto, como lista de família e tipo (por exemplo `c4:person`).
3. "Usadas por último": as seis últimas formas criadas no quadro, mais recente primeiro, sem repetir. Ficam em `localStorage` na chave `dokdraw-formas-recentes-` seguida do id do projeto. Entra na lista toda criação a partir do painel, por duplo clique ou por arrasto, os dois pontos que chamam `criarElementoComHistorico`. Clone e colagem não contam.
4. Chips de família: "Todas" e um chip por família ligada e disponível. O chip escolhido filtra a grade abaixo.
5. A grade: as formas das famílias filtradas, com os subtítulos dos grupos de `ELEMENT_GROUPS` como hoje, sem abrir e fechar.

Favoritas e recentes também obedecem ao nível da visão: forma que `groupsForLevel` não oferece naquele nível não aparece em nenhuma das seções. Seção sem item some, título incluído.

**5. `PaletteItem` continua igual no resto.** Duplo clique cria em (120, 120) e arrasto solta no quadro, pelo mesmo `criarElementoComHistorico`. A seção "Conexões", com a "Relação", fica onde está.

## O que não fazer aqui

- Nenhuma forma nova, nenhuma família além do C4 com conteúdo.
- Nenhuma tabela, coluna ou migração: tudo fica no navegador de cada pessoa nesta versão. O formato de guardar forma de família que não é C4 é pergunta do ADR 015.
- Não mude `ELEMENT_TYPE_META`, `ELEMENT_GROUPS` nem `groupsForLevel`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| ADR 001: nodes e edges controlados pelo estado do app | O painel só muda como as formas são listadas. Criar continua por `criarElementoComHistorico` |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |

## Verificação

A sessão C confere no preview: abrir "+ Mais formas", filtrar por categoria e por busca, ver as famílias "em breve" desabilitadas, desmarcar C4 e aplicar (a grade esvazia), marcar de novo; marcar duas favoritas e ver as duas no topo depois de recarregar; criar três formas e ver as três em "Usadas por último", a mais recente primeiro; buscar "banco" e ver só as formas que casam; trocar para uma visão de contexto e ver sumir das favoritas e recentes o que o nível não oferece.

## Restrições

- Não altere o formato gravado do diagrama nem o schema.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
