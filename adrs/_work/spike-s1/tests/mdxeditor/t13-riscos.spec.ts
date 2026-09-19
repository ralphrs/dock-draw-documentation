// Teste 13: riscos específicos do MDXEditor 4.2.5. "sem mitigação" = localStorage spike-mdx-sem-mitigacao=1
// (callouts pelo AdmonitionDirectiveDescriptor oficial, sem ilhas opacas, sem bloqueio de formatos).
import { test, expect, type Page } from '@playwright/test'
import { read, spike } from '../shared/helpers'
import { EDITABLE, importError, openMdx, paste } from './lib'

const RAW = 'spike-mdx-sem-mitigacao'
const semMitigacao = (page: Page) => page.addInitScript((k) => localStorage.setItem(k, '1'), RAW)
/** localStorage é do contexto: a página sem mitigação precisa limpar a chave antes de fechar. */
const closeRaw = async (p: Page) => {
  await p.evaluate((k) => localStorage.removeItem(k), RAW)
  await p.close()
}
const TAGS = /<\/?(u|sup|sub|span)\b[^>]*>/g

async function labelAfterEdit(page: Page) {
  await openMdx(page, { fixture: 16, file: 'expected' })
  await page.locator(EDITABLE).first().getByText('Você precisa de:').click()
  await page.keyboard.press('End')
  await page.keyboard.type(' agora')
  await page.locator('[data-testid=save]').focus() // blur do editor aninhado, como no uso real
  const r = await spike.save(page)
  return r
}

test('13a rótulo [..] do callout depois de editar o conteúdo', async ({ page }) => {
  const r = await labelAfterEdit(page)
  const kept = r.text.includes(':::note[Antes de começar]\nVocê precisa de: agora\n')
  console.log(`13a com descriptor próprio: rótulo preservado=${kept} ok=${r.ok}\n${r.text.split('\n').slice(5, 12).join('\n')}`)
  expect(kept).toBe(true)
})

test('13a' + ' sem mitigação (AdmonitionDirectiveDescriptor oficial)', async ({ page }) => {
  await semMitigacao(page)
  const r = await labelAfterEdit(page)
  const kept = r.text.includes(':::note[Antes de começar]')
  console.log(`13a oficial: rótulo preservado=${kept} ok=${r.ok}\n${r.text.split('\n').slice(5, 13).join('\n')}`)
})

async function underline(page: Page) {
  await openMdx(page, { fixture: 1, file: 'expected' })
  await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('ControlOrMeta+U')
  await page.keyboard.type(' sublinhado')
  await page.keyboard.press('ControlOrMeta+U')
  await page.keyboard.press('Enter')
  await paste(page, { text: 'antes colado depois', html: '<p>antes <u>colado</u> <sup>2</sup> <sub>x</sub> <span style="color:red">depois</span></p>' })
  const r = await spike.save(page)
  return { r, tags: r.text.match(TAGS) ?? [] }
}

test('13b sublinhado (Mod+U) e colar HTML com <u>/<sup>/<sub>/<span style>', async ({ page }) => {
  const { r, tags } = await underline(page)
  console.log(`13b com bloqueio: tags no save=${JSON.stringify(tags)} ok=${r.ok} códigos=${r.diagnostics.map((d) => d.code).join(',')}\n${r.text}`)
  expect(tags).toEqual([])
  expect(r.ok).toBe(true)
})

test('13b sem mitigação (FORMAT_TEXT_COMMAND livre)', async ({ page }) => {
  await semMitigacao(page)
  const { r, tags } = await underline(page)
  console.log(`13b sem bloqueio: tags no save=${JSON.stringify(tags)} ok=${r.ok} códigos=${r.diagnostics.map((d) => d.code).join(',')}\n${r.text}`)
})

test('13b colar text/plain com tags literais (o stub degrada para parseDok)', async ({ page }) => {
  await openMdx(page, { fixture: 1, file: 'expected' })
  await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await paste(page, { text: 'antes <u>sub</u> e <sup>2</sup> depois' })
  const trySave = async () => {
    try {
      return await spike.save(page)
    } catch (e) {
      return { ok: false, text: '', diagnostics: [], crash: String((e as Error).message).split('\n')[0] }
    }
  }
  const r1: any = await trySave()
  const e1 = await importError(page)
  await page.keyboard.press('Enter')
  await paste(page, { text: 'com <span style="color:red">span</span> fim' })
  const e2 = await importError(page)
  const r2: any = await trySave()
  console.log(`13b text/plain <u>/<sup>: tags=${JSON.stringify(r1.text.match(TAGS) ?? [])} ok=${r1.ok} códigos=${r1.diagnostics.map((d: any) => d.code).join(',')} erro-adaptador=${e1} exceção no save=${r1.crash ?? 'nenhuma'}`)
  console.log(`13b text/plain <span style>: erro-adaptador=${e2} tags=${JSON.stringify(r2.text.match(TAGS) ?? [])} ok=${r2.ok} exceção no save=${r2.crash ?? 'nenhuma'}`)
  console.log(`13b getTree após colar: ${await page.evaluate(() => { try { return JSON.stringify((window as any).__spike.handle().getTree().children.slice(1)).slice(0, 600) } catch (e) { return 'exceção: ' + (e as Error).message } })}`)
})

