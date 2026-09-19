// Testes 6 a 12: tema por token, carga lazy, colar, D-2, alternância, somente leitura, portais Radix.
import { test, expect, type Page } from '@playwright/test'
import { collectErrors, openEditor, read, spike } from '../shared/helpers'
import { D2_IMPORT, T1_EXPECTED } from '../../src/shared/corpus'
import { EDITOR, CONTENT, diffOf } from './util'

const pause = (page: Page, ms = 80) => page.waitForTimeout(ms)

test('6 tema por token e movimento reduzido', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 16, file: 'expected' })
  await page.locator(CONTENT).waitFor()
  const probe = () =>
    page.evaluate(() => {
      const ed = document.querySelector('[data-testid=plate-content]') as HTMLElement
      const ref = document.createElement('div')
      ref.style.color = 'var(--foreground)'
      ref.style.backgroundColor = 'var(--background)'
      document.body.appendChild(ref)
      const want = { color: getComputedStyle(ref).color, background: getComputedStyle(ref).backgroundColor }
      ref.remove()
      const cs = getComputedStyle(ed)
      return { html: document.documentElement.className, color: cs.color, background: cs.backgroundColor, want }
    })
  await page.evaluate(() => (document.documentElement.className = 'theme-light'))
  const light = await probe()
  await page.evaluate(() => (document.documentElement.className = 'theme-dark'))
  const dark = await probe()
  // CSS de tema vindo da biblioteca: folhas e <style> que citem plate/slate.
  const libCss = await page.evaluate(() => {
    const out: string[] = []
    for (const s of Array.from(document.styleSheets)) {
      const owner = s.ownerNode as HTMLElement | null
      const id = (s.href ?? '') + ' ' + (owner?.getAttribute('data-vite-dev-id') ?? '')
      if (/plate|slate/i.test(id)) out.push(`${id} regras=${s.cssRules.length}`)
    }
    return out
  })
  console.log('6 claro:', JSON.stringify(light))
  console.log('6 escuro:', JSON.stringify(dark))
  console.log('6 CSS de biblioteca carregado:', JSON.stringify(libCss))
  expect(light.color).toBe(light.want.color)
  expect(light.background).toBe(light.want.background)
  expect(dark.color).toBe(dark.want.color)
  expect(dark.background).toBe(dark.want.background)
  expect(light.color).not.toBe(dark.color)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const slow = await page.evaluate(() => {
    const toMs = (v: string) => Math.max(...v.split(',').map((x) => (x.trim().endsWith('ms') ? parseFloat(x) : parseFloat(x) * 1000)))
    const els = [document.querySelector('[data-testid=wysiwyg]')!, ...Array.from(document.querySelectorAll('[data-testid=wysiwyg] *'))]
    return els
      .map((e) => ({ tag: e.tagName, t: toMs(getComputedStyle(e).transitionDuration), a: toMs(getComputedStyle(e).animationDuration) }))
      .filter((x) => x.t > 0.01 || x.a > 0.01)
  })
  console.log('6 elementos com transição/animação > 0,01 ms sob reduced motion:', slow.length, JSON.stringify(slow.slice(0, 5)))
  expect(slow).toEqual([])
})

test('7 E-07: landing sem chunk do Plate; navegação de cliente e carga direta sem erro', async ({ page }) => {
  const reqs: string[] = []
  page.on('request', (r) => reqs.push(r.url()))
  const errors = collectErrors(page)
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const lib = (u: string) => /node_modules|\.vite.*deps/.test(u) && /platejs|@platejs|slate/i.test(u)
  const onLanding = reqs.filter(lib)
  const plateAny = reqs.filter((u) => /plate|slate/i.test(u))
  console.log('7 landing: requisições', reqs.length, 'chunks de biblioteca Plate/Slate:', JSON.stringify(onLanding), 'qualquer URL com plate/slate:', JSON.stringify(plateAny))
  expect(onLanding).toEqual([])

  reqs.length = 0
  await page.getByRole('link', { name: 'Plate' }).click()
  await page.locator(CONTENT).waitFor()
  await page.waitForLoadState('networkidle')
  const afterNav = reqs.filter(lib)
  console.log('7 navegação de cliente: chunks Plate/Slate carregados:', afterNav.length, 'erros:', JSON.stringify(errors))
  expect(afterNav.length).toBeGreaterThan(0)
  expect(errors).toEqual([])

  const errors2 = collectErrors(page)
  await page.goto('/edit/plate')
  await page.locator(CONTENT).waitFor()
  await page.waitForLoadState('networkidle')
  console.log('7 carga direta: erros:', JSON.stringify(errors2))
  expect(errors2).toEqual([])
})

