# DEC-0007 — O Lovable implementa, a sessão C revisa arquitetura

- **Data:** 2026-09-19
- **Decidido por:** humano, na conversa com a sessão A
- **Alcance:** protocolo das três sessões, papel da sessão C, trilha de desenvolvimento
- **Aplicado em:** `guia-sessoes/PROMPT-SESSAO-C.md` (reescrito), `guia-sessoes/PROTOCOLO.md`

## Decisão

O agente do Lovable passa a ser o implementador do app. A sessão C deixa de escrever código e vira especialista em arquitetura revisora. A sessão A acumula arquiteto principal, gerente de projeto e scrum master. A sessão B passa a escrever, além dos ADRs, as ordens de implementação que o Lovable executa.

O Lovable executa ordem e não decide nada. Onde a ordem deixa decisão em aberto, a falha é da ordem, não de quem a executou.

## Evidência que sustenta o desenho

Levantada pelo MCP do Lovable e conferida contra o repositório local.

**Os commits do Lovable são os commits do repositório.** Os SHAs que `list_edits` devolve existem em `dok-draw-app` e estão todos na `main`:

```
63fc1669 -> 63fc166 Publicou thumbnail na IZ
4d0c2c91 -> 4d0c2c9 Implementou T2 a T6 do projeto
git branch --contains 4d0c2c91  ->  * main
```

Consequência: a revisão do resultado usa `git diff` normal, sem depender do MCP. E não existe branch, porque nenhuma ferramenta do MCP oferece uma.

**Commitar e publicar são ações separadas.** `get_project` devolve `latest_commit_sha` e `preview_url` como campos distintos, e `deploy_project` é uma ferramenta própria. O commit atualiza o preview, a produção só muda no deploy.

É o achado que salva o desenho. A garantia que o protocolo antigo obtinha com branch mais merge aprovado volta como commit mais deploy aprovado, e num lugar melhor: C revisa um app rodando, não só um diff.

## A revisão em dois momentos

`tipo: revisar-ordem` acontece antes de qualquer código existir e responde uma pergunta: sobra decisão para quem executa? `tipo: revisar-resultado` acontece depois, contra diff, build e preview.

A primeira é a que paga. Erro apanhado ali custa uma leitura. O mesmo erro apanhado na segunda custa crédito do workspace, tempo e um revert na `main`.

## Alternativas descartadas

**O Lovable como sessão C plena, implementando tudo.** Descartada porque as primeiras sprints são `src/content-format` com 30 fixtures como gate, quinze tabelas com RLS e uma máquina de estados com transições enumeradas. É código onde "parece certo" e "está certo" divergem, e os ADRs gastaram dias fixando exatamente os detalhes que um gerador atropela.

**Manter a sessão C implementando em branch, com o Lovable só para telas.** Foi a recomendação do arquiteto antes desta decisão. O humano preferiu o Lovable como implementador único, e a revisão em dois momentos é a trava que torna isso defensável.

## Custos aceitos

- **Sem branch, desfazer é `git revert`.** O histórico do app acumula commits revertidos, e fica mais difícil de ler do que ficaria com branches descartáveis.
- **As mensagens de commit não orientam a revisão.** O histórico do app tem quatro commits seguidos chamados "Changes". Revisar contra contrato exige ler o diff inteiro, sempre.
- **A evidência de qualidade muda de dono.** O Lovable não devolve saída de build, typecheck nem teste. Produzir isso passa a ser critério de pronto das tarefas de C, rodado localmente depois do `git pull`.
- **Cada envio consome crédito do workspace**, então cada um passa pelo humano.

## Restrição que a decisão cria

Com o Lovable virando executor puro, as restrições da arquitetura base e dos contratos precisam estar onde ele as lê, e não só nos ADRs. O `get_project_knowledge` do projeto DokDraw voltou vazio nesta data: nada guiava o agente. Essa lacuna é fechada junto com esta decisão, escrevendo o knowledge do projeto e uma skill de workspace a partir do `LEDGER.md` e do `insumos/BASE.md`, já com as duas correções de `DEC-0006` (`.dark` e `prettier`).
