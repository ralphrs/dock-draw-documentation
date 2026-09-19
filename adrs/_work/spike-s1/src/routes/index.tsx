// Landing: não pode carregar código de editor (teste 7).
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <main className="p-6">
      <h1 className="text-xl">Spike S-1</h1>
      <ul>
        <li><Link to="/edit/mdxeditor">MDXEditor</Link></li>
        <li><Link to="/edit/plate">Plate</Link></li>
        <li><Link to="/read">Leitura</Link></li>
      </ul>
    </main>
  ),
})
