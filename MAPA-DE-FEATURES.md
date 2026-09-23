# Mapa de features do DokDraw

**Data do retrato:** 2026-09-22, 22:40
**Fontes:** código do app `dok-draw-app` na `main` (merge `775304c`), quadro Jira `DDP` (549 issues) e as decisões em `decisoes/`. Quando o quadro e o código divergem, vale o código.
**Mantido por:** sessão A. Atualizar a cada deploy (`app-release`) e a cada épico fechado.

Este arquivo lista o que o app faz hoje, o que está em construção, o que está decidido e ainda não tem ordem, e o que é só ideia. Cada grupo termina com sugestões de features derivadas do que já existe, para triagem do dono do produto. Sugestão não é compromisso: só vira trabalho depois de virar issue no `DDP`.

## Legenda de estado

| Estado | Significado |
| --- | --- |
| **Produção** | Publicado pelo último `deploy_project` (DDP-440, 2026-09-22). O que a pessoa usa hoje |
| **Preview** | Na `main` e no preview do Lovable, ainda sem deploy. Deploy pendente em DDP-517 |
| **Em execução** | Ordem no Lovable ou emenda aprovada, código ainda não pousou |
| **Aguardando humano** | Ordem escrita e revisada, esperando o sim do dono do produto |
| **Ordem escrita** | Ordem pronta ou em revisão, sem aprovação de despacho ainda |
| **Design pronto** | Prancha aprovada no Figma, sem ordem ao Lovable |
| **Design em andamento** | Sessão D trabalhando |
| **Decidido** | ADR ou decisão aceita, nenhuma fatia começou |
| **Backlog** | Issue aberta, sem ordem nem design |
| **Ideia** | Registrada como pesquisa ou roadmap, sem decisão |

## Resumo por estado

| Estado | Grupos onde aparece |
| --- | --- |
| Produção | Conta e acesso, projetos, lista de diagramas, editor (canvas, C4, conexões, painel, atalhos, imagens), exportação, cabeçalho e rodapé, temas, wiki em memória |
| Preview | Configuração do projeto, miniaturas da paleta, setas fase 0, painel Detalhes revisto, membros do projeto (badge), pontos de conexão e âncoras |
| Em execução | Emenda 1 da DDP-515 (aguarda humano), formas básicas (DDP-522, aguarda a fila) |
| Aguardando humano | DDP-535 (desfazer), DDP-536 (subpasta), DDP-549 (ícones AWS), DDP-542 (testes manuais), DDP-517 (deploy) |
| Ordem escrita | DDP-529 (moldura e contêineres AWS), DDP-528 (bucket, suspensa) |
| Design pronto | 11 formas C4, conexões, moldura e contêineres AWS, wireflow, margens |
| Design em andamento | Contêineres Google Cloud |
| Design não iniciado (só épico escopado) | Moldura e contêineres Azure, moldura Google Cloud, moldura e contêineres OCI, logotipos de tecnologia, 13 formas básicas restantes |
| Decidido | Wiki: formato (ADR 002), armazenamento (ADR 003), fluxo editorial (ADR 004), edição (ADR 005), shell (ADR 006). Notações do Diagram Studio (DEC-0011, depois da meta) |
| Backlog | 76 issues de app e feature em A FAZER, listadas por grupo abaixo |
| Ideia | Playground com IA, plugins Claude Code e Obsidian, modelos pré-definidos, estilo rascunho, importação de projeto `.md` |

---

## 1. Conta, acesso e tenancy

| Feature | Estado | Referência |
| --- | --- | --- |
| Login com Google pelo Lovable Cloud, sessão gravada no Supabase | Produção | `src/routes/index.tsx` |
| Porteiro por lista de convidados: e-mail fora de `invites` cai em "Você ainda não foi convidado" | Produção | `src/application/access.functions.ts` |
| Primeira pessoa que entra vira administradora | Produção | `access.functions.ts` |
| Convite aceito no primeiro login, perfil criado com nome e avatar do Google | Produção | `access.functions.ts` |
| Página `/convidados` (só admin): convidar por e-mail, remover, badge Ativo ou Pendente | Produção | `src/routes/_authenticated/convidados.tsx` |
| Barra lateral com Projetos, Convidados, tema, papel e Sair | Produção | `src/components/app-shell.tsx` |
| Token nas server functions com RLS por usuário | Produção | `src/integrations/supabase/auth-middleware.ts` |
| Projeto visível só para quem o criou (`owner_id`) | Produção, lacuna | `c4-repository.ts` |
| Membros do projeto: tela mostra "Você · Dono" e badge "Convites por projeto em breve" | Preview | DDP-519 |
| Workspace único "Meu espaço" criado no primeiro projeto | Produção | `projects.functions.ts` |
| Tenant, espaços, membro por espaço, administração em dois níveis | Ideia, estudo pedido | DDP-494, DDP-495, DDP-496, ADR 013 |
| Dono do workspace ausente em `workspace_members`, RLS da S2 vai trancar | Backlog, bloqueia a wiki | DDP-115 |

