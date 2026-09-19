# Prompt — ADR 003: Armazenamento e versionamento (Content Store & Versioning)

> [!NOTE]
> Prompt já executado. O ADR está em `adrs/`. Mantido só como histórico.

[Colar o Bloco 0. Anexar: LEDGER.md com o contrato do ADR 002; o schema atual do Supabase do app Lovable (arquivo de types ou migrations) — se não estiver disponível, peça antes de propor tabelas.]

# Tarefa
Escreva o ADR 003 — Armazenamento e versionamento. Decida onde páginas, revisões, espaços e assets moram, e como o histórico é mantido. O modelo precisa suportar, SEM MIGRAÇÃO FUTURA, o fluxo de aprovação (ADR 004) e não pode impedir colaboração em tempo real mais adiante.

# Perguntas que o ADR precisa responder
1. Modelo de revisões: append-only (page_revisions imutáveis + ponteiro para a publicada)? Event sourcing? Snapshot + deltas?
2. O que se guarda: o texto no dialeto do ADR 002 (recomendação inicial) ou a AST em JSONB? Justificar pela portabilidade, diff, busca e tamanho.
3. Rascunhos: um rascunho por autor por página? Branches nomeados? Como conciliar dois rascunhos concorrentes?
4. Espaços, hierarquia de páginas (árvore), ordenação, slugs, renomear sem quebrar links (ids estáveis do ADR 002).
5. Tabelas derivadas: links/backlinks, índice de busca, estado de sync — o que é derivado no save e o que é calculado sob demanda.
6. Assets: Supabase Storage (buckets, privados, URLs assinadas), limites de tamanho por plano, relação asset ↔ revisão.
7. Relação página ↔ diagrama (modelo do ADR 001): referência por id, integridade ao excluir.
8. Multi-inquilino: isolamento por workspace, RLS por espaço e por papel, soft delete, lixeira, retenção.
9. Concorrência: bloqueio otimista (versão), conflito de save.
10. Alternativas completas a comparar: Postgres puro; Git como store (kit docs-as-code); híbrido Postgres + espelho Git; armazenamento de documento CRDT (Yjs) com snapshot em Markdown.

# Eliminatórios específicos
- A-01 Suporta os estados do fluxo editorial sem mudar o schema das revisões.
- A-02 Toda revisão publicada é reconstituível byte a byte (auditoria e export).
- A-03 RLS aplicável em todas as tabelas de conteúdo.
- A-04 Funciona no Supabase gerenciado, sem extensão que o plano não ofereça.

# Checagem para frente
- Fluxo editorial (ADR 004): estados, papéis e comentários ancorados cabem no modelo?
- Busca (ADR 009): há onde indexar só revisões publicadas e, para o autor, os próprios rascunhos?
- Export e sync (ADR 010): há onde guardar o estado de sincronização (id do arquivo remoto, hash, data)?
- Colaboração futura: o modelo impede Yjs depois? Se sim, documentar o custo.

# Entregáveis extras
- DDL proposto (tabelas, índices, políticas RLS) em SQL legível, marcado como proposta.
- Diagrama de entidades (Mermaid).
- Assinaturas das server functions de leitura e escrita (tipos TS).

# Contrato de saída esperado (mínimo)
interfaces_publicadas: tabelas e invariantes; tipos TS de Page, Revision e Space; server functions de CRUD de revisão.
restricoes_impostas: toda escrita de conteúdo cria revisão; nada lê rascunho alheio fora do fluxo; assets só por id.
premissas: o fluxo editorial define as transições; a busca indexa a partir das revisões.
