# Prompt — ADR 008: Navegação e descoberta (Navigation & Discovery)

[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 007.]

# Tarefa
Escreva o ADR 008 — Navegação e descoberta. Decida como o leitor se orienta: árvore de espaços e páginas, TOC, breadcrumbs, página anterior/próxima, tags, backlinks e visão em grafo.

# Perguntas que o ADR precisa responder
1. Própria ou com biblioteca (ex.: fumadocs-core headless)? Avaliar acoplamento ao modelo de dados do ADR 003.
2. Árvore: carregamento (tudo, preguiçoso por espaço), ordenação manual, arrastar para reordenar, permissões (só o que o usuário pode ver).
3. TOC a partir das âncoras do ADR 007; realce da seção ativa; acessível por teclado.
4. Backlinks e "páginas relacionadas" a partir das tabelas derivadas (ADR 002/003).
5. Visão em grafo (segundo cérebro): biblioteca candidata, licença, peso, render em SVG com tokens (coerência com o design system), respeito a prefers-reduced-motion.
6. Tags e aliases (frontmatter do ADR 002).

# Eliminatórios específicos
- N-01 Respeita RLS: nada aparece na árvore sem permissão de leitura.
- N-02 Cores por token; operável por teclado.

# Checagem para frente
- Publicação (011): a mesma navegação serve a wiki pública?
- Busca (009): onde a busca entra na UI de navegação?

# Contrato de saída esperado (mínimo)
interfaces_publicadas: componentes <SpaceTree>, <PageToc>, <Backlinks>, <GraphView> (se aprovado); consultas de árvore.
restricoes_impostas: ordenação e hierarquia vêm do armazenamento, não do frontmatter (ou o contrário — decidir e registrar).
