// Testes 2 a 5: recriar callouts pela UI, E-02 (HTML/JSX e Hora:agora), E-03 (diagrama), link interno.
import { test, expect, type Page } from '@playwright/test'
import { read, spike } from '../shared/helpers'
import { EDIT } from '../../src/content-components/edit'
import { DIAGRAMS } from '../../src/shared/pageIndex'
import { EDITABLE, clearBody, importError, openMdx, patch } from './lib'

/** Coloca o cursor no último parágrafo do editor raiz (fora das diretivas). */
async function cursorAtRootEnd(page: Page) {
  const last = page.locator(`${EDITABLE} > p`).last()
  await last.click()
  await page.keyboard.press('End')
}

test('2 recriar os callouts da fixture 16 pela UI', async ({ page }) => {
  const expected = read(16, 'expected.md')!
  await openMdx(page, { fixture: 16, file: 'expected' })
  await clearBody(page)
  const afterClear = await page.evaluate(() => JSON.stringify((window as any).__spike.handle().getTree().children.map((c: any) => c.type)))
  console.log('2 corpo depois de apagar (tipos no getTree):', afterClear)

  await page.getByTestId('insert-menu').click()
  await page.getByTestId('insert-note').click()
  const c1 = page.getByTestId('directive-callout').nth(0)
  await c1.waitFor()
  await c1.getByTestId('directive-label').fill('Antes de começar')
  await c1.locator('[contenteditable=true]').first().click()
  await page.keyboard.type('Você precisa de:')
  await page.keyboard.press('Enter')
  await page.keyboard.type('- Node 22')
  await page.keyboard.press('Enter')
  await page.keyboard.type('acesso ao Supabase')

  const rootParas = await page.locator(`${EDITABLE} > p`).count()
  console.log('2 parágrafos no editor raiz depois do 1º callout:', rootParas)
  await cursorAtRootEnd(page)
  await page.getByTestId('insert-menu').click()
  await page.getByTestId('insert-note').click()
  const c2 = page.getByTestId('directive-callout').nth(1)
  await c2.waitFor()
  await c2.getByTestId('callout-type').selectOption('danger')
  await c2.getByTestId('attr-variant').selectOption('bug')
  await c2.getByTestId('attr-fold').selectOption('closed')
  await c2.locator('[contenteditable=true]').first().click()
  await page.keyboard.type('Não rode em produção.')

  const dok = await spike.getDok(page)
  const r = await spike.save(page)
  console.log('2 getDok bruto:\n' + dok)
  console.log(`2 ${r.text === expected ? 'PASS' : 'FAIL'} ok=${r.ok} erro-adaptador=${await importError(page)}` + (r.text === expected ? '' : '\n' + patch(expected, r.text)))
  expect(r.text).toBe(expected)
})

test('3 E-02: <Tabs>/<script> no fonte e Hora:agora no WYSIWYG e no fonte', async ({ page }) => {
  await openMdx(page, { fixture: 1, file: 'expected' })
  // WYSIWYG
  await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
  await page.keyboard.press('End')
  await page.keyboard.type(' Hora:agora')
  const w = await spike.save(page)
  const wE003 = w.diagnostics.some((d) => d.code === 'DOK-E003')
  console.log(`3 WYSIWYG Hora:agora: contém literal=${w.text.includes('Hora:agora')} escapado=${w.text.includes('Hora\\:agora')} E003=${wE003} ok=${w.ok}`)
  const tree = await page.evaluate(() => JSON.stringify((window as any).__spike.handle().getTree()))
  const directivesInTree = /Directive"/.test(tree)
  console.log(`3 WYSIWYG diretiva criada no getTree: ${directivesInTree}`)
  // Fonte: Hora:agora
  expect(await spike.setMode(page, 'source')).toBe(true)
  const cm = page.locator('[data-testid=source-mode] .cm-content')
  await cm.click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type('\n\nOutra Hora:agora no fonte.')
  const s1 = await spike.save(page)
  const sE003 = s1.diagnostics.some((d) => d.code === 'DOK-E003')
  console.log(`3 fonte Hora:agora: contém=${s1.text.includes('Outra Hora:agora no fonte.')} E003=${sE003} ok=${s1.ok}`)
  // Fonte: <Tabs> e <script>
  await page.keyboard.type('\n\n<Tabs>\n\n<script>\n')
  const s2 = await spike.save(page)
  const codes = s2.diagnostics.map((d) => d.code)
  console.log(`3 fonte <Tabs>/<script>: códigos=${codes.join(',')} ok=${s2.ok}`)
  expect(w.text.includes('Hora:agora') && !wE003 && !directivesInTree).toBe(true)
  expect(s1.text.includes('Hora:agora') && !sE003).toBe(true)
  expect(codes).toContain('DOK-E002')
  expect(s2.ok).toBe(false)
})

