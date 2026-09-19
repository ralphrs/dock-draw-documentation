// Gera os casos de regressão de listas vizinhas (trava 2 da parada 4), fora do corpus do ADR 002.
// Cada caso é gravado já na forma canônica (normalizeDok) e conferido: ponto fixo, sem DOK-E,
// e a estrutura mdast tem as listas vizinhas separadas como o rascunho pretende.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Root, List } from 'mdast'
import { normalizeDok, parseDok, validateDok } from '../content-format/dokmd.ts'

const fm = (t: string) => `---\ndok: 1\nid: 0192f0a1-5c3e-7a10-8b2c-3d4e5f607182\ntitle: ${t}\n---\n\n`

type Case = { slug: string; draft: string; lists: number }
const cases: Case[] = [
  { slug: 'x01-ul-ul', draft: 'A:\n\n- um\n- dois\n\n* três\n* quatro\n', lists: 2 },
  { slug: 'x02-ol-ol', draft: 'A:\n\n1. um\n2. dois\n\n1) três\n2) quatro\n', lists: 2 },
  { slug: 'x03-ul-ol', draft: 'A:\n\n- um\n- dois\n\n1. três\n2. quatro\n', lists: 2 },
  { slug: 'x04-ol-ul', draft: 'A:\n\n1. um\n2. dois\n\n- três\n- quatro\n', lists: 2 },
  { slug: 'x05-ul-ul-varios-blocos', draft: 'A:\n\n- um\n\n  continuação do um\n\n- dois\n\n* três\n\n  ```ts\n  const x = 1\n  ```\n\n* quatro\n', lists: 2 },
  { slug: 'x06-ol-ol-varios-blocos', draft: 'A:\n\n1. um\n\n   continuação do um\n\n2. dois\n\n1) três\n\n   > citação no item\n\n2) quatro\n', lists: 2 },
  { slug: 'x07-tres-ul-seguidas', draft: 'A:\n\n- um\n\n* dois\n\n- três\n', lists: 3 },
  { slug: 'x08-citacao-ul-ul', draft: '> - um\n> - dois\n>\n> * três\n> * quatro\n', lists: 2 },
  { slug: 'x09-citacao-ol-ol-varios-blocos', draft: '> 1. um\n>\n>    continuação\n>\n> 1) dois\n> 2) três\n', lists: 2 },
  { slug: 'x10-callout-ul-ul', draft: ':::note[Listas]\n- um\n- dois\n\n* três\n* quatro\n:::\n', lists: 2 },
  { slug: 'x11-callout-ol-ol-varios-blocos', draft: ':::tip\n1. um\n\n   continuação\n\n1) dois\n\n   outra continuação\n:::\n', lists: 2 },
  { slug: 'x12-callout-ul-ol', draft: ':::caution\n- um\n\n1. dois\n:::\n', lists: 2 },
]

const countLists = (t: Root) => {
  let n = 0
  const walk = (x: { type: string; children?: unknown[] }) => {
    if (x.type === 'list') n++
    else for (const c of (x.children ?? []) as { type: string; children?: unknown[] }[]) walk(c)
  }
  walk(t)
  return n
}
// Conta só listas "de topo" do contêiner (não aninhadas dentro de item).
const topLists = (t: Root) => {
  let n = 0
  const walk = (x: { type: string; children?: unknown[] }) => {
    for (const c of (x.children ?? []) as { type: string; children?: unknown[] }[]) {
      if (c.type === 'list') n++
      else if (c.type !== 'listItem') walk(c)
    }
  }
  walk(t)
  return n
}

const dir = dirname(fileURLToPath(import.meta.url))
let bad = 0
for (const c of cases) {
  const text = normalizeDok(fm(c.slug) + c.draft)
  const errs = validateDok(text).filter((d) => d.code.startsWith('DOK-E'))
  const fixed = normalizeDok(text) === text
  const tl = topLists(parseDok(text))
  const ok = errs.length === 0 && fixed && tl === c.lists
  if (!ok) bad++
  writeFileSync(join(dir, `${c.slug}.md`), text)
  console.log(`${ok ? 'ok   ' : 'FALHA'} ${c.slug.padEnd(34)} listas de topo=${tl} (esperado ${c.lists}) ponto fixo=${fixed} erros=${errs.map((e) => e.code).join(',') || '-'} total listas=${countLists(parseDok(text))}`)
}
process.exit(bad ? 1 : 0)
