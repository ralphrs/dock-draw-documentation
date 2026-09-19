// Testes 2 a 5: recriação de callouts pela UI, E-02, diagrama pela UI, link interno com autocomplete.
import { test, expect, type Page } from '@playwright/test'
import { openEditor, read, spike } from '../shared/helpers'
import { EDITOR, CONTENT, diffOf } from './util'

const pause = (page: Page, ms = 80) => page.waitForTimeout(ms)

async function clearBody(page: Page) {
  await page.locator(`${CONTENT} [data-slate-string]`).first().click()
  await pause(page)
  await page.keyboard.press('ControlOrMeta+a')
  await pause(page)
  await page.keyboard.press('Backspace')
  await pause(page)
  // Slate pode deixar a casca de um container: apaga até sobrar um único bloco vazio.
  for (let i = 0; i < 5; i++) {
    const n = await page.evaluate(() => (window as any).__plateEditor.children.length)
    const txt = await page.evaluate(() => (window as any).__plateEditor.api.string([]))
    const top = await page.evaluate(() => (window as any).__plateEditor.children[0]?.type)
    if (n === 1 && txt === '' && top === 'p') break
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.press('Backspace')
    await pause(page)
  }
  return page.evaluate(() => JSON.stringify((window as any).__plateEditor.children))
}

test('2 recriar os callouts da fixture 16 pela UI', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 16, file: 'expected' })
  await page.locator(CONTENT).waitFor()
  const afterClear = await clearBody(page)
  console.log('2 corpo depois de apagar pela UI:', afterClear)
  const steps: string[] = []

  // Primeiro callout: menu Inserir -> Nota.
  await page.getByTestId('insert-menu').click()
  await page.getByTestId('insert-note').click()
  await pause(page)
  await page.getByTestId('dok-add-label').first().click()
  await pause(page)
  await page.keyboard.type('Antes de começar')
  steps.push('rótulo digitado')
  await page.keyboard.press('ArrowDown')
  await pause(page)
  await page.keyboard.type('Você precisa de:')
  await page.keyboard.press('Enter')
  await pause(page)
  await page.getByTestId('plate-list-bullet').click()
  await pause(page)
  await page.keyboard.type('Node 22')
  await page.keyboard.press('Enter')
  await pause(page)
  await page.keyboard.type('acesso ao Supabase')
  steps.push('parágrafo e lista digitados')

  // Segundo callout: insere Nota e troca o tipo para danger pela UI do nó.
  await page.getByTestId('insert-menu').click()
  await page.getByTestId('insert-note').click()
  await pause(page)
  const second = page.getByTestId('dok-container').nth(1)
  await second.getByTestId('dok-name').first().selectOption('danger')
  await second.getByTestId('dok-attr-variant').first().selectOption('bug')
  await second.getByTestId('dok-attr-fold').first().selectOption('closed')
  steps.push('tipo, variant e fold definidos pela UI')
  await page.getByTestId('dok-container').nth(1).locator('[data-slate-node=element]').last().click()
  await pause(page)
  await page.keyboard.type('Não rode em produção.')

  const expected = read(16, 'expected.md')!
  const r = await spike.save(page)
  const pass = r.text === expected
  console.log(`2: ${pass ? 'ok' : 'FALHA'} passos=${steps.join('; ')} save.ok=${r.ok}${pass ? '' : '\n' + diffOf(expected, r.text)}`)
  expect(r.text).toBe(expected)
})

test('3 E-02: <Tabs> e <script> no fonte dão DOK-E002; Hora:agora fica texto', async ({ page }) => {
  // Modo fonte
  await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
  expect(await spike.setMode(page, 'source')).toBe(true)
  await page.locator('[data-testid=source-mode] .cm-content').click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type('\n<Tabs>\n\n<script>\n')
  await pause(page)
  const r1 = await spike.save(page)
  const codes1 = r1.diagnostics.map((d) => d.code)
  console.log('3 fonte <Tabs>/<script>: codes=', codes1.join(','), 'ok=', r1.ok)
  expect(codes1).toContain('DOK-E002')

  // Hora:agora no WYSIWYG
  await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
  await page.locator(`${CONTENT} [data-slate-string]`).first().click()
  await pause(page)
  await page.keyboard.press('End')
  await page.keyboard.type(' Hora:agora')
  await pause(page)
  const types = await page.evaluate(() => JSON.stringify((window as any).__spike.handle().getTree()))
  const r2 = await spike.save(page)
  const codes2 = r2.diagnostics.map((d) => d.code)
  console.log('3 WYSIWYG Hora:agora: texto contém=', r2.text.includes('Hora:agora'), 'diretiva na árvore=', /Directive/.test(types), 'codes=', codes2.join(','))
  expect(r2.text).toContain('Hora:agora')
  expect(/Directive/.test(types)).toBe(false)
  expect(codes2).not.toContain('DOK-E003')

  // Hora:agora no modo fonte
  await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
  await spike.setMode(page, 'source')
  await page.locator('[data-testid=source-mode] .cm-content').click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type('\nHora:agora\n')
  await pause(page)
  const r3 = await spike.save(page)
  const back = await spike.setMode(page, 'wysiwyg')
  const tree3 = await page.evaluate(() => JSON.stringify((window as any).__spike.handle().getTree()))
  console.log('3 fonte Hora:agora: texto contém=', r3.text.includes('Hora:agora'), 'codes=', r3.diagnostics.map((d) => d.code).join(','), 'volta ao WYSIWYG=', back, 'diretiva=', /Directive/.test(tree3))
  expect(r3.text).toContain('Hora:agora')
  expect(r3.diagnostics.map((d) => d.code)).not.toContain('DOK-E003')
  expect(/Directive/.test(tree3)).toBe(false)
})

