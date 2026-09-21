# Ordem S1g: `node_kind` em `content.pages`

**Blocos do recorte:** nenhum. Esta ordem não implementa bloco do recorte: o DDL nasce da `DEC-0018` e da resposta em `DDP-141`, não do texto do ADR 003

Coluna que distingue pasta de página. Não vem do texto do ADR 003: nasce da `DEC-0018` e da resposta do humano em `DDP-141`, "pasta e página são a mesma coisa com um rótulo diferente". É extensão aditiva ao schema do ADR 003, sem reabrir o ADR. Depende de S1b (`content.pages`, aplicada).

## Como aplicar esta migração

A plataforma grava pela ferramenta própria, journal em `drizzle/migrations/` (`DEC-0013`). Não crie arquivo em `supabase/migrations/`.

1. **Aplicar é categoria `app-release`** (`DEC-0007`), exige aprovação do humano. Esta ordem só escreve o SQL, não aplica.
2. **Desfazer não é `git revert`.** Falha no meio desfaz tudo, transação única.
3. **`content.pages` já existe, aplicada.** Este DDL só acrescenta uma coluna.

## Restrições do contrato

| Restrição (`LEDGER.md`, ADR 003) | Como se confere |
| :--- | :--- |
| "A unicidade de `content.pages` é `unique nulls not distinct (space_id, project_id, parent_page_id, slug)`" (entrada do ADR 003 no ledger, `DEC-0014`, `DDP-118`) | `ADD COLUMN` é aditivo, não toca a constraint existente. Pasta e página continuam no mesmo espaço de nomes de slug, dentro do mesmo pai: é o que se quer, porque duas coisas com o mesmo nome no mesmo pai seriam ambíguas na árvore independentemente do tipo |

Nenhuma das sete `restricoes_impostas` do ADR 003 fala de tipo de nó. Lacuna declarada: a distinção pasta e página não tem restrição de ledger que a exija, ela existe por decisão de produto (`DEC-0018`), registrada aqui e ainda pendente de entrada formal no ledger.

## Converter pasta em página é trocar uma coluna

Se pasta e página são a mesma coisa com rótulo diferente, converter uma na outra é um `UPDATE` de `node_kind`, e a linha convertida mantém `id`, `parent_page_id` e os filhos que apontam para ela por `parent_page_id`. Esta ordem registra a propriedade como consequência do desenho, não constrói a operação: nenhuma função ou trigger nasce aqui.

## A tabela tem zero linhas hoje

Medido em 2026-09-20. O `DEFAULT 'pagina'` existe para quando houver linha, não porque há. Quem aplicar confere a contagem antes e relata o que encontrar.

## Pasta sem revisão é lacuna declarada, não defeito

`published_revision_id` fica nulo numa pasta e nada no banco impede uma pasta de ganhar revisão. A regra de que pasta não publica conteúdo vive na aplicação até alguém decidir se vale uma restrição de banco. `title not null` continua valendo para pasta como para página: não é problema, é o que já existia.

## Por que o domínio tem só dois valores

A `DEC-0018` mantém as duas árvores separadas: o nó de diagrama não mora em `content.pages`. O `CHECK` aceita só `pasta` e `pagina` de propósito. Um terceiro valor para diagrama significaria que aquela decisão foi revertida, e a reversão precisa ser deliberada, não um valor que entra de lado nesta coluna.

## 1. Criar a migração

```sql
ALTER TABLE content.pages
  ADD COLUMN node_kind text NOT NULL DEFAULT 'pagina'
    CHECK (node_kind IN ('pasta', 'pagina'));
```

Nenhum `GRANT` nesta migração, mesmo motivo das sub-fatias anteriores.

## Verificação

A seção de verificação é escrita pela sessão A (`DDP-123`).

## Restrições

- Só este SQL. Nenhuma coluna nova em `public.views`: pasta de diagrama é outra decisão, sem resposta ainda (`DDP-142`).
- Não crie função nem trigger de conversão entre pasta e página: fica para quando for pedido.
- Não aplique a migração. A aplicação é categoria `app-release`, com aprovação humana, fora desta ordem.
- Nenhum contrato do ledger muda.
- Não escreva RLS, nem policy, nem server function.
- Não toque `.env*`.
