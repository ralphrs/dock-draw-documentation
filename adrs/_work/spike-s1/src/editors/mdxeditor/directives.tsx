// Descriptors de diretiva gerados a partir do registry (DIRECTIVE_NAMES, EDIT), sem o directivesPlugin oficial.
// O rótulo [..] de container fica fora do editor aninhado: getContent filtra o parágrafo com
// data.directiveLabel e getUpdatedMdastNode o recoloca (o AdmonitionDirectiveDescriptor perde esse dado).
import { AdmonitionDirectiveDescriptor, NestedLexicalEditor, useMdastNodeUpdater, type DirectiveDescriptor, type DirectiveEditorProps } from '@mdxeditor/editor'
import type { ContainerDirective, Directives, LeafDirective } from 'mdast-util-directive'
import type { RootContent } from 'mdast'
import { toString } from 'mdast-util-to-string'
import { DIRECTIVE_NAMES, directiveKind, type DirectiveName, type EditSpec } from '../../content-components/core'
import { EDIT } from '../../content-components/edit'

type Child = ContainerDirective['children'][number]
const isLabel = (c: RootContent | Child): boolean => (c as { data?: { directiveLabel?: boolean } }).data?.directiveLabel === true

/** Callouts: diretivas de container cuja fatia edit declara o atributo variant. */
export const CALLOUT_NAMES = DIRECTIVE_NAMES.filter(
  (n) => directiveKind(n) === 'containerDirective' && EDIT[n].attributes.some((a) => a.key === 'variant'),
)

/** Parágrafo de rótulo criado pela fatia edit (não duplica a forma do nó no adaptador). */
function labelNode(name: DirectiveName, text: string): Child | undefined {
  const created = EDIT[name].create({ label: text }) as ContainerDirective
  return created.children.find(isLabel)
}

/** Atributos na ordem da fatia edit; chaves fora da fatia vão ao fim, sem alteração. */
function withAttr(spec: EditSpec, current: Directives['attributes'], key: string, value: string) {
  const merged: Record<string, string> = {}
  const cur = { ...(current ?? {}) } as Record<string, string | null | undefined>
  cur[key] = value
  for (const f of spec.attributes) {
    const v = cur[f.key]
    if (v !== undefined && v !== null && v !== '') merged[f.key] = v
  }
  for (const [k, v] of Object.entries(cur)) if (!(k in merged) && !spec.attributes.some((f) => f.key === k) && v) merged[k] = v
  return merged
}

