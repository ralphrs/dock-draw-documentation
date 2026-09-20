// Harness de medição de desempenho para a Emenda 1 ao ADR 002 (seções 2 e 3).
// Roda do zero, sem argumento obrigatório: node content-format/perf.ts a partir de adrs/_work/spike-s1/.
// Importa dokmd.ts sem alterá-lo. Fixtures lidas de adrs/ADR-002-anexos/fixtures (mesmo caminho do check-fixtures.ts).
import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { cpus, arch, platform } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeDok, parseDok, serializeDok, validateDok } from './dokmd.ts'

const fixturesRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'ADR-002-anexos', 'fixtures')

// Mesma escolha de corpos da medição original (S-1, Emenda 1): headings, listas,
// código, tabela, callout, tabs, steps, diagrama. A ordem é fixa, então a mesma
// contagem de linhas-alvo sempre produz o mesmo texto de entrada.
const BODY_DIRS = [
  '04-headings-e-inline',
  '05-listas-marcadores',
  '06-listas-aninhadas-tarefas',
  '07-blocos-de-codigo',
  '08-tabela-gfm',
  '16-callout-canonico',
  '20-tabs-canonico',
  '22-steps-canonico',
  '23-diagram-canonico',
] as const

function bodyOf(dir: string): string {
  const path = existsSync(join(fixturesRoot, dir, 'expected.md'))
    ? join(fixturesRoot, dir, 'expected.md')
    : join(fixturesRoot, dir, 'input.md')
  const raw = readFileSync(path, 'utf8')
  const parts = raw.split(/^---\n[\s\S]*?\n---\n/)
  return parts[parts.length - 1]!.trim()
}

const BODIES = BODY_DIRS.map(bodyOf)
const FRONTMATTER = '---\ndok: 1\nid: 0192f0a1-5c3e-7a10-8b2c-3d4e5f607182\ntitle: "Página sintética de desempenho"\n---\n'

// Determinística: mesmo targetLines sempre gera a mesma sequência de corpos,
// porque o índice avança em round-robin sobre BODIES, sem aleatoriedade.
function syntheticPage(targetLines: number): { canonical: string; lineCount: number; sha256: string } {
  let doc = FRONTMATTER
  let i = 0
  while (doc.split('\n').length < targetLines) {
    doc += '\n' + BODIES[i % BODIES.length] + '\n'
    i++
  }
  const canonical = normalizeDok(doc)
  if (normalizeDok(canonical) !== canonical) throw new Error(`normalizeDok não é ponto fixo para targetLines=${targetLines}`)
  const lineCount = canonical.split('\n').length
  const sha256 = createHash('sha256').update(canonical, 'utf8').digest('hex')
  return { canonical, lineCount, sha256 }
}

type Stats = { p50: number; p95: number; max: number }

function timeit(fn: () => void, n: number, warmup: number): Stats {
  for (let w = 0; w < warmup; w++) fn()
  const samples: number[] = []
  for (let k = 0; k < n; k++) {
    const t0 = performance.now()
    fn()
    samples.push(performance.now() - t0)
  }
  samples.sort((a, b) => a - b)
  return {
    p50: samples[Math.floor(n * 0.5)]!,
    p95: samples[Math.floor(n * 0.95)]!,
    max: samples[n - 1]!,
  }
}

const N = 30
const WARMUP = 3
const fmt = (ms: number) => `${ms.toFixed(2)} ms`

console.log(`Máquina: ${cpus()[0]?.model ?? '?'} (${cpus().length} núcleos lógicos), ${arch()}/${platform()}, Node ${process.version}`)
console.log(`Amostras por operação: ${N}, aquecimento: ${WARMUP}\n`)

// --- Seção 2: detalhamento por operação, página de 5 mil linhas ---
const page5k = syntheticPage(5000)
console.log('=== Seção 2: página de 5 mil linhas ===')
console.log(`linhas: ${page5k.lineCount}, bytes (texto canônico): ${Buffer.byteLength(page5k.canonical, 'utf8')}, sha256: ${page5k.sha256}\n`)

const tree5k = parseDok(page5k.canonical)
const ops: Array<[string, () => void]> = [
  ['parseDok', () => parseDok(page5k.canonical)],
  ['serializeDok', () => serializeDok(tree5k)],
  ['validateDok', () => validateDok(page5k.canonical)],
  ['normalizeDok (parse + serialize)', () => normalizeDok(page5k.canonical)],
  [
    'normalizeDok + validateDok (save completo)',
    () => {
      const n = normalizeDok(page5k.canonical)
      validateDok(n)
    },
  ],
]
console.log('| Operação | p50 | p95 |')
console.log('| :--- | ---: | ---: |')
for (const [label, fn] of ops) {
  const s = timeit(fn, N, WARMUP)
  console.log(`| ${label} | ${fmt(s.p50)} | ${fmt(s.p95)} |`)
}

// --- Seção 3: escala do pipeline completo do save em quatro tamanhos ---
console.log('\n=== Seção 3: escala do pipeline completo do save (normalizeDok + validateDok) ===')
console.log('| Linhas | Bytes (texto canônico) | sha256 | p50 | p95 | max | max / p50 |')
console.log('| ---: | ---: | :--- | ---: | ---: | ---: | ---: |')
for (const target of [5000, 10000, 20000, 40000]) {
  const page = syntheticPage(target)
  const bytes = Buffer.byteLength(page.canonical, 'utf8')
  const s = timeit(() => {
    const n = normalizeDok(page.canonical)
    validateDok(n)
  }, N, WARMUP)
  const ratio = s.max / s.p50
  console.log(
    `| ${page.lineCount} | ${bytes} | ${page.sha256.slice(0, 12)}… | ${fmt(s.p50)} | ${fmt(s.p95)} | ${fmt(s.max)} | ${ratio.toFixed(2)}x |`,
  )
}
