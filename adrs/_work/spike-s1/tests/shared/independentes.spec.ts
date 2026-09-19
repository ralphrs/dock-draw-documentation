// Testes independentes de editor (D-4): E-10, E-11, E-12, SSR da leitura sem erro.
import { test, expect } from '@playwright/test'
import { collectErrors } from './helpers'

test('E-10 diff textual contra a publicada', async ({ page }) => {
  await page.goto('/diff?fixture=16')
  const txt = await page.getByTestId('diff-text').innerText()
  console.log('E-10 saída:\n' + txt)
  expect(txt).toContain('- Não rode em produção.')
  expect(txt).toContain('+ Nunca rode em produção.')
  expect(txt).toContain('+ Parágrafo novo.')
})

test('E-11 diff renderizado por bloco via fatia read', async ({ page }) => {
  await page.goto('/diff?fixture=16')
  const ops = await page.getByTestId('diff-rendered').locator(':scope > div').evaluateAll((els) =>
    els.map((e) => `${e.getAttribute('data-op')}:${(e.textContent ?? '').slice(0, 40)}`),
  )
  console.log('E-11 blocos:\n' + ops.join('\n'))
  expect(ops.some((o) => o.startsWith('del:') && o.includes('Não rode'))).toBe(true)
  expect(ops.some((o) => o.startsWith('add:') && o.includes('Nunca rode'))).toBe(true)
  expect(ops.some((o) => o.startsWith('add:') && o.includes('Parágrafo novo'))).toBe(true)
  expect(ops.some((o) => o.startsWith('eq:') && o.includes('Antes de começar'))).toBe(true)
})

test('E-12 seleção visual vira faixa de linhas do canônico, com SSR sem erro', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/read?fixture=16')
  await page.waitForLoadState('networkidle')
  // Seleciona de "Node 22" até "Não rode em produção." (linhas 10 a 15 do expected.md da fixture 16).
  await page.evaluate(() => {
    const start = [...document.querySelectorAll('li p')].find((e) => e.textContent === 'Node 22')!
    const end = [...document.querySelectorAll('section p')].find((e) => e.textContent === 'Não rode em produção.')!
    const r = document.createRange()
    r.setStart(start.firstChild!, 0)
    r.setEnd(end.firstChild!, 5)
    const s = window.getSelection()!
    s.removeAllRanges()
    s.addRange(r)
  })
  await page.getByTestId('revision-view').dispatchEvent('mouseup')
  const anchor = await page.getByTestId('anchor').innerText()
  console.log('E-12 âncora:', anchor, 'erros de console:', JSON.stringify(errors))
  expect(anchor).toBe('10-15')
  expect(errors).toEqual([])
})
