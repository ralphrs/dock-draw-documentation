// Porte de adrs/ADR-002-anexos/harness/check-fixtures.mjs contra o módulo TS portado.
// Mesmas checagens, mesma saída. Fixtures lidas direto de adrs/ADR-002-anexos/fixtures.
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeDok, validateDok } from './dokmd.ts'

type ManifestEntry = { dir: string; stage: 'canonical' | 'import'; errors: string[]; warnings: string[] }

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'ADR-002-anexos', 'fixtures')
const manifest: ManifestEntry[] = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'))
const IMPORTER_ONLY = new Set(['DOK-W104', 'DOK-W106']) // emitidos pelo importador, não pelo validador

let fail = 0
const rows: string[] = []
for (const f of manifest) {
  const dir = join(root, f.dir)
  const input = readFileSync(join(dir, 'input.md'), 'utf8')
  const expected = existsSync(join(dir, 'expected.md')) ? readFileSync(join(dir, 'expected.md'), 'utf8') : null
  const checks: [string, boolean, unknown?][] = []

  const n1 = normalizeDok(input)
  checks.push(['idempotente', normalizeDok(n1) === n1])

  if (expected !== null) {
    checks.push(['expected é ponto fixo', normalizeDok(expected) === expected])
    const d = validateDok(expected)
    const errs = d.filter((x) => x.code.startsWith('DOK-E'))
    checks.push(['expected sem erros', errs.length === 0, errs])
    const warns = [...new Set(d.filter((x) => x.code.startsWith('DOK-W')).map((x) => x.code))].sort()
    const wantWarns = f.warnings.filter((w) => !IMPORTER_ONLY.has(w)).sort()
    checks.push(['avisos esperados', JSON.stringify(warns) === JSON.stringify(wantWarns), warns])
    if (f.stage === 'canonical') checks.push(['N(input) === expected', n1 === expected, n1])
  } else {
    const codes = [...new Set(validateDok(n1).map((x) => x.code).filter((c) => c.startsWith('DOK-E')))].sort()
    checks.push(['erros esperados', JSON.stringify(codes) === JSON.stringify([...f.errors].sort()), codes])
  }

  const bad = checks.filter((c) => !c[1])
  if (bad.length) fail++
  rows.push(`${bad.length ? 'FALHA' : 'ok   '} ${f.dir.padEnd(34)} ${f.stage.padEnd(9)} ${checks.length} checagens`)
  for (const b of bad) rows.push(`        ✗ ${b[0]} → ${JSON.stringify(b[2] ?? '')}`)
}
console.log(rows.join('\n'))
console.log(`\n${manifest.length - fail}/${manifest.length} fixtures aprovadas`)
process.exit(fail ? 1 : 0)
