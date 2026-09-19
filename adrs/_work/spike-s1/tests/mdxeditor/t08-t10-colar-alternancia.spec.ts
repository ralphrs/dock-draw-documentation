// Testes 8 (colar Google Docs / GitHub), 9 (D-2: colar input.md das fixtures import) e 10 (alternância D-5).
import { test, expect } from '@playwright/test'
import { D2_IMPORT, T1_EXPECTED } from '../../src/shared/corpus'
import { read, spike } from '../shared/helpers'
import { EDITABLE, clearBody, importError, openMdx, pad, paste, patch } from './lib'

const GDOCS_HTML =
  '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1a2b"><p dir="ltr" style="line-height:1.38"><span style="font-size:11pt;font-weight:700;color:#000000">Título do doc</span></p>' +
  '<ul style="margin-top:0"><li dir="ltr"><p dir="ltr"><span style="font-size:11pt">item um</span></p></li><li dir="ltr"><p dir="ltr"><span style="font-size:11pt">item dois</span></p></li></ul></b>'
const GDOCS_TEXT = 'Título do doc\nitem um\nitem dois'
const GH_HTML = '<h2>Instalação</h2><ul><li><code>npm i</code></li><li>depois <strong>rode</strong></li></ul>'
const GH_TEXT = '## Instalação\n\n- `npm i`\n- depois **rode**\n'
const HTML_OR_JSX = /<\/?[A-Za-z][^>]*>/

test('8 colar trecho do Google Docs e do GitHub', async ({ page }) => {
  await openMdx(page, { fixture: 1, file: 'expected' })
  await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  const before = (await spike.importCalls(page)).length
  await paste(page, { text: GDOCS_TEXT, html: GDOCS_HTML })
  const afterG = (await spike.importCalls(page)).length
  await page.keyboard.press('Enter')
  await paste(page, { text: GH_TEXT, html: GH_HTML })
  const afterH = (await spike.importCalls(page)).length
  const calls = await page.evaluate(() => ((window as any).__importCalls ?? []).map((c: any) => ({ html: !!c.html, text: c.text.slice(0, 30), matched: c.matchedFixture })))
  const r = await spike.save(page)
  const hasHtml = HTML_OR_JSX.test(r.text.replace(/^---[\s\S]*?---\n/, ''))
  console.log(`8 chamadas importDialect: gdocs=${afterG - before} github=${afterH - afterG} detalhe=${JSON.stringify(calls)}`)
  console.log(`8 save ok=${r.ok} códigos=${r.diagnostics.map((d) => d.code).join(',')} contém HTML/JSX=${hasHtml} erro-adaptador=${await importError(page)}\n8 texto salvo:\n${r.text}`)
  expect(afterG - before).toBe(1)
  expect(afterH - afterG).toBe(1)
  expect(r.text).toContain('item um')
  expect(r.text).toContain('## Instalação')
  expect(hasHtml).toBe(false)
  expect(r.ok).toBe(true)
})

test.describe('9 D-2 colar input.md das fixtures import', () => {
  for (const n of D2_IMPORT) {
    test(`9 D-2 ${pad(n)}`, async ({ page }) => {
      const input = read(n, 'input.md')!
      const expected = read(n, 'expected.md')!
      await openMdx(page, { fixture: n, file: 'expected' })
      await clearBody(page)
      await paste(page, { text: input })
      const calls = await spike.importCalls(page)
      const last = calls.at(-1)
      const r = await spike.save(page)
      const ok = r.text === expected && last?.matchedFixture === n
      console.log(`9 D-2 ${pad(n)} ${ok ? 'PASS' : 'FAIL'} chamadas=${calls.length} casada=${last?.matchedFixture ?? 'nenhuma'} erro-adaptador=${await importError(page)}` + (r.text === expected ? '' : '\n' + patch(expected, r.text)))
      expect(last?.matchedFixture).toBe(n)
      expect(r.text).toBe(expected)
    })
  }
})

test.describe('10 alternância WYSIWYG → fonte → WYSIWYG', () => {
  for (const n of T1_EXPECTED) {
    test(`10 ${pad(n)}`, async ({ page }) => {
      const expected = read(n, 'expected.md')!
      await openMdx(page, { fixture: n, file: 'expected' })
      const a = await spike.setMode(page, 'source')
      const b = await spike.setMode(page, 'wysiwyg')
      await page.waitForFunction(() => (window as any).__spike.handle() !== null)
      await page.locator(EDITABLE).first().waitFor()
      await page.waitForTimeout(150)
      const r = await spike.save(page)
      const ok = r.text === expected
      console.log(`10 ${pad(n)} ${ok ? 'PASS' : 'FAIL'} setMode(source)=${a} setMode(wysiwyg)=${b} erro-adaptador=${await importError(page)}` + (ok ? '' : '\n' + patch(expected, r.text)))
      expect(r.text).toBe(expected)
    })
  }

  test('10 editar no fonte e voltar', async ({ page }) => {
    await openMdx(page, { fixture: 1, file: 'expected' })
    expect(await spike.setMode(page, 'source')).toBe(true)
    await page.locator('[data-testid=source-mode] .cm-content').click()
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n\nParágrafo novo vindo do fonte.')
    expect(await spike.setMode(page, 'wysiwyg')).toBe(true)
    await page.locator(EDITABLE).first().waitFor()
    const visible = await page.locator(EDITABLE).first().getByText('Parágrafo novo vindo do fonte.').isVisible()
    const r = await spike.save(page)
    const inSave = r.text.includes('\n\nParágrafo novo vindo do fonte.\n')
    console.log(`10 editar no fonte: visível no WYSIWYG=${visible} no save=${inSave} ok=${r.ok}`)
    expect(visible && inSave && r.ok).toBe(true)
  })
})
