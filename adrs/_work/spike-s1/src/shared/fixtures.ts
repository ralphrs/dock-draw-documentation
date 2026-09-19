// Fixtures do ADR 002 lidas direto de adrs/ADR-002-anexos/fixtures (sem cópia).
import manifestJson from '../../../../ADR-002-anexos/fixtures/manifest.json'

export type FixtureEntry = {
  n: number
  slug: string
  dir: string
  stage: 'canonical' | 'import'
  source: string
  errors: string[]
  warnings: string[]
  hasExpected: boolean
}

export const manifest = manifestJson as FixtureEntry[]

const files = import.meta.glob('../../../../ADR-002-anexos/fixtures/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function fixtureFile(dir: string, file: 'input.md' | 'expected.md'): string | undefined {
  const key = Object.keys(files).find((k) => k.endsWith(`/fixtures/${dir}/${file}`))
  return key ? files[key] : undefined
}

export function fixtureByNumber(n: number): FixtureEntry {
  const f = manifest.find((x) => x.n === n)
  if (!f) throw new Error(`fixture ${n} inexistente`)
  return f
}

// Casos de regressão fora do corpus (parada 4, trava 2): adrs/_work/spike-s1/extra/*.md
const extras = import.meta.glob('../../extra/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export function extraFile(slug: string): string {
  const key = Object.keys(extras).find((k) => k.endsWith(`/extra/${slug}.md`))
  if (!key) throw new Error(`caso extra inexistente: ${slug}`)
  return extras[key]!
}
