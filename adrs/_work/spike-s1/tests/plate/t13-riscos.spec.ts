// Teste 13: riscos específicos do Plate.
import { test, expect, type Page } from '@playwright/test'
import { openEditor, read, spike } from '../shared/helpers'
import { T1_CANONICAL_INPUT, T1_EXPECTED } from '../../src/shared/corpus'
import { parseDok } from '../../content-format/dokmd.ts'
import { EDITOR, CONTENT, lostTypes, parentChildCounts, typeCounts } from './util'

const pause = (page: Page, ms = 80) => page.waitForTimeout(ms)
const getTree = (page: Page) => page.evaluate(() => (window as any).__spike.handle().getTree())

function watchUnreachable(page: Page) {
  const warns: string[] = []
  page.on('console', (m) => {
    if (m.text().includes('Unreachable code')) warns.push(m.text().slice(0, 200))
  })
  return warns
}

const cases = [
  ...T1_EXPECTED.map((n) => ({ n, file: 'expected' as const })),
  ...T1_CANONICAL_INPUT.map((n) => ({ n, file: 'input' as const })),
]

test('13a nó mdast perdido nas duas direções (sem edição) e warn unreachable', async ({ page }) => {
  const warns = watchUnreachable(page)
  const rows: string[] = []
  let losses = 0
  for (const { n, file } of cases) {
    const text = read(n, `${file}.md`)!
    const initial = parseDok(text)
    await openEditor(page, EDITOR, { fixture: n, file })
    await page.locator(CONTENT).waitFor()
    const out = await getTree(page)
    const { lost, gained } = lostTypes(initial as any, out)
    const moved = lostTypes(parentChildCounts(initial as any) as any, parentChildCounts(out) as any, true)
    if (lost.length || moved.lost.length) losses++
    rows.push(
      `${String(n).padStart(2, '0')} ${file.padEnd(8)} perdidos=[${lost.join(', ')}] ganhos=[${gained.join(', ')}] pai>filho perdidos=[${moved.lost.join(', ')}] pai>filho ganhos=[${moved.gained.join(', ')}]`,
    )
  }
  console.log('13a tipos mdast (entrada parseDok sem yaml × getTree):\n' + rows.join('\n'))
  console.log('13a fixtures com tipo perdido:', losses, 'de', cases.length, '| console.warn "Unreachable code":', warns.length, JSON.stringify(warns.slice(0, 5)))
  expect.soft(warns).toEqual([])
  expect(losses).toBe(0)
})

test('13a-nativo tipos da DokAST do corpus sem regra nativa em defaultRules', async () => {
  // Leitura das regras nativas publicadas (sem editor): mdast type -> chave MDAST_TO_PLATE -> defaultRules[chave].deserialize.
  const md = await import('@platejs/markdown')
  const fakeEditor = { meta: { pluginCache: { node: { types: {} } } } }
  const all: Record<string, number> = {}
  for (const { n, file } of cases) for (const [t, c] of Object.entries(typeCounts(parseDok(read(n, `${file}.md`)!) as any))) all[t] = (all[t] ?? 0) + c
  const rows = Object.keys(all)
    .sort()
    .map((t) => {
      const key = md.mdastToPlate(fakeEditor as any, t as any)
      const rule = (md.defaultRules as any)[key]
      return `${t.padEnd(20)} chave=${String(key).padEnd(20)} deserialize nativo=${rule?.deserialize ? 'sim' : 'NÃO'}`
    })
  console.log('13a-nativo tipos mdast presentes no corpus do teste 1:\n' + rows.join('\n'))
})

test('13b rules { callout: null, comment: null, suggestion: null } desligam a regra nativa?', async ({ page }) => {
  const warns = watchUnreachable(page)
  const probes = {
    callout: { type: 'callout', children: [{ type: 'p', children: [{ text: 'dentro do callout' }] }] },
    comment: { type: 'p', children: [{ text: 'comentado', comment: true }] },
    suggestion: { type: 'p', children: [{ text: 'sugerido', suggestion: true }] },
  }
  for (const [name, node] of Object.entries(probes)) {
    await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
    await page.locator(CONTENT).waitFor()
    const res = await page.evaluate((node) => {
      const e = (window as any).__plateEditor
      e.tf.insertNodes(node, { at: [e.children.length] })
      let tree: unknown = null
      let treeErr: string | null = null
      try {
        tree = (window as any).__spike.handle().getTree()
      } catch (err) {
        treeErr = String((err as Error).stack ?? err).slice(0, 400)
      }
      let saveErr: string | null = null
      let saveText: string | null = null
      try {
        saveText = (window as any).__spike.save().text
      } catch (err) {
        saveErr = String((err as Error).message ?? err).slice(0, 200)
      }
      return { tree: JSON.stringify(tree), treeErr, saveErr, saveText }
    }, node)
    const mdx = (res.tree.match(/mdxJsx(Flow|Text)Element/g) ?? []).length
    console.log(`13b ${name}: getTree=${res.tree.slice(-260)}\n   erro getTree=${res.treeErr}\n   nós mdxJsx no getTree=${mdx} erro no save=${res.saveErr}`)
  }
  console.log('13b warn unreachable=', warns.length)
  // Registro: o valor medido está no log acima.
  expect(true).toBe(true)
})