Sugestões:

- **Convite com papel e projeto.** Hoje o convite só abre a porta do app. Convidar para um projeto específico, com papel leitor ou editor, resolve a lacuna de `owner_id` sem esperar o ADR 013 inteiro. Depende da tabela de membros que a DDP-519 prometeu.
- **Link de convite em vez de e-mail cadastrado.** Um link com validade e limite de usos, para times que não sabem o e-mail Google de cada pessoa.
- **Papel "somente leitura" para o editor de diagrama.** Visitante vê o diagrama sem mover nada, útil para o compartilhamento de link que já existe no card.
- **Auditoria mínima.** Quem convidou quem e quando, visível na página de convidados.

## 2. Projetos e configurações

| Feature | Estado | Referência |
| --- | --- | --- |
| Lista de projetos em cards, ordenada por Atualizado, Nome ou Criado, escolha lembrada por pessoa | Produção | DDP-441 |
| Criar projeto com nome e descrição, nasce com a visão "Contexto do sistema" | Produção | `projects.functions.ts` |
| Menu do card: Configurações, Copiar link, Excluir | Preview | DDP-442 |
| Página de configuração com grupos Projeto, Wiki, Diagramas, Pessoas e Zona de perigo | Preview | DDP-442, deploy em DDP-517 |
| Geral: editar nome e descrição, tipo, datas, excluir | Preview | DDP-442 |
| Diagramas: famílias de formas ligadas e nível inicial do diagrama novo, gravados no navegador | Produção | `configuracoes.diagramas.tsx` |
| Wiki: placeholder com selects desabilitados | Produção, lacuna | `configuracoes.wiki.tsx` |
| Cabeçalho e rodapé do projeto | Produção | ver grupo 10 |
| Abas Wiki e Diagramas no cabeçalho de todas as telas | Produção | `abas-projeto.tsx` |
| Ordem manual dos projetos com Fixar no topo | Backlog | DDP-545 |
| Projeto novo nasce com a wiki cheia de exemplo, propor wiki e diagramas vazios | Backlog | DDP-497 |

Sugestões:

- **Preferências de projeto no banco.** Famílias ligadas e nível inicial vivem em `localStorage`, então mudam de máquina para máquina e não valem para outra pessoa do mesmo projeto. Mover para uma coluna `settings` em `projects`.
- **Duplicar projeto.** Copiar modelo, visões, pastas e cabeçalho, para servir de modelo de novos projetos. Base natural para o épico de modelos (DDP-502).
- **Arquivar em vez de excluir.** A exclusão hoje é definitiva e em cascata. Um estado arquivado com restauração em 30 dias evita perda por clique errado.
- **Capa e ícone do projeto.** O card só tem nome e descrição. Uma cor ou ícone escolhido ajuda a achar o projeto na lista.
- **Busca na lista de projetos.** Vale a partir de uma dezena de projetos.

## 3. Lista de diagramas e pastas

| Feature | Estado | Referência |
| --- | --- | --- |
| Árvore de pastas e diagramas com criação otimista | Produção | DDP-311 |
| Criar pasta ou diagrama na raiz ou dentro de uma pasta, já com o nome em edição | Produção | DDP-311 |
| Renomear por duplo clique, F2 ou menu. Nome repetido de pasta recusado pelo banco | Produção | DDP-311, DDP-421 |
| Mover por arrastar e soltar, inclusive para a raiz | Produção | DDP-311 |
| Apagar com contagem do que vai em cascata | Produção | DDP-311 |
| Seleção múltipla com Ctrl e Shift, barra com Apagar | Produção | `arvore-navegacao.tsx` |
| Expandir e recolher tudo, copiar link do diagrama | Produção | `diagramas.index.tsx` |
| Subpasta recém-criada não renomeia até recarregar (RT-F05) | Aguardando humano | DDP-536, aprovação em DDP-544 |
| `view_folders.updated_at` não muda ao renomear | Backlog | DDP-539 |

Sugestões:

- **Diálogo "Mover para…" também na árvore de diagramas.** O componente já existe para a wiki e está desligado aqui (`permitirMover={false}`). Arrastar em árvore longa é difícil.
- **Duplicar diagrama.** Copiar a visão com nós e conexões para experimentar uma variante sem estragar a original.
- **Miniatura do diagrama na árvore ou na página de índice.** O SVG de exportação já existe, dá para gerar a miniatura sob demanda.
- **Ordenação manual dentro da pasta.** Hoje a ordem vem do banco. Arrastar para reordenar irmãos, como a DDP-545 pede para projetos.
- **Contagem de elementos e data de alteração ao lado do nome.** Ajuda a escolher entre visões parecidas.

