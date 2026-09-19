// Rota do editor MDXEditor: só-cliente (ssr: false) e adaptador carregado sob demanda (E-07, teste 7).
import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { EditorShell } from '../shared/EditorShell'
import { textFor, validateEditSearch } from '../shared/loadParams'

const Adapter = lazy(() => import('../editors/mdxeditor/Adapter'))

export const Route = createFileRoute('/edit/mdxeditor')({
  ssr: false,
  validateSearch: validateEditSearch,
  component: Page,
})

function Page() {
  const s = Route.useSearch()
  return (
    <Suspense fallback={<p>Carregando editor…</p>}>
      <EditorShell
        key={`${s.extra}-${s.fixture}-${s.file}-${s.readOnly}`}
        Adapter={Adapter}
        editorName="mdxeditor"
        initialText={textFor(s)}
        readOnly={s.readOnly}
        changesRequested={s.changesRequested}
      />
    </Suspense>
  )
}
