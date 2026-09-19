// Plugin próprio do adaptador: entrada e saída por DokAST (importMdastTreeToLexical / exportLexicalTreeToMdast).
// Nada aqui chama o parser ou o serializer Markdown do MDXEditor.
import {
  $createDirectiveNode,
  $isDirectiveNode,
  DirectiveNode,
  NESTED_EDITOR_UPDATED_COMMAND,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  addNestedEditorChild$,
  addTableCellEditorChild$,
  addToMarkdownExtension$,
  activeEditor$,
  codeBlockEditorDescriptors$,
  createActiveEditorSubscription$,
  createRootEditorSubscription$,
  defaultCodeBlockLanguage$,
  directiveDescriptors$,
  exportLexicalTreeToMdast,
  exportVisitors$,
  importMdastTreeToLexical,
  importVisitors$,
  insertDecoratorNode$,
  jsxComponentDescriptors$,
  jsxIsAvailable$,
  realmPlugin,
  rootEditor$,
  type LexicalExportVisitor,
  type MdastImportVisitor,
} from '@mdxeditor/editor'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createListItemNode, $createListNode, $isListItemNode, $isListNode, type ListNode } from '@lexical/list'
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  $isLineBreakNode,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  PASTE_COMMAND,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type LineBreakNode,
  type TextFormatType,
} from 'lexical'
import type { Break, Image, List, Root, RootContent } from 'mdast'
import { directiveToMarkdown, type Directives } from 'mdast-util-directive'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { useEffect } from 'react'
import type { DokDirectiveNode } from '../../content-components/core'
import type { AdapterHandle, AdapterProps } from '../contract'
import { makeDirectiveDescriptors } from './directives'
import { $isDokImageNode, $isDokOpaqueNode, DokImageNode, DokOpaqueNode, isOpaqueType } from './nodes'

type Realm = Parameters<NonNullable<Parameters<typeof realmPlugin>[0]['init']>>[0]

export type DokPluginParams = {
  props: AdapterProps
  /** Desliga as mitigações próprias (ilhas opacas, bloqueio de formatos sem forma DokMD) para medir a biblioteca crua. */
  raw: boolean
  onRealm(realm: Realm): void
  onError(message: string): void
}

/** Formatos do Lexical sem forma DokMD: o LexicalTextVisitor os exporta como JSX (<u>, <sup>, <sub>) ou highlight. */
const BLOCKED_FORMATS: readonly TextFormatType[] = ['underline', 'superscript', 'subscript', 'highlight']

const isDirective = (n: { type: string }) => n.type === 'containerDirective' || n.type === 'leafDirective' || n.type === 'textDirective'

// Cópia do MdastDirectiveVisitor (não exportado pela 4.2.5), sem o ramo de text directive.
const DirectiveImportVisitor: MdastImportVisitor<Directives> = {
  testNode: (node, { directiveDescriptors }) =>
    isDirective(node) && node.type !== 'textDirective' && directiveDescriptors.some((d) => d.testNode(node as Directives)),
  visitNode({ lexicalParent, mdastNode }) {
    (lexicalParent as ElementNode).append($createDirectiveNode(mdastNode))
  },
}
// Cópia do DirectiveVisitor (não exportado), com cópia defensiva do nó guardado.
const DirectiveExportVisitor: LexicalExportVisitor<DirectiveNode, Directives> = {
  testLexicalNode: $isDirectiveNode,
  visitLexicalNode({ actions, mdastParent, lexicalNode }) {
    actions.appendToParent(mdastParent, structuredClone(lexicalNode.getMdastNode()))
  },
}
const ImageImportVisitor: MdastImportVisitor<Image> = {
  testNode: 'image',
  visitNode({ lexicalParent, mdastNode }) {
    (lexicalParent as ElementNode).append(new DokImageNode({ type: 'image', url: mdastNode.url, alt: mdastNode.alt ?? '', title: mdastNode.title ?? null }))
  },
}
const ImageExportVisitor: LexicalExportVisitor<DokImageNode, Image> = {
  testLexicalNode: $isDokImageNode,
  visitLexicalNode({ actions, mdastParent, lexicalNode }) {
    actions.appendToParent(mdastParent, structuredClone(lexicalNode.getMdastNode()))
  },
}
const OpaqueImportVisitor: MdastImportVisitor<RootContent> = {
  testNode: (node) => isOpaqueType(node.type),
  visitNode({ lexicalParent, mdastNode }) {
    (lexicalParent as ElementNode).append(new DokOpaqueNode(mdastNode))
  },
}
const OpaqueExportVisitor: LexicalExportVisitor<DokOpaqueNode, RootContent> = {
  testLexicalNode: $isDokOpaqueNode,
  visitLexicalNode({ actions, mdastParent, lexicalNode }) {
    actions.appendToParent(mdastParent, structuredClone(lexicalNode.getMdastNode()))
  },
}

