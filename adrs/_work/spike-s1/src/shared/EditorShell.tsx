// Shell compartilhado do <PageEditor> do spike. Igual para os dois editores:
// frontmatter fora do editor, D-1 (conteúdo inválido nunca abre no WYSIWYG), alternância
// WYSIWYG ↔ fonte com re-parse, menu de inserção Radix (portal), save simulado, banner E-13.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Popover from '@radix-ui/react-popover'
import type { Root, Yaml } from 'mdast'
import { normalizeDok, parseDok, serializeDok, validateDok, type Diagnostic } from '../../content-format/dokmd.ts'
import { EDIT } from '../content-components/edit'
import type { AdapterHandle, EditorAdapter } from '../editors/contract'
import { importDialect } from './importDialect'
import { DIAGRAMS, searchPages } from './pageIndex'
import { saveDok, type SaveResult } from './save'
import { SourceMode } from './SourceMode'

export type ShellMode = 'wysiwyg' | 'source'

/** Decide se o texto pode abrir no WYSIWYG: julga a forma que o save gravaria (D-1). */
export const blockingOf = (text: string) => validateDok(normalizeDok(text)).filter((d) => d.code.startsWith('DOK-E'))
/** Diagnósticos para exibir no modo fonte, com linhas do texto cru. E010 é convertido pelo save, não bloqueia. */
const displayOf = (text: string): Diagnostic[] => validateDok(text).filter((d) => d.code !== 'DOK-E010')

function split(text: string): { yaml: Yaml | null; body: Root } {
  const tree = parseDok(text)
  const first = tree.children[0]
  if (first?.type === 'yaml') return { yaml: first, body: { ...tree, children: tree.children.slice(1) } }
  return { yaml: null, body: tree }
}

export type SpikeApi = {
  mode: () => ShellMode
  setMode: (m: ShellMode) => boolean
  getDok: () => string
  save: () => SaveResult
  loadedText: () => string
  sourceText: () => string
  blocking: () => Diagnostic[]
  handle: () => AdapterHandle | null
}

