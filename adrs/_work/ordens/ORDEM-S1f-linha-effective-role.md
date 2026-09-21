# Ordem S1f': `content.effective_role`

**Blocos do recorte:** `S1-B7`

Sub-fatia S1f' da `DEC-0015`: só o bloco 7 do recorte, `content.effective_role` (ADR 003, seção 6.2, linhas 393 a 405). O bloco 8, `content.position_between`, fica fora desta ordem: a `DEC-0015` tirou `effective_role` da posição original para ela chegar antes da RLS, e trazer o bloco 8 junto não serve a esse propósito. Depende de S1a (`content.workspace_members`) e S1b (`content.spaces`, `content.space_members`), ambas aplicadas.

## Como aplicar esta migração

A plataforma grava pela ferramenta própria, journal em `drizzle/migrations/` (`DEC-0013`). Não crie arquivo em `supabase/migrations/`.

1. **Aplicar é categoria `app-release`** (`DEC-0007`), exige aprovação do humano.
2. **Desfazer não é `git revert`.** Falha no meio desfaz tudo, transação única.
3. **`content.workspace_members`, `content.spaces` e `content.space_members` já existem, aplicadas.** Este DDL não as recria, só lê.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "`content.effective_role(space_id, user_id)`: ponto único de resolução de papel para RLS, override por `content.space_members`, senão `content.workspace_members`" (interface publicada) | A função consulta `space_members` primeiro. Se não achar linha para o par espaço e usuário, cai para `workspace_members` do espaço. `coalesce` implementa o override: a primeira subconsulta não nula vence |

## `security definer` e `search_path` fixo não são opcionais

A função lê `space_members` e `workspace_members`, tabelas que a RLS da S2 vai fechar. Rodando como o usuário chamador, a própria consulta de papel seria barrada pela política que depende dela: consulta que decide o acesso não pode estar sujeita ao acesso que ela decide. `security definer` resolve isso, executando com o papel de quem definiu a função.

`set search_path = public, content` fixo é parte da mesma proteção, não um detalhe de estilo. Função `security definer` sem `search_path` fixo aceita ser enganada: um chamador que planta um objeto de mesmo nome num schema anterior no caminho de busca padrão faz a função resolver contra o objeto errado. Fixar o caminho remove esse grau de liberdade.

## Hoje a função devolve nulo para todo mundo

Medido em 2026-09-20: `content.workspace_members` tem zero linhas, `content.space_members` tem zero linhas. O workspace existente é anterior ao trigger `workspaces_seed_owner` (`DDP-115`), então nunca ganhou a linha `owner`.

Esta ordem declara o fato e não conserta. Consertar é escrita em produção (um `INSERT` de preenchimento), tem cartão próprio e depende de decisão do humano sobre qual usuário é o dono. A consequência fica registrada: quando a RLS da S2 entrar sem esse conserto antes, toda política que depende de `effective_role` recusa, e o dono do workspace fica trancado fora dos próprios dados.

## `reviewer` não existe em papel de workspace

`content.space_members.role` aceita `admin`, `editor`, `reviewer` e `viewer`. `content.workspace_members.role` aceita `owner`, `admin`, `editor` e `viewer`, sem `reviewer`. A função mapeia `owner` para `admin` e devolve os outros como estão, então pelo caminho de `workspace_members` ela nunca devolve `reviewer`. Revisor é papel de espaço, não de workspace. Não é lacuna desta ordem, é o desenho das duas tabelas de origem.

## 1. Criar a migração

```sql
CREATE OR REPLACE FUNCTION content.effective_role(p_space_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, content
AS $$
  SELECT coalesce(
    (SELECT sm.role FROM content.space_members sm
      WHERE sm.space_id = p_space_id AND sm.user_id = p_user_id),
    (SELECT CASE WHEN wm.role = 'owner' THEN 'admin' ELSE wm.role END
       FROM content.spaces s
       JOIN content.workspace_members wm
         ON wm.workspace_id = s.workspace_id AND wm.user_id = p_user_id
      WHERE s.id = p_space_id)
  );
$$;
```

Nenhum `GRANT` nesta migração, mesmo motivo das sub-fatias anteriores: acesso é por server function com conexão direta, não por PostgREST.

## Verificação

### 1. Catálogo

```sql
SELECT p.proname,
       p.prosecdef                      AS security_definer,
       p.provolatile                    AS volatilidade,
       l.lanname                        AS linguagem,
       array_to_string(p.proconfig,',') AS config
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language  l ON l.oid = p.prolang
 WHERE n.nspname = 'content' AND p.proname = 'effective_role';
```

O esperado é uma linha, `security_definer` verdadeiro, `volatilidade` igual a `s`, `linguagem` igual a `sql` e `config` contendo `search_path=public, content`. Zero linha, `security_definer` falso ou `config` vazio reprovam.

### 2. Comportamento

Todas as afirmações usam o mesmo usuário, porque `user_id` tem chave estrangeira para `auth.users` e inventar usuário não é possível. A separação dos casos vem de workspaces diferentes.

O bloco monta os dados, afirma e termina em exceção de propósito: o veredito sai na mensagem e nada fica gravado.

