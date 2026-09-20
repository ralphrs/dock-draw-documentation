# DEC-0008 — O ADR 006 fica vago, e o prompt antigo dele é descartado

- **Data:** 2026-09-19
- **Decidido por:** arquiteto, por delegação explícita do humano
- **Alcance:** numeração dos ADRs
- **Aplicação no ledger:** pendente, vai junto com a Emenda 1 ao ADR 002

## Decisão

O número 006 fica **vago**, sem camada atribuída. O Developer Portal mantém o 014 de `DEC-0006`.

O `prompts/PROMPT-ADR-006.md` é descartado.

## Contexto

`insumos/ORDEM.md` e o handoff descrevem o 006 como "camada que o usuário está produzindo", reservada para algo em andamento. O humano foi perguntado três vezes, em momentos diferentes, e não nomeou a camada. Na terceira, delegou a decisão ao arquiteto.

O roteiro de ADRs cobre hoje: motor de diagrama (001), formato de conteúdo (002), armazenamento (003), fluxo editorial (004), edição (005), renderização (007), navegação (008), busca (009), exportação e sincronização (010), publicação (011), consolidação (012), tenancy e acesso (013, `DEC-0005`) e Developer Portal (014, `DEC-0006`). Nenhuma camada conhecida ficou sem número.

## Alternativas descartadas

**Renumerar o Developer Portal de 014 para 006.** Fecharia o vão, e custaria edições no ledger, em `insumos/ORDEM.md`, no `DEC-0006` e em toda referência cruzada, em troca de estética de sequência. A ordem de execução vive no roteiro de `guia-sessoes/PROMPT-SESSAO-A.md` e em `insumos/ORDEM.md`, não na contiguidade dos números, então o vão não confunde ninguém que leia a fonte certa.

**Atribuir uma camada nova ao 006**, escolhida pelo arquiteto para preencher o espaço. Descartada por inverter a ordem certa das coisas: ADR nasce de necessidade, não de número disponível. Criar trabalho de camada a partir de um espaço em branco é o oposto do que o processo existe para fazer.

## Custo aceito

A tabela "Numeração oficial" do ledger passa a ter uma linha sem camada, e quem ler só a tabela vai se perguntar o que aconteceu. A nota que acompanha a linha responde isso, e é o preço de preservar o espaço em vez de inventar conteúdo para ele.

Se o humano lembrar qual era a camada, o espaço continua lá, e ocupá-lo não custa nada.

## A dívida que o 006 carregava

O `prompts/PROMPT-ADR-006.md` é uma cópia antiga do prompt de Renderização, fato já registrado no conflito C-6 do ledger, que manda descartá-lo. Enquanto o arquivo existir, uma sessão pode abri-lo achando que é o prompt de uma camada real e escrever o ADR errado.

`prompts/` é bloqueado para escrita pelas sessões, então o descarte é ação do humano. Com ele feito, a parte "cópia antiga do prompt de Renderização" do C-6 fica resolvida, e sobra do conflito apenas a correção das referências cruzadas nos ADRs 002 e 004.

## O que entra no ledger quando a Emenda 1 for aplicada

- Linha 006 da tabela "Numeração oficial": camada `*Vago*`, com a nota de que o número está reservado e não corresponde a camada alguma.
- Linha "Tenancy e acesso": passa de **Sem número** para 013.
- Linha nova: 014, Developer Portal.
- C-6: remover a parte do `PROMPT-ADR-006.md`, mantendo as referências cruzadas de 002 e 004.

Agrupado com a Emenda 1 de propósito, para gastar uma aprovação `ledger` do humano em vez de duas.
