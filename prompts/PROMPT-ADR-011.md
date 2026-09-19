# Prompt — ADR 011: Publicação (Publishing)

[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 010.]

# Tarefa
Escreva o ADR 011 — Publicação. Decida como uma wiki (ou um espaço) vira site público: rotas, SEO, domínio próprio, cache e busca pública.

# Perguntas que o ADR precisa responder
1. Estratégia: rotas públicas no próprio app TanStack Start (SSR/prerender, reaproveitando os ADRs 007 e 008) · build estático gerado pelo perfil Starlight do ADR 010 e hospedado · fumadocs-core headless · combinação.
2. Só revisões publicadas (ADR 004). Invalidação de cache ao publicar.
3. SEO: metadados do frontmatter, sitemap, Open Graph, canonical.
4. Domínio próprio por workspace, HTTPS, multi-inquilino.
5. Busca pública (ADR 009) e analytics (respeitando privacidade).
6. Visibilidade: espaço inteiro público, páginas selecionadas, link secreto?
7. Tema do site público: tokens do DokDraw; design system trocável por cliente.

# Eliminatórios específicos
- U-01 Nada não publicado vaza para a rota pública, cache ou sitemap.
- U-02 Reaproveita renderer e navegação decididos; não cria um segundo pipeline.

# Contrato de saída esperado (mínimo)
interfaces_publicadas: rotas públicas; política de cache; configuração de publicação por espaço.
