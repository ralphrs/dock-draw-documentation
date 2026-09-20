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
| A-Q-0002 | 2026-09-19 | Aplicar o diff no ledger, aceitar os ADRs 002 a 005 e commitar a etapa do ADR 005 | Humano |
| A-Q-0001 | 2026-09-19 | Parada 4 do ADR 005: corrigir a fixture 05 no MDXEditor, com três travas, e criar o arquivo do ADR | Humano |
