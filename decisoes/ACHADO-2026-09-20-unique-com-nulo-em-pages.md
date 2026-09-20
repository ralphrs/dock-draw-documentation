# Achado: o `unique` de `content.pages` não alcança página de raiz

**Data:** 2026-09-20
**Origem:** conferência da ordem da sub-fatia S1b (`DDP-109`), antes do despacho
**Alcance:** ADR 003, seção 6.2, bloco 1. A tabela ainda não existe no banco

## O fato

O DDL do ADR 003 fecha `content.pages` com:

```sql
unique (space_id, parent_page_id, slug)
```

`parent_page_id` é a única coluna nula das três. Página de raiz de um espaço nasce com `parent_page_id` nulo, por definição: não tem página-mãe.

**O Postgres trata nulo como distinto dentro de constraint única, por padrão.** Duas linhas com o mesmo `space_id`, o mesmo `slug` e `parent_page_id` nulo nas duas satisfazem a constraint e entram as duas.

Consequência: a constraint vale para página filha e não vale para página de raiz. O nível da árvore onde a colisão de slug é mais provável é justamente o que fica sem proteção.

## A evidência

| O que foi conferido | Resultado |
| :--- | :--- |
| Versão do servidor | PostgreSQL 17.6 |
| `null::uuid = null::uuid` | devolve nulo, não verdadeiro |
| `indnullsnotdistinct` nos 13 índices únicos que já existem no banco | `false` nos 13, que é o padrão |

O Postgres 15 em diante aceita `unique nulls not distinct`, e a coluna `pg_index.indnullsnotdistinct` existe para registrar a escolha. Nenhum índice do projeto a liga hoje.

## O alcance, medido

As sete constraints compostas do DDL do ADR 003 foram conferidas uma a uma:

| Linha do ADR | Constraint | Coluna nula dentro dela |
| :--- | :--- | :--- |
| 154 | `primary key (workspace_id, user_id)` | nenhuma |
| 187 | `unique (workspace_id, slug)` | nenhuma |
| 194 | `primary key (space_id, user_id)` | nenhuma |
| **210** | **`unique (space_id, parent_page_id, slug)`** | **`parent_page_id`** |
| 325 | `primary key (page_id, author_id)` | nenhuma |
| 367 | `unique (workspace_id, checksum_sha256)` | nenhuma |
| 386 | `unique (workspace_id, resource_kind, resource_id, provider)` | nenhuma |

Chave primária recusa nulo por construção, então as três primeiras e a de `page_drafts` não correm o risco. **O defeito é de uma constraint só**, e ela está na sub-fatia que ia ser despachada agora.

## De quem é o defeito

**Não é da ordem.** O DDL da ordem S1b é transcrição fiel do bloco 1 do ADR 003: a conferência comparou os 33 comandos SQL, coluna por coluna, tipo por tipo, e devolveu zero divergência. A ordem reproduziu o que o contrato manda reproduzir.

O defeito está no DDL do ADR 003, aceito em 2026-09-19, e sobreviveu à revisão do ADR e à revisão do recorte porque as duas conferiram a forma contra a intenção declarada, e a intenção declarada parece cumprida na leitura.

É a mesma família que a auditoria de 2026-09-20 nomeou: restrição afirmada, mecanismo sem alcance. A diferença é que desta vez o mecanismo é uma constraint do banco, e não um teste.

## Por que decidir agora, e não depois

A tabela não existe. Ligar `nulls not distinct` numa tabela vazia é uma palavra a mais no `create table`.

Depois que a tabela receber linhas, a mesma mudança exige achar e resolver as duplicatas que já entraram antes de a constraint poder ser criada. Duplicata de slug de raiz não é dado que se apague sozinho: cada linha é uma página que alguém escreveu.

## As três saídas, com o custo de cada uma

| Saída | O que muda no DDL | Custo |
| :--- | :--- | :--- |
| A: `unique nulls not distinct (space_id, parent_page_id, slug)` | três palavras na linha 210 | Exige Postgres 15 ou maior, que o projeto tem. Muda o contrato do ADR 003 |
| B: dois índices parciais, um para raiz e um para filha | troca uma linha por duas instruções | Mais peças para manter, e a intenção fica em dois lugares |
| C: aceitar slug repetido na raiz | nada | A constraint continua prometendo o que não cumpre, a menos que o ADR escreva que a raiz é exceção |

A saída C só é aceitável acompanhada de texto, porque uma constraint que cobre metade dos casos sem dizer isso é armadilha para quem ler o schema depois.

## O que este achado não decide

Qual saída vale. Mudar o DDL do ADR 003 é mudar contrato, e contrato do ledger só muda com aprovação explícita do dono do produto. A sub-fatia S1b fica parada até a resposta, porque a linha em questão está dentro do DDL que ela aplica.

## Lacuna que fica declarada de qualquer forma

Nenhum mecanismo do projeto reprova constraint única que contém coluna nula. Este achado saiu de leitura, como os cinco de 2026-09-20. Se a saída escolhida for A ou B, a S1c em diante continua sem nada que impeça o mesmo desenho aparecer de novo.