```sql
DO $$
DECLARE
  usr uuid; w1 uuid; w2 uuid; w3 uuid; w4 uuid;
  s1 uuid; s2 uuid; s3 uuid; s4 uuid;
  r text; veredito text := '';
BEGIN
  SELECT id INTO usr FROM auth.users LIMIT 1;

  INSERT INTO public.workspaces (name, owner_id) VALUES ('w1 teste', usr) RETURNING id INTO w1;
  INSERT INTO public.workspaces (name, owner_id) VALUES ('w2 teste', usr) RETURNING id INTO w2;
  INSERT INTO public.workspaces (name, owner_id) VALUES ('w3 teste', usr) RETURNING id INTO w3;
  INSERT INTO public.workspaces (name, owner_id) VALUES ('w4 teste', usr) RETURNING id INTO w4;

  -- estado de membro por workspace, independente do que o trigger de seed fez
  DELETE FROM content.workspace_members WHERE workspace_id IN (w1, w2, w3, w4);
  INSERT INTO content.workspace_members (workspace_id, user_id, role) VALUES (w1, usr, 'owner');
  INSERT INTO content.workspace_members (workspace_id, user_id, role) VALUES (w2, usr, 'editor');
  INSERT INTO content.workspace_members (workspace_id, user_id, role) VALUES (w3, usr, 'viewer');
  -- w4 fica sem linha nenhuma, de propósito

  INSERT INTO content.spaces (workspace_id, name, slug, created_by) VALUES (w1,'e1','e1',usr) RETURNING id INTO s1;
  INSERT INTO content.spaces (workspace_id, name, slug, created_by) VALUES (w2,'e2','e2',usr) RETURNING id INTO s2;
  INSERT INTO content.spaces (workspace_id, name, slug, created_by) VALUES (w3,'e3','e3',usr) RETURNING id INTO s3;
  INSERT INTO content.spaces (workspace_id, name, slug, created_by) VALUES (w4,'e4','e4',usr) RETURNING id INTO s4;

  INSERT INTO content.space_members (workspace_id, space_id, user_id, role) VALUES (w3, s3, usr, 'reviewer');

  -- a) owner de workspace vira admin
  r := content.effective_role(s1, usr);
  IF r IS DISTINCT FROM 'admin' THEN
    veredito := veredito || 'FALHA a) owner deveria virar admin, veio ' || coalesce(r,'nulo') || '. ';
  END IF;

  -- b) papel de workspace passa inteiro quando nao e owner
  r := content.effective_role(s2, usr);
  IF r IS DISTINCT FROM 'editor' THEN
    veredito := veredito || 'FALHA b) esperado editor, veio ' || coalesce(r,'nulo') || '. ';
  END IF;

  -- c) o override do espaco vence o papel do workspace
  r := content.effective_role(s3, usr);
  IF r IS DISTINCT FROM 'reviewer' THEN
    veredito := veredito || 'FALHA c) override do espaco nao venceu, veio ' || coalesce(r,'nulo') || '. ';
  END IF;

  -- d) sem linha em lugar nenhum, nulo
  r := content.effective_role(s4, usr);
  IF r IS NOT NULL THEN
    veredito := veredito || 'FALHA d) esperado nulo, veio ' || r || '. ';
  END IF;

  -- e) espaco que nao existe, nulo
  r := content.effective_role(gen_random_uuid(), usr);
  IF r IS NOT NULL THEN
    veredito := veredito || 'FALHA e) espaco inexistente deu ' || r || '. ';
  END IF;

  IF veredito = '' THEN veredito := 'PASSOU a, b, c, d e e'; END IF;
  RAISE EXCEPTION 'VEREDITO: %', veredito;
END $$;
```

A saída esperada é o erro `VEREDITO: PASSOU a, b, c, d e e`. Qualquer outro texto depois de `VEREDITO:` reprova e diz qual afirmação caiu. Erro que não comece por `VEREDITO:` é falha de montagem, não resultado.

A afirmação `c` é a que separa esta função de uma que só lê `workspace_members`: o papel `reviewer` não pode vir do workspace, então recebê-lo prova que a primeira subconsulta foi lida e venceu. As afirmações `d` e `e` são o controle negativo: sem elas, uma função que devolvesse `admin` sempre passaria em `a`.

### Lacuna declarada

O roteiro não exercita a proteção do `search_path`. Provar que a função resiste a um schema plantado no caminho de busca exige criar esse schema e alterar o caminho da sessão, o que mexe em estado fora da transação. A garantia fica apoiada na leitura do `proconfig` pelo passo 1, que confirma o caminho fixo, não no comportamento sob ataque.

## Restrições

- Só este SQL. Não crie `content.position_between`: é a S1f seguinte, se e quando for pedida.
- Não recrie `content.workspace_members`, `content.spaces` nem `content.space_members`: já existem.
- Não aplique sem aprovação humana explícita (`app-release`).
- Não preencha `content.workspace_members` para o workspace existente: é decisão do humano, fora desta ordem.
- Nenhum contrato do ledger muda.
- Não escreva RLS, nem policy.
- Não toque `.env*`.
- Depois de aplicar com sucesso, commite o arquivo que a migração gerar, no mesmo commit ou logo em seguida.
