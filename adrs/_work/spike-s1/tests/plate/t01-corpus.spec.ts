// Teste 1 (E-01): corpus fixo. Partes A, B e C.
import { test, expect } from '@playwright/test'
import { entry, openEditor, read, spike } from '../shared/helpers'
import { T1_CANONICAL_INPUT, T1_ERROR, T1_EXPECTED } from '../../src/shared/corpus'
import { EDITOR, CONTENT, diffOf, trivialEdit } from './util'

for (const n of T1_EXPECTED) {
  test(`1A fixture ${String(n).padStart(2, '0')} expected`, async ({ page }) => {
    await openEditor(page, EDITOR, { fixture: n, file: 'expected' })
    await page.locator(CONTENT).waitFor()
    await trivialEdit(page)
    const expected = read(n, 'expected.md')!
    const r = await spike.save(page)
    const pass = r.text === expected
    console.log(`1A ${n}: ${pass ? 'ok' : 'FALHA'} save.ok=${r.ok}${pass ? '' : '\n' + diffOf(expected, r.text)}`)
    expect(r.text).toBe(expected)
  })
}

for (const n of T1_CANONICAL_INPUT) {
  test(`1B fixture ${String(n).padStart(2, '0')} input`, async ({ page }) => {
    await openEditor(page, EDITOR, { fixture: n, file: 'input' })
    await page.locator(CONTENT).waitFor()
    await trivialEdit(page)
    const expected = read(n, 'expected.md')!
    const r = await spike.save(page)
    const pass = r.text === expected
    console.log(`1B ${n}: ${pass ? 'ok' : 'FALHA'} save.ok=${r.ok}${pass ? '' : '\n' + diffOf(expected, r.text)}`)
    expect(r.text).toBe(expected)
  })
}

for (const n of T1_ERROR) {
  test(`1C fixture ${String(n).padStart(2, '0')} erro`, async ({ page }) => {
    await openEditor(page, EDITOR, { fixture: n, file: 'input' })
    const input = read(n, 'input.md')!
    const checks: Record<string, boolean> = {}
    checks.a_mode = (await spike.mode(page)) === 'source'
    checks.a_semWysiwyg = (await page.locator(CONTENT).count()) === 0 && (await page.getByTestId('wysiwyg').count()) === 0
    checks.b_diagnostics = await page.getByTestId('diagnostics').isVisible()
    checks.c_source = (await spike.sourceText(page)) === input
    checks.c_setModeFalse = (await spike.setMode(page, 'wysiwyg')) === false
    checks.c_sourceDepois = (await spike.sourceText(page)) === input && (await page.locator(CONTENT).count()) === 0
    const r = await spike.save(page)
    const codes = [...new Set(r.diagnostics.map((d) => d.code).filter((c) => c.startsWith('DOK-E')))].sort()
    const wanted = [...entry(n).errors].sort()
    checks.d_codes = JSON.stringify(codes) === JSON.stringify(wanted)
    const pass = Object.values(checks).every(Boolean)
    console.log(`1C ${n}: ${pass ? 'ok' : 'FALHA'} ${JSON.stringify(checks)} codes=${codes.join(',')} manifest=${wanted.join(',')}`)
    expect(checks).toEqual(Object.fromEntries(Object.keys(checks).map((k) => [k, true])))
  })
}