## 4. Editor de diagrama: canvas e navegação

| Feature | Estado | Referência |
| --- | --- | --- |
| Canvas React Flow com grade de pontos, snap de 10 px, zoom de 0,25 a 2,5, minimapa | Produção | `diagram-canvas.tsx` |
| Pan pelo botão do meio, scroll ou Espaço mais arrasto | Produção | DDP-298 |
| Zoom por teclado e ajustar à tela | Produção | DDP-298 |
| Mostrar ou ocultar grade | Produção | `diagramas.$viewId.tsx` |
| Menus de contexto próprios do quadro, do nó e da conexão, com submenus e atalhos | Produção | `editor-menu.tsx` |
| Redimensionar nó com mínimo 60×40 | Preview | DDP-516 |
| Painéis laterais recolhíveis, fechados por padrão abaixo de 1024 px | Produção | `diagramas.$viewId.tsx` |
| Visões dentro do editor: trocar, criar, excluir | Produção | `diagramas.$viewId.tsx` |
| Navegação entre níveis C4: abrir a visão de contêiner ou componente a partir do elemento | Produção | `catalog.ts` |
| Duplo clique no nó abre a janela de propriedades | Produção | DDP-427 |
| Salvamento de posição com debounce de 400 ms | Produção | `diagramas.$viewId.tsx` |
| Painel de atalhos, buscar no diagrama, agrupar e desagrupar | Backlog | DDP-299 |
| Rota curva ignora o raio 28 e desenha com raio 10 | Backlog | DDP-444 |
| Lateral pinável e árvore de espaços e projetos na lateral | Design, backlog | DDP-493, DDP-495 |
| Abas no Diagram Studio: navegação sobre o modelo ou quadro branco livre | Decidido | DDP-149 |

Sugestões:

- **Tela de atalhos por Shift+?.** A ordem DDP-516 citou um menu que não existe, e os atalhos já são muitos (zoom, ordem, travar, alinhar). Uma tela gerada da mesma tabela que alimenta os menus de contexto evita divergência.
- **Buscar no diagrama.** Campo que filtra nós por nome ou tecnologia e centraliza o primeiro achado. Já pedido na DDP-299.
- **Trilha de navegação entre níveis.** Ao abrir a visão de contêiner de um sistema, mostrar "Contexto › Sistema X › Contêineres" com clique para subir. Hoje só o botão voltar.
- **Miniaturas no minimapa com cor do tipo.** O minimapa é monocromático. Cor por tipo C4 ajuda em diagramas grandes.
- **Réguas e guias inteligentes.** Linhas de alinhamento ao arrastar, como o draw.io faz. Complementa alinhar e distribuir.
- **Modo apresentação.** Esconde painéis e cabeçalho, deixa só o quadro, com atalho para sair.

## 5. Editor: formas e catálogo

| Feature | Estado | Referência |
| --- | --- | --- |
| Painel Elementos com Favoritas, Usadas por último, busca e chips de família | Produção | DDP-422 |
| Criar elemento por arrasto ou duplo clique na paleta | Produção | `palette-item.tsx` |
| Favoritar forma por pessoa | Produção | DDP-422 |
| Janela Mais formas com categorias, miniaturas e famílias "em breve" | Produção | DDP-422 |
| Miniaturas da paleta em escala real | Preview | DDP-445 |
| Formas filtradas pelo nível da visão | Produção | `catalog.ts` |
| 16 tipos C4 em 10 formas SVG no padrão draw.io | Produção | `element-shape.tsx` |
| Rótulos com nome, tipo, tecnologia e descrição, com truncamento | Produção | DDP-370, DDP-432 |
| Grupo (limite) como fundo tracejado, sem aninhamento automático | Produção, lacuna | `c4-repository.ts` |
| Trocar o tipo do elemento pela janela de propriedades | Produção | `janela-propriedades.tsx` |
| Família Básicas: elipse, losango, triângulo e texto solto | Ordem escrita, aguarda a fila | DDP-513, DDP-522 |
| Triângulo com alças no contorno e rótulo em 2h/3 | Backlog | DDP-437 |
| Família Básicas restante: paralelogramo, documento, nuvem, nota, retângulos, cilindro genérico, ator, seta direcional, raia | Backlog, nenhuma das 13 issues tem comentário de D | DDP-251 a DDP-349 |
| Moldura de serviço e contêineres AWS com ícones oficiais | Ordem escrita, mecanismo em decisão | DDP-529, DDP-549 |
| Moldura e contêineres Azure | Backlog, épico só escopado | DDP-358, DDP-362 |
| Contêineres Google Cloud | Design em andamento, devolvido com correção (rótulo e legenda) | DDP-457, DDP-458 |
| Moldura Google Cloud, contêineres OCI e moldura OCI | Backlog, épico só escopado (fonte do pacote OCI registrada) | DDP-375, DDP-380, DDP-459, DDP-460 |
| Logotipos de tecnologia (DEC-0030) | Backlog, épico só escopado | DDP-388 |
| Ícones Lucide como forma | Backlog, épico | DDP-487 |
| UML moderno, BPMN 2.0, linha do tempo | Backlog, épicos de design | DDP-473, DDP-479, DDP-468 |
| Diagrama de referência por nuvem | Backlog | DDP-463 |
| Estilo rascunho (mão livre) | Ideia, estudo pedido | DDP-484, DDP-485 |
| Modelos pré-definidos de diagrama | Ideia, estudo pedido | DDP-502, DDP-503 |
| ADR 015, registro de notação e política de ícone | Decidido, depois da meta da wiki | DEC-0011, DDP-78 |

