// Testes 6 (tema por token), 7 (E-07 rota lazy), 11 (E-13 somente leitura) e 12 (portais Radix).
import { test, expect, type Page } from '@playwright/test'
import { collectErrors, spike } from '../shared/helpers'
import { EDITABLE, openMdx } from './lib'

async function themeProbe(page: Page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-testid=wysiwyg] .dok-mdx-content') as HTMLElement
    const probe = document.createElement('div')
    probe.style.color = 'var(--foreground)'
    probe.style.background = 'var(--background)'
    document.body.appendChild(probe)
    const p = getComputedStyle(probe)
    const e = getComputedStyle(el)
    const out = { editColor: e.color, editBg: e.backgroundColor, tokenFg: p.color, tokenBg: p.backgroundColor }
    probe.remove()
    return out
  })
}

test('6 tema por token e movimento reduzido', async ({ page }) => {
  await openMdx(page, { fixture: 16, file: 'expected' })
  await page.evaluate(() => document.documentElement.classList.replace('theme-dark', 'theme-light') || document.documentElement.classList.add('theme-light'))
  const light = await themeProbe(page)
  await page.evaluate(() => {
    document.documentElement.classList.remove('theme-light')
    document.documentElement.classList.add('theme-dark')
  })
  const dark = await themeProbe(page)
  console.log(`6 claro=${JSON.stringify(light)}\n6 escuro=${JSON.stringify(dark)}`)
  console.log('6 CSS de tema sobrescrito: src/editors/mdxeditor/adapter.css, 1 regra (.dok-mdx .dok-mdx-content) sobre ._contentEditable_er3ed_379 {color: var(--baseTextContrast)} do @mdxeditor/editor/style.css')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const motion = await page.evaluate(() => {
    const ms = (v: string) => Math.max(...v.split(',').map((s) => (s.trim().endsWith('ms') ? parseFloat(s) : parseFloat(s) * 1000)))
    const offenders: string[] = []
    const els = [document.querySelector('[data-testid=wysiwyg]')!, ...document.querySelectorAll('[data-testid=wysiwyg] *')]
    for (const el of els) {
      const cs = getComputedStyle(el)
      const t = ms(cs.transitionDuration)
      const a = cs.animationName !== 'none' ? ms(cs.animationDuration) : 0
      if (t > 0.01 || a > 0.01) offenders.push(`${el.tagName}.${(el as HTMLElement).className} t=${t} a=${a}`)
    }
    return { total: els.length, offenders }
  })
  console.log(`6 movimento reduzido: elementos=${motion.total} acima de 0,01 ms=${JSON.stringify(motion.offenders)}`)
  expect(light.editColor).toBe(light.tokenFg)
  expect(light.editBg).toBe(light.tokenBg)
  expect(dark.editColor).toBe(dark.tokenFg)
  expect(dark.editBg).toBe(dark.tokenBg)
  expect(dark.editColor).not.toBe(light.editColor)
  expect(motion.offenders).toEqual([])
})

test('7 E-07 rota lazy: landing sem chunk do editor, navegação de cliente e carga direta sem erro', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (r) => requests.push(r.url()))
  const errors = collectErrors(page)
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const editorChunks = requests.filter((u) => /@mdxeditor|lexical|src\/editors\/|codemirror|platejs|slate/i.test(u))
  const routeModules = requests.filter((u) => /src\/routes\/edit\./.test(u))
  console.log(`7 landing: requisições=${requests.length} chunks de editor=${JSON.stringify(editorChunks)} módulos de rota (sem o adaptador, que é React.lazy)=${JSON.stringify(routeModules)}`)
  const landingErrors = [...errors]
  requests.length = 0
  await page.getByRole('link', { name: 'MDXEditor' }).click()
  await page.waitForFunction(() => (window as any).__spike?.handle?.() != null)
  await page.locator(EDITABLE).first().waitFor()
  await page.waitForLoadState('networkidle')
  const clientChunks = requests.filter((u) => /mdxeditor|lexical/i.test(u)).length
  const clientErrors = [...errors]
  await page.goto('/edit/mdxeditor')
  await page.waitForFunction(() => (window as any).__spike?.handle?.() != null)
  await page.locator(EDITABLE).first().waitFor()
  await page.waitForLoadState('networkidle')
  console.log(`7 navegação de cliente: requisições do editor=${clientChunks} erros=${JSON.stringify(clientErrors)}\n7 carga direta: erros acumulados=${JSON.stringify(errors)} landing=${JSON.stringify(landingErrors)}`)
  expect(editorChunks).toEqual([])
  expect(clientChunks).toBeGreaterThan(0)
  expect(errors).toEqual([])
})

