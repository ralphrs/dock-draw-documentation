# Prompt — ADR 009: Busca (Search)

[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 006 (e 008, se já aceito).]

# Tarefa
Escreva o ADR 009 — Busca. Decida como o usuário encontra conteúdo, respeitando permissões e o estado editorial.

# Perguntas que o ADR precisa responder
1. Motor: Postgres full-text (configuração portuguese, unaccent, pg_trgm) · busca híbrida com pgvector · Orama no cliente · Meilisearch/Typesense auto-hospedados · serviço gerenciado.
2. Permissões: a busca respeita RLS e o estado editorial (leitores só veem publicadas; autores veem os próprios rascunhos)? Como, em cada motor?
3. O que é indexado: título, texto extraído por `extractText` (ADR 002), headings, tags, aliases, nomes de elementos de diagrama?
4. Idioma: pt-BR primeiro; multi-idioma depois.
5. Atualização do índice: no save (trigger), em fila, por job?
6. Busca semântica: agora ou depois? Custo de embeddings e onde rodam.
7. UI: paleta de comandos (cmdk já está na stack?) — conferir e reaproveitar.

# Eliminatórios específicos
- B-01 Nunca retorna conteúdo que o usuário não pode ler.
- B-02 Roda na infraestrutura do Supabase ou num serviço com licença e custo aceitáveis; sem copyleft embutido.

# Contrato de saída esperado (mínimo)
interfaces_publicadas: server function de busca (tipos); tabela/índice; gatilho de reindexação.
restricoes_impostas: toda mudança de estado editorial reindexa.
