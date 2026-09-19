// Utilitários dos testes do Plate. Nada aqui entra no adaptador.
import type { Page } from '@playwright/test'
import { createTwoFilesPatch } from 'diff'

export const EDITOR = 'plate' as const
export const CONTENT = '[data-testid=plate-content]'

/** Edição trivial: cursor no texto do editor, digita x, Backspace. */
export async function trivialEdit(page: Page) {
  const s = page.locator(`${CONTENT} [data-slate-string]`).first()
  if (await s.count()) await s.click()
  else await page.locator(CONTENT).click()
  // Pausas curtas: o Slate sincroniza a seleção do DOM por evento selectionchange (assíncrono).
  await page.waitForTimeout(100)
  await page.keyboard.press('End')
  await page.waitForTimeout(100)
  await page.keyboard.type('x')
  await page.waitForTimeout(50)
  await page.keyboard.press('Backspace')
  await page.waitForTimeout(50)
}

export function diffOf(expected: string, got: string) {
  return createTwoFilesPatch('expected.md', 'obtido', expected, got, '', '', { context: 2 })
    .split('\n')
    .slice(2)
    .join('\n')
}

type AnyNode = { type: string; children?: AnyNode[] }

/** Contagem de tipos mdast (todos os níveis). */
export function typeCounts(tree: AnyNode): Record<string, number> {
  const out: Record<string, number> = {}
  const walk = (n: AnyNode) => {
    out[n.type] = (out[n.type] ?? 0) + 1
    n.children?.forEach(walk)
  }
  walk(tree)
  return out
}

/** Contagem de pares pai>filho: pega nó que mudou de lugar (ex.: parágrafo que sai do item de lista). */
export function parentChildCounts(tree: AnyNode): Record<string, number> {
  const out: Record<string, number> = {}
  const walk = (n: AnyNode) =>
    n.children?.forEach((c) => {
      const k = `${n.type}>${c.type}`
      out[k] = (out[k] ?? 0) + 1
      walk(c)
    })
  walk(tree)
  return out
}

/** Tipos presentes na entrada que sumiram ou diminuíram na saída. Com `counts`, recebe contagens prontas. */
export function lostTypes(before: AnyNode | Record<string, number>, after: AnyNode | Record<string, number>, counts = false) {
  const a = counts ? (before as Record<string, number>) : typeCounts(before as AnyNode)
  const b = counts ? (after as Record<string, number>) : typeCounts(after as AnyNode)
  const lost: string[] = []
  for (const [t, c] of Object.entries(a)) {
    if (t === 'yaml' || t === 'root>yaml') continue // frontmatter fica fora do editor (shell)
    const d = b[t] ?? 0
    if (d < c) lost.push(`${t} ${c}→${d}`)
  }
  const gained: string[] = []
  for (const [t, c] of Object.entries(b)) if ((a[t] ?? 0) < c) gained.push(`${t} ${a[t] ?? 0}→${c}`)
  return { lost, gained }
}
