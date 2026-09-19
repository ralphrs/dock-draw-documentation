# Prompt — Emenda 1 ao ADR 002: execução, desempenho e testes do `src/content-format`

[Colar o Bloco 0. Anexar: LEDGER.md atualizado; ADR-002 aceito; ADR-005 aceito.]

# Tarefa
Escreva a Emenda 1 ao ADR 002. Não reabra nenhuma decisão do ADR 002: a gramática, a AST, a API e as dependências continuam como estão. A emenda só acrescenta o que o ADR não fixou sobre o módulo `src/content-format`.

# Perguntas
1. Ambientes de execução: navegador, server functions do TanStack Start e jobs agendados (sync do ADR 010). O mesmo código ESM roda nos três? Há API que depende de DOM ou de Node? Como garantir isso (ex.: teste em ambiente sem DOM, lint de imports)?
2. Orçamento de desempenho: parse + validate + serialize de uma página de 5 mil linhas, no cliente e no servidor. Definir limite (ms) e como medir.
3. Tamanho máximo de página aceito no save e o que acontece acima dele.
4. Estratégia de testes: as 30 fixtures do ADR 002 como suíte de regressão compartilhada (Vitest, sem DOM), usada também pelo ADR 005 (editor) e pelo ADR 007 (renderização).
5. Funções que camadas futuras vão pedir e que o ADR 002 ainda não publica (ex.: `toProfile` para o ADR 010). Registrar como "a acrescentar pela camada consumidora", sem implementar agora.

# Saída
Seção "Emenda 1" anexada ao ADR 002 e bloco YAML de contrato **complementar** (só os campos novos) para o LEDGER.md.