/**
 * Colar sintético na sequência do navegador: evento paste com DataTransfer e, se ninguém o cancelou,
 * beforeinput insertFromPaste com o mesmo DataTransfer (o slate-react só trata o paste direto quando o
 * clipboard é só texto; com text/html ele espera o beforeinput).
 */
async function paste(page: Page, data: Record<string, string>) {
  const how = await page.evaluate((data) => {
    const dt = new DataTransfer()
    for (const [k, v] of Object.entries(data)) dt.setData(k, v)
    const target = document.querySelector('[data-testid=plate-content]')!
    const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })
    target.dispatchEvent(ev)
    if (ev.defaultPrevented) return 'paste'
    const bi = new InputEvent('beforeinput', { inputType: 'insertFromPaste', dataTransfer: dt, bubbles: true, cancelable: true })
    target.dispatchEvent(bi)
    return bi.defaultPrevented ? 'beforeinput' : 'nenhum'
  }, data)
  await pause(page, 150)
  return how
}

async function cursorAtEnd(page: Page) {
  await page.locator(`${CONTENT} [data-slate-string]`).last().click()
  await pause(page)
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await pause(page)
}

test('8 colar Google Docs e GitHub passa pela porta importDialect', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
  await cursorAtEnd(page)
  const gdocsHtml =
    '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1"><p dir="ltr"><span style="font-weight:700;">Negrito do Docs</span><span> e texto</span></p><ul><li dir="ltr"><p><span>item docs</span></p></li></ul></b>'
  const gdocsText = 'Negrito do Docs e texto\n\n* item docs'
  const how1 = await paste(page, { 'text/html': gdocsHtml, 'text/plain': gdocsText })
  console.log('8 Google Docs tratado por:', how1)
  const c1 = await spike.importCalls(page)
  await cursorAtEnd(page)
  const ghHtml = '<p>Texto do <code>GitHub</code></p>\n<ul>\n<li>item gh</li>\n</ul>'
  const ghText = 'Texto do `GitHub`\n\n- item gh'
  const how2 = await paste(page, { 'text/html': ghHtml, 'text/plain': ghText })
  console.log('8 GitHub tratado por:', how2)
  const c2 = await spike.importCalls(page)
  const calls = await page.evaluate(() => ((window as any).__importCalls ?? []).map((c: any) => ({ text: c.text.slice(0, 40), html: !!c.html })))
  const r = await spike.save(page)
  const hasHtml = /<\/?(b|span|p|ul|li|meta|code)\b/i.test(r.text)
  console.log('8 chamadas:', c1.length, '→', c2.length, JSON.stringify(calls), 'save.ok=', r.ok, 'HTML/JSX no save=', hasHtml, '\n' + r.text)
  expect(c1.length).toBe(1)
  expect(c2.length).toBe(2)
  expect(r.text).toContain('Negrito do Docs')
  expect(r.text).toContain('item gh')
  expect(hasHtml).toBe(false)
  expect(r.ok).toBe(true)

  // Só text/html (sem text/plain): quem trata? O parser do adaptador também declara text/html.
  await cursorAtEnd(page)
  const how3 = await paste(page, { 'text/html': '<p><b>só html</b></p>' })
  console.log('8 só text/html tratado por:', how3)
  const c3 = await spike.importCalls(page)
  const r3 = await spike.save(page)
  console.log('8 só text/html: chamadas=', c3.length, 'save contém "só html"=', r3.text.includes('só html'), 'HTML no save=', /<\/?(b|p)\b/.test(r3.text))
  expect(c3.length).toBe(3)
})

async function clearBody(page: Page) {
  const str = page.locator(`${CONTENT} [data-slate-string]`).first()
  if (await str.count()) await str.click()
  else await page.locator(CONTENT).click()
  await pause(page)
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ControlOrMeta+a')
    await pause(page, 40)
    await page.keyboard.press('Backspace')
    await pause(page)
    const ok = await page.evaluate(() => {
      const e = (window as any).__plateEditor
      return e.children.length === 1 && e.children[0].type === 'p' && e.api.string([]) === ''
    })
    if (ok) return true
  }
  return false
}

