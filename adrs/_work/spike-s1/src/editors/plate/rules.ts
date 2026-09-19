// Regras mdast <-> Slate do adaptador Plate para as diretivas do DokMD.
// Deserialize: a chave é o tipo mdast (mdastToPlate devolve o próprio tipo quando ele não está em MDAST_TO_PLATE).
// Serialize: a chave é o tipo do elemento Slate. O nome da diretiva fica no dado (node.name), nunca aqui.
import { convertChildrenDeserialize, convertNodesDeserialize, convertNodesSerialize, defaultRules, type MdRules } from '@platejs/markdown'

export const DOK_CONTAINER = 'dok_container'
export const DOK_LABEL = 'dok_label'
export const DOK_LEAF = 'dok_leaf'
export const DOK_IMG = 'dok_img'
export const DOK_LINKREF = 'dok_linkref'
export const DOK_IMGREF = 'dok_imgref'
export const DOK_DEFINITION = 'dok_definition'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

const emptyParagraph = () => ({ type: 'p', children: [{ text: '' }] })
const native = defaultRules as Any

/**
 * Regras nativas que perdem campo do mdast, estendidas pelo adaptador (medido na primeira execução com as regras nativas,
 * plate/playwright-output-regras-nativas.txt). Cada uma reaproveita a regra nativa e só devolve o campo que ela descarta.
 */
export const fidelityRules = {
  // a: a regra nativa descarta `title` e troca autolink por nó html (defaultRules.a.serialize).
  a: {
    deserialize: (node: Any, deco: Any, options: Any) => ({ ...native.a.deserialize(node, deco, options), title: node.title ?? null }),
    serialize: (node: Any, options: Any) => ({ type: 'link', url: node.url, title: node.title ?? null, children: convertNodesSerialize(node.children, options) }),
  },
  // code_block: a regra nativa descarta `meta`.
  code_block: {
    deserialize: (node: Any, deco: Any, options: Any) => ({ ...native.code_block.deserialize(node, deco, options), meta: node.meta ?? null }),
    serialize: (node: Any, options: Any) => ({ ...native.code_block.serialize(node, options), meta: node.meta ?? null }),
  },
  // table: a regra nativa descarta `align`.
  table: {
    deserialize: (node: Any, deco: Any, options: Any) => ({ ...native.table.deserialize(node, deco, options), align: node.align ?? null }),
    serialize: (node: Any, options: Any) => ({ ...native.table.serialize(node, options), align: node.align ?? null }),
  },
  // img: a regra nativa cria bloco e o `p` nativo arranca a imagem do parágrafo (splitBlockTypes). Aqui a imagem é inline void.
  img: {
    deserialize: (node: Any) => ({ type: DOK_IMG, url: node.url, title: node.title ?? null, alt: node.alt ?? '', children: [{ text: '' }] }),
  },
  [DOK_IMG]: {
    serialize: (node: Any) => ({ type: 'image', url: node.url, title: node.title ?? null, alt: node.alt ?? '' }),
  },
  // Referências e definições: sem regra nativa, somem em silêncio (buildSlateNode devolve []).
  linkReference: {
    deserialize: (node: Any, deco: Any, options: Any) => ({
      type: DOK_LINKREF,
      identifier: node.identifier,
      label: node.label ?? null,
      referenceType: node.referenceType,
      children: convertChildrenDeserialize(node.children, deco, options),
    }),
  },
  [DOK_LINKREF]: {
    serialize: (node: Any, options: Any) => ({
      type: 'linkReference',
      identifier: node.identifier,
      label: node.label ?? null,
      referenceType: node.referenceType,
      children: convertNodesSerialize(node.children, options),
    }),
  },
  imageReference: {
    deserialize: (node: Any) => ({
      type: DOK_IMGREF,
      identifier: node.identifier,
      label: node.label ?? null,
      referenceType: node.referenceType,
      alt: node.alt ?? '',
      children: [{ text: '' }],
    }),
  },
  [DOK_IMGREF]: {
    serialize: (node: Any) => ({ type: 'imageReference', identifier: node.identifier, label: node.label ?? null, referenceType: node.referenceType, alt: node.alt ?? '' }),
  },
  definition: {
    deserialize: (node: Any) => ({
      type: DOK_DEFINITION,
      identifier: node.identifier,
      label: node.label ?? null,
      url: node.url,
      title: node.title ?? null,
      children: [{ text: '' }],
    }),
  },
  [DOK_DEFINITION]: {
    serialize: (node: Any) => ({ type: 'definition', identifier: node.identifier, label: node.label ?? null, url: node.url, title: node.title ?? null }),
  },
}

export const dokRules: MdRules = {
  ...fidelityRules,
  containerDirective: {
    deserialize: (node: Any, deco: Any, options: Any) => {
      const [first, ...rest] = (node.children ?? []) as Any[]
      const hasLabel = first?.type === 'paragraph' && first.data?.directiveLabel === true
      const children: Any[] = []
      if (hasLabel) children.push({ type: DOK_LABEL, children: convertChildrenDeserialize(first.children, deco, options) })
      const body = convertNodesDeserialize(hasLabel ? rest : node.children ?? [], deco, options)
      children.push(...(body.length ? body : [emptyParagraph()]))
      return { type: DOK_CONTAINER, name: node.name, attributes: { ...(node.attributes ?? {}) }, children }
    },
  },
  leafDirective: {
    deserialize: (node: Any, deco: Any, options: Any) => ({
      type: DOK_LEAF,
      name: node.name,
      attributes: { ...(node.attributes ?? {}) },
      label: node.children?.length ? convertNodesDeserialize(node.children, deco, options) : [],
      children: [{ text: '' }],
    }),
  },
  [DOK_CONTAINER]: {
    serialize: (node: Any, options: Any) => {
      const kids = node.children as Any[]
      const out: Any[] = []
      let body = kids
      if (kids[0]?.type === DOK_LABEL) {
        out.push({ type: 'paragraph', data: { directiveLabel: true }, children: convertNodesSerialize(kids[0].children, options) })
        body = kids.slice(1)
      }
      out.push(...convertNodesSerialize(body, options))
      return { type: 'containerDirective', name: node.name, attributes: { ...(node.attributes ?? {}) }, children: out }
    },
  },
  [DOK_LABEL]: {
    // Rótulo fora da primeira posição não tem sentido no mdast: vira parágrafo comum.
    serialize: (node: Any, options: Any) => ({ type: 'paragraph', children: convertNodesSerialize(node.children, options) }),
  },
  [DOK_LEAF]: {
    serialize: (node: Any, options: Any) => ({
      type: 'leafDirective',
      name: node.name,
      attributes: { ...(node.attributes ?? {}) },
      children: node.label?.length ? convertNodesSerialize(node.label, options) : [],
    }),
  },
  // Item 13: tentativa de desligar as regras nativas que emitem MDX. O efeito real é medido no teste.
  callout: null,
  comment: null,
  suggestion: null,
} as unknown as MdRules
