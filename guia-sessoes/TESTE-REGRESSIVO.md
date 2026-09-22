# Plano de teste regressivo do app

Cobre tudo que o Lovable entregou até 2026-09-22 e que passou pela revisão da sessão C. O objetivo é saber se cada entrega ainda funciona depois das entregas seguintes, porque cada ordem mexe nos mesmos arquivos do editor (`c4-node.tsx`, `c4-edge.tsx`, `element-shape.tsx`, a rota do diagrama) e uma quebra a outra sem ninguém notar.

## Como o plano funciona

- **Uma rodada por publicação.** Antes de todo card `FAZER DEPLOY`, a rodada roda no preview. Depois da publicação, os casos marcados com `prod` rodam de novo em produção, porque o preview e a produção já divergiram uma vez (`DDP-446`, remoção de item do cabeçalho, defeito visto só em produção).
- **Quem roda.** Três camadas, três executores:
  - **Código** (seção A): sessão C, no clone local, sem navegador.
  - **Banco** (seção B): sessão A, pelo MCP do Lovable (`query_database`), com o roteiro `guia-sessoes/bin/confere-execucao.sh`.
  - **Tela** (seções C a H): quem tem navegador autenticado. A sessão A roda pela extensão do Chrome quando o humano deixa uma aba do app logada. Sem isso, o humano roda.
- **Evidência.** Cada caso termina com `passou`, `falhou` ou `não rodou`, e um falhou leva captura de tela e o passo em que parou. O resultado da rodada vai num comentário do card da rodada no Jira, na tabela abaixo copiada com a coluna de resultado preenchida.
- **Falha vira ordem.** Caso que falha abre defeito no quadro com o id do caso no título, e a correção sai como ordem ao Lovable. Ninguém conserta código por fora.
- **Dados.** Todo caso de tela roda num projeto chamado `Regressão`, o mesmo que o Lovable usa para conferir cada ordem no preview (regra do `PROTOCOLO.md`, seção "Desenvolvimento no app"), criado para isso, com um diagrama `RT` de três elementos (Pessoa `Ana`, Sistema `Portal`, Sistema externo `Pagamentos`) e uma conexão `Ana → Portal`. Nada de projeto real. Ao fim da rodada, o projeto `Regressão` fica, para a próxima.
- **Ambiente.** `preview` é `https://id-preview--57b09d7c-1514-4504-a4db-3b392c9dea31.lovable.app`. `prod` é o domínio publicado. A coluna "Onde" diz em qual dos dois o caso roda. `ambos` roda nos dois.

## Seção A: código (sessão C)

| Id | Origem | Passos | Esperado | Onde |
| --- | --- | --- | --- | --- |
| RT-A01 | Todas | `git pull --ff-only`, `bun run typecheck` | Zero erros | clone |
| RT-A02 | Todas | `bun run build` | Build conclui | clone |
| RT-A03 | F1, F3, F4 (`DDP-67`, `85`, `92`) | `bun run test` | Todos os testes passam, contagem registrada (20 em 2026-09-22) | clone |
| RT-A04 | `DEC-0041` | `grep -rn "ADR\|DDP-\|DEC-\|sessão" src/routes src/components` só em texto visível | Nenhum texto de tela com referência interna | clone |
| RT-A05 | `DDP-293` | `grep -rn "hideAttribution" src` | `proOptions={{ hideAttribution: true }}` presente | clone |

## Seção B: banco (sessão A)

| Id | Origem | Passos | Esperado | Onde |
| --- | --- | --- | --- | --- |
| RT-B01 | S1a a S1g (`DDP-98`, `119`, `140`) | `confere-execucao.sh` contra o DDL das ordens | Schema `content` com `workspace_members`, `spaces`, `space_members`, `pages`, `page_revisions`, `revision_statuses`, `revision_status_events`, `revision_current_status`, `page_drafts`, a função `effective_role`, a coluna `pages.node_kind` com CHECK e a linha `owner` do workspace. Sem RLS em `content`: a S2 ainda não foi pedida (`DDP-155`) | prod |
| RT-B02 | `DDP-308`, `419` | Consultar `storage.buckets` e `pg_policies` | Bucket `diagram-images` privado, limite de 5 MB, política de envio com extensão `png`, `jpg`, `webp`. `allowed_mime_types` fica nulo, lacuna aceita na `DDP-430` | prod |
| RT-B03 | `DDP-311` | Consultar `view_folders` | Tabela existe, com `parent_folder_id` e índice único `(project_id, parent_folder_id, name)` com `NULLS NOT DISTINCT` | prod |
| RT-B04 | `DDP-397` | Consultar `project_export_frames` | Tabela existe, uma linha por projeto configurado | prod |
| RT-B05 | `DDP-453` | Consultar `relationships` do diagrama `RT` | Conexão nova gravada com `label` vazio, `style_props` com o que o painel gravou | preview |

