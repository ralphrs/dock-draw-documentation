// Adaptador Plate 53.3.14 do spike S-1 (ADR 005). Contrato em ../contract.ts.
// Entrada: props.initialTree (DokAST) -> mdastToSlate. Saída: editor.children -> convertNodesSerialize -> mdast Root.
// O parser e o serializer Markdown do Plate (deserializeMd, serializeMd, api.markdown.*) não são chamados.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Root, RootContent } from 'mdast'
import { Plate, PlateContent, createPlatePlugin, usePlateEditor } from 'platejs/react'
import { BasicBlocksPlugin, BasicMarksPlugin } from '@platejs/basic-nodes/react'
import { ListPlugin } from '@platejs/list/react'
import { toggleList } from '@platejs/list'
import { TablePlugin } from '@platejs/table/react'
import { LinkPlugin } from '@platejs/link/react'
import { CodeBlockPlugin } from '@platejs/code-block/react'
import { FootnoteDefinitionPlugin, FootnoteReferencePlugin } from '@platejs/footnote/react'
import { MarkdownPlugin, convertNodesSerialize, getMergedOptionsDeserialize, getMergedOptionsSerialize, mdastToSlate } from '@platejs/markdown'
import type { AdapterHandle, AdapterProps } from '../contract'
import { pageUri, pendingPageUri } from '../../shared/pageIndex'
import { DOK_CONTAINER, DOK_DEFINITION, DOK_IMG, DOK_IMGREF, DOK_LABEL, DOK_LEAF, DOK_LINKREF, dokRules } from './rules'
import { DokContainerElement, DokDefinitionElement, DokImgElement, DokLabelElement, DokLeafElement, DokLinkRefElement } from './elements'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

/** Opções de serialize do Plate: sem ZWSP (U+200B) em parágrafo vazio (normalizeParagraphLineBreaks). */
const SERIALIZE_OPTS = { preserveEmptyParagraphs: false } as Any

const DokContainerPlugin = createPlatePlugin({ key: DOK_CONTAINER, node: { isElement: true, component: DokContainerElement } })
const DokLabelPlugin = createPlatePlugin({ key: DOK_LABEL, node: { isElement: true, component: DokLabelElement } })
const DokLeafPlugin = createPlatePlugin({ key: DOK_LEAF, node: { isElement: true, isVoid: true, component: DokLeafElement } })
const DokImgPlugin = createPlatePlugin({ key: DOK_IMG, node: { isElement: true, isInline: true, isVoid: true, component: DokImgElement } })
const DokImgRefPlugin = createPlatePlugin({ key: DOK_IMGREF, node: { isElement: true, isInline: true, isVoid: true, component: DokImgElement } })
const DokLinkRefPlugin = createPlatePlugin({ key: DOK_LINKREF, node: { isElement: true, isInline: true, component: DokLinkRefElement } })
const DokDefinitionPlugin = createPlatePlugin({ key: DOK_DEFINITION, node: { isElement: true, isVoid: true, component: DokDefinitionElement } })

function withoutYaml(tree: Root): Root {
  return { type: 'root', children: tree.children.filter((c) => c.type !== 'yaml') }
}

