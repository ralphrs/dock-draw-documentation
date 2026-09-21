# Ficha ADR 015, pergunta 5: o que o banco guarda de um diagrama

Ficha de pesquisa da sessão B, 2026-09-21, para a pergunta 5 do `RASCUNHO-PROMPT-ADR-015.md`: documento por diagrama gravado inteiro com espera por inatividade, ou as três tabelas normalizadas de hoje (`model_elements`, `view_nodes`, `relationships`).

## O que foi lido e conferido

Lidos por inteiro, como material de primeira mão do projeto:

- `adrs/_work/RASCUNHO-PROMPT-ADR-015.md`
- `adrs/_work/ANALISE-latencia-ao-soltar-elemento.md`
- `decisoes/DEC-0019-diagrama-versiona-e-o-vinculo-e-sempre-o-ultimo.md`
- `decisoes/DEC-0021-a-aba-e-quadro-livre-e-o-c4-vira-shape.md`
- `adrs/LEDGER.md`, seção ADR 001 (o arquivo `ADR-001-motor-de-diagrama.md` ainda não existe em `adrs/`, só a entrada do ledger)
- `adrs/ADR-003-armazenamento-e-versionamento.md`, seção de `page_revisions` e `expectedVersion`
- `adrs/ADR-006-shell-da-wiki.md`, seção de autosave e dos dois erros de conflito
- `insumos/supabase-types-dokdraw.ts` e `dok-draw-app/src/integrations/supabase/types.ts`. Os dois arquivos foram comparados por `diff` nas definições de `model_elements`, `view_nodes`, `relationships` e `views` e não divergem. O schema descrito abaixo vem do arquivo do app, fonte de verdade por regra do `CLAUDE.md` do projeto.

Lido como material de terceiro, não conferido por padrão: `adrs/_work/REFERENCIA-drawio-persistencia.md`. As alegações dele usadas nesta ficha foram checadas contra o repositório `jgraph/drawio` (branch `dev`, commit `744cb5420fdf126efd7a09b1d7082ca3e12c0841`, clonado em 2026-09-21) e ficam marcadas abaixo:

