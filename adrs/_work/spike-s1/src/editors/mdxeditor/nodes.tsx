// Nós Lexical próprios do adaptador MDXEditor.
// DokImageNode substitui o imagePlugin padrão (que faz innerHTML em nós html <img>).
// DokOpaqueNode preserva, sem edição, nós mdast que o MDXEditor 4.2.5 não conhece
// (notas de rodapé, referências e definições). Guarda o nó mdast e o devolve na exportação.
import { DecoratorNode, type LexicalNode, type NodeKey, type SerializedLexicalNode } from 'lexical'
import type { Image, Nodes, RootContent } from 'mdast'
import { toString } from 'mdast-util-to-string'
import type { ReactElement } from 'react'

type SerializedMdast = SerializedLexicalNode & { mdastNode: unknown }

export class DokImageNode extends DecoratorNode<ReactElement> {
  __mdast: Image

  static getType() {
    return 'dok-image'
  }
  static clone(node: DokImageNode) {
    return new DokImageNode(structuredClone(node.__mdast), node.__key)
  }
  static importJSON(s: SerializedMdast) {
    return new DokImageNode(s.mdastNode as Image)
  }
  constructor(mdast: Image, key?: NodeKey) {
    super(key)
    this.__mdast = mdast
  }
  exportJSON(): SerializedMdast {
    return { type: 'dok-image', version: 1, mdastNode: structuredClone(this.__mdast) }
  }
  getMdastNode(): Image {
    return this.getLatest().__mdast
  }
  createDOM() {
    return document.createElement('span')
  }
  updateDOM() {
    return false
  }
  isInline() {
    return true
  }
  decorate() {
    // Sem <img>: dok:asset/... não é resolvível no spike e geraria erro de rede no console.
    return (
      <span data-testid="dok-image" className="dok-mdx-image" title={this.__mdast.url}>
        [imagem: {this.__mdast.alt || this.__mdast.url}]
      </span>
    )
  }
}

export const $isDokImageNode = (n: LexicalNode | null | undefined): n is DokImageNode => n instanceof DokImageNode

/** Tipos mdast sem visitor no MDXEditor 4.2.5, preservados como ilha opaca. */
export const OPAQUE_INLINE = ['footnoteReference', 'linkReference', 'imageReference'] as const
export const OPAQUE_BLOCK = ['footnoteDefinition', 'definition'] as const
const OPAQUE_TYPES: readonly string[] = [...OPAQUE_INLINE, ...OPAQUE_BLOCK]
export const isOpaqueType = (t: string) => OPAQUE_TYPES.includes(t)

function preview(n: Nodes): string {
  switch (n.type) {
    case 'footnoteReference':
      return `[^${n.label ?? n.identifier}]`
    case 'footnoteDefinition':
      return `[^${n.label ?? n.identifier}]: ${toString(n)}`
    case 'linkReference':
      return `[${toString(n)}][${n.label ?? n.identifier}]`
    case 'imageReference':
      return `![${n.alt ?? ''}][${n.label ?? n.identifier}]`
    case 'definition':
      return `[${n.label ?? n.identifier}]: ${n.url}`
    default:
      return n.type
  }
}

export class DokOpaqueNode extends DecoratorNode<ReactElement> {
  __mdast: RootContent

  static getType() {
    return 'dok-opaque'
  }
  static clone(node: DokOpaqueNode) {
    return new DokOpaqueNode(structuredClone(node.__mdast), node.__key)
  }
  static importJSON(s: SerializedMdast) {
    return new DokOpaqueNode(s.mdastNode as RootContent)
  }
  constructor(mdast: RootContent, key?: NodeKey) {
    super(key)
    this.__mdast = mdast
  }
  exportJSON(): SerializedMdast {
    return { type: 'dok-opaque', version: 1, mdastNode: structuredClone(this.__mdast) }
  }
  getMdastNode(): RootContent {
    return this.getLatest().__mdast
  }
  createDOM() {
    return document.createElement(this.isInline() ? 'span' : 'div')
  }
  updateDOM() {
    return false
  }
  isInline() {
    return (OPAQUE_INLINE as readonly string[]).includes(this.__mdast.type)
  }
  decorate() {
    return (
      <span data-testid="dok-opaque" data-type={this.__mdast.type} className="dok-mdx-opaque" contentEditable={false}>
        {preview(this.__mdast)}
      </span>
    )
  }
}

export const $isDokOpaqueNode = (n: LexicalNode | null | undefined): n is DokOpaqueNode => n instanceof DokOpaqueNode
