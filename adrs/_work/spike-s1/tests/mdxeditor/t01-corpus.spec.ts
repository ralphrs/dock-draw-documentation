// Teste 1 (E-01): corpus fixo, partes A, B e C.
import { test, expect } from '@playwright/test'
import { T1_CANONICAL_INPUT, T1_ERROR, T1_EXPECTED } from '../../src/shared/corpus'
import { entry, read, spike } from '../shared/helpers'
import { importError, openMdx, pad, patch, trivialEdit } from './lib'

test.describe('1A expected.md', () => {
  for (const n of T1_EXPECTED) {
    test(`1A ${pad(n)}`, async ({ page }) => {
      const expected = read(n, 'expected.md')!
      await openMdx(page, { fixture: n, file: 'expected' })
      await trivialEdit(page)
      const err = await importError(page)
      const r = await spike.save(page)
      const ok = r.text === expected
      console.log(`1A ${pad(n)} ${ok ? 'PASS' : 'FAIL'}${err ? ` erro-adaptador="${err}"` : ''}${ok ? '' : '\n' + patch(expected, r.text)}`)
      expect(r.text).toBe(expected)
    })
  }
})

test.describe('1B input.md canonical', () => {
  for (const n of T1_CANONICAL_INPUT) {
    test(`1B ${pad(n)}`, async ({ page }) => {
      const expected = read(n, 'expected.md')!
      await openMdx(page, { fixture: n, file: 'input' })
      await trivialEdit(page)
      const err = await importError(page)
      const r = await spike.save(page)
      const ok = r.text === expected
      console.log(`1B ${pad(n)} ${ok ? 'PASS' : 'FAIL'}${err ? ` erro-adaptador="${err}"` : ''}${ok ? '' : '\n' + patch(expected, r.text)}`)
      expect(r.text).toBe(expected)
    })
  }
})

test.describe('1C fixtures de erro', () => {
  for (const n of T1_ERROR) {
    test(`1C ${pad(n)}`, async ({ page }) => {
      const input = read(n, 'input.md')!
      await openMdx(page, { fixture: n, file: 'input' })
      const a = (await spike.mode(page)) === 'source' && (await page.locator('[data-testid=mdx-adapter]').count()) === 0
      const b = await page.getByTestId('diagnostics').isVisible()
      const c1 = (await spike.sourceText(page)) === input
      const back = await spike.setMode(page, 'wysiwyg')
      const c2 = back === false && (await spike.sourceText(page)) === input && (await page.locator('[data-testid=mdx-adapter]').count()) === 0
      const r = await spike.save(page)
      const codes = [...new Set(r.diagnostics.map((d) => d.code).filter((c) => c.startsWith('DOK-E')))].sort()
      const want = [...entry(n).errors].sort()
      const d = JSON.stringify(codes) === JSON.stringify(want)
      console.log(`1C ${pad(n)} a=${a} b=${b} c=${c1 && c2} (setMode=${back}) d=${d} códigos=${codes.join(',')} manifest=${want.join(',')}`)
      expect([a, b, c1, c2, d]).toEqual([true, true, true, true, true])
    })
  }
})
