# Estilo de escrita dos ADRs

Regras para a prosa dos ADRs da engine de documentação do DokDraw. O leitor é um engenheiro que vai implementar ou revisar a decisão a partir do texto. O ADR se escreve como um arquiteto que conhece o sistema, escreveu direto e revisou uma vez.

Fonte: `writing-style.md`, reduzido ao que se aplica a ADR e adaptado a este kit (Markdown puro, sem componente `Todo`, contrato de saída em YAML).

## Onde a regra se aplica

- Toda a prosa de `adrs/ADR-*.md`: decisão, contexto, justificativas, texto das tabelas de avaliação, consequências, riscos, gatilhos e fatias.
- Os textos livres do contrato de saída em YAML (`decisao`, `descricao`, `restricoes_impostas`, `premissas`, `riscos_abertos`, `gatilhos_de_reabertura`). São prose que vai para o `LEDGER.md`.
- As fichas de pesquisa em `adrs/_work/` seguem só a Regra zero e a regra de evidência. O resto do estilo vale a partir do ADR.

## Onde a regra não se aplica

- Os títulos da "Estrutura obrigatória do ADR" (`insumos/BASE.md`) e os rótulos de tabela seguem a estrutura, não esta regra.
- Código, SQL, DDL, chaves YAML, nomes de pacote, saída de comando, log e citação direta de terceiro entram como chegaram, com a pontuação original.

Nenhuma dessas exceções libera travessão em texto corrido.

## Regra zero: lacuna não se preenche com prosa

Quando falta informação, o ADR não escreve texto plausível para cobrir o buraco. Boilerplate correto e genérico é pior que lacuna declarada: a lacuna alguém preenche, o boilerplate alguém acredita.

Neste kit a lacuna tem três destinos, conforme o tipo:

1. **Critério não verificado** vira nota `?` na matriz, com o teste de spike que vai verificá-lo.
2. **Informação que falta para decidir** vira alerta no ponto exato do texto:

   ```md
   > [!WARNING]
   > Lacuna: o que falta, em uma frase. Dono: camada ou pessoa que resolve.
   ```

3. **Lacuna que sobrevive ao ADR** entra em `riscos_abertos` no contrato de saída, para chegar ao `LEDGER.md`. Se envolve outra camada, vira conflito em aberto no ledger.

## Não explicar tecnologia genericamente

O ADR não ensina o que uma biblioteca é. Diz para que ela serve no DokDraw e o que ela faz ou deixa de fazer diante dos critérios.

Prosa de esteira:

> O MDXEditor é um editor rico de Markdown baseado em Lexical, amplamente adotado pela comunidade.

Reescrita:

> O MDXEditor lê e grava mdast, o mesmo formato da DokAST, e por isso dispensa conversor entre o editor e `src/content-format`. O ponto fraco para o DokDraw é o registro padrão de text directives, que o DokMD v1 proíbe.

O leitor sabe o que é Postgres, RLS, SSR, AST e editor WYSIWYG. Só se explica o que é específico do DokDraw: DokMD, DokAST, URIs `dok:`, o fluxo editorial, o modelo de diagrama.

## Tempo verbal

- **Presente** para o que existe hoje (o schema de `supabase-types-dokdraw.ts`, o código do app, os ADRs já aceitos) e para a regra que a decisão estabelece: "as páginas são armazenadas em DokMD v1", "toda transição passa por `REVISION_TRANSITIONS`". A seção Decisão se escreve no presente, como regra do sistema.
- **Futuro** só onde o planejado está marcado pela própria seção: fatias de implementação, gatilhos de reabertura, premissas sobre camadas futuras. Fora delas, trecho sobre estado alvo carrega rótulo visível ("planejado", "depois da fatia F3") antes de mudar para o futuro.
- **Passado** para alternativa avaliada, candidata descartada e decisão anterior: "o Plate também foi avaliado", "o rascunho anterior tratava o editor como ADR 002".
- O mesmo parágrafo não mistura o que existe com o que a decisão vai criar sem marcar a fronteira. Exemplo: `public.invites` existe sem `workspace_id` (presente), e a tabela `content.workspace_members` é criada por este ADR (marcado).

## Status de projeto não entra na prosa

Status (Proposto, Aceito, dependência de spike) mora no cabeçalho e no contrato de saída. A prosa descreve a decisão e suas razões, que continuam verdadeiras enquanto a decisão valer.

O ADR também não registra relato de como foi produzido. "Revisado contra os tipos reais do Supabase, descobri que..." vira fato: "`public.user_roles` é global e não tem `workspace_id`."

Fronteira de escopo entra como fato positivo. Em vez de "este ADR não trata do editor", escreva "o editor é decidido no ADR 005, que recebe desta camada a exigência X".

## Especificidade e incerteza

- Nome do componente, tabela, função ou pacote em vez de "o sistema": `page_revisions`, `normalizeDok`, "o fluxo editorial".
- "Todos", "sempre", "nunca" só quando literalmente verdadeiros no escopo citado. "Nenhuma camada parseia Markdown por conta própria" é restrição de contrato e pode ser absoluta. "Todos os editores suportam directives" exige que todos suportem.
- Separe o que é confirmado (documentação, código-fonte, changelog, resultado de spike) do que é inferência. Inferência entra marcada: "o changelog indica que", "a issue aberta sugere", nunca apresentada como fato.

## Evidência e causalidade

Frase com "porque", "portanto", "permite", "garante", "reduz", "evita" ou "aumenta" aponta a evidência: link de documentação, arquivo e linha de código-fonte, resultado de spike, contrato do ledger ou o schema. Relação causal sem evidência é lacuna e segue a Regra zero. README e página de marketing não são evidência (mesma regra de `BASE.md`).

