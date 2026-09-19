// Modo fonte compartilhado (D-5): CodeMirror 6 integrado direto, sem wrapper.
// Tema só por custom properties; diagnósticos do validateDok via @codemirror/lint.
import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { setDiagnostics, lintGutter, type Diagnostic as CmDiagnostic } from '@codemirror/lint'
import type { Diagnostic } from '../../content-format/dokmd.ts'

const tokenTheme = EditorView.theme({
  '&': { color: 'var(--foreground)', backgroundColor: 'var(--background)', border: '1px solid var(--border)' },
  '.cm-gutters': { backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderRight: '1px solid var(--border)' },
  '.cm-cursor': { borderLeftColor: 'var(--foreground)' },
})

function toCm(state: EditorState, diags: Diagnostic[]): CmDiagnostic[] {
  return diags.map((d) => {
    const line = state.doc.line(Math.min(Math.max(d.line ?? 1, 1), state.doc.lines))
    return { from: line.from, to: line.to, severity: d.code.startsWith('DOK-E') ? 'error' : 'warning', message: d.message, source: d.code }
  })
}

export function SourceMode(props: {
  value: string
  onChange: (v: string) => void
  diagnostics: Diagnostic[]
  readOnly?: boolean
  onPaste?: (text: string) => boolean
}) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const onChange = useRef(props.onChange)
  onChange.current = props.onChange

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: props.value,
        extensions: [
          lineNumbers(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown(),
          lintGutter(),
          tokenTheme,
          EditorState.readOnly.of(!!props.readOnly),
          EditorView.editable.of(!props.readOnly),
          ...(reduced ? [EditorView.theme({ '.cm-cursor': { animation: 'none' } })] : []),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChange.current(u.state.doc.toString())
          }),
        ],
      }),
    })
    view.current = v
    ;(window as unknown as { __cm?: EditorView }).__cm = v
    return () => v.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.readOnly])

  useEffect(() => {
    const v = view.current
    if (v) v.dispatch(setDiagnostics(v.state, toCm(v.state, props.diagnostics)))
  }, [props.diagnostics])

  return <div ref={host} data-testid="source-mode" />
}
