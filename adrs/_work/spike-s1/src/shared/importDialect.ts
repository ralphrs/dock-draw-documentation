// Stub espionado da porta importDialect (D-2). Não converte nada:
// para o input.md de uma fixture import, devolve parseDok(expected.md) da mesma fixture,
// resultado que o harness de 30/30 já aprovou. Toda chamada fica registrada para o teste
// provar que o colar passou pela porta e não pelo parser do editor.
import type { Root } from 'mdast'
import { parseDok } from '../../content-format/dokmd.ts'
import { manifest, fixtureFile } from './fixtures'

export type Dialect = 'gfm' | 'obsidian' | 'starlight-mdx' | 'legacy'
export type ImportCall = { text: string; html?: string; dialect?: Dialect; matchedFixture: number | null }
export type ImportResult = { tree: Root; report: { matchedFixture: number | null; degraded: boolean } }

export const importCalls: ImportCall[] = []

const norm = (s: string) => s.replace(/\r\n/g, '\n').trim()

export function importDialect(input: { text: string; html?: string; dialect?: Dialect }): ImportResult {
  const match = manifest.find((f) => f.stage === 'import' && norm(fixtureFile(f.dir, 'input.md') ?? '') === norm(input.text))
  importCalls.push({ ...input, matchedFixture: match?.n ?? null })
  if (typeof window !== 'undefined') (window as unknown as { __importCalls: ImportCall[] }).__importCalls = importCalls
  if (match) return { tree: parseDok(fixtureFile(match.dir, 'expected.md')!), report: { matchedFixture: match.n, degraded: false } }
  // Fora das fixtures o stub degrada para o texto puro como DokMD (o importador real é da F6 do ADR 002).
  return { tree: parseDok(input.text), report: { matchedFixture: null, degraded: true } }
}
