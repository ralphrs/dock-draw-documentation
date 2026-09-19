// src/content-components/core — só tipos e o mapa de nomes, sem React (D-3).
// A chave é o nome do registro de diretivas do ADR 002; nenhum nome nasce aqui.
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive'
import { DIRECTIVES } from '../../content-format/dokmd.ts'

export type DirectiveName = 'note' | 'tip' | 'caution' | 'danger' | 'tabs' | 'tab' | 'steps' | 'diagram'
export type DirectiveKind = 'containerDirective' | 'leafDirective'
export type DokDirectiveNode = ContainerDirective | LeafDirective

export const DIRECTIVE_NAMES: readonly DirectiveName[] = [
  ...Object.keys(DIRECTIVES.containerDirective),
  ...Object.keys(DIRECTIVES.leafDirective),
] as DirectiveName[]

export const directiveKind = (name: DirectiveName): DirectiveKind =>
  name in DIRECTIVES.leafDirective ? 'leafDirective' : 'containerDirective'

export type AttrField = { key: string; label: string; kind: 'select' | 'text'; options?: readonly string[]; required?: boolean }

/** Fatia edit: o que a UI de edição precisa saber, sem depender da biblioteca do editor. */
export type EditSpec = {
  name: DirectiveName
  label: string
  /** Aparece no menu de inserção (tab não aparece: só nasce dentro de tabs). */
  insertable: boolean
  labelMode: 'none' | 'optional' | 'required'
  attributes: readonly AttrField[]
  /** Nó mdast inicial inserido pela UI. */
  create(input?: Record<string, string>): DokDirectiveNode
}

export type Slice = 'edit' | 'read' | 'export'

/** Teste de completude: todo nome do registro tem a fatia. read e export ficam pendentes até 007 e 010. */
export function missingSlices(registered: Partial<Record<Slice, Partial<Record<DirectiveName, unknown>>>>, slice: Slice) {
  return DIRECTIVE_NAMES.filter((n) => !registered[slice]?.[n])
}
