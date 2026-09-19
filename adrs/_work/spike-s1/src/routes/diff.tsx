// E-10 e E-11: publicada = expected.md da fixture; rascunho = texto passado em ?draft= (ou uma edição fixa).
import { createFileRoute } from '@tanstack/react-router'
import { RevisionDiff } from '../shared/revision'
import { textFor } from '../shared/loadParams'

export const Route = createFileRoute('/diff')({
  validateSearch: (s: Record<string, unknown>) => ({
    fixture: s.fixture !== undefined ? Number(s.fixture) : 16,
    draft: typeof s.draft === 'string' ? s.draft : undefined,
  }),
  component: () => {
    const s = Route.useSearch()
    const published = textFor({ fixture: s.fixture, file: 'expected' })
    const draft = s.draft ?? published.replace('Não rode em produção.', 'Nunca rode em produção.') + '\nParágrafo novo.\n'
    return <RevisionDiff published={published} draft={draft} />
  },
})