Sugestões:

- **Grupo que contém de verdade.** Elemento solto dentro de um limite passa a ser filho (`parentId` do React Flow): mover o grupo move o conteúdo, e o `.drawio` sai com `parent` certo. É pré-requisito dos contêineres AWS aninhados.
- **Catálogo vivo entre visões.** `placeElement` e `unplaceNode` existem no servidor e a interface não os usa. "Adicionar elemento existente" na paleta e "Remover só desta visão" no menu entregam o que a landing promete.
- **Elemento com link para página da wiki ou URL.** Campo na aba Geral, clicável no modo leitura e exportado como `link` no `.drawio`.
- **Forma personalizada por SVG colado.** A infraestrutura de imagem já existe. Aceitar SVG sanitizado como forma reutilizável cobre o que nenhuma família oficial cobre.
- **Biblioteca de formas do projeto.** Elementos favoritos com estilo aplicado, gravados por projeto, para repetir o mesmo "Serviço X" em várias visões.
- **Tecnologia com sugestão.** O campo tecnologia é texto livre. Autocomplete a partir dos valores já usados no projeto evita "Postgres" e "PostgreSQL" no mesmo diagrama.

## 6. Editor: conexões

| Feature | Estado | Referência |
| --- | --- | --- |
| Conectar por arrasto entre alças | Produção | DDP-295 |
| Modo Relação por dois cliques, cancelável com Esc | Produção | DDP-403 |
| Setas de hover: conectar ao vizinho mais próximo ou clonar e conectar | Produção | DDP-306 |
| Três traços (síncrono, assíncrono, tracejado), três roteamentos (reto, ortogonal, curvo) | Produção | DDP-453 |
| Cinco pontas em início e fim, tamanho conforme espessura | Preview | DDP-453 |
| Pontos de quebra por duplo clique, arrasto e limpeza | Produção | DDP-453 |
| Rótulo editável na linha, fundo opcional | Produção | DDP-453 |
| Inverter direção com pontas e âncoras | Preview | DDP-453 |
| Dezesseis pontos de conexão por forma, âncora gravada, reconexão pela ponta, setas de hover grandes, sem o X | Preview, com emenda pendente | DDP-515, DDP-547, DDP-551 |
| Pegador de reconexão visível em toda conexão (a corrigir) e medição de atraso sem número | Em execução, aguarda humano | DDP-515 emenda 1 |
| Conexão selecionada junto com nós, Delete apaga tudo num passo | Preview | DDP-516 |
| Exportação `.drawio` perde os pontos de quebra (RT-E13) | Backlog | DDP-538 |
| Cor da linha por input nativo, sem os tokens da paleta | Backlog | DDP-539 |

Sugestões:

- **Rótulo em posição escolhida.** Arrastar o rótulo ao longo da linha (parâmetro 0 a 1) e gravar em `styleProps`. Diagramas densos precisam disso.
- **Conexão com múltiplos rótulos.** Tecnologia ou protocolo como segunda linha, já que a janela de propriedades tem o campo mas a linha não mostra.
- **Estilo de conexão padrão do projeto.** Escolher uma vez traço, roteamento e ponta, e toda conexão nova nasce assim.
- **Conexão entre grupo e elemento.** Hoje grupo é nó comum. Vale conferir se conectar um limite faz sentido no C4 e, se não, bloquear com mensagem.
- **Roteamento ortogonal com desvio de nós.** O ortogonal atual respeita lados, mas atravessa formas no caminho. Um roteador com obstáculos é a próxima régua.
- **Evidência de fluxo.** Animação de tracejado na conexão assíncrona, só no canvas, nunca na exportação.

## 7. Editor: painel Detalhes e janela de propriedades

