# DEC-0041: texto de tela nunca cita tarefa, ADR, ordem ou sessão

**Data:** 2026-09-22
**Quem decidiu:** Humano, no comentário da `DDP-517`: "nunca marcar informações de tarefas nas telas em prd".
**Registrado por:** Sessão A

## Decisão

Nenhum texto que a pessoa vê no app (rótulo, selo, aviso, placeholder, título, toast, mensagem de erro, tooltip) cita número de tarefa, ADR, DEC, ordem, sessão, Lovable ou qualquer outro artefato interno do projeto. O texto de tela fala do produto, na voz do produto. Um recurso que ainda não existe recebe um aviso na linguagem da pessoa, como "Convites por projeto em breve", nunca "chega com o ADR 013".

A regra vale para preview e produção, porque o preview vira produção por um clique.

## Onde a regra entra

- Toda ordem ao Lovable: a seção "O que não fazer" ganha a linha fixa "Nenhum texto de tela cita tarefa, ADR, ordem ou sessão". A sessão A escreve, a sessão C confere como item da revisão da ordem e da revisão da execução.
- `guia-sessoes/PROTOCOLO.md`, seção "Desenvolvimento no app".
- Card `app-release`: a conferência da sessão A inclui uma varredura por `ADR`, `DDP-`, `DEC-`, `Lovable` e `sessão` nos textos de tela do commit antes de perguntar ao humano se publica.

## O defeito que originou

A ordem `DDP-439` (página de configuração do projeto), item 10, mandou escrever o selo "Convites por projeto chegam com o ADR 013" na tela Membros. A sessão A escreveu, a sessão C aprovou o código contra a ordem e o selo chegou ao preview. O erro está na ordem, não na execução. Correção pela ordem `DDP-442b`.

## Alternativa descartada

Deixar a referência interna nas telas enquanto o produto é usado só pelo humano. Descartada porque o preview vira produção sem passar por outra revisão de texto, e porque o hábito de escrever para a pessoa precisa valer desde a primeira tela.

## Custo aceito

Um item a mais em toda revisão de ordem e de execução, e uma varredura por script antes de cada publicação.