export function EditorShell(props: {
  Adapter: EditorAdapter
  initialText: string
  readOnly?: boolean
  changesRequested?: boolean
  editorName: string
}) {
  const { Adapter } = props
  const initialBlocking = useMemo(() => blockingOf(props.initialText), [props.initialText])
  const [mode, setModeState] = useState<ShellMode>(initialBlocking.length ? 'source' : 'wysiwyg')
  const [sourceText, setSourceText] = useState(props.initialText)
  const [generation, setGeneration] = useState(0)
  const [lastSave, setLastSave] = useState<SaveResult | null>(null)
  const [refused, setRefused] = useState<Diagnostic[]>(initialBlocking)
  const yamlRef = useRef<Yaml | null>(split(props.initialText).yaml)
  const [bodyTree, setBodyTree] = useState<Root>(() => split(props.initialText).body)
  const handleRef = useRef<AdapterHandle | null>(null)
  const modeRef = useRef(mode)
  modeRef.current = mode
  const sourceRef = useRef(sourceText)
  sourceRef.current = sourceText

  const currentDok = useCallback((): string => {
    if (modeRef.current === 'source') return sourceRef.current
    const h = handleRef.current
    if (!h) return props.initialText
    const body = h.getTree()
    const root: Root = { type: 'root', children: [...(yamlRef.current ? [yamlRef.current] : []), ...body.children] }
    return serializeDok(root)
  }, [props.initialText])

  const setMode = useCallback(
    (m: ShellMode): boolean => {
      if (m === modeRef.current) return true
      if (m === 'source') {
        setSourceText(currentDok())
        setModeState('source')
        return true
      }
      const blocking = blockingOf(sourceRef.current)
      setRefused(blocking)
      if (blocking.length) return false // D-1: conteúdo inválido nunca volta ao WYSIWYG
      const { yaml, body } = split(sourceRef.current)
      yamlRef.current = yaml
      setBodyTree(body)
      setGeneration((g) => g + 1) // remonta o adaptador: re-parse completo
      setModeState('wysiwyg')
      return true
    },
    [currentDok],
  )

  const save = useCallback(() => {
    const r = saveDok(currentDok())
    setLastSave(r)
    return r
  }, [currentDok])

  useEffect(() => {
    const api: SpikeApi = {
      mode: () => modeRef.current,
      setMode,
      getDok: currentDok,
      save,
      loadedText: () => props.initialText,
      sourceText: () => sourceRef.current,
      blocking: () => blockingOf(props.initialText),
      handle: () => handleRef.current,
    }
    ;(window as unknown as { __spike: SpikeApi }).__spike = api
  }, [setMode, currentDok, save, props.initialText])

  const [pickerOpen, setPickerOpen] = useState(false)
  // O menu Radix devolve o foco ao gatilho ao fechar; isso fechava o Popover do seletor na hora.
  const openingPicker = useRef(false)

  return (
    <div className="flex flex-col gap-3 p-4" data-editor={props.editorName}>
      {props.changesRequested ? (
        <div role="status" data-testid="banner-changes-requested" style={{ border: '1px solid var(--danger)', padding: 8 }}>
          Revisão com alterações solicitadas. Veja os comentários do revisor.
        </div>
      ) : null}
      <div className="flex gap-2">
        <button data-testid="mode-wysiwyg" onClick={() => setMode('wysiwyg')} disabled={mode === 'wysiwyg'}>Visual</button>
        <button data-testid="mode-source" onClick={() => setMode('source')} disabled={mode === 'source'}>Fonte</button>
        <button data-testid="save" onClick={save} disabled={props.readOnly}>Salvar</button>
        {!props.readOnly && mode === 'wysiwyg' ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger data-testid="insert-menu">Inserir</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                data-testid="insert-menu-content"
                onCloseAutoFocus={(e) => {
                  if (openingPicker.current) {
                    e.preventDefault()
                    openingPicker.current = false
                    setPickerOpen(true)
                  }
                }}
                style={{ background: 'var(--background)', border: '1px solid var(--border)', zIndex: 50 }}>
                {Object.values(EDIT)
                  .filter((s) => s.insertable && s.name !== 'diagram')
                  .map((s) => (
                    <DropdownMenu.Item key={s.name} data-testid={`insert-${s.name}`} onSelect={() => handleRef.current?.insertDirective(s.create())}>
                      {s.label}
                    </DropdownMenu.Item>
                  ))}
                <DropdownMenu.Item data-testid="insert-diagram" onSelect={() => (openingPicker.current = true)}>Diagrama</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : null}
        <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
          <Popover.Anchor />
          <Popover.Portal>
            <Popover.Content data-testid="diagram-picker" style={{ background: 'var(--background)', border: '1px solid var(--border)', zIndex: 50 }}>
              {DIAGRAMS.map((d) => (
                <button
                  key={d.id}
                  data-testid={`pick-diagram-${d.id}`}
                  onClick={() => {
                    handleRef.current?.insertDirective(
                      EDIT.diagram.create({ src: `dok:diagram/${d.id}`, view: d.defaultViewId, title: d.title, label: '' }),
                    )
                    setPickerOpen(false)
                  }}
                >
                  {d.title}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      {refused.length ? (
        <ul role="alert" data-testid="diagnostics">
          {refused.map((d, i) => (
            <li key={i} data-code={d.code}>{d.code} {d.line ? `linha ${d.line}` : ''}: {d.message}</li>
          ))}
        </ul>
      ) : null}
      {lastSave ? (
        <output data-testid="save-result" data-ok={String(lastSave.ok)} data-codes={lastSave.diagnostics.map((d) => d.code).join(',')}>
          {lastSave.ok ? 'Salvo' : `Save recusado: ${lastSave.diagnostics.filter((d) => d.code.startsWith('DOK-E')).map((d) => d.code).join(', ')}`}
        </output>
      ) : null}
      {mode === 'source' ? (
        <SourceMode value={sourceText} onChange={setSourceText} diagnostics={displayOf(sourceText)} readOnly={props.readOnly} />
      ) : (
        <div data-testid="wysiwyg">
          <Adapter
            key={generation}
            initialTree={bodyTree}
            readOnly={!!props.readOnly}
            onChange={() => {}}
            onReady={(h) => (handleRef.current = h)}
            importDialect={importDialect}
            searchPages={searchPages}
          />
        </div>
      )}
    </div>
  )
}