test('4 E-03: diagrama pelo menu, seletor e descrição pela UI do nó', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
  await page.locator(`${CONTENT} [data-slate-string]`).first().click()
  await pause(page)
  // Registra se o seletor chega a abrir: o Popover do shell é aberto no onSelect do DropdownMenu.
  await page.evaluate(() => {
    ;(window as any).__pickerSeen = false
    new MutationObserver(() => {
      if (document.querySelector('[data-testid=diagram-picker]')) (window as any).__pickerSeen = true
    }).observe(document.body, { childList: true, subtree: true })
  })
  await page.getByTestId('insert-menu').click()
  await page.getByTestId('insert-diagram').click()
  await pause(page, 500)
  const seen = await page.evaluate(() => (window as any).__pickerSeen)
  const visible = await page.getByTestId('diagram-picker').isVisible()
  const active = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
  console.log(`4 seletor: apareceu no DOM=${seen} visível após 500 ms=${visible} foco=${active}`)
  // Segunda tentativa, só teclado: Enter no item Diagrama.
  let visibleKb = false
  if (!visible) {
    await page.getByTestId('insert-menu').focus()
    await page.keyboard.press('Enter')
    await page.getByTestId('insert-diagram').focus()
    await page.keyboard.press('Enter')
    await pause(page, 500)
    visibleKb = await page.getByTestId('diagram-picker').isVisible()
    console.log(`4 seletor pelo teclado: visível=${visibleKb}`)
  }
  expect(visible || visibleKb, 'seletor de diagrama do shell não fica aberto').toBe(true)
  await page.getByTestId('diagram-picker').getByText('Contexto do Pagamento').click()
  await pause(page)
  await page.getByTestId('dok-leaf-label').first().click()
  await page.getByTestId('dok-leaf-label').first().pressSequentially('Pessoa usa o Checkout, que chama o Gateway de pagamento')
  await pause(page)
  const line7 = read(23, 'expected.md')!.split('\n')[6]!
  const r = await spike.save(page)
  const has = r.text.split('\n').includes(line7)
  console.log(`4: ${has && r.ok ? 'ok' : 'FALHA'} save.ok=${r.ok} codes=${r.diagnostics.map((d) => d.code).join(',')}\nlinha esperada: ${line7}\nsalvo:\n${r.text}`)
  expect(has).toBe(true)
  expect(r.ok).toBe(true)
})

test('4b desvio: nó do diagrama criado como o seletor do shell cria, descrição pela UI do nó', async ({ page }) => {
  // O passo do seletor é do shell (Popover); este caso mede só o que é do adaptador: inserir o nó e editar a descrição.
  await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
  await page.locator(`${CONTENT} [data-slate-string]`).first().click()
  await pause(page)
  await page.evaluate(async () => {
    const { EDIT } = await import('/src/content-components/edit/index.ts' as string)
    const { DIAGRAMS } = await import('/src/shared/pageIndex.ts' as string)
    const d = DIAGRAMS[0]
    ;(window as any).__spike.handle().insertDirective(EDIT.diagram.create({ src: `dok:diagram/${d.id}`, view: d.defaultViewId, title: d.title, label: '' }))
  })
  await pause(page)
  await page.getByTestId('dok-leaf-label').first().click()
  await page.getByTestId('dok-leaf-label').first().pressSequentially('Pessoa usa o Checkout, que chama o Gateway de pagamento')
  await pause(page)
  const line7 = read(23, 'expected.md')!.split('\n')[6]!
  const r = await spike.save(page)
  const has = r.text.split('\n').includes(line7)
  console.log(`4b: ${has && r.ok ? 'ok' : 'FALHA'} save.ok=${r.ok} codes=${r.diagnostics.map((d) => d.code).join(',')}\n${r.text}`)
  expect(has).toBe(true)
  expect(r.ok).toBe(true)
})

test('5 link interno com autocomplete e link pendente', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
  await page.locator(`${CONTENT} [data-slate-string]`).first().click()
  await pause(page)
  await page.keyboard.press('End')
  await page.keyboard.type(' Veja ')
  await pause(page)
  await page.getByTestId('plate-link-button').click()
  await page.getByTestId('plate-link-query').fill('visão')
  const sug1 = await page.getByTestId('plate-link-suggestion').allInnerTexts()
  await page.getByTestId('plate-link-query').fill('C4')
  const sugAlias = await page.getByTestId('plate-link-suggestion').allInnerTexts()
  await page.getByTestId('plate-link-query').fill('visão')
  await page.getByTestId('plate-link-suggestion').filter({ hasText: 'Visão geral' }).click()
  await pause(page)
  await page.keyboard.type(' e ')
  await page.getByTestId('plate-link-button').click()
  await page.getByTestId('plate-link-query').fill('Página nova')
  await page.getByTestId('plate-link-pending').click()
  await pause(page)
  const r = await spike.save(page)
  const codes = r.diagnostics.map((d) => d.code)
  console.log('5 sugestões "visão":', JSON.stringify(sug1), 'alias "C4":', JSON.stringify(sugAlias), 'save.ok=', r.ok, 'codes=', codes.join(','), '\n' + r.text)
  expect(sug1).toContain('Visão geral')
  expect(sugAlias).toContain('Visão geral')
  expect(r.text).toContain('[Visão geral](dok:page/0192f0a1-5c3e-7a10-8b2c-3d4e5f607183)')
  expect(r.text).toContain('[Página nova](dok:page/new?title=P%C3%A1gina%20nova)')
  expect(r.ok).toBe(true)
  expect(codes).toContain('DOK-W101')
})
