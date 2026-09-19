// src/content-components/edit — fatia edit (ADR 005). Sem código de biblioteca de editor:
// os adaptadores (src/editors/<lib>) traduzem estes specs para nós da biblioteca.
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive'
import type { Paragraph } from 'mdast'
import { CALLOUT_VARIANTS } from '../../../content-format/dokmd.ts'
import type { DirectiveName, EditSpec } from '../core'

const label = (text: string): Paragraph => ({ type: 'paragraph', data: { directiveLabel: true }, children: [{ type: 'text', value: text }] })
const para = (text: string): Paragraph => ({ type: 'paragraph', children: [{ type: 'text', value: text }] })

const callout = (name: 'note' | 'tip' | 'caution' | 'danger', title: string): EditSpec => ({
  name,
  label: title,
  insertable: true,
  labelMode: 'optional',
  attributes: [
    { key: 'variant', label: 'Variante', kind: 'select', options: CALLOUT_VARIANTS },
    { key: 'fold', label: 'Recolher', kind: 'select', options: ['open', 'closed'] },
  ],
  create: (input) => {
    const n: ContainerDirective = { type: 'containerDirective', name, attributes: {}, children: [] }
    if (input?.label) n.children.push(label(input.label))
    n.children.push(para(input?.text ?? ''))
    return n
  },
})

export const EDIT: Record<DirectiveName, EditSpec> = {
  note: callout('note', 'Nota'),
  tip: callout('tip', 'Dica'),
  caution: callout('caution', 'Cuidado'),
  danger: callout('danger', 'Perigo'),
  tabs: {
    name: 'tabs',
    label: 'Abas',
    insertable: true,
    labelMode: 'none',
    attributes: [{ key: 'sync', label: 'Sincronizar', kind: 'text' }],
    create: () => ({
      type: 'containerDirective',
      name: 'tabs',
      attributes: {},
      children: [EDIT.tab.create({ label: 'Aba 1' }) as ContainerDirective, EDIT.tab.create({ label: 'Aba 2' }) as ContainerDirective],
    }),
  },
  tab: {
    name: 'tab',
    label: 'Aba',
    insertable: false,
    labelMode: 'required',
    attributes: [],
    create: (input) => ({ type: 'containerDirective', name: 'tab', attributes: {}, children: [label(input?.label ?? 'Aba'), para('')] }),
  },
  steps: {
    name: 'steps',
    label: 'Passos',
    insertable: true,
    labelMode: 'none',
    attributes: [],
    create: () => ({
      type: 'containerDirective',
      name: 'steps',
      attributes: {},
      children: [{ type: 'list', ordered: true, spread: false, children: [{ type: 'listItem', spread: false, children: [para('Passo 1')] }] }],
    }),
  },
  diagram: {
    name: 'diagram',
    label: 'Diagrama',
    insertable: true,
    labelMode: 'optional',
    attributes: [
      { key: 'src', label: 'Diagrama', kind: 'text', required: true },
      { key: 'view', label: 'View', kind: 'text', required: true },
      { key: 'rev', label: 'Revisão', kind: 'text' },
      { key: 'title', label: 'Título', kind: 'text', required: true },
    ],
    // Forma da fixture 23: ::diagram[descrição]{src view [rev] title}, atributos na ordem do registro.
    create: (input) => {
      const n: LeafDirective = {
        type: 'leafDirective',
        name: 'diagram',
        attributes: { src: input?.src ?? '', view: input?.view ?? '', ...(input?.rev ? { rev: input.rev } : {}), title: input?.title ?? '' },
        children: input?.label ? [{ type: 'text', value: input.label }] : [],
      }
      return n
    },
  },
}
