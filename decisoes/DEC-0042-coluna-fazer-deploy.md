# DEC-0042: coluna FAZER DEPLOY para o que o humano executa contra o ambiente

**Data:** 2026-09-22
**Quem decidiu:** Humano, na conversa com a sessão A: "Criei uma coluna fazer deploy para eu ver o que já está subindo antes de concluir".
**Registrado por:** Sessão A

## Decisão

O quadro `DDP` ganha o status `FAZER DEPLOY` (id 10023, transição 10). Ele reúne tudo que o humano executa contra o ambiente antes de fechar o card: publicar em produção (`deploy_project`) e colar migração no Lovable. O humano olha essa coluna para saber o que está subindo.

Regras:

- Card de categoria `app-release` vai para `FAZER DEPLOY` quando o código já está no preview, revisado pela sessão C e aceito pela sessão A. Leva o rótulo `humano`, a seção "Conferência da sessão A" e a seção "A pergunta".
- `AGUARDANDO APROVAÇÃO` fica para aprovação sem deploy: despachar ordem ao Lovable, crédito, dependência nova, política RLS antes da ordem, decisão de arquitetura.
- Só a sessão A move card para `FAZER DEPLOY`. Só o humano tira de lá: arrasta para `CONCLUÍDA` depois de publicar ou aplicar, ou para `EM ANDAMENTO` com comentário quando achar problema.
- As sessões B, C e D nunca tocam num card em `FAZER DEPLOY`.
- Na ordem de trabalho da `DEC-0038`, `FAZER DEPLOY` fica entre `EM REVISÃO` e `AGUARDANDO APROVAÇÃO` para a sessão A, que só age ali quando o humano devolve o card com comentário.

## Alternativa descartada

Manter o card de publicação em `AGUARDANDO APROVAÇÃO` junto com as outras aprovações. Descartada porque o humano quer ver de relance o que está prestes a subir, separado do que só pede um sim.

## Custo aceito

Uma coluna a mais no quadro, um status a mais na escuta e na conferência, e o protocolo com uma regra de posse a mais.
