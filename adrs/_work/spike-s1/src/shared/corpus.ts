// Corpus do spike, escrito por extenso (D-1 e D-2 de adrs/_work/ADR-005-escopo.md).
// Os dois editores rodam exatamente esta lista.

/** Teste 1, parte A: carregar expected.md das 25 fixtures que o têm. */
export const T1_EXPECTED = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29] as const

/** Teste 1, parte B: carregar input.md das 17 fixtures canonical com expected.md. */
export const T1_CANONICAL_INPUT = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 20, 23, 28] as const

/** Teste 1, parte C: 5 fixtures de erro, critérios (a) a (d) do D-1. */
export const T1_ERROR = [3, 15, 22, 24, 30] as const

/** D-2: colar o input.md das 8 fixtures import; a porta importDialect devolve parseDok(expected.md). */
export const D2_IMPORT = [17, 18, 19, 21, 25, 26, 27, 29] as const

/** Contagem que vale para o E-01: 25 (A) + 5 (C) = 30 fixtures. A parte B é exigida para as 17 canonical. */
export const E01_FIXTURE_COUNT = 30
