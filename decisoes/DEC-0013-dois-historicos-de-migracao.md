# DEC-0013: o schema tem dois históricos, e a fronteira é 2026-09-20

**Data:** 2026-09-20
**Quem decidiu:** o dono do produto, em `DDP-102`
**Alcance:** todo trabalho de schema, do ADR 003 em diante

## A decisão

Os dois históricos de migração continuam existindo, com a fronteira escrita:

| Histórico | O que contém | Vale para |
| :--- | :--- | :--- |
| `supabase/migrations/` | Seis arquivos, o schema `public` inteiro: `workspaces`, `projects`, `model_elements`, `relationships`, `views`, `view_nodes`, `invites`, `user_roles`, `profiles` | Tudo anterior a 2026-09-20 |
| `drizzle/migrations/` | Journal próprio, começando em `0000_create_content_workspace_members` | Tudo a partir de 2026-09-20 |

**Reconstruir o banco do zero exige aplicar os dois, nessa ordem.** Nenhum dos dois sozinho produz o banco que o app usa.

## O que isso aceita, junto

`drizzle-kit` e `drizzle-orm` ficam no `package.json`, aceitos retroativamente. Entraram durante a execução da primeira migração, sem passar pela porta de `app-release` que `DEC-0007` exige para dependência nova, porque ninguém previu que aplicar SQL instalaria biblioteca.

**Com uma ressalva que precisa sobreviver a esta decisão:** `drizzle-orm` não é usado como ORM. O `drizzle/schema.ts` diz, na única linha que tem, que fica em branco de propósito. O ADR 003 continua sendo Postgres puro, com SQL escrito à mão e server functions. Nenhum modelo declarado, nenhuma query construída por biblioteca.

## Por quê

A pergunta que decidia era se existe, ou vai existir, ambiente de banco fora do Lovable. Sem ambiente externo, o histórico partido é incômodo e não é risco: a plataforma mantém o banco, e o journal dela basta para ela.

As duas alternativas custavam trabalho contra um risco que pode nunca se materializar. Importar as seis migrações antigas para o journal do drizzle (alternativa A) exigiria produzir um snapshot que bata com o banco real, sem ferramenta que o gere, porque o drizzle aqui não introspecciona schema. Copiar cada migração para `supabase/migrations/` à mão (alternativa B) dependeria de alguém lembrar de fazer isso em toda fatia de schema, e esse tipo de passo manual falha.

## O custo aceito, e ele tem nome

**A instrução de como reconstruir o banco vive neste repositório, e o banco vive no outro.** Quem provisionar um ambiente a partir do `dok-draw-app` não encontra nada que diga "aplique os dois históricos". O arquivo que ele vai olhar é `drizzle.config.ts`, que não menciona `supabase/migrations/`.

Isso é aceito porque hoje não existe ambiente externo. Deixa de ser aceitável no dia em que existir, e esse dia é o gatilho de revisão.

## Gatilhos de revisão

- Alguém precisar provisionar um banco do zero, por qualquer motivo: homologação, cópia local, mudança de plataforma.
- A plataforma do Lovable mudar de ferramenta de migração de novo, criando um terceiro histórico.
- `drizzle-orm` passar a ser usado como ORM de verdade, o que contraria o ADR 003 e exige reabri-lo.

## O que fica pendente desta decisão

Uma nota dentro do `dok-draw-app` dizendo que o histórico de schema está em dois lugares e em que ordem se aplicam. Sem ela, a decisão está registrada onde só quem já conhece o processo vai procurar. Issue própria, fora da meta de `DEC-0004`.
