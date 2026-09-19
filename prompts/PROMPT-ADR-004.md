# Prompt — ADR 004: Fluxo editorial (Editorial Workflow)

> [!NOTE]
> Prompt já executado. O ADR está em `adrs/`. Mantido só como histórico.

[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 e 003.]

# Tarefa
Escreva o ADR 004 — Fluxo editorial. Decida como uma edição vai de rascunho a publicada, quem pode fazer cada transição e o que o revisor vê. A implementação completa pode vir depois; o ADR precisa fixar agora o que afeta as outras camadas.

# Perguntas que o ADR precisa responder
1. Máquina de estados: rascunho → em revisão → aprovada → publicada; rejeitada → rascunho; outras? Publicação direta para quem tem permissão?
2. Papéis por espaço: leitor, autor, revisor, publicador, admin. Como mapeiam para RLS (ADR 003)?
3. Política por espaço: aprovação obrigatória ou opcional; número mínimo de aprovadores; autoaprovação proibida?
4. Revisão: diff em texto (Markdown), diff renderizado (lado a lado) ou os dois? Comentários ancorados em trecho? Sugestões de edição inline (suggestion mode)?
5. Diagramas: como revisar mudança de diagrama referenciado (versão do diagrama presa à revisão da página ou sempre a atual)?
6. Notificações (no app, e-mail) e trilha de auditoria.
7. Alternativas a comparar: máquina de estados própria em Postgres; biblioteca de state machine (ex.: XState) no servidor; GitHub PR (kit docs-as-code); serviços de comentários/colaboração terceirizados (avaliar licença e lock-in).

# Eliminatórios específicos
- W-01 Estados e transições validados no servidor (server functions + RLS), nunca só na UI.
- W-02 Não exige que o cliente final tenha conta em serviço de terceiros (ex.: GitHub).
- W-03 Auditoria imutável de quem fez cada transição.

# Checagem para frente
- Edição (ADR 005): que capacidades o editor PRECISA ter por causa deste fluxo (visualização de diff contra a versão publicada, modo sugestão, comentários ancorados, modo somente leitura)? Esta lista vira eliminatório ou importante no ADR 005.
- Busca (ADR 009) e Publicação (ADR 011): o que é visível em cada estado.
- Exportação (ADR 010): exporta só publicadas? Rascunho pode ser exportado pelo autor?

# Contrato de saída esperado (mínimo)
interfaces_publicadas: enum de estados; tabela de transições com papel exigido; eventos emitidos (para notificações e sync).
restricoes_impostas: só revisões publicadas aparecem para leitores, na busca pública, na publicação e no sync (salvo decisão diferente registrada).
premissas: o editor oferece visualização de diff; o armazenamento guarda comentários ancorados por revisão.