| Alegação da referência | Situação |
| :--- | :--- |
| Existe uma rotina chamada `scheduleAutosave`, disparada por inatividade, segundo `autosaveDelay` | Parcialmente correta e com nome errado. A função real é `DrawioFile.prototype.autosave(delay, maxDelay, success, error)`, chamada por `fileChanged` como `this.autosave(this.autosaveDelay, this.maxAutosaveDelay, ...)`. `autosaveDelay = 1500` e `maxAutosaveDelay = 30000` são constantes do protótipo. [`DrawioFile.js#L78`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DrawioFile.js#L78), [`#L84`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DrawioFile.js#L84), [`#L2924`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DrawioFile.js#L2924). A função cancela o temporizador anterior a cada mudança (`clearAutosave`), agenda `window.setTimeout` com o atraso de 1500 ms, e zera esse atraso para disparo imediato quando a mudança pendente já passou de 30000 ms sem gravar. É debounce com teto forçado, não inatividade pura |
| Mesclagem por id de célula "sai quase de graça" num modelo de documento | Não sustentada. `EditorUi.prototype.diffCells` compara duas árvores de `mxCell` por id via `createCellLookup` e produz patches `DIFF_INSERT`/`DIFF_UPDATE`/`DIFF_REMOVE` [`DiffSync.js#L1084`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DiffSync.js#L1084). Isso roda sobre uma cópia paralela do documento (`getShadowPages`, [`DrawioFile.js#L186`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DrawioFile.js#L186)), um checksum de página que invalida a mesclagem quando não fecha (`mergeFile`, `checksumError`, [`DrawioFile.js#L390`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DrawioFile.js#L390), [`#L615`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DrawioFile.js#L615)), e um aplicador de patch dedicado (`patchPages`, [`DiffSync.js#L122`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DiffSync.js#L122)). `DiffSync.js` tem mais de mil linhas. Comparar por id é o ponto de partida da mesclagem estrutural, não o custo inteiro dela |
| Concorrência na nuvem por `ETag` | Confirmada. `DriveFile.prototype.getDescriptorEtag`/`setDescriptorEtag` leem e gravam `desc.etag` [`DriveFile.js#L51`](https://github.com/jgraph/drawio/blob/744cb5420fdf126efd7a09b1d7082ca3e12c0841/src/main/webapp/js/diagramly/DriveFile.js#L51) |
| Formato gravado é um snapshot XML (`mxfile` > `diagram` > `mxGraphModel` > `mxCell`), serializado por `mxUtils.getXml` sobre o modelo | Consistente com o uso de `mxUtils.getXml` em `Editor.js` e com a documentação oficial do formato em [drawio-app/docs](https://www.drawio.com/doc/faq/xml). Não pesa como achado novo, é estrutura pública e documentada |

Não confirmado, e não usado para sustentar a recomendação desta ficha: o teste de conflito em duas camadas (tamanho em bytes, depois checksum) para arquivo local e desktop, o protocolo exato de mensagens do modo embutido (`init` contra `ready`, a própria referência já registra essa divergência como não resolvida), a codificação do XML em `zTXt`/`tEXt` de PNG, a flag `compressXml`, o limiar de mil células para Web Worker, e a troca de `mxGraph` por `maxGraph`. Nenhum desses temas decide a pergunta 5.

> [!WARNING]
> Lacuna: o modo embutido do draw.io (`iframe`, `postMessage`) é uma arquitetura de editor inteira, substituindo o React Flow do ADR 001 em vez de informar o formato gravado dele. Fica fora desta ficha, que responde só à pergunta 5. Dono: quem escrever o corpo do ADR 015, se o tema voltar à mesa.

## Os dois modelos

### Documento por diagrama

Uma tabela nova, com uma linha por versão do diagrama, id estável entre versões (o mesmo id que `DEC-0019` exige), conteúdo do diagrama numa coluna só, e gravação imutável e append-only garantida por trigger, no mesmo molde de `content.page_revisions` do ADR 003. O conteúdo interno pode ser a serialização direta do estado que o React Flow já mantém em memória hoje, `{nodes, edges}` com posição por nó, sem introduzir geometria por forma. `DEC-0021` já registra essa opção como "bem mais barata" que geometria por forma e observa que "nada no pedido exige" a segunda.

O fluxo de gravação edita em memória no cliente, sem esperar rede, e agenda uma gravação por inatividade com teto forçado, no molde já aceito pelo ADR 006 para `saveDraft` (2 s de inatividade, envio forçado a cada 30 s) e corroborado pelo mesmo desenho medido no `autosave` do draw.io (1500 ms, teto de 30000 ms). Cada gravação é uma ida ao banco, um `insert` na tabela de versões com `expectedVersion` recebido do cliente, no molde de `saveDraft`.

A versão mais recente é resolvida dinamicamente na leitura, do mesmo jeito que `page_refs.target_rev_id` fica sempre nulo e a página resolve a revisão publicada em tempo de leitura.

### Três tabelas normalizadas de hoje

`model_elements` (id, `project_id`, `parent_id`, `type`, `name`, `technology`, `tags`, `style`, `color`, `description`), `view_nodes` (id, `view_id`, `element_id`, `x`, `y`, `width`, `height`, `z_index`) e `relationships` (id, `project_id`, `source_id`, `target_id`, `label`, `style_props`, `waypoints`, `technology`), conferidas linha a linha em `dok-draw-app/src/integrations/supabase/types.ts`. Nenhuma das três tem coluna de versão. A entrada do ADR 001 no ledger descreve o conjunto como "mutáveis, sem histórico de revisão".

O fluxo de gravação de hoje é o medido em `ANALISE-latencia-ao-soltar-elemento.md`: cada gesto de criação é `insert` em `model_elements`, leitura de `z_index` em `view_nodes` e `insert` em `view_nodes`, três idas sequenciais ao PostgREST, sem transação entre a segunda e a terceira. O mesmo arquivo mostra que mover um nó existente (`moveNodes`/`commitNodes`) já pinta antes de gravar e grava 400 ms depois, fora do caminho crítico. O defeito medido não é o schema normalizado, é a ausência de `onMutate` no caminho de criação.

## Peso de cada critério

**Atraso de interação.** A `ANALISE` atribui o atraso percebido a um defeito pontual de código, `setModel` só em `onSuccess`, não ao schema normalizado. `moveNodes` prova, no mesmo arquivo, que o modelo normalizado já pinta na hora e grava depois. Os dois modelos aceitam pintura otimista. O peso real deste critério é de amplificação de escrita, não de percepção: o documento por diagrama troca três idas sequenciais ao servidor por gesto (com o crescimento em O(n) da consulta de `z_index` e o risco de órfão entre as etapas 4 e 6, os dois descritos na `ANALISE`) por uma gravação por ciclo de inatividade. Pesa moderadamente a favor do documento, e não sozinho: o item 2 da `ANALISE` (uma função de servidor, uma transação, dois inserts) resolve a mesma amplificação dentro do modelo normalizado, sem trocar de schema.

**Conflito entre duas abas ou dispositivos.** O documento por diagrama herda `expectedVersion` e o par de erros já aceito pelo ADR 003 e pelo ADR 006: conflito detectado, recarregamento não bloqueante, sem mesclagem automática. É o mesmo desenho de `DraftVersionConflictError`, já em produção para o texto da wiki. O modelo normalizado, hoje, não tem nenhuma coluna de versão em nenhuma das três tabelas, então não detecta conflito nenhum: duas abas editando o mesmo diagrama intercalam `insert`/`update` em linhas que o estado em memória de nenhuma das duas reflete, sem sinal para ninguém. Construir detecção no modelo normalizado exigiria versão e reconciliação cruzando quatro tabelas ligadas por chave estrangeira (incluindo `views`), não uma coluna em uma tabela. Pesa fortemente a favor do documento, usando um mecanismo já aceito no projeto, não um novo. A mesclagem estrutural automática do draw.io (comparação por id de célula sobre cópia paralela e checksum, `DiffSync.js`) é a alternativa mais cara dentro do próprio modelo de documento, e fica fora do escopo desta decisão.

**Custo de versionamento, `DEC-0019`.** O documento por diagrama tem histórico ao custo de uma linha por versão, imutável por trigger, no mesmo molde de `page_revisions`, inclusive reaproveitando a ideia de um índice de hash para pular gravação sem mudança real. O modelo normalizado precisaria versionar quatro tabelas mutáveis e ligadas por chave estrangeira (`views`, `model_elements`, `view_nodes`, `relationships`) mantendo consistência referencial em cada ponto do tempo. A própria `DEC-0019` classifica essa tarefa como "trabalho de ADR, não de migração". Pesa decisivamente a favor do documento. É o critério que decide, não o atraso.

## Recomendação

Documento por diagrama, uma linha por versão, id estável entre versões conforme `DEC-0019`, gravado por debounce de inatividade com teto forçado no molde de `saveDraft` (ADR 006, 2 s / 30 s). O conteúdo interno é a serialização do estado `{nodes, edges}` que o React Flow já mantém, sem introduzir geometria por forma. A concorrência usa `expectedVersion` e o par de erros bloqueante/não bloqueante do ADR 003, não mesclagem estrutural automática.

`type`, `tags`, `technology` de cada elemento e as ligações fonte/destino de cada relacionamento deixam de ser colunas SQL diretas e passam a alimentar uma tabela derivada, reconstruída a cada gravação do documento, no mesmo papel que `page_refs` já cumpre para o texto a partir de `collectRefs`. Essa tabela não é versionada, é cache de leitura sobre a versão mais recente, e sustenta a fatia de busca (ADR 009) e o filtro por nível C4 que `DEC-0021` já restringiu a diagramas do conjunto C4 (`DF3`).

A identidade de um elemento entre diagramas diferentes deixa de existir por decisão anterior, não por esta ficha: `DEC-0021` já estabeleceu que "uma caixa é uma caixa naquela aba".

## Alternativa descartada

Manter as três tabelas normalizadas e versionar cada uma no lugar, com coluna de versão e histórico em `model_elements`, `view_nodes` e `relationships`, reconciliando referências entre as três a cada ponto do tempo. Descartada porque nenhuma das três tem hoje coluna de versão, e a própria `DEC-0019` já nomeia essa tarefa como trabalho de ADR, não de migração, para as quatro tabelas envolvidas (incluindo `views`). O ganho que essa alternativa preservaria, colunas SQL nativas sem tabela derivada, não paga o custo de reconstruir concorrência e histórico do zero cruzando quatro tabelas com chave estrangeira, em vez de uma linha imutável por versão.

## Custo aceito da recomendação

Janela de perda de trabalho limitada ao teto de 30 s do debounce, o mesmo custo que o ADR 006 já aceita para o texto da wiki.

Amplificação de escrita por gravar o documento inteiro a cada versão, o mesmo custo que o ADR 003 já aceita para `page_revisions`, mitigável por um índice de hash de conteúdo para pular gravação sem mudança real.

Uma tabela derivada precisa ficar sincronizada com o documento para servir busca e filtro, e pode ficar temporariamente desatualizada entre a gravação de uma versão e a reconstrução do índice, o mesmo risco que `page_refs` já corre hoje em relação ao texto.

> [!WARNING]
> Lacuna: o tamanho real de um documento de diagrama não foi medido. Os três projetos em produção não foram medidos, e `DEC-0021` já registra essa lacuna. A escolha entre coluna JSONB e objeto em armazenamento externo fica em aberto para o corpo do ADR 015 decidir, não para esta ficha.

> [!WARNING]
> Lacuna: esta ficha responde só à pergunta 5. Como o histórico do documento fica navegável pela interface é a pergunta 6. O que acontece com os três diagramas hoje no modelo estruturado é a pergunta 7, e a recomendação acima implica uma conversão de mão única para eles, sem desenhá-la aqui.
