# Ordem S2 (parte 2 de 2): acesso via PostgREST

**Depende da `DDP-154`.** Escrita supondo a saída A (expor `content` no PostgREST, `GRANT` para `authenticated`). Se a resposta for outra, esta ordem não se aplica como está. Depende também da parte 1 (`ORDEM-S2-rls-recortada.md`): sem RLS ligada, expor o schema abre a tabela inteira para qualquer autenticado, sem filtro nenhum.

## Por que existe

Medido em `DDP-154`: o papel `authenticated` não tem `USAGE` no schema `content`, e `pgrst.db_schemas` não inclui `content`. É por isso que a wiki lê dado em memória hoje. O `GRANT` de tabela e a RLS agem juntos: RLS filtra linha, `GRANT` autoriza o comando na tabela. Faltando qualquer um dos dois, o acesso falha.

## Privilégio por tabela, do mínimo que cada policy da parte 1 precisa

| Tabela | Privilégio |
| :--- | :--- |
| `workspace_members`, `spaces`, `space_members`, `revision_statuses` | SELECT |
| `pages` | SELECT, INSERT, UPDATE |
| `page_revisions`, `revision_status_events` | SELECT, INSERT |
| `revision_current_status` | SELECT |
| `page_drafts` | SELECT, INSERT, UPDATE |

Nenhuma tabela ganha `DELETE`. Nada no recorte precisa apagar linha diretamente: página some por `deleted_at`, revisão e evento são append-only, e a projeção segue o ciclo de vida da revisão. Sem o `GRANT`, um `DELETE` falha na camada de privilégio mesmo que uma policy de RLS não o proibisse explicitamente.

`revision_current_status` só recebe `SELECT` (achado da revisão, `DDP-155`): quem escreve nela é o trigger `revision_status_events_apply`, `security definer` desde a emenda da S1c2, que roda com o papel de quem definiu a função, não com o de `authenticated`. `GRANT` de escrita nesta tabela para `authenticated` permitiria gravar status sem evento, contornando a restrição do ADR 003.

## 1. Privilégios

```sql
GRANT USAGE ON SCHEMA content TO authenticated;

GRANT SELECT ON content.workspace_members TO authenticated;
GRANT SELECT ON content.spaces TO authenticated;
GRANT SELECT ON content.space_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON content.pages TO authenticated;
GRANT SELECT, INSERT ON content.page_revisions TO authenticated;
GRANT SELECT ON content.revision_statuses TO authenticated;
GRANT SELECT, INSERT ON content.revision_status_events TO authenticated;
GRANT SELECT ON content.revision_current_status TO authenticated;
GRANT SELECT, INSERT, UPDATE ON content.page_drafts TO authenticated;
```

Identidade (`bigint generated always as identity`) de `revision_status_events.id` não pede `GRANT` de sequência à parte: privilégio de `INSERT` na tabela já cobre.

## 2. Exposição do schema, fora de migração

`pgrst.db_schemas` incluir `content` não é `GRANT` de SQL, é configuração do projeto (Studio, API, schemas expostos, ou `ALTER ROLE`/`ALTER DATABASE ... SET pgrst.db_schemas`, dependendo de como a instância está hospedada). Esta ordem não aplica essa mudança: fica registrada como passo separado, de configuração de plataforma, não de arquivo de migração, para quem executar o `app-release`.

## Verificação

A seção de verificação é escrita pela sessão A (`DDP-123`).

## Restrições

- Só os `GRANT` listados. Nenhum `GRANT DELETE`, nenhum `GRANT` em `page_refs`, `assets` ou `sync_state`: fora do recorte.
- Não aplique sem a `DDP-154` respondida com a saída A.
- Não aplique sem a parte 1 (políticas de RLS) já aplicada.
- Não aplique sem aprovação humana (`app-release`).
- Nenhum contrato do ledger muda.
