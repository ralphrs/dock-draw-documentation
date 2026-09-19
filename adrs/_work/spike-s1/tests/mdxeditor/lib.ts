// Utilidades dos testes do MDXEditor (sobre tests/shared/helpers.ts).
import type { Page } from '@playwright/test'
import { createTwoFilesPatch } from 'diff'
import { openEditor } from '../shared/helpers'

export const EDITABLE = '[data-testid=wysiwyg] .mdxeditor [contenteditable=true]'

/** Abre o editor e espera o adaptador entregar o handle e a área editável aparecer. */
export async function openMdx(page: Page, q: Record<string, string | number>) {
  await openEditor(page, 'mdxeditor', q)
  const mode = await page.evaluate(() => (window as any).__spike.mode())
  if (mode === 'wysiwyg') {
    await page.waitForFunction(() => (window as any).__spike.handle() !== null)
    await page.locator('[data-testid=wysiwyg] .mdxeditor [contenteditable]').first().waitFor()
    await page.waitForTimeout(150) // editores aninhados montam num efeito posterior
  }
}

/** Edição trivial: cursor no primeiro texto do editor (ou na área editável), digita x e apaga. */
export async function trivialEdit(page: Page) {
  const text = page.locator(`${EDITABLE} [data-lexical-text]`).first()
  if (await text.count()) {
    await text.click()
    await page.keyboard.press('End')
  } else {
    await page.locator(EDITABLE).first().click()
  }
  await page.keyboard.type('x')
  await page.keyboard.press('Backspace')
}

export async function importError(page: Page) {
  const el = page.getByTestId('mdx-import-error')
  return (await el.count()) ? await el.innerText() : null
}

export const patch = (expected: string, got: string) =>
  createTwoFilesPatch('esperado', 'obtido', expected, got, '', '', { context: 2 })

export const pad = (n: number) => String(n).padStart(2, '0')

/** Apaga o corpo pela UI: cursor no parágrafo final do editor raiz, selecionar tudo, Backspace. */
export async function clearBody(page: Page) {
  const paras = page.locator(`${EDITABLE} > p`)
  let clicked = false
  for (let i = (await paras.count()) - 1; i >= 0 && !clicked; i--) {
    const p = paras.nth(i)
    if (await p.isVisible()) {
      const box = await p.boundingBox()
      if (box && box.height > 0) {
        await p.click()
        clicked = true
      }
    }
  }
  if (!clicked) await page.locator(EDITABLE).first().focus()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.press('Backspace')
}

/** Colar sintético: evento paste com DataTransfer no elemento em foco. */
export async function paste(page: Page, data: { text: string; html?: string }) {
  await page.evaluate(({ text, html }) => {
    const dt = new DataTransfer()
    if (html) dt.setData('text/html', html)
    dt.setData('text/plain', text)
    const el = document.activeElement ?? document.body
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
  }, data)
}
