// Rota de leitura com SSR ligado. Não pode importar código de editor (D-3, teste 7).
import { createFileRoute } from '@tanstack/react-router'
import { RevisionView } from '../shared/revision'
import { textFor, validateEditSearch } from '../shared/loadParams'

export const Route = createFileRoute('/read')({
  validateSearch: validateEditSearch,
  component: () => <RevisionView text={textFor(Route.useSearch())} />,
})
