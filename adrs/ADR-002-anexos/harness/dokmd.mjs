// Implementação de referência do DokMD v1 usada no spike do ADR 002.
// Não é o código de produção (esse vai para src/content-format/ em TS strict),
// mas segue exatamente as regras do ADR: é a prova executável de F-02.

import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import { directive } from 'micromark-extension-directive'
import { directiveFromMarkdown, directiveToMarkdown } from 'mdast-util-directive'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { visit, SKIP } from 'unist-util-visit'
import YAML from 'yaml'
import { z } from 'zod'

export const DOK_FORMAT_VERSION = 1

// ---------------------------------------------------------------------------
// Sintaxe: CommonMark + GFM + frontmatter YAML + directives SÓ DE BLOCO.
// Text directives (`:nome`) ficam desligadas: com elas, "Hora:agora" e
// "dok:page/…" viram nós de diretiva e o serializer escapa ":" até em URLs.
// ---------------------------------------------------------------------------
const directiveSyntax = directive()
const flowOnlyDirectives = { flow: directiveSyntax.flow }

const directiveMd = directiveToMarkdown()
const flowOnlyDirectiveMd = {
  ...directiveMd,
  unsafe: directiveMd.unsafe.filter(
    (u) => !(u.character === ':' && u.inConstruct?.includes?.('phrasing')),
  ),
}

export const SERIALIZE_OPTIONS = {
  bullet: '-',
  bulletOther: '*',
  bulletOrdered: '.',
  emphasis: '_',
  strong: '*',
  rule: '-',
  fence: '`',
  fences: true,
  listItemIndent: 'one',
  incrementListMarker: true,
  setext: false,
  closeAtx: false,
  quote: '"',
  resourceLink: false,
  tightDefinitions: false,
}

export function parse(text) {
  return fromMarkdown(text, {
    extensions: [frontmatter(['yaml']), gfm(), flowOnlyDirectives],
    mdastExtensions: [frontmatterFromMarkdown(['yaml']), gfmFromMarkdown(), directiveFromMarkdown()],
  })
}

export function serialize(tree) {
  return toMarkdown(tree, {
    ...SERIALIZE_OPTIONS,
    extensions: [frontmatterToMarkdown(['yaml']), gfmToMarkdown(), flowOnlyDirectiveMd],
  })
}

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------
const tag = z
  .string()
  .max(64)
  .regex(/^(?!\d+$)[\p{L}\p{N}_/-]+$/u, 'tag: letras, números, _ - / e ao menos um não-dígito')
const propKey = z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/)
const propScalar = z.union([z.string(), z.number(), z.boolean(), z.null()])
const propValue = z.union([propScalar, z.array(z.union([z.string(), z.number(), z.boolean()]))])
const uniq = (arr) => new Set(arr).size === arr.length

export const frontmatterSchema = z.strictObject({
  dok: z.literal(DOK_FORMAT_VERSION),
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(300).optional(),
  tags: z.array(tag).max(50).refine(uniq, 'tags duplicadas').optional(),
  aliases: z.array(z.string().trim().min(1).max(200)).max(20).refine(uniq, 'aliases duplicados').optional(),
  props: z.record(propKey, propValue).optional(),
})

export const FRONTMATTER_KEY_ORDER = ['dok', 'id', 'title', 'description', 'tags', 'aliases', 'props']

function canonicalYaml(data) {
  const ordered = {}
  for (const k of FRONTMATTER_KEY_ORDER) if (data[k] !== undefined) ordered[k] = data[k]
  for (const k of Object.keys(data)) if (!(k in ordered)) ordered[k] = data[k] // mantém p/ o validador acusar
  if (ordered.props && typeof ordered.props === 'object') {
    ordered.props = Object.fromEntries(Object.entries(ordered.props).sort(([a], [b]) => (a < b ? -1 : 1)))
  }
  return YAML.stringify(ordered, { lineWidth: 0 }).trimEnd()
}

// ---------------------------------------------------------------------------
// Diretivas registradas (v1)
// ---------------------------------------------------------------------------
export const CALLOUT_NAMES = ['note', 'tip', 'caution', 'danger']
export const CALLOUT_VARIANTS = [
  'info', 'important', 'abstract', 'summary', 'tldr', 'todo', 'quote', 'cite',
  'hint', 'success', 'check', 'done', 'example', 'question', 'help', 'faq',
  'warning', 'attention', 'error', 'bug', 'failure', 'fail', 'missing',
]
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const SLUG = /^[a-z0-9][a-z0-9-]*$/