## Seção C: editor, seleção e histórico

| Id | Origem | Passos | Esperado | Onde |
| --- | --- | --- | --- | --- |
| RT-C01 | `DDP-293` | Arrastar no fundo cobrindo dois elementos | Os dois ficam selecionados | ambos |
| RT-C02 | `DDP-293` | Shift+clique num terceiro, depois Shift+clique nele de novo | Entra e sai da seleção | ambos |
| RT-C03 | `DDP-293` | Ctrl/Cmd+A | Todos os elementos selecionados | ambos |
| RT-C04 | `DDP-293` | Com três selecionados, arrastar um deles, recarregar a página | Os três ficam onde caíram | ambos |
| RT-C05 | `DDP-293` | Selecionar um, seta do teclado 3 vezes, Shift+seta 1 vez | Move 1px por toque e 20px com Shift (10px depois da `DDP-516`) | ambos |
| RT-C06 | `DDP-293` | Copiar três elementos, colar | Colados com a mesma posição relativa | ambos |
| RT-C07 | `DDP-294` | Criar, mover, renomear, mudar cor, conectar, excluir. Ctrl+Z seis vezes, Ctrl+Shift+Z seis vezes | Cada ação desfeita e refeita num passo, na ordem inversa | ambos |
| RT-C08 | `DDP-294` | Excluir um elemento com duas conexões, Ctrl+Z | Elemento volta com as duas conexões | ambos |
| RT-C09 | `DDP-294` | Editar o nome, digitar três letras, Ctrl+Z dentro do campo | Desfaz só a digitação, não a última ação do quadro | ambos |
| RT-C10 | `DDP-298` | Selecionar dois, alinhar à esquerda, ao topo, ao centro | Alinham na direção pedida. Ctrl+Z volta | ambos |
| RT-C11 | `DDP-298` | Selecionar três, distribuir na horizontal | Espaços iguais entre eles | ambos |
| RT-C12 | `DDP-298` | Ctrl+mais, Ctrl+menos, Ctrl+0, Ctrl+Shift+H | Zoom entra, sai, volta a 100%, ajusta ao conteúdo | ambos |
| RT-C13 | `DDP-298` | Espaço pressionado, arrastar sobre um elemento | Move a câmera, elemento fica parado, nenhuma seleção abre | ambos |
| RT-C14 | `DDP-298` | Ctrl+L num elemento, tentar mover e redimensionar, Ctrl+L de novo | Travado não move nem redimensiona. Destrava | ambos |
| RT-C15 | `DDP-298` | Alt+arrastar um elemento | Original fica, uma cópia vai para onde soltou | ambos |
| RT-C16 | `DDP-516` | Selecionar duas formas e uma conexão com o laço, Delete, Ctrl+Z | Os três somem, os três voltam | preview |

## Seção D: formas, paleta e propriedades