## Decisão, alternativa e custo

- Toda decisão registra a alternativa descartada e o motivo do descarte, com a nota da matriz que o sustenta.
- Consequência só positiva indica que ninguém pensou no custo. O ADR escreve a consequência negativa que a decisão aceita.
- Critério importante é mensurável. Adjetivo não é critério. Formato: cenário, resposta esperada e medida ("parse de página com 5 mil linhas em menos de X ms no servidor", não "parser eficiente").

## Riscos

Cada item de `riscos_abertos` e de "Riscos" diz quem é afetado, qual sinal observável mostra que o risco se materializou e o que já foi decidido ou não a respeito.

Risco de esteira:

> Podem existir problemas de performance nas políticas de RLS em cenários de alta carga.

Reescrita:

> `content.effective_role()` roda como subquery em toda política de RLS de conteúdo. Leitores de workspaces grandes são os afetados. O sinal é a latência de `getPageTree` subir junto com o número de espaços. Ninguém mediu o limite. O gatilho de reabertura prevê mover o papel para claim de JWT.

## Pontuação proibida

Duas proibições absolutas na prosa do ADR:

1. **Travessão.** Nenhum. Nem em aposto, nem separando identificador de título em cabeçalho ou célula, nem em intervalo, nem em lista do tipo `**Termo** — explicação`. Onde daria ritmo, use ponto final, vírgula ou parênteses. Onde separaria rótulo de descrição, use dois-pontos. Intervalo por extenso: "de 1 a 30". Título de ADR usa dois-pontos: `# ADR 005: Edição`.
2. **Ponto e vírgula ligando orações.** Ponto final quando as ideias são independentes, vírgula quando uma depende da outra.

Hífen de lista Markdown, hífen de palavra composta e pontuação de sintaxe (código, YAML, SQL) continuam normais.

## Marcadores proibidos

Zero ocorrências por seção:

- "Não apenas X, mas também Y" e variantes ("mais do que X, é Y", "não se trata de X, e sim de Y").
- "Robusto", "escalável", "eficiente", "flexível", "moderno", "poderoso", "maduro" sem número ou fato ao lado.
- "Vale ressaltar", "é importante notar", "cabe destacar", "em suma", "ademais", "outrossim", "no cenário atual", "de forma holística".
- Lista de exatamente três itens quando o número real é outro.
- Parágrafo final de seção repetindo o que a seção acabou de dizer.
- Hedge automático ("pode ser que", "de certa forma", "eventualmente", "geralmente") sobre fato verificável. Se não dá para verificar, é lacuna.
- Negrito em frase inteira. Negrito marca o termo que o leitor procura com Ctrl+F.
- Parágrafos consecutivos abrindo com "Além disso", "Por outro lado", "Dessa forma", "Portanto".

## Voz

Voz ativa com sujeito nomeado: "o ADR 003 cria", "a decisão aceita o custo de", "o editor grava", "o arquiteto descartou". Sem primeira pessoa, singular ou plural ("decidi", "escolhemos", "nosso", "vamos"). Sem passiva impessoal ("optou-se por"), que esconde quem decidiu e por quê.

Decisão de esteira:

> Optou-se pelo MDXEditor devido à sua robustez e ampla adoção.

Reescrita:

> O ADR escolhe o MDXEditor porque ele passou 30 de 30 fixtures no teste 1 do S-1 sem conversor. O Plate saiu porque serializar callouts como `:::note` exigiu regras próprias no `@platejs/markdown`, estimadas em 4 dias, e falhou em 2 fixtures.

Varie o fôlego. Frase curta para ideia simples, longa só quando carrega condição ou exceção.

## Checklist antes de entregar o ADR

Entra na etapa de verificação do `/adr`:

1. `grep -n "—" adrs/ADR-NNN-*.md` retorna zero linhas fora de bloco de código.
2. Nenhum ponto e vírgula ligando orações fora de bloco de código.
3. Nenhum adjetivo de qualidade sem número ou fato ao lado.
4. Nenhuma frase caberia sem alteração em outro projeto qualquer.
5. Toda decisão tem alternativa descartada, motivo do descarte e consequência negativa aceita.
6. Todo risco tem afetado, sinal observável e estado da decisão.
7. Nenhuma primeira pessoa (`eu`, `nós`, `nosso`, verbos em "-mos", "decidi") nem "optou-se".
8. Toda frase causal aponta evidência.
9. Toda lacuna está como `?` com spike, alerta `Lacuna:` ou `riscos_abertos`. Nenhuma coberta por prosa.
10. Nenhum "todos", "sempre" ou "nunca" que não seja literal no escopo.
11. Nenhum parágrafo explica o que uma tecnologia é em vez de dizer para que ela serve no DokDraw.
12. Tempo verbal: presente para o existente e para a regra da decisão, futuro só em seção de planejado, passado para alternativa descartada.
13. Nenhum relato de processo e nenhum status de projeto fora do cabeçalho e do contrato.
14. O último parágrafo de cada seção acrescenta informação.

## Débito conhecido

Os ADRs 002, 003 e 004 e o `LEDGER.md` foram escritos antes desta regra e usam travessão, ponto e vírgula e, no ADR 004, primeira pessoa ("decidi"). Ficam como débito de estilo, não de conteúdo. Entram na régua quando forem abertos por outro motivo (a correção de numeração do conflito C-6 é a primeira oportunidade) ou numa passada dedicada, se o dono pedir. Um ADR novo não reescreve outro por conta própria.
