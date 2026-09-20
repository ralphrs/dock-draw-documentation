# Modelos de comentário

Todo comentário começa identificando a sessão, porque o conector do Atlassian é o mesmo para as três (`decisoes/DEC-0009-comunicacao-por-jira.md`).

## Dúvida (B ou C), com transição `2` para BLOQUEADA

```md
Sessão B: dúvida

**Pergunta.** Uma frase.
**Contexto.** O que foi feito, o que foi encontrado, caminho do arquivo com a evidência.
**Opções.** 1. Nome curto, o que implica, custo, o que muda em contrato. 2. ...
**Recomendação.** Opção e motivo em até três linhas. "Sem recomendação" é válido.
**Categoria de aprovação.** nenhuma | ledger | aceite-adr | dependencias | reabertura | fora-de-work | commit | app-release
```

## Resposta (A), com transição `31` de volta para EM ANDAMENTO

```md
Sessão A: resposta

**Decisão.** A opção escolhida, na primeira linha.
**Instrução.** O que fazer, com as travas. Executável sem contexto adicional.
**Por quê.** Curto, só o que muda a decisão.
**Registrar.** O que entra no ADR, no escopo ou nas pendências por causa desta resposta.
**aprovado_por.** arquiteto | humano
```

## Resultado (B ou C), com transição `4` para EM REVISÃO

```md
Sessão B: resultado

**Entregáveis.** Caminhos dos arquivos produzidos.
**Critério de pronto.** Cada item com ✔ ou ✘ e a evidência real (comando e saída, teste, contagem).
**Decisões tomadas.** Cada uma com alternativa descartada e custo aceito.
**Pendências.** O que ficou aberto e onde está registrado.
```

## Revisão (A), com transição `41` para CONCLUÍDA

```md
Sessão A: revisão

**Veredito.** aceita | aceita com ressalva | refazer
**Motivo.** ...
**Tarefas derivadas.** DDP-NN, se houver
```

## Escalada ao humano (A)

Rótulos `aprovacao-humana` e a categoria, responsável passa a ser o humano, transição `3` para AGUARDANDO APROVAÇÃO. O comentário traz o que se pede, o estado, a recomendação da arquitetura e como responder. Depois do sim, A comenta a resposta com `aprovado_por: humano`, devolve o responsável e transiciona com `31`.