| Feature | Estado | Referência |
| --- | --- | --- |
| Painel com modos Diagrama, Elemento, Conexão e Seleção (n) | Preview | DDP-516 e emenda |
| Aba Estilo: preenchimento, borda, cantos, opacidade, swatches das paletas, restaurar padrão | Produção | DDP-432 |
| Aba Texto: tamanho, negrito, itálico, sublinhado, cor, alinhamentos, mostrar tipo e descrição | Produção | DDP-432 |
| Aba Ordenar: camadas, posição e tamanho, duplicar, abrir nível | Produção | DDP-432 |
| Copiar e colar estilo, restaurar visão | Produção | DDP-432 |
| Cor da borda igual à do painel, seleção como anel por fora | Preview | DDP-516 |
| Painel da conexão: inverter, rótulo, traço, roteamento, pontas, cor, espessura, opacidade, texto | Produção | DDP-453 |
| Padding das abas da conexão e cabeçalho, contador na seleção | Preview | DDP-516 emenda 1 |
| Janela de propriedades: Geral, C4, Ligações, Imagem | Produção | DDP-427 |
| Botão "Excluir conexão" sem a moldura que "Excluir elemento" tem | Backlog | DDP-539 |
| Botões Copiar estilo, Excluir e Restaurar visão se sobrepõem no rodapé do painel | Backlog | DDP-539 |

Sugestões:

- **Edição em lote.** Com "SELEÇÃO (n)", aplicar cor, borda ou tamanho de texto em todos os selecionados de uma vez. O painel já mostra o primeiro elemento, falta propagar.
- **Estilos nomeados.** Salvar a combinação atual como "Legado", "Novo", "Externo" e aplicar por clique. É a versão persistente do copiar e colar estilo.
- **Painel compacto ou flutuante.** Em 1024 px o painel fecha. Uma barra flutuante com as ações mais usadas (cor, alinhar, ordem) perto do elemento cobre telas pequenas.
- **Descrição em Markdown limitado.** Negrito e lista na descrição do elemento, renderizados no quadro e na exportação.
- **Campos personalizados por projeto.** Dono, custo, ambiente, como pares chave e valor gravados no elemento e exportados como propriedades no `.drawio`.

## 8. Editor: seleção, histórico e atalhos

| Feature | Estado | Referência |
| --- | --- | --- |
| Seleção múltipla por laço, Shift, Ctrl e Ctrl+A | Produção | DDP-301 |
| Mover por teclado, 1 px ou 10 px com Shift | Produção | DDP-301 |
| Alinhar (6 modos) e distribuir (2 eixos) | Produção | DDP-324 |
| Travar e destravar, Alt para clonar ao arrastar | Produção | DDP-324 |
| Copiar, recortar, colar, duplicar, com deslocamento | Produção | DDP-301 |
| Ordem de empilhamento por atalho, menu e painel | Produção | DDP-432 |
| Desfazer e refazer para toda ação de edição, pilha em memória por visão | Produção | DDP-304 |
| Grade de 10 px | Preview | DDP-516 |
| Desfazer para depois de restaurar uma exclusão, canvas em branco ao desfazer colagem (RT-C07) | Aguardando humano | DDP-535, aprovação em DDP-546 |
| Ctrl+Z leva 5 s para restaurar 4 formas e 2 conexões | Backlog | DDP-539 |
| Desfazer não cobre ordem z, restaurar visão nem criar e excluir visão | Produção, lacuna | `diagramas.$viewId.tsx` |
| Shift+clique, laço com conexão e tela em 390 px sem conferência automática | Aguardando humano | DDP-542 |

Sugestões:

- **Histórico persistente por visão.** A pilha some ao trocar de visão ou recarregar. Gravar as últimas N entradas no navegador (IndexedDB) mantém o desfazer depois de um F5.
- **Restauração em lote no servidor.** Uma server function `restoreSelection` que recria elementos, nós e relações numa transação resolve os 5 s da DDP-539 e o id trocado da DDP-535 de uma vez.
- **Agrupar e desagrupar.** Já no backlog (DDP-299). Seleção vira um grupo que move junto, sem virar um limite C4.
- **Selecionar por tipo.** "Selecionar todos os contêineres" no menu do quadro, para aplicar estilo em lote.
- **Espelhar e rotacionar.** Só para as formas básicas e setas, quando entrarem.
- **Área de transferência entre diagramas e abas.** Hoje é estado React. Serializar em JSON no clipboard do sistema permite copiar de um projeto para outro.

## 9. Editor: imagens

| Feature | Estado | Referência |
| --- | --- | --- |
| Colar imagem do sistema ou arrastar arquivo para o quadro | Produção | DDP-308 |
| PNG, JPEG e WebP até 5 MB, bucket privado com URL assinada | Produção | DDP-308 |
| Estados "Enviando imagem…" e "Imagem indisponível" | Produção | `image-node.tsx` |
| Substituir imagem na janela de propriedades | Produção | DDP-308 |
| Trava de extensão na política de envio | Produção | DDP-419 |
| Lista de tipos do bucket não gravada, risco aceito | Decidido | DEC-0031 |
| Excluir o elemento não apaga o arquivo do bucket | Produção, lacuna | `diagramas.$viewId.tsx` |

Sugestões:

