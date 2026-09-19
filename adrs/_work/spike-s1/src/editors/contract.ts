// Contrato entre o shell compartilhado e o adaptador de cada editor (desenho aprovado na parada 3):
// o adaptador recebe e devolve DokAST. O parser e o serializer Markdown da biblioteca NUNCA são chamados.
// Entrada: parseDok → árvore da biblioteca. Saída: árvore da biblioteca → mdast → serializeDok.
import type { ComponentType } from 'react'
import type { Root } from 'mdast'
import type { DokDirectiveNode } from '../content-components/core'
import type { importDialect } from '../shared/importDialect'
import type { searchPages } from '../shared/pageIndex'

export type AdapterHandle = {
  /** Árvore atual convertida para mdast, sem o nó yaml (o frontmatter fica fora do editor). */
  getTree(): Root
  /** Insere uma árvore pronta na seleção (colar via importDialect). Ignora nós yaml: o frontmatter é do shell. */
  insertTree(tree: Root): void
  /** Insere uma diretiva criada pela fatia edit (menu de inserção do shell). */
  insertDirective(node: DokDirectiveNode): void
  focus(): void
}

export type AdapterProps = {
  /** DokAST de parseDok(texto carregado), sem o nó yaml. */
  initialTree: Root
  readOnly: boolean
  onChange(): void
  onReady(handle: AdapterHandle): void
  /** Todo colar entrega o texto cru a esta porta; nunca ao parser próprio do editor. */
  importDialect: typeof importDialect
  searchPages: typeof searchPages
}

export type EditorAdapter = ComponentType<AdapterProps>
