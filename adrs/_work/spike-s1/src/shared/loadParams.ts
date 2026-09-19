// Parâmetros de carga comuns às rotas de edição: ?fixture=NN&file=expected|input&readOnly=1&changesRequested=1
import { extraFile, fixtureByNumber, fixtureFile } from './fixtures'

export type EditSearch = { extra?: string; fixture?: number; file?: 'expected' | 'input'; readOnly?: boolean; changesRequested?: boolean }

export function validateEditSearch(s: Record<string, unknown>): EditSearch {
  return {
    extra: typeof s.extra === 'string' ? s.extra : undefined,
    fixture: s.fixture !== undefined ? Number(s.fixture) : undefined,
    file: s.file === 'input' ? 'input' : s.file === 'expected' ? 'expected' : undefined,
    readOnly: s.readOnly === true || s.readOnly === '1' || s.readOnly === 1,
    changesRequested: s.changesRequested === true || s.changesRequested === '1' || s.changesRequested === 1,
  }
}

export function textFor(s: EditSearch): string {
  if (s.extra) return extraFile(s.extra)
  if (!s.fixture) return fixtureFile('01-frontmatter-minimo', 'expected.md')!
  const f = fixtureByNumber(s.fixture)
  const file = s.file === 'input' || !f.hasExpected ? 'input.md' : 'expected.md'
  return fixtureFile(f.dir, file)!
}