- **Limpeza de órfãos.** Job ou server function que apaga do bucket arquivos sem elemento, com relatório do espaço liberado.
- **Recorte e proporção.** Manter proporção ao redimensionar, recortar dentro da janela de propriedades.
- **Imagem como preenchimento de forma.** Logotipo dentro de um retângulo com borda, em vez de elemento solto.
- **Cota de armazenamento por projeto.** Mostrar o total usado nas configurações, com aviso antes de bater um limite.
- **Colar SVG como forma vetorial.** Depois de sanitizar, guardar o SVG como texto em vez de imagem, para exportar limpo.

## 10. Exportação, cabeçalho e rodapé

| Feature | Estado | Referência |
| --- | --- | --- |
| Diálogo Baixar com PNG, SVG e `.drawio`, prévia e escolha lembrada | Produção | DDP-407 |
| SVG independente com cores resolvidas e imagens embutidas | Produção | `export-diagram.tsx` |
| PNG em alta resolução, teto de 4000 px | Produção | `export-diagram.tsx` |
| `.drawio` com formas C4 nativas, âncoras, pontas, waypoints e imagens | Produção, waypoints em preview | DDP-453, DDP-515 |
| Cabeçalho e rodapé por projeto: três zonas, texto e imagem, fonte, tamanho, cor, fundo, altura, linha | Produção | DDP-395, DDP-397, DDP-399 |
| Remover texto ou imagem do cabeçalho e rodapé | Preview | DDP-446 |
| Prévia ao vivo do cabeçalho com o primeiro diagrama | Produção | `cabecalho-rodape.tsx` |
| Arquivo exportado leva o nome do projeto, não do diagrama | Backlog | DDP-539 |
| Prévia usa o primeiro diagrama mesmo vazio (RT-G01) | Backlog | DDP-537 |
| Cor padrão do texto do cabeçalho some no tema escuro | Backlog | DDP-539 |
| Atribuição da AWS na exportação | Ordem escrita | DDP-529 item 10 |
| Export para `.md`, vault Obsidian, projeto Starlight e `.docx` | Decidido, ADR 010 não escrito | DDP-42 |

Sugestões:

- **Exportar PDF.** O SVG já é independente. PDF com o cabeçalho e rodapé é o formato que vai para o e-mail.
- **Exportar o projeto inteiro.** Um zip com todas as visões em SVG mais um `.drawio` com uma página por visão. O `.drawio` de várias páginas é suportado pelo formato.
- **Link público de visualização.** URL somente leitura de uma visão, com token revogável, sem exigir login. Depende do papel leitor do grupo 1.
- **Marca d'água e numeração.** Variáveis no cabeçalho como `{projeto}`, `{visao}`, `{data}` e `{pagina}`, substituídas na exportação.
- **Importar `.drawio`.** O mapeamento de saída já existe. O inverso, para as formas C4 conhecidas, traz diagramas antigos para o app.
- **Copiar como imagem.** Ctrl+C com nada selecionado copia o PNG da visão para a área de transferência.

## 11. Temas e esquemas de cores

| Feature | Estado | Referência |
| --- | --- | --- |
| Tema claro, escuro e sistema, sem piscar na carga | Produção | `theme.tsx` |
| Quatro esquemas de cores: DokDraw, Íris, NTConsult, C4 Padrão | Produção | DDP-354 |
| Cores por tipo via tokens, cor gravada no elemento é exceção | Produção | `catalog.ts` |
| Esquema Íris sem seletor próprio em `styles.css`, cai nos tokens base | Produção, lacuna | `styles.css` |
| Paleta das formas básicas com contraste 2,19:1 no escuro | Design, backlog | DDP-492 |

Sugestões:

- **Esquema de cores por projeto, gravado no banco.** Hoje é por navegador. O projeto de um cliente sempre abre com a paleta dele.
- **Esquema personalizado.** Editor com os nove tokens de tipo, prévia ao vivo e exportação como JSON para reaproveitar.
- **Exportação com tema escolhido.** Exportar em claro mesmo com a tela em escuro, sem trocar o tema da tela.
- **Modo alto contraste.** Um esquema que garante 4,5:1 em todo par texto e fundo, também para a paleta das básicas.

## 12. Wiki

