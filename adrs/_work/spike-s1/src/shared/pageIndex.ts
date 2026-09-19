// Índice simulado (ADR 002, Apêndice C: "Os spikes dos ADRs 005 e 006 devem simular esse mesmo índice").
export const CURRENT_PAGE_ID = '0192f0a1-5c3e-7a10-8b2c-3d4e5f607182'

export const PAGES = [
  { id: CURRENT_PAGE_ID, title: 'Página corrente', aliases: [] as string[] },
  { id: '0192f0a1-5c3e-7a10-8b2c-3d4e5f607183', title: 'Visão geral', aliases: ['Visão C4'] },
]

export const DIAGRAMS = [
  {
    id: '0192f0a1-6d4f-7b20-9c3d-4e5f60718293',
    title: 'Contexto do Pagamento',
    defaultViewId: '0192f0a1-6d4f-7b20-9c3d-4e5f60718294',
    revisionId: '0192f0a1-6d4f-7b20-9c3d-4e5f60718295',
  },
]

export const ASSETS = [
  { id: '0192f0a1-7e50-7c30-8d4e-5f6071829304', name: 'implantacao.png', kind: 'image' as const },
  { id: '0192f0a1-7e50-7c30-8d4e-5f6071829305', name: 'relatorio-q3.pdf', kind: 'file' as const },
]

/** Autocomplete de página (teste 5): busca por título e alias, sem acento e sem caixa. */
export function searchPages(q: string) {
  const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const nq = norm(q)
  return PAGES.filter((p) => norm(p.title).includes(nq) || p.aliases.some((a) => norm(a).includes(nq)))
}

export const pageUri = (id: string, anchor?: string) => `dok:page/${id}${anchor ? `#${anchor}` : ''}`
export const pendingPageUri = (title: string) => `dok:page/new?title=${encodeURIComponent(title)}`
