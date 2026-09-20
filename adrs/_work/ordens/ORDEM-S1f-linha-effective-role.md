# Ordem S1f': `content.effective_role`

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

A seção de verificação é escrita pela sessão A (`DDP-123`).

## Restrições

- Só este SQL. Não crie `content.position_between`: é a S1f seguinte, se e quando for pedida.
- Não recrie `content.workspace_members`, `content.spaces` nem `content.space_members`: já existem.
- Não aplique sem aprovação humana explícita (`app-release`).
- Não preencha `content.workspace_members` para o workspace existente: é decisão do humano, fora desta ordem.
- Nenhum contrato do ledger muda.
- Não escreva RLS, nem policy.
- Não toque `.env*`.
- Depois de aplicar com sucesso, commite o arquivo que a migração gerar, no mesmo commit ou logo em seguida.
