# DEC-0005 — Tenancy e acesso recebe o número 013

- **Data:** 2026-09-19
- **Decidido por:** humano, na conversa com a sessão A
- **Alcance:** numeração dos ADRs
- **Efeito:** o conflito C-3 do `LEDGER.md` ganha dono nomeado

## Decisão

O ADR de Tenancy e acesso (membros de workspace, convites, papéis) é o **ADR 013**.

## Contexto

Os ADRs 003 e 004 pressupõem um ADR de tenancy que nunca teve número. O `LEDGER.md` registra a lacuna como conflito C-3: `public.invites` não tem `workspace_id`, e só o owner entra em `content.workspace_members` automaticamente, então não há caminho para um segundo usuário entrar num workspace. O conflito C-7 depende do mesmo ADR, porque `public.user_roles` (global) convive com `content.space_members.role` (por espaço) sem regra de precedência.

Os números 001 a 012 estão todos alocados na tabela "Numeração oficial", incluindo o 006, cuja camada continua a definir. Número não se reaproveita, então o primeiro livre é o 013.

## Alternativa descartada

Dar o 006 a Tenancy, o que fecharia a lacuna do 006 e a do tenancy de uma vez. Descartada porque o roteiro da sessão A trata as duas como passos separados, e `insumos/ORDEM.md` descreve o 006 como camada em produção, reservada para algo já em andamento. Ocupar essa reserva é decisão do humano, e ele manteve as duas perguntas separadas.

## Custo aceito

O número 013 fica fora da ordem de dependência: o ADR 013 precisa estar aceito antes do ADR 009 (Busca), então a leitura da tabela de numeração deixa de sugerir a ordem de execução. A ordem real continua em `insumos/ORDEM.md` e no roteiro de `guia-sessoes/PROMPT-SESSAO-A.md`.

## O que muda quando o ADR 013 for escrito

Os conflitos C-3 e C-7 saem da tabela "Conflitos em aberto" do `LEDGER.md`. A linha "Tenancy e acesso" da tabela "Numeração oficial", hoje marcada **Sem número**, passa a 013. Ambas as edições são categoria `ledger`.
