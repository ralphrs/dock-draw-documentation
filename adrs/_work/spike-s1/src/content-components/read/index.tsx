// src/content-components/read — STUB DESCARTÁVEL do spike (D-4). O renderer real é do ADR 007.
// Premissa passada ao 007: todo bloco emite a faixa de linhas de origem (position do mdast)
// em data-line-start / data-line-end. É isso que o <RevisionView> usa para ancorar comentários (E-12).
import type { Nodes, Root, RootContent } from 'mdast'
import { Fragment, type ReactNode } from 'react'

const lines = (n: Nodes) =>
  n.position ? { 'data-line-start': n.position.start.line, 'data-line-end': n.position.end.line } : {}

function children(n: { children?: Nodes[] }, keyPrefix: string): ReactNode {
  return (n.children ?? []).map((c, i) => <Fragment key={`${keyPrefix}-${i}`}>{render(c, `${keyPrefix}-${i}`)}</Fragment>)
}

export function render(n: Nodes, k = 'r'): ReactNode {
  switch (n.type) {
    case 'root':
      return <>{children(n, k)}</>
    case 'yaml':
      return null
    case 'paragraph':
      return n.data && (n.data as { directiveLabel?: boolean }).directiveLabel ? null : <p {...lines(n)}>{children(n, k)}</p>
    case 'heading': {
      const H = `h${n.depth}` as 'h1'
      return <H {...lines(n)}>{children(n, k)}</H>
    }
    case 'thematicBreak':
      return <hr {...lines(n)} />
    case 'blockquote':
      return <blockquote {...lines(n)}>{children(n, k)}</blockquote>
    case 'list': {
      const L = n.ordered ? 'ol' : 'ul'
      return <L {...lines(n)} start={n.start ?? undefined}>{children(n, k)}</L>
    }
    case 'listItem':
      return (
        <li {...lines(n)}>
          {typeof n.checked === 'boolean' ? <input type="checkbox" checked={n.checked} readOnly disabled /> : null}
          {children(n, k)}
        </li>
      )
    case 'code':
      return <pre {...lines(n)}><code>{n.value}</code></pre>
    case 'table':
      return <table {...lines(n)}><tbody>{children(n, k)}</tbody></table>
    case 'tableRow':
      return <tr {...lines(n)}>{children(n, k)}</tr>
    case 'tableCell':
      return <td>{children(n, k)}</td>
    case 'footnoteDefinition':
      return <div {...lines(n)} id={`fn-${n.identifier}`}>[{n.label ?? n.identifier}] {children(n, k)}</div>
    case 'footnoteReference':
      return <sup><a href={`#fn-${n.identifier}`}>{n.label ?? n.identifier}</a></sup>
    case 'text':
      return n.value
    case 'emphasis':
      return <em>{children(n, k)}</em>
    case 'strong':
      return <strong>{children(n, k)}</strong>
    case 'delete':
      return <del>{children(n, k)}</del>
    case 'inlineCode':
      return <code>{n.value}</code>
    case 'break':
      return <br />
    case 'link':
      return <a href={n.url} data-dok-uri={n.url.startsWith('dok:') ? n.url : undefined}>{children(n, k)}</a>
    case 'image':
      return <img alt={n.alt ?? ''} data-dok-uri={n.url} />
    case 'containerDirective': {
      const label = n.children[0]?.data && (n.children[0].data as { directiveLabel?: boolean }).directiveLabel ? n.children[0] : null
      return (
        <section {...lines(n)} data-directive={n.name} data-attrs={JSON.stringify(n.attributes ?? {})}>
          {label ? <strong>{children(label as { children: Nodes[] }, `${k}-l`)}</strong> : null}
          {children(n, k)}
        </section>
      )
    }
    case 'leafDirective':
      return (
        <figure {...lines(n)} data-directive={n.name} data-attrs={JSON.stringify(n.attributes ?? {})}>
          [{n.name}] {children(n, k)}
        </figure>
      )
    default:
      return <span data-unhandled={n.type} />
  }
}

export function DokView({ tree }: { tree: Root }) {
  return <article className="dok-view">{render(tree)}</article>
}

export type TopBlock = { node: RootContent; startLine: number; endLine: number }
export const topBlocks = (tree: Root): TopBlock[] =>
  tree.children
    .filter((c) => c.type !== 'yaml' && c.position)
    .map((c) => ({ node: c, startLine: c.position!.start.line, endLine: c.position!.end.line }))