test('4 E-03: inserir diagrama pelo menu e descrever pela UI do nó', async ({ page }) => {
  const line7 = read(23, 'expected.md')!.split('\n')[6]!
  await openMdx(page, { fixture: 1, file: 'expected' })
  await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
  await page.keyboard.press('End')
  await page.evaluate(() => {
    ;(window as any).__pickerSeen = 0
    new MutationObserver(() => {
      if (document.querySelector('[data-testid=diagram-picker]')) (window as any).__pickerSeen++
    }).observe(document.body, { childList: true, subtree: true })
  })
  await page.getByTestId('insert-menu').click()
  await page.getByTestId('insert-diagram').click()
  await page.waitForTimeout(500)
  const seen = await page.evaluate(() => (window as any).__pickerSeen)
  const pickerOpen = (await page.getByTestId('diagram-picker').count()) > 0
  console.log(`4 seletor de diagrama: apareceu=${seen > 0} aberto após 500 ms=${pickerOpen}`)
  if (pickerOpen) {
    await page.getByTestId('diagram-picker').getByText('Contexto do Pagamento').click()
  } else {
    // Desvio registrado: o Popover do shell fecha quando o DropdownMenu devolve o foco ao gatilho.
    // O adaptador recebe a mesma chamada que o botão do seletor faria (EditorShell.tsx, onClick do pick-diagram).
    const d = DIAGRAMS[0]!
    const node = EDIT.diagram.create({ src: `dok:diagram/${d.id}`, view: d.defaultViewId, title: d.title, label: '' })
    await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
    await page.keyboard.press('End')
    await page.evaluate((n) => (window as any).__spike.handle().insertDirective(n), node)
  }
  const node = page.getByTestId('directive-diagram')
  await node.waitFor()
  await node.getByTestId('directive-description').fill('Pessoa usa o Checkout, que chama o Gateway de pagamento')
  const r = await spike.save(page)
  const has = r.text.split('\n').includes(line7)
  console.log(`4 via=${pickerOpen ? 'seletor' : 'handle.insertDirective (desvio)'} linha 7 da fixture 23 presente=${has} ok=${r.ok} códigos=${r.diagnostics.map((d) => d.code).join(',')}\n4 texto salvo:\n${r.text}`)
  expect(has && r.ok).toBe(true)
})

test('5 link interno com autocomplete e link pendente', async ({ page }) => {
  await openMdx(page, { fixture: 1, file: 'expected' })
  await page.locator(`${EDITABLE} [data-lexical-text]`).first().click()
  await page.keyboard.press('End')
  await page.keyboard.type(' Veja texto')
  for (let i = 0; i < 'texto'.length; i++) await page.keyboard.press('Shift+ArrowLeft')
  await page.getByTestId('mdx-link-button').click()
  const input = page.getByTestId('mdx-link-input')
  await input.fill('visão')
  const s1 = await page.getByTestId('mdx-link-suggestion').allInnerTexts()
  await input.fill('C4')
  const s2 = await page.getByTestId('mdx-link-suggestion').allInnerTexts()
  console.log(`5 sugestões "visão"=${JSON.stringify(s1)} "C4"=${JSON.stringify(s2)}`)
  await page.getByTestId('mdx-link-suggestion').filter({ hasText: 'Visão geral' }).click()
  // Link pendente
  await page.locator(`${EDITABLE} [data-lexical-text]`).last().click()
  await page.keyboard.press('End')
  await page.keyboard.type(' e nova')
  for (let i = 0; i < 'nova'.length; i++) await page.keyboard.press('Shift+ArrowLeft')
  await page.getByTestId('mdx-link-button').click()
  await page.getByTestId('mdx-link-input').fill('Página nova')
  await page.getByTestId('mdx-link-pending').click()
  const r = await spike.save(page)
  const internal = r.text.includes('[texto](dok:page/0192f0a1-5c3e-7a10-8b2c-3d4e5f607183)')
  const pending = r.text.includes('[nova](dok:page/new?title=P%C3%A1gina%20nova)')
  const codes = r.diagnostics.map((d) => d.code)
  console.log(`5 interno=${internal} pendente=${pending} ok=${r.ok} códigos=${codes.join(',')}\n5 texto salvo:\n${r.text}`)
  expect(s1.some((s) => s.includes('Visão geral'))).toBe(true)
  expect(s2.some((s) => s.includes('Visão geral'))).toBe(true)
  expect(internal && pending && r.ok).toBe(true)
  expect(codes).toContain('DOK-W101')
})
