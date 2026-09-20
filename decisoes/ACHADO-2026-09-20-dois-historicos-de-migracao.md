# Achado: o app ficou com dois históricos de migração

**Data:** 2026-09-20
**Origem:** execução da sub-fatia S1a, primeira migração de banco do projeto (`DDP-98`)
**Alcance:** ADR 003 inteiro, e qualquer fatia futura que toque schema

## O fato

A migração foi aplicada e funciona. Conferido no banco real, por consulta ao catálogo do Postgres: o schema `content` existe, a tabela `content.workspace_members` existe com a chave primária composta, e o trigger `workspaces_seed_owner` existe. O teste do trigger passou, com uma linha `role = 'owner'` semeada automaticamente.

**O arquivo da migração não foi parar onde a ordem mandava.** A ordem pedia `supabase/migrations/<carimbo>_<uuid>.sql`, no formato dos seis arquivos que já estavam lá. O que existe é `drizzle/migrations/0000_create_content_workspace_members.sql`.

O agente do Lovable declarou o desvio e a causa: a plataforma bloqueia escrita direta em `supabase/migrations/`, e a ferramenta oficial de migração dela grava em outro lugar.

## O que o commit trouxe junto

| Arquivo | O que é |
| :--- | :--- |
| `drizzle/migrations/0000_create_content_workspace_members.sql` | O SQL da ordem, byte a byte |
| `drizzle/migrations/meta/_journal.json` | Journal com **uma** entrada |
| `drizzle/migrations/meta/0000_snapshot.json` | Snapshot do estado |
| `drizzle.config.ts` | Configuração, lendo `LOVABLE_DB_MIGRATION_URL` |
| `drizzle/schema.ts` | Uma linha: "auto-generated and intentionally left blank, do not edit" |
| `package.json` e `bun.lock` | `drizzle-kit ^0.31.10` e `drizzle-orm ^0.45.2`, mais 181 linhas de lock |

## Os três problemas, em ordem de gravidade

### 1. O histórico do schema está partido em dois

`supabase/migrations/` tem seis arquivos, que são a história do Diagram Studio: `public.workspaces`, `public.projects`, `model_elements`, `relationships`, `views`, `view_nodes`, `invites`, `user_roles`.

`drizzle/migrations/meta/_journal.json` tem **uma** entrada, a de agora. Ele não conhece nenhuma das seis.

Consequência: **nenhum dos dois históricos reconstrói o banco sozinho.** Provisionar um ambiente novo a partir do journal do drizzle dá só `content.workspace_members`, sem as tabelas que o app usa hoje. A partir de `supabase/migrations/` dá o Diagram Studio sem o schema `content`.

Isso não quebra nada agora, porque o banco em uso está correto. Quebra quando alguém precisar de um ambiente novo, que é exatamente quando ninguém quer descobrir um problema desses.

### 2. Duas dependências entraram sem a aprovação que `DEC-0007` exige

`DEC-0007` lista dependência nova como categoria `app-release`, que exige o sim do humano antes. `drizzle-kit` e `drizzle-orm` entraram no `package.json` durante a execução, sem passar por essa porta.

A ordem não as pediu e não as proibiu: a restrição "nenhum pacote novo" estava nas ordens das fatias de código e não foi repetida na de migração, porque ninguém previu que aplicar SQL instalaria biblioteca.

A responsabilidade não é de quem executou. A ferramenta de migração da plataforma se instala sozinha no primeiro uso, e o agente usou a ferramenta que a plataforma manda usar.

### 3. O drizzle não está sendo usado como ORM, e mesmo assim entrou inteiro

`drizzle/schema.ts` diz, na única linha que tem, que é gerado automaticamente e fica em branco de propósito. Ou seja: o drizzle está ali só como executor de migração, sem nenhum modelo declarado.

O ADR 003 decidiu Postgres puro, com SQL escrito à mão e server functions. Nada nele pede ORM. O risco não é o de hoje, é o de alguém, daqui a três meses, encontrar `drizzle-orm` instalado e concluir que o projeto adota ORM.

## O que isto invalida

O ADR 003 pressupõe, sem dizer com essas palavras, que migração é arquivo em `supabase/migrations/`. A seção 6.2 chama o DDL de "proposta de migração" e o restante do ADR trata o schema como algo versionado junto com o código.

A premissa não é mais verdadeira, e as cinco sub-fatias restantes da S1, mais toda a S2 (RLS, políticas para onze tabelas), passariam pelo mesmo caminho, aprofundando a divisão a cada uma.

## O que não fazer

**Não reverter a migração aplicada.** Ela está correta, verificada no banco, e desfazê-la custaria outra migração sem ganho nenhum.

**Não escrever à mão em `supabase/migrations/`** para "consertar" o local do arquivo. Isso produziria um arquivo que nenhuma ferramenta aplicou, e que o journal do drizzle desconhece: três históricos em vez de dois.

## A decisão que falta, e de quem é

Qual dos dois é o histórico canônico do schema, e o que acontece com o outro. É decisão de arquitetura com consequência de operação, e depende de uma informação que só o dono do produto tem: se existe ou vai existir ambiente de banco fora do Lovable.

Três saídas possíveis, todas com custo:

| Saída | O que custa |
| :--- | :--- |
| Drizzle passa a ser o canônico, e as seis migrações antigas são importadas para o journal dele | Trabalho de importação, e o risco de o snapshot não bater com o banco real |
| `supabase/migrations/` continua canônico, e cada migração aplicada pelo drizzle é copiada para lá | Duplicação manual em toda fatia de schema, que é exatamente o tipo de passo que se esquece |
| Aceitar os dois, com a regra de que o journal do drizzle vale a partir de 2026-09-20 e o anterior está em `supabase/migrations/` | Nada agora, e um ambiente novo exige aplicar os dois na ordem certa, documentado em algum lugar que alguém precisa lembrar de ler |

A sequência da S1 fica parada em S1a até isso ser decidido. Escrever a S1b agora produziria mais uma migração no mecanismo que talvez não seja o certo.
