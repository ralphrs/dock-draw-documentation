# DEC-0014: a hierarquia tem quatro níveis, e o tenant fica pronto sem ser controlado

**Data:** 2026-09-20
**Quem decidiu:** o dono do produto, em `DDP-110`, com o desenho pela sessão A por delegação explícita
**Alcance:** schema do ADR 003, telas do ADR 006, e o recorte das sub-fatias de S1

## O que foi pedido

Duas entradas, na mesma resposta.

A primeira fixa a hierarquia:

| Nível | O que é | Exemplo |
| :--- | :--- | :--- |
| Raiz | Tenant | consultoria xyz |
| 1 | Espaço do tenant | cliente A - gestão, cliente A - arquitetura |
| 2 | Projeto | projeto A, projeto B |
| 3 | Wiki e diagramas do projeto | páginas e views |

A segunda fixa que **tudo é único, como no Confluence**, e que ligar documento entre espaços e projetos é permitido, mas passa por painel administrativo de outro MVP.

A terceira entrada, logo depois: **controle de tenant não entra agora, e a estrutura precisa estar pronta**, porque escalar outros tenants pode significar separar instâncias de banco numa versão bem mais avançada.

## O que o schema fazia antes disto

Três níveis, não quatro. `content.spaces` e `public.projects` penduram as duas direto no workspace, como irmãs, e `content.pages` pendura no espaço. Nenhum caminho liga página a projeto.

## As decisões

### 1. `content.pages` ganha `project_id`, nulo, sem chave estrangeira

A coluna liga a página ao projeto do nível 2. Ela é nula quando a página pertence ao espaço e não a um projeto, que é o caso do espaço com documentação própria, como um espaço do Confluence tem.

**A ausência de FK não é exceção nova.** `public.projects` pertence ao ADR 001, e o ADR 003 já decidiu na seção 6.6 que `page_refs.target_id` não faz FK para lá, porque FK direta acoplaria um ADR ao schema de outro. `project_id` herda a mesma doutrina e o mesmo custo declarado, que é integridade por disciplina de aplicação em vez de constraint.

### 2. `public.projects` não ganha `space_id` agora

Para a hierarquia fechar, o projeto precisaria apontar para o espaço. Essa coluna vive numa tabela do ADR 001, com três linhas em produção, e acrescentá-la é reabrir aquele ADR.

O `CLAUDE.md` manda parar e avisar quando surgir necessidade de mudar outro ADR, e a wiki não depende disso para funcionar: a página já carrega `project_id` e o agrupamento por projeto é consulta de aplicação enquanto o vínculo formal não existir.

### 3. A unicidade é `nulls not distinct`, escopada ao projeto

```sql
UNIQUE NULLS NOT DISTINCT (space_id, project_id, parent_page_id, slug)
```

Duas colunas da constraint são nulas: `project_id` na página de espaço, `parent_page_id` na página de raiz. O Postgres trata nulo como distinto dentro de constraint única por padrão, então sem a cláusula a unicidade falharia justamente na página de raiz de projeto, que é o caso mais comum.

O escopo inclui `project_id` porque o pedido diz "wiki e diagramas para cada projeto": cada projeto tem a wiki dele, e dois projetos do mesmo espaço podem ter, cada um, a página de entrada com o mesmo slug.

### 4. Tenant: nenhum controle, e a chave em toda linha

Nada de painel, tabela ou fluxo de tenant entra agora.

Entra a propriedade que torna o split possível depois: **toda tabela de dado de tenant carrega `workspace_id`, sem depender de join.** Com ela, extrair ou mover um tenant é um predicado igual em toda tabela. Sem ela, é um grafo de joins que precisa ser percorrido na ordem certa.

Isso não é estratégia nova. O ADR 003 já a escolheu na linha 8 da tabela de decisões, "workspace_id denormalizado nas tabelas quentes". A decisão aqui é **aplicá-la por igual**, porque a medição mostrou que ela não foi.

| Tabela | Tem `workspace_id` | Tratamento |
| :--- | :---: | :--- |
| `workspace_members`, `spaces`, `pages`, `page_revisions`, `page_refs`, `assets`, `sync_state` | sim | nada a fazer |
| `revision_statuses` | não | catálogo de códigos, global de propósito. Correta assim |
| `space_members` | não | ganha a coluna na sub-fatia S1b |
| `revision_status_events`, `revision_current_status`, `page_drafts` | não | ganham a coluna nas ordens de S1c e S1d |

A chave primária de `space_members` continua `(space_id, user_id)`. `workspace_id` entrar nela abriria caminho para duas linhas do mesmo par.

## Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| `project_id` obrigatório em `pages` | Proibiria página de espaço e forçaria projeto inventado para documentação que não é de projeto |
| FK de `project_id` para `public.projects` | Acopla o ADR 003 ao schema do ADR 001, contra doutrina que aquele mesmo ADR já escreveu |
| Reabrir o ADR 001 agora para pôr `space_id` em `projects` | Atrasa a wiki, que é o que foi pedido com urgência, por um vínculo que a wiki não usa para funcionar |
| Unicidade escopada só ao espaço | Impediria dois projetos do mesmo espaço de terem, cada um, a página de entrada com o mesmo slug |
| Adiar `workspace_id` nas quatro tabelas | A coluna é grátis enquanto a tabela não existe, e cara depois, porque exige preencher linha a linha por join |

## Custo aceito

**A hierarquia fica pela metade no banco.** A página sabe de que projeto é, e o projeto não sabe de que espaço é. Enquanto o ADR 001 não for reaberto, ligar projeto a espaço é responsabilidade de aplicação, sem nada no schema que a garanta.

**`project_id` sem FK aceita projeto apagado deixando página órfã.** Mesmo custo que o ADR 003 já aceitou para `page_refs.target_id`, e a mitigação é a mesma: consulta antes de excluir, não constraint.

## Lacunas declaradas

**O workspace que já existe não tem dono em `content.workspace_members`.** Medido: a tabela tem zero linhas e `public.workspaces` tem uma. O trigger da S1a dispara em `INSERT`, e o workspace existente é anterior a ele. Quando a RLS da S2 entrar, `content.effective_role` devolverá nulo e o dono ficará trancado fora dos próprios dados. **Não bloqueia a S1b**, que não tem RLS nenhuma. O conserto é um `INSERT` de preenchimento, e pertence à ordem da S2.

**`content.sync_state.id` é `bigint generated always as identity`.** Identidade sequencial colide quando instâncias separadas são fundidas ou divididas, que é exatamente o cenário de escala que esta decisão prepara. A tabela é da sub-fatia S1e e a troca por uuid ainda não foi decidida.

**Usuário é global no Supabase.** Separar tenants por instância exige decidir como a identidade atravessa instâncias, e isso não é questão de schema. Pertence ao ADR 013, de tenancy.

## Gatilhos de revisão

- O ADR 001 ser reaberto por qualquer motivo, que é quando `projects.space_id` entra sem custo extra.
- O painel administrativo de ligação entre espaços sair do MVP futuro para o corrente.
- Um segundo tenant existir de verdade, que é quando a prontidão aqui descrita para de ser teórica.