// Lista com start: o MdastListVisitor e o LexicalListVisitor da 4.2.5 descartam list.start (fixture 05: "3." vira "1.").
// Mesma lógica dos visitors oficiais, acrescida de start. Prioridade 1 para vencer os oficiais.
const ListImportVisitor: MdastImportVisitor<List> = {
  testNode: 'list',
  priority: 1,
  visitNode({ mdastNode, lexicalParent, actions }) {
    const listType = mdastNode.children.some((e) => typeof e.checked === 'boolean') ? 'check' : mdastNode.ordered ? 'number' : 'bullet'
    const list = $createListNode(listType, mdastNode.ordered ? (mdastNode.start ?? 1) : undefined)
    if ($isListItemNode(lexicalParent)) {
      const dedicated = $createListItemNode()
      dedicated.append(list)
      lexicalParent.insertAfter(dedicated)
    } else (lexicalParent as ElementNode).append(list)
    actions.visitChildren(mdastNode, list)
  },
}
const ListExportVisitor: LexicalExportVisitor<ListNode, List> = {
  testLexicalNode: $isListNode,
  priority: 1,
  visitLexicalNode({ lexicalNode, actions }) {
    const ordered = lexicalNode.getListType() === 'number'
    actions.addAndStepInto('list', { ordered, ...(ordered ? { start: lexicalNode.getStart() } : {}), spread: false })
  },
}
// Quebra dura: o LexicalLinebreakVisitor da 4.2.5 exporta LineBreakNode como texto "\n" (quebra mole), e a
// fixture 10 perde o "\\" de fim de linha. O MdastParagraphVisitor usa dois LineBreakNode seguidos dentro de
// item de lista para separar parágrafos; esse par continua como "\n" (convenção da biblioteca).
const BreakExportVisitor: LexicalExportVisitor<LineBreakNode, Break> = {
  testLexicalNode: $isLineBreakNode,
  priority: 1,
  visitLexicalNode({ lexicalNode, mdastParent, actions }) {
    const inItem = $isListItemNode(lexicalNode.getParent())
    const paired = $isLineBreakNode(lexicalNode.getPreviousSibling()) || $isLineBreakNode(lexicalNode.getNextSibling())
    if (inItem && paired) actions.appendToParent(mdastParent, { type: 'text', value: '\n' })
    else actions.appendToParent(mdastParent, { type: 'break' })
  },
}

const depth = (e: LexicalEditor) => {
  let d = 0
  for (let p = (e as unknown as { _parentEditor: LexicalEditor | null })._parentEditor; p; p = (p as unknown as { _parentEditor: LexicalEditor | null })._parentEditor) d++
  return d
}