export default function Adapter(props: AdapterProps) {
  const propsRef = useRef(props)
  propsRef.current = props

  const plugins = useMemo(() => {
    // Colar: parser próprio registrado depois dos plugins do core. O ParserPlugin percorre a lista em ordem reversa,
    // então este parser é consultado antes do deserializador HTML do core (precedência medida no teste 8).
    const PastePlugin = createPlatePlugin({
      key: 'dok_paste',
      parser: {
        mimeTypes: ['text/plain', 'text/html'],
        deserialize: ({ editor, dataTransfer }: Any) => {
          const text = dataTransfer.getData('text/plain') ?? ''
          const html = dataTransfer.getData('text/html') || undefined
          const result = propsRef.current.importDialect({ text, ...(html ? { html } : {}) })
          const nodes = toSlate(editor, result.tree)
          return nodes.length ? nodes : [{ text: '' }]
        },
      } as Any,
    })
    return [
      BasicBlocksPlugin,
      BasicMarksPlugin,
      ListPlugin,
      TablePlugin,
      // removeEmpty: o LinkPlugin remove link sem texto na normalização; `[](dok:page/…)` é forma válida (título vivo).
      LinkPlugin.configure({ rules: { normalize: { removeEmpty: false } } } as Any),
      CodeBlockPlugin,
      FootnoteReferencePlugin,
      FootnoteDefinitionPlugin,
      DokContainerPlugin,
      DokLabelPlugin,
      DokLeafPlugin,
      DokImgPlugin,
      DokImgRefPlugin,
      DokLinkRefPlugin,
      DokDefinitionPlugin,
      MarkdownPlugin.configure({ parser: null, options: { rules: dokRules } } as Any),
      PastePlugin,
    ]
  }, [])

  const editor = usePlateEditor({
    plugins: plugins as Any,
    // mdastToSlate devolve inline (link, imagem) sem texto irmão, fora do schema do Slate; sem normalizar a carga,
    // selecionar tudo e apagar não remove nada (medido na fixture 27).
    shouldNormalizeEditor: true,
    // structuredClone: mdastToSlate reescreve root.children (buildSlateRoot) e o initialTree é estado do shell.
    value: (ed: Any) => {
      const nodes = toSlate(ed, props.initialTree)
      return nodes.length ? nodes : [{ type: 'p', children: [{ text: '' }] }]
    },
  } as Any) as Any

  useEffect(() => {
    const handle: AdapterHandle = {
      getTree: () => fromSlate(editor),
      insertTree: (tree) => {
        const nodes = toSlate(editor, tree)
        if (!nodes.length) return
        editor.tf.insertFragment(nodes)
      },
      insertDirective: (node) => {
        const nodes = toSlate(editor, { type: 'root', children: [node as RootContent] })
        if (!nodes.length) return
        insertTopLevel(editor, nodes)
      },
      focus: () => editor.tf.focus(),
    }
    props.onReady(handle)
    // Instrumentação de teste (item 13): acesso ao editor Slate para sondar regras nativas. Não participa do save.
    ;(window as unknown as { __plateEditor?: unknown }).__plateEditor = editor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  return (
    <Plate editor={editor} onChange={() => propsRef.current.onChange()}>
      {props.readOnly ? null : <Toolbar editor={editor} searchPages={props.searchPages} />}
      <PlateContent
        data-testid="plate-content"
        readOnly={props.readOnly}
        style={{ minHeight: 120, padding: 8, outline: 'none', color: 'var(--foreground)', background: 'var(--background)' }}
      />
    </Plate>
  )
}

function toSlate(editor: Any, tree: Root): Any[] {
  const clone = structuredClone(withoutYaml(tree))
  return mdastToSlate(clone as Any, getMergedOptionsDeserialize(editor, {}) as Any) as Any[]
}

function fromSlate(editor: Any): Root {
  const options = getMergedOptionsSerialize(editor, SERIALIZE_OPTS)
  return { type: 'root', children: convertNodesSerialize(editor.children, options as Any, true) as RootContent[] }
}

/** Menu Inserir: a diretiva entra como bloco de topo depois do bloco corrente (ou no lugar de um parágrafo vazio). */
function insertTopLevel(editor: Any, nodes: Any[]) {
  const sel = editor.selection
  const top = sel ? sel.anchor.path[0] : editor.children.length - 1
  const current = editor.children[top]
  const isEmptyP = current && current.type === 'p' && !current.listStyleType && editor.api.string([top]) === ''
  editor.tf.withoutNormalizing(() => {
    if (isEmptyP) {
      editor.tf.removeNodes({ at: [top] })
      editor.tf.insertNodes(nodes, { at: [top] })
    } else {
      editor.tf.insertNodes(nodes, { at: [top + 1] })
    }
  })
  const at = isEmptyP ? top : top + 1
  const start = editor.api.start([at])
  if (start) editor.tf.select(start)
  editor.tf.focus()
}

function Toolbar(props: { editor: Any; searchPages: AdapterProps['searchPages'] }) {
  const { editor } = props
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const saved = useRef<Any>(null)
  const results = q ? props.searchPages(q) : []

  const insertLink = (url: string, fallbackText: string) => {
    const sel = saved.current
    if (sel) editor.tf.select(sel)
    const selected = sel ? editor.api.string(sel) : ''
    if (selected) {
      editor.tf.wrapNodes({ type: 'a', url, children: [] }, { split: true })
    } else {
      editor.tf.insertNodes({ type: 'a', url, children: [{ text: fallbackText }] })
    }
    setOpen(false)
    setQ('')
    editor.tf.focus()
  }

  return (
    <div className="flex gap-2" style={{ marginBottom: 4 }}>
      <button
        type="button"
        data-testid="plate-list-bullet"
        onMouseDown={(e) => {
          e.preventDefault()
          toggleList(editor, { listStyleType: 'disc' })
        }}
      >
        Lista
      </button>
      <button
        type="button"
        data-testid="plate-link-button"
        onMouseDown={(e) => {
          e.preventDefault()
          saved.current = editor.selection
          setOpen((o) => !o)
        }}
      >
        Link interno
      </button>
      {open ? (
        <div data-testid="plate-link-panel" style={{ border: '1px solid var(--border)', padding: 4 }}>
          <input data-testid="plate-link-query" autoFocus value={q} placeholder="Buscar página" onChange={(e) => setQ(e.target.value)} />
          <ul>
            {results.map((p) => (
              <li key={p.id}>
                <button type="button" data-testid="plate-link-suggestion" onClick={() => insertLink(pageUri(p.id), p.title)}>
                  {p.title}
                </button>
              </li>
            ))}
            {q ? (
              <li>
                <button type="button" data-testid="plate-link-pending" onClick={() => insertLink(pendingPageUri(q), q)}>
                  Criar página pendente “{q}”
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