test('13c rótulo de container preservado na ida e volta e após editar', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 16, file: 'expected' })
  await page.locator(CONTENT).waitFor()
  const t0 = await getTree(page)
  const label0 = JSON.stringify(t0.children[0].children[0])
  // Edita o conteúdo do container.
  await page.locator(CONTENT).getByText('Você precisa de:').click()
  await pause(page)
  await page.keyboard.press('End')
  await page.keyboard.type(' agora')
  await pause(page)
  const r1 = await spike.save(page)
  // Edita o próprio rótulo.
  await page.getByTestId('dok-label').first().click()
  await pause(page)
  await page.keyboard.press('End')
  await page.keyboard.type('!')
  await pause(page)
  const r2 = await spike.save(page)
  const t2 = await getTree(page)
  console.log('13c rótulo na carga:', label0)
  console.log('13c após editar o corpo: contém ":::note[Antes de começar]"=', r1.text.includes(':::note[Antes de começar]\n'), 'corpo editado=', r1.text.includes('Você precisa de: agora'))
  console.log('13c após editar o rótulo: contém ":::note[Antes de começar!]"=', r2.text.includes(':::note[Antes de começar!]\n'), 'data.directiveLabel=', JSON.stringify(t2.children[0].children[0].data))
  expect(label0).toContain('"directiveLabel":true')
  expect(r1.text).toContain(':::note[Antes de começar]\nVocê precisa de: agora')
  expect(r2.text).toContain(':::note[Antes de começar!]\n')
})

test('13d link por referência e definition (fixture 14, input)', async ({ page }) => {
  const text = read(14, 'input.md')!
  await openEditor(page, EDITOR, { fixture: 14, file: 'input' })
  await page.locator(CONTENT).waitFor()
  const out = await getTree(page)
  const { lost } = lostTypes(parseDok(text) as any, out)
  const r = await spike.save(page)
  console.log('13d input.md:\n' + text)
  console.log('13d tipos perdidos com as regras do adaptador:', JSON.stringify(lost), 'save.ok=', r.ok, '\nsave:\n' + r.text)
  console.log('13d com as regras nativas: ver plate/playwright-output-regras-nativas.txt, linha "1B 14"')
  expect(lost).toEqual([])
  expect(r.text).toBe(read(14, 'expected.md'))
})

test('13e notas de rodapé (fixture 09) com @platejs/footnote', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 9, file: 'expected' })
  await page.locator(CONTENT).waitFor()
  const dom = await page.evaluate(() => ({
    refs: document.querySelectorAll('[data-testid=plate-content] .slate-footnoteReference').length,
    defs: document.querySelectorAll('[data-testid=plate-content] .slate-footnoteDefinition').length,
  }))
  await page.locator(CONTENT).getByText('Documento interno.').click()
  await pause(page)
  await page.keyboard.press('End')
  await page.keyboard.type(' Revisado.')
  await pause(page)
  const r = await spike.save(page)
  console.log('13e elementos no DOM:', JSON.stringify(dom), 'save.ok=', r.ok, '\n' + r.text)
  expect(r.text).toContain('[^fonte]: Documento interno. Revisado.')
  expect(r.text).toContain('Texto com nota[^fonte] e outra[^2].')
})

test('13f seleção e histórico depois da volta do modo fonte (remontagem)', async ({ page }) => {
  await openEditor(page, EDITOR, { fixture: 1, file: 'expected' })
  await page.locator(`${CONTENT} [data-slate-string]`).first().click()
  await pause(page)
  await page.keyboard.press('End')
  await page.keyboard.type('A')
  await pause(page)
  const selBefore = await page.evaluate(() => JSON.stringify((window as any).__plateEditor.selection))
  await spike.setMode(page, 'source')
  await spike.setMode(page, 'wysiwyg')
  await page.locator(CONTENT).waitFor()
  await pause(page, 200)
  const after = await page.evaluate(() => ({
    selection: JSON.stringify((window as any).__plateEditor.selection),
    focusInEditor: !!document.activeElement?.closest('[data-testid=plate-content]'),
    undos: (window as any).__plateEditor.history?.undos?.length ?? null,
  }))
  // Undo logo após a remontagem: o "A" digitado antes da troca volta?
  await page.locator(CONTENT).click()
  await pause(page)
  await page.keyboard.press('ControlOrMeta+z')
  await pause(page)
  const afterUndo = await spike.getDok(page)
  // Histórico novo funciona?
  await page.keyboard.press('End')
  await page.keyboard.type('B')
  await pause(page)
  const withB = await spike.getDok(page)
  await page.keyboard.press('ControlOrMeta+z')
  await pause(page)
  const undoB = await spike.getDok(page)
  console.log('13f seleção antes da troca:', selBefore)
  console.log('13f depois da remontagem:', JSON.stringify(after))
  console.log('13f Ctrl/Cmd+Z após remontar desfaz o "A" anterior:', !afterUndo.includes('Texto.A') ? 'sim' : 'não (histórico perdido)')
  console.log('13f histórico novo: "B" digitado=', withB.includes('B'), 'desfeito=', !undoB.includes('B'))
  expect(withB).toContain('B')
  expect(undoB).not.toContain('Texto.AB')
})
