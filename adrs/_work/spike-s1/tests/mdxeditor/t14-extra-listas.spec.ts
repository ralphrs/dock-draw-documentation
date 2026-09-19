// Trava 2 da parada 4: casos de regressão de listas vizinhas fora do corpus (extra/).
// Escrito antes da correção e por outro autor. O autor da correção não altera este arquivo.
// Cada caso: carga sem edição, alternância WYSIWYG → fonte → WYSIWYG, e edição dentro da última lista.
import { test, expect, type Page } from '@playwright/test'
import { EXTRA_SLUGS, readExtra, spike } from '../shared/helpers'
import { EDITABLE, openMdx, patch } from './lib'

/** Edição dentro da última lista do documento: último texto do editor, digita x e apaga. */
async function editInLastList(page: Page) {
  const texts = page.locator(`[data-testid=wysiwyg] .mdxeditor li [data-lexical-text]`)
  const n = await texts.count()
  const target = n ? texts.nth(n - 1) : page.locator(`${EDITABLE} [data-lexical-text]`).last()
  await target.click()
  await page.keyboard.press('End')
  await page.keyboard.type('x')
  await page.keyboard.press('Backspace')
  return n
}

for (const slug of EXTRA_SLUGS) {
  test.describe(`14 extra ${slug}`, () => {
    test(`14 ${slug} carga`, async ({ page }) => {
      const expected = readExtra(slug)
      await openMdx(page, { extra: slug })
      const r = await spike.save(page)
      console.log(`14 ${slug} carga ${r.text === expected ? 'PASS' : 'FAIL\n' + patch(expected, r.text)}`)
      expect(r.text).toBe(expected)
    })
    test(`14 ${slug} alternância`, async ({ page }) => {
      const expected = readExtra(slug)
      await openMdx(page, { extra: slug })
      await spike.setMode(page, 'source')
      const back = await spike.setMode(page, 'wysiwyg')
      await page.waitForFunction(() => (window as any).__spike.handle() !== null)
      await page.waitForTimeout(200)
      const r = await spike.save(page)
      console.log(`14 ${slug} alternância voltou=${back} ${r.text === expected ? 'PASS' : 'FAIL\n' + patch(expected, r.text)}`)
      expect(back).toBe(true)
      expect(r.text).toBe(expected)
    })
    test(`14 ${slug} edição na última lista`, async ({ page }) => {
      const expected = readExtra(slug)
      await openMdx(page, { extra: slug })
      const items = await editInLastList(page)
      const r = await spike.save(page)
      console.log(`14 ${slug} edição (textos em li=${items}) ${r.text === expected ? 'PASS' : 'FAIL\n' + patch(expected, r.text)}`)
      expect(items).toBeGreaterThan(0)
      expect(r.text).toBe(expected)
    })
  })
}