export const dokPlugin = realmPlugin<DokPluginParams>({
  init(realm, params) {
    if (!params) throw new Error('dokPlugin sem parâmetros')
    const { props, raw } = params
    const nested = new Set<LexicalEditor>()
    ;(realm as unknown as { __dokNested: Set<LexicalEditor> }).__dokNested = nested

    // Registra cada editor aninhado (diretivas e células de tabela) para o flush síncrono do getTree().
    const NestedRegistrar = () => {
      const [editor] = useLexicalComposerContext()
      useEffect(() => {
        nested.add(editor)
        return () => {
          nested.delete(editor)
        }
      }, [editor])
      return null
    }

    const insertInto = (editor: LexicalEditor, tree: Root) => {
      const mdastRoot: Root = { type: 'root', children: structuredClone(tree.children.filter((c) => c.type !== 'yaml')) }
      editor.update(
        () => {
          const collected: LexicalNode[] = []
          const point = { append: (n: LexicalNode) => void collected.push(n), getType: () => 'root' }
          importMdastTreeToLexical({
            root: point,
            mdastRoot,
            visitors: realm.getValue(importVisitors$),
            directiveDescriptors: realm.getValue(directiveDescriptors$),
            codeBlockEditorDescriptors: realm.getValue(codeBlockEditorDescriptors$),
            defaultCodeBlockLanguage: realm.getValue(defaultCodeBlockLanguage$),
            jsxComponentDescriptors: realm.getValue(jsxComponentDescriptors$),
          })
          if ($getSelection()) $insertNodes(collected)
          else $getRoot().append(...collected)
        },
        { discrete: true },
      )
    }
    ;(realm as unknown as { __dokInsertInto: typeof insertInto }).__dokInsertInto = insertInto

    const onPaste = (event: ClipboardEvent | KeyboardEvent | InputEvent, editor: LexicalEditor) => {
      const data = (event as ClipboardEvent).clipboardData
      if (!data) return false
      event.preventDefault()
      const text = data.getData('text/plain')
      const html = data.getData('text/html')
      const result = props.importDialect(html ? { text, html } : { text })
      try {
        insertInto(editor, result.tree)
      } catch (e) {
        params.onError(`colar: ${(e as Error).message}`)
      }
      return true
    }

    realm.pubIn({
      [directiveDescriptors$]: makeDirectiveDescriptors(props.readOnly, raw),
      [addImportVisitor$]: [DirectiveImportVisitor, ImageImportVisitor, ListImportVisitor, ...(raw ? [] : [OpaqueImportVisitor])],
      [addLexicalNode$]: [DirectiveNode, DokImageNode, DokOpaqueNode],
      [addExportVisitor$]: [DirectiveExportVisitor, ImageExportVisitor, OpaqueExportVisitor, ListExportVisitor, BreakExportVisitor],
      // Só para o listener interno do core que mantém markdown$ (não é caminho de persistência):
      // sem estes handlers o toMarkdown dele lança para diretivas e notas de rodapé.
      [addToMarkdownExtension$]: [directiveToMarkdown(), gfmToMarkdown()],
      [addNestedEditorChild$]: NestedRegistrar,
      [addTableCellEditorChild$]: NestedRegistrar,
    })
    const subs = [
      (editor: LexicalEditor) => editor.registerCommand(PASTE_COMMAND, (e) => onPaste(e, editor), COMMAND_PRIORITY_CRITICAL),
      ...(raw
        ? []
        : [
            (editor: LexicalEditor) =>
              editor.registerCommand(FORMAT_TEXT_COMMAND, (format) => BLOCKED_FORMATS.includes(format), COMMAND_PRIORITY_CRITICAL),
          ]),
    ]
    realm.pub(createActiveEditorSubscription$, subs)
    realm.pub(createRootEditorSubscription$, subs)
  },

  postInit(realm, params) {
    if (!params) return
    const { props } = params
    const root = realm.getValue(rootEditor$)
    if (!root) {
      params.onError('rootEditor$ vazio no postInit')
      return
    }
    const nested = (realm as unknown as { __dokNested: Set<LexicalEditor> }).__dokNested
    const insertInto = (realm as unknown as { __dokInsertInto: (e: LexicalEditor, t: Root) => void }).__dokInsertInto

    // Entrada: DokAST → Lexical, pela API pública, a partir de props.initialTree (cópia).
    try {
      const mdastRoot: Root = structuredClone(props.initialTree)
      root.update(
        () => {
          $getRoot().clear()
          importMdastTreeToLexical({
            root: $getRoot(),
            mdastRoot,
            visitors: realm.getValue(importVisitors$),
            directiveDescriptors: realm.getValue(directiveDescriptors$),
            codeBlockEditorDescriptors: realm.getValue(codeBlockEditorDescriptors$),
            defaultCodeBlockLanguage: realm.getValue(defaultCodeBlockLanguage$),
            jsxComponentDescriptors: realm.getValue(jsxComponentDescriptors$),
          })
        },
        { discrete: true, tag: 'historic' },
      )
    } catch (e) {
      params.onError(`importação: ${(e as Error).name}: ${(e as Error).message}`)
    }

    root.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size || dirtyLeaves.size) props.onChange()
    })

    const flushNested = () => {
      // Os editores aninhados só gravam no nó pai no blur; o save não passa por blur.
      // Do mais fundo para o mais raso, para o pai exportar o filho já atualizado.
      const editors = [...nested].sort((a, b) => depth(b) - depth(a))
      for (const e of editors) e.dispatchCommand(NESTED_EDITOR_UPDATED_COMMAND, undefined)
    }

    const handle: AdapterHandle = {
      getTree() {
        flushNested()
        let out: Root = { type: 'root', children: [] }
        root.getEditorState().read(() => {
          out = exportLexicalTreeToMdast({
            root: $getRoot(),
            visitors: realm.getValue(exportVisitors$),
            jsxComponentDescriptors: realm.getValue(jsxComponentDescriptors$),
            jsxIsAvailable: realm.getValue(jsxIsAvailable$),
            addImportStatements: false,
          })
        })
        return out
      },
      insertTree(tree) {
        insertInto(realm.getValue(activeEditor$) ?? root, tree)
      },
      insertDirective(node: DokDirectiveNode) {
        realm.pub(insertDecoratorNode$, () => $createDirectiveNode(structuredClone(node)))
      },
      focus() {
        root.focus()
      },
    }
    params.onRealm(realm)
    props.onReady(handle)
  },
})