test('11 E-13 somente leitura e banner', async ({ page }) => {
  await openMdx(page, { fixture: 16, file: 'expected', readOnly: 1 })
  const before = await spike.getDok(page)
  const ce = await page.locator('[data-testid=wysiwyg] .dok-mdx-content').getAttribute('contenteditable')
  const nestedCe = await page.locator('[data-testid=wysiwyg] .dok-mdx-content [contenteditable]').evaluateAll((els) => els.map((e) => e.getAttribute('contenteditable')))
  const inputsEnabled = await page.locator('[data-testid=wysiwyg] input:not([disabled]), [data-testid=wysiwyg] select:not([disabled])').count()
  await page.locator('[data-testid=wysiwyg] .dok-mdx-content').click()
  await page.keyboard.type('xyz')
  await page.locator('[data-testid=wysiwyg] .dok-mdx-content [data-lexical-text]').first().click({ force: true })
  await page.keyboard.type('abc')
  const after = await spike.getDok(page)
  const menu = await page.getByTestId('insert-menu').count()
  const linkUi = await page.getByTestId('mdx-link-button').count()
  console.log(`11 contenteditable raiz=${ce} aninhados=${JSON.stringify(nestedCe)} campos habilitados=${inputsEnabled} getDok inalterado=${before === after} menu Inserir=${menu} UI de link=${linkUi}`)
  await openMdx(page, { fixture: 1, file: 'expected', changesRequested: 1 })
  const banner = await page.getByTestId('banner-changes-requested').isVisible()
  console.log(`11 banner changes_requested visível=${banner}`)
  expect(ce).not.toBe('true')
  expect(nestedCe.every((v) => v !== 'true')).toBe(true)
  expect(inputsEnabled).toBe(0)
  expect(before).toBe(after)
  expect(menu).toBe(0)
  expect(banner).toBe(true)
})

test('12 portal Radix do menu Inserir sobre o editor', async ({ page }) => {
  await openMdx(page, { fixture: 16, file: 'expected' })
  await page.getByTestId('insert-menu').click()
  const content = page.getByTestId('insert-menu-content')
  await content.waitFor()
  const info = await page.evaluate(() => {
    const menu = document.querySelector('[data-testid=insert-menu-content]') as HTMLElement
    const r = menu.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    const items = [...menu.querySelectorAll('[role=menuitem]')].map((i) => {
      const b = i.getBoundingClientRect()
      const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
      return !!h && i.contains(h)
    })
    return {
      rect: [r.left, r.top, r.width, r.height],
      inViewport: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      onTop: !!hit && menu.contains(hit),
      itemsOnTop: items,
      portal: menu.closest('[data-testid=wysiwyg]') === null,
      overEditor: (() => {
        const ed = document.querySelector('[data-testid=wysiwyg]')!.getBoundingClientRect()
        return !(r.right < ed.left || r.left > ed.right || r.bottom < ed.top || r.top > ed.bottom)
      })(),
    }
  })
  await page.keyboard.press('Escape')
  const focusBack = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
  console.log(`12 menu=${JSON.stringify(info)} foco após Escape=${focusBack}`)
  expect(info.onTop && info.inViewport && info.itemsOnTop.every(Boolean)).toBe(true)
  expect(focusBack).toBe('insert-menu')
})
