# Ordem S1a: schema `content` e `workspace_members`

**Blocos do recorte:** `S1-B0`

Primeira sub-fatia de S1 do ADR 003 (seção 6.2), recortada em `adrs/_work/RECORTE-S1-ADR-003.md`. Cria o schema `content`, a tabela `content.workspace_members` e o trigger que semeia o dono do workspace. Sem dependência de outra fatia do ADR 003 além de `public.workspaces`, que já existe no app.

## É a primeira fatia do projeto que toca banco

1. **Aplicar a migração é categoria `app-release`** (`DEC-0007`), exige aprovação do humano antes de rodar, separada da aprovação de crédito do envio ao Lovable.
2. **Desfazer não é `git revert`.** O arquivo de migração roda como uma transação: uma falha no meio desfaz tudo daquele arquivo sozinha, e reaplicar o mesmo arquivo só é seguro se a tentativa anterior falhou. Se já teve sucesso, `CREATE TABLE` sem `IF NOT EXISTS` falha de propósito na segunda vez, contra uma tabela que já existe.
3. **Formato conferido contra `supabase/migrations/*.sql` real:** nome `<carimbo de 14 dígitos>_<uuid>.sql`, gerado no momento da criação, SQL em maiúsculas (`CREATE TABLE`, `ALTER TABLE`, `RETURNS`, `LANGUAGE`). O rascunho do ADR 003 está em minúsculas, esta ordem converte.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "Todo workspace criado em `public.workspaces` ganha automaticamente uma linha 'owner' em `content.workspace_members` (trigger)" | `INSERT INTO public.workspaces` de teste, depois `SELECT` em `content.workspace_members` para o mesmo id: uma linha, `role = 'owner'` |

Esta sub-fatia não faz RLS (S2), não faz server function (S3), e não faz o pipeline de gravação passar por `validateDok` (restrição migrada para a S3 que expõe `src/content-store/server.ts`, `DEC-0012`). As duas restrições sobre `page_revisions` (imutabilidade, status como evento) entram na ordem de S1c, que cria essa tabela.

## 1. Criar a migração

Nome: `<carimbo do momento>_<uuid novo>.sql`, dentro de `supabase/migrations/`.

```sql
CREATE SCHEMA IF NOT EXISTS content;

-- Papel por workspace: public.user_roles é global, sem workspace_id,
-- e não serve para RLS por workspace (ADR 003, seção 6.2, bloco 0).
CREATE TABLE content.workspace_members (
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id),
  role         text NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Todo workspace nasce com o owner_id já como membro 'owner'; sem isso,
-- o próprio criador do workspace ficaria de fora de content.effective_role (S1f).
CREATE OR REPLACE FUNCTION content.seed_workspace_owner()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO content.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER workspaces_seed_owner
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION content.seed_workspace_owner();
```

Nenhum `GRANT` nesta migração: o ADR 003 não pede nenhum na seção 6.2, e o acesso é por server function com conexão direta, não por PostgREST (nota da seção 6.2).

## 2. Verificar por SQL direto

SQL puro, sem meta-comando de cliente: roda igual no SQL Editor do Supabase e no `psql`. Escolha antes um `user_id` real de `auth.users` já existente no projeto, e use o mesmo valor nos dois lugares abaixo. A transação termina em `ROLLBACK`: o teste não persiste nada, não sobra linha para limpar.

```sql
BEGIN;

-- 1. o trigger semeia o dono
INSERT INTO public.workspaces (name, owner_id) VALUES ('teste-s1a', '<user_id real>');

SELECT wm.role
  FROM content.workspace_members wm
  JOIN public.workspaces w ON w.id = wm.workspace_id
 WHERE w.name = 'teste-s1a' AND wm.user_id = '<mesmo user_id>';
-- esperado: uma linha, role = 'owner'

ROLLBACK;
```

## O que fazer se algo falhar

- A migração falha no meio: nada foi commitado (transação única). Ler o erro, corrigir o arquivo, rodar de novo o mesmo arquivo.
- `INSERT INTO public.workspaces` não gera linha em `workspace_members`: o trigger não disparou ou a função tem erro. Não contorne com `INSERT` manual na tabela para "fazer passar": pare e devolva o erro do Postgres.
- Qualquer erro de permissão (`GRANT`): pare e abra dúvida, porque isso pode indicar que o schema precisa de `GRANT USAGE`, não previsto no ADR 003, e essa é uma decisão que não cabe a quem executa.

## Restrições

- Só este SQL. Não crie `spaces`, `pages` nem qualquer tabela do bloco 1 em diante: são da S1b.
- Não aplique a migração sem aprovação humana explícita (`app-release`).
- Não escreva RLS, nem policy, nem server function.
- Nenhum contrato do ledger muda.
- Não toque `.env*`.
- Depois de aplicar a migração com sucesso, commite o arquivo em `supabase/migrations/` no mesmo commit ou logo em seguida: banco e histórico do repositório precisam ficar alinhados, nunca com a estrutura aplicada e o arquivo fora do repositório.