export const DIRECTIVES = {
  containerDirective: {
    note: { attrs: ['variant', 'fold'] },
    tip: { attrs: ['variant', 'fold'] },
    caution: { attrs: ['variant', 'fold'] },
    danger: { attrs: ['variant', 'fold'] },
    tabs: { attrs: ['sync'] },
    tab: { attrs: [], labelRequired: true },
    steps: { attrs: [] },
  },
  leafDirective: {
    diagram: { attrs: ['src', 'view', 'rev', 'title'] },
  },
}

const ATTR_RULES = {
  variant: (v) => CALLOUT_VARIANTS.includes(v),
  fold: (v) => v === 'open' || v === 'closed',
  sync: (v) => SLUG.test(v),
  src: (v) => /^dok:diagram\//.test(v) && UUID.test(v.slice('dok:diagram/'.length)),
  view: (v) => UUID.test(v),
  rev: (v) => UUID.test(v),
  title: (v) => v.trim().length > 0 && v.length <= 200,
}

// ---------------------------------------------------------------------------
// URIs
// ---------------------------------------------------------------------------
export function classifyUrl(url, { image = false } = {}) {
  const lower = url.trim().toLowerCase()
  if (/^(javascript|vbscript|data|file):/.test(lower)) return { kind: 'forbidden' }
  if (lower.startsWith('dok:')) {
    let m
    if ((m = url.match(/^dok:page\/([0-9a-f-]{36})(?:#([a-z0-9-]+))?$/)) && UUID.test(m[1]))
      return image ? { kind: 'invalid' } : { kind: 'page', id: m[1], anchor: m[2] }
    if ((m = url.match(/^dok:page\/new\?title=([^#\s]+)$/)))
      return image ? { kind: 'invalid' } : { kind: 'unresolved', title: decodeURIComponent(m[1]) }
    if ((m = url.match(/^dok:asset\/([0-9a-f-]{36})$/)) && UUID.test(m[1])) return { kind: 'asset', id: m[1] }
    if ((m = url.match(/^dok:diagram\/([0-9a-f-]{36})(?:\?view=([0-9a-f-]{36}))?$/)) && UUID.test(m[1]))
      return image ? { kind: 'invalid' } : { kind: 'diagram', id: m[1], view: m[2] }
    return { kind: 'invalid' }
  }
  if (/^https:\/\//.test(lower)) return { kind: 'external' }
  if (!image && /^(http:\/\/|mailto:)/.test(lower)) return { kind: 'external' }
  if (!image && /^#[a-z0-9-]+$/.test(url)) return { kind: 'self-anchor' }
  return { kind: 'relative' }
}

// ---------------------------------------------------------------------------
// Normalização canônica (transformações que o save sempre aplica)
// ---------------------------------------------------------------------------
function inlineReferences(tree) {
  const defs = new Map()
  visit(tree, 'definition', (n) => {
    const key = n.identifier.toLowerCase()
    if (!defs.has(key)) defs.set(key, n)
  })
  visit(tree, (n, i, parent) => {
    if (n.type === 'linkReference' || n.type === 'imageReference') {
      const d = defs.get(n.identifier.toLowerCase())
      if (!d || !parent) return
      const repl =
        n.type === 'linkReference'
          ? { type: 'link', url: d.url, title: d.title ?? null, children: n.children }
          : { type: 'image', url: d.url, title: d.title ?? null, alt: n.alt }
      parent.children[i] = repl
    }
  })
  visit(tree, 'definition', (_n, i, parent) => {
    parent.children.splice(i, 1)
    return [SKIP, i]
  })
}

function reorderDirectiveAttributes(tree) {
  visit(tree, (n) => {
    if (n.type !== 'containerDirective' && n.type !== 'leafDirective') return
    const spec = DIRECTIVES[n.type]?.[n.name]
    if (!spec || !n.attributes) return
    const out = {}
    for (const k of spec.attrs) if (n.attributes[k] !== undefined && n.attributes[k] !== null) out[k] = n.attributes[k]
    for (const k of Object.keys(n.attributes)) if (!(k in out)) out[k] = n.attributes[k]
    n.attributes = out
  })
}

export function normalize(text) {
  const tree = parse(text)
  const first = tree.children[0]
  if (first?.type === 'yaml') {
    try {
      first.value = canonicalYaml(YAML.parse(first.value) ?? {})
    } catch {
      /* YAML inválido: o validador acusa */
    }
  }
  inlineReferences(tree)
  reorderDirectiveAttributes(tree)
  return serialize(tree)
}

// ---------------------------------------------------------------------------
// Validação (erros E bloqueiam o save; avisos W não)
// ---------------------------------------------------------------------------
export function validate(text) {
  const diags = []
  const add = (code, msg, node) => diags.push({ code, msg, line: node?.position?.start.line })
  const tree = parse(text)

  const first = tree.children[0]
  if (first?.type !== 'yaml') add('DOK-E001', 'frontmatter ausente')
  else {
    let data
    try {
      data = YAML.parse(first.value)
    } catch (e) {
      add('DOK-E001', `YAML inválido: ${e.message}`, first)
    }
    if (data && typeof data.dok === 'number' && data.dok > DOK_FORMAT_VERSION)
      add('DOK-E009', `versão de formato ${data.dok} é mais nova que ${DOK_FORMAT_VERSION}`, first)
    else if (data !== undefined) {
      const r = frontmatterSchema.safeParse(data)
      if (!r.success)
        for (const iss of r.error.issues) add('DOK-E001', `${iss.path.join('.') || '(raiz)'}: ${iss.message}`, first)
    }
  }

  visit(tree, (n, _i, parent) => {
    if (n.type === 'yaml' && n !== first) add('DOK-E001', 'frontmatter fora do topo', n)
    if (n.type === 'html') add('DOK-E002', `HTML cru não é permitido: ${n.value.slice(0, 40)}`, n)
    if (n.type === 'containerDirective' || n.type === 'leafDirective') {
      const spec = DIRECTIVES[n.type][n.name]
      if (!spec) {
        add('DOK-E003', `diretiva desconhecida: ${n.type === 'leafDirective' ? '::' : ':::'}${n.name}`, n)
        return
      }
      for (const [k, v] of Object.entries(n.attributes ?? {})) {
        if (!spec.attrs.includes(k)) add('DOK-E004', `atributo não permitido em ${n.name}: ${k}`, n)
        else if (!ATTR_RULES[k](v ?? '')) add('DOK-E004', `valor inválido em ${n.name}.${k}: "${v}"`, n)
      }
      const hasLabel = n.children?.[0]?.data?.directiveLabel === true
      if (spec.labelRequired && !hasLabel) add('DOK-E004', `${n.name} exige rótulo [..]`, n)
      if (n.name === 'diagram') {
        for (const req of ['src', 'view', 'title'])
          if (!n.attributes?.[req]) add('DOK-E004', `diagram exige o atributo ${req}`, n)
        if (!hasLabel) add('DOK-W103', 'diagram sem descrição textual [..]; o fallback usará o title', n)
      }
      if (n.name === 'tab' && !(parent?.type === 'containerDirective' && parent.name === 'tabs'))
        add('DOK-E008', ':::tab fora de ::::tabs', n)
      if (n.name === 'tabs') {
        const body = n.children.filter((c) => !c.data?.directiveLabel)
        if (!body.length || body.some((c) => !(c.type === 'containerDirective' && c.name === 'tab')))
          add('DOK-E008', '::::tabs deve conter apenas :::tab (ao menos um)', n)
      }
      if (n.name === 'steps') {
        const body = n.children.filter((c) => !c.data?.directiveLabel)
        if (body.length !== 1 || body[0].type !== 'list' || !body[0].ordered)
          add('DOK-E008', ':::steps deve conter exatamente uma lista ordenada', n)
      }
    }
    if (n.type === 'link' || n.type === 'image') {
      const c = classifyUrl(n.url, { image: n.type === 'image' })
      if (c.kind === 'forbidden') add('DOK-E005', `esquema de URL proibido: ${n.url.slice(0, 30)}`, n)
      if (c.kind === 'relative' || c.kind === 'invalid')
        add('DOK-E006', `URL não permitida (use dok: ou https): ${n.url.slice(0, 40)}`, n)
      if (c.kind === 'unresolved') add('DOK-W101', `link não resolvido: ${c.title}`, n)
      if (n.type === 'image' && c.kind === 'external') add('DOK-W102', 'imagem externa', n)
    }
    if (n.type === 'linkReference' || n.type === 'imageReference' || n.type === 'definition')
      add('DOK-E010', 'referência não normalizada (o save converte para link inline)', n)
  })
  return diags
}
