# Registro de decisões

Índice cronológico das decisões que não são contrato de camada. Uma linha por decisão, da mais recente para a mais antiga.

## O que entra aqui, e o que não entra

| Onde | O que |
| --- | --- |
| `adrs/LEDGER.md` | Contrato de arquitetura. Fonte de verdade, não duplicada aqui |
| `adrs/ADR-NNN-*.md` | Decisão de camada, com alternativa descartada e custo aceito |
| `decisoes/DEC-NNNN-*.md` | Decisão que não é de camada: numeração, sequenciamento, meta de trilha, processo, regra do kit |
| `decisoes/sprints/SPRINT-NN.md` | Objetivo, tarefas, resultado e pedido de merge de cada sprint da trilha de desenvolvimento |
| `tasks/done/A-Q-*.md`, `A-QD-*.md` | Decisão técnica pontual em resposta a dúvida. Entra no índice abaixo quando sobrevive à tarefa |

A pasta é escrita pela sessão A. As sessões B e C registram as decisões delas no "Resultado" da própria tarefa, e A promove para cá o que precisa durar.

## Índice

| Id | Data | Decisão | Quem decidiu |
| --- | --- | --- | --- |
| [DEC-0031](DEC-0031-risco-aceito-tipos-do-bucket.md) | 2026-09-22 | O bucket de imagens fica sem lista de tipos, por falta de caminho no Lovable. Trava fica na política de envio e no app. Risco aceito pelo humano | Humano |
| [DEC-0030](DEC-0030-icones-oficiais-das-nuvens.md) | 2026-09-21 | Ícones oficiais de AWS, Azure, Google Cloud e OCI no produto, e depois todas as marcas, sem alteração, com aviso de marca. Risco aceito pelo humano | Humano |
| [DEC-0029](DEC-0029-c4-so-o-que-a-documentacao-define.md) | 2026-09-21 | A família C4 usa só o que c4model.com define. Inventário do catálogo atual contra a documentação antes de nova forma C4 | Humano |
| [DEC-0028](DEC-0028-design-system-central-no-figma.md) | 2026-09-21 | Um design-system central no Figma, na raiz de dok draw app. Proposta nasce em draft e é consolidada depois da aprovação. Emendas de 2026-09-22: done como arquivo do aprovado, pastas com identificador, `design-system-latest` | Humano |
| [DEC-0027](DEC-0027-formas-basicas-e-icones-de-tecnologia.md) | 2026-09-21 | Depois de C4 e AWS: formas e setas básicas, depois ícones de tecnologia (CNCF, linguagens, infraestrutura) | Humano |
| [DEC-0026](DEC-0026-os-24-tipos-de-diagrama.md) | 2026-09-21 | O Diagram Studio cobre os 24 tipos de diagrama da lista do humano. Inventário de formas pela sessão B antes dos épicos da sessão D | Humano |
| [DEC-0025](DEC-0025-esquema-de-cores-dos-diagramas.md) | 2026-09-21 | Padrão de cor dos diagramas: cor principal do app nos internos, cinza nos externos. Esquema C4 Padrão em cinza e azuis como opção | Humano |
| [DEC-0024](DEC-0024-sessao-d-designer-de-formas.md) | 2026-09-21 | Sessão D desenha as formas do Diagram Studio no Figma, uma tarefa por forma. Fila pelo rótulo sessao-d | Humano |
| [DEC-0023](DEC-0023-icone-aws-oficial-na-moldura-do-dokdraw.md) | 2026-09-21 | Ícone AWS oficial e intacto como selo, dentro de uma forma que segue o padrão do DokDraw. Risco residual de uso em SaaS aceito | Humano |
| [DEC-0022](DEC-0022-pasta-de-diagrama-e-tabela-propria.md) | 2026-09-20 | Pasta de diagrama é tabela própria, pasta de página é a mesma linha com outro rótulo. A assimetria tem razão escrita | Arquiteto, por delegação |
| [DEC-0021](DEC-0021-a-aba-e-quadro-livre-e-o-c4-vira-shape.md) | 2026-09-20 | A aba do Diagram Studio é quadro livre e o C4 vira conjunto de shapes. Validação vira plugin. Reabre o ADR 001 no centro | Humano |
| [DEC-0020](DEC-0020-escopo-das-duas-arvores.md) | 2026-09-20 | 59 operações de árvore escolhidas, agrupadas por dependência em vez da ordem do pedido. Nove esperam ADRs não escritos | Humano |
| [DEC-0019](DEC-0019-diagrama-versiona-e-o-vinculo-e-sempre-o-ultimo.md) | 2026-09-20 | Diagrama versiona no mesmo id, a página vincula o id e renderiza sempre o último. `target_rev_id` fica nulo por decisão | Humano |
| [DEC-0018](DEC-0018-a-arvore-e-a-forma-do-projeto.md) | 2026-09-20 | A wiki é a tela inicial do projeto e o Diagram Studio vira árvore. Pasta nas duas, e as duas árvores continuam separadas | Humano |
| [DEC-0017](DEC-0017-a-wiki-vive-dentro-do-projeto.md) | 2026-09-20 | A wiki entra pelo projeto, não pelo espaço. Reabre o ADR 006 nas rotas e promove a `DDP-114` | Humano |
| [DEC-0016](DEC-0016-trilha-de-processo-e-trabalho-ocioso.md) | 2026-09-20 | Melhoria de processo vira trilha própria sob `DDP-55`, com o rótulo `processo`, sem responsável, e só roda com a fila vazia. Dez itens, todos de defeito medido. A prioridade em tempo ocioso sai executável do `aguarda-fila.sh`, em vez de ficar em prosa | Arquiteto, por delegação. Revisão aberta ao humano em `DDP-133` |
| [DEC-0015](DEC-0015-caminho-ate-a-primeira-tela.md) | 2026-09-20 | A sprint reordena para entregar tela antes, sem cortar escopo. `page_refs`, `assets`, `sync_state` e `position_between` saem do caminho crítico e voltam depois | Arquiteto, por delegação |
| [DEC-0014](DEC-0014-hierarquia-de-quatro-niveis-e-prontidao-de-tenant.md) | 2026-09-20 | Hierarquia de quatro níveis: `pages` ganha `project_id` nulo sem FK, unicidade `nulls not distinct` escopada ao projeto, e `workspace_id` em toda tabela de tenant. Controle de tenant não entra agora | Humano |
| [DEC-0013](DEC-0013-dois-historicos-de-migracao.md) | 2026-09-20 | Os dois históricos de migração ficam, com a fronteira em 2026-09-20. `drizzle-kit` e `drizzle-orm` aceitos retroativamente, sem uso de ORM | Humano |
| [ACHADO: dois históricos de migração](ACHADO-2026-09-20-dois-historicos-de-migracao.md) | 2026-09-20 | A plataforma bloqueia escrita em `supabase/migrations/` e usa journal próprio. Nenhum dos dois históricos reconstrói o banco sozinho. Decisão em `DDP-102` | Arquiteto |
| [DEC-0012](DEC-0012-recorte-da-fatia-f4.md) | 2026-09-20 | A fatia F4 entrega o pipeline de save e não a gravação, porque a tabela de destino é do ADR 003 e não existe. Descrição e critério da fatia discordavam entre si | Arquiteto, por delegação |
| [AUDITORIA: restrição × mecanismo](AUDITORIA-2026-09-20-restricao-x-mecanismo.md) | 2026-09-20 | As 37 restrições do ledger auditadas contra o comando que reprova cada uma. Quatro lacunas sobre código existente, 28 restrições sem verificação porque a camada não existe | Arquiteto, por delegação |
| [DEC-0011](DEC-0011-sequenciamento-do-diagram-studio.md) | 2026-09-20 | As doze notações do Diagram Studio entram por inteiro, depois que a meta de `DEC-0004` fechar. Nenhuma fatia da Wiki é adiada por elas | Humano |
| [ADR 006 aceito](../adrs/ADR-006-shell-da-wiki.md) | 2026-09-20 | Shell da Wiki: rotas sob `_authenticated`, autosave 2 s/30 s, os dois conflitos do ADR 003 por gravidade, separação `edit`/`read` por lint. Estende a lista de funções do 003 e do 004 com uma assinatura cada | Arquiteto, aprovado pelo humano (`DDP-66`) |
| [ACHADO: bateria de escopo aberto](ACHADO-2026-09-20-bateria-de-verificacao-de-escopo-aberto.md) | 2026-09-20 | Comando de projeto inteiro numa ordem de escopo recortado ou viola a restrição, ou trava o aceite. Toda bateria passa a rodar no escopo da ordem | Arquiteto, por delegação |
| [DEC-0010](DEC-0010-mandato-da-sessao-a.md) | 2026-09-20 | A sessão A abre ADR por iniciativa própria, pesquisa na web e refina pedido do humano. Ao humano sobem só as sete categorias | Humano |
| [ACHADO: shell da Wiki sem dono](ACHADO-2026-09-20-shell-da-wiki-sem-dono.md) | 2026-09-20 | A meta de `DEC-0004` pede seis ações de interface, e nenhuma das 16 fatias entrega tela. O ADR 006 recebe a camada (`DDP-47`) | Arquiteto, aprovado pelo humano |
| [ACHADO: contradição na Emenda 1](ACHADO-2026-09-20-contradicao-na-emenda-1.md) | 2026-09-20 | A emenda proibia builtin do Node em `src/content-format` e publicava uma interface que precisa ler o disco. Exceção de `testing/` aprovada em `DDP-56` | Arquiteto, aprovado pelo humano |
| [DEC-0009](DEC-0009-comunicacao-por-jira.md) | 2026-09-20 | As sessões se comunicam por issue do Jira, com uma conta só e identidade pelo responsável. `tasks/` deixa de ser o canal | Humano |
| [DEC-0008](DEC-0008-adr-006-vago.md) | 2026-09-19 | O ADR 006 fica vago em vez de receber camada inventada, e o prompt antigo dele é descartado | Arquiteto, por delegação |
| [DEC-0007](DEC-0007-lovable-como-implementador.md) | 2026-09-19 | O Lovable implementa e não decide, a sessão C vira revisora de arquitetura, e o gate de publicação passa do merge para o `deploy_project` | Humano |
| [DEC-0006](DEC-0006-quatro-decisoes-delegadas.md) | 2026-09-19 | Status dos ADRs 002 a 004 corrigido, o app manda sobre o BASE em tema e formatador, portal em DokMD no git e com o número 014 | Arquiteto, por delegação |
| [ACHADOS](ACHADOS-2026-09-19-adrs-x-app.md) | 2026-09-19 | Levantamento dos ADRs contra o código real. A Wiki não existe no app, e nenhuma das 27 dependências dos ADRs 002 e 005 está instalada | Arquiteto |
| [DEC-0005](DEC-0005-numero-do-adr-de-tenancy.md) | 2026-09-19 | Tenancy e acesso recebe o número 013. Dá dono aos conflitos C-3 e C-7 | Humano |
| [DEC-0004](DEC-0004-meta-da-trilha-de-desenvolvimento.md) | 2026-09-19 | Meta da trilha C: editar e publicar uma página da Wiki no app, ponta a ponta | Humano |
| [DEC-0003](DEC-0003-aspas-no-watcher.md) | 2026-09-19 | O comando de escuta passa os padrões entre aspas simples, porque o shell é zsh | Arquiteto |
| [DEC-0002](DEC-0002-registro-de-decisoes.md) | 2026-09-19 | Decisão que não é contrato de camada vive em `decisoes/`, fora do ledger e fora de `adrs/_work/` | Humano |
| [DEC-0001](DEC-0001-skills-por-sessao.md) | 2026-09-19 | Skills do plugin superpowers são obrigatórias por gatilho nomeado, mapeadas por sessão, com três proibições na sessão C | Humano |
| [DEC-0032](DEC-0032-vinculo-diagrama-wiki-como-drawio.md) | 2026-09-22 | Vínculo página-diagrama no modelo do draw.io no Confluence e exportação com sidecar `.dokdraw.yaml` | Humano |
| [DEC-0033](DEC-0033-familias-de-diagrama-por-referencia-visual.md) | 2026-09-22 | Famílias de diagrama fixadas por referência visual: contêineres GCP e OCI, referência por nuvem, linha do tempo, UML moderno, BPMN 2.0, estilo rascunho, ícones Lucide | Humano |
| [DEC-0034](DEC-0034-importar-e-exportar-projeto-de-wiki.md) | 2026-09-22 | Importar e exportar projeto de wiki em .md e .mdx pelas configurações do projeto e pelo menu de três pontos | Humano |
| [DEC-0035](DEC-0035-lateral-espacos-e-administracao.md) | 2026-09-22 | Lateral pinável, espaços e projetos na lateral, administração da plataforma e do tenant, direção para o ADR 013 | Humano |
| [DEC-0036](DEC-0036-roadmap-plugins-e-modelos.md) | 2026-09-22 | Roadmap: plugin do Claude Code, plugin do Obsidian e modelos pré-definidos de diagrama, com estudos da sessão B | Humano |
| [DEC-0037](DEC-0037-nome-abaixo-de-toda-forma.md) | 2026-09-22 | Toda forma leva o nome oficial escrito abaixo dela, no Design System, nas pranchas e na paleta do app | Humano |
| [DEC-0038](DEC-0038-ordem-de-trabalho-da-direita-para-a-esquerda.md) | 2026-09-22 | Ordem de trabalho de toda sessão: da direita para a esquerda no quadro, EM REVISÃO, AGUARDANDO APROVAÇÃO, BLOQUEADA, EM ANDAMENTO, só então tarefa nova | Humano |
| [DEC-0039](DEC-0039-wiki-em-backlog-por-enquanto.md) | 2026-09-22 | Trabalho de wiki em backlog por enquanto: DDP-490, 491, 497, 500, 501 saem das filas | Humano |
| [DEC-0040](DEC-0040-rotulos-humano-e-backlog.md) | 2026-09-22 | Um só rótulo humano (aprovacao-humana e revisao-humana extintos) e backlog no lugar de roadmap | Humano |
| [DEC-0041](DEC-0041-tela-sem-referencia-interna.md) | 2026-09-22 | Texto de tela nunca cita tarefa, ADR, ordem ou sessão. Varredura antes de publicar | Humano |
| [DEC-0042](DEC-0042-coluna-fazer-deploy.md) | 2026-09-22 | Coluna FAZER DEPLOY para publicação e migração, o que o humano executa contra o ambiente | Humano |
| A-Q-0002 | 2026-09-19 | Aplicar o diff no ledger, aceitar os ADRs 002 a 005 e commitar a etapa do ADR 005 | Humano |
| A-Q-0001 | 2026-09-19 | Parada 4 do ADR 005: corrigir a fixture 05 no MDXEditor, com três travas, e criar o arquivo do ADR | Humano |
