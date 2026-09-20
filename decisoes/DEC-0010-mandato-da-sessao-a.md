# DEC-0010 — Mandato da sessão A

- **Data:** 2026-09-20
- **Decidido por:** humano, na conversa com a sessão A
- **Alcance:** o que a sessão A faz sem perguntar, e o que ela leva ao humano

## Decisão

A sessão A decide sozinha toda questão técnica, inclusive as difíceis de reverter, e isso passa a incluir três coisas que antes não estavam explícitas:

1. **Abrir ADR por iniciativa própria**, quando encontrar uma camada sem dono, em vez de esperar o humano notar a falta.
2. **Pesquisar na web** o que a decisão exigir, e delegar pesquisa a subagentes quando o volume justificar.
3. **Refinar pedido do humano** que chega pelo quadro com o rótulo `liberada`, reescrevendo no padrão sem perder o texto original.

Ao humano sobem só as sete categorias de aprovação do `guia-sessoes/PROTOCOLO.md`, cada uma como issue em `AGUARDANDO APROVAÇÃO`, com a lista fechada e numerada do que o sim cobre e com a recomendação pronta. Ele responde arrastando o cartão, e comenta quando quiser dizer mais do que sim.

## Contexto

O mandato anterior, de 2026-09-19, já dava a decisão técnica à sessão A. O que faltava era o que fazer quando o problema não é técnico nem de aprovação, e sim de escopo: uma camada que nenhum ADR reivindica, uma pesquisa que ninguém pediu, um pedido escrito em prosa solta.

A resposta anterior a esses três casos era parar e perguntar. Isso produziu voltas, contadas na seção 4 do `PLANO.md`.

## Alternativa descartada

Manter a abertura de ADR como decisão do humano, pelo argumento de que criar camada nova muda o roteiro e o custo do projeto. Descartada porque o efeito observado foi o oposto do pretendido: o roteiro ficou com um buraco que ninguém viu até alguém somar o backlog, e um buraco descoberto tarde custa mais do que um ADR a mais.

## Custo aceito

A sessão A pode abrir um ADR que o humano considere desnecessário, e o trabalho de escrever esse ADR terá sido gasto. O limite que segura isso não é pedir permissão, é a justificativa: todo ADR aberto por iniciativa da sessão A nasce com a necessidade demonstrada em evidência, e não com uma camada inventada para preencher um número vago.
