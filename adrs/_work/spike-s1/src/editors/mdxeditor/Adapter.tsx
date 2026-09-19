// Adaptador MDXEditor 4.2.5 do spike S-1 (ADR 005). Contrato em ../contract.ts.
// Entrada e saída por DokAST (dokPlugin.tsx). A prop markdown do <MDXEditor> é obrigatória no tipo e no
// código (props.markdown.trim()); recebe string vazia e o conteúdo real entra no postInit do dokPlugin.
import '@mdxeditor/editor/style.css'
import './adapter.css'
import {
  MDXEditor,
  activeEditor$,
  codeBlockPlugin,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  rootEditor$,
  tablePlugin,
  thematicBreakPlugin,
  useCodeBlockEditorContext,
  type CodeBlockEditorDescriptor,
  type CodeBlockEditorProps,
} from '@mdxeditor/editor'
import type { LexicalEditor } from 'lexical'
import { useMemo, useRef, useState } from 'react'
import type { AdapterProps } from '../contract'
import { dokPlugin } from './dokPlugin'
import { LinkUi } from './LinkUi'

type Realm = { getValue(node: unknown): unknown }

/** Chave de localStorage que desliga as mitigações próprias (só para os testes de risco do item 13). */
export const RAW_FLAG = 'spike-mdx-sem-mitigacao'

function codeDescriptor(readOnly: boolean): CodeBlockEditorDescriptor {
  const Editor = ({ code, language, meta }: CodeBlockEditorProps) => {
    const ctx = useCodeBlockEditorContext()
    return (
      <div className="dok-mdx-code" data-testid="dok-code" contentEditable={false}>
        <div className="dok-mdx-code-meta">
          {language || 'texto'} {meta}
        </div>
        <textarea
          data-testid="dok-code-text"
          readOnly={readOnly}
          value={code}
          rows={Math.max(2, code.split('\n').length)}
          onChange={(e) => ctx.setCode(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    )
  }
  return { priority: 0, match: () => true, Editor }
}

export default function Adapter(props: AdapterProps) {
  const [error, setError] = useState<string | null>(null)
  const realmRef = useRef<Realm | null>(null)
  const raw = useMemo(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(RAW_FLAG) === '1'
    } catch {
      return false
    }
  }, [])

  // Plugins criados uma vez: o RealmWithPlugins lê a lista só na montagem. O shell remonta o adaptador ao voltar do modo fonte.
  const plugins = useMemo(
    () => [
      headingsPlugin(),
      quotePlugin(),
      listsPlugin(),
      linkPlugin(),
      tablePlugin(),
      thematicBreakPlugin(),
      codeBlockPlugin({ codeBlockEditorDescriptors: [codeDescriptor(props.readOnly)] }),
      dokPlugin({
        props,
        raw,
        onRealm: (r) => (realmRef.current = r as unknown as Realm),
        onError: (m) => setError(m),
      }),
      markdownShortcutPlugin(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const getEditor = () => {
    const r = realmRef.current
    if (!r) return null
    return ((r.getValue(activeEditor$) ?? r.getValue(rootEditor$)) as LexicalEditor | null) ?? null
  }

  return (
    <div className="dok-mdx" data-testid="mdx-adapter" data-raw={raw ? '1' : '0'}>
      {error ? (
        <div role="alert" data-testid="mdx-import-error">
          {error}
        </div>
      ) : null}
      {props.readOnly ? null : <LinkUi getEditor={getEditor} searchPages={props.searchPages} />}
      <MDXEditor
        markdown=""
        plugins={plugins}
        readOnly={props.readOnly}
        suppressHtmlProcessing
        contentEditableClassName="dok-mdx-content"
      />
    </div>
  )
}