test('13c notas de rodapé (fixture 09) com e sem ilha opaca', async ({ page }) => {
  await openMdx(page, { fixture: 9, file: 'expected' })
  const opaque = await page.getByTestId('dok-opaque').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-type')}:${e.textContent}`))
  const editable = await page.getByTestId('dok-opaque').evaluateAll((els) => els.map((e) => e.getAttribute('contenteditable')))
  const r = await spike.save(page)
  console.log(`13c com ilha opaca: nós=${JSON.stringify(opaque)} contenteditable=${JSON.stringify(editable)} save igual=${r.text === read(9, 'expected.md')}`)
  const p2 = await page.context().newPage()
  await semMitigacao(p2)
  await openMdx(p2, { fixture: 9, file: 'expected' })
  const err = await importError(p2)
  const r2 = await spike.save(p2)
  console.log(`13c sem ilha opaca: erro-adaptador=${err} save igual=${r2.text === read(9, 'expected.md')}\n${r2.text}`)
  await closeRaw(p2)
  expect(r.text).toBe(read(9, 'expected.md'))
})

test('13d autolink literal digitado e link por referência (fixture 14 input) sem ilha opaca', async ({ page }) => {
  await openMdx(page, { fixture: 1, file: 'expected' })
  await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
  await page.keyboard.press('End')
  await page.keyboard.type(' veja https://exemplo.com.br/doc e fim')
  const r = await spike.save(page)
  console.log(`13d autolink digitado: ${JSON.stringify(r.text.split('\n').at(-2))} ok=${r.ok}`)
  const p2 = await page.context().newPage()
  await semMitigacao(p2)
  await openMdx(p2, { fixture: 14, file: 'input' })
  console.log(`13d fixture 14 input sem ilha opaca: erro-adaptador=${await importError(p2)}`)
  await closeRaw(p2)
  await openMdx(page, { fixture: 14, file: 'input' })
  const refs = await page.getByTestId('dok-opaque').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-type')}:${e.textContent}`))
  console.log(`13d fixture 14 input com ilha opaca: nós=${JSON.stringify(refs)}`)
})

test('13e parágrafo vazio acrescentado no fim', async ({ page }) => {
  for (const n of [20, 23, 16]) {
    await openMdx(page, { fixture: n, file: 'expected' })
    const tail = await page.evaluate(() => {
      const t = (window as any).__spike.handle().getTree()
      const last = t.children.at(-1)
      return { tipos: t.children.map((c: any) => c.type), ultimoVazio: last?.type === 'paragraph' && last.children.length === 0 }
    })
    const dok = await spike.getDok(page)
    const r = await spike.save(page)
    console.log(`13e ${n}: getTree=${JSON.stringify(tail)} getDok termina com ${JSON.stringify(dok.slice(-6))} save igual=${r.text === read(n, 'expected.md')}`)
    expect(r.text).toBe(read(n, 'expected.md'))
  }
})

test('13f <img src=x onerror> no modo fonte e colado', async ({ page }) => {
  await openMdx(page, { fixture: 1, file: 'expected' })
  expect(await spike.setMode(page, 'source')).toBe(true)
  await page.locator('[data-testid=source-mode] .cm-content').click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type('\n\n<img src=x onerror="window.__pwned=1">\n')
  await page.waitForTimeout(500)
  const back = await spike.setMode(page, 'wysiwyg')
  await page.waitForTimeout(500)
  const s = await spike.save(page)
  const pwned1 = await page.evaluate(() => (window as any).__pwned)
  // Colado no WYSIWYG como text/plain: o stub devolve parseDok(texto) com nó html.
  await openMdx(page, { fixture: 1, file: 'expected' })
  await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await paste(page, { text: '<img src=x onerror="window.__pwned2=1">' })
  await page.waitForTimeout(500)
  const pwned2 = await page.evaluate(() => (window as any).__pwned2)
  const err = await importError(page)
  const imgs = await page.locator('[data-testid=wysiwyg] img').count()
  console.log(`13f fonte: setMode(wysiwyg)=${back} save ok=${s.ok} códigos=${s.diagnostics.map((d) => d.code).join(',')} __pwned=${pwned1}`)
  console.log(`13f colado: __pwned2=${pwned2} erro-adaptador=${err} <img> no editor=${imgs}`)
  expect(back).toBe(false)
  expect(s.diagnostics.map((d) => d.code)).toContain('DOK-E002')
  expect(pwned1).toBeUndefined()
  expect(pwned2).toBeUndefined()
})