| Id | Origem | Passos | Esperado | Onde |
| --- | --- | --- | --- | --- |
| RT-D01 | `DDP-328` | Trocar o esquema para DokDraw, olhar os dois temas | Internos em tons de violeta, externos em cinza, texto legível | ambos |
| RT-D02 | `DDP-328` | Trocar para C4 Padrão | Mesma estrutura em azul | ambos |
| RT-D03 | `DDP-369` | Pessoa em 120×60 com descrição | Topo da cabeça no topo da caixa, texto não cruza a cabeça | ambos |
| RT-D04 | `DDP-369` | Terminal 120×60 com nome de 30 caracteres | Nome corta com reticências sem cobrir o ícone de prompt | ambos |
| RT-D05 | `DDP-369` | Pessoa externa e Sistema externo | Rótulo de tipo diz "Pessoa externa" e "Sistema externo" | ambos |
| RT-D06 | `DDP-245b` | Pessoa em 120×60 com descrição | Nenhum texto dentro da cabeça | ambos |
| RT-D07 | `DDP-402` | Abrir "+ Mais formas", filtrar por categoria, buscar "banco" | Filtro e busca reduzem a lista, famílias "em breve" desabilitadas | ambos |
| RT-D08 | `DDP-402` | Marcar duas favoritas, recarregar | As duas no topo do painel | ambos |
| RT-D09 | `DDP-402` | Criar três formas | As três em "Usadas por último", a mais recente primeiro | ambos |
| RT-D10 | `DDP-245b` | Duplo clique na estrela de favorita | Só marca e desmarca, nenhuma forma criada | ambos |
| RT-D11 | `DDP-445` | Olhar a paleta e arrastar um cilindro, uma fila e uma pasta | Miniatura e imagem de arrasto com a mesma proporção da forma no canvas | preview |
| RT-D12 | `DDP-424` | Duplo clique num sistema | Abre a janela de propriedades, não cria visão | ambos |
| RT-D13 | `DDP-424` | F2 num elemento | Janela abre com o nome selecionado | ambos |
| RT-D14 | `DDP-424` | Acrescentar uma tag, recarregar, Ctrl+Z | Tag gravada, sobrevive ao recarregar, sai com Ctrl+Z | ambos |
| RT-D15 | `DDP-424` | Contêiner sem tecnologia | Aviso na janela | ambos |
| RT-D16 | `DDP-516` | Elemento selecionado, escolher cor de borda no painel | Forma mostra a cor escolhida, anel violeta por fora | preview |
| RT-D17 | `DDP-516` | Aba Estilo do painel Detalhes | Espaço entre a barra de abas e o primeiro campo | preview |
| RT-D18 | `DDP-513` | Arrastar elipse, losango, triângulo e texto solto | Quatro formas no canvas, nome truncado no losango em 160×100, rótulo na base do triângulo | preview |

## Seção E: conexões

| Id | Origem | Passos | Esperado | Onde |
| --- | --- | --- | --- | --- |
| RT-E01 | `DDP-295` | Passar o mouse num elemento | Quatro setas aparecem, somem ao sair. Não aparecem durante arrasto nem redimensionamento | ambos |
| RT-E02 | `DDP-295` | Arrastar uma seta até outro elemento | Conexão criada | ambos |
| RT-E03 | `DDP-295` | Clicar numa seta sem vizinho naquela direção | Clona o elemento e conecta. Ctrl+Z tira clone e ligação juntos | ambos |
| RT-E04 | `DDP-295` | Clicar numa seta com vizinho na direção | Conecta ao existente, sem clonar | ambos |
| RT-E05 | `DDP-403` | Cabeçalho do editor | Botão Conectar não existe | ambos |
| RT-E06 | `DDP-403` | Clicar em "Relação" no painel, clicar em dois elementos | Modo liga, conexão criada, modo desliga sozinho. Esc cancela | ambos |
| RT-E07 | `DDP-245b` | Conexão sem rótulo, selecionar e desselecionar | "sem rótulo" só aparece selecionada | ambos |
| RT-E08 | `DDP-453` | Conexão nova | Nasce sem texto | preview |
| RT-E09 | `DDP-453` | Painel: rota curva com um ponto de quebra | Curva visivelmente diferente da ortogonal | preview |
| RT-E10 | `DDP-453` | Painel: espessura 3, tracejado, cor do token, ponta aberta nos dois lados | Ponta não fica gigante (14px), traço e cor aplicados | preview |
| RT-E11 | `DDP-453` | Inverter direção duas vezes numa conexão com pontas diferentes | Pontas trocam e voltam | preview |
| RT-E12 | `DDP-453` | Exportar SVG e abrir no navegador | Cor, espessura, pontas, traço e rota iguais ao canvas | preview |
| RT-E13 | `DDP-453` | Exportar .drawio e abrir em app.diagrams.net | Mesmas pontas e rotas | preview |
| RT-E14 | `DDP-515` | Ligar o ponto `r:0.25` de A no `l:0.75` de B, recarregar | Seta sai e chega nesses pontos, sobrevive ao recarregar | preview |
| RT-E15 | `DDP-515` | Pegar a ponta de destino e soltar em C, Ctrl+Z | Destino muda e volta | preview |
| RT-E16 | `DDP-515` | Botão direito na linha: adicionar ponto, remover ponto | Ponto entra e sai | preview |
| RT-E17 | `DDP-515` | Selecionar uma conexão | Nenhum X sobre a linha | preview |

## Seção F: imagens, pastas e exportação

