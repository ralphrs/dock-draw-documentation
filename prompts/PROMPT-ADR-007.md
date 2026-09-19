# Prompt — ADR 007: Renderização (Rendering)

[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 005 (e 003/004, se já aceitos); ADR-002 e ADR-005 aceitos; insumos/pesquisa-editores-wiki.md como material de pesquisa.]

# Tarefa
Escreva o ADR 007 — Renderização. Decida como a AST do ADR 002 (obtida só via `src/content-format`) vira tela na leitura: renderer mdast → React/hast, registry de componentes compartilhado com o editor do ADR 005, destaque de código, matemática, embed e preview de diagrama, política de imagem externa e temas por token. Os itens que o ADR 002 mandou para cá na tabela "Fora de escopo" são obrigatórios.

# Perguntas que o ADR precisa responder
1. Renderer: mdast/hast → React próprio · hast-util-to-jsx-runtime · react-markdown · rehype-react. SSR no TanStack Start.
2. Registry de componentes: o MESMO usado pelo editor (ADR 005)? Como um componente declara sua versão de leitura e de edição?
3. Destaque de código: Shiki · Expressive Code (usado pelo Starlight) · Prism. Tema por token, dark/light, custo em SSR e bundle.
4. Matemática (KaTeX?) e Mermaid: entram agora ou ficam como desejáveis?
5. Embed de diagrama: React Flow em modo leitura, SVG estático pré-renderizado ou os dois (SVG no SSR, interativo no cliente)? Coerência com o ADR 001.
6. Âncoras de heading estáveis (TOC, links profundos).
7. Acessibilidade e prefers-reduced-motion.

# Eliminatórios específicos
- R-01 Não avalia código; componentes só do registry.
- R-02 Cores 100% por token, igual em .theme-dark e .theme-light.
- R-03 Renderiza no servidor sem erro de hidratação.

# Checagem para frente
- Navegação (008): gera TOC e âncoras de que ela precisa?
- Publicação (011): o mesmo renderer serve a rota pública?
- Exportação (010): componentes têm representação em Markdown puro para os perfis de export (padrão "render para Markdown")?

# Contrato de saída esperado (mínimo)
interfaces_publicadas: <PageView>; interface do registry (leitura/edição/markdown); tema de código por token.
restricoes_impostas: todo componente novo implementa as três representações (leitura, edição, markdown).
premissas: navegação consome headings/âncoras gerados aqui.
