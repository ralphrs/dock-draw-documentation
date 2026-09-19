// <RevisionView> (E-12) e <RevisionDiff> (E-10, E-11). Independentes de editor (D-4):
// usam só a fatia read (stub do spike) e o texto canônico.
import { useEffect, useRef, useState } from 'react'
import { diffArrays, diffLines } from 'diff'
import type { Root } from 'mdast'
import { parseDok, serializeDok } from '../../content-format/dokmd.ts'
import { DokView, render, topBlocks } from '../content-components/read'

export type LineAnchor = { startLine: number; endLine: number }

function lineOf(node: Node | null, edge: 'start' | 'end'): number | null {
  let el: Element | null = node instanceof Element ? node : (node?.parentElement ?? null)
  while (el && !el.hasAttribute('data-line-start')) el = el.parentElement
  if (!el) return null
  return Number(el.getAttribute(edge === 'start' ? 'data-line-start' : 'data-line-end'))
}

/** Seleção visual → faixa de linhas do DokMD canônico da revisão. */
export function selectionToAnchor(sel: Selection | null): LineAnchor | null {
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null
  const r = sel.getRangeAt(0)
  const a = lineOf(r.startContainer, 'start')
  const b = lineOf(r.endContainer, 'end')
  if (a === null || b === null) return null
  return { startLine: Math.min(a, b), endLine: Math.max(a, b) }
}

export function RevisionView({ text }: { text: string }) {
  const [anchor, setAnchor] = useState<LineAnchor | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onUp = () => {
      const a = selectionToAnchor(window.getSelection())
      setAnchor(a)
      ;(window as unknown as { __anchor: LineAnchor | null }).__anchor = a
    }
    const el = ref.current!
    el.addEventListener('mouseup', onUp)
    el.addEventListener('keyup', onUp)
    return () => {
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('keyup', onUp)
    }
  }, [])
  return (
    <div>
      <div ref={ref} data-testid="revision-view">
        <DokView tree={parseDok(text)} />
      </div>
      <output data-testid="anchor">{anchor ? `${anchor.startLine}-${anchor.endLine}` : ''}</output>
    </div>
  )
}

const blockText = (n: Root['children'][number]) => serializeDok({ type: 'root', children: [n] })

export function RevisionDiff({ published, draft }: { published: string; draft: string }) {
  const textual = diffLines(published, draft)
  const a = topBlocks(parseDok(published))
  const b = topBlocks(parseDok(draft))
  const blocks = diffArrays(a.map((x) => blockText(x.node)), b.map((x) => blockText(x.node)))
  let ia = 0
  let ib = 0
  return (
    <div className="grid gap-4">
      <pre data-testid="diff-text">
        {textual.map((p, i) => (
          <span key={i} data-op={p.added ? 'add' : p.removed ? 'del' : 'eq'}>
            {p.value
              .replace(/\n$/, '')
              .split('\n')
              .map((l) => `${p.added ? '+' : p.removed ? '-' : ' '} ${l}`)
              .join('\n') + '\n'}
          </span>
        ))}
      </pre>
      <div data-testid="diff-rendered">
        {blocks.flatMap((part, i) =>
          part.value.map((_v, j) => {
            const op = part.added ? 'add' : part.removed ? 'del' : 'eq'
            const blk = op === 'add' ? b[ib++] : op === 'del' ? a[ia++] : (ib++, a[ia++])
            return (
              <div key={`${i}-${j}`} data-op={op} style={{ borderLeft: `3px solid ${op === 'add' ? 'var(--accent)' : op === 'del' ? 'var(--danger)' : 'transparent'}` }}>
                {blk ? render(blk.node) : null}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