function AttrFields(props: { spec: EditSpec; node: Directives; readOnly: boolean; onChange(attrs: Record<string, string>): void }) {
  const { spec, node, readOnly } = props
  return (
    <>
      {spec.attributes.map((f) =>
        f.kind === 'select' ? (
          <label key={f.key} className="dok-mdx-field">
            {f.label}
            <select
              data-testid={`attr-${f.key}`}
              disabled={readOnly}
              value={node.attributes?.[f.key] ?? ''}
              onChange={(e) => props.onChange(withAttr(spec, node.attributes, f.key, e.target.value))}
            >
              <option value="">(padrão)</option>
              {(f.options ?? []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label key={f.key} className="dok-mdx-field">
            {f.label}
            <input
              data-testid={`attr-${f.key}`}
              disabled={readOnly}
              value={node.attributes?.[f.key] ?? ''}
              onChange={(e) => props.onChange(withAttr(spec, node.attributes, f.key, e.target.value))}
            />
          </label>
        ),
      )}
    </>
  )
}

function LabelField(props: { node: ContainerDirective; readOnly: boolean; required: boolean }) {
  const update = useMdastNodeUpdater()
  const { node } = props
  const current = node.children.find(isLabel)
  return (
    <label className="dok-mdx-field">
      Título{props.required ? ' (obrigatório)' : ''}
      <input
        data-testid="directive-label"
        disabled={props.readOnly}
        value={current ? toString(current) : ''}
        onChange={(e) => {
          const body = node.children.filter((c) => !isLabel(c))
          const text = e.target.value
          const lbl = text ? labelNode(node.name as DirectiveName, text) : undefined
          update({ children: lbl ? [lbl, ...body] : body } as Partial<ContainerDirective>)
        }}
      />
    </label>
  )
}

const Body = () => (
  <NestedLexicalEditor<ContainerDirective>
    block
    getContent={(n) => n.children.filter((c) => !isLabel(c))}
    getUpdatedMdastNode={(n, children) => ({ ...n, children: [...n.children.filter(isLabel), ...(children as Child[])] })}
  />
)

function ContainerEditor({ mdastNode, readOnly }: { mdastNode: ContainerDirective; readOnly: boolean }) {
  const update = useMdastNodeUpdater()
  const name = mdastNode.name as DirectiveName
  const spec = EDIT[name]
  const isCallout = CALLOUT_NAMES.includes(name)
  return (
    <div className="dok-mdx-directive" data-testid={`directive-${isCallout ? 'callout' : name}`} data-name={name}>
      <div className="dok-mdx-directive-bar" contentEditable={false}>
        {isCallout ? (
          <label className="dok-mdx-field">
            Tipo
            <select
              data-testid="callout-type"
              disabled={readOnly}
              value={name}
              onChange={(e) => update({ name: e.target.value } as Partial<ContainerDirective>)}
            >
              {CALLOUT_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="dok-mdx-directive-name">{spec.label}</span>
        )}
        {spec.labelMode !== 'none' ? <LabelField node={mdastNode} readOnly={readOnly} required={spec.labelMode === 'required'} /> : null}
        <AttrFields spec={spec} node={mdastNode} readOnly={readOnly} onChange={(attributes) => update({ attributes } as Partial<ContainerDirective>)} />
      </div>
      <Body />
    </div>
  )
}

function LeafEditor({ mdastNode, readOnly }: { mdastNode: LeafDirective; readOnly: boolean }) {
  const update = useMdastNodeUpdater()
  const name = mdastNode.name as DirectiveName
  const spec = EDIT[name]
  return (
    <div className="dok-mdx-directive" data-testid={`directive-${name}`} data-name={name} contentEditable={false}>
      <span className="dok-mdx-directive-name">{spec.label}</span>
      {spec.labelMode !== 'none' ? (
        <label className="dok-mdx-field">
          Descrição
          <input
            data-testid="directive-description"
            disabled={readOnly}
            value={toString(mdastNode)}
            onChange={(e) => {
              const created = EDIT[name].create({ label: e.target.value }) as LeafDirective
              update({ children: created.children } as Partial<LeafDirective>)
            }}
          />
        </label>
      ) : null}
      <AttrFields spec={spec} node={mdastNode} readOnly={readOnly} onChange={(attributes) => update({ attributes } as Partial<LeafDirective>)} />
    </div>
  )
}

/**
 * Um descriptor para os callouts (trocar o tipo não troca o componente nem remonta o editor aninhado)
 * e um por nome para as demais diretivas do registry.
 */
export function makeDirectiveDescriptors(readOnly: boolean, raw = false): DirectiveDescriptor[] {
  const others = DIRECTIVE_NAMES.filter((n) => !CALLOUT_NAMES.includes(n))
  const descriptor = (name: string, test: (n: Directives) => boolean, kind: 'containerDirective' | 'leafDirective', attributes: string[]): DirectiveDescriptor => ({
    name,
    type: kind,
    attributes,
    hasChildren: kind === 'containerDirective',
    testNode: test,
    Editor: ({ mdastNode }: DirectiveEditorProps) =>
      mdastNode.type === 'leafDirective' ? (
        <LeafEditor mdastNode={mdastNode} readOnly={readOnly} />
      ) : (
        <ContainerEditor mdastNode={mdastNode as ContainerDirective} readOnly={readOnly} />
      ),
  })
  // Modo sem mitigação (item 13): callouts pelo AdmonitionDirectiveDescriptor oficial, para medir a perda do rótulo.
  const officialCallout: DirectiveDescriptor = {
    ...AdmonitionDirectiveDescriptor,
    testNode: (n) => n.type === 'containerDirective' && (CALLOUT_NAMES as readonly string[]).includes(n.name),
  }
  return [
    raw ? officialCallout : descriptor(
      'callout',
      (n) => n.type === 'containerDirective' && (CALLOUT_NAMES as readonly string[]).includes(n.name),
      'containerDirective',
      ['variant', 'fold'],
    ),
    ...others.map((name) =>
      descriptor(
        name,
        (n) => n.type === directiveKind(name) && n.name === name,
        directiveKind(name),
        EDIT[name].attributes.map((a) => a.key),
      ),
    ),
  ]
}
