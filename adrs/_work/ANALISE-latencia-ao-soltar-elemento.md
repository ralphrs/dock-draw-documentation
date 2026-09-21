# Por que o elemento demora a aparecer quando é solto no diagrama

Análise da sessão A, 2026-09-21, a pedido do dono do produto. Código lido em `dok-draw-app`, commit da `main` do dia. Medições de banco feitas contra a instância de produção.

## Resposta curta

O elemento só é desenhado depois que o servidor responde. Nada aparece enquanto a rede e o banco trabalham, porque o estado da tela é atualizado no `onSuccess` da mutation, e não antes.

O banco não é o gargalo. A consulta mais cara do caminho executa em **0,251 ms**, medido com `EXPLAIN (ANALYZE, BUFFERS)`.

## O caminho completo de um elemento solto

`diagram-canvas.tsx` chama `onDropType`, que na rota faz `createMutation.mutate(...)`. A mutation não tem `onMutate`. A primeira e única escrita no estado da tela acontece aqui:

```ts
onSuccess: (created) => {
  setModel((prev) => prev ? { ...prev, elements: [...prev.elements, created.element],
                                       nodes: [...prev.nodes, created.node] } : prev)
}
```

Entre o soltar e esse `setModel`, o usuário espera por:

| # | Etapa | Onde |
| :- | :--- | :--- |
| 1 | Requisição do navegador até a server function | rede |
| 2 | Criação de um cliente Supabase novo e `supabase.auth.getClaims(token)` | `auth-middleware.ts` |
| 3 | Validação Zod | desprezível |
| 4 | `insert` em `model_elements` com `select().single()` | ida ao banco |
| 5 | `select z_index from view_nodes where view_id = ...` | ida ao banco |
| 6 | `insert` em `view_nodes` com `select().single()` | ida ao banco |
| 7 | Resposta até o navegador | rede |

As etapas 4, 5 e 6 são **sequenciais**, cada uma um pedido HTTP do servidor para o PostgREST. Somadas à etapa 2, são quatro idas e voltas do lado do servidor antes de qualquer pixel mudar.

## A prova de que a causa é o desenho, e não a infraestrutura

O mesmo arquivo trata arrastar um elemento **já existente** de outra forma:

```ts
function moveNodes(updates) { setModel(...) }          // imediato, sem esperar nada

function commitNodes(updates) {
  clearTimeout(saveTimer.current)
  saveTimer.current = setTimeout(() => persistNodes({ data: { nodes: updates } }), 400)
}
```

Mover pinta na hora e grava 400 ms depois, fora do caminho crítico. Criar espera tudo. Os dois comportamentos convivem no mesmo componente, com a mesma rede e o mesmo banco, e só um deles tem atraso perceptível. Isso descarta rede lenta, banco lento e React Flow como causa.

## O que foi medido, e o que não foi

**Medido.** `EXPLAIN (ANALYZE, BUFFERS)` da consulta da etapa 5, contra produção: `Execution Time: 0.251 ms`, `Planning Time: 4.202 ms`, 14 linhas na tabela inteira. Os índices existem e estão corretos: `idx_view_nodes_view` sobre `view_id`, e `view_nodes_view_id_element_id_key` único sobre o par. As políticas de RLS usam `private.can_access_project` e `private.can_access_view`, as duas `STABLE SECURITY DEFINER` com `search_path` fixo, forma que permite ao Postgres avaliá-las uma vez por argumento constante em vez de uma vez por linha.

**Não medido.** A latência de rede de cada etapa, o custo real de `getClaims` e o tempo total percebido. Medir isso exige a aba aberta com o painel de rede, e esta análise foi feita só com leitura de código e consulta ao banco. A distribuição do atraso entre as sete etapas continua desconhecida.

## Três coisas que pioram com o tempo

**A etapa 5 cresce com o diagrama.** Ela busca o `z_index` de **todas** as linhas de `view_nodes` daquela vista para calcular o próximo, em JavaScript:

```ts
const nextZ = Math.max(0, ...(siblings ?? []).map((s) => s.z_index ?? 0)) + 1
```

Com seis nós isso é irrelevante. Com seiscentos, o servidor transporta seiscentas linhas para descobrir um número. `select max(z_index)` devolve uma linha, e a mesma conta feita dentro do `insert` não devolve nenhuma.

**O cliente Supabase nasce a cada chamada.** O middleware constrói um `createClient` novo por invocação e chama `getClaims` nele. O cache de chaves de verificação vive na instância do cliente, então um cliente novo provavelmente não aproveita o cache do anterior. Isso é hipótese, não medição: confirmar exige observar se há requisição ao servidor de autenticação a cada chamada.

**Três escritas sem transação.** As etapas 4 e 6 são inserts separados. Se a 6 falhar, o `model_elements` da 4 fica órfão, sem nó em vista nenhuma. Não é o problema de desempenho, e é um problema.

## Recomendação, em ordem de retorno

**1. Pintar antes de gravar.** Acrescentar `onMutate` à mutation, criando o elemento e o nó no estado com um id provisório, e reconciliar no `onSuccess`. No `onError`, desfazer e avisar. O atraso percebido some, porque deixa de estar no caminho do olho. É a mesma técnica que `moveNodes` já usa neste arquivo, e a mudança cabe em uma função.

**2. Uma ida ao banco em vez de três.** Uma server function em Postgres que recebe os dados, calcula o `z_index` e insere nas duas tabelas dentro de uma transação. Resolve o crescimento da etapa 5 e o órfão da etapa 6 pelo mesmo movimento.

**3. Medir antes de mexer em autenticação.** O `getClaims` por chamada é suspeito, e suspeita não é motivo para reescrever middleware. A medição é barata: abrir o painel de rede e soltar um elemento.

O item 1 resolve o sintoma que o dono do produto relatou. Os itens 2 e 3 resolvem causas que continuariam crescendo por baixo dele.

## Lacuna declarada

Esta análise não abre o navegador. Toda afirmação sobre o que o usuário percebe vem da leitura do código, não de cronômetro. O item 1 da recomendação é seguro mesmo assim, porque ele tira a espera do caminho crítico independentemente de quanto ela dura. Os itens 2 e 3 pedem medição antes de virar trabalho.

Também não foi verificado se o mesmo padrão existe em outras mutations da tela. `patchMutation` atualiza o estado só no `onSuccess`, com a mesma forma, e não foi analisado se o atraso ali incomoda.
