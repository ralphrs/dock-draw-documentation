// Helpers comuns aos testes dos dois editores. Leitura das fixtures em Node, direto do ADR 002.
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page, ConsoleMessage } from '@playwright/test'

export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'ADR-002-anexos', 'fixtures')
export type Entry = { n: number; dir: string; stage: 'canonical' | 'import'; errors: string[]; warnings: string[]; hasExpected: boolean }
export const manifest: Entry[] = JSON.parse(readFileSync(join(FIXTURES, 'manifest.json'), 'utf8'))
export const entry = (n: number) => manifest.find((m) => m.n === n)!
export const read = (n: number, file: 'input.md' | 'expected.md') => {
  const p = join(FIXTURES, entry(n).dir, file)
  return existsSync(p) ? readFileSync(p, 'utf8') : null
}

/** Coleta erros de console e de página (hidratação, exceções) durante o teste. */
export function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m: ConsoleMessage) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  return errors
}

export async function openEditor(page: Page, editor: 'mdxeditor' | 'plate', q: Record<string, string | number>) {
  const qs = new URLSearchParams(Object.entries(q).map(([k, v]) => [k, String(v)])).toString()
  await page.goto(`/edit/${editor}?${qs}`)
  await page.waitForFunction(() => (window as any).__spike !== undefined)
}

export const spike = {
  mode: (p: Page) => p.evaluate(() => (window as any).__spike.mode()),
  setMode: (p: Page, m: 'wysiwyg' | 'source') => p.evaluate((m) => (window as any).__spike.setMode(m), m),
  getDok: (p: Page) => p.evaluate(() => (window as any).__spike.getDok() as string),
  save: (p: Page) => p.evaluate(() => (window as any).__spike.save() as { ok: boolean; text: string; diagnostics: { code: string }[] }),
  sourceText: (p: Page) => p.evaluate(() => (window as any).__spike.sourceText() as string),
  importCalls: (p: Page) => p.evaluate(() => ((window as any).__importCalls ?? []) as { matchedFixture: number | null }[]),
}

/** Casos de regressão de listas vizinhas (adrs/_work/spike-s1/extra). */
export const EXTRA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'extra')
export const EXTRA_SLUGS = [
  'x01-ul-ul', 'x02-ol-ol', 'x03-ul-ol', 'x04-ol-ul', 'x05-ul-ul-varios-blocos', 'x06-ol-ol-varios-blocos',
  'x07-tres-ul-seguidas', 'x08-citacao-ul-ul', 'x09-citacao-ol-ol-varios-blocos', 'x10-callout-ul-ul',
  'x11-callout-ol-ol-varios-blocos', 'x12-callout-ul-ol',
] as const
export const readExtra = (slug: string) => readFileSync(join(EXTRA_DIR, `${slug}.md`), 'utf8')
