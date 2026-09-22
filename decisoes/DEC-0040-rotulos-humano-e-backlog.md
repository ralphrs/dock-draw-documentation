# DEC-0040: um só rótulo `humano`, e `backlog` no lugar de `roadmap`

**Data:** 2026-09-22
**Quem decidiu:** humano, no terminal da sessão A
**Alcance:** rótulos do quadro `DDP`, escuta `aguarda-fila.sh`, conferência `confere-quadro.sh`, protocolo, prompts

## A decisão

Dois rótulos deixam de existir:

- `aprovacao-humana` e `revisao-humana` são fundidos em **`humano`**, que já existia com o mesmo sentido. Todo card que espera algo do humano leva só `humano` mais a categoria de aprovação quando houver (`ledger`, `app-release`, ...). Sessenta e um cards foram ajustados em 2026-09-22.
- `roadmap` vira **`backlog`**. Tudo que não será desenvolvido agora, inclusive os épicos de roadmap da DEC-0036, fica em estoque com `backlog`, sem responsável, em `A FAZER`, fora da fila de toda sessão. O humano organiza o estoque numa lista própria do Jira. Cards ajustados: `DDP-326`, `DDP-498`, `DDP-500`, `DDP-502`.

A JQL da sessão A passa a ler `labels = "humano"` onde lia os dois rótulos antigos, e `labels != "humano"` para o card órfão em `AGUARDANDO APROVAÇÃO`. A regra que proíbe a sessão A e a sessão D de moverem card de humano passa a citar `humano`.

## Custo aceito e alternativa descartada

Custo: os comentários e decisões antigas citam os rótulos extintos, e ficam como registro histórico. Alternativa descartada: status próprio `BACKLOG` no fluxo de trabalho, proposto pela sessão A. O humano preferiu manter o rótulo e a lista.
