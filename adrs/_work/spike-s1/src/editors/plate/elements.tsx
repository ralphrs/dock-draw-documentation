// Componentes Plate dos nós de diretiva. A UI de cada nó vem da fatia edit (EDIT[name]): atributos, modo de rótulo.
import { PlateElement, useEditorRef, useReadOnly, type PlateElementProps } from 'platejs/react'
import { DIRECTIVE_NAMES, directiveKind, type DirectiveName } from '../../content-components/core'
import { EDIT } from '../../content-components/edit'
import { DOK_LABEL } from './rules'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

/** Teclas digitadas nos campos da UI do nó não chegam ao Editable (senão Backspace apaga o void selecionado). */
const stop = (e: { stopPropagation(): void }) => e.stopPropagation()

const specOf = (name: string) => (EDIT as Record<string, (typeof EDIT)[DirectiveName] | undefined>)[name]

/** Nomes para os quais o nó pode ser trocado sem perder forma: mesma família de atributos e mesmo modo de rótulo. */
function compatibleNames(name: string): string[] {
  const spec = specOf(name)
  if (!spec) return [name]
  const keys = spec.attributes.map((a) => a.key).join(',')
  return DIRECTIVE_NAMES.filter((n) => {
    const s = EDIT[n]
    return (
      directiveKind(n) === directiveKind(spec.name) &&
      (s.insertable || n === name) &&
      s.labelMode === spec.labelMode &&
      s.attributes.map((a) => a.key).join(',') === keys
    )
  })
}

function AttributeFields(props: { element: Any; onSet: (patch: Record<string, unknown>) => void; readOnly: boolean }) {
  const { element } = props
  const spec = specOf(element.name)
  const attrs: Record<string, string> = element.attributes ?? {}
  if (!spec) return <span data-testid="dok-unknown">diretiva sem registro: {element.name}</span>
  return (
    <>
      {spec.attributes.map((f) => {
        const setAttr = (v: string) => {
          const next = { ...attrs }
          if (v === '') delete next[f.key]
          else next[f.key] = v
          props.onSet({ attributes: next })
        }
        return (
          <label key={f.key} style={{ marginLeft: 8 }}>
            {f.label}{' '}
            {f.kind === 'select' ? (
              <select data-testid={`dok-attr-${f.key}`} disabled={props.readOnly} value={attrs[f.key] ?? ''} onChange={(e) => setAttr(e.target.value)}>
                <option value="">(padrão)</option>
                {(f.options ?? []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input data-testid={`dok-attr-${f.key}`} disabled={props.readOnly} value={attrs[f.key] ?? ''} onChange={(e) => setAttr(e.target.value)} />
            )}
          </label>
        )
      })}
    </>
  )
}

export function DokContainerElement(props: PlateElementProps) {
  const editor = useEditorRef()
  const readOnly = useReadOnly()
  const element = props.element as Any
  const spec = specOf(element.name)
  const setProps = (patch: Record<string, unknown>) => editor.tf.setNodes(patch as Any, { at: editor.api.findPath(element) })
  const hasLabel = element.children?.[0]?.type === DOK_LABEL
  const addLabel = () => {
    const path = editor.api.findPath(element)
    if (!path) return
    editor.tf.insertNodes({ type: DOK_LABEL, children: [{ text: '' }] } as Any, { at: [...path, 0] })
    editor.tf.select([...path, 0])
    editor.tf.focus()
  }
  return (
    <PlateElement
      {...props}
      attributes={{ ...props.attributes, 'data-testid': 'dok-container', 'data-name': element.name } as Any}
      style={{ border: '1px solid var(--border)', padding: 8, margin: '8px 0' }}
    >
      <div contentEditable={false} style={{ userSelect: 'none', fontSize: 12 }} data-testid="dok-container-header" onKeyDown={stop}>
        <select
          data-testid="dok-name"
          disabled={readOnly}
          value={element.name}
          onChange={(e) => setProps({ name: e.target.value })}
        >
          {compatibleNames(element.name).map((n) => (
            <option key={n} value={n}>{specOf(n)?.label ?? n} ({n})</option>
          ))}
        </select>
        <AttributeFields element={element} onSet={setProps} readOnly={readOnly} />
        {spec && spec.labelMode !== 'none' && !hasLabel && !readOnly ? (
          <button type="button" data-testid="dok-add-label" style={{ marginLeft: 8 }} onMouseDown={(e) => e.preventDefault()} onClick={addLabel}>
            Rótulo
          </button>
        ) : null}
      </div>
      <div>{props.children}</div>
    </PlateElement>
  )
}

export function DokLabelElement(props: PlateElementProps) {
  return (
    <PlateElement {...props} attributes={{ ...props.attributes, 'data-testid': 'dok-label' } as Any} style={{ fontWeight: 600 }}>
      {props.children}
    </PlateElement>
  )
}

export function DokLeafElement(props: PlateElementProps) {
  const editor = useEditorRef()
  const readOnly = useReadOnly()
  const element = props.element as Any
  const label: string = (element.label ?? []).map((t: Any) => t.text ?? '').join('')
  const setProps = (patch: Record<string, unknown>) => editor.tf.setNodes(patch as Any, { at: editor.api.findPath(element) })
  return (
    <PlateElement
      {...props}
      attributes={{ ...props.attributes, 'data-testid': 'dok-leaf', 'data-name': element.name } as Any}
      style={{ border: '1px dashed var(--border)', padding: 8, margin: '8px 0' }}
    >
      <div contentEditable={false} style={{ userSelect: 'none', fontSize: 12 }} onKeyDown={stop}>
        <strong>{specOf(element.name)?.label ?? element.name}</strong>{' '}
        <span data-testid="dok-leaf-title">{element.attributes?.title}</span>
        <label style={{ marginLeft: 8 }}>
          Descrição{' '}
          <input
            data-testid="dok-leaf-label"
            disabled={readOnly}
            value={label}
            onChange={(e) => setProps({ label: e.target.value ? [{ text: e.target.value }] : [] })}
          />
        </label>
        <AttributeFields element={element} onSet={setProps} readOnly={readOnly} />
      </div>
      {props.children}
    </PlateElement>
  )
}

export function DokImgElement(props: PlateElementProps) {
  const element = props.element as Any
  return (
    <PlateElement {...props} as="span" attributes={{ ...props.attributes, 'data-testid': 'dok-img' } as Any}>
      <span contentEditable={false} style={{ border: '1px solid var(--border)', padding: '0 4px' }}>
        🖼 {element.alt || element.identifier || element.url}
      </span>
      {props.children}
    </PlateElement>
  )
}

export function DokLinkRefElement(props: PlateElementProps) {
  return (
    <PlateElement {...props} as="span" attributes={{ ...props.attributes, 'data-testid': 'dok-linkref' } as Any} style={{ textDecoration: 'underline dotted' }}>
      {props.children}
    </PlateElement>
  )
}

export function DokDefinitionElement(props: PlateElementProps) {
  const element = props.element as Any
  return (
    <PlateElement {...props} attributes={{ ...props.attributes, 'data-testid': 'dok-definition' } as Any}>
      <div contentEditable={false} style={{ fontSize: 12, color: 'var(--foreground)' }}>
        [{element.label ?? element.identifier}]: {element.url}
      </div>
      {props.children}
    </PlateElement>
  )
}