| Feature | Estado | Referência |
| --- | --- | --- |
| Formato DokMD v1: CommonMark, GFM, frontmatter, diretivas de bloco, códigos DOK-E e DOK-W | Produção (biblioteca) | ADR 002, DDP-67 a DDP-92 |
| Pipeline de save: normaliza, valida, bloqueia em DOK-E | Produção (server function sem chamada de tela) | DDP-92 |
| Árvore de páginas com pastas, mover, apagar, filtro por estado | Produção, em memória | `projetos.$projectId.wiki.tsx` |
| Leitura com renderizador provisório (callouts, tabelas, listas, código) | Produção, em memória | `render-provisorio.tsx` |
| Editor com três visões: Preview, Código, Código com preview | Produção, em memória | DDP-143 |
| Editor visual MDXEditor 4.2.5 por DokAST, diretivas editáveis, link interno com autocomplete | Produção, em memória | ADR 005, DDP-148 |
| Diagnósticos ao vivo e bloqueio da visão Preview em erro | Produção, em memória | `preview-suporte.ts` |
| Sete estados editoriais como badge, sem UI para mudar | Produção, lacuna | `badge-status.tsx` |
| Diretivas `tabs`, `steps` e `diagram` sem renderização | Produção, lacuna | `render-provisorio.tsx` |
| Schema `content.*`: spaces, pages, revisions, drafts, status, effective_role | Preview, banco aplicado, sem tela | DDP-140, DDP-98 a DDP-153 |
| Fatias restantes do armazenamento: S1 a S7 | Decidido | DDP-17 a DDP-23 |
| Fluxo editorial E1 a E6: máquina de estados, aprovação, comentários, notificações | Decidido | DDP-24 a DDP-29 |
| Edição F1 a F8: adaptador, registry, colar, listas, RevisionView, notas de rodapé | Decidido | DDP-30 a DDP-37 |
| Shell G1 a G3: rotas, autosave, fila de revisão | Decidido | DDP-70 a DDP-72 |
| Migração do legado e importadores GFM, Obsidian, Starlight | Backlog | DDP-15, DDP-16 |
| Renderização, navegação, busca, exportação, publicação, Developer Portal, consolidação | Decidido, ADRs a escrever | DDP-39 a DDP-45 |
| Importar um projeto `.md` ou `.mdx` inteiro | Ideia, estudo pedido | DDP-490 |
| `public.projects` precisa de `space_id`, reabre o ADR 001 | Backlog, bloqueia a wiki | DDP-114 |

Sugestões:

- **Diretiva `diagram` renderizando a visão de verdade.** É a costura entre os dois produtos: a página mostra o SVG da visão citada, com `rev` fixo ou vivo, e o clique abre o editor. O ADR 004 E6 já prevê a resolução de `rev`.
- **Inserir diretiva pela barra do editor.** `insertDirective` existe e nenhuma UI chama. Um menu "Inserir" com note, tip, tabs, steps e diagram fecha a lacuna sem fatia nova.
- **Autosave visível.** O ADR 006 decide debounce de 2 s. Mostrar "Salvo às 10:32" e "Conflito: outra pessoa editou" no cabeçalho da página.
- **Página a partir de diagrama.** Botão no editor de diagrama que cria uma página com a diretiva `diagram` e uma tabela dos elementos, nome, tipo, tecnologia e descrição, gerada do modelo.
- **Backlinks no rodapé da página.** O ADR 002 decide `page_refs`. Listar quem aponta para esta página é o primeiro uso visível.
- **Modelo de página por pasta.** ADR, runbook e postmortem como esqueleto DokMD escolhido ao criar.
- **Comentário inline na leitura.** Antes do fluxo E4 completo, um comentário por bloco já ajuda a revisar.

## 13. Notações e famílias: do Figma ao app

Estado do design no Figma por família, e o que já virou código.

| Família | Design | No app |
| --- | --- | --- |
| C4: pessoa, caixa, hexágono, navegador, cilindro, tubo, terminal, balde, pasta, fronteira | Pronto (DDP-178 a DDP-223) | Produção |
| Conexões | Pronto (DDP-228) | Produção, fase 0 em preview |
| Básicas: elipse, losango, triângulo, texto solto | Pronto | Ordem DDP-522 na fila |
| Básicas: nuvem, retângulos, cilindro e contêiner genéricos, ator, seta direcional, raia | Pronto | Sem ordem |
| Básicas: paralelogramo, documento, nota | Não começado (DDP-266, DDP-271, DDP-281) | Sem ordem |
| AWS: moldura de serviço e seis contêineres | Pronto (DDP-233, DDP-238) | Ordem DDP-529, mecanismo dos ícones em DDP-549 |
| Azure: moldura e contêineres | Pronto (DDP-358, DDP-362) | Sem ordem |
| Google Cloud: moldura | Pronto (DDP-375) | Sem ordem |
| Google Cloud: contêineres | Em andamento (DDP-455) | Sem ordem |
| OCI: moldura | Pronto (DDP-380) | Sem ordem |
| OCI: contêineres | Em andamento (DDP-459) | Sem ordem |
| Logotipos de tecnologia | Pronto (DDP-388), fonte oficial em DEC-0030 | Sem ordem |
| Diagrama de referência por nuvem | Não começado (DDP-463) | Sem ordem |
| Linha do tempo, UML moderno, BPMN 2.0 | Não começado (DDP-468, DDP-473, DDP-479) | Sem ordem |
| Ícones Lucide, estilo rascunho, modelos pré-definidos | Não começado | Sem ordem, estudos pedidos |
| Fundação visual, margens, wireflow, paleta em grade | Pronto (DDP-158, DDP-314, DDP-318), DDP-507 aberto | Parcial |
| Tela inicial comercial e Developer Portal | Em andamento (DDP-404, DDP-504, DDP-505) | Sem ordem |

