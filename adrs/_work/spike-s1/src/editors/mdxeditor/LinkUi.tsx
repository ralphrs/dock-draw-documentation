// UI de link interno do adaptador (teste 5): autocomplete por props.searchPages, link pendente por pendingPageUri.
import { $createLinkNode, $toggleLink } from '@lexical/link'
import { $createTextNode, $getSelection, $isRangeSelection, $setSelection, type BaseSelection, type LexicalEditor } from 'lexical'
import { useState } from 'react'
import { pageUri, pendingPageUri } from '../../shared/pageIndex'
import type { AdapterProps } from '../contract'

export function LinkUi(props: { getEditor: () => LexicalEditor | null; searchPages: AdapterProps['searchPages'] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState<{ editor: LexicalEditor; selection: BaseSelection | null } | null>(null)

  const start = () => {
    const editor = props.getEditor()
    if (!editor) return
    const selection = editor.getEditorState().read(() => $getSelection()?.clone() ?? null)
    setTarget({ editor, selection })
    setQuery('')
    setOpen(true)
  }

  const apply = (url: string, title: string) => {
    if (!target) return
    target.editor.update(
      () => {
        if (target.selection) $setSelection(target.selection.clone())
        const sel = $getSelection()
        if ($isRangeSelection(sel) && !sel.isCollapsed()) $toggleLink(url)
        else if ($isRangeSelection(sel)) sel.insertNodes([$createLinkNode(url).append($createTextNode(title))])
      },
      { discrete: true },
    )
    setOpen(false)
  }

  const results = query ? props.searchPages(query) : []
  return (
    <div className="dok-mdx-toolbar" data-testid="mdx-toolbar">
      <button type="button" data-testid="mdx-link-button" onMouseDown={(e) => e.preventDefault()} onClick={start}>
        Link interno
      </button>
      {open ? (
        <div className="dok-mdx-linkbox" data-testid="mdx-link-box">
          <input
            data-testid="mdx-link-input"
            autoFocus
            placeholder="Buscar página"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          />
          <ul role="listbox">
            {results.map((p) => (
              <li key={p.id} role="option" aria-selected={false}>
                <button type="button" data-testid="mdx-link-suggestion" data-page-id={p.id} onClick={() => apply(pageUri(p.id), p.title)}>
                  {p.title}
                  {p.aliases.length ? ` (${p.aliases.join(', ')})` : ''}
                </button>
              </li>
            ))}
            {query ? (
              <li role="option" aria-selected={false}>
                <button type="button" data-testid="mdx-link-pending" onClick={() => apply(pendingPageUri(query), query)}>
                  Criar página pendente “{query}”
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