| Id | Origem | Passos | Esperado | Onde |
| --- | --- | --- | --- | --- |
| RT-F01 | `DDP-296`, `308b` | Colar PNG, JPEG e WebP da área de transferência | Os três sobem e aparecem na posição do ponteiro | ambos |
| RT-F02 | `DDP-296`, `308b` | Colar SVG, colar arquivo acima de 5 MB | Recusados com aviso | ambos |
| RT-F03 | `DDP-296` | Apagar a imagem, Ctrl+Z | Imagem volta | ambos |
| RT-F04 | `DDP-296` | Exportar PNG, SVG e .drawio com uma imagem | Imagem aparece nos três | ambos |
| RT-F05 | `DDP-297` | Criar pasta na raiz e dentro dela, renomear | Pastas criadas e renomeadas | ambos |
| RT-F06 | `DDP-297` | Arrastar diagrama e pasta para dentro de outra pasta | Movem | ambos |
| RT-F07 | `DDP-297` | Duas pastas irmãs com o mesmo nome | Segunda recusada: "Já existe uma pasta com esse nome aqui." | ambos |
| RT-F08 | `DDP-297` | Arrastar pasta para dentro de uma subpasta dela | Recusado | ambos |
| RT-F09 | `DDP-297` | Excluir pasta com conteúdo | Pede confirmação e remove tudo dentro | ambos |
| RT-F10 | `DDP-403` | Diálogo Baixar | Única saída de exportação, PNG, SVG e .drawio | ambos |

## Seção G: cabeçalho e rodapé

| Id | Origem | Passos | Esperado | Onde |
| --- | --- | --- | --- | --- |
| RT-G01 | `DDP-395b` | Configurações do projeto, cabeçalho e rodapé: texto nas três zonas das duas faixas | Prévia atualiza a cada mudança | ambos |
| RT-G02 | `DDP-395b` | Fonte, tamanho, cor, alinhamento, altura da faixa, fundo, linha | Prévia reflete cada um | ambos |
| RT-G03 | `DDP-395b` | Subir PNG numa zona | Aparece na prévia e nos três exportados | ambos |
| RT-G04 | `DDP-395b` | Exportar com a caixa marcada e desmarcada | Faixas presentes e ausentes nos arquivos. Reabrir o diálogo lembra a última escolha | ambos |
| RT-G05 | `DDP-446` | Remover texto pelo botão, remover imagem, remover o último item de uma zona, recarregar | Itens somem e não voltam. Zona vazia, faixa continua ativa | preview |

## Seção H: projeto, navegação e telas

| Id | Origem | Passos | Esperado | Onde |
| --- | --- | --- | --- | --- |
| RT-H01 | `DDP-439` | Três pontos no card do projeto | Menu com Configurações, Copiar link, Excluir. Clique não abre o projeto | preview |
| RT-H02 | `DDP-439` | Engrenagem ao lado das abas | Abre a configuração com Projeto, Wiki, Diagramas, Pessoas e zona de perigo | preview |
| RT-H03 | `DDP-439` | Geral: mudar nome e descrição, salvar | Nome muda na lista e no cabeçalho | preview |
| RT-H04 | `DDP-439` | Lista de projetos: ordenar por Atualizado, Nome, Criado, recarregar | Ordem aplicada e lembrada | preview |
| RT-H05 | `DDP-439` | Link "Editar cabeçalho e rodapé" no diálogo Baixar | Abre a tela dentro da configuração | preview |
| RT-H06 | `DDP-519` | Configuração, Membros | Selo diz "Convites por projeto em breve", e-mail do dono listado | preview |
| RT-H07 | `DDP-143` | Wiki: alternar preview, código, código com preview | Três visões funcionam, conteúdo igual nas três | ambos |
| RT-H08 | Todas | Tema claro e escuro em cada tela acima | Nenhum texto ilegível, nenhum fundo branco no Escuro | ambos |
| RT-H09 | Todas | Largura 390px na lista de projetos e na configuração | Nada corta, nada sobrepõe | preview |

## Registro das rodadas

| Rodada | Data | Card | Ambiente | Executor | Resultado |
| --- | --- | --- | --- | --- | --- |
| 1 | a marcar | `DDP-524` | preview e prod | a definir no card | |

## O que este plano não cobre

- Wiki além da troca de visão (`RT-H07`): o trabalho de wiki está em backlog (`DEC-0039`), e o editor sobre o DokMD ainda não foi entregue.
- Tenancy e convites: sem entrega, ADR 013 não escrito.
- Desempenho e carga: nenhuma medição de tempo entra aqui. O atraso ao conectar é medido pela ordem `DDP-515`, item 8.
- Automação: o plano é manual. Quando os casos estabilizarem, os de tela viram roteiro Playwright numa ordem própria, num card de backlog.