Sugestões:

- **Uma ordem por família, no molde da DDP-513.** O gargalo é escrever e revisar ordem, não desenhar. Azure e Google Cloud têm design pronto e podem seguir o mesmo caminho da AWS assim que a DDP-549 fixar o mecanismo dos ícones.
- **Manifesto de família como contrato.** O JSON de categorias e serviços da AWS vale para as outras nuvens. Um esquema único evita quatro leitores de manifesto.
- **Paleta em grade com nome abaixo (DEC-0037) antes das famílias de ícone.** Com 122 ícones AWS, a lista atual da paleta não cabe.
- **Validador de notação por família.** O ADR 015 vai definir o que uma notação é. Um validador que avisa "BPMN: gateway sem saída" é a feature que diferencia de um quadro branco.
- **Diagrama de referência como modelo.** Os quatro diagramas de referência (DDP-463) já são modelos pré-definidos (DDP-502). Uma feature, não duas.

## 14. Integrações, plataforma e produto

| Feature | Estado | Referência |
| --- | --- | --- |
| Landing com carrossel de diagramas e slides "em breve" | Produção | `diagram-carousel.tsx` |
| Selo Edit with Lovable desligado | Produção | DDP-300 |
| Página 404, boundary de erro, erro 500 com captura | Produção | `__root.tsx`, `server.ts` |
| Sessão compartilhada com o preview do Lovable | Produção | `previewAuthStorage.ts` |
| Tela inicial comercial | Design em andamento | DDP-404, DDP-504 |
| Developer Portal: esta documentação como feature viva no app | Decidido, ADR 014 não escrito | DEC-0006, DDP-44, DDP-505 |
| Plugin Claude Code para diagramar e documentar | Ideia, estudo pedido | DDP-498, DDP-499 |
| Plugin Obsidian com sincronização | Ideia, estudo pedido | DDP-500, DDP-501 |
| Sync de mão única para nuvem, Google Drive primeiro | Decidido, ADR 010 | `ESTADO.md` |
| Diagram Playground: simulação de diagramas com crítica por IA | Ideia, futuro distante | DDP-326 |
| Auth de cron gerado, sem rota que o use | Produção, código morto | `cron-auth.ts` |

Sugestões:

- **API pública mínima antes dos plugins.** Ler o modelo e as visões de um projeto por token, em JSON, é o que o plugin Claude Code e o plugin Obsidian precisam dos dois lados. Uma API, dois consumidores.
- **Webhook por evento.** Página publicada, diagrama alterado. Alimenta Slack e CI sem plugin.
- **Importação de C4 em texto (Structurizr DSL ou Mermaid C4).** Muita gente já tem o modelo em texto. Importar cria elementos e relações, e o layout vem do alinhar e distribuir.
- **Changelog no app.** O Developer Portal pode começar como uma página "O que mudou" gerada dos `app-release`.
- **Modo demonstração sem login.** Um projeto de exemplo somente leitura na landing, com o carrossel atual virando editor real.

## 15. Qualidade e regressão

| Feature | Estado | Referência |
| --- | --- | --- |
| Plano de teste regressivo com 85 casos, rodada 1 registrada | Produção (documento) | `guia-sessoes/TESTE-REGRESSIVO.md`, DDP-524 |
| Seção A por código: typecheck, build, Vitest 20/20, greps | Rodado | DDP-534 |
| Defeitos da rodada 1 | DDP-535 a DDP-539 | ver grupos 3, 6, 8, 10 |
| Casos manuais fora do alcance da extensão | Aguardando humano | DDP-542 |
| Dívidas do formato: suíte não valida input cru, endpoint sem limite de tamanho, server function sem teste | Backlog | DDP-68, DDP-91, DDP-104 |
| Histórico de schema em dois lugares (Drizzle e Supabase) | Backlog | DDP-102, DDP-108 |

Sugestões:

- **Teste de ponta a ponta com Playwright no preview.** A extensão do Chrome não segura Shift nem estreita a janela. Um runner Playwright cobre RT-C02, RT-C16 e RT-H09 sem mão humana.
- **Teste de contrato do `.drawio`.** Exportar um diagrama fixo e comparar com um arquivo de referência, para pegar regressões como a DDP-538.
- **Orçamento de desempenho no editor.** Medir o tempo de desfazer, colar e conectar em um diagrama de 200 nós e falhar acima de um teto, como a Emenda 1 do ADR 002 fez com o parser.
- **Um único histórico de migração.** Fechar a DDP-102 antes de a wiki gravar no banco.