for (const n of D2_IMPORT) {
  test(`9 D-2 fixture ${n}: apagar e colar o input.md`, async ({ page }) => {
    await openEditor(page, EDITOR, { fixture: n, file: 'expected' })
    await page.locator(CONTENT).waitFor()
    const cleared = await clearBody(page)
    const before = (await spike.importCalls(page)).length
    await paste(page, { 'text/plain': read(n, 'input.md')! })
    const calls = await spike.importCalls(page)
    const last = calls.at(-1)
    const expected = read(n, 'expected.md')!
    const r = await spike.save(page)
    const pass = r.text === expected && last?.matchedFixture === n && calls.length === before + 1
    console.log(`9 ${n}: ${pass ? 'ok' : 'FALHA'} corpo vazio=${cleared} chamadas=${calls.length - before} matched=${last?.matchedFixture}${r.text === expected ? '' : '\n' + diffOf(expected, r.text)}`)
    expect(calls.length).toBe(before + 1)
    expect(last?.matchedFixture).toBe(n)
    expect(r.text).toBe(expected)
  })
}

for (const n of T1_EXPECTED) {
  test(`10 D-5 alternância fixture ${String(n).padStart(2, '0')}`, async ({ page }) => {
    await openEditor(page, EDITOR, { fixture: n, file: 'expected' })
    await page.locator(CONTENT).waitFor()
    expect(await spike.setMode(page, 'source')).toBe(true)
    expect(await spike.setMode(page, 'wysiwyg')).toBe(true)
    await page.locator(CONTENT).waitFor()
    const expected = read(n, 'expected.md')!
    const r = await spike.save(page)
    const pass = r.text === expected
    console.log(`10 ${n}: ${pass ? 'ok' : 'FALHA'}${pass ? '' : '\n' + diffOf(expected, r.text)}`)
    expect(r.text).toBe(expected)
  })
}

test('10 D-5 edição no fonte aparece no WYSIWYG e no save', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 16, file: 'expected' })
  await spike.setMode(page, 'source')
  await page.locator('[data-testid=source-mode] .cm-content').click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type('\nParágrafo novo no fonte.\n')
  expect(await spike.setMode(page, 'wysiwyg')).toBe(true)
  await page.locator(CONTENT).waitFor()
  const visible = await page.locator(CONTENT).getByText('Parágrafo novo no fonte.').isVisible()
  const r = await spike.save(page)
  console.log('10 edição no fonte: visível no WYSIWYG=', visible, 'no save=', r.text.includes('Parágrafo novo no fonte.'))
  expect(visible).toBe(true)
  expect(r.text).toContain('\nParágrafo novo no fonte.\n')
})

test('11 E-13 somente leitura e banner', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 16, file: 'expected', readOnly: 1 })
  await page.locator(CONTENT).waitFor()
  const before = await spike.getDok(page)
  await page.locator(`${CONTENT} [data-slate-string]`).first().click()
  await page.keyboard.type('abc')
  await page.keyboard.press('Backspace')
  const after = await spike.getDok(page)
  const ce = await page.locator(CONTENT).getAttribute('contenteditable')
  const menu = await page.getByTestId('insert-menu').count()
  const inputsDisabled = await page.locator('[data-testid=wysiwyg] select, [data-testid=wysiwyg] input').evaluateAll((els) => els.every((e) => (e as HTMLInputElement).disabled))
  console.log('11 readOnly: getDok igual=', before === after, 'contenteditable=', ce, 'menu Inserir=', menu, 'campos da UI do nó desabilitados=', inputsDisabled)
  expect(after).toBe(before)
  expect(ce).not.toBe('true')
  expect(menu).toBe(0)

  await openEditor(page, EDITOR, { fixture: 16, file: 'expected', changesRequested: 1 })
  const banner = await page.getByTestId('banner-changes-requested').isVisible()
  console.log('11 changesRequested: banner visível=', banner)
  expect(banner).toBe(true)
})

test('12 portal Radix do menu Inserir sobre o editor', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 16, file: 'expected' })
  await page.locator(CONTENT).waitFor()
  await page.getByTestId('insert-menu').click()
  const menu = page.getByTestId('insert-menu-content')
  await menu.waitFor()
  const box = (await menu.boundingBox())!
  const vp = page.viewportSize()!
  const onTop = await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-testid=insert-menu-content]'), { x: box.x + box.width / 2, y: box.y + box.height / 2 })
  const clipped = await menu.evaluate((el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
  const inViewport = box.x >= 0 && box.y >= 0 && box.x + box.width <= vp.width && box.y + box.height <= vp.height
  await page.keyboard.press('Escape')
  await pause(page, 150)
  const focus = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
  console.log('12 menu no topo=', onTop, 'cortado=', clipped, 'dentro da viewport=', inViewport, 'foco após Escape=', focus, 'caixa=', JSON.stringify(box))
  expect(onTop).toBe(true)
  expect(clipped).toBe(false)
  expect(inViewport).toBe(true)
  expect(focus).toBe('insert-menu')
})
